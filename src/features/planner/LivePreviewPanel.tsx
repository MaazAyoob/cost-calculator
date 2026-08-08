import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizardStore } from '../../store/useWizardStore';
import { useBudgetResult, useArea, useQuantities } from '../../store/useCalculationStore';
import { Card } from '../../components/ui/Card';
import { ArrowRight, X } from 'lucide-react';
import { formatCurrency } from '../../utils/cn';

export const LivePreviewPanel: React.FC = () => {
  const {
    materialBrands,
    flooringZones,
    wallCladding,
    doors,
    windows,
    electrical,
    bathroomFittings,
    painting,
  } = useWizardStore();

  const budget = useBudgetResult();
  const area = useArea();
  const quantities = useQuantities();

  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  // Count active selections made by user
  let selectionCount = 0;
  if (materialBrands?.steel) selectionCount++;
  if (materialBrands?.cement) selectionCount++;
  if (flooringZones?.living) selectionCount++;
  if (flooringZones?.bedrooms) selectionCount++;
  if (flooringZones?.bathrooms) selectionCount++;
  if (wallCladding?.kitchenDadoHeight) selectionCount++;
  if (doors?.mainDoor) selectionCount++;
  if (windows?.primaryMaterial) selectionCount++;
  if (electrical?.wireTier) selectionCount++;
  if (bathroomFittings?.sanitaryTier) selectionCount++;
  if (painting?.brand || painting?.internalPaint) selectionCount++;

  const calculatedCostINR           = budget.totalProjectCost || 0;
  const calculatedBuildableAreaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt                 = budget.costPerSqFt || 0;

  const isComplete = selectionCount >= 8;

  // Status subtext message
  let statusText = 'Select options to build your estimate';
  if (isComplete) {
    statusText = 'Estimate ready';
  } else if (calculatedCostINR > 0 || selectionCount > 0) {
    statusText = 'Updated from your selections';
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto my-3 sticky top-3 z-30 px-2 sm:px-0">
        <Card className="p-4 sm:p-5 bg-white border border-slate-200 shadow-soft-md rounded-[20px] transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Left Column: Primary Cost Metric */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                Estimated Project Cost
              </span>

              <div className="flex items-baseline gap-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={calculatedCostINR}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
                  >
                    {calculatedCostINR > 0 ? (
                      <span className="text-blue-600 font-black">{formatCurrency(calculatedCostINR)}</span>
                    ) : (
                      <span className="text-slate-900">₹0</span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <span className="text-[11px] font-semibold text-slate-500 block">
                {statusText}
              </span>
            </div>

            {/* Right Column: Built-up Area & Rate Metrics + Action */}
            <div className="flex flex-col items-start sm:items-end justify-between gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="flex items-center gap-4 sm:gap-6 text-left sm:text-right">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Built-Up Area
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {calculatedBuildableAreaSqFt > 0 ? `${calculatedBuildableAreaSqFt.toLocaleString()} sq.ft` : '0 sq.ft'}
                  </span>
                </div>

                <div className="border-l border-slate-200 pl-4 sm:pl-6">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Rate
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-blue-600">
                    {ratePerSqFt > 0 ? `₹${ratePerSqFt.toLocaleString()} / sq.ft` : '₹0 / sq.ft'}
                  </span>
                </div>
              </div>

              {/* View breakdown text button */}
              <button
                type="button"
                onClick={() => setShowBreakdownModal(true)}
                className="text-xs font-extrabold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 cursor-pointer pt-0.5"
              >
                View breakdown <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </Card>
      </div>

      {/* Detailed Breakdown Modal */}
      {showBreakdownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-soft-2xl border border-slate-200 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Cost &amp; Quantity Summary</h3>
                <p className="text-xs text-slate-500">Live configuration breakdown</p>
              </div>
              <button
                onClick={() => setShowBreakdownModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Active Selections</span>
                <span className="font-extrabold text-blue-600">{selectionCount} configured</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Steel Quantity</span>
                <span className="font-extrabold text-slate-900">{quantities.steelTonnes} Tonnes</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Cement Bags</span>
                <span className="font-extrabold text-slate-900">{quantities.cementBags.toLocaleString()} Bags</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Base Construction Rate</span>
                <span className="font-extrabold text-blue-600">₹{ratePerSqFt.toLocaleString()} / sq.ft</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowBreakdownModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-extrabold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
