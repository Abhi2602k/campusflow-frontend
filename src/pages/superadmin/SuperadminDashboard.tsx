import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { ShieldAlert, ArrowUpCircle, ArrowDownCircle, KeyRound, Plus } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

export default function SuperadminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');


  const loadData = async () => {
    try {
      const res = await api.get('/management/superadmin/faculty-list');
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleMakeAdmin = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to promote '${name}' to Admin?`)) return;
    try {
      await api.put(`/management/superadmin/users/${id}/role`, { role: 'ADMIN' });
      loadData();
    } catch (err: any) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await api.post(`/management/superadmin/users/${selectedUser.id}/reset-password`, { new_password: newPassword });
      setResetModalOpen(false);
      setNewPassword('');
      alert(`Password successfully reset for ${selectedUser.name}!`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reset password');
    }
  };

  const openResetModal = (u: any) => {
    setSelectedUser(u);
    setNewPassword('');
    setConfirmPassword('');
    setResetModalOpen(true);
  };


  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPassword !== confirmAdminPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await api.post(`/management/superadmin/admins`, { name: "Administrator", email: newAdminEmail, password: newAdminPassword });
      setCreateModalOpen(false);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      alert(`Admin account created successfully for ${newAdminEmail}!`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create admin');
    }
  };

  const handleRemoveAdmin = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove Admin rights from '${name}'?`)) return;
    try {
      await api.put(`/management/superadmin/users/${id}/role`, { role: 'FACULTY' });
      loadData();
    } catch (err: any) { alert(err.response?.data?.detail || 'Failed'); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl shadow-sm">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Superadmin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Make Admin & Remove Admin Controls</p>
          </div>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
          <Plus size={18} /> Create Admin
        </Button>
      </div>
      
      <Card className="shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Current Role</th>
                  <th className="px-6 py-4 w-64 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{u.name}</td>
                    <td className="px-6 py-4 text-slate-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                      <button onClick={() => openResetModal(u)} className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-md flex items-center justify-center gap-2 transition-colors" title="Reset Password">
                        <KeyRound size={16} /> Reset Pass
                      </button>
                      {u.role === 'FACULTY' ? (
                        <button onClick={() => handleMakeAdmin(u.id, u.name)} className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 font-bold rounded-md flex items-center justify-center gap-2 w-full transition-colors">
                          <ArrowUpCircle size={16} /> Make Admin
                        </button>
                      ) : (
                        <button onClick={() => handleRemoveAdmin(u.id, u.name)} className="px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 font-bold rounded-md flex items-center justify-center gap-2 w-full transition-colors">
                          <ArrowDownCircle size={16} /> Remove Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-500">No personnel found.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Admin">
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={newAdminEmail} 
              onChange={e => setNewAdminEmail(e.target.value)} 
              className="w-full border border-input rounded-md px-3 py-2 bg-background focus:ring-2 outline-none" 
              placeholder="admin@example.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={newAdminPassword} 
              onChange={e => setNewAdminPassword(e.target.value)} 
              className="w-full border border-input rounded-md px-3 py-2 bg-background focus:ring-2 outline-none" 
              placeholder="Enter secure password" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input 
              type="password" 
              required 
              value={confirmAdminPassword} 
              onChange={e => setConfirmAdminPassword(e.target.value)} 
              className="w-full border border-input rounded-md px-3 py-2 bg-background focus:ring-2 outline-none" 
              placeholder="Confirm secure password" 
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">Create Admin</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} title={`Reset Password for ${selectedUser?.name}`}>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input 
              type="password" 
              required 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              className="w-full border border-input rounded-md px-3 py-2 bg-background focus:ring-2 outline-none" 
              placeholder="Enter new password" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input 
              type="password" 
              required 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className="w-full border border-input rounded-md px-3 py-2 bg-background focus:ring-2 outline-none" 
              placeholder="Confirm new password" 
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setResetModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">Force Reset</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
