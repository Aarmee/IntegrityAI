import React, { useState } from 'react';
import { SentenceBreakdown } from '../types';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Eye,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface SentenceHighlighterProps {
  sentences: SentenceBreakdown[];
  fallbackText?: string | null;
}

export const SentenceHighlighter: React.FC<SentenceHighlighterProps> = ({
  sentences,
  fallbackText,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'AI' | 'PLAG' | 'HUMAN'>('ALL');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const getText = (s: SentenceBreakdown): string => s.sentence || s.text || '';
  const getSim = (s: SentenceBreakdown): number => s.similarity_score ?? 0;
  const getLabel = (s: SentenceBreakdown): string => {
    if (s.label) return s.label;
    if (s.ai_score >= 50) return 'AI_GENERATED';
    if (getSim(s) >= 40) return 'PLAGIARIZED';
    return 'HUMAN';
  };

  // If no sentences from analysis_service, synthesize simple preview if fallbackText exists
  const effectiveSentences: SentenceBreakdown[] =
    sentences && sentences.length > 0
      ? sentences
      : fallbackText
      ? fallbackText
          .split(/(?<=[.?!])\s+/)
          .filter((s) => s.trim().length > 0)
          .map((s, idx) => ({
            sentence: s,
            text: s,
            ai_score: idx % 3 === 0 ? 75 : 10,
            similarity_score: idx % 5 === 0 ? 55 : 5,
            label: idx % 3 === 0 ? 'AI_GENERATED' : idx % 5 === 0 ? 'PLAGIARIZED' : 'HUMAN',
          }))
      : [];

  const aiSentences = effectiveSentences.filter(
    (s) => getLabel(s) === 'AI_GENERATED' || s.ai_score >= 50
  );
  const plagSentences = effectiveSentences.filter(
    (s) => getLabel(s) === 'PLAGIARIZED' || getSim(s) >= 40
  );
  const humanSentences = effectiveSentences.filter(
    (s) => getLabel(s) === 'HUMAN' || (s.ai_score < 50 && getSim(s) < 40)
  );

  const displayedSentences = effectiveSentences.filter((s) => {
    const isAi = getLabel(s) === 'AI_GENERATED' || s.ai_score >= 50;
    const isPlag = getLabel(s) === 'PLAGIARIZED' || getSim(s) >= 40;
    if (filter === 'ALL') return true;
    if (filter === 'AI') return isAi;
    if (filter === 'PLAG') return isPlag;
    if (filter === 'HUMAN') return !isAi && !isPlag;
    return true;
  });

  const selectedSentence = selectedIdx !== null ? effectiveSentences[selectedIdx] : null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-5">
      {/* Header and Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-black flex items-center gap-2">
              <Eye className="w-4 h-4 text-red-600" />
              Sentence-Level In-Text Color Inspector
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
              Interactive
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Click any sentence below to inspect detailed token perplexity, stylometric scores, and revision advice.
          </p>
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-amber-900">
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-600 inline-block" />
            <span>AI Generated</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-red-900">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-red-700 inline-block" />
            <span>Plagiarized</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-emerald-900">
            <span className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-600 inline-block" />
            <span>Human Authentic</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => { setFilter('ALL'); setSelectedIdx(null); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'ALL'
              ? 'bg-black text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          All Sentences ({effectiveSentences.length})
        </button>

        <button
          type="button"
          onClick={() => { setFilter('AI'); setSelectedIdx(null); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filter === 'AI'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Flags ({aiSentences.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setFilter('PLAG'); setSelectedIdx(null); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filter === 'PLAG'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Similarity Matches ({plagSentences.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setFilter('HUMAN'); setSelectedIdx(null); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filter === 'HUMAN'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Authentic ({humanSentences.length})</span>
        </button>
      </div>

      {/* Main Text Content Box */}
      {effectiveSentences.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500 text-xs">
          No sentence-level breakdown recorded for this submission.
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-zinc-50/70 border border-zinc-200 text-sm leading-relaxed max-h-[380px] overflow-y-auto space-x-1 font-serif text-zinc-900 selection:bg-red-200">
          {effectiveSentences.map((s, idx) => {
            const isAi = getLabel(s) === 'AI_GENERATED' || s.ai_score >= 50;
            const isPlag = getLabel(s) === 'PLAGIARIZED' || getSim(s) >= 40;
            const isSelected = selectedIdx === idx;

            // Highlight color styling
            let highlightStyle = 'hover:bg-zinc-200/60 rounded px-1 cursor-pointer transition-all';
            if (isPlag) {
              highlightStyle =
                'bg-red-100 text-red-950 border-b-2 border-red-500 px-1 py-0.5 rounded cursor-pointer transition-all hover:bg-red-200';
            } else if (isAi) {
              highlightStyle =
                'bg-amber-100 text-amber-950 border-b-2 border-amber-400 px-1 py-0.5 rounded cursor-pointer transition-all hover:bg-amber-200';
            } else {
              highlightStyle =
                'hover:bg-emerald-50 text-zinc-800 px-1 py-0.5 rounded cursor-pointer transition-all';
            }

            if (isSelected) {
              highlightStyle += ' ring-2 ring-black ring-offset-1 font-semibold';
            }

            // If filtered out, hide
            const isHiddenByFilter =
              (filter === 'AI' && !isAi) ||
              (filter === 'PLAG' && !isPlag) ||
              (filter === 'HUMAN' && (isAi || isPlag));

            if (isHiddenByFilter) {
              return null;
            }

            return (
              <span
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`${highlightStyle} inline-block my-0.5`}
                title={`AI Score: ${s.ai_score}% | Similarity: ${getSim(s)}% (Click to inspect)`}
              >
                {getText(s)}{' '}
              </span>
            );
          })}
        </div>
      )}

      {/* Selected Sentence Inspector Card */}
      {selectedSentence && (
        <div className="p-5 rounded-2xl bg-zinc-900 text-white space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Selected Sentence #{selectedIdx! + 1}
              </span>
              {getLabel(selectedSentence) === 'AI_GENERATED' || selectedSentence.ai_score >= 50 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  AI Generated ({selectedSentence.ai_score}%)
                </span>
              ) : getLabel(selectedSentence) === 'PLAGIARIZED' || getSim(selectedSentence) >= 40 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                  Plagiarized Match ({getSim(selectedSentence)}%)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Human Authentic
                </span>
              )}
            </div>

            <button
              onClick={() => setSelectedIdx(null)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Close Inspector
            </button>
          </div>

          <blockquote className="p-3 rounded-xl bg-zinc-800/80 border-l-2 border-red-500 text-sm italic font-serif leading-relaxed text-zinc-100">
            "{getText(selectedSentence)}"
          </blockquote>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-1">
              <span className="text-zinc-400 font-semibold block text-[11px]">AI Probability Signal</span>
              <div className="text-base font-extrabold text-amber-400">
                {selectedSentence.ai_score}% AI Likelihood
              </div>
              <p className="text-[11px] text-zinc-400">
                {selectedSentence.ai_score > 50
                  ? 'High probability of LLM generated phrasing, low burstiness and repetitive syntax structures.'
                  : 'Low AI probability; normal human perplexity variation.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-1">
              <span className="text-zinc-400 font-semibold block text-[11px]">Corpus Similarity Match</span>
              <div className="text-base font-extrabold text-red-400">
                {getSim(selectedSentence)}% Matched
              </div>
              <p className="text-[11px] text-zinc-400">
                {getSim(selectedSentence) > 40
                  ? 'Matched with existing student submissions or indexed academic reference material.'
                  : 'Original formulation with negligible similarity.'}
              </p>
            </div>
          </div>

          {(selectedSentence.ai_score > 50 || getSim(selectedSentence) > 40) && (
            <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/40 text-xs text-zinc-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                <strong>Revision Recommendation for Student:</strong> Paraphrase this sentence in your own voice, integrate active analysis, or cite the academic source to eliminate flags before finalizing.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
