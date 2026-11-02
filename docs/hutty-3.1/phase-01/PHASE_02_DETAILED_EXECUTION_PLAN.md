# HUTTY 3.1 — PHASE 02: DETAILED EXECUTION PLAN
## Source-Aware Engineering Architecture, Component Reuse & Seven-Chapter User Journey

> **Document ID:** `HUTTY-3.1-DOC-PHASE-02-DETAILED-EXECUTION-PLAN`  
> **Status:** Final & Authoritative • Execution Blueprint  
> **Date:** October 31, 2026  
> **Author:** Antigravity Senior Product Architect, Construction-Estimation Systems Analyst & Full-Stack Lead  
> **Target Execution Baseline:** Hutty 3.0 Production Repository (`c:\Users\Avita\Desktop\Programming\big bnglore client\cost calculator rightcon`)  
> **Core Architectural Principle:** *"Preserve the intelligence. Improve how people experience it. Zero modifications to calculation formulas or backend APIs."*

---

## 1. Architectural Overview & The Seven Chapters

Phase 02 transforms Hutty's current 8-stage developer wizard into the client's mandatory **7-Chapter Homeowner Experience**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              HUTTY 3.1 SEVEN-CHAPTER JOURNEY                           │
└────────────────────────────────────────────────────────────────────────────────────────┘
 [ Chapter 01: Your Plot & Setbacks ]
   Dimensions, road width, municipal authority, orientation, setback rules & buildable footprint.
                  │
                  ▼
 [ Chapter 02: Your Dream Home & Spaces ]
   House use (villa/duplex/rental), floor counts, parking, room counters & live BUA indicators.
                  │
                  ▼
 [ Chapter 03: Core Construction Materials ]
   Structural steel, cement, concrete mix, and walling blocks with "What Am I Consuming?" micro-cards.
                  │
                  ▼
 [ Chapter 04: Flooring & Tiles by Space (DEDICATED CHAPTER) ]
   Living, master bed, other beds, kitchen, balconies, bathrooms; "Apply to All Similar" & overrides.
                  │
                  ▼
 [ Chapter 05: Doors & Windows (DEDICATED CHAPTER) ]
   Main teak entrance, internal flush doors, waterproof bathroom doors, UPVC windows, and grills.
                  │
                  ▼
 [ Chapter 06: Electrical, Plumbing & Finishes ]
   Modular switches, copper wiring, CPVC pipes, sanitary suites, water tanks, paint, railings, cladding.
                  │
                  ▼
 [ Chapter 07: Review Estimate & BOQ ]
   Preliminary cost, cost/sq.ft, work breakdown, contractor mode toggle, statutory disclaimer, report tiers.
```

---

## 2. Chapter-by-Chapter Engineering Specifications

---

### Chapter 01 — Tell Us About Your Plot & Setbacks

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CHAPTER 01 SPECIFICATION: PLOT, SETBACKS & BUILDABLE FOOTPRINT                         │
├───────────────────────┬────────────────────────────────────────────────────────────────┤
│ Primary Component     │ src/features/planner/chapters/Chapter1PlotSetbacks.tsx        │
│ Reused Files          │ src/features/planner/stages/Stage1Plot.tsx                     │
│                       │ src/features/planner/stages/Stage4BuildableSpace.tsx           │
│                       │ src/features/planner/components/BuildableFootprintCanvas.tsx   │
│ Store State Preserved │ plotLength, plotWidth, roadWidthFt, city, authority,           │
│                       │ frontSetback, rearSetback, leftSetback, rightSetback           │
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

1. **Reused Subsystems:**
   - Reuse plot dimension sliders and preset pills (30×40, 30×50, 40×60, 50×80) from `Stage1Plot.tsx`.
   - Reuse road width selector and municipal planning authority dropdown (`BBMP/BDA`, `MUDA`, `Not sure`).
   - Reuse dynamic 2D SVG canvas [`BuildableFootprintCanvas.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/components/BuildableFootprintCanvas.tsx) from Stage 4.
2. **Consolidation Logic:**
   - Eliminates the confusing separation between Stage 1 (Plot) and Stage 4 (Buildable Space).
   - Setbacks are presented directly underneath the plot dimensions with a clear 2-state toggle:
     - *State A (Default):* "Use standard municipal planning rules for my plot size" (Calculates setbacks automatically via `bua.ts`).
     - *State B:* "I already have custom setback dimensions or drawings" (Reveals Front, Rear, Left, Right numeric inputs).
3. **Data Dependencies & Engine Connection:**
   - Drives `calculateArea(input)` in [`bua.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/bua.ts).
   - Generates `plotAreaSqFt`, `buildableFootprintSqFt`, and `maxGroundCoverageSqFt`.
4. **Validation & Error Handling:**
   - Plot Length: $10\text{ ft} \le L \le 300\text{ ft}$.
   - Plot Width: $10\text{ ft} \le W \le 300\text{ ft}$.
   - If manual setbacks exceed plot dimensions, visual inline error: *"Setbacks exceed plot boundary. Please adjust dimensions."*
5. **Mobile & Desktop Behavior:**
   - Desktop: Side-by-side layout (Form on left 60%, 2D Footprint Canvas on right 40%).
   - Mobile: Form stacked on top; 2D Footprint Canvas rendered in a collapsible visual card.
6. **Plain Homeowner Copy:**
   - Replace *"Boundary setback offsets and prescribed building line"* with *"Open space required around your house (setbacks)"*.

---

### Chapter 02 — Tell Us About Your Dream Home & Spaces

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CHAPTER 02 SPECIFICATION: FLOORS, PARKING & CANONICAL ROOM CONFIGURATION               │
├───────────────────────┬────────────────────────────────────────────────────────────────┤
│ Primary Component     │ src/features/planner/chapters/Chapter2DreamHome.tsx            │
│ Reused Files          │ src/features/planner/stages/Stage2Home.tsx                     │
│                       │ src/features/planner/stages/Stage3Rooms.tsx                    │
│ Store State Preserved │ floors, houseType, parkingType, carCount, bikeCount,           │
│                       │ rooms (bedrooms, bathrooms, kitchen, living, dining, balcony,  │
│                       │ pooja, utility, study)                                         │
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

1. **Reused Subsystems:**
   - Floor count selector (G, G+1, G+2, G+3, G+4) and house use cards (Villa, Duplex, Rental Units, Mixed Use) from `Stage2Home.tsx`.
   - Numeric room counters from `Stage3Rooms.tsx`.
2. **Consolidation Logic:**
   - Homeowners configure their floors, parking, and rooms on a single unified canvas.
   - Primary rooms (Bedrooms, Bathrooms, Kitchen, Living, Dining, Balcony) are displayed prominently.
   - Specialized spaces (Pooja Room, Home Office/Study, Utility/Wash Area, Open Terrace) are accessible via a clean accordion card: *"Add specialized spaces"*.
3. **Data Dependencies & Engine Connection:**
   - Drives `generateBuildingModel(input, area)` in [`spaceModel.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/spaceModel.ts).
   - Automatically computes total built-up area (BUA), carpet area, gross wall perimeters, and opening allowances.
4. **Validation & Invariants:**
   - Minimum 1 Bedroom, 1 Bathroom, 1 Kitchen, 1 Living Room required for residential dwelling.
   - Floor count constrained between 1 and 5.
5. **Plain Homeowner Copy:**
   - Replace *"Canonical space model & carpet FAR loading"* with *"Room layout & living space"*.

---

### Chapter 03 — Choose Your Core Construction Materials

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CHAPTER 03 SPECIFICATION: STRUCTURAL STEEL, CEMENT, CONCRETE MIX & WALLING             │
├───────────────────────┬────────────────────────────────────────────────────────────────┤
│ Primary Component     │ src/features/planner/chapters/Chapter3CoreMaterials.tsx        │
│ Reused Files          │ src/features/planner/stages/Stage5ConstructionStyle.tsx        │
│ Store State Preserved │ materialBrands.steel, materialBrands.cement,                   │
│                       │ materialBrands.masonry, qualityTier, specificationTier         │
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

1. **Reused Subsystems:**
   - Brand selectors from `Stage5ConstructionStyle.tsx` for Steel (Tata Tiscon Fe 550D, JSW Neosteel, SAIL, Jindal Panther), Cement (UltraTech 53, ACC Concrete+, Birla Super), and Walling (AAC Blocks, Clay Wire-Cut Bricks, Solid Concrete Blocks).
2. **New Requirement — "What Am I Consuming?" Micro-Cards:**
   - Display calculated physical quantities **before or alongside** the brand selector so homeowners understand their consumption:
     - **Steel Rebar Card:** Displays calculated tonnage (e.g. `6.8 Tonnes`) with explanation: *"High-strength structural steel rebar to frame your foundation, columns, and roof slabs."*
     - **Portland Cement Card:** Displays calculated bag count (e.g. `860 Bags`) with explanation: *"Standard 50kg bags needed for structural concrete, wall mortar, and smooth plastering."*
     - **Walling Blocks Card:** Displays calculated count (e.g. `3,850 Blocks`) with explanation: *"Precision masonry blocks for exterior shelter walls and interior room dividing partitions."*
3. **Data Dependencies & Engine Connection:**
   - Brand selections update `rateService` and `brandDatabase.ts`.
   - **Strict Brand Invariance:** Modifying brand updates unit rates and cost amounts in Section B, but physical quantities ($Q_i$) remain 100% mathematically invariant.

---

### Chapter 04 — Choose Flooring & Tiles for Each Space (DEDICATED CHAPTER)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CHAPTER 04 SPECIFICATION: SPACE-BY-SPACE FLOORING & WALL DADO TILES                    │
├───────────────────────┬────────────────────────────────────────────────────────────────┤
│ Primary Component     │ src/features/planner/chapters/Chapter4Flooring.tsx (NEW FILE)  │
│ Reused Files          │ Tile selectors from Stage6FinishesMaterials.tsx (Tab 1)        │
│ Store State Preserved │ flooringZones (living, masterBed, otherBeds, kitchen, balcony, │
│                       │ utility, staircase), wallCladding                              │
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

1. **Dedicated Architecture:**
   - Extracted completely from the congested tabs of Stage 6 into its own dedicated chapter.
   - Spaces listed discretely:
     1. Living & Dining
     2. Master Bedroom
     3. Other Bedrooms
     4. Kitchen
     5. Bathrooms (Floor & Wall Dado)
     6. Balconies & Utility
     7. Staircase Treads & Risers
2. **New Core Features:**
   - **"Apply to All Similar Spaces" Master Action:** A 1-click button (e.g. *"Apply this tile to all bedrooms"* or *"Apply to all wet areas"*) allowing fast-path configuration.
   - **Individual Room Overrides:** Collapsible card allowing the homeowner to customize individual rooms (e.g. Italian Marble in Living, Wooden-finish GVT in Master Bedroom, Anti-skid Matte in Balcony).
   - **Bathroom Dado Height Control:** Choice between Standard 7ft Lintel Height vs Full 10ft Ceiling Height.
3. **Data Dependencies & Engine Connection:**
   - Drives `calculateFlooring()` in [`flooring.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/flooring.ts).
   - Feeds BOQ codes `FLR-001` (Living/Bed GVT), `FLR-002` (Anti-skid), `FLR-003` (Bathroom Dado), and `FLR-004` (Granite Staircase).

---

### Chapter 05 — Choose Doors & Windows (DEDICATED CHAPTER)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CHAPTER 05 SPECIFICATION: ENTRANCE, INTERNAL, BATHROOM DOORS & WINDOW SCHEDULES        │
├───────────────────────┬────────────────────────────────────────────────────────────────┤
│ Primary Component     │ src/features/planner/chapters/Chapter5DoorsWindows.tsx (NEW)   │
│ Reused Files          │ Door & window logic from Stage6FinishesMaterials.tsx (Tabs 2&3)│
│ Store State Preserved │ doors (mainDoor, internalDoors, bathroomDoors),                │
│                       │ windows (frameMaterial, glassType, mesh, grills)               │
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

1. **Dedicated Architecture:**
   - Extracted from Stage 6 into a standalone architectural joinery showcase.
2. **Door Selections:**
   - **Main Entrance Door:** Carved Burma/Teak Wood, Engineered Wood with Digital Smart Lock, or Premium Flush Door with Brass Hardware.
   - **Internal Room Doors:** Factory-moulded laminated flush doors with red sal wood frames.
   - **Bathroom & Utility Doors:** 100% Waterproof WPC / FRP composite doors with stainless steel handles.
3. **Window & Glazing Selections:**
   - **Window Systems:** 2.5-track UPVC sliding windows with integrated stainless steel mosquito mesh, powder-coated aluminium, or seasoned teak wood.
   - **Security Grills:** Mild steel (MS) fabricated security grills (10mm square bars).
4. **Data Dependencies & Engine Connection:**
   - Drives `calculateDoors()` in [`doors.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/doors.ts) and `calculateWindows()` in [`windows.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/windows.ts).
   - Automatically deducts opening areas from masonry walls, plaster, and paint.

---

### Chapter 06 — Select Electrical, Plumbing & Other Finishes

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CHAPTER 06 SPECIFICATION: ELECTRICAL MEP, PLUMBING, PAINTING & EXTERIOR FINISHES       │
├───────────────────────┬────────────────────────────────────────────────────────────────┤
│ Primary Component     │ src/features/planner/chapters/Chapter6Finishes.tsx (NEW FILE)  │
│ Reused Files          │ MEP & paint pickers from Stage6FinishesMaterials.tsx (Tabs 4-6)│
│ Store State Preserved │ electrical, bathroomFittings, painting, wallCladding           │
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

1. **Subsystems Unified:**
   - **Electrical MEP:** Switch brands (Legrand, Schneider, Anchor Roma), copper wiring (Finolex, Polycab), EV wallbox provisioning, and solar conduit allowances.
   - **Plumbing & Sanitaryware:** CPVC supply lines (Astral, Ashirvad), sanitary suites (Jaquar, Kohler, Hindware), overhead triple-layer water tank (1,500L), and underground RCC sump (6,000L).
   - **Paint Systems:** Interior luxury emulsion (Asian Paints Royale) over 2 coats acrylic putty; exterior weatherproof anti-algal paint (Apex Ultima).
   - **Fabrication & Elevation:** Balcony railings (SS304 with toughened glass vs MS powder-coated) and front architectural elevation accent cladding.
2. **Homeowner Clarity:**
   - Grouped into 4 clean cards answering:
     1. *What switches and wiring will power your home?*
     2. *What bathroom fittings and water storage will be installed?*
     3. *What paint finish will protect your walls?*
     4. *What railings and exterior accents will complete the look?*

---

### Chapter 07 — Review Your Estimate & BOQ

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CHAPTER 07 SPECIFICATION: ESTIMATE REVIEW, CONTRACTOR SWITCH & REPORT DELIVERABLES     │
├───────────────────────┬────────────────────────────────────────────────────────────────┤
│ Primary Component     │ src/features/planner/chapters/Chapter7ReviewEstimate.tsx       │
│ Reused Files          │ src/features/planner/stages/Stage7Estimate.tsx                 │
│                       │ src/features/planner/stages/Stage8DetailedBOQ.tsx              │
│                       │ src/components/common/DetailsAndAssumptions.tsx                │
│ Store State Preserved │ contractorMode, contractorMarginRate, applyContractorGST       │
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

1. **Reused Subsystems:**
   - Reuse financial summary cards, progress bars, and Works BOQ preview table.
   - Reuse assumptions drawer from `DetailsAndAssumptions.tsx`.
2. **Mandatory Statutory Notice:**
   - Prominently rendered in a soft amber banner above the total budget:  
     > **"This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings, and material choices are checked."**
3. **Turnkey Contractor Mode Toggle:**
   - Clean switch: *"Are you hiring a turnkey contractor or managing labour directly?"*
   - Preserves existing production defaults: **10% margin**, **0% fees**, **GST toggle**.
4. **Four-Tier Report Cards:**
   - Transparently presents all four access tiers:
     1. **Free (₹0):** Macro web summary and first 5 BOQ preview rows.
     2. **Basic PDF (₹99):** Download 1-page executive summary PDF.
     3. **Detailed BOQ (₹499):** Download comprehensive 8-to-10 page Works BOQ and material schedule dossier.
     4. **Premium BOQ (₹1,499):** Download complete dossier with contractor quote audit, sensitivity analysis, and multi-scenario comparison.
   - Decoupled consultation pill: *"Need 1-on-1 expert guidance? Book an Expert Consultation for ₹1,499."*

---

## 3. Visual & Language Direction (Anti-Stock & Anti-AI)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          ARCHITECTURAL VISUAL DESIGN SYSTEM                            │
├───────────────────────┬────────────────────────────────────────────────────────────────┤
│ Primary Palette       │ Deep Forest Green (#1B3D34) · Terracotta Amber (#F28C28)       │
│ Canvas Backgrounds    │ Warm Off-White (#F8F8F6) · Pure Card White (#FFFFFF)           │
│ Typography            │ Headings: Playfair / Plus Jakarta Sans · Numbers: Mono Font    │
│ Graphical Medium      │ 2D Orthogonal CAD line drawings & Isometric structural frames  │
│ Material Swatches     │ Authentic tactile texture cutouts (Marble, Granite, Wood GVT)  │
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

1. **No Stock Photos / No AI Avatars:** Artificial stock photos of generic businesspeople or AI-generated homes are strictly prohibited.
2. **Original Architectural Graphics:**
   - Plot boundary and setback 2D diagrams with dimension leader lines.
   - Isometric structural framing diagrams showing footing pads, columns, and slabs growing as the user selects floors.
   - Wall construction cross-sections showing block layup, mortar bed, and plaster layers.
3. **Mobile-First Experience:**
   - On screens $< 768\text{px}$, the sticky live preview is rendered as an elegant floating architectural bottom bar showing `₹42.8 Lakhs · 2,400 sq.ft` with tap-to-expand drawer.

---

## 4. Protected Systems Boundary & Invariants

Phase 02 operates strictly within frontend presentation layers (`src/features/planner/`).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              STRICT BOUNDARY CHECKLIST                                 │
├───────────────────────────────────────┬────────────────────────────────────────────────┤
│ Subsystem                             │ Modification Status in Phase 02                │
├───────────────────────────────────────┼────────────────────────────────────────────────┤
│ src/calculation-engine/**             │ READ-ONLY (Zero changes)                       │
│ IS-456 Structural Rules               │ READ-ONLY (Zero changes)                       │
│ prisma/schema.prisma                  │ READ-ONLY (Zero migrations)                    │
│ Backend Express APIs (/api/v1/*)      │ READ-ONLY (Zero contract changes)              │
│ Cashfree Payment Gateway v3           │ READ-ONLY (Zero logic changes)                 │
│ Customer JWT Authentication           │ READ-ONLY (Zero session changes)               │
│ Anonymous Calculator Session          │ PRESERVED (localStorage backward compatible)   │
└───────────────────────────────────────┴────────────────────────────────────────────────┘
```

---

## 5. Backward Compatibility & State Migration

To ensure existing users in the middle of a calculation do not experience errors when the 8 stages transition to 7 chapters:
- A migration helper in `useWizardStore.ts` will map legacy `currentStep` values:
  - Legacy Stage 1 & 4 $\rightarrow$ Chapter 1
  - Legacy Stage 2 & 3 $\rightarrow$ Chapter 2
  - Legacy Stage 5 $\rightarrow$ Chapter 3
  - Legacy Stage 6 (Flooring tab) $\rightarrow$ Chapter 4
  - Legacy Stage 6 (Doors/Windows tab) $\rightarrow$ Chapter 5
  - Legacy Stage 6 (MEP/Finishes tab) $\rightarrow$ Chapter 6
  - Legacy Stage 7 & 8 $\rightarrow$ Chapter 7
- Preserves all saved localStorage project configurations seamlessly.

