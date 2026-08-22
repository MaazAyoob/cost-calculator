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
    { id: 'Tractor Emulsion', title: 'Economy Tractor', ratePerSqFt: 18, desc: 'Smooth matte finish washable interior paint.' },
    { id: 'Premium Emulsion', title: 'Premium Emulsion', ratePerSqFt: 28, desc: 'Rich soft-sheen stain resistant interior emulsion.' },
    { id: 'Royale Luxury Emulsion', title: 'Royale Luxury', ratePerSqFt: 45, desc: 'Teflon surface protector with high washability.' },
  ];

  const externalOptions: {
    id: 'Ultima Weather Proof' | 'Texture Finish';
    title: string;
    ratePerSqFt: number;
    desc: string;
  }[] = [
    { id: 'Ultima Weather Proof', title: 'Ultima Weather Proof', ratePerSqFt: 32, desc: 'Silicon-enhanced anti-fungal weather guard paint.' },
    { id: 'Texture Finish', title: 'Architectural Texture', ratePerSqFt: 55, desc: 'Granite/stone textured exterior coating.' },
  ];

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1 pb-1 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 10
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading">
          Painting &amp; Finishes
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Specify paint grades and manufacturing brand for interior and exterior surfaces.
        </p>
      </div>

      {/* 1. Brand Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Paint Manufacturer
        </label>
        <div className="grid grid-cols-3 gap-2">
          {brands.map((b) => {
            const isSelected = painting.brand === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => setPaintingSelection(painting.internalPaint, painting.externalPaint, b)}
                className={cn(
                  'p-2.5 rounded-xl border transition-all cursor-pointer text-left',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] ring-1 ring-[#1B3D34]'
                    : 'bg-white border-[#E5E7EB] hover:bg-[#F8F8F6]'
                )}
              >
                <div className="flex justify-between items-center text-xs font-bold text-[#1B3D34]">
                  <span>{b}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interior Paint Grade */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Interior Paint (~{interiorAreaSqFt.toLocaleString()} sq.ft)
        </label>
        <div className="space-y-1.5">
          {internalOptions.map((opt) => {
            const isSelected = painting.internalPaint === opt.id;
            const optCost = Math.round(interiorAreaSqFt * opt.ratePerSqFt);
            return (
              <div
                key={opt.id}
                onClick={() => setPaintingSelection(opt.id, painting.externalPaint, painting.brand)}
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
                    <h4 className="text-xs font-bold text-[#1B3D34]">{opt.title}</h4>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{opt.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#1B3D34] block font-mono">
                    ~{formatCurrency(optCost)}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{opt.ratePerSqFt}/sq.ft</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Exterior Paint Grade */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Exterior Coating (~{exteriorAreaSqFt.toLocaleString()} sq.ft)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {externalOptions.map((opt) => {
            const isSelected = painting.externalPaint === opt.id;
            const optCost = Math.round(exteriorAreaSqFt * opt.ratePerSqFt);
            return (
              <div
                key={opt.id}
                onClick={() => setPaintingSelection(painting.internalPaint, opt.id, painting.brand)}
                className={cn(
                  'p-3 rounded-xl border transition-all cursor-pointer space-y-1 text-left flex flex-col justify-between',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] ring-1 ring-[#1B3D34]'
                    : 'bg-white border-[#E5E7EB] hover:bg-[#F8F8F6]'
                )}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-[#1B3D34]">{opt.title}</h4>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
                  </div>
                  <p className="text-[10px] text-[#4B5563] mt-0.5">{opt.desc}</p>
                </div>

                <div className="pt-1.5 border-t border-[#E5E7EB] flex justify-between items-center text-xs font-bold text-[#1B3D34]">
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
