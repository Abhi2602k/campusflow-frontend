import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Users, GraduationCap, Calendar, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const { user } = useAuth();
  
  if (user?.role === 'PROGRAM_LEADER') return <Navigate to="/faculty" />;
  
  useEffect(() => {
    api.get('/dashboard/admin').then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-96 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl border border-gray-200/50"></div>)}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Students", value: data.total_students, icon: Users, color: "text-black", bg: "bg-gray-100" },
    { title: "Total Faculty", value: data.total_faculty, icon: GraduationCap, color: "text-black", bg: "bg-gray-100" },
    { title: "Today's Sessions", value: data.today_attendance?.marked, icon: Calendar, color: "text-black", bg: "bg-gray-100" },
    { title: "Pending Sessions", value: data.today_attendance?.pending || 0, icon: BarChart3, color: "text-black", bg: "bg-gray-100" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">Admin Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}. Here is what's happening today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-all duration-300 border border-gray-200/60 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} shadow-sm border border-white/20`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
