import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { useBudgetResult, useArea, useBOQ } from '../../store/useCalculationStore';
import { useWizardStore } from '../../store/useWizardStore';
import { SavedEstimationsModal } from '../../components/modals/SavedEstimationsModal';
import { formatCurrency } from '../../utils/cn';
import { HuttyLogo } from '../../components/common/HuttyLogo';
import { SEO } from '../../components/common/SEO';
import {
  ChevronLeft,
  FileText,
  PencilLine,
  Save,
  ArrowRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [showSavedModal, setShowSavedModal] = useState(false);

  const budget = useBudgetResult();
  const area = useArea();
  const boq = useBOQ();

  const { city, plotLength, plotWidth, floors, houseType } = useWizardStore();

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = budget.costPerSqFt || 0;
  const hasProject = buaSqFt > 0;

  const breakdownRows = [
    { label: 'Foundation & Structural Frame', amount: budget.structuralCost },
    { label: 'Flooring & Wet Areas', amount: budget.heads?.find((h) => h.id === 'flooring')?.allocatedAmount ?? 0 },
    { label: 'Doors & Joinery', amount: budget.heads?.find((h) => h.id === 'doorsJoinery')?.allocatedAmount ?? 0 },
    { label: 'Windows & Glazing', amount: budget.heads?.find((h) => h.id === 'windows')?.allocatedAmount ?? 0 },
    { label: 'Electrical Wiring & Conduit', amount: budget.heads?.find((h) => h.id === 'electrical')?.allocatedAmount ?? 0 },
    { label: 'Plumbing & Sanitaryware', amount: budget.heads?.find((h) => h.id === 'plumbingSanitary')?.allocatedAmount ?? 0 },
    { label: 'Painting & Weather Guard', amount: budget.heads?.find((h) => h.id === 'paintingWaterproofing')?.allocatedAmount ?? 0 },
  ];

  return (
    <motion.div
      variants={pageFadeVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-[#F8F8F6] py-8 sm:py-12 select-none"
    >
      <SEO
        title="Project Summary | Hutty"
        description="Review your residential construction project summary, trade cost breakdown, and itemized BOQ."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 text-left">

        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/calculator')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#4B5563] hover:text-[#1B3D34] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Calculator
          </button>
          <button
            type="button"
            onClick={() => setShowSavedModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#1B3D34] px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[rgba(27,61,52,0.04)] transition-colors cursor-pointer shadow-2xs"
          >
            <Save className="w-3.5 h-3.5 text-[#1B3D34]" />
            Saved Projects
          </button>
        </div>

        {/* Page Header */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] block">
            HUTTY
          </span>
          <h1 className="heading-sm text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight">
            Project Summary
          </h1>
        </div>

        {/* 1. Primary Estimate Hero */}
        <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563] block">
            PROJECT TOTAL ESTIMATE
          </span>

          {hasProject ? (
            <div className="space-y-3">
              <div className="text-4xl sm:text-5xl font-black text-[#1B3D34] tracking-tight font-heading">
                {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E5E7EB]">
                <div>
                  <span className="text-[10px] font-bold text-[#4B5563] uppercase block">BUILT-UP AREA</span>
                  <span className="text-base font-bold text-[#1B3D34] font-heading">{buaSqFt.toLocaleString()} sq.ft</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#4B5563] uppercase block">EFFECTIVE RATE</span>
                  <span className="text-base font-bold text-[#1B3D34] font-heading">₹{ratePerSqFt.toLocaleString()} / sq.ft</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#4B5563] uppercase block">PLOT &amp; LOCATION</span>
                  <span className="text-base font-bold text-[#1B3D34] font-heading">{city || 'Bangalore'} &bull; {plotLength}×{plotWidth}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-[#4B5563]">No active project configuration yet.</p>
              <button
                type="button"
                onClick={() => navigate('/calculator')}
                className="hutty-btn-primary text-xs font-bold px-4 py-2 rounded-lg"
              >
                Configure in Calculator
              </button>
            </div>
          )}
        </section>

        {/* 2. Trade Cost Breakdown */}
        {hasProject && (
          <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563] block">
              TRADE ALLOCATION
            </span>
            <div className="divide-y divide-[#E5E7EB] text-xs">
              {breakdownRows.map((row) => (
                <div key={row.label} className="py-2.5 flex items-center justify-between">
                  <span className="text-[#4B5563]">{row.label}</span>
                  <span className="font-bold text-[#1B3D34] font-mono">{formatCurrency(row.amount)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. BOQ Preview */}
        {hasProject && Array.isArray(boq) && boq.length > 0 && (
          <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563] block">
              BOQ PREVIEW ({boq.length} LINE ITEMS)
            </span>
            <div className="divide-y divide-[#E5E7EB] text-xs">
              {boq.slice(0, 5).map((item) => (
                <div key={item.code || item.slNo} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#1B3D34] block">{item.slNo}. {item.description}</span>
                    <span className="text-[10px] text-[#4B5563]">{item.quantity} {item.unit} @ ₹{item.unitRate}/{item.unit}</span>
                  </div>
                  <span className="font-bold text-[#1B3D34] font-mono">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Action Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/report')}
            className="flex-1 hutty-btn-primary py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#F28C28]" />
            <span>View Full Construction Dossier</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/calculator')}
            className="hutty-btn-secondary py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <PencilLine className="w-4 h-4 text-[#1B3D34]" />
            <span>Edit Configuration</span>
          </button>
        </div>

      </div>

      <SavedEstimationsModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
      />
    </motion.div>
  );
};
