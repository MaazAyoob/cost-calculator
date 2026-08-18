import React from 'react';
import { X, Check } from 'lucide-react';

export const WhyPlanningSection: React.FC = () => {
  return (
    <section id="why-planning" className="py-20 lg:py-28 bg-[#F7F7F5] border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md inline-block">
            Pre-Construction Planning
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172033] tracking-tight leading-[1.15]">
            Know what you're building before you start building.
          </h2>
          <p className="text-base text-[#667085] leading-relaxed">
            Residential projects in India frequently experience 20% to 45% budget overruns due to informal lump-sum contractor quotes and lack of pre-construction specification planning.
          </p>
        </div>

        {/* 2-Column Clean Editorial Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left: Building Without Planning */}
          <div className="bg-white rounded-2xl p-7 sm:p-9 border border-[#E5E7EB] space-y-6 shadow-xs">
            <div className="pb-4 border-b border-[#E5E7EB]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B42318] bg-[#FEE4E2] px-2.5 py-1 rounded-md inline-block mb-2">
                Traditional Approach
              </span>
              <h3 className="text-xl font-bold text-[#172033]">Building Without Planning</h3>
              <p className="text-xs text-[#667085] mt-1">Relying on informal lump-sum estimates</p>
            </div>

            <ul className="space-y-4 text-sm text-[#172033]">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#FEE4E2] text-[#B42318] flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-[#172033] block">Unclear Material Quantities</strong>
                  <span className="text-xs text-[#667085]">No prior calculation of required steel tonnage or cement bags.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#FEE4E2] text-[#B42318] flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-[#172033] block">Unexpected Expenses</strong>
                  <span className="text-xs text-[#667085]">Cost inflation midway through construction with surprise extras.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#FEE4E2] text-[#B42318] flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-[#172033] block">Poor Budget Visibility</strong>
                  <span className="text-xs text-[#667085]">No written line-item BOQ across architectural, civil, and finishing trades.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#FEE4E2] text-[#B42318] flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-[#172033] block">Procurement Uncertainty</strong>
                  <span className="text-xs text-[#667085]">Disbursing lump-sum advances without structured construction milestones.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Right: With Cost Calculator */}
          <div className="bg-white rounded-2xl p-7 sm:p-9 border border-[#1F4B43]/30 space-y-6 shadow-xs relative">
            <div className="pb-4 border-b border-[#E5E7EB]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F4B43] bg-[#EBF2F0] px-2.5 py-1 rounded-md inline-block mb-2">
                Rightcon Method
              </span>
              <h3 className="text-xl font-bold text-[#172033]">With Cost Calculator</h3>
              <p className="text-xs text-[#1F4B43] font-medium mt-1">Formula-driven engineering methodology</p>
            </div>

            <ul className="space-y-4 text-sm text-[#172033]">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#EBF2F0] text-[#1F4B43] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-[#172033] block">Calculated Quantities</strong>
                  <span className="text-xs text-[#667085]">Precise steel, cement, sand, brickwork, and flooring units derived from plot geometry.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#EBF2F0] text-[#1F4B43] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-[#172033] block">Specification Choices</strong>
                  <span className="text-xs text-[#667085]">Compare brand tiers (Tata vs JSW, UltraTech vs ACC) with real-time rate impact.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#EBF2F0] text-[#1F4B43] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-[#172033] block">Transparent Estimate</strong>
                  <span className="text-xs text-[#667085]">Total cost, rate per sq.ft, and trade allocations clearly mapped before work begins.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#EBF2F0] text-[#1F4B43] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-[#172033] block">Structured 13-Stage BOQ</strong>
                  <span className="text-xs text-[#667085]">Bank-ready milestone payment plan aligned with structural construction stages.</span>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};
