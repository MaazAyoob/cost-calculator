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
    { label: 'Premium Teak', rate: 65000, desc: 'First-grade Burma Teakwood carved frame and solid shutter.' },
    { label: 'Normal Teak', rate: 42000, desc: 'Commercial Teakwood frame with veneer panel shutter.' },
  ];

  const internalDoorOptions: { label: 'Flush Door' | 'Laminate Door'; rate: number; desc: string }[] = [
    { label: 'Flush Door', rate: 12500, desc: 'Hardwood core flush doors with hardwood frame.' },
    { label: 'Laminate Door', rate: 16500, desc: 'Pre-laminated designer shutters with wooden frame.' },
  ];

  const bathroomDoorOptions: { label: 'WPC Door' | 'FRP / ERP Door'; rate: number; desc: string }[] = [
    { label: 'WPC Door', rate: 11000, desc: '100% Waterproof & termite-proof composite doors.' },
    { label: 'FRP / ERP Door', rate: 8500, desc: 'Fiberglass Reinforced Polymer molded doors.' },
  ];

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1 pb-1 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 06
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading">
          Doors &amp; Joinery
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Select joinery specifications for entrance, interior bedroom, and bathroom doors.
        </p>
      </div>

      {/* 1. Main Door */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Main Entrance Door ({mainCount} Set)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {mainDoorOptions.map((opt) => {
            const isSelected = doors.mainDoor === opt.label;
            return (
              <div
                key={opt.label}
                onClick={() => setDoorSelection('mainDoor', opt.label)}
                className={cn(
                  'p-3 rounded-xl border transition-all cursor-pointer space-y-0.5 text-left',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] ring-1 ring-[#1B3D34]'
                    : 'bg-white border-[#E5E7EB] hover:bg-[#F8F8F6]'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#1B3D34]">{opt.label}</h4>
                  <span className="text-xs font-bold text-[#1B3D34] font-mono">{formatCurrency(opt.rate)}</span>
                </div>
                <p className="text-[10px] text-[#4B5563]">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Internal Doors */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Internal Room Doors (~{internalCount} Sets)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {internalDoorOptions.map((opt) => {
            const isSelected = doors.internalDoor === opt.label;
            return (
              <div
                key={opt.label}
                onClick={() => setDoorSelection('internalDoor', opt.label)}
                className={cn(
                  'p-3 rounded-xl border transition-all cursor-pointer space-y-0.5 text-left',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] ring-1 ring-[#1B3D34]'
                    : 'bg-white border-[#E5E7EB] hover:bg-[#F8F8F6]'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#1B3D34]">{opt.label}</h4>
                  <span className="text-xs font-bold text-[#1B3D34] font-mono">{formatCurrency(opt.rate)}</span>
                </div>
                <p className="text-[10px] text-[#4B5563]">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Bathroom Doors */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Bathroom Doors (~{bathroomCount} Sets)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {bathroomDoorOptions.map((opt) => {
            const isSelected = doors.bathroomDoor === opt.label;
            return (
              <div
                key={opt.label}
                onClick={() => setDoorSelection('bathroomDoor', opt.label)}
                className={cn(
                  'p-3 rounded-xl border transition-all cursor-pointer space-y-0.5 text-left',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] ring-1 ring-[#1B3D34]'
                    : 'bg-white border-[#E5E7EB] hover:bg-[#F8F8F6]'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#1B3D34]">{opt.label}</h4>
                  <span className="text-xs font-bold text-[#1B3D34] font-mono">{formatCurrency(opt.rate)}</span>
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
