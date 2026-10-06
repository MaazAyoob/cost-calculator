# Hutty — UI/UX Design System Specification

## 1. Design Philosophy
**"Calm technology for building a home."**

Hutty provides deterministic architectural planning, physical material schedules, and bank-ready construction cost estimates. The design system is crafted to communicate:
- **Clarity:** Homeowners should understand their spaces, materials, and costs without construction jargon.
- **Trust & Authority:** Rigorous engineering standards (IS 456, IS 1786 Fe550D, NBC 2016) presented with elegance.
- **Precision:** Units and quantities (`sq.ft`, `ft`, `m³`, `kg`, `tonnes`, `bags`, `CFT`, `litres`, `Nos.`) are always visually prominent.
- **Progress:** Multi-step guided planning that informs the user where they are, why an input is needed, and what downstream trade it affects.

---

## 2. Color System & Design Tokens
Hutty strictly uses a curated, architectural color system. No generic SaaS blues, purple gradients, or gold luxury styling.

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--cc-bg` | `#F8F8F6` | Architectural off-white warm canvas |
| `--cc-surface` | `#FFFFFF` | Primary card and modal surface |
| `--cc-brand` | `#1B3D34` | Deep Forest Green — Primary brand identity, headlines, primary buttons |
| `--cc-brand-hover` | `#132C25` | Deep Forest Green hover state |
| `--cc-brand-soft` | `rgba(27,61,52,0.08)` | Tonal pill badges, subtle active nav highlights |
| `--cc-accent` | `#F28C28` | Roof Accent Orange — Controlled CTA highlights, badges, key progress |
| `--cc-accent-hover` | `#D9771A` | Warm orange hover state |
| `--cc-text-primary` | `#1B3D34` | Deep forest dark text for high legibility |
| `--cc-text-secondary` | `#4B5563` | Balanced neutral gray for descriptions, helpers, table data |
| `--cc-border` | `#E5E7EB` | Subtle structural division lines |
| `--cc-overlay` | `rgba(27,61,52,0.40)` | High-contrast modal backdrop with blur |

---

## 3. Typography Scale
Typography pairs **Plus Jakarta Sans** for display, headings, and numbers with **Inter** for forms, tables, body text, and technical engineering units.

- **Display Hero:** `Plus Jakarta Sans`, 44px–56px (fluid mobile 36px), font-weight 900, tracking -0.03em.
- **H1 / Page Titles:** `Plus Jakarta Sans`, 28px–36px, font-weight 800, tracking -0.025em.
- **H2 / Section Headers:** `Plus Jakarta Sans`, 22px–26px, font-weight 700.
- **H3 / Card Titles:** `Plus Jakarta Sans`, 16px–18px, font-weight 700.
- **Body Large:** `Inter`, 16px, line-height 1.6.
- **Body Standard:** `Inter`, 14px, line-height 1.55.
- **Body Small / Data:** `Inter`, 12px, tabular numbers (`font-variant-numeric: tabular-nums`).
- **Caption / Unit:** `Inter`, 10px–11px, uppercase font-weight 700, tracking +0.05em.

---

## 4. Spacing, Radii & Shadows
- **Base Grid:** 4px / 8px scale (`p-2`, `p-3`, `p-4`, `p-5`, `p-6`, `p-8`).
- **Corner Radii:**
  - Panel / Section: `24px` (`rounded-3xl`)
  - Card: `16px` (`rounded-2xl`)
  - Button / Input: `10px`–`12px` (`rounded-xl`)
  - Badge / Tag: `6px`–`8px` (`rounded-md`)
- **Shadow System:** Soft ambient shadows derived from Hutty green (`rgba(27, 61, 52, 0.05)` to `rgba(27, 61, 52, 0.12)`) without muddy black drop shadows.

---

## 5. Layout & Responsive Breakpoints
- **Container Max-Width:** `1360px` (`.hutty-container`), centered with balanced horizontal gutters.
- **Wide Displays (1920px+):** Controlled expansion preventing oversized line lengths.
- **Mobile First Breakpoints:**
  - `320px–430px`: Full-width padding (16px), stacked cards, sticky bottom action bars, 48px minimum touch targets.
  - `768px–1024px`: 2-column grids, readable table scrolling, compact headers.
  - `1024px–1440px`: Split-screen calculator (45% input / 55% live preview), 4-column pricing cards.

---

## 6. Component Primitives
1. **Button (`src/components/ui/Button.tsx`)**:
   - `primary`: Deep forest green (`#1B3D34`) with hover and active scaling (`active:scale-[0.98]`).
   - `accent`: Roof orange (`#F28C28`) for prominent call-to-actions.
   - `secondary`: Soft brand tinted background (`rgba(27,61,52,0.06)`).
   - `outline`: White with `#E5E7EB` border.
   - `ghost`: Transparent with subtle hover tint.
2. **Card (`src/components/ui/Card.tsx`)**:
   - Clean architectural surfaces with subtle `#E5E7EB` border and soft elevation.
   - Interactive variant adds `#1B3D34/30` border hover.
3. **Input & Select (`src/components/ui/Input.tsx`, `Select.tsx`)**:
   - Explicit label above with clear unit suffix (`sq.ft`, `ft`, `m³`, `kg`, etc.).
   - Focus ring using Hutty brand green (`focus:ring-[#1B3D34]/15`).
4. **Modal (`src/components/ui/Modal.tsx`)**:
   - Accessible dialog with Escape key support, backdrop blur, body scroll locking, and automatic bottom sheet transformation on mobile.
5. **Badge (`src/components/ui/Badge.tsx`)**:
   - `brand`, `accent`, `neutral`, `success`, `warning`, `outline`.
6. **EmptyState & Skeleton (`src/components/ui/EmptyState.tsx`, `Skeleton.tsx`)**:
   - Human, reassuring empty states with descriptive guidance and shimmers during data loading.

---

## 7. Accessibility & Animation Principles
- **WCAG AA Contrast:** Deep Forest Green (`#1B3D34`) on Light Canvas (`#F8F8F6`) achieves high contrast ratio (> 10:1).
- **Reduced Motion:** Automatic `@media (prefers-reduced-motion: reduce)` rule cancels heavy animations.
- **Focus Rings:** Distinctive keyboard navigation outline (`focus-visible:ring-2 focus-visible:ring-[#1B3D34]`).
- **Body Scroll Lock:** Dialogs and mobile drawers lock body scrolling cleanly.
