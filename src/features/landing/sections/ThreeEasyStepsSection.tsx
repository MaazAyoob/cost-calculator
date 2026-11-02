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
      detail: 'Setbacks, road widths & legal plot rules',
      iconBg: 'bg-[#E8EFE9]',
      iconBorder: 'border-[#B7CDBB]/70',
      iconColor: 'text-[#183B32]',
    },
    {
      num: '02',
      title: 'Plan your home',
      desc: 'Choose your floor count, room requirements, and finishes with simple visual selectors. No construction knowledge needed.',
      icon: Home,
      detail: 'Floors, rooms & finishes',
      iconBg: 'bg-[#FDF0EB]',
      iconBorder: 'border-[#E8C5B8]',
      iconColor: 'text-[#C66B4E]',
    },
    {
      num: '03',
      title: 'Understand the estimated cost',
      desc: 'See an instant, clear breakdown of materials, labour, and estimated building costs before hiring a contractor.',
      icon: Calculator,
      detail: 'Materials, trade costs & detailed breakdown',
      iconBg: 'bg-[#DDF4E7]',
      iconBorder: 'border-[#A8DAC4]',
      iconColor: 'text-[#347A62]',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#F8F8F6] border-b border-[#E5E7EB] scroll-mt-20 text-[#18211E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
            <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
            <span className="text-[#C66B4E] font-bold">Three Simple Steps</span>
            <span>&bull;</span>
            <span>How Hutty Works</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18211E] font-heading tracking-tight leading-[1.14]">
            Planning your home in three clear steps.
          </h2>

          <p className="text-[#66716B] text-base sm:text-lg leading-relaxed">
            You don't need any construction experience. Hutty guides you through simple choices and calculates everything for your plot.
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
                className="bg-white rounded-2xl border-2 border-[#E5E7EB] hover:border-[#183B32] p-7 sm:p-8 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-xl bg-[#183B32] text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs">
                      {s.num}
                    </span>
                    <div className={`w-10 h-10 rounded-xl ${s.iconBg} border ${s.iconBorder} ${s.iconColor} flex items-center justify-center shadow-2xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[#18211E] font-heading tracking-tight">
                      {s.title}
                    </h3>
                    <p className="text-[#66716B] text-sm leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E5E7EB]">
                  <span className="text-xs font-medium text-[#66716B]">
                    Includes: <strong className="text-[#183B32] font-semibold">{s.detail}</strong>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Editorial Photographic Banner with Family Reviewing Plan */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#E5E7EB] shadow-sm bg-white grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5 h-64 sm:h-80 w-full relative overflow-hidden bg-[#E8EFE9]">
            <img
              src={familyPlanningImg}
              alt="Indian family comfortably planning residential house architecture in Bangalore"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/60 text-xs font-bold text-[#183B32]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C66B4E]" />
              <span>Clear advice for homeowners</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#18211E] font-heading tracking-tight leading-snug">
              Built for families making their largest lifetime investment.
            </h3>
            <p className="text-[#66716B] text-sm sm:text-base leading-relaxed">
              Most home builders face 20–30% cost overruns because material quantities and municipal setbacks were never checked in advance. Hutty gives you the real numbers before you meet contractors.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/calculator')}
                className="bg-[#183B32] hover:bg-[#245747] text-white font-bold text-sm py-3 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 min-h-[46px]"
              >
                <span>Plan My Home</span>
                <ArrowRight className="w-4 h-4 text-[#C66B4E]" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/consult')}
                className="bg-white hover:bg-[#F8F8F6] text-[#183B32] border border-[#183B32]/30 font-semibold text-sm py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
              >
                <span>Talk to an Expert</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
