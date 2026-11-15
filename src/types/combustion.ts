export type FuelType = 'Methanol' | 'Heptane';

export interface FlexTestRecord {
  test: string;
  identifier: string;
  date: string;
  gmt: string;
  fuel: FuelType;
  pressureMmHg: number | null;
  o2: number;
  n2: number;
  co2: number;
  he: number;
  d0Mm: number | null;
  dExtMm: number | null;
  burningRateMm2PerS: number | null;
  burnTimeS: number | null;
  testEnd: 'Extinction' | 'Disruption' | 'Completion';
}

export interface Bass2MillerRecord {
  testNo: string;
  thicknessMm: number;
  widthCm: number;
  sidesBurning: 1 | 2;
  velocityCmPerS: string;
  spreadRateMmPerS: string;
  primarySpreadRateMmPerS: number | null;
  burnTimeMin: number;
  initialO2Pct: number;
  finalO2Pct: number;
}

export interface Same2AerosolRecord {
  material: string;
  aging: 'Unaged' | 'Aged 720 s';
  dgUm: number;
  countMeanUm: number;
  massMeanUm: number;
  sigmaG: number;
}

export interface Saffire2CsvRow {
  sampleNumber: string;
  material: string;
  thickness: string;
  length: string;
  widthCm: string;
  airFlowCmPerS: string;
  percentO2: string;
  ignitionPowerW: string;
  ignitionTimeS: string;
  burnTimeS: string;
  flowDirection: string;
  microGBurnLength: string;
  microGSpreadLength: string;
  oneGBurnLength: string;
  oneGSpreadRate: string;
  camera1: string;
  camera2: string;
}

export interface UploadedCsvDataset {
  fileName: string;
  headers: string[];
  rows: Record<string, string>[];
  notes: string[];
  numericColumns: string[];
  hasSootColumn: boolean;
  hasRadiativeColumn: boolean;
  loadedAtIso: string;
}

export interface LoadedDatasetsState {
  flexLoaded: boolean;
  bass2Loaded: boolean;
  same2Loaded: boolean;
  saffire2Loaded: boolean;
  psi62Loaded: boolean;
  uploadedCsv: UploadedCsvDataset | null;
}

export interface SimulatorParams {
  gravityG: number; // 0.00 to 1.00 g
  oxygenPct: number; // 15 to 30 %
  dropletDiameterMm: number; // 0.5 to 4.0 mm
  pressureAtm: number; // 0.5 to 3.05 atm
}

export interface QualitativeFlameMetrics {
  buoyancyPlumeRatio: number; // 0 = spherical diffusion, 1 = tall buoyant teardrop
  sootLuminosityIndex: number; // 0 = pure blue chemilumin, 1 = bright amber soot
  qualitativeBurnRateScale: number; // illustrative relative K scale
  relativeFlameStandoff: number; // dimensionless flame-to-droplet radius ratio
  estimatedQualitativeLifetimeS: number; // illustrative relative lifetime
  regimeLabel: string;
}

export interface D2CurvePoint {
  t: number;
  d2Mm2: number;
  dMm: number;
}

export interface IssTelemetryResponse {
  source: 'live' | 'fallback';
  latitude: number;
  longitude: number;
  altitudeKm: number;
  velocityKmh: number;
  visibility: string;
  timestampUnix: number;
  note: string;
}

export interface NasaMediaItem {
  nasaId: string;
  title: string;
  description: string;
  dateCreated: string;
  center: string;
  imageUrl: string | null;
  keywords: string[];
  verifiedPeopleFreeByMetadata: boolean;
}

export interface NasaMediaResponse {
  source: 'live' | 'fallback';
  items: NasaMediaItem[];
  filteredOutCount: number;
  note: string;
}

export interface ActiveDatasetFlags {
  flexLoaded: boolean;
  bass2Loaded: boolean;
  same2Loaded: boolean;
  saffire2Loaded: boolean;
  psi62Loaded: boolean;
}

export interface UploadedCsvAskPayload {
  fileName: string;
  headers: string[];
  rows: Record<string, string>[];
}

export type FindingClassification = 'Measured Result' | 'Interpretation';
export type FindingsSortMode = 'scope' | 'source';

export interface FindingChartAction {
  label: string;
  tab: 'd2' | 'bass_same' | 'soot_rad';
  table?: 'flex' | 'bass2' | 'same2' | 'saffire2';
}

export interface FindingMiniComparison {
  heading: string;
  leftLabel: string;
  leftValue: string;
  leftWidthPct: number;
  rightLabel: string;
  rightValue: string;
  rightWidthPct: number;
  caption: string;
}

export interface SafetyFindingItem {
  id: string;
  title: string;
  experiment: string;
  classification: FindingClassification;
  sourceFile: string;
  sourceTableOrSection: string;
  sourceEntryId: string;
  sourceUrl: string;
  plainTakeaway: string;
  summary: string;
  limitations: string;
  scopeRank: number;
  scopeCriterion: string;
  chartAction: FindingChartAction;
  miniComparison: FindingMiniComparison;
}

export interface SpecialistSourceCitation {
  file: string;
  sectionOrColumn: string;
}

export interface SpecialistQaResponse {
  available: boolean;
  grounded: boolean;
  answer: string;
  fileEvidenceSummary: string;
  generalBackgroundSummary: string;
  citations: SpecialistSourceCitation[];
  uncertaintyNote: string;
  errorReason?: string;
}
