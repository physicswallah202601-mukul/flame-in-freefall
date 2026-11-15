import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDownUp, Download, FileSpreadsheet, Info, Search, AlertCircle } from 'lucide-react';
import { FLEX_TABLE_IX } from '../data/flexTableIX';
import {
  BASS2_GOLDILOCKS_BOUNDARY_POINTS,
  BASS2_TABLE_5_1,
  SAME2_TABLE_1,
} from '../data/nasaDatasets';
import {
  computeD2RegressionSeries,
  evaluateCabinScreeningPoint,
  mmHgToAtm,
  mmHgToKpa,
} from '../utils/physics';
import {
  buildSampleSootRadiativeCsv,
  SAMPLE_SOOT_RADIATIVE_FILENAME,
} from '../utils/csvParser';
import type { LoadedDatasetsState, Saffire2CsvRow } from '../types/combustion';
import { TermTooltip } from './TermTooltip';

export type ExplorerTab = 'd2' | 'bass_same' | 'soot_rad' | 'uploaded';
export type TableSourceId = 'flex' | 'bass2' | 'same2' | 'saffire2' | 'uploaded';
type PressureUnit = 'mmHg' | 'atm' | 'kPa';

interface TelemetryExplorerProps {
  datasetsState: LoadedDatasetsState;
  saffireRows: Saffire2CsvRow[];
  saffireNotes: string[];
  onTriggerCsvUpload: (file: File) => void;
  activeTab: ExplorerTab;
  onTabChange: (tab: ExplorerTab) => void;
  tableSource: TableSourceId;
  onTableSourceChange: (src: TableSourceId) => void;
}

export const TelemetryExplorer: React.FC<TelemetryExplorerProps> = ({
  datasetsState,
  saffireRows,
  saffireNotes,
  onTriggerCsvUpload,
  activeTab,
  onTabChange,
  tableSource,
  onTableSourceChange,
}) => {
  const [primaryFlexId, setPrimaryFlexId] = useState<string>('FLEX-034');
  const [compareFlexId, setCompareFlexId] = useState<string>('FLEX-035');

  const [searchQuery, setSearchQuery] = useState('');
  const [fuelFilter, setFuelFilter] = useState<'ALL' | 'Methanol' | 'Heptane'>('ALL');
  const [pressureUnit, setPressureUnit] = useState<PressureUnit>('mmHg');
  const [sortField, setSortField] = useState<string>('test');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [cabinO2Pct, setCabinO2Pct] = useState<number>(21.0);
  const [cabinStretchA, setCabinStretchA] = useState<number>(10);
  const pageSize = 15;

  const cabinScreening = useMemo(
    () => evaluateCabinScreeningPoint(cabinO2Pct, cabinStretchA),
    [cabinO2Pct, cabinStretchA]
  );

  const handleDownloadSampleCsv = () => {
    const csvContent = buildSampleSootRadiativeCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', SAMPLE_SOOT_RADIATIVE_FILENAME);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const validFlexForCurve = useMemo(
    () =>
      FLEX_TABLE_IX.filter(
        (r) => r.d0Mm !== null && r.burningRateMm2PerS !== null && r.burnTimeS !== null
      ),
    []
  );

  const primaryRecord = useMemo(
    () => validFlexForCurve.find((r) => r.test === primaryFlexId) ?? validFlexForCurve[0],
    [validFlexForCurve, primaryFlexId]
  );
  const compareRecord = useMemo(
    () => validFlexForCurve.find((r) => r.test === compareFlexId) ?? validFlexForCurve[1],
    [validFlexForCurve, compareFlexId]
  );

  const primaryCurve = useMemo(() => computeD2RegressionSeries(primaryRecord, 24), [primaryRecord]);
  const compareCurve = useMemo(() => computeD2RegressionSeries(compareRecord, 24), [compareRecord]);

  // Merge curve timestamps on common normalized step array for Recharts LineChart
  const combinedD2ChartData = useMemo(() => {
    const pPts = primaryCurve.points;
    const cPts = compareCurve.points;
    const allTimes = Array.from(new Set([...pPts.map((p) => p.t), ...cPts.map((p) => p.t)])).sort(
      (a, b) => a - b
    );
    const interpolate = (pts: { t: number; d2Mm2: number }[], t: number) => {
      if (pts.length === 0) return null;
      const exact = pts.find((p) => p.t === t);
      if (exact) return exact.d2Mm2;
      if (t > pts[pts.length - 1].t) return null;
      for (let i = 0; i < pts.length - 1; i++) {
        if (t >= pts[i].t && t <= pts[i + 1].t) {
          const frac = (t - pts[i].t) / Math.max(1e-6, pts[i + 1].t - pts[i].t);
          return Number((pts[i].d2Mm2 + frac * (pts[i + 1].d2Mm2 - pts[i].d2Mm2)).toFixed(3));
        }
      }
      return null;
    };
    return allTimes.map((t) => ({
      t,
      primaryD2: interpolate(pPts, t),
      compareD2: interpolate(cPts, t),
    }));
  }, [primaryCurve, compareCurve]);

  const same2ComparisonChart = useMemo(() => {
    const materials = ['Kapton', 'Lampwick', 'Silicone', 'Teflon', 'Pyrell'];
    return materials.map((mat) => {
      const unaged = SAME2_TABLE_1.find((r) => r.material === mat && r.aging === 'Unaged');
      const aged = SAME2_TABLE_1.find((r) => r.material === mat && r.aging === 'Aged 720 s');
      return {
        material: mat,
        unagedMassUm: unaged?.massMeanUm ?? 0,
        agedMassUm: aged?.massMeanUm ?? 0,
        unagedCountUm: unaged?.countMeanUm ?? 0,
        agedCountUm: aged?.countMeanUm ?? 0,
      };
    });
  }, []);

  // Filtered & sorted FLEX rows
  const filteredFlexRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = FLEX_TABLE_IX.filter((r) => {
      if (fuelFilter !== 'ALL' && r.fuel !== fuelFilter) return false;
      if (!q) return true;
      return (
        r.test.toLowerCase().includes(q) ||
        r.identifier.toLowerCase().includes(q) ||
        r.fuel.toLowerCase().includes(q) ||
        r.testEnd.toLowerCase().includes(q) ||
        r.date.toLowerCase().includes(q)
      );
    });

    const sorted = [...list].sort((a, b) => {
      const getVal = (item: typeof a): string | number => {
        switch (sortField) {
          case 'fuel':
            return item.fuel;
          case 'pressure':
            return item.pressureMmHg ?? -1;
          case 'o2':
            return item.o2;
          case 'd0':
            return item.d0Mm ?? -1;
          case 'dext':
            return item.dExtMm ?? -1;
          case 'k':
            return item.burningRateMm2PerS ?? -1;
          case 'time':
            return item.burnTimeS ?? -1;
          case 'end':
            return item.testEnd;
          default:
            return item.test;
        }
      };
      const va = getVal(a);
      const vb = getVal(b);
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return sorted;
  }, [searchQuery, fuelFilter, sortField, sortDir]);

  const pagedFlexRows = useMemo(
    () => filteredFlexRows.slice(page * pageSize, (page + 1) * pageSize),
    [filteredFlexRows, page]
  );

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  const formatPressure = (mmHg: number | null) => {
    if (mmHg === null) return '—';
    if (pressureUnit === 'atm') return mmHgToAtm(mmHg).toFixed(3);
    if (pressureUnit === 'kPa') return mmHgToKpa(mmHg).toFixed(2);
    return mmHg.toFixed(1);
  };

  return (
    <section id="telemetry" className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="border border-slate-800 bg-[#0B1120]">
        {/* Header & Visualization Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            <div>
              <h2 className="font-display text-xl font-bold text-slate-50">
                2. Telemetry and d² Explorer
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Measured NASA droplet, slab flammability, smoke aerosol, and Cygnus duct telemetry
                with file provenance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Telemetry chart views">
            {[
              { id: 'd2', label: 'FLEX d² Trajectory' },
              { id: 'bass_same', label: 'BASS-II & SAME-2' },
              { id: 'soot_rad', label: 'Soot & Radiative Loss' },
              ...(datasetsState.uploadedCsv ? [{ id: 'uploaded', label: 'Uploaded CSV Plot' }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => onTabChange(tab.id as ExplorerTab)}
                className={`border px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  activeTab === tab.id
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Terms Glossary Strip */}
        <div
          data-testid="terms-glossary-strip"
          className="border-b border-slate-800 bg-[#090E1A] px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300"
        >
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-300">
            Key Terms (Click/Hover):
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TermTooltip termKey="d2" />
            <span className="text-slate-400">Droplet shrinkage</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TermTooltip termKey="burnRateK" />
            <span className="text-slate-400">Burn rate</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TermTooltip termKey="pmma" />
            <span className="text-slate-400">Acrylic test fuel</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TermTooltip termKey="stretchRateA" />
            <span className="text-slate-400">Airflow stretch</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TermTooltip termKey="sigmaG" />
            <span className="text-slate-400">Particle spread</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TermTooltip termKey="dg" />
            <span className="text-slate-400">Mean smoke size</span>
          </span>
        </div>

        {/* Chart Pane */}
        <div className="p-5 border-b border-slate-800">
          {activeTab === 'd2' && (
            <div>
              {!datasetsState.flexLoaded ? (
                <div className="border border-slate-800 bg-[#070B14] p-8 text-center">
                  <p className="font-mono text-sm text-amber-300">
                    FLEX dataset (20150023456_b4f6ca98.pdf) is currently unloaded.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Re-enable FLEX in the Loaded NASA Sources panel above or upload a local CSV.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-8">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-3">
                      <label className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-xs font-mono text-slate-200 w-full sm:w-auto">
                        <span className="shrink-0">Run A (Cyan):</span>
                        <select
                          value={primaryFlexId}
                          onChange={(e) => setPrimaryFlexId(e.target.value)}
                          className="w-full sm:w-auto border border-slate-700 bg-[#070B14] px-2.5 py-1.5 font-mono text-xs text-cyan-300"
                        >
                          {validFlexForCurve.map((r) => (
                            <option key={r.test} value={r.test}>
                              {r.test} · {r.fuel} ({r.d0Mm}mm, O₂ {(r.o2 * 100).toFixed(0)}%)
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-xs font-mono text-slate-200 w-full sm:w-auto">
                        <span className="shrink-0">Run B (Amber):</span>
                        <select
                          value={compareFlexId}
                          onChange={(e) => setCompareFlexId(e.target.value)}
                          className="w-full sm:w-auto border border-slate-700 bg-[#070B14] px-2.5 py-1.5 font-mono text-xs text-amber-300"
                        >
                          {validFlexForCurve.map((r) => (
                            <option key={r.test} value={r.test}>
                              {r.test} · {r.fuel} ({r.d0Mm}mm, O₂ {(r.o2 * 100).toFixed(0)}%)
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="h-80 w-full border border-slate-800 bg-[#070B14] p-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={combinedD2ChartData} margin={{ top: 8, right: 24, bottom: 22, left: 6 }}>
                          <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                          <XAxis
                            dataKey="t"
                            type="number"
                            domain={[0, 'dataMax']}
                            tickCount={7}
                            tickFormatter={(v) => `${Number(v).toFixed(1)}`}
                            stroke="#94A3B8"
                            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                            label={{
                              value: 'Burn Time t (s)',
                              position: 'insideBottom',
                              offset: -12,
                              fill: '#94A3B8',
                              fontSize: 11,
                            }}
                          />
                          <YAxis
                            stroke="#94A3B8"
                            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                            label={{
                              value: 'D² (mm²)',
                              angle: -90,
                              position: 'insideLeft',
                              fill: '#94A3B8',
                              fontSize: 11,
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0B1120',
                              borderColor: '#334155',
                              fontFamily: 'JetBrains Mono',
                              fontSize: '12px',
                            }}
                          />
                          <Legend
                            verticalAlign="top"
                            height={30}
                            wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="primaryD2"
                            name={`${primaryRecord.test} (${primaryRecord.fuel}, K=${primaryRecord.burningRateMm2PerS})`}
                            stroke="#22D3EE"
                            strokeWidth={2.2}
                            dot={false}
                            connectNulls={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="compareD2"
                            name={`${compareRecord.test} (${compareRecord.fuel}, K=${compareRecord.burningRateMm2PerS})`}
                            stroke="#F59E0B"
                            strokeWidth={2.2}
                            strokeDasharray="5 3"
                            dot={false}
                            connectNulls={false}
                          />
                          {primaryCurve.reportedDextSquared !== null && (
                            <ReferenceLine
                              y={primaryCurve.reportedDextSquared}
                              stroke="#22D3EE"
                              strokeDasharray="3 4"
                              label={{
                                value: `${primaryRecord.test} Dext²=${primaryCurve.reportedDextSquared}`,
                                fill: '#67E8F9',
                                fontSize: 10,
                                position: 'insideTopRight',
                              }}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Derivations & Measured Scalars Box */}
                  <div className="lg:col-span-4 border border-slate-800 bg-[#070B14] p-4 space-y-3 text-xs sm:text-[13px]">
                    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-cyan-300">
                      <Info className="h-4 w-4" aria-hidden="true" />
                      <span>Derivations & Provenance</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      <strong>Source:</strong>{' '}
                      <span className="font-mono text-slate-100">20150023456_b4f6ca98.pdf</span>{' '}
                      (NASA/TP—2015-216046, Table IX).
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      <strong>
                        <TermTooltip termKey="d2" label="d²-Law" /> Reconstruction:
                      </strong>{' '}
                      <code className="text-cyan-300">D²(t) = D₀² − K·t</code> is reconstructed
                      linearly from the report&apos;s measured <code className="text-slate-100">D₀</code>,
                      average burning-rate constant <TermTooltip termKey="burnRateK" label="K (mm²/s)" />,
                      and burn time <code className="text-slate-100">t_burn (s)</code> (frame-by-frame
                      backlit image time series are on the NASA DVD addendum, not in Table IX).
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      <strong>Unit Conversions:</strong>{' '}
                      <code className="text-amber-300">P(atm) = P(mmHg) / 760</code> and{' '}
                      <code className="text-amber-300">P(kPa) = P(mmHg) × 101.325 / 760</code>.
                    </p>
                    <div className="border-t border-slate-800 pt-2.5 grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-400 block">{primaryRecord.test} End:</span>
                        <span className="text-cyan-300">{primaryRecord.testEnd}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{primaryRecord.test} P:</span>
                        <span className="text-slate-200 tabular-nums">
                          {primaryRecord.pressureMmHg} mmHg (
                          {primaryRecord.pressureMmHg ? mmHgToAtm(primaryRecord.pressureMmHg) : '—'} atm)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{compareRecord.test} End:</span>
                        <span className="text-amber-300">{compareRecord.testEnd}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{compareRecord.test} P:</span>
                        <span className="text-slate-200 tabular-nums">
                          {compareRecord.pressureMmHg} mmHg (
                          {compareRecord.pressureMmHg ? mmHgToAtm(compareRecord.pressureMmHg) : '—'} atm)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bass_same' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* BASS-II Goldilocks Flammability Curve */}
              <div className="border border-slate-800 bg-[#070B14] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-sm font-semibold text-slate-100">
                    BASS-II Goldilocks Flammability Boundary (Eq. 6.1)
                  </h3>
                  <span className="font-mono text-[11px] text-slate-400">
                    TM-20210011385_5ffa911f.pdf
                  </span>
                </div>
                {!datasetsState.bass2Loaded ? (
                  <p className="py-12 text-center font-mono text-xs text-amber-300">
                    BASS-II source is currently unloaded.
                  </p>
                ) : (
                  <>
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={BASS2_GOLDILOCKS_BOUNDARY_POINTS}
                          margin={{ top: 8, right: 16, bottom: 20, left: 0 }}
                        >
                          <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                          <XAxis
                            dataKey="stretchRatePerS"
                            type="number"
                            domain={[0, 'dataMax']}
                            tickCount={7}
                            stroke="#94A3B8"
                            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                            label={{
                              value: 'Normalized Stretch Rate a (s⁻¹)',
                              position: 'insideBottom',
                              offset: -10,
                              fill: '#94A3B8',
                              fontSize: 11,
                            }}
                          />
                          <YAxis
                            domain={[12, 30]}
                            stroke="#94A3B8"
                            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                            label={{
                              value: 'Min O₂ (%)',
                              angle: -90,
                              position: 'insideLeft',
                              fill: '#94A3B8',
                              fontSize: 11,
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0B1120',
                              borderColor: '#334155',
                              fontFamily: 'JetBrains Mono',
                              fontSize: '12px',
                            }}
                          />
                          <Legend
                            verticalAlign="top"
                            height={30}
                            wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="minO2Pct"
                            name="0g Boundary X_O2 = 6e^(-0.5a)+0.0167a+13.4"
                            stroke="#22D3EE"
                            strokeWidth={2.2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="normalGravityLimitPct"
                            name="1g Upward Limit (15.4% O₂)"
                            stroke="#F59E0B"
                            strokeDasharray="4 4"
                            dot={false}
                          />
                          <ReferenceDot
                            x={cabinScreening.stretchRatePerS}
                            y={cabinScreening.oxygenPct}
                            r={6}
                            fill={cabinScreening.isAbovePropagationBoundary ? '#F59E0B' : '#34D399'}
                            stroke="#F8FAFC"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="mt-2 font-mono text-xs text-slate-300">
                      Minimum 13.5% O₂ for <TermTooltip termKey="pmma" /> at stretch{' '}
                      <TermTooltip termKey="stretchRateA" label="a = 8–12 s⁻¹" /> lies below the 1g
                      upward limit (15.4% O₂).
                    </p>

                    {/* Interactive Cabin Screening Check */}
                    <div className="mt-4 border border-slate-800 bg-[#0B1120] p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-300">
                          Cabin Screening Check
                        </span>
                        <span
                          className={`border px-2.5 py-0.5 font-mono text-xs ${
                            cabinScreening.isAbovePropagationBoundary
                              ? 'border-amber-500/60 bg-amber-950/40 text-amber-200'
                              : 'border-emerald-500/60 bg-emerald-950/40 text-emerald-200'
                          }`}
                        >
                          {cabinScreening.isAbovePropagationBoundary
                            ? `Above Eq. (6.1) Boundary (+${cabinScreening.deltaPct.toFixed(2)}% O₂)`
                            : `At/Below Eq. (6.1) Boundary (${cabinScreening.deltaPct.toFixed(2)}% O₂)`}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between font-mono text-xs">
                            <label htmlFor="bass-cabin-o2" className="text-slate-200">
                              Cabin Oxygen (%)
                            </label>
                            <span className="tabular-nums text-cyan-300 font-semibold">
                              {cabinO2Pct.toFixed(1)}%
                            </span>
                          </div>
                          <input
                            id="bass-cabin-o2"
                            type="range"
                            min={13}
                            max={28}
                            step={0.5}
                            value={cabinO2Pct}
                            onChange={(e) => setCabinO2Pct(Number(e.target.value))}
                            className="telemetry-slider mt-2 w-full"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between font-mono text-xs">
                            <label htmlFor="bass-stretch-a" className="text-slate-200">
                              Ventilation Stretch (<TermTooltip termKey="stretchRateA" label="a" />)
                            </label>
                            <span className="tabular-nums text-amber-300 font-semibold">
                              {cabinStretchA} s⁻¹
                            </span>
                          </div>
                          <input
                            id="bass-stretch-a"
                            type="range"
                            min={1}
                            max={50}
                            step={1}
                            value={cabinStretchA}
                            onChange={(e) => setCabinStretchA(Number(e.target.value))}
                            className="telemetry-slider mt-2 w-full"
                          />
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed">
                        Operating point (
                        <span className="font-mono text-slate-50">
                          {cabinScreening.oxygenPct.toFixed(1)}% O₂, a = {cabinScreening.stretchRatePerS} s⁻¹
                        </span>
                        ) lies{' '}
                        <strong
                          className={
                            cabinScreening.isAbovePropagationBoundary
                              ? 'text-amber-300'
                              : 'text-emerald-300'
                          }
                        >
                          {cabinScreening.isAbovePropagationBoundary ? 'above' : 'at or below'}
                        </strong>{' '}
                        the measured BASS-II PMMA Eq. (6.1) propagation boundary of{' '}
                        <span className="font-mono text-cyan-300">
                          {cabinScreening.boundaryO2Pct.toFixed(2)}% O₂
                        </span>
                        . <span className="text-slate-300">Educational data comparison only — not an official safety certification.</span>
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* SAME-2 Aerosol Coagulation Diameter Shift */}
              <div className="border border-slate-800 bg-[#070B14] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-sm font-semibold text-slate-100">
                    SAME-2 Smoke Diameter of Average Mass (M₃/M₀)
                  </h3>
                  <span className="font-mono text-[11px] text-slate-400">
                    20130000422_bdc5e7e0.pdf · Table 1
                  </span>
                </div>
                {!datasetsState.same2Loaded ? (
                  <p className="py-12 text-center font-mono text-xs text-amber-300">
                    SAME-2 source is currently unloaded.
                  </p>
                ) : (
                  <>
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={same2ComparisonChart}
                          margin={{ top: 10, right: 16, bottom: 16, left: 0 }}
                        >
                          <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                          <XAxis
                            dataKey="material"
                            stroke="#94A3B8"
                            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                          />
                          <YAxis
                            stroke="#94A3B8"
                            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                            label={{
                              value: 'Diameter (µm)',
                              angle: -90,
                              position: 'insideLeft',
                              fill: '#94A3B8',
                              fontSize: 11,
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0B1120',
                              borderColor: '#334155',
                              fontFamily: 'JetBrains Mono',
                              fontSize: '12px',
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
                          <Bar dataKey="unagedMassUm" name="Unaged M3/M0 (µm)" fill="#38BDF8" />
                          <Bar dataKey="agedMassUm" name="Aged 720 s M3/M0 (µm)" fill="#F59E0B" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="mt-2 font-mono text-xs text-slate-300 leading-relaxed">
                      720 s coagulation increases particle diameters across all 5 spacecraft
                      materials (reported via <TermTooltip termKey="dg" /> and{' '}
                      <TermTooltip termKey="sigmaG" /> in Table 1).
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'soot_rad' && (
            <div className="border border-slate-800 bg-[#070B14] p-5">
              {datasetsState.uploadedCsv &&
              (datasetsState.uploadedCsv.hasSootColumn ||
                datasetsState.uploadedCsv.hasRadiativeColumn) ? (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-display text-sm font-semibold text-amber-300">
                        User-Uploaded Soot / Radiative Measurements ({datasetsState.uploadedCsv.fileName})
                      </h3>
                      <span className="font-mono text-[11px] text-slate-400">
                        Uploaded CSV provenance (non-NASA user/demo file)
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-200 hover:border-cyan-400">
                        <span>Upload Another CSV</span>
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onTriggerCsvUpload(f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleDownloadSampleCsv}
                        className="inline-flex items-center gap-1.5 border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-amber-300 hover:border-amber-400"
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Download Sample CSV</span>
                      </button>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={datasetsState.uploadedCsv.rows.map((r, i) => {
                          const obj: Record<string, number> = { rowIndex: i + 1 };
                          datasetsState.uploadedCsv!.numericColumns.forEach((col) => {
                            obj[col] = Number(r[col]) || 0;
                          });
                          return obj;
                        })}
                      >
                        <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                        <XAxis
                          dataKey={datasetsState.uploadedCsv.numericColumns[0] ?? 'rowIndex'}
                          stroke="#94A3B8"
                          tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                        />
                        <YAxis stroke="#94A3B8" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0B1120',
                            borderColor: '#334155',
                            fontFamily: 'JetBrains Mono',
                            fontSize: '12px',
                          }}
                        />
                        <Legend />
                        {datasetsState.uploadedCsv.numericColumns.slice(1, 4).map((col, idx) => (
                          <Line
                            key={col}
                            type="monotone"
                            dataKey={col}
                            stroke={idx === 0 ? '#22D3EE' : '#F59E0B'}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" aria-hidden="true" />
                    <div>
                      <h3 className="font-display text-base font-semibold text-slate-100">
                        Quantitative Soot & Radiative Heat Loss Unavailable in Attached NASA Tables
                      </h3>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-3xl">
                        Per scientific provenance rules, synthetic soot or radiative-loss curves are
                        never fabricated. Across the attached NASA documents, these measurements are
                        explicitly absent or uncalibrated:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="border border-slate-800 bg-[#0B1120] p-3.5">
                      <div className="font-mono text-[11px] uppercase text-cyan-300">
                        20150023456_b4f6ca98.pdf (FLEX)
                      </div>
                      <p className="mt-1.5 text-slate-300 leading-relaxed">
                        Radiometers were not sensitive enough to provide reliable quantitative
                        radiative output and were omitted from the report. Quantitative soot volume
                        fraction time series are not tabulated in Table IX.
                      </p>
                    </div>
                    <div className="border border-slate-800 bg-[#0B1120] p-3.5">
                      <div className="font-mono text-[11px] uppercase text-cyan-300">
                        TM-20210011385_5ffa911f.pdf (BASS-II)
                      </div>
                      <p className="mt-1.5 text-slate-300 leading-relaxed">
                        The MSG flow-duct radiometer was uncalibrated and provided only a relative
                        intensity signal to confirm extinction timing and ~1.1 Hz pre-quenching
                        oscillations (not calibrated W/m² heat loss).
                      </p>
                    </div>
                    <div className="border border-slate-800 bg-[#0B1120] p-3.5">
                      <div className="font-mono text-[11px] uppercase text-cyan-300">
                        i_Investigation_fbbe3e34.txt (PSI-62)
                      </div>
                      <p className="mt-1.5 text-slate-300 leading-relaxed">
                        Describes two-color DSLR tomography for soot & temperature reconstructions in
                        external publications (DOI 10.60555/e9xp-ex83), but no raw tomography CSV is
                        attached in this file.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <label className="inline-flex cursor-pointer items-center gap-2 border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-200 hover:border-cyan-400">
                      <span>Upload CSV with soot / radiative columns</span>
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onTriggerCsvUpload(f);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleDownloadSampleCsv}
                      className="inline-flex items-center gap-1.5 border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-amber-300 hover:border-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Download Sample CSV</span>
                    </button>
                    <span className="font-mono text-[11px] text-slate-400">
                      Downloads synthetic <code className="text-slate-300">sample_soot_radiative_demo.csv</code> for upload testing (not NASA flight data).
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'uploaded' && datasetsState.uploadedCsv && (
            <div className="border border-slate-800 bg-[#070B14] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="font-display text-sm font-semibold text-amber-300">
                  Uploaded CSV Numeric Preview · {datasetsState.uploadedCsv.fileName}
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  {datasetsState.uploadedCsv.rows.length} rows · Numeric columns:{' '}
                  {datasetsState.uploadedCsv.numericColumns.join(', ') || 'None'}
                </div>
              </div>
              {datasetsState.uploadedCsv.numericColumns.length >= 2 ? (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={datasetsState.uploadedCsv.rows.slice(0, 100).map((r, idx) => {
                        const row: Record<string, number> = { idx: idx + 1 };
                        datasetsState.uploadedCsv!.numericColumns.forEach((col) => {
                          row[col] = Number((r[col] ?? '').replace(/[~<>]/g, '').split(/\s+/)[0]) || 0;
                        });
                        return row;
                      })}
                    >
                      <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                      <XAxis
                        dataKey={datasetsState.uploadedCsv.numericColumns[0]}
                        stroke="#94A3B8"
                        tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                      />
                      <YAxis stroke="#94A3B8" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0B1120',
                          borderColor: '#334155',
                          fontFamily: 'JetBrains Mono',
                          fontSize: '12px',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={datasetsState.uploadedCsv.numericColumns[1]}
                        stroke="#22D3EE"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="font-mono text-xs text-slate-400">
                  Fewer than 2 numeric columns detected; inspect raw rows in the table below.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Searchable, Sortable Raw Telemetry Table with Provenance */}
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'flex', label: `FLEX Table IX (${FLEX_TABLE_IX.length})` },
                { id: 'bass2', label: `BASS-II Table 5.1 (${BASS2_TABLE_5_1.length})` },
                { id: 'same2', label: `SAME-2 Table 1 (${SAME2_TABLE_1.length})` },
                { id: 'saffire2', label: `SAFFIRE-II CSV (${saffireRows.length})` },
                ...(datasetsState.uploadedCsv
                  ? [{ id: 'uploaded', label: `Uploaded (${datasetsState.uploadedCsv.rows.length})` }]
                  : []),
              ].map((src) => (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => {
                    onTableSourceChange(src.id as TableSourceId);
                    setPage(0);
                  }}
                  className={`border px-3 py-1.5 font-mono text-xs uppercase transition-colors ${
                    tableSource === src.id
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100'
                  }`}
                >
                  {src.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Filter rows..."
                  aria-label="Search raw telemetry rows"
                  className="border border-slate-700 bg-[#070B14] pl-8 pr-3 py-1 font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {tableSource === 'flex' && (
                <>
                  <select
                    aria-label="Filter FLEX fuel"
                    value={fuelFilter}
                    onChange={(e) => {
                      setFuelFilter(e.target.value as 'ALL' | 'Methanol' | 'Heptane');
                      setPage(0);
                    }}
                    className="border border-slate-700 bg-[#070B14] px-2 py-1 font-mono text-xs text-slate-200"
                  >
                    <option value="ALL">All Fuels</option>
                    <option value="Methanol">Methanol</option>
                    <option value="Heptane">Heptane</option>
                  </select>
                  <select
                    aria-label="Select FLEX pressure unit"
                    value={pressureUnit}
                    onChange={(e) => setPressureUnit(e.target.value as PressureUnit)}
                    className="border border-slate-700 bg-[#070B14] px-2 py-1 font-mono text-xs text-amber-300"
                  >
                    <option value="mmHg">Pressure: mmHg (raw)</option>
                    <option value="atm">Pressure: atm (/760)</option>
                    <option value="kPa">Pressure: kPa (converted)</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {/* FLEX Raw Table */}
          {tableSource === 'flex' && (
            <div>
              <div className="overflow-x-auto border border-slate-800">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#070B14] text-slate-400 border-b border-slate-800">
                    <tr>
                      {[
                        { key: 'test', label: 'Test' },
                        { key: 'fuel', label: 'Fuel' },
                        { key: 'pressure', label: `P (${pressureUnit})` },
                        { key: 'o2', label: 'O₂ frac' },
                        { key: 'd0', label: 'D₀ (mm)' },
                        { key: 'dext', label: 'Dext (mm)' },
                        { key: 'k', label: 'K (mm²/s)' },
                        { key: 'time', label: 'Burn (s)' },
                        { key: 'end', label: 'Test End' },
                      ].map((col) => (
                        <th key={col.key} className="px-3 py-2 font-medium whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => toggleSort(col.key)}
                            className="inline-flex items-center gap-1 hover:text-cyan-300"
                          >
                            <span>{col.label}</span>
                            <ArrowDownUp className="h-3 w-3 opacity-60" aria-hidden="true" />
                          </button>
                        </th>
                      ))}
                      <th className="px-3 py-2 font-medium whitespace-nowrap">Provenance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 tabular-nums">
                    {pagedFlexRows.map((row) => (
                      <tr key={row.test} className="hover:bg-slate-900/50">
                        <td className="px-3 py-2 text-cyan-300 whitespace-nowrap">{row.test}</td>
                        <td className="px-3 py-2 text-slate-200">{row.fuel}</td>
                        <td className="px-3 py-2 text-slate-200">{formatPressure(row.pressureMmHg)}</td>
                        <td className="px-3 py-2 text-slate-300">{row.o2.toFixed(2)}</td>
                        <td className="px-3 py-2 text-slate-200">{row.d0Mm !== null ? row.d0Mm.toFixed(2) : '—'}</td>
                        <td className="px-3 py-2 text-slate-300">{row.dExtMm !== null ? row.dExtMm.toFixed(2) : '—'}</td>
                        <td className="px-3 py-2 text-amber-300">
                          {row.burningRateMm2PerS !== null ? row.burningRateMm2PerS.toFixed(2) : '—'}
                        </td>
                        <td className="px-3 py-2 text-slate-200">
                          {row.burnTimeS !== null ? row.burnTimeS.toFixed(1) : '—'}
                        </td>
                        <td className="px-3 py-2 text-slate-300">{row.testEnd}</td>
                        <td className="px-3 py-2 text-slate-300 text-xs whitespace-nowrap">
                          20150023456_b4f6ca98.pdf · Table IX
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-xs text-slate-300">
                <span>
                  Showing {filteredFlexRows.length === 0 ? 0 : page * pageSize + 1}–
                  {Math.min((page + 1) * pageSize, filteredFlexRows.length)} of {filteredFlexRows.length} tests
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="border border-slate-700 px-3 py-1.5 disabled:opacity-40 hover:border-cyan-400"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={(page + 1) * pageSize >= filteredFlexRows.length}
                    onClick={() => setPage((p) => p + 1)}
                    className="border border-slate-700 px-3 py-1.5 disabled:opacity-40 hover:border-cyan-400"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BASS-II Table 5.1 */}
          {tableSource === 'bass2' && (
            <div className="overflow-x-auto border border-slate-800">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#070B14] text-slate-300 border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2">Test</th>
                    <th className="px-3 py-2">Thick (mm)</th>
                    <th className="px-3 py-2">Width (cm)</th>
                    <th className="px-3 py-2">Sides</th>
                    <th className="px-3 py-2">Flow (cm/s)</th>
                    <th className="px-3 py-2">Spread (mm/s)</th>
                    <th className="px-3 py-2">Burn (min)</th>
                    <th className="px-3 py-2">O₂ Init → Final (%)</th>
                    <th className="px-3 py-2">Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 tabular-nums">
                  {BASS2_TABLE_5_1.filter(
                    (r) =>
                      !searchQuery.trim() ||
                      r.testNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      r.spreadRateMmPerS.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((row) => (
                    <tr key={row.testNo} className="hover:bg-slate-900/50">
                      <td className="px-3 py-2 text-cyan-300">{row.testNo}</td>
                      <td className="px-3 py-2">{row.thicknessMm}</td>
                      <td className="px-3 py-2">{row.widthCm}</td>
                      <td className="px-3 py-2">{row.sidesBurning}</td>
                      <td className="px-3 py-2">{row.velocityCmPerS}</td>
                      <td className="px-3 py-2 text-amber-300">{row.spreadRateMmPerS}</td>
                      <td className="px-3 py-2">{row.burnTimeMin}</td>
                      <td className="px-3 py-2">
                        {row.initialO2Pct.toFixed(1)} → {row.finalO2Pct.toFixed(1)}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-300 whitespace-nowrap">
                        TM-20210011385_5ffa911f.pdf · Table 5.1
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SAME-2 Table 1 */}
          {tableSource === 'same2' && (
            <div className="overflow-x-auto border border-slate-800">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#070B14] text-slate-300 border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2">Material</th>
                    <th className="px-3 py-2">Aging</th>
                    <th className="px-3 py-2">
                      <TermTooltip termKey="dg" label="Dg (µm)" />
                    </th>
                    <th className="px-3 py-2">Count Mean M1/M0 (µm)</th>
                    <th className="px-3 py-2">Mass Mean M3/M0 (µm)</th>
                    <th className="px-3 py-2">
                      <TermTooltip termKey="sigmaG" label="σg" />
                    </th>
                    <th className="px-3 py-2">Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 tabular-nums">
                  {SAME2_TABLE_1.filter(
                    (r) =>
                      !searchQuery.trim() ||
                      r.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      r.aging.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((row) => (
                    <tr key={`${row.material}-${row.aging}`} className="hover:bg-slate-900/50">
                      <td className="px-3 py-2 text-cyan-300">{row.material}</td>
                      <td className="px-3 py-2 text-slate-200">{row.aging}</td>
                      <td className="px-3 py-2">{row.dgUm.toFixed(3)}</td>
                      <td className="px-3 py-2">{row.countMeanUm.toFixed(3)}</td>
                      <td className="px-3 py-2 text-amber-300">{row.massMeanUm.toFixed(3)}</td>
                      <td className="px-3 py-2">{row.sigmaG.toFixed(3)}</td>
                      <td className="px-3 py-2 text-xs text-slate-300 whitespace-nowrap">
                        20130000422_bdc5e7e0.pdf · Table 1
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SAFFIRE-II CSV Table */}
          {tableSource === 'saffire2' && (
            <div className="space-y-3">
              <div className="overflow-x-auto border border-slate-800">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#070B14] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Sample</th>
                      <th className="px-3 py-2">Material</th>
                      <th className="px-3 py-2">Thickness (raw: Samle)</th>
                      <th className="px-3 py-2">Flow (cm/s)</th>
                      <th className="px-3 py-2">% O₂ (Note 1)</th>
                      <th className="px-3 py-2">Burn Time (s)</th>
                      <th className="px-3 py-2">?-g Burn Length</th>
                      <th className="px-3 py-2">1-g Spread Rate</th>
                      <th className="px-3 py-2">Provenance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {saffireRows
                      .filter(
                        (r) =>
                          !searchQuery.trim() ||
                          r.sampleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.material.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((row) => (
                        <tr key={row.sampleNumber} className="hover:bg-slate-900/50">
                          <td className="px-3 py-2 text-cyan-300">{row.sampleNumber}</td>
                          <td className="px-3 py-2 text-slate-200">
                            {row.material || <span className="text-slate-500 italic">(blank in CSV)</span>}
                          </td>
                          <td className="px-3 py-2">{row.thickness}</td>
                          <td className="px-3 py-2">
                            {row.airFlowCmPerS} ({row.flowDirection})
                          </td>
                          <td className="px-3 py-2">{row.percentO2}</td>
                          <td className="px-3 py-2 text-amber-300">{row.burnTimeS}</td>
                          <td className="px-3 py-2">{row.microGBurnLength}</td>
                          <td className="px-3 py-2">{row.oneGSpreadRate}</td>
                          <td className="px-3 py-2 text-[11px] text-slate-500 whitespace-nowrap">
                            PSI-99_Experimental_table_SAFFIRE-2_3c24390b.csv
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {saffireNotes.length > 0 && (
                <div className="border border-slate-800 bg-[#070B14] p-3 font-mono text-[11px] text-slate-400 space-y-1">
                  {saffireNotes.map((n, idx) => (
                    <div key={idx}>{n}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Uploaded CSV Table */}
          {tableSource === 'uploaded' && datasetsState.uploadedCsv && (
            <div className="overflow-x-auto border border-slate-800">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#070B14] text-slate-400 border-b border-slate-800">
                  <tr>
                    {datasetsState.uploadedCsv.headers.map((h) => (
                      <th key={h} className="px-3 py-2 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                    <th className="px-3 py-2">Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {datasetsState.uploadedCsv.rows.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      {datasetsState.uploadedCsv!.headers.map((h) => (
                        <td key={h} className="px-3 py-2 text-slate-200 whitespace-nowrap">
                          {row[h] || '—'}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-[11px] text-amber-300 whitespace-nowrap">
                        {datasetsState.uploadedCsv!.fileName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
