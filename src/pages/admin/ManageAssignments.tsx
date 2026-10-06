import React, { useEffect, useState } from 'react';
import { api } from '../../api';

export default function ManageAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [opts, setOpts] = useState<any>({ academic_years: [], classes: [], branches: [], sections: [], subjects: [], faculties: [] });
  
  const [ayId, setAyId] = useState('');
  const [classId, setClassId] = useState('');
  const [year, setYear] = useState('');
  const [branchId, setBranchId] = useState('');
  const [secId, setSecId] = useState('');
  const [subId, setSubId] = useState('');
  const [fId, setFId] = useState('');
  
  const load = async () => {
    api.get('/management/assignments').then(res => setAssignments(res.data)).catch(console.error);
    api.get('/management/options').then(res => setOpts(res.data)).catch(console.error);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/management/assignments', {
        academic_year_id: ayId,
        class_id: classId,
        year: year,
        branch_id: branchId,
        section_id: secId,
        subject_id: subId,
        faculty_id: fId
      });
      setFId(''); setSecId(''); setSubId(''); load();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Assignment Failed (Duplicate?)");
    }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/management/assignments/${id}`);
    load();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">Faculty Assignments</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Academic Year</label>
          <select className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium w-full" value={ayId} onChange={e=>{setAyId(e.target.value); setClassId(''); setYear(''); setBranchId(''); setSecId(''); setSubId(''); setFId('');}} required>
            <option value="">-- Select --</option>
            {opts.academic_years.map((x:any) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Class</label>
          <select className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium w-full" value={classId} onChange={e=>{setClassId(e.target.value); setYear(''); setBranchId(''); setSecId(''); setSubId(''); setFId('');}} required disabled={!ayId}>
            <option value="">-- Select --</option>
            {opts.classes.map((x:any) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Year</label>
          <select className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium w-full" value={year} onChange={e=>{setYear(e.target.value); setBranchId(''); setSecId(''); setSubId(''); setFId('');}} required disabled={!classId}>
            <option value="">-- Select --</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Branch</label>
          <select className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium w-full" value={branchId} onChange={e=>{setBranchId(e.target.value); setSecId(''); setSubId(''); setFId('');}} required disabled={!year}>
            <option value="">-- Select --</option>
            {opts.branches.map((x:any) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Section</label>
          <select className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium w-full" value={secId} onChange={e=>{setSecId(e.target.value); setSubId(''); setFId('');}} required disabled={!branchId}>
            <option value="">-- Select --</option>
            {opts.sections.map((x:any) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subject</label>
          <select className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium w-full" value={subId} onChange={e=>setSubId(e.target.value)} required disabled={!secId}>
            <option value="">-- Select --</option>
            {opts.subjects.map((x:any) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Faculty</label>
          <select className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium w-full" value={fId} onChange={e=>setFId(e.target.value)} required disabled={!secId}>
            <option value="">-- Select --</option>
            {opts.faculties.map((x:any) => <option key={x.id} value={x.id}>{x.name} — {x.email}</option>)}
          </select>
        </div>
        <div className="md:col-span-4 flex justify-end">
          <button className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-semibold px-4 py-2 rounded-md font-medium shadow-sm transition-colors text-sm">Assign Faculty</button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-slate-50 border-y border-slate-200">
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Academic Year</th>
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Class</th>
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Year</th>
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Branch</th>
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Section</th>
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Subject</th>
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Faculty</th>
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Email</th>
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Action</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(a => (
              <tr key={a.id}>
                <td className="p-4 text-gray-700">{a.academic_year}</td>
                <td className="p-4 text-gray-700">{a.class_name}</td>
                <td className="p-4 text-gray-700">{a.year}</td>
                <td className="p-4 text-gray-700">{a.branch}</td>
                <td className="p-4 text-gray-700">{a.section}</td>
                <td className="p-4 text-gray-700">{a.subject}</td>
                <td className="p-4 text-gray-700">{a.faculty_name}</td>
                <td className="p-4 text-gray-700">{a.faculty_email}</td>
                <td className="p-4 text-gray-700">
                  <button onClick={() => handleDelete(a.id)} className="text-red-600 font-bold hover:underline">Remove</button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && <tr><td colSpan={9} className="p-4 text-center text-gray-500">No assignments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
