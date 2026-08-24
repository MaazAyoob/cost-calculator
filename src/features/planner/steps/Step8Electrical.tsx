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
  }[] = [
    {
      id: 'Economy (Anchor)',
      title: 'Standard Wiring Grade',
      brand: 'Anchor by Panasonic',
      ratePerMetre: 28,
      desc: 'FR PVC insulated pure electrolytic copper wiring for residential circuits.',
    },
    {
      id: 'Mid-range (V-Guard)',
      title: 'Flame Retardant FRLS',
      brand: 'V-Guard Super Shield',
      ratePerMetre: 36,
      desc: 'Flame Retardant Low Smoke pure copper multi-strand safety cables.',
    },
    {
      id: 'Premium (Finolex / Polycab)',
      title: 'Industrial Heavy Duty',
      brand: 'Finolex / Polycab',
      ratePerMetre: 48,
      desc: 'Zero-halogen high insulation resistance flame retardant cables.',
    },
  ];

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 08
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading leading-tight">
          ELECTRICAL &amp; MEP
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Select wiring quality tiers (~{wireM.toLocaleString()}m wire and {conduitM.toLocaleString()}m embedded ISI conduits computed).
        </p>
      </div>

      {/* ── 1. WIRING QUALITY TIERS ── */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Wiring Cable Manufacturer Tier
        </label>
        <div className="space-y-2">
          {wireTiers.map((tier) => {
            const isSelected = electrical.wireTier === tier.id;
            const approxWireCost = Math.round(wireM * tier.ratePerMetre);
            return (
              <div
                key={tier.id}
                onClick={() => setElectricalSelection(tier.id)}
                className={cn(
                  'hutty-tactile-card flex items-center justify-between',
                  isSelected && 'hutty-tactile-card-selected'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                      isSelected ? 'bg-[#1B3D34] text-white' : 'border border-[#D1D5DB]'
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-[#1B3D34]">{tier.title}</h4>
                      <span className="text-[10px] font-mono text-[#4B5563] bg-[#F8F8F6] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                        {tier.brand}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{tier.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs font-black text-[#1B3D34] block font-mono">
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
