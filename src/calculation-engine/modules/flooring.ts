// ============================================================
// FLOORING, WALL CLADDING & WATERPROOFING MODULE
// Strictly follows Hutty Pilot Specification (Section 15, 16, 23)
//
// Rules:
// - Flooring: Space-by-space flooring area + approved wastage
// - Bathroom Cladding: Bathroom perimeter × Selected Height (7ft / 10ft) − openings
// - Kitchen Cladding: Kitchen counter length × Selected Height (2ft / 4ft) − openings
// - Waterproofing: Bathroom floor + 1ft wall upturn, Terrace slab, Sump tank
// ============================================================

import { EngineInput, AreaResult, BuildingModel } from '../types';
import {
  FLOORING_WASTAGE_PERCENTAGE,
  TERRACE_WATERPROOFING_FACTOR,
  SUMP_WATERPROOFING_SQFT,
} from '../data/coefficients';
import { configResolver } from '../config/configurationResolver';
import { calculationMethodManager } from '../rules/methodRegistry';

export function calculateFlooring(
  input: EngineInput,
  area: AreaResult,
  buildingModel: BuildingModel
): {
  floorTilesSqFt: number;
  bathroomDadoTileSqFt: number;
  kitchenDadoTileSqFt: number;
  wallTilesSqFt: number;
  graniteSlabsSqFt: number;
  bathroomWaterproofingSqFt: number;
  terraceWaterproofingSqFt: number;
  sumpWaterproofingSqFt: number;
  waterproofingAreaSqFt: number;
} {
  const bua = area.totalBUASqFt || 0;
  const floors = Math.max(0, input.floors || 0);

  if (bua <= 0 || floors <= 0) {
    return {
      floorTilesSqFt: 0,
      bathroomDadoTileSqFt: 0,
      kitchenDadoTileSqFt: 0,
      wallTilesSqFt: 0,
      graniteSlabsSqFt: 0,
      bathroomWaterproofingSqFt: 0,
      terraceWaterproofingSqFt: 0,
      sumpWaterproofingSqFt: 0,
      waterproofingAreaSqFt: 0,
    };
  }

  // 1. Flooring Area (PDF Section 15)
  // Sum of all space floor areas plus circulation (passages, corridors, foyer) with cutting wastage
  const rawSpaceFloorArea = buildingModel.allSpaces.reduce((sum, s) => sum + s.flooringAreaSqFt, 0);
  const circulationPct = configResolver.resolveParameter('config.flooring.circulation_allowance_pct', undefined, 10);
  const circulationArea = Math.round(bua * (circulationPct / 100));
  const netLivableBUA = rawSpaceFloorArea + circulationArea;

  const activeMethod = calculationMethodManager.getMethod('flooring')?.activeMethodId || 'flooring_circulation_pct';
  const wastagePct = configResolver.resolveParameter(
    'config.wastage.flooring',
    undefined,
    configResolver.resolveParameter('flooring.tile_wastage_percent', undefined, FLOORING_WASTAGE_PERCENTAGE)
  );

  let floorTilesSqFt = 0;
  if (activeMethod === 'flooring_carpet_bua_ratio') {
    const carpetRatio = configResolver.resolveParameter('config.flooring.carpet_to_bua_ratio', undefined, 0.75);
    floorTilesSqFt = Math.round(bua * carpetRatio * (1 + wastagePct / 100));
  } else {
    floorTilesSqFt = Math.round(netLivableBUA * (1 + wastagePct / 100));
  }

  // 2. Wall Cladding / Dado Tiles (PDF Section 16)
  const bathroomSpaces = buildingModel.allSpaces.filter((s) => s.type === 'bathrooms' || s.type === 'commonToilets');
  const kitchenSpaces = buildingModel.allSpaces.filter((s) => s.type === 'kitchen');

  const bathroomDadoTileSqFt = Math.round(
    bathroomSpaces.reduce((sum, s) => sum + s.dadoTileAreaSqFt, 0)
  );

  const kitchenDadoTileSqFt = Math.round(
    kitchenSpaces.reduce((sum, s) => sum + s.dadoTileAreaSqFt, 0)
  );

  const wallTilesSqFt = bathroomDadoTileSqFt + kitchenDadoTileSqFt;

  // 3. Granite Slabs for Staircase Flights (PDF Section 15)
  const granitePerFlight = configResolver.resolveParameter('config.flooring.staircase_granite_sqft', undefined, 180);
  const staircaseFlights = Math.max(0, floors - 1);
  const graniteSlabsSqFt = staircaseFlights * granitePerFlight;

  // 4. Waterproofing (PDF Section 23)
  const bathroomWaterproofingSqFt = Math.round(
    bathroomSpaces.reduce((sum, s) => sum + s.waterproofingAreaSqFt, 0)
  );

  const terraceFactor = configResolver.resolveParameter('config.waterproofing.terrace_coverage_ratio', undefined, TERRACE_WATERPROOFING_FACTOR);
  const sumpSqFt = configResolver.resolveParameter('config.waterproofing.sump_surface_sqft', undefined, SUMP_WATERPROOFING_SQFT);
  const terraceWaterproofingSqFt = Math.round(area.terraceSqFt * terraceFactor);
  const sumpWaterproofingSqFt = sumpSqFt;

  const balconyWP = buildingModel.allSpaces
    .filter((s) => s.type === 'balcony' || s.type === 'utility')
    .reduce((sum, s) => sum + s.waterproofingAreaSqFt, 0);

  const waterproofingAreaSqFt = bathroomWaterproofingSqFt + terraceWaterproofingSqFt + sumpWaterproofingSqFt + Math.round(balconyWP);

  return {
    floorTilesSqFt,
    bathroomDadoTileSqFt,
    kitchenDadoTileSqFt,
    wallTilesSqFt,
    graniteSlabsSqFt,
    bathroomWaterproofingSqFt,
    terraceWaterproofingSqFt,
    sumpWaterproofingSqFt,
    waterproofingAreaSqFt,
  };
}
