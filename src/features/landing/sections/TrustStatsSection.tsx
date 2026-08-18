import React from 'react';

export const TrustStatsSection: React.FC = () => {
  const pillars = [
    {
      title: 'FORMULA-DRIVEN',
      subtitle: 'Deterministic Structural Ratios',
      description: 'Calculations derive steel tonnage, cement bags, and concrete volumes from physical floor geometry.',
    },
    {
      title: 'QUANTITY-BASED',
      subtitle: 'Every Physical Unit Counted',
      description: 'Room dimensions dictate internal doors, window areas, wall tiling, and electrical point quantities.',
    },
    {
      title: 'MATERIAL-SPECIFIC',
      subtitle: 'True Market Brand Rates',
      description: 'Switching between Tata Tiscon, UltraTech, or Italian Marble alters unit rates without altering physics.',
    },
    {
      title: 'DETAILED BOQ',
      subtitle: '13-Stage Audit Breakdown',
      description: 'Itemized Schedule of Rates with complete trade-wise cost lines and bank loan payment milestones.',
    },
  ];

  return (
    <section className="bg-white py-16 lg:py-20 border-b border-[#E5E7EB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Trust Strip Grid with Vertical Dividers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-[#E5E7EB]">
          {pillars.map((item, index) => (
            <div
              key={index}
              className={`space-y-2.5 ${index === 0 ? 'lg:pr-8' : index === 3 ? 'lg:pl-8' : 'lg:px-8'}`}
            >
              <span className="text-[11px] font-extrabold tracking-widest text-[#1F4B43] uppercase block">
                {item.title}
              </span>
              <h3 className="text-base font-bold text-[#172033] tracking-tight">
                {item.subtitle}
              </h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
