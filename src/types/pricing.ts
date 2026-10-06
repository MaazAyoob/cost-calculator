// ==============================================================================
// Hutty Pricing Model V1 Types
// Commercial access layer decoupled from canonical calculation mathematics.
// Consultation (₹1,499) is strictly decoupled and governed separately.
// ==============================================================================

export type PricingTierCode = 'FREE' | 'ESTIMATE_99' | 'DETAILED_ESTIMATE_499' | 'COMPLETE_PACKAGE';

export type PricingFeatureCode =
  | 'BASIC_PROJECT_SUMMARY'
  | 'BASIC_COST_SUMMARY'
  | 'LEAD_CAPTURE'
  | 'SAVED_PROJECT'
  | 'PROJECT_HISTORY'
  | 'ADVANCED_PROJECT_DETAILS'
  | 'DETAILED_QUANTITIES'
  | 'DETAILED_BOQ'
  | 'MATERIAL_SCHEDULE'
  | 'FIXTURES_SCHEDULE'
  | 'LABOUR_BREAKDOWN'
  | 'DETAILED_COST_BREAKDOWN'
  | 'FULL_PDF_REPORT'
  | 'REPORT_DOWNLOAD'
  | 'COMPLETE_PACKAGE_FEATURES';

export interface PricingTier {
  id: string;
  code: PricingTierCode | string;
  name: string;
  description: string;
  priceMinorUnits: number; // Integer paise (0, 9900, 49900)
  currency: string;
  active: boolean;
  purchasable: boolean;
  sortOrder: number;
  badge?: string | null;
  features: PricingFeatureCode[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

export type PricingPurchaseStatus = 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface PricingPurchase {
  id: string;
  publicReference: string;
  userId?: string | null;
  tierId: string;
  tierCodeSnapshot: string;
  tierNameSnapshot: string;
  amountMinorUnits: number;
  currency: string;
  status: PricingPurchaseStatus;
  gateway: string;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  leadName: string;
  leadPhone: string;
  leadEmail: string;
  projectId?: string | null;
  projectSnapshot?: any;
  createdAt: string;
  updatedAt: string;
}

export interface UserEntitlement {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  projectId?: string | null;
  featureCode: PricingFeatureCode | string;
  sourcePurchaseId?: string | null;
  active: boolean;
  startsAt: string;
  expiresAt?: string | null;
}

export interface PricingAuditLog {
  id: string;
  tierId?: string | null;
  tierCode?: string | null;
  actorEmail: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  reason?: string | null;
  createdAt: string;
}

export interface PricingMetrics {
  totalPurchases: number;
  paidPurchases: number;
  pendingPurchases: number;
  totalRevenuePaise: number;
  totalRevenueINR: number;
  tierCounts: Record<string, number>;
}
