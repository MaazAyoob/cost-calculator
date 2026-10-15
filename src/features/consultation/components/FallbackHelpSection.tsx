import React from 'react';
import { HelpCircle, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface FallbackHelpSectionProps {
  onOpenFallbackModal: (initialTopic?: string) => void;
  selectedCategory?: string;
}

export const FallbackHelpSection: React.FC<FallbackHelpSectionProps> = ({
  onOpenFallbackModal,
  selectedCategory,
}) => {
  const topic = selectedCategory && selectedCategory !== 'ALL'
    ? `Help with ${selectedCategory}`
    : "I'm not sure — help me choose";

  return (
    <section className="bg-white rounded-3xl border-2 border-dashed border-[#1B3D34]/25 p-6 sm:p-10 text-left space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>EXPERT MATCHING DESK</span>
          </div>

          {/* Exact Heading from Developer Brief */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3D34] font-heading">
            Not sure who you need? Tell us about your project.
          </h2>

          {/* Exact Supporting Copy from Developer Brief */}
          <p className="text-xs sm:text-sm text-[#687770] leading-relaxed">
            Share your question and project details. Hutty will help you find the right next step.
          </p>

          <div className="flex items-center gap-4 text-[11px] text-[#687770] pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Free Guidance &bull; No Obligation
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#F28C28]" /> 24 Business Hour Response
            </span>
          </div>
        </div>

        <div className="self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onOpenFallbackModal(topic)}
            className="hutty-btn-primary px-5 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.98]"
          >
            <span>Ask Hutty Match Desk</span>
            <ArrowRight className="w-4 h-4 text-[#F28C28]" />
          </button>
        </div>
      </div>
    </section>
  );
};
