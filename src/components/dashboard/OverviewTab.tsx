import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../store/useProjectStore';
import { useCalculationStore } from '../../store/useCalculationStore';
import { CONSTRUCTION_STAGES } from '../../constants/constructionStages';
import { formatCurrency } from '../../utils/cn';
import { ArrowRight, Sliders, FolderOpen } from 'lucide-react';
import { WhatIfComparisonModal } from '../modals/WhatIfComparisonModal';
import { SavedEstimationsModal } from '../modals/SavedEstimationsModal';

export const OverviewTab: React.FC = () => {
  const navigate = useNavigate();
  const { project } = useProjectStore();
  const { result } = useCalculationStore();
  const { budget, area, quantities, timeline, paymentPlan } = result;

  const [showWhatIfModal, setShowWhatIfModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = budget.costPerSqFt || 0;

  // Top 5 BOQ items preview
  const topBoqItems = [
    { name: 'TMT Steel (Fe 550D)', quantity: `${quantities.steelTonnes} Tonnes`, cost: budget.heads.find(h => h.id === 'steel')?.allocatedAmount || 0 },
    { name: 'Cement (UltraTech/PPC)', quantity: `${quantities.cementBags.toLocaleString()} Bags`, cost: budget.heads.find(h => h.id === 'cement')?.allocatedAmount || 0 },
    { name: 'AAC Masonry Blocks', quantity: 'Line Item', cost: budget.heads.find(h => h.id === 'masonry')?.allocatedAmount || 0 },
    { name: 'Flooring & Tiling', quantity: 'Zone Configured', cost: budget.heads.find(h => h.id === 'finishing')?.allocatedAmount || 0 },
    { name: 'Electrical & Plumbing', quantity: 'FRLS & CPVC', cost: (budget.heads.find(h => h.id === 'electrical')?.allocatedAmount || 0) + (budget.heads.find(h => h.id === 'plumbing')?.allocatedAmount || 0) },
  ];

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-12 bg-[#F9FAFB]">
        
        {/* 1. PROJECT OVERVIEW HERO */}
        <div className="space-y-4 pb-8 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Project Overview
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                {project.name || 'Modern Residence'}
              </h1>
              <p className="text-sm text-slate-600">
                {typeof project.location === 'string' ? project.location : (project.location?.city || 'Bengaluru')} • {buaSqFt > 0 ? `${buaSqFt.toLocaleString()} sq.ft` : 'Plot Dimensions Configured'}
              </p>
            </div>

            {/* Quick Actions for What-If & Saved Estimations */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowWhatIfModal(true)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>What-If Analysis</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSavedModal(true)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Saved Projects</span>
              </button>
            </div>
          </div>

          {/* Primary Total Estimate Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Estimated Construction Cost
            </span>
            <div className="flex flex-wrap items-baseline gap-4">
              <span className="text-4xl font-extrabold text-slate-900">
                {formatCurrency(totalCost)}
              </span>
              {ratePerSqFt > 0 && (
                <span className="text-sm font-semibold text-blue-600">
                  ₹{ratePerSqFt.toLocaleString()} / sq.ft
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Calculated based on your selected materials and IS 456 structural standards.
            </p>
          </div>
        </div>

        {/* 2. BUDGET BREAKDOWN VISUAL */}
        <div className="space-y-4 pb-8 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            Budget Allocation
          </h2>

          {/* Single Horizontal Breakdown Bar */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {budget.heads.map((head) => (
              <div
                key={head.id}
                style={{ width: `${head.percentage}%`, backgroundColor: head.color }}
                className="h-full transition-all"
                title={`${head.name}: ${head.percentage}%`}
              />
            ))}
          </div>

          {/* Categories List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {budget.heads.map((head) => (
              <div key={head.id} className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: head.color }} />
                  <span>{head.name}</span>
                  <span className="font-semibold text-slate-900 ml-auto">{head.percentage}%</span>
                </div>
                <div className="text-sm font-bold text-slate-900 pl-4">
                  {formatCurrency(head.allocatedAmount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. CONSTRUCTION PROGRESS TIMELINE */}
        <div className="space-y-4 pb-8 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Construction Timeline
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Estimated Duration: {timeline.totalMonths || 12} Months
            </span>
          </div>

          <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200">
            {CONSTRUCTION_STAGES.slice(0, 6).map((stage) => (
              <div key={stage.id} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-[11px]">
                    {stage.number}
                  </span>
                  <span className="font-semibold text-slate-900">{stage.title}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                  stage.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                  stage.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {stage.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. TOP MATERIAL BOQ PREVIEW */}
        <div className="space-y-4 pb-8 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Bill of Quantities Preview
            </h2>
            <button
              onClick={() => navigate('/report')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
            >
              View Full BOQ <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            {topBoqItems.map((item) => (
              <div key={item.name} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block">{item.name}</span>
                  <span className="text-slate-500 text-[11px]">{item.quantity}</span>
                </div>
                <span className="font-bold text-slate-900">
                  {formatCurrency(item.cost)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. PAYMENT SCHEDULE */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Payment Milestone Roadmap
          </h2>

          <div className="space-y-3">
            {paymentPlan.map((m) => (
              <div key={m.stage} className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-blue-600 block">Stage {m.stage} • {m.percentage}% Release</span>
                  <span className="font-semibold text-slate-900 text-sm">{m.title}</span>
                  <p className="text-slate-500 mt-0.5">{m.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-slate-900 block">
                    {formatCurrency(m.amount)}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    m.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                    m.status === 'Due' ? 'bg-amber-50 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modals */}
      <WhatIfComparisonModal
        isOpen={showWhatIfModal}
        onClose={() => setShowWhatIfModal(false)}
      />

      <SavedEstimationsModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
      />
    </>
  );
};
