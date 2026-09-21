// ============================================================
// PAINT & PLASTER MODULE
// Strictly follows Hutty Pilot Specification (Section 17)
//
// Rules:
// - Internal Plaster/Paint Area = Net Internal Wall Area + Applicable Ceilings
// - External Plaster/Paint Area = Net External Wall Area
// - Total Paintable Area = Internal Paintable Area + External Paintable Area
// - NEVER use arbitrary BUA × 3.5 multiplier as primary calculation
// ============================================================

import { EngineInput, AreaResult, BuildingModel } from '../types';
import { configResolver } from '../config/configurationResolver';
import { calculationMethodManager } from '../rules/methodRegistry';

export function calculatePaint(
  input: EngineInput,
  area: AreaResult,
  buildingModel: BuildingModel
): {
  internalWallAreaSqFt: number;
  ceilingAreaSqFt: number;
  interiorPaintAreaSqFt: number;
  exteriorPaintAreaSqFt: number;
  totalPaintableAreaSqFt: number;
  puttyAreaSqFt: number;
  interiorPaintLitres: number;
  exteriorPaintLitres: number;
  puttyKg: number;
  interiorCoverageSqFtPerLitre: number;
  exteriorCoverageSqFtPerLitre: number;
  puttyKgPerSqFt: number;
} {
  const bua = area.totalBUASqFt || 0;

  if (bua <= 0) {
    return {
      internalWallAreaSqFt: 0,
      ceilingAreaSqFt: 0,
      interiorPaintAreaSqFt: 0,
      exteriorPaintAreaSqFt: 0,
      totalPaintableAreaSqFt: 0,
      puttyAreaSqFt: 0,
      interiorPaintLitres: 0,
      exteriorPaintLitres: 0,
      puttyKg: 0,
      interiorCoverageSqFtPerLitre: 45,
      exteriorCoverageSqFtPerLitre: 60,
      puttyKgPerSqFt: 0.55,
    };
  }

  // Derived directly from canonical Building & Space Model
  const internalWallAreaSqFt = Math.round(buildingModel.netInternalWallAreaSqFt);
  const ceilingAreaSqFt = Math.round(buildingModel.totalCeilingAreaSqFt);

  // Internal Paint Area = Net Internal Wall Area + Total Ceiling Area
  const interiorPaintAreaSqFt = internalWallAreaSqFt + ceilingAreaSqFt;

  // External Paint Area = Net External Wall Area
  const exteriorPaintAreaSqFt = Math.round(buildingModel.netExternalWallAreaSqFt);

  // Total Paintable Area
  const totalPaintableAreaSqFt = interiorPaintAreaSqFt + exteriorPaintAreaSqFt;

  // Putty on internal walls + ceiling
  const puttyAreaSqFt = interiorPaintAreaSqFt;

  // Dynamic configuration resolution with method selection
  const interiorCoverage = configResolver.resolveParameter('config.paint.interior_coverage_sqft_per_litre', undefined, 45);
  const exteriorCoverage = configResolver.resolveParameter('config.paint.exterior_coverage_sqft_per_litre', undefined, 60);
  const puttyKgPerSqFt = configResolver.resolveParameter('config.paint.putty_kg_per_sqft', undefined, 0.55);

  const activeMethod = calculationMethodManager.getMethod('paint')?.activeMethodId || 'paint_surface_area';
  let interiorPaintLitres = 0;
  if (activeMethod === 'paint_thumb_rule_bua') {
    const thumbRate = configResolver.resolveParameter('config.paint.litres_per_sqft_bua', undefined, 0.12);
    interiorPaintLitres = Math.ceil(bua * thumbRate);
  } else {
    interiorPaintLitres = Math.ceil(interiorPaintAreaSqFt / interiorCoverage);
  }

  const exteriorPaintLitres = Math.ceil(exteriorPaintAreaSqFt / exteriorCoverage);
  const puttyKg = Math.round(puttyAreaSqFt * puttyKgPerSqFt);

  return {
    internalWallAreaSqFt,
    ceilingAreaSqFt,
    interiorPaintAreaSqFt,
    exteriorPaintAreaSqFt,
    totalPaintableAreaSqFt,
    puttyAreaSqFt,
    interiorPaintLitres,
    exteriorPaintLitres,
    puttyKg,
    interiorCoverageSqFtPerLitre: interiorCoverage,
    exteriorCoverageSqFtPerLitre: exteriorCoverage,
    puttyKgPerSqFt,
  };
}
