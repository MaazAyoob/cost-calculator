import React, { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { ArrowRight, Check, Layers, Sparkles, Shield, Award, Play } from 'lucide-react';
import { HuttyLogo } from '../../../components/common/HuttyLogo';
import { cn } from '../../../utils/cn';

export const Step0Onboarding: React.FC = () => {
  const { specificationTier, setSpecificationTier, hasStartedSelection, city, setStep } = useWizardStore();
  const [selectedTier, setSelectedTier] = useState<'standard' | 'premium' | 'luxury'>(
    specificationTier || 'premium'
  );

  const tiers: {
    id: 'standard' | 'premium' | 'luxury';
    title: string;
    badge?: string;
    desc: string;
    points: string[];
    icon: typeof Layers;
  }[] = [
    {
      id: 'standard',
      title: 'STANDARD',
      desc: 'Smart, value-conscious residential specifications with certified structural durability.',
      points: [
        'Value-focused engineering',
        'Practical, durable materials',
        'Cost-conscious recommendations',
      ],
      icon: Shield,
    },
    {
      id: 'premium',
      title: 'PREMIUM',
      badge: 'RECOMMENDED',
      desc: 'The gold standard for modern residential living. Balanced performance and architectural elegance.',
      points: [
        'Balanced quality and value',
        'Higher-grade branded materials',
        'Recommended specifications',
      ],
      icon: Award,
    },
    {
      id: 'luxury',
      title: 'LUXURY',
      desc: 'Uncompromising finishes with imported natural stones, custom joinery, and bespoke fittings.',
      points: [
        'High-end bespoke finishes',
        'Premium European/Luxury fittings',
        'Luxury material recommendations',
      ],
      icon: Sparkles,
    },
  ];

  const handleContinue = () => {
    setSpecificationTier(selectedTier);
    setStep(1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 sm:py-10 text-center select-none">
      
      {/* Top Engineering Tag */}
      <div>
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[rgba(27,61,52,0.08)] text-[#1B3D34] border border-[#1B3D34]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28]" />
          HUTTY PLANNING PLATFORM &bull; FREE ESTIMATOR
        </span>
      </div>

      {/* Main Title & Supporting Copy */}
      <div className="space-y-3">
        <h1 className="heading-xl text-3xl sm:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-tight">
          How do you want to build?
        </h1>
        <p className="text-sm sm:text-base text-[#4B5563] font-medium max-w-xl mx-auto leading-relaxed">
          Choose a starting specification level. Hutty will recommend suitable materials and finishes throughout your estimate.
        </p>
      </div>

      {/* Specification Preferences (3 Architectural Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-2">
        {tiers.map((tier) => {
          const isSelected = selectedTier === tier.id;
          const Icon = tier.icon;
          return (
            <div
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={cn(
                'relative p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 bg-white',
                isSelected
                  ? 'border-[#1B3D34] ring-2 ring-[#1B3D34] shadow-md bg-[rgba(27,61,52,0.02)]'
                  : 'border-[#E5E7EB] hover:border-[#1B3D34]/40 hover:shadow-xs'
              )}
            >
              {/* Optional Recommended Badge */}
              {tier.badge && (
                <span className="absolute -top-2.5 right-4 bg-[#1B3D34] text-white text-[9px] font-mono font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  {tier.badge}
                </span>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center',
                      isSelected ? 'bg-[#1B3D34] text-white' : 'bg-[#F8F8F6] text-[#4B5563]'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-extrabold text-[#1B3D34] tracking-tight font-heading">
                      {tier.title}
                    </h3>
                  </div>

                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center transition-colors',
                    isSelected ? 'bg-[#1B3D34] text-white' : 'border border-[#E5E7EB]'
                  )}>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {tier.desc}
                </p>

                {/* Bullet Highlights */}
                <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
                  {tier.points.map((pt, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#1B3D34]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28] shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <span className={cn(
                  'text-[11px] font-bold block',
                  isSelected ? 'text-[#1B3D34]' : 'text-[#4B5563]'
                )}>
                  {isSelected ? '✓ Selected Preference' : 'Click to select'}
                </span>
              </div>
            </div>
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
          <span>Continue with {selectedTier.toUpperCase()}</span>
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
        You can fine-tune or override individual brand and material selections at any stage during the calculation.
      </p>

    </div>
  );
};
