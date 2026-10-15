import React from 'react';
import {
  Compass,
  Calculator,
  FileCheck,
  Palette,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  POPULAR_SERVICES,
  LAUNCH_CONSULTATION_PRICE_DISPLAY,
  CanonicalConsultationCategory,
} from '../../../config/consultation';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Compass,
  Calculator,
  FileCheck,
  Palette,
};

interface PopularConsultationsSectionProps {
  onSelectService: (serviceTitle: string, category: CanonicalConsultationCategory) => void;
}

export const PopularConsultationsSection: React.FC<PopularConsultationsSectionProps> = ({
  onSelectService,
}) => {
  return (
    <section className="bg-white border-y border-[#E3E8E2] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
        
        {/* Header */}
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgba(242,140,40,0.12)] text-[#F28C28] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MOST REQUESTED SESSIONS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] font-heading tracking-tight">
            Popular Consultations
          </h2>
          <p className="text-xs sm:text-sm text-[#687770] leading-relaxed">
            Fast, focused advisory sessions solving the most critical questions homeowners face before and during construction.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {POPULAR_SERVICES.map((srv) => {
            const IconComponent = ICON_MAP[srv.icon] || Compass;

            return (
              <div
                key={srv.id}
                className="bg-[#F8F8F6] hover:bg-white rounded-2xl border-2 border-[#E3E8E2] hover:border-[#1B3D34] hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E3E8E2] text-[#1B3D34] flex items-center justify-center group-hover:bg-[#1B3D34] group-hover:text-white transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-xs font-bold">
                      {LAUNCH_CONSULTATION_PRICE_DISPLAY}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#1B3D34] font-heading group-hover:text-[#F28C28] transition-colors leading-snug">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-[#687770] mt-1.5 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#687770]">
                    <Clock className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>45-Min Video / Audio</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E3E8E2]/80">
                  <button
                    type="button"
                    onClick={() => onSelectService(srv.title, srv.category)}
                    className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#1B3D34] text-[#1B3D34] hover:text-white border border-[#E3E8E2] hover:border-[#1B3D34] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs group-hover:shadow-xs cursor-pointer"
                  >
                    <span>Book Session</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
