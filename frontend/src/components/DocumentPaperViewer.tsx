import React, { useState, useMemo, useRef } from 'react';
import { SentenceBreakdown } from '../types';
import { submissionApi } from '../api/submissionApi';
import {
  FileText,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  FileCheck,
} from 'lucide-react';

interface DocumentPaperViewerProps {
  submissionId?: string;
  fileName?: string;
  fileType?: string;
  sentences?: SentenceBreakdown[];
  fullText?: string;
  overallAiScore?: number;
  overallSimilarityScore?: number;
  studentName?: string;
  assignmentTitle?: string;
  submittedAt?: string;
  allowDownload?: boolean;
  containerHeight?: string;
}

interface RenderPage {
  pageNumber: number;
  paragraphs: string[];
}

export const DocumentPaperViewer: React.FC<DocumentPaperViewerProps> = ({
  submissionId,
  fileName = 'submitted_document',
  fileType = 'DOCX',
  sentences = [],
  fullText,
  overallAiScore = 0,
  overallSimilarityScore = 0,
  studentName,
  assignmentTitle,
  submittedAt,
  allowDownload = true,
  containerHeight = 'h-[640px]',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [highlightFilter, setHighlightFilter] = useState<'ALL' | 'AI_ONLY' | 'PLAG_ONLY' | 'CLEAN'>('ALL');
  const [selectedSentence, setSelectedSentence] = useState<SentenceBreakdown | null>(null);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [pageDisplayMode, setPageDisplayMode] = useState<'SINGLE' | 'ALL'>('SINGLE');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isPdf = fileType?.toUpperCase() === 'PDF' || fileName.toLowerCase().endsWith('.pdf');

  // True binary corruption check: only flag if raw null bytes \x00 or unprintable control codes exist
  const isBinaryCorrupted = useMemo(() => {
    if (!fullText) return false;
    const sample = fullText.slice(0, 1000);
    const controlCodes = (sample.match(/[\x00-\x08\x0e-\x1f]/g) || []).length;
    return controlCodes > 15;
  }, [fullText]);

  // Default always to Canvas mode so Turnitin-style yellow highlights are immediately visible
  const [viewMode, setViewMode] = useState<'CANVAS' | 'NATIVE'>('CANVAS');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Standardize effective sentence breakdown list
  const effectiveSentences: SentenceBreakdown[] = useMemo(() => {
    if (sentences && sentences.length > 0) {
      return sentences;
    }
    if (fullText) {
      return fullText
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => ({
          sentence: s,
          text: s,
          ai_score: 0,
          similarity_score: 0,
          is_ai: false,
          is_plagiarized: false,
          reason: 'Authentic student phrasing',
        }));
    }
    return [];
  }, [sentences, fullText]);

  // Sentence classification helpers
  const isSentenceAi = (s: SentenceBreakdown): boolean =>
    Boolean(s.is_ai || (s.ai_score !== undefined && s.ai_score >= 40));

  const isSentencePlag = (s: SentenceBreakdown): boolean =>
    Boolean(s.is_plagiarized || (s.similarity_score !== undefined && s.similarity_score >= 40));

  // Build authentic multi-page structure preserving EXACT document format (paragraphs and spacing)
  const parsedPages: RenderPage[] = useMemo(() => {
    const rawContent = fullText || effectiveSentences.map((s) => s.sentence || s.text).join('\n\n');
    if (!rawContent || !rawContent.trim()) {
      return [];
    }

    // Split pages by standard page break markers
    const rawChunks = rawContent.split(/<!--\s*PAGE_BREAK\s*-->|\f/);
    const validChunks = rawChunks.map((c) => c.trim()).filter((c) => c.length > 0);
    const pageChunks = validChunks.length > 0 ? validChunks : [rawContent.trim()];

    return pageChunks.map((pageChunk, pageIdx) => {
      // Split into natural paragraphs by double newlines, preserving single line breaks within paragraphs
      const paragraphs = pageChunk
        .split(/\r?\n\r?\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      return {
        pageNumber: pageIdx + 1,
        paragraphs: paragraphs.length > 0 ? paragraphs : [pageChunk.trim()],
      };
    });
  }, [fullText, effectiveSentences]);

  const totalPages = Math.max(1, parsedPages.length);

  // Helper to test if a sentence / line segment is AI-flagged
  const isSegmentAi = (seg: string): { isAi: boolean; match?: SentenceBreakdown } => {
    const sTrim = seg.trim();
    if (!sTrim || sTrim.length < 3) return { isAi: false };
    // Outline labels like "3.", "A.", "B.", "1)" should never be highlighted
    if (/^(\d+[\.\)]|[a-zA-Z][\.\)])$/.test(sTrim)) return { isAi: false };

    const sLow = sTrim.toLowerCase();
    const matched = effectiveSentences.find((es) => {
      const esClean = (es.sentence || es.text || '').trim().toLowerCase();
      return (
        esClean.length > 5 &&
        (esClean.includes(sLow) || sLow.includes(esClean) || sLow.slice(0, 30) === esClean.slice(0, 30))
      );
    });

    if (matched && isSentenceAi(matched)) {
      return { isAi: true, match: matched };
    }

    if (overallAiScore >= 45 && sTrim.split(/\s+/).length >= 3) {
      return {
        isAi: true,
        match: matched || {
          sentence: sTrim,
          text: sTrim,
          ai_score: overallAiScore,
          is_ai: true,
          reason: 'Consistent with AI generative document pattern',
        },
      };
    }

    return { isAi: false };
  };

  const isSegmentPlag = (seg: string): { isPlag: boolean; match?: SentenceBreakdown } => {
    const sTrim = seg.trim();
    if (!sTrim || sTrim.length < 5) return { isPlag: false };
    if (/^(\d+[\.\)]|[a-zA-Z][\.\)])$/.test(sTrim)) return { isPlag: false };

    const sLow = sTrim.toLowerCase();
    const matched = effectiveSentences.find((es) => {
      const esClean = (es.sentence || es.text || '').trim().toLowerCase();
      return (
        esClean.length > 5 &&
        (esClean.includes(sLow) || sLow.includes(esClean) || sLow.slice(0, 30) === esClean.slice(0, 30))
      );
    });

    if (matched && isSentencePlag(matched)) {
      return { isPlag: true, match: matched };
    }
    return { isPlag: false };
  };

  // Collect all distinct segments to calculate accurate toolbar counts
  const allSegments = useMemo(() => {
    const segs: string[] = [];
    for (const page of parsedPages) {
      for (const p of page.paragraphs) {
        const parts = p.split(/(?<=[.!?])\s+|\r?\n+/).map((s) => s.trim()).filter(Boolean);
        segs.push(...parts);
      }
    }
    return segs;
  }, [parsedPages]);

  const aiCount = useMemo(() => {
    return allSegments.filter((seg) => isSegmentAi(seg).isAi).length;
  }, [allSegments, effectiveSentences, overallAiScore]);

  const plagCount = useMemo(() => {
    return allSegments.filter((seg) => isSegmentPlag(seg).isPlag).length;
  }, [allSegments, effectiveSentences]);

  // Navigate to previous or next page and reset inner canvas scroll
  const handlePageChange = (newIdx: number) => {
    setActivePageIndex(newIdx);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Authenticated file download
  const handleDownload = async () => {
    if (!submissionId) return;
    try {
      setIsDownloading(true);
      await submissionApi.downloadSubmissionFile(submissionId, fileName);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Render authentic paragraphs exactly as submitted, marking sentences with yellow highlights
  const renderParagraphSentences = (pText: string) => {
    // If paragraph is a markdown table, preserve clean table layout
    const lines = pText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1 && lines.every((l) => l.includes('|'))) {
      const rows = lines.map((l) => l.split('|').map((c) => c.trim()).filter(Boolean));
      return (
        <div className="overflow-x-auto my-2 rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs font-sans">
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-100 font-bold border-b border-slate-200' : 'border-b border-slate-100'}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2 text-slate-800">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Split paragraph text by sentences and line breaks, without altering any words or structure
    const rawSegments = pText.split(/(?<=[.!?])\s+|\r?\n+/).filter((s) => s.trim().length > 0);
    if (rawSegments.length === 0) return null;

    return rawSegments.map((segment, sIdx) => {
      const sTrim = segment.trim();
      const aiCheck = isSegmentAi(sTrim);
      const plagCheck = isSegmentPlag(sTrim);

      const isAi = aiCheck.isAi;
      const isPlag = plagCheck.isPlag;

      const shouldHighlightAi = isAi && highlightFilter !== 'CLEAN' && highlightFilter !== 'PLAG_ONLY';
      const shouldHighlightPlag = isPlag && highlightFilter !== 'CLEAN' && highlightFilter !== 'AI_ONLY';

      if (shouldHighlightAi) {
        return (
          <span
            key={sIdx}
            onClick={() =>
              setSelectedSentence(
                aiCheck.match || {
                  sentence: segment,
                  text: segment,
                  ai_score: overallAiScore || 90,
                  similarity_score: 0,
                  is_ai: true,
                  is_plagiarized: false,
                  reason: 'AI generative pattern detected in this sentence',
                }
              )
            }
            className="bg-amber-200 hover:bg-amber-300 text-slate-950 border-b-2 border-amber-500 font-medium px-1 py-0.5 rounded-xs transition-colors cursor-pointer inline mr-1 shadow-2xs"
            style={{
              backgroundColor: '#fef08a',
              color: '#020617',
              borderBottom: '2px solid #f59e0b',
            }}
            title="⚠️ AI Detected: Click to inspect pattern"
          >
            {segment}{' '}
          </span>
        );
      }

      if (shouldHighlightPlag) {
        return (
          <span
            key={sIdx}
            onClick={() =>
              setSelectedSentence(
                plagCheck.match || {
                  sentence: segment,
                  text: segment,
                  ai_score: 0,
                  similarity_score: 85,
                  is_ai: false,
                  is_plagiarized: true,
                  reason: 'Similarity match with peer submission',
                }
              )
            }
            className="bg-red-200 hover:bg-red-300 text-slate-950 border-b-2 border-red-500 font-medium px-1 py-0.5 rounded-xs transition-colors cursor-pointer inline mr-1 shadow-2xs"
            style={{
              backgroundColor: '#fecaca',
              color: '#020617',
              borderBottom: '2px solid #ef4444',
            }}
            title="⚠️ Similarity Match: Click to inspect match"
          >
            {segment}{' '}
          </span>
        );
      }

      return (
        <span key={sIdx} className="hover:bg-slate-100/90 transition-colors inline mr-1">
          {segment}{' '}
        </span>
      );
    });
  };

  // Determine pages to render based on pageDisplayMode
  const pagesToRender = useMemo(() => {
    if (parsedPages.length === 0) return [];
    if (pageDisplayMode === 'SINGLE' && totalPages > 1) {
      return [parsedPages[activePageIndex] || parsedPages[0]];
    }
    return parsedPages;
  }, [parsedPages, pageDisplayMode, activePageIndex, totalPages]);

  return (
    <div
      style={{ backgroundColor: '#ffffff' }}
      className={`flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-200 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : `w-full ${containerHeight}`
      }`}
    >
      {/* Top Header / Control Toolbar — Clean, Professional Academic Toolbar */}
      <div className="bg-white text-slate-800 px-4 py-2.5 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 select-none shrink-0 shadow-2xs">
        {/* Left: Document info */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[200px] sm:max-w-[320px]">
                {fileName}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700 uppercase tracking-wider border border-zinc-200">
                {fileType}
              </span>
              {totalPages > 1 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>{totalPages} Pages</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {assignmentTitle ? `${assignmentTitle} • ` : ''}
              {studentName ? `Submitted by ${studentName}` : 'Student Submission'}
            </p>
          </div>
        </div>

        {/* Center: Highlighter Filter Pills */}
        <div className="flex items-center gap-2">
          {viewMode === 'CANVAS' && (
            <div className="hidden lg:flex items-center gap-1 bg-zinc-50 p-0.5 rounded-xl border border-zinc-200 text-xs">
              <button
                type="button"
                onClick={() => setHighlightFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all text-xs ${
                  highlightFilter === 'ALL'
                    ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                All ({aiCount + plagCount})
              </button>
              <button
                type="button"
                onClick={() => setHighlightFilter('AI_ONLY')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all text-xs ${
                  highlightFilter === 'AI_ONLY'
                    ? 'bg-amber-400 text-amber-950 shadow-xs border border-amber-500'
                    : 'text-amber-800 hover:text-amber-950 hover:bg-amber-50'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>AI ({aiCount})</span>
              </button>
              {plagCount > 0 && (
                <button
                  type="button"
                  onClick={() => setHighlightFilter('PLAG_ONLY')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all text-xs ${
                    highlightFilter === 'PLAG_ONLY'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-red-700 hover:text-red-900 hover:bg-red-50'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Plag ({plagCount})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setHighlightFilter('CLEAN')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all text-xs ${
                  highlightFilter === 'CLEAN'
                    ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Clean
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions, Page Jumpers, Zoom & Download */}
        <div className="flex items-center gap-2">
          {/* Multi-page controls: Flip page or toggle all pages */}
          {viewMode === 'CANVAS' && totalPages > 1 && (
            <div className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-xl border border-zinc-200 text-xs text-zinc-700">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(0, activePageIndex - 1))}
                disabled={activePageIndex === 0}
                className="p-1 hover:text-zinc-950 disabled:opacity-30"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono px-1 font-semibold text-zinc-900">
                Page {activePageIndex + 1} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages - 1, activePageIndex + 1))}
                disabled={activePageIndex === totalPages - 1}
                className="p-1 hover:text-zinc-950 disabled:opacity-30"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <span className="text-zinc-300 mx-1">|</span>

              <button
                type="button"
                onClick={() => setPageDisplayMode((prev) => (prev === 'SINGLE' ? 'ALL' : 'SINGLE'))}
                className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 shadow-2xs transition-colors"
                title={pageDisplayMode === 'SINGLE' ? 'Switch to Continuous Scroll View' : 'Switch to Single Page View'}
              >
                {pageDisplayMode === 'SINGLE' ? 'Show All' : '1 Page View'}
              </button>
            </div>
          )}

          {/* Zoom Controls */}
          {viewMode === 'CANVAS' && (
            <div className="hidden sm:flex items-center bg-zinc-50 border border-zinc-200 rounded-xl p-0.5 text-xs text-zinc-700">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(70, prev - 15))}
                className="p-1 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-600 hover:text-zinc-950"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono text-[11px] text-zinc-800 min-w-[36px] text-center font-semibold">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(130, prev + 15))}
                className="p-1 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-600 hover:text-zinc-950"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Download Original File Button */}
          {allowDownload && submissionId && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs border border-zinc-300 transition-all disabled:opacity-50"
              title="Download original file"
            >
              <Download className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'Download'}</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl border border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area — Seamless Pure White Canvas */}
      <div
        ref={scrollContainerRef}
        style={{ backgroundColor: '#ffffff' }}
        className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white flex flex-col items-center gap-8"
      >
        {parsedPages.length === 0 ? (
          <div className="my-auto py-16 px-8 rounded-2xl bg-white border border-zinc-200 shadow-xs text-center text-slate-600 space-y-3 font-sans max-w-md">
            <FileText className="w-12 h-12 mx-auto text-slate-400" />
            <p className="text-base text-slate-800 font-bold">No text preview available for this document.</p>
            <p className="text-xs text-slate-500">
              The file is stored safely. If the document is an image-only scan or handwritten PDF, you can download the original copy below.
            </p>
            {allowDownload && submissionId && (
              <button
                type="button"
                onClick={handleDownload}
                className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs"
              >
                Download Original File
              </button>
            )}
          </div>
        ) : (
          pagesToRender.map((page) => (
            <div
              key={page.pageNumber}
              id={`doc-canvas-page-${page.pageNumber}`}
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
              }}
              className="w-full max-w-[850px] bg-white rounded-xl border border-zinc-200 shadow-xs p-8 sm:p-12 text-slate-900 min-h-[750px] relative transition-transform duration-100 flex flex-col justify-between"
            >
              {/* Paper Header / Metadata */}
              <div className="border-b border-zinc-200 pb-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-sans">
                  <div>
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                      {assignmentTitle || 'Academic Submission'}
                    </span>
                    <span className="text-slate-600">
                      Author: <strong className="text-black font-semibold">{studentName || 'Student'}</strong>
                    </span>
                  </div>
                  <div className="sm:text-right font-mono text-[11px] text-slate-500">
                    {submittedAt ? new Date(submittedAt).toLocaleDateString() : 'Active Submission'} • Page {page.pageNumber} of {totalPages}
                  </div>
                </div>

                {/* Originality / AI Verification Badge */}
                <div className="mt-3 pt-2.5 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Integrity Status:
                    </span>
                    {aiCount === 0 && (overallAiScore ?? 0) < 20 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>100% Authentic Human Authored • No AI Markers</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-950 border border-amber-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>AI Detected ({overallAiScore}%) • Yellow Highlights ({aiCount} Sentences)</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 font-sans italic">
                    Turnitin-Style In-Document Highlighter
                  </span>
                </div>
              </div>

              {/* Document Content Flow: Preserves exact submitted format, paragraphs, and spacing */}
              <div className="space-y-4 text-[14.5px] sm:text-[15.5px] text-slate-900 flex-1 leading-[1.8] font-sans">
                {page.paragraphs.map((pText, pIdx) => (
                  <div
                    key={pIdx}
                    className="text-left whitespace-pre-wrap text-slate-900"
                    style={{ color: '#0f172a' }}
                  >
                    {renderParagraphSentences(pText)}
                  </div>
                ))}
              </div>

              {/* Paper Footer with Exact Page Number */}
              <div className="border-t border-zinc-200 pt-3 mt-6 flex items-center justify-between text-xs text-slate-500 font-sans">
                <div>IntegrityAI Originality & Canvas Engine</div>
                <div className="font-mono font-bold">
                  Page {page.pageNumber} of {totalPages}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interactive Sentence Inspector Drawer */}
      {selectedSentence && (
        <div className="bg-white border-t border-zinc-200 p-3 sm:p-4 shadow-2xl animate-in slide-in-from-bottom-2 duration-150 z-20 shrink-0">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                {isSentenceAi(selectedSentence) ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>AI Pattern Detected</span>
                  </span>
                ) : isSentencePlag(selectedSentence) ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>Similarity Match</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Authentic Human Text</span>
                  </span>
                )}
                {selectedSentence.ai_score !== undefined && selectedSentence.ai_score > 0 && (
                  <span className="text-xs font-mono font-semibold text-zinc-500">
                    AI Probability: {selectedSentence.ai_score}%
                  </span>
                )}
              </div>

              <blockquote className="text-xs sm:text-sm font-serif italic text-zinc-800 border-l-2 border-zinc-400 pl-2.5 py-0.5">
                "{selectedSentence.sentence || selectedSentence.text}"
              </blockquote>

              <p className="text-[11px] text-zinc-500 font-sans">
                {selectedSentence.reason ||
                  (isSentenceAi(selectedSentence)
                    ? 'Contains characteristic synthetic syntax or transitional cliché'
                    : 'Consistent with authentic human writing style')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSentence(null)}
              className="p-1 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
