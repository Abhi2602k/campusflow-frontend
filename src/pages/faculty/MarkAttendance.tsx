import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Clock, Users, CheckCircle2, AlertCircle, Edit2, PlusCircle } from 'lucide-react';

export default function MarkAttendance() {
  const { user } = useAuth();
  const isPL = user?.role === 'PROGRAM_LEADER';
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [mode, setMode] = useState<'new'|'edit'>('new');
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');

  const [classId, setClassId] = useState('');
  const [year, setYear] = useState('');
  const [branchId, setBranchId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT'|'ABSENT'>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Time slots in 30-min intervals
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 8; h <= 18; h++) {
      const hh = h.toString().padStart(2, '0');
      slots.push(`${hh}:00`);
      if (h < 18) slots.push(`${hh}:30`);
    }
    return slots;
  }, []);

  const formatAMPM = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12.toString().padStart(2, '0')}:${m === 0 ? '00' : '30'} ${ampm}`;
  };

  const startTimeOptions = timeSlots.map(t => ({ value: t, label: formatAMPM(t) }));
  
  const endTimeOptions = useMemo(() => {
    if (!startTime) return [];
    return timeSlots
      .filter(t => t > startTime)
      .map(t => ({ value: t, label: formatAMPM(t) }));
  }, [startTime, timeSlots]);

  const handleStartTimeChange = (val: string) => {
    setStartTime(val);
    if (endTime && endTime <= val) {
      setEndTime('');
    }
  };


  useEffect(() => {
    api.get('/attendance/my-assignments').then(res => setAssignments(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (sectionId) {
      setLoading(true);
      api.get(`/attendance/students/${sectionId}`)
        .then(res => {
          setStudents(res.data);
          const initial: any = {};
          res.data.forEach((s: any) => initial[s.id] = 'PRESENT');
          setAttendance(initial);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setStudents([]);
    }
  }, [sectionId]);

  // Fetch past sessions if in edit mode
  useEffect(() => {
    if (mode === 'edit' && sectionId && subjectId && date) {
      api.get(`/attendance/sessions/date?section_id=${sectionId}&subject_id=${subjectId}&date=${date}`)
        .then(res => {
          setPastSessions(res.data);
          if (res.data.length > 0) {
             setSelectedSessionId(res.data[0].id);
          } else {
             setSelectedSessionId('');
          }
        })
        .catch(console.error);
    } else {
      setPastSessions([]);
      setSelectedSessionId('');
    }
  }, [mode, sectionId, subjectId, date]);

  // Populate data when a past session is selected
  useEffect(() => {
    if (mode === 'edit' && selectedSessionId) {
      const session = pastSessions.find(s => s.id === selectedSessionId);
      if (session) {
        setStartTime(session.start_time);
        setEndTime(session.end_time);
        const loadedAtt: any = {};
        session.records.forEach((r: any) => loadedAtt[r.student_id] = r.status);
        
        // Merge with enrolled students in case new students were added
        students.forEach(s => {
          if (!loadedAtt[s.id]) loadedAtt[s.id] = 'ABSENT'; 
        });
        setAttendance(loadedAtt);
      }
    } else if (mode === 'new') {
        const initial: any = {};
        students.forEach((s: any) => initial[s.id] = 'PRESENT');
        setAttendance(initial);
    }
  }, [selectedSessionId, mode, pastSessions, students]);

  // Derived filter options
  const classes = useMemo(() => Array.from(new Set(assignments.map(a => a.class_id))).map(id => ({ value: id, label: assignments.find(a => a.class_id === id)?.class_name || id })), [assignments]);
  const years = useMemo(() => Array.from(new Set(assignments.filter(a => a.class_id === classId).map(a => a.year))).map(y => ({ value: y, label: y })), [assignments, classId]);
  const branches = useMemo(() => Array.from(new Set(assignments.filter(a => a.class_id === classId && a.year === year).map(a => a.branch_id))).map(id => ({ value: id, label: assignments.find(a => a.branch_id === id)?.branch_name || id })), [assignments, classId, year]);
  const sections = useMemo(() => Array.from(new Set(assignments.filter(a => a.class_id === classId && a.year === year && a.branch_id === branchId).map(a => a.section_id))).map(id => ({ value: id, label: assignments.find(a => a.section_id === id)?.section_name || id })), [assignments, classId, year, branchId]);
  const subjects = useMemo(() => Array.from(new Set(assignments.filter(a => a.class_id === classId && a.year === year && a.branch_id === branchId && a.section_id === sectionId).map(a => a.subject_id))).map(id => ({ value: id, label: assignments.find(a => a.subject_id === id)?.subject_name || id })), [assignments, classId, year, branchId, sectionId]);

  const lectureCount = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff <= 0) return 0;
    return diff > 60 ? 2 : 1;
  }, [startTime, endTime]);

  const handleSubmit = async () => {
    if (!sectionId || !subjectId || !date || !startTime || !endTime) {
      setMessage({ text: 'Please fill all required fields.', type: 'error' });
      return;
    }
    if (mode === 'edit' && !selectedSessionId) {
      setMessage({ text: 'Please select a past session to edit.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      const records = Object.keys(attendance).map(student_id => ({ student_id, status: attendance[student_id] }));
      const payload = {
        section_id: sectionId,
        subject_id: subjectId,
        date,
        start_time: startTime,
        end_time: endTime,
        records
      };

      if (mode === 'new') {
        await api.post('/attendance/sessions', payload);
        setMessage({ text: 'Attendance recorded successfully!', type: 'success' });
      } else {
        await api.put(`/attendance/sessions/${selectedSessionId}`, payload);
        setMessage({ text: 'Attendance updated successfully!', type: 'success' });
      }
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err: any) {
      setMessage({ text: err.response?.data?.detail || 'Failed to submit attendance.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            {isPL ? 'Attendance Management' : 'Mark Attendance'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isPL ? <span className="font-semibold text-blue-600">Program Leader Scope Active: Full access to all subjects in your section.</span> : 'Record new sessions or edit past attendance.'}
          </p>
        </div>
        <div className="flex p-1 bg-muted rounded-lg border border-border w-fit">
           <button 
             onClick={() => setMode('new')} 
             className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'new' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
           >
             <PlusCircle size={16}/> New Session
           </button>
           <button 
             onClick={() => setMode('edit')} 
             className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'edit' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
           >
             <Edit2 size={16}/> Edit Past
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Session Scope</CardTitle>
            <CardDescription>Follow the workflow to load students.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select label="1. Class" value={classId} onChange={e => setClassId(e.target.value)} options={classes} />
            {classId && <Select label="2. Academic Year" value={year} onChange={e => setYear(e.target.value)} options={years} />}
            {year && <Select label="3. Branch" value={branchId} onChange={e => setBranchId(e.target.value)} options={branches} />}
            {branchId && <Select label="4. Section" value={sectionId} onChange={e => setSectionId(e.target.value)} options={sections} />}
            {sectionId && <Select label="5. Subject" value={subjectId} onChange={e => setSubjectId(e.target.value)} options={subjects} />}
            
            <div className="pt-4 border-t border-border mt-4">
               <Input label="6. Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
               
               {mode === 'edit' && subjectId && date && (
                 <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border space-y-3">
                   <p className="text-sm font-semibold">Select Session to Edit:</p>
                   {pastSessions.length === 0 ? (
                     <p className="text-xs text-muted-foreground">No sessions found for this date.</p>
                   ) : (
                     <Select 
                       options={pastSessions.map(s => ({label: `${s.start_time} to ${s.end_time}`, value: s.id}))}
                       value={selectedSessionId}
                       onChange={e => setSelectedSessionId(e.target.value)}
                     />
                   )}
                 </div>
               )}

               {mode === 'new' && (
                 <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col gap-1.5">
                      <Select label="7. Time From" value={startTime} onChange={e => handleStartTimeChange(e.target.value)} placeholder='Select start time (e.g., 08:00 AM)' options={startTimeOptions} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Select label="8. Time To" value={endTime} onChange={e => setEndTime(e.target.value)} placeholder='Select end time' options={endTimeOptions} disabled={!startTime} />
                    </div>
                 </div>
               )}
            </div>

            <div className="p-4 bg-muted rounded-lg mt-6 flex items-center justify-between border border-border">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                   <Clock className="text-primary" size={20} />
                </div>
                <div>
                   <p className="text-sm font-semibold text-foreground">Lecture Count</p>
                   <p className="text-xs text-muted-foreground">Calculated dynamically</p>
                </div>
              </div>
              <div className="text-xl font-bold text-primary">
                 {lectureCount} {lectureCount === 1 ? 'Lecture' : 'Lectures'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
               <CardTitle>Attendance Sheet</CardTitle>
               <CardDescription>Mark individual student statuses.</CardDescription>
            </div>
            {students.length > 0 && (
               <Badge variant="secondary" className="px-3 py-1 text-sm"><Users size={16} className="mr-2" /> {students.length} Students</Badge>
            )}
          </CardHeader>
          <CardContent>
             {!subjectId ? (
                <div className="py-24 flex flex-col items-center justify-center text-muted-foreground text-center">
                   <Calendar size={48} className="mb-4 opacity-20" />
                   <p className="text-lg font-medium">No Subject Selected</p>
                   <p className="text-sm">Complete the workflow on the left to load the student list.</p>
                </div>
             ) : (mode === 'edit' && !selectedSessionId) ? (
                <div className="py-24 flex flex-col items-center justify-center text-muted-foreground text-center">
                   <Edit2 size={48} className="mb-4 opacity-20" />
                   <p className="text-lg font-medium">Select a Past Session</p>
                   <p className="text-sm">Please select an existing session from the left sidebar to edit it.</p>
                </div>
             ) : loading ? (
                <div className="py-24 flex items-center justify-center">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
             ) : students.length === 0 ? (
                <div className="py-24 text-center text-muted-foreground">No students enrolled in this section.</div>
             ) : (
                <div className="space-y-4">
                   <div className="flex justify-between items-center bg-muted p-3 rounded-lg border border-border">
                      <span className="text-sm font-medium">Mark All:</span>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          const all: any = {};
                          students.forEach(s => all[s.id] = 'PRESENT');
                          setAttendance(all);
                        }}>All Present</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          const all: any = {};
                          students.forEach(s => all[s.id] = 'ABSENT');
                          setAttendance(all);
                        }}>All Absent</Button>
                      </div>
                   </div>

                   <div className="border border-border rounded-lg overflow-hidden">
                     <table className="w-full text-left text-sm whitespace-nowrap">
                       <thead className="bg-muted text-muted-foreground font-medium">
                         <tr>
                           <th className="px-4 py-3">Roll No</th>
                           <th className="px-4 py-3">Student Name</th>
                           <th className="px-4 py-3 text-right">Status</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-border">
                         {students.map(s => (
                           <tr key={s.id} className="hover:bg-muted/50 transition-colors">
                             <td className="px-4 py-3 font-mono text-muted-foreground">{s.roll_number}</td>
                             <td className="px-4 py-3">
                               <div className="font-medium text-foreground">{s.name}</div>
                               <div className="text-xs text-muted-foreground">{s.enrollment_no}</div>
                             </td>
                             <td className="px-4 py-3 text-right">
                               <div className="inline-flex items-center rounded-md border border-border p-1 bg-background">
                                 <button
                                   onClick={() => setAttendance({...attendance, [s.id]: 'PRESENT'})}
                                   className={`px-3 py-1 text-xs font-semibold rounded-sm transition-colors ${attendance[s.id] === 'PRESENT' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'text-muted-foreground hover:bg-muted'}`}
                                 >
                                   Present
                                 </button>
                                 <button
                                   onClick={() => setAttendance({...attendance, [s.id]: 'ABSENT'})}
                                   className={`px-3 py-1 text-xs font-semibold rounded-sm transition-colors ${attendance[s.id] === 'ABSENT' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'text-muted-foreground hover:bg-muted'}`}
                                 >
                                   Absent
                                 </button>
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                   
                   {message.text && (
                     <div className={`p-4 rounded-md flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                       {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                       <p className="text-sm font-medium">{message.text}</p>
                     </div>
                   )}

                   <div className="pt-4 border-t border-border flex justify-end">
                     <Button size="lg" onClick={handleSubmit} isLoading={submitting} disabled={lectureCount === 0 || students.length === 0}>
                        {mode === 'edit' ? 'Update Attendance' : 'Submit Attendance'}
                     </Button>
                   </div>
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
