// ============================================================
// CALCULATION AUDIT & TRACEABILITY MODULE
// Exposes the complete engineering derivation trace for every major calculation
// (Per Hutty Launch Readiness Report P0.4 Traceability Architecture)
//
// Calculation Chain:
// User Input → Space/Project Config → Hutty Rule → Formula →
// Raw Qty → Wastage/Adjustment → Final Qty → Rate → Amount → Trade Category
// ============================================================

import {
  EngineInput,
  AreaResult,
  MaterialQuantities,
  BuildingModel,
  BudgetResult,
  CalculationTraceStep,
} from '../types';

export function generateCalculationTrace(
  input: EngineInput,
  area: AreaResult,
  quantities: MaterialQuantities,
  buildingModel: BuildingModel,
  budget: BudgetResult
): CalculationTraceStep[] {
  const steps: CalculationTraceStep[] = [];
  const bua = area.totalBUASqFt || 0;
  const floors = Math.max(1, input.floors || 1);

  // 1. Steel Rebar Consumption (P0.4 Specification)
  const steelRatePerTonne = 74000;
  const steelAmount = Math.round(quantities.steelTonnes * steelRatePerTonne);
  steps.push({
    ruleId: 'RULE-STEEL-01',
    parameter: 'steelKg',
    category: 'STRUCTURE / REBAR',
    tradeCategory: 'Foundation & Structure',
    inputs: {
      totalBUASqFt: bua,
      floorsCount: floors,
      baseFactorKgPerSqFt: 2.8,
      incrementalFloorFactor: 0.2,
      effectiveFactorKgPerSqFt: quantities.steelFactorKgPerSqFt,
      wastageAllowance: '4% standard fabrication & lap overlap included in thumb rule factor',
    },
    formula: 'Total BUA × [2.8 + 0.2 × (Floors − 1)]',
    rawQuantity: Math.round(bua * (2.8 + 0.2 * (floors - 1))),
    adjustments: 'Standard lap & bend wastage factored',
    finalQuantity: quantities.steelTonnes,
    unit: 'Tonne',
    unitRate: steelRatePerTonne,
    amount: steelAmount,
    assumption: 'Preliminary structural thumb rule; final rebar detailing certified by appointed engineer.',
    explanation: `Built-up area of ${bua.toLocaleString()} sq.ft across ${floors} floors uses an empirical factor of ${quantities.steelFactorKgPerSqFt} kg/sq.ft yielding ${quantities.steelKg.toLocaleString()} kg (${quantities.steelTonnes} tonnes) of TMT Fe 550D rebar.`,
    result: quantities.steelTonnes,
  });

  // 2. Portland Cement Bags (P0.4 Specification)
  const cementRatePerBag = 420;
  const cementAmount = quantities.cementBags * cementRatePerBag;
  steps.push({
    ruleId: 'RULE-CEMENT-01',
    parameter: 'cementBags',
    category: 'MATERIALS / CEMENT',
    tradeCategory: 'Foundation & Structure',
    inputs: {
      totalBUASqFt: bua,
      consumptionRuleBagsPerSqFt: 0.40,
      scope: 'Footings, plinth, columns, beams, slabs, masonry mortar, and internal/external plaster',
      bagWeightKg: 50,
      wastageAllowance: '2% handling & spillage accounted in rounding',
    },
    formula: 'Total BUA × 0.40 bags/sqft',
    rawQuantity: bua * 0.40,
    adjustments: 'Rounded to whole 50 kg moisture-sealed bags',
    finalQuantity: quantities.cementBags,
    unit: 'Bags (50 kg)',
    unitRate: cementRatePerBag,
    amount: cementAmount,
    assumption: 'OPC 53 / PPC residential grade standard thumb rule.',
    explanation: `Estimated ${bua.toLocaleString()} sq.ft BUA consumes 0.40 bags/sq.ft covering RCC frame, masonry mortar and 2-coat plaster, resulting in ${quantities.cementBags} bags.`,
    result: quantities.cementBags,
  });

  // 3. Masonry / Blocks (P0.4 Specification)
  const blockRate = quantities.masonryUnitRate || 85;
  const blockAmount = quantities.masonryAmount || (quantities.masonryUnitsCount * blockRate);
  steps.push({
    ruleId: 'RULE-MASONRY-01',
    parameter: 'masonryUnitsCount',
    category: 'SPACE & MASONRY',
    tradeCategory: 'Masonry & Plastering',
    inputs: {
      netWallAreaSqFt: quantities.netWallAreaSqFt,
      grossWallAreaSqFt: buildingModel.grossExternalWallAreaSqFt + buildingModel.grossInternalWallAreaSqFt,
      doorDeductionsSqFt: buildingModel.totalDoorOpeningAreaSqFt,
      windowDeductionsSqFt: buildingModel.totalWindowOpeningAreaSqFt,
      wallThicknessM: 0.15,
      wallVolumeCuM: quantities.wallVolumeCuM,
      material: quantities.masonryMaterial || 'AAC Blocks',
      blockDimensions: quantities.masonrySizeLabel || '600×200×150mm',
      wastagePercentage: quantities.masonryWastagePct || 5,
    },
    formula: 'Net Wall Volume (cu.m) ÷ Block Volume (cu.m) × (1 + Wastage%)',
    rawQuantity: Math.round(quantities.wallVolumeCuM / 0.018),
    adjustments: `${quantities.masonryWastagePct || 5}% breakage & cutting wastage`,
    finalQuantity: quantities.masonryUnitsCount,
    unit: quantities.masonryUnit || 'Nos',
    unitRate: blockRate,
    amount: blockAmount,
    assumption: 'Space Configuration wall perimeters at 10 ft height minus all doors and windows.',
    explanation: `Total gross wall area minus ${buildingModel.totalDoorOpeningAreaSqFt} sq.ft doors and ${buildingModel.totalWindowOpeningAreaSqFt} sq.ft windows gives ${quantities.netWallAreaSqFt.toLocaleString()} sq.ft net wall area (${quantities.wallVolumeCuM.toFixed(1)} cu.m). At standard block dimensions plus 5% wastage, this requires ${quantities.masonryUnitsCount.toLocaleString()} blocks.`,
    result: quantities.masonryUnitsCount,
  });

  // 4. Flooring (P0.4 Specification)
  const floorRate = 145;
  const floorAmount = quantities.floorTilesSqFt * floorRate;
  steps.push({
    ruleId: 'RULE-FLOORING-01',
    parameter: 'floorTilesSqFt',
    category: 'FINISHES & FLOORING',
    tradeCategory: 'Flooring & Cladding',
    inputs: {
      totalBUASqFt: bua,
      spaceFloorAreaSumSqFt: buildingModel.allSpaces.reduce((acc, s) => acc + (s.flooringAreaSqFt || s.area), 0),
      exclusions: 'Wall footings, shafts, stair cutouts deducted from carpet floor area',
      wastagePercentage: 8,
    },
    formula: 'Configured Habitable Spaces Area + 8% Cutting Wastage',
    rawQuantity: Math.round(quantities.floorTilesSqFt / 1.08),
    adjustments: '8% cutting and diagonal room alignment wastage',
    finalQuantity: quantities.floorTilesSqFt,
    unit: 'Sq Ft',
    unitRate: floorRate,
    amount: floorAmount,
    assumption: 'Room-by-room space layout driving living, dining, bedroom, and kitchen tile coverage.',
    explanation: `Sum of configured space floor areas with 8% cutting and tile alignment allowance yields ${quantities.floorTilesSqFt.toLocaleString()} sq.ft of vitrified / granite flooring.`,
    result: quantities.floorTilesSqFt,
  });

  // 5. Dado Wall Tiles (P0.4 Specification)
  const dadoRate = 95;
  const dadoAmount = quantities.wallTilesSqFt * dadoRate;
  steps.push({
    ruleId: 'RULE-DADO-01',
    parameter: 'wallTilesSqFt',
    category: 'FINISHES & CLADDING',
    tradeCategory: 'Flooring & Cladding',
    inputs: {
      bathroomCount: (input.rooms.bathrooms || 0) + (input.rooms.commonToilets || 0),
      kitchenCount: input.rooms.kitchen || 0,
      bathroomTileHeight: input.wallCladding?.bathroomTileHeight || '7 ft (Lintel)',
      kitchenDadoHeight: input.wallCladding?.kitchenDadoHeight || '2 ft',
      deductions: 'Door frames and ventilator openings within tile band deducted',
      wastagePercentage: 7,
    },
    formula: '(Bathroom Perimeters × Dado Height) + (Kitchen Counter Length × Height) − Openings + Wastage',
    rawQuantity: quantities.bathroomDadoTileSqFt + quantities.kitchenDadoTileSqFt,
    adjustments: '7% pattern match & cutting wastage',
    finalQuantity: quantities.wallTilesSqFt,
    unit: 'Sq Ft',
    unitRate: dadoRate,
    amount: dadoAmount,
    assumption: 'Sanitary wall perimeter tiled to specified lintel (7ft) or ceiling height.',
    explanation: `Configured wet room perimeters across bathrooms and kitchen counter backsplash minus window/door openings require ${quantities.wallTilesSqFt.toLocaleString()} sq.ft of wall dado tiles.`,
    result: quantities.wallTilesSqFt,
  });

  // 6. Waterproofing (P0.4 Specification)
  const wpRate = 75;
  const wpAmount = quantities.waterproofingAreaSqFt * wpRate;
  steps.push({
    ruleId: 'RULE-WATERPROOFING-01',
    parameter: 'waterproofingAreaSqFt',
    category: 'CIVIL & WATERPROOFING',
    tradeCategory: 'Roofing & Waterproofing',
    inputs: {
      bathroomSunkenFloorsSqFt: quantities.bathroomWaterproofingSqFt,
      terraceRoofSqFt: quantities.terraceWaterproofingSqFt,
      sumpTankSqFt: quantities.sumpWaterproofingSqFt,
      upturnAllowanceFt: 1.0,
    },
    formula: 'Sunken Bathrooms (with 1ft vertical coving upturn) + Top Terrace + Underground Sump',
    rawQuantity: quantities.bathroomWaterproofingSqFt + quantities.terraceWaterproofingSqFt + quantities.sumpWaterproofingSqFt,
    adjustments: 'Includes vertical parapet coving and pipe collar seals',
    finalQuantity: quantities.waterproofingAreaSqFt,
    unit: 'Sq Ft',
    unitRate: wpRate,
    amount: wpAmount,
    assumption: '2-coat elastomeric polymer modified cementitious coating with fiberglass reinforcement.',
    explanation: `Total waterproofed surface comprises ${quantities.bathroomWaterproofingSqFt} sq.ft sunken wet areas, ${quantities.terraceWaterproofingSqFt} sq.ft terrace slab, and ${quantities.sumpWaterproofingSqFt} sq.ft underground sump tank totaling ${quantities.waterproofingAreaSqFt.toLocaleString()} sq.ft.`,
    result: quantities.waterproofingAreaSqFt,
  });

  // 7. CPVC Plumbing Supply Lines (P0.4 Specification)
  const cpvcRate = 140;
  const cpvcAmount = quantities.cpvcSupplyMetres * cpvcRate;
  steps.push({
    ruleId: 'RULE-CPVC-01',
    parameter: 'cpvcSupplyMetres',
    category: 'MEP / PLUMBING',
    tradeCategory: 'Plumbing & Sanitary',
    inputs: {
      totalWaterPoints: quantities.totalWaterPoints,
      floorsCount: floors,
      pointsPerBathroom: 4,
      pipeFactorMetresPerPoint: 3.2,
      verticalRiserAllowanceMetres: floors * 4.5,
    },
    formula: '(Total Water Points × 3.2m pipe/point) + (Floors × 4.5m Vertical Riser × 1.5)',
    rawQuantity: Math.round(quantities.totalWaterPoints * 3.2),
    adjustments: `Includes ${Math.round(floors * 4.5 * 1.5)}m vertical pressure distribution risers`,
    finalQuantity: quantities.cpvcSupplyMetres,
    unit: 'Metres',
    unitRate: cpvcRate,
    amount: cpvcAmount,
    assumption: 'SDR 11 CPVC hot & cold concealed water distribution per IS 15778.',
    explanation: `${quantities.totalWaterPoints} sanitary/kitchen water supply points across ${floors} floors require ${quantities.cpvcSupplyMetres} metres of heavy-duty CPVC pipe including vertical risers.`,
    result: quantities.cpvcSupplyMetres,
  });

  // 8. Electrical Wiring Cable (P0.4 Specification)
  const cableRate = 38;
  const cableAmount = quantities.electricalWireMetres * cableRate;
  steps.push({
    ruleId: 'RULE-CABLE-01',
    parameter: 'electricalWireMetres',
    category: 'MEP / ELECTRICAL',
    tradeCategory: 'Electrical MEP',
    inputs: {
      totalElectricalPoints: quantities.totalElectricalPoints,
      lightingPoints: quantities.lightingPoints,
      powerSockets: quantities.socketPoints,
      acPoints: quantities.acPoints,
      circuitAssumptionMetersPerPoint: 5.2,
      mainDistributionLoopFactor: 1.15,
    },
    formula: 'Total Electrical Points × 5.2m routing factor × 1.15 circuit homerun factor',
    rawQuantity: Math.round(quantities.totalElectricalPoints * 5.2),
    adjustments: '15% circuit home-run allowance to distribution boards',
    finalQuantity: quantities.electricalWireMetres,
    unit: 'Metres',
    unitRate: cableRate,
    amount: cableAmount,
    assumption: 'FRLS Copper multi-strand wiring (1.5, 2.5, 4.0 sq.mm circuits) in concealed PVC conduit.',
    explanation: `${quantities.totalElectricalPoints} electrical draw points (lights, fans, 16A power sockets, ACs) require ${quantities.electricalWireMetres} metres of FRLS copper wire.`,
    result: quantities.electricalWireMetres,
  });

  // 9. Windows & Fenestration (P0.1 Specification)
  const windowRate = 550;
  const windowAmount = quantities.windowAreaSqFt * windowRate;
  steps.push({
    ruleId: 'RULE-WINDOWS-01',
    parameter: 'windowAreaSqFt',
    category: 'FENESTRATION / OPENINGS',
    tradeCategory: 'Windows & Glazing',
    inputs: {
      totalWindowsCount: quantities.windowsCount,
      roomFenestrationRules: 'Living: 6×5 ft (30 sqft), Bed: 5×4 ft (20 sqft), Kitchen: 4×3 ft (12 sqft), Bath: 2×3 ft (6 sqft)',
    },
    formula: 'Sum(Window Count × Width × Height) = Total Area',
    rawQuantity: quantities.windowsCount,
    adjustments: 'Calculated area from room opening schedules',
    finalQuantity: quantities.windowAreaSqFt,
    unit: 'Sq Ft',
    unitRate: windowRate,
    amount: windowAmount,
    assumption: 'Track-glazed uPVC/aluminium fenestration priced per square foot of opening area.',
    explanation: `${quantities.windowsCount} configured openings produce ${quantities.windowAreaSqFt} sq.ft total fenestration area at ₹${windowRate}/sq.ft.`,
    result: quantities.windowAreaSqFt,
  });

  // 10. Doors Schedule (P0.5 Specification)
  steps.push({
    ruleId: 'RULE-DOORS-01',
    parameter: 'totalDoorsCount',
    category: 'JOINERY / OPENINGS',
    tradeCategory: 'Doors & Joinery',
    inputs: {
      mainDoorsCount: quantities.mainDoorsCount,
      internalDoorsCount: quantities.internalDoorsCount,
      bathroomDoorsCount: quantities.bathroomDoorsCount,
    },
    formula: 'Main Entrance + Bed/Office/Utility + Waterproof Bathroom Doors',
    rawQuantity: quantities.totalDoorsCount,
    adjustments: '100% matched to room requirements',
    finalQuantity: quantities.totalDoorsCount,
    unit: 'Sets',
    assumption: 'Complete door sets including seasoned frame, flush/teak shutter, SS lock and hardware.',
    explanation: `${quantities.mainDoorsCount} grand entrance door, ${quantities.internalDoorsCount} internal room doors, and ${quantities.bathroomDoorsCount} waterproof bathroom doors total ${quantities.totalDoorsCount} complete door sets.`,
    result: quantities.totalDoorsCount,
  });

  // 11. Effective Rate per Sq.Ft (Commercial Reconciliation)
  steps.push({
    ruleId: 'RULE-COMMERCIAL-01',
    parameter: 'costPerSqFt',
    category: 'BUDGET & COMMERCIAL',
    tradeCategory: 'Total Project Cost',
    inputs: {
      totalProjectCost: budget.totalProjectCost,
      totalBUASqFt: bua,
      baseConstructionCost: budget.baseConstructionCost,
      commercialAdditions: budget.contractorMargin + budget.contingency + budget.professionalFees + budget.gstAmount,
    },
    formula: 'Total Project Cost ÷ Total Built-Up Area',
    rawQuantity: budget.totalProjectCost,
    adjustments: 'Fully reconciled sum of civil works, materials, fixtures, margins and statutory GST',
    finalQuantity: budget.costPerSqFt,
    unit: '₹/sq.ft',
    assumption: 'All-inclusive pre-construction preliminary estimate.',
    explanation: `Total project cost of ₹${budget.totalProjectCost.toLocaleString('en-IN')} divided by ${bua.toLocaleString()} sq.ft BUA yields an effective rate of ₹${budget.costPerSqFt.toLocaleString('en-IN')}/sq.ft.`,
    result: budget.costPerSqFt,
  });

  return steps;
}
