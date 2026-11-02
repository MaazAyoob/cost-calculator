# Hutty 3.1 Homepage Redesign & Architectural Experience Report
**Phase 06 Deliverable 03 — Homepage Redesign & Visual Storytelling**  
*Document Version: 1.0.0 • Date: November 2026 • Environment: Production / Pre-Release*

---

## 1. Executive Summary

In Phase 06, the Hutty homepage underwent a comprehensive visual transformation. The previous interface exhibited high repetition of generic white cards, high reliance on dated construction orange (`#F28C28`) and legacy green (`#1B3D34`), and a flat presentation that failed to convey architectural prestige. 

The redesigned homepage presents a **distinctive architectural composition** combining tactile materials, live engineering calculation feedback, editorial photography, and rich alternating full-bleed sections.

---

## 2. Distinctive Homepage Hero Composition

The Hero Section (`src/features/landing/sections/HeroSection.tsx`) was rebuilt as a balanced, split architectural composition:

### 2.1 Left Column: Planning Controls & Narrative Authority
1. **Architectural Location Eyebrow:**
   - Text: `Residential Construction Intelligence • Bangalore`
   - Styling: Soft Sage pill (`#E8EFE9`), Deep Forest text (`#183B32`), pulsing Terracotta dot (`#C66B4E`), and `MapPin` icon.
2. **Authoritative Headline & Wording:**
   - *"Your dream home. Planned with clarity."*
   - Subtitle: *"Understand your construction quantities, material choices and estimated budget before construction begins."*
   - Terracotta underline decoration on *"Planned with clarity."*
3. **Quick Plot & Floor Selector:**
   - 4 Bangalore standard plots: `20' × 30'`, `30' × 40'`, `30' × 50'`, `40' × 60'`.
   - 4 Storey presets: `Ground`, `G+1`, `G+2`, `G+3`.
   - Minimum 46px touch targets for mobile accessibility.
   - Selected states styled in Deep Forest (`#183B32`) with active Terracotta indicator dot (`#C66B4E`).
4. **Primary & Secondary CTAs:**
   - Primary: *"Plan Your Home"* in Deep Forest (`#183B32`) with Terracotta arrow icon.
   - Secondary: *"How Hutty Works"* with smooth scrolling to `#how-it-works`.
5. **Three Engineering Trust Indicators:**
   - 100% Free Preliminary Estimate (instant cost calculation).
   - BBMP & BDA Municipal Rules (setback and FAR verified).
   - IS 456 Structural Takeoffs (civil structural compliance).

### 2.2 Right Column: Layered Architectural Visualizer
1. **Framed Residence Visual:**
   - Deep Forest frame (`border-2 border-[#E9DDC9] bg-[#183B32]`).
   - Photorealistic Bangalore contemporary G+2 residence render (`hero-house-render.jpg`).
   - Technical blueprint drafting grid overlay with subtle technical lines.
   - Architectural dimension markings:
     - Frontage: `30'-0"`
     - Depth: `40'-0"`
     - Structural Height: `33'-6"`
2. **Floating Tactile Material Chips:**
   - Frosted glass chips overlaid on the visual:
     - *Tata Tiscon Fe550D TMT* (with terracotta marker)
     - *UltraTech 53G Cement* (with gold marker)
     - *Granite Slab & Teak Joinery* (with sage marker)
3. **Floating Live Budget Summary Card:**
   - Live recalculation based on plot size and floor selection:
     - Estimated Construction Cost: `₹ 43.15 Lakhs`
     - Unit Rate: `~ ₹ 1,998 / sq.ft • 2,160 sq.ft BUA`
4. **Interactive 2D / 3D Visualization Controls:**
   - Toggle switch between photorealistic architectural photography (2D) and real-time Three.js massing viewer (3D).
   - Zoom In, Zoom Out, and Reset View controls.
5. **Four Bottom Architectural Metric Cards:**
   - Built-up Area: `2,160 sq.ft`
   - Steel Required: `6.91T Fe550D TMT`
   - Cement: `864 Bags Grade 53 OPC/PPC`
   - Work Schedule: `13 Turnkey Stages`

---

## 3. Full-Width Bottom Trust Strip

Spanning the entire width below the hero composition is a warm sandstone trust band (`#E9DDC9`/40) featuring four engineering pillars:
1. **Built for clarity:** Instant preliminary planning estimates.
2. **Verified engineering standards:** BBMP bye-laws, IS 456, and IS 1786.
3. **Transparent and unbiased:** Zero contractor commissions or vendor kickbacks.
4. **Detailed reports:** Instant download of BOQ schedules and material takeoffs.

---

## 4. Complete Section Rework & Alternating Rhythm

The homepage flow establishes visual variety and rhythm across 12 distinct sections:
- **01. Hero Section:** Warm Ivory (`#F7F3EA`) with architectural split statement.
- **02. Introduction Section:** Warm Ivory (`#F7F3EA`) editorial composition featuring real licensed civil engineer photography and ground-truth technical fidelity.
- **03. Four Offerings Section:** Crisp White (`#FFFFFF`) surface with numbered cards `01` to `04` detailing the core platform questions.
- **04. Three Easy Steps:** Warm Ivory (`#F7F3EA`) with editorial photographic storytelling of a family planning their home together.
- **05. Live Engine Demo:** Warm Ivory (`#F7F3EA`) dual-pane interactive calculator allowing homeowners to see real-time price deltas with animated feedback.
- **06. Project Roadmap:** Warm Ivory (`#F7F3EA`) 5-stage sequential roadmap (Plan, Measure, Estimate, Review, Build).
- **07. Construction Breakdown:** Crisp White (`#FFFFFF`) with giant statistical numbers (8.64T Steel, 1,080 Cement Bags, 10,752 Blocks).
- **08. Why Planning Matters:** Warm Ivory (`#F7F3EA`) comparison matrix illustrating the hazards of conventional contractor quotes vs. Hutty quantity-first planning.
- **09. Engineering Standards:** Deep Forest (`#183B32`) technical section anchoring calculations to IS 456:2000, IS 1786:2008, and NBC 2016.
- **10. Expert Consultation:** Warm Ivory (`#F7F3EA`) featuring independent architectural advisory reviews (Flat ₹1,499).
- **11. Plans & Pricing:** Crisp White (`#FFFFFF`) with distinct cards for Free (₹0), Detailed BOQ (₹499 — Most Popular), and Calculator Premium (₹1,499).
- **12. FAQ & Final CTA:** Warm Ivory (`#F7F3EA`) accordion leading into a Deep Forest (`#183B32`) closing anchor.

---

## 5. Summary of Architectural Verification

- All components pass TypeScript compiler checks without warnings.
- All primary actions maintain $\ge 44\text{px}$ touch targets.
- All calculation engines, store methods, and quantity takeoff algorithms were preserved strictly without mutation.

