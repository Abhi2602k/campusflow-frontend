import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, Plus, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const loadData = async () => {
    try {
      const res = await api.get('/management/superadmin/admins');
      setAdmins(res.data || []);
      
      const facRes = await api.get('/management/superadmin/faculty-list');
      setFaculty(facRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/management/superadmin/admins', formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '' });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create admin');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`CRITICAL WARNING: Are you sure you want to permanently delete the Administrator '${name}'?`)) return;
    try {
      await api.delete(`/management/superadmin/admins/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete admin');
    }
  };

  const handlePromote = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to promote Faculty '${name}' to ADMIN?`)) return;
    try {
      await api.put(`/management/superadmin/users/${id}/role`, { role: 'ADMIN' });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to promote');
    }
  };

  const handleDemote = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to demote Admin '${name}' back to FACULTY?`)) return;
    try {
      await api.put(`/management/superadmin/users/${id}/role`, { role: 'FACULTY' });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to demote');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl shadow-sm">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Admins</h1>
            <p className="text-muted-foreground mt-1">Appoint new administrators or promote existing faculty.</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white">
          <Plus size={18} /> Appoint External Admin
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Left Col: Existing Admins */}
        <Card className="border border-red-200 shadow-md">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50/30">
            <h2 className="font-bold text-red-900 tracking-wide uppercase text-sm">Active Administrators</h2>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4 w-20 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {admins.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{a.name}</td>
                      <td className="px-6 py-4 text-slate-600">{a.email}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDelete(a.id, a.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete Admin">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-slate-500">No administrators found.</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right Col: Promote Faculty */}
        <Card className="border border-blue-200 shadow-md">
          <div className="px-6 py-4 border-b border-blue-100 bg-blue-50/30">
            <h2 className="font-bold text-blue-900 tracking-wide uppercase text-sm">Faculty Promotion Board</h2>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {faculty.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{f.name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${f.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {f.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {f.role === 'FACULTY' ? (
                          <button onClick={() => handlePromote(f.id, f.name)} className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Promote to Admin">
                            <ArrowUpCircle size={20} />
                          </button>
                        ) : (
                          <button onClick={() => handleDemote(f.id, f.name)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors" title="Demote back to Faculty">
                            <ArrowDownCircle size={20} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {faculty.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-slate-500">No personnel found.</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Appoint External Administrator">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-input rounded-md px-3 py-2 bg-background focus:ring-2 outline-none" placeholder="e.g. John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-input rounded-md px-3 py-2 bg-background focus:ring-2 outline-none" placeholder="e.g. john@test.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-input rounded-md px-3 py-2 bg-background focus:ring-2 outline-none" placeholder="Assign a secure password" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">Appoint Admin</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
