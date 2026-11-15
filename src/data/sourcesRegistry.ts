export type SourceCategory = 'dataset' | 'api' | 'image' | 'library';

export type SourceVerificationStatus =
  | 'Verified'
  | 'Check publisher terms'
  | 'Flagged for review';

export interface SourceLicenseEntry {
  id: string;
  category: SourceCategory;
  title: string;
  publisher: string;
  stableUrl: string | null;
  urlLabel?: string;
  bundlingStatus?: string;
  appFeature: string;
  licenseOrReuse: string;
  verifiedStatus: SourceVerificationStatus;
}

export const ORIGINAL_CODE_LICENSE_NOTICE = {
  heading: 'Original Project Code & Original Artwork License',
  status: 'Apache-2.0 (LICENSE)',
  detail:
    'Original application source code and original inline SVG/Canvas artwork authored by the project owner/team are licensed under Apache-2.0 (see root LICENSE and package.json). Note: "private": true in package.json only prevents accidental npm publication and does not grant or replace a copyright license. This Apache-2.0 license does NOT apply to NASA reports, public APIs, Google Fonts, third-party packages, or unverified prompt attachments; items with uncertain ownership or permission are flagged for review below.',
};

export const SOURCES_REGISTRY: SourceLicenseEntry[] = [
  // 1. Datasets & Reference Reports
  {
    id: 'dataset-flex',
    category: 'dataset',
    title:
      'Detailed Results From the Flame Extinguishment Experiment (FLEX) March 2009 to December 2011 (NASA/TP—2015-216046, Table IX & Sec. 1.0)',
    publisher: 'NASA Glenn Research Center / NASA Scientific and Technical Information (STI) Program',
    stableUrl: 'https://ntrs.nasa.gov/citations/20150023456',
    bundlingStatus: 'Externally linked · Not bundled',
    appFeature:
      'Telemetry & d² Explorer (245 Table IX runs, d² curve reconstruction, pressure unit conversion), Key Fire-Safety Findings (Table IX & Sec. 1.0), Grounded AI Specialist',
    licenseOrReuse:
      'Externally linked only — the full PDF is not bundled in this repository or deployed assets. Table IX (FLEX-032 to FLEX-280) and Sec. 1.0 details are cited and transcribed in src/data/flexTableIX.ts. Reuse/license terms are not verified locally — check publisher terms at ntrs.nasa.gov.',
    verifiedStatus: 'Check publisher terms',
  },
  {
    id: 'dataset-bass2',
    category: 'dataset',
    title:
      'Burning and Suppression of Solids–II (BASS–II) Summary Report (NASA/TM—20210011385, Table 5.1 & Sec. 6 Eq. 6.1)',
    publisher: 'NASA Glenn Research Center / NASA STI Program',
    stableUrl: 'https://ntrs.nasa.gov/citations/20210011385',
    bundlingStatus: 'Externally linked · Not bundled',
    appFeature:
      'Telemetry & d² Explorer (Table 5.1 M1–M20 PMMA tests, Eq. 6.1 Goldilocks boundary & Cabin Screening Check), Key Fire-Safety Findings (Sec. 6 Eq. 6.1, Fig. 6.9–6.10 & Table 5.1), Fire Safety and Earth Engines, Grounded AI Specialist',
    licenseOrReuse:
      'Externally linked only — the full PDF is not bundled in this repository or deployed assets. Table 5.1 (M1–M20) and Sec. 6 (Eq. 6.1) details are cited and transcribed in src/data/nasaDatasets.ts. Reuse/license terms are not verified locally — check publisher terms at ntrs.nasa.gov.',
    verifiedStatus: 'Check publisher terms',
  },
  {
    id: 'dataset-same2',
    category: 'dataset',
    title:
      'Particle Morphology and Size Results from the Smoke Aerosol Measurement Experiment-2 (AIAA 2012-3536 / NTRS 20130000422, Table 1 & Sec. II.C)',
    publisher: 'American Institute of Aeronautics and Astronautics (AIAA) / NASA NTRS',
    stableUrl: 'https://doi.org/10.2514/6.2012-3536',
    bundlingStatus: 'Externally linked · Table 1 transcribed',
    appFeature:
      'Telemetry & d² Explorer (SAME-2 Table 1 baseline vs. 720 s aged smoke particle diameters), Key Fire-Safety Findings, Fire Safety and Earth Engines, Grounded AI Specialist',
    licenseOrReuse:
      'Not bundled in dist/ (Table 1 values transcribed in src/data/nasaDatasets.ts). Verified notice printed on page 1 of the source report: "This material is declared a work of the U.S. Government and is not subject to copyright protection in the United States."',
    verifiedStatus: 'Verified',
  },
  {
    id: 'dataset-saffire2',
    category: 'dataset',
    title:
      'PSI-99 Experimental Table SAFFIRE-2 (Samples 2-1 to 2-9, Notes 1–4) & SAFFIRE-II Operations',
    publisher: 'NASA Physical Sciences Informatics (PSI) System / NASA Glenn Research Center',
    stableUrl: 'https://psi.nasa.gov/',
    bundlingStatus: 'CSV bundled in public/ · Ops report external',
    appFeature:
      'Telemetry & d² Explorer (runtime fetch of /assets/aistudio/PSI-99_Experimental_table_SAFFIRE-2_3c24390b.csv + verbatim fallback), Key Fire-Safety Findings, Grounded AI Specialist',
    licenseOrReuse:
      'No explicit license string is embedded inside the CSV or operations record — check publisher terms at psi.nasa.gov.',
    verifiedStatus: 'Check publisher terms',
  },
  {
    id: 'dataset-psi62',
    category: 'dataset',
    title:
      'PSI-62: Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity (i_Investigation_fbbe3e34.txt)',
    publisher: 'NASA Physical Sciences Informatics (PSI) System',
    stableUrl: 'https://doi.org/10.60555/e9xp-ex83',
    bundlingStatus: 'Metadata file in public/assets/aistudio/',
    appFeature:
      'Loaded NASA Sources switchboard, Fire Safety and Earth Engines (UFGM modeling context), Grounded AI Specialist (metadata provenance)',
    licenseOrReuse:
      'No explicit license field is present inside i_Investigation_fbbe3e34.txt — check publisher terms on the DOI record and psi.nasa.gov.',
    verifiedStatus: 'Check publisher terms',
  },
  {
    id: 'dataset-unused-prompt-files',
    category: 'dataset',
    title:
      'Unused Prompt Attachment Helper Files in public/assets/aistudio/ (CONTRIBUTING_54c34692.md, *.py, requirements_72fa2a8f.txt, s_PSI-*.txt)',
    publisher: 'External prompt attachment origin (public-apis / PSI metadata stubs)',
    stableUrl: null,
    urlLabel: 'Not imported or used by application runtime',
    bundlingStatus: 'Flagged for review · Unused in app',
    appFeature: 'Not used by any application module or API route',
    licenseOrReuse:
      'FLAGGED FOR REVIEW: Ownership and redistribution terms of these unused prompt-uploaded helper files (including public-apis CONTRIBUTING.md and Python scripts without an embedded license file in public/assets/aistudio/) are unverified. Excluded from the Apache-2.0 app license; review or remove before public redistribution.',
    verifiedStatus: 'Flagged for review',
  },
  {
    id: 'dataset-user-csv',
    category: 'dataset',
    title: 'User-Uploaded Local CSV Dataset & Synthetic Demo CSV (Optional Browser Input)',
    publisher: 'Local file selected by user / synthetic demo generator (csvParser.ts)',
    stableUrl: null,
    urlLabel: 'Local browser FileReader input (no persistent server storage)',
    appFeature:
      'TopBar CSV Upload, Telemetry & d² Explorer (Soot & Radiative Loss / Download Sample CSV / Uploaded CSV Plot), Grounded AI Specialist (bounded & sanitized per request)',
    licenseOrReuse:
      'Uploaded files remain under the uploader’s own terms and are processed transiently in memory; the synthetic demo CSV generator code in src/utils/csvParser.ts is Apache-2.0.',
    verifiedStatus: 'Verified',
  },

  // 2. APIs
  {
    id: 'api-wheretheiss',
    category: 'api',
    title: 'Where the ISS At? Satellite Position API (NORAD ID 25544)',
    publisher: 'Where the ISS At (wheretheiss.at)',
    stableUrl: 'https://api.wheretheiss.at/v1/satellites/25544',
    appFeature:
      'Hero Overview (ISS Orbital Environment live latitude, longitude, altitude, and speed via server proxy GET /api/iss with cached offline fallback)',
    licenseOrReuse:
      'Unauthenticated public REST endpoint; no license file is bundled locally — check publisher terms at wheretheiss.at.',
    verifiedStatus: 'Check publisher terms',
  },
  {
    id: 'api-nasa-images',
    category: 'api',
    title: 'NASA Image and Video Library Search API',
    publisher: 'National Aeronautics and Space Administration (NASA)',
    stableUrl: 'https://images-api.nasa.gov/search',
    appFeature:
      'Hero Overview (NASA Media Filter metadata catalog via GET /api/nasa-media with crew/people rejection filter and offline fallback)',
    licenseOrReuse:
      'Public NASA search endpoint; returned media items remain governed by NASA Media Usage Guidelines (https://www.nasa.gov/nasa-brand-center/images-and-media/) — check publisher terms.',
    verifiedStatus: 'Check publisher terms',
  },
  {
    id: 'api-gemini',
    category: 'api',
    title: 'Google Gemini API (GEMINI_MODEL / gemini-4-hydrogen with gemini-2.5-flash fallback)',
    publisher: 'Google LLC',
    stableUrl: 'https://ai.google.dev/',
    appFeature:
      'Module 4: Grounded AI Specialist (server-only POST /api/ask using server GEMINI_API_KEY, optional GEMINI_MODEL env override, and rate-limited trusted server context)',
    licenseOrReuse:
      'Governed by Google APIs / Gemini API Terms of Service; official @google/genai SDK is Apache-2.0.',
    verifiedStatus: 'Verified',
  },
  {
    id: 'api-google-fonts',
    category: 'api',
    title: 'Google Fonts CSS API (Outfit, Plus Jakarta Sans, JetBrains Mono)',
    publisher: 'Google Fonts',
    stableUrl: 'https://fonts.googleapis.com/',
    appFeature:
      'Global typography defined in index.html and src/index.css with local system-ui / monospace fallbacks',
    licenseOrReuse:
      'Loaded over HTTPS from fonts.googleapis.com; font license files are not bundled locally — check publisher terms (fonts.google.com) and individual font specimen licenses.',
    verifiedStatus: 'Check publisher terms',
  },

  // 3. Images & Visual Assets
  {
    id: 'image-emblem-svg',
    category: 'image',
    title: 'Original Inline SVG Emblem ("Flame in Freefall")',
    publisher: 'Original project UI code (src/components/EmblemSvg.tsx)',
    stableUrl: null,
    urlLabel: 'Inline SVG: FlameInFreefallEmblem',
    appFeature: 'Top navigation header brand mark (omits patch border, text, and any NASA insignia)',
    licenseOrReuse:
      'Original project artwork authored in code; licensed under Apache-2.0 (see root LICENSE), provided the project owner/team holds rights to original contributions.',
    verifiedStatus: 'Verified',
  },
  {
    id: 'image-schematics-canvas',
    category: 'image',
    title: 'Original Hardware Schematic SVGs (FLEX, BASS-II, SAME-2) & HTML5 Flame Canvas',
    publisher: 'Original project UI code (src/components/EmblemSvg.tsx, src/components/FlameSimulator.tsx)',
    stableUrl: null,
    urlLabel: 'Inline SVG & HTML5 2D Canvas',
    appFeature:
      'Hero Overview (Verified People-Free Combustion Plates) and Module 1 (1g vs 0g Flame Simulator)',
    licenseOrReuse:
      'Original project artwork authored in code; licensed under Apache-2.0 (see root LICENSE), provided the project owner/team holds rights to original contributions.',
    verifiedStatus: 'Verified',
  },
  {
    id: 'image-prompt-reference',
    category: 'image',
    title: 'Prompt Visual Reference Attachment (image_e515052d_fc25d7ef.jpg)',
    publisher: 'User prompt attachment (not displayed at runtime)',
    stableUrl: null,
    urlLabel: 'Design reference only (unused by client UI)',
    bundlingStatus: 'Flagged for review · Unused in UI',
    appFeature:
      'Visual composition reference for FlameInFreefallEmblem SVG only; never loaded or rendered in the UI',
    licenseOrReuse:
      'FLAGGED FOR REVIEW: Ownership and redistribution permission are uncertain (no copyright or license metadata accompanied the image). Excluded from Apache-2.0 and not rendered in the app.',
    verifiedStatus: 'Flagged for review',
  },
  {
    id: 'image-external-photos',
    category: 'image',
    title: 'External NASA / Stock Photographs Policy',
    publisher: 'Not used in rendered <img> elements',
    stableUrl: null,
    urlLabel: 'Original SVG/Canvas artwork displayed instead',
    appFeature:
      'Hero Overview renders text-only NASA catalog cards from /api/nasa-media because metadata alone is not visual people-free confirmation',
    licenseOrReuse: 'No external photographs are downloaded or embedded in the DOM.',
    verifiedStatus: 'Verified',
  },

  // 4. Third-Party Libraries (verified directly against node_modules/*/package.json)
  {
    id: 'lib-react',
    category: 'library',
    title: 'react & react-dom (v19.3.1 installed, ^19.0.1)',
    publisher: 'Meta Platforms, Inc. and contributors',
    stableUrl: 'https://react.dev/',
    appFeature: 'Core SPA component rendering and DOM mounting (all modules)',
    licenseOrReuse: 'MIT (verified in node_modules/react/package.json and react-dom/package.json)',
    verifiedStatus: 'Verified',
  },
  {
    id: 'lib-recharts',
    category: 'library',
    title: 'recharts (v3.10.1)',
    publisher: 'Recharts Group',
    stableUrl: 'https://github.com/recharts/recharts',
    appFeature:
      'Module 2: Telemetry & d² Explorer interactive line and bar charts (d², Goldilocks boundary, SAME-2, uploaded CSV)',
    licenseOrReuse: 'MIT (verified in node_modules/recharts/package.json)',
    verifiedStatus: 'Verified',
  },
  {
    id: 'lib-lucide',
    category: 'library',
    title: 'lucide-react (v0.546.0)',
    publisher: 'Lucide Contributors',
    stableUrl: 'https://lucide.dev',
    appFeature:
      'Instrument UI icons across TopBar, HeroOverview, KeySafetyFindings, Simulator, Telemetry, Safety, Specialist, and Sources',
    licenseOrReuse: 'ISC (verified in node_modules/lucide-react/package.json)',
    verifiedStatus: 'Verified',
  },
  {
    id: 'lib-genai',
    category: 'library',
    title: '@google/genai (v3.3.0)',
    publisher: 'Google LLC',
    stableUrl: 'https://github.com/googleapis/js-genai',
    appFeature: 'Server-side Gemini SDK inside server.ts (POST /api/ask)',
    licenseOrReuse: 'Apache-2.0 (verified in node_modules/@google/genai/package.json)',
    verifiedStatus: 'Verified',
  },
  {
    id: 'lib-express',
    category: 'library',
    title: 'express (v4.22.3 installed, ^4.21.2)',
    publisher: 'TJ Holowaychuk & Express Contributors',
    stableUrl: 'http://expressjs.com/',
    appFeature: 'HTTP server (server.ts) hosting /api/iss, /api/nasa-media, /api/ask, Vite dev middleware, and static dist/',
    licenseOrReuse: 'MIT (verified in node_modules/express/package.json)',
    verifiedStatus: 'Verified',
  },
  {
    id: 'lib-dotenv',
    category: 'library',
    title: 'dotenv (v17.4.2 installed, ^17.2.3)',
    publisher: 'Scott Motte / dotenv Contributors',
    stableUrl: 'https://github.com/motdotla/dotenv',
    appFeature: 'Server environment variable loading in server.ts',
    licenseOrReuse: 'BSD-2-Clause (verified in node_modules/dotenv/package.json)',
    verifiedStatus: 'Verified',
  },
  {
    id: 'lib-tailwind',
    category: 'library',
    title: 'tailwindcss & @tailwindcss/vite (v4.3.5 installed, ^4.3.3)',
    publisher: 'Tailwind Labs, Inc.',
    stableUrl: 'https://tailwindcss.com',
    appFeature: 'Utility CSS compilation for responsive layout and dark scientific theme',
    licenseOrReuse: 'MIT (verified in node_modules/tailwindcss/package.json and @tailwindcss/vite/package.json)',
    verifiedStatus: 'Verified',
  },
  {
    id: 'lib-vite',
    category: 'library',
    title: 'vite (v8.3.8) & @vitejs/plugin-react (v6.3.0)',
    publisher: 'Evan You & Vite Contributors',
    stableUrl: 'https://vite.dev',
    appFeature: 'Development middleware and production SPA bundling (vite build)',
    licenseOrReuse: 'MIT (verified in node_modules/vite/package.json and @vitejs/plugin-react/package.json)',
    verifiedStatus: 'Verified',
  },
  {
    id: 'lib-typescript-tsx',
    category: 'library',
    title: 'typescript (v7.0.2, Apache-2.0) & tsx (v4.23.15, MIT)',
    publisher: 'Microsoft Corp. (TypeScript) / Hiroki Osame (tsx)',
    stableUrl: 'https://www.typescriptlang.org/',
    appFeature: 'Type checking (tsc --noEmit), server execution (tsx server.ts), and npm test execution',
    licenseOrReuse: 'Apache-2.0 (typescript) & MIT (tsx), verified in node_modules/*/package.json',
    verifiedStatus: 'Verified',
  },
  {
    id: 'lib-build-tooling',
    category: 'library',
    title: 'esbuild (v0.25.12), autoprefixer (v10.6.2), @types/{node,react,react-dom,express}',
    publisher: 'Evan Wallace / PostCSS / DefinitelyTyped Contributors',
    stableUrl: 'https://github.com/DefinitelyTyped/DefinitelyTyped',
    appFeature: 'Build/dev tooling and TypeScript ambient declarations',
    licenseOrReuse: 'MIT (verified in node_modules/esbuild, autoprefixer, and @types/*/package.json files)',
    verifiedStatus: 'Verified',
  },
];
