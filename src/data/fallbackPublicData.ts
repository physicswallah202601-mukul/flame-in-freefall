import type { IssTelemetryResponse, NasaMediaResponse } from '../types/combustion';

export const FALLBACK_ISS_TELEMETRY: IssTelemetryResponse = {
  source: 'fallback',
  latitude: 28.474,
  longitude: -80.542,
  altitudeKm: 418.6,
  velocityKmh: 27584.2,
  visibility: 'daylight',
  timestampUnix: 1735689600,
  note: 'Cached/demo ISS orbital reference snapshot (offline fallback — not live telemetry).',
};

// Offline fallback omits unverified external image URLs so the UI renders original
// people-free SVG/Canvas scientific artwork instead of unconfirmed photographs.
export const FALLBACK_NASA_MEDIA: NasaMediaResponse = {
  source: 'fallback',
  items: [],
  filteredOutCount: 0,
  note: 'Offline/cached fallback mode: NASA Image Library unreachable or unconfirmed. Displaying original people-free scientific chamber artwork.',
};
