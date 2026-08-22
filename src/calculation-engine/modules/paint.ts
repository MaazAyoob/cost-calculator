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

  // Material consumable quantities:
  // 1 litre interior emulsion covers ~45 sqft (2 coats)
  // 1 litre exterior weather guard covers ~60 sqft (2 coats)
  // 1 kg acrylic putty covers ~1.8 sqft (0.55 kg/sqft for 2 coats)
  const interiorPaintLitres = Math.ceil(interiorPaintAreaSqFt / 45);
  const exteriorPaintLitres = Math.ceil(exteriorPaintAreaSqFt / 60);
  const puttyKg = Math.round(puttyAreaSqFt * 0.55);

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
  };
}
