import React from 'react';
import { ArrowDown, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FLOW_NODES = [
  {
    step: '01',
    label: 'PLOT SIZE & SETBACKS',
    title: 'Plot Length & Width',
    detail: 'Site boundaries (e.g. 30\' × 50\', 1,500 sq.ft) and municipal setback guidelines for your location.',
    metric: '1,500 sq.ft Site',
  },
  {
    step: '02',
    label: 'FLOOR PLAN & AREA',
    title: 'Total Built-Up Area',
    detail: 'Ground and upper floor spaces, stairs, balconies, and utility corridors calculated clearly.',
    metric: '2,400 sq.ft Total Area',
  },
  {
    step: '03',
    label: 'ROOM LAYOUT',
    title: 'Rooms & Bathrooms',
    detail: 'Bedrooms, living spaces, kitchens, and attached bathrooms generate wall lengths and surface areas.',
    metric: '4 BHK + 4 Baths',
  },
  {
    step: '04',
    label: 'STRUCTURAL FRAME',
    title: 'Steel Needed for the House',
    detail: 'Pillars, foundations, beams, and roof slabs dictate the steel rebar needed for your home.',
    metric: '8.64 Tonnes Steel',
  },
  {
    step: '05',
    label: 'MATERIALS NEEDED',
    title: 'Core Construction Materials',
    detail: 'Bags of cement, sand, aggregate, concrete blocks, and floor tiles.',
    metric: '1,080 Bags Cement',
  },
  {
    step: '06',
    label: 'LABOUR & WORK COSTS',
    title: 'Construction & Trade Work',
    detail: 'Bar bending, formwork, masonry, plastering, electrical wiring, and plumbing installation.',
    metric: 'Standardized Rates',
  },
  {
    step: '07',
    label: 'DETAILED COST REPORT',
    title: 'Itemized Construction Cost Report',
    detail: 'A clear stage-by-stage cost schedule you can review with your contractor or bank.',
    metric: '₹44.82 L Total Cost',
  },
];

export const VisualStorytellingSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-[#E5E7EB] relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Editorial Section Statement */}
        <div className="max-w-3xl space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/10 text-xs font-semibold text-[#1B3D34]">
            <span className="text-[#F28C28] font-bold">How It Works</span>
            <span>&bull;</span>
            <span>From Plot to Complete Plan</span>
          </div>

          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B3D34] tracking-tight">
            Your home is more than a square-foot number.
          </h2>

          <p className="body-lg text-[#4B5563] leading-relaxed">
            Hutty breaks construction down into practical steps. Here is how your building flows from raw plot boundaries into a detailed, understandable cost report.
          </p>
        </div>

        {/* Visual Architectural Sequence System */}
        <div className="relative">
          
          {/* Subtle Vertical Axis Line (Desktop) */}
          <div className="hidden lg:block absolute left-8 top-6 bottom-6 w-0.5 bg-[#E5E7EB]" />

          <div className="space-y-6 lg:space-y-4">
            {FLOW_NODES.map((node, idx) => (
              <div
                key={node.step}
                className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB] hover:border-[#1B3D34] transition-all lg:ml-16"
              >
                {/* Desktop Anchor Node on the Axis Line */}
                <div className="hidden lg:flex absolute -left-16 w-8 h-8 rounded-full bg-[#1B3D34] text-white text-xs font-bold items-center justify-center -translate-x-1/2 border-4 border-white shadow-xs">
                  {idx + 1}
                </div>

                {/* Left: Step label, title, and detail */}
                <div className="space-y-1 max-w-2xl text-left">
                  <div className="flex items-center gap-2">
                    <span className="lg:hidden text-xs font-bold text-[#F28C28]">
                      Stage {idx + 1} &bull;
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                      {node.label}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1B3D34] font-heading">
                    {node.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                    {node.detail}
                  </p>
                </div>

                {/* Right: Calculated Metric Tag */}
                <div className="shrink-0 flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E5E7EB]">
                  <span className="text-xs sm:text-sm font-semibold text-[#1B3D34] bg-white px-3 py-1.5 rounded-xl border border-[#E5E7EB] shadow-2xs">
                    {node.metric}
                  </span>
                  {idx < FLOW_NODES.length - 1 ? (
                    <ArrowDown className="w-4 h-4 text-[#F28C28] hidden lg:block" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#1B3D34] hidden lg:block" />
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
