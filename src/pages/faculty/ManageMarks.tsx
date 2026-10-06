import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileBarChart, Plus, Save, AlertCircle, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/ui/Modal';

export default function ManageMarks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedSecSub, setSelectedSecSub] = useState('');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [marksData, setMarksData] = useState<Record<string, string>>({});
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAssName, setNewAssName] = useState('');
  const [newAssMax, setNewAssMax] = useState('');
  const [newAssDate, setNewAssDate] = useState('');

  const selectedAssignment = assignments.find(a => `${a.section_id}|${a.subject_id}` === selectedSecSub);
  const isTeacher = selectedAssignment ? selectedAssignment.faculty_id === user?.id : false;

  useEffect(() => {
    api.get('/attendance/my-assignments').then(res => setAssignments(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedSecSub) {
      setAssessments([]);
      setSelectedAssessment(null);
      return;
    }
    const [sec, sub] = selectedSecSub.split('|');
    api.get(`/marks/assessments?section_id=${sec}&subject_id=${sub}`)
      .then(res => setAssessments(res.data))
      .catch(console.error);
  }, [selectedSecSub]);

  useEffect(() => {
    if (!selectedAssessment) {
      setStudents([]);
      setMarksData({});
      return;
    }
    setLoading(true);
    api.get(`/marks/assessments/${selectedAssessment.id}/marks`)
      .then(res => {
        setStudents(res.data);
        const md: Record<string, string> = {};
        res.data.forEach((s:any) => {
          if (s.marks_obtained !== null) md[s.student_id] = s.marks_obtained.toString();
        });
        setMarksData(md);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedAssessment]);

  const handleCreateAssessment = async (e: any) => {
    e.preventDefault();
    if (!selectedSecSub) return;
    const [sec, sub] = selectedSecSub.split('|');
    try {
      const res = await api.post('/marks/assessments', {
        section_id: sec,
        subject_id: sub,
        type: newAssName,
        max_marks: parseFloat(newAssMax),
        date: newAssDate
      });
      setAssessments([res.data, ...assessments]);
      setIsModalOpen(false);
      setNewAssName('');
      setNewAssMax('');
      setSelectedAssessment(res.data);
    } catch(err) {
      console.error(err);
      alert('Failed to create assessment.');
    }
  };

  const loadAssessments = (sub: string, sec: string) => {
    api.get(`/marks/assessments?section_id=${sec}&subject_id=${sub}`)
      .then(res => setAssessments(res.data))
      .catch(console.error);
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const handleDeleteAssessment = async () => {
    if (!selectedAssessment || isDeleting) return;
    if (!window.confirm(`Are you sure you want to permanently delete '${selectedAssessment.name}' and ALL its marks?`)) return;
    try {
      setIsDeleting(true);
      await api.delete(`/marks/assessments/${selectedAssessment.id}`);
      alert('Assessment deleted successfully!');
      setSelectedAssessment(null);
      setStudents([]);
      setMarksData({});
      const [sec, sub] = selectedSecSub.split('|');
      loadAssessments(sub, sec);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
          // Already deleted, just clear it
          setSelectedAssessment(null);
          const [sec, sub] = selectedSecSub.split('|');
          loadAssessments(sub, sec);
      } else {
          alert('Failed to delete assessment.');
      }
    } finally {
      setIsDeleting(false);
    }
  };


  const handleDownloadExcel = () => {
    if (!selectedAssessment) return;
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/marks/assessments/${selectedAssessment.id}/export`;
  };

  const handleSaveMarks = async () => {
    if (!selectedAssessment) return;
    const payload = Object.keys(marksData).map(sid => ({
      student_id: sid,
      marks_obtained: marksData[sid] === '' ? null : parseFloat(marksData[sid])
    })).filter(x => x.marks_obtained !== null && !isNaN(x.marks_obtained));

    try {
      setSaving(true);
      await api.post(`/marks/assessments/${selectedAssessment.id}/marks`, { marks: payload });
      alert('Marks saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save marks.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkChange = (studentId: string, val: string) => {
    if(val !== '' && (isNaN(Number(val)) || Number(val) < 0 || Number(val) > selectedAssessment.max_marks)) return;
    setMarksData(prev => ({...prev, [studentId]: val}));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">Manage Marks</h1>
          <p className="text-muted-foreground">Upload and manage academic grades for your students.</p>
        </div>
        {selectedSecSub && (
          <Button onClick={() => setIsModalOpen(true)} disabled={!isTeacher} className="gap-2">
            <Plus size={16} /> New Assessment
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <label className="block text-sm font-medium mb-2 text-slate-700">1. Select Class & Subject</label>
            <select 
              className="w-full bg-slate-50 border border-input px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={selectedSecSub}
              onChange={e => { setSelectedSecSub(e.target.value); setSelectedAssessment(null); }}
            >
              <option value="">-- Choose Assigned Subject --</option>
              {assignments.map(a => (
                <option key={`${a.section_id}|${a.subject_id}`} value={`${a.section_id}|${a.subject_id}`}>
                  {a.class_name} {a.year} {a.branch_name} {a.section_name} - {a.subject_name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <label className="block text-sm font-medium mb-2 text-slate-700">2. Select Assessment</label>
            <select 
              className="w-full bg-slate-50 border border-input px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={selectedAssessment?.id || ''}
              onChange={e => {
                const a = assessments.find(x => x.id === e.target.value);
                setSelectedAssessment(a || null);
              }}
              disabled={!selectedSecSub || assessments.length === 0}
            >
              <option value="">{assessments.length === 0 && selectedSecSub ? '-- No Assessments Found --' : '-- Choose Assessment --'}</option>
              {assessments.map(a => (
                <option key={a.id} value={a.id}>{a.name} {a.date ? `(${a.date})` : ''} - Max {a.max_marks}</option>
              ))}
            </select>
          </CardContent>
        </Card>
      </div>

      {selectedAssessment && (
        <Card>
          <CardHeader className="bg-slate-50/50 border-b border-border py-3 px-4 flex flex-row justify-between items-center">
            <CardTitle className="text-base font-semibold">
              Entering Marks for: <span className="text-primary">{selectedAssessment.name}</span>
            </CardTitle>
            <div className="flex gap-2">
              <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors border border-green-200">
                <Download size={16} /> Download CSV
              </button>
              <button onClick={handleDeleteAssessment} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-200">
                <Trash2 size={16} /> Delete Exam
              </button>
              <Button onClick={handleSaveMarks} disabled={saving} size="sm" className="gap-2">
                <Save size={16} /> {saving ? 'Saving...' : 'Save Marks'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground">Loading roster...</div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">No students found in this section.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-muted/50 text-muted-foreground font-medium">
                    <tr>
                      <th className="px-4 py-3 border-b border-border w-16">S.No</th>
                      <th className="px-4 py-3 border-b border-border">Enrollment No</th>
                      <th className="px-4 py-3 border-b border-border">Student Name</th>
                      <th className="px-4 py-3 border-b border-border text-right w-32">Marks ({selectedAssessment.max_marks})</th>
                      <th className="px-4 py-3 border-b border-border w-12 text-center">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map((s, idx) => (
                      <tr key={s.student_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs">{s.enrollment_no}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                        <td className="px-4 py-3 text-right">
                          <input 
                            type="text"
                            value={marksData[s.student_id] || ''}
                            onChange={(e) => handleMarkChange(s.student_id, e.target.value)}
                            className="w-20 text-right bg-white border border-input px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono font-semibold"
                            placeholder="-"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => navigate(`/faculty/student/${s.student_id}/report-card`)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="View Student Report Card"
                          >
                            <FileBarChart size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Assessment" description="Define a new grading assessment for this subject.">
        <form onSubmit={handleCreateAssessment} className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Assessment Type</label>
            <select required value={newAssName} onChange={e=>setNewAssName(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 bg-background focus:ring-2 outline-none">
              <option value="">-- Select Type --</option>
              <option value="Internal Assessment">Internal Assessment</option>
              <option value="Mid-Sem">Mid-Sem</option>
              <option value="End-Sem">End-Sem</option>
              <option value="Assignment">Assignment</option>
              <option value="Quiz">Quiz</option>
              <option value="Practical">Practical</option>
              <option value="Lab">Lab</option>
              <option value="Viva">Viva</option>
              <option value="Class Test">Class Test</option>
              <option value="Project">Project</option>
              <option value="Presentation">Presentation</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" required value={newAssDate} onChange={e=>setNewAssDate(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 bg-background focus:ring-2 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Maximum Marks</label>
            <input type="number" required min="1" max="1000" value={newAssMax} onChange={e=>setNewAssMax(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 bg-background focus:ring-2 outline-none" placeholder="e.g. 50" />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
