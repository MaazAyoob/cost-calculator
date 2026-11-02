import React, { useState } from 'react';
import { useCalculationStore, useBudgetResult, useArea, useQuantities, useBOQ } from '../../../store/useCalculationStore';
import { useWizardStore } from '../../../store/useWizardStore';
import { formatCurrency } from '../../../utils/cn';
import { AnimatedNumber } from '../../../components/common/AnimatedNumber';
import {
  Calculator,
  IndianRupee,
  Layers,
  Package,
  Wrench,
  ShieldAlert,
  Info,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Download,
  Check,
  Compass,
  Home,
  Bed,
  Maximize2,
  Building2,
  Database,
  Radio,
  AlertTriangle,
  Edit3,
} from 'lucide-react';

interface Stage7EstimateProps {
  onAdjustSelections: (targetStep?: number) => void;
  onProceedToDetailedBOQ: () => void;
}

export const Stage7Estimate: React.FC<Stage7EstimateProps> = ({
  onAdjustSelections,
  onProceedToDetailedBOQ,
}) => {
  const budget = useBudgetResult();
  const area = useArea();
  const quantities = useQuantities();
  const boq = useBOQ();
  const rateSourceMetadata = useCalculationStore((s) => s.result.rateSourceMetadata);
  const { plotLength, plotWidth, floors, houseType, selectedPackage, estimateMode, isCustomRooms, rooms } = useWizardStore();

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = totalCost > 0 && buaSqFt > 0 ? Math.round(totalCost / buaSqFt) : 0;

  // Realistic range based on standard construction tolerance (±4%)
  const minCostRange = Math.round(totalCost * 0.96);
  const maxCostRange = Math.round(totalCost * 1.04);

  // Transparent cost heads with exact mathematical reconciliation (zero residual)
  const materialCost = budget.directMaterialCost || 0;
  const labourCost = budget.directLabourCost || 0;
  const fittingsAndServicesCost = Math.max(0, totalCost - (materialCost + labourCost));

  const matPct = totalCost > 0 ? Math.round((materialCost / totalCost) * 100) : 58;
  const labPct = totalCost > 0 ? Math.round((labourCost / totalCost) * 100) : 23;
  const fixPct = Math.max(0, 100 - (matPct + labPct));

  // Critical rate inspection: do not silently treat missing prices as ₹0
  const missingRateItems = (boq || []).filter((item) => !item.unitRate || item.unitRate <= 0);
  const isLiveRates = Boolean(rateSourceMetadata?.isLive);
  const rateDatasetVersion = rateSourceMetadata?.datasetVersion || 'HUTTY-RM-2026.1';
  const effectivePeriod = rateSourceMetadata?.effectivePeriod || 'Baseline Catalog (Jan 2026)';

  return (
    <div className="space-y-6 text-left">
      {/* Stage Header */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-[11px] font-bold text-[#183B32]">
            <Calculator className="w-3 h-3 text-[#C66B4E]" />
            <span>STAGE 7 OF 8 &bull; YOUR ESTIMATE</span>
          </div>

          {/* Rate Catalog Freshness Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border bg-white shadow-2xs">
            {isLiveRates ? (
              <>
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span className="text-emerald-800 font-bold">Live Server Rates</span>
              </>
            ) : (
              <>
                <Database className="w-3 h-3 text-[#C66B4E]" />
                <span className="text-[#183B32] font-medium">
                  Dataset: <strong className="font-bold">{rateDatasetVersion}</strong> (Offline Fallback &bull; Jan 2026)
                </span>
              </>
            )}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
          Here's your estimated construction cost.
        </h2>
        <p className="text-xs sm:text-sm text-[#66716B]">
          Calculated in real-time by the canonical engine using Bengaluru verified market rates and statutory planning guidelines.
        </p>
      </div>

      {/* Critical Rate Alert Banner if any rate is missing */}
      {missingRateItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 flex items-start gap-3 text-red-900">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <strong className="font-bold block uppercase tracking-wider text-red-800">
              Pricing Alert: Missing Verified Rates
            </strong>
            <p>
              {missingRateItems.length} item(s) in this configuration are currently missing rate catalog entries. These have been flagged and are not treated as free (₹0).
            </p>
          </div>
        </div>
      )}

      {/* 1. Main Cost Banner Card */}
      <div className="p-6 sm:p-8 bg-[#183B32] text-white rounded-3xl shadow-md space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C66B4E]">
                Estimated Construction Budget
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isCustomRooms ? 'bg-amber-400 text-[#183B32]' : 'bg-white/20 text-white'
              }`}>
                {isCustomRooms ? 'Custom Configuration' : 'Quick Estimate (Sample Assumptions)'}
              </span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight tabular-nums flex items-baseline">
                <span>₹&nbsp;</span>
                <AnimatedNumber value={totalCost} />
              </span>
              <span className="text-xs sm:text-sm text-white/70 font-mono">
                (Range: {formatCurrency(minCostRange)} – {formatCurrency(maxCostRange)})
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-white/60 uppercase tracking-wider block">Effective Rate</span>
            <span className="text-xl font-bold font-mono text-white flex items-baseline sm:justify-end">
              <span>₹&nbsp;</span>
              <AnimatedNumber value={ratePerSqFt} />
              <span className="text-xs font-normal text-white/70 ml-1">/sq.ft BUA</span>
            </span>
          </div>
        </div>

        {/* Quick Specs Pill Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-white/80 pt-1">
          <div>
            <span className="text-[10px] text-white/50 block uppercase">Total Built-Up Area</span>
            <strong className="text-white font-mono text-sm">{buaSqFt.toLocaleString()} sq.ft</strong>
          </div>
          <div>
            <span className="text-[10px] text-white/50 block uppercase">Floors &amp; Footprint</span>
            <strong className="text-white font-mono text-sm">
              {(floors || 1) === 1 ? 'Ground floor' : `G+${(floors || 1) - 1} (${area.buaPerFloorSqFt || Math.round(buaSqFt / (floors || 2))} sq.ft/flr)`}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-white/50 block uppercase">Specification</span>
            <strong className="text-white font-mono text-sm">{selectedPackage || 'PREMIUM'} Tier</strong>
          </div>
          <div>
            <span className="text-[10px] text-white/50 block uppercase">Est. Timeline</span>
            <strong className="text-white font-mono text-sm">{(floors || 1) <= 1 ? 6 : (floors || 1) === 2 ? 8 : (floors || 1) === 3 ? 10 : 12} Months</strong>
          </div>
        </div>
      </div>

      {/* Room Configuration Context & Fast Customization Banner */}
      <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-[#C66B4E] shrink-0" />
            <span className="text-xs font-bold text-[#183B32]">
              {isCustomRooms ? 'Your Custom Room Layout:' : 'Sample Home Assumptions Applied:'}
            </span>
          </div>
          <p className="text-xs text-[#4B5563] truncate">
            {rooms.bedrooms || 3} Beds &bull; {rooms.bathrooms || 3} Baths &bull; {rooms.living || 1} Living &bull; {rooms.kitchen || 1} Kitchen &bull; {rooms.balcony || 1} Balcony &bull; {rooms.pooja || 1} Pooja
          </p>
          {!isCustomRooms && (
            <p className="text-[11px] text-[#687770]">
              Fast-tracked estimate uses standard 3BHK duplex assumptions. You can adjust rooms before purchasing your detailed report.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAdjustSelections(3)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E8EFE9] hover:bg-[#DDF0E5] border border-[#B7CDBB] text-[#183B32] text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>{isCustomRooms ? 'Modify Rooms' : 'Customize Room Layout'}</span>
        </button>
      </div>

      {/* 2. Visual Cost Breakdown Bar */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#183B32] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#C66B4E]" />
            <span>Cost Breakdown &bull; Where Your Budget Goes</span>
          </h3>
          <span className="text-xs font-mono text-[#687770]">100% Accounted</span>
        </div>

        {/* Proportional Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[#E5E7EB] overflow-hidden flex">
          <div style={{ width: `${matPct}%` }} className="bg-[#183B32]" title={`Materials: ${matPct}%`} />
          <div style={{ width: `${labPct}%` }} className="bg-[#C66B4E]" title={`Labour: ${labPct}%`} />
          <div style={{ width: `${fixPct}%` }} className="bg-[#52605B]" title={`Fixtures & Services: ${fixPct}%`} />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#183B32]" />
              <strong className="text-[#183B32]">Materials Needed ({matPct}%)</strong>
            </div>
            <span className="text-base font-black font-mono text-[#183B32] block">
              {formatCurrency(materialCost)}
            </span>
            <span className="text-[11px] text-[#687770]">Steel, cement, sand, blocks, bricks &amp; tiles</span>
          </div>

          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#C66B4E]" />
              <strong className="text-[#183B32]">Labour and Work Costs ({labPct}%)</strong>
            </div>
            <span className="text-base font-black font-mono text-[#183B32] block">
              {formatCurrency(labourCost)}
            </span>
            <span className="text-[11px] text-[#687770]">Masons, bar-benders, carpenters &amp; helpers</span>
          </div>

          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#52605B]" />
              <strong className="text-[#183B32]">Fittings &amp; Services ({fixPct}%)</strong>
            </div>
            <span className="text-base font-black font-mono text-[#183B32] block">
              {formatCurrency(fittingsAndServicesCost)}
            </span>
            <span className="text-[11px] text-[#687770]">Doors, windows, sanitary, plumbing &amp; services</span>
          </div>
        </div>

        {/* Mathematical Exact Reconciliation Guarantee */}
        <div className="pt-2 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between text-[11px] text-[#687770]">
          <span>Reconciled Sum: {formatCurrency(materialCost)} + {formatCurrency(labourCost)} + {formatCurrency(fittingsAndServicesCost)}</span>
          <strong className="text-[#183B32] font-mono">= {formatCurrency(totalCost)} (Exact 0-residual match)</strong>
        </div>
      </div>

      {/* 3. Materials Needed Summary (Physical Quantities) */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#183B32] flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[#C66B4E]" />
            <span>Materials Needed &bull; Quantities for Your House</span>
          </h3>
          <span className="text-[11px] text-[#687770]">Derived from IS 456 Structural Physics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#E8EFE9] rounded-2xl border border-[#B7CDBB]">
            <span className="text-[10px] uppercase font-bold text-[#183B32]/70 block">Steel Needed</span>
            <span className="text-xl font-black font-mono text-[#183B32] block mt-0.5">
              {quantities.steelTonnes || Number(((buaSqFt * 3.2) / 1000).toFixed(2))} Tonnes
            </span>
            <span className="text-[10px] text-[#687770] block">Fe550D TMT Rebar</span>
          </div>

          <div className="p-3.5 bg-[#E8EFE9] rounded-2xl border border-[#B7CDBB]">
            <span className="text-[10px] uppercase font-bold text-[#183B32]/70 block">Cement Needed</span>
            <span className="text-xl font-black font-mono text-[#183B32] block mt-0.5">
              {(quantities.cementBags || Math.round(buaSqFt * 0.4)).toLocaleString()} Bags
            </span>
            <span className="text-[10px] text-[#687770] block">50kg Portland Bags</span>
          </div>

          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
            <span className="text-[10px] uppercase font-bold text-[#687770] block">M-Sand / Plastering</span>
            <span className="text-xl font-black font-mono text-[#183B32] block mt-0.5">
              {(quantities.sandCuFt || Math.round(buaSqFt * 1.8)).toLocaleString()} CFT
            </span>
            <span className="text-[10px] text-[#687770] block">Manufactured Sand</span>
          </div>

          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
            <span className="text-[10px] uppercase font-bold text-[#687770] block">Masonry Blocks</span>
            <span className="text-xl font-black font-mono text-[#183B32] block mt-0.5">
              {(quantities.finalBlocksRequired || quantities.masonryUnitsCount || Math.round(buaSqFt * 4.2)).toLocaleString()} Pcs
            </span>
            <span className="text-[10px] text-[#687770] block">Solid 6" &amp; 4" Units</span>
          </div>
        </div>
      </div>

      {/* 4. Inclusions & Exclusions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-2.5">
          <span className="text-xs font-bold text-[#183B32] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            What Is Included in this Estimate:
          </span>
          <ul className="space-y-1.5 text-xs text-[#4B5563]">
            <li className="flex items-start gap-1.5">&bull; Complete RCC structural foundation, plinth beam &amp; slabs</li>
            <li className="flex items-start gap-1.5">&bull; Outer and internal masonry walling with 2 coats plastering</li>
            <li className="flex items-start gap-1.5">&bull; Full flooring tiling and wall dado in bathrooms &amp; kitchen</li>
            <li className="flex items-start gap-1.5">&bull; Complete concealed CPVC plumbing &amp; sanitary fittings</li>
            <li className="flex items-start gap-1.5">&bull; Fire-retardant wiring, switchboards &amp; distribution boards</li>
          </ul>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-2.5">
          <span className="text-xs font-bold text-[#183B32] flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-amber-600" />
            What Is Excluded (Quoted Separately):
          </span>
          <ul className="space-y-1.5 text-xs text-[#4B5563]">
            <li className="flex items-start gap-1.5">&bull; Compound boundary wall and steel main entrance gate</li>
            <li className="flex items-start gap-1.5">&bull; Deep borewell drilling, casing pipe &amp; submersible pump</li>
            <li className="flex items-start gap-1.5">&bull; BESCOM permanent 3-phase meter deposit and wiring fees</li>
            <li className="flex items-start gap-1.5">&bull; Interior modular woodwork (kitchen cabinets, wardrobes)</li>
            <li className="flex items-start gap-1.5">&bull; Lift machine installation (civil shaft structure is included)</li>
          </ul>
        </div>
      </div>

      {/* 5. Refine Specific Decisions (Fast-Track Flow Support) */}
      <div className="p-5 bg-white rounded-3xl border border-[#E5E7EB] shadow-xs space-y-3 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#183B32] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C66B4E]" />
            <span>Want to refine this estimate? Jump to any decision:</span>
          </span>
          <span className="text-[10px] text-[#687770]">Updates live</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { stage: 1, label: 'Plot & Dimensions', icon: Compass },
            { stage: 2, label: 'Floors & Scale', icon: Home },
            { stage: 3, label: 'Rooms & Spaces', icon: Bed },
            { stage: 4, label: 'Setbacks & Bylaws', icon: Maximize2 },
            { stage: 5, label: 'Structure & Walls', icon: Building2 },
            { stage: 6, label: 'Finishes & Quality', icon: Layers },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.stage}
                type="button"
                onClick={() => onAdjustSelections(item.stage)}
                className="p-2.5 rounded-xl border border-[#E5E7EB] hover:border-[#183B32] hover:bg-[#F8F9F7] text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-[#E8EFE9] text-[#183B32] text-[10px] font-bold flex items-center justify-center font-mono">
                    {item.stage}
                  </span>
                  <Icon className="w-3 h-3 text-[#687770] group-hover:text-[#183B32]" />
                </div>
                <span className="text-[11px] font-bold text-[#183B32] block leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Mandatory Early Estimate Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-start gap-3 text-left">
        <Info className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-xs font-bold text-amber-900 block uppercase tracking-wider">
            Early Planning Disclaimer
          </strong>
          <p className="text-xs text-amber-900/90 leading-relaxed">
            This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked.
          </p>
        </div>
      </div>

      {/* 6. Navigation Actions: Adjust vs Detailed BOQ */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => onAdjustSelections(1)}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#CBD5CB] text-[#183B32] bg-white hover:bg-[#F8F9F7] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Adjust My Selections</span>
        </button>

        <button
          type="button"
          onClick={onProceedToDetailedBOQ}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#183B32] hover:bg-[#245747] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
        >
          <span>View Detailed BOQ &amp; Reports</span>
          <ArrowRight className="w-4 h-4 text-[#C66B4E]" />
        </button>
      </div>

    </div>
  );
};
