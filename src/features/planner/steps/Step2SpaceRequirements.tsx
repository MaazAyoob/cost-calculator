import React, { useState } from 'react';
import { useWizardStore, RoomCounts } from '../../../store/useWizardStore';
import {
  ShieldAlert,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { HowWeCalculatedThis } from '../../../components/common/HowWeCalculatedThis';

export const Step2SpaceRequirements: React.FC = () => {
  const { rooms, liftRequired, floors, updateRoomCount, setLiftRequired } = useWizardStore();
  const [showAncillary, setShowAncillary] = useState(false);

  const primaryRooms: {
    key: keyof RoomCounts;
    label: string;
    sub: string;
  }[] = [
    { key: 'bedrooms', label: 'Bedrooms', sub: 'Primary sleeping quarters' },
    { key: 'bathrooms', label: 'Attached Bathrooms', sub: 'En-suite toilet & shower' },
    { key: 'commonToilets', label: 'Common Powder / Toilets', sub: 'Guest & common washrooms' },
    { key: 'living', label: 'Living Rooms / Lounge', sub: 'Formal & family living areas' },
    { key: 'kitchen', label: 'Kitchens', sub: 'Main cooking & prep area' },
    { key: 'dining', label: 'Dining Areas', sub: 'Family dining spaces' },
    { key: 'balcony', label: 'Balconies & Sit-outs', sub: 'Outdoor covered sit-outs' },
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

  const handleStepDelta = (key: keyof RoomCounts, delta: number) => {
    const currentVal = rooms[key] || 0;
    const target = currentVal + delta;
    if (target > 10) return; // Maximum ceiling of 10
    if (target < 0) return; // Minimum floor of 0
    updateRoomCount(key, delta);
  };

  const ancillaryCountTotal =
    (rooms.pooja || 0) + (rooms.utility || 0) + (rooms.office || 0) + (rooms.storeRoom || 0);

  return (
    <div className="space-y-6 text-left select-none pb-4">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 02
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading leading-tight">
          CONFIGURE YOUR HOME
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Allocate rooms and vertical circulation. Quantities for doors, windows, and fixtures adjust automatically.
        </p>
      </div>

      {/* ── 1. PRIMARY LIVING SPACES (+ / - STEPPERS UP TO 10) ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
            Living Spaces
          </label>
          <span className="text-[10px] text-[#4B5563] font-mono">Up to 10 for each option</span>
        </div>
        
        <div className="space-y-2">
          {primaryRooms.map((item) => {
            const currentCount = rooms[item.key] || 0;

            return (
              <div
                key={item.key}
                className={cn(
                  'hutty-tactile-card py-3 px-4 flex items-center justify-between transition-all',
                  currentCount > 0 && 'border-[#1B3D34]/30 bg-white'
                )}
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1B3D34]">{item.label}</h4>
                  <p className="text-[10px] sm:text-[11px] text-[#4B5563]">{item.sub}</p>
                </div>

                {/* Tactile + / - Stepper (0 to 10) */}
                <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-[#F8F8F6] p-1 shadow-2xs">
                  <button
                    type="button"
                    disabled={currentCount <= 0}
                    onClick={() => handleStepDelta(item.key, -1)}
                    className="w-8 h-8 rounded-lg bg-white text-[#1B3D34] font-extrabold text-sm flex items-center justify-center border border-[#E5E7EB] hover:bg-gray-50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
                    title={`Decrease ${item.label}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-10 text-center text-sm font-black font-mono text-[#1B3D34]">
                    {currentCount}
                  </span>

                  <button
                    type="button"
                    disabled={currentCount >= 10}
                    onClick={() => handleStepDelta(item.key, 1)}
                    className="w-8 h-8 rounded-lg bg-white text-[#1B3D34] font-extrabold text-sm flex items-center justify-center border border-[#E5E7EB] hover:bg-gray-50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
                    title={`Increase ${item.label} (up to 10)`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. SPECIALIZED SPACES (Expandable) ── */}
      <div className="pt-2 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setShowAncillary(!showAncillary)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#1B3D34] py-2 cursor-pointer hover:text-[#1B3D34]"
        >
          <span className="flex items-center gap-2">
            <span>Specialized Spaces (Pooja, Utility, Study, Store)</span>
            {ancillaryCountTotal > 0 && (
              <span className="text-[10px] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded-md font-mono font-bold text-[#1B3D34]">
                {ancillaryCountTotal} Selected
              </span>
            )}
          </span>
          {showAncillary ? <ChevronUp className="w-4 h-4 text-[#4B5563]" /> : <ChevronDown className="w-4 h-4 text-[#4B5563]" />}
        </button>

        {showAncillary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {ancillaryRooms.map((item) => {
              const count = rooms[item.key] || 0;
              return (
                <div
                  key={item.key}
                  className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-[#1B3D34]">{item.label}</span>
                  <div className="flex items-center border border-[#E5E7EB] rounded-lg bg-white p-0.5 shadow-2xs">
                    <button
                      type="button"
                      disabled={count <= 0}
                      onClick={() => updateRoomCount(item.key, -1)}
                      className="w-7 h-7 text-[#1B3D34] font-bold text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-[#1B3D34] font-mono">{count}</span>
                    <button
                      type="button"
                      disabled={count >= 10}
                      onClick={() => updateRoomCount(item.key, 1)}
                      className="w-7 h-7 text-[#1B3D34] font-bold text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 3. VERTICAL CIRCULATION (Elevator vs Staircase) ── */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Vertical Circulation
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <div
            onClick={() => setLiftRequired(true)}
            className={cn(
              'hutty-tactile-card cursor-pointer',
              liftRequired && 'hutty-tactile-card-selected'
            )}
          >
            <div className="flex justify-between items-center text-xs font-bold text-[#1B3D34]">
              <span>Passenger Elevator</span>
              {liftRequired && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
            </div>
            <p className="text-[10px] text-[#4B5563] mt-0.5">RCC lift shaft, pit &amp; machine headroom</p>
          </div>

          <div
            onClick={() => {
              if (floors >= 4) return;
              setLiftRequired(false);
            }}
            className={cn(
              'hutty-tactile-card cursor-pointer',
              !liftRequired && 'hutty-tactile-card-selected',
              floors >= 4 && 'opacity-50 cursor-not-allowed bg-gray-50'
            )}
          >
            <div className="flex justify-between items-center text-xs font-bold text-[#1B3D34]">
              <span>Staircase Only</span>
              {!liftRequired && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
            </div>
            <p className="text-[10px] text-[#4B5563] mt-0.5">Continuous vertical RCC stairway</p>
          </div>
        </div>

        {floors >= 4 && (
          <div className="p-2.5 bg-white rounded-xl border border-[#F28C28] flex items-center gap-2 text-xs text-[#1B3D34]">
            <ShieldAlert className="w-4 h-4 text-[#F28C28] shrink-0" />
            <span>NBC bylaws mandate passenger elevator provision for G+3 or higher storeys.</span>
          </div>
        )}
      </div>

      {/* ── CALCULATION TRANSPARENCY: SPACE REQUIREMENTS ── */}
      <HowWeCalculatedThis stepKey="space" className="mt-4" />

    </div>
  );
};
