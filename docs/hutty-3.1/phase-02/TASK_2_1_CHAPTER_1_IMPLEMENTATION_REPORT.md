# HUTTY 3.1 — PHASE 02: TASK 2.1 IMPLEMENTATION REPORT
## Chapter 1: Plot & Setbacks Intake, 2D Buildable Footprint Canvas & Architectural Consolidation

**Project:** Hutty Residential Construction Cost Calculator (Bangalore & Mysore)  
**Deliverable Phase:** Phase 02 — User Journey Consolidation & Seven-Chapter Restructuring  
**Current Task:** Task 2.1 — Chapter 1: Plot & Setbacks (`Chapter1PlotSetbacks.tsx`)  
**Status:** IMPLEMENTED, VERIFIED & SUBMITTED FOR FOUNDER REVIEW  
**Date:** October 31, 2026  
**Baseline Test Verification:** 62 Test Files Passed | 814 / 814 Tests Passed (100%)  
**TypeScript Status:** 0 Compilation Errors (`npx tsc -b` & `npx tsc -p server`)  
**Production Build:** Compiled cleanly in 35.42s  

---

## 1. Executive Summary

In accordance with the founder-approved **Hutty 3.1 Phase 02 Execution Plan**, **Task 2.1** has been implemented. 

Prior to this task, plot geometry inputs (`plotLength`, `plotWidth`, `city`, `authority`) were collected in Stage 1, while municipal boundary setbacks and permissible ground coverage were delayed until Stage 4. This created customer cognitive friction: homeowners entered dimensions in Stage 1 with no immediate visibility into how much of their plot was actually buildable under Bengaluru/Mysore municipal bylaws.

Task 2.1 successfully consolidates `Stage1Plot.tsx` and `Stage4BuildableSpace.tsx` into a unified, homeowner-friendly, mobile-first component: [`Chapter1PlotSetbacks.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter1PlotSetbacks.tsx). In addition, the 2D orthogonal site diagram has been extracted and elevated into a reusable presentation component: [`BuildableFootprintCanvas.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/components/BuildableFootprintCanvas.tsx).

All existing inputs, calculation engine connections, and store mutators have been preserved with **zero regression** and **zero data loss**.

---

## 2. Deliverables & File Modifications

### A. New Components & Test Suites Created
1. **[`src/features/planner/components/BuildableFootprintCanvas.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/components/BuildableFootprintCanvas.tsx)** (NEW)
   - Orthogonal 2D SVG canvas rendering the site plot boundary, road frontage (with asphalt styling and width badge), secondary corner road frontages (left, right, rear), hatched setback open-space buffers, and the permissible buildable footprint envelope.
   - Real-time dimension annotations for plot width, depth, front/rear/left/right setbacks, and buildable width × length.
   - Inline geometric overflow detection: displays a clear alert if manual setbacks exceed plot boundaries.
2. **[`src/features/planner/chapters/Chapter1PlotSetbacks.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter1PlotSetbacks.tsx)** (NEW)
   - Guided 6-step intake flow with responsive layout, plain homeowner language, preset plot size cards, custom numeric inputs, corner plot options, planning authority selectors, a 2-state setback toggle, 4 clear space pillars, and progressive disclosure for site ground conditions.
3. **[`src/calculation-engine/__tests__/chapter1_plot_setbacks.test.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/__tests__/chapter1_plot_setbacks.test.ts)** (NEW)
   - Comprehensive 7-case automated test suite verifying store defaults, preset dimensions, road widths, corner frontages, GBA 2026 municipal setback evaluation, custom surveyor clearance overrides, geometric boundary overflow detection, and the 4-pillar area reconciliation.

### B. Modified Files
1. **[`src/features/planner/PlannerPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/PlannerPage.tsx)**
   - Mounted `<Chapter1PlotSetbacks />` for `activeStage === 1`.
   - Backward compatibility maintained for all subsequent stages (Stages 2–8 remain completely functional).

---

## 3. Architectural Design & User Experience Flow

Chapter 1 organizes plot and setback intake into a guided, homeowner-centric sequence:

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ CHAPTER 1: PLOT & SETBACKS (Guided Homeowner Intake Flow)                         │
├───────────────────────────────────────────────────────────────────────────────────┤
│ 1. Where are you building?                                                        │
│    [ Bangalore (Default) ]    [ Mysore ]                                          │
├───────────────────────────────────────────────────────────────────────────────────┤
│ 2. How big is your plot?                                                          │
│    [ 20' × 30' (600 sq.ft) ]  [ 30' × 40' (1,200 sq.ft) POPULAR ]                 │
│    [ 30' × 50' (1,500 sq.ft) ] [ 40' × 60' (2,400 sq.ft) ]                       │
│    Custom Width (ft) & Length (ft) with live sq.ft and Gunta conversions          │
├───────────────────────────────────────────────────────────────────────────────────┤
│ 3. Front Road Width & Plot Orientation                                            │
│    [ 20 ft ]  [ 30 ft Standard ]  [ 40 ft ]  [ 60+ ft ]                           │
│    [x] Corner plot with roads on more than one side -> (Left / Right / Rear)      │
├───────────────────────────────────────────────────────────────────────────────────┤
│ 4. Local Planning Authority & Land Approval                                       │
│    [ BBMP / BDA ]  [ MUDA ]  [ Not sure ]                                         │
│    Optional approval status: BDA/BBMP, DC Converted, E-Khata, Not sure            │
├───────────────────────────────────────────────────────────────────────────────────┤
│ 5. Open Space Required Around Your House (Setbacks)                               │
│    Front: 3.0' | Rear: 2.3' | Left: 2.3' | Right: 0.0'                            │
│    [2-State Toggle: Standard Municipal Bylaws (Default) vs Custom Surveyor]       │
├───────────────────────────────────────────────────────────────────────────────────┤
│ 6. Real-Time 2D Buildable Footprint Diagram & 4 Space Pillars                     │
│    <BuildableFootprintCanvas />                                                   │
│    [1. Plot Area] [2. Inside Clearances] [3. Ground Footprint] [4. Total BUA]     │
│    Mandatory Non-Statutory Planning Disclaimer Notice                             │
├───────────────────────────────────────────────────────────────────────────────────┤
│ 7. Progressive Disclosure: Drawings, Soil Condition & Demolition (Optional)      │
│    Sanctioned plan / sketches / soil terrain / demolition status                  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

### Key UX Improvements Over Previous Implementation:
1. **Immediate Visual Gratification:** Homeowners immediately see their plot boundary and permissible footprint the moment they pick a preset or type dimensions, rather than having to wait until Stage 4.
2. **Dual-Constraint Transparency:** Clearly distinguishes between the **space inside physical clearances (geometric envelope)** and the **statutory ground coverage cap** (70% for $\le 1,615\text{ sq.ft}$; 65% for $> 1,615\text{ sq.ft}$).
3. **Plain English Jargon Removal:** Technical references like *"prescribed building line"* and *"boundary setback offsets"* are replaced with *"Open space required around your house (setbacks)"*.
4. **Surveyor Flexibility:** Homeowners who already have sanctioned drawings can switch to custom mode with one click and type exact clearance measurements.
5. **Mobile Responsiveness:** Stacked single-column layout on mobile devices ensures that the SVG diagram and 4 space pillars remain readable and interactive on small screens.

---

## 4. Complete Input & State Preservation Matrix

Every single input and method from the legacy `Stage1Plot.tsx` and `Stage4BuildableSpace.tsx` has been accounted for and preserved with zero loss:

| Parameter / Action | Originating File | Status in Chapter 1 | Verification Notes |
|---|---|---|---|
| `city` (`Bangalore` / `Mysore`) | `Stage1Plot.tsx` | **Preserved** | Syncs to `useWizardStore.setCity` |
| `plotLength` (ft) | `Stage1Plot.tsx` | **Preserved** | Syncs to `useWizardStore.setPlotDimensions` |
| `plotWidth` (ft) | `Stage1Plot.tsx` | **Preserved** | Syncs to `useWizardStore.setPlotDimensions` |
| Preset sizes (20×30, 30×40, 30×50, 40×60) | `Stage1Plot.tsx` | **Preserved** | Preserves popular badges and dimensions |
| `authority` (`BBMP/BDA`, `MUDA`, `Not sure`) | `Stage1Plot.tsx` | **Preserved** | Syncs to `useWizardStore.setAuthority` |
| Land status (BDA, DC Converted, E-Khata) | `Stage1Plot.tsx` | **Preserved** | Retained with exact options |
| `roadWidthFt` | `Stage4BuildableSpace.tsx` | **Preserved** | Elevated to Section 3; syncs to `setRoadWidth` |
| `isCornerPlot` | `PlotSetbacksSection.tsx` | **Preserved** | Checkbox toggle with secondary boundary selectors |
| `roadFacingBoundaries` | Store | **Preserved** | Multi-select for left, right, rear roads |
| `frontSetback` | `Stage4BuildableSpace.tsx` | **Preserved** | Syncs via `setCustomSetbacks` |
| `rearSetback` | `Stage4BuildableSpace.tsx` | **Preserved** | Syncs via `setCustomSetbacks` |
| `leftSetback` | `Stage4BuildableSpace.tsx` | **Preserved** | Syncs via `setCustomSetbacks` |
| `rightSetback` | `Stage4BuildableSpace.tsx` | **Preserved** | Syncs via `setCustomSetbacks` |
| Plan status (`sanctioned`, `rough_sketch`, `starting_fresh`) | `Stage4BuildableSpace.tsx` | **Preserved** | Kept in collapsible progressive disclosure |
| Site ground condition (`flat`, `sloping`, `loose_soil`) | `Stage4BuildableSpace.tsx` | **Preserved** | Kept in collapsible progressive disclosure |
| Demolition requirement (`vacant`, `demolition_needed`) | `Stage4BuildableSpace.tsx` | **Preserved** | Kept in collapsible progressive disclosure |
| Unit conversions (Guntas, Cents, Sq.Yards) | `Stage1Plot.tsx` | **Preserved** | Displayed in dimension card footer |

---

## 5. Verification & Test Suite Results

### A. Automated Vitest Regression Run
- **Test Command:** `npx vitest run`
- **Pre-implementation baseline:** 61 test files passed, 807 / 807 tests passed (100%).
- **Post-implementation result:** **62 test files passed, 814 / 814 tests passed (100%)**.
- **Execution duration:** 45.84s.
- **Failures / Regressions:** **ZERO**.

### B. TypeScript Strict Compilation
- **Frontend check:** `npx tsc -b` &rarr; **0 errors**.
- **Backend server check:** `npx tsc -p server` &rarr; **0 errors**.

### C. Production Build Compilation
- **Build command:** `npm run build`
- **Output:** Built cleanly in 35.42s with all bundles and sourcemaps generated without warnings or circular dependencies.

---

## 6. Protection of Core Systems & Commercial Invariants

As mandated by founder instructions:
1. **Calculation Engine Intact:** Zero lines of code were modified in `src/calculation-engine/**`, `bua.ts`, `evaluatePlotSetbacks()`, IS-456 structural logic, or package configurations.
2. **Backend & Database Untouched:** Zero changes to `prisma/schema.prisma`, Express controllers, database seeds, or migration files.
3. **Commercial Model Strictly Preserved:**
   - Free (₹0, `FREE`)
   - Basic PDF (₹99, `BASIC_ESTIMATE_PDF`) — active and preserved
   - Detailed BOQ (₹499, `DETAILED_ESTIMATE_499`)
   - Premium BOQ (₹1,499, `PREMIUM_1499`)
   - Expert Consultation (₹1,499, `LAUNCH_CONSULTATION`) — independent service
4. **Git Discipline:** Zero git commits or git pushes were executed.

---

## 7. Stop Condition & Next Steps

Task 2.1 is **100% complete**. 

As instructed by the global implementation rules:
> *"Execute Task 2.1 only in this assignment. Do not begin Tasks 2.2–2.8 until Task 2.1 has been implemented, tested and submitted for review."*

The development process is now **halted**. Tasks 2.2–2.8 (including Chapter 2: Dream Home & Spaces) will not begin until the founder has reviewed and approved this report.

