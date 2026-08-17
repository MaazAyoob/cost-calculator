// ============================================================
// FLOORING & CLADDING MODULE
// Computes floor finish areas, bathroom dado tile cladding,
// kitchen splashback tiles, staircase granite, and wet area waterproofing.
// ============================================================

import { EngineInput, AreaResult } from '../types';
import {
  FLOOR_TILE_FACTOR,
  WALL_TILE_SQFT_PER_BATHROOM_STANDARD,
  WALL_TILE_SQFT_PER_BATHROOM_FULL_HEIGHT,
  KITCHEN_DADO_SQFT_STANDARD,
  KITCHEN_DADO_SQFT_EXTENDED,
  WATERPROOFING_SQFT_PER_BATHROOM,
  WATERPROOFING_BALCONY_SQFT,
  TERRACE_WATERPROOFING_FACTOR,
  GRANITE_PER_FLOOR,
} from '../data/coefficients';

export function calculateFlooring(input: EngineInput, area: AreaResult): {
  floorTilesSqFt: number;
  wallTilesSqFt: number;
  graniteSlabsSqFt: number;
  waterproofingAreaSqFt: number;
} {
  const { qualityTier, rooms, floors, wallCladding } = input;
  const bua = area.totalBUASqFt;
  const tier = qualityTier || 'Premium';

  // 1. Floor tiles: full BUA minus structural wall thickness + tile wastage
  const floorTilesSqFt = Math.round(bua * (FLOOR_TILE_FACTOR[tier] ?? 0.90));

  // 2. Bathroom wall dado tiles: driven by bathroom count & selected tile height
  const isFullHeightBath = wallCladding?.bathroomTileHeight === 'Full Height (Ceiling)';
  const bathTilePerUnit = isFullHeightBath
    ? WALL_TILE_SQFT_PER_BATHROOM_FULL_HEIGHT
    : WALL_TILE_SQFT_PER_BATHROOM_STANDARD;

  const totalBaths = (rooms.bathrooms || 0) + (rooms.commonToilets || 0);
  const bathroomWalls = totalBaths * bathTilePerUnit;

  // 3. Kitchen splashback / dado: 2 ft standard vs 4 ft extended
  const isExtendedKitchenDado = wallCladding?.kitchenDadoHeight === '4 ft';
  const kitchenTilePerUnit = isExtendedKitchenDado
    ? KITCHEN_DADO_SQFT_EXTENDED
    : KITCHEN_DADO_SQFT_STANDARD;

  const kitchenSplashback = (rooms.kitchen || 0) * kitchenTilePerUnit;
  const wallTilesSqFt = Math.round(bathroomWalls + kitchenSplashback);

  // 4. Granite slabs for staircase steps & landings (per floor transition)
  const staircaseFlights = Math.max(0, (floors || 1) - 1);
  const graniteSlabsSqFt = Math.round(staircaseFlights * GRANITE_PER_FLOOR);

  // 5. Waterproofing for wet areas (bathrooms + balconies + terrace slab)
  const bathroomWP = totalBaths * WATERPROOFING_SQFT_PER_BATHROOM;
  const balconyWP  = (rooms.balcony || 0) * WATERPROOFING_BALCONY_SQFT;
  const terraceWP  = Math.round(area.terraceSqFt * TERRACE_WATERPROOFING_FACTOR);
  const waterproofingAreaSqFt = bathroomWP + balconyWP + terraceWP;

  return { floorTilesSqFt, wallTilesSqFt, graniteSlabsSqFt, waterproofingAreaSqFt };
}
