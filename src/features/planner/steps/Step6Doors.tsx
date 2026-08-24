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
    { label: 'Premium Teak', rate: 65000, desc: 'First-grade Burma Teakwood carved frame with solid wood shutter.' },
    { label: 'Normal Teak', rate: 42000, desc: 'Commercial Teakwood frame with veneered panel designer shutter.' },
  ];

  const internalDoorOptions: { label: 'Flush Door' | 'Laminate Door'; rate: number; desc: string }[] = [
    { label: 'Flush Door', rate: 12500, desc: 'Solid hardwood core flush doors with hardwood frame.' },
    { label: 'Laminate Door', rate: 16500, desc: 'Factory pre-laminated designer shutters with wooden frame.' },
  ];

  const bathroomDoorOptions: { label: 'WPC Door' | 'FRP / ERP Door'; rate: number; desc: string }[] = [
    { label: 'WPC Door', rate: 11000, desc: '100% Waterproof & termite-proof Wood Plastic Composite doors.' },
    { label: 'FRP / ERP Door', rate: 8500, desc: 'Fiberglass Reinforced Polymer waterproof molded doors.' },
  ];

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 06
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading leading-tight">
          DOORS &amp; JOINERY
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Select joinery specifications for entrance, interior bedroom, and bathroom doors.
        </p>
      </div>

      {/* ── 1. MAIN ENTRANCE DOOR ── */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            Main Entrance Door ({mainCount} Set)
          </label>
          <span className="font-mono text-[#4B5563] text-[11px]">Grand entrance frame</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {mainDoorOptions.map((opt) => {
            const isSelected = doors.mainDoor === opt.label;
            return (
              <div
                key={opt.label}
                onClick={() => setDoorSelection('mainDoor', opt.label)}
                className={cn(
                  'hutty-tactile-card space-y-1',
                  isSelected && 'hutty-tactile-card-selected'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold text-[#1B3D34]">{opt.label}</h4>
                  <span className="text-xs font-extrabold text-[#1B3D34] font-mono">{formatCurrency(opt.rate)}</span>
                </div>
                <p className="text-[10px] text-[#4B5563] leading-relaxed">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. INTERNAL ROOM DOORS ── */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            Internal Room Doors (~{internalCount} Sets)
          </label>
          <span className="font-mono text-[#4B5563] text-[11px]">Bedrooms &amp; Study</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {internalDoorOptions.map((opt) => {
            const isSelected = doors.internalDoor === opt.label;
            return (
              <div
                key={opt.label}
                onClick={() => setDoorSelection('internalDoor', opt.label)}
                className={cn(
                  'hutty-tactile-card space-y-1',
                  isSelected && 'hutty-tactile-card-selected'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold text-[#1B3D34]">{opt.label}</h4>
                  <span className="text-xs font-extrabold text-[#1B3D34] font-mono">{formatCurrency(opt.rate)}</span>
                </div>
                <p className="text-[10px] text-[#4B5563] leading-relaxed">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. BATHROOM DOORS ── */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            Bathroom Doors (~{bathroomCount} Sets)
          </label>
          <span className="font-mono text-[#4B5563] text-[11px]">Moisture proof</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {bathroomDoorOptions.map((opt) => {
            const isSelected = doors.bathroomDoor === opt.label;
            return (
              <div
                key={opt.label}
                onClick={() => setDoorSelection('bathroomDoor', opt.label)}
                className={cn(
                  'hutty-tactile-card space-y-1',
                  isSelected && 'hutty-tactile-card-selected'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold text-[#1B3D34]">{opt.label}</h4>
                  <span className="text-xs font-extrabold text-[#1B3D34] font-mono">{formatCurrency(opt.rate)}</span>
                </div>
                <p className="text-[10px] text-[#4B5563] leading-relaxed">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
