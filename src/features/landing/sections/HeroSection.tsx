import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  MapPin,
  Calculator,
  Layers,
  FileCheck2,
  Home,
  Package,
  Settings,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Box,
  Users,
  ShieldCheck,
  IndianRupee,
  FileText,
  Compass,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useCustomerAuthStore } from '../../../store/useCustomerAuthStore';
import { useArea, useQuantities, useBudgetResult } from '../../../store/useCalculationStore';
import { Architectural3DViewer } from '../../../components/3d/Architectural3DViewer';
import { formatNumber } from '../../../utils/cn';
import heroHouseImg from '../../../assets/hero-house-render.jpg';

interface PresetPlot {
  label: string;
  dimText: string;
  desc: string;
  length: number;
  width: number;
  baseBua: number;
}

const PRESET_PLOTS: PresetPlot[] = [
  { label: "20' × 30'", dimText: "20' × 30'", desc: '600 sq.ft', length: 30, width: 20, baseBua: 1080 },
  { label: "30' × 40'", dimText: "30' × 40'", desc: '1,200 sq.ft', length: 40, width: 30, baseBua: 2160 },
  { label: "30' × 50'", dimText: "30' × 50'", desc: '1,500 sq.ft', length: 50, width: 30, baseBua: 2700 },
  { label: "40' × 60'", dimText: "40' × 60'", desc: '2,400 sq.ft', length: 60, width: 40, baseBua: 4320 },
];

const FLOOR_OPTIONS = [
  { label: 'Ground', count: 1, tag: 'Ground Floor', desc: 'Ground Floor Only' },
  { label: 'G+1', count: 2, tag: 'G+1 Duplex', desc: 'Ground + 1 Floor' },
  { label: 'G+2', count: 3, tag: 'G+2 Duplex', desc: 'Ground + 2 Floors' },
  { label: 'G+3', count: 4, tag: 'G+3 Residence', desc: 'Ground + 3 Floors' },
];

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const store = useWizardStore();
  const { isAuthenticated } = useCustomerAuthStore();
  const { plotLength, plotWidth, floors, houseType, setPlotDimensions, setHouseConfig, setSelectedPackage } = store;
  const area = useArea();
  const quantities = useQuantities();
  const budget = useBudgetResult();

  // Active state initialized to match reference: 30' x 40' (index 1) and G+2 (3 floors)
  const [activePlotIdx, setActivePlotIdx] = useState(1);
  const [selectedFloorCount, setSelectedFloorCount] = useState(floors || 3);
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('2D');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Dynamic calculations bound to engine store with reference fallback fidelity
  const isDefaultConfig = activePlotIdx === 1 && selectedFloorCount === 3;
  const buaSqFt = area.totalBUASqFt || (isDefaultConfig ? 2160 : PRESET_PLOTS[activePlotIdx].baseBua);
  const totalCost = budget.totalProjectCost || (isDefaultConfig ? 4315144 : Math.round(buaSqFt * 1998));
  const ratePerSqFt = buaSqFt > 0 ? Math.round(totalCost / buaSqFt) : 1998;
  const steelTonnes = quantities.steelTonnes || (isDefaultConfig ? 6.91 : Number(((buaSqFt * 3.2) / 1000).toFixed(2)));
  const cementBags = quantities.cementBags || (isDefaultConfig ? 864 : Math.round(buaSqFt * 0.4));

  // Current floor tag and description
  const activeFloorOption = FLOOR_OPTIONS.find((f) => f.count === selectedFloorCount) || FLOOR_OPTIONS[2];

  // Subtle parallax effect on scroll
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.98]);

  const handleSelectPlot = (idx: number) => {
    setActivePlotIdx(idx);
    const p = PRESET_PLOTS[idx];
    setPlotDimensions(p.length, p.width);
  };

  const handleSelectFloor = (count: number) => {
    setSelectedFloorCount(count);
    setHouseConfig(houseType || 'Duplex', count);
  };

  const handleStartEstimate = (pkgId: 'STANDARD' | 'PREMIUM' | 'LUXURY' = 'PREMIUM') => {
    setSelectedPackage(pkgId, true);
    navigate('/calculator');
  };

  const handleZoom = (factor: number) => {
    setZoomLevel((prev) => Math.max(0.7, Math.min(1.6, prev * factor)));
  };

  const handleReset = () => {
    setZoomLevel(1);
  };

  return (
    <section className="relative bg-[#F8F8F6] pt-6 pb-0 lg:pt-10 overflow-hidden text-[#18211E]">
      {/* Background Architectural Grid Texture */}
      <div className="absolute inset-0 pointer-events-none arch-grid-bg opacity-30" />

      {/* Subtle Architectural Atmosphere */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#B7CDBB]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-[#B7CDBB]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Two-Column Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: Location Badge, Headline, Calculator & Benefits     */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-6 space-y-5 text-left"
          >
            {/* 1. Location & Confidence Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/80 text-xs font-semibold text-[#183B32]">
              <span className="w-2 h-2 rounded-full bg-[#C66B4E] animate-pulse shrink-0" />
              <MapPin className="w-3.5 h-3.5 text-[#C66B4E]" />
              <span className="tracking-wide">Bangalore Home Planning &bull; Clear Estimates</span>
            </div>

            {/* 2. Headline & Homeowner Narrative */}
            <div className="space-y-3">
              <h1 className="text-3.5xl sm:text-4xl lg:text-[2.85rem] xl:text-[3.25rem] font-extrabold text-[#18211E] font-heading tracking-tight leading-[1.14]">
                Plan your dream home <br className="hidden sm:inline" />
                <span className="text-[#183B32] underline decoration-[#C66B4E] decoration-4 underline-offset-8">
                  with confidence.
                </span>
              </h1>
              <p className="text-[#66716B] text-base sm:text-lg font-normal leading-relaxed max-w-lg">
                Choose your plot size and floors. Hutty helps you understand the materials you need and the cost of building your home.
              </p>
            </div>

            {/* 3. Interactive Calculator Configuration Panel */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-sm p-5 sm:p-6 space-y-4">
              
              {/* Section A: Plot Size Selection */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sm font-bold text-[#18211E] flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#C66B4E]" />
                    1. Select plot size
                  </span>
                  <span className="text-xs text-[#66716B]">
                    Plot:{' '}
                    <strong className="text-[#C66B4E] font-bold">
                      {PRESET_PLOTS[activePlotIdx].desc}
                    </strong>{' '}
                    ({PRESET_PLOTS[activePlotIdx].dimText})
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                  {PRESET_PLOTS.map((plot, i) => {
                    const isSelected = activePlotIdx === i;
                    return (
                      <button
                        key={plot.label}
                        type="button"
                        onClick={() => handleSelectPlot(i)}
                        className={`min-h-[46px] py-2 px-2 rounded-xl text-center transition-all duration-150 ease-out active:scale-95 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#183B32] ${
                          isSelected
                            ? 'bg-[#183B32] text-white shadow-xs border border-[#183B32]'
                            : 'bg-[#F8F8F6] text-[#18211E] border border-[#E5E7EB] hover:border-[#183B32]/40 hover:bg-white'
                        }`}
                      >
                        <span className={`block text-xs sm:text-sm font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#18211E]'}`}>
                          {plot.label}
                          {isSelected && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C66B4E] ml-1 align-middle" />}
                        </span>
                        <span className={`block text-[10px] sm:text-[11px] mt-0.5 leading-tight ${isSelected ? 'text-white/80' : 'text-[#66716B]'}`}>
                          {plot.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section B: Floors Selection */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sm font-bold text-[#18211E] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#C66B4E]" />
                    2. Select floors
                  </span>
                  <span className="text-xs text-[#66716B]">
                    Built-up:{' '}
                    <strong className="text-[#183B32] font-bold">
                      {buaSqFt.toLocaleString()} sq.ft
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                  {FLOOR_OPTIONS.map((f) => {
                    const isSelected = selectedFloorCount === f.count;
                    return (
                      <button
                        key={f.count}
                        type="button"
                        onClick={() => handleSelectFloor(f.count)}
                        className={`min-h-[46px] py-2.5 px-2 rounded-xl text-center transition-all duration-150 ease-out active:scale-95 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#183B32] ${
                          isSelected
                            ? 'bg-[#183B32] text-white shadow-xs border border-[#183B32]'
                            : 'bg-[#F8F8F6] text-[#18211E] border border-[#E5E7EB] hover:border-[#183B32]/40 hover:bg-white'
                        }`}
                      >
                        <span className={`block text-xs sm:text-sm font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#18211E]'}`}>
                          {f.label}
                          {isSelected && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C66B4E] ml-1 align-middle" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section C: Action Buttons Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStartEstimate('PREMIUM')}
                  className="flex-1 bg-[#183B32] hover:bg-[#245747] text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] min-h-[48px]"
                >
                  <span>Plan My Home</span>
                  <ArrowRight className="w-4 h-4 text-[#C66B4E]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigate('/how-it-works');
                    }
                  }}
                  className="bg-white hover:bg-[#F8F8F6] text-[#183B32] border border-[#183B32]/40 font-semibold text-sm py-3.5 px-5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] min-h-[48px]"
                >
                  <span>See How It Works</span>
                </button>
              </div>

            </div>

            {/* 4. Three Homeowner Trust Indicators Below Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-left">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#E8EFE9] border border-[#B7CDBB]/70 flex items-center justify-center text-[#183B32] shrink-0">
                  <Calculator className="w-4 h-4 text-[#183B32]" />
                </div>
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-[#183B32] block leading-tight truncate">
                    Free Instant Estimate
                  </strong>
                  <span className="text-[11px] text-[#66716B] block leading-tight mt-0.5 truncate">
                    No signup or phone needed
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#E8EFE9] border border-[#B7CDBB]/70 flex items-center justify-center text-[#183B32] shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#347A62]" />
                </div>
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-[#183B32] block leading-tight truncate">
                    Bangalore Building Rules
                  </strong>
                  <span className="text-[11px] text-[#66716B] block leading-tight mt-0.5 truncate">
                    Setbacks &amp; floors verified
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#E8EFE9] border border-[#B7CDBB]/70 flex items-center justify-center text-[#183B32] shrink-0">
                  <FileCheck2 className="w-4 h-4 text-[#C66B4E]" />
                </div>
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-[#183B32] block leading-tight truncate">
                    Real Material Quantities
                  </strong>
                  <span className="text-[11px] text-[#66716B] block leading-tight mt-0.5 truncate">
                    Steel, cement &amp; blocks
                  </span>
                </div>
              </div>
            </div>

          </motion.div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: Architectural Visualization & Layered Overlay       */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            style={{ scale: heroScale }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-6 relative w-full"
          >
            {/* Visualizer Framed Container */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#CBD5CB] shadow-md bg-[#183B32] w-full h-[360px] sm:h-[400px] lg:h-[430px]">
              
              {/* View 1: Photorealistic Architectural Render (Default 2D Mode) */}
              {viewMode === '2D' && (
                <div className="w-full h-full relative overflow-hidden bg-[#183B32]">
                  <img
                    src={heroHouseImg}
                    alt="Contemporary Bangalore Indian residential house G+2 duplex architecture"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                  {/* Subtle architectural blueprint grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

                  {/* Architectural Dimension Lines & Blueprint Annotations */}
                  <div className="absolute bottom-3 left-4 right-4 pointer-events-none flex items-center justify-between text-[10px] text-white/80 font-mono tracking-wider bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/10">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C66B4E]" />
                      FRONTAGE: {PRESET_PLOTS[activePlotIdx].width}&apos;-0&quot;
                    </span>
                    <span>DEPTH: {PRESET_PLOTS[activePlotIdx].length}&apos;-0&quot;</span>
                    <span>STRUCTURAL HEIGHT: {selectedFloorCount * 10 + 3}&apos;-6&quot;</span>
                  </div>

                  {/* Subtle vignette gradient for readable text overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35 pointer-events-none" />
                </div>
              )}

              {/* View 2: Live Interactive Three.js 3D Building Viewer */}
              {viewMode === '3D' && (
                <div className="w-full h-full relative">
                  <Architectural3DViewer
                    plotLength={plotLength || 40}
                    plotWidth={plotWidth || 30}
                    floors={selectedFloorCount || 3}
                    hideInternalControls={true}
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* Floating Top-Left Estimated Cost Card */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-[#E5E7EB] text-left max-w-[170px] xs:max-w-[210px] sm:max-w-[230px]">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#66716B] block leading-tight">
                    Estimated Construction Cost
                  </span>
                </div>
                <span className="text-lg sm:text-2xl font-black text-[#183B32] block font-heading tracking-tight mt-0.5 sm:mt-1 tabular-nums leading-none">
                  ₹ {formatNumber(totalCost)}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#66716B] block mt-1 font-medium leading-tight">
                  ~ ₹ {ratePerSqFt.toLocaleString()} / sq.ft &bull; {buaSqFt.toLocaleString()} sq.ft BUA
                </span>
              </div>

              {/* Floating Top-Right Configuration Chips */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2">
                <span className="bg-[#183B32]/90 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-white shadow-sm border border-white/20">
                  {activeFloorOption.tag}
                </span>
              </div>

              {/* Floating Tactile Material Chips Overlaid on Render */}
              {viewMode === '2D' && (
                <div className="absolute bottom-12 left-3 sm:left-4 z-20 hidden xs:flex flex-wrap gap-2 max-w-[85%] pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C66B4E]" />
                    Tata Tiscon Fe550D TMT
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D]" />
                    UltraTech 53G Cement
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-xs hidden sm:inline-flex">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B7CDBB]" />
                    Granite Slab &amp; Teak Joinery
                  </span>
                </div>
              )}

              {/* Floating Vertical Control Rail (Right Edge) */}
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-[#E5E7EB] flex flex-col items-center gap-1.5"
                role="toolbar"
                aria-label="Visualization Controls"
              >
                <button
                  type="button"
                  onClick={() => setViewMode('3D')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === '3D'
                      ? 'bg-[#183B32] text-white shadow-xs'
                      : 'text-[#66716B] hover:text-[#183B32] hover:bg-[#F8F8F6]'
                  }`}
                  title="Switch to interactive 3D model"
                >
                  3D
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('2D')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === '2D'
                      ? 'bg-[#183B32] text-white shadow-xs'
                      : 'text-[#66716B] hover:text-[#183B32] hover:bg-[#F8F8F6]'
                  }`}
                  title="Switch to architectural photograph render"
                >
                  2D
                </button>

                <div className="w-4 h-px bg-[#E5E7EB] my-0.5" />

                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === '3D' ? '2D' : '3D')}
                  className="p-1.5 rounded-lg text-[#66716B] hover:text-[#183B32] hover:bg-[#F8F8F6] transition-all cursor-pointer"
                  title="Toggle 3D View"
                >
                  <Box className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleZoom(1.15)}
                  className="p-1.5 rounded-lg text-[#66716B] hover:text-[#183B32] hover:bg-[#F8F8F6] transition-all cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleZoom(0.85)}
                  className="p-1.5 rounded-lg text-[#66716B] hover:text-[#183B32] hover:bg-[#F8F8F6] transition-all cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-[#66716B] hover:text-[#183B32] hover:bg-[#F8F8F6] transition-all cursor-pointer"
                  title="Reset View"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Bottom 4 Homeowner Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-3.5 text-left">
              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:border-[#183B32] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#E8EFE9] border border-[#B7CDBB]/80 flex items-center justify-center text-[#183B32] mb-2">
                  <Home className="w-4 h-4 text-[#183B32]" />
                </div>
                <span className="text-[11px] font-semibold text-[#66716B] block leading-tight">
                  Total Built-up Area
                </span>
                <span className="text-base sm:text-lg font-black text-[#183B32] block font-heading tabular-nums mt-0.5 leading-tight">
                  {buaSqFt.toLocaleString()} sq.ft
                </span>
                <span className="text-[11px] text-[#66716B] block mt-0.5 leading-tight truncate">
                  {activeFloorOption.desc}
                </span>
              </div>

              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:border-[#183B32] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#E8EFE9] border border-[#B7CDBB]/80 flex items-center justify-center text-[#183B32] mb-2">
                  <Layers className="w-4 h-4 text-[#C66B4E]" />
                </div>
                <span className="text-[11px] font-semibold text-[#66716B] block leading-tight">
                  Steel Needed
                </span>
                <span className="text-base sm:text-lg font-black text-[#183B32] block font-heading tabular-nums mt-0.5 leading-tight">
                  {steelTonnes} Tonnes
                </span>
                <span className="text-[11px] text-[#66716B] block mt-0.5 leading-tight truncate">
                  Columns, beams &amp; slabs
                </span>
              </div>

              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:border-[#183B32] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#E8EFE9] border border-[#B7CDBB]/80 flex items-center justify-center text-[#183B32] mb-2">
                  <Package className="w-4 h-4 text-[#347A62]" />
                </div>
                <span className="text-[11px] font-semibold text-[#66716B] block leading-tight">
                  Cement Needed
                </span>
                <span className="text-base sm:text-lg font-black text-[#183B32] block font-heading tabular-nums mt-0.5 leading-tight">
                  {cementBags.toLocaleString()} Bags
                </span>
                <span className="text-[11px] text-[#66716B] block mt-0.5 leading-tight truncate">
                  Foundations &amp; masonry
                </span>
              </div>

              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:border-[#183B32] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#E8EFE9] border border-[#B7CDBB]/80 flex items-center justify-center text-[#183B32] mb-2">
                  <Settings className="w-4 h-4 text-[#C5A46D]" />
                </div>
                <span className="text-[11px] font-semibold text-[#66716B] block leading-tight">
                  Building Stages
                </span>
                <span className="text-base sm:text-lg font-black text-[#183B32] block font-heading tabular-nums mt-0.5 leading-tight">
                  13 Milestones
                </span>
                <span className="text-[11px] text-[#66716B] block mt-0.5 leading-tight truncate">
                  Turnkey plan
                </span>
              </div>
            </div>

          </motion.div>

        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* FULL-WIDTH BOTTOM TRUST STRIP                                     */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="w-full bg-[#EFF5F1] border-y border-[#DCE5DF] py-5 px-4 sm:px-6 lg:px-8 mt-10 lg:mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 text-left">
          
          <div className="flex items-center gap-3.5 lg:border-r lg:border-[#DCE5DF] lg:pr-6">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#DCE5DF] flex items-center justify-center text-[#183B32] shrink-0 shadow-2xs">
              <Users className="w-4 h-4 text-[#183B32]" />
            </div>
            <div className="min-w-0">
              <strong className="text-xs sm:text-sm font-bold text-[#183B32] block leading-tight">
                Built for homeowners
              </strong>
              <span className="text-xs text-[#66716B] block leading-tight mt-0.5">
                Instant preliminary estimates
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 lg:border-r lg:border-[#DCE5DF] lg:px-6">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#DCE5DF] flex items-center justify-center text-[#347A62] shrink-0 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#347A62]" />
            </div>
            <div className="min-w-0">
              <strong className="text-xs sm:text-sm font-bold text-[#183B32] block leading-tight">
                Bangalore bye-law checks
              </strong>
              <span className="text-xs text-[#66716B] block leading-tight mt-0.5">
                Permissible setbacks &amp; floor rules
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 lg:border-r lg:border-[#DCE5DF] lg:px-6">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#DCE5DF] flex items-center justify-center text-[#C66B4E] shrink-0 shadow-2xs">
              <IndianRupee className="w-4 h-4 text-[#C66B4E]" />
            </div>
            <div className="min-w-0">
              <strong className="text-xs sm:text-sm font-bold text-[#183B32] block leading-tight">
                Clear, unbiased advice
              </strong>
              <span className="text-xs text-[#66716B] block leading-tight mt-0.5">
                Zero contractor commissions or kickbacks
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 lg:pl-6">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#DCE5DF] flex items-center justify-center text-[#C5A46D] shrink-0 shadow-2xs">
              <FileText className="w-4 h-4 text-[#C5A46D]" />
            </div>
            <div className="min-w-0">
              <strong className="text-xs sm:text-sm font-bold text-[#183B32] block leading-tight">
                Detailed material lists
              </strong>
              <span className="text-xs text-[#66716B] block leading-tight mt-0.5">
                Download your bill of quantities (BOQ)
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
