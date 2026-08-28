import React, { useState } from 'react';
import { useWizardStore, CityLocation, HouseType, ParkingTypeOption } from '../../../store/useWizardStore';
import { useArea } from '../../../store/useCalculationStore';
import { Check, Ruler, MapPin, ChevronDown, ChevronUp, Info, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Step1BasicInfo: React.FC = () => {
  const {
    city,
    plotLength,
    plotWidth,
    roadWidthFt,
    userSelectedBUA,
    floors,
    houseType,
    parkingType,
    carCount,
    bikeCount,
    evCharging,
    setCity,
    setPlotDimensions,
    setRoadWidth,
    setUserSelectedBUA,
    setHouseConfig,
    setParkingConfig,
    updateRoomCount,
    setLiftRequired,
    setCoreMaterials,
    setDoorSelection,
    setWindowSelection,
    setBathroomFittingSelection,
    setPaintingSelection,
  } = useWizardStore();

  const area = useArea();
  const [showHowCalculated, setShowHowCalculated] = useState(false);

  const plotArea = plotLength * plotWidth;
  const numFloors = Math.max(1, floors || 1);

  // Authority values from calculation engine
  const recBUA = area.recommendedBUATotalSqFt || (numFloors * 720);
  const maxBUA = area.maximumPermissibleBUASqFt || (numFloors * 800);
  const minBUA = area.minimumBUASqFt || (numFloors * 350);
  const activeBUA = area.totalBUASqFt || recBUA;
  const buaPerFloor = Math.round(activeBUA / numFloors);

  // Slider bounds (allow slider up to maxBUA * 1.15 to let user see state C warning if needed)
  const sliderMin = Math.max(100, Math.min(minBUA, activeBUA));
  const sliderMax = Math.max(sliderMin + 200, Math.round(maxBUA * 1.15));

  const validationState = area.validationState || 'valid';

  const cities: { id: CityLocation; name: string; authority: string }[] = [
    { id: 'Bangalore', name: 'Bengaluru', authority: 'BBMP / BDA' },
    { id: 'Mysore', name: 'Mysuru', authority: 'MUDA / MDA' },
  ];

  const standardPlotPresets = [
    { label: '30 × 40', l: 40, w: 30 },
    { label: '30 × 50', l: 50, w: 30 },
    { label: '40 × 60', l: 60, w: 40 },
    { label: '50 × 80', l: 80, w: 50 },
  ];

  const roadWidthOptions = [
    { value: 24, label: '< 30 ft', sub: 'Narrow' },
    { value: 30, label: '30 ft (9m)', sub: 'Standard' },
    { value: 40, label: '40 ft (12m)', sub: 'Medium' },
    { value: 50, label: '50 ft+ (15m+)', sub: 'Wide' },
  ];

  const archetypePresets = [
    {
      id: 'duplex-3040',
      label: '30×40 Duplex (3BHK)',
      city: 'Bangalore' as CityLocation,
      length: 40,
      width: 30,
      roadWidth: 30,
      floors: 2,
      buaTotal: 1440,
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
      roadWidth: 30,
      floors: 3,
      buaTotal: 2700,
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
      roadWidth: 40,
      floors: 2,
      buaTotal: 2880,
      houseType: 'Duplex' as HouseType,
      parking: 'EV Charging Ready' as ParkingTypeOption,
      rooms: { bedrooms: 4, bathrooms: 5, living: 2, kitchen: 1, dining: 1, balcony: 2, commonToilets: 1, pooja: 1, utility: 1, office: 1, storeRoom: 1 },
      lift: false,
    },
  ];

  const applyArchetype = (preset: typeof archetypePresets[0]) => {
    setCity(preset.city);
    setPlotDimensions(preset.length, preset.width);
    setRoadWidth(preset.roadWidth);
    setUserSelectedBUA(preset.buaTotal);
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

  // Calculate percentage position of recommended marker on slider
  const recMarkerPct = Math.max(0, Math.min(100, ((recBUA - sliderMin) / (sliderMax - sliderMin)) * 100));

  return (
    <div className="space-y-6 text-left select-none pb-4">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
            STEP 01
          </span>
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
          Authority-informed site planning, setbacks, and configurable Built-Up Area.
        </p>
      </div>

      {/* ── 1. SITE LOCATION & DIMENSIONS ── */}
      <div className="space-y-3">
        
        {/* City Location Cards */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
            Site Location (Planning Authority)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {cities.map((item) => {
              const isSelected = (city || 'Bangalore') === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setCity(item.id);
                    setUserSelectedBUA(null); // Reset to new city recommendation
                  }}
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
                    onClick={() => {
                      setPlotDimensions(p.l, p.w);
                      setUserSelectedBUA(null); // Auto-recalculate recommended BUA
                    }}
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
            {/* Length (Depth) */}
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
                onChange={(e) => {
                  setPlotDimensions(Number(e.target.value), plotWidth || 30);
                  setUserSelectedBUA(null);
                }}
                className="hutty-slider"
              />
            </div>

            {/* Width (Frontage) */}
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
                onChange={(e) => {
                  setPlotDimensions(plotLength || 40, Number(e.target.value));
                  setUserSelectedBUA(null);
                }}
                className="hutty-slider"
              />
            </div>
          </div>
        </div>

        {/* ── 2. ROAD WIDTH (Affects planning regulations) ── */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-baseline">
            <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
              Abutting Road Width
            </label>
            <span className="text-[10px] text-[#4B5563]">
              Affects planning &amp; FAR limits
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {roadWidthOptions.map((rw) => {
              const isSelected = (roadWidthFt || 30) === rw.value;
              return (
                <div
                  key={rw.value}
                  onClick={() => setRoadWidth(rw.value)}
                  className={cn(
                    'hutty-tactile-card text-center p-2 cursor-pointer',
                    isSelected && 'hutty-tactile-card-selected'
                  )}
                >
                  <span className="text-xs font-extrabold text-[#1B3D34] block font-mono">
                    {rw.label}
                  </span>
                  <span className="text-[9px] text-[#4B5563] block">
                    {rw.sub}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── 3. NUMBER OF FLOORS ── */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Number of Floors
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {floorOptions.map((opt) => {
            const isSelected = (floors || 2) === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  setHouseConfig(houseType || 'Duplex', opt.value);
                  setUserSelectedBUA(null); // Recalculate recommendation for new floor count
                }}
                className={cn(
                  'hutty-tactile-card text-center p-2.5 flex flex-col items-center justify-center cursor-pointer',
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

      {/* ── 4. HOUSE TYPE & PARKING ── */}
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
                    'hutty-tactile-card py-2 px-3 flex items-center justify-between cursor-pointer',
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
                    'hutty-tactile-card py-2 px-3 flex items-center justify-between cursor-pointer',
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

      {/* ── 5. AUTHORITY-INFORMED USER-ADJUSTABLE BUA SLIDER ── */}
      <div className="space-y-3 pt-3 border-t border-[#E5E7EB]">
        
        {/* Header with Large BUA readout */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div>
            <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
              BUILT-UP AREA (BUA)
            </label>
            <span className="text-[11px] text-[#4B5563]">
              Recommended based on your plot geometry and applicable planning rules.
            </span>
          </div>

          <div className="text-left sm:text-right">
            <div className="flex items-baseline gap-1.5 sm:justify-end">
              <span className="text-2xl sm:text-3xl font-black text-[#1B3D34] font-heading font-mono leading-none">
                {activeBUA.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#4B5563]">sq.ft</span>
            </div>
            {numFloors > 1 && (
              <span className="text-[10px] font-mono text-[#4B5563]">
                (~{buaPerFloor.toLocaleString()} sq.ft / floor across {numFloors} floors)
              </span>
            )}
          </div>
        </div>

        {/* Interactive BUA Slider with Recommended Marker */}
        <div className="space-y-2 pt-1">
          <div className="relative pt-2 pb-1">
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={10}
              value={activeBUA}
              disabled={plotArea === 0}
              onChange={(e) => setUserSelectedBUA(Number(e.target.value))}
              className="hutty-slider w-full cursor-pointer disabled:opacity-40"
            />

            {/* Recommended Marker Dot on Track */}
            {plotArea > 0 && recMarkerPct >= 0 && recMarkerPct <= 100 && (
              <div
                className="absolute top-0 flex flex-col items-center pointer-events-none -translate-x-1/2"
                style={{ left: `${recMarkerPct}%` }}
              >
                <span className="text-[9px] font-bold font-mono text-[#1B3D34] bg-[rgba(27,61,52,0.1)] px-1.5 py-0.2 rounded border border-[#1B3D34]/20 shadow-2xs whitespace-nowrap">
                  Rec: {recBUA.toLocaleString()}
                </span>
                <div className="w-1.5 h-1.5 bg-[#1B3D34] rotate-45 mt-0.5" />
              </div>
            )}
          </div>

          {/* Slider Min/Max Readouts */}
          <div className="flex justify-between items-center text-[10px] font-mono text-[#4B5563]">
            <span>Min: {sliderMin.toLocaleString()} sq.ft</span>
            <span className="font-bold text-[#1B3D34]">
              Recommended: {recBUA.toLocaleString()} sq.ft
            </span>
            <span>Max Permissible: {maxBUA.toLocaleString()} sq.ft</span>
          </div>
        </div>

        {/* ── 3 VALIDATION STATES ── */}
        {plotArea > 0 && (
          <div>
            {validationState === 'valid' && (
              <div className="p-3 bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/20 rounded-xl flex items-center gap-2.5 text-xs text-[#1B3D34]">
                <CheckCircle2 className="w-4 h-4 text-[#1B3D34] shrink-0" />
                <div>
                  <span className="font-bold">✓ Valid configuration:</span>
                  <span className="text-[11px] text-[#4B5563] ml-1">Within the calculated permissible authority range.</span>
                </div>
              </div>
            )}

            {validationState === 'above_recommended' && (
              <div className="p-3 bg-[rgba(242,140,40,0.1)] border border-[#F28C28]/30 rounded-xl flex items-center gap-2.5 text-xs text-[#1B3D34]">
                <AlertTriangle className="w-4 h-4 text-[#F28C28] shrink-0" />
                <div>
                  <span className="font-bold text-[#1B3D34]">⚠ Above recommended BUA:</span>
                  <span className="text-[11px] text-[#4B5563] ml-1">Permissible under FAR, but exceeds baseline conservative coverage. Review your planning configuration before finalizing.</span>
                </div>
              </div>
            )}

            {validationState === 'exceeds_permissible' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-900">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <div>
                  <span className="font-bold text-red-800">⚠ Exceeds calculated permissible BUA:</span>
                  <span className="text-[11px] text-red-700 ml-1">This exceeds the statutory maximum limit calculated for this plot and road width. Authority approval or premium FAR required.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floor-wise BUA breakdown for multi-storey */}
        {numFloors > 1 && plotArea > 0 && (
          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-1.5 text-xs">
            <span className="font-bold text-[#1B3D34] text-[11px] uppercase tracking-wider block">
              Floor-Wise Area Allocation ({numFloors} Floors)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              {Array.from({ length: numFloors }).map((_, idx) => (
                <div key={idx} className="bg-white p-2 rounded-lg border border-[#E5E7EB] flex justify-between">
                  <span className="text-[#4B5563]">{idx === 0 ? 'Ground Floor' : `Floor ${idx + 1}`}:</span>
                  <span className="font-bold text-[#1B3D34] font-mono">{buaPerFloor.toLocaleString()} sq.ft</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EXPANDABLE "HOW IS THIS CALCULATED?" AUTHORITY EXPLAINER ── */}
        {plotArea > 0 && (
          <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowHowCalculated(!showHowCalculated)}
              className="w-full p-3 bg-[#F8F8F6] hover:bg-white flex items-center justify-between text-xs font-bold text-[#1B3D34] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#1B3D34]" />
                <span>How is this calculated? (Authority Breakdown)</span>
              </div>
              {showHowCalculated ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showHowCalculated && (
              <div className="p-4 bg-white border-t border-[#E5E7EB] space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[#4B5563] block text-[10px] uppercase">Plot Area</span>
                    <span className="font-bold text-[#1B3D34] font-mono">{plotArea.toLocaleString()} sq.ft</span>
                  </div>
                  <div>
                    <span className="text-[#4B5563] block text-[10px] uppercase">Buildable Footprint</span>
                    <span className="font-bold text-[#1B3D34] font-mono">{area.buildableFootprintSqFt?.toLocaleString() || 0} sq.ft</span>
                  </div>
                  <div>
                    <span className="text-[#4B5563] block text-[10px] uppercase">Applicable Coverage</span>
                    <span className="font-bold text-[#1B3D34] font-mono">{area.maxPermissibleCoveragePct || 70}%</span>
                  </div>
                  <div>
                    <span className="text-[#4B5563] block text-[10px] uppercase">Permissible FAR</span>
                    <span className="font-bold text-[#1B3D34] font-mono">{area.permissibleFAR || 1.75}</span>
                  </div>
                  <div>
                    <span className="text-[#4B5563] block text-[10px] uppercase">Recommended BUA</span>
                    <span className="font-bold text-[#1B3D34] font-mono">{recBUA.toLocaleString()} sq.ft</span>
                  </div>
                  <div>
                    <span className="text-[#4B5563] block text-[10px] uppercase">Max Permissible BUA</span>
                    <span className="font-bold text-[#1B3D34] font-mono">{maxBUA.toLocaleString()} sq.ft</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB] space-y-1">
                  <span className="text-[11px] font-bold text-[#1B3D34] block">Required Statutory Setbacks:</span>
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono text-[#4B5563]">
                    <span className="bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                      Front: {area.setbacks?.frontSetbackFt?.toFixed(1) || 3.3} ft
                    </span>
                    <span className="bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                      Rear: {area.setbacks?.rearSetbackFt?.toFixed(1) || 3.3} ft
                    </span>
                    <span className="bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                      Left: {area.setbacks?.leftSetbackFt?.toFixed(1) || 3.3} ft
                    </span>
                    <span className="bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                      Right: {area.setbacks?.rightSetbackFt?.toFixed(1) || 3.3} ft
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB] text-[10px] text-[#4B5563] space-y-1">
                  <p>
                    <strong className="text-[#1B3D34]">Planning Authority:</strong> {area.authorityMetadata?.city} &bull; {area.authorityMetadata?.authorityFullName || area.authorityMetadata?.authority}
                  </p>
                  <p>
                    <strong className="text-[#1B3D34]">Rule Reference:</strong> {area.authorityMetadata?.source} (Version: {area.authorityMetadata?.ruleVersion})
                  </p>
                  <p className="italic text-[#1B3D34] pt-1">
                    "{area.authorityMetadata?.disclaimer || 'Authority-informed estimate. Final approval is subject to applicable local authority regulations and professional verification.'}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
