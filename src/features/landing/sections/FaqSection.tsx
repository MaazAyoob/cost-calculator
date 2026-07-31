import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How accurate is Cost Calculator compared to final site completion cost•',
      a: 'Cost Calculator is calculated using Indian Standard IS 456 structural algorithms and live Bangalore/Karnataka material price indices. Our estimates consistently align within Â±3% to Â±5% of final actual contractor bills, eliminating major surprises.',
    },
    {
      q: 'Are the BOQ reports accepted by banks (SBI, HDFC, ICICI) for home loan sanction•',
      a: 'Yes! Cost Calculator generates 13-stage itemized Bills of Quantities (BOQ) with structural specifications and 6-stage milestone payment schedules designed specifically to satisfy bank home loan audit requirements.',
    },
    {
      q: 'How are cement and steel quantities computed•',
      a: 'Quantities are calculated based on structural engineering ratios: M20/M25 concrete mix standards (1:1.5:3 & 1:1:2), slab thickness, column rebar tonnage (Fe 550D TMT), AAC block mortar ratios, and IS 456 plastering formulas.',
    },
    {
      q: 'Can I customize material brands and quality tiers•',
      a: 'Absolutely. Inside our 10-step wizard, you can switch between Standard, Premium, and Luxury tiers or manually select UltraTech/ACC cement, Tata Tiscon/JSW steel, Kohler/Jaquar sanitaryware, and Asian Paints grades.',
    },
    {
      q: 'What plot dimensions and floor plans are supported•',
      a: 'Cost Calculator supports all standard Indian plot sizes (30x40, 30x50, 40x60, 50x80, custom dimensions) and floor configurations from Ground floor (G) up to G+4 levels with basement and parking options.',
    },
    {
      q: 'Is the calculator free to use•',
      a: 'Yes! The 10-step planning wizard, real-time live preview, dashboard workspace, and basic BOQ summaries are 100% free for homeowners.',
    },
  ];

  return (
    <section id="faq" className="bg-[var(--cc-bg)] py-20 border-b border-[var(--cc-border)] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--cc-brand)]/10 border border-[var(--cc-brand)]/30 text-[var(--cc-brand)] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--cc-text-primary)] tracking-tight">
            Everything You Need to Know.
          </h2>
          <p className="text-[var(--cc-text-secondary)] text-base leading-relaxed">
            Got questions about pre-construction planning, IS codes, or bank loans• We have answers.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[var(--cc-surface)]/50 border border-[var(--cc-border)]/80 overflow-hidden transition-all text-left"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[var(--cc-surface)]/80 transition-colors"
                >
                  <span className="text-base font-bold text-[var(--cc-text-primary)]">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[var(--cc-brand)] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[var(--cc-text-secondary)] leading-relaxed border-t border-[var(--cc-border)]/50">
                        {faq.a}
                      </div>
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

