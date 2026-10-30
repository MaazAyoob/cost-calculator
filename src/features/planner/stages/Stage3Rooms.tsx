import React from 'react';
import { useWizardStore, RoomCounts } from '../../../store/useWizardStore';
import { Bed, Bath, ChefHat, Tv, Sun, Plus, Minus, BookOpen, Warehouse, Wind, Layers, Sparkles, RotateCcw } from 'lucide-react';

interface RoomDef {
  key: keyof RoomCounts;
  label: string;
  desc: string;
  icon: any;
  min: number;
  max: number;
  isPrimary: boolean;
}

const ROOM_DEFINITIONS: RoomDef[] = [
  // Primary Living Spaces
  { key: 'bedrooms', label: 'Bedrooms', desc: 'Private master & guest rooms', icon: Bed, min: 1, max: 12, isPrimary: true },
  { key: 'bathrooms', label: 'Bathrooms', desc: 'Attached and common washrooms', icon: Bath, min: 1, max: 12, isPrimary: true },
  { key: 'living', label: 'Living Rooms', desc: 'Family hall & formal sitting areas', icon: Tv, min: 1, max: 6, isPrimary: true },
  { key: 'kitchen', label: 'Kitchen & Utility', desc: 'Cooking area & wet utility space', icon: ChefHat, min: 1, max: 5, isPrimary: true },
  
  // Optional Lifestyle & Utility Spaces
  { key: 'pooja', label: 'Pooja Room', desc: 'Dedicated mandir / prayer sanctuary', icon: Sun, min: 0, max: 4, isPrimary: false },
  { key: 'balcony', label: 'Balconies & Sit-outs', desc: 'Open-air shaded extensions', icon: Wind, min: 0, max: 8, isPrimary: false },
  { key: 'office', label: 'Study / Home Office', desc: 'Work-from-home or library space', icon: BookOpen, min: 0, max: 4, isPrimary: false },
  { key: 'storeRoom', label: 'Store Room', desc: 'Pantry or utility storage area', icon: Warehouse, min: 0, max: 4, isPrimary: false },
  { key: 'terrace', label: 'Terrace / Open Deck', desc: 'Rooftop recreation or open sitout area', icon: Layers, min: 0, max: 2, isPrimary: false },
];

export const Stage3Rooms: React.FC = () => {
  const { rooms, updateRoomCount, isCustomRooms, estimateMode, applySampleRoomConfig } = useWizardStore();

  const primaryRooms = ROOM_DEFINITIONS.filter((r) => r.isPrimary);
  const optionalRooms = ROOM_DEFINITIONS.filter((r) => !r.isPrimary);

  // Quick total room summary
  const totalRoomCount = Object.values(rooms).reduce((sum, count) => sum + (count || 0), 0);

  return (
    <div className="space-y-6 text-left">
      {/* Stage Header */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF3EF] border border-[#D5E5DC] text-[11px] font-bold text-[#1B3D34]">
          <Bed className="w-3 h-3 text-[#F28C28]" />
          <span>STAGE 3 OF 8 &bull; YOUR ROOMS</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
            What rooms would you like in your home?
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#18211E] bg-white px-3 py-1.5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <span>Total Spaces:</span>
            <strong className="text-[#F28C28]">{totalRoomCount}</strong>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#707873]">
          Adjust your room counts with a single tap. Doors, windows, and electrical switch points calculate automatically to match your layout.
        </p>
      </div>

      {/* Mode Status Banner & Reset */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isCustomRooms
          ? 'bg-amber-50/70 border-amber-200 text-amber-900'
          : 'bg-[#EBF3EF] border-[#D5E5DC] text-[#1B3D34]'
      }`}>
        <div className="flex items-center gap-2.5 text-xs">
          <Sparkles className="w-4 h-4 text-[#F28C28] shrink-0" />
          <span>
            {isCustomRooms ? (
              <>
                <strong className="font-bold">Custom Layout Active:</strong> Your personalized room schedule is locked in and preserved.
              </>
            ) : (
              <>
                <strong className="font-bold">Quick Estimate Mode:</strong> Standard 3BHK sample assumptions loaded (3 Beds, 3 Baths, Living, Kitchen). Adjust any room below to customize.
              </>
            )}
          </span>
        </div>

        {isCustomRooms && (
          <button
            type="button"
            onClick={applySampleRoomConfig}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer shrink-0 shadow-2xs"
            title="Restore standard 3BHK sample home configuration"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#F28C28]" />
            <span>Reset to Sample 3BHK</span>
          </button>
        )}
      </div>

      {/* 1. Core Living Spaces */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3D34]">
          Essential Living Areas
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {primaryRooms.map((room) => {
            const Icon = room.icon;
            const currentCount = rooms[room.key] ?? 0;
            return (
              <div
                key={room.key}
                className="p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#EBF3EF] border border-[#D5E5DC] flex items-center justify-center text-[#1B3D34] shrink-0">
                    <Icon className="w-5 h-5 text-[#1B3D34]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-[#1B3D34] block truncate">{room.label}</span>
                    <span className="text-[11px] text-[#687770] block truncate">{room.desc}</span>
                  </div>
                </div>

                {/* Accessible Number Stepper (>=44x44px target) */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateRoomCount(room.key, -1)}
                    disabled={currentCount <= room.min}
                    className="w-11 h-11 rounded-xl border border-[#CBD5CB] bg-[#F8F8F6] text-[#1B3D34] font-bold text-lg hover:bg-[#EBF3EF] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    aria-label={`Decrease ${room.label}`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-black font-mono text-[#1B3D34] min-w-[28px] text-center">
                    {currentCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateRoomCount(room.key, 1)}
                    disabled={currentCount >= room.max}
                    className="w-11 h-11 rounded-xl border border-[#CBD5CB] bg-[#F8F8F6] text-[#1B3D34] font-bold text-lg hover:bg-[#EBF3EF] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    aria-label={`Increase ${room.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Optional & Lifestyle Spaces */}
      <div className="space-y-3 pt-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3D34]">
          Optional Spaces &amp; Extensions
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {optionalRooms.map((room) => {
            const Icon = room.icon;
            const currentCount = rooms[room.key] ?? 0;
            const isActive = currentCount > 0;
            return (
              <div
                key={room.key}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isActive ? 'bg-[#EBF3EF]/50 border-[#1B3D34]/30' : 'bg-white border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-[#1B3D34] text-white border-[#1B3D34]' : 'bg-[#F8F9F7] text-[#687770] border-[#E5E7EB]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-[#1B3D34] block truncate">{room.label}</span>
                    <span className="text-[11px] text-[#687770] block truncate">{room.desc}</span>
                  </div>
                </div>

                {/* Accessible Number Stepper (>=44x44px target) */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateRoomCount(room.key, -1)}
                    disabled={currentCount <= room.min}
                    className="w-11 h-11 rounded-xl border border-[#CBD5CB] bg-[#F8F8F6] text-[#1B3D34] font-bold text-lg hover:bg-[#EBF3EF] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    aria-label={`Decrease ${room.label}`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-black font-mono text-[#1B3D34] min-w-[28px] text-center">
                    {currentCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateRoomCount(room.key, 1)}
                    disabled={currentCount >= room.max}
                    className="w-11 h-11 rounded-xl border border-[#CBD5CB] bg-[#F8F8F6] text-[#1B3D34] font-bold text-lg hover:bg-[#EBF3EF] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    aria-label={`Increase ${room.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
