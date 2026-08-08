import React, { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { Card } from '../../../components/ui/Card';
import { HardHat, Layers, Check, HelpCircle, ArrowRight } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step3CoreMaterials: React.FC = () => {
  const { materialBrands, setCoreMaterials } = useWizardStore();
  const quantities = useQuantities();
  const [showWhy, setShowWhy] = useState(false);

  const steelTonnes = quantities.steelTonnes || 18.5;
  const cementBags = quantities.cementBags || 1450;

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

  const selectedSteelObj = steelOptions.find((s) => s.brand === materialBrands.steel);
  const selectedCementObj = cementOptions.find((c) => c.brand === materialBrands.cement);

  const steelTotalCost = selectedSteelObj ? Math.round(steelTonnes * 1000 * selectedSteelObj.ratePerKg) : 0;
  const cementTotalCost = selectedCementObj ? Math.round(cementBags * selectedCementObj.ratePerBag) : 0;

  return (
    <div className="space-y-8 py-2">
      {/* Header Intro */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Core Construction Materials</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Select preferred steel and cement brands to calculate structural material costs.
        </p>
      </div>

      {/* Structural Requirements Light Banner */}
      <Card className="p-4 bg-white border border-slate-200/90 shadow-soft-xs rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">ESTIMATED STRUCTURAL REQUIREMENTS</span>
          <div className="font-extrabold text-sm text-slate-900 mt-0.5">
            {steelTonnes} Tonnes Steel &bull; {cementBags.toLocaleString()} Cement Bags
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowWhy(!showWhy)}
          className="text-xs text-blue-600 hover:text-blue-700 underline flex items-center gap-1 font-bold cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Why these quantities?
        </button>
      </Card>

      {showWhy && (
        <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 space-y-1">
          <p className="font-bold">Engineering Rationale:</p>
          <p className="text-[11px] leading-relaxed text-blue-800">
            Steel is estimated at ~4.5 kg per sq ft BUA for seismic safety; Cement is calculated at ~0.44 bags per sq ft BUA across slab, beam, column, and masonry work.
          </p>
        </div>
      )}

      {/* 1. Structural TMT Steel Section */}
      <section className="space-y-3">
        <div className="flex justify-between items-center text-xs font-extrabold text-slate-800">
          <span className="flex items-center gap-1.5 uppercase tracking-widest text-slate-700">
            <HardHat className="w-4 h-4 text-blue-600" /> Structural TMT Steel ({steelTonnes} Tonnes)
          </span>
          <span className="text-blue-600 font-extrabold">
            {steelTotalCost > 0 ? `Est: ${formatCurrency(steelTotalCost)}` : ''}
          </span>
        </div>

        <div className="space-y-2.5">
          {steelOptions.map((item) => {
            const isSelected = materialBrands.steel === item.brand;
            const itemCost = Math.round(steelTonnes * 1000 * item.ratePerKg);
            return (
              <Card
                key={item.brand}
                onClick={() => setCoreMaterials(item.brand, materialBrands.cement as any)}
                className={cn(
                  'p-4 cursor-pointer border transition-all flex items-center justify-between rounded-2xl',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900">{item.brand}</h4>
                      {item.recommended && (
                        <span className="text-[10px] font-extrabold bg-blue-100/80 text-blue-700 px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">{formatCurrency(itemCost)}</span>
                    <span className="text-[10px] text-slate-400 font-medium">₹{item.ratePerKg}/kg</span>
                  </div>
                  <span className={cn(
                    'text-xs font-extrabold px-3 py-1 rounded-xl border transition-colors flex items-center gap-1',
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  )}>
                    {isSelected ? '✓ Selected' : <>Select <ArrowRight className="w-3 h-3 inline" /></>}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 2. Cement Section */}
      <section className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center text-xs font-extrabold text-slate-800">
          <span className="flex items-center gap-1.5 uppercase tracking-widest text-slate-700">
            <Layers className="w-4 h-4 text-blue-600" /> Portland Cement ({cementBags.toLocaleString()} Bags)
          </span>
          <span className="text-blue-600 font-extrabold">
            {cementTotalCost > 0 ? `Est: ${formatCurrency(cementTotalCost)}` : ''}
          </span>
        </div>

        <div className="space-y-2.5">
          {cementOptions.map((item) => {
            const isSelected = materialBrands.cement === item.brand;
            const itemCost = Math.round(cementBags * item.ratePerBag);
            return (
              <Card
                key={item.brand}
                onClick={() => setCoreMaterials(materialBrands.steel as any, item.brand)}
                className={cn(
                  'p-4 cursor-pointer border transition-all flex items-center justify-between rounded-2xl',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900">{item.brand}</h4>
                      {item.recommended && (
                        <span className="text-[10px] font-extrabold bg-blue-100/80 text-blue-700 px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">{formatCurrency(itemCost)}</span>
                    <span className="text-[10px] text-slate-400 font-medium">₹{item.ratePerBag}/bag</span>
                  </div>
                  <span className={cn(
                    'text-xs font-extrabold px-3 py-1 rounded-xl border transition-colors flex items-center gap-1',
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  )}>
                    {isSelected ? '✓ Selected' : <>Select <ArrowRight className="w-3 h-3 inline" /></>}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
