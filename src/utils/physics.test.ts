import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  atmToMmHg,
  computeD2RegressionSeries,
  computeGoldilocksBoundaryO2,
  computeQualitativeFlameState,
  evaluateCabinScreeningPoint,
  isVerifiedPeopleFreeMediaItem,
  mmHgToAtm,
  mmHgToKpa,
} from './physics';
import type { FlexTestRecord } from '../types/combustion';

describe('physics utilities & media safety filter', () => {
  it('converts mmHg to atm and kPa accurately', () => {
    assert.equal(mmHgToAtm(760), 1);
    assert.equal(mmHgToAtm(535.1), 0.704);
    assert.equal(mmHgToKpa(760), 101.325);
    assert.equal(atmToMmHg(1.0), 760);
  });

  it('reconstructs d^2 trajectory from FLEX Table IX parameters and stops at zero', () => {
    const sample: FlexTestRecord = {
      test: 'FLEX-034',
      identifier: '177F001',
      date: '11/27/09',
      gmt: '11:15:38',
      fuel: 'Methanol',
      pressureMmHg: 767.7,
      o2: 0.21,
      n2: 0.79,
      co2: 0,
      he: 0,
      d0Mm: 3.89,
      dExtMm: 2,
      burningRateMm2PerS: 0.44,
      burnTimeS: 27.3,
      testEnd: 'Extinction',
    };
    const res = computeD2RegressionSeries(sample, 10);
    assert.ok(res.points.length > 5);
    assert.equal(res.points[0].t, 0);
    assert.equal(res.d0Squared, 15.132);
    assert.equal(res.reportedDextSquared, 4);
    assert.ok(res.points[res.points.length - 1].d2Mm2 >= 0);
  });

  it('returns empty series when FLEX burning rate or diameter is missing', () => {
    const missing: FlexTestRecord = {
      test: 'FLEX-053',
      identifier: '209F002',
      date: '1/12/10',
      gmt: '16:29:37',
      fuel: 'Heptane',
      pressureMmHg: 770.2,
      o2: 0.21,
      n2: 0.79,
      co2: 0,
      he: 0,
      d0Mm: null,
      dExtMm: null,
      burningRateMm2PerS: null,
      burnTimeS: 18.5,
      testEnd: 'Disruption',
    };
    const res = computeD2RegressionSeries(missing);
    assert.equal(res.points.length, 0);
    assert.equal(res.d0Squared, null);
  });

  it('distinguishes 0g diffusion regime from 1g buoyant regime qualitatively', () => {
    const zeroG = computeQualitativeFlameState({
      gravityG: 0,
      oxygenPct: 21,
      dropletDiameterMm: 2.5,
      pressureAtm: 1.0,
    });
    const oneG = computeQualitativeFlameState({
      gravityG: 1,
      oxygenPct: 21,
      dropletDiameterMm: 2.5,
      pressureAtm: 1.0,
    });

    assert.equal(zeroG.buoyancyPlumeRatio, 0);
    assert.equal(oneG.buoyancyPlumeRatio, 1);
    assert.ok(zeroG.relativeFlameStandoff > oneG.relativeFlameStandoff);
    assert.ok(oneG.sootLuminosityIndex > zeroG.sootLuminosityIndex);
  });

  it('rejects NASA media metadata mentioning astronauts, crew, portraits, or people', () => {
    assert.equal(
      isVerifiedPeopleFreeMediaItem({
        title: 'Expedition 24 Astronaut inspects Combustion Integrated Rack',
        description: 'Crew member smiles beside MSG.',
        keywords: ['combustion', 'crew'],
      }),
      false
    );
    assert.equal(
      isVerifiedPeopleFreeMediaItem({
        title: 'Flight Engineer portrait near glovebox',
        description: 'Combustion hardware check.',
        keywords: ['combustion'],
      }),
      false
    );
    assert.equal(
      isVerifiedPeopleFreeMediaItem({
        title: 'Spherical Heptane Droplet Flame in FLEX Chamber',
        description: 'Color camera view of a diffusion-controlled microgravity droplet flame inside CIR.',
        keywords: ['FLEX', 'droplet', 'combustion', 'microgravity'],
      }),
      true
    );
    assert.equal(
      isVerifiedPeopleFreeMediaItem({
        title: 'Earth horizon from orbital altitude',
        description: 'Cloud formations over Pacific Ocean.',
        keywords: ['earth', 'orbit'],
      }),
      false
    );
  });

  it('supports 14.5% O2 near-limit dilution and Lunar 0.16g / 26.5% O2 mission presets', () => {
    const nearLimit = computeQualitativeFlameState({
      gravityG: 0,
      oxygenPct: 14.5,
      dropletDiameterMm: 2.5,
      pressureAtm: 1.0,
    });
    const issNominal = computeQualitativeFlameState({
      gravityG: 0,
      oxygenPct: 21.0,
      dropletDiameterMm: 2.5,
      pressureAtm: 1.0,
    });
    assert.match(nearLimit.regimeLabel, /Near-limit/i);
    assert.ok(nearLimit.qualitativeBurnRateScale < issNominal.qualitativeBurnRateScale);
    assert.ok(nearLimit.sootLuminosityIndex < issNominal.sootLuminosityIndex);
  });

  it('evaluates BASS-II Eq. (6.1) Goldilocks boundary screening points accurately', () => {
    // At a = 10 s^-1: 6*exp(-5) + 0.167 + 13.4 ≈ 13.61% O2
    const boundaryAt10 = computeGoldilocksBoundaryO2(10);
    assert.ok(boundaryAt10 > 13.5 && boundaryAt10 < 13.7);

    const above = evaluateCabinScreeningPoint(26.5, 10);
    assert.equal(above.isAbovePropagationBoundary, true);
    assert.ok(above.deltaPct > 12);

    const below = evaluateCabinScreeningPoint(13.0, 10);
    assert.equal(below.isAbovePropagationBoundary, false);
    assert.ok(below.deltaPct < 0);
  });
});
