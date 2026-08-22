// ============================================================
// BUA MODULE – Built-up Area & Setback Geometry Engine
// Strictly follows Hutty Pilot Specification (Section 5)
//
// Geometry Formulas:
// Plot Area = Plot Length × Plot Width
// Buildable Length = Plot Length − Front Setback − Rear Setback
// Buildable Width = Plot Width − Left Setback − Right Setback
// Buildable Footprint = Buildable Length × Buildable Width
// Total Built-up Area = Sum of applicable floor areas
// ============================================================

import { EngineInput, AreaResult, SetbackGeometry } from '../types';
import { COVERAGE_FACTOR, SUPER_BUA_FACTOR } from '../data/coefficients';

/**
 * Standard municipal setback estimator when site-specific survey is pending
 * Based on BBMP/BDA and MUDA residential plot classification
 */
function getStatutorySetbacks(plotLength: number, plotWidth: number, authority: string): SetbackGeometry {
  const plotArea = plotLength * plotWidth;

  // If plot is small (<= 1200 sqft, e.g. 30×40)
  if (plotArea <= 1200) {
    return {
      frontSetbackFt: 4.5,
      rearSetbackFt: 3.5,
      leftSetbackFt: 3.0,
      rightSetbackFt: 3.0,
      source: `${authority || 'BBMP/BDA'} Bylaws Table 1 (Plot ≤ 1200 sq.ft)`,
    };
  }
  // Medium plot (1201 to 2400 sqft, e.g. 30×50, 40×60)
  if (plotArea <= 2400) {
    return {
      frontSetbackFt: 6.0,
      rearSetbackFt: 4.5,
      leftSetbackFt: 3.5,
      rightSetbackFt: 3.5,
      source: `${authority || 'BBMP/BDA'} Bylaws Table 2 (Plot 1200–2400 sq.ft)`,
    };
  }
  // Large plot (> 2400 sqft, e.g. 50×80, 60×90)
  return {
    frontSetbackFt: 9.0,
    rearSetbackFt: 6.0,
    leftSetbackFt: 5.0,
    rightSetbackFt: 5.0,
    source: `${authority || 'BBMP/BDA'} Bylaws Table 3 (Plot > 2400 sq.ft)`,
  };
}

export function calculateArea(input: EngineInput): AreaResult {
  const length = Math.max(0, input.plotLength || 0);
  const width = Math.max(0, input.plotWidth || 0);
  const floors = Math.max(0, input.floors || 0);

  // 1. PLOT AREA
  const plotAreaSqFt = length * width;

  // Parking footprint
  const sqFtPerCar = input.parkingType === 'Stilt Parking' || input.parkingType === 'Stilt' ? 180 : 120;
  const parkingAreaSqFt = Math.round((input.carCount || 0) * sqFtPerCar + ((input.bikeCount || 0) * 35));

  // Zero state check: unconfigured project
  if (plotAreaSqFt <= 0 || floors <= 0) {
    return {
      plotAreaSqFt: 0,
      plotLength: length,
      plotWidth: width,
      setbacks: { frontSetbackFt: 0, rearSetbackFt: 0, leftSetbackFt: 0, rightSetbackFt: 0, source: 'None' },
      buildableLengthFt: 0,
      buildableWidthFt: 0,
      buildableFootprintSqFt: 0,
      maxAllowableBUAPerFloorSqFt: 0,
      buaPerFloorSqFt: 0,
      buildableAreaSqFt: 0,
      remainingGroundAreaSqFt: 0,
      remainingGroundArea: 0,
      groundCoveragePercentage: 0,
      totalBUASqFt: 0,
      superBUASqFt: 0,
      parkingAreaSqFt: 0,
      terraceSqFt: 0,
      totalConstructedSqFt: 0,
      isWithinPermissibleLimit: true,
      requiresClientConfirmation: false,
    };
  }

  // 2. SETBACK GEOMETRY (PDF Section 5)
  // Use explicitly supplied setbacks if available, otherwise statutory authority rules
  const statutory = getStatutorySetbacks(length, width, input.authority);
  const frontSetback = typeof input.frontSetback === 'number' ? input.frontSetback : statutory.frontSetbackFt;
  const rearSetback  = typeof input.rearSetback  === 'number' ? input.rearSetback  : statutory.rearSetbackFt;
  const leftSetback  = typeof input.leftSetback  === 'number' ? input.leftSetback  : statutory.leftSetbackFt;
  const rightSetback = typeof input.rightSetback === 'number' ? input.rightSetback : statutory.rightSetbackFt;

  const setbacks: SetbackGeometry = {
    frontSetbackFt: frontSetback,
    rearSetbackFt: rearSetback,
    leftSetbackFt: leftSetback,
    rightSetbackFt: rightSetback,
    source: typeof input.frontSetback === 'number' ? 'User-supplied Site Setbacks' : statutory.source,
  };

  // 3. BUILDABLE LENGTH, WIDTH & FOOTPRINT
  const buildableLengthFt = Math.max(0, length - frontSetback - rearSetback);
  const buildableWidthFt  = Math.max(0, width - leftSetback - rightSetback);
  const buildableFootprintSqFt = Math.round(buildableLengthFt * buildableWidthFt);

  // Maximum permissible BUA per floor by statutory coverage
  const maxAllowableBUAPerFloorSqFt = Math.min(
    buildableFootprintSqFt,
    Math.round(plotAreaSqFt * COVERAGE_FACTOR)
  );

  // 4. USER-SELECTED BUILT-UP AREA PER FLOOR
  // Default to maximum allowable if user hasn't explicitly set a smaller BUA
  let buaPerFloorSqFt = 0;
  if (typeof input.builtUpAreaPerFloor === 'number' && input.builtUpAreaPerFloor > 0) {
    buaPerFloorSqFt = input.builtUpAreaPerFloor;
  } else {
    // Default to buildable footprint or standard 60% coverage
    buaPerFloorSqFt = maxAllowableBUAPerFloorSqFt > 0 ? maxAllowableBUAPerFloorSqFt : Math.round(plotAreaSqFt * COVERAGE_FACTOR);
  }

  // 5. VALIDATION & CLIENT CONFIRMATION
  const isWithinPermissibleLimit = buaPerFloorSqFt <= (buildableFootprintSqFt > 0 ? buildableFootprintSqFt : Math.round(plotAreaSqFt * COVERAGE_FACTOR));
  const requiresClientConfirmation = !isWithinPermissibleLimit;
  let confirmationMessage: string | undefined;
  if (!isWithinPermissibleLimit) {
    confirmationMessage = `Selected BUA per floor (${buaPerFloorSqFt} sq.ft) exceeds the buildable footprint (${buildableFootprintSqFt} sq.ft) calculated from setback rules. Client confirmation / setback relaxation required.`;
  }

  // 6. GROUND COVERAGE & REMAINING GROUND AREA
  const remainingGroundAreaSqFt = Math.max(0, plotAreaSqFt - buaPerFloorSqFt);
  const remainingGroundArea = remainingGroundAreaSqFt;
  const groundCoveragePercentage = plotAreaSqFt > 0 ? parseFloat(((buaPerFloorSqFt / plotAreaSqFt) * 100).toFixed(1)) : 0;

  // 7. TOTAL BUILT-UP AREA
  const totalBUASqFt = Math.round(buaPerFloorSqFt * floors);

  // 8. SUPER BUA (BUA + 15% common areas/walls/shaft)
  const superBUASqFt = Math.round(totalBUASqFt * SUPER_BUA_FACTOR);

  // 9. GROUND FOOTPRINT & TERRACE
  const buildableAreaSqFt = buaPerFloorSqFt;
  const terraceSqFt = buaPerFloorSqFt; // Top slab exposed area
  const totalConstructedSqFt = totalBUASqFt + parkingAreaSqFt + terraceSqFt;

  return {
    plotAreaSqFt,
    plotLength: length,
    plotWidth: width,
    setbacks,
    buildableLengthFt,
    buildableWidthFt,
    buildableFootprintSqFt,
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
