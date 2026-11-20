import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sliders, FileText, ArrowRight } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const ThreeEasyStepsSection: React.FC = () => {
  const navigate = useNavigate();
  const { startNewProject } = useWizardStore();

  const handleStartReport = () => {
    startNewProject();
    navigate('/calculator');
  };

  const steps = [
    {
      num: '01',
      title: 'Enter Your Plot & Home Details',
      desc: 'Tell us your plot size, floors, rooms, and finishes in our simple 5-step planner.',
      icon: Compass,
      tag: 'Takes 2 minutes',
    },
    {
      num: '02',
      title: 'See Your Free Estimate',
      desc: 'Instantly view your estimated costs, built-up area, and open spaces on screen.',
      icon: Sliders,
      tag: 'Free on screen',
    },
    {
      num: '03',
      title: 'Download Your Full Report',
      desc: 'Pay ₹199 once to download your complete planning PDF with materials, work list, and payment schedule.',
      icon: FileText,
      tag: 'One-time ₹199',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-[#F8F8F6] border-b border-[#E5E7EB] scroll-mt-16 text-[#18211E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="max-w-3xl text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
            <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
            <span className="font-bold">HOW HUTTY WORKS</span>
            <span>&bull;</span>
            <span>THREE SIMPLE STEPS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18211E] font-heading tracking-tight leading-[1.14]">
            How Hutty works.
          </h2>

          <p className="text-sm sm:text-base text-[#66716B] leading-relaxed">
            Plan your home and understand your real numbers in three simple steps.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="bg-white rounded-2xl border-2 border-[#E5E7EB] hover:border-[#183B32] p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-2xs hover:shadow-sm transition-all duration-150 text-left"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-[#183B32] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                      {s.num}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#E8EFE9] border border-[#B7CDBB]/70 text-[#183B32] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-[#18211E] font-heading tracking-tight">
                      {s.title}
                    </h3>
                    <p className="text-[#66716B] text-xs sm:text-sm leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <span className="text-[#66716B] font-medium">{s.tag}</span>
                  <span className="text-[#C66B4E] font-mono font-bold">Step {s.num}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Link to Calculator */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleStartReport}
            className="inline-flex items-center gap-2 bg-[#183B32] hover:bg-[#245747] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span>Start planning my home</span>
            <ArrowRight className="w-4 h-4 text-[#C66B4E]" />
          </button>
        </div>

      </div>
    </section>
  );
};