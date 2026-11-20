import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Compass,
  Layers,
  Scale,
  CalendarCheck,
  IndianRupee,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

type PreviewTab = 'boq' | 'materials' | 'setbacks' | 'cashflow' | 'summary';

interface FeaturePillar {
  id: PreviewTab;
  title: string;
  tagline: string;
  desc: string;
  icon: React.ElementType;
}

const REPORT_PILLARS: FeaturePillar[] = [
  {
    id: 'summary',
    title: 'Construction Cost Summary',
    tagline: 'Itemized totals & rates',
    desc: 'Total home cost, rate per sq.ft, and floor-wise expense forecast based on current Bangalore market prices.',
    icon: IndianRupee,
  },
  {
    id: 'materials',
    title: 'Materials Needed',
    tagline: 'Steel, cement & wall blocks',
    desc: 'Actual steel needed for the house, cement bags, sand volume, and block counts calculated for your plot size.',
    icon: Scale,
  },
  {
    id: 'boq',
    title: 'List of Work & Costs (BOQ)',
    tagline: 'All 22 building stages',
    desc: 'Step-by-step list of all building and finishing tasks, from digging the foundation to painting and handover.',
    icon: Layers,
  },
  {
    id: 'setbacks',
    title: 'Plot & Setback Rules',
    tagline: 'BBMP & BDA open space rules',
    desc: 'Clear boundaries for open space required around your home (front, back, and sides) and allowable building area.',
    icon: Compass,
  },
  {
    id: 'cashflow',
    title: 'Work Stages & Payment Plan',
    tagline: '7-stage payment schedule',
    desc: 'Safe milestone payment plan so you only pay your contractor when each stage of work is completed on site.',
    icon: CalendarCheck,
  },
];

export const WhatYourReportIncludesSection: React.FC = () => {
  const navigate = useNavigate();
  const { startNewProject } = useWizardStore();
  const [activeTab, setActiveTab] = useState<PreviewTab>('summary');

  const handleStartReport = () => {
    startNewProject();
    navigate('/calculator');
  };

  return (
    <section id="sample-report" className="py-16 lg:py-24 bg-white border-b border-[#E5E7EB] scroll-mt-16 text-[#18211E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
            <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
            <span className="font-bold">CONSTRUCTION DOSSIER SHOWCASE</span>
            <span>&bull;</span>
            <span>ALL-IN-ONE HOME PLAN</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18211E] tracking-tight font-heading leading-[1.14]">
            Everything you need to plan your home.
          </h2>

          <p className="text-sm sm:text-base text-[#66716B] leading-relaxed">
            Get your home plan, cost estimate, materials and construction details together in one report.
          </p>
        </div>

        {/* 5 Compact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-left">
          {REPORT_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isSelected = activeTab === pillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActiveTab(pillar.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-[#183B32] bg-[#EFF5F1] shadow-2xs'
                    : 'border-[#E5E7EB] bg-[#F8F8F6] hover:bg-white hover:border-[#183B32]/40'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-[#183B32] text-white' : 'bg-white text-[#183B32] border border-[#E5E7EB]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#18211E] font-heading leading-tight">
                      {pillar.title}
                    </h3>
                    <span className="text-[10px] font-mono font-semibold text-[#C66B4E] block mt-0.5">
                      {pillar.tagline}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#66716B] leading-relaxed">
                  {pillar.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Interactive Report Excerpt Preview Box */}
        <div className="bg-[#F8F8F6] rounded-2xl sm:rounded-3xl border-2 border-[#183B32] p-5 sm:p-7 text-left space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C66B4E] animate-pulse" />
              <strong className="text-xs sm:text-sm font-bold text-[#183B32] font-heading uppercase font-mono">
                Sample Report Excerpt &bull; Bangalore 30×40 G+2 Duplex
              </strong>
            </div>
            <span className="text-[11px] font-mono text-[#66716B]">
              Benchmark: 2,160 sq.ft BUA &bull; ₹63,88,400 Total
            </span>
          </div>

          {/* Excerpt Body based on selected tab */}
          <div className="min-h-[140px] flex items-center">
            <AnimatePresence mode="wait">
              {activeTab === 'summary' && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-left"
                >
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Total Estimated Cost</span>
                    <strong className="text-lg font-bold text-[#183B32] font-mono block mt-0.5">₹ 63.88 Lakhs</strong>
                    <span className="text-[10px] text-[#66716B] block">All 22 trades included</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Rate Per Sq.Ft</span>
                    <strong className="text-lg font-bold text-[#347A62] font-mono block mt-0.5">₹ 2,958 / sq.ft</strong>
                    <span className="text-[10px] text-[#66716B] block">Turnkey finish</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Total Built-Up Area</span>
                    <strong className="text-lg font-bold text-[#183B32] font-mono block mt-0.5">2,160 sq.ft</strong>
                    <span className="text-[10px] text-[#66716B] block">G+2 Duplex</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Plot Footprint</span>
                    <strong className="text-lg font-bold text-[#183B32] font-mono block mt-0.5">1,200 sq.ft</strong>
                    <span className="text-[10px] text-[#66716B] block">30&apos; × 40&apos; plot</span>
                  </div>
                </motion.div>
              )}

              {activeTab === 'materials' && (
                <motion.div
                  key="materials"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-left"
                >
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Steel Rebar (IS 1786)</span>
                    <strong className="text-lg font-bold text-[#183B32] font-mono block mt-0.5">6.912 Tonnes</strong>
                    <span className="text-[10px] text-[#66716B] block">Tata Tiscon Fe550D</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Cement (IS 269)</span>
                    <strong className="text-lg font-bold text-[#183B32] font-mono block mt-0.5">864 Bags</strong>
                    <span className="text-[10px] text-[#66716B] block">UltraTech 53G / Super</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Sand &amp; Aggregates</span>
                    <strong className="text-lg font-bold text-[#183B32] font-mono block mt-0.5">1,458 CFT</strong>
                    <span className="text-[10px] text-[#66716B] block">M-sand &amp; 20mm granite</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Solid Wall Blocks</span>
                    <strong className="text-lg font-bold text-[#183B32] font-mono block mt-0.5">9,677 Nos</strong>
                    <span className="text-[10px] text-[#66716B] block">6" external, 4" internal</span>
                  </div>
                </motion.div>
              )}

              {activeTab === 'boq' && (
                <motion.div
                  key="boq"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs"
                >
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] space-y-1">
                    <span className="text-[10px] font-mono text-[#66716B] block">TRADES 01–03 &bull; FRAMEWORK</span>
                    <strong className="text-xs font-bold text-[#183B32] block">Excavation, Footings &amp; RCC Frame</strong>
                    <span className="text-[11px] text-[#66716B] block">Earthwork (₹1.6L) &bull; Plinth (₹8.9L) &bull; Slabs (₹17.9L)</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] space-y-1">
                    <span className="text-[10px] font-mono text-[#66716B] block">TRADES 04–06 &bull; ENVELOPE</span>
                    <strong className="text-xs font-bold text-[#183B32] block">Masonry, Plaster &amp; Flooring</strong>
                    <span className="text-[11px] text-[#66716B] block">Blocks (₹6.4L) &bull; Plaster (₹5.1L) &bull; Tiles (₹6.7L)</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] space-y-1">
                    <span className="text-[10px] font-mono text-[#66716B] block">TRADES 07–10 &bull; FINISHES</span>
                    <strong className="text-xs font-bold text-[#183B32] block">Joinery, Electrical &amp; Plumbing</strong>
                    <span className="text-[11px] text-[#66716B] block">Doors/uPVC (₹5.7L) &bull; Wiring (₹4.5L) &bull; CPVC (₹3.8L)</span>
                  </div>
                </motion.div>
              )}

              {activeTab === 'setbacks' && (
                <motion.div
                  key="setbacks"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-left"
                >
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Front Setback</span>
                    <strong className="text-base font-bold text-[#183B32] font-mono block mt-0.5">4&apos; - 0&quot; (1.20 m)</strong>
                    <span className="text-[10px] text-[#66716B] block">Facing 30 ft road</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Rear Setback</span>
                    <strong className="text-base font-bold text-[#183B32] font-mono block mt-0.5">3&apos; - 6&quot; (1.05 m)</strong>
                    <span className="text-[10px] text-[#66716B] block">Rear boundary</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Side Setbacks</span>
                    <strong className="text-base font-bold text-[#183B32] font-mono block mt-0.5">3&apos; - 3&quot; (1.00 m)</strong>
                    <span className="text-[10px] text-[#66716B] block">Left &amp; right</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">Ground Coverage</span>
                    <strong className="text-base font-bold text-[#347A62] font-mono block mt-0.5">63.6% (764 sq.ft)</strong>
                    <span className="text-[10px] text-[#66716B] block">Within 68% BBMP limit</span>
                  </div>
                </motion.div>
              )}

              {activeTab === 'cashflow' && (
                <motion.div
                  key="cashflow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-left"
                >
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">M1: Plinth Beam</span>
                    <strong className="text-sm font-bold text-[#183B32] font-mono block mt-0.5">15% &bull; ₹ 9.58 Lakhs</strong>
                    <span className="text-[10px] text-[#66716B] block">After footings inspected</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">M2: Slabs Casting</span>
                    <strong className="text-sm font-bold text-[#183B32] font-mono block mt-0.5">20% &bull; ₹ 12.78 Lakhs</strong>
                    <span className="text-[10px] text-[#66716B] block">After 1st floor cured</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">M4: Masonry &amp; Plaster</span>
                    <strong className="text-sm font-bold text-[#183B32] font-mono block mt-0.5">15% &bull; ₹ 9.58 Lakhs</strong>
                    <span className="text-[10px] text-[#66716B] block">Grooves &amp; levels verified</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#66716B] block">M7: Final Handover</span>
                    <strong className="text-sm font-bold text-[#347A62] font-mono block mt-0.5">5% &bull; ₹ 3.19 Lakhs</strong>
                    <span className="text-[10px] text-[#66716B] block">30 days retention</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Strip with CTA & Sample Download */}
          <div className="pt-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#66716B] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#347A62]" />
              <span>Full report unlocked for ₹199 one-time</span>
            </span>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <a
                href="/Hutty-Sample-Construction-Report.pdf"
                download="Hutty-Sample-Construction-Report.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-white hover:bg-[#F8F8F6] text-[#183B32] border border-[#183B32]/30 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#183B32]" />
                <span>Download Sample Report</span>
              </a>

              <button
                type="button"
                onClick={handleStartReport}
                className="w-full sm:w-auto bg-[#183B32] hover:bg-[#245747] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start planning my home</span>
                <ArrowRight className="w-4 h-4 text-[#C66B4E]" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};