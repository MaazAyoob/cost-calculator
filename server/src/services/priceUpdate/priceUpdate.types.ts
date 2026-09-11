// ============================================================
// PRICE UPDATE PROVIDER TYPES & CONTRACTS
// Modular interface and data structures for external price providers
// ============================================================

export type ProposalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_REVIEW'
  | 'UNVERIFIED'
  | 'FAILED';

export type PriceConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';

export interface MarketPriceProposal {
  id: string;
  runId: string;
  rateId: string;
  rateName: string;
  category: string;
  unit: string;
  currentRate: number;
  proposedRate: number;
  difference: number;
  differencePercent: number;
  currency: string;
  location: string;
  packageTier: string;
  source: string;
  sourceUrl?: string;
  retrievedAt: string;
  confidence: PriceConfidence;
  status: ProposalStatus;
  notes?: string;
  warning?: string;
  isAiAssisted: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface RawProviderQuote {
  rateId: string;
  proposedRate: number;
  unit: string;
  currency?: string;
  location?: string;
  packageTier?: string;
  source: string;
  sourceUrl?: string;
  retrievedAt?: string;
  confidence?: PriceConfidence;
  notes?: string;
  isAiAssisted?: boolean;
}

export interface PriceUpdateRunRequest {
  providerId: 'market_index' | 'external_api' | 'ai_research' | string;
  scope?: 'ALL' | 'CATEGORY' | 'SELECTED';
  category?: string;
  rateIds?: string[];
  adminEmail: string;
}

export interface PriceUpdateRunSummary {
  id: string;
  provider: string;
  status: string;
  totalProposed: number;
  totalApproved: number;
  totalRejected: number;
  scope: string;
  category?: string;
  runBy: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  proposals: MarketPriceProposal[];
}

export interface SanityCheckResult {
  isValid: boolean;
  warning?: string;
  status: ProposalStatus;
  rejectionReason?: string;
}

/**
 * Provider interface: all price update sources must implement this contract.
 */
export interface IPriceUpdateProvider {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly isAiAssisted: boolean;
  
  fetchPrices(targetRateIds: string[], context?: { category?: string; location?: string }): Promise<RawProviderQuote[]>;
}
