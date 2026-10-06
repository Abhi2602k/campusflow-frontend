import ManageProgramLeaders from './pages/admin/ManageProgramLeaders';
import Reports from './pages/Reports';
import BulkStudentImport from './pages/admin/BulkStudentImport';
import BulkFacultyImport from './pages/admin/BulkFacultyImport';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import SuperadminDashboard from './pages/superadmin/SuperadminDashboard';
import ManageAdmins from './pages/superadmin/ManageAdmins';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import MarkAttendance from './pages/faculty/MarkAttendance';
import ManageStudents from './pages/admin/ManageStudents';
import ManageSubjects from './pages/admin/ManageSubjects';
import ManageBranches from './pages/admin/ManageBranches';
import ManageClasses from './pages/admin/ManageClasses';
import ManageYears from './pages/admin/ManageYears';
import ManageSections from './pages/admin/ManageSections';
import ManageFaculty from './pages/admin/ManageFaculty';
import ManageAssignments from './pages/admin/ManageAssignments';
import StudentDashboard from './pages/student/StudentDashboard';
import Layout from './layouts/Layout';
import ManageMarks from './pages/faculty/ManageMarks';
import MyMarks from './pages/student/MyMarks';
import ViewReportCard from './pages/faculty/ViewReportCard';

import AuditLogs from './pages/admin/AuditLogs';
import PLAnalytics from './pages/admin/PLAnalytics';
import ManageNotices from './pages/pl/ManageNotices';
import ViewNotices from './pages/shared/ViewNotices';


const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

const RootRouter = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'SUPERADMIN') return <Navigate to="/superadmin/dashboard" />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" />;
  if (user.role === 'STUDENT') return <Navigate to="/student" />;
  return <Navigate to="/faculty" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRouter />} />
          
          <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['SUPERADMIN']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<SuperadminDashboard />} />
            <Route path="admins" element={<ManageAdmins />} />
          </Route>
          
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="import-students" element={<BulkStudentImport />} />
            <Route path="subjects" element={<ManageSubjects />} />
            <Route path="branches" element={<ManageBranches />} />
            <Route path="classes" element={<ManageClasses />} />
            <Route path="years" element={<ManageYears />} />
            <Route path="sections" element={<ManageSections />} />
            <Route path="faculty" element={<ManageFaculty />} />
            <Route path="faculty/import" element={<BulkFacultyImport />} />
            <Route path="program-leaders" element={<ManageProgramLeaders />} />
            <Route path="assignments" element={<ManageAssignments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>
          
          <Route path="/pl" element={<ProtectedRoute allowedRoles={['PROGRAM_LEADER']}><Layout /></ProtectedRoute>}>
            <Route path="analytics" element={<PLAnalytics />} />
            <Route path="notices" element={<ManageNotices />} />
          </Route>
          
          <Route path="/faculty" element={<ProtectedRoute allowedRoles={['FACULTY', 'PROGRAM_LEADER']}><Layout /></ProtectedRoute>}>
            <Route index element={<FacultyDashboard />} />
            <Route path="attendance" element={<MarkAttendance />} />
            <Route path="marks" element={<ManageMarks />} />
            <Route path="student/:id/report-card" element={<ViewReportCard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="assignments" element={<ManageAssignments />} />
            <Route path="notices" element={<ViewNotices />} />
            <Route path="analytics" element={<PLAnalytics />} />
            <Route path="manage-notices" element={<ManageNotices />} />
          </Route>
          
          <Route path="/student" element={<ProtectedRoute allowedRoles={['STUDENT']}><Layout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="marks" element={<MyMarks />} />
            <Route path="notices" element={<ViewNotices />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
