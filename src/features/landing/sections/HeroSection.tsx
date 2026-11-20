import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  FileText,
  Download,
  CheckCircle2,
  Sparkles,
  MapPin,
  IndianRupee,
} from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { startNewProject } = useWizardStore();

  const handleStartPlanning = () => {
    startNewProject();
    navigate('/calculator');
  };

  return (
    <section className="relative bg-[#F8F8F6] pt-8 pb-12 lg:pt-14 lg:pb-16 overflow-hidden text-[#18211E] border-b border-[#E5E7EB]">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none arch-grid-bg opacity-25" />

      {/* Subtle Atmospheric Gradient */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#B7CDBB]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: Clear Home Planning Pitch & Primary Actions          */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-6 space-y-5 text-left"
          >
            {/* 1. Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/80 text-xs font-semibold text-[#183B32]">
              <span className="w-2 h-2 rounded-full bg-[#C66B4E] animate-pulse shrink-0" />
              <MapPin className="w-3.5 h-3.5 text-[#C66B4E]" />
              <span className="tracking-wide">Bangalore Residential Home Planning</span>
            </div>

            {/* 2. Main Headline & Simple Supporting Text */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-[#18211E] font-heading tracking-tight leading-[1.14]">
                Build your home with{' '}
                <span className="text-[#183B32] underline decoration-[#C66B4E] decoration-4 underline-offset-8">
                  a clear plan.
                </span>
              </h1>

              <p className="text-[#66716B] text-base sm:text-lg font-normal leading-relaxed max-w-xl">
                Plan your home, understand the costs, and know what materials you&apos;ll need — before construction begins.
              </p>

              <p className="text-xs sm:text-sm text-[#183B32] font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#347A62]" />
                <span>Get a clear estimate for your home, from the structure to the finishing.</span>
              </p>
            </div>

            {/* 3. Primary & Secondary CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleStartPlanning}
                className="bg-[#183B32] hover:bg-[#245747] text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] min-h-[48px]"
              >
                <span>Start planning my home</span>
                <ArrowRight className="w-4 h-4 text-[#C66B4E]" />
              </button>

              <a
                href="/Hutty-Sample-Construction-Report.pdf"
                download="Hutty-Sample-Construction-Report.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-[#F8F8F6] text-[#183B32] border border-[#183B32]/30 font-semibold text-sm sm:text-base py-3.5 px-5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] min-h-[48px] shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#183B32]" />
                <span>Download sample report</span>
              </a>
            </div>

            {/* 4. Quick Reassurance Badges */}
            <div className="pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#66716B]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#347A62]" />
                <span>Free on-screen estimate</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#347A62]" />
                <span>Bangalore building &amp; setback rules</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#347A62]" />
                <span>Complete report for ₹199</span>
              </span>
            </div>
          </motion.div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: Realistic Sample Architectural Report Dossier Card  */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-6 relative w-full"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Back Layer Page (tilted) */}
              <div className="hidden sm:block absolute top-4 -right-3 w-full h-[380px] bg-white rounded-2xl border-2 border-[#CBD5CB] shadow-sm rotate-2 pointer-events-none p-5 text-left opacity-75 overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2 text-[10px] text-[#66716B] font-mono">
                  <span>LIST OF WORK &amp; COSTS (BOQ)</span>
                  <span>SAMPLE REPORT</span>
                </div>
                <div className="mt-4 space-y-2 opacity-50">
                  <div className="h-3 bg-[#E8EFE9] rounded w-3/4" />
                  <div className="h-2.5 bg-stone-100 rounded w-full" />
                  <div className="h-2.5 bg-stone-100 rounded w-5/6" />
                </div>
              </div>

              {/* Front Primary Dossier Card */}
              <div className="relative bg-white rounded-2xl sm:rounded-3xl border-2 border-[#183B32] shadow-lg p-5 sm:p-6 text-left space-y-4 z-20">
                
                {/* Dossier Header Bar */}
                <div className="flex items-center justify-between border-b-2 border-[#183B32] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#183B32] text-white flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#C66B4E]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#66716B] block">
                        SAMPLE REPORT PREVIEW
                      </span>
                      <strong className="text-xs font-bold text-[#183B32] block">
                        Sample Home Report
                      </strong>
                    </div>
                  </div>

                  <a
                    href="/Hutty-Sample-Construction-Report.pdf"
                    download="Hutty-Sample-Construction-Report.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono font-bold bg-[#E8EFE9] hover:bg-[#D5E5DC] text-[#183B32] px-2.5 py-1 rounded-full border border-[#B7CDBB] flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3 h-3 text-[#183B32]" />
                    <span>FREE PDF</span>
                  </a>
                </div>

                {/* Benchmark Identity */}
                <div className="bg-[#F8F8F6] p-3 rounded-xl border border-[#E5E7EB] space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#183B32]">
                      Sample: 30&apos; × 40&apos; G+1 Duplex
                    </span>
                    <span className="text-[11px] font-mono text-[#66716B]">
                      BBMP / BDA
                    </span>
                  </div>
                  <div className="text-[11px] text-[#66716B] flex items-center gap-2">
                    <span>Plot: 1,200 sq.ft</span>
                    <span>&bull;</span>
                    <span>BUA: <strong>2,160 sq.ft</strong></span>
                    <span>&bull;</span>
                    <span>2 Floors</span>
                  </div>
                </div>

                {/* Estimated Project Value */}
                <div className="p-3.5 rounded-xl bg-[#E8EFE9] border border-[#B7CDBB] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#183B32] block">
                      ESTIMATED CONSTRUCTION COST
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#183B32] font-heading tabular-nums block mt-0.5">
                      ₹ 63,88,400
                    </span>
                    <span className="text-[11px] text-[#66716B] block">
                      ~ ₹ 2,958 / sq.ft &bull; Complete turnkey estimate
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#B7CDBB] flex items-center justify-center text-[#183B32] shrink-0 shadow-2xs">
                    <IndianRupee className="w-4 h-4 text-[#C66B4E]" />
                  </div>
                </div>

                {/* Material Takeoffs Row */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Steel Needed</span>
                    <strong className="text-xs sm:text-sm font-bold text-[#183B32] font-mono block mt-0.5">
                      6.91 T
                    </strong>
                    <span className="text-[9px] text-[#66716B] block truncate">Tata Tiscon</span>
                  </div>

                  <div className="p-2 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Cement Bags</span>
                    <strong className="text-xs sm:text-sm font-bold text-[#183B32] font-mono block mt-0.5">
                      864 Bags
                    </strong>
                    <span className="text-[9px] text-[#66716B] block truncate">UltraTech 53G</span>
                  </div>

                  <div className="p-2 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Wall Blocks</span>
                    <strong className="text-xs sm:text-sm font-bold text-[#183B32] font-mono block mt-0.5">
                      9,677 Nos
                    </strong>
                    <span className="text-[9px] text-[#66716B] block truncate">Solid concrete</span>
                  </div>
                </div>

                {/* Footer Download Link */}
                <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#66716B]">
                    Includes work schedule &amp; payment plan
                  </span>
                  <a
                    href="/Hutty-Sample-Construction-Report.pdf"
                    download="Hutty-Sample-Construction-Report.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#C66B4E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Download sample PDF</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

              </div>

              {/* Floating Bottom Left Stamp */}
              <div className="absolute -bottom-2 -left-2 z-30 bg-[#183B32] text-white px-3 py-1.5 rounded-lg shadow-md border border-white/20 flex items-center gap-1.5 text-xs font-bold">
                <Sparkles className="w-3 h-3 text-[#C66B4E]" />
                <span>IS 456 &bull; IS 1786 Verified</span>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
