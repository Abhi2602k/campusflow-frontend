import { useEffect, useState } from 'react';
import { api } from '../../api';
import { BookOpen, Trash2 } from 'lucide-react';

export default function ManageSubjects() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const load = () => api.get('/management/subjects').then(res => setItems(res.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the subject '${name}'?`)) return;
    try {
      await api.delete(`/management/subjects/${id}`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete subject');
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await api.post('/management/subjects', { name, code });
    setName(''); setCode(''); load();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
          <BookOpen size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Manage Subjects</h1>
          <p className="text-sm text-slate-500 mt-1">Add and organize academic subjects.</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Add New Subject</h3>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject Name</label>
            <input className="w-full bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium text-slate-900 font-medium" placeholder="e.g. Computer Networks" value={name} onChange={e=>setName(e.target.value)} required/>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject Code</label>
            <input className="w-full bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium text-slate-900 font-medium" placeholder="e.g. CN101" value={code} onChange={e=>setCode(e.target.value)} required/>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 px-6 py-2.5 rounded-lg font-semibold transition-colors text-sm w-full md:w-auto">Add Subject</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Subject List</h3>
          <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full">{items.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Subject Name</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Subject Code</th>
                <th className="px-6 py-4 w-20 text-center font-bold text-slate-500 uppercase tracking-widest text-[11px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-900">{s.name}</td>
                  <td className="px-6 py-4 font-mono text-slate-500 text-xs">{s.code}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDelete(s.id, s.name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-slate-500 font-medium">No subjects found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
