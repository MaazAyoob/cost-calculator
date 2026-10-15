import React from 'react';
import { LAUNCH_CONSULTATION_PRICE_DISPLAY } from '../../../config/consultation';

export const HowConsultationWorksSection: React.FC = () => {
  const steps = [
    {
      number: '1',
      title: 'Tell us what you need',
      description: 'Select a category or describe your question and share basic project details.',
    },
    {
      number: '2',
      title: 'Choose a verified expert',
      description: 'Compare relevant experience, expertise, availability and fee.',
    },
    {
      number: '3',
      title: 'Get practical next steps',
      description: 'Meet by audio/video or the agreed channel and receive clear guidance.',
    },
  ];

  return (
    <section className="bg-white rounded-3xl border border-[#E3E8E2] p-6 sm:p-10 shadow-xs space-y-8 text-left">
      <div className="max-w-2xl space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28]">
          SIMPLE &bull; TRANSPARENT JOURNEY
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] font-heading tracking-tight">
          How Consultation Works
        </h2>
        <p className="text-xs sm:text-sm text-[#687770] leading-relaxed">
          From first question to post-session action items, get professional answers without contractor bias.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.number}
            className="p-6 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2] space-y-3 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1B3D34] text-[#F28C28] flex items-center justify-center font-bold text-base shadow-xs">
              {step.number}
            </div>
            <h3 className="text-base font-bold text-[#1B3D34] font-heading">
              {step.title}
            </h3>
            <p className="text-xs text-[#687770] leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 bg-[rgba(27,61,52,0.03)] border border-[#1B3D34]/15 rounded-xl flex items-center justify-between text-xs text-[#1B3D34] flex-wrap gap-2">
        <span className="font-medium">
          Fixed Launch Price: <strong className="font-mono text-[#F28C28]">{LAUNCH_CONSULTATION_PRICE_DISPLAY}</strong> per session. No hidden commissions.
        </span>
        <span className="text-[11px] text-[#687770]">
          Sessions confirmed after Hutty team reviews topic and expert availability.
        </span>
      </div>
    </section>
  );
};
