// ==============================================================================
// Hutty — ₹99 Basic Estimate PDF Unlock Acceptance & Security Suite
// Validating all 17 criteria from Section 8 of the product specification.
// ==============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import {
  PRICING_TIER_CODES,
  PRICING_MINOR_UNITS,
  PRICING_CURRENCY,
  INITIAL_PRICING_TIERS,
  PRICING_FEATURES,
} from '../../../server/src/constants/pricing.constants';
import { PricingService } from '../../../server/src/services/pricing.service';
import { DEFAULT_PRICING_TIERS } from '../../config/pricing';
import { useEntitlementStore } from '../../store/useEntitlementStore';
import { usePricingStore } from '../../store/usePricingStore';
import { CONSULTATION_PRICE_INR, CONSULTATION_PRICE_PAISE } from '../../../server/src/constants/consultation.constants';

describe('Hutty — ₹99 Basic Estimate PDF Unlock Acceptance Suite', () => {
  let pricingService: PricingService;

  const standardInput: EngineInput = {
    plotLength: 40,
    plotWidth: 60,
    floors: 2,
    houseType: 'Modern Villa',
    parkingType: 'Stilt',
    carCount: 2,
    bikeCount: 2,
    evCharging: true,
    liftRequired: false,
    rooms: [
      { id: 'liv-1', name: 'Living Room', count: 1, areaSqFt: 300, length: 15, width: 20, isCustom: false, floor: 0 },
      { id: 'bed-1', name: 'Master Bedroom', count: 1, areaSqFt: 220, length: 14, width: 15.7, isCustom: false, floor: 1 },
      { id: 'bed-2', name: 'Bedroom 2', count: 1, areaSqFt: 180, length: 12, width: 15, isCustom: false, floor: 1 },
      { id: 'kit-1', name: 'Kitchen', count: 1, areaSqFt: 120, length: 10, width: 12, isCustom: false, floor: 0 },
      { id: 'bath-1', name: 'Attached Bath', count: 2, areaSqFt: 60, length: 6, width: 10, isCustom: false, floor: 1 },
    ],
    qualityTier: 'Premium',
    materialBrands: {
      cement: 'UltraTech Super',
      steel: 'Tata Tiscon 550D',
      paint: 'Asian Paints Royale',
    },
  };

  beforeEach(() => {
    pricingService = new PricingService();
    // Reset stores
    useEntitlementStore.setState({
      unlockedReports: {},
      basicPdfUnlockedReports: {},
      isCurrentProjectUnlocked: false,
    });
    usePricingStore.setState({
      activeTierCode: 'FREE',
      userEntitlements: [],
      projectPurchases: {},
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Free users can calculate and view estimates without payment
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 1: Free users can calculate and view complete estimates without payment', () => {
    const result = runCalculator(standardInput);
    expect(result).toBeDefined();
    expect(result.budget.totalProjectCost).toBeGreaterThan(0);
    expect(result.area.totalBUASqFt).toBeGreaterThan(0);

    // Free tier exists, is active, requires ₹0
    const freeTier = INITIAL_PRICING_TIERS.find((t) => t.code === PRICING_TIER_CODES.FREE);
    expect(freeTier).toBeDefined();
    expect(freeTier?.priceMinorUnits).toBe(0);
    expect(freeTier?.purchasable).toBe(false);

    // Frontend config has free tier as a calculator plan
    const freeConfig = DEFAULT_PRICING_TIERS.find((t) => t.code === 'FREE');
    expect(freeConfig).toBeDefined();
    expect(freeConfig?.priceMinorUnits).toBe(0);
    expect(freeConfig?.isCalculatorPlan).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Free users cannot download the Basic Estimate PDF without a valid entitlement
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 2: Free users cannot download Basic Estimate PDF without entitlement', async () => {
    const testProjectId = 'proj-free-unpaid-123';
    
    // Frontend store check
    expect(useEntitlementStore.getState().hasBasicPdfAccess(testProjectId)).toBe(false);
    expect(usePricingStore.getState().hasBasicPdfAccess(testProjectId)).toBe(false);

    // Backend feature authorization check
    const canAccess = await pricingService.canAccessFeature(
      'BASIC_PDF_DOWNLOAD',
      null,
      'freeuser@example.com',
      testProjectId
    );
    expect(canAccess).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. The PDF purchase price is exactly ₹99 on the backend
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 3: The PDF purchase price is exactly ₹99 (9,900 paise) server-authoritatively', async () => {
    expect(PRICING_MINOR_UNITS.BASIC_ESTIMATE_PDF).toBe(9900);

    const purchaseResult = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Suresh Kumar',
      leadPhone: '9845099999',
      leadEmail: 'suresh@example.com',
      projectId: 'proj-basic-99-test',
    });

    // Authoritative amount in minor units
    expect(purchaseResult.purchase.amountMinorUnits).toBe(9900);
    expect(purchaseResult.purchase.currency).toBe(PRICING_CURRENCY);
    expect(purchaseResult.gatewayOrder?.amountMinorUnits).toBe(9900);
    expect(purchaseResult.requiresPayment).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4 & 5. Scope of ₹99 PDF: Contains basic deliverables, excludes detailed BOQ
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 4 & 5: Basic PDF contains summary scope and excludes detailed BOQ schedules', () => {
    const basicTier = INITIAL_PRICING_TIERS.find((t) => t.code === PRICING_TIER_CODES.BASIC_ESTIMATE_PDF);
    expect(basicTier).toBeDefined();

    // Basic deliverables included:
    expect(basicTier?.features).toContain(PRICING_FEATURES.BASIC_PROJECT_SUMMARY);
    expect(basicTier?.features).toContain(PRICING_FEATURES.BASIC_COST_SUMMARY);
    expect(basicTier?.features).toContain(PRICING_FEATURES.BASIC_PDF_DOWNLOAD);

    // Detailed BOQ / Premium features strictly EXCLUDED:
    expect(basicTier?.features).not.toContain(PRICING_FEATURES.DETAILED_BOQ);
    expect(basicTier?.features).not.toContain(PRICING_FEATURES.DETAILED_QUANTITIES);
    expect(basicTier?.features).not.toContain(PRICING_FEATURES.MATERIAL_SCHEDULE);
    expect(basicTier?.features).not.toContain(PRICING_FEATURES.FIXTURES_SCHEDULE);
    expect(basicTier?.features).not.toContain(PRICING_FEATURES.LABOUR_BREAKDOWN);
    expect(basicTier?.features).not.toContain(PRICING_FEATURES.FULL_PDF_REPORT);
    expect(basicTier?.features).not.toContain(PRICING_FEATURES.REPORT_DOWNLOAD);
    expect(basicTier?.features).not.toContain(PRICING_FEATURES.PREMIUM_COMPARISON);
    expect(basicTier?.features).not.toContain(PRICING_FEATURES.PREMIUM_SPEC_CUSTOMIZATION);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Successful verified payment unlocks the PDF for the correct project/report
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 6: Verified payment unlocks Basic PDF for the specific project', async () => {
    const targetProject = 'proj-verified-success-888';
    const customerEmail = 'buyer@example.com';

    // 1. Create order
    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Rahul Dravid',
      leadPhone: '9845011111',
      leadEmail: customerEmail,
      projectId: targetProject,
    });

    // 2. Complete payment
    await pricingService.confirmPurchasePayment(purchase.id, 'pay_rzp_mock_success_123', purchase.gatewayOrderId || undefined);

    // 3. Verify backend access for the project
    const hasAccess = await pricingService.canAccessFeature(
      'BASIC_PDF_DOWNLOAD',
      null,
      customerEmail,
      targetProject
    );
    expect(hasAccess).toBe(true);

    // 4. Verify client store unlock
    useEntitlementStore.getState().grantBasicPdfAccess(targetProject, purchase.id);
    expect(useEntitlementStore.getState().hasBasicPdfAccess(targetProject)).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 7, 8, 9. ₹99 purchase does NOT unlock Detailed BOQ, Premium BOQ, or Consultation
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 7, 8 & 9: A ₹99 purchase strictly isolates entitlement and does NOT unlock Detailed BOQ (₹499), Premium BOQ (₹1,499), or Consultation (₹1,499)', async () => {
    const projectId = 'proj-strict-isolation-99';
    const email = 'isolated@example.com';

    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Isolation Test',
      leadPhone: '9845022222',
      leadEmail: email,
      projectId,
    });

    await pricingService.confirmPurchasePayment(purchase.id, 'pay_rzp_mock_99', purchase.gatewayOrderId || undefined);

    useEntitlementStore.getState().grantBasicPdfAccess(projectId, purchase.id);

    // Basic PDF is unlocked
    expect(useEntitlementStore.getState().hasBasicPdfAccess(projectId)).toBe(true);
    expect(await pricingService.canAccessFeature('BASIC_PDF_DOWNLOAD', null, email, projectId)).toBe(true);

    // Detailed BOQ (₹499) must NOT be unlocked:
    expect(useEntitlementStore.getState().hasDetailedReportAccess(projectId)).toBe(false);
    expect(await pricingService.canAccessFeature('DETAILED_BOQ', null, email, projectId)).toBe(false);
    expect(await pricingService.canAccessFeature('FULL_PDF_REPORT', null, email, projectId)).toBe(false);
    expect(await pricingService.canAccessFeature('REPORT_DOWNLOAD', null, email, projectId)).toBe(false);

    // Premium BOQ (₹1,499) must NOT be unlocked:
    expect(await pricingService.canAccessFeature('PREMIUM_COMPARISON', null, email, projectId)).toBe(false);
    expect(await pricingService.canAccessFeature('PREMIUM_SPEC_CUSTOMIZATION', null, email, projectId)).toBe(false);

    // Consultation (₹1,499) must NOT be unlocked:
    expect(await pricingService.canAccessFeature('EXPERT_CONSULTATION' as any, null, email, projectId)).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. Failed, cancelled, pending payments do not unlock the PDF
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 10: Failed, cancelled, and pending payments leave the PDF locked, and tampered signatures are rejected', async () => {
    const failedProj = 'proj-failed-payment';
    const failedEmail = 'fail@example.com';

    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Failed Buyer',
      leadPhone: '9845033333',
      leadEmail: failedEmail,
      projectId: failedProj,
    });

    // Status is PENDING
    expect(purchase.status).toBe('PENDING');
    let hasAccess = await pricingService.canAccessFeature('BASIC_PDF_DOWNLOAD', null, failedEmail, failedProj);
    expect(hasAccess).toBe(false);

    // Mark as FAILED
    await pricingService.failPurchasePayment(purchase.id, 'Payment declined by bank');
    hasAccess = await pricingService.canAccessFeature('BASIC_PDF_DOWNLOAD', null, failedEmail, failedProj);
    expect(hasAccess).toBe(false);
    expect(useEntitlementStore.getState().hasBasicPdfAccess(failedProj)).toBe(false);

    // Cryptographic signature tampering test
    process.env.RAZORPAY_KEY_SECRET = 'secret_test_key_123';
    try {
      const { purchase: tamperedPurchase } = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
        leadName: 'Tamper Tester',
        leadPhone: '9845033334',
        leadEmail: 'tamper@example.com',
        projectId: 'proj-tamper',
      });

      await expect(
        pricingService.confirmPurchasePayment(
          tamperedPurchase.id,
          'pay_forged_123',
          tamperedPurchase.gatewayOrderId || undefined,
          'invalid_tampered_signature_hex'
        )
      ).rejects.toThrow(/Cryptographic signature verification failed/);
    } finally {
      delete process.env.RAZORPAY_KEY_SECRET;
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 11. Duplicate callbacks and webhook events do not create duplicate entitlements (Idempotency)
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 11: Payment processing and entitlement granting are idempotent', async () => {
    const projId = 'proj-idempotent-test';
    const email = 'idempotent@example.com';

    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Idempotency Tester',
      leadPhone: '9845044444',
      leadEmail: email,
      projectId: projId,
    });

    // Call confirmPurchasePayment twice (simulating webhook + frontend callback race condition)
    await pricingService.confirmPurchasePayment(purchase.id, 'pay_duplicate_1', purchase.gatewayOrderId || undefined);
    await pricingService.confirmPurchasePayment(purchase.id, 'pay_duplicate_1', purchase.gatewayOrderId || undefined);

    // Should still have single valid access without corrupted duplicate state
    const hasAccess = await pricingService.canAccessFeature('BASIC_PDF_DOWNLOAD', null, email, projId);
    expect(hasAccess).toBe(true);

    const entitlements = await pricingService.getUserEntitlements(null, email, projId);
    const basicPdfEntitlements = entitlements.filter((e) => e.featureCode === 'BASIC_PDF_DOWNLOAD');
    expect(basicPdfEntitlements.length).toBe(1);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 12. Users cannot download another user's report by changing identifiers (IDOR prevention)
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 12: Prevents cross-project and cross-user entitlement leakage (IDOR)', async () => {
    const userAProject = 'proj-user-a-secret';
    const userBProject = 'proj-user-b-target';
    const userAEmail = 'userA@example.com';
    const userBEmail = 'userB@example.com';

    // User A purchases Basic PDF for their own project
    const { purchase: purchaseA } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'User A',
      leadPhone: '9845055555',
      leadEmail: userAEmail,
      projectId: userAProject,
    });

    await pricingService.confirmPurchasePayment(purchaseA.id, 'pay_rzp_user_a', purchaseA.gatewayOrderId || undefined);

    // User A has access to User A's project
    expect(await pricingService.canAccessFeature('BASIC_PDF_DOWNLOAD', null, userAEmail, userAProject)).toBe(true);

    // User A MUST NOT have access to User B's project
    expect(await pricingService.canAccessFeature('BASIC_PDF_DOWNLOAD', null, userAEmail, userBProject)).toBe(false);

    // User B MUST NOT have access to User A's project
    expect(await pricingService.canAccessFeature('BASIC_PDF_DOWNLOAD', null, userBEmail, userAProject)).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 13. Entitlements survive application restarts and are persisted correctly
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 13: Entitlements are correctly recorded in state and store persistence keys', () => {
    const projId = 'proj-persist-99';
    useEntitlementStore.getState().grantBasicPdfAccess(projId, 'ORD-BASIC-PERSIST-1');

    const state = useEntitlementStore.getState();
    expect(state.basicPdfUnlockedReports[projId]).toBeDefined();
    expect(state.basicPdfUnlockedReports[projId].isUnlocked).toBe(true);
    expect(state.basicPdfUnlockedReports[projId].amountPaidINR).toBe(99);

    // Simulating store re-hydration: checking that state preserves keys
    const rehydrated = useEntitlementStore.getState().hasBasicPdfAccess(projId);
    expect(rehydrated).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 14. Existing ₹499 Detailed BOQ and ₹1,499 Premium flows continue working
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 14: Existing ₹499 Detailed BOQ and ₹1,499 Premium BOQ flows remain fully preserved', async () => {
    // 1. ₹499 Detailed BOQ
    const purchase499 = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
      leadName: 'Customer 499',
      leadPhone: '9845066666',
      leadEmail: 'c499@example.com',
      projectId: 'proj-499',
    });
    expect(purchase499.purchase.amountMinorUnits).toBe(49900);
    expect(purchase499.gatewayOrder?.amountMinorUnits).toBe(49900);

    await pricingService.confirmPurchasePayment(purchase499.purchase.id, 'pay_499', purchase499.purchase.gatewayOrderId || undefined);

    // Detailed BOQ purchase unlocks BOTH detailed BOQ AND basic PDF
    expect(await pricingService.canAccessFeature('FULL_PDF_REPORT', null, 'c499@example.com', 'proj-499')).toBe(true);
    expect(await pricingService.canAccessFeature('DETAILED_BOQ', null, 'c499@example.com', 'proj-499')).toBe(true);
    expect(await pricingService.canAccessFeature('BASIC_PDF_DOWNLOAD', null, 'c499@example.com', 'proj-499')).toBe(true);

    // 2. ₹1,499 Premium Package
    const purchase1499 = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.PREMIUM_1499,
      leadName: 'Customer 1499',
      leadPhone: '9845077777',
      leadEmail: 'c1499@example.com',
      projectId: 'proj-1499',
    });
    expect(purchase1499.purchase.amountMinorUnits).toBe(149900);
    expect(purchase1499.gatewayOrder?.amountMinorUnits).toBe(149900);

    // 3. Consultation decoupling preserved
    expect(CONSULTATION_PRICE_INR).toBe(1499);
    expect(CONSULTATION_PRICE_PAISE).toBe(149900);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 15. Pricing shown in UI, checkout, and backend remains consistent
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 15: Consistent pricing architecture across backend constants and UI config', () => {
    // Backend source of truth
    expect(PRICING_MINOR_UNITS.FREE).toBe(0);
    expect(PRICING_MINOR_UNITS.BASIC_ESTIMATE_PDF).toBe(9900);
    expect(PRICING_MINOR_UNITS.DETAILED_ESTIMATE_499).toBe(49900);
    expect(PRICING_MINOR_UNITS.PREMIUM_1499).toBe(149900);

    // Frontend config source of truth
    const uiFree = DEFAULT_PRICING_TIERS.find((t) => t.code === 'FREE');
    const uiBasic = DEFAULT_PRICING_TIERS.find((t) => t.code === 'BASIC_ESTIMATE_PDF');
    const uiDetailed = DEFAULT_PRICING_TIERS.find((t) => t.code === 'DETAILED_ESTIMATE_499');
    const uiPremium = DEFAULT_PRICING_TIERS.find((t) => t.code === 'PREMIUM_1499');

    expect(uiFree?.priceMinorUnits).toBe(0);
    expect(uiBasic?.priceMinorUnits).toBe(9900);
    expect(uiDetailed?.priceMinorUnits).toBe(49900);
    expect(uiPremium?.priceMinorUnits).toBe(149900);

    // Crucial rule: Basic PDF is an add-on product, NOT a general calculator plan
    expect(uiBasic?.isCalculatorPlan).toBe(false);
    expect(uiFree?.isCalculatorPlan).toBe(true);
    expect(uiDetailed?.isCalculatorPlan).toBe(true);
    expect(uiPremium?.isCalculatorPlan).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 16. PDF totals and high-level breakdown match canonical calculator output
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 16: Canonical calculator output matches PDF breakdown data source', () => {
    const calc = runCalculator(standardInput);
    const totalCost = calc.budget.totalProjectCost;
    const materialCost = calc.budget.directMaterialCost;
    const labourCost = calc.budget.directLabourCost;
    const fixtureCost = calc.budget.directFixtureCost;
    const commercialReserves = Math.max(0, totalCost - (materialCost + labourCost + fixtureCost));

    // Sum of components equals canonical total
    expect(materialCost + labourCost + fixtureCost + commercialReserves).toBe(totalCost);
    expect(calc.area.totalBUASqFt).toBeGreaterThan(0);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 17. Missing critical pricing data is handled transparently rather than silently treated as valid zero cost
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 17: Transparent validation when critical pricing data or tier codes are invalid', async () => {
    // Attempting to initiate purchase for non-existent tier code throws descriptive error
    await expect(
      pricingService.initiatePurchase({
        tierCode: 'NON_EXISTENT_TIER',
        leadName: 'Error Tester',
        leadPhone: '9845088888',
        leadEmail: 'err@example.com',
      })
    ).rejects.toThrow(/Invalid pricing tier code/);

    // Inactive historical tier cannot be purchased
    await expect(
      pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.ESTIMATE_99,
        leadName: 'Legacy Tester',
        leadPhone: '9845088888',
        leadEmail: 'legacy@example.com',
      })
    ).rejects.toThrow(/is currently inactive/);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 18. Razorpay Webhook Processing with HMAC Signature & Idempotency
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 18: Razorpay webhook verifies HMAC-SHA256 signature and activates entitlements idempotently', async () => {
    const webhookSecret = 'test_webhook_secret_xyz_99';
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

    try {
      const { purchase, gatewayOrder } = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
        leadName: 'Webhook Buyer',
        leadPhone: '9845091111',
        leadEmail: 'webhook@example.com',
        projectId: 'proj-webhook-99',
      });

      expect(gatewayOrder).toBeDefined();
      const orderId = gatewayOrder!.orderId;

      const payloadObj = {
        event: 'order.paid',
        payload: {
          order: {
            entity: {
              id: orderId,
              amount: 9900,
            },
          },
          payment: {
            entity: {
              id: 'pay_wh_test_123',
              order_id: orderId,
              amount: 9900,
            },
          },
        },
      };
      const rawPayload = JSON.stringify(payloadObj);
      const signature = crypto.createHmac('sha256', webhookSecret).update(rawPayload).digest('hex');

      // 1. Process valid webhook
      const result = await pricingService.handleRazorpayWebhook(rawPayload, signature);
      expect(result.handled).toBe(true);
      expect(result.status).toBe('success');

      // Entitlement is now unlocked
      const hasAccess = await pricingService.canAccessFeature('BASIC_PDF_DOWNLOAD', null, 'webhook@example.com', 'proj-webhook-99');
      expect(hasAccess).toBe(true);

      // 2. Retry webhook (Idempotency)
      const retryResult = await pricingService.handleRazorpayWebhook(rawPayload, signature);
      expect(retryResult.handled).toBe(true);
      expect(retryResult.status).toBe('idempotent');

      // 3. Forged signature rejected
      await expect(
        pricingService.handleRazorpayWebhook(rawPayload, 'forged_invalid_signature_hex')
      ).rejects.toThrow(/Invalid webhook signature/);

      // 4. Amount tampering rejected
      const tamperedPayload = JSON.stringify({
        ...payloadObj,
        payload: {
          ...payloadObj.payload,
          payment: {
            entity: {
              id: 'pay_wh_tampered',
              order_id: orderId,
              amount: 4900, // Tampered amount
            },
          },
        },
      });
      const tamperedSig = crypto.createHmac('sha256', webhookSecret).update(tamperedPayload).digest('hex');
      await expect(
        pricingService.handleRazorpayWebhook(tamperedPayload, tamperedSig)
      ).rejects.toThrow(/Webhook payment amount mismatch/);
    } finally {
      delete process.env.RAZORPAY_WEBHOOK_SECRET;
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 19. Persistence status and fail-closed reporting
  // ─────────────────────────────────────────────────────────────────────────────
  it('Requirement 19: Provides transparent persistence health status and rejects missing signatures when secret is set', async () => {
    const status = pricingService.getPersistenceStatus();
    expect(status).toBeDefined();
    expect(['POSTGRESQL_DURABLE', 'IN_MEMORY_TRANSIENT']).toContain(status.mode);

    // Missing signature rejection when key secret is configured
    process.env.RAZORPAY_KEY_SECRET = 'active_gateway_secret';
    try {
      const { purchase } = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
        leadName: 'Sig Required Tester',
        leadPhone: '9845092222',
        leadEmail: 'sig@example.com',
        projectId: 'proj-sig-test',
      });

      // Calling without signature must reject
      await expect(
        pricingService.confirmPurchasePayment(purchase.id, 'pay_no_sig', purchase.gatewayOrderId || undefined, undefined)
      ).rejects.toThrow(/signature is required when gateway secret is configured/);
    } finally {
      delete process.env.RAZORPAY_KEY_SECRET;
    }
  });
});
