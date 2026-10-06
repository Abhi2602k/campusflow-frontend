import os
import json

def write_file(path, content):
    if os.path.dirname(path): os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')

API_TS = """
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post('http://127.0.0.1:8000/api/v1/auth/refresh', {}, { withCredentials: true });
        return api(originalRequest);
      } catch (e) {
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);
"""

AUTH_CONTEXT_TSX = """
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

type User = { id: string; email: string; name: string; role: 'ADMIN' | 'FACULTY' };
type AuthContextType = { user: User | null; loading: boolean; login: (data: any) => Promise<void>; logout: () => Promise<void> };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(res => setUser(res.data)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login = async (data: any) => {
    await api.post('/auth/login', data);
    const res = await api.get('/auth/me');
    setUser(res.data);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
"""

APP_TSX = """
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import MarkAttendance from './pages/faculty/MarkAttendance';
import Layout from './layouts/Layout';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return <>{children}</>;
};

const RootRouter = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" />;
  return <Navigate to="/faculty" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRouter />} />
          
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
          </Route>
          
          <Route path="/faculty" element={<ProtectedRoute role="FACULTY"><Layout /></ProtectedRoute>}>
            <Route index element={<FacultyDashboard />} />
            <Route path="attendance" element={<MarkAttendance />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
"""

LOGIN_TSX = """
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">College ERP Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Email</label>
            <input className="w-full px-3 py-2 border rounded" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Password</label>
            <input className="w-full px-3 py-2 border rounded" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
"""

LAYOUT_TSX = """
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold">Attendance ERP</div>
        <nav className="flex-1 px-2 space-y-1">
          {isAdmin ? (
            <>
              <Link to="/admin" className="block px-3 py-2 rounded hover:bg-gray-800">Dashboard</Link>
              {/* Other admin links */}
            </>
          ) : (
            <>
              <Link to="/faculty" className="block px-3 py-2 rounded hover:bg-gray-800">Dashboard</Link>
              <Link to="/faculty/attendance" className="block px-3 py-2 rounded hover:bg-gray-800">Mark Attendance</Link>
            </>
          )}
        </nav>
        <div className="p-4">
          <button onClick={logout} className="w-full bg-red-600 px-4 py-2 rounded font-bold hover:bg-red-700">Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
"""

ADMIN_DASHBOARD_TSX = """
import React, { useEffect, useState } from 'react';
import { api } from '../../api';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    api.get('/dashboard/admin').then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm font-bold uppercase">Total Students</h3>
          <p className="text-3xl font-bold">{data.total_students}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm font-bold uppercase">Total Faculty</h3>
          <p className="text-3xl font-bold">{data.total_faculty}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm font-bold uppercase">Today's Sessions</h3>
          <p className="text-3xl font-bold">{data.today_attendance?.marked}</p>
        </div>
      </div>
    </div>
  );
}
"""

FACULTY_DASHBOARD_TSX = """
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
      <h1 className="text-3xl font-bold mb-6">Faculty Dashboard</h1>
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
"""

MARK_ATTENDANCE_TSX = """
import React, { useState } from 'react';
import { api } from '../../api';

export default function MarkAttendance() {
  const [sectionId, setSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('1');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Simplified mockup for UI demonstration of strict backend testing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/attendance/sessions', {
        section_id: sectionId,
        subject_id: subjectId,
        date: date,
        period: parseInt(period),
        records: [] // Would normally be populated with students
      });
      setSuccess('Attendance saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error saving attendance');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mark Attendance</h1>
      <div className="bg-white p-6 rounded shadow max-w-lg">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Section ID</label>
            <input type="text" className="w-full px-3 py-2 border rounded" value={sectionId} onChange={e => setSectionId(e.target.value)} required placeholder="UUID" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Subject ID</label>
            <input type="text" className="w-full px-3 py-2 border rounded" value={subjectId} onChange={e => setSubjectId(e.target.value)} required placeholder="UUID" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Date</label>
            <input type="date" className="w-full px-3 py-2 border rounded" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Period</label>
            <input type="number" className="w-full px-3 py-2 border rounded" value={period} onChange={e => setPeriod(e.target.value)} required min="1" max="10" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">Save Attendance</button>
        </form>
      </div>
    </div>
  );
}
"""

TAILWIND_CONFIG = """
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
"""

MAIN_CSS = """
@tailwind base;
@tailwind components;
@tailwind utilities;
"""

def generate():
    write_file("src/api.ts", API_TS)
    write_file("src/context/AuthContext.tsx", AUTH_CONTEXT_TSX)
    write_file("src/App.tsx", APP_TSX)
    write_file("src/pages/Login.tsx", LOGIN_TSX)
    write_file("src/layouts/Layout.tsx", LAYOUT_TSX)
    write_file("src/pages/admin/AdminDashboard.tsx", ADMIN_DASHBOARD_TSX)
    write_file("src/pages/faculty/FacultyDashboard.tsx", FACULTY_DASHBOARD_TSX)
    write_file("src/pages/faculty/MarkAttendance.tsx", MARK_ATTENDANCE_TSX)
    write_file("tailwind.config.js", TAILWIND_CONFIG)
    write_file("src/index.css", MAIN_CSS)
    # Fix main.tsx to load App
    main_tsx = """import React from 'react'\\nimport ReactDOM from 'react-dom/client'\\nimport App from './App.tsx'\\nimport './index.css'\\n\\nReactDOM.createRoot(document.getElementById('root')!).render(\\n  <React.StrictMode>\\n    <App />\\n  </React.StrictMode>,\\n)\\n"""
    write_file("src/main.tsx", main_tsx)
    print("Frontend React scaffolding complete.")

if __name__ == "__main__":
    generate()
