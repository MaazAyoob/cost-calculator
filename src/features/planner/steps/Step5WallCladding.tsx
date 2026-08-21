import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { Check } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Step5WallCladding: React.FC = () => {
  const { wallCladding, setWallCladding } = useWizardStore();

  const kitchenDadoOptions: { value: '2 ft' | '4 ft'; title: string; desc: string }[] = [
    { value: '2 ft', title: '2 Ft Standard Counter Dado', desc: 'Standard splashback height above kitchen granite counter.' },
    { value: '4 ft', title: '4 Ft Extended Dado Height', desc: 'Full high-splash protection extended to wall cabinets.' },
  ];

  const bathroomHeightOptions: { value: '7 ft (Lintel)' | 'Full Height (Ceiling)'; title: string; desc: string }[] = [
    { value: '7 ft (Lintel)', title: '7 Ft Lintel Level', desc: 'Standard tile cladding up to door lintel level with painted upper band.' },
    { value: 'Full Height (Ceiling)', title: 'Full Height to Ceiling (9-10 Ft)', desc: 'Seamless floor-to-ceiling tile cladding for modern moisture protection.' },
  ];

  return (
    <div className="space-y-8 text-left select-none">
      {/* Editorial Step Header */}
      <div className="space-y-1">
        <span className="text-xs font-mono font-bold tracking-widest text-[#1B3D34] uppercase block">
          STEP 05
        </span>
        <h2 className="heading-sm text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight">
          Wall Cladding
        </h2>
        <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
          Configure wall tile cladding heights for kitchen and bathroom wet areas.
        </p>
      </div>

      {/* 1. Kitchen Dado */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Kitchen Counter Dado Height
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {kitchenDadoOptions.map((opt) => {
            const isSelected = wallCladding.kitchenDadoHeight === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => setWallCladding(opt.value, wallCladding.bathroomTileHeight)}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer space-y-1 text-left',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#1B3D34]">{opt.title}</h4>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#1B3D34] text-white flex items-center justify-center text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#4B5563] leading-relaxed">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Bathroom Tile Height */}
      <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Bathroom Wall Tile Height
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bathroomHeightOptions.map((opt) => {
            const isSelected = wallCladding.bathroomTileHeight === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => setWallCladding(wallCladding.kitchenDadoHeight, opt.value)}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer space-y-1 text-left',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#1B3D34]">{opt.title}</h4>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#1B3D34] text-white flex items-center justify-center text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#4B5563] leading-relaxed">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
