import type {
  D2CurvePoint,
  FlexTestRecord,
  QualitativeFlameMetrics,
  SimulatorParams,
} from '../types/combustion';

export const MMHG_PER_ATM = 760;
export const KPA_PER_MMHG = 101.325 / 760;

export function mmHgToAtm(mmHg: number): number {
  return Number((mmHg / MMHG_PER_ATM).toFixed(3));
}

export function mmHgToKpa(mmHg: number): number {
  return Number((mmHg * KPA_PER_MMHG).toFixed(3));
}

export function atmToMmHg(atm: number): number {
  return Number((atm * MMHG_PER_ATM).toFixed(1));
}

/**
 * Reconstructs the linear d^2-law trajectory D^2(t) = D0^2 - K * t from
 * reported FLEX Table IX summary scalars (D0, K, burnTimeS).
 * Explicitly marked as a linear-constant reconstruction, not frame-by-frame camera tracking.
 */
export function computeD2RegressionSeries(
  record: FlexTestRecord,
  steps = 24
): {
  points: D2CurvePoint[];
  d0Squared: number | null;
  predictedFinalD2: number | null;
  reportedDextSquared: number | null;
} {
  if (
    record.d0Mm === null ||
    record.burningRateMm2PerS === null ||
    record.burnTimeS === null ||
    record.burnTimeS <= 0
  ) {
    return {
      points: [],
      d0Squared: record.d0Mm !== null ? Number((record.d0Mm ** 2).toFixed(3)) : null,
      predictedFinalD2: null,
      reportedDextSquared: record.dExtMm !== null ? Number((record.dExtMm ** 2).toFixed(3)) : null,
    };
  }

  const d0Squared = record.d0Mm ** 2;
  const k = record.burningRateMm2PerS;
  const totalTime = record.burnTimeS;
  const points: D2CurvePoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = Number(((totalTime * i) / steps).toFixed(2));
    const rawD2 = d0Squared - k * t;
    const clampedD2 = Math.max(0, rawD2);
    points.push({
      t,
      d2Mm2: Number(clampedD2.toFixed(3)),
      dMm: Number(Math.sqrt(clampedD2).toFixed(3)),
    });
    if (rawD2 <= 0) break;
  }

  const predictedFinalD2 = Number(Math.max(0, d0Squared - k * totalTime).toFixed(3));
  const reportedDextSquared =
    record.dExtMm !== null ? Number((record.dExtMm ** 2).toFixed(3)) : null;

  return {
    points,
    d0Squared: Number(d0Squared.toFixed(3)),
    predictedFinalD2,
    reportedDextSquared,
  };
}

/**
 * Computes illustrative qualitative flame characteristics for the 1g vs 0g simulator.
 * NOT a validated predictive CFD or kinetic model.
 */
export function computeQualitativeFlameState(
  params: SimulatorParams
): QualitativeFlameMetrics {
  const g = Math.max(0, Math.min(1, params.gravityG));
  const o2 = Math.max(13, Math.min(30, params.oxygenPct));
  const d0 = Math.max(0.5, Math.min(4.0, params.dropletDiameterMm));
  const p = Math.max(0.5, Math.min(3.05, params.pressureAtm));

  // Buoyancy distortion scales non-linearly as gravity rises from 0g to 1g
  const buoyancyPlumeRatio = Number(Math.pow(g, 0.55).toFixed(3));

  // Soot luminosity increases with oxygen enrichment, higher pressure, larger droplet, and buoyant residence/mixing
  const o2Factor = Math.max(0, (o2 - 13) / 17); // 0..1 over 13..30%
  const pFactor = Math.min(1, (p - 0.5) / 2.55); // 0..1
  const sizeFactor = (d0 - 0.5) / 3.5; // 0..1
  const sootRaw =
    0.10 +
    0.34 * buoyancyPlumeRatio +
    0.28 * o2Factor +
    0.22 * pFactor +
    0.12 * sizeFactor;
  const sootLuminosityIndex = Number(Math.max(0.05, Math.min(1, sootRaw)).toFixed(3));

  // Illustrative qualitative burning-rate scale: higher O2 and modest pressure raise reaction rate; 0g lacks convective enhancement
  const convectiveBoost = 1 + 0.35 * buoyancyPlumeRatio;
  const o2Boost = 0.65 + 0.85 * (o2 / 21);
  const pBoost = 0.82 + 0.22 * Math.sqrt(p);
  const qualitativeBurnRateScale = Number(
    (0.48 * convectiveBoost * o2Boost * pBoost).toFixed(2)
  );

  // Diffusion flames at 0g exhibit larger normalized flame standoff relative to droplet radius than buoyant flames
  const relativeFlameStandoff = Number(
    (3.8 - 1.35 * buoyancyPlumeRatio + 0.45 * o2Factor - 0.35 * pFactor).toFixed(2)
  );

  // Illustrative relative burn duration ~ D0^2 / K_qual
  const estimatedQualitativeLifetimeS = Number(
    ((d0 * d0) / Math.max(0.15, qualitativeBurnRateScale)).toFixed(1)
  );

  let regimeLabel = 'Spherical diffusion-controlled flame';
  if (g < 0.05 && o2 <= 17.5) {
    regimeLabel = 'Near-limit diffusion flame (high radiative loss sensitivity)';
  } else if (g >= 0.05 && g < 0.3) {
    regimeLabel = 'Partial-gravity transitional plume';
  } else if (g >= 0.3 && g < 0.7) {
    regimeLabel = 'Martian/sub-1g buoyant-convective plume';
  } else if (g >= 0.7) {
    regimeLabel = 'Buoyancy-dominated upward teardrop plume';
  }

  return {
    buoyancyPlumeRatio,
    sootLuminosityIndex,
    qualitativeBurnRateScale,
    relativeFlameStandoff,
    estimatedQualitativeLifetimeS,
    regimeLabel,
  };
}

/**
 * BASS-II Eq. (6.1) Goldilocks minimum O2 propagation boundary for thin/thick PMMA in 0g:
 * X_O2,boundary(a) = 6 * exp(-0.5 * a) + 0.0167 * a + 13.4 (% O2), where a is stretch rate (s^-1).
 */
export function computeGoldilocksBoundaryO2(stretchRatePerS: number): number {
  const clampedA = Math.max(0, Math.min(60, stretchRatePerS));
  return Number(
    (6 * Math.exp(-0.5 * clampedA) + 0.0167 * clampedA + 13.4).toFixed(2)
  );
}

export interface CabinScreeningEvaluation {
  oxygenPct: number;
  stretchRatePerS: number;
  boundaryO2Pct: number;
  deltaPct: number;
  isAbovePropagationBoundary: boolean;
}

/**
 * Compares a user-selected (O2 %, stretch rate s^-1) operating point against the
 * BASS-II Eq. (6.1) PMMA propagation boundary for educational data exploration only.
 */
export function evaluateCabinScreeningPoint(
  oxygenPct: number,
  stretchRatePerS: number
): CabinScreeningEvaluation {
  const clampedO2 = Number(Math.max(10, Math.min(35, oxygenPct)).toFixed(1));
  const clampedA = Number(Math.max(1, Math.min(50, stretchRatePerS)).toFixed(1));
  const boundaryO2Pct = computeGoldilocksBoundaryO2(clampedA);
  const deltaPct = Number((clampedO2 - boundaryO2Pct).toFixed(2));
  return {
    oxygenPct: clampedO2,
    stretchRatePerS: clampedA,
    boundaryO2Pct,
    deltaPct,
    isAbovePropagationBoundary: clampedO2 > boundaryO2Pct,
  };
}

const DISALLOWED_PEOPLE_TERMS = [
  'astronaut',
  'cosmonaut',
  'crew',
  'portrait',
  'headshot',
  'face',
  'faces',
  'person',
  'people',
  'human',
  'expedition commander',
  'flight engineer',
  'payload specialist',
  'mission specialist',
  'scientist poses',
  'smiling',
  'team photo',
  'group photo',
  'selfie',
  'hands',
  'arm',
  'operator',
  'staff',
  'visitor',
];

const REQUIRED_COMBUSTION_TERMS = [
  'flame',
  'combustion',
  'droplet',
  'saffire',
  'microgravity science glovebox',
  'combustion integrated rack',
  'flex',
  'burning and suppression',
  'fire',
  'soot',
  'ignition',
  'cool flame',
];

export interface RawNasaMetadataCheckInput {
  title?: string;
  description?: string;
  keywords?: string[];
  photographer?: string;
}

/**
 * Rejects any NASA media record whose metadata indicates people, crew, faces, or portraits,
 * and requires explicit combustion/hardware terms. Note: metadata alone is not visual proof,
 * so UI must still label metadata-filtered items appropriately and guard image loading.
 */
export function isVerifiedPeopleFreeMediaItem(input: RawNasaMetadataCheckInput): boolean {
  const combined = [
    input.title ?? '',
    input.description ?? '',
    input.photographer ?? '',
    ...(input.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase();

  if (!combined.trim()) return false;

  for (const banned of DISALLOWED_PEOPLE_TERMS) {
    const escaped = banned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(combined)) {
      return false;
    }
  }

  return REQUIRED_COMBUSTION_TERMS.some((term) => combined.includes(term));
}
