# HUTTY 2.0 — DESIGN SYSTEM SPECIFICATION
**Version:** 2.0.0  
**Status:** Approved & Implemented  
**Target Persona:** First-time Indian homeowners & non-technical builders  
**Aesthetic:** Modern, Minimalist, Architectural, Human-Centred  

---

## 1. Brand Philosophy & Core Principles

Hutty helps Indian homeowners understand their construction project before they break ground. Building a home in India is often a once-in-a-lifetime emotional and financial commitment, fraught with opaque contractor quotes, hidden costs, and technical jargon.

### Core Design Principles:
1. **Simple on the surface. Powerful underneath.** Present clean, uncluttered decisions to the user while maintaining rigorous quantity-surveying physics and statutory bye-laws under the hood.
2. **Clarity over cleverness.** Use plain English ("Ground floor plus one upper floor" instead of "G+1 Duplex RCC structure") and relatable visual selections.
3. **Radical transparency.** Never present arbitrary figures without showing the underlying quantities (tonnes of steel, bags of cement, labour man-days) and formula assumptions via the universal "Details & assumptions" drawer.
4. **Human warmth and guidance.** Frame the experience as a supportive collaboration between the homeowner, advanced planning technology, and independent professional architects and engineers.

---

## 2. Color Palette & Token Definitions

The color system combines the grounding stability of Indian architectural greenery with crisp warm neutrals and an energetic accent.

```
┌────────────────────────────────────────────────────────────────────────┐
│ PRIMARY GREEN       ACCENT ORANGE      WARM WHITE        DARK CHARCOAL │
│ #1B3D34             #F28C28            #F8F8F6           #111827       │
│ Forest Authority    Action & Highlight Canvas Base       Deep Text     │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Brand Tokens

| Token Name | Hex Code | Tailwind Class | Role & Usage |
|---|---|---|---|
| `--color-brand-primary` | `#1B3D34` | `bg-[#1B3D34]`, `text-[#1B3D34]` | Primary brand green. Used for headers, primary CTA buttons, active state borders, and authoritative icons. |
| `--color-brand-primary-hover` | `#142E27` | `hover:bg-[#142E27]` | Darkened hover state for primary green interactive elements. |
| `--color-brand-primary-light` | `#EBF3EF` | `bg-[#EBF3EF]` | Tinted soft green surface. Used for icon badges, active chips, and subtle container backgrounds. |
| `--color-brand-accent` | `#F28C28` | `bg-[#F28C28]`, `text-[#F28C28]` | Vibrant architectural orange. Used for highlighted metrics, badges, price points, and key interactive accents. |
| `--color-brand-accent-hover` | `#D9771C` | `hover:bg-[#D9771C]` | Darkened hover state for orange action buttons. |
| `--color-brand-accent-light` | `#FDF3E9` | `bg-[#FDF3E9]` | Tinted orange background for promotional pills and notification alerts. |
| `--color-brand-bg` | `#F8F8F6` | `bg-[#F8F8F6]` | Warm architectural white. The default background across all customer-facing routes. Eliminates sterile clinical glare. |
| `--color-brand-surface` | `#FFFFFF` | `bg-white` | Pure white. Used for elevated interactive cards, modal sheets, and dropdown surfaces. |

### 2.2 Neutral & Border Tokens

| Token Name | Hex Code | Role & Usage |
|---|---|---|
| `--color-text-main` | `#111827` / `#1B3D34` | Primary high-contrast text for headings and body copy (WCAG AAA compliant). |
| `--color-text-muted` | `#4B5563` / `#687770` | Secondary descriptive text, subtitles, and supporting labels. |
| `--color-text-subtle` | `#9CA3AF` | Inactive placeholders, disabled hints, and meta timestamps. |
| `--color-border-subtle` | `#E2E8E3` / `#E3E8E2` | Standard card borders, container outlines, and divider lines. |
| `--color-border-hover` | `#1B3D34` / `#CBD5E1` | Card hover border transition to indicate interactivity. |

### 2.3 Status & Advisory Tokens

| Token Name | Hex Code | Role & Usage |
|---|---|---|
| `--color-badge-sample-bg` | `#FEF3C7` (amber-50) | Background for `Sample Profile` badge on seeded consultant profiles. |
| `--color-badge-sample-text` | `#92400E` (amber-800) | Text color for `Sample Profile` badge ensuring full transparency. |
| `--color-status-success` | `#059669` | Validation pass, completed stage checkmark, and live status indicator. |
| `--color-status-warning` | `#D97706` | Setback clearance warnings and building coverage alerts. |
| `--color-status-error` | `#DC2626` | Form validation errors and submission retry alerts. |

---

## 3. Typography System

The typography hierarchy balances editorial authority with effortless legibility across desktop and mobile screens.

- **Primary Sans Font:** Inter, Plus Jakarta Sans, system-ui, -apple-system, sans-serif
- **Heading Display Font:** Plus Jakarta Sans / Inter SemiBold to ExtraBold
- **Numerical / Tabular Font:** Inter with `tabular-nums` for aligned pricing tables and BOQ quantities.

### 3.1 Typographic Scale

| Style Level | Desktop (px / rem) | Mobile (px / rem) | Weight | Line Height | Tracking | Usage |
|---|---|---|---|---|---|---|
| **Display 1** | `48px` / `3.0rem` | `32px` / `2.0rem` | 900 (Black) | `1.1` | `-0.025em` | Hero main proposition headline |
| **Heading 1** | `36px` / `2.25rem` | `26px` / `1.625rem` | 800 (ExtraBold) | `1.2` | `-0.02em` | Section headers, Stage titles |
| **Heading 2** | `24px` / `1.5rem` | `20px` / `1.25rem` | 700 (Bold) | `1.3` | `-0.015em` | Card groups, Modal headers |
| **Heading 3** | `18px` / `1.125rem` | `16px` / `1.0rem` | 700 (Bold) | `1.4` | `0` | Sub-section cards, Pricing tiers |
| **Body Large** | `16px` / `1.0rem` | `15px` / `0.9375rem` | 500 (Medium) | `1.5` | `0` | Introductory paragraphs, key callouts |
| **Body Regular**| `14px` / `0.875rem`| `14px` / `0.875rem` | 400/500 | `1.5` | `0` | Standard descriptions, form labels |
| **Body Small**  | `12px` / `0.75rem` | `12px` / `0.75rem`  | 500 (Medium) | `1.4` | `0.01em` | Metadata, badges, card footnotes |
| **Micro / Tag** | `10px` / `0.625rem`| `10px` / `0.625rem` | 700 (Bold) | `1.2` | `0.05em` | Uppercase category chips, status tags |

---

## 4. Spacing, Grid & Layout Metrics

The spacing scale is derived from a strict $4\text{ px}$ baseline grid to ensure mathematical alignment and visual rhythm.

### 4.1 Spacing Scale

| Token | Pixels | Tailwind | Primary Application |
|---|---|---|---|
| `space-1` | $4\text{ px}$ | `p-1`, `gap-1` | Micro padding between icons and text badges |
| `space-2` | $8\text{ px}$ | `p-2`, `gap-2` | Chip padding, button icon gaps |
| `space-3` | $12\text{ px}$ | `p-3`, `gap-3` | Compact card interior padding, mobile form spacing |
| `space-4` | $16\text{ px}$ | `p-4`, `gap-4` | Standard card padding, input field height offsets |
| `space-6` | $24\text{ px}$ | `p-6`, `gap-6` | Desktop card interiors, modal sheet padding |
| `space-8` | $32\text{ px}$ | `p-8`, `gap-8` | Container margins, stage transition gutters |
| `space-12`| $48\text{ px}$ | `py-12` | Section vertical rhythm on mobile |
| `space-16`| $64\text{ px}$ | `py-16` | Section vertical rhythm on tablet |
| `space-24`| $96\text{ px}$ | `py-24` | Editorial section spacing on desktop |

### 4.2 Max Container Widths

- **Max Content Width (Wide):** `max-w-7xl` ($1280\text{ px}$) — Landing page heroes and major sections.
- **Max Content Width (Calculator):** `max-w-4xl` ($896\text{ px}$) — Stage cards and estimate summary.
- **Max Content Width (Narrow / Forms):** `max-w-xl` ($576\text{ px}$) — Auth dialogs and checkout flows.
- **Drawer Width:** `w-full max-w-xl` ($576\text{ px}$) — "Details & assumptions" slide-over sheet.

### 4.3 Breakpoints

| Breakpoint | Minimum Width | Target Devices | Layout Behavior |
|---|---|---|---|
| `xs` | $390\text{ px}$ | Standard Indian mobile viewport (iPhone 12/13/14, Galaxy A/S series) | Single column, stacked CTA buttons, $44\text{ px}$ tap targets |
| `sm` | $640\text{ px}$ | Large smartphones & compact phablets | 2-column card grids, horizontal button pairs |
| `md` | $768\text{ px}$ | iPad Mini & 7-8" Android tablets | 3-column feature grids, expanded navigation bar |
| `lg` | $1024\text{ px}$| iPad Pro, MacBook Air & 13" Laptops | Split-screen hero, 2D/3D visualizer side-by-side |
| `xl` | $1280\text{ px}$| Desktop monitors | 4-column metric cards, generous whitespace |

---

## 5. Elevation, Radii & Border Styling

### 5.1 Border Radii
- **Full Pill (`rounded-full`):** Category badges, tag chips, floating status indicators, stepper counter circles.
- **Large Container (`rounded-3xl` / $24\text{ px}$):** Primary stage card surfaces, hero preview canvas, modal sheets.
- **Standard Card (`rounded-2xl` / $16\text{ px}$):** Interactive option cards, consultant profile cards, BOQ summary cards.
- **Interactive Button (`rounded-xl` / $12\text{ px}$):** Action buttons, input fields, selector tabs.
- **Small Badge (`rounded-lg` / $8\text{ px}$):** Thumbnail previews, icon wrappers.

### 5.2 Shadows & Elevation
- **Card Resting (`shadow-2xs` / `shadow-xs`):** `0 1px 2px 0 rgba(0, 0, 0, 0.04)` — Subtle grounding without visual clutter.
- **Card Hover (`shadow-md`):** `0 4px 6px -1px rgba(27, 61, 52, 0.08)` — Light green-tinted lift on interactive cards.
- **Floating Overlay / Drawer (`shadow-2xl`):** `0 25px 50px -12px rgba(0, 0, 0, 0.25)` — High elevation for modal dialogs and slide-over sheets.

---

## 6. Motion & Animation Tokens

Motion in Hutty 2.0 is purposeful, informative, and performance-minded. It provides physical feedback to actions and clarifies spatial relationships without slowing user progress.

### 6.1 Motion Timing & Easing

| Token | Duration | Easing Curve | Application |
|---|---|---|---|
| `--motion-micro` | $150\text{ ms}$ | `ease-out` / `active:scale-95` | Button press, radio check, stepper counter increment |
| `--motion-card` | $220\text{ ms}$ | `cubic-bezier(0.16, 1, 0.3, 1)` | Card hover elevation, border color transition |
| `--motion-stage` | $280\text{ ms}$ | `cubic-bezier(0.16, 1, 0.3, 1)` | Slide/fade between calculator stages (Next / Previous) |
| `--motion-drawer` | $350\text{ ms}$ | `cubic-bezier(0.32, 0.72, 0, 1)` | "Details & assumptions" slide-in from right edge |
| `--motion-hero` | $500\text{ ms}$ | `cubic-bezier(0.16, 1, 0.3, 1)` | Hero headline entrance and staggered feature reveal |

### 6.2 Framer Motion Variants

```tsx
// Standard Stage Transition (Left to Right)
export const stageMotionVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: 'easeIn' } },
};

// Details & Assumptions Drawer Slide-Over
export const drawerVariants = {
  closed: { x: '100%', transition: { type: 'spring', damping: 30, stiffness: 300 } },
  open: { x: 0, transition: { type: 'spring', damping: 30, stiffness: 300 } },
};
```

### 6.3 Accessibility & Reduced Motion
Every motion interaction respects the user's OS-level accessibility setting:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 7. Component Specifications

### 7.1 Action Buttons
- **Primary Action Button (`bg-[#1B3D34]`):**
  - Minimum height: $48\text{ px}$ (ensures comfortable thumb reach on mobile).
  - Minimum touch target: $44 \times 44\text{ px}$.
  - Text: Bold $14\text{ px}$ white, centered with trailing icon (e.g., `ArrowRight`).
  - Active feedback: `active:scale-[0.98]`.
- **Secondary Action Button (`border-[#D7DFD9]`):**
  - Background: White `#FFFFFF`, border: $1\text{ px}$ neutral grey.
  - Hover: Background `#F8F9F7`, border `#1B3D34`.
  - Icon: Leading icon with brand color.
- **Stepper Counter Controls:**
  - Minus (`-`) and Plus (`+`) buttons: $44 \times 44\text{ px}$ rounded-full circular buttons.
  - Border: $1.5\text{ px}$ `#E2E8E3`.
  - Display number: $18\text{ px}$ Bold tabular numerals centered between buttons.

### 7.2 Selectable Option Cards
- **Unselected State:** White surface, $1\text{ px}$ border `#E2E8E3`, subtle grey text description.
- **Selected State:** White surface, $2\text{ px}$ solid border `#1B3D34`, tinted light green badge, checkmark icon indicator in top-right corner.
- **Interactivity:** Cursor pointer, smooth hover border transition (`duration-200`).

### 7.3 Progressive Disclosure Drawer (`DetailsAndAssumptions.tsx`)
- **Trigger:** Accessible via top-right pill button ("Details & assumptions") on every calculator stage, or via `?details=open` URL parameter.
- **Structure:**
  - Backdrop: `bg-black/40 backdrop-blur-xs`.
  - Drawer Panel: Right-aligned slide-over, max width $576\text{ px}$, $100\text{vh}$.
  - Header: Clear title, stage context, and close button (`X`, min $44\text{ px}$ target).
  - Navigation: Horizontal scrollable tab strip with 9 categorized tabs.
  - Content Body: Rich tabular calculations, exact mathematical formulas, and statutory references.

---

## 8. Human Photography & Architectural Imagery Guidelines

Visual assets in Hutty 2.0 must build immediate emotional resonance, trust, and professional credibility.

### 8.1 Photography Principles
1. **Authentic Indian Residential Context:** Feature contemporary Indian homes (brick, plastered RCC, stone accents, teak doors) rather than Western suburban houses.
2. **Human-Centred Interaction:** Show genuine interactions—homeowners looking over architectural floor plans with a practitioner, an engineer holding blueprints on a job site, a family in a naturally lit living room.
3. **Natural Architectural Lighting:** Warm, natural morning or late-afternoon sunlight; avoid sterile commercial studio flash or harsh fluorescent lighting.
4. **No Deceptive Stock Expert Portraits:** Mock or seeded consultant profiles must be clearly badged with `Sample Profile` chips. Never present random stock imagery as genuine verified professionals.

### 8.2 Image Optimization Standards
- **Format:** High-efficiency WebP / compressed JPEG.
- **Max Payload:** Hero images $< 1.2\text{ MB}$; card thumbnails $< 80\text{ kB}$.
- **Lazy Loading:** `loading="lazy"` on all below-the-fold images; `loading="eager"` and high fetch priority on the hero render.
- **Aspect Ratios:** Hero: `16:9` or `4:3`; Cards: `3:2`; Consultant Avatars: `1:1` circle or `rounded-2xl`.

---

## 9. Accessibility & Quality Standards (WCAG 2.1 AA)

1. **Contrast Ratio:** All primary text on `#F8F8F6` and `#FFFFFF` maintains at least `7:1` contrast (exceeding WCAG AAA `7:1` and AA `4.5:1`). Secondary text (`#4B5563`) achieves `5.1:1` (exceeding AA).
2. **Keyboard Navigation:** Every interactive button, card, and input includes visible focus outlines (`focus-visible:ring-2 focus-visible:ring-[#1B3D34] focus-visible:ring-offset-2`).
3. **Screen Reader Support:** Steppers, modal dialogs, and tabs contain descriptive `aria-label`, `role="dialog"`, `role="tab"`, and `aria-expanded` attributes.
4. **Zero Horizontal Overflow:** All layouts are tested down to $320\text{ px}$ minimum width with zero horizontal scrollbar or clipped content.

