# HUTTY 3.1 — PHASE 01: VISUAL & LANGUAGE EXPERIENCE AUDIT
## Transforming Engineering Jargon into Homeowner Clarity & Architectural Elegance

> **Document ID:** `HUTTY-3.1-DOC-F-VISUAL-LANGUAGE-AUDIT`  
> **Status:** Completed & Authoritative  
> **Date:** October 31, 2026  
> **Author:** Antigravity Senior Product Architect & Product UX Researcher  
> **Primary Mandate:** *"Make Hutty easy for any homeowner to understand — even if they know nothing about construction. Preserve the intelligence. Improve how people experience it."*

---

## 1. Executive Assessment: The Homeowner Empathy Gap

Hutty's underlying calculation engine is extraordinarily sophisticated. It computes structural reinforcement tonnages, concrete batch mixes, masonry block layups, cable conductor runtimes, and statutory municipal setbacks with engineering rigor.

However, the current user interface often communicates like an **internal Quantity Surveyor (QS) tool** rather than a **warm, guiding architectural companion for families building their future home**. Ordinary homeowners looking to build a 3-bedroom house are confronted with terms like *"Deterministic massing synthesis"*, *"Built-Up Area (BUA) vs Carpet FAR"*, *"Material Takeoff Matrices"*, and *"Sunken slab elastomeric waterproofing"*.

This language barrier creates cognitive anxiety, leads to premature drop-offs, and obscures the platform's genuine value.

---

## 2. Technical Jargon vs Simple Homeowner Phrasing Audit

The following table documents existing technical phrases found across the Hutty codebase and pairs them with approved, human-centered alternatives:

| # | Current Technical Phrase in UI | Where It Appears | Client-Mandated Simple Phrasing | Rationale & Homeowner Impact |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **"Built-Up Area (BUA)"** | Live preview, Stage 1, Stage 2, Header | **"Total built-up area (the full covered area of all floors)"** | Most homeowners know carpet area or plot dimensions, but confuse BUA with plinth or super built-up. Explain it once simply. |
| 2 | **"Material Takeoff Schedule"** | Stage 8, BOQ Table, PDF Page 7 | **"Materials needed for your house"** | "Takeoff" is professional estimator terminology. Homeowners think in terms of "What will we consume?". |
| 3 | **"Structural Steel Physics / Bar Bending"** | Stage 5, Details drawer | **"Steel reinforcement needed for slabs, beams, and columns"** | Demystifies technical rebar diameter schedules without losing credibility. |
| 4 | **"Spatial Matrix / Space Program"** | Stage 3, Stage 4 | **"Room layout & floor plan"** | "Spatial matrix" sounds like academic CAD software. "Room layout" is universally understood. |
| 5 | **"Deterministic Calculation Chain"** | Landing page, Explanations drawer | **"How we calculate your estimate"** | "Deterministic" is computer science terminology. Homeowners want to know the calculation is logical and transparent. |
| 6 | **"Trade Labour / Execution Trades"** | Stage 7, Budget Table | **"Labour and artisan work costs"** | Clarifies the split between buying materials and paying masons/carpenters/electricians. |
| 7 | **"Budget Disbursement Roadmap"** | Payment Schedule tab | **"Construction payment plan (milestone-by-milestone)"** | Replaces financial banking jargon with practical contractor payment stages. |
| 8 | **"Bank-ready BOQ Dossier"** | Stage 8, Landing page, Checkout | **"Detailed construction cost report you can discuss with your bank or contractor"** | Avoids making legally unprovable promises that any arbitrary bank branch will accept it sight unseen. |
| 9 | **"Verified Specification Plan"** | Stage 8, Project save | **"Save your choices"** | Simple, actionable verb phrase. |
| 10 | **"Massing / Geometry Synthesis"** | Stage 4, 3D Canvas | **"3D house view and plot layout"** | Descriptive, intuitive visual title. |
| 11 | **"Conflict-Free Guarantee"** | Landing page hero, FAQ | **"Clear information to help you discuss the work with your contractor"** | Replaces adversarial framing with constructive, empowering language. |
| 12 | **"Your contractor is oversmarting you?"** | Landing page banner, ad copy | **"Not sure about your contractor’s quote? Check the work and costs, or speak to an expert."** | Eliminates aggressive, negative phrasing in favor of calm, reassuring advocacy. |
| 13 | **"Zero guesswork / Calculated to the inch"** | Landing page hero | **"Plan your home with clarity and transparent engineering estimates"** | Removes unsubstantiated absolute claims. |
| 14 | **"Sunken slab elastomeric membrane"** | Stage 6 Finishes, BOQ code `FLR-005` | **"Bathroom water leakage protection (waterproofing)"** | Explains the physical protection benefit rather than the chemical compound. |

---

## 3. Mandatory Statutory Estimation Note

Per client brief instruction, every estimate screen (Stage 7, Stage 8) and every page of the generated PDF report must prominently feature the following reassuring notice:

> **"This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings, and material choices are checked."**

---

## 4. Screen Overload & Form Complexity Analysis

### Problem 1: Tab Cramming in Finishes (Current Stage 6)
- **Current State:** A single stage (`Stage6FinishesMaterials.tsx`) attempts to collect:
  1. Flooring (living, bedrooms, kitchen, bathrooms, balcony)
  2. Doors (main, internal, bathroom)
  3. Windows (living, bedrooms, kitchen, ventilators)
  4. Electrical (switches, wires, EV charger)
  5. Plumbing (sanitary, CP fittings, water tanks)
  6. Painting (interior, exterior, putty)
- **User Reaction:** Overwhelming. Users report experiencing "form fatigue", rushing through selections, or abandoning the flow because tabs make progress feel invisible.
- **Client Solution:** Unbundle into **Chapter 4 (Flooring & Tiles)**, **Chapter 5 (Doors & Windows)**, and **Chapter 6 (Electrical, Plumbing & Finishes)**.

### Problem 2: Confusing Setback & Sanctioned Area Interface (Current Stage 4)
- **Current State:** Displays technical municipal setback tables (Front, Rear, Left, Right in meters/feet) alongside prescribed building line offsets and FAR calculations.
- **User Reaction:** Homeowners do not know their local bye-law setback rules offhand. Being asked for numeric setbacks triggers hesitation.
- **Client Solution:** Provide a single toggle:
  - *Option A (Default):* "Use standard municipal rules for my plot size" (Automatic calculation).
  - *Option B:* "I already have an architect's drawing or sanctioned plan" (Enables custom dimensions).
  - Include an explicit "Not sure — use recommended setbacks" button.

---

## 5. Visual Selections vs Technical Dropdowns

Home construction is an emotional, tactile, and visual journey. Selecting materials via plain text dropdowns (`<select><option>Tata Tiscon</option></select>`) feels cold and administrative.

The following visual transformation is recommended for Phase 02:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      VISUAL TOUCHPOINT ENHANCEMENT MATRIX                              │
├───────────────────────┬──────────────────────────────┬─────────────────────────────────┤
│ Chapter & Selection   │ Current Input Style          │ Recommended Visual Alternative  │
├───────────────────────┼──────────────────────────────┼─────────────────────────────────┤
│ Floors (Chapter 2)    │ Numeric stepper / pills      │ 3D isometric house illustrations│
│                       │                              │ growing with each floor added   │
├───────────────────────┼──────────────────────────────┼─────────────────────────────────┤
│ Rooms (Chapter 2)     │ Dense numeric counter rows   │ Architectural room cards with   │
│                       │                              │ iconic room stamps & dimensions │
├───────────────────────┼──────────────────────────────┼─────────────────────────────────┤
│ Flooring (Chapter 4)  │ Text dropdown ("GVT 1200x600")│ High-res tactile texture swatches│
│                       │                              │ (Italian marble, matte vitrified│
│                       │                              │ rustic wood, anti-skid slate)   │
├───────────────────────┼──────────────────────────────┼─────────────────────────────────┤
│ Doors (Chapter 5)     │ Text dropdown ("Flush door") │ Architectural door elevation    │
│                       │                              │ cards (Carved Teak, Modern Flush│
│                       │                              │ WPC Waterproof with SS handles) │
├───────────────────────┼──────────────────────────────┼─────────────────────────────────┤
│ Windows (Chapter 5)   │ Text dropdown ("UPVC 2.5T")  │ Window style cards showing      │
│                       │                              │ frame profiles & mosquito mesh  │
├───────────────────────┼──────────────────────────────┼─────────────────────────────────┤
│ Switches (Chapter 6)  │ Text dropdown ("Legrand")    │ Modular switch plate swatches   │
│                       │                              │ (Matte Black, Pure White, Gold) │
└───────────────────────┴──────────────────────────────┴─────────────────────────────────┘
```

---

## 6. Quantity Explanations ("What Am I Consuming?")

When Hutty tells a customer:  
`Steel: 7.2 Tonnes | Cement: 940 Bags | AAC Blocks: 4,200 Pieces`  
The customer has no intuitive reference point for whether that is reasonable, economical, or extravagant.

### Recommendation: Add "In Simple Words" Micro-Cards
- **Steel (7.2 Tonnes):**  
  > *"That’s about 7,200 kg of high-strength rebar steel. It will form the strong structural skeleton inside your foundations, 16 columns, and 2 roof slabs."*
- **Cement (940 Bags):**  
  > *"940 standard 50kg bags. Roughly 500 bags will be used for structural concrete, 280 bags for laying walls, and 160 bags for smooth plastering."*
- **Masonry (4,200 Blocks):**  
  > *"Enough precision blocks to construct all exterior shelter walls and interior room dividing partitions for your 2 floors."*

---

## 7. Mobile Usability Audit (Viewports < 768px)

Testing the calculator on mobile screens (iPhone 14/15, Samsung Galaxy) identified the following usability constraints:

1. **Live Preview Panel Interference:**
   - On desktop, the sticky right-side preview panel (`LivePreviewPanel.tsx`) provides continuous feedback.
   - On mobile, it currently renders as a tab toggle at the bottom (`form` vs `preview`). Users frequently forget to switch tabs and fail to notice live cost updates.
   - *Fix:* Implement an elegant floating architectural bottom pill showing:  
     `₹38.4 Lakhs • 2,400 sq.ft [ Tap to view breakdown ]` that opens a swipeable drawer.
2. **Dimension Slider Precision on Touchscreens:**
   - Sliders for plot length (10ft to 150ft) are difficult to set to precise dimensions like `40.5 ft` with thumbs.
   - *Fix:* Always provide dual inputs: a smooth slider paired with an adjacent direct numeric tap-to-type input box.
3. **Sticky Navigation Bar:**
   - The "Next: Core Materials →" button must remain fixed at the bottom with safe-area padding for mobile gesture bars (`pb-safe`).

---

## 8. Consultation Page Alignment

The current consultation page `/consult` will be refined in Phase 02 to strictly follow the client brief:
- **Heading:** *"Need help building your home? Talk to an expert."*
- **Supporting Text:** *"Get help with your house plan, contractor quote, materials, structure, or site questions. Not sure who you need? Tell us about your problem and Hutty will help you find the right person."*
- **Price:** Prominently presented as a distinct, standalone **₹1,499** service.
- **The Four Action Choices:**
  1. `[ Check my contractor’s quote ]` — Upload or bring a contractor quote to verify rates, missing work, and extra charges.
  2. `[ Find an architect or engineer ]` — Connect with a licensed structural engineer or home architect for plan vetting.
  3. `[ Get help with a problem at my site ]` — Address foundation questions, dampness, cracking, or contractor disputes.
  4. `[ I’m not sure — help me choose ]` — Guided 30-second triage to match with the appropriate specialist.

