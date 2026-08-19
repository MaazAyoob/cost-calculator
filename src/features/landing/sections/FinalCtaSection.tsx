import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const FinalCtaSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 lg:py-32 bg-[#1F4B43] text-white relative overflow-hidden">
      {/* Subtle architectural line drawing in background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #FFFFFF 1px, transparent 1px),
            linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      {/* Subtle architectural elevation line drawing accents */}
      <div className="absolute inset-0 pointer-events-none opacity-15 hidden md:block">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1200 400">
          <line x1="100" y1="360" x2="1100" y2="360" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="200" y1="360" x2="200" y2="80" stroke="#FFFFFF" strokeWidth="1" />
          <line x1="1000" y1="360" x2="1000" y2="80" stroke="#FFFFFF" strokeWidth="1" />
          <line x1="200" y1="80" x2="1000" y2="80" stroke="#FFFFFF" strokeWidth="1" />
          <line x1="200" y1="180" x2="1000" y2="180" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="6 6" />
          <line x1="200" y1="270" x2="1000" y2="270" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="6 6" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
        
        <div className="space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#B8894A] bg-white/10 px-3.5 py-1.5 rounded-md inline-block">
            Start Pre-Construction Planning
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Build with a clearer number.
          </h2>
          <p className="text-base sm:text-lg text-slate-200/90 max-w-xl mx-auto leading-relaxed font-normal">
            Start with your plot. Configure your home. Understand the estimate.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-[#1F4B43] text-sm sm:text-base font-bold px-8 py-4 rounded-lg transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Free Estimate <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
