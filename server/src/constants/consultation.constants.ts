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

export function isValidStatusTransition(currentStatus: string, nextStatus: string): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(nextStatus);
}

