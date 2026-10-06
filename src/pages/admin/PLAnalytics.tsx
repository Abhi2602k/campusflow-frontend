import { useEffect, useState } from 'react';
import { api } from '../../api';
import { BarChart3, Users, CheckCircle, XCircle, TrendingDown, BookOpen } from 'lucide-react';

export default function PLAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/attendance/analytics/class')
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading class analytics...</div>;
  if (error) return <div className="p-8 text-center text-destructive font-medium">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Class Analytics</h1>
        <p className="text-muted-foreground mt-2">Comprehensive attendance breakdown for your assigned cohort.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm"><Users size={16}/> Total Students</div>
          <div className="text-4xl font-black text-slate-900">{data.total_students}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm"><BarChart3 size={16}/> Overall Attendance</div>
          <div className="text-4xl font-black text-blue-600">{data.overall_percentage}%</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm"><CheckCircle size={16}/> Above 75% Threshold</div>
          <div className="text-4xl font-black text-emerald-600">{data.above_threshold}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm"><TrendingDown size={16}/> Defaulters (&lt;75%)</div>
          <div className="text-4xl font-black text-rose-600">{data.below_threshold}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-slate-50/50">
            <h3 className="font-bold text-lg flex items-center gap-2"><BookOpen size={18}/> Subject-Wise Statistics</h3>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted text-muted-foreground">
                <tr><th className="px-6 py-3">Subject</th><th className="px-6 py-3 text-right">Attendance %</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.subject_stats.map((s: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium">{s.name}</td>
                    <td className="px-6 py-4 text-right font-bold">
                      <span className={s.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}>{s.percentage}%</span>
                    </td>
                  </tr>
                ))}
                {data.subject_stats.length === 0 && <tr><td colSpan={2} className="p-6 text-center text-muted-foreground">No subjects found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-slate-50/50">
            <h3 className="font-bold text-lg flex items-center gap-2"><Users size={18}/> Student Defaulter Watchlist</h3>
          </div>
          <div className="p-0 overflow-x-auto max-h-[400px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted text-muted-foreground sticky top-0">
                <tr><th className="px-6 py-3">Student</th><th className="px-6 py-3 text-right">Attendance %</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.student_stats.filter((s:any) => s.percentage < 75).sort((a:any,b:any) => a.percentage - b.percentage).map((s: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/50 bg-rose-50/20">
                    <td className="px-6 py-4 font-medium">{s.name} <span className="block text-xs text-muted-foreground">{s.roll_number}</span></td>
                    <td className="px-6 py-4 text-right font-bold text-rose-600">{s.percentage}%</td>
                  </tr>
                ))}
                {data.student_stats.filter((s:any) => s.percentage < 75).length === 0 && <tr><td colSpan={2} className="p-6 text-center text-muted-foreground">All students are above 75%.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
