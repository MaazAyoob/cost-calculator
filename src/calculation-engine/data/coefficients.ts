// ============================================================
// COEFFICIENTS – Centralized Engineering & Planning Ratios
// Derived from CENTRALIZED_ENGINEERING_ASSUMPTIONS, IS 456:2000,
// NBC 2016, and Rightcon QS models.
// ============================================================

import { QualityTier } from '../../store/useWizardStore';
import { CENTRALIZED_ENGINEERING_ASSUMPTIONS } from './engineeringAssumptions';

const A = CENTRALIZED_ENGINEERING_ASSUMPTIONS;

/** Steel consumption: kg per sq ft of built-up area */
export const STEEL_KG_PER_SQFT: Record<QualityTier, number> = {
  Essential: A.steelKgPerSqFtEssential.value,
  Premium:   A.steelKgPerSqFtPremium.value,
  Luxury:    A.steelKgPerSqFtLuxury.value,
};

/** OPC 53 grade cement: bags (50 kg) per sq ft of BUA */
export const CEMENT_BAGS_PER_SQFT: Record<QualityTier, number> = {
  Essential: A.cementBagsPerSqFtEssential.value,
  Premium:   A.cementBagsPerSqFtPremium.value,
  Luxury:    A.cementBagsPerSqFtLuxury.value,
};

/** M25 Ready Mix Concrete: cubic metres per sq ft BUA (slab + column + beam) */
export const CONCRETE_CUM_PER_SQFT: Record<QualityTier, number> = {
  Essential: A.concreteCuMPerSqFtEssential.value,
  Premium:   A.concreteCuMPerSqFtPremium.value,
  Luxury:    A.concreteCuMPerSqFtLuxury.value,
};

/** Sand: cubic feet per sq ft BUA (plaster + masonry + flooring bed) */
export const SAND_CUFT_PER_SQFT: Record<QualityTier, number> = {
  Essential: A.sandCuFtPerSqFtEssential.value,
  Premium:   A.sandCuFtPerSqFtPremium.value,
  Luxury:    A.sandCuFtPerSqFtLuxury.value,
};

/** 20mm Metal Aggregate: cu ft per sq ft BUA */
export const AGGREGATE_CUFT_PER_SQFT: Record<QualityTier, number> = {
  Essential: A.aggregateCuFtPerSqFtEssential.value,
  Premium:   A.aggregateCuFtPerSqFtPremium.value,
  Luxury:    A.aggregateCuFtPerSqFtLuxury.value,
};

/** AAC block volume: cubic metres per sq ft BUA (wall volume approximation) */
export const AAC_CUM_PER_SQFT: Record<QualityTier, number> = {
  Essential: A.aacBlockCuMPerSqFtEssential.value,
  Premium:   A.aacBlockCuMPerSqFtPremium.value,
  Luxury:    A.aacBlockCuMPerSqFtLuxury.value,
};

/** Floor tile area factor: sq ft tiles per sq ft BUA (floor area + wastage) */
export const FLOOR_TILE_FACTOR: Record<QualityTier, number> = {
  Essential: 0.88, // 5% wastage
  Premium:   0.90, // 7% wastage
  Luxury:    0.93, // 10% wastage
};

/** Wall tile coverage: sq ft per bathroom (only wet areas) */
export const WALL_TILE_SQFT_PER_BATHROOM = A.wallTileSqFtPerBathroom.value;

/** Interior paint area: multiplier on BUA (walls + ceiling) */
export const INTERIOR_PAINT_FACTOR = A.interiorPaintFactor.value;

/** Exterior paint: multiplier on perimeter × height */
export const EXTERIOR_PAINT_FACTOR = A.exteriorPaintFactor.value;

/** Electrical wire: metres per sq ft BUA */
export const ELECTRICAL_WIRE_M_PER_SQFT: Record<QualityTier, number> = {
  Essential: 2.2,
  Premium:   2.8,
  Luxury:    3.5,
};

/** Conduit: metres per sq ft BUA */
export const CONDUIT_M_PER_SQFT: Record<QualityTier, number> = {
  Essential: 1.4,
  Premium:   1.8,
  Luxury:    2.2,
};

/** Lighting points: per sq ft BUA */
export const LIGHTING_POINTS_PER_SQFT = 0.035;

/** CPVC supply pipe: metres per sq ft BUA */
export const CPVC_M_PER_SQFT = 0.18;

/** SWR drain pipe: metres per sq ft BUA */
export const SWR_M_PER_SQFT = 0.12;

/** Waterproofing: sq ft of wet areas relative to bathrooms */
export const WATERPROOFING_SQFT_PER_BATHROOM = A.waterproofingSqFtPerBathroom.value;

/** Terrace waterproofing as % of plot area */
export const TERRACE_WATERPROOFING_FACTOR = 0.7;

/** Ground floor coverage factor (how much of plot is buildable footprint) */
export const COVERAGE_FACTOR = A.coverageFactor.value;

/** Usable area efficiency per floor (deduct walls, shafts etc.) */
export const FLOOR_EFFICIENCY = A.floorEfficiency.value;

/** Super BUA multiplier (includes common areas + wall thickness) */
export const SUPER_BUA_FACTOR = A.superBuaFactor.value;

/** Modular switch modules per sq ft BUA */
export const SWITCH_MODULES_PER_SQFT: Record<QualityTier, number> = {
  Essential: 0.06,
  Premium:   0.09,
  Luxury:    0.12,
};

/** Bathroom fixtures: sets per bathroom */
export const BATHROOM_FIXTURES_PER_BATH = 1;

/** Floor traps per bathroom */
export const FLOOR_TRAPS_PER_BATH = 2;

/** Granite slabs: sq ft per staircase floor (treads + risers + landing) */
export const GRANITE_PER_FLOOR = A.graniteSqFtPerFloor.value;
