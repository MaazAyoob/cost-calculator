// ==============================================================================
// Hutty Pricing & Entitlement Service (Pricing Model V1)
// Decoupled commercial access layer above canonical calculator engine.
// Server-side price authority in integer minor units (paise).
// Consultation (₹1,499) is strictly decoupled and untouched.
// ==============================================================================

import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import {
  INITIAL_PRICING_TIERS,
  InitialPricingTierSeed,
  PRICING_CURRENCY,
  PRICING_FEATURES,
  PRICING_MINOR_UNITS,
  PRICING_TIER_CODES,
  PricingFeatureCode,
  PricingTierCode,
} from '../constants/pricing.constants';

export interface PricingTierEntity {
  id: string;
  code: string;
  name: string;
  description: string;
  priceMinorUnits: number;
  currency: string;
  active: boolean;
  purchasable: boolean;
  sortOrder: number;
  badge: string | null;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PricingPurchaseEntity {
  id: string;
  publicReference: string;
  userId: string | null;
  tierId: string;
  tierCodeSnapshot: string;
  tierNameSnapshot: string;
  amountMinorUnits: number;
  currency: string;
  status: 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  gateway: string;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  leadName: string;
  leadPhone: string;
  leadEmail: string;
  projectId: string | null;
  projectSnapshot: any | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserEntitlementEntity {
  id: string;
  userId: string | null;
  userEmail: string | null;
  projectId: string | null;
  featureCode: string;
  sourcePurchaseId: string | null;
  active: boolean;
  startsAt: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PricingAuditLogEntity {
  id: string;
  tierId: string | null;
  tierCode: string | null;
  actorEmail: string;
  action: string;
  oldValue: any;
  newValue: any;
  reason: string | null;
  createdAt: string;
}

export class PricingService {
  private prisma: PrismaClient | null = null;
  private inMemoryTiers: PricingTierEntity[] = [];
  private inMemoryPurchases: PricingPurchaseEntity[] = [];
  private inMemoryEntitlements: UserEntitlementEntity[] = [];
  private inMemoryAuditLogs: PricingAuditLogEntity[] = [];

  constructor() {
    this.seedInMemoryTiers();
    try {
      this.prisma = new PrismaClient();
      this.syncSeedsToPrisma();
    } catch {
      this.prisma = null;
    }
  }

  private seedInMemoryTiers() {
    this.inMemoryTiers = INITIAL_PRICING_TIERS.map((tier, idx) => ({
      id: `tier-${tier.code.toLowerCase()}`,
      code: tier.code,
      name: tier.name,
      description: tier.description,
      priceMinorUnits: tier.priceMinorUnits,
      currency: tier.currency,
      active: tier.active,
      purchasable: tier.purchasable,
      sortOrder: tier.sortOrder,
      badge: tier.badge,
      features: [...tier.features],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  private async syncSeedsToPrisma() {
    if (!this.prisma) return;
    try {
      const count = await (this.prisma as any).pricingTier.count();
      if (count === 0) {
        for (const t of this.inMemoryTiers) {
          await (this.prisma as any).pricingTier.create({
            data: {
              id: t.id,
              code: t.code,
              name: t.name,
              description: t.description,
              priceMinorUnits: t.priceMinorUnits,
              currency: t.currency,
              active: t.active,
              purchasable: t.purchasable,
              sortOrder: t.sortOrder,
              badge: t.badge,
              features: t.features,
            },
          });
        }
      }
    } catch {
      // Non-blocking fallback
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // TIER MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════

  public async getPublicTiers(): Promise<PricingTierEntity[]> {
    if (this.prisma) {
      try {
        const tiers = await (this.prisma as any).pricingTier.findMany({
          where: {
            OR: [
              { active: true },
              { code: PRICING_TIER_CODES.COMPLETE_PACKAGE }, // Show Complete Package card as Coming Soon
            ],
          },
          orderBy: { sortOrder: 'asc' },
        });
        if (tiers && tiers.length > 0) return tiers;
      } catch {
        // Fallback to in-memory
      }
    }
    return this.inMemoryTiers
      .filter((t) => t.active || t.code === PRICING_TIER_CODES.COMPLETE_PACKAGE)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public async getAllTiersAdmin(): Promise<PricingTierEntity[]> {
    if (this.prisma) {
      try {
        const tiers = await (this.prisma as any).pricingTier.findMany({
          orderBy: { sortOrder: 'asc' },
        });
        if (tiers && tiers.length > 0) return tiers;
      } catch {}
    }
    return [...this.inMemoryTiers].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public async getTierByCode(code: string): Promise<PricingTierEntity | null> {
    if (this.prisma) {
      try {
        const tier = await (this.prisma as any).pricingTier.findUnique({
          where: { code },
        });
        if (tier) return tier;
      } catch {}
    }
    return this.inMemoryTiers.find((t) => t.code === code) || null;
  }

  public async getTierById(id: string): Promise<PricingTierEntity | null> {
    if (this.prisma) {
      try {
        const tier = await (this.prisma as any).pricingTier.findUnique({
          where: { id },
        });
        if (tier) return tier;
      } catch {}
    }
    return this.inMemoryTiers.find((t) => t.id === id) || null;
  }

  public async updateTier(
    id: string,
    updates: {
      name?: string;
      description?: string;
      priceMinorUnits?: number;
      active?: boolean;
      purchasable?: boolean;
      sortOrder?: number;
      badge?: string | null;
      features?: string[];
      reason?: string;
    },
    actorEmail: string = 'admin@hutty.in'
  ): Promise<PricingTierEntity> {
    const existing = await this.getTierById(id);
    if (!existing) {
      throw new Error(`Pricing tier with ID "${id}" not found`);
    }

    // Validation 1: Price integer check
    if (updates.priceMinorUnits !== undefined) {
      if (
        !Number.isInteger(updates.priceMinorUnits) ||
        updates.priceMinorUnits < 0 ||
        isNaN(updates.priceMinorUnits) ||
        !isFinite(updates.priceMinorUnits)
      ) {
        throw new Error('Price must be a non-negative integer in minor units (paise)');
      }
    }

    // Validation 2: Complete Package safety
    const targetCode = existing.code;
    const finalPrice = updates.priceMinorUnits !== undefined ? updates.priceMinorUnits : existing.priceMinorUnits;
    const finalPurchasable = updates.purchasable !== undefined ? updates.purchasable : existing.purchasable;

    if (targetCode === PRICING_TIER_CODES.COMPLETE_PACKAGE && finalPurchasable) {
      if (finalPrice <= 0) {
        throw new Error('Complete Package cannot be made purchasable until a valid final price (> 0) is configured');
      }
    }

    // Record audit log
    const auditEntry: PricingAuditLogEntity = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tierId: existing.id,
      tierCode: existing.code,
      actorEmail,
      action: updates.priceMinorUnits !== undefined && updates.priceMinorUnits !== existing.priceMinorUnits
        ? 'PRICE_UPDATED'
        : 'TIER_CONFIG_UPDATED',
      oldValue: {
        priceMinorUnits: existing.priceMinorUnits,
        active: existing.active,
        purchasable: existing.purchasable,
        features: existing.features,
      },
      newValue: {
        priceMinorUnits: finalPrice,
        active: updates.active !== undefined ? updates.active : existing.active,
        purchasable: finalPurchasable,
        features: updates.features !== undefined ? updates.features : existing.features,
      },
      reason: updates.reason || 'Admin modification',
      createdAt: new Date().toISOString(),
    };
    this.inMemoryAuditLogs.unshift(auditEntry);

    const updatedData: PricingTierEntity = {
      ...existing,
      name: updates.name !== undefined ? updates.name : existing.name,
      description: updates.description !== undefined ? updates.description : existing.description,
      priceMinorUnits: finalPrice,
      active: updates.active !== undefined ? updates.active : existing.active,
      purchasable: finalPurchasable,
      sortOrder: updates.sortOrder !== undefined ? updates.sortOrder : existing.sortOrder,
      badge: updates.badge !== undefined ? updates.badge : existing.badge,
      features: updates.features !== undefined ? updates.features : existing.features,
      updatedAt: new Date().toISOString(),
    };

    if (this.prisma) {
      try {
        await (this.prisma as any).pricingTier.update({
          where: { id },
          data: {
            name: updatedData.name,
            description: updatedData.description,
            priceMinorUnits: updatedData.priceMinorUnits,
            active: updatedData.active,
            purchasable: updatedData.purchasable,
            sortOrder: updatedData.sortOrder,
            badge: updatedData.badge,
            features: updatedData.features,
          },
        });
        await (this.prisma as any).pricingAuditLog.create({
          data: {
            tierId: auditEntry.tierId,
            tierCode: auditEntry.tierCode,
            actorEmail: auditEntry.actorEmail,
            action: auditEntry.action,
            oldValue: auditEntry.oldValue,
            newValue: auditEntry.newValue,
            reason: auditEntry.reason,
          },
        });
      } catch {}
    }

    const idx = this.inMemoryTiers.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.inMemoryTiers[idx] = updatedData;
    }

    return updatedData;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PURCHASE FLOW & SERVER-SIDE PRICE AUTHORITY
  // ═════════════════════════════════════════════════════════════════════════

  public async initiatePurchase(payload: {
    tierCode: string;
    leadName: string;
    leadPhone: string;
    leadEmail: string;
    userId?: string | null;
    projectId?: string | null;
    projectSnapshot?: any;
    testBypassPayment?: boolean;
  }): Promise<{
    purchase: PricingPurchaseEntity;
    requiresPayment: boolean;
    gatewayOrder: {
      orderId: string;
      amountMinorUnits: number;
      currency: string;
      keyId: string;
    } | null;
  }> {
    const tier = await this.getTierByCode(payload.tierCode);
    if (!tier) {
      throw new Error(`Invalid pricing tier code: "${payload.tierCode}"`);
    }

    // Complete package safety rule: unpurchasable until admin configures price > 0 and purchasable = true
    if (
      tier.code === PRICING_TIER_CODES.COMPLETE_PACKAGE &&
      (!tier.active || !tier.purchasable || tier.priceMinorUnits <= 0)
    ) {
      throw new Error('The Complete Construction Package is not yet available for purchase (Coming Soon)');
    }

    if (!tier.active) {
      throw new Error(`Pricing tier "${tier.name}" is currently inactive`);
    }

    // SERVER-AUTHORITATIVE PRICE RESOLUTION:
    // We ignore ANY amount or price passed from the frontend.
    const authoritativeAmountMinorUnits = tier.priceMinorUnits;

    // Public reference format: HT-PUR-XXXXXX
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const publicReference = `HT-PUR-${randomHex}`;

    const purchaseId = `pur-${Date.now()}-${randomHex}`;
    const gatewayOrderId = authoritativeAmountMinorUnits > 0
      ? `order_rc_${Date.now()}_${randomHex}`
      : null;

    // Free tier purchases (amount = 0) or test mode
    const isFree = authoritativeAmountMinorUnits === 0;
    const initialStatus = isFree ? 'PAID' : (payload.testBypassPayment ? 'PAID' : 'PENDING');

    const purchase: PricingPurchaseEntity = {
      id: purchaseId,
      publicReference,
      userId: payload.userId || null,
      tierId: tier.id,
      tierCodeSnapshot: tier.code,
      tierNameSnapshot: tier.name,
      amountMinorUnits: authoritativeAmountMinorUnits, // Historical snapshot
      currency: tier.currency,
      status: initialStatus,
      gateway: 'RAZORPAY',
      gatewayOrderId,
      gatewayPaymentId: initialStatus === 'PAID' ? `pay_demo_${randomHex}` : null,
      leadName: payload.leadName.trim(),
      leadPhone: payload.leadPhone.trim(),
      leadEmail: payload.leadEmail.trim().toLowerCase(),
      projectId: payload.projectId || null,
      projectSnapshot: payload.projectSnapshot || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.prisma) {
      try {
        await (this.prisma as any).pricingPurchase.create({
          data: {
            id: purchase.id,
            publicReference: purchase.publicReference,
            userId: purchase.userId,
            tierId: purchase.tierId,
            tierCodeSnapshot: purchase.tierCodeSnapshot,
            tierNameSnapshot: purchase.tierNameSnapshot,
            amountMinorUnits: purchase.amountMinorUnits,
            currency: purchase.currency,
            status: purchase.status,
            gateway: purchase.gateway,
            gatewayOrderId: purchase.gatewayOrderId,
            gatewayPaymentId: purchase.gatewayPaymentId,
            leadName: purchase.leadName,
            leadPhone: purchase.leadPhone,
            leadEmail: purchase.leadEmail,
            projectId: purchase.projectId,
            projectSnapshot: purchase.projectSnapshot,
          },
        });
      } catch {}
    }
    this.inMemoryPurchases.unshift(purchase);

    // If instantly PAID (Free or test bypass), activate entitlements right away
    if (purchase.status === 'PAID') {
      await this.grantEntitlementsForPurchase(purchase, tier.features);
    }

    return {
      purchase,
      requiresPayment: !isFree && purchase.status !== 'PAID',
      gatewayOrder: authoritativeAmountMinorUnits > 0
        ? {
            orderId: gatewayOrderId || `order_demo_${randomHex}`,
            amountMinorUnits: authoritativeAmountMinorUnits,
            currency: tier.currency,
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          }
        : null,
    };
  }

  public async confirmPurchasePayment(
    purchaseId: string,
    gatewayPaymentId: string,
    gatewayOrderId?: string
  ): Promise<{ purchase: PricingPurchaseEntity; entitlements: UserEntitlementEntity[] }> {
    const purchase = this.inMemoryPurchases.find((p) => p.id === purchaseId || p.gatewayOrderId === gatewayOrderId);
    if (!purchase) {
      throw new Error(`Purchase record not found for ID "${purchaseId}"`);
    }

    if (purchase.status === 'PAID') {
      // Already confirmed (idempotent)
      const existingEnts = this.inMemoryEntitlements.filter((e) => e.sourcePurchaseId === purchase.id);
      return { purchase, entitlements: existingEnts };
    }

    purchase.status = 'PAID';
    purchase.gatewayPaymentId = gatewayPaymentId;
    purchase.updatedAt = new Date().toISOString();

    if (this.prisma) {
      try {
        await (this.prisma as any).pricingPurchase.update({
          where: { id: purchase.id },
          data: {
            status: 'PAID',
            gatewayPaymentId,
          },
        });
      } catch {}
    }

    const tier = await this.getTierById(purchase.tierId);
    const features = tier ? tier.features : [];
    const entitlements = await this.grantEntitlementsForPurchase(purchase, features);

    return { purchase, entitlements };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // ENTITLEMENTS & ACCESS CONTROL
  // ═════════════════════════════════════════════════════════════════════════

  public async grantEntitlementsForPurchase(
    purchase: PricingPurchaseEntity,
    features: string[]
  ): Promise<UserEntitlementEntity[]> {
    const granted: UserEntitlementEntity[] = [];

    for (const feat of features) {
      const ent: UserEntitlementEntity = {
        id: `ent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: purchase.userId,
        userEmail: purchase.leadEmail,
        projectId: purchase.projectId,
        featureCode: feat,
        sourcePurchaseId: purchase.id,
        active: true,
        startsAt: new Date().toISOString(),
        expiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.inMemoryEntitlements.push(ent);
      granted.push(ent);

      if (this.prisma) {
        try {
          await (this.prisma as any).userEntitlement.create({
            data: {
              id: ent.id,
              userId: ent.userId,
              userEmail: ent.userEmail,
              projectId: ent.projectId,
              featureCode: ent.featureCode,
              sourcePurchaseId: ent.sourcePurchaseId,
              active: ent.active,
              startsAt: new Date(ent.startsAt),
            },
          });
        } catch {}
      }
    }

    return granted;
  }

  public async getUserEntitlements(
    userId?: string | null,
    userEmail?: string | null,
    projectId?: string | null
  ): Promise<UserEntitlementEntity[]> {
    const normalizedEmail = userEmail?.trim().toLowerCase();

    return this.inMemoryEntitlements.filter((e) => {
      if (!e.active) return false;
      if (projectId && e.projectId === projectId) return true;
      if (userId && e.userId === userId) return true;
      if (normalizedEmail && e.userEmail === normalizedEmail) return true;
      return false;
    });
  }

  public async canAccessFeature(
    featureCode: string,
    userId?: string | null,
    userEmail?: string | null,
    projectId?: string | null
  ): Promise<boolean> {
    // Basic summaries are always public/free
    if (
      featureCode === PRICING_FEATURES.BASIC_PROJECT_SUMMARY ||
      featureCode === PRICING_FEATURES.BASIC_COST_SUMMARY
    ) {
      return true;
    }

    const entitlements = await this.getUserEntitlements(userId, userEmail, projectId);
    return entitlements.some((e) => e.featureCode === featureCode && e.active);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // ADMIN REPORTING & PURCHASES
  // ═════════════════════════════════════════════════════════════════════════

  public async getPurchaseHistory(): Promise<PricingPurchaseEntity[]> {
    if (this.prisma) {
      try {
        const records = await (this.prisma as any).pricingPurchase.findMany({
          orderBy: { createdAt: 'desc' },
        });
        if (records && records.length > 0) return records;
      } catch {}
    }
    return [...this.inMemoryPurchases].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async getPricingAuditLogs(): Promise<PricingAuditLogEntity[]> {
    if (this.prisma) {
      try {
        const logs = await (this.prisma as any).pricingAuditLog.findMany({
          orderBy: { createdAt: 'desc' },
        });
        if (logs && logs.length > 0) return logs;
      } catch {}
    }
    return [...this.inMemoryAuditLogs];
  }

  public async getPricingMetrics(): Promise<{
    totalPurchases: number;
    paidPurchases: number;
    pendingPurchases: number;
    totalRevenuePaise: number;
    totalRevenueINR: number;
    tierCounts: Record<string, number>;
  }> {
    const all = await this.getPurchaseHistory();
    const paid = all.filter((p) => p.status === 'PAID');
    const pending = all.filter((p) => p.status === 'PENDING');

    const totalRevenuePaise = paid.reduce((sum, p) => sum + p.amountMinorUnits, 0);

    const tierCounts: Record<string, number> = {};
    for (const p of paid) {
      tierCounts[p.tierCodeSnapshot] = (tierCounts[p.tierCodeSnapshot] || 0) + 1;
    }

    return {
      totalPurchases: all.length,
      paidPurchases: paid.length,
      pendingPurchases: pending.length,
      totalRevenuePaise,
      totalRevenueINR: Math.round(totalRevenuePaise / 100),
      tierCounts,
    };
  }
}

export const pricingService = new PricingService();
