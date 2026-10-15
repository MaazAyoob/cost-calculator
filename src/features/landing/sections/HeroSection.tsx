import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  User,
  MapPin,
  Calculator,
  Layers,
  MessageSquare,
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
    if (isAuthenticated) {
      navigate('/calculator');
    } else {
      navigate('/login?redirect=/calculator');
    }
  };

  const handleZoom = (factor: number) => {
    setZoomLevel((prev) => Math.max(0.7, Math.min(1.6, prev * factor)));
  };

  const handleReset = () => {
    setZoomLevel(1);
  };

  return (
    <section className="relative bg-[#F8F8F6] pt-6 pb-0 lg:pt-8 overflow-hidden">
      {/* Background Subtle Blueprint Ambient Texture */}
      <div className="absolute inset-0 pointer-events-none arch-grid-bg opacity-30" />

      {/* Main Two-Column Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: Location Badge, Headline, Calculator & Benefits     */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-6 space-y-4 text-left"
          >
            {/* 1. Location Eyebrow Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3EF] border border-[#D5E5DC] text-xs font-semibold text-[#1B3D34]">
              <MapPin className="w-3.5 h-3.5 text-[#F28C28] fill-[#F28C28]" />
              <span>Residential Cost Calculator &bull; Bangalore</span>
            </div>

            {/* 2. Main Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] xl:text-[3rem] font-black text-[#1B3D34] tracking-tight leading-[1.12]">
                Know your home cost <br />
                <span className="text-[#F28C28]">before</span> you build.
              </h1>
              <p className="text-[#52605B] text-sm sm:text-base font-normal leading-relaxed max-w-lg">
                Estimate your construction cost, explore material quantities and get expert guidance—all in one place.
              </p>
            </div>

            {/* 3. Interactive Calculator Configuration Panel */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8E3] shadow-xs p-5 sm:p-6 space-y-4">
              
              {/* Section A: Plot Size Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sm font-bold text-[#1B3D34]">
                    1. Select plot size
                  </span>
                  <span className="text-xs text-[#687770]">
                    Area:{' '}
                    <strong className="text-[#F28C28] font-bold">
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
                        className={`py-2.5 px-2 rounded-xl text-center transition-all duration-150 ease-out active:scale-95 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34] ${
                          isSelected
                            ? 'bg-[#1B3D34] text-white shadow-xs border border-[#1B3D34]'
                            : 'bg-[#F8F9F7] text-[#42524C] border border-[#E2E8E3] hover:border-[#1B3D34]/40 hover:bg-[#EFF3F0]'
                        }`}
                      >
                        <span className={`block text-xs sm:text-sm font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#1B3D34]'}`}>
                          {plot.label}
                        </span>
                        <span className={`block text-[10px] sm:text-[11px] mt-0.5 leading-tight ${isSelected ? 'text-white/80' : 'text-[#687770]'}`}>
                          {plot.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section B: Floors Selection */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sm font-bold text-[#1B3D34]">
                    2. Select floors
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
                        className={`py-2.5 px-2 rounded-xl text-center transition-all duration-150 ease-out active:scale-95 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34] ${
                          isSelected
                            ? 'bg-[#1B3D34] text-white shadow-xs border border-[#1B3D34]'
                            : 'bg-[#F8F9F7] text-[#42524C] border border-[#E2E8E3] hover:border-[#1B3D34]/40 hover:bg-[#EFF3F0]'
                        }`}
                      >
                        <span className={`block text-xs sm:text-sm font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#1B3D34]'}`}>
                          {f.label}
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
                  className="flex-1 bg-[#1B3D34] hover:bg-[#142E27] text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] min-h-[48px]"
                >
                  <span>Start Free Estimate</span>
                  <ArrowRight className="w-4 h-4 text-[#F28C28]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate('/consult');
                    } else {
                      navigate('/login?redirect=/consult');
                    }
                  }}
                  className="bg-white hover:bg-[#F8F9F7] text-[#1B3D34] border border-[#D7DFD9] font-semibold text-sm py-3.5 px-5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] min-h-[48px]"
                >
                  <User className="w-4 h-4 text-[#1B3D34]" />
                  <span>Consult an Expert — ₹1,499</span>
                </button>
              </div>

            </div>

            {/* 4. Benefits below Calculator Panel */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF3EF] border border-[#D5E5DC] flex items-center justify-center text-[#1B3D34] shrink-0">
                  <Calculator className="w-4 h-4 text-[#1B3D34]" />
                </div>
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-[#1B3D34] block leading-tight truncate">
                    Accurate estimates
                  </strong>
                  <span className="text-[11px] text-[#687770] block leading-tight mt-0.5 truncate">
                    Based on real data
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF3EF] border border-[#D5E5DC] flex items-center justify-center text-[#1B3D34] shrink-0">
                  <Layers className="w-4 h-4 text-[#1B3D34]" />
                </div>
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-[#1B3D34] block leading-tight truncate">
                    Material quantities
                  </strong>
                  <span className="text-[11px] text-[#687770] block leading-tight mt-0.5 truncate">
                    With brand options
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF3EF] border border-[#D5E5DC] flex items-center justify-center text-[#1B3D34] shrink-0">
                  <MessageSquare className="w-4 h-4 text-[#1B3D34]" />
                </div>
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-[#1B3D34] block leading-tight truncate">
                    Expert guidance
                  </strong>
                  <span className="text-[11px] text-[#687770] block leading-tight mt-0.5 truncate">
                    When you need it
                  </span>
                </div>
              </div>
            </div>

          </motion.div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: Architectural Visualization & Metric Cards         */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            style={{ scale: heroScale }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-6 relative w-full"
          >
            {/* Visualizer Framed Container */}
            <div className="relative rounded-3xl overflow-hidden border border-[#DDE4DF] shadow-sm bg-[#112821] w-full h-[340px] sm:h-[390px] lg:h-[420px]">
              
              {/* View 1: Photorealistic Architectural Render (Default 2D Mode) */}
              {viewMode === '2D' && (
                <div className="w-full h-full relative overflow-hidden bg-slate-900">
                  <img
                    src={heroHouseImg}
                    alt="Contemporary Bangalore Indian residential house G+2 duplex architecture"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                  {/* Subtle vignette gradient for readable text overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />
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
              <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-lg border border-[#E5E7EB] text-left max-w-[165px] xs:max-w-[200px] sm:max-w-[220px]">
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#687770] block leading-tight">
                  Estimated Construction Cost
                </span>
                <span className="text-lg sm:text-2xl font-black text-[#1B3D34] block font-heading tracking-tight mt-0.5 sm:mt-1 tabular-nums leading-none">
                  ₹ {formatNumber(totalCost)}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#687770] block mt-0.5 sm:mt-1 font-medium leading-tight">
                  ~ ₹ {ratePerSqFt.toLocaleString()} / sq.ft
                </span>
              </div>

              {/* Floating Top-Right Configuration Chips */}
              <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2">
                <span className="bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-[#1B3D34] shadow-sm border border-[#E5E7EB]">
                  {activeFloorOption.tag}
                </span>
                <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-[#1B3D34] shadow-sm border border-[#E5E7EB] hidden sm:inline-block">
                  {buaSqFt.toLocaleString()} sq.ft built-up area
                </span>
              </div>

              {/* Floating Vertical Control Rail (Right Edge) */}
              <div
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-[#E5E7EB] flex flex-col items-center gap-1.5"
                role="toolbar"
                aria-label="Visualization Controls"
              >
                <button
                  type="button"
                  onClick={() => setViewMode('3D')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === '3D'
                      ? 'bg-[#1B3D34] text-white shadow-xs'
                      : 'text-[#687770] hover:text-[#1B3D34] hover:bg-[#F8F9F7]'
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
                      ? 'bg-[#1B3D34] text-white shadow-xs'
                      : 'text-[#687770] hover:text-[#1B3D34] hover:bg-[#F8F9F7]'
                  }`}
                  title="Switch to architectural photograph render"
                >
                  2D
                </button>

                <div className="w-4 h-px bg-[#E5E7EB] my-0.5" />

                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === '3D' ? '2D' : '3D')}
                  className="p-1.5 rounded-lg text-[#687770] hover:text-[#1B3D34] hover:bg-[#F8F9F7] transition-all cursor-pointer"
                  title="Toggle 3D View"
                >
                  <Box className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleZoom(1.15)}
                  className="p-1.5 rounded-lg text-[#687770] hover:text-[#1B3D34] hover:bg-[#F8F9F7] transition-all cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleZoom(0.85)}
                  className="p-1.5 rounded-lg text-[#687770] hover:text-[#1B3D34] hover:bg-[#F8F9F7] transition-all cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-[#687770] hover:text-[#1B3D34] hover:bg-[#F8F9F7] transition-all cursor-pointer"
                  title="Reset View"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Bottom 4 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-3.5 text-left">
              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E2E8E3] shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#EBF3EF] border border-[#D5E5DC] flex items-center justify-center text-[#1B3D34] mb-2">
                  <Home className="w-4 h-4 text-[#1B3D34]" />
                </div>
                <span className="text-[11px] font-semibold text-[#687770] block leading-tight">
                  Built-up Area
                </span>
                <span className="text-base sm:text-lg font-black text-[#1B3D34] block font-heading tabular-nums mt-0.5 leading-tight">
                  {buaSqFt.toLocaleString()} sq.ft
                </span>
                <span className="text-[11px] text-[#687770] block mt-0.5 leading-tight truncate">
                  {activeFloorOption.desc}
                </span>
              </div>

              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E2E8E3] shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#EBF3EF] border border-[#D5E5DC] flex items-center justify-center text-[#1B3D34] mb-2">
                  <Layers className="w-4 h-4 text-[#1B3D34]" />
                </div>
                <span className="text-[11px] font-semibold text-[#687770] block leading-tight">
                  Steel Required
                </span>
                <span className="text-base sm:text-lg font-black text-[#1B3D34] block font-heading tabular-nums mt-0.5 leading-tight">
                  {steelTonnes}T
                </span>
                <span className="text-[11px] text-[#687770] block mt-0.5 leading-tight truncate">
                  Fe550D TMT
                </span>
              </div>

              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E2E8E3] shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#EBF3EF] border border-[#D5E5DC] flex items-center justify-center text-[#1B3D34] mb-2">
                  <Package className="w-4 h-4 text-[#1B3D34]" />
                </div>
                <span className="text-[11px] font-semibold text-[#687770] block leading-tight">
                  Cement
                </span>
                <span className="text-base sm:text-lg font-black text-[#1B3D34] block font-heading tabular-nums mt-0.5 leading-tight">
                  {cementBags.toLocaleString()} Bags
                </span>
                <span className="text-[11px] text-[#687770] block mt-0.5 leading-tight truncate">
                  Grade 53
                </span>
              </div>

              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E2E8E3] shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#EBF3EF] border border-[#D5E5DC] flex items-center justify-center text-[#1B3D34] mb-2">
                  <Settings className="w-4 h-4 text-[#1B3D34]" />
                </div>
                <span className="text-[11px] font-semibold text-[#687770] block leading-tight">
                  Work Schedule
                </span>
                <span className="text-base sm:text-lg font-black text-[#1B3D34] block font-heading tabular-nums mt-0.5 leading-tight">
                  13 Stages
                </span>
                <span className="text-[11px] text-[#687770] block mt-0.5 leading-tight truncate">
                  Detailed cost report
                </span>
              </div>
            </div>

          </motion.div>

        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* FULL-WIDTH BOTTOM TRUST STRIP                                     */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="w-full bg-[#EFF5F1] border-y border-[#DCE5DF] py-5 px-4 sm:px-6 lg:px-8 mt-8 lg:mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 text-left">
          
          <div className="flex items-center gap-3.5 lg:border-r lg:border-[#D5E1D8] lg:pr-6">
            <div className="w-9 h-9 rounded-xl bg-white/80 border border-[#D5E1D8] flex items-center justify-center text-[#1B3D34] shrink-0 shadow-2xs">
              <Users className="w-4 h-4 text-[#1B3D34]" />
            </div>
            <div className="min-w-0">
              <strong className="text-xs sm:text-sm font-bold text-[#1B3D34] block leading-tight">
                Trusted by homeowners
              </strong>
              <span className="text-xs text-[#52605B] block leading-tight mt-0.5">
                10,000+ estimates created
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 lg:border-r lg:border-[#D5E1D8] lg:px-6">
            <div className="w-9 h-9 rounded-xl bg-white/80 border border-[#D5E1D8] flex items-center justify-center text-[#1B3D34] shrink-0 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#1B3D34]" />
            </div>
            <div className="min-w-0">
              <strong className="text-xs sm:text-sm font-bold text-[#1B3D34] block leading-tight">
                Verified construction experts
              </strong>
              <span className="text-xs text-[#52605B] block leading-tight mt-0.5">
                Architects, engineers &amp; contractors
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 lg:border-r lg:border-[#D5E1D8] lg:px-6">
            <div className="w-9 h-9 rounded-xl bg-white/80 border border-[#D5E1D8] flex items-center justify-center text-[#1B3D34] shrink-0 shadow-2xs">
              <IndianRupee className="w-4 h-4 text-[#1B3D34]" />
            </div>
            <div className="min-w-0">
              <strong className="text-xs sm:text-sm font-bold text-[#1B3D34] block leading-tight">
                Transparent and unbiased
              </strong>
              <span className="text-xs text-[#52605B] block leading-tight mt-0.5">
                No hidden costs
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 lg:pl-6">
            <div className="w-9 h-9 rounded-xl bg-white/80 border border-[#D5E1D8] flex items-center justify-center text-[#1B3D34] shrink-0 shadow-2xs">
              <FileText className="w-4 h-4 text-[#1B3D34]" />
            </div>
            <div className="min-w-0">
              <strong className="text-xs sm:text-sm font-bold text-[#1B3D34] block leading-tight">
                Detailed reports
              </strong>
              <span className="text-xs text-[#52605B] block leading-tight mt-0.5">
                Download BOQ and material list
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
