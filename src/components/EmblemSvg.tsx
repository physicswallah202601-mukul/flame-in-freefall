import React from 'react';

interface EmblemProps {
  className?: string;
}

/**
 * Original inline SVG emblem titled "Flame in Freefall".
 * Visual inspiration: central blue-and-amber flame inside an amber-rimmed sphere
 * encircled by a tilted orbital ring. Omits patch border and embedded text.
 */
export const FlameInFreefallEmblem: React.FC<EmblemProps> = ({ className = 'w-10 h-10' }) => (
  <svg
    viewBox="0 0 120 120"
    role="img"
    aria-label="Flame in Freefall emblem"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Flame in Freefall</title>
    <defs>
      <radialGradient id="fif-sphere-bg" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#162847" />
        <stop offset="70%" stopColor="#0B1426" />
        <stop offset="100%" stopColor="#070B14" />
      </radialGradient>
      <linearGradient id="fif-sphere-rim" x1="18" y1="18" x2="102" y2="102" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="fif-flame-outer" x1="60" y1="30" x2="60" y2="86" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="55%" stopColor="#0EA5E9" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="fif-flame-core" x1="60" y1="48" x2="60" y2="84" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="45%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#67E8F9" />
      </linearGradient>
      <linearGradient id="fif-orbit-ring" x1="10" y1="84" x2="110" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="55%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>

    {/* Back arc of orbital ring */}
    <path
      d="M 18 76 C 12 63, 30 44, 60 36 C 90 28, 108 35, 104 49"
      stroke="url(#fif-orbit-ring)"
      strokeWidth="3.2"
      strokeLinecap="round"
      opacity="0.55"
    />

    {/* Central sphere with warm amber rim */}
    <circle cx="60" cy="60" r="33" fill="url(#fif-sphere-bg)" stroke="url(#fif-sphere-rim)" strokeWidth="2.8" />
    <path
      d="M 39 42 A 26 26 0 0 1 65 34"
      stroke="#FEF3C7"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.45"
    />

    {/* Blue outer diffusion flame */}
    <path
      d="M 60 32 C 63 40, 74 48, 75 62 C 76 74, 69 83, 60 83 C 51 83, 44 74, 45 62 C 46 48, 56 42, 60 32 Z"
      fill="url(#fif-flame-outer)"
    />
    {/* Mid cyan flame */}
    <path
      d="M 60 41 C 63 48, 70 54, 70 64 C 70 74, 66 81, 60 81 C 54 81, 50 74, 50 64 C 50 54, 57 48, 60 41 Z"
      fill="#67E8F9"
      opacity="0.82"
    />
    {/* Warm amber inner droplet/reaction core */}
    <path
      d="M 60 53 C 62 58, 66 63, 65 70 C 65 76, 63 80, 60 80 C 57 80, 55 76, 55 70 C 54 63, 58 58, 60 53 Z"
      fill="url(#fif-flame-core)"
    />
    <circle cx="60" cy="70" r="3.4" fill="#FFFBEB" />

    {/* Front arc of tilted orbital ring */}
    <path
      d="M 104 49 C 107 62, 89 79, 60 86 C 31 93, 21 86, 18 76"
      stroke="url(#fif-orbit-ring)"
      strokeWidth="3.6"
      strokeLinecap="round"
    />
    {/* Subtle orbital node */}
    <circle cx="96" cy="40" r="2.8" fill="#FBBF24" />
  </svg>
);

export const OriginalChamberArtwork: React.FC<{ variant: 'flex' | 'bass2' | 'same2' }> = ({
  variant,
}) => {
  if (variant === 'flex') {
    return (
      <svg viewBox="0 0 360 190" className="w-full h-44 bg-[#080E1B]" role="img" aria-label="FLEX droplet chamber schematic artwork">
        <title>FLEX Spherical Droplet Diffusion Schematic</title>
        <defs>
          <radialGradient id="art-flex-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.65" />
            <stop offset="55%" stopColor="#0284C7" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#080E1B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0.5" y="0.5" width="359" height="189" stroke="#1E293B" fill="none" />
        {/* Grid */}
        <line x1="0" y1="95" x2="360" y2="95" stroke="#1E293B" strokeDasharray="3 4" />
        <line x1="180" y1="0" x2="180" y2="190" stroke="#1E293B" strokeDasharray="3 4" />
        {/* Retracted needles */}
        <line x1="36" y1="95" x2="112" y2="95" stroke="#64748B" strokeWidth="3" />
        <polygon points="112,92 124,95 112,98" fill="#94A3B8" />
        <line x1="324" y1="95" x2="248" y2="95" stroke="#64748B" strokeWidth="3" />
        <polygon points="248,92 236,95 248,98" fill="#94A3B8" />
        {/* Diffusion Flame Halo */}
        <circle cx="180" cy="95" r="56" fill="url(#art-flex-glow)" />
        <circle cx="180" cy="95" r="39" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="4 2" opacity="0.9" />
        <circle cx="180" cy="95" r="34" stroke="#67E8F9" strokeWidth="1.2" opacity="0.65" />
        {/* Fuel Droplet */}
        <circle cx="180" cy="95" r="9.5" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="1.2" />
        <text x="16" y="22" fill="#94A3B8" fontSize="10" fontFamily="monospace">CIR / MDCA · 0g NEEDLE-DEPLOYED DROPLET</text>
        <text x="16" y="176" fill="#67E8F9" fontSize="10" fontFamily="monospace">BLUE OH* DIFFUSION SHELL · D0 = 1.6–4.5 mm</text>
      </svg>
    );
  }

  if (variant === 'bass2') {
    return (
      <svg viewBox="0 0 360 190" className="w-full h-44 bg-[#080E1B]" role="img" aria-label="BASS-II flow duct schematic artwork">
        <title>BASS-II Opposed-Flow MSG Duct Schematic</title>
        <rect x="0.5" y="0.5" width="359" height="189" stroke="#1E293B" fill="none" />
        {/* Flow duct walls */}
        <rect x="28" y="42" width="304" height="106" stroke="#334155" strokeWidth="1.5" fill="#0B1324" />
        {/* Radiometer at top right */}
        <rect x="274" y="34" width="34" height="12" fill="#1E293B" stroke="#F59E0B" strokeWidth="1" />
        <text x="234" y="27" fill="#FBBF24" fontSize="9" fontFamily="monospace">RADIOMETER (REL.)</text>
        {/* Opposed air flow arrows */}
        <path d="M 48 76 L 96 76" stroke="#38BDF8" strokeWidth="1.6" />
        <polygon points="96,73 104,76 96,79" fill="#38BDF8" />
        <path d="M 48 114 L 96 114" stroke="#38BDF8" strokeWidth="1.6" />
        <polygon points="96,111 104,114 96,117" fill="#38BDF8" />
        <text x="44" y="64" fill="#38BDF8" fontSize="9" fontFamily="monospace">FLOW 2–21 cm/s</text>
        {/* PMMA Slab */}
        <rect x="135" y="89" width="132" height="12" fill="#475569" stroke="#94A3B8" strokeWidth="1" />
        {/* Opposed flame front */}
        <path d="M 134 95 C 145 72, 195 72, 224 89 L 134 89 Z" fill="#0EA5E9" opacity="0.6" />
        <path d="M 134 95 C 145 118, 195 118, 224 101 L 134 101 Z" fill="#0EA5E9" opacity="0.6" />
        <path d="M 150 90 C 166 79, 194 82, 208 89" stroke="#F59E0B" strokeWidth="2.2" fill="none" />
        <text x="16" y="22" fill="#94A3B8" fontSize="10" fontFamily="monospace">MSG FLOW DUCT · PMMA / SIBAL SPREAD</text>
        <text x="16" y="176" fill="#67E8F9" fontSize="10" fontFamily="monospace">GOLDILOCKS LIMIT: 13.5% O2 AT a = 8–12 s⁻¹</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 360 190" className="w-full h-44 bg-[#080E1B]" role="img" aria-label="SAME-2 aerosol moment diagnostic schematic artwork">
      <title>SAME-2 Smoke Aerosol Aging & Two-Moment Diagnostic Schematic</title>
      <rect x="0.5" y="0.5" width="359" height="189" stroke="#1E293B" fill="none" />
      {/* Heated wire + aging chamber + diagnostic duct */}
      <rect x="26" y="72" width="66" height="46" stroke="#334155" fill="#0B1324" />
      <path d="M 46 95 Q 53 84 60 95 T 74 95" stroke="#F59E0B" strokeWidth="2.2" fill="none" />
      <line x1="92" y1="95" x2="122" y2="95" stroke="#38BDF8" strokeWidth="1.5" />
      <rect x="122" y="54" width="96" height="82" stroke="#334155" fill="#0B1324" />
      {/* Coagulating aerosol dots */}
      <circle cx="144" cy="82" r="2.2" fill="#94A3B8" />
      <circle cx="158" cy="108" r="3" fill="#67E8F9" />
      <circle cx="176" cy="88" r="4.8" fill="#38BDF8" />
      <circle cx="195" cy="106" r="6" fill="#F59E0B" opacity="0.85" />
      <line x1="218" y1="95" x2="246" y2="95" stroke="#38BDF8" strokeWidth="1.5" />
      <rect x="246" y="64" width="88" height="62" stroke="#06B6D4" strokeWidth="1.2" fill="#0B1324" />
      <text x="255" y="84" fill="#67E8F9" fontSize="9" fontFamily="monospace">P-Trak (M0)</text>
      <text x="255" y="100" fill="#94A3B8" fontSize="9" fontFamily="monospace">Ion (M1)</text>
      <text x="255" y="116" fill="#FBBF24" fontSize="9" fontFamily="monospace">MPASS (M2,M3)</text>
      <text x="16" y="22" fill="#94A3B8" fontSize="10" fontFamily="monospace">SAME-2 · AGING 11–1800 s IN MSG</text>
      <text x="16" y="176" fill="#67E8F9" fontSize="10" fontFamily="monospace">AVG DIAMETER 200–400 nm · COAGULATION GROWTH</text>
    </svg>
  );
};
