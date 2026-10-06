import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export default function ManageClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const loadData = async () => {
    try {
      const res = await api.get('/management/options');
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the class '${name}'?`)) return;
    try {
      await api.delete(`/management/classes/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete class');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/management/classes', { name: newClassName });
      setIsModalOpen(false);
      setNewClassName('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create class');
    }
  };

  const filtered = classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Classes</h1>
          <p className="text-muted-foreground mt-1">Add and manage academic classes (e.g. B.Tech, M.Tech).</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={18} /> Add Class
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-input rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">Class Name</th>
                  <th className="px-6 py-4 w-32 text-center">ID Prefix</th>
                  <th className="px-6 py-4 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{c.id.split('-')[0]}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Class"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Class">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Class Name</label>
            <input 
              type="text" 
              required 
              value={newClassName} 
              onChange={e => setNewClassName(e.target.value)} 
              className="w-full border border-input rounded-md px-3 py-2 bg-background focus:ring-2 outline-none" 
              placeholder="e.g. B.Tech" 
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Class</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
