import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { accordionVariant } from '../../../animations/variants';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Hutty estimate my home construction costs?',
      a: 'Hutty calculates the actual materials needed for your house—including steel rebar, cement bags, sand, blocks, flooring tiles, and wall paints—based on your plot dimensions and floor plans, using current Bangalore market prices.',
    },
    {
      q: 'Can I compare specific material brands like UltraTech vs ACC or Tata Tiscon vs JSW?',
      a: 'Yes. You can compare different brands of steel, cement, electricals, and sanitaryware. The quantity of materials needed remains consistent with engineering standards, while costs update to reflect your chosen brands.',
    },
    {
      q: 'Can I use the report to discuss costs with my builder or bank?',
      a: 'Yes. Hutty provides an itemized cost report and milestone payment plan that you can use to negotiate fairly with contractors or review with your bank.',
    },
    {
      q: 'What plot sizes and building heights are supported?',
      a: 'All standard Bangalore plot sizes (30×40, 30×50, 40×60, 50×80, and custom sizes) and building heights from Ground floor up to G+4 floors with ground or stilt parking.',
    },
    {
      q: 'Is there any fee to plan my home?',
      a: 'You can explore your plot, view your 3D floor plan, and see an instant estimate for free (₹0). You can also unlock a Detailed BOQ report for ₹499 or the Premium package for ₹1,499 when you are ready to build.',
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-24 bg-white border-b border-[#E5E7EB] select-none text-[#18211E]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
            <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
            <span className="font-bold">Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18211E] font-heading tracking-tight leading-[1.14]">
            Frequently asked questions.
          </h2>
          <p className="text-sm sm:text-base text-[#66716B] leading-relaxed font-normal">
            Clear answers about your estimate, material quantities, and reports.
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
                  className="w-full min-h-[44px] flex items-center justify-between text-left gap-6 cursor-pointer group"
                >
                  <span className="text-base sm:text-lg font-bold text-[#18211E] group-hover:text-[#183B32] transition-colors leading-snug font-heading">
                    {faq.q}
                  </span>
                  <div className="w-8 h-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#18211E] shrink-0 group-hover:border-[#183B32] transition-colors shadow-2xs">
                    {isOpen ? <Minus className="w-4 h-4 text-[#C66B4E]" /> : <Plus className="w-4 h-4" />}
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
                      <p className="mt-4 text-xs sm:text-sm text-[#66716B] leading-relaxed font-normal pr-10">
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
