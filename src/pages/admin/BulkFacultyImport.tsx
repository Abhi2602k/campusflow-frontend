import React, { useState } from 'react';
import { api } from '../../api';

export default function BulkFacultyImport() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDownloadTemplate = () => {
    window.location.href = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1') + '/management/faculty/import/template';
  };

  const handleValidate = async () => {
    if (!file) return alert("Please select a file");
    setLoading(true); setMessage(''); setPreview(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/management/faculty/import/validate', formData);
      setPreview(res.data);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Validation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!preview || preview.valid_count === 0) return;
    setLoading(true); setMessage('');
    try {
      const res = await api.post('/management/faculty/import', { faculty: preview.valid_rows });
      setMessage(res.data.message);
      setPreview(null);
      setFile(null);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">Bulk Faculty Import</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">Upload Student Data</h2>
        <div className="flex gap-4 items-center">
          <button onClick={handleDownloadTemplate} className="bg-gray-200 px-4 py-2 rounded font-bold hover:bg-gray-300">Download Template</button>
          <input type="file" accept=".csv, .xlsx" onChange={e => setFile(e.target.files?.[0] || null)} className="bg-gray-50 border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-slate-900 font-medium" />
          <button onClick={handleValidate} disabled={loading || !file} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 px-4 py-2 rounded-md font-medium shadow-sm transition-colors text-sm">Validate File</button>
        </div>
      </div>

      {message && <div className={`p-4 mb-6 rounded font-bold ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</div>}

      {preview && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">Import Preview</h2>
          <div className="flex gap-6 mb-6">
            <div className="text-lg">Total Rows: <span className="font-bold">{preview.total_rows}</span></div>
            <div className="text-lg text-green-600">Valid: <span className="font-bold">{preview.valid_count}</span></div>
            <div className="text-lg text-red-600">Errors: <span className="font-bold">{preview.error_count}</span></div>
          </div>
          
          <div className="flex gap-4 mb-6">
            <button onClick={() => setPreview(null)} className="bg-gray-400 text-white px-6 py-2 rounded font-bold hover:bg-gray-50/80 transition-colors0">Cancel</button>
            <button onClick={handleImport} disabled={preview.valid_count === 0 || loading} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-semibold px-4 py-2 rounded-md font-medium shadow-sm transition-colors text-sm">Import Valid Students</button>
          </div>

          {preview.error_count > 0 && (
            <div>
              <h3 className="font-bold mb-2 text-red-600">Error Report</h3>
              <div className="max-h-96 overflow-y-auto border">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-red-100 sticky top-0">
                    <tr><th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Row</th><th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Faculty Name</th><th className="p-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Error</th></tr>
                  </thead>
                  <tbody>
                    {preview.error_rows.map((err: any, i: number) => (
                      <tr key={i}>
                        <td className="p-4 text-gray-700">{err.row}</td>
                        <td className="p-4 text-gray-700">{err.student}</td>
                        <td className="p-4 text-gray-700">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
