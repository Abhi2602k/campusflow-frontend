import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { User, BookOpen } from 'lucide-react';
import { Select } from '../../components/ui/Select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    api.get('/attendance/my-attendance')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.detail || 'Failed to load attendance data');
        setLoading(false);
      });
  }, []);

  const filteredHistory = useMemo(() => {
    if (!data?.history) return [];
    return data.history.filter((h: any) => {
      if (subjectFilter && h.subject !== subjectFilter) return false;
      if (statusFilter && h.status !== statusFilter) return false;
      return true;
    });
  }, [data, subjectFilter, statusFilter]);

  const paginatedHistory = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredHistory.slice(start, start + itemsPerPage);
  }, [filteredHistory, page]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  if (loading) return <div className="flex h-64 items-center justify-center text-xl font-bold text-gray-400 animate-pulse">Loading My Attendance...</div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700 border-l-4 border-red-500 font-bold">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* My Profile & Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="bg-muted/30 border-b border-border pb-4">
            <CardTitle className="text-lg flex items-center gap-2"><User size={20} className="text-primary"/> My Profile</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
             <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Student Name</p>
                <p className="font-medium text-foreground">{data.history[0]?.subject ? 'Enrolled Student' : 'Student Profile'}</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Status</p>
                  <Badge variant="success">Active Enrollment</Badge>
                </div>
             </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="bg-muted/30 border-b border-border pb-4">
            <CardTitle className="text-lg flex items-center gap-2"><BookOpen size={20} className="text-primary"/> My Subjects</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
             <div className="flex flex-wrap gap-2">
                {data.subject_wise.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">No subjects assigned yet.</p>
                ) : (
                  data.subject_wise.map((sub: any) => (
                    <Badge key={sub.subject_id} variant="secondary" className="px-3 py-1.5 text-sm font-medium border border-border/50">
                      {sub.subject_name}
                    </Badge>
                  ))
                )}
             </div>
          </CardContent>
        </Card>
      </div>

      {data.overall.is_defaulter && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center">
          <div className="text-destructive">
            <h3 className="font-semibold text-lg flex items-center gap-2">⚠️ Attendance Warning</h3>
            <p className="text-sm mt-1 text-destructive/80">Your overall attendance is {data.overall.percentage}%, which is below the required 75% threshold. Please attend classes regularly to avoid penalties.</p>
          </div>
        </div>
      )}

      {/* Top Metrics Widget */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card text-card-foreground border border-b border-borderorder rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Overall Attendance</p>
          <p className={`text-4xl font-black ${data.overall.percentage >= 75 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
            {data.overall.percentage}%
          </p>
        </div>
        <div className="bg-card text-card-foreground border border-b border-borderorder rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Total Lectures</p>
          <p className="text-4xl font-black text-foreground">{data.overall.total_lectures}</p>
        </div>
        <div className="bg-card text-card-foreground border border-b border-borderorder rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Present Lectures</p>
          <p className="text-4xl font-black text-blue-600">{data.overall.present_lectures}</p>
        </div>
        <div className="bg-card text-card-foreground border border-b border-borderorder rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Absent Lectures</p>
          <p className="text-4xl font-black text-destructive">{data.overall.absent_lectures}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise Table */}
        <div className="lg:col-span-2 bg-card text-card-foreground border border-b border-borderorder rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4 text-foreground">Subject-wise Attendance</h2>
          {data.subject_wise.length === 0 ? (
            <p className="text-muted-foreground italic">No attendance marked yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-muted text-muted-foreground uppercase text-xs">
                    <th className="p-3 border-b border-border">Subject</th>
                    <th className="p-3 border-b border-border text-center">Total</th>
                    <th className="p-3 border-b border-border text-center">Present</th>
                    <th className="p-3 border-b border-border text-center">Absent</th>
                    <th className="p-3 border-b border-border text-center">%</th>
                    <th className="p-3 border-b border-border text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.subject_wise.map((sub: any) => (
                    <tr key={sub.subject_id} className="hover:bg-muted border-b border-border">
                      <td className="p-3 font-semibold text-foreground">{sub.subject_name}</td>
                      <td className="p-3 text-center">{sub.total}</td>
                      <td className="p-3 text-center font-semibold text-green-600 dark:text-green-400">{sub.present}</td>
                      <td className="p-3 text-center font-semibold text-destructive">{sub.absent}</td>
                      <td className="p-3 text-center font-bold">{sub.percentage}%</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${sub.status === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Trend Chart (Recharts) */}
        <div className="bg-card text-card-foreground border border-b border-borderorder rounded-xl shadow-sm p-6 flex flex-col">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4 text-foreground">Attendance Trend (Last 14 Days)</h2>
          {data.trend.length === 0 ? (
             <p className="text-muted-foreground italic mt-auto mb-auto text-center">Not enough data for trend.</p>
          ) : (
            <div className="w-full h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trend} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => val.split('-').slice(1).join('/')} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tickFormatter={(val) => `${val}%`} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, 'Attendance']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {data.trend.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.percentage >= 75 ? '#22c55e' : '#f87171'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-card text-card-foreground border border-b border-borderorder rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-foreground">Recent Attendance History</h2>
          <div className="flex gap-2">
            <select className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium text-sm bg-muted outline-none" value={subjectFilter} onChange={e => {setSubjectFilter(e.target.value); setPage(1);}}>
              <option value="">All Subjects</option>
              {data.subject_wise.map((s:any) => <option key={s.subject_id} value={s.subject_name}>{s.subject_name}</option>)}
            </select>
            <select className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium text-sm bg-muted outline-none" value={statusFilter} onChange={e => {setStatusFilter(e.target.value); setPage(1);}}>
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <p className="text-muted-foreground italic text-center py-8 bg-muted rounded">No records found matching filters.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground uppercase text-xs">
                    <th className="p-3 border-b border-border">Date</th>
                    <th className="p-3 border-b border-border">Time</th>
                    <th className="p-3 border-b border-border">Duration/Lectures</th>
                    <th className="p-3 border-b border-border">Subject</th>
                    <th className="p-3 border-b border-border">Faculty</th>
                    <th className="p-3 border-b border-border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((h: any) => (
                    <tr key={h.id} className="hover:bg-muted/50 border-b border-border cursor-pointer transition-colors" title="View details">
                      <td className="p-3 font-semibold text-foreground">{h.date}</td>
                      <td className="p-3 text-muted-foreground">{h.time}</td>
                      <td className="p-3 text-muted-foreground">
                        <span className="inline-block bg-muted text-gray-700 px-2 py-1 rounded-full text-xs font-bold">
                          {h.lectures} Lecture{h.lectures > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="p-3 text-foreground">{h.subject}</td>
                      <td className="p-3 text-muted-foreground">{h.faculty}</td>
                      <td className="p-4 text-gray-600">
                        <span className={`inline-flex items-center gap-1 font-bold ${h.status === 'Present' ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                          {h.status === 'Present' ? '✓' : '✗'} {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-muted-foreground">Showing page {page} of {totalPages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded bg-muted text-gray-700 hover:bg-gray-300 disabled:opacity-50 font-bold text-sm">Prev</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded bg-muted text-gray-700 hover:bg-gray-300 disabled:opacity-50 font-bold text-sm">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
