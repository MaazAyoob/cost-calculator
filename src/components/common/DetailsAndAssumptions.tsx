import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Calculator,
  Home,
  Compass,
  Layers,
  Package,
  IndianRupee,
  AlertCircle,
  ShieldAlert,
  Code,
  Check,
  Info,
  Maximize2,
  Building2,
  FileText,
} from 'lucide-react';
import { useWizardStore } from '../../store/useWizardStore';
import { useCalculationStore, useBudgetResult, useArea, useQuantities } from '../../store/useCalculationStore';
import { formatCurrency } from '../../utils/cn';

interface DetailsAndAssumptionsProps {
  activeStage?: number;
  className?: string;
  triggerLabel?: string;
  initialOpen?: boolean;
}

export const DetailsAndAssumptions: React.FC<DetailsAndAssumptionsProps> = ({
  activeStage = 1,
  className = '',
  triggerLabel = 'Details & assumptions',
  initialOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [activeCategory, setActiveCategory] = useState<string>('how_calculated');
  const [showTechnicalFormulas, setShowTechnicalFormulas] = useState(false);

  const store = useWizardStore();
  const calculation = useCalculationStore((state) => state.result);
  const budget = useBudgetResult();
  const area = useArea();
  const quantities = useQuantities();

  const {
    city,
    authority,
    plotLength,
    plotWidth,
    roadWidthFt,
    floors,
    houseType,
    parkingType,
    selectedPackage,
    frontSetback,
    rearSetback,
    leftSetback,
    rightSetback,
  } = store;

  // Safe numerical fallbacks
  const safeLength = Number(plotLength) || 40;
  const safeWidth = Number(plotWidth) || 30;
  const grossPlotArea = area.plotAreaSqFt || safeWidth * safeLength;
  const plannedFloors = floors > 0 ? floors : 2;
  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = buaSqFt > 0 && totalCost > 0 ? Math.round(totalCost / buaSqFt) : 1998;

  // Setback and footprint geometry
  const effFront = frontSetback !== null && frontSetback !== undefined ? frontSetback : calculation.area?.setbacks?.frontSetbackFt ?? (calculation.area?.setbacks as any)?.front ?? 3.5;
  const effRear = rearSetback !== null && rearSetback !== undefined ? rearSetback : calculation.area?.setbacks?.rearSetbackFt ?? (calculation.area?.setbacks as any)?.rear ?? 3.5;
  const effLeft = leftSetback !== null && leftSetback !== undefined ? leftSetback : calculation.area?.setbacks?.leftSetbackFt ?? (calculation.area?.setbacks as any)?.left ?? 3.5;
  const effRight = rightSetback !== null && rightSetback !== undefined ? rightSetback : calculation.area?.setbacks?.rightSetbackFt ?? (calculation.area?.setbacks as any)?.right ?? 3.5;

  const geometricEnvelopeSqFt = calculation.area?.buildableFootprintSqFt || Math.max(
    0,
    Math.round((safeWidth - (effLeft + effRight)) * (safeLength - (effFront + effRear)))
  );
  const maxCoveragePct = calculation.area?.maxPermissibleCoveragePct || area.maxPermissibleCoveragePct || 70;
  const statutoryCoverageCapSqFt = Math.round(grossPlotArea * (maxCoveragePct / 100));
  const permissibleGroundFootprintSqFt = Math.min(geometricEnvelopeSqFt, statutoryCoverageCapSqFt);

  // Cost split
  const materialCost = budget.directMaterialCost || Math.round(totalCost * 0.58);
  const labourCost = budget.directLabourCost || Math.round(totalCost * 0.23);
  const fittingsAndServicesCost = Math.max(0, totalCost - (materialCost + labourCost));
  const matPct = totalCost > 0 ? Math.round((materialCost / totalCost) * 100) : 58;
  const labPct = totalCost > 0 ? Math.round((labourCost / totalCost) * 100) : 23;
  const fixPct = Math.max(0, 100 - (matPct + labPct));

  // Handle body scroll lock & escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Categories config with stage relevance
  const categories = [
    {
      id: 'how_calculated',
      title: 'How your estimate is calculated',
      icon: Calculator,
      stages: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
      id: 'home_size',
      title: 'Your home size',
      icon: Home,
      stages: [1, 2, 3, 4, 7, 8],
    },
    {
      id: 'building_rules',
      title: 'Building-space rules',
      icon: Maximize2,
      stages: [1, 4, 7, 8],
    },
    {
      id: 'cost_breakdown',
      title: 'Cost breakdown',
      icon: Layers,
      stages: [5, 6, 7, 8],
    },
    {
      id: 'material_quantities',
      title: 'Material quantities',
      icon: Package,
      stages: [5, 6, 7, 8],
    },
    {
      id: 'rates_pricing',
      title: 'Rates and pricing',
      icon: IndianRupee,
      stages: [5, 6, 7, 8],
    },
    {
      id: 'assumptions',
      title: 'Assumptions and unknowns',
      icon: AlertCircle,
      stages: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
      id: 'limitations',
      title: 'Limitations & exclusions',
      icon: ShieldAlert,
      stages: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
      id: 'technical_details',
      title: 'Technical calculation details',
      icon: Code,
      stages: [1, 2, 3, 4, 5, 6, 7, 8],
    },
  ];

  // Filter categories relevant to current stage
  const relevantCategories = categories.filter((c) => c.stages.includes(activeStage));

  // Ensure active category is valid for current stage
  useEffect(() => {
    if (!relevantCategories.some((c) => c.id === activeCategory) && relevantCategories.length > 0) {
      setActiveCategory(relevantCategories[0].id);
    }
  }, [activeStage]);

  return (
    <>
      {/* ── THE DISCLOSURE CONTROL TRIGGER (Collapsed by default, secondary to Continue) ── */}
      <div className={`pt-3 ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full py-2.5 px-4 rounded-xl border border-[#CBD5CB] bg-[#F8F9F7] hover:bg-[#EFF3F0] text-[#1B3D34] flex items-center justify-between text-xs font-semibold transition-all cursor-pointer group shadow-2xs"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label="Open details and assumptions drawer"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#F28C28]" />
            <span className="font-bold text-[#1B3D34]">{triggerLabel}</span>
            <span className="hidden sm:inline text-[11px] text-[#687770]">
              &bull; Plain explanation, rates, rules &amp; formulas
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[#687770] font-medium group-hover:text-[#1B3D34]">
            <span>Inspect</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
          </div>
        </button>
      </div>

      {/* ── ACCESSIBLE DRAWER / BOTTOM SHEET MODAL ── */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex flex-col justify-end lg:justify-center lg:items-center p-0 lg:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Details and assumptions panel"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#1B3D34]/40 backdrop-blur-xs"
            />

            {/* Main Sheet Container */}
            <motion.div
              initial={{ y: '100%', opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.9 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-white rounded-t-3xl lg:rounded-3xl shadow-xl border border-[#CBD5CB] max-h-[88vh] lg:max-h-[82vh] flex flex-col z-10 overflow-hidden text-left"
            >
              {/* Header */}
              <div className="shrink-0 px-5 sm:px-7 py-4 border-b border-[#E5E7EB] bg-[#F8F8F6] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#EBF3EF] border border-[#D5E5DC] flex items-center justify-center text-[#1B3D34]">
                    <SlidersHorizontal className="w-4 h-4 text-[#F28C28]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black font-heading text-[#1B3D34]">
                      Details &amp; assumptions
                    </h3>
                    <p className="text-[11px] text-[#687770]">
                      Stage {activeStage} of 8 &bull; Transparent formulas, rates, and planning rules
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full border border-[#CBD5CB] bg-white hover:bg-[#F8F9F7] text-[#1B3D34] flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Close details panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body: Two columns on desktop, stacked on mobile */}
              <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Category Selector */}
                <div className="shrink-0 lg:w-64 border-b lg:border-b-0 lg:border-r border-[#E5E7EB] bg-[#FDFDFC] p-3 overflow-x-auto lg:overflow-y-auto no-scrollbar flex lg:flex-col gap-1.5">
                  {relevantCategories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap lg:whitespace-normal text-left ${
                          isSelected
                            ? 'bg-[#1B3D34] text-white shadow-xs font-bold'
                            : 'text-[#4B5563] hover:bg-[#F8F9F7] hover:text-[#1B3D34]'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F28C28]' : 'text-[#687770]'}`} />
                        <span>{cat.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Content Area */}
                <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7 space-y-6 scrollbar-thin">
                  {/* CATEGORY 1: HOW ESTIMATE IS CALCULATED */}
                  {activeCategory === 'how_calculated' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28] block">
                          Estimation Method
                        </span>
                        <h4 className="text-xl font-bold font-heading text-[#1B3D34]">
                          How we estimated your cost
                        </h4>
                      </div>

                      <p className="text-sm text-[#4B5563] leading-relaxed">
                        We estimate the size of your home based on your plot dimensions and floor count, calculate construction costs using Hutty's verified Bengaluru market rates, and add the applicable structural and finishing components.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
                          <span className="text-[10px] font-bold text-[#687770] uppercase block">Home Size Calculation</span>
                          <strong className="text-sm font-bold text-[#1B3D34] block mt-1">
                            {buaSqFt > 0 ? `${buaSqFt.toLocaleString()} sq.ft` : 'Calculated per floor'}
                          </strong>
                          <span className="text-xs text-[#687770] mt-0.5 block">
                            Ground footprint ({permissibleGroundFootprintSqFt.toLocaleString()} sq.ft) × {plannedFloors} planned floor{plannedFloors > 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
                          <span className="text-[10px] font-bold text-[#687770] uppercase block">Rate Applied</span>
                          <strong className="text-sm font-bold text-[#1B3D34] block mt-1">
                            ₹{ratePerSqFt.toLocaleString()}/sq.ft
                          </strong>
                          <span className="text-xs text-[#687770] mt-0.5 block">
                            {selectedPackage || 'PREMIUM'} specification tier &bull; Bangalore baseline
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-[#EBF3EF] rounded-2xl border border-[#D5E5DC] text-xs text-[#1B3D34] space-y-1">
                        <strong>Plain language summary:</strong>
                        <p className="text-[#4B5563]">
                          Every rupee is tied to actual construction trade work (materials, mason labour, carpentry, plumbing, and electrical), not an arbitrary lump-sum guess.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CATEGORY 2: YOUR HOME SIZE */}
                  {activeCategory === 'home_size' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28] block">
                          Area Measurements
                        </span>
                        <h4 className="text-xl font-bold font-heading text-[#1B3D34]">
                          Your home size and plot dimensions
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
                          <span className="text-[10px] text-[#687770] uppercase font-bold block">Gross Plot Area</span>
                          <span className="text-lg font-black font-mono text-[#1B3D34] block mt-0.5">
                            {grossPlotArea.toLocaleString()} sq.ft
                          </span>
                          <span className="text-[10px] text-[#687770] block">
                            {safeWidth}' × {safeLength}' plot
                          </span>
                        </div>

                        <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
                          <span className="text-[10px] text-[#687770] uppercase font-bold block">Ground Footprint</span>
                          <span className="text-lg font-black font-mono text-[#1B3D34] block mt-0.5">
                            {permissibleGroundFootprintSqFt.toLocaleString()} sq.ft
                          </span>
                          <span className="text-[10px] text-[#687770] block">
                            Per floor limit
                          </span>
                        </div>

                        <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
                          <span className="text-[10px] text-[#687770] uppercase font-bold block">Floors Planned</span>
                          <span className="text-lg font-black font-mono text-[#1B3D34] block mt-0.5">
                            {plannedFloors === 1 ? 'Ground floor' : `G+${plannedFloors - 1}`}
                          </span>
                          <span className="text-[10px] text-[#687770] block">
                            {plannedFloors} total levels
                          </span>
                        </div>

                        <div className="p-3.5 bg-[#1B3D34] text-white rounded-2xl">
                          <span className="text-[10px] text-white/70 uppercase font-bold block">Total Built-Up Area</span>
                          <span className="text-lg font-black font-mono text-white block mt-0.5">
                            {buaSqFt.toLocaleString()} sq.ft
                          </span>
                          <span className="text-[10px] text-white/70 block">
                            Gross constructed
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-2">
                        <strong className="text-xs font-bold text-[#1B3D34] block">
                          Karnataka Land Measurement Conversions
                        </strong>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-[#4B5563]">
                          <div>1 Gunta = 1,089 sq.ft</div>
                          <div>1 Cent = 435.6 sq.ft</div>
                          <div>1 Sq.Yard = 9 sq.ft</div>
                          <div>1 Sq.Metre = 10.76 sq.ft</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CATEGORY 3: BUILDING-SPACE RULES */}
                  {activeCategory === 'building_rules' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28] block">
                          Statutory Setbacks &amp; Bylaws
                        </span>
                        <h4 className="text-xl font-bold font-heading text-[#1B3D34]">
                          How much of your plot can you build on?
                        </h4>
                      </div>

                      <p className="text-sm text-[#4B5563] leading-relaxed">
                        We first work out the space left after required gaps around your home (setbacks). We then check whether a separate building-coverage limit reduces that space further.
                      </p>

                      <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB] space-y-3">
                        <strong className="text-xs font-bold text-[#1B3D34] block">
                          Statutory Boundary Clearance Gaps (Setbacks)
                        </strong>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2.5 bg-white rounded-xl border border-[#E5E7EB]">
                            <span className="text-[#687770] block text-[10px] uppercase font-bold">Front (Road)</span>
                            <span className="text-sm font-mono font-bold text-[#1B3D34]">{effFront} ft</span>
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-[#E5E7EB]">
                            <span className="text-[#687770] block text-[10px] uppercase font-bold">Rear (Back)</span>
                            <span className="text-sm font-mono font-bold text-[#1B3D34]">{effRear} ft</span>
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-[#E5E7EB]">
                            <span className="text-[#687770] block text-[10px] uppercase font-bold">Left Side</span>
                            <span className="text-sm font-mono font-bold text-[#1B3D34]">{effLeft} ft</span>
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-[#E5E7EB]">
                            <span className="text-[#687770] block text-[10px] uppercase font-bold">Right Side</span>
                            <span className="text-sm font-mono font-bold text-[#1B3D34]">{effRight} ft</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-[#EBF3EF] rounded-2xl border border-[#D5E5DC] text-xs text-[#1B3D34] space-y-2">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Info className="w-4 h-4 text-[#F28C28]" />
                          <span>Distinction: Geometric Envelope vs. Permissible Footprint</span>
                        </div>
                        <p className="text-[#4B5563] leading-relaxed">
                          • <strong>Setback envelope:</strong> {Math.round(geometricEnvelopeSqFt).toLocaleString()} sq.ft (physical space inside boundary clearances).<br />
                          • <strong>Coverage cap:</strong> {maxCoveragePct}% of plot = {statutoryCoverageCapSqFt.toLocaleString()} sq.ft.<br />
                          • <strong>Permissible footprint:</strong> {permissibleGroundFootprintSqFt.toLocaleString()} sq.ft (governed by the stricter constraint).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CATEGORY 4: COST BREAKDOWN */}
                  {activeCategory === 'cost_breakdown' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28] block">
                          Rupee Allocation
                        </span>
                        <h4 className="text-xl font-bold font-heading text-[#1B3D34]">
                          Where your construction budget goes
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
                          <span className="text-[10px] font-bold uppercase text-[#1B3D34]">Direct Materials ({matPct}%)</span>
                          <span className="text-lg font-black font-mono text-[#1B3D34] block mt-1">
                            {formatCurrency(materialCost)}
                          </span>
                          <span className="text-[11px] text-[#687770] mt-0.5 block">
                            Steel rebar, cement bags, sand, masonry blocks &amp; tiles
                          </span>
                        </div>

                        <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
                          <span className="text-[10px] font-bold uppercase text-[#F28C28]">Site Labour ({labPct}%)</span>
                          <span className="text-lg font-black font-mono text-[#1B3D34] block mt-1">
                            {formatCurrency(labourCost)}
                          </span>
                          <span className="text-[11px] text-[#687770] mt-0.5 block">
                            Masons, bar-benders, carpenters, painters &amp; site helpers
                          </span>
                        </div>

                        <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
                          <span className="text-[10px] font-bold uppercase text-[#4B5563]">Fittings &amp; Services ({fixPct}%)</span>
                          <span className="text-lg font-black font-mono text-[#1B3D34] block mt-1">
                            {formatCurrency(fittingsAndServicesCost)}
                          </span>
                          <span className="text-[11px] text-[#687770] mt-0.5 block">
                            Doors, UPVC windows, plumbing, electrical &amp; taxes
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] text-xs font-mono text-[#4B5563] flex justify-between items-center">
                        <span>Total Reconciled Sum:</span>
                        <strong className="text-[#1B3D34] text-sm">{formatCurrency(totalCost)}</strong>
                      </div>
                    </div>
                  )}

                  {/* CATEGORY 5: MATERIAL QUANTITIES */}
                  {activeCategory === 'material_quantities' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28] block">
                          Physical Takeoff
                        </span>
                        <h4 className="text-xl font-bold font-heading text-[#1B3D34]">
                          Material quantities for your home
                        </h4>
                      </div>

                      <p className="text-xs text-[#4B5563]">
                        Physical quantities are calculated directly by the structural engine using IS 456 coefficients and remain 100% constant regardless of commercial packages.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-[#EBF3EF] rounded-xl border border-[#D5E5DC]">
                          <span className="text-[10px] text-[#1B3D34]/70 font-bold uppercase block">Steel Rebar</span>
                          <span className="text-base font-black font-mono text-[#1B3D34] block mt-0.5">
                            {quantities.steelTonnes || Number(((buaSqFt * 3.2) / 1000).toFixed(2))} Tonnes
                          </span>
                          <span className="text-[10px] text-[#687770]">Fe550D TMT</span>
                        </div>

                        <div className="p-3 bg-[#EBF3EF] rounded-xl border border-[#D5E5DC]">
                          <span className="text-[10px] text-[#1B3D34]/70 font-bold uppercase block">Cement Bags</span>
                          <span className="text-base font-black font-mono text-[#1B3D34] block mt-0.5">
                            {(quantities.cementBags || Math.round(buaSqFt * 0.4)).toLocaleString()} Bags
                          </span>
                          <span className="text-[10px] text-[#687770]">50kg OPC/PPC</span>
                        </div>

                        <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                          <span className="text-[10px] text-[#687770] font-bold uppercase block">M-Sand</span>
                          <span className="text-base font-black font-mono text-[#1B3D34] block mt-0.5">
                            {(quantities.sandCuFt || Math.round(buaSqFt * 1.8)).toLocaleString()} CFT
                          </span>
                          <span className="text-[10px] text-[#687770]">Washed Sand</span>
                        </div>

                        <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                          <span className="text-[10px] text-[#687770] font-bold uppercase block">Masonry Units</span>
                          <span className="text-base font-black font-mono text-[#1B3D34] block mt-0.5">
                            {(quantities.finalBlocksRequired || quantities.masonryUnitsCount || Math.round(buaSqFt * 4.2)).toLocaleString()} Pcs
                          </span>
                          <span className="text-[10px] text-[#687770]">Solid Blocks</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CATEGORY 6: RATES AND PRICING */}
                  {activeCategory === 'rates_pricing' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28] block">
                          Verified Pricing Model
                        </span>
                        <h4 className="text-xl font-bold font-heading text-[#1B3D34]">
                          Rates and pricing transparency
                        </h4>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2 text-xs">
                          <span className="text-[#687770]">Rate Dataset:</span>
                          <strong className="text-[#1B3D34] font-mono">Bengaluru Centralized Rate Master 2026.1</strong>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2 text-xs">
                          <span className="text-[#687770]">Specification Tier:</span>
                          <strong className="text-[#1B3D34]">{selectedPackage || 'PREMIUM'}</strong>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2 text-xs">
                          <span className="text-[#687770]">Taxes &amp; GST:</span>
                          <strong className="text-[#1B3D34]">Included where applicable at statutory rates</strong>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#687770]">Effective Unit Rate:</span>
                          <strong className="text-[#1B3D34] font-mono">₹{ratePerSqFt.toLocaleString()}/sq.ft BUA</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CATEGORY 7: ASSUMPTIONS AND UNKNOWNS */}
                  {activeCategory === 'assumptions' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28] block">
                          Planning Assumptions
                        </span>
                        <h4 className="text-xl font-bold font-heading text-[#1B3D34]">
                          What we assumed for your estimate
                        </h4>
                      </div>

                      <div className="space-y-2.5 text-xs text-[#4B5563]">
                        <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Soil conditions:</strong> Assumed standard firm Bengaluru red soil (SBC 150 kN/m²). Foundation depth assumed 5 ft.</span>
                        </div>
                        <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Terrain:</strong> Flat, vacant plot with straightforward road access for concrete mixer and steel transit trucks.</span>
                        </div>
                        <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Utility connectivity:</strong> Assumed municipal water connection and electricity lines accessible at road frontage.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CATEGORY 8: LIMITATIONS & EXCLUSIONS */}
                  {activeCategory === 'limitations' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28] block">
                          Legal &amp; Engineering Notice
                        </span>
                        <h4 className="text-xl font-bold font-heading text-[#1B3D34]">
                          Important limitations &amp; exclusions
                        </h4>
                      </div>

                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                        <strong className="block font-bold">Preliminary Estimation Notice:</strong>
                        <p className="leading-relaxed">
                          This calculation is an early planning estimate to help homeowners budget with confidence. It does not replace a sanctioned municipal architectural drawing, land survey, or structural engineer's certified structural calculation.
                        </p>
                      </div>

                      <div className="space-y-2 text-xs text-[#4B5563]">
                        <strong className="text-[#1B3D34] block">Standard Exclusions (Quoted Separately):</strong>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Compound perimeter boundary wall and entrance steel gates</li>
                          <li>Deep borewell drilling, casing pipes, and submersible pumps</li>
                          <li>BESCOM permanent 3-phase meter deposit and connection tariffs</li>
                          <li>Modular interior furniture (wardrobes, modular kitchen cabinetry)</li>
                          <li>Passenger lift machinery installation (civil structural shaft is included)</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* CATEGORY 9: TECHNICAL DETAILS */}
                  {activeCategory === 'technical_details' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28] block">
                          Engine Math &amp; Formulas
                        </span>
                        <h4 className="text-xl font-bold font-heading text-[#1B3D34]">
                          Technical calculation formulas
                        </h4>
                      </div>

                      <div className="p-4 bg-[#172722] text-white rounded-2xl font-mono text-xs space-y-2.5 overflow-x-auto">
                        <div className="text-emerald-400 font-bold">// Canonical formulas applied:</div>
                        <div>GrossPlotArea = PlotWidth ({safeWidth}) × PlotLength ({safeLength}) = {grossPlotArea} sq.ft</div>
                        <div>SetbackEnvelope = ({safeWidth} - ({effLeft} + {effRight})) × ({safeLength} - ({effFront} + {effRear})) = {Math.round(geometricEnvelopeSqFt)} sq.ft</div>
                        <div>StatutoryCoverageCap = GrossPlotArea × {maxCoveragePct}% = {statutoryCoverageCapSqFt} sq.ft</div>
                        <div>PermissibleGroundFootprint = min(SetbackEnvelope, StatutoryCoverageCap) = {permissibleGroundFootprintSqFt} sq.ft</div>
                        <div>TotalBUA = PermissibleGroundFootprint × {plannedFloors} Floors = {buaSqFt} sq.ft</div>
                        <div>DirectBudget = TotalBUA × ConfiguredBaseRate = {formatCurrency(totalCost)}</div>
                      </div>

                      <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] text-xs text-[#687770]">
                        Calculation Engine Version: {calculation.rateSourceMetadata?.calculationEngineVersion || 'v2.6.0'} &bull; IS 456:2000 compliant.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sheet Footer */}
              <div className="shrink-0 p-3.5 sm:p-4 bg-[#F8F8F6] border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#687770]">
                <span>All values update in real-time as you modify your home plan.</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1B3D34] text-white font-bold hover:bg-[#142E27] transition-all cursor-pointer text-xs"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
