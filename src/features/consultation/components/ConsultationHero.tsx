import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Compass,
  AlertTriangle,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { LAUNCH_CONSULTATION_PRICE_DISPLAY } from '../../../config/consultation';

export type ConsultationEntryChoice = 'quote' | 'architect_engineer' | 'site_problem' | 'help_choose';

interface ConsultationHeroProps {
  onFindExpertClick: () => void;
  onSelectChoice: (choice: ConsultationEntryChoice) => void;
}

export const ConsultationHero: React.FC<ConsultationHeroProps> = ({
  onFindExpertClick,
  onSelectChoice,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1B3D34]/[0.05] via-[#1B3D34]/[0.02] to-transparent border-b border-[#E3E8E2] py-12 sm:py-16 lg:py-20 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4 text-left">
          {/* Top Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(27,61,52,0.08)] border border-[rgba(27,61,52,0.12)] text-[#1B3D34] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F28C28]" />
            <span>Independent Professional Consultation &bull; Fixed {LAUNCH_CONSULTATION_PRICE_DISPLAY}</span>
          </div>

          {/* Client Requested Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B3D34] tracking-tight leading-[1.15] font-heading">
            Need help building your home? Talk to an expert.
          </h1>

          {/* Client Requested Supporting Text */}
          <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed font-normal">
            Get help with your house plan, contractor quote, materials, structure or site questions. Not sure who you need? Tell us about your problem and Hutty will help you find the right person.
          </p>

          <div className="pt-1 flex items-center gap-3 text-xs text-[#4B5563]">
            <span className="flex items-center gap-1.5 font-semibold text-[#1B3D34]">
              <Clock className="w-4 h-4 text-[#F28C28]" /> 45-minute focused session
            </span>
            <span>&bull;</span>
            <span>Video or Phone Call</span>
            <span>&bull;</span>
            <span>Written Advice &amp; Action Notes</span>
          </div>
        </div>

        {/* ── FOUR SIMPLE ENTRY CHOICES ── */}
        <div className="mt-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563] block mb-3 text-left">
            How can we help you today? Select an option to start:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            
            {/* Choice 1: Check my contractor’s quote */}
            <div
              onClick={() => onSelectChoice('quote')}
              className="p-5 bg-white rounded-2xl border-2 border-[#E3E8E2] hover:border-[#1B3D34] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-[rgba(27,61,52,0.08)] text-[#1B3D34] flex items-center justify-center group-hover:bg-[#1B3D34] group-hover:text-white transition-colors">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B3D34] group-hover:text-[#F28C28] transition-colors">
                    Check my contractor’s quote
                  </h3>
                  <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                    Check itemized labour rates, steel ratios, brand specs, and identify hidden variations.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E3E8E2]/60 flex items-center justify-between text-xs font-bold text-[#1B3D34]">
                <span>Check Quote &rarr;</span>
                <span className="font-mono text-[#F28C28]">{LAUNCH_CONSULTATION_PRICE_DISPLAY}</span>
              </div>
            </div>

            {/* Choice 2: Find an architect or engineer */}
            <div
              onClick={() => onSelectChoice('architect_engineer')}
              className="p-5 bg-white rounded-2xl border-2 border-[#E3E8E2] hover:border-[#1B3D34] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-[rgba(27,61,52,0.08)] text-[#1B3D34] flex items-center justify-center group-hover:bg-[#1B3D34] group-hover:text-white transition-colors">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B3D34] group-hover:text-[#F28C28] transition-colors">
                    Find an architect or engineer
                  </h3>
                  <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                    Review floor plans, check structural safety, ventilation, and municipal bylaws.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E3E8E2]/60 flex items-center justify-between text-xs font-bold text-[#1B3D34]">
                <span>Browse Experts &rarr;</span>
                <span className="font-mono text-[#F28C28]">{LAUNCH_CONSULTATION_PRICE_DISPLAY}</span>
              </div>
            </div>

            {/* Choice 3: Get help with a problem at my site */}
            <div
              onClick={() => onSelectChoice('site_problem')}
              className="p-5 bg-white rounded-2xl border-2 border-[#E3E8E2] hover:border-[#1B3D34] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-[rgba(242,140,40,0.12)] text-[#F28C28] flex items-center justify-center group-hover:bg-[#F28C28] group-hover:text-white transition-colors">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B3D34] group-hover:text-[#F28C28] transition-colors">
                    Get help with a problem at my site
                  </h3>
                  <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                    Soil, foundation, wall cracks, water seepage, or construction quality questions.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E3E8E2]/60 flex items-center justify-between text-xs font-bold text-[#1B3D34]">
                <span>Get Site Help &rarr;</span>
                <span className="font-mono text-[#F28C28]">{LAUNCH_CONSULTATION_PRICE_DISPLAY}</span>
              </div>
            </div>

            {/* Choice 4: I’m not sure — help me choose */}
            <div
              onClick={() => onSelectChoice('help_choose')}
              className="p-5 bg-[rgba(27,61,52,0.03)] rounded-2xl border-2 border-dashed border-[#1B3D34]/30 hover:border-[#1B3D34] hover:bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1B3D34] text-white flex items-center justify-center group-hover:bg-[#F28C28] transition-colors">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B3D34] group-hover:text-[#F28C28] transition-colors">
                    I’m not sure — help me choose
                  </h3>
                  <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                    Tell us your question in plain words. The Hutty team will review and match you with the right person.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E3E8E2]/60 flex items-center justify-between text-xs font-bold text-[#1B3D34]">
                <span>Help Me Choose &rarr;</span>
                <span className="font-mono text-[#F28C28]">{LAUNCH_CONSULTATION_PRICE_DISPLAY}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Trust Value Props */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#E3E8E2]/80 text-xs text-left">
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
    </section>
  );
};
