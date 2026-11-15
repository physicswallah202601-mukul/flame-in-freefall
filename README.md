# Flame in Freefall: Microgravity Combustion Explorer

Interactive React + TypeScript + Express web explorer for comparing 1g buoyant combustion against 0g microgravity diffusion flames, inspecting open NASA microgravity combustion datasets, reviewing planetary fire-safety considerations, and querying a server-grounded AI specialist.

## Development & Build

- `npm install` — Install dependencies
- `npm run dev` — Start Express + Vite dev server on port `3000` (`tsx server.ts`)
- `npm run lint` — TypeScript check (`tsc --noEmit`)
- `npm run build` — Production frontend build (`dist/`)
- `npm test` — Cross-platform unit test suite (runs all test files explicitly via `tsx --test`)

### Asset Storage & External Report Provenance Note
- `public/assets/aistudio/PSI-99_Experimental_table_SAFFIRE-2_3c24390b.csv` and `public/assets/aistudio/i_Investigation_fbbe3e34.txt` are stored in `public/assets/aistudio/` (with a verbatim SAFFIRE-2 TypeScript fallback bundled in `src/data/nasaDatasets.ts`).
- The **FLEX** (`NASA/TP—2015-216046`) and **BASS-II** (`NASA/TM—20210011385`) PDF reports are **externally linked and not bundled** in `reference-docs/aistudio/` or `dist/`. Cited Table IX, Table 5.1, Sec. 1.0, and Sec. 6 Eq. 6.1 details are transcribed in `src/data/flexTableIX.ts` and `src/data/nasaDatasets.ts` with official NTRS citation links below.

---

## Original Project Code & Artwork License

Original application source code and original inline SVG/HTML5 Canvas artwork created by the project owner/team are licensed under the **Apache License, Version 2.0** (see root [`LICENSE`](LICENSE) and `package.json`).

- `"private": true` in `package.json` only prevents accidental `npm publish`; it does not define copyright licensing.
- **License Scope Exclusion:** The `Apache-2.0` license applies **only** to original application code and original artwork that the project owner/team has the right to license. NASA scientific reports, datasets, public APIs, Google Fonts, third-party npm dependencies, and unverified prompt attachments remain governed strictly by their own respective terms or statutory notices.
- **Flagged for Review (Uncertain Ownership / Permission):**
  - `public/assets/aistudio/image_e515052d_fc25d7ef.jpg` (prompt visual reference attachment; unused and never rendered in the UI; no copyright/license metadata supplied).
  - Unused prompt-uploaded helper files in `public/assets/aistudio/` (`CONTRIBUTING_54c34692.md`, `*.py`, `requirements_72fa2a8f.txt`, `.gitattributes_dbcc7893`, `.gitignore_471ede70`, `s_PSI-*.txt`), which are not imported or executed by the application and carry no bundled license header.

---

## Sources & Licenses

### 1. Datasets & NASA Scientific Publications

| Title | Publisher | Stable URL | Bundle Status | App Feature | License / Reuse Status |
| --- | --- | --- | --- | --- | --- |
| *Detailed Results From the Flame Extinguishment Experiment (FLEX) March 2009 to December 2011* (`NASA/TP—2015-216046`, Table IX & Sec. 1.0) | NASA Glenn Research Center / NASA STI Program | https://ntrs.nasa.gov/citations/20150023456 | Externally linked (not bundled) | Telemetry & d² Explorer (245 Table IX runs, d² curve, unit conversions), Key Fire-Safety Findings, Grounded AI Specialist | Unverified locally — **check publisher terms** at `ntrs.nasa.gov`. |
| *Burning and Suppression of Solids–II (BASS–II) Summary Report* (`NASA/TM—20210011385`, Table 5.1 & Sec. 6 Eq. 6.1) | NASA Glenn Research Center / NASA STI Program | https://ntrs.nasa.gov/citations/20210011385 | Externally linked (not bundled) | Telemetry & d² Explorer (M1–M20 PMMA tests, Eq. 6.1 Goldilocks boundary & Cabin Screening Check), Key Fire-Safety Findings, Fire Safety & Earth Engines, Grounded AI Specialist | Unverified locally — **check publisher terms** at `ntrs.nasa.gov`. |
| *Particle Morphology and Size Results from the Smoke Aerosol Measurement Experiment-2* (`AIAA 2012-3536`, NTRS `20130000422`, Table 1 & Sec. II.C) | American Institute of Aeronautics and Astronautics (AIAA) / NASA NTRS | https://doi.org/10.2514/6.2012-3536 | Externally linked (Table 1 transcribed) | Telemetry & d² Explorer (SAME-2 aerosol diameter chart & Table 1), Key Fire-Safety Findings, Fire Safety & Earth Engines, Grounded AI Specialist | Printed on source PDF page 1: *"This material is declared a work of the U.S. Government and is not subject to copyright protection in the United States."* |
| *PSI-99 Experimental Table SAFFIRE-2* (Samples `2-1` to `2-9`, Notes `1–4`) & *SAFFIRE-II Operations* | NASA Physical Sciences Informatics (PSI) System / NASA GRC | https://psi.nasa.gov/ | CSV bundled in `public/assets/aistudio/` (ops external) | Telemetry & d² Explorer (runtime CSV `/assets/aistudio/PSI-99_Experimental_table_SAFFIRE-2_3c24390b.csv` + 9 Cygnus rows), Key Fire-Safety Findings, Grounded AI Specialist | No explicit license field embedded — **check publisher terms** at `psi.nasa.gov`. |
| *PSI-62: Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity* (`i_Investigation_fbbe3e34.txt`) | NASA Physical Sciences Informatics (PSI) System | https://doi.org/10.60555/e9xp-ex83 | Metadata bundled in `public/assets/aistudio/` | Loaded NASA Sources switchboard, Fire Safety & Earth Engines (UFGM context), Grounded AI Specialist | No explicit license field in metadata file — **check publisher terms** on DOI record & `psi.nasa.gov`. |
| Unused prompt attachments (`CONTRIBUTING_54c34692.md`, `*.py`, `requirements_72fa2a8f.txt`, `s_PSI-*.txt`) | External prompt upload (`public-apis` / PSI metadata stubs) | — | Flagged for review (unused in app) | Not used by app runtime | **Flagged for review:** origin/redistribution permission unverified locally; excluded from Apache-2.0. |
| User-Uploaded Local CSV & Synthetic Demo CSV (`sample_soot_radiative_demo.csv`) | User-selected local file / `src/utils/csvParser.ts` | Local browser `FileReader` only | Runtime input | TopBar CSV Upload, Telemetry & d² Explorer (`Soot & Radiative Loss` / `Download Sample CSV` / `Uploaded CSV Plot`), Grounded AI Specialist | User CSV remains under uploader's own terms; demo CSV generator code in `csvParser.ts` is `Apache-2.0`. |

### 2. Public, AI & Font APIs

| Title | Publisher | Stable URL | App Feature | License / Reuse Status |
| --- | --- | --- | --- | --- |
| Where the ISS At? Satellite Position API (ISS NORAD `25544`) | Where the ISS At | https://api.wheretheiss.at/v1/satellites/25544 | Hero Overview (ISS Orbital Environment via `GET /api/iss` with offline fallback) | Unauthenticated public REST endpoint; no license file bundled — **check publisher terms** at `wheretheiss.at`. |
| NASA Image and Video Library Search API | NASA | https://images-api.nasa.gov/search | Hero Overview (NASA Media Filter catalog metadata via `GET /api/nasa-media`) | Public NASA catalog API; media items subject to [NASA Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) — **check publisher terms**. |
| Google Gemini API (`GEMINI_MODEL` / `gemini-4-hydrogen` default with `gemini-2.5-flash` retry fallback via `@google/genai`) | Google LLC | https://ai.google.dev/ | Module 4: Grounded AI Specialist (`POST /api/ask`, server-only via `GEMINI_API_KEY`) | Governed by Google APIs / Gemini API Terms of Service (`@google/genai` SDK is `Apache-2.0`). |
| Google Fonts CSS API (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`) | Google Fonts | https://fonts.googleapis.com/ | Typography (`index.html` & `src/index.css` with `system-ui`/`monospace` fallbacks) | Loaded from Google Fonts CDN; font licenses not bundled locally — **check publisher terms**. |

### 3. Images & Visual Assets

| Asset | Source / Origin | App Feature | License / Reuse Status |
| --- | --- | --- | --- |
| Inline SVG emblem (`FlameInFreefallEmblem` in `src/components/EmblemSvg.tsx`) | Original project SVG code | TopBar header brand mark (omits patch border, text, and NASA insignia) | Original project UI artwork — `Apache-2.0` (see [`LICENSE`](LICENSE)). |
| Hardware schematic SVGs (`OriginalChamberArtwork`) & 2D Canvas (`FlameSimulator`) | Original project SVG/Canvas code | Hero Overview plates & Module 1 Simulator | Original project UI artwork — `Apache-2.0` (see [`LICENSE`](LICENSE)). |
| Prompt attachment `image_e515052d_fc25d7ef.jpg` | User prompt attachment | Design reference only (never loaded or displayed in runtime UI) | **Flagged for review:** ownership and redistribution permission uncertain (no copyright/license metadata supplied); excluded from `Apache-2.0`. |
| External photographs | None rendered in `<img>` tags | `/api/nasa-media` shows text-only catalog metadata filtered against people/crew keywords | No external photos embedded. |

### 4. Third-Party Libraries (`package.json` & verified `node_modules/*/package.json`)

| Package | Installed / Declared | Publisher / URL | App Role | Verified License |
| --- | --- | --- | --- | --- |
| `react`, `react-dom` | `19.3.1` (`^19.0.1`) | Meta Platforms / https://react.dev/ | UI component tree and DOM rendering | `MIT` |
| `recharts` | `3.10.1` (`^3.10.1`) | Recharts Group / https://github.com/recharts/recharts | Telemetry line & bar charts | `MIT` |
| `lucide-react` | `0.546.0` (`^0.546.0`) | Lucide Contributors / https://lucide.dev | UI iconography | `ISC` |
| `@google/genai` | `3.3.0` (`^3.3.0`) | Google LLC / https://github.com/googleapis/js-genai | Server-side Gemini client in `server.ts` | `Apache-2.0` |
| `express` | `4.22.3` (`^4.21.2`) | Express Contributors / http://expressjs.com/ | HTTP server (`server.ts`) & API proxy routes | `MIT` |
| `dotenv` | `17.4.2` (`^17.2.3`) | dotenv Contributors / https://github.com/motdotla/dotenv | Server `.env` loading in `server.ts` | `BSD-2-Clause` |
| `vite`, `@vitejs/plugin-react` | `8.3.8`, `6.3.0` | Vite Contributors / https://vite.dev | Dev middleware & production bundler | `MIT` |
| `tailwindcss`, `@tailwindcss/vite` | `4.3.5` (`^4.3.3`) | Tailwind Labs / https://tailwindcss.com | Tailwind CSS v4 styling | `MIT` |
| `typescript` | `7.0.2` (`^7.0.2`) | Microsoft Corp. / https://www.typescriptlang.org/ | Type checking (`npm run lint`) | `Apache-2.0` |
| `tsx` | `4.23.15` (`^4.21.0`) | Hiroki Osame / https://tsx.hirok.io | Server runner (`tsx server.ts`) & `npm test` runner | `MIT` |
| `esbuild` | `0.25.12` (`^0.25.0`) | Evan Wallace / https://github.com/evanw/esbuild | Build bundler tooling | `MIT` |
| `autoprefixer` | `10.6.2` (`^10.4.21`) | PostCSS / https://github.com/postcss/autoprefixer | CSS prefixing dev dependency | `MIT` |
| `@types/node`, `@types/react`, `@types/react-dom`, `@types/express` | `22.20.5`, `19.3.0`, `19.3.0`, `4.17.25` | DefinitelyTyped / https://github.com/DefinitelyTyped/DefinitelyTyped | TypeScript declaration packages | `MIT` |
