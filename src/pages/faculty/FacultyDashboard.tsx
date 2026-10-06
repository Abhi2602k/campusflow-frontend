import React, { useEffect, useState } from 'react';
import { api } from '../../api';

export default function FacultyDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/dashboard/faculty').then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">Faculty Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm font-bold uppercase">Assigned Classes</h3>
          <p className="text-3xl font-bold">{data.assigned_classes}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm font-bold uppercase">Assigned Subjects</h3>
          <p className="text-3xl font-bold">{data.assigned_subjects}</p>
        </div>
      </div>
    </div>
  );
}
