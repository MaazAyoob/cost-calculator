# HUTTY ADMIN CONTROL COVERAGE MATRIX
**Phase 2D End-to-End Control Propagation & Verification Audit**
*Single Production Engine • Dynamic Parameter Resolution • PostgreSQL Persistence • Invariance & Snapshots Verified*

---

## 1. Executive Summary

This matrix establishes the authoritative status of every meaningful calculation parameter, geometric assumption, wastage percentage, unit rate, and rule across the Hutty platform.

**Status Legend:**
- **`FULLY_CONTROLLED`**: Connected end-to-end: Admin UI ⇄ REST API ⇄ PostgreSQL DB ⇄ ConfigurationResolver ⇄ Production Calculation Engine ⇄ BOQ ⇄ PDF/Report ⇄ Snapshot.
- **`PARTIALLY_CONTROLLED`**: Editable in Admin and active in resolver/engine, pending additional automated backend synchronization hooks or UI refinement.
- **`CONFLICT_REQUIRES_REVIEW`**: Active parameter where historical documentation or partner standards specify conflicting values; exposed in Admin for client review.
- **`CODE_CONTROLLED_CONSTANT`**: Explicitly documented architectural constant (e.g. unit conversions, IS standard densities, safety invariants).

---

## 2. Comprehensive Parameter Control Matrix

| Domain | Parameter | Config Key | Current Value | Unit | Source File | Admin Screen | Editable | DB Persisted | Versioned | Active Resolver | Calculator Consumer | Simulation Support | Impact Mapping | Snapshotted | Report/PDF Impact | Rollback | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Structure & Geometry** | Standard Wall Height | `config.structure.wall_height_ft` | 10.0 | ft | `engineeringAssumptions.ts` | Space & Rooms / Parameters | YES | YES | YES | YES | `spaceModel.ts` | YES | CRITICAL | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Structure & Geometry** | Ground Coverage Factor | `config.planning.default_coverage_ratio` | 0.60 | ratio | `engineeringAssumptions.ts` | Authority & BUA | YES | YES | YES | YES | `bua.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Structure & Geometry** | Super Built-Up Area Factor | `config.planning.super_bua_multiplier` | 1.15 | ratio | `engineeringAssumptions.ts` | Authority & BUA | YES | YES | YES | YES | `bua.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Master Bedroom Length | `space.room.master_bedroom.length_ft` | 16.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Master Bedroom Width | `space.room.master_bedroom.width_ft` | 14.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Standard Bedroom Length | `space.room.bedroom.length_ft` | 14.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Standard Bedroom Width | `space.room.bedroom.width_ft` | 10.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Living Room Length | `space.room.living.length_ft` | 16.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Living Room Width | `space.room.living.width_ft` | 12.5 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Dining Room Length | `space.room.dining.length_ft` | 12.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Dining Room Width | `space.room.dining.width_ft` | 10.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Kitchen Length | `space.room.kitchen.length_ft` | 10.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Kitchen Width | `space.room.kitchen.width_ft` | 9.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Bathroom Length | `space.room.bathroom.length_ft` | 6.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Bathroom Width | `space.room.bathroom.width_ft` | 5.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Common Toilet Length | `space.room.commonToilet.length_ft` | 5.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Common Toilet Width | `space.room.commonToilet.width_ft` | 4.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Balcony Length | `space.room.balcony.length_ft` | 10.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Balcony Width | `space.room.balcony.width_ft` | 5.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Utility Length | `space.room.utility.length_ft` | 8.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Utility Width | `space.room.utility.width_ft` | 5.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Pooja Room Length | `space.room.pooja.length_ft` | 5.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | LOW | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Pooja Room Width | `space.room.pooja.width_ft` | 5.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | LOW | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Home Office Length | `space.room.office.length_ft` | 10.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Home Office Width | `space.room.office.width_ft` | 10.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Store Room Length | `space.room.storeRoom.length_ft` | 7.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | LOW | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space & Rooms** | Store Room Width | `space.room.storeRoom.width_ft` | 5.0 | ft | `engineeringAssumptions.ts` | Space & Rooms | YES | YES | YES | YES | `spaceModel.ts` | YES | LOW | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space Rules** | Circulation Allowance | `config.flooring.circulation_allowance_pct` | 10.0 | % | `flooring.ts` | Space & Rooms | YES | YES | YES | YES | `flooring.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Space Rules** | Staircase Granite Allowance | `config.flooring.staircase_granite_sqft` | 180.0 | sqft/flight | `flooring.ts` | Space & Rooms / Flooring | YES | YES | YES | YES | `flooring.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Structure & RCC** | Steel Base Factor (Ground) | `config.rcc.steel_base_factor_kg_sqft` | 2.80 | kg/sqft | `coefficients.ts` | Structure & RCC | YES | YES | YES | YES | `steel.ts` | YES | CRITICAL | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Structure & RCC** | Steel Additional Floor Increment | `config.rcc.steel_additional_floor_factor` | 0.20 | kg/sqft/flr | `coefficients.ts` | Structure & RCC | YES | YES | YES | YES | `steel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Structure & RCC** | Steel Wastage Allowance | `config.wastage.steel` | 4.0 | % | `coefficients.ts` | Structure & RCC | YES | YES | YES | YES | `steel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Structure & RCC** | Cement Consumption Factor | `config.material.cement_bags_per_sqft` | 0.40 | bags/sqft | `coefficients.ts` | Structure & RCC | YES | YES | YES | YES | `cement.ts` | YES | CRITICAL | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Structure & RCC** | M-Sand Concrete Factor | `config.material.m_sand_cft_per_sqft` | 0.60 | CFT/sqft | `coefficients.ts` | Structure & RCC | YES | YES | YES | YES | `brick.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Structure & RCC** | P-Sand Plaster Factor | `config.material.p_sand_cft_per_sqft` | 0.60 | CFT/sqft | `coefficients.ts` | Structure & RCC | YES | YES | YES | YES | `brick.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Structure & RCC** | Coarse Aggregate Factor | `config.material.coarse_aggregate_cft_per_sqft` | 1.35 | CFT/sqft | `coefficients.ts` | Structure & RCC | YES | YES | YES | YES | `brick.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Masonry** | External Wall Thickness | `config.masonry.external_wall_thickness_m` | 0.15 | m | `coefficients.ts` | Masonry | YES | YES | YES | YES | `spaceModel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Masonry** | Internal Wall Thickness | `config.masonry.internal_wall_thickness_m` | 0.10 | m | `coefficients.ts` | Masonry | YES | YES | YES | YES | `spaceModel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Masonry** | AAC Block Volume | `config.masonry.aac_block_unit_volume_cum` | 0.018 | m3/unit | `coefficients.ts` | Masonry | YES | YES | YES | YES | `brick.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Masonry** | Masonry Cutting Wastage | `config.wastage.masonry` | 5.0 | % | `coefficients.ts` | Masonry | YES | YES | YES | YES | `spaceModel.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Flooring** | Flooring Tile Wastage | `config.wastage.flooring` | 7.0 | % | `coefficients.ts` | Flooring & Finishes | YES | YES | YES | YES | `flooring.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Flooring** | Bathroom Dado Standard Height | `config.cladding.bathroom_dado_standard_ft` | 7.0 | ft | `coefficients.ts` | Space & Rooms / Finishes | YES | YES | YES | YES | `spaceModel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Flooring** | Bathroom Dado Full Height | `config.cladding.bathroom_dado_full_ft` | 10.0 | ft | `coefficients.ts` | Space & Rooms / Finishes | YES | YES | YES | YES | `spaceModel.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Paint & Finishes** | Interior Paint Coverage | `config.paint.interior_coverage_sqft_per_litre` | 45.0 | sqft/L | `coefficients.ts` | Paint | YES | YES | YES | YES | `paint.ts` | YES | HIGH | YES | YES | YES | **`CONFLICT_REQUIRES_REVIEW`** (45 vs 60) |
| **Paint & Finishes** | Exterior Paint Coverage | `config.paint.exterior_coverage_sqft_per_litre` | 60.0 | sqft/L | `coefficients.ts` | Paint | YES | YES | YES | YES | `paint.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Paint & Finishes** | Putty Consumption Factor | `config.paint.putty_kg_per_sqft` | 0.55 | kg/sqft | `paint.ts` | Paint | YES | YES | YES | YES | `paint.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Waterproofing** | Bathroom Upturn Height | `config.waterproofing.bathroom_upturn_ft` | 1.0 | ft | `coefficients.ts` | Waterproofing | YES | YES | YES | YES | `spaceModel.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Waterproofing** | Terrace Coverage Factor | `config.waterproofing.terrace_coverage_ratio` | 1.0 | ratio | `coefficients.ts` | Waterproofing | YES | YES | YES | YES | `flooring.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Waterproofing** | Sump Surface Area | `config.waterproofing.sump_surface_sqft` | 120.0 | sqft | `coefficients.ts` | Waterproofing | YES | YES | YES | YES | `flooring.ts` | YES | LOW | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Plumbing** | CPVC Supply Length per Point | `config.plumbing.cpvc_m_per_point` | 4.5 | m/point | `coefficients.ts` | Plumbing | YES | YES | YES | YES | `plumbing.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Plumbing** | SWR Drainage Length per Point | `config.plumbing.swr_m_per_point` | 3.5 | m/point | `coefficients.ts` | Plumbing | YES | YES | YES | YES | `plumbing.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Plumbing** | Plumbing Shaft Riser Allowance | `config.plumbing.riser_m_per_floor` | 12.0 | m/floor | `coefficients.ts` | Plumbing | YES | YES | YES | YES | `plumbing.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Plumbing** | Occupants per Bedroom | `config.plumbing.occupants_per_bedroom` | 2.0 | persons | `coefficients.ts` | Plumbing | YES | YES | YES | YES | `plumbing.ts` | YES | LOW | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Plumbing** | Daily Water Demand | `config.plumbing.daily_water_demand_lpcd` | 135.0 | LPCD | `coefficients.ts` | Plumbing | YES | YES | YES | YES | `plumbing.ts` | YES | LOW | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Plumbing** | Storage Reserve Days | `config.plumbing.water_storage_reserve_days` | 1.5 | days | `coefficients.ts` | Plumbing | YES | YES | YES | YES | `plumbing.ts` | YES | LOW | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Electrical** | Wire 1.5 sq.mm Length per Point | `config.electrical.wire_1_5_m_per_point` | 8.5 | m/point | `electrical.ts` | Electrical | YES | YES | YES | YES | `electrical.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Electrical** | Wire 2.5 sq.mm Length per Point | `config.electrical.wire_2_5_m_per_point` | 12.5 | m/point | `electrical.ts` | Electrical | YES | YES | YES | YES | `electrical.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Electrical** | Wire 4.0 sq.mm Length per Heavy Point | `config.electrical.wire_4_0_m_per_point` | 22.0 | m/point | `electrical.ts` | Electrical | YES | YES | YES | YES | `electrical.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Electrical** | Conduit Route Length per Point | `config.electrical.conduit_m_per_point` | 2.6 | m/point | `electrical.ts` | Electrical | YES | YES | YES | YES | `electrical.ts` | YES | MEDIUM | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Electrical** | Switch Module Ratio | `config.electrical.switch_module_ratio` | 0.75 | ratio | `electrical.ts` | Electrical | YES | YES | YES | YES | `electrical.ts` | YES | LOW | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Commercial** | Contractor Execution Margin | `config.commercial.contractor_margin` | 0.10 | rate (10%) | `coefficients.ts` | Commercial | YES | YES | YES | YES | `budget.ts` | YES | CRITICAL | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Commercial** | Contingency Reserve | `config.commercial.contingency` | 0.00 | rate | `coefficients.ts` | Commercial | YES | YES | YES | YES | `budget.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Commercial** | Professional Architecture & Eng Fees | `config.commercial.professional_fees` | 0.00 | rate | `coefficients.ts` | Commercial | YES | YES | YES | YES | `budget.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Commercial** | Works Contract GST | `config.commercial.gst_rate` | 0.18 | rate (18%) | `coefficients.ts` | Commercial | YES | YES | YES | YES | `budget.ts` | YES | CRITICAL | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Rate Master** | Authoritative Material Unit Prices | `rateService.getEffectiveRate` | Dynamic | ₹/unit | `rateMasterDefaults.ts` | Rate Master | YES | YES | YES | YES | `materials.ts`, `boq.ts` | YES | CRITICAL | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Labour** | Composite & Trade Rates | `labour.rate.*` | Dynamic | ₹/sqft / ₹/day | `labour.ts` | Labour | YES | YES | YES | YES | `labour.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Method Selection**| Structural Steel Method | `method.steel.activeMethodId` | `steel_floorwise` | id | `methodRegistry.ts` | Calculation Engine | YES | YES | YES | YES | `steel.ts` | YES | CRITICAL | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Method Selection**| Paint Consumable Method | `method.paint.activeMethodId` | `paint_surface_area` | id | `methodRegistry.ts` | Calculation Engine | YES | YES | YES | YES | `paint.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |
| **Method Selection**| Flooring Tile Area Method | `method.flooring.activeMethodId` | `flooring_circulation_pct` | id | `methodRegistry.ts` | Calculation Engine | YES | YES | YES | YES | `flooring.ts` | YES | HIGH | YES | YES | YES | **`FULLY_CONTROLLED`** |

---

## 3. Summary Statistics

- **Total Assessed Parameters**: 68
- **Fully Controlled**: 67 (98.5%)
- **Conflicts Requiring Review**: 1 (`config.paint.interior_coverage_sqft_per_litre`: 45 vs 60 sqft/L)
- **Hardcoded Business Parameters**: 0 (all meaningful calculation assumptions resolved via `configResolver` or `rateService`)
- **Arbitrary Code Execution**: ZERO (100% Code-Free AST Evaluation)
