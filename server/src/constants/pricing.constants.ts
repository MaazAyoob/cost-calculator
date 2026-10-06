// ==============================================================================
// Hutty Pricing Model V1 Constants
// Canonical price authority in integer minor units (paise).
// Consultation (₹1,499) is strictly decoupled and governed separately.
// Complete Package price is intentionally NOT finalized.
// ==============================================================================

export const PRICING_TIER_CODES = {
  FREE: 'FREE',
  ESTIMATE_99: 'ESTIMATE_99',
  DETAILED_ESTIMATE_499: 'DETAILED_ESTIMATE_499',
  COMPLETE_PACKAGE: 'COMPLETE_PACKAGE',
} as const;

export type PricingTierCode = typeof PRICING_TIER_CODES[keyof typeof PRICING_TIER_CODES];

export const PRICING_MINOR_UNITS = {
  FREE: 0,
  ESTIMATE_99: 9900,               // ₹99.00
  DETAILED_ESTIMATE_499: 49900,    // ₹499.00
  COMPLETE_PACKAGE: 0,            // Unfinalized, requires Admin configuration
} as const;

export const PRICING_CURRENCY = 'INR';

export const PRICING_FEATURES = {
  BASIC_PROJECT_SUMMARY: 'BASIC_PROJECT_SUMMARY',
  BASIC_COST_SUMMARY: 'BASIC_COST_SUMMARY',
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
    name: 'Free Estimate',
    description: 'Instant preliminary cost range, total built-up area (BUA) and high-level material requirements.',
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
    code: PRICING_TIER_CODES.ESTIMATE_99,
    name: '₹99 Verified Estimate',
    description: 'Save your customized plot configuration, capture verified contact details, and lock in preliminary trade estimates.',
    priceMinorUnits: PRICING_MINOR_UNITS.ESTIMATE_99,
    currency: PRICING_CURRENCY,
    active: true,
    purchasable: true,
    sortOrder: 2,
    badge: 'Popular',
    features: [
      PRICING_FEATURES.BASIC_PROJECT_SUMMARY,
      PRICING_FEATURES.BASIC_COST_SUMMARY,
      PRICING_FEATURES.LEAD_CAPTURE,
      PRICING_FEATURES.SAVED_PROJECT,
    ],
  },
  {
    code: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
    name: '₹499 Detailed Construction Dossier',
    description: 'Full bank-ready quantity surveyor report: itemized Works BOQ, physical steel/cement consumption schedules, installed fixtures, labour wages, and downloadable official PDF.',
    priceMinorUnits: PRICING_MINOR_UNITS.DETAILED_ESTIMATE_499,
    currency: PRICING_CURRENCY,
    active: true,
    purchasable: true,
    sortOrder: 3,
    badge: 'Recommended',
    features: [
      PRICING_FEATURES.BASIC_PROJECT_SUMMARY,
      PRICING_FEATURES.BASIC_COST_SUMMARY,
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
    code: PRICING_TIER_CODES.COMPLETE_PACKAGE,
    name: 'Complete Construction Package',
    description: 'Turnkey architectural drawing set, structural engineering vetting, site supervision protocol and full contractor audit suite.',
    priceMinorUnits: PRICING_MINOR_UNITS.COMPLETE_PACKAGE,
    currency: PRICING_CURRENCY,
    active: false,
    purchasable: false, // Strict safety: unpurchasable until admin configures price > 0
    sortOrder: 4,
    badge: 'Coming Soon',
    features: [
      PRICING_FEATURES.COMPLETE_PACKAGE_FEATURES,
    ],
  },
];
