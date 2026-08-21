import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { Check } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step9BathroomFittings: React.FC = () => {
  const { bathroomFittings, setBathroomFittingSelection } = useWizardStore();
  const quantities = useQuantities();

  const fixtureSets = quantities.bathroomFixtureSets || 3;
  const cpvcMetres = quantities.cpvcSupplyMetres || 180;

  const sanitaryTiers: {
    id: 'Mass Market (Cera / Hindware / Parryware)' | 'Premium (Jaquar / Kohler / Grohe)' | 'Luxury (Toto / Duravit)';
    title: string;
    brands: string;
    ratePerSet: number;
    desc: string;
  }[] = [
    {
      id: 'Mass Market (Cera / Hindware / Parryware)',
      title: 'Standard Sanitary',
      brands: 'Cera / Hindware / Parryware',
      ratePerSet: 18000,
      desc: 'Durable vitreous china sanitaryware with single lever brass CP fittings.',
    },
    {
      id: 'Premium (Jaquar / Kohler / Grohe)',
      title: 'Premium Brands',
      brands: 'Jaquar / Kohler / Grohe',
      ratePerSet: 38000,
      desc: 'Wall-hung water closets, thermostatic diverters, and rain shower heads.',
    },
    {
      id: 'Luxury (Toto / Duravit)',
      title: 'Luxury Designer',
      brands: 'Toto / Duravit',
      ratePerSet: 85000,
      desc: 'Designer sanitaryware with electronic bidet and rimless technology.',
    },
  ];

  const cpvcBrands: { id: 'Ashirwad' | 'Supreme' | 'Astral'; name: string; desc: string }[] = [
    { id: 'Ashirwad', name: 'Ashirwad FlowGuard Plus', desc: 'SDR 11 CPVC hot & cold water plumbing system.' },
    { id: 'Supreme', name: 'Supreme Lifeline CPVC', desc: 'Heavy-duty lead-free potable water piping.' },
    { id: 'Astral', name: 'Astral CPVC Pro', desc: 'High pressure NSF certified plumbing pipes.' },
  ];

  return (
    <div className="space-y-8 text-left select-none">
      {/* Editorial Step Header */}
      <div className="space-y-1">
        <span className="text-xs font-mono font-bold tracking-widest text-[#1B3D34] uppercase block">
          STEP 09
        </span>
        <h2 className="heading-sm text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight">
          Bathroom &amp; CPVC
        </h2>
        <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
          Configure sanitaryware fixture tiers and CPVC water supply pipe brands (~{fixtureSets} bathroom sets).
        </p>
      </div>

      {/* 1. Sanitaryware Tier */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Sanitaryware &amp; Fitting Tier
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sanitaryTiers.map((tier) => {
            const isSelected = bathroomFittings.sanitaryTier === tier.id;
            const approxTotal = Math.round(fixtureSets * tier.ratePerSet);
            return (
              <div
                key={tier.id}
                onClick={() => setBathroomFittingSelection(tier.id, bathroomFittings.cpvcBrand)}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 text-left flex flex-col justify-between',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                )}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-[#1B3D34]">{tier.title}</h4>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#1B3D34] text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-[#1B3D34] block">{tier.brands}</span>
                  <p className="text-[11px] text-[#4B5563] leading-tight">{tier.desc}</p>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-center text-xs font-bold text-[#1B3D34]">
                  <span className="font-mono">~{formatCurrency(approxTotal)}</span>
                  <span className="text-[10px] text-[#4B5563]">₹{tier.ratePerSet.toLocaleString()}/bath</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CPVC Pipe Brand */}
      <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          CPVC Plumbing Pipes (~{cpvcMetres} Metres)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cpvcBrands.map((b) => {
            const isSelected = bathroomFittings.cpvcBrand === b.id;
            return (
              <div
                key={b.id}
                onClick={() => setBathroomFittingSelection(bathroomFittings.sanitaryTier, b.id)}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer space-y-1 text-left',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#1B3D34]">{b.name}</h4>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#1B3D34] text-white flex items-center justify-center text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#4B5563] leading-tight">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
