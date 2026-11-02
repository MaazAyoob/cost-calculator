/**
 * HUTTY 3.1 — ARCHITECTURAL DESIGN SYSTEM & ACCENT TOKENS
 *
 * Grounded in Bangalore residential civil engineering and contemporary architecture.
 * Backgrounds are preserved as clean crisp white (#FFFFFF) and light neutral (#F8F8F6).
 * Rich palette is applied through buttons, accents, highlights, active states, and badges.
 */

export const HUTTY_PALETTE = {
  // 1. Primary Colors
  deepForest: '#183B32',
  forestGreen: '#245747',
  emerald: '#347A62',
  softSage: '#B7CDBB',

  // 2. Warm Architectural Accents
  warmIvory: '#F7F3EA',
  sandstone: '#E9DDC9',
  terracotta: '#C66B4E',
  clay: '#A95640',

  // 3. Premium Accents
  mutedGold: '#C5A46D',
  paleGold: '#E5D5B4',

  // 4. Supporting Neutrals & Surfaces
  charcoal: '#18211E',
  slate: '#66716B',
  softWhite: '#FFFFFF',
  lightSage: '#E8EFE9',
} as const;

export const HUTTY_COLORS = {
  // Primary Forest Group
  deepForest: HUTTY_PALETTE.deepForest,
  forestGreen: HUTTY_PALETTE.forestGreen,
  emerald: HUTTY_PALETTE.emerald,
  softSage: HUTTY_PALETTE.softSage,

  // Warm Architectural Group
  warmIvory: HUTTY_PALETTE.warmIvory,
  sandstone: HUTTY_PALETTE.sandstone,
  terracotta: HUTTY_PALETTE.terracotta,
  clay: HUTTY_PALETTE.clay,

  // Premium Accents
  mutedGold: HUTTY_PALETTE.mutedGold,
  paleGold: HUTTY_PALETTE.paleGold,

  // Supporting Surfaces & Neutrals
  charcoal: HUTTY_PALETTE.charcoal,
  slate: HUTTY_PALETTE.slate,
  softWhite: HUTTY_PALETTE.softWhite,
  lightSage: HUTTY_PALETTE.lightSage,

  // Backwards-Compatible Semantic Tokens with Preserved Neutral Backgrounds
  primaryGreen: HUTTY_PALETTE.deepForest,
  primaryGreenHover: '#245747',
  primaryGreenActive: '#142E27',
  primaryGreenSoft: 'rgba(24, 59, 50, 0.08)',
  primaryGreenLight: 'rgba(24, 59, 50, 0.04)',
  primaryGreenMuted: 'rgba(24, 59, 50, 0.025)',

  accentOrange: HUTTY_PALETTE.terracotta,
  accentOrangeHover: '#A95640',
  accentOrangeActive: '#8C3D2B',
  accentOrangeSoft: 'rgba(198, 107, 78, 0.12)',
  accentOrangeLight: 'rgba(198, 107, 78, 0.05)',

  /** Preserved Original Neutral Backgrounds */
  background: '#F8F8F6',
  surfaceWhite: '#FFFFFF',
  surfaceMuted: '#F2F2EE',
  surfaceElevated: '#FFFFFF',

  /** Preserved Standard Neutral Borders */
  border: '#E5E7EB',
  borderLight: '#EEF0F2',
  borderStrong: '#CBD5CB',
  borderDark: 'rgba(24, 59, 50, 0.18)',

  /** Text hierarchy */
  textPrimary: '#18211E',
  textSecondary: '#66716B',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Status Colors
  statusSuccess: HUTTY_PALETTE.forestGreen,
  statusSuccessBg: HUTTY_PALETTE.lightSage,
  statusSuccessBorder: HUTTY_PALETTE.softSage,

  statusWarning: HUTTY_PALETTE.terracotta,
  statusWarningBg: 'rgba(198, 107, 78, 0.10)',
  statusWarningBorder: 'rgba(198, 107, 78, 0.30)',

  statusError: '#B91C1C',
  statusErrorBg: '#FEF2F2',
  statusErrorBorder: '#FCA5A5',

  statusInfo: '#2563EB',
  statusInfoBg: '#EFF6FF',
  statusInfoBorder: '#BFDBFE',
} as const;

export const HUTTY_TYPOGRAPHY = {
  fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontHeading: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
} as const;

export const HUTTY_SPACING = {
  containerMax: '1280px',
  sectionPaddingY: 'clamp(3.5rem, 7vw, 6rem)',
} as const;
