import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { Check } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Step5WallCladding: React.FC = () => {
  const { wallCladding, setWallCladding } = useWizardStore();

  const kitchenDadoOptions: { value: '2 ft' | '4 ft'; title: string; desc: string }[] = [
    { value: '2 ft', title: '2 Ft Standard Counter Dado', desc: 'Standard splashback height above kitchen counter.' },
    { value: '4 ft', title: '4 Ft Extended Dado Height', desc: 'Full high-splash protection up to wall cabinets.' },
  ];

  const bathroomHeightOptions: { value: '7 ft (Lintel)' | 'Full Height (Ceiling)'; title: string; desc: string }[] = [
    { value: '7 ft (Lintel)', title: '7 Ft Lintel Level', desc: 'Standard tile cladding up to door lintel level.' },
    { value: 'Full Height (Ceiling)', title: 'Full Height to Ceiling (9-10 Ft)', desc: 'Seamless floor-to-ceiling moisture protection.' },
  ];

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1 pb-1 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 05
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading">
          Wall Cladding &amp; Dado
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Configure wall tile cladding heights for kitchen splash zones and bathroom wet areas.
        </p>
      </div>

      {/* 1. Kitchen Dado */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Kitchen Dado Height
        </label>
        <div className="grid grid-cols-2 gap-2">
          {kitchenDadoOptions.map((opt) => {
            const isSelected = wallCladding.kitchenDadoHeight === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => setWallCladding(opt.value, wallCladding.bathroomTileHeight)}
                className={cn(
                  'p-3 rounded-xl border transition-all cursor-pointer space-y-0.5 text-left',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] ring-1 ring-[#1B3D34]'
                    : 'bg-white border-[#E5E7EB] hover:bg-[#F8F8F6]'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#1B3D34]">{opt.title}</h4>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
                </div>
                <p className="text-[10px] text-[#4B5563]">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Bathroom Tile Height */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Bathroom Wall Tile Height
        </label>
        <div className="grid grid-cols-2 gap-2">
          {bathroomHeightOptions.map((opt) => {
            const isSelected = wallCladding.bathroomTileHeight === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => setWallCladding(wallCladding.kitchenDadoHeight, opt.value)}
                className={cn(
                  'p-3 rounded-xl border transition-all cursor-pointer space-y-0.5 text-left',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] ring-1 ring-[#1B3D34]'
                    : 'bg-white border-[#E5E7EB] hover:bg-[#F8F8F6]'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#1B3D34]">{opt.title}</h4>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
                </div>
                <p className="text-[10px] text-[#4B5563]">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
