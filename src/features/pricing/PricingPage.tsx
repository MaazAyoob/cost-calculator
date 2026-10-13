// ==============================================================================
// Hutty Customer Pricing Page (Pricing Model V1)
// Tiers: FREE (₹0), Detailed BOQ (₹499), Premium BOQ (₹1,499).
// Consultation (₹1,499) is strictly decoupled and displayed as a separate service.
// Architectural, trustworthy, mobile-responsive, and brand-aligned design.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  FileText,
  UserCheck,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { usePricingStore } from '../../store/usePricingStore';
import { useWizardStore } from '../../store/useWizardStore';
import { UnlockReportModal } from '../../components/modals/UnlockReportModal';
import { PricingTierCode } from '../../types/pricing';
import { formatPaiseToINR } from '../../config/pricing';
import { SEO } from '../../components/common/SEO';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchTiers, purchases, canAccessFeature } = usePricingStore();
  const { startNewProject } = useWizardStore();

  const [checkoutTier, setCheckoutTier] = useState<PricingTierCode | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const handleSelectTier = (code: string) => {
    if (code === 'FREE') {
      startNewProject();
      navigate('/calculator');
      return;
    }

    if (code === 'COMPLETE_PACKAGE') {
      return;
    }

    setCheckoutTier(code as PricingTierCode);
    setShowCheckoutModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#1B3D34] select-none py-10 sm:py-16">
      <SEO
        title="Plans & Pricing | Hutty Residential Construction"
        description="Transparent pricing for residential construction planning: Free estimate, ₹499 detailed BOQ report, and ₹1,499 premium package. Expert consultation available at ₹1,499."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Editorial Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 arch-spec-pill text-[#1B3D34]">
            <Layers className="w-3.5 h-3.5 text-[#F28C28]" />
            <span>TRANSPARENT PRICING</span>
          </div>

          <h1 className="heading-xl text-4xl sm:text-5xl lg:text-6xl font-black text-[#1B3D34] font-heading tracking-tight leading-[1.08]">
            Choose how much clarity you need.
          </h1>

          <p className="body-lg text-[#4B5563] leading-relaxed max-w-2xl mx-auto">
            Explore your house plan for free, unlock a detailed construction cost report, or choose our premium planning package. Need personalized advice? Book an independent expert.
          </p>

          {purchases.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B3D34] hover:underline cursor-pointer bg-white px-4 py-2 rounded-xl border border-[#E3E8E2] shadow-2xs"
              >
                <Clock className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>View My Purchased Plans ({purchases.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 3 CONFIRMED CALCULATOR TIERS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch text-left">
          
          {/* TIER 01: CALCULATOR — FREE */}
          <div className="p-6 sm:p-7 bg-white rounded-3xl border border-[#E3E8E2] hover:border-[#1B3D34] transition-all flex flex-col justify-between space-y-5 tactile-card arch-bracketed shadow-2xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3E8E2] pb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4B5563]">
                  CALCULATOR PLAN
                </span>
                <span className="font-mono text-xs font-bold text-[#1B3D34] bg-[#F8F8F6] px-2.5 py-0.5 rounded border border-[#E3E8E2]">
                  ₹0 FREE
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-[#1B3D34] font-heading">
                  Calculator — Free
                </h2>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Explore your house plan and see a basic estimate. Understand your plot and built-up area.
                </p>
              </div>

              <div className="pt-2 pb-1 border-y border-[#E3E8E2]">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#1B3D34] font-heading">₹0</span>
                  <span className="text-xs text-[#4B5563]">/ forever</span>
                </div>
                <span className="text-[10px] font-mono text-[#4B5563] block mt-0.5">No credit card or login required</span>
              </div>

              <div className="space-y-2 text-xs text-[#1B3D34]">
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span>Interactive 10-step room &amp; material choices</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span>Total built-up area (BUA) and footprint estimate</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span>Preliminary construction cost range</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span>3D house view and plot layout</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectTier('FREE')}
              className="w-full py-3 px-4 rounded-xl border border-[#1B3D34] text-[#1B3D34] bg-white hover:bg-[rgba(27,61,52,0.04)] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Start Free Estimate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TIER 02: CALCULATOR — DETAILED BOQ (₹499) */}
          <div className="p-6 sm:p-7 bg-white rounded-3xl border-2 border-[#1B3D34] shadow-md flex flex-col justify-between space-y-5 tactile-card arch-bracketed relative">
            <div className="absolute -top-3 right-4 bg-[#1B3D34] text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F28C28]" />
              <span>RECOMMENDED</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3E8E2] pb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#F28C28]">
                  FULL REPORT
                </span>
                <span className="font-mono text-xs font-black text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2.5 py-0.5 rounded">
                  OFFICIAL REPORT
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-[#1B3D34] font-heading">
                  Calculator — Detailed BOQ
                </h2>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Get a detailed report showing the work, materials, and estimated costs for your house.
                </p>
              </div>

              <div className="pt-2 pb-1 border-y border-[#E3E8E2]">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#1B3D34] font-heading">₹499</span>
                  <span className="text-xs text-[#4B5563]">/ project</span>
                </div>
                <span className="text-[10px] font-mono text-[#4B5563] block mt-0.5">One-time payment • All inclusive</span>
              </div>

              <div className="space-y-2 text-xs text-[#1B3D34]">
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span>Everything in Free Estimate</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>What We Build:</strong> Itemized civil &amp; structural works BOQ</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Materials Needed:</strong> Exact steel, cement, sand, brick counts</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>What We Install:</strong> Doors, windows, and sanitary fixtures</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Labour &amp; Work Costs:</strong> Itemized trades &amp; milestone payment plan</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Downloadable PDF Report:</strong> Share with contractor or bank</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectTier('DETAILED_ESTIMATE_499')}
              className="w-full hutty-btn-primary py-3.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Get Detailed BOQ — ₹499</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
            </button>
          </div>

          {/* TIER 03: CALCULATOR — PREMIUM (₹1,499) */}
          <div className="p-6 sm:p-7 bg-white rounded-3xl border border-[#E3E8E2] hover:border-[#1B3D34] transition-all flex flex-col justify-between space-y-5 tactile-card arch-bracketed shadow-2xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3E8E2] pb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4B5563]">
                  UPGRADED SUITE
                </span>
                <span className="font-mono text-xs font-bold text-[#1B3D34] bg-[#F8F8F6] px-2.5 py-0.5 rounded border border-[#E3E8E2]">
                  PREMIUM
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-[#1B3D34] font-heading">
                  Calculator — Premium
                </h2>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  An upgraded calculator package with multi-scenario comparison and premium material customization.
                </p>
              </div>

              <div className="pt-2 pb-1 border-y border-[#E3E8E2]">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#1B3D34] font-heading">₹1,499</span>
                  <span className="text-xs text-[#4B5563]">/ project</span>
                </div>
                <span className="text-[10px] font-mono text-[#4B5563] block mt-0.5">One-time payment • All inclusive</span>
              </div>

              <div className="space-y-2 text-xs text-[#1B3D34]">
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span>Everything in Detailed BOQ plan (₹499)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Multi-Scenario Comparison:</strong> Compare layouts &amp; areas side by side</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Premium Specification Customizer:</strong> Fine-tune luxury finish options</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Permanent Cloud Save:</strong> Unlimited revision history</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Priority Export Suite:</strong> Unlimited PDF &amp; spreadsheet downloads</span>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200/80 text-[10px] text-amber-900 leading-tight">
                  <em>Note: Consultation with an expert is a separate professional service.</em>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectTier('PREMIUM_1499')}
              className="w-full py-3 px-4 rounded-xl border border-[#1B3D34] text-[#1B3D34] bg-white hover:bg-[rgba(27,61,52,0.04)] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Get Calculator — Premium (₹1,499)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* ── DECOUPLED CONSULTATION SERVICE CALLOUT (₹1,499) ── */}
        <div className="bg-[#112821] text-white rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md text-left arch-bracketed">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-[#F28C28]">
              <UserCheck className="w-3.5 h-3.5" />
              <span>SEPARATE PROFESSIONAL SERVICE</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-white">
              Need help building your home? Talk to an expert.
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Book a 45-minute 1-on-1 private advisory session with a Council of Architecture (COA) registered architect or chartered structural engineer. We review your house plan, contractor quote, structural questions, or site problems.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="text-center md:text-right">
              <span className="text-[10px] text-white/60 uppercase font-mono block">Consultation Fee</span>
              <span className="text-3xl font-black text-[#F28C28] font-heading">₹1,499</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/consult')}
              className="hutty-btn-primary bg-[#F28C28] hover:bg-[#D9771A] text-[#1B3D34] font-bold px-6 py-3.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
            >
              <span>Consult an Expert — ₹1,499</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#1B3D34]" />
            </button>
          </div>
        </div>

        {/* ── FREQUENTLY ASKED QUESTIONS ── */}
        <div className="max-w-3xl mx-auto space-y-6 text-left">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-extrabold text-[#1B3D34] font-heading">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-[#4B5563]">
              Clear commercial terms for homeowners and builders.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does the ₹499 Detailed Estimate differ from the Free calculator?',
                a: 'The Free calculator provides preliminary cost brackets and built-up area geometry. The ₹499 Detailed Construction Dossier unlocks the exact civil/structural Works BOQ, physical material quantities (steel kg, cement bags, sand CFT), installed fixture schedules, and high-resolution downloadable PDF.',
              },
              {
                q: 'Do the underlying construction quantities change if I pick a different pricing tier?',
                a: 'Never. Hutty uses a single canonical calculation engine. The physical quantities of concrete, steel, blocks, and labour are purely calculated based on your architectural inputs and structural engineering rules. Your pricing tier controls commercial access to the dossier, not the physical math.',
              },
              {
                q: 'Can I upgrade from the Free Plan or Detailed BOQ to Premium later?',
                a: 'Yes. Any customer on the Free plan can upgrade to the ₹499 Detailed BOQ or ₹1,499 Premium tier at any time to unlock the full works BOQ, materials needed schedule, and comparison tools.',
              },
              {
                q: 'Is the ₹1,499 Consultation included in any calculator tier?',
                a: 'No. The ₹1,499 Expert Consultation is an independent professional advisory service with verified architects and chartered engineers and is booked separately.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-[#E3E8E2] space-y-1.5 shadow-2xs">
                <h4 className="text-xs sm:text-sm font-bold text-[#1B3D34]">
                  {faq.q}
                </h4>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <UnlockReportModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          initialTierCode={checkoutTier || 'DETAILED_ESTIMATE_499'}
        />
      )}

      {/* Customer Purchase History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-[#1B3D34]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E3E8E2] max-w-lg w-full p-6 space-y-4 shadow-2xl text-left relative max-h-[85vh] overflow-y-auto arch-bracketed">
            <div className="flex items-center justify-between border-b border-[#E3E8E2] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F28C28]" />
                <h3 className="text-base font-extrabold text-[#1B3D34] font-heading">
                  My Purchased Plans ({purchases.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-xs font-bold text-[#4B5563] hover:text-[#1B3D34] cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {purchases.map((p) => (
                <div key={p.id} className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1B3D34]">{p.tierNameSnapshot}</span>
                    <span className="font-mono font-bold text-[#1B3D34]">
                      {formatPaiseToINR(p.amountMinorUnits)}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#4B5563] flex items-center justify-between">
                    <span>Order: {p.publicReference}</span>
                    <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#4B5563]">
                    Date: {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
