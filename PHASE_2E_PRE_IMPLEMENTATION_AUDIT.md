# HUTTY — PHASE 2E PRE-IMPLEMENTATION AUDIT
## AUTHORITATIVE CLASSIFICATION & GAP ANALYSIS
**Document**: `PHASE_2E_PRE_IMPLEMENTATION_AUDIT.md`  
**Date**: September 21, 2026  
**Auditor**: Senior Systems Architect & Quantity Surveying Pair Programmer  
**Status**: Completed — Baseline for Phase 2E Implementation  

---

### Executive Summary

In accordance with Phase 2E corrective instructions, this audit examines every component, parameter, screen, model, API, and rule in the Hutty codebase before applying code changes. 

The audit's core objective is to prevent architectural duplication, preserve the canonical calculation engine, enforce database safety, and clearly separate:
- What already **`EXISTS`** and functions.
- What is **`ALREADY CONFIGURABLE`** end-to-end.
- What is **`PARTIALLY CONFIGURABLE`** and requires UI/workflow refinement.
- What is **`MISSING`** and must be created.
- What **`SHOULD REMAIN CODE-CONTROLLED`** to preserve mathematical, statutory, and security integrity.

---

### 1. Audit of the 13 Core Architectural Areas

#### 1. Existing Admin Screens
- **Overview Dashboard** (`activeTab === 'overview'`): **`EXISTS`**  
  Displays system metrics, active version, override counts, and health status. Needs simplification into executive overview with 4 primary CTAs.
- **Rate Master** (`rates`): **`EXISTS`**  
  Categorized, searchable table of 40+ material items and labour rates with override modal.
- **Auto Price Updates** (`price-update`): **`EXISTS`**  
  Provider runs, proposals list, bulk approval/rejection.
- **Commercial Settings** (`config`): **`EXISTS`**  
  Markups for contractor margin, professional fees, contingency, and GST.
- **Packages Matrix** (`packages`): **`EXISTS`**  
  Static comparison of Standard, Premium, Luxury specifications.
- **Analytics & Funnel** (`analytics`): **`EXISTS`**  
  Conversion rates, drop-offs, CSV export.
- **Audit Trail** (`audit`): **`EXISTS`**  
  Logs for rate and configuration modifications.
- **Account & Security** (`account`): **`EXISTS`**  
  Profile management, password changes, active session revocation.
- **Parameters Tab** (`parameters`): **`EXISTS`**  
  Table of canonical parameters with search and inline modification. Currently exposes technical keys.
- **Space & Rooms Tab** (`space-rooms`): **`EXISTS`**  
  Card list of 12 standard room templates.
- **Trade Parameters Tab** (`TradeParametersTab`): **`EXISTS`**  
  13 trade categories (Structure, Masonry, Flooring, Paint, Waterproofing, Doors/Windows, Plumbing, Electrical, Fixtures, Labour, Commercial, Authority, Recommendations).
- **Calculation Rules Tab** (`CalculationRulesTab`): **`EXISTS`**  
  Method selection for Steel, Paint, Flooring, and DAG cycle status. Currently exposes AST terminology.
- **Simulation & Impact Tab** (`SimulationImpactTab`): **`EXISTS`**  
  Delta calculation on key metrics and BOQ lines before publishing.
- **Version History Tab** (`VersionHistoryTab`): **`EXISTS`**  
  Timeline of published configurations, rollback trigger, and JSON export.

#### 2. Existing Configurable Parameters
- Standard Wall Height: **`ALREADY CONFIGURABLE`** (`config.structure.wall_height_ft`)
- Super Built-up Multiplier: **`ALREADY CONFIGURABLE`** (`config.planning.super_bua_multiplier`)
- Ground Coverage Factor: **`ALREADY CONFIGURABLE`** (`config.planning.default_coverage_ratio`)
- Ground Steel Factor: **`ALREADY CONFIGURABLE`** (`config.rcc.steel_base_factor_kg_sqft`)
- Steel Upper Floor Increment: **`ALREADY CONFIGURABLE`** (`config.rcc.steel_additional_floor_factor`)
- Cement Consumption Factor: **`ALREADY CONFIGURABLE`** (`config.material.cement_bags_per_sqft`)
- M-Sand & P-Sand Factors: **`ALREADY CONFIGURABLE`** (`config.material.m_sand_cft_per_sqft`, `p_sand_cft_per_sqft`)
- Coarse Aggregate Factor: **`ALREADY CONFIGURABLE`** (`config.material.coarse_aggregate_cft_per_sqft`)
- External & Internal Wall Thickness: **`ALREADY CONFIGURABLE`** (`config.masonry.external_wall_thickness_m`, `internal_wall_thickness_m`)
- AAC Block Unit Volume: **`ALREADY CONFIGURABLE`** (`config.masonry.aac_block_unit_volume_cum`)
- Tile Wastage Allowance: **`ALREADY CONFIGURABLE`** (`config.wastage.flooring`)
- Interior & Exterior Paint Coverage: **`ALREADY CONFIGURABLE`** (`config.paint.interior_coverage_sqft_per_litre`, `exterior_coverage_sqft_per_litre`)
- Wall Putty Consumption: **`ALREADY CONFIGURABLE`** (`config.paint.putty_kg_per_sqft`)
- Bathroom Upturn Height: **`ALREADY CONFIGURABLE`** (`config.waterproofing.bathroom_upturn_ft`)
- Terrace Coverage Ratio: **`ALREADY CONFIGURABLE`** (`config.waterproofing.terrace_coverage_ratio`)
- Sump Surface Area: **`ALREADY CONFIGURABLE`** (`config.waterproofing.sump_surface_sqft`)
- Electrical Wire Lengths per Point: **`ALREADY CONFIGURABLE`** (`config.electrical.wire_1_5_m_per_point`, `2_5`, `4_0`)
- Conduit Length per Point: **`ALREADY CONFIGURABLE`** (`config.electrical.conduit_m_per_point`)
- Switch Module Multiplier: **`ALREADY CONFIGURABLE`** (`config.electrical.switch_module_ratio`)
- CPVC & SWR Lengths per Point: **`ALREADY CONFIGURABLE`** (`config.plumbing.cpvc_m_per_point`, `swr_m_per_point`)
- Contractor Execution Margin: **`ALREADY CONFIGURABLE`** (`config.commercial.contractor_margin`)
- Works Contract GST: **`ALREADY CONFIGURABLE`** (`config.commercial.gst_rate`)
- Contingency Reserve: **`ALREADY CONFIGURABLE`** (`config.commercial.contingency`)
- Professional Fees: **`ALREADY CONFIGURABLE`** (`config.commercial.professional_fees`)
- 40+ Material and Labour Unit Rates: **`ALREADY CONFIGURABLE`** via `RateOverride`

#### 3. Existing Room Controls
- 12 Standard Templates (Master Bedroom, Bedroom, Living, Dining, Kitchen, Bathroom, Common Toilet, Balcony, Utility, Pooja, Office, Store): **`EXISTS`**
- Length, Width, Height, Dado Height, Opening Counts per Room: **`ALREADY CONFIGURABLE`**
- `+ Add Room Type` (custom room creation flowing to engine): **`PARTIALLY CONFIGURABLE`** (schema supports it, but client-facing UI modal is missing).
- Dedicated Bathroom Control with quick fixture checkboxes and waterproofing presets: **`PARTIALLY CONFIGURABLE`** (scattered across trade tabs; needs dedicated simplified card).

#### 4. Existing Calculation Methods
- Steel Methods: **`EXISTS`** (`steel_floorwise`, `steel_simple_bua`, `steel_manual`)
- Paint Methods: **`EXISTS`** (`paint_surface_area`, `paint_thumb_rule_bua`)
- Flooring Methods: **`EXISTS`** (`flooring_circulation_pct`)
- Masonry, Electrical, Plumbing, Labour, Waterproofing Registered Methods: **`MISSING`** (currently single-method; need safe registered methods).

#### 5. Existing Configuration APIs
- `GET /api/config/active`: **`EXISTS`**
- `GET /api/config/versions`: **`EXISTS`**
- `POST /api/config/versions`: **`EXISTS`**
- `GET /api/config/versions/:id`: **`EXISTS`**
- `PUT /api/config/versions/:id`: **`EXISTS`**
- `POST /api/config/versions/:id/validate`: **`EXISTS`**
- `POST /api/config/versions/:id/simulate`: **`EXISTS`**
- `POST /api/config/versions/:id/submit-review`: **`EXISTS`**
- `POST /api/config/versions/:id/publish`: **`EXISTS`**
- `POST /api/config/rollback/:id`: **`EXISTS`**
- Rate Master CRUD endpoints: **`EXISTS`**

#### 6. Existing Prisma Models
- `CalculationConfigVersion`: **`EXISTS`**
- `CalculationConfigParameter`: **`EXISTS`**
- `CalculationConfigAuditLog`: **`EXISTS`**
- `RateOverride`: **`EXISTS`**
- `RateAuditLog`: **`EXISTS`**
- `CalculatorConfig`: **`EXISTS`**
- `Project`, `ProjectConfiguration`, `CalculationResult`, `BOQItem`: **`EXISTS`**

#### 7. Existing Versioning
- Immutable version catalog with lifecycle states (`DRAFT` $\to$ `VALIDATED` $\to$ `REVIEW` $\to$ `PUBLISHED` $\to$ `ACTIVE`): **`EXISTS`**
- Audit logs linking each version to admin and change notes: **`EXISTS`**

#### 8. Existing Simulation
- `simulateConfigurationComparison` in `impactAnalysis.ts`: **`EXISTS`**
- Compares baseline test cases and calculates metric and BOQ line deltas: **`EXISTS`**

#### 9. Existing Rollback
- Reverts to an earlier configuration by generating a new forward version: **`EXISTS`**
- Preserves historical immutability: **`EXISTS`**

#### 10. Existing Rate Management
- `rateService` with multi-dimensional overrides (Location, Package Tier): **`EXISTS`**
- Preserves quantity invariance when rates change: **`EXISTS`**

#### 11. Existing Audit Logs
- Captures admin email, timestamp, oldValue, newValue, action, reason: **`EXISTS`**

#### 12. Existing Calculation Engine Integrations
- Central `configResolver` bridges DB/cache to `spaceModel`, `steel`, `cement`, `brick`, `flooring`, `paint`, `plumbing`, `electrical`, `labour`, `budget`, `calculator`: **`EXISTS`**

#### 13. Existing Tests
- 17 test suites, 203 automated tests passing in Vitest: **`EXISTS`**

---

### 2. Feature Classification Table

| Proposed Phase 2E Feature | Audit Classification | Action Required in Phase 2E |
| :--- | :--- | :--- |
| 6 Navigation Groups (Project, Construction, Services, Pricing, Calculator, Report, Management) | **MISSING** | Implement clean collapsible grouping replacing the 26-item flat list. |
| Basic / Advanced Mode Toggle | **MISSING** | Implement global mode toggle defaulting to `Basic`. |
| "What Does This Affect?" Context Info | **MISSING** | Add factual impact summaries for key parameters. |
| In-Admin Test Calculator (Production Engine Powered) | **MISSING** | Build sandbox UI calling `runCalculator()` with Active vs Draft comparison. |
| Quantity vs Price Delta Breakdown in Test Calculator | **MISSING** | Separate physical quantities from cost deltas in comparison view. |
| Custom Room Type Creation Modal (`+ Add Room Type`) | **PARTIALLY CONFIGURABLE** | Build client-friendly modal feeding custom rooms into `spaceModel`. |
| Dedicated Bathroom Control Card | **PARTIALLY CONFIGURABLE** | Group dimensions, dado, upturn, and fixture presets into one clean card. |
| BUA Calculation Method Selector (Manual, Room, Carpet) | **PARTIALLY CONFIGURABLE** | Expose friendly selector with plain explanations. |
| Registered Methods for Masonry, MEP, Labour, Waterproofing | **MISSING** | Register genuine safe methods in `methodRegistry.ts` without arbitrary code. |
| Visual Rule Builder (WHEN ... THEN ...) | **PARTIALLY CONFIGURABLE** | Convert AST rule builder into a clean non-technical condition form under Advanced. |
| Paint 45 vs 60 sqft/L Conflict Confirmation Warning | **MISSING** | Add prominent warning banner in Paint & Finishes section. |
| Global Admin Search | **MISSING** | Implement search index covering rooms, materials, rates, and settings. |
| Plain-English Construction Terminology (No Config Keys) | **PARTIALLY CONFIGURABLE** | Remove all `config.*` keys, AST, DAG, and SQL terminology from UI. |
| Tooltip Help System (`?`) on All Important Controls | **MISSING** | Add concise construction explanations for all major parameters. |
| Mathematical Invariants, Density, Unit Conversions | **SHOULD REMAIN CODE-CONTROLLED** | Strictly retain in codebase; do not expose to admin UI. |
| Security, Auth, Password Hashing, JWT, DB Config | **SHOULD REMAIN CODE-CONTROLLED** | Strictly retain in backend; never expose in admin UI. |

---

### 3. Conclusion & Safety Checklist

- **No Architectural Conflicts Discovered**: The existing single calculation engine, configuration resolver, rate master, and Prisma models fully support the Phase 2E requirements.
- **Zero Duplicate Engines**: All calculations in the Test Calculator and simulation invoke `runCalculator()`.
- **Database Safety**: Existing PostgreSQL tables remain intact; no tables will be dropped or reset.
- **Fail-Closed Guarantee**: Production mutations continue to fail closed if the database is unreachable.
- **Ready for Implementation**: Proceed to execution in accordance with the refined implementation plan.
