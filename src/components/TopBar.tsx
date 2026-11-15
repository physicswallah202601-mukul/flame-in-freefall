import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { FlameInFreefallEmblem } from './EmblemSvg';

interface TopBarProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  onCsvUpload: (file: File) => void;
  uploadedFileName: string | null;
}

const NAV_ITEMS = [
  { id: 'simulator', label: '1g vs 0g Simulator' },
  { id: 'telemetry', label: 'Telemetry & d²' },
  { id: 'safety', label: 'Safety & Engines' },
  { id: 'specialist', label: 'AI Specialist' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  onSelectSection,
  onCsvUpload,
  uploadedFileName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCsvUpload(file);
    }
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#070B14]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-8 px-4 py-3 sm:px-6">
        {/* Zone 1: Brand Emblem & Title */}
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            onSelectSection('overview');
          }}
          className="flex items-center gap-2.5 sm:gap-3 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
        >
          <FlameInFreefallEmblem className="h-9 w-9 sm:h-10 sm:w-10 shrink-0" />
          <div className="min-w-0">
            <div className="font-display text-base sm:text-lg font-semibold tracking-tight text-slate-50 truncate">
              Flame in Freefall
            </div>
            <div className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-slate-300 truncate">
              Microgravity Combustion
            </div>
          </div>
        </a>

        {/* Zone 2: Primary Module Navigation */}
        <nav aria-label="Primary modules" className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`whitespace-nowrap shrink-0 px-3 py-1.5 text-sm font-medium transition-colors border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-300 hover:text-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action (CSV Upload) */}
        <div className="flex items-center gap-3 shrink-0">
          {uploadedFileName && (
            <span className="hidden lg:inline font-mono text-xs text-amber-300 truncate max-w-[160px]">
              {uploadedFileName}
            </span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Upload local CSV dataset"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 border border-cyan-500/60 bg-cyan-950/50 px-3 sm:px-3.5 py-2 text-xs font-mono font-medium uppercase tracking-wider text-cyan-200 hover:bg-cyan-900/60 hover:border-cyan-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Upload CSV</span>
          </button>
        </div>
      </div>

      {/* Compact Mobile Navigation Row */}
      <nav
        aria-label="Mobile module links"
        className="flex md:hidden flex-wrap items-center justify-between border-t border-slate-800/80 px-3 py-1.5 gap-x-2 gap-y-1"
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectSection(item.id)}
            className={`whitespace-nowrap shrink-0 text-[11px] font-medium py-1 border-b-2 ${
              activeSection === item.id
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
};
