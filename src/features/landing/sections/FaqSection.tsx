import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { accordionVariant } from '../../../animations/variants';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Hutty estimate residential construction costs?',
      a: 'Hutty calculates the required concrete, steel rebar, masonry blocks, flooring, plumbing, electrical, and paint directly from your plot dimensions and floor plans using established residential building standards and local market rates.',
    },
    {
      q: 'Can I compare specific material brands like UltraTech vs ACC or Tata Tiscon vs JSW?',
      a: 'Yes. In the planning calculator, you can compare material brands and finishes. The amount of steel or cement needed stays consistent for your house size, while the itemized rates update to reflect your choices.',
    },
    {
      q: 'Can I use the report for a bank loan or contractor discussions?',
      a: 'Yes. Hutty provides a detailed construction cost report and milestone payment plan you can review and discuss with your bank or contractor. (Final loan appraisal depends on your bank\'s specific review.)',
    },
    {
      q: 'What plot sizes and storeys are supported?',
      a: 'All standard South Indian urban plot sizes (30×40, 30×50, 40×60, 50×80, and custom dimensions) and residential heights from Ground floor up to G+4 storeys with ground or stilt parking.',
    },
    {
      q: 'Is there any fee to plan and download estimates?',
      a: 'You can explore your house plan and see a basic estimate for free (₹0). When you need the complete itemized report with all materials and costs, you can unlock the Detailed BOQ for ₹499 or the Premium package for ₹1,499.',
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-24 bg-white border-b border-[#E3E8E2] select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/10 text-xs font-semibold text-[#1B3D34]">
            Frequently Asked Questions
          </div>
          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.12]">
            Everything you need to know.
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
            Common questions regarding your estimate, materials, and cost reports.
          </p>
        </div>

        {/* Minimal Accordion with Thin Dividers and Plus/Minus Icons */}
        <div className="divide-y divide-[#E3E8E2] border-y border-[#E3E8E2] text-left">
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
                  <div className="w-8 h-8 rounded-full border border-[#E3E8E2] flex items-center justify-center text-[#1B3D34] shrink-0 group-hover:border-[#1B3D34] transition-colors">
                    {isOpen ? <Minus className="w-4 h-4 text-[#F28C28]" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      variants={accordionVariant}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-xs sm:text-sm text-[#4B5563] leading-relaxed font-normal pr-10">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
