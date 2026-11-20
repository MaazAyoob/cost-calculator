import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, FileCheck, Layers, Sparkles } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';
import { QuoteReviewModal } from '../../../components/modals/QuoteReviewModal';

export const FourOfferingsSection: React.FC = () => {
  const navigate = useNavigate();
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const offerings = [
    {
      num: '01',
      question: 'What can I build on my plot?',
      price: 'FREE',
      purpose: 'Instant online planning preview with legal setbacks, built-up area and preliminary costs',
      bestFor: 'Homeowners exploring possibilities for their vacant plot',
      cta: 'Explore Free Estimate',
      action: () => {
        useWizardStore.getState().startNewProject();
        navigate('/calculator');
      },
      icon: Calculator,
      isPrimary: false,
      isAccent: false,
      badgeColor: 'bg-[#DDF4E7] text-[#183B32] border-[#C5E3C8]',
    },
    {
      num: '02',
      question: 'Can I get a quick PDF summary?',
      price: '₹99',
      purpose: 'Official 4-page downloadable summary with plot dimensions, setbacks, and cost overview',
      bestFor: 'Homeowners wanting a quick printable record for their records',
      cta: 'View Basic PDF Info',
      action: () => {
        navigate('/pricing');
      },
      icon: FileText,
      isPrimary: false,
      isAccent: false,
      badgeColor: 'bg-stone-100 text-[#183B32] border-stone-200',
    },
    {
      num: '03',
      question: 'What materials am I paying for?',
      price: '₹499',
      purpose: 'Complete works BOQ (22 trades), exact physical steel and cement quantities, and milestone schedule',
      bestFor: 'Homeowners preparing to hire contractors and finalize budgets',
      cta: 'Unlock Detailed BOQ',
      action: () => {
        navigate('/pricing');
      },
      icon: Layers,
      isPrimary: true,
      isAccent: true,
      badgeColor: 'bg-[#C66B4E]/10 text-[#C66B4E] border-[#C66B4E]/30',
    },
    {
      num: '04',
      question: 'Is my contractor quote fair?',
      price: '₹1,499',
      purpose: 'Independent 1-on-1 consultation with a licensed architect or structural engineer',
      bestFor: 'Homeowners before signing a construction agreement',
      cta: 'Talk to an Expert',
      action: () => {
        navigate('/consult');
      },
      icon: FileCheck,
      isPrimary: false,
      isAccent: false,
      badgeColor: 'bg-[#C5A46D]/15 text-[#183B32] border-[#C5A46D]/40',
    },
  ];

  return (
    <section id="offerings" className="py-20 sm:py-24 bg-white border-b border-[#E5E7EB] select-none text-[#18211E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
            <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
            <span className="tracking-wide uppercase font-bold">Construction Planning Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18211E] font-heading tracking-tight leading-[1.14]">
            Four questions every home builder asks.
          </h2>
          <p className="text-sm sm:text-base text-[#66716B] leading-relaxed font-normal">
            Whether you are exploring costs for a vacant plot, evaluating an itemized bill of quantities, or reviewing a builder's quote, Hutty provides transparent guidance at every stage.
          </p>
        </div>

        {/* 4 Cards Grid - Architectural & Clean */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {offerings.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className={`p-6 rounded-2xl border-2 flex flex-col justify-between space-y-6 transition-all duration-200 group shadow-2xs hover:shadow-md ${
                  item.isAccent
                    ? 'border-[#183B32] bg-white ring-2 ring-[#183B32]/10'
                    : 'border-[#E5E7EB] hover:border-[#183B32] bg-[#F8F8F6] hover:bg-white'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Top: Number & Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#66716B] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C66B4E]" />
                      {item.num}
                    </span>
                    <span className={`text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider border ${item.badgeColor}`}>
                      {item.price}
                    </span>
                  </div>

                  {/* Question */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-black text-[#183B32] tracking-tight font-heading leading-snug group-hover:text-[#245747]">
                      "{item.question}"
                    </h3>
                    <p className="text-xs font-medium text-[#66716B] leading-relaxed">
                      {item.purpose}
                    </p>
                  </div>

                  {/* Best for */}
                  <div className="pt-3 border-t border-[#E5E7EB] text-[11px] text-[#66716B]">
                    <span className="font-bold text-[#183B32]">Best for:</span> {item.bestFor}
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={item.action}
                    className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      item.isPrimary
                        ? 'bg-[#183B32] hover:bg-[#245747] text-white shadow-xs'
                        : 'bg-white hover:bg-[#F8F8F6] text-[#183B32] border border-[#183B32]/30'
                    }`}
                  >
                    <span>{item.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C66B4E]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Quote Review Modal */}
      <QuoteReviewModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
    </section>
  );
};