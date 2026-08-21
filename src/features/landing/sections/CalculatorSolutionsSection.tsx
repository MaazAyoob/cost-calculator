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
      sentence: 'Enter site length, width, and municipal authority to compute permissible ground coverage and setbacks.',
    },
    {
      num: '02',
      title: 'Configure Your Home',
      sentence: 'Select the number of residential storeys, bedroom count, bathrooms, and parking requirements.',
    },
    {
      num: '03',
      title: 'Choose Specifications',
      sentence: 'Pick brand tiers for structural steel, cement, flooring, doors, windows, and electrical fittings.',
    },
    {
      num: '04',
      title: 'Review Your Estimate',
      sentence: 'Get an immediate live project cost, 13-stage BOQ schedule, and bank milestone roadmap.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-24 bg-white border-b border-[#E5E7EB] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-3 py-1.5 rounded-md inline-block">
            STEP-BY-STEP METHODOLOGY
          </span>
          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.12]">
            How Hutty works.
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
            A linear pre-construction planning process from boundary dimensions to final line-item estimate.
          </p>
        </div>

        {/* Horizontal Timeline with Large Numbers & Thin Line */}
        <div className="relative">
          {/* Thin connecting line across all 4 steps */}
          <div className="hidden lg:block absolute top-7 left-8 right-8 h-px bg-[#E5E7EB] z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 relative z-10">
            {steps.map((step, idx) => {
              const isActive = activeStepIndex === idx;
              return (
                <div
                  key={step.num}
                  onMouseEnter={() => setActiveStepIndex(idx)}
                  className="space-y-3 text-left group cursor-pointer transition-all"
                >
                  {/* Large Editorial Number */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-4xl sm:text-5xl font-black font-mono transition-colors ${
                        isActive ? 'text-[#1B3D34]' : 'text-stone-300 group-hover:text-[#1B3D34]'
                      }`}
                    >
                      {step.num}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full transition-colors ${
                        isActive ? 'bg-[#F28C28]' : 'bg-transparent'
                      }`}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-[#1B3D34] tracking-tight">
                    {step.title}
                  </h3>

                  {/* Sentence */}
                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-normal">
                    {step.sentence}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Minimal CTA Action */}
        <div className="pt-2 text-left">
          <button
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1B3D34] hover:text-[#132C25] transition-colors cursor-pointer group"
          >
            <span>Start your estimate now</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#F28C28]" />
          </button>
        </div>

      </div>
    </section>
  );
};
