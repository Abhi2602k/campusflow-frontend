import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Paperclip, Megaphone } from 'lucide-react';

export default function ViewNotices() {
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    api.get('/notices').then(res => setNotices(res.data)).catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Megaphone size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notices & Announcements</h1>
          <p className="text-muted-foreground mt-1">Important updates from your Program Leader.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {notices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
            You have no new notices.
          </div>
        ) : notices.map(notice => (
          <Card key={notice.id} className="border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900">{notice.title}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Published {new Date(notice.created_at + 'Z').toLocaleString()}
                </p>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{notice.content}</p>
              {notice.attachment_url && (
                <div className="mt-5">
                  <a href={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '')}${notice.attachment_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-sm rounded-lg border border-blue-200 transition-colors shadow-sm">
                    <Paperclip size={16} /> Download Attachment
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
