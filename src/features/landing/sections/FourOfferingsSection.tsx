import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, FileCheck, TrendingUp, ShieldCheck } from 'lucide-react';
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
      question: 'What should it cost?',
      price: 'FREE',
      purpose: 'Construction cost estimate',
      bestFor: 'Users planning their home',
      cta: 'FIND OUT',
      action: () => {
        useWizardStore.getState().startNewProject();
        navigate('/calculator');
      },
      icon: Calculator,
      isPrimary: true,
    },
    {
      num: '02',
      question: 'What am I paying for?',
      price: '₹4,999',
      purpose: 'Detailed cost + BOQ report',
      bestFor: 'Understanding actual construction costs',
      cta: 'SHOW ME',
      action: () => {
        navigate('/report');
      },
      icon: FileText,
      isPrimary: false,
    },
    {
      num: '03',
      question: 'Should I sign this?',
      price: '₹8,999',
      purpose: 'Quote review, negotiation and agreement support',
      bestFor: 'Users before appointing a contractor',
      cta: 'GET A SECOND OPINION',
      action: () => {
        setShowQuoteModal(true);
      },
      icon: FileCheck,
      isPrimary: false,
    },
    {
      num: '04',
      question: 'Where is my money going?',
      price: 'SUBSCRIPTION',
      purpose: 'Construction budget, spending and progress tracking',
      bestFor: 'Users during construction',
      cta: 'TRACK MY BUILD',
      action: () => {
        setShowTrackModal(true);
      },
      icon: TrendingUp,
      isPrimary: false,
    },
  ];

  return (
    <section id="offerings" className="py-16 sm:py-20 bg-white border-b border-[#E5E7EB] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-3 py-1.5 rounded-full inline-block">
            HOW HUTTY HELPS
          </span>
          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.12]">
            Four questions every home builder asks.
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
            Whether you are exploring costs for a vacant plot, evaluating a contractor quote, or managing site disbursements, Hutty provides deterministic clarity at every step.
          </p>
        </div>

        {/* 4 Cards Grid - Architectural & Clean */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {offerings.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="hutty-tactile-card p-6 rounded-2xl border border-[#E5E7EB] hover:border-[#1B3D34] bg-[#F8F8F6] hover:bg-white flex flex-col justify-between space-y-6 transition-all group"
              >
                <div className="space-y-4">
                  {/* Card Top: Number & Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#4B5563]">
                      {item.num}
                    </span>
                    <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                      item.price === 'FREE'
                        ? 'bg-[rgba(27,61,52,0.08)] text-[#1B3D34]'
                        : 'bg-white border border-[#E5E7EB] text-[#1B3D34]'
                    }`}>
                      {item.price}
                    </span>
                  </div>

                  {/* Question (Primary language) */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-black text-[#1B3D34] tracking-tight font-heading leading-snug">
                      "{item.question}"
                    </h3>
                    <p className="text-xs font-semibold text-[#1B3D34]">
                      {item.purpose}
                    </p>
                  </div>

                  {/* Best for */}
                  <div className="pt-2 border-t border-[#E5E7EB] text-[11px] text-[#4B5563]">
                    <span className="font-bold text-[#1B3D34]">Best for:</span> {item.bestFor}
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={item.action}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      item.isPrimary
                        ? 'hutty-btn-primary shadow-2xs'
                        : 'hutty-btn-secondary bg-white hover:bg-[#F8F8F6]'
                    }`}
                  >
                    <span>{item.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
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
