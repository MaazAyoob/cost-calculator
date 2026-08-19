import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { Check } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step6Doors: React.FC = () => {
  const { doors, setDoorSelection } = useWizardStore();
  const quantities = useQuantities();

  const mainCount = quantities.mainDoorsCount || 1;
  const internalCount = quantities.internalDoorsCount || 4;
  const bathroomCount = quantities.bathroomDoorsCount || 3;

  const mainDoorOptions: { label: 'Premium Teak' | 'Normal Teak'; rate: number; desc: string }[] = [
    { label: 'Premium Teak', rate: 65000, desc: 'First-grade Burma Teakwood carved frame and shutter.' },
    { label: 'Normal Teak', rate: 42000, desc: 'Commercial Teakwood frame with veneer panel shutter.' },
  ];

  const internalDoorOptions: { label: 'Flush Door' | 'Laminate Door'; rate: number; desc: string }[] = [
    { label: 'Flush Door', rate: 12500, desc: 'Hardwood core flush doors with hardwood frame.' },
    { label: 'Laminate Door', rate: 16500, desc: 'Pre-laminated designer shutters with matching wooden frame.' },
  ];

  const bathroomDoorOptions: { label: 'WPC Door' | 'FRP / ERP Door'; rate: number; desc: string }[] = [
    { label: 'WPC Door', rate: 11000, desc: '100% Waterproof & termite-proof composite doors.' },
    { label: 'FRP / ERP Door', rate: 8500, desc: 'Fiberglass Reinforced Polymer molded waterproof doors.' },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Editorial Step Header */}
      <div className="space-y-1">
        <span className="text-xs font-mono font-bold tracking-widest text-[#1F4B43] uppercase block">
          STEP 06
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          Doors &amp; Joinery
        </h2>
        <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
          Select material specifications for entrance, room, and bathroom doors.
        </p>
      </div>

      {/* 1. Main Door */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#172033] uppercase tracking-wider block">
          Main Entrance Door ({mainCount} Set)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mainDoorOptions.map((opt) => {
            const isSelected = doors.mainDoor === opt.label;
            return (
              <div
                key={opt.label}
                onClick={() => setDoorSelection('mainDoor', opt.label)}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer space-y-1 text-left',
                  isSelected
                    ? 'bg-[#EBF2F0] border-[#1F4B43] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:border-slate-300'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#172033]">{opt.label}</h4>
                  <span className="text-xs font-bold text-[#1F4B43]">{formatCurrency(opt.rate)}</span>
                </div>
                <p className="text-[11px] text-[#667085]">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Internal Doors */}
      <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#172033] uppercase tracking-wider block">
          Internal Room Doors (~{internalCount} Sets)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {internalDoorOptions.map((opt) => {
            const isSelected = doors.internalDoor === opt.label;
            return (
              <div
                key={opt.label}
                onClick={() => setDoorSelection('internalDoor', opt.label)}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer space-y-1 text-left',
                  isSelected
                    ? 'bg-[#EBF2F0] border-[#1F4B43] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:border-slate-300'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#172033]">{opt.label}</h4>
                  <span className="text-xs font-bold text-[#1F4B43]">{formatCurrency(opt.rate)}</span>
                </div>
                <p className="text-[11px] text-[#667085]">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Bathroom Doors */}
      <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#172033] uppercase tracking-wider block">
          Bathroom Doors (~{bathroomCount} Sets)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bathroomDoorOptions.map((opt) => {
            const isSelected = doors.bathroomDoor === opt.label;
            return (
              <div
                key={opt.label}
                onClick={() => setDoorSelection('bathroomDoor', opt.label)}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer space-y-1 text-left',
                  isSelected
                    ? 'bg-[#EBF2F0] border-[#1F4B43] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:border-slate-300'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#172033]">{opt.label}</h4>
                  <span className="text-xs font-bold text-[#1F4B43]">{formatCurrency(opt.rate)}</span>
                </div>
                <p className="text-[11px] text-[#667085]">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
