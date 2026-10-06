import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2, Calendar, Star, Users } from 'lucide-react';
import { LAUNCH_CONSULTATION_PRICE_DISPLAY } from '../../../config/consultation';

interface ConsultationHeroProps {
  onFindExpertClick: () => void;
}

export const ConsultationHero: React.FC<ConsultationHeroProps> = ({ onFindExpertClick }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1B3D34]/[0.04] to-transparent border-b border-[#E5E7EB] py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(27,61,52,0.08)] border border-[rgba(27,61,52,0.12)] text-[#1B3D34] text-xs font-bold uppercase tracking-wider mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F28C28]" />
            <span>Hutty Certified Experts · Fixed {LAUNCH_CONSULTATION_PRICE_DISPLAY}</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.15] font-heading">
            Find the right expert for your home.
          </h1>

          {/* Supporting Text */}
          <p className="mt-4 text-base sm:text-lg text-[#4B5563] leading-relaxed">
            Get guidance from trusted professionals for your home construction. From independent plan reviews
            and structural audits to contractor quote vetting — speak directly with vetted specialists.
          </p>

          {/* CTA & Features */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onFindExpertClick}
              className="hutty-btn-primary px-6 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Find an Expert</span>
              <ArrowRight className="w-4 h-4 text-[#F28C28]" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#4B5563] px-3 py-2 bg-white/70 backdrop-blur-xs rounded-xl border border-[#E5E7EB]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Only Verified Practitioners · No Commissions</span>
            </div>
          </div>

          {/* Trust Value Props */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#E5E7EB]/80 text-xs">
            <div className="flex items-center gap-2 text-[#1B3D34] font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Council of Architecture &amp; Chartered Engineers</span>
            </div>
            <div className="flex items-center gap-2 text-[#1B3D34] font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Transparent Fixed {LAUNCH_CONSULTATION_PRICE_DISPLAY} Fee</span>
            </div>
            <div className="flex items-center gap-2 text-[#1B3D34] font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Hutty Admin Reviewed &amp; Scheduled</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
