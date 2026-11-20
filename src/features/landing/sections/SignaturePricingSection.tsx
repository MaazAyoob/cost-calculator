import React from 'react';
import { ArrowRight, Check, X, Sparkles, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWizardStore } from '../../../store/useWizardStore';

export const SignaturePricingSection: React.FC = () => {
  const navigate = useNavigate();
  const { startNewProject } = useWizardStore();

  const handleStartPlanning = () => {
    startNewProject();
    navigate('/calculator');
  };

  const handleCreateReport = () => {
    startNewProject();
    navigate('/calculator');
  };

  return (
    <section id="pricing" className="py-16 lg:py-24 bg-white border-b border-[#E5E7EB] relative select-none scroll-mt-16 text-[#18211E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
            <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
            <span className="font-bold">SIMPLE PRICING</span>
            <span>&bull;</span>
            <span>NO HIDDEN FEES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#18211E] tracking-tight font-heading leading-[1.14]">
            Simple, honest pricing.
          </h2>

          <p className="text-sm sm:text-base text-[#66716B] leading-relaxed font-normal">
            Configure your plot and preview your estimate online for free. Download your complete construction planning PDF for just ₹199.
          </p>
        </div>

        {/* 2-Option Pricing Matrix: Free vs Complete Report */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto items-stretch">
          
          {/* OPTION 1: FREE (₹0) */}
          <div className="p-7 sm:p-8 bg-[#F8F8F6] rounded-3xl border-2 border-[#E5E7EB] hover:border-[#183B32] transition-all duration-200 text-left flex flex-col justify-between space-y-6 shadow-2xs">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#66716B]">
                  FREE PREVIEW
                </span>
                <span className="text-xs font-bold text-[#183B32] bg-white px-2.5 py-1 rounded-lg border border-[#E5E7EB]">
                  Free Forever
                </span>
              </div>

              <div>
                <span className="text-4xl sm:text-5xl font-black text-[#183B32] font-heading tabular-nums block">
                  ₹0
                </span>
                <h3 className="text-lg font-bold text-[#183B32] font-heading mt-1">
                  Free Online Estimate
                </h3>
                <p className="text-xs text-[#66716B] mt-1 leading-relaxed">
                  Plan your plot, choose your rooms, and preview your estimated costs on screen for free.
                </p>
              </div>

              <div className="space-y-3 text-xs text-[#18211E] pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#183B32] shrink-0" />
                  <span>Plot dimensions &amp; room selection</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#183B32] shrink-0" />
                  <span>Instant estimated cost preview</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#183B32] shrink-0" />
                  <span>Built-up area &amp; open space check</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#66716B]">
                  <X className="w-4 h-4 text-stone-400 shrink-0" />
                  <span className="line-through text-stone-400">Downloadable construction PDF report</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartPlanning}
              className="w-full bg-white hover:bg-[#F8F8F6] text-[#183B32] border border-[#183B32]/40 text-xs sm:text-sm font-bold py-3.5 rounded-xl cursor-pointer min-h-[48px] transition-colors shadow-2xs"
            >
              <span>Start Free Estimate</span>
            </button>
          </div>

          {/* OPTION 2: COMPLETE REPORT (₹199 ONE-TIME) — FEATURED */}
          <div className="p-7 sm:p-8 bg-white rounded-3xl border-2 border-[#183B32] shadow-lg flex flex-col justify-between space-y-6 text-left relative overflow-hidden ring-2 ring-[#183B32]/10">
            <div className="absolute top-0 right-0 bg-[#C66B4E] text-white text-[10px] font-bold px-3.5 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-white" />
              <span>Complete Plan</span>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#183B32]">
                  COMPLETE REPORT
                </span>
                <span className="text-xs font-bold text-[#183B32] bg-[#E8EFE9] px-2.5 py-1 rounded-lg border border-[#B7CDBB]">
                  One-time payment
                </span>
              </div>

              <div>
                <span className="text-4xl sm:text-5xl font-black text-[#183B32] font-heading tabular-nums block">
                  ₹199
                </span>
                <h3 className="text-lg font-bold text-[#183B32] font-heading mt-1">
                  Complete Construction Report PDF
                </h3>
                <p className="text-xs text-[#66716B] mt-1 leading-relaxed">
                  Download the full planning PDF with materials needed, list of work, and payment stages.
                </p>
              </div>

              <div className="space-y-3 text-xs text-[#18211E] pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#C66B4E] shrink-0 mt-0.5" />
                  <span><strong>Downloadable PDF Report:</strong> Complete 10-page construction guide.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#C66B4E] shrink-0 mt-0.5" />
                  <span><strong>List of Work &amp; Costs (BOQ):</strong> All 22 building tasks itemized.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#C66B4E] shrink-0 mt-0.5" />
                  <span><strong>Materials Needed:</strong> Exact steel tonnes, cement bags, and blocks.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#C66B4E] shrink-0 mt-0.5" />
                  <span><strong>Plot &amp; Setback Rules:</strong> Open space required around your home.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#C66B4E] shrink-0 mt-0.5" />
                  <span><strong>Payment Plan:</strong> 7-stage milestone schedule to pay contractors safely.</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCreateReport}
                className="w-full bg-[#183B32] hover:bg-[#245747] text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span>Get Complete Report — ₹199</span>
                <ArrowRight className="w-4 h-4 text-[#C66B4E]" />
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#66716B]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#347A62]" />
                <span>Instant PDF download &bull; Lifetime account access</span>
              </div>
            </div>
          </div>

        </div>

        {/* Separate Consultation Notice */}
        <div className="max-w-2xl mx-auto text-center pt-2">
          <p className="text-xs text-[#66716B]">
            Need personal guidance from an architect or structural engineer?{' '}
            <button
              type="button"
              onClick={() => navigate('/consult')}
              className="text-[#183B32] font-bold underline hover:text-[#C66B4E] cursor-pointer"
            >
              Consult an Expert
            </button>{' '}
            is available as a separate, independent service.
          </p>
        </div>

      </div>
    </section>
  );
};