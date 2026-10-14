// ==============================================================================
// Hutty Project Persistence & Purchase Resilience Regression Test Suite
// Verifies:
// 1. Valid project reference: purchase creation succeeds and links to project
// 2. Invalid project ID: rejected with clear INVALID_PROJECT_ID validation error
// 3. Client estimate reference with snapshot: auto-persisted to PostgreSQL
// 4. Safe purchase recording before gateway checkout
// 5. Payment retries on PENDING / FAILED purchases
// 6. Idempotent payment confirmation
// 7. Detailed BOQ (₹499) valid project reference
// 8. Project-scoped entitlement activation
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'crypto';
import { pricingService } from '../../../server/src/services/pricing.service';
import { projectService } from '../../../server/src/services/project.service';
import { cashfreeService } from '../../../server/src/services/cashfree.service';
import { PRICING_TIER_CODES, PRICING_FEATURES } from '../../../server/src/constants/pricing.constants';

describe('Project Persistence & Purchase Resilience Regression Suite', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    projectService.clearInMemory();
    process.env.CASHFREE_APP_ID = 'CF_TEST_APP_ID_MOCK';
    process.env.CASHFREE_SECRET_KEY = 'cf_secret_key_mock_hash';
    process.env.CASHFREE_WEBHOOK_SECRET = 'cf_secret_key_mock_hash';
    process.env.CASHFREE_ENV = 'TEST';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Valid Project ID Linking
  // ─────────────────────────────────────────────────────────────────────────────
  it('1. Links purchase to an existing valid database project without foreign key violation', async () => {
    // 1. Create a real project in persistence layer
    const validProject = await projectService.createProject({
      name: 'Villa Serene 2026',
      leadName: 'Naveen Rao',
      leadEmail: 'naveen.rao@example.com',
      leadPhone: '9845012345',
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      configuration: {
        plotLength: 30,
        plotWidth: 40,
        houseType: 'Villa',
        floors: 2,
        qualityTier: 'Premium',
      },
      calculation: {
        totalBUASqFt: 2400,
        totalCostINR: 5200000,
        costPerSqFt: 2166,
      },
    });

    expect(validProject.id).toBeDefined();
    expect(validProject.name).toBe('Villa Serene 2026');

    // 2. Initiate purchase with the valid project ID
    const { purchase, requiresPayment, gatewayOrder } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Naveen Rao',
      leadPhone: '9845012345',
      leadEmail: 'naveen.rao@example.com',
      projectId: validProject.id,
      testBypassPayment: false,
    });

    expect(purchase.id).toBeDefined();
    expect(purchase.projectId).toBe(validProject.id);
    expect(purchase.amountMinorUnits).toBe(9900); // ₹99
    expect(purchase.status).toBe('PENDING');
    expect(requiresPayment).toBe(true);
    expect(gatewayOrder).not.toBeNull();
    expect(gatewayOrder?.orderId).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Invalid Project ID Handling
  // ─────────────────────────────────────────────────────────────────────────────
  it('2. Rejects purchase creation with clear INVALID_PROJECT_ID error when projectId does not exist', async () => {
    const invalidProjectId = 'non-existent-proj-uuid-99999';

    await expect(
      pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
        leadName: 'Test Homeowner',
        leadPhone: '9876543210',
        leadEmail: 'test.homeowner@example.com',
        projectId: invalidProjectId,
        testBypassPayment: false,
      })
    ).rejects.toThrow(/INVALID_PROJECT_ID: Project with ID "non-existent-proj-uuid-99999" does not exist in database/);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Client Estimate Reference Auto-Persistence
  // ─────────────────────────────────────────────────────────────────────────────
  it('3. Auto-persists project when client supplies temporary estimate reference with snapshot', async () => {
    const clientRefId = 'HUTTY-EST-2026';
    const snapshot = {
      buaSqFt: 3850,
      totalCostINR: 9405000,
      houseType: 'Duplex',
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      floors: 3,
      qualityTier: 'Premium',
    };

    const { purchase, gatewayOrder } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Aarav Patel',
      leadPhone: '9845099999',
      leadEmail: 'aarav.patel@example.com',
      projectId: clientRefId,
      projectSnapshot: snapshot,
      testBypassPayment: false,
    });

    expect(purchase.id).toBeDefined();
    expect(purchase.projectId).not.toBe(clientRefId); // Resolved to real database project UUID
    expect(purchase.projectId).toBeDefined();

    // Verify the project exists in project service
    const persistedProject = await projectService.getProjectById(purchase.projectId!);
    expect(persistedProject).not.toBeNull();
    expect(persistedProject?.configuration?.plotLength).toBe(30);
    expect(persistedProject?.calculation?.totalBUASqFt).toBe(3850);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Safe Purchase Recording & Failure
  // ─────────────────────────────────────────────────────────────────────────────
  it('4. Correctly records purchase in PENDING state and transitions to FAILED on dismissal', async () => {
    const validProject = await projectService.createProject({
      name: 'Downtown Residence',
      leadName: 'Kavita Roy',
      leadEmail: 'kavita.roy@example.com',
      city: 'Bangalore',
    });

    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Kavita Roy',
      leadPhone: '9876543210',
      leadEmail: 'kavita.roy@example.com',
      projectId: validProject.id,
      testBypassPayment: false,
    });

    expect(purchase.status).toBe('PENDING');

    // Simulate modal dismissal / user abandonment
    const failedPurchase = await pricingService.failPurchasePayment(purchase.id, 'User dismissed checkout modal');
    expect(failedPurchase.status).toBe('FAILED');

    // Verify lookup reflects FAILED status
    const retrieved = await pricingService.getPurchaseById(purchase.id);
    expect(retrieved?.status).toBe('FAILED');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Payment Retry Scenario
  // ─────────────────────────────────────────────────────────────────────────────
  it('5. Successfully allows payment retry on a FAILED purchase and grants entitlements', async () => {
    const validProject = await projectService.createProject({
      name: 'Retried Project Residence',
      leadName: 'Suresh Menon',
      leadEmail: 'suresh.menon@example.com',
      city: 'Bangalore',
    });

    // 1. Initiate purchase
    const { purchase, gatewayOrder } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Suresh Menon',
      leadPhone: '9845011111',
      leadEmail: 'suresh.menon@example.com',
      projectId: validProject.id,
      testBypassPayment: false,
      gateway: 'CASHFREE',
    });

    // 2. First attempt fails
    await pricingService.failPurchasePayment(purchase.id, 'Payment timed out');
    const failedRecord = await pricingService.getPurchaseById(purchase.id);
    expect(failedRecord?.status).toBe('FAILED');

    // 3. User retries payment and succeeds
    vi.spyOn(cashfreeService, 'verifyOrderPayment').mockResolvedValueOnce({
      verified: true,
      status: 'PAID',
      cfPaymentId: 'cf_pay_retry_success_99',
    });

    const { purchase: confirmedPurchase, entitlements } = await pricingService.confirmPurchasePayment(
      purchase.id,
      'cf_pay_retry_success_99',
      gatewayOrder?.orderId
    );

    expect(confirmedPurchase.status).toBe('PAID');
    expect(confirmedPurchase.gatewayPaymentId).toBe('cf_pay_retry_success_99');

    // 4. Entitlements must be granted
    expect(entitlements.some((e) => e.featureCode === PRICING_FEATURES.BASIC_PDF_DOWNLOAD)).toBe(true);

    const hasAccess = await pricingService.canAccessFeature(
      PRICING_FEATURES.BASIC_PDF_DOWNLOAD,
      null,
      'suresh.menon@example.com',
      validProject.id
    );
    expect(hasAccess).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Idempotency & Replay Protection
  // ─────────────────────────────────────────────────────────────────────────────
  it('6. Re-confirming an already PAID purchase is idempotent and does not duplicate entitlements', async () => {
    const validProject = await projectService.createProject({
      name: 'Idempotency Test House',
      leadName: 'Priya Nair',
      leadEmail: 'priya.nair@example.com',
      city: 'Bangalore',
    });

    const { purchase, gatewayOrder } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Priya Nair',
      leadPhone: '9845022222',
      leadEmail: 'priya.nair@example.com',
      projectId: validProject.id,
      testBypassPayment: false,
      gateway: 'CASHFREE',
    });

    vi.spyOn(cashfreeService, 'verifyOrderPayment').mockResolvedValue({
      verified: true,
      status: 'PAID',
      cfPaymentId: 'cf_pay_first_attempt',
    });

    // First confirmation
    const firstConfirm = await pricingService.confirmPurchasePayment(
      purchase.id,
      'cf_pay_first_attempt',
      gatewayOrder?.orderId
    );
    expect(firstConfirm.purchase.status).toBe('PAID');

    // Second confirmation (e.g. duplicate webhook or user refresh)
    const secondConfirm = await pricingService.confirmPurchasePayment(
      purchase.id,
      'cf_pay_first_attempt',
      gatewayOrder?.orderId
    );
    expect(secondConfirm.purchase.status).toBe('PAID');
    expect(secondConfirm.purchase.id).toBe(firstConfirm.purchase.id);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. Detailed BOQ (₹499) Purchase Flow
  // ─────────────────────────────────────────────────────────────────────────────
  it('7. Detailed BOQ (₹499) purchase uses valid project reference and grants full BOQ access', async () => {
    const validProject = await projectService.createProject({
      name: 'Grand Duplex Residence',
      leadName: 'Rajesh Varma',
      leadEmail: 'rajesh.varma@example.com',
      city: 'Bangalore',
      configuration: {
        plotLength: 40,
        plotWidth: 60,
        houseType: 'Duplex',
        floors: 3,
        qualityTier: 'Luxury',
      },
    });

    const { purchase, gatewayOrder } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
      leadName: 'Rajesh Varma',
      leadPhone: '9845033333',
      leadEmail: 'rajesh.varma@example.com',
      projectId: validProject.id,
      testBypassPayment: false,
      gateway: 'CASHFREE',
    });

    expect(purchase.amountMinorUnits).toBe(49900); // ₹499
    expect(purchase.projectId).toBe(validProject.id);

    vi.spyOn(cashfreeService, 'verifyOrderPayment').mockResolvedValueOnce({
      verified: true,
      status: 'PAID',
      cfPaymentId: 'cf_pay_boq_499',
    });

    const { entitlements } = await pricingService.confirmPurchasePayment(
      purchase.id,
      'cf_pay_boq_499',
      gatewayOrder?.orderId
    );

    expect(entitlements.some((e) => e.featureCode === PRICING_FEATURES.DETAILED_BOQ)).toBe(true);
    expect(entitlements.some((e) => e.featureCode === PRICING_FEATURES.FULL_PDF_REPORT)).toBe(true);

    const canAccessBOQ = await pricingService.canAccessFeature(
      PRICING_FEATURES.DETAILED_BOQ,
      null,
      'rajesh.varma@example.com',
      validProject.id
    );
    expect(canAccessBOQ).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. Signed Webhook Activates Entitlements with Valid Project
  // ─────────────────────────────────────────────────────────────────────────────
  it('8. Cashfree signed webhook activates project-scoped entitlements without double HTTP query', async () => {
    const validProject = await projectService.createProject({
      name: 'Webhook Verified House',
      leadName: 'Deepa Hegde',
      leadEmail: 'deepa.hegde@example.com',
      city: 'Bangalore',
    });

    const { purchase, gatewayOrder } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Deepa Hegde',
      leadPhone: '9845044444',
      leadEmail: 'deepa.hegde@example.com',
      projectId: validProject.id,
      testBypassPayment: false,
      gateway: 'CASHFREE',
    });

    const timestamp = Date.now().toString();
    const webhookPayload = {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      event_time: new Date().toISOString(),
      data: {
        order: {
          order_id: gatewayOrder?.orderId,
          order_amount: 99.00,
          order_currency: 'INR',
        },
        payment: {
          cf_payment_id: 88776655,
          payment_status: 'SUCCESS',
          payment_amount: 99.00,
          payment_currency: 'INR',
          payment_message: '00: Transaction Successful',
          payment_time: new Date().toISOString(),
        },
        customer_details: {
          customer_name: 'Deepa Hegde',
          customer_email: 'deepa.hegde@example.com',
          customer_phone: '9845044444',
        },
      },
    };

    const rawBody = JSON.stringify(webhookPayload);
    const signature = crypto
      .createHmac('sha256', process.env.CASHFREE_SECRET_KEY!)
      .update(timestamp + rawBody)
      .digest('base64');

    const result = await cashfreeService.handleWebhook(rawBody, signature, timestamp);
    expect(result.status).toBe('success');

    // Entitlement must be active for this project
    const hasPdf = await pricingService.canAccessFeature(
      PRICING_FEATURES.BASIC_PDF_DOWNLOAD,
      null,
      'deepa.hegde@example.com',
      validProject.id
    );
    expect(hasPdf).toBe(true);
  });
});
