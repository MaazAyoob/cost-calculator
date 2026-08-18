import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sliders } from 'lucide-react';
import { runCalculator } from '../../../calculation-engine/calculator';
import { EngineInput } from '../../../calculation-engine/types';
import { formatCurrency } from '../../../utils/cn';
import { useWizardStore } from '../../../store/useWizardStore';

export const InteractiveDemoSection: React.FC = () => {
  const navigate = useNavigate();

  // Local interactive controls for the live demo widget
  const [plotSize, setPlotSize] = useState<'30x40' | '30x50' | '40x60'>('30x50');
  const [floors, setFloors] = useState<number>(3);
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [tier, setTier] = useState<'Essential' | 'Premium' | 'Luxury'>('Premium');

  const getDims = () => {
    switch (plotSize) {
      case '30x40': return { length: 40, width: 30, bua: 720 };
      case '30x50': return { length: 50, width: 30, bua: 900 };
      case '40x60': return { length: 60, width: 40, bua: 1440 };
    }
  };

  const dims = getDims();

  // Run the calculation engine live on every user change
  const demoInput: EngineInput = {
    city: 'Bangalore',
    authority: 'BBMP/BDA',
    plotLength: dims.length,
    plotWidth: dims.width,
    builtUpAreaPerFloor: dims.bua,
    houseType: 'Duplex',
    floors: floors,
    parkingType: 'Normal Ground',
    carCount: 1,
    bikeCount: 2,
    evCharging: true,
    liftRequired: floors >= 4,
    rooms: {
      bedrooms: bedrooms,
      bathrooms: bedrooms,
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
    qualityTier: tier,
    materialBrands: {
      steel: tier === 'Luxury' ? 'Tata Tiscon' : tier === 'Premium' ? 'Tata Tiscon' : 'JSW Neosteel',
      cement: tier === 'Luxury' ? 'UltraTech' : tier === 'Premium' ? 'UltraTech' : 'ACC Cement',
      doors: tier === 'Luxury' ? 'Burma Teak Custom Carved' : tier === 'Premium' ? 'Premium Teak' : 'Flush Door',
      windows: 'uPVC',
      flooring: tier === 'Luxury' ? 'Italian Marble' : 'Vitrified Tiles',
      bathroom: tier === 'Luxury' ? 'Toto' : tier === 'Premium' ? 'Jaquar' : 'Cera',
      electrical: 'V-Guard',
      paint: 'Asian Paints',
    },
    flooringZones: {
      living: tier === 'Luxury' ? 'Italian Marble' : 'Vitrified Tiles 800x800mm',
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
      mainDoor: tier === 'Luxury' ? 'Burma Teak Custom Carved' : tier === 'Premium' ? 'Premium Teak' : 'Normal Teak',
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
      sanitaryTier: tier === 'Luxury' ? 'Luxury (Kohler / Toto)' : 'Premium (Jaquar / Kohler / Grohe)',
      cpvcBrand: 'Ashirwad',
    },
    painting: {
      baseLayer: 'Putty + Primer',
      internalPaint: tier === 'Luxury' ? 'Royale Luxury Emulsion' : 'Premium Emulsion',
      externalPaint: 'Ultima Weather Proof',
      brand: 'Asian Paints',
    },
  };

  const result = runCalculator(demoInput);

  return (
    <section id="demo" className="py-20 lg:py-28 bg-[#F7F7F5] border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md inline-block">
            Interactive Calculator Preview
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172033] tracking-tight leading-[1.15]">
            See your estimate take shape as you configure your home.
          </h2>
          <p className="text-base text-[#667085] leading-relaxed">
            Adjust plot dimensions, storeys, room allocations, and material tiers below to watch live construction costs, quantities, and rates recalculate instantly.
          </p>
        </div>

        {/* Live Interactive Product Mockup */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left: Interactive Configuration Controls (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#E5E7EB] space-y-6 text-left bg-slate-50/50">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7EB]">
              <Sliders className="w-4 h-4 text-[#1F4B43]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                Try Changing Inputs
              </span>
            </div>

            {/* 1. Plot Size */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#172033] block">
                Plot Dimensions
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['30x40', '30x50', '40x60'] as const).map((ps) => (
                  <button
                    key={ps}
                    type="button"
                    onClick={() => setPlotSize(ps)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      plotSize === ps
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
              <label className="text-xs font-semibold text-[#172033] block">
                Floors / Storeys
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFloors(f)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
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
              <label className="text-xs font-semibold text-[#172033] block">
                Bedroom Layout
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBedrooms(b)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
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

            {/* 4. Specification Tier */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#172033] block">
                Construction Grade
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Essential', 'Premium', 'Luxury'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
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

          {/* Right: Live Calculation Output & Breakdown (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Calculated Estimate Output
                </span>
                <span className="text-[11px] font-bold text-[#1F4B43] bg-[#EBF2F0] px-2.5 py-0.5 rounded-full">
                  Live Engine Active
                </span>
              </div>

              {/* Primary Cost Display */}
              <div className="py-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] block">
                  Estimated Total Project Cost
                </span>
                <div className="text-3xl sm:text-4xl font-bold text-[#1F4B43] tracking-tight">
                  {formatCurrency(result.budget.totalProjectCost)}
                </div>
                <p className="text-xs text-[#667085]">
                  Includes structural base, {tier} specifications, contractor margins &amp; statutory GST.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                    Total BUA
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#172033] block">
                    {result.area.totalBUASqFt.toLocaleString()} sqft
                  </span>
                </div>

                <div className="p-3 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                    Effective Rate
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#172033] block">
                    ₹{result.budget.costPerSqFt.toLocaleString()}/sqft
                  </span>
                </div>

                <div className="p-3 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                    TMT Steel
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#172033] block">
                    {result.quantities.steelTonnes} Tonnes
                  </span>
                </div>

                <div className="p-3 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                    Cement Bags
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#172033] block">
                    {result.quantities.cementBags.toLocaleString()} Bags
                  </span>
                </div>
              </div>

              {/* Active BOQ Sample Preview */}
              <div className="pt-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                  Top BOQ Contributions ({result.boq.length} line items total)
                </span>
                <div className="space-y-1 text-xs">
                  {result.boq.slice(0, 3).map((item) => (
                    <div key={item.code} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between border border-[#E5E7EB]">
                      <span className="font-semibold text-[#172033] truncate max-w-[65%]">
                        {item.description}
                      </span>
                      <span className="font-bold text-[#172033]">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Full Calculator CTA */}
            <div className="pt-4 border-t border-[#E5E7EB]">
              <button
                onClick={() => {
                  useWizardStore.getState().startNewProject();
                  useWizardStore.setState({
                    plotLength: dims.length,
                    plotWidth: dims.width,
                    floors: floors,
                    qualityTier: tier,
                    rooms: {
                      ...useWizardStore.getState().rooms,
                      bedrooms: bedrooms,
                      bathrooms: bedrooms,
                    },
                  });
                  navigate('/calculator');
                }}
                className="w-full py-3 px-4 bg-[#1F4B43] hover:bg-[#163731] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                Customize Your Actual Plot in Full Calculator <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
