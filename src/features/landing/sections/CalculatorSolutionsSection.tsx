import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const CalculatorSolutionsSection: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: '01',
      title: 'Tell us about your plot',
      description: 'Enter plot dimensions, floor count (G to G+4), and parking requirements.',
    },
    {
      number: '02',
      title: 'Choose your specifications',
      description: 'Select room counts, structural TMT steel, cement, flooring, doors, and windows.',
    },
    {
      number: '03',
      title: 'We calculate requirements',
      description: 'IS 456 engineering algorithms calculate exact material quantities and line-item costs.',
    },
    {
      number: '04',
      title: 'Get your estimate',
      description: 'Review your total cost, 13-stage BOQ, construction timeline, and payment milestones.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Heading */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Four simple steps to your construction budget.
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Transform plot dimensions into an accurate, engineering-grade construction plan.
          </p>
        </div>

        {/* 4-Step Horizontal Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item) => (
            <div key={item.number} className="space-y-4 relative">
              <span className="text-5xl font-extrabold text-slate-300 block tracking-tight">
                {item.number}
              </span>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Action */}
        <div className="pt-4">
          <button
            onClick={() => navigate('/calculator')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            Start your estimate now <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
