// ============================================================
// Hutty — Design System Tokens
// Primary Green: #1B3D34 | Roof Accent: #F28C28
// ============================================================

export type Theme = 'light' | 'dark';

export const DESIGN_TOKENS = {
  colors: {
    background:    '#F8F8F6',
    surface:       '#FFFFFF',
    surfaceMuted:  'rgba(27, 61, 52, 0.04)',
    textPrimary:   '#1B3D34',
    textSecondary: '#4B5563',
    textDisabled:  '#9CA3AF',
    brandPrimary:  '#1B3D34',
    brandHover:    '#132C25',
    brandSoft:     'rgba(27, 61, 52, 0.08)',
    brandLight:    'rgba(27, 61, 52, 0.04)',
    accent:        '#F28C28',
    accentHover:   '#D9771A',
    accentSoft:    'rgba(242, 140, 40, 0.10)',
    border:        '#E5E7EB',
    borderStrong:  '#D1D5DB',
    overlay:       'rgba(27, 61, 52, 0.40)',
  },
  radii: {
    panel:  '18px',
    card:   '14px',
    button: '10px',
    input:  '10px',
    badge:  '8px',
    pill:   '9999px',
  },
  shadows: {
    xs:    '0 1px 2px 0 rgba(27, 61, 52, 0.03)',
    sm:    '0 1px 3px 0 rgba(27, 61, 52, 0.05), 0 1px 2px -1px rgba(27, 61, 52, 0.03)',
    md:    '0 4px 10px -2px rgba(27, 61, 52, 0.06), 0 2px 4px -2px rgba(27, 61, 52, 0.03)',
    lg:    '0 10px 22px -4px rgba(27, 61, 52, 0.08), 0 4px 6px -2px rgba(27, 61, 52, 0.03)',
    brand: '0 4px 14px 0 rgba(27, 61, 52, 0.20)',
  },
  breakpoints: {
    sm:    360,
    md:    768,
    lg:    1024,
    xl:    1280,
    '2xl': 1440,
  },
} as const;

export const APP_CONFIG = {
  name:     'Hutty',
  fullName: 'Hutty',
  subtitle: 'Home Construction Planning Platform',
  tagline:  'Build your home with clarity.',
  version:  '2.0.0',
} as const;
