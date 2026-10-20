import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { assignmentApi } from '../../api/assignmentApi';
import { Assignment } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ConfirmModal } from '../../components/ConfirmModal';
import {
  BookOpen,
  PlusCircle,
  Calendar,
  Layers,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Clock,
} from 'lucide-react';

export const MyAssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAssignments = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const data = await assignmentApi.getAssignmentsByFaculty(user.userId);
      setAssignments(data);
    } catch (err) {
      console.error('Failed to load faculty assignments:', err);
      toastError('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user?.userId]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await assignmentApi.deleteAssignment(deleteTarget.assignmentId);
      success(`Assignment "${deleteTarget.title}" deleted.`);
      setAssignments((prev) =>
        prev.filter((a) => a.assignmentId !== deleteTarget.assignmentId)
      );
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete assignment:', err);
      toastError('Could not delete assignment. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse =
      selectedCourse === 'ALL' ||
      !a.targetCourse ||
      a.targetCourse === 'All Programs' ||
      a.targetCourse === selectedCourse;

    const matchesSemester =
      selectedSemester === 'ALL' ||
      !a.targetSemester ||
      a.targetSemester === 'All Semesters' ||
      a.targetSemester === selectedSemester;

    return matchesSearch && matchesCourse && matchesSemester;
  });

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
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-black">My Course Assignments</h1>
              <p className="text-sm text-zinc-600">
                Manage coursework deadlines, student submissions, and academic integrity evaluations
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/faculty/assignments/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Create Assignment
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, subject, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-800 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 shadow-sm"
          >
            <option value="ALL">All Degree Programs</option>
            <option value="B.Tech - Computer Science & Engineering">B.Tech - CSE</option>
            <option value="B.Tech - Information Technology">B.Tech - IT</option>
            <option value="B.Tech - AI & Data Science">B.Tech - AI & DS</option>
            <option value="BCA - Bachelor of Computer Applications">BCA</option>
            <option value="MCA - Master of Computer Applications">MCA</option>
            <option value="M.Tech - Computer Science">M.Tech - CS</option>
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-800 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 shadow-sm"
          >
            <option value="ALL">All Semesters</option>
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 2">Semester 2</option>
            <option value="Semester 3">Semester 3</option>
            <option value="Semester 4">Semester 4</option>
            <option value="Semester 5">Semester 5</option>
            <option value="Semester 6">Semester 6</option>
            <option value="Semester 7">Semester 7</option>
            <option value="Semester 8">Semester 8</option>
          </select>
        </div>
      </div>

      {/* Assignments Table / List */}
      {loading ? (
        <LoadingSpinner fullPage text="Loading your assignments..." />
      ) : filteredAssignments.length === 0 ? (
        <div className="py-20 text-center space-y-4 rounded-2xl border border-dashed border-zinc-300 bg-white">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-black">No assignments created yet</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Create an assignment for your course so students can begin submitting work for integrity checking.
            </p>
          </div>
          <Link
            to="/faculty/assignments/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create Your First Assignment
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-700">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase font-semibold text-zinc-600 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title & Subject</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredAssignments.map((a) => (
                  <tr key={a.assignmentId} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-black">{a.title}</div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          {a.subject}
                        </span>
                        {a.targetCourse && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {a.targetCourse}
                          </span>
                        )}
                        {a.targetSemester && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                            {a.targetSemester}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs text-zinc-600 truncate">{a.description}</p>
                    </td>

                    <td className="px-6 py-4 text-xs font-mono text-zinc-700 whitespace-nowrap">
                      {formatDate(a.deadline)}
                    </td>

                    <td className="px-6 py-4 text-xs font-mono text-zinc-500 whitespace-nowrap">
                      {formatDate(a.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/faculty/assignments/${a.assignmentId}/submissions`}
                          title="View submissions"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition-colors"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Submissions</span>
                        </Link>

                        <Link
                          to={`/faculty/assignments/edit/${a.assignmentId}`}
                          title="Edit assignment"
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-black border border-zinc-200 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(a)}
                          title="Delete assignment"
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 border border-zinc-200 hover:border-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Assignment"
        message={`Are you sure you want to delete assignment "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete Assignment"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
