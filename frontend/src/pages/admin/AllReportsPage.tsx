import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportApi } from '../../api/reportApi';
import { Report } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  FileSpreadsheet,
  Search,
  Filter,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export const AllReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportApi.getAllReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load all reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchSearch =
      r.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.submissionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.summary && r.summary.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchRisk = true;
    if (riskFilter === 'HIGH') {
      matchRisk = r.riskScore === 'High' || (r.plagiarismScore || 0) >= 50 || (r.aiDetectionScore || 0) >= 70;
    } else if (riskFilter === 'MEDIUM') {
      matchRisk = r.riskScore === 'Medium' || ((r.plagiarismScore || 0) >= 20 && (r.plagiarismScore || 0) < 50);
    } else if (riskFilter === 'LOW') {
      matchRisk = r.riskScore === 'Low' || ((r.plagiarismScore || 0) < 20 && (r.aiDetectionScore || 0) < 30);
    }

    return matchSearch && matchRisk;
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
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-black">All Academic Reports</h1>
              <p className="text-sm text-zinc-600">
                System-wide multi-signal integrity evaluations: Plagiarism, AI Probability, and Code Similarity
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold border border-zinc-300 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          Refresh
        </button>
      </div>

      {/* Search and Risk Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by report UUID, submission UUID, student UUID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as any)}
            className="bg-white border border-zinc-300 rounded-xl px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 shadow-sm"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <LoadingSpinner fullPage text="Retrieving all reports..." />
      ) : filteredReports.length === 0 ? (
        <div className="py-20 text-center space-y-3 rounded-2xl border border-dashed border-zinc-300 bg-white">
          <FileSpreadsheet className="w-8 h-8 text-zinc-400 mx-auto" />
          <p className="text-zinc-600 text-sm">No reports match criteria</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-700">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase font-semibold text-zinc-600 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Submission UUID</th>
                  <th className="px-6 py-4">Unified Risk</th>
                  <th className="px-6 py-4">Text Plagiarism</th>
                  <th className="px-6 py-4">AI Probability</th>
                  <th className="px-6 py-4">Code Sim</th>
                  <th className="px-6 py-4">Decision</th>
                  <th className="px-6 py-4">Generated At</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredReports.map((r) => (
                  <tr key={r.reportId} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-600">
                      <span className="font-bold text-black" title={r.submissionId}>
                        {r.submissionId.substring(0, 10)}...
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {r.riskScore === 'High' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                          High Risk
                        </span>
                      ) : r.riskScore === 'Medium' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Medium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                          Low Risk
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {r.plagiarismScore !== null ? (
                        <span
                          className={`font-semibold text-xs px-2.5 py-1 rounded-full border ${
                            r.plagiarismScore >= 50
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : r.plagiarismScore >= 20
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                          }`}
                        >
                          {r.plagiarismScore.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-xs">N/A</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {r.aiDetectionScore !== null ? (
                        <span
                          className={`font-semibold text-xs px-2.5 py-1 rounded-full border ${
                            r.aiDetectionScore >= 70
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : r.aiDetectionScore >= 30
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                          }`}
                        >
                          {r.aiDetectionScore.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-xs">N/A</span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs">
                      {r.codeSimilarityScore !== undefined && r.codeSimilarityScore !== null ? (
                        <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 font-semibold">
                          {r.codeSimilarityScore.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-zinc-400">0.0%</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={r.decision || r.status} />
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-zinc-500 whitespace-nowrap">
                      {formatDate(r.generatedAt)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/reports/${r.submissionId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition-colors"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
