import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../api/axios';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Phone,
  BookOpen,
  Hash,
  Building,
} from 'lucide-react';

const COMPREHENSIVE_COURSES = [
  'B.Tech - Computer Science & Engineering',
  'B.Tech - Information Technology',
  'B.Tech - AI & Data Science',
  'B.Tech - Electronics & Communication',
  'B.Tech - Mechanical Engineering',
  'B.Tech - Civil Engineering',
  'BCA - Bachelor of Computer Applications',
  'MCA - Master of Computer Applications',
  'M.Tech - Computer Science & Engineering',
  'M.Sc - Data Science / IT',
];

const ALL_SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success, error: toastError } = useToast();

  const [role, setRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Student specific
  const [rollNumber, setRollNumber] = useState('');
  const [course, setCourse] = useState(COMPREHENSIVE_COURSES[0]);
  const [semester, setSemester] = useState(ALL_SEMESTERS[0]);

  // Faculty specific - Separated Courses and Semesters
  const [department, setDepartment] = useState('Department of Computer Science & Engineering');
  const [facultyCourses, setFacultyCourses] = useState<string[]>([
    'B.Tech - Computer Science & Engineering',
  ]);
  const [facultySemesters, setFacultySemesters] = useState<string[]>([
    'Semester 4',
    'Semester 6',
  ]);
  const [customCourseInput, setCustomCourseInput] = useState('');
  const [availableCoursesList, setAvailableCoursesList] = useState<string[]>(COMPREHENSIVE_COURSES);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleFacultyCourse = (c: string) => {
    if (facultyCourses.includes(c)) {
      setFacultyCourses(facultyCourses.filter((item) => item !== c));
    } else {
      setFacultyCourses([...facultyCourses, c]);
    }
  };

  const toggleFacultySemester = (s: string) => {
    if (facultySemesters.includes(s)) {
      setFacultySemesters(facultySemesters.filter((item) => item !== s));
    } else {
      setFacultySemesters([...facultySemesters, s]);
    }
  };

  const toggleAllSemesters = () => {
    if (facultySemesters.length === ALL_SEMESTERS.length) {
      setFacultySemesters([]);
    } else {
      setFacultySemesters([...ALL_SEMESTERS]);
    }
  };

  const handleAddCustomCourse = () => {
    const trimmed = customCourseInput.trim();
    if (!trimmed) return;
    if (!availableCoursesList.includes(trimmed)) {
      setAvailableCoursesList([...availableCoursesList, trimmed]);
    }
    if (!facultyCourses.includes(trimmed)) {
      setFacultyCourses([...facultyCourses, trimmed]);
    }
    setCustomCourseInput('');
  };

  const passwordCriteria = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'Number (0-9)', met: /[0-9]/.test(password) },
    { label: 'Special symbol (@, #, $, %, etc.)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const metCount = passwordCriteria.filter((c) => c.met).length;
  let strengthLabel = 'Very Weak';
  let strengthColor = 'bg-red-500';
  let strengthTextColor = 'text-red-600';
  let strengthPercent = 20;

  if (metCount === 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    strengthTextColor = 'text-emerald-600';
    strengthPercent = 100;
  } else if (metCount >= 4) {
    strengthLabel = 'Good';
    strengthColor = 'bg-blue-500';
    strengthTextColor = 'text-blue-600';
    strengthPercent = 80;
  } else if (metCount >= 3) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-amber-500';
    strengthTextColor = 'text-amber-600';
    strengthPercent = 60;
  } else if (metCount >= 1) {
    strengthLabel = 'Weak';
    strengthColor = 'bg-red-500';
    strengthTextColor = 'text-red-600';
    strengthPercent = 35;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('The passwords entered do not match. Please verify that both password fields are identical.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password is too short. It must contain at least 8 characters.');
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMsg('Please choose a stronger password containing uppercase letters, lowercase letters, and numbers.');
      return;
    }

    if (phoneNumber && phoneNumber.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (role === 'STUDENT' && !rollNumber.trim()) {
      setErrorMsg('Please enter your university student roll number or ID.');
      return;
    }

    if (role === 'FACULTY' && facultyCourses.length === 0) {
      setErrorMsg('Please select at least one degree program or course that you teach.');
      return;
    }

    if (role === 'FACULTY' && facultySemesters.length === 0) {
      setErrorMsg('Please select at least one teaching semester.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      await register({
        name,
        email,
        password,
        role,
        phoneNumber,
        rollNumber: role === 'STUDENT' ? rollNumber.trim() : undefined,
        course: role === 'STUDENT' ? course : facultyCourses.join(', '),
        semester: role === 'STUDENT' ? semester : facultySemesters.join(', '),
        department: role === 'FACULTY' ? department : undefined,
        assignedCourses: role === 'FACULTY'
          ? `Courses: ${facultyCourses.join(', ')} | Semesters: ${facultySemesters.join(', ')}`
          : undefined,
      });

      success('Account registered successfully! Please log in.');
      navigate('/login');
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-8">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-700 via-red-600 to-red-500 flex items-center justify-center text-white mx-auto shadow-md shadow-red-700/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-black">
            Create an Account
          </h1>
          <p className="text-sm text-zinc-500 font-medium">
            Join the IntegrityAI Academic Evaluation Platform
          </p>
        </div>

        {/* Container */}
        <div className="p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                    role === 'STUDENT'
                      ? 'bg-zinc-900 border-black text-white shadow-2xs'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-red-500" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('FACULTY')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                    role === 'FACULTY'
                      ? 'bg-red-600 border-red-700 text-white shadow-2xs'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-red-200" />
                  Faculty
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarmee Patel"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-black placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-black placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Phone Number
                  </label>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {phoneNumber.length}/10 digits
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210 (10 digits)"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-black placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Role Specific Fields */}
            {role === 'STUDENT' ? (
              <div className="space-y-3 pt-2 border-t border-zinc-100">
                <div className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Student Academic Enrollment
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Roll Number / Student ID *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Hash className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. 21BCE042"
                      required={role === 'STUDENT'}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-300 rounded-xl text-black text-sm font-mono focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Degree / Course
                    </label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-black text-xs font-semibold focus:outline-none focus:border-red-600 shadow-xs"
                    >
                      {COMPREHENSIVE_COURSES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Current Semester
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-black text-xs font-semibold focus:outline-none focus:border-red-600 shadow-xs"
                    >
                      {ALL_SEMESTERS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2 border-t border-zinc-100">
                <div className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Faculty Teaching Scope
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Academic Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-300 rounded-xl text-black text-sm focus:outline-none focus:border-red-600 shadow-xs"
                    />
                  </div>
                </div>

                {/* SEPARATE 1: DEGREE PROGRAMS / COURSES TAUGHT */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-zinc-800">
                      1. Degree Programs / Courses Taught (Select Multiple)
                    </label>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {facultyCourses.length} selected
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                    {availableCoursesList.map((c) => {
                      const isSelected = facultyCourses.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleFacultyCourse(c)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                            isSelected
                              ? 'bg-red-600 text-white font-bold shadow-xs'
                              : 'bg-white text-zinc-700 border border-zinc-300 hover:border-zinc-400'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {c}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Course / Subject */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customCourseInput}
                      onChange={(e) => setCustomCourseInput(e.target.value)}
                      placeholder="Add custom course or subject..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-red-600"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomCourse();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCourse}
                      className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold border border-zinc-300 transition-colors"
                    >
                      + Add Course
                    </button>
                  </div>
                </div>

                {/* SEPARATE 2: TEACHING SEMESTERS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-zinc-800">
                      2. Teaching Semesters (Select Multiple)
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllSemesters}
                      className="text-[11px] text-red-600 hover:text-red-800 font-bold"
                    >
                      {facultySemesters.length === ALL_SEMESTERS.length ? 'Clear All' : 'Select All Semesters'}
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {ALL_SEMESTERS.map((s) => {
                      const isSelected = facultySemesters.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleFacultySemester(s)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                            isSelected
                              ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                              : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}
                          {s.replace('Semester ', 'Sem ')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Combined Live Scope Preview */}
                {(facultyCourses.length > 0 || facultySemesters.length > 0) && (
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                    <div className="font-bold text-zinc-800">Faculty Assigned Scope:</div>
                    <div className="text-zinc-600">
                      <strong>Courses:</strong> {facultyCourses.length ? facultyCourses.join(', ') : 'None'}
                    </div>
                    <div className="text-zinc-600">
                      <strong>Semesters:</strong> {facultySemesters.length ? facultySemesters.map(s => s.replace('Semester ', 'Sem ')).join(', ') : 'None'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Passwords & Strength Meter */}
            <div className="space-y-3 pt-2 border-t border-zinc-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-black placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-black placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Live Password Strength Meter and Missing Element Checklist */}
              {password.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-600">Password Strength:</span>
                    <span className={`font-bold ${strengthTextColor}`}>
                      {strengthLabel}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: `${strengthPercent}%` }}
                    />
                  </div>

                  {/* Missing elements checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {passwordCriteria.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 text-[11px] ${
                          item.met ? 'text-emerald-700 font-semibold' : 'text-zinc-500'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            item.met ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-500'
                          }`}
                        >
                          {item.met ? '✓' : '✗'}
                        </span>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-zinc-100">
            <p className="text-xs text-zinc-600 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-red-600 hover:underline font-bold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
