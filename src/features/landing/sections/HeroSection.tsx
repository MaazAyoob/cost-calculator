import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Check } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';
import { Architectural3DViewer } from '../../../components/3d/Architectural3DViewer';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#F7F7F5] min-h-[90vh] flex items-center pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden border-b border-[#E5E7EB]">
      {/* Subtle Architectural Blueprint Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{
          backgroundImage: `
            linear-gradient(to right, #E5E7EB 1px, transparent 1px),
            linear-gradient(to bottom, #E5E7EB 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#F7F7F5_85%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

          {/* ── Left Column: Editorial Architectural Messaging ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-8 text-left"
          >
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md">
              Cost Calculator by Rightcon
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#172033] leading-[1.12]">
                Plan Your Home <br className="hidden sm:inline" />
                Before You Build It.
              </h1>
              <p className="text-base sm:text-lg text-[#667085] font-normal leading-relaxed max-w-xl">
                Estimate construction costs, materials, timelines and project requirements before construction begins.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={() => {
                  useWizardStore.getState().startNewProject();
                  navigate('/calculator');
                }}
                className="inline-flex items-center gap-2 bg-[#1F4B43] hover:bg-[#163731] text-white text-sm font-bold px-6 py-3.5 rounded-lg transition-all cursor-pointer shadow-xs hover:shadow-sm"
              >
                Start Free Estimate <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#172033] text-sm font-semibold px-5 py-3.5 rounded-lg transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-[#1F4B43] fill-[#1F4B43]" />
                See How It Works
              </button>
            </div>

            {/* Key Proof Points */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E5E7EB] text-xs font-medium text-[#667085]">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#EBF2F0] text-[#1F4B43] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>Formula-Driven Quantities</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#EBF2F0] text-[#1F4B43] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>Material-Specific Rates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#EBF2F0] text-[#1F4B43] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>Detailed 13-Stage BOQ</span>
              </div>
            </div>
          </motion.div>

          {/* ── Right Column: Prominent Architectural 3D Visualization + 3 Subtle Overlays ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-6 relative"
          >
            {/* 3D Model Viewport Container */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3 sm:p-4 shadow-sm relative overflow-hidden">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-[#E5E7EB]/80 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#287A55] animate-pulse" />
                  <span className="font-semibold text-[#172033]">Interactive 3D Architectural Preview</span>
                </div>
                <span className="text-[11px] font-semibold text-[#667085]">30 × 50 Plot • G+2</span>
              </div>

              {/* 3D Viewer Instance */}
              <div className="relative mt-3 rounded-xl overflow-hidden bg-slate-900">
                <Architectural3DViewer
                  city="Bangalore"
                  plotLength={50}
                  plotWidth={30}
                  floors={3}
                  parkingType="Normal Ground"
                  carCount={1}
                  bikeCount={2}
                  evCharging={true}
                  liftRequired={false}
                  houseType="Duplex"
                  qualityTier="Premium"
                  rooms={{
                    bedrooms: 3,
                    bathrooms: 3,
                    commonToilets: 1,
                    kitchen: 1,
                    dining: 1,
                    living: 1,
                    balcony: 1,
                    office: 0,
                    pooja: 1,
                    utility: 1,
                    storeRoom: 0,
                  }}
                  materialBrands={{
                    steel: 'Tata Tiscon',
                    cement: 'UltraTech',
                    doors: 'Premium Teak',
                    windows: 'uPVC',
                    flooring: 'Vitrified Tiles',
                    bathroom: 'Jaquar',
                    electrical: 'V-Guard',
                    paint: 'Asian Paints',
                  }}
                  className="w-full h-80 sm:h-96 lg:h-[400px]"
                />
              </div>

              {/* 3 Restrained Floating Metric Overlays */}
              <div className="grid grid-cols-3 gap-2.5 pt-3">
                <div className="p-3 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] text-left space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                    Estimated Cost
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#1F4B43] block truncate">
                    ₹68,40,000
                  </span>
                </div>

                <div className="p-3 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] text-left space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                    Built-Up Area
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#172033] block truncate">
                    2,400 sq.ft
                  </span>
                </div>

                <div className="p-3 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] text-left space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                    Rate / Sq.Ft
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#172033] block truncate">
                    ₹2,850 / sqft
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
