// ============================================================
// BUA MODULE – Built-up Area Calculations
// BBMP/BDA FAR & coverage rules
// ============================================================

import { EngineInput, AreaResult } from '../types';
import {
  COVERAGE_FACTOR,
  FLOOR_EFFICIENCY,
  SUPER_BUA_FACTOR,
} from '../data/coefficients';

export function calculateArea(input: EngineInput): AreaResult {
  const rawLength = input.plotLength || 0;
  const rawWidth  = input.plotWidth || 0;
  const rawFloors = input.floors || 0;

  // Actual plot area entered by user
  const plotAreaSqFt = rawLength * rawWidth;

  // Use fallback reference plot (40x30, 2 floors = 1,325 sq ft) for rate calculation if dimensions not entered yet
  const length = rawLength > 0 ? rawLength : 40;
  const width  = rawWidth > 0 ? rawWidth : 30;
  const floors = rawFloors > 0 ? rawFloors : 2;

  const calcPlotArea = length * width;

  // BBMP: Ground coverage max 60% of plot area
  const buildableAreaSqFt = Math.round(calcPlotArea * COVERAGE_FACTOR);

  // Usable floor plate per storey
  const buaPerFloorSqFt = Math.round(buildableAreaSqFt * FLOOR_EFFICIENCY);

  // Total BUA across all floors
  const totalBUASqFt = Math.round(buaPerFloorSqFt * floors);

  // Super BUA = BUA + 15% (walls, common areas, shaft)
  const superBUASqFt = Math.round(totalBUASqFt * SUPER_BUA_FACTOR);

  // Parking area
  const sqFtPerCar = input.parkingType === 'Stilt Parking' || input.parkingType === 'Stilt' ? 180 : 120;
  const parkingAreaSqFt = Math.round((input.carCount || 0) * sqFtPerCar + ((input.bikeCount || 0) * 35));

  // Terrace (top slab exposed area)
  const terraceSqFt = buildableAreaSqFt;

  const totalConstructedSqFt = totalBUASqFt + parkingAreaSqFt + terraceSqFt;

  return {
    plotAreaSqFt,
    buildableAreaSqFt,
    buaPerFloorSqFt,
    totalBUASqFt,
    superBUASqFt,
    parkingAreaSqFt,
    terraceSqFt,
    totalConstructedSqFt,
  };
}
