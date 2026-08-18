import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const CalculatorSolutionsSection: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: '01',
      title: 'Define Plot',
      description: 'Enter site length, width, and number of approved residential storeys (Ground to G+4).',
    },
    {
      number: '02',
      title: 'Configure Home',
      description: 'Set room counts (bedrooms, bathrooms, kitchen, balconies) and parking provisions.',
    },
    {
      number: '03',
      title: 'Choose Specifications',
      description: 'Select brand grades for structural steel, cement, flooring, doors, windows, and paint.',
    },
    {
      number: '04',
      title: 'Review Estimate',
      description: 'Receive instant live project cost, 13-stage BOQ line items, and payment schedule.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Heading */}
        <div className="max-w-3xl space-y-4 text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md inline-block">
            Step-by-Step Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172033] tracking-tight leading-[1.15]">
            Four simple steps to your construction budget.
          </h2>
          <p className="text-base text-[#667085] leading-relaxed">
            Transform plot dimensions into an accurate, engineering-grade residential construction plan.
          </p>
        </div>

        {/* 4-Step Horizontal Process with Thin Connecting Line */}
        <div className="relative">
          {/* Thin Horizontal Connecting Line on Desktop */}
          <div className="hidden lg:block absolute top-6 left-12 right-12 h-px bg-[#E5E7EB] z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 relative z-10">
            {steps.map((item) => (
              <div key={item.number} className="space-y-3.5 text-left">
                {/* Step Number Circle / Badge */}
                <div className="w-12 h-12 rounded-full bg-[#F7F7F5] border border-[#E5E7EB] flex items-center justify-center text-base font-black text-[#1F4B43] shadow-xs">
                  {item.number}
                </div>

                <h3 className="text-lg font-bold text-[#172033] leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Action */}
        <div className="pt-2 text-left">
          <button
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1F4B43] hover:text-[#163731] transition-colors cursor-pointer group"
          >
            Start your estimate now 
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </section>
  );
};
