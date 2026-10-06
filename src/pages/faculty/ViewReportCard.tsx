import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Printer } from 'lucide-react';

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ViewReportCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cutoff, setCutoff] = useState('All');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/marks/report-card/${id}`).then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(err => {
      setError('Failed to load report card. You may need to login again.');
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading your report card...</div>;
  if (error) return <div className="p-4 bg-destructive/10 text-destructive">{error}</div>;
  if (!data || data.marks.length === 0) {
    return <div className="p-12 text-center text-muted-foreground bg-white border border-border rounded-xl">No academic marks are available yet.</div>;
  }

  // 1. Sort marks chronologically by date/created_at
  const sortedMarks = [...data.marks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // 2. Identify chronological cutoff points (unique assessment names in order)
  const uniqueAssessments = Array.from(new Set(sortedMarks.map(m => m.assessment_name)));

  // 3. Filter marks up to selected cutoff
  let includedMarks = sortedMarks;
  if (cutoff !== 'All') {
    const cutoffItems = sortedMarks.filter(m => m.assessment_name === cutoff);
    if (cutoffItems.length > 0) {
      const maxDate = new Date(Math.max(...cutoffItems.map(m => new Date(m.date).getTime())));
      includedMarks = sortedMarks.filter(m => new Date(m.date).getTime() <= maxDate.getTime());
    }
  }

  // 4. Determine columns (assessments actually present in the included dataset)
  // We want columns like Internal 1, Internal 2, Mid-Sem 1 in the order they occurred.
  const activeColumns = Array.from(new Set(includedMarks.map(m => m.assessment_name)));

  // 5. Pivot data by Subject
  const subjectMap: Record<string, { name: string, assessments: Record<string, {obtained: number, max: number}>, totalObt: number, totalMax: number }> = {};
  
  let overallObtained = 0;
  let overallMax = 0;

  includedMarks.forEach(m => {
    if (!subjectMap[m.subject_name]) {
      subjectMap[m.subject_name] = { name: m.subject_name, assessments: {}, totalObt: 0, totalMax: 0 };
    }
    subjectMap[m.subject_name].assessments[m.assessment_name] = {
      obtained: m.obtained_marks,
      max: m.max_marks
    };
    subjectMap[m.subject_name].totalObt += m.obtained_marks;
    subjectMap[m.subject_name].totalMax += m.max_marks;
    
    overallObtained += m.obtained_marks;
    overallMax += m.max_marks;
  });

  const subjects = Object.values(subjectMap).sort((a, b) => a.name.localeCompare(b.name));
  const overallPercentage = overallMax > 0 ? ((overallObtained / overallMax) * 100).toFixed(2) : '0.00';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-2">
          <ArrowLeft size={16} /> Back
        </button>
      </div>
      <Card className="print:shadow-none print:border-none">
        <CardHeader className="bg-slate-50/50 border-b border-border pb-4 flex flex-row justify-between items-start print:bg-white print:border-b-2 print:border-black print:pb-6">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">STUDENT SCORE CARD</CardTitle>
            <div className="mt-4 grid grid-cols-2 gap-x-12 gap-y-1 text-sm text-slate-800">
              <p><span className="font-semibold text-slate-500 w-24 inline-block">Student Name</span> {data.student.name}</p>
              <p><span className="font-semibold text-slate-500 w-24 inline-block">Roll Number</span> {data.student.roll_number || '-'}</p>
              <p><span className="font-semibold text-slate-500 w-24 inline-block">Class</span> {data.student.class_name}</p>
              <p><span className="font-semibold text-slate-500 w-24 inline-block">Branch</span> {data.student.branch_name}</p>
              <p><span className="font-semibold text-slate-500 w-24 inline-block">Section</span> {data.student.section_name}</p>
              <p><span className="font-semibold text-slate-500 w-24 inline-block">Academic Year</span> {data.student.year}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Report Card Up To:</span>
              <select 
                className="border border-input bg-white px-3 py-1.5 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={cutoff}
                onChange={e => setCutoff(e.target.value)}
              >
                <option value="All">All Assessments</option>
                {uniqueAssessments.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <button onClick={() => window.print()} className="flex items-center gap-2 text-sm bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800">
              <Printer size={16} /> Print Report
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-100/50 text-slate-600 font-semibold border-b border-border print:bg-transparent print:border-black">
              <tr>
                <th className="px-6 py-4">Subject</th>
                {activeColumns.map(col => (
                  <th key={col} className="px-6 py-4 text-center">{col}</th>
                ))}
                <th className="px-6 py-4 text-right border-l border-border print:border-black/20">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border print:divide-black/20">
              {subjects.map(sub => (
                <tr key={sub.name}>
                  <td className="px-6 py-3 font-semibold text-slate-900">{sub.name}</td>
                  {activeColumns.map(col => {
                    const mark = sub.assessments[col];
                    return (
                      <td key={col} className="px-6 py-3 text-center font-mono">
                        {mark ? `${mark.obtained}/${mark.max}` : '-'}
                      </td>
                    );
                  })}
                  <td className="px-6 py-3 text-right font-mono font-bold text-slate-900 bg-slate-50/50 border-l border-border print:border-black/20">
                    {sub.totalObt}/{sub.totalMax}
                  </td>
                </tr>
              ))}
              
              {/* Exactly ONE Overall Grand Total Row */}
              <tr className="bg-slate-100 print:bg-transparent">
                <td colSpan={activeColumns.length + 1} className="px-6 py-4 font-bold text-slate-900 text-right border-t-2 border-slate-300 print:border-black">
                  Overall Grand Total
                </td>
                <td className="px-6 py-4 font-bold font-mono text-right text-primary text-lg border-t-2 border-slate-300 border-l border-border print:border-black">
                  {overallObtained} / {overallMax}
                </td>
              </tr>
              <tr className="bg-slate-50 print:bg-transparent">
                <td colSpan={activeColumns.length + 1} className="px-6 py-4 font-bold text-slate-900 text-right">
                  Overall Percentage
                </td>
                <td className="px-6 py-4 font-bold text-right text-primary text-lg border-l border-border print:border-black">
                  {overallPercentage}%
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
