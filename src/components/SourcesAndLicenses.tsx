import React, { useMemo, useState } from 'react';
import { BookOpen, ExternalLink, Scale } from 'lucide-react';
import {
  ORIGINAL_CODE_LICENSE_NOTICE,
  SOURCES_REGISTRY,
  type SourceCategory,
} from '../data/sourcesRegistry';

type FilterTab = 'all' | SourceCategory;

const CATEGORY_LABELS: Record<SourceCategory, string> = {
  dataset: 'Datasets & Reports',
  api: 'APIs',
  image: 'Images & Artwork',
  library: 'Third-Party Libraries',
};

export const SourcesAndLicenses: React.FC = () => {
  const [filter, setFilter] = useState<FilterTab>('all');

  const counts = useMemo(() => {
    const map: Record<SourceCategory, number> = { dataset: 0, api: 0, image: 0, library: 0 };
    for (const item of SOURCES_REGISTRY) {
      map[item.category] += 1;
    }
    return map;
  }, []);

  const visibleEntries = useMemo(() => {
    if (filter === 'all') return SOURCES_REGISTRY;
    return SOURCES_REGISTRY.filter((e) => e.category === filter);
  }, [filter]);

  return (
    <section
      id="sources-licenses"
      aria-labelledby="sources-licenses-heading"
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6"
    >
      <div className="border border-slate-800 bg-[#0B1120]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-cyan-400 shrink-0" aria-hidden="true" />
            <div>
              <h2
                id="sources-licenses-heading"
                className="font-display text-xl font-bold text-slate-50"
              >
                Sources &amp; Licenses
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Provenance, stable citations, feature mapping, and verified reuse/license notices for
                every dataset, API, visual asset, and third-party package.
              </p>
            </div>
          </div>

          <div
            role="group"
            aria-label="Filter sources and licenses by category"
            className="flex flex-wrap items-center gap-1.5"
          >
            {(
              [
                { id: 'all', label: `All (${SOURCES_REGISTRY.length})` },
                { id: 'dataset', label: `Datasets (${counts.dataset})` },
                { id: 'api', label: `APIs (${counts.api})` },
                { id: 'image', label: `Images (${counts.image})` },
                { id: 'library', label: `Libraries (${counts.library})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                aria-pressed={filter === tab.id}
                className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  filter === tab.id
                    ? 'border-cyan-500/70 bg-cyan-950/60 text-cyan-200'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Original Project Code & Artwork License */}
          <div className="border border-cyan-500/40 bg-cyan-950/15 p-4 flex items-start gap-3">
            <Scale className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display font-semibold text-cyan-200">
                  {ORIGINAL_CODE_LICENSE_NOTICE.heading}
                </span>
                <span className="border border-emerald-500/50 bg-[#070B14] px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-emerald-300">
                  {ORIGINAL_CODE_LICENSE_NOTICE.status}
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {ORIGINAL_CODE_LICENSE_NOTICE.detail}
              </p>
            </div>
          </div>

          {/* Provenance & License Entries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleEntries.map((entry) => (
              <article
                key={entry.id}
                id={`source-${entry.id}`}
                data-testid={`source-entry-${entry.id}`}
                className="scroll-mt-20 border border-slate-800 bg-[#070B14] p-4 sm:p-5 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-300">
                      {CATEGORY_LABELS[entry.category]}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {entry.bundlingStatus && (
                        <span className="border border-slate-700 bg-slate-900/90 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-slate-200">
                          {entry.bundlingStatus}
                        </span>
                      )}
                      <span
                        className={`border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider ${
                          entry.verifiedStatus === 'Verified'
                            ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                            : entry.verifiedStatus === 'Flagged for review'
                              ? 'border-amber-500/60 bg-amber-950/40 text-amber-300'
                              : 'border-slate-700 bg-slate-900 text-slate-200'
                        }`}
                      >
                        {entry.verifiedStatus}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-sm sm:text-base font-semibold text-slate-50 leading-snug">
                    {entry.title}
                  </h3>

                  <p className="font-mono text-xs text-slate-300">
                    Publisher: <span className="text-slate-200">{entry.publisher}</span>
                  </p>
                </div>

                <div className="space-y-1.5 border-t border-slate-800/80 pt-3 text-xs leading-relaxed">
                  <div className="text-slate-200">
                    <strong className="font-mono text-slate-300 uppercase">Used In:</strong>{' '}
                    {entry.appFeature}
                  </div>
                  <div className="text-slate-200">
                    <strong className="font-mono text-slate-300 uppercase">
                      License / Reuse:
                    </strong>{' '}
                    {entry.licenseOrReuse}
                  </div>
                  <div>
                    <strong className="font-mono text-slate-300 uppercase">Stable Link:</strong>{' '}
                    {entry.stableUrl ? (
                      <a
                        href={entry.stableUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-cyan-300 hover:text-cyan-200 underline underline-offset-2 break-all"
                      >
                        <span>{entry.stableUrl}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="font-mono text-slate-300">{entry.urlLabel}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
