import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileCheck2,
  Calendar,
  Award,
  Layers,
  PartyPopper,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface SubmissionCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentTitle: string;
  submissionId?: string;
  submittedAt?: string;
  aiScore?: number;
  similarityScore?: number;
  studentName?: string;
  rollNumber?: string;
  course?: string;
  semester?: string;
}

export const SubmissionCelebrationModal: React.FC<SubmissionCelebrationModalProps> = ({
  isOpen,
  onClose,
  assignmentTitle,
  submissionId,
  submittedAt,
  aiScore,
  similarityScore,
  studentName,
  rollNumber,
  course,
  semester,
}) => {
  const navigate = useNavigate();

  const fireTeamsConfetti = useCallback(() => {
    // Left cannon
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 70,
      origin: { x: 0.1, y: 0.75 },
      colors: ['#dc2626', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
    });

    // Right cannon
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 70,
      origin: { x: 0.9, y: 0.75 },
      colors: ['#dc2626', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
    });

    // Star burst from center
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#ef4444', '#f59e0b', '#10b981', '#fbbf24', '#ffffff'],
      });
    }, 250);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fireTeamsConfetti();
    }
  }, [isOpen, fireTeamsConfetti]);

  if (!isOpen) return null;

  const formattedTime = submittedAt
    ? new Date(submittedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Top Celebration Decorative Banner */}
        <div className="relative bg-gradient-to-r from-red-600 via-rose-600 to-red-700 pt-8 pb-14 px-6 text-center text-white overflow-hidden">
          {/* Subtle background sparkles */}
          <div className="absolute top-2 left-6 animate-sparkle">
            <Sparkles className="w-5 h-5 text-amber-300 opacity-80" />
          </div>
          <div className="absolute top-6 right-8 animate-sparkle delay-150">
            <Sparkles className="w-6 h-6 text-yellow-200 opacity-70" />
          </div>
          <div className="absolute bottom-3 left-12 animate-float">
            <Sparkles className="w-4 h-4 text-rose-200 opacity-60" />
          </div>

          {/* Microsoft Teams style character/rocket animation */}
          <div className="relative mx-auto w-24 h-24 mb-3 flex items-center justify-center animate-rocket">
            {/* Outer glowing rings */}
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-30" />
            <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-red-600 border-2 border-red-100 transform rotate-3 hover:rotate-0 transition-transform">
              <span className="text-4xl select-none" role="img" aria-label="Rocket Launch">
                🚀
              </span>
            </div>
            {/* Celebration badge overlay */}
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1.5 shadow-md border-2 border-white">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
            Woohoo! Turned In!
          </h2>
          <p className="text-xs sm:text-sm text-red-100 font-medium mt-1">
            Way to go! Your assignment has been officially submitted for faculty grading.
          </p>
        </div>

        {/* Submission Receipt Card (Overlapping Banner) */}
        <div className="px-6 -mt-8 relative z-10 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-md p-5 space-y-3">
            <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full inline-block mb-1">
                  Official Submission Receipt
                </span>
                <h3 className="font-extrabold text-base text-zinc-900 leading-snug line-clamp-2">
                  {assignmentTitle}
                </h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Turned In
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="text-[10px] font-semibold text-zinc-500 block uppercase">
                  Turned In At
                </span>
                <span className="font-medium text-zinc-800 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  {formattedTime}
                </span>
              </div>

              {(studentName || rollNumber) && (
                <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] font-semibold text-zinc-500 block uppercase">
                    Student Details
                  </span>
                  <span className="font-medium text-zinc-800 truncate block mt-0.5">
                    {studentName} {rollNumber ? `(${rollNumber})` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* AI Scan Score Summary if available */}
            {aiScore !== undefined && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-zinc-50 to-red-50/30 border border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-zinc-700">Pre-flight Integrity Check:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      aiScore <= 20
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : aiScore <= 50
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    AI Likelihood: {Math.round(aiScore)}%
                  </span>
                  {similarityScore !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800 border border-zinc-300">
                      Plagiarism: {Math.round(similarityScore)}%
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 pb-6 space-y-2.5">
            <button
              onClick={() => {
                onClose();
                navigate('/student/submissions');
              }}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>View My Submissions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={fireTeamsConfetti}
                className="py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PartyPopper className="w-3.5 h-3.5 text-red-600" />
                <span>Celebrate Again! 🎉</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/dashboard');
                }}
                className="py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
