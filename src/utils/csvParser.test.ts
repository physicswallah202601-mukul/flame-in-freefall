import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSampleSootRadiativeCsv,
  parseCsvText,
  parseSaffire2Csv,
  SAMPLE_SOOT_RADIATIVE_FILENAME,
} from './csvParser';
import { SAFFIRE2_CSV_VERBATIM } from '../data/nasaDatasets';
import { buildGroundingContext, countLoadedSources } from './grounding';
import { BASS2_TABLE_5_1, SAME2_TABLE_1 } from '../data/nasaDatasets';
import { FLEX_TABLE_IX } from '../data/flexTableIX';

describe('CSV parser & grounding provenance', () => {
  it('parses attached SAFFIRE-2 CSV and preserves footnote metadata separately', () => {
    const parsed = parseSaffire2Csv(SAFFIRE2_CSV_VERBATIM);
    assert.equal(parsed.rows.length, 9);
    assert.equal(parsed.rows[0].sampleNumber, '2-1');
    assert.equal(parsed.rows[0].material, 'Silicone');
    assert.equal(parsed.rows[5].material, ''); // blank in raw CSV preserved
    assert.ok(parsed.notes.length >= 4);
  });

  it('detects soot and radiative heat loss columns only when present in uploaded CSV', () => {
    const custom = `time_s,soot_volume_fraction_ppm,radiative_heat_loss_w\n0,1.2,4.5\n5,2.4,6.1\n`;
    const ds = parseCsvText(custom, 'custom_burn.csv');
    assert.equal(ds.rows.length, 2);
    assert.equal(ds.hasSootColumn, true);
    assert.equal(ds.hasRadiativeColumn, true);
    assert.deepEqual(ds.numericColumns, ['time_s', 'soot_volume_fraction_ppm', 'radiative_heat_loss_w']);
  });

  it('reports ungrounded state cleanly when zero datasets are loaded', () => {
    const emptyState = {
      flexLoaded: false,
      bass2Loaded: false,
      same2Loaded: false,
      saffire2Loaded: false,
      psi62Loaded: false,
      uploadedCsv: null,
    };
    assert.equal(countLoadedSources(emptyState), 0);
    const ctx = buildGroundingContext({
      state: emptyState,
      flexRows: FLEX_TABLE_IX,
      bass2Rows: BASS2_TABLE_5_1,
      same2Rows: SAME2_TABLE_1,
      saffireRows: [],
    });
    assert.equal(ctx.hasLoadedFiles, false);
    assert.equal(ctx.loadedFileNames.length, 0);
  });

  it('generates a synthetic sample CSV that parses with soot and radiative columns', () => {
    const csv = buildSampleSootRadiativeCsv();
    const parsed = parseCsvText(csv, SAMPLE_SOOT_RADIATIVE_FILENAME);
    assert.equal(parsed.fileName, 'sample_soot_radiative_demo.csv');
    assert.equal(parsed.hasSootColumn, true);
    assert.equal(parsed.hasRadiativeColumn, true);
    assert.deepEqual(parsed.numericColumns, [
      'time_s',
      'soot_volume_fraction_ppm',
      'radiative_heat_loss_w',
    ]);
    assert.ok(parsed.rows.length >= 5);
  });

  it('handles malformed quotes, header-only files, and binary NUL inputs without crashing', () => {
    const binary = parseCsvText('\u0000\u0001\u0002PNG', 'corrupt.csv');
    assert.equal(binary.headers.length, 0);
    assert.equal(binary.rows.length, 0);

    const headerOnly = parseCsvText('time_s,soot_ppm\n', 'header_only.csv');
    assert.equal(headerOnly.headers.length, 2);
    assert.equal(headerOnly.rows.length, 0);

    const unmatchedQuote = parseCsvText('colA,colB\n"unterminated,42\n', 'bad_quote.csv');
    assert.equal(unmatchedQuote.headers.length, 2);
    assert.equal(unmatchedQuote.rows.length, 0);
    assert.equal(unmatchedQuote.notes.length, 1);

    const twoColUnmatched = parseCsvText('colA,colB\n1,"unterminated\n', 'bad_quote2.csv');
    assert.equal(twoColUnmatched.headers.length, 2);
    assert.equal(twoColUnmatched.rows.length, 1);
  });
});
