// ============================================================
// Cost Calculator — Design System Tokens
// Light Mode is PRIMARY. Dark Mode is secondary.
// ============================================================

export const DESIGN_TOKENS = {
  // ----------------------------------------------------------
  // LIGHT THEME (Primary — design reference)
  // Inspired by: Apple, Stripe, Linear (Light), Framer, Notion
  // ----------------------------------------------------------
  light: {
    colors: {
      background:     '#FAFAF8',
      surface:        '#FFFFFF',
      surfaceMuted:   '#F4F4F0',
      textPrimary:    '#111827',
      textSecondary:  '#6B7280',
      textDisabled:   '#9CA3AF',
      brandPrimary:   '#0F766E',
      brandLight:     '#CCFBF1',
      accent:         '#C6A75E',
      accentLight:    '#FEF3C7',
      success:        '#16A34A',
      successLight:   '#DCFCE7',
      warning:        '#F59E0B',
      warningLight:   '#FEF3C7',
      error:          '#DC2626',
      errorLight:     '#FEE2E2',
      border:         '#E5E7EB',
      borderStrong:   '#D1D5DB',
      overlay:        'rgba(17,24,39,0.40)',
    },
    radii: {
      card:    '16px',
      button:  '12px',
      input:   '12px',
      modal:   '20px',
      sheet:   '24px',
      pill:    '9999px',
    },
    shadows: {
      xs:    '0 1px 2px 0 rgba(17,24,39,0.04)',
      sm:    '0 2px 6px 0 rgba(17,24,39,0.06), 0 1px 2px -1px rgba(17,24,39,0.04)',
      md:    '0 4px 12px -2px rgba(17,24,39,0.08), 0 2px 4px -2px rgba(17,24,39,0.04)',
      lg:    '0 12px 24px -4px rgba(17,24,39,0.10), 0 4px 8px -2px rgba(17,24,39,0.04)',
      xl:    '0 20px 40px -8px rgba(17,24,39,0.12), 0 8px 16px -4px rgba(17,24,39,0.06)',
      brand: '0 8px 24px -4px rgba(15,118,110,0.30)',
      accent:'0 8px 24px -4px rgba(198,167,94,0.25)',
      glass: '0 4px 16px rgba(255,255,255,0.60), inset 0 1px 0 rgba(255,255,255,0.80)',
    },
  },

  // ----------------------------------------------------------
  // DARK THEME (Secondary)
  // ----------------------------------------------------------
  dark: {
    colors: {
      background:     '#0F172A',
      surface:        '#111827',
      surfaceMuted:   '#1E293B',
      textPrimary:    '#F8FAFC',
      textSecondary:  '#94A3B8',
      textDisabled:   '#64748B',
      brandPrimary:   '#14B8A6',
      brandLight:     '#134E4A',
      accent:         '#D4A847',
      accentLight:    '#44381A',
      success:        '#22C55E',
      successLight:   '#14532D',
      warning:        '#F59E0B',
      warningLight:   '#451A03',
      error:          '#EF4444',
      errorLight:     '#450A0A',
      border:         '#1F2937',
      borderStrong:   '#374151',
      overlay:        'rgba(0,0,0,0.60)',
    },
    radii: {
      card:    '16px',
      button:  '12px',
      input:   '12px',
      modal:   '20px',
      sheet:   '24px',
      pill:    '9999px',
    },
    shadows: {
      xs:    '0 1px 2px 0 rgba(0,0,0,0.30)',
      sm:    '0 2px 6px 0 rgba(0,0,0,0.40)',
      md:    '0 4px 12px -2px rgba(0,0,0,0.50)',
      lg:    '0 12px 24px -4px rgba(0,0,0,0.60)',
      xl:    '0 20px 40px -8px rgba(0,0,0,0.70)',
      brand: '0 8px 24px -4px rgba(20,184,166,0.25)',
      accent:'0 8px 24px -4px rgba(212,168,71,0.20)',
      glass: '0 4px 16px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.05)',
    },
  },

  // ----------------------------------------------------------
  // SHARED
  // ----------------------------------------------------------
  spacing: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
  breakpoints: {
    sm:    360,
    md:    768,
    lg:    1024,
    xl:    1280,
    '2xl': 1440,
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    scale: {
      '5xl':  { size: '3rem',     lh: '1.10', weight: 900, ls: '-0.03em' },
      '4xl':  { size: '2.25rem',  lh: '1.12', weight: 800, ls: '-0.025em' },
      '3xl':  { size: '1.875rem', lh: '1.20', weight: 700, ls: '-0.02em' },
      '2xl':  { size: '1.5rem',   lh: '1.30', weight: 700, ls: '-0.015em' },
      'xl':   { size: '1.25rem',  lh: '1.40', weight: 600, ls: '-0.01em' },
      'lg':   { size: '1.125rem', lh: '1.50', weight: 500, ls: '0' },
      'base': { size: '1rem',     lh: '1.60', weight: 400, ls: '0' },
      'sm':   { size: '0.875rem', lh: '1.50', weight: 400, ls: '0' },
      'xs':   { size: '0.75rem',  lh: '1.40', weight: 400, ls: '0' },
    },
  },
} as const;

export const APP_CONFIG = {
  name:     'Cost Calculator',
  subtitle: 'Home Construction Planning Platform',
  tagline:  "India's Premier Architecture & Construction Cost Intelligence Engine",
  version:  '2.0.0',
} as const;

export type Theme = 'light' | 'dark';
