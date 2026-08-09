import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const FinalCtaSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-28 bg-[#F9FAFB] border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
            Build with clarity.
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Estimate construction costs, materials, timelines and project requirements before construction begins.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Start Free Estimate <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
};
