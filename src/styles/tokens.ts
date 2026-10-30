/**
 * ==============================================================================
 * HUTTY 3.0 — ARCHITECTURAL DESIGN SYSTEM TOKENS
 * ==============================================================================
 *
 * Brand: Hutty
 * Tagline: Build your home with clarity.
 *
 * Design Direction: Architectural, editorial, premium, minimal, precise and human.
 * Palette:
 *   - Primary Forest Green: #1B3D34
 *   - Accent Orange:        #F28C28
 *   - Primary Background:   #F8F8F6
 *   - Border / Neutral:     #E5E7EB
 *   - Primary Text:         #18211E
 *   - Secondary Text:       #707873
 *
 * Typography:
 *   - Manrope: Display Headings
 *   - Inter: Body & UI
 *   - Tabular Numerals: Financial figures, BOQ tables, quantities, and dimensions
 */

export const HUTTY_COLORS = {
  /** Core brand forest green */
  primaryGreen: '#1B3D34',
  primaryGreenHover: '#142F28',
  primaryGreenActive: '#0F241F',
  primaryGreenSoft: 'rgba(27, 61, 52, 0.08)',
  primaryGreenLight: 'rgba(27, 61, 52, 0.04)',
  primaryGreenMuted: 'rgba(27, 61, 52, 0.025)',

  /** Core accent roof orange (used with architectural restraint) */
  accentOrange: '#F28C28',
  accentOrangeHover: '#D9771A',
  accentOrangeActive: '#C26715',
  accentOrangeSoft: 'rgba(242, 140, 40, 0.12)',
  accentOrangeLight: 'rgba(242, 140, 40, 0.05)',

  /** Backgrounds */
  background: '#F8F8F6',
  surfaceWhite: '#FFFFFF',
  surfaceMuted: '#F2F2EE',
  surfaceElevated: '#FFFFFF',

  /** Neutral borders & grid lines */
  border: '#E5E7EB',
  borderLight: '#EEF0F2',
  borderStrong: '#CBD5CB',
  borderDark: 'rgba(27, 61, 52, 0.18)',

  /** Text hierarchy */
  textPrimary: '#18211E',
  textSecondary: '#707873',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  /** Semantic statuses */
  statusSuccess: '#1B3D34',
  statusSuccessBg: '#E7F3E8',
  statusSuccessBorder: '#C5E3C8',

  statusWarning: '#D9771A',
  statusWarningBg: 'rgba(242, 140, 40, 0.10)',
  statusWarningBorder: 'rgba(242, 140, 40, 0.28)',

  statusError: '#B91C1C',
  statusErrorBg: '#FEF2F2',
  statusErrorBorder: '#FCA5A5',

  statusInfo: '#2563EB',
  statusInfoBg: '#EFF6FF',
  statusInfoBorder: '#BFDBFE',
} as const;

export const HUTTY_TYPOGRAPHY = {
  fonts: {
    heading: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  letterSpacing: {
    tightest: '-0.035em',
    tighter: '-0.025em',
    tight: '-0.015em',
    normal: '0em',
    wide: '0.025em',
    widest: '0.08em',
  },
} as const;

export const HUTTY_SPACING = {
  containerMax: '1280px',
  sectionY: {
    sm: '3rem',     // 48px
    md: '5rem',     // 80px
    lg: '7.5rem',   // 120px
  },
  gridGap: {
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
  },
} as const;

export const HUTTY_RADII = {
  none: '0px',
  sm: '4px',
  md: '6px',
  btn: '8px',
  input: '8px',
  card: '12px',
  panel: '16px',
  pill: '9999px',
} as const;

export const HUTTY_SHADOWS = {
  xs: '0 1px 2px 0 rgba(27, 61, 52, 0.04)',
  sm: '0 1px 3px 0 rgba(27, 61, 52, 0.06), 0 1px 2px -1px rgba(27, 61, 52, 0.03)',
  md: '0 4px 12px -2px rgba(27, 61, 52, 0.07), 0 2px 4px -2px rgba(27, 61, 52, 0.03)',
  lg: '0 12px 28px -4px rgba(27, 61, 52, 0.09), 0 4px 8px -2px rgba(27, 61, 52, 0.04)',
  focus: '0 0 0 2px #FFFFFF, 0 0 0 4px #1B3D34',
} as const;

export const HUTTY_TRANSITIONS = {
  fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
  standard: '220ms cubic-bezier(0.16, 1, 0.3, 1)',
  smooth: '300ms cubic-bezier(0.16, 1, 0.3, 1)',
  slow: '500ms cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

