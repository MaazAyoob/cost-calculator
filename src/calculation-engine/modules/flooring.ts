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
  // Sum of all space floor areas with 7% cutting wastage
  const rawSpaceFloorArea = buildingModel.allSpaces.reduce((sum, s) => sum + s.flooringAreaSqFt, 0);
  // Ensure base BUA minus walls is well-covered
  const netLivableBUA = Math.max(rawSpaceFloorArea, Math.round(bua * 0.88));
  const floorTilesSqFt = Math.round(netLivableBUA * (1 + FLOORING_WASTAGE_PERCENTAGE / 100));

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
  const staircaseFlights = Math.max(0, floors - 1);
  const graniteSlabsSqFt = staircaseFlights * 180; // 180 sq.ft per flight

  // 4. Waterproofing (PDF Section 23)
  const bathroomWaterproofingSqFt = Math.round(
    bathroomSpaces.reduce((sum, s) => sum + s.waterproofingAreaSqFt, 0)
  );

  const terraceWaterproofingSqFt = Math.round(area.terraceSqFt * TERRACE_WATERPROOFING_FACTOR);
  const sumpWaterproofingSqFt = SUMP_WATERPROOFING_SQFT; // 120 sq.ft for underground sump

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
