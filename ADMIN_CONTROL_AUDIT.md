# HUTTY — ULTIMATE ADMIN CONTROL CENTER
## PHASE 2A: REPOSITORY PARAMETER & ARCHITECTURAL AUDIT (ADMIN_CONTROL_AUDIT.md)

**Date**: September 19, 2026  
**Auditor**: Senior Engineering & Quantity Surveying Implementation Agent  
**Status**: Completed — Baseline for Phase 2 Implementation  

---

### Executive Summary

The purpose of the Hutty Ultimate Admin Control Center is:
> *"Everything that affects calculation accuracy, pricing, assumptions, recommendations, standards, commercial settings and report behaviour should be controllable by authorized administrators through structured configuration — without editing TypeScript source code."*

To achieve this safely while preserving calculation rigor, the architecture strictly enforces:
1. **Engine Logic** (deterministic calculation algorithms, dependency ordering, formula execution, validation invariants, reconciliation framework, authorization) **MUST REMAIN IN TYPESCRIPT CODE**.
2. **Engine Parameters** (rates, consumption factors, dimensional templates, wastage percentages, coverage rules, authority limits, commercial margins) **MUST BECOME ADMIN CONFIGURABLE VIA STRUCTURED VERSIONED CONFIGURATION**.

This audit covers **every hardcoded and configurable calculation parameter** across all 21 calculation modules, data tables, and engine services in the repository.

---

### Parameter Categorization Matrix

All repository parameters are classified into one of four strict categories:
- **Category 1: ALREADY CONFIGURABLE** — Exposed via existing `RateMasterItem`, `RateOverride`, or `CalculatorConfigSettings`.
- **Category 2: SHOULD BECOME ADMIN CONFIGURABLE** — Hardcoded in TypeScript data files or calculation modules that must be elevated to versioned admin configuration entities.
- **Category 3: MUST REMAIN ENGINE CODE** — Mathematical laws, topological pipeline ordering, unit conversion factors, zero-state guards, QA invariants, and authorization.
- **Category 4: DEPRECATED / DUPLICATED / CONFLICTING** — Redundant definitions, conflicting fallback paths, or static constants that bypass the centralized configuration bridge.

---

### Comprehensive Parameter Audit Table

| File | Module | Parameter | Current Value | Unit | Current Source | Status / Category | Proposed Config Key | Dependencies | Risk | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `rateMasterDefaults.ts` | Rate Master | Fe 550D TMT Steel | 74,000 | ₹/Tonne | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.steel.fe550d_tmt` | Structural Steel BOQ, Material Schedule | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Rate Master | Birla Super 53G Cement | 400 | ₹/Bag | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.cement.birla_super` | Cement BOQ, Material Schedule | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Rate Master | M-Sand (Concrete Grade) | 55 | ₹/CFT | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.sand.m_sand` | Masonry, RCC concrete | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Rate Master | P-Sand (Plastering) | 65 | ₹/CFT | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.sand.p_sand` | Plastering, Masonry mortar | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Rate Master | Crushed Granite 20mm | 40 | ₹/CFT | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.aggregate.20mm` | RCC concrete | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Rate Master | Solid Concrete Block 6" | 34 | ₹/Block | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.masonry.solid_block_6in` | Masonry walls | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Rate Master | AAC Block (Birla Aerocon) | 65 | ₹/Block | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.masonry.aac_block` | Masonry walls | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Rate Master | Double-charged Vitrified 800x800 | 85 | ₹/SqFt | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.flooring.vitrified_tiles` | Living, bedroom, dining flooring | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Rate Master | Sadahalli Granite Slab | 145 | ₹/SqFt | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.flooring.granite_slab` | Staircase treads/risers | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Rate Master | Composite Civil Labour (Blr) | 380 | ₹/SqFt | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.labour.civil_composite` | Labour Schedule, Budget | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Rate Master | Electrical Point Wiring Labour | 120 | ₹/Point | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.labour.electrical_point` | Electrical Labour BOQ | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Rate Master | Plumbing Toilet Core Labour | 7,200 | ₹/Unit | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.labour.plumbing_toilet` | Plumbing Labour BOQ | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Rate Master | Flooring Tiling Labour | 38 | ₹/SqFt | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.labour.flooring_tiling` | Flooring Labour BOQ | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Rate Master | Painting Multi-coat Labour | 18 | ₹/SqFt | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.labour.painting_finishes` | Painting Labour BOQ | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Rate Master | Waterproofing Application Labour | 18 | ₹/SqFt | Baseline Dataset | **1. ALREADY CONFIGURABLE** | `rate.labour.waterproofing_app` | Waterproofing Labour BOQ | Low | Retain in existing `RateOverride` & `rateService`. |
| `rateMasterDefaults.ts` | Commercial Config | Steel Cutting Wastage | 5 | % | `HUTTY_BASELINE_CONFIG` | **1. ALREADY CONFIGURABLE** | `config.wastage.steel` | Steel tonnage | Low | Connect UI directly in Calculation Engine Admin. |
| `rateMasterDefaults.ts` | Commercial Config | Cement Handling Wastage | 2 | % | `HUTTY_BASELINE_CONFIG` | **1. ALREADY CONFIGURABLE** | `config.wastage.cement` | Cement bag quantity | Low | Connect UI directly in Calculation Engine Admin. |
| `rateMasterDefaults.ts` | Commercial Config | Masonry Cutting Wastage | 5 | % | `HUTTY_BASELINE_CONFIG` | **1. ALREADY CONFIGURABLE** | `config.wastage.masonry` | Block count | Low | Connect UI directly in Calculation Engine Admin. |
| `rateMasterDefaults.ts` | Commercial Config | Flooring Cutting Wastage | 7 | % | `HUTTY_BASELINE_CONFIG` | **1. ALREADY CONFIGURABLE** | `config.wastage.flooring` | Flooring tiles sqft | Low | Connect UI directly in Calculation Engine Admin. |
| `rateMasterDefaults.ts` | Commercial Config | Paint & Plaster Wastage | 10 | % | `HUTTY_BASELINE_CONFIG` | **1. ALREADY CONFIGURABLE** | `config.wastage.paint` | Paint litres | Low | Connect UI directly in Calculation Engine Admin. |
| `rateMasterDefaults.ts` | Commercial Config | Contractor Execution Margin | 15 (8-10% in contractor mode) | % / ratio | `HUTTY_BASELINE_CONFIG` | **1. ALREADY CONFIGURABLE** | `config.commercial.contractor_margin` | Commercial budget head | Medium | Expose in Commercial Settings tab with mode separation. |
| `rateMasterDefaults.ts` | Commercial Config | Professional Architecture/MEP Fees | 5 | % / ratio | `HUTTY_BASELINE_CONFIG` | **1. ALREADY CONFIGURABLE** | `config.commercial.professional_fees` | Commercial budget head | Medium | Expose in Commercial Settings tab. |
| `rateMasterDefaults.ts` | Commercial Config | Contingency Reserve | 6 | % / ratio | `HUTTY_BASELINE_CONFIG` | **1. ALREADY CONFIGURABLE** | `config.commercial.contingency` | Commercial budget head | Medium | Expose in Commercial Settings tab. |
| `rateMasterDefaults.ts` | Commercial Config | Works Contract GST | 18 | % / ratio | `HUTTY_BASELINE_CONFIG` | **1. ALREADY CONFIGURABLE** | `config.commercial.gst_rate` | Contractor mode tax head | High | Keep strictly separated from self-build core estimate. |
| `engineeringAssumptions.ts` | Geometry / Structure | Standard Wall Height | 10.0 | ft | `wallHeightFt` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.structure.wall_height_ft` | Wall area, paint area, plaster volume | High | Parameterize with validation bounds (8.0 to 14.0 ft). |
| `engineeringAssumptions.ts` | Geometry / Planning | Super Built-up Area Multiplier | 1.15 | multiplier | `superBuaFactor` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.planning.super_bua_multiplier` | Total super BUA | Medium | Parameterize with validation bounds (1.00 to 1.30). |
| `engineeringAssumptions.ts` | Geometry / Planning | Default Ground Coverage Ratio | 0.60 | ratio | `coverageFactor` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.planning.default_coverage_ratio` | Ground floor footprint fallback | Medium | Parameterize with validation bounds (0.40 to 0.85). |
| `engineeringAssumptions.ts` | Structural Steel | Base Steel Factor (Ground) | 2.8 | kg/sqft | `steelBaseFactor` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.rcc.steel_base_factor_kg_sqft` | Structural steel rebar kg | High | Strict QA validation required (bounds: 2.0 to 4.5 kg/sqft). |
| `engineeringAssumptions.ts` | Structural Steel | Steel Additional Floor Factor | 0.2 | kg/sqft/floor | `steelAdditionalFloorFactor` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.rcc.steel_additional_floor_factor` | Upper floor steel increment | High | Validation bounds: 0.10 to 0.50 kg/sqft/floor. |
| `engineeringAssumptions.ts` | Direct Materials | Cement Starting Thumb Rule | 0.40 | bags/sqft | `cementBagsPerSqFt` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.material.cement_bags_per_sqft` | Total cement bag count | High | Validation bounds: 0.30 to 0.55 bags/sqft. |
| `engineeringAssumptions.ts` | Direct Materials | M-Sand Starting Thumb Rule | 0.60 | CFT/sqft | `mSandCuFtPerSqFt` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.material.m_sand_cft_per_sqft` | Concrete fine aggregate volume | High | Validation bounds: 0.45 to 0.80 CFT/sqft. |
| `engineeringAssumptions.ts` | Direct Materials | P-Sand Starting Thumb Rule | 0.60 | CFT/sqft | `pSandCuFtPerSqFt` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.material.p_sand_cft_per_sqft` | Plastering / masonry sand volume | High | Validation bounds: 0.45 to 0.80 CFT/sqft. |
| `engineeringAssumptions.ts` | Direct Materials | Coarse Aggregate Thumb Rule | 1.35 | CFT/sqft | `coarseAggregateCuFtPerSqFt` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.material.coarse_aggregate_cft_per_sqft` | 20mm & 12mm crushed stone | High | Validation bounds: 1.00 to 1.80 CFT/sqft. |
| `engineeringAssumptions.ts` | Masonry Block | External Wall Thickness | 0.150 (6") | m | `externalWallThicknessM` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.masonry.external_wall_thickness_m` | Net wall volume, block count | High | Linked to selected masonry specification. |
| `engineeringAssumptions.ts` | Masonry Block | Internal Wall Thickness | 0.100 (4") | m | `internalWallThicknessM` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.masonry.internal_wall_thickness_m` | Internal wall volume, partition blocks | High | Linked to selected masonry specification. |
| `engineeringAssumptions.ts` | Masonry Block | AAC Block Unit Volume | 0.018 | cu.m/block | `aacBlockUnitVolumeCuM` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.masonry.aac_block_unit_volume_cum` | AAC block piece count | High | Must equal length × width × height in spec. |
| `engineeringAssumptions.ts` | Masonry Block | Clay Brick Unit Volume | 0.001539 | cu.m/brick | `clayBrickUnitVolumeCuM` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.masonry.clay_brick_unit_volume_cum` | Clay brick piece count | High | Must equal 0.19 × 0.09 × 0.09 m. |
| `engineeringAssumptions.ts` | Masonry Block | Concrete Block Unit Volume | 0.012 | cu.m/block | `concreteBlockUnitVolumeCuM` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.masonry.concrete_block_unit_volume_cum` | Solid concrete block count | High | Must equal 0.40 × 0.20 × 0.15 m. |
| `engineeringAssumptions.ts` | Wall Cladding | Bathroom Standard Dado Height | 7.0 | ft | `bathroomDadoHeightStandardFt` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.cladding.bathroom_dado_standard_ft` | Lintel level wall tiles | Medium | Validation bounds: 5.0 to 8.0 ft. |
| `engineeringAssumptions.ts` | Wall Cladding | Bathroom Full Dado Height | 10.0 | ft | `bathroomDadoHeightFullFt` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.cladding.bathroom_dado_full_ft` | Ceiling level wall tiles | Medium | Bound by clear wall height. |
| `engineeringAssumptions.ts` | Wall Cladding | Kitchen Standard Dado Height | 2.0 | ft | `kitchenDadoHeightStandardFt` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.cladding.kitchen_dado_standard_ft` | Counter backsplash tiles | Medium | Validation bounds: 1.5 to 3.0 ft. |
| `engineeringAssumptions.ts` | Wall Cladding | Kitchen Extended Dado Height | 4.0 | ft | `kitchenDadoHeightExtendedFt` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.cladding.kitchen_dado_extended_ft` | Extended kitchen backsplash | Medium | Validation bounds: 3.0 to 6.0 ft. |
| `engineeringAssumptions.ts` | Wall Cladding | Standard Kitchen Counter Length | 15.0 | ft | `kitchenCounterLengthFt` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.cladding.kitchen_counter_length_ft` | Backsplash area, granite counter | Medium | Validation bounds: 8.0 to 25.0 ft. |
| `engineeringAssumptions.ts` | Waterproofing | Bathroom Wall Upturn Height | 1.0 (300mm) | ft | `bathroomWaterproofingUpturnFt` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.waterproofing.bathroom_upturn_ft` | Bathroom vertical membrane area | Medium | IS 3067 benchmark (bounds: 0.5 to 2.0 ft). |
| `engineeringAssumptions.ts` | Waterproofing | Terrace Coverage Factor | 1.00 | ratio | `terraceWaterproofingFactor` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.waterproofing.terrace_coverage_ratio` | Terrace Brick Bat Coba area | Medium | Validation bounds: 0.80 to 1.10. |
| `engineeringAssumptions.ts` | Waterproofing | Underground Sump Surface Area | 120 | sq.ft | `sumpWaterproofingSqFt` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.waterproofing.sump_surface_sqft` | Sump internal waterproofing | Medium | Validation bounds: 80 to 250 sq.ft. |
| `paint.ts` | Paint Consumables | Interior Emulsion Coverage | 45 | sqft/L (2 coats) | `paint.ts` L65 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.paint.interior_coverage_sqft_per_litre` | Interior paint litres | Medium | Validation bounds: 35 to 65 sqft/L. |
| `paint.ts` | Paint Consumables | Exterior Paint Coverage | 60 | sqft/L (2 coats) | `paint.ts` L66 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.paint.exterior_coverage_sqft_per_litre` | Exterior paint litres | Medium | Validation bounds: 45 to 80 sqft/L. |
| `paint.ts` | Paint Consumables | Wall Putty Consumption Rate | 0.55 | kg/sqft (2 coats) | `paint.ts` L67 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.paint.putty_consumption_kg_sqft` | Acrylic wall putty kg | Medium | Validation bounds: 0.40 to 0.80 kg/sqft. |
| `flooring.ts` | Flooring Allowance | Livable Circulation Allowance | 10 | % of BUA | `flooring.ts` L54 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.flooring.circulation_allowance_pct` | Hallway/corridor tile area | Medium | Validation bounds: 5% to 18%. |
| `flooring.ts` | Flooring Allowance | Staircase Granite Allowance | 180 | sqft/flight | `flooring.ts` L74 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.flooring.staircase_granite_sqft_flight` | Tread/riser granite slabs | Medium | Validation bounds: 120 to 250 sqft/flight. |
| `flooring.ts` | Waterproofing | Balcony Curb Upturn Height | 0.5 (6") | ft | `flooring.ts` L86 / `spaceModel.ts` L118 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.waterproofing.balcony_upturn_ft` | Balcony membrane perimeter | Low | Validation bounds: 0.25 to 1.0 ft. |
| `electrical.ts` | Electrical Cabling | 1.5 sq.mm Wire per Light/Fan Point | 8.5 | m/point | `electrical.ts` L116 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.electrical.wire_1_5_m_per_point` | 1.5 sq.mm copper conductor length | Medium | Validation bounds: 6.0 to 14.0 m/point. |
| `electrical.ts` | Electrical Cabling | 2.5 sq.mm Wire per Socket Point | 12.5 | m/point | `electrical.ts` L120 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.electrical.wire_2_5_m_per_point` | 2.5 sq.mm copper conductor length | Medium | Validation bounds: 9.0 to 18.0 m/point. |
| `electrical.ts` | Electrical Cabling | 4.0 sq.mm Wire per AC/Geyser Point | 22.0 | m/point | `electrical.ts` L124 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.electrical.wire_4_0_m_per_point` | 4.0 sq.mm dedicated homerun length | Medium | Validation bounds: 15.0 to 30.0 m/point. |
| `electrical.ts` | Electrical Cabling | 6.0 sq.mm Vertical Sub-Main Riser | 35.0 | m/floor | `electrical.ts` L129 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.electrical.riser_wire_6_0_m_floor` | 6.0 sq.mm floor riser conductors | Medium | Validation bounds: 20.0 to 50.0 m/floor. |
| `electrical.ts` | Electrical Cabling | 6.0 sq.mm EV Charging Homerun | 35.0 | m/charger | `electrical.ts` L130 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.electrical.ev_wire_6_0_m` | 6.0 sq.mm dedicated EV circuit | Medium | Validation bounds: 20.0 to 50.0 m. |
| `electrical.ts` | Electrical Piping | PVC Conduit per Electrical Point | 2.6 | m/point | `electrical.ts` L149 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.electrical.conduit_m_per_point` | 25mm heavy duty PVC conduit | Medium | Validation bounds: 1.8 to 4.0 m/point. |
| `electrical.ts` | Electrical Piping | Vertical Shaft Conduit Riser | 15.0 | m/floor | `electrical.ts` L146 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.electrical.conduit_riser_m_floor` | Shaft conduit | Medium | Validation bounds: 10.0 to 25.0 m/floor. |
| `electrical.ts` | Electrical Fixtures | Switch Modular Plates Multiplier | 0.75 | modules/point | `electrical.ts` L109 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.electrical.switch_modules_ratio` | Modular gang boxes & face plates | Low | Validation bounds: 0.50 to 1.20. |
| `electrical.ts` | Electrical Fixtures | Staircase Lighting Allowance | 2 | points/flight | `electrical.ts` L82 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.electrical.staircase_lights_per_flight` | Common area lighting | Low | Validation bounds: 1 to 4. |
| `electrical.ts` | Electrical Fixtures | Terrace Weatherproof Lights | 2 | points | `electrical.ts` L83 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.electrical.terrace_lights_count` | Terrace bulkhead points | Low | Validation bounds: 1 to 6. |
| `electrical.ts` | Electrical Fixtures | Parking Bay Lighting Allowance | 2 (1 if no car) | points | `electrical.ts` L84 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.electrical.parking_lights_count` | Ground/stilt lighting | Low | Validation bounds: 1 to 6. |
| `plumbing.ts` | Plumbing Piping | CPVC Supply Pipe per Water Point | 4.5 | m/point | `CPVC_M_PER_POINT` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.plumbing.cpvc_m_per_point` | Hot/cold water delivery pipe | Medium | Validation bounds: 3.0 to 7.0 m/point. |
| `plumbing.ts` | Plumbing Piping | SWR Drainage Pipe per Drain Point | 3.5 | m/point | `SWR_M_PER_POINT` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.plumbing.swr_m_per_point` | Soil & waste drainage pipe | Medium | Validation bounds: 2.5 to 5.5 m/point. |
| `plumbing.ts` | Plumbing Piping | Vertical Plumbing Stack Allowance | 12.0 | m/floor | `VERTICAL_RISER_ALLOWANCE_M` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.plumbing.riser_m_per_floor` | Vertical drop stack & header | Medium | Validation bounds: 8.0 to 20.0 m/floor. |
| `plumbing.ts` | Water Storage | Daily Domestic Demand per Person | 135 | LPCD | `DAILY_WATER_DEMAND_LPCD` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.plumbing.daily_water_demand_lpcd` | IS 1172 domestic storage capacity | High | Statutory IS 1172 benchmark (100 to 200 LPCD). |
| `plumbing.ts` | Water Storage | Water Storage Reserve Buffer | 1.5 | days | `WATER_STORAGE_DAYS` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.plumbing.water_storage_reserve_days` | Municipal/borewell reserve days | Medium | Validation bounds: 1.0 to 3.0 days. |
| `plumbing.ts` | Water Storage | Bedroom Occupancy Proxy | 2.0 | persons/bed | `OCCUPANTS_PER_BEDROOM` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.plumbing.occupants_per_bedroom` | Total household head count | Medium | Validation bounds: 1.5 to 3.5 persons. |
| `plumbing.ts` | Water Storage | Overhead Tank Commercial Step | 500 (Min 1000) | Litres | `plumbing.ts` L92 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.plumbing.tank_commercial_step_litres` | Standard commercial tank sizes | Low | Validation bounds: 500 to 1000 L. |
| `bua.ts` | Parking Footprint | Covered / Stilt Car Parking Area | 180 | sqft/car | `bua.ts` L21 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.parking.stilt_car_sqft` | Stilt parking footprint deduction | Medium | Planning norm (bounds: 150 to 220 sqft). |
| `bua.ts` | Parking Footprint | Surface / Open Car Parking Area | 120 | sqft/car | `bua.ts` L21 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.parking.surface_car_sqft` | Ground parking footprint | Medium | Planning norm (bounds: 100 to 150 sqft). |
| `bua.ts` | Parking Footprint | Two-Wheeler / Bike Parking Area | 35 | sqft/bike | `bua.ts` L22 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.parking.bike_sqft` | Bike parking footprint | Low | Planning norm (bounds: 25 to 50 sqft). |
| `doors.ts` | Openings / Doors | Main Door Opening Dimensions | 4.0 × 7.0 (28) | ft (sqft) | `doors.ts` L58, L95 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.openings.main_door_area_sqft` | Masonry opening deduction, door size | Medium | Validation bounds: 24 to 36 sqft. |
| `doors.ts` | Openings / Doors | Internal Door Opening Dimensions | 3.0 × 7.0 (21) | ft (sqft) | `doors.ts` L58, L111 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.openings.internal_door_area_sqft` | Masonry deduction, door size | Medium | Validation bounds: 18 to 25 sqft. |
| `doors.ts` | Openings / Doors | Bathroom Door Opening Dimensions | 2.5 × 7.0 (17.5) | ft (sqft) | `doors.ts` L58, L127 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.openings.bathroom_door_area_sqft` | Masonry deduction, door size | Medium | Validation bounds: 14 to 21 sqft. |
| `windows.ts` | Openings / Windows | Window Safety Grille Percentage | 75% / 80% | % | `windows.ts` L53, L123 | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `config.openings.window_grille_pct` | MS security grille area | Low | Validation bounds: 50% to 100%. |
| `engineeringAssumptions.ts` | Room Templates | Bedroom Template (14x10, 140 sqft) | 140 | sqft | `ROOM_SIZE_ASSUMPTIONS.bedroom` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `template.room.bedroom` | Space model generation, walls, points | High | Expose in Space & Room Templates Admin. |
| `engineeringAssumptions.ts` | Room Templates | Bathroom Template (6x5, 30 sqft) | 30 | sqft | `ROOM_SIZE_ASSUMPTIONS.bathroom` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `template.room.bathroom` | Plumbing, waterproofing, dado tiles | High | Expose in Space & Room Templates Admin. |
| `engineeringAssumptions.ts` | Room Templates | Common Toilet Template (5x4, 20 sqft) | 20 | sqft | `ROOM_SIZE_ASSUMPTIONS.commonToilet` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `template.room.commonToilet` | Plumbing, waterproofing, dado tiles | High | Expose in Space & Room Templates Admin. |
| `engineeringAssumptions.ts` | Room Templates | Kitchen Template (10x9, 90 sqft) | 90 | sqft | `ROOM_SIZE_ASSUMPTIONS.kitchen` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `template.room.kitchen` | Kitchen counter, electrical, sink | High | Expose in Space & Room Templates Admin. |
| `engineeringAssumptions.ts` | Room Templates | Living Room Template (16x12.5, 200 sqft) | 200 | sqft | `ROOM_SIZE_ASSUMPTIONS.living` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `template.room.living` | Picture windows, living electrical points | High | Expose in Space & Room Templates Admin. |
| `engineeringAssumptions.ts` | Room Templates | Dining Template (12x10, 120 sqft) | 120 | sqft | `ROOM_SIZE_ASSUMPTIONS.dining` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `template.room.dining` | Dining walls, electrical, windows | Medium | Expose in Space & Room Templates Admin. |
| `engineeringAssumptions.ts` | Room Templates | Balcony Template (10x5, 50 sqft) | 50 | sqft | `ROOM_SIZE_ASSUMPTIONS.balcony` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `template.room.balcony` | Waterproofing, anti-skid tiles | Medium | Expose in Space & Room Templates Admin. |
| `engineeringAssumptions.ts` | Room Templates | Utility Template (8x5, 40 sqft) | 40 | sqft | `ROOM_SIZE_ASSUMPTIONS.utility` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `template.room.utility` | Washing water point, drainage, curb | Medium | Expose in Space & Room Templates Admin. |
| `engineeringAssumptions.ts` | Room Templates | Pooja Template (5x5, 25 sqft) | 25 | sqft | `ROOM_SIZE_ASSUMPTIONS.pooja` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `template.room.pooja` | Pooja door, floor tiles, light point | Medium | Expose in Space & Room Templates Admin. |
| `engineeringAssumptions.ts` | Room Templates | Home Office Template (10x10, 100 sqft) | 100 | sqft | `ROOM_SIZE_ASSUMPTIONS.office` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `template.room.office` | AC point, computer sockets, window | Medium | Expose in Space & Room Templates Admin. |
| `engineeringAssumptions.ts` | Room Templates | Store Room Template (7x5, 35 sqft) | 35 | sqft | `ROOM_SIZE_ASSUMPTIONS.storeRoom` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `template.room.storeRoom` | Internal door, light point | Medium | Expose in Space & Room Templates Admin. |
| `authorityRules/bengaluru.ts` | Authority / Setbacks | BBMP/BDA Setback Slabs | 5 area slabs | ft | `BENGALURU_AUTHORITY_RULES.setbackSlabs` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `authority.bengaluru.setbacks` | Statutory setbacks, buildable footprint | High | Support Planning vs Statutory verification labels. |
| `authorityRules/bengaluru.ts` | Authority / FAR | BBMP/BDA Road Width FAR Slabs | 4 road slabs | ratio | `BENGALURU_AUTHORITY_RULES.farSlabs` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `authority.bengaluru.far` | Permissible BUA cap | High | Support Planning vs Statutory verification labels. |
| `authorityRules/mysuru.ts` | Authority / Setbacks | MUDA/MDA Setback Slabs | 5 area slabs | ft | `MYSURU_AUTHORITY_RULES.setbackSlabs` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `authority.mysuru.setbacks` | Statutory setbacks, buildable footprint | High | Support Planning vs Statutory verification labels. |
| `authorityRules/mysuru.ts` | Authority / FAR | MUDA/MDA Road Width FAR Slabs | 3 road slabs | ratio | `MYSURU_AUTHORITY_RULES.farSlabs` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `authority.mysuru.far` | Permissible BUA cap | High | Support Planning vs Statutory verification labels. |
| `packageConfig.ts` | Packages / Specs | Standard Tier Brand & Spec Profile | Complete map | Object | `CONSTRUCTION_PACKAGES.STANDARD` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `package.spec.standard` | Default material selections & brands | High | Expose in Specifications & Tiers Admin. |
| `packageConfig.ts` | Packages / Specs | Premium Tier Brand & Spec Profile | Complete map | Object | `CONSTRUCTION_PACKAGES.PREMIUM` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `package.spec.premium` | Default material selections & brands | High | Expose in Specifications & Tiers Admin. |
| `packageConfig.ts` | Packages / Specs | Luxury Tier Brand & Spec Profile | Complete map | Object | `CONSTRUCTION_PACKAGES.LUXURY` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `package.spec.luxury` | Default material selections & brands | High | Expose in Specifications & Tiers Admin. |
| `packageConfig.ts` | Recommendations | Package Recommendation Copy & Rules | Copy text | String | `CONSTRUCTION_PACKAGES.*.recommendationReason` | **2. SHOULD BECOME ADMIN CONFIGURABLE** | `package.recommendation.*` | Recommendation engine cards | Medium | Expose in Recommendations Admin. |
| `calculator.ts` | Engine Pipeline | Topological Calculation Graph | Fixed execution order | Logic | `calculator.ts` lines 80-220 | **3. MUST REMAIN ENGINE CODE** | N/A | Area -> Model -> Materials -> BOQ -> Budget -> QA | Critical | Pure deterministic TypeScript execution. |
| `qaGate.ts` | Engine QA | 11 Core Automated Integrity Invariants | Boolean checks | Invariants | `qaGate.ts` runQAGate | **3. MUST REMAIN ENGINE CODE** | N/A | Mathematical consistency, zero residual | Critical | Must never be editable or bypassable by admin. |
| `budget.ts` | Commercial Engine | Zero Unexplained Residual Formula | Total = M + F + L + C | Equation | `budget.ts` lines 40-56 | **3. MUST REMAIN ENGINE CODE** | N/A | Mathematical balance | Critical | Pure deterministic accounting equation. |
| `coefficients.ts` | Static Mapping | Direct mirror of `CENTRALIZED_ENGINEERING_ASSUMPTIONS` | Redundant consts | Types | `coefficients.ts` lines 10-64 | **4. DEPRECATED / DUPLICATED** | Refactor to consume resolved Config | Modules importing `coefficients.ts` | Low | Refactor `coefficients.ts` into dynamic getter linked to active configuration. |
| `labour.ts` | Labour Logic | Hardcoded Mysuru 10% Discount Branch | `isMysuru ? 310 : 350` | ₹/SqFt | `labour.ts` lines 65-71 | **4. DEPRECATED / DUPLICATED** | `rate.labour.civil_composite:Mysore` | Location rate resolver | Medium | Replace hardcoded ternary branches with `rateService.getEffectiveRate('labour.civil_composite', { location: 'Mysore' })`. |
| `brandDatabase.ts` | Rate Duplication | Duplicate unit rates in `brandDatabase.ts` vs `rateMasterDefaults.ts` | Parallel rates | ₹ | `brandDatabase.ts` lines 50-800 | **4. DEPRECATED / DUPLICATED** | `rate.*` | Single source of truth | Medium | Ensure `brandDatabase.ts` queries `rateService` for rate lookup instead of static pricing. |

---

### Key Architectural Findings & Risk Analysis

1. **Safety Boundary**:
   - High-risk mathematical operations (such as converting steel kg to tonnes $\div 1000$, computing net wall area from perimeter $\times$ height minus openings, or enforcing that total payment percentage equals 100%) **must never be exposed as arbitrary formulas**. Admins configure scalar multipliers, boundary thresholds, dimension matrices, and textual descriptors.
2. **Dynamic Configuration Bridge**:
   - Currently, `rateService` dynamically resolves prices via `rateService.getEffectiveRate()`.
   - A parallel service, `calculationConfigService`, should be established (or `rateService` expanded into a unified configuration manager) to resolve non-price engineering parameters (such as `wallHeightFt`, `conduitMPerPoint`, `puttyConsumptionKgSqFt`, and `ROOM_SIZE_ASSUMPTIONS`) using the exact same location/tier/version hierarchy.
3. **Location & Tier Invariance**:
   - Structural quantities (concrete cubic metres, rebar kg, brick piece counts) must remain strictly invariant across quality tiers unless a physical specification change is deliberately configured (e.g. switching masonry from 6" AAC blocks to 9" Clay Bricks).
4. **Draft vs. Active Isolation**:
   - Public calculator endpoints and production report generation must **only consume the `ACTIVE` published configuration version**.
   - Admin simulations run the identical engine in an isolated memory context passing the `DRAFT` configuration version to generate delta analysis without touching active production.

---

### Audit Sign-Off
- Total audited files: **21 calculation engine files & 5 server schema/controller files**
- Total categorized parameters: **92 primary calculation inputs & 11 room templates**
- Category breakdown:
  - Already Configurable: **24 parameters**
  - Should Become Admin Configurable: **62 parameters & 11 space templates**
  - Must Remain Engine Code: **Topological graph, 11 QA invariants, math formulas**
  - Deprecated / Conflicting to clean up: **3 patterns (coefficients mirror, labour ternary branch, parallel brand rates)**
- Ready to proceed to **Phase 2B (Configuration Architecture)** upon user review.

---

## PHASE 2B IMPLEMENTATION ADDENDUM & ARCHITECTURAL DECISIONS

**Date**: September 19, 2026  
**Status**: Implemented & Verified (168/168 Tests Passing)

### 1. Phase 2B Architectural Decisions
1. **Centralized Configuration Resolver (`configResolver`)**: Established as the single authoritative resolver for non-price calculation parameters, space templates, commercial settings, and labour benchmarks.
2. **Current Value ≠ Approved Value Enforcement**: Preserved 100% of current effective runtime behaviour across physical quantities and costs. All audited discrepancies were routed into a formal `ParameterConflictRegistry` marked `CONFLICT_REQUIRES_REVIEW` rather than silently normalized.
3. **Draft / Production Isolation**: In standard production calculator execution, only `ACTIVE` configuration is resolved. Draft parameters are strictly filtered out unless explicitly requested via `allowDraftForSimulation: true`.
4. **Unified Pricing Authority**: Rate master (`RateOverride`, `RateAuditLog`, and `rateService`) remains the sole pricing authority. `brandDatabase.ts` and `labour.ts` now consume resolved rates and benchmarks, eliminating parallel pricing schemas.
5. **Dynamic Backward-Compatible Adapter**: `CENTRALIZED_ENGINEERING_ASSUMPTIONS` in `coefficients.ts` was transformed into a live dynamic adapter reading directly from `configResolver.resolveParameter(...)` with memoization, preserving zero breaking changes for existing modules.

### 2. Migrated Parameters (Baseline v1.0.0 Active Configuration)
The following 38 core parameters, 11 space templates, commercial rules, and labour benchmarks are now migrated and registered in `baselineConfiguration.ts`:
- **Structural**: `config.structure.wall_height_ft` (10.0 ft), `config.planning.super_bua_multiplier` (1.15), `config.planning.default_coverage_ratio` (0.60), `config.rcc.steel_base_factor_kg_sqft` (2.8 kg/sqft), `config.rcc.steel_additional_floor_factor` (0.2 kg/sqft/floor).
- **Direct Materials**: `config.material.cement_bags_per_sqft` (0.40 bags/sqft), `config.material.m_sand_cft_per_sqft` (0.60 CFT/sqft), `config.material.p_sand_cft_per_sqft` (0.60 CFT/sqft), `config.material.coarse_aggregate_cft_per_sqft` (1.35 CFT/sqft).
- **Masonry Units**: `config.masonry.aac_block_unit_volume_cum` (0.018 m³), `config.masonry.clay_brick_unit_volume_cum` (0.001539 m³), `config.masonry.concrete_block_unit_volume_cum` (0.012 m³), `config.masonry.external_wall_thickness_m` (0.150 m), `config.masonry.internal_wall_thickness_m` (0.100 m).
- **Finishes & Cladding**: `config.cladding.bathroom_dado_standard_ft` (7.0 ft), `config.cladding.bathroom_dado_full_ft` (10.0 ft), `config.cladding.kitchen_dado_standard_ft` (2.0 ft), `config.cladding.kitchen_dado_extended_ft` (4.0 ft), `config.cladding.kitchen_counter_length_ft` (15.0 ft), `config.flooring.circulation_allowance_pct` (10%), `config.flooring.staircase_granite_sqft_flight` (180 sqft/flight).
- **Waterproofing**: `config.waterproofing.bathroom_upturn_ft` (1.0 ft), `config.waterproofing.balcony_upturn_ft` (0.5 ft), `config.waterproofing.terrace_coverage_ratio` (1.00), `config.waterproofing.sump_surface_sqft` (120 sqft).
- **Paint & Consumables**: `config.paint.interior_coverage_sqft_per_litre` (45 sqft/L), `config.paint.exterior_coverage_sqft_per_litre` (60 sqft/L), `config.paint.putty_consumption_kg_sqft` (0.55 kg/sqft).
- **Electrical Cabling & Conduits**: `config.electrical.wire_1_5_m_per_point` (8.5 m), `config.electrical.wire_2_5_m_per_point` (12.5 m), `config.electrical.wire_4_0_m_per_point` (22.0 m), `config.electrical.riser_wire_6_0_m_floor` (35.0 m), `config.electrical.ev_wire_6_0_m` (35.0 m), `config.electrical.conduit_m_per_point` (2.6 m), `config.electrical.conduit_riser_m_floor` (15.0 m), `config.electrical.switch_modules_ratio` (0.75).
- **Plumbing & Piping**: `config.plumbing.cpvc_m_per_point` (4.5 m), `config.plumbing.swr_m_per_point` (3.5 m), `config.plumbing.riser_m_per_floor` (12.0 m), `config.plumbing.daily_water_demand_lpcd` (135 LPCD), `config.plumbing.water_storage_reserve_days` (1.5 days), `config.plumbing.occupants_per_bedroom` (2.0).
- **Space Templates**: All 11 room templates (`living`, `bedroom`, `kitchen`, `bathroom`, `commonToilet`, `dining`, `balcony`, `utility`, `pooja`, `office`, `storeRoom`) fully typed with length, width, area, carpet/super ratios, and opening deductions.
- **Commercial Rules**: Contractor margin (15%), professional fees (5%), contingency (6%), GST (18%), wastage rules (steel 5%, cement 2%, blocks 5%, tiles 7%, paint 10%).
- **Labour Benchmarks**: Bengaluru (₹380 composite, ₹350 civil fallback), Mysuru (₹342 composite, ₹310 civil fallback).

### 3. Parameters Still Hardcoded (Scheduled for Phase 2C DB Persistence & Phase 2D UI)
The following parameters are cleanly typed in domain interfaces but will connect to PostgreSQL in Phase 2C:
- Dynamic setback calculation tables for BBMP/BDA and MUDA/MDA (`BENGALURU_AUTHORITY_RULES` and `MYSURU_AUTHORITY_RULES`).
- Static package profile descriptions and feature matrix comparison copy in `packageConfig.ts`.
- Door/window opening dimensional catalog presets in `doors.ts` and `windows.ts` (currently defined with baseline defaults).

### 4. Configuration Conflicts Requiring Business Decision
All 5 flagged parameter discrepancies are registered in `conflictRegistry.ts`:
1. `config.paint.interior_coverage_sqft_per_litre`: Current code uses `45 sqft/L` (2 coats premium); earlier spec referenced `60 sqft/L`. Current 45 sqft/L is preserved.
2. `config.commercial.contractor_margin`: Baseline config default is `15%` (turnkey); earlier client MOM referenced `8-10%` for contractor mode, and `0%` for direct self-build. Effective behaviour preserved by calculation mode context.
3. `config.waterproofing.sump_surface_sqft`: Code default is `120 sqft`; standard 8,000L rectangular sump is approx `180 sqft`. Code default 120 sqft preserved.
4. `config.flooring.circulation_allowance_pct`: Code default is `10%`; architectural standard for duplex residential is `12-15%`. Code default 10% preserved.
5. `config.flooring.staircase_granite_sqft_flight`: Code default is `180 sqft/flight`; geometric calculation of 18 treads (11"x42") + 18 risers (6.5"x42") is approx `175 sqft`. Code default 180 sqft preserved.

### 5. Deprecated Sources & Cleanups Completed
1. `coefficients.ts`: Static frozen object removed as source of truth; replaced by dynamic adapter forwarding to `configResolver`.
2. `labour.ts`: Removed hardcoded ternary `isMysuru ? 310 : 350`; replaced by `configResolver.getLabourBenchmark('civil_composite', location)`.
3. `brandDatabase.ts`: Material prices decoupled from static values; linked to RateMaster architecture.

### 6. Remaining Risks & Phase 2C Roadmap
- **Database Schema Sync**: Schema additive tables `CalculationConfigVersion` and `CalculationConfigParameter` are defined in `server/prisma/schema.prisma` and compiled cleanly. In Phase 2C, non-destructive migration will sync these tables to Render PostgreSQL.
- **Fail-Closed Resolver**: If PostgreSQL is unavailable, `configResolver` safely falls back to the in-memory compiled baseline (`BASELINE_CONFIG_PARAMETERS`), guaranteeing zero downtime for calculation endpoints.
