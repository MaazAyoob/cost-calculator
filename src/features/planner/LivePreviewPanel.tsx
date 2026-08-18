import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizardStore } from '../../store/useWizardStore';
import { useBudgetResult, useArea, useQuantities, useBOQ } from '../../store/useCalculationStore';
import { Card } from '../../components/ui/Card';
import { Layers, ChevronRight, X, Sparkles, Building2, CheckCircle2, SlidersHorizontal, Box, Compass } from 'lucide-react';
import { formatCurrency } from '../../utils/cn';
import { Architectural3DViewer } from '../../components/3d/Architectural3DViewer';

export const LivePreviewPanel: React.FC = () => {
  const {
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
  const boq = useBOQ();

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeVisualMode, setActiveVisualMode] = useState<'3d' | '2d'>('3d');

  // Count active specification selections
  let selectionCount = 0;
  if (materialBrands?.steel) selectionCount++;
  if (materialBrands?.cement) selectionCount++;
  if (flooringZones?.living || flooringZones?.bedrooms) selectionCount++;
  if (wallCladding?.kitchenDadoHeight || wallCladding?.bathroomTileHeight) selectionCount++;
  if (doors?.mainDoor || doors?.internalDoor) selectionCount++;
  if (windows?.primaryMaterial) selectionCount++;
  if (electrical?.wireTier) selectionCount++;
  if (bathroomFittings?.sanitaryTier || bathroomFittings?.cpvcBrand) selectionCount++;
  if (painting?.brand || painting?.internalPaint) selectionCount++;
  if (liftRequired) selectionCount++;
  if (evCharging) selectionCount++;

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = (totalCost > 0 && buaSqFt > 0) ? Math.round(totalCost / buaSqFt) : 0;

  let statusText = 'Getting Started';
  let statusColor = 'bg-slate-100 text-slate-600 border-slate-200';

  if (selectionCount >= 5) {
    statusText = 'Estimate Ready';
    statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (selectionCount > 0) {
    statusText = 'Estimate Updating';
    statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (buaSqFt > 0) {
    statusText = 'Base Estimate Live';
    statusColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  return (
    <>
      {/* ── DESKTOP STICKY SIDEBAR PANEL (lg:block) ── */}
      <aside className="hidden lg:block w-full sticky top-20">
        <Card className="p-6 bg-white border border-slate-200/90 shadow-soft-lg rounded-3xl space-y-5">
          
          {/* Header & Status */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Live Estimate</span>
            </div>
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
              {statusText}
            </span>
          </div>

          {/* Primary Metric: Estimated Cost */}
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Estimated Project Cost
            </span>
            <div className="flex items-baseline gap-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={totalCost}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="text-3xl font-black text-slate-900 tracking-tight"
                >
                  {totalCost > 0 ? (
                    <span className="text-blue-600 font-black">{formatCurrency(totalCost)}</span>
                  ) : (
                    <span className="text-slate-900">₹0</span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {selectionCount > 0
                ? 'Structural base + selected material costs'
                : buaSqFt > 0
                ? 'Structural shell estimate — select materials to refine'
                : 'Enter plot dimensions to calculate base estimate'}
            </p>
          </div>

          {/* Key Secondary Metrics Grid - 4-Card Overview */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-100">
            <div className="p-2.5 bg-slate-50/90 rounded-2xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                BUA / Floor
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">
                {area.buaPerFloorSqFt > 0 ? `${area.buaPerFloorSqFt.toLocaleString()} sq.ft` : '0 sq.ft'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50/90 rounded-2xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Total BUA
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">
                {buaSqFt > 0 ? `${buaSqFt.toLocaleString()} sq.ft` : '0 sq.ft'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50/90 rounded-2xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Remaining Ground
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-600 block truncate">
                {area.remainingGroundAreaSqFt > 0 ? `${area.remainingGroundAreaSqFt.toLocaleString()} sq.ft` : '0 sq.ft'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50/90 rounded-2xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Rate / Sq.Ft
              </span>
              <span className="text-xs sm:text-sm font-black text-blue-700 block truncate">
                {ratePerSqFt > 0 ? `₹${ratePerSqFt.toLocaleString()}/sq.ft` : '₹0 / sq.ft'}
              </span>
            </div>
          </div>

          {/* Large Architectural 3D Visualization */}
          {plotLength > 0 && plotWidth > 0 && (
            <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2.5">
              {/* Switcher Header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Architectural 3D Model
                </span>
                <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[10px] font-extrabold">
                  <button
                    type="button"
                    onClick={() => setActiveVisualMode('3d')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      activeVisualMode === '3d'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    3D Model
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveVisualMode('2d')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      activeVisualMode === '2d'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    2D Plan
                  </button>
                </div>
              </div>

              {/* 3D Model Mode */}
              {activeVisualMode === '3d' ? (
                <Architectural3DViewer
                  city={city}
                  plotLength={plotLength}
                  plotWidth={plotWidth}
                  floors={floors}
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
                />
              ) : (
                /* 2D Schematic Blueprint Mode */
                <div className="w-full py-8 px-4 border border-dashed border-slate-300 rounded-xl flex items-center justify-center relative bg-white shadow-xs">
                  {/* Top Width Badge */}
                  <span className="absolute -top-2.5 text-[9px] font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 border border-blue-200 rounded-full shadow-xs">
                    {plotWidth} FT WIDE
                  </span>

                  {/* Left Length Badge */}
                  <span className="absolute -left-3 text-[9px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200 rounded-full shadow-xs -rotate-90">
                    {plotLength}'
                  </span>

                  {/* Built-Up Ground Footprint */}
                  <div className="w-4/5 h-24 bg-blue-50/90 border border-blue-300 rounded-xl flex flex-col items-center justify-center space-y-1">
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-tight">
                      Selected Footprint ({area.groundCoveragePercentage > 0 ? area.groundCoveragePercentage.toFixed(0) : 0}% coverage)
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {area.buaPerFloorSqFt > 0 ? `${area.buaPerFloorSqFt.toLocaleString()} sq.ft` : '0 sq.ft'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between text-[10px] text-slate-500 font-semibold px-0.5 pt-0.5">
                <span>{(plotLength * plotWidth).toLocaleString()} sq.ft Plot Area</span>
                <span>{floors === 1 ? 'Ground Level (1 Floor)' : `G+${(floors || 2) - 1} (${floors} Floors)`}</span>
              </div>
            </div>
          )}

          {/* Project Baseline Specs */}
          <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-semibold text-slate-500">Configured Specifications</span>
              <span className="font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                {selectionCount} items active
              </span>
            </div>

            {quantities.steelTonnes > 0 && (
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-semibold text-slate-500">Structural Steel</span>
                <span className="font-extrabold text-slate-800">{quantities.steelTonnes} Tonnes ({materialBrands?.steel || 'Fe 500D'})</span>
              </div>
            )}

            {quantities.cementBags > 0 && (
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-semibold text-slate-500">Structural Cement</span>
                <span className="font-extrabold text-slate-800">{quantities.cementBags.toLocaleString()} Bags ({materialBrands?.cement || 'OPC 53'})</span>
              </div>
            )}
          </div>

          {/* Quick Breakdown Action */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowDetailsModal(true)}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-extrabold text-xs rounded-xl transition-all flex items-center justify-between cursor-pointer group"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600" />
                View Itemized Summary &amp; BOQ
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

        </Card>
      </aside>

      {/* ── MOBILE / TABLET PROMINENT PREVIEW SECTION (lg:hidden) ── */}
      <div className="lg:hidden w-full mb-6 space-y-3">
        {/* Compact Top Stat Banner */}
        <Card className="p-3.5 bg-white border border-slate-200/90 shadow-soft-sm rounded-2xl">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Estimated Cost
              </span>
              <span className="text-lg font-black text-blue-600 block">
                {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-right">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  BUA
                </span>
                <span className="text-xs font-black text-slate-800">
                  {buaSqFt > 0 ? `${buaSqFt.toLocaleString()} sqft` : '0 sqft'}
                </span>
              </div>

              <div className="border-l border-slate-200 pl-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Rate
                </span>
                <span className="text-xs font-black text-slate-800">
                  {ratePerSqFt > 0 ? `₹${ratePerSqFt}/sqft` : '₹0'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailsModal(true)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                title="View BOQ Details"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Mobile 3D Model Card (Prominent & Proportional) */}
        {plotLength > 0 && plotWidth > 0 && (
          <Card className="p-3 bg-white border border-slate-200/90 shadow-soft-sm rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Box className="w-3.5 h-3.5 text-blue-600" />
                3D Architectural View
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {floors === 1 ? '1 Floor' : `${floors} Floors`} &bull; {(plotLength * plotWidth).toLocaleString()} sqft
              </span>
            </div>

            <Architectural3DViewer
              city={city}
              plotLength={plotLength}
              plotWidth={plotWidth}
              floors={floors}
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
              className="h-60 sm:h-72"
            />
          </Card>
        )}
      </div>

      {/* ── ITEM SUMMARY & AUDIT TRACE MODAL ── */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-soft-2xl border border-slate-200 space-y-5 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-900">Live Estimate &amp; BOQ Breakdown</h3>
                <p className="text-xs text-slate-500 font-medium">Real-time calculations from Rightcon engineering engine</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 block">Total Cost</span>
                  <span className="text-base font-black text-blue-700">{totalCost > 0 ? formatCurrency(totalCost) : '₹0'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Effective Rate</span>
                  <span className="text-base font-black text-slate-900">{ratePerSqFt > 0 ? `₹${ratePerSqFt}/sqft` : '₹0/sqft'}</span>
                </div>
              </div>

              {/* Active BOQ Items List */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">
                  Active BOQ Line Items ({boq.length} contributions)
                </h4>

                {boq.length === 0 ? (
                  <p className="text-slate-400 italic py-4 text-center">
                    No cost-bearing specifications selected yet. Choose materials to build your BOQ.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {boq.map((item) => (
                      <div key={item.code} className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl flex items-center justify-between gap-2 border border-slate-100">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{item.description}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {item.quantity} {item.unit} @ ₹{item.unitRate.toLocaleString()}/{item.unit} &bull; {item.brand}
                          </p>
                        </div>
                        <span className="font-black text-slate-900 shrink-0">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-extrabold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
