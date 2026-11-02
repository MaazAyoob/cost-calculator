# Hutty 3.1 Chapter Visual Consistency & UI Harmony Report
**Phase 06 Deliverable 05 — Chapter Visual Consistency**  
*Document Version: 1.0.0 • Date: November 2026 • Environment: Production / Pre-Release*

---

## 1. Executive Summary

The Hutty 3.1 estimation experience is structured into seven sequential planning chapters. In earlier versions, each chapter had minor inconsistencies in background color, border tones, button styles, and quantity cards.

In Phase 06, all seven chapters were unified under the **Architectural Design System**:
- Base canvas: Warm Ivory (`#F7F3EA`)
- Framing & card boundaries: Sandstone (`#E9DDC9`)
- Primary brand headings & action buttons: Deep Forest (`#183B32`)
- Architectural highlights & active selections: Terracotta (`#C66B4E`)
- Text hierarchy: Charcoal (`#202824`) for headings/primary, Slate (`#66716B`) for secondary metadata.

---

## 2. Chapter-by-Chapter Consistency Audit

### 2.1 Chapter 1: Plot & Setbacks (`Chapter1PlotSetbacks.tsx`)
- **Visual Foundation:** Warm Ivory card surface with Sandstone borders.
- **Plot Dimension Presets:** 4 standard Bangalore cards (`20x30`, `30x40`, `30x50`, `40x60`) styled with Deep Forest active states and Terracotta dots.
- **Municipal Setback Controls:** Front, rear, and side setback sliders and inputs styled with consistent 44px min-touch steppers.
- **Buildable Footprint Canvas:** Drafting grid with Deep Forest plot envelope and Soft Sage setback lines.

### 2.2 Chapter 2: Dream Home & Spaces (`Chapter2DreamHome.tsx`)
- **Visual Foundation:** Clean structured grid with room allocation steppers.
- **Storey Configuration:** Floor selection tabs styled with Deep Forest active background and Terracotta indicator.
- **Room Allocation Cards:** Bedroom, bathroom, kitchen, dining, and living room counters styled with Sandstone borders and clear numerical displays.
- **Parking & Space Planning:** Clear homeowner-friendly parking space planning disclaimers (120 sq.ft car, 180 sq.ft stilt, 35 sq.ft bike).

### 2.3 Chapter 3: Core Construction Materials (`Chapter3CoreMaterials.tsx`)
- **Visual Foundation:** Rich material cards celebrating foundational civil components.
- **Material Takeoff Cards:**
  - Steel: Fe550D rebar in tonnes (3.60 kg/sq.ft BUA thumb rule).
  - Cement: Grade 53 in bags (0.45 bags/sq.ft BUA).
  - Fine Aggregate: Engineered M-Sand & P-Sand in CFT.
  - Coarse Aggregate: 20mm & 40mm down aggregates in CFT.
  - Masonry: Solid concrete blocks, AAC blocks, or clay bricks.
- **Brand Transparency:** Side-by-side brand selection (Tata Tiscon, JSW Steel, UltraTech, ACC) with zero layout shifts.

### 2.4 Stage 4: Buildable Space & Setbacks (`Stage4BuildableSpace.tsx`)
- **Visual Foundation:** Architectural technical drafting representation.
- **Permissible Envelope Summary:** Floor Area Ratio (FAR), Ground Coverage (%), and Setback offsets clearly displayed in tabular monospace cards.
- **Visualizer Integration:** Instant synchronization with the right-hand massing snapshot.

### 2.5 Chapter 4: Flooring & Tiles by Space (`Chapter4Flooring.tsx`)
- **Visual Foundation:** Space-by-space surface finish selectors.
- **Flooring Zones:** Vitrified tiles, Italian marble, granite slabs, anti-skid bathroom ceramic, heavy-duty parking tiles.
- **Quantity Display:** Exact net floor area with standard 10% cutting waste allowance clearly itemized.

### 2.6 Chapter 5: Doors & Windows (`Chapter5DoorsWindows.tsx`)
- **Visual Foundation:** Architectural joinery selection panels.
- **Main Door, Internal Doors & Bathroom Doors:** Teak wood, flush doors, and WPC waterproof doors.
- **Window Profiles:** Standard vs premium uPVC and powder-coated aluminum profiles with glass specifications.

### 2.7 Chapter 6: Electrical, Plumbing & Finishes (`Chapter6Finishes.tsx` & `Stage6FinishesMaterials.tsx`)
- **Visual Foundation:** MEP engineering and wall finishes specifications.
- **Electrical & Wiring:** ISI marked heavy-duty PVC conduits, modular switches, and copper wiring grades.
- **Plumbing & Sanitary:** CPVC/UPVC piping, sanitaryware brand tiers (Cera, Jaquar, Kohler, Toto).
- **Internal & External Paint:** Acrylic wall putty, primer, and weather-proof emulsion coatings.

### 2.8 Chapter 7: Final Estimate, BOQ & Commercial Tier (`Chapter7ReviewCommercial.tsx`)
- **Visual Foundation:** Comprehensive project estimate summary, 22-section works BOQ schedule, milestone payment plan, and commercial report purchase tier.
- **Pricing Card Hierarchy:** Prominent elevation of the Detailed BOQ Report (₹499) with "Most Popular" terracotta badge, alongside Free (₹0) and Premium (₹1,499).
- **Cashfree Payment Modal:** Secure 256-bit encrypted checkout modal styled with Deep Forest header and Sandstone borders.

---

## 3. Quantity Transparency Standards

Across all chapters, material quantities follow strict display conventions:
1. **Physical Unit Primacy:** All physical quantities are displayed with their standard engineering units before monetary costs:
   - Tonnes (`T`) for structural steel.
   - Bags (`Bags`) for Portland Pozzolana / Ordinary Portland cement.
   - Cubic Feet (`CFT`) for sand and coarse aggregates.
   - Numbers (`Nos` / `Blocks`) for masonry units.
   - Square Feet (`sq.ft`) for flooring, tiles, and plastering surfaces.
   - Running Metres (`m`) for electrical wiring and plumbing pipes.
2. **Tabular Numerals:** All numeric figures utilize `font-mono tabular-nums` to eliminate layout jitter during recalculation.
3. **Invariance Guarantee:** Changing finish specifications or material brands updates rates without altering the underlying physical quantities calculated from the architectural dimensions.

