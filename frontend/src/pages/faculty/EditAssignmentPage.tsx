import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { assignmentApi } from '../../api/assignmentApi';
import { getErrorMessage } from '../../api/axios';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Edit, ArrowLeft, Calendar, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';

export const EditAssignmentPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) return;
      try {
        setLoading(true);
        const data = await assignmentApi.getAssignmentById(assignmentId);
        setTitle(data.title);
        setSubject(data.subject);
        setDescription(data.description);
        // Format to YYYY-MM-DDTHH:mm for datetime-local input
        if (data.deadline) {
          const d = new Date(data.deadline);
          const formatted = d.toISOString().slice(0, 16);
          setDeadline(formatted);
        }
      } catch (err: unknown) {
        console.error('Failed to load assignment:', err);
        setErrorMsg('Failed to load assignment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentId || !title || !subject || !description || !deadline) {
      setErrorMsg('Please complete all fields.');
      return;
    }
    if (!user?.userId) {
      setErrorMsg('Session expired.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const formattedDeadline = deadline.length === 16 ? `${deadline}:00` : deadline;

      await assignmentApi.updateAssignment(assignmentId, {
        facultyId: user.userId,
        title,
        subject,
        description,
        deadline: formattedDeadline,
      });

      success('Assignment updated successfully!');
      navigate('/faculty/assignments');
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Loading assignment details..." />;
  }

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
          <Edit className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-black">Edit Assignment</h1>
          <p className="text-sm text-zinc-600">
            Update deadlines and instructions for students
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
            required
            className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5">
            Course Subject / Code *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5">
            Description & Instructions *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
            className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5">
            Submission Deadline *
          </label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
          <button
            type="button"
            onClick={() => navigate('/faculty/assignments')}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-sm transition-colors border border-zinc-300 disabled:opacity-50 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <span>Save Changes</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
