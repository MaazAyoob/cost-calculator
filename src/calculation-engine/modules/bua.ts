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
  const length = input.plotLength || 0;
  const width  = input.plotWidth || 0;
  const floors = input.floors || 0;

  // Actual plot area entered by user
  const plotAreaSqFt = length * width;

  if (plotAreaSqFt <= 0 || floors <= 0) {
    const sqFtPerCar = input.parkingType === 'Stilt Parking' || input.parkingType === 'Stilt' ? 180 : 120;
    const parkingAreaSqFt = Math.round((input.carCount || 0) * sqFtPerCar + ((input.bikeCount || 0) * 35));
    return {
      plotAreaSqFt: 0,
      buildableAreaSqFt: 0,
      buaPerFloorSqFt: 0,
      totalBUASqFt: 0,
      superBUASqFt: 0,
      parkingAreaSqFt,
      terraceSqFt: 0,
      totalConstructedSqFt: parkingAreaSqFt,
    };
  }

  // BBMP: Ground coverage max 60% of plot area
  const buildableAreaSqFt = Math.round(plotAreaSqFt * COVERAGE_FACTOR);

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
