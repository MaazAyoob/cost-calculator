import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, FileCheck, TrendingUp, Sparkles } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';
import { QuoteReviewModal } from '../../../components/modals/QuoteReviewModal';
import { BuildTrackingModal } from '../../../components/modals/BuildTrackingModal';

export const FourOfferingsSection: React.FC = () => {
  const navigate = useNavigate();
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);

  const offerings = [
    {
      num: '01',
      question: 'What will my home cost?',
      price: 'FREE',
      purpose: 'Instant construction estimate based on your plot size and floors',
      bestFor: 'Homeowners exploring costs for their plot',
      cta: 'Estimate My Home Free',
      action: () => {
        useWizardStore.getState().startNewProject();
        navigate('/calculator');
      },
      icon: Calculator,
      isPrimary: true,
      badgeColor: 'bg-[#DDF4E7] text-[#183B32] border-[#C5E3C8]',
    },
    {
      num: '02',
      question: 'What materials am I paying for?',
      price: '₹499',
      purpose: 'Detailed cost and material report with full work breakdown',
      bestFor: 'Homeowners wanting exact quantities and milestone costs',
      cta: 'See Detailed Report',
      action: () => {
        navigate('/report');
      },
      icon: FileText,
      isPrimary: false,
      isAccent: true,
      badgeColor: 'bg-[#C66B4E]/10 text-[#C66B4E] border-[#C66B4E]/30',
    },
    {
      num: '03',
      question: 'Is this contractor quote fair?',
      price: '₹1,499',
      purpose: 'Have an independent expert review your drawings and contractor quote',
      bestFor: 'Homeowners before signing a contractor agreement',
      cta: 'Talk to an Expert',
      action: () => {
        navigate('/consult');
      },
      icon: FileCheck,
      isPrimary: false,
      isAccent: false,
      badgeColor: 'bg-[#C5A46D]/15 text-[#183B32] border-[#C5A46D]/40',
    },
    {
      num: '04',
      question: 'Where is my money going?',
      price: 'COMING SOON',
      purpose: 'Track material bills, contractor payouts, and site progress',
      bestFor: 'Homeowners currently building',
      cta: 'Learn More',
      action: () => {
        setShowTrackModal(true);
      },
      icon: TrendingUp,
      isPrimary: false,
      isAccent: false,
      badgeColor: 'bg-stone-100 text-stone-500 border-stone-200',
    },
  ];

  return (
    <section id="offerings" className="py-20 sm:py-24 bg-white border-b border-[#E5E7EB] select-none text-[#18211E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
            <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
            <span className="tracking-wide uppercase font-bold">How Hutty Helps You Plan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18211E] font-heading tracking-tight leading-[1.14]">
            Four questions every home builder asks.
          </h2>
          <p className="text-sm sm:text-base text-[#66716B] leading-relaxed font-normal">
            Whether you are exploring costs for a vacant plot, evaluating a contractor's quote, or planning your payment milestones, Hutty provides clear, reliable guidance at every step.
          </p>
        </div>

        {/* 4 Cards Grid - Architectural & Clean */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {offerings.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="p-6 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#183B32] bg-[#F8F8F6] hover:bg-white flex flex-col justify-between space-y-6 transition-all duration-200 group shadow-2xs hover:shadow-md"
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

                  {/* Question (Primary language) */}
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
                        : item.isAccent
                        ? 'bg-[#C66B4E] hover:bg-[#A95640] text-white shadow-xs'
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

      {/* Modals for 03 and 04 */}
      <QuoteReviewModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
      <BuildTrackingModal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
      />
    </section>
  );
};
