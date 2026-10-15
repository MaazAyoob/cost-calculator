import React from 'react';
import {
  Compass,
  Building2,
  HardHat,
  Calculator,
  FileCheck,
  Palette,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  CANONICAL_CONSULTATION_CATEGORIES,
  CATEGORY_DETAILS,
  CanonicalConsultationCategory,
} from '../../../config/consultation';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Compass,
  Building2,
  HardHat,
  Calculator,
  FileCheck,
  Palette,
};

interface ConsultationCategoriesGridProps {
  activeCategory: string;
  onSelectCategory: (categoryName: string) => void;
  onSelectServiceExample?: (categoryName: string, exampleTitle: string) => void;
}

export const ConsultationCategoriesGrid: React.FC<ConsultationCategoriesGridProps> = ({
  activeCategory,
  onSelectCategory,
  onSelectServiceExample,
}) => {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28]">
              CONSULTATION SPECIALTIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] font-heading tracking-tight">
              Explore Consultation Categories
            </h2>
            <p className="text-xs sm:text-sm text-[#687770] leading-relaxed">
              Targeted advice from licensed architects, chartered structural engineers, experienced contractors, and approvals liaisons.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectCategory('ALL')}
            className={`self-start md:self-auto text-xs font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-[#1B3D34] text-white border-[#1B3D34]'
                : 'bg-white text-[#1B3D34] border-[#E3E8E2] hover:bg-[#F8F8F6]'
            }`}
          >
            View All Categories
          </button>
        </div>

        {/* Categories Grid (2x3 on desktop, 1x6 on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CANONICAL_CONSULTATION_CATEGORIES.map((catName) => {
            const detail = CATEGORY_DETAILS[catName];
            const IconComponent = ICON_MAP[detail.icon] || Compass;
            const isSelected =
              activeCategory === catName ||
              detail.mappedConsultantCategories.includes(activeCategory);

            return (
              <div
                key={detail.id}
                onClick={() => onSelectCategory(catName)}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-white border-[#1B3D34] shadow-md ring-1 ring-[#1B3D34]'
                    : 'bg-white border-[#E3E8E2] hover:border-[#1B3D34]/60 hover:shadow-sm'
                }`}
              >
                <div className="space-y-4">
                  {/* Icon & Title */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#1B3D34] text-white'
                          : 'bg-[rgba(27,61,52,0.06)] text-[#1B3D34] group-hover:bg-[#1B3D34] group-hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1B3D34] font-heading group-hover:text-[#F28C28] transition-colors">
                        {detail.name}
                      </h3>
                      <span className="text-[11px] text-[#687770]">
                        Independent Advisory
                      </span>
                    </div>
                  </div>

                  {/* Concise Description from Developer Brief */}
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    {detail.description}
                  </p>

                  {/* Service Examples list */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#687770] block">
                      Common Topics:
                    </span>
                    <ul className="space-y-1">
                      {detail.examples.map((ex, i) => (
                        <li
                          key={i}
                          onClick={(e) => {
                            if (onSelectServiceExample) {
                              e.stopPropagation();
                              onSelectServiceExample(catName, ex);
                            }
                          }}
                          className="text-xs text-[#1B3D34] hover:text-[#F28C28] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28] shrink-0" />
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="pt-4 mt-4 border-t border-[#E3E8E2] flex items-center justify-between text-xs font-bold text-[#1B3D34]">
                  <span>Explore Experts &rarr;</span>
                  <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
