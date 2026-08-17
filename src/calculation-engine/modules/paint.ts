// ============================================================
// PAINT MODULE — Internal, external, and putty coverage
// ============================================================

import { EngineInput, AreaResult } from '../types';
import { INTERIOR_PAINT_FACTOR, EXTERIOR_PAINT_FACTOR } from '../data/coefficients';
import { CENTRALIZED_ENGINEERING_ASSUMPTIONS } from '../data/engineeringAssumptions';

/** Perimeter estimation in ft based on plot area */
function estimatePerimeterFt(plotArea: number): number {
  if (plotArea <= 0) return 0;
  const side = Math.sqrt(plotArea);
  return Math.round(side * 4);
}

export function calculatePaint(input: EngineInput, area: AreaResult): {
  interiorPaintAreaSqFt: number;
  exteriorPaintAreaSqFt: number;
  puttyAreaSqFt: number;
  interiorPaintLitres: number;
  exteriorPaintLitres: number;
  puttyKg: number;
} {
  const { floors } = input;
  const bua = area.totalBUASqFt;
  const floorHeightFt = CENTRALIZED_ENGINEERING_ASSUMPTIONS.floorHeightFt.value || 10;

  // Interior: walls (3.5 × BUA) + ceiling
  const interiorPaintAreaSqFt = Math.round(bua * INTERIOR_PAINT_FACTOR);

  // Exterior: perimeter × height per floor × floors × returns factor
  const perimeter = estimatePerimeterFt(area.plotAreaSqFt);
  const exteriorRaw = perimeter * floorHeightFt * (floors || 1) * EXTERIOR_PAINT_FACTOR;
  const exteriorPaintAreaSqFt = Math.round(exteriorRaw);

  // Putty on interior walls + ceiling
  const puttyAreaSqFt = interiorPaintAreaSqFt;

  // Litres: 1 litre covers ~45 sqft for 2 coats of emulsion
  const interiorPaintLitres = Math.ceil(interiorPaintAreaSqFt / 45);
  const exteriorPaintLitres = Math.ceil(exteriorPaintAreaSqFt / 60);
  const puttyKg = Math.round(puttyAreaSqFt * 0.55);

  return {
    interiorPaintAreaSqFt,
    exteriorPaintAreaSqFt,
    puttyAreaSqFt,
    interiorPaintLitres,
    exteriorPaintLitres,
    puttyKg,
  };
}
