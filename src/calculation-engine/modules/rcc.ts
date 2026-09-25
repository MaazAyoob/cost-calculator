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

  // Canonical structural concrete sizing factor (0.052 Cu.M per sq.ft BUA)
  const approxConcreteCuM = parseFloat((bua * 0.052).toFixed(1));

  // Canonical sub-component allocations (IS 456 residential framing benchmark)
  const footingConcreteCuM = parseFloat(Math.max(5, approxConcreteCuM * 0.22).toFixed(2));
  const columnConcreteCuM = parseFloat(Math.max(3, approxConcreteCuM * 0.18).toFixed(2));
  const slabConcreteCuM = parseFloat(Math.max(8, approxConcreteCuM * 0.52).toFixed(2));
  const plinthConcreteCuM = parseFloat(Math.max(2, approxConcreteCuM * 0.08).toFixed(2));
  const staircaseConcreteCuM = parseFloat(Math.max(1, approxConcreteCuM * 0.06).toFixed(2));

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
