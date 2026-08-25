import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sliders, Check, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { runCalculator } from '../../../calculation-engine/calculator';
import { EngineInput } from '../../../calculation-engine/types';
import { formatCurrency } from '../../../utils/cn';
import { useWizardStore } from '../../../store/useWizardStore';
import { AnimatedNumber } from '../../../components/common/AnimatedNumber';

export const InteractiveDemoSection: React.FC = () => {
  const navigate = useNavigate();

  // Interactive demo inputs
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

  // Synchronously calculate using real engine
  const calculationResult = useMemo(() => {
    const input: EngineInput = {
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: currentDims.length,
      plotWidth: currentDims.width,
      builtUpAreaPerFloor: currentDims.bua,
      houseType: 'Duplex',
      floors: floors,
      parkingType: 'Normal Ground',
      carCount: 1,
      bikeCount: 2,
      evCharging: true,
      liftRequired: floors >= 4,
      rooms: {
        bedrooms: bedrooms,
        bathrooms: bathrooms,
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
        masonry: 'AAC Blocks',
        doors: tier === 'Luxury' ? 'Premium Teak' : tier === 'Premium' ? 'Premium Teak' : 'Flush Door',
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
        mainDoor: tier === 'Luxury' ? 'Premium Teak' : tier === 'Premium' ? 'Premium Teak' : 'Normal Teak',
        internalDoor: 'Flush Door',
        bathroomDoor: 'WPC Door',
      },
      windows: {
        primaryMaterial: 'uPVC',
        subGrade: tier === 'Luxury' ? 'Luxury / Fenesta uPVC' : 'Standard uPVC',
      },
      electrical: {
        conduit: 'Heavy-Duty ISI Marked PVC',
        wireTier: tier === 'Luxury' ? 'Premium (Finolex / Polycab)' : 'Mid-range (V-Guard)',
      },
      bathroomFittings: {
        sanitaryTier: tier === 'Luxury' ? 'Luxury (Toto / Duravit)' : tier === 'Premium' ? 'Premium (Jaquar / Kohler / Grohe)' : 'Mass Market (Cera / Hindware / Parryware)',
        cpvcBrand: 'Astral',
      },
      painting: {
        baseLayer: 'Putty + Primer',
        internalPaint: tier === 'Luxury' ? 'Royale Luxury Emulsion' : 'Premium Emulsion',
        externalPaint: 'Ultima Weather Proof',
        brand: 'Asian Paints',
      },
    };

    return runCalculator(input);
  }, [currentDims, floors, bedrooms, bathrooms, tier]);

  const totalCost = calculationResult.budget.totalProjectCost;
  const buaSqFt = calculationResult.area.totalBUASqFt;
  const ratePerSqFt = Math.round(totalCost / buaSqFt);
  const steelTonnes = calculationResult.quantities.steelTonnes;
  const cementBags = calculationResult.quantities.cementBags;

  // Live Cost Delta Tracker
  const prevCostRef = useRef<number>(totalCost);
  const [costDelta, setCostDelta] = useState<number | null>(null);

  useEffect(() => {
    if (prevCostRef.current !== totalCost && prevCostRef.current > 0) {
      const delta = totalCost - prevCostRef.current;
      setCostDelta(delta);
      const timer = setTimeout(() => setCostDelta(null), 2800);
      prevCostRef.current = totalCost;
      return () => clearTimeout(timer);
    }
    prevCostRef.current = totalCost;
  }, [totalCost]);

  const handleLaunchWithParams = () => {
    const store = useWizardStore.getState();
    store.startNewProject();
    store.setPlotDimensions(currentDims.length, currentDims.width);
    store.setBuiltUpAreaPerFloor(currentDims.bua);
    store.setHouseConfig('Duplex', floors);
    store.setQualityTier(tier);
    navigate('/calculator');
  };

  return (
    <section id="demo" className="py-20 lg:py-24 bg-[#F8F8F6] border-b border-[#E5E7EB] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-3 py-1.5 rounded-full inline-block">
            LIVE ENGINE DEMO
          </span>
          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.12]">
            See your estimate change <br />
            as your home takes shape.
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
            Adjust plot dimensions, storeys, room allocations, and material tiers below to observe real-time engineering recalculation.
          </p>
        </div>

        {/* Large Split Layout: Left Controls, Right Live Output */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* LEFT: Controls (col-span-6) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] font-heading">
                Interactive Parameters
              </span>
              <span className="text-[10px] font-mono text-[#4B5563] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                CHANGES SYNC INSTANTLY
              </span>
            </div>

            {/* 1. Plot Size */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1B3D34] block">
                Standard Bengaluru Plot Dimensions
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: '30x40', label: "30' × 40'", desc: '1,200 sq.ft' },
                  { id: '30x50', label: "30' × 50'", desc: '1,500 sq.ft' },
                  { id: '40x60', label: "40' × 60'", desc: '2,400 sq.ft' },
                ].map((item) => {
                  const selected = plotChoice === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPlotChoice(item.id as any)}
                      className={`hutty-tactile-card p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        selected
                          ? 'hutty-tactile-card-selected'
                          : 'border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#1B3D34] font-mono block">
                          {item.label}
                        </span>
                        {selected && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
                      </div>
                      <span className="text-[10px] text-[#4B5563] block mt-0.5 font-mono">
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Number of Floors */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1B3D34] block">
                Storey Configuration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { count: 1, label: 'Ground' },
                  { count: 2, label: 'G + 1' },
                  { count: 3, label: 'G + 2' },
                  { count: 4, label: 'G + 3' },
                ].map((item) => {
                  const selected = floors === item.count;
                  return (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => setFloors(item.count)}
                      className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        selected
                          ? 'border-[#1B3D34] bg-[rgba(27,61,52,0.08)] text-[#1B3D34] shadow-2xs'
                          : 'border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)] bg-white text-[#4B5563]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B3D34] block">
                  Bedrooms: <span className="font-mono text-[#1B3D34]">{bedrooms} BHK</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setBedrooms(count)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                        bedrooms === count
                          ? 'border-[#1B3D34] bg-[rgba(27,61,52,0.08)] text-[#1B3D34]'
                          : 'border-[#E5E7EB] text-[#4B5563] hover:bg-[rgba(27,61,52,0.04)]'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B3D34] block">
                  Bathrooms: <span className="font-mono text-[#1B3D34]">{bathrooms}</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setBathrooms(count)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                        bathrooms === count
                          ? 'border-[#1B3D34] bg-[rgba(27,61,52,0.08)] text-[#1B3D34]'
                          : 'border-[#E5E7EB] text-[#4B5563] hover:bg-[rgba(27,61,52,0.04)]'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Specification Package Tier */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1B3D34] block">
                Specification Quality Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Essential', 'Premium', 'Luxury'] as const).map((t) => {
                  const selected = tier === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        selected
                          ? 'border-[#1B3D34] bg-[rgba(27,61,52,0.08)] text-[#1B3D34] shadow-2xs'
                          : 'border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)] bg-white text-[#4B5563]'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Live Architectural Preview (col-span-6) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6 text-left relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1B3D34] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] font-heading">
                  Live Calculation Takeoff
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2.5 py-0.5 rounded-full font-bold">
                CANONICAL ENGINE
              </span>
            </div>

            {/* Main Hero Cost with AnimatedNumber and Live Delta Badge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] block">
                  ESTIMATED TOTAL COST
                </span>

                {/* Animated Delta Badge */}
                <AnimatePresence>
                  {costDelta !== null && costDelta !== 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -4 }}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold shadow-2xs ${
                        costDelta > 0
                          ? 'bg-[#F28C28]/10 text-[#F28C28] border border-[#F28C28]/30'
                          : 'bg-[#1B3D34]/10 text-[#1B3D34] border border-[#1B3D34]/30'
                      }`}
                    >
                      {costDelta > 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {costDelta > 0 ? `+ ${formatCurrency(costDelta)}` : `- ${formatCurrency(Math.abs(costDelta))}`}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B3D34] tracking-tight font-heading">
                <AnimatedNumber value={totalCost} format={(v) => formatCurrency(Math.round(v))} duration={350} />
              </div>
              <p className="text-xs text-[#4B5563]">
                Includes RCC frame, masonry, premium finishes, electrical, plumbing & 18% statutory GST.
              </p>
            </div>

            {/* 3 Secondary Metric Boxes with Animated Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block">
                  BUILT-UP AREA
                </span>
                <span className="text-sm font-extrabold text-[#1B3D34] font-mono mt-0.5 block">
                  <AnimatedNumber value={buaSqFt} format={(v) => `${Math.round(v).toLocaleString()} sq.ft`} duration={300} />
                </span>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block">
                  EFFECTIVE RATE
                </span>
                <span className="text-sm font-extrabold text-[#1B3D34] font-mono mt-0.5 block">
                  <AnimatedNumber value={ratePerSqFt} format={(v) => `₹${Math.round(v).toLocaleString()} / sq.ft`} duration={300} />
                </span>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] col-span-2 sm:col-span-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block">
                  STEEL &bull; CEMENT
                </span>
                <span className="text-sm font-extrabold text-[#1B3D34] font-mono mt-0.5 block truncate">
                  {steelTonnes}T &bull; {cementBags} Bags
                </span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-2">
              <button
                onClick={handleLaunchWithParams}
                className="w-full hutty-btn-primary py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs"
              >
                <span>Open in Full Calculator Workspace</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

