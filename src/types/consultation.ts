// ==============================================================================
// Hutty Consultation Types (Phase 1 MVP)
// ==============================================================================

export type ConsultationCategory =
  | 'Architect'
  | 'Structural Engineer'
  | 'Contractor'
  | 'Interior Designer'
  | 'Approvals Consultant'
  | 'Quantity Surveyor'
  | 'Site Supervisor';

export type ConsultationStatus =
  | 'AWAITING_REVIEW'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'SCHEDULED'
  | 'RESCHEDULE_REQUESTED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export interface Consultant {
  id: string;
  slug: string;
  name: string;
  title: string;
  category: ConsultationCategory | string;
  profileImage: string | null;
  experienceYears: number;
  city: string;
  serviceAreas: string[];
  about: string;
  specializations: string[];
  services: string[];
  active: boolean;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationPayment {
  id: string;
  consultationRequestId: string;
  gateway: string;
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  gatewaySignature: string | null;
  paymentSessionId?: string | null;
  payment_session_id?: string | null;
  environment?: string;
  amountMinorUnits: number;
  amountINR?: number;
  amountPaise?: number;
  currency: string;
  status: PaymentStatus;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationEvent {
  id: string;
  consultationRequestId: string;
  actorId: string | null;
  actorRole: string | null;
  eventType: string;
  title: string;
  internalNote?: string | null;
  metadataJson?: any;
  createdAt: string;
}

export interface ConsultationRequest {
  id: string;
  publicReference: string;
  userId: string | null;
  consultantId: string | null;
  consultant?: Consultant | null;
  homeownerName: string;
  homeownerPhone: string;
  homeownerEmail: string;
  projectId: string | null;
  projectSnapshot?: {
    projectId?: string;
    projectName?: string;
    city?: string;
    houseType?: string;
    floors?: number | null;
    totalBUASqFt?: number | null;
    estimatedTotalCostINR?: number | null;
  } | null;
  projectLocation: string;
  projectType: string;
  consultationTopic: string;
  message: string | null;
  preferredDate: string;
  preferredTime: string;
  confirmedDateTime: string | null;
  status: ConsultationStatus;
  amountMinorUnits: number;
  amountINR?: number;
  amountPaise?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  payments?: ConsultationPayment[];
  events?: ConsultationEvent[];
}

export interface BookingSubmissionPayload {
  consultantId: string;
  homeownerName: string;
  homeownerPhone: string;
  homeownerEmail: string;
  projectId?: string | null;
  projectSnapshot?: {
    source?: string;
    houseType?: string;
    floors?: number | null;
    totalBUASqFt?: number | null;
    estimatedTotalCostINR?: number | null;
    city?: string;
  } | null;
  projectLocation: string;
  projectType: string;
  consultationTopic: string;
  message?: string | null;
  preferredDate: string;
  preferredTime: string;
}

export interface RazorpayCheckoutOptions {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
}

export interface CashfreeCheckoutOptions {
  orderId: string;
  paymentSessionId?: string;
  payment_session_id?: string;
  amount: number;
  amountMinorUnits: number;
  currency: string;
  gateway: string;
  environment: string;
}

export type CanonicalConsultationCategory =
  | 'Architectural Design'
  | 'Structural Engineering'
  | 'Construction & Site Issues'
  | 'Cost Estimation & BOQ'
  | 'Approvals & Regulations'
  | 'Interiors & Materials';

export interface CategoryDetail {
  id: string;
  name: CanonicalConsultationCategory;
  description: string;
  examples: string[];
  icon: string;
  mappedConsultantCategories: string[];
}

export interface PopularService {
  id: string;
  title: string;
  description: string;
  category: CanonicalConsultationCategory;
  priceINR: number;
}

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'MORE_INFO_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface ProfessionalApplication {
  id: string;
  fullName: string;
  category: string;
  categories?: string[];
  email: string;
  phone: string;
  qualifications: string;
  licenseNumber: string | null;
  experienceYears: number;
  city: string;
  serviceAreas?: string[] | string;
  expertise?: string[];
  specializations?: string[];
  about?: string;
  portfolioLinks?: string[];
  portfolioUrl?: string;
  consultationModes?: string[];
  proposedServices?: string[];
  proposedFeeINR?: number;
  proposedFee?: number;
  documentsJson?: any | null;
  documentsUrl?: string | null;
  status: ApplicationStatus;
  adminReviewerId?: string | null;
  adminReviewNotes?: string | null;
  reviewerNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  approvedConsultantId?: string | null;
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalApplicationInput {
  fullName: string;
  category: string;
  email: string;
  phone: string;
  qualifications: string;
  licenseNumber?: string | null;
  experienceYears: number;
  city?: string;
  serviceAreas?: string[];
  expertise?: string[];
  portfolioLinks?: string[];
  consultationModes?: string[];
  proposedServices?: string[];
  proposedFeeINR?: number;
  documents?: any;
  consentGiven: boolean;
}

