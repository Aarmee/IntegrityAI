import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { assignmentApi } from '../../api/assignmentApi';
import { submissionApi } from '../../api/submissionApi';
import { reportApi } from '../../api/reportApi';
import { getErrorMessage } from '../../api/axios';
import { Assignment, Report } from '../../types';
import { FileUpload } from '../../components/FileUpload';
import { StatusBadge } from '../../components/StatusBadge';
import { SubmissionCelebrationModal } from '../../components/SubmissionCelebrationModal';
import { DocumentPaperViewer } from '../../components/DocumentPaperViewer';
import { SentenceBreakdown } from '../../types';
import {
  FileUp,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  GraduationCap,
  FileCheck,
  Download,
  Lock,
} from 'lucide-react';
import { matchesCohort, formatCohortLabel } from '../../utils/cohortMatcher';

const formatDeadline = (dateStr?: string) => {
  if (!dateStr) return { text: 'No deadline set', isPast: false };
  try {
    const date = new Date(dateStr);
    const isPast = date.getTime() < Date.now();
    return {
      text: date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      isPast,
    };
  } catch {
    return { text: dateStr, isPast: false };
  }
};

export const SubmitFilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-flight Draft Scan State
  const [stage, setStage] = useState<'SELECT_AND_UPLOAD' | 'REVIEW_DRAFT'>('SELECT_AND_UPLOAD');
  const [draftSubmissionId, setDraftSubmissionId] = useState<string | null>(null);
  const [draftReport, setDraftReport] = useState<Report | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confirmedSubmissionTime, setConfirmedSubmissionTime] = useState<string | undefined>(undefined);
  const [studentSubmissions, setStudentSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingAssignments(true);
        const [assignData, subsData] = await Promise.all([
          assignmentApi.getAllAssignments(),
          user?.userId
            ? submissionApi.getSubmissionsByStudent(user.userId).catch(() => [])
            : Promise.resolve([]),
        ]);
        setAssignments(assignData);
        setStudentSubmissions(subsData);
      } catch (err) {
        console.error('Failed to load assignments:', err);
        setErrorMsg('Failed to load available assignments. Please refresh or try again.');
      } finally {
        setLoadingAssignments(false);
      }
    };

    fetchData();
  }, [user?.userId]);

  const submittedAssignmentIds = React.useMemo(() => {
    return new Set(
      studentSubmissions
        .filter((s) => !s.isDraft)
        .map((s) => s.assignmentId)
    );
  }, [studentSubmissions]);

  // Strictly scoped to student's enrolled course and selected semester ONLY
  const enrolledAssignments = React.useMemo(() => {
    return assignments.filter((a) => {
      return matchesCohort(a.targetCourse, a.targetSemester, user?.course, user?.semester);
    });
  }, [assignments, user]);

  // 1. Active assignments lined up for submission (Deadline upcoming, NOT yet submitted)
  const activeSubmittableAssignments = React.useMemo(() => {
    return enrolledAssignments.filter((a) => {
      const isPast = formatDeadline(a.deadline).isPast;
      const isSubmitted = submittedAssignmentIds.has(a.assignmentId);
      return !isPast && !isSubmitted;
    });
  }, [enrolledAssignments, submittedAssignmentIds]);

  // 2. Missed deadline assignments (Deadline expired, NOT submitted)
  const missedDeadlineAssignments = React.useMemo(() => {
    return enrolledAssignments.filter((a) => {
      const isPast = formatDeadline(a.deadline).isPast;
      const isSubmitted = submittedAssignmentIds.has(a.assignmentId);
      return isPast && !isSubmitted;
    });
  }, [enrolledAssignments, submittedAssignmentIds]);

  // 3. Completed / already submitted assignments
  const completedAssignments = React.useMemo(() => {
    return enrolledAssignments.filter((a) => submittedAssignmentIds.has(a.assignmentId));
  }, [enrolledAssignments, submittedAssignmentIds]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const passedId = params.get('assignmentId');
    if (passedId && activeSubmittableAssignments.some((a) => a.assignmentId === passedId)) {
      setSelectedAssignmentId(passedId);
    } else if (
      activeSubmittableAssignments.length > 0 &&
      !activeSubmittableAssignments.some((a) => a.assignmentId === selectedAssignmentId)
    ) {
      setSelectedAssignmentId(activeSubmittableAssignments[0].assignmentId);
    } else if (activeSubmittableAssignments.length === 0) {
      setSelectedAssignmentId('');
    }
  }, [activeSubmittableAssignments, location.search, selectedAssignmentId]);

  const selectedAssignment = enrolledAssignments.find(
    (a) => a.assignmentId === selectedAssignmentId
  );

  // If a passed assignment ID from another cohort was targeted, block it strictly
  const isCohortMismatch = React.useMemo(() => {
    if (!selectedAssignmentId) return false;
    const foundInEnrolled = enrolledAssignments.some((a) => a.assignmentId === selectedAssignmentId);
    return !foundInEnrolled;
  }, [enrolledAssignments, selectedAssignmentId]);

  const handleRunDraftScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCohortMismatch) {
      setErrorMsg('Academic Integrity Block: You cannot submit coursework assigned to another academic cohort.');
      return;
    }
    if (!selectedAssignmentId) {
      setErrorMsg('Please select an assignment to submit for.');
      return;
    }
    if (!file) {
      setErrorMsg('Please select a file to upload.');
      return;
    }
    if (!user?.userId) {
      setErrorMsg('Student profile not detected. Please sign in again.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg(null);
      setUploadProgress(20);

      // Upload file with draft flag (true = pre-flight scan draft)
      const uploaded = await submissionApi.uploadSubmission(
        file,
        user.userId,
        selectedAssignmentId,
        (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        },
        true, // isDraft: true for pre-flight scanning
        {
          studentName: user.name,
          rollNumber: user.rollNumber,
          course: user.course,
          semester: user.semester,
        }
      );

      setDraftSubmissionId(uploaded.submissionId);

      info('Running AI & Plagiarism Pre-flight Scan...');
      // Generate immediate report for the draft
      const report = await reportApi.generateReport({
        submissionId: uploaded.submissionId,
        studentId: user.userId,
        assignmentId: selectedAssignmentId,
        filePath: uploaded.fileUrl,
      });

      setDraftReport(report);
      setStage('REVIEW_DRAFT');
      success('Pre-flight scan complete! Review your AI detection report below.');
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmFinalSubmission = async () => {
    if (!draftSubmissionId) return;
    try {
      setIsConfirming(true);
      const res = await submissionApi.confirmSubmission(draftSubmissionId);
      setConfirmedSubmissionTime(res.submittedAt);
      setStudentSubmissions((prev) => [...prev, res]);
      setShowCelebration(true);
      success('Woohoo! Assignment successfully submitted to faculty for grading!');
    } catch (err) {
      toastError('Failed to confirm final submission: ' + getErrorMessage(err));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReviseDraft = () => {
    setStage('SELECT_AND_UPLOAD');
    setDraftReport(null);
    setDraftSubmissionId(null);
    setFile(null);
    setUploadProgress(0);
    info('Draft reset. You can modify your document and run another pre-flight scan.');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-zinc-200">
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
          <FileUp className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight">Submit Assignment File</h1>
          <p className="text-sm text-zinc-500 font-medium">
            Pre-flight integrity checking lets you preview AI & similarity metrics before finalizing to faculty
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* STAGE 1: SELECT ASSIGNMENT AND UPLOAD */}
      {stage === 'SELECT_AND_UPLOAD' && (
        <form onSubmit={handleRunDraftScan} className="space-y-6">
          {/* Step 1: Select Assignment */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-red-600" />
                1. Select Course Assignment
              </label>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-500 font-medium">Enrolled Cohort:</span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  {formatCohortLabel(user?.course, user?.semester)}
                </span>
              </div>
            </div>

            {activeSubmittableAssignments.length === 0 && !loadingAssignments ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    No active coursework due for your enrolled cohort ({formatCohortLabel(user?.course, user?.semester)}).
                  </span>
                </div>
              </div>
            ) : (
              <select
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                disabled={isUploading || loadingAssignments}
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-black text-sm font-medium focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-xs"
              >
                {activeSubmittableAssignments.map((a) => (
                  <option key={a.assignmentId} value={a.assignmentId}>
                    {a.title} ({a.subject}) • Due: {formatDeadline(a.deadline).text}
                  </option>
                ))}
              </select>
            )}

            {/* Selected Assignment Info Card */}
            {selectedAssignment && (
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-sm space-y-2 mt-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-black text-base">
                    {selectedAssignment.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                      {selectedAssignment.subject}
                    </span>
                    {selectedAssignment.targetCourse && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-zinc-500" />
                        {selectedAssignment.targetCourse}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                  {selectedAssignment.description}
                </p>

                <div className="flex items-center gap-2 text-xs pt-2 border-t border-zinc-200">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-zinc-500 font-medium">Deadline:</span>
                  <span
                    className={
                      formatDeadline(selectedAssignment.deadline).isPast
                        ? 'text-red-600 font-bold'
                        : 'text-zinc-900 font-bold'
                    }
                  >
                    {formatDeadline(selectedAssignment.deadline).text}
                    {formatDeadline(selectedAssignment.deadline).isPast && ' (Past Deadline)'}
                  </span>
                </div>
              </div>
            )}

            {/* Academic Integrity Cohort Lock Banner */}
            {isCohortMismatch && (
              <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 text-sm flex items-start gap-3 shadow-xs">
                <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-red-900">Academic Integrity Cohort Lock</span>
                    <span className="text-[10px] px-2 py-0.5 bg-red-200 text-red-900 rounded-md font-extrabold uppercase">
                      Restricted
                    </span>
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed">
                    This coursework is designated for another cohort. 
                    Your authorized enrollment is <strong>{formatCohortLabel(user?.course, user?.semester)}</strong>.
                  </p>
                  <p className="text-xs text-red-700 font-medium">
                    Cross-department coursework submission is strictly blocked by institutional policy.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Choose File */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
              <FileUp className="w-4 h-4 text-red-600" />
              2. Upload Draft Document
            </label>

            {isCohortMismatch ? (
              <div className="py-10 px-6 rounded-2xl border-2 border-dashed border-red-300 bg-red-50/60 text-center space-y-2">
                <Lock className="w-8 h-8 text-red-600 mx-auto" />
                <p className="text-sm font-bold text-red-950">Upload Disabled — Unauthorized Cohort</p>
                <p className="text-xs text-red-800 max-w-md mx-auto leading-relaxed">
                  You cannot attach documents for assignments outside your enrolled degree program ({user?.course || 'Your Program'}). Please select an assignment assigned to your cohort.
                </p>
              </div>
            ) : (
              <FileUpload
                selectedFile={file}
                onFileSelect={(f) => setFile(f)}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />
            )}

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Pre-flight Draft Guarantee:</strong> Uploading here performs a private integrity scan first. The report will not be finalized for faculty grading until you review and confirm your results.
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/student/submissions')}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-black font-semibold text-sm transition-colors border border-zinc-300 shadow-2xs disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file || !selectedAssignmentId || isCohortMismatch}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isCohortMismatch ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Submission Locked (Cohort Mismatch)</span>
                </>
              ) : isUploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Running Pre-Flight AI Scan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Pre-Flight AI Scan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Missed Deadlines & Completed Coursework Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Missed Deadlines Section */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  <span>Missed Deadlines ({missedDeadlineAssignments.length})</span>
                </h3>
                {missedDeadlineAssignments.length > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                    Window Closed
                  </span>
                )}
              </div>

              {missedDeadlineAssignments.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No missed deadlines! You are completely on track.</p>
              ) : (
                <div className="space-y-2">
                  {missedDeadlineAssignments.map((a) => (
                    <div
                      key={a.assignmentId}
                      className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-zinc-900">{a.title}</p>
                        <p className="text-zinc-500 text-[11px]">{a.subject} {a.targetCourse ? `• ${a.targetCourse}` : ''}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 shrink-0">
                        Expired {formatDeadline(a.deadline).text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Submissions Section */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Submitted Coursework ({completedAssignments.length})</span>
                </h3>
                <Link
                  to="/student/submissions"
                  className="text-[11px] text-red-600 font-bold hover:underline"
                >
                  View My Submissions →
                </Link>
              </div>

              {completedAssignments.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No assignments submitted yet for this cohort.</p>
              ) : (
                <div className="space-y-2">
                  {completedAssignments.map((a) => (
                    <div
                      key={a.assignmentId}
                      className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-emerald-950">{a.title}</p>
                        <p className="text-emerald-700 text-[11px]">{a.subject}</p>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                        ✓ Submitted
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      )}

      {/* STAGE 2: PRE-FLIGHT REVIEW CARD & CONFIRMATION */}
      {stage === 'REVIEW_DRAFT' && draftReport && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-zinc-100 text-zinc-800">
                  <FileCheck className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Draft Evaluation Preview
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {file?.name}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-black mt-1">
                    Pre-Flight Integrity Report
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {draftSubmissionId && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!draftSubmissionId) return;
                      await submissionApi.downloadSubmissionFile(draftSubmissionId, file?.name);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs transition-colors"
                    title="Download uploaded file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                )}

                <Link
                  to={`/reports/${draftSubmissionId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs transition-colors border border-zinc-200"
                >
                  <span>Full Report</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* AI & Plagiarism Warning or Success Callout (100% Synchronized with Risk Score) */}
            {(draftReport.riskScore === 'High' || (draftReport.aiDetectionScore ?? 0) > 40 || (draftReport.plagiarismScore ?? 0) > 40) ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-amber-900">
                  <div className="font-bold text-sm text-amber-950">
                    Integrity Attention Required • {(draftReport.riskScore || 'Elevated Risk').toUpperCase()} RISK
                  </div>
                  <p>
                    {draftReport.summary ||
                      'Elevated similarity or AI markers detected in this draft. Inspect the yellow and red highlighted sentences in the document canvas below. You may revise your draft before finalizing to faculty.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-emerald-900">
                  <div className="font-bold text-sm text-emerald-950">
                    Originality Verified • Low Risk (AI: {(draftReport.aiDetectionScore ?? 0)}% • Sim: {(draftReport.plagiarismScore ?? 0)}%)
                  </div>
                  <p>
                    Your paper demonstrates authentic human authorship and passed originality checks. You can safely confirm this submission to faculty.
                  </p>
                </div>
              </div>
            )}

            {/* Score Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  AI Probability
                </span>
                <div className={`text-3xl font-extrabold ${
                  (draftReport.aiDetectionScore ?? 0) > 40 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {draftReport.aiDetectionScore !== null ? `${draftReport.aiDetectionScore}%` : '0%'}
                </div>
                <span className="text-[11px] text-zinc-400 font-medium">
                  {(draftReport.aiDetectionScore ?? 0) > 40 ? 'Review suggested' : 'Human authored'}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Similarity Score
                </span>
                <div className={`text-3xl font-extrabold ${
                  (draftReport.plagiarismScore ?? 0) > 40 ? 'text-red-600' : 'text-zinc-900'
                }`}>
                  {draftReport.plagiarismScore !== null ? `${draftReport.plagiarismScore}%` : '0%'}
                </div>
                <span className="text-[11px] text-zinc-400 font-medium">
                  {(draftReport.plagiarismScore ?? 0) > 40 ? 'High corpus match' : 'Original content'}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Integrity Risk
                </span>
                <div className="pt-1.5 flex justify-center">
                  <StatusBadge status={draftReport.riskScore || 'LOW'} size="md" />
                </div>
                <span className="text-[11px] text-zinc-400 font-medium block pt-1">
                  Overall classification
                </span>
              </div>
            </div>

            {/* Top Quick Decision Action Bar — Immediate access so student never has to scroll down */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-50 via-white to-red-50/40 border-2 border-red-200 text-zinc-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-zinc-900">Ready to finalize coursework?</h4>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Confirm your submission for faculty review, or revise and upload another draft.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleReviseDraft}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition-all border border-zinc-300 shadow-2xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Revise Draft</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmFinalSubmission}
                  disabled={isConfirming}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isConfirming ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting to Faculty...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Final Submission</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Document Paper Canvas with Yellow Highlighter */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Submitted File Canvas View</span>
                </h3>
                <span className="text-[11px] text-zinc-400">
                  Inspect in-document text & yellow AI highlights below
                </span>
              </div>
              <DocumentPaperViewer
                submissionId={draftSubmissionId || undefined}
                fileName={file?.name || 'draft_document'}
                fileType={file?.name.split('.').pop()?.toUpperCase() || 'DOCUMENT'}
                containerHeight="h-[580px]"
                sentences={(() => {
                  try {
                    const parsed = typeof draftReport.analysisResult === 'string'
                      ? JSON.parse(draftReport.analysisResult)
                      : draftReport.analysisResult;
                    return parsed?.sentence_breakdown || [];
                  } catch {
                    return [];
                  }
                })()}
                fullText={(() => {
                  try {
                    const parsed = typeof draftReport.analysisResult === 'string'
                      ? JSON.parse(draftReport.analysisResult)
                      : draftReport.analysisResult;
                    return parsed?.extracted_text || draftReport.summary;
                  } catch {
                    return draftReport.summary;
                  }
                })()}
                overallAiScore={draftReport.aiDetectionScore ?? 0}
                overallSimilarityScore={draftReport.plagiarismScore ?? 0}
                studentName={user?.name}
                assignmentTitle={selectedAssignment?.title}
                allowDownload={true}
              />
            </div>

            {/* Decision Callout & Actions */}
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-base text-zinc-900">What would you like to do?</h4>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    You can revise your paper to reduce AI phrases or confirm final submission to faculty.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleReviseDraft}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition-all border border-zinc-300 shadow-2xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Revise & Resubmit New Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmFinalSubmission}
                    disabled={isConfirming}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isConfirming ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting to Faculty...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Final Submission</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Microsoft Teams Style Celebration Modal */}
      <SubmissionCelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        assignmentTitle={selectedAssignment?.title || 'Assignment Submission'}
        submissionId={draftSubmissionId || undefined}
        submittedAt={confirmedSubmissionTime}
        aiScore={draftReport?.aiDetectionScore !== null ? draftReport?.aiDetectionScore : undefined}
        similarityScore={draftReport?.plagiarismScore !== null ? draftReport?.plagiarismScore : undefined}
        studentName={user?.name}
        rollNumber={user?.rollNumber}
        course={user?.course}
        semester={user?.semester}
      />
    </div>
  );
};
