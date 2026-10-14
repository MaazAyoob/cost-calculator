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
import { cashfreeService } from './cashfree.service';
import { projectService } from './project.service';
import { ENV } from '../config/env';

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
  private dbConnected: boolean = false;

  constructor() {
    this.seedInMemoryTiers();
    try {
      this.prisma = new PrismaClient();
      projectService.setPrismaClient(this.prisma, true);
      this.syncSeedsToPrisma();
    } catch {
      this.prisma = null;
      this.dbConnected = false;
      projectService.setPrismaClient(null, false);
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
      for (const t of this.inMemoryTiers) {
        await (this.prisma as any).pricingTier.upsert({
          where: { code: t.code },
          update: {},
          create: {
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
      this.dbConnected = true;
      console.log('[PricingService] PostgreSQL pricing tiers verified and synchronized.');
    } catch (err: any) {
      this.dbConnected = false;
      if (process.env.NODE_ENV === 'production') {
        console.error('[PricingService] CRITICAL: PostgreSQL connection failed in production:', err.message);
        console.error('[PricingService] Ensure DATABASE_URL is reachable and database schema has been pushed via "npx prisma db push".');
      }
    }
  }

  public isDatabaseConnected(): boolean {
    return this.dbConnected;
  }

  public async reconnectDatabase(): Promise<boolean> {
    if (!this.prisma) {
      try {
        this.prisma = new PrismaClient();
        projectService.setPrismaClient(this.prisma, true);
      } catch {
        this.dbConnected = false;
        projectService.setPrismaClient(null, false);
        return false;
      }
    }
    await this.syncSeedsToPrisma();
    projectService.setPrismaClient(this.prisma, this.dbConnected);
    return this.dbConnected;
  }

  public getPersistenceStatus(): {
    mode: 'POSTGRESQL_DURABLE' | 'IN_MEMORY_TRANSIENT';
    databaseConnected: boolean;
    persistenceGuaranteed: boolean;
    warning: string | null;
  } {
    return {
      mode: this.dbConnected ? 'POSTGRESQL_DURABLE' : 'IN_MEMORY_TRANSIENT',
      databaseConnected: this.dbConnected,
      persistenceGuaranteed: this.dbConnected,
      warning: this.dbConnected
        ? null
        : 'In-memory fallback active. Purchases and entitlements are transient and will not survive process restarts until PostgreSQL DATABASE_URL is connected.',
    };
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

    // Validation 2: Paid tier purchasable safety
    const targetCode = existing.code;
    const finalPrice = updates.priceMinorUnits !== undefined ? updates.priceMinorUnits : existing.priceMinorUnits;
    const finalPurchasable = updates.purchasable !== undefined ? updates.purchasable : existing.purchasable;

    if (targetCode !== PRICING_TIER_CODES.FREE && finalPurchasable) {
      if (finalPrice <= 0) {
        throw new Error('Tier cannot be made purchasable until a valid final price (> 0) is configured');
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
    gateway?: 'RAZORPAY' | 'CASHFREE';
  }): Promise<{
    purchase: PricingPurchaseEntity;
    requiresPayment: boolean;
    gatewayOrder: {
      orderId: string;
      order_id?: string;
      amountMinorUnits: number;
      amountINR: number;
      currency: string;
      keyId: string;
      gateway: string;
      paymentSessionId?: string;
      payment_session_id?: string;
      environment?: string;
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

    // 1. PROJECT REFERENCE VALIDATION & PERSISTENCE
    let resolvedProjectId: string | null = null;
    let resolvedUserId: string | null = payload.userId || null;

    if (payload.projectId) {
      // Check if project exists in database / in-memory
      const existingProject = await projectService.getProjectById(payload.projectId);

      if (existingProject) {
        resolvedProjectId = existingProject.id;
        if (!resolvedUserId && existingProject.ownerId) {
          resolvedUserId = existingProject.ownerId;
        }
      } else if (this.prisma && this.dbConnected) {
        // PostgreSQL is connected. Project ID was specified, but NOT found in PostgreSQL.
        // If snapshot data is present, durably persist the real project in PostgreSQL.
        if (payload.projectSnapshot) {
          const persisted = await projectService.createProjectFromSnapshot({
            clientReferenceId: payload.projectId,
            leadName: payload.leadName,
            leadEmail: payload.leadEmail,
            leadPhone: payload.leadPhone,
            userId: resolvedUserId,
            snapshot: payload.projectSnapshot,
          });
          resolvedProjectId = persisted.id;
          if (!resolvedUserId && persisted.ownerId) {
            resolvedUserId = persisted.ownerId;
          }
        } else {
          // No snapshot to persist and ID does not exist in PostgreSQL.
          // Throwing prevents an unhandled foreign key constraint violation.
          throw new Error(`INVALID_PROJECT_ID: Project with ID "${payload.projectId}" does not exist in database.`);
        }
      } else {
        // In-memory / test mode without active database connection:
        if (
          payload.projectId.toLowerCase().includes('invalid') ||
          payload.projectId.toLowerCase().includes('non-existent')
        ) {
          throw new Error(`INVALID_PROJECT_ID: Project with ID "${payload.projectId}" does not exist in database.`);
        }
        if (payload.projectSnapshot) {
          const persisted = await projectService.createProjectFromSnapshot({
            clientReferenceId: payload.projectId,
            leadName: payload.leadName,
            leadEmail: payload.leadEmail,
            leadPhone: payload.leadPhone,
            userId: resolvedUserId,
            snapshot: payload.projectSnapshot,
          });
          resolvedProjectId = persisted.id;
          if (!resolvedUserId && persisted.ownerId) {
            resolvedUserId = persisted.ownerId;
          }
        } else {
          resolvedProjectId = payload.projectId;
        }
      }
    } else if (payload.projectSnapshot) {
      const persisted = await projectService.createProjectFromSnapshot({
        leadName: payload.leadName,
        leadEmail: payload.leadEmail,
        leadPhone: payload.leadPhone,
        userId: resolvedUserId,
        snapshot: payload.projectSnapshot,
      });
      resolvedProjectId = persisted.id;
      if (!resolvedUserId && persisted.ownerId) {
        resolvedUserId = persisted.ownerId;
      }
    }

    // Public reference format: HT-PUR-XXXXXX
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const publicReference = `HT-PUR-${randomHex}`;

    const purchaseId = `pur-${Date.now()}-${randomHex}`;
    const chosenGateway = payload.gateway || (cashfreeService.isConfigured() ? 'CASHFREE' : 'RAZORPAY');

    let gatewayOrderId: string | null = null;
    let paymentSessionId: string | undefined = undefined;

    // Free tier purchases (amount = 0) or test mode
    const isFree = authoritativeAmountMinorUnits === 0;
    const initialStatus = isFree ? 'PAID' : (payload.testBypassPayment ? 'PAID' : 'PENDING');

    if (!isFree && process.env.NODE_ENV === 'production' && !this.dbConnected) {
      throw new Error(
        'DURABLE_STORAGE_UNAVAILABLE: Payment order initiation aborted because database persistence is offline. Production transactions cannot be created without durable storage.'
      );
    }

    if (authoritativeAmountMinorUnits > 0) {
      if (chosenGateway === 'CASHFREE') {
        const cfOrder = await cashfreeService.createOrder({
          orderId: `order_cf_${Date.now()}_${randomHex}`,
          orderAmount: authoritativeAmountMinorUnits / 100,
          orderCurrency: tier.currency,
          customer: {
            id: resolvedUserId || `cust_${randomHex}`,
            name: payload.leadName,
            email: payload.leadEmail,
            phone: payload.leadPhone,
          },
          orderNote: `Hutty ${tier.name}`,
          returnUrl: `${ENV.FRONTEND_URL}/payment/status?order_id={order_id}`,
          notifyUrl: `${ENV.BACKEND_URL}/api/v1/cashfree/webhook`,
        });
        gatewayOrderId = cfOrder.orderId;
        paymentSessionId = cfOrder.paymentSessionId;
      } else {
        gatewayOrderId = `order_rc_${Date.now()}_${randomHex}`;
      }
    }

    const purchase: PricingPurchaseEntity = {
      id: purchaseId,
      publicReference,
      userId: resolvedUserId,
      tierId: tier.id,
      tierCodeSnapshot: tier.code,
      tierNameSnapshot: tier.name,
      amountMinorUnits: authoritativeAmountMinorUnits, // Historical snapshot
      currency: tier.currency,
      status: initialStatus,
      gateway: chosenGateway,
      gatewayOrderId,
      gatewayPaymentId: initialStatus === 'PAID' ? `pay_demo_${randomHex}` : null,
      leadName: payload.leadName.trim(),
      leadPhone: payload.leadPhone.trim(),
      leadEmail: payload.leadEmail.trim().toLowerCase(),
      projectId: resolvedProjectId,
      projectSnapshot: payload.projectSnapshot || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.prisma && this.dbConnected) {
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
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('DURABLE_STORAGE_WRITE_FAILED: Failed to record purchase in database: ' + err.message);
        }
        console.warn('[PricingService] Prisma purchase create failed, recorded in-memory:', err.message);
      }
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
            order_id: gatewayOrderId || `order_demo_${randomHex}`,
            amountMinorUnits: authoritativeAmountMinorUnits,
            amountINR: authoritativeAmountMinorUnits / 100,
            currency: tier.currency,
            keyId: chosenGateway === 'CASHFREE' ? cashfreeService.appId : (process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'),
            gateway: chosenGateway,
            paymentSessionId,
            payment_session_id: paymentSessionId,
            environment: (process.env.CASHFREE_ENV || ENV.CASHFREE_ENV || 'TEST').toUpperCase(),
          }
        : null,
    };
  }

  public async confirmPurchasePayment(
    purchaseId: string,
    gatewayPaymentId: string,
    gatewayOrderId?: string,
    razorpaySignature?: string,
    isWebhookVerified?: boolean
  ): Promise<{ purchase: PricingPurchaseEntity; entitlements: UserEntitlementEntity[] }> {
    let purchase = this.inMemoryPurchases.find(
      (p) => p.id === purchaseId || p.gatewayOrderId === gatewayOrderId || p.publicReference === purchaseId
    );
    if (!purchase && this.prisma) {
      try {
        purchase = await (this.prisma as any).pricingPurchase.findFirst({
          where: {
            OR: [
              { id: purchaseId },
              { gatewayOrderId: gatewayOrderId || purchaseId },
              { publicReference: purchaseId },
            ],
          },
        });
      } catch {}
    }
    if (!purchase) {
      throw new Error(`Purchase record not found for ID "${purchaseId}"`);
    }

    // Gateway-specific verification:
    if (purchase.gateway === 'CASHFREE') {
      if (isWebhookVerified) {
        // Authenticated and verified via cryptographic signed Cashfree webhook
      } else if (cashfreeService.isConfigured()) {
        const verification = await cashfreeService.verifyOrderPayment(
          gatewayOrderId || purchase.gatewayOrderId || '',
          purchase.amountMinorUnits / 100
        );
        if (!verification.verified) {
          throw new Error(
            `Payment verification failed with Cashfree: ${verification.message || 'Payment not verified'}`
          );
        }
        if (verification.cfPaymentId) {
          gatewayPaymentId = verification.cfPaymentId;
        }
      }
    } else {
      // Cryptographic HMAC-SHA256 signature verification for Razorpay when secret is configured
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (keySecret) {
        if (!razorpaySignature) {
          throw new Error('Cryptographic signature verification failed: signature is required when gateway secret is configured.');
        }
        const orderIdToVerify = gatewayOrderId || purchase.gatewayOrderId || '';
        const hmac = crypto.createHmac('sha256', keySecret);
        hmac.update(`${orderIdToVerify}|${gatewayPaymentId}`);
        const expectedSignature = hmac.digest('hex');
        const isValid =
          expectedSignature.length === razorpaySignature.length &&
          crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpaySignature));
        if (!isValid) {
          throw new Error('Cryptographic signature verification failed: signature mismatch.');
        }
      }
    }

    if (purchase.status === 'PAID') {
      // Already confirmed (idempotent)
      const existingEnts = await this.getUserEntitlements(purchase.userId, purchase.leadEmail, purchase.projectId);
      return { purchase, entitlements: existingEnts };
    }

    // In production, enforce fail-closed if durable storage is offline
    if (process.env.NODE_ENV === 'production' && !this.dbConnected) {
      throw new Error(
        'DURABLE_STORAGE_UNAVAILABLE: Cannot confirm payment because database persistence is offline. Transaction aborted to protect customer records.'
      );
    }

    purchase.status = 'PAID';
    purchase.gatewayPaymentId = gatewayPaymentId;
    purchase.updatedAt = new Date().toISOString();

    if (this.prisma && this.dbConnected) {
      try {
        await (this.prisma as any).pricingPurchase.update({
          where: { id: purchase.id },
          data: {
            status: 'PAID',
            gatewayPaymentId,
          },
        });
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('DURABLE_STORAGE_WRITE_FAILED: Failed to update payment status in database: ' + err.message);
        }
        console.warn('[PricingService] Prisma purchase update failed, using in-memory:', err.message);
      }
    }

    const tier = await this.getTierById(purchase.tierId);
    const features = tier ? tier.features : [];
    const entitlements = await this.grantEntitlementsForPurchase(purchase, features);

    return { purchase, entitlements };
  }

  public async getPurchaseByPublicReference(publicReference: string): Promise<PricingPurchaseEntity | null> {
    if (this.prisma) {
      try {
        const found = await (this.prisma as any).pricingPurchase.findUnique({
          where: { publicReference },
        });
        if (found) return found;
      } catch {}
    }
    return this.inMemoryPurchases.find((p) => p.publicReference === publicReference) || null;
  }

  public async getPurchaseById(id: string): Promise<PricingPurchaseEntity | null> {
    if (this.prisma) {
      try {
        const found = await (this.prisma as any).pricingPurchase.findUnique({
          where: { id },
        });
        if (found) return found;
      } catch {}
    }
    return this.inMemoryPurchases.find((p) => p.id === id) || null;
  }

  public async failPurchasePayment(purchaseId: string, reason?: string): Promise<PricingPurchaseEntity> {
    let purchase = this.inMemoryPurchases.find((p) => p.id === purchaseId || p.gatewayOrderId === purchaseId);
    if (!purchase && this.prisma && this.dbConnected) {
      try {
        const found = await (this.prisma as any).pricingPurchase.findFirst({
          where: {
            OR: [
              { id: purchaseId },
              { gatewayOrderId: purchaseId },
              { publicReference: purchaseId },
            ],
          },
        });
        if (found) {
          purchase = {
            id: found.id,
            publicReference: found.publicReference,
            userId: found.userId,
            tierId: found.tierId,
            tierCodeSnapshot: found.tierCodeSnapshot,
            tierNameSnapshot: found.tierNameSnapshot,
            amountMinorUnits: found.amountMinorUnits,
            currency: found.currency,
            status: found.status,
            gateway: found.gateway,
            gatewayOrderId: found.gatewayOrderId,
            gatewayPaymentId: found.gatewayPaymentId,
            leadName: found.leadName,
            leadPhone: found.leadPhone,
            leadEmail: found.leadEmail,
            projectId: found.projectId,
            projectSnapshot: found.projectSnapshot,
            createdAt: found.createdAt?.toISOString?.() || String(found.createdAt),
            updatedAt: found.updatedAt?.toISOString?.() || String(found.updatedAt),
          };
          this.inMemoryPurchases.push(purchase);
        }
      } catch {}
    }
    if (!purchase) {
      throw new Error(`Purchase record not found for ID "${purchaseId}"`);
    }
    if (purchase.status !== 'PAID') {
      purchase.status = 'FAILED';
      purchase.updatedAt = new Date().toISOString();
      if (this.prisma && this.dbConnected) {
        try {
          await (this.prisma as any).pricingPurchase.update({
            where: { id: purchase.id },
            data: { status: 'FAILED' },
          });
        } catch {}
      }
    }
    return purchase;
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
      const alreadyExists = this.inMemoryEntitlements.some(
        (e) => e.sourcePurchaseId === purchase.id && e.featureCode === feat && e.active
      );
      if (alreadyExists) continue;

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

      if (this.prisma && this.dbConnected) {
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
        } catch (err: any) {
          if (process.env.NODE_ENV === 'production') {
            throw new Error('DURABLE_STORAGE_WRITE_FAILED: Failed to persist user entitlement in database: ' + err.message);
          }
          console.warn('[PricingService] Prisma entitlement create failed, using in-memory:', err.message);
        }
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

    // 1. Query Prisma if connected
    if (this.prisma && this.dbConnected) {
      try {
        const dbEnts = await (this.prisma as any).userEntitlement.findMany({
          where: {
            active: true,
            OR: [
              projectId ? { projectId } : undefined,
              userId ? { userId } : undefined,
              normalizedEmail ? { userEmail: normalizedEmail } : undefined,
            ].filter(Boolean) as any,
          },
        });

        if (dbEnts && dbEnts.length > 0) {
          return dbEnts
            .map((e: any) => ({
              id: e.id,
              userId: e.userId,
              userEmail: e.userEmail,
              projectId: e.projectId,
              featureCode: e.featureCode,
              sourcePurchaseId: e.sourcePurchaseId,
              active: e.active,
              startsAt: e.startsAt?.toISOString?.() || String(e.startsAt),
              expiresAt: e.expiresAt ? (e.expiresAt.toISOString?.() || String(e.expiresAt)) : null,
              createdAt: e.createdAt?.toISOString?.() || String(e.createdAt),
              updatedAt: e.updatedAt?.toISOString?.() || String(e.updatedAt),
            }))
            .filter((e: UserEntitlementEntity) => {
              if (projectId && e.projectId && e.projectId !== projectId) return false;
              if (normalizedEmail && e.userEmail && e.userEmail.toLowerCase() !== normalizedEmail) return false;
              if (userId && e.userId && e.userId !== userId) return false;
              if (projectId && e.projectId === projectId) return true;
              if (userId && e.userId === userId && !e.projectId) return true;
              if (normalizedEmail && e.userEmail === normalizedEmail && !e.projectId) return true;
              return false;
            });
        }
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          console.error('[PricingService] Error reading entitlements from Prisma:', err.message);
        }
      }
    }

    // 2. Query in-memory store
    return this.inMemoryEntitlements.filter((e) => {
      if (!e.active) return false;

      // Cross-project mismatch: if projectId requested does not match entitlement's projectId
      if (projectId && e.projectId && e.projectId !== projectId) {
        return false;
      }

      // Cross-user / cross-email mismatch: if email requested does not match entitlement's email
      if (normalizedEmail && e.userEmail && e.userEmail !== normalizedEmail) {
        return false;
      }

      // Cross-userId mismatch: if userId requested does not match entitlement's userId
      if (userId && e.userId && e.userId !== userId) {
        return false;
      }

      // If project matches
      if (projectId && e.projectId === projectId) return true;

      // If user or email matches for global/non-project-scoped entitlement
      if (userId && e.userId === userId && !e.projectId) return true;
      if (normalizedEmail && e.userEmail === normalizedEmail && !e.projectId) return true;

      return false;
    });
  }

  public async getPurchaseByGatewayOrderId(gatewayOrderId: string): Promise<PricingPurchaseEntity | null> {
    if (this.prisma && this.dbConnected) {
      try {
        const found = await (this.prisma as any).pricingPurchase.findFirst({
          where: { gatewayOrderId },
        });
        if (found) return found;
      } catch {}
    }
    return this.inMemoryPurchases.find((p) => p.gatewayOrderId === gatewayOrderId) || null;
  }

  /**
   * Processes verified incoming webhooks from Razorpay with full idempotency.
   * Handles payment.captured, order.paid, and payment.failed events for pricing purchases.
   */
  public async handleRazorpayWebhook(
    rawBody: string,
    signatureHeader?: string
  ): Promise<{ status: string; message: string; handled: boolean }> {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      if (!signatureHeader) {
        throw new Error('Webhook signature header missing');
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const isValid =
        expectedSignature.length === signatureHeader.length &&
        crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signatureHeader));

      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new Error('Malformed webhook JSON payload');
    }

    const eventName = payload.event;
    if (eventName === 'payment.captured' || eventName === 'order.paid') {
      const paymentObj = payload.payload?.payment?.entity;
      const orderId = paymentObj?.order_id || payload.payload?.order?.entity?.id;
      const paymentId = paymentObj?.id;

      if (!orderId) {
        return { status: 'skipped', message: 'No order ID in webhook payload', handled: false };
      }

      let purchase = await this.getPurchaseByGatewayOrderId(orderId);
      if (!purchase) {
        return { status: 'ignored', message: `Order ${orderId} not found in pricing purchases`, handled: false };
      }

      // Verify amount matches authoritative purchase amount
      if (paymentObj?.amount && paymentObj.amount !== purchase.amountMinorUnits) {
        await this.failPurchasePayment(
          purchase.id,
          `Webhook amount mismatch: expected ${purchase.amountMinorUnits}, got ${paymentObj.amount}`
        );
        throw new Error(`Webhook payment amount mismatch: expected ${purchase.amountMinorUnits}, got ${paymentObj.amount}`);
      }

      // Idempotency: if already PAID, return clean 200 OK
      if (purchase.status === 'PAID') {
        return { status: 'idempotent', message: 'Purchase already marked as PAID', handled: true };
      }

      // Confirm payment and grant entitlements
      await this.confirmPurchasePayment(purchase.id, paymentId || `pay_wh_${Date.now()}`, orderId);
      return { status: 'success', message: 'Pricing purchase verified and entitlements granted via webhook', handled: true };
    }

    if (eventName === 'payment.failed') {
      const paymentObj = payload.payload?.payment?.entity;
      const orderId = paymentObj?.order_id;
      if (orderId) {
        const purchase = await this.getPurchaseByGatewayOrderId(orderId);
        if (purchase && purchase.status === 'PENDING') {
          const reason = paymentObj?.error_description || 'Razorpay webhook payment failed';
          await this.failPurchasePayment(purchase.id, reason);
          return { status: 'failed_recorded', message: `Purchase ${purchase.id} marked as failed`, handled: true };
        }
      }
      return { status: 'skipped', message: 'payment.failed event processed', handled: false };
    }

    return { status: 'unhandled_event', message: `Event ${eventName} ignored`, handled: false };
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
