import React, { useState, useEffect } from 'react';
import { useWizardStore, HouseType, ParkingTypeOption } from '../../../store/useWizardStore';
import { Home, Car, Calendar, Users, Zap, Check, Sparkles, Trees } from 'lucide-react';

interface FloorCard {
  count: number;
  label: string;
  sub: string;
  popular?: boolean;
}

const FLOOR_CARDS: FloorCard[] = [
  { count: 1, label: 'Ground Floor', sub: 'Ground floor only' },
  { count: 2, label: 'Ground + 1', sub: 'Ground floor plus one upper floor', popular: true },
  { count: 3, label: 'Ground + 2', sub: 'Ground floor plus two upper floors' },
  { count: 4, label: 'Ground + 3', sub: 'Ground floor plus three upper floors' },
  { count: 5, label: 'Ground + 4', sub: 'Ground floor plus four upper floors' },
];

const PURPOSE_OPTIONS: { id: HouseType; label: string; desc: string; icon: any }[] = [
  { id: 'Duplex', label: 'Single Family Home', desc: 'Designed exclusively for your family with private living spaces', icon: Home },
  { id: 'Rental Units', label: 'Self-Use + Rental Units', desc: 'Live on one floor, rent out additional floors for monthly income', icon: Users },
  { id: 'Triplex', label: 'Independent Villa / Triplex', desc: 'Spacious multi-level luxury residence with expansive terraces', icon: Sparkles },
  { id: 'Farmhouse', label: 'Farmhouse / Weekend Villa', desc: 'Serene getaway home with expansive verandahs and green surroundings', icon: Trees },
];

const PARKING_OPTIONS: { id: ParkingTypeOption; label: string; desc: string }[] = [
  { id: 'Normal Ground', label: 'Ground Level Parking', desc: 'Car porch or open driveway parking space' },
  { id: 'Stilt', label: 'Dedicated Stilt Floor', desc: 'Entire ground floor dedicated to covered parking & security' },
];

const TIMELINE_OPTIONS = [
  { id: 'immediate', label: 'Immediately', desc: 'Within 30 days' },
  { id: '1-3_months', label: 'In 1–3 Months', desc: 'Finalizing drawings & approvals' },
  { id: '3-6_months', label: 'In 3–6 Months', desc: 'Early planning stage' },
  { id: 'not_sure', label: 'Just Exploring', desc: 'Checking cost feasibility' },
];

export const Stage2Home: React.FC = () => {
  const store = useWizardStore();
  const {
    floors,
    houseType,
    parkingType,
    evCharging,
    carCount,
    setHouseConfig,
    setParkingConfig,
  } = store;

  const [selectedFloor, setSelectedFloor] = useState<number>(floors > 0 ? floors : 2);
  const [selectedPurpose, setSelectedPurpose] = useState<HouseType>(houseType || 'Duplex');
  const [selectedParking, setSelectedParking] = useState<ParkingTypeOption>(parkingType || 'Normal Ground');
  const [isEvReady, setIsEvReady] = useState<boolean>(evCharging || false);
  const [selectedCars, setSelectedCars] = useState<number>(carCount > 0 ? carCount : 1);
  const [selectedTimeline, setSelectedTimeline] = useState<string>(store.startTimeline || '1-3_months');

  // Synchronize initial defaults to wizard store so calculation engine has accurate floor count and configuration immediately
  useEffect(() => {
    const effFloors = floors > 0 ? floors : 2;
    const effPurpose = houseType || 'Duplex';
    const effParking = parkingType || 'Normal Ground';
    const effCars = carCount > 0 ? carCount : 1;
    setHouseConfig(effPurpose, effFloors);
    setParkingConfig(effParking, effCars, 2, evCharging);
    if (!store.startTimeline) {
      store.setStartTimeline('1-3_months');
    }
  }, []);

  const handleFloorSelect = (count: number) => {
    setSelectedFloor(count);
    setHouseConfig(selectedPurpose, count);
  };

  const handlePurposeSelect = (purpose: HouseType) => {
    setSelectedPurpose(purpose);
    setHouseConfig(purpose, selectedFloor);
  };

  const handleParkingSelect = (parking: ParkingTypeOption) => {
    setSelectedParking(parking);
    setParkingConfig(parking, selectedCars, 2, isEvReady);
  };

  const handleEvToggle = () => {
    const nextVal = !isEvReady;
    setIsEvReady(nextVal);
    setParkingConfig(selectedParking, selectedCars, 2, nextVal);
  };

  const handleCarCountChange = (delta: number) => {
    const nextVal = Math.max(0, Math.min(6, selectedCars + delta));
    setSelectedCars(nextVal);
    setParkingConfig(selectedParking, nextVal, 2, isEvReady);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Stage Header */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF3EF] border border-[#D5E5DC] text-[11px] font-bold text-[#1B3D34]">
          <Home className="w-3 h-3 text-[#F28C28]" />
          <span>STAGE 2 OF 8 &bull; YOUR HOME</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
          What kind of home are you planning?
        </h2>
        <p className="text-xs sm:text-sm text-[#707873]">
          Choose the number of floors, home purpose, and parking. Your floor count stays synchronized with your estimate and buildable area.
        </p>
      </div>

      {/* 1. Floor Count Visual Selection Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E]">
            1. How many floors would you like?
          </label>
          <span className="text-[11px] text-[#707873]">Ground to Ground + 4</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {FLOOR_CARDS.map((floor) => {
            const isSelected = selectedFloor === floor.count;
            return (
              <button
                key={floor.count}
                type="button"
                onClick={() => handleFloorSelect(floor.count)}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#1B3D34] bg-[#1B3D34] text-white shadow-xs'
                    : 'border-[#E5E7EB] bg-white text-[#202522] hover:border-[#1B3D34]/40 hover:bg-[#F8F9F7]'
                }`}
              >
                {floor.popular && (
                  <span className={`absolute -top-2 right-2 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    isSelected ? 'bg-[#F28C28] text-white' : 'bg-[#EBF3EF] text-[#1B3D34] border border-[#D5E5DC]'
                  }`}>
                    Popular
                  </span>
                )}
                <span className="block text-lg font-black font-mono">{floor.label}</span>
                <span className={`block text-[11px] mt-0.5 leading-tight ${isSelected ? 'text-white/80' : 'text-[#687770]'}`}>
                  {floor.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Intended Use / House Purpose */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3D34]">
          2. What kind of home are you planning?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PURPOSE_OPTIONS.map((opt) => {
            const isSelected = selectedPurpose === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handlePurposeSelect(opt.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-[#1B3D34] bg-[#EBF3EF] shadow-2xs'
                    : 'border-[#E5E7EB] bg-white hover:border-[#1B3D34]/30 hover:bg-[#F8F9F7]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#CBD5CB] flex items-center justify-center text-[#1B3D34]">
                    <Icon className="w-4 h-4 text-[#1B3D34]" />
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#1B3D34]" />}
                </div>
                <div>
                  <span className="block text-sm font-bold text-[#1B3D34]">{opt.label}</span>
                  <span className="block text-xs text-[#687770] leading-relaxed mt-1">
                    {opt.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Parking Preferences */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3D34]">
          3. Do you need parking?
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PARKING_OPTIONS.map((park) => {
            const isSelected = selectedParking === park.id;
            return (
              <button
                key={park.id}
                type="button"
                onClick={() => handleParkingSelect(park.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[#1B3D34] bg-[#EBF3EF] shadow-2xs'
                    : 'border-[#E5E7EB] bg-white hover:border-[#1B3D34]/30'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#1B3D34] block">{park.label}</span>
                  <span className="text-[11px] text-[#687770] block">{park.desc}</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-[#1B3D34] bg-[#1B3D34]' : 'border-[#CBD5CB] bg-white'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Car slots & EV charging toggle */}
        <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Car className="w-4 h-4 text-[#1B3D34]" />
            <span className="text-xs font-medium text-[#202522]">Number of Cars to Park:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCarCountChange(-1)}
                className="w-7 h-7 rounded-lg border border-[#E5E7EB] bg-[#F8F8F6] text-[#1B3D34] font-bold text-sm hover:bg-[#EBF3EF] flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <span className="text-sm font-mono font-bold text-[#1B3D34] min-w-[20px] text-center">
                {selectedCars}
              </span>
              <button
                type="button"
                onClick={() => handleCarCountChange(1)}
                className="w-7 h-7 rounded-lg border border-[#E5E7EB] bg-[#F8F8F6] text-[#1B3D34] font-bold text-sm hover:bg-[#EBF3EF] flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEvToggle}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isEvReady
                ? 'border-[#1B3D34] bg-[#1B3D34] text-white'
                : 'border-[#E5E7EB] bg-[#F8F8F6] text-[#4B5563] hover:border-[#1B3D34]/40'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isEvReady ? 'text-[#F28C28]' : 'text-[#687770]'}`} />
            <span>EV Charging Ready</span>
          </button>
        </div>
      </div>

      {/* 4. Construction Start Timeline */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3D34]">
          4. When do you hope to start?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {TIMELINE_OPTIONS.map((time) => {
            const isSelected = selectedTimeline === time.id;
            return (
              <button
                key={time.id}
                type="button"
                onClick={() => {
                  setSelectedTimeline(time.id);
                  store.setStartTimeline(time.id);
                }}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#1B3D34] bg-[#1B3D34] text-white shadow-2xs'
                    : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#1B3D34]/40 hover:bg-[#F8F9F7]'
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

    </div>
  );
};
