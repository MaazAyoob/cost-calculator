import React, { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useArea } from '../../../store/useCalculationStore';
import { evaluatePlotSetbacks } from '../../../calculation-engine/data/authorityRules';
import {
  Compass,
  FileCheck,
  Shovel,
  AlertTriangle,
  Info,
  Maximize2,
  Check,
  HelpCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';

const PLAN_STATUS_OPTIONS = [
  { id: 'sanctioned', label: 'Sanctioned Plan Ready', desc: 'Approved by municipal authority with stamped setbacks' },
  { id: 'rough_sketch', label: 'Rough Sketch / Concept', desc: 'Architect drawing or self-made floorplan sketch' },
  { id: 'starting_fresh', label: 'Starting Fresh', desc: 'No drawings yet — planning from plot dimensions' },
];

const SITE_CONDITION_OPTIONS = [
  { id: 'flat', label: 'Plain Flat Ground', desc: 'Even terrain, standard foundation depth' },
  { id: 'sloping', label: 'Sloping / Uneven Terrain', desc: 'Contour grading or stepped footings may be needed' },
  { id: 'loose_soil', label: 'Soft / Waterlogged Ground', desc: 'Requires deeper excavation or specialized soil test' },
  { id: 'not_sure', label: 'Not Sure', desc: 'We will assume standard firm Bengaluru red soil' },
];

const DEMOLITION_OPTIONS = [
  { id: 'vacant', label: 'Vacant Plot', desc: 'Clear land ready for excavation' },
  { id: 'demolition_needed', label: 'Existing Old Structure', desc: 'Demolition and debris carting required before civil works' },
  { id: 'not_sure', label: 'Not Sure', desc: 'Inspection or boundary survey needed to confirm site obstacles' },
];

export const Stage4BuildableSpace: React.FC = () => {
  const store = useWizardStore();
  const {
    plotLength,
    plotWidth,
    roadWidthFt,
    frontSetback,
    rearSetback,
    leftSetback,
    rightSetback,
    floors,
    setCustomSetbacks,
  } = store;

  const area = useArea();

  const [useCustomSetbacks, setUseCustomSetbacks] = useState<boolean>(
    frontSetback !== null && frontSetback !== undefined
  );
  const [selectedPlanStatus, setSelectedPlanStatus] = useState<string>('starting_fresh');
  const [selectedSiteCondition, setSelectedSiteCondition] = useState<string>('flat');
  const [selectedDemolition, setSelectedDemolition] = useState<string>('vacant');

  // Safely parse plot dimensions with sensible defaults for residential plots
  const safeLength = Math.max(0, Number(plotLength) || 40);
  const safeWidth = Math.max(0, Number(plotWidth) || 30);
  const safeRoadWidth = Math.max(10, Number(roadWidthFt) || 30);

  // Pass custom setbacks if user has overridden statutory norms
  const customSetbacksArg = useCustomSetbacks
    ? {
        frontSetbackFt: typeof frontSetback === 'number' ? frontSetback : undefined,
        rearSetbackFt: typeof rearSetback === 'number' ? rearSetback : undefined,
        leftSetbackFt: typeof leftSetback === 'number' ? leftSetback : undefined,
        rightSetbackFt: typeof rightSetback === 'number' ? rightSetback : undefined,
      }
    : undefined;

  // Evaluate canonical GBA setbacks using the authoritative single options object contract
  const evaluatedSetbacks = evaluatePlotSetbacks({
    plotLength: safeLength,
    plotWidth: safeWidth,
    roadWidthFt: safeRoadWidth,
    customSetbacks: customSetbacksArg,
  });

  const effFront = evaluatedSetbacks.appliedFrontFt ?? 0;
  const effRear = evaluatedSetbacks.appliedRearFt ?? 0;
  const effLeft = evaluatedSetbacks.appliedLeftFt ?? 0;
  const effRight = evaluatedSetbacks.appliedRightFt ?? 0;

  const grossPlotArea = area.plotAreaSqFt > 0 ? area.plotAreaSqFt : safeWidth * safeLength;
  
  // 1. Setback-derived geometric envelope (space inside boundary clearance lines)
  const geometricEnvelopeSqFt = evaluatedSetbacks.buildableFootprintSqFt ?? Math.max(
    0,
    Math.round((safeWidth - (effLeft + effRight)) * (safeLength - (effFront + effRear)))
  );

  // 2. Applicable statutory coverage limit (e.g. 70% for <=1,615 sq.ft, 65% for >1,615 sq.ft)
  const maxCoveragePct = evaluatedSetbacks.maxGroundCoveragePct || area.maxPermissibleCoveragePct || 70;
  const statutoryCoverageLimitSqFt = Math.round(grossPlotArea * (maxCoveragePct / 100));

  // 3. Derived permissible ground-floor footprint (governed by the stricter constraint)
  const permissibleGroundFootprintSqFt = Math.min(geometricEnvelopeSqFt, statutoryCoverageLimitSqFt);

  // 4. Planned floors and Total Built-Up Area across all floors
  const plannedFloors = floors > 0 ? floors : 2;
  const totalBua = area.totalBUASqFt > 0 
    ? area.totalBUASqFt 
    : Math.round(permissibleGroundFootprintSqFt * plannedFloors);

  const isCoverageConstrained = geometricEnvelopeSqFt > statutoryCoverageLimitSqFt;

  const handleCustomSetbackChange = (field: 'front' | 'rear' | 'left' | 'right', val: number) => {
    const f = field === 'front' ? val : effFront;
    const r = field === 'rear' ? val : effRear;
    const l = field === 'left' ? val : effLeft;
    const rg = field === 'right' ? val : effRight;
    setCustomSetbacks(f, r, l, rg);
  };

  const handleResetToStandard = () => {
    setUseCustomSetbacks(false);
    setCustomSetbacks(null, null, null, null);
  };

  const handleEnableCustomSetbacks = () => {
    setUseCustomSetbacks(true);
    setCustomSetbacks(effFront, effRear, effLeft, effRight);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Stage Header */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-[11px] font-bold text-[#183B32]">
          <Maximize2 className="w-3 h-3 text-[#C66B4E]" />
          <span>STAGE 4 OF 8 &bull; YOUR BUILDABLE SPACE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
          Let's work out how much space you can build on.
        </h2>
        <p className="text-xs sm:text-sm text-[#66716B] leading-relaxed">
          We first work out the space left after required gaps around your home. We then check whether a separate building-coverage limit reduces that space further.
        </p>
      </div>

      {/* 1. Visual Footprint & Space Breakdown */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#18211E] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#C66B4E]" />
            How Much of Your Plot Can You Build On?
          </span>
          <span className="text-[11px] font-mono text-[#66716B]">
            Plot: {plotWidth || 30}' × {plotLength || 40}'
          </span>
        </div>

        {/* 4 Clear Step Pillars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
            <span className="text-[10px] text-[#687770] font-bold block uppercase tracking-wider">1. Plot Boundary</span>
            <span className="text-lg sm:text-xl font-black font-mono text-[#183B32] block mt-0.5">
              {grossPlotArea.toLocaleString()} sq.ft
            </span>
            <span className="text-[10px] text-[#687770] mt-0.5 block">Total land area</span>
          </div>

          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
            <span className="text-[10px] text-[#687770] font-bold block uppercase tracking-wider">2. Space Inside Clearances</span>
            <span className="text-lg sm:text-xl font-black font-mono text-[#183B32] block mt-0.5">
              {Math.round(geometricEnvelopeSqFt).toLocaleString()} sq.ft
            </span>
            <span className="text-[10px] text-[#687770] mt-0.5 block">After boundary gaps</span>
          </div>

          <div className="p-3.5 bg-[#E8EFE9] rounded-2xl border border-[#B7CDBB]">
            <span className="text-[10px] text-[#183B32] font-bold block uppercase tracking-wider">3. Permissible Ground Footprint</span>
            <span className="text-lg sm:text-xl font-black font-mono text-[#183B32] block mt-0.5">
              {Math.round(permissibleGroundFootprintSqFt).toLocaleString()} sq.ft
            </span>
            <span className="text-[10px] text-[#183B32]/80 mt-0.5 block">Max ground-floor area ({maxCoveragePct}% cap)</span>
          </div>

          <div className="p-3.5 bg-[#183B32] text-white rounded-2xl">
            <span className="text-[10px] text-white/70 font-bold block uppercase tracking-wider">4. Total Floor Area (All Floors)</span>
            <span className="text-lg sm:text-xl font-black font-mono text-white block mt-0.5">
              {Math.round(totalBua).toLocaleString()} sq.ft
            </span>
            <span className="text-[10px] text-white/70 mt-0.5 block">Across {plannedFloors} planned floor{plannedFloors > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Clear visual difference note */}
        <div className="p-3 bg-[#F8F9F7] rounded-xl border border-[#E5E7EB] text-xs text-[#4B5563] space-y-1">
          <strong className="text-[#183B32] block">How this works for your home:</strong>
          <p>
            Required open spaces ({effFront} ft front, {effRear} ft rear, {effLeft} ft left, {effRight} ft right) leave a physical space of <strong>{Math.round(geometricEnvelopeSqFt).toLocaleString()} sq.ft</strong>. Building coverage rules allow up to <strong>{maxCoveragePct}% ({statutoryCoverageLimitSqFt.toLocaleString()} sq.ft)</strong>. Your buildable ground floor is the smaller of the two: <strong>{Math.round(permissibleGroundFootprintSqFt).toLocaleString()} sq.ft</strong>.
          </p>
        </div>

        {/* Boundary Setback Distances */}
        <div className="pt-2">
          <span className="text-xs font-bold text-[#183B32] block mb-2">
            Applied Boundary Clearances:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono text-xs">
            <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] text-[#687770] block uppercase">Front (Road)</span>
              <strong className="text-sm text-[#183B32]">{(effFront ?? 0).toFixed(1)} ft</strong>
            </div>
            <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] text-[#687770] block uppercase">Rear</span>
              <strong className="text-sm text-[#183B32]">{(effRear ?? 0).toFixed(1)} ft</strong>
            </div>
            <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] text-[#687770] block uppercase">Left Side</span>
              <strong className="text-sm text-[#183B32]">{(effLeft ?? 0).toFixed(1)} ft</strong>
            </div>
            <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] text-[#687770] block uppercase">Right Side</span>
              <strong className="text-sm text-[#183B32]">{(effRight ?? 0).toFixed(1)} ft</strong>
            </div>
          </div>
        </div>

        {/* Custom clearance input controls when custom mode is active */}
        {useCustomSetbacks && (
          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#CBD5CB] space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#183B32]">
                Enter Custom Clearances (Surveyor / Sanction Plan):
              </span>
              <span className="text-[10px] text-[#687770]">Values in feet</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] text-[#687770] block uppercase font-bold mb-1">Front (ft)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={effFront}
                  onChange={(e) => handleCustomSetbackChange('front', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-[#CBD5CB] rounded-lg text-[#183B32] focus:outline-none focus:border-[#183B32]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#687770] block uppercase font-bold mb-1">Rear (ft)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={effRear}
                  onChange={(e) => handleCustomSetbackChange('rear', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-[#CBD5CB] rounded-lg text-[#183B32] focus:outline-none focus:border-[#183B32]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#687770] block uppercase font-bold mb-1">Left (ft)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={effLeft}
                  onChange={(e) => handleCustomSetbackChange('left', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-[#CBD5CB] rounded-lg text-[#183B32] focus:outline-none focus:border-[#183B32]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#687770] block uppercase font-bold mb-1">Right (ft)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={effRight}
                  onChange={(e) => handleCustomSetbackChange('right', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-[#CBD5CB] rounded-lg text-[#183B32] focus:outline-none focus:border-[#183B32]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Setback mode toggle */}
        <div className="pt-2 flex items-center justify-between text-xs">
          {!useCustomSetbacks ? (
            <button
              type="button"
              onClick={handleEnableCustomSetbacks}
              className="text-[#183B32] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Have specific setbacks from surveyor? Enter custom clearances &rarr;</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetToStandard}
              className="text-[#C66B4E] font-bold hover:underline cursor-pointer"
            >
              &larr; Reset to standard municipal rules
            </button>
          )}
        </div>
      </div>

      {/* 2. Drawing / Sanction Plan Status */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#183B32]">
          2. Do you have sanctioned drawings or sketches?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PLAN_STATUS_OPTIONS.map((plan) => {
            const isSelected = selectedPlanStatus === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanStatus(plan.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs'
                    : 'border-[#E5E7EB] bg-white hover:border-[#183B32]/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-[#183B32]' : 'text-[#202522]'}`}>
                    {plan.label}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-[#183B32]" />}
                </div>
                <span className="text-[11px] text-[#687770] leading-snug block">
                  {plan.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Site Condition & Demolition */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Site Conditions */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#183B32]">
            3. Site Ground Condition
          </label>
          <div className="space-y-2">
            {SITE_CONDITION_OPTIONS.map((cond) => {
              const isSelected = selectedSiteCondition === cond.id;
              return (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => setSelectedSiteCondition(cond.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected ? 'border-[#183B32] bg-[#E8EFE9]' : 'border-[#E5E7EB] bg-white hover:border-[#183B32]/30'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-[#183B32]">{cond.label}</span>
                    <span className="block text-[10px] text-[#687770] truncate">{cond.desc}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#183B32] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Demolition Requirements */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#183B32]">
            4. Demolition or Obstacles
          </label>
          <div className="space-y-2">
            {DEMOLITION_OPTIONS.map((demo) => {
              const isSelected = selectedDemolition === demo.id;
              return (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => setSelectedDemolition(demo.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected ? 'border-[#183B32] bg-[#E8EFE9]' : 'border-[#E5E7EB] bg-white hover:border-[#183B32]/30'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-[#183B32]">{demo.label}</span>
                    <span className="block text-[10px] text-[#687770] truncate">{demo.desc}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#183B32] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Statutory Disclaimer Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-left">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>Planning Note:</strong> Setbacks shown are estimated from gazetted Bengaluru municipal norms. This is an early planning reference and not a confirmed statutory sanction. Always verify legal setbacks with your architect before finalizing foundation excavations.
        </p>
      </div>

    </div>
  );
};
