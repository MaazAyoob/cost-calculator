// ==============================================================================
// Hutty Pricing Model V1 Configuration & Default Data
// Strict price authority: FREE = ₹0, ₹99 = 9900 paise, ₹499 = 49900 paise.
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
    name: 'Bank-Ready PDF Dossier',
    description: 'Complete high-resolution official document ready for contractor tenders and home loan approval.',
    category: 'Execution',
  },
  REPORT_DOWNLOAD: {
    name: 'Instant PDF Export',
    description: 'Unlimited high-speed client-side and server-rendered PDF downloads.',
    category: 'Execution',
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
    name: 'Free Estimate',
    description: 'Instant preliminary cost range, total built-up area (BUA) and high-level material requirements.',
    priceMinorUnits: 0,
    currency: 'INR',
    active: true,
    purchasable: false,
    sortOrder: 1,
    badge: null,
    features: [
      'BASIC_PROJECT_SUMMARY',
      'BASIC_COST_SUMMARY',
    ],
  },
  {
    id: 'tier-estimate-99',
    code: 'ESTIMATE_99',
    name: '₹99 Verified Estimate',
    description: 'Save customized plot configuration, capture contact details, and lock in preliminary trade estimates.',
    priceMinorUnits: 9900,
    currency: 'INR',
    active: true,
    purchasable: true,
    sortOrder: 2,
    badge: 'Popular',
    features: [
      'BASIC_PROJECT_SUMMARY',
      'BASIC_COST_SUMMARY',
      'LEAD_CAPTURE',
      'SAVED_PROJECT',
    ],
  },
  {
    id: 'tier-detailed-estimate-499',
    code: 'DETAILED_ESTIMATE_499',
    name: '₹499 Detailed Construction Dossier',
    description: 'Bank-ready detailed construction dossier: itemized Works BOQ, physical steel/cement consumption schedules, installed fixtures, labour wages, and downloadable official PDF.',
    priceMinorUnits: 49900,
    currency: 'INR',
    active: true,
    purchasable: true,
    sortOrder: 3,
    badge: 'Recommended',
    features: [
      'BASIC_PROJECT_SUMMARY',
      'BASIC_COST_SUMMARY',
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
    id: 'tier-complete-package',
    code: 'COMPLETE_PACKAGE',
    name: 'Complete Construction Package',
    description: 'Turnkey architectural drawing set, structural engineering vetting, site supervision protocol and full contractor audit suite.',
    priceMinorUnits: 0, // Unfinalized by business
    currency: 'INR',
    active: false,
    purchasable: false, // Strictly unpurchasable until admin configures price > 0
    sortOrder: 4,
    badge: 'Coming Soon',
    features: [
      'COMPLETE_PACKAGE_FEATURES',
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
