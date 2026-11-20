// ==============================================================================
// Hutty Customer Pricing Page (Pricing Model V2 — Report-First)
// Commercial Model: Free Estimate (₹0), Complete Report (₹199 one-time).
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
import consultationArchitectImg from '../../assets/consultation-architect.jpg';

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
    <div className="min-h-screen bg-[#F8F8F6] text-[#183B32] select-none py-10 sm:py-16">
      <SEO
        title="Plans & Pricing | Hutty Residential Construction"
        description="Transparent pricing for residential construction planning: Free on-screen estimate and ₹199 Complete Construction Planning & Estimation Report. Expert consultation available at ₹1,499."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Editorial Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 arch-spec-pill text-[#183B32]">
            <Layers className="w-3.5 h-3.5 text-[#C66B4E]" />
            <span>TRANSPARENT PRICING</span>
          </div>

          <h1 className="heading-xl text-4xl sm:text-5xl lg:text-6xl font-black text-[#183B32] font-heading tracking-tight leading-[1.08]">
            Simple, honest pricing.
          </h1>

          <p className="body-lg text-[#66716B] leading-relaxed max-w-2xl mx-auto">
            Plan your home and explore cost ranges for free. Unlock the complete contractor-grade construction planning report for ₹199. Independent expert consultation is available separately.
          </p>

          {purchases.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#183B32] hover:underline cursor-pointer bg-white px-4 py-2 rounded-xl border border-[#E5E7EB] shadow-2xs"
              >
                <Clock className="w-3.5 h-3.5 text-[#C66B4E]" />
                <span>View My Purchased Plans ({purchases.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 2 CORE TIERS: FREE & ₹199 COMPLETE REPORT ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto text-left">
          
          {/* TIER 01: FREE ESTIMATE (₹0) */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#E5E7EB] hover:border-[#183B32] transition-all flex flex-col justify-between space-y-6 tactile-card arch-bracketed shadow-2xs">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#66716B]">
                  ON-SCREEN ESTIMATE
                </span>
                <span className="font-mono text-xs font-bold text-[#183B32] bg-[#F8F8F6] px-2.5 py-0.5 rounded border border-[#E5E7EB]">
                  ₹0 FREE
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-black text-[#183B32] font-heading">
                  Free Construction Estimate
                </h2>
                <p className="text-xs sm:text-sm text-[#66716B] leading-relaxed">
                  Configure your plot and house requirements with our 5-step guided planner. Instant on-screen cost ranges and area analysis.
                </p>
              </div>

              <div className="pt-3 pb-2 border-y border-[#E5E7EB]">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#183B32] font-heading">₹0</span>
                  <span className="text-xs text-[#66716B]">/ forever</span>
                </div>
                <span className="text-[10px] font-mono text-[#66716B] block mt-0.5">No credit card or login required</span>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm text-[#183B32]">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                  <span>5-step guided architectural configuration</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                  <span>Total built-up area (BUA) and setback calculation</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                  <span>Preliminary construction cost range &amp; trade breakdown</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                  <span>Instant on-screen project summary</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectTier('FREE')}
              className="w-full py-3.5 px-4 rounded-xl border border-[#183B32] text-[#183B32] bg-white hover:bg-[rgba(27,61,52,0.04)] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Start Free Estimate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TIER 02: COMPLETE CONSTRUCTION REPORT (₹199) */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-[#183B32] shadow-md flex flex-col justify-between space-y-6 tactile-card arch-bracketed relative">
            <div className="absolute -top-3 right-6 bg-[#183B32] text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C66B4E]" />
              <span>COMPLETE REPORT</span>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C66B4E]">
                  COMPLETE DELIVERABLE
                </span>
                <span className="font-mono text-xs font-black text-[#183B32] bg-[rgba(27,61,52,0.08)] px-2.5 py-0.5 rounded">
                  ₹199 ONE-TIME
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-black text-[#183B32] font-heading">
                  Complete Construction Report
                </h2>
                <p className="text-xs sm:text-sm text-[#66716B] leading-relaxed">
                  The complete contractor-grade residential dossier with physical takeoffs, trade schedules, and audit frameworks.
                </p>
              </div>

              <div className="pt-3 pb-2 border-y border-[#E5E7EB]">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#183B32] font-heading">₹199</span>
                  <span className="text-xs text-[#66716B]">/ project</span>
                </div>
                <span className="text-[10px] font-mono text-[#66716B] block mt-0.5">One-time payment • All inclusive • Instant PDF download</span>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm text-[#183B32]">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                  <span>Everything in Free Estimate</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                  <span><strong>Itemized Works BOQ:</strong> Structural, masonry, plaster, flooring &amp; paint</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                  <span><strong>Physical Material Takeoff:</strong> Fe 550D steel kg, 53G cement, sand &amp; blocks</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                  <span><strong>Milestone Payment Schedule:</strong> 6-stage construction payment roadmap</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                  <span><strong>Contractor Quote Audit:</strong> Benchmark rates &amp; missing scope redlines</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                  <span><strong>Downloadable PDF Dossier:</strong> Comprehensive multi-page architectural report</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectTier('DETAILED_ESTIMATE_499')}
              className="w-full hutty-btn-primary py-4 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Unlock Complete Report — ₹199</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C66B4E]" />
            </button>
          </div>

        </div>

        {/* ── DECOUPLED CONSULTATION SERVICE CALLOUT (₹1,499) ── */}
        <div className="bg-[#112821] text-white rounded-3xl overflow-hidden shadow-md text-left grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5 h-64 sm:h-72 lg:h-full w-full relative overflow-hidden bg-slate-900">
            <img
              src={consultationArchitectImg}
              alt="Indian architect consulting with homeowners on residential plan"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent to-[#112821]/90" />
            
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
              Council of Architecture &bull; Bangalore
            </div>
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-[#C66B4E]">
              <UserCheck className="w-3.5 h-3.5" />
              <span>SEPARATE PROFESSIONAL SERVICE</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black font-heading text-white">
              Need help building your home? Talk to an expert.
            </h3>
            
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Book a private 1-on-1 advisory session with an independent construction specialist. Review your floor plan, clarify municipal setback rules, and examine contractor estimates with complete objectivity.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10 pt-4">
              <div>
                <span className="text-[10px] text-white/60 uppercase font-mono block">Consultation Fee</span>
                <span className="text-3xl font-black text-[#C66B4E] font-heading">₹1,499</span>
                <span className="text-[10px] text-white/50 block">Private independent session</span>
              </div>

              <button
                type="button"
                onClick={() => navigate('/consult')}
                className="bg-[#C66B4E] hover:bg-[#A95640] text-white font-bold px-6 py-3.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
              >
                <span>Consult an Expert — ₹1,499</span>
                <ArrowRight className="w-3.5 h-3.5 text-white/90" />
              </button>
            </div>
          </div>
        </div>

        {/* ── FREQUENTLY ASKED QUESTIONS ── */}
        <div className="max-w-3xl mx-auto space-y-6 text-left">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-extrabold text-[#183B32] font-heading">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-[#66716B]">
              Clear commercial terms for homeowners and builders.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does the ₹199 Complete Construction Report differ from the Free calculator?',
                a: 'The Free calculator provides preliminary cost brackets and built-up area geometry on-screen. The ₹199 Complete Construction Planning & Estimation Report unlocks the complete downloadable PDF dossier including itemized works BOQ, exact physical material quantities (steel kg, cement bags, sand CFT), contractor quotation audit benchmarks, and milestone payment schedules.',
              },
              {
                q: 'Do the underlying construction quantities change if I pick a different pricing tier?',
                a: 'Never. Hutty uses a single canonical calculation engine. The physical quantities of concrete, steel, blocks, and labour are purely calculated based on your architectural inputs and structural engineering rules. Your payment unlocks the complete dossier and PDF export; it does not alter the physical math.',
              },
              {
                q: 'Can I download a PDF with the Free calculator?',
                a: 'No. The Free calculator is designed for on-screen exploration and preliminary estimation. Downloading the formal, contractor-grade PDF report requires the one-time ₹199 purchase.',
              },
              {
                q: 'Is the ₹1,499 Consultation included with the report?',
                a: 'No. The ₹1,499 Expert Consultation is an independent advisory service with licensed architects and estimation specialists, booked separately.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] space-y-1.5 shadow-2xs">
                <h4 className="text-xs sm:text-sm font-bold text-[#183B32]">
                  {faq.q}
                </h4>
                <p className="text-xs text-[#66716B] leading-relaxed">
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
        <div className="fixed inset-0 z-50 bg-[#183B32]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] max-w-lg w-full p-6 space-y-4 shadow-2xl text-left relative max-h-[85vh] overflow-y-auto arch-bracketed">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C66B4E]" />
                <h3 className="text-base font-extrabold text-[#183B32] font-heading">
                  My Purchased Plans ({purchases.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-xs font-bold text-[#66716B] hover:text-[#183B32] cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {purchases.map((p) => (
                <div key={p.id} className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#183B32]">{p.tierNameSnapshot}</span>
                    <span className="font-mono font-bold text-[#183B32]">
                      {formatPaiseToINR(p.amountMinorUnits)}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#66716B] flex items-center justify-between">
                    <span>Order: {p.publicReference}</span>
                    <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#66716B]">
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
