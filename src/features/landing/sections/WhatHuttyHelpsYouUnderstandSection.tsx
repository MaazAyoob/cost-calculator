import React from 'react';
import { IndianRupee, Layers, CalendarCheck, FileText } from 'lucide-react';

interface KeyBenefit {
  num: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  badge: string;
}

const KEY_BENEFITS: KeyBenefit[] = [
  {
    num: '01',
    title: 'Your building cost',
    desc: 'Understand how much your home may cost to build, with realistic rates per square foot.',
    icon: IndianRupee,
    badge: 'Cost Estimate',
  },
  {
    num: '02',
    title: 'Materials needed',
    desc: 'See estimated quantities of materials such as cement, steel, blocks and other items.',
    icon: Layers,
    badge: 'Exact Quantities',
  },
  {
    num: '03',
    title: 'Construction stages',
    desc: 'Understand the major stages of building your home and how milestone payments work.',
    icon: CalendarCheck,
    badge: 'Work Stages',
  },
  {
    num: '04',
    title: 'Your final report',
    desc: 'See your home plan, costs and construction details in one place with a downloadable PDF.',
    icon: FileText,
    badge: 'Planning Dossier',
  },
];

export const WhatHuttyHelpsYouUnderstandSection: React.FC = () => {
  return (
    <section className="py-14 lg:py-20 bg-[#F8F8F6] border-b border-[#E5E7EB] text-[#18211E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="max-w-3xl text-left space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
            <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
            <span className="font-bold">HOMEOWNER INTELLIGENCE</span>
            <span>&bull;</span>
            <span>KEY BENEFITS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-[#18211E] tracking-tight font-heading leading-[1.15]">
            What Hutty helps you understand.
          </h2>

          <p className="text-sm sm:text-base text-[#66716B] leading-relaxed">
            Essential clarity before construction begins, explained in plain English without confusing contractor jargon.
          </p>
        </div>

        {/* 4 Compact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {KEY_BENEFITS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="bg-white rounded-2xl border-2 border-[#E5E7EB] hover:border-[#183B32] p-5 flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-xs transition-all duration-150"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[#E8EFE9] text-[#183B32] flex items-center justify-center border border-[#B7CDBB]/60">
                      <Icon className="w-4 h-4 text-[#183B32]" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#C66B4E] bg-[#FDF0EB] px-2 py-0.5 rounded-full border border-[#E8C5B8]">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#18211E] font-heading tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#66716B] leading-relaxed mt-1.5">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E7EB]/70 flex items-center justify-between text-[11px] text-[#66716B] font-mono">
                  <span>Part {item.num}</span>
                  <span className="text-[#347A62] font-semibold">Homeowner Ready</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
