import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home, Calculator, ArrowRight, CheckCircle2 } from 'lucide-react';
import familyPlanningImg from '../../../assets/how-it-works-family.jpg';

export const ThreeEasyStepsSection: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      num: '01',
      title: 'Tell us about your plot',
      desc: 'Enter your plot dimensions and location. We calculate municipal setbacks and permissible built-up area so you know what can legally be constructed.',
      icon: Compass,
      detail: 'Setbacks, road widths & permissible envelope',
    },
    {
      num: '02',
      title: 'Plan your home',
      desc: 'Choose your floor count, room schedule, and architectural specifications with straightforward visual selectors. No construction jargon required.',
      icon: Home,
      detail: 'Floors, room schedules & specifications',
    },
    {
      num: '03',
      title: 'Understand the estimated cost',
      desc: 'Receive an instant, transparent breakdown of materials, labour, and total construction costs before signing contracts or committing funds.',
      icon: Calculator,
      detail: 'Material quantities, trade costs & BOQ breakdown',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white border-b border-[#E5E7EB] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl text-left space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3EF] border border-[#D5E5DC] text-xs font-semibold text-[#1B3D34]">
            <span className="text-[#F28C28] font-bold">Three Simple Steps</span>
            <span>&bull;</span>
            <span>How Hutty Works</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18211E] font-heading tracking-tight">
            Planning your home in three clear steps.
          </h2>

          <p className="text-[#707873] text-base sm:text-lg leading-relaxed">
            You don't need civil engineering knowledge. Hutty translates complex bye-laws and structural formulas into simple, guided decisions.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB] hover:border-[#1B3D34]/40 p-7 sm:p-8 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-xl bg-[#1B3D34] text-white font-mono font-bold text-sm flex items-center justify-center">
                      {s.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] text-[#1B3D34] flex items-center justify-center shadow-2xs">
                      <Icon className="w-5 h-5 text-[#1B3D34]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[#18211E] font-heading tracking-tight">
                      {s.title}
                    </h3>
                    <p className="text-[#707873] text-sm leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E5E7EB]">
                  <span className="text-xs font-medium text-[#707873]">
                    Includes: <strong className="text-[#18211E] font-semibold">{s.detail}</strong>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Editorial Photographic Banner with Family Reviewing Plan */}
        <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs bg-white grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5 h-64 sm:h-80 w-full relative overflow-hidden bg-slate-100">
            <img
              src={familyPlanningImg}
              alt="Indian family comfortably planning residential house architecture in Bangalore"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3EF] text-xs font-bold text-[#1B3D34]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>Independent Homeowner Intelligence</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#18211E] font-heading tracking-tight leading-snug">
              Built for families making their largest lifetime investment.
            </h3>
            <p className="text-[#707873] text-sm sm:text-base leading-relaxed">
              Most Indian home-builders experience 20–30% budget overruns simply because bill-of-quantities (BOQ) and municipal setbacks were never independently audited. Hutty equips you with factual quantities before contractor meetings.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/calculator')}
                className="bg-[#1B3D34] hover:bg-[#142E27] text-white font-bold text-sm py-3 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Plan Your House Now</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/consult')}
                className="bg-white hover:bg-[#F8F8F6] text-[#18211E] border border-[#E5E7EB] font-semibold text-sm py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book Architect Consultation</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

