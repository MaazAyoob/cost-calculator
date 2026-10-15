import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Video,
  CreditCard,
  UserPlus,
  CheckCircle2,
  Compass,
  Building,
  Award,
} from 'lucide-react';
import { LAUNCH_CONSULTATION_PRICE_DISPLAY } from '../../../config/consultation';

interface ConsultationHeroProps {
  onFindExpertClick: () => void;
}

export const ConsultationHero: React.FC<ConsultationHeroProps> = ({
  onFindExpertClick,
}) => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1B3D34]/[0.06] via-[#1B3D34]/[0.02] to-transparent border-b border-[#E3E8E2] pt-12 pb-14 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Core Message & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(27,61,52,0.08)] border border-[rgba(27,61,52,0.12)] text-[#1B3D34] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#F28C28] animate-pulse" />
              <span>Residential Construction Advisory &bull; Bangalore</span>
            </div>

            {/* Exact Headline from Developer Brief */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B3D34] tracking-tight leading-[1.12] font-heading">
              Build with confidence.{' '}
              <span className="text-[#F28C28]">Talk to the right expert.</span>
            </h1>

            {/* Exact Supporting Copy from Developer Brief */}
            <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed max-w-2xl font-normal">
              Get practical guidance for your home construction—from planning and approvals to structure, materials and interiors.
            </p>

            {/* Trust Points from Developer Brief */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-semibold text-[#1B3D34]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Verified professionals.</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#F28C28] shrink-0" />
                <span>Online consultations.</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Clear pricing.</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                type="button"
                onClick={onFindExpertClick}
                className="hutty-btn-primary px-6 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <span>Find an Expert</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/professionals/join')}
                className="px-6 py-3.5 bg-white hover:bg-[#F8F8F6] text-[#1B3D34] text-sm font-bold rounded-xl border border-[#E3E8E2] hover:border-[#1B3D34] transition-all flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#1B3D34]" />
                <span>Join as a Professional</span>
              </button>
            </div>
          </div>

          {/* Right Column: Architectural Visual Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border-2 border-[#E3E8E2] p-6 sm:p-7 shadow-sm space-y-5 text-left relative overflow-hidden">
              {/* Subtle architectural decorative accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(27,61,52,0.03)] rounded-bl-full pointer-events-none" />

              {/* Header inside visual card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1B3D34] text-white flex items-center justify-center">
                    <Compass className="w-5 h-5 text-[#F28C28]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28] block">
                      Independent Session
                    </span>
                    <h3 className="text-sm font-bold text-[#1B3D34]">
                      1-on-1 Construction Advisory
                    </h3>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-mono text-xs font-bold">
                  {LAUNCH_CONSULTATION_PRICE_DISPLAY}
                </div>
              </div>

              {/* Key Highlights list */}
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2] flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-[#1B3D34] block">House Plan &amp; Spatial Review</span>
                    <span className="text-[#687770]">Room layout, ventilation &amp; Vastu alignment</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2] flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-[#1B3D34] block">BOQ &amp; Contractor Quote Audit</span>
                    <span className="text-[#687770]">Identify hidden exclusions &amp; rate variance</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2] flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-[#1B3D34] block">Structural &amp; Setback Sanity</span>
                    <span className="text-[#687770]">BBMP/BDA bylaws &amp; RCC soil suitability</span>
                  </div>
                </div>
              </div>

              {/* Bottom Trust Note */}
              <div className="pt-3 border-t border-[#E3E8E2] flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-[#687770]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Award className="w-3.5 h-3.5 text-emerald-700 shrink-0" /> Vetted CoA &amp; Chartered Specialists
                </span>
                <span className="font-medium text-[#1B3D34] shrink-0">45-Minute Focused Call</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
