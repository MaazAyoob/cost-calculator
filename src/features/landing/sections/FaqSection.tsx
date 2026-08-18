import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Cost Calculator estimate residential construction costs?',
      a: 'The engine uses deterministic structural ratios based on Indian Standards (IS 456, IS 1786) and Bangalore regional market Schedule of Rates. It calculates exact quantities for concrete volume, rebar tonnage, AAC blocks, flooring, plumbing, electrical, and paint.',
    },
    {
      q: 'Can I compare specific material brands like UltraTech vs ACC or Tata Tiscon vs JSW?',
      a: 'Yes. In the 10-step wizard, you can toggle between brand tiers and finishes. The physical required quantity (e.g. 9.6 tonnes of steel) remains engineering-invariant while your itemized rates update accurately.',
    },
    {
      q: 'Are the generated BOQ reports accepted for bank home loans?',
      a: 'Yes. Cost Calculator generates 13-stage itemized Bills of Quantities and a 6-stage milestone disbursement roadmap structured according to standard Indian bank appraisal formats (SBI, HDFC, ICICI, Axis).',
    },
    {
      q: 'What plot sizes and storeys are supported?',
      a: 'All standard South Indian urban plot sizes (30×40, 30×50, 40×60, 50×80, and custom dimensions) and residential heights from Ground floor up to G+4 storeys with ground or stilt parking.',
    },
    {
      q: 'Is there any fee to plan and download estimates?',
      a: 'No. The 10-step planning wizard, 3D architectural viewer, interactive dashboard, and BOQ summaries are 100% free for homeowners.',
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-28 bg-[#F7F7F5] border-b border-[#E5E7EB]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Heading */}
        <div className="max-w-2xl space-y-4 text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md inline-block">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172033] tracking-tight leading-[1.15]">
            Everything you need to know.
          </h2>
          <p className="text-base text-[#667085] leading-relaxed">
            Common questions about pre-construction planning, engineering assumptions, and BOQ reports.
          </p>
        </div>

        {/* Minimalist Accordion with Dividers */}
        <div className="divide-y divide-[#E5E7EB] border-y border-[#E5E7EB] text-left">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-6">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer group"
                >
                  <span className="text-base sm:text-lg font-bold text-[#172033] group-hover:text-[#1F4B43] transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#667085] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#1F4B43]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <p className="mt-3 text-xs sm:text-sm text-[#667085] leading-relaxed font-normal pr-8">
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
