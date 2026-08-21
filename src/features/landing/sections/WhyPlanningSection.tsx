import React from 'react';
import { ArrowDown, Check } from 'lucide-react';

export const WhyPlanningSection: React.FC = () => {
  const flowSteps = [
    {
      code: 'PLOT',
      title: 'Site Dimensions & Bylaws',
      desc: 'Setback rules, permissible ground coverage & total buildable area.',
    },
    {
      code: 'SPACE',
      title: 'Spatial Planning',
      desc: 'Bedrooms, living zones, parking footprints, and floor heights.',
    },
    {
      code: 'MATERIALS',
      title: 'Specification Selection',
      desc: 'Steel grades, cement types, flooring varieties, and joinery.',
    },
    {
      code: 'QUANTITIES',
      title: 'Physical Engineering Takeoff',
      desc: 'Calculated steel weight, cement bags, concrete volume & tile areas.',
    },
    {
      code: 'COST',
      title: 'Itemized 13-Stage BOQ',
      desc: 'Real market rates, transparent totals, and bank-ready disbursement milestones.',
    },
  ];

  return (
    <section id="why-planning" className="py-20 lg:py-24 bg-[#F8F8F6] border-b border-[#E5E7EB] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Headline & Editorial Context */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-3 py-1.5 rounded-md inline-block">
              THE HUTTY PRINCIPLE
            </span>

            <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.12]">
              Construction becomes easier <br />
              when the numbers are clear.
            </h2>

            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
              Most home builds exceed their budgets because quantities and brand specifications are negotiated informally after the excavation begins.
            </p>

            <div className="pt-2 space-y-4">
              <div className="flex items-start gap-3 text-xs text-[#1B3D34]">
                <div className="w-5 h-5 rounded-md bg-[rgba(27,61,52,0.08)] text-[#1B3D34] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="font-bold block text-sm">Upfront Quantity Certainty</strong>
                  <span className="text-[#4B5563]">Lock down steel tonnage, cement bags, and surface areas before signing contractor agreements.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-[#1B3D34]">
                <div className="w-5 h-5 rounded-md bg-[rgba(27,61,52,0.08)] text-[#1B3D34] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="font-bold block text-sm">Material Independence</strong>
                  <span className="text-[#4B5563]">Compare Essential, Premium, and Luxury fittings without changing the underlying physical structure.</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Visual Calculation Flow with Architectural Linework */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] font-heading">
                  Calculation Flow
                </span>
                <span className="text-[10px] font-mono font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded">
                  MATHEMATICAL PIPELINE
                </span>
              </div>

              <div className="space-y-4 pt-4 relative text-left">
                {flowSteps.map((step, idx) => (
                  <div key={step.code} className="relative">
                    {/* Architectural connecting line */}
                    {idx < flowSteps.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-px bg-[#E5E7EB] z-0" />
                    )}

                    <div className="flex items-start gap-4 relative z-10">
                      {/* Step Code Marker */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-extrabold font-mono shrink-0 transition-colors ${
                        idx === flowSteps.length - 1
                          ? 'bg-[#1B3D34] text-white'
                          : 'bg-[#F8F8F6] border border-[#E5E7EB] text-[#1B3D34]'
                      }`}>
                        0{idx + 1}
                      </div>

                      {/* Details */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-extrabold tracking-wider text-[#1B3D34]">
                            {step.code}
                          </span>
                          <span className="text-xs text-[#E5E7EB]">•</span>
                          <span className="text-xs font-bold text-[#1B3D34]">
                            {step.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4B5563] mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
