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
import { configResolver } from '../config/configurationResolver';
import { calculationMethodManager } from '../rules/methodRegistry';

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

  const baseFactor = configResolver.resolveParameter(
    'config.rcc.steel_base_factor_kg_sqft',
    undefined,
    configResolver.resolveParameter('rcc.steel_base_factor_kg_sqft', undefined, STEEL_BASE_FACTOR_KG_PER_SQFT)
  );
  const floorIncrement = configResolver.resolveParameter(
    'config.rcc.steel_additional_floor_factor',
    undefined,
    configResolver.resolveParameter('rcc.steel_floor_increment_kg_sqft', undefined, STEEL_ADDITIONAL_FLOOR_FACTOR)
  );

  const activeMethod = calculationMethodManager.getMethod('steel')?.activeMethodId || 'steel_floorwise';

  let steelFactorKgPerSqFt = baseFactor;
  let steelKg = 0;
  let steelTonnes = 0;

  if (activeMethod === 'steel_manual') {
    const manualTonnes = configResolver.resolveParameter('config.rcc.manual_steel_tonnes', undefined, 7.2);
    steelTonnes = manualTonnes;
    steelKg = manualTonnes * 1000;
    steelFactorKgPerSqFt = bua > 0 ? parseFloat((steelKg / bua).toFixed(2)) : 0;
  } else if (activeMethod === 'steel_simple_bua') {
    steelFactorKgPerSqFt = parseFloat(baseFactor.toFixed(2));
    steelKg = parseFloat((bua * steelFactorKgPerSqFt).toFixed(2));
    steelTonnes = parseFloat((steelKg / 1000).toFixed(3));
  } else {
    // Default: steel_floorwise
    const additionalFloors = Math.max(0, floors - 1);
    steelFactorKgPerSqFt = parseFloat((baseFactor + floorIncrement * additionalFloors).toFixed(2));
    steelKg = parseFloat((bua * steelFactorKgPerSqFt).toFixed(2));
    steelTonnes = parseFloat((steelKg / 1000).toFixed(3));
  }

  return {
    steelTonnes,
    steelKg,
    steelFactorKgPerSqFt,
  };
}
