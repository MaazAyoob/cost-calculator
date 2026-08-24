import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { Check, ShieldCheck } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step3CoreMaterials: React.FC = () => {
  const { materialBrands, setCoreMaterials } = useWizardStore();
  const quantities = useQuantities();

  const steelTonnes = quantities.steelTonnes || 0;
  const cementBags = quantities.cementBags || 0;

  const steelOptions: { brand: 'Tata Tiscon' | 'JSW Neosteel' | 'Indus TMT'; grade: string; ratePerKg: number; desc: string; recommended?: boolean }[] = [
    { brand: 'Tata Tiscon', grade: 'Fe 550D Super Ductile', ratePerKg: 78, desc: 'Primary structural steel with superior earthquake ductility.', recommended: true },
    { brand: 'JSW Neosteel', grade: 'Fe 550D High Strength', ratePerKg: 74, desc: 'High-yield thermo-mechanically treated primary rebars.' },
    { brand: 'Indus TMT', grade: 'Fe 500D Premium', ratePerKg: 68, desc: 'Cost-effective high-durability ribbed TMT bars.' },
  ];

  const cementOptions: { brand: 'UltraTech' | 'ACC Cement' | 'Dalmia Bharat'; grade: string; ratePerBag: number; desc: string; recommended?: boolean }[] = [
    { brand: 'UltraTech', grade: 'Super / Weather Plus (OPC 53)', ratePerBag: 420, desc: "India's #1 structural cement with water-repellent micro-particles.", recommended: true },
    { brand: 'ACC Cement', grade: 'Gold Water Shield / Concrete Plus', ratePerBag: 395, desc: 'High initial compressive strength for slab casting.' },
    { brand: 'Dalmia Bharat', grade: 'DSP / PPC Heavy Structure', ratePerBag: 375, desc: 'High slump retention for heavy reinforced concrete.' },
  ];

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 03
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading leading-tight">
          CORE STRUCTURAL MATERIALS
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Select structural TMT steel and Portland cement brands. Physical quantities remain invariant while unit rates reflect manufacturer grade.
        </p>
      </div>

      {/* ── 1. STRUCTURAL STEEL ── */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            TMT Rebar Steel
          </label>
          <span className="font-mono font-extrabold text-[#1B3D34]">
            {steelTonnes > 0 ? `${steelTonnes} Tonnes Required` : '0 T'}
          </span>
        </div>

        <div className="space-y-2">
          {steelOptions.map((item) => {
            const isSelected = materialBrands.steel === item.brand;
            const itemCost = Math.round(steelTonnes * 1000 * item.ratePerKg);
            return (
              <div
                key={item.brand}
                onClick={() => setCoreMaterials(item.brand, materialBrands.cement as any)}
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
                      <h4 className="text-xs font-extrabold text-[#1B3D34]">{item.brand}</h4>
                      <span className="text-[10px] font-mono text-[#4B5563] bg-[#F8F8F6] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                        {item.grade}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs font-black text-[#1B3D34] block font-mono">
                    {steelTonnes > 0 ? formatCurrency(itemCost) : `₹${item.ratePerKg}/kg`}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{item.ratePerKg}/kg</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. PORTLAND CEMENT ── */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            Portland Cement
          </label>
          <span className="font-mono font-extrabold text-[#1B3D34]">
            {cementBags > 0 ? `${cementBags.toLocaleString()} Bags Required` : '0 Bags'}
          </span>
        </div>

        <div className="space-y-2">
          {cementOptions.map((item) => {
            const isSelected = materialBrands.cement === item.brand;
            const itemCost = Math.round(cementBags * item.ratePerBag);
            return (
              <div
                key={item.brand}
                onClick={() => setCoreMaterials(materialBrands.steel as any, item.brand)}
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
                      <h4 className="text-xs font-extrabold text-[#1B3D34]">{item.brand}</h4>
                      <span className="text-[10px] font-mono text-[#4B5563] bg-[#F8F8F6] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                        {item.grade}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs font-black text-[#1B3D34] block font-mono">
                    {cementBags > 0 ? formatCurrency(itemCost) : `₹${item.ratePerBag}/bag`}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{item.ratePerBag}/bag</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
