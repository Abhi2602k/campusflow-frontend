import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Download, Search, AlertCircle, PieChart, Users } from 'lucide-react';

export default function Reports() {
  const [options, setOptions] = useState<any[]>([]);
  const [report, setReport] = useState<any[]>([]);
  
  const [classId, setClassId] = useState('');
  const [year, setYear] = useState('');
  const [branchId, setBranchId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/attendance/report/options').then(res => setOptions(res.data)).catch(console.error);
  }, []);

  // Derived filter options
  const classes = useMemo(() => Array.from(new Set(options.map(a => a.class_id))).map(id => ({ value: id, label: options.find(a => a.class_id === id)?.class_name || id })), [options]);
  const years = useMemo(() => Array.from(new Set(options.filter(a => a.class_id === classId).map(a => a.year))).map(y => ({ value: y, label: y })), [options, classId]);
  const branches = useMemo(() => Array.from(new Set(options.filter(a => a.class_id === classId && a.year === year).map(a => a.branch_id))).map(id => ({ value: id, label: options.find(a => a.branch_id === id)?.branch_name || id })), [options, classId, year]);
  const sections = useMemo(() => Array.from(new Set(options.filter(a => a.class_id === classId && a.year === year && a.branch_id === branchId).map(a => a.section_id))).map(id => ({ value: id, label: options.find(a => a.section_id === id)?.section_name || id })), [options, classId, year, branchId]);
  const subjects = useMemo(() => Array.from(new Set(options.filter(a => a.class_id === classId && a.year === year && a.branch_id === branchId && a.section_id === sectionId).map(a => a.subject_id))).map(id => ({ value: id, label: options.find(a => a.subject_id === id)?.subject_name || id })), [options, classId, year, branchId, sectionId]);

  useEffect(() => { setYear(''); setBranchId(''); setSectionId(''); setSubjectId(''); }, [classId]);
  useEffect(() => { setBranchId(''); setSectionId(''); setSubjectId(''); }, [year]);
  useEffect(() => { setSectionId(''); setSubjectId(''); }, [branchId]);
  useEffect(() => { setSubjectId(''); }, [sectionId]);

  const handleGenerate = async () => {
    if (!sectionId || !subjectId) {
       setError("Select all required fields.");
       return;
    }
    setLoading(true); setError(''); setReport([]);
    try {
      const res = await api.get(`/attendance/report/subject?section_id=${sectionId}&subject_id=${subjectId}`);
      setReport(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (report.length === 0) return;
    const headers = ['Enrollment No', 'Roll No', 'Name', 'Total Lectures', 'Present', 'Absent', 'Percentage'];
    const rows = report.map(r => [
      r.enrollment_no, r.roll_number, r.name, r.total_sessions, r.attended, (r.total_sessions - r.attended), r.percentage + '%'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${sectionId}_${subjectId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReport = report.filter(r => 
    (r.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (r.enrollment_no || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">Attendance Reports</h1>
        <p className="text-muted-foreground mt-2">Generate, view, and export subject-wise attendance analytics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Scope Card */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Report Scope</CardTitle>
            <CardDescription>Select filters to generate report.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select label="1. Class" value={classId} onChange={e => setClassId(e.target.value)} options={classes} />
            {classId && <Select label="2. Academic Year" value={year} onChange={e => setYear(e.target.value)} options={years} />}
            {year && <Select label="3. Branch" value={branchId} onChange={e => setBranchId(e.target.value)} options={branches} />}
            {branchId && <Select label="4. Section" value={sectionId} onChange={e => setSectionId(e.target.value)} options={sections} />}
            {sectionId && <Select label="5. Subject" value={subjectId} onChange={e => setSubjectId(e.target.value)} options={subjects} />}
            
            <Button className="w-full mt-6" onClick={handleGenerate} isLoading={loading} disabled={!subjectId}>
              Generate Report
            </Button>
            
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex gap-2 mt-4">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Results */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-4 gap-4">
            <div>
               <CardTitle>Analytics Report</CardTitle>
               <CardDescription>Breakdown of individual student attendance.</CardDescription>
            </div>
            {report.length > 0 && (
               <div className="flex items-center gap-3 w-full sm:w-auto">
                 <div className="relative w-full sm:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                   <input 
                     type="text" 
                     placeholder="Search students..." 
                     className="w-full pl-9 pr-4 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                   />
                 </div>
                 <Button variant="outline" onClick={handleExportCSV} className="shrink-0 gap-2"><Download size={16}/> Export CSV</Button>
               </div>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
             {report.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-center p-6">
                   <PieChart size={48} className="mb-4 opacity-20" />
                   <p className="text-lg font-medium">No Data Generated</p>
                   <p className="text-sm">Select a scope on the left and click Generate Report.</p>
                </div>
             ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-muted text-muted-foreground font-medium sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 border-b border-border">Student</th>
                      <th className="px-6 py-3 border-b border-border text-center">Total</th>
                      <th className="px-6 py-3 border-b border-border text-center">Present</th>
                      <th className="px-6 py-3 border-b border-border text-center">Absent</th>
                      <th className="px-6 py-3 border-b border-border text-center">%</th>
                      <th className="px-6 py-3 border-b border-border">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReport.map(r => (
                      <tr key={r.student_id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{r.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{r.enrollment_no} • Roll {r.roll_number}</div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium">{r.total_sessions}</td>
                        <td className="px-6 py-4 text-center font-semibold text-green-600 dark:text-green-400">{r.attended}</td>
                        <td className="px-6 py-4 text-center font-semibold text-destructive">{(r.total_sessions - r.attended)}</td>
                        <td className="px-6 py-4 text-center font-bold">{r.percentage}%</td>
                        <td className="px-6 py-4">
                          <Badge variant={r.percentage >= 75 ? 'success' : 'destructive'}>
                            {r.percentage >= 75 ? 'Good' : 'Defaulter'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {filteredReport.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No students found.</td></tr>
                    )}
                  </tbody>
                </table>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
