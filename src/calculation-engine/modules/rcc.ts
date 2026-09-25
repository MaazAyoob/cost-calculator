// ============================================================
// CANONICAL RCC & STRUCTURAL CONCRETE MODULE
// Strictly follows Hutty Pilot Specification & Structural BOQ Engine
// Single source of truth for:
// - Structural framing concrete index
// - Footing RCC Concrete (Isolated / Combined M25)
// - Column Concrete (M25 ground to top floor)
// - Slab & Beam Concrete (M25 monolithic pour)
// - Plinth Beam Concrete (M25 ring beam)
// - Staircase Concrete (M25 waist slab)
// - Reconciled RCC Concrete Total
// ============================================================

import { EngineInput, AreaResult, RCCQuantities } from '../types';
import { configResolver } from '../config/configurationResolver';

export type { RCCQuantities };

export function calculateRCC(input: EngineInput, area: AreaResult): RCCQuantities {
  const bua = area?.totalBUASqFt || 0;

  // Zero-state check
  if (bua <= 0 && (!area?.plotAreaSqFt || area.plotAreaSqFt <= 0)) {
    return {
      approxConcreteCuM: 0,
      footingConcreteCuM: 0,
      columnConcreteCuM: 0,
      slabConcreteCuM: 0,
      plinthConcreteCuM: 0,
      staircaseConcreteCuM: 0,
      rccConcreteTotalCuM: 0,
      totalStructuralConcreteCuM: 0,
    };
  }

  // 1. Resolve Admin-configured Calculation Method & Factors
  const concreteMethod = configResolver.resolveParameter<string>(
    'config.rcc.concrete_calculation_method',
    undefined,
    'BUA_FACTOR'
  );

  const concreteFactor = configResolver.resolveParameter<number>(
    'config.rcc.concrete_factor_cum_sqft',
    undefined,
    0.052
  );

  const footingAllocPct = configResolver.resolveParameter<number>(
    'config.rcc.footing_allocation_pct',
    undefined,
    22.0
  );
  const columnAllocPct = configResolver.resolveParameter<number>(
    'config.rcc.column_allocation_pct',
    undefined,
    18.0
  );
  const slabAllocPct = configResolver.resolveParameter<number>(
    'config.rcc.slab_allocation_pct',
    undefined,
    52.0
  );
  const plinthAllocPct = configResolver.resolveParameter<number>(
    'config.rcc.plinth_allocation_pct',
    undefined,
    8.0
  );
  const staircaseAllocPct = configResolver.resolveParameter<number>(
    'config.rcc.staircase_allocation_pct',
    undefined,
    6.0
  );

  const minFooting = configResolver.resolveParameter<number>(
    'config.rcc.min_footing_concrete_cum',
    undefined,
    5.0
  );
  const minColumn = configResolver.resolveParameter<number>(
    'config.rcc.min_column_concrete_cum',
    undefined,
    3.0
  );
  const minSlab = configResolver.resolveParameter<number>(
    'config.rcc.min_slab_concrete_cum',
    undefined,
    8.0
  );
  const minPlinth = configResolver.resolveParameter<number>(
    'config.rcc.min_plinth_concrete_cum',
    undefined,
    2.0
  );
  const minStaircase = configResolver.resolveParameter<number>(
    'config.rcc.min_staircase_concrete_cum',
    undefined,
    1.0
  );

  let approxConcreteCuM = parseFloat((bua * concreteFactor).toFixed(1));
  let footingConcreteCuM = 0;
  let columnConcreteCuM = 0;
  let slabConcreteCuM = 0;
  let plinthConcreteCuM = 0;
  let staircaseConcreteCuM = 0;

  if (concreteMethod === 'GEOMETRY_GRID') {
    // Structural geometry model based on column grid
    const floors = Math.max(1, input.floors || 1);
    const footprintArea = area.buildableFootprintSqFt || area.buaPerFloorSqFt || (bua / floors);
    const columnCount = Math.max(8, Math.round(footprintArea / 135));
    const footingVolEach = 1.5 * 1.5 * 0.45; // ~1.01 m³ each
    footingConcreteCuM = parseFloat(Math.max(minFooting, columnCount * footingVolEach).toFixed(2));

    const colVolPerFloor = columnCount * (0.23 * 0.30 * 3.05); // ~0.21 m³ per column
    columnConcreteCuM = parseFloat(Math.max(minColumn, colVolPerFloor * floors).toFixed(2));

    const totalSlabAreaSqm = bua * 0.0929;
    slabConcreteCuM = parseFloat(Math.max(minSlab, totalSlabAreaSqm * 0.16).toFixed(2));

    const plinthLengthM = Math.sqrt(footprintArea) * 4 * 0.3048;
    plinthConcreteCuM = parseFloat(Math.max(minPlinth, plinthLengthM * 0.23 * 0.45).toFixed(2));
    staircaseConcreteCuM = parseFloat(Math.max(minStaircase, floors * 1.8).toFixed(2));
    approxConcreteCuM = parseFloat((footingConcreteCuM + columnConcreteCuM + slabConcreteCuM + plinthConcreteCuM + staircaseConcreteCuM).toFixed(1));
  } else {
    // Canonical BUA_FACTOR: Percentage allocations
    footingConcreteCuM = parseFloat(Math.max(minFooting, (approxConcreteCuM * footingAllocPct) / 100).toFixed(2));
    columnConcreteCuM = parseFloat(Math.max(minColumn, (approxConcreteCuM * columnAllocPct) / 100).toFixed(2));
    slabConcreteCuM = parseFloat(Math.max(minSlab, (approxConcreteCuM * slabAllocPct) / 100).toFixed(2));
    plinthConcreteCuM = parseFloat(Math.max(minPlinth, (approxConcreteCuM * plinthAllocPct) / 100).toFixed(2));
    staircaseConcreteCuM = parseFloat(Math.max(minStaircase, (approxConcreteCuM * staircaseAllocPct) / 100).toFixed(2));
  }

  // Reconciled RCC Concrete Total: Footing + Column + Slab (must equal sum of displayed components)
  const rccConcreteTotalCuM = parseFloat((footingConcreteCuM + columnConcreteCuM + slabConcreteCuM).toFixed(2));

  // Full structural envelope concrete (including plinth and staircase)
  const totalStructuralConcreteCuM = parseFloat(
    (footingConcreteCuM + columnConcreteCuM + slabConcreteCuM + plinthConcreteCuM + staircaseConcreteCuM).toFixed(2)
  );

  return {
    approxConcreteCuM,
    footingConcreteCuM,
    columnConcreteCuM,
    slabConcreteCuM,
    plinthConcreteCuM,
    staircaseConcreteCuM,
    rccConcreteTotalCuM,
    totalStructuralConcreteCuM,
  };
}
