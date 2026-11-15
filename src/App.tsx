import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TopBar } from './components/TopBar';
import { HeroOverview } from './components/HeroOverview';
import { FlameSimulator } from './components/FlameSimulator';
import { TelemetryExplorer } from './components/TelemetryExplorer';
import { GravityAndEngines } from './components/GravityAndEngines';
import { GroundedSpecialist } from './components/GroundedSpecialist';
import { SourcesAndLicenses } from './components/SourcesAndLicenses';
import { Footer } from './components/Footer';
import { FLEX_TABLE_IX } from './data/flexTableIX';
import {
  BASS2_TABLE_5_1,
  SAFFIRE2_CSV_VERBATIM,
  SAME2_TABLE_1,
} from './data/nasaDatasets';
import { FALLBACK_ISS_TELEMETRY, FALLBACK_NASA_MEDIA } from './data/fallbackPublicData';
import { parseCsvText, parseSaffire2Csv } from './utils/csvParser';
import { buildGroundingContext } from './utils/grounding';
import type {
  IssTelemetryResponse,
  LoadedDatasetsState,
  NasaMediaResponse,
  Saffire2CsvRow,
  SafetyFindingItem,
} from './types/combustion';
import type { ExplorerTab, TableSourceId } from './components/TelemetryExplorer';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('simulator');
  const [telemetryTab, setTelemetryTab] = useState<ExplorerTab>('d2');
  const [telemetryTableSource, setTelemetryTableSource] = useState<TableSourceId>('flex');
  const [issTelemetry, setIssTelemetry] = useState<IssTelemetryResponse | null>(null);
  const [issLoading, setIssLoading] = useState<boolean>(true);
  const [nasaMedia, setNasaMedia] = useState<NasaMediaResponse | null>(null);
  const [mediaLoading, setMediaLoading] = useState<boolean>(true);

  const [saffireRows, setSaffireRows] = useState<Saffire2CsvRow[]>(() => {
    return parseSaffire2Csv(SAFFIRE2_CSV_VERBATIM).rows;
  });
  const [saffireNotes, setSaffireNotes] = useState<string[]>(() => {
    return parseSaffire2Csv(SAFFIRE2_CSV_VERBATIM).notes;
  });

  const [datasetsState, setDatasetsState] = useState<LoadedDatasetsState>({
    flexLoaded: true,
    bass2Loaded: true,
    same2Loaded: true,
    saffire2Loaded: true,
    psi62Loaded: true,
    uploadedCsv: null,
  });

  const [csvStatusMessage, setCsvStatusMessage] = useState<string | null>(null);

  const fetchIss = useCallback(async () => {
    setIssLoading(true);
    try {
      const res = await fetch('/api/iss');
      if (!res.ok) throw new Error('ISS endpoint error');
      const data = (await res.json()) as IssTelemetryResponse;
      setIssTelemetry(data);
    } catch {
      setIssTelemetry(FALLBACK_ISS_TELEMETRY);
    } finally {
      setIssLoading(false);
    }
  }, []);

  const fetchMedia = useCallback(async () => {
    setMediaLoading(true);
    try {
      const res = await fetch('/api/nasa-media');
      if (!res.ok) throw new Error('Media endpoint error');
      const data = (await res.json()) as NasaMediaResponse;
      setNasaMedia(data);
    } catch {
      setNasaMedia(FALLBACK_NASA_MEDIA);
    } finally {
      setMediaLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIss();
    fetchMedia();

    // Attempt live runtime fetch of the attached SAFFIRE-2 CSV asset; offline fallback already populated
    fetch('/assets/aistudio/PSI-99_Experimental_table_SAFFIRE-2_3c24390b.csv')
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error('CSV asset unavailable'))))
      .then((text) => {
        const parsed = parseSaffire2Csv(text);
        if (parsed.rows.length > 0) {
          setSaffireRows(parsed.rows);
          setSaffireNotes(parsed.notes);
        }
      })
      .catch(() => {
        // Retain verbatim fallback parsed at startup
      });
  }, [fetchIss, fetchMedia]);

  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenChartFromFinding = (action: SafetyFindingItem['chartAction']) => {
    setTelemetryTab(action.tab);
    if (action.table) {
      setTelemetryTableSource(action.table);
    }
    handleSelectSection('telemetry');
  };

  const handleCsvUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setCsvStatusMessage(`File "${file.name}" exceeds the 5 MB local CSV upload limit.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const parsed = parseCsvText(text, file.name);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setCsvStatusMessage(
          `Could not parse valid CSV tabular rows from "${file.name}" (empty, binary, or header-only file).`
        );
        return;
      }
      setDatasetsState((prev) => ({ ...prev, uploadedCsv: parsed }));
      setTelemetryTab(
        parsed.hasSootColumn || parsed.hasRadiativeColumn ? 'soot_rad' : 'uploaded'
      );
      setTelemetryTableSource('uploaded');
      setCsvStatusMessage(
        `Loaded "${file.name}" (${parsed.rows.length} rows, ${parsed.headers.length} columns).`
      );
      handleSelectSection('telemetry');
    };
    reader.onerror = () => {
      setCsvStatusMessage(`Failed to read local file "${file.name}".`);
    };
    reader.readAsText(file);
  };

  const handleToggleDataset = (
    key: 'flexLoaded' | 'bass2Loaded' | 'same2Loaded' | 'saffire2Loaded' | 'psi62Loaded'
  ) => {
    setDatasetsState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearAllDatasets = () => {
    setDatasetsState({
      flexLoaded: false,
      bass2Loaded: false,
      same2Loaded: false,
      saffire2Loaded: false,
      psi62Loaded: false,
      uploadedCsv: null,
    });
    setCsvStatusMessage(null);
  };

  const handleRestoreAllDatasets = () => {
    setDatasetsState((prev) => ({
      ...prev,
      flexLoaded: true,
      bass2Loaded: true,
      same2Loaded: true,
      saffire2Loaded: true,
      psi62Loaded: true,
    }));
  };

  const grounding = useMemo(
    () =>
      buildGroundingContext({
        state: datasetsState,
        flexRows: FLEX_TABLE_IX,
        bass2Rows: BASS2_TABLE_5_1,
        same2Rows: SAME2_TABLE_1,
        saffireRows,
      }),
    [datasetsState, saffireRows]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-100">
      <TopBar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onCsvUpload={handleCsvUpload}
        uploadedFileName={datasetsState.uploadedCsv?.fileName ?? null}
      />

      {csvStatusMessage && (
        <div
          role="status"
          className="mx-auto mt-3 max-w-7xl w-full px-4 sm:px-6"
        >
          <div className="flex items-center justify-between border border-amber-500/40 bg-amber-950/30 px-4 py-2 font-mono text-xs text-amber-200">
            <span>{csvStatusMessage}</span>
            <button
              type="button"
              onClick={() => setCsvStatusMessage(null)}
              className="text-amber-300 hover:text-amber-100 ml-4"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        <HeroOverview
          issTelemetry={issTelemetry}
          issLoading={issLoading}
          onRefreshIss={fetchIss}
          nasaMedia={nasaMedia}
          mediaLoading={mediaLoading}
          onRefreshMedia={fetchMedia}
          datasetsState={datasetsState}
          onToggleDataset={handleToggleDataset}
          onClearAllDatasets={handleClearAllDatasets}
          onRestoreAllDatasets={handleRestoreAllDatasets}
          onNavigateSection={handleSelectSection}
          onOpenChartFromFinding={handleOpenChartFromFinding}
        />

        <FlameSimulator />

        <TelemetryExplorer
          datasetsState={datasetsState}
          saffireRows={saffireRows}
          saffireNotes={saffireNotes}
          onTriggerCsvUpload={handleCsvUpload}
          activeTab={telemetryTab}
          onTabChange={setTelemetryTab}
          tableSource={telemetryTableSource}
          onTableSourceChange={setTelemetryTableSource}
        />

        <GravityAndEngines />

        <GroundedSpecialist grounding={grounding} datasetsState={datasetsState} />

        <SourcesAndLicenses />
      </main>

      <Footer />
    </div>
  );
}
