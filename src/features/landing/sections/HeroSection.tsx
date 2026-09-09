import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useArea, useQuantities } from '../../../store/useCalculationStore';
import { Architectural3DViewer } from '../../../components/3d/Architectural3DViewer';

const PRESET_PLOTS = [
  { label: "30' × 40'", length: 40, width: 30, desc: '1,200 sq.ft' },
  { label: "30' × 50'", length: 50, width: 30, desc: '1,500 sq.ft' },
  { label: "40' × 60'", length: 60, width: 40, desc: '2,400 sq.ft' },
  { label: "50' × 80'", length: 80, width: 50, desc: '4,000 sq.ft' },
];

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const store = useWizardStore();
  const { plotLength, plotWidth, floors, houseType, setPlotDimensions, setHouseConfig, setSelectedPackage } = store;
  const area = useArea();
  const quantities = useQuantities();

  const [activePlotIdx, setActivePlotIdx] = useState(0);
  const [selectedFloorCount, setSelectedFloorCount] = useState(floors || 2);
  const buaSqFt = area.totalBUASqFt || 1440;

  // Scroll parallax for hero 3D viewer
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.96]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0.9]);

  const handleSelectPlot = (idx: number) => {
    setActivePlotIdx(idx);
    const p = PRESET_PLOTS[idx];
    setPlotDimensions(p.length, p.width);
  };

  const handleSelectFloor = (f: number) => {
    setSelectedFloorCount(f);
    setHouseConfig(houseType || 'Duplex', f);
  };

  const handleStartEstimate = (pkgId: 'STANDARD' | 'PREMIUM' | 'LUXURY' = 'PREMIUM') => {
    setSelectedPackage(pkgId, true);
    navigate('/calculator');
  };

  return (
    <section className="relative bg-[#F8F8F6] min-h-[92vh] flex items-center pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden border-b border-[#E5E7EB]">
      {/* Subtle Architectural Blueprint Grid Background */}
      <div className="absolute inset-0 pointer-events-none arch-grid-bg opacity-45" />

      {/* Subtle Construction Technical Coordinates */}
      <div className="absolute inset-0 pointer-events-none max-w-7xl mx-auto px-4 hidden lg:block opacity-35">
        <div className="absolute top-10 left-6 text-[9px] font-mono font-bold text-[#1B3D34]">
          COORD: 12.9716° N, 77.5946° E &bull; BBMP ZONE II
        </div>
        <div className="absolute top-10 right-6 text-[9px] font-mono font-bold text-[#1B3D34]">
          IS 456:2000 &bull; IS 1786 Fe 550D
        </div>
        <div className="absolute bottom-8 left-6 text-[9px] font-mono font-bold text-[#1B3D34]">
          DATUM 0.000 &bull; PLINTH BEAM +0.60m
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ── LEFT (col-span-12 lg:col-span-5): Headline & Hero Copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#1B3D34] bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/20 px-3.5 py-1.5 rounded-full shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#F28C28] animate-pulse" />
              <span>DIGITAL QUANTITY SURVEYOR &bull; BANGALORE</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="heading-display text-4xl sm:text-5xl lg:text-[3.35rem] leading-[1.06] text-[#1B3D34] font-black tracking-tight">
                Build your home <br />
                with total clarity.
              </h1>
              <p className="text-sm sm:text-base text-[#4B5563] font-normal leading-relaxed max-w-md">
                Plan your plot, spaces, construction standards and exact itemized bill of quantities before you break ground. Quantity-first, formula-driven, bank-ready.
              </p>
            </div>

            {/* Quick Interactive Plot Dimension Selectors */}
            <div className="p-3.5 bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563]">
                  Select Plot Size:
                </span>
                <span className="text-[10px] font-mono font-bold text-[#F28C28]">
                  {PRESET_PLOTS[activePlotIdx].desc}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_PLOTS.map((plot, i) => (
                  <button
                    key={plot.label}
                    type="button"
                    onClick={() => handleSelectPlot(i)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      activePlotIdx === i
                        ? 'bg-[#1B3D34] text-white shadow-xs'
                        : 'bg-[#F8F8F6] text-[#4B5563] border border-[#E5E7EB] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    {plot.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563]">
                  Floors:
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((fl) => (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => handleSelectFloor(fl)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedFloorCount === fl
                          ? 'bg-[#F28C28] text-[#1B3D34] shadow-xs'
                          : 'bg-[#F8F8F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                      }`}
                    >
                      {fl === 1 ? 'Ground' : `G+${fl - 1}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleStartEstimate('PREMIUM')}
                className="hutty-btn-primary text-xs sm:text-sm font-bold px-7 py-3.5 rounded-xl shadow-xs cursor-pointer"
              >
                <span>Choose Package &amp; Start</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  document.querySelector('#packages')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hutty-btn-secondary text-xs sm:text-sm font-semibold px-5 py-3.5 rounded-xl cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#1B3D34]" />
                <span>Explore 3 Standards</span>
              </button>
            </div>

            {/* Proof Points */}
            <div className="pt-3 border-t border-[#E5E7EB] grid grid-cols-3 gap-2 text-left">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                <span className="text-[11px] font-semibold text-[#4B5563]">BBMP Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                <span className="text-[11px] font-semibold text-[#4B5563]">Steel &amp; Cement BOQ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                <span className="text-[11px] font-semibold text-[#4B5563]">Zero Multipliers</span>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT (col-span-12 lg:col-span-7): INTERACTIVE 3D MODEL & TAKEOFF ANNOTATIONS ── */}
          <motion.div
            style={{ scale: heroScale, opacity: heroOpacity }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative"
          >
            <div className="relative bg-white rounded-2xl border border-[#E5E7EB] p-3.5 sm:p-4 shadow-sm tactile-card">
              
              {/* Architectural Technical Bar */}
              <div className="px-3 py-2 flex items-center justify-between border-b border-[#E5E7EB] mb-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1B3D34] animate-pulse" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1B3D34]">
                    LIVE CANONICAL 3D RECONSTRUCTION
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#4B5563] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                    {plotWidth || 30}' × {plotLength || 40}' PLOT
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded border border-[#1B3D34]/15">
                    {selectedFloorCount === 1 ? 'GROUND' : `G+${selectedFloorCount - 1}`}
                  </span>
                </div>
              </div>

              {/* 3D Model Viewport Area */}
              <div className="relative w-full h-80 sm:h-96 lg:h-[420px] xl:h-[460px] rounded-xl overflow-hidden bg-[#112821]">
                <Architectural3DViewer
                  plotLength={plotLength || 40}
                  plotWidth={plotWidth || 30}
                  floors={selectedFloorCount || 2}
                  className="w-full h-full"
                />
              </div>

              {/* Bottom Quick Metrics Strip */}
              <div className="mt-3 grid grid-cols-3 gap-2 px-1 pb-1">
                <div className="bg-[#F8F8F6] p-2.5 rounded-xl border border-[#E5E7EB] text-left">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block">
                    TOTAL BUA
                  </span>
                  <span className="text-sm font-extrabold text-[#1B3D34] block font-heading tabular-nums">
                    {buaSqFt.toLocaleString()} sq.ft
                  </span>
                </div>

                <div className="bg-[#F8F8F6] p-2.5 rounded-xl border border-[#E5E7EB] text-left">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block">
                    STRUCTURAL STEEL
                  </span>
                  <span className="text-sm font-extrabold text-[#1B3D34] block font-heading tabular-nums">
                    {quantities.steelTonnes || 4.32} Tonnes
                  </span>
                </div>

                <div className="bg-[#F8F8F6] p-2.5 rounded-xl border border-[#E5E7EB] text-left">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block">
                    BOQ HEADS
                  </span>
                  <span className="text-sm font-extrabold text-[#1B3D34] block font-heading">
                    13 Trade Heads
                  </span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
