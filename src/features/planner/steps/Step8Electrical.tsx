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
      desc: 'Flame Retardant Low Smoke 100% pure copper wiring.',
    },
    {
      id: 'Premium (Finolex / Polycab)',
      title: 'Premium Multi-Strand',
      brand: 'Finolex / Polycab',
      ratePerMetre: 48,
      desc: 'Zero-halogen fire-resistant industrial grade cables.',
    },
  ];

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1 pb-1 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 08
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading">
          Electrical &amp; MEP
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Select wiring quality tiers (~{wireM.toLocaleString()}m wire and {conduitM.toLocaleString()}m embedded ISI conduit).
        </p>
      </div>

      {/* Wire Quality Tiers */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Wiring Quality Tier
        </label>
        <div className="space-y-1.5">
          {wireTiers.map((tier) => {
            const isSelected = electrical.wireTier === tier.id;
            const approxWireCost = Math.round(wireM * tier.ratePerMetre);
            return (
              <div
                key={tier.id}
                onClick={() => setElectricalSelection(tier.id)}
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
                      <span className="text-[10px] text-[#4B5563]">({tier.brand})</span>
                    </div>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{tier.desc}</p>
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
