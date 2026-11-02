import React, { useEffect } from 'react';
import {
  useWizardStore,
  HouseType,
  ParkingTypeOption,
  RoomCounts,
} from '../../../store/useWizardStore';
import {
  useArea,
  useBuildingModel,
  useBudgetResult,
} from '../../../store/useCalculationStore';
import { ArchitecturalFloorPlanVisual } from '../components/ArchitecturalFloorPlanVisual';
import {
  Home,
  Building2,
  Car,
  Zap,
  Check,
  Plus,
  Minus,
  Bed,
  Bath,
  ChefHat,
  Tv,
  Sun,
  BookOpen,
  Warehouse,
  Wind,
  Layers,
  Sparkles,
  RotateCcw,
  Info,
  AlertTriangle,
  Calendar,
  Users,
  Trees,
  ArrowUpDown,
  ShieldCheck,
  Maximize2,
  Coffee,
} from 'lucide-react';

// ── TYPES & INTERFACES ──
interface HouseTypeOption {
  id: HouseType;
  label: string;
  tagline: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  recommendedFloors?: string;
}

interface FloorCard {
  count: number;
  label: string;
  code: string;
  sub: string;
  popular?: boolean;
}

interface RoomDefinition {
  key: keyof RoomCounts;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  min: number;
  max: number;
  category: 'core' | 'lifestyle';
  typicalAreaSqFt: number;
}

// ── CONSTANTS & METRIC DEFINITIONS ──
const HOUSE_TYPE_OPTIONS: HouseTypeOption[] = [
  {
    id: 'Duplex',
    label: 'Single Family / Duplex',
    tagline: 'Private Residence',
    desc: 'Designed for one family with connected living spaces, private bedrooms, and unified family flow.',
    icon: Home,
    recommendedFloors: 'G to G+2',
  },
  {
    id: 'Triplex',
    label: 'Independent Villa / Triplex',
    tagline: 'Spacious Multi-Level',
    desc: 'Spacious multi-level home with large living rooms, family lounges, and open terraces.',
    icon: Sparkles,
    recommendedFloors: 'G+2 or G+3',
  },
  {
    id: 'Rental Units',
    label: 'Self-Use + Rental Floors',
    tagline: 'Income-Generating',
    desc: 'Live on one floor while renting out the other floors for steady monthly income.',
    icon: Users,
    recommendedFloors: 'G+2 to G+4',
  },
  {
    id: 'Mixed Use',
    label: 'Shop / Office + Home',
    tagline: 'Commercial + Living',
    desc: 'Ground floor for your shop or office, with comfortable private living space on upper floors.',
    icon: Building2,
    recommendedFloors: 'G+1 to G+4',
  },
  {
    id: 'Farmhouse',
    label: 'Weekend Farmhouse / Villa',
    tagline: 'Nature Retreat',
    desc: 'Country getaway home with shaded verandahs, courtyards, and open garden connections.',
    icon: Trees,
    recommendedFloors: 'G or G+1',
  },
];

const FLOOR_CARDS: FloorCard[] = [
  { count: 1, label: 'Ground Floor Only', code: 'G', sub: 'Single-level living' },
  { count: 2, label: 'Ground + 1 Floor', code: 'G+1', sub: 'Most popular family home', popular: true },
  { count: 3, label: 'Ground + 2 Floors', code: 'G+2', sub: 'Multi-family / Rental living' },
  { count: 4, label: 'Ground + 3 Floors', code: 'G+3', sub: 'High-density / Lift included' },
  { count: 5, label: 'Ground + 4 Floors', code: 'G+4', sub: 'Maximum residential tier' },
];

const PARKING_OPTIONS: {
  id: ParkingTypeOption;
  label: string;
  tagline: string;
  desc: string;
  rateSqFtPerCar: number;
}[] = [
  {
    id: 'Normal Ground',
    label: 'Ground-Level Parking',
    tagline: 'Driveway / Open Porch',
    desc: 'Cars park in a covered ground-floor portico or driveway. Habitable rooms share the ground floor.',
    rateSqFtPerCar: 120,
  },
  {
    id: 'Stilt',
    label: 'Dedicated Stilt Floor',
    tagline: 'Full Ground Floor for Parking',
    desc: 'Entire ground level is dedicated to covered car bays, drive aisle, and security. Habitable floors begin on Level 1.',
    rateSqFtPerCar: 180,
  },
];

const ROOM_DEFINITIONS: RoomDefinition[] = [
  // Core Living Spaces
  {
    key: 'bedrooms',
    label: 'Bedrooms',
    desc: 'Master, guest & children bedrooms',
    icon: Bed,
    min: 1,
    max: 12,
    category: 'core',
    typicalAreaSqFt: 140,
  },
  {
    key: 'bathrooms',
    label: 'Bathrooms',
    desc: 'Attached & family washrooms with fittings',
    icon: Bath,
    min: 1,
    max: 12,
    category: 'core',
    typicalAreaSqFt: 30,
  },
  {
    key: 'living',
    label: 'Living Rooms / Family Hall',
    desc: 'Formal drawing hall & family lounge',
    icon: Tv,
    min: 1,
    max: 6,
    category: 'core',
    typicalAreaSqFt: 200,
  },
  {
    key: 'kitchen',
    label: 'Kitchen & Cooking Area',
    desc: 'Main modular kitchen with counter & splashback',
    icon: ChefHat,
    min: 1,
    max: 5,
    category: 'core',
    typicalAreaSqFt: 90,
  },
  {
    key: 'dining',
    label: 'Dining Room',
    desc: 'Family dining space adjoining the kitchen',
    icon: Coffee,
    min: 0,
    max: 4,
    category: 'core',
    typicalAreaSqFt: 120,
  },

  // Lifestyle & Utility Spaces
  {
    key: 'pooja',
    label: 'Pooja Room',
    desc: 'Dedicated prayer sanctuary / mandir',
    icon: Sun,
    min: 0,
    max: 4,
    category: 'lifestyle',
    typicalAreaSqFt: 25,
  },
  {
    key: 'balcony',
    label: 'Balconies & Sit-Outs',
    desc: 'Shaded open-air outdoor extensions',
    icon: Wind,
    min: 0,
    max: 8,
    category: 'lifestyle',
    typicalAreaSqFt: 50,
  },
  {
    key: 'office',
    label: 'Study / Home Office',
    desc: 'Quiet work-from-home or library space',
    icon: BookOpen,
    min: 0,
    max: 4,
    category: 'lifestyle',
    typicalAreaSqFt: 100,
  },
  {
    key: 'utility',
    label: 'Utility & Washing Area',
    desc: 'Washing machine, sink & wet utility space',
    icon: Layers,
    min: 0,
    max: 4,
    category: 'lifestyle',
    typicalAreaSqFt: 40,
  },
  {
    key: 'storeRoom',
    label: 'Store Room',
    desc: 'Kitchen pantry & household equipment store',
    icon: Warehouse,
    min: 0,
    max: 4,
    category: 'lifestyle',
    typicalAreaSqFt: 35,
  },
  {
    key: 'commonToilets',
    label: 'Common Powder Room',
    desc: 'Convenient guest toilet on living floor',
    icon: Bath,
    min: 0,
    max: 4,
    category: 'lifestyle',
    typicalAreaSqFt: 20,
  },
  {
    key: 'terrace',
    label: 'Rooftop Terrace / Open Deck',
    desc: 'Usable recreation terrace with parapet wall',
    icon: Maximize2,
    min: 0,
    max: 2,
    category: 'lifestyle',
    typicalAreaSqFt: 200,
  },
];

const TIMELINE_OPTIONS = [
  { id: 'immediate', label: 'Immediately', desc: 'Within 30 days — ready to excavate' },
  { id: '1-3_months', label: 'In 1–3 Months', desc: 'Finalizing architectural drawings' },
  { id: '3-6_months', label: 'In 3–6 Months', desc: 'Early planning & budgeting phase' },
  { id: 'not_sure', label: 'Just Exploring', desc: 'Checking cost feasibility' },
];

export const Chapter2DreamHome: React.FC = () => {
  const store = useWizardStore();
  const area = useArea();
  const buildingModel = useBuildingModel();
  const budget = useBudgetResult();

  const {
    floors,
    houseType,
    parkingType,
    carCount,
    bikeCount,
    evCharging,
    liftRequired,
    startTimeline,
    rooms,
    isCustomRooms,
    setHouseConfig,
    setParkingConfig,
    setLiftRequired,
    setStartTimeline,
    updateRoomCount,
    applySampleRoomConfig,
  } = store;

  // ── INITIAL DEFAULTS SANITIZATION ──
  useEffect(() => {
    const effFloors = floors > 0 ? floors : 2;
    const effHouseType = houseType || 'Duplex';
    const effParking = parkingType || 'Normal Ground';
    const effCarCount = carCount > 0 ? carCount : 1;
    const effBikeCount = bikeCount > 0 ? bikeCount : 2;

    setHouseConfig(effHouseType, effFloors);
    setParkingConfig(effParking, effCarCount, effBikeCount, evCharging || false);

    if (!startTimeline) {
      setStartTimeline('1-3_months');
    }
  }, []);

  const activeFloors = floors > 0 ? floors : 2;
  const activeHouseType = houseType || 'Duplex';
  const activeParking = parkingType || 'Normal Ground';
  const isStilt = activeParking === 'Stilt';
  const activeCars = carCount > 0 ? carCount : (activeParking === 'Stilt' ? 2 : 1);
  const activeBikes = bikeCount > 0 ? bikeCount : 2;
  const activeTimeline = startTimeline || '1-3_months';

  // ── DERIVED METRICS ──
  const habitableFloors = isStilt ? Math.max(1, activeFloors - 1) : activeFloors;
  const parkingLevels = isStilt ? 1 : 0;
  const totalRoomCount = Object.values(rooms).reduce((sum, count) => sum + (count || 0), 0);

  // Parking Footprint Breakdown
  const sqFtPerCar = isStilt ? 180 : 120;
  const carAreaSqFt = activeCars * sqFtPerCar;
  const bikeAreaSqFt = activeBikes * 35;
  const totalParkingAreaSqFt = carAreaSqFt + bikeAreaSqFt;

  // BUA & Feasibility
  const totalBuaSqFt = area.totalBUASqFt || 0;
  const buaPerFloorSqFt = area.buaPerFloorSqFt || 0;
  const superBuaSqFt = area.superBUASqFt || Math.round(totalBuaSqFt * 1.15);
  const maxGroundFootprintSqFt = area.buildableFootprintSqFt || 0;
  const coverageLimitSqFt = area.coverageLimitSqFt || 0;
  const permissibleFarBuaSqFt = area.permissibleBUASqFt || 0;
  const validationState = area.validationState || 'valid';
  const confirmationMessage = area.confirmationMessage;

  // Handlers
  const handleHouseTypeSelect = (selected: HouseType) => {
    setHouseConfig(selected, activeFloors);
  };

  const handleFloorSelect = (count: number) => {
    // If stilt is active, enforce minimum 2 floors (1 stilt + 1 habitable)
    const effectiveCount = isStilt && count < 2 ? 2 : count;
    setHouseConfig(activeHouseType, effectiveCount);
  };

  const handleParkingSelect = (parking: ParkingTypeOption) => {
    // If switching to Stilt and currently on 1 floor, elevate to 2 floors (G+1)
    let nextFloors = activeFloors;
    if (parking === 'Stilt' && nextFloors < 2) {
      nextFloors = 2;
    }
    setParkingConfig(parking, activeCars, activeBikes, evCharging);
    if (nextFloors !== activeFloors) {
      setHouseConfig(activeHouseType, nextFloors);
    }
  };

  const handleCarCountChange = (delta: number) => {
    const nextVal = Math.max(0, Math.min(6, activeCars + delta));
    setParkingConfig(activeParking, nextVal, activeBikes, evCharging);
  };

  const handleBikeCountChange = (delta: number) => {
    const nextVal = Math.max(0, Math.min(10, activeBikes + delta));
    setParkingConfig(activeParking, activeCars, nextVal, evCharging);
  };

  const handleEvToggle = () => {
    setParkingConfig(activeParking, activeCars, activeBikes, !evCharging);
  };

  const handleLiftToggle = () => {
    setLiftRequired(!liftRequired);
  };

  return (
    <div className="space-y-8 text-left text-[#202522]">
      {/* ── CHAPTER HEADER ── */}
      <div className="space-y-2 border-b border-[#E5E7EB] pb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-[11px] font-bold text-[#183B32]">
          <Home className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>STEP 2 OF 7 &bull; YOUR HOME &amp; ROOMS</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
            Plan your home and rooms.
          </h2>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#18211E] bg-[#F8F8F6] px-3 py-1.5 rounded-xl border border-[#CBD5CB] shadow-2xs">
              <span className="text-[#687770]">Floors:</span>
              <strong className="text-[#183B32]">{habitableFloors} Level{habitableFloors > 1 ? 's' : ''}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#18211E] bg-[#F8F8F6] px-3 py-1.5 rounded-xl border border-[#CBD5CB] shadow-2xs">
              <span className="text-[#687770]">Rooms:</span>
              <strong className="text-[#C66B4E]">{totalRoomCount} Spaces</strong>
            </span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#66716B] max-w-3xl leading-relaxed">
          Choose the style of your home, number of floors, and how many rooms you need. We calculate the required built-up area and structural dependencies in real time.
        </p>
      </div>

      {/* ── SECTION 1: WHAT KIND OF HOME ARE YOU PLANNING? ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E] flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#183B32]" />
            1. What kind of home are you planning?
          </label>
          <span className="text-[11px] text-[#66716B]">Determines dwelling configuration &amp; entrances</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HOUSE_TYPE_OPTIONS.map((opt) => {
            const isSelected = activeHouseType === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleHouseTypeSelect(opt.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                  isSelected
                    ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                    : 'border-[#CBD5CB] bg-white hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[#183B32] text-white border-[#183B32]'
                        : 'bg-[#F8F8F6] text-[#183B32] border-[#CBD5CB]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-[#18211E] leading-tight">
                        {opt.label}
                      </span>
                      <span className="text-[10px] font-bold text-[#C66B4E] uppercase tracking-wider">
                        {opt.tagline}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#183B32] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-[#505D56] leading-relaxed">
                  {opt.desc}
                </p>

                {opt.recommendedFloors && (
                  <div className="pt-1 border-t border-[#CBD5CB]/60 flex items-center justify-between text-[10px] text-[#687770]">
                    <span>Suggested Scale:</span>
                    <strong className="text-[#183B32]">{opt.recommendedFloors}</strong>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2: HOW MANY FLOORS DO YOU WANT? ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#183B32]" />
            2. How many floors would you like?
          </label>
          <span className="text-[11px] text-[#66716B]">Ground to Ground + 4</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {FLOOR_CARDS.map((floor) => {
            const isSelected = activeFloors === floor.count;
            const isFloorDisabled = isStilt && floor.count < 2;
            return (
              <button
                key={floor.count}
                type="button"
                disabled={isFloorDisabled}
                onClick={() => handleFloorSelect(floor.count)}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
                  isFloorDisabled
                    ? 'opacity-40 cursor-not-allowed border-[#E5E7EB] bg-[#F8F9F7]'
                    : isSelected
                    ? 'border-[#183B32] bg-[#183B32] text-white shadow-xs'
                    : 'border-[#CBD5CB] bg-white text-[#202522] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                }`}
              >
                {floor.popular && !isFloorDisabled && (
                  <span className={`absolute -top-2 right-2 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    isSelected ? 'bg-[#C66B4E] text-white' : 'bg-[#E8EFE9] text-[#183B32] border border-[#B7CDBB]'
                  }`}>
                    Popular
                  </span>
                )}
                <div className="font-mono text-xs uppercase tracking-widest opacity-70 font-bold mb-0.5">
                  {floor.code}
                </div>
                <span className="block text-base sm:text-lg font-black font-mono leading-tight">
                  {floor.label}
                </span>
                <span className={`block text-[10px] mt-1 leading-tight ${isSelected ? 'text-white/80' : 'text-[#687770]'}`}>
                  {floor.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Habitable vs Stilt Floor Clarification Banner */}
        <div className="p-3.5 rounded-xl bg-[#F8F8F6] border border-[#CBD5CB] text-xs space-y-1.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#183B32] shrink-0" />
              <span className="font-bold text-[#183B32]">
                Floor Composition Breakdown:
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#183B32] bg-white px-2 py-0.5 rounded-lg border border-[#CBD5CB]">
              {habitableFloors} Habitable Level{habitableFloors > 1 ? 's' : ''}
              {isStilt ? ' + 1 Dedicated Stilt Parking Floor' : ' (Ground Level Living)'}
            </span>
          </div>
          <p className="text-[11px] text-[#505D56] leading-relaxed">
            {isStilt ? (
              <>
                <strong>Stilt Configuration Active:</strong> The entire ground floor is reserved for covered parking and security.
                Only the <strong>{habitableFloors} upper floor{habitableFloors > 1 ? 's' : ''}</strong> are counted toward habitable residential built-up space. Stilt parking is not silently added to your room living area.
              </>
            ) : (
              <>
                <strong>Ground-Level Living:</strong> All <strong>{activeFloors} floor{activeFloors > 1 ? 's' : ''}</strong> are habitable living floors. Vehicle parking is accommodated in an open driveway or front portico without consuming an entire structural level.
              </>
            )}
          </p>
        </div>

        {/* Lift Provision Indicator / Toggle */}
        <div className="p-3 bg-white rounded-xl border border-[#CBD5CB] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ArrowUpDown className="w-4 h-4 text-[#183B32]" />
            <div>
              <span className="text-xs font-bold text-[#18211E] block">
                Elevator / Passenger Lift Provision
              </span>
              <span className="text-[11px] text-[#687770]">
                {activeFloors >= 4
                  ? 'Recommended engineering provision for buildings G+3 and above'
                  : 'Optional structural pit & shaft provision for 2 to 3 floor residences'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLiftToggle}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              liftRequired
                ? 'border-[#183B32] bg-[#183B32] text-white shadow-2xs'
                : 'border-[#CBD5CB] bg-[#F8F8F6] text-[#4B5563] hover:border-[#183B32]/40'
            }`}
          >
            {liftRequired && <Check className="w-3.5 h-3.5" />}
            <span>{liftRequired ? 'Lift Included' : 'No Lift'}</span>
          </button>
        </div>
      </div>

      {/* ── SECTION 3: WHAT ABOUT PARKING? ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E] flex items-center gap-1.5">
            <Car className="w-4 h-4 text-[#183B32]" />
            3. What about vehicle parking?
          </label>
          <span className="text-[11px] text-[#66716B]">Allocates parking bays &amp; driveway space</span>
        </div>

        {/* Parking Type Toggle Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PARKING_OPTIONS.map((park) => {
            const isSelected = activeParking === park.id;
            return (
              <button
                key={park.id}
                type="button"
                onClick={() => handleParkingSelect(park.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                    : 'border-[#CBD5CB] bg-white hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#18211E] block">{park.label}</span>
                    <span className="text-[9px] font-bold text-[#C66B4E] uppercase tracking-wider">
                      ~{park.rateSqFtPerCar} sq.ft/car
                    </span>
                  </div>
                  <span className="text-[10px] text-[#183B32] font-medium block">{park.tagline}</span>
                  <p className="text-[11px] text-[#505D56] leading-relaxed pt-0.5">{park.desc}</p>
                </div>

                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Vehicle Slots & EV Charging Controls */}
        <div className="p-4 bg-white rounded-2xl border border-[#CBD5CB] space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cars Stepper */}
            <div className="flex items-center justify-between p-2.5 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-[#183B32]" />
                <div>
                  <span className="text-xs font-bold text-[#18211E] block">Four-Wheeler Parking</span>
                  <span className="text-[10px] text-[#687770]">
                    {activeCars === 0 ? 'No dedicated car bay' : `${activeCars} Car Bay${activeCars > 1 ? 's' : ''} (~${carAreaSqFt} sq.ft)`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCarCountChange(-1)}
                  disabled={activeCars <= 0}
                  className="w-8 h-8 rounded-lg border border-[#CBD5CB] bg-white text-[#183B32] font-bold text-base hover:bg-[#E8EFE9] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-2xs"
                  aria-label="Decrease car count"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-mono font-black text-[#183B32] min-w-[24px] text-center">
                  {activeCars}
                </span>
                <button
                  type="button"
                  onClick={() => handleCarCountChange(1)}
                  disabled={activeCars >= 6}
                  className="w-8 h-8 rounded-lg border border-[#CBD5CB] bg-white text-[#183B32] font-bold text-base hover:bg-[#E8EFE9] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-2xs"
                  aria-label="Increase car count"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Two-Wheelers Stepper */}
            <div className="flex items-center justify-between p-2.5 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-[#C66B4E]" />
                <div>
                  <span className="text-xs font-bold text-[#18211E] block">Two-Wheeler Parking</span>
                  <span className="text-[10px] text-[#687770]">
                    {activeBikes === 0 ? 'No dedicated bike bay' : `${activeBikes} Two-Wheeler${activeBikes > 1 ? 's' : ''} (~${bikeAreaSqFt} sq.ft)`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleBikeCountChange(-1)}
                  disabled={activeBikes <= 0}
                  className="w-8 h-8 rounded-lg border border-[#CBD5CB] bg-white text-[#183B32] font-bold text-base hover:bg-[#E8EFE9] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-2xs"
                  aria-label="Decrease bike count"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-mono font-black text-[#183B32] min-w-[24px] text-center">
                  {activeBikes}
                </span>
                <button
                  type="button"
                  onClick={() => handleBikeCountChange(1)}
                  disabled={activeBikes >= 10}
                  className="w-8 h-8 rounded-lg border border-[#CBD5CB] bg-white text-[#183B32] font-bold text-base hover:bg-[#E8EFE9] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-2xs"
                  aria-label="Increase bike count"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* EV Charging & Summary Footer */}
          <div className="pt-2 border-t border-[#CBD5CB]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-[11px] text-[#687770]">
              Total Allocated Parking Area: <strong className="text-[#183B32] font-mono">{totalParkingAreaSqFt} sq.ft</strong>
              <span className="hidden sm:inline"> (at {sqFtPerCar} sq.ft/car and 35 sq.ft/bike)</span>
            </div>

            <button
              type="button"
              onClick={handleEvToggle}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                evCharging
                  ? 'border-[#183B32] bg-[#183B32] text-white shadow-2xs'
                  : 'border-[#CBD5CB] bg-[#F8F8F6] text-[#4B5563] hover:border-[#183B32]/40'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${evCharging ? 'text-[#C66B4E]' : 'text-[#687770]'}`} />
              <span>{evCharging ? 'EV Charging Ready (15A/32A)' : 'Add EV Charging Point'}</span>
            </button>
          </div>

          {/* Planning Assumption Disclosure */}
          <div className="pt-2 border-t border-[#CBD5CB]/40 text-[10.5px] text-[#687770] leading-relaxed">
            These are approximate allowances used for early planning, not statutory parking standards. Actual requirements depend on your site layout and applicable local municipal rules.
          </div>
        </div>
      </div>

      {/* ── SECTION 4: CHOOSE THE ROOMS IN YOUR HOME ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E] flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-[#183B32]" />
              4. Choose the rooms in your home
            </label>
            <span className="text-[11px] text-[#66716B]">
              Tap + / - to configure room counts. Doors, windows, and electrical points adjust automatically.
            </span>
          </div>

          {isCustomRooms && (
            <button
              type="button"
              onClick={applySampleRoomConfig}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#CBD5CB] text-[#183B32] text-xs font-bold hover:bg-[#E8EFE9] transition-all cursor-pointer shrink-0 shadow-2xs self-start sm:self-auto"
              title="Restore standard 3BHK sample home configuration"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C66B4E]" />
              <span>Reset to Sample 3BHK</span>
            </button>
          )}
        </div>

        {/* Customization Status Banner */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
          isCustomRooms
            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
            : 'bg-[#E8EFE9] border-[#B7CDBB] text-[#183B32]'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C66B4E] shrink-0" />
            <span>
              {isCustomRooms ? (
                <>
                  <strong>Personalized Room Schedule:</strong> Your custom room count is active and will be preserved across all stages.
                </>
              ) : (
                <>
                  <strong>Standard 3BHK Assumptions Loaded:</strong> 3 Bedrooms, 3 Bathrooms, Living, Kitchen, Dining, Balcony, Pooja &amp; Utility.
                </>
              )}
            </span>
          </div>
          <span className="font-mono font-bold text-xs">
            {totalRoomCount} Total Spaces
          </span>
        </div>

        {/* Core Living Spaces Grid */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#18211E] block">
            Core Living Areas
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROOM_DEFINITIONS.filter((r) => r.category === 'core').map((room) => {
              const Icon = room.icon;
              const currentCount = rooms[room.key] ?? 0;
              return (
                <div
                  key={room.key}
                  className="p-3.5 bg-white rounded-2xl border border-[#CBD5CB] shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#E8EFE9] border border-[#B7CDBB] flex items-center justify-center text-[#183B32] shrink-0">
                      <Icon className="w-5 h-5 text-[#183B32]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#18211E] block truncate">
                        {room.label}
                      </span>
                      <span className="text-[10px] text-[#687770] block truncate">
                        {room.desc}
                      </span>
                    </div>
                  </div>

                  {/* Accessible Number Stepper */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateRoomCount(room.key, -1)}
                      disabled={currentCount <= room.min}
                      className="w-9 h-9 rounded-xl border border-[#CBD5CB] bg-[#F8F8F6] text-[#183B32] font-bold text-base hover:bg-[#E8EFE9] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      aria-label={`Decrease ${room.label}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-black font-mono text-[#183B32] min-w-[24px] text-center">
                      {currentCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateRoomCount(room.key, 1)}
                      disabled={currentCount >= room.max}
                      className="w-9 h-9 rounded-xl border border-[#CBD5CB] bg-[#F8F8F6] text-[#183B32] font-bold text-base hover:bg-[#E8EFE9] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      aria-label={`Increase ${room.label}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lifestyle & Utility Spaces Grid */}
        <div className="space-y-2.5 pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#18211E] block">
            Lifestyle, Prayer &amp; Utility Extensions
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROOM_DEFINITIONS.filter((r) => r.category === 'lifestyle').map((room) => {
              const Icon = room.icon;
              const currentCount = rooms[room.key] ?? 0;
              const isActive = currentCount > 0;
              return (
                <div
                  key={room.key}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-[#E8EFE9]/40 border-[#183B32]/30'
                      : 'bg-white border-[#CBD5CB]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-[#183B32] text-white border-[#183B32]'
                        : 'bg-[#F8F8F6] text-[#687770] border-[#CBD5CB]'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#18211E] block truncate">
                        {room.label}
                      </span>
                      <span className="text-[10px] text-[#687770] block truncate">
                        {room.desc}
                      </span>
                    </div>
                  </div>

                  {/* Accessible Number Stepper */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateRoomCount(room.key, -1)}
                      disabled={currentCount <= room.min}
                      className="w-9 h-9 rounded-xl border border-[#CBD5CB] bg-[#F8F8F6] text-[#183B32] font-bold text-base hover:bg-[#E8EFE9] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      aria-label={`Decrease ${room.label}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-black font-mono text-[#183B32] min-w-[24px] text-center">
                      {currentCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateRoomCount(room.key, 1)}
                      disabled={currentCount >= room.max}
                      className="w-9 h-9 rounded-xl border border-[#CBD5CB] bg-[#F8F8F6] text-[#183B32] font-bold text-base hover:bg-[#E8EFE9] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      aria-label={`Increase ${room.label}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SECTION 5: ARCHITECTURAL FLOOR-STACK ILLUSTRATION & ROOM ALLOCATION ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#C66B4E]" />
            5. Floor arrangement &amp; architectural stack
          </label>
          <span className="text-[11px] text-[#66716B]">Canonical floor-by-floor space assignment</span>
        </div>

        {/* Visual Floor Stack Card Container */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#CBD5CB] shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs border-b border-[#CBD5CB] pb-3">
            <span className="font-bold text-[#18211E]">
              Structural Floor Stack (Bottom to Top)
            </span>
            <span className="text-[11px] text-[#687770]">
              Avg. ~{buaPerFloorSqFt.toLocaleString()} sq.ft per habitable level
            </span>
          </div>

          <div className="space-y-3">
            {/* 1. Stilt Parking Floor (if active) */}
            {isStilt && (
              <div className="p-4 rounded-2xl border-2 border-dashed border-[#CBD5CB] bg-[#F8F8F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#CBD5CB] flex items-center justify-center text-[#183B32] font-bold font-mono text-xs shrink-0">
                    STILT
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#18211E] block">
                      Ground Level: Dedicated Stilt Parking Floor
                    </span>
                    <span className="text-[11px] text-[#505D56] block">
                      {activeCars} Car Bays &bull; {activeBikes} Two-Wheeler Slots &bull; Driver Washroom &amp; Security Desk
                    </span>
                  </div>
                </div>
                <div className="text-right sm:shrink-0">
                  <span className="text-xs font-mono font-bold text-[#183B32] block">
                    ~{totalParkingAreaSqFt.toLocaleString()} sq.ft
                  </span>
                  <span className="text-[10px] text-[#687770] uppercase tracking-wider block">
                    Non-Habitable Parking Bay
                  </span>
                </div>
              </div>
            )}

            {/* 2. Habitable Floors Stack (From Building Model) */}
            {buildingModel.floors.map((floorItem) => {
              const displayFloorNumber = isStilt ? floorItem.floorIndex + 1 : floorItem.floorIndex;
              const displayFloorTitle = isStilt
                ? `Level ${displayFloorNumber}: ${floorItem.floorName} (Above Stilt)`
                : floorItem.floorName;

              return (
                <div
                  key={floorItem.floorIndex}
                  className="p-4 rounded-2xl border border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 transition-all space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#E8EFE9] border border-[#B7CDBB] text-[#183B32] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        L{displayFloorNumber}
                      </div>
                      <span className="text-xs font-black text-[#18211E]">
                        {displayFloorTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[11px] text-[#687770]">
                        {floorItem.spaces.length} space{floorItem.spaces.length !== 1 ? 's' : ''}
                      </span>
                      <span className="font-mono font-bold text-[#183B32]">
                        ~{floorItem.floorAreaSqFt.toLocaleString()} sq.ft
                      </span>
                    </div>
                  </div>

                  {/* Spaces Tag List */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {floorItem.spaces.map((space) => (
                      <span
                        key={space.id}
                        className="px-2.5 py-1 rounded-lg bg-[#F8F8F6] border border-[#CBD5CB]/70 text-[11px] font-medium text-[#202522] inline-flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#183B32]/50" />
                        <span>{space.name}</span>
                        <span className="text-[10px] font-mono text-[#687770]">({space.area} sq.ft)</span>
                      </span>
                    ))}
                    {floorItem.spaces.length === 0 && (
                      <span className="text-[11px] text-[#687770] italic">
                        Open structural floor area allocated for personalized layout.
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 3. Rooftop Terrace Level */}
            <div className="p-3.5 rounded-2xl border border-[#CBD5CB] bg-[#F8F8F6] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#CBD5CB] text-[#183B32] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  ROOF
                </div>
                <div>
                  <span className="font-bold text-[#18211E] block">
                    Terrace Level &amp; Overhead Water Tank
                  </span>
                  <span className="text-[10px] text-[#687770]">
                    Weatherproof screed slab, parapet wall &amp; solar/water tank platform
                  </span>
                </div>
              </div>
              <span className="font-mono font-bold text-[#183B32]">
                ~{area.terraceSqFt.toLocaleString()} sq.ft
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 6: LIVE BUILT-UP AREA & FEASIBILITY FEEDBACK ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E] flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-[#C66B4E]" />
            6. Built-up area summary &amp; planning feasibility
          </label>
          <span className="text-[11px] text-[#66716B]">Engine-verified calculation metrics</span>
        </div>

        {/* 4 Architectural Summary Pillars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Pillar 1: Total BUA */}
          <div className="p-3.5 bg-[#183B32] text-white rounded-2xl">
            <span className="text-[10px] text-white/70 font-bold block uppercase tracking-wider">
              1. Total Habitable BUA
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-white block mt-0.5">
              {totalBuaSqFt.toLocaleString()} sq.ft
            </span>
            <span className="text-[10px] text-white/70 mt-0.5 block">
              Across {habitableFloors} habitable floor{habitableFloors > 1 ? 's' : ''}
            </span>
          </div>

          {/* Pillar 2: Floor Footprint */}
          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#CBD5CB]">
            <span className="text-[10px] text-[#687770] font-bold block uppercase tracking-wider">
              2. Ground Floor Footprint
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#183B32] block mt-0.5">
              {buaPerFloorSqFt.toLocaleString()} sq.ft
            </span>
            <span className="text-[10px] text-[#687770] mt-0.5 block">
              Per structural floor level
            </span>
          </div>

          {/* Pillar 3: Super BUA */}
          <div className="p-3.5 bg-[#E8EFE9] rounded-2xl border border-[#B7CDBB]">
            <span className="text-[10px] text-[#183B32] font-bold block uppercase tracking-wider">
              3. Super Built-Up Area
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#183B32] block mt-0.5">
              {superBuaSqFt.toLocaleString()} sq.ft
            </span>
            <span className="text-[10px] text-[#183B32]/80 mt-0.5 block">
              Incl. walls, ducts &amp; staircases
            </span>
          </div>

          {/* Pillar 4: Total Constructed Space */}
          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#CBD5CB]">
            <span className="text-[10px] text-[#687770] font-bold block uppercase tracking-wider">
              4. Total Construction Scope
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#183B32] block mt-0.5">
              {area.totalConstructedSqFt.toLocaleString()} sq.ft
            </span>
            <span className="text-[10px] text-[#687770] mt-0.5 block">
              BUA + Parking ({totalParkingAreaSqFt}) + Roof
            </span>
          </div>
        </div>

        {/* Planning Feasibility Feedback Card */}
        <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
          validationState === 'valid'
            ? 'bg-[#E8EFE9]/60 border-[#183B32]/30 text-[#183B32]'
            : validationState === 'above_recommended'
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-red-50 border-red-200 text-red-950'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {validationState === 'valid' ? (
              <ShieldCheck className="w-4 h-4 text-[#183B32]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#C66B4E]" />
            )}
            <span>
              {validationState === 'valid'
                ? 'Proposed Configuration Fits Within Planning Envelope'
                : validationState === 'above_recommended'
                ? 'Design Notice: Configuration Above Standard Recommendation'
                : 'Zoning Notice: Proposed Area Exceeds Permissible Limits'}
            </span>
          </div>

          <p className="text-[11px] leading-relaxed">
            {confirmationMessage || (
              <>
                Your proposed ground floor footprint (<strong>{buaPerFloorSqFt.toLocaleString()} sq.ft</strong>) is within the maximum buildable ground floor cap (<strong>{maxGroundFootprintSqFt.toLocaleString()} sq.ft</strong>). Total proposed BUA of <strong>{totalBuaSqFt.toLocaleString()} sq.ft</strong> complies with applicable municipal FAR guidelines.
              </>
            )}
          </p>

          <div className="pt-1.5 border-t border-current/15 flex flex-wrap items-center justify-between gap-2 text-[10px] opacity-85">
            <span>Ground Coverage Cap: <strong>{coverageLimitSqFt.toLocaleString()} sq.ft ({area.maxPermissibleCoveragePct}%)</strong></span>
            <span>Permissible FAR Scope: <strong>{permissibleFarBuaSqFt.toLocaleString()} sq.ft (FAR {area.permissibleFAR})</strong></span>
          </div>
        </div>
      </div>

      {/* ── ARCHITECTURAL FLOOR PLAN PREVIEW VISUAL ── */}
      <ArchitecturalFloorPlanVisual
        buaSqFt={totalBuaSqFt}
        bedrooms={rooms?.bedrooms || 3}
        bathrooms={rooms?.bathrooms || 3}
        hasKitchen={Boolean(rooms?.kitchen)}
        hasBalcony={Boolean(rooms?.balcony)}
        floors={floors}
      />

      {/* ── SECTION 7: CONSTRUCTION START TIMELINE ── */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E] flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#183B32]" />
          7. When do you hope to break ground?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {TIMELINE_OPTIONS.map((time) => {
            const isSelected = activeTimeline === time.id;
            return (
              <button
                key={time.id}
                type="button"
                onClick={() => setStartTimeline(time.id)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#183B32] bg-[#183B32] text-white shadow-2xs'
                    : 'border-[#CBD5CB] bg-white text-[#4B5563] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                }`}
              >
                <span className={`block text-xs font-bold ${isSelected ? 'text-white' : 'text-[#202522]'}`}>
                  {time.label}
                </span>
                <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#687770]'}`}>
                  {time.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STATUTORY PLANNING & ESTIMATION DISCLOSURE ── */}
      <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200/90 flex items-start gap-3 text-left">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 leading-relaxed space-y-1.5">
          <strong className="block font-bold text-amber-950">
            Important Architectural Planning Disclosure:
          </strong>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            Floor-wise area breakdowns and room distributions shown above represent theoretical architectural distributions calculated by the Hutty planning model. Actual column grid spacing, beam depth, duct positioning, and parking maneuverability must be reviewed and sanctioned by a licensed structural engineer and municipal planning authority before construction execution.
          </p>
        </div>
      </div>
    </div>
  );
};

