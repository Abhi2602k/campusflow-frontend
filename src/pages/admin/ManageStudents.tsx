import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Search, Plus, Trash2, Edit, AlertCircle, Lock, BarChart3, ListFilter, CheckSquare } from 'lucide-react';

export default function ManageStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 50;
  const [resetUser, setResetUser] = useState<any>(null);
  const [resetting, setResetting] = useState(false);
  const [analyticsStudent, setAnalyticsStudent] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [options, setOptions] = useState<any>({ classes: [], branches: [], sections: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Filtering & Bulk Delete
  const [allocationFilter, setAllocationFilter] = useState({ class_id: '', year: '', branch_id: '', section_id: '' });
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'>('add');
  const [formData, setFormData] = useState<any>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);


  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(s => s.id));
    }
  };

  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!allocationFilter.class_id || !allocationFilter.year || !allocationFilter.branch_id || !allocationFilter.section_id) {
      alert("You must fully select the Academic Allocation (Class, Year, Branch, Section) at the top of the page before you can bulk delete.");
      return;
    }
    
    if (!window.confirm(`Delete ${selectedIds.length} Students?

This action will permanently delete the selected student records and their associated student data.`)) return;
    
    setBulkDeleting(true);
    try {
      const res = await api.post('/management/students/bulk-delete', {
        student_ids: selectedIds,
        allocation: allocationFilter
      });
      alert(res.data.message);
      setIsBulkDeleteMode(false);
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Bulk deletion failed");
    } finally {
      setBulkDeleting(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [stdRes, optRes] = await Promise.all([
        api.get(`/management/students?skip=${(page - 1) * limit}&limit=${limit}&search=${search}&class_id=${allocationFilter.class_id}&year=${allocationFilter.year}&branch_id=${allocationFilter.branch_id}&section_id=${allocationFilter.section_id}`),
        api.get('/management/options')
      ]);
      setStudents(stdRes.data.items);
        setTotal(stdRes.data.total);
      setOptions(optRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ name: '', email: '', enrollment_no: '', roll_number: '', class_id: '', year: '', branch_id: '', section_id: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (student: any) => {
    setModalMode('edit');
    setFormData({ ...student, class_id: options.classes.find((c:any) => c.name === student.class_name)?.id || '', branch_id: options.branches.find((b:any) => b.name === student.branch_name)?.id || '', section_id: options.sections.find((s:any) => s.name === student.section_name)?.id || '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setFormError('');
      if (modalMode === 'add') {
        await api.post('/management/students', formData);
      } else {
        await api.put(`/management/students/${formData.id}`, formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Replaced browser confirm with a nicer interaction if possible, but keep simple for now
    if (!confirm('Are you sure you want to remove this student?')) return;
    await api.delete(`/management/students/${id}`);
    loadData();
  };

  const filtered = students.filter(s => 
    (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.enrollment_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  
  
  const handleViewAnalytics = async (student: any) => {
    setAnalyticsStudent(student);
    setLoadingAnalytics(true);
    try {
      const res = await api.get(`/attendance/analytics/student/${student.id}`);
      setAnalyticsData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetUser) return;
    if (newPassword.length < 6) return alert("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return alert("Passwords do not match!");
    setResetting(true);
    try {
      await api.post(`/management/users/${resetUser.user_id || resetUser.id}/reset-password`, { new_password: newPassword });
      setResetUser(null);
      setNewPassword('');
      setConfirmPassword('');
      alert('Password successfully reset!');
      // Optional: show a success toast here
    } catch (err) {
      console.error(err);
      alert('Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">Manage Students</h1>
          <p className="text-muted-foreground mt-1">View, add, edit, and manage enrolled students.</p>
        </div>
        <Button className="gap-2" onClick={openAddModal}><Plus size={16} /> Add Student</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, email, or enrollment..." 
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition-colors"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground font-medium hidden sm:block">
              Showing {filtered.length} students
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted text-muted-foreground font-medium">
                <tr>
                  <th className="px-6 py-3 border-b border-border">Student</th>
                  <th className="px-6 py-3 border-b border-border">Academic Scope</th>
                  <th className="px-6 py-3 border-b border-border">Status</th>
                  <th className="px-6 py-3 border-b border-border text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={isBulkDeleteMode ? 5 : 4} className="px-6 py-12 text-center text-muted-foreground"><div className="animate-spin inline-block h-6 w-6 border-b-2 border-primary rounded-full mb-2"></div><p>Loading students...</p></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={isBulkDeleteMode ? 5 : 4} className="px-6 py-12 text-center text-muted-foreground">No students found matching your search.</td></tr>
                ) : filtered.map(s => (
                  <tr key={s.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{s.enrollment_no} - Roll {s.roll_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground">{s.class_name} ({s.year})</div>
                      <div className="text-xs text-muted-foreground">{s.branch_name} - Sec {s.section_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50" onClick={() => handleViewAnalytics(s)} title="View Analytics"><BarChart3 size={16} /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary" onClick={() => openEditModal(s)}><Edit size={16} /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-amber-500 hover:bg-amber-500/10" onClick={() => setResetUser(s)} title="Reset Password"><Lock size={16} /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(s.id)}><Trash2 size={16} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          
          </div>
          {total > limit && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-border mt-4">
              <span className="text-sm text-muted-foreground">Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} students</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * limit >= total}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>

      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalMode === 'add' ? 'Add New Student' : 'Edit Student'}
        description={modalMode === 'add' ? 'Fill out the details to enroll a new student.' : 'Update student information and academic scope.'}
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {formError}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
             <Input label="Full Name" placeholder="Jane Doe" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
             <Input label="Email Address" type="email" placeholder="jane@example.com" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Input label="Enrollment Number" placeholder="EN2026..." value={formData.enrollment_no || ''} onChange={e => setFormData({...formData, enrollment_no: e.target.value})} disabled={modalMode === 'edit'} />
             <Input label="Roll Number" type="number" placeholder="101" value={formData.roll_number || ''} onChange={e => setFormData({...formData, roll_number: e.target.value})} />
          </div>

          <div className="border-t border-border my-4 pt-4">
            <h4 className="text-sm font-semibold mb-3 text-foreground">Academic Allocation</h4>
            <div className="grid grid-cols-2 gap-4">
               <Select 
                 label="Program / Class" 
                 options={options.classes?.map((c:any) => ({label: c.name, value: c.id})) || []} 
                 value={formData.class_id || ''} 
                 onChange={e => setFormData({...formData, class_id: e.target.value})} 
               />
               <Select 
                 label="Year" 
                 options={[{label: '1st Year', value: '1st Year'}, {label: '2nd Year', value: '2nd Year'}, {label: '3rd Year', value: '3rd Year'}, {label: '4th Year', value: '4th Year'}]} 
                 value={formData.year || ''} 
                 onChange={e => setFormData({...formData, year: e.target.value})} 
               />
               <Select 
                 label="Branch" 
                 options={options.branches?.map((b:any) => ({label: b.name, value: b.id})) || []} 
                 value={formData.branch_id || ''} 
                 onChange={e => setFormData({...formData, branch_id: e.target.value})} 
               />
               <Select 
                 label="Section" 
                 options={options.sections?.map((s:any) => ({label: s.name, value: s.id})) || []} 
                 value={formData.section_id || ''} 
                 onChange={e => setFormData({...formData, section_id: e.target.value})} 
               />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={saving}>{modalMode === 'add' ? 'Enroll Student' : 'Save Changes'}</Button>
          </div>
        </div>
      </Modal>
    
      <Modal
        isOpen={!!resetUser}
        onClose={() => { setResetUser(null); setNewPassword(''); setConfirmPassword(''); }}
        title="Reset Password"
      >
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 text-muted-foreground">Email</label>
            <p className="text-md font-medium text-foreground">{resetUser?.email}</p>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 text-muted-foreground">New Password</label>
            <input type="password" placeholder="••••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border border-input rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 text-muted-foreground">Confirm Password</label>
            <input type="password" placeholder="••••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border border-input rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-border mt-4">
            <Button variant="outline" onClick={() => { setResetUser(null); setNewPassword(''); setConfirmPassword(''); }} disabled={resetting}>Cancel</Button>
            <Button variant="default" onClick={handleResetPassword} isLoading={resetting}>Reset Password</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!analyticsStudent}
        onClose={() => { setAnalyticsStudent(null); setAnalyticsData(null); }}
        title={`${analyticsStudent?.name}'s Attendance Analytics`}
        description="Detailed subject-wise attendance performance."
      >
        <div className="space-y-4 pt-4">
          {loadingAnalytics ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : analyticsData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg text-center border border-border">
                  <div className="text-2xl font-bold text-foreground">{analyticsData.overall_percentage}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Overall Attendance</div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center border border-border">
                  <div className="text-2xl font-bold text-green-500">{analyticsData.present_lectures}</div>
                  <div className="text-xs text-muted-foreground mt-1">Lectures Present</div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center border border-border">
                  <div className="text-2xl font-bold text-destructive">{analyticsData.absent_lectures}</div>
                  <div className="text-xs text-muted-foreground mt-1">Lectures Absent</div>
                </div>
              </div>
              
              {analyticsData.overall_percentage < 75 && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex gap-2 font-medium border border-destructive/20">
                  <AlertCircle size={18} className="shrink-0" /> Warning: Student is below the 75% attendance threshold.
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold mb-3 text-foreground">Subject-wise Breakdown</h4>
                <div className="space-y-3">
                  {analyticsData.subject_wise?.map((sub: any) => (
                    <div key={sub.name} className="p-3 border border-border rounded-lg bg-background">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm text-foreground">{sub.name}</span>
                        <span className={`text-sm font-bold ${sub.percentage < 75 ? 'text-destructive' : 'text-green-500'}`}>{sub.percentage}%</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${sub.percentage < 75 ? 'bg-destructive' : 'bg-green-500'}`} style={{ width: `${sub.percentage}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground font-mono">
                        <span>P: {sub.present} / A: {(sub.total - sub.present)}</span>
                        <span>Total: {sub.total} classes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">No analytics data found.</div>
          )}
          <div className="flex justify-end pt-4 border-t border-border mt-4">
            <Button variant="outline" onClick={() => { setAnalyticsStudent(null); setAnalyticsData(null); }}>Close</Button>
          </div>
        </div>
      </Modal>
</div>
  );
}

