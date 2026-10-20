import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportApi } from '../../api/reportApi';
import { submissionApi } from '../../api/submissionApi';
import { assignmentApi } from '../../api/assignmentApi';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Report, Submission, Assignment, SentenceBreakdown, User } from '../../types';
import { ScoreGauge } from '../../components/ScoreGauge';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SentenceHighlighter } from '../../components/SentenceHighlighter';
import { DocumentPaperViewer } from '../../components/DocumentPaperViewer';
import {
  ShieldAlert,
  ArrowLeft,
  FileText,
  Calendar,
  Sparkles,
  Printer,
  CheckCircle,
  AlertTriangle,
  FileCode,
  Info,
  ShieldCheck,
  Check,
  X,
  MessageSquare,
  Award,
  Download,
} from 'lucide-react';

export const ViewReportPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [report, setReport] = useState<Report | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [studentUser, setStudentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Faculty review state
  const [facultyRemarks, setFacultyRemarks] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!submissionId) return;

      try {
        setLoading(true);
        setErrorMsg(null);

        // Fetch report
        const reportData = await reportApi.getReportBySubmission(submissionId);
        setReport(reportData);
        if (reportData.facultyRemarks) {
          setFacultyRemarks(reportData.facultyRemarks);
        }

        // Fetch submission & assignment metadata
        try {
          const subData = await submissionApi.getSubmissionById(submissionId);
          setSubmission(subData);
          if (subData.assignmentId) {
            const assignData = await assignmentApi.getAssignmentById(subData.assignmentId);
            setAssignment(assignData);
          }
          if (subData.studentId) {
            authApi.getUserById(subData.studentId).then(setStudentUser).catch(() => {});
          }
        } catch (subErr) {
          console.warn('Metadata lookup optional error:', subErr);
        }
      } catch (err: any) {
        console.error('Failed to load report:', err);
        setErrorMsg(
          err.response?.status === 404
            ? 'No integrity report has been generated for this submission yet.'
            : 'Failed to retrieve integrity report. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [submissionId]);

  const handleReview = async (decision: 'Approved' | 'Rejected') => {
    if (!report) return;
    try {
      setSubmittingReview(true);
      const updated = await reportApi.reviewReport(report.reportId, {
        facultyRemarks,
        decision,
      });
      setReport(updated);
      success(`Submission successfully ${decision.toLowerCase()}!`);
    } catch (err) {
      console.error('Failed to submit review:', err);
      toastError('Failed to save faculty review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Retrieving integrity report..." />;
  }

  if (errorMsg || !report) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Report Unavailable</h2>
        <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          {errorMsg || 'The report could not be found.'}
        </p>
        <div className="pt-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-300 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Parse findings if available in analysisResult
  let parsedFindings: any[] = [];
  let parsedSentences: SentenceBreakdown[] = [];
  let parsedExtractedText: string | undefined = undefined;
  if (report.analysisResult) {
    try {
      const parsed = typeof report.analysisResult === 'string'
        ? JSON.parse(report.analysisResult)
        : report.analysisResult;
      if (Array.isArray(parsed?.findings)) {
        parsedFindings = parsed.findings;
      } else if (Array.isArray(parsed?.matches)) {
        parsedFindings = parsed.matches;
      } else if (Array.isArray(parsed?.similarity_details?.findings)) {
        parsedFindings = parsed.similarity_details.findings;
      }

      if (Array.isArray(parsed?.sentence_breakdown)) {
        parsedSentences = parsed.sentence_breakdown;
      } else if (Array.isArray(parsed?.ai_result?.sentence_breakdown)) {
        parsedSentences = parsed.ai_result.sentence_breakdown;
      }

      if (parsed?.extracted_text) {
        parsedExtractedText = parsed.extracted_text;
      }
    } catch {
      // raw string
    }
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

  const risk = report.riskScore || 'Low';
  const decision = report.decision || 'Pending';
  const isFaculty = user?.role === 'FACULTY' || user?.role === 'ADMIN';

  const originalFileName = submission?.fileUrl
    ? submission.fileUrl.split(/[/\\]/).pop()?.replace(/^[0-9a-fA-F-]+_/, '') || 'submitted_document'
    : 'submitted_document';

  const handleDownloadOriginalFile = async () => {
    if (!submissionId) return;
    try {
      await submissionApi.downloadSubmissionFile(submissionId, originalFileName);
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 print:py-0 print:px-0">
      {/* Top Bar Navigation & Actions */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadOriginalFile}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold shadow-xs transition-all"
            title="Download original uploaded file (.docx / .pdf)"
          >
            <Download className="w-4 h-4" />
            Download Original File
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            Download / Print PDF Report
          </button>
        </div>
      </div>

      {/* Main Report Document Container */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Institutional Header (matches Synopsis) */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 rounded-full font-bold">
                IntegrityAI Evaluation Report
              </span>
              <StatusBadge status={report.status} />
              <StatusBadge status={decision} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black mt-2.5 tracking-tight">
              {assignment ? assignment.title : 'Academic Integrity Evaluation'}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {assignment?.subject ? `Subject: ${assignment.subject} • ` : ''}
              Generated on {formatDate(report.generatedAt)}
            </p>
            <div className="flex items-center flex-wrap gap-2 pt-2 text-xs text-zinc-700">
              <span className="font-bold text-zinc-950 capitalize">
                Student: {studentUser?.name || submission?.studentName || 'Student'}
              </span>
              <span className="text-zinc-300">•</span>
              <span className="px-2 py-0.5 rounded-md bg-zinc-100 font-mono font-bold text-zinc-800 border border-zinc-200">
                Roll: {studentUser?.rollNumber || submission?.rollNumber || 'N/A'}
              </span>
              {(studentUser?.course || submission?.course) && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span className="text-zinc-600 font-medium">
                    {studentUser?.course || submission?.course}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Unified Risk Score Card (Synopsis Section 3 & ERD) */}
          <div className={`p-4 rounded-2xl border text-right space-y-1 shrink-0 ${
            risk === 'High' 
              ? 'bg-red-50 border-red-300 text-red-800' 
              : risk === 'Medium' 
              ? 'bg-amber-50 border-amber-300 text-amber-800' 
              : 'bg-zinc-100 border-zinc-300 text-black'
          }`}>
            <span className="text-[11px] uppercase tracking-wider font-bold block opacity-80">
              Unified Integrity Risk
            </span>
            <div className="flex items-center justify-end gap-1.5">
              {risk === 'High' ? (
                <ShieldAlert className="w-5 h-5 text-red-600" />
              ) : risk === 'Medium' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-black" />
              )}
              <span className="font-extrabold text-xl tracking-tight">
                {risk} Risk
              </span>
            </div>
          </div>
        </div>

        {/* Triple Metric Gauges (Text, AI, Code) */}
        <div>
          <h2 className="text-xs uppercase tracking-wider font-bold text-zinc-500 mb-3">
            Multi-Signal Integrity Analysis Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ScoreGauge
              type="plagiarism"
              score={report.plagiarismScore}
              title="Text Similarity (Plagiarism)"
            />
            <ScoreGauge
              type="ai"
              score={report.aiDetectionScore}
              title="AI Generated Probability"
            />
            <ScoreGauge
              type="code"
              score={report.codeSimilarityScore ?? report.plagiarismScore}
              title="Code Logic / AST Similarity"
            />
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-600" />
            Executive Analysis Summary
          </h3>
          <p className="text-sm text-zinc-700 leading-relaxed font-sans">
            {report.summary ||
              'Analysis completed successfully. The document was cross-examined against corpus submissions and evaluated using stylometric features and perplexity metrics.'}
          </p>
        </div>

        {/* Faculty Remarks & Decision Block (Synopsis Section 4 & 6) */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
              <Award className="w-4 h-4 text-red-600" />
              Faculty Review & Decision
            </h3>
            <span className="text-xs font-medium text-zinc-500">
              Current Status: <strong className="text-black font-bold">{decision}</strong>
            </span>
          </div>

          {isFaculty ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Faculty Feedback / Remarks
                </label>
                <textarea
                  rows={3}
                  value={facultyRemarks}
                  onChange={(e) => setFacultyRemarks(e.target.value)}
                  placeholder="Enter evaluation remarks or justification for the student..."
                  className="w-full p-3 rounded-xl border border-zinc-300 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 placeholder:text-zinc-400"
                />
              </div>

              <div className="flex items-center gap-3 print:hidden">
                <button
                  type="button"
                  onClick={() => handleReview('Approved')}
                  disabled={submittingReview}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Approve Submission
                </button>
                <button
                  type="button"
                  onClick={() => handleReview('Rejected')}
                  disabled={submittingReview}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Reject Submission
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-sm">
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Faculty Remarks</p>
              <p className="text-zinc-800 mt-1 italic">
                {report.facultyRemarks || 'No remarks provided yet by the course instructor.'}
              </p>
            </div>
          )}
        </div>

        {/* In-Document Paper Canvas with Turnitin Yellow Highlighting */}
        <div>
          <h2 className="text-xs uppercase tracking-wider font-bold text-zinc-500 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Turnitin-Style In-Document Originality Canvas</span>
          </h2>
          <DocumentPaperViewer
            submissionId={submission?.submissionId || submissionId}
            fileName={originalFileName}
            fileType={submission?.fileType || 'DOCUMENT'}
            sentences={parsedSentences}
            fullText={parsedExtractedText || report.summary}
            overallAiScore={report.aiDetectionScore ?? 0}
            overallSimilarityScore={report.plagiarismScore ?? 0}
            studentName={submission?.studentName}
            assignmentTitle={assignment?.title}
            submittedAt={submission?.submittedAt}
            allowDownload={true}
          />
        </div>

        {/* Detailed Findings List */}
        {parsedFindings.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
              <FileCode className="w-4 h-4 text-red-600" />
              Detailed Segment Findings ({parsedFindings.length})
            </h3>
            <div className="space-y-2.5">
              {parsedFindings.map((finding: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between text-zinc-700 font-semibold">
                    <span>Segment #{idx + 1}</span>
                    {finding.similarity_score !== undefined && (
                      <span className="px-2 py-0.5 rounded bg-white border border-zinc-200 font-mono text-black font-bold">
                        Match: {finding.similarity_score}%
                      </span>
                    )}
                  </div>
                  {finding.matched_segments && (
                    <blockquote className="p-2.5 rounded bg-white border-l-2 border-red-600 font-mono text-[11px] text-zinc-800">
                      "{Array.isArray(finding.matched_segments) ? finding.matched_segments.join(' ') : finding.matched_segments}"
                    </blockquote>
                  )}
                  {typeof finding === 'string' && (
                    <p className="text-zinc-800">{finding}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report Metadata Footer */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block">Submission Mode</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {submission?.isDraft ? 'Pre-flight Draft' : 'Final Submission'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Student Info</span>
            <span className="font-medium text-slate-700 truncate block mt-0.5">
              {submission?.studentName || report.studentId.substring(0, 10)}
              {submission?.rollNumber ? ` (${submission.rollNumber})` : ''}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Academic Program</span>
            <span className="font-medium text-slate-700 truncate block mt-0.5">
              {submission?.course || assignment?.targetCourse || 'Computer Science'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">File Type</span>
            <span className="font-mono text-slate-700 block mt-0.5">
              {submission?.fileType || 'DOCUMENT'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
