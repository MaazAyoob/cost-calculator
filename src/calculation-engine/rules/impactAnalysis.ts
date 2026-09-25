// ============================================================
// CALCULATION RULE ENGINE — PARAMETER IMPACT GRAPH & SIMULATION
// Part 28, 29, 44 — Deterministic Impact Mapping & Calculation Comparison
// ============================================================

import { runCalculator } from '../calculator';
import type { EngineInput, CalculationResult } from '../types';
import type { ResolvedCalculationConfiguration } from '../config/types';
import { configResolver } from '../config/configurationResolver';

export interface ParameterImpactMetadata {
  parameterKey: string;
  name: string;
  category: string;
  explanation: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedMetrics: string[];
  affectedBOQLines: string[];
  affectedCostHeads: string[];
  affectedReportSections: string[];
  downstreamParameters?: string[];
}

export interface MetricDelta {
  metricKey: string;
  name: string;
  unit: string;
  oldValue: number;
  newValue: number;
  delta: number;
  percentChange: number;
}

export interface BOQLineDelta {
  lineId: string;
  title: string;
  category: string;
  unit: string;
  oldQuantity: number;
  newQuantity: number;
  quantityDelta: number;
  oldTotal: number;
  newTotal: number;
  costDelta: number;
  percentChange: number;
}

export interface SimulationComparisonReport {
  timestamp: string;
  baseVersion: string;
  draftVersion: string;
  changedParameters: Array<{
    key: string;
    name: string;
    oldValue: any;
    newValue: any;
    unit?: string;
    impact: ParameterImpactMetadata;
  }>;
  totalCost: {
    oldCost: number;
    newCost: number;
    delta: number;
    percentChange: number;
  };
  keyMetrics: MetricDelta[];
  affectedBOQLines: BOQLineDelta[];
  severitySummary: {
    criticalCount: number;
    highCount: number;
    requiresConfirmation: boolean;
    warnings: string[];
  };
  oldResult: CalculationResult;
  newResult: CalculationResult;
}

// ------------------------------------------------------------
// PARAMETER IMPACT GRAPH REGISTRY
// Maps every core configuration parameter to its downstream cascade
// ------------------------------------------------------------
export const PARAMETER_IMPACT_REGISTRY: Record<string, ParameterImpactMetadata> = {
  'structure.wall_height_ft': {
    parameterKey: 'structure.wall_height_ft',
    name: 'Standard Wall Height',
    category: 'STRUCTURE',
    explanation: 'Vertical wall geometry used for masonry, plastering, internal/external paint, and structural loads.',
    severity: 'CRITICAL',
    affectedMetrics: ['internalWallArea', 'externalWallArea', 'totalWallArea', 'roomWallVolume'],
    affectedBOQLines: [
      'AAC Block Masonry 150mm',
      'Solid Concrete Block Masonry 200mm',
      'Internal 2-Coat Plastering',
      'External Plastering with Waterproofing Admixture',
      'Interior Acrylic Emulsion Paint',
      'Exterior Weatherproof Emulsion',
      'Wall Putty (2 Coats)'
    ],
    affectedCostHeads: ['Masonry Materials', 'Finishing Materials', 'Masonry Labour', 'Plastering & Painting Labour'],
    affectedReportSections: ['BOQ Schedule', 'Civil Works', 'Finishing & Painting', 'Summary & Recommendation'],
    downstreamParameters: ['masonry.external_wall_thickness_mm', 'paint.interior_coverage_sqft_per_litre']
  },
  'rcc.steel_base_factor_kg_sqft': {
    parameterKey: 'rcc.steel_base_factor_kg_sqft',
    name: 'Steel Base Factor',
    category: 'RCC',
    explanation: 'Fundamental reinforcement steel quantity per square foot of built-up area for ground level.',
    severity: 'CRITICAL',
    affectedMetrics: ['steelWeightKg', 'steelTonnage', 'totalSteelCost'],
    affectedBOQLines: ['Fe550D TMT Reinforcement Steel'],
    affectedCostHeads: ['Structural Steel Material', 'Bar Bending Labour'],
    affectedReportSections: ['Structural Schedule', 'Material Consumption', 'Summary & Cost Breakdown'],
    downstreamParameters: ['rcc.steel_floor_increment_kg_sqft']
  },
  'rcc.steel_floor_increment_kg_sqft': {
    parameterKey: 'rcc.steel_floor_increment_kg_sqft',
    name: 'Steel Floor Increment Factor',
    category: 'RCC',
    explanation: 'Additional reinforcement required per upper floor slab and column due to vertical load accumulation.',
    severity: 'HIGH',
    affectedMetrics: ['upperFloorSteelKg', 'totalSteelTonnage'],
    affectedBOQLines: ['Fe550D TMT Reinforcement Steel'],
    affectedCostHeads: ['Structural Steel Material'],
    affectedReportSections: ['Structural Schedule', 'Multi-Floor Analysis']
  },
  'config.rcc.concrete_factor_cum_sqft': {
    parameterKey: 'config.rcc.concrete_factor_cum_sqft',
    name: 'Structural Concrete Factor',
    category: 'RCC',
    explanation: 'Overall structural concrete volume factor per sqft BUA driving footing, column, slab, and plinth casting.',
    severity: 'CRITICAL',
    affectedMetrics: ['approxConcreteCuM', 'footingConcreteCuM', 'columnConcreteCuM', 'slabConcreteCuM', 'rccConcreteTotalCuM'],
    affectedBOQLines: ['Isolated / Combined Column Footing RCC M25', 'RCC Columns M25 Casting', 'RCC Beams & Roof/Floor Slabs M25 Monolithic Pour'],
    affectedCostHeads: ['Ready Mix Concrete', 'RCC Works Labour', 'Structural Budget'],
    affectedReportSections: ['Key Structural & Concrete Quantities', 'Structural Schedule', 'BOQ Cost Breakdown'],
  },
  'config.rcc.footing_allocation_pct': {
    parameterKey: 'config.rcc.footing_allocation_pct',
    name: 'Footing Concrete Allocation',
    category: 'RCC',
    explanation: 'Percentage of structural concrete volume apportioned to foundation footings.',
    severity: 'HIGH',
    affectedMetrics: ['footingConcreteCuM', 'rccConcreteTotalCuM'],
    affectedBOQLines: ['Isolated / Combined Column Footing RCC M25'],
    affectedCostHeads: ['Foundation Concrete', 'Substructure Cost'],
    affectedReportSections: ['Key Structural & Concrete Quantities', 'Foundation Schedule'],
  },
  'config.rcc.column_allocation_pct': {
    parameterKey: 'config.rcc.column_allocation_pct',
    name: 'Column Concrete Allocation',
    category: 'RCC',
    explanation: 'Percentage of structural concrete volume apportioned to vertical column stems.',
    severity: 'HIGH',
    affectedMetrics: ['columnConcreteCuM', 'rccConcreteTotalCuM'],
    affectedBOQLines: ['RCC Columns M25 Casting'],
    affectedCostHeads: ['Column Concrete', 'Superstructure Cost'],
    affectedReportSections: ['Key Structural & Concrete Quantities', 'Superstructure Schedule'],
  },
  'config.rcc.slab_allocation_pct': {
    parameterKey: 'config.rcc.slab_allocation_pct',
    name: 'Slab Concrete Allocation',
    category: 'RCC',
    explanation: 'Percentage of structural concrete volume apportioned to suspended slabs and beams.',
    severity: 'HIGH',
    affectedMetrics: ['slabConcreteCuM', 'rccConcreteTotalCuM'],
    affectedBOQLines: ['RCC Beams & Roof/Floor Slabs M25 Monolithic Pour'],
    affectedCostHeads: ['Slab Concrete', 'Superstructure Cost'],
    affectedReportSections: ['Key Structural & Concrete Quantities', 'Superstructure Schedule'],
  },
  'rcc.cement_factor_bags_sqft': {
    parameterKey: 'rcc.cement_factor_bags_sqft',
    name: 'Cement Factor',
    category: 'RCC',
    explanation: 'Primary cement quantity required per square foot for concrete, masonry mortar, and plaster.',
    severity: 'CRITICAL',
    affectedMetrics: ['totalCementBags', 'totalCementCost'],
    affectedBOQLines: ['OPC 53 Grade Structural Cement', 'PPC Finishing Cement'],
    affectedCostHeads: ['Cement Material'],
    affectedReportSections: ['Material Consumption', 'Procurement Schedule', 'Total Cost']
  },
  'paint.interior_coverage_sqft_per_litre': {
    parameterKey: 'paint.interior_coverage_sqft_per_litre',
    name: 'Interior Paint Coverage',
    category: 'PAINT',
    explanation: 'Effective spreading rate in sqft per litre for internal wall emulsion.',
    severity: 'HIGH',
    affectedMetrics: ['interiorPaintLitres', 'interiorPaintCost'],
    affectedBOQLines: ['Interior Premium Acrylic Emulsion'],
    affectedCostHeads: ['Paint Material'],
    affectedReportSections: ['Finishes Schedule', 'Paint Breakdown']
  },
  'paint.interior_coats': {
    parameterKey: 'paint.interior_coats',
    name: 'Interior Paint Coats',
    category: 'PAINT',
    explanation: 'Number of coats required for interior emulsion application.',
    severity: 'MEDIUM',
    affectedMetrics: ['interiorPaintLitres', 'paintingLabourDays'],
    affectedBOQLines: ['Interior Premium Acrylic Emulsion'],
    affectedCostHeads: ['Paint Material', 'Painting Labour'],
    affectedReportSections: ['Finishes Schedule']
  },
  'flooring.tile_wastage_percent': {
    parameterKey: 'flooring.tile_wastage_percent',
    name: 'Flooring Tile Wastage',
    category: 'FLOORING',
    explanation: 'Allowance for cutting, breakage, and room edge adjustments for floor tiles.',
    severity: 'MEDIUM',
    affectedMetrics: ['grossFlooringTileSqft', 'flooringCost'],
    affectedBOQLines: ['Vitrified Living/Bed Flooring 800x1600mm', 'Anti-Skid Ceramic Tile'],
    affectedCostHeads: ['Flooring Materials'],
    affectedReportSections: ['Flooring Schedule', 'Bill of Quantities']
  },
  'commercial.contractor_margin_percent': {
    parameterKey: 'commercial.contractor_margin_percent',
    name: 'Contractor Margin',
    category: 'COMMERCIAL',
    explanation: 'Contractor overhead and profit margin applied in Turnkey / Contractor procurement mode.',
    severity: 'CRITICAL',
    affectedMetrics: ['contractorMarginAmount', 'totalProjectCost'],
    affectedBOQLines: ['Contractor Overhead & Margin'],
    affectedCostHeads: ['Commercial Overheads', 'Contractor Fee'],
    affectedReportSections: ['Financial Summary', 'Commercial Breakdown']
  },
  'commercial.gst_percent': {
    parameterKey: 'commercial.gst_percent',
    name: 'GST Rate',
    category: 'COMMERCIAL',
    explanation: 'Statutory goods and services tax rate applicable on residential construction contracts.',
    severity: 'CRITICAL',
    affectedMetrics: ['gstAmount', 'totalProjectCostWithTax'],
    affectedBOQLines: ['GST on Works Contract'],
    affectedCostHeads: ['Statutory Taxes'],
    affectedReportSections: ['Commercial Summary', 'Tax Invoicing Schedule']
  },
  'waterproofing.bathroom_upturn_height_mm': {
    parameterKey: 'waterproofing.bathroom_upturn_height_mm',
    name: 'Bathroom Waterproofing Upturn Height',
    category: 'WATERPROOFING',
    explanation: 'Vertical upturn height along wet walls for liquid waterproofing membrane.',
    severity: 'MEDIUM',
    affectedMetrics: ['bathroomWaterproofingAreaSqft'],
    affectedBOQLines: ['Cementitious Waterproofing Membrane with Upturn'],
    affectedCostHeads: ['Waterproofing Materials & Specialist Labour'],
    affectedReportSections: ['Waterproofing Schedule']
  },
  'space.master_bedroom_default_width_ft': {
    parameterKey: 'space.master_bedroom_default_width_ft',
    name: 'Master Bedroom Default Width',
    category: 'SPACE_ROOMS',
    explanation: 'Template width for master bedrooms used when rooms are synthesized from templates.',
    severity: 'HIGH',
    affectedMetrics: ['masterBedroomArea', 'carpetArea', 'builtUpArea', 'tileArea'],
    affectedBOQLines: ['Vitrified Floor Tiles', 'Internal Plaster', 'Interior Emulsion'],
    affectedCostHeads: ['Flooring', 'Finishing', 'Total Project Cost'],
    affectedReportSections: ['Space Planning', 'Area Statement', 'BOQ Schedule']
  },
  'space.bathroom_default_width_ft': {
    parameterKey: 'space.bathroom_default_width_ft',
    name: 'Bathroom Default Width',
    category: 'SPACE_ROOMS',
    explanation: 'Template width for bathrooms controlling floor tile, dado wall tiles, and plumbing point runs.',
    severity: 'HIGH',
    affectedMetrics: ['bathroomFloorArea', 'bathroomDadoArea', 'wetAreaWaterproofing'],
    affectedBOQLines: ['Dado Ceramic Wall Tiles', 'Anti-Skid Bathroom Flooring', 'Bathroom Waterproofing'],
    affectedCostHeads: ['Tile Materials', 'Tiling Labour', 'Sanitary & Plumbing'],
    affectedReportSections: ['Sanitary & Plumbing Schedule', 'Finishes Schedule']
  },
  'space.bathroom_dado_height_ft': {
    parameterKey: 'space.bathroom_dado_height_ft',
    name: 'Bathroom Dado Tile Height',
    category: 'SPACE_ROOMS',
    explanation: 'Height of glazed wall tiles installed around shower and toilet perimeters.',
    severity: 'HIGH',
    affectedMetrics: ['bathroomDadoAreaSqft'],
    affectedBOQLines: ['Glazed Ceramic Dado Wall Tiles up to 7/8ft'],
    affectedCostHeads: ['Tile Materials', 'Tiling Labour'],
    affectedReportSections: ['Finishes Schedule']
  },
  'electrical.points_per_room_default': {
    parameterKey: 'electrical.points_per_room_default',
    name: 'Default Electrical Points per Room',
    category: 'ELECTRICAL',
    explanation: 'Standard baseline count of electrical switch modules, lights, and sockets per standard room template.',
    severity: 'HIGH',
    affectedMetrics: ['totalElectricalPoints', 'conduitPipeLengthM', 'copperWireLengthM'],
    affectedBOQLines: ['Modular Switches & Plates', 'FRLS Copper Wire 1.5/2.5/4.0 sqmm', 'PVC Conduit Pipes 25mm'],
    affectedCostHeads: ['Electrical Materials', 'Electrical Labour'],
    affectedReportSections: ['Electrical Schedule', 'Services Summary']
  },
  'plumbing.cpvc_length_per_point_m': {
    parameterKey: 'plumbing.cpvc_length_per_point_m',
    name: 'CPVC Length per Water Supply Point',
    category: 'PLUMBING',
    explanation: 'Average concealed CPVC supply pipe length allocated per fixture point.',
    severity: 'MEDIUM',
    affectedMetrics: ['totalCpvcPipeLengthM', 'plumbingFittingsCount'],
    affectedBOQLines: ['CPVC SDR-11 Pressure Pipes & Fittings'],
    affectedCostHeads: ['Plumbing Materials', 'Plumbing Labour'],
    affectedReportSections: ['Plumbing Schedule']
  }
};

/**
 * Retrieves the impact metadata for a parameter, or creates a standard fallback
 */
export function getParameterImpact(parameterKey: string, fallbackName?: string, category?: string): ParameterImpactMetadata {
  if (PARAMETER_IMPACT_REGISTRY[parameterKey]) {
    return PARAMETER_IMPACT_REGISTRY[parameterKey];
  }

  // Derive reasonable defaults
  const parts = parameterKey.split('.');
  const derivedCat = category || parts[0]?.toUpperCase() || 'GENERAL';
  const derivedName = fallbackName || parts[parts.length - 1].replace(/_/g, ' ');

  return {
    parameterKey,
    name: derivedName,
    category: derivedCat,
    explanation: `Configurable parameter affecting ${derivedCat.toLowerCase()} calculation calculations.`,
    severity: 'MEDIUM',
    affectedMetrics: ['calculatedQuantities'],
    affectedBOQLines: ['Related BOQ Items'],
    affectedCostHeads: ['Materials', 'Labour'],
    affectedReportSections: ['Cost Summary']
  };
}

// ------------------------------------------------------------
// DETERMINISTIC SIMULATION RUNNER (Part 28)
// Uses the EXACT SAME calculation engine with base vs draft config
// ------------------------------------------------------------

export interface SimulationRunOptions {
  sampleInput?: EngineInput;
  baseConfig?: ResolvedCalculationConfiguration;
  draftOverrides: Record<string, any>;
  changedParameterKeys: string[];
}

/**
 * Generates a standard baseline sample project if none provided
 */
export function getStandardSimulationSampleInput(): EngineInput {
  return {
    city: 'Bangalore',
    authority: 'BBMP/BDA',
    plotLength: 60,
    plotWidth: 40,
    builtUpAreaPerFloor: 1440,
    houseType: 'Duplex',
    floors: 2,
    parkingType: 'Normal Ground',
    carCount: 1,
    bikeCount: 2,
    evCharging: false,
    liftRequired: false,
    rooms: {
      bedrooms: 3,
      bathrooms: 3,
      commonToilets: 1,
      kitchen: 1,
      dining: 1,
      living: 1,
      balcony: 1,
      office: 0,
      pooja: 1,
      utility: 1,
      storeRoom: 1,
    },
    qualityTier: 'Premium',
    materialBrands: {
      steel: 'Tata Tiscon',
      cement: 'UltraTech',
      doors: 'Premium Teak',
      windows: 'Fenesta uPVC',
      flooring: 'Vitrified Tiles',
      bathroom: 'Kohler',
      electrical: 'Finolex',
      paint: 'Asian Paints Royale',
    },
    flooringZones: {
      living: 'Vitrified Tiles 800x800mm',
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
      mainDoor: 'Premium Teak',
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
      sanitaryTier: 'Premium (Jaquar / Kohler / Grohe)',
      cpvcBrand: 'Ashirwad',
    },
    painting: {
      baseLayer: 'Putty + Primer',
      internalPaint: 'Premium Emulsion',
      externalPaint: 'Ultima Weather Proof',
      brand: 'Asian Paints',
    }
  };
}

/**
 * Executes a deterministic simulation comparing the current ACTIVE configuration
 * against the proposed DRAFT overrides.
 */
export function simulateConfigurationComparison(options: SimulationRunOptions): SimulationComparisonReport {
  const input = options.sampleInput || getStandardSimulationSampleInput();
  const baseConfig = options.baseConfig || configResolver.getResolvedConfigurationSnapshot({ location: input.city, specificationTier: input.qualityTier });

  // Deep clone and merge draft overrides into draftConfig
  const draftConfig: ResolvedCalculationConfiguration = JSON.parse(JSON.stringify(baseConfig));

  for (const [key, val] of Object.entries(options.draftOverrides)) {
    const keys = key.split('.');
    let target: any = draftConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) target[keys[i]] = {};
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = val;
  }

  // 1. Run baseline active calculation
  const oldResult = runCalculator(input);

  // 2. Temporarily sync draft overrides into configResolver to simulate draft state safely
  const normalizedParams: Record<string, any> = {};
  for (const [k, v] of Object.entries(options.draftOverrides)) {
    normalizedParams[k] = v;
    if (k.startsWith('config.')) {
      normalizedParams[k.replace(/^config\./, '')] = v;
    } else {
      normalizedParams[`config.${k}`] = v;
    }
  }

  configResolver.syncActiveConfiguration({
    versionNumber: 'DRAFT-SIMULATION',
    parameters: normalizedParams,
    source: 'STATIC_APPROVED_BASELINE'
  });

  let newResult: CalculationResult;
  try {
    newResult = runCalculator(input);
  } finally {
    // Restore base configuration in resolver
    configResolver.resetToBaseline();
  }

  // Assemble changed parameters metadata
  const changedParameters = options.changedParameterKeys.map((key) => {
    const impact = getParameterImpact(key);
    const keys = key.split('.');
    let oldVal: any = baseConfig;
    let newVal: any = draftConfig;
    for (const k of keys) {
      oldVal = oldVal ? oldVal[k] : undefined;
      newVal = newVal ? newVal[k] : undefined;
    }

    return {
      key,
      name: impact.name,
      oldValue: oldVal,
      newValue: newVal,
      impact
    };
  });

  // Compute Total Cost delta
  const oldCost = oldResult.budget?.totalProjectCost || 0;
  const newCost = newResult.budget?.totalProjectCost || 0;
  const costDelta = newCost - oldCost;
  const costPercentChange = oldCost > 0 ? Number(((costDelta / oldCost) * 100).toFixed(2)) : 0;

  // Compute Key Metrics deltas
  const keyMetrics: MetricDelta[] = [
    {
      metricKey: 'builtUpArea',
      name: 'Built-up Area',
      unit: 'sqft',
      oldValue: oldResult.area?.totalBUASqFt || 0,
      newValue: newResult.area?.totalBUASqFt || 0,
      delta: (newResult.area?.totalBUASqFt || 0) - (oldResult.area?.totalBUASqFt || 0),
      percentChange: calculatePercentChange(oldResult.area?.totalBUASqFt || 0, newResult.area?.totalBUASqFt || 0)
    },
    {
      metricKey: 'steelKg',
      name: 'Reinforcement Steel',
      unit: 'kg',
      oldValue: oldResult.quantities?.steelKg || 0,
      newValue: newResult.quantities?.steelKg || 0,
      delta: (newResult.quantities?.steelKg || 0) - (oldResult.quantities?.steelKg || 0),
      percentChange: calculatePercentChange(oldResult.quantities?.steelKg || 0, newResult.quantities?.steelKg || 0)
    },
    {
      metricKey: 'cementBags',
      name: 'Structural & Masonry Cement',
      unit: 'bags',
      oldValue: oldResult.quantities?.cementBags || 0,
      newValue: newResult.quantities?.cementBags || 0,
      delta: (newResult.quantities?.cementBags || 0) - (oldResult.quantities?.cementBags || 0),
      percentChange: calculatePercentChange(oldResult.quantities?.cementBags || 0, newResult.quantities?.cementBags || 0)
    },
    {
      metricKey: 'sandCft',
      name: 'Sand / Aggregates',
      unit: 'CFT',
      oldValue: oldResult.quantities?.sandCuFt || 0,
      newValue: newResult.quantities?.sandCuFt || 0,
      delta: (newResult.quantities?.sandCuFt || 0) - (oldResult.quantities?.sandCuFt || 0),
      percentChange: calculatePercentChange(oldResult.quantities?.sandCuFt || 0, newResult.quantities?.sandCuFt || 0)
    },
    {
      metricKey: 'paintLitres',
      name: 'Total Paint Required',
      unit: 'L',
      oldValue: (oldResult.quantities?.interiorPaintLitres || 0) + (oldResult.quantities?.exteriorPaintLitres || 0),
      newValue: (newResult.quantities?.interiorPaintLitres || 0) + (newResult.quantities?.exteriorPaintLitres || 0),
      delta: ((newResult.quantities?.interiorPaintLitres || 0) + (newResult.quantities?.exteriorPaintLitres || 0)) -
             ((oldResult.quantities?.interiorPaintLitres || 0) + (oldResult.quantities?.exteriorPaintLitres || 0)),
      percentChange: calculatePercentChange(
        (oldResult.quantities?.interiorPaintLitres || 0) + (oldResult.quantities?.exteriorPaintLitres || 0),
        (newResult.quantities?.interiorPaintLitres || 0) + (newResult.quantities?.exteriorPaintLitres || 0)
      )
    }
  ];

  // Compute BOQ Line Deltas
  const affectedBOQLines: BOQLineDelta[] = [];
  const oldBOQ = oldResult.boq || [];
  const newBOQ = newResult.boq || [];

  const boqMap = new Map<string, { oldItem?: any; newItem?: any }>();
  for (const item of oldBOQ) {
    boqMap.set(item.code || item.description, { oldItem: item });
  }
  for (const item of newBOQ) {
    const key = item.code || item.description;
    const existing = boqMap.get(key) || {};
    existing.newItem = item;
    boqMap.set(key, existing);
  }

  for (const [id, entry] of boqMap.entries()) {
    const oldQ = entry.oldItem?.quantity || 0;
    const newQ = entry.newItem?.quantity || 0;
    const oldT = entry.oldItem?.amount || 0;
    const newT = entry.newItem?.amount || 0;

    if (Math.abs(oldQ - newQ) > 0.001 || Math.abs(oldT - newT) > 1) {
      affectedBOQLines.push({
        lineId: id,
        title: entry.newItem?.description || entry.oldItem?.description || id,
        category: entry.newItem?.category || entry.oldItem?.category || 'GENERAL',
        unit: entry.newItem?.unit || entry.oldItem?.unit || '',
        oldQuantity: Number(oldQ.toFixed(2)),
        newQuantity: Number(newQ.toFixed(2)),
        quantityDelta: Number((newQ - oldQ).toFixed(2)),
        oldTotal: Math.round(oldT),
        newTotal: Math.round(newT),
        costDelta: Math.round(newT - oldT),
        percentChange: calculatePercentChange(oldT, newT)
      });
    }
  }

  // Assess Warnings & Severity (Part 44)
  const criticalCount = changedParameters.filter((p) => p.impact.severity === 'CRITICAL').length;
  const highCount = changedParameters.filter((p) => p.impact.severity === 'HIGH').length;
  const warnings: string[] = [];

  if (criticalCount > 0) {
    warnings.push(`Warning: ${criticalCount} CRITICAL parameters modified. These have significant impact across structural quantities and total project cost.`);
  }
  if (Math.abs(costPercentChange) > 5) {
    warnings.push(`Material Cost Impact: Total estimate shifted by ${costPercentChange > 0 ? '+' : ''}${costPercentChange}% (₹${Math.abs(costDelta).toLocaleString('en-IN')}).`);
  }

  return {
    timestamp: new Date().toISOString(),
    baseVersion: baseConfig.version || 'v2.0-ACTIVE',
    draftVersion: 'DRAFT-SIMULATION',
    changedParameters,
    totalCost: {
      oldCost: Math.round(oldCost),
      newCost: Math.round(newCost),
      delta: Math.round(costDelta),
      percentChange: costPercentChange
    },
    keyMetrics,
    affectedBOQLines,
    severitySummary: {
      criticalCount,
      highCount,
      requiresConfirmation: criticalCount > 0 || Math.abs(costPercentChange) > 5,
      warnings
    },
    oldResult,
    newResult
  };
}

function calculatePercentChange(oldVal: number, newVal: number): number {
  if (oldVal === 0) return newVal === 0 ? 0 : 100;
  return Number((((newVal - oldVal) / oldVal) * 100).toFixed(2));
}
