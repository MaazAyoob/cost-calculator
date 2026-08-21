import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const FinalCtaSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 lg:py-32 bg-[#1B3D34] text-white relative overflow-hidden select-none">
      {/* Blueprint Grid Watermark */}
      <div className="absolute inset-0 pointer-events-none arch-grid-dark opacity-20" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
        
        {/* Roof Accent Geometry */}
        <div className="inline-flex flex-col items-center gap-2">
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
            <path
              d="M6 24V14L16 6L26 14V24"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M12 9.2L16 6L20 9.2"
              stroke="#F28C28"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#F28C28] bg-white/10 px-3.5 py-1 rounded-md inline-block">
            START PRE-CONSTRUCTION PLANNING
          </span>
        </div>

        <div className="space-y-4">
          <h2 className="heading-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
            Build your home <br />
            with clarity.
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-lg mx-auto leading-relaxed font-normal">
            Start with your plot. Configure your spaces. Know the real estimate before breaking ground.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="inline-flex items-center gap-2.5 bg-white hover:bg-[#F8F8F6] text-[#1B3D34] text-sm sm:text-base font-bold px-8 py-4 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <span>Start Free Estimate</span>
            <ArrowRight className="w-4 h-4 text-[#F28C28]" />
          </button>
        </div>

      </div>
    </section>
  );
};
