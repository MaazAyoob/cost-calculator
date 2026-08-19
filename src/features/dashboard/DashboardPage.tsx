import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { useBudgetResult, useArea, useBOQ } from '../../store/useCalculationStore';
import { useWizardStore } from '../../store/useWizardStore';
import { SavedEstimationsModal } from '../../components/modals/SavedEstimationsModal';
import { formatCurrency } from '../../utils/cn';
import {
  ChevronLeft,
  FileText,
  PencilLine,
  Save,
  ArrowRight,
  Home,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [showSavedModal, setShowSavedModal] = useState(false);

  const budget = useBudgetResult();
  const area = useArea();
  const boq = useBOQ();

  const { city, plotLength, plotWidth, floors, houseType, rooms, materialBrands } = useWizardStore();

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = budget.costPerSqFt || 0;
  const hasProject = buaSqFt > 0;

  const breakdownRows = [
    { label: 'Foundation & Structural Frame', amount: budget.structuralCost },
    { label: 'Flooring & Wet Areas', amount: budget.heads.find((h) => h.id === 'flooring')?.allocatedAmount ?? 0 },
    { label: 'Doors & Joinery', amount: budget.heads.find((h) => h.id === 'doorsJoinery')?.allocatedAmount ?? 0 },
    { label: 'Windows & Glazing', amount: budget.heads.find((h) => h.id === 'windows')?.allocatedAmount ?? 0 },
    { label: 'Electrical Wiring & Conduit', amount: budget.heads.find((h) => h.id === 'electrical')?.allocatedAmount ?? 0 },
    { label: 'Plumbing & Sanitaryware', amount: budget.heads.find((h) => h.id === 'plumbingSanitary')?.allocatedAmount ?? 0 },
    { label: 'Painting & Weather Guard', amount: budget.heads.find((h) => h.id === 'paintingWaterproofing')?.allocatedAmount ?? 0 },
  ];

  return (
    <motion.div
      variants={pageFadeVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-[#F7F7F5] py-8 sm:py-12"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 text-left">

        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/calculator')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#667085] hover:text-[#172033] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Calculator
          </button>
          <button
            type="button"
            onClick={() => setShowSavedModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#172033] px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Save className="w-3.5 h-3.5 text-[#1F4B43]" />
            Saved Projects
          </button>
        </div>

        {/* Page Header */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1F4B43] block">
            Cost Calculator by Rightcon
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Project Dashboard
          </h1>
        </div>

        {/* 1. Primary Estimate Hero */}
        <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#667085] block">
            PROJECT TOTAL ESTIMATE
          </span>

          {hasProject ? (
            <div className="space-y-3">
              <div className="text-4xl sm:text-5xl font-black text-[#1F4B43] tracking-tight">
                {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E5E7EB]">
                <div>
                  <span className="text-[10px] font-bold text-[#667085] uppercase block">BUILT-UP AREA</span>
                  <span className="text-base font-bold text-[#172033]">{buaSqFt.toLocaleString()} sq.ft</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#667085] uppercase block">RATE</span>
                  <span className="text-base font-bold text-[#172033]">₹{ratePerSqFt.toLocaleString()} / sq.ft</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-[10px] font-bold text-[#667085] uppercase block">CONFIGURATION</span>
                  <span className="text-base font-bold text-[#172033]">{floors === 1 ? 'Ground' : `G+${floors - 1}`} • {rooms.bedrooms} BHK</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <p className="text-sm text-[#667085]">No project configured yet.</p>
              <button
                type="button"
                onClick={() => navigate('/calculator')}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1F4B43] hover:underline"
              >
                Start New Estimation <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* 2. Cost Breakdown */}
        {hasProject && totalCost > 0 && (
          <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">Cost Breakdown</h2>
              <span className="text-xs text-[#667085]">{boq.length} BOQ items</span>
            </div>

            <div className="divide-y divide-[#E5E7EB] text-xs">
              {breakdownRows.map((row) => (
                <div key={row.label} className="py-2.5 flex justify-between items-center">
                  <span className="text-[#667085] font-medium">{row.label}</span>
                  <span className="font-bold text-[#172033]">{formatCurrency(row.amount)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] space-y-1.5 text-xs text-[#667085]">
              <div className="flex justify-between">
                <span>Professional Architectural &amp; Structural Fees</span>
                <span className="font-semibold text-[#172033]">{formatCurrency(budget.professionalFees)}</span>
              </div>
              <div className="flex justify-between">
                <span>Contingency Buffer (3%)</span>
                <span className="font-semibold text-[#172033]">{formatCurrency(budget.contingency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Statutory GST (12%)</span>
                <span className="font-semibold text-[#172033]">{formatCurrency(budget.gstAmount)}</span>
              </div>
            </div>
          </section>
        )}

        {/* 3. BOQ Preview & Report Action */}
        {hasProject && (
          <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">BOQ Preview</h2>
              <span className="text-xs text-[#667085]">Top Contributors</span>
            </div>

            <div className="space-y-2 text-xs">
              {boq.slice(0, 4).map((item) => (
                <div key={item.code} className="p-3 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] flex justify-between items-center">
                  <span className="font-semibold text-[#172033] truncate max-w-[65%]">{item.description}</span>
                  <span className="font-bold text-[#172033]">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/report')}
                className="w-full py-3 px-4 bg-[#1F4B43] hover:bg-[#163731] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <FileText className="w-4 h-4" /> View Full Feasibility Report &amp; Bank BOQ
              </button>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/calculator')}
            className="p-4 bg-white hover:bg-slate-50 border border-[#E5E7EB] rounded-xl text-left transition-colors flex items-center gap-3 cursor-pointer shadow-2xs"
          >
            <PencilLine className="w-4 h-4 text-[#1F4B43]" />
            <div>
              <span className="text-xs font-bold text-[#172033] block">Edit Specifications</span>
              <span className="text-[10px] text-[#667085]">Return to calculator</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-4 bg-white hover:bg-slate-50 border border-[#E5E7EB] rounded-xl text-left transition-colors flex items-center gap-3 cursor-pointer shadow-2xs"
          >
            <Home className="w-4 h-4 text-[#1F4B43]" />
            <div>
              <span className="text-xs font-bold text-[#172033] block">Home</span>
              <span className="text-[10px] text-[#667085]">Back to main page</span>
            </div>
          </button>
        </div>

      </div>

      <SavedEstimationsModal isOpen={showSavedModal} onClose={() => setShowSavedModal(false)} />
    </motion.div>
  );
};
