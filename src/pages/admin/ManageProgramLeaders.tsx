import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import React, { useEffect, useState } from 'react';
import { api } from '../../api';

export default function ManageProgramLeaders() {
  const [pls, setPls] = useState<any[]>([]);
  const [opts, setOpts] = useState<any>({ classes: [], branches: [], sections: [] });
  const [faculty, setFaculty] = useState<any[]>([]);
  const [resetUser, setResetUser] = useState<any>(null);
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [userId, setUserId] = useState('');
  const [classId, setClassId] = useState('');
  const [year, setYear] = useState('');
  const [branchId, setBranchId] = useState('');
  const [sectionId, setSectionId] = useState('');

  const loadData = async () => {
    api.get('/management/program-leaders').then(res => setPls(res.data)).catch(console.error);
    api.get('/management/options').then(res => setOpts(res.data)).catch(console.error);
    api.get('/management/faculty').then(res => setFaculty(res.data)).catch(console.error);
  };

  useEffect(() => { loadData(); }, []);

  const handleDemote = async (id: string) => {
    if (!confirm('Are you sure you want to demote this Program Leader back to Faculty?')) return;
    try {
      await api.delete(`/management/program-leaders/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to demote");
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/management/program-leaders', {
        user_id: userId, class_id: classId, year, branch_id: branchId, section_id: sectionId
      });
      setUserId(''); setClassId(''); setYear(''); setBranchId(''); setSectionId('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to assign PL");
    }
  };

  
  const handleResetPassword = async () => {
    if (!resetUser) return;
    if (newPassword.length < 6) return alert("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return alert("Passwords do not match!");
    setResetting(true);
    try {
      await api.post(`/management/users/${resetUser.user_id || resetUser.id}/reset-password`, { new_password: newPassword });
      setResetUser(null);
      setNewPassword('');
      setConfirmPassword('');
      alert('Password successfully reset!');
      // Optional: show a success toast here
    } catch (err) {
      console.error(err);
      alert('Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">Manage Program Leaders</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Faculty</label>
          <select className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium w-full" value={userId} onChange={e=>setUserId(e.target.value)} required>
            <option value="">-- Select --</option>
            {faculty.map((x:any) => <option key={x.id} value={x.id}>{x.name} - {x.email}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Class</label>
          <select className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium w-full" value={classId} onChange={e=>setClassId(e.target.value)} required>
            <option value="">-- Select --</option>
            {opts.classes.map((x:any) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Year</label>
          <select className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium w-full" value={year} onChange={e=>setYear(e.target.value)} required>
            <option value="">-- Select --</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Branch</label>
          <select className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium w-full" value={branchId} onChange={e=>setBranchId(e.target.value)} required>
            <option value="">-- Select --</option>
            {opts.branches.map((x:any) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Section</label>
          <select className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium w-full" value={sectionId} onChange={e=>setSectionId(e.target.value)} required>
            <option value="">-- Select --</option>
            {opts.sections.map((x:any) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
        
        <div className="md:col-span-5 flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 px-4 py-2 rounded-md font-medium shadow-sm transition-colors text-sm">Assign PL Scope</button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-slate-50 border-y border-slate-200">
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Faculty Name</th>
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Email</th>
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Class</th>
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Year</th>
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Branch</th>
              <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Section</th>
              <th className="p-3 border text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pls.map(p => (
              <tr key={p.id}>
                <td className="p-3 border font-bold">{p.name}</td>
                <td className="p-4 text-gray-700">{p.email}</td>
                <td className="p-4 text-gray-700">{p.class_name}</td>
                <td className="p-4 text-gray-700">{p.year}</td>
                <td className="p-4 text-gray-700">{p.branch_name}</td>
                <td className="p-4 text-gray-700">{p.section_name}</td>
                <td className="p-3 border text-right space-x-3">
                  <button onClick={() => setResetUser(p)} className="text-amber-500 font-bold hover:underline" title="Reset Password">Reset PW</button>
                  <button onClick={() => handleDemote(p.id)} className="text-red-600 font-bold hover:underline">Demote</button>
                </td>
              </tr>
            ))}
            {pls.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-gray-500">No Program Leaders assigned.</td></tr>}
          </tbody>
        </table>
      </div>
    
      <Modal
        isOpen={!!resetUser}
        onClose={() => { setResetUser(null); setNewPassword(''); setConfirmPassword(''); }}
        title="Reset Password"
      >
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 text-muted-foreground">Email</label>
            <p className="text-md font-medium text-foreground">{resetUser?.email}</p>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 text-muted-foreground">New Password</label>
            <input type="password" placeholder="••••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border border-input rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 text-muted-foreground">Confirm Password</label>
            <input type="password" placeholder="••••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border border-input rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-border mt-4">
            <Button variant="outline" onClick={() => { setResetUser(null); setNewPassword(''); setConfirmPassword(''); }} disabled={resetting}>Cancel</Button>
            <Button variant="default" onClick={handleResetPassword} isLoading={resetting}>Reset Password</Button>
          </div>
        </div>
      </Modal>
</div>
  );
}
