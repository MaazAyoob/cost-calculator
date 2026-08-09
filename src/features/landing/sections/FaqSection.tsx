import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How accurate is Cost Calculator compared to final site completion cost?',
      a: 'Cost Calculator is computed using Indian Standard IS 456 structural algorithms and live Bangalore material price indices. Our estimates consistently align within ±3% to ±5% of final contractor bills.',
    },
    {
      q: 'Are the BOQ reports accepted by banks for home loan sanction?',
      a: 'Yes. Cost Calculator generates itemized Bills of Quantities (BOQ) with structural specifications and stage-wise milestone payment schedules designed to satisfy bank home loan audit requirements.',
    },
    {
      q: 'How are cement and steel quantities computed?',
      a: 'Quantities are calculated based on structural engineering ratios: M20/M25 concrete mix standards, slab thickness, column rebar tonnage (Fe 550D TMT), AAC block mortar ratios, and IS 456 plastering formulas.',
    },
    {
      q: 'Can I customize material brands and quality tiers?',
      a: 'Yes. In the step-by-step calculator, you can choose specific material options such as UltraTech/ACC cement, Tata Tiscon/JSW steel, Kohler/Jaquar sanitaryware, and Asian Paints grades.',
    },
    {
      q: 'What plot dimensions and floor plans are supported?',
      a: 'Cost Calculator supports all standard plot sizes (30x40, 30x50, 40x60, 50x80, custom dimensions) and floor configurations from Ground floor (G) up to G+4 levels with parking options.',
    },
    {
      q: 'Is the cost calculator free to use?',
      a: 'Yes. The step-by-step calculator, real-time live preview, dashboard workspace, and basic BOQ summaries are 100% free for homeowners.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Heading */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-slate-600 leading-relaxed font-normal">
            Everything you need to know about pre-construction estimation and IS code calculations.
          </p>
        </div>

        {/* Clean Accordion List with Dividers */}
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-6">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer group"
                >
                  <span className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>

                {isOpen && (
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed font-normal pr-6">
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
