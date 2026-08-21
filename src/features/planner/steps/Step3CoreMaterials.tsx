import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { Check } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step3CoreMaterials: React.FC = () => {
  const { materialBrands, setCoreMaterials } = useWizardStore();
  const quantities = useQuantities();

  const steelTonnes = quantities.steelTonnes || 0;
  const cementBags = quantities.cementBags || 0;

  const steelOptions: { brand: 'Tata Tiscon' | 'JSW Neosteel' | 'Indus TMT'; grade: string; ratePerKg: number; desc: string; recommended?: boolean }[] = [
    { brand: 'Tata Tiscon', grade: 'Fe 550D Super Ductile', ratePerKg: 78, desc: 'Primary steel with superior earthquake resistant ductility.', recommended: true },
    { brand: 'JSW Neosteel', grade: 'Fe 550D High Strength', ratePerKg: 74, desc: 'High strength thermo-mechanically treated rebars.' },
    { brand: 'Indus TMT', grade: 'Fe 500D Premium', ratePerKg: 68, desc: 'Economical high-durability TMT bars.' },
  ];

  const cementOptions: { brand: 'UltraTech' | 'ACC Cement' | 'Dalmia Bharat'; grade: string; ratePerBag: number; desc: string; recommended?: boolean }[] = [
    { brand: 'UltraTech', grade: 'Super / Weather Plus (OPC 53)', ratePerBag: 420, desc: "India's No. 1 Cement with water-repellent micro-particles.", recommended: true },
    { brand: 'ACC Cement', grade: 'Gold Water Shield / Concrete Plus', ratePerBag: 395, desc: 'Engineered for high initial compressive strength.' },
    { brand: 'Dalmia Bharat', grade: 'DSP / PPC Heavy Structure', ratePerBag: 375, desc: 'High slump retention for heavy slab casting.' },
  ];

  return (
    <div className="space-y-8 text-left select-none">
      {/* Editorial Step Header */}
      <div className="space-y-1">
        <span className="text-xs font-mono font-bold tracking-widest text-[#1B3D34] uppercase block">
          STEP 03
        </span>
        <h2 className="heading-sm text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight">
          Core Materials
        </h2>
        <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
          Choose the primary structural materials for your estimate.
        </p>
      </div>

      {/* 1. Structural Steel */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            Structural TMT Steel ({steelTonnes} Tonnes Required)
          </label>
        </div>

        <div className="space-y-2.5">
          {steelOptions.map((item) => {
            const isSelected = materialBrands.steel === item.brand;
            const itemCost = Math.round(steelTonnes * 1000 * item.ratePerKg);
            return (
              <div
                key={item.brand}
                onClick={() => setCoreMaterials(item.brand, materialBrands.cement as any)}
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
                      <h4 className="text-xs font-bold text-[#1B3D34]">{item.brand}</h4>
                      <span className="text-[10px] text-[#4B5563]">({item.grade})</span>
                      {item.recommended && (
                        <span className="text-[9px] font-bold bg-[rgba(27,61,52,0.08)] text-[#1B3D34] px-1.5 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#4B5563] leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#1B3D34] block font-mono">
                    {steelTonnes > 0 ? formatCurrency(itemCost) : `₹${item.ratePerKg}/kg`}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{item.ratePerKg}/kg</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Cement */}
      <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            Portland Cement ({cementBags.toLocaleString()} Bags Required)
          </label>
        </div>

        <div className="space-y-2.5">
          {cementOptions.map((item) => {
            const isSelected = materialBrands.cement === item.brand;
            const itemCost = Math.round(cementBags * item.ratePerBag);
            return (
              <div
                key={item.brand}
                onClick={() => setCoreMaterials(materialBrands.steel as any, item.brand)}
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
                      <h4 className="text-xs font-bold text-[#1B3D34]">{item.brand}</h4>
                      <span className="text-[10px] text-[#4B5563]">({item.grade})</span>
                      {item.recommended && (
                        <span className="text-[9px] font-bold bg-[rgba(27,61,52,0.08)] text-[#1B3D34] px-1.5 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#4B5563] leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#1B3D34] block font-mono">
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
