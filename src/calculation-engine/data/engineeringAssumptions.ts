// ============================================================
// CENTRALIZED ENGINEERING ASSUMPTIONS & PARAMETERS
// Defines engineering parameters, material ratios, planning assumptions.
// All values carry explicit units, sources, and client confirmation flags.
// ============================================================

export interface EngineeringAssumption {
  id: string;
  name: string;
  value: number;
  unit: string;
  source: string;
  requiresClientConfirmation: boolean;
  notes: string;
}

export const CENTRALIZED_ENGINEERING_ASSUMPTIONS: Record<string, EngineeringAssumption> = {
  // ── Planning & Space Assumptions ──
  coverageFactor: {
    id: 'coverageFactor',
    name: 'Ground Coverage Ratio',
    value: 0.60,
    unit: 'ratio',
    source: 'BBMP / BDA Planning Assumption',
    requiresClientConfirmation: true,
    notes: 'Max 60% of plot area is permissible buildable footprint unless site setbacks dictate otherwise.',
  },
  floorEfficiency: {
    id: 'floorEfficiency',
    name: 'Usable Floor Efficiency Ratio',
    value: 0.92,
    unit: 'ratio',
    source: 'Rightcon Planning Assumption — Requires Client Confirmation',
    requiresClientConfirmation: true,
    notes: 'Deducts 8% for external/internal wall thickness, structural columns, and service ducts.',
  },
  superBuaFactor: {
    id: 'superBuaFactor',
    name: 'Super Built-up Area Factor',
    value: 1.15,
    unit: 'multiplier',
    source: 'Standard Real Estate Planning Assumption',
    requiresClientConfirmation: true,
    notes: 'Includes wall thickness and common circulation space relative to carpet area.',
  },
  floorHeightFt: {
    id: 'floorHeightFt',
    name: 'Standard Floor-to-Floor Height',
    value: 10,
    unit: 'ft',
    source: 'NBC 2016 Guidelines',
    requiresClientConfirmation: false,
    notes: 'Clear height 10 ft per floor used for volume and perimeter calculations.',
  },

  // ── Soil & Structural Foundation ──
  soilBearingCapacity: {
    id: 'soilBearingCapacity',
    name: 'Nominal Soil Bearing Capacity',
    value: 180,
    unit: 'kN/sqm',
    source: 'Standard Residential Geotechnical Assumption — Requires Client Confirmation',
    requiresClientConfirmation: true,
    notes: 'Used for standard isolated footing & PCC bed structural sizing.',
  },

  // ── Material Consumption Coefficients (per sq.ft of BUA) ──
  steelKgPerSqFtEssential: {
    id: 'steelKgPerSqFtEssential',
    name: 'TMT Steel Ratio (Essential Tier)',
    value: 3.8,
    unit: 'kg/sqft',
    source: 'IS 456 / IS 13920 Design Benchmark',
    requiresClientConfirmation: false,
    notes: 'Standard structural framing consumption.',
  },
  steelKgPerSqFtPremium: {
    id: 'steelKgPerSqFtPremium',
    name: 'TMT Steel Ratio (Premium Tier)',
    value: 4.5,
    unit: 'kg/sqft',
    source: 'IS 456 / IS 13920 Design Benchmark',
    requiresClientConfirmation: false,
    notes: 'Heavy residential RCC framing with seismic ductility detailing.',
  },
  steelKgPerSqFtLuxury: {
    id: 'steelKgPerSqFtLuxury',
    name: 'TMT Steel Ratio (Luxury Tier)',
    value: 5.5,
    unit: 'kg/sqft',
    source: 'IS 456 / IS 13920 Design Benchmark',
    requiresClientConfirmation: false,
    notes: 'Long-span structural slab and column reinforcement.',
  },

  cementBagsPerSqFtEssential: {
    id: 'cementBagsPerSqFtEssential',
    name: 'OPC 53 Cement Bags Ratio (Essential Tier)',
    value: 0.38,
    unit: 'bags/sqft',
    source: 'Field QS Benchmark — Requires Client Confirmation',
    requiresClientConfirmation: true,
    notes: '50 kg bags per sq ft BUA across all structural concrete and masonry/plaster.',
  },
  cementBagsPerSqFtPremium: {
    id: 'cementBagsPerSqFtPremium',
    name: 'OPC 53 Cement Bags Ratio (Premium Tier)',
    value: 0.44,
    unit: 'bags/sqft',
    source: 'Field QS Benchmark — Requires Client Confirmation',
    requiresClientConfirmation: true,
    notes: '50 kg bags per sq ft BUA.',
  },
  cementBagsPerSqFtLuxury: {
    id: 'cementBagsPerSqFtLuxury',
    name: 'OPC 53 Cement Bags Ratio (Luxury Tier)',
    value: 0.50,
    unit: 'bags/sqft',
    source: 'Field QS Benchmark — Requires Client Confirmation',
    requiresClientConfirmation: true,
    notes: '50 kg bags per sq ft BUA.',
  },

  concreteCuMPerSqFtEssential: {
    id: 'concreteCuMPerSqFtEssential',
    name: 'Concrete Volume Ratio (Essential Tier)',
    value: 0.045,
    unit: 'cu.m/sqft',
    source: 'Structural Slab & Column Design Mix Estimation',
    requiresClientConfirmation: false,
    notes: 'Design volume of M25 RMC per sq ft BUA.',
  },
  concreteCuMPerSqFtPremium: {
    id: 'concreteCuMPerSqFtPremium',
    name: 'Concrete Volume Ratio (Premium Tier)',
    value: 0.052,
    unit: 'cu.m/sqft',
    source: 'Structural Slab & Column Design Mix Estimation',
    requiresClientConfirmation: false,
    notes: 'Design volume of M25 RMC per sq ft BUA.',
  },
  concreteCuMPerSqFtLuxury: {
    id: 'concreteCuMPerSqFtLuxury',
    name: 'Concrete Volume Ratio (Luxury Tier)',
    value: 0.060,
    unit: 'cu.m/sqft',
    source: 'Structural Slab & Column Design Mix Estimation',
    requiresClientConfirmation: false,
    notes: 'Design volume of M25 RMC per sq ft BUA.',
  },

  sandCuFtPerSqFtEssential: {
    id: 'sandCuFtPerSqFtEssential',
    name: 'Sand Consumption (Essential Tier)',
    value: 1.6,
    unit: 'cu.ft/sqft',
    source: 'Field QS Benchmark',
    requiresClientConfirmation: false,
    notes: 'M-Sand for masonry bed, plastering and PCC.',
  },
  sandCuFtPerSqFtPremium: {
    id: 'sandCuFtPerSqFtPremium',
    name: 'Sand Consumption (Premium Tier)',
    value: 1.8,
    unit: 'cu.ft/sqft',
    source: 'Field QS Benchmark',
    requiresClientConfirmation: false,
    notes: 'M-Sand for masonry bed, plastering and PCC.',
  },
  sandCuFtPerSqFtLuxury: {
    id: 'sandCuFtPerSqFtLuxury',
    name: 'Sand Consumption (Luxury Tier)',
    value: 2.0,
    unit: 'cu.ft/sqft',
    source: 'Field QS Benchmark',
    requiresClientConfirmation: false,
    notes: 'M-Sand for masonry bed, plastering and PCC.',
  },

  aggregateCuFtPerSqFtEssential: {
    id: 'aggregateCuFtPerSqFtEssential',
    name: 'Coarse Aggregate (Essential Tier)',
    value: 1.2,
    unit: 'cu.ft/sqft',
    source: 'Field QS Benchmark',
    requiresClientConfirmation: false,
    notes: '20mm coarse aggregate.',
  },
  aggregateCuFtPerSqFtPremium: {
    id: 'aggregateCuFtPerSqFtPremium',
    name: 'Coarse Aggregate (Premium Tier)',
    value: 1.5,
    unit: 'cu.ft/sqft',
    source: 'Field QS Benchmark',
    requiresClientConfirmation: false,
    notes: '20mm coarse aggregate.',
  },
  aggregateCuFtPerSqFtLuxury: {
    id: 'aggregateCuFtPerSqFtLuxury',
    name: 'Coarse Aggregate (Luxury Tier)',
    value: 1.7,
    unit: 'cu.ft/sqft',
    source: 'Field QS Benchmark',
    requiresClientConfirmation: false,
    notes: '20mm coarse aggregate.',
  },

  aacBlockCuMPerSqFtEssential: {
    id: 'aacBlockCuMPerSqFtEssential',
    name: 'AAC Block Volume (Essential Tier)',
    value: 0.055,
    unit: 'cu.m/sqft',
    source: 'Wall Masonry Schedule',
    requiresClientConfirmation: false,
    notes: '150mm & 100mm AAC blocks combined.',
  },
  aacBlockCuMPerSqFtPremium: {
    id: 'aacBlockCuMPerSqFtPremium',
    name: 'AAC Block Volume (Premium Tier)',
    value: 0.060,
    unit: 'cu.m/sqft',
    source: 'Wall Masonry Schedule',
    requiresClientConfirmation: false,
    notes: '150mm & 100mm AAC blocks combined.',
  },
  aacBlockCuMPerSqFtLuxury: {
    id: 'aacBlockCuMPerSqFtLuxury',
    name: 'AAC Block Volume (Luxury Tier)',
    value: 0.065,
    unit: 'cu.m/sqft',
    source: 'Wall Masonry Schedule',
    requiresClientConfirmation: false,
    notes: '150mm & 100mm AAC blocks combined.',
  },

  // ── Wastage Factors ──
  tileWastagePercentage: {
    id: 'tileWastagePercentage',
    name: 'Flooring Tile Cutting Wastage Factor',
    value: 7,
    unit: '%',
    source: 'Field QS Benchmark — Requires Client Confirmation',
    requiresClientConfirmation: true,
    notes: 'Cutting and transit allowance included in tile coverage factor.',
  },
  steelWastagePercentage: {
    id: 'steelWastagePercentage',
    name: 'Rebar Cutting & Lapping Wastage',
    value: 5,
    unit: '%',
    source: 'IS 2502 Benchmark',
    requiresClientConfirmation: false,
    notes: 'Standard 5% lapping and lap length addition.',
  },

  // ── Architectural & MEP Factors ──
  interiorPaintFactor: {
    id: 'interiorPaintFactor',
    name: 'Interior Paintable Surface Multiplier',
    value: 3.5,
    unit: 'multiplier',
    source: 'Rightcon Planning Assumption — Requires Client Confirmation',
    requiresClientConfirmation: true,
    notes: 'Multiplier on BUA accounting for 4 walls plus ceiling minus door/window openings.',
  },
  exteriorPaintFactor: {
    id: 'exteriorPaintFactor',
    name: 'Exterior Paint Returns Multiplier',
    value: 1.15,
    unit: 'multiplier',
    source: 'Field QS Benchmark',
    requiresClientConfirmation: false,
    notes: 'Multiplier on perimeter × total height to cover returns, parapet, and window reveals.',
  },
  wallTileSqFtPerBathroom: {
    id: 'wallTileSqFtPerBathroom',
    name: 'Bathroom Wall Dado Tile Area',
    value: 120,
    unit: 'sq.ft/bath',
    source: 'Rightcon Standard Schedule',
    requiresClientConfirmation: false,
    notes: '7 ft height dado tile cladding for standard bathroom dimensions.',
  },
  waterproofingSqFtPerBathroom: {
    id: 'waterproofingSqFtPerBathroom',
    name: 'Bathroom Waterproofing Area',
    value: 80,
    unit: 'sq.ft/bath',
    source: 'Rightcon Standard Schedule',
    requiresClientConfirmation: false,
    notes: 'Floor slab plus 300mm vertical turn-up.',
  },
  graniteSqFtPerFloor: {
    id: 'graniteSqFtPerFloor',
    name: 'Staircase Granite Slab Area',
    value: 180,
    unit: 'sq.ft/flight',
    source: 'Rightcon Standard Schedule',
    requiresClientConfirmation: false,
    notes: 'Treads, risers, and mid-landing per floor transition.',
  },
};
