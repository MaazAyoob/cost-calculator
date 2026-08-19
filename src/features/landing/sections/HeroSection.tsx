import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Compass, Building2, Check } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';
import { Architectural3DViewer } from '../../../components/3d/Architectural3DViewer';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#F7F7F5] min-h-[88vh] flex items-center pt-10 pb-16 lg:pt-14 lg:pb-24 overflow-hidden border-b border-[#E5E7EB]">
      {/* Architectural blueprint grid & dimension guidelines watermark */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, #D1D5DB 1px, transparent 1px),
            linear-gradient(to bottom, #D1D5DB 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Subtle plot boundary & dimension line annotations in background */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20 hidden lg:block">
        <div className="absolute top-16 right-10 w-96 h-96 border border-dashed border-[#1F4B43] rounded-3xl" />
        <div className="absolute top-24 right-14 text-[9px] font-mono tracking-widest text-[#1F4B43] uppercase">
          [ SITE GRID 30'-0" × 50'-0" • G+2 DUPLEX ]
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#F7F7F5_90%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* ── LEFT 45% (lg:col-span-5 xl:col-span-5): Pure Architectural Typography & CTAs ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/20 px-3 py-1.5 rounded-md">
              <Compass className="w-3.5 h-3.5 text-[#1F4B43]" />
              COST CALCULATOR BY RIGHTCON
            </div>

            {/* Large Headline (3-4 lines max) */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-[#172033] leading-[1.12]">
                Plan Your Home <br />
                Before You <br className="hidden sm:inline" />
                Build It.
              </h1>
              <p className="text-sm sm:text-base text-[#667085] font-normal leading-relaxed max-w-md">
                Estimate construction costs, materials and project requirements before construction begins.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => {
                  useWizardStore.getState().startNewProject();
                  navigate('/calculator');
                }}
                className="inline-flex items-center gap-2 bg-[#1F4B43] hover:bg-[#163731] text-white text-xs sm:text-sm font-bold px-5 sm:px-6 py-3.5 rounded-lg transition-all cursor-pointer shadow-xs hover:shadow-sm"
              >
                Start Free Estimate <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#172033] text-xs sm:text-sm font-semibold px-4 sm:px-5 py-3.5 rounded-lg transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-[#1F4B43] fill-[#1F4B43]" />
                See How It Works
              </button>
            </div>

            {/* Key Proof Points */}
            <div className="pt-5 border-t border-[#E5E7EB] flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#667085] font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#1F4B43]" /> Formula-Driven Quantities
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#1F4B43]" /> Material-Specific Rates
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#1F4B43]" /> Bank-Ready BOQ
              </span>
            </div>
          </motion.div>

          {/* ── RIGHT 55% (lg:col-span-7 xl:col-span-7): Large Dominant Architectural 3D Stage ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-7 relative"
          >
            {/* Architectural Stage Container */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3 sm:p-4 shadow-sm relative overflow-hidden">
              
              {/* Header Label Bar */}
              <div className="flex items-center justify-between pb-2.5 px-2 border-b border-[#E5E7EB] text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1F4B43]" />
                  <span className="font-bold text-[#172033] text-xs">3D Architectural Model</span>
                </div>
                <span className="text-[11px] font-mono text-[#667085] font-semibold">30' × 50' PLOT • G+2 RESIDENCE</span>
              </div>

              {/* Dominant 3D Viewer Instance */}
              <div className="relative mt-2.5 rounded-xl overflow-hidden bg-slate-900 border border-[#E5E7EB]">
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
                  className="w-full h-80 sm:h-96 lg:h-[420px]"
                />
              </div>

              {/* Restrained Architectural Estimate Panel */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3">
                <div className="p-3 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                    ESTIMATED COST
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#1F4B43] block truncate">
                    ₹68,40,000
                  </span>
                </div>

                <div className="p-3 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                    BUILT-UP AREA
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#172033] block truncate">
                    2,400 sq.ft
                  </span>
                </div>

                <div className="hidden sm:block p-3 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                    EFFECTIVE RATE
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#172033] block truncate">
                    ₹2,850 / sq.ft
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
