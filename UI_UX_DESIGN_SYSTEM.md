# Hutty — UI/UX Design System Specification (Pre-Launch Master)

## 1. Brand Identity & Design Principles
- **Brand:** Hutty
- **Tagline:** *Build your home with clarity.*
- **Core Vision:** *Simple for the homeowner. Intelligent behind the scenes.* The platform feels like planning a future home—not completing a dense technical construction form.
- **Visual Direction:** Clean, architectural, modern, warm, and trustworthy—combining the simplicity of Apple/Google interfaces with the clarity and rigor of a professional construction planning product.

---

## 2. Brand Tokens & Color Palette

| Token Name | Hex Code / Value | Semantic Role & Usage |
|---|---|---|
| **Primary Forest Green** | `#1B3D34` | Primary actions, branding, key headings, active navigation, focused borders |
| **Primary Green Hover** | `#142F28` | Hover and pressed state for primary action buttons |
| **Accent Orange** | `#F28C28` | Roof accent, key progress indicators, primary CTA indicators, focal highlights (used selectively) |
| **Accent Orange Hover** | `#D9771A` | Hover state for accent buttons |
| **Main Background** | `#F8F8F6` | Architectural warm-white canvas background across all pages |
| **White Surface** | `#FFFFFF` | Cards, panels, inputs, modals, table surfaces |
| **Primary Text** | `#202522` | High-contrast headings, body titles, monetary values |
| **Secondary Text** | `#4B5563` | Subtitles, supporting copy, measurement units, table headers |
| **Border Neutral** | `#E5E7EB` | Dividers, card boundaries, inactive inputs, table row borders |
| **Border Strong** | `#CBD5CB` | Active card borders, focused state outlines |
| **Brand Soft Tint** | `rgba(27, 61, 52, 0.06)` | Subtle badge fills, soft icon backgrounds |
| **Orange Soft Tint** | `rgba(242, 140, 40, 0.08)` | Highlight badge fills, active selection highlights |
| **Success Surface** | `#E7F3E8` | Validation checkmarks, success callouts |

### Color Rules:
- **No generic colors:** Strictly use curated, harmonious brand tokens.
- **No excessive gradients:** Keep backgrounds calm, spacious, and architectural.
- **High accessible contrast:** All text passes WCAG AA contrast against its respective surface.

---

## 3. Typography Scale & Fonts

- **Headings Font:** `Plus Jakarta Sans`, sans-serif (`font-heading`, letter-spacing: `-0.02em` to `-0.035em`).
- **Body, UI, Inputs & Numbers:** `Inter`, sans-serif (`font-sans`, tabular numerals).

| Typography Role | Desktop Size / Leading | Mobile Size / Leading | Weight | Tracking |
|---|---|---|---|---|
| **Display Hero** | `48px – 56px` / `1.08` | `32px – 40px` / `1.15` | `800` (Extrabold) | `-0.035em` |
| **Section Title (H1/H2)** | `30px – 36px` / `1.18` | `24px – 28px` / `1.22` | `800` (Bold) | `-0.025em` |
| **Stage Title (H3)** | `22px – 26px` / `1.25` | `18px – 20px` / `1.30` | `700` (Bold) | `-0.02em` |
| **Card Heading (H4)** | `16px – 18px` / `1.35` | `15px – 16px` / `1.35` | `650` (Semibold) | `-0.01em` |
| **Body Standard** | `15px – 16px` / `1.60` | `14px – 15px` / `1.55` | `400` (Regular) | `0` |
| **Small / Helper Text** | `12px – 13px` / `1.50` | `11px – 12px` / `1.45` | `400` – `500` | `0` |
| **Eyebrow / Pill Badge** | `11px – 12px` / `1.20` | `10px – 11px` / `1.20` | `700` (Bold) | `+0.04em` |
| **Numbers & Currency** | `font-mono tabular-nums` | `font-mono tabular-nums` | `700` – `800` | `-0.01em` |

---

## 4. Geometry, Radii & Shadows

- **Border Radii:**
  - Panels & Large Containers: `16px – 24px` (`rounded-2xl` / `rounded-3xl`)
  - Selection Cards, Dialogs & Modals: `12px – 16px` (`rounded-xl` / `rounded-2xl`)
  - Buttons, Inputs & Steppers: `8px – 12px` (`rounded-lg` / `rounded-xl`)
  - Badges & Pills: `9999px` (`rounded-full`)
- **Shadows:**
  - Ambient elevation derived solely from `#1B3D34`:
  - `shadow-xs`: `0 1px 2px 0 rgba(27, 61, 52, 0.04)`
  - `shadow-sm`: `0 2px 4px 0 rgba(27, 61, 52, 0.05), 0 1px 2px -1px rgba(27, 61, 52, 0.03)`
  - `shadow-md`: `0 4px 12px -2px rgba(27, 61, 52, 0.07), 0 2px 4px -2px rgba(27, 61, 52, 0.03)`

---

## 5. Eight-Stage Calculator Journey Architecture

Guided by `Hutty_Calculator_Developer_UX_UI_Brief.pdf`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Your Plot       │ Location, Dimensions (W × L), Area, Land status, "Not sure"│
├────────────────────┼────────────────────────────────────────────────────────┤
│ 2. Your Home       │ Floor count (G to G+4), Purpose, Parking, Timeline     │
├────────────────────┼────────────────────────────────────────────────────────┤
│ 3. Your Rooms      │ Bed, Bath, Living/Dining, Kitchen, Optional spaces     │
├────────────────────┼────────────────────────────────────────────────────────┤
│ 4. Buildable Space │ GBA Setbacks, Plot Area vs Footprint vs BUA, Plan status│
├────────────────────┼────────────────────────────────────────────────────────┤
│ 5. Construct Style │ Structural System (RCC/Load bearing), Walling, Tiers   │
├────────────────────┼────────────────────────────────────────────────────────┤
│ 6. Materials       │ Flooring, Joinery, Electrical, Plumbing, Finishes      │
├────────────────────┼────────────────────────────────────────────────────────┤
│ 7. Your Estimate   │ Preliminary Cost Range, BUA, Breakdown, Quantities     │
│                    │ (Guest accessible without account creation)            │
├────────────────────┼────────────────────────────────────────────────────────┤
│ 8. Detailed BOQ    │ Work-wise BOQ preview, Rates, Labour, Taxes, Plans:    │
│                    │ Free (₹0) vs Detailed BOQ (₹499) vs Premium (₹1,499)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Calculator Interaction Standards:
1. **One decision per screen where practical:** Clear hierarchy, no dense form clutter.
2. **Top progress bar:** Shows active stage name (e.g. `Stage 1 of 8 · Your Plot`), progress indicator with `#1B3D34` fill and `#F28C28` lead dot.
3. **Responsive Split View (Desktop):** Main guided stage on the left, live architectural home snapshot and 3D preview on the right.
4. **Mobile Experience:** Optimized for single-thumb navigation, sticky bottom navigation with "Back" and "Continue", compact sticky top bar.
5. **State Preservation:** Navigating backward preserves all previous selections.
6. **"Not sure" fallback:** Available for land status, planning authority, setbacks, structural systems, and start timelines.

---

## 6. Four Canonical Products & Commercial Rates

| Product / Service | Displayed Price | Deliverables & Scope |
|---|---|---|
| **Free Estimate** | **₹0** | Complete 8-stage calculator journey, total built-up area (BUA), preliminary cost range, high-level cost breakdown (materials, labour, others), key material quantities (steel tonnes, cement bags, sand CFT), 3D house massing view, assumptions & planning disclaimers. Guest accessible. |
| **Detailed BOQ** | **₹499** | Everything in Free Estimate + Itemized civil & structural works BOQ, exact material quantities & unit rates, installed fixtures & joinery breakdown, trade labour breakdown with milestone schedule, GST schedule, official downloadable PDF report. Requires sign-in/account creation at purchase. |
| **Premium BOQ** | **₹1,499** | Everything in Detailed BOQ + Multi-scenario floorplan comparison, premium specification customization, permanent cloud save with version history, priority export suite. Disclaimed: consultation is a separate service. |
| **Consult an Expert** | **₹1,499** | Distinct professional consultation service. 1-on-1 scheduled session with a verified independent architect, structural engineer, contractor, or approvals specialist. Separate booking workflow. |

*Note: All historical ₹99 pricing has been permanently removed.*

---

## 7. Plain-Language Homeowner Terminology Guide

| Technical / Internal Term | Homeowner-Friendly Plain Language |
|---|---|
| Material takeoff / MTO | **Materials needed** |
| Structural steel physics | **Steel needed for the house** |
| Spatial matrix / allocation | **Room layout** |
| Deterministic calculation | **How we calculate your estimate** |
| Trade labour / execution trades | **Labour and work costs** |
| Bank-ready BOQ dossier | **Detailed construction cost report** |
| Verified specification plan | **Save your choices** |
| Massing / geometry synthesis | **3D house view and plot layout** |

---

## 8. Motion, Accessibility & Performance

- **Subtle Transitions:** Durations strictly within `180ms – 280ms` with cubic-bezier easing (`[0.16, 1, 0.3, 1]`).
- **Reduced Motion:** Fully supports `@media (prefers-reduced-motion: reduce)` by bypassing positional transforms.
- **Keyboard Navigation:** All interactive elements feature visible focus rings (`focus-visible:ring-2 focus-visible:ring-[#1B3D34]`).
- **Touch Targets:** Minimum touch target size of `44px × 44px` across all mobile viewports.
- **Zero Placeholder Dependencies:** Real SVG illustrations, curated photography, and live Three.js 3D models.
