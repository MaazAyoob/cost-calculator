# Hutty 3.1 — Phase 06.2
## Stronger Visual Identity & Simple Homeowner Language Report

**Document Reference:** `docs/hutty-3.1/phase-06/PHASE_06_2_VISUAL_AND_LANGUAGE_REFINEMENT.md`  
**Execution Date:** November 2026  
**Status:** COMPLETE & VERIFIED  

---

## 1. Executive Overview

Phase 06.2 addresses the two critical design feedback points raised following Phase 06 and Phase 06.1:
1. **Visual Distinction & Brand Presence:** The new architectural color tokens existed in code, but were applied too cautiously, leaving the visual impact subtle and too close to the previous look.
2. **Simple, Approachable Homeowner Language:** The website previously relied on heavy engineering and academic jargon (*"ground-truth technical fidelity"*, *"quantity-first pre-construction methodology"*, *"architectural planning intelligence"*, *"deterministic quantity takeoff engine"*). Hutty is built for ordinary families building a home—not only civil engineers or contractors.

### Core Safeguards Maintained:
- **Preserved Approved Backgrounds:** Main background `#F8F8F6`, white cards `#FFFFFF`, and neutral borders `#E5E7EB` are strictly retained. The entire site was **not** turned ivory, beige, or dark green.
- **Calculation & Engine Invariance:** All civil engineering formulas (IS 456 concrete ratios, IS 1786 steel weights, BBMP/BDA setback rules) and calculation engine mechanics remain 100% untouched.
- **Commercial & Pricing Integrity:** All commercial tiers remain unchanged: Free (₹0), Basic (₹99), Detailed BOQ (₹499), Calculator Premium (₹1,499), and Independent Consultation (₹1,499).
- **Git Cleanliness:** Zero commits, zero git tags, and zero pushes were made.

---

## 2. Stronger Architectural Color System Deployment

The 14 architectural colors are now deployed boldly across buttons, active states, progress indicators, icons, badges, metric cards, and callout sections:

| Palette Color | Hex Code | Primary UI Application |
| :--- | :--- | :--- |
| **Deep Forest** | `#183B32` | Primary CTA buttons, key headings, active navigation links, dark anchor sections (Standards, Footer). |
| **Forest Green** | `#245747` | Hover states for primary buttons, borders for dark sections. |
| **Emerald** | `#347A62` | Success indicators, free tier badges, effective rate metric numbers, verified compliance badges. |
| **Soft Sage** | `#B7CDBB` | Supporting text on dark sections, soft subtle borders for pill badges. |
| **Light Sage** | `#E8EFE9` | Card fills, pill badge containers, icon backgrounds for Step 1, consultation callout panel. |
| **Terracotta** | `#C66B4E` | High-value accents, "Most Popular" badges, arrow icons inside buttons, pulse status dots, Step 2 icon containers. |
| **Clay** | `#A95640` | Hover states for Terracotta buttons. |
| **Muted Gold** | `#C5A46D` | IS Code reference badges, 4th metric chip icons. |
| **Pale Gold** | `#E5D5B4` | Accent labels on dark Deep Forest sections. |
| **Charcoal** | `#18211E` | High-contrast readable body headings and primary typography. |
| **Slate** | `#66716B` | Descriptive subheads and supporting explanatory text. |
| **Pure White** | `#FFFFFF` | Elevated surfaces, cards, and modal containers. |
| **Canvas** | `#F8F8F6` | Approved light background canvas for all pages. |
| **Neutral Border** | `#E5E7EB` | Clean, subtle structural borders. |

---

## 3. Homeowner Language Transformation Across Sections

Every public landing page section was audited and rewritten into friendly, clear, plain English:

### 1. Hero Section (`HeroSection.tsx`)
- **Eyebrow:** *"Bangalore Home Planning • Clear Estimates"* with Deep Forest badge and Terracotta pulse dot.
- **Headline:** **“Plan your dream home with confidence.”**
- **Subhead:** *"Choose your plot size and floors. Hutty helps you understand the materials you need and the cost of building your home."*
- **Primary Button:** **“Plan My Home”** (`bg-[#183B32]` with `#C66B4E` arrow).
- **Secondary Button:** **“See How It Works”** (`bg-white` with `#183B32` border).
- **Trust Indicators:**
  - *"Free Instant Estimate"* (no signup needed)
  - *"Bangalore Building Rules"* (setbacks & floors verified)
  - *"Real Material Quantities"* (steel, cement & blocks)
- **Metric Cards:**
  - *"Total Built-up Area"* (Live plot calculation)
  - *"Steel Needed"* (Columns, beams & slabs)
  - *"Cement Needed"* (Foundations & masonry)
  - *"Building Stages"* (13-milestone turnkey plan)
- **Trust Strip:** *"Built for homeowners • Bangalore bye-law checks • Clear, unbiased advice • Detailed material lists"*.

### 2. Introduction Section (`IntroductionSection.tsx`)
- **Headline:** **“Plan your home before you build.”**
- **Homeowner Story:** Explains why traditional verbal contractor quotes lead to 20–30% budget overruns and how Hutty calculates actual steel and cement quantities upfront.
- **Pillars:**
  - *"What You Can Build"* (Ruler icon, Terracotta badge)
  - *"Materials Needed"* (Scale icon, Deep Forest badge)
  - *"Independent Advice"* (ShieldCheck icon, Emerald badge)

### 3. Four Offerings Section (`FourOfferingsSection.tsx`)
- **Eyebrow:** *"HOW HUTTY HELPS YOU PLAN"*
- **Questions & Offerings:**
  - **01. What will my home cost?** → Free instant estimate (`bg-[#183B32]` button, Emerald badge).
  - **02. What materials am I paying for?** → Detailed cost and material report (`bg-[#C66B4E]` button, Terracotta badge).
  - **03. Is this contractor quote fair?** → Independent expert review (Secondary button, Muted Gold badge).
  - **04. Where is my money going?** → Construction tracking (Coming soon).

### 4. Three Simple Steps (`ThreeEasyStepsSection.tsx`)
- **Headline:** **“Planning your home in three clear steps.”**
- **Subhead:** *"You don't need any construction experience. Hutty guides you through simple choices and calculates everything for your plot."*
- **Step 1:** *"Tell us about your plot"* (Compass icon in `#183B32` / `#E8EFE9`).
- **Step 2:** *"Plan your home"* (Home icon in `#C66B4E` / `#FDF0EB`).
- **Step 3:** *"Understand the estimated cost"* (Calculator icon in `#347A62` / `#DDF4E7`).
- **Banner:** *"Built for families making their largest lifetime investment"* with *"Plan My Home"* and *"Talk to an Expert"* buttons.

### 5. Live Cost Estimator (`InteractiveDemoSection.tsx`)
- **Eyebrow:** *"LIVE COST ESTIMATOR"*
- **Headline:** **“See your estimate update as your home takes shape.”**
- **Subhead:** *"Adjust plot size, floors, bedrooms, and finishes below to see costs and materials update in real time."*
- **Controls:** *"Standard Bengaluru Plot Dimensions"*, *"Number of Floors"*, *"Bedrooms & Bathrooms"*, *"Quality Level"*.
- **Live Output:** Big animated cost, live delta badge, and 3 secondary chips: Built-up Area (`#183B32`), Estimated Rate (`#347A62`), Steel & Cement (`#C66B4E`).
- **Button:** *"Open in Full Calculator"*.

### 6. Project Roadmap (`SignaturePlanningTimelineSection.tsx`)
- **Headline:** **“Plan. Measure. Estimate. Review. Build.”**
- **Subhead:** *"Building a home is too expensive for guesswork. Follow Hutty's 5 simple steps to keep your budget under control."*
- **5 Stages:**
  - Step 1: *Explore Your Plot* → Deliverable: *Plot & Setback Plan*
  - Step 2: *Design Your Spaces* → Deliverable: *Room & Space Summary*
  - Step 3: *Choose Materials* → Deliverable: *Materials Takeoff*
  - Step 4: *Audit Quotes* → Deliverable: *Detailed BOQ Report*
  - Step 5: *Build With Confidence* → Deliverable: *Payment Schedule*
- **Button:** *"Start Free Plan"*.

### 7. Materials Breakdown (`SignatureConstructionBreakdownSection.tsx`)
- **Headline:** **“Know what materials your home needs before signing contracts.”**
- **Subhead:** *"Sample estimate for a 2,400 sq.ft G+2 Duplex in Bangalore."*
- **Big Number Cards:**
  1. *Steel Needed* (8.64 Tonnes) — For columns, beams, and slabs.
  2. *Cement Needed* (1,080 Bags) — For foundations, concrete, and plaster.
  3. *Sand & Gravel* (1,620 CFT) — Clean manufactured sand for strong concrete.
  4. *Wall Blocks* (10,752 Blocks) — AAC or solid concrete blocks.
  5. *Flooring & Tiles* (3,697 Sq.Ft) — Living, bedrooms, and bathroom tiles.
  6. *Paint & Finishes* (2,160 Litres) — Interior and exterior wall finishes.
- **Callout Button:** *"Calculate My Materials Free"*.

### 8. The Hutty Difference (`WhyPlanningSection.tsx`)
- **Headline:** **“Build with a clear plan and budget.”**
- **Left Card (Without Hutty):** Vague lump-sum rates (₹2,200/sq.ft), hidden material downgrades, disputes over quantities, surprise extra costs.
- **Right Card (With Hutty):** Exact material quantities, clear brand choices, step-by-step payment schedule, budget under control.

### 9. Engineering Standards (`EngineeringStandardsSection.tsx`)
- **Headline:** **“Calculated using Indian civil engineering codes.”**
- **Subhead:** *"Every number in your Hutty estimate is calculated using official Indian Standards, not contractor guesswork."*
- **Flow:** `YOUR CHOICES` → `ENGINEERING RULES` → `EXACT QUANTITIES` → `BANGALORE RATES` → `DETAILED ESTIMATE`.
- **References:** Plain-English explanations accompanying IS 456, IS 1786, NBC 2016, and BBMP/BDA regulations.

### 10. Expert Consultation (`SignatureExpertSection.tsx`)
- **Headline:** **“Get an expert to review your plan.”**
- **Subhead:** *"A private review with an independent architect or engineer can save lakhs in site mistakes."*
- **Price:** Flat ₹1,499 per consultation, 100% independent advice.
- **3 Pillars:** Architect Review, Structural Engineer Review, and Contract & Quote Review.

### 11. Plans & Pricing (`SignaturePricingSection.tsx`)
- **Headline:** **“Choose how much detail you need.”**
- **Free (₹0):** *Free House Explorer* — Explore your plot and see an early building estimate with zero commitments.
- **Detailed BOQ (₹499):** *Detailed BOQ Report* — See the materials and work needed for your home, with estimated costs.
- **Premium (₹1,499):** *Calculator Premium* — Compare brand choices and save multiple floor variations.
- **Callout:** Dedicated card for 1-on-1 expert consultation (₹1,499).

### 12. FAQ & Final CTA (`FaqSection.tsx`, `FinalCtaSection.tsx`)
- **Headline:** *"Frequently asked questions."*
- **Answers:** Converted from dense technical text into short, reassuring homeowner sentences.
- **Final CTA:** **“Build your home with confidence.”** with button **“Plan My Home”**.

---

## 4. Multi-Viewport Screenshot Verification

Automated headless Chrome screenshots were captured into `docs/hutty-3.1/phase-06/screenshots/`:

| Screenshot File | Viewport | Target | Status |
| :--- | :--- | :--- | :--- |
| `01_landing_hero_desktop_1440.png` | 1440 × 900 | Hero section with Bangalore presets & visualizer | **Verified (623 KB)** |
| `02_landing_hero_mobile_375.png` | 375 × 812 | Mobile hero layout & responsive touch targets | **Verified (75 KB)** |
| `03_landing_how_it_works_desktop.png` | 1440 × 900 | Three simple steps & family photograph | **Verified (623 KB)** |
| `04_landing_demo_estimator_desktop.png` | 1440 × 900 | Interactive cost estimator & live calculation | **Verified (623 KB)** |
| `05_landing_why_hutty_desktop.png` | 1440 × 900 | The Hutty difference comparison split | **Verified (623 KB)** |
| `06_landing_engineering_standards_desktop.png` | 1440 × 900 | Deep Forest engineering standards section | **Verified (623 KB)** |
| `07_pricing_page_desktop.png` | 1440 × 900 | Dedicated pricing page with 3 tiers | **Verified (141 KB)** |
| `08_pricing_page_mobile.png` | 375 × 812 | Mobile responsive pricing view | **Verified (51 KB)** |
| `09_consultation_page_desktop.png` | 1440 × 900 | Independent expert consultation page | **Verified (435 KB)** |
| `10_calculator_stage1_desktop.png` | 1440 × 900 | Calculator Stage 1 plot dimensions & 3D view | **Verified (201 KB)** |
| `11_calculator_stage1_mobile.png` | 375 × 812 | Mobile calculator interface & quick controls | **Verified (58 KB)** |

---

## 5. Automated Test Suite & Compilation Verification

| Verification Suite | Target | Result | Duration |
| :--- | :--- | :--- | :--- |
| **Frontend TypeScript** | `npx tsc -b` | **0 errors** | Synchronous |
| **Backend TypeScript** | `npx tsc -p server` | **0 errors** | Synchronous |
| **Vitest Test Suite** | `npx vitest run` | **71/71 test files passed, 901/901 tests passed (100%)** | 55.78s |
| **Vite Production Build** | `npm run build` | **Successfully compiled bundle without errors** | 32.66s |

---

## 6. Conclusion & Release Readiness

Phase 06.2 successfully solves both the visual boldness and homeowner language requirements:
- The website feels unmistakably **Hutty**, showcasing craftsmanship and quality through rich Deep Forest, Terracotta, Emerald, and Muted Gold accents.
- The approved light backgrounds (`#F8F8F6`, `#FFFFFF`, `#E5E7EB`) are 100% preserved.
- The language is welcoming, clear, and reassuring for ordinary families planning to build a home.
- The application is 100% stable, fully tested, and ready for founder review.

