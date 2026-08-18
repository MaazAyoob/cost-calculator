import React from 'react';

export const EngineeringStandardsSection: React.FC = () => {
  const specs = [
    {
      standard: 'IS 456 : 2000',
      title: 'Code of Practice for Plain and Reinforced Concrete',
      assumption: 'M20/M25 concrete mix ratio (1:1.5:3) with 0.45 water-cement ratio; 25mm–40mm structural clear cover for beams and columns.',
      application: 'Computes dry cement volume, coarse/fine aggregate consumption, and structural slab thickness per floor.',
    },
    {
      standard: 'IS 1786 : 2008',
      title: 'High Strength Deformed Steel Bars for Concrete Reinforcement',
      assumption: 'Fe 500D / Fe 550D grade high ductility rebar with 1.85%–2.80% structural density multiplier across building heights.',
      application: 'Derives total rebar tonnage, column ties, beam stirrups, and slab reinforcement distribution from floor geometry.',
    },
    {
      standard: 'IS 2185 : 2008',
      title: 'Concrete Masonry Units & AAC Autoclaved Aerated Blocks',
      assumption: '600×200×150mm precision autoclaved aerated concrete blocks with 3mm polymer thin-bed adhesive jointing mortar.',
      application: 'Calculates block count, dead load reduction, and interior/exterior wall surface area for plastering and paint.',
    },
    {
      standard: 'National Building Code (NBC)',
      title: 'Setback Regulations & Statutory Floor Space Index (FSI)',
      assumption: 'Standard statutory coverage benchmark of ~60% ground footprint with mandatory front, rear, and side ventilation margins.',
      application: 'Determines permissible built-up area per floor, super BUA circulation, and remaining open ground space.',
    },
    {
      standard: 'Karnataka Market Index',
      title: 'Schedule of Rates (SoR) for Bangalore & Mysore Urban Zones',
      assumption: 'Indexed vendor rates for structural steel, OPC/PPC cement, River Sand, RMC, sanitaryware, and electrical wiring.',
      application: 'Maps localized labor and material rates against physical takeoffs to produce indicative cost projections.',
    },
  ];

  return (
    <section id="standards" className="py-20 lg:py-28 bg-[#F7F7F5] border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Heading */}
        <div className="max-w-3xl space-y-4 text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md inline-block">
            Engineering Benchmarks
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172033] tracking-tight leading-[1.15]">
            Built around transparent engineering assumptions.
          </h2>
          <p className="text-base text-[#667085] leading-relaxed">
            Every material multiplier and cost calculation in our engine is anchored to recognized civil engineering codes, structural standards, and regional market indices.
          </p>
        </div>

        {/* Technical Specification Sheet Layout */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#F2F2EF] border-b border-[#E5E7EB] text-[11px] font-bold uppercase tracking-wider text-[#172033]">
            <div className="col-span-3">Civil Standard &amp; Code</div>
            <div className="col-span-4">Engineering Assumption</div>
            <div className="col-span-5">Calculation Engine Application</div>
          </div>

          {/* Data Rows */}
          <div className="divide-y divide-[#E5E7EB] text-left">
            {specs.map((item, idx) => (
              <div key={idx} className="p-6 md:px-6 md:py-5 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs items-start">
                <div className="md:col-span-3 space-y-1">
                  <span className="font-bold text-[#1F4B43] text-sm block">
                    {item.standard}
                  </span>
                  <span className="text-[11px] text-[#667085] block leading-snug">
                    {item.title}
                  </span>
                </div>
                <div className="md:col-span-4 text-[#172033] leading-relaxed">
                  <span className="md:hidden font-bold text-[10px] text-[#667085] uppercase tracking-wider block mb-0.5">Assumption:</span>
                  {item.assumption}
                </div>
                <div className="md:col-span-5 text-[#667085] leading-relaxed">
                  <span className="md:hidden font-bold text-[10px] text-[#667085] uppercase tracking-wider block mb-0.5">Application:</span>
                  {item.application}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-[#667085] text-left">
          <p>
            * Note: The Cost Calculator generates formula-driven indicative pre-construction estimates. Final site structural execution requires geotechnical soil analysis and structural engineer sign-off.
          </p>
        </div>

      </div>
    </section>
  );
};
