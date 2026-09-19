// ============================================================
// CENTRALIZED ENGINEERING ASSUMPTIONS & PARAMETERS
// Authoritative parameter table per Hutty Quantity Calculation Engine Specification
// Every parameter carries: id, name, value, unit, spaceType, houseType,
// floorType, source, effectiveDate, category, requiresClientConfirmation, and notes.
// ============================================================

export type AssumptionCategory =
  | 'STATUTORY / CODE REQUIREMENT'
  | 'ENGINEERING ASSUMPTION'
  | 'QS/INDUSTRY BENCHMARK'
  | 'MARKET RATE'
  | 'BUSINESS RULE';

export interface QSParameterItem {
  id: string;
  name: string;
  value: number;
  unit: string;
  spaceType?: string;
  houseType?: string;
  floorType?: string;
  source: string;
  effectiveDate: string;
  category: AssumptionCategory;
  requiresClientConfirmation: boolean;
  notes?: string;
}

export interface RoomDimensionAssumption {
  spaceType: string;
  name: string;
  estimatedArea: number; // sq.ft
  estimatedLength: number; // ft
  estimatedWidth: number; // ft
  doorRequirement: number; // count
  windowRequirement: number; // count
  windowAreaSqFt: number; // sq.ft
  doorOpeningAreaSqFt: number; // sq.ft
  source: string;
  effectiveDate: string;
  requiresClientConfirmation: boolean;
}

export const CENTRALIZED_ENGINEERING_ASSUMPTIONS: Record<string, QSParameterItem> = {
  // ── 1. Planning, Floor Height & Space Geometry ──
  wallHeightFt: {
    id: 'wallHeightFt',
    name: 'Standard Wall Height',
    value: 10,
    unit: 'ft',
    source: 'Hutty Pilot Spec / NBC 2016 Guidelines',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: true,
    notes: 'Standard residential clear floor-to-ceiling wall height. Consumed by room wall perimeters, external walls, plaster, paint, and masonry.',
  },

  coverageFactor: {
    id: 'coverageFactor',
    name: 'Ground Coverage Factor (Benchmark)',
    value: 0.60,
    unit: 'ratio',
    source: 'BBMP / BDA / MUDA Planning By-laws Benchmark',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: true,
    notes: 'Max 60% ground coverage fallback assumption when setbacks are not explicitly configured.',
  },

  superBuaFactor: {
    id: 'superBuaFactor',
    name: 'Super Built-up Area Factor',
    value: 1.15,
    unit: 'multiplier',
    source: 'Standard Real Estate Planning Assumption',
    effectiveDate: '2026-01-01',
    category: 'QS/INDUSTRY BENCHMARK',
    requiresClientConfirmation: true,
    notes: 'Super BUA = Usable BUA × 1.15.',
  },

  // ── 2. Structural Steel Thumb Rule (PDF Section 6) ──
  steelBaseFactor: {
    id: 'steelBaseFactor',
    name: 'Base Steel Consumption Factor',
    value: 2.8,
    unit: 'kg/sqft',
    source: 'Hutty Pilot Spec (Section 6)',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: 'Base rebar factor for first floor (Ground).',
  },
  steelAdditionalFloorFactor: {
    id: 'steelAdditionalFloorFactor',
    name: 'Steel Additional Floor Factor',
    value: 0.2,
    unit: 'kg/sqft/floor',
    source: 'Hutty Pilot Spec (Section 6)',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: '+0.2 kg/sqft for every floor after the first: 2.8 + [0.2 × (Floors - 1)].',
  },
  steelWastagePercentage: {
    id: 'steelWastagePercentage',
    name: 'Steel Cutting & Lapping Wastage',
    value: 5,
    unit: '%',
    source: 'IS 2502 Benchmark',
    effectiveDate: '2026-01-01',
    category: 'STATUTORY / CODE REQUIREMENT',
    requiresClientConfirmation: false,
    notes: 'IS 2502 standard 5% cutting and lapping buffer.',
  },

  // ── 3. Direct Material Thumb Rules (PDF Section 7 - 11) ──
  cementBagsPerSqFt: {
    id: 'cementBagsPerSqFt',
    name: 'Cement Starting Thumb Rule',
    value: 0.40,
    unit: 'bags/sqft',
    source: 'Hutty Pilot Spec (Section 8)',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: 'Starting parameter: 0.40 50kg bags per sq.ft of total BUA.',
  },
  mSandCuFtPerSqFt: {
    id: 'mSandCuFtPerSqFt',
    name: 'M-Sand Starting Thumb Rule',
    value: 0.60,
    unit: 'cu.ft/sqft',
    source: 'Hutty Pilot Spec (Section 9)',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: 'Starting parameter: 0.60 CFT/sqft of total BUA for concrete/fine-aggregate.',
  },
  pSandCuFtPerSqFt: {
    id: 'pSandCuFtPerSqFt',
    name: 'P-Sand Starting Thumb Rule',
    value: 0.60,
    unit: 'cu.ft/sqft',
    source: 'Hutty Pilot Spec (Section 10)',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: 'Starting parameter: 0.60 CFT/sqft of total BUA for masonry/plastering demand.',
  },
  coarseAggregateCuFtPerSqFt: {
    id: 'coarseAggregateCuFtPerSqFt',
    name: 'Coarse Aggregate Starting Thumb Rule',
    value: 1.35,
    unit: 'cu.ft/sqft',
    source: 'Hutty Pilot Spec (Section 11)',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: 'Starting parameter: 1.35 CFT/sqft of total BUA (20mm & 12mm graded aggregate).',
  },

  // ── 4. Masonry & Wall Parameters (PDF Section 12) ──
  externalWallThicknessM: {
    id: 'externalWallThicknessM',
    name: 'External Wall Thickness',
    value: 0.15, // 150mm (6 inch)
    unit: 'm',
    source: 'Hutty Pilot Spec / Standard AAC Masonry',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: 'Standard 150mm external perimeter wall block thickness.',
  },
  internalWallThicknessM: {
    id: 'internalWallThicknessM',
    name: 'Internal Wall Thickness',
    value: 0.10, // 100mm (4 inch)
    unit: 'm',
    source: 'Hutty Pilot Spec / Standard AAC Masonry',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: 'Standard 100mm internal partition wall block thickness.',
  },
  aacBlockUnitVolumeCuM: {
    id: 'aacBlockUnitVolumeCuM',
    name: 'Standard AAC Block Unit Volume',
    value: 0.018, // 600mm × 200mm × 150mm = 0.018 m3
    unit: 'cu.m/block',
    source: 'IS 2185 Part 3 Standard Block Size (600×200×150mm)',
    effectiveDate: '2026-01-01',
    category: 'QS/INDUSTRY BENCHMARK',
    requiresClientConfirmation: false,
    notes: 'Unit volume used to derive block piece count: Wall Volume ÷ Block Volume.',
  },
  masonryWastagePercentage: {
    id: 'masonryWastagePercentage',
    name: 'Masonry Block Cutting Wastage',
    value: 5,
    unit: '%',
    source: 'Field QS Benchmark',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: '5% cutting, chases, and handling breakage allowance for blocks.',
  },
  clayBrickUnitVolumeCuM: {
    id: 'clayBrickUnitVolumeCuM',
    name: 'Standard Modular Clay Brick Unit Volume',
    value: 0.001539, // 190mm × 90mm × 90mm = 0.001539 m3
    unit: 'cu.m/brick',
    source: 'IS 1077 Standard Brick Size (190×90×90mm)',
    effectiveDate: '2026-01-01',
    category: 'QS/INDUSTRY BENCHMARK',
    requiresClientConfirmation: false,
    notes: 'Unit volume used to derive brick count: Wall Volume ÷ Brick Volume.',
  },
  clayBrickWastagePercentage: {
    id: 'clayBrickWastagePercentage',
    name: 'Clay Brick Cutting & Breakage Wastage',
    value: 7,
    unit: '%',
    source: 'Field QS Benchmark / IS 2212',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: '7% cutting and site handling breakage allowance for clay bricks.',
  },
  concreteBlockUnitVolumeCuM: {
    id: 'concreteBlockUnitVolumeCuM',
    name: 'Standard Solid Concrete Block Unit Volume',
    value: 0.012, // 400mm × 200mm × 150mm = 0.012 m3
    unit: 'cu.m/block',
    source: 'IS 2185 Part 1 Standard Block Size (400×200×150mm)',
    effectiveDate: '2026-01-01',
    category: 'QS/INDUSTRY BENCHMARK',
    requiresClientConfirmation: false,
    notes: 'Unit volume used to derive concrete block count: Wall Volume ÷ Block Volume.',
  },

  // ── 5. Flooring & Cladding Parameters (PDF Section 15, 16) ──
  flooringWastagePercentage: {
    id: 'flooringWastagePercentage',
    name: 'Flooring Tile Cutting Wastage',
    value: 7,
    unit: '%',
    source: 'Hutty Pilot Spec (Section 15)',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: '7% cutting and perimeter fitting allowance.',
  },
  bathroomDadoHeightStandardFt: {
    id: 'bathroomDadoHeightStandardFt',
    name: 'Standard Bathroom Dado Height (Lintel)',
    value: 7,
    unit: 'ft',
    source: 'Hutty Pilot Spec / Rightcon Standard Schedule',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: '7 ft lintel-level wall tile cladding.',
  },
  bathroomDadoHeightFullFt: {
    id: 'bathroomDadoHeightFullFt',
    name: 'Full Height Bathroom Dado Height (Ceiling)',
    value: 10,
    unit: 'ft',
    source: 'Hutty Pilot Spec / Rightcon Standard Schedule',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: 'Full 10 ft ceiling height wall tile cladding.',
  },
  kitchenDadoHeightStandardFt: {
    id: 'kitchenDadoHeightStandardFt',
    name: 'Standard Kitchen Backsplash Height',
    value: 2,
    unit: 'ft',
    source: 'Hutty Pilot Spec / Rightcon Standard Schedule',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: '2 ft counter splashback tile cladding.',
  },
  kitchenDadoHeightExtendedFt: {
    id: 'kitchenDadoHeightExtendedFt',
    name: 'Extended Kitchen Backsplash Height',
    value: 4,
    unit: 'ft',
    source: 'Hutty Pilot Spec / Rightcon Standard Schedule',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: '4 ft counter splashback tile cladding.',
  },
  kitchenCounterLengthFt: {
    id: 'kitchenCounterLengthFt',
    name: 'Standard Kitchen Counter Length',
    value: 15,
    unit: 'ft',
    source: 'Rightcon Standard Schedule',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: 'Standard L-shape or straight kitchen counter length per kitchen.',
  },

  // ── 6. Waterproofing Parameters (PDF Section 23) ──
  bathroomWaterproofingUpturnFt: {
    id: 'bathroomWaterproofingUpturnFt',
    name: 'Bathroom Waterproofing Wall Upturn Height',
    value: 1.0, // 300mm
    unit: 'ft',
    source: 'Hutty Pilot Spec (Section 23) / IS 3067',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: true,
    notes: 'Sunken slab floor + 1.0 ft (300mm) vertical upturn on all perimeter walls.',
  },
  terraceWaterproofingFactor: {
    id: 'terraceWaterproofingFactor',
    name: 'Terrace Waterproofing Coverage Factor',
    value: 1.0,
    unit: 'ratio',
    source: 'Hutty Pilot Spec (Section 23)',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: '100% of exposed top slab terrace area receives Brick Bat Coba + membrane.',
  },
  sumpWaterproofingSqFt: {
    id: 'sumpWaterproofingSqFt',
    name: 'Underground Sump Waterproofing Surface Area',
    value: 120,
    unit: 'sq.ft',
    source: 'Rightcon Standard Water System Schedule',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: true,
    notes: 'Surface area for standard 5000L RCC underground sump tank.',
  },

  // ── 7. Electrical & Plumbing Route Parameters (PDF Section 19, 20) ──
  conduitMPerPoint: {
    id: 'conduitMPerPoint',
    name: 'Electrical Conduit Run per Point',
    value: 2.8,
    unit: 'm/point',
    source: 'Hutty Pilot Spec (Section 19)',
    effectiveDate: '2026-01-01',
    category: 'QS/INDUSTRY BENCHMARK',
    requiresClientConfirmation: false,
    notes: 'Average conduit length per electrical point including slab and drop runs.',
  },
  wireMPerPoint: {
    id: 'wireMPerPoint',
    name: 'Electrical Wire Run per Point',
    value: 5.5,
    unit: 'm/point',
    source: 'Hutty Pilot Spec (Section 19)',
    effectiveDate: '2026-01-01',
    category: 'QS/INDUSTRY BENCHMARK',
    requiresClientConfirmation: false,
    notes: 'Average wire length across Phase, Neutral, Earth circuits per point.',
  },
  cpvcMPerPoint: {
    id: 'cpvcMPerPoint',
    name: 'CPVC Water Supply Pipe per Water Point',
    value: 4.5,
    unit: 'm/point',
    source: 'Hutty Pilot Spec (Section 20)',
    effectiveDate: '2026-01-01',
    category: 'QS/INDUSTRY BENCHMARK',
    requiresClientConfirmation: false,
    notes: 'Average CPVC supply run per water point including hot & cold loops.',
  },
  swrMPerPoint: {
    id: 'swrMPerPoint',
    name: 'SWR Drainage Pipe per Drainage Point',
    value: 3.5,
    unit: 'm/point',
    source: 'Hutty Pilot Spec (Section 20)',
    effectiveDate: '2026-01-01',
    category: 'QS/INDUSTRY BENCHMARK',
    requiresClientConfirmation: false,
    notes: 'Average SWR soil and waste drain line run per trap/fixture point.',
  },
  verticalRiserAllowanceM: {
    id: 'verticalRiserAllowanceM',
    name: 'Plumbing Vertical Shaft Riser Allowance per Floor',
    value: 12,
    unit: 'm/floor',
    source: 'Hutty Pilot Spec (Section 20)',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: 'Vertical main header pipes from sump to overhead tank and drainage stack.',
  },

  // ── 8. Water Tank Occupancy Proxy (PDF Section 22) ──
  occupantsPerBedroom: {
    id: 'occupantsPerBedroom',
    name: 'Estimated Occupants per Bedroom',
    value: 2,
    unit: 'persons/bed',
    source: 'Hutty Pilot Spec (Section 22) / NBC 2016',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: 'NBC occupancy proxy: 2 occupants per master/secondary bedroom.',
  },
  dailyWaterDemandLPCD: {
    id: 'dailyWaterDemandLPCD',
    name: 'Daily Water Demand per Person',
    value: 135,
    unit: 'litres/person/day',
    source: 'IS 1172 Standard Code of Basic Requirements for Water Supply',
    effectiveDate: '2026-01-01',
    category: 'STATUTORY / CODE REQUIREMENT',
    requiresClientConfirmation: false,
    notes: 'Standard residential domestic water requirement = 135 LPCD.',
  },
  waterStorageDays: {
    id: 'waterStorageDays',
    name: 'Water Storage Capacity Days',
    value: 1.5,
    unit: 'days',
    source: 'Hutty Pilot Spec (Section 22)',
    effectiveDate: '2026-01-01',
    category: 'ENGINEERING ASSUMPTION',
    requiresClientConfirmation: false,
    notes: 'Storage reserve buffer for municipal/borewell supply.',
  },

  // ── 9. Commercial & Statutory Markups ──
  gstRate: {
    id: 'gstRate',
    name: 'GST Rate on Construction Works Contract',
    value: 0.18,
    unit: 'rate',
    source: 'GST Council Works Contract Notification',
    effectiveDate: '2026-01-01',
    category: 'STATUTORY / CODE REQUIREMENT',
    requiresClientConfirmation: false,
    notes: '18% GST standard on residential construction works contracts.',
  },
  contractorMarginRate: {
    id: 'contractorMarginRate',
    name: 'Contractor Overhead & Margin',
    value: 0.15,
    unit: 'rate',
    source: 'Hutty Business Model',
    effectiveDate: '2026-01-01',
    category: 'BUSINESS RULE',
    requiresClientConfirmation: true,
    notes: '15% contractor site overheads, equipment management, and profit margin.',
  },
  professionalFeesRate: {
    id: 'professionalFeesRate',
    name: 'Professional Fees (Architect, Structural & MEP)',
    value: 0.05,
    unit: 'rate',
    source: 'Hutty Business Model',
    effectiveDate: '2026-01-01',
    category: 'BUSINESS RULE',
    requiresClientConfirmation: true,
    notes: '5% fees covering architectural plans, structural engineering, and site inspections.',
  },
  contingencyRate: {
    id: 'contingencyRate',
    name: 'Contingency Reserve',
    value: 0.06,
    unit: 'rate',
    source: 'Hutty Risk Management Standard',
    effectiveDate: '2026-01-01',
    category: 'BUSINESS RULE',
    requiresClientConfirmation: true,
    notes: '6% contingency buffer for soil surprises and price escalation.',
  },
};

// ── Canonical Configurable Room Size Assumptions (PDF Section 4 & Section 27) ──
export const ROOM_SIZE_ASSUMPTIONS: Record<string, RoomDimensionAssumption> = {
  bedroom: {
    spaceType: 'bedroom',
    name: 'Standard Bedroom',
    estimatedArea: 140, // 14 × 10 ft
    estimatedLength: 14,
    estimatedWidth: 10,
    doorRequirement: 1,
    windowRequirement: 1,
    windowAreaSqFt: 20, // 5×4 ft window
    doorOpeningAreaSqFt: 21, // 3×7 ft door
    source: 'Hutty Pilot Spec (Section 4)',
    effectiveDate: '2026-01-01',
    requiresClientConfirmation: true,
  },
  bathroom: {
    spaceType: 'bathroom',
    name: 'Standard Bathroom / Toilet',
    estimatedArea: 30, // 6 × 5 ft standard (Sept 19 Meeting standard)
    estimatedLength: 6,
    estimatedWidth: 5,
    doorRequirement: 1,
    windowRequirement: 1,
    windowAreaSqFt: 6, // 2×3 ft ventilator
    doorOpeningAreaSqFt: 17.5, // 2.5×7 ft door
    source: 'Minutes of Meeting (September 19, 2026)',
    effectiveDate: '2026-01-01',
    requiresClientConfirmation: false,
  },
  commonToilet: {
    spaceType: 'commonToilet',
    name: 'Common Toilet / Powder Room',
    estimatedArea: 20, // 5 × 4 ft standard
    estimatedLength: 5,
    estimatedWidth: 4,
    doorRequirement: 1,
    windowRequirement: 1,
    windowAreaSqFt: 6, // 2×3 ft ventilator
    doorOpeningAreaSqFt: 17.5,
    source: 'Minutes of Meeting (September 19, 2026)',
    effectiveDate: '2026-01-01',
    requiresClientConfirmation: false,
  },
  kitchen: {
    spaceType: 'kitchen',
    name: 'Kitchen Space',
    estimatedArea: 90, // 10 × 9 ft
    estimatedLength: 10,
    estimatedWidth: 9,
    doorRequirement: 1,
    windowRequirement: 1,
    windowAreaSqFt: 12, // 4×3 ft window
    doorOpeningAreaSqFt: 21,
    source: 'Hutty Pilot Spec (Section 4)',
    effectiveDate: '2026-01-01',
    requiresClientConfirmation: true,
  },
  living: {
    spaceType: 'living',
    name: 'Living Room / Hall',
    estimatedArea: 200, // 16 × 12.5 ft
    estimatedLength: 16,
    estimatedWidth: 12.5,
    doorRequirement: 0, // Main door is dwelling-level
    windowRequirement: 2,
    windowAreaSqFt: 60, // 2 × 6×5 ft windows
    doorOpeningAreaSqFt: 0,
    source: 'Hutty Pilot Spec (Section 4)',
    effectiveDate: '2026-01-01',
    requiresClientConfirmation: true,
  },
  dining: {
    spaceType: 'dining',
    name: 'Dining Area',
    estimatedArea: 120, // 12 × 10 ft
    estimatedLength: 12,
    estimatedWidth: 10,
    doorRequirement: 0,
    windowRequirement: 1,
    windowAreaSqFt: 15, // 5×3 ft window
    doorOpeningAreaSqFt: 0,
    source: 'Hutty Pilot Spec (Section 4)',
    effectiveDate: '2026-01-01',
    requiresClientConfirmation: true,
  },
  balcony: {
    spaceType: 'balcony',
    name: 'Balcony / Verandah',
    estimatedArea: 50, // 10 × 5 ft
    estimatedLength: 10,
    estimatedWidth: 5,
    doorRequirement: 1, // Sliding or flush door from room
    windowRequirement: 0,
    windowAreaSqFt: 0,
    doorOpeningAreaSqFt: 21,
    source: 'Hutty Pilot Spec (Section 4)',
    effectiveDate: '2026-01-01',
    requiresClientConfirmation: true,
  },
  utility: {
    spaceType: 'utility',
    name: 'Utility / Service Area',
    estimatedArea: 40, // 8 × 5 ft
    estimatedLength: 8,
    estimatedWidth: 5,
    doorRequirement: 1,
    windowRequirement: 1,
    windowAreaSqFt: 8,
    doorOpeningAreaSqFt: 17.5,
    source: 'Hutty Pilot Spec (Section 4)',
    effectiveDate: '2026-01-01',
    requiresClientConfirmation: true,
  },
  pooja: {
    spaceType: 'pooja',
    name: 'Pooja Room',
    estimatedArea: 25, // 5 × 5 ft
    estimatedLength: 5,
    estimatedWidth: 5,
    doorRequirement: 1,
    windowRequirement: 0,
    windowAreaSqFt: 0,
    doorOpeningAreaSqFt: 17.5,
    source: 'Hutty Pilot Spec (Section 4)',
    effectiveDate: '2026-01-01',
    requiresClientConfirmation: true,
  },
  office: {
    spaceType: 'office',
    name: 'Study / Home Office',
    estimatedArea: 100, // 10 × 10 ft
    estimatedLength: 10,
    estimatedWidth: 10,
    doorRequirement: 1,
    windowRequirement: 1,
    windowAreaSqFt: 15,
    doorOpeningAreaSqFt: 21,
    source: 'Hutty Pilot Spec (Section 4)',
    effectiveDate: '2026-01-01',
    requiresClientConfirmation: true,
  },
  storeRoom: {
    spaceType: 'storeRoom',
    name: 'Store Room',
    estimatedArea: 35, // 7 × 5 ft
    estimatedLength: 7,
    estimatedWidth: 5,
    doorRequirement: 1,
    windowRequirement: 0,
    windowAreaSqFt: 0,
    doorOpeningAreaSqFt: 17.5,
    source: 'Hutty Pilot Spec (Section 4)',
    effectiveDate: '2026-01-01',
    requiresClientConfirmation: true,
  },
};
