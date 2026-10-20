import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { assignmentApi } from '../../api/assignmentApi';
import { submissionApi } from '../../api/submissionApi';
import { reportApi } from '../../api/reportApi';
import { notificationApi } from '../../api/notificationApi';
import { authApi } from '../../api/authApi';
import { Assignment, Submission, Report, User as UserType } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { DocumentPaperViewer } from '../../components/DocumentPaperViewer';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/axios';
import {
  Layers,
  ArrowLeft,
  Calendar,
  BookOpen,
  FileText,
  Sparkles,
  ExternalLink,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Mail,
  Bell,
  Send,
  GraduationCap,
  X,
  Eye,
  Download,
} from 'lucide-react';

export const AssignmentSubmissionsPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reportsMap, setReportsMap] = useState<Record<string, Report>>({});
  const [loading, setLoading] = useState(true);
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);

  // Deadline reminder state
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTargetEmail, setReminderTargetEmail] = useState('');
  const [sendingReminder, setSendingReminder] = useState(false);

  // In-browser Document Canvas view state
  const [viewingSubmission, setViewingSubmission] = useState<{ submission: Submission; report?: Report } | null>(null);

  // Strictly filter out drafts: faculty must only see official, confirmed student submissions
  // If a student submitted multiple times, only show their latest final submission
  const officialSubmissions = useMemo(() => {
    const nonDrafts = submissions.filter((s) => !s.isDraft);
    const studentMap = new Map<string, Submission>();
    const sorted = [...nonDrafts].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    for (const sub of sorted) {
      if (!studentMap.has(sub.studentId)) {
        studentMap.set(sub.studentId, sub);
      }
    }
    return Array.from(studentMap.values());
  }, [submissions]);

  const fetchData = async () => {
    if (!assignmentId) return;

    try {
      setLoading(true);
      const [assignData, subsData] = await Promise.all([
        assignmentApi.getAssignmentById(assignmentId),
        submissionApi.getSubmissionsByAssignment(assignmentId),
      ]);

      setAssignment(assignData);

      // Auto-resolve student profile details (name, roll number, course, semester) from auth-service
      const studentProfileMap = new Map<string, UserType>();
      const uniqueStudentIds = Array.from(new Set(subsData.map((s) => s.studentId).filter(Boolean)));
      await Promise.all(
        uniqueStudentIds.map(async (sid) => {
          try {
            const studentUser = await authApi.getUserById(sid);
            if (studentUser) {
              studentProfileMap.set(sid, studentUser);
            }
          } catch (err) {
            console.warn(`Could not load profile for student ${sid}:`, err);
          }
        })
      );

      const enrichedSubs = subsData.map((sub) => {
        const profile = studentProfileMap.get(sub.studentId);
        return {
          ...sub,
          studentName:
            profile?.name && profile.name.trim() !== ''
              ? profile.name
              : sub.studentName && sub.studentName !== 'Student'
              ? sub.studentName
              : profile?.email
              ? profile.email.split('@')[0]
              : sub.studentName || 'Student',
          rollNumber:
            profile?.rollNumber && profile.rollNumber.trim() !== ''
              ? profile.rollNumber
              : sub.rollNumber && sub.rollNumber !== 'N/A'
              ? sub.rollNumber
              : 'N/A',
          course: profile?.course || sub.course,
          semester: profile?.semester || sub.semester,
        };
      });

      setSubmissions(enrichedSubs);

      // Fetch reports only for confirmed official submissions
      const rMap: Record<string, Report> = {};
      const confirmedOnly = enrichedSubs.filter((s) => !s.isDraft);
      await Promise.all(
        confirmedOnly.map(async (s) => {
          try {
            const report = await reportApi.getReportBySubmission(s.submissionId);
            if (report) {
              rMap[s.submissionId] = report;
            }
          } catch {
            // Report not yet generated
          }
        })
      );
      setReportsMap(rMap);
    } catch (err: unknown) {
      console.error('Failed to load assignment submissions:', err);
      toastError('Failed to load submissions for this assignment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const handleGenerateReport = async (sub: Submission) => {
    if (!assignmentId) return;
    try {
      setGeneratingForId(sub.submissionId);
      info(`Triggering AI integrity analysis for submission ${sub.submissionId.substring(0, 8)}...`);

      const report = await reportApi.generateReport({
        submissionId: sub.submissionId,
        studentId: sub.studentId,
        assignmentId: assignmentId,
      });

      setReportsMap((prev) => ({
        ...prev,
        [sub.submissionId]: report,
      }));

      success('Integrity analysis complete! Report is now available.');
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      toastError(`Failed to generate report: ${msg}`);
    } finally {
      setGeneratingForId(null);
    }
  };

  const handleSendDeadlineReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment) return;
    try {
      setSendingReminder(true);
      const targetStudentId = officialSubmissions[0]?.studentId || '00000000-0000-0000-0000-000000000000';
      await notificationApi.sendDeadlineReminder({
        studentId: targetStudentId,
        studentEmail: reminderTargetEmail || undefined,
        assignmentTitle: assignment.title,
        deadline: assignment.deadline,
      });

      success(`Deadline reminder dispatched via In-App Alert & Email notification!`);
      setShowReminderModal(false);
      setReminderTargetEmail('');
    } catch (err) {
      toastError('Failed to dispatch reminder: ' + getErrorMessage(err));
    } finally {
      setSendingReminder(false);
    }
  };

  const [sendingSummary, setSendingSummary] = useState(false);

  const handleSendFacultySummary = async () => {
    if (!assignmentId) return;
    try {
      setSendingSummary(true);
      const res = await assignmentApi.sendFacultySummaryEmail(assignmentId);
      if (res.success) {
        success(res.message || 'Official coursework submission roll-call email dispatched to course faculty.');
      } else {
        toastError(res.message || 'Failed to dispatch email report.');
      }
    } catch (err) {
      toastError('Failed to dispatch summary email: ' + getErrorMessage(err));
    } finally {
      setSendingSummary(false);
    }
  };

  const handleAlertAllPendingStudents = async () => {
    if (!assignmentId) return;
    try {
      setSendingReminder(true);
      const res = await assignmentApi.remindPendingStudents(assignmentId);
      success(res.message || 'Deadline reminders dispatched to all pending students!');
    } catch (err) {
      toastError('Failed to dispatch reminders: ' + getErrorMessage(err));
    } finally {
      setSendingReminder(false);
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/faculty/assignments')}
          className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSendFacultySummary}
            disabled={sendingSummary}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            title="Dispatch official submission roll-call email (submitted vs pending students) to course faculty"
          >
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>{sendingSummary ? 'Dispatching Report...' : 'Email Roll-Call Report'}</span>
          </button>

          <button
            onClick={handleAlertAllPendingStudents}
            disabled={sendingReminder}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            title="Automatically send email reminders to all enrolled students who haven't submitted yet"
          >
            <Clock className="w-4 h-4" />
            <span>{sendingReminder ? 'Sending Emails...' : 'Alert All Pending Students'}</span>
          </button>

          <button
            onClick={() => setShowReminderModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Bell className="w-4 h-4" />
            <span>Custom Student Alert</span>
          </button>
        </div>
      </div>

      {/* Assignment Overview Card */}
      {assignment && (
        <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  {assignment.subject}
                </span>
                {assignment.targetCourse && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-zinc-500" />
                    {assignment.targetCourse}
                  </span>
                )}
                {assignment.targetSemester && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {assignment.targetSemester}
                  </span>
                )}
                <span className="text-xs text-zinc-400 font-mono">
                  ID: {assignment.assignmentId.substring(0, 8)}...
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-black mt-2 tracking-tight">
                {assignment.title}
              </h1>
            </div>

            <div className="flex items-center gap-2.5 text-xs p-3 rounded-xl bg-zinc-50 border border-zinc-200 shrink-0">
              <Calendar className="w-4 h-4 text-red-600" />
              <div>
                <span className="text-zinc-500 font-bold block text-[10px] uppercase">DEADLINE</span>
                <span className="text-black font-semibold">{formatDate(assignment.deadline)}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
            {assignment.description}
          </p>
        </div>
      )}

      {/* Submissions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-600" />
            Official Student Submissions ({officialSubmissions.length})
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReminderModal(true)}
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              Notify Students
            </button>
            <button
              onClick={fetchData}
              className="text-xs text-zinc-600 hover:text-black font-bold transition-colors"
            >
              Refresh List
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner fullPage text="Loading assignment submissions..." />
        ) : officialSubmissions.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-zinc-300 bg-white shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-black">No official submissions yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Students have not submitted finalized coursework for this assignment yet. Pre-flight drafts are kept private to students; confirmed submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-700">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase font-bold text-zinc-600 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Student & Roll Number</th>
                    <th className="px-6 py-4">Submission Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submitted At</th>
                    <th className="px-6 py-4">Integrity Evaluation</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {officialSubmissions.map((sub) => {
                    const report = reportsMap[sub.submissionId];
                    const isGenerating = generatingForId === sub.submissionId;

                    return (
                      <tr key={sub.submissionId} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="space-y-1.5">
                            <div className="font-extrabold text-black flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                                {(sub.studentName || 'S').charAt(0).toUpperCase()}
                              </div>
                              <span className="text-zinc-950 font-bold capitalize">
                                {sub.studentName || 'Student'}
                              </span>
                            </div>
                            <div className="flex items-center flex-wrap gap-1.5 text-xs">
                              <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-900 font-mono font-bold border border-zinc-300">
                                Roll: {sub.rollNumber || 'N/A'}
                              </span>
                              {sub.semester && (
                                <span className="px-2 py-0.5 rounded-md bg-zinc-50 text-zinc-700 font-medium border border-zinc-200">
                                  {sub.semester}
                                </span>
                              )}
                            </div>
                            {sub.course && (
                              <div className="text-[11px] text-zinc-500 truncate max-w-xs font-medium">
                                {sub.course}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-900 font-mono text-xs border border-zinc-300 font-bold">
                              {sub.fileType}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Official Submission
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={report?.status || sub.status} />
                        </td>

                        <td className="px-6 py-4 text-xs text-zinc-500 whitespace-nowrap font-medium">
                          {formatDate(sub.submittedAt)}
                        </td>

                        <td className="px-6 py-4">
                          {report ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${
                                  (report.plagiarismScore || 0) > 40 ? 'text-red-600' : 'text-zinc-900'
                                }`}>
                                  Sim: {report.plagiarismScore !== null ? `${report.plagiarismScore}%` : 'N/A'}
                                </span>
                                <span className="text-zinc-300">|</span>
                                <span className={`text-xs font-bold ${
                                  (report.aiDetectionScore || 0) > 50 ? 'text-amber-600' : 'text-zinc-900'
                                }`}>
                                  AI: {report.aiDetectionScore !== null ? `${report.aiDetectionScore}%` : 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <StatusBadge status={report.riskScore || 'LOW'} size="sm" />
                                {report.decision && report.decision !== 'Pending' && (
                                  <StatusBadge status={report.decision} size="sm" />
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 italic font-medium">
                              Report not generated
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingSubmission({ submission: sub, report })}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold border border-zinc-200 transition-colors shadow-2xs"
                              title="View document on paper canvas with yellow highlights"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View File</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const filename = sub.fileUrl?.split(/[/\\]/).pop()?.replace(/^[0-9a-fA-F-]+_/, '') || 'submission_file';
                                submissionApi.downloadSubmissionFile(sub.submissionId, filename);
                              }}
                              className="inline-flex items-center justify-center p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors border border-zinc-200 shadow-2xs"
                              title="Download original file (.docx / .pdf)"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {report ? (
                              <Link
                                to={`/reports/${sub.submissionId}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors shadow-2xs"
                              >
                                <span>Report</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            ) : (
                              <button
                                onClick={() => handleGenerateReport(sub)}
                                disabled={isGenerating}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-xs"
                              >
                                {isGenerating ? (
                                  <>
                                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Analyzing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3.5 h-3.5" />
                                    <span>Evaluate</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Deadline Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-black font-extrabold text-lg">
                <Bell className="w-5 h-5 text-red-600" />
                <span>Send Deadline Reminder</span>
              </div>
              <button
                onClick={() => setShowReminderModal(false)}
                className="text-zinc-400 hover:text-black p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-600">
              Dispatches an automated high-priority reminder notification and email alert to notify students that the deadline for <strong>{assignment?.title}</strong> is approaching on <strong>{formatDate(assignment?.deadline)}</strong>.
            </p>

            <form onSubmit={handleSendDeadlineReminder} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Target Student Email (Optional)
                </label>
                <input
                  type="email"
                  value={reminderTargetEmail}
                  onChange={(e) => setReminderTargetEmail(e.target.value)}
                  placeholder="Leave empty to broadcast to enrolled cohort"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
                />
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  If left blank, reminder will be sent to enrolled course cohort.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                <div className="text-zinc-500 font-semibold">Reminder Channel:</div>
                <div className="text-zinc-800 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  In-App Notification Badge & Live Alert
                </div>
                <div className="text-zinc-800 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Email Dispatch (Automated IntegrityAI Alert)
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  disabled={sendingReminder}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-semibold hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReminder}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {sendingReminder ? (
                    <span>Dispatching...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reminder Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-Browser Document Paper Canvas Modal */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">
                    Faculty Document Inspection Canvas
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Student: <strong>{viewingSubmission.submission.studentName || 'Student'}</strong>
                    {viewingSubmission.submission.rollNumber ? ` (${viewingSubmission.submission.rollNumber})` : ''} •
                    Course: {viewingSubmission.submission.course || assignment?.targetCourse || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const filename = viewingSubmission.submission.fileUrl?.split(/[/\\]/).pop()?.replace(/^[0-9a-fA-F-]+_/, '') || 'submission_file';
                    submissionApi.downloadSubmissionFile(viewingSubmission.submission.submissionId, filename);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors border border-zinc-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingSubmission(null)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
              <DocumentPaperViewer
                submissionId={viewingSubmission.submission.submissionId}
                fileName={viewingSubmission.submission.fileUrl?.split(/[/\\]/).pop()?.replace(/^[0-9a-fA-F-]+_/, '') || 'submitted_document'}
                fileType={viewingSubmission.submission.fileType || 'DOCUMENT'}
                containerHeight="h-[72vh]"
                sentences={(() => {
                  try {
                    const parsed = typeof viewingSubmission.report?.analysisResult === 'string'
                      ? JSON.parse(viewingSubmission.report.analysisResult)
                      : viewingSubmission.report?.analysisResult;
                    return parsed?.sentence_breakdown || [];
                  } catch {
                    return [];
                  }
                })()}
                fullText={(() => {
                  try {
                    const parsed = typeof viewingSubmission.report?.analysisResult === 'string'
                      ? JSON.parse(viewingSubmission.report.analysisResult)
                      : viewingSubmission.report?.analysisResult;
                    return parsed?.extracted_text || viewingSubmission.report?.summary;
                  } catch {
                    return viewingSubmission.report?.summary;
                  }
                })()}
                overallAiScore={viewingSubmission.report?.aiDetectionScore ?? 0}
                overallSimilarityScore={viewingSubmission.report?.plagiarismScore ?? 0}
                studentName={viewingSubmission.submission.studentName}
                assignmentTitle={assignment?.title}
                submittedAt={viewingSubmission.submission.submittedAt}
                allowDownload={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
