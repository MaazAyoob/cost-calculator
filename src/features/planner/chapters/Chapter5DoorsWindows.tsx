import React, { useState, useMemo } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import {
  useBuildingModel,
  useQuantities,
  useBOQ,
  useBudgetResult,
  useDoorSchedule,
  useWindowSchedule,
} from '../../../store/useCalculationStore';
import {
  DoorClosed,
  Maximize2,
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
} from 'lucide-react';
import { formatCurrency } from '../../../utils/cn';
import { BOQItem } from '../../../calculation-engine/types';

export interface DoorOption {
  id: string;
  name: string;
  category: 'Main Entrance' | 'Internal' | 'Bathroom';
  material: string;
  hardware: string;
  unitRate: number;
  desc: string;
  swatchType: 'burma-teak' | 'african-teak' | 'laminate' | 'flush' | 'wpc' | 'frp';
  badge?: string;
}

export interface WindowOption {
  id: string;
  name: string;
  primaryMaterial: 'uPVC' | 'Aluminium' | 'Wood';
  subGrade: string;
  unitRate: number; // ₹/sq.ft
  desc: string;
  swatchType: 'upvc' | 'aluminium' | 'wood';
  features: string[];
  badge?: string;
}

export const MAIN_DOOR_OPTIONS: DoorOption[] = [
  {
    id: 'Burma Teak Custom Carved',
    name: 'Solid Burma Teak (Carved)',
    category: 'Main Entrance',
    material: 'Grade-A 100% Solid Burma Teak Wood',
    hardware: 'Heavy Brass Handles, Multi-Point Lock & Digital Lock Provision',
    unitRate: 145000,
    desc: 'Exquisite hand-carved solid Burma teak, double-thick frame with heritage brass fittings and anti-pick security lock.',
    swatchType: 'burma-teak',
    badge: 'Luxury Handcrafted',
  },
  {
    id: 'Premium Teak',
    name: 'African Teak Wood (Panelled)',
    category: 'Main Entrance',
    material: 'Kiln-Dried African Teak Hardwood',
    hardware: 'Heavy Brass Mortise Lock, SS Tower Bolts, Magic Eye',
    unitRate: 65000,
    desc: 'Hutty Standard Baseline. Seasoned African teak with elegant 6-panel design, natural polyurethane polish and heavy brass fittings.',
    swatchType: 'african-teak',
    badge: 'Hutty Recommended',
  },
  {
    id: 'Normal Teak',
    name: 'Standard Teak Polish Door',
    category: 'Main Entrance',
    material: 'Seasoned Plantation Teak Wood',
    hardware: 'Stainless Steel Mortise Lockset & Hinges',
    unitRate: 42000,
    desc: 'Classic plantation teak frame with solid teak shutters, finished with satin melamine wood polish.',
    swatchType: 'african-teak',
  },
];

export const INTERNAL_DOOR_OPTIONS: DoorOption[] = [
  {
    id: 'Laminate Door',
    name: 'Factory-Pressed Laminate Door',
    category: 'Internal',
    material: 'Boiling Water Proof (BWP) Core + 1mm Merino/Greenlam Laminate',
    hardware: 'Godrej / Yale SS 304 Mortise Lock + 3 SS Ball-Bearing Hinges',
    unitRate: 16500,
    desc: 'Factory hot-pressed high-pressure decorative laminate on solid wood filler core. Scratch-proof, easy to wipe clean, zero warping.',
    swatchType: 'laminate',
    badge: 'Hutty Recommended',
  },
  {
    id: 'Flush Door',
    name: 'Standard BWP Flush Door',
    category: 'Internal',
    material: 'Commercial BWP Flush Shutter + Hardwood Frame',
    hardware: 'Standard Mortise Lock & SS Hinges',
    unitRate: 12500,
    desc: 'Hutty Standard Baseline. High-density solid core flush door ready for enamel painting or polyurethane wood stain.',
    swatchType: 'flush',
    badge: 'Standard Baseline',
  },
];

export const BATHROOM_DOOR_OPTIONS: DoorOption[] = [
  {
    id: 'WPC Door',
    name: 'Waterproof WPC Composite Door',
    category: 'Bathroom',
    material: '100% Solid Wood Polymer Composite (WPC)',
    hardware: 'Corrosion-Resistant SS Privacy Latch & Hinges',
    unitRate: 11000,
    desc: 'Hutty Standard Baseline. 100% waterproof, rot-proof, termite-resistant WPC polymer frame and shutter. Zero swelling in steam.',
    swatchType: 'wpc',
    badge: 'Hutty Recommended',
  },
  {
    id: 'FRP / WPC Laminated',
    name: 'Designer Laminated WPC Door',
    category: 'Bathroom',
    material: 'High-Density WPC Core with Textured Waterproof Laminate',
    hardware: 'Premium SS 304 Cylindrical Lock with Indicator',
    unitRate: 13500,
    desc: 'Waterproof composite door wrapped in woodgrain textured laminate that matches your bedroom interior doors seamlessly.',
    swatchType: 'laminate',
    badge: 'Seamless Design',
  },
  {
    id: 'FRP / ERP Door',
    name: 'Fiber Reinforced Polymer (FRP)',
    category: 'Bathroom',
    material: 'Heavy-Duty Molded FRP Resin Shutter',
    hardware: 'Standard SS Privacy Latch',
    unitRate: 8500,
    desc: 'Molded fiber-reinforced polymer door with embossed panel design. Highly cost-effective and impervious to continuous wet conditions.',
    swatchType: 'frp',
  },
];

export const WINDOW_OPTIONS: WindowOption[] = [
  {
    id: 'Standard uPVC',
    name: 'uPVC 2.5-Track Sliding Windows',
    primaryMaterial: 'uPVC',
    subGrade: 'Standard uPVC',
    unitRate: 550,
    desc: 'High-impact multi-chamber uPVC profiles with 5mm clear float glass and smooth nylon rollers.',
    swatchType: 'upvc',
    features: ['5mm Float Glass', 'Weather Seals', 'EPDM Gaskets'],
  },
  {
    id: 'Luxury / Fenesta uPVC',
    name: 'Fenesta / German Profile uPVC',
    primaryMaterial: 'uPVC',
    subGrade: 'Luxury / Fenesta uPVC',
    unitRate: 850,
    desc: 'Hutty Recommended. 3-track acoustic dampening uPVC with integrated 304-grade stainless steel insect mesh and multi-point touch locks.',
    swatchType: 'upvc',
    features: ['Integrated SS Mosquito Mesh', 'Acoustic Sound Insulation', 'Multi-Point Security Locks'],
    badge: 'Hutty Recommended',
  },
  {
    id: 'Powder Coated Jindal Aluminium',
    name: 'Architectural Powder-Coated Aluminium',
    primaryMaterial: 'Aluminium',
    subGrade: 'Powder Coated Jindal Aluminium',
    unitRate: 620,
    desc: 'Sleek Jindal 27mm series aluminium with architectural matte charcoal powder coating and toughened glass.',
    swatchType: 'aluminium',
    features: ['Matte Charcoal Powder Coat', 'Slim Sightlines', 'Toughened 5mm Glass'],
  },
  {
    id: 'Anodized Aluminium',
    name: 'Anodized Aluminium Sliding',
    primaryMaterial: 'Aluminium',
    subGrade: 'Anodized Aluminium',
    unitRate: 480,
    desc: 'Silver/bronze electro-anodized aluminium sliding frames with standard interlocking jambs.',
    swatchType: 'aluminium',
    features: ['Electro-Anodized Finish', 'Corrosion Proof', 'Economical Choice'],
  },
  {
    id: 'Teak Wood Frame',
    name: 'First Quality Teak Wood Windows',
    primaryMaterial: 'Wood',
    subGrade: 'Teak Wood Frame',
    unitRate: 950,
    desc: 'Traditional seasoned teak wood casement window with beveled clear glass and hand-polished brass tower bolts.',
    swatchType: 'wood',
    features: ['Polished Natural Teak', 'Heavy Brass Fasteners', 'Traditional Heritage Aesthetic'],
  },
];

interface Chapter5DoorsWindowsProps {
  embedded?: boolean;
}

export const Chapter5DoorsWindows: React.FC<Chapter5DoorsWindowsProps> = ({ embedded = false }) => {
  const store = useWizardStore();
  const quantities = useQuantities();
  const boq = useBOQ();
  const budget = useBudgetResult();
  const buildingModel = useBuildingModel();
  const doorSchedule = useDoorSchedule();
  const windowSchedule = useWindowSchedule();

  const {
    doors,
    windows,
    spaceDoorOverrides,
    spaceWindowOverrides,
    setDoorSelection,
    setWindowSelection,
    setSpaceDoor,
    clearSpaceDoorOverride,
    applyDoorToSimilarSpaces,
    setSpaceWindow,
    applyWindowToAllRooms,
  } = store;

  const [activeTab, setActiveTab] = useState<'all' | 'main' | 'rooms' | 'bathrooms' | 'windows'>('all');
  const [showBOQBreakdown, setShowBOQBreakdown] = useState<boolean>(true);

  // Group spaces from canonical Building Model
  const allSpaces = buildingModel.allSpaces || [];

  const mainEntranceSpaces = useMemo(() => {
    return allSpaces.filter((s) => (s.type as string) === 'living' || (s.type as string) === 'foyer');
  }, [allSpaces]);

  const bedroomAndEnclosedSpaces = useMemo(() => {
    return allSpaces.filter((s) => {
      const t = (s.type as string).toLowerCase();
      return (
        t.includes('bed') ||
        t.includes('office') ||
        t.includes('pooja') ||
        t.includes('study') ||
        t.includes('utility') ||
        t.includes('store')
      );
    });
  }, [allSpaces]);

  const bathroomSpaces = useMemo(() => {
    return allSpaces.filter((s) => {
      const t = (s.type as string).toLowerCase();
      return t.includes('bath') || t.includes('toilet');
    });
  }, [allSpaces]);

  // Active Main Door selection
  const currentMainDoor = doors.mainDoor || 'Premium Teak';
  const currentInternalDoor = doors.internalDoor || 'Flush Door';
  const currentBathroomDoor = doors.bathroomDoor || 'WPC Door';
  const currentWindowMaterial = windows.primaryMaterial || 'uPVC';
  const currentWindowSubGrade = windows.subGrade || 'Luxury / Fenesta uPVC';

  // Filter Doors & Joinery (DJ) and Windows & Glazing (WG) items from BOQ
  const doorsAndWindowsBOQ = useMemo(() => {
    return boq.filter(
      (item) =>
        item.code.startsWith('DJ') ||
        item.code.startsWith('WG') ||
        item.category === 'Doors & Joinery' ||
        item.category === 'Windows & Glazing'
    );
  }, [boq]);

  const doorsAndWindowsTotalINR = useMemo(() => {
    return doorsAndWindowsBOQ.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [doorsAndWindowsBOQ]);

  // Render authentic procedural swatches
  const renderDoorSwatch = (swatchType: string, isSelected: boolean) => {
    switch (swatchType) {
      case 'burma-teak':
        return (
          <div
            className={`w-10 h-10 rounded-xl shrink-0 border relative overflow-hidden shadow-2xs ${
              isSelected ? 'border-[#C66B4E] ring-2 ring-[#C66B4E]/40' : 'border-[#CBD5CB]'
            }`}
            style={{
              background: 'linear-gradient(135deg, #4A2E18 0%, #784421 50%, #3D1E0E 100%)',
            }}
          >
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:6px_6px]" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-amber-950/40" />
          </div>
        );
      case 'african-teak':
        return (
          <div
            className={`w-10 h-10 rounded-xl shrink-0 border relative overflow-hidden shadow-2xs ${
              isSelected ? 'border-[#C66B4E] ring-2 ring-[#C66B4E]/40' : 'border-[#CBD5CB]'
            }`}
            style={{
              background: 'linear-gradient(135deg, #8B5A2B 0%, #A06535 50%, #6E3D19 100%)',
            }}
          >
            <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,#000_0,#000_1px,transparent_0,transparent_4px)]" />
          </div>
        );
      case 'laminate':
        return (
          <div
            className={`w-10 h-10 rounded-xl shrink-0 border relative overflow-hidden shadow-2xs ${
              isSelected ? 'border-[#183B32] ring-2 ring-[#183B32]/30' : 'border-[#CBD5CB]'
            }`}
            style={{
              background: 'linear-gradient(135deg, #C2B299 0%, #DDD1BC 50%, #AA987C 100%)',
            }}
          >
            <div className="absolute inset-x-2 top-2 bottom-2 border border-stone-600/20 rounded-md" />
          </div>
        );
      case 'wpc':
        return (
          <div
            className={`w-10 h-10 rounded-xl shrink-0 border relative overflow-hidden shadow-2xs ${
              isSelected ? 'border-[#183B32] ring-2 ring-[#183B32]/30' : 'border-[#CBD5CB]'
            }`}
            style={{
              background: 'linear-gradient(135deg, #374151 0%, #4B5563 50%, #1F2937 100%)',
            }}
          >
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#9CA3AF_1px,transparent_1px)] [background-size:4px_4px]" />
          </div>
        );
      case 'frp':
        return (
          <div
            className={`w-10 h-10 rounded-xl shrink-0 border relative overflow-hidden shadow-2xs ${
              isSelected ? 'border-[#183B32] ring-2 ring-[#183B32]/30' : 'border-[#CBD5CB]'
            }`}
            style={{
              background: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 50%, #4B5563 100%)',
            }}
          />
        );
      case 'flush':
      default:
        return (
          <div
            className={`w-10 h-10 rounded-xl shrink-0 border relative overflow-hidden shadow-2xs ${
              isSelected ? 'border-[#183B32] ring-2 ring-[#183B32]/30' : 'border-[#CBD5CB]'
            }`}
            style={{
              background: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 50%, #9CA3AF 100%)',
            }}
          />
        );
    }
  };

  const renderWindowSwatch = (swatchType: string, isSelected: boolean) => {
    switch (swatchType) {
      case 'upvc':
        return (
          <div
            className={`w-10 h-10 rounded-xl shrink-0 border relative overflow-hidden shadow-2xs ${
              isSelected ? 'border-[#183B32] ring-2 ring-[#183B32]/30' : 'border-[#CBD5CB]'
            }`}
            style={{
              background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 50%, #D1D5DB 100%)',
            }}
          >
            <div className="absolute inset-1.5 border border-cyan-500/40 rounded bg-cyan-100/30 backdrop-blur-2xs" />
          </div>
        );
      case 'aluminium':
        return (
          <div
            className={`w-10 h-10 rounded-xl shrink-0 border relative overflow-hidden shadow-2xs ${
              isSelected ? 'border-[#183B32] ring-2 ring-[#183B32]/30' : 'border-[#CBD5CB]'
            }`}
            style={{
              background: 'linear-gradient(135deg, #374151 0%, #1F2937 70%, #111827 100%)',
            }}
          >
            <div className="absolute inset-1.5 border border-slate-500/50 rounded bg-slate-800/40" />
          </div>
        );
      case 'wood':
        return (
          <div
            className={`w-10 h-10 rounded-xl shrink-0 border relative overflow-hidden shadow-2xs ${
              isSelected ? 'border-[#C66B4E] ring-2 ring-[#C66B4E]/40' : 'border-[#CBD5CB]'
            }`}
            style={{
              background: 'linear-gradient(135deg, #784421 0%, #5B2C11 100%)',
            }}
          >
            <div className="absolute inset-1.5 border border-amber-300/40 rounded bg-amber-500/10" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      {/* ── CHAPTER HEADER & KPI BADGES ── */}
      <div className="space-y-3 border-b border-[#CBD5CB] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-xs font-bold text-[#183B32]">
            <DoorClosed className="w-3.5 h-3.5 text-[#C66B4E]" />
            <span>STEP 5 OF 7 &bull; DOORS &amp; WINDOWS</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#505D56] hidden sm:inline">Estimated Budget:</span>
            <span className="text-sm sm:text-base font-mono font-bold text-[#183B32] bg-[#E8EFE9] px-3 py-1 rounded-xl border border-[#B7CDBB]">
              {formatCurrency(doorsAndWindowsTotalINR)}
            </span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
          Choose your doors and windows.
        </h2>
        <p className="text-xs sm:text-sm text-[#505D56] leading-relaxed max-w-3xl">
          Pick a grand entrance door, smooth interior room doors, waterproof bathroom doors, and soundproof windows.
          All wall cutouts and counts are automatically calculated from your room layout.
        </p>

        {/* Real-time KPI Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="p-3 rounded-2xl bg-white border border-[#CBD5CB] shadow-2xs space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#687770]">Total Doors</span>
              <DoorClosed className="w-3.5 h-3.5 text-[#183B32]" />
            </div>
            <div className="text-lg font-mono font-extrabold text-[#18211E]">
              {quantities.totalDoorsCount} <span className="text-xs font-normal text-[#687770]">Sets</span>
            </div>
            <div className="text-[10px] text-[#505D56] line-clamp-1">
              {quantities.mainDoorsCount} Main &bull; {quantities.internalDoorsCount} Rooms &bull; {quantities.bathroomDoorsCount} Bath
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#CBD5CB] shadow-2xs space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#687770]">Total Windows</span>
              <Maximize2 className="w-3.5 h-3.5 text-[#183B32]" />
            </div>
            <div className="text-lg font-mono font-extrabold text-[#18211E]">
              {quantities.windowsCount} <span className="text-xs font-normal text-[#687770]">Sets</span>
            </div>
            <div className="text-[10px] text-[#505D56] line-clamp-1">
              ~{quantities.windowAreaSqFt} sq.ft glass area
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#CBD5CB] shadow-2xs space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#687770]">Safety Grills</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#C66B4E]" />
            </div>
            <div className="text-lg font-mono font-extrabold text-[#18211E]">
              {quantities.grillAreaSqFt} <span className="text-xs font-normal text-[#687770]">sq.ft</span>
            </div>
            <div className="text-[10px] text-[#505D56] line-clamp-1">
              Solid steel bars with anti-rust paint
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#CBD5CB] shadow-2xs space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#687770]">Locksets &amp; Handles</span>
              <Sparkles className="w-3.5 h-3.5 text-[#183B32]" />
            </div>
            <div className="text-lg font-mono font-extrabold text-[#18211E]">
              {quantities.internalDoorsCount} <span className="text-xs font-normal text-[#687770]">Sets</span>
            </div>
            <div className="text-[10px] text-[#505D56] line-clamp-1">
              Stainless steel mortise locks included
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FILTER TABS                                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#CBD5CB]">
        {[
          { id: 'all', label: 'All Openings', icon: Grid },
          { id: 'main', label: 'Main Entrance Door', icon: DoorClosed },
          { id: 'rooms', label: 'Bedrooms & Internal', icon: Bed },
          { id: 'bathrooms', label: 'Waterproof Bathroom Doors', icon: Bath },
          { id: 'windows', label: 'Windows & Glazing', icon: Maximize2 },
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

      {/* ── SECTION A: MAIN ENTRANCE GRAND DOOR ── */}
      {(activeTab === 'all' || activeTab === 'main') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <DoorClosed className="w-4 h-4 text-[#183B32]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#18211E]">
                  1. Main Entrance Door
                </h3>
              </div>
              <p className="text-xs text-[#505D56] mt-0.5">
                Standard Size: <strong>4.0 × 7.0 ft</strong> &bull; Total Needed: <strong>{quantities.mainDoorsCount} Set(s)</strong>
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F8F8F6] border border-[#CBD5CB] text-xs text-[#18211E] font-medium">
              <span className="text-[#687770]">Your Choice:</span>
              <strong className="text-[#183B32]">{currentMainDoor}</strong>
            </div>
          </div>

          {/* Main Door Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MAIN_DOOR_OPTIONS.map((opt) => {
              const isSelected = currentMainDoor.includes(opt.id) || currentMainDoor === opt.id;
              const totalCost = opt.unitRate * quantities.mainDoorsCount;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDoorSelection('mainDoor', opt.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                    isSelected
                      ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                      : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      {renderDoorSwatch(opt.swatchType, isSelected)}
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
                      <span className="text-[10px] font-mono text-[#C66B4E] font-bold block mt-0.5">{opt.material}</span>
                      <p className="text-[11px] text-[#505D56] line-clamp-2 mt-1 leading-tight">{opt.desc}</p>
                    </div>

                    <div className="p-2 rounded-lg bg-white/70 border border-[#CBD5CB]/50 text-[10px] text-[#505D56] space-y-0.5">
                      <span className="font-bold text-[#18211E] block">Hardware Inclusions:</span>
                      <span className="block line-clamp-2">{opt.hardware}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#18211E]">{formatCurrency(opt.unitRate)} / set</span>
                    <span className="font-mono font-bold text-[#183B32] text-[11px]">Total: {formatCurrency(totalCost)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 text-xs text-[#505D56] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
            <span>
              <strong>Main Door Package Includes:</strong> Solid 5-inch × 3-inch plantation teak frame, heavy solid shutter (35mm thickness),
              heavy brass designer pull handles, brass hinges, magnetic door-stop, and multi-lever high security mortise lock with dual keys.
            </span>
          </div>
        </div>
      )}

      {/* ── SECTION B: BEDROOM & INTERIOR ROOM DOORS ── */}
      {(activeTab === 'all' || activeTab === 'rooms') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-[#183B32]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#18211E]">
                  2. Bedroom &amp; Interior Room Doors
                </h3>
              </div>
              <p className="text-xs text-[#505D56] mt-0.5">
                Standard Size: <strong>3.0 × 7.0 ft</strong> &bull; Total Needed: <strong>{quantities.internalDoorsCount} Set(s)</strong>
                {store.floors > 1 && ' (includes terrace door)'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => applyDoorToSimilarSpaces('internalDoor', currentInternalDoor)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8EFE9] border border-[#B7CDBB] text-[#183B32] text-xs font-bold hover:bg-[#DDF0E5] transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
              title="Apply this door specification across all configured bedrooms and study rooms"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C66B4E]" />
              <span>Apply &quot;{currentInternalDoor}&quot; to all bedrooms</span>
            </button>
          </div>

          {/* Primary Specification Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {INTERNAL_DOOR_OPTIONS.map((opt) => {
              const isSelected = currentInternalDoor.includes(opt.id) || currentInternalDoor === opt.id;
              const totalCost = opt.unitRate * quantities.internalDoorsCount;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDoorSelection('internalDoor', opt.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                    isSelected
                      ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                      : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      {renderDoorSwatch(opt.swatchType, isSelected)}
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
                      <span className="text-[10px] font-mono text-[#C66B4E] font-bold block mt-0.5">{opt.material}</span>
                      <p className="text-[11px] text-[#505D56] line-clamp-2 mt-1 leading-tight">{opt.desc}</p>
                    </div>

                    <div className="p-2 rounded-lg bg-white/70 border border-[#CBD5CB]/50 text-[10px] text-[#505D56] space-y-0.5">
                      <span className="font-bold text-[#18211E] block">Lockset &amp; Joinery:</span>
                      <span className="block line-clamp-2">{opt.hardware}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#18211E]">{formatCurrency(opt.unitRate)} / set</span>
                    <span className="font-mono font-bold text-[#183B32] text-[11px]">Total: {formatCurrency(totalCost)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Space-by-Space Room Cards for Bedrooms, Office, Pooja */}
          {bedroomAndEnclosedSpaces.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#687770] block">
                Individual Room Doors ({bedroomAndEnclosedSpaces.length} Configured Rooms)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {bedroomAndEnclosedSpaces.map((space) => {
                  const isOverridden = Boolean(spaceDoorOverrides[space.id]);
                  const activeDoor = spaceDoorOverrides[space.id] || currentInternalDoor;

                  return (
                    <div
                      key={space.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isOverridden
                          ? 'border-[#C66B4E] bg-amber-50/40 ring-1 ring-[#C66B4E]/20'
                          : 'border-[#CBD5CB] bg-[#FDFDFD]'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-[#CBD5CB]/50 pb-1.5">
                        <span className="font-bold text-[#18211E] text-xs">{space.name}</span>
                        <span className="text-[10px] font-mono text-[#687770] bg-white px-1.5 py-0.5 rounded border border-[#CBD5CB]">
                          {space.floorName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 text-xs">
                        <div>
                          <span className="text-[10px] text-[#687770] block">Opening: 3.0×7.0 ft</span>
                          <span className="font-bold text-[#183B32] text-[11px]">{activeDoor}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isOverridden && (
                            <button
                              type="button"
                              onClick={() => clearSpaceDoorOverride(space.id)}
                              className="text-[10px] text-[#687770] hover:text-rose-700 underline cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                          <select
                            value={activeDoor}
                            onChange={(e) => setSpaceDoor(space.id, e.target.value, 'internalDoor')}
                            className="text-[11px] bg-white border border-[#CBD5CB] rounded-lg px-2 py-1 text-[#18211E] font-medium cursor-pointer"
                          >
                            {INTERNAL_DOOR_OPTIONS.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name.split(' ')[0]} (₹{d.unitRate / 1000}k)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SECTION C: WATERPROOF BATHROOM DOORS ── */}
      {(activeTab === 'all' || activeTab === 'bathrooms') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-[#183B32]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#18211E]">
                  3. Waterproof Bathroom Doors
                </h3>
              </div>
              <p className="text-xs text-[#505D56] mt-0.5">
                Standard Size: <strong>2.5 × 7.0 ft</strong> &bull; Total Needed: <strong>{quantities.bathroomDoorsCount} Set(s)</strong> (Rot-proof &amp; 100% steam resistant)
              </p>
            </div>

            <button
              type="button"
              onClick={() => applyDoorToSimilarSpaces('bathroomDoor', currentBathroomDoor)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8EFE9] border border-[#B7CDBB] text-[#183B32] text-xs font-bold hover:bg-[#DDF0E5] transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
              title="Apply this door specification across all configured bathrooms and toilets"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C66B4E]" />
              <span>Apply &quot;{currentBathroomDoor}&quot; to all bathrooms</span>
            </button>
          </div>

          {/* Bathroom Door Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {BATHROOM_DOOR_OPTIONS.map((opt) => {
              const isSelected = currentBathroomDoor.includes(opt.id) || currentBathroomDoor === opt.id;
              const totalCost = opt.unitRate * quantities.bathroomDoorsCount;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDoorSelection('bathroomDoor', opt.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                    isSelected
                      ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                      : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      {renderDoorSwatch(opt.swatchType, isSelected)}
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
                      <span className="text-[10px] font-mono text-[#C66B4E] font-bold block mt-0.5">{opt.material}</span>
                      <p className="text-[11px] text-[#505D56] line-clamp-2 mt-1 leading-tight">{opt.desc}</p>
                    </div>

                    <div className="p-2 rounded-lg bg-white/70 border border-[#CBD5CB]/50 text-[10px] text-[#505D56] space-y-0.5">
                      <span className="font-bold text-[#18211E] block">Wet Area Hardware:</span>
                      <span className="block line-clamp-2">{opt.hardware}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#18211E]">{formatCurrency(opt.unitRate)} / set</span>
                    <span className="font-mono font-bold text-[#183B32] text-[11px]">Total: {formatCurrency(totalCost)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bathroom Space-by-Space Cards */}
          {bathroomSpaces.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#687770] block">
                Bathroom Doors ({bathroomSpaces.length} Configured Bathrooms)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {bathroomSpaces.map((space) => {
                  const isOverridden = Boolean(spaceDoorOverrides[space.id]);
                  const activeDoor = spaceDoorOverrides[space.id] || currentBathroomDoor;

                  return (
                    <div
                      key={space.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isOverridden
                          ? 'border-[#C66B4E] bg-amber-50/40 ring-1 ring-[#C66B4E]/20'
                          : 'border-[#CBD5CB] bg-[#FDFDFD]'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-[#CBD5CB]/50 pb-1.5">
                        <span className="font-bold text-[#18211E] text-xs">{space.name}</span>
                        <span className="text-[10px] font-mono text-[#687770] bg-white px-1.5 py-0.5 rounded border border-[#CBD5CB]">
                          {space.floorName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 text-xs">
                        <div>
                          <span className="text-[10px] text-[#687770] block">Opening: 2.5×7.0 ft</span>
                          <span className="font-bold text-[#183B32] text-[11px]">{activeDoor}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isOverridden && (
                            <button
                              type="button"
                              onClick={() => clearSpaceDoorOverride(space.id)}
                              className="text-[10px] text-[#687770] hover:text-rose-700 underline cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                          <select
                            value={activeDoor}
                            onChange={(e) => setSpaceDoor(space.id, e.target.value, 'bathroomDoor')}
                            className="text-[11px] bg-white border border-[#CBD5CB] rounded-lg px-2 py-1 text-[#18211E] font-medium cursor-pointer"
                          >
                            {BATHROOM_DOOR_OPTIONS.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name.split(' ')[0]} (₹{d.unitRate / 1000}k)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SECTION D: WINDOWS & SAFETY GRILLS ── */}
      {(activeTab === 'all' || activeTab === 'windows') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[#183B32]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#18211E]">
                  4. Windows &amp; Safety Grills
                </h3>
              </div>
              <p className="text-xs text-[#505D56] mt-0.5">
                Total Glass Area: <strong>{quantities.windowAreaSqFt} sq.ft</strong> &bull; Total Windows: <strong>{quantities.windowsCount} Units</strong>
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F8F8F6] border border-[#CBD5CB] text-xs text-[#18211E] font-medium">
              <span className="text-[#687770]">Your Choice:</span>
              <strong className="text-[#183B32]">{currentWindowMaterial} – {currentWindowSubGrade}</strong>
            </div>
          </div>

          {/* Window Specification Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {WINDOW_OPTIONS.map((opt) => {
              const isSelected =
                currentWindowMaterial === opt.primaryMaterial &&
                (currentWindowSubGrade.includes(opt.subGrade) || currentWindowSubGrade === opt.id);
              const totalCost = Math.round(opt.unitRate * quantities.windowAreaSqFt);

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setWindowSelection(opt.primaryMaterial, opt.subGrade)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                    isSelected
                      ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs ring-1 ring-[#183B32]'
                      : 'border-[#CBD5CB] bg-[#FDFDFD] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      {renderWindowSwatch(opt.swatchType, isSelected)}
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
                      <span className="text-[10px] font-mono text-[#C66B4E] font-bold block mt-0.5">
                        {opt.primaryMaterial} Profile
                      </span>
                      <p className="text-[11px] text-[#505D56] line-clamp-2 mt-1 leading-tight">{opt.desc}</p>
                    </div>

                    {/* Features list */}
                    <div className="space-y-1 pt-1">
                      {opt.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-[#505D56]">
                          <Check className="w-3 h-3 text-[#183B32] shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#CBD5CB]/60 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#18211E]">₹{opt.unitRate}/sqft</span>
                    <span className="font-mono font-bold text-[#183B32] text-[11px]">Total: {formatCurrency(totalCost)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Canonical Fenestration Schedule Table */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#687770]">
                Authoritative Fenestration Schedule ({windowSchedule.length} Opening Types)
              </span>
              <span className="text-[11px] text-[#505D56]">
                Deducted automatically from wall masonry &amp; plaster
              </span>
            </div>

            <div className="border border-[#CBD5CB] rounded-xl overflow-x-auto bg-[#FDFDFD]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F8F6] border-b border-[#CBD5CB] text-[#687770]">
                    <th className="py-2.5 px-3 font-bold uppercase text-[10px]">Code</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-[10px]">Space Type</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-[10px]">Opening Size</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-[10px] text-center">Count</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-[10px] text-right">Unit Area</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-[10px] text-right">Total Area</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-[10px] text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5CB]/50">
                  {windowSchedule.map((w) => (
                    <tr key={w.code} className="hover:bg-white/80">
                      <td className="py-2 px-3 font-mono font-bold text-[#183B32]">{w.code}</td>
                      <td className="py-2 px-3 text-[#18211E] font-medium">{w.spaceType}</td>
                      <td className="py-2 px-3 text-[#505D56] font-mono">{w.openingSize}</td>
                      <td className="py-2 px-3 text-center font-bold text-[#18211E]">{w.count}</td>
                      <td className="py-2 px-3 text-right font-mono text-[#505D56]">{w.unitAreaSqFt} sq.ft</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#18211E]">{w.totalOpeningAreaSqFt} sq.ft</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#183B32]">{formatCurrency(w.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MS Grilles & Sill Cladding Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#18211E]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C66B4E]" />
                <span>Mild Steel (MS) Safety Grilles: ~{quantities.grillAreaSqFt} sq.ft</span>
              </div>
              <p className="text-[11px] text-[#505D56] leading-relaxed">
                75% window area coverage fabricated using 12mm square MS bars with zinc-chromate anti-rust primer and 2 coats of Asian Paints black enamel (@ ₹280/sq.ft).
              </p>
            </div>

            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB]/70 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#18211E]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#183B32]" />
                <span>Polished Granite Sill Cladding</span>
              </div>
              <p className="text-[11px] text-[#505D56] leading-relaxed">
                20mm mirror-polished Sadahalli granite sill fitted at all external window bottoms with drip grooves to prevent rainwater staining and water ingress.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION E: DOORS & WINDOWS COST BREAKDOWN ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5CB] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs border-b border-[#CBD5CB] pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#183B32]" />
            <span className="font-bold text-[#18211E]">
              Doors &amp; Windows Cost Summary: {formatCurrency(doorsAndWindowsTotalINR)}
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
                {doorsAndWindowsBOQ.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-xs text-[#66716B]">
                      No door or window lines generated yet. Configure plot and room spaces in Chapters 1 &amp; 2.
                    </td>
                  </tr>
                ) : (
                  doorsAndWindowsBOQ.map((item, idx) => (
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
                    Total Doors &amp; Windows Subtotal:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-[#183B32]">
                    {formatCurrency(doorsAndWindowsTotalINR)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-[11px] text-[#505D56]">
            Total estimate for all entrance, bedroom, bathroom doors, and glazed windows is <strong>{formatCurrency(doorsAndWindowsTotalINR)}</strong>. Click above to view individual item rates.
          </p>
        )}
      </div>

      {/* ── SECTION F: HONEST QUANTITY PROMISE ── */}
      <div className="p-4 rounded-2xl bg-[#E8EFE9]/70 border border-[#B7CDBB] text-xs text-[#183B32] space-y-1.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C66B4E] shrink-0" />
          <span className="font-bold text-[#183B32] uppercase tracking-wider text-[11px]">
            Transparent Dimensions Guarantee
          </span>
        </div>
        <p className="text-[11.5px] text-[#2C4A3E] leading-relaxed">
          Door counts and window opening sizes are determined directly by your architectural floor plan. Choosing teak wood over flush doors or acoustic Fenesta glass updates material rates immediately, while your room dimensions and door counts stay 100% accurate.
        </p>
      </div>
    </div>
  );
};
