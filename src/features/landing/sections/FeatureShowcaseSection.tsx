import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const FeatureShowcaseSection: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      num: '01',
      title: 'LIVE ESTIMATE',
      quote: 'Know how your choices affect the number.',
      description: 'Adjust room counts, add a floor, or shift your footprint. Our single source-of-truth engine recalculates structural requirements, built-up area, and cost per square foot dynamically in real time.',
      bullets: [
        'Instant response to every dimension and floor adjustment',
        'Automatic calculation of super built-up area and ground footprint',
        'Transparent breakdown across civil, finishes, and MEP trades',
      ],
      visual: (
        <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-4 text-left shadow-xs">
          <div className="flex justify-between items-center text-xs pb-3 border-b border-[#E5E7EB]">
            <span className="font-bold text-[#1B3D34] font-heading">Live Takeoff Preview</span>
            <span className="text-[#1B3D34] font-bold text-[10px] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded font-mono">
              ● REAL-TIME SYNC
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Estimated Project Total</span>
            <div className="text-3xl font-black text-[#1B3D34] font-heading">₹68,40,000</div>
            <div className="text-xs text-[#4B5563]">2,400 sq.ft total BUA @ ₹2,850/sq.ft</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <span className="text-[#4B5563] text-[10px] block font-semibold">TMT Steel</span>
              <span className="font-bold text-[#1B3D34] font-heading">9.6 Tonnes</span>
            </div>
            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <span className="text-[#4B5563] text-[10px] block font-semibold">Cement</span>
              <span className="font-bold text-[#1B3D34] font-heading">1,056 Bags</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '02',
      title: 'QUANTITY-BASED BOQ',
      quote: 'Your spaces drive the quantities.',
      description: 'We do not use rough square-foot rules of thumb. Every line item in your 13-stage Bill of Quantities is mathematically derived from physical geometry, slab spans, and room perimeters.',
      bullets: [
        'Concrete volume, rebar tonnage, and masonry area takeoff',
        '13 civil and architectural trade schedules',
        'Verifiable against contractor quotation line items',
      ],
      visual: (
        <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-2.5 text-left text-xs shadow-xs">
          <div className="font-bold text-[#1B3D34] pb-2 border-b border-[#E5E7EB] flex justify-between font-heading">
            <span>13-Stage Schedule of Rates</span>
            <span className="text-[#4B5563] font-mono text-[10px]">IS 456 COMPLIANT</span>
          </div>
          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex justify-between items-center">
            <span className="font-medium text-[#1B3D34]">01. Earthwork & Foundation Concrete</span>
            <span className="font-bold text-[#1B3D34] font-mono">₹3,42,000</span>
          </div>
          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex justify-between items-center">
            <span className="font-medium text-[#1B3D34]">02. Plinth Beams & Substructure</span>
            <span className="font-bold text-[#1B3D34] font-mono">₹8,89,200</span>
          </div>
          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex justify-between items-center">
            <span className="font-medium text-[#1B3D34]">03. Superstructure Columns & Slabs</span>
            <span className="font-bold text-[#1B3D34] font-mono">₹12,31,200</span>
          </div>
        </div>
      ),
    },
    {
      num: '03',
      title: 'MATERIAL SPECIFICATIONS',
      quote: 'Compare materials without changing physical quantities.',
      description: 'Switch between Tata Tiscon, JSW Neosteel, UltraTech, ACC, Italian Marble, or Vitrified Tiles. The required physical material volume remains structurally invariant while unit rates adjust transparently.',
      bullets: [
        'Brand-specific unit rate variance tracking',
        'Physical volume remains fixed by structural engineering formulas',
        'Side-by-side Essential, Premium, and Luxury package comparisons',
      ],
      visual: (
        <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-3 text-left text-xs shadow-xs">
          <div className="font-bold text-[#1B3D34] pb-2 border-b border-[#E5E7EB] flex justify-between font-heading">
            <span>Material Brand Matrix</span>
            <span className="text-[#1B3D34] font-mono text-[10px] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded">
              INVARIANT GEOMETRY
            </span>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex justify-between items-center">
              <div>
                <span className="font-bold text-[#1B3D34] block">Primary Rebar</span>
                <span className="text-[10px] text-[#4B5563]">Tata Tiscon Fe550D TMT</span>
              </div>
              <span className="text-[#1B3D34] font-bold font-mono">₹74/kg</span>
            </div>
            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex justify-between items-center">
              <div>
                <span className="font-bold text-[#1B3D34] block">Structural Cement</span>
                <span className="text-[10px] text-[#4B5563]">UltraTech Super Cement</span>
              </div>
              <span className="text-[#1B3D34] font-bold font-mono">₹410/bag</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '04',
      title: 'PROJECT REPORT',
      quote: 'Turn your configuration into a structured construction report.',
      description: 'Generate an executive pre-construction dossier complete with BOQ line items, cashflow schedule, milestone payment roadmaps, and full engineering trace calculations ready for your bank and architect.',
      bullets: [
        'Bank-ready milestone disbursement schedule',
        'Comprehensive 13-stage BOQ with verified rates',
        'PDF export and contractor-ready tender package',
      ],
      visual: (
        <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-3 text-left text-xs shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <span className="font-bold text-[#1B3D34] font-heading">Hutty Construction Dossier</span>
            <span className="text-[#1B3D34] text-[10px] font-mono font-bold bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded">
              BANK READY
            </span>
          </div>
          <div className="space-y-2 text-[#4B5563]">
            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <span className="font-bold text-[#1B3D34] block">Milestone Payment Schedule</span>
              <span className="text-[11px] text-[#4B5563]">6-stage disbursement roadmap mapped to site milestones</span>
            </div>
            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <span className="font-bold text-[#1B3D34] block">Full Calculation Trace</span>
              <span className="text-[11px] text-[#4B5563]">Formulaic audit trail for steel, concrete, and finishes</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-[#E5E7EB] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-3 py-1.5 rounded-md inline-block">
            ARCHITECTURAL PLATFORM CAPABILITIES
          </span>
          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.12]">
            Engineering depth, <br />
            delivered with clarity.
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
            Four core capabilities designed to make home construction transparent and predictable.
          </p>
        </div>

        {/* 4 Large Alternating Editorial Sections */}
        <div className="space-y-20 lg:space-y-28">
          {features.map((feature, idx) => {
            const isReversed = idx % 2 === 1;
            return (
              <div
                key={feature.num}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
                  isReversed ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Text Content (col-span-6) */}
                <div className={`lg:col-span-6 space-y-5 text-left ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-[#1B3D34]">
                      {feature.num}
                    </span>
                    <span className="h-px w-8 bg-[#E5E7EB]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#1B3D34]">
                      {feature.title}
                    </span>
                  </div>

                  <h3 className="heading-sm text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.2]">
                    "{feature.quote}"
                  </h3>

                  <p className="text-sm text-[#4B5563] leading-relaxed font-normal">
                    {feature.description}
                  </p>

                  <ul className="space-y-2.5 pt-2">
                    {feature.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-center gap-2.5 text-xs text-[#1B3D34]">
                        <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                        <span className="text-[#4B5563]">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Area (col-span-6) */}
                <div className={`lg:col-span-6 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                  {feature.visual}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
