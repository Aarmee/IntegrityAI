import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/axios';
import {
  User as UserIcon,
  Shield,
  Mail,
  Calendar,
  Hash,
  RefreshCw,
  CheckCircle2,
  Phone,
  GraduationCap,
  Briefcase,
  Building,
  Edit3,
  Save,
  X,
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

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

export const ProfilePage: React.FC = () => {
  const { user, refreshUserProfile, updateProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRoll, setEditRoll] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [editSemester, setEditSemester] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editFacultyCourses, setEditFacultyCourses] = useState<string[]>([]);
  const [editFacultySemesters, setEditFacultySemesters] = useState<string[]>([]);
  const [customCourseInput, setCustomCourseInput] = useState('');
  const [availableCoursesList, setAvailableCoursesList] = useState<string[]>(COMPREHENSIVE_COURSES);
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await authApi.getUserById(user.userId);
        setProfileData(data);
        initEditState(data || user);
      } catch (err) {
        console.warn('Could not fetch user by ID:', err);
        initEditState(user);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.userId]);

  const initEditState = (u: any) => {
    if (!u) return;
    setEditName(u.name || '');
    setEditPhone(u.phoneNumber || '');
    setEditRoll(u.rollNumber || '');
    setEditCourse(u.course || COMPREHENSIVE_COURSES[0]);
    setEditSemester(u.semester || ALL_SEMESTERS[0]);
    setEditDept(u.department || 'Department of Computer Science & Engineering');

    // Faculty courses & semesters
    if (u.role === 'FACULTY') {
      if (u.course) {
        setEditFacultyCourses(u.course.split(',').map((s: string) => s.trim()).filter(Boolean));
      } else {
        setEditFacultyCourses([COMPREHENSIVE_COURSES[0]]);
      }

      if (u.semester) {
        setEditFacultySemesters(u.semester.split(',').map((s: string) => s.trim()).filter(Boolean));
      } else {
        setEditFacultySemesters(['Semester 4', 'Semester 6']);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUserProfile();
    if (user?.userId) {
      try {
        const data = await authApi.getUserById(user.userId);
        setProfileData(data);
        initEditState(data);
        success('Profile data synchronized.');
      } catch (err) {
        console.error(err);
      }
    }
    setRefreshing(false);
  };

  const toggleFacultyCourse = (c: string) => {
    if (editFacultyCourses.includes(c)) {
      setEditFacultyCourses(editFacultyCourses.filter((item) => item !== c));
    } else {
      setEditFacultyCourses([...editFacultyCourses, c]);
    }
  };

  const toggleFacultySemester = (s: string) => {
    if (editFacultySemesters.includes(s)) {
      setEditFacultySemesters(editFacultySemesters.filter((item) => item !== s));
    } else {
      setEditFacultySemesters([...editFacultySemesters, s]);
    }
  };

  const toggleAllSemesters = () => {
    if (editFacultySemesters.length === ALL_SEMESTERS.length) {
      setEditFacultySemesters([]);
    } else {
      setEditFacultySemesters([...ALL_SEMESTERS]);
    }
  };

  const handleAddCustomCourse = () => {
    const trimmed = customCourseInput.trim();
    if (!trimmed) return;
    if (!availableCoursesList.includes(trimmed)) {
      setAvailableCoursesList([...availableCoursesList, trimmed]);
    }
    if (!editFacultyCourses.includes(trimmed)) {
      setEditFacultyCourses([...editFacultyCourses, trimmed]);
    }
    setCustomCourseInput('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({
        name: editName,
        phoneNumber: editPhone,
        rollNumber: effectiveUser?.role === 'STUDENT' ? editRoll : undefined,
        course: effectiveUser?.role === 'STUDENT' ? editCourse : editFacultyCourses.join(', '),
        semester: effectiveUser?.role === 'STUDENT' ? editSemester : editFacultySemesters.join(', '),
        department: effectiveUser?.role === 'FACULTY' ? editDept : undefined,
        assignedCourses: effectiveUser?.role === 'FACULTY'
          ? `Courses: ${editFacultyCourses.join(', ')} | Semesters: ${editFacultySemesters.join(', ')}`
          : undefined,
        password: editPassword ? editPassword : undefined,
      });

      // Reload fresh profile
      if (user?.userId) {
        const data = await authApi.getUserById(user.userId);
        setProfileData(data);
      }

      setIsEditing(false);
      setEditPassword('');
      success('Academic profile updated successfully!');
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      toastError(`Failed to update profile: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Loading profile details..." />;
  }

  const effectiveUser = profileData || user;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-white border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-red-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm border border-red-700">
            {effectiveUser?.name ? effectiveUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-black">{effectiveUser?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200">
                {effectiveUser?.role}
              </span>
            </div>
            <p className="text-sm text-zinc-600 mt-1 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-zinc-400" />
              {effectiveUser?.email}
            </p>
            {effectiveUser?.phoneNumber && (
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                {effectiveUser.phoneNumber}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold border border-zinc-300 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {/* Editing Modal / Card */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="p-8 rounded-3xl bg-white border-2 border-red-600/30 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div>
              <h2 className="text-lg font-bold text-black flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-red-600" />
                Edit Academic & Contact Information
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Update your semester, enrolled degree, or faculty department scopes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-black text-sm focus:outline-none focus:border-red-600 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-black text-sm focus:outline-none focus:border-red-600 shadow-xs"
              />
            </div>
          </div>

          {effectiveUser?.role === 'STUDENT' ? (
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <div className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                Student Enrollment Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Roll Number / Student ID
                  </label>
                  <input
                    type="text"
                    value={editRoll}
                    onChange={(e) => setEditRoll(e.target.value)}
                    placeholder="e.g. 21BCE042"
                    className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-black font-mono text-sm focus:outline-none focus:border-red-600 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Degree / Course
                  </label>
                  <select
                    value={editCourse}
                    onChange={(e) => setEditCourse(e.target.value)}
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
                    value={editSemester}
                    onChange={(e) => setEditSemester(e.target.value)}
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
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <div className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                Faculty Academic Teaching Scope
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Academic Department
                </label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-black text-sm focus:outline-none focus:border-red-600 shadow-xs"
                />
              </div>

              {/* SEPARATE 1: DEGREE PROGRAMS / COURSES TAUGHT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-800">
                    1. Degree Programs / Courses Taught (Select Multiple)
                  </label>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {editFacultyCourses.length} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                  {availableCoursesList.map((c) => {
                    const isSelected = editFacultyCourses.includes(c);
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

                {/* Add Custom Course */}
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
                    {editFacultySemesters.length === ALL_SEMESTERS.length ? 'Clear All' : 'Select All Semesters'}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {ALL_SEMESTERS.map((s) => {
                    const isSelected = editFacultySemesters.includes(s);
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
            </div>
          )}

          {/* Optional Password Update */}
          <div className="pt-4 border-t border-zinc-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
              Change Password (Leave blank to keep unchanged)
            </label>
            <input
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="Enter new password (optional)"
              className="w-full max-w-sm px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-black text-sm focus:outline-none focus:border-red-600 shadow-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Profile Card */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-black flex items-center gap-2">
            {effectiveUser?.role === 'STUDENT' ? (
              <GraduationCap className="w-5 h-5 text-red-600" />
            ) : (
              <Briefcase className="w-5 h-5 text-red-600" />
            )}
            {effectiveUser?.role === 'STUDENT' ? 'Academic Enrollment' : 'Faculty Course Allocations'}
          </h2>

          <div className="space-y-3 text-sm">
            {effectiveUser?.role === 'STUDENT' ? (
              <>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-xs text-zinc-500 block font-medium">Roll Number / Student ID</span>
                  <span className="font-mono text-sm font-bold text-zinc-900 mt-0.5 block">
                    {effectiveUser?.rollNumber || 'Not set (Click Edit Profile)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-xs text-zinc-500 block font-medium">Enrolled Course / Degree</span>
                  <span className="text-xs font-bold text-zinc-900 mt-0.5 block">
                    {effectiveUser?.course || 'B.Tech Computer Science & Engineering'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-xs text-zinc-500 block font-medium">Current Semester</span>
                  <span className="text-xs font-bold text-red-700 mt-0.5 block">
                    {effectiveUser?.semester || 'Semester 4'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-xs text-zinc-500 block font-medium">Academic Department</span>
                  <span className="text-xs font-bold text-zinc-900 mt-0.5 block">
                    {effectiveUser?.department || 'Department of Computer Science & Engineering'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-xs text-zinc-500 block font-medium">Courses & Degree Programs Taught</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {effectiveUser?.course ? (
                      effectiveUser.course.split(',').map((c: string) => (
                        <span key={c} className="px-2 py-0.5 rounded bg-red-50 text-red-800 text-[11px] font-semibold border border-red-200">
                          {c.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400 italic">None assigned yet</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-xs text-zinc-500 block font-medium">Teaching Semesters</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {effectiveUser?.semester ? (
                      effectiveUser.semester.split(',').map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[11px] font-semibold border border-zinc-200">
                          {s.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400 italic">None assigned yet</span>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-xs text-zinc-500 block font-medium">Registered Contact Phone</span>
              <span className="text-xs font-semibold text-zinc-800 mt-0.5 block">
                {effectiveUser?.phoneNumber || 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        {/* Identity & Claims */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-black flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            Security & System Identifier
          </h2>

          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-xs text-zinc-500 block font-medium">User System UUID</span>
              <span className="font-mono text-xs text-zinc-800 break-all select-all font-semibold block mt-0.5">
                {effectiveUser?.userId || 'N/A'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-xs text-zinc-500 block font-medium">Registered On</span>
              <span className="text-xs text-zinc-800 flex items-center gap-1.5 mt-0.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                {formatDate(effectiveUser?.createdAt)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-xs text-zinc-500 block font-medium">Account Status</span>
              <span className="text-xs text-black flex items-center gap-1.5 mt-0.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Active & Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
