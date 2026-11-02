# HUTTY 3.1 — PHASE 01: CALCULATION TO BOQ MAPPING
## Comprehensive Engineering Takeoff, Formula Inventory & Downstream Traceability

> **Document ID:** `HUTTY-3.1-DOC-C-CALC-BOQ-MAPPING`  
> **Status:** Completed & Authoritative  
> **Date:** October 31, 2026  
> **Author:** Antigravity Senior Product Architect & Construction Systems Engineering Analyst  
> **Codebase Target:** Hutty 3.0 Production Engine (`src/calculation-engine/`)  
> **Scope:** Full traceability audit across 16 construction categories: Customer Input → Formula / Dependency → Calculated Quantity → Customer Selection → Unit Rate → Line Cost → Works BOQ Code → PDF Report Output.

---

## 1. Executive Overview & The Forward Calculation Chain

Hutty's calculation engine is a linear dependency directed acyclic graph (DAG) executed in 15 strict sequential steps within [`src/calculation-engine/calculator.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/calculator.ts). 

The calculation principles adhere strictly to the client specification:
1. **Geometric Invariance:** Physical quantities (steel tonnes, cement bags, concrete volume, masonry units, floor tiles, wire lengths, plumbing runs) depend solely on plot geometry, floor counts, room dimensions, and statutory structural norms (IS-456:2000).
2. **Brand Independence:** Brand selections (e.g., UltraTech vs ACC, Tata Tiscon vs Jindal Panther, Havells vs Finolex) **NEVER** alter the physical quantity of materials. They modulate only the unit rate and the corresponding line-item and aggregate costs.
3. **Space Model Centrality:** Rather than relying on simplistic gross built-up area (BUA) multipliers, Hutty synthesizes a canonical room-by-room space model with computed perimeters, ceiling surfaces, wall areas, and openings deductions.
4. **Zero-Residual Commercial Reconciliation:** Direct construction costs are derived strictly as:
   $$\text{Direct Construction Budget} = \sum (\text{Works BOQ Items}) = \text{Materials} + \text{Fixtures} + \text{Labour}$$
   Commercial additions (contractor execution margin, contingency reserves, professional architecture/engineering fees, and GST) are computed exclusively on their defined bases, ensuring $0.00$ unexplained residual.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE FORWARD CALCULATION CHAIN                          │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                     Customer Inputs
                           (Plot, Floors, Rooms, Brands, Tier)
                                            │
                                            ▼
                      Step 1: Setback & Built-Up Area Geometry (bua.ts)
                                            │
                                            ▼
                      Step 2: Canonical Space & Building Model (spaceModel.ts)
                                            │
                                            ▼
                      Step 3: Door & Window Schedules (doors.ts, windows.ts)
                                            │
                                            ▼
                      Step 4: Physical Quantity Engines
    ┌───────────────────┬───────────────────┬───────────────────┬───────────────────┐
    ▼                   ▼                   ▼                   ▼                   ▼
Steel (steel.ts)  Cement & Concrete   Masonry (brick.ts) Flooring & Dado    Paint, MEP
                  (cement.ts, rcc.ts)                    (flooring.ts)  (paint, electrical,
                                                                          plumbing.ts)
    └───────────────────┴───────────────────┴───────────────────┴───────────────────┘
                                            │
                                            ▼
                      Step 5: Section A — Works BOQ (boq.ts)
                                            │
                                            ▼
                      Step 6: Section B — Material Schedule (materials.ts)
                                            │
                      Step 7: Section C — Fixture Schedule (fixtures.ts)
                                            │
                      Step 7.5: Section E — Labour Takeoff (labour.ts)
                                            │
                      Step 8: Section D — Budget & Reconciliation (budget.ts)
                                            │
                      Steps 9–15: Timeline, Payment, Trace, Explanations, QA Gate
                                            │
                                            ▼
                            Consolidated Master Report (report.ts)
                                & PDF Document Assembly
```

---

## 2. Master Category-by-Category Takeoff Mapping

The following 16 subsections detail every single construction takeoff in Hutty.

---

### Category 01: Plot & Site Details

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/bua.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/bua.ts#L65-L105) |
| **Primary Inputs** | `plotLengthFt` (number), `plotWidthFt` (number), `facing` (enum: North, South, East, West), `roadWidthFt` (number), `city` (string) |
| **Formula / Engine Logic** | $$\text{Plot Area (sq.ft)} = \text{plotLengthFt} \times \text{plotWidthFt}$$ $$\text{Plot Area (sq.yd)} = \frac{\text{Plot Area (sq.ft)}}{9}$$ $$\text{Plot Area (sq.m)} = \text{Plot Area (sq.ft)} \times 0.092903$$ |
| **Assumptions & Source** | Standard orthogonal site boundary. Plot perimeter calculated as $2 \times (\text{plotLengthFt} + \text{plotWidthFt})$. Source: `CENTRALIZED_ENGINEERING_ASSUMPTIONS` |
| **Units & Rounding** | Sq.Ft (integer `Math.round`), Sq.Yd / Sq.M (2 decimal places) |
| **Validation** | $\text{Length} \ge 10\text{ ft}, \le 500\text{ ft}$; $\text{Width} \ge 10\text{ ft}, \le 500\text{ ft}$. Returns $0$ if non-positive. |
| **Quantity Derivation** | Calculated directly from customer geometric dimensions. |
| **Customer Selection** | Dimension sliders / text inputs; city selection (Bengaluru, Hyderabad, Chennai, etc.). |
| **Unit Rate Applied** | Site clearing & preliminary grading rate: ₹12 / sq.ft of plot area. |
| **Line Cost** | $\text{Site Preparation Cost} = \text{Plot Area} \times \text{₹12}$. |
| **BOQ Line Item** | BOQ Code `PRE-001`: "Site clearance, surface dressing, grubbing and boundary demarcation." |
| **Report / PDF Placement** | Chapter 1 Plot Summary Card; Project Overview Box; BOQ Category: Preliminary & Site Works. |

---

### Category 02: Setbacks & Preliminary Buildable Area

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/bua.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/bua.ts#L106-L230) |
| **Primary Inputs** | `roadWidthFt`, `plotAreaSqFt`, `planningAuthority` (BBMP, BDA, BMRDA, DTCP, GHMC, HMDA, CMDA, Other), optional manual setback overrides: `frontSetbackFt`, `rearSetbackFt`, `side1SetbackFt`, `side2SetbackFt`. |
| **Formula / Engine Logic** | 1. If manual setback overrides provided, use overrides.<br>2. Else, consult municipal authority lookup table based on `plotAreaSqFt` and `roadWidthFt`:<br>- Up to 1,200 sq.ft (30×40): Front = 1.5m (4.92 ft), Rear = 1.0m (3.28 ft), Sides = 1.0m (3.28 ft).<br>- 1,201 to 2,400 sq.ft (40×60): Front = 2.0m (6.56 ft), Rear = 1.5m (4.92 ft), Sides = 1.5m (4.92 ft).<br>- 2,401 to 4,000 sq.ft: Front = 3.0m (9.84 ft), Rear = 2.0m (6.56 ft), Sides = 2.0m (6.56 ft).<br>$$\text{Buildable Length} = \max(0, \text{plotLengthFt} - \text{Front Setback} - \text{Rear Setback})$$<br>$$\text{Buildable Width} = \max(0, \text{plotWidthFt} - \text{Side1 Setback} - \text{Side2 Setback})$$<br>$$\text{Buildable Footprint} = \text{Buildable Length} \times \text{Buildable Width}$$<br>$$\text{Max Ground Coverage} = \min(\text{Buildable Footprint}, \text{plotAreaSqFt} \times 0.60)$$ |
| **Assumptions & Source** | Max ground coverage benchmark is 60% per BBMP / BDA Bye-laws 2020. |
| **Units & Rounding** | Feet (1 decimal place); Square Feet (integer `Math.round`). |
| **Validation** | Buildable dimensions clamped to $\ge 0$. If setback exceeds plot dimension, buildable area equals 0 and warning flag is set. |
| **Quantity Derivation** | Calculated mathematically via municipal lookup or customer override. |
| **Customer Selection** | Toggle between "Automatic Municipal Rule" and "Custom Setback Dimensions". |
| **Downstream Impact** | Constrains Ground Floor Footprint; limits maximum allowable ground built-up area. |
| **BOQ / Report Placement** | Chapter 1 Buildable Area Diagram; Plot & Setback Schedule in Detailed Technical Report. |

---

### Category 03: Floors & Building Configuration (BUA)

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/bua.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/bua.ts#L231-L365) |
| **Primary Inputs** | `floors` (e.g. Ground only, G+1, G+2, G+3, G+4), `stiltParking` (boolean), `basement` (boolean), `balconyCoveragePct` (default 10%), `utilityCoveragePct` (default 5%), `floorFloorHeights` (array of numbers, default 10 ft). |
| **Formula / Engine Logic** | $$\text{Ground Floor Footprint} = \min(\text{Max Ground Coverage}, \text{Plot Area} \times 0.60)$$<br>For each floor $i \in [1 \dots N]$:<br>$$\text{Floor BUA}_i = \text{Ground Footprint} \times (1 + \text{balconyPct} + \text{utilityPct})$$<br>$$\text{Total BUA (sq.ft)} = \sum_{i=1}^{N} \text{Floor BUA}_i + \text{Stilt BUA} + \text{Basement BUA}$$<br>$$\text{Carpet Area (sq.ft)} = \text{Total BUA} \times 0.75$$ (Internal usable area)<br>$$\text{Super Built-up Area (sq.ft)} = \text{Total BUA} \times 1.15$$ (Real estate benchmark) |
| **Assumptions & Source** | Structural efficiency: 75% carpet area ratio, 15% wall and common area loading. Standard clear height: 10 ft floor-to-floor per NBC 2016 Part 3. |
| **Units & Rounding** | Square Feet (`Math.round`), Floor Count (integer 1 to 5). |
| **Validation** | $1 \le \text{floors} \le 5$. Total BUA must be $> 0$ for non-zero cost output. |
| **Quantity Derivation** | Calculated mathematically from ground coverage, floor multiplier, and overhang factors. |
| **Customer Selection** | Floor buttons (G, G+1, G+2, G+3, G+4); checkboxes for Stilt Parking and Basement. |
| **Downstream Impact** | **Primary Master Driver:** All structural steel, concrete, cement, plaster, and general preliminaries directly or indirectly scale with `Total BUA`. |
| **BOQ / Report Placement** | Key Project Metrics Box (BUA, Carpet Area, Ground Coverage); Header on all PDF pages. |

---

### Category 04: Rooms & Floor-Wise Areas (Canonical Space Model)

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/spaceModel.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/spaceModel.ts#L50-L320) |
| **Primary Inputs** | Bedroom count, Bathroom count, Kitchen count, Living room count, Dining room count, Balcony count, Utility count, Parking slots, Staircase count, Pooja room, Study room, Home theatre count. |
| **Formula / Engine Logic** | 1. Generates discrete room instances with canonical dimensional benchmarks:<br>- Master Bedroom: $14\text{ ft} \times 12\text{ ft} = 168\text{ sq.ft}$; Perimeter $= 52\text{ ft}$.<br>- Other Bedroom: $12\text{ ft} \times 11\text{ ft} = 132\text{ sq.ft}$; Perimeter $= 46\text{ ft}$.<br>- Living Room: $16\text{ ft} \times 14\text{ ft} = 224\text{ sq.ft}$; Perimeter $= 60\text{ ft}$.<br>- Dining Room: $12\text{ ft} \times 10\text{ ft} = 120\text{ sq.ft}$; Perimeter $= 44\text{ ft}$.<br>- Kitchen: $10\text{ ft} \times 8\text{ ft} = 80\text{ sq.ft}$; Perimeter $= 36\text{ ft}$.<br>- Attached Bathroom: $8\text{ ft} \times 5\text{ ft} = 40\text{ sq.ft}$; Perimeter $= 26\text{ ft}$.<br>- Common Bathroom: $7\text{ ft} \times 4.5\text{ ft} = 31.5\text{ sq.ft}$; Perimeter $= 23\text{ ft}$.<br>- Balcony / Utility: $10\text{ ft} \times 4\text{ ft} = 40\text{ sq.ft}$; Perimeter $= 28\text{ ft}$.<br>- Staircase: $14\text{ ft} \times 7\text{ ft} = 98\text{ sq.ft}$ per flight.<br>2. Normalization factor applied so sum of individual spaces matches carpet area: $\alpha = \frac{\text{Carpet Area}}{\sum \text{Benchmark Areas}}$.<br>3. Computes individual space gross wall area: $\text{Gross Wall Area} = \text{Perimeter} \times \text{Floor Height (10 ft)}$. |
| **Assumptions & Source** | National Building Code 2016 room proportion and minimum dimension recommendations. |
| **Units & Rounding** | Sq.Ft and R.Ft (`parseFloat(val.toFixed(1))`). |
| **Validation** | Minimum 1 Living room, 1 Kitchen, 1 Bathroom required for valid habitable dwelling. |
| **Quantity Derivation** | Synthesized dynamically by the Space Engine based on user-selected configuration. |
| **Downstream Impact** | Drives room-wise flooring, bathroom dado tiles, kitchen dado, paintable wall area, electrical point counts, door counts, window openings, and plumbing fixture sets. |
| **BOQ / Report Placement** | Chapter 2 "Space Program & Room Schedule" table in PDF Report. |

---

### Category 05: Concrete & Reinforcement Steel

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/steel.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/steel.ts#L30-L75), [`src/calculation-engine/modules/rcc.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/rcc.ts#L40-L125) |
| **Primary Inputs** | `totalBUASqFt`, `floors`, `qualityTier` (Essential / Premium / Luxury), `steelBrand` (Tata Tiscon, JSW Neosteel, SAIL, Kamdhenu, Jindal Panther), `concreteGrade` (M20, M25). |
| **Formula / Engine Logic** | 1. **Steel Consumption Factor (IS-456 Thumb Rule):**<br>$$\text{Base Factor} = 2.80\text{ kg/sq.ft (for Ground Floor)}$$<br>$$\text{Additional Factor} = 0.20\text{ kg/sq.ft per additional floor above Ground}$$<br>$$\text{Steel Factor} = 2.80 + 0.20 \times (\text{floors} - 1)\text{ kg/sq.ft}$$<br>$$\text{Total Steel (kg)} = \text{totalBUASqFt} \times \text{Steel Factor}$$<br>$$\text{Total Steel (Tonnes)} = \frac{\text{Total Steel (kg)}}{1000}$$<br>2. **RCC Concrete Volume (IS-456 Volumetric Component Breakdown):**<br>- Isolated Footings: $0.055\text{ m}^3 / \text{sq.ft of Ground Footprint}$<br>- Plinth Beams: $0.025\text{ m}^3 / \text{sq.ft of Ground Footprint}$<br>- RCC Columns ($300\times 450$ / $230\times 300$): $0.035\text{ m}^3 / \text{sq.ft of BUA}$<br>- RCC Beams & Slabs ($125\text{mm}$ slab): $0.080\text{ m}^3 / \text{sq.ft of BUA}$<br>- Staircase Waist Slab & Steps: $3.50\text{ m}^3$ per flight<br>$$\text{Total Structural Concrete} = \sum \text{Volumes} \approx 0.145 \text{ to } 0.165\text{ m}^3 / \text{sq.ft of BUA}$$ |
| **Assumptions & Source** | Structural design assumption conforms to IS 456:2000 (Plain and Reinforced Concrete - Code of Practice) and SP:16. |
| **Units & Rounding** | Steel: Tonnes (2 decimal places), Kg (integer); Concrete: Cu.M / $m^3$ (2 decimal places). |
| **Validation** | Minimum steel factor $\ge 2.5\text{ kg/sq.ft}$; maximum $\le 5.0\text{ kg/sq.ft}$. |
| **Quantity Derivation** | Calculated via structural empirical rules based on BUA and floor height. |
| **Customer Selection** | Steel Brand dropdown; Concrete Grade radio button (M20 Site Mix / M25 Ready-Mix). |
| **Unit Rate Applied** | Steel: ₹68,000 to ₹78,000 / Tonne (depends on brand: Tata Tiscon ₹76,000, JSW ₹74,000); Concrete M20: ₹4,500 / $m^3$; Concrete M25: ₹5,100 / $m^3$. |
| **Line Cost** | $\text{Steel Cost} = \text{Tonnes} \times \text{Unit Rate}$; $\text{Concrete Cost} = \text{Cu.M} \times \text{Unit Rate}$. |
| **BOQ Line Items** | - `STR-001`: "Supplying and placing Fe 550D TMT thermo-mechanically treated rebar reinforcement including cutting, bending, binding with 18G wire, and placement."<br>- `STR-002`: "Providing and laying reinforced cement concrete M20/M25 design mix in foundations, columns, beams, and slabs."<br>- `STR-003`: "Centring, shuttering, and propping using film-faced plywood and steel props." |
| **Report / PDF Placement** | Chapter 3 Core Materials; Section A BOQ (Structural Works); Section B Material Schedule. |

---

### Category 06: Cement, Sand & Aggregates

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/cement.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/cement.ts#L25-L85), [`src/calculation-engine/modules/brick.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/brick.ts#L180-L240) |
| **Primary Inputs** | `totalBUASqFt`, `cementBrand` (UltraTech, ACC, Birla Super, Dalmia, Ramco, Zuari), masonry choice (AAC / Red Brick / Solid Concrete Block). |
| **Formula / Engine Logic** | 1. **Cement Bags Takeoff:**<br>$$\text{Base Benchmark} = 0.40 \text{ to } 0.43\text{ bags / sq.ft of BUA}$$<br>Divided into sub-allocations:<br>- RCC Concrete: $0.22\text{ bags / sq.ft}$<br>- Masonry Joint Mortar: $0.06\text{ bags / sq.ft}$ (AAC joint adhesive consumes $0.02\text{ bags equiv}$)<br>- Internal & External Plaster (1:4 & 1:6): $0.12\text{ bags / sq.ft}$<br>- Tile Bedding & Screed: $0.03\text{ bags / sq.ft}$<br>$$\text{Total Cement Bags} = \text{Math.round}(\text{totalBUASqFt} \times \text{cementFactor})$$<br>2. **M-Sand (Manufactured Sand for Mortar & Plaster):**<br>$$\text{M-Sand Volume} = \text{Total Cement Bags} \times 4.2\text{ cu.ft / bag}$$<br>3. **P-Sand (Plastering Fine Sand):**<br>$$\text{P-Sand Volume} = \text{Total Plaster Area (sq.ft)} \times 0.012\text{ cu.ft / sq.ft}$$<br>4. **Coarse Aggregates (20mm & 12mm crushed granite):**<br>$$\text{Coarse Aggregate Volume} = \text{Concrete Volume (Cu.M)} \times 30.5\text{ cu.ft / Cu.M}$$ |
| **Assumptions & Source** | IS 383:2016 coarse and fine aggregate specifications. 1 bag cement $= 50\text{ kg} \approx 1.25\text{ cu.ft}$. |
| **Units & Rounding** | Cement: 50 kg Bags (integer `Math.round`); Sand / Aggregates: Cu.Ft / Tonnes (integer). |
| **Validation** | Bags per sq.ft clamped between $0.35$ and $0.55$. Returns positive non-zero quantity. |
| **Customer Selection** | Cement Brand selector (UltraTech 53 Grade / ACC Concrete Plus / Birla Super). |
| **Unit Rate Applied** | Cement: ₹380 to ₹440 / bag (UltraTech: ₹425, ACC: ₹415); M-Sand: ₹45 / cu.ft; P-Sand: ₹55 / cu.ft; 20mm Aggregates: ₹42 / cu.ft. |
| **Line Cost** | Cement Cost $= \text{Bags} \times \text{Bag Rate}$; Sand/Aggregate Cost $= \text{Cu.Ft} \times \text{Rate/Cu.Ft}$. |
| **BOQ Line Items** | - `CIV-001`: "Ordinary Portland Cement (OPC 53) / Portland Pozzolana Cement (PPC) supplied in 50kg bags."<br>- `CIV-002`: "Supplying and spreading double-washed manufactured M-sand for structural concrete and blockwork."<br>- `CIV-003`: "Supplying graded crushed granite coarse aggregates (20mm down and 12mm down)." |
| **Report / PDF Placement** | Chapter 3 Core Materials; Section B Material Schedule; Procurement Schedule. |

---

### Category 07: AAC Blocks, Clay Bricks & Concrete Blocks

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/brick.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/brick.ts#L45-L179) |
| **Primary Inputs** | `wallingMaterial` ('aac_blocks' \| 'red_clay_bricks' \| 'solid_concrete_blocks' \| 'wire_cut_bricks'), `wallThicknessExternal` (200mm / 8" or 150mm / 6"), `wallThicknessInternal` (100mm / 4"), Space Model perimeters. |
| **Formula / Engine Logic** | 1. **Gross Wall Area Calculation:**<br>$$\text{External Perimeter} = 2 \times (\text{Buildable Length} + \text{Buildable Width})$$<br>$$\text{Gross External Wall Area} = \text{External Perimeter} \times \text{Floor Height} \times \text{Floors}$$<br>$$\text{Gross Internal Wall Area} = \sum (\text{Internal Room Perimeters}) \times \frac{\text{Floor Height}}{2} \times \text{Floors}$$<br>2. **Openings Deductions:**<br>$$\text{Total Deductions} = \sum \text{Door Opening Areas} + \sum \text{Window Opening Areas}$$<br>$$\text{Net Wall Area} = \max(0, \text{Gross Wall Area} - \text{Total Deductions})$$<br>3. **Unit Consumption & Wastage:**<br>- AAC Blocks ($600\times 200\times 150\text{mm}$ / $600\times 200\times 100\text{mm}$): Face Area $= 0.12\text{ m}^2 = 1.2917\text{ sq.ft}$.<br>  $$\text{Base Count} = \frac{\text{Net Wall Area}}{1.2917}$$; $\text{Wastage} = 5\%$; $\text{Final AAC Blocks} = \text{Math.ceil}(\text{Base Count} \times 1.05)$.<br>- Solid Concrete Blocks ($400\times 200\times 150\text{mm}$ / $400\times 200\times 100\text{mm}$): Face Area $= 0.08\text{ m}^2 = 0.861\text{ sq.ft}$; $\text{Wastage} = 7\%$.<br>- Red Wire-Cut Bricks ($230\times 110\times 70\text{mm}$): $\approx 8.5\text{ bricks / sq.ft (4.5" wall)}$, $\approx 17.5\text{ bricks / sq.ft (9" wall)}$; $\text{Wastage} = 10\%$. |
| **Assumptions & Source** | IS 2185 (Concrete masonry units) & IS 2572 (Construction with concrete masonry). Masonry openings deducted at 100% for doors and windows $> 0.5\text{ m}^2$ per IS 1200 Part 3. |
| **Units & Rounding** | Blocks / Bricks: Pieces / Numbers (`Math.ceil`); Net Wall Area: Sq.Ft (`Math.round`). |
| **Validation** | Net Wall Area must be $> 0$; block count validated against structural minimums. |
| **Customer Selection** | Material toggle (AAC Blocks / Red Clay Bricks / Solid Concrete Blocks / Porotherm Blocks) & Brand dropdown (Birla Aerocon, Magicrete, Godrej, Renacon). |
| **Unit Rate Applied** | AAC Blocks: ₹68 / piece (Birla Aerocon); Solid Blocks: ₹46 / piece; Red Wire-Cut: ₹12 / brick; Porotherm Clay: ₹72 / block. |
| **Line Cost** | $\text{Masonry Material Cost} = \text{Pieces} \times \text{Rate/Piece}$. |
| **BOQ Line Items** | - `MAS-001`: "Providing and constructing non-load bearing wall masonry using 150mm/100mm AAC blocks bedded in polymer-modified thin-bed mortar joint."<br>- `MAS-002`: "Providing wire-mesh rebar anchors at every 3rd block course connected to RCC columns." |
| **Report / PDF Placement** | Chapter 3 Core Materials; Section A Works BOQ; Section B Material Schedule. |

---

### Category 08: Flooring, Tiles, Skirting & Dado

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/flooring.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/flooring.ts#L45-L210) |
| **Primary Inputs** | Space Model room areas, `flooringZones` (living, dining, masterBed, otherBeds, kitchen, balcony, utility, staircase), `tileBrand` (Kajaria, Somany, Nitco, Simpolo), `tileSizes` ($1200\times 600$, $800\times 800$, $600\times 600$). |
| **Formula / Engine Logic** | 1. **Floor Tiles Takeoff (by Space):**<br>$$\text{Raw Floor Area} = \sum_{\text{Space } s} \text{RoomArea}_s$$<br>$$\text{Wastage} = 8\% \text{ to } 10\% \text{ (depending on tile format)}$$<br>$$\text{Gross Floor Tile Area}_s = \text{Math.round}(\text{RoomArea}_s \times (1 + \text{Wastage}))$$<br>2. **Bathroom Wall Dado Tiles:**<br>For each bathroom instance: $\text{Perimeter} \times 7\text{ ft (lintel height)} - \text{Door Area } (21\text{ sq.ft})$.<br>$$\text{Bathroom Dado Area} = \sum (\text{Bathroom Dado Takeoff}) \times 1.08\text{ (wastage)}$$<br>3. **Kitchen Wall Dado Tiles:**<br>$\text{Kitchen Counter Length } (10\text{ ft}) \times 2\text{ ft height above counter} = 20\text{ sq.ft per kitchen} \times 1.08$.<br>4. **Skirting Tiles:**<br>$$\text{Skirting Length} = \sum (\text{Room Perimeters}) - \sum (\text{Door Widths})$$<br>$$\text{Skirting Area} = \text{Skirting Length} \times 0.33\text{ ft (4 inches height)}$$<br>5. **Staircase Steps (Granite / Marble Treads & Risers):**<br>$18\text{ steps per floor flight} \times 3.5\text{ ft width} \times (1.0\text{ ft tread} + 0.5\text{ ft riser}) = 94.5\text{ sq.ft / flight}$.<br>6. **Wet Area Waterproofing:**<br>Bathrooms: Floor area $+ (1\text{ ft dado upturn}) \times \text{Perimeter}$. Terrace: Floor slab area $+ 1\text{ ft parapet upturn}$. |
| **Assumptions & Source** | Standard IS 1443 (laying and finishing of cement concrete and ceramic floors). Tile cutting wastage benchmark: 8% for vitrified, 10% for large format slabs. |
| **Units & Rounding** | Sq.Ft (`Math.round`). |
| **Validation** | Positive area for every configured space. |
| **Customer Selection** | Chapter 4: Vitrified Glazed (GVT) / Polished Vitrified (PVT) / Italian Marble / Granite / Anti-skid ceramic. Size, brand, and space-by-space override. |
| **Unit Rate Applied** | Vitrified Tiles $1200\times 600$: ₹95 to ₹135 / sq.ft; Anti-skid Bathroom: ₹65 to ₹85 / sq.ft; Granite (Sadarhalli / Black Galaxy): ₹140 to ₹220 / sq.ft; Italian Marble: ₹450 / sq.ft. |
| **Line Cost** | $\text{Line Cost} = \text{Gross Tile Area} \times (\text{Tile Material Rate} + \text{Laying / Bedding Mortar Rate})$. |
| **BOQ Line Items** | - `FLR-001`: "Supplying and fixing 1200x600mm glazed vitrified tiles (GVT) in living, dining, and bedrooms over 20mm cement mortar bed."<br>- `FLR-002`: "Supplying and fixing anti-skid ceramic floor tiles in bathrooms and balconies."<br>- `FLR-003`: "Providing and fixing 300x600mm glazed ceramic wall dado tiles up to 7ft lintel height in toilets."<br>- `FLR-004`: "Providing and fixing 18mm thick machine-polished flame-cut granite slabs for staircase treads and risers."<br>- `FLR-005`: "Two-coat polymer modified cementitious elastomeric waterproofing membrane in toilet sunken slabs." |
| **Report / PDF Placement** | Chapter 4 Flooring Breakdown; Section A Works BOQ; Section B Material Schedule. |

---

### Category 09: Doors & Windows

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/doors.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/doors.ts#L40-L150), [`src/calculation-engine/modules/windows.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/windows.ts#L40-L150) |
| **Primary Inputs** | Space Model room counts, door specifications (`mainDoorType`, `internalDoorType`, `toiletDoorType`), window specifications (`windowFrameType`, `glazingType`, `grillType`). |
| **Formula / Engine Logic** | 1. **Door Count & Dimension Schedule:**<br>- Main Entrance Door: 1 unit per dwelling ($3.5\text{ ft} \times 7.0\text{ ft} = 24.5\text{ sq.ft}$).<br>- Internal Bedroom / Study Doors: 1 unit per bedroom/study ($3.0\text{ ft} \times 7.0\text{ ft} = 21.0\text{ sq.ft}$).<br>- Bathroom / Utility Doors: 1 unit per bathroom/utility ($2.5\text{ ft} \times 7.0\text{ ft} = 17.5\text{ sq.ft}$).<br>- Balcony Sliding French Doors: 1 unit per balcony ($5.0\text{ ft} \times 7.0\text{ ft} = 35.0\text{ sq.ft}$).<br>$$\text{Total Doors Count} = 1 + \text{Bedrooms} + \text{Bathrooms} + \text{Balconies}$$<br>$$\text{Door Opening Area Deducted} = \sum (\text{Door Count}_k \times \text{Opening Area}_k)$$<br>2. **Window Count & Dimension Schedule:**<br>- Living Room Window (W1): $6.0\text{ ft} \times 4.5\text{ ft} = 27.0\text{ sq.ft}$ per living room.<br>- Bedroom Window (W2): $5.0\text{ ft} \times 4.0\text{ ft} = 20.0\text{ sq.ft}$ per bedroom.<br>- Kitchen Window (W3): $4.0\text{ ft} \times 3.0\text{ ft} = 12.0\text{ sq.ft}$ per kitchen.<br>- Toilet Ventilator (V1): $2.0\text{ ft} \times 2.0\text{ ft} = 4.0\text{ sq.ft}$ with louvered frosted glass.<br>$$\text{Total Window Area} = \sum (\text{Window Count}_j \times \text{Window Area}_j)$$<br>3. **Security Grills Takeoff:** $\text{Grill Area} = \text{Total Window Area (excluding French doors)} \times 1.0$. |
| **Assumptions & Source** | NBC 2016 Part 3 ventilation standards: Aggregate window opening area must exceed 1/10th of carpet area. |
| **Units & Rounding** | Count: Numbers (integer); Area: Sq.Ft (`Math.round`). |
| **Validation** | Main door count $\ge 1$; all bathroom doors must match bathroom count. |
| **Customer Selection** | Chapter 5: Main Door (Teak Wood Carved / Engineered Wood / Flush Door); Internal Doors (Laminated Flush / Membrane / HDF); Toilet Doors (FRP / WPC Waterproof); Windows (UPVC 2.5-track with mosquito mesh / Anodized Aluminium / Teak Wood). |
| **Unit Rate Applied** | Main Teak Door Complete: ₹45,000 / unit; Internal Laminated Door: ₹12,500 / unit; WPC Toilet Door: ₹8,500 / unit; UPVC Windows with Mesh: ₹650 / sq.ft; MS Window Grills: ₹220 / sq.ft. |
| **Line Cost** | Door Unit Cost $= \text{Count} \times \text{Rate/Unit}$; Window Cost $= \text{Window Area} \times \text{Window Rate/Sq.Ft}$. |
| **BOQ Line Items** | - `DR-001`: "Supplying and fixing Burma/CP teak wood door frame with 38mm thick solid flush shutter and brass hardware."<br>- `DR-002`: "Supplying and fixing factory-moulded laminate-faced internal flush doors with red sal wood frames."<br>- `DR-003`: "Providing and fixing waterproof WPC / FRP door frames and shutters for bathrooms."<br>- `WIN-001`: "Supplying and installing 2.5-track UPVC sliding window frames with 5mm clear float glass and SS mosquito mesh."<br>- `WIN-002`: "Providing and fixing mild steel (MS) security window grills fabricated from 10mm square bars." |
| **Report / PDF Placement** | Chapter 5 Doors & Windows Schedule Table; Section A Works BOQ; Section C Fixture Schedule. |

---

### Category 10: Electrical Points, Wiring & Switches

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/electrical.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/electrical.ts#L40-L240) |
| **Primary Inputs** | Space Model room counts, `wiringBrand` (Finolex, Polycab, Havells, KEI), `switchBrand` (Legrand Arteor, Schneider Vivace, Anchor Roma, GM Modular), EV Charger option, Inverter backup option. |
| **Formula / Engine Logic** | 1. **Electrical Point Takeoff (Room-Wise Engineering Model):**<br>- Living Room: 6 light points, 2 fan points, 4 6A sockets, 1 16A TV point, 1 AC point $= 14\text{ points}$.<br>- Master Bedroom: 4 light points, 1 fan point, 3 6A sockets, 1 16A AC point, 1 16A geyser point (toilet) $= 10\text{ points}$.<br>- Other Bedroom: 3 light points, 1 fan point, 2 6A sockets, 1 16A AC point $= 7\text{ points}$.<br>- Kitchen: 3 light points, 1 exhaust fan, 4 16A power sockets (fridge, microwave, mixer, chimney) $= 9\text{ points}$.<br>- Bathroom: 2 light points, 1 mirror light, 1 exhaust point, 1 16A geyser point $= 5\text{ points}$.<br>- Balcony / Utility: 2 light points, 1 16A washing machine point $= 3\text{ points}$.<br>- External / Staircase: 6 light points per floor.<br>$$\text{Total Points} = \sum \text{Room Points}$$<br>2. **Conduit Pipe Takeoff:** $\text{Heavy Gauge FRLS PVC Conduits (25mm)} = \text{Total Points} \times 3.2\text{ metres/point}$.<br>3. **Copper Wire Takeoff (by Cross-Sectional Area):**<br>- 1.5 sq.mm (Lighting circuits): $\text{Lighting Points} \times 6.5\text{ metres} = L_{1.5}$<br>- 2.5 sq.mm (6A socket & ring mains): $\text{Socket Points} \times 7.5\text{ metres} = L_{2.5}$<br>- 4.0 sq.mm (Dedicated AC / Geyser power circuits): $\text{Power Points} \times 9.0\text{ metres} = L_{4.0}$<br>- 6.0 sq.mm (Sub-mains from Main DB to Floor DBs): $\text{Floors} \times 28.0\text{ metres} = L_{6.0}$<br>$$\text{Total Wire Length} = L_{1.5} + L_{2.5} + L_{4.0} + L_{6.0}$$<br>4. **Distribution Boards & Earthing:** Main 8-way TPN DB $= 1$; Floor 4-way SPN DB $= \text{Floors}$; Copper plate earthing pits $= 2$. |
| **Assumptions & Source** | National Electrical Code of India (NEC 2011) & IS 732 (Code of practice for electrical wiring). |
| **Units & Rounding** | Points: Count (integer); Wire / Conduit: Metres (`Math.round`); Switch Modules: Count (integer). |
| **Validation** | Minimum 1 DB per floor. Power circuits wired independently without daisy chaining. |
| **Customer Selection** | Chapter 6: Switch Brand selector & Wire Brand selector; EV Charger toggle; Solar conduit provisioning. |
| **Unit Rate Applied** | Point Wiring Rate (conduit + wire + box + switch): ₹950 to ₹1,450 / point; 16A Power Point: ₹1,650 / point; AC Point dedicated: ₹2,200 / point; EV Charger Point: ₹6,500 / unit; Main DB: ₹8,500 / unit. |
| **Line Cost** | Electrical Cost $= \sum (\text{Points} \times \text{Point Rate}) + \sum (\text{DBs} \times \text{DB Rate})$. |
| **BOQ Line Items** | - `ELE-001`: "Concealed conduit point wiring for primary lighting and ceiling fans using 1.5 sq.mm FRLS copper wire in 25mm PVC conduits."<br>- `ELE-002`: "Providing and wiring 16A 3-pin power plug points using 4.0 sq.mm FRLS copper wire for geysers and air conditioners."<br>- `ELE-003`: "Supplying and mounting modular grid plates, switches, and sockets."<br>- `ELE-004`: "Supplying and installing 8-way TPN MCB distribution board with 40A 4-pole RCCB." |
| **Report / PDF Placement** | Chapter 6 Electrical Takeoff; Section A Works BOQ; Section B Material Schedule; Section C Fixture Schedule. |

---

### Category 11: Plumbing, Sanitaryware & Tanks

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/plumbing.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/plumbing.ts#L40-L220) |
| **Primary Inputs** | Space Model bathroom count, kitchen count, utility count, `sanitaryBrand` (Kohler, Jaquar, Hindware, Cera, Grohe), `pipeBrand` (Astral, Ashirvad, Supreme, Prince). |
| **Formula / Engine Logic** | 1. **Water Supply Points Takeoff:**<br>- Each Bathroom: 1 hot CPVC point (geyser), 1 cold CPVC point (geyser), 1 shower diverter, 1 bib cock, 1 health faucet, 1 wash basin bib cock, 1 cistern supply $= 7\text{ points}$.<br>- Each Kitchen: 1 cold tap, 1 hot geyser point, 1 RO water purifier point $= 3\text{ points}$.<br>- Utility: 1 washing machine tap, 1 wash sink tap $= 2\text{ points}$.<br>$$\text{Total Water Points} = \text{Bathrooms} \times 7 + \text{Kitchens} \times 3 + \text{Utilities} \times 2$$<br>2. **CPVC / UPVC Internal Supply Piping:** $\text{Length} = \text{Total Water Points} \times 4.5\text{ metres/point}$.<br>3. **SWR Drainage Points Takeoff (Waste & Soil):**<br>- 1 WC Soil outlet (110mm / 4" pipe).<br>- 1 Floor Trap / Shower drain (75mm / 3" pipe).<br>- 1 Wash Basin waste outlet (50mm / 2" pipe).<br>$$\text{SWR Pipe Length} = \text{Bathrooms} \times 12\text{ metres} + \text{Kitchens} \times 6\text{ metres} + \text{Vertical Rainwater Stacks}$$.<br>4. **Storage Tank Capacity Takeoff:**<br>$$\text{Occupancy Benchmark} = 5\text{ persons / dwelling unit}$$; $\text{Water Consumption} = 135\text{ litres / capita / day (lpcd)}$$<br>$$\text{Daily Demand} = 5 \times 135 \times \text{Dwelling Units} = 675 \text{ to } 1,350\text{ litres / day}$$<br>$$\text{Overhead Tank (OHT)} = 1,000 \text{ to } 2,000\text{ litres (Triple-layer UV stabilized)}$$<br>$$\text{Underground RCC Sump} = \text{Daily Demand} \times 3\text{ days storage} \approx 4,000 \text{ to } 8,000\text{ litres}$$. |
| **Assumptions & Source** | IS 1172 (Basic requirements for water supply, drainage and sanitation) & NBC 2016 Part 9. |
| **Units & Rounding** | Fixtures / Points: Count (integer); Pipe Length: Metres (`Math.round`); Tank Volume: Litres (integer). |
| **Validation** | Minimum 1 overhead tank $\ge 1,000\text{ L}$; minimum 1 Underground Sump $\ge 3,000\text{ L}$. |
| **Customer Selection** | Chapter 6: Sanitary Brand selector (Jaquar / Kohler / Hindware); Fixture Type (Wall-hung WC with concealed flush tank vs Floor-mounted EWC). |
| **Unit Rate Applied** | Bathroom Sanitaryware & CP Fitting Set: ₹22,000 to ₹65,000 / bathroom; CPVC/SWR Internal Plumbing Rough-in: ₹8,500 / bathroom; Overhead PVC Tank: ₹9.5 / litre; Underground RCC Sump: ₹18 / litre capacity. |
| **Line Cost** | Plumbing Cost $= \sum (\text{Bathroom Sets} \times \text{Set Rate}) + \text{Tank Costs} + \text{Piping Line Costs}$. |
| **BOQ Line Items** | - `PLB-001`: "Supplying and laying SDR 11 CPVC hot and cold internal water supply piping concealed in wall chases."<br>- `PLB-002`: "Supplying and fixing SWR PVC drainage and soil waste pipes including multi-floor traps."<br>- `PLB-003`: "Providing and fixing premium wall-hung EWC with soft-close seat cover and concealed dual-flush cistern."<br>- `PLB-004`: "Supplying and fixing single-lever concealed thermostatic shower diverter with overhead rain shower."<br>- `PLB-005`: "Supplying and placing 1500-litre triple-layer food-grade polyethylene overhead storage water tank." |
| **Report / PDF Placement** | Chapter 6 Plumbing Section; Section A Works BOQ; Section C Fixture Schedule. |

---

### Category 12: Paint & Surface Areas

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/paint.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/paint.ts#L40-L195) |
| **Primary Inputs** | Space Model gross internal wall areas, ceiling areas, door/window deductions, `paintTier` (Standard / Premium / Luxury), `paintBrand` (Asian Paints, Berger, Nerolac, Dulux). |
| **Formula / Engine Logic** | 1. **Internal Paintable Area:**<br>$$\text{Internal Gross Wall Area} = \sum (\text{Room Perimeters}) \times \text{Clear Height}$$<br>$$\text{Internal Deductions} = \sum \text{Internal Door Openings} + \sum \text{Window Openings}$$<br>$$\text{Net Internal Wall Area} = \text{Internal Gross Wall Area} - \text{Internal Deductions}$$<br>$$\text{Ceiling Area} = \text{Total Carpet Area (sq.ft)}$$<br>$$\text{Total Interior Paintable Area} = \text{Net Internal Wall Area} + \text{Ceiling Area}$$<br>2. **Exterior Paintable Area:**<br>$$\text{Exterior Wall Perimeter} = 2 \times (\text{Buildable Length} + \text{Buildable Width})$$<br>$$\text{Exterior Gross Area} = \text{Exterior Perimeter} \times (\text{Total Building Height} + \text{Parapet Height (3.5 ft)})$$<br>$$\text{Exterior Deductions} = \sum \text{External Openings (Windows, Main Door, Balconies)}$$<br>$$\text{Net Exterior Paintable Area} = \text{Exterior Gross Area} - \text{Exterior Deductions}$$<br>3. **Material Litres & Putty Kg Takeoff:**<br>- Wall Putty: 2 coats applied over plaster. Coverage $= 8.5\text{ sq.ft / kg}$.<br>  $$\text{Putty Required (kg)} = \frac{\text{Total Interior Area}}{8.5}$$<br>- Interior Primer: 1 coat. Coverage $= 120\text{ sq.ft / litre}$.<br>- Interior Emulsion (2 coats): Coverage $= 65\text{ sq.ft / litre}$ (for 2 coats).<br>  $$\text{Interior Paint Litres} = \frac{\text{Total Interior Area}}{65}$$<br>- Exterior Weatherproof Acrylic Emulsion (2 coats): Coverage $= 55\text{ sq.ft / litre}$ (for 2 coats).<br>  $$\text{Exterior Paint Litres} = \frac{\text{Net Exterior Area}}{55}$$ |
| **Assumptions & Source** | IS 5410 (Specification for cement paint) & IS 5411 (Plastic emulsion paint for interior use). Standard 2-coat paint system over 2 coats acrylic putty and 1 coat water-thinnable primer. |
| **Units & Rounding** | Area: Sq.Ft (`Math.round`); Paint: Litres (`Math.ceil`); Putty: Kilograms (`Math.ceil`). |
| **Validation** | Paintable area $> 0$. Paint consumption strictly linked to net wall area. |
| **Customer Selection** | Chapter 6: Interior Paint Tier (Royale Luxury Emulsion / Premium Emulsion / Tractor Emulsion); Exterior Paint Brand (Apex Ultima / WeatherCoat Long Life). |
| **Unit Rate Applied** | Interior Premium Paint (Putty + Primer + 2 Coats Royale): ₹28 to ₹38 / sq.ft; Exterior Weatherproof Paint (Primer + 2 Coats Apex Ultima): ₹32 to ₹44 / sq.ft. |
| **Line Cost** | Interior Paint Cost $= \text{Interior Area} \times \text{Rate/Sq.Ft}$; Exterior Paint Cost $= \text{Exterior Area} \times \text{Rate/Sq.Ft}$. |
| **BOQ Line Items** | - `PNT-001`: "Applying two coats of acrylic wall putty over prepared plastered surfaces including thorough sandpapering."<br>- `PNT-002`: "Applying one coat of water-based interior primer followed by two coats of Asian Paints Royale luxury emulsion."<br>- `PNT-003`: "Applying exterior acrylic primer followed by two coats of anti-algal exterior emulsion (Apex Ultima) on exterior elevations." |
| **Report / PDF Placement** | Chapter 6 Painting Section; Section A Works BOQ; Section B Material Schedule. |

---

### Category 13: Railings, Gates & Fabrication

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/boq.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/boq.ts#L420-L490) |
| **Primary Inputs** | Balcony counts and perimeters, staircase flight count, compound wall length, `railingType` (SS304 with toughened glass, MS designer, wrought iron). |
| **Formula / Engine Logic** | 1. **Balcony Railing Length:**<br>$$\text{Balcony Railing R.Ft} = \sum (\text{Balcony Exposed Lengths}) \approx 10\text{ R.Ft per balcony}$$<br>$$\text{Balcony Railing Height} = 3.5\text{ ft (safety standard)}$$<br>2. **Staircase Handrail Length:**<br>$$\text{Handrail Length} = \text{Flights} \times 14\text{ R.Ft per flight}$$<br>3. **Main Compound Entrance Gate:**<br>$$\text{Gate Width} = 12\text{ ft (vehicular)} + 3\text{ ft (pedestrian)} = 15\text{ ft}$$; $\text{Gate Height} = 6.0\text{ ft}$<br>$$\text{Gate Area} = 90\text{ sq.ft}$$; $\text{Estimated MS Weight} = 90 \times 4.5\text{ kg/sq.ft} = 405\text{ kg}$$. |
| **Assumptions & Source** | NBC 2016 Part 3 Clause 4.8 (Balcony & Staircase Handrail minimum height: $1,050\text{mm} = 3.44\text{ ft}$). |
| **Units & Rounding** | Railing: Running Feet (R.Ft); Main Gate: Sq.Ft / Kg (`Math.round`). |
| **Validation** | Clamped to non-negative lengths; applied whenever balconies or staircases exist. |
| **Customer Selection** | Chapter 6 Finishing options: Stainless Steel 304 with 10mm Toughened Glass vs Mild Steel (MS) Powder Coated. |
| **Unit Rate Applied** | SS304 + Toughened Glass Railing: ₹2,400 / R.Ft; MS Powder Coated Railing: ₹950 / R.Ft; MS Main Gate: ₹450 / sq.ft. |
| **Line Cost** | Railing Cost $= \text{R.Ft} \times \text{Rate/R.Ft}$; Gate Cost $= \text{Gate Area} \times \text{Rate/Sq.Ft}$. |
| **BOQ Line Items** | - `FAB-001`: "Fabricating and installing SS304 stainless steel handrails with 10mm toughened glass infill panels for balconies."<br>- `FAB-002`: "Providing and fixing SS304 cylindrical pipe handrails with balusters for internal staircase."<br>- `FAB-003`: "Fabricating and fixing heavy-duty MS decorative sliding/hinged entrance gate with anti-rust zinc chromate primer." |
| **Report / PDF Placement** | Section A Works BOQ (Metal & Fabrication Works); Section C Fixture Schedule. |

---

### Category 14: Elevation & Cladding

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/boq.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/boq.ts#L491-L540) |
| **Primary Inputs** | `elevationStyle` (Modern / Contemporary / Classical / Minimalist), `claddingMaterial` (Natural stone / HPL wooden sheets / Shera cement boards / Grooved plaster), `elevationAreaSqFt`. |
| **Formula / Engine Logic** | 1. **Elevation Cladding Feature Area:**<br>Benchmark assumption: $15\% \text{ to } 20\%$ of Front Elevation Wall Surface is treated with premium architectural cladding.<br>$$\text{Front Wall Surface} = \text{Buildable Width} \times \text{Total Building Height}$$<br>$$\text{Cladding Area} = \text{Front Wall Surface} \times 0.18$$<br>2. **Groove Plastering & CNC Jali Takeoff:**<br>$$\text{CNC Metal / Terracotta Jali Area} = 40 \text{ to } 60\text{ sq.ft}$$ (if Modern/Contemporary chosen). |
| **Assumptions & Source** | Architectural façade benchmark per Hutty Pilot Specification Section 26. |
| **Units & Rounding** | Sq.Ft (`Math.round`). |
| **Validation** | Clamped to front facade dimensions. |
| **Customer Selection** | Chapter 6: Architectural Elevation selection & Exterior Accent Cladding dropdown. |
| **Unit Rate Applied** | Natural Stone Cladding (Slate / Travertine): ₹280 / sq.ft; HPL Wooden Exterior Sheets: ₹320 / sq.ft; Exterior Texture Plaster: ₹95 / sq.ft. |
| **Line Cost** | $\text{Elevation Cost} = \text{Cladding Area} \times \text{Unit Rate}$. |
| **BOQ Line Items** | - `ELV-001`: "Supplying and fixing natural stone dry cladding / tile cladding on front architectural elevation features."<br>- `ELV-002`: "Supplying and fixing High Pressure Laminate (HPL) exterior grade wooden cladding panels on aluminium framework." |
| **Report / PDF Placement** | Section A Works BOQ (Elevation & Façade Works); Executive Estimate Summary. |

---

### Category 15: Labour & Installation Takeoff

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/labour.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/labour.ts#L35-L180) |
| **Primary Inputs** | `totalBUASqFt`, concrete volume, masonry units, tile areas, paint areas, electrical points, plumbing points. |
| **Formula / Engine Logic** | 1. **Trade-by-Trade Labour Itemization:**<br>- Earthwork Excavation & Backfilling: ₹18 / sq.ft of ground footprint.<br>- Bar Bending & Rebar Fixing: ₹8.5 / kg of steel ($= \text{₹8,500 / Tonne}$).<br>- Formwork & Centring Labour: ₹38 / sq.ft of shuttering contact area.<br>- Concrete Pouring & Compaction Labour: ₹480 / $m^3$ of concrete.<br>- Masonry Block Laying Labour: ₹18 / sq.ft of net wall area.<br>- Internal & External Plastering Labour: ₹24 / sq.ft of plastered surface.<br>- Tile Laying & Grouting Labour: ₹35 / sq.ft of floor and dado tile area.<br>- Plumbing Rough-in & Fixture Installation: ₹3,500 / bathroom.<br>- Electrical Conduiting, Wiring & Switch Plate Fitting: ₹250 / point.<br>- Painting Labour (3-coat system): ₹14 / sq.ft of interior & exterior area.<br>$$\text{Total Direct Labour Cost} = \sum (\text{Trade Quantity}_k \times \text{Trade Labour Rate}_k)$$<br>2. **Labour Ratio Calibration:** Conforms strictly to Indian construction cost norms: Direct Labour $= 25\% \text{ to } 28\%$ of Direct Construction Cost. |
| **Assumptions & Source** | Standard Schedule of Rates (CPWD / KPWD SR 2024-2025) piece-rate labor benchmarks. |
| **Units & Rounding** | Rupees (₹ integer `Math.round`). |
| **Validation** | Reconciled against total project cost; checked in QA Gate (`qaGate.ts`). |
| **Customer Selection** | Reflected dynamically when user chooses between Contractor Mode and Independent Mode. |
| **Downstream Impact** | Feeds Budget Head `labour` in Section D and Labour Schedule in Section E. |
| **BOQ / Report Placement** | Section D Budget Table; Section E Labour Schedule; Contractor Labour Budget Card. |

---

### Category 16: Taxes, Commercial Markups & Contingency

| Parameter | Details |
| :--- | :--- |
| **Source Module** | [`src/calculation-engine/modules/budget.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/budget.ts#L40-L190) |
| **Primary Inputs** | `contractorMode` ('contractor' \| 'independent'), `contractorMarginRate` (default 0.10 or 0.15), `contingencyRate` (default 0.06), `professionalFeesRate` (default 0.05), `applyContractorGST` (boolean), `city`. |
| **Formula / Engine Logic** | 1. **Direct Construction Budget ($C_{\text{direct}}$):**<br>$$C_{\text{direct}} = \sum (\text{Works BOQ Items}) = \text{Materials} + \text{Fixtures} + \text{Labour}$$<br>2. **Commercial Additions (Contractor Mode):**<br>- Professional Architecture & Engineering Fees (5%):<br>  $$F_{\text{prof}} = \text{Math.round}(C_{\text{direct}} \times 0.05)$$<br>- Contractor Execution Margin (10% to 15%):<br>  $$M_{\text{contractor}} = \text{Math.round}(C_{\text{direct}} \times \text{contractorMarginRate})$$<br>- Contingency Reserve (Unforeseen site variations 6%):<br>  $$R_{\text{contingency}} = \text{Math.round}(C_{\text{direct}} \times 0.06)$$<br>3. **Contractor Statutory GST (18%):**<br>$$\text{Taxable Commercial Base} = C_{\text{direct}} + M_{\text{contractor}} + F_{\text{prof}}$$<br>$$\text{GST Amount} = \text{Math.round}(\text{Taxable Commercial Base} \times 0.18)$$ (applied when GST toggle active)<br>4. **Total Project Cost & sq.ft Rates:**<br>$$C_{\text{total}} = C_{\text{direct}} + M_{\text{contractor}} + R_{\text{contingency}} + F_{\text{prof}} + \text{GST Amount}$$<br>$$\text{Direct Cost / Sq.Ft} = \frac{C_{\text{direct}}}{\text{Total BUA}}$$; $\text{Total Cost / Sq.Ft} = \frac{C_{\text{total}}}{\text{Total BUA}}$<br>5. **Zero-Residual Check:**<br>$$\text{Residual} = C_{\text{total}} - (C_{\text{direct}} + M_{\text{contractor}} + R_{\text{contingency}} + F_{\text{prof}} + \text{GST Amount}) \equiv 0.00$$ |
| **Assumptions & Source** | Indian Goods and Services Tax Act (Works Contract Service GST @ 18% HSN 9954); standard architectural fee scale (Council of Architecture India). |
| **Units & Rounding** | Rupees (₹ integer `Math.round`); Cost/sq.ft (₹ integer). |
| **Validation** | QA Gate Rule `COMMERCIAL_RECONCILIATION_VALID`: Residual must equal 0. No NaN or Infinity. |
| **Customer Selection** | Chapter 7 / Estimate Review: "Hiring a General Contractor" vs "Managing My Own Labour"; Margin slider; GST toggle. |
| **BOQ / Report Placement** | Chapter 7 Cost Summary; Section D Budget Heads Table; Commercial Reconciliation Card in PDF. |

---

## 3. Summary of Discrepancies, Gaps & Architectural Insights

From our exhaustive audit of the 16 calculation categories, the following critical architectural findings emerge:

1. **Space Model Completeness vs UI Exposure:**
   - The backend engine [`spaceModel.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/spaceModel.ts) fully supports individual room types (Pooja, Study, Home Theatre, Balcony, Utility).
   - However, the current frontend wizard UI (`Stage4Rooms.tsx`) only exposes bedrooms, bathrooms, kitchens, and balconies. Specialized rooms are synthesized automatically via defaults rather than being directly controlled by the user.
2. **Flooring Zone Override Capabilities:**
   - The engine [`flooring.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/flooring.ts) supports granular flooring zones with individual overrides.
   - The client brief mandates that Chapter 4 must support: (a) Individual choices, (b) "Apply to all similar spaces", and (c) Individual room overrides. The current wizard UI currently nests this in tabs under Stage 6, which compresses the visual presentation. Elevating this to a dedicated Chapter 4 will directly satisfy the client specification.
3. **Dedicated Doors & Windows Chapter:**
   - The engine [`doors.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/doors.ts) and [`windows.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/windows.ts) generate complete itemized schedules with lintels, sills, and hardware.
   - In the frontend, doors and windows are currently crammed alongside electrical, plumbing, and paint inside Stage 6. Moving Doors & Windows into dedicated Chapter 5 will give it the prominence demanded in the client brief.
4. **Mathematical Integrity Verified:**
   - In all 16 categories, quantities reconcile 100% with $\text{Amount} = \text{Quantity} \times \text{Rate}$.
   - No hardcoded total overrides exist.
   - QA Gate (`qaGate.ts`) automatically validates that all line amounts sum up precisely to the category and project totals.

