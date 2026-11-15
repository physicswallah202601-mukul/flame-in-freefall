import type { FindingsSortMode, SafetyFindingItem } from '../types/combustion';

export const FINDINGS_ORDERING_METHOD_TEXT =
  'Deterministic ordering by spacecraft fire-safety lifecycle stage—(1) atmospheric oxygen & flow ignition thresholds, (2) pre-fire smoke detection sensitivity, (3) material spread vs. self-extinguishment, (4) isolated liquid extinction physics—or alphabetically by source file. No numerical scores are invented, and this list is not an official safety assessment.';

export const KEY_SAFETY_FINDINGS: SafetyFindingItem[] = [
  {
    id: 'bass2-goldilocks',
    title: 'Low-Stretch Ventilation Extends Solid Flammability Below 1g Limits',
    experiment: 'BASS-II',
    classification: 'Measured Result',
    sourceFile: 'TM-20210011385_5ffa911f.pdf',
    sourceTableOrSection: 'Sec. 6 (Eq. 6.1, Fig. 6.9–6.10) & Table 5.1',
    sourceEntryId: 'dataset-bass2',
    sourceUrl: 'https://ntrs.nasa.gov/citations/20210011385',
    plainTakeaway:
      'Gentle spacecraft cabin airflow can keep solid plastics like clear acrylic burning at lower oxygen levels (~13.5% O₂) than an upward Earth-gravity fire can sustain (15.4% O₂).',
    summary:
      'Clear cast PMMA rods and slabs aboard ISS burned down to ~13.5% O₂ at flow stretch rates a = 8–12 s⁻¹ (spacecraft ventilation range), below the 15.4% O₂ normal-gravity upward flammability limit.',
    limitations:
      'Tested on PMMA samples inside the 255 L MSG duct; flow-duct radiometer was uncalibrated (relative intensity only); extinction boundary uncertainty increases below 1 cm/s.',
    scopeRank: 1,
    scopeCriterion: 'Stage 1 · Atmospheric O₂ & ventilation ignition threshold',
    chartAction: {
      label: 'Open Goldilocks Boundary Chart & Table 5.1',
      tab: 'bass_same',
      table: 'bass2',
    },
    miniComparison: {
      heading: 'Minimum O₂ Required to Sustain PMMA Burning',
      leftLabel: '0g Spacecraft Ventilation (a = 8–12 s⁻¹)',
      leftValue: '13.5% O₂',
      leftWidthPct: 68,
      rightLabel: '1g Earth Upward Limit',
      rightValue: '15.4% O₂',
      rightWidthPct: 77,
      caption: 'Measured BASS-II Sec. 6 (Eq. 6.1) limit vs. 1g upward threshold.',
    },
  },
  {
    id: 'same2-coagulation',
    title: 'Smoke Aging and Quiescent Flow Shift Particle Size 2–3× Larger',
    experiment: 'SAME-2',
    classification: 'Measured Result',
    sourceFile: '20130000422_bdc5e7e0.pdf',
    sourceTableOrSection: 'Table 1 & Sec. II.C',
    sourceEntryId: 'dataset-same2',
    sourceUrl: 'https://doi.org/10.2514/6.2012-3536',
    plainTakeaway:
      'In weightlessness, smoke particles from overheated wires and polymers clump together over 12 minutes into particles 2–3× wider—meaning a single-type smoke alarm tuned to Earth fires can miss them.',
    summary:
      'Overheated spacecraft wire/polymer smokes averaged 200–400 nm initially, while 720 s aging and zero-flow quiescent conditions produced 30–40% larger mass-mean diameters at zero flow (2–3× overall), exposing blind spots in single-moment smoke detectors.',
    limitations:
      'Measured sub-ignition pyrolysis aerosols rather than flaming soot; Silicone and DBP liquid droplets evaporated before TEM imaging; log-normal Dg and σg use fitted distribution assumptions.',
    scopeRank: 2,
    scopeCriterion: 'Stage 2 · Pre-fire aerosol detection sensitivity',
    chartAction: {
      label: 'Open SAME-2 Smoke Diameter Chart & Table 1',
      tab: 'bass_same',
      table: 'same2',
    },
    miniComparison: {
      heading: 'SAME-2 Mass-Mean Smoke Diameter Shift (Lampwick, Table 1)',
      leftLabel: 'Unaged Smoke (M₃/M₀)',
      leftValue: '0.258 µm',
      leftWidthPct: 48,
      rightLabel: 'Aged 720 s Smoke (M₃/M₀)',
      rightValue: '0.398 µm',
      rightWidthPct: 74,
      caption: 'All 5 tested spacecraft materials grew larger after 720 s aging (Table 1).',
    },
  },
  {
    id: 'saffire2-materials',
    title: 'Concurrent 20 cm/s Flow Splits Self-Extinguishing vs. Propagating Materials',
    experiment: 'SAFFIRE-II',
    classification: 'Measured Result',
    sourceFile: 'PSI-99_Experimental_table_SAFFIRE-2_3c24390b.csv',
    sourceTableOrSection: 'Samples 2-1 to 2-9 & Note 1–4',
    sourceEntryId: 'dataset-saffire2',
    sourceUrl: 'https://psi.nasa.gov/',
    plainTakeaway:
      'Inside the Cygnus spacecraft duct at 20 cm/s airflow, silicone sheets and Nomex stopped burning on their own, while cotton-fiberglass cloth and thick acrylic burned steadily.',
    summary:
      'Aboard Cygnus at 20 cm/s airflow (~21.5–22.1% O₂), 0.27–1.03 mm Silicone samples self-extinguished (~0 burn length), while Cotton-Fiberglass SIBAL burned 29 cm (2.1–2.6 mm/s) and thick PMMA sustained 600–900 s burns while Nomex did not ignite.',
    limitations:
      'Percent O₂ was derived from CO₂ production referenced to ISS initial O₂ (Note 1); raw CSV leaves Material blank on rows 2-6 and 2-9; Cygnus hardware re-entered destructively under a 20 Gb telemetry cap.',
    scopeRank: 3,
    scopeCriterion: 'Stage 3 · Material-level flame spread vs. self-extinguishment',
    chartAction: {
      label: 'Open SAFFIRE-II Cygnus Samples Table',
      tab: 'bass_same',
      table: 'saffire2',
    },
    miniComparison: {
      heading: 'Measured ?-g Burn Length at 20 cm/s Airflow (SAFFIRE-II CSV)',
      leftLabel: 'Silicone (0.27–1.03 mm)',
      leftValue: '~0 cm (Self-extinguished)',
      leftWidthPct: 8,
      rightLabel: 'Cotton-Fiberglass SIBAL (Sample 2-1)',
      rightValue: '29 cm',
      rightWidthPct: 88,
      caption: 'Measured Cygnus cargo-bay burns across Samples 2-1 to 2-9.',
    },
  },
  {
    id: 'flex-extinction',
    title: 'Radiative vs. Diffusive Extinction Regimes in Spherical Droplet Combustion',
    experiment: 'FLEX',
    classification: 'Interpretation',
    sourceFile: '20150023456_b4f6ca98.pdf',
    sourceTableOrSection: 'Table IX (FLEX-032 to FLEX-280) & Sec. 1.0',
    sourceEntryId: 'dataset-flex',
    sourceUrl: 'https://ntrs.nasa.gov/citations/20150023456',
    plainTakeaway:
      'In space, fuel droplets burn as quiet spheres instead of tall flames—and large droplets can go out early because they lose heat by thermal radiation, even when oxygen is still present.',
    summary:
      'Synthesizing 245 Table IX runs with Sec. 1.0 text shows 2–5 mm methanol and heptane droplets burned symmetrically at lower limiting oxygen indices than 1g predictions, terminating by radiative extinction at high dilution or diffusive extinction at low dilution.',
    limitations:
      'Quantitative soot volume fraction is not tabulated and CIR radiometers lacked sensitivity for quantitative radiative heat loss; Table IX provides test-averaged K rather than time-resolved trajectories; liquid droplets differ from solid cabin polymers.',
    scopeRank: 4,
    scopeCriterion: 'Stage 4 · Isolated liquid-fuel extinction regimes',
    chartAction: {
      label: 'Open FLEX d² Trajectory Chart & Table IX',
      tab: 'd2',
      table: 'flex',
    },
    miniComparison: {
      heading: 'Table IX Extinction Comparison at 21% O₂ (~1 atm)',
      leftLabel: 'FLEX-034 Methanol (D₀ 3.89 mm)',
      leftValue: '27.3 s burn (K = 0.44 mm²/s)',
      leftWidthPct: 85,
      rightLabel: 'FLEX-035 Heptane (D₀ 3.85 mm)',
      rightValue: '8.9 s burn (K = 0.43 mm²/s)',
      rightWidthPct: 28,
      caption: 'Measured burn time before radiative extinction in FLEX Table IX.',
    },
  },
];

export function sortSafetyFindings(
  items: SafetyFindingItem[],
  mode: FindingsSortMode
): SafetyFindingItem[] {
  const copy = [...items];
  if (mode === 'source') {
    return copy.sort((a, b) => a.sourceFile.localeCompare(b.sourceFile) || a.id.localeCompare(b.id));
  }
  return copy.sort((a, b) => a.scopeRank - b.scopeRank);
}
