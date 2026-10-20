import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { assignmentApi } from '../../api/assignmentApi';
import { getErrorMessage } from '../../api/axios';
import { PlusCircle, ArrowLeft, Calendar, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';

export const CreateAssignmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [targetCourse, setTargetCourse] = useState(user?.assignedCourses?.[0] || 'B.Tech - Computer Science & Engineering');
  const [targetSemester, setTargetSemester] = useState('Semester 6');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !description || !deadline) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (!user?.userId) {
      setErrorMsg('Faculty session invalid. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      // Spring Boot LocalDateTime expects ISO string like "2026-10-15T23:59:00"
      const formattedDeadline = deadline.length === 16 ? `${deadline}:00` : deadline;

      await assignmentApi.createAssignment({
        facultyId: user.userId,
        title,
        subject,
        description,
        deadline: formattedDeadline,
        targetCourse,
        targetSemester,
      });

      success('Assignment created successfully!');
      navigate('/faculty/assignments');
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200">
        <button
          onClick={() => navigate('/faculty/assignments')}
          className="flex items-center gap-2 text-sm text-zinc-600 hover:text-black transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-black">Create New Assignment</h1>
          <p className="text-sm text-zinc-600">
            Publish an assignment prompt for students to submit and analyze
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5">
            Assignment Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Distributed Systems Lab 3: Raft Consensus"
            required
            className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5">
              Course Subject / Code *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. CS410 - Cloud Computing"
              required
              className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5">
              Target Academic Degree / Program *
            </label>
            <select
              value={targetCourse}
              onChange={(e) => setTargetCourse(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-zinc-900 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
            >
              <option value="All Programs">All Programs</option>
              <option value="B.Tech - Computer Science & Engineering">B.Tech - Computer Science & Engineering</option>
              <option value="B.Tech - Information Technology">B.Tech - Information Technology</option>
              <option value="B.Tech - AI & Data Science">B.Tech - AI & Data Science</option>
              <option value="B.Tech - Electronics & Communication">B.Tech - Electronics & Communication</option>
              <option value="BCA - Bachelor of Computer Applications">BCA - Bachelor of Computer Applications</option>
              <option value="MCA - Master of Computer Applications">MCA - Master of Computer Applications</option>
              <option value="M.Tech - Computer Science">M.Tech - Computer Science</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5">
            Target Semester *
          </label>
          <select
            value={targetSemester}
            onChange={(e) => setTargetSemester(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-zinc-900 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
          >
            <option value="All Semesters">All Semesters</option>
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

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5">
            Description & Submission Instructions *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Detail the expectations, allowable materials, required file formats, and citation policies..."
            required
            className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5">
            Submission Deadline *
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Specify the date and time after which submissions may be flagged as late.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
          <button
            type="button"
            onClick={() => navigate('/faculty/assignments')}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-sm transition-colors border border-zinc-300 disabled:opacity-50 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <span>Publish Assignment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
