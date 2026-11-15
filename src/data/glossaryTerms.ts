export type GlossaryTermId = 'd2' | 'pmma' | 'sigmaG' | 'burnRateK' | 'stretchRateA' | 'dg' | 'sibal';

export interface GlossaryTermDefinition {
  id: GlossaryTermId;
  symbol: string;
  shortLabel: string;
  definition: string;
  sourceRef: string;
}

export const GLOSSARY_TERMS: Record<GlossaryTermId, GlossaryTermDefinition> = {
  d2: {
    id: 'd2',
    symbol: 'd²',
    shortLabel: 'd-squared law',
    definition:
      'Classical droplet combustion relation D²(t) = D₀² − K·t: the squared droplet diameter decreases linearly over burn time at burning-rate constant K.',
    sourceRef: 'FLEX (NASA/TP—2015-216046)',
  },
  pmma: {
    id: 'pmma',
    symbol: 'PMMA',
    shortLabel: 'Polymethyl methacrylate',
    definition:
      'Clear cast acrylic plastic (Plexiglas), a standard NASA solid-fuel benchmark burned as rods, slabs, and sheets in BASS-II and SAFFIRE-II.',
    sourceRef: 'BASS-II (TM-20210011385) & SAFFIRE-II',
  },
  sigmaG: {
    id: 'sigmaG',
    symbol: 'σg',
    shortLabel: 'Geometric std. deviation',
    definition:
      'Geometric standard deviation of a log-normal aerosol particle size distribution (σg = 1.0 means uniform particle sizes; higher values indicate a wider size spread).',
    sourceRef: 'SAME-2 (AIAA 2012-3536, Table 1)',
  },
  burnRateK: {
    id: 'burnRateK',
    symbol: 'K',
    shortLabel: 'Burning-rate constant',
    definition:
      'Average rate (mm²/s) at which a spherical droplet’s squared diameter shrinks during steady burning in FLEX Table IX.',
    sourceRef: 'FLEX Table IX',
  },
  stretchRateA: {
    id: 'stretchRateA',
    symbol: 'a',
    shortLabel: 'Flow stretch rate',
    definition:
      'Normalized airflow velocity gradient (s⁻¹) in the BASS-II opposed-flow duct; spacecraft cabin ventilation typically falls near 8–12 s⁻¹.',
    sourceRef: 'BASS-II Sec. 6 (Eq. 6.1)',
  },
  dg: {
    id: 'dg',
    symbol: 'Dg',
    shortLabel: 'Geometric mean diameter',
    definition:
      'Geometric mean smoke particle diameter (µm) from SAME-2 log-normal fits, used alongside count-mean (M₁/M₀) and mass-mean (M₃/M₀) diameters.',
    sourceRef: 'SAME-2 Table 1',
  },
  sibal: {
    id: 'sibal',
    symbol: 'SIBAL',
    shortLabel: 'Cotton-fiberglass fabric',
    definition:
      'Solid Inflammability Boundary at Low-Speed (SIBAL) reference cloth: 75% cotton / 25% fiberglass blend by mass tested in BASS-II and SAFFIRE-II.',
    sourceRef: 'SAFFIRE-II & BASS-II',
  },
};
