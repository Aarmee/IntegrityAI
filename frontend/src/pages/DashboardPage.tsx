import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submissionApi } from '../api/submissionApi';
import { assignmentApi } from '../api/assignmentApi';
import { reportApi } from '../api/reportApi';
import { Submission, Assignment, Report } from '../types';
import { SystemOverviewPage } from './admin/SystemOverviewPage';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  LayoutDashboard,
  FileUp,
  FileCheck,
  BookOpen,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Student specific data
  const [studentSubmissions, setStudentSubmissions] = useState<Submission[]>([]);
  const [studentAssignmentsMap, setStudentAssignmentsMap] = useState<Record<string, Assignment>>({});
  const [studentLatestReport, setStudentLatestReport] = useState<Report | null>(null);
  const [studentReportsMap, setStudentReportsMap] = useState<Record<string, Report>>({});

  // Faculty specific data
  const [facultyAssignments, setFacultyAssignments] = useState<Assignment[]>([]);
  const [facultySubmissionsCount, setFacultySubmissionsCount] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);

        if (user.role === 'STUDENT' && user.userId) {
          const [subs, allAssigns] = await Promise.all([
            submissionApi.getSubmissionsByStudent(user.userId),
            assignmentApi.getAllAssignments().catch(() => [] as Assignment[]),
          ]);
          const sortedSubs = [...subs].sort(
            (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          );
          setStudentSubmissions(sortedSubs);

          const aMap: Record<string, Assignment> = {};
          allAssigns.forEach((a) => {
            aMap[a.assignmentId] = a;
          });
          setStudentAssignmentsMap(aMap);

          // Fetch reports for submissions
          const rMap: Record<string, Report> = {};
          await Promise.all(
            sortedSubs.slice(0, 20).map(async (s) => {
              try {
                const rep = await reportApi.getReportBySubmission(s.submissionId);
                if (rep) {
                  rMap[s.submissionId] = rep;
                }
              } catch {
                // no report
              }
            })
          );
          setStudentReportsMap(rMap);

          // Find latest non-draft final submission for latest evaluation card
          const nonDrafts = sortedSubs.filter((s) => !s.isDraft);
          const latestFinal = nonDrafts.length > 0 ? nonDrafts[0] : null;
          if (latestFinal && rMap[latestFinal.submissionId]) {
            setStudentLatestReport(rMap[latestFinal.submissionId]);
          } else if (sortedSubs.length > 0 && rMap[sortedSubs[0].submissionId]) {
            setStudentLatestReport(rMap[sortedSubs[0].submissionId]);
          }
        } else if (user.role === 'FACULTY' && user.userId) {
          const assigns = await assignmentApi.getAssignmentsByFaculty(user.userId);
          setFacultyAssignments(assigns);

          let count = 0;
          await Promise.all(
            assigns.map(async (a) => {
              try {
                const s = await submissionApi.getSubmissionsByAssignment(a.assignmentId);
                // Count unique students who submitted a final submission
                const nonDrafts = s.filter((sub) => !sub.isDraft);
                const uniqueStudents = new Set(nonDrafts.map((sub) => sub.studentId));
                count += uniqueStudents.size;
              } catch {
                // ignore
              }
            })
          );
          setFacultySubmissionsCount(count);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Strictly official/final submissions (excludes pre-flight drafts; 1 active final per assignment)
  // Hooks MUST be called before any conditional returns
  const finalStudentSubmissions = React.useMemo(() => {
    const nonDrafts = studentSubmissions.filter((s) => !s.isDraft);
    const map = new Map<string, Submission>();
    const sorted = [...nonDrafts].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    for (const sub of sorted) {
      if (!map.has(sub.assignmentId)) {
        map.set(sub.assignmentId, sub);
      }
    }
    return Array.from(map.values());
  }, [studentSubmissions]);

  const draftStudentSubmissionsCount = React.useMemo(() => {
    return studentSubmissions.filter((s) => Boolean(s.isDraft)).length;
  }, [studentSubmissions]);

  // If Admin, display the full system overview!
  if (user?.role === 'ADMIN') {
    return <SystemOverviewPage />;
  }

  if (loading) {
    return <LoadingSpinner fullPage text="Loading dashboard..." />;
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  // -------------------------------------------------------------
  // STUDENT DASHBOARD VIEW (White, Blood Red & Black Theme)
  // -------------------------------------------------------------
  if (user?.role === 'STUDENT') {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Hero Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-red-50/70 via-white to-zinc-50 border border-zinc-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-900 text-white">
                Student Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black mt-2 tracking-tight">
              Welcome, {user.name}!
            </h1>
            <p className="text-sm text-zinc-600 mt-1 max-w-xl leading-relaxed">
              Upload your assignments to verify academic integrity, preview similarity scores, and review AI detection findings before submission.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/student/submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm transition-all shadow-xs"
            >
              <FileUp className="w-4 h-4" />
              Submit File
            </Link>
            <Link
              to="/student/submissions"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-black font-semibold text-sm transition-colors border border-zinc-300 shadow-2xs"
            >
              <FileCheck className="w-4 h-4 text-zinc-500" />
              View Submissions
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Official Submissions
              </span>
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-black mt-2">
              {finalStudentSubmissions.length}
            </p>
            <div className="flex items-center justify-between text-xs mt-3">
              <Link
                to="/student/submissions"
                className="flex items-center gap-1 text-red-600 font-bold hover:underline"
              >
                View history <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              {draftStudentSubmissionsCount > 0 && (
                <Link
                  to="/student/submissions"
                  className="text-amber-700 hover:text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]"
                  title="View pre-flight drafts in progress"
                >
                  {draftStudentSubmissionsCount} {draftStudentSubmissionsCount === 1 ? 'draft' : 'drafts'}
                </Link>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Latest Evaluation
              </span>
              <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200">
                <Sparkles className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="mt-2">
              {studentLatestReport ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-black">
                    {studentLatestReport.plagiarismScore !== null
                      ? `${studentLatestReport.plagiarismScore}% Sim`
                      : 'Completed'}
                  </span>
                  <StatusBadge status={studentLatestReport.riskScore || 'LOW'} size="sm" />
                </div>
              ) : (
                <p className="text-lg font-bold text-zinc-400">None yet</p>
              )}
            </div>
            <div className="text-xs text-zinc-500 mt-3 font-medium">
              {studentLatestReport ? 'Generated from latest upload' : 'Submit a file to get scored'}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Enrolled Program
              </span>
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl font-extrabold text-black mt-2 truncate">
              {user.course || 'Enrolled Student'}
            </p>
            <div className="text-xs text-zinc-500 mt-3 font-medium">
              {user.semester ? `Semester ${user.semester}` : 'Active Academic Term'}
            </div>
          </div>
        </div>

        {/* Recent Submissions Table */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-black flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-red-600" />
                Recent Official Submissions
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                Confirmed coursework submitted for faculty evaluation
              </p>
            </div>
            <Link
              to="/student/submissions"
              className="text-xs text-red-600 hover:text-red-800 font-bold transition-colors flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {finalStudentSubmissions.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
              <p className="text-sm text-zinc-500">No official submissions finalized yet.</p>
              {draftStudentSubmissionsCount > 0 ? (
                <p className="text-xs text-amber-700 font-medium">
                  You have {draftStudentSubmissionsCount} pre-flight scan{draftStudentSubmissionsCount > 1 ? 's' : ''} in progress.{' '}
                  <Link to="/student/submissions" className="underline font-bold text-amber-800">
                    Review and finalize drafts &rarr;
                  </Link>
                </p>
              ) : (
                <Link
                  to="/student/submit"
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline font-bold"
                >
                  Upload your first assignment file <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {finalStudentSubmissions.slice(0, 5).map((sub) => {
                const assignment = studentAssignmentsMap[sub.assignmentId];
                const report = studentReportsMap[sub.submissionId];
                return (
                  <div
                    key={sub.submissionId}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm hover:bg-zinc-50/80 px-2 rounded-xl transition-colors"
                  >
                    <div>
                      <div className="font-bold text-black">
                        {assignment ? assignment.title : 'Assignment Submission'}
                      </div>
                      <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5 font-medium">
                        <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700 text-[11px] font-semibold">
                          {sub.fileType}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Final Submission
                        </span>
                        <span>•</span>
                        <span>{formatDate(sub.submittedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={report?.status || sub.status} />
                      <Link
                        to={`/reports/${sub.submissionId}`}
                        className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors"
                      >
                        View Report
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // FACULTY DASHBOARD VIEW (White, Blood Red & Black Theme)
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Hero Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-red-50/70 via-white to-zinc-50 border border-zinc-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200">
              Faculty Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black mt-2 tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-xl leading-relaxed">
            Create coursework assignments, inspect student uploads, and review automated AI plagiarism and originality evaluations.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/faculty/assignments/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            New Assignment
          </Link>
          <Link
            to="/faculty/assignments"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-black font-semibold text-sm transition-colors border border-zinc-300 shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-zinc-500" />
            My Assignments
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Active Assignments
            </span>
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-black mt-2">
            {facultyAssignments.length}
          </p>
          <Link
            to="/faculty/assignments"
            className="flex items-center gap-1 text-xs text-red-600 mt-3 font-bold hover:underline"
          >
            Manage assignments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Submissions Received
            </span>
            <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200">
              <Layers className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-black mt-2">
            {facultySubmissionsCount}
          </p>
          <span className="text-xs text-zinc-500 mt-3 block font-medium">
            Across your published assignments
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Department & Portal
            </span>
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-black mt-2 truncate">
            {user?.department || 'Academic Faculty'}
          </p>
          <span className="text-xs text-zinc-500 mt-3 block font-medium">
            Active Faculty Member
          </span>
        </div>
      </div>

      {/* Assignments List */}
      <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-black flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-600" />
            Your Course Assignments
          </h2>
          <Link
            to="/faculty/assignments"
            className="text-xs text-red-600 hover:text-red-800 font-bold transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {facultyAssignments.length === 0 ? (
          <div className="py-12 text-center space-y-2 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
            <p className="text-sm text-zinc-500">You haven't created any assignments yet.</p>
            <Link
              to="/faculty/assignments/new"
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline font-bold"
            >
              Publish your first assignment <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {facultyAssignments.slice(0, 4).map((a) => (
              <div
                key={a.assignmentId}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm hover:bg-zinc-50/80 px-2 rounded-xl transition-colors"
              >
                <div>
                  <div className="font-bold text-black">{a.title}</div>
                  <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5 font-medium">
                    <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded text-[11px] border border-red-200">{a.subject}</span>
                    <span>•</span>
                    <span>Deadline: {formatDate(a.deadline)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/faculty/assignments/${a.assignmentId}/submissions`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>View Submissions</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
