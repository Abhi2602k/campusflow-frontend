import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export default function ManageBranches() {
  const [branches, setBranches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  

  const loadBranches = async () => {
    try {
      const res = await api.get('/management/options');
      setBranches(res.data.branches || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the branch '${name}'?`)) return;
    try {
      await api.delete(`/management/branches/${id}`);
      loadBranches();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete branch');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/management/branches', { name: newBranchName,  });
      setIsModalOpen(false);
      setNewBranchName('');
      
      loadBranches();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create branch');
    }
  };

  const filtered = branches.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Branches</h1>
          <p className="text-muted-foreground mt-1">Add and manage academic branches (e.g. cse, ece).</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={18} /> Add Branch
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Search branches..."
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
                  <th className="px-6 py-4">Branch Name</th>
                  <th className="px-6 py-4">Branch Code</th>
                  <th className="px-6 py-4 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{b.name}</td>
                    <td className="px-6 py-4 text-slate-500">{b.code || b.name.substring(0,3).toUpperCase()}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(b.id, b.name)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Branch"
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Branch">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Branch Name</label>
            <input 
              type="text" 
              required 
              value={newBranchName} 
              onChange={e => setNewBranchName(e.target.value)} 
              className="w-full border border-input rounded-md px-3 py-2 bg-background focus:ring-2 outline-none" 
              placeholder="e.g. cse" 
            />
            <p className="text-xs text-muted-foreground mt-1">Will automatically be converted and stored in lowercase.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Branch</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
