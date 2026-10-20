import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  User,
  LogOut,
  LayoutDashboard,
  FileUp,
  FileCheck,
  BookOpen,
  PlusCircle,
  Users,
  Layers,
  FileSpreadsheet,
  Activity,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-zinc-900 text-white border-zinc-900';
      case 'FACULTY':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'STUDENT':
        return 'bg-zinc-100 text-zinc-900 border-zinc-300';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 via-red-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-700/20 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-black">
                Integrity<span className="text-red-600">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] tracking-wider uppercase bg-red-50 text-red-700 border border-red-200 rounded font-semibold">
                Portal
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          {isAuthenticated && user && (
            <nav className="hidden md:flex items-center gap-1.5">
              {/* STUDENT LINKS */}
              {user.role === 'STUDENT' && (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/dashboard')
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-2xs font-bold'
                        : 'text-zinc-700 hover:text-red-700 hover:bg-red-50/50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/student/submissions"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/student/submissions')
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-2xs font-bold'
                        : 'text-zinc-700 hover:text-red-700 hover:bg-red-50/50'
                    }`}
                  >
                    <FileCheck className="w-4 h-4" />
                    My Submissions
                  </Link>
                  <Link
                    to="/student/submit"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/student/submit')
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-2xs font-bold'
                        : 'text-zinc-700 hover:text-red-700 hover:bg-red-50/50'
                    }`}
                  >
                    <FileUp className="w-4 h-4" />
                    Submit File
                  </Link>
                </>
              )}

              {/* FACULTY LINKS */}
              {user.role === 'FACULTY' && (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/dashboard')
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-2xs font-bold'
                        : 'text-zinc-700 hover:text-red-700 hover:bg-red-50/50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/faculty/assignments"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/faculty/assignments') && !isActive('/faculty/assignments/new')
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-2xs font-bold'
                        : 'text-zinc-700 hover:text-red-700 hover:bg-red-50/50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Assignments
                  </Link>
                  <Link
                    to="/faculty/assignments/new"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/faculty/assignments/new')
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-2xs font-bold'
                        : 'text-zinc-700 hover:text-red-700 hover:bg-red-50/50'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    New Assignment
                  </Link>
                </>
              )}

              {/* ADMIN LINKS */}
              {user.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/overview"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/admin/overview') || isActive('/dashboard')
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-2xs font-bold'
                        : 'text-zinc-700 hover:text-red-700 hover:bg-red-50/50'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    Overview
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/admin/users')
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-2xs font-bold'
                        : 'text-zinc-700 hover:text-red-700 hover:bg-red-50/50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Users
                  </Link>
                  <Link
                    to="/admin/submissions"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/admin/submissions')
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-2xs font-bold'
                        : 'text-zinc-700 hover:text-red-700 hover:bg-red-50/50'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Submissions
                  </Link>
                  <Link
                    to="/admin/reports"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/admin/reports')
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-2xs font-bold'
                        : 'text-zinc-700 hover:text-red-700 hover:bg-red-50/50'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Reports
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* User menu dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 shadow-2xs transition-all text-left"
                  >
                    <div className="hidden sm:block text-right">
                      <p className="text-xs font-bold text-black leading-tight">
                        {user.name || user.email.split('@')[0]}
                      </p>
                      <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono border font-semibold ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center justify-center font-bold text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-zinc-200 shadow-xl py-2 z-50 text-sm">
                        <div className="px-4 py-2 border-b border-zinc-100">
                          <p className="font-semibold text-black truncate">{user.name}</p>
                          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-zinc-700 hover:text-black hover:bg-zinc-50 transition-colors font-medium"
                        >
                          <User className="w-4 h-4 text-zinc-400" />
                          Profile & Settings
                        </Link>
                        <div className="border-t border-zinc-100 mt-1 pt-1">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-700 hover:bg-red-50 transition-colors text-left font-semibold"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-xl"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-zinc-700 hover:text-black transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-all shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && isAuthenticated && user && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-md">
          {user.role === 'STUDENT' && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-800 hover:text-red-700 hover:bg-red-50/60"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                Dashboard
              </Link>
              <Link
                to="/student/submissions"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-800 hover:text-red-700 hover:bg-red-50/60"
              >
                <FileCheck className="w-4 h-4 text-slate-500" />
                My Submissions
              </Link>
              <Link
                to="/student/submit"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-800 hover:text-red-700 hover:bg-red-50/60"
              >
                <FileUp className="w-4 h-4 text-slate-500" />
                Submit File
              </Link>
            </>
          )}

          {user.role === 'FACULTY' && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-800 hover:text-red-700 hover:bg-red-50/60"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                Dashboard
              </Link>
              <Link
                to="/faculty/assignments"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-800 hover:text-red-700 hover:bg-red-50/60"
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                My Assignments
              </Link>
              <Link
                to="/faculty/assignments/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-800 hover:text-red-700 hover:bg-red-50/60"
              >
                <PlusCircle className="w-4 h-4 text-slate-500" />
                New Assignment
              </Link>
            </>
          )}

          {user.role === 'ADMIN' && (
            <>
              <Link
                to="/admin/overview"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-800 hover:text-red-700 hover:bg-red-50/60"
              >
                <Activity className="w-4 h-4 text-slate-500" />
                System Overview
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-800 hover:text-red-700 hover:bg-red-50/60"
              >
                <Users className="w-4 h-4 text-slate-500" />
                User Management
              </Link>
              <Link
                to="/admin/submissions"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-800 hover:text-red-700 hover:bg-red-50/60"
              >
                <Layers className="w-4 h-4 text-slate-500" />
                All Submissions
              </Link>
              <Link
                to="/admin/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-800 hover:text-red-700 hover:bg-red-50/60"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                All Reports
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
