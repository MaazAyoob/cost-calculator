// ============================================================
// COEFFICIENTS – Centralized Engineering & Planning Ratios
// Derived from CENTRALIZED_ENGINEERING_ASSUMPTIONS & Hutty Pilot Specification
// ============================================================

import { CENTRALIZED_ENGINEERING_ASSUMPTIONS } from './engineeringAssumptions';

const A = CENTRALIZED_ENGINEERING_ASSUMPTIONS;

/** Standard wall height (ft) consumed across all engines */
export const WALL_HEIGHT_FT = A.wallHeightFt.value;

/** Steel consumption formula parameters: 2.8 + [0.2 * (Floors - 1)] kg/sqft */
export const STEEL_BASE_FACTOR_KG_PER_SQFT = A.steelBaseFactor.value; // 2.8
export const STEEL_ADDITIONAL_FLOOR_FACTOR = A.steelAdditionalFloorFactor.value; // 0.2
export const STEEL_WASTAGE_PERCENTAGE = A.steelWastagePercentage.value; // 5%

/** Direct Material Starting Parameters (PDF Sections 8 - 11) */
export const CEMENT_BAGS_PER_SQFT = A.cementBagsPerSqFt.value; // 0.40 bags/sqft
export const M_SAND_CUFT_PER_SQFT = A.mSandCuFtPerSqFt.value; // 0.60 CFT/sqft
export const P_SAND_CUFT_PER_SQFT = A.pSandCuFtPerSqFt.value; // 0.60 CFT/sqft
export const COARSE_AGGREGATE_CUFT_PER_SQFT = A.coarseAggregateCuFtPerSqFt.value; // 1.35 CFT/sqft

/** Masonry & Block Parameters (PDF Section 12) */
export const EXTERNAL_WALL_THICKNESS_M = A.externalWallThicknessM.value; // 0.15m (6")
export const INTERNAL_WALL_THICKNESS_M = A.internalWallThicknessM.value; // 0.10m (4")
export const AAC_BLOCK_UNIT_VOLUME_CUM = A.aacBlockUnitVolumeCuM.value; // 0.018 m3
export const MASONRY_WASTAGE_PERCENTAGE = A.masonryWastagePercentage.value; // 5%

/** Flooring & Cladding Parameters (PDF Section 15, 16) */
export const FLOORING_WASTAGE_PERCENTAGE = A.flooringWastagePercentage.value; // 7%
export const BATHROOM_DADO_HEIGHT_STANDARD_FT = A.bathroomDadoHeightStandardFt.value; // 7 ft
export const BATHROOM_DADO_HEIGHT_FULL_FT = A.bathroomDadoHeightFullFt.value; // 10 ft
export const KITCHEN_DADO_HEIGHT_STANDARD_FT = A.kitchenDadoHeightStandardFt.value; // 2 ft
export const KITCHEN_DADO_HEIGHT_EXTENDED_FT = A.kitchenDadoHeightExtendedFt.value; // 4 ft
export const KITCHEN_COUNTER_LENGTH_FT = A.kitchenCounterLengthFt.value; // 15 ft

/** Waterproofing Parameters (PDF Section 23) */
export const BATHROOM_WATERPROOFING_UPTURN_FT = A.bathroomWaterproofingUpturnFt.value; // 1.0 ft
export const TERRACE_WATERPROOFING_FACTOR = A.terraceWaterproofingFactor.value; // 1.0
export const SUMP_WATERPROOFING_SQFT = A.sumpWaterproofingSqFt.value; // 120 sqft

/** Electrical & Plumbing Multipliers (PDF Section 19, 20) */
export const CONDUIT_M_PER_POINT = A.conduitMPerPoint.value; // 2.8 m/point
export const WIRE_M_PER_POINT = A.wireMPerPoint.value; // 5.5 m/point
export const CPVC_M_PER_POINT = A.cpvcMPerPoint.value; // 4.5 m/point
export const SWR_M_PER_POINT = A.swrMPerPoint.value; // 3.5 m/point
export const VERTICAL_RISER_ALLOWANCE_M = A.verticalRiserAllowanceM.value; // 12 m/floor

/** Water Demand & Tank Sizing (PDF Section 22) */
export const OCCUPANTS_PER_BEDROOM = A.occupantsPerBedroom.value; // 2
export const DAILY_WATER_DEMAND_LPCD = A.dailyWaterDemandLPCD.value; // 135 L
export const WATER_STORAGE_DAYS = A.waterStorageDays.value; // 1.5 days

/** Planning Footprint & Super BUA Factors */
export const COVERAGE_FACTOR = A.coverageFactor.value; // 0.60
export const SUPER_BUA_FACTOR = A.superBuaFactor.value; // 1.15

/** Commercial & Statutory Markups */
export const GST_RATE = A.gstRate.value; // 0.18
export const CONTRACTOR_MARGIN_RATE = A.contractorMarginRate.value; // 0.15
export const PROFESSIONAL_FEES_RATE = A.professionalFeesRate.value; // 0.05
export const CONTINGENCY_RATE = A.contingencyRate.value; // 0.06
