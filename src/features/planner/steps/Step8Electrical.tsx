import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { Check } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step8Electrical: React.FC = () => {
  const { electrical, setElectricalSelection } = useWizardStore();
  const quantities = useQuantities();

  const wireM = quantities.electricalWireMetres || 850;
  const conduitM = quantities.conduitsMetres || 420;

  const wireTiers: {
    id: 'Economy (Anchor)' | 'Mid-range (V-Guard)' | 'Premium (Finolex / Polycab)';
    title: string;
    brand: string;
    ratePerMetre: number;
    desc: string;
    recommended?: boolean;
  }[] = [
    {
      id: 'Economy (Anchor)',
      title: 'Economy Wiring',
      brand: 'Anchor by Panasonic',
      ratePerMetre: 28,
      desc: 'FR PVC insulated copper wires for standard household circuits.',
    },
    {
      id: 'Mid-range (V-Guard)',
      title: 'Mid-Range FRLS',
      brand: 'V-Guard Super Shield',
      ratePerMetre: 36,
      desc: 'Flame Retardant Low Smoke 100% pure electrolytic copper wiring.',
      recommended: true,
    },
    {
      id: 'Premium (Finolex / Polycab)',
      title: 'Premium Multi-Strand',
      brand: 'Finolex / Polycab',
      ratePerMetre: 48,
      desc: 'High-temperature zero-halogen fire-resistant industrial grade cables.',
    },
  ];

  return (
    <div className="space-y-8 text-left select-none">
      {/* Editorial Step Header */}
      <div className="space-y-1">
        <span className="text-xs font-mono font-bold tracking-widest text-[#1B3D34] uppercase block">
          STEP 08
        </span>
        <h2 className="heading-sm text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight">
          Electrical &amp; MEP
        </h2>
        <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
          Select wiring quality tiers (~{wireM.toLocaleString()}m wire and {conduitM.toLocaleString()}m embedded ISI conduit).
        </p>
      </div>

      {/* Wire Quality Tiers */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Electrical Wiring Specification
        </label>
        <div className="space-y-2.5">
          {wireTiers.map((tier) => {
            const isSelected = electrical.wireTier === tier.id;
            const approxWireCost = Math.round(wireM * tier.ratePerMetre);
            return (
              <div
                key={tier.id}
                onClick={() => setElectricalSelection(tier.id)}
                className={cn(
                  'p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                      isSelected ? 'bg-[#1B3D34] text-white' : 'border border-[#E5E7EB] text-transparent'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#1B3D34]">{tier.title}</h4>
                      <span className="text-[10px] text-[#4B5563]">({tier.brand})</span>
                      {tier.recommended && (
                        <span className="text-[9px] font-bold bg-[rgba(27,61,52,0.08)] text-[#1B3D34] px-1.5 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#4B5563] leading-tight mt-0.5">{tier.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#1B3D34] block font-mono">
                    {formatCurrency(approxWireCost)}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{tier.ratePerMetre}/m</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
