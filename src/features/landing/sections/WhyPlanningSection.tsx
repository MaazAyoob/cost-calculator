import React from 'react';
import { X, Check } from 'lucide-react';

export const WhyPlanningSection: React.FC = () => {
  return (
    <section id="why-planning" className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Why Planning Matters
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Why Build Without Planning is a Risk You Shouldn't Take.
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            In India, 78% of home construction projects suffer from 20% to 45% budget overruns due to inaccurate initial estimates, hidden contractor markups, and uncalculated material waste.
          </p>
        </div>

        {/* 2-Column Comparison Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left: Building Without Planning */}
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Building Without Planning</h3>
              <p className="text-xs text-slate-500 mt-1">Relying on informal lump-sum estimates</p>
            </div>

            <ul className="space-y-4 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-slate-900 block">Budget Uncertainty</strong>
                  Initial quotes jump by 20-40% halfway through ground construction.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-slate-900 block">Material Waste & Substitution</strong>
                  Unspecified structural grades lead to unaccounted steel and cement waste.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-slate-900 block">Unexpected Scope Changes</strong>
                  No written line-item BOQ for room dimensions, structural slabs, or finishes.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-slate-900 block">Payment Surprises</strong>
                  Disbursing large upfront advances without tied construction milestones.
                </div>
              </li>
            </ul>
          </div>

          {/* Right: Building With Cost Calculator */}
          <div className="bg-blue-50/50 rounded-2xl p-8 border border-blue-200/80 space-y-6">
            <div className="pb-4 border-b border-blue-200">
              <h3 className="text-xl font-bold text-slate-900">Building with Cost Calculator</h3>
              <p className="text-xs text-blue-700 font-medium mt-1">IS 456 engineered calculation matrix</p>
            </div>

            <ul className="space-y-4 text-sm text-slate-800">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-slate-900 block">Clear & Accurate Estimate</strong>
                  Instant live cost calculations based on exact plot geometry and floor count.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-slate-900 block">Precise Material Planning</strong>
                  Calculates exact bags of cement, tonnes of TMT steel, and flooring units needed.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-slate-900 block">Itemized BOQ & Specifications</strong>
                  Complete breakdown across structural, finishing, electrical, and plumbing trades.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="font-semibold text-slate-900 block">Milestone Payment Roadmap</strong>
                  Structured 6-stage disbursement plan aligned with bank loan standards.
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};
