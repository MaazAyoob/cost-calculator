// ============================================================
// BUA MODULE – Built-up Area Calculations
// Linear Architecture:
// Plot Dimensions → Plot Area → Authority Rule (Max Allowed) →
// User Selected BUA/Floor → Remaining Ground Area → Total BUA
// ============================================================

import { EngineInput, AreaResult } from '../types';
import {
  COVERAGE_FACTOR,
  SUPER_BUA_FACTOR,
} from '../data/coefficients';

export function calculateArea(input: EngineInput): AreaResult {
  const length = input.plotLength || 0;
  const width  = input.plotWidth || 0;
  const floors = input.floors || 0;

  // 1. PLOT AREA
  const plotAreaSqFt = length * width;

  // Parking footprint
  const sqFtPerCar = input.parkingType === 'Stilt Parking' || input.parkingType === 'Stilt' ? 180 : 120;
  const parkingAreaSqFt = Math.round((input.carCount || 0) * sqFtPerCar + ((input.bikeCount || 0) * 35));

  // Zero state check: unconfigured project
  if (plotAreaSqFt <= 0 || floors <= 0) {
    return {
      plotAreaSqFt: 0,
      maxAllowableBUAPerFloorSqFt: 0,
      buaPerFloorSqFt: 0,
      buildableAreaSqFt: 0,
      remainingGroundAreaSqFt: 0,
      remainingGroundArea: 0,
      groundCoveragePercentage: 0,
      totalBUASqFt: 0,
      superBUASqFt: 0,
      parkingAreaSqFt,
      terraceSqFt: 0,
      totalConstructedSqFt: parkingAreaSqFt,
      isWithinPermissibleLimit: true,
      requiresClientConfirmation: false,
    };
  }

  // 2. AUTHORITY / SETBACK RULE (Maximum Allowable BUA per Floor)
  // Standard BBMP / BDA / MUDA planning coverage limit (e.g. 60%)
  const maxAllowableBUAPerFloorSqFt = Math.round(plotAreaSqFt * COVERAGE_FACTOR);

  // 3. USER-SELECTED BUILT-UP AREA PER FLOOR
  // User directly selects/enters the desired BUA per floor
  const buaPerFloorSqFt = typeof input.builtUpAreaPerFloor === 'number' ? Math.max(0, input.builtUpAreaPerFloor) : 0;

  // 4. VALIDATION & CLIENT CONFIRMATION
  // Check if selected BUA exceeds permissible authority coverage
  const isWithinPermissibleLimit = buaPerFloorSqFt <= maxAllowableBUAPerFloorSqFt;
  const requiresClientConfirmation = !isWithinPermissibleLimit || (input.authority !== 'BBMP/BDA' && input.authority !== 'MUDA');
  let confirmationMessage: string | undefined;
  if (!isWithinPermissibleLimit && buaPerFloorSqFt > 0) {
    confirmationMessage = `Selected BUA per floor (${buaPerFloorSqFt} sq.ft) exceeds the standard maximum allowable footprint (${maxAllowableBUAPerFloorSqFt} sq.ft / ${(COVERAGE_FACTOR * 100).toFixed(0)}% coverage) under ${input.authority || 'BBMP/BDA'} bylaws. Client confirmation / setback relaxation required.`;
  }

  // 5. REMAINING GROUND AREA
  // Note: Open ground area is based on ground footprint only: plotArea - builtUpAreaPerFloor
  const remainingGroundAreaSqFt = Math.max(0, plotAreaSqFt - buaPerFloorSqFt);
  const remainingGroundArea = remainingGroundAreaSqFt;

  // 6. GROUND COVERAGE PERCENTAGE
  const groundCoveragePercentage = plotAreaSqFt > 0 ? (buaPerFloorSqFt / plotAreaSqFt) * 100 : 0;

  // 7. TOTAL BUILT-UP AREA
  const totalBUASqFt = Math.round(buaPerFloorSqFt * floors);

  // 8. SUPER BUA (BUA + 15% common areas/walls/shaft)
  const superBUASqFt = Math.round(totalBUASqFt * SUPER_BUA_FACTOR);

  // 9. GROUND FOOTPRINT & TERRACE
  const buildableAreaSqFt = buaPerFloorSqFt;
  const terraceSqFt = buaPerFloorSqFt;

  const totalConstructedSqFt = totalBUASqFt + parkingAreaSqFt + terraceSqFt;

  return {
    plotAreaSqFt,
    maxAllowableBUAPerFloorSqFt,
    buaPerFloorSqFt,
    buildableAreaSqFt,
    remainingGroundAreaSqFt,
    remainingGroundArea,
    groundCoveragePercentage,
    totalBUASqFt,
    superBUASqFt,
    parkingAreaSqFt,
    terraceSqFt,
    totalConstructedSqFt,
    isWithinPermissibleLimit,
    requiresClientConfirmation,
    confirmationMessage,
  };
}

