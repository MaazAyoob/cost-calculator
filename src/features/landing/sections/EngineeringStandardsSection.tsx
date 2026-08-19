import React from 'react';
import { ArrowRight } from 'lucide-react';

export const EngineeringStandardsSection: React.FC = () => {
  const pipelineSteps = ['PLOT', 'BUA', 'QUANTITY', 'RATE', 'BOQ', 'TOTAL'];

  const references = [
    {
      code: 'IS 456',
      title: 'Code of Practice for Plain and Reinforced Concrete',
      assumption: 'M20/M25 concrete mix design, structural cover standards & dry cement ratios.',
    },
    {
      code: 'IS 1786',
      title: 'High Strength Deformed Steel Bars for Concrete Reinforcement',
      assumption: 'Fe 500D / Fe 550D rebar density multiplier (4.0 to 5.0 kg / sq.ft BUA).',
    },
    {
      code: 'NBC',
      title: 'National Building Code of India Guidelines',
      assumption: 'Permissible FSI, ground coverage limits, room ventilation & clear ceiling heights.',
    },
    {
      code: 'PLANNING ASSUMPTIONS',
      title: 'Defined Civil Engineering Multipliers',
      assumption: 'Concrete volumes, mortar ratios, wall surface takeoff & floor efficiency formulas.',
    },
    {
      code: 'MARKET RATES',
      title: 'Bangalore & Mysore Regional Indices',
      assumption: 'Indexed material and trade labor rates from active regional construction tenders.',
    },
  ];

  return (
    <section id="standards" className="py-20 lg:py-28 bg-[#1F4B43] text-white relative overflow-hidden">
      {/* Subtle blueprint grid watermark on dark green */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #FFFFFF 1px, transparent 1px),
            linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#B8894A] bg-white/10 px-3 py-1.5 rounded-md inline-block">
            Engineering References &amp; Assumptions
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Built on transparent assumptions.
          </h2>
          <p className="text-base text-slate-200/90 leading-relaxed font-normal">
            Formula-driven calculations anchored to recognized Indian civil engineering codes and defined mathematical relationships.
          </p>
        </div>

        {/* Simplified Calculation Pipeline (PLOT -> BUA -> QUANTITY -> RATE -> BOQ -> TOTAL) */}
        <div className="bg-white/5 border border-white/15 rounded-2xl p-6 sm:p-8 backdrop-blur-xs text-left space-y-4">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#B8894A] block">
            Calculation Derivation Pipeline
          </span>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {pipelineSteps.map((step, idx) => (
              <React.Fragment key={step}>
                <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs sm:text-sm font-black font-mono tracking-wider text-white">
                  {step}
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <span className="text-white/40 font-bold text-sm">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Engineering References List with Thin Dividers */}
        <div className="divide-y divide-white/10 border-y border-white/15 text-left">
          {references.map((item) => (
            <div key={item.code} className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-3">
                <span className="text-sm font-mono font-black text-[#B8894A] tracking-wider block">
                  {item.code}
                </span>
              </div>
              <div className="md:col-span-4">
                <h3 className="text-sm font-bold text-white">
                  {item.title}
                </h3>
              </div>
              <div className="md:col-span-5">
                <p className="text-xs text-slate-300/90 leading-relaxed">
                  {item.assumption}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-300/70 text-left pt-2">
          <p>
            * Note: Formula-driven calculations provide pre-construction planning clarity. Site-specific structural engineering drawings and geotechnical soil testing are required prior to actual excavation.
          </p>
        </div>

      </div>
    </section>
  );
};
