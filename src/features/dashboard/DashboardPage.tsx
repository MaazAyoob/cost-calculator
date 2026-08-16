import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  LayoutList,
  Clock,
  Home,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────

function floorsLabel(floors: number): string {
  if (!floors || floors <= 0) return '—';
  if (floors === 1) return 'Ground Only (G)';
  return `G + ${floors - 1}`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-0.5 py-3 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value || '—'}</span>
    </div>
  );
}

function BreakdownRow({
  label,
  amount,
  totalCost,
}: {
  label: string;
  amount: number;
  totalCost: number;
}) {
  const pct = totalCost > 0 ? Math.round((amount / totalCost) * 100) : 0;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0 gap-4">
      <span className="text-sm text-slate-700 font-medium">{label}</span>
      <div className="flex items-center gap-3 shrink-0">
        {amount > 0 && (
          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
        )}
        <span className="text-sm font-bold text-slate-900 text-right w-28">
          {amount > 0 ? formatCurrency(amount) : <span className="text-slate-300 font-normal">—</span>}
        </span>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [showSavedModal, setShowSavedModal] = useState(false);

  const budget = useBudgetResult();
  const area   = useArea();
  const boq    = useBOQ();

  const { city, plotLength, plotWidth, floors, houseType, rooms, materialBrands } = useWizardStore();

  const totalCost   = budget.totalProjectCost || 0;
  const buaSqFt     = area.totalBUASqFt       || 0;
  const ratePerSqFt = budget.costPerSqFt       || 0;
  const hasProject  = buaSqFt > 0;

  const breakdownRows = [
    { label: 'Foundation & Structure',    amount: budget.structuralCost },
    { label: 'Flooring',                  amount: budget.heads.find(h => h.id === 'flooring')?.allocatedAmount ?? 0 },
    { label: 'Doors & Joinery',           amount: budget.heads.find(h => h.id === 'doorsJoinery')?.allocatedAmount ?? 0 },
    { label: 'Windows & Glazing',         amount: budget.heads.find(h => h.id === 'windows')?.allocatedAmount ?? 0 },
    { label: 'Electrical',                amount: budget.heads.find(h => h.id === 'electrical')?.allocatedAmount ?? 0 },
    { label: 'Plumbing & Sanitary',       amount: budget.heads.find(h => h.id === 'plumbingSanitary')?.allocatedAmount ?? 0 },
    { label: 'Painting & Waterproofing',  amount: budget.heads.find(h => h.id === 'paintingWaterproofing')?.allocatedAmount ?? 0 },
  ];

  const selectedMaterials = [materialBrands?.steel, materialBrands?.cement].filter(Boolean).join(', ');

  return (
    <motion.div variants={pageFadeVariant} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">

        {/* 1. Nav header */}
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={() => navigate('/calculator')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-semibold cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
            Back to Calculator
          </button>
          <button type="button" onClick={() => setShowSavedModal(true)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
            <Save className="w-3.5 h-3.5" />
            Saved Projects
          </button>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Cost Calculator by Rightcon</p>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Project Summary</h1>
        </div>

        {/* 2. Estimate Hero */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">Your Estimated Construction Cost</p>

          {hasProject ? (
            <div className="space-y-3">
              <p className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
                {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 font-medium">
                <span><span className="font-bold text-slate-800">₹{ratePerSqFt.toLocaleString('en-IN')}</span> / sq.ft</span>
                <span className="text-slate-300">·</span>
                <span><span className="font-bold text-slate-800">{buaSqFt.toLocaleString('en-IN')}</span> sq.ft built-up</span>
              </div>
              {selectedMaterials && (
                <p className="text-xs text-slate-400 font-medium pt-2 border-t border-slate-100">Materials: {selectedMaterials}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-4xl font-black text-slate-300">₹0</p>
              <p className="text-sm text-slate-500">Project not configured yet.</p>
              <button type="button" onClick={() => navigate('/calculator')} className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                Continue Configuration <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

        {/* 3. Project Details */}
        {(plotLength > 0 || floors > 0) && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">Project Details</h2>
            <DetailRow label="Location"      value={city || '—'} />
            <DetailRow label="Plot Size"     value={plotLength > 0 && plotWidth > 0 ? `${plotLength} × ${plotWidth} ft (${(plotLength * plotWidth).toLocaleString('en-IN')} sq.ft)` : '—'} />
            <DetailRow label="Floors"        value={floorsLabel(floors)} />
            <DetailRow label="Built-up Area" value={buaSqFt > 0 ? `${buaSqFt.toLocaleString('en-IN')} sq.ft` : '—'} />
            <DetailRow label="House Type"    value={houseType || '—'} />
            {rooms.bedrooms  > 0 && <DetailRow label="Bedrooms"   value={String(rooms.bedrooms)} />}
            {rooms.bathrooms > 0 && <DetailRow label="Bathrooms"  value={String(rooms.bathrooms)} />}
            {rooms.kitchen   > 0 && <DetailRow label="Kitchen"    value={String(rooms.kitchen)} />}
          </section>
        )}

        {/* 4. Cost Breakdown */}
        {hasProject && totalCost > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Cost Breakdown</h2>
              <span className="text-xs text-slate-400 font-medium">{boq.length} line items</span>
            </div>

            {breakdownRows.map(row => (
              <BreakdownRow key={row.label} label={row.label} amount={row.amount} totalCost={totalCost} />
            ))}

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Professional Fees</span>
                <span className="font-semibold text-slate-700">{formatCurrency(budget.professionalFees)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Contingency</span>
                <span className="font-semibold text-slate-700">{formatCurrency(budget.contingency)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>GST (12%)</span>
                <span className="font-semibold text-slate-700">{formatCurrency(budget.gstAmount)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700">Total Project Cost</span>
              <span className="text-base font-black text-slate-900">{formatCurrency(totalCost)}</span>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => navigate('/calculator')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <LayoutList className="w-3.5 h-3.5" />
                View Full BOQ ({boq.length} items) — available in Report
              </button>
            </div>
          </section>
        )}

        {/* 5. Quick Actions */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">Next Steps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" onClick={() => navigate('/calculator')} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 transition-all text-left cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors">
                <PencilLine className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Edit Estimate</p>
                <p className="text-xs text-slate-500">Return to calculator</p>
              </div>
            </button>

            <Link to="/report" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors">
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Full Report</p>
                <p className="text-xs text-slate-500">View detailed estimate</p>
              </div>
            </Link>

            <button type="button" onClick={() => setShowSavedModal(true)} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors">
                <Save className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Save Project</p>
                <p className="text-xs text-slate-500">Save this estimation</p>
              </div>
            </button>

            <Link to="/" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors">
                <Home className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Home</p>
                <p className="text-xs text-slate-500">Back to main page</p>
              </div>
            </Link>
          </div>
        </section>

        {/* 6. Timeline hint */}
        {hasProject && (
          <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Construction Timeline</span>
            </div>
            <Link to="/report" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View in Report <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <p className="text-[11px] text-slate-400 text-center pb-4">
          All values are engineering-grade estimates. Final costs depend on contractor agreements, site conditions, and material availability.
        </p>

      </div>

      <SavedEstimationsModal isOpen={showSavedModal} onClose={() => setShowSavedModal(false)} />
    </motion.div>
  );
};
