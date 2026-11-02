import React from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';

export const WhyPlanningSection: React.FC = () => {
  const comparisonData = {
    without: {
      title: 'Without Hutty Planning',
      badge: 'TRADITIONAL GUESSWORK',
      points: [
        { title: 'Vague Lump-Sum Rates', desc: 'Contractors quote "₹2,200/sq.ft" without explaining what quality of materials they will actually buy.' },
        { title: 'Hidden Material Downgrades', desc: 'You don\'t know if they will use high-strength steel or lower-grade cement until work has already begun.' },
        { title: 'Disputes Over Quantities', desc: 'Disagreements about how many cement bags or steel bars were used on site lead to stressful arguments.' },
        { title: 'Surprise Extra Costs', desc: 'Costs spiral out of control because structural and finish details were never written down upfront.' },
      ],
    },
    with: {
      title: 'With Hutty Planning',
      badge: 'CLEAR & UNBIASED',
      points: [
        { title: 'Exact Material Quantities', desc: 'Know exactly how much steel, cement, sand, and wall blocks your home requires before buying anything.' },
        { title: 'Clear Brand Choices', desc: 'Select your preferred brands for steel, cement, electricals, and sanitaryware, locked into your report.' },
        { title: 'Step-by-Step Payment Schedule', desc: 'Pay your builder based on completed site milestones rather than advance lump sums.' },
        { title: 'Stay in Control of Your Budget', desc: 'See cost updates instantly if you add another floor or upgrade your tiles, keeping surprises at zero.' },
      ],
    },
  };

  return (
    <section id="why-planning" className="py-20 lg:py-24 bg-[#F8F8F6] border-b border-[#E5E7EB] select-none text-[#18211E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
            <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
            <span className="tracking-wide font-bold">THE HUTTY DIFFERENCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18211E] font-heading tracking-tight leading-[1.14]">
            Build with a clear plan <br />
            and budget.
          </h2>
          <p className="text-sm sm:text-base text-[#66716B] leading-relaxed font-normal">
            Compare traditional contractor estimates with Hutty's clear material calculations.
          </p>
        </div>

        {/* Before / After Interactive Split Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT: Conventional Home Building */}
          <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 sm:p-8 shadow-xs text-left space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 font-heading">
                  WITHOUT HUTTY
                </span>
                <span className="text-[9px] font-mono font-bold text-[#C66B4E] bg-[#FDF0EB] border border-[#E8C5B8] px-2 py-0.5 rounded">
                  TRADITIONAL GUESSWORK
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[#18211E] font-heading">
                {comparisonData.without.title}
              </h3>
              
              <div className="space-y-3 pt-2">
                {comparisonData.without.points.map((pt) => (
                  <div key={pt.title} className="flex items-start gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-[#C66B4E]/15 text-[#C66B4E] flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="font-bold text-[#18211E] block">{pt.title}</strong>
                      <span className="text-[#66716B] text-[11px] leading-relaxed">{pt.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-[#66716B] font-medium">
              Unclear verbal quotes often lead to unexpected 20–30% budget overruns.
            </div>
          </div>

          {/* RIGHT: With Hutty Planning Intelligence */}
          <div className="bg-white rounded-2xl border-2 border-[#183B32] p-6 sm:p-8 shadow-md text-left space-y-5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8EFE9]/50 rounded-bl-full pointer-events-none" />
            
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#183B32] font-heading flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C66B4E]" />
                  WITH HUTTY
                </span>
                <span className="text-[9px] font-mono font-bold text-[#183B32] bg-[#E8EFE9] border border-[#B7CDBB]/60 px-2.5 py-0.5 rounded-full">
                  CLEAR &amp; UNBIASED
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[#183B32] font-heading">
                {comparisonData.with.title}
              </h3>
              
              <div className="space-y-3 pt-2">
                {comparisonData.with.points.map((pt) => (
                  <div key={pt.title} className="flex items-start gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-[#E8EFE9] text-[#183B32] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="font-bold text-[#183B32] block">{pt.title}</strong>
                      <span className="text-[#66716B] text-[11px] leading-relaxed">{pt.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[#E8EFE9] border border-[#B7CDBB]/70 rounded-xl text-[11px] text-[#183B32] font-bold flex items-center justify-between">
              <span>Everything is written down clearly so you can hire contractors with peace of mind.</span>
              <ShieldCheck className="w-4 h-4 text-[#183B32] shrink-0" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
