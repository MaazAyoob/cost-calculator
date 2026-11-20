import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { accordionVariant } from '../../../animations/variants';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What do I get in the ₹199 Complete Construction Report?',
      a: 'You receive a complete downloadable 10-page PDF report. It includes your total estimated construction cost, open space requirements for your plot (setbacks), exact materials needed (steel in tonnes, cement bags, and blocks), an itemized list of all 22 building tasks (BOQ), and a 7-stage payment schedule so you only pay your contractor as work gets finished.',
    },
    {
      q: 'How are the costs and material quantities calculated?',
      a: 'Our calculations use official Indian building standards (IS 456 and IS 1786) and current Bangalore market prices for materials and skilled labour. We update these prices regularly so your estimate reflects real local costs.',
    },
    {
      q: 'Can I share this report with contractors or use it for a bank loan?',
      a: 'Yes. The report is written in the standard list of work format (BOQ) that contractors, architects, and Indian banks work with every day. You can use it to compare contractor quotes, avoid overpaying, or attach it to your home construction loan application.',
    },
    {
      q: 'Is expert consultation included in the ₹199 report?',
      a: 'No. Expert consultation is a completely separate service for ₹1,499. It is designed for homeowners who want a private 1-on-1 session with a qualified architect or structural engineer to review custom floor plans, contractor bids, or specific site questions.',
    },
  ];

  return (
    <section id="faq" className="py-16 lg:py-20 bg-white border-b border-[#E5E7EB] select-none scroll-mt-16 text-[#18211E]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
            <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
            <span className="font-bold">COMMON QUESTIONS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#18211E] font-heading tracking-tight leading-[1.14]">
            Frequently asked questions.
          </h2>
          <p className="text-xs sm:text-sm text-[#66716B] leading-relaxed font-normal">
            Clear answers about your estimate, the ₹199 report, and contractor negotiations.
          </p>
        </div>

        {/* Compact Accordion */}
        <div className="divide-y divide-[#E5E7EB] border-y border-[#E5E7EB] text-left">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full min-h-[44px] flex items-center justify-between text-left gap-4 cursor-pointer group"
                >
                  <span className="text-sm sm:text-base font-bold text-[#18211E] group-hover:text-[#183B32] transition-colors leading-snug font-heading">
                    {faq.q}
                  </span>
                  <div className="w-7 h-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#18211E] shrink-0 group-hover:border-[#183B32] transition-colors shadow-2xs">
                    {isOpen ? <Minus className="w-3.5 h-3.5 text-[#C66B4E]" /> : <Plus className="w-3.5 h-3.5" />}
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
                      <p className="mt-3 text-xs sm:text-sm text-[#66716B] leading-relaxed font-normal pr-6">
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