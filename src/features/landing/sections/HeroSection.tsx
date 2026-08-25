import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Check, Ruler, Building, Layers, Sparkles } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useBudgetResult, useArea, useQuantities } from '../../../store/useCalculationStore';
import { Architectural3DViewer } from '../../../components/3d/Architectural3DViewer';
import { formatCurrency } from '../../../utils/cn';
import { AnimatedNumber } from '../../../components/common/AnimatedNumber';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { plotLength, plotWidth, floors } = useWizardStore();
  const budget = useBudgetResult();
  const area = useArea();
  const quantities = useQuantities();

  const totalCost = budget.totalProjectCost || 5106442;
  const buaSqFt = area.totalBUASqFt || 1440;
  const ratePerSqFt = totalCost > 0 && buaSqFt > 0 ? Math.round(totalCost / buaSqFt) : 3546;

  // Scroll parallax for hero 3D viewer
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.94]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0.85]);

  return (
    <section className="relative bg-[#F8F8F6] min-h-[90vh] flex items-center pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden border-b border-[#E5E7EB]">
      
      {/* Subtle Architectural Grid Background */}
      <div className="absolute inset-0 pointer-events-none arch-grid-bg opacity-40" />

      {/* Subtle Construction Grid Markers */}
      <div className="absolute inset-0 pointer-events-none max-w-7xl mx-auto px-4 hidden lg:block opacity-30">
        <div className="absolute top-10 left-6 text-[9px] font-mono text-[#1B3D34]">GRID 01 // NORTH</div>
        <div className="absolute top-10 right-6 text-[9px] font-mono text-[#1B3D34]">BBMP ZONE II // 180 kN/m²</div>
        <div className="absolute bottom-10 left-6 text-[9px] font-mono text-[#1B3D34]">DATUM 0.000 // PLINTH +0.60m</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">

          {/* ── LEFT (col-span-12 lg:col-span-5): Precise Architectural Typography ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28]" />
              <span>DIGITAL QUANTITY SURVEYOR</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="heading-display text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.08] text-[#1B3D34] font-black tracking-tight">
                Build your home <br />
                with clarity.
              </h1>
              <p className="text-sm sm:text-base text-[#4B5563] font-normal leading-relaxed max-w-md">
                Plan your plot, spaces, materials and construction cost before you break ground. Formula-driven, quantity-first, bank-ready.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => {
                  useWizardStore.getState().startNewProject();
                  navigate('/calculator');
                }}
                className="hutty-btn-primary text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl shadow-xs"
              >
                <span>Start Free Estimate</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>

              <button
                onClick={() => {
                  document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hutty-btn-secondary text-xs sm:text-sm font-semibold px-5 py-3.5 rounded-xl"
              >
                <Play className="w-3.5 h-3.5 text-[#1B3D34] fill-[#1B3D34]" />
                <span>See How It Works</span>
              </button>
            </div>

            {/* 3 Quiet Proof Points */}
            <div className="pt-4 border-t border-[#E5E7EB] grid grid-cols-3 gap-2 text-left">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                <span className="text-[11px] font-semibold text-[#4B5563]">Formula-driven</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                <span className="text-[11px] font-semibold text-[#4B5563]">Quantity-based</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                <span className="text-[11px] font-semibold text-[#4B5563]">Bank BOQ</span>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT (col-span-12 lg:col-span-7): VISUALLY STUNNING ARCHITECTURAL MODEL + ANNOTATIONS ── */}
          <motion.div
            style={{ scale: heroScale, opacity: heroOpacity }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative"
          >
            {/* Outer Architectural Workspace Frame */}
            <div className="relative bg-white rounded-2xl border border-[#E5E7EB] p-3 sm:p-4 shadow-xs">
              
              {/* Architectural Technical Bar */}
              <div className="px-3 py-2 flex items-center justify-between border-b border-[#E5E7EB] mb-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1B3D34] animate-pulse" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1B3D34]">
                    CANONICAL 3D RECONSTRUCTION
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#4B5563] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                    PLOT: 30' × 40'
                  </span>
                  <span className="text-[10px] font-mono text-[#4B5563] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                    G+1 DUPLEX
                  </span>
                </div>
              </div>

              {/* 3D Model Area with SVG Leader Annotations */}
              <div className="relative w-full h-72 sm:h-80 lg:h-[370px] xl:h-[400px] rounded-xl overflow-hidden bg-[#1B3D34]">
                <Architectural3DViewer
                  plotLength={plotLength || 40}
                  plotWidth={plotWidth || 30}
                  floors={floors || 2}
                  className="w-full h-full"
                />

                {/* Annotation 1: Top-Left Plot Boundary */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs border border-[#E5E7EB] rounded-xl p-2.5 shadow-sm text-left hidden sm:block pointer-events-none"
                >
                  <span className="text-[9px] font-mono font-bold text-[#4B5563] uppercase block">
                    SITE FOOTPRINT
                  </span>
                  <span className="text-xs font-black text-[#1B3D34] font-mono">
                    30 × 40 FT &bull; 1,200 sq.ft
                  </span>
                  <span className="text-[9px] text-[#4B5563] block">
                    Setbacks: 3.5' Front &bull; 3.0' Sides
                  </span>
                </motion.div>

                {/* Annotation 2: Top-Right Live Cost Badge */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="absolute top-4 right-4 bg-[#1B3D34] border border-white/20 rounded-xl p-2.5 shadow-md text-left pointer-events-none"
                >
                  <span className="text-[9px] font-mono font-bold text-[#F28C28] uppercase block">
                    TOTAL ESTIMATE
                  </span>
                  <span className="text-sm font-black text-white font-mono block">
                    <AnimatedNumber value={totalCost} format={(v) => formatCurrency(Math.round(v))} duration={400} />
                  </span>
                  <span className="text-[9px] text-white/80 font-mono">
                    @ ₹{ratePerSqFt.toLocaleString()} / sq.ft BUA
                  </span>
                </motion.div>

                {/* Annotation 3: Bottom-Left Physical Takeoffs */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                  className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs border border-[#E5E7EB] rounded-xl p-2.5 shadow-sm text-left hidden sm:block pointer-events-none"
                >
                  <span className="text-[9px] font-mono font-bold text-[#4B5563] uppercase block">
                    STRUCTURAL TAKEOFF
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1B3D34]">
                    <span>{quantities.steelTonnes || 4.32} T Steel</span>
                    <span>&bull;</span>
                    <span>{(quantities.cementBags || 576).toLocaleString()} Bags Cement</span>
                  </div>
                </motion.div>

                {/* Annotation 4: Bottom-Right Interactive Prompt */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.3 }}
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xs border border-[#E5E7EB] rounded-lg px-2 py-1 text-[10px] font-mono text-[#1B3D34] hidden sm:flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28] animate-ping" />
                  <span>360° Interactive Canvas</span>
                </motion.div>

              </div>

              {/* Bottom Quick Metrics Bar */}
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
                    OPEN YARD
                  </span>
                  <span className="text-sm font-extrabold text-[#1B3D34] block font-heading tabular-nums">
                    480 sq.ft
                  </span>
                </div>

                <div className="bg-[#F8F8F6] p-2.5 rounded-xl border border-[#E5E7EB] text-left">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block">
                    BOQ STAGES
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
