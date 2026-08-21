import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizardStore } from '../../store/useWizardStore';
import { useBudgetResult, useArea, useQuantities, useBOQ } from '../../store/useCalculationStore';
import { formatCurrency } from '../../utils/cn';
import { Architectural3DViewer } from '../../components/3d/Architectural3DViewer';
import { Check, ChevronRight } from 'lucide-react';

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

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = totalCost > 0 && buaSqFt > 0 ? Math.round(totalCost / buaSqFt) : 0;

  // Breakdown amounts
  const structureCost = budget.structuralCost || 0;
  const finishesCost = budget.finishingCost || 0;
  const electricalCost = budget.heads?.find((h) => h.id === 'electrical')?.allocatedAmount || 0;
  const plumbingCost = budget.heads?.find((h) => h.id === 'plumbingSanitary')?.allocatedAmount || 0;

  // Count active selections made
  let selectionCount = 0;
  if (plotLength > 0 && plotWidth > 0) selectionCount++;
  if (floors > 0) selectionCount++;
  if (rooms.bedrooms > 0) selectionCount++;
  if (materialBrands?.steel) selectionCount++;
  if (flooringZones?.living) selectionCount++;
  if (doors?.mainDoor) selectionCount++;
  if (windows?.primaryMaterial) selectionCount++;
  if (bathroomFittings?.sanitaryTier) selectionCount++;
  if (painting?.brand) selectionCount++;

  return (
    <aside className="w-full sticky top-24 space-y-4 text-left select-none">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] font-heading">
            ESTIMATED PROJECT COST
          </span>
          <span className="text-[10px] font-mono font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded">
            REAL-TIME SYNC
          </span>
        </div>

        {/* Total Cost Display */}
        <div className="space-y-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={totalCost}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 2 }}
              transition={{ duration: 0.15 }}
              className="text-3xl sm:text-4xl font-black text-[#1B3D34] tracking-tight font-heading"
            >
              {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
            </motion.div>
          </AnimatePresence>
          <p className="text-[11px] text-[#4B5563]">
            {totalCost > 0
              ? 'Includes structural frame, masonry, finishes, MEP & 18% statutory GST'
              : 'Configure plot dimensions and room requirements to calculate cost'}
          </p>
        </div>

        {/* 3 Secondary Metric Boxes */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E5E7EB]">
          <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block truncate">
              BUILT-UP AREA
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#1B3D34] block truncate font-heading">
              {buaSqFt > 0 ? `${buaSqFt.toLocaleString()} sq.ft` : '0 sq.ft'}
            </span>
          </div>

          <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block truncate">
              RATE / SQ.FT
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#1B3D34] block truncate font-heading">
              {ratePerSqFt > 0 ? `₹${ratePerSqFt.toLocaleString()}` : '₹0'}
            </span>
          </div>

          <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block truncate">
              SELECTIONS
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#1B3D34] block truncate font-heading">
              {selectionCount} Active
            </span>
          </div>
        </div>

        {/* 3D Architectural Viewer Integration */}
        <div className="pt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] mb-2 flex items-center justify-between">
            <span>3D SPATIAL PREVIEW</span>
            <span className="text-[9px] font-mono text-[#1B3D34]">{floors || 1} Storeys</span>
          </div>
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
            className="w-full"
          />
        </div>

        {/* Compact Cost Breakdown */}
        {totalCost > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#E5E7EB] text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] block">
              HEAD ALLOCATION
            </span>
            <div className="space-y-1.5">
              <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#4B5563]">Structural & Civil</span>
                <span className="font-bold text-[#1B3D34] font-mono">{formatCurrency(structureCost)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#4B5563]">Finishes & Joinery</span>
                <span className="font-bold text-[#1B3D34] font-mono">{formatCurrency(finishesCost)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#4B5563]">Electrical & Plumbing MEP</span>
                <span className="font-bold text-[#1B3D34] font-mono">{formatCurrency(electricalCost + plumbingCost)}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
