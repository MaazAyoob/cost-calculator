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
      desc: 'Durable vitreous china sanitaryware with brass CP fittings.',
    },
    {
      id: 'Premium (Jaquar / Kohler / Grohe)',
      title: 'Premium Brands',
      brands: 'Jaquar / Kohler / Grohe',
      ratePerSet: 38000,
      desc: 'Wall-hung closets, concealed diverters, and rain shower heads.',
    },
    {
      id: 'Luxury (Toto / Duravit)',
      title: 'Luxury Designer',
      brands: 'Toto / Duravit',
      ratePerSet: 85000,
      desc: 'Designer sanitaryware with bidet washlets and rimless bowl technology.',
    },
  ];

  const cpvcBrands: { id: 'Ashirwad' | 'Supreme' | 'Astral'; name: string }[] = [
    { id: 'Ashirwad', name: 'Ashirwad FlowGuard Plus' },
    { id: 'Supreme', name: 'Supreme Lifeline CPVC' },
    { id: 'Astral', name: 'Astral CPVC Pro' },
  ];

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1 pb-1 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 09
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading">
          Bathroom &amp; Plumbing
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Configure sanitaryware fixture tiers and CPVC water supply pipe brands (~{fixtureSets} bathroom sets).
        </p>
      </div>

      {/* 1. Sanitaryware Tier */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Sanitaryware &amp; Fittings
        </label>
        <div className="space-y-1.5">
          {sanitaryTiers.map((tier) => {
            const isSelected = bathroomFittings.sanitaryTier === tier.id;
            const approxTotal = Math.round(fixtureSets * tier.ratePerSet);
            return (
              <div
                key={tier.id}
                onClick={() => setBathroomFittingSelection(tier.id, bathroomFittings.cpvcBrand)}
                className={cn(
                  'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] ring-1 ring-[#1B3D34]'
                    : 'bg-white border-[#E5E7EB] hover:bg-[#F8F8F6]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                      isSelected ? 'bg-[#1B3D34] text-white' : 'border border-[#D1D5DB]'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-[#1B3D34]">{tier.title}</h4>
                      <span className="text-[10px] text-[#4B5563]">({tier.brands})</span>
                    </div>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{tier.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#1B3D34] block font-mono">
                    {formatCurrency(approxTotal)}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{tier.ratePerSet.toLocaleString()}/bath</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CPVC Pipe Brand */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          CPVC Plumbing Pipes (~{cpvcMetres}m)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {cpvcBrands.map((b) => {
            const isSelected = bathroomFittings.cpvcBrand === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setBathroomFittingSelection(bathroomFittings.sanitaryTier, b.id)}
                className={cn(
                  'p-2.5 rounded-xl border transition-all cursor-pointer text-left',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] ring-1 ring-[#1B3D34]'
                    : 'bg-white border-[#E5E7EB] hover:bg-[#F8F8F6]'
                )}
              >
                <div className="flex justify-between items-center text-xs font-bold text-[#1B3D34]">
                  <span className="truncate">{b.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
