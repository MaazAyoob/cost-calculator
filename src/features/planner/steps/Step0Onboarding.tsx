import React from 'react';
import { motion } from 'framer-motion';
import { useWizardStore } from '../../../store/useWizardStore';
import {
  CONSTRUCTION_PACKAGES,
  ConstructionPackageId,
} from '../../../calculation-engine/data/packageConfig';
import { ArrowRight, Check, Shield, Award, Sparkles, Play, Layers } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Step0Onboarding: React.FC = () => {
  const { selectedPackage, setSelectedPackage, hasStartedSelection, setStep } = useWizardStore();

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

  const handleSelectPackage = (pkgId: ConstructionPackageId) => {
    setSelectedPackage(pkgId, true);
  };

  const handleContinue = () => {
    setSelectedPackage(selectedPackage || 'PREMIUM', true);
    setStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 sm:py-10 text-center select-none">
      
      {/* Top Architecture Pill */}
      <div>
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[rgba(27,61,52,0.06)] text-[#1B3D34] border border-[#1B3D34]/20 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28]" />
          HUTTY PLANNING PLATFORM &bull; SPECIFICATION BASELINE
        </span>
      </div>

      {/* Main Title & Subtitle */}
      <div className="space-y-3">
        <h1 className="heading-xl text-3xl sm:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-tight">
          Choose your construction standard
        </h1>
        <p className="text-sm sm:text-base text-[#4B5563] font-medium max-w-2xl mx-auto leading-relaxed">
          Start with a package that matches your quality and budget preference. You can customize your requirements later.
        </p>
      </div>

      {/* Construction Package Specification Cards (3 Architectural Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left pt-2">
        {packagesList.map(({ id, icon: Icon, badgeTag, swatches }) => {
          const pkg = CONSTRUCTION_PACKAGES[id];
          const isSelected = selectedPackage === id;
          const isRecommended = Boolean(pkg.badge);

          return (
            <motion.div
              key={id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleSelectPackage(id)}
              className={cn(
                'relative p-6 sm:p-7 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5 bg-white tactile-card',
                isSelected
                  ? 'border-[#1B3D34] ring-2 ring-[#1B3D34] shadow-md bg-[rgba(27,61,52,0.015)]'
                  : 'border-[#E5E7EB] hover:border-[#1B3D34]/40 hover:shadow-xs'
              )}
            >
              {/* Optional Recommended Badge */}
              {isRecommended && (
                <span className="absolute -top-2.5 right-5 bg-[#F28C28] text-[#1B3D34] text-[9px] font-mono font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#1B3D34]" />
                  <span>{pkg.badge}</span>
                </span>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                        isSelected ? 'bg-[#1B3D34] text-white' : 'bg-[#F8F8F6] text-[#4B5563]'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-[#1B3D34] tracking-tight font-heading">
                        {pkg.title}
                      </h3>
                      <span className="text-[10px] text-[#4B5563] font-mono font-bold uppercase block">
                        {badgeTag}
                      </span>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center transition-colors',
                      isSelected ? 'bg-[#1B3D34] text-white' : 'border border-[#D1D5DB]'
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <p className="text-xs text-[#4B5563] leading-relaxed">
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
                          ? 'bg-[rgba(27,61,52,0.08)] text-[#1B3D34] border-[#1B3D34]/20'
                          : 'bg-[#F8F8F6] text-[#4B5563] border-[#E5E7EB]'
                      )}
                    >
                      {sw.tag}
                    </span>
                  ))}
                </div>

                {/* Key Specification Highlights */}
                <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
                  <span className="text-[10px] font-mono font-bold text-[#1B3D34] uppercase tracking-wider block">
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
                <div
                  className={cn(
                    'w-full py-2 px-3 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5',
                    isSelected
                      ? 'bg-[#1B3D34] text-white shadow-2xs'
                      : 'bg-[#F8F8F6] text-[#4B5563] hover:text-[#1B3D34]'
                  )}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Selected Standard</span>
                    </>
                  ) : (
                    <span>Select {pkg.title}</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleContinue}
          className="hutty-btn-primary px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold w-full sm:w-auto cursor-pointer shadow-xs flex items-center justify-center gap-2"
        >
          <span>Continue with {CONSTRUCTION_PACKAGES[selectedPackage || 'PREMIUM']?.title}</span>
          <ArrowRight className="w-4 h-4 text-[#F28C28]" />
        </button>

        {hasStartedSelection && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="hutty-btn-secondary px-6 py-3.5 rounded-xl text-xs font-bold w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 text-[#1B3D34]" />
            <span>Resume Current Project</span>
          </button>
        )}
      </div>

      {/* Reassurance text */}
      <p className="text-[11px] text-[#4B5563]">
        Individual material, brand, and fixture selections can be customized in detail at any step of the calculator.
      </p>

    </div>
  );
};
