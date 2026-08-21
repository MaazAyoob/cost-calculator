import React from 'react';
import { useWizardStore, CityLocation, HouseType, ParkingTypeOption } from '../../../store/useWizardStore';
import { useArea } from '../../../store/useCalculationStore';
import { AlertTriangle, Check } from 'lucide-react';
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

  const cities: { id: CityLocation; name: string; authority: string }[] = [
    { id: 'Bangalore', name: 'Bengaluru', authority: 'BBMP / BDA' },
    { id: 'Mysore', name: 'Mysuru', authority: 'MUDA' },
  ];

  const floorOptions = [
    { value: 1, label: 'Ground Level (G)' },
    { value: 2, label: 'G + 1 (Duplex)' },
    { value: 3, label: 'G + 2 (Triplex)' },
    { value: 4, label: 'G + 3 (Multi-Storey)' },
    { value: 5, label: 'G + 4 (High Density)' },
  ];

  const parkingOptions: { id: ParkingTypeOption; label: string; desc: string }[] = [
    { id: 'Normal Ground', label: 'Ground Porch', desc: 'Open driveway parking' },
    { id: 'Stilt', label: 'Stilt Parking', desc: 'Covered ground stilt' },
    { id: 'EV Charging Ready', label: 'EV Dedicated', desc: 'Pre-wired charging bay' },
  ];

  return (
    <div className="space-y-8 text-left select-none">
      {/* Editorial Step Header */}
      <div className="space-y-1">
        <span className="text-xs font-mono font-bold tracking-widest text-[#1B3D34] uppercase block">
          STEP 01
        </span>
        <h2 className="heading-sm text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight">
          Plot &amp; Geometry
        </h2>
        <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
          Define site boundaries, municipal authority, and desired built-up footprint.
        </p>
      </div>

      {/* 1. City Location */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Project Location &amp; Bylaws
        </label>
        <div className="grid grid-cols-2 gap-3">
          {cities.map((item) => {
            const isSelected = city === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setCity(item.id)}
                className={cn(
                  'p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                )}
              >
                <div>
                  <h4 className="text-xs font-bold text-[#1B3D34]">{item.name}</h4>
                  <span className="text-[11px] text-[#4B5563]">{item.authority}</span>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#1B3D34] text-white flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Plot Dimensions */}
      <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider">
            Plot Dimensions
          </label>
          <span className="text-xs font-mono font-bold text-[#1B3D34]">
            {plotArea > 0 ? `${plotArea.toLocaleString()} sq.ft plot area` : '0 sq.ft'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Length */}
          <div className="space-y-1.5 p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#4B5563]">Length (ft)</span>
              <span className="font-bold text-[#1B3D34]">{plotLength || 0} ft</span>
            </div>
            <input
              type="range"
              min={0}
              max={150}
              step={1}
              value={plotLength}
              onChange={(e) => setPlotDimensions(Number(e.target.value), plotWidth || 30)}
              className="w-full h-1.5 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#1B3D34]"
            />
            <div className="flex gap-1 pt-1">
              {[30, 40, 50, 60].map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setPlotDimensions(len, plotWidth || 30)}
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer',
                    plotLength === len ? 'bg-[#1B3D34] text-white border-[#1B3D34]' : 'bg-white text-[#4B5563] border-[#E5E7EB]'
                  )}
                >
                  {len}'
                </button>
              ))}
            </div>
          </div>

          {/* Width */}
          <div className="space-y-1.5 p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#4B5563]">Width (ft)</span>
              <span className="font-bold text-[#1B3D34]">{plotWidth || 0} ft</span>
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
            <div className="flex gap-1 pt-1">
              {[20, 30, 40, 50].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setPlotDimensions(plotLength || 40, w)}
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer',
                    plotWidth === w ? 'bg-[#1B3D34] text-white border-[#1B3D34]' : 'bg-white text-[#4B5563] border-[#E5E7EB]'
                  )}
                >
                  {w}'
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Desired BUA per Floor */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider">
            Built-Up Area (BUA) Per Floor
          </label>
          <span className="text-xs font-bold text-[#1B3D34]">
            {builtUpAreaPerFloor > 0 ? `${builtUpAreaPerFloor.toLocaleString()} sq.ft` : '0 sq.ft'}
          </span>
        </div>

        <div className="p-4 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-3">
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
            <div className="flex flex-wrap gap-2">
              {[
                { label: '60% Standard Max', pct: 0.60 },
                { label: '70%', pct: 0.70 },
                { label: '75%', pct: 0.75 },
              ].map((preset) => {
                const targetVal = Math.round(plotArea * preset.pct);
                const isSelected = builtUpAreaPerFloor === targetVal;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBuiltUpAreaPerFloor(targetVal)}
                    className={cn(
                      'text-xs font-bold px-2.5 py-1 rounded-md border transition-all cursor-pointer',
                      isSelected
                        ? 'bg-[#1B3D34] text-white border-[#1B3D34]'
                        : 'bg-white text-[#1B3D34] border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                    )}
                  >
                    {preset.label}: {targetVal.toLocaleString()} sq.ft
                  </button>
                );
              })}
            </div>
          )}

          {isExceeding && (
            <div className="p-2.5 bg-white rounded-lg border border-[#F28C28] text-xs text-[#1B3D34] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
              <span>
                Footprint exceeds standard 60% ground coverage ({maxAllowable.toLocaleString()} sq.ft). Setback variance required.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Floor Storeys */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Number of Storeys
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {floorOptions.map((opt) => {
            const isSelected = floors === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setHouseConfig(houseType || 'Duplex', opt.value)}
                className={cn(
                  'p-3 rounded-xl border text-xs font-bold transition-all text-left flex justify-between items-center cursor-pointer',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] text-[#1B3D34]'
                    : 'bg-white text-[#1B3D34] border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                )}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Parking Type */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Parking Provision
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {parkingOptions.map((p) => {
            const isSelected = parkingType === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setParkingConfig(p.id, carCount, bikeCount, p.id === 'EV Charging Ready' ? true : evCharging)}
                className={cn(
                  'p-3 rounded-xl border transition-all cursor-pointer text-left space-y-0.5',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34]'
                    : 'bg-white border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                )}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#1B3D34]">{p.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
                </div>
                <p className="text-[10px] text-[#4B5563]">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
