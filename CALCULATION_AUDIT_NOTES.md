# Technical Calculation Audit Notes — Hutty Platform

**Document Purpose**: This document is prepared for external technical review and engineering audit of the Hutty cost estimation engine. It provides a transparent index of all calculation modules, explicit parametric assumptions, and specific items requiring civil/structural engineering verification.

---

## 1. Scope & Verification Confirmation

- **Zero Calculation Logic Changes**: During this cleanup pass, zero calculation formulas, mathematical coefficients, unit conversions, rounding functions, brand rate mappings, authority rules, or QA gate validations were modified or relocated.
- **Architectural Preservation**: All 18 calculation modules remain in their canonical location (`src/calculation-engine/modules/`) with all domain data intact in `src/calculation-engine/data/`.
- **Validation Status**: All 99 automated test cases across 9 test suites pass without regressions. Production bundle compiles with zero TypeScript errors.

---

## 2. Calculation Modules Reviewed

The engine follows a linear, single-pass pipeline orchestrated by `runCalculator()` in [`src/calculation-engine/calculator.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/calculator.ts):

| Module | File Location | Primary Function | Core Output |
| :--- | :--- | :--- | :--- |
| **Area & Setbacks** | `modules/bua.ts` | Statutory setbacks, coverage limits, permissible FAR | `AreaResult` (BUA, Footprint, Setbacks) |
| **Space Model** | `modules/spaceModel.ts` | 3D room instances, perimeters, heights, wall areas | `BuildingModel` (Perimeter, Wall Vol, Openings) |
| **Doors Schedule** | `modules/doors.ts` | Door counts, opening deductions, schedule items | `doorOpeningAreaSqFt`, Door schedule |
| **Windows Schedule** | `modules/windows.ts` | Window counts, opening deductions, safety grills | `windowAreaSqFt`, Window schedule |
| **Structural Steel** | `modules/steel.ts` | TMT rebar tonnage (2.8 kg/sqft + 0.2/floor) | `steelTonnes`, `steelKg`, `steelFactor` |
| **Cement** | `modules/cement.ts` | OPC/PPC 53-grade bags (0.40 bags/sqft BUA) | `cementBags` (50kg bags) |
| **Masonry & Aggregates** | `modules/brick.ts` | AAC blocks/bricks, M-Sand (0.60), P-Sand (0.60), Coarse Agg (1.35) | Block counts, Sand CFT, Aggregate CFT |
| **Flooring & Cladding** | `modules/flooring.ts` | Floor tiles, dado tiles (bath/kitchen), waterproofing | Tile Sq Ft, Waterproofing Sq Ft |
| **Paint & Plaster** | `modules/paint.ts` | Internal/external plaster, primer, emulsion, putty | Paintable Sq Ft, Litres, Putty Kg |
| **Electrical MEP** | `modules/electrical.ts` | Light/fan/socket points, wire gauges (1.5, 2.5, 4, 6 sq.mm), conduits | Points, Wire Metres, Conduit Metres |
| **Plumbing & Sanitary** | `modules/plumbing.ts` | CPVC supply, SWR drainage, fixtures, water tank capacity | Pipe Metres, Fixture Counts, Tank Litres |
| **Works BOQ** | `modules/boq.ts` | 50+ line item Bill of Quantities across 13 trade categories | `BOQItem[]` (qty, unit rate, amount) |
| **Materials Schedule** | `modules/materials.ts` | Material consumption schedule & procurement breakdown | Material breakdown by trade |
| **Budget & Cost** | `modules/budget.ts` | Base cost, markups (Prof Fees, Margin, Contingency, GST) | `BudgetResult` & `commercialReconciliation` |
| **Timeline** | `modules/timeline.ts` | Duration estimation based on BUA and floor count | Total months, stage schedule |
| **Payment Schedule** | `modules/payment.ts` | 11-stage bank housing loan disbursement roadmap | `PaymentMilestone[]` (100% total) |
| **Calculation Trace** | `modules/trace.ts` | Step-by-step mathematical derivation trace for UI | Step-by-step audit records |
| **QA Validation Gate** | `modules/qaGate.ts` | Invariance & mathematical reconciliation gate | `QAGateResult` (blocking errors, warnings) |

---

## 3. Engineering Assumptions & Coefficients Summary

The engine centralizes key assumptions in [`src/calculation-engine/data/engineeringAssumptions.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/data/engineeringAssumptions.ts) and [`coefficients.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/data/coefficients.ts):

1. **Building Geometry**:
   - Standard floor-to-ceiling clear height: **10.0 ft** (`WALL_HEIGHT_FT`).
   - Default ground coverage ratio: **60%** (`COVERAGE_FACTOR`) unless authority rules specify otherwise.
   - Super Built-Up Area factor: **1.15** (`SUPER_BUA_FACTOR`, +15% over carpet/livable area for structural walls and shafts).
2. **Structural Quantities**:
   - Steel formula: $\text{Factor} = 2.8 + [0.2 \times (\text{Floors} - 1)] \text{ kg/sq.ft BUA}$.
   - Cement consumption: **0.40 bags per sq.ft BUA** (50 kg bags).
   - M-Sand (Manufactured sand for concrete): **0.60 CFT / sq.ft BUA**.
   - P-Sand (Plastering sand): **0.60 CFT / sq.ft BUA**.
   - Coarse aggregate (20mm & 12mm crushed blue metal): **1.35 CFT / sq.ft BUA**.
   - Concrete estimation for structural framing: $\approx 0.052 \text{ m}^3 / \text{sq.ft BUA}$.
3. **Masonry Thickness**:
   - External envelope wall thickness: **0.15 m** (6 inches) for AAC / Solid block; **0.23 m** (9 inches) for Wirecut Clay brick.
   - Internal partition wall thickness: **0.10 m** (4 inches) for AAC / Solid block; **0.115 m** (4.5 inches) for Clay brick.
4. **MEP Allowances**:
   - Conductor wiring per point: $8.5\text{ m}$ for 1.5 sq.mm; $12.5\text{ m}$ for 2.5 sq.mm; $22.0\text{ m}$ for 4.0 sq.mm; $35.0\text{ m}$ per floor for 6.0 sq.mm risers.
   - Daily water demand: **135 Litres per capita per day (LPCD)** (aligned with National Building Code / IS 1172) at 2 occupants per bedroom with 1.5 days storage reserve.
5. **Commercial Markups**:
   - Professional Architectural & Engineering Fees: **5%** of base construction cost.
   - Contractor Overhead & Execution Margin: **15%** of base construction cost.
   - Contingency Reserve: **6%** of base construction cost.
   - Goods & Services Tax (GST): **18%** applied to $(\text{Base Cost} + \text{Professional Fees})$.

---

## 4. Known Areas Requiring Client / Engineering Verification

The following items represent design assumptions, regional pricing nuances, or regulatory boundaries that should be formally reviewed and validated by the client's structural engineers and quantity surveyors:

### Item 1: Shared Partition Wall Overlap in Space Model
- **File**: [`src/calculation-engine/modules/spaceModel.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/spaceModel.ts) (`generateBuildingModel`)
- **Observation**: Room wall areas are calculated on a space-by-space basis: $\text{Gross Wall Area} = 2 \times (\text{Length} + \text{Width}) \times \text{Height}$. When rooms are aggregated into `grossInternalWallAreaSqFt`, internal partition walls shared between two adjoining rooms may be counted on both room faces.
- **Verification Recommendation**: Review whether a partition deduplication factor (e.g., center-line reduction or 0.50 factor on internal shared perimeters) should be applied to prevent slight over-estimation of masonry blocks and internal plaster.

### Item 2: GST Tax Base Definition
- **File**: [`src/calculation-engine/modules/budget.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/budget.ts) (`calculateBudget`)
- **Observation**: GST is computed as:
  $$\text{gstAmount} = \text{Math.round}((\text{baseConstructionCost} + \text{professionalFees}) \times 0.18)$$
  Contractor margin (15%) and contingency (6%) are added to the final total project cost *after* GST calculation.
- **Verification Recommendation**: In Indian construction works contracts, composite supply GST (18%) is frequently levied on the total taxable contract invoice (which incorporates contractor overhead/margin). The client's tax/finance team should confirm whether contractor margin is intended to be pre-tax or post-tax in the client presentation.

### Item 3: Water Storage Split (Overhead Tank vs. Underground Sump)
- **File**: [`src/calculation-engine/modules/plumbing.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/plumbing.ts) (`calculatePlumbing`)
- **Observation**: Total water storage demand is calculated as:
  $$\text{Demand} = \text{Bedrooms} \times 2 \times 135\text{ LPCD} \times 1.5\text{ days}$$
  This entire volume is allocated to `overheadTankLitres` (minimum 1,000L, rounded up to multiples of 500L). The underground sump is provided with a flat waterproofing allowance (120 sq.ft) rather than a dynamic capacity calculation.
- **Verification Recommendation**: In Karnataka urban practice (Bengaluru/Mysuru), municipal water supply is intermittent, so total storage is typically divided: ~60-70% in an underground RCC/masonry sump and ~30-40% in the overhead PVC/Sintex tank. The engineering team should verify if a dedicated sump volume calculation should be added.

### Item 4: Fixed Lump-Sum Allowances
- **File**: [`src/calculation-engine/modules/boq.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/boq.ts) (`generateBOQ`)
- **Observation**: "Temporary Site Shed, Storage Godown & Electrical Setup" is modeled as a flat lump sum of **₹75,000** for all projects regardless of plot size or built-up area (from a 720 sq.ft ground-floor house to a 16,000 sq.ft G+4 building).
- **Verification Recommendation**: Consider scaling temporary infrastructure costs progressively with project scale (e.g., base lump sum + rate/sq.ft BUA).

### Item 5: Unreferenced Legacy Rates Dataset
- **File**: [`src/calculation-engine/data/locationRates.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/data/locationRates.ts)
- **Observation**: This file contains early prototype rate parameters (such as a 12% GST rate and flat square-foot rates of ₹1,750 / ₹2,450 / ₹3,400). It is **not imported or used** anywhere in the active codebase (the active engine consumes `rateService.ts` and `coefficients.ts`).
- **Verification Recommendation**: The file is intentionally preserved during this cleanup to avoid accidental breaks, but the engineering team can safely archive it in a subsequent pass once confirmed.

---

## 5. Verification Results

- **Automated Tests**: 9 test files passed, 99 total tests passed (0 failures).
- **Type Checking / Lint**: `tsc -b` exited with code 0.
- **Production Build**: `vite build` completed successfully (2,325 modules transformed, production chunks generated).
