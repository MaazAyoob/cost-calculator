import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const CalculatorSolutionsSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const steps = [
    {
      num: '01',
      title: 'Define Your Plot',
      sentence: 'Enter site length, width, and municipal authority to compute permissible ground coverage.',
    },
    {
      num: '02',
      title: 'Configure Your Home',
      sentence: 'Select number of residential storeys, bedroom count, bathrooms, and parking requirements.',
    },
    {
      num: '03',
      title: 'Choose Specifications',
      sentence: 'Pick brand tiers for structural steel, cement, flooring, doors, windows, and electrical.',
    },
    {
      num: '04',
      title: 'Review Your Estimate',
      sentence: 'Get an immediate live project cost, 13-stage BOQ schedule, and bank milestone roadmap.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white border-b border-[#E5E7EB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md inline-block">
            Step-by-Step Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#172033] tracking-tight leading-[1.15]">
            How Cost Calculator Works.
          </h2>
          <p className="text-base text-[#667085] leading-relaxed font-normal">
            A linear pre-construction planning process from boundary dimensions to final line-item estimate.
          </p>
        </div>

        {/* Horizontal Timeline with Large Numbers & Thin Line - No Cards */}
        <div className="relative">
          {/* Thin connecting line across all 4 steps on desktop */}
          <div className="hidden lg:block absolute top-7 left-8 right-8 h-px bg-[#E5E7EB] z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 relative z-10">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                onMouseEnter={() => setActiveStepIndex(idx)}
                className="space-y-3 text-left group cursor-pointer transition-all"
              >
                {/* Large Editorial Number */}
                <div className="flex items-center gap-3">
                  <span className={`text-4xl sm:text-5xl font-black font-mono transition-colors ${
                    activeStepIndex === idx ? 'text-[#1F4B43]' : 'text-slate-300 group-hover:text-[#1F4B43]'
                  }`}>
                    {step.num}
                  </span>
                  <div className={`w-2 h-2 rounded-full transition-colors ${
                    activeStepIndex === idx ? 'bg-[#1F4B43]' : 'bg-transparent'
                  }`} />
                </div>

                {/* Small Title */}
                <h3 className="text-base font-bold text-[#172033] tracking-tight">
                  {step.title}
                </h3>

                {/* One Sentence */}
                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed font-normal">
                  {step.sentence}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal CTA Action */}
        <div className="pt-2 text-left">
          <button
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1F4B43] hover:text-[#163731] transition-colors cursor-pointer group"
          >
            Start your estimate now 
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </section>
  );
};
