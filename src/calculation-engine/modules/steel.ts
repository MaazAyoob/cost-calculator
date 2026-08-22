// ============================================================
// STEEL MODULE – Pilot Thumb Rule (PDF Section 6 & Section 17)
//
// Formula:
// Base Steel Factor = 2.8 kg/sqft of total built-up area
// Additional Floor Factor = +0.2 kg/sqft for every floor after the first
// Steel Factor = 2.8 + [0.2 × (Number of Floors − 1)] kg/sqft
// Steel Quantity (kg) = Total Built-up Area × Steel Factor
// Steel Tonnes = Steel Quantity / 1000
// ============================================================

import { EngineInput, AreaResult } from '../types';
import {
  STEEL_BASE_FACTOR_KG_PER_SQFT,
  STEEL_ADDITIONAL_FLOOR_FACTOR,
} from '../data/coefficients';

export function calculateSteel(input: EngineInput, area: AreaResult): {
  steelTonnes: number;
  steelKg: number;
  steelFactorKgPerSqFt: number;
} {
  const floors = Math.max(0, input.floors || 0);
  const bua = area.totalBUASqFt || 0;

  if (floors <= 0 || bua <= 0) {
    return {
      steelTonnes: 0,
      steelKg: 0,
      steelFactorKgPerSqFt: 0,
    };
  }

  // Steel Factor = 2.8 + [0.2 × (Number of Floors - 1)] kg/sqft
  const additionalFloors = Math.max(0, floors - 1);
  const steelFactorKgPerSqFt = parseFloat(
    (STEEL_BASE_FACTOR_KG_PER_SQFT + STEEL_ADDITIONAL_FLOOR_FACTOR * additionalFloors).toFixed(2)
  );

  const steelKg = parseFloat((bua * steelFactorKgPerSqFt).toFixed(2));
  const steelTonnes = parseFloat((steelKg / 1000).toFixed(3));

  return {
    steelTonnes,
    steelKg,
    steelFactorKgPerSqFt,
  };
}
