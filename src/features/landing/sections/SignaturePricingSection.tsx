import React from 'react';
import { ArrowRight, Check, Sparkles, ShieldCheck, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWizardStore } from '../../../store/useWizardStore';

export const SignaturePricingSection: React.FC = () => {
  const navigate = useNavigate();
  const { startNewProject } = useWizardStore();

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-[#E5E7EB] relative select-none text-[#18211E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
            <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
            <span className="text-[#C66B4E] font-bold">Plans &amp; Pricing</span>
            <span>&bull;</span>
            <span>Clear Options for Every Stage</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#18211E] tracking-tight font-heading leading-[1.14]">
            Choose how much detail you need.
          </h2>

          <p className="text-sm sm:text-base text-[#66716B] leading-relaxed font-normal">
            Start free to see your plot and room layout, or choose a detailed cost report and brand comparisons when you are ready to build.
          </p>
        </div>

        {/* 3 Confirmed Calculator Tiers: Free / ₹499 / ₹1,499 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* TIER 1: Calculator — Free (₹0) */}
          <div className="p-7 bg-[#F8F8F6] rounded-3xl border-2 border-[#E5E7EB] hover:border-[#183B32] transition-all duration-200 text-left flex flex-col justify-between space-y-6 shadow-2xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#66716B]">
                  Calculator — Free
                </span>
                <span className="text-xs font-bold text-[#183B32] bg-white px-2.5 py-0.5 rounded-lg border border-[#E5E7EB]">
                  ₹0 Free
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#183B32] font-heading">
                  Free House Explorer
                </h3>
                <p className="text-xs text-[#66716B] mt-1 leading-relaxed">
                  Explore your plot and see an early building estimate with zero commitments.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-[#66716B] pt-3 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#183B32] shrink-0" />
                  <span>Interactive 3D house view and plot layout</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#183B32] shrink-0" />
                  <span>Total built-up area and legal setbacks</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#183B32] shrink-0" />
                  <span>Preliminary cost estimate across 3 quality levels</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#183B32] shrink-0" />
                  <span>Room layout &amp; floor configuration</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                startNewProject();
                navigate('/calculator');
              }}
              className="w-full bg-white hover:bg-[#F8F8F6] text-[#183B32] border border-[#183B32]/30 text-xs font-bold py-3 rounded-xl cursor-pointer min-h-[44px]"
            >
              <span>Start Free Estimate</span>
            </button>
          </div>

          {/* TIER 2: Calculator — Detailed BOQ (₹499) — FEATURED */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-[#183B32] shadow-lg flex flex-col justify-between space-y-6 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#C66B4E] text-white text-[10px] font-bold px-3.5 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-white" />
              <span>Most Popular</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#183B32]">
                  Calculator — Detailed BOQ
                </span>
                <span className="text-sm font-bold text-[#183B32] font-mono">
                  ₹499
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#183B32] font-heading">
                  Detailed BOQ Report
                </h3>
                <p className="text-xs text-[#66716B] mt-1 leading-relaxed">
                  See the materials and work needed for your home, with estimated costs.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-[#18211E] pt-3 border-t border-[#E5E7EB]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#C66B4E] shrink-0 mt-0.5" />
                  <span><strong>Complete Works Schedule:</strong> Itemized list of all 22 construction trades.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#C66B4E] shrink-0 mt-0.5" />
                  <span><strong>Materials Needed:</strong> Exact steel tonnes, cement bags &amp; blocks calculated.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#C66B4E] shrink-0 mt-0.5" />
                  <span><strong>Milestone Payment Schedule:</strong> Pay your builder in safe stages tied to actual site progress.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#C66B4E] shrink-0 mt-0.5" />
                  <span><strong>Instant PDF Download:</strong> Download and share with contractors or your family.</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="w-full bg-[#183B32] hover:bg-[#245747] text-white py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer min-h-[48px]"
              >
                <span>Unlock Detailed BOQ (₹499)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C66B4E]" />
              </button>
              <div className="flex items-center justify-between text-[11px] text-[#66716B]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#183B32]" /> 100% Secure Checkout
                </span>
                <span>Lifetime PDF Access</span>
              </div>
            </div>
          </div>

          {/* TIER 3: Calculator — Premium (₹1,499) */}
          <div className="p-7 bg-[#F8F8F6] rounded-3xl border-2 border-[#E5E7EB] hover:border-[#183B32] transition-all duration-200 text-left flex flex-col justify-between space-y-6 shadow-2xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#66716B]">
                  Calculator — Premium
                </span>
                <span className="text-sm font-bold text-[#183B32] font-mono">
                  ₹1,499
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#183B32] font-heading">
                  Calculator Premium
                </h3>
                <p className="text-xs text-[#66716B] mt-1 leading-relaxed">
                  Compare brand choices and save multiple floor variations.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-[#66716B] pt-3 border-t border-[#E5E7EB]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#183B32] shrink-0 mt-0.5" />
                  <span><strong>Everything in Detailed BOQ (₹499)</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#183B32] shrink-0 mt-0.5" />
                  <span><strong>Brand Comparisons:</strong> Compare Tata Tiscon vs JSW Steel, UltraTech vs ACC.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#183B32] shrink-0 mt-0.5" />
                  <span><strong>Custom Specifications:</strong> Adjust tile sizes, electrical brands, and door types.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#183B32] shrink-0 mt-0.5" />
                  <span><strong>5 Saved Variations:</strong> Compare different floor counts and layout options.</span>
                </div>
              </div>

              {/* Explicit separation notice */}
              <div className="p-2.5 bg-white rounded-xl border border-[#E5E7EB] text-[11px] text-[#66716B]">
                <span className="font-semibold text-[#183B32]">Note:</span> Expert consultation is a separate professional service.
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/pricing')}
              className="w-full bg-white hover:bg-[#F8F8F6] text-[#183B32] border border-[#183B32]/30 text-xs font-bold py-3 rounded-xl cursor-pointer min-h-[44px]"
            >
              <span>Upgrade to Premium (₹1,499)</span>
            </button>
          </div>

        </div>

        {/* SEPARATE PROFESSIONAL SERVICE CALLOUT: Consult an Expert — ₹1,499 */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#E8EFE9] border border-[#B7CDBB] flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-2xs">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white border border-[#B7CDBB]/70 text-xs font-bold text-[#183B32]">
              <Compass className="w-3.5 h-3.5 text-[#C66B4E]" />
              <span>Independent Expert Advice &bull; ₹1,499</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#183B32] font-heading">
              Need personal advice from an architect or engineer?
            </h3>
            <p className="text-xs sm:text-sm text-[#66716B] leading-relaxed">
              Consult an Expert is a separate private consultation service. Speak directly with an independent architect or structural engineer to check your contractor's quote, review your floor plan, or clarify municipal setback questions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/consult')}
            className="bg-[#183B32] hover:bg-[#245747] text-white px-6 py-3.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 shadow-sm cursor-pointer whitespace-nowrap min-h-[48px]"
          >
            <span>Book an Expert Review — ₹1,499</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C66B4E]" />
          </button>
        </div>

      </div>
    </section>
  );
};
