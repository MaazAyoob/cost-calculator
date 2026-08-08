import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { Card } from '../../../components/ui/Card';
import { Layers, Check, ArrowRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Step5WallCladding: React.FC = () => {
  const { wallCladding, setWallCladding } = useWizardStore();

  const kitchenDadoOptions: { value: '2 ft' | '4 ft'; title: string; desc: string }[] = [
    { value: '2 ft', title: '2 Ft Standard Counter Dado', desc: 'Standard splashback height above kitchen granite counter.' },
    { value: '4 ft', title: '4 Ft Extended Dado Height', desc: 'Full high-splash protection extended to wall cabinets.' },
  ];

  const bathroomHeightOptions: { value: '7 ft (Lintel)' | 'Full Height (Ceiling)'; title: string; desc: string }[] = [
    { value: '7 ft (Lintel)', title: '7 Ft Lintel Level', desc: 'Standard tile cladding up to door lintel level with painted upper band.' },
    { value: 'Full Height (Ceiling)', title: 'Full Height to Ceiling (9-10 Ft)', desc: 'Seamless floor-to-ceiling tile cladding for modern luxury moisture protection.' },
  ];

  return (
    <div className="space-y-8 py-2">
      {/* Header Intro */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Wall Cladding Specifications</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Configure wall tile cladding heights for kitchen and bathroom wet areas.
        </p>
      </div>

      {/* 1. Kitchen Dado */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Kitchen Counter Dado Height</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {kitchenDadoOptions.map((opt) => {
            const isSelected = wallCladding.kitchenDadoHeight === opt.value;
            return (
              <Card
                key={opt.value}
                onClick={() => setWallCladding(opt.value, wallCladding.bathroomTileHeight)}
                className={cn(
                  'p-5 cursor-pointer border transition-all space-y-3 rounded-2xl',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-extrabold text-slate-900">{opt.title}</h4>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                <div className="pt-2 border-t border-slate-100 flex justify-end">
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

      {/* 2. Bathroom Tile Height */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Bathroom Wall Tile Height</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bathroomHeightOptions.map((opt) => {
            const isSelected = wallCladding.bathroomTileHeight === opt.value;
            return (
              <Card
                key={opt.value}
                onClick={() => setWallCladding(wallCladding.kitchenDadoHeight, opt.value)}
                className={cn(
                  'p-5 cursor-pointer border transition-all space-y-3 rounded-2xl',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-extrabold text-slate-900">{opt.title}</h4>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                <div className="pt-2 border-t border-slate-100 flex justify-end">
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
