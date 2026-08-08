import React, { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useArea } from '../../../store/useCalculationStore';
import { Card } from '../../../components/ui/Card';
import { Grid, Check, HelpCircle, ArrowRight } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step4Flooring: React.FC = () => {
  const { flooringZones, setFlooringZone } = useWizardStore();
  const area = useArea();
  const [activeZoneKey, setActiveZoneKey] = useState<keyof typeof flooringZones>('living');
  const [showWhy, setShowWhy] = useState(false);

  const totalBua = area.totalBUASqFt || 3850;

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
    <div className="space-y-8 py-2">
      {/* Header Intro */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Zone-Specific Flooring</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Select material preferences for each room zone to estimate flooring cost.
        </p>
      </div>

      {/* Zone Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {zones.map((z) => {
          const isActive = activeZoneKey === z.key;
          const isZoneSelected = Boolean(flooringZones[z.key]);
          return (
            <button
              key={z.key}
              type="button"
              onClick={() => setActiveZoneKey(z.key)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border',
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : isZoneSelected
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              <span>{z.label}</span>
              {isZoneSelected && <span className={cn('w-2 h-2 rounded-full', isActive ? 'bg-white' : 'bg-blue-600')}></span>}
            </button>
          );
        })}
      </div>

      {/* Active Zone Card */}
      <Card className="p-6 bg-white border border-slate-200/90 shadow-soft-xs rounded-2xl space-y-5">
        <div className="flex justify-between items-center text-xs">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">{currentZone.label} Finish</h3>
            <span className="text-slate-500 text-[11px] font-medium">
              {selectedOptionLabel ? `Selected: ${selectedOptionLabel}` : 'Status: No option selected'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-blue-600 font-extrabold block">~{currentZone.approxAreaSqFt} Sq Ft</span>
            <button
              type="button"
              onClick={() => setShowWhy(!showWhy)}
              className="text-[10px] text-slate-400 hover:text-slate-600 underline flex items-center gap-0.5 justify-end cursor-pointer font-semibold"
            >
              <HelpCircle className="w-3 h-3" /> Why area?
            </button>
          </div>
        </div>

        {showWhy && (
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 text-xs text-blue-900 space-y-1">
            <p className="font-bold">Area Estimation Rationale:</p>
            <p className="text-[11px] leading-relaxed text-blue-800">
              Estimated from your project's total usable built-up area and configured room counts for {currentZone.label}.
            </p>
          </div>
        )}

        {/* Options Selection Cards */}
        <div className="space-y-2.5">
          {currentZone.options.map((opt) => {
            const isSelected = selectedOptionLabel === opt.label;
            const estimatedCost = Math.round(currentZone.approxAreaSqFt * opt.rate);
            return (
              <Card
                key={opt.label}
                onClick={() => setFlooringZone(currentZone.key, opt.label)}
                className={cn(
                  'p-4 cursor-pointer border transition-all flex items-center justify-between rounded-2xl',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900">{opt.label}</h4>
                      {opt.recommended && (
                        <span className="text-[10px] font-extrabold bg-blue-100/80 text-blue-700 px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{opt.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">{formatCurrency(estimatedCost)}</span>
                    <span className="text-[10px] text-slate-400 font-medium">₹{opt.rate}/sq.ft</span>
                  </div>
                  <span className={cn(
                    'text-xs font-extrabold px-3 py-1 rounded-xl border transition-colors flex items-center gap-1',
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  )}>
                    {isSelected ? '✓ Selected' : <>Select <ArrowRight className="w-3 h-3 inline" /></>}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
