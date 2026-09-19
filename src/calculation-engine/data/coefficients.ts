// ============================================================
// COEFFICIENTS – Centralized Typed Configuration Adapter
// Upgraded in Phase 2B: Connects engine modules to the active
// versioned ConfigurationResolver while maintaining 100%
// backward compatibility with existing calculation modules.
// ============================================================

import { configResolver, ConfigurationResolutionContext } from '../config';
import { CENTRALIZED_ENGINEERING_ASSUMPTIONS } from './engineeringAssumptions';

const A = CENTRALIZED_ENGINEERING_ASSUMPTIONS;

/**
 * Dynamic parameter resolver helper with location & tier context
 */
export function getEngineParameter<T = number>(
  key: string,
  fallback: T,
  context?: ConfigurationResolutionContext
): T {
  return configResolver.resolveParameter<T>(key, context, fallback);
}

// ── Backward-Compatible Baseline Exports ──

/** Standard wall height (ft) consumed across all engines */
export const WALL_HEIGHT_FT = configResolver.resolveParameter('config.structure.wall_height_ft', undefined, A.wallHeightFt.value);

/** Steel consumption formula parameters: 2.8 + [0.2 * (Floors - 1)] kg/sqft */
export const STEEL_BASE_FACTOR_KG_PER_SQFT = configResolver.resolveParameter('config.rcc.steel_base_factor_kg_sqft', undefined, A.steelBaseFactor.value);
export const STEEL_ADDITIONAL_FLOOR_FACTOR = configResolver.resolveParameter('config.rcc.steel_additional_floor_factor', undefined, A.steelAdditionalFloorFactor.value);
export const STEEL_WASTAGE_PERCENTAGE = configResolver.resolveParameter('config.wastage.steel', undefined, A.steelWastagePercentage.value);

/** Direct Material Starting Parameters (PDF Sections 8 - 11) */
export const CEMENT_BAGS_PER_SQFT = configResolver.resolveParameter('config.material.cement_bags_per_sqft', undefined, A.cementBagsPerSqFt.value);
export const M_SAND_CUFT_PER_SQFT = configResolver.resolveParameter('config.material.m_sand_cft_per_sqft', undefined, A.mSandCuFtPerSqFt.value);
export const P_SAND_CUFT_PER_SQFT = configResolver.resolveParameter('config.material.p_sand_cft_per_sqft', undefined, A.pSandCuFtPerSqFt.value);
export const COARSE_AGGREGATE_CUFT_PER_SQFT = configResolver.resolveParameter('config.material.coarse_aggregate_cft_per_sqft', undefined, A.coarseAggregateCuFtPerSqFt.value);

/** Masonry & Block Parameters (PDF Section 12) */
export const EXTERNAL_WALL_THICKNESS_M = configResolver.resolveParameter('config.masonry.external_wall_thickness_m', undefined, A.externalWallThicknessM.value);
export const INTERNAL_WALL_THICKNESS_M = configResolver.resolveParameter('config.masonry.internal_wall_thickness_m', undefined, A.internalWallThicknessM.value);
export const AAC_BLOCK_UNIT_VOLUME_CUM = configResolver.resolveParameter('config.masonry.aac_block_unit_volume_cum', undefined, A.aacBlockUnitVolumeCuM.value);
export const MASONRY_WASTAGE_PERCENTAGE = configResolver.resolveParameter('config.wastage.masonry', undefined, A.masonryWastagePercentage.value);

/** Flooring & Cladding Parameters (PDF Section 15, 16) */
export const FLOORING_WASTAGE_PERCENTAGE = configResolver.resolveParameter('config.wastage.flooring', undefined, A.flooringWastagePercentage.value);
export const BATHROOM_DADO_HEIGHT_STANDARD_FT = configResolver.resolveParameter('config.cladding.bathroom_dado_standard_ft', undefined, A.bathroomDadoHeightStandardFt.value);
export const BATHROOM_DADO_HEIGHT_FULL_FT = configResolver.resolveParameter('config.cladding.bathroom_dado_full_ft', undefined, A.bathroomDadoHeightFullFt.value);
export const KITCHEN_DADO_HEIGHT_STANDARD_FT = configResolver.resolveParameter('config.cladding.kitchen_dado_standard_ft', undefined, A.kitchenDadoHeightStandardFt.value);
export const KITCHEN_DADO_HEIGHT_EXTENDED_FT = configResolver.resolveParameter('config.cladding.kitchen_dado_extended_ft', undefined, A.kitchenDadoHeightExtendedFt.value);
export const KITCHEN_COUNTER_LENGTH_FT = configResolver.resolveParameter('config.cladding.kitchen_counter_length_ft', undefined, A.kitchenCounterLengthFt.value);

/** Waterproofing Parameters (PDF Section 23) */
export const BATHROOM_WATERPROOFING_UPTURN_FT = configResolver.resolveParameter('config.waterproofing.bathroom_upturn_ft', undefined, A.bathroomWaterproofingUpturnFt.value);
export const TERRACE_WATERPROOFING_FACTOR = configResolver.resolveParameter('config.waterproofing.terrace_coverage_ratio', undefined, A.terraceWaterproofingFactor.value);
export const SUMP_WATERPROOFING_SQFT = configResolver.resolveParameter('config.waterproofing.sump_surface_sqft', undefined, A.sumpWaterproofingSqFt.value);

/** Electrical & Plumbing Multipliers (PDF Section 19, 20) */
export const CONDUIT_M_PER_POINT = configResolver.resolveParameter('config.electrical.conduit_m_per_point', undefined, A.conduitMPerPoint.value);
export const WIRE_M_PER_POINT = configResolver.resolveParameter('config.electrical.wire_m_per_point', undefined, A.wireMPerPoint.value);
export const CPVC_M_PER_POINT = configResolver.resolveParameter('config.plumbing.cpvc_m_per_point', undefined, A.cpvcMPerPoint.value);
export const SWR_M_PER_POINT = configResolver.resolveParameter('config.plumbing.swr_m_per_point', undefined, A.swrMPerPoint.value);
export const VERTICAL_RISER_ALLOWANCE_M = configResolver.resolveParameter('config.plumbing.riser_m_per_floor', undefined, A.verticalRiserAllowanceM.value);

/** Water Demand & Tank Sizing (PDF Section 22) */
export const OCCUPANTS_PER_BEDROOM = configResolver.resolveParameter('config.plumbing.occupants_per_bedroom', undefined, A.occupantsPerBedroom.value);
export const DAILY_WATER_DEMAND_LPCD = configResolver.resolveParameter('config.plumbing.daily_water_demand_lpcd', undefined, A.dailyWaterDemandLPCD.value);
export const WATER_STORAGE_DAYS = configResolver.resolveParameter('config.plumbing.water_storage_reserve_days', undefined, A.waterStorageDays.value);

/** Planning Footprint & Super BUA Factors */
export const COVERAGE_FACTOR = configResolver.resolveParameter('config.planning.default_coverage_ratio', undefined, A.coverageFactor.value);
export const SUPER_BUA_FACTOR = configResolver.resolveParameter('config.planning.super_bua_multiplier', undefined, A.superBuaFactor.value);

/** Commercial & Statutory Markups */
export const GST_RATE = configResolver.resolveParameter('config.commercial.gst_rate', undefined, A.gstRate.value);
export const CONTRACTOR_MARGIN_RATE = configResolver.resolveParameter('config.commercial.contractor_margin', undefined, A.contractorMarginRate.value);
export const PROFESSIONAL_FEES_RATE = configResolver.resolveParameter('config.commercial.professional_fees', undefined, A.professionalFeesRate.value);
export const CONTINGENCY_RATE = configResolver.resolveParameter('config.commercial.contingency', undefined, A.contingencyRate.value);
