import React from 'react';
import { RefreshCw, Database, Radio, ShieldCheck, Compass, ArrowRight } from 'lucide-react';
import type {
  IssTelemetryResponse,
  LoadedDatasetsState,
  NasaMediaResponse,
  SafetyFindingItem,
} from '../types/combustion';
import { ATTACHED_SOURCE_MANIFEST } from '../data/nasaDatasets';
import { OriginalChamberArtwork } from './EmblemSvg';
import { KeySafetyFindings } from './KeySafetyFindings';
import { TermTooltip } from './TermTooltip';

interface HeroOverviewProps {
  issTelemetry: IssTelemetryResponse | null;
  issLoading: boolean;
  onRefreshIss: () => void;
  nasaMedia: NasaMediaResponse | null;
  mediaLoading: boolean;
  onRefreshMedia: () => void;
  datasetsState: LoadedDatasetsState;
  onToggleDataset: (key: 'flexLoaded' | 'bass2Loaded' | 'same2Loaded' | 'saffire2Loaded' | 'psi62Loaded') => void;
  onClearAllDatasets: () => void;
  onRestoreAllDatasets: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenChartFromFinding: (action: SafetyFindingItem['chartAction']) => void;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({
  issTelemetry,
  issLoading,
  onRefreshIss,
  nasaMedia,
  mediaLoading,
  onRefreshMedia,
  datasetsState,
  onToggleDataset,
  onClearAllDatasets,
  onRestoreAllDatasets,
  onNavigateSection,
  onOpenChartFromFinding,
}) => {
  const activeCount = [
    datasetsState.flexLoaded,
    datasetsState.bass2Loaded,
    datasetsState.same2Loaded,
    datasetsState.saffire2Loaded,
    datasetsState.psi62Loaded,
    Boolean(datasetsState.uploadedCsv),
  ].filter(Boolean).length;

  return (
    <section id="overview" className="mx-auto max-w-7xl px-4 pt-8 pb-6 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Scientific Framing + Start Here 3-Step Guide + Live ISS Orbital Telemetry */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-cyan-400">
              Orbital Combustion Physics · Open NASA Research Archive
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-50">
              Flame in Freefall: Microgravity Combustion Explorer
            </h1>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-200 max-w-2xl">
              Compare buoyancy-driven Earth combustion against spherical diffusion flames in orbital
              freefall. Inspect verified telemetry from NASA FLEX droplet burns (
              <TermTooltip termKey="d2" label="d² law" />), BASS-II solid-fuel{' '}
              <TermTooltip termKey="pmma" /> flammability limits, SAFFIRE-II duct experiments, and
              SAME-2 smoke aerosol aging (<TermTooltip termKey="sigmaG" />).
            </p>
          </div>

          {/* Start Here: Simple 3-Step Path */}
          <div
            data-testid="start-here-guide"
            className="border border-cyan-500/40 bg-[#0B1120] p-4 sm:p-5 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-cyan-400 shrink-0" aria-hidden="true" />
                <h2 className="font-display text-sm sm:text-base font-semibold uppercase tracking-wider text-cyan-200">
                  Start here — Explore in 3 Steps
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-300">
                Built for students, first-time visitors &amp; judges
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              New to microgravity fire science? Follow these three steps to see why flames behave
              differently in orbit, verify what NASA measured, and query the loaded datasets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => onNavigateSection('simulator')}
                className="group flex flex-col justify-between border border-slate-700 bg-[#070B14] p-3.5 text-left hover:border-cyan-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <div>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-300">
                    Step 1
                  </span>
                  <div className="mt-1 font-display text-sm font-semibold text-slate-50">
                    Compare flame behavior
                  </div>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    Adjust gravity, O₂, and pressure to compare 1g plumes with 0g spheres.
                  </p>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-cyan-300 group-hover:text-cyan-200">
                  <span>Open Simulator</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateSection('key-findings-heading')}
                className="group flex flex-col justify-between border border-slate-700 bg-[#070B14] p-3.5 text-left hover:border-cyan-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <div>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    Step 2
                  </span>
                  <div className="mt-1 font-display text-sm font-semibold text-slate-50">
                    Explore NASA findings
                  </div>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    Read plain-language takeaways first, then inspect charts &amp; tables.
                  </p>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-cyan-300 group-hover:text-cyan-200">
                  <span>See Findings</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateSection('specialist')}
                className="group flex flex-col justify-between border border-slate-700 bg-[#070B14] p-3.5 text-left hover:border-cyan-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <div>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-300">
                    Step 3
                  </span>
                  <div className="mt-1 font-display text-sm font-semibold text-slate-50">
                    Ask the AI Specialist
                  </div>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    Ask questions grounded strictly in the loaded NASA data and citations.
                  </p>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-cyan-300 group-hover:text-cyan-200">
                  <span>Ask Specialist</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </button>
            </div>
          </div>

          {/* ISS Orbital Conditions Console */}
          <div className="border border-slate-800 bg-[#0B1120] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Radio
                  className={`h-4 w-4 ${
                    issTelemetry?.source === 'live' ? 'text-cyan-400' : 'text-amber-400'
                  }`}
                  aria-hidden="true"
                />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-100">
                  ISS Orbital Environment (NORAD 25544)
                </span>
                <span className="font-mono text-xs uppercase text-slate-400">·</span>
                <span
                  className={`font-mono text-xs uppercase tracking-wider ${
                    issTelemetry?.source === 'live' ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {issLoading
                    ? 'FETCHING...'
                    : issTelemetry?.source === 'live'
                      ? 'LIVE PUBLIC API'
                      : 'OFFLINE / CACHED FALLBACK'}
                </span>
              </div>
              <button
                type="button"
                onClick={onRefreshIss}
                disabled={issLoading}
                className="inline-flex items-center gap-1.5 border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-slate-200 hover:border-cyan-500 hover:text-cyan-200 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${issLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </button>
            </div>

            {issTelemetry ? (
              <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="font-mono text-xs uppercase text-slate-300">Latitude</div>
                  <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-slate-50">
                    {issTelemetry.latitude.toFixed(3)}
                    <span className="ml-1 text-xs font-normal text-slate-300">deg</span>
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs uppercase text-slate-300">Longitude</div>
                  <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-slate-50">
                    {issTelemetry.longitude.toFixed(3)}
                    <span className="ml-1 text-xs font-normal text-slate-300">deg</span>
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs uppercase text-slate-300">Altitude</div>
                  <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-cyan-300">
                    {issTelemetry.altitudeKm.toFixed(1)}
                    <span className="ml-1 text-xs font-normal text-slate-300">km</span>
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs uppercase text-slate-300">Orbital Speed</div>
                  <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-amber-300">
                    {issTelemetry.velocityKmh.toFixed(0)}
                    <span className="ml-1 text-xs font-normal text-slate-300">km/h</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 font-mono text-xs text-slate-300">Loading orbital telemetry...</p>
            )}
            <p className="mt-3 font-mono text-xs text-slate-300">
              {issTelemetry?.note ?? 'Orbital freefall sustains ~10⁻⁶ g inside CIR and MSG racks.'}
            </p>
          </div>
        </div>

        {/* Right: Loaded Dataset Provenance & Grounding Switchboard */}
        <div className="lg:col-span-5 border border-slate-800 bg-[#0B1120] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              <h2 className="font-display text-sm sm:text-base font-semibold uppercase tracking-wider text-slate-100">
                Loaded NASA Sources ({activeCount})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClearAllDatasets}
                className="font-mono text-xs uppercase text-slate-300 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                Unload All
              </button>
              <span className="text-slate-600">/</span>
              <button
                type="button"
                onClick={onRestoreAllDatasets}
                className="font-mono text-xs uppercase text-cyan-300 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                Restore Attached
              </button>
            </div>
          </div>

          <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
            Toggle which NASA datasets are active in charts and AI Specialist answers:
          </p>

          <ul className="mt-2 divide-y divide-slate-800/80">
            {ATTACHED_SOURCE_MANIFEST.map((src) => {
              const stateKey = `${src.id}Loaded` as
                | 'flexLoaded'
                | 'bass2Loaded'
                | 'same2Loaded'
                | 'saffire2Loaded'
                | 'psi62Loaded';
              const isEnabled = datasetsState[stateKey];
              return (
                <li key={src.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-100 truncate">
                      {src.experiment}
                    </div>
                    <div className="font-mono text-xs text-slate-300 truncate">
                      {src.filename} · {src.rowCountLabel}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleDataset(stateKey)}
                    aria-pressed={isEnabled}
                    className={`shrink-0 border px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      isEnabled
                        ? 'border-cyan-500/60 bg-cyan-950/60 text-cyan-200'
                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    {isEnabled ? 'Loaded' : 'Off'}
                  </button>
                </li>
              );
            })}
            {datasetsState.uploadedCsv && (
              <li className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-amber-300 truncate">
                    Runtime Uploaded CSV
                  </div>
                  <div className="font-mono text-xs text-slate-300 truncate">
                    {datasetsState.uploadedCsv.fileName} · {datasetsState.uploadedCsv.rows.length} rows
                  </div>
                </div>
                <span className="font-mono text-xs uppercase text-amber-300">Active</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Key Fire-Safety Findings (Source-Verified Summary) */}
      <KeySafetyFindings onOpenChart={onOpenChartFromFinding} />

      {/* People-Free Hardware & Flame Visual Plates + NASA Image Archive Catalog */}
      <div className="mt-6 border border-slate-800 bg-[#0B1120] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" aria-hidden="true" />
            <h2 className="font-display text-sm sm:text-base font-semibold uppercase tracking-wider text-slate-100">
              Verified People-Free Combustion Plates & NASA Media Filter
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase text-slate-300">
              {mediaLoading
                ? 'Querying images-api.nasa.gov...'
                : nasaMedia?.source === 'live'
                  ? `NASA Archive: ${nasaMedia.items.length} metadata-filtered / ${nasaMedia.filteredOutCount} rejected`
                  : 'Offline/Cached Visual Mode'}
            </span>
            <button
              type="button"
              onClick={onRefreshMedia}
              disabled={mediaLoading}
              className="border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs uppercase text-slate-200 hover:border-cyan-500 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              Re-query
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          Visual safety policy: External photographs are never displayed unless confirmed people-free;
          because metadata alone is not visual confirmation, primary plates below render original
          SVG schematics of the ISS combustion hardware while live-filtered NASA catalog entries are
          listed alongside with rejected crew/portrait counts.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <figure className="border border-slate-800 bg-[#070B14] p-3.5">
            <OriginalChamberArtwork variant="flex" />
            <figcaption className="mt-2 font-mono text-xs text-slate-200">
              Original Artwork · FLEX CIR/MDCA Droplet Combustion Chamber
            </figcaption>
          </figure>
          <figure className="border border-slate-800 bg-[#070B14] p-3.5">
            <OriginalChamberArtwork variant="bass2" />
            <figcaption className="mt-2 font-mono text-xs text-slate-200">
              Original Artwork · BASS-II MSG Opposed-Flow PMMA Duct
            </figcaption>
          </figure>
          <figure className="border border-slate-800 bg-[#070B14] p-3.5">
            <OriginalChamberArtwork variant="same2" />
            <figcaption className="mt-2 font-mono text-xs text-slate-200">
              Original Artwork · SAME-2 Aerosol Coagulation & Moment Duct
            </figcaption>
          </figure>
        </div>

        {nasaMedia && nasaMedia.items.length > 0 && (
          <div className="mt-4 border-t border-slate-800 pt-3.5">
            <div className="font-mono text-xs uppercase tracking-wider text-cyan-300 mb-2.5">
              Metadata-Filtered NASA Image Library Catalog (People/Crew Keywords Excluded)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {nasaMedia.items.slice(0, 3).map((item) => (
                <div key={item.nasaId} className="border border-slate-800/90 bg-[#070B14] p-3.5 text-xs">
                  <div className="font-semibold text-sm text-slate-100 line-clamp-1">{item.title}</div>
                  <div className="mt-1 font-mono text-xs text-slate-300">
                    {item.nasaId} · {item.dateCreated} · {item.center}
                  </div>
                  <p className="mt-1.5 text-slate-200 line-clamp-2 text-xs leading-relaxed">
                    {item.description || 'No description provided in NASA metadata.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
