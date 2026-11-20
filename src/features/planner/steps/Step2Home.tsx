import React, { useState } from 'react';
import {
  useWizardStore,
  HouseType,
  RoomCounts,
  ParkingTypeOption,
} from '../../../store/useWizardStore';
import { useArea } from '../../../store/useCalculationStore';
import {
  Home,
  Layers,
  Bed,
  Bath,
  ChefHat,
  Tv,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Car,
  Zap,
  Sparkles,
  Users,
  Building,
  Check,
} from 'lucide-react';

interface FloorOption {
  count: number;
  label: string;
  desc: string;
  popular?: boolean;
}

const FLOOR_OPTIONS: FloorOption[] = [
  { count: 1, label: 'Ground', desc: '1 Floor only' },
  { count: 2, label: 'G + 1', desc: '2 Floors (Ground + 1)', popular: true },
  { count: 3, label: 'G + 2', desc: '3 Floors (Duplex + Terrace)' },
  { count: 4, label: 'G + 3', desc: '4 Floors (Residence / Units)' },
];

const HOUSE_TYPES: { id: HouseType; label: string; desc: string; icon: React.ElementType }[] = [
  {
    id: 'Duplex',
    label: 'Single Family / Duplex',
    desc: 'Private home for one family with connected living spaces and bedrooms.',
    icon: Home,
  },
  {
    id: 'Triplex',
    label: 'Independent Villa / Triplex',
    desc: 'Spacious multi-level home with family lounges, entertainment and open terrace.',
    icon: Sparkles,
  },
  {
    id: 'Rental Units',
    label: 'Self-Use + Rental Floors',
    desc: 'Live on one floor while leasing out other floors for rental income.',
    icon: Users,
  },
];

export const Step2Home: React.FC = () => {
  const store = useWizardStore();
  const {
    floors,
    houseType,
    rooms,
    parkingType,
    carCount,
    bikeCount,
    evCharging,
    liftRequired,
    setHouseConfig,
    setRoomCount,
    setParkingConfig,
    setLiftRequired,
  } = store;

  const area = useArea();
  const [showOptionalSpaces, setShowOptionalSpaces] = useState(false);

  // Defaults: standard Bangalore residential home is G+1 (2 floors) Duplex
  const currentFloors = floors && floors > 0 ? floors : 2;
  const currentHouseType = houseType || 'Duplex';

  // Ensure state consistency on mount so store is never left with 0 or null
  React.useEffect(() => {
    if (!floors || floors <= 0 || !houseType) {
      setHouseConfig(currentHouseType, currentFloors);
    }
  }, []);

  const handleSelectFloors = (count: number) => {
    setHouseConfig(currentHouseType, count);
  };

  const handleSelectHouseType = (type: HouseType) => {
    setHouseConfig(type, currentFloors);
  };

  const handleRoomDelta = (key: keyof RoomCounts, delta: number, min = 0, max = 10) => {
    const current = rooms[key] || 0;
    const next = Math.max(min, Math.min(max, current + delta));
    setRoomCount(key, next);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Step Header */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FDF0EB] border border-[#E8C5B8] text-[11px] font-bold text-[#C66B4E]">
          <Home className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>STEP 02 OF 05 &bull; HOME &amp; ROOMS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
          Choose your home layout.
        </h2>
        <p className="text-xs sm:text-sm text-[#66716B] leading-relaxed">
          Select your number of floors, type of home, and rooms. You can also add parking and extra spaces.
        </p>
      </div>

      {/* 1. Number of Floors */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#18211E] uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#C66B4E]" />
            <span>1. Number of Floors</span>
          </label>
          <span className="text-xs font-mono font-bold text-[#183B32] bg-[#E8EFE9] px-2.5 py-0.5 rounded-md border border-[#B7CDBB]">
            Built-Up Area: {(area.totalBUASqFt || currentFloors * 720).toLocaleString()} sq.ft
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {FLOOR_OPTIONS.map((f) => {
            const isSelected = currentFloors === f.count;
            return (
              <button
                key={f.count}
                type="button"
                onClick={() => handleSelectFloors(f.count)}
                className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-[#183B32] bg-[#183B32] text-white shadow-xs'
                    : 'border-[#E5E7EB] bg-white hover:bg-[#F8F8F6] text-[#18211E]'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`text-xs sm:text-sm font-bold font-mono ${isSelected ? 'text-white' : 'text-[#18211E]'}`}>
                    {f.label}
                  </span>
                  {f.popular && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C66B4E]" />
                  )}
                </div>
                <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#66716B]'}`}>
                  {f.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. House Type */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#18211E] uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>2. Type of Home</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {HOUSE_TYPES.map((ht) => {
            const Icon = ht.icon;
            const isSelected = currentHouseType === ht.id;
            return (
              <button
                key={ht.id}
                type="button"
                onClick={() => handleSelectHouseType(ht.id)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs'
                    : 'border-[#E5E7EB] bg-white hover:bg-[#F8F8F6]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#183B32]' : 'text-[#66716B]'}`} />
                    <span className="text-xs font-bold text-[#18211E]">{ht.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C66B4E]" />}
                </div>
                <p className="text-[11px] text-[#66716B] leading-relaxed">{ht.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Core Home Rooms */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#18211E] uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Bed className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>3. Main Rooms</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Bedrooms */}
          <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E8EFE9] flex items-center justify-center text-[#183B32]">
                <Bed className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-[#18211E] block">Bedrooms</strong>
                <span className="text-[11px] text-[#66716B] block">Master &amp; guest rooms</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRoomDelta('bedrooms', -1, 1, 8)}
                disabled={(rooms.bedrooms || 3) <= 1}
                className="w-7 h-7 rounded-lg border border-[#CBD5CB] bg-white text-[#18211E] hover:bg-[#F8F8F6] flex items-center justify-center font-bold text-sm disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-sm font-bold font-mono text-[#183B32]">
                {rooms.bedrooms || 3}
              </span>
              <button
                type="button"
                onClick={() => handleRoomDelta('bedrooms', 1, 1, 8)}
                disabled={(rooms.bedrooms || 3) >= 8}
                className="w-7 h-7 rounded-lg border border-[#CBD5CB] bg-white text-[#18211E] hover:bg-[#F8F8F6] flex items-center justify-center font-bold text-sm disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Bathrooms */}
          <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E8EFE9] flex items-center justify-center text-[#183B32]">
                <Bath className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-[#18211E] block">Bathrooms</strong>
                <span className="text-[11px] text-[#66716B] block">Attached &amp; common</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRoomDelta('bathrooms', -1, 1, 8)}
                disabled={(rooms.bathrooms || 3) <= 1}
                className="w-7 h-7 rounded-lg border border-[#CBD5CB] bg-white text-[#18211E] hover:bg-[#F8F8F6] flex items-center justify-center font-bold text-sm disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-sm font-bold font-mono text-[#183B32]">
                {rooms.bathrooms || 3}
              </span>
              <button
                type="button"
                onClick={() => handleRoomDelta('bathrooms', 1, 1, 8)}
                disabled={(rooms.bathrooms || 3) >= 8}
                className="w-7 h-7 rounded-lg border border-[#CBD5CB] bg-white text-[#18211E] hover:bg-[#F8F8F6] flex items-center justify-center font-bold text-sm disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Kitchens */}
          <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E8EFE9] flex items-center justify-center text-[#183B32]">
                <ChefHat className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-[#18211E] block">Kitchen</strong>
                <span className="text-[11px] text-[#66716B] block">Cooking &amp; breakfast zone</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRoomDelta('kitchen', -1, 1, 4)}
                disabled={(rooms.kitchen || 1) <= 1}
                className="w-7 h-7 rounded-lg border border-[#CBD5CB] bg-white text-[#18211E] hover:bg-[#F8F8F6] flex items-center justify-center font-bold text-sm disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-sm font-bold font-mono text-[#183B32]">
                {rooms.kitchen || 1}
              </span>
              <button
                type="button"
                onClick={() => handleRoomDelta('kitchen', 1, 1, 4)}
                disabled={(rooms.kitchen || 1) >= 4}
                className="w-7 h-7 rounded-lg border border-[#CBD5CB] bg-white text-[#18211E] hover:bg-[#F8F8F6] flex items-center justify-center font-bold text-sm disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Living Areas */}
          <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E8EFE9] flex items-center justify-center text-[#183B32]">
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold text-[#18211E] block">Living &amp; Dining</strong>
                <span className="text-[11px] text-[#66716B] block">Family lounge spaces</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRoomDelta('living', -1, 1, 4)}
                disabled={(rooms.living || 1) <= 1}
                className="w-7 h-7 rounded-lg border border-[#CBD5CB] bg-white text-[#18211E] hover:bg-[#F8F8F6] flex items-center justify-center font-bold text-sm disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-sm font-bold font-mono text-[#183B32]">
                {rooms.living || 1}
              </span>
              <button
                type="button"
                onClick={() => handleRoomDelta('living', 1, 1, 4)}
                disabled={(rooms.living || 1) >= 4}
                className="w-7 h-7 rounded-lg border border-[#CBD5CB] bg-white text-[#18211E] hover:bg-[#F8F8F6] flex items-center justify-center font-bold text-sm disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Optional Spaces (Progressive Disclosure) */}
      <div className="pt-2 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setShowOptionalSpaces(!showOptionalSpaces)}
          className="w-full p-3.5 bg-[#F8F8F6] hover:bg-white rounded-2xl border border-[#E5E7EB] flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C66B4E]" />
            <strong className="text-xs sm:text-sm font-bold text-[#183B32] font-heading">
              {showOptionalSpaces ? 'Hide Optional Spaces & Amenities' : 'Add Optional Spaces & Amenities (Pooja, Balconies, Parking, Lift)'}
            </strong>
          </div>
          {showOptionalSpaces ? <ChevronUp className="w-4 h-4 text-[#66716B]" /> : <ChevronDown className="w-4 h-4 text-[#66716B]" />}
        </button>

        {showOptionalSpaces && (
          <div className="mt-3 p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pooja Room */}
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-[#18211E] block">Pooja Room</strong>
                  <span className="text-[10px] text-[#66716B]">Sacred space</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleRoomDelta('pooja', -1, 0, 2)}
                    className="w-6 h-6 rounded border bg-white flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-xs font-bold font-mono">{rooms.pooja || 0}</span>
                  <button
                    type="button"
                    onClick={() => handleRoomDelta('pooja', 1, 0, 2)}
                    className="w-6 h-6 rounded border bg-white flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Balconies */}
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-[#18211E] block">Balconies</strong>
                  <span className="text-[10px] text-[#66716B]">Outdoor terraces</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleRoomDelta('balcony', -1, 0, 6)}
                    className="w-6 h-6 rounded border bg-white flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-xs font-bold font-mono">{rooms.balcony || 0}</span>
                  <button
                    type="button"
                    onClick={() => handleRoomDelta('balcony', 1, 0, 6)}
                    className="w-6 h-6 rounded border bg-white flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Utility Space */}
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-[#18211E] block">Utility &amp; Wash</strong>
                  <span className="text-[10px] text-[#66716B]">Laundry zone</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleRoomDelta('utility', -1, 0, 3)}
                    className="w-6 h-6 rounded border bg-white flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-xs font-bold font-mono">{rooms.utility || 0}</span>
                  <button
                    type="button"
                    onClick={() => handleRoomDelta('utility', 1, 0, 3)}
                    className="w-6 h-6 rounded border bg-white flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Parking & Lift Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E5E7EB]">
              {/* Parking */}
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-2">
                <span className="text-[11px] font-bold text-[#18211E] flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#C66B4E]" />
                  <span>Parking Provision</span>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setParkingConfig('Normal Ground', 1, 2, evCharging)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                      parkingType === 'Normal Ground' || !parkingType ? 'bg-[#183B32] text-white border-[#183B32]' : 'bg-white border-[#CBD5CB]'
                    }`}
                  >
                    1 Car + 2 Bikes
                  </button>
                  <button
                    type="button"
                    onClick={() => setParkingConfig('Stilt', 2, 4, evCharging)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                      parkingType === 'Stilt' ? 'bg-[#183B32] text-white border-[#183B32]' : 'bg-white border-[#CBD5CB]'
                    }`}
                  >
                    Stilt Parking
                  </button>
                </div>
              </div>

              {/* Lift Toggle */}
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-[#18211E] block">Passenger Lift</strong>
                  <span className="text-[10px] text-[#66716B]">Structural lift shaft &amp; pit</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLiftRequired(!liftRequired)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    liftRequired
                      ? 'bg-[#183B32] text-white border-[#183B32]'
                      : 'bg-white text-[#66716B] border-[#CBD5CB]'
                  }`}
                >
                  {liftRequired ? 'Enabled' : 'No Lift'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};