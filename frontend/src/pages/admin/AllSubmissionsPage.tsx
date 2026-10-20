import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { submissionApi } from '../../api/submissionApi';
import { reportApi } from '../../api/reportApi';
import { assignmentApi } from '../../api/assignmentApi';
import { authApi } from '../../api/authApi';
import { Submission, Report, Assignment, User as UserType } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  Layers,
  Search,
  Filter,
  ExternalLink,
  RefreshCw,
  FileText,
  User,
  BookOpen,
} from 'lucide-react';

export const AllSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reportsMap, setReportsMap] = useState<Record<string, Report>>({});
  const [assignmentsMap, setAssignmentsMap] = useState<Record<string, Assignment>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subs, allAssigns] = await Promise.all([
        submissionApi.getAllSubmissions(),
        assignmentApi.getAllAssignments().catch(() => [] as Assignment[]),
      ]);

      // Resolve student profiles from auth-service
      const studentProfileMap = new Map<string, UserType>();
      const uniqueStudentIds = Array.from(new Set(subs.map((s) => s.studentId).filter(Boolean)));
      await Promise.all(
        uniqueStudentIds.map(async (sid) => {
          try {
            const studentUser = await authApi.getUserById(sid);
            if (studentUser) {
              studentProfileMap.set(sid, studentUser);
            }
          } catch {
            // ignore
          }
        })
      );

      const enrichedSubs = subs.map((s) => {
        const profile = studentProfileMap.get(s.studentId);
        return {
          ...s,
          studentName:
            profile?.name && profile.name.trim() !== ''
              ? profile.name
              : s.studentName && s.studentName !== 'Student'
              ? s.studentName
              : profile?.email
              ? profile.email.split('@')[0]
              : s.studentName || 'Student',
          rollNumber:
            profile?.rollNumber && profile.rollNumber.trim() !== ''
              ? profile.rollNumber
              : s.rollNumber && s.rollNumber !== 'N/A'
              ? s.rollNumber
              : 'N/A',
          course: profile?.course || s.course,
          semester: profile?.semester || s.semester,
        };
      });

      setSubmissions(enrichedSubs);

      const aMap: Record<string, Assignment> = {};
      allAssigns.forEach((a) => {
        aMap[a.assignmentId] = a;
      });
      setAssignmentsMap(aMap);

      // Fetch reports
      const rMap: Record<string, Report> = {};
      await Promise.all(
        subs.map(async (s) => {
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
      setReportsMap(rMap);
    } catch (err) {
      console.error('Failed to load all submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSubmissions = submissions.filter((sub) => {
    const assignment = assignmentsMap[sub.assignmentId];
    const matchSearch =
      sub.submissionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.assignmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.fileType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assignment && assignment.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const report = reportsMap[sub.submissionId];
    const effectiveStatus = report?.status || sub.status;
    const matchStatus =
      statusFilter === 'ALL' || effectiveStatus.toUpperCase() === statusFilter.toUpperCase();

    return matchSearch && matchStatus;
  });

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-black">All Student Submissions</h1>
              <p className="text-sm text-zinc-600">
                System-wide student uploads across all assignments (GET /api/submissions)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold border border-zinc-300 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by submission ID, student UUID, assignment title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-zinc-300 rounded-xl px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 shadow-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPLOADED">Uploaded</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner fullPage text="Retrieving all submissions..." />
      ) : filteredSubmissions.length === 0 ? (
        <div className="py-20 text-center space-y-3 rounded-2xl border border-dashed border-zinc-300 bg-white">
          <FileText className="w-8 h-8 text-zinc-400 mx-auto" />
          <p className="text-zinc-600 text-sm">No submissions match your search</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-700">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase font-semibold text-zinc-600 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Submission UUID</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Assignment</th>
                  <th className="px-6 py-4">File Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submitted At</th>
                  <th className="px-6 py-4 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredSubmissions.map((sub) => {
                  const assignment = assignmentsMap[sub.assignmentId];
                  const report = reportsMap[sub.submissionId];

                  return (
                    <tr key={sub.submissionId} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                        <span title={sub.submissionId}>
                          {sub.submissionId.substring(0, 10)}...
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-black capitalize">
                          {sub.studentName || 'Student'}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono">
                          Roll: {sub.rollNumber || 'N/A'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-black">
                          {assignment ? assignment.title : 'Assignment'}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono">
                          {sub.assignmentId.substring(0, 8)}...
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 font-semibold uppercase">
                          {sub.fileType}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={report?.status || sub.status} />
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-zinc-500 whitespace-nowrap">
                        {formatDate(sub.submittedAt)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {report ? (
                          <Link
                            to={`/reports/${sub.submissionId}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition-colors"
                          >
                            <span>Report</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <span className="text-xs text-zinc-400">None</span>
                        )}
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
  );
};
