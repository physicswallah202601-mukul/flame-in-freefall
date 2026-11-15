import React, { useState } from 'react';
import { Compass, Flame, ShieldAlert, Cpu } from 'lucide-react';

interface GravityScenario {
  id: 'iss' | 'lunar' | 'martian';
  name: string;
  gravityLabel: string;
  buoyancyScale: string;
  flameMorphology: string;
  ventilationSensitivity: string;
  detectionChallenge: string;
}

const SCENARIOS: GravityScenario[] = [
  {
    id: 'iss',
    name: 'ISS Orbital Freefall',
    gravityLabel: '0g (~10⁻⁶ g)',
    buoyancyScale: 'Negligible natural convection; mass transport dominated by diffusion & cabin HVAC',
    flameMorphology:
      'Spherical droplet flames (FLEX) and dim blue opposed-flow flames near extinction; higher residence time cools flames via radiation.',
    ventilationSensitivity:
      'BASS-II mapped a "Goldilocks" flammability zone (stretch a = 8–12 s⁻¹, typical of spacecraft ventilation) where PMMA sustained burning down to ~13.5% O₂—lower than the 15.4% O₂ 1g upward limit.',
    detectionChallenge:
      'SAME-2 found low/zero-flow smoke coagulates into 2–3× larger aerosols (30–40% larger mass-mean diameter at zero flow), spanning sub-micron ionization sensitivity and micron light-scattering regimes.',
  },
  {
    id: 'lunar',
    name: 'Lunar Surface Habitat',
    gravityLabel: '0.16 g (1/6 Earth g)',
    buoyancyScale: 'Weak buoyant plume (~40% characteristic convective velocity scaling of 1g)',
    flameMorphology:
      'Slightly elongated teardrop or tilted flame sheet rather than pure sphere; hot combustion products still linger longer near fuel surfaces than on Earth.',
    ventilationSensitivity:
      'Weak natural convection can combine with forced habitat ventilation to create transitional low-stretch regimes similar to microgravity low-flow boundaries.',
    detectionChallenge:
      'Reduced buoyant plume rise slows smoke arrival at ceiling-mounted detectors compared to 1g, while lunar dust background motivates multi-moment size discrimination (SAME-2 MPASS concept).',
  },
  {
    id: 'martian',
    name: 'Martian Surface Habitat',
    gravityLabel: '0.38 g (~3/8 Earth g)',
    buoyancyScale: 'Moderate buoyancy (~62% convective velocity scaling vs 1g, still below terrestrial vigor)',
    flameMorphology:
      'Recognizable upward buoyant plume with narrower boundary layer than 0g, yet radiative losses and oxygen diffusion remain more influential than in 1g Earth air.',
    ventilationSensitivity:
      'Higher partial gravity increases convective oxygen supply relative to 0g/0.16g while still altering flame-spread and blowoff thresholds relative to standard 1g material screening.',
    detectionChallenge:
      'Plume stratification differs from Earth rooms; combined thermal/optical multi-moment sensing helps distinguish pyrolysis smoke from Martian mineral dust.',
  },
];

export const GravityAndEngines: React.FC = () => {
  const [selectedId, setSelectedId] = useState<'iss' | 'lunar' | 'martian'>('iss');
  const active = SCENARIOS.find((s) => s.id === selectedId) ?? SCENARIOS[0];

  return (
    <section id="safety" className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="border border-slate-800 bg-[#0B1120]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <Compass className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            <div>
              <h2 className="font-display text-xl font-bold text-slate-50">
                3. Fire Safety and Earth Engines
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Qualitative partial-gravity fire behavior (0g, 0.16g, 0.38g) and terrestrial
                combustion modeling relevance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Select gravity environment">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={`border px-3 py-2 font-mono text-xs uppercase transition-colors ${
                  selectedId === s.id
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100'
                }`}
              >
                {s.gravityLabel.split(' ')[0]} · {s.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Non-operational Disclaimer */}
        <div className="flex items-start gap-2.5 border-b border-slate-800 bg-[#090E1A] px-5 py-3 text-xs sm:text-sm text-slate-200">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" aria-hidden="true" />
          <span>
            <strong>Scientific Overview Only:</strong> Qualitative summaries below synthesize open
            NASA FLEX, BASS-II, SAME-2, SAFFIRE-II, and PSI-62 literature. They do <strong>not</strong>{' '}
            constitute certified spacecraft fire-safety rules or operational emergency instructions.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Gravity Scenario Comparison */}
          <div className="lg:col-span-7 p-5 border-b lg:border-b-0 lg:border-r border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SCENARIOS.map((s) => {
                const isSelected = s.id === selectedId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedId(s.id)}
                    className={`text-left border p-3.5 transition-colors ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/25'
                        : 'border-slate-800 bg-[#070B14] hover:border-slate-700'
                    }`}
                  >
                    <div className="font-mono text-xs uppercase text-cyan-300">{s.gravityLabel}</div>
                    <div className="mt-1 font-display text-sm font-semibold text-slate-100">
                      {s.name}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border border-slate-800 bg-[#070B14] p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="font-display text-base font-semibold text-slate-50">
                  {active.name} ({active.gravityLabel})
                </span>
                <Flame className="h-4 w-4 text-amber-400" aria-hidden="true" />
              </div>
              <div>
                <div className="font-mono text-xs uppercase text-cyan-300">
                  Buoyant Flow vs. Diffusion
                </div>
                <p className="mt-1 text-slate-200 leading-relaxed">{active.buoyancyScale}</p>
              </div>
              <div>
                <div className="font-mono text-xs uppercase text-cyan-300">
                  Qualitative Flame Behavior
                </div>
                <p className="mt-1 text-slate-200 leading-relaxed">{active.flameMorphology}</p>
              </div>
              <div>
                <div className="font-mono text-xs uppercase text-cyan-300">
                  Ventilation & Flammability Context
                </div>
                <p className="mt-1 text-slate-200 leading-relaxed">{active.ventilationSensitivity}</p>
              </div>
              <div>
                <div className="font-mono text-xs uppercase text-cyan-300">
                  Fire-Detection Implications (SAME-2)
                </div>
                <p className="mt-1 text-slate-200 leading-relaxed">{active.detectionChallenge}</p>
              </div>
            </div>
          </div>

          {/* Earth Clean-Engine Research Relevance */}
          <div className="lg:col-span-5 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <h3 className="font-display text-base font-semibold text-slate-50">
                Terrestrial & Clean-Engine Research Relevance
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Eliminating buoyant convection in orbital experiments removes three-dimensional flow
              distortion, giving combustion researchers a cleaner benchmark to isolate chemical
              kinetics, fuel evaporation, and radiative transport.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="border border-slate-800 bg-[#070B14] p-3.5">
                <div className="font-mono text-xs uppercase text-cyan-300">
                  1D Spherical Kinetic Validation (FLEX)
                </div>
                <p className="mt-1 text-slate-200 leading-relaxed">
                  Millimeter-scale isolated droplets in 0g burn with near-spherical symmetry, enabling
                  direct comparison with 1D transient chemical-kinetic and radiation models across
                  N₂, CO₂, and He dilution (0.70–3.05 atm).
                </p>
              </li>
              <li className="border border-slate-800 bg-[#070B14] p-3.5">
                <div className="font-mono text-xs uppercase text-cyan-300">
                  Low-Temperature & Cool-Flame Regimes
                </div>
                <p className="mt-1 text-slate-200 leading-relaxed">
                  Longer residence times in microgravity reveal radiative extinction and dual-stage
                  low-temperature oxidation behavior relevant to studying lean, low-soot combustion
                  chemistry in laboratory burners.
                </p>
              </li>
              <li className="border border-slate-800 bg-[#070B14] p-3.5">
                <div className="font-mono text-xs uppercase text-cyan-300">
                  Subgrid Manifold Modeling (PSI-62 UFGM)
                </div>
                <p className="mt-1 text-slate-200 leading-relaxed">
                  Unsteady Flamelet Generated Manifold (UFGM) reductions benchmarked against BASS
                  data help refine LES subgrid models for coupled fluid–solid heating and soot
                  formation—informing fundamental modeling research without guaranteeing specific
                  commercial engine performance outcomes.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
