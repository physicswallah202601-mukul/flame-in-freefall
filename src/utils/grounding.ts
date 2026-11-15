import type {
  ActiveDatasetFlags,
  Bass2MillerRecord,
  FlexTestRecord,
  LoadedDatasetsState,
  Saffire2CsvRow,
  Same2AerosolRecord,
  UploadedCsvDataset,
} from '../types/combustion';

export interface GroundingContextResult {
  hasLoadedFiles: boolean;
  loadedFileNames: string[];
  contextSummary: string;
}

const MAX_UPLOADED_COLS = 24;
const MAX_UPLOADED_ROWS = 40;
const MAX_CELL_CHARS = 120;
const MAX_HEADER_CHARS = 64;

function stripControlChars(input: string): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function countLoadedSources(state: LoadedDatasetsState): number {
  let count = 0;
  if (state.flexLoaded) count++;
  if (state.bass2Loaded) count++;
  if (state.same2Loaded) count++;
  if (state.saffire2Loaded) count++;
  if (state.psi62Loaded) count++;
  if (state.uploadedCsv && state.uploadedCsv.rows.length > 0) count++;
  return count;
}

export function sanitizeActiveFlags(raw: unknown): ActiveDatasetFlags {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    flexLoaded: obj.flexLoaded === true,
    bass2Loaded: obj.bass2Loaded === true,
    same2Loaded: obj.same2Loaded === true,
    saffire2Loaded: obj.saffire2Loaded === true,
    psi62Loaded: obj.psi62Loaded === true,
  };
}

/**
 * Sanitizes and bounds an optional user-uploaded CSV payload on the server,
 * recomputing numeric/soot/radiative column flags server-side instead of trusting client flags.
 */
export function sanitizeUploadedCsvPayload(raw: unknown): UploadedCsvDataset | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.fileName !== 'string' || !Array.isArray(obj.headers) || !Array.isArray(obj.rows)) {
    return null;
  }

  const fileName = stripControlChars(obj.fileName).slice(0, 120);
  if (!fileName) return null;

  const headerPairs = obj.headers
    .filter((h): h is string => typeof h === 'string')
    .slice(0, MAX_UPLOADED_COLS)
    .map((rawH, idx) => ({
      raw: rawH,
      clean: stripControlChars(rawH).slice(0, MAX_HEADER_CHARS) || `Column_${idx + 1}`,
    }));

  const headers = headerPairs.map((p) => p.clean);
  if (headers.length === 0) return null;

  const rows: Record<string, string>[] = [];
  for (const rawRow of obj.rows.slice(0, MAX_UPLOADED_ROWS)) {
    if (!rawRow || typeof rawRow !== 'object') continue;
    const rowRecord = rawRow as Record<string, unknown>;
    const cleanRow: Record<string, string> = {};
    for (const pair of headerPairs) {
      const cellVal = rowRecord[pair.raw] ?? rowRecord[pair.clean];
      cleanRow[pair.clean] =
        typeof cellVal === 'string' || typeof cellVal === 'number'
          ? stripControlChars(String(cellVal)).slice(0, MAX_CELL_CHARS)
          : '';
    }
    rows.push(cleanRow);
  }

  if (rows.length === 0) return null;

  const numericColumns = headers.filter((header) => {
    let numericCount = 0;
    let nonEmpty = 0;
    for (const row of rows) {
      const val = (row[header] ?? '').replace(/[~<>]/g, '').trim();
      if (!val || val.toLowerCase() === 'n/a' || val === '-' || val === '–') continue;
      nonEmpty++;
      const parsed = Number(val.split(/\s+/)[0]);
      if (Number.isFinite(parsed)) {
        numericCount++;
      }
    }
    return nonEmpty > 0 && numericCount >= Math.ceil(nonEmpty * 0.5);
  });

  const lowerHeaders = headers.map((h) => h.toLowerCase());
  const hasSootColumn = lowerHeaders.some((h) => h.includes('soot'));
  const hasRadiativeColumn = lowerHeaders.some(
    (h) =>
      h.includes('radiat') ||
      h.includes('heat_loss') ||
      h.includes('heat loss') ||
      h.includes('flux')
  );

  return {
    fileName,
    headers,
    rows,
    notes: [],
    numericColumns,
    hasSootColumn,
    hasRadiativeColumn,
    loadedAtIso: new Date().toISOString(),
  };
}

export function buildGroundingContext(params: {
  state: LoadedDatasetsState;
  flexRows: FlexTestRecord[];
  bass2Rows: Bass2MillerRecord[];
  same2Rows: Same2AerosolRecord[];
  saffireRows: Saffire2CsvRow[];
}): GroundingContextResult {
  const { state, flexRows, bass2Rows, same2Rows, saffireRows } = params;
  const loadedFileNames: string[] = [];
  const sections: string[] = [];

  if (state.flexLoaded && flexRows.length > 0) {
    loadedFileNames.push('20150023456_b4f6ca98.pdf (NASA/TP—2015-216046, FLEX Table IX)');
    const methanol = flexRows.filter((r) => r.fuel === 'Methanol');
    const heptane = flexRows.filter((r) => r.fuel === 'Heptane');
    const sampleFlex = flexRows
      .slice(0, 10)
      .map(
        (r) =>
          `${r.test} (${r.fuel}, P=${r.pressureMmHg ?? 'N/A'} mmHg, O2=${r.o2}, N2=${r.n2}, CO2=${r.co2}, He=${r.he}, D0=${r.d0Mm ?? 'N/A'} mm, Dext=${r.dExtMm ?? 'N/A'} mm, K=${r.burningRateMm2PerS ?? 'N/A'} mm^2/s, t_burn=${r.burnTimeS ?? 'N/A'} s, End=${r.testEnd})`
      )
      .join('; ');

    sections.push(
      `FILE: 20150023456_b4f6ca98.pdf (FLEX, NASA/TP—2015-216046, Dietrich et al. Nov 2015)
- Columns in Table IX: Test, Identifier, Date, GMT, Fuel (Methanol/Heptane), Ambient pressure (mmHg), Initial mole fractions (O2, N2, CO2, He), Droplet initial diameter D0 (mm), Visible flame extinction diameter Dext (mm), Burning rate K (mm^2/s), Burn time (s), Test end (Extinction/Disruption/Completion).
- Loaded Table IX count: ${flexRows.length} tabulated Table IX tests (${methanol.length} Methanol, ${heptane.length} Heptane). Overall report range: pressure 0.70–3.05 atm (Tables I–VIII include 3.05 atm CO2-enriched runs), droplet D0 2–5 mm.
- CRITICAL MISSING DATA IN THIS FILE: Quantitative soot volume fraction is NOT tabulated in this report (only qualitative soot remarks for heptane). Quantitative radiative heat loss output is NOT reported because radiometers were not sensitive enough to provide reliable quantitative output and were omitted.
- Representative Table IX rows: ${sampleFlex}`
    );
  }

  if (state.bass2Loaded && bass2Rows.length > 0) {
    loadedFileNames.push('TM-20210011385_5ffa911f.pdf (NASA/TM-20210011385, BASS-II)');
    const sampleBass = bass2Rows
      .slice(0, 8)
      .map(
        (r) =>
          `${r.testNo}: ${r.thicknessMm}mm x ${r.widthCm}cm (${r.sidesBurning}-sided), v=${r.velocityCmPerS} cm/s, spread=${r.spreadRateMmPerS} mm/s, burn=${r.burnTimeMin} min, O2 ${r.initialO2Pct}%->${r.finalO2Pct}%`
      )
      .join('; ');
    sections.push(
      `FILE: TM-20210011385_5ffa911f.pdf (BASS-II, NASA/TM-20210011385, Olson et al. Oct 2021)
- Table 5.1 (Miller & Wichman, 20 flat clear cast PMMA tests M1–M20 in MSG opposed flow): Columns = Test no., Thickness (mm), Width (cm), One or two sides burning, Velocity (cm/s), Spread rate (mm/s), Burn time (min), Initial O2 (vol%), Final O2 (vol%).
- Section 6 Goldilocks Flammability Boundary (Eq. 6.1): X_O2 = 6*exp(-0.5*a) + 0.0167*a + 13.4, minimum ~13.5% O2 at stretch rate a = 8–12 s^-1 (below normal-gravity 15.4% O2 upward limit).
- Sensor note: Flow-duct radiometer was uncalibrated (relative intensity for extinction confirmation and ~1.1 Hz pre-quenching oscillations, not calibrated W/m^2 radiative heat loss).
- Representative Table 5.1 rows: ${sampleBass}`
    );
  }

  if (state.same2Loaded && same2Rows.length > 0) {
    loadedFileNames.push('20130000422_bdc5e7e0.pdf (AIAA 2012-3536, SAME-2)');
    const summarySame = same2Rows
      .map(
        (r) =>
          `${r.material} (${r.aging}): Dg=${r.dgUm} um, CountMean(M1/M0)=${r.countMeanUm} um, MassMean(M3/M0)=${r.massMeanUm} um, sigma_g=${r.sigmaG}`
      )
      .join('; ');
    sections.push(
      `FILE: 20130000422_bdc5e7e0.pdf (SAME-2 Reflight, Expedition 24, Urban et al. AIAA 2012-3536)
- Table 1 Diameter results (micrometers, um): ${summarySame}
- Key finding: Majority of average smoke particle sizes were 200–400 nm; aging (720 s) and zero-flow quiescent conditions produced substantially larger coagulated particles (zero-flow mass-mean diameter 30–40% larger; total 2–3x larger than 8 cm/s flow), motivating two-moment smoke detectors (MPASS) over single-moment ISS scattering or Shuttle ionization detectors.`
    );
  }

  if (state.saffire2Loaded && saffireRows.length > 0) {
    loadedFileNames.push('PSI-99_Experimental_table_SAFFIRE-2_3c24390b.csv + SAFFIRE-II_Operations_91e801d2.pdf');
    const summarySaffire = saffireRows
      .map(
        (r) =>
          `Sample ${r.sampleNumber}: Material=${r.material || '(blank in raw CSV)'}, Thickness=${r.thickness}, Flow=${r.airFlowCmPerS} (${r.flowDirection}), O2=${r.percentO2}%, BurnTime=${r.burnTimeS}, ?-g Burn=${r.microGBurnLength}, 1-g Spread=${r.oneGSpreadRate}`
      )
      .join('; ');
    sections.push(
      `FILE: PSI-99_Experimental_table_SAFFIRE-2_3c24390b.csv & SAFFIRE-II_Operations_91e801d2.pdf
- 9 sequential 5 cm x 29 cm (note: Operations PDF describes 5 x 25 cm nominal, CSV records 29 cm Sample Length) samples aboard unberthed Cygnus vehicle before destructive re-entry; Note 1 states Percent O2 derived from CO2 production referenced to ISS initial O2.
- Rows: ${summarySaffire}`
    );
  }

  if (state.psi62Loaded) {
    loadedFileNames.push('i_Investigation_fbbe3e34.txt (PSI-62 Investigation Metadata)');
    sections.push(
      `FILE: i_Investigation_fbbe3e34.txt (Study PSI-62, PI Paul DesJardin, DOI 10.60555/e9xp-ex83)
- Title: Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography.
- Metadata record describing Unsteady Flamelet Generated Manifold (UFGM) modeling of BASS/BASS-II PMMA & wax geometries and external two-color DSLR tomography; no raw assay CSV is attached inside this metadata text file.`
    );
  }

  if (state.uploadedCsv && state.uploadedCsv.rows.length > 0) {
    const csv = state.uploadedCsv;
    loadedFileNames.push(`${csv.fileName} (User Uploaded CSV)`);
    const preview = csv.rows
      .slice(0, 8)
      .map((row) => csv.headers.map((h) => `${h}=${row[h] ?? ''}`).join(', '))
      .join(' | ');
    sections.push(
      `--- BEGIN USER-UPLOADED CSV (unverified user tabular data, not a bundled NASA file) ---
FILE: ${csv.fileName} (${csv.rows.length} sanitized preview rows)
- Columns: ${csv.headers.join(', ')}
- Numeric columns detected: ${csv.numericColumns.join(', ') || 'None'}
- Soot column present: ${csv.hasSootColumn ? 'Yes' : 'No'}; Radiative column present: ${csv.hasRadiativeColumn ? 'Yes' : 'No'}
- Sample rows: ${preview}
--- END USER-UPLOADED CSV ---`
    );
  }

  return {
    hasLoadedFiles: loadedFileNames.length > 0,
    loadedFileNames,
    contextSummary: sections.join('\n\n'),
  };
}

/**
 * Trusted server-side grounding builder: builds grounding context strictly from
 * server-bundled NASA tables plus strictly sanitized optional CSV rows, ignoring
 * any arbitrary grounding prose sent by a browser client.
 */
export function buildServerGroundingContext(params: {
  activeSources: unknown;
  uploadedCsvRaw?: unknown;
  flexRows: FlexTestRecord[];
  bass2Rows: Bass2MillerRecord[];
  same2Rows: Same2AerosolRecord[];
  saffireRows: Saffire2CsvRow[];
}): GroundingContextResult {
  const flags = sanitizeActiveFlags(params.activeSources);
  const uploadedCsv = sanitizeUploadedCsvPayload(params.uploadedCsvRaw);

  return buildGroundingContext({
    state: {
      ...flags,
      uploadedCsv,
    },
    flexRows: params.flexRows,
    bass2Rows: params.bass2Rows,
    same2Rows: params.same2Rows,
    saffireRows: params.saffireRows,
  });
}
