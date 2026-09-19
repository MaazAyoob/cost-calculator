// ============================================================
// CONFIGURATION CONFLICT REGISTRY
// Authoritative tracker for parameters where existing code, pilot
// specifications, or meeting minutes have conflicting values.
// Preserves current effective behaviour while flagging for business sign-off.
// ============================================================

import { ParameterConflict } from './types';

export const CONFIGURATION_CONFLICT_REGISTRY: Record<string, ParameterConflict> = {
  INTERIOR_PAINT_COVERAGE: {
    parameterKey: 'config.paint.interior_coverage_sqft_per_litre',
    parameterName: 'Interior Emulsion Paint Coverage (2-Coats)',
    currentSource: 'paint.ts line 65 (Math.ceil(interiorPaintAreaSqFt / 45))',
    conflictingSource: 'Hutty Pilot Spec Section 17 & Launch Readiness Spec (60 sqft/L benchmark)',
    currentEffectiveValue: 45,
    alternateValue: 60,
    unit: 'sqft/Litre',
    reason: 'paint.ts divides by 45 sqft/L yielding higher paint consumption, whereas standard architectural guidelines cite 60 sqft/L for 2 coats over primer and putty. Current effective engine behaviour (45 sqft/L) is preserved.',
    status: 'CONFLICT_REQUIRES_REVIEW',
    resolutionNote: 'Keep 45 sqft/L active in production calculation engine until management sign-off.',
  },

  CONTRACTOR_MARGIN_BASELINE: {
    parameterKey: 'config.commercial.contractor_margin',
    parameterName: 'Contractor Overhead & Execution Margin',
    currentSource: 'HUTTY_BASELINE_CONFIG in rateMasterDefaults.ts (0.15 / 15%)',
    conflictingSource: 'Minutes of Meeting (Sept 19, 2026) & budget.ts L116 (0.10 / 10% default)',
    currentEffectiveValue: 0.15,
    alternateValue: 0.10,
    unit: 'ratio',
    reason: 'rateMasterDefaults.ts config specifies 15% contractor margin, while contractor mode in budget.ts defaults to 10% (8-10% range per meeting minutes). Engine preserves mode-specific evaluation (10% when contractor mode selected; 0% in self-build).',
    status: 'CONFLICT_REQUIRES_REVIEW',
    resolutionNote: 'Preserve independent mode = 0% and contractor mode default = 10% with baseline config fallback = 15%.',
  },

  SUMP_WATERPROOFING_SURFACE: {
    parameterKey: 'config.waterproofing.sump_surface_sqft',
    parameterName: 'Underground Sump Waterproofing Surface Allowance',
    currentSource: 'coefficients.ts SUMP_WATERPROOFING_SQFT (120 sqft)',
    conflictingSource: 'Water Tank Volume formula (NBC 2016 5000L tank internal surface ~180 sqft)',
    currentEffectiveValue: 120,
    alternateValue: 180,
    unit: 'sq.ft',
    reason: 'Fixed 120 sqft allowance is used in flooring.ts L82 for all project sizes regardless of tank volume.',
    status: 'CONFLICT_REQUIRES_REVIEW',
    resolutionNote: 'Preserve 120 sqft effective value in baseline config.',
  },

  CIRCULATION_ALLOWANCE: {
    parameterKey: 'config.flooring.circulation_allowance_pct',
    parameterName: 'Livable Circulation Area Allowance',
    currentSource: 'flooring.ts L54 (Math.round(bua * 0.10))',
    conflictingSource: 'Space Model Circulation (Passages, Foyer, Stairs ~12-15%)',
    currentEffectiveValue: 10,
    alternateValue: 14,
    unit: '%',
    reason: 'flooring.ts uses a hardcoded 10% circulation multiplier on total BUA to compute gross livable tile area.',
    status: 'CONFLICT_REQUIRES_REVIEW',
    resolutionNote: 'Preserve 10% effective value in baseline config.',
  },

  GRANITE_SLABS_PER_FLIGHT: {
    parameterKey: 'config.flooring.staircase_granite_sqft_flight',
    parameterName: 'Staircase Granite Slab Area Allowance per Flight',
    currentSource: 'flooring.ts L74 (staircaseFlights * 180 sqft)',
    conflictingSource: 'Architectural Flight Takeoff (16 risers × 3.5ft width × 1.2ft tread/riser ~135 sqft + landing 40 sqft = 175 sqft)',
    currentEffectiveValue: 180,
    alternateValue: 175,
    unit: 'sq.ft/flight',
    reason: 'flooring.ts rounds each staircase flight to exactly 180 sqft of granite.',
    status: 'CONFLICT_REQUIRES_REVIEW',
    resolutionNote: 'Preserve 180 sq.ft per flight in baseline config.',
  },
};

/** Get all unresolved conflicts requiring business review */
export function getActiveConflicts(): ParameterConflict[] {
  return Object.values(CONFIGURATION_CONFLICT_REGISTRY).filter(
    (c) => c.status === 'CONFLICT_REQUIRES_REVIEW'
  );
}
