// ==============================================================================
// Hutty Consultation Constants (Phase 1 MVP)
// Single source of truth for launch consultation pricing & categories
// ==============================================================================

/**
 * Single fixed consultation price for launch phase: ₹1,499.
 * Backend is the strict source of truth for payable amounts.
 */
export const CONSULTATION_PRICE_INR = 1499;

/**
 * Payable minor units for INR (paise): 149900 paise.
 */
export const CONSULTATION_PRICE_PAISE = 149900;

export const CONSULTATION_CURRENCY = 'INR';

export const CONSULTATION_CATEGORIES = [
  'Architect',
  'Structural Engineer',
  'Contractor',
  'Interior Designer',
  'Approvals Consultant',
  'Quantity Surveyor',
  'Site Supervisor',
] as const;

export type ConsultationCategory = (typeof CONSULTATION_CATEGORIES)[number];

export const CONSULTATION_TOPICS = [
  'Plan & Layout Review',
  'Structural Safety & Feasibility',
  'Cost & BOQ Verification',
  'Contractor Quotation Audit',
  'Municipal Approvals & Bylaws',
  'Interior & Finish Consultation',
  'Site Quality & Progress Inspection',
  'General Construction Guidance',
] as const;

export const PROJECT_TYPES = [
  'Independent Villa / House',
  'Duplex / Triplex Residence',
  'Row House / Townhouse',
  'Residential Apartment Unit',
  'Mixed-Use Residential + Commercial',
  'Renovation / Floor Addition',
] as const;

export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  AWAITING_REVIEW: ['UNDER_REVIEW', 'ASSIGNED', 'CANCELLED', 'REJECTED'],
  UNDER_REVIEW: ['ASSIGNED', 'REJECTED', 'CANCELLED'],
  ASSIGNED: ['ACCEPTED', 'SCHEDULED', 'RESCHEDULE_REQUESTED', 'CANCELLED'],
  ACCEPTED: ['SCHEDULED', 'RESCHEDULE_REQUESTED', 'CANCELLED'],
  SCHEDULED: ['RESCHEDULE_REQUESTED', 'COMPLETED', 'CANCELLED'],
  RESCHEDULE_REQUESTED: ['SCHEDULED', 'CANCELLED'],
  COMPLETED: [], // Terminal status
  REJECTED: [],  // Terminal status
  CANCELLED: [], // Terminal status
};

export function isValidStatusTransition(from: string, to: string): boolean {
  if (from === to) return true;
  const allowed = VALID_STATUS_TRANSITIONS[from];
  return Boolean(allowed && allowed.includes(to));
}

export const CANONICAL_CONSULTATION_CATEGORIES = [
  'Architectural Design',
  'Structural Engineering',
  'Construction & Site Issues',
  'Cost Estimation & BOQ',
  'Approvals & Regulations',
  'Interiors & Materials',
] as const;

export type CanonicalConsultationCategory = (typeof CANONICAL_CONSULTATION_CATEGORIES)[number];

export interface CategoryDetail {
  id: string;
  name: CanonicalConsultationCategory;
  description: string;
  examples: string[];
  icon: string;
  mappedConsultantCategories: string[];
}

export const CATEGORY_DETAILS: Record<CanonicalConsultationCategory, CategoryDetail> = {
  'Architectural Design': {
    id: 'architectural-design',
    name: 'Architectural Design',
    description: 'House plans, space planning, elevations and design reviews.',
    examples: ['Review my house plan', 'Improve room layout', 'Discuss elevation and design choices'],
    icon: 'Compass',
    mappedConsultantCategories: ['Architect'],
  },
  'Structural Engineering': {
    id: 'structural-engineering',
    name: 'Structural Engineering',
    description: 'Structural design, safety and technical guidance.',
    examples: ['Discuss structural drawings', 'Understand structural recommendations', 'Get guidance about a structural concern'],
    icon: 'Building2',
    mappedConsultantCategories: ['Structural Engineer'],
  },
  'Construction & Site Issues': {
    id: 'construction-site-issues',
    name: 'Construction & Site Issues',
    description: 'Execution guidance, quality checks and site problems.',
    examples: ['Discuss a construction-site issue', 'Understand a work-quality concern', 'Review construction progress questions'],
    icon: 'HardHat',
    mappedConsultantCategories: ['Contractor', 'Site Supervisor', 'Site Engineer'],
  },
  'Cost Estimation & BOQ': {
    id: 'cost-estimation-boq',
    name: 'Cost Estimation & BOQ',
    description: 'Material quantities, cost planning and BOQ review.',
    examples: ['Check my construction estimate', 'Understand material quantities', 'Review a contractor\'s quotation'],
    icon: 'Calculator',
    mappedConsultantCategories: ['Quantity Surveyor', 'Contractor'],
  },
  'Approvals & Regulations': {
    id: 'approvals-regulations',
    name: 'Approvals & Regulations',
    description: 'GBA rules, plan approvals, setbacks and compliance guidance.',
    examples: ['Understand setbacks', 'Discuss approval requirements', 'Review questions about applicable planning rules'],
    icon: 'FileCheck',
    mappedConsultantCategories: ['Approvals Consultant', 'Liaison Consultant', 'Architect'],
  },
  'Interiors & Materials': {
    id: 'interiors-materials',
    name: 'Interiors & Materials',
    description: 'Material selection, finishes, brands and interior planning.',
    examples: ['Choose construction materials', 'Compare finishing options', 'Discuss interior planning'],
    icon: 'Palette',
    mappedConsultantCategories: ['Interior Designer', 'Interior Architect'],
  },
};

export const POPULAR_SERVICES = [
  {
    id: 'review-house-plan',
    title: 'Review my house plan',
    description: 'Feedback on your plan, space planning and design.',
    category: 'Architectural Design' as CanonicalConsultationCategory,
    priceINR: CONSULTATION_PRICE_INR,
  },
  {
    id: 'check-construction-estimate',
    title: 'Check my construction estimate',
    description: 'Review the estimate and understand cost breakdowns.',
    category: 'Cost Estimation & BOQ' as CanonicalConsultationCategory,
    priceINR: CONSULTATION_PRICE_INR,
  },
  {
    id: 'understand-setbacks-approvals',
    title: 'Understand setbacks & approvals',
    description: 'GBA rules, setbacks, FAR and approval steps.',
    category: 'Approvals & Regulations' as CanonicalConsultationCategory,
    priceINR: CONSULTATION_PRICE_INR,
  },
  {
    id: 'choose-materials-finishes',
    title: 'Choose materials & finishes',
    description: 'Advice on materials, brands and finishes.',
    category: 'Interiors & Materials' as CanonicalConsultationCategory,
    priceINR: CONSULTATION_PRICE_INR,
  },
] as const;

export const APPLICATION_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'MORE_INFO_REQUIRED',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export function mapCategoryToConsultantCategories(category: string): string[] {
  if (category in CATEGORY_DETAILS) {
    return CATEGORY_DETAILS[category as CanonicalConsultationCategory].mappedConsultantCategories;
  }
  return [category];
}

