# HUTTY ARCHITECTURAL TECHNOLOGY DESIGN SYSTEM V2
## Architectural Clarism · Precision Editorial · Data Takeoff Grammar

=============================================================================
1. COMPOSITION PRINCIPLES
=============================================================================

Hutty is transformed from a generic SaaS / card-grid builder into a serious architectural technology product:
**ARCHITECTURE + DIGITAL PRODUCT + EDITORIAL DESIGN + DATA CLARITY + PREMIUM CONSUMER UX**

### Core Tenets:
1. **Build with Mathematical Clarity**: The UI architecture reflects building architecture. Lines are measured, proportions are calculated, and data is grounded in engineering physics (IS-456, IS-1786, NBC 2016).
2. **Anti-Card Hegemony**: Eliminate endless rows of uniform 3-column white cards. Visual structures alternate between:
   - Split editorial layouts (large architectural headline + interactive procedural CAD viewer)
   - Large typographic numbers (8.64 T Steel, 1,080 Bags Cement)
   - Proportional allocation bars (visualizing where every rupee goes)
   - Structural blueprint frames and bracketed coordinate data blocks
   - Open content rhythm with generous negative space
3. **Scale Contrast**: Headings use bold display scale (up to 4.5rem / 72px) balanced against precise micro-typography (10px–11px uppercase monospace coordinates and technical annotations).
4. **Authenticity Over Artificial Hype**: Strictly zero fabricated reviews, arbitrary percentage claims, or stock-photo gimmicks (Rule 51). All metrics are deterministic quantity takeoffs or clearly labelled benchmark cases.

=============================================================================
2. COLOR SYSTEM
=============================================================================

| Token Name | Hex Code | HSL Equivalent | Architectural Application |
|---|---|---|---|
| **Deep Forest Green** | `#1B3D34` | `hsl(165, 39%, 17%)` | Primary brand surface, dominant headings, structural frames, key CTAs |
| **Forest Shade Dark** | `#142E27` | `hsl(165, 40%, 13%)` | Hover states, active pressed states, high-contrast borders |
| **Roof Orange (Accent)**| `#F28C28` | `hsl(30, 89%, 55%)` | Architectural dimension marks, focal highlights, active step indicators |
| **Warm Off-White** | `#F8F8F6` | `hsl(60, 9%, 97%)` | Primary page canvas, structural section backgrounds, drawing backdrops |
| **Secondary Slate** | `#4B5563` | `hsl(217, 13%, 34%)`| Editorial body text, supporting annotations, unit labels |
| **Architectural Border**| `#E5E7EB` | `hsl(220, 13%, 91%)`| Grid lines, CAD dimension ticks, boundary rules, table separators |
| **Crisp White** | `#FFFFFF` | `hsl(0, 0%, 100%)` | Focal elevated panels, modal backgrounds, input fields |
| **Engineering Amber** | `#D97706` | `hsl(38, 92%, 50%)` | Draft warnings, review alerts, active price override badges |
| **Structural Emerald**| `#059669` | `hsl(160, 84%, 39%)`| Verified calculation status, live server engine badges, paid indicators |

=============================================================================
3. TYPOGRAPHY
=============================================================================

- **Primary Display Font**: Plus Jakarta Sans (Variable, 500/700/800/900 weights)
- **Body & Editorial Font**: Inter (Regular, Medium, SemiBold)
- **Technical & Dimension Font**: Monospace (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New"`)

### Scale Hierarchy:
- **Giant Hero Headline**: `text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]`
- **Section Heading**: `text-2xl sm:text-4xl font-extrabold tracking-tight`
- **Architectural Display Numbers**:
  - Hero Stat (`.arch-stat-hero`): `text-4xl sm:text-6xl font-black font-heading tracking-tight tabular-nums`
  - Giant Stat (`.arch-stat-giant`): `text-5xl sm:text-7xl font-black font-heading tracking-tighter tabular-nums`
- **Technical CAD Annotations**: `text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#4B5563]`

=============================================================================
4. ARCHITECTURAL GRAPHIC LANGUAGE & TOKENS
=============================================================================

Implemented directly in `src/styles/globals.css`:

1. **`.arch-dim-line`**: Technical dimension line featuring subtle SVG-based end ticks indicating measured extents.
2. **`.arch-bracketed`**: Blueprint corner brackets highlighting critical planning modules.
3. **`.arch-crosshair-bg`**: Subtle 32px engineering crosshair grid pattern replacing boring plain grey backgrounds.
4. **`.arch-spec-pill`**: Architectural specification tag with monospace typography and hairline border.
5. **`.arch-rule-divider`**: Hairline divider with center CAD coordinate annotation (`SYS.CAD // DATUM`).

=============================================================================
5. SPACING & GRIDS
=============================================================================

- Standard Section Padding: `py-16 sm:py-24 lg:py-28`
- Container Max-Width:
  - Standard Content: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
  - Operations Console (Admin): `max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8`
  - Narrow Reading Dossier: `max-w-4xl mx-auto px-4 sm:px-6`
- Grid Compositions:
  - Asymmetric 12-column grid (`lg:grid-cols-12`):
    - Split Hero: 5 cols text + 7 cols interactive procedural 3D massing HUD
    - Admin Workstation: 3 cols sticky navigation sidebar + 9 cols operational workspace
    - Pricing Matrix: 4 cols featured ₹499 dossier + 4 cols standard ₹99 + 4 cols upcoming Complete Package

=============================================================================
6. DATA PRESENTATION & COST VISUALIZATION
=============================================================================

- **Proportional Cost Bar**: Replaced generic pie/donut charts with segmented horizontal allocation bars visually proportional to trade budgets (Structure, Finishes, Openings, MEP, Preliminaries).
- **Material Takeoff Panels**: Giant typographic units with steel grade (`Fe550D`), cement specification (`Grade 53 OPC/PPC`), and aggregate volumes in CFT.
- **Authoritative Ledgers**:
  - Desktop/Tablet: High-density tables with monospace numerical alignments and status pills.
  - Mobile: Stacked architectural record cards with category tags, baseline vs effective price, and tap actions.

=============================================================================
7. RESPONSIVE PATTERNS
=============================================================================

- **Mobile (< 640px)**:
  - Intentional stacked layouts rather than squeezed desktop elements
  - Full-screen architectural navigation drawer with numbered chapters
  - Sticky bottom CTAs with safe bottom padding (`pb-28`)
  - Admin tables transform into expandable record cards
- **Tablet (768px – 1024px)**:
  - 2-column balanced layouts, compact stepper navigation, preserved horizontal padding
- **Desktop (1280px – 1600px)**:
  - Two-column workstation layouts, sticky contextual sidebars, procedural 3D massing HUD
- **Ultrawide (1920px+)**:
  - Controlled max-widths preventing awkward line lengths while retaining bold architectural balance

=============================================================================
8. ACCESSIBILITY & PERFORMANCE
=============================================================================

- High-contrast text exceeding WCAG AA standards (Deep Forest Green `#1B3D34` on `#F8F8F6` ratio > 11:1).
- Clear visible focus states on all interactive controls (`focus:ring-2 focus:ring-[#1B3D34]`).
- Semantic HTML throughout (`<header>`, `<main>`, `<section>`, `<aside>`, `<h1>`–`<h4>`).
- Zero heavy 3D asset downloads; procedural Three.js/R3F meshes with zero external GLTF overhead.
- Code-split routes and lazy components.
