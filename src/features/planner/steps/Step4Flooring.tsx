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
    options: { label: string; rate: number; desc: string }[];
  }[] = [
    {
      key: 'living',
      label: 'Living Room',
      approxAreaSqFt: Math.round(totalBua * 0.25),
      options: [
        { label: 'Vitrified Tiles 800x800mm', rate: 120, desc: 'High-gloss stain resistant vitrified tiles.' },
        { label: 'Granite Slab', rate: 220, desc: 'Polished natural South Indian granite.' },
        { label: 'Italian Marble', rate: 450, desc: 'Premium imported Statuario / Botticino marble.' },
      ],
    },
    {
      key: 'kitchenDining',
      label: 'Kitchen & Dining',
      approxAreaSqFt: Math.round(totalBua * 0.18),
      options: [
        { label: 'Vitrified Tiles', rate: 110, desc: 'Dual-coat vitrified floor tiles.' },
        { label: 'Granite', rate: 195, desc: 'Heavy-duty natural granite slabs.' },
        { label: 'Matte Anti-Skid Vitrified', rate: 135, desc: 'Non-slip matte surface for kitchen safety.' },
      ],
    },
    {
      key: 'bedrooms',
      label: 'Bedrooms',
      approxAreaSqFt: Math.round(totalBua * 0.32),
      options: [
        { label: 'Vitrified Tiles', rate: 105, desc: 'Standard 600x600mm vitrified tiles.' },
        { label: 'Wooden Laminate', rate: 180, desc: 'AC4 grade German wooden laminate flooring.' },
        { label: 'Granite', rate: 210, desc: 'Cool natural stone finish.' },
      ],
    },
    {
      key: 'bathrooms',
      label: 'Bathrooms',
      approxAreaSqFt: Math.round(totalBua * 0.10),
      options: [
        { label: 'Anti-skid Ceramic Tiles', rate: 75, desc: 'R10 safety anti-skid ceramic tiles.' },
        { label: 'Matte Finish Vitrified', rate: 115, desc: 'Low porosity matte vitrified tiles.' },
      ],
    },
    {
      key: 'parkingUtility',
      label: 'Parking & Utility',
      approxAreaSqFt: Math.round(totalBua * 0.10),
      options: [
        { label: 'Heavy-Duty Parking Tiles', rate: 65, desc: 'Interlocking 16mm thick paver tiles.' },
        { label: 'Flamed Granite', rate: 160, desc: 'Thermal flamed non-slip granite stone.' },
      ],
    },
    {
      key: 'balconies',
      label: 'Balconies',
      approxAreaSqFt: Math.round(totalBua * 0.05),
      options: [
        { label: 'Anti-skid Ceramic', rate: 70, desc: 'Weather-resistant ceramic tiles.' },
        { label: 'Wooden Finish Tiles', rate: 125, desc: 'Timber grain porcelain plank tiles.' },
      ],
    },
  ];

  const currentZone = zones.find((z) => z.key === activeZoneKey) || zones[0];
  const selectedOptionLabel = flooringZones[currentZone.key];

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1 pb-1 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 04
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading">
          Flooring Finishes
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Select surface finishes by zone to calculate tile, stone, and wooden flooring takeoffs.
        </p>
      </div>

      {/* Zone Switcher Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-[#E5E7EB]">
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
                  ? 'bg-[#1B3D34] text-white shadow-xs'
                  : 'text-[#4B5563] hover:text-[#1B3D34] hover:bg-[#F8F8F6]'
              )}
            >
              <span>{z.label}</span>
              {isConfigured && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#1B3D34]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Zone Option Cards */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            {currentZone.label}
          </label>
          <span className="font-mono text-[#4B5563]">~{currentZone.approxAreaSqFt} sq.ft area</span>
        </div>

        <div className="space-y-1.5">
          {currentZone.options.map((opt) => {
            const isSelected = selectedOptionLabel === opt.label;
            const estimatedCost = Math.round(currentZone.approxAreaSqFt * opt.rate);
            return (
              <div
                key={opt.label}
                onClick={() => setFlooringZone(currentZone.key, opt.label)}
                className={cn(
                  'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] ring-1 ring-[#1B3D34]'
                    : 'bg-white border-[#E5E7EB] hover:bg-[#F8F8F6]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                      isSelected ? 'bg-[#1B3D34] text-white' : 'border border-[#D1D5DB]'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1B3D34]">{opt.label}</h4>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{opt.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#1B3D34] block font-mono">
                    {formatCurrency(estimatedCost)}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{opt.rate}/sq.ft</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
