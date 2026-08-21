import React from 'react';

export const EngineeringStandardsSection: React.FC = () => {
  const pipelineSteps = ['INPUT', 'ASSUMPTION', 'QUANTITY', 'RATE', 'BOQ', 'ESTIMATE'];

  const references = [
    {
      code: 'IS 456',
      title: 'Plain and Reinforced Concrete Code of Practice',
      assumption: 'M20/M25 concrete mix design, structural cover standards & dry cement consumption ratios.',
    },
    {
      code: 'IS 1786',
      title: 'High Strength Deformed Steel Bars for Concrete Reinforcement',
      assumption: 'Fe 500D / Fe 550D rebar structural multipliers (4.0 to 5.0 kg / sq.ft BUA).',
    },
    {
      code: 'NBC 2016',
      title: 'National Building Code of India Guidelines',
      assumption: 'Permissible FSI, ground coverage limits, room ventilation & clear ceiling heights.',
    },
    {
      code: 'ENGINEERING ASSUMPTIONS',
      title: 'Defined Civil Engineering Multipliers',
      assumption: 'Concrete volumes, mortar ratios, wall surface takeoff & floor efficiency formulas.',
    },
    {
      code: 'MARKET RATES',
      title: 'Bangalore Regional Trade Indices',
      assumption: 'Indexed material and trade labor rates from verified regional construction tenders.',
    },
  ];

  return (
    <section id="standards" className="py-20 lg:py-28 bg-[#1B3D34] text-white relative overflow-hidden select-none">
      {/* Blueprint Grid Watermark */}
      <div className="absolute inset-0 pointer-events-none arch-grid-dark opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#F28C28] bg-white/10 px-3 py-1.5 rounded-md inline-block">
            ENGINEERING REFERENCES &amp; ASSUMPTIONS
          </span>
          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
            Formula-driven construction estimation.
          </h2>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
            Calculations anchored directly to recognized Indian civil engineering codes and defined mathematical relationships.
          </p>
        </div>

        {/* Engineering Flow Diagram (INPUT → ASSUMPTION → QUANTITY → RATE → BOQ → ESTIMATE) */}
        <div className="bg-white/5 border border-white/15 rounded-2xl p-6 sm:p-8 backdrop-blur-xs text-left space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F28C28] block">
            TECHNICAL DERIVATION FLOW
          </span>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {pipelineSteps.map((step, idx) => (
              <React.Fragment key={step}>
                <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs sm:text-sm font-bold font-mono tracking-wider text-white">
                  {step}
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <span className="text-[#F28C28] font-bold text-sm">→</span>
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
                <span className="text-xs sm:text-sm font-mono font-bold text-[#F28C28] tracking-wider block">
                  {item.code}
                </span>
              </div>
              <div className="md:col-span-4">
                <h3 className="text-sm font-bold text-white font-heading">
                  {item.title}
                </h3>
              </div>
              <div className="md:col-span-5">
                <p className="text-xs text-white/70 leading-relaxed">
                  {item.assumption}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-white/50 text-left pt-2">
          <p>
            * Note: Formula-driven calculations provide pre-construction planning clarity. Site-specific structural engineering drawings and geotechnical soil testing are required prior to actual excavation.
          </p>
        </div>

      </div>
    </section>
  );
};
