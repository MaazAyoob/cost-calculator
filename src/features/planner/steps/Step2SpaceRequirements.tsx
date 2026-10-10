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
import { motion, AnimatePresence } from 'framer-motion';
import { accordionVariant } from '../../../animations/variants';

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
    <div className="space-y-6 text-left pb-4">
      


      {/* ── 1. PRIMARY LIVING SPACES (+ / - STEPPERS UP TO 10, RESPONSIVE 2-COLUMN) ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#172722] uppercase tracking-wider block">
            Living Spaces
          </label>
          <span className="text-[10px] text-[#687770] font-mono">Up to 10 each · Doors &amp; MEP auto-scale</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {primaryRooms.map((item) => {
            const currentCount = rooms[item.key] || 0;

            return (
              <div
                key={item.key}
                className={cn(
                  'p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 bg-white shadow-2xs',
                  currentCount > 0
                    ? 'border-[#1B3D34] bg-[#F7FAF7]'
                    : 'border-[#E3E8E2] hover:border-[#1B3D34]/30'
                )}
              >
                <div className="min-w-0 pr-1">
                  <h4 className="text-xs sm:text-sm font-bold text-[#172722] truncate">{item.label}</h4>
                  <p className="text-[10px] sm:text-[11px] text-[#687770] truncate">{item.sub}</p>
                </div>

                {/* Tactile + / - Stepper (0 to 10) */}
                <div className="flex items-center border border-[#E3E8E2] rounded-lg bg-[#F8F8F6] p-0.5 shrink-0 shadow-2xs">
                  <button
                    type="button"
                    disabled={currentCount <= 0}
                    onClick={() => handleStepDelta(item.key, -1)}
                    aria-label={`Decrease ${item.label}`}
                    className="w-7 h-7 rounded-md bg-white text-[#172722] font-bold text-xs flex items-center justify-center border border-[#E3E8E2] hover:bg-gray-50 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34]"
                    title={`Decrease ${item.label}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-8 text-center text-xs font-mono font-bold text-[#172722]">
                    {currentCount}
                  </span>

                  <button
                    type="button"
                    disabled={currentCount >= 10}
                    onClick={() => handleStepDelta(item.key, 1)}
                    aria-label={`Increase ${item.label}`}
                    className="w-7 h-7 rounded-md bg-white text-[#172722] font-bold text-xs flex items-center justify-center border border-[#E3E8E2] hover:bg-gray-50 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34]"
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

      {/* ── 2. SPECIALIZED SPACES (Expandable Disclosure) ── */}
      <div className="pt-2 border-t border-[#E3E8E2]">
        <button
          type="button"
          onClick={() => setShowAncillary(!showAncillary)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#1B3D34] py-1.5 cursor-pointer hover:text-[#142F28] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B3D34] rounded"
        >
          <span className="flex items-center gap-2">
            <span>Specialized Spaces (Pooja, Utility, Study, Store)</span>
            {ancillaryCountTotal > 0 && (
              <span className="text-[10px] bg-[#EDF3ED] border border-[#CBE0CD] px-2 py-0.5 rounded-md font-mono font-bold text-[#1B3D34]">
                {ancillaryCountTotal} Selected
              </span>
            )}
          </span>
          {showAncillary ? <ChevronUp className="w-4 h-4 text-[#687770]" /> : <ChevronDown className="w-4 h-4 text-[#687770]" />}
        </button>

        <AnimatePresence initial={false}>
          {showAncillary && (
            <motion.div
              variants={accordionVariant}
              initial="initial"
              animate="animate"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {ancillaryRooms.map((item) => {
                  const count = rooms[item.key] || 0;
                  return (
                    <div
                      key={item.key}
                      className={cn(
                        'p-3 rounded-xl border transition-all flex items-center justify-between gap-2 bg-white shadow-2xs text-xs',
                        count > 0 ? 'border-[#1B3D34] bg-[#F7FAF7]' : 'border-[#E3E8E2] hover:border-[#1B3D34]/30'
                      )}
                    >
                      <span className="font-bold text-[#172722] truncate">{item.label}</span>
                      <div className="flex items-center border border-[#E3E8E2] rounded-lg bg-[#F8F8F6] p-0.5 shrink-0 shadow-2xs">
                        <button
                          type="button"
                          disabled={count <= 0}
                          onClick={() => updateRoomCount(item.key, -1)}
                          aria-label={`Decrease ${item.label}`}
                          className="w-7 h-7 rounded-md bg-white text-[#172722] font-bold text-xs flex items-center justify-center border border-[#E3E8E2] disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-50 active:scale-95 transition-all shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-bold text-[#172722]">{count}</span>
                        <button
                          type="button"
                          disabled={count >= 10}
                          onClick={() => updateRoomCount(item.key, 1)}
                          aria-label={`Increase ${item.label}`}
                          className="w-7 h-7 rounded-md bg-white text-[#172722] font-bold text-xs flex items-center justify-center border border-[#E3E8E2] disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-50 active:scale-95 transition-all shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 3. VERTICAL CIRCULATION (Elevator vs Staircase) ── */}
      <div className="space-y-2 pt-2 border-t border-[#E3E8E2]">
        <label className="text-xs font-bold text-[#172722] uppercase tracking-wider block">
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
            <div className="flex justify-between items-center text-xs font-bold text-[#172722]">
              <span>Passenger Elevator</span>
              {liftRequired && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
            </div>
            <p className="text-[10px] text-[#687770] mt-0.5">RCC lift shaft, pit &amp; machine headroom</p>
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
            <div className="flex justify-between items-center text-xs font-bold text-[#172722]">
              <span>Staircase Only</span>
              {!liftRequired && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
            </div>
            <p className="text-[10px] text-[#687770] mt-0.5">Continuous vertical RCC stairway</p>
          </div>
        </div>

        {floors >= 4 && (
          <div className="p-2.5 bg-white rounded-xl border border-[#F28C28] flex items-center gap-2 text-xs text-[#172722]">
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
