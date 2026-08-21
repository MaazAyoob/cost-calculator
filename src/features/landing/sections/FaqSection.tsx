import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Hutty estimate residential construction costs?',
      a: 'The engine applies deterministic civil engineering formulas anchored to Indian Standards (IS 456, IS 1786) and Bangalore Schedule of Rates. It calculates required volumes of concrete, steel rebar tonnage, AAC masonry, flooring, plumbing, electrical, and paint directly from room and floor dimensions.',
    },
    {
      q: 'Can I compare specific material brands like UltraTech vs ACC or Tata Tiscon vs JSW?',
      a: 'Yes. In the planning calculator, you can switch between brand tiers and finishes. The physical required quantity (e.g. 9.6 tonnes of steel) remains engineering-invariant while your itemized rates update dynamically.',
    },
    {
      q: 'Are the generated BOQ reports accepted for bank home loans?',
      a: 'Yes. Hutty generates 13-stage itemized Bills of Quantities and a 6-stage milestone disbursement roadmap structured according to standard Indian bank appraisal formats (SBI, HDFC, ICICI, Axis).',
    },
    {
      q: 'What plot sizes and storeys are supported?',
      a: 'All standard South Indian urban plot sizes (30×40, 30×50, 40×60, 50×80, and custom dimensions) and residential heights from Ground floor up to G+4 storeys with ground or stilt parking.',
    },
    {
      q: 'Is there any fee to plan and download estimates?',
      a: 'No. The planning calculator, 3D architectural viewer, interactive summary, and BOQ previews are completely free for homeowners.',
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-24 bg-white border-b border-[#E5E7EB] select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="space-y-3 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-3 py-1.5 rounded-md inline-block">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.12]">
            Everything you need to know.
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
            Common questions regarding calculation assumptions, material grades, and bank-loan BOQ reports.
          </p>
        </div>

        {/* Minimal Accordion with Thin Dividers and Plus/Minus Icons */}
        <div className="divide-y divide-[#E5E7EB] border-y border-[#E5E7EB] text-left">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-6 sm:py-7">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-6 cursor-pointer group"
                >
                  <span className="text-base sm:text-lg font-bold text-[#1B3D34] group-hover:text-[#132C25] transition-colors leading-snug font-heading">
                    {faq.q}
                  </span>
                  <div className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#1B3D34] shrink-0 group-hover:border-[#1B3D34] transition-colors">
                    {isOpen ? <Minus className="w-4 h-4 text-[#F28C28]" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <p className="mt-4 text-xs sm:text-sm text-[#4B5563] leading-relaxed font-normal pr-10">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
