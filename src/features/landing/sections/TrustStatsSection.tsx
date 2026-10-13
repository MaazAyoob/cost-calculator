import React from 'react';

export const TrustStatsSection: React.FC = () => {
  const pillars = [
    {
      label: 'FORMULA-DRIVEN',
      title: 'Reliable Material Ratios',
      desc: 'Steel and concrete quantities calculated from your plot size and floor layout.',
    },
    {
      label: 'QUANTITY-BASED',
      title: 'Physical Units Counted',
      desc: 'Rooms, door openings, and built-up areas dictate physical units, not rough rule-of-thumb guesses.',
    },
    {
      label: 'MATERIAL-SPECIFIC',
      title: 'Real Market Brand Rates',
      desc: 'Compare material brands transparently without changing the core quantities needed.',
    },
    {
      label: 'REPORT-READY',
      title: 'Detailed Cost Schedule',
      desc: '13-stage itemized cost list ready to review with your contractor or bank.',
    },
  ];

  return (
    <section className="bg-white py-12 lg:py-16 border-b border-[#E5E7EB] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Editorial Credibility Strip Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E7EB] pb-6 text-left">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] block mb-1">
              ENGINEERED PRE-CONSTRUCTION METHODOLOGY
            </span>
            <h2 className="heading-sm text-xl sm:text-2xl font-extrabold text-[#1B3D34] tracking-tight">
              From plot dimensions to structured construction certainty.
            </h2>
          </div>
          <span className="text-xs text-[#4B5563] font-mono shrink-0">
            IS 456 &bull; IS 1786 &bull; NBC 2016
          </span>
        </div>

        {/* 4 Pillars with Typography and Thin Vertical Dividers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-[#E5E7EB]">
          {pillars.map((item, index) => (
            <div
              key={index}
              className={`space-y-1.5 text-left ${
                index === 0 ? 'lg:pr-8' : index === 3 ? 'lg:pl-8' : 'lg:px-8'
              }`}
            >
              <span className="text-[11px] font-extrabold tracking-widest text-[#1B3D34] uppercase block font-mono">
                {item.label}
              </span>
              <h3 className="text-sm font-bold text-[#1B3D34] tracking-tight">
                {item.title}
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
