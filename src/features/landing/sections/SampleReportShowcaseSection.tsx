import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Compass,
  Layers,
  Scale,
  CalendarCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  Download,
  Eye,
  IndianRupee,
  Building,
} from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

type ReportTab = 'cover' | 'setbacks' | 'boq' | 'materials' | 'cashflow';

interface TabConfig {
  id: ReportTab;
  tabLabel: string;
  pageNumber: string;
  icon: React.ElementType;
  sectionTitle: string;
  badge: string;
}

const REPORT_TABS: TabConfig[] = [
  {
    id: 'cover',
    tabLabel: '1. Executive Summary',
    pageNumber: 'Page 01 of 18',
    icon: FileText,
    sectionTitle: 'Project Dossier & Key Metrics',
    badge: 'BENCHMARK RESIDENCE',
  },
  {
    id: 'setbacks',
    tabLabel: '2. Plot & Setbacks',
    pageNumber: 'Page 03 of 18',
    icon: Compass,
    sectionTitle: 'BBMP / BDA Municipal Setback Verification',
    badge: 'BYELAW COMPLIANT',
  },
  {
    id: 'boq',
    tabLabel: '3. Works BOQ (Section A)',
    pageNumber: 'Page 07 of 18',
    icon: Layers,
    sectionTitle: 'Itemized Works Bill of Quantities',
    badge: '22 TRADE PACKAGES',
  },
  {
    id: 'materials',
    tabLabel: '4. Material Takeoff (Section B)',
    pageNumber: 'Page 11 of 18',
    icon: Scale,
    sectionTitle: 'Physical Engineering Quantities Takeoff',
    badge: 'IS 456 RATIOS',
  },
  {
    id: 'cashflow',
    tabLabel: '5. Milestone Cashflow (Section D)',
    pageNumber: 'Page 15 of 18',
    icon: CalendarCheck,
    sectionTitle: '7-Stage Milestone Disbursement Schedule',
    badge: 'PAYMENT GOVERNANCE',
  },
];

export const SampleReportShowcaseSection: React.FC = () => {
  const navigate = useNavigate();
  const { startNewProject } = useWizardStore();
  const [activeTab, setActiveTab] = useState<ReportTab>('cover');

  const currentIndex = REPORT_TABS.findIndex((t) => t.id === activeTab);
  const currentTab = REPORT_TABS[currentIndex];

  const handleNextTab = () => {
    const nextIdx = (currentIndex + 1) % REPORT_TABS.length;
    setActiveTab(REPORT_TABS[nextIdx].id);
  };

  const handlePrevTab = () => {
    const prevIdx = (currentIndex - 1 + REPORT_TABS.length) % REPORT_TABS.length;
    setActiveTab(REPORT_TABS[prevIdx].id);
  };

  const handleCreateReport = () => {
    startNewProject();
    navigate('/calculator');
  };

  return (
    <section id="sample-report" className="py-20 lg:py-28 bg-[#F8F8F6] border-b border-[#E5E7EB] scroll-mt-16 text-[#18211E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E5E7EB] pb-6 text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
              <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
              <span className="text-[#C66B4E] font-bold">Interactive Sample Report</span>
              <span>&bull;</span>
              <span>What You Receive</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18211E] tracking-tight font-heading leading-[1.14]">
              Inspect an actual report before creating yours.
            </h2>

            <p className="text-sm sm:text-base text-[#66716B] leading-relaxed">
              Every Hutty Construction Planning Report includes municipal setback analysis, a 22-package works schedule, exact physical material takeoffs, and contractor payment milestones.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={handleCreateReport}
              className="bg-[#183B32] hover:bg-[#245747] text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2 min-h-[46px]"
            >
              <span>Create My Construction Report</span>
              <ArrowRight className="w-4 h-4 text-[#C66B4E]" />
            </button>
          </div>
        </div>

        {/* Tab Selector Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#E5E7EB]">
          {REPORT_TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[46px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#183B32] text-white shadow-sm border border-[#183B32]'
                    : 'bg-white text-[#66716B] hover:text-[#18211E] border border-[#E5E7EB] hover:bg-[#F8F8F6]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C66B4E]' : 'text-[#66716B]'}`} />
                <span>{tab.tabLabel}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C66B4E]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Interactive Report Document Canvas */}
        <div className="bg-white rounded-3xl border-2 border-[#183B32] shadow-xl overflow-hidden text-left relative">
          
          {/* Top Architectural Sheet Meta Bar */}
          <div className="bg-[#183B32] text-white px-5 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#245747]">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C66B4E] animate-pulse" />
              <span className="font-mono font-bold tracking-wider uppercase text-[11px] sm:text-xs">
                {currentTab.sectionTitle}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono text-[#B7CDBB]">
              <span className="bg-white/10 px-2.5 py-0.5 rounded border border-white/20 text-white font-bold">
                {currentTab.pageNumber}
              </span>
              <span className="hidden sm:inline">Bangalore 30×40 G+2 Residence</span>
            </div>
          </div>

          {/* Tab Content Display Area with Animated Transition */}
          <div className="p-6 sm:p-10 min-h-[480px]">
            <AnimatePresence mode="wait">
              
              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* TAB 1: EXECUTIVE SUMMARY (COVER)                              */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              {activeTab === 'cover' && (
                <motion.div
                  key="cover"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Top Dossier Title Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C66B4E]">
                        PROJECT SPECIFICATION DOSSIER &bull; CHAPTER 01
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#183B32] font-heading mt-1">
                        Residential Construction Planning Report
                      </h3>
                      <p className="text-xs sm:text-sm text-[#66716B] mt-0.5">
                        Prepared for G+2 Contemporary Duplex Residence &bull; Bengaluru Urban Zone
                      </p>
                    </div>

                    <div className="bg-[#EFF5F1] p-3 rounded-xl border border-[#DCE5DF] text-left sm:text-right">
                      <span className="text-[10px] font-mono uppercase text-[#66716B] block">REPORT ID</span>
                      <span className="text-xs font-mono font-bold text-[#183B32] block">HTY-BLR-2026-3040</span>
                      <span className="text-[10px] text-[#347A62] font-medium block">IS 456:2000 Verified</span>
                    </div>
                  </div>

                  {/* 3 Core Highlight Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-[#F8F8F6] border border-[#E5E7EB] space-y-1">
                      <span className="text-[11px] font-mono uppercase text-[#66716B] block">
                        TOTAL ESTIMATED COST
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-[#183B32] font-heading block tabular-nums">
                        ₹ 63,88,400
                      </span>
                      <span className="text-xs text-[#66716B] block">
                        ~ ₹ 2,958 / sq.ft BUA (All 22 trades)
                      </span>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#F8F8F6] border border-[#E5E7EB] space-y-1">
                      <span className="text-[11px] font-mono uppercase text-[#66716B] block">
                        TOTAL BUILT-UP AREA
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-[#183B32] font-heading block tabular-nums">
                        2,160 sq.ft
                      </span>
                      <span className="text-xs text-[#66716B] block">
                        Ground (720) + 1st (720) + 2nd (720)
                      </span>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#F8F8F6] border border-[#E5E7EB] space-y-1">
                      <span className="text-[11px] font-mono uppercase text-[#66716B] block">
                        PLOT FOOTPRINT
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-[#183B32] font-heading block tabular-nums">
                        1,200 sq.ft
                      </span>
                      <span className="text-xs text-[#66716B] block">
                        30&apos;-0&quot; Frontage × 40&apos;-0&quot; Depth
                      </span>
                    </div>
                  </div>

                  {/* Summary Scope Table */}
                  <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden">
                    <div className="bg-[#F8F8F6] px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#183B32] uppercase font-mono">
                        Key Configuration Specifications
                      </span>
                      <span className="text-[11px] text-[#66716B]">G+2 Duplex</span>
                    </div>
                    <div className="divide-y divide-[#E5E7EB] text-xs">
                      <div className="p-3.5 px-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <span className="text-[#66716B] block text-[11px]">House Type</span>
                          <strong className="text-[#183B32] font-bold">Duplex (3 BHK + Study)</strong>
                        </div>
                        <div>
                          <span className="text-[#66716B] block text-[11px]">Floors</span>
                          <strong className="text-[#183B32] font-bold">Ground + 2 Upper Floors</strong>
                        </div>
                        <div>
                          <span className="text-[#66716B] block text-[11px]">Parking</span>
                          <strong className="text-[#183B32] font-bold">1 Car + 2 Two-Wheelers</strong>
                        </div>
                        <div>
                          <span className="text-[#66716B] block text-[11px]">Structural Frame</span>
                          <strong className="text-[#183B32] font-bold">RCC Framed (M20 Grade)</strong>
                        </div>
                      </div>

                      <div className="p-3.5 px-5 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FDFCFB]">
                        <div>
                          <span className="text-[#66716B] block text-[11px]">Primary Steel</span>
                          <strong className="text-[#183B32] font-bold">Tata Tiscon Fe550D TMT</strong>
                        </div>
                        <div>
                          <span className="text-[#66716B] block text-[11px]">Primary Cement</span>
                          <strong className="text-[#183B32] font-bold">UltraTech 53G / Super</strong>
                        </div>
                        <div>
                          <span className="text-[#66716B] block text-[11px]">Masonry</span>
                          <strong className="text-[#183B32] font-bold">Solid Concrete 6&quot; Blocks</strong>
                        </div>
                        <div>
                          <span className="text-[#66716B] block text-[11px]">Joinery</span>
                          <strong className="text-[#183B32] font-bold">Teak Main Door + uPVC Windows</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* TAB 2: PLOT & SETBACK ANALYSIS                                */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              {activeTab === 'setbacks' && (
                <motion.div
                  key="setbacks"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C66B4E]">
                        CHAPTER 02 &bull; BYLAW VERIFICATION
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-[#183B32] font-heading mt-0.5">
                        Plot Sizing &amp; Municipal Setback Schedule
                      </h3>
                      <p className="text-xs text-[#66716B]">
                        BBMP / BDA Bye-laws: Mandatory open spaces and ground coverage limits.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-xs font-bold text-[#183B32]">
                      <ShieldCheck className="w-4 h-4 text-[#347A62]" />
                      <span>Legally Permissible Envelope</span>
                    </div>
                  </div>

                  {/* Setback Grid Visual Representation */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Left: Setbacks diagram card */}
                    <div className="md:col-span-6 bg-[#F8F8F6] p-6 rounded-2xl border-2 border-dashed border-[#CBD5CB] text-center space-y-4">
                      <span className="text-[11px] font-mono font-bold uppercase text-[#66716B]">
                        MUNICIPAL ROAD: 30&apos;-0&quot; WIDE
                      </span>

                      {/* Schematic Plot Box */}
                      <div className="relative mx-auto w-full max-w-xs bg-white rounded-xl border-2 border-[#183B32] p-4 shadow-sm">
                        {/* Front Setback Marker */}
                        <div className="bg-[#FDF0EB] border border-[#E8C5B8] p-1.5 rounded text-[10px] font-bold text-[#C66B4E] mb-3">
                          FRONT SETBACK: 4&apos;-0&quot; (1.20 m)
                        </div>

                        {/* Buildable Footprint */}
                        <div className="bg-[#183B32] text-white p-6 rounded-lg text-center space-y-1">
                          <span className="text-xs font-bold font-heading block">
                            BUILDABLE FOOTPRINT
                          </span>
                          <span className="text-lg font-mono font-extrabold block text-[#E5D5B4]">
                            23&apos;-6&quot; × 32&apos;-6&quot;
                          </span>
                          <span className="text-[10px] text-white/80 block">
                            763.75 sq.ft ground footprint (63.6% coverage)
                          </span>
                        </div>

                        {/* Left & Right Setback Markers */}
                        <div className="flex justify-between items-center text-[10px] text-[#66716B] mt-2 px-1 font-mono">
                          <span>LEFT: 3&apos;-3&quot;</span>
                          <span>RIGHT: 3&apos;-3&quot;</span>
                        </div>

                        {/* Rear Setback Marker */}
                        <div className="bg-[#EFF5F1] border border-[#DCE5DF] p-1.5 rounded text-[10px] font-bold text-[#347A62] mt-3">
                          REAR SETBACK: 3&apos;-6&quot; (1.05 m)
                        </div>
                      </div>

                      <span className="text-[11px] text-[#66716B] block">
                        Plot: 30&apos; Frontage × 40&apos; Depth &bull; 1,200 sq.ft
                      </span>
                    </div>

                    {/* Right: Byelaw Schedule Data */}
                    <div className="md:col-span-6 space-y-3">
                      <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                        <div>
                          <strong className="text-xs font-bold text-[#183B32] block">Front Setback</strong>
                          <span className="text-[11px] text-[#66716B]">Facing 30 ft road</span>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-[#183B32]">4&apos; - 0&quot; (1.20 m)</span>
                      </div>

                      <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                        <div>
                          <strong className="text-xs font-bold text-[#183B32] block">Rear Setback</strong>
                          <span className="text-[11px] text-[#66716B]">Rear property boundary</span>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-[#183B32]">3&apos; - 6&quot; (1.05 m)</span>
                      </div>

                      <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                        <div>
                          <strong className="text-xs font-bold text-[#183B32] block">Side Setbacks (Left &amp; Right)</strong>
                          <span className="text-[11px] text-[#66716B]">Adjacent residential plots</span>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-[#183B32]">3&apos; - 3&quot; (1.00 m each)</span>
                      </div>

                      <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                        <div>
                          <strong className="text-xs font-bold text-[#183B32] block">Maximum Ground Coverage</strong>
                          <span className="text-[11px] text-[#66716B]">Allowed by BBMP</span>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-[#347A62]">68.0% (816 sq.ft)</span>
                      </div>

                      <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                        <div>
                          <strong className="text-xs font-bold text-[#183B32] block">Permissible Height</strong>
                          <span className="text-[11px] text-[#66716B]">Road width 30 ft</span>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-[#183B32]">11.5 m (G+2 Floors)</span>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* TAB 3: WORKS BOQ (SECTION A)                                  */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              {activeTab === 'boq' && (
                <motion.div
                  key="boq"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C66B4E]">
                        SECTION A &bull; WORKS SCHEDULE
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-[#183B32] font-heading mt-0.5">
                        Works Bill of Quantities (BOQ)
                      </h3>
                      <p className="text-xs text-[#66716B]">
                        22 distinct civil, structural, and finishing work packages with benchmark market values.
                      </p>
                    </div>

                    <span className="text-xs font-mono font-bold text-[#183B32] bg-[#E8EFE9] px-3 py-1 rounded-full border border-[#B7CDBB]">
                      TOTAL: ₹ 63,88,400
                    </span>
                  </div>

                  {/* Itemized BOQ Table */}
                  <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden">
                    <div className="bg-[#183B32] text-white px-5 py-3 grid grid-cols-12 text-[11px] font-mono font-bold uppercase tracking-wider">
                      <span className="col-span-1">PKG</span>
                      <span className="col-span-5">WORK DESCRIPTION</span>
                      <span className="col-span-2 text-right">SHARE</span>
                      <span className="col-span-4 text-right">ESTIMATED COST</span>
                    </div>

                    <div className="divide-y divide-[#E5E7EB] text-xs">
                      {[
                        { num: '01', desc: 'Earthwork Excavation, Levelling & Anti-termite', share: '2.5%', cost: '₹ 1,59,710' },
                        { num: '02', desc: 'Substructure & RCC Footings (Plinth beam & columns)', share: '14.0%', cost: '₹ 8,94,376' },
                        { num: '03', desc: 'Superstructure RCC Framework (Columns, Beams & Slabs)', share: '28.0%', cost: '₹ 17,88,752' },
                        { num: '04', desc: 'Solid Concrete Block Masonry (6" External, 4" Internal)', share: '10.0%', cost: '₹ 6,38,840' },
                        { num: '05', desc: 'Internal & External Sand Plastering (1:4 & 1:6)', share: '8.0%', cost: '₹ 5,11,072' },
                        { num: '06', desc: 'Vitrified Tiles (800x800mm) & Granite Joinery', share: '10.5%', cost: '₹ 6,70,782' },
                        { num: '07', desc: 'Teak Main Door & uPVC 3-Track Windows with Mesh', share: '9.0%', cost: '₹ 5,74,956' },
                        { num: '08', desc: 'Electrical Wiring (Finolex) & Modular Switches', share: '7.0%', cost: '₹ 4,47,188' },
                        { num: '09', desc: 'Plumbing (Astral CPVC) & Sanitaryware (Jaquar)', share: '6.0%', cost: '₹ 3,83,304' },
                        { num: '10', desc: 'Painting: Primer, Putty & 2-Coat Asian Paints Emulsion', share: '5.0%', cost: '₹ 3,19,420' },
                      ].map((item, idx) => (
                        <div
                          key={item.num}
                          className={`px-5 py-3 grid grid-cols-12 items-center hover:bg-[#F8F8F6] transition-colors ${
                            idx % 2 === 1 ? 'bg-[#FCFCFA]' : 'bg-white'
                          }`}
                        >
                          <span className="col-span-1 font-mono font-bold text-[#66716B]">{item.num}</span>
                          <span className="col-span-5 font-medium text-[#18211E]">{item.desc}</span>
                          <span className="col-span-2 text-right font-mono text-[#66716B]">{item.share}</span>
                          <span className="col-span-4 text-right font-mono font-bold text-[#183B32]">{item.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#66716B] italic">
                    Showing first 10 of 22 trade packages. The complete report details all remaining trades including waterproofing, terrace weathering, fabrication, solar provision, and site cleanup.
                  </p>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* TAB 4: PHYSICAL MATERIAL TAKEOFF (SECTION B)                  */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              {activeTab === 'materials' && (
                <motion.div
                  key="materials"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C66B4E]">
                        SECTION B &bull; PHYSICAL QUANTITIES
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-[#183B32] font-heading mt-0.5">
                        Physical Material Takeoff (Bill of Materials)
                      </h3>
                      <p className="text-xs text-[#66716B]">
                        Calculated directly from structural engineering formulas (IS 456 &amp; IS 1786).
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-xs font-bold text-[#183B32]">
                      <Sparkles className="w-3.5 h-3.5 text-[#C66B4E]" />
                      <span>Zero Contractor Inflation</span>
                    </div>
                  </div>

                  {/* 6 Material Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB] space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#66716B] uppercase">STEEL REBAR</span>
                        <span className="text-[10px] font-mono font-bold text-[#183B32] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">IS 1786</span>
                      </div>
                      <span className="text-2xl sm:text-3xl font-black text-[#183B32] font-heading block tabular-nums">
                        6.912 T
                      </span>
                      <strong className="text-xs font-bold text-[#18211E] block">
                        Fe550D TMT Reinforcement
                      </strong>
                      <span className="text-[11px] text-[#66716B] block leading-tight">
                        3.20 kg / sq.ft BUA. For foundations, columns, plinth beams, and 3 RCC slabs.
                      </span>
                    </div>

                    <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB] space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#66716B] uppercase">CEMENT</span>
                        <span className="text-[10px] font-mono font-bold text-[#183B32] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">IS 269</span>
                      </div>
                      <span className="text-2xl sm:text-3xl font-black text-[#183B32] font-heading block tabular-nums">
                        864 Bags
                      </span>
                      <strong className="text-xs font-bold text-[#18211E] block">
                        OPC 53G &amp; PPC Cement
                      </strong>
                      <span className="text-[11px] text-[#66716B] block leading-tight">
                        0.40 bags / sq.ft BUA. Used across structural concrete (M20) and 2-coat wall plastering.
                      </span>
                    </div>

                    <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB] space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#66716B] uppercase">WALL BLOCKS</span>
                        <span className="text-[10px] font-mono font-bold text-[#183B32] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">IS 2185</span>
                      </div>
                      <span className="text-2xl sm:text-3xl font-black text-[#183B32] font-heading block tabular-nums">
                        9,677 Nos
                      </span>
                      <strong className="text-xs font-bold text-[#18211E] block">
                        6&quot; &amp; 4&quot; Solid Concrete Blocks
                      </strong>
                      <span className="text-[11px] text-[#66716B] block leading-tight">
                        External 6" boundary and internal 4" partition walls across all 3 floors.
                      </span>
                    </div>

                    <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB] space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#66716B] uppercase">SAND &amp; M-SAND</span>
                        <span className="text-[10px] font-mono font-bold text-[#183B32] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">IS 383</span>
                      </div>
                      <span className="text-2xl sm:text-3xl font-black text-[#183B32] font-heading block tabular-nums">
                        1,458 CFT
                      </span>
                      <strong className="text-xs font-bold text-[#18211E] block">
                        Manufactured Sand (M &amp; P)
                      </strong>
                      <span className="text-[11px] text-[#66716B] block leading-tight">
                        Washed manufactured sand for concrete mixing and fine plastering work.
                      </span>
                    </div>

                    <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB] space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#66716B] uppercase">FLOORING TILES</span>
                        <span className="text-[10px] font-mono font-bold text-[#183B32] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">IS 15622</span>
                      </div>
                      <span className="text-2xl sm:text-3xl font-black text-[#183B32] font-heading block tabular-nums">
                        3,240 sq.ft
                      </span>
                      <strong className="text-xs font-bold text-[#18211E] block">
                        Vitrified Tiles (800×800)
                      </strong>
                      <span className="text-[11px] text-[#66716B] block leading-tight">
                        Rooms, kitchen, living, bathrooms &amp; parking, includes 10% cutting allowance.
                      </span>
                    </div>

                    <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB] space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#66716B] uppercase">WALL PAINTS</span>
                        <span className="text-[10px] font-mono font-bold text-[#183B32] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">IS 15489</span>
                      </div>
                      <span className="text-2xl sm:text-3xl font-black text-[#183B32] font-heading block tabular-nums">
                        1,944 Litres
                      </span>
                      <strong className="text-xs font-bold text-[#18211E] block">
                        Interior &amp; Exterior Paints
                      </strong>
                      <span className="text-[11px] text-[#66716B] block leading-tight">
                        Putty undercoat, primer base, and two coats of washable acrylic emulsion.
                      </span>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* TAB 5: MILESTONE CASHFLOW (SECTION D)                         */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              {activeTab === 'cashflow' && (
                <motion.div
                  key="cashflow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C66B4E]">
                        SECTION D &bull; CASHFLOW GOVERNANCE
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-[#183B32] font-heading mt-0.5">
                        7-Stage Milestone Disbursement Schedule
                      </h3>
                      <p className="text-xs text-[#66716B]">
                        Protect your money. Only disburse contractor payouts after independent verification of each site stage.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-xs font-bold text-[#183B32]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#347A62]" />
                      <span>Safe Contractor Payments</span>
                    </div>
                  </div>

                  {/* 7 Milestones Table */}
                  <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden">
                    <div className="bg-[#183B32] text-white px-5 py-3 grid grid-cols-12 text-[11px] font-mono font-bold uppercase tracking-wider">
                      <span className="col-span-1">STAGE</span>
                      <span className="col-span-6">CONSTRUCTION MILESTONE EVENT</span>
                      <span className="col-span-2 text-right">DISBURSEMENT</span>
                      <span className="col-span-3 text-right">PAYOUT AMOUNT</span>
                    </div>

                    <div className="divide-y divide-[#E5E7EB] text-xs">
                      {[
                        { stage: 'M1', title: 'Site Mobilization, Excavation & Plinth Beam', pct: '15.0%', val: '₹ 9,58,260', verify: 'Footing depth & plinth steel inspected' },
                        { stage: 'M2', title: 'Ground Floor & 1st Floor Slab Casting', pct: '20.0%', val: '₹ 12,77,680', verify: 'Slab reinforcement & shuttering passed' },
                        { stage: 'M3', title: '2nd Floor & Terrace Slab Casting', pct: '15.0%', val: '₹ 9,58,260', verify: 'Roof concrete cured for 14 days' },
                        { stage: 'M4', title: 'Block Masonry & Internal Sand Plaster', pct: '15.0%', val: '₹ 9,58,260', verify: 'Wall alignment & conduit grooves checked' },
                        { stage: 'M5', title: 'Electrical Wiring, Plumbing & Flooring Tiles', pct: '15.0%', val: '₹ 9,58,260', verify: 'Plumbing hydrostatic pressure test passed' },
                        { stage: 'M6', title: 'Doors, Windows, Painting & External Works', pct: '15.0%', val: '₹ 9,58,260', verify: 'Joinery finish & coat count verified' },
                        { stage: 'M7', title: 'Final Snagging, Testing & Handover Retention', pct: '5.0%', val: '₹ 3,19,420', verify: 'Released 30 days after defect-free occupancy' },
                      ].map((m, idx) => (
                        <div
                          key={m.stage}
                          className={`px-5 py-3.5 grid grid-cols-12 items-center hover:bg-[#F8F8F6] transition-colors ${
                            idx % 2 === 1 ? 'bg-[#FCFCFA]' : 'bg-white'
                          }`}
                        >
                          <span className="col-span-1 font-mono font-bold text-[#183B32]">{m.stage}</span>
                          <div className="col-span-6">
                            <strong className="text-xs font-bold text-[#18211E] block">{m.title}</strong>
                            <span className="text-[10px] text-[#66716B] block mt-0.5">{m.verify}</span>
                          </div>
                          <span className="col-span-2 text-right font-mono font-semibold text-[#66716B]">{m.pct}</span>
                          <span className="col-span-3 text-right font-mono font-extrabold text-[#183B32]">{m.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#EFF5F1] rounded-xl border border-[#DCE5DF] text-xs text-[#183B32] flex items-center justify-between">
                    <span>Total Project Budget Disbursed across 7 Controlled Milestones:</span>
                    <strong className="font-mono text-sm">₹ 63,88,400 (100.0%)</strong>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Bottom Control Rail */}
          <div className="bg-[#F8F8F6] border-t border-[#E5E7EB] px-6 sm:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Previous / Next Tab Flippers */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevTab}
                className="px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#183B32] hover:bg-[#F8F8F6] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Section</span>
              </button>

              <button
                type="button"
                onClick={handleNextTab}
                className="px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#183B32] hover:bg-[#F8F8F6] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Next Section</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <span className="text-xs text-[#66716B] ml-2 hidden sm:inline">
                {currentTab.tabLabel} ({currentTab.pageNumber})
              </span>
            </div>

            {/* Direct CTA */}
            <button
              type="button"
              onClick={handleCreateReport}
              className="w-full sm:w-auto bg-[#183B32] hover:bg-[#245747] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Generate Report for My Plot</span>
              <ArrowRight className="w-4 h-4 text-[#C66B4E]" />
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};