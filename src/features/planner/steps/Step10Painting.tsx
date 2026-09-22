import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { useRecommendations } from '../../../hooks/useRecommendations';
import { Check } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';
import { HowWeCalculatedThis } from '../../../components/common/HowWeCalculatedThis';

export const Step10Painting: React.FC = () => {
  const { painting, setPaintingSelection } = useWizardStore();
  const quantities = useQuantities();
  const { getPaintingRecommendation } = useRecommendations();
  const rec = getPaintingRecommendation();

  const interiorAreaSqFt = quantities.interiorPaintAreaSqFt || 5800;
  const exteriorAreaSqFt = quantities.exteriorPaintAreaSqFt || 2200;

  const brands: { id: string; desc: string }[] = [
    { id: 'Asian Paints', desc: 'Apex & Royale series' },
    { id: 'Berger Paints', desc: 'Silk & WeatherCoat' },
    { id: 'Dulux', desc: 'Velvet & Weathershield' },
  ];

  const internalOptions: {
    id: 'Tractor Emulsion' | 'Premium Emulsion' | 'Royale Luxury Emulsion' | string;
    title: string;
    ratePerSqFt: number;
    desc: string;
  }[] = [
    { id: 'Tractor Emulsion', title: 'Economy Tractor', ratePerSqFt: 18, desc: 'Smooth matte finish washable interior paint with 2 coats primer.' },
    { id: 'Premium Emulsion', title: 'Premium Emulsion', ratePerSqFt: 28, desc: 'Rich soft-sheen stain resistant interior emulsion with high coverage.' },
    { id: 'Royale Luxury Emulsion', title: 'Royale Luxury Finish', ratePerSqFt: 45, desc: 'Teflon surface protector with anti-bacterial high scrub resistance.' },
  ];

  const externalOptions: {
    id: 'Ultima Weather Proof' | 'Texture Finish';
    title: string;
    ratePerSqFt: number;
    desc: string;
  }[] = [
    { id: 'Ultima Weather Proof', title: 'Ultima Weather Proof', ratePerSqFt: 32, desc: 'Silicon-enhanced anti-fungal heavy rain & heat protection.' },
    { id: 'Texture Finish', title: 'Architectural Texture', ratePerSqFt: 55, desc: 'Granite/stone textured exterior protective coating.' },
  ];

  const selectedBrand = painting.brand || rec.brand;
  const selectedInternalPaint = painting.internalPaint || (rec.internalPaint.includes('Royale') ? 'Royale Luxury Emulsion' : rec.internalPaint);
  const selectedExternalPaint = painting.externalPaint || 'Ultima Weather Proof';

  return (
    <div className="space-y-6 text-left">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 10
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading leading-tight">
          PAINTING &amp; COATINGS
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Specify paint manufacturer and finish grades for interior walls and exterior facade.
        </p>
      </div>

      {/* ── 1. BRAND SELECTION ── */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Paint Manufacturer
        </label>
        <div className="grid grid-cols-3 gap-2">
          {brands.map((b) => {
            const isSelected = selectedBrand.toLowerCase().includes(b.id.toLowerCase().split(' ')[0]);
            const isRecommended = rec.brand.toLowerCase().includes(b.id.toLowerCase().split(' ')[0]);

            return (
              <div
                key={b.id}
                onClick={() => setPaintingSelection(selectedInternalPaint, selectedExternalPaint, b.id)}
                className={cn(
                  'hutty-tactile-card p-3 space-y-1',
                  isSelected && 'hutty-tactile-card-selected'
                )}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-extrabold text-[#1B3D34]">{b.id}</h4>
                    {isRecommended && (
                      <span className="text-[8px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-1.5 py-0.5 rounded-full border border-[#1B3D34]/20">
                        {rec.badgeLabel}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />}
                </div>
                <p className="text-[10px] text-[#4B5563] truncate">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. INTERIOR PAINT GRADE ── */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            Interior Paint Grade
          </label>
          <span className="font-mono text-[#4B5563] text-[11px]">
            ~{interiorAreaSqFt.toLocaleString()} sq.ft wall area
          </span>
        </div>

        <div className="space-y-2">
          {internalOptions.map((opt) => {
            const isSelected = selectedInternalPaint === opt.id || (selectedInternalPaint.includes('Royale') && opt.id.includes('Royale'));
            const isRecommended = rec.internalPaint === opt.id || (rec.internalPaint.includes('Royale') && opt.id.includes('Royale'));
            const optCost = Math.round(interiorAreaSqFt * opt.ratePerSqFt);

            return (
              <div
                key={opt.id}
                onClick={() => setPaintingSelection(opt.id, selectedExternalPaint, selectedBrand)}
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
                      <h4 className="text-xs font-extrabold text-[#1B3D34]">{opt.title}</h4>
                      {isRecommended && (
                        <span className="text-[9px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded-full border border-[#1B3D34]/20">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{opt.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs font-black text-[#1B3D34] block font-mono">
                    ~{formatCurrency(optCost)}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{opt.ratePerSqFt}/sq.ft</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. EXTERIOR FACADE COATING ── */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            Exterior Facade Weather Coating
          </label>
          <span className="font-mono text-[#4B5563] text-[11px]">
            ~{exteriorAreaSqFt.toLocaleString()} sq.ft
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {externalOptions.map((opt) => {
            const isSelected = selectedExternalPaint === opt.id;
            const optCost = Math.round(exteriorAreaSqFt * opt.ratePerSqFt);
            return (
              <div
                key={opt.id}
                onClick={() => setPaintingSelection(selectedInternalPaint, opt.id, selectedBrand)}
                className={cn(
                  'hutty-tactile-card space-y-2 flex flex-col justify-between',
                  isSelected && 'hutty-tactile-card-selected'
                )}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-extrabold text-[#1B3D34]">{opt.title}</h4>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
                  </div>
                  <p className="text-[10px] text-[#4B5563] mt-1 leading-relaxed">{opt.desc}</p>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-center text-xs font-bold text-[#1B3D34]">
                  <span className="font-mono">~{formatCurrency(optCost)}</span>
                  <span className="text-[10px] text-[#4B5563]">₹{opt.ratePerSqFt}/sq.ft</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CALCULATION TRANSPARENCY: PAINTING & COATINGS ── */}
      <HowWeCalculatedThis stepKey="paint" className="mt-4" />

    </div>
  );
};
