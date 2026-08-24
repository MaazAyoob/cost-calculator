import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizardStore } from '../../store/useWizardStore';
import {
  useBudgetResult,
  useArea,
  useQuantities,
  useBOQ,
  useBuildingModel,
} from '../../store/useCalculationStore';
import { formatCurrency } from '../../utils/cn';
import { Architectural3DViewer } from '../../components/3d/Architectural3DViewer';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  Compass,
  DoorClosed,
  AppWindow,
  Zap,
  Droplets,
  Paintbrush,
  Info,
  Calculator,
  X,
  TrendingUp,
  TrendingDown,
  Building,
  Ruler,
  Maximize2,
} from 'lucide-react';

export const LivePreviewPanel: React.FC = () => {
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
  } = useWizardStore();

  const budget = useBudgetResult();
  const area = useArea();
  const quantities = useQuantities();
  const buildingModel = useBuildingModel();

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = totalCost > 0 && buaSqFt > 0 ? Math.round(totalCost / buaSqFt) : 0;
  const plotArea = area.plotAreaSqFt || plotLength * plotWidth || 0;
  const remainingGround = area.remainingGroundAreaSqFt || area.remainingGroundArea || Math.max(0, plotArea - (area.buaPerFloorSqFt || 0));

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

  const openInspector = (
    title: string,
    formula: string,
    variables: { label: string; value: string }[],
    standardNorm: string,
    result: string
  ) => {
    setInspectorItem({ title, formula, variables, standardNorm, result });
  };

  return (
    <aside className="w-full bg-white rounded-2xl border border-[#E5E7EB] p-5 lg:p-6 shadow-xs flex flex-col justify-between space-y-4 text-left select-none">
      
      {/* ── 1. PROMINENT ESTIMATE HERO AREA ── */}
      <div className="space-y-3 pb-3 border-b border-[#E5E7EB]">
        
        {/* Top Status & Delta Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1B3D34] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#1B3D34] font-heading">
              ESTIMATED PROJECT COST
            </span>
          </div>

          <div className="flex items-center gap-2">
            {costDelta !== null && costDelta !== 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9, y: 2 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  costDelta > 0
                    ? 'bg-[#F28C28]/15 text-[#D9771A] border border-[#F28C28]/30'
                    : 'bg-[#1B3D34]/10 text-[#1B3D34] border border-[#1B3D34]/20'
                }`}
              >
                {costDelta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{costDelta > 0 ? `+${formatCurrency(costDelta)}` : formatCurrency(costDelta)}</span>
              </motion.span>
            )}

            <span className="text-[10px] font-mono font-bold text-[#4B5563] bg-[#F8F8F6] px-2 py-0.5 rounded-md border border-[#E5E7EB]">
              LIVE ENGINE SYNC
            </span>
          </div>
        </div>

        {/* Large Estimate Number */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={totalCost}
              initial={{ opacity: 0.8, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.8, y: 2 }}
              transition={{ duration: 0.15 }}
              className="text-3xl sm:text-4xl font-black text-[#1B3D34] tracking-tight font-heading leading-none"
            >
              {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
            </motion.div>
          </AnimatePresence>

          {ratePerSqFt > 0 && (
            <span className="text-xs sm:text-sm font-mono font-bold text-[#4B5563]">
              @ ₹{ratePerSqFt.toLocaleString()} / sq.ft BUA
            </span>
          )}
        </div>

        {/* Architectural Metrics Bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#4B5563] pt-1">
          <button
            type="button"
            onClick={() =>
              openInspector(
                'Built-Up Area (BUA)',
                'Total BUA = Built-up Footprint per Floor × Number of Storeys',
                [
                  { label: 'Footprint / Floor', value: `${area.buaPerFloorSqFt || 0} sq.ft` },
                  { label: 'Storeys / Floors', value: `${floors || 1} Storeys` },
                ],
                'BBMP / BDA Comprehensive Development Plan (CDP) & Zonal Regulations',
                `${buaSqFt.toLocaleString()} sq.ft`
              )
            }
            className="flex items-center gap-1.5 hover:text-[#1B3D34] transition-colors cursor-pointer group"
          >
            <span className="font-bold text-[#1B3D34] font-mono text-xs">
              {buaSqFt > 0 ? `${buaSqFt.toLocaleString()} sq.ft` : '0 sq.ft'}
            </span>
            <span>BUA</span>
            <Info className="w-3 h-3 text-[#4B5563] opacity-60 group-hover:opacity-100" />
          </button>

          <span className="text-[#E5E7EB]">•</span>

          <button
            type="button"
            onClick={() =>
              openInspector(
                'Remaining Ground Area',
                'Remaining Open Area = Total Site Area - Ground Floor Footprint',
                [
                  { label: 'Total Plot Area', value: `${plotArea.toLocaleString()} sq.ft` },
                  { label: 'Ground Footprint', value: `${area.buaPerFloorSqFt || 0} sq.ft` },
                ],
                'Permissible ground coverage & landscape setback requirements',
                `${Math.round(remainingGround).toLocaleString()} sq.ft`
              )
            }
            className="flex items-center gap-1.5 hover:text-[#1B3D34] transition-colors cursor-pointer group"
          >
            <span className="font-bold text-[#1B3D34] font-mono text-xs">
              {remainingGround > 0 ? `${Math.round(remainingGround).toLocaleString()} sq.ft` : '0 sq.ft'}
            </span>
            <span>Open Yard</span>
            <Info className="w-3 h-3 text-[#4B5563] opacity-60 group-hover:opacity-100" />
          </button>

          <span className="text-[#E5E7EB]">•</span>

          <span className="font-mono text-[#4B5563] text-xs">
            {plotArea > 0 ? `${plotArea.toLocaleString()} sq.ft plot` : '0 sq.ft'}
          </span>
        </div>

      </div>

      {/* ── 2. PROMINENT 3D ARCHITECTURAL CANVAS ── */}
      <div className="w-full h-64 sm:h-72 lg:h-80 xl:h-[340px] 2xl:h-[380px] rounded-xl overflow-hidden border border-[#E5E7EB] relative bg-[#1B3D34] shrink-0 shadow-2xs">
        <Architectural3DViewer
          city={city}
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

      {/* ── 3. LIVE STEP-AWARE TAKEOFF & 4-HEAD BREAKDOWN ── */}
      <div className="pt-2 border-t border-[#E5E7EB] space-y-2.5">
        
        {/* Dynamic Step Takeoff Strip */}
        {currentStep === 1 && (
          <div className="flex items-center justify-between text-xs p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
            <div>
              <span className="text-[#4B5563] block text-[10px] uppercase font-bold">Municipal Setbacks</span>
              <span className="font-bold text-[#1B3D34] font-mono">
                Front {area.setbacks?.frontSetbackFt ?? 3.5}' • Rear {area.setbacks?.rearSetbackFt ?? 3.0}' • Sides {area.setbacks?.leftSetbackFt ?? 3.0}'
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#4B5563] block text-[10px] uppercase font-bold">Buildable Footprint</span>
              <span className="font-bold text-[#1B3D34] font-mono">
                {area.buildableFootprintSqFt ? `${area.buildableFootprintSqFt.toLocaleString()} sq.ft` : '—'}
              </span>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] font-bold text-[#4B5563] block">Doors</span>
              <span className="font-bold text-[#1B3D34] font-mono">{quantities.totalDoorsCount || 8}</span>
            </div>
            <div className="p-2 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] font-bold text-[#4B5563] block">Windows</span>
              <span className="font-bold text-[#1B3D34] font-mono">{quantities.windowsCount || 10}</span>
            </div>
            <div className="p-2 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] font-bold text-[#4B5563] block">Electrical Pts</span>
              <span className="font-bold text-[#1B3D34] font-mono">{quantities.totalElectricalPoints || 120}</span>
            </div>
            <div className="p-2 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] font-bold text-[#4B5563] block">Paint sq.ft</span>
              <span className="font-bold text-[#1B3D34] font-mono">{Math.round((quantities.totalPaintableAreaSqFt || 8000) / 1000)}k</span>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex justify-between items-center">
              <div>
                <span className="font-bold text-[#1B3D34] block">Rebar Steel</span>
                <span className="text-[10px] text-[#4B5563]">{materialBrands?.steel || 'Tata Tiscon'}</span>
              </div>
              <span className="font-bold text-[#1B3D34] font-mono text-sm">{quantities.steelTonnes || 0} T</span>
            </div>
            <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex justify-between items-center">
              <div>
                <span className="font-bold text-[#1B3D34] block">Portland Cement</span>
                <span className="text-[10px] text-[#4B5563]">{materialBrands?.cement || 'UltraTech'}</span>
              </div>
              <span className="font-bold text-[#1B3D34] font-mono text-sm">{(quantities.cementBags || 0).toLocaleString()} Bags</span>
            </div>
          </div>
        )}

        {currentStep >= 4 && currentStep <= 10 && (
          <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-[#1B3D34] block">
                {currentStep === 4 ? 'Flooring Surface' : currentStep === 5 ? 'Wall Dado Cladding' : currentStep === 6 ? 'Door Joinery' : currentStep === 7 ? 'Window Glazing' : currentStep === 8 ? 'MEP Wiring' : currentStep === 9 ? 'Bathroom Plumbing' : 'Wall Paint Area'}
              </span>
              <span className="text-[10px] text-[#4B5563]">Physical Takeoff Computed</span>
            </div>
            <span className="font-bold text-[#1B3D34] font-mono text-sm">
              {currentStep === 4 ? `${(quantities.floorTilesSqFt || Math.round(buaSqFt * 0.85)).toLocaleString()} sq.ft` : currentStep === 5 ? `${(quantities.wallTilesSqFt || 580).toLocaleString()} sq.ft` : currentStep === 6 ? `${quantities.totalDoorsCount || 8} Sets` : currentStep === 7 ? `${quantities.windowAreaSqFt || 200} sq.ft` : currentStep === 8 ? `${(quantities.electricalWireMetres || 850).toLocaleString()}m Wire` : currentStep === 9 ? `${quantities.bathroomFixtureSets || 3} Bath Sets` : `${(quantities.totalPaintableAreaSqFt || 8000).toLocaleString()} sq.ft`}
            </span>
          </div>
        )}

        {/* 4-Head Allocation Breakdown */}
        {totalCost > 0 && (
          <div className="grid grid-cols-4 gap-2 pt-1 text-[11px] text-[#4B5563]">
            <div className="border-r border-[#E5E7EB] pr-1.5">
              <span className="block text-[9px] font-bold text-[#4B5563] uppercase">Civil Structure</span>
              <span className="font-bold text-[#1B3D34] font-mono">{formatCurrency(structureCost)}</span>
            </div>
            <div className="border-r border-[#E5E7EB] pr-1.5">
              <span className="block text-[9px] font-bold text-[#4B5563] uppercase">Finishes</span>
              <span className="font-bold text-[#1B3D34] font-mono">{formatCurrency(finishesCost)}</span>
            </div>
            <div className="border-r border-[#E5E7EB] pr-1.5">
              <span className="block text-[9px] font-bold text-[#4B5563] uppercase">MEP</span>
              <span className="font-bold text-[#1B3D34] font-mono">{formatCurrency(mepCost)}</span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-[#4B5563] uppercase">GST &amp; Misc</span>
              <span className="font-bold text-[#1B3D34] font-mono">{formatCurrency(gstAndContingency)}</span>
            </div>
          </div>
        )}

      </div>

      {/* ── FORMULA INSPECTOR MODAL ── */}
      {inspectorItem && (
        <div className="fixed inset-0 z-50 bg-[#1B3D34]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl border border-[#E5E7EB] p-6 max-w-md w-full space-y-4 shadow-xl text-left"
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#1B3D34]" />
                <h3 className="text-sm font-bold text-[#1B3D34] font-heading">{inspectorItem.title}</h3>
              </div>
              <button
                onClick={() => setInspectorItem(null)}
                className="p-1 rounded-md text-[#4B5563] hover:text-[#1B3D34] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[rgba(27,61,52,0.06)] rounded-xl border border-[#1B3D34]/15 space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#F28C28] uppercase tracking-wider block">
                  ENGINEERING FORMULA
                </span>
                <code className="text-xs font-mono font-bold text-[#1B3D34] block">
                  {inspectorItem.formula}
                </code>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-1.5">
                {inspectorItem.variables.map((v, i) => (
                  <div key={i} className="flex justify-between items-center py-0.5 border-b border-[#E5E7EB]/60 last:border-0">
                    <span className="text-[#4B5563]">{v.label}</span>
                    <span className="font-bold text-[#1B3D34] font-mono">{v.value}</span>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] text-[11px] text-[#4B5563]">
                <span className="font-bold text-[#1B3D34] block">Reference Standard:</span>
                <p>{inspectorItem.standardNorm}</p>
              </div>

              <div className="p-3 bg-[#1B3D34] text-white rounded-xl flex items-center justify-between font-bold">
                <span>Calculated Value:</span>
                <span className="font-mono text-sm text-[#F28C28]">{inspectorItem.result}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectorItem(null)}
                className="hutty-btn-primary px-4 py-2 text-xs rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </aside>
  );
};
