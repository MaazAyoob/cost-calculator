import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sliders, TrendingUp, Check } from 'lucide-react';
import { runCalculator } from '../../../calculation-engine/calculator';
import { EngineInput } from '../../../calculation-engine/types';
import { formatCurrency } from '../../../utils/cn';
import { useWizardStore } from '../../../store/useWizardStore';

export const InteractiveDemoSection: React.FC = () => {
  const navigate = useNavigate();

  // Interactive controls
  const [plotChoice, setPlotChoice] = useState<'30x40' | '30x50' | '40x60'>('30x50');
  const [floors, setFloors] = useState<number>(3);
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [tier, setTier] = useState<'Essential' | 'Premium' | 'Luxury'>('Premium');

  const getDims = (choice: '30x40' | '30x50' | '40x60') => {
    switch (choice) {
      case '30x40': return { length: 40, width: 30, bua: 720 };
      case '30x50': return { length: 50, width: 30, bua: 900 };
      case '40x60': return { length: 60, width: 40, bua: 1440 };
    }
  };

  const currentDims = getDims(plotChoice);

  // Helper to build EngineInput
  const buildInput = (
    dims: { length: number; width: number; bua: number },
    flr: number,
    bhk: number,
    bath: number,
    t: 'Essential' | 'Premium' | 'Luxury'
  ): EngineInput => ({
    city: 'Bangalore',
    authority: 'BBMP/BDA',
    plotLength: dims.length,
    plotWidth: dims.width,
    builtUpAreaPerFloor: dims.bua,
    houseType: 'Duplex',
    floors: flr,
    parkingType: 'Normal Ground',
    carCount: 1,
    bikeCount: 2,
    evCharging: true,
    liftRequired: flr >= 4,
    rooms: {
      bedrooms: bhk,
      bathrooms: bath,
      commonToilets: 1,
      kitchen: 1,
      dining: 1,
      living: 1,
      balcony: 1,
      office: 0,
      pooja: 1,
      utility: 1,
      storeRoom: 0,
    },
    qualityTier: t,
    materialBrands: {
      steel: t === 'Luxury' ? 'Tata Tiscon' : t === 'Premium' ? 'Tata Tiscon' : 'JSW Neosteel',
      cement: t === 'Luxury' ? 'UltraTech' : t === 'Premium' ? 'UltraTech' : 'ACC Cement',
      doors: t === 'Luxury' ? 'Premium Teak' : t === 'Premium' ? 'Premium Teak' : 'Flush Door',
      windows: 'uPVC',
      flooring: t === 'Luxury' ? 'Italian Marble' : 'Vitrified Tiles',
      bathroom: t === 'Luxury' ? 'Toto' : t === 'Premium' ? 'Jaquar' : 'Cera',
      electrical: 'V-Guard',
      paint: 'Asian Paints',
    },
    flooringZones: {
      living: t === 'Luxury' ? 'Italian Marble' : 'Vitrified Tiles 800x800mm',
      kitchenDining: 'Vitrified Tiles',
      bedrooms: 'Vitrified Tiles',
      bathrooms: 'Anti-skid Ceramic Tiles',
      parkingUtility: 'Heavy-Duty Parking Tiles',
      balconies: 'Anti-skid Ceramic',
    },
    wallCladding: {
      kitchenDadoHeight: '2 ft',
      bathroomTileHeight: '7 ft (Lintel)',
    },
    doors: {
      mainDoor: t === 'Luxury' ? 'Premium Teak' : t === 'Premium' ? 'Premium Teak' : 'Normal Teak',
      internalDoor: 'Flush Door',
      bathroomDoor: 'WPC Door',
    },
    windows: {
      primaryMaterial: 'uPVC',
      subGrade: 'Standard uPVC',
    },
    electrical: {
      conduit: 'Heavy-Duty ISI Marked PVC',
      wireTier: 'Mid-range (V-Guard)',
    },
    bathroomFittings: {
      sanitaryTier: t === 'Luxury' ? 'Luxury (Toto / Duravit)' : 'Premium (Jaquar / Kohler / Grohe)',
      cpvcBrand: 'Ashirwad',
    },
    painting: {
      baseLayer: 'Putty + Primer',
      internalPaint: t === 'Luxury' ? 'Royale Luxury Emulsion' : 'Premium Emulsion',
      externalPaint: 'Ultima Weather Proof',
      brand: 'Asian Paints',
    },
  });

  // Current live calculation
  const currentResult = runCalculator(buildInput(currentDims, floors, bedrooms, bathrooms, tier));

  // Baseline reference for delta demonstration (e.g. 2 bedrooms baseline vs current)
  const baselineInput = buildInput(currentDims, floors, 2, 2, tier);
  const baselineResult = runCalculator(baselineInput);
  const deltaAmount = currentResult.budget.totalProjectCost - baselineResult.budget.totalProjectCost;

  return (
    <section id="demo" className="py-20 lg:py-28 bg-[#F7F7F5] border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md inline-block">
            Live Product Demo
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#172033] tracking-tight leading-[1.15]">
            Your estimate changes as your home takes shape.
          </h2>
          <p className="text-base text-[#667085] leading-relaxed font-normal">
            Interact with actual parameters below to observe deterministic cost, built-up area, and BOQ quantity adjustments in real time.
          </p>
        </div>

        {/* Large Interactive Calculator Preview Showcase */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT: Parameters Form (lg:col-span-5) */}
          <div className="lg:col-span-5 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#E5E7EB] space-y-6 text-left bg-[#FAFAF8]">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7EB]">
              <Sliders className="w-4 h-4 text-[#1F4B43]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                Adjust Configuration Parameters
              </span>
            </div>

            {/* 1. Plot */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#172033] block">
                Plot Dimensions
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['30x40', '30x50', '40x60'] as const).map((ps) => (
                  <button
                    key={ps}
                    type="button"
                    onClick={() => setPlotChoice(ps)}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      plotChoice === ps
                        ? 'bg-[#1F4B43] text-white border-[#1F4B43] shadow-xs'
                        : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-slate-50'
                    }`}
                  >
                    {ps.replace('x', ' × ')} ft
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Floors */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#172033] block">
                Storeys / Floors
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFloors(f)}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      floors === f
                        ? 'bg-[#1F4B43] text-white border-[#1F4B43] shadow-xs'
                        : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-slate-50'
                    }`}
                  >
                    {f === 1 ? 'Ground' : `G+${f - 1}`}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Bedrooms */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#172033] block">
                Bedrooms
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => { setBedrooms(b); setBathrooms(b); }}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      bedrooms === b
                        ? 'bg-[#1F4B43] text-white border-[#1F4B43] shadow-xs'
                        : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-slate-50'
                    }`}
                  >
                    {b} BHK
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Bathrooms */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#172033] block">
                Bathrooms
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((bath) => (
                  <button
                    key={bath}
                    type="button"
                    onClick={() => setBathrooms(bath)}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      bathrooms === bath
                        ? 'bg-[#1F4B43] text-white border-[#1F4B43] shadow-xs'
                        : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-slate-50'
                    }`}
                  >
                    {bath} Baths
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Materials Tier */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#172033] block">
                Specification Grade
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Essential', 'Premium', 'Luxury'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      tier === t
                        ? 'bg-[#1F4B43] text-white border-[#1F4B43] shadow-xs'
                        : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Large Live Estimate & Delta Preview (lg:col-span-7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 text-left flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Calculated Live Output
                </span>
                <span className="text-[11px] font-mono font-bold text-[#1F4B43] bg-[#EBF2F0] px-2.5 py-0.5 rounded-full">
                  IS 456 ENGINE SYNCED
                </span>
              </div>

              {/* Big Live Estimate Numbers */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                  ESTIMATED TOTAL COST
                </span>
                <div className="text-4xl sm:text-5xl font-black text-[#1F4B43] tracking-tight">
                  {formatCurrency(currentResult.budget.totalProjectCost)}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#172033] font-semibold pt-1">
                  <span>{currentResult.area.totalBUASqFt.toLocaleString()} sq.ft Built-Up</span>
                  <span className="text-[#E5E7EB]">•</span>
                  <span>₹{currentResult.budget.costPerSqFt.toLocaleString()} / sq.ft</span>
                </div>
              </div>

              {/* Visual Delta Display (USP: Live Cost Calculation) */}
              <div className="p-4 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#172033]">
                  <span className="flex items-center gap-1.5 text-[#1F4B43]">
                    <TrendingUp className="w-4 h-4" /> Live Calculation Delta:
                  </span>
                  <span className="font-mono text-xs text-[#667085]">
                    Baseline (2 BHK) vs Current ({bedrooms} BHK)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-[#667085] block uppercase font-bold">Bedrooms</span>
                    <span className="font-bold text-[#172033]">2 → {bedrooms} BHK</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#667085] block uppercase font-bold">Estimated Delta</span>
                    <span className="font-bold text-[#1F4B43]">
                      {deltaAmount === 0 ? 'Baseline (₹0)' : `+${formatCurrency(deltaAmount)}`}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-[10px] text-[#667085] block uppercase font-bold">Steel & Cement</span>
                    <span className="font-bold text-[#172033]">
                      {currentResult.quantities.steelTonnes}T • {currentResult.quantities.cementBags} Bags
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block pb-1">
                  Trade Allocations:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-[#E5E7EB] flex justify-between">
                    <span className="text-[#667085]">Structure & Shell:</span>
                    <span className="font-bold text-[#172033]">{formatCurrency(currentResult.budget.structuralCost)}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-[#E5E7EB] flex justify-between">
                    <span className="text-[#667085]">Finishes & Joinery:</span>
                    <span className="font-bold text-[#172033]">{formatCurrency(currentResult.budget.finishingCost)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Full Calculator CTA */}
            <div className="pt-4 border-t border-[#E5E7EB]">
              <button
                onClick={() => {
                  useWizardStore.getState().startNewProject();
                  useWizardStore.setState({
                    plotLength: currentDims.length,
                    plotWidth: currentDims.width,
                    floors: floors,
                    qualityTier: tier,
                    rooms: {
                      ...useWizardStore.getState().rooms,
                      bedrooms: bedrooms,
                      bathrooms: bathrooms,
                    },
                  });
                  navigate('/calculator');
                }}
                className="w-full py-3.5 px-4 bg-[#1F4B43] hover:bg-[#163731] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                Open Full 10-Step Calculator With These Specs <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
