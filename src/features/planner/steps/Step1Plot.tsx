import React, { useState } from 'react';
import { useWizardStore, ConfiguratorCity, AuthorityOption } from '../../../store/useWizardStore';
import { useArea } from '../../../store/useCalculationStore';
import { evaluatePlotSetbackDetails } from '../../../calculation-engine/data/setbackRules';
import { PlotSetbackDiagram } from '../../../components/common/PlotSetbackDiagram';
import {
  MapPin,
  Compass,
  Check,
  Maximize2,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  Building,
} from 'lucide-react';

interface PresetPlot {
  label: string;
  width: number;
  length: number;
  areaSqFt: number;
  popular?: boolean;
}

const PRESET_PLOTS: PresetPlot[] = [
  { label: "20' × 30'", width: 20, length: 30, areaSqFt: 600 },
  { label: "30' × 40'", width: 30, length: 40, areaSqFt: 1200, popular: true },
  { label: "30' × 50'", width: 30, length: 50, areaSqFt: 1500 },
  { label: "40' × 60'", width: 40, length: 60, areaSqFt: 2400 },
];

const ROAD_WIDTH_PRESETS = [
  { value: 20, label: '20 ft', desc: 'Residential lane' },
  { value: 30, label: '30 ft', desc: 'Standard road', popular: true },
  { value: 40, label: '40 ft', desc: 'Layout avenue' },
  { value: 60, label: '60+ ft', desc: 'Main road' },
];

const CITY_OPTIONS: { id: ConfiguratorCity; authority: AuthorityOption; label: string; desc: string }[] = [
  { id: 'Bangalore', authority: 'BBMP/BDA', label: 'Bangalore', desc: 'BBMP / BDA Municipal Area' },
  { id: 'Mysore', authority: 'MUDA', label: 'Mysore', desc: 'MUDA Municipal Area' },
  { id: 'Other', authority: 'Other / None', label: 'Other City', desc: 'Setback rules may vary' },
];

export const Step1Plot: React.FC = () => {
  const store = useWizardStore();
  const {
    city,
    authority,
    plotLength,
    plotWidth,
    roadWidthFt,
    frontSetback,
    rearSetback,
    leftSetback,
    rightSetback,
    setCity,
    setAuthority,
    setPlotDimensions,
    setRoadWidth,
    setCustomSetbacks,
  } = store;

  const area = useArea();
  const [showDetailedSetbacks, setShowDetailedSetbacks] = useState(false);
  const [showAdvancedSetbacks, setShowAdvancedSetbacks] = useState(false);

  // Fallback defaults if unselected
  const currentLength = plotLength || 40;
  const currentWidth = plotWidth || 30;
  const currentRoadWidth = roadWidthFt || 30;
  const currentCity = city || 'Bangalore';
  const plotArea = currentLength * currentWidth;

  // Evaluate authoritative setbacks according to our locked Bengaluru & Mysuru rules
  const setbackEval = evaluatePlotSetbackDetails({
    city: currentCity,
    plotLength: currentLength,
    plotWidth: currentWidth,
  });

  const handleSelectPreset = (preset: PresetPlot) => {
    setPlotDimensions(preset.length, preset.width);
  };

  const handleCustomWidthChange = (val: number) => {
    const valid = Math.max(0, Math.min(200, val));
    setPlotDimensions(currentLength, valid);
  };

  const handleCustomLengthChange = (val: number) => {
    const valid = Math.max(0, Math.min(300, val));
    setPlotDimensions(valid, currentWidth);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Step Header */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-[11px] font-bold text-[#183B32]">
          <Compass className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>STEP 01 OF 05 &bull; PLOT &amp; OPEN SPACES</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
          Tell us about your plot.
        </h2>
        <p className="text-xs sm:text-sm text-[#66716B] leading-relaxed">
          Enter your plot size and city to find out the open space required around your home (setbacks) and your allowable building area.
        </p>
      </div>

      {/* 1. Location Selection */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#18211E] uppercase font-mono tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>1. City &amp; Location Rules</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {CITY_OPTIONS.map((c) => {
            const isSelected = currentCity === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCity(c.id);
                  setAuthority(c.authority);
                }}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs'
                    : 'border-[#E5E7EB] bg-white hover:bg-[#F8F8F6]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#18211E] block">{c.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C66B4E]" />}
                </div>
                <span className="text-[11px] text-[#66716B] block mt-0.5">{c.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Plot Dimensions (Presets + Custom) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#18211E] uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-[#C66B4E]" />
            <span>2. Plot Dimensions</span>
          </label>
          <span className="text-xs font-mono font-bold text-[#183B32] bg-[#E8EFE9] px-2.5 py-0.5 rounded-md border border-[#B7CDBB]">
            Area: {plotArea.toLocaleString()} sq.ft {plotArea > 0 ? `(~${(plotArea / 10.7639).toFixed(1)} sq.m)` : ''}
          </span>
        </div>

        {/* Popular Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_PLOTS.map((p) => {
            const isSelected = currentWidth === p.width && currentLength === p.length;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-[#183B32] bg-[#183B32] text-white shadow-xs'
                    : 'border-[#E5E7EB] bg-white hover:bg-[#F8F8F6] text-[#18211E]'
                }`}
              >
                <span className={`block text-xs sm:text-sm font-bold font-mono ${isSelected ? 'text-white' : 'text-[#18211E]'}`}>
                  {p.label}
                </span>
                <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#66716B]'}`}>
                  {p.areaSqFt.toLocaleString()} sq.ft
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Width & Depth Inputs */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
          <div>
            <label className="text-xs font-semibold text-[#66716B] block mb-1">
              Plot Width (ft)
            </label>
            <div className="relative">
              <input
                type="number"
                min={10}
                max={200}
                value={currentWidth || ''}
                onChange={(e) => handleCustomWidthChange(Number(e.target.value))}
                className="w-full bg-white border border-[#CBD5CB] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#18211E] focus:outline-none focus:border-[#183B32]"
                placeholder="Width in ft"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[#66716B] font-mono pointer-events-none">ft</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#66716B] block mb-1">
              Plot Length (ft)
            </label>
            <div className="relative">
              <input
                type="number"
                min={10}
                max={300}
                value={currentLength || ''}
                onChange={(e) => handleCustomLengthChange(Number(e.target.value))}
                className="w-full bg-white border border-[#CBD5CB] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#18211E] focus:outline-none focus:border-[#183B32]"
                placeholder="Length in ft"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[#66716B] font-mono pointer-events-none">ft</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Road Width in front of plot */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#18211E] uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>3. Road Width in Front of Your Plot</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ROAD_WIDTH_PRESETS.map((rw) => {
            const isSelected = currentRoadWidth === rw.value;
            return (
              <button
                key={rw.value}
                type="button"
                onClick={() => setRoadWidth(rw.value)}
                className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-[#183B32] bg-[#183B32] text-white shadow-xs'
                    : 'border-[#E5E7EB] bg-white hover:bg-[#F8F8F6] text-[#18211E]'
                }`}
              >
                <span className={`block text-xs font-bold font-mono ${isSelected ? 'text-white' : 'text-[#18211E]'}`}>
                  {rw.label}
                </span>
                <span className={`block text-[10px] mt-0.5 truncate ${isSelected ? 'text-white/80' : 'text-[#66716B]'}`}>
                  {rw.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* 4. COMPACT REQUIRED OPEN SPACE & BUILDABLE SUMMARY                        */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div className="p-4 rounded-2xl bg-[#FAF4E8] border border-[#EADBBD] space-y-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#347A62]" />
            <h3 className="text-sm sm:text-base font-extrabold text-[#183B32] font-heading">
              Required open space
            </h3>
            {setbackEval.isSupportedLocation && !setbackEval.isOutOfScope && (
              <span className="text-[10px] font-mono text-[#66716B] bg-white px-2 py-0.5 rounded border border-[#CBD5CB]">
                {setbackEval.authorityName}
              </span>
            )}
          </div>

          {setbackEval.isSupportedLocation && !setbackEval.isOutOfScope && (
            <div className="text-xs font-semibold text-[#183B32] bg-[#E8EFE9] px-2.5 py-1 rounded-lg border border-[#B7CDBB] flex items-center gap-1.5">
              <span>Approx. buildable area:</span>
              <strong className="font-mono font-black text-sm text-[#183B32]">
                {setbackEval.buildableFootprintSqFt.toLocaleString()} sq.ft
              </strong>
            </div>
          )}
        </div>

        {/* ── Compact Summary Metrics (Only when supported and in scope) ── */}
        {setbackEval.isSupportedLocation && !setbackEval.isOutOfScope && (
          <div className="grid grid-cols-3 gap-2 py-0.5 text-xs">
            <div className="bg-white px-3 py-2 rounded-xl border border-[#EADBBD]">
              <span className="text-[10px] text-[#66716B] block">Front</span>
              <strong className="font-mono font-bold text-xs sm:text-sm text-[#183B32]">
                {setbackEval.front.feet} ft
              </strong>
            </div>
            <div className="bg-white px-3 py-2 rounded-xl border border-[#EADBBD]">
              <span className="text-[10px] text-[#66716B] block">Rear</span>
              <strong className="font-mono font-bold text-xs sm:text-sm text-[#183B32]">
                {setbackEval.rear.isZero ? '0 ft' : `${setbackEval.rear.feet} ft`}
              </strong>
            </div>
            <div className="bg-white px-3 py-2 rounded-xl border border-[#EADBBD]">
              <span className="text-[10px] text-[#66716B] block">Side</span>
              <strong className="font-mono font-bold text-xs sm:text-sm text-[#183B32]">
                {setbackEval.sideCondition === 'one_side'
                  ? `${setbackEval.left.feet} ft on one side`
                  : `${setbackEval.left.feet} ft each side`}
              </strong>
            </div>
          </div>
        )}

        {/* ── Case A: Unsupported Location Message ── */}
        {!setbackEval.isSupportedLocation && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Location Rules Not Available</strong>
              <p className="text-amber-800 mt-0.5">
                {setbackEval.unsupportedMessage || 'Setback rules for the selected location are not currently available. Please select Bengaluru or Mysuru for automatic setback calculations.'}
              </p>
            </div>
          </div>
        )}

        {/* ── Case B: Plot Area Above 250 sq. m. Scope Warning ── */}
        {setbackEval.isSupportedLocation && setbackEval.isOutOfScope && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Custom Zoning Required for Plots &gt; 250 sq. m.</strong>
              <p className="text-amber-800 mt-0.5">
                {setbackEval.scopeWarning}
              </p>
            </div>
          </div>
        )}

        {/* ── Expandable Details Control ── */}
        {setbackEval.isSupportedLocation && !setbackEval.isOutOfScope && (
          <div className="pt-2 border-t border-[#EADBBD]/70 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDetailedSetbacks(!showDetailedSetbacks)}
              className="text-xs font-bold text-[#183B32] hover:text-[#C66B4E] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{showDetailedSetbacks ? 'Hide setback details ↑' : 'View setback details ↓'}</span>
              {showDetailedSetbacks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[11px] text-[#66716B] font-mono">
              Footprint: ~{setbackEval.buildableFootprintSqFt} sq.ft
            </span>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* 5. COLLAPSIBLE DETAILED VIEW (HIDDEN BY DEFAULT)                          */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {showDetailedSetbacks && setbackEval.isSupportedLocation && !setbackEval.isOutOfScope && (
          <div className="pt-4 border-t border-[#EADBBD] space-y-4">
            
            {/* Detailed Heading & Explanations */}
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-sm font-bold text-[#183B32]">
                  Space you must leave around your home
                </h4>
                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-[#CBD5CB] text-[#183B32]">
                  {setbackEval.bracketLabel}
                </span>
              </div>
              <p className="text-xs text-[#66716B] leading-relaxed">
                Some space must be left open around your home. These spaces affect where your house can be built and how much area is available.
              </p>
            </div>

            {/* Four Setback Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-white rounded-xl border border-[#CBD5CB] text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-[#66716B] block">Front Setback</span>
                <strong className="text-sm font-bold font-mono text-[#183B32] block">
                  {setbackEval.front.displayFeet}
                </strong>
                <span className="text-[10px] text-[#66716B] block">Road side ({setbackEval.front.displayMeters})</span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-[#CBD5CB] text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-[#66716B] block">Rear Setback</span>
                <strong className="text-sm font-bold font-mono text-[#183B32] block">
                  {setbackEval.rear.displayText}
                </strong>
                <span className="text-[10px] text-[#66716B] block">
                  {setbackEval.rear.isZero ? 'Zero setback' : `Back side (${setbackEval.rear.displayMeters})`}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-[#CBD5CB] text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-[#66716B] block">Left Side</span>
                <strong className="text-sm font-bold font-mono text-[#183B32] block">
                  {setbackEval.left.displayFeet}
                </strong>
                <span className="text-[10px] text-[#66716B] block">
                  {setbackEval.sideCondition === 'one_side' ? 'Required on one side' : `Side open (${setbackEval.left.displayMeters})`}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-[#CBD5CB] text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-[#66716B] block">Right Side</span>
                <strong className="text-sm font-bold font-mono text-[#183B32] block">
                  {setbackEval.right.displayText}
                </strong>
                <span className="text-[10px] text-[#66716B] block">
                  {setbackEval.right.isZero ? 'Build to boundary' : `Side open (${setbackEval.right.displayMeters})`}
                </span>
              </div>
            </div>

            {/* Side Clearance Note */}
            {setbackEval.sideConditionNote && (
              <p className="text-xs text-[#183B32] bg-white p-2.5 rounded-xl border border-[#CBD5CB] font-medium leading-relaxed">
                💡 <span className="font-bold">Side Clearance:</span> {setbackEval.sideConditionNote}
              </p>
            )}

            {/* Visual Top-View Architectural Diagram */}
            <PlotSetbackDiagram evaluation={setbackEval} />

            {/* Space Calculation Summary */}
            <div className="p-3.5 bg-white rounded-xl border border-[#CBD5CB] space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#183B32] block">
                Space Calculation Summary
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#66716B] block">Total Plot Area</span>
                  <strong className="text-xs font-mono font-bold text-[#18211E] block mt-0.5">
                    {plotArea.toLocaleString()} sq.ft
                  </strong>
                </div>

                <div className="p-2 bg-[#FAF4E8] rounded-lg border border-[#EADBBD]">
                  <span className="text-[10px] text-[#C5A46D] font-bold block">Required Open Space</span>
                  <strong className="text-xs font-mono font-bold text-[#18211E] block mt-0.5">
                    {setbackEval.requiredOpenSpaceSqFt.toLocaleString()} sq.ft
                  </strong>
                </div>

                <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#66716B] block">Buildable Dimensions</span>
                  <strong className="text-xs font-mono font-bold text-[#183B32] block mt-0.5">
                    {setbackEval.buildableWidthFt} × {setbackEval.buildableDepthFt} ft
                  </strong>
                </div>

                <div className="p-2 bg-[#E8EFE9] rounded-lg border border-[#B7CDBB]">
                  <span className="text-[10px] text-[#347A62] font-bold block">
                    Approximate space available for your house
                  </span>
                  <strong className="text-xs sm:text-sm font-mono font-black text-[#183B32] block mt-0.5">
                    {setbackEval.buildableFootprintSqFt.toLocaleString()} sq.ft
                  </strong>
                </div>
              </div>
            </div>

            {/* Custom Setback Adjustment Inputs */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedSetbacks(!showAdvancedSetbacks)}
                className="text-[11px] font-bold text-[#183B32] hover:text-[#C66B4E] flex items-center gap-1 cursor-pointer"
              >
                <span>{showAdvancedSetbacks ? 'Hide custom setback inputs' : 'Have a sanctioned plan? Adjust custom setbacks'}</span>
                {showAdvancedSetbacks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvancedSetbacks && (
                <div className="mt-2.5 p-3 bg-white rounded-xl border border-[#CBD5CB] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-[#66716B] block mb-0.5">Front Setback (ft)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={frontSetback ?? setbackEval.front.feet}
                      onChange={(e) => setCustomSetbacks(e.target.value ? Number(e.target.value) : null, rearSetback, leftSetback, rightSetback)}
                      placeholder={String(setbackEval.front.feet)}
                      className="w-full border rounded-lg p-1.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#66716B] block mb-0.5">Rear Setback (ft)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rearSetback ?? setbackEval.rear.feet}
                      onChange={(e) => setCustomSetbacks(frontSetback, e.target.value ? Number(e.target.value) : null, leftSetback, rightSetback)}
                      placeholder={String(setbackEval.rear.feet)}
                      className="w-full border rounded-lg p-1.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#66716B] block mb-0.5">Left Setback (ft)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={leftSetback ?? setbackEval.left.feet}
                      onChange={(e) => setCustomSetbacks(frontSetback, rearSetback, e.target.value ? Number(e.target.value) : null, rightSetback)}
                      placeholder={String(setbackEval.left.feet)}
                      className="w-full border rounded-lg p-1.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#66716B] block mb-0.5">Right Setback (ft)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rightSetback ?? setbackEval.right.feet}
                      onChange={(e) => setCustomSetbacks(frontSetback, rearSetback, leftSetback, e.target.value ? Number(e.target.value) : null)}
                      placeholder={String(setbackEval.right.feet)}
                      className="w-full border rounded-lg p-1.5 font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mandatory Planning Disclaimer */}
            <p className="text-[11px] text-[#66716B] italic leading-relaxed pt-1 border-t border-[#CBD5CB]/60">
              {setbackEval.disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
