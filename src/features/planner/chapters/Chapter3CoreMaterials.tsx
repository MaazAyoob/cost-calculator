import React, { useState } from 'react';
import {
  useWizardStore,
  QualityTier,
  MaterialBrandSelection,
} from '../../../store/useWizardStore';
import {
  useArea,
  useQuantities,
  useBudgetResult,
} from '../../../store/useCalculationStore';
import { IsometricStructureVisual } from '../components/IsometricStructureVisual';
import { useRecommendations } from '../../../hooks/useRecommendations';
import { ConstructionPackageId } from '../../../calculation-engine/data/packageConfig';
import {
  Building2,
  Layers,
  Sparkles,
  Check,
  Info,
  ShieldCheck,
  Hammer,
  Boxes,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Ruler,
  AlertCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/cn';

// ── TYPES & INTERFACES ──
interface SteelBrandOption {
  id: 'Tata Tiscon' | 'JSW Neosteel' | 'Indus TMT';
  name: string;
  grade: string;
  standardRatePerKg: number;
  badge?: string;
  desc: string;
  specs: string[];
}

interface CementBrandOption {
  id: 'UltraTech' | 'ACC Cement' | 'Dalmia Bharat';
  name: string;
  grade: string;
  standardRatePerBag: number;
  badge?: string;
  desc: string;
  specs: string[];
}

interface ConcreteMixOption {
  id: 'M20' | 'M25';
  name: string;
  ratio: string;
  strength: string;
  recommendedFor: string;
  desc: string;
}

interface MasonryOption {
  id: 'AAC Blocks' | 'Clay Bricks' | 'Concrete Blocks';
  label: string;
  brand: string;
  sizeLabel: string;
  unit: string;
  standardRate: number;
  desc: string;
  advantages: string[];
}

// ── CONSTANTS & SPECIFICATIONS ──
const STEEL_OPTIONS: SteelBrandOption[] = [
  {
    id: 'Tata Tiscon',
    name: 'Tata Tiscon Fe 550D',
    grade: 'Fe 550D Super Ductile',
    standardRatePerKg: 78,
    badge: 'Hutty Recommended',
    desc: 'Primary structural steel manufactured from virgin iron ore with superior earthquake ductility and corrosion resistance.',
    specs: ['Fe 550D high ductility', 'E-bearing virgin steel', 'IS 1786 certified', 'GreenPro certified'],
  },
  {
    id: 'JSW Neosteel',
    name: 'JSW Neosteel Fe 550D',
    grade: 'Fe 550D High Strength',
    standardRatePerKg: 74,
    badge: 'Popular Alternative',
    desc: 'Thermo-mechanically treated rebar with high yield strength and uniform rib patterns for strong concrete bonding.',
    specs: ['Fe 550D grade', 'TMT rebar technology', 'High bendability', 'Seismic resistant'],
  },
  {
    id: 'Indus TMT',
    name: 'Indus TMT Fe 500D',
    grade: 'Fe 500D Economy Grade',
    standardRatePerKg: 68,
    badge: 'Value Choice',
    desc: 'Economical high-strength ribbed rebar suitable for standard low-rise independent residential framing.',
    specs: ['Fe 500D standard grade', 'Economical rate card', 'IS 1786 compliant', 'Direct mill pricing'],
  },
];

const CEMENT_OPTIONS: CementBrandOption[] = [
  {
    id: 'UltraTech',
    name: 'UltraTech Super / Weather Plus',
    grade: 'OPC 53 / Special Blend',
    standardRatePerBag: 420,
    badge: 'Hutty Recommended',
    desc: "India's #1 structural cement engineered with high early compressive strength for fast and reliable column and slab casting.",
    specs: ['53-grade high compressive strength', 'Low heat of hydration', 'Anti-efflorescence formula', 'Damp-proof seal'],
  },
  {
    id: 'ACC Cement',
    name: 'ACC Concrete Plus / Gold Shield',
    grade: 'Specialized Concrete Blend',
    standardRatePerBag: 395,
    badge: 'Water-Shield Matrix',
    desc: 'Enhanced water-repellent cement formula designed to protect foundations, retaining walls, and roof slabs from dampness.',
    specs: ['Water shield technology', 'Micro-filler pore compaction', 'Superior cohesiveness', 'Reduced shrinkage cracks'],
  },
  {
    id: 'Dalmia Bharat',
    name: 'Dalmia DSP / Heavy Structure',
    grade: 'PPC / Blended High Slump',
    standardRatePerBag: 375,
    badge: 'Value Choice',
    desc: 'Blended high-performance cement with excellent workability, reduced thermal micro-cracking, and chemical resistance.',
    specs: ['High slump retention', 'Sulfate resistant', 'Eco-friendly slag blend', 'Economical bag rate'],
  },
];

const CONCRETE_MIX_OPTIONS: ConcreteMixOption[] = [
  {
    id: 'M20',
    name: 'M20 Concrete Mix (1 : 1.5 : 3)',
    ratio: '1 part Cement : 1.5 parts M-Sand : 3 parts Aggregate',
    strength: '20 N/mm² compressive strength',
    recommendedFor: 'Standard residential roof slabs, lintels, and non-tower beams',
    desc: 'Standard design mix for residential slab casting, staircase waist slabs, and ground-level plinth beams.',
  },
  {
    id: 'M25',
    name: 'M25 Structural Mix (1 : 1 : 2)',
    ratio: '1 part Cement : 1 part M-Sand : 2 parts Aggregate',
    strength: '25 N/mm² characteristic strength',
    recommendedFor: 'Heavy foundation footings, multi-storey columns, and G+2 to G+4 frames',
    desc: 'Engineered high-durability mix recommended by structural engineers for critical columns, footings, and seismic frames.',
  },
];

const MASONRY_OPTIONS: MasonryOption[] = [
  {
    id: 'AAC Blocks',
    label: 'AAC Lightweight Blocks (6" / 150mm)',
    brand: 'Birla Aerocon / Godrej Grade 1',
    sizeLabel: '600 × 200 × 150 mm',
    unit: 'Blocks',
    standardRate: 85,
    desc: 'Autoclaved aerated concrete blocks. Reduces foundation dead load by up to 50% and delivers superior thermal cooling.',
    advantages: ['Thermal insulation (cool interiors)', '50% lighter than clay brick', 'Fast execution with polymer adhesive', 'Zero efflorescence'],
  },
  {
    id: 'Concrete Blocks',
    label: 'Solid Concrete Blocks (6" / 150mm)',
    brand: 'Hydraulic Pressed Solid Standard',
    sizeLabel: '400 × 200 × 150 mm',
    unit: 'Blocks',
    standardRate: 52,
    desc: 'High-density Bangalore market standard. Hydraulic pressed for high compressive strength and robust wall anchoring.',
    advantages: ['High structural load bearing', 'Heavy anchor bolt strength', 'Excellent acoustic barrier', 'Economical block rate'],
  },
  {
    id: 'Clay Bricks',
    label: 'Wirecut Red Clay Bricks (9" External / 4.5" Internal)',
    brand: 'Standard Kiln-Burnt Modular',
    sizeLabel: '190 × 90 × 90 mm',
    unit: 'Bricks',
    standardRate: 12,
    desc: 'Traditional kiln-burnt modular red clay bricks with proven thermal mass, natural aesthetics, and time-tested longevity.',
    advantages: ['High thermal mass & breathable', 'Traditional architectural feel', 'Proven 100-year durability', 'Non-toxic clay body'],
  },
];

export const Chapter3CoreMaterials: React.FC = () => {
  const store = useWizardStore();
  const area = useArea();
  const quantities = useQuantities();
  const budget = useBudgetResult();
  const { getCoreMaterialsRecommendation } = useRecommendations();
  const recommendedCore = getCoreMaterialsRecommendation();

  const {
    materialBrands,
    selectedPackage,
    setCoreMaterials,
    setMasonryMaterial,
    setSelectedPackage,
  } = store;

  // Selected Material States (with fallback to recommended or default)
  const currentSteel = (materialBrands.steel as SteelBrandOption['id']) || recommendedCore.steel || 'Tata Tiscon';
  const currentCement = (materialBrands.cement as CementBrandOption['id']) || recommendedCore.cement || 'UltraTech';
  const currentMasonry = (materialBrands.masonry as MasonryOption['id']) || (materialBrands.masonry?.includes('Clay') ? 'Clay Bricks' : materialBrands.masonry?.includes('Concrete') ? 'Concrete Blocks' : 'AAC Blocks');
  const [selectedConcreteMix, setSelectedConcreteMix] = useState<'M20' | 'M25'>('M25');

  // Quantities from Single Source of Truth
  const steelTonnes = quantities.steelTonnes || 0;
  const steelKg = quantities.steelKg || Math.round(steelTonnes * 1000);
  const cementBags = quantities.cementBags || 0;
  const concreteCuM = quantities.totalStructuralConcreteCuM || quantities.approxConcreteCuM || Math.round((area.totalBUASqFt || 0) * 0.052);
  const netWallAreaSqFt = quantities.netWallAreaSqFt || 0;
  const masonryUnitsCount = quantities.masonryUnitsCount || quantities.finalBlocksRequired || 0;
  const masonryUnitLabel = quantities.masonryUnit || (currentMasonry === 'Clay Bricks' ? 'Bricks' : 'Blocks');

  // Concrete breakdown directly from canonical RCC module (rcc.ts)
  const footingConcreteCuM = quantities.footingConcreteCuM || Math.round(concreteCuM * 0.22);
  const columnConcreteCuM = quantities.columnConcreteCuM || Math.round(concreteCuM * 0.18);
  const slabConcreteCuM = quantities.slabConcreteCuM || Math.round(concreteCuM * 0.52);
  const plinthConcreteCuM = quantities.plinthConcreteCuM || Math.round(concreteCuM * 0.08);
  const staircaseConcreteCuM = quantities.staircaseConcreteCuM || Math.round(concreteCuM * 0.06);
  const plinthStaircaseCuM = plinthConcreteCuM + staircaseConcreteCuM;

  // Sand & Aggregates
  const mSandCuFt = quantities.mSandCuFt || Math.round((area.totalBUASqFt || 0) * 0.60);
  const pSandCuFt = quantities.pSandCuFt || Math.round((area.totalBUASqFt || 0) * 0.60);
  const coarseAggregateCuFt = quantities.coarseAggregateCuFt || Math.round((area.totalBUASqFt || 0) * 1.35);

  // Handlers
  const handleSteelSelect = (steel: SteelBrandOption['id']) => {
    setCoreMaterials(steel, currentCement, currentMasonry);
  };

  const handleCementSelect = (cement: CementBrandOption['id']) => {
    setCoreMaterials(currentSteel, cement, currentMasonry);
  };

  const handleMasonrySelect = (masonry: MasonryOption['id']) => {
    setCoreMaterials(currentSteel, currentCement, masonry);
    setMasonryMaterial(masonry);
  };

  const handleApplyRecommended = () => {
    const recSteel = recommendedCore.steel || 'Tata Tiscon';
    const recCement = recommendedCore.cement || 'UltraTech';
    const recMasonry = (recommendedCore.masonry?.includes('Clay') ? 'Clay Bricks' : recommendedCore.masonry?.includes('Concrete') ? 'Concrete Blocks' : 'AAC Blocks') as MasonryOption['id'];
    setCoreMaterials(recSteel, recCement, recMasonry);
    setMasonryMaterial(recMasonry);
  };

  return (
    <div className="space-y-8 text-left text-[#202522]">
      {/* ── CHAPTER HEADER ── */}
      <div className="space-y-2 border-b border-[#E5E7EB] pb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-[11px] font-bold text-[#183B32]">
          <Building2 className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>STEP 3 OF 7 &bull; CORE MATERIALS</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
            Choose your core materials.
          </h2>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#18211E] bg-[#F8F8F6] px-3 py-1.5 rounded-xl border border-[#CBD5CB] shadow-2xs">
              <span className="text-[#687770]">Steel:</span>
              <strong className="text-[#183B32]">{steelTonnes} Tonnes</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#18211E] bg-[#F8F8F6] px-3 py-1.5 rounded-xl border border-[#CBD5CB] shadow-2xs">
              <span className="text-[#687770]">Cement:</span>
              <strong className="text-[#183B32]">{cementBags.toLocaleString()} Bags</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#18211E] bg-[#F8F8F6] px-3 py-1.5 rounded-xl border border-[#CBD5CB] shadow-2xs">
              <span className="text-[#687770]">Concrete:</span>
              <strong className="text-[#C66B4E]">{concreteCuM} m³</strong>
            </span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#66716B] max-w-3xl leading-relaxed">
          We calculate the exact quantities of steel, cement, and wall blocks needed for your home. Choose your preferred brands below.
        </p>
      </div>

      {/* ── AUTOMATED RECOMMENDATION & PACKAGE BANNER ── */}
      <div className="p-4 rounded-2xl bg-[#E8EFE9] border border-[#B7CDBB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#183B32] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#C66B4E]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#183B32]">
                Hutty Recommended Structural Package:
              </span>
              <span className="text-[10px] font-mono font-bold text-[#C66B4E] uppercase bg-white px-2 py-0.5 rounded-md border border-[#CBD5CB]">
                {recommendedCore.label}
              </span>
            </div>
            <p className="text-[11px] text-[#505D56] mt-0.5 leading-relaxed">
              {recommendedCore.reason}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApplyRecommended}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#CBD5CB] text-[#183B32] text-xs font-bold hover:bg-[#DDF0E5] transition-all cursor-pointer shrink-0 shadow-2xs self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>Apply Recommended Defaults</span>
        </button>
      </div>

      {/* ── 1. STRUCTURAL STEEL REBAR ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E] flex items-center gap-1.5 font-heading">
            <Hammer className="w-4 h-4 text-[#183B32]" />
            1. Steel for the Structure
          </label>
          <span className="text-[11px] text-[#66716B]">Columns, Beams &amp; Roof Slabs</span>
        </div>

        {/* What Am I Consuming? Micro-Card */}
        <div className="p-4 rounded-2xl bg-[#F8F8F6] border border-[#CBD5CB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-[#183B32] font-mono text-sm">
                Estimated Steel Needed: ~{steelTonnes} Tonnes ({steelKg.toLocaleString()} kg)
              </span>
              <span className="text-[10px] font-bold text-[#183B32] bg-[#E8EFE9] border border-[#B7CDBB] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Planning Estimate
              </span>
            </div>
            <p className="text-[11px] text-[#66716B] leading-relaxed">
              High-strength steel bars are used inside foundation footings, columns, beams, and roof slabs to make your home safe and earthquake-resistant.
            </p>
          </div>
          <div className="sm:text-right shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#CBD5CB]/50">
            <span className="text-[10px] text-[#687770] uppercase font-bold block">Structural Steel Rate</span>
            <span className="font-mono font-bold text-[#183B32] text-xs">~{quantities.steelFactorKgPerSqFt || 3.4} kg / sq.ft</span>
          </div>
        </div>

        {/* Steel Brand Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STEEL_OPTIONS.map((item) => {
            const isSelected = currentSteel === item.id;
            const isRec = item.id === recommendedCore.steel;
            const estimatedCost = Math.round(steelKg * item.standardRatePerKg);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSteelSelect(item.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                  isSelected
                    ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                    : 'border-[#CBD5CB] bg-white hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#C66B4E] uppercase tracking-wider">
                      {item.grade}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-[#18211E] font-heading">{item.name}</h4>
                  {isRec && (
                    <span className="inline-block mt-1 text-[9px] font-bold text-[#183B32] bg-white px-2 py-0.5 rounded-md border border-[#CBD5CB]">
                      Recommended for your plan
                    </span>
                  )}
                  <p className="text-[11px] text-[#505D56] leading-relaxed mt-1.5">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#687770] block">Indicative Rate:</span>
                    <strong className="text-[#18211E] font-mono">₹{item.standardRatePerKg} / kg</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#687770] block">Estimated Total:</span>
                    <strong className="text-[#183B32] font-mono">{formatCurrency(estimatedCost)}</strong>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. PORTLAND CEMENT ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E] flex items-center gap-1.5 font-heading">
            <Boxes className="w-4 h-4 text-[#183B32]" />
            2. Cement for Foundations &amp; Plaster
          </label>
          <span className="text-[11px] text-[#66716B]">50kg Bags</span>
        </div>

        {/* What Am I Consuming? Micro-Card */}
        <div className="p-4 rounded-2xl bg-[#F8F8F6] border border-[#CBD5CB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-[#183B32] font-mono text-sm">
                Estimated Cement Needed: ~{cementBags.toLocaleString()} Bags (50 kg each)
              </span>
              <span className="text-[10px] font-bold text-[#183B32] bg-[#E8EFE9] border border-[#B7CDBB] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Planning Estimate
              </span>
            </div>
            <p className="text-[11px] text-[#66716B] leading-relaxed">
              Cement is used to mix concrete for your roof slabs and mortar for laying wall blocks and smooth wall plastering.
            </p>
          </div>
          <div className="sm:text-right shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#CBD5CB]/50">
            <span className="text-[10px] text-[#687770] uppercase font-bold block">Cement Ratio</span>
            <span className="font-mono font-bold text-[#183B32] text-xs">~0.40 Bags / sq.ft</span>
          </div>
        </div>

        {/* Cement Brand Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CEMENT_OPTIONS.map((item) => {
            const isSelected = currentCement === item.id;
            const isRec = item.id === recommendedCore.cement;
            const estimatedCost = Math.round(cementBags * item.standardRatePerBag);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleCementSelect(item.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                  isSelected
                    ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                    : 'border-[#CBD5CB] bg-white hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#C66B4E] uppercase tracking-wider">
                      {item.grade}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-[#18211E] font-heading">{item.name}</h4>
                  {isRec && (
                    <span className="inline-block mt-1 text-[9px] font-bold text-[#183B32] bg-white px-2 py-0.5 rounded-md border border-[#CBD5CB]">
                      Recommended for your plan
                    </span>
                  )}
                  <p className="text-[11px] text-[#505D56] leading-relaxed mt-1.5">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#687770] block">Indicative Rate:</span>
                    <strong className="text-[#18211E] font-mono">₹{item.standardRatePerBag} / bag</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#687770] block">Estimated Total:</span>
                    <strong className="text-[#183B32] font-mono">{formatCurrency(estimatedCost)}</strong>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ISOMETRIC STRUCTURAL FRAME VISUAL ── */}
      <IsometricStructureVisual floors={store.floors || 2} totalBUASqFt={area.totalBUASqFt || 2160} />

      {/* ── 3. CONCRETE FOR SLABS, COLUMNS & FOOTINGS ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#183B32]" />
            3. Concrete for Slabs, Columns &amp; Foundation
          </label>
          <span className="text-[11px] text-[#66716B]">Structural Strength Standard</span>
        </div>

        {/* Concrete Volume Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB] pb-3">
            <div>
              <span className="text-xs font-bold text-[#18211E] block">
                Estimated Concrete Needed
              </span>
              <span className="text-[11px] text-[#687770]">
                Covers your foundation footings, support columns, roof slabs, and stairs
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xl font-black font-mono text-[#183B32]">
                ~{concreteCuM} m³
              </span>
              <span className="text-[10px] text-[#687770] block">
                (~{Math.round(concreteCuM * 35.315).toLocaleString()} Cubic Feet)
              </span>
            </div>
          </div>

          {/* Component-wise Sub-Allocation Stack */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-[11px] font-bold text-[#18211E] uppercase tracking-wider block">
                Where does this concrete go?
              </span>
              <span className="text-[10px] text-[#183B32] font-semibold bg-[#E8EFE9] px-2 py-0.5 rounded border border-[#B7CDBB]">
                Calculated from your floor count &amp; built area
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70">
                <span className="text-[10px] text-[#687770] uppercase font-bold block">1. Slabs &amp; Roof (~52%)</span>
                <span className="text-sm font-mono font-bold text-[#183B32] mt-0.5 block">~{slabConcreteCuM} m³</span>
                <span className="text-[10px] text-[#505D56] mt-0.5 block leading-tight">Floors and ceiling slabs</span>
              </div>
              <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70">
                <span className="text-[10px] text-[#687770] uppercase font-bold block">2. Foundation (~22%)</span>
                <span className="text-sm font-mono font-bold text-[#183B32] mt-0.5 block">~{footingConcreteCuM} m³</span>
                <span className="text-[10px] text-[#505D56] mt-0.5 block leading-tight">Underground support footings</span>
              </div>
              <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70">
                <span className="text-[10px] text-[#687770] uppercase font-bold block">3. Pillars &amp; Columns (~18%)</span>
                <span className="text-sm font-mono font-bold text-[#183B32] mt-0.5 block">~{columnConcreteCuM} m³</span>
                <span className="text-[10px] text-[#505D56] mt-0.5 block leading-tight">Vertical strength pillars</span>
              </div>
              <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70">
                <span className="text-[10px] text-[#687770] uppercase font-bold block">4. Plinth &amp; Stairs (~14%)</span>
                <span className="text-sm font-mono font-bold text-[#183B32] mt-0.5 block">~{plinthStaircaseCuM} m³</span>
                <span className="text-[10px] text-[#505D56] mt-0.5 block leading-tight">Base ground beam &amp; steps</span>
              </div>
            </div>
          </div>

          {/* Concrete Mix Design Cards */}
          <div className="pt-2 border-t border-[#CBD5CB]/60 space-y-2">
            <span className="text-[11px] font-bold text-[#18211E] uppercase tracking-wider block">
              Choose your concrete strength grade
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONCRETE_MIX_OPTIONS.map((mix) => {
                const isSelected = selectedConcreteMix === mix.id;
                return (
                  <button
                    key={mix.id}
                    type="button"
                    onClick={() => setSelectedConcreteMix(mix.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs'
                        : 'border-[#CBD5CB] bg-white hover:border-[#183B32]/30'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#18211E] block">{mix.name}</span>
                      <span className="text-[10px] font-mono text-[#C66B4E] font-bold block">{mix.strength}</span>
                      <p className="text-[11px] text-[#505D56] leading-relaxed mt-1">{mix.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Structural Engineer Sign-off Notice */}
          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#347A62] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#505D56] leading-relaxed">
              <strong>Helpful tip:</strong> Concrete quantities follow IS 456 residential standards. Your structural engineer will confirm exact pillar sizes and soil foundations before casting begins.
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. WALLS & BRICKS ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E] flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-[#183B32]" />
            4. Walls &amp; Partition Bricks
          </label>
          <span className="text-[11px] text-[#66716B]">Outside &amp; Inside Room Walls</span>
        </div>

        {/* What Am I Consuming? Micro-Card */}
        <div className="p-4 rounded-2xl bg-[#F8F8F6] border border-[#CBD5CB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-[#183B32] font-mono text-sm">
                Estimated Wall Area: ~{netWallAreaSqFt.toLocaleString()} sq.ft (~{masonryUnitsCount.toLocaleString()} {masonryUnitLabel})
              </span>
              <span className="text-[10px] font-bold text-[#183B32] bg-[#E8EFE9] border border-[#B7CDBB] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Calculated from your room layout
              </span>
            </div>
            <p className="text-[11px] text-[#505D56] leading-relaxed">
              Calculated from your rooms with door and window openings deducted, plus a 5% allowance for neat corner cuts.
            </p>
          </div>
          <div className="sm:text-right shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#CBD5CB]/50">
            <span className="text-[10px] text-[#687770] uppercase font-bold block">Your Selection</span>
            <span className="font-mono font-bold text-[#183B32] text-xs">{currentMasonry}</span>
            <span className="text-[9px] text-[#66716B] block mt-0.5">Unit: {masonryUnitLabel}</span>
          </div>
        </div>

        {/* Walling Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MASONRY_OPTIONS.map((item) => {
            const isSelected = currentMasonry === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMasonrySelect(item.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                  isSelected
                    ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                    : 'border-[#CBD5CB] bg-white hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#C66B4E] uppercase tracking-wider">
                      {item.sizeLabel}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-[#18211E] font-heading">{item.label}</h4>
                  <span className="text-[10px] text-[#687770] block mt-0.5">{item.brand}</span>
                  <p className="text-[11px] text-[#505D56] leading-relaxed mt-2">
                    {item.desc}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#CBD5CB]/50 space-y-1">
                    {item.advantages.map((adv, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[10.5px] text-[#505D56]">
                        <Check className="w-3 h-3 text-[#183B32] shrink-0" />
                        <span>{adv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#687770] block">Standard Rate:</span>
                    <strong className="text-[#18211E] font-mono">₹{item.standardRate} / {item.unit}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#687770] block">Status:</span>
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-[#183B32]' : 'text-[#687770]'}`}>
                      {isSelected ? 'Selected' : 'Choose this'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 5. AGGREGATES & SAND OVERVIEW ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs border-b border-[#CBD5CB] pb-2.5">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#183B32]" />
            <span className="font-bold text-[#18211E]">
              Sand &amp; Stone Aggregates
            </span>
            <span className="text-[10px] text-[#183B32] font-semibold bg-[#E8EFE9] px-2 py-0.5 rounded border border-[#B7CDBB]">
              Standard estimates
            </span>
          </div>
          <span className="text-[11px] text-[#687770]">
            For concrete casting, brick mortar &amp; wall plaster (in Cubic Feet / CFT)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 space-y-1">
            <span className="text-[10px] text-[#687770] uppercase font-bold block">M-Sand (Manufactured Sand)</span>
            <span className="text-base font-mono font-bold text-[#183B32] block">~{mSandCuFt.toLocaleString()} CFT</span>
            <span className="text-[10px] text-[#505D56] block leading-tight">
              Used in concrete mixing and mortar between wall blocks. Eco-friendly and uniform.
            </span>
          </div>
          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 space-y-1">
            <span className="text-[10px] text-[#687770] uppercase font-bold block">P-Sand (Plaster Sand)</span>
            <span className="text-base font-mono font-bold text-[#183B32] block">~{pSandCuFt.toLocaleString()} CFT</span>
            <span className="text-[10px] text-[#505D56] block leading-tight">
              Ultra-fine sieved sand for smooth internal walls and durable exterior plaster.
            </span>
          </div>
          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 space-y-1">
            <span className="text-[10px] text-[#687770] uppercase font-bold block">Stone Gravel (20mm &amp; 12mm)</span>
            <span className="text-base font-mono font-bold text-[#183B32] block">~{coarseAggregateCuFt.toLocaleString()} CFT</span>
            <span className="text-[10px] text-[#505D56] block leading-tight">
              Hard blue-metal granite stones mixed into concrete for pillars, beams, and roof slabs.
            </span>
          </div>
        </div>

        <p className="text-[10.5px] text-[#66716B] italic">
          * Sand and gravel quantities are calculated based on your total built area and standard residential mix ratios.
        </p>
      </div>

      {/* ── 6. BRAND INVARIANCE & TRANSPARENCY NOTICE ── */}
      <div className="p-4 rounded-xl bg-[#E8EFE9] border border-[#B7CDBB] flex items-start gap-3 text-left">
        <ShieldCheck className="w-5 h-5 text-[#183B32] shrink-0 mt-0.5" />
        <div className="text-xs text-[#183B32] leading-relaxed space-y-1">
          <strong className="block font-bold">
            Transparent Quantity Guarantee:
          </strong>
          <p className="text-[11px] text-[#505D56] leading-relaxed">
            Changing material brands (e.g., Tata Tiscon to JSW, or UltraTech to ACC) updates rates and prices instantly.
            The actual quantities of steel, cement, concrete, and bricks needed for your home remain <strong>100% accurate</strong> based strictly on your room dimensions.
          </p>
        </div>
      </div>
    </div>
  );
};

