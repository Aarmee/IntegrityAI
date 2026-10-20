import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submissionApi } from '../../api/submissionApi';
import { assignmentApi } from '../../api/assignmentApi';
import { reportApi } from '../../api/reportApi';
import { Submission, Assignment, Report } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SubmissionCelebrationModal } from '../../components/SubmissionCelebrationModal';
import { DocumentPaperViewer } from '../../components/DocumentPaperViewer';
import {
  FileCheck,
  FileUp,
  FileText,
  Clock,
  ExternalLink,
  Search,
  Filter,
  AlertCircle,
  Sparkles,
  Eye,
  Download,
  X,
} from 'lucide-react';

export const MySubmissionsPage: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignmentsMap, setAssignmentsMap] = useState<Record<string, Assignment>>({});
  const [reportsMap, setReportsMap] = useState<Record<string, Report>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'OFFICIAL' | 'DRAFTS'>('OFFICIAL');
  const [celebratingSubmission, setCelebratingSubmission] = useState<{
    assignmentTitle: string;
    submissionId: string;
    submittedAt?: string;
    aiScore?: number;
    similarityScore?: number;
  } | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<{ submission: Submission; report?: Report } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.userId) return;
      try {
        setLoading(true);
        const [subs, allAssignments] = await Promise.all([
          submissionApi.getSubmissionsByStudent(user.userId),
          assignmentApi.getAllAssignments().catch(() => [] as Assignment[]),
        ]);

        setSubmissions(subs);

        const aMap: Record<string, Assignment> = {};
        allAssignments.forEach((a) => {
          aMap[a.assignmentId] = a;
        });
        setAssignmentsMap(aMap);

        // Fetch reports for all submissions
        const rMap: Record<string, Report> = {};
        await Promise.all(
          subs.map(async (s) => {
            try {
              const rep = await reportApi.getReportBySubmission(s.submissionId);
              if (rep) {
                rMap[s.submissionId] = rep;
              }
            } catch {
              // Report not generated yet
            }
          })
        );
        setReportsMap(rMap);
      } catch (err) {
        console.error('Failed to load submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.userId]);

  // 1. Identify the single active final submission per assignment
  // For each assignment, take non-draft submissions, sort descending by submittedAt, and pick the latest
  const finalSubmissionsMap = React.useMemo(() => {
    const map = new Map<string, Submission>();
    const nonDrafts = submissions.filter((s) => !s.isDraft);
    const sorted = [...nonDrafts].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    for (const sub of sorted) {
      if (!map.has(sub.assignmentId)) {
        map.set(sub.assignmentId, sub);
      }
    }
    return map;
  }, [submissions]);

  // Set of IDs that represent the single active final submission per assignment
  const finalSubmissionIds = React.useMemo(() => {
    return new Set(Array.from(finalSubmissionsMap.values()).map((s) => s.submissionId));
  }, [finalSubmissionsMap]);

  // Official submissions = strictly the active final submission per assignment
  const officialSubmissions = React.useMemo(() => {
    return submissions.filter((s) => finalSubmissionIds.has(s.submissionId));
  }, [submissions, finalSubmissionIds]);

  // Pre-Flight Drafts = all pre-flight scans and earlier unconfirmed files (not the current final submission)
  const draftSubmissions = React.useMemo(() => {
    return submissions.filter((s) => !finalSubmissionIds.has(s.submissionId));
  }, [submissions, finalSubmissionIds]);

  const officialCount = officialSubmissions.length;
  const draftCount = draftSubmissions.length;

  const currentTabSubmissions = React.useMemo(() => {
    const baseList = activeTab === 'DRAFTS' ? draftSubmissions : officialSubmissions;
    return baseList.filter((sub) => {
      const assignment = assignmentsMap[sub.assignmentId];
      const matchSearch =
        sub.submissionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.fileType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assignment && assignment.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (assignment && assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()));

      const report = reportsMap[sub.submissionId];
      const effectiveStatus = report?.status || sub.status;
      const matchStatus =
        statusFilter === 'ALL' || effectiveStatus.toUpperCase() === statusFilter.toUpperCase();

      return matchSearch && matchStatus;
    });
  }, [activeTab, officialSubmissions, draftSubmissions, assignmentsMap, searchTerm, reportsMap, statusFilter]);

  const formatDate = (dateStr: string) => {
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-black tracking-tight">My Submissions</h1>
              <p className="text-sm text-zinc-500 font-medium">
                Track submitted coursework, evaluation status, and AI integrity reports
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/student/submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm transition-all shadow-xs"
        >
          <FileUp className="w-4 h-4" />
          Submit File
        </Link>
      </div>

      {/* Tabs: Official Submissions vs Pre-Flight Drafts */}
      <div className="flex border-b border-zinc-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('OFFICIAL')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-bold text-sm transition-all ${
            activeTab === 'OFFICIAL'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-zinc-500 hover:text-black hover:border-zinc-300'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Official Submissions (Final)</span>
          <span className={`px-2 py-0.5 text-xs rounded-full font-mono ${
            activeTab === 'OFFICIAL' ? 'bg-red-100 text-red-700 font-bold' : 'bg-zinc-100 text-zinc-600'
          }`}>
            {officialCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DRAFTS')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-bold text-sm transition-all ${
            activeTab === 'DRAFTS'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-zinc-500 hover:text-black hover:border-zinc-300'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Pre-Flight Scans & Drafts</span>
          <span className={`px-2 py-0.5 text-xs rounded-full font-mono ${
            activeTab === 'DRAFTS' ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-zinc-100 text-zinc-600'
          }`}>
            {draftCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by assignment title, subject, or file type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-300 rounded-xl text-sm text-black placeholder-zinc-400 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 shadow-2xs font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-zinc-300 rounded-xl px-3 py-2 text-sm text-zinc-800 font-medium focus:outline-none focus:border-red-600 shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPLOADED">Uploaded</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <LoadingSpinner fullPage text="Loading your submissions..." />
      ) : currentTabSubmissions.length === 0 ? (
        <div className="py-20 text-center space-y-4 rounded-2xl border border-dashed border-zinc-300 bg-white shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-black">
              {activeTab === 'DRAFTS' ? 'No draft scans found' : 'No official submissions found'}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'ALL'
                ? 'No items match your search or filter criteria.'
                : activeTab === 'DRAFTS'
                ? 'You do not have any pending drafts. Use Pre-flight scan when uploading an assignment to review drafts before submitting.'
                : "You haven't officially submitted any assignments yet. Select an assignment to begin."}
            </p>
          </div>
          {!searchTerm && statusFilter === 'ALL' && (
            <Link
              to="/student/submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <FileUp className="w-4 h-4" />
              {activeTab === 'DRAFTS' ? 'Upload Draft for Pre-Flight Scan' : 'Upload First Submission'}
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-700">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase font-bold text-zinc-600 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Assignment</th>
                  <th className="px-6 py-4">File Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submitted At</th>
                  <th className="px-6 py-4">Integrity Evaluation</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {currentTabSubmissions.map((sub) => {
                  const assignment = assignmentsMap[sub.assignmentId];
                  const report = reportsMap[sub.submissionId];

                  return (
                    <tr key={sub.submissionId} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-black">
                          {assignment ? assignment.title : 'Assignment'}
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5 font-medium">
                          {assignment ? assignment.subject : `ID: ${sub.assignmentId.substring(0, 8)}...`}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2.5 py-0.5 rounded-lg bg-zinc-100 text-zinc-800 font-mono text-xs border border-zinc-200 font-semibold">
                            {sub.fileType}
                          </span>
                          {activeTab === 'DRAFTS' || sub.isDraft ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>Pre-Flight Scan</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <FileCheck className="w-3 h-3 text-emerald-600" />
                              <span>Finalized</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={report?.status || sub.status} />
                      </td>

                      <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                        {formatDate(sub.submittedAt)}
                      </td>

                      <td className="px-6 py-4">
                        {report ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-black">
                                Sim: {report.plagiarismScore !== null ? `${report.plagiarismScore}%` : 'N/A'}
                              </span>
                              <span className="text-zinc-300">|</span>
                              <span className="text-xs font-bold text-black">
                                AI: {report.aiDetectionScore !== null ? `${report.aiDetectionScore}%` : 'N/A'}
                              </span>
                            </div>
                            {report.decision && (
                              <StatusBadge status={report.decision} size="sm" />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 italic flex items-center gap-1 font-medium">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            Awaiting analysis
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(activeTab === 'DRAFTS' || sub.isDraft) && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const confirmed = await submissionApi.confirmSubmission(sub.submissionId);
                                  setSubmissions((prev) =>
                                    prev.map((s) =>
                                      s.submissionId === sub.submissionId
                                        ? { ...s, isDraft: false, status: 'COMPLETED', submittedAt: confirmed.submittedAt || new Date().toISOString() }
                                        : s
                                    )
                                  );
                                  const assignment = assignmentsMap[sub.assignmentId];
                                  const rep = reportsMap[sub.submissionId];
                                  setCelebratingSubmission({
                                    assignmentTitle: assignment?.title || 'Assignment Submission',
                                    submissionId: sub.submissionId,
                                    submittedAt: confirmed.submittedAt,
                                    aiScore: rep?.aiDetectionScore ?? (sub.draftScoreAi !== null && sub.draftScoreAi !== undefined ? sub.draftScoreAi : undefined),
                                    similarityScore: rep?.plagiarismScore ?? (sub.draftScoreSimilarity !== null && sub.draftScoreSimilarity !== undefined ? sub.draftScoreSimilarity : undefined),
                                  });
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
                              title="Confirm this pre-flight draft as your final submission for grading"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Submit as Final</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setViewingSubmission({ submission: sub, report })}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold border border-zinc-200 transition-colors shadow-2xs"
                            title="View document on paper canvas with yellow highlights"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
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
                            <span className="text-xs text-zinc-400 font-medium">Processing</span>
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

      {/* Microsoft Teams Style Celebration Modal */}
      <SubmissionCelebrationModal
        isOpen={!!celebratingSubmission}
        onClose={() => setCelebratingSubmission(null)}
        assignmentTitle={celebratingSubmission?.assignmentTitle || 'Assignment Submission'}
        submissionId={celebratingSubmission?.submissionId}
        submittedAt={celebratingSubmission?.submittedAt}
        aiScore={celebratingSubmission?.aiScore}
        similarityScore={celebratingSubmission?.similarityScore}
        studentName={user?.name}
        rollNumber={user?.rollNumber}
        course={user?.course}
        semester={user?.semester}
      />

      {/* In-Browser Document Paper Canvas Modal */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">
                    Document Paper Canvas Viewer
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Assignment: {assignmentsMap[viewingSubmission.submission.assignmentId]?.title || 'Coursework'} •
                    File: {viewingSubmission.submission.fileUrl?.split(/[/\\]/).pop()?.replace(/^[0-9a-fA-F-]+_/, '') || 'Document'}
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
                studentName={user?.name}
                assignmentTitle={assignmentsMap[viewingSubmission.submission.assignmentId]?.title}
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
