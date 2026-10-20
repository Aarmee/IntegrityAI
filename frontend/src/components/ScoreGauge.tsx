import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Code2 } from 'lucide-react';

interface ScoreGaugeProps {
  score: number | null | undefined;
  type: 'plagiarism' | 'ai' | 'code';
  title?: string;
  showBar?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  type,
  title,
  showBar = true,
}) => {
  const displayScore = score !== null && score !== undefined ? Math.min(100, Math.max(0, score)) : null;

  const isAi = type === 'ai';
  const isCode = type === 'code';
  const lowThreshold = isAi ? 30 : 25;
  const highThreshold = isAi ? 70 : 60;

  let riskLevel: 'low' | 'moderate' | 'high' = 'low';
  let color = 'text-zinc-900';
  let bgColor = 'bg-zinc-800';
  let badgeBg = 'bg-zinc-100 text-zinc-800 border-zinc-200';
  let label = isAi ? 'Likely Human' : isCode ? 'Original Code' : 'Original Content';
  let Icon = isCode ? Code2 : ShieldCheck;

  if (displayScore !== null) {
    if (displayScore >= highThreshold) {
      riskLevel = 'high';
      color = 'text-red-700';
      bgColor = 'bg-red-600';
      badgeBg = 'bg-red-50 text-red-800 border-red-300 font-bold';
      label = isAi ? 'High AI Content' : isCode ? 'Code Duplication' : 'High Similarity';
      Icon = ShieldAlert;
    } else if (displayScore >= lowThreshold) {
      riskLevel = 'moderate';
      color = 'text-amber-700';
      bgColor = 'bg-amber-600';
      badgeBg = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
      label = 'Moderate Risk';
      Icon = AlertTriangle;
    } else {
      color = 'text-zinc-900';
      bgColor = 'bg-emerald-600';
      badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  }

  const defaultTitle = isAi ? 'AI-Generated Content' : isCode ? 'Code Plagiarism Similarity' : 'Text Similarity Score';

  return (
    <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs hover:shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
            {title || defaultTitle}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-3xl font-extrabold tracking-tight ${displayScore !== null ? color : 'text-zinc-400'}`}>
              {displayScore !== null ? `${displayScore.toFixed(1)}%` : 'N/A'}
            </span>
            {displayScore !== null && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeBg}`}>
                <Icon className="w-3 h-3" />
                {label}
              </span>
            )}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${riskLevel === 'high' ? 'bg-red-50 text-red-600 border border-red-200' : riskLevel === 'moderate' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {showBar && (
        <div className="mt-3">
          <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${bgColor}`}
              style={{ width: `${displayScore !== null ? displayScore : 0}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-1.5 font-medium">
            <span>0% (Clean)</span>
            <span>{lowThreshold}%</span>
            <span>{highThreshold}%</span>
            <span className="text-red-600 font-semibold">100% (Flagged)</span>
          </div>
        </div>
      )}
    </div>
  );
};
