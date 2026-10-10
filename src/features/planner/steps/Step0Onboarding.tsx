import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWizardStore } from '../../../store/useWizardStore';
import {
  CONSTRUCTION_PACKAGES,
  ConstructionPackageId,
} from '../../../calculation-engine/data/packageConfig';
import { Check, Shield, Award, Sparkles, Play } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Step0Onboarding: React.FC = () => {
  const { selectedPackage, setSelectedPackage, hasStartedSelection, setStep } = useWizardStore();
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    isNavigatingRef.current = false;
  }, []);

  const packagesList: {
    id: ConstructionPackageId;
    icon: typeof Shield;
    badgeTag: string;
    swatches: { name: string; tag: string }[];
  }[] = [
    {
      id: 'STANDARD',
      icon: Shield,
      badgeTag: 'ESSENTIAL VALUE',
      swatches: [
        { name: 'Steel', tag: 'Indus Fe 500D' },
        { name: 'Flooring', tag: 'Vitrified 800mm' },
        { name: 'Windows', tag: 'Aluminium' },
      ],
    },
    {
      id: 'PREMIUM',
      icon: Award,
      badgeTag: 'RECOMMENDED STANDARD',
      swatches: [
        { name: 'Steel', tag: 'Tata Tiscon 550D' },
        { name: 'Flooring', tag: 'Granite / GVT' },
        { name: 'Windows', tag: 'uPVC Soundproof' },
      ],
    },
    {
      id: 'LUXURY',
      icon: Sparkles,
      badgeTag: 'REFINED FINISH',
      swatches: [
        { name: 'Steel', tag: 'Tata Tiscon 550D' },
        { name: 'Flooring', tag: 'Italian Marble' },
        { name: 'Joinery', tag: 'Solid Burma Teak' },
      ],
    },
  ];

  const handleSelectPackageAndAdvance = (pkgId: ConstructionPackageId, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    // 1. Select package & apply default specifications
    setSelectedPackage(pkgId, true);

    // 2. Immediately navigate from Step 0 to Step 1 (Plot Dimensions & Site)
    setStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-2 sm:py-3 select-none">
      
      {/* Contextual Guidance Strip */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#E3E8E2] text-xs">
        <span className="text-xs font-medium text-[#687770]">
          Select an architectural specification baseline. Every material and finish can be customized in following steps.
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#1B3D34] bg-[#EDF3ED] border border-[#CBE0CD]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28]" />
          Instant Setup
        </span>
      </div>

      {/* Construction Package Specification Cards (3 Architectural Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 text-left">
        {packagesList.map(({ id, icon: Icon, badgeTag, swatches }) => {
          const pkg = CONSTRUCTION_PACKAGES[id];
          const isSelected = selectedPackage === id;
          const isRecommended = Boolean(pkg.badge);

          return (
            <motion.div
              key={id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => handleSelectPackageAndAdvance(id, e)}
              className={cn(
                'relative p-5 sm:p-6 rounded-[14px] border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 bg-white',
                isSelected
                  ? 'border-[#1B3D34] ring-1.5 ring-[#1B3D34] shadow-sm bg-[#F0F5F0]'
                  : 'border-[#E3E8E2] hover:border-[#1B3D34]/30 hover:bg-[#F8FAF8]'
              )}
            >
              {/* Optional Recommended Badge */}
              {isRecommended && (
                <span className="absolute -top-2.5 right-4 bg-[#F28C28] text-[#172722] text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#172722]" />
                  <span>{pkg.badge}</span>
                </span>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E3E8E2] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                        isSelected ? 'bg-[#1B3D34] text-white' : 'bg-[#F8F8F6] text-[#687770]'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#172722] tracking-tight font-heading">
                        {pkg.title}
                      </h3>
                      <span className="text-[10px] text-[#687770] font-mono font-bold uppercase block">
                        {badgeTag}
                      </span>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center transition-colors',
                      isSelected ? 'bg-[#1B3D34] text-white' : 'border border-[#CBD5CB]'
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <p className="text-xs text-[#687770] leading-relaxed">
                  {pkg.description}
                </p>

                {/* Material Swatches Pill Bar */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {swatches.map((sw, sIdx) => (
                    <span
                      key={sIdx}
                      className={cn(
                        'text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border',
                        isSelected
                          ? 'bg-white text-[#1B3D34] border-[#1B3D34]/20'
                          : 'bg-[#F8F8F6] text-[#687770] border-[#E3E8E2]'
                      )}
                    >
                      {sw.tag}
                    </span>
                  ))}
                </div>

                {/* Key Specification Highlights */}
                <div className="pt-2 border-t border-[#E3E8E2] space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#172722] uppercase tracking-wider block">
                    KEY SPECIFICATIONS
                  </span>
                  <div className="space-y-1.5 text-xs">
                    {pkg.keyHighlights.slice(0, 4).map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[#1B3D34]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28] mt-1.5 shrink-0" />
                        <span className="text-[11px] leading-snug text-[#4B5563]">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={(e) => handleSelectPackageAndAdvance(id, e)}
                  className={cn(
                    'w-full py-2.5 px-3 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                    isSelected
                      ? 'bg-[#1B3D34] text-white shadow-2xs'
                      : 'bg-[#F8F8F6] text-[#4B5563] hover:bg-[rgba(27,61,52,0.06)] hover:text-[#1B3D34]'
                  )}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Selected {pkg.title}</span>
                    </>
                  ) : (
                    <span>Select {pkg.title}</span>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Footer: Resume Project (when user has already started a project) */}
      {hasStartedSelection && (
        <div className="pt-2 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="hutty-btn-secondary px-6 py-3 rounded-xl text-xs font-bold w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 text-[#1B3D34]" />
            <span>Resume Current Project</span>
          </button>
        </div>
      )}

      {/* Reassurance text */}
      <p className="text-[11px] text-[#4B5563]">
        Individual material, brand, and fixture selections can be customized in detail at any step of the calculator.
      </p>

    </div>
  );
};
