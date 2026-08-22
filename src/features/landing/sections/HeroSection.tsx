import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Check } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useBudgetResult, useArea } from '../../../store/useCalculationStore';
import { Architectural3DViewer } from '../../../components/3d/Architectural3DViewer';
import { formatCurrency } from '../../../utils/cn';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { plotLength, plotWidth, floors } = useWizardStore();
  const budget = useBudgetResult();
  const area = useArea();

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = totalCost > 0 && buaSqFt > 0 ? Math.round(totalCost / buaSqFt) : 0;

  return (
    <section className="relative bg-[#F8F8F6] min-h-[85vh] flex items-center pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-[#E5E7EB]">
      {/* Architectural Grid Watermark */}
      <div className="absolute inset-0 pointer-events-none arch-grid-bg opacity-60" />

      {/* Subtle Dimension Line Overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-25 hidden lg:block">
        <div className="absolute top-12 right-12 w-[480px] h-[340px] border border-dashed border-[#1B3D34] rounded-2xl" />
        <div className="absolute top-8 right-16 text-[9px] font-mono tracking-widest text-[#1B3D34] uppercase flex items-center gap-3">
          <span>30'-0"</span>
          <span className="w-12 h-px bg-[#1B3D34]" />
          <span>RESIDENTIAL SITE MODEL</span>
          <span className="w-12 h-px bg-[#1B3D34]" />
          <span>40'-0"</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* ── LEFT ~48% (col-span-12 lg:col-span-6 xl:col-span-5): Pure Architectural Typography ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="lg:col-span-6 xl:col-span-5 space-y-6 text-left"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-3 py-1.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28]" />
              HUTTY
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="heading-display text-4xl sm:text-5xl lg:text-[3.35rem] leading-[1.08] text-[#1B3D34]">
                Build your home <br />
                with clarity.
              </h1>
              <p className="text-sm sm:text-base text-[#4B5563] font-normal leading-relaxed max-w-md">
                Plan your plot, spaces, materials and construction cost before you build.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => {
                  useWizardStore.getState().startNewProject();
                  navigate('/calculator');
                }}
                className="hutty-btn-primary text-xs sm:text-sm font-bold px-6 py-3.5 rounded-lg shadow-sm"
              >
                <span>Start Free Estimate</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hutty-btn-secondary text-xs sm:text-sm font-semibold px-5 py-3.5 rounded-lg"
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
                <span className="text-[11px] font-semibold text-[#4B5563]">BOQ-ready</span>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT ~52% (col-span-12 lg:col-span-6 xl:col-span-7): Visually Dominant Architectural Model ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6 xl:col-span-7 relative"
          >
            {/* 3D Container with Architectural Framing */}
            <div className="relative bg-white rounded-2xl border border-[#E5E7EB] p-2 sm:p-3 shadow-xs">
              
              {/* Architectural Dimension Header */}
              <div className="px-3 py-2 flex items-center justify-between border-b border-[#E5E7EB] mb-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F28C28]" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1B3D34]">
                    3D ARCHITECTURAL RECONSTRUCTION
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#4B5563]">
                  {plotLength || 30}' × {plotWidth || 40}' PLOT
                </span>
              </div>

              {/* 3D Viewer */}
              <Architectural3DViewer
                plotLength={plotLength || 30}
                plotWidth={plotWidth || 40}
                floors={floors || 2}
                className="w-full h-64 sm:h-72 md:h-80 lg:h-[340px] xl:h-[360px]"
              />

              {/* Live Metric Overlay Bar */}
              <div className="mt-3 grid grid-cols-3 gap-2 px-1 pb-1">
                <div className="bg-[#F8F8F6] p-2.5 rounded-xl border border-[#E5E7EB] text-left">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block">
                    ESTIMATED COST
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-[#1B3D34] block font-heading">
                    {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
                  </span>
                </div>

                <div className="bg-[#F8F8F6] p-2.5 rounded-xl border border-[#E5E7EB] text-left">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block">
                    BUILT-UP AREA
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-[#1B3D34] block font-heading">
                    {buaSqFt > 0 ? `${buaSqFt.toLocaleString()} sq.ft` : '0 sq.ft'}
                  </span>
                </div>

                <div className="bg-[#F8F8F6] p-2.5 rounded-xl border border-[#E5E7EB] text-left">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block">
                    RATE / SQ.FT
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-[#1B3D34] block font-heading">
                    {ratePerSqFt > 0 ? `₹${ratePerSqFt.toLocaleString()}` : '₹0 / sq.ft'}
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
