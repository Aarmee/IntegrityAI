import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { submissionApi } from '../../api/submissionApi';
import { reportApi } from '../../api/reportApi';
import { assignmentApi } from '../../api/assignmentApi';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  Activity,
  Users,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  Server,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const SystemOverviewPage: React.FC = () => {
  const [stats, setStats] = useState({
    usersCount: 0,
    submissionsCount: 0,
    reportsCount: 0,
    flaggedCount: 0,
    assignmentsCount: 0,
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const [users, subs, reports, assigns] = await Promise.all([
        authApi.getAllUsers().catch(() => []),
        submissionApi.getAllSubmissions().catch(() => []),
        reportApi.getAllReports().catch(() => []),
        assignmentApi.getAllAssignments().catch(() => []),
      ]);

      const flagged = reports.filter(
        (r) => (r.plagiarismScore || 0) >= 40 || (r.aiDetectionScore || 0) >= 50
      ).length;

      setStats({
        usersCount: users.length,
        submissionsCount: subs.length,
        reportsCount: reports.length,
        flaggedCount: flagged,
        assignmentsCount: assigns.length,
      });

      // Sort recent reports
      const sorted = [...reports].sort(
        (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      );
      setRecentReports(sorted.slice(0, 5));
    } catch (err) {
      console.error('Failed to load system overview stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const microservices = [
    { name: 'API Gateway', port: '8080', desc: 'Reverse Proxy & Central JWT Security', path: '/api/**' },
    { name: 'Auth Service', port: '8081', desc: 'PostgreSQL User Directory & JWT Issuer', path: '/api/auth/**, /api/users/**' },
    { name: 'Faculty Service', port: '8082', desc: 'Assignment Catalog & Deadlines', path: '/api/assignments/**, /api/faculty/**' },
    { name: 'Submission Service', port: '8083', desc: 'MongoDB Submission Uploads & Storage', path: '/api/submissions/**' },
    { name: 'Notification Service', port: '8084', desc: 'MongoDB User Alerts & Event Bus', path: '/api/notifications/**' },
    { name: 'Report Service', port: '8085', desc: 'MongoDB Integrity Analysis Reports', path: '/api/reports/**' },
    { name: 'AI Analysis Service', port: '8090', desc: 'Python FastAPI AI & Similarity Detector', path: '/api/analysis/**' },
  ];

  if (loading) {
    return <LoadingSpinner fullPage text="Assembling system overview..." />;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-black">System Overview & Monitoring</h1>
              <p className="text-sm text-zinc-600">
                IntegrityAI Central Microservices Control Plane
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchOverview}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold border border-zinc-300 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          Refresh Stats
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          to="/admin/users"
          className="p-6 rounded-3xl bg-white border border-zinc-200 hover:border-red-300 transition-all hover:shadow-md shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Registered Users
            </span>
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 group-hover:bg-red-100 transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-black mt-2">{stats.usersCount}</p>
          <div className="flex items-center gap-1 text-xs text-red-700 mt-3 font-semibold">
            <span>Manage user accounts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/submissions"
          className="p-6 rounded-3xl bg-white border border-zinc-200 hover:border-zinc-400 transition-all hover:shadow-md shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Submissions
            </span>
            <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-800 group-hover:bg-zinc-200 transition-colors">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-black mt-2">{stats.submissionsCount}</p>
          <div className="flex items-center gap-1 text-xs text-zinc-800 mt-3 font-semibold">
            <span>View all submissions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/reports"
          className="p-6 rounded-3xl bg-white border border-zinc-200 hover:border-zinc-400 transition-all hover:shadow-md shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Reports Generated
            </span>
            <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-800 group-hover:bg-zinc-200 transition-colors">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-black mt-2">{stats.reportsCount}</p>
          <div className="flex items-center gap-1 text-xs text-zinc-800 mt-3 font-semibold">
            <span>Inspect report analyses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/reports"
          className="p-6 rounded-3xl bg-white border border-zinc-200 hover:border-red-400 transition-all hover:shadow-md shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Flagged Submissions
            </span>
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 group-hover:bg-red-100 transition-colors">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-red-600 mt-2">{stats.flaggedCount}</p>
          <div className="flex items-center gap-1 text-xs text-red-600 mt-3 font-semibold">
            <span>Review flagged integrity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Microservices Cluster Architecture Map */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-black flex items-center gap-2">
            <Server className="w-5 h-5 text-red-600" />
            Connected Academic Services Architecture
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-zinc-100 text-zinc-900 border border-zinc-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-red-600" />
            Healthy & Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {microservices.map((ms) => (
            <div
              key={ms.name}
              className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-black text-sm">{ms.name}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white text-red-700 border border-zinc-200 shadow-sm font-semibold">
                  :{ms.port}
                </span>
              </div>
              <p className="text-xs text-zinc-600">{ms.desc}</p>
              <div className="text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-200 truncate">
                Routes: {ms.path}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-black flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-red-600" />
            Recent Integrity Evaluations
          </h2>
          <Link
            to="/admin/reports"
            className="text-xs text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 font-semibold"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">
            No evaluation reports recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {recentReports.map((r) => (
              <div
                key={r.reportId}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-black font-mono">
                    Submission #{r.submissionId.substring(0, 10)}...
                  </div>
                  <p className="text-zinc-600 text-[11px] mt-0.5 truncate max-w-md">
                    {r.summary || 'Integrity analysis complete'}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={`font-semibold px-2.5 py-0.5 rounded-full border text-[11px] ${
                      (r.plagiarismScore || 0) >= 40
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                    }`}
                  >
                    Sim: {r.plagiarismScore !== null ? `${r.plagiarismScore}%` : 'N/A'}
                  </span>

                  <span
                    className={`font-semibold px-2.5 py-0.5 rounded-full border text-[11px] ${
                      (r.aiDetectionScore || 0) >= 50
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                    }`}
                  >
                    AI: {r.aiDetectionScore !== null ? `${r.aiDetectionScore}%` : 'N/A'}
                  </span>

                  <Link
                    to={`/reports/${r.submissionId}`}
                    className="p-1.5 rounded-lg bg-zinc-50 hover:bg-red-50 text-zinc-600 hover:text-red-600 border border-zinc-200 hover:border-red-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
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
