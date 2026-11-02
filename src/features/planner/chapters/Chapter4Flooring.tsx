import React, { useState, useMemo, useEffect } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import {
  ZoneFlooringSelection,
  WallCladdingSelection,
  BOQItem,
} from '../../../calculation-engine/types';
import {
  useBuildingModel,
  useQuantities,
  useBOQ,
  useBudgetResult,
  useArea,
} from '../../../store/useCalculationStore';
import {
  Layers,
  Sparkles,
  Check,
  Info,
  ShieldCheck,
  Bath,
  Bed,
  Home,
  Utensils,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Ruler,
  Boxes,
  Grid3X3,
  Sliders,
  AlertCircle,
  Maximize2,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/cn';

// ── TYPES & INTERFACES ──
export interface FlooringOption {
  id: string;
  name: string;
  category: 'Vitrified' | 'Granite' | 'Marble' | 'Ceramic' | 'Laminate';
  sizeLabel: string;
  finish: string;
  brand: string;
  standardRate: number; // ₹/sq.ft material rate
  desc: string;
  swatchType: 'marble' | 'granite' | 'gvt' | 'vitrified' | 'wood' | 'ceramic' | 'terracotta';
  accentColor: string;
  badge?: string;
}

export interface BathroomTileOption {
  id: string;
  name: string;
  type: 'floor' | 'wall';
  sizeLabel: string;
  finish: string;
  brand: string;
  standardRate: number; // ₹/sq.ft
  desc: string;
  swatchType: 'ceramic' | 'vitrified' | 'marble';
  badge?: string;
}

// ── CONSTANTS & MATERIAL SPECIFICATIONS (From rateMasterDefaults.ts & brandDatabase.ts) ──
export const PRIMARY_FLOORING_OPTIONS: FlooringOption[] = [
  {
    id: 'GVT Tiles (1200x600)',
    name: 'Glazed Vitrified (GVT 4×2 ft)',
    category: 'Vitrified',
    sizeLabel: '1200 × 600 mm',
    finish: 'Satin Matte / High Gloss',
    brand: 'Kajaria / Somany GVT',
    standardRate: 140,
    desc: 'Large format seamless luxury porcelain tile with rectified edges for ultra-thin 2mm grout joints.',
    swatchType: 'gvt',
    accentColor: '#D1D5DB',
    badge: 'Hutty Recommended',
  },
  {
    id: 'Vitrified Tiles (600x600)',
    name: 'Double-Charged Vitrified (2×2 ft)',
    category: 'Vitrified',
    sizeLabel: '800 × 800 mm / 600 × 600 mm',
    finish: 'Nano Polished Ivory',
    brand: 'Kajaria / Nitco Baseline',
    standardRate: 110,
    desc: 'Heavy-traffic double charged tile with nano-seal polish. Highly stain-resistant and easy to maintain.',
    swatchType: 'vitrified',
    accentColor: '#E5E7EB',
    badge: 'Standard Baseline',
  },
  {
    id: 'Granite Flooring',
    name: 'Polished Natural Granite Slabs',
    category: 'Granite',
    sizeLabel: '20mm Custom Cut Slabs',
    finish: 'Mirror Polished Natural Stone',
    brand: 'Sadahalli / Jet Black Hub',
    standardRate: 220,
    desc: 'Pure igneous South Indian granite with diamond polishing. Extremely durable, scratch-proof, and cool underfoot.',
    swatchType: 'granite',
    accentColor: '#4B5563',
    badge: 'Architectural Stone',
  },
  {
    id: 'Italian Marble',
    name: 'Imported Italian Marble',
    category: 'Marble',
    sizeLabel: '18-20mm Book-Matched Slabs',
    finish: 'Dyna / Botticino Diamond Polished',
    brand: 'Jigani Imported Hub',
    standardRate: 420,
    desc: 'World-class imported Italian composite marble slab treated with fiber backing, tin oxide polish, and crystal seal.',
    swatchType: 'marble',
    accentColor: '#F3F4F6',
    badge: 'Luxury Spec',
  },
  {
    id: 'Wooden Laminate',
    name: 'Engineered Wooden Flooring (AC4)',
    category: 'Laminate',
    sizeLabel: '1200 × 190 × 8 mm Planks',
    finish: 'Warm Natural Honey Oak Grain',
    brand: 'Pergo / Quick-Step German',
    standardRate: 180,
    desc: 'Commercial AC4 scratch-resistant click-lock laminate planks laid over high-density acoustic foam underlay.',
    swatchType: 'wood',
    accentColor: '#D97706',
    badge: 'Cosy Bedroom Choice',
  },
];

export const BATHROOM_FLOOR_OPTIONS: BathroomTileOption[] = [
  {
    id: 'Anti-Skid Ceramic',
    name: 'Anti-Skid Matte Ceramic (R10/R11)',
    type: 'floor',
    sizeLabel: '300 × 300 mm',
    finish: 'Non-Slip Textured Grip',
    brand: 'Kajaria Anti-Skid Series',
    standardRate: 75,
    desc: 'Special micro-textured ceramic body designed for safe grip when wet, preventing shower slips.',
    swatchType: 'ceramic',
    badge: 'Safety Standard',
  },
  {
    id: 'Matte Vitrified Bath',
    name: 'Satin Matte Anti-Skid Vitrified',
    type: 'floor',
    sizeLabel: '600 × 600 mm',
    finish: 'Satin Silk Non-Porous',
    brand: 'Simpolo / Somany Satin',
    standardRate: 115,
    desc: 'High-density vitrified porcelain with chemical-resistant matte glaze and low 0.05% water absorption.',
    swatchType: 'vitrified',
    badge: 'Premium Moisture Seal',
  },
];

export const BATHROOM_WALL_DADO_OPTIONS: BathroomTileOption[] = [
  {
    id: 'Glazed Ceramic Wall',
    name: 'Digital Glazed Satin Ceramic Wall Tiles',
    type: 'wall',
    sizeLabel: '600 × 300 mm (2×1 ft)',
    finish: 'Satin Glazed Anti-Efflorescence',
    brand: 'Kajaria Glamour Wall',
    standardRate: 85,
    desc: 'Contemporary horizontal wall tile designed for wet showers with stain-free anti-fungal glaze.',
    swatchType: 'ceramic',
    badge: 'Standard Wall Dado',
  },
  {
    id: 'Large Format Vitrified Wall',
    name: 'Continuous Vitrified Wall Panels',
    type: 'wall',
    sizeLabel: '1200 × 600 mm (4×2 ft)',
    finish: 'Seamless Book-Matched Finish',
    brand: 'Simpolo Marble Touch',
    standardRate: 135,
    desc: 'Floor-to-ceiling large porcelain panels with 75% fewer grout lines for modern hotel-style master bathrooms.',
    swatchType: 'marble',
    badge: 'Luxury Seamless Look',
  },
];

export const OUTDOOR_FLOORING_OPTIONS: FlooringOption[] = [
  {
    id: 'Outdoor Ceramic Anti-Skid',
    name: 'Exterior Weatherproof Anti-Skid Tiles',
    category: 'Ceramic',
    sizeLabel: '300 × 300 mm',
    finish: 'UV-Resistant Textured Ceramic',
    brand: 'Orient Bell / Somany Outdoor',
    standardRate: 70,
    desc: 'Weather-resistant slip-resistant tile for open balconies and verandahs exposed to sunlight and rain.',
    swatchType: 'terracotta',
    accentColor: '#C2410C',
    badge: 'Outdoor Standard',
  },
  {
    id: 'Wooden Finish Outdoor',
    name: 'Weather-Shield Wood Finish Tiles',
    category: 'Vitrified',
    sizeLabel: '600 × 150 mm Planks',
    finish: 'Rustic Timber Grain Anti-Skid',
    brand: 'Kajaria Outdoor Plank',
    standardRate: 125,
    desc: 'Warm wooden aesthetic without the termite or water rotting risk of natural timber.',
    swatchType: 'wood',
    accentColor: '#B45309',
    badge: 'Balcony Feature',
  },
  {
    id: 'Heavy-Duty Parking Tiles',
    name: 'Heavy-Duty Axle-Rated Paver Tiles',
    category: 'Vitrified',
    sizeLabel: '300 × 300 × 12 mm Heavy-Duty',
    finish: 'High Compressive Strength Grip',
    brand: 'Endura / Restile Heavy Duty',
    standardRate: 65,
    desc: 'Thick 12mm vitrified body engineered to withstand heavy car wheel loads and utility abrasion.',
    swatchType: 'granite',
    accentColor: '#374151',
    badge: 'Parking / Utility',
  },
];

interface Chapter4FlooringProps {
  embedded?: boolean;
}

export const Chapter4Flooring: React.FC<Chapter4FlooringProps> = ({ embedded = false }) => {
  const store = useWizardStore();
  const buildingModel = useBuildingModel();
  const quantities = useQuantities();
  const boq = useBOQ();
  const budget = useBudgetResult();
  const area = useArea();

  const {
    flooringZones,
    wallCladding,
    spaceFlooringOverrides,
    spaceDadoOverrides,
    setFlooringZone,
    setWallCladding,
    setSpaceFlooring,
    setSpaceDado,
    applyFlooringToSimilarSpaces,
    applyDadoToAllBathrooms,
    clearSpaceFlooringOverride,
    pruneOrphanedSpaceOverrides,
  } = store;

  // Active category tab for intuitive exploration
  const [activeCategory, setActiveCategory] = useState<'all' | 'living' | 'bedrooms' | 'kitchen' | 'bathrooms' | 'balcony' | 'staircase'>('all');
  const [expandedSpaceId, setExpandedSpaceId] = useState<string | null>(null);
  const [showBOQBreakdown, setShowBOQBreakdown] = useState<boolean>(false);

  // Prune any legacy orphaned space IDs when room configuration in Chapter 2 changes
  useEffect(() => {
    if (buildingModel?.allSpaces?.length) {
      const activeIds = buildingModel.allSpaces.map((s) => s.id);
      pruneOrphanedSpaceOverrides(activeIds);
    }
  }, [buildingModel?.allSpaces?.length]);

  // Group Spaces from Canonical Building Model
  const allSpaces = useMemo(() => buildingModel?.allSpaces || [], [buildingModel?.allSpaces]);

  const spacesByCategory = useMemo(() => {
    const livingSpaces = allSpaces.filter((s) => s.type === 'living' || s.type === 'dining');
    const bedroomSpaces = allSpaces.filter((s) => s.type === 'bedrooms' || (s.type as string) === 'bedroom');
    const kitchenSpaces = allSpaces.filter((s) => s.type === 'kitchen' || s.type === 'utility');
    const bathroomSpaces = allSpaces.filter(
      (s) => s.type === 'bathrooms' || (s.type as string) === 'bathroom' || s.type === 'commonToilets' || (s.type as string) === 'commonToilet'
    );
    const balconySpaces = allSpaces.filter((s) => s.type === 'balcony');
    const otherSpaces = allSpaces.filter((s) => s.type === 'pooja' || s.type === 'office' || s.type === 'storeRoom');

    return {
      livingSpaces,
      bedroomSpaces,
      kitchenSpaces,
      bathroomSpaces,
      balconySpaces,
      otherSpaces,
    };
  }, [allSpaces]);

  // Aggregate Metrics for Header Micro-Cards
  const totalFloorArea = useMemo(() => allSpaces.reduce((sum, s) => sum + s.flooringAreaSqFt, 0), [allSpaces]);
  const totalTileQuantity = quantities.floorTilesSqFt || Math.round(totalFloorArea * 1.07);
  const totalDadoArea = (quantities.bathroomDadoTileSqFt || 0) + (quantities.kitchenDadoTileSqFt || 0);
  const totalSkirtingRft = useMemo(() => {
    return allSpaces.reduce((sum, s) => {
      // Skirting runs along perimeter minus door opening widths
      const effectiveRft = Math.max(0, s.perimeter - (s.doorCount * 3));
      return sum + effectiveRft;
    }, 0);
  }, [allSpaces]);

  // Reconciled Flooring BOQ Items
  const flooringBOQItems = useMemo(() => {
    return (boq || []).filter((item: BOQItem) => item.category === 'Flooring' || item.code?.startsWith('FL-'));
  }, [boq]);

  const totalFlooringBOQCost = useMemo(() => {
    return flooringBOQItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [flooringBOQItems]);

  // Helper to determine the active material for a space (Override takes precedence over Zone baseline)
  const getSpaceActiveMaterial = (spaceId: string, spaceType: string): string => {
    if (spaceFlooringOverrides[spaceId]) {
      return spaceFlooringOverrides[spaceId];
    }
    const norm = spaceType.toLowerCase();
    if (norm.includes('living') || norm.includes('dining')) {
      return flooringZones?.living || 'GVT Tiles (1200x600)';
    }
    if (norm.includes('bed')) {
      return flooringZones?.bedrooms || 'Vitrified Tiles (600x600)';
    }
    if (norm.includes('kitchen')) {
      return flooringZones?.kitchenDining || 'Vitrified Tiles';
    }
    if (norm.includes('bath') || norm.includes('toilet')) {
      return flooringZones?.bathrooms || 'Anti-Skid Ceramic';
    }
    if (norm.includes('balcony')) {
      return flooringZones?.balconies || 'Outdoor Ceramic Anti-Skid';
    }
    if (norm.includes('utility')) {
      return flooringZones?.parkingUtility || 'Heavy-Duty Parking Tiles';
    }
    return flooringZones?.living || 'Vitrified Tiles (600x600)';
  };

  // Helper to render procedural authentic texture swatches
  const renderTextureSwatch = (swatchType: FlooringOption['swatchType'], isSelected: boolean) => {
    switch (swatchType) {
      case 'gvt':
        return (
          <div className="w-10 h-10 rounded-xl overflow-hidden relative shadow-2xs border border-gray-300 bg-linear-to-br from-[#FAFAFA] via-[#F0F2F5] to-[#E5E7EB]">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#9CA3AF_1px,transparent_1px)] [background-size:6px_6px]" />
            <div className="absolute top-1 left-2 right-1 h-0.5 bg-white/70 rotate-12 blur-[0.5px]" />
          </div>
        );
      case 'granite':
        return (
          <div className="w-10 h-10 rounded-xl overflow-hidden relative shadow-2xs border border-gray-600 bg-linear-to-br from-[#2D3748] to-[#1A202C]">
            <div className="absolute inset-0 opacity-60 bg-[radial-gradient(#CBD5E0_1px,transparent_1px)] [background-size:3px_3px]" />
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:5px_5px]" />
          </div>
        );
      case 'marble':
        return (
          <div className="w-10 h-10 rounded-xl overflow-hidden relative shadow-2xs border border-amber-200/60 bg-linear-to-br from-[#FCFBF7] via-[#F7F5EE] to-[#EFECE2]">
            <div className="absolute top-2 left-1 w-8 h-0.5 bg-amber-400/30 rotate-25 blur-[0.6px]" />
            <div className="absolute bottom-2 right-1 w-6 h-0.5 bg-amber-600/20 -rotate-15 blur-[0.6px]" />
          </div>
        );
      case 'wood':
        return (
          <div className="w-10 h-10 rounded-xl overflow-hidden relative shadow-2xs border border-amber-800/40 bg-linear-to-b from-[#B45309] via-[#92400E] to-[#78350F]">
            <div className="absolute inset-0 flex flex-col justify-between py-1 opacity-25">
              <div className="h-0.5 bg-amber-200" />
              <div className="h-0.5 bg-amber-300" />
              <div className="h-0.5 bg-amber-100" />
            </div>
          </div>
        );
      case 'ceramic':
        return (
          <div className="w-10 h-10 rounded-xl overflow-hidden relative shadow-2xs border border-stone-300 bg-[#E7E5E4]">
            <div className="absolute inset-0 opacity-50 bg-[radial-gradient(#78716C_1.5px,transparent_1.5px)] [background-size:4px_4px]" />
          </div>
        );
      case 'terracotta':
        return (
          <div className="w-10 h-10 rounded-xl overflow-hidden relative shadow-2xs border border-amber-800 bg-[#9A3412]">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#FED7AA_1px,transparent_1px)] [background-size:4px_4px]" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl overflow-hidden relative shadow-2xs border border-gray-300 bg-[#F3F4F6]">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:4px_4px]" />
          </div>
        );
    }
  };

  return (
    <div className={`space-y-8 text-left text-[#202522] ${embedded ? 'pt-2' : ''}`}>
      {/* ── CHAPTER HEADER ── */}
      <div className="space-y-2 border-b border-[#CBD5CB] pb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-[11px] font-bold text-[#183B32]">
          <Layers className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>STEP 4 OF 7 &bull; FLOORING &amp; TILES</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
            Pick your flooring room by room.
          </h2>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#18211E] bg-[#F8F8F6] px-3 py-1.5 rounded-xl border border-[#CBD5CB] shadow-2xs">
              <span className="text-[#687770]">Floor Tiles:</span>
              <strong className="text-[#183B32]">{totalTileQuantity.toLocaleString()} sq.ft</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#18211E] bg-[#F8F8F6] px-3 py-1.5 rounded-xl border border-[#CBD5CB] shadow-2xs">
              <span className="text-[#687770]">Wall Tiles:</span>
              <strong className="text-[#C66B4E]">{totalDadoArea.toLocaleString()} sq.ft</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#18211E] bg-[#F8F8F6] px-3 py-1.5 rounded-xl border border-[#CBD5CB] shadow-2xs">
              <span className="text-[#687770]">Cutting Buffer:</span>
              <strong className="text-[#183B32]">7% Included</strong>
            </span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#505D56] max-w-3xl leading-relaxed">
          Choose your favorite flooring for each room. Pick luxury vitrified tiles for the living room,
          warm wooden-finish flooring for bedrooms, and slip-safe tiles with waterproof wall panels for bathrooms.
        </p>
      </div>

      {/* ── QUANTITY-FIRST MICRO-CARD OVERVIEW ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F8F6] border border-[#CBD5CB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-2xs">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-[#183B32] font-mono text-sm">
              Total Floor Space: ~{totalFloorArea.toLocaleString()} sq.ft
            </span>
            <span className="text-[10px] font-bold text-[#183B32] bg-[#E8EFE9] border border-[#B7CDBB] px-2 py-0.5 rounded-full uppercase tracking-wider">
              From Your Room Layout
            </span>
          </div>
          <p className="text-[11px] text-[#505D56] leading-relaxed">
            Covers all bedrooms, living, dining, and bathrooms, plus a 10% allowance for passages and a 7% safe cutting buffer for corner tiles.
          </p>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-[#CBD5CB]/60 pt-2 sm:pt-0 shrink-0 gap-1">
          <span className="text-[10px] text-[#687770] uppercase font-bold block">Base Skirting Along Walls</span>
          <span className="font-mono font-bold text-[#183B32] text-xs">~{totalSkirtingRft} Running Feet</span>
          <span className="text-[9px] text-[#66716B] block">4-inch matching border tile</span>
        </div>
      </div>

      {/* ── FILTER CHIPS BY CATEGORY ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'all', label: `All Spaces (${allSpaces.length})` },
          { id: 'living', label: `Living & Dining (${spacesByCategory.livingSpaces.length})` },
          { id: 'bedrooms', label: `Bedrooms (${spacesByCategory.bedroomSpaces.length})` },
          { id: 'kitchen', label: `Kitchen & Utility (${spacesByCategory.kitchenSpaces.length})` },
          { id: 'bathrooms', label: `Bathrooms (${spacesByCategory.bathroomSpaces.length})` },
          { id: 'balcony', label: `Balconies (${spacesByCategory.balconySpaces.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
              activeCategory === tab.id
                ? 'bg-[#183B32] text-white shadow-2xs'
                : 'bg-white text-[#505D56] border border-[#CBD5CB] hover:bg-[#F8F9F7] hover:border-[#183B32]/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: LIVING & DINING SPACES                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {(activeCategory === 'all' || activeCategory === 'living') && spacesByCategory.livingSpaces.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#CBD5CB] pb-2">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-[#183B32]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#18211E]">
                Living &amp; Dining Areas
              </h3>
            </div>
            <span className="text-xs text-[#687770]">
              Total Area: ~{spacesByCategory.livingSpaces.reduce((s, r) => s + r.flooringAreaSqFt, 0)} sq.ft
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {spacesByCategory.livingSpaces.map((space) => {
              const currentMaterial = getSpaceActiveMaterial(space.id, space.type);
              const isOverridden = Boolean(spaceFlooringOverrides[space.id]);
              const tileWithWastage = Math.round(space.flooringAreaSqFt * 1.07);
              const skirtingRft = Math.max(0, space.perimeter - (space.doorCount * 3));

              return (
                <div
                  key={space.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-2xs space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB]/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-[#18211E] font-heading">{space.name}</h4>
                        <span className="text-[10px] font-mono text-[#687770] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#CBD5CB]">
                          {space.floorName}
                        </span>
                        {isOverridden && (
                          <span className="text-[9px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                            Room Override
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#505D56] mt-0.5">
                        Your living and dining area has an estimated floor area of <strong>{space.flooringAreaSqFt} sq.ft</strong>.
                        (~{tileWithWastage} sq.ft required including 7% cutting wastage &bull; ~{skirtingRft} Rft skirting).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {isOverridden && (
                        <button
                          type="button"
                          onClick={() => clearSpaceFlooringOverride(space.id)}
                          className="text-[11px] text-[#687770] hover:text-rose-700 underline cursor-pointer"
                        >
                          Reset to Zone Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => applyFlooringToSimilarSpaces('living', currentMaterial)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E8EFE9] border border-[#B7CDBB] text-[#183B32] text-xs font-bold hover:bg-[#DDF0E5] transition-all cursor-pointer shadow-2xs"
                        title="Apply this tile finish to all living and dining spaces"
                      >
                        <Sparkles className="w-3 h-3 text-[#C66B4E]" />
                        <span>Apply to all living/dining</span>
                      </button>
                    </div>
                  </div>

                  {/* Material Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {PRIMARY_FLOORING_OPTIONS.map((opt) => {
                      const isSelected = currentMaterial.includes(opt.id) || currentMaterial === opt.id || currentMaterial.includes(opt.name.split(' ')[0]);
                      const roomEstCost = Math.round(tileWithWastage * opt.standardRate);

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSpaceFlooring(space.id, opt.id, space.type)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative ${
                            isSelected
                              ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                              : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1.5 mb-1.5">
                              {renderTextureSwatch(opt.swatchType, isSelected)}
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[#C66B4E] uppercase tracking-wider block">
                              {opt.sizeLabel}
                            </span>
                            <span className="text-xs font-bold text-[#18211E] block line-clamp-1">{opt.name}</span>
                            <p className="text-[10.5px] text-[#505D56] line-clamp-2 mt-1 leading-tight">{opt.desc}</p>
                          </div>

                          <div className="pt-2 border-t border-[#CBD5CB]/50 flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-[#18211E] text-xs">₹{opt.standardRate}/sqft</span>
                            <span className="font-mono font-bold text-[#183B32] text-[11px]">{formatCurrency(roomEstCost)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: BEDROOMS (WITH INDIVIDUAL OVERRIDES)                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {(activeCategory === 'all' || activeCategory === 'bedrooms') && spacesByCategory.bedroomSpaces.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#CBD5CB] pb-2">
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-[#183B32]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#18211E]">
                Bedrooms ({spacesByCategory.bedroomSpaces.length} Configured)
              </h3>
            </div>
            <span className="text-xs text-[#687770]">
              Total Area: ~{spacesByCategory.bedroomSpaces.reduce((s, r) => s + r.flooringAreaSqFt, 0)} sq.ft
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {spacesByCategory.bedroomSpaces.map((space, idx) => {
              const currentMaterial = getSpaceActiveMaterial(space.id, space.type);
              const isOverridden = Boolean(spaceFlooringOverrides[space.id]);
              const tileWithWastage = Math.round(space.flooringAreaSqFt * 1.07);
              const skirtingRft = Math.max(0, space.perimeter - (space.doorCount * 3));
              const isMaster = idx === 0;

              return (
                <div
                  key={space.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-2xs space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB]/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-[#18211E] font-heading">
                          {isMaster ? `Master Bedroom (#1)` : space.name}
                        </h4>
                        <span className="text-[10px] font-mono text-[#687770] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#CBD5CB]">
                          {space.floorName}
                        </span>
                        {isMaster && (
                          <span className="text-[9px] font-bold text-[#183B32] bg-[#E8EFE9] px-2 py-0.5 rounded-full border border-[#B7CDBB]">
                            Primary Suite
                          </span>
                        )}
                        {isOverridden && (
                          <span className="text-[9px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                            Room Override
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#505D56] mt-0.5">
                        Floor Area: <strong>{space.flooringAreaSqFt} sq.ft</strong> &bull;
                        (~{tileWithWastage} sq.ft with 7% cutting allowance &bull; ~{skirtingRft} Rft skirting).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {isOverridden && (
                        <button
                          type="button"
                          onClick={() => clearSpaceFlooringOverride(space.id)}
                          className="text-[11px] text-[#687770] hover:text-rose-700 underline cursor-pointer"
                        >
                          Reset to Bedroom Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => applyFlooringToSimilarSpaces('bed', currentMaterial)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E8EFE9] border border-[#B7CDBB] text-[#183B32] text-xs font-bold hover:bg-[#DDF0E5] transition-all cursor-pointer shadow-2xs"
                        title="Apply this flooring selection to all bedrooms in your home"
                      >
                        <Sparkles className="w-3 h-3 text-[#C66B4E]" />
                        <span>Apply to all {spacesByCategory.bedroomSpaces.length} bedrooms</span>
                      </button>
                    </div>
                  </div>

                  {/* Material Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {PRIMARY_FLOORING_OPTIONS.map((opt) => {
                      const isSelected = currentMaterial.includes(opt.id) || currentMaterial === opt.id || currentMaterial.includes(opt.name.split(' ')[0]);
                      const roomEstCost = Math.round(tileWithWastage * opt.standardRate);

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSpaceFlooring(space.id, opt.id, space.type)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative ${
                            isSelected
                              ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                              : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1.5 mb-1.5">
                              {renderTextureSwatch(opt.swatchType, isSelected)}
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[#C66B4E] uppercase tracking-wider block">
                              {opt.sizeLabel}
                            </span>
                            <span className="text-xs font-bold text-[#18211E] block line-clamp-1">{opt.name}</span>
                            <p className="text-[10.5px] text-[#505D56] line-clamp-2 mt-1 leading-tight">{opt.desc}</p>
                          </div>

                          <div className="pt-2 border-t border-[#CBD5CB]/50 flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-[#18211E] text-xs">₹{opt.standardRate}/sqft</span>
                            <span className="font-mono font-bold text-[#183B32] text-[11px]">{formatCurrency(roomEstCost)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: KITCHEN & UTILITY                                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {(activeCategory === 'all' || activeCategory === 'kitchen') && spacesByCategory.kitchenSpaces.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#CBD5CB] pb-2">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#183B32]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#18211E]">
                Kitchen &amp; Utility Finishes
              </h3>
            </div>
            <span className="text-xs text-[#687770]">
              Wall Backsplash + Anti-Skid Floor
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {spacesByCategory.kitchenSpaces.map((space) => {
              const currentMaterial = getSpaceActiveMaterial(space.id, space.type);
              const isKitchen = space.type === 'kitchen';
              const tileWithWastage = Math.round(space.flooringAreaSqFt * 1.07);
              const kitchenDadoHeight = wallCladding?.kitchenDadoHeight || '2 ft';
              const backsplashArea = isKitchen ? (space.dadoTileAreaSqFt || (kitchenDadoHeight === '4 ft' ? 40 : 20)) : 0;

              return (
                <div
                  key={space.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB]/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-[#18211E] font-heading">{space.name}</h4>
                        <span className="text-[10px] font-mono text-[#687770] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#CBD5CB]">
                          {space.floorName}
                        </span>
                      </div>
                      <p className="text-xs text-[#505D56] mt-0.5">
                        Floor Area: <strong>{space.flooringAreaSqFt} sq.ft</strong> &bull;
                        {isKitchen && (
                          <span> Wall Backsplash Dado: <strong>~{backsplashArea} sq.ft</strong></span>
                        )}
                      </p>
                    </div>

                    {isKitchen && (
                      <div className="flex items-center gap-2 bg-[#F8F8F6] p-1.5 rounded-xl border border-[#CBD5CB]">
                        <span className="text-[11px] font-bold text-[#18211E] px-1">Backsplash Height:</span>
                        {(['2 ft', '4 ft'] as const).map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setWallCladding(h, wallCladding?.bathroomTileHeight || '7 ft (Lintel)')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              kitchenDadoHeight === h
                                ? 'bg-[#183B32] text-white shadow-2xs'
                                : 'text-[#505D56] hover:bg-white'
                            }`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Floor Tile Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      PRIMARY_FLOORING_OPTIONS[1], // Double charged vitrified
                      PRIMARY_FLOORING_OPTIONS[0], // GVT
                      PRIMARY_FLOORING_OPTIONS[2], // Granite
                    ].map((opt) => {
                      const isSelected = currentMaterial.includes(opt.id) || currentMaterial === opt.id || currentMaterial.includes(opt.name.split(' ')[0]);
                      const roomEstCost = Math.round(tileWithWastage * opt.standardRate);

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSpaceFlooring(space.id, opt.id, space.type)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                              : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1.5 mb-1.5">
                              {renderTextureSwatch(opt.swatchType, isSelected)}
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[#C66B4E] uppercase tracking-wider block">
                              {opt.sizeLabel}
                            </span>
                            <span className="text-xs font-bold text-[#18211E] block line-clamp-1">{opt.name}</span>
                            <p className="text-[10.5px] text-[#505D56] line-clamp-2 mt-1 leading-tight">{opt.desc}</p>
                          </div>

                          <div className="pt-2 border-t border-[#CBD5CB]/50 flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-[#18211E] text-xs">₹{opt.standardRate}/sqft</span>
                            <span className="font-mono font-bold text-[#183B32] text-[11px]">{formatCurrency(roomEstCost)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: BATHROOMS & WALL DADO TILES (DEEP CONFIGURATION)     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {(activeCategory === 'all' || activeCategory === 'bathrooms') && spacesByCategory.bathroomSpaces.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#CBD5CB] pb-2">
            <div className="flex items-center gap-2">
              <Bath className="w-4 h-4 text-[#183B32]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#18211E]">
                Bathrooms &amp; Wall Dado Cladding ({spacesByCategory.bathroomSpaces.length} Configured)
              </h3>
            </div>
            <span className="text-xs text-[#687770]">
              Anti-Skid Floor + Full Waterproof Wall Tiles
            </span>
          </div>

          {/* Master Bathroom Finish Controls */}
          <div className="p-4 rounded-2xl bg-[#E8EFE9] border border-[#B7CDBB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div>
              <span className="font-bold text-[#183B32] block">
                Standardize All Bathroom Specifications:
              </span>
              <p className="text-[11px] text-[#505D56] mt-0.5 leading-relaxed">
                Apply consistent waterproof tiles and lintel/ceiling dado heights across all bathrooms, or customize each bathroom independently below.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => applyDadoToAllBathrooms('7 ft (Lintel)')}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5CB] text-[#183B32] text-xs font-bold hover:bg-[#DDF0E5] transition-all cursor-pointer shadow-2xs"
              >
                Set All to 7ft Lintel
              </button>
              <button
                type="button"
                onClick={() => applyDadoToAllBathrooms('Full Height (Ceiling)')}
                className="px-3 py-1.5 rounded-xl bg-[#183B32] text-white text-xs font-bold hover:bg-[#245747] transition-all cursor-pointer shadow-2xs"
              >
                Set All to 10ft Ceiling
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {spacesByCategory.bathroomSpaces.map((space, idx) => {
              const currentFloorMaterial = getSpaceActiveMaterial(space.id, space.type);
              const isOverridden = Boolean(spaceFlooringOverrides[space.id]);
              const dadoOverride = spaceDadoOverrides[space.id];
              const activeDadoHeight = dadoOverride?.height || wallCladding?.bathroomTileHeight || '7 ft (Lintel)';
              const isCeilingHeight = activeDadoHeight === 'Full Height (Ceiling)';

              // Compute wall dado area accurately (Perimeter x Height - Door/Ventilator deduction)
              const wallHeight = isCeilingHeight ? 10 : 7;
              const grossWallDado = space.perimeter * wallHeight;
              const deduction = (space.doorOpeningAreaSqFt * (wallHeight / 10)) + space.windowOpeningAreaSqFt;
              const calculatedDadoSqFt = Math.max(0, Math.round(grossWallDado - deduction));

              return (
                <div
                  key={space.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB]/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-[#18211E] font-heading">
                          {idx === 0 ? `Master Attached Bathroom (#1)` : space.name}
                        </h4>
                        <span className="text-[10px] font-mono text-[#687770] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#CBD5CB]">
                          {space.floorName}
                        </span>
                        {isOverridden && (
                          <span className="text-[9px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                            Customized
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#505D56] mt-1 flex-wrap">
                        <span>Floor Area: <strong className="text-[#18211E]">{space.flooringAreaSqFt} sq.ft</strong></span>
                        <span>&bull;</span>
                        <span>Wall Dado Area: <strong className="text-[#C66B4E]">~{calculatedDadoSqFt} sq.ft</strong></span>
                        <span>&bull;</span>
                        <span className="text-[11px] text-[#66716B] italic">
                          (Wall dado is ~{(calculatedDadoSqFt / Math.max(1, space.flooringAreaSqFt)).toFixed(1)}&times; larger than floor area)
                        </span>
                      </div>
                    </div>

                    {/* Wall Dado Height Selector */}
                    <div className="flex items-center gap-2 bg-[#F8F8F6] p-1.5 rounded-xl border border-[#CBD5CB] self-start sm:self-auto">
                      <span className="text-[11px] font-bold text-[#18211E] px-1">Dado Height:</span>
                      {(['7 ft (Lintel)', 'Full Height (Ceiling)'] as const).map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setSpaceDado(space.id, h)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeDadoHeight === h
                              ? 'bg-[#183B32] text-white shadow-2xs'
                              : 'text-[#505D56] hover:bg-white'
                          }`}
                        >
                          {h.includes('7 ft') ? '7 ft Lintel' : '10 ft Ceiling'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dual Selector: 1. Floor Tiles | 2. Wall Dado Tiles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* A. Bathroom Floor Tiles */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#18211E] block">
                        A. Slip-Resistant Floor Tile
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {BATHROOM_FLOOR_OPTIONS.map((opt) => {
                          const isSelected = currentFloorMaterial.includes(opt.id) || currentFloorMaterial === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSpaceFlooring(space.id, opt.id, space.type)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                                isSelected
                                  ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                                  : 'border-[#CBD5CB] bg-white hover:border-[#183B32]/30'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-mono font-bold text-[#C66B4E] uppercase">{opt.sizeLabel}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[#183B32]" />}
                                </div>
                                <span className="text-xs font-bold text-[#18211E] block">{opt.name}</span>
                                <p className="text-[10px] text-[#505D56] mt-0.5 line-clamp-2 leading-tight">{opt.desc}</p>
                              </div>
                              <span className="font-mono font-bold text-[#18211E] text-xs pt-1 border-t border-[#CBD5CB]/40 block">
                                ₹{opt.standardRate}/sqft
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* B. Bathroom Wall Dado Tiles */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#18211E] block">
                        B. Waterproof Wall Dado Tiles
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {BATHROOM_WALL_DADO_OPTIONS.map((opt) => {
                          const isSelected = (dadoOverride?.tile || 'Glazed Ceramic Wall').includes(opt.id);
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSpaceDado(space.id, activeDadoHeight, opt.id)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                                isSelected
                                  ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                                  : 'border-[#CBD5CB] bg-white hover:border-[#183B32]/30'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-mono font-bold text-[#C66B4E] uppercase">{opt.sizeLabel}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[#183B32]" />}
                                </div>
                                <span className="text-xs font-bold text-[#18211E] block">{opt.name}</span>
                                <p className="text-[10px] text-[#505D56] mt-0.5 line-clamp-2 leading-tight">{opt.desc}</p>
                              </div>
                              <span className="font-mono font-bold text-[#18211E] text-xs pt-1 border-t border-[#CBD5CB]/40 block">
                                ₹{opt.standardRate}/sqft
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: BALCONIES, TERRACE & UTILITY OUTDOOR TILES           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {(activeCategory === 'all' || activeCategory === 'balcony') && spacesByCategory.balconySpaces.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#CBD5CB] pb-2">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-[#183B32]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#18211E]">
                Balconies &amp; Outdoor Terraces
              </h3>
            </div>
            <span className="text-xs text-[#687770]">
              UV-Shield Weatherproof Tiles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {spacesByCategory.balconySpaces.map((space) => {
              const currentMaterial = getSpaceActiveMaterial(space.id, space.type);
              const tileWithWastage = Math.round(space.flooringAreaSqFt * 1.07);

              return (
                <div
                  key={space.id}
                  className="p-4 rounded-2xl bg-white border border-[#CBD5CB] shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#CBD5CB]/60 pb-2">
                    <span className="font-bold text-[#18211E] text-sm">{space.name}</span>
                    <span className="text-xs font-mono font-bold text-[#183B32]">{space.flooringAreaSqFt} sq.ft</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {OUTDOOR_FLOORING_OPTIONS.slice(0, 2).map((opt) => {
                      const isSelected = currentMaterial.includes(opt.id) || currentMaterial === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSpaceFlooring(space.id, opt.id, space.type)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                            isSelected
                              ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                              : 'border-[#CBD5CB] bg-white hover:border-[#183B32]/30'
                          }`}
                        >
                          <div>
                            <span className="text-[9px] font-mono font-bold text-[#C66B4E] uppercase block">{opt.sizeLabel}</span>
                            <span className="text-xs font-bold text-[#18211E] block line-clamp-1">{opt.name}</span>
                          </div>
                          <span className="font-mono font-bold text-[#18211E] text-xs pt-1 border-t border-[#CBD5CB]/40 block">
                            ₹{opt.standardRate}/sqft
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 6: STAIRCASE GRANITE SLABS & CIRCULATION                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {(activeCategory === 'all' || activeCategory === 'staircase') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB] pb-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-[#183B32]" />
              <span className="font-bold text-[#18211E]">
                Internal &amp; External Staircase Granite Finish
              </span>
            </div>
            <span className="text-[11px] text-[#687770]">
              Quantities derived from {Math.max(1, (store.floors || 1) - 1)} staircase flights
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 space-y-1">
              <span className="text-[10px] text-[#687770] uppercase font-bold block">Staircase Granite Slabs</span>
              <span className="text-base font-mono font-bold text-[#183B32] block">
                ~{quantities.graniteSlabsSqFt || ((Math.max(1, store.floors || 1) - 1) * 180)} sq.ft
              </span>
              <span className="text-[10px] text-[#505D56] block leading-tight">
                Approximate early planning allowance (~180 sq.ft per flight) &bull; 20mm polished Sadahalli granite with 3 safety grooves &amp; full bullnose edge
              </span>
            </div>
            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 space-y-1">
              <span className="text-[10px] text-[#687770] uppercase font-bold block">Circulation Allowance</span>
              <span className="text-base font-mono font-bold text-[#183B32] block">
                ~{Math.round((area.totalBUASqFt || 0) * 0.10).toLocaleString()} sq.ft
              </span>
              <span className="text-[10px] text-[#505D56] block leading-tight">
                Configured circulation allowance (10% of total BUA) allocated for passages, main foyer, and floor landings
              </span>
            </div>
            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 space-y-1">
              <span className="text-[10px] text-[#687770] uppercase font-bold block">Tile Polymer Adhesive</span>
              <span className="text-base font-mono font-bold text-[#183B32] block">
                ~{totalTileQuantity.toLocaleString()} sq.ft
              </span>
              <span className="text-[10px] text-[#505D56] block leading-tight">
                MYK Laticrete 254 polymer-modified adhesive with epoxy stain-free grout
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 7: DETAILED FLOORING COST BREAKDOWN (COLLAPSIBLE)      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs border-b border-[#CBD5CB] pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#183B32]" />
            <span className="font-bold text-[#18211E]">
              Flooring Cost Summary: {formatCurrency(totalFlooringBOQCost)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowBOQBreakdown(!showBOQBreakdown)}
            className="text-[11px] text-[#183B32] font-bold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>{showBOQBreakdown ? 'Hide Detailed Item Lines' : 'Show Detailed Item Lines'}</span>
            {showBOQBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showBOQBreakdown ? (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#CBD5CB] bg-[#F8F8F6] text-[#687770] font-bold">
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3">Unit</th>
                    <th className="py-2 px-3 text-right">Quantity</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                    <th className="py-2 px-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5CB]/50">
                  {flooringBOQItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F8F9F7] transition-colors">
                      <td className="py-2 px-3">
                        <span className="font-bold text-[#18211E] block">{item.description}</span>
                        <span className="text-[10px] text-[#687770] block">{item.brand || item.remarks}</span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[#505D56]">{item.unit}</td>
                      <td className="py-2 px-3 font-mono font-bold text-[#18211E] text-right">
                        {item.quantity?.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-mono text-[#505D56] text-right">
                        ₹{item.unitRate}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-[#183B32] text-right">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#E8EFE9] rounded-xl border border-[#B7CDBB] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#505D56]">
                * Material supply and tile laying labour are itemized separately. Includes 7% cutting and pattern allowance.
              </span>
              <span className="font-mono font-black text-[#183B32] text-sm shrink-0">
                {formatCurrency(totalFlooringBOQCost)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-[#505D56]">
            Total estimate for all tiles, granite slabs, adhesives, and laying labor across your home is <strong>{formatCurrency(totalFlooringBOQCost)}</strong>. Click above to view individual item rates.
          </p>
        )}
      </div>

      {/* ── 8. HONEST QUANTITY PROMISE ── */}
      <div className="p-4 rounded-xl bg-[#E8EFE9] border border-[#B7CDBB] flex items-start gap-3 text-left">
        <ShieldCheck className="w-5 h-5 text-[#183B32] shrink-0 mt-0.5" />
        <div className="text-xs text-[#183B32] leading-relaxed space-y-1">
          <strong className="block font-bold">
            Transparent Pricing Guarantee:
          </strong>
          <p className="text-[11px] text-[#505D56] leading-relaxed">
            Changing tile designs or upgrading to Italian marble updates material rates and your estimate instantly.
            The actual floor square footage of your rooms never changes because it is calculated directly from your floor plan.
          </p>
        </div>
      </div>
    </div>
  );
};
