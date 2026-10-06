import React from 'react';
import { ArrowRight, CheckCircle2, FileText, Compass, HardHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TIMELINE_STAGES = [
  {
    step: '01',
    phase: 'PLAN',
    title: 'Site Parameters & Spatial Program',
    desc: 'Input plot length and width. Select house typology (Duplex, Rental Units, Villa) and configure room program.',
    deliverable: 'Preliminary Spatial Allocation',
  },
  {
    step: '02',
    phase: 'MEASURE',
    title: 'BUA & Setback Geometric Synthesis',
    desc: 'The calculation engine applies Bangalore BBMP bye-laws, setbacks, plinth beam levels, and carpet area ratios.',
    deliverable: 'Verified Gross Built-Up Area',
  },
  {
    step: '03',
    phase: 'ESTIMATE',
    title: 'Deterministic Quantity Takeoff',
    desc: 'IS-456 structural physics determine steel tonnage, cement bags, sand CFT, blockwork, and 13 trade heads.',
    deliverable: 'Bank-Ready 22-Section BOQ',
  },
  {
    step: '04',
    phase: 'REVIEW',
    title: 'Independent Professional Audit',
    desc: 'Book a 1-on-1 consultation with an independent Hutty-approved architect or structural engineer (flat ₹1,499).',
    deliverable: 'Drawing & Quote Audit Report',
  },
  {
    step: '05',
    phase: 'BUILD',
    title: 'Contractual Execution Certainty',
    desc: 'Attach the Hutty itemized BOQ to your contractor agreement. Pay strictly on completed milestone schedules.',
    deliverable: 'Zero Unbudgeted Extras',
  },
];

export const SignaturePlanningTimelineSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-[#E5E7EB] relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 arch-spec-pill text-[#1B3D34]">
            <span className="text-[#F28C28] font-bold">07 // THE HOMEOWNER ROADMAP</span>
            <span>&bull;</span>
            <span>FROM CONCEPT TO GROUNDBREAKING</span>
          </div>

          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B3D34] tracking-tight">
            Plan. Measure. Estimate. <br />
            Review. Build.
          </h2>

          <p className="body-lg text-[#4B5563] leading-relaxed">
            Construction is too expensive for guesswork. Follow Hutty's 5-phase structured roadmap to protect your family's investment.
          </p>
        </div>

        {/* 5-Step Timeline Cards in an Architectural Connected Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {TIMELINE_STAGES.map((stg, idx) => (
            <div
              key={stg.step}
              className="p-6 bg-[#F8F8F6] rounded-3xl border border-[#E5E7EB] hover:border-[#1B3D34] transition-all flex flex-col justify-between space-y-6 text-left tactile-card arch-bracketed"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="font-mono text-xs font-bold text-[#F28C28]">
                    {stg.step} //
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1B3D34] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                    {stg.phase}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#1B3D34] font-heading leading-snug">
                  {stg.title}
                </h3>

                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {stg.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#4B5563] block">
                  DELIVERABLE:
                </span>
                <span className="text-xs font-bold text-[#1B3D34] block font-heading">
                  {stg.deliverable}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2 text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => navigate('/calculator')}
            className="hutty-btn-primary px-8 py-3.5 rounded-xl font-bold text-sm shadow-xs cursor-pointer min-h-[48px]"
          >
            <span>Begin Phase 01: Free Plan</span>
            <ArrowRight className="w-4 h-4 text-[#F28C28]" />
          </button>
          <span className="text-xs font-mono text-[#4B5563]">
            No credit card or builder contact required. Instant calculation.
          </span>
        </div>

      </div>
    </section>
  );
};
