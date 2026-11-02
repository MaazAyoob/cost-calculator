import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizardStore } from '../../store/useWizardStore';
import { modalScaleVariant, backdropFadeVariant } from '../../animations/variants';
import {
  useBudgetResult,
  useArea,
  useQuantities,
} from '../../store/useCalculationStore';
import {
  getCustomizationDiff,
  getPackageConfig,
} from '../../calculation-engine/data/packageConfig';
import { formatCurrency } from '../../utils/cn';
import { AnimatedNumber } from '../../components/common/AnimatedNumber';
import { Architectural3DViewer } from '../../components/3d/Architectural3DViewer';
import {
  TrendingUp,
  TrendingDown,
  Info,
  Calculator,
  X,
  Sparkles,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface LivePreviewPanelProps {
  onOpenPackageComparison?: () => void;
  onReviewAllSelections?: () => void;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  onOpenPackageComparison,
  onReviewAllSelections,
}) => {
  const store = useWizardStore();
  const {
    currentStep,
    city,
    plotLength,
    plotWidth,
    floors,
    materialBrands,
    flooringZones,
    wallCladding,
    doors,
    windows,
    electrical,
    bathroomFittings,
    painting,
    liftRequired,
    evCharging,
    carCount,
    bikeCount,
    houseType,
    qualityTier,
    rooms,
    parkingType,
    selectedPackage,
  } = store;

  const budget = useBudgetResult();
  const area = useArea();
  const quantities = useQuantities();

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = totalCost > 0 && buaSqFt > 0 ? Math.round(totalCost / buaSqFt) : 0;
  const plotArea = area.plotAreaSqFt || (plotLength || 0) * (plotWidth || 0) || 0;
  const remainingGround = area.remainingGroundAreaSqFt || area.remainingGroundArea || Math.max(0, plotArea - (area.buaPerFloorSqFt || 0));

  // Package & customizations
  const pkgConfig = getPackageConfig(selectedPackage || 'PREMIUM');
  const customizations = getCustomizationDiff(selectedPackage || 'PREMIUM', store);

  // Head breakdown
  const structureCost = budget.structuralCost || 0;
  const finishesCost = budget.finishingCost || 0;
  const mepCost = budget.mepCost || ((budget.heads?.find((h) => h.id === 'electrical')?.allocatedAmount || 0) + (budget.heads?.find((h) => h.id === 'plumbingSanitary')?.allocatedAmount || 0));
  const gstAndContingency = (budget.gstAmount || 0) + (budget.contingency || 0);

  // ── Delta Tracking & Change Feedback ──
  const [costDelta, setCostDelta] = useState<number | null>(null);
  const prevCostRef = useRef<number>(totalCost);

  useEffect(() => {
    if (prevCostRef.current > 0 && totalCost > 0 && prevCostRef.current !== totalCost) {
      const diff = totalCost - prevCostRef.current;
      setCostDelta(diff);
      const timer = setTimeout(() => setCostDelta(null), 2800);
      return () => clearTimeout(timer);
    }
    prevCostRef.current = totalCost;
  }, [totalCost]);

  // ── Formula Inspector Modal State ──
  const [inspectorItem, setInspectorItem] = useState<{
    title: string;
    formula: string;
    variables: { label: string; value: string }[];
    standardNorm: string;
    result: string;
  } | null>(null);

  const floorDesc =
    floors === 1
      ? 'Ground floor'
      : floors === 2
      ? 'G + 1 floor'
      : floors === 3
      ? 'G + 2 floors'
      : `G + ${floors - 1} floors`;

  const isZeroState = totalCost === 0;

  return (
    <aside className="w-full bg-white rounded-3xl border-2 border-[#E5E7EB] p-4 sm:p-5 shadow-xs flex flex-col space-y-4 text-left relative text-[#18211E]">
      
      {/* ── 1. SNAPSHOT HEADER ── */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#66716B] block">
            LIVE ESTIMATE SUMMARY
          </span>
          <span className="text-xs font-bold text-[#183B32]">
            {city || 'Bengaluru'} Home Project
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C66B4E] animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-[#183B32] bg-[#E8EFE9] px-2 py-0.5 rounded-md border border-[#B7CDBB]/70">
            UPDATES LIVE
          </span>
        </div>
      </div>

      {/* ── 2. 3D ARCHITECTURAL HOUSE PREVIEW (Properly Proportioned) ── */}
      <div className="w-full h-44 sm:h-48 lg:h-52 rounded-2xl overflow-hidden border-2 border-[#E5E7EB] relative bg-[#183B32] shrink-0 shadow-inner group">
        <Architectural3DViewer
          city={city === 'Other' ? 'Bangalore' : city}
          plotLength={plotLength || 30}
          plotWidth={plotWidth || 40}
          floors={floors || 1}
          parkingType={parkingType}
          carCount={carCount}
          bikeCount={bikeCount}
          evCharging={evCharging}
          liftRequired={liftRequired}
          houseType={houseType}
          qualityTier={qualityTier}
          rooms={rooms}
          materialBrands={materialBrands}
          flooringZones={flooringZones}
          wallCladding={wallCladding}
          doors={doors}
          windows={windows}
          electrical={electrical}
          bathroomFittings={bathroomFittings}
          painting={painting}
          className="w-full h-full"
        />
      </div>

      {/* ── 3. ESTIMATE PREVIEW HERO CARD ── */}
      <div className="p-3.5 bg-[#E8EFE9] rounded-2xl border-2 border-[#B7CDBB]/70 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#183B32]">
            ESTIMATED PROJECT COST
          </span>

          {costDelta !== null && costDelta !== 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9, y: 1 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 ${
                costDelta > 0
                  ? 'bg-[#C66B4E]/20 text-[#C66B4E]'
                  : 'bg-[#183B32]/15 text-[#183B32]'
              }`}
            >
              {costDelta > 0 ? <TrendingUp className="w-2.5 h-2.5 text-[#C66B4E]" /> : <TrendingDown className="w-2.5 h-2.5 text-[#183B32]" />}
              <span>
                {costDelta > 0 ? '+' : ''}
                <AnimatedNumber value={costDelta} format={(v) => formatCurrency(Math.round(v))} duration={300} />
              </span>
            </motion.span>
          )}
        </div>

        <div className="text-2xl sm:text-3xl font-extrabold text-[#183B32] font-heading tracking-tight tabular-nums leading-none">
          {isZeroState ? (
            <span className="text-[#66716B]">₹0</span>
          ) : (
            <AnimatedNumber value={totalCost} format={(v) => formatCurrency(Math.round(v))} duration={400} />
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#66716B] pt-0.5 font-mono">
          <span>
            {ratePerSqFt > 0 ? `@ ₹${ratePerSqFt.toLocaleString()} / sq.ft BUA` : 'Awaiting plot inputs'}
          </span>
          {buaSqFt > 0 && (
            <span className="font-bold text-[#183B32]">{buaSqFt.toLocaleString()} sq.ft BUA</span>
          )}
        </div>
      </div>

      {/* ── 4. SNAPSHOT KEY PARAMETERS (Prototype Clean Stats) ── */}
      <div className="space-y-2 pt-1 border-t border-[#E5E7EB] text-xs">
        
        {/* Selected Package */}
        <div className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB]/70">
          <div>
            <span className="text-[10px] text-[#66716B] block">Selected package</span>
            <div className="flex items-center gap-1.5">
              <b className="text-[13px] text-[#183B32]">{pkgConfig.title}</b>
              {customizations.length > 0 && (
                <span className="text-[9px] font-bold text-[#C66B4E] bg-[#C66B4E]/10 px-1 py-0.2 rounded">
                  {customizations.length} custom
                </span>
              )}
            </div>
          </div>
          {onOpenPackageComparison && (
            <button
              type="button"
              onClick={onOpenPackageComparison}
              className="text-[11px] font-bold text-[#183B32] hover:text-[#245747] flex items-center gap-0.5 cursor-pointer min-h-[32px]"
            >
              <Sparkles className="w-3 h-3 text-[#C66B4E]" />
              <span>Tiers</span>
            </button>
          )}
        </div>

        {/* Plot Area */}
        <div className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB]/70">
          <div>
            <span className="text-[10px] text-[#66716B] block">Plot area</span>
            <b className="text-[13px] text-[#18211E] font-mono">
              {plotArea > 0 ? `${plotArea.toLocaleString()} sq.ft` : '—'}
            </b>
          </div>
          <span className="text-[11px] text-[#66716B] font-mono">
            {plotLength > 0 && plotWidth > 0 ? `${plotLength} × ${plotWidth} ft` : ''}
          </span>
        </div>

        {/* Home Configuration */}
        <div className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB]/70">
          <div>
            <span className="text-[10px] text-[#66716B] block">Home configuration</span>
            <b className="text-[13px] text-[#18211E]">
              {houseType || 'Independent house'} &bull; {floorDesc}
            </b>
          </div>
        </div>

        {/* Rooms */}
        <div className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB]/70">
          <div>
            <span className="text-[10px] text-[#66716B] block">Rooms</span>
            <b className="text-[13px] text-[#18211E]">
              {rooms.bedrooms || 0} bedrooms &bull; {rooms.bathrooms || 0} bathrooms
            </b>
          </div>
          <span className="text-[11px] text-[#66716B]">
            {rooms.kitchen || 1} kitchen
          </span>
        </div>

      </div>

      {/* ── 5. STEP-AWARE TAKEOFF STRIP ── */}
      <div className="space-y-2">
        {currentStep === 1 && (
          <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] text-xs">
            <span className="text-[10px] uppercase font-bold text-[#66716B] block">Plot &amp; Footprint</span>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[#66716B]">Buildable Footprint:</span>
              <b className="text-[#183B32] font-mono">
                {area.buildableFootprintSqFt ? `${area.buildableFootprintSqFt.toLocaleString()} sq.ft` : '—'}
              </b>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
              <span className="text-[9px] font-bold text-[#66716B] block">Doors</span>
              <b className="text-[#183B32] font-mono">{quantities.totalDoorsCount || 8}</b>
            </div>
            <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
              <span className="text-[9px] font-bold text-[#66716B] block">Windows</span>
              <b className="text-[#183B32] font-mono">{quantities.windowsCount || 10}</b>
            </div>
            <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
              <span className="text-[9px] font-bold text-[#66716B] block">Electrical</span>
              <b className="text-[#183B32] font-mono">{quantities.totalElectricalPoints || 120} pts</b>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
              <span className="text-[9px] font-bold text-[#66716B] block">Steel</span>
              <b className="text-[#183B32] font-mono block mt-0.5">
                <AnimatedNumber value={quantities.steelTonnes || 0} decimals={2} duration={350} /> T
              </b>
            </div>
            <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
              <span className="text-[9px] font-bold text-[#66716B] block">Cement</span>
              <b className="text-[#183B32] font-mono block mt-0.5">
                <AnimatedNumber value={quantities.cementBags || 0} duration={350} /> Bags
              </b>
            </div>
            <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
              <span className="text-[9px] font-bold text-[#66716B] block">Masonry</span>
              <b className="text-[#183B32] font-mono block mt-0.5">
                <AnimatedNumber value={quantities.masonryUnitsCount || 0} duration={350} /> {quantities.masonryUnit || 'Nos'}
              </b>
            </div>
          </div>
        )}

        {currentStep >= 4 && currentStep <= 10 && (
          <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-[#183B32] block text-[11px]">
                {currentStep === 4 ? 'Flooring Coverage' : currentStep === 5 ? 'Wall Dado Coverage' : currentStep === 6 ? 'Door Openings' : currentStep === 7 ? 'Window Glazing' : currentStep === 8 ? 'MEP Wiring' : currentStep === 9 ? 'Bathroom Fittings' : 'Paint Surface Area'}
              </span>
              <span className="text-[10px] text-[#66716B]">Materials Needed</span>
            </div>
            <b className="text-[#183B32] font-mono">
              {currentStep === 4 ? (
                `${quantities.floorTilesSqFt || Math.round(buaSqFt * 0.85)} sq.ft`
              ) : currentStep === 5 ? (
                `${quantities.wallTilesSqFt || 580} sq.ft`
              ) : currentStep === 6 ? (
                `${quantities.totalDoorsCount || 8} Sets`
              ) : currentStep === 7 ? (
                `${quantities.windowAreaSqFt || 200} sq.ft`
              ) : currentStep === 8 ? (
                `${quantities.electricalWireMetres || 850}m`
              ) : currentStep === 9 ? (
                `${quantities.bathroomFixtureSets || 3} Sets`
              ) : (
                `${quantities.totalPaintableAreaSqFt || 8000} sq.ft`
              )}
            </b>
          </div>
        )}
      </div>

      {/* ── 6. LABOUR & WORK COSTS BREAKDOWN (When Cost > 0) ── */}
      {totalCost > 0 && (
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-[#E5E7EB] text-[10px]">
          <div className="border-r border-[#E5E7EB] pr-1">
            <span className="block font-bold text-[#66716B] uppercase text-[8.5px]">Structure</span>
            <span className="font-bold text-[#183B32] font-mono tabular-nums block">
              <AnimatedNumber value={structureCost} format={(v) => formatCurrency(Math.round(v))} duration={350} />
            </span>
          </div>
          <div className="border-r border-[#E5E7EB] pr-1">
            <span className="block font-bold text-[#66716B] uppercase text-[8.5px]">Finishes</span>
            <span className="font-bold text-[#183B32] font-mono tabular-nums block">
              <AnimatedNumber value={finishesCost} format={(v) => formatCurrency(Math.round(v))} duration={350} />
            </span>
          </div>
          <div className="border-r border-[#E5E7EB] pr-1">
            <span className="block font-bold text-[#66716B] uppercase text-[8.5px]">MEP</span>
            <span className="font-bold text-[#183B32] font-mono tabular-nums block">
              <AnimatedNumber value={mepCost} format={(v) => formatCurrency(Math.round(v))} duration={350} />
            </span>
          </div>
          <div>
            <span className="block font-bold text-[#687770] uppercase text-[8.5px]">GST/Misc</span>
            <span className="font-bold text-[#183B32] font-mono tabular-nums block">
              <AnimatedNumber value={gstAndContingency} format={(v) => formatCurrency(Math.round(v))} duration={350} />
            </span>
          </div>
        </div>
      )}

      {/* ── 7. ACTION / REVIEW BUTTON ── */}
      <div className="pt-2 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => {
            if (onReviewAllSelections) {
              onReviewAllSelections();
            } else {
              store.setStep(10);
            }
          }}
          className="w-full py-2.5 px-3 rounded-xl border border-[#E5E7EB] bg-[#F8F8F6] hover:bg-white text-xs font-bold text-[#18211E] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs min-h-[44px]"
        >
          <span>Review All Selections</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#C66B4E]" />
        </button>
      </div>

      {/* ── FORMULA INSPECTOR MODAL ── */}
      <AnimatePresence>
        {inspectorItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={backdropFadeVariant}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setInspectorItem(null)}
              className="fixed inset-0 bg-[#183B32]/40 backdrop-blur-xs"
            />
            <motion.div
              variants={modalScaleVariant}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative z-10 bg-white rounded-2xl border-2 border-[#E5E7EB] p-6 max-w-md w-full space-y-4 shadow-xl text-left"
            >
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#183B32]" />
                  <h3 className="text-sm font-bold text-[#183B32] font-heading">{inspectorItem.title}</h3>
                </div>
                <button
                  onClick={() => setInspectorItem(null)}
                  className="p-1 rounded-md text-[#66716B] hover:text-[#18211E] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#E8EFE9] rounded-xl border border-[#B7CDBB]/70 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#C66B4E] uppercase tracking-wider block">
                    ENGINEERING FORMULA
                  </span>
                  <code className="text-xs font-mono font-bold text-[#183B32] block">
                    {inspectorItem.formula}
                  </code>
                </div>

                <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-1.5">
                  {inspectorItem.variables.map((v, i) => (
                    <div key={i} className="flex justify-between items-center py-0.5 border-b border-[#E5E7EB]/60 last:border-0">
                      <span className="text-[#66716B]">{v.label}</span>
                      <span className="font-bold text-[#183B32] font-mono">{v.value}</span>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] text-[11px] text-[#66716B]">
                  <span className="font-bold text-[#183B32] block">Reference Standard:</span>
                  <p>{inspectorItem.standardNorm}</p>
                </div>

                <div className="p-3 bg-[#183B32] text-white rounded-xl flex items-center justify-between font-bold">
                  <span>Calculated Value:</span>
                  <span className="font-mono text-sm text-[#E5D5B4]">{inspectorItem.result}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectorItem(null)}
                  className="bg-[#183B32] hover:bg-[#245747] text-white px-4 py-2 text-xs rounded-xl cursor-pointer min-h-[40px]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </aside>
  );
};
