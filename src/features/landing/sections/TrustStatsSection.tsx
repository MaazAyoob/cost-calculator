import React from 'react';

export const TrustStatsSection: React.FC = () => {
  const pillars = [
    {
      title: 'FORMULA-DRIVEN',
      subtitle: 'Deterministic Structural Ratios',
      desc: 'Steel tonnage & cement derived from geometry.',
    },
    {
      title: 'QUANTITY-BASED',
      subtitle: 'Physical Units Counted',
      desc: 'Rooms and floor dimensions dictate real quantities.',
    },
    {
      title: 'MATERIAL-SPECIFIC',
      subtitle: 'Market Brand Rates',
      desc: 'Change brands without changing underlying physics.',
    },
    {
      title: 'BOQ READY',
      subtitle: '13-Stage Schedule of Rates',
      desc: 'Itemized line-item breakdown for banks & contractors.',
    },
  ];

  return (
    <section className="bg-white py-14 lg:py-16 border-b border-[#E5E7EB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Strong Trust Statement */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1F4B43]">
            Engineered Pre-Construction Methodology
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            From plot dimensions to a structured construction estimate.
          </h2>
        </div>

        {/* 4 Pillars with Typography and Thin Vertical Dividers - No Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-[#E5E7EB]">
          {pillars.map((item, index) => (
            <div
              key={index}
              className={`space-y-1.5 text-left ${
                index === 0 ? 'lg:pr-8' : index === 3 ? 'lg:pl-8' : 'lg:px-8'
              }`}
            >
              <span className="text-[11px] font-black tracking-widest text-[#1F4B43] uppercase block">
                {item.title}
              </span>
              <h3 className="text-sm font-bold text-[#172033] tracking-tight">
                {item.subtitle}
              </h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
