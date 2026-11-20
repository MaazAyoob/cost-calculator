// ==============================================================================
// Hutty Pricing Model V1 Constants
// Canonical price authority in integer minor units (paise).
// Consultation (₹1,499) is strictly decoupled and governed separately.
// Complete Package price is intentionally NOT finalized.
// ==============================================================================

export const PRICING_TIER_CODES = {
  FREE: 'FREE',
  BASIC_ESTIMATE_PDF: 'BASIC_ESTIMATE_PDF',
  DETAILED_ESTIMATE_499: 'DETAILED_ESTIMATE_499', // Canonical paid report code (retained for database/entitlement schema compatibility, priced at ₹199)
  COMPLETE_REPORT_199: 'COMPLETE_REPORT_199',     // Modern canonical code alias
  PREMIUM_1499: 'PREMIUM_1499',
  ESTIMATE_99: 'ESTIMATE_99', // Historical legacy code alias
  COMPLETE_PACKAGE: 'COMPLETE_PACKAGE',
} as const;

export type PricingTierCode = typeof PRICING_TIER_CODES[keyof typeof PRICING_TIER_CODES];

export const PRICING_MINOR_UNITS = {
  FREE: 0,                         // ₹0 Free
  BASIC_ESTIMATE_PDF: 9900,        // ₹99.00 Basic Estimate PDF (Historical)
  DETAILED_ESTIMATE_499: 19900,    // ₹199.00 Complete Construction Planning & Estimation Report (19,900 paise)
  COMPLETE_REPORT_199: 19900,      // ₹199.00 Complete Construction Planning & Estimation Report (19,900 paise)
  PREMIUM_1499: 149900,            // ₹1,499.00 Historical Package (Consultation is decoupled at ₹1,499)
  ESTIMATE_99: 9900,               // ₹99.00 alias for Basic Estimate PDF (Historical)
  COMPLETE_PACKAGE: 0,
} as const;

export const PRICING_CURRENCY = 'INR';

export const PRICING_FEATURES = {
  BASIC_PROJECT_SUMMARY: 'BASIC_PROJECT_SUMMARY',
  BASIC_COST_SUMMARY: 'BASIC_COST_SUMMARY',
  BASIC_PDF_DOWNLOAD: 'BASIC_PDF_DOWNLOAD',
  LEAD_CAPTURE: 'LEAD_CAPTURE',
  SAVED_PROJECT: 'SAVED_PROJECT',
  PROJECT_HISTORY: 'PROJECT_HISTORY',
  ADVANCED_PROJECT_DETAILS: 'ADVANCED_PROJECT_DETAILS',
  DETAILED_QUANTITIES: 'DETAILED_QUANTITIES',
  DETAILED_BOQ: 'DETAILED_BOQ',
  MATERIAL_SCHEDULE: 'MATERIAL_SCHEDULE',
  FIXTURES_SCHEDULE: 'FIXTURES_SCHEDULE',
  LABOUR_BREAKDOWN: 'LABOUR_BREAKDOWN',
  DETAILED_COST_BREAKDOWN: 'DETAILED_COST_BREAKDOWN',
  FULL_PDF_REPORT: 'FULL_PDF_REPORT',
  REPORT_DOWNLOAD: 'REPORT_DOWNLOAD',
  PREMIUM_COMPARISON: 'PREMIUM_COMPARISON',
  PREMIUM_SPEC_CUSTOMIZATION: 'PREMIUM_SPEC_CUSTOMIZATION',
  COMPLETE_PACKAGE_FEATURES: 'COMPLETE_PACKAGE_FEATURES',
} as const;

export type PricingFeatureCode = typeof PRICING_FEATURES[keyof typeof PRICING_FEATURES];

export interface InitialPricingTierSeed {
  code: PricingTierCode;
  name: string;
  description: string;
  priceMinorUnits: number;
  currency: string;
  active: boolean;
  purchasable: boolean;
  sortOrder: number;
  badge: string | null;
  features: string[];
}

export const INITIAL_PRICING_TIERS: InitialPricingTierSeed[] = [
  {
    code: PRICING_TIER_CODES.FREE,
    name: 'Calculator — Free',
    description: 'Explore your house plan and see a basic estimate. No credit card required.',
    priceMinorUnits: PRICING_MINOR_UNITS.FREE,
    currency: PRICING_CURRENCY,
    active: true,
    purchasable: false, // Free tier does not require checkout
    sortOrder: 1,
    badge: null,
    features: [
      PRICING_FEATURES.BASIC_PROJECT_SUMMARY,
      PRICING_FEATURES.BASIC_COST_SUMMARY,
    ],
  },
  {
    code: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
    name: 'Basic Estimate PDF (Historical)',
    description: 'Historical summary tier. Superseded by the Complete Construction Planning & Estimation Report.',
    priceMinorUnits: PRICING_MINOR_UNITS.BASIC_ESTIMATE_PDF,
    currency: PRICING_CURRENCY,
    active: true,
    purchasable: true,
    sortOrder: 2,
    badge: null,
    features: [
      PRICING_FEATURES.BASIC_PROJECT_SUMMARY,
      PRICING_FEATURES.BASIC_COST_SUMMARY,
      PRICING_FEATURES.BASIC_PDF_DOWNLOAD,
    ],
  },
  {
    code: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
    name: 'Complete Construction Planning & Estimation Report',
    description: 'Comprehensive construction planning dossier including site setback analysis, detailed works BOQ, physical material takeoff, milestone payment schedule, and contractor quotation audit with downloadable PDF.',
    priceMinorUnits: PRICING_MINOR_UNITS.DETAILED_ESTIMATE_499,
    currency: PRICING_CURRENCY,
    active: true,
    purchasable: true,
    sortOrder: 3,
    badge: 'Popular',
    features: [
      PRICING_FEATURES.BASIC_PROJECT_SUMMARY,
      PRICING_FEATURES.BASIC_COST_SUMMARY,
      PRICING_FEATURES.BASIC_PDF_DOWNLOAD,
      PRICING_FEATURES.LEAD_CAPTURE,
      PRICING_FEATURES.SAVED_PROJECT,
      PRICING_FEATURES.ADVANCED_PROJECT_DETAILS,
      PRICING_FEATURES.DETAILED_QUANTITIES,
      PRICING_FEATURES.DETAILED_BOQ,
      PRICING_FEATURES.MATERIAL_SCHEDULE,
      PRICING_FEATURES.FIXTURES_SCHEDULE,
      PRICING_FEATURES.LABOUR_BREAKDOWN,
      PRICING_FEATURES.DETAILED_COST_BREAKDOWN,
      PRICING_FEATURES.FULL_PDF_REPORT,
      PRICING_FEATURES.REPORT_DOWNLOAD,
    ],
  },
  {
    code: PRICING_TIER_CODES.COMPLETE_REPORT_199,
    name: 'Complete Construction Planning & Estimation Report',
    description: 'Comprehensive construction planning dossier including site setback analysis, detailed works BOQ, physical material takeoff, milestone payment schedule, and contractor quotation audit with downloadable PDF.',
    priceMinorUnits: PRICING_MINOR_UNITS.COMPLETE_REPORT_199,
    currency: PRICING_CURRENCY,
    active: true,
    purchasable: true,
    sortOrder: 3,
    badge: 'Popular',
    features: [
      PRICING_FEATURES.BASIC_PROJECT_SUMMARY,
      PRICING_FEATURES.BASIC_COST_SUMMARY,
      PRICING_FEATURES.BASIC_PDF_DOWNLOAD,
      PRICING_FEATURES.LEAD_CAPTURE,
      PRICING_FEATURES.SAVED_PROJECT,
      PRICING_FEATURES.ADVANCED_PROJECT_DETAILS,
      PRICING_FEATURES.DETAILED_QUANTITIES,
      PRICING_FEATURES.DETAILED_BOQ,
      PRICING_FEATURES.MATERIAL_SCHEDULE,
      PRICING_FEATURES.FIXTURES_SCHEDULE,
      PRICING_FEATURES.LABOUR_BREAKDOWN,
      PRICING_FEATURES.DETAILED_COST_BREAKDOWN,
      PRICING_FEATURES.FULL_PDF_REPORT,
      PRICING_FEATURES.REPORT_DOWNLOAD,
      PRICING_FEATURES.PREMIUM_COMPARISON,
      PRICING_FEATURES.PREMIUM_SPEC_CUSTOMIZATION,
    ],
  },
  {
    code: PRICING_TIER_CODES.PREMIUM_1499,
    name: 'Calculator — Premium (Historical)',
    description: 'Historical package preserved for backward compatibility. (Note: Consultation with an expert is a separate service at ₹1,499).',
    priceMinorUnits: PRICING_MINOR_UNITS.PREMIUM_1499,
    currency: PRICING_CURRENCY,
    active: true,
    purchasable: true,
    sortOrder: 4,
    badge: 'Comprehensive',
    features: [
      PRICING_FEATURES.BASIC_PROJECT_SUMMARY,
      PRICING_FEATURES.BASIC_COST_SUMMARY,
      PRICING_FEATURES.BASIC_PDF_DOWNLOAD,
      PRICING_FEATURES.LEAD_CAPTURE,
      PRICING_FEATURES.SAVED_PROJECT,
      PRICING_FEATURES.PROJECT_HISTORY,
      PRICING_FEATURES.ADVANCED_PROJECT_DETAILS,
      PRICING_FEATURES.DETAILED_QUANTITIES,
      PRICING_FEATURES.DETAILED_BOQ,
      PRICING_FEATURES.MATERIAL_SCHEDULE,
      PRICING_FEATURES.FIXTURES_SCHEDULE,
      PRICING_FEATURES.LABOUR_BREAKDOWN,
      PRICING_FEATURES.DETAILED_COST_BREAKDOWN,
      PRICING_FEATURES.FULL_PDF_REPORT,
      PRICING_FEATURES.REPORT_DOWNLOAD,
      PRICING_FEATURES.PREMIUM_COMPARISON,
      PRICING_FEATURES.PREMIUM_SPEC_CUSTOMIZATION,
    ],
  },
  {
    code: PRICING_TIER_CODES.ESTIMATE_99,
    name: '₹99 Verified Estimate (Historical)',
    description: 'Historical tier preserved for legacy transaction integrity.',
    priceMinorUnits: PRICING_MINOR_UNITS.ESTIMATE_99,
    currency: PRICING_CURRENCY,
    active: false,
    purchasable: false,
    sortOrder: 99,
    badge: null,
    features: [
      PRICING_FEATURES.BASIC_PROJECT_SUMMARY,
      PRICING_FEATURES.BASIC_COST_SUMMARY,
      PRICING_FEATURES.BASIC_PDF_DOWNLOAD,
      PRICING_FEATURES.LEAD_CAPTURE,
      PRICING_FEATURES.SAVED_PROJECT,
    ],
  },
];
