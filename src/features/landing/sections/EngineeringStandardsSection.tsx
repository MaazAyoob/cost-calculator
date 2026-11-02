import React from 'react';

export const EngineeringStandardsSection: React.FC = () => {
  const pipelineSteps = ['YOUR CHOICES', 'ENGINEERING RULES', 'EXACT QUANTITIES', 'BANGALORE RATES', 'DETAILED ESTIMATE'];

  const references = [
    {
      code: 'IS 456:2000',
      title: 'Plain and Reinforced Concrete Code',
      assumption: 'Sets the cement, sand, and stone ratios for strong columns, beams, and slabs.',
    },
    {
      code: 'IS 1786:2008',
      title: 'High-Strength Steel Rebar Standards',
      assumption: 'Ensures steel reinforcement weights match seismic and structural safety guidelines.',
    },
    {
      code: 'NBC 2016',
      title: 'National Building Code of India',
      assumption: 'Governs room heights, light, ventilation, and safe staircase dimensions.',
    },
    {
      code: 'BBMP / BDA',
      title: 'Bangalore Building Regulations',
      assumption: 'Verifies legal front, rear, and side setback distances based on your plot size.',
    },
    {
      code: 'MARKET RATES',
      title: 'Bangalore Material & Labour Rates',
      assumption: 'Tracks current regional retail prices for cement bags, steel per kg, and skilled trade labour.',
    },
  ];

  return (
    <section id="standards" className="py-20 lg:py-28 bg-[#183B32] text-white relative overflow-hidden select-none border-b border-[#245747]">
      {/* Blueprint Grid Watermark */}
      <div className="absolute inset-0 pointer-events-none arch-grid-dark opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
            <span className="text-[#E5D5B4] font-bold">Engineering Integrity</span>
            <span>&bull;</span>
            <span>IS Codes &amp; Bangalore Rules</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading leading-[1.14]">
            Calculated using Indian civil engineering codes.
          </h2>
          <p className="text-sm sm:text-base text-[#B7CDBB] leading-relaxed font-normal">
            Every number in your Hutty estimate is calculated using official Indian Standards, not contractor guesswork.
          </p>
        </div>

        {/* Calculation Flow Diagram (YOUR CHOICES → ENGINEERING RULES → EXACT QUANTITIES → BANGALORE RATES → DETAILED ESTIMATE) */}
        <div className="bg-white/5 border border-white/15 rounded-2xl p-6 sm:p-8 backdrop-blur-xs text-left space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5D5B4] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C66B4E]" />
            Calculation Flow
          </span>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {pipelineSteps.map((step, idx) => (
              <React.Fragment key={step}>
                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs sm:text-sm font-semibold tracking-wide text-white">
                  {step}
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <span className="text-[#C66B4E] font-bold text-sm">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Engineering References Table */}
        <div className="divide-y divide-white/10 border-y border-white/15 text-left">
          {references.map((item) => (
            <div key={item.code} className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-3">
                <span className="text-sm font-mono font-bold text-[#C5A46D] block">
                  {item.code}
                </span>
              </div>
              <div className="md:col-span-4">
                <h3 className="text-sm font-bold text-white font-heading">
                  {item.title}
                </h3>
              </div>
              <div className="md:col-span-5">
                <p className="text-xs text-[#B7CDBB] leading-relaxed">
                  {item.assumption}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-[#B7CDBB]/70 text-left pt-2">
          <p>
            * Note: Hutty gives you clear planning quantities and market estimates. You will still need an architect's working drawings and a structural engineer's site inspection before casting your foundation.
          </p>
        </div>

      </div>
    </section>
  );
};
