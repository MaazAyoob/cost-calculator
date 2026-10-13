import React from 'react';
import { ArrowRight, Check, Sparkles, FileText, Lock, ShieldCheck, Compass, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWizardStore } from '../../../store/useWizardStore';

export const SignaturePricingSection: React.FC = () => {
  const navigate = useNavigate();
  const { startNewProject } = useWizardStore();

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-[#E3E8E2] relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/10 text-xs font-semibold text-[#1B3D34]">
            <span className="text-[#F28C28] font-bold">Plans &amp; Pricing</span>
            <span>&bull;</span>
            <span>Transparent Calculator &amp; Consultation Packages</span>
          </div>

          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B3D34] tracking-tight">
            Choose how much clarity you need.
          </h2>

          <p className="body-lg text-[#4B5563] leading-relaxed">
            Start with a free estimate, unlock a detailed construction cost report with full work schedules, or upgrade for brand comparisons and custom specifications.
          </p>
        </div>

        {/* 3 Confirmed Calculator Tiers: Free / ₹499 / ₹1,499 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* TIER 1: Calculator — Free (₹0) */}
          <div className="p-7 bg-[#F8F8F6] rounded-3xl border border-[#E3E8E2] hover:border-[#1B3D34] transition-all text-left flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3E8E2] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                  Calculator — Free
                </span>
                <span className="text-xs font-bold text-[#1B3D34] bg-white px-2.5 py-0.5 rounded-lg border border-[#E3E8E2]">
                  ₹0 Free
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#1B3D34] font-heading">
                  Free House Explorer
                </h3>
                <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                  Explore your house plan and see a basic estimate. Clearly understand what is included before deciding.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-[#4B5563] pt-3 border-t border-[#E3E8E2]">
                <div className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span>Interactive 3D house view and plot layout</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span>Total built-up area calculations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span>Preliminary cost range across 3 standards</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span>Room layout &amp; floor configuration</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                startNewProject();
                navigate('/calculator');
              }}
              className="w-full hutty-btn-secondary text-xs font-bold py-3 rounded-xl cursor-pointer"
            >
              <span>Start Free Estimate</span>
            </button>
          </div>

          {/* TIER 2: Calculator — Detailed BOQ (₹499) — FEATURED */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-[#1B3D34] shadow-md flex flex-col justify-between space-y-6 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#1B3D34] text-white text-[10px] font-bold px-3.5 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F28C28]" />
              <span>Most Popular</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3E8E2] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1B3D34]">
                  Calculator — Detailed BOQ
                </span>
                <span className="text-sm font-bold text-[#1B3D34] font-mono">
                  ₹499
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#1B3D34] font-heading">
                  Detailed BOQ Report
                </h3>
                <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                  Get a detailed report showing the work, materials, and estimated costs for your house.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-[#1B3D34] pt-3 border-t border-[#E3E8E2]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#F28C28] shrink-0 mt-0.5" />
                  <span><strong>Full Works Schedule:</strong> Itemized construction works BOQ.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#F28C28] shrink-0 mt-0.5" />
                  <span><strong>Materials Needed:</strong> Exact steel tonnes, cement bags &amp; blocks.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#F28C28] shrink-0 mt-0.5" />
                  <span><strong>Payment Plan:</strong> Milestone schedule tied to construction stages.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#F28C28] shrink-0 mt-0.5" />
                  <span><strong>PDF Download:</strong> A detailed report you can discuss with your bank or contractor.</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/pricing')}
                className="w-full hutty-btn-primary py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Unlock Detailed BOQ (₹499)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
              </button>
              <div className="flex items-center justify-between text-[11px] text-[#4B5563]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#1B3D34]" /> 100% Secure Checkout
                </span>
                <span>Lifetime PDF Access</span>
              </div>
            </div>
          </div>

          {/* TIER 3: Calculator — Premium (₹1,499) */}
          <div className="p-7 bg-[#F8F8F6] rounded-3xl border border-[#E3E8E2] hover:border-[#1B3D34] transition-all text-left flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3E8E2] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                  Calculator — Premium
                </span>
                <span className="text-sm font-bold text-[#1B3D34] font-mono">
                  ₹1,499
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#1B3D34] font-heading">
                  Calculator Premium
                </h3>
                <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                  An upgraded calculator package with clearly explained additional benefits for in-depth planning.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-[#4B5563] pt-3 border-t border-[#E3E8E2]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Everything in Detailed BOQ (₹499)</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Brand Comparison:</strong> Compare Tata Tiscon vs JSW Steel, UltraTech vs ACC.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Specification Customization:</strong> Tailor fixtures &amp; material grades.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>5 Saved Project Scenarios:</strong> Compare multiple floor and finish variations.</span>
                </div>
              </div>

              {/* Explicit separation notice */}
              <div className="p-2.5 bg-white rounded-xl border border-[#E3E8E2] text-[11px] text-[#4B5563]">
                <span className="font-semibold text-[#1B3D34]">Note:</span> Expert consultation is a separate professional service.
              </div>
            </div>

            <button
              onClick={() => navigate('/pricing')}
              className="w-full hutty-btn-secondary text-xs font-bold py-3 rounded-xl cursor-pointer hover:border-[#1B3D34]"
            >
              <span>Upgrade to Premium (₹1,499)</span>
            </button>
          </div>

        </div>

        {/* SEPARATE PROFESSIONAL SERVICE CALLOUT: Consult an Expert — ₹1,499 */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[rgba(27,61,52,0.04)] border border-[#1B3D34]/15 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white border border-[#1B3D34]/10 text-xs font-bold text-[#1B3D34]">
              <Compass className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>Independent Professional Guidance &bull; ₹1,499</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1B3D34] font-heading">
              Need personal advice from an architect or engineer?
            </h3>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
              Consult an Expert is a separate 45-minute service. Speak directly with a verified professional to check your contractor's quote, inspect your drawings, or resolve site problems.
            </p>
          </div>

          <button
            onClick={() => navigate('/consult')}
            className="hutty-btn-primary px-6 py-3.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <span>Consult an Expert — ₹1,499</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
          </button>
        </div>

      </div>
    </section>
  );
};
