import React, { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useArea } from '../../../store/useCalculationStore';
import { useRecommendations } from '../../../hooks/useRecommendations';
import { Check } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';
import { HowWeCalculatedThis } from '../../../components/common/HowWeCalculatedThis';

export const Step4Flooring: React.FC = () => {
  const { flooringZones, setFlooringZone } = useWizardStore();
  const area = useArea();
  const { getFlooringRecommendation } = useRecommendations();
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
        { label: 'Vitrified Tiles 800x800mm', rate: 120, desc: 'High-gloss stain resistant double-charged vitrified tiles.' },
        { label: 'Granite Slab', rate: 220, desc: 'Mirror polished natural South Indian granite stone.' },
        { label: 'Italian Marble', rate: 450, desc: 'Imported Statuario / Botticino marble with diamond polish.' },
      ],
    },
    {
      key: 'kitchenDining',
      label: 'Kitchen & Dining',
      approxAreaSqFt: Math.round(totalBua * 0.18),
      options: [
        { label: 'Vitrified Tiles', rate: 110, desc: 'Dual-coat vitrified floor tiles with low water absorption.' },
        { label: 'Matte Anti-Skid Vitrified', rate: 135, desc: 'Non-slip matte textured surface for kitchen safety.' },
        { label: 'Granite', rate: 195, desc: 'Heavy-duty natural granite slabs resistant to spills.' },
      ],
    },
    {
      key: 'bedrooms',
      label: 'Bedrooms',
      approxAreaSqFt: Math.round(totalBua * 0.32),
      options: [
        { label: 'Vitrified Tiles', rate: 105, desc: 'Standard 600x600mm vitrified tiles with soft glaze.' },
        { label: 'Wooden Laminate', rate: 180, desc: 'AC4 heavy residential German wooden laminate planks.' },
        { label: 'Granite', rate: 210, desc: 'Cool natural granite finish for durable comfort.' },
      ],
    },
    {
      key: 'bathrooms',
      label: 'Bathrooms',
      approxAreaSqFt: Math.round(totalBua * 0.10),
      options: [
        { label: 'Anti-skid Ceramic Tiles', rate: 75, desc: 'R10 safety certified anti-skid ceramic tiles.' },
        { label: 'Matte Finish Vitrified', rate: 115, desc: 'Low-porosity matte vitrified floor tiles.' },
      ],
    },
    {
      key: 'parkingUtility',
      label: 'Parking & Utility',
      approxAreaSqFt: Math.round(totalBua * 0.10),
      options: [
        { label: 'Heavy-Duty Parking Tiles', rate: 65, desc: 'Interlocking 16mm thick heavy vehicular paver tiles.' },
        { label: 'Flamed Granite', rate: 160, desc: 'Thermal flamed rough texture non-slip granite stone.' },
      ],
    },
    {
      key: 'balconies',
      label: 'Balconies',
      approxAreaSqFt: Math.round(totalBua * 0.05),
      options: [
        { label: 'Anti-skid Ceramic', rate: 70, desc: 'Weather-resistant outdoor grade ceramic tiles.' },
        { label: 'Wooden Finish Tiles', rate: 125, desc: 'Exterior timber grain porcelain plank tiles.' },
      ],
    },
  ];

  const currentZone = zones.find((z) => z.key === activeZoneKey) || zones[0];
  const recommendation = getFlooringRecommendation(currentZone.key);
  const selectedOptionLabel = flooringZones[currentZone.key] || recommendation.recommendedValue;

  return (
    <div className="space-y-6 text-left">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 04
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading leading-tight">
          FLOORING FINISHES
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Select surface finishes by zone to calculate tile, granite, and wooden flooring takeoffs.
        </p>
      </div>

      {/* ── ZONE SWITCHER TABS ── */}
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
                'px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2',
                isActive
                  ? 'bg-[#1B3D34] text-white shadow-xs'
                  : 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:text-[#1B3D34] hover:bg-[#F8F8F6]'
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

      {/* ── ACTIVE ZONE SPECIFICATION CARDS ── */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            {currentZone.label} Specification
          </label>
          <span className="font-mono font-extrabold text-[#1B3D34]">
            ~{currentZone.approxAreaSqFt} sq.ft computed
          </span>
        </div>

        <div className="space-y-2">
          {currentZone.options.map((opt) => {
            const isSelected = selectedOptionLabel === opt.label;
            const isRecommended = opt.label === recommendation.recommendedValue;
            const estimatedCost = Math.round(currentZone.approxAreaSqFt * opt.rate);

            return (
              <div
                key={opt.label}
                onClick={() => setFlooringZone(currentZone.key, opt.label)}
                className={cn(
                  'hutty-tactile-card flex items-center justify-between',
                  isSelected && 'hutty-tactile-card-selected'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                      isSelected ? 'bg-[#1B3D34] text-white' : 'border border-[#D1D5DB]'
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-extrabold text-[#1B3D34]">{opt.label}</h4>
                      {isRecommended && (
                        <span className="text-[9px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded-full border border-[#1B3D34]/20">
                          {recommendation.badgeLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{opt.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs font-black text-[#1B3D34] block font-mono">
                    {formatCurrency(estimatedCost)}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{opt.rate}/sq.ft</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CALCULATION TRANSPARENCY: FLOORING & TILES ── */}
      <HowWeCalculatedThis stepKey="flooring" className="mt-4" />

    </div>
  );
};
