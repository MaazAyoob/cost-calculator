import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { Check } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step10Painting: React.FC = () => {
  const { painting, setPaintingSelection } = useWizardStore();
  const quantities = useQuantities();

  const interiorAreaSqFt = quantities.interiorPaintAreaSqFt || 5800;
  const exteriorAreaSqFt = quantities.exteriorPaintAreaSqFt || 2200;

  const brands: ('Asian Paints' | 'Berger Paints' | 'Dulux')[] = ['Asian Paints', 'Berger Paints', 'Dulux'];

  const internalOptions: {
    id: 'Tractor Emulsion' | 'Premium Emulsion' | 'Royale Luxury Emulsion';
    title: string;
    ratePerSqFt: number;
    desc: string;
  }[] = [
    { id: 'Tractor Emulsion', title: 'Economy Tractor', ratePerSqFt: 18, desc: 'Smooth matte finish washable interior wall paint.' },
    { id: 'Premium Emulsion', title: 'Premium Emulsion', ratePerSqFt: 28, desc: 'Rich soft-sheen stain resistant interior emulsion.' },
    { id: 'Royale Luxury Emulsion', title: 'Royale Luxury', ratePerSqFt: 45, desc: 'Teflon surface protector with high washability sheen.' },
  ];

  const externalOptions: {
    id: 'Ultima Weather Proof' | 'Texture Finish';
    title: string;
    ratePerSqFt: number;
    desc: string;
  }[] = [
    { id: 'Ultima Weather Proof', title: 'Ultima Weather Proof', ratePerSqFt: 32, desc: 'Silicon-enhanced anti-fungal exterior weather guard paint.' },
    { id: 'Texture Finish', title: 'Architectural Texture', ratePerSqFt: 55, desc: 'Granite/stone textured exterior protective coating.' },
  ];

  return (
    <div className="space-y-8 text-left select-none">
      {/* Editorial Step Header */}
      <div className="space-y-1">
        <span className="text-xs font-mono font-bold tracking-widest text-[#1B3D34] uppercase block">
          STEP 10
        </span>
        <h2 className="heading-sm text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight">
          Painting &amp; Finishes
        </h2>
        <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
          Specify paint grades and manufacturing brand for interior and exterior walls.
        </p>
      </div>

      {/* 1. Brand Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Paint Manufacturer
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {brands.map((b) => {
            const isSelected = painting.brand === b;
            return (
              <div
                key={b}
                onClick={() => setPaintingSelection(painting.internalPaint, painting.externalPaint, b)}
                className={cn(
                  'p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                )}
              >
                <span className="text-xs font-bold text-[#1B3D34]">{b}</span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#1B3D34] text-white flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Interior Paint Grade */}
      <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Interior Wall &amp; Ceiling Paint (~{interiorAreaSqFt.toLocaleString()} sq.ft)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {internalOptions.map((opt) => {
            const isSelected = painting.internalPaint === opt.id;
            const optCost = Math.round(interiorAreaSqFt * opt.ratePerSqFt);
            return (
              <div
                key={opt.id}
                onClick={() => setPaintingSelection(opt.id, painting.externalPaint, painting.brand)}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 text-left flex flex-col justify-between',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                )}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-[#1B3D34]">{opt.title}</h4>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#1B3D34] text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-[#4B5563] leading-tight">{opt.desc}</p>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB]/60 flex justify-between items-center text-xs font-bold text-[#1B3D34]">
                  <span className="font-mono">~{formatCurrency(optCost)}</span>
                  <span className="text-[10px] text-[#4B5563]">₹{opt.ratePerSqFt}/sq.ft</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Exterior Paint Grade */}
      <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Exterior Weather-Proof Coating (~{exteriorAreaSqFt.toLocaleString()} sq.ft)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {externalOptions.map((opt) => {
            const isSelected = painting.externalPaint === opt.id;
            const optCost = Math.round(exteriorAreaSqFt * opt.ratePerSqFt);
            return (
              <div
                key={opt.id}
                onClick={() => setPaintingSelection(painting.internalPaint, opt.id, painting.brand)}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 text-left flex flex-col justify-between',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                )}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-[#1B3D34]">{opt.title}</h4>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#1B3D34] text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-[#4B5563] leading-tight">{opt.desc}</p>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB]/60 flex justify-between items-center text-xs font-bold text-[#1B3D34]">
                  <span className="font-mono">~{formatCurrency(optCost)}</span>
                  <span className="text-[10px] text-[#4B5563]">₹{opt.ratePerSqFt}/sq.ft</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
