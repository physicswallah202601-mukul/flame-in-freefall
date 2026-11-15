import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  ArrowUpDown,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';
import {
  FINDINGS_ORDERING_METHOD_TEXT,
  KEY_SAFETY_FINDINGS,
  sortSafetyFindings,
} from '../data/safetyFindings';
import type { FindingsSortMode, SafetyFindingItem } from '../types/combustion';
import { TermTooltip } from './TermTooltip';

interface KeySafetyFindingsProps {
  onOpenChart?: (action: SafetyFindingItem['chartAction']) => void;
}

function renderPlainTakeawayWithTooltips(finding: SafetyFindingItem) {
  if (finding.id === 'bass2-goldilocks') {
    return (
      <>
        Gentle spacecraft cabin airflow can keep solid plastics like clear acrylic (
        <TermTooltip termKey="pmma" label="PMMA" />) burning at lower oxygen levels (~13.5% O₂) than
        an upward Earth-gravity fire can sustain (15.4% O₂).
      </>
    );
  }
  if (finding.id === 'same2-coagulation') {
    return (
      <>
        In weightlessness, smoke particles from overheated wires and polymers clump together over 12
        minutes into wider particles (shifting mean diameter <TermTooltip termKey="dg" /> and size
        spread <TermTooltip termKey="sigmaG" />)—meaning a single-type smoke alarm tuned to Earth
        fires can miss them.
      </>
    );
  }
  if (finding.id === 'saffire2-materials') {
    return (
      <>
        Inside the Cygnus spacecraft duct at 20 cm/s airflow, silicone sheets and Nomex stopped
        burning on their own, while cotton-fiberglass cloth (<TermTooltip termKey="sibal" />) and
        thick acrylic (<TermTooltip termKey="pmma" label="PMMA" />) burned steadily.
      </>
    );
  }
  if (finding.id === 'flex-extinction') {
    return (
      <>
        In space, fuel droplets burn as quiet spheres following the{' '}
        <TermTooltip termKey="d2" label="d² law" /> instead of tall flames—and large droplets can go
        out early because they lose heat by thermal radiation, even when oxygen is still present.
      </>
    );
  }
  return finding.plainTakeaway;
}

function renderTechnicalDetailsWithTooltips(finding: SafetyFindingItem) {
  if (finding.id === 'bass2-goldilocks') {
    return (
      <>
        Clear cast <TermTooltip termKey="pmma" /> rods and slabs aboard ISS burned down to ~13.5% O₂
        at flow stretch rates <TermTooltip termKey="stretchRateA" label="a = 8–12 s⁻¹" />{' '}
        (spacecraft ventilation range), below the 15.4% O₂ normal-gravity upward flammability limit.
      </>
    );
  }
  if (finding.id === 'same2-coagulation') {
    return (
      <>
        Overheated spacecraft wire/polymer smokes averaged 200–400 nm initially, while 720 s aging
        and zero-flow quiescent conditions produced 30–40% larger mass-mean diameters at zero flow
        (2–3× overall), exposing blind spots in single-moment smoke detectors. Log-normal fits
        report <TermTooltip termKey="dg" /> and <TermTooltip termKey="sigmaG" />.
      </>
    );
  }
  if (finding.id === 'saffire2-materials') {
    return (
      <>
        Aboard Cygnus at 20 cm/s airflow (~21.5–22.1% O₂), 0.27–1.03 mm Silicone samples
        self-extinguished (~0 burn length), while Cotton-Fiberglass{' '}
        <TermTooltip termKey="sibal" /> burned 29 cm (2.1–2.6 mm/s) and thick{' '}
        <TermTooltip termKey="pmma" /> sustained 600–900 s burns while Nomex did not ignite.
      </>
    );
  }
  if (finding.id === 'flex-extinction') {
    return (
      <>
        Synthesizing 245 Table IX runs with Sec. 1.0 text shows 2–5 mm methanol and heptane droplets
        burned symmetrically at lower limiting oxygen indices than 1g predictions, terminating by
        radiative extinction at high dilution or diffusive extinction at low dilution (burning rate{' '}
        <TermTooltip termKey="burnRateK" label="K" /> in mm²/s).
      </>
    );
  }
  return finding.summary;
}

export const KeySafetyFindings: React.FC<KeySafetyFindingsProps> = ({ onOpenChart }) => {
  const [sortMode, setSortMode] = useState<FindingsSortMode>('scope');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const orderedFindings = useMemo(
    () => sortSafetyFindings(KEY_SAFETY_FINDINGS, sortMode),
    [sortMode]
  );

  const allExpanded = orderedFindings.every((item) => Boolean(expandedIds[item.id]));

  const toggleFinding = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedIds({});
    } else {
      const next: Record<string, boolean> = {};
      for (const item of orderedFindings) {
        next[item.id] = true;
      }
      setExpandedIds(next);
    }
  };

  return (
    <section
      aria-labelledby="key-findings-heading"
      data-testid="key-safety-findings"
      className="mt-6 border border-slate-800 bg-[#0B1120] p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" aria-hidden="true" />
            <h2
              id="key-findings-heading"
              className="font-display text-base sm:text-lg font-semibold uppercase tracking-wider text-slate-50"
            >
              Key Fire-Safety Findings (Source-Verified Summary)
            </h2>
          </div>
          <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
            Each card starts with a plain-language takeaway. Expand any finding for technical data,
            measured comparison charts, limitations, and NASA source citations.
          </p>
          <p className="font-mono text-xs text-slate-400 leading-relaxed">
            Ordering method: {FINDINGS_ORDERING_METHOD_TEXT}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5" role="group" aria-label="Findings order mode">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 mr-1" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setSortMode('scope')}
              aria-pressed={sortMode === 'scope'}
              className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                sortMode === 'scope'
                  ? 'border-cyan-500/70 bg-cyan-950/60 text-cyan-200'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-slate-100'
              }`}
            >
              Lifecycle Scope
            </button>
            <button
              type="button"
              onClick={() => setSortMode('source')}
              aria-pressed={sortMode === 'source'}
              className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                sortMode === 'source'
                  ? 'border-cyan-500/70 bg-cyan-950/60 text-cyan-200'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-slate-100'
              }`}
            >
              Source File (A–Z)
            </button>
          </div>

          <button
            type="button"
            onClick={toggleAll}
            aria-expanded={allExpanded}
            className="border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-amber-300 hover:border-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {allExpanded ? 'Collapse All Details' : 'Expand All Details'}
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {orderedFindings.map((finding, idx) => {
          const isMeasured = finding.classification === 'Measured Result';
          const isExpanded = Boolean(expandedIds[finding.id]);
          const detailsPanelId = `finding-details-${finding.id}`;

          return (
            <article
              key={finding.id}
              data-testid={`finding-card-${finding.id}`}
              className="flex flex-col justify-between border border-slate-800 bg-[#070B14] p-4 sm:p-5 space-y-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-300">
                    {String(idx + 1).padStart(2, '0')} · {finding.experiment} ·{' '}
                    {finding.scopeCriterion}
                  </span>
                  <span
                    className={`border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider ${
                      isMeasured
                        ? 'border-cyan-500/60 bg-cyan-950/50 text-cyan-200'
                        : 'border-amber-500/60 bg-amber-950/50 text-amber-200'
                    }`}
                  >
                    {finding.classification}
                  </span>
                </div>

                <h3 className="font-display text-base sm:text-lg font-semibold text-slate-50 leading-snug">
                  {finding.title}
                </h3>

                {/* Plain-language takeaway first */}
                <div className="border-l-2 border-cyan-400/80 pl-3.5 py-0.5 space-y-1">
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                    Plain-Language Takeaway
                  </div>
                  <p className="text-sm leading-relaxed text-slate-200">
                    {renderPlainTakeawayWithTooltips(finding)}
                  </p>
                </div>
              </div>

              {/* Disclosure toggle for technical details, chart & citations */}
              <div className="border-t border-slate-800/90 pt-3 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFinding(finding.id)}
                    aria-expanded={isExpanded}
                    aria-controls={detailsPanelId}
                    className="inline-flex items-center gap-2 border border-slate-700 bg-slate-900/90 px-3 py-2 font-mono text-xs uppercase tracking-wider text-cyan-200 hover:border-cyan-400 hover:text-cyan-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      {isExpanded
                        ? 'Hide Technical Details, Chart & Citation'
                        : 'Technical Details, Chart & Citation'}
                    </span>
                  </button>

                  {!isExpanded && (
                    <a
                      href={`#source-${finding.sourceEntryId}`}
                      className="font-mono text-xs text-slate-300 underline underline-offset-2 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    >
                      Source: {finding.experiment}
                    </a>
                  )}
                </div>

                {isExpanded && (
                  <div
                    id={detailsPanelId}
                    className="space-y-4 border border-slate-800 bg-[#0B1120] p-4 text-xs sm:text-[13px]"
                  >
                    {/* Technical Details */}
                    <div>
                      <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-300 mb-1">
                        Technical Details ({finding.classification})
                      </div>
                      <p className="text-slate-200 leading-relaxed">
                        {renderTechnicalDetailsWithTooltips(finding)}
                      </p>
                    </div>

                    {/* Measured Mini-Chart Comparison & Jump to Live Chart */}
                    <div className="border border-slate-800 bg-[#070B14] p-3.5 space-y-2.5">
                      <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                        {finding.miniComparison.heading}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between gap-2 font-mono text-xs text-slate-200 mb-1">
                            <span>{finding.miniComparison.leftLabel}</span>
                            <span className="text-cyan-300 font-semibold tabular-nums">
                              {finding.miniComparison.leftValue}
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-900 border border-slate-800">
                            <div
                              className="h-full bg-cyan-400"
                              style={{ width: `${finding.miniComparison.leftWidthPct}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between gap-2 font-mono text-xs text-slate-200 mb-1">
                            <span>{finding.miniComparison.rightLabel}</span>
                            <span className="text-amber-300 font-semibold tabular-nums">
                              {finding.miniComparison.rightValue}
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-900 border border-slate-800">
                            <div
                              className="h-full bg-amber-400"
                              style={{ width: `${finding.miniComparison.rightWidthPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="font-mono text-[11px] text-slate-400">
                          {finding.miniComparison.caption}
                        </span>
                        {onOpenChart && (
                          <button
                            type="button"
                            onClick={() => onOpenChart(finding.chartAction)}
                            className="inline-flex items-center gap-1.5 border border-cyan-500/60 bg-cyan-950/50 px-2.5 py-1.5 font-mono text-xs text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                          >
                            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{finding.chartAction.label}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Limitations */}
                    <div className="font-mono text-xs text-slate-300 leading-relaxed">
                      <strong className="font-semibold text-amber-300">Limitations:</strong>{' '}
                      {finding.limitations}
                    </div>

                    {/* Source Citations */}
                    <div className="border-t border-slate-800 pt-2.5 flex flex-wrap items-start justify-between gap-2 font-mono text-xs text-cyan-300">
                      <div className="flex items-start gap-1.5 min-w-0">
                        <FileText className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>
                          <strong className="font-semibold text-slate-200">Source:</strong>{' '}
                          <a
                            href={`#source-${finding.sourceEntryId}`}
                            className="underline underline-offset-2 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 break-words"
                          >
                            {finding.sourceFile} · {finding.sourceTableOrSection}
                          </a>
                        </span>
                      </div>
                      <a
                        href={finding.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 shrink-0 text-xs uppercase tracking-wider text-slate-200 hover:text-cyan-200 underline underline-offset-2"
                        aria-label={`Open official citation for ${finding.experiment}`}
                      >
                        <span>Official Link</span>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
