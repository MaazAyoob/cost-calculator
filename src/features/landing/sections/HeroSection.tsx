import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Compass,
} from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useArea, useQuantities, useBudgetResult } from '../../../store/useCalculationStore';
import { Architectural3DViewer } from '../../../components/3d/Architectural3DViewer';
import { formatCurrency } from '../../../utils/cn';

const PRESET_PLOTS = [
  { label: "30' × 40'", length: 40, width: 30, desc: '1,200 sq.ft Plot', baseBua: 1920 },
  { label: "30' × 50'", length: 50, width: 30, desc: '1,500 sq.ft Plot', baseBua: 2400 },
  { label: "40' × 60'", length: 60, width: 40, desc: '2,400 sq.ft Plot', baseBua: 3840 },
  { label: "50' × 80'", length: 80, width: 50, desc: '4,000 sq.ft Plot', baseBua: 6400 },
];

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const store = useWizardStore();
  const { plotLength, plotWidth, floors, houseType, setPlotDimensions, setHouseConfig, setSelectedPackage } = store;
  const area = useArea();
  const quantities = useQuantities();
  const budget = useBudgetResult();

  const [activePlotIdx, setActivePlotIdx] = useState(1); // default 30x50
  const [selectedFloorCount, setSelectedFloorCount] = useState(floors || 3); // G+2
  const buaSqFt = area.totalBUASqFt || PRESET_PLOTS[activePlotIdx].baseBua;
  const steelTonnes = quantities.steelTonnes || Number(((buaSqFt * 3.6) / 1000).toFixed(2));
  const cementBags = quantities.cementBags || Math.round(buaSqFt * 0.45);
  const totalCost = budget.totalProjectCost || Math.round(buaSqFt * 1867);

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
    <section className="relative bg-[#F8F8F6] min-h-[90vh] flex items-center pt-8 pb-16 lg:pt-14 lg:pb-20 overflow-hidden border-b border-[#E5E7EB]">
      {/* Subtle Architectural Blueprint Grid Background */}
      <div className="absolute inset-0 pointer-events-none arch-grid-bg opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ── LEFT (col-span-12 lg:col-span-5): Editorial Architectural Statement ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            {/* Architectural Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/10 text-xs font-semibold text-[#1B3D34]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28]" />
              <span>Residential Cost Calculator &bull; Bangalore</span>
            </div>

            {/* Editorial Heading with Scale Contrast */}
            <div className="space-y-4">
              <h1 className="heading-display text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.03] text-[#1B3D34] font-black tracking-tight">
                Build with <br />
                <span className="text-[#1B3D34] underline decoration-[#F28C28] decoration-4 underline-offset-8">mathematical</span> <br />
                clarity.
              </h1>
              <p className="body-lg text-[#4B5563] font-normal leading-relaxed max-w-md">
                From raw plot dimensions to verified steel and cement quantities, estimate your entire construction budget before you break ground.
              </p>
            </div>

            {/* Interactive Dimensional Controller */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                  Select Plot Size
                </span>
                <span className="text-xs font-bold text-[#F28C28]">
                  {PRESET_PLOTS[activePlotIdx].desc}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {PRESET_PLOTS.map((plot, i) => (
                  <button
                    key={plot.label}
                    type="button"
                    onClick={() => handleSelectPlot(i)}
                    className={`py-2 px-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ease-out active:scale-95 cursor-pointer text-center select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34] ${
                      activePlotIdx === i
                        ? 'bg-[#1B3D34] text-white shadow-xs'
                        : 'bg-[#F8F8F6] text-[#4B5563] border border-[#E5E7EB] hover:bg-[#E5E7EB] hover:text-[#1B3D34]'
                    }`}
                  >
                    {plot.label}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                  Floors
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((fl) => (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => handleSelectFloor(fl)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ease-out active:scale-95 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34] ${
                        selectedFloorCount === fl
                          ? 'bg-[#1B3D34] text-white shadow-xs'
                          : 'bg-[#F8F8F6] text-[#4B5563] hover:bg-[#E5E7EB] hover:text-[#1B3D34]'
                      }`}
                    >
                      {fl === 1 ? 'Ground' : `G+${fl - 1}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleStartEstimate('PREMIUM')}
                className="hutty-btn-primary text-sm font-bold px-7 py-3.5 rounded-xl shadow-xs cursor-pointer min-h-[48px]"
              >
                <span>Start Free Estimate</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/consult')}
                className="hutty-btn-secondary text-sm font-semibold px-5 py-3.5 rounded-xl cursor-pointer min-h-[48px]"
              >
                <Compass className="w-4 h-4 text-[#1B3D34]" />
                <span>Consult an Expert (₹1,499)</span>
              </button>
            </div>
          </motion.div>

          {/* ── RIGHT (col-span-12 lg:col-span-7): Architectural Visualization & Data Display ── */}
          <motion.div
            style={{ scale: heroScale, opacity: heroOpacity }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative"
          >
            <div className="relative bg-white rounded-3xl border border-[#E5E7EB] p-4 sm:p-5 shadow-sm">
              
              {/* Product Header Bar */}
              <div className="px-3 py-2.5 flex items-center justify-between border-b border-[#E5E7EB] mb-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1B3D34]" />
                  <span className="text-xs font-bold text-[#1B3D34]">
                    3D Architectural Model &bull; {plotWidth || 30}' × {plotLength || 50}'
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#4B5563] bg-[#F8F8F6] px-2.5 py-1 rounded-lg border border-[#E5E7EB]">
                    {selectedFloorCount === 1 ? 'Ground Floor' : `G+${selectedFloorCount - 1} Duplex`}
                  </span>
                  <span className="text-xs font-semibold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2.5 py-1 rounded-lg border border-[#1B3D34]/15">
                    {buaSqFt.toLocaleString()} sq.ft BUA
                  </span>
                </div>
              </div>

              {/* 3D Model Viewport */}
              <div className="relative w-full h-80 sm:h-96 lg:h-[440px] rounded-2xl overflow-hidden bg-[#112821] border border-[#1B3D34]/20 shadow-inner">
                <Architectural3DViewer
                  plotLength={plotLength || 50}
                  plotWidth={plotWidth || 30}
                  floors={selectedFloorCount || 3}
                  className="w-full h-full"
                />

                {/* Floating Clean Cost Card in 3D canvas */}
                <div className="absolute top-3 left-3 pointer-events-none bg-[#112821]/90 backdrop-blur-md border border-white/15 px-3.5 py-2.5 rounded-xl text-left text-white shadow-lg">
                  <span className="text-[10px] uppercase tracking-wider text-[#F28C28] font-bold block">
                    Estimated Cost
                  </span>
                  <span className="font-heading text-xl sm:text-2xl font-extrabold text-white block tabular-nums">
                    {formatCurrency(totalCost)}
                  </span>
                  <span className="text-[11px] text-white/70 block mt-0.5">
                    ~₹{Math.round(totalCost / buaSqFt).toLocaleString()} / sq.ft
                  </span>
                </div>
              </div>

              {/* Bottom Specification Data Cards */}
              <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
                <div className="bg-[#F8F8F6] p-3 rounded-xl border border-[#E3E8E2]">
                  <span className="text-xs font-semibold text-[#687770] block">
                    Built-Up Area
                  </span>
                  <span className="text-base font-extrabold text-[#172722] block font-heading tabular-nums mt-0.5">
                    {buaSqFt.toLocaleString()} sq.ft
                  </span>
                  <span className="text-[11px] text-[#687770] block">
                    Ground + Floors
                  </span>
                </div>

                <div className="bg-[#F8F8F6] p-3 rounded-xl border border-[#E3E8E2]">
                  <span className="text-xs font-semibold text-[#687770] block">
                    Structural Steel
                  </span>
                  <span className="text-base font-extrabold text-[#172722] block font-heading tabular-nums mt-0.5">
                    {steelTonnes} T
                  </span>
                  <span className="text-[11px] text-[#687770] block">
                    Fe550D TMT
                  </span>
                </div>

                <div className="bg-[#F8F8F6] p-3 rounded-xl border border-[#E3E8E2]">
                  <span className="text-xs font-semibold text-[#687770] block">
                    Cement
                  </span>
                  <span className="text-base font-extrabold text-[#172722] block font-heading tabular-nums mt-0.5">
                    {cementBags.toLocaleString()} Bags
                  </span>
                  <span className="text-[11px] text-[#687770] block">
                    Grade 53
                  </span>
                </div>

                <div className="bg-[#F8F8F6] p-3 rounded-xl border border-[#E3E8E2]">
                  <span className="text-xs font-semibold text-[#687770] block">
                    BOQ Schedule
                  </span>
                  <span className="text-base font-extrabold text-[#172722] block font-heading tabular-nums mt-0.5">
                    13 Stages
                  </span>
                  <span className="text-[11px] text-[#687770] block">
                    Bank-Appraisal Ready
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
