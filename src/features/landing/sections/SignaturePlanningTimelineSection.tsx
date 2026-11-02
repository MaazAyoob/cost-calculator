import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TIMELINE_STAGES = [
  {
    step: '01',
    phase: 'PLAN',
    title: 'Explore Your Plot',
    desc: 'Enter your plot dimensions to calculate legal setbacks and maximum permissible built-up area.',
    deliverable: 'Plot & Setback Plan',
  },
  {
    step: '02',
    phase: 'DESIGN',
    title: 'Design Your Spaces',
    desc: 'Pick your floor count and room requirements with simple visual selectors.',
    deliverable: 'Room & Space Summary',
  },
  {
    step: '03',
    phase: 'MATERIALS',
    title: 'Choose Materials',
    desc: 'Select your preferred brands for steel, cement, flooring, bathroom fittings, and wall paints.',
    deliverable: 'Materials Takeoff',
  },
  {
    step: '04',
    phase: 'AUDIT',
    title: 'Audit Quotes',
    desc: 'Compare contractor quotes against actual material numbers and fair market rates.',
    deliverable: 'Detailed BOQ Report',
  },
  {
    step: '05',
    phase: 'BUILD',
    title: 'Build With Confidence',
    desc: 'Follow milestone payments tied to actual site progress rather than advance lump sums.',
    deliverable: 'Payment Schedule',
  },
];

export const SignaturePlanningTimelineSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-[#F8F8F6] border-b border-[#E5E7EB] relative select-none text-[#18211E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
            <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
            <span className="text-[#C66B4E] font-bold">Project Roadmap</span>
            <span>&bull;</span>
            <span>From Concept to Groundbreaking</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#18211E] font-heading tracking-tight leading-[1.14]">
            Plan. Measure. Estimate. <br />
            Review. Build.
          </h2>

          <p className="text-[#66716B] text-base sm:text-lg leading-relaxed">
            Construction is too expensive for guesswork. Follow Hutty's 5-phase structured roadmap to protect your family's investment.
          </p>
        </div>

        {/* 5-Step Timeline Cards in an Architectural Connected Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {TIMELINE_STAGES.map((stg, idx) => (
            <div
              key={stg.step}
              className="p-6 bg-white rounded-3xl border-2 border-[#E5E7EB] hover:border-[#183B32] transition-all flex flex-col justify-between space-y-6 text-left shadow-2xs hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                  <span className="text-xs font-bold text-[#C66B4E] font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C66B4E]" />
                    Step {idx + 1}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#183B32] bg-[#E8EFE9] px-2 py-0.5 rounded-md border border-[#B7CDBB]/50">
                    {stg.phase}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#18211E] font-heading leading-snug">
                  {stg.title}
                </h3>

                <p className="text-xs text-[#66716B] leading-relaxed">
                  {stg.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66716B] block">
                  Deliverable:
                </span>
                <span className="text-xs font-bold text-[#183B32] block font-heading">
                  {stg.deliverable}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2 text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/calculator')}
            className="bg-[#183B32] hover:bg-[#245747] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-xs cursor-pointer min-h-[48px] flex items-center justify-center gap-2"
          >
            <span>Start Free Plan</span>
            <ArrowRight className="w-4 h-4 text-[#C66B4E]" />
          </button>
          <span className="text-xs text-[#66716B]">
            No credit card or builder contact required. Instant calculation.
          </span>
        </div>

      </div>
    </section>
  );
};
