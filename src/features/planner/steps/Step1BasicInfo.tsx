import React from 'react';
import { useWizardStore, CityLocation, HouseType, ParkingTypeOption } from '../../../store/useWizardStore';
import { useArea } from '../../../store/useCalculationStore';
import { AlertTriangle, Check, Ruler, Sparkles, MapPin, Building, Car, Sliders } from 'lucide-react';
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
    { value: 1, title: 'Ground', sub: '1 floor' },
    { value: 2, title: 'G+1', sub: '2 floors' },
    { value: 3, title: 'G+2', sub: '3 floors' },
    { value: 4, title: 'G+3', sub: '4 floors' },
    { value: 5, title: 'G+4', sub: '5 floors' },
  ];

  const houseTypeOptions: { id: HouseType; label: string; desc: string }[] = [
    { id: 'Duplex', label: 'Independent Villa', desc: 'Single continuous residence' },
    { id: 'Triplex', label: 'Triplex House', desc: 'Multi-level family residence' },
    { id: 'Rental Units', label: 'Owner + Rental', desc: 'Separate residential flats' },
    { id: 'Mixed Use', label: 'Mixed Commercial', desc: 'Ground retail / upper residential' },
  ];

  const parkingOptions: { id: ParkingTypeOption; label: string; desc: string }[] = [
    { id: 'Normal Ground', label: 'Open Ground', desc: 'Front driveway / porch' },
    { id: 'Stilt', label: 'Covered Stilt', desc: 'RCC stilt ground floor' },
    { id: 'EV Charging Ready', label: 'EV Dedicated', desc: 'Dedicated charging point' },
  ];

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
            STEP 01
          </span>
          {/* Subtle preset templates */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase text-[#4B5563] hidden sm:inline mr-1">
              Presets:
            </span>
            {archetypePresets.map((arch) => (
              <button
                key={arch.id}
                type="button"
                onClick={() => applyArchetype(arch)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F8F8F6] hover:bg-[rgba(27,61,52,0.06)] text-[#1B3D34] border border-[#E5E7EB] hover:border-[#1B3D34] transition-all cursor-pointer"
              >
                {arch.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading leading-tight">
          BUILD YOUR HOME
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Start with your site details and architectural storeys.
        </p>
      </div>

      {/* ── 1. SITE LOCATION & DIMENSIONS ── */}
      <div className="space-y-3">
        
        {/* City Location Cards */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
            Site Location
          </label>
          <div className="grid grid-cols-2 gap-2">
            {cities.map((item) => {
              const isSelected = city === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setCity(item.id)}
                  className={cn(
                    'hutty-tactile-card flex items-center justify-between',
                    isSelected && 'hutty-tactile-card-selected'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={cn('w-4 h-4', isSelected ? 'text-[#1B3D34]' : 'text-[#4B5563]')} />
                    <div>
                      <h4 className="text-xs font-bold text-[#1B3D34]">{item.name}</h4>
                      <p className="text-[10px] text-[#4B5563]">{item.authority} Bylaws</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tactile Plot Dimensions */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-[#1B3D34] uppercase tracking-wider flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-[#1B3D34]" />
              Plot Dimensions
            </label>
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

          <div className="grid grid-cols-2 gap-3">
            {/* Tactile Length Box */}
            <div className="hutty-number-box space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563]">
                  Length (Depth)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-[#1B3D34] font-mono leading-none">
                    {plotLength || 0}
                  </span>
                  <span className="text-xs font-bold text-[#4B5563]">ft</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={120}
                step={1}
                value={plotLength}
                onChange={(e) => setPlotDimensions(Number(e.target.value), plotWidth || 30)}
                className="hutty-slider"
              />
            </div>

            {/* Tactile Width Box */}
            <div className="hutty-number-box space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563]">
                  Width (Frontage)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-[#1B3D34] font-mono leading-none">
                    {plotWidth || 0}
                  </span>
                  <span className="text-xs font-bold text-[#4B5563]">ft</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={plotWidth}
                onChange={(e) => setPlotDimensions(plotLength || 40, Number(e.target.value))}
                className="hutty-slider"
              />
            </div>
          </div>
        </div>

      </div>

      {/* ── 2. NUMBER OF FLOORS (Tactile Architectural Tiles) ── */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Number of Floors
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {floorOptions.map((opt) => {
            const isSelected = floors === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => setHouseConfig(houseType || 'Duplex', opt.value)}
                className={cn(
                  'hutty-tactile-card text-center p-2.5 flex flex-col items-center justify-center',
                  isSelected && 'hutty-tactile-card-selected'
                )}
              >
                <span className="text-xs font-extrabold font-mono text-[#1B3D34] block">
                  {opt.title}
                </span>
                <span className="text-[10px] text-[#4B5563] block font-medium">
                  {opt.sub}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. HOUSE TYPE & PARKING (Tactile Architectural Choice Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E5E7EB]">
        
        {/* House Type */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
            House Type
          </label>
          <div className="space-y-1.5">
            {houseTypeOptions.map((ht) => {
              const isSelected = (houseType || 'Duplex') === ht.id;
              return (
                <div
                  key={ht.id}
                  onClick={() => setHouseConfig(ht.id, floors || 2)}
                  className={cn(
                    'hutty-tactile-card py-2 px-3 flex items-center justify-between',
                    isSelected && 'hutty-tactile-card-selected'
                  )}
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#1B3D34]">{ht.label}</h4>
                    <p className="text-[10px] text-[#4B5563]">{ht.desc}</p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Parking Type */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
            Parking Configuration
          </label>
          <div className="space-y-1.5">
            {parkingOptions.map((p) => {
              const isSelected = (parkingType || 'Normal Ground') === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setParkingConfig(p.id, carCount || 1, bikeCount || 1, p.id === 'EV Charging Ready' ? true : evCharging)}
                  className={cn(
                    'hutty-tactile-card py-2 px-3 flex items-center justify-between',
                    isSelected && 'hutty-tactile-card-selected'
                  )}
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#1B3D34]">{p.label}</h4>
                    <p className="text-[10px] text-[#4B5563]">{p.desc}</p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── 4. BUILT-UP FOOTPRINT & SETBACKS ── */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-[#1B3D34] uppercase tracking-wider">
            Built-Up Footprint per Floor
          </span>
          <span className="font-mono font-extrabold text-[#1B3D34] text-xs">
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
          className="hutty-slider disabled:opacity-40"
        />

        {plotArea > 0 && (
          <div className="flex justify-between items-center text-[11px] text-[#4B5563] pt-0.5">
            <span>Setbacks: Front {area.setbacks?.frontSetbackFt ?? 3.5}' • Rear {area.setbacks?.rearSetbackFt ?? 3.0}' • Sides {area.setbacks?.leftSetbackFt ?? 3.0}'</span>
            <span className="font-mono">Max: {maxAllowable.toLocaleString()} sq.ft</span>
          </div>
        )}
      </div>

    </div>
  );
};
