import React from 'react';
import { ArrowDown, AlertCircle, CheckCircle2 } from 'lucide-react';

export const WhyPlanningSection: React.FC = () => {
  const timelineNodes = [
    {
      code: 'PLOT',
      label: 'Site Dimensions & Bylaws',
      desc: 'Setbacks, ground coverage & permissible floor count',
      badge: '01',
    },
    {
      code: 'DESIGN',
      label: 'Spatial Configuration',
      desc: 'Bedrooms, bathrooms, parking & structural footprint',
      badge: '02',
    },
    {
      code: 'MATERIAL',
      label: 'Specification Matrix',
      desc: 'Steel grade, cement type, joinery & tile finishes',
      badge: '03',
    },
    {
      code: 'QUANTITY',
      label: 'Engineering Takeoff',
      desc: 'Concrete volume, rebar tonnage & masonry units',
      badge: '04',
    },
    {
      code: 'COST',
      label: 'Itemized 13-Stage BOQ',
      desc: 'Verified market rates, cashflow & bank milestones',
      badge: '05',
    },
  ];

  return (
    <section id="why-planning" className="py-20 lg:py-28 bg-[#F7F7F5] border-b border-[#E5E7EB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT COLUMN: Large Statement & Editorial Explanation */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md inline-block">
              Pre-Construction Planning
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#172033] tracking-tight leading-[1.15]">
              Construction gets expensive when decisions are made too late.
            </h2>

            <p className="text-base text-[#667085] leading-relaxed font-normal">
              Most residential projects face 20% to 40% budget inflation because specifications, material grades, and physical quantities are negotiated informally after construction has already started.
            </p>

            <div className="pt-2 space-y-3">
              <div className="flex items-start gap-3 text-xs text-[#172033]">
                <div className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✕
                </div>
                <div>
                  <strong className="font-semibold block">Late Specification Changes</strong>
                  <span className="text-[#667085]">Switching materials on active sites leads to contractor variation claims and delays.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-[#172033]">
                <div className="w-5 h-5 rounded-full bg-[#EBF2F0] text-[#1F4B43] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <div>
                  <strong className="font-semibold block">Upfront Mathematical Takeoff</strong>
                  <span className="text-[#667085]">Fixing quantities and specification tiers before breaking ground locks your budget.</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Visual Construction Planning Timeline (PLOT -> DESIGN -> MATERIAL -> QUANTITY -> COST) */}
          <div className="lg:col-span-6 relative">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                  The Planning Derivation Pipeline
                </span>
                <span className="text-[11px] font-mono font-semibold text-[#1F4B43] bg-[#EBF2F0] px-2.5 py-0.5 rounded-full">
                  Deterministic
                </span>
              </div>

              <div className="space-y-4 relative">
                {timelineNodes.map((node, idx) => (
                  <div key={node.code} className="relative">
                    {/* Connecting line to next node */}
                    {idx < timelineNodes.length - 1 && (
                      <div className="absolute left-4 top-9 bottom-0 w-px bg-[#E5E7EB] z-0" />
                    )}

                    <div className="flex items-start gap-4 relative z-10">
                      {/* Node circle marker */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        idx === timelineNodes.length - 1
                          ? 'bg-[#1F4B43] text-white shadow-xs'
                          : 'bg-[#F7F7F5] border border-[#E5E7EB] text-[#1F4B43]'
                      }`}>
                        {node.badge}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-3 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black tracking-wider text-[#1F4B43]">
                            {node.code}
                          </span>
                          <span className="text-xs text-[#E5E7EB]">•</span>
                          <span className="text-xs font-bold text-[#172033]">
                            {node.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#667085] mt-0.5">
                          {node.desc}
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
