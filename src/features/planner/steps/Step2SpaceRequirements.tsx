import React from 'react';
import { useWizardStore, RoomCounts } from '../../../store/useWizardStore';
import { Bed, Bath, Utensils, Tv, Sun, ShieldAlert, Check } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Step2SpaceRequirements: React.FC = () => {
  const { rooms, liftRequired, floors, updateRoomCount, setLiftRequired } = useWizardStore();

  const roomItems: { key: keyof RoomCounts; label: string; min: number; max: number; icon: React.ReactNode }[] = [
    { key: 'bedrooms', label: 'Bedrooms', min: 0, max: 10, icon: <Bed className="w-4 h-4 text-[#1B3D34]" /> },
    { key: 'bathrooms', label: 'Attached Bathrooms', min: 0, max: 12, icon: <Bath className="w-4 h-4 text-[#1B3D34]" /> },
    { key: 'commonToilets', label: 'Common Toilets', min: 0, max: 4, icon: <Bath className="w-4 h-4 text-[#4B5563]" /> },
    { key: 'kitchen', label: 'Kitchens', min: 0, max: 4, icon: <Utensils className="w-4 h-4 text-[#1B3D34]" /> },
    { key: 'dining', label: 'Dining Areas', min: 0, max: 4, icon: <Utensils className="w-4 h-4 text-[#4B5563]" /> },
    { key: 'living', label: 'Living Rooms', min: 0, max: 4, icon: <Tv className="w-4 h-4 text-[#1B3D34]" /> },
    { key: 'balcony', label: 'Balconies', min: 0, max: 8, icon: <Sun className="w-4 h-4 text-[#4B5563]" /> },
  ];

  return (
    <div className="space-y-8 text-left select-none">
      {/* Editorial Step Header */}
      <div className="space-y-1">
        <span className="text-xs font-mono font-bold tracking-widest text-[#1B3D34] uppercase block">
          STEP 02
        </span>
        <h2 className="heading-sm text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight">
          Space Requirements
        </h2>
        <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
          Specify room counts and vertical transit requirements for your home.
        </p>
      </div>

      {/* Room Steppers Grid */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Room Allocations
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roomItems.map((item) => {
            const val = rooms[item.key] || 0;
            return (
              <div
                key={item.key}
                className="p-3.5 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between shadow-2xs hover:border-[#D1D5DB] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F8F8F6] flex items-center justify-center border border-[#E5E7EB]">
                    {item.icon}
                  </div>
                  <h4 className="text-xs font-bold text-[#1B3D34]">{item.label}</h4>
                </div>

                {/* Touch Stepper */}
                <div className="flex items-center border border-[#E5E7EB] rounded-lg bg-[#F8F8F6] overflow-hidden">
                  <button
                    type="button"
                    disabled={val <= item.min}
                    onClick={() => updateRoomCount(item.key, -1)}
                    className="w-7 h-7 bg-white hover:bg-[rgba(27,61,52,0.04)] text-[#1B3D34] font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[#1B3D34] font-mono">{val}</span>
                  <button
                    type="button"
                    disabled={val >= item.max}
                    onClick={() => updateRoomCount(item.key, 1)}
                    className="w-7 h-7 bg-white hover:bg-[rgba(27,61,52,0.04)] text-[#1B3D34] font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Elevator Section */}
      <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Elevator Provision
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setLiftRequired(true)}
            className={cn(
              'p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-0.5',
              liftRequired
                ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] shadow-xs'
                : 'bg-white border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
            )}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#1B3D34]">Elevator Required</span>
              {liftRequired && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
            </div>
            <span className="text-[11px] text-[#4B5563] block">RCC Shaft &amp; 3-Phase Machine</span>
          </div>

          <div
            onClick={() => {
              if (floors >= 4) return;
              setLiftRequired(false);
            }}
            className={cn(
              'p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-0.5',
              !liftRequired
                ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] shadow-xs'
                : floors >= 4
                ? 'bg-[#F8F8F6] border-[#E5E7EB] opacity-50 cursor-not-allowed'
                : 'bg-white border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
            )}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#1B3D34]">Staircase Only</span>
              {!liftRequired && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
            </div>
            <span className="text-[11px] text-[#4B5563] block">Standard vertical stairway</span>
          </div>
        </div>

        {floors >= 4 && (
          <div className="p-2.5 bg-white rounded-lg border border-[#F28C28] flex items-center gap-2 text-xs text-[#1B3D34]">
            <ShieldAlert className="w-4 h-4 text-[#F28C28] shrink-0" />
            <span>G+3 or higher storeys include elevator shaft provision per NBC guidelines.</span>
          </div>
        )}
      </div>

    </div>
  );
};
