import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, BookOpen, GraduationCap, UserCheck, CalendarCheck, FileBarChart, PieChart, Shield, LogOut, Megaphone, ShieldAlert, BarChart3, Menu, Bell, User } from 'lucide-react';
import { cn } from '../components/ui/Button';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
    return (
      <Link 
        to={to} 
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
          isActive 
            ? "bg-blue-600 text-white font-semibold shadow-md" 
            : "text-slate-400 hover:bg-slate-800 hover:text-white font-medium"
        )}
      >
        <Icon size={18} className={cn(isActive ? "text-white" : "text-slate-400")} />
        {label}
      </Link>
    );
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="px-3 mt-6 mb-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase mt-8">
      {children}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] bg-slate-900 border-r border-slate-800 dark:border-gray-800 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-2 h-16 px-6 border-b border-slate-800 bg-slate-950">
          <div className="w-8 h-8 bg-blue-500 shadow-lg shadow-blue-500/20 rounded-lg flex items-center justify-center shadow-inner">
            <GraduationCap className="text-white" size={18} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight dark:from-white dark:to-gray-300 bg-clip-text text-transparent">CampusFlow</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {isAdmin ? (
            <>
              <SectionTitle>Main</SectionTitle>
              <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
              
              <SectionTitle>Academics</SectionTitle>
              <NavItem to="/admin/subjects" icon={BookOpen} label="Subjects" />
              <NavItem to="/admin/branches" icon={BookOpen} label="Branches" />
              <NavItem to="/admin/classes" icon={GraduationCap} label="Classes" />
              <NavItem to="/admin/years" icon={CalendarCheck} label="Academic Sessions" />
              <NavItem to="/admin/sections" icon={LayoutDashboard} label="Sections" />
              <NavItem to="/admin/faculty" icon={UserCheck} label="Faculty" />
              <NavItem to="/admin/students" icon={Users} label="Students" />
              <NavItem to="/admin/assignments" icon={FileBarChart} label="Faculty Assignment" />
              
              <SectionTitle>Administration</SectionTitle>
              <NavItem to="/admin/import-students" className="hidden" icon={Users} label="Bulk Import" />
              <NavItem to="/admin/program-leaders" icon={Shield} label="Program Leaders" />
              <NavItem to="/admin/reports" icon={PieChart} label="Reports" />
            </>
          ) : user?.role === 'STUDENT' ? (
             <>
               <SectionTitle>Main</SectionTitle>
               <NavItem to="/student" icon={PieChart} label="My Attendance" />
               <NavItem to="/student/marks" icon={FileBarChart} label="My Report Card" />
               <NavItem to="/student/notices" icon={Megaphone} label="Notices" />
             </>
          ) : (
            <>
              <SectionTitle>Faculty Panel</SectionTitle>
              <NavItem to="/faculty" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/faculty/attendance" icon={CalendarCheck} label="Mark Attendance" />
              <NavItem to="/faculty/marks" icon={FileBarChart} label="Manage Marks" />
              <NavItem to="/faculty/reports" icon={FileBarChart} label="My Reports" />
              <NavItem to="/faculty/notices" icon={Megaphone} label="Notices" />
            </>
          )}

          {user?.role === 'PROGRAM_LEADER' && (
            <>
              <SectionTitle>Program Leader</SectionTitle>
              <NavItem to="/faculty/students" icon={Users} label="Manage Students" />
              <NavItem to="/faculty/assignments" icon={UserCheck} label="Manage Assignments" />
              <NavItem to="/faculty/attendance" icon={CalendarCheck} label="Attendance Mgmt" />
              <NavItem to="/faculty/analytics" icon={BarChart3} label="Class Analytics" />
              <NavItem to="/faculty/manage-notices" icon={Megaphone} label="Manage Notices" />
              <NavItem to="/faculty/reports" icon={PieChart} label="Section Reports" />
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-800/50 mb-3 border border-slate-700 dark:border-gray-800">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 dark:text-blue-300 font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold text-slate-300 hover:text-red-400 hover:bg-slate-800 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Navbar */}
        <header className="h-14 bg-white border-b border-gray-200/60 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={18} />
            </button>
            
            <nav className="hidden md:flex text-sm font-medium text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-2">
                <li className="inline-flex items-center">
                  <span className="text-slate-900 capitalize">
                    {location.pathname.split('/')[1] || 'Dashboard'}
                  </span>
                </li>
                {location.pathname.split('/').length > 2 && (
                  <>
                    <li><span className="mx-2 text-gray-400">/</span></li>
                    <li className="text-blue-600 dark:text-blue-400 capitalize">
                      {location.pathname.split('/')[2].replace('-', ' ')}
                    </li>
                  </>
                )}
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden">
               <User size={16} className="text-gray-500" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
