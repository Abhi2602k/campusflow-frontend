import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Send, Trash2, Paperclip, FileText, Megaphone } from 'lucide-react';

export default function ManageNotices() {
  const [notices, setNotices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('BOTH');
  const [file, setFile] = useState<File | null>(null);

  const loadNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadNotices(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('audience', audience);
    if (file) formData.append('file', file);

    try {
      await api.post('/notices', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setFile(null);
      setAudience('BOTH');
      loadNotices();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to publish notice.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      loadNotices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Notices</h1>
            <p className="text-muted-foreground mt-1">Publish announcements to your students and faculty.</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Send size={18} /> Publish Notice
        </Button>
      </div>

      <div className="grid gap-4">
        {notices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            No notices published yet.
          </div>
        ) : notices.map(notice => (
          <Card key={notice.id} className="border border-slate-200 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${notice.audience === 'STUDENTS' ? 'bg-green-500' : notice.audience === 'FACULTY' ? 'bg-purple-500' : 'bg-blue-500'}`} />
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{notice.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">Audience: {notice.audience}</span>
                    <span>{new Date(notice.created_at + 'Z').toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(notice.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{notice.content}</p>
              {notice.attachment_url && (
                <div className="mt-4">
                  <a href={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '')}${notice.attachment_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-sm rounded-lg border border-blue-200 transition-colors">
                    <Paperclip size={16} /> View Attachment
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish New Notice">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Notice Title</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-slate-50 focus:bg-white outline-none" placeholder="e.g., Mid-Term Exam Schedule" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Audience</label>
            <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-slate-50 focus:bg-white outline-none">
              <option value="BOTH">Both Students & Faculty</option>
              <option value="STUDENTS">Students Only</option>
              <option value="FACULTY">Faculty Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Message Content</label>
            <textarea required value={content} onChange={e => setContent(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-slate-50 focus:bg-white outline-none min-h-[120px]" placeholder="Type your notice here..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Attachment (Optional)</label>
            <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-slate-50 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold" />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Send size={16} /> {loading ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
