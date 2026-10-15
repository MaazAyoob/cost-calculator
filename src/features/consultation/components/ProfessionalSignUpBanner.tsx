import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, CheckCircle2 } from 'lucide-react';

export const ProfessionalSignUpBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#1B3D34] rounded-3xl p-8 sm:p-12 text-white text-left relative overflow-hidden shadow-md">
      {/* Subtle architectural background detail */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F28C28] text-xs font-bold uppercase tracking-wider">
          <Briefcase className="w-3.5 h-3.5" />
          <span>For Architects, Structural Engineers &amp; Contractors</span>
        </div>

        {/* Exact Headline from Developer Brief */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight leading-tight">
          Are you a construction professional?
        </h2>

        {/* Exact Supporting Copy from Developer Brief */}
        <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl">
          Join Hutty to connect with genuine homeowners, grow your practice and showcase your expertise.
        </p>

        {/* Value badges */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-white/90 pt-1">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#F28C28]" />
            <span>Pre-screened homeowner leads</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#F28C28]" />
            <span>Independent advisory appointments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#F28C28]" />
            <span>CoA / Chartered credentials verified</span>
          </div>
        </div>

        {/* Exact CTA from Developer Brief */}
        <div className="pt-3">
          <button
            type="button"
            onClick={() => navigate('/professionals/join')}
            className="px-6 py-3.5 rounded-xl bg-[#F28C28] hover:bg-[#e07b1a] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
          >
            <span>Join Hutty as a Professional</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
};
