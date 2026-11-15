import React, { useState } from 'react';
import { MessageSquareCode, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { LoadedDatasetsState, SpecialistQaResponse } from '../types/combustion';
import type { GroundingContextResult } from '../utils/grounding';

interface GroundedSpecialistProps {
  grounding: GroundingContextResult;
  datasetsState: LoadedDatasetsState;
}

const SUGGESTED_QUESTIONS = [
  'Compare FLEX Methanol vs Heptane extinction behavior and burning rates in Table IX.',
  'Are quantitative soot volume fraction or radiative heat loss measurements available in FLEX?',
  'Explain the BASS-II Goldilocks flammability boundary and its O2 minimum.',
  'How did 720 s aging affect smoke particle diameters in SAME-2 Table 1?',
];

export const GroundedSpecialist: React.FC<GroundedSpecialistProps> = ({
  grounding,
  datasetsState,
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SpecialistQaResponse | null>(null);

  const handleAsk = async (promptText?: string) => {
    const query = (promptText ?? question).trim();
    if (!query || loading) return;

    if (promptText) setQuestion(promptText);
    setLoading(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          activeSources: {
            flexLoaded: datasetsState.flexLoaded,
            bass2Loaded: datasetsState.bass2Loaded,
            same2Loaded: datasetsState.same2Loaded,
            saffire2Loaded: datasetsState.saffire2Loaded,
            psi62Loaded: datasetsState.psi62Loaded,
          },
          uploadedCsv: datasetsState.uploadedCsv
            ? {
                fileName: datasetsState.uploadedCsv.fileName,
                headers: datasetsState.uploadedCsv.headers.slice(0, 24),
                rows: datasetsState.uploadedCsv.rows.slice(0, 40),
              }
            : null,
        }),
      });
      const data = (await res.json()) as SpecialistQaResponse;
      setResponse(data);
    } catch {
      setResponse({
        available: false,
        grounded: false,
        answer:
          'Network error reaching the server-side AI Specialist endpoint. All simulation and telemetry features remain usable offline.',
        fileEvidenceSummary: '',
        generalBackgroundSummary: '',
        citations: [],
        uncertaintyNote: 'Server request failed.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="specialist" className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="border border-slate-800 bg-[#0B1120]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <MessageSquareCode className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            <div>
              <h2 className="font-display text-xl font-bold text-slate-50">
                4. Grounded AI Specialist
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Server-side Q&A grounded strictly in currently loaded NASA files and uploaded CSV
                schemas.
              </p>
            </div>
          </div>

          <div className="font-mono text-xs">
            {grounding.hasLoadedFiles ? (
              <span className="text-emerald-400">
                Grounded Sources Active: {grounding.loadedFileNames.length}
              </span>
            ) : (
              <span className="text-amber-400">0 Sources Loaded (Grounding Blocked)</span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {!grounding.hasLoadedFiles && (
            <div
              role="alert"
              className="flex items-start gap-2.5 border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-200"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" aria-hidden="true" />
              <span>
                No dataset files are currently loaded. Queries will be refused as ungrounded until
                you restore attached NASA datasets or upload a CSV file.
              </span>
            </div>
          )}

          {/* Suggested Scientific Questions */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleAsk(q)}
                disabled={loading}
                className="border border-slate-700 bg-[#070B14] px-3.5 py-2 text-left text-xs sm:text-[13px] text-slate-200 hover:border-cyan-400 hover:text-cyan-200 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <label htmlFor="specialist-question" className="sr-only">
              Ask a question grounded in loaded combustion datasets
            </label>
            <input
              id="specialist-question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about FLEX d² rates, BASS-II Goldilocks limits, SAME-2 aerosols, or missing fields..."
              className="flex-1 border border-slate-700 bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="inline-flex items-center justify-center gap-2 border border-cyan-500/70 bg-cyan-950/60 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-cyan-200 hover:bg-cyan-900/70 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{loading ? 'Analyzing...' : 'Ask Specialist'}</span>
            </button>
          </form>

          {/* Response Output */}
          {response && (
            <div className="border border-slate-800 bg-[#070B14] p-4 space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 font-mono uppercase tracking-wider">
                  {response.grounded ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                      <span className="text-emerald-300">File-Grounded Response</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />
                      <span className="text-amber-300">
                        {response.available ? 'Ungrounded Refusal' : 'AI Service Unavailable'}
                      </span>
                    </>
                  )}
                </div>
                {response.errorReason && (
                  <span className="font-mono text-[11px] text-slate-400">
                    Status: {response.errorReason}
                  </span>
                )}
              </div>

              <div className="text-sm leading-relaxed text-slate-100">{response.answer}</div>

              {(response.fileEvidenceSummary || response.generalBackgroundSummary) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-800 bg-[#0B1120] p-3.5">
                    <div className="font-mono text-xs uppercase text-cyan-300 mb-1.5">
                      File Evidence (Measured / Tabulated)
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {response.fileEvidenceSummary || 'None cited.'}
                    </p>
                  </div>
                  <div className="border border-slate-800 bg-[#0B1120] p-3.5">
                    <div className="font-mono text-xs uppercase text-amber-300 mb-1.5">
                      General Scientific Background
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {response.generalBackgroundSummary || 'None added.'}
                    </p>
                  </div>
                </div>
              )}

              {response.citations.length > 0 && (
                <div>
                  <div className="font-mono text-xs uppercase text-slate-300 mb-1">
                    Source & Column Citations
                  </div>
                  <ul className="space-y-1 font-mono text-xs text-slate-200">
                    {response.citations.map((c, idx) => (
                      <li key={idx}>
                        • {c.file} — <span className="text-cyan-300">{c.sectionOrColumn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {response.uncertaintyNote && (
                <div className="border-t border-slate-800 pt-2.5 font-mono text-xs text-slate-300">
                  Uncertainty & Scope: {response.uncertaintyNote}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
