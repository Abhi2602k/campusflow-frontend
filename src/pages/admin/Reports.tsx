import React from 'react';

export default function Reports() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">Attendance Reports</h1>
      <div className="bg-white p-6 rounded shadow flex flex-col items-center justify-center h-64 text-gray-500">
        <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        <p className="text-lg">No attendance data collected yet.</p>
        <p className="text-sm">Start marking attendance in classes to generate reports.</p>
      </div>
    </div>
  );
}
