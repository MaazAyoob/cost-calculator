import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { useRecommendations } from '../../../hooks/useRecommendations';
import { Check } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';
import { HowWeCalculatedThis } from '../../../components/common/HowWeCalculatedThis';

export const Step3CoreMaterials: React.FC = () => {
  const { materialBrands, setCoreMaterials } = useWizardStore();
  const quantities = useQuantities();
  const { getCoreMaterialsRecommendation } = useRecommendations();
  const recommendedCore = getCoreMaterialsRecommendation();

  const steelTonnes = quantities.steelTonnes || 0;
  const cementBags = quantities.cementBags || 0;

  const steelOptions: { brand: 'Tata Tiscon' | 'JSW Neosteel' | 'Indus TMT'; grade: string; ratePerKg: number; desc: string }[] = [
    { brand: 'Tata Tiscon', grade: 'Fe 550D Super Ductile', ratePerKg: 78, desc: 'Primary structural steel with superior earthquake ductility.' },
    { brand: 'JSW Neosteel', grade: 'Fe 550D High Strength', ratePerKg: 74, desc: 'High-yield thermo-mechanically treated primary rebars.' },
    { brand: 'Indus TMT', grade: 'Fe 500D Premium', ratePerKg: 68, desc: 'Cost-effective high-durability ribbed TMT bars.' },
  ];

  const cementOptions: { brand: 'UltraTech' | 'ACC Cement' | 'Dalmia Bharat'; grade: string; ratePerBag: number; desc: string }[] = [
    { brand: 'UltraTech', grade: 'Super / Weather Plus (OPC 53)', ratePerBag: 420, desc: "India's #1 structural cement with water-repellent micro-particles." },
    { brand: 'ACC Cement', grade: 'Gold Water Shield / Concrete Plus', ratePerBag: 395, desc: 'High initial compressive strength for slab casting.' },
    { brand: 'Dalmia Bharat', grade: 'DSP / PPC Heavy Structure', ratePerBag: 375, desc: 'High slump retention for heavy reinforced concrete.' },
  ];

  const masonryOptions = [
    {
      type: 'AAC Blocks',
      name: 'AAC Blocks (Birla Aerocon / Godrej)',
      size: '600 × 200 × 150 mm',
      vol: '0.018 m³',
      wastage: '5%',
      rate: 85,
      unit: 'Block',
      desc: 'IS 2185 Part 3 lightweight thermal insulating blocks with polymer jointing.',
    },
    {
      type: 'Clay Bricks',
      name: 'Wirecut Red Clay Bricks',
      size: '190 × 90 × 90 mm',
      vol: '0.00154 m³',
      wastage: '7%',
      rate: 12,
      unit: 'Brick',
      desc: 'IS 1077 high compressive strength modular kiln-burnt red clay bricks.',
    },
    {
      type: 'Concrete Blocks',
      name: 'Solid Concrete / Cement Blocks',
      size: '400 × 200 × 150 mm',
      vol: '0.012 m³',
      wastage: '5%',
      rate: 52,
      unit: 'Block',
      desc: 'IS 2185 Part 1 heavy-duty hydraulic pressed solid concrete blocks.',
    },
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
            STEP 03
          </span>
          <span className="text-[10px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2.5 py-0.5 rounded-full border border-[#1B3D34]/15">
            {recommendedCore.badge}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading leading-tight">
          CORE STRUCTURAL MATERIALS
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Select structural TMT steel and Portland cement brands. Physical quantities remain invariant while unit rates reflect manufacturer grade.
        </p>
      </div>

      {/* ── 1. STRUCTURAL STEEL ── */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            TMT Rebar Steel
          </label>
          <span className="font-mono font-extrabold text-[#1B3D34]">
            {steelTonnes > 0 ? `${steelTonnes} Tonnes Required` : '0 T'}
          </span>
        </div>

        <div className="space-y-2">
          {steelOptions.map((item) => {
            const isSelected = (!materialBrands.steel && item.brand === recommendedCore.steel) || materialBrands.steel === item.brand;
            const isRecommended = item.brand === recommendedCore.steel;
            const itemCost = Math.round(steelTonnes * 1000 * item.ratePerKg);

            return (
              <div
                key={item.brand}
                onClick={() => setCoreMaterials(item.brand, (materialBrands.cement || recommendedCore.cement) as any, materialBrands.masonry as any)}
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
                      <h4 className="text-xs font-extrabold text-[#1B3D34]">{item.brand}</h4>
                      <span className="text-[10px] font-mono text-[#4B5563] bg-[#F8F8F6] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                        {item.grade}
                      </span>
                      {isRecommended && (
                        <span className="text-[9px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded-full border border-[#1B3D34]/20">
                          Recommended for your plan
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs font-black text-[#1B3D34] block font-mono">
                    {steelTonnes > 0 ? formatCurrency(itemCost) : `₹${item.ratePerKg}/kg`}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{item.ratePerKg}/kg</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. PORTLAND CEMENT ── */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            Portland Cement (50 kg Bag)
          </label>
          <span className="font-mono font-extrabold text-[#1B3D34]">
            {cementBags > 0 ? `${cementBags.toLocaleString()} Bags Required` : '0 Bags'}
          </span>
        </div>

        <div className="space-y-2">
          {cementOptions.map((item) => {
            const isSelected = (!materialBrands.cement && item.brand === recommendedCore.cement) || materialBrands.cement === item.brand;
            const isRecommended = item.brand === recommendedCore.cement;
            const itemCost = Math.round(cementBags * item.ratePerBag);

            return (
              <div
                key={item.brand}
                onClick={() => setCoreMaterials((materialBrands.steel || recommendedCore.steel) as any, item.brand, materialBrands.masonry as any)}
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
                      <h4 className="text-xs font-extrabold text-[#1B3D34]">{item.brand}</h4>
                      <span className="text-[10px] font-mono text-[#4B5563] bg-[#F8F8F6] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                        {item.grade}
                      </span>
                      {isRecommended && (
                        <span className="text-[9px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded-full border border-[#1B3D34]/20">
                          Recommended for your plan
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs font-black text-[#1B3D34] block font-mono">
                    {cementBags > 0 ? formatCurrency(itemCost) : `₹${item.ratePerBag}/bag`}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{item.ratePerBag} / 50kg bag</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. WALL / MASONRY MATERIAL ── */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center text-xs">
          <div>
            <label className="font-bold text-[#1B3D34] uppercase tracking-wider block">
              Wall / Masonry Material
            </label>
            {quantities.wallVolumeCuM > 0 && (
              <span className="text-[10px] text-[#4B5563]">
                Net Wall Area: {quantities.netWallAreaSqFt} sq.ft &bull; Masonry Vol: {quantities.wallVolumeCuM} m³
              </span>
            )}
          </div>
          <span className="font-mono font-extrabold text-[#1B3D34]">
            {quantities.masonryUnitsCount > 0 ? `${quantities.masonryUnitsCount.toLocaleString()} ${quantities.masonryUnit || 'Nos'} Required` : '0 Nos'}
          </span>
        </div>

        {/* ── BLOCK CONSUMPTION ── */}
        {quantities.netWallAreaSqFt > 0 && (
          <div className="p-3.5 bg-[#FAFBF9] rounded-xl border border-[#E5E7EB] space-y-2">
            <span className="text-[11px] font-bold text-[#1B3D34] uppercase tracking-wider block">
              Block Consumption
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-[#E5E7EB]">
                <span className="text-[10px] text-[#4B5563] block font-medium">Net Wall Area</span>
                <span className="font-mono font-bold text-[#1B3D34] text-xs sm:text-sm">
                  {quantities.netWallAreaSqFt.toLocaleString('en-IN')} sq.ft
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-[#E5E7EB]">
                <span className="text-[10px] text-[#4B5563] block font-medium">Block Wall Coverage</span>
                <span className="font-mono font-bold text-[#1B3D34] text-xs sm:text-sm">
                  {(quantities.blockWallCoverageSqFt || quantities.netWallAreaSqFt).toLocaleString('en-IN')} sq.ft
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-[#E5E7EB]">
                <span className="text-[10px] text-[#4B5563] block font-medium">Blocks Required</span>
                <span className="font-mono font-bold text-[#1B3D34] text-xs sm:text-sm">
                  {quantities.masonryUnitsCount.toLocaleString('en-IN')} Nos
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {masonryOptions.map((item) => {
            const isSelected = (!materialBrands.masonry && item.name.includes(recommendedCore.masonry.split(' ')[0])) || materialBrands.masonry === item.type;
            const isRecommended = item.name.includes(recommendedCore.masonry.split(' ')[0]) || (recommendedCore.masonry.includes('Concrete') && item.type === 'Concrete Blocks');
            const count = isSelected ? quantities.masonryUnitsCount : 0;
            const itemCost = Math.round(count * item.rate);

            return (
              <div
                key={item.type}
                onClick={() => {
                  setCoreMaterials(
                    (materialBrands.steel || recommendedCore.steel) as any,
                    (materialBrands.cement || recommendedCore.cement) as any,
                    item.type
                  );
                }}
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
                      <h4 className="text-xs font-extrabold text-[#1B3D34]">{item.name}</h4>
                      <span className="text-[10px] font-mono text-[#4B5563] bg-[#F8F8F6] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                        Size: {item.size}
                      </span>
                      {isRecommended && (
                        <span className="text-[9px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded-full border border-[#1B3D34]/20">
                          Recommended for your plan
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs font-black text-[#1B3D34] block font-mono">
                    {count > 0 ? formatCurrency(itemCost) : `₹${item.rate}/${item.unit}`}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{item.rate} / {item.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RCC CONCRETE QUANTITY RECONCILIATION ── */}
      {quantities.rccConcreteTotalCuM > 0 && (
        <div className="p-4 bg-[#FAFBF9] rounded-2xl border border-[#E5E7EB] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider">
              RCC &amp; Structure Concrete
            </label>
            <span className="text-[10px] font-bold text-[#1B3D34] bg-white px-2.5 py-0.5 rounded-full border border-[#E5E7EB]">
              IS 456 M25 Design Mix
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] text-[#4B5563] block font-medium">Footing Concrete</span>
              <span className="font-mono font-bold text-[#1B3D34] text-sm">
                {quantities.footingConcreteCuM} m³
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] text-[#4B5563] block font-medium">Column Concrete</span>
              <span className="font-mono font-bold text-[#1B3D34] text-sm">
                {quantities.columnConcreteCuM} m³
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] text-[#4B5563] block font-medium">Slab Concrete</span>
              <span className="font-mono font-bold text-[#1B3D34] text-sm">
                {quantities.slabConcreteCuM} m³
              </span>
            </div>
            <div className="p-2.5 bg-[#1B3D34]/5 rounded-xl border border-[#1B3D34]/20">
              <span className="text-[10px] font-bold text-[#1B3D34] block">Total RCC Concrete</span>
              <span className="font-mono font-extrabold text-[#1B3D34] text-sm">
                {quantities.rccConcreteTotalCuM} m³
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── CALCULATION TRANSPARENCY: RCC & STRUCTURE ── */}
      <HowWeCalculatedThis stepKey="structure" className="mt-4" />

      {/* ── CALCULATION TRANSPARENCY: WALLS & MASONRY ── */}
      <HowWeCalculatedThis stepKey="masonry" className="mt-2" />

    </div>
  );
};
