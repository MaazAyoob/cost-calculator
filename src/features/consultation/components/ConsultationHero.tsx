import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Video,
  CreditCard,
  UserPlus,
  CheckCircle2,
  Compass,
  Award,
  Sparkles,
} from 'lucide-react';
import { LAUNCH_CONSULTATION_PRICE_DISPLAY } from '../../../config/consultation';
import consultationArchitectImg from '../../../assets/consultation-architect.jpg';

interface ConsultationHeroProps {
  onFindExpertClick: () => void;
}

export const ConsultationHero: React.FC<ConsultationHeroProps> = ({
  onFindExpertClick,
}) => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1B3D34]/[0.06] via-[#1B3D34]/[0.02] to-transparent border-b border-[#E5E7EB] pt-12 pb-14 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Core Message & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 text-left"
          >
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
            <p className="text-base sm:text-lg text-[#707873] leading-relaxed max-w-2xl font-normal">
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
                className="px-6 py-3.5 bg-white hover:bg-[#F8F8F6] text-[#1B3D34] text-sm font-bold rounded-xl border border-[#E5E7EB] hover:border-[#1B3D34] transition-all flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#1B3D34]" />
                <span>Join as a Professional</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Authentic Human Photography Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#E5E7EB] shadow-md bg-white group">
              {/* Authentic Human Photography of Indian Architect & Homeowners */}
              <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-100">
                <img
                  src={consultationArchitectImg}
                  alt="Indian architect warmly consulting with homeowners over residential floor plans in Bangalore studio"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500 ease-out"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#112821]/80 via-transparent to-black/20 pointer-events-none" />

                {/* Floating Top-Right Fee Badge */}
                <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-heading font-black text-xs text-[#1B3D34]">
                    {LAUNCH_CONSULTATION_PRICE_DISPLAY}
                  </span>
                  <span className="text-[10px] text-[#687770]">/ 45 min</span>
                </div>

                {/* Floating Bottom Info Overlay */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-left text-white space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white">
                    <Award className="w-3 h-3 text-[#F28C28]" />
                    <span>COA &amp; Chartered Specialists</span>
                  </div>
                  <h3 className="text-sm font-bold leading-tight">
                    Independent, 1-on-1 Plan &amp; Cost Review
                  </h3>
                  <p className="text-[11px] text-white/80 line-clamp-1">
                    Drawings, BBMP setbacks, structural sanity &amp; contractor BOQ audits.
                  </p>
                </div>
              </div>

              {/* Bottom Quick Feature Strip */}
              <div className="p-3.5 bg-[#F8F9F7] border-t border-[#E5E7EB] grid grid-cols-2 gap-2 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-xs font-semibold text-[#1B3D34]">No Builder Bias</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-xs font-semibold text-[#1B3D34]">Direct Video Session</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
