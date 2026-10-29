import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home, Calculator, ArrowRight } from 'lucide-react';

export const ThreeEasyStepsSection: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      num: '01',
      title: 'Tell us about your plot',
      desc: 'Enter your plot size and location. We work out boundary clearances and permissible space so you know what can legally be built.',
      icon: Compass,
      detail: 'Setbacks, road width & boundary clearances',
    },
    {
      num: '02',
      title: 'Plan your home',
      desc: 'Choose your floor count, room layout, and finish preferences using simple visual choices. No engineering jargon required.',
      icon: Home,
      detail: 'Floors, room counters & material finishes',
    },
    {
      num: '03',
      title: 'Understand the estimated cost',
      desc: 'Get an instant, transparent breakdown of materials, labour, and total construction costs before spending money with contractors.',
      icon: Calculator,
      detail: 'Material quantities, trade costs & BOQ options',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl text-left space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3EF] border border-[#D5E5DC] text-xs font-semibold text-[#1B3D34]">
            <span className="text-[#F28C28] font-bold">Three Simple Steps</span>
            <span>&bull;</span>
            <span>How Hutty Works</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#1B3D34] tracking-tight">
            Planning your home in three simple steps.
          </h2>

          <p className="text-[#52605B] text-base sm:text-lg leading-relaxed">
            You don't need construction experience. Hutty guides you through every decision with large, clear choices and plain-language explanations.
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
                className="bg-[#F8F9F7] rounded-3xl border border-[#E2E8E3] hover:border-[#1B3D34]/40 p-7 sm:p-8 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-[#1B3D34] text-white font-mono font-bold text-sm flex items-center justify-center">
                      {s.num}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-white border border-[#E2E8E3] text-[#1B3D34] flex items-center justify-center shadow-2xs">
                      <Icon className="w-5 h-5 text-[#1B3D34]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[#1B3D34] tracking-tight">
                      {s.title}
                    </h3>
                    <p className="text-[#52605B] text-sm leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E2E8E3]">
                  <span className="text-xs font-medium text-[#687770]">
                    Includes: <strong className="text-[#1B3D34]">{s.detail}</strong>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Row */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-[#EBF3EF] border border-[#D5E5DC]">
          <div>
            <h4 className="text-base font-bold text-[#1B3D34]">
              Ready to plan your home?
            </h4>
            <p className="text-xs sm:text-sm text-[#52605B]">
              Takes less than 2 minutes. No account or credit card required.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/calculator')}
            className="w-full sm:w-auto bg-[#1B3D34] hover:bg-[#142E27] text-white font-bold text-sm py-3 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start Free Estimate</span>
            <ArrowRight className="w-4 h-4 text-[#F28C28]" />
          </button>
        </div>

      </div>
    </section>
  );
};

