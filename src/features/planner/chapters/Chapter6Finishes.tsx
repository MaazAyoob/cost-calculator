import React, { useState, useMemo } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import {
  useBuildingModel,
  useQuantities,
  useBOQ,
  useBudgetResult,
} from '../../../store/useCalculationStore';
import {
  Zap,
  Droplets,
  Paintbrush,
  ShieldCheck,
  Sparkles,
  Check,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sliders,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  Home,
  Bed,
  Bath,
  Grid,
  Layers,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/cn';

export interface ElectricalTierOption {
  id: 'Economy (Anchor)' | 'Mid-range (V-Guard)' | 'Premium (Finolex / Polycab)';
  name: string;
  wireBrand: string;
  switchesBrand: string;
  switchRate: number; // ₹ per switch module
  wireRateSqFt: number; // approx ₹/sq.ft
  desc: string;
  features: string[];
  swatchGradient: string;
  badge?: string;
}

export interface SanitaryTierOption {
  id: string;
  name: string;
  brands: string;
  setRate: number; // ₹ per bathroom set
  ewcRate: number;
  basinRate: number;
  showerRate: number;
  faucetRate: number;
  desc: string;
  features: string[];
  swatchGradient: string;
  badge?: string;
}

export interface PaintOption {
  id: string;
  name: string;
  category: 'interior' | 'exterior';
  brand: string;
  sheen: string;
  ratePerSqFt: number;
  coverage: number; // sq.ft per litre
  desc: string;
  swatchColor: string;
  badge?: string;
}

export const ELECTRICAL_TIERS: ElectricalTierOption[] = [
  {
    id: 'Premium (Finolex / Polycab)',
    name: 'FRLS Copper + Schneider / Legrand',
    wireBrand: 'Finolex / Polycab Flame Retardant Low Smoke (FRLS)',
    switchesBrand: 'Schneider Livia / Legrand Arteor Modular',
    switchRate: 240,
    wireRateSqFt: 32,
    desc: 'Hutty Recommended Baseline. 100% electrolytic oxygen-free copper wire with low-smoke halogen-free insulation, paired with premium modular switches.',
    features: [
      'Flame Retardant Low Smoke (FRLS) 1100V rated insulation',
      'Silver-inlay contacts rated for 1,00,000+ switching operations',
      'Dual chemical earthing pit with copper bonded electrode',
    ],
    swatchGradient: 'linear-gradient(135deg, #183B32 0%, #2A5A4D 100%)',
    badge: 'Hutty Recommended',
  },
  {
    id: 'Mid-range (V-Guard)',
    name: 'FR Copper + Anchor Roma Modular',
    wireBrand: 'V-Guard / Havells Flame Retardant (FR)',
    switchesBrand: 'Anchor Roma Classic Modular',
    switchRate: 185,
    wireRateSqFt: 24,
    desc: 'Reliable multi-strand copper wiring with standard fire-retardant PVC insulation and classic smooth modular switchplates.',
    features: [
      'Standard Flame Retardant (FR) grade copper',
      'Anchor Roma smooth rocker switches',
      'Standard GI plate distribution boards with MCBs',
    ],
    swatchGradient: 'linear-gradient(135deg, #374151 0%, #4B5563 100%)',
  },
  {
    id: 'Economy (Anchor)',
    name: 'Standard ISI + GreatWhite Switches',
    wireBrand: 'Anchor by Panasonic / Goldmedal',
    switchesBrand: 'GreatWhite / Anchor Rider',
    switchRate: 140,
    wireRateSqFt: 18,
    desc: 'ISI marked commercial copper conductors and durable standard modular switch accessories for cost-conscious building.',
    features: [
      'Standard ISI marked multi-strand conductors',
      'Basic modular switchplates',
      'Standard electrical point layout',
    ],
    swatchGradient: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
  },
];

export const SANITARY_TIERS: SanitaryTierOption[] = [
  {
    id: 'Premium (Jaquar / Kohler / Grohe)',
    name: 'Jaquar / Kohler Premium Series',
    brands: 'Jaquar / Kohler / Grohe',
    setRate: 38000,
    ewcRate: 15200,
    basinRate: 9500,
    showerRate: 9500,
    faucetRate: 3800,
    desc: 'Hutty Recommended Baseline. Rimless wall-hung EWCs with soft-close UF seat, concealed dual-flush cistern, single-lever brass diverter and rain shower.',
    features: [
      'Rimless hygienic ceramic bowl with Nano-glaze anti-bacterial coating',
      'Concealed water-saving dual flush plate (3L / 6L flush)',
      'Single-lever thermostatic bath diverter with 200mm SS rain shower',
      '10-Year manufacturer warranty on brass cartridges and ceramics',
    ],
    swatchGradient: 'linear-gradient(135deg, #183B32 0%, #2A5A4D 100%)',
    badge: 'Hutty Recommended',
  },
  {
    id: 'Luxury (Toto / Duravit)',
    name: 'Toto / Duravit Luxury Designer',
    brands: 'Toto / Duravit / Hansgrohe',
    setRate: 85000,
    ewcRate: 34000,
    basinRate: 21250,
    showerRate: 21250,
    faucetRate: 8500,
    desc: 'World-renowned Japanese Toto CeFiONtect glazed wall-hung toilets, concealed Geberit Swiss cisterns, and Hansgrohe thermostatic showers.',
    features: [
      'Toto CeFiONtect ultra-smooth ceramic glaze preventing debris adhesion',
      'Geberit concealed Swiss pneumatic flush tank with acoustic insulation',
      'Hansgrohe overhead rainfall shower with AirPower droplet technology',
    ],
    swatchGradient: 'linear-gradient(135deg, #784421 0%, #4A2E18 100%)',
    badge: 'Luxury Designer',
  },
  {
    id: 'Mass Market (Cera / Hindware / Parryware)',
    name: 'Cera / Hindware Standard Baseline',
    brands: 'Cera / Parryware / Hindware',
    setRate: 18000,
    ewcRate: 7200,
    basinRate: 4500,
    showerRate: 4500,
    faucetRate: 1800,
    desc: 'Durable floor-mounted or wall-hung ceramic sanitaryware with standard chrome plated dual taps and quarter-turn wall mixer.',
    features: [
      'Standard vitreous china white ceramic glaze',
      'Dual-handle wall mixer with overhead telephonic shower',
      'ABS health faucet and standard pillar tap',
    ],
    swatchGradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
  },
];

export const INTERIOR_PAINT_OPTIONS: PaintOption[] = [
  {
    id: 'Premium Emulsion',
    name: 'Asian Paints Apcolite Premium',
    category: 'interior',
    brand: 'Asian Paints',
    sheen: 'Rich Satin Sheen',
    ratePerSqFt: 26,
    coverage: 45,
    desc: 'Hutty Standard Baseline. Smooth washable acrylic emulsion with stain-resistant micro-film and anti-fungal barrier.',
    swatchColor: '#FAF7F2',
    badge: 'Hutty Recommended',
  },
  {
    id: 'Royale Luxury Emulsion',
    name: 'Asian Paints Royale Luxury',
    category: 'interior',
    brand: 'Asian Paints',
    sheen: 'Silky Teflon Sheen',
    ratePerSqFt: 42,
    coverage: 45,
    desc: 'Ultra-luxurious Teflon surface protected emulsion. Completely scrubbable, wipeable, and zero VOC for superior indoor air quality.',
    swatchColor: '#F5EBE1',
    badge: 'Luxury Finish',
  },
  {
    id: 'Tractor Emulsion',
    name: 'Asian Paints Tractor Emulsion',
    category: 'interior',
    brand: 'Asian Paints',
    sheen: 'Soft Matte',
    ratePerSqFt: 18,
    coverage: 45,
    desc: 'Economical smooth matte wall finish providing uniform coverage over wall putty and primer base coat.',
    swatchColor: '#F3F4F6',
  },
];

export const EXTERIOR_PAINT_OPTIONS: PaintOption[] = [
  {
    id: 'Apex Ultima Protek',
    name: 'Asian Paints Apex Ultima Protek',
    category: 'exterior',
    brand: 'Asian Paints',
    sheen: 'Weather-Shield Sheen',
    ratePerSqFt: 38,
    coverage: 60,
    desc: 'Hutty Recommended Baseline. Silicone-reinforced acrylic elastomeric exterior system with nano-defence against extreme rain, algae, and UV fading.',
    swatchColor: '#E2E8F0',
    badge: '10-Yr Warranty',
  },
  {
    id: 'Ultima Weather Proof',
    name: 'Asian Paints Apex Weatherproof',
    category: 'exterior',
    brand: 'Asian Paints',
    sheen: 'Durable Matte Exterior',
    ratePerSqFt: 28,
    coverage: 60,
    desc: 'Modified acrylic exterior emulsion formulated to protect exterior facades from tropical rain and algae.',
    swatchColor: '#CBD5E1',
  },
  {
    id: 'Ace Exterior Emulsion',
    name: 'Asian Paints Ace Exterior',
    category: 'exterior',
    brand: 'Asian Paints',
    sheen: 'Standard Exterior',
    ratePerSqFt: 16,
    coverage: 60,
    desc: 'Standard water-based exterior coating for weather exposed boundary walls and rear parapets.',
    swatchColor: '#94A3B8',
  },
];

export interface FabricationCardOption {
  id: string;
  name: string;
  category: 'staircase' | 'balcony' | 'gate' | 'elevation';
  rate: number;
  unit: string;
  desc: string;
  spec: string;
  badge?: string;
}

export const STAIRCASE_RAILING_OPTIONS: FabricationCardOption[] = [
  {
    id: 'SS 304 with Toughened Glass',
    name: 'SS 304 with 10mm Toughened Glass',
    category: 'staircase',
    rate: 1850,
    unit: '₹/Rft',
    desc: 'Hutty Recommended. Marine grade AISI SS 304 balusters and polished glass panels.',
    spec: '10mm toughened glass, 50mm dia SS handrail, heavy base plate mounting',
    badge: 'Hutty Baseline',
  },
  {
    id: 'MS Designer with Wooden Handrail',
    name: 'MS Laser-Cut Designer + Teak Handrail',
    category: 'staircase',
    rate: 1250,
    unit: '₹/Rft',
    desc: 'Architectural CNC laser-cut mild steel panels topped with polished natural teak wood.',
    spec: 'Anti-corrosion zinc primer + PU matte coat with 65mm contoured teak handrail',
  },
  {
    id: 'Standard MS Pipe Railing',
    name: 'Standard Tubular MS Pipe Railing',
    category: 'staircase',
    rate: 650,
    unit: '₹/Rft',
    desc: 'Economical 40mm hollow circular pipe railing with vertical intermediate balusters.',
    spec: 'Double red-oxide anti-rust base coat + synthetic enamel topcoat',
  },
];

export const BALCONY_RAILING_OPTIONS: FabricationCardOption[] = [
  {
    id: 'SS 304 with Toughened Glass',
    name: 'SS 304 Frameless Glass Railing',
    category: 'balcony',
    rate: 1650,
    unit: '₹/Rft',
    desc: 'Weatherproof SS 304 bottom spigots with 10mm exterior toughened safety glass.',
    spec: 'Zero rusting under monsoon rain; clean unobstructed outdoor balcony view',
    badge: 'Recommended',
  },
  {
    id: 'MS Laser-Cut CNC Grille',
    name: 'MS Laser-Cut CNC Geometric Grille',
    category: 'balcony',
    rate: 1150,
    unit: '₹/Rft',
    desc: 'Contemporary geometric patterned CNC sheet metal railing with epoxy primer.',
    spec: 'Modern architectural facade elevation appeal with child-safe vertical spacing',
  },
  {
    id: 'Standard MS Square Bar Railing',
    name: 'Standard MS Square Bar Protective Railing',
    category: 'balcony',
    rate: 550,
    unit: '₹/Rft',
    desc: 'Classic 12mm solid square bar railing with horizontal safety tie-runners.',
    spec: 'Rigid perimeter weld with anchored base expansion bolts',
  },
];

export const MAIN_GATE_OPTIONS: FabricationCardOption[] = [
  {
    id: 'MS Designer Sliding / Swing Gate (10x6 ft)',
    name: 'MS Designer Sliding / Swing Driveway Gate',
    category: 'gate',
    rate: 420,
    unit: '₹/Sq Ft',
    desc: 'Heavy gauge rectangular tube perimeter frame with sheet metal accents and rolling track.',
    spec: '10 ft × 6 ft (60 sq.ft) with heavy brass lock mortise and gate latching hardware',
    badge: 'Popular',
  },
  {
    id: 'Wrought Iron Cast Style Gate',
    name: 'Heavy-Duty Wrought Iron Ornamental Gate',
    category: 'gate',
    rate: 650,
    unit: '₹/Sq Ft',
    desc: 'Solid ornamental forging with traditional spear tips and polyurethane protective coating.',
    spec: 'Solid forged bars with decorative castings and heavy duty pivot bearings',
  },
  {
    id: 'Tubular MS Swing Gate',
    name: 'Standard Tubular MS Compound Gate',
    category: 'gate',
    rate: 280,
    unit: '₹/Sq Ft',
    desc: 'Functional dual swing tubular frame with vertical grill infill and safety lock latch.',
    spec: 'Clean rectangular hollow section construction with red oxide primer',
  },
];

export const ELEVATION_CLADDING_OPTIONS: FabricationCardOption[] = [
  {
    id: 'HPL / Stone Veneer Façade Cladding',
    name: 'Front Façade HPL / Stone Veneer Cladding',
    category: 'elevation',
    rate: 280,
    unit: '₹/Sq Ft',
    desc: 'Exterior High Pressure Laminate (HPL) or natural slate/travertine dry stone veneer.',
    spec: '180 sq.ft feature wall on front elevation with aluminium sub-frame mounting',
    badge: 'Architectural Choice',
  },
  {
    id: 'Grooved Exterior Texture & Louvers',
    name: 'Grooved Exterior Texture & Box Louvers',
    category: 'elevation',
    rate: 140,
    unit: '₹/Sq Ft',
    desc: 'Textured acrylic aggregate plaster accented with powder-coated aluminium box louvers.',
    spec: '180 sq.ft textured surface with water-repellent siloxane seal',
  },
  {
    id: 'Weatherproof Paint Only',
    name: 'Smooth Exterior Weather-Shield Paint (No Cladding)',
    category: 'elevation',
    rate: 0,
    unit: '₹/Sq Ft',
    desc: 'Façade relies on the multi-coat exterior paint system selected in Section C with no cladding addon.',
    spec: 'Included in painting budget; no separate cladding charges applied',
  },
];

interface Chapter6FinishesProps {
  embedded?: boolean;
}

export const Chapter6Finishes: React.FC<Chapter6FinishesProps> = ({ embedded = false }) => {
  const store = useWizardStore();
  const quantities = useQuantities();
  const boq = useBOQ();
  const budget = useBudgetResult();
  const buildingModel = useBuildingModel();

  const {
    electrical,
    bathroomFittings,
    painting,
    fabrication,
    spaceElectricalTierOverrides,
    spaceSanitaryOverrides,
    spacePaintOverrides,
    setElectricalSelection,
    setBathroomFittingSelection,
    setPaintingSelection,
    setFabricationSelection,
    setSpaceElectricalTier,
    setSpaceSanitary,
    setSpacePaint,
    applyElectricalToAllRooms,
    applySanitaryToAllBathrooms,
    applyPaintToAllRooms,
  } = store;

  const [activeTab, setActiveTab] = useState<'all' | 'electrical' | 'plumbing' | 'paint' | 'fabrication' | 'elevation'>('all');
  const [showBOQBreakdown, setShowBOQBreakdown] = useState<boolean>(true);

  // Active selections
  const currentElectricalTier = electrical.wireTier || 'Premium (Finolex / Polycab)';
  const currentSanitaryTier = bathroomFittings.sanitaryTier || 'Premium (Jaquar / Kohler / Grohe)';
  const currentInternalPaint = painting.internalPaint || 'Premium Emulsion';
  const currentExternalPaint = painting.externalPaint || 'Apex Ultima Protek';
  const currentStaircaseRailing = fabrication?.staircaseRailing || 'SS 304 with Toughened Glass';
  const currentBalconyRailing = fabrication?.balconyRailing || 'SS 304 with Toughened Glass';
  const currentMainGate = fabrication?.mainGate || 'MS Designer Sliding / Swing Gate (10x6 ft)';
  const currentElevationCladding = fabrication?.elevationCladding || 'HPL / Stone Veneer Façade Cladding';

  // Filter Electrical (EL), Plumbing (PL), Paint (PW), Fabrication (FB), and Elevation (EV) from BOQ
  const finishesBOQ = useMemo(() => {
    return boq.filter(
      (item) =>
        item.code.startsWith('EL') ||
        item.code.startsWith('PL') ||
        item.code.startsWith('PW') ||
        item.code.startsWith('PT') ||
        item.code.startsWith('FB') ||
        item.code.startsWith('EV') ||
        item.code.startsWith('DR-BALC') ||
        item.category === 'Painting & Waterproofing' ||
        item.category === 'Metal Fabrication & Railings' ||
        item.category === 'Elevation & External Finishes' ||
        item.category === 'Fixtures & Finishes'
    );
  }, [boq]);

  const finishesTotalINR = useMemo(() => {
    return finishesBOQ.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [finishesBOQ]);

  // Bathroom spaces from building model
  const bathroomSpaces = useMemo(() => {
    return (buildingModel.allSpaces || []).filter((s) => {
      const t = (s.type as string).toLowerCase();
      return t.includes('bath') || t.includes('toilet');
    });
  }, [buildingModel.allSpaces]);

  // Enclosed rooms from building model
  const roomSpaces = useMemo(() => {
    return (buildingModel.allSpaces || []).filter((s) => {
      const t = (s.type as string).toLowerCase();
      return !t.includes('stair') && !t.includes('parking') && !t.includes('setback');
    });
  }, [buildingModel.allSpaces]);

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      {/* ── CHAPTER HEADER & KPI BADGES ── */}
      <div className="space-y-3 border-b border-[#CBD5CB] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-xs font-bold text-[#183B32]">
            <Sparkles className="w-3.5 h-3.5 text-[#C66B4E]" />
            <span>STEP 6 OF 7 &bull; ELECTRICAL, PLUMBING &amp; FINISHES</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#505D56] hidden sm:inline">Estimated Budget:</span>
            <span className="text-sm sm:text-base font-mono font-bold text-[#183B32] bg-[#E8EFE9] px-3 py-1 rounded-xl border border-[#B7CDBB]">
              {formatCurrency(finishesTotalINR)}
            </span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
          Choose your home fittings and finishes.
        </h2>
        <p className="text-xs sm:text-sm text-[#505D56] leading-relaxed max-w-3xl">
          Pick your fire-safe electrical wiring, modular switches, bathroom showers &amp; sanitaryware, smooth wall paints, and safety railings.
          All wiring points and wall paint areas are calculated directly from your room dimensions.
        </p>

        {/* Real-time KPI Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="p-3 rounded-2xl bg-white border border-[#CBD5CB] shadow-2xs space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#687770]">Electrical Points</span>
              <Zap className="w-3.5 h-3.5 text-[#183B32]" />
            </div>
            <div className="text-lg font-mono font-extrabold text-[#18211E]">
              {quantities.totalElectricalPoints} <span className="text-xs font-normal text-[#687770]">Points</span>
            </div>
            <div className="text-[10px] text-[#505D56] line-clamp-1">
              ~{quantities.electricalWireMetres}m wire &bull; ~{quantities.conduitsMetres}m conduit
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#CBD5CB] shadow-2xs space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#687770]">Sanitary Fixtures</span>
              <Bath className="w-3.5 h-3.5 text-[#183B32]" />
            </div>
            <div className="text-lg font-mono font-extrabold text-[#18211E]">
              {quantities.bathroomFixtureSets} <span className="text-xs font-normal text-[#687770]">Sets</span>
            </div>
            <div className="text-[10px] text-[#505D56] line-clamp-1">
              {quantities.wcCount} EWCs &bull; {quantities.showerCount} Showers &bull; {quantities.washBasinCount} Basins
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#CBD5CB] shadow-2xs space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#687770]">Paintable Walls</span>
              <Paintbrush className="w-3.5 h-3.5 text-[#C66B4E]" />
            </div>
            <div className="text-lg font-mono font-extrabold text-[#18211E]">
              {quantities.totalPaintableAreaSqFt.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-[#687770]">sq.ft</span>
            </div>
            <div className="text-[10px] text-[#505D56] line-clamp-1">
              ~{quantities.interiorPaintLitres + quantities.exteriorPaintLitres}L paint &bull; ~{quantities.puttyKg}kg putty
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#CBD5CB] shadow-2xs space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#687770]">Water Storage Tank</span>
              <Droplets className="w-3.5 h-3.5 text-[#183B32]" />
            </div>
            <div className="text-lg font-mono font-extrabold text-[#18211E]">
              {quantities.overheadTankLitres || 1500} <span className="text-xs font-normal text-[#687770]">Litres</span>
            </div>
            <div className="text-[10px] text-[#505D56] line-clamp-1">
              4-Layer UV tank + 1.0 HP pump
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FILTER TABS                                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#CBD5CB]">
        {[
          { id: 'all', label: 'All Services & Finishes', icon: Grid },
          { id: 'electrical', label: 'Electrical & Wiring', icon: Zap },
          { id: 'plumbing', label: 'Plumbing & Sanitaryware', icon: Droplets },
          { id: 'paint', label: 'Painting & Surface Finishes', icon: Paintbrush },
          { id: 'fabrication', label: 'Metal Fabrication & Railings', icon: ShieldCheck },
          { id: 'elevation', label: 'Elevation & Cladding', icon: Home },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-[#183B32] text-white shadow-2xs'
                  : 'bg-white text-[#505D56] border border-[#CBD5CB] hover:bg-[#F8F9F7] hover:border-[#183B32]/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C66B4E]' : 'text-[#687770]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── SECTION A: ELECTRICAL WIRING & POWER ── */}
      {(activeTab === 'all' || activeTab === 'electrical') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#183B32]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#18211E]">
                  1. Electrical Wiring &amp; Modular Switches
                </h3>
              </div>
              <p className="text-xs text-[#505D56] mt-0.5">
                Total Electrical Points: <strong>{quantities.totalElectricalPoints} Points</strong> &bull; Total Switch Modules: <strong>{quantities.switchModules} Units</strong> &bull; Conduits: <strong>{quantities.conduitsMetres} m</strong>
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F8F8F6] border border-[#CBD5CB] text-xs text-[#18211E] font-medium">
              <span className="text-[#687770]">Your Choice:</span>
              <strong className="text-[#183B32]">{currentElectricalTier.split('(')[0].trim()}</strong>
            </div>
          </div>

          {/* Wire Tier Selection Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ELECTRICAL_TIERS.map((tier) => {
              const isSelected = currentElectricalTier.includes(tier.id) || currentElectricalTier === tier.id;

              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setElectricalSelection(tier.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                    isSelected
                      ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                      : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="w-10 h-10 rounded-xl shrink-0 border border-[#CBD5CB] shadow-2xs flex items-center justify-center text-white"
                        style={{ background: tier.swatchGradient }}
                      >
                        <Zap className="w-5 h-5 text-amber-300" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {tier.badge && (
                          <span className="text-[9px] font-bold text-[#183B32] bg-[#B7CDBB] border border-[#B8D3C4] px-1.5 py-0.5 rounded-full uppercase">
                            {tier.badge}
                          </span>
                        )}
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[#18211E] block line-clamp-1">{tier.name}</span>
                      <span className="text-[10px] font-mono text-[#C66B4E] font-bold block mt-0.5">
                        {tier.wireBrand.split('(')[0]}
                      </span>
                      <p className="text-[11px] text-[#505D56] line-clamp-2 mt-1 leading-tight">{tier.desc}</p>
                    </div>

                    <div className="space-y-1 pt-1">
                      {tier.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-[#505D56]">
                          <Check className="w-3 h-3 text-[#183B32] shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#18211E]">₹{tier.switchRate} / switch module</span>
                    <span className="font-mono font-bold text-[#183B32] text-[11px]">~₹{tier.wireRateSqFt}/sqft BUA</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Conductor Segregation & Wire Takeoff Grid */}
          <div className="p-4 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#18211E] block">
              Conductor Size Segregation &amp; Circuit Allocation (IS-732 Compliant)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-[#CBD5CB]/60 space-y-0.5">
                <span className="text-[10px] text-[#687770] uppercase font-bold block">1.5 sq.mm Wire</span>
                <span className="text-base font-mono font-bold text-[#183B32] block">
                  ~{quantities.wire1_5SqMmMetres} m
                </span>
                <span className="text-[10px] text-[#505D56] block leading-tight">
                  Lighting &amp; fan switch loops
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-[#CBD5CB]/60 space-y-0.5">
                <span className="text-[10px] text-[#687770] uppercase font-bold block">2.5 sq.mm Wire</span>
                <span className="text-base font-mono font-bold text-[#183B32] block">
                  ~{quantities.wire2_5SqMmMetres} m
                </span>
                <span className="text-[10px] text-[#505D56] block leading-tight">
                  6A &amp; 16A power sockets
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-[#CBD5CB]/60 space-y-0.5">
                <span className="text-[10px] text-[#687770] uppercase font-bold block">4.0 sq.mm Wire</span>
                <span className="text-base font-mono font-bold text-[#183B32] block">
                  ~{quantities.wire4SqMmMetres} m
                </span>
                <span className="text-[10px] text-[#505D56] block leading-tight">
                  Dedicated AC &amp; Geyser circuits
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-[#CBD5CB]/60 space-y-0.5">
                <span className="text-[10px] text-[#687770] uppercase font-bold block">6.0 sq.mm Wire</span>
                <span className="text-base font-mono font-bold text-[#183B32] block">
                  ~{quantities.wire6SqMmMetres} m
                </span>
                <span className="text-[10px] text-[#505D56] block leading-tight">
                  Vertical risers &amp; EV charger
                </span>
              </div>
            </div>
          </div>

          {/* Heavy Appliance Provisions & Regulatory Safety Disclaimer */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Safety &amp; Professional Electrical Load Compliance</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Wire lengths and conduit requirements are calculated based on your room space count and IS-732 recommendations.
              Actual connected load sanctions (kW/kVA), MCB tripping curves, and phase distribution must be finalized by your
              licensed electrical contractor in accordance with regional supply authority standards (e.g. BESCOM/CHESCOM).
            </p>
          </div>
        </div>
      )}

      {/* ── SECTION B: PLUMBING & SANITARYWARE ── */}
      {(activeTab === 'all' || activeTab === 'plumbing') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-[#183B32]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#18211E]">
                  2. Bathroom Fittings &amp; Sanitaryware
                </h3>
              </div>
              <p className="text-xs text-[#505D56] mt-0.5">
                Bathrooms: <strong>{quantities.bathroomFixtureSets} Sets</strong> &bull; Kitchen Sinks: <strong>{quantities.kitchenSinkCount} Unit(s)</strong> &bull; Overhead Tank: <strong>{quantities.overheadTankLitres || 1500} Litres</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => applySanitaryToAllBathrooms(currentSanitaryTier)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8EFE9] border border-[#B7CDBB] text-[#183B32] text-xs font-bold hover:bg-[#DDF0E5] transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
              title="Apply this sanitary tier across all configured bathrooms"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C66B4E]" />
              <span>Apply to all bathrooms</span>
            </button>
          </div>

          {/* Sanitaryware Tier Selection Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SANITARY_TIERS.map((tier) => {
              const isSelected = currentSanitaryTier.includes(tier.id) || currentSanitaryTier === tier.id;
              const totalCost = tier.setRate * quantities.bathroomFixtureSets;

              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setBathroomFittingSelection(tier.id, store.bathroomFittings.cpvcBrand || 'Astral')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                    isSelected
                      ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                      : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="w-10 h-10 rounded-xl shrink-0 border border-[#CBD5CB] shadow-2xs flex items-center justify-center text-white"
                        style={{ background: tier.swatchGradient }}
                      >
                        <Bath className="w-5 h-5 text-cyan-200" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {tier.badge && (
                          <span className="text-[9px] font-bold text-[#183B32] bg-[#B7CDBB] border border-[#B8D3C4] px-1.5 py-0.5 rounded-full uppercase">
                            {tier.badge}
                          </span>
                        )}
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[#18211E] block line-clamp-1">{tier.name}</span>
                      <span className="text-[10px] font-mono text-[#C66B4E] font-bold block mt-0.5">{tier.brands}</span>
                      <p className="text-[11px] text-[#505D56] line-clamp-2 mt-1 leading-tight">{tier.desc}</p>
                    </div>

                    {/* Breakdown per bathroom set */}
                    <div className="p-2 rounded-lg bg-white/70 border border-[#CBD5CB]/50 text-[10px] text-[#505D56] space-y-1">
                      <div className="flex justify-between">
                        <span>Wall-Hung EWC &amp; Tank:</span>
                        <strong className="text-[#18211E]">₹{tier.ewcRate.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Wash Basin &amp; CP Tap:</span>
                        <strong className="text-[#18211E]">₹{tier.basinRate.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Rain Shower &amp; Diverter:</span>
                        <strong className="text-[#18211E]">₹{tier.showerRate.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Health Faucet &amp; Angle Cock:</span>
                        <strong className="text-[#18211E]">₹{tier.faucetRate.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#18211E]">{formatCurrency(tier.setRate)} / set</span>
                    <span className="font-mono font-bold text-[#183B32] text-[11px]">Total: {formatCurrency(totalCost)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Kitchen Sink & Piping Infrastructure Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 text-xs space-y-1">
              <span className="text-[10px] text-[#687770] uppercase font-bold block">Kitchen Sink</span>
              <span className="text-sm font-bold text-[#18211E] block">Franke / Nirali Double Bowl</span>
              <span className="text-[10.5px] text-[#505D56] block leading-tight">
                AISI 304 Grade (1.2mm thickness) stainless steel with integrated drainboard and swan-neck CP mixer tap.
              </span>
            </div>

            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 text-xs space-y-1">
              <span className="text-[10px] text-[#687770] uppercase font-bold block">Water Distribution</span>
              <span className="text-sm font-bold text-[#18211E] block">Astral / Supreme CPVC (SDR 11)</span>
              <span className="text-[10.5px] text-[#505D56] block leading-tight">
                High-pressure concealed hot and cold water pipelines with brass threaded transition fittings.
              </span>
            </div>

            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 text-xs space-y-1">
              <span className="text-[10px] text-[#687770] uppercase font-bold block">Soil &amp; Waste Lines</span>
              <span className="text-sm font-bold text-[#18211E] block">Prince / Supreme SWR PVC</span>
              <span className="text-[10.5px] text-[#505D56] block leading-tight">
                Self-lubricating rubber ring jointed 110mm / 75mm heavy soil and rainwater down-take pipes.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION C: WALL PAINTING ── */}
      {(activeTab === 'all' || activeTab === 'paint') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Paintbrush className="w-4 h-4 text-[#183B32]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#18211E]">
                  3. Interior &amp; Exterior Wall Painting
                </h3>
              </div>
              <p className="text-xs text-[#505D56] mt-0.5">
                Total Paintable Area: <strong>{quantities.totalPaintableAreaSqFt.toLocaleString('en-IN')} sq.ft</strong> &bull; Interior: <strong>{quantities.interiorPaintAreaSqFt.toLocaleString('en-IN')} sq.ft</strong> &bull; Exterior: <strong>{quantities.exteriorPaintAreaSqFt.toLocaleString('en-IN')} sq.ft</strong>
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F8F8F6] border border-[#CBD5CB] text-xs text-[#18211E] font-medium">
              <span className="text-[#687770]">Your Choice:</span>
              <strong className="text-[#183B32]">{currentInternalPaint}</strong>
            </div>
          </div>

          {/* Interior Paint Options Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#687770] block">
              1. Interior Wall Emulsion ({quantities.interiorPaintAreaSqFt.toLocaleString('en-IN')} sq.ft wall + ceiling)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {INTERIOR_PAINT_OPTIONS.map((opt) => {
                const isSelected = currentInternalPaint.includes(opt.id) || currentInternalPaint === opt.id;
                const totalCost = Math.round(opt.ratePerSqFt * quantities.interiorPaintAreaSqFt);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaintingSelection(opt.id, currentExternalPaint, 'Asian Paints')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                      isSelected
                        ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                        : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="w-10 h-10 rounded-xl shrink-0 border border-[#CBD5CB] shadow-2xs"
                          style={{ backgroundColor: opt.swatchColor }}
                        />
                        <div className="flex flex-col items-end gap-1">
                          {opt.badge && (
                            <span className="text-[9px] font-bold text-[#183B32] bg-[#B7CDBB] border border-[#B8D3C4] px-1.5 py-0.5 rounded-full uppercase">
                              {opt.badge}
                            </span>
                          )}
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-[#18211E] block line-clamp-1">{opt.name}</span>
                        <span className="text-[10px] font-mono text-[#C66B4E] font-bold block mt-0.5">{opt.sheen}</span>
                        <p className="text-[11px] text-[#505D56] line-clamp-2 mt-1 leading-tight">{opt.desc}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#18211E]">₹{opt.ratePerSqFt}/sqft</span>
                      <span className="font-mono font-bold text-[#183B32] text-[11px]">Total: {formatCurrency(totalCost)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exterior Paint Options Grid */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#687770] block">
              2. Exterior Weather-Proof Emulsion ({quantities.exteriorPaintAreaSqFt.toLocaleString('en-IN')} sq.ft exterior walls)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {EXTERIOR_PAINT_OPTIONS.map((opt) => {
                const isSelected = currentExternalPaint.includes(opt.id) || currentExternalPaint === opt.id;
                const totalCost = Math.round(opt.ratePerSqFt * quantities.exteriorPaintAreaSqFt);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaintingSelection(currentInternalPaint, opt.id, 'Asian Paints')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                      isSelected
                        ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                        : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="w-10 h-10 rounded-xl shrink-0 border border-[#CBD5CB] shadow-2xs"
                          style={{ backgroundColor: opt.swatchColor }}
                        />
                        <div className="flex flex-col items-end gap-1">
                          {opt.badge && (
                            <span className="text-[9px] font-bold text-[#183B32] bg-[#B7CDBB] border border-[#B8D3C4] px-1.5 py-0.5 rounded-full uppercase">
                              {opt.badge}
                            </span>
                          )}
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-[#18211E] block line-clamp-1">{opt.name}</span>
                        <span className="text-[10px] font-mono text-[#C66B4E] font-bold block mt-0.5">{opt.sheen}</span>
                        <p className="text-[11px] text-[#505D56] line-clamp-2 mt-1 leading-tight">{opt.desc}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#18211E]">₹{opt.ratePerSqFt}/sqft</span>
                      <span className="font-mono font-bold text-[#183B32] text-[11px]">Total: {formatCurrency(totalCost)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Undercoat Putty & Primer Preparation Highlights */}
          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
            <span>
              <strong>Surface Preparation Bed Included:</strong> 2 coats of Birla White / Asian Paints TruCare acrylic wall putty
              (~{quantities.puttyKg} kg) + 1 coat of water-based deep penetrating primer. Surfaces are mechanically sanded with 180/320 grit paper
              prior to double-coat paint application.
            </span>
          </div>
        </div>
      )}

      {/* ── SECTION D: RAILINGS, GATES & ELEVATION ── */}
      {(activeTab === 'all' || activeTab === 'fabrication' || activeTab === 'elevation') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#183B32]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#18211E]">
                  4. Staircase Railings, Balconies &amp; Driveway Gate
                </h3>
              </div>
              <p className="text-xs text-[#505D56] mt-0.5">
                Staircase &amp; balcony railings, driveway gate, tank ladders, and exterior façade cladding.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F8F8F6] border border-[#CBD5CB] text-xs text-[#18211E] font-medium">
              <span className="text-[#687770]">Gate Style:</span>
              <strong className="text-[#183B32]">{currentMainGate.split('(')[0].trim()}</strong>
            </div>
          </div>

          {/* D.1 Staircase Railing (if multi-floor) */}
          {(buildingModel.floors?.length || 1) > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#687770] block">
                  1. Staircase Railing ({((buildingModel.floors?.length || 1) - 1) * 24} Rft • {(buildingModel.floors?.length || 1) - 1} Upper Flight(s))
                </span>
                <span className="text-[10.5px] text-[#183B32] font-medium">AISI SS 304 or MS Fabricated</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {STAIRCASE_RAILING_OPTIONS.map((opt) => {
                  const isSelected = currentStaircaseRailing.includes(opt.id) || currentStaircaseRailing === opt.id;
                  const totalCost = opt.rate * (((buildingModel.floors?.length || 1) - 1) * 24);

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFabricationSelection({ staircaseRailing: opt.id })}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                        isSelected
                          ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                          : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-[#18211E] block line-clamp-1">{opt.name}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-[#505D56] leading-tight">{opt.desc}</p>
                        <span className="text-[10px] text-[#687770] block leading-tight">{opt.spec}</span>
                      </div>

                      <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-[#18211E]">₹{opt.rate}/Rft</span>
                        <span className="font-mono font-bold text-[#183B32] text-[11px]">Total: {formatCurrency(totalCost)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* D.2 Balcony Railing */}
          {(store.rooms.balcony || 0) > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#687770] block">
                  2. Balcony Protective Railing ({(store.rooms.balcony || 0) * 12} Rft • {store.rooms.balcony} Balconies)
                </span>
                <span className="text-[10.5px] text-[#183B32] font-medium">Toughened Glass / CNC MS Grille</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {BALCONY_RAILING_OPTIONS.map((opt) => {
                  const isSelected = currentBalconyRailing.includes(opt.id) || currentBalconyRailing === opt.id;
                  const totalCost = opt.rate * ((store.rooms.balcony || 0) * 12);

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFabricationSelection({ balconyRailing: opt.id })}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                        isSelected
                          ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                          : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-[#18211E] block line-clamp-1">{opt.name}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-[#505D56] leading-tight">{opt.desc}</p>
                        <span className="text-[10px] text-[#687770] block leading-tight">{opt.spec}</span>
                      </div>

                      <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-[#18211E]">₹{opt.rate}/Rft</span>
                        <span className="font-mono font-bold text-[#183B32] text-[11px]">Total: {formatCurrency(totalCost)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* D.3 Main Driveway Compound Gate */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#687770] block">
                3. Main Driveway Compound Gate (60 sq.ft • 10 ft × 6 ft Driveway Gate)
              </span>
              <span className="text-[10.5px] text-[#183B32] font-medium">Sliding / Dual Swing Gate</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {MAIN_GATE_OPTIONS.map((opt) => {
                const isSelected = currentMainGate.includes(opt.id) || currentMainGate === opt.id;
                const totalCost = opt.rate * 60;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFabricationSelection({ mainGate: opt.id })}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                      isSelected
                        ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                        : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-[#18211E] block line-clamp-1">{opt.name}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#505D56] leading-tight">{opt.desc}</p>
                      <span className="text-[10px] text-[#687770] block leading-tight">{opt.spec}</span>
                    </div>

                    <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#18211E]">₹{opt.rate}/sqft</span>
                      <span className="font-mono font-bold text-[#183B32] text-[11px]">Total: {formatCurrency(totalCost)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* D.4 Exterior Architectural Cladding & Elevation */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#687770] block">
                4. Front Façade Architectural Elevation &amp; Cladding (180 sq.ft Feature Wall)
              </span>
              <span className="text-[10.5px] text-[#183B32] font-medium">HPL / Stone Veneer / Texture Louvers</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ELEVATION_CLADDING_OPTIONS.map((opt) => {
                const isSelected = currentElevationCladding.includes(opt.id) || currentElevationCladding === opt.id;
                const totalCost = opt.rate * 180;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFabricationSelection({ elevationCladding: opt.id })}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                      isSelected
                        ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                        : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-[#18211E] block line-clamp-1">{opt.name}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#505D56] leading-tight">{opt.desc}</p>
                      <span className="text-[10px] text-[#687770] block leading-tight">{opt.spec}</span>
                    </div>

                    <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#18211E]">₹{opt.rate}/sqft</span>
                      <span className="font-mono font-bold text-[#183B32] text-[11px]">Total: {formatCurrency(totalCost)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* D.5 Ancillary Fabrication Inclusions (Terrace Railing, OHT Cat Ladder, Skylight) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 text-xs space-y-1">
              <span className="text-[10px] text-[#687770] uppercase font-bold block">Terrace Parapet Safety Railing</span>
              <span className="text-sm font-bold text-[#18211E] block">45 Rft Extension Railing</span>
              <span className="text-[10.5px] text-[#505D56] block leading-tight">
                3-tier horizontal MS tubular safety rail anchored on terrace slab perimeter (₹450/Rft = ₹20,250).
              </span>
            </div>

            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 text-xs space-y-1">
              <span className="text-[10px] text-[#687770] uppercase font-bold block">Overhead Tank Access Ladder</span>
              <span className="text-sm font-bold text-[#18211E] block">15 ft GI / MS Safety Cat Ladder</span>
              <span className="text-[10.5px] text-[#505D56] block leading-tight">
                Hot-dip galvanized vertical safety rung ladder anchored to RCC headroom wall for OHT maintenance (₹9,500).
              </span>
            </div>

            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 text-xs space-y-1">
              <span className="text-[10px] text-[#687770] uppercase font-bold block">Balcony French Sliding Door</span>
              <span className="text-sm font-bold text-[#18211E] block">2.5-Track Aluminium / UPVC</span>
              <span className="text-[10.5px] text-[#505D56] block leading-tight">
                {(store.rooms.balcony || 0) > 0
                  ? `${store.rooms.balcony} Nos × 35 sq.ft sliding doors with 6mm toughened glass & SS mesh included.`
                  : 'Configured automatically when balconies are added in Chapter 2.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION E: SERVICES & FINISHES COST BREAKDOWN ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs border-b border-[#CBD5CB] pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#183B32]" />
            <span className="font-bold text-[#18211E]">
              Fittings &amp; Finishes Cost Summary: {formatCurrency(finishesTotalINR)}
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
          <div className="overflow-x-auto border border-[#CBD5CB] rounded-xl bg-[#FDFDFD]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F8F6] border-b border-[#CBD5CB] text-[#687770]">
                  <th className="py-2.5 px-3 font-bold uppercase text-[10px]">Code</th>
                  <th className="py-2.5 px-3 font-bold uppercase text-[10px]">Description</th>
                  <th className="py-2.5 px-3 font-bold uppercase text-[10px]">Specification</th>
                  <th className="py-2.5 px-3 font-bold uppercase text-[10px] text-right">Qty</th>
                  <th className="py-2.5 px-3 font-bold uppercase text-[10px] text-center">Unit</th>
                  <th className="py-2.5 px-3 font-bold uppercase text-[10px] text-right">Rate</th>
                  <th className="py-2.5 px-3 font-bold uppercase text-[10px] text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD5CB]/50">
                {finishesBOQ.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-xs text-[#66716B]">
                      No services or finish lines generated yet. Configure plot and room spaces in Chapters 1 &amp; 2.
                    </td>
                  </tr>
                ) : (
                  finishesBOQ.map((item, idx) => (
                    <tr key={`${item.code}-${idx}`} className="hover:bg-white/80">
                      <td className="py-2 px-3 font-mono font-bold text-[#183B32]">{item.code}</td>
                      <td className="py-2 px-3 text-[#18211E] font-medium">{item.description}</td>
                      <td className="py-2 px-3 text-[#505D56] text-[11px]">{item.brand || item.remarks || 'Standard'}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#18211E]">
                        {typeof item.quantity === 'number' ? item.quantity.toLocaleString('en-IN') : item.quantity}
                      </td>
                      <td className="py-2 px-3 text-center text-[#687770] text-[11px]">{item.unit}</td>
                      <td className="py-2 px-3 text-right font-mono text-[#505D56]">
                        ₹{item.unitRate.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#18211E]">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-[#E8EFE9] border-t-2 border-[#183B32] font-bold text-xs text-[#18211E]">
                  <td colSpan={6} className="py-2.5 px-3 text-right uppercase tracking-wider">
                    Total Electrical, Plumbing &amp; Painting Subtotal:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-[#183B32]">
                    {formatCurrency(finishesTotalINR)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-[11px] text-[#505D56]">
            Total estimate for wiring, switches, water supply, bathroom sanitaryware, wall painting, and railings is <strong>{formatCurrency(finishesTotalINR)}</strong>. Click above to view individual item rates.
          </p>
        )}
      </div>

      {/* ── SECTION F: HONEST QUANTITY PROMISE ── */}
      <div className="p-4 rounded-2xl bg-[#E8EFE9]/70 border border-[#B7CDBB] text-xs text-[#183B32] space-y-1.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C66B4E] shrink-0" />
          <span className="font-bold text-[#183B32] uppercase tracking-wider text-[11px]">
            Transparent Quantity Guarantee
          </span>
        </div>
        <p className="text-[11.5px] text-[#2C4A3E] leading-relaxed">
          Wiring points, pipe lengths, sanitary counts, and paintable wall areas are calculated directly from your floor plan. Choosing Schneider switches or Asian Paints Royale updates material rates instantly, while physical points and wall areas stay 100% accurate.
        </p>
      </div>
    </div>
  );
};
