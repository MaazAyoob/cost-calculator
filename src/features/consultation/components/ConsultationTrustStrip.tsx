import React from 'react';
import { ShieldCheck, Tag, Laptop, Compass } from 'lucide-react';

export const ConsultationTrustStrip: React.FC = () => {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: 'Verified professionals',
      description: 'Profiles are reviewed before appearing on Hutty.',
    },
    {
      icon: Tag,
      title: 'Transparent pricing',
      description: 'See the fee before booking.',
    },
    {
      icon: Laptop,
      title: 'Convenient sessions',
      description: 'Get guidance from home or site through the actual supported consultation arrangement.',
    },
    {
      icon: Compass,
      title: 'Support at every stage',
      description: 'From planning to handover.',
    },
  ];

  return (
    <section className="bg-white border-b border-[#E3E8E2] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-start gap-3.5 text-left">
                <div className="w-10 h-10 rounded-xl bg-[rgba(27,61,52,0.06)] text-[#1B3D34] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-[#1B3D34]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#1B3D34] font-heading">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#687770] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
