# HUTTY 2.0 — BROWSER VERIFICATION & QUALITY AUDIT REPORT

**Test Environment:** Windows 11 x64, Chromium Headless / Microsoft Edge, Node.js v22.16.0  
**Local Test Server:** Vite v6.4.3 Preview Server (`http://127.0.0.1:4173/`)  
**Build Artifacts Inspected:** `dist/index.html`, `dist/assets/*`  
**QA Screenshot Directory:** `artifacts/hutty-2-verification-screenshots/` (19 verified captures)

---

## 1. Verified Customer-Facing Routes & Viewports

| Route Tested | Viewport Dimensions | Device Emulation | Features & Controls Inspected | Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` (Homepage) | $1280 \times 800\text{ px}$ | Desktop Laptop | Hero, CTA "Start Free Estimate", value props, footer | **PASS** |
| `/` (Homepage Mobile) | $390 \times 844\text{ px}$ | iPhone 14 / Modern Smartphone | Responsive stacking, mobile hamburger menu, large CTAs | **PASS** |
| `/how-it-works` | $1280 \times 800\text{ px}$ | Desktop | 4-step consumer explanation, interactive illustrations | **PASS** |
| `/pricing` | $1280 \times 800\text{ px}$ | Desktop | Free (₹0), Detailed BOQ (₹499), Premium (₹1,499), Consultation (₹1,499) | **PASS** |
| `/consult` | $1280 \times 800\text{ px}$ | Desktop | Category filters, expert cards with "Sample Profile" badges | **PASS** |
| `/login` | $1280 \times 800\text{ px}$ | Desktop | Email/password sign-in, mobile OTP trigger, auth links | **PASS** |
| `/signup` | $1280 \times 800\text{ px}$ | Desktop | Homeowner registration, terms notice, error messaging | **PASS** |
| `/calculator?stage=1` | $1280 \times 800\text{ px}$ | Desktop | Plot dimensions, live 2D aspect box, road frontage | **PASS** |
| `/calculator?stage=1&details=open` | $1280 \times 800\text{ px}$ | Desktop | Details & assumptions drawer opened on Stage 1 | **PASS** |
| `/calculator?stage=2` | $1280 \times 800\text{ px}$ | Desktop | Home type, floor count ("Ground floor plus one upper floor") | **PASS** |
| `/calculator?stage=3` | $1280 \times 800\text{ px}$ | Desktop | $44\text{px}$ touch steppers, essential vs. optional room counters | **PASS** |
| `/calculator?stage=4` | $1280 \times 800\text{ px}$ | Desktop | 4-step spatial model: Plot vs Setbacks vs Footprint vs BUA | **PASS** |
| `/calculator?stage=4&details=open` | $1280 \times 800\text{ px}$ | Desktop | Building-space rules tab expanded with statutory formulas | **PASS** |
| `/calculator?stage=5` | $1280 \times 800\text{ px}$ | Desktop | Construction style (RCC framed / load-bearing, block types) | **PASS** |
| `/calculator?stage=6` | $1280 \times 800\text{ px}$ | Desktop | Finishes and materials (Standard, Premium, Luxury tiers) | **PASS** |
| `/calculator?stage=7` | $1280 \times 800\text{ px}$ | Desktop | Preliminary estimate, cost heads, planning disclaimers | **PASS** |
| `/calculator?stage=8` | $1280 \times 800\text{ px}$ | Desktop | Detailed BOQ schedule and report purchase unlock modals | **PASS** |
| `/calculator?stage=1` (Mobile) | $390 \times 844\text{ px}$ | Mobile | Responsive input fields, stacked 2D plot canvas | **PASS** |
| `/calculator?stage=7` (Mobile) | $390 \times 844\text{ px}$ | Mobile | Mobile estimate summary, sticky bottom navigation, disclaimers | **PASS** |

---

## 2. Screenshot Evidence Inventory

All verification screenshots are stored in `artifacts/hutty-2-verification-screenshots/` and excluded from production distributions:

| File Name | Dimensions | Size | Description |
| :--- | :--- | :--- | :--- |
| `01_homepage_desktop.png` | $1280 \times 800$ | 555 KB | Full desktop homepage with hero, navigation, and value pillars. |
| `02_homepage_mobile.png` | $390 \times 844$ | 128 KB | Mobile viewport homepage with responsive header and CTA. |
| `03_how_it_works.png` | $1280 \times 800$ | 58 KB | How It Works informational page with 4 consumer steps. |
| `04_pricing_page.png` | $1280 \times 800$ | 131 KB | Verified pricing plans: Free (₹0), ₹499 BOQ, ₹1,499 Premium. |
| `05_consultation_page.png` | $1280 \times 800$ | 141 KB | Consultation marketplace with "Sample Profile" badges. |
| `06_login_page.png` | $1280 \times 800$ | 58 KB | Clean homeowner login form with OTP support. |
| `07_signup_page.png` | $1280 \times 800$ | 77 KB | Registration form with password requirements and validation. |
| `08_stage1_plot.png` | $1280 \times 800$ | 173 KB | Stage 1 Plot with live 2D canvas and road frontage indicator. |
| `09_stage1_details_open.png` | $1280 \times 800$ | 206 KB | Stage 1 with "Details & assumptions" drawer open. |
| `10_stage2_home.png` | $1280 \times 800$ | 121 KB | Stage 2 Home with plain English floor descriptions. |
| `11_stage3_rooms.png` | $1280 \times 800$ | 180 KB | Stage 3 Rooms with 44px stepper buttons. |
| `12_stage4_buildable_space.png` | $1280 \times 800$ | 198 KB | Stage 4 Buildable Space 4-step spatial model. |
| `13_stage4_details_open.png` | $1280 \times 800$ | 205 KB | Stage 4 with building rules and setback calculations open. |
| `14_stage5_construction_style.png`| $1280 \times 800$ | 122 KB | Stage 5 Construction Style selection cards. |
| `15_stage6_finishes_materials.png` | $1280 \times 800$ | 122 KB | Stage 6 Finishes and package selection. |
| `16_stage7_preliminary_estimate.png`| $1280 \times 800$ | 177 KB | Stage 7 Preliminary Estimate summary and reconciled cost heads. |
| `17_stage8_detailed_boq.png` | $1280 \times 800$ | 113 KB | Stage 8 Detailed BOQ preview and unlock options. |
| `18_calculator_mobile_stage1.png` | $390 \times 844$ | 57 KB | Mobile viewport Stage 1 layout. |
| `19_calculator_mobile_stage7.png` | $390 \times 844$ | 14 KB | Mobile viewport Stage 7 estimate with zero horizontal clipping. |

---

## 3. Production Asset Isolation Verification

- **Public Directory Inspection:** `public/verification_screenshots/` has been removed.
- **Production Bundle Inspection:** A recursive search of `dist/` confirms **0 internal screenshot files** are present in production assets.
- **Script Target Verification:** `scripts/capture_all_pages.mjs` has been updated to output directly to `artifacts/hutty-2-verification-screenshots/`.

---

## 4. End-to-End User Journey Verification

### Guest Customer Journey (Unauthenticated)
1. User lands on `/` $\to$ clicks *"Start Free Estimate"*.
2. Direct navigation to `/calculator?stage=1` (No forced login barrier).
3. Selects plot size ($30 \times 40\text{ ft}$) $\to$ 2D canvas displays real-time plot aspect and $30\text{ ft}$ road.
4. Proceeds through Stages 2, 3, 4, 5, and 6. State persists on Back/Forward navigation.
5. Reaches Stage 7: Receives preliminary cost estimate, itemized materials/labour breakdown, and planning disclaimers.
6. Opens "Details & assumptions" drawer: Inspects setback geometry ($963\text{ sq.ft}$) vs. coverage cap ($840\text{ sq.ft}$).
7. Proceeds to Stage 8: Views work-by-work BOQ schedule and commercial tier unlock cards.

**Outcome:** Complete 8-stage guest journey passes without crashes, console errors, or broken navigation.

