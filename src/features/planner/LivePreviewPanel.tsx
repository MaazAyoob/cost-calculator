import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizardStore } from '../../store/useWizardStore';
import { useBudgetResult, useArea, useQuantities, useBOQ } from '../../store/useCalculationStore';
import { Box, Compass, SlidersHorizontal, X } from 'lucide-react';
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

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = (totalCost > 0 && buaSqFt > 0) ? Math.round(totalCost / buaSqFt) : 0;
  const remainingArea = area.remainingGroundAreaSqFt || 0;

  // Breakdown amounts
  const structureCost = budget.structuralCost || 0;
  const finishesCost = budget.finishingCost || 0;
  const electricalCost = budget.heads.find((h) => h.id === 'electrical')?.allocatedAmount || 0;
  const plumbingCost = budget.heads.find((h) => h.id === 'plumbingSanitary')?.allocatedAmount || 0;

  return (
    <>
      <aside className="w-full sticky top-24 space-y-4 text-left">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs space-y-5">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1F4B43]">
              YOUR LIVE ESTIMATE
            </span>
            <span className="text-[10px] font-mono font-semibold text-[#1F4B43] bg-[#EBF2F0] px-2 py-0.5 rounded">
              REAL-TIME SYNC
            </span>
          </div>

          {/* Main Total Cost Hero */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
              Estimated Total Cost
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={totalCost}
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 2 }}
                transition={{ duration: 0.15 }}
                className="text-3xl sm:text-4xl font-black text-[#1F4B43] tracking-tight"
              >
                {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
              </motion.div>
            </AnimatePresence>
            <p className="text-[11px] text-[#667085]">
              {totalCost > 0
                ? 'Includes structural frame, finishes, MEP & statutory GST'
                : 'Configure plot and rooms to compute estimate'}
            </p>
          </div>

          {/* 3 Secondary Architectural Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E5E7EB]">
            <div className="p-2.5 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] space-y-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#667085] block truncate">
                BUILT-UP AREA
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#172033] block truncate">
                {buaSqFt > 0 ? `${buaSqFt.toLocaleString()} sq.ft` : '0 sq.ft'}
              </span>
            </div>

            <div className="p-2.5 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] space-y-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#667085] block truncate">
                RATE
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#172033] block truncate">
                {ratePerSqFt > 0 ? `₹${ratePerSqFt.toLocaleString()} / sq.ft` : '₹0 / sq.ft'}
              </span>
            </div>

            <div className="p-2.5 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] space-y-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#667085] block truncate">
                REMAINING AREA
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#1F4B43] block truncate">
                {remainingArea > 0 ? `${remainingArea.toLocaleString()} sq.ft` : '0 sq.ft'}
              </span>
            </div>
          </div>

          {/* 3D Model Stage */}
          {plotLength > 0 && plotWidth > 0 && (
            <div className="space-y-2 pt-1 border-t border-[#E5E7EB]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-[#1F4B43]" /> 3D Architecture Model
                </span>
                <span className="text-[10px] font-mono text-[#667085]">
                  {floors === 1 ? 'Ground' : `G+${floors - 1}`} • {(plotLength * plotWidth).toLocaleString()} sq.ft
                </span>
              </div>

              <div className="rounded-xl overflow-hidden bg-slate-900 border border-[#E5E7EB]">
                <Architectural3DViewer
                  city={city || 'Bangalore'}
                  plotLength={plotLength}
                  plotWidth={plotWidth}
                  floors={floors || 2}
                  parkingType={parkingType || 'Normal Ground'}
                  carCount={carCount}
                  bikeCount={bikeCount}
                  evCharging={evCharging}
                  liftRequired={liftRequired}
                  houseType={houseType || 'Duplex'}
                  qualityTier={qualityTier || 'Premium'}
                  rooms={rooms}
                  materialBrands={materialBrands}
                  flooringZones={flooringZones}
                  wallCladding={wallCladding}
                  doors={doors}
                  windows={windows}
                  electrical={electrical}
                  bathroomFittings={bathroomFittings}
                  painting={painting}
                  className="w-full h-52 sm:h-60"
                />
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="space-y-2 pt-2 border-t border-[#E5E7EB] text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
              Cost Breakdown
            </span>
            <div className="space-y-1.5">
              <div className="flex justify-between py-1 border-b border-[#E5E7EB]/50">
                <span className="text-[#667085]">Structure & Shell:</span>
                <span className="font-bold text-[#172033]">
                  {structureCost > 0 ? formatCurrency(structureCost) : '₹0'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E7EB]/50">
                <span className="text-[#667085]">Finishes & Joinery:</span>
                <span className="font-bold text-[#172033]">
                  {finishesCost > 0 ? formatCurrency(finishesCost) : '₹0'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E7EB]/50">
                <span className="text-[#667085]">Electrical:</span>
                <span className="font-bold text-[#172033]">
                  {electricalCost > 0 ? formatCurrency(electricalCost) : '₹0'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#667085]">Plumbing & Sanitary:</span>
                <span className="font-bold text-[#172033]">
                  {plumbingCost > 0 ? formatCurrency(plumbingCost) : '₹0'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick BOQ Detail Modal Button */}
          <div className="pt-2 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setShowDetailsModal(true)}
              className="w-full py-2.5 px-3 bg-[#F7F7F5] hover:bg-slate-100 text-[#172033] font-bold text-xs rounded-xl border border-[#E5E7EB] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#1F4B43]" />
              View Line-Item BOQ ({boq.length} items)
            </button>
          </div>

        </div>
      </aside>

      {/* BOQ Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full border border-[#E5E7EB] space-y-4 max-h-[85vh] flex flex-col text-left">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#172033]">Itemized BOQ Takeoff</h3>
                <p className="text-xs text-[#667085]">13-Stage Schedule of Rates</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1 text-xs">
              <div className="space-y-1.5">
                {boq.map((item) => (
                  <div key={item.code} className="p-2.5 bg-[#F7F7F5] rounded-lg border border-[#E5E7EB] flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-[#172033] truncate">{item.description}</p>
                      <p className="text-[10px] text-[#667085]">
                        {item.quantity} {item.unit} @ ₹{item.unitRate}/{item.unit} • {item.brand}
                      </p>
                    </div>
                    <span className="font-bold text-[#172033] shrink-0">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-[#1F4B43] text-white text-xs font-bold rounded-lg hover:bg-[#163731]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
