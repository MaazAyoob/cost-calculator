// ==============================================================================
// Hutty Pricing Model V1 Configuration & Default Data
// Strict price authority: FREE = ₹0, ₹499 = 49900 paise, ₹1,499 = 149900 paise.
// COMPLETE PACKAGE = unfinalized / non-purchasable until Admin configures.
// Consultation = separate ₹1,499 service.
// ==============================================================================

import { PricingFeatureCode, PricingTier } from '../types/pricing';

export const FEATURE_METADATA: Record<
  PricingFeatureCode,
  { name: string; description: string; category: 'General' | 'Estimation' | 'Commercial' | 'Execution' }
> = {
  BASIC_PROJECT_SUMMARY: {
    name: 'Basic Project Summary',
    description: 'High-level plot dimensions, footprint, and total built-up area (BUA) calculations.',
    category: 'General',
  },
  BASIC_COST_SUMMARY: {
    name: 'Preliminary Cost Indication',
    description: 'Estimated total construction range with basic cost-per-sqft indicators.',
    category: 'Estimation',
  },
  BASIC_PDF_DOWNLOAD: {
    name: 'Basic Estimate PDF Export',
    description: 'Concise summary of your current estimate in downloadable PDF format.',
    category: 'Execution',
  },
  LEAD_CAPTURE: {
    name: 'Verified Contact Registration',
    description: 'Save customized project profile and receive verified construction updates.',
    category: 'General',
  },
  SAVED_PROJECT: {
    name: 'Save & Resume Projects',
    description: 'Multi-device cloud access to your saved floor configurations and room requirements.',
    category: 'General',
  },
  PROJECT_HISTORY: {
    name: 'Versioned Revision History',
    description: 'Inspect past calculation revisions and compare structural specification adjustments.',
    category: 'General',
  },
  ADVANCED_PROJECT_DETAILS: {
    name: 'Detailed House Snapshot',
    description: 'Floor-by-floor structural breakdown, wall cladding schedules, and parking geometry.',
    category: 'Estimation',
  },
  DETAILED_QUANTITIES: {
    name: 'Itemized Physical Quantities',
    description: 'Concrete volumes (m³), steel tonnage (T), cement bags, masonry block counts, and sand (CFT).',
    category: 'Estimation',
  },
  DETAILED_BOQ: {
    name: 'Section A — Works BOQ',
    description: 'Itemized civil, structural, finishing and joinery line items with trade-standard descriptions.',
    category: 'Commercial',
  },
  MATERIAL_SCHEDULE: {
    name: 'Section B — Material Takeoff Schedule',
    description: 'Physical consumption matrices with active Bangalore market rates and wastage factors.',
    category: 'Commercial',
  },
  FIXTURES_SCHEDULE: {
    name: 'Section C — Installed Fixtures Schedule',
    description: 'Granular takeoff for doors, windows, sanitaryware sets, and concealed CPVC plumbing runs.',
    category: 'Commercial',
  },
  LABOUR_BREAKDOWN: {
    name: 'Labour & Wage Breakdown',
    description: 'Mason, bar-bender, carpenter, and helper man-day allocations with local daily wage rates.',
    category: 'Commercial',
  },
  DETAILED_COST_BREAKDOWN: {
    name: 'Section D — Commercial Breakdown',
    description: 'Contractor profit margins, architectural fees, contingency reserves, and GST tax schedule.',
    category: 'Commercial',
  },
  FULL_PDF_REPORT: {
    name: 'Detailed Construction Cost Report (PDF)',
    description: 'Complete high-resolution official cost report you can discuss with your contractor or bank.',
    category: 'Execution',
  },
  REPORT_DOWNLOAD: {
    name: 'Instant PDF Export',
    description: 'Unlimited high-speed client-side and server-rendered PDF downloads.',
    category: 'Execution',
  },
  PREMIUM_COMPARISON: {
    name: 'Multi-Scenario Project Comparison',
    description: 'Compare multiple floorplan configurations, area variants, and finish options side by side.',
    category: 'General',
  },
  PREMIUM_SPEC_CUSTOMIZATION: {
    name: 'Premium Specification Customizer',
    description: 'Granular brand choices, fixture models, and tailored luxury trade specifications.',
    category: 'Commercial',
  },
  COMPLETE_PACKAGE_FEATURES: {
    name: 'Full Turnkey Suite',
    description: 'Turnkey architectural blueprint set, structural design vetting, BOQ governance & site audits.',
    category: 'Execution',
  },
};

export const DEFAULT_PRICING_TIERS: PricingTier[] = [
  {
    id: 'tier-free',
    code: 'FREE',
    name: 'Calculator — Free',
    description: 'Explore your house plan and see a basic estimate. No credit card required.',
    priceMinorUnits: 0,
    currency: 'INR',
    active: true,
    purchasable: false,
    sortOrder: 1,
    badge: null,
    isCalculatorPlan: true,
    category: 'CALCULATOR_PLAN',
    features: [
      'BASIC_PROJECT_SUMMARY',
      'BASIC_COST_SUMMARY',
    ],
  },
  {
    id: 'tier-detailed-estimate-499',
    code: 'DETAILED_ESTIMATE_499',
    name: 'Calculator — Detailed BOQ',
    description: 'Get a detailed report showing the work, materials, and estimated costs for your house, with downloadable PDF.',
    priceMinorUnits: 49900,
    currency: 'INR',
    active: true,
    purchasable: true,
    sortOrder: 2,
    badge: 'Popular',
    isCalculatorPlan: true,
    category: 'CALCULATOR_PLAN',
    features: [
      'BASIC_PROJECT_SUMMARY',
      'BASIC_COST_SUMMARY',
      'BASIC_PDF_DOWNLOAD',
      'LEAD_CAPTURE',
      'SAVED_PROJECT',
      'ADVANCED_PROJECT_DETAILS',
      'DETAILED_QUANTITIES',
      'DETAILED_BOQ',
      'MATERIAL_SCHEDULE',
      'FIXTURES_SCHEDULE',
      'LABOUR_BREAKDOWN',
      'DETAILED_COST_BREAKDOWN',
      'FULL_PDF_REPORT',
      'REPORT_DOWNLOAD',
    ],
  },
  {
    id: 'tier-premium-1499',
    code: 'PREMIUM_1499',
    name: 'Calculator — Premium',
    description: 'An upgraded calculator package with multi-scenario comparison, premium specifications, and full export suite. (Note: Consultation with an expert is a separate service).',
    priceMinorUnits: 149900,
    currency: 'INR',
    active: true,
    purchasable: true,
    sortOrder: 3,
    badge: 'Comprehensive',
    isCalculatorPlan: true,
    category: 'CALCULATOR_PLAN',
    features: [
      'BASIC_PROJECT_SUMMARY',
      'BASIC_COST_SUMMARY',
      'BASIC_PDF_DOWNLOAD',
      'LEAD_CAPTURE',
      'SAVED_PROJECT',
      'PROJECT_HISTORY',
      'ADVANCED_PROJECT_DETAILS',
      'DETAILED_QUANTITIES',
      'DETAILED_BOQ',
      'MATERIAL_SCHEDULE',
      'FIXTURES_SCHEDULE',
      'LABOUR_BREAKDOWN',
      'DETAILED_COST_BREAKDOWN',
      'FULL_PDF_REPORT',
      'REPORT_DOWNLOAD',
      'PREMIUM_COMPARISON',
      'PREMIUM_SPEC_CUSTOMIZATION',
    ],
  },
  {
    id: 'tier-basic-pdf-99',
    code: 'BASIC_ESTIMATE_PDF',
    name: 'Basic Estimate PDF',
    description: 'A concise summary of your current estimate in downloadable PDF format.',
    priceMinorUnits: 9900,
    currency: 'INR',
    active: true,
    purchasable: true,
    sortOrder: 4,
    badge: null,
    isCalculatorPlan: false,
    category: 'ADDON_PRODUCT',
    features: [
      'BASIC_PROJECT_SUMMARY',
      'BASIC_COST_SUMMARY',
      'BASIC_PDF_DOWNLOAD',
    ],
  },
  {
    id: 'tier-estimate-99',
    code: 'ESTIMATE_99',
    name: '₹99 Verified Estimate (Historical)',
    description: 'Historical tier preserved for legacy transaction integrity.',
    priceMinorUnits: 9900,
    currency: 'INR',
    active: false,
    purchasable: false,
    sortOrder: 99,
    badge: null,
    isCalculatorPlan: false,
    category: 'ADDON_PRODUCT',
    features: [
      'BASIC_PROJECT_SUMMARY',
      'BASIC_COST_SUMMARY',
      'BASIC_PDF_DOWNLOAD',
      'LEAD_CAPTURE',
      'SAVED_PROJECT',
    ],
  },
];

/**
 * Format integer minor units (paise) to Indian Rupee display (e.g., 9900 -> "₹99", 0 -> "Free")
 */
export function formatPaiseToINR(paise: number, showFreeForZero: boolean = true): string {
  if (paise === 0 && showFreeForZero) return 'Free';
  const inr = Math.floor(paise / 100);
  return `₹${inr.toLocaleString('en-IN')}`;
}
