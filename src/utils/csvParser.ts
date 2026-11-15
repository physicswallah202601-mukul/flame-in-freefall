import type { Saffire2CsvRow, UploadedCsvDataset } from '../types/combustion';

/**
 * Parses RFC-4180 CSV text cleanly without external dependencies.
 */
export function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

export function parseCsvText(rawText: string, fileName: string): UploadedCsvDataset {
  if (!rawText || rawText.includes('\u0000')) {
    return {
      fileName,
      headers: [],
      rows: [],
      notes: [],
      numericColumns: [],
      hasSootColumn: false,
      hasRadiativeColumn: false,
      loadedAtIso: new Date().toISOString(),
    };
  }

  const normalizedLines = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  if (normalizedLines.length === 0) {
    return {
      fileName,
      headers: [],
      rows: [],
      notes: [],
      numericColumns: [],
      hasSootColumn: false,
      hasRadiativeColumn: false,
      loadedAtIso: new Date().toISOString(),
    };
  }

  const rawHeaders = splitCsvLine(normalizedLines[0]).map((h, idx) =>
    h.trim() ? h.trim() : `Column_${idx + 1}`
  );

  const rows: Record<string, string>[] = [];
  const notes: string[] = [];

  for (let i = 1; i < normalizedLines.length; i++) {
    const cells = splitCsvLine(normalizedLines[i]);
    const nonEmptyCells = cells.filter((c) => c.length > 0);

    // Preserve NASA CSV footer notes/pre-test metadata rows rather than polluting tabular rows
    if (
      nonEmptyCells.length <= 2 &&
      cells[0] &&
      (/^(Note\s+\d+|F\d+C\d+)/i.test(cells[0]) || nonEmptyCells.length === 1)
    ) {
      notes.push(nonEmptyCells.join(' — '));
      continue;
    }

    const rowObj: Record<string, string> = {};
    rawHeaders.forEach((header, idx) => {
      rowObj[header] = cells[idx] ?? '';
    });
    rows.push(rowObj);
  }

  const numericColumns = rawHeaders.filter((header) => {
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

  const lowerHeaders = rawHeaders.map((h) => h.toLowerCase());
  const hasSootColumn = lowerHeaders.some((h) => h.includes('soot'));
  const hasRadiativeColumn = lowerHeaders.some(
    (h) => h.includes('radiat') || h.includes('heat_loss') || h.includes('heat loss') || h.includes('flux')
  );

  return {
    fileName,
    headers: rawHeaders,
    rows,
    notes,
    numericColumns,
    hasSootColumn,
    hasRadiativeColumn,
    loadedAtIso: new Date().toISOString(),
  };
}

/**
 * Maps the attached PSI-99 SAFFIRE-2 CSV text into typed Saffire2CsvRow objects,
 * preserving raw header provenance (including original "Samle Thickness" spelling in raw mode).
 */
export function parseSaffire2Csv(rawText: string): {
  rows: Saffire2CsvRow[];
  notes: string[];
} {
  const dataset = parseCsvText(rawText, 'PSI-99_Experimental_table_SAFFIRE-2_3c24390b.csv');
  const rows: Saffire2CsvRow[] = dataset.rows.map((r) => ({
    sampleNumber: r['Sample Number'] ?? '',
    material: r['Material'] ?? '',
    thickness: r['Samle Thickness'] ?? r['Sample Thickness'] ?? '',
    length: r['Sample Length'] ?? '',
    widthCm: r['Sample Width (cm)'] ?? '',
    airFlowCmPerS: r['Air Flow (cm/s)'] ?? '',
    percentO2: r['Percent O2 (Note 1)'] ?? '',
    ignitionPowerW: r['Ignition Power (W)'] ?? '',
    ignitionTimeS: r['Ignition Time (s)'] ?? '',
    burnTimeS: r['Burn Time (s)'] ?? '',
    flowDirection: r['Flow Direction'] ?? '',
    microGBurnLength: r['?-g Burn Length'] ?? '',
    microGSpreadLength: r['?-g Spread Length'] ?? '',
    oneGBurnLength: r['1-g Burn Length'] ?? '',
    oneGSpreadRate: r['1-g Spread Rate'] ?? '',
    camera1: r['Camera 1'] ?? '',
    camera2: r['Camera 2'] ?? '',
  }));

  return { rows, notes: dataset.notes };
}

export const SAMPLE_SOOT_RADIATIVE_FILENAME = 'sample_soot_radiative_demo.csv';

/**
 * Generates a small synthetic example CSV for testing the Soot & Radiative Loss
 * upload and plotting pipeline. Clearly non-NASA illustrative demo values.
 */
export function buildSampleSootRadiativeCsv(): string {
  const lines = [
    'time_s,soot_volume_fraction_ppm,radiative_heat_loss_w',
    '0,0.2,1.1',
    '2,1.4,3.8',
    '4,3.1,6.4',
    '6,4.5,8.2',
    '8,4.9,8.7',
    '10,4.2,7.5',
    '12,2.8,5.1',
    '14,1.1,2.4',
    '16,0.3,0.9',
  ];
  return `${lines.join('\n')}\n`;
}

