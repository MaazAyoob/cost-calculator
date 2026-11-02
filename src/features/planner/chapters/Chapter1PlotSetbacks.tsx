import React, { useState, useEffect } from 'react';
import { useWizardStore, ConfiguratorCity, AuthorityOption } from '../../../store/useWizardStore';
import { useArea } from '../../../store/useCalculationStore';
import { evaluateAuthorityLimits } from '../../../calculation-engine/data/authorityRules';
import { BuildableFootprintCanvas } from '../components/BuildableFootprintCanvas';
import {
  MapPin,
  Compass,
  Check,
  Maximize2,
  Info,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Shovel,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface PresetPlot {
  label: string;
  width: number;
  length: number;
  areaSqFt: number;
  popular?: boolean;
}

const PRESET_PLOTS: PresetPlot[] = [
  { label: "20' × 30'", width: 20, length: 30, areaSqFt: 600 },
  { label: "30' × 40'", width: 30, length: 40, areaSqFt: 1200, popular: true },
  { label: "30' × 50'", width: 30, length: 50, areaSqFt: 1500 },
  { label: "40' × 60'", width: 40, length: 60, areaSqFt: 2400 },
];

const ROAD_WIDTH_PRESETS = [
  { value: 20, label: '20 ft', desc: 'Standard residential lane' },
  { value: 30, label: '30 ft', desc: 'Standard residential road', popular: true },
  { value: 40, label: '40 ft', desc: 'Wide layout avenue' },
  { value: 60, label: '60+ ft', desc: 'Major municipal road' },
];

const LAND_STATUS_OPTIONS = [
  { id: 'bda_approved', label: 'BDA / BBMP Approved', desc: 'Approved municipal residential layout' },
  { id: 'dc_converted', label: 'DC Converted', desc: 'Agricultural land converted for residential use' },
  { id: 'panchayat', label: 'Gram Panchayat / E-Khata', desc: 'Village panchayat boundary with Form 9/11' },
  { id: 'not_sure', label: 'Not sure', desc: 'We will use standard Bengaluru residential assumptions' },
];

const PLAN_STATUS_OPTIONS = [
  { id: 'sanctioned', label: 'Sanctioned Plan Ready', desc: 'Approved by municipal authority with stamped setbacks' },
  { id: 'rough_sketch', label: 'Rough Sketch / Concept', desc: 'Architect drawing or self-made floorplan sketch' },
  { id: 'starting_fresh', label: 'Starting Fresh', desc: 'No drawings yet — planning from plot dimensions' },
];

const SITE_CONDITION_OPTIONS = [
  { id: 'flat', label: 'Plain Flat Ground', desc: 'Even terrain, standard foundation depth' },
  { id: 'sloping', label: 'Sloping / Uneven Terrain', desc: 'Contour grading or stepped footings may be needed' },
  { id: 'loose_soil', label: 'Soft / Waterlogged Ground', desc: 'Requires deeper excavation or specialized soil test' },
  { id: 'not_sure', label: 'Not Sure', desc: 'We will assume standard firm Bengaluru red soil' },
];

const DEMOLITION_OPTIONS = [
  { id: 'vacant', label: 'Vacant Plot', desc: 'Clear land ready for excavation' },
  { id: 'demolition_needed', label: 'Existing Old Structure', desc: 'Demolition and debris carting required before civil works' },
  { id: 'not_sure', label: 'Not Sure', desc: 'Inspection or boundary survey needed to confirm site obstacles' },
];

const CITY_OPTIONS: { id: ConfiguratorCity; label: string; desc: string }[] = [
  { id: 'Bangalore', label: 'Bangalore', desc: 'BBMP / BDA Municipal Area' },
  { id: 'Mysore', label: 'Mysore', desc: 'MUDA / MCC Municipal Area' },
  { id: 'Other', label: 'Other City', desc: 'Outside Bangalore & Mysore' },
];

export const Chapter1PlotSetbacks: React.FC = () => {
  const store = useWizardStore();
  const {
    city,
    authority,
    plotLength,
    plotWidth,
    roadWidthFt,
    frontSetback,
    rearSetback,
    leftSetback,
    rightSetback,
    roadFacingBoundaries,
    isCornerPlot,
    roadWideningFt,
    prescribedBuildingLineFt,
    floors,
    setCity,
    setAuthority,
    setPlotDimensions,
    setRoadWidth,
    setCustomSetbacks,
    setRoadFacingBoundaries,
    setIsCornerPlot,
  } = store;

  const area = useArea();

  // Local state for responsive editing
  const [activeCity, setActiveCity] = useState<ConfiguratorCity>(city || 'Bangalore');
  const [widthInput, setWidthInput] = useState<string>(plotWidth > 0 ? String(plotWidth) : '30');
  const [lengthInput, setLengthInput] = useState<string>(plotLength > 0 ? String(plotLength) : '40');
  const [selectedLandStatus, setSelectedLandStatus] = useState<string>('bda_approved');
  const [selectedAuthority, setSelectedAuthority] = useState<string>(authority || 'BBMP/BDA');

  // Custom setbacks toggle
  const [useCustomSetbacks, setUseCustomSetbacks] = useState<boolean>(
    frontSetback !== null && frontSetback !== undefined
  );

  // Progressive disclosure for site conditions & demolition
  const [showSiteConditions, setShowSiteConditions] = useState<boolean>(false);
  const [selectedPlanStatus, setSelectedPlanStatus] = useState<string>('starting_fresh');
  const [selectedSiteCondition, setSelectedSiteCondition] = useState<string>('flat');
  const [selectedDemolition, setSelectedDemolition] = useState<string>('vacant');

  // Synchronize initial defaults if unselected
  useEffect(() => {
    if (!city) {
      setCity('Bangalore');
    }
    if (plotLength === 0 || plotWidth === 0) {
      setPlotDimensions(40, 30);
    }
    if (!authority) {
      setAuthority('BBMP/BDA');
    }
    if (!roadWidthFt) {
      setRoadWidth(30);
    }
  }, []);

  const numWidth = Math.max(0, parseFloat(widthInput) || 0);
  const numLength = Math.max(0, parseFloat(lengthInput) || 0);
  const calculatedArea = numWidth * numLength;

  const safeLength = Math.max(10, numLength || 40);
  const safeWidth = Math.max(10, numWidth || 30);
  const safeRoadWidth = Math.max(10, Number(roadWidthFt) || 30);

  const isOtherCity = activeCity === 'Other';

  // Prepare custom setbacks arguments if present
  const hasUserCustomSetbackValues =
    useCustomSetbacks &&
    (typeof frontSetback === 'number' ||
      typeof rearSetback === 'number' ||
      typeof leftSetback === 'number' ||
      typeof rightSetback === 'number');

  const customSetbacksArg = useCustomSetbacks
    ? {
        frontSetbackFt: typeof frontSetback === 'number' ? frontSetback : undefined,
        rearSetbackFt: typeof rearSetback === 'number' ? rearSetback : undefined,
        leftSetbackFt: typeof leftSetback === 'number' ? leftSetback : undefined,
        rightSetbackFt: typeof rightSetback === 'number' ? rightSetback : undefined,
      }
    : undefined;

  // ── 1. CANONICAL CITY-SPECIFIC AUTHORITY EVALUATION ──
  // For supported locations (Bangalore, Mysore), evaluate via canonical evaluateAuthorityLimits()
  const canonicalAuthResult = !isOtherCity
    ? evaluateAuthorityLimits({
        city: activeCity,
        plotLength: safeLength,
        plotWidth: safeWidth,
        roadWidthFt: safeRoadWidth,
        roadFacingBoundaries: isCornerPlot && roadFacingBoundaries ? roadFacingBoundaries : ['front'],
        isCornerPlot: Boolean(isCornerPlot),
        roadWideningFt: Number(roadWideningFt) || 0,
        prescribedBuildingLineFt: Number(prescribedBuildingLineFt) || 0,
        customSetbacks: customSetbacksArg,
      })
    : null;

  // ── 2. DERIVED VALUES FOR SUPPORTED VS "OTHER CITY" ──
  let effFront: number | null = null;
  let effRear: number | null = null;
  let effLeft: number | null = null;
  let effRight: number | null = null;
  let buildableWidthFt = 0;
  let buildableLengthFt = 0;
  let geometricEnvelopeSqFt: number | null = null;
  let maxCoveragePct: number | null = null;
  let statutoryCoverageLimitSqFt: number | null = null;
  let maxBuildableGroundFloorSqFt: number | null = null;
  let isFootprintUnavailable = false;
  let verificationBadgeLabel = '';
  let verificationBadgeDesc = '';

  const grossPlotArea = calculatedArea > 0 ? calculatedArea : safeWidth * safeLength;

  if (!isOtherCity && canonicalAuthResult) {
    // Canonical evaluation active (Bangalore or Mysore)
    effFront = typeof customSetbacksArg?.frontSetbackFt === 'number' ? customSetbacksArg.frontSetbackFt : canonicalAuthResult.statutoryFrontSetbackFt;
    effRear = typeof customSetbacksArg?.rearSetbackFt === 'number' ? customSetbacksArg.rearSetbackFt : canonicalAuthResult.statutoryRearSetbackFt;
    effLeft = typeof customSetbacksArg?.leftSetbackFt === 'number' ? customSetbacksArg.leftSetbackFt : canonicalAuthResult.statutoryLeftSetbackFt;
    effRight = typeof customSetbacksArg?.rightSetbackFt === 'number' ? customSetbacksArg.rightSetbackFt : canonicalAuthResult.statutoryRightSetbackFt;
    buildableWidthFt = canonicalAuthResult.buildableWidthFt;
    buildableLengthFt = canonicalAuthResult.buildableLengthFt;
    geometricEnvelopeSqFt = Math.round(buildableWidthFt * buildableLengthFt);
    maxCoveragePct = canonicalAuthResult.maxGroundCoveragePct;
    statutoryCoverageLimitSqFt = canonicalAuthResult.coverageLimitSqFt ?? Math.round(grossPlotArea * ((canonicalAuthResult.maxGroundCoveragePct || 70) / 100));
    maxBuildableGroundFloorSqFt = Math.min(geometricEnvelopeSqFt, statutoryCoverageLimitSqFt);
    isFootprintUnavailable = false;

    if (useCustomSetbacks) {
      verificationBadgeLabel = 'Custom Clearance-Based Boundary Envelope';
      verificationBadgeDesc = 'Based on the clearance values you entered. Please confirm these measurements with your surveyor before relying on them for construction planning.';
    } else if (activeCity === 'Bangalore') {
      verificationBadgeLabel = 'GBA 2026 Reference • Pending Official Confirmation';
      verificationBadgeDesc = 'Statutory figures are referenced from the draft Karnataka Gazette notification for residential buildings up to 12m. This is an indicative planning reference pending official gazette confirmation, not an established statutory requirement or official municipal sanction.';
    } else {
      verificationBadgeLabel = 'MUDA CDP 2031 • Verified Master Plan Bylaws';
      verificationBadgeDesc = 'Statutory figures are referenced from the verified Mysuru Urban Development Authority (MUDA) CDP 2031 Schedule II Zoning Regulations.';
    }
  } else {
    // "Other City / Outside Bangalore & Mysore" handling
    if (hasUserCustomSetbackValues) {
      effFront = typeof frontSetback === 'number' ? frontSetback : 0;
      effRear = typeof rearSetback === 'number' ? rearSetback : 0;
      effLeft = typeof leftSetback === 'number' ? leftSetback : 0;
      effRight = typeof rightSetback === 'number' ? rightSetback : 0;
      buildableWidthFt = Math.max(0, safeWidth - (effLeft + effRight));
      buildableLengthFt = Math.max(0, safeLength - (effFront + effRear));
      geometricEnvelopeSqFt = Math.round(buildableWidthFt * buildableLengthFt);
      // Do NOT invent a statutory coverage cap for unsupported locations
      maxCoveragePct = null;
      statutoryCoverageLimitSqFt = null;
      maxBuildableGroundFloorSqFt = geometricEnvelopeSqFt;
      isFootprintUnavailable = false;
      verificationBadgeLabel = 'Custom Clearance-Based Boundary Envelope';
      verificationBadgeDesc = 'Based on the clearance values you entered. Please confirm these measurements with your surveyor before relying on them for construction planning. Statutory bylaws and municipal coverage caps for this location remain unverified.';
    } else {
      // Missing clearances: footprint is unavailable. Do NOT fabricate statutory footprints!
      effFront = null;
      effRear = null;
      effLeft = null;
      effRight = null;
      buildableWidthFt = 0;
      buildableLengthFt = 0;
      geometricEnvelopeSqFt = null;
      maxCoveragePct = null;
      statutoryCoverageLimitSqFt = null;
      maxBuildableGroundFloorSqFt = null;
      isFootprintUnavailable = true;
      verificationBadgeLabel = 'Outside Service Area • Unverified Local Bylaws';
      verificationBadgeDesc = 'Hutty does not currently maintain verified municipal setback bylaws for locations outside Bangalore and Mysore. Please enter custom clearance values below and confirm with your surveyor.';
    }
  }

  // 4. Planned floors and Total Built-Up Area across all floors
  const plannedFloors = floors > 0 ? floors : 2;
  const totalBua = !isFootprintUnavailable && maxBuildableGroundFloorSqFt !== null
    ? Math.round(maxBuildableGroundFloorSqFt * plannedFloors)
    : null;

  const coveragePctUsed =
    grossPlotArea > 0 && maxBuildableGroundFloorSqFt !== null
      ? Math.round((maxBuildableGroundFloorSqFt / grossPlotArea) * 100)
      : null;

  const setbacksExceedPlot =
    effLeft !== null &&
    effRight !== null &&
    effFront !== null &&
    effRear !== null &&
    (effLeft + effRight >= safeWidth || effFront + effRear >= safeLength);

  // Handlers
  const handleApplyDimensions = (w: number, l: number) => {
    setWidthInput(String(w));
    setLengthInput(String(l));
    setPlotDimensions(l, w);
  };

  const handleWidthChange = (val: string) => {
    setWidthInput(val);
    const parsed = parseFloat(val) || 0;
    if (parsed > 0) {
      setPlotDimensions(numLength, parsed);
    }
  };

  const handleLengthChange = (val: string) => {
    setLengthInput(val);
    const parsed = parseFloat(val) || 0;
    if (parsed > 0) {
      setPlotDimensions(parsed, numWidth);
    }
  };

  const handleCityChange = (c: ConfiguratorCity) => {
    setActiveCity(c);
    setCity(c);
    if (c === 'Bangalore') {
      setSelectedAuthority('BBMP/BDA');
      setAuthority('BBMP/BDA');
    } else if (c === 'Mysore') {
      setSelectedAuthority('MUDA');
      setAuthority('MUDA');
    } else {
      setSelectedAuthority('Other / None');
      setAuthority('Other / None');
      // Automatically enable custom clearance input mode for Other City
      setUseCustomSetbacks(true);
    }
  };

  const handleAuthoritySelect = (authId: string) => {
    setSelectedAuthority(authId);
    setAuthority(authId === 'NOT_SURE' ? 'Not sure' : (authId as AuthorityOption));
  };

  const handleCustomSetbackChange = (field: 'front' | 'rear' | 'left' | 'right', val: number) => {
    const f = field === 'front' ? val : effFront ?? 0;
    const r = field === 'rear' ? val : effRear ?? 0;
    const l = field === 'left' ? val : effLeft ?? 0;
    const rg = field === 'right' ? val : effRight ?? 0;
    setCustomSetbacks(f, r, l, rg);
  };

  const handleResetToStandard = () => {
    if (isOtherCity) {
      // In Other City, resetting sets clearances to zero rather than fake statutory values
      setCustomSetbacks(null, null, null, null);
      return;
    }
    setUseCustomSetbacks(false);
    setCustomSetbacks(null, null, null, null);
  };

  const handleEnableCustomSetbacks = () => {
    setUseCustomSetbacks(true);
    setCustomSetbacks(effFront ?? 0, effRear ?? 0, effLeft ?? 0, effRight ?? 0);
  };

  const handleToggleCornerPlot = () => {
    const nextVal = !isCornerPlot;
    setIsCornerPlot(nextVal);
    if (!nextVal) {
      setRoadFacingBoundaries(['front']);
    } else {
      setRoadFacingBoundaries(['front', 'left']);
    }
  };

  const handleBoundaryToggle = (boundary: 'front' | 'rear' | 'left' | 'right') => {
    if (boundary === 'front') return;
    const current = roadFacingBoundaries || ['front'];
    let updated: Array<'front' | 'rear' | 'left' | 'right'>;
    if (current.includes(boundary)) {
      updated = current.filter((b) => b !== boundary);
    } else {
      updated = [...current, boundary];
    }
    if (!updated.includes('front')) {
      updated.unshift('front');
    }
    setRoadFacingBoundaries(updated);
  };

  return (
    <div className="space-y-6 text-left" data-testid="chapter-1-plot-setbacks">
      {/* ── CHAPTER HEADER ── */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-[11px] font-bold text-[#183B32]">
          <MapPin className="w-3 h-3 text-[#C66B4E]" />
          <span>STEP 1 OF 7 &bull; YOUR PLOT</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
          Tell us about your plot.
        </h2>
        <p className="text-xs sm:text-sm text-[#66716B] leading-relaxed">
          Choose your plot size and city. We calculate how much you can build and the open space to leave around your home.
        </p>
      </div>

      {/* ── SECTION 1: LOCATION ── */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E]">
          1. Where is your plot located?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CITY_OPTIONS.map((c) => {
            const isSelected = activeCity === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCityChange(c.id)}
                className={`min-h-[52px] py-3 px-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[#183B32] bg-[#E8EFE9] text-[#183B32] font-bold shadow-2xs'
                    : 'border-[#E5E7EB] bg-white text-[#66716B] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#C66B4E]' : 'text-[#66716B]'}`} />
                    <span className="text-sm font-semibold truncate">{c.label}</span>
                  </div>
                  <span className="text-[10px] text-[#687770] block leading-tight mt-0.5 truncate">
                    {c.desc}
                  </span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#183B32] shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Informative Advisory Banner for Other City */}
        {isOtherCity && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 flex items-start gap-2.5 text-left mt-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-900 leading-relaxed">
              <strong className="block text-amber-950 font-bold">
                Location Outside Bangalore & Mysore:
              </strong>
              <p>
                We have switched to custom open space inputs below. Please enter the clearances required by your local municipality or architect.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 2: PLOT DIMENSIONS (Presets + Progressive Disclosure) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E]">
            2. What is the size of your plot?
          </label>
          <span className="text-[11px] text-[#66716B]">Choose a standard size or enter custom feet</span>
        </div>

        {/* Preset Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_PLOTS.map((preset) => {
            const isSelected = numWidth === preset.width && numLength === preset.length;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyDimensions(preset.width, preset.length)}
                className={`min-h-[64px] p-3 rounded-xl border text-center transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#183B32] bg-[#183B32] text-white shadow-xs'
                    : 'border-[#E5E7EB] bg-white text-[#202522] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                }`}
              >
                {preset.popular && (
                  <span
                    className={`absolute -top-2 right-2 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                      isSelected
                        ? 'bg-[#C66B4E] text-white'
                        : 'bg-[#E8EFE9] text-[#183B32] border border-[#B7CDBB]'
                    }`}
                  >
                    Popular
                  </span>
                )}
                <span className="block text-sm font-bold font-mono">{preset.label}</span>
                <span className={`block text-[11px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#687770]'}`}>
                  {preset.areaSqFt.toLocaleString()} sq.ft
                </span>
              </button>
            );
          })}
        </div>

        {/* Progressive Disclosure Link: Why plot size matters */}
        <div className="text-xs text-[#66716B] flex items-center gap-1.5 pt-0.5">
          <Info className="w-3.5 h-3.5 text-[#183B32]" />
          <span>
            Bangalore building rules require open space around your house for light and ventilation. Your plot size determines how much of your land you can build on.
          </span>
        </div>

        {/* Custom Width & Length Inputs */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E5E7EB] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
            <span className="text-xs font-bold text-[#183B32]">
              Custom Plot Size &bull; Dimensions in Feet
            </span>
            <span className="text-xs font-mono font-bold text-[#183B32] bg-[#E8EFE9] px-2.5 py-0.5 rounded-full border border-[#B7CDBB]">
              {calculatedArea.toLocaleString()} sq.ft ({((calculatedArea || 1200) / 1089).toFixed(2)} Guntas)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                Plot Width (road frontage)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={widthInput}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#CBD5CB] bg-[#F8F8F6] text-[#202522] font-mono text-sm focus:outline-none focus:border-[#183B32] focus:bg-white transition-all"
                  placeholder="30"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-[#687770] font-mono">ft</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                Plot Depth (length)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={lengthInput}
                  onChange={(e) => handleLengthChange(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#CBD5CB] bg-[#F8F8F6] text-[#202522] font-mono text-sm focus:outline-none focus:border-[#183B32] focus:bg-white transition-all"
                  placeholder="40"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-[#687770] font-mono">ft</span>
              </div>
            </div>
          </div>

          {/* Unit Conversions Reference */}
          <div className="pt-2 border-t border-[#E5E7EB] text-[10px] text-[#687770] flex flex-wrap items-center justify-between gap-1">
            <span>1 Gunta = 1,089 sq.ft</span>
            <span>1 Cent = 435.6 sq.ft</span>
            <span>1 Sq.Yard = 9 sq.ft</span>
            <span>1 Sq.Metre = 10.76 sq.ft</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: ROAD WIDTH & CORNER PLOT ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E]">
            3. Front Road Width & Plot Orientation
          </label>
          <span className="text-[11px] text-[#66716B]">Affects front setback requirements</span>
        </div>

        {/* Road Width Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ROAD_WIDTH_PRESETS.map((rw) => {
            const isSelected = safeRoadWidth === rw.value;
            return (
              <button
                key={rw.value}
                type="button"
                onClick={() => setRoadWidth(rw.value)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#183B32] bg-[#E8EFE9] text-[#183B32] font-bold shadow-2xs'
                    : 'border-[#E5E7EB] bg-white text-[#66716B] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-bold font-mono">{rw.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#183B32]" />}
                </div>
                <span className="text-[10px] text-[#687770] block leading-tight">{rw.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Corner Plot Option */}
        <div className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(isCornerPlot)}
              onChange={handleToggleCornerPlot}
              className="w-4 h-4 rounded border-[#CBD5CB] text-[#183B32] focus:ring-[#183B32]"
            />
            <span className="text-xs font-bold text-[#18211E]">
              This is a corner plot with roads on more than one side
            </span>
          </label>

          {isCornerPlot && (
            <div className="pt-2 border-t border-[#E5E7EB] space-y-1.5 pl-6">
              <span className="text-[11px] text-[#4B5563] font-semibold block">
                Select additional sides that face a road:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'left', label: 'Left Side Road' },
                  { id: 'right', label: 'Right Side Road' },
                  { id: 'rear', label: 'Rear Road' },
                ].map((side) => {
                  const isChecked = (roadFacingBoundaries || []).includes(side.id as any);
                  return (
                    <button
                      key={side.id}
                      type="button"
                      onClick={() => handleBoundaryToggle(side.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        isChecked
                          ? 'border-[#183B32] bg-[#183B32] text-white'
                          : 'border-[#CBD5CB] bg-white text-[#4B5563] hover:bg-[#F8F9F7]'
                      }`}
                    >
                      {side.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 4: LOCAL PLANNING AUTHORITY & LAND APPROVAL ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E]">
            4. Local Planning Authority
          </label>
          <span className="text-[11px] text-[#687770]">Determines statutory setback norms</span>
        </div>

        {isOtherCity ? (
          <div className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#CBD5CB] text-xs text-[#4B5563]">
            <span className="font-bold text-[#183B32] block">
              Authority: Local Municipal Corporation / Planning Authority (Unverified)
            </span>
            <span className="text-[11px] text-[#687770] block mt-0.5">
              Hutty has no pre-loaded statutory bylaws for this city. Please enter your custom boundary clearances below. Confirm these measurements with your surveyor before relying on them for construction planning.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'BBMP/BDA', label: 'BBMP / BDA (Bangalore)', cityScope: 'Bangalore' },
              { id: 'MUDA', label: 'MUDA (Mysore)', cityScope: 'Mysore' },
              { id: 'NOT_SURE', label: 'Not sure', cityScope: 'ALL' },
            ]
              .filter((item) => item.cityScope === 'ALL' || item.cityScope === activeCity)
              .map((item) => {
                const isSelected = selectedAuthority === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAuthoritySelect(item.id)}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                      isSelected
                        ? 'border-[#183B32] bg-[#183B32] text-white shadow-2xs'
                        : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
          </div>
        )}

        {/* Optional Land Status Selection */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E]">
            Land Approval Status (Optional)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {LAND_STATUS_OPTIONS.map((status) => {
              const isSelected = selectedLandStatus === status.id;
              return (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => setSelectedLandStatus(status.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs'
                      : 'border-[#E5E7EB] bg-white hover:border-[#183B32]/30 hover:bg-[#F8F9F7]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="min-w-0">
                    <span className={`block text-xs font-bold ${isSelected ? 'text-[#183B32]' : 'text-[#202522]'}`}>
                      {status.label}
                    </span>
                    <span className="block text-[11px] text-[#687770] leading-snug mt-0.5">
                      {status.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SECTION 5: BOUNDARY SETBACKS & CLEARANCES (PLAIN LANGUAGE) ── */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#183B32] flex items-center gap-1.5 font-heading">
              <Compass className="w-4 h-4 text-[#C66B4E]" />
              4. Space to Leave Around Your Home (Setbacks)
            </span>
            <span className="text-[11px] text-[#66716B] block mt-0.5">
              Municipal rules require open space around your house for fresh air, sunlight, and fire safety.
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#66716B] hidden sm:inline">
            Plot: {safeWidth}' × {safeLength}'
          </span>
        </div>

        {/* Regulatory Verification Status Badge */}
        <div className="p-3 bg-[#F8F9F7] rounded-xl border border-[#E5E7EB] text-xs space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#347A62]" />
            <strong className="text-[#183B32]">{verificationBadgeLabel}</strong>
          </div>
          <p className="text-[11px] text-[#687770] leading-snug">{verificationBadgeDesc}</p>
        </div>

        {/* Applied Boundary Clearances Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono text-xs">
          <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
            <span className="text-[10px] text-[#687770] block uppercase font-bold">Front (Road)</span>
            <strong className="text-sm text-[#183B32]">
              {effFront !== null ? `${effFront.toFixed(1)} ft` : 'Awaiting entry'}
            </strong>
          </div>
          <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
            <span className="text-[10px] text-[#687770] block uppercase font-bold">Back</span>
            <strong className="text-sm text-[#183B32]">
              {effRear !== null ? `${effRear.toFixed(1)} ft` : 'Awaiting entry'}
            </strong>
          </div>
          <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
            <span className="text-[10px] text-[#687770] block uppercase font-bold">Left Side</span>
            <strong className="text-sm text-[#183B32]">
              {effLeft !== null ? `${effLeft.toFixed(1)} ft` : 'Awaiting entry'}
            </strong>
          </div>
          <div className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
            <span className="text-[10px] text-[#687770] block uppercase font-bold">Right Side</span>
            <strong className="text-sm text-[#183B32]">
              {effRight !== null ? `${effRight.toFixed(1)} ft` : 'Awaiting entry'}
            </strong>
          </div>
        </div>

        {/* Setbacks Mode Toggle: Standard vs Custom */}
        {!isOtherCity && (
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
            {!useCustomSetbacks ? (
              <button
                type="button"
                onClick={handleEnableCustomSetbacks}
                className="text-[#183B32] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Have specific clearances from your site drawing or custom layout? Enter custom clearances &rarr;</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetToStandard}
                className="text-[#C66B4E] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to standard municipal rules</span>
              </button>
            )}
          </div>
        )}

        {/* Custom Clearance Inputs (State B or Other City) */}
        {(useCustomSetbacks || isOtherCity) && (
          <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#CBD5CB] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#183B32]">
                Custom Clearance Inputs (User-Entered Values)
              </span>
              <span className="text-[10px] text-[#687770]">Values in feet</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] text-[#687770] block uppercase font-bold mb-1">Front (ft)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={frontSetback ?? ''}
                  onChange={(e) => handleCustomSetbackChange('front', Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.0"
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-[#CBD5CB] rounded-lg text-[#183B32] focus:outline-none focus:border-[#183B32]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#687770] block uppercase font-bold mb-1">Rear (ft)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={rearSetback ?? ''}
                  onChange={(e) => handleCustomSetbackChange('rear', Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.0"
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-[#CBD5CB] rounded-lg text-[#183B32] focus:outline-none focus:border-[#183B32]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#687770] block uppercase font-bold mb-1">Left (ft)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={leftSetback ?? ''}
                  onChange={(e) => handleCustomSetbackChange('left', Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.0"
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-[#CBD5CB] rounded-lg text-[#183B32] focus:outline-none focus:border-[#183B32]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#687770] block uppercase font-bold mb-1">Right (ft)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={rightSetback ?? ''}
                  onChange={(e) => handleCustomSetbackChange('right', Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.0"
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-[#CBD5CB] rounded-lg text-[#183B32] focus:outline-none focus:border-[#183B32]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Validation Warning if Setbacks Exceed Plot */}
        {setbacksExceedPlot && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Setbacks exceed plot boundary. Please adjust dimensions.</span>
          </div>
        )}
      </div>

      {/* ── SECTION 6: INTERACTIVE 2D BUILDABLE GROUND FLOOR & SPACE PILLARS ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#183B32] flex items-center gap-1.5 font-heading">
            <Maximize2 className="w-4 h-4 text-[#C66B4E]" />
            5. How Much You Can Build (Ground Floor)
          </label>
          <span className="text-[11px] text-[#66716B]">Live calculation</span>
        </div>

        {/* 2D Interactive Footprint Canvas */}
        <BuildableFootprintCanvas
          plotWidth={safeWidth}
          plotLength={safeLength}
          roadWidthFt={safeRoadWidth}
          frontSetback={effFront}
          rearSetback={effRear}
          leftSetback={effLeft}
          rightSetback={effRight}
          buildableWidthFt={buildableWidthFt}
          buildableLengthFt={buildableLengthFt}
          buildableFootprintSqFt={maxBuildableGroundFloorSqFt}
          maxCoveragePct={maxCoveragePct}
          statutoryCoverageLimitSqFt={statutoryCoverageLimitSqFt}
          roadFacingBoundaries={isCornerPlot && roadFacingBoundaries ? roadFacingBoundaries : ['front']}
          isFootprintUnavailable={isFootprintUnavailable}
          unavailableNotice={
            isOtherCity
              ? 'Enter custom boundary clearances above to preview your buildable ground floor.'
              : undefined
          }
        />

        {/* 4 Clear Step Pillars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Pillar 1: Total Land Area */}
          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
            <span className="text-[10px] text-[#687770] font-bold block uppercase tracking-wider">
              Total Land Area
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-[#183B32] block mt-0.5">
              {grossPlotArea.toLocaleString()} sq.ft
            </span>
            <span className="text-[10px] text-[#687770] mt-0.5 block">Your plot size</span>
          </div>

          {/* Pillar 2: Space Inside Setbacks */}
          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
            <span className="text-[10px] text-[#687770] font-bold block uppercase tracking-wider">
              Space Inside Setbacks
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-[#183B32] block mt-0.5">
              {geometricEnvelopeSqFt !== null
                ? `${geometricEnvelopeSqFt.toLocaleString()} sq.ft`
                : 'Unavailable'}
            </span>
            <span className="text-[10px] text-[#687770] mt-0.5 block">
              {geometricEnvelopeSqFt !== null ? 'After leaving open gaps' : 'Enter custom clearances'}
            </span>
          </div>

          {/* Pillar 3: Allowed Ground Floor */}
          <div className="p-3.5 bg-[#E8EFE9] rounded-2xl border border-[#B7CDBB]">
            <span className="text-[10px] text-[#183B32] font-bold block uppercase tracking-wider">
              Allowed Ground Floor
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-[#183B32] block mt-0.5">
              {maxBuildableGroundFloorSqFt !== null
                ? `${maxBuildableGroundFloorSqFt.toLocaleString()} sq.ft`
                : 'Unavailable'}
            </span>
            <span className="text-[10px] text-[#183B32]/80 mt-0.5 block">
              {isFootprintUnavailable
                ? 'Custom clearances required'
                : useCustomSetbacks || isOtherCity
                ? 'Based on your custom numbers'
                : maxCoveragePct !== null
                ? `Max ground coverage (${maxCoveragePct}%)`
                : 'Estimated ground floor cap'}
            </span>
          </div>

          {/* Pillar 4: Total Built-up Area (All Floors) */}
          <div className="p-3.5 bg-[#183B32] text-white rounded-2xl">
            <span className="text-[10px] text-white/70 font-bold block uppercase tracking-wider">
              Total Built Area (All Floors)
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-white block mt-0.5">
              {totalBua !== null ? `${totalBua.toLocaleString()} sq.ft` : 'Unavailable'}
            </span>
            <span className="text-[10px] text-white/70 mt-0.5 block">
              {totalBua !== null
                ? `Across ${plannedFloors} planned floor${plannedFloors > 1 ? 's' : ''}`
                : 'Awaiting ground floor footprint'}
            </span>
          </div>
        </div>

        {/* Clear Plain Homeowner Explanation */}
        <div className="p-3.5 bg-[#F8F9F7] rounded-xl border border-[#E5E7EB] text-xs text-[#4B5563] space-y-1">
          <strong className="text-[#183B32] block">How this works for your home:</strong>
          {isFootprintUnavailable ? (
            <p>
              Hutty maintains verified municipal setback bylaws for Mysuru (MUDA) and reference drafts for Bengaluru (GBA 2026). For other locations, statutory open space and ground coverage rules vary by local urban development authority and are not automated. Please enter your custom clearance values above to calculate your buildable ground floor envelope.
            </p>
          ) : isOtherCity ? (
            <p>
              Based on the clearance values you entered ({effFront?.toFixed(1)} ft front, {effRear?.toFixed(1)} ft rear, {effLeft?.toFixed(1)} ft left, {effRight?.toFixed(1)} ft right), your physical space inside boundary lines is <strong>{geometricEnvelopeSqFt?.toLocaleString()} sq.ft</strong>. Please confirm these measurements with your surveyor before relying on them for construction planning. Local coverage and FAR caps must be confirmed with your local municipal authority.
            </p>
          ) : (
            <p>
              Required open boundary clearances ({effFront?.toFixed(1)} ft front, {effRear?.toFixed(1)} ft rear, {effLeft?.toFixed(1)} ft left, {effRight?.toFixed(1)} ft right) leave a physical space of <strong>{geometricEnvelopeSqFt?.toLocaleString()} sq.ft</strong>. Building coverage rules allow up to <strong>{maxCoveragePct}% ({statutoryCoverageLimitSqFt?.toLocaleString()} sq.ft)</strong>. Your estimated maximum buildable ground floor is the smaller of the two: <strong>{maxBuildableGroundFloorSqFt?.toLocaleString()} sq.ft</strong> ({coveragePctUsed}% of your plot).
            </p>
          )}
        </div>

        {/* Comprehensive Regulatory Disclaimer Distinguishing Rules, Drafts, Clearances, Calculations & Approvals */}
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200/90 flex items-start gap-3 text-left">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 leading-relaxed space-y-2">
            <strong className="block font-bold text-amber-950">
              Important Regulatory & Planning Disclosure:
            </strong>
            <ul className="space-y-1.5 list-disc list-inside text-amber-900">
              <li>
                <strong>Verified Authority Bylaws:</strong> Mysuru rules are referenced from officially gazetted MUDA CDP 2031 Schedule II zoning regulations.
              </li>
              <li>
                <strong>Rules Pending Official Confirmation:</strong> Bengaluru figures are referenced from the draft Karnataka Gazette notification (GBA 2026 Table 1) for residential buildings up to 12m. These figures are indicative planning references pending official gazette confirmation and must not be treated as established statutory law.
              </li>
              <li>
                <strong>Custom Clearances:</strong> Any custom setback measurements entered are user-provided inputs unverified by Hutty. Please confirm these measurements with your surveyor before relying on them for construction planning.
              </li>
              <li>
                <strong>Physical Geometric Calculations:</strong> Maximum Buildable Ground Floor is a theoretical geometric upper bound based on physical boundary clearances and coverage caps. Actual structural ground coverage may be lower depending on architectural layout, parking, column positions, and site terrain.
              </li>
              <li>
                <strong>Formal Municipal Building-Plan Approval:</strong> These calculations are preliminary estimation references and do not constitute, guarantee, or substitute for formal building plan sanction or statutory approvals from BBMP, BDA, MUDA, or local municipal/panchayat bodies.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── SECTION 7: DRAWING STATUS & SITE CONDITIONS (PROGRESSIVE DISCLOSURE) ── */}
      <div className="border border-[#E5E7EB] rounded-2xl bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setShowSiteConditions(!showSiteConditions)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F8F9F7] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Shovel className="w-4 h-4 text-[#C66B4E]" />
            <div>
              <span className="text-xs font-bold text-[#18211E] block">
                Drawings, Soil Condition & Demolition (Optional)
              </span>
              <span className="text-[11px] text-[#687770]">
                Tell us about your current drawings, site terrain and existing structures
              </span>
            </div>
          </div>
          {showSiteConditions ? (
            <ChevronUp className="w-4 h-4 text-[#687770]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#687770]" />
          )}
        </button>

        {showSiteConditions && (
          <div className="p-4 sm:p-5 border-t border-[#E5E7EB] space-y-5 bg-[#FCFCFA]">
            {/* Sanction Plan Status */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E]">
                Do you have sanctioned drawings or sketches?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PLAN_STATUS_OPTIONS.map((plan) => {
                  const isSelected = selectedPlanStatus === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanStatus(plan.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs'
                          : 'border-[#E5E7EB] bg-white hover:border-[#183B32]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#183B32]' : 'text-[#202522]'}`}>
                          {plan.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#183B32]" />}
                      </div>
                      <span className="text-[11px] text-[#687770] leading-snug block">
                        {plan.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Site Conditions & Demolition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E]">
                  Site Ground Condition
                </label>
                <div className="space-y-2">
                  {SITE_CONDITION_OPTIONS.map((cond) => {
                    const isSelected = selectedSiteCondition === cond.id;
                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => setSelectedSiteCondition(cond.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected ? 'border-[#183B32] bg-[#E8EFE9]' : 'border-[#E5E7EB] bg-white hover:border-[#183B32]/30'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-[#183B32]">{cond.label}</span>
                          <span className="block text-[10px] text-[#687770] truncate">{cond.desc}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#183B32] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E]">
                  Demolition or Existing Obstacles
                </label>
                <div className="space-y-2">
                  {DEMOLITION_OPTIONS.map((demo) => {
                    const isSelected = selectedDemolition === demo.id;
                    return (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() => setSelectedDemolition(demo.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected ? 'border-[#183B32] bg-[#E8EFE9]' : 'border-[#E5E7EB] bg-white hover:border-[#183B32]/30'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-[#183B32]">{demo.label}</span>
                          <span className="block text-[10px] text-[#687770] truncate">{demo.desc}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#183B32] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
