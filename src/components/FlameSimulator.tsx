import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Flame, Pause, Play, RotateCcw, AlertTriangle } from 'lucide-react';
import { computeQualitativeFlameState } from '../utils/physics';
import type { SimulatorParams } from '../types/combustion';

const DEFAULT_PARAMS: SimulatorParams = {
  gravityG: 0.0,
  oxygenPct: 21.0,
  dropletDiameterMm: 2.5,
  pressureAtm: 1.0,
};

interface CanvasChamberProps {
  title: string;
  subtitle: string;
  gravityG: number;
  oxygenPct: number;
  dropletDiameterMm: number;
  pressureAtm: number;
  isPlaying: boolean;
  accentTone: 'amber' | 'cyan';
}

const FlameChamberCanvas: React.FC<CanvasChamberProps> = ({
  title,
  subtitle,
  gravityG,
  oxygenPct,
  dropletDiameterMm,
  pressureAtm,
  isPlaying,
  accentTone,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const metrics = useMemo(
    () =>
      computeQualitativeFlameState({
        gravityG,
        oxygenPct,
        dropletDiameterMm,
        pressureAtm,
      }),
    [gravityG, oxygenPct, dropletDiameterMm, pressureAtm]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let t = 0;

    const renderFrame = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Dark calibrated instrument chamber background
      ctx.fillStyle = '#060A12';
      ctx.fillRect(0, 0, width, height);

      // Subtle coordinate grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.lineWidth = 1;
      for (let x = 40; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 40; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const cx = width / 2;
      const dropletBaseY = height * (0.52 + 0.16 * metrics.buoyancyPlumeRatio);
      const dropletRadiusPx = 4.5 + (dropletDiameterMm / 4.0) * 11;
      const pulse = isPlaying ? Math.sin(t * 0.08) * 1.4 : 0;
      const flicker = isPlaying ? Math.sin(t * 0.19) * 3.2 * metrics.buoyancyPlumeRatio : 0;

      // Flame geometry scales with droplet radius, standoff, and buoyancy elongation
      const baseFlameRx = dropletRadiusPx * metrics.relativeFlameStandoff * 0.78 + pulse;
      const upwardStretch = 1 + metrics.buoyancyPlumeRatio * 1.65;
      const flameRy = baseFlameRx * upwardStretch;

      // Buoyant convection arrows when gravity > 0.03g
      if (gravityG >= 0.03) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.lineWidth = 1.2;
        [-48, 48].forEach((dx) => {
          const arrowYOffset = isPlaying ? ((t * 1.2 * metrics.buoyancyPlumeRatio) % 24) : 0;
          const yStart = dropletBaseY + 34 - arrowYOffset;
          const yEnd = yStart - 28 - 22 * metrics.buoyancyPlumeRatio;
          ctx.beginPath();
          ctx.moveTo(cx + dx, yStart);
          ctx.lineTo(cx + dx, yEnd);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + dx - 3, yEnd + 5);
          ctx.lineTo(cx + dx, yEnd);
          ctx.lineTo(cx + dx + 3, yEnd + 5);
          ctx.stroke();
        });
      } else {
        // Radial diffusion arrows in 0g
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1.1;
        for (let a = 0; a < 8; a++) {
          const angle = (a * Math.PI) / 4;
          const r1 = baseFlameRx + 24;
          const r2 = baseFlameRx + 9;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * r1, dropletBaseY + Math.sin(angle) * r1);
          ctx.lineTo(cx + Math.cos(angle) * r2, dropletBaseY + Math.sin(angle) * r2);
          ctx.stroke();
        }
      }

      // Outer Blue Chemiluminescence Diffusion Zone
      ctx.save();
      const outerCy = dropletBaseY - metrics.buoyancyPlumeRatio * flameRy * 0.44;
      const outerGrad = ctx.createRadialGradient(
        cx,
        dropletBaseY - metrics.buoyancyPlumeRatio * 12,
        dropletRadiusPx * 0.8,
        cx,
        outerCy,
        flameRy * 1.15
      );
      outerGrad.addColorStop(0, 'rgba(56, 189, 248, 0.52)');
      outerGrad.addColorStop(0.55, 'rgba(14, 165, 233, 0.28)');
      outerGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      if (metrics.buoyancyPlumeRatio < 0.08) {
        ctx.arc(cx, dropletBaseY, baseFlameRx + 10, 0, Math.PI * 2);
      } else {
        // Teardrop buoyant outer envelope
        ctx.moveTo(cx, dropletBaseY + baseFlameRx * 0.72);
        ctx.bezierCurveTo(
          cx + baseFlameRx * 1.28,
          dropletBaseY + baseFlameRx * 0.45,
          cx + baseFlameRx * 0.85,
          dropletBaseY - flameRy * 0.65,
          cx + flicker,
          dropletBaseY - flameRy * 1.38
        );
        ctx.bezierCurveTo(
          cx - baseFlameRx * 0.85,
          dropletBaseY - flameRy * 0.65,
          cx - baseFlameRx * 1.28,
          dropletBaseY + baseFlameRx * 0.45,
          cx,
          dropletBaseY + baseFlameRx * 0.72
        );
      }
      ctx.fill();
      ctx.restore();

      // Inner Soot / Yellow-Amber Radiative Zone (scales with sootLuminosityIndex)
      if (metrics.sootLuminosityIndex > 0.16) {
        ctx.save();
        const sootAlpha = Math.min(0.92, metrics.sootLuminosityIndex * 0.98);
        const innerRx = baseFlameRx * 0.66;
        const innerRy = flameRy * 0.92;
        const sootGrad = ctx.createRadialGradient(
          cx,
          dropletBaseY - metrics.buoyancyPlumeRatio * innerRy * 0.3,
          2,
          cx,
          dropletBaseY - metrics.buoyancyPlumeRatio * innerRy * 0.45,
          innerRy
        );
        sootGrad.addColorStop(0, `rgba(254, 243, 199, ${sootAlpha})`);
        sootGrad.addColorStop(0.45, `rgba(245, 158, 11, ${sootAlpha * 0.88})`);
        sootGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');

        ctx.fillStyle = sootGrad;
        ctx.beginPath();
        if (metrics.buoyancyPlumeRatio < 0.08) {
          ctx.arc(cx, dropletBaseY, innerRx, 0, Math.PI * 2);
        } else {
          ctx.moveTo(cx, dropletBaseY + innerRx * 0.45);
          ctx.bezierCurveTo(
            cx + innerRx * 1.08,
            dropletBaseY + innerRx * 0.2,
            cx + innerRx * 0.62,
            dropletBaseY - innerRy * 0.62,
            cx + flicker * 0.8,
            dropletBaseY - innerRy * 1.25
          );
          ctx.bezierCurveTo(
            cx - innerRx * 0.62,
            dropletBaseY - innerRy * 0.62,
            cx - innerRx * 1.08,
            dropletBaseY + innerRx * 0.2,
            cx,
            dropletBaseY + innerRx * 0.45
          );
        }
        ctx.fill();
        ctx.restore();
      }

      // Crisp Blue Reaction Shell Ring in Low-g
      if (metrics.buoyancyPlumeRatio < 0.45) {
        ctx.strokeStyle = `rgba(103, 232, 249, ${0.85 - metrics.buoyancyPlumeRatio * 1.4})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          dropletBaseY - metrics.buoyancyPlumeRatio * 12,
          baseFlameRx * 0.88,
          baseFlameRx * 0.88 * (1 + metrics.buoyancyPlumeRatio * 0.45),
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Support fiber / needle guide in 1g or droplet center
      if (gravityG > 0.05) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, dropletBaseY + dropletRadiusPx);
        ctx.lineTo(cx, height - 16);
        ctx.stroke();
      }

      // Liquid Fuel Droplet
      const dropGrad = ctx.createRadialGradient(
        cx - dropletRadiusPx * 0.3,
        dropletBaseY - dropletRadiusPx * 0.3,
        1,
        cx,
        dropletBaseY,
        dropletRadiusPx
      );
      dropGrad.addColorStop(0, '#FEF3C7');
      dropGrad.addColorStop(0.65, '#F59E0B');
      dropGrad.addColorStop(1, '#92400E');
      ctx.fillStyle = dropGrad;
      ctx.beginPath();
      ctx.arc(cx, dropletBaseY, dropletRadiusPx, 0, Math.PI * 2);
      ctx.fill();

      // HUD telemetry overlay inside canvas
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`g = ${gravityG.toFixed(2)}g`, 12, 20);
      ctx.fillText(`D0 = ${dropletDiameterMm.toFixed(1)} mm`, 12, 36);
      ctx.fillText(`O2 = ${oxygenPct.toFixed(1)}% · P = ${pressureAtm.toFixed(2)} atm`, 12, height - 12);

      if (isPlaying) {
        t += 1;
        animId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();
    return () => cancelAnimationFrame(animId);
  }, [gravityG, oxygenPct, dropletDiameterMm, pressureAtm, isPlaying, metrics]);

  return (
    <div className="border border-slate-800 bg-[#0B1120] flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 px-3.5 py-2.5">
        <div>
          <div
            className={`font-display text-sm sm:text-base font-semibold ${
              accentTone === 'amber' ? 'text-amber-300' : 'text-cyan-300'
            }`}
          >
            {title}
          </div>
          <div className="font-mono text-xs text-slate-300">{subtitle}</div>
        </div>
        <span className="font-mono text-xs font-semibold tabular-nums text-slate-200 shrink-0 ml-2">
          {gravityG.toFixed(2)} g
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={380}
        height={290}
        className="w-full h-auto block cursor-crosshair"
        aria-label={`${title} animated canvas simulation`}
      />
      <div className="border-t border-slate-800 px-3.5 py-2.5 font-mono text-xs text-slate-200 flex items-center justify-between gap-2">
        <span className="truncate">{metrics.regimeLabel}</span>
        <span className="tabular-nums text-slate-300 shrink-0">
          Standoff ~{metrics.relativeFlameStandoff}r
        </span>
      </div>
    </div>
  );
};

const MISSION_PRESETS: Array<{
  id: string;
  label: string;
  params: SimulatorParams;
}> = [
  {
    id: 'iss-nominal',
    label: 'ISS Nominal (0g, 21% O2)',
    params: { gravityG: 0.0, oxygenPct: 21.0, dropletDiameterMm: 2.5, pressureAtm: 1.0 },
  },
  {
    id: 'lunar-cabin',
    label: 'Lunar Exploration Cabin (0.16g, 26.5% O2)',
    params: { gravityG: 0.16, oxygenPct: 26.5, dropletDiameterMm: 2.5, pressureAtm: 1.0 },
  },
  {
    id: 'near-limit',
    label: 'Near-Limit Dilution (0g, 14.5% O2)',
    params: { gravityG: 0.0, oxygenPct: 14.5, dropletDiameterMm: 2.5, pressureAtm: 1.0 },
  },
];

export const FlameSimulator: React.FC = () => {
  const [params, setParams] = useState<SimulatorParams>(DEFAULT_PARAMS);
  const [isPlaying, setIsPlaying] = useState(true);

  const metrics = useMemo(() => computeQualitativeFlameState(params), [params]);

  const updateParam = <K extends keyof SimulatorParams>(key: K, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section id="simulator" className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="border border-slate-800 bg-[#0B1120]">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-amber-400" aria-hidden="true" />
            <div>
              <h2 className="font-display text-xl font-bold text-slate-50">
                1. 1g vs 0g Flame Simulator
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Side-by-side HTML5 Canvas comparison of buoyant terrestrial combustion vs. spherical
                microgravity diffusion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-xs uppercase text-slate-200 hover:border-cyan-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              type="button"
              onClick={() => setParams(DEFAULT_PARAMS)}
              className="inline-flex items-center gap-1.5 border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-xs uppercase text-slate-200 hover:border-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Mandatory Illustrative Qualitative Model Disclaimer */}
        <div
          role="note"
          className="flex items-start gap-2.5 border-b border-amber-500/30 bg-amber-950/25 px-5 py-3 text-xs sm:text-sm text-amber-200"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" aria-hidden="true" />
          <span>
            <strong>Illustrative Qualitative Model:</strong> This interactive visualizer demonstrates
            qualitative buoyancy-versus-diffusion physics (elongation, soot luminosity trend, and
            relative standoff). It is <strong>not</strong> a validated predictive CFD, kinetic, or
            certified safety solver.
          </span>
        </div>

        {/* Asymmetric Split Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Control Column */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 p-5 space-y-5 bg-[#090E1A]">
            {/* One-Click Mission Scenario Presets */}
            <div className="border-b border-slate-800 pb-4">
              <div className="font-mono text-xs uppercase tracking-wider text-amber-300 mb-2">
                Mission Scenario Presets
              </div>
              <div className="grid grid-cols-1 gap-2">
                {MISSION_PRESETS.map((preset) => {
                  const isActive =
                    Math.abs(params.gravityG - preset.params.gravityG) < 0.005 &&
                    Math.abs(params.oxygenPct - preset.params.oxygenPct) < 0.1;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setParams(preset.params)}
                      className={`border px-3 py-2 text-left font-mono text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                        isActive
                          ? 'border-amber-400 bg-amber-950/40 text-amber-200'
                          : 'border-slate-800 bg-slate-900 text-slate-200 hover:border-cyan-500/60 hover:text-slate-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gravity Control */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="sim-gravity" className="text-xs font-semibold uppercase tracking-wider text-slate-100">
                  Gravity Acceleration
                </label>
                <span className="font-mono text-sm font-semibold tabular-nums text-cyan-300">
                  {params.gravityG.toFixed(2)} g
                </span>
              </div>
              <input
                id="sim-gravity"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={params.gravityG}
                onChange={(e) => updateParam('gravityG', Number(e.target.value))}
                className="telemetry-slider mt-2.5 w-full"
              />
              <div className="mt-1.5 flex justify-between font-mono text-xs text-slate-300">
                <span>0.00 g (Freefall)</span>
                <span>1.00 g (Earth)</span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { label: '0g ISS', val: 0.0 },
                  { label: '0.16g Moon', val: 0.16 },
                  { label: '0.38g Mars', val: 0.38 },
                  { label: '1.0g Earth', val: 1.0 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => updateParam('gravityG', preset.val)}
                    className={`border py-1.5 font-mono text-[11px] transition-colors ${
                      Math.abs(params.gravityG - preset.val) < 0.015
                        ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Oxygen Control */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="sim-oxygen" className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Ambient Oxygen (O₂)
                </label>
                <span className="font-mono text-sm font-semibold tabular-nums text-cyan-300">
                  {params.oxygenPct.toFixed(1)} %
                </span>
              </div>
              <input
                id="sim-oxygen"
                type="range"
                min={13.5}
                max={30}
                step={0.5}
                value={params.oxygenPct}
                onChange={(e) => updateParam('oxygenPct', Number(e.target.value))}
                className="telemetry-slider mt-2 w-full"
              />
              <div className="mt-1.5 flex justify-between font-mono text-xs text-slate-300">
                <span>13.5 % O₂</span>
                <span>21.0 % Air</span>
                <span>30.0 % O₂</span>
              </div>
            </div>

            {/* Droplet Diameter Control */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="sim-diameter" className="text-xs font-semibold uppercase tracking-wider text-slate-100">
                  Droplet Diameter (D₀)
                </label>
                <span className="font-mono text-sm font-semibold tabular-nums text-amber-300">
                  {params.dropletDiameterMm.toFixed(1)} mm
                </span>
              </div>
              <input
                id="sim-diameter"
                type="range"
                min={0.5}
                max={4.0}
                step={0.1}
                value={params.dropletDiameterMm}
                onChange={(e) => updateParam('dropletDiameterMm', Number(e.target.value))}
                className="telemetry-slider mt-2.5 w-full"
              />
              <div className="mt-1.5 flex justify-between font-mono text-xs text-slate-300">
                <span>0.5 mm</span>
                <span>4.0 mm</span>
              </div>
            </div>

            {/* Ambient Pressure Control */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="sim-pressure" className="text-xs font-semibold uppercase tracking-wider text-slate-100">
                  Ambient Pressure
                </label>
                <span className="font-mono text-sm font-semibold tabular-nums text-amber-300">
                  {params.pressureAtm.toFixed(2)} atm
                </span>
              </div>
              <input
                id="sim-pressure"
                type="range"
                min={0.5}
                max={3.05}
                step={0.05}
                value={params.pressureAtm}
                onChange={(e) => updateParam('pressureAtm', Number(e.target.value))}
                className="telemetry-slider mt-2.5 w-full"
              />
              <div className="mt-1.5 flex justify-between font-mono text-xs text-slate-300">
                <span>0.50 atm (50.7 kPa)</span>
                <span>3.05 atm (FLEX max)</span>
              </div>
            </div>

            {/* Qualitative Output Readout */}
            <div className="border-t border-slate-800 pt-4 grid grid-cols-2 gap-3">
              <div>
                <div className="font-mono text-xs uppercase text-slate-300">Qual. Burn Scale</div>
                <div className="font-mono text-base font-semibold tabular-nums text-slate-50">
                  {metrics.qualitativeBurnRateScale.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-300">mm²/s (rel)</span>
                </div>
              </div>
              <div>
                <div className="font-mono text-xs uppercase text-slate-300">Soot Luminosity</div>
                <div className="font-mono text-base font-semibold tabular-nums text-amber-300">
                  {(metrics.sootLuminosityIndex * 100).toFixed(0)}{' '}
                  <span className="text-xs font-normal text-slate-300">% index</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Comparative Canvas Stage */}
          <div className="lg:col-span-8 p-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FlameChamberCanvas
              title="Reference 1g Buoyant Flame"
              subtitle="Fixed 1.00 g · Buoyancy drives upward plume"
              gravityG={1.0}
              oxygenPct={params.oxygenPct}
              dropletDiameterMm={params.dropletDiameterMm}
              pressureAtm={params.pressureAtm}
              isPlaying={isPlaying}
              accentTone="amber"
            />
            <FlameChamberCanvas
              title={
                params.gravityG < 0.02
                  ? '0g Diffusion Flame (Interactive)'
                  : `Interactive ${params.gravityG.toFixed(2)}g Flame`
              }
              subtitle="Controlled by gravity slider · Diffusion vs. convection"
              gravityG={params.gravityG}
              oxygenPct={params.oxygenPct}
              dropletDiameterMm={params.dropletDiameterMm}
              pressureAtm={params.pressureAtm}
              isPlaying={isPlaying}
              accentTone="cyan"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
