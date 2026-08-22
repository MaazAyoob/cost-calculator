import React, { useState } from 'react';
import { useWizardStore, RoomCounts } from '../../../store/useWizardStore';
import {
  Bed,
  Bath,
  Utensils,
  Tv,
  Sun,
  ShieldAlert,
  Check,
  Briefcase,
  Sparkles,
  Package,
  WashingMachine,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Step2SpaceRequirements: React.FC = () => {
  const { rooms, liftRequired, floors, updateRoomCount, setLiftRequired } = useWizardStore();
  const [showAncillary, setShowAncillary] = useState(false);

  const primaryRooms: {
    key: keyof RoomCounts;
    label: string;
    options: number[];
  }[] = [
    { key: 'bedrooms', label: 'Bedrooms', options: [1, 2, 3, 4, 5, 6] },
    { key: 'bathrooms', label: 'Attached Bathrooms', options: [1, 2, 3, 4, 5, 6] },
    { key: 'commonToilets', label: 'Common Powder / Toilets', options: [0, 1, 2, 3] },
    { key: 'living', label: 'Living Rooms / Lounge', options: [1, 2, 3, 4] },
    { key: 'kitchen', label: 'Kitchens', options: [1, 2, 3] },
    { key: 'dining', label: 'Dining Areas', options: [1, 2, 3] },
    { key: 'balcony', label: 'Balconies & Sit-outs', options: [0, 1, 2, 3, 4] },
  ];

  const ancillaryRooms: {
    key: keyof RoomCounts;
    label: string;
  }[] = [
    { key: 'pooja', label: 'Pooja Room' },
    { key: 'utility', label: 'Utility / Wash Yard' },
    { key: 'office', label: 'Study / Home Office' },
    { key: 'storeRoom', label: 'Store / Pantry' },
  ];

  const handleSetExactCount = (key: keyof RoomCounts, count: number) => {
    const currentVal = rooms[key] || 0;
    const delta = count - currentVal;
    if (delta !== 0) {
      updateRoomCount(key, delta);
    }
  };

  const ancillaryCountTotal =
    (rooms.pooja || 0) + (rooms.utility || 0) + (rooms.office || 0) + (rooms.storeRoom || 0);

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1 pb-1 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 02
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading">
          Shape your home
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Allocate rooms and vertical transit. Hutty automatically dimensions doors, windows, and MEP.
        </p>
      </div>

      {/* ── CORE LIVING SPACES ── */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Living Spaces
        </label>
        
        <div className="space-y-1.5">
          {primaryRooms.map((item) => {
            const currentCount = rooms[item.key] || 0;
            return (
              <div
                key={item.key}
                className="py-2 px-3 bg-white hover:bg-[#F8F8F6] border border-[#E5E7EB] rounded-xl flex items-center justify-between transition-colors"
              >
                <span className="text-xs font-bold text-[#1B3D34]">{item.label}</span>

                {/* Number Pill Selector */}
                <div className="flex items-center gap-1 bg-[#F8F8F6] p-0.5 rounded-lg border border-[#E5E7EB]">
                  {item.options.map((opt) => {
                    const isSelected = currentCount === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSetExactCount(item.key, opt)}
                        className={cn(
                          'w-6 h-6 rounded text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center',
                          isSelected
                            ? 'bg-[#1B3D34] text-white shadow-xs'
                            : 'text-[#4B5563] hover:text-[#1B3D34] hover:bg-white'
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ANCILLARY & SPECIALIZED SPACES (Expandable) ── */}
      <div className="pt-2 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setShowAncillary(!showAncillary)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#1B3D34] py-1.5 cursor-pointer hover:text-[#1B3D34]"
        >
          <span className="flex items-center gap-1.5">
            <span>Specialized Spaces (Pooja, Utility, Study, Store)</span>
            {ancillaryCountTotal > 0 && (
              <span className="text-[10px] bg-[rgba(27,61,52,0.08)] px-1.5 py-0.2 rounded font-mono text-[#1B3D34]">
                {ancillaryCountTotal} Added
              </span>
            )}
          </span>
          {showAncillary ? <ChevronUp className="w-4 h-4 text-[#4B5563]" /> : <ChevronDown className="w-4 h-4 text-[#4B5563]" />}
        </button>

        {showAncillary && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {ancillaryRooms.map((item) => {
              const count = rooms[item.key] || 0;
              return (
                <div
                  key={item.key}
                  className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-[#1B3D34]">{item.label}</span>
                  <div className="flex items-center border border-[#E5E7EB] rounded-lg bg-white overflow-hidden">
                    <button
                      type="button"
                      disabled={count <= 0}
                      onClick={() => updateRoomCount(item.key, -1)}
                      className="w-5 h-5 text-[#1B3D34] font-bold text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-[#1B3D34] font-mono">{count}</span>
                    <button
                      type="button"
                      disabled={count >= 3}
                      onClick={() => updateRoomCount(item.key, 1)}
                      className="w-5 h-5 text-[#1B3D34] font-bold text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ELEVATOR SECTION ── */}
      <div className="space-y-1.5 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Vertical Transit
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setLiftRequired(true)}
            className={cn(
              'p-2.5 rounded-xl border transition-all cursor-pointer text-left',
              liftRequired
                ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] ring-1 ring-[#1B3D34]'
                : 'bg-white border-[#E5E7EB] hover:bg-[#F8F8F6]'
            )}
          >
            <div className="flex justify-between items-center text-xs font-bold text-[#1B3D34]">
              <span>Elevator Required</span>
              {liftRequired && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
            </div>
            <span className="text-[10px] text-[#4B5563] block">RCC shaft &amp; machine room</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (floors >= 4) return;
              setLiftRequired(false);
            }}
            className={cn(
              'p-2.5 rounded-xl border transition-all cursor-pointer text-left',
              !liftRequired
                ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] ring-1 ring-[#1B3D34]'
                : floors >= 4
                ? 'bg-[#F8F8F6] border-[#E5E7EB] opacity-50 cursor-not-allowed'
                : 'bg-white border-[#E5E7EB] hover:bg-[#F8F8F6]'
            )}
          >
            <div className="flex justify-between items-center text-xs font-bold text-[#1B3D34]">
              <span>Staircase Only</span>
              {!liftRequired && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
            </div>
            <span className="text-[10px] text-[#4B5563] block">Standard vertical stairway</span>
          </button>
        </div>

        {floors >= 4 && (
          <div className="p-2 bg-white rounded-lg border border-[#F28C28] flex items-center gap-1.5 text-xs text-[#1B3D34]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#F28C28] shrink-0" />
            <span>G+3 or higher storeys include elevator shaft provision per NBC guidelines.</span>
          </div>
        )}
      </div>

    </div>
  );
};
