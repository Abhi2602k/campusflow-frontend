import { Link } from 'react-router-dom';
import { Lock, Trash2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useEffect, useState } from 'react';
import { api } from '../../api';

export default function ManageFaculty() {
  const [items, setItems] = useState<any[]>([]);
  const [resetUser, setResetUser] = useState<any>(null);
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [department, setDepartment] = useState('');
  const [search, setSearch] = useState('');

  const load = () => api.get('/management/faculty').then(res => setItems(res.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this faculty member?')) return;
    try {
      await api.delete(`/management/faculty/${id}`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete faculty");
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await api.post('/management/faculty', { name, email, employee_code: employeeCode, department });
    setName(''); setEmail(''); setEmployeeCode(''); setDepartment(''); load();
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

  
  const filteredItems = items.filter(s => 
    (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.employee_code || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.department || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">Manage Faculty</h1>
      <Link to="/admin/faculty/import" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-semibold px-4 py-2 rounded-md font-medium shadow-sm transition-colors text-sm">
        Bulk Import Faculty
      </Link>
    </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200/60">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Add New Faculty</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Name</label><input className="w-full bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium" value={name} onChange={e=>setName(e.target.value)} required/></div>
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label><input className="w-full bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Employee Code</label><input className="w-full bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium" value={employeeCode} onChange={e=>setEmployeeCode(e.target.value)} required/></div>
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Department</label><input className="w-full bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium" value={department} onChange={e=>setDepartment(e.target.value)} required/></div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 px-4 py-2 rounded-md font-medium shadow-sm transition-colors text-sm">Add Faculty</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200/60">
        <div className="p-4 border-b border-border bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <input type="text" placeholder="Search by name, email, or code..." value={search} onChange={e => setSearch(e.target.value)} className="w-full max-w-md bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium" />
          <div className="text-sm text-gray-500">Showing {filteredItems.length} faculty members</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50 border-y border-slate-200">
                <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Employee Code</th>
                <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Name</th>
                <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Email</th>
                <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Department</th>
                <th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-semibold text-gray-900">{s.employee_code || '-'}</td>
                  <td className="p-4 text-gray-600">{s.name}</td>
                  <td className="p-4 text-gray-600">{s.email}</td>
                  <td className="p-4 text-gray-700">{s.department || "-"}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => setResetUser(s)} className="text-gray-600 hover:text-gray-900 bg-white border border-gray-200 shadow-sm p-2 rounded-md inline-flex items-center gap-2 font-medium text-xs transition-colors" title="Reset Password">
                      <Lock size={16} /> Reset Password
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-700 bg-white border border-gray-200 shadow-sm p-2 rounded-md inline-flex items-center gap-2 font-medium text-xs transition-colors" title="Delete Faculty">
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No faculty found.</td></tr>}
            </tbody>
          </table>
        </div>
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
