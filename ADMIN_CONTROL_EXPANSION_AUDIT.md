# HUTTY — PHASE 2E: SIMPLE ULTIMATE ADMIN CONTROL CENTER
## ARCHITECTURAL AUDIT & CLIENT-FRIENDLY CONFIGURATION EXPANSION MATRIX
**Document**: `ADMIN_CONTROL_EXPANSION_AUDIT.md`  
**Date**: September 21, 2026  
**Auditor**: Antigravity Senior Engineering & Quantity Surveying Pair Programmer  
**Status**: Authoritative Baseline for Phase 2E Implementation  

---

### Executive Summary

The objective of **Phase 2E** is to elevate the existing Hutty Admin Panel into a **simple, intuitive, and client-friendly Residential Construction Cost Calculator Control Center**.

The client is a residential construction business owner/operator, **not a developer**. The interface must completely hide technical internals (such as database column names, raw config keys like `config.structure.wall_height_ft`, JSON blobs, AST nodes, DAG terminology, and SQL queries). Instead, the client interacts strictly with clean, construction-domain terminology:
- *"Standard Wall Height [ 10 ] ft"*
- *"Bathroom Length [ 6 ] ft"*
- *"Steel per sq.ft [ 2.8 ] kg/sq.ft"*
- *"Tile Wastage [ 7 ] %"*
- *"Paint Coverage [ 45 ] sqft/L"*
- *"Contractor Margin [ 15 ] %"*
- *"GST [ 18 ] %"*

Underneath the hood, the **canonical calculation engine** remains the single source of truth. No secondary engines, no duplicated client-side formulas, and no arbitrary code execution are introduced.

---

### 1. Existing Admin Controls

The existing Admin Control Panel (built in Phase 2B–2D) currently contains:
1. **Overview Dashboard**:
   - Active configuration summary, rate override counter, system health status.
   - Quick jump to rate overrides and system diagnostics.
2. **Rate Master (`rates`)**:
   - Searchable, categorized table of 40+ material items and trade labour rates.
   - Modal for creating and editing location- and tier-specific rate overrides with required change rationale.
3. **Auto Price Updates (`price-update`)**:
   - Provider integrations, scheduled runs, and proposal acceptance/rejection workflows.
4. **Commercial Configuration (`config`)**:
   - Global percentages for professional fees, contractor margin, contingency, and GST.
5. **Specification Packages (`packages`)**:
   - Comparison matrix for Standard, Premium, and Luxury specifications.
6. **Analytics & Funnel (`analytics`)**:
   - Step drop-off tracking, completion rate, average cost per sq.ft, CSV export.
7. **Audit Trail (`audit`)**:
   - Immutable audit logs capturing user ID, timestamp, old value, new value, and rationale for rate modifications.
8. **Account & Security (`account`)**:
   - Admin credential management (bcrypt hashed), active session revocation.
9. **Parameters Tab (`parameters`)**:
   - Canonical parameter list with search and impact assessment preview.
10. **Space & Rooms Tab (`space-rooms`)**:
    - 12 pre-configured room templates with length, width, height, and opening counts.
11. **Trade Parameters Tab (`TradeParametersTab`)**:
    - 13 trade sections covering RCC, Masonry, Flooring, Paint, Waterproofing, Doors/Windows, Plumbing, Electrical, Fixtures, Labour, Commercial, Authority, and Recommendations.
12. **Calculation Rules Tab (`CalculationRulesTab`)**:
    - Method selection for Steel, Paint, Flooring, and DAG cycle validation check.
13. **Simulation & Impact Tab (`SimulationImpactTab`)**:
    - Draft parameter delta calculation, BOQ cost impact, and publish-to-production workflow.
14. **Version History Tab (`VersionHistoryTab`)**:
    - Immutable version timeline, configuration health diagnostics, rollback trigger, and JSON export.

---

### 2. Already Configurable Parameters

The system already provides active end-to-end resolution via `ConfigurationResolver` and `rateService` for:
- **Planning & BUA**:
  - `config.structure.wall_height_ft` (Default: 10.0 ft, Bounds: 8.0–14.0 ft)
  - `config.planning.super_bua_multiplier` (Default: 1.15, Bounds: 1.0–1.35)
  - `config.planning.default_coverage_ratio` (Default: 0.60, Bounds: 0.40–0.85)
- **Structural RCC**:
  - `config.rcc.steel_base_factor_kg_sqft` (Default: 2.80 kg/sqft, Bounds: 2.0–4.5 kg/sqft)
  - `config.rcc.steel_additional_floor_factor` (Default: 0.20 kg/sqft/floor, Bounds: 0.10–0.50)
  - `config.rcc.multiplier_g_plus_1` through `g_plus_4` (1.20, 1.35, 1.45, 1.55)
  - `config.material.cement_bags_per_sqft` (Default: 0.40 bags/sqft)
  - `config.material.m_sand_cft_per_sqft` (Default: 0.60 CFT/sqft)
  - `config.material.p_sand_cft_per_sqft` (Default: 0.60 CFT/sqft)
  - `config.material.coarse_aggregate_cft_per_sqft` (Default: 1.35 CFT/sqft)
  - `config.wastage.steel` (Default: 4.0%)
- **Masonry**:
  - `config.masonry.external_wall_thickness_m` (Default: 0.150 m / 6")
  - `config.masonry.internal_wall_thickness_m` (Default: 0.100 m / 4")
  - `config.masonry.aac_block_unit_volume_cum` (Default: 0.018 cu.m)
  - `config.wastage.masonry` (Default: 5.0%)
- **Flooring & Finishes**:
  - `config.wastage.flooring` (Default: 7.0%)
  - `config.flooring.circulation_allowance_pct` (Default: 10.0%)
  - `config.flooring.staircase_granite_sqft` (Default: 180 sqft/flight)
  - `config.cladding.bathroom_dado_standard_ft` (Default: 7.0 ft)
  - `config.cladding.bathroom_dado_full_ft` (Default: 10.0 ft)
- **Paint & Finishes**:
  - `config.paint.interior_coverage_sqft_per_litre` (Default: 45.0 sqft/L)
  - `config.paint.exterior_coverage_sqft_per_litre` (Default: 60.0 sqft/L)
  - `config.paint.putty_kg_per_sqft` (Default: 0.55 kg/sqft)
  - `config.paint.interior_coats` (Default: 2)
  - `config.wastage.paint` (Default: 10.0%)
- **Waterproofing**:
  - `config.waterproofing.bathroom_upturn_ft` (Default: 1.0 ft / 300mm)
  - `config.waterproofing.terrace_coverage_ratio` (Default: 1.0)
  - `config.waterproofing.sump_surface_sqft` (Default: 120 sqft)
- **Electrical**:
  - `config.electrical.wire_1_5_m_per_point` (Default: 8.5 m)
  - `config.electrical.wire_2_5_m_per_point` (Default: 12.5 m)
  - `config.electrical.wire_4_0_m_per_point` (Default: 22.0 m)
  - `config.electrical.conduit_m_per_point` (Default: 2.6 m)
  - `config.electrical.switch_module_ratio` (Default: 0.75)
- **Plumbing**:
  - `config.plumbing.cpvc_m_per_point` (Default: 4.5 m)
  - `config.plumbing.swr_m_per_point` (Default: 3.5 m)
  - `config.plumbing.riser_m_per_floor` (Default: 12.0 m)
  - `config.plumbing.daily_water_demand_lpcd` (Default: 135 LPCD)
  - `config.plumbing.water_storage_reserve_days` (Default: 1.5 days)
- **Commercial & Markups**:
  - `config.commercial.contractor_margin` (Default: 15% or 10%)
  - `config.commercial.gst_rate` (Default: 18%)
  - `config.commercial.contingency` (Default: 6% or 0%)
  - `config.commercial.professional_fees` (Default: 5% or 0%)
- **Room Dimension Assumptions**:
  - Master Bedroom, Bedroom, Living Room, Dining, Kitchen, Bathroom, Common Toilet, Balcony, Utility, Pooja, Home Office, Store Room.
- **Rates**:
  - 40+ material items and labour rates in `HUTTY_BASELINE_RATES` and `RateOverride`.

---

### 3. New Controls & Enhancements Required in Phase 2E

1. **Simplified 20-Section Client Information Architecture**:
   - Reorganize the fragmented 26-tab menu into the 20 major construction sections specified in Phase 2E (e.g. Project & BUA, Rooms & Spaces, Walls & Masonry, RCC & Structure, Flooring & Tiles, Waterproofing, Paint & Finishes, Doors & Windows, Electrical, Plumbing, Fixtures & Sanitary, Labour, Material Prices, Quality/Specification, Calculation Methods, Commercial & Tax, Recommendations, Report Settings, Test Calculator, Versions & History).
2. **Interactive In-Admin "Test Calculator" (Section 26)**:
   - Dedicated interactive testing console inside Admin allowing the client to input BUA, floors, bedrooms, bathrooms, and specification tier.
   - Runs the **exact canonical production calculation engine**.
   - Displays live quantities (Steel, Cement, Sand, Aggregate, Masonry, Tiles, Paint, Electrical, Plumbing, Labour, Total Cost).
   - Side-by-side **Compare With Active vs Draft** delta inspection (+₹ and +%).
3. **Custom Room Type Creation (`+ Add Room Type`) (Section 7)**:
   - UI enabling the client to add a new room type (Name, Length, Width, Height, Flooring, Wall Finish, Electrical Points, Plumbing Points, Doors, Windows).
   - Automatic propagation of custom rooms into `spaceModel.ts` and downstream calculations.
4. **Bathroom Specialized Control (Section 8)**:
   - Dedicated controls for bathroom length, width, height, dado height, waterproofing height, upturn height, waterproofing method (Floor Only, Floor + Upturn, Floor + Walls), and fixture checkboxes (WC, Wash Basin, Shower, Health Faucet, Floor Drain, Geyser Point).
5. **BUA Calculation Method Selector (Section 6)**:
   - Client choice between: `Manual`, `Room Based`, `Carpet + Circulation`, with simple plain-English explanations.
6. **Expansion of Calculation Method Registry (Section 21)**:
   - Add registered safe methods for Masonry, Electrical, Plumbing, Labour, and Waterproofing (in addition to existing Steel, Paint, Flooring).
7. **Door & Window Master (Section 14)**:
   - Standardized door types (Main, Bedroom, Bathroom, Utility, Other) and window types (Standard, Large, Ventilator, Kitchen, Custom) with dimensions, materials, and rates.
8. **Fixtures & Sanitary Master (Section 17)**:
   - Catalog for Sanitaryware, CP Fittings, Kitchen Sink, Water Tank, Sump, Geyser, Floor Drain, Health Faucet.
9. **Specification / Tier Customization (Section 20)**:
   - Flexible tier management (Standard, Premium, Luxury, + Add Tier such as Budget) with preferred products and rates per trade.
10. **Visual Rule Builder ("Advanced Rules") (Section 22)**:
    - Intuitive `WHEN [Condition] THEN [Action]` builder backed by the existing safe AST evaluator. Zero code, zero JSON.
11. **Admin-Wide Search (Section 29)**:
    - Global search bar allowing instant discovery of settings across all 20 sections (e.g. typing "paint" immediately brings up interior coverage, exterior coverage, coats, rates, wastage).
12. **Contextual Help & Tooltips (Section 30)**:
    - Client-friendly explanation tooltips (`?`) on every key input.
13. **Paint Coverage Conflict Warning Banner (Section 13)**:
    - Prominent friendly warning regarding the 45 vs 60 sqft/L interior paint coverage benchmark.

---

### 4. Controls That Must Remain Code-Controlled

To guarantee safety, system stability, and compliance with statutory engineering codes, the following items **MUST NOT** be exposed to admin control:
1. **Security & Authentication**:
   - JWT secret keys, token expiration, password salt rounds (bcrypt), role authorization logic, session revocation internals.
2. **Database & Infrastructure**:
   - Connection strings, raw SQL queries, Prisma schema migrations, server port and middleware configuration.
3. **Core Mathematical & Geometric Invariants**:
   - Geometric formulas (e.g., $Area = L \times W$, $Perimeter = 2 \times (L + W)$).
   - Unit conversion constants (e.g., $1\text{ m}^3 = 35.3147\text{ CFT}$, $1\text{ Tonne} = 1000\text{ kg}$, $1\text{ m} = 3.28084\text{ ft}$).
   - Material density standards (e.g., Steel density = $7850\text{ kg/m}^3$).
   - Topological dependency graph execution order (BUA $\to$ Space Model $\to$ Quantities $\to$ BOQ $\to$ Cost).
   - Invariance enforcement: Changing a unit price must NEVER alter physical quantities; changing GST must NEVER alter material counts.
4. **Arbitrary Code Execution**:
   - No `eval()`, no `new Function()`, no dynamic JavaScript/TypeScript execution. All conditional logic evaluates through the bounded AST evaluator.

---

### 5. Existing APIs That Can Be Reused

The existing REST API in `server/src/routes/config.routes.ts` and `admin.routes.ts` fully supports the Phase 2E workflow and will be reused without alteration:
- `GET /api/config/active`: Returns current production configuration parameters and version.
- `GET /api/config/versions`: Lists immutable configuration version history.
- `POST /api/config/versions`: Creates a new DRAFT configuration version.
- `GET /api/config/versions/:id`: Fetches specific version details and parameter values.
- `PUT /api/config/versions/:id`: Saves draft parameter modifications with admin change notes.
- `POST /api/config/versions/:id/validate`: Executes server-side parameter bounds and dependency cycle checks.
- `POST /api/config/versions/:id/simulate`: Runs calculation simulation against baseline test cases.
- `POST /api/config/versions/:id/submit-review`: Transitions draft to REVIEW state.
- `POST /api/config/versions/:id/publish`: Atomically activates the version and archives the previous active version.
- `GET /api/config/compare/:a/:b`: Returns detailed parameter diff between two versions.
- `POST /api/config/rollback/:id`: Reverts to an earlier configuration by creating a new forward version.
- `GET /api/admin/rates`, `POST /api/admin/rates/override`, `DELETE /api/admin/rates/override/:id`: Full Rate Master CRUD with audit logging.

---

### 6. Existing Database Models That Can Be Reused

All necessary PostgreSQL tables are already modeled in `prisma/schema.prisma`:
- `CalculationConfigVersion`: Stores version number, lifecycle status (`DRAFT`, `VALIDATED`, `REVIEW`, `PUBLISHED`, `ACTIVE`), metadata, author, and publication timestamp.
- `CalculationConfigParameter`: Stores individual parameter keys, friendly names, category, JSON value, min/max bounds, units, location, tier, and source.
- `CalculationConfigAuditLog`: Immutable audit trail tracking every lifecycle event, parameter edit, oldValue, newValue, and reason.
- `RateOverride` & `RateAuditLog`: Granular price master overrides and financial audit logs.
- `CalculatorConfig`: General calculator configuration parameters.
- `MaterialBrand`, `MaterialProduct`, `MaterialCategory`: Brand catalogs and product tiers.

---

### 7. UI Screens That Need Improvement

1. **Information Architecture & Navigation**:
   - Eliminate developer-centric 26-option dropdown and fragmented sub-tabs.
   - Introduce clean 20-section navigation with cohesive cards, accordions, and tabs.
2. **Terminology & Presentation**:
   - Replace technical keys (e.g. `config.structure.wall_height_ft`, `rcc.steel_base_factor_kg_sqft`) with clean English labels ("Standard Wall Height", "Ground Floor Steel Factor").
   - Remove AST / DAG terminology ("DAG Rules Valid", "AST Node", "Cycle Check") and replace with client-friendly badges ("Rule Verification Passed", "Formulas Verified").
3. **Overview Dashboard**:
   - Modernize the executive view: Active Version, Location, Specification, Draft Changes count, Pending Review counter, and 4 primary CTA buttons (`[Create Draft]`, `[Review Changes]`, `[Preview Calculator]`, `[View History]`).
4. **Room & Spaces Editor**:
   - Add interactive `[+ Add Room Type]` modal.
   - Implement dedicated Bathroom Master with fixture and waterproofing presets.
5. **Interactive Test Calculator**:
   - Build a clean sandbox interface inside Admin for instant calculation verification against active and draft configurations.
6. **Rule Builder**:
   - Replace code/JSON views with a visual `WHEN ... THEN ...` form.

---

### 8. Duplicate Systems Discovered

- **Overlapping Parameter Lists**:
  - `ParametersTab.tsx` defined `CANONICAL_CONSTRUCTION_PARAMETERS`, while `TradeParametersTab.tsx` defined `TRADE_SECTIONS` with overlapping keys and labels.
  - **Resolution**: Unify under a single authoritative parameter dictionary (`CANONICAL_CONSTRUCTION_PARAMETERS`) that feeds both the global search and individual section views.
- **Method Selection Redundancy**:
  - Method selection cards appeared in both `CalculationRulesTab` and trade tabs.
  - **Resolution**: Centralize calculation method management into the dedicated "Calculation Methods" screen (Section 15/21).

---

### 9. Remaining Hardcoded Business Assumptions

1. **Interior Paint Coverage Conflict**:
   - Historical code referenced 45 sqft/L while some benchmark documents reference 60 sqft/L.
   - **Resolution**: Expose prominent confirmation warning in the Paint & Finishes tab: *"Please confirm the approved interior paint coverage (Standard benchmark is 45 sqft/L; high-spread alternative is 60 sqft/L)."*
2. **BUA Calculation Modes**:
   - `bua.ts` currently calculates footprint and floor areas; adding the explicit client option between Manual, Room Based, and Carpet + Circulation provides total planning flexibility.
3. **Specification Packages**:
   - Three tiers (Standard, Premium, Luxury) were historically hardcoded in some wizard states. Phase 2E enables dynamic tier specification.

---

### 10. Recommended Implementation Order

1. **Deliver Audit Report (`ADMIN_CONTROL_EXPANSION_AUDIT.md`)** *(Completed)*.
2. **Create Implementation Plan (`implementation_plan.md`) & Obtain Approval**.
3. **Calculation Method Registry Expansion**:
   - Add safe method definitions in `methodRegistry.ts` for Masonry, Electrical, Plumbing, Labour, and Waterproofing.
4. **Admin Store Enhancements**:
   - Add state and action handlers in `useAdminStore.ts` for:
     - 20-section navigation and global search index.
     - Custom room creation (`addRoomTemplate`, `updateRoomTemplate`).
     - Test calculator simulation and side-by-side comparison.
     - Visual rule builder state.
5. **Client-Friendly UI Redesign**:
   - Create clean, card-based section components for the 20 major areas:
     - `ProjectBuaSection.tsx`
     - `RoomsSpacesSection.tsx` (with custom room modal & bathroom presets)
     - `WallsMasonrySection.tsx`
     - `RccStructureSection.tsx`
     - `FlooringTilesSection.tsx`
     - `WaterproofingSection.tsx`
     - `PaintFinishesSection.tsx` (with 45 vs 60 warning)
     - `DoorsWindowsSection.tsx`
     - `ElectricalSection.tsx`
     - `PlumbingSection.tsx`
     - `FixturesSanitarySection.tsx`
     - `LabourSection.tsx`
     - `MaterialPricesSection.tsx` (enhanced Rate Master)
     - `QualitySpecSection.tsx`
     - `CalculationMethodsSection.tsx`
     - `CommercialTaxSection.tsx`
     - `RecommendationsSection.tsx`
     - `ReportSettingsSection.tsx`
     - `TestCalculatorSection.tsx` (interactive sandbox)
     - `VersionsHistorySection.tsx`
   - Update `AdminPage.tsx` with top-level search, clean navigation header, and unified view.
6. **Automated Verification Suite**:
   - Run existing test suites (guaranteeing 203/203 pass).
   - Add comprehensive Phase 2E acceptance tests covering all 30 items in Section 38.
   - Verify frontend build (`npm run build`) and backend build.
7. **Final Acceptance Deliverable**:
   - Generate `PHASE_2E_ADMIN_CONTROL_REPORT.md`.
