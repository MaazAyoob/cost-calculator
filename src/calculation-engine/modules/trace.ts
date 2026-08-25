// ============================================================
// CALCULATION AUDIT & TRACEABILITY MODULE
// Exposes the complete engineering derivation trace for every major calculation
// (Per Hutty Pilot Specification Section 28 & Prompt Section 18)
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

  // 1. Plot Area
  steps.push({
    parameter: 'plotAreaSqFt',
    category: 'GEOMETRY / BUA',
    inputs: { plotLength: input.plotLength, plotWidth: input.plotWidth },
    formula: 'Plot Length × Plot Width',
    assumption: 'Direct site plot boundaries',
    result: area.plotAreaSqFt,
    unit: 'sq.ft',
  });

  // 2. Setbacks & Buildable Footprint
  steps.push({
    parameter: 'buildableFootprintSqFt',
    category: 'GEOMETRY / BUA',
    inputs: {
      plotLength: input.plotLength,
      plotWidth: input.plotWidth,
      frontSetback: area.setbacks.frontSetbackFt,
      rearSetback: area.setbacks.rearSetbackFt,
      leftSetback: area.setbacks.leftSetbackFt,
      rightSetback: area.setbacks.rightSetbackFt,
    },
    formula: '(Length − Front − Rear) × (Width − Left − Right)',
    assumption: area.setbacks.source,
    result: area.buildableFootprintSqFt,
    unit: 'sq.ft',
  });

  // 3. Total BUA
  steps.push({
    parameter: 'totalBUASqFt',
    category: 'GEOMETRY / BUA',
    inputs: { buaPerFloor: area.buaPerFloorSqFt, floors: input.floors },
    formula: 'BUA Per Floor × Number of Floors',
    assumption: 'Uniform floor slabs across all storeys',
    result: area.totalBUASqFt,
    unit: 'sq.ft',
  });

  // 4. Steel Rebar Consumption (PDF Section 6)
  steps.push({
    parameter: 'steelKg',
    category: 'STRUCTURE / REBAR',
    inputs: {
      totalBUA: area.totalBUASqFt,
      floors: input.floors,
      baseFactor: 2.8,
      additionalFloorFactor: 0.2,
    },
    formula: 'Total BUA × [2.8 + 0.2 × (Floors − 1)]',
    assumption: 'Hutty Pilot Specification (Section 6)',
    result: quantities.steelKg,
    unit: 'kg',
  });

  steps.push({
    parameter: 'steelTonnes',
    category: 'STRUCTURE / REBAR',
    inputs: { steelKg: quantities.steelKg },
    formula: 'Steel Kg ÷ 1000',
    assumption: 'Metric conversion without intermediate rounding',
    result: quantities.steelTonnes,
    unit: 'Tonne',
  });

  // 5. Cement Starting Rule (PDF Section 8)
  steps.push({
    parameter: 'cementBags',
    category: 'MATERIALS / CEMENT',
    inputs: { totalBUA: area.totalBUASqFt, startingParameter: 0.40 },
    formula: 'Total BUA × 0.40 bags/sqft',
    assumption: 'Hutty Pilot Specification (Section 8) — 50 kg bags',
    result: quantities.cementBags,
    unit: 'Bags (50 kg)',
  });

  // 6. M-Sand (PDF Section 9)
  steps.push({
    parameter: 'mSandCuFt',
    category: 'MATERIALS / AGGREGATES',
    inputs: { totalBUA: area.totalBUASqFt, startingParameter: 0.60 },
    formula: 'Total BUA × 0.60 CFT/sqft',
    assumption: 'Hutty Pilot Specification (Section 9) — Concrete & fine aggregate',
    result: quantities.mSandCuFt,
    unit: 'Cu Ft',
  });

  // 7. P-Sand (PDF Section 10)
  steps.push({
    parameter: 'pSandCuFt',
    category: 'MATERIALS / AGGREGATES',
    inputs: { totalBUA: area.totalBUASqFt, startingParameter: 0.60 },
    formula: 'Total BUA × 0.60 CFT/sqft',
    assumption: 'Hutty Pilot Specification (Section 10) — Masonry & plaster sand',
    result: quantities.pSandCuFt,
    unit: 'Cu Ft',
  });

  // 8. Coarse Aggregate (PDF Section 11)
  steps.push({
    parameter: 'coarseAggregateCuFt',
    category: 'MATERIALS / AGGREGATES',
    inputs: { totalBUA: area.totalBUASqFt, startingParameter: 1.35 },
    formula: 'Total BUA × 1.35 CFT/sqft',
    assumption: 'Hutty Pilot Specification (Section 11) — 20mm & 12mm crushed blue metal',
    result: quantities.coarseAggregateCuFt,
    unit: 'Cu Ft',
  });

  // 9. Space-Driven Net Wall Area (PDF Section 12)
  steps.push({
    parameter: 'netWallAreaSqFt',
    category: 'SPACE & MASONRY',
    inputs: {
      grossExternalWall: buildingModel.grossExternalWallAreaSqFt,
      grossInternalWall: buildingModel.grossInternalWallAreaSqFt,
      doorOpenings: buildingModel.totalDoorOpeningAreaSqFt,
      windowOpenings: buildingModel.totalWindowOpeningAreaSqFt,
    },
    formula: 'External Wall Area + Internal Wall Area − Door Openings − Window Openings',
    assumption: 'Space Configuration wall perimeters at 10 ft height minus fenestration',
    result: quantities.netWallAreaSqFt,
    unit: 'sq.ft',
  });

  // 10. Masonry Units Count (AAC / Clay Brick / Concrete Block)
  steps.push({
    parameter: 'masonryUnitsCount',
    category: 'SPACE & MASONRY',
    inputs: {
      material: quantities.masonryMaterial || 'AAC Blocks',
      size: quantities.masonrySizeLabel || '600×200×150mm',
      wallVolumeCuM: quantities.masonryVolumeCuM || quantities.wallVolumeCuM,
      unitRate: quantities.masonryUnitRate,
      wastagePercentage: quantities.masonryWastagePct || 5,
    },
    formula: 'Masonry Volume ÷ Unit Block/Brick Volume × (1 + Wastage%)',
    assumption: `${quantities.masonryMaterial || 'AAC Blocks'} (${quantities.masonrySizeLabel || '600×200×150mm'}) with ${quantities.masonryWastagePct || 5}% approved wastage`,
    result: quantities.masonryUnitsCount || quantities.aacBlocksPieces,
    unit: quantities.masonryUnit || 'Nos',
  });

  // 11. Paintable Area (PDF Section 17)
  steps.push({
    parameter: 'totalPaintableAreaSqFt',
    category: 'FINISHES & PAINT',
    inputs: {
      netInternalWall: quantities.internalWallAreaSqFt,
      ceilingArea: quantities.ceilingAreaSqFt,
      netExternalWall: quantities.exteriorPaintAreaSqFt,
    },
    formula: '(Net Internal Wall + Ceilings) + Net External Wall Area',
    assumption: 'Hutty Pilot Specification (Section 17) — No generic BUA multiplier',
    result: quantities.totalPaintableAreaSqFt,
    unit: 'sq.ft',
  });

  // 12. Water Tank Capacity (PDF Section 22)
  steps.push({
    parameter: 'overheadTankLitres',
    category: 'PLUMBING & TANKS',
    inputs: {
      bedrooms: input.rooms.bedrooms || 1,
      occupantsPerBed: 2,
      lpcd: 135,
      storageDays: 1.5,
    },
    formula: 'Bedrooms × 2 Occupants × 135 LPCD × 1.5 Days',
    assumption: 'IS 1172 Standard Domestic Water Demand',
    result: quantities.overheadTankLitres,
    unit: 'Litres',
  });

  // 13. Effective Rate per Sq.Ft (PDF Section 28)
  steps.push({
    parameter: 'costPerSqFt',
    category: 'BUDGET & COMMERCIAL',
    inputs: {
      totalProjectCost: budget.totalProjectCost,
      totalBUA: area.totalBUASqFt,
    },
    formula: 'Total Project Cost ÷ Total Built-Up Area',
    assumption: 'All-inclusive pre-construction estimate',
    result: budget.costPerSqFt,
    unit: '₹/sq.ft',
  });

  return steps;
}
