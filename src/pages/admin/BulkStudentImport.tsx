import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Download, Upload, AlertCircle, CheckCircle2, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

export default function BulkStudentImport() {
  const [options, setOptions] = useState({ classes: [], branches: [], sections: [], academic_years: [] });
  const [allocation, setAllocation] = useState({ class_id: '', year: '', branch_id: '', section_id: '' });
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/management/options').then(res => {
      setOptions({
        classes: res.data.classes || [],
        branches: res.data.branches || [],
        sections: res.data.sections || [],
        academic_years: res.data.academic_years || []
      });
    }).catch(console.error);
  }, []);

  const isAllocationComplete = allocation.class_id && allocation.year && allocation.branch_id && allocation.section_id;

  const getAllocationLabels = () => {
    const c = (options.classes as any[]).find(x => x.id === allocation.class_id)?.name || 'Unknown Class';
    const y = allocation.year || 'Unknown Year';
    const b = (options.branches as any[]).find(x => x.id === allocation.branch_id)?.name || 'Unknown Branch';
    const s = (options.sections as any[]).find(x => x.id === allocation.section_id)?.name || 'Unknown Section';
    return `${c} ? ${y} ? ${b} ? Section ${s}`;
  };

  const handleDownloadTemplate = () => {
    window.location.href = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1') + '/management/students/import/template';
  };

  const handleValidate = async () => {
    if (!file) return alert("Please select a file");
    if (!isAllocationComplete) return alert("Please select the Academic Allocation first");
    
    setLoading(true); setMessage(''); setPreview(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('class_id', allocation.class_id);
    formData.append('year', allocation.year);
    formData.append('branch_id', allocation.branch_id);
    formData.append('section_id', allocation.section_id);
    
    try {
      const res = await api.post('/management/students/import/validate', formData);
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
      const res = await api.post('/management/students/import', { students: preview.valid_rows });
      setMessage(res.data.message);
      setPreview(null);
      setFile(null);
      setAllocation({ class_id: '', year: '', branch_id: '', section_id: '' });
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bulk Student Import</h1>
        <p className="text-slate-500 mt-2">Follow the steps below to import and allocate multiple students simultaneously.</p>
      </div>

      {/* STEP 1: Academic Allocation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
          Select Academic Allocation
        </h2>
        <p className="text-sm text-slate-500 mb-6">Select the destination cohort. Every student in your Excel file will be assigned here.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select 
            label="Class" 
            options={(options.classes as any[]).map(c => ({label: c.name, value: c.id}))} 
            value={allocation.class_id} 
            onChange={e => {setAllocation({...allocation, class_id: e.target.value}); setPreview(null); setFile(null);}} 
          />
          <Select 
            label="Year" 
            options={[{label: '1st Year', value: '1st Year'}, {label: '2nd Year', value: '2nd Year'}, {label: '3rd Year', value: '3rd Year'}, {label: '4th Year', value: '4th Year'}]} 
            value={allocation.year} 
            onChange={e => {setAllocation({...allocation, year: e.target.value}); setPreview(null); setFile(null);}} 
          />
          <Select 
            label="Branch" 
            options={(options.branches as any[]).map(b => ({label: b.name, value: b.id}))} 
            value={allocation.branch_id} 
            onChange={e => {setAllocation({...allocation, branch_id: e.target.value}); setPreview(null); setFile(null);}} 
          />
          <Select 
            label="Section" 
            options={(options.sections as any[]).map(s => ({label: s.name, value: s.id}))} 
            value={allocation.section_id} 
            onChange={e => {setAllocation({...allocation, section_id: e.target.value}); setPreview(null); setFile(null);}} 
          />
        </div>

        {isAllocationComplete && (
          <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="text-blue-600" size={20} />
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Selected Academic Allocation</p>
              <p className="text-sm font-semibold text-slate-800">{getAllocationLabels()}</p>
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Excel Import */}
      <div className={`bg-white p-6 rounded-2xl border ${isAllocationComplete ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-60 pointer-events-none'} relative overflow-hidden transition-all duration-300`}>
        <div className={`absolute top-0 left-0 w-1.5 h-full ${isAllocationComplete ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isAllocationComplete ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>2</span>
          Upload Data
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <p className="text-sm text-slate-600">The Excel file must <b>not</b> contain Class, Year, Branch, or Section. The system will use your selection above.</p>
            <button 
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-300"
            >
              <Download size={16} /> Download Minimal Template
            </button>
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Excel / CSV File</label>
              <input 
                type="file" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={e => {setFile(e.target.files ? e.target.files[0] : null); setPreview(null);}}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors border border-slate-200 rounded-lg cursor-pointer"
              />
            </div>
            <Button onClick={handleValidate} disabled={!file || loading} className="w-full justify-center gap-2 mt-4">
              {loading ? 'Processing...' : <><FileSpreadsheet size={18} /> Preview & Validate</>}
            </Button>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-slate-900 text-white rounded-xl shadow-lg font-medium text-sm text-center">
          {message}
        </div>
      )}

      {/* STEP 3: Preview & Confirm */}
      {preview && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold text-amber-900 mb-1">Confirm Allocation Assignment</h3>
                <p className="text-sm text-amber-800">
                  All <b>{preview.valid_count}</b> valid students in this file will be permanently assigned to 
                  <br/><span className="font-mono bg-amber-100/50 px-2 py-1 rounded text-amber-900 mt-2 inline-block border border-amber-200/50">{getAllocationLabels()}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-green-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-green-50 border-b border-green-100 flex justify-between items-center">
                <span className="font-bold text-green-800 text-sm">Valid Records</span>
                <span className="px-2.5 py-0.5 bg-green-200 text-green-800 rounded-full text-xs font-bold">{preview.valid_count}</span>
              </div>
              <div className="p-4 max-h-60 overflow-y-auto text-sm">
                {preview.valid_rows.length === 0 ? (
                  <p className="text-slate-500 italic">No valid rows found.</p>
                ) : (
                  <ul className="space-y-2">
                    {preview.valid_rows.map((r: any, i: number) => (
                      <li key={i} className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                        <span className="font-medium text-slate-800">{r.name}</span>
                        <span className="text-slate-500 font-mono text-xs">{r.enrollment_no}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex justify-between items-center">
                <span className="font-bold text-red-800 text-sm">Errors</span>
                <span className="px-2.5 py-0.5 bg-red-200 text-red-800 rounded-full text-xs font-bold">{preview.error_count}</span>
              </div>
              <div className="p-4 max-h-60 overflow-y-auto text-sm">
                {preview.error_rows.length === 0 ? (
                  <p className="text-slate-500 italic">No errors found.</p>
                ) : (
                  <ul className="space-y-2">
                    {preview.error_rows.map((e: any, i: number) => (
                      <li key={i} className="text-red-600 border-b border-red-50 pb-2 last:border-0 last:pb-0">
                        <span className="font-bold">Row {e.row}:</span> {e.student} - {e.error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleImport} 
              disabled={loading || preview.valid_count === 0}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-lg shadow-green-600/20"
            >
              <CheckCircle2 className="mr-2" /> Confirm & Import {preview.valid_count} Students
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
