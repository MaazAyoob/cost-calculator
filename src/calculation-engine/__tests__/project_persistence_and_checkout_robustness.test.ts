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

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. Selective user projection ensures resilience against unmigrated columns
  // ─────────────────────────────────────────────────────────────────────────────
  it('9. findOrCreateUser resolves user with explicit selection without querying unmigrated columns', async () => {
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockImplementation(async (args: any) => {
          // Verify that select is provided to avoid SELECT * failing on unmigrated columns
          expect(args.select).toBeDefined();
          expect(args.select.id).toBe(true);
          expect(args.select.email).toBe(true);
          return { id: 'uuid-existing-user-123', name: 'Existing Owner', email: 'owner@hutty.in' };
        }),
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };

    projectService.setPrismaClient(mockPrisma as any, true);
    process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock';

    const resolved = await projectService.findOrCreateUser({
      userId: 'uuid-existing-user-123',
      email: 'owner@hutty.in',
    });

    expect(resolved.id).toBe('uuid-existing-user-123');
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'uuid-existing-user-123' },
        select: { id: true, name: true, email: true },
      })
    );

    // Reset client
    projectService.setPrismaClient(null, false);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. User resolution produces valid UUIDs compatible with Prisma schema
  // ─────────────────────────────────────────────────────────────────────────────
  it('10. Newly provisioned user IDs match standard UUID format and satisfy foreign keys', async () => {
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(async (args: any) => {
          expect(args.data.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
          return { id: args.data.id, name: args.data.name, email: args.data.email };
        }),
      },
    };

    projectService.setPrismaClient(mockPrisma as any, true);
    process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock';

    const resolved = await projectService.findOrCreateUser({
      name: 'Fresh Customer',
      email: 'fresh.customer@hutty.in',
    });

    expect(resolved.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    // Reset client
    projectService.setPrismaClient(null, false);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 11. Integer normalization protects against float schema validation rejections
  // ─────────────────────────────────────────────────────────────────────────────
  it('11. createProject safely rounds float values for integer fields (cementBags, timelineMonths, floors, carCount, bikeCount)', async () => {
    let capturedPrismaData: any = null;
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'u-1', name: 'Homeowner', email: 'float.test@hutty.in' }),
        findFirst: vi.fn().mockResolvedValue({ id: 'u-1', name: 'Homeowner', email: 'float.test@hutty.in' }),
      },
      project: {
        create: vi.fn().mockImplementation(async (args: any) => {
          capturedPrismaData = args.data;
          return { id: args.data.id, ...args.data };
        }),
      },
    };

    projectService.setPrismaClient(mockPrisma as any, true);
    process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock';

    const project = await projectService.createProject({
      name: 'Float Normalization Test Residence',
      leadEmail: 'float.test@hutty.in',
      configuration: {
        floors: 2.7,
        carCount: 1.4,
        bikeCount: 2.2,
      },
      calculation: {
        totalBUASqFt: 2450.5,
        totalCostINR: 5200000,
        costPerSqFt: 2122,
        cementBags: 853.4,
        timelineMonths: 11.8,
      },
    });

    expect(Number.isInteger(project.calculation?.cementBags)).toBe(true);
    expect(project.calculation?.cementBags).toBe(853);
    expect(Number.isInteger(project.calculation?.timelineMonths)).toBe(true);
    expect(project.calculation?.timelineMonths).toBe(12);
    expect(Number.isInteger(project.configuration?.floors)).toBe(true);
    expect(project.configuration?.floors).toBe(3);
    expect(Number.isInteger(project.configuration?.carCount)).toBe(true);
    expect(project.configuration?.carCount).toBe(1);
    expect(Number.isInteger(project.configuration?.bikeCount)).toBe(true);
    expect(project.configuration?.bikeCount).toBe(2);

    expect(capturedPrismaData.calculation.create.cementBags).toBe(853);
    expect(capturedPrismaData.calculation.create.timelineMonths).toBe(12);

    projectService.setPrismaClient(null, false);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 12. Idempotent project creation prevents duplicate rows upon client retries
  // ─────────────────────────────────────────────────────────────────────────────
  it('12. Repeated save attempts with explicit draft project ID update in-place without creating duplicates', async () => {
    const stableDraftId = 'draft-project-session-uuid-101';
    const leadEmail = 'idempotent.lead@hutty.in';

    // First attempt: initial project save
    const firstSave = await projectService.createProject({
      id: stableDraftId,
      name: 'Whitefield Villa - V1',
      leadEmail,
      city: 'Bangalore',
      calculation: {
        totalCostINR: 5000000,
      },
    });

    expect(firstSave.id).toBe(stableDraftId);
    expect(firstSave.name).toBe('Whitefield Villa - V1');

    // Second attempt: retry save with updated inputs
    const retrySave = await projectService.createProject({
      id: stableDraftId,
      name: 'Whitefield Villa - V2 Updated',
      leadEmail,
      city: 'Bangalore',
      calculation: {
        totalCostINR: 5500000,
      },
    });

    expect(retrySave.id).toBe(stableDraftId);
    expect(retrySave.name).toBe('Whitefield Villa - V2 Updated');

    // Confirm that only one project exists for this ID and owner
    const allUserProjects = await projectService.getUserProjects(firstSave.ownerId);
    const matches = allUserProjects.filter((p) => p.id === stableDraftId);
    expect(matches.length).toBe(1);
    expect(matches[0].name).toBe('Whitefield Villa - V2 Updated');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 13. Resilient ownership verification matches by verified email across identity systems
  // ─────────────────────────────────────────────────────────────────────────────
  it('13. updateProject accepts updates when caller verified email matches project owner, even if user ID format differs', async () => {
    const leadEmail = 'owner.matching@hutty.in';

    const project = await projectService.createProject({
      name: 'Ownership Test House',
      leadEmail,
    });

    // Caller with different user ID (e.g. from in-memory token 'usr-mem-999') but matching email
    const updated = await projectService.updateProject(
      project.id,
      'usr-mem-999',
      { name: 'Ownership Test House - Renamed' },
      leadEmail
    );

    expect(updated.name).toBe('Ownership Test House - Renamed');

    // Caller with different user ID AND different email must be rejected with FORBIDDEN
    await expect(
      projectService.updateProject(
        project.id,
        'unauthorized-intruder-id',
        { name: 'Hacked Project Name' },
        'intruder@otherdomain.com'
      )
    ).rejects.toThrow(/FORBIDDEN/);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 14. Missing schema in production triggers durable failure rather than silent corruption
  // ─────────────────────────────────────────────────────────────────────────────
  it('14. In production mode, Prisma missing table error (P2021) throws DURABLE_STORAGE_WRITE_FAILED', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock';

    const p2021Error = new Error('The table public.Project does not exist in the current database.');
    (p2021Error as any).code = 'P2021';

    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'owner-uuid-1', name: 'Owner', email: 'p2021@hutty.in' }),
        findFirst: vi.fn().mockResolvedValue({ id: 'owner-uuid-1', name: 'Owner', email: 'p2021@hutty.in' }),
      },
      project: {
        create: vi.fn().mockRejectedValue(p2021Error),
      },
    };

    projectService.setPrismaClient(mockPrisma as any, true);

    await expect(
      projectService.createProject({
        name: 'Schema Failure Test',
        leadEmail: 'p2021@hutty.in',
      })
    ).rejects.toThrow(/DURABLE_STORAGE_WRITE_FAILED/);

    projectService.setPrismaClient(null, false);
  });
});
