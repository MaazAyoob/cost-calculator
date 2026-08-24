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
      title: 'Standard Vitreous Sanitary',
      brands: 'Cera / Hindware / Parryware',
      ratePerSet: 18000,
      desc: 'Floor mounted WC, wall basin, and brass chrome plated fixtures.',
    },
    {
      id: 'Premium (Jaquar / Kohler / Grohe)',
      title: 'Premium Architectural',
      brands: 'Jaquar / Kohler / Grohe',
      ratePerSet: 38000,
      desc: 'Wall-hung closets, concealed flush valves, and overhead rain showers.',
    },
    {
      id: 'Luxury (Toto / Duravit)',
      title: 'Designer Luxury Collection',
      brands: 'Toto / Duravit',
      ratePerSet: 85000,
      desc: 'Imported rimless ceramic bowls, electronic bidet washlets & thermostatic mixers.',
    },
  ];

  const cpvcBrands: { id: 'Ashirwad' | 'Supreme' | 'Astral'; name: string; desc: string }[] = [
    { id: 'Ashirwad', name: 'Ashirwad FlowGuard Plus', desc: 'SDR 11 CPVC hot/cold piping' },
    { id: 'Supreme', name: 'Supreme Lifeline CPVC', desc: 'Heavy pressure plumbing pipes' },
    { id: 'Astral', name: 'Astral CPVC Pro', desc: 'Lead-free NSF certified CPVC' },
  ];

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 09
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading leading-tight">
          BATHROOM &amp; PLUMBING
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Configure sanitaryware fixture tiers and CPVC water supply pipe brands (~{fixtureSets} bathroom sets computed).
        </p>
      </div>

      {/* ── 1. SANITARYWARE SPECIFICATION ── */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            Sanitaryware &amp; CP Fixtures
          </label>
          <span className="font-mono text-[#4B5563] text-[11px]">~{fixtureSets} bathroom suites</span>
        </div>

        <div className="space-y-2">
          {sanitaryTiers.map((tier) => {
            const isSelected = bathroomFittings.sanitaryTier === tier.id;
            const approxTotal = Math.round(fixtureSets * tier.ratePerSet);
            return (
              <div
                key={tier.id}
                onClick={() => setBathroomFittingSelection(tier.id, bathroomFittings.cpvcBrand)}
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
                        {tier.brands}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{tier.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs font-black text-[#1B3D34] block font-mono">
                    {formatCurrency(approxTotal)}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{tier.ratePerSet.toLocaleString()}/bath</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. CPVC PIPE BRAND ── */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            CPVC Internal Plumbing Pipes
          </label>
          <span className="font-mono text-[#4B5563] text-[11px]">~{cpvcMetres}m supply line</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {cpvcBrands.map((b) => {
            const isSelected = bathroomFittings.cpvcBrand === b.id;
            return (
              <div
                key={b.id}
                onClick={() => setBathroomFittingSelection(bathroomFittings.sanitaryTier, b.id)}
                className={cn(
                  'hutty-tactile-card p-3 space-y-1',
                  isSelected && 'hutty-tactile-card-selected'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold text-[#1B3D34]">{b.name}</h4>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />}
                </div>
                <p className="text-[10px] text-[#4B5563] truncate">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
