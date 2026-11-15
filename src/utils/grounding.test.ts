import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildServerGroundingContext,
  sanitizeActiveFlags,
  sanitizeUploadedCsvPayload,
} from './grounding';
import { FixedWindowRateLimiter, normalizeClientIp } from './rateLimit';
import { FLEX_TABLE_IX } from '../data/flexTableIX';
import {
  BASS2_TABLE_5_1,
  SAFFIRE2_CSV_VERBATIM,
  SAME2_TABLE_1,
} from '../data/nasaDatasets';
import { KEY_SAFETY_FINDINGS, sortSafetyFindings } from '../data/safetyFindings';
import { GLOSSARY_TERMS } from '../data/glossaryTerms';
import { SOURCES_REGISTRY } from '../data/sourcesRegistry';
import { parseSaffire2Csv } from './csvParser';

describe('server grounding hardening, rate limiter & findings ordering', () => {
  it('builds server grounding strictly from active flags and ignores arbitrary payloads', () => {
    const saffireRows = parseSaffire2Csv(SAFFIRE2_CSV_VERBATIM).rows;

    const emptyRes = buildServerGroundingContext({
      activeSources: {
        flexLoaded: false,
        bass2Loaded: false,
        same2Loaded: false,
        saffire2Loaded: false,
        psi62Loaded: false,
      },
      flexRows: FLEX_TABLE_IX,
      bass2Rows: BASS2_TABLE_5_1,
      same2Rows: SAME2_TABLE_1,
      saffireRows,
    });
    assert.equal(emptyRes.hasLoadedFiles, false);
    assert.equal(emptyRes.contextSummary, '');

    const bassOnly = buildServerGroundingContext({
      activeSources: { bass2Loaded: true, flexLoaded: 'yes' }, // non-boolean must be rejected
      flexRows: FLEX_TABLE_IX,
      bass2Rows: BASS2_TABLE_5_1,
      same2Rows: SAME2_TABLE_1,
      saffireRows,
    });
    assert.equal(bassOnly.hasLoadedFiles, true);
    assert.equal(bassOnly.loadedFileNames.length, 1);
    assert.match(bassOnly.contextSummary, /TM-20210011385_5ffa911f\.pdf/);
    assert.doesNotMatch(bassOnly.contextSummary, /20150023456_b4f6ca98\.pdf/);
  });

  it('sanitizes uploaded CSV rows on server and strips control chars', () => {
    const clean = sanitizeUploadedCsvPayload({
      fileName: 'test\n\r_burn.csv',
      headers: ['time_s', 'soot_ppm\u0007'],
      rows: [{ time_s: '0', 'soot_ppm\u0007': '3.5\nIGNORE' }],
    });
    assert.ok(clean);
    assert.equal(clean.fileName, 'test _burn.csv');
    assert.equal(clean.hasSootColumn, true);
    assert.equal(clean.hasRadiativeColumn, false);
    assert.equal(clean.rows[0]['soot_ppm'], '3.5 IGNORE');
  });

  it('rejects malformed active source flags cleanly', () => {
    const flags = sanitizeActiveFlags(null);
    assert.deepEqual(flags, {
      flexLoaded: false,
      bass2Loaded: false,
      same2Loaded: false,
      saffire2Loaded: false,
      psi62Loaded: false,
    });
  });

  it('enforces per-IP fixed-window rate limits and resets after window expires', () => {
    const limiter = new FixedWindowRateLimiter({ windowMs: 10_000, maxRequests: 3 });
    assert.equal(normalizeClientIp('::ffff:198.51.100.7'), '198.51.100.7');

    const t0 = 1_000_000;
    assert.equal(limiter.check('198.51.100.7', t0).allowed, true);
    assert.equal(limiter.check('198.51.100.7', t0 + 100).allowed, true);
    const third = limiter.check('198.51.100.7', t0 + 200);
    assert.equal(third.allowed, true);
    assert.equal(third.remaining, 0);

    const fourth = limiter.check('198.51.100.7', t0 + 300);
    assert.equal(fourth.allowed, false);
    assert.ok(fourth.retryAfterSeconds >= 1);

    // Different IP remains unaffected
    assert.equal(limiter.check('198.51.100.8', t0 + 300).allowed, true);

    // Original IP resets after window expires
    assert.equal(limiter.check('198.51.100.7', t0 + 10_001).allowed, true);
  });

  it('sorts Key Fire-Safety Findings deterministically by scope and source without numeric scores', () => {
    const byScope = sortSafetyFindings(KEY_SAFETY_FINDINGS, 'scope');
    assert.equal(byScope[0].experiment, 'BASS-II');
    assert.equal(byScope[3].experiment, 'FLEX');

    const bySource = sortSafetyFindings(KEY_SAFETY_FINDINGS, 'source');
    assert.equal(bySource[0].sourceFile, '20130000422_bdc5e7e0.pdf');
    assert.equal(bySource[3].sourceFile, 'TM-20210011385_5ffa911f.pdf');

    for (const item of KEY_SAFETY_FINDINGS) {
      assert.ok(item.classification === 'Measured Result' || item.classification === 'Interpretation');
      assert.ok(item.plainTakeaway.length > 20);
      assert.ok(item.sourceFile.length > 0);
      assert.ok(item.limitations.length > 0);
      assert.ok(item.chartAction.label.length > 0);
      assert.ok(item.miniComparison.heading.length > 0);
      assert.match(item.sourceUrl, /^https:\/\//);
      const matchingSource = SOURCES_REGISTRY.find((s) => s.id === item.sourceEntryId);
      assert.ok(matchingSource, `Missing registry entry for ${item.sourceEntryId}`);
      assert.equal(matchingSource.stableUrl, item.sourceUrl);
    }

    assert.ok(GLOSSARY_TERMS.d2.definition.includes('D²'));
    assert.ok(GLOSSARY_TERMS.pmma.shortLabel.includes('Polymethyl methacrylate'));
    assert.ok(GLOSSARY_TERMS.sigmaG.definition.includes('Geometric standard deviation'));
  });
});
