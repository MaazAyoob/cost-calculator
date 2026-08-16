import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { Card } from '../../../components/ui/Card';
import { Paintbrush, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step10Painting: React.FC = () => {
  const { painting, setPaintingSelection } = useWizardStore();
  const quantities = useQuantities();

  const interiorAreaSqFt = quantities.interiorPaintAreaSqFt || 0;
  const exteriorAreaSqFt = quantities.exteriorPaintAreaSqFt || 0;

  const brands: ('Asian Paints' | 'Berger Paints' | 'Dulux')[] = ['Asian Paints', 'Berger Paints', 'Dulux'];

  const internalOptions: {
    id: 'Tractor Emulsion' | 'Premium Emulsion' | 'Royale Luxury Emulsion';
    title: string;
    ratePerSqFt: number;
    desc: string;
  }[] = [
    { id: 'Tractor Emulsion', title: 'Economy Tractor Emulsion', ratePerSqFt: 18, desc: 'Smooth matte finish washable interior wall paint.' },
    { id: 'Premium Emulsion', title: 'Premium Emulsion Finish', ratePerSqFt: 28, desc: 'Rich soft-sheen stain resistant interior emulsion.' },
    { id: 'Royale Luxury Emulsion', title: 'Royale Luxury Teflon Emulsion', ratePerSqFt: 45, desc: 'Teflon surface protector with high-washability luxury sheen.' },
  ];

  const externalOptions: {
    id: 'Ultima Weather Proof' | 'Texture Finish';
    title: string;
    ratePerSqFt: number;
    desc: string;
  }[] = [
    { id: 'Ultima Weather Proof', title: 'Ultima Weather Proof Emulsion', ratePerSqFt: 32, desc: 'Silicon-enhanced anti-fungal exterior weather guard paint.' },
    { id: 'Texture Finish', title: 'Architectural Texture Finish', ratePerSqFt: 55, desc: 'Granite/stone textured exterior protective coating.' },
  ];

  const activeInternal = internalOptions.find((i) => i.id === painting.internalPaint);
  const activeExternal = externalOptions.find((e) => e.id === painting.externalPaint);

  const interiorCost = activeInternal ? Math.round(interiorAreaSqFt * activeInternal.ratePerSqFt) : 0;
  const exteriorCost = activeExternal ? Math.round(exteriorAreaSqFt * activeExternal.ratePerSqFt) : 0;

  return (
    <div className="space-y-8 py-2">
      {/* Header Intro */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Painting Systems &amp; Finishes</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Specify paint grades and manufacturing brand for interior and exterior walls.
        </p>
      </div>

      {/* Base Layer Pre-selected */}
      <Card className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Base Layer: 2-Coat Acrylic Putty + 1-Coat Primer</h4>
            <span className="text-[11px] text-blue-700 font-medium">Pre-selected base preparation for maximum paint adhesion</span>
          </div>
        </div>
        <span className="text-[11px] font-extrabold text-blue-800 bg-blue-100 px-3 py-1 rounded-xl shrink-0">Included</span>
      </Card>

      {/* Paint Brand Selection */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-widest">
          <Paintbrush className="w-4 h-4 text-blue-600" />
          <h3>Select Paint Manufacturing Brand</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {brands.map((b) => {
            const isSelected = painting.brand === b;
            return (
              <Card
                key={b}
                onClick={() => setPaintingSelection(painting.internalPaint, painting.externalPaint, b)}
                className={cn(
                  'p-4 cursor-pointer text-center border transition-all space-y-1 rounded-2xl',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">{b}</span>
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                    )}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                </div>
                <div className="pt-1 text-right">
                  <span className={cn(
                    'text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border inline-flex items-center gap-1',
                    isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                  )}>
                    {isSelected ? '✓ Selected' : <>Select <ArrowRight className="w-2.5 h-2.5 inline" /></>}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Internal Paint Grade */}
      <section className="space-y-3">
        <div className="flex justify-between items-center text-xs font-extrabold text-slate-800">
          <span className="uppercase tracking-widest text-slate-700">Interior Wall &amp; Ceiling Paint (~{interiorAreaSqFt.toLocaleString()} Sq Ft)</span>
          <span className="text-blue-600 font-extrabold">
            {interiorCost > 0 ? `Total: ${formatCurrency(interiorCost)}` : ''}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {internalOptions.map((opt) => {
            const isSelected = painting.internalPaint === opt.id;
            const optCost = Math.round(interiorAreaSqFt * opt.ratePerSqFt);
            return (
              <Card
                key={opt.id}
                onClick={() => setPaintingSelection(opt.id, painting.externalPaint, painting.brand)}
                className={cn(
                  'p-4 cursor-pointer border transition-all space-y-2 rounded-2xl flex flex-col justify-between',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-extrabold text-slate-900">{opt.title}</h4>
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                      )}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{opt.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-900">₹{opt.ratePerSqFt}/sq ft ({formatCurrency(optCost)})</span>
                  <span className={cn(
                    'text-[10px] font-extrabold px-2 py-0.5 rounded-lg border inline-flex items-center gap-1',
                    isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                  )}>
                    {isSelected ? '✓ Selected' : 'Select'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* External Paint Grade */}
      <section className="space-y-3">
        <div className="flex justify-between items-center text-xs font-extrabold text-slate-800">
          <span className="uppercase tracking-widest text-slate-700">Exterior Weather Guard Paint (~{exteriorAreaSqFt.toLocaleString()} Sq Ft)</span>
          <span className="text-blue-600 font-extrabold">
            {exteriorCost > 0 ? `Total: ${formatCurrency(exteriorCost)}` : ''}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {externalOptions.map((opt) => {
            const isSelected = painting.externalPaint === opt.id;
            const optCost = Math.round(exteriorAreaSqFt * opt.ratePerSqFt);
            return (
              <Card
                key={opt.id}
                onClick={() => setPaintingSelection(painting.internalPaint, opt.id, painting.brand)}
                className={cn(
                  'p-4 cursor-pointer border transition-all space-y-2 rounded-2xl flex flex-col justify-between',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-extrabold text-slate-900">{opt.title}</h4>
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                      )}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{opt.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-900">₹{opt.ratePerSqFt}/sq ft ({formatCurrency(optCost)})</span>
                  <span className={cn(
                    'text-[10px] font-extrabold px-2 py-0.5 rounded-lg border inline-flex items-center gap-1',
                    isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                  )}>
                    {isSelected ? '✓ Selected' : 'Select'}
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
