// ==============================================================================
// Hutty Customer Pricing Page (Pricing Model V1)
// Tiers: FREE (₹0), ₹99, ₹499 Detailed Estimate, COMPLETE PACKAGE (Coming Soon).
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
        title="Commercial Pricing Plans | Hutty Residential Construction"
        description="Transparent pricing for residential construction planning: Free preview, ₹99 verified estimate, and ₹499 bank-ready detailed construction dossier."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Editorial Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 arch-spec-pill text-[#1B3D34]">
            <Layers className="w-3.5 h-3.5 text-[#F28C28]" />
            <span>TRANSPARENT COMMERCIAL PLANS</span>
          </div>

          <h1 className="heading-xl text-4xl sm:text-5xl lg:text-6xl font-black text-[#1B3D34] font-heading tracking-tight leading-[1.08]">
            Choose how much clarity you need.
          </h1>

          <p className="body-lg text-[#4B5563] leading-relaxed max-w-2xl mx-auto">
            From initial spatial exploration to the bank-ready 22-section bill of quantities. Transparent, deterministic, and built strictly on civil engineering math.
          </p>

          {purchases.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B3D34] hover:underline cursor-pointer bg-white px-4 py-2 rounded-xl border border-[#E5E7EB] shadow-2xs"
              >
                <Clock className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>View My Purchased Plans ({purchases.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* ── ASYMMETRIC VALUE HIERARCHY GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch text-left">
          
          {/* LEFT: Free Plan & ₹99 Verified Plan (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* TIER 01: FREE */}
            <div className="p-6 sm:p-7 bg-white rounded-3xl border border-[#E5E7EB] hover:border-[#1B3D34] transition-all flex flex-col justify-between space-y-5 tactile-card arch-bracketed shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4B5563]">
                    TIER 01 // EXPLORE YOUR PROJECT
                  </span>
                  <span className="font-mono text-xs font-bold text-[#1B3D34] bg-[#F8F8F6] px-2.5 py-0.5 rounded border border-[#E5E7EB]">
                    ₹0 FREE
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-[#1B3D34] font-heading">
                    Free Plan
                  </h2>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    Instant high-level budget indication and preliminary gross area calculations.
                  </p>
                </div>

                <div className="pt-2 pb-1 border-y border-[#E5E7EB]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#1B3D34] font-heading">₹0</span>
                    <span className="text-xs text-[#4B5563]">/ forever</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#4B5563] block mt-0.5">No credit card or login required</span>
                </div>

                <div className="space-y-2 text-xs text-[#1B3D34]">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                    <span>Basic Project Summary &amp; BUA Calculation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                    <span>Estimated Total Cost Indication Range</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                    <span>Interactive 10-Step Specification Explorer</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectTier('FREE')}
                className="w-full py-3 px-4 rounded-xl border border-[#1B3D34] text-[#1B3D34] bg-white hover:bg-[rgba(27,61,52,0.04)] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Start Free Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* TIER 02: ₹99 VERIFIED PLAN */}
            <div className="p-6 sm:p-7 bg-white rounded-3xl border border-[#E5E7EB] hover:border-[#1B3D34] transition-all flex flex-col justify-between space-y-5 tactile-card arch-bracketed shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4B5563]">
                    TIER 02 // START PLANNING SERIOUSLY
                  </span>
                  <span className="font-mono text-xs font-bold text-[#F28C28] bg-[#F28C28]/10 px-2.5 py-0.5 rounded border border-[#F28C28]/20">
                    ₹99 ONE-TIME
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-[#1B3D34] font-heading">
                    ₹99 Verified Feasibility
                  </h2>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    Save customized project feasibility, record plot geometry, and lock preliminary trade rates.
                  </p>
                </div>

                <div className="pt-2 pb-1 border-y border-[#E5E7EB]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#1B3D34] font-heading">₹99</span>
                    <span className="text-xs text-[#4B5563]">/ project</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#4B5563] block mt-0.5">One-time payment • All inclusive</span>
                </div>

                <div className="space-y-2 text-xs text-[#1B3D34]">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                    <span>Everything in Free Plan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                    <span>Permanent Cloud Project Save &amp; Recovery</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                    <span>Preliminary Trade Breakdown Indicators</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectTier('ESTIMATE_99')}
                className="w-full py-3 px-4 rounded-xl border border-[#1B3D34] text-[#1B3D34] bg-white hover:bg-[rgba(27,61,52,0.04)] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Get ₹99 Feasibility</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* RIGHT: TIER 03: ₹499 DETAILED ESTIMATE (FLAGSHIP CENTERPIECE, 7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-[#1B3D34] p-8 sm:p-10 flex flex-col justify-between space-y-6 shadow-md relative arch-bracketed">
            <div className="absolute top-0 right-0 bg-[#1B3D34] text-white text-[10px] font-mono font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>RECOMMENDED FOR HOMEOWNERS</span>
            </div>

            <div className="space-y-5 pt-2">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#F28C28]">
                  TIER 03 // COMPLETE CONSTRUCTION PICTURE
                </span>
                <span className="font-mono text-xs font-black text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2.5 py-1 rounded">
                  OFFICIAL DOSSIER
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="arch-stat-giant text-[#1B3D34]">₹499</span>
                  <span className="text-xs text-[#4B5563] font-mono">/ project &bull; lifetime access</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1B3D34] font-heading">
                  22-Section Detailed Construction Dossier
                </h2>
                <p className="text-sm text-[#4B5563] leading-relaxed">
                  Complete quantity surveyor dossier with itemized BOQ, physical steel and cement takeoffs, and bank-ready PDF for home loan sanction.
                </p>
              </div>

              {/* Complete QS Deliverables Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-[#E5E7EB] text-xs text-[#1B3D34]">
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-[#F28C28] shrink-0">&check;</span>
                  <span><strong>Section A:</strong> Itemized Civil Works BOQ</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-[#F28C28] shrink-0">&check;</span>
                  <span><strong>Section B:</strong> Steel, Cement &amp; Sand Schedules</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-[#F28C28] shrink-0">&check;</span>
                  <span><strong>Section C:</strong> Doors, Windows &amp; Sanitary Sets</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-[#F28C28] shrink-0">&check;</span>
                  <span><strong>Section D:</strong> Commercial Margin &amp; GST Analysis</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-[#F28C28] shrink-0">&check;</span>
                  <span><strong>Trade Labour:</strong> Mason, Carpenter, Bar-Bender Days</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-[#F28C28] shrink-0">&check;</span>
                  <span><strong>Bank Dossier:</strong> SBI, HDFC, ICICI Ready PDF</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E5E7EB] space-y-3">
              <button
                type="button"
                onClick={() => handleSelectTier('DETAILED_ESTIMATE_499')}
                className="w-full hutty-btn-primary py-4 px-6 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm min-h-[50px]"
              >
                <span>Unlock Detailed BOQ Dossier (₹499)</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#4B5563]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B3D34]" /> 100% Encrypted Razorpay Checkout
                </span>
                <span>Immediate PDF Generation</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── SEPARATE TIER 04: COMPLETE EXECUTION PACKAGE (COMING SOON) ── */}
        <div className="bg-white rounded-3xl border border-dashed border-[#1B3D34]/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs text-left arch-bracketed opacity-90">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4B5563] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                TIER 04
              </span>
              <span className="font-mono text-xs font-bold text-[#F28C28]">
                COMING SOON &bull; TURNKEY EXECUTION
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1B3D34] font-heading">
              Complete Architectural Design &amp; Site Execution Package
            </h3>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
              Coordinated 2D/3D architectural CAD drawing set, chartered structural vetting protocol, contractor tender evaluation, and milestone-based physical site inspections.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#4B5563] bg-[#F8F8F6] px-4 py-2.5 rounded-xl border border-[#E5E7EB]">
              In Pilot Testing
            </span>
          </div>
        </div>

        {/* ── CONSULTATION SEPARATION CALLOUT (₹1,499) ── */}
        <div className="bg-[#112821] text-white rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md text-left arch-bracketed">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-[#F28C28]">
              <UserCheck className="w-3.5 h-3.5" />
              <span>INDEPENDENT PROFESSIONAL ADVISORY</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-white">
              Need on-site design or structural advice? Book an Expert Consultation.
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Book a 1-on-1 private advisory session with a Council of Architecture (COA) registered architect or chartered structural engineer. Flat launch fee of <strong>₹1,499</strong>. Unconflicted and independent.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="text-center md:text-right">
              <span className="text-[10px] text-white/60 uppercase font-mono block">Flat Launch Fee</span>
              <span className="text-3xl font-black text-[#F28C28] font-heading">₹1,499</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/consult')}
              className="hutty-btn-primary bg-[#F28C28] hover:bg-[#D9771A] text-[#1B3D34] font-bold px-6 py-3.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
            >
              <span>Explore Verified Consultants</span>
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
                q: 'Can I upgrade from the ₹99 Plan to the ₹499 Detailed Estimate later?',
                a: 'Yes. Any customer on the Free or ₹99 tier can upgrade to the ₹499 Detailed Estimate at any time to immediately unlock the full BOQ and generate their official bank dossier.',
              },
              {
                q: 'Is the ₹1,499 Consultation included in any calculator tier?',
                a: 'No. The ₹1,499 Expert Consultation is an independent professional advisory service with verified architects and chartered engineers and is booked separately.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] space-y-1.5 shadow-2xs">
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
          <div className="bg-white rounded-3xl border border-[#E5E7EB] max-w-lg w-full p-6 space-y-4 shadow-2xl text-left relative max-h-[85vh] overflow-y-auto arch-bracketed">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
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
                <div key={p.id} className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-2 text-xs">
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
