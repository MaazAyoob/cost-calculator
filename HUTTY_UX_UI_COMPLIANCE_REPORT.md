# HUTTY — UX/UI CLIENT COMPLIANCE & DESIGN AUDIT REPORT

**Audit Date:** 2026-10-26  
**Reference Document:** `Hutty_Calculator_Developer_UX_UI_Brief.pdf` (Pages 1 & 2)  
**Viewports Audited:**
- Desktop: $1280 \times 800\text{ px}$
- Tablet: $768 \times 1024\text{ px}$
- Mobile: $390 \times 844\text{ px}$ (iPhone 12/13/14 baseline)

---

## 1. Design System & Brand Visual Direction (PDF Page 1, §1)

| Design Token | Specification in Brief | Implementation in Code | Verification Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Green** | `#1B3D34` | `--color-brand-primary: #1B3D34`, `bg-[#1B3D34]`, `text-[#1B3D34]` | **PASS** | Deep forest green applied to top navigation, headers, and primary action buttons. |
| **Accent Orange** | `#F28C28` | `--color-brand-accent: #F28C28`, `bg-[#F28C28]`, `hover:bg-[#d97718]` | **PASS** | Warm orange applied to primary CTAs ("Start Free Estimate"), highlights, and badge accents. |
| **Backgrounds** | Warm-white | `bg-[#FAF9F6]` / `bg-[#FDFBF7]` | **PASS** | Soft, warm-white background replaces harsh pure white `#FFFFFF` across cards and pages. |
| **Cards & Borders** | Rounded cards, subtle borders | `rounded-2xl border border-stone-200/80 shadow-sm` | **PASS** | Modern, premium card styling matching PDF page 1 mockup visual style. |
| **Typography** | Readable sans-serif | `font-sans` (Inter / Outfit system stack) | **PASS** | Clear typographic hierarchy with high legibility across mobile and desktop. |
| **Input Philosophy** | Visual choices instead of technical dropdowns | Option cards with icons for floors, purpose, structure, materials | **PASS** | Dropdowns minimized; visual card grids used for all major decisions. |

---

## 2. Eight-Stage Calculator Flow & Copy Compliance (PDF Page 1, §2)

| Stage | Required Scope (Brief) | Implemented Experience | Compliance Status |
| :--- | :--- | :--- | :--- |
| **1. Your Plot** | City, plot dimensions/area, land status, planning authority, "Not sure" path | Bangalore & regional hubs, length/width inputs, live SVG boundary preview, unit conversions (Gunta/Cent), authority cards + "Not sure" | **PASS** |
| **2. Your Home** | Floor count, purpose (family/rental/farmhouse), parking, start timeline | Elevation cards (Ground to G+3), 4 purpose cards (Family, Rental, Farmhouse Villa, Commercial), parking steppers, timeline cards | **PASS** |
| **3. Your Rooms** | Bedrooms, bathrooms, living, kitchen, optional: pooja, balcony, study, store, terrace | Accessible + / - number steppers for all rooms including Pooja, Balcony, Study, Store, and newly added Terrace / Open Deck | **PASS** |
| **4. Buildable Space** | Setback knowledge, sanctioned plan, site condition, demolition, preliminary footprint & BUA | Municipal setbacks derived from dimensions, envelope (963 sq.ft) vs 70% coverage cap (840 sq.ft) clearly distinguished, permissible BUA derived | **PASS** |
| **5. Construction Style**| Structural system or "Not sure", walling type, quality level, structural drawings | RCC vs Load-bearing cards, brick/block cards with U-values & cost attributes, Standard/Premium/Luxury tiers, drawings toggle | **PASS** |
| **6. Finishes & Materials**| Flooring, doors/windows, electrical/plumbing, painting/elevation, optional brands | Multi-attribute finishes selector, tile/granite options, UPVC/wood windows, premium emulsion, optional brands card | **PASS** |
| **7. Your Estimate** | Preliminary cost range, area, breakdown, physical material quantities, disclaimers | Cost range ₹19.56 - 21.62 Lakhs (Target ₹20,59,239), ₹1,430/sq.ft BUA, zero-residual cost reconciliation, IS 456 materials, disclaimer | **PASS** |
| **8. Detailed BOQ** | Work-wise BOQ, quantities/rates, GST, labour/fittings separation, downloadable report | Itemized trade preview table, separate materials and labour, unlock modal for ₹499 Detailed and ₹1,499 Premium reports | **PASS** |

---

## 3. Interaction & Animation Requirements (PDF Page 2, §3)

1. **One Primary Decision per Screen:**
   - Each stage focuses on a coherent cluster of decisions with a sticky footer navigation bar ("Continue →" and "← Back").
   - Meaningful stage indicators at the top (`1. Plot`, `2. Home`, `3. Rooms`, etc.) clearly communicate progress.
2. **Dynamic Preview Updates:**
   - Plot SVG updates dimension ratios in real time on Stage 1.
   - House illustration reflects floor count and house purpose selections on Stage 2.
3. **State Preservation on Backward Navigation:**
   - Navigating backwards via "← Back" preserves all previously entered dimensions, room counts, and material selections without reset.
4. **Motion & Transitions:**
   - Stage transitions are governed by CSS transitions of $200–250\text{ ms}$ (within the specified $180–300\text{ ms}$ window).
   - `@media (prefers-reduced-motion: reduce)` is respected in `index.css`: transitions and animations are collapsed to `0.01ms` for users with motion sensitivity.
5. **No Forced Sign-In:**
   - A first-time homeowner can complete stages 1 through 7 and preview Stage 8 without creating an account or logging in.

---

## 4. Homepage Copy Compliance Audit

| Required Copy Element | Brief Specification | Rendered Website Content | Status |
| :--- | :--- | :--- | :--- |
| **Main Headline** | *"Understand your home before you build."* | *"Understand your home before you build."* (exact match) | **PASS** |
| **Subheading** | *"Plan your house, see how much it may cost, understand the materials you may need, and get help from experts when you need it."* | *"Plan your house, see how much it may cost, understand the materials you may need, and get help from experts when you need it."* (exact match) | **PASS** |
| **Primary CTA** | *"Start Free Estimate"* | Button links directly to `/plan` (opens Stage 1) | **PASS** |
| **Secondary CTA** | *"Consult an Expert — ₹1,499"* | Button links directly to `/consult` | **PASS** |

---

## 5. Viewport & Responsive Layout Verification

### Desktop ($1280 \times 800\text{ px}$)
- Two-column layouts on Stage 1 and Stage 4 (inputs on left, live visual preview on right).
- Full horizontal stepper visible with step names and status indicators.
- Ample whitespace around cards; no content clipping.

### Tablet ($768 \times 1024\text{ px}$)
- Grid collapses from 4-columns to 2-columns gracefully (`sm:grid-cols-2`).
- Touch targets exceed $44 \times 44\text{ px}$ for all interactive buttons and cards.
- Sticky navigation bar remains fixed at the viewport bottom without obscuring inputs.

### Mobile ($390 \times 844\text{ px}$)
- Single-column card flow (`grid-cols-1`).
- Stepper collapses to a compact progress bar with current step name ("Stage 1 of 8: Your Plot").
- No horizontal scrolling (`overflow-x: hidden` enforced on page containers).
- Sticky bottom action bar provides prominent "Continue →" CTA for easy one-handed thumb interaction.

---

## 6. Accessibility & Trust Review

- **Semantic HTML:** `<main>`, `<section>`, `<header>`, `<h1>`-`<h3>`, `<button>` used appropriately throughout.
- **Form Controls:** All quantity steppers include `aria-label="Decrease bedroom count"` and `aria-label="Increase bedroom count"`.
- **Keyboard Navigation:** All visual selection cards are accessible via `Tab` key and activatable with `Enter` / `Space`.
- **Color Contrast:** Deep forest green (`#1B3D34`) on white yields a contrast ratio of **12.4:1** (exceeding WCAG AAA requirement of 7:1).
- **Trust Badges:** Unverified claims ("Bank ready in 2 minutes") replaced with factual descriptors ("Comprehensive estimation report with full BOQ").
- **Demo Data Notice:** Consultation page prominently displays a notification that consultant profiles are demo illustrative listings.
