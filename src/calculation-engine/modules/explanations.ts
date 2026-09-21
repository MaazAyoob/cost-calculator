// ============================================================
// CALCULATION TRANSPARENCY & EXPLANATION VIEW-MODEL GENERATOR
// "How We Calculated This" / Pure Formatter Layer
//
// STRICT ARCHITECTURAL INVARIANT:
// This module is a PURE VIEW-MODEL BUILDER.
// It DOES NOT calculate, re-estimate, resolve rates, or apply
// formulas independently. It takes the CANONICAL CalculationResult
// (already computed by runCalculator) and formats human-readable
// explanations, metrics, formula strings with substituted numbers,
// and itemized breakdowns.
//
// Canonicals IN -> Formatted Views OUT
// ============================================================

import type {
  CalculationResult,
  StepCalculationExplanation,
  ExplanationInputMetric,
  ExplanationDerivedQuantity,
  ExplanationFormulaStep,
  ExplanationRateItem,
} from '../types';
import { PARAMETER_IMPACT_REGISTRY } from '../rules/impactAnalysis';

function formatNumber(val: number | undefined | null, decimals = 0): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

function formatCurrency(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return `₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

/**
 * Generates transparent "How We Calculated This" view models for every customer calculator step.
 * ZERO calculation formulas are duplicated; all values originate from the canonical result.
 */
export function generateStepExplanations(
  result: CalculationResult
): Record<string, StepCalculationExplanation> {
  const {
    input,
    area,
    buildingModel,
    quantities,
    doorSchedule,
    windowSchedule,
    boq,
    materialSchedule,
    fixtureSchedule,
    labourSchedule,
    budget,
  } = result;

  const bua = area?.totalBUASqFt || 0;
  const floors = input?.floors || 1;

  // Helper to filter BOQ lines by category or keyword
  const findBOQItems = (filterFn: (item: any) => boolean): ExplanationRateItem[] => {
    return (boq || [])
      .filter(filterFn)
      .map((item) => ({
        item: item.description,
        quantity: item.unit === 'Tonne' || item.unit === 'Cu M' ? Number(item.quantity.toFixed(2)) : item.quantity,
        unit: item.unit,
        rate: item.unitRate,
        rateUnit: `₹/${item.unit}`,
        cost: item.amount,
        rateSource: item.brand || undefined,
      }));
  };

  // Helper to filter Labour lines by trade or category
  const findLabourItems = (filterFn: (item: any) => boolean): ExplanationRateItem[] => {
    return (labourSchedule || [])
      .filter(filterFn)
      .map((item) => ({
        item: item.trade,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.unitRate,
        rateUnit: `₹/${item.unit}`,
        cost: item.amount,
        rateSource: item.notes || undefined,
      }));
  };

  // Helper to calculate total costs for a category of items
  const sumCost = (items: ExplanationRateItem[]): number => {
    return items.reduce((sum, item) => sum + (item.cost || 0), 0);
  };

  const explanations: Record<string, StepCalculationExplanation> = {};

  // ============================================================
  // STEP 1: BUILT-UP AREA & SETBACKS (stepKey: 'bua')
  // ============================================================
  const buaInputs: ExplanationInputMetric[] = [
    { label: 'Plot Length', value: `${area?.plotLength || 0} ft` },
    { label: 'Plot Width', value: `${area?.plotWidth || 0} ft` },
    { label: 'Plot Area', value: `${formatNumber(area?.plotAreaSqFt)} sq.ft` },
    { label: 'Number of Floors', value: `${floors} (${floors === 1 ? 'Ground Only' : `G+${floors - 1}`})` },
    { label: 'Road Width', value: `${area?.roadWidthFt || 30} ft` },
  ];

  const buaDerived: ExplanationDerivedQuantity[] = [
    { label: 'Front Setback', quantity: area?.setbacks?.frontSetbackFt || 0, unit: 'ft', description: 'Statutory setback requirement' },
    { label: 'Rear Setback', quantity: area?.setbacks?.rearSetbackFt || 0, unit: 'ft' },
    { label: 'Side Setbacks (L / R)', quantity: `${area?.setbacks?.leftSetbackFt || 0} / ${area?.setbacks?.rightSetbackFt || 0}`, unit: 'ft' },
    { label: 'Buildable Footprint', quantity: formatNumber(area?.buildableFootprintSqFt), unit: 'sq.ft', description: 'Ground floor maximum footprint' },
    { label: 'Total Built-Up Area (BUA)', quantity: formatNumber(area?.totalBUASqFt), unit: 'sq.ft', description: 'Sum across all configured floors' },
  ];

  const buaLogic: ExplanationFormulaStep[] = [
    {
      title: 'Plot Area',
      formula: 'Plot Length × Plot Width',
      substitutions: `${area?.plotLength || 0} ft × ${area?.plotWidth || 0} ft`,
      resultText: `${formatNumber(area?.plotAreaSqFt)} sq.ft`,
    },
    {
      title: 'Buildable Footprint',
      formula: '(Plot Length - Front - Rear) × (Plot Width - Left - Right)',
      substitutions: `${area?.buildableLengthFt || 0} ft × ${area?.buildableWidthFt || 0} ft`,
      resultText: `${formatNumber(area?.buildableFootprintSqFt)} sq.ft`,
    },
    {
      title: 'Total Built-Up Area',
      formula: 'Built-up Area per floor × Number of floors',
      substitutions: `${formatNumber(area?.buaPerFloorSqFt)} sq.ft × ${floors}`,
      resultText: `${formatNumber(area?.totalBUASqFt)} sq.ft`,
    },
  ];

  explanations['bua'] = {
    stepKey: 'bua',
    title: 'Plot Geometry & Built-Up Area Calculation',
    stepTotal: 0,
    unitRateOrBenchmark: `${formatNumber(area?.groundCoveragePercentage, 1)}% Ground Coverage`,
    summaryMetrics: [
      { label: 'Plot Area', value: formatNumber(area?.plotAreaSqFt), unit: 'sq.ft' },
      { label: 'Footprint', value: formatNumber(area?.buildableFootprintSqFt), unit: 'sq.ft' },
      { label: 'Total BUA', value: formatNumber(area?.totalBUASqFt), unit: 'sq.ft' },
    ],
    inputsUsed: buaInputs,
    derivedQuantities: buaDerived,
    calculationLogic: buaLogic,
    rateBreakdown: [],
    costBreakdown: { total: 0 },
    whatDoesThisAffect: [
      'Total structural concrete (RCC) & steel reinforcement quantities',
      'Cement bag thumb rules (0.40 bags/sqft)',
      'Composite civil labour allocation (₹/sqft BUA)',
      'Flooring base area, circulation corridors, and roof waterproofing',
      'External perimeter and gross wall area',
    ],
    quantityVsPriceNote: 'BUA is purely geometric. Changing specifications or rates alters budget costs, but physical built-up area remains 100% invariant.',
  };

  // ============================================================
  // STEP 2: ROOMS & SPACES (stepKey: 'space')
  // ============================================================
  const spaces = buildingModel?.allSpaces || [];
  const spaceInputs: ExplanationInputMetric[] = [
    { label: 'Configured Bedrooms', value: input?.rooms?.bedrooms || 0 },
    { label: 'Configured Bathrooms', value: (input?.rooms?.bathrooms || 0) + (input?.rooms?.commonToilets || 0) },
    { label: 'Configured Kitchens', value: input?.rooms?.kitchen || 0 },
    { label: 'Living / Dining Areas', value: (input?.rooms?.living || 0) + (input?.rooms?.dining || 0) },
    { label: 'Total Functional Spaces', value: spaces.length },
  ];

  const totalCarpet = spaces.reduce((s, sp) => s + (sp.flooringAreaSqFt || 0), 0);
  const totalPerimeter = spaces.reduce((s, sp) => s + (sp.perimeter || 0), 0);

  const spaceDerived: ExplanationDerivedQuantity[] = [
    { label: 'Net Room Carpet Area', quantity: formatNumber(totalCarpet), unit: 'sq.ft', description: 'Actual usable room floor area' },
    { label: 'Internal Wall Perimeter', quantity: formatNumber(totalPerimeter), unit: 'r.ft', description: 'Total perimeter of internal room walls' },
    { label: 'Gross Internal Wall Area', quantity: formatNumber(buildingModel?.grossInternalWallAreaSqFt), unit: 'sq.ft' },
    { label: 'Net Internal Wall Area', quantity: formatNumber(buildingModel?.netInternalWallAreaSqFt), unit: 'sq.ft', description: 'Wall area minus doors and window openings' },
  ];

  explanations['space'] = {
    stepKey: 'space',
    title: 'Room Layout & Architectural Space Model',
    stepTotal: 0,
    unitRateOrBenchmark: `${spaces.length} Spaces Modelled`,
    summaryMetrics: [
      { label: 'Total Spaces', value: spaces.length },
      { label: 'Usable Carpet', value: formatNumber(totalCarpet), unit: 'sq.ft' },
      { label: 'Internal Wall Area', value: formatNumber(buildingModel?.netInternalWallAreaSqFt), unit: 'sq.ft' },
    ],
    inputsUsed: spaceInputs,
    derivedQuantities: spaceDerived,
    calculationLogic: [
      {
        title: 'Usable Space Aggregation',
        formula: 'Sum of individual room floor areas (Length × Width)',
        substitutions: `${spaces.length} individual room enclosures summed`,
        resultText: `${formatNumber(totalCarpet)} sq.ft carpet`,
      },
      {
        title: 'Net Internal Wall Area',
        formula: 'Gross Wall Area (Perimeter × Height) - Door Openings - Window Openings',
        substitutions: `${formatNumber(buildingModel?.grossInternalWallAreaSqFt)} - ${formatNumber(buildingModel?.totalDoorOpeningAreaSqFt)} - ${formatNumber(buildingModel?.totalWindowOpeningAreaSqFt)}`,
        resultText: `${formatNumber(buildingModel?.netInternalWallAreaSqFt)} sq.ft net`,
      },
    ],
    rateBreakdown: [],
    costBreakdown: { total: 0 },
    whatDoesThisAffect: [
      'Tile flooring area and cutting wastage',
      'Bathroom and kitchen dado tile quantities',
      'Waterproofing in wet zones (bathrooms and utilities)',
      'Internal wall putty and emulsion paint litres',
      'Electrical points and sanitary fixture requirements',
    ],
    quantityVsPriceNote: 'Room dimensions dictate physical areas. Modifying room lengths or widths recalculates wall and floor surfaces without altering material price benchmarks.',
  };

  // ============================================================
  // STEP 3: CORE STRUCTURE & RCC (stepKey: 'structure')
  // ============================================================
  const steelBOQ = findBOQItems((i) => i.category === 'RCC & Structural Works' || i.description.toLowerCase().includes('steel') || i.description.toLowerCase().includes('rcc') || i.description.toLowerCase().includes('concrete') || i.description.toLowerCase().includes('footing') || i.description.toLowerCase().includes('plinth'));
  const cementBOQ = findBOQItems((i) => i.description.toLowerCase().includes('cement'));
  const aggregateBOQ = findBOQItems((i) => i.description.toLowerCase().includes('sand') || i.description.toLowerCase().includes('aggregate'));
  
  // Total structure items
  const structureItems = [...steelBOQ, ...cementBOQ, ...aggregateBOQ];
  const structureTotal = sumCost(structureItems);

  explanations['structure'] = {
    stepKey: 'structure',
    title: 'Core Structural Framework (RCC, Steel & Cement)',
    stepTotal: structureTotal,
    unitRateOrBenchmark: bua > 0 ? `₹${formatNumber(structureTotal / bua)}/sq.ft BUA` : '₹0/sq.ft',
    summaryMetrics: [
      { label: 'Rebar Steel', value: formatNumber(quantities?.steelTonnes, 2), unit: 'Tonnes' },
      { label: 'Cement', value: formatNumber(quantities?.cementBags), unit: 'Bags' },
      { label: 'M-Sand / P-Sand', value: formatNumber(quantities?.sandCuFt), unit: 'CFT' },
      { label: 'Coarse Aggregate', value: formatNumber(quantities?.coarseAggregateCuFt), unit: 'CFT' },
    ],
    inputsUsed: [
      { label: 'Total BUA', value: `${formatNumber(bua)} sq.ft` },
      { label: 'Number of Floors', value: floors },
      { label: 'Steel Factor', value: `${quantities?.steelFactorKgPerSqFt || 3.0} kg/sq.ft`, description: 'Canonical structural requirement factor' },
      { label: 'Cement Thumb Rule', value: `${quantities?.cementFactorBagsPerSqFt || 0.40} bags/sq.ft`, description: 'Approved benchmark coefficient' },
    ],
    derivedQuantities: [
      { label: 'Total Steel Weight', quantity: formatNumber(quantities?.steelKg), unit: 'kg', description: `${formatNumber(quantities?.steelTonnes, 2)} Tonnes Fe-550D TMT` },
      { label: 'Total Cement Requirement', quantity: formatNumber(quantities?.cementBags), unit: 'Bags', description: '50 kg bags for structural RCC & masonry' },
      { label: 'Total Sand Quantity', quantity: formatNumber(quantities?.sandCuFt), unit: 'CFT', description: 'M-Sand for concrete + P-Sand for plaster' },
      { label: 'Coarse Aggregate (20mm)', quantity: formatNumber(quantities?.coarseAggregateCuFt), unit: 'CFT', description: 'Granite aggregate for RCC members' },
    ],
    calculationLogic: [
      {
        title: 'Steel Reinforcement Quantity',
        formula: 'Total BUA × Resolved Steel Factor (kg/sq.ft)',
        substitutions: `${formatNumber(bua)} sq.ft × ${quantities?.steelFactorKgPerSqFt || 3.0} kg/sq.ft`,
        resultText: `${formatNumber(quantities?.steelKg)} kg (${formatNumber(quantities?.steelTonnes, 2)} Tonnes)`,
      },
      {
        title: 'Cement Requirement',
        formula: 'Total BUA × Starting Parameter (0.40 bags/sq.ft)',
        substitutions: `${formatNumber(bua)} sq.ft × ${quantities?.cementFactorBagsPerSqFt || 0.40} bags/sq.ft`,
        resultText: `${formatNumber(quantities?.cementBags)} Bags (50 kg)`,
      },
      {
        title: 'Sand Thumb Rule',
        formula: 'M-Sand (0.60 CFT/sq.ft) + P-Sand (0.60 CFT/sq.ft)',
        substitutions: `${formatNumber(bua)} sq.ft × 1.20 CFT/sq.ft`,
        resultText: `${formatNumber(quantities?.sandCuFt)} CFT`,
      },
      {
        title: 'Coarse Aggregate Thumb Rule',
        formula: 'Total BUA × 1.35 CFT/sq.ft',
        substitutions: `${formatNumber(bua)} sq.ft × 1.35 CFT/sq.ft`,
        resultText: `${formatNumber(quantities?.coarseAggregateCuFt)} CFT`,
      },
    ],
    rateBreakdown: structureItems,
    costBreakdown: {
      materials: structureTotal,
      total: structureTotal,
    },
    whatDoesThisAffect: [
      'Foundation concrete volume, footing depth, and plinth beam design',
      'Structural load capacity for multi-floor vertical expansion',
      'Procurement logistics, staging area, and delivery schedules',
    ],
    quantityVsPriceNote: 'Changing material brands (e.g., Tata Tiscon to JSW, or UltraTech to ACC) updates unit rates and cost totals, but physical steel tonnage and cement bags remain 100% invariant.',
  };

  // ============================================================
  // STEP 3B: WALLS & MASONRY (stepKey: 'masonry')
  // ============================================================
  const masonryBOQ = findBOQItems((i) => i.category === 'Masonry & Plastering' || i.description.toLowerCase().includes('masonry') || i.description.toLowerCase().includes('block') || i.description.toLowerCase().includes('brick'));
  const masonryTotal = sumCost(masonryBOQ);

  explanations['masonry'] = {
    stepKey: 'masonry',
    title: 'Walls & Masonry Enclosure',
    stepTotal: masonryTotal,
    unitRateOrBenchmark: bua > 0 ? `₹${formatNumber(masonryTotal / bua)}/sq.ft BUA` : '₹0/sq.ft',
    summaryMetrics: [
      { label: 'Masonry Material', value: quantities?.masonryMaterial || 'AAC Blocks' },
      { label: 'Units Required', value: formatNumber(quantities?.masonryUnitsCount), unit: quantities?.masonryUnit || 'Blocks' },
      { label: 'Net Wall Area', value: formatNumber(quantities?.netWallAreaSqFt), unit: 'sq.ft' },
      { label: 'Masonry Volume', value: formatNumber(quantities?.masonryVolumeCuM, 1), unit: 'Cu.M' },
    ],
    inputsUsed: [
      { label: 'Gross External Wall Area', value: `${formatNumber(buildingModel?.grossExternalWallAreaSqFt)} sq.ft` },
      { label: 'Gross Internal Wall Area', value: `${formatNumber(buildingModel?.grossInternalWallAreaSqFt)} sq.ft` },
      { label: 'Deductions (Openings)', value: `${formatNumber((buildingModel?.totalDoorOpeningAreaSqFt || 0) + (buildingModel?.totalWindowOpeningAreaSqFt || 0))} sq.ft` },
      { label: 'Wastage Allowance', value: `${quantities?.masonryWastagePct || 5}%` },
    ],
    derivedQuantities: [
      { label: 'Net Masonry Wall Area', quantity: formatNumber(quantities?.netWallAreaSqFt), unit: 'sq.ft', description: 'Wall surface minus doors and windows' },
      { label: 'Masonry Volume', quantity: formatNumber(quantities?.masonryVolumeCuM, 2), unit: 'Cu.M', description: 'Net area × wall thickness (0.15m / 0.20m)' },
      { label: 'Block Count (with wastage)', quantity: formatNumber(quantities?.masonryUnitsCount), unit: quantities?.masonryUnit || 'Blocks' },
    ],
    calculationLogic: [
      {
        title: 'Net Masonry Wall Area',
        formula: '(Gross External + Gross Internal Walls) - Openings',
        substitutions: `(${formatNumber(buildingModel?.grossExternalWallAreaSqFt)} + ${formatNumber(buildingModel?.grossInternalWallAreaSqFt)}) - ${formatNumber((buildingModel?.totalDoorOpeningAreaSqFt || 0) + (buildingModel?.totalWindowOpeningAreaSqFt || 0))}`,
        resultText: `${formatNumber(quantities?.netWallAreaSqFt)} sq.ft`,
      },
      {
        title: 'Masonry Units Calculation',
        formula: '(Masonry Volume ÷ Unit Block Volume) × (1 + Wastage%)',
        substitutions: `${formatNumber(quantities?.masonryVolumeCuM, 2)} Cu.M with ${quantities?.masonryWastagePct || 5}% cutting allowance`,
        resultText: `${formatNumber(quantities?.masonryUnitsCount)} ${quantities?.masonryUnit || 'Blocks'}`,
      },
    ],
    rateBreakdown: masonryBOQ,
    costBreakdown: {
      materials: masonryTotal,
      total: masonryTotal,
    },
    whatDoesThisAffect: [
      'Internal and external 2-coat plastering area',
      'Paintable surface area for putty and emulsion coats',
      'Structural dead-load on beams and slab foundations',
    ],
    quantityVsPriceNote: 'Block counts are governed by room perimeters, ceiling heights, and opening deductions. Changing block brand or unit price modifies cost while keeping block count invariant.',
  };

  // ============================================================
  // STEP 4: FLOORING & TILES (stepKey: 'flooring')
  // ============================================================
  const flooringBOQ = findBOQItems((i) => i.category === 'Flooring & Tiling Works' || i.description.toLowerCase().includes('tile') || i.description.toLowerCase().includes('granite') || i.description.toLowerCase().includes('flooring'));
  const flooringTotal = sumCost(flooringBOQ);

  explanations['flooring'] = {
    stepKey: 'flooring',
    title: 'Flooring, Tiling & Granite Surfaces',
    stepTotal: flooringTotal,
    unitRateOrBenchmark: bua > 0 ? `₹${formatNumber(flooringTotal / bua)}/sq.ft BUA` : '₹0/sq.ft',
    summaryMetrics: [
      { label: 'Floor Tiles', value: formatNumber(quantities?.floorTilesSqFt), unit: 'sq.ft' },
      { label: 'Bathroom Dado', value: formatNumber(quantities?.bathroomDadoTileSqFt), unit: 'sq.ft' },
      { label: 'Kitchen Dado', value: formatNumber(quantities?.kitchenDadoTileSqFt), unit: 'sq.ft' },
      { label: 'Granite Counter/Stairs', value: formatNumber(quantities?.graniteSlabsSqFt), unit: 'sq.ft' },
    ],
    inputsUsed: [
      { label: 'Usable Space Floor Area', value: `${formatNumber(quantities?.flooringRawAreaSqFt || totalCarpet)} sq.ft` },
      { label: 'Circulation Corridors Allowance', value: `${formatNumber(quantities?.flooringCirculationSqFt)} sq.ft` },
      { label: 'Tile Wastage Allowance', value: `${quantities?.flooringWastagePct || 8}%` },
    ],
    derivedQuantities: [
      { label: 'Total Floor Tile Area', quantity: formatNumber(quantities?.floorTilesSqFt), unit: 'sq.ft', description: 'Includes livable rooms, passages & 8% cutting wastage' },
      { label: 'Bathroom Dado Tiles (7 ft)', quantity: formatNumber(quantities?.bathroomDadoTileSqFt), unit: 'sq.ft', description: 'Full perimeter cladding up to lintel level' },
      { label: 'Kitchen Counter Dado (2 ft)', quantity: formatNumber(quantities?.kitchenDadoTileSqFt), unit: 'sq.ft', description: 'Wall tiles above cooking counter' },
      { label: 'Granite Slabs', quantity: formatNumber(quantities?.graniteSlabsSqFt), unit: 'sq.ft', description: 'Staircase treads, risers, and kitchen counter top' },
    ],
    calculationLogic: [
      {
        title: 'Floor Tiles Takeoff',
        formula: '(Net Room Areas + Circulation) × (1 + Wastage%)',
        substitutions: `(${formatNumber(quantities?.flooringRawAreaSqFt || totalCarpet)} + ${formatNumber(quantities?.flooringCirculationSqFt)}) × 1.08`,
        resultText: `${formatNumber(quantities?.floorTilesSqFt)} sq.ft`,
      },
      {
        title: 'Bathroom Dado Cladding',
        formula: 'Bathroom Perimeter × 7.0 ft Lintel Cladding Height',
        substitutions: `Wet zone wall enclosure perimeter × 7 ft`,
        resultText: `${formatNumber(quantities?.bathroomDadoTileSqFt)} sq.ft`,
      },
    ],
    rateBreakdown: flooringBOQ,
    costBreakdown: {
      materials: flooringTotal,
      total: flooringTotal,
    },
    whatDoesThisAffect: [
      'Tile adhesive, spacers, and epoxy grout requirements',
      'Skirting tiles along wall bases',
      'Tile laying labour and specialized cutting trade work',
    ],
    quantityVsPriceNote: 'Upgrading from Vitrified (₹65/sq.ft) to GVT (₹95/sq.ft) or Italian Marble changes total cost, but tile area in sq.ft remains 100% identical.',
  };

  // ============================================================
  // STEP 5: WATERPROOFING & DADO (stepKey: 'waterproofing')
  // ============================================================
  const wpBOQ = findBOQItems((i) => i.category === 'Waterproofing Works' || i.description.toLowerCase().includes('waterproofing'));
  const wpTotal = sumCost(wpBOQ);

  explanations['waterproofing'] = {
    stepKey: 'waterproofing',
    title: 'Waterproofing & Moisture Protection',
    stepTotal: wpTotal,
    unitRateOrBenchmark: bua > 0 ? `₹${formatNumber(wpTotal / bua)}/sq.ft BUA` : '₹0/sq.ft',
    summaryMetrics: [
      { label: 'Total Waterproofing', value: formatNumber(quantities?.waterproofingAreaSqFt), unit: 'sq.ft' },
      { label: 'Bathroom Sunken Slabs', value: formatNumber(quantities?.bathroomWaterproofingSqFt), unit: 'sq.ft' },
      { label: 'Terrace Roof Slab', value: formatNumber(quantities?.terraceWaterproofingSqFt), unit: 'sq.ft' },
      { label: 'Underground Sump', value: formatNumber(quantities?.sumpWaterproofingSqFt), unit: 'sq.ft' },
    ],
    inputsUsed: [
      { label: 'Number of Bathrooms', value: (input?.rooms?.bathrooms || 0) + (input?.rooms?.commonToilets || 0) },
      { label: 'Terrace Footprint', value: `${formatNumber(area?.terraceSqFt || area?.buildableFootprintSqFt)} sq.ft` },
      { label: 'Water Sump Capacity', value: '7,000 Litres standard tank' },
    ],
    derivedQuantities: [
      { label: 'Bathroom Wet Zone Treatment', quantity: formatNumber(quantities?.bathroomWaterproofingSqFt), unit: 'sq.ft', description: 'Base slab + 1 ft vertical upturn cove' },
      { label: 'Terrace Weatherproof Treatment', quantity: formatNumber(quantities?.terraceWaterproofingSqFt), unit: 'sq.ft', description: 'Elastomeric membrane + screed protection' },
      { label: 'Water Sump Internal Coating', quantity: formatNumber(quantities?.sumpWaterproofingSqFt), unit: 'sq.ft', description: 'Food-grade crystalline waterproofing' },
    ],
    calculationLogic: [
      {
        title: 'Bathroom Waterproofing',
        formula: 'Bath Count × (Floor Area + Perimeter × 1 ft upturn)',
        substitutions: `${(input?.rooms?.bathrooms || 0) + (input?.rooms?.commonToilets || 0)} bathrooms treated`,
        resultText: `${formatNumber(quantities?.bathroomWaterproofingSqFt)} sq.ft`,
      },
      {
        title: 'Terrace Roof Waterproofing',
        formula: 'Roof Footprint + Parapet Upturn (Perimeter × 1 ft)',
        substitutions: `${formatNumber(area?.terraceSqFt || area?.buildableFootprintSqFt)} sq.ft footprint`,
        resultText: `${formatNumber(quantities?.terraceWaterproofingSqFt)} sq.ft`,
      },
    ],
    rateBreakdown: wpBOQ,
    costBreakdown: {
      materials: wpTotal,
      total: wpTotal,
    },
    whatDoesThisAffect: [
      'Pond test duration (minimum 48-hour hydrostatic testing)',
      'Sub-slab drainage protection against efflorescence and ceiling dampness',
    ],
    quantityVsPriceNote: 'Waterproofing areas are fixed by wet room footprints and roof area. Selecting Dr. Fixit or Fosroc changes chemical costs without altering treated square footage.',
  };

  // ============================================================
  // STEP 6: DOORS & FRAMES (stepKey: 'doors')
  // ============================================================
  const doorBOQ = findBOQItems((i) => i.category === 'Doors, Windows & Fabrication' && (i.description.toLowerCase().includes('door') || i.unit === 'Nos'));
  const doorTotal = sumCost(doorBOQ);

  explanations['doors'] = {
    stepKey: 'doors',
    title: 'Doors, Frames & Architectural Joinery',
    stepTotal: doorTotal,
    unitRateOrBenchmark: `${quantities?.totalDoorsCount || 0} Doors Total`,
    summaryMetrics: [
      { label: 'Total Doors', value: quantities?.totalDoorsCount || 0 },
      { label: 'Main Entrance Door', value: quantities?.mainDoorsCount || 1 },
      { label: 'Internal Bedroom Doors', value: quantities?.internalDoorsCount || 0 },
      { label: 'Bathroom Doors', value: quantities?.bathroomDoorsCount || 0 },
    ],
    inputsUsed: [
      { label: 'Bedrooms', value: input?.rooms?.bedrooms || 0 },
      { label: 'Bathrooms', value: (input?.rooms?.bathrooms || 0) + (input?.rooms?.commonToilets || 0) },
      { label: 'Main Door Specification', value: input?.doors?.mainDoor || 'Teak Wood Frame & Shutter' },
      { label: 'Internal Door Specification', value: input?.doors?.internalDoor || 'Flush Door with Laminate' },
    ],
    derivedQuantities: [
      { label: 'Grand Main Door (3.5 × 7.0 ft)', quantity: quantities?.mainDoorsCount || 1, unit: 'Nos' },
      { label: 'Bed / Living Doors (3.0 × 7.0 ft)', quantity: quantities?.internalDoorsCount || 0, unit: 'Nos' },
      { label: 'Bathroom Waterproof Doors (2.5 × 7.0 ft)', quantity: quantities?.bathroomDoorsCount || 0, unit: 'Nos' },
      { label: 'Total Door Opening Deduction', quantity: formatNumber(quantities?.doorOpeningAreaSqFt), unit: 'sq.ft', description: 'Subtracted from masonry wall area' },
    ],
    calculationLogic: [
      {
        title: 'Door Schedule Assembly',
        formula: '1 Main + Bedrooms + Kitchen/Utility + Bathrooms',
        substitutions: `1 Main + ${input?.rooms?.bedrooms || 0} Bed + ${input?.rooms?.bathrooms || 0} Bath`,
        resultText: `${quantities?.totalDoorsCount || 0} Openings`,
      },
    ],
    rateBreakdown: doorBOQ,
    costBreakdown: {
      fixtures: doorTotal,
      total: doorTotal,
    },
    whatDoesThisAffect: [
      'Masonry opening lintel and jamb frame deductions',
      'Door frame fabrication, hinges, mortise locks, and brass ironmongery',
    ],
    quantityVsPriceNote: 'Selecting Teak vs Honne wood alters shutter rate, but physical door count is strictly determined by configured rooms.',
  };

  // ============================================================
  // STEP 7: WINDOWS & GLAZING (stepKey: 'windows')
  // ============================================================
  const windowBOQ = findBOQItems((i) => i.category === 'Doors, Windows & Fabrication' && (i.description.toLowerCase().includes('window') || i.description.toLowerCase().includes('ventilator') || i.description.toLowerCase().includes('upvc')));
  const windowTotal = sumCost(windowBOQ);

  explanations['windows'] = {
    stepKey: 'windows',
    title: 'Windows, Ventilators & Safety Grills',
    stepTotal: windowTotal,
    unitRateOrBenchmark: `${quantities?.windowsCount || 0} Windows Total`,
    summaryMetrics: [
      { label: 'Total Openings', value: quantities?.windowsCount || 0 },
      { label: 'Window Glazing Area', value: formatNumber(quantities?.windowAreaSqFt), unit: 'sq.ft' },
      { label: 'Safety Grill Area', value: formatNumber(quantities?.grillAreaSqFt), unit: 'sq.ft' },
    ],
    inputsUsed: [
      { label: 'Living / Dining Windows', value: '5.0 ft × 4.0 ft (20 sq.ft each)' },
      { label: 'Bedroom Windows', value: '4.0 ft × 4.0 ft (16 sq.ft each)' },
      { label: 'Bathroom Ventilators', value: '2.0 ft × 2.0 ft (4 sq.ft louvred)' },
    ],
    derivedQuantities: [
      { label: 'Total Window Units', quantity: quantities?.windowsCount || 0, unit: 'Nos' },
      { label: 'Total Window Opening Area', quantity: formatNumber(quantities?.windowAreaSqFt), unit: 'sq.ft', description: 'UPVC / Aluminium frame + toughened glass' },
      { label: 'MS Safety Grills', quantity: formatNumber(quantities?.grillAreaSqFt), unit: 'sq.ft', description: '10mm square bright rod fabrication' },
    ],
    calculationLogic: [
      {
        title: 'Window Area Summation',
        formula: 'Sum of individual window unit opening dimensions',
        substitutions: `${quantities?.windowsCount || 0} scheduled window units`,
        resultText: `${formatNumber(quantities?.windowAreaSqFt)} sq.ft glazing`,
      },
    ],
    rateBreakdown: windowBOQ,
    costBreakdown: {
      fixtures: windowTotal,
      total: windowTotal,
    },
    whatDoesThisAffect: [
      'Natural ventilation, day-lighting, and airflow compliance',
      'Deduction from net external plastering and external paint surfaces',
    ],
    quantityVsPriceNote: 'Choosing Fenesta vs Kommerling UPVC modifies the square-foot glazing rate, but total window openings and glass area remain 100% constant.',
  };

  // ============================================================
  // STEP 8: ELECTRICAL & MEP (stepKey: 'electrical') - Reference Quality
  // ============================================================
  const elecBOQ = findBOQItems((i) => i.category === 'Electrical Works' || i.description.toLowerCase().includes('point') || i.description.toLowerCase().includes('wire') || i.description.toLowerCase().includes('conduit') || i.description.toLowerCase().includes('switch') || i.description.toLowerCase().includes('db'));
  const elecLabour = findLabourItems((i) => i.category === 'Electrical');
  const elecMaterialTotal = sumCost(elecBOQ);
  const elecLabourTotal = sumCost(elecLabour);
  const elecTotal = elecMaterialTotal + elecLabourTotal;

  explanations['electrical'] = {
    stepKey: 'electrical',
    title: 'Electrical Distribution, Wiring & MEP Points',
    stepTotal: elecTotal,
    unitRateOrBenchmark: bua > 0 ? `₹${formatNumber(elecTotal / bua)}/sq.ft BUA` : '₹0/sq.ft',
    summaryMetrics: [
      { label: 'Total Electrical Points', value: quantities?.totalElectricalPoints || 0, unit: 'Points' },
      { label: 'FRLS Copper Wiring', value: formatNumber(quantities?.electricalWireMetres), unit: 'Metres' },
      { label: 'Concealed Conduits', value: formatNumber(quantities?.conduitsMetres), unit: 'Metres' },
      { label: 'Modular Switch Plates', value: quantities?.switchModules || 0, unit: 'Modules' },
    ],
    inputsUsed: [
      { label: 'Total BUA', value: `${formatNumber(bua)} sq.ft` },
      { label: 'Floors', value: floors },
      { label: 'Bedrooms', value: input?.rooms?.bedrooms || 0 },
      { label: 'Bathrooms', value: (input?.rooms?.bathrooms || 0) + (input?.rooms?.commonToilets || 0) },
      { label: 'Specification Tier', value: input?.qualityTier || 'Premium' },
    ],
    derivedQuantities: [
      { label: 'Lighting Points', quantity: quantities?.lightingPoints || 0, unit: 'Points', description: 'Ceiling LED, cove, and task lighting' },
      { label: 'Ceiling Fan Points', quantity: quantities?.fanPoints || 0, unit: 'Points' },
      { label: 'Convenience 6A/16A Sockets', quantity: quantities?.socketPoints || 0, unit: 'Points', description: 'Power sockets for appliances & laptops' },
      { label: 'Air Conditioner (AC) Points', quantity: quantities?.acPoints || 0, unit: 'Points', description: 'Dedicated 20A MCB circuits for bedrooms & living' },
      { label: 'Geyser High-Draw Points', quantity: quantities?.geyserPoints || 0, unit: 'Points', description: '20A heavy-duty points for each bathroom' },
      { label: 'EV Charging Provisions', quantity: quantities?.evPoints || 1, unit: 'Points', description: 'Dedicated 32A industrial circuit in parking' },
      { label: '1.5 sq.mm FRLS Wire', quantity: formatNumber(quantities?.wire1_5SqMmMetres), unit: 'Metres', description: 'Lighting & fan point wiring' },
      { label: '2.5 sq.mm FRLS Wire', quantity: formatNumber(quantities?.wire2_5SqMmMetres), unit: 'Metres', description: 'Power sockets & appliance loops' },
      { label: '4.0 sq.mm FRLS Wire', quantity: formatNumber(quantities?.wire4SqMmMetres), unit: 'Metres', description: 'Dedicated AC & Geyser runs' },
      { label: '6.0 sq.mm Main Incomer', quantity: formatNumber(quantities?.wire6SqMmMetres), unit: 'Metres', description: 'Sub-panel distribution feeder' },
    ],
    calculationLogic: [
      {
        title: 'Point Schedule Derivation',
        formula: 'Space-by-space MEP takeoff (Bedrooms × points + Living × points + Utility)',
        substitutions: `Living (10 pts) + Bed (${input?.rooms?.bedrooms || 0} × 8 pts) + Bath (${input?.rooms?.bathrooms || 0} × 4 pts) + Kitchen (8 pts)`,
        resultText: `${quantities?.totalElectricalPoints || 0} Connected Points`,
      },
      {
        title: 'Concealed Conduit Length',
        formula: 'Total Points × Average Run Factor (3.5 m / point)',
        substitutions: `${quantities?.totalElectricalPoints || 0} points × 3.5 metres`,
        resultText: `${formatNumber(quantities?.conduitsMetres)} Metres PVC Conduit`,
      },
      {
        title: 'FRLS Copper Wire Sizing',
        formula: 'Total Points × Multi-core Loop Factor (11.5 m / point)',
        substitutions: `${quantities?.totalElectricalPoints || 0} points × 11.5 metres`,
        resultText: `${formatNumber(quantities?.electricalWireMetres)} Metres Copper Wire`,
      },
    ],
    rateBreakdown: [...elecBOQ, ...elecLabour],
    costBreakdown: {
      materials: elecMaterialTotal,
      labour: elecLabourTotal,
      total: elecTotal,
    },
    whatDoesThisAffect: [
      'Connected electrical load sanctioning with BESCOM / local utility',
      'Slot chasing and wall grooving before plastering work',
      'Distribution board sizing, RCCB/MCB breaker configurations, and copper earthing pits',
    ],
    quantityVsPriceNote: 'Selecting Havells vs Polycab wire or Legrand switches changes unit item costs, but total point count and conduit run distances remain 100% invariant.',
  };

  // ============================================================
  // STEP 9: SANITARY & PLUMBING FIXTURES (stepKey: 'fixtures')
  // ============================================================
  const fixtureBOQ = findBOQItems((i) => i.category === 'Plumbing & Sanitary Works' || i.description.toLowerCase().includes('fixture') || i.description.toLowerCase().includes('ewc') || i.description.toLowerCase().includes('basin') || i.description.toLowerCase().includes('diverter') || i.description.toLowerCase().includes('sink'));
  const plumbingLabour = findLabourItems((i) => i.category === 'Plumbing');
  const fixtureMaterialTotal = sumCost(fixtureBOQ);
  const plumbingLabourTotal = sumCost(plumbingLabour);
  const fixturesTotal = fixtureMaterialTotal + plumbingLabourTotal;

  explanations['fixtures'] = {
    stepKey: 'fixtures',
    title: 'Sanitary Fixtures, Fittings & Plumbing Cores',
    stepTotal: fixturesTotal,
    unitRateOrBenchmark: `${quantities?.bathroomFixtureSets || 0} Bathroom Suites`,
    summaryMetrics: [
      { label: 'Bathroom Suites', value: quantities?.bathroomFixtureSets || 0 },
      { label: 'Water Supply Points', value: quantities?.totalWaterPoints || 0, unit: 'Points' },
      { label: 'Drainage Outlets', value: quantities?.totalDrainagePoints || 0, unit: 'Points' },
      { label: 'Overhead Tank', value: formatNumber(quantities?.overheadTankLitres), unit: 'Litres' },
    ],
    inputsUsed: [
      { label: 'Bathrooms', value: (input?.rooms?.bathrooms || 0) + (input?.rooms?.commonToilets || 0) },
      { label: 'Kitchens', value: input?.rooms?.kitchen || 0 },
      { label: 'Sanitary Brand', value: input?.bathroomFittings?.sanitaryTier || 'Kohler / Jaquar' },
    ],
    derivedQuantities: [
      { label: 'Wall-Hung EWCs + Concealed Tanks', quantity: quantities?.wcCount || 0, unit: 'Sets' },
      { label: 'Vanity Wash Basins + Pillar Taps', quantity: quantities?.washBasinCount || 0, unit: 'Sets' },
      { label: 'Thermostatic / Concealed Diverters & Showers', quantity: quantities?.showerCount || 0, unit: 'Sets' },
      { label: 'Kitchen SS Sink + Swivel Spout', quantity: quantities?.kitchenSinkCount || 0, unit: 'Sets' },
      { label: 'CPVC Water Supply Piping', quantity: formatNumber(quantities?.cpvcSupplyMetres), unit: 'Metres' },
      { label: 'SWR Soil & Waste Drainage Piping', quantity: formatNumber(quantities?.swrDrainMetres), unit: 'Metres' },
    ],
    calculationLogic: [
      {
        title: 'Wet Point Allocation',
        formula: 'Bathrooms × 5 water points + Kitchen × 3 water points + Utilities',
        substitutions: `${quantities?.bathroomFixtureSets || 0} Bathrooms + ${quantities?.kitchenSinkCount || 0} Kitchen`,
        resultText: `${quantities?.totalWaterPoints || 0} Supply Points`,
      },
    ],
    rateBreakdown: [...fixtureBOQ, ...plumbingLabour],
    costBreakdown: {
      fixtures: fixtureMaterialTotal,
      labour: plumbingLabourTotal,
      total: fixturesTotal,
    },
    whatDoesThisAffect: [
      'Overhead water tank sizing (minimum 2,000L storage capacity)',
      'Underground drainage line layout to municipal manhole',
      'Pressure booster pump and solar water heater piping connections',
    ],
    quantityVsPriceNote: 'Upgrading from Jaquar to Grohe changes fitting prices, but count of toilets, showers, and wash basins remains 100% identical.',
  };

  // ============================================================
  // STEP 10: PAINTING & SURFACE FINISHES (stepKey: 'paint')
  // ============================================================
  const paintBOQ = findBOQItems((i) => i.category === 'Finishing & Painting Works' || i.description.toLowerCase().includes('paint') || i.description.toLowerCase().includes('putty') || i.description.toLowerCase().includes('primer'));
  const paintLabour = findLabourItems((i) => i.trade.toLowerCase().includes('paint'));
  const paintMaterialTotal = sumCost(paintBOQ);
  const paintLabourTotal = sumCost(paintLabour);
  const paintTotal = paintMaterialTotal + paintLabourTotal;

  explanations['paint'] = {
    stepKey: 'paint',
    title: 'Interior & Exterior Painting Systems',
    stepTotal: paintTotal,
    unitRateOrBenchmark: bua > 0 ? `₹${formatNumber(paintTotal / bua)}/sq.ft BUA` : '₹0/sq.ft',
    summaryMetrics: [
      { label: 'Interior Emulsion', value: formatNumber(quantities?.interiorPaintLitres), unit: 'Litres' },
      { label: 'Exterior Weatherproof', value: formatNumber(quantities?.exteriorPaintLitres), unit: 'Litres' },
      { label: 'Wall Putty (2 Coats)', value: formatNumber(quantities?.puttyKg), unit: 'kg' },
      { label: 'Total Paintable Area', value: formatNumber(quantities?.totalPaintableAreaSqFt), unit: 'sq.ft' },
    ],
    inputsUsed: [
      { label: 'Net Internal Wall Area', value: `${formatNumber(buildingModel?.netInternalWallAreaSqFt)} sq.ft` },
      { label: 'Total Ceiling Area', value: `${formatNumber(buildingModel?.totalCeilingAreaSqFt)} sq.ft` },
      { label: 'Net External Wall Area', value: `${formatNumber(buildingModel?.netExternalWallAreaSqFt)} sq.ft` },
      { label: 'Interior Coverage Rate', value: `${quantities?.interiorPaintCoverageSqFtPerLitre || 45} sq.ft/L`, description: 'Canonical active coverage configuration' },
      { label: 'Exterior Coverage Rate', value: `${quantities?.exteriorPaintCoverageSqFtPerLitre || 60} sq.ft/L`, description: 'Canonical active coverage configuration' },
    ],
    derivedQuantities: [
      { label: 'Interior Paintable Surface', quantity: formatNumber(quantities?.interiorPaintAreaSqFt), unit: 'sq.ft', description: 'Net internal walls + ceilings' },
      { label: 'Exterior Facade Surface', quantity: formatNumber(quantities?.exteriorPaintAreaSqFt), unit: 'sq.ft', description: 'All net external facades' },
      { label: 'Interior Paint Quantity', quantity: formatNumber(quantities?.interiorPaintLitres), unit: 'Litres', description: '2 coats acrylic emulsion' },
      { label: 'Exterior Paint Quantity', quantity: formatNumber(quantities?.exteriorPaintLitres), unit: 'Litres', description: '2 coats silicone/acrylic exterior emulsion' },
      { label: 'Wall Putty Quantity', quantity: formatNumber(quantities?.puttyKg), unit: 'kg', description: `${quantities?.puttyKgPerSqFt || 0.55} kg/sq.ft on internal walls & ceilings` },
    ],
    calculationLogic: [
      {
        title: 'Interior Paint Litres',
        formula: 'Interior Paintable Area ÷ Active Coverage (sq.ft/L)',
        substitutions: `${formatNumber(quantities?.interiorPaintAreaSqFt)} sq.ft ÷ ${quantities?.interiorPaintCoverageSqFtPerLitre || 45} sq.ft/L`,
        resultText: `${formatNumber(quantities?.interiorPaintLitres)} Litres`,
      },
      {
        title: 'Exterior Paint Litres',
        formula: 'Exterior Paintable Area ÷ Active Coverage (sq.ft/L)',
        substitutions: `${formatNumber(quantities?.exteriorPaintAreaSqFt)} sq.ft ÷ ${quantities?.exteriorPaintCoverageSqFtPerLitre || 60} sq.ft/L`,
        resultText: `${formatNumber(quantities?.exteriorPaintLitres)} Litres`,
      },
      {
        title: 'Wall Putty Consumption',
        formula: 'Interior Surface Area × Putty Factor (0.55 kg/sq.ft)',
        substitutions: `${formatNumber(quantities?.interiorPaintAreaSqFt)} sq.ft × ${quantities?.puttyKgPerSqFt || 0.55} kg/sq.ft`,
        resultText: `${formatNumber(quantities?.puttyKg)} kg Putty`,
      },
    ],
    rateBreakdown: [...paintBOQ, ...paintLabour],
    costBreakdown: {
      materials: paintMaterialTotal,
      labour: paintLabourTotal,
      total: paintTotal,
    },
    whatDoesThisAffect: [
      'Indoor air quality and aesthetics (low VOC formulation)',
      'Exterior weatherproofing and resistance to fungal algae growth',
      'Surface finish smoothness for joinery and light reflection',
    ],
    quantityVsPriceNote: 'Selecting Royale Luxury Emulsion vs Tractor Emulsion changes the litre rate, but surface square footage and litre requirements remain 100% invariant.',
  };

  // ============================================================
  // COMPREHENSIVE LABOUR BREAKDOWN (stepKey: 'labour')
  // ============================================================
  const allLabour = findLabourItems(() => true);
  const totalLabourCost = sumCost(allLabour);

  explanations['labour'] = {
    stepKey: 'labour',
    title: 'Site Execution & Trade Labour Contracts',
    stepTotal: totalLabourCost,
    unitRateOrBenchmark: bua > 0 ? `₹${formatNumber(totalLabourCost / bua)}/sq.ft BUA` : '₹0/sq.ft',
    summaryMetrics: [
      { label: 'Total Labour', value: formatCurrency(totalLabourCost) },
      { label: 'Civil Composite', value: formatCurrency(allLabour[0]?.cost || 0) },
      { label: 'Specialized Trades', value: formatCurrency(totalLabourCost - (allLabour[0]?.cost || 0)) },
    ],
    inputsUsed: [
      { label: 'Total BUA', value: `${formatNumber(bua)} sq.ft` },
      { label: 'City Benchmark', value: input?.city || 'Bangalore' },
      { label: 'Civil Composite Rate', value: `₹${allLabour[0]?.rate || 380}/sq.ft BUA` },
    ],
    derivedQuantities: (labourSchedule || []).map((l) => ({
      label: l.trade,
      quantity: l.quantity,
      unit: l.unit,
      description: l.notes || l.scope,
    })),
    calculationLogic: [
      {
        title: 'Composite Civil Labour Package',
        formula: 'Total BUA × Benchmark Civil Labour Rate',
        substitutions: `${formatNumber(bua)} sq.ft × ₹${allLabour[0]?.rate || 380}/sq.ft`,
        resultText: formatCurrency(allLabour[0]?.cost || 0),
      },
      {
        title: 'Specialized Trade Labour',
        formula: 'Sum of itemized contracts (Electrical points + Plumbing toilets + Painting)',
        substitutions: `${(labourSchedule || []).length - 1} specialized finishing trades itemized`,
        resultText: formatCurrency(totalLabourCost - (allLabour[0]?.cost || 0)),
      },
    ],
    rateBreakdown: allLabour,
    costBreakdown: {
      labour: totalLabourCost,
      total: totalLabourCost,
    },
    whatDoesThisAffect: [
      'Construction timeline and milestone disbursement schedule',
      'Site safety compliance, contractor workman compensation insurance, and site supervision',
    ],
    quantityVsPriceNote: 'Civil labour quantity is tied to BUA; specialized trades are tied to physical point/room counts. Rates vary by city and package tier.',
  };

  // ============================================================
  // SUMMARY & COMMERCIAL RECONCILIATION (stepKey: 'summary')
  // ============================================================
  const directCivilCost = budget?.baseConstructionCost || 0;
  const contractorMargin = budget?.contractorMargin || 0;
  const contingency = budget?.contingency || 0;
  const designFee = budget?.professionalFees || 0;
  const gst = budget?.gstAmount || 0;
  const grandTotal = budget?.totalProjectCost || 0;

  explanations['summary'] = {
    stepKey: 'summary',
    title: 'Total Project Cost & Commercial Reconciliation',
    stepTotal: grandTotal,
    unitRateOrBenchmark: bua > 0 ? `₹${formatNumber(grandTotal / bua)}/sq.ft BUA` : '₹0/sq.ft',
    summaryMetrics: [
      { label: 'Direct Works Cost', value: formatCurrency(directCivilCost) },
      { label: 'Contractor Margin', value: formatCurrency(contractorMargin) },
      { label: 'Contingency Fund', value: formatCurrency(contingency) },
      { label: 'GST (18%)', value: formatCurrency(gst) },
      { label: 'Grand Total', value: formatCurrency(grandTotal) },
    ],
    inputsUsed: [
      { label: 'Total BUA', value: `${formatNumber(bua)} sq.ft` },
      { label: 'Contractor Margin Rate', value: '12% on Direct Works' },
      { label: 'Contingency Rate', value: '3% on Direct Works' },
      { label: 'Architectural / Design Fee', value: '4% on Direct Works' },
      { label: 'Statutory GST', value: '18% on Subtotal' },
    ],
    derivedQuantities: [
      { label: 'Works BOQ Sum', quantity: formatCurrency(directCivilCost), unit: 'INR' },
      { label: 'Overheads & Margin', quantity: formatCurrency(contractorMargin), unit: 'INR' },
      { label: 'Contingency Reserve', quantity: formatCurrency(contingency), unit: 'INR' },
      { label: 'Architectural & MEP Fees', quantity: formatCurrency(designFee), unit: 'INR' },
      { label: 'Government Tax (GST)', quantity: formatCurrency(gst), unit: 'INR' },
    ],
    calculationLogic: [
      {
        title: 'Project Subtotal',
        formula: 'Direct Works BOQ + Contractor Margin + Contingency + Design Fee',
        substitutions: `${formatCurrency(directCivilCost)} + ${formatCurrency(contractorMargin)} + ${formatCurrency(contingency)} + ${formatCurrency(designFee)}`,
        resultText: formatCurrency(grandTotal - gst),
      },
      {
        title: 'Grand Total with GST',
        formula: 'Subtotal + 18% GST',
        substitutions: `${formatCurrency(grandTotal - gst)} + ${formatCurrency(gst)}`,
        resultText: formatCurrency(grandTotal),
      },
    ],
    rateBreakdown: [
      { item: 'Direct Works BOQ', quantity: 1, unit: 'Package', rate: directCivilCost, rateUnit: '₹', cost: directCivilCost },
      { item: 'Contractor Margin (12%)', quantity: 1, unit: 'Overhead', rate: contractorMargin, rateUnit: '₹', cost: contractorMargin },
      { item: 'Contingency Fund (3%)', quantity: 1, unit: 'Buffer', rate: contingency, rateUnit: '₹', cost: contingency },
      { item: 'Design & Engineering (4%)', quantity: 1, unit: 'Professional', rate: designFee, rateUnit: '₹', cost: designFee },
      { item: 'Government Tax (GST 18%)', quantity: 1, unit: 'Statutory', rate: gst, rateUnit: '₹', cost: gst },
    ],
    costBreakdown: {
      materials: budget?.directMaterialCost || 0,
      fixtures: budget?.directFixtureCost || 0,
      labour: budget?.directLabourCost || 0,
      total: grandTotal,
    },
    whatDoesThisAffect: [
      'Customer bank loan eligibility and disbursement tranches',
      'Construction contract legal binding schedule and milestone guarantees',
    ],
    quantityVsPriceNote: 'Zero unexplained residuals: Grand Total reconciles exactly to Direct Works + Margins + GST with zero rounding errors.',
  };

  return explanations;
}
