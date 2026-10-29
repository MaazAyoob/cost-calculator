# HUTTY — COMPLETE WEBSITE REDESIGN & PRE-LAUNCH IMPLEMENTATION REPORT

**Brand:** Hutty  
**Tagline:** *Build your home with clarity.*  
**Production Frontend:** [https://cost-calculator-ten-kappa.vercel.app](https://cost-calculator-ten-kappa.vercel.app/)  
**Production API:** [https://hutty-api.onrender.com](https://hutty-api.onrender.com/)  
**Repository:** [https://github.com/MaazAyoob/cost-calculator](https://github.com/MaazAyoob/cost-calculator)  
**Date of Audit & Implementation:** October 2026  

---

## Executive Summary

Hutty has undergone a complete, ground-up customer-facing website redesign and pre-launch implementation in accordance with the client's UX/UI briefs, mobile journey specifications, reference prototypes, and commercial pricing model.

The previous application suffered from several critical pre-launch barriers:
1. **Mandatory Login Wall on the Calculator:** Visitors clicking "Start Free Estimate" were immediately blocked by `<AuthGuard>` and forced to log in or register before seeing even a plot input screen.
2. **Disconnected 11-Step Engineering Form:** The previous planner presented a dense, technical 11-step form rather than an intuitive, home-planning journey.
3. **Obsolete Pricing & Conflicting Tiers:** Stale ₹99 pricing banners and modal triggers were scattered across the report page and checkout flows.
4. **Homepage Copy Mismatches:** The landing page did not reflect the client's requested headline (*"Understand your home before you build."*), contained unsupported claims (such as *"10,000+ estimates"*), and lacked a dedicated *"How It Works"* page.
5. **Technical Terminology:** Dense quantity-surveyor terminology created unnecessary cognitive load for first-time homeowners.

All of these issues have been completely resolved. The application now provides a seamless, mobile-first, guest-accessible 8-stage planning journey, supported by an architectural design system, plain-language terminology, strictly synchronized 4-product pricing, decoupled consultation services, and full Admin Panel preservation.

---

## 1. Design System & Brand Identity

A cohesive architectural design system has been established in [`UI_UX_DESIGN_SYSTEM.md`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/UI_UX_DESIGN_SYSTEM.md) and applied across all customer-facing surfaces:

### Brand Tokens
- **Primary Forest Green:** `#1B3D34` — Applied for primary headings, brand containers, hero accents, and primary action buttons.
- **Accent Orange:** `#F28C28` — Applied for action badges, active stepper indicators, icon accents, and primary conversion highlights.
- **Warm White / Main Background:** `#F8F8F6` — Applied as the universal page background to evoke textured, high-grade architectural paper.
- **Pure White:** `#FFFFFF` — Applied for elevated tactile cards, inputs, and modals.
- **Primary Text:** `#202522` / `#1B3D34` — Deep, legible contrast for all body and heading content.
- **Secondary Text:** `#4B5563` — Calibrated neutral grey for metadata, supporting explanations, and labels.
- **Border:** `#E5E7EB` / `#E3E8E2` — Subtle, restrained architectural hairline dividers.

### Typography & Layout
- **Headings:** Plus Jakarta Sans with font weights 700 to 900, tight tracking (`tracking-tight`), and proportional leading.
- **Body / Numbers / UI:** Inter with tabular figures (`font-mono` / tabular numerals) for financial and area figures.
- **Radii:** Rounded cards with 16px (`rounded-2xl`) to 24px (`rounded-3xl`) corners and subtle 1px architectural hairline borders.
- **Transitions:** Restrained micro-interactions calibrated between 180ms and 240ms respecting `prefers-reduced-motion`.

---

## 2. Customer-Facing Pages Redesigned & Created

### A. Homepage (`/`)
- **Headline:** Updated to the exact client-requested statement:  
  *“Understand your home before you build.”*
- **Supporting Copy:**  
  *“Plan your house, see how much it may cost, understand the materials you may need, and get help from experts when you need it.”*
- **Primary CTA:** `Start Free Estimate` — Direct navigation to `/calculator` without authentication wall.
- **Secondary CTA:** `Consult an Expert — ₹1,499` — Direct navigation to `/consult`.
- **Unsupported Claims Removed:** Eliminated all fabricated figures (e.g. *"10,000+ estimates"*, *"verified experts"* counters, or *"accurate to the inch"*).
- **Interactive HUD & Real Engine Demo:** Replaced illustrative mockups with dynamic calculation widgets demonstrating real plot-to-BUA formulas.
- **Supporting Sections:** Includes problem explanation (*Cost Ambiguity Trap*), 8-stage progression overview, GBA setback visualizer, material breakdown (steel, cement, sand), transparent pricing, independent expert consultation, FAQ, and policy links.

### B. Global Navigation & Footer
- **Header ([`WebsiteHeader.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/components/layout/WebsiteHeader.tsx)):** Unlocked `Start Free Estimate` buttons (desktop and mobile) so guest homeowners can immediately begin planning. Added active links to *How It Works*, *Pricing*, and *Consult an Expert*.
- **Footer ([`WebsiteFooter.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/components/layout/WebsiteFooter.tsx)):** Integrated the mandatory planning disclaimer prominently:  
  *“This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked.”*  
  Added direct navigation to *How It Works*, *Pricing*, *Consult an Expert*, *Join as a Professional*, and statutory legal policies.

### C. Standalone "How It Works" Page ([`HowItWorksPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/how-it-works/HowItWorksPage.tsx))
- Created a dedicated, responsive homeowner guide explaining the 6 phases of pre-construction planning:
  1. *Define Your Plot* (dimensions, authority, setback rules)
  2. *Configure Your Home & Rooms* (floors, duplex/rental, parking, room steppers)
  3. *Select Quality Tier & Materials* (Standard, Premium, Luxury specifications)
  4. *Instant Free Preliminary Estimate* (instant guest access to BUA, cost range, materials)
  5. *Detailed Construction Cost Report* (itemized works BOQ, rates, downloadable PDF for ₹499)
  6. *Independent Expert Guidance* (flat ₹1,499 1-on-1 advisory with verified architects/engineers)
- Registered at route `/how-it-works` in [`router.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/app/router.tsx).

### D. Plans & Pricing Page ([`PricingPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/pricing/PricingPage.tsx))
- Consolidated around exactly 4 approved products/services:
  - **Free Estimate (₹0):** Interactive 8-stage room & material choices, total BUA & footprint calculation, preliminary construction cost range, 3D house view and plot layout.
  - **Detailed BOQ (₹499):** Full Works Schedule, itemized civil & MEP BOQ, exact steel tonnes & cement bag quantities, labour milestone plan, downloadable PDF report.
  - **Premium BOQ (₹1,499):** Everything in Detailed BOQ plus multi-scenario layout comparison, premium specification customizer, permanent cloud save, and priority export suite.
  - **Consult an Expert (₹1,499):** Decoupled professional service with licensed architects and chartered structural engineers.
- Completely removed all references to the obsolete ₹99 price.
- Updated copy to reference the 8-stage calculator journey.

---

## 3. The 8-Stage Mobile-First Calculator Architecture

The previous 11-step technical form has been restructured into an 8-stage homeowner planning experience in [`src/features/planner/`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/):

| Stage | Name | Component | Inputs & Decisions Collected | Calculation Engine Integration |
|---|---|---|---|---|
| **Stage 1** | **Your Plot** | [`Stage1Plot.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage1Plot.tsx) | City (Bangalore/Mysore), preset standard plots ($30 \times 40$, $30 \times 50$, $40 \times 60$) or custom dimensions ($W \times L$ in ft), calculated plot area (sq.ft), land status (BDA, DC converted, Gram Panchayat, "Not sure"), authority. | Computes exact plot area in sq.ft; initializes authority rule context. |
| **Stage 2** | **Your Home** | [`Stage2Home.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage2Home.tsx) | Floor count (Ground up to G+4), house purpose (Family Home / Duplex, Rental Units, Triplex / Luxury), parking type (Ground surface, Stilt parking, No dedicated parking, EV charging toggle, car count stepper), construction start timeline. | Feeds floor count and parking allowances into structural framing and plinth calculations. |
| **Stage 3** | **Your Rooms** | [`Stage3Rooms.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage3Rooms.tsx) | Accessible plus/minus steppers for bedrooms (1–8), bathrooms (1–8), living rooms, kitchens, utility areas, plus toggle cards for optional spaces (Pooja room, Balcony, Study/Home office, Store room, Private terrace). | Computes functional floor area requirements and room distribution across levels. |
| **Stage 4** | **Your Buildable Space** | [`Stage4BuildableSpace.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage4BuildableSpace.tsx) | Setback knowledge (Conform to GBA rules vs "Not sure / Guide me"), existing plan status (Have sanctioned drawings, rough sketch, or starting fresh), site conditions (Plain level, sloping, waterlogged, rocky), old building demolition toggle. | Evaluates canonical GBA setback rules; derives front, rear, left, right offsets, ground footprint, and total allowable built-up area (BUA). |
| **Stage 5** | **Construction Style** | [`Stage5ConstructionStyle.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage5ConstructionStyle.tsx) | Structural framing system (RCC Frame vs Load Bearing vs "Not sure"), masonry walling blocks (Concrete solid blocks, Red clay bricks, AAC lightweight blocks), specification quality tier (Standard, Premium, Luxury), structural drawings availability. | Adjusts structural rates and material densities without distorting fundamental design geometry. |
| **Stage 6** | **Finishes & Materials** | [`Stage6FinishesMaterials.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage6FinishesMaterials.tsx) | Visual tabs for Flooring (Vitrified, GVT, Italian Marble), Windows & Doors (Teak/UPVC/Aluminium), Electrical & Plumbing (Standard concealed, Premium modular, Luxury automation), Painting & Elevation, and optional core structural brand selection (UltraTech, Tata Tiscon, JSW Steel). | Maps finish rates and brand tiers to rate tables without duplicating physical quantities. |
| **Stage 7** | **Your Estimate** | [`Stage7Estimate.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage7Estimate.tsx) | **100% Guest-Accessible Preliminary Estimate:** Displays gross BUA (sq.ft), estimated total construction cost range (±4%), materials/labour/fittings percentage split bar, physical material consumption quantities (steel tonnes, cement bags, sand CFT, block units), inclusions/exclusions, rate validity, and mandatory disclaimer. | Direct live binding to `useCalculationStore` output. Completely free of login barriers. |
| **Stage 8** | **Detailed BOQ** | [`Stage8DetailedBOQ.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage8DetailedBOQ.tsx) | Interactive preview of itemized civil and MEP bills of quantities (Earthwork, Substructure, Superstructure, Masonry, Plastering, Flooring, Plumbing, Electrical), rate breakdown, 3 transparent plan comparison cards (Free ₹0, Detailed BOQ ₹499, Premium BOQ ₹1,499), decoupled consultation callout, and checkout modal trigger. | Authoritative server entitlement gating; triggers `UnlockReportModal`. |

### Calculator Orchestration & UX Enhancements ([`PlannerPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/PlannerPage.tsx))
- **Linear & Random Access Navigation:** Sticky top stage indicator with progress percentage, allowing backward navigation without losing form state.
- **Split Desktop / Stacked Mobile HUD ([`LivePreviewPanel.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/components/LivePreviewPanel.tsx)):** Live plot visualizer, 3D house massing preview, live BUA tally, and approximate budget bracket that re-computes dynamically as the user changes inputs.
- **Guest-First Access:** Unwrapped from `<AuthGuard>` in [`router.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/app/router.tsx). Guest homeowners can complete all 8 stages and inspect their preliminary estimate without being prompted for credentials.

---

## 4. Consultation Experience ([`/consult`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/consultation/ConsultationPage.tsx))

Built to match the requirements of `Hutty_Consultation_Page_Developer_Brief.pdf`:

1. **Hero Section ([`ConsultationHero.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/consultation/components/ConsultationHero.tsx)):**
   - **Headline:** *“Build with confidence. Talk to the right expert.”*
   - **Supporting Copy:** *“Get practical guidance for your home construction—from planning and approvals to structure, materials and interiors.”*
   - **CTAs:** `Find an Expert` (scrolls to directory) and `Join as a Professional` (routes to `/professionals/join`).
2. **Trust Strip ([`ConsultationTrustStrip.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/consultation/components/ConsultationTrustStrip.tsx)):**
   - *Verified professionals* (only approved practitioners displayed).
   - *Transparent pricing* (flat ₹1,499 fee displayed upfront).
   - *Convenient online sessions* (conducted via Google Meet with calendar integration).
   - *Support at every stage* (from plan review to site issue diagnosis).
3. **6 Consultation Categories ([`ConsultationCategoriesGrid.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/consultation/components/ConsultationCategoriesGrid.tsx)):**
   - *Architectural Design* (plans, space planning, elevations, and design reviews)
   - *Structural Engineering* (structural design, column grids, safety, and technical guidance)
   - *Construction & Site Issues* (execution guidance, quality checks, and site problems)
   - *Cost Estimation & BOQ* (quantities, cost planning, and contractor quote review)
   - *Approvals & Regulations* (GBA rules, setbacks, and approval compliance guidance)
   - *Interiors & Materials* (material selection, finishes, and interior planning)
4. **4 Popular Consultations ([`PopularConsultationsSection.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/consultation/components/PopularConsultationsSection.tsx)):**
   - *Review my house plan*
   - *Check my construction estimate*
   - *Understand setbacks and approvals*
   - *Choose materials and finishes*
   - All priced at the confirmed flat launch rate of **₹1,499**. (Unconfirmed exploratory prices like ₹499/₹799 are withheld until official business confirmation).
5. **Real Expert Profiles & Booking Modal ([`ConsultantCard.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/consultation/components/ConsultantCard.tsx), [`ConsultationBookingModal.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/consultation/components/ConsultationBookingModal.tsx)):**
   - Displays real consultant credentials (COA registration, M.Tech Structural, years of Bangalore experience, session length 45 mins, flat fee ₹1,499).
   - Booking modal collects project location, consultation topic, uploaded sketches/drawings, date/slot selection, cancellation terms, and initiates backend payment verification.
6. **"Talk to a Hutty Expert" Fallback ([`ExpertFallbackModal.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/consultation/components/ExpertFallbackModal.tsx)):**
   - When no specific consultant or calendar slot is available, homeowners can submit an enquiry for concierge matchmaking. Persists to backend database and generates a tracking ticket (`HT-ENQ-XXXX`).
7. **Professional Application Flow ([`ProfessionalJoinPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/consultation/ProfessionalJoinPage.tsx)):**
   - Captures applicant name, council/licence registration number, years of experience, specialization category, service cities, portfolio link, and verification consent.
   - Applications enter the Admin review queue. Unapproved practitioners are strictly barred from appearing on public directory pages.

---

## 5. Report Generation & Plain Language Terminology

### A. Single Source of Truth
The canonical calculation engine is the sole source of truth across all presentation layers:
- The web preview on [`ReportPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/report/ReportPage.tsx) and the exported PDF document on [`DetailedReportPdfDocument.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/report/DetailedReportPdfDocument.tsx) consume the exact same structured `CalculationResult` data object.
- Gross BUA, plinth footprint, direct material subtotal, direct labour subtotal, installed fixtures, commercial reserves, GST, and grand total match 1:1 down to the rupee.

### B. Plain Language Terminology Standards
Replaced technical quantity-surveying jargon with homeowner-friendly phrasing across web pages, preview cards, and generated PDFs:

| Old / Technical Term | New Plain-Language Label |
|---|---|
| Material takeoff | **Materials needed** |
| Structural steel physics | **Steel needed for the house** |
| Spatial matrix / allocation | **Room layout** |
| Deterministic calculation | **How we calculate your estimate** |
| Trade labour / execution trades | **Labour and work costs** |
| Bank-ready BOQ dossier | **Detailed construction cost report** |
| Verified specification plan | **Save your choices** |
| Massing / geometry synthesis | **3D house view and plot layout** |

### C. Mandatory Disclaimer Placement
Embedded prominently near the estimate on the website and on all generated PDF documents:
> *“This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked.”*

---

## 6. Elimination of Obsolete ₹99 Pricing

The obsolete ₹99 price has been systematically expunged from customer-facing surfaces:
1. **`server/src/constants/pricing.constants.ts`:** `BASIC_ESTIMATE_PDF` set to `active: false, purchasable: false`. `getPublicTiers()` returns only `FREE`, `DETAILED_ESTIMATE_499` (₹499), and `PREMIUM_1499` (₹1,499).
2. **`src/config/pricing.ts`:** `tier-basic-pdf-99` marked inactive and non-purchasable.
3. **`src/features/report/ReportPage.tsx`:** Removed the `Download Basic Estimate PDF — ₹99` button and `UnlockBasicPdfModal`. Free visitors see their full estimate online and are presented with `Unlock Detailed Report — ₹499`.
4. **`src/features/account/AccountDashboardPage.tsx`:** Updated promotional copy to remove references to the ₹99 estimate.
5. **`src/features/pricing/PricingPage.tsx` & `src/features/landing/sections/SignaturePricingSection.tsx`:** Displays only the 4 approved tiers (Free ₹0, Detailed BOQ ₹499, Premium BOQ ₹1,499, Consult an Expert ₹1,499).

---

## 7. Admin Panel Preservation & Setback Integration

The existing working Admin Panel has been preserved without destructive refactoring:
- **Formula System V2 & Rate Engine:** Preserved intact. Administrators can configure material rates, labour rates, and formula multipliers.
- **Configurable GBA Setbacks:** Plot-area-based setback engine configured in `src/calculation-engine/data/authorityRules/gbaRules.ts` with front, rear, left, and right setback bands.
- **Draft / Publish Workflow:** Draft configuration changes remain isolated from production customer calculations until explicitly published by an administrator.
- **Lead & Consultation Management:** Admin endpoints allow review of homeowner enquiries and professional registration applicants.

---

## 8. Automated & Manual Verification Summary

| Verification Test | Scope | Result | Evidence / Notes |
|---|---|---|---|
| **Free estimate without login** | Core Funnel | **PASS** | Guest users can visit `/calculator`, configure all 8 stages, and view preliminary BUA and cost range on Stage 7 without authentication. |
| **8-stage backward navigation** | State Preservation | **PASS** | Stepping back through Stages 8 → 1 preserves all plot dimensions, room counts, and material choices in `useWizardStore`. |
| **Calculation engine variation** | Dynamic Calculation | **PASS** | Modifying plot size from $30 \times 40$ to $40 \times 60$ or floors from G+1 to G+3 produces distinct, deterministic BUA and material quantities. |
| **Pricing consistency** | Pricing Model | **PASS** | Exact alignment: Free (₹0), Detailed BOQ (₹499), Premium BOQ (₹1,499), Consultation (₹1,499). Obsolete ₹99 removed from active tiers. |
| **Entitlement isolation** | Access Control | **PASS** | ₹499 purchase unlocks Detailed BOQ only; ₹1,499 Premium grants premium deliverables; Consultation payment grants consultation booking only. |
| **Website / PDF total reconciliation** | Reporting Integrity | **PASS** | PDF document generator (`DetailedReportPdfDocument.tsx`) and web view (`ReportPage.tsx`) consume the same `CalculationResult` model with exact totals and mandatory disclaimer. |
| **Consultation booking flow** | Marketplace | **PASS** | Category selection, slot booking, project details capture, and flat ₹1,499 checkout integration verified. |
| **Fallback enquiry capture** | Lead Rescue | **PASS** | Submitting "Talk to a Hutty Expert" fallback creates a real enquiry ticket with tracking reference. |
| **Professional registration queue** | Partner Acquisition | **PASS** | Submissions from `/professionals/join` route to the Admin review queue. Unapproved applicants do not appear publicly. |
| **Production build integrity** | TypeScript / Vite | **PASS** | Frontend build compiles cleanly (`tsc -b && vite build`) with zero linting or bundle errors. |

---

## 9. Conclusion & Pre-Launch Posture

Hutty's customer-facing application is now fully redesigned, responsive, and aligned with the brand promise: **"Build your home with clarity."** All customer journeys—from homepage discovery to interactive 8-stage estimation, detailed BOQ previews, and independent expert consultations—are operational, coherent, and verified.
