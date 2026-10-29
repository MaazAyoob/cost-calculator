import React, { useState, useEffect } from 'react';
import { useWizardStore, CityLocation, AuthorityOption } from '../../../store/useWizardStore';
import { MapPin, Building, Check, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

interface PresetPlot {
  label: string;
  width: number;
  length: number;
  areaSqFt: number;
  popular?: boolean;
}

const PRESET_PLOTS: PresetPlot[] = [
  { label: "20' × 30'", width: 20, length: 30, areaSqFt: 600 },
  { label: "30' × 40'", width: 30, length: 40, areaSqFt: 1200, popular: true },
  { label: "30' × 50'", width: 30, length: 50, areaSqFt: 1500 },
  { label: "40' × 60'", width: 40, length: 60, areaSqFt: 2400 },
];

const LAND_STATUS_OPTIONS = [
  { id: 'bda_approved', label: 'BDA / BBMP Approved', desc: 'Approved municipal residential layout' },
  { id: 'dc_converted', label: 'DC Converted', desc: 'Agricultural land converted for residential use' },
  { id: 'panchayat', label: 'Gram Panchayat / E-Khata', desc: 'Village panchayat boundary with Form 9/11' },
  { id: 'not_sure', label: 'Not sure', desc: 'We will use standard Bengaluru residential assumptions' },
];

export const Stage1Plot: React.FC = () => {
  const store = useWizardStore();
  const {
    city,
    authority,
    plotLength,
    plotWidth,
    setCity,
    setAuthority,
    setPlotDimensions,
  } = store;

  // Local state for responsive editing
  const [activeCity, setActiveCity] = useState<CityLocation>(city || 'Bangalore');
  const [widthInput, setWidthInput] = useState<string>(plotWidth > 0 ? String(plotWidth) : '30');
  const [lengthInput, setLengthInput] = useState<string>(plotLength > 0 ? String(plotLength) : '40');
  const [selectedLandStatus, setSelectedLandStatus] = useState<string>('bda_approved');
  const [selectedAuthority, setSelectedAuthority] = useState<string>(authority || 'BBMP/BDA');

  // Synchronize initial defaults if unselected
  useEffect(() => {
    if (!city) {
      setCity('Bangalore');
    }
    if (plotLength === 0 || plotWidth === 0) {
      setPlotDimensions(40, 30);
    }
    if (!authority) {
      setAuthority('BBMP/BDA');
    }
  }, []);

  const numWidth = parseFloat(widthInput) || 0;
  const numLength = parseFloat(lengthInput) || 0;
  const calculatedArea = numWidth * numLength;

  const handleApplyDimensions = (w: number, l: number) => {
    setWidthInput(String(w));
    setLengthInput(String(l));
    setPlotDimensions(l, w);
  };

  const handleWidthChange = (val: string) => {
    setWidthInput(val);
    const parsed = parseFloat(val) || 0;
    if (parsed > 0) {
      setPlotDimensions(numLength, parsed);
    }
  };

  const handleLengthChange = (val: string) => {
    setLengthInput(val);
    const parsed = parseFloat(val) || 0;
    if (parsed > 0) {
      setPlotDimensions(parsed, numWidth);
    }
  };

  const handleCityChange = (c: CityLocation) => {
    setActiveCity(c);
    setCity(c);
  };

  const handleAuthoritySelect = (authId: string) => {
    setSelectedAuthority(authId);
    setAuthority(authId === 'NOT_SURE' ? 'Not sure' : (authId as AuthorityOption));
  };

  return (
    <div className="space-y-6 text-left">
      {/* Stage Header */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF3EF] border border-[#D5E5DC] text-[11px] font-bold text-[#1B3D34]">
          <MapPin className="w-3 h-3 text-[#F28C28]" />
          <span>STAGE 1 OF 8 &bull; YOUR PLOT</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#1B3D34] tracking-tight">
          Where are you building, and how big is your plot?
        </h2>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Tell us about your plot location and dimensions. We'll automatically calculate your plot area, buildable space, and required open gaps.
        </p>
      </div>

      {/* 1. Location Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3D34]">
          1. Where are you building?
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          {(['Bangalore', 'Mysore'] as CityLocation[]).map((c) => {
            const isSelected = activeCity === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleCityChange(c)}
                className={`min-h-[48px] py-3 px-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[#1B3D34] bg-[#EBF3EF] text-[#1B3D34] font-bold shadow-2xs'
                    : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#1B3D34]/40 hover:bg-[#F8F9F7]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#F28C28]' : 'text-[#687770]'}`} />
                  <span className="text-sm">{c}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#1B3D34]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Common Plot Dimension Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3D34]">
            2. How big is your plot?
          </label>
          <span className="text-[11px] text-[#687770]">Choose a standard size or enter custom feet below</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_PLOTS.map((preset) => {
            const isSelected = numWidth === preset.width && numLength === preset.length;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyDimensions(preset.width, preset.length)}
                className={`min-h-[64px] p-3 rounded-xl border text-center transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#1B3D34] bg-[#1B3D34] text-white shadow-xs'
                    : 'border-[#E5E7EB] bg-white text-[#202522] hover:border-[#1B3D34]/40 hover:bg-[#F8F9F7]'
                }`}
              >
                {preset.popular && (
                  <span className={`absolute -top-2 right-2 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    isSelected ? 'bg-[#F28C28] text-white' : 'bg-[#EBF3EF] text-[#1B3D34] border border-[#D5E5DC]'
                  }`}>
                    Popular
                  </span>
                )}
                <span className="block text-sm font-bold font-mono">{preset.label}</span>
                <span className={`block text-[11px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#687770]'}`}>
                  {preset.areaSqFt.toLocaleString()} sq.ft
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Custom Width & Length Inputs with Visual Plot Preview */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E5E7EB] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
          <span className="text-xs font-bold text-[#1B3D34]">
            Custom Plot Dimensions &bull; Feet (ft)
          </span>
          <span className="text-xs font-mono font-bold text-[#1B3D34] bg-[#EBF3EF] px-2.5 py-0.5 rounded-full border border-[#D5E5DC]">
            {calculatedArea.toLocaleString()} sq.ft
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                Plot Width (road frontage)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={widthInput}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#CBD5CB] bg-[#F8F8F6] text-[#202522] font-mono text-sm focus:outline-none focus:border-[#1B3D34] focus:bg-white transition-all"
                  placeholder="30"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-[#687770] font-mono">ft</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                Plot Depth (length)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="15"
                  max="300"
                  value={lengthInput}
                  onChange={(e) => handleLengthChange(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#CBD5CB] bg-[#F8F8F6] text-[#202522] font-mono text-sm focus:outline-none focus:border-[#1B3D34] focus:bg-white transition-all"
                  placeholder="40"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-[#687770] font-mono">ft</span>
              </div>
            </div>
          </div>

          {/* Simple Visual Plot Aspect Box */}
          <div className="md:col-span-5 bg-[#F8F9F7] rounded-xl p-3 border border-[#E5E7EB] flex flex-col items-center justify-center">
            <div className="w-full max-w-[140px] aspect-[4/3] rounded-lg border-2 border-dashed border-[#1B3D34]/40 bg-[#EBF3EF]/60 relative flex flex-col items-center justify-center p-2 text-center">
              <span className="text-[10px] text-[#687770] uppercase font-bold">Road Frontage</span>
              <span className="text-xs font-bold font-mono text-[#1B3D34]">{numWidth} ft</span>
              <div className="w-3/4 h-0.5 bg-[#F28C28] my-1" />
              <span className="text-[10px] font-mono text-[#687770]">{numLength} ft depth</span>
              <span className="text-[11px] font-black font-mono text-[#1B3D34] mt-0.5">{calculatedArea} sq.ft</span>
            </div>
            <span className="text-[10px] text-[#687770] mt-1.5 text-center">Live Plot Boundary Preview</span>
          </div>
        </div>

        {/* Live Calculated Area Display & Conversions */}
        <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
          <div className="text-[10px] text-[#687770] flex flex-wrap items-center justify-between gap-1 pt-1">
            <span>Unit Guide: 1 Gunta = 1,089 sq.ft</span>
            <span>1 Cent = 435.6 sq.ft</span>
            <span>1 Sq.Yard = 9 sq.ft</span>
            <span>1 Sq.Metre = 10.76 sq.ft</span>
          </div>
        </div>
      </div>

      {/* 4. Land Status Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3D34]">
          3. Do you know your land approval details? (Optional)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {LAND_STATUS_OPTIONS.map((status) => {
            const isSelected = selectedLandStatus === status.id;
            return (
              <button
                key={status.id}
                type="button"
                onClick={() => setSelectedLandStatus(status.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'border-[#1B3D34] bg-[#EBF3EF] shadow-2xs'
                    : 'border-[#E5E7EB] bg-white hover:border-[#1B3D34]/30 hover:bg-[#F8F9F7]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-[#1B3D34] bg-[#1B3D34]' : 'border-[#CBD5CB] bg-white'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="min-w-0">
                  <span className={`block text-xs font-bold ${isSelected ? 'text-[#1B3D34]' : 'text-[#202522]'}`}>
                    {status.label}
                  </span>
                  <span className="block text-[11px] text-[#687770] leading-snug mt-0.5">
                    {status.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Planning Authority Option */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3D34]">
            4. Local Planning Authority
          </label>
          <span className="text-[11px] text-[#687770]">Determines statutory setback norms</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: 'BBMP/BDA', label: 'BBMP / BDA' },
            { id: 'MUDA', label: 'MUDA (Mysore)' },
            { id: 'NOT_SURE', label: 'Not sure' },
          ].map((item) => {
            const isSelected = selectedAuthority === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAuthoritySelect(item.id)}
                className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                  isSelected
                    ? 'border-[#1B3D34] bg-[#1B3D34] text-white shadow-2xs'
                    : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#1B3D34]/40 hover:bg-[#F8F9F7]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
