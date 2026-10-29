import React, { useState } from 'react';
import { useCalculationStore, useBOQ, useBudgetResult, useArea, useQuantities } from '../../../store/useCalculationStore';
import { useWizardStore } from '../../../store/useWizardStore';
import { useCustomerAuthStore } from '../../../store/useCustomerAuthStore';
import { useEntitlementStore } from '../../../store/useEntitlementStore';
import { usePricingStore } from '../../../store/usePricingStore';
import { UnlockReportModal } from '../../../components/modals/UnlockReportModal';
import { PricingTierCode } from '../../../types/pricing';
import { formatCurrency } from '../../../utils/cn';
import {
  FileText,
  Lock,
  Download,
  Sparkles,
  Check,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Compass,
  Table,
  Layers,
  Calendar,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

interface Stage8DetailedBOQProps {
  onBackToEstimate: () => void;
}

export const Stage8DetailedBOQ: React.FC<Stage8DetailedBOQProps> = ({ onBackToEstimate }) => {
  const boq = useBOQ();
  const budget = useBudgetResult();
  const area = useArea();
  const quantities = useQuantities();
  const { selectedPackage, startNewProject } = useWizardStore();
  const { isAuthenticated } = useCustomerAuthStore();
  const { hasDetailedReportAccess } = useEntitlementStore();

  const projectId = 'HUTTY-PROJECT-ESTIMATE';
  const isUnlocked = hasDetailedReportAccess(projectId);
  const isPremiumUnlocked = usePricingStore.getState().canAccessFeature('SCENARIO_COMPARISONS', projectId);

  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [selectedPlanTier, setSelectedPlanTier] = useState<PricingTierCode>('DETAILED_ESTIMATE_499');

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;

  // Sample civil works preview (first 8 items)
  const previewItems = boq.slice(0, 8);

  const handleSelectPlan = (tier: PricingTierCode) => {
    setSelectedPlanTier(tier);
    setShowCheckoutModal(true);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Stage Header */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF3EF] border border-[#D5E5DC] text-[11px] font-bold text-[#1B3D34]">
          <FileText className="w-3 h-3 text-[#F28C28]" />
          <span>STAGE 8 OF 8 &bull; DETAILED BOQ &amp; REPORT PLANS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#1B3D34] tracking-tight">
          See what your home may need, work by work.
        </h2>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Preview your itemized work-wise BOQ, material takeoff schedules, and trade labour milestones before choosing a report plan.
        </p>
      </div>

      {/* 1. Work-wise BOQ Preview Table */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#1B3D34] flex items-center gap-1.5">
              <Table className="w-4 h-4 text-[#F28C28]" />
              <span>Civil &amp; Finishing Works BOQ Preview</span>
            </h3>
            <span className="text-[11px] text-[#687770]">Showing preview of 8 items out of {boq.length || 32} total schedule items</span>
          </div>

          <span className="text-xs font-mono font-bold text-[#1B3D34] bg-[#EBF3EF] px-3 py-1 rounded-full border border-[#D5E5DC] w-fit">
            Total BUA: {buaSqFt.toLocaleString()} sq.ft
          </span>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto no-scrollbar border border-[#E5E7EB] rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F8F6] text-[#687770] font-bold uppercase text-[10px] border-b border-[#E5E7EB]">
              <tr>
                <th className="py-2.5 px-3">Item #</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-4 min-w-[200px]">Work Description</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3 text-right">Unit Rate</th>
                <th className="py-2.5 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] font-mono text-[11px] text-[#202522]">
              {previewItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#F8F9F7] transition-colors">
                  <td className="py-2.5 px-3 text-[#687770]">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-[#1B3D34]">{item.category}</td>
                  <td className="py-2.5 px-4 font-sans text-xs text-[#4B5563]">{item.description}</td>
                  <td className="py-2.5 px-3 text-right">{item.quantity ? Math.round(item.quantity).toLocaleString() : '-'}</td>
                  <td className="py-2.5 px-3 text-[#687770]">{item.unit || 'sq.ft'}</td>
                  <td className="py-2.5 px-3 text-right">₹{item.unitRate ? Math.round(item.unitRate).toLocaleString() : '-'}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-[#1B3D34]">
                    ₹{item.amount ? Math.round(item.amount).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Locked schedule banner */}
        {!isUnlocked && (
          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-dashed border-[#CBD5CB] flex items-center justify-between text-xs text-[#4B5563]">
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#F28C28]" />
              Remaining 24+ civil, plumbing, electrical, and joinery line items available in the Detailed BOQ report.
            </span>
            <button
              type="button"
              onClick={() => handleSelectPlan('DETAILED_ESTIMATE_499')}
              className="text-[#1B3D34] font-bold hover:underline cursor-pointer shrink-0"
            >
              Unlock Report &rarr;
            </button>
          </div>
        )}
      </div>

      {/* 2. Commercial Report Plans (Exact 4 Products/Services) */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-[#1B3D34] font-heading">
            Select Your Plan
          </h3>
          <p className="text-xs text-[#687770]">
            Review what is included for free versus what is delivered in our paid reports and expert consultations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">

          {/* PLAN 1: Free Estimate (₹0) */}
          <div className="p-5 bg-white rounded-3xl border border-[#E5E7EB] flex flex-col justify-between space-y-4 shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#687770]">
                  PLAN 01
                </span>
                <span className="text-xs font-bold text-[#1B3D34] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                  ACTIVE
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold font-heading text-[#1B3D34]">Free Estimate</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black font-heading text-[#1B3D34]">₹0</span>
                  <span className="text-xs text-[#687770]">/ free forever</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#4B5563] pt-2 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Total built-up area calculation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Preliminary cost indication</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>High-level materials &amp; labour split</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Interactive 3D massing view</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#EBF3EF] text-center text-xs font-bold text-[#1B3D34]">
              Included with Calculator
            </div>
          </div>

          {/* PLAN 2: Detailed BOQ (₹499) — FEATURED */}
          <div className="p-5 bg-white rounded-3xl border-2 border-[#1B3D34] flex flex-col justify-between space-y-4 shadow-md relative">
            <span className="absolute -top-2.5 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#1B3D34] text-white flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#F28C28]" />
              Recommended
            </span>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28]">
                  PLAN 02
                </span>
                <span className="text-xs font-black text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded">
                  FULL REPORT
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold font-heading text-[#1B3D34]">Detailed BOQ</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black font-heading text-[#1B3D34]">₹499</span>
                  <span className="text-xs text-[#687770]">/ one-time payment</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#202522] pt-2 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span><strong>Work-wise BOQ:</strong> Complete civil &amp; MEP items</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span><strong>Materials Needed:</strong> Steel, cement, sand unit rates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span><strong>Trade Labour:</strong> Trade allocations &amp; milestone schedule</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span><strong>Downloadable PDF:</strong> Comprehensive estimation report with full BOQ</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPlan('DETAILED_ESTIMATE_499')}
              className="w-full py-3 rounded-xl bg-[#1B3D34] hover:bg-[#142E27] text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Get Detailed BOQ — ₹499</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
            </button>
          </div>

          {/* PLAN 3: Premium BOQ (₹1,499) */}
          <div className="p-5 bg-white rounded-3xl border border-[#E5E7EB] flex flex-col justify-between space-y-4 shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#687770]">
                  PLAN 03
                </span>
                <span className="text-xs font-bold text-[#1B3D34] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                  UPGRADED
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold font-heading text-[#1B3D34]">Premium BOQ</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black font-heading text-[#1B3D34]">₹1,499</span>
                  <span className="text-xs text-[#687770]">/ one-time payment</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#4B5563] pt-2 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span>Everything in Detailed BOQ plan (₹499)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span><strong>Multi-Scenario Comparison:</strong> Compare layouts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span><strong>Premium Specification Customizer</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span><strong>Priority Export Suite:</strong> Unlimited PDF downloads</span>
                </div>
              </div>

              <div className="p-2 bg-amber-50 rounded-lg text-[10px] text-amber-900 border border-amber-200/80">
                <em>Note: Consultation is a separate professional service.</em>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPlan('PREMIUM_1499')}
              className="w-full py-3 rounded-xl border border-[#1B3D34] text-[#1B3D34] bg-white hover:bg-[#F8F8F6] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Get Premium — ₹1,499</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* 3. Decoupled Consultation Callout (₹1,499) */}
      <div className="p-5 sm:p-6 bg-[#112821] text-white rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#F28C28]">
            <Compass className="w-3.5 h-3.5" />
            <span>INDEPENDENT EXPERT CONSULTATION &bull; ₹1,499</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold font-heading">
            Need drawings reviewed or contractor bids checked?
          </h4>
          <p className="text-xs text-white/70 max-w-xl">
            Book a 45-minute 1-on-1 online session with a verified architect or structural engineer. Separate from report purchases.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.open('/consult', '_blank')}
          className="bg-white hover:bg-white/90 text-[#1B3D34] text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer shrink-0 shadow-xs flex items-center justify-center gap-1.5"
        >
          <span>Book Consultation — ₹1,499</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
        </button>
      </div>

      {/* Bottom Back Button */}
      <div className="pt-2 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={onBackToEstimate}
          className="px-4 py-2.5 rounded-xl border border-[#CBD5CB] text-[#1B3D34] bg-white hover:bg-[#F8F9F7] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>&larr; Back to Preliminary Estimate</span>
        </button>
      </div>

      {/* Checkout Modal */}
      <UnlockReportModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        initialTierCode={selectedPlanTier}
        onSuccess={() => {
          setShowCheckoutModal(false);
        }}
      />

    </div>
  );
};
