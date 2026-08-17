import React from 'react';
import { useWizardStore, CityLocation, HouseType, ParkingTypeOption } from '../../../store/useWizardStore';
import { useArea } from '../../../store/useCalculationStore';
import { Card } from '../../../components/ui/Card';
import { MapPin, MoveHorizontal, MoveVertical, AlertTriangle, Check, Layers, Compass } from 'lucide-react';
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
  } = useWizardStore();

  const area = useArea();
  const plotArea = plotLength * plotWidth;
  const maxAllowable = area.maxAllowableBUAPerFloorSqFt || Math.round(plotArea * 0.6);
  const isExceeding = builtUpAreaPerFloor > maxAllowable && maxAllowable > 0;

  const cities: { id: CityLocation; name: string; authority: string; desc: string }[] = [
    {
      id: 'Bangalore',
      name: 'Bengaluru',
      authority: 'BBMP / BDA',
      desc: 'Standard BBMP / BDA bylaws.',
    },
    {
      id: 'Mysore',
      name: 'Mysuru',
      authority: 'MUDA',
      desc: 'MUDA regional guidelines.',
    },
  ];

  const floorOptions: { value: number; label: string; sub: string }[] = [
    { value: 1, label: 'Ground (G)', sub: 'Single' },
    { value: 2, label: 'G + 1', sub: 'Duplex' },
    { value: 3, label: 'G + 2', sub: 'Triplex' },
    { value: 4, label: 'G + 3', sub: 'Multi-Family' },
    { value: 5, label: 'G + 4', sub: 'High Density' },
  ];

  const houseTypes: HouseType[] = ['Duplex', 'Triplex', 'Rental Units', 'Mixed Use'];

  const parkingOptions: { id: ParkingTypeOption; label: string; desc: string }[] = [
    { id: 'Normal Ground', label: 'Normal Ground', desc: 'Open driveway / porch' },
    { id: 'Stilt', label: 'Stilt Parking', desc: 'Covered ground (Min G+1)' },
    { id: 'EV Charging Ready', label: 'EV Ready', desc: 'Pre-wired charging' },
  ];

  return (
    <div className="space-y-10 py-2">
      {/* Header Intro */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Basic Project Information</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Specify location, plot dimensions, desired built-up area per floor, floor count, and parking to set your project baseline.
        </p>
      </div>

      {/* 1. Location & Sanctioning Authority */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-black flex items-center justify-center">1</span>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Project Location</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cities.map((item) => {
            const isSelected = city === item.id;
            return (
              <Card
                key={item.id}
                onClick={() => setCity(item.id)}
                className={cn(
                  'p-4 cursor-pointer transition-all border rounded-2xl flex items-center justify-between',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors',
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  )}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{item.name}</h4>
                    <span className="text-xs font-bold text-blue-600 block">{item.authority}</span>
                  </div>
                </div>

                <span className={cn(
                  'text-xs font-extrabold px-3 py-1 rounded-xl border transition-all',
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                )}>
                  {isSelected ? '✓ Selected' : 'Select'}
                </span>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 2. Plot Dimensions & Clean White Schematic */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-black flex items-center justify-center">2</span>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Plot Dimensions &amp; Area</h3>
        </div>

        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-soft-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Length Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <MoveVertical className="w-4 h-4 text-blue-600" /> Length
                </span>
                <span className="text-blue-600 font-extrabold text-sm">
                  {plotLength > 0 ? `${plotLength} ft` : '0 ft'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={1}
                value={plotLength}
                onChange={(e) => setPlotDimensions(Number(e.target.value), plotWidth)}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex gap-1.5 justify-start">
                {[30, 40, 50, 60].map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setPlotDimensions(len, plotWidth || 30)}
                    className={cn(
                      'text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-all cursor-pointer',
                      plotLength === len ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    )}
                  >
                    {len}'
                  </button>
                ))}
              </div>
            </div>

            {/* Width Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <MoveHorizontal className="w-4 h-4 text-blue-600" /> Width
                </span>
                <span className="text-blue-600 font-extrabold text-sm">
                  {plotWidth > 0 ? `${plotWidth} ft` : '0 ft'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={1}
                value={plotWidth}
                onChange={(e) => setPlotDimensions(plotLength, Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex gap-1.5 justify-start">
                {[20, 30, 40, 50].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setPlotDimensions(plotLength || 40, w)}
                    className={cn(
                      'text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-all cursor-pointer',
                      plotWidth === w ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    )}
                  >
                    {w}'
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Architectural Light-Mode Plot Visualization */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
              Architectural Plot Schematic
            </span>

            <div className="w-48 h-28 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center relative bg-white shadow-xs">
              <span className="absolute -top-3 text-[10px] font-black text-blue-600 bg-white px-2 py-0.5 border border-slate-200 rounded-full shadow-xs">
                {plotWidth || 0} FT
              </span>
              <span className="absolute -left-4 text-[10px] font-black text-blue-600 bg-white px-1.5 py-0.5 border border-slate-200 rounded-full shadow-xs">
                {plotLength || 0} FT
              </span>
              <div className="w-40 h-20 bg-blue-50/80 border border-blue-200 rounded-lg flex items-center justify-center">
                <span className="text-sm font-black text-blue-900">
                  {plotArea > 0 ? `${plotArea.toLocaleString()} sq.ft` : '0 sq.ft'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. User-Selected Built-Up Area per Floor (BUA) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-black flex items-center justify-center">3</span>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Desired Built-Up Area Per Floor</h3>
        </div>

        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-soft-xs space-y-6">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700">
                Built-Up Area (BUA) per Floor
              </label>
              {plotArea > 0 && (
                <span className="text-[11px] font-semibold text-slate-500">
                  Authority Maximum (60%): <strong className="text-slate-800">{maxAllowable.toLocaleString()} sq.ft</strong>
                </span>
              )}
            </div>

            {/* Direct Number Input & Slider */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="sm:col-span-2 space-y-2">
                <input
                  type="range"
                  min={0}
                  max={plotArea > 0 ? plotArea : 3000}
                  step={10}
                  disabled={plotArea === 0}
                  value={builtUpAreaPerFloor}
                  onChange={(e) => setBuiltUpAreaPerFloor(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>0 sq.ft</span>
                  <span>{maxAllowable > 0 ? `${maxAllowable} sq.ft (60% Max)` : ''}</span>
                  <span>{plotArea > 0 ? `${plotArea} sq.ft (Full Plot)` : ''}</span>
                </div>
              </div>

              {/* Direct numeric input */}
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={plotArea > 0 ? plotArea : 10000}
                  disabled={plotArea === 0}
                  value={builtUpAreaPerFloor === 0 ? '' : builtUpAreaPerFloor}
                  placeholder="0"
                  onChange={(e) => setBuiltUpAreaPerFloor(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 text-right pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  sq.ft
                </span>
              </div>
            </div>

            {/* Quick Percentage Presets */}
            {plotArea > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Quick Presets based on {plotArea.toLocaleString()} sq.ft plot:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '60% (Statutory Max)', pct: 0.60 },
                    { label: '70%', pct: 0.70 },
                    { label: '75%', pct: 0.75 },
                    { label: '80%', pct: 0.80 },
                  ].map((preset) => {
                    const targetVal = Math.round(plotArea * preset.pct);
                    const isSelected = builtUpAreaPerFloor === targetVal;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setBuiltUpAreaPerFloor(targetVal)}
                        className={cn(
                          'text-xs font-extrabold px-3 py-1.5 rounded-xl border transition-all cursor-pointer',
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        )}
                      >
                        {preset.label}: {targetVal.toLocaleString()} sq.ft
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Key Area Derivations Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                BUA / Floor
              </span>
              <span className="text-sm font-black text-slate-900 block">
                {builtUpAreaPerFloor > 0 ? `${builtUpAreaPerFloor.toLocaleString()} sq.ft` : '0 sq.ft'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Ground Coverage
              </span>
              <span className="text-sm font-black text-blue-600 block">
                {area.groundCoveragePercentage > 0 ? `${area.groundCoveragePercentage.toFixed(1)}%` : '0%'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Remaining Ground
              </span>
              <span className="text-sm font-black text-emerald-600 block">
                {area.remainingGroundAreaSqFt > 0 ? `${area.remainingGroundAreaSqFt.toLocaleString()} sq.ft` : '0 sq.ft'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Total BUA ({floors || 1} Flr{floors > 1 ? 's' : ''})
              </span>
              <span className="text-sm font-black text-slate-900 block">
                {area.totalBUASqFt > 0 ? `${area.totalBUASqFt.toLocaleString()} sq.ft` : '0 sq.ft'}
              </span>
            </div>
          </div>

          {/* Validation Banner if exceeding statutory limit */}
          {isExceeding && (
            <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold">Client Confirmation Required:</strong> Selected BUA ({builtUpAreaPerFloor.toLocaleString()} sq.ft / {area.groundCoveragePercentage.toFixed(1)}% coverage) exceeds the standard 60% maximum permissible ground footprint ({maxAllowable.toLocaleString()} sq.ft) under {city === 'Mysore' ? 'MUDA' : 'BBMP/BDA'} bylaws. Requires setback variance confirmation.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Home Configuration (Floors & Typology) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-black flex items-center justify-center">4</span>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Floors &amp; Typology</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Floors Choice Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 block">Number of Floors</label>
            <div className="grid grid-cols-1 gap-2">
              {floorOptions.map((opt) => {
                const isSelected = floors === opt.value;
                const isStiltDisabled = parkingType === 'Stilt' && opt.value === 1;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isStiltDisabled}
                    onClick={() => setHouseConfig(houseType || 'Duplex', opt.value)}
                    className={cn(
                      'w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer',
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-extrabold'
                        : isStiltDisabled
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 font-semibold'
                    )}
                  >
                    <span>{opt.label}</span>
                    <span className={cn('text-[11px]', isSelected ? 'text-blue-100 font-normal' : 'text-slate-400')}>
                      {opt.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* House Typology Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 block">House Typology</label>
            <div className="grid grid-cols-2 gap-2">
              {houseTypes.map((ht) => {
                const isSelected = houseType === ht;
                return (
                  <Card
                    key={ht}
                    onClick={() => setHouseConfig(ht, floors || 2)}
                    className={cn(
                      'p-4 cursor-pointer text-center border transition-all rounded-xl',
                      isSelected
                        ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <span className="text-xs font-extrabold text-slate-900 block">{ht}</span>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Parking Setup */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-black flex items-center justify-center">5</span>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Parking Setup</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {parkingOptions.map((p) => {
            const isSelected = parkingType === p.id;
            return (
              <Card
                key={p.id}
                onClick={() => setParkingConfig(p.id, carCount, bikeCount, p.id === 'EV Charging Ready' ? true : evCharging)}
                className={cn(
                  'p-4 cursor-pointer text-center space-y-1 border transition-all rounded-2xl',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <span className="text-xs font-extrabold text-slate-900 block">{p.label}</span>
                <span className="text-[11px] text-slate-500 font-medium block leading-tight">{p.desc}</span>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
