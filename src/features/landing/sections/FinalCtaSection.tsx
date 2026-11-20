import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Download } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const FinalCtaSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 lg:py-24 bg-[#183B32] text-white relative overflow-hidden select-none border-t border-[#245747]">
      {/* Blueprint Grid Watermark */}
      <div className="absolute inset-0 pointer-events-none arch-grid-dark opacity-20" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
        
        {/* Roof Accent Geometry */}
        <div className="inline-flex flex-col items-center gap-1.5">
          <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
            <path
              d="M6 24V14L16 6L26 14V24"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M12 9.2L16 6L20 9.2"
              stroke="#C66B4E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs font-semibold text-[#E5D5B4] bg-white/10 px-3 py-0.5 rounded-full inline-block border border-white/20">
            Clear Planning For Your Home
          </span>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-heading leading-[1.12]">
            Start planning your home today.
          </h2>
          <p className="text-xs sm:text-sm text-[#B7CDBB] max-w-md mx-auto leading-relaxed font-normal">
            Enter your plot details and get a clear idea of your home construction cost.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F8F8F6] text-[#183B32] text-xs sm:text-sm font-bold px-7 py-3.5 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 min-h-[48px]"
          >
            <span>Start planning my home</span>
            <ArrowRight className="w-4 h-4 text-[#C66B4E]" />
          </button>

          <a
            href="/Hutty-Sample-Construction-Report.pdf"
            download="Hutty-Sample-Construction-Report.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-xl transition-all cursor-pointer min-h-[48px]"
          >
            <Download className="w-4 h-4 text-[#E5D5B4]" />
            <span>Download sample report</span>
          </a>
        </div>

      </div>
    </section>
  );
};