import type {
  Bass2MillerRecord,
  Same2AerosolRecord,
} from '../types/combustion';

export interface AttachedSourceManifestItem {
  id: 'flex' | 'bass2' | 'same2' | 'saffire2' | 'psi62';
  filename: string;
  experiment: string;
  reportId: string;
  rowCountLabel: string;
  keyColumns: string[];
  missingOrCaveat: string;
}

export const ATTACHED_SOURCE_MANIFEST: AttachedSourceManifestItem[] = [
  {
    id: 'flex',
    filename: '20150023456_b4f6ca98.pdf',
    experiment: 'Flame Extinguishment Experiment (FLEX)',
    reportId: 'NASA/TP—2015-216046 (Dietrich et al., Nov 2015)',
    rowCountLabel: '245 Table IX runs (FLEX-032 to FLEX-280)',
    keyColumns: [
      'Test',
      'Fuel',
      'Ambient pressure (mmHg)',
      'O2 / N2 / CO2 / He mole fractions',
      'D0 (mm)',
      'Dext (mm)',
      'Burning rate K (mm²/s)',
      'Burn time (s)',
      'Test end',
    ],
    missingOrCaveat:
      'Radiometers lacked sensitivity for quantitative radiative output (omitted); quantitative soot volume fraction is not tabulated in this report.',
  },
  {
    id: 'bass2',
    filename: 'TM-20210011385_5ffa911f.pdf',
    experiment: 'Burning and Suppression of Solids—II (BASS-II)',
    reportId: 'NASA/TM—20210011385 (Olson et al., Oct 2021)',
    rowCountLabel: '20 PMMA slab tests (Table 5.1: M1–M20)',
    keyColumns: [
      'Test no.',
      'Thickness (mm)',
      'Width (cm)',
      'Sides burning',
      'Velocity (cm/s)',
      'Spread rate (mm/s)',
      'Burn time (min)',
      'Initial/Final O2 (vol%)',
    ],
    missingOrCaveat:
      'MSG duct radiometer was uncalibrated (relative intensity only for extinction/oscillation timing, not calibrated W/m² radiative heat loss).',
  },
  {
    id: 'same2',
    filename: '20130000422_bdc5e7e0.pdf',
    experiment: 'Smoke Aerosol Measurement Experiment-2 (SAME-2)',
    reportId: 'AIAA 2012-3536 (Urban et al., Expedition 24)',
    rowCountLabel: '10 baseline/aged material runs (Table 1)',
    keyColumns: [
      'Material',
      'Aging',
      'Dg (µm)',
      'Count Mean M1/M0 (µm)',
      'Mass Mean M3/M0 (µm)',
      'σg',
    ],
    missingOrCaveat:
      'Sub-ignition pyrolysis aerosol measurements (not flaming droplet soot); silicone & DBP evaporated prior to TEM imaging.',
  },
  {
    id: 'saffire2',
    filename: 'PSI-99_Experimental_table_SAFFIRE-2_3c24390b.csv',
    experiment: 'Spacecraft Fire Experiment-II (SAFFIRE-II)',
    reportId: 'PSI-99 + SAFFIRE-II_Operations_91e801d2.pdf',
    rowCountLabel: '9 Cygnus samples (2-1 to 2-9)',
    keyColumns: [
      'Sample Number',
      'Material',
      'Samle Thickness',
      'Air Flow (cm/s)',
      'Percent O2 (Note 1)',
      'Burn Time (s)',
      '?-g Burn Length',
      '1-g Spread Rate',
    ],
    missingOrCaveat:
      'Raw CSV includes blank Material cells on 2-6 and 2-9 and header typo "Samle Thickness" preserved faithfully; Percent O2 derived from CO2 production.',
  },
  {
    id: 'psi62',
    filename: 'i_Investigation_fbbe3e34.txt',
    experiment: 'PSI-62 Concurrent Flame Spread Modeling (UFGM)',
    reportId: 'DOI 10.60555/e9xp-ex83 (PI Paul DesJardin)',
    rowCountLabel: 'Investigation metadata & 4 DOIs',
    keyColumns: ['Study Identifier', 'Approach', 'Hypothesis', 'Publications'],
    missingOrCaveat:
      'Study metadata record only; no raw two-color tomography CSV assay table is attached in this file.',
  },
];

// Verbatim from TM-20210011385_5ffa911f.pdf, Table 5.1 (Miller & Wichman, p. 56)
export const BASS2_TABLE_5_1: Bass2MillerRecord[] = [
  { testNo: 'M1', thicknessMm: 1, widthCm: 2.2, sidesBurning: 1, velocityCmPerS: '9', spreadRateMmPerS: '0.071', primarySpreadRateMmPerS: 0.071, burnTimeMin: 6.4, initialO2Pct: 22.2, finalO2Pct: 21.9 },
  { testNo: 'M2', thicknessMm: 3, widthCm: 2.2, sidesBurning: 1, velocityCmPerS: '20 and 15', spreadRateMmPerS: '0.052 and 0.033', primarySpreadRateMmPerS: 0.052, burnTimeMin: 22.9, initialO2Pct: 22.2, finalO2Pct: 21.2 },
  { testNo: 'M3', thicknessMm: 5, widthCm: 2.2, sidesBurning: 1, velocityCmPerS: '10 and 20', spreadRateMmPerS: '0.029 and 0.024', primarySpreadRateMmPerS: 0.029, burnTimeMin: 20.1, initialO2Pct: 20.8, finalO2Pct: 19.7 },
  { testNo: 'M4', thicknessMm: 5, widthCm: 2.2, sidesBurning: 2, velocityCmPerS: '5 and 3', spreadRateMmPerS: '0.045 and 0.033', primarySpreadRateMmPerS: 0.045, burnTimeMin: 19.8, initialO2Pct: 21.8, finalO2Pct: 19.8 },
  { testNo: 'M5', thicknessMm: 3, widthCm: 2.2, sidesBurning: 2, velocityCmPerS: '10', spreadRateMmPerS: '0.071', primarySpreadRateMmPerS: 0.071, burnTimeMin: 27.2, initialO2Pct: 22.2, finalO2Pct: 19.0 },
  { testNo: 'M6', thicknessMm: 1, widthCm: 2.2, sidesBurning: 2, velocityCmPerS: '10 and 8', spreadRateMmPerS: 'Not tracked', primarySpreadRateMmPerS: null, burnTimeMin: 16.8, initialO2Pct: 21.8, finalO2Pct: 20.7 },
  { testNo: 'M7', thicknessMm: 1, widthCm: 1.2, sidesBurning: 2, velocityCmPerS: '10, 6, 5, and 3', spreadRateMmPerS: '0.106, 0.099, 0.083, and 0.07', primarySpreadRateMmPerS: 0.106, burnTimeMin: 18.4, initialO2Pct: 18.9, finalO2Pct: 18.4 },
  { testNo: 'M8', thicknessMm: 2, widthCm: 1.2, sidesBurning: 2, velocityCmPerS: '10, 6, and 5', spreadRateMmPerS: '0.057, 0.056, and 0.04', primarySpreadRateMmPerS: 0.057, burnTimeMin: 25.2, initialO2Pct: 19.1, finalO2Pct: 18.2 },
  { testNo: 'M9', thicknessMm: 3, widthCm: 1.2, sidesBurning: 2, velocityCmPerS: '14', spreadRateMmPerS: '0.025', primarySpreadRateMmPerS: 0.025, burnTimeMin: 16.8, initialO2Pct: 18.0, finalO2Pct: 17.6 },
  { testNo: 'M10', thicknessMm: 4, widthCm: 1.2, sidesBurning: 2, velocityCmPerS: '15 and 10', spreadRateMmPerS: '0.0373 and 0.03', primarySpreadRateMmPerS: 0.0373, burnTimeMin: 30.5, initialO2Pct: 20.1, finalO2Pct: 18.6 },
  { testNo: 'M11', thicknessMm: 5, widthCm: 1.2, sidesBurning: 2, velocityCmPerS: '21, 15, and 13', spreadRateMmPerS: '0.048, 0.028, and 0.022', primarySpreadRateMmPerS: 0.048, burnTimeMin: 28.5, initialO2Pct: 20.0, finalO2Pct: 18.5 },
  { testNo: 'M12', thicknessMm: 2, widthCm: 2.2, sidesBurning: 2, velocityCmPerS: '12 and 10', spreadRateMmPerS: 'Not tracked', primarySpreadRateMmPerS: null, burnTimeMin: 16.2, initialO2Pct: 21.7, finalO2Pct: 20.4 },
  { testNo: 'M13', thicknessMm: 4, widthCm: 2.2, sidesBurning: 2, velocityCmPerS: '6, 5, and 4', spreadRateMmPerS: '0.047, 0.035, and 0.033', primarySpreadRateMmPerS: 0.047, burnTimeMin: 20.5, initialO2Pct: 20.8, finalO2Pct: 19.0 },
  { testNo: 'M14', thicknessMm: 2, widthCm: 2.2, sidesBurning: 1, velocityCmPerS: '15, 14, and 10', spreadRateMmPerS: '0.0624, 0.055, and 0.0353', primarySpreadRateMmPerS: 0.0624, burnTimeMin: 15.4, initialO2Pct: 22.2, finalO2Pct: 21.6 },
  { testNo: 'M15', thicknessMm: 4, widthCm: 2.2, sidesBurning: 1, velocityCmPerS: '20', spreadRateMmPerS: '0.045', primarySpreadRateMmPerS: 0.045, burnTimeMin: 22.0, initialO2Pct: 21.0, finalO2Pct: 20.0 },
  { testNo: 'M16', thicknessMm: 1, widthCm: 2.2, sidesBurning: 2, velocityCmPerS: '5, 3, and 2', spreadRateMmPerS: '0.144, 0.1309, and 0.1062', primarySpreadRateMmPerS: 0.144, burnTimeMin: 8.4, initialO2Pct: 19.2, finalO2Pct: 18.7 },
  { testNo: 'M17', thicknessMm: 2, widthCm: 2.2, sidesBurning: 2, velocityCmPerS: '5, 4, and 3', spreadRateMmPerS: '0.053, 0.042, and 0.026', primarySpreadRateMmPerS: 0.053, burnTimeMin: 30.7, initialO2Pct: 18.8, finalO2Pct: 17.1 },
  { testNo: 'M18', thicknessMm: 3, widthCm: 2.2, sidesBurning: 2, velocityCmPerS: '10 and 8', spreadRateMmPerS: '0.026 and 0.013', primarySpreadRateMmPerS: 0.026, burnTimeMin: 25.5, initialO2Pct: 17.9, finalO2Pct: 16.8 },
  { testNo: 'M19', thicknessMm: 4, widthCm: 2.2, sidesBurning: 2, velocityCmPerS: '10 and 6', spreadRateMmPerS: '0.027 and 0.0159', primarySpreadRateMmPerS: 0.027, burnTimeMin: 25.7, initialO2Pct: 19.0, finalO2Pct: 17.4 },
  { testNo: 'M20', thicknessMm: 5, widthCm: 2.2, sidesBurning: 2, velocityCmPerS: '10', spreadRateMmPerS: '0.012', primarySpreadRateMmPerS: 0.012, burnTimeMin: 16.5, initialO2Pct: 18.0, finalO2Pct: 17.4 },
];

// Verbatim from 20130000422_bdc5e7e0.pdf, Table 1 (Urban et al., AIAA 2012-3536, p. 7)
export const SAME2_TABLE_1: Same2AerosolRecord[] = [
  { material: 'Kapton', aging: 'Unaged', dgUm: 0.042, countMeanUm: 0.056, massMeanUm: 0.101, sigmaG: 2.154 },
  { material: 'Kapton', aging: 'Aged 720 s', dgUm: 0.089, countMeanUm: 0.109, massMeanUm: 0.161, sigmaG: 1.872 },
  { material: 'Lampwick', aging: 'Unaged', dgUm: 0.090, countMeanUm: 0.128, massMeanUm: 0.258, sigmaG: 2.312 },
  { material: 'Lampwick', aging: 'Aged 720 s', dgUm: 0.229, countMeanUm: 0.276, massMeanUm: 0.398, sigmaG: 1.834 },
  { material: 'Silicone', aging: 'Unaged', dgUm: 0.128, countMeanUm: 0.196, massMeanUm: 0.465, sigmaG: 2.530 },
  { material: 'Silicone', aging: 'Aged 720 s', dgUm: 0.269, countMeanUm: 0.355, massMeanUm: 0.619, sigmaG: 2.108 },
  { material: 'Teflon', aging: 'Unaged', dgUm: 0.081, countMeanUm: 0.101, massMeanUm: 0.170, sigmaG: 2.198 },
  { material: 'Teflon', aging: 'Aged 720 s', dgUm: 0.070, countMeanUm: 0.105, massMeanUm: 0.232, sigmaG: 2.442 },
  { material: 'Pyrell', aging: 'Unaged', dgUm: 0.149, countMeanUm: 0.204, massMeanUm: 0.384, sigmaG: 2.211 },
  { material: 'Pyrell', aging: 'Aged 720 s', dgUm: 0.293, countMeanUm: 0.359, massMeanUm: 0.539, sigmaG: 1.892 },
];

// Bundled verbatim fallback copy of /assets/aistudio/PSI-99_Experimental_table_SAFFIRE-2_3c24390b.csv
// (App fetches the runtime CSV asset first, falling back to this identical verbatim string offline.)
export const SAFFIRE2_CSV_VERBATIM = `Sample Number,Material,Samle Thickness ,Sample Length ,Sample Width (cm),Air Flow (cm/s),Percent O2 (Note 1),Ignition Power (W),Ignition Time (s),Burn Time (s),Flow Direction,?-g Burn Length,?-g Spread Length,1-g Burn Length,1-g Spread Rate,Camera 1,Camera 2
2-1,Silicone,0.27 mm,29 cm,5 cm,20 cm/s,~ 21.5,80 W,9.2 s,Insignificant,Concurrent,~ 0,n/a,Complete,Acceleratory,S1C1,S1C2
2-2,Silicone,0.61 mm,29 cm,5 cm,20 cm/s,~ 22.1,80 W,9.2 s,Insignificant,Concurrent,~ 0,n/a,7.6 cm,1.2 mm/s,n/a,S2C2
2-3,Silicone,1.03 mm,29 cm,5 cm,20 cm/s,~ 22.1,80 W,9.2 s,Insignificant,Concurrent,~ 0,n/a,~ 0,n/a,,S3C2
2-4,Silicone,037 mm,29 cm,5 cm,20 cm/s,~ 22.1,80 W,9.2 s,Insignificant,Opposed,~ 0,n/a,Complete,0.6 mm/s,S4C1,S4C1
2-5,Cotton-Fiberglass (SIBAL),037 mm,29 cm,5 cm,20 cm/s,~ 22.1,80 W,9.2 s,145 s,Concurrent,29 cm,2.1 mm/s,Complete,Acceleratory,S5C1,S5C2
2-6,,037 mm,29 cm,5 cm,20 cm/s,~ 22.1,80 W,9.2 s,115 s,Concurrent,29 cm,2.6 mm/s,Complete,Acceleratory,S6C1,S56C2
2-7,PMMA & Nomex,0.85 and 0.37 mm,5 and 24 cm,5 cm,20 cm/s,~ 22.1,80 W,9.2 s,140 s,Concurrent,5 cm & 0 (note 2),n/a (Nomex),~ 0 (Nomex),n/a (Nomex),S7C1,n/a
2-8,PMMA,See Fig. 5,29 cm,5 cm,20 cm/s,22.1 to 22.0,97 W,30 s,600 s,Concurrent,~ 10 cm (note 3),Note 4,Complete,Acceleratory,S8C1,n/a
2-9,,1 cm,29 cm,5 cm,20 cm/s,22.0 to 21.9,97 W,30 s,900 s,Concurrent,~ 10 cm (note 4),Note 4,Complete,Acceleratory,S9C1,n/a
F1C1/F1C2,Pre-test flow visulation data for sample 2-1,,,,,,,,,,,,,,,
F2C1/F2C2,Pre-test flow visulation data for sample 2-2,,,,,,,,,,,,,,,
Note 1 Derived from measured CO2 production and referenced to initial O2 concentration reported by ISS.,,,,,,,,,,,,,,,,
Note 2 The PMMA portion was completely consumed but the Nomex was not ignited.,,,,,,,,,,,,,,,,
Note 3 This is the length of fuel with significant visible damage.,,,,,,,,,,,,,,,,
Note 4 The flames remain anchored at the base of the sample which has a very slow regression rate (0.01 to 0.04 mm/s),,,,,,,,,,,,,,,,`;

export const BASS2_GOLDILOCKS_BOUNDARY_POINTS = Array.from({ length: 24 }, (_, idx) => {
  const stretchA = idx === 0 ? 1 : idx * 2.5;
  const minO2Pct = Number(
    (6 * Math.exp(-0.5 * stretchA) + 0.0167 * stretchA + 13.4).toFixed(2)
  );
  return {
    stretchRatePerS: stretchA,
    minO2Pct,
    normalGravityLimitPct: 15.4,
  };
});
