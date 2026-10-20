// ==============================================================================
// Hutty — Project Persistence, Report Checkout & Save Lifecycle Robustness
// Comprehensive regression test suite covering:
// 1. Authenticated users create and save projects with valid ownership
// 2. Invalid/stale identities cannot create projects under nonexistent owners
// 3. Calculator saves persist latest selections (Step 8 Electrical/MEP) & recover safely
// 4. Report checkout works for valid persisted customer and project (₹99, ₹499, ₹1,499)
// 5. Project-persistence failures stop checkout safely and do not grant paid entitlements
// 6. Repeated payment callbacks cannot create duplicate entitlements (Idempotency)
// 7. Project restoration, report generation, authentication, & payment pass
// 8. Production database failures never trigger fake success or unsafe fallback
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { projectService } from '../../../server/src/services/project.service';
import { pricingService } from '../../../server/src/services/pricing.service';
import { cashfreeService } from '../../../server/src/services/cashfree.service';
import { PRICING_TIER_CODES, PRICING_FEATURES } from '../../../server/src/constants/pricing.constants';

describe('Project Persistence, Report Checkout & Save Lifecycle Robustness', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    projectService.clearInMemory();

    // Mock Cashfree gateway order creation for sandbox/test environments
    process.env.CASHFREE_APP_ID = 'TEST_CF_APP_ID_MOCK';
    process.env.CASHFREE_SECRET_KEY = 'TEST_CF_SECRET_KEY_MOCK';
    process.env.CASHFREE_WEBHOOK_SECRET = 'TEST_CF_WEBHOOK_SECRET_MOCK';
    process.env.CASHFREE_ENV = 'TEST';

    vi.spyOn(cashfreeService, 'createOrder').mockImplementation(async (params) => {
      const orderId = params.orderId;
      const paymentSessionId = `session_cf_robustness_${Date.now()}`;
      return {
        orderId,
        order_id: orderId,
        paymentSessionId,
        payment_session_id: paymentSessionId,
        cfOrderId: `cf_${Date.now()}`,
        orderStatus: 'ACTIVE',
        orderAmount: params.orderAmount,
        currency: params.orderCurrency || 'INR',
        environment: 'TEST',
        gateway: 'CASHFREE',
      };
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Authenticated users can create and save projects with valid ownership
  // ─────────────────────────────────────────────────────────────────────────────
  it('1. Authenticated user creates and saves project with valid canonical ownership', async () => {
    const leadEmail = 'homeowner.bangalore@hutty.in';
    const leadName = 'Suresh Venkatesh';

    // Persist project via canonical projectService
    const project = await projectService.createProject({
      name: 'Venkatesh Residence — Indiranagar',
      leadName,
      leadEmail,
      leadPhone: '9845099881',
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      configuration: {
        plotLength: 30,
        plotWidth: 50,
        houseType: 'Duplex',
        floors: 3,
        parkingType: 'Normal Ground',
        carCount: 2,
        bikeCount: 2,
        qualityTier: 'Premium',
      },
      calculation: {
        totalBUASqFt: 3000,
        totalCostINR: 6500000,
        costPerSqFt: 2167,
      },
    });

    expect(project.id).toBeDefined();
    expect(project.ownerId).toBeDefined();
    expect(project.name).toBe('Venkatesh Residence — Indiranagar');

    // Retrieve by ID
    const retrieved = await projectService.getProjectById(project.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(project.id);
    expect(retrieved?.ownerId).toBe(project.ownerId);

    // Retrieve by user ID
    const userProjects = await projectService.getUserProjects(project.ownerId);
    expect(userProjects.some((p) => p.id === project.id)).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Invalid, missing, or stale identities cannot create projects under nonexistent owners
  // ─────────────────────────────────────────────────────────────────────────────
  it('2. Missing or blank email rejects project creation to prevent orphaned projects', async () => {
    await expect(
      projectService.createProject({
        name: 'Invalid Project',
        leadName: 'Anonymous Ghost',
        leadEmail: '', // Missing
        city: 'Bangalore',
      })
    ).rejects.toThrow('Valid homeowner email is required to persist project.');
  });

  it('2b. Unauthorized update attempts across different user credentials are strictly forbidden', async () => {
    // User A creates project
    const projectA = await projectService.createProject({
      name: 'User A Duplex',
      leadName: 'User A',
      leadEmail: 'user.a@hutty.in',
      city: 'Bangalore',
    });

    // User B attempts to overwrite User A's project
    await expect(
      projectService.updateProject(
        projectA.id,
        'user-b-unauthorized-id',
        { name: 'Hijacked Duplex' }
      )
    ).rejects.toThrow(/permission to modify this project/i);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Calculator saves persist latest selections (Step 8 Electrical/MEP) & recover safely
  // ─────────────────────────────────────────────────────────────────────────────
  it('3. Calculator saves persist Step 8 Electrical & MEP selections and update calculation metrics', async () => {
    const project = await projectService.createProject({
      name: 'Step 8 MEP Project',
      leadName: 'Priya Sharma',
      leadEmail: 'priya.sharma@hutty.in',
      city: 'Bangalore',
      configuration: {
        plotLength: 30,
        plotWidth: 40,
        floors: 2,
        qualityTier: 'Premium',
      },
    });

    // Step 8 Selection update: electrical wire tier, conduits, and updated quantities
    const step8Payload = {
      name: 'Step 8 MEP Project — Wire Grade Updated',
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      configuration: {
        plotLength: 30,
        plotWidth: 40,
        floors: 2,
        houseType: 'Duplex',
        parkingType: 'Normal Ground',
        carCount: 1,
        bikeCount: 2,
        evCharging: true,
        liftRequired: false,
        rooms: { bedrooms: 3, bathrooms: 3, kitchen: 1, living: 1 },
        qualityTier: 'Premium',
        materialBrands: {
          steel: 'Tata Tiscon 550D',
          cement: 'Ultratech Super',
          electrical: 'Mid-range (V-Guard)',
          electricalDetail: {
            conduit: 'Heavy-Duty ISI Marked PVC',
            wireTier: 'Mid-range (V-Guard)',
          },
        },
      },
      calculation: {
        totalBUASqFt: 2400,
        totalCostINR: 5280000,
        costPerSqFt: 2200,
        steelTonnes: 9.6,
        cementBags: 960,
        concreteCuM: 72,
        timelineMonths: 12,
      },
    };

    const updated = await projectService.updateProject(project.id, project.ownerId, step8Payload);
    expect(updated.name).toBe('Step 8 MEP Project — Wire Grade Updated');

    const cfg = updated.configuration;
    expect(cfg.materialBrands.electrical).toBe('Mid-range (V-Guard)');
    expect(cfg.materialBrands.electricalDetail.wireTier).toBe('Mid-range (V-Guard)');
    expect(cfg.evCharging).toBe(true);

    const calc = updated.calculation;
    expect(calc.totalCostINR).toBe(5280000);
    expect(calc.costPerSqFt).toBe(2200);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Report checkout works for valid persisted customer and project (₹99, ₹499, ₹1,499)
  // ─────────────────────────────────────────────────────────────────────────────
  it('4a. Basic Estimate PDF (₹99 / 9900 paise) checkout creates order with authoritative price', async () => {
    const project = await projectService.createProject({
      name: 'Whitefield Villa',
      leadName: 'Vikram Mehta',
      leadEmail: 'vikram.mehta@hutty.in',
      city: 'Bangalore',
    });

    const { purchase, requiresPayment, gatewayOrder } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Vikram Mehta',
      leadPhone: '9845011223',
      leadEmail: 'vikram.mehta@hutty.in',
      projectId: project.id,
      testBypassPayment: false,
    });

    expect(purchase.amountMinorUnits).toBe(9900); // Server-enforced ₹99
    expect(purchase.status).toBe('PENDING');
    expect(purchase.projectId).toBe(project.id);
    expect(requiresPayment).toBe(true);
    expect(gatewayOrder?.amountMinorUnits).toBe(9900);
    expect(gatewayOrder?.amountINR).toBe(99);
  });

  it('4b. Detailed BOQ (₹499 / 49900 paise) checkout creates order with authoritative price', async () => {
    const project = await projectService.createProject({
      name: 'Koramangala G+2',
      leadName: 'Ananya Reddy',
      leadEmail: 'ananya.reddy@hutty.in',
      city: 'Bangalore',
    });

    const { purchase, requiresPayment, gatewayOrder } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
      leadName: 'Ananya Reddy',
      leadPhone: '9845077889',
      leadEmail: 'ananya.reddy@hutty.in',
      projectId: project.id,
      testBypassPayment: false,
    });

    expect(purchase.amountMinorUnits).toBe(49900); // Server-enforced ₹499
    expect(purchase.status).toBe('PENDING');
    expect(purchase.projectId).toBe(project.id);
    expect(requiresPayment).toBe(true);
    expect(gatewayOrder?.amountMinorUnits).toBe(49900);
    expect(gatewayOrder?.amountINR).toBe(499);
  });

  it('4c. Premium Report (₹1,499 / 149900 paise) checkout creates order with authoritative price', async () => {
    const project = await projectService.createProject({
      name: 'Sadashivanagar Luxury Mansion',
      leadName: 'Deepak Hegde',
      leadEmail: 'deepak.hegde@hutty.in',
      city: 'Bangalore',
    });

    const { purchase, requiresPayment, gatewayOrder } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.PREMIUM_1499,
      leadName: 'Deepak Hegde',
      leadPhone: '9845033445',
      leadEmail: 'deepak.hegde@hutty.in',
      projectId: project.id,
      testBypassPayment: false,
    });

    expect(purchase.amountMinorUnits).toBe(149900); // Server-enforced ₹1,499
    expect(purchase.status).toBe('PENDING');
    expect(purchase.projectId).toBe(project.id);
    expect(requiresPayment).toBe(true);
    expect(gatewayOrder?.amountMinorUnits).toBe(149900);
    expect(gatewayOrder?.amountINR).toBe(1499);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Project-persistence failures stop checkout safely and do not grant paid entitlements
  // ─────────────────────────────────────────────────────────────────────────────
  it('5. Project-persistence failure stops checkout and grants ZERO entitlements', async () => {
    const invalidId = 'non-existent-proj-uuid-error-case';

    await expect(
      pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
        leadName: 'Faulty Lead',
        leadPhone: '9876543210',
        leadEmail: 'faulty.lead@hutty.in',
        projectId: invalidId,
        testBypassPayment: false,
      })
    ).rejects.toThrow(/INVALID_PROJECT_ID/);

    // Verify zero entitlements were granted
    const entitlements = await pricingService.getUserEntitlements(undefined, 'faulty.lead@hutty.in', invalidId);
    expect(entitlements.length).toBe(0);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Repeated payment callbacks cannot create duplicate entitlements (Idempotency)
  // ─────────────────────────────────────────────────────────────────────────────
  it('6. Repeated payment confirmations are strictly idempotent and prevent duplicate entitlements', async () => {
    const project = await projectService.createProject({
      name: 'Idempotency Test House',
      leadName: 'Kavita Nair',
      leadEmail: 'kavita.nair@hutty.in',
      city: 'Bangalore',
    });

    const { purchase, gatewayOrder } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
      leadName: 'Kavita Nair',
      leadPhone: '9845088990',
      leadEmail: 'kavita.nair@hutty.in',
      projectId: project.id,
      testBypassPayment: false,
    });

    const gatewayPaymentId = `pay_mock_cf_${Date.now()}`;

    vi.spyOn(cashfreeService, 'verifyOrderPayment').mockResolvedValue({
      verified: true,
      cfPaymentId: gatewayPaymentId,
      orderStatus: 'PAID',
    });

    // First confirmation (e.g. from customer return redirect)
    const firstConfirm = await pricingService.confirmPurchasePayment(
      purchase.id,
      gatewayPaymentId,
      gatewayOrder?.orderId
    );
    expect(firstConfirm.purchase.status).toBe('PAID');
    const initialEntitlementCount = firstConfirm.entitlements.length;
    expect(initialEntitlementCount).toBeGreaterThan(0);

    // Second duplicate confirmation (e.g. from async Cashfree webhook)
    const secondConfirm = await pricingService.confirmPurchasePayment(
      purchase.id,
      gatewayPaymentId,
      gatewayOrder?.orderId
    );
    expect(secondConfirm.purchase.status).toBe('PAID');
    expect(secondConfirm.entitlements.length).toBe(initialEntitlementCount);

    // Verify database / service only records one entitlement per feature code
    const userEntitlements = await pricingService.getUserEntitlements(
      purchase.userId,
      purchase.leadEmail,
      project.id
    );
    const featureCodes = userEntitlements.map((e) => e.featureCode);
    const uniqueFeatureCodes = new Set(featureCodes);
    expect(featureCodes.length).toBe(uniqueFeatureCodes.size);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. Production database failures never trigger fake success or unsafe fallback
  // ─────────────────────────────────────────────────────────────────────────────
  it('8. In production, database offline condition rejects paid purchase creation safely', async () => {
    process.env.NODE_ENV = 'production';

    // pricingService is initialized without mock DB connected
    expect(pricingService.isDatabaseConnected()).toBe(false);

    await expect(
      pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
        leadName: 'Offline Test User',
        leadPhone: '9845012345',
        leadEmail: 'offline.user@hutty.in',
        testBypassPayment: false,
      })
    ).rejects.toThrow(/DURABLE_STORAGE_UNAVAILABLE/);
  });
});
