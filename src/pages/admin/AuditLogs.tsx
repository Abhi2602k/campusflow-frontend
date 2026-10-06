import { useEffect, useState } from 'react';
import { api } from '../../api';
import { ShieldAlert, Clock } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/audit-logs')
      .then(res => {
        setLogs(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl shadow-sm">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Attendance Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">Track modifications made to existing attendance records.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Timestamp</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Student</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Session Date</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Changed By</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Modification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No audit logs found.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 flex items-center gap-2">
                      <Clock size={14} />
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {log.student_name} <span className="text-xs text-slate-500 block">{log.roll_number}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{log.session_date}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{log.changed_by}</div>
                      <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{log.changer_role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className={`px-2 py-1 rounded-md ${log.previous_status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {log.previous_status}
                        </span>
                        <span className="text-slate-400">?</span>
                        <span className={`px-2 py-1 rounded-md ${log.new_status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {log.new_status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
