# HUTTY ADMIN PANEL — COMPLETE USER GUIDE
### How to manage construction calculations, pricing, formulas, configuration, testing, and production publishing.

---

## 1. INTRODUCTION

### 1.1 What the Admin Panel Is
The **Hutty Admin Panel** (accessible at `/admin`) is the central control center and configuration management system for the Hutty residential construction estimation platform. It gives quantity surveyors, cost engineers, and platform administrators full administrative authority over the mathematics, material consumption rates, trade benchmarks, unit costs, and commercial additions that power customer-facing construction estimates.

### 1.2 What It Controls
The Admin Panel directly governs:
1. **Architectural & Planning Assumptions**: Ground coverage limits, super built-up area (BUA) multipliers, circulation ratios, room archetypes, and floor height geometry.
2. **Structural & Physical Quantity Calculations**: RCC framing concrete factors, component allocations (footing, column, slab), steel reinforcement thumb rules, and bulk material consumption (cement bags, M-sand, P-sand, coarse aggregates).
3. **Envelope & Finishing Quantities**: Net wall surface areas, blockwork counts, wall thicknesses, floor and wall tile coverage with wastage allowances, waterproofing membrane upturns, and paint spread rates.
4. **Services & Installations**: Electrical wiring runs, modular point circuits, CPVC water supply piping, SWR drainage stacks, and sanitary fixture schedules.
5. **Authoritative Material & Labour Rates**: Base unit rates, location-specific price adjustments (Bengaluru vs. Mysuru), specification tier differentials (Essential, Premium, Luxury), and automated market price proposal workflows.
6. **Commercial Surcharges & Taxes**: Contractor execution margins, architectural/engineering consultancy fees, contingency reserves, and statutory Works Contract GST.
7. **Simulation & Publishing**: In-admin sandbox testing, side-by-side Active vs. Draft impact comparisons, and immutable version publishing.

### 1.3 Who Should Use It
- **Principal Quantity Surveyors (QS)**: To adjust physical consumption benchmarks, concrete allocations, and trade allowances based on structural drawings and site audits.
- **Cost Engineers & Estimators**: To maintain market rates, approve supplier price proposals, and calibrate regional price indices.
- **Operations & Commercial Managers**: To configure contractor execution margins, design fees, and commercial terms.
- **Platform Administrators**: To review system health, manage administrative user accounts, inspect audit trails, and oversee production deployments.

### 1.4 What an Administrator Can Safely Change
The Admin Panel is designed with the philosophy: **"Simple on the surface, powerful underneath."**
- **Safe for Routine Adjustment**: Material unit rates, supplier price overrides, clear wall heights within standard residential limits (9.0 ft to 12.0 ft), standard room dimensions, tile cutting wastage percentages (5% to 15%), paint coverage rates, and contractor margins.
- **Requires Quantity Surveying Verification**: RCC concrete factors (default 0.052 m³/sq.ft), component allocation percentages (footing 22%, column 18%, slab 52%), steel reinforcement factors (2.80 kg/sq.ft base), and BUA calculation methods.
- **Zero Technical Code Execution**: Administrators **never** write JavaScript, Python, or SQL. All formula modifications occur through controlled visual dropdowns, registered variables, and bounded mathematical operators.

### 1.5 Calculation Settings vs. Pricing Settings (The Invariance Rule)
A foundational principle of the Hutty calculation engine is the **strict separation between physical quantity determination and monetary pricing**:

$$\text{Total Item Cost} = \text{Physical Quantity (Engine Output)} \times \text{Unit Rate (Rate Master)}$$

- **Calculation Settings (Physical Domain)**: Governs physical dimensions, areas, volumes, and material takeoffs (e.g., cubic metres of concrete, tonnes of steel, number of AAC blocks, bags of cement, litres of paint). Adjusting a calculation setting changes the physical bill of quantities (BOQ).
- **Pricing Settings (Monetary Domain)**: Governs the unit price in ₹ INR applied to those physical quantities (e.g., ₹5,800/m³ for M25 concrete, ₹68/kg for TMT steel, ₹380/bag for cement).
- **The Invariance Guarantee**: Modifying a unit price or contractor margin **strictly alters cost** and will **NEVER alter physical quantities**. Conversely, changing a structural factor alters quantities without mutating unit rates.

```
┌────────────────────────────────────────┐     ┌──────────────────────────────────────┐
│     CALCULATION SETTINGS (PHYSICAL)    │     │       PRICING SETTINGS (RATES)       │
│ • Concrete Factor (0.052 m³/sq.ft)     │     │ • Ready-Mix M25 Concrete (₹/m³)      │
│ • Rebar Factor (2.80 kg/sq.ft)         │     │ • Fe 550D TMT Steel Rebar (₹/kg)     │
│ • Wall Height (10.0 ft)                │     │ • OPC 53 Grade Cement (₹/bag)        │
│ • Tile Wastage (8.0%)                  │     │ • Turnkey Contractor Margin (15%)    │
└──────────────────┬─────────────────────┘     └──────────────────┬───────────────────┘
                   │                                              │
                   ▼                                              ▼
        PHYSICAL BOQ QUANTITY                           EFFECTIVE UNIT RATE
      (m³, Tonnes, Nos, Bags, L)                             (₹ / Unit)
                   │                                              │
                   └──────────────────────┬───────────────────────┘
                                          │
                                          ▼
                               TOTAL COST = QTY × RATE
```

### 1.6 Draft vs. Active Configurations
- **ACTIVE (Production)**: The immutable configuration currently loaded into the customer-facing calculator (`/planner`), report generation engine, and PDF export system. Customers immediately receive estimates derived from the Active version.
- **DRAFT (Working Sandbox)**: When an administrator changes any slider, dropdown, or numeric input in the Admin Panel, the modification is immediately saved into a **Draft State**. Draft changes exist in an isolated staging space. They are evaluated in the In-Admin Test Calculator and Simulation tabs, but **never** affect customer calculations until explicitly published.

### 1.7 Save Draft vs. Publish to Production
- **Save Draft**: Persists the modified parameters to the PostgreSQL backend (`calculation_config_versions` table with status `DRAFT`). This ensures your work-in-progress survives page refreshes, browser restarts, and handoffs between team members.
- **Publish to Production**: Executes a validated, atomic state transition:
  1. Validates all parameters for safety (no negative numbers, no division by zero, allocations total 100%).
  2. Archives the previous Active version (setting `status = 'ARCHIVED'`).
  3. Promotes the Draft version to `status = 'ACTIVE'`.
  4. Automatically notifies the customer-facing calculation engine to sync the new active parameters.

---

## 2. ADMIN PANEL OVERVIEW & NAVIGATION

The Admin Panel features a top toolbar and a 6-group collapsible navigation system comprising **22 distinct functional sections**:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Overview]  [Basic | Advanced]        [Search Parameter (e.g. Wall Height, Margin)...]          │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
│ 1. Project       │ 2. Construction    │ 3. Services    │ 4. Pricing     │ 5. Calculation │ 6. Report & Sys │
│ • Project & BUA  │ • RCC & Structure  │ • Electrical   │ • Labour       │ • Methods      │ • Report Sett.  │
│ • Rooms & Spaces │ • Steel            │ • Plumbing     │ • Material Rts │ • Formula Lib  │ • Audit Trail   │
│                  │ • Masonry          │ • Sanitaryware │ • Commercial   │ • Test Calc    │ • Analytics     │
│                  │ • Cement & Aggreg. │                │                │ • Versions     │ • Account & Sec │
│                  │ • Flooring         │                │                │ • Simulation   │                 │
│                  │ • Waterproofing    │                │                │                │                 │
│                  │ • Paint & Finishes │                │                │                │                 │
│                  │ • Doors & Windows  │                │                │                │                 │
└──────────────────┴────────────────────┴────────────────┴────────────────┴────────────────┴─────────────────┘
```

### 2.1 Navigation Directory

| Group | Section ID | Label | Purpose | Quantity Impact | Rate Impact | Cost Impact | Publish Required |
|---|---|---|---|:---:|:---:|:---:|:---:|
| **Top** | `overview` | Overview | Executive dashboard of active version, draft status, and system metrics. | No | No | No | No |
| **1. Project** | `project-bua` | Project & BUA | Ground coverage ratio, super BUA multiplier, circulation allowance, and BUA calculation methods. | **Yes** | No | **Yes** | **Yes** |
| **1. Project** | `rooms-spaces` | Rooms & Spaces | Standard room templates (L×W×H), bathroom master parameters, and custom room definitions. | **Yes** | No | **Yes** | **Yes** |
| **2. Construction** | `rcc-structure` | RCC & Structure | Concrete volume factor (m³/sq.ft), footing/column/slab allocation %, and minimum thresholds. | **Yes** | No | **Yes** | **Yes** |
| **2. Construction** | `steel` | Steel | Ground floor rebar factor (kg/sq.ft), upper floor increments, and cutting wastage. | **Yes** | No | **Yes** | **Yes** |
| **2. Construction** | `walls-masonry` | Masonry | Wall height (ft), external/internal thicknesses, block types, and breakage allowances. | **Yes** | No | **Yes** | **Yes** |
| **2. Construction** | `cement-aggregates` | Cement & Aggregates | Overall cement bags/sq.ft, M-sand, P-sand, and 20mm coarse aggregate thumb rules. | **Yes** | No | **Yes** | **Yes** |
| **2. Construction** | `flooring-tiles` | Flooring | Living/bedroom tile wastage %, bathroom anti-skid tile wastage, and staircase granite area. | **Yes** | No | **Yes** | **Yes** |
| **2. Construction** | `waterproofing` | Waterproofing | Bathroom upturn height (mm), terrace multiplier, and underground sump surface area. | **Yes** | No | **Yes** | **Yes** |
| **2. Construction** | `paint-finishes` | Paint & Finishes | Interior/exterior spread rates (sq.ft/L), number of coats, wall putty kg/sq.ft, and spillage %. | **Yes** | No | **Yes** | **Yes** |
| **2. Construction** | `doors-windows` | Doors & Windows | Door dimensions, window dimensions, glazing schedules, and opening deductions. | **Yes** | No | **Yes** | **Yes** |
| **3. Services** | `electrical` | Electrical | Wire length per point (m), concealed PVC conduit (m), and modular plate gang ratios. | **Yes** | No | **Yes** | **Yes** |
| **3. Services** | `plumbing` | Plumbing | CPVC hot/cold water supply pipe per point (m), SWR drainage stacks (m), and LPCD demand. | **Yes** | No | **Yes** | **Yes** |
| **3. Services** | `fixtures-sanitary` | Fixtures & Sanitary | Sanitaryware counts per bathroom, geysers, fixtures, and specification tier bindings. | **Yes** | No | **Yes** | **Yes** |
| **4. Pricing** | `labour` | Labour | Composite civil labour rates (Bengaluru ₹265/sq.ft vs. Mysuru ₹240/sq.ft) and trade wages. | No | **Yes** | **Yes** | **Yes** |
| **4. Pricing** | `material-prices` | Material Prices | Authoritative Unit Rate Master, brand prices, specification tiers, and rate overrides. | No | **Yes** | **Yes** | **Instant / Save** |
| **4. Pricing** | `commercial-tax` | Commercial & Tax | Contractor margin (15%), professional design fees (5%), contingency (3%), and GST (18%). | No | **Yes** | **Yes** | **Yes** |
| **5. Calculation** | `calculation-methods` | Calculation Methods | Switch calculation approaches (e.g. BUA-based vs. Structural Grid) and visual rule builder. | **Yes** | No | **Yes** | **Yes** |
| **5. Calculation** | `formula-library` | Formula Library | Canonical engineering formula library, visual AST tree inspector, and formula builder. | **Yes** | No | **Yes** | **Yes** |
| **5. Calculation** | `test-calculator` | Test Calculator | Interactive sandbox running canonical engine comparing Active vs. Draft with delta breakdown. | No | No | No | No |
| **5. Calculation** | `versions-history` | Version History | Version catalog, immutable release snapshots, system health diagnostics, and 1-click rollback. | **Yes** | **Yes** | **Yes** | **Instant (Rollback)** |
| **5. Calculation** | `simulation` | Simulation / Impact | Pre-publish impact graph, affected BOQ line items, and critical parameter variance alerts. | No | No | No | No |
| **6. Report & Sys** | `report-settings` | Report Settings | Transparency notes, engineering disclaimers, and milestone disbursement milestones. | No | No | No | **Yes** |
| **6. Report & Sys** | `audit` | Audit Trail | Complete historical log of who changed what rate or parameter, previous value, and timestamp. | No | No | No | No |
| **6. Report & Sys** | `analytics` | Analytics | Calculator traffic, step-by-step funnel drop-offs, popular BUA ranges, and CSV data exports. | No | No | No | No |
| **6. Report & Sys** | `account` | Account & Security | Admin password change, email update, active session management, and security audit log. | No | No | No | No |

---

## 3. BASIC VS. ADVANCED MODE

The top toolbar houses the **Basic / Advanced Mode Switcher**:

### 3.1 Basic Mode ("Everyday Builder Settings")
- **Intended Audience**: Estimators, site quantity surveyors, and non-technical administrators.
- **Controls Displayed**: Sliders, simple numeric inputs, percentage steppers, and clear English labels.
- **Safety**: Hides AST logic, variable names, and underlying formula trees.
- **What You See**:
  - Direct values with real-world units (e.g., `0.052 m³/sq.ft`, `10.0 ft`, `15%`).
  - Plain English "What does this affect?" advisory boxes.
  - Interactive scenario readouts (e.g., sample 40×60 plot showing resulting BUA).

### 3.2 Advanced Mode ("Deep Parameters & Logic Rules")
- **Intended Audience**: Principal structural engineers and systems architects.
- **Controls Displayed**:
  - **Visual Abstract Syntax Tree (AST) Cards**: Displays exact formula blocks (e.g., `[ BUA ] × [ Concrete Factor ] = [ Structural Concrete (m³) ]`).
  - **Granular Factors**: Upper floor steel increments, specific gravity ratios, fine/coarse sand separation, and multi-coat putty consumption.
  - **Custom Rule Builder**: IF/THEN logical condition builder (e.g., `IF bathrooms > 3 THEN SET waterproofing_upturn TO 1.25 ft`).
  - **Mathematical Operator Restraints**: Guarantees zero code injection. All formulas use registered operators (`MULTIPLY`, `DIVIDE`, `ADD`, `SUBTRACT`, `PERCENTAGE`, `MIN`, `MAX`, `ROUND`, `CEIL`).

---

## 4. PROJECT & BUILT-UP AREA (BUA) PLANNING

**Navigation**: `Group 1: Project` $\to$ `Project & BUA` (`project-bua`)

This section governs how total built-up area is synthesized from plot dimensions or room schedules.

### 4.1 Implemented Parameters

#### 1. Built-Up Area Calculation Method (`config.planning.bua_method`)
- **Options**:
  - `CARPET_CIRCULATION` (Default): Derives BUA from internal livable carpet area plus hallway, corridor, and wall thickness allowances. Recommended for residential floor plans.
  - `ROOM_BASED`: BUA is calculated directly by summing configured room dimensions (Bedrooms + Living + Kitchen + Bathrooms).
  - `MANUAL`: Calculates BUA by applying maximum ground coverage and super built-up multiplier directly to plot dimensions.
- **Unit**: Discrete Method Selection
- **Affects**: Total Project BUA, structural concrete, steel rebar tonnage, cement bags, total project cost.

#### 2. Ground Coverage Ratio (`config.planning.default_coverage_ratio`)
- **Meaning**: The permissible percentage of the plot area that can be constructed on the ground level under municipal bylaws.
- **Default / Standard**: `0.60` (60% under BBMP / BDA bye-laws).
- **Unit**: `%` (Range: 40% to 85%)
- **Example**: For a 2,400 sq.ft plot (40×60 ft), 60% coverage allows a 1,440 sq.ft ground floor footprint.
- **Affects**: Ground floor plinth area, foundation excavation footprint, footing count.

#### 3. Super Built-Up Multiplier (`config.planning.super_bua_multiplier`)
- **Meaning**: Multiplier converting net plinth area to gross super built-up area, accounting for external wall offsets, columns, and structural shafts.
- **Default / Standard**: `1.15` (15% super built-up loading).
- **Unit**: Ratio (Range: 1.00 to 1.35)
- **Affects**: Final BUA used as the primary multiplier across structural thumb rules.

#### 4. Circulation Allowance (`config.flooring.circulation_allowance_pct`) *(Advanced)*
- **Meaning**: Allowance added to carpet area for interior hallways, lobbies, and door swings.
- **Default**: `10.0%`
- **Unit**: `%` (Range: 5% to 20%)
- **Affects**: Flooring tile areas, internal passage plastering, and skirting running metres.

#### 5. Balcony Allowance (`config.planning.balcony_allowance_pct`) *(Advanced)*
- **Meaning**: Standard allowance for sit-out balconies.
- **Default**: `8.0%`
- **Unit**: `%`

#### 6. Utility Allowance (`config.planning.utility_allowance_pct`) *(Advanced)*
- **Meaning**: Allowance for wet laundry and utility balconies.
- **Default**: `5.0%`
- **Unit**: `%`

#### 7. Staircase Granite Allowance (`config.flooring.staircase_granite_sqft`) *(Advanced)*
- **Meaning**: Cladding area allocated per floor for granite treads, risers, and skirting.
- **Default**: `180.0 sq.ft` per flight.

---

## 5. ROOMS & SPACES CONFIGURATION

**Navigation**: `Group 1: Project` $\to$ `Rooms & Spaces` (`rooms-spaces`)

Configures standard room archetypes, specialized wet-area bathroom controls, and custom room extensions.

### 5.1 Standard Room Templates
The system comes pre-configured with 9 standard residential spaces:

| Room Archetype | Default L (ft) | Default W (ft) | Floor Area | Default Flooring | Electrical Pts | Doors | Windows |
|---|:---:|:---:|:---:|---|:---:|:---:|:---:|
| **Master Bedroom** | 16.0 | 14.0 | 224 sq.ft | Vitrified Tiles (800×1600mm) | 12 | 1 | 2 |
| **Standard Bedroom** | 14.0 | 10.0 | 140 sq.ft | Vitrified Tiles (800×800mm) | 8 | 1 | 1 |
| **Living Room / Main Hall** | 16.0 | 12.5 | 200 sq.ft | Italian Marble / Glazed Vitrified | 16 | 1 | 2 |
| **Dining Room** | 12.0 | 10.0 | 120 sq.ft | Double Charged Vitrified | 6 | 0 | 1 |
| **Kitchen** | 10.0 | 9.0 | 90 sq.ft | Matte Anti-skid Vitrified | 10 | 1 | 1 |
| **Puja Room** | 5.0 | 5.0 | 25 sq.ft | White Marble / Polished Granite | 4 | 1 | 0 |
| **Study / Home Office** | 10.0 | 10.0 | 100 sq.ft | Wooden Laminate / Vitrified | 10 | 1 | 1 |
| **Sit-out Balcony** | 10.0 | 5.0 | 50 sq.ft | Rustic Wooden Ceramic Tiles | 2 | 1 | 0 |
| **Utility / Laundry** | 8.0 | 5.0 | 40 sq.ft | Anti-skid Ceramic Tiles | 4 | 1 | 0 |

### 5.2 Bathroom Master Control
Bathrooms represent the highest cost-density wet area in residential construction. The Admin Panel isolates bathroom parameters into a dedicated master controller:
- **Dimensions**: Length (default 6.0 ft), Width (default 5.0 ft) $\to$ standard 30 sq.ft floor slab.
- **Wall Tile Dado Height (`config.cladding.bathroom_dado_standard_ft`)**:
  - `7 ft` (Standard Lintel Level): Wall tiles extend to 7 feet above finished floor level.
  - `10 ft` (Full Ceiling Height): Wall tiles extend to the slab soffit (common in luxury finishes).
- **Waterproofing Method (`config.waterproofing.bathroom_method`)**:
  - `FLOOR_UPTURN` (Default): Floor slab plus 300mm (1.0 ft) vertical flashing upturn along perimeter brickwork.
  - `FLOOR_ONLY`: Base slab waterproofing only.
  - `FULL_HEIGHT`: Full wall encapsulation for open walk-in showers.
- **Default Fixture Checklist**: Controls default plumbing and sanitary point provisioning:
  - Water Closet (WC), Wash Basin, Overhead Shower, Health Faucet, Floor Drain Trap, Geyser Power Point.

### 5.3 Custom Room Builder
Administrators can create non-standard spaces (e.g., Home Theatre, Gym, Servant Quarters) by clicking **Add Custom Room**. Required fields:
- Room Name, Length (ft), Width (ft), Height (ft).
- Flooring Type, Wall Finish Type.
- Electrical Point Count, Plumbing Point Count, Door Count, Window Count.
*Impact*: Dynamically adjusts net carpet area, masonry wall deductions, plastering surfaces, and finish schedules.

---

## 6. RCC & STRUCTURAL FRAME

**Navigation**: `Group 2: Construction` $\to$ `RCC & Structure` (`rcc-structure`)

Governs reinforced cement concrete (RCC) structural elements: footings, plinth beams, columns, floor beams, slabs, and staircases.

> [!IMPORTANT]
> **Unit Governance Requirement**: RCC structural concrete is ALWAYS presented in **cubic metres ($\text{m}^3$)**. Never convert RCC framing output into sq.ft.

### 6.1 Concrete Calculation Methodology
- **Concrete Calculation Method (`config.rcc.concrete_calculation_method`)**:
  - `BUA_FACTOR` (Default): Evaluates total structural concrete volume as:
    $$\text{Total Structural Concrete } (\text{m}^3) = \text{BUA } (\text{sq.ft}) \times \text{Concrete Factor } (0.052 \text{ m}^3/\text{sq.ft})$$
  - `GEOMETRY_GRID`: Sized using structural column counts, span dimensions, and slab thicknesses.
  - `MANUAL`: Direct volume entry.

### 6.2 Structural Allocation Percentages
The total structural concrete is apportioned across structural sub-assemblies using configurable allocation factors:
1. **Footing Allocation (`config.rcc.footing_allocation_pct`)**: Default **22.0%** of structural concrete.
   - *Minimum Bound (`config.rcc.min_footing_concrete_cum`)*: Default **5.0 m³**.
2. **Column Allocation (`config.rcc.column_allocation_pct`)**: Default **18.0%** of structural concrete.
   - *Minimum Bound (`config.rcc.min_column_concrete_cum`)*: Default **3.0 m³**.
3. **Slab & Beam Allocation (`config.rcc.slab_allocation_pct`)**: Default **52.0%** of structural concrete.
   - *Minimum Bound (`config.rcc.min_slab_concrete_cum`)*: Default **8.0 m³**.
4. **Plinth & Staircase Allocation**: Remaining balance (approximately **8.0%**) accounts for plinth tie beams, staircase waist slabs, and lintels.

### 6.3 Practical RCC Example
For a residential home with **BUA = 2,500 sq.ft**:
- **Total RCC Framing Concrete**: $2,500 \times 0.052 = \mathbf{130.00\text{ m}^3}$
- **Footing Concrete**: $\max(130 \times 22\%, 5.0) = \mathbf{28.60\text{ m}^3}$
- **Column Concrete**: $\max(130 \times 18\%, 3.0) = \mathbf{23.40\text{ m}^3}$
- **Slab & Beam Concrete**: $\max(130 \times 52\%, 8.0) = \mathbf{67.60\text{ m}^3}$
- **Plinth & Staircase**: $130 - (28.60 + 23.40 + 67.60) = \mathbf{10.40\text{ m}^3}$

---

## 7. STEEL REINFORCEMENT (TMT REBAR)

**Navigation**: `Group 2: Construction` $\to$ `Steel` (`steel`)

Governs Fe 550D / Fe 500D high-yield thermo-mechanically treated (TMT) steel reinforcement rebar consumption.

### 7.1 Implemented Parameters
1. **Ground Floor Steel Factor (`config.rcc.steel_base_factor_kg_sqft`)**:
   - *Meaning*: Baseline structural steel required per square foot of BUA for ground level foundation, plinth beams, and columns.
   - *Default*: **2.80 kg/sq.ft** (IS 456 / SP 34 standard for residential G+1/G+2 frames).
   - *Unit*: `kg/sq.ft` (Range: 2.0 to 4.5 kg/sq.ft).
2. **Upper Floor Steel Increment (`config.rcc.steel_additional_floor_factor`)**:
   - *Meaning*: Incremental steel added per additional floor above ground level due to column load accumulation and wind/seismic moments.
   - *Default*: **0.20 kg/sq.ft/floor**.
   - *Formula*:
     $$\text{Effective Steel Factor} = \text{Base Factor} + (\text{Floors} - 1) \times \text{Floor Increment}$$
     $$\text{Total Steel (kg)} = \text{BUA} \times \text{Effective Steel Factor} \times (1 + \text{Wastage \%})$$
     $$\text{Steel (Tonnes)} = \frac{\text{Total Steel (kg)}}{1,000}$$
3. **Cutting & Lapping Wastage (`config.wastage.steel`)**:
   - *Default*: **4.0%** (for bar cut-offs, crank bends, and overlapping splices).

### 7.2 Rate vs. Quantity Separation (Steel Example)
- **Changing Steel Factor ($2.80 \to 3.00\text{ kg/sq.ft}$)**: Physical steel tonnage increases from 7.00 Tonnes to 7.50 Tonnes. This affects material procurement schedules, crane hoisting, and bar bending labour days.
- **Changing Steel Unit Rate ($₹65,000 \to ₹72,000/\text{Tonne}$)**: Physical steel quantity remains **strictly 7.00 Tonnes**. Only the steel line item cost increases from ₹4,55,000 to ₹5,04,000.

---

## 8. CEMENT, SAND & AGGREGATES

**Navigation**: `Group 2: Construction` $\to$ `Cement & Aggregates` (`cement-aggregates`)

Governs bulk civil building materials consumed across structural concrete, masonry mortar, and interior/exterior plastering.

### 8.1 Implemented Parameters

| Parameter | Key | Default Value | Unit | Engineering Basis | Quantity Sizing | Rate Sizing |
|---|---|:---:|:---:|---|---|---|
| **Structural Cement Factor** | `config.material.cement_bags_per_sqft` | **0.40** | bags/sq.ft | CPWD Works Manual thumb rule for M20/M25 concrete framing. | $\text{BUA} \times 0.40 \times (1 + \text{Wastage})$ | Cement Unit Rate (₹/bag) |
| **Cement Handling Wastage** | `config.wastage.cement` | **3.0%** | % | Bag burst, transport tearing, and godown setting. | Adds extra bags | Included in purchase cost |
| **Manufactured Sand (M-Sand)** | `config.material.m_sand_cft_per_sqft` | **0.60** | CFT/sq.ft | Zone-II coarse manufactured sand for concrete framing. | $\text{BUA} \times 0.60$ CFT | M-Sand Rate (₹/CFT) |
| **Plastering Sand (P-Sand)** | `config.material.p_sand_cft_per_sqft` | **0.60** | CFT/sq.ft | Fine washed manufactured sand for smooth 2-coat plaster. | $\text{BUA} \times 0.60$ CFT | P-Sand Rate (₹/CFT) |
| **Coarse Aggregate (20mm)** | `config.material.coarse_aggregate_cft_per_sqft` | **1.35** | CFT/sq.ft | Crushed angular blue metal granite stone aggregate for concrete. | $\text{BUA} \times 1.35$ CFT | Aggregate Rate (₹/CFT) |

---

## 9. WALLS & MASONRY (BLOCKWORK)

**Navigation**: `Group 2: Construction` $\to$ `Masonry` (`walls-masonry`)

> [!CRITICAL]
> **Customer Unit Governance Rule**: Blocks and masonry must **NEVER be presented to the customer or on the PDF report as cubic metres ($\text{m}^3$)**.
> The customer-facing report must strictly display:
> 1. **Net Wall Area** $\to$ `sq.ft`
> 2. **Block Wall Coverage** $\to$ `sq.ft`
> 3. **Blocks Required** $\to$ `Nos.`

### 9.1 Implemented Parameters
1. **Standard Wall Height (`config.structure.wall_height_ft`)**:
   - *Meaning*: Floor-to-ceiling clear vertical wall height.
   - *Default*: **10.0 ft** (NBC 2016 standard).
   - *Affects*: Gross wall area, AAC block counts, internal/external plaster areas, and interior wall paint coverage.
2. **Primary Masonry Material (`config.masonry.type`)**:
   - `AAC_BLOCK` (Default): Autoclaved Aerated Concrete blocks (600×200×150mm).
   - `CONCRETE_BLOCK`: Solid concrete blocks (400×200×150mm).
   - `RED_BRICK`: Traditional wire-cut red clay bricks.
3. **External Wall Thickness (`config.masonry.external_wall_thickness_m`)**:
   - *Default*: **0.15 m** (6 inches).
   - *Options*: `0.15m` (6"), `0.20m` (8"), `0.23m` (9" brick wall).
4. **Internal Wall Thickness (`config.masonry.internal_wall_thickness_m`)**:
   - *Default*: **0.10 m** (4 inches).
   - *Options*: `0.10m` (4"), `0.115m` (4.5" half-brick), `0.15m` (6").
5. **Masonry Breakage & Cutting Wastage (`config.wastage.masonry`)**:
   - *Default*: **5.0%** (for cutting around conduits, lintels, and chases).

### 9.2 Internal Mechanics vs. Customer Output
- **Engine Internal Calculation**: The engine internally computes:
  $$\text{Net Wall Area (sq.ft)} = \text{Gross Wall Area} - (\text{Door Openings} + \text{Window Openings})$$
  $$\text{Net Wall Volume (m}^3) = \text{Net Wall Area (m}^2) \times \text{Wall Thickness (m)}$$
  $$\text{Discrete Block Count (Nos.)} = \frac{\text{Net Wall Volume}}{\text{Unit Block Volume (0.018 m}^3)} \times (1 + \text{Wastage})$$
- **Customer Presentation**: The technical volume ($\text{m}^3$) remains strictly internal. The customer report shows:
  - *Net Wall Area*: **4,850 sq.ft**
  - *Block Wall Coverage*: **4,850 sq.ft**
  - *Blocks Required*: **2,450 Nos.**

---

## 10. FLOORING & FINISHES

**Navigation**: `Group 2: Construction` $\to$ `Flooring` (`flooring-tiles`)

Governs floor tiles, wall cladding tiles, staircase granite, and skirting allowances.

### 10.1 Implemented Parameters
1. **Living & Bedroom Tile Wastage (`config.wastage.flooring` / `flooring.tile_wastage_percent`)**:
   - *Meaning*: Cutting wastage, perimeter borders, and diagonal alignment losses for vitrified tiles.
   - *Default*: **8.0%**.
   - *Unit*: `%` (Range: 4% to 15%).
2. **Bathroom Anti-Skid Tile Wastage (`flooring.bathroom_tile_wastage_percent`)**:
   - *Meaning*: Cutting wastage around sunken traps, floor drains, and sanitary corners.
   - *Default*: **8.0%**.
3. **Staircase Granite Cladding Allowance (`flooring.staircase_granite_allowance_sqft`)**:
   - *Meaning*: Granite surface area allocated per flight for treads, risers, and side bull-nosed skirting.
   - *Default*: **180 sq.ft** per flight.
4. **Circulation Factor (`config.flooring.circulation_allowance_pct`)**:
   - *Default*: **10.0%** added to bedroom/living room carpet area to cover hallways and corridors.

---

## 11. WATERPROOFING

**Navigation**: `Group 2: Construction` $\to$ `Waterproofing` (`waterproofing`)

Governs elastomeric and cementitious chemical waterproofing membranes across wet sunken slabs, roof terraces, and underground water sumps.

### 11.1 Implemented Parameters
1. **Bathroom Upturn Skirting Height (`waterproofing.bathroom_upturn_height_mm`)**:
   - *Meaning*: Mandatory vertical waterproofing barrier height coated up the brickwork from the sunken slab.
   - *Default*: **300 mm (1.0 ft)** (Fosroc / Dr. Fixit standard).
   - *Affects*: Wet-area membrane surface area; guarantees protection against capillary moisture seepage into adjacent bedroom walls.
2. **Terrace Waterproofing Factor (`waterproofing.terrace_multiplier`)**:
   - *Meaning*: Multiplier applied to roof terrace area to account for parapet wall upturns (300mm) and rainwater gully drainage slopes.
   - *Default*: **1.15x** (15% additional area over flat slab footprint).
3. **Underground Sump Waterproofing Area (`waterproofing.sump_surface_sqft`)**:
   - *Meaning*: Food-grade epoxy/cementitious waterproofing membrane applied across the base slab and vertical retaining walls of the underground water tank.
   - *Default*: **180 sq.ft**.

---

## 12. PAINT & SURFACE FINISHES

**Navigation**: `Group 2: Construction` $\to$ `Paint & Finishes` (`paint-finishes`)

Governs interior acrylic emulsion, exterior weatherproof paint, wall putty undercoats, and primer.

### 12.1 Implemented Parameters
1. **Interior Paint Coverage (`config.paint.interior_coverage_sqft_per_litre`)**:
   - *Meaning*: Wall area covered per litre of interior paint for 2 coats over prepared wall putty.
   - *Approved Benchmark*: **45.0 sq.ft / Litre**.
   - > [!WARNING]
     > **Critical Conflict Note**: The Admin Panel alerts administrators that standard residential benchmarks require **45 sq.ft/L** (2 coats over putty), whereas some high-spread luxury emulsions claim **60 sq.ft/L**. Always maintain **45.0 sq.ft/L** for realistic estimating.
2. **Exterior Weatherproof Coverage (`config.paint.exterior_coverage_sqft_per_litre`)**:
   - *Meaning*: Spread rate for exterior acrylic weatherproof emulsion on exterior sand-faced plaster.
   - *Default*: **60.0 sq.ft / Litre**.
3. **Wall Putty Consumption (`config.paint.putty_kg_per_sqft`)**:
   - *Meaning*: Two-coat white cement-based wall putty consumption applied prior to primer.
   - *Default*: **0.55 kg / sq.ft**.
4. **Number of Interior Coats (`config.paint.interior_coats`)**:
   - *Options*: `1` (Primer/touch-up), `2` (Standard Finish — Default), `3` (Luxury High Sheen).
5. **Paint Spillage & Wastage (`config.wastage.paint`)**:
   - *Default*: **10.0%** (roller absorption, edge cutting, container residue).

---

## 13. DOORS & WINDOWS

**Navigation**: `Group 2: Construction` $\to$ `Doors & Windows` (`doors-windows`)

Governs fenestration sizing, opening deductions, and frame/shutter material allowances.

### 13.1 Implemented Controls
- **Main Door**: African Teak wood frame with carved solid wood shutter ($3.5 \times 7.0\text{ ft} = 24.5\text{ sq.ft}$).
- **Internal Room Doors**: Hardwood Sal-wood frame with waterproof flush shutter ($3.0 \times 7.0\text{ ft} = 21.0\text{ sq.ft}$).
- **Toilet Doors**: Waterproof FRP / WPC doors ($2.5 \times 7.0\text{ ft} = 17.5\text{ sq.ft}$).
- **Windows**: 3-track sliding UPVC windows with mosquito mesh ($5.0 \times 4.0\text{ ft} = 20.0\text{ sq.ft}$).
- **Opening Deductions**: Every added door and window automatically deducts its surface area from the gross wall area, reducing AAC block counts, plastering area, and paint quantities.

---

## 14. SERVICES: ELECTRICAL & PLUMBING

**Navigation**: `Group 3: Services` $\to$ `Electrical` (`electrical`) & `Plumbing` (`plumbing`)

> [!NOTE]
> **Equal Hierarchy Rule**: Electrical and Plumbing are treated as equal peers under the **Services & Installations** category. Electrical no longer receives standalone or disconnected reporting treatment.

### 14.1 Electrical Conduiting & Wiring
1. **Light Point Wiring (`config.electrical.wire_1_5_m_per_point`)**:
   - *Standard*: **8.5 metres** of 1.5 sq.mm FRLS copper wire per point.
2. **Socket Point Wiring (`config.electrical.wire_2_5_m_per_point`)**:
   - *Standard*: **12.5 metres** of 2.5 sq.mm wire per power socket.
3. **Power / AC / Geyser Run**:
   - *Standard*: **22.0 metres** of 4.0 sq.mm dedicated home-run circuit wire.
4. **Concealed Conduit Piping (`electrical.conduit_length_per_point_m`)**:
   - *Standard*: **3.5 metres** of heavy-duty 25mm PVC conduit embedded in slabs and brick chases per point.
5. **Modular Gang Plate Ratio (`electrical.switch_module_ratio`)**:
   - *Standard*: **1.25x** multiplier on modular gang boxes for automation expansion.

### 14.2 Plumbing & Water Supply
1. **Water Supply Lines (`plumbing.cpvc_length_per_point_m`)**:
   - *Standard*: **3.5 metres** of concealed SDR-11 CPVC hot/cold pipe per plumbing point.
2. **Drainage Lines (`plumbing.swr_length_per_point_m`)**:
   - *Standard*: **4.0 metres** of PVC SWR drainage pipe allocated per sanitary trap.
3. **Per Capita Water Demand (`plumbing.water_demand_lpcd`)**:
   - *Standard*: **135 Litres per Capita per Day (LPCD)** (IS 1172 residential standard). Sump and overhead tank storage capacities scale with this factor.

---

## 15. SANITARYWARE & FIXTURES

**Navigation**: `Group 3: Services` $\to$ `Fixtures & Sanitary` (`fixtures-sanitary`)

Governs bathroom fixtures and kitchen fittings. Quantities are calculated directly from room and bathroom counts:

$$\text{WC Units (Nos.)} = \text{Bathroom Count}$$
$$\text{Wash Basins (Nos.)} = \text{Bathroom Count} + 1 \text{ (Dining Wash Basin)}$$
$$\text{Overhead Showers (Nos.)} = \text{Bathroom Count}$$
$$\text{Kitchen Sinks (Nos.)} = \text{Kitchen Count}$$

- **Specification Tier Mapping**:
  - *Essential*: Parryware / Cera standard sanitaryware, chrome-plated continental faucets.
  - *Premium*: Kohler / Jaquar rimless wall-hung WCs, concealed diverters, single-lever basin mixers.
  - *Luxury*: Toto / Grohe smart toilets, thermostatic rain showers, designer vanity counters.

---

## 16. LABOUR CONFIGURATION

**Navigation**: `Group 4: Pricing` $\to$ `Labour` (`labour`)

Governs civil and trade labour wage rates.

### 16.1 Implemented Controls
1. **Bengaluru Composite Civil Labour Rate (`labour.bengaluru_civil_composite_rate_sqft`)**:
   - *Default*: **₹265 / sq.ft BUA**.
   - *Covers*: Complete civil works: excavation, footing casting, column raising, bar bending, shuttering/scaffolding, blockwork masonry, and interior/exterior plastering.
2. **Mysuru Composite Civil Labour Rate (`labour.mysuru_civil_composite_rate_sqft`)**:
   - *Default*: **₹240 / sq.ft BUA** (reflecting regional wage benchmarks).
3. **Painting Trade Labour (`labour.painting_trade_rate_sqft`)**:
   - *Default*: **₹16 / sq.ft** of wall/ceiling surface area (includes 2 coats putty sanding, 1 coat primer, 2 coats paint).

---

## 17. MATERIAL PRICING & RATE MASTER

**Navigation**: `Group 4: Pricing` $\to$ `Material Prices` (`material-prices`)

The Authoritative Construction Rate Master controls all monetary unit rates applied across Bengaluru and Mysuru.

### 17.1 Rate Precedence Hierarchy
When the calculation engine resolves the unit price for any BOQ item, it follows a strict **9-tier resolution priority** defined in `rateService.ts`:

```
1. Active Exact Override (rateId + Selected Package + Selected Location)
   ↓
2. Active Package Override (rateId + Selected Package + ALL Locations)
   ↓
3. Active Location Override (rateId + ALL Packages + Selected Location)
   ↓
4. Active Global Override (rateId + ALL Packages + ALL Locations)
   ↓
5. Package + Location Baseline
   ↓
6. Package-Specific Baseline
   ↓
7. Location-Specific Baseline
   ↓
8. Hutty Baseline Rate Dataset (HUTTY_BASELINE_RATES)
   ↓
9. Immutable Safe Fallback (Non-zero numeric default)
```

### 17.2 Searching, Filtering & Overriding Rates
- **Search Bar**: Instant filter by material name or item ID (e.g., `steel.tata_tiscon`, `cm-ultratech`).
- **Category Filter**: Filter by trade (Steel, Cement, Sand, Aggregate, Masonry, Flooring, Paint, Plumbing, Electrical, Labour).
- **Location Filter**: Bengaluru vs. Mysuru.
- **Package Filter**: Standard vs. Premium vs. Luxury.
- **Override Filter**: View All Rates, Active Overrides Only, or Baseline Defaults Only.

### 17.3 Overriding a Rate (Step-by-Step)
1. Locate the item in the table (e.g., `steel.fe550d_tmt` at ₹68.00/kg).
2. Click **Edit**.
3. In the modal:
   - Select Package Tier: `ALL` (Global) or specific tier (`PREMIUM`).
   - Select Location: `ALL` or specific city (`Bangalore`).
   - Enter Override Rate (e.g., `72.00`).
   - Enter Reason for Audit (e.g., *"Steel price surge per SAIL market bulletin"*).
4. Click **Save Rate Override**.
5. The row immediately updates to display a green effective price badge and an amber `Overridden` tag.
6. To restore the company standard baseline, click **Reset**.

### 17.4 Auto Price Updates (Market Index & AI Proposals)
Clicking **Auto Update Prices** (`price-update`) opens the market rate proposal intake dashboard:
- Providers: `market_index` (Government works index / BAI) and `ai_assisted` (Market intelligence scraper).
- Trigger Run: Click **Run Price Update** for all materials or a specific category.
- Reviewing Proposals: The dashboard lists proposed rates with current price, proposed price, difference %, and confidence score.
- Decision: Click **Approve** (applies override instantly), **Reject**, or use checkboxes for **Bulk Approve**.

---

## 18. COMMERCIAL MARGINS & TAXES

**Navigation**: `Group 4: Pricing` $\to$ `Commercial & Tax` (`commercial-tax`)

Governs markups applied to the direct construction works subtotal to produce the final customer budget.

### 18.1 Implemented Parameters
1. **Contractor Execution Margin (`config.commercial.contractor_margin`)**:
   - *Default*: **15.0%** (Toggleable on/off via `margin_enabled`).
   - *Meaning*: General contractor corporate overhead, site supervision, equipment depreciation, and profit margin.
2. **Statutory Works Contract GST (`config.commercial.gst_rate`)**:
   - *Default*: **18.0%** (Toggleable on/off via `gst_enabled`).
   - *Meaning*: Goods and Services Tax applicable to composite residential works contracts in India.
3. **Contingency Provision (`config.commercial.contingency`)**:
   - *Default*: **0.0%** to **3.0%**. Reserve buffer for unexpected soil/site variations.
4. **Professional Consultancy Fees (`config.commercial.professional_fees`)**:
   - *Default*: **0.0%** to **5.0%**. Architectural design, structural analysis drawings, and municipal liaison.

---

## 19. SPECIFICATION TIERS (PACKAGES)

Hutty provides 3 distinct quality packages: **Essential**, **Premium**, and **Luxury**.

### 19.1 What Specification Tiers Affect (and Do NOT Affect)
- **AFFECTED (Materials, Brands & Rates)**:
  - Vitrified tile specifications (₹65/sq.ft in Essential $\to$ ₹115/sq.ft in Premium $\to$ ₹280/sq.ft Italian Marble in Luxury).
  - Sanitaryware brands (Parryware in Essential $\to$ Kohler in Premium $\to$ Toto in Luxury).
  - Electrical switches (Anchor Roma in Essential $\to$ Schneider Opale in Premium $\to$ Legrand Arteor in Luxury).
  - Paint grade (Tractor Emulsion in Essential $\to$ Apcolite Premium in Premium $\to$ Royale Luxury in Luxury).
- **NOT AFFECTED (Physical Structural Quantities)**:
  - Foundation concrete volume, column sizing, slab thicknesses, and steel rebar engineering remain constant for a given building geometry regardless of package tier.

---

## 20. FORMULA SYSTEM V2 & CALCULATION METHODS

**Navigation**: `Group 5: Calculation` $\to$ `Calculation Methods` (`calculation-methods`) & `Formula Library` (`formula-library`)

Formula System V2 empowers administrators to inspect and adjust engineering methodologies without programming.

### 20.1 Formula Architecture: Parameter vs. Variable vs. Formula vs. Method
- **Variable**: A dynamic calculation input derived from project geometry (e.g., `builtUpArea`, `floors`, `netWallArea`, `bathrooms`).
- **Parameter**: A configurable coefficient set by the administrator (e.g., `0.052 m³/sq.ft`, `2.80 kg/sq.ft`).
- **Formula**: The mathematical relationship combining variables and parameters (e.g., `builtUpArea × concrete_factor = structural_concrete`).
- **Method**: The macro calculation approach selected for that domain (e.g., `BUA_FACTOR` vs. `GEOMETRY_GRID`).

### 20.2 Controlled Allowlist Variables (`CONTROLLED_VARIABLE_REGISTRY`)
Only registered, sanitized engineering variables can be referenced in formulas:
- **Area Variables**: `builtUpArea` (sq.ft), `groundFloorArea` (sq.ft), `totalWallArea` (sq.ft), `netWallArea` (sq.ft), `carpetArea` (sq.ft), `roofArea` (sq.ft), `perimeterLength` (ft).
- **Storeys & Elements**: `floors` (Nos), `columnCount` (Nos), `footingCount` (Nos), `doorCount` (Nos), `windowCount` (Nos).
- **Rooms & Points**: `bedrooms` (Nos), `bathrooms` (Nos), `kitchens` (Nos), `livingRooms` (Nos), `totalElectricalPoints` (Nos), `totalPlumbingPoints` (Nos).

### 20.3 Safe Controlled Operators (`CONTROLLED_OPERATORS`)
All mathematical evaluations use AST nodes restricted to:
- `MULTIPLY` (`×`): Multiplication.
- `DIVIDE` (`÷`): Division (with automated divide-by-zero protection).
- `ADD` (`+`): Addition.
- `SUBTRACT` (`-`): Subtraction.
- `PERCENTAGE` (`%`): Percentage allocation (`val × pct ÷ 100`).
- `MIN` / `MAX`: Floor and ceiling bounding.
- `ROUND` / `CEIL`: Decimal rounding and integer ceiling.

### 20.4 Canonical Formula Library Domains

| Domain | Formula Name | Main Inputs | Output | Unit | Primary Affect |
|---|---|---|---|:---:|---|
| **RCC** | Structural Concrete Volume | `builtUpArea`, `concrete_factor` | Concrete Volume | $\text{m}^3$ | Structural BOQ, RMC pouring, formwork |
| **RCC** | Footing Concrete | `structural_concrete`, `footing_allocation_pct` | Footing Concrete | $\text{m}^3$ | Foundation BOQ, excavation |
| **RCC** | Column Concrete | `structural_concrete`, `column_allocation_pct` | Column Concrete | $\text{m}^3$ | Column shuttering, rebar tying |
| **RCC** | Slab & Beam Concrete | `structural_concrete`, `slab_allocation_pct` | Slab Concrete | $\text{m}^3$ | Suspended slab formwork |
| **STEEL** | Structural Reinforcement | `builtUpArea`, `floors`, `steel_base`, `floor_incr` | Rebar Tonnage | Tonnes | TMT steel lines, bar bending |
| **CEMENT** | Total Cement Bags | `builtUpArea`, `cement_bags_per_sqft` | Cement Consumption | Bags | Godown supply schedule |
| **MASONRY** | Block Consumption | `netWallArea`, `wall_thickness`, `unit_volume` | Discrete Blocks | Nos. | Masonry BOQ, joint mortar |
| **FLOORING** | Vitrified Tile Area | `carpetArea`, `circulation_pct`, `wastage_pct` | Tiling Surface | sq.ft | Floor tile BOQ, tile adhesive |
| **WATERPROOFING** | Wet Area Membrane | `bathrooms`, `upturn_height`, `roofArea` | Waterproofing Area | sq.ft | Chemical application, ponding test |
| **PAINT** | Interior Emulsion | `netWallArea`, `coverage_sqft_per_litre` | Interior Paint | Litres | Paint procurement, putty bags |
| **ELECTRICAL** | Circuit Wiring | `totalElectricalPoints`, `wire_m_per_point` | Wiring Length | Metres | Wire coil boxes, conduit piping |
| **PLUMBING** | Piping Infrastructure | `totalPlumbingPoints`, `cpvc_m`, `swr_m` | Pipe Length | Metres | CPVC water lines, SWR stacks |
| **COMMERCIAL** | Contractor Margin & GST | `baseBOQ`, `margin_rate`, `gst_rate` | Final Project Cost | ₹ INR | Customer payment plan, report |

---

## 21. TEST CALCULATOR & SANDBOX

**Navigation**: `Group 5: Calculation` $\to$ `Test Calculator` (`test-calculator`)

The Test Calculator is an interactive simulation sandbox that executes the real production calculation engine (`runCalculator()`) in memory, providing an instant side-by-side comparison between **Active Production** and your **Unpublished Draft**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TEST PROJECT BENCHMARK:  BUA: 2,160 sq.ft | Floors: G+1 | Beds: 3 | Baths: 3 | Premium │
└────────────────────────────────────────────────────────────────────────────────────────┘
│ CURRENT ACTIVE TOTAL    │ DRAFT SIMULATED TOTAL │ IMPACT DIFFERENCE (DELTA)            │
│ ₹48,45,200 (₹2,243/sqft)│ ₹50,12,800 (₹2,320/sqft)│ +₹1,67,600 (+3.5%)                  │
└─────────────────────────┴───────────────────────┴──────────────────────────────────────┘
```

### 21.1 Quantity vs. Price Transparency Table
The Test Calculator breaks down every trade line to explicitly reveal whether a cost shift is caused by a **Physical Quantity Change** or a **Financial Rate Change**:

| Trade Item | Active Qty | Draft Qty | Qty Change? | Active Cost | Draft Cost | Cost Delta | Primary Driver |
|---|---:|---:|:---:|---:|---:|---:|---|
| **Footing Concrete (M25)** | 24.71 m³ | 28.08 m³ | **Changed (+3.37 m³)** | ₹1,43,318 | ₹1,62,864 | +₹19,546 | Footing Allocation Change |
| **Column Concrete (M25)** | 20.22 m³ | 20.22 m³ | No Change | ₹1,17,276 | ₹1,17,276 | ₹0 | Invariant |
| **Slab & Beam Concrete** | 58.41 m³ | 58.41 m³ | No Change | ₹3,38,778 | ₹3,38,778 | ₹0 | Invariant |
| **TMT Steel Rebar** | 6.78 Tonnes | 6.78 Tonnes | No Change | ₹4,61,040 | ₹4,88,160 | +₹27,120 | **Rate Change Only (₹68 $\to$ ₹72/kg)** |
| **AAC Blocks (6")** | 2,140 Nos | 2,140 Nos | No Change | ₹1,49,800 | ₹1,49,800 | ₹0 | Invariant |
| **Total Project Cost** | — | — | — | **₹48,45,200** | **₹50,12,800** | **+₹1,67,600** | Net Production Impact |

---

## 22. DRAFT PERSISTENCE, PUBLISHING & ROLLBACK

### 22.1 The Draft Lifecycle & Auto-Persistence
1. **Making Changes**: As soon as you adjust any parameter, the top of the Admin Panel displays the **Unpublished Draft Banner**.
2. **Debounced Backend Persistence (800ms)**: The Admin store debounces your input and automatically sends a `PUT` request to `/api/v1/admin/config/versions/:id`.
3. **Survives Browser Restart**: Because the draft is persisted in the PostgreSQL database (`calculation_config_versions` with status `DRAFT`), closing your browser, refreshing the page, or switching computers preserves your changes intact.
4. **Draft Backend ID**: The banner displays the persistent server draft ID (e.g., `draft-7f8a9e21...`).

### 22.2 The Complete Production Publishing Flow

```
[Administrator Modifies Parameter]
                │
                ▼
   [Debounced Auto-Save to Backend Draft]
                │
                ▼
      [Automated Validation Gate]
      (Checks: Non-negative, finite numbers, allocation bounds)
                │
                ▼
     [Test Calculator & Impact Simulation]
      (Verify Active vs Draft quantities & cost delta)
                │
                ▼
    [Click "Publish to Production"]
                │
                ▼
   [Backend Atomically Promotes Draft to ACTIVE]
   (Archives previous ACTIVE, creates immutable release snapshot)
                │
                ▼
 [Customer Calculator & Report Resolver Synced]
 (Public /api/v1/config/active delivers published parameters)
```

> [!CAUTION]
> **Typing into Admin does NOT make it live!** Entering a value into an input field or slider only modifies the Draft. Changes **never** reach customer estimates until the **Publish to Production** button is successfully clicked.

### 22.3 Immutable Version History & 1-Click Rollback
**Navigation**: `Group 5: Calculation` $\to$ `Version History` (`versions-history`)

Every published configuration is preserved forever as an **immutable snapshot**:
- **ACTIVE**: The currently running production version.
- **ARCHIVED**: Historical configurations that were previously active.
- **Rollback Procedure**:
  1. Open **Version History**.
  2. Locate the historical version you wish to restore (e.g., `v2.4-PROD`).
  3. Click **Rollback to this Version**.
  4. Confirm the modal prompt.
  5. The system creates a **NEW active version** containing the exact parameter snapshot of the historical version. Historical versions are never mutated or deleted.
  6. The customer calculator immediately reverts to the rolled-back configuration.

---

## 23. STEP-BY-STEP PRACTICAL TUTORIALS

### Tutorial 1: Changing RCC Footing Concrete Allocation
- **Goal**: Increase footing concrete allocation from 22% to 25% following a geotechnical recommendation for soft clay soil.
- **Steps**:
  1. Open Admin Panel $\to$ Select `Group 2: Construction` $\to$ Click `RCC & Structure`.
  2. Locate **Footing Allocation** in the basic controls.
  3. Adjust the slider or numeric box from `22` to `25%`.
  4. Notice the Unpublished Draft Banner appears at the top: *"Unpublished Draft: 1 parameter modified"*.
  5. Click **Test Calculator** on the banner.
  6. Review the comparison: Footing Concrete increases by $\approx +3.9\text{ m}^3$, while Column and Slab concrete remain invariant.
  7. Click **Publish to Production**. Enter change summary: *"Increased footing allocation to 25% for soft soil foundations"*.
  8. Click Confirm. The banner disappears, and production version updates to Active.

### Tutorial 2: Changing the Reinforcement Steel Factor
- **Goal**: Increase ground floor baseline steel factor from 2.80 kg/sq.ft to 3.00 kg/sq.ft.
- **Steps**:
  1. Navigate to `Group 2: Construction` $\to$ `Steel`.
  2. Under **Steel Quantity Factor (Ground Floor)**, adjust value to `3.00`.
  3. Navigate to `Group 5: Calculation` $\to$ `Simulation / Impact`.
  4. Click **Simulate Changes**.
  5. Inspect the Physical Quantity Impact card: Steel Tonnes increases by $+0.48\text{ Tonnes}$ ($+7.1\%$).
  6. Verify that concrete volume and wall area have **0% change**.
  7. Click **Publish to Production**.

### Tutorial 3: Overriding a Material Price (TMT Steel Price Spike)
- **Goal**: Update TMT Steel unit rate from ₹68/kg to ₹72/kg due to local market inflation.
- **Steps**:
  1. Navigate to `Group 4: Pricing` $\to$ `Material Prices`.
  2. In the search box, type `steel` or item ID `steel.fe550d_tmt`.
  3. Click **Edit** on the steel rebar row.
  4. In the modal:
     - Set Package: `ALL`.
     - Set Location: `Bangalore`.
     - Enter Override Rate: `72.00`.
     - Enter Reason: *"Weekly steel market price revision"*.
  5. Click **Save Rate Override**.
  6. Navigate to **Test Calculator**. Notice: Physical steel tonnage is **identical**, but Steel Cost has increased by $+₹27,120$.

### Tutorial 4: Approving an Automated Supplier Price Proposal
- **Goal**: Review and accept an automated market index proposal for cement.
- **Steps**:
  1. Navigate to `Group 4: Pricing` $\to$ `Material Prices` $\to$ Click **Auto Update Prices**.
  2. Locate pending proposal for `cement.opc53_grade` (Current: ₹380, Proposed: ₹395, $+3.9\%$).
  3. Click **Approve**.
  4. The proposal status shifts to `APPROVED`, and a rate override is automatically recorded in the Rate Master.

### Tutorial 5: Updating Turnkey Contractor Execution Margin
- **Goal**: Calibrate contractor overhead margin from 15% to 14%.
- **Steps**:
  1. Navigate to `Group 4: Pricing` $\to$ `Commercial & Tax`.
  2. Locate **Contractor Execution Margin**.
  3. Adjust slider from `15%` to `14%`.
  4. Open **Test Calculator**.
  5. Verify: All physical material quantities (concrete m³, steel tonnes, cement bags, blocks) display **No Change**. Only the commercial overhead line item and total project cost reflect the 1% reduction.
  6. Click **Publish to Production**.

### Tutorial 6: Rolling Back a Problematic Configuration
- **Goal**: Undo a published configuration that accidentally caused excessive concrete sizing.
- **Steps**:
  1. Navigate to `Group 5: Calculation` $\to$ `Version History`.
  2. Review the list of published versions.
  3. Find the previous stable release (e.g., `v2.5-PROD - Approved production baseline`).
  4. Click **Rollback to this Version**.
  5. Read the confirmation modal: *"This action creates a NEW active version containing the parameters of version v2.5-PROD"*.
  6. Click **Confirm Rollback**.
  7. Production engine immediately rolls back.

---

## 24. WHAT NOT TO CHANGE (SENSITIVE PARAMETERS)

The following parameters have deep mathematical interdependencies throughout the engine. **Do not modify without structural engineering peer review**:

1. **Concrete Volume Factor (`config.rcc.concrete_factor_cum_sqft` = 0.052)**:
   - *Why sensitive*: Sizes the entire monolithic concrete envelope. Increasing this above 0.065 will severely overestimate concrete costs, causing customer quote rejection. Reducing below 0.040 violates minimum Indian Standard structural requirements.
2. **Component Allocations Totaling Other Than 100%**:
   - *Footing (22%) + Column (18%) + Slab (52%) + Plinth/Stairs (8%) = 100%*.
   - *Why sensitive*: If allocations exceed 100%, individual sub-assemblies will sum to more concrete than the structural envelope. If under 100%, unallocated concrete quantities will result in unexplained budget gaps.
3. **External Wall Thickness (`0.15m` / 6 inches)**:
   - *Why sensitive*: Drives opening deduction geometry and net room carpet area calculations. Changing this arbitrarily alters room floor boundaries across drawings.
4. **Controlled Operators or Variable Keys**:
   - *Why sensitive*: The formula evaluator relies on strict allowlists. Introducing unauthorized variable names will cause the validation gate to reject the draft.

---

## 25. COMMON MISTAKES & TROUBLESHOOTING

### Q: "I adjusted a parameter, but the customer calculator still shows the old value."
- **Cause**: You edited a value in Admin, which created a **Draft**, but did not **Publish to Production**.
- **Fix**: Check if the amber **Unpublished Draft Banner** is visible at the top. Click **Publish to Production** and confirm.

### Q: "I changed a material rate, but the physical quantity remained identical."
- **Explanation**: This is **correct and expected behavior**. Under the Hutty Invariance Principle, changing a monetary rate ($₹/\text{unit}$) only changes cost ($\text{Qty} \times \text{Rate}$). It never alters physical material volume.

### Q: "Publish failed with validation error: 'Allocation percentage must be between 0% and 100%'."
- **Cause**: An allocation parameter (such as footing or column allocation) was entered with a negative number or a value exceeding 100.
- **Fix**: Return to `RCC & Structure`, restore the allocation to valid ranges (5% to 55%), and re-publish.

### Q: "The report shows blocks in sq.ft and Nos., but I want to see cubic metres."
- **Explanation**: Under **Hutty Unit Governance**, customer-facing masonry is **strictly restricted from displaying $\text{m}^3$**. Customers understand blockwork in wall area (sq.ft) and discrete block counts (Nos.). Concrete is the only structural domain that uses $\text{m}^3$.

---

## 26. ADMIN SAFETY CHECKLIST

```
[ ] BEFORE MODIFYING
    [ ] Check parameter category: Is this a Calculation setting (Quantity) or Pricing setting (Rate)?
    [ ] Note the measurement unit (m³, Tonnes, Bags, CFT, sq.ft, Nos, Litres, ₹).
    [ ] Read the "What does this affect?" advisory box.

[ ] BEFORE PUBLISHING
    [ ] Draft auto-save confirmed (Backend Draft ID visible in banner).
    [ ] Open Test Calculator (`test-calculator`) and run "Calculate & Compare".
    [ ] Inspect Quantity vs. Price Transparency table to ensure no unintended cross-domain shifts.
    [ ] Verify that total allocation percentages remain equal to 100%.

[ ] AFTER PUBLISHING
    [ ] Confirm that the Unpublished Draft Banner has cleared.
    [ ] Open Version History to verify the new Active version label.
    [ ] Verify live customer calculator calculation matches simulated draft total.
```

---

## 27. GLOSSARY

- **BUA (Built-Up Area)**: The total covered area of the building across all floors, including external walls and columns.
- **Carpet Area**: The actual net usable area inside the rooms of an apartment or house, excluding wall thicknesses.
- **BOQ (Bill of Quantities)**: A detailed itemized schedule listing all materials, labour trades, and measured works required for construction.
- **RCC (Reinforced Cement Concrete)**: Concrete embedded with steel rebar cages for high tensile and compressive strength.
- **$m^3$ (Cubic Metre / Cu.M)**: Standard metric volume measurement used exclusively for RCC structural concrete.
- **CFT (Cubic Feet / Cu.Ft)**: Traditional volumetric unit used for M-sand, P-sand, and 20mm coarse stone aggregates.
- **Nos. (Numbers)**: Discrete unit count used for blocks, doors, windows, and electrical/plumbing points.
- **AST (Abstract Syntax Tree)**: Safe internal data representation of a formula that enables evaluation without arbitrary code execution.
- **Rate Override**: A localized or package-specific price replacement that supersedes baseline default rates.
- **Draft**: A work-in-progress configuration state that is persisted to the database but hidden from public customers.
- **Active**: The single, authoritative configuration version currently serving live customer estimates.

---

## 28. IMPLEMENTATION & CODEBASE REFERENCE

This user manual was audited and constructed directly from the active source code:
- **Admin Routes & Navigation**: [AdminPage.tsx](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/admin/AdminPage.tsx#L558-L635)
- **Admin State Store**: [useAdminStore.ts](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/store/useAdminStore.ts)
- **Backend Persistence APIs**: [config.routes.ts](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/server/src/routes/config.routes.ts) & [schema.prisma](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/prisma/schema.prisma#L300-L375)
- **Formula Engine & Registry**: [formulaLibrary.ts](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/rules/formulaLibrary.ts) & [variableRegistry.ts](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/rules/variableRegistry.ts)
- **Rate Resolution & Hierarchy**: [rateService.ts](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/data/rateService.ts#L1-L35)
- **Unit Governance**: [units.ts](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/data/units.ts)
- **Test Calculator Sandbox**: [TestCalculatorSection.tsx](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/admin/sections/TestCalculatorSection.tsx)
- **Simulation & Pre-Publish Impact**: [SimulationImpactTab.tsx](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/admin/tabs/SimulationImpactTab.tsx)
