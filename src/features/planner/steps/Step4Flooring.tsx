import React, { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useArea } from '../../../store/useCalculationStore';
import { Check } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step4Flooring: React.FC = () => {
  const { flooringZones, setFlooringZone } = useWizardStore();
  const area = useArea();
  const [activeZoneKey, setActiveZoneKey] = useState<keyof typeof flooringZones>('living');

  const totalBua = area.totalBUASqFt || 2400;

  const zones: {
    key: keyof typeof flooringZones;
    label: string;
    approxAreaSqFt: number;
    options: { label: string; rate: number; desc: string; recommended?: boolean }[];
  }[] = [
    {
      key: 'living',
      label: 'Living Room',
      approxAreaSqFt: Math.round(totalBua * 0.25),
      options: [
        { label: 'Vitrified Tiles 800x800mm', rate: 120, desc: 'High-gloss stain resistant vitrified tiles.', recommended: true },
        { label: 'Granite Slab', rate: 220, desc: 'Polished natural South Indian granite.' },
        { label: 'Italian Marble', rate: 450, desc: 'Premium imported Statuario / Botticino marble.' },
      ],
    },
    {
      key: 'kitchenDining',
      label: 'Kitchen & Dining',
      approxAreaSqFt: Math.round(totalBua * 0.18),
      options: [
        { label: 'Vitrified Tiles', rate: 110, desc: 'Dual-coat vitrified floor tiles.', recommended: true },
        { label: 'Granite', rate: 195, desc: 'Heavy-duty natural granite slabs.' },
        { label: 'Matte Anti-Skid Vitrified', rate: 135, desc: 'Non-slip matte surface for kitchen safety.' },
      ],
    },
    {
      key: 'bedrooms',
      label: 'Bedrooms',
      approxAreaSqFt: Math.round(totalBua * 0.32),
      options: [
        { label: 'Vitrified Tiles', rate: 105, desc: 'Standard 600x600mm vitrified tiles.', recommended: true },
        { label: 'Wooden Laminate', rate: 180, desc: 'AC4 grade German wooden laminate flooring.' },
        { label: 'Granite', rate: 210, desc: 'Cool natural stone finish.' },
      ],
    },
    {
      key: 'bathrooms',
      label: 'Bathrooms',
      approxAreaSqFt: Math.round(totalBua * 0.10),
      options: [
        { label: 'Anti-skid Ceramic Tiles', rate: 75, desc: 'R10 safety anti-skid ceramic tiles.', recommended: true },
        { label: 'Matte Finish Vitrified', rate: 115, desc: 'Low porosity matte vitrified tiles.' },
      ],
    },
    {
      key: 'parkingUtility',
      label: 'Parking & Utility',
      approxAreaSqFt: Math.round(totalBua * 0.10),
      options: [
        { label: 'Heavy-Duty Parking Tiles', rate: 65, desc: 'Interlocking 16mm thick paver tiles.', recommended: true },
        { label: 'Flamed Granite', rate: 160, desc: 'Thermal flamed non-slip granite stone.' },
      ],
    },
    {
      key: 'balconies',
      label: 'Balconies',
      approxAreaSqFt: Math.round(totalBua * 0.05),
      options: [
        { label: 'Anti-skid Ceramic', rate: 70, desc: 'Weather-resistant ceramic tiles.', recommended: true },
        { label: 'Wooden Finish Tiles', rate: 125, desc: 'Timber grain porcelain plank tiles.' },
      ],
    },
  ];

  const currentZone = zones.find((z) => z.key === activeZoneKey) || zones[0];
  const selectedOptionLabel = flooringZones[currentZone.key];

  return (
    <div className="space-y-8 text-left">
      {/* Editorial Step Header */}
      <div className="space-y-1">
        <span className="text-xs font-mono font-bold tracking-widest text-[#1F4B43] uppercase block">
          STEP 04
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          Flooring Finishes
        </h2>
        <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
          Select surface finishes by zone to calculate tile and stone material rates.
        </p>
      </div>

      {/* Zone Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#E5E7EB]">
        {zones.map((z) => {
          const isActive = activeZoneKey === z.key;
          const isConfigured = Boolean(flooringZones[z.key]);
          return (
            <button
              key={z.key}
              type="button"
              onClick={() => setActiveZoneKey(z.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5',
                isActive
                  ? 'bg-[#1F4B43] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#172033] hover:bg-slate-100'
              )}
            >
              <span>{z.label}</span>
              {isConfigured && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F4B43]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Zone Option Cards */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#172033] uppercase tracking-wider">
            {currentZone.label} Options (~{currentZone.approxAreaSqFt} sq.ft)
          </label>
        </div>

        <div className="space-y-2.5">
          {currentZone.options.map((opt) => {
            const isSelected = selectedOptionLabel === opt.label;
            const estimatedCost = Math.round(currentZone.approxAreaSqFt * opt.rate);
            return (
              <div
                key={opt.label}
                onClick={() => setFlooringZone(currentZone.key, opt.label)}
                className={cn(
                  'p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
                  isSelected
                    ? 'bg-[#EBF2F0] border-[#1F4B43] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                      isSelected ? 'bg-[#1F4B43] text-white' : 'border border-slate-300 text-transparent'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#172033]">{opt.label}</h4>
                      {opt.recommended && (
                        <span className="text-[9px] font-bold bg-[#1F4B43]/10 text-[#1F4B43] px-1.5 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#667085] leading-tight mt-0.5">{opt.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#172033] block">
                    {formatCurrency(estimatedCost)}
                  </span>
                  <span className="text-[10px] text-[#667085]">₹{opt.rate}/sq.ft</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
