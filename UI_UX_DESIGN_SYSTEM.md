# Hutty — UI/UX Design System Specification (Launch Master)

## 1. Design Philosophy
**"Build your home with clarity."**  
**"Simple on the surface. Powerful underneath."**

Hutty provides deterministic architectural planning, physical material schedules, and bank-ready residential construction cost estimates for Indian homeowners and architects.
The platform is designed to feel:
- **As polished and intuitive as Apple products:** Calm, restrained, tactile, and harmonious.
- **As approachable and usable as Google products:** Plain-language guidance, clear inputs, no cognitive overwhelm.
- **As trustworthy and purpose-built as a premium architectural studio:** Accurate units (`m³`, `kg`, `CFT`, `bags`, `sq.ft`), transparent engineering citations (IS 456, NBC 2016), and instant visual feedback.

---

## 2. Color System & Design Tokens

| Token Name | Hex Code | Semantic Role |
| :--- | :--- | :--- |
| **Primary Brand** | `#1B3D34` | Primary actions, brand identity, active navigation, focused outlines |
| **Primary Hover** | `#142F28` | Hover and pressed states for primary buttons and interactive elements |
| **Accent Orange** | `#F28C28` | Roof accent, selective attention, critical highlights, progress indicator lead |
| **Text Primary** | `#172722` | High-contrast body and heading text |
| **Text Secondary** | `#687770` | Supporting descriptions, helper labels, table metadata |
| **Page Background** | `#F8F8F6` | Architectural off-white warm canvas |
| **Surface** | `#FFFFFF` | Form cards, dialogs, dropdowns, input controls |
| **Border** | `#E3E8E2` | Structural dividing lines, card borders, control outlines |
| **Success Surface** | `#E7F3E8` | Confirmation notices, completed steps, valid input feedback |
| **Information Blue** | `#4285F4` | Informational links, tooltips, neutral citations |
| **Soft Mint** | `#DDF4E7` | Selected choice cards, active tab highlights |
| **Soft Lavender** | `#EEE8FF` | Optional feature highlights, comparison differentiators |

### Semantic Color Rules:
- **Green (`#1B3D34`):** Primary decisions, progress, confirmed states.
- **Orange (`#F28C28`):** Selective attention, primary CTA indicator, roof accent. Never overused.
- **Red (`#DC2626`):** Destructive actions, boundary violations, critical errors.
- **Neutral Grays / Muted Green:** Supporting text and subtle borders.
- **Never interchange blue and orange** for the same meaning.
- **Never sacrifice text contrast** for decorative styling.

---

## 3. Typography Scale
- **Display & Headings:** `Plus Jakarta Sans`, sans-serif (`font-heading`).
- **Body, Controls, Tables & Numbers:** `Inter`, sans-serif (`font-sans`).

| Level | Size | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | `clamp(2.25rem, 5vw, 3.75rem)` | 800 | 1.08 | `-0.035em` |
| **Page Title (H1)** | `24px – 30px` | 800 | 1.15 | `-0.025em` |
| **Section Title (H2)** | `18px – 22px` | 700 | 1.25 | `-0.02em` |
| **Card / Subsection (H3)** | `14px – 16px` | 650 | 1.35 | `-0.01em` |
| **Body Standard** | `14px – 15px` | 400 | 1.55 | `0` |
| **Form Label** | `12px – 13px` | 650 | 1.4 | `0` |
| **Small / Helper Text** | `11px – 12px` | 400 | 1.45 | `0` |
| **Eyebrow / Badge** | `10px – 11px` | 750 | 1.3 | `+0.08em` (uppercase) |
| **Numerical Data / Units** | `font-mono tabular-nums` | 700 | 1.2 | `0` |

---

## 4. Spacing, Geometry & Shadows
- **Base Spacing:** `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `48px`.
- **Corner Radii:**
  - Panel / Large Container: `14px` (`rounded-[14px]`)
  - Choice Card / Input / Button: `8px – 10px` (`rounded-lg` / `rounded-[10px]`)
  - Badge / Small Tag: `6px – 7px`
  - Stepper Controls: `6px`
- **Borders:** Thin `1px solid #E3E8E2` default. Active selectable controls: `1.5px solid #1B3D34`.
- **Shadows:** Subtle ambient shadows derived from Hutty green (`rgba(27, 61, 52, 0.04)` to `rgba(27, 61, 52, 0.08)`). No heavy black or blurry drop shadows.

---

## 5. Calculator UI Architecture (Prototype Guided)
The construction calculator implements the guided structure demonstrated in `hutty_calculator_ui_prototype.html`:
1. **Top Header Area:**
   - Eyebrow: `Your home journey`
   - Page Heading: Clear, unambiguous step name (e.g., `Tell us about your plot`)
   - Step Count: `Step X of 10`
   - Progress Track: Sleek 4px track with `#1B3D34` fill and `#F28C28` lead dot.
2. **Step Pills Navigation:**
   - Horizontally scrollable row of pill buttons: `1. Package`, `2. Plot`, `3. Planning`, `4. Home`, `5. Rooms`, `6. Materials`, `7. Flooring`, `8. Doors`, `9. Services`, `10. Finishes`, `✓ Review`.
   - Clear visual differentiation:
     - Active: `#1B3D34` background, white text.
     - Completed: Soft mint `#EDF3ED` / `#E7F3E8`, `#1B3D34` text.
     - Incomplete: Transparent background, `#687770` text.
3. **Balanced Two-Column Layout:**
   - **Main Form Panel (`minmax(0, 1fr)`):** White background, border `#E3E8E2`, radius `14px`, padding `20px-24px`.
     - Subtitle & plain-language help text.
     - Responsive grid of choice cards or input fields.
     - Tactile steppers for quantity inputs with direct numeric entry.
     - Bottom controls: Back button (outline), helpful note ("Selections stay saved as you navigate."), and Continue button (primary green).
   - **Home Snapshot Sidebar (`280px – 320px`):**
     - Eyebrow: `Your home snapshot`
     - Responsive 3D House Preview (Three.js interactive model / architectural diagram).
     - Live reactive stats: Selected Package, Plot Area, Home Configuration, Rooms.
     - Live cost / estimate preview badge.
     - "Review all selections" quick jump button.

---

## 6. Shared Component Inventory
- **Buttons (`Button.tsx`):** Primary green (`#1B3D34`), Secondary outline (`#E3E8E2`), Subtle ghost.
- **Fields & Inputs (`Input.tsx`, `Select.tsx`):** Standard 40px height, `#DCE3DC` border, `#172722` text, `#1B3D34` focus ring.
- **Quantity Steppers:** Clear label, `[-]` decrement, direct numeric input, `[+]` increment.
- **Choice Cards:** Card buttons with bold title, short subtitle, 1.5px `#1B3D34` border and soft green tint `#F0F5F0` when active.
- **Status Badges (`StatusBadge.tsx`):** Standard, Premium, Luxury, Draft, Published, Verified.
- **Modals & Dialogs (`Modal.tsx`):** Accessible backdrop, smooth blur, clear dismiss, keyboard escape handler.
