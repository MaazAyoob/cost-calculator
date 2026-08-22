import React from 'react';
import { useWizardStore, CityLocation, HouseType, ParkingTypeOption } from '../../../store/useWizardStore';
import { useArea } from '../../../store/useCalculationStore';
import { AlertTriangle, Check, Ruler, Sparkles } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Step1BasicInfo: React.FC = () => {
  const {
    city,
    plotLength,
    plotWidth,
    builtUpAreaPerFloor,
    floors,
    houseType,
    parkingType,
    carCount,
    bikeCount,
    evCharging,
    setCity,
    setPlotDimensions,
    setBuiltUpAreaPerFloor,
    setHouseConfig,
    setParkingConfig,
    updateRoomCount,
    setLiftRequired,
    setCoreMaterials,
    setFlooringZone,
    setDoorSelection,
    setWindowSelection,
    setBathroomFittingSelection,
    setPaintingSelection,
  } = useWizardStore();

  const area = useArea();
  const plotArea = plotLength * plotWidth;
  const maxAllowable = area.maxAllowableBUAPerFloorSqFt || Math.round(plotArea * 0.6);
  const isExceeding = builtUpAreaPerFloor > maxAllowable && maxAllowable > 0;

  const cities: { id: CityLocation; name: string; authority: string }[] = [
    { id: 'Bangalore', name: 'Bengaluru', authority: 'BBMP / BDA' },
    { id: 'Mysore', name: 'Mysuru', authority: 'MUDA' },
  ];

  const standardPlotPresets = [
    { label: '30 × 40', l: 40, w: 30 },
    { label: '30 × 50', l: 50, w: 30 },
    { label: '40 × 60', l: 60, w: 40 },
    { label: '50 × 80', l: 80, w: 50 },
  ];

  const archetypePresets = [
    {
      id: 'duplex-3040',
      label: '30×40 Duplex (3BHK)',
      city: 'Bangalore' as CityLocation,
      length: 40,
      width: 30,
      floors: 2,
      buaPerFloor: 720,
      houseType: 'Duplex' as HouseType,
      parking: 'Normal Ground' as ParkingTypeOption,
      rooms: { bedrooms: 3, bathrooms: 3, living: 1, kitchen: 1, dining: 1, balcony: 1, commonToilets: 1, pooja: 1, utility: 1, office: 0, storeRoom: 0 },
      lift: false,
    },
    {
      id: 'triplex-3050',
      label: '30×50 Triplex (4BHK)',
      city: 'Bangalore' as CityLocation,
      length: 50,
      width: 30,
      floors: 3,
      buaPerFloor: 900,
      houseType: 'Triplex' as HouseType,
      parking: 'Normal Ground' as ParkingTypeOption,
      rooms: { bedrooms: 4, bathrooms: 4, living: 1, kitchen: 1, dining: 1, balcony: 2, commonToilets: 1, pooja: 1, utility: 1, office: 1, storeRoom: 1 },
      lift: false,
    },
    {
      id: 'luxury-4060',
      label: '40×60 Villa (4BHK)',
      city: 'Bangalore' as CityLocation,
      length: 60,
      width: 40,
      floors: 2,
      buaPerFloor: 1440,
      houseType: 'Duplex' as HouseType,
      parking: 'EV Charging Ready' as ParkingTypeOption,
      rooms: { bedrooms: 4, bathrooms: 5, living: 2, kitchen: 1, dining: 1, balcony: 2, commonToilets: 1, pooja: 1, utility: 1, office: 1, storeRoom: 1 },
      lift: false,
    },
    {
      id: 'rental-3050',
      label: '30×50 Rental G+3',
      city: 'Bangalore' as CityLocation,
      length: 50,
      width: 30,
      floors: 4,
      buaPerFloor: 900,
      houseType: 'Rental Units' as HouseType,
      parking: 'Stilt' as ParkingTypeOption,
      rooms: { bedrooms: 6, bathrooms: 6, living: 2, kitchen: 2, dining: 2, balcony: 2, commonToilets: 1, pooja: 1, utility: 2, office: 0, storeRoom: 0 },
      lift: true,
    },
  ];

  const applyArchetype = (preset: typeof archetypePresets[0]) => {
    setCity(preset.city);
    setPlotDimensions(preset.length, preset.width);
    setBuiltUpAreaPerFloor(preset.buaPerFloor);
    setHouseConfig(preset.houseType, preset.floors);
    setParkingConfig(preset.parking, 1, 1, preset.parking === 'EV Charging Ready');
    setLiftRequired(preset.lift);

    Object.entries(preset.rooms).forEach(([k, targetVal]) => {
      const current = useWizardStore.getState().rooms[k as keyof typeof preset.rooms] || 0;
      const delta = targetVal - current;
      if (delta !== 0) updateRoomCount(k as any, delta);
    });

    setCoreMaterials('Tata Tiscon', 'UltraTech');
    setDoorSelection('mainDoor', 'Premium Teak');
    setDoorSelection('internalDoor', 'Flush Door');
    setDoorSelection('bathroomDoor', 'WPC Door');
    setWindowSelection('uPVC', 'Standard uPVC');
    setBathroomFittingSelection('Premium (Jaquar / Kohler / Grohe)', 'Ashirwad');
    setPaintingSelection('Premium Emulsion', 'Ultima Weather Proof', 'Asian Paints');
  };

  const floorOptions = [
    { value: 1, label: 'Ground (G)' },
    { value: 2, label: 'G + 1' },
    { value: 3, label: 'G + 2' },
    { value: 4, label: 'G + 3' },
    { value: 5, label: 'G + 4' },
  ];

  const houseTypeOptions: { id: HouseType; label: string }[] = [
    { id: 'Duplex', label: 'Single Family Villa' },
    { id: 'Triplex', label: 'Triplex Residence' },
    { id: 'Rental Units', label: 'Owner + Rental Flats' },
    { id: 'Mixed Use', label: 'Mixed Commercial / Resi' },
  ];

  const parkingOptions: { id: ParkingTypeOption; label: string }[] = [
    { id: 'Normal Ground', label: 'Ground Porch' },
    { id: 'Stilt', label: 'Covered Stilt' },
    { id: 'EV Charging Ready', label: 'EV Dedicated Bay' },
  ];

  return (
    <div className="space-y-4 text-left select-none">
      
      {/* ── HEADER & TEMPLATE PILLS ── */}
      <div className="space-y-2 pb-1 border-b border-[#E5E7EB]">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
              STEP 01
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1B3D34] tracking-tight font-heading">
              Define your plot
            </h1>
          </div>

          {/* Quick Starter Templates */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
            <span className="text-[10px] font-bold uppercase text-[#4B5563] shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F28C28]" />
              Templates:
            </span>
            {archetypePresets.map((arch) => (
              <button
                key={arch.id}
                type="button"
                onClick={() => applyArchetype(arch)}
                className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#F8F8F6] hover:bg-[rgba(27,61,52,0.06)] text-[#1B3D34] border border-[#E5E7EB] hover:border-[#1B3D34] transition-all shrink-0 cursor-pointer"
              >
                {arch.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 1: SITE LOCATION & PLOT DIMENSIONS ── */}
      <div className="space-y-2.5">
        
        {/* City Location */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider">
            Site Location
          </label>
          <div className="flex items-center gap-1.5">
            {cities.map((item) => {
              const isSelected = city === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCity(item.id)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                    isSelected
                      ? 'bg-[#1B3D34] text-white border-[#1B3D34]'
                      : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#F8F8F6]'
                  )}
                >
                  {item.name} ({item.authority})
                </button>
              );
            })}
          </div>
        </div>

        {/* Plot Dimensions */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#1B3D34] uppercase tracking-wider flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-[#1B3D34]" />
              Plot Dimensions
            </span>
            <div className="flex items-center gap-1">
              {standardPlotPresets.map((p) => {
                const isMatch = plotLength === p.l && plotWidth === p.w;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPlotDimensions(p.l, p.w)}
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded border transition-all cursor-pointer',
                      isMatch
                        ? 'bg-[#1B3D34] text-white border-[#1B3D34]'
                        : 'bg-[#F8F8F6] text-[#4B5563] border-[#E5E7EB] hover:bg-white'
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Length */}
            <div className="space-y-1 p-2 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#4B5563] text-[11px]">Length (Depth)</span>
                <span className="font-mono text-[#1B3D34] text-xs">{plotLength || 0} ft</span>
              </div>
              <input
                type="range"
                min={0}
                max={120}
                step={1}
                value={plotLength}
                onChange={(e) => setPlotDimensions(Number(e.target.value), plotWidth || 30)}
                className="w-full h-1.5 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#1B3D34]"
              />
            </div>

            {/* Width */}
            <div className="space-y-1 p-2 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#4B5563] text-[11px]">Width (Frontage)</span>
                <span className="font-mono text-[#1B3D34] text-xs">{plotWidth || 0} ft</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={plotWidth}
                onChange={(e) => setPlotDimensions(plotLength || 40, Number(e.target.value))}
                className="w-full h-1.5 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#1B3D34]"
              />
            </div>
          </div>
        </div>

      </div>

      {/* ── 2-COLUMN GRID: [STOREYS & FOOTPRINT] + [USAGE & PARKING] ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#E5E7EB]">
        
        {/* LEFT COLUMN: Storeys & Built-up Footprint */}
        <div className="space-y-2.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
              Storeys / Floors
            </label>
            <div className="grid grid-cols-5 gap-1">
              {floorOptions.map((opt) => {
                const isSelected = floors === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHouseConfig(houseType || 'Duplex', opt.value)}
                    className={cn(
                      'py-1.5 rounded-lg text-xs font-bold font-mono transition-all text-center cursor-pointer border',
                      isSelected
                        ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                        : 'bg-white text-[#1B3D34] border-[#E5E7EB] hover:bg-[#F8F8F6]'
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#1B3D34] uppercase tracking-wider text-[11px]">
                Footprint / Floor
              </span>
              <span className="font-mono font-bold text-[#1B3D34] text-xs">
                {builtUpAreaPerFloor > 0 ? `${builtUpAreaPerFloor.toLocaleString()} sq.ft` : '0 sq.ft'}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={plotArea > 0 ? plotArea : 3000}
              step={10}
              value={builtUpAreaPerFloor}
              disabled={plotArea === 0}
              onChange={(e) => setBuiltUpAreaPerFloor(Number(e.target.value))}
              className="w-full h-1.5 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#1B3D34] disabled:opacity-40"
            />

            {plotArea > 0 && (
              <span className="text-[10px] text-[#4B5563] block truncate">
                Setbacks: Front {area.setbacks?.frontSetbackFt ?? 3.5}' • Rear {area.setbacks?.rearSetbackFt ?? 3.0}' • Sides {area.setbacks?.leftSetbackFt ?? 3.0}'
              </span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Dwelling Usage & Parking */}
        <div className="space-y-2.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
              Dwelling Type
            </label>
            <div className="grid grid-cols-2 gap-1">
              {houseTypeOptions.map((ht) => {
                const isSelected = (houseType || 'Duplex') === ht.id;
                return (
                  <button
                    key={ht.id}
                    type="button"
                    onClick={() => setHouseConfig(ht.id, floors || 2)}
                    className={cn(
                      'p-2 rounded-lg text-xs font-bold transition-all text-left flex justify-between items-center border cursor-pointer',
                      isSelected
                        ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] text-[#1B3D34] ring-1 ring-[#1B3D34]'
                        : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#F8F8F6]'
                    )}
                  >
                    <span className="truncate">{ht.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-[#1B3D34] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
              Parking Type
            </label>
            <div className="grid grid-cols-3 gap-1">
              {parkingOptions.map((p) => {
                const isSelected = (parkingType || 'Normal Ground') === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setParkingConfig(p.id, carCount || 1, bikeCount || 1, p.id === 'EV Charging Ready' ? true : evCharging)}
                    className={cn(
                      'p-1.5 rounded-lg text-xs font-bold transition-all text-left border cursor-pointer',
                      isSelected
                        ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] text-[#1B3D34] ring-1 ring-[#1B3D34]'
                        : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#F8F8F6]'
                    )}
                  >
                    <span className="truncate block text-[11px]">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
