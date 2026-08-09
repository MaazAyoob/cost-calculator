import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const EngineeringStandardsSection: React.FC = () => {
  const standards = [
    {
      code: 'IS 456',
      title: 'Plain and Reinforced Concrete Code',
      description: 'Calculates concrete mix ratios, structural cover, and load distribution for columns, beams, and slabs.',
    },
    {
      code: 'IS 1786',
      title: 'High Strength TMT Steel Standards',
      description: 'Governs Fe 550D TMT rebar tonnage and rebar lap lengths for seismic structural integrity.',
    },
    {
      code: 'IS 2185',
      title: 'Concrete & AAC Block Masonry',
      description: 'Standardizes block consumption rates and mortar binder ratios across all floor levels.',
    },
  ];

  return (
    <section id="standards" className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Heading */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Trust & Compliance
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Engineered for Indian Construction.
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Cost Calculator eliminates arbitrary guesswork by basing all material calculations strictly on Indian Bureau of Standards codes.
          </p>
        </div>

        {/* Editorial Typography Standards List */}
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {standards.map((std) => (
            <div key={std.code} className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
              <div className="md:col-span-3 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  {std.code}
                </span>
              </div>
              <div className="md:col-span-4">
                <h3 className="text-base font-semibold text-slate-900">
                  {std.title}
                </h3>
              </div>
              <div className="md:col-span-5">
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {std.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
