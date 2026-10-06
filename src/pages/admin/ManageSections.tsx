import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Plus, Trash2, LayoutDashboard } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export default function ManageSections() {
  const [sections, setSections] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  const loadData = async () => {
    try {
      const res = await api.get('/management/options');
      setSections(res.data.sections || []);
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
      await api.post('/management/sections', { name: newSectionName });
      setIsModalOpen(false);
      setNewSectionName('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create section');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete Section '${name}'?`)) return;
    try {
      await api.delete(`/management/sections/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete section');
    }
  };

  const filtered = sections.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl shadow-sm">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Sections</h1>
            <p className="text-muted-foreground mt-1">Add and remove student cohort sections (e.g., A, B, C).</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 text-white">
          <Plus size={18} /> Add Section
        </Button>
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none transition-all shadow-sm text-sm"
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Section Name</th>
                  <th className="px-6 py-4 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 text-base">Section {s.name}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(s.id, s.name)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={2} className="p-8 text-center text-slate-500 font-medium">No sections found.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Section">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Section Name</label>
            <input 
              type="text" 
              required 
              value={newSectionName} 
              onChange={e => setNewSectionName(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium" 
              placeholder="e.g. A" 
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Save Section</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
