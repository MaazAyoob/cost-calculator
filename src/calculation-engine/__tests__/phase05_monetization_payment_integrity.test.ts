// ==============================================================================
// HUTTY 3.2 — PHASE 05: MONETIZATION, PAYMENT INTEGRITY & PAID REPORT ENTITLEMENT
// Comprehensive validation of the locked ₹199 Complete Construction Report commercial model:
// 1. Single paid report price authority (19,900 paise / ₹199).
// 2. Gateway amount resolution (Cashfree 199 INR, Razorpay 19,900 paise).
// 3. Client tampering immunity (frontend amounts ignored).
// 4. Consultation fee decoupling (strictly ₹1,499 / 149,900 paise).
// 5. Server-authoritative payment verification & state machine (PENDING -> PAID / FAILED).
// 6. Entitlement security & server download gate enforcement.
// 7. Idempotent webhook & payment processing.
// 8. Guest purchase & order reference recovery.
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { pricingService } from '../../../server/src/services/pricing.service';
import { cashfreeService } from '../../../server/src/services/cashfree.service';
import {
  PRICING_TIER_CODES,
  PRICING_MINOR_UNITS,
  PRICING_FEATURES,
} from '../../../server/src/constants/pricing.constants';
import { CONSULTATION_PRICE_PAISE, CONSULTATION_PRICE_INR } from '../../../server/src/constants/consultation.constants';
import { formatPaiseToINR } from '../../config/pricing';

describe('HUTTY 3.2 — PHASE 05: Monetization & Payment Integrity Suite', () => {
  const originalEnv = { ...process.env };
  const mockAppId = 'CF_TEST_APP_ID_MOCK_2026';
  const mockSecretKey = 'cf_secret_key_mock_secure_hash_2026';

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.CASHFREE_APP_ID = mockAppId;
    process.env.CASHFREE_SECRET_KEY = mockSecretKey;
    process.env.CASHFREE_WEBHOOK_SECRET = mockSecretKey;
    process.env.CASHFREE_ENV = 'TEST';

    vi.spyOn(cashfreeService, 'createOrder').mockImplementation(async (params) => {
      const orderId = params.orderId;
      const paymentSessionId = `session_cf_valid_sandbox_${Date.now()}`;
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

    vi.spyOn(cashfreeService, 'verifyOrderPayment').mockImplementation(async (orderId, expectedAmount) => {
      return {
        orderId,
        paymentStatus: 'SUCCESS',
        cfPaymentId: `cf_pay_mock_${Date.now()}`,
        amount: expectedAmount,
        currency: 'INR',
        paymentMethod: 'UPI',
        verified: true,
      };
    });

    pricingService.clearInMemory();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 1. LOCKED COMMERCIAL MODEL & PRICE AUTHORITY
  // ═════════════════════════════════════════════════════════════════════════
  describe('1. Single Paid Report Product & Pricing Authority', () => {
    it('1.1 Complete Report resolves authoritatively to 19,900 paise (₹199)', async () => {
      expect(PRICING_MINOR_UNITS.COMPLETE_REPORT_199).toBe(19900);
      expect(PRICING_MINOR_UNITS.DETAILED_ESTIMATE_499).toBe(19900);

      const purchase = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.COMPLETE_REPORT_199,
        leadName: 'Rahul Dravid',
        leadPhone: '9845012345',
        leadEmail: 'rahul@dravid.in',
      });

      expect(purchase.purchase.amountMinorUnits).toBe(19900);
      expect(purchase.requiresPayment).toBe(true);
      expect(formatPaiseToINR(purchase.purchase.amountMinorUnits)).toBe('₹199');
    });

    it('1.2 Legacy tier code DETAILED_ESTIMATE_499 is mapped to 19,900 paise (₹199)', async () => {
      const purchase = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
        leadName: 'Anil Kumble',
        leadPhone: '9845054321',
        leadEmail: 'anil@kumble.in',
      });

      expect(purchase.purchase.amountMinorUnits).toBe(19900);
      expect(purchase.gatewayOrder?.amountMinorUnits).toBe(19900);
    });

    it('1.3 Cashfree order amount is exactly 199 INR and Razorpay is 19,900 paise', async () => {
      // Cashfree gateway
      const cfPurchase = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.COMPLETE_REPORT_199,
        leadName: 'Venkatesh Prasad',
        leadPhone: '9845011223',
        leadEmail: 'venky@prasad.in',
        gateway: 'CASHFREE',
      });

      expect(cfPurchase.purchase.gateway).toBe('CASHFREE');
      expect(cfPurchase.gatewayOrder?.amountINR).toBe(199);
      expect(cfPurchase.gatewayOrder?.amountMinorUnits).toBe(19900);

      // Razorpay gateway
      const rzpPurchase = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.COMPLETE_REPORT_199,
        leadName: 'Javagal Srinath',
        leadPhone: '9845099887',
        leadEmail: 'srinath@mysore.in',
        gateway: 'RAZORPAY',
      });

      expect(rzpPurchase.purchase.gateway).toBe('RAZORPAY');
      expect(rzpPurchase.gatewayOrder?.amountMinorUnits).toBe(19900);
    });

    it('1.4 Frontend tampering immunity: client-submitted custom amounts are ignored', async () => {
      // Client maliciously sends priceMinorUnits = 100 (₹1) or tampered body parameters
      const tamperedBody: any = {
        tierCode: PRICING_TIER_CODES.COMPLETE_REPORT_199,
        leadName: 'Tamper Actor',
        leadPhone: '9845000000',
        leadEmail: 'tamper@badactor.in',
        amount: 1,
        amountMinorUnits: 100,
        price: 1,
      };

      const result = await pricingService.initiatePurchase(tamperedBody);
      // Server must authoritatively enforce 19,900 paise
      expect(result.purchase.amountMinorUnits).toBe(19900);
      expect(result.gatewayOrder?.amountMinorUnits).toBe(19900);
      if (result.gatewayOrder?.amountINR) {
        expect(result.gatewayOrder.amountINR).toBe(199);
      }
    });

    it('1.5 Consultation service fee remains strictly decoupled at ₹1,499 (149,900 paise)', () => {
      expect(CONSULTATION_PRICE_PAISE).toBe(149900);
      expect(CONSULTATION_PRICE_INR).toBe(1499);
      // Ensure consultation is never conflated with report price
      expect(CONSULTATION_PRICE_PAISE).not.toBe(PRICING_MINOR_UNITS.COMPLETE_REPORT_199);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 2. PAYMENT STATE MACHINE & VERIFICATION INTEGRITY
  // ═════════════════════════════════════════════════════════════════════════
  describe('2. Payment Lifecycle & Gate Transitions', () => {
    it('2.1 Initial purchase is created in PENDING state with a public reference', async () => {
      const { purchase } = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.COMPLETE_REPORT_199,
        leadName: 'Girish Karnad',
        leadPhone: '9845033445',
        leadEmail: 'girish@karnad.in',
        projectId: 'BLR-PROJ-GK',
      });

      expect(purchase.status).toBe('PENDING');
      expect(purchase.publicReference).toMatch(/^HT-PUR-[A-F0-9]{6}$/);
      expect(purchase.gatewayPaymentId).toBeNull();

      // Access is blocked while PENDING
      const hasAccess = await pricingService.canAccessFeature(
        PRICING_FEATURES.FULL_PDF_REPORT,
        null,
        'girish@karnad.in',
        'BLR-PROJ-GK'
      );
      expect(hasAccess).toBe(false);
    });

    it('2.2 Confirmed payment marks purchase PAID and unlocks report deliverables', async () => {
      const email = 'swathi@bangalore.in';
      const projectId = 'BLR-PROJ-SWATHI';

      const { purchase } = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.COMPLETE_REPORT_199,
        leadName: 'Swathi Mohan',
        leadPhone: '9845011447',
        leadEmail: email,
        projectId,
      });

      // Confirm payment with gateway ID
      const confirmResult = await pricingService.confirmPurchasePayment(
        purchase.id,
        'pay_cf_verified_9988',
        purchase.gatewayOrderId || undefined
      );

      expect(confirmResult.purchase.status).toBe('PAID');
      expect(confirmResult.purchase.gatewayPaymentId).toBeDefined();

      // Entitlements are now authoritatively active
      const canDownloadPdf = await pricingService.canAccessFeature(
        PRICING_FEATURES.FULL_PDF_REPORT,
        null,
        email,
        projectId
      );
      const canAccessBoq = await pricingService.canAccessFeature(
        PRICING_FEATURES.DETAILED_BOQ,
        null,
        email,
        projectId
      );
      const canAccessMaterials = await pricingService.canAccessFeature(
        PRICING_FEATURES.MATERIAL_SCHEDULE,
        null,
        email,
        projectId
      );

      expect(canDownloadPdf).toBe(true);
      expect(canAccessBoq).toBe(true);
      expect(canAccessMaterials).toBe(true);
    });

    it('2.3 Idempotency: re-confirming already PAID purchase does not duplicate or fail', async () => {
      const email = 'idempotent@hutty.in';
      const { purchase } = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.COMPLETE_REPORT_199,
        leadName: 'Idempotent Customer',
        leadPhone: '9845077112',
        leadEmail: email,
      });

      const firstConfirm = await pricingService.confirmPurchasePayment(purchase.id, 'pay_first_001');
      expect(firstConfirm.purchase.status).toBe('PAID');

      // Re-confirm (e.g. concurrent webhook and client callback)
      const secondConfirm = await pricingService.confirmPurchasePayment(purchase.id, 'pay_second_002');
      expect(secondConfirm.purchase.status).toBe('PAID');
      expect(secondConfirm.purchase.id).toBe(firstConfirm.purchase.id);

      // Entitlements should remain clean without duplicates
      const entitlements = await pricingService.getUserEntitlements(null, email, null);
      const uniqueFeatureCodes = new Set(entitlements.map((e) => e.featureCode));
      expect(uniqueFeatureCodes.size).toBe(entitlements.length);
    });

    it('2.4 Failed payment allows safe retry without creating duplicate ghost purchases', async () => {
      const email = 'retry@hutty.in';
      const { purchase } = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.COMPLETE_REPORT_199,
        leadName: 'Retry Customer',
        leadPhone: '9845088223',
        leadEmail: email,
      });

      // User dismisses or fails payment
      const failed = await pricingService.failPurchasePayment(purchase.id, 'User closed UPI popup');
      expect(failed.status).toBe('FAILED');

      // User retries on the same purchase record
      const retryConfirm = await pricingService.confirmPurchasePayment(purchase.id, 'pay_retry_success_7788');
      expect(retryConfirm.purchase.status).toBe('PAID');
      expect(retryConfirm.purchase.id).toBe(purchase.id);

      const hasAccess = await pricingService.canAccessFeature(
        PRICING_FEATURES.FULL_PDF_REPORT,
        null,
        email,
        null
      );
      expect(hasAccess).toBe(true);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 3. GUEST PURCHASE & RECOVERY FLOW
  // ═════════════════════════════════════════════════════════════════════════
  describe('3. Guest Purchase & Reference Recovery', () => {
    it('3.1 Guest without userId successfully purchases and receives public reference', async () => {
      const guestResult = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.COMPLETE_REPORT_199,
        leadName: 'Guest Homeowner',
        leadPhone: '9845019922',
        leadEmail: 'guest.homeowner@gmail.com',
        userId: null,
      });

      expect(guestResult.purchase.userId).toBeNull();
      expect(guestResult.purchase.leadEmail).toBe('guest.homeowner@gmail.com');
      expect(guestResult.purchase.publicReference).toMatch(/^HT-PUR-[A-F0-9]{6}$/);

      // Verify payment
      await pricingService.confirmPurchasePayment(guestResult.purchase.id, 'pay_guest_123');

      // Entitlements are retrievable by email
      const entitlements = await pricingService.getUserEntitlements(null, 'guest.homeowner@gmail.com', null);
      expect(entitlements.length).toBeGreaterThan(0);
      expect(entitlements.some((e) => e.featureCode === PRICING_FEATURES.FULL_PDF_REPORT)).toBe(true);
    });

    it('3.2 Purchase is lookupable by public reference for customer support or recovery', async () => {
      const { purchase } = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.COMPLETE_REPORT_199,
        leadName: 'Support Client',
        leadPhone: '9845077665',
        leadEmail: 'support.client@example.com',
      });

      const orderRef = purchase.publicReference;
      const history = await pricingService.getPurchaseHistory();
      const matched = history.find((p) => p.publicReference === orderRef);

      expect(matched).toBeDefined();
      expect(matched?.id).toBe(purchase.id);
      expect(matched?.amountMinorUnits).toBe(19900);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 4. ENTITLEMENT SCOPE & SECURITY BOUNDARIES
  // ═════════════════════════════════════════════════════════════════════════
  describe('4. Entitlement Isolation & Security', () => {
    it('4.1 Purchasing for Project A does not grant access to unrelated Project B', async () => {
      const email = 'multi.project@hutty.in';
      const projA = 'PROJ_INDIRANAGAR_A';
      const projB = 'PROJ_WHITEFIELD_B';

      const { purchase } = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.COMPLETE_REPORT_199,
        leadName: 'Multi Project Owner',
        leadPhone: '9845022334',
        leadEmail: email,
        projectId: projA,
      });

      await pricingService.confirmPurchasePayment(purchase.id, 'pay_proj_a_88');

      // Access granted for Project A
      expect(
        await pricingService.canAccessFeature(PRICING_FEATURES.FULL_PDF_REPORT, null, email, projA)
      ).toBe(true);

      // Access strictly blocked for Project B
      expect(
        await pricingService.canAccessFeature(PRICING_FEATURES.FULL_PDF_REPORT, null, email, projB)
      ).toBe(false);
    });

    it('4.2 Missing contact details are strictly rejected during checkout initiation', async () => {
      await expect(
        pricingService.initiatePurchase({
          tierCode: PRICING_TIER_CODES.COMPLETE_REPORT_199,
          leadName: '',
          leadPhone: '9845012345',
          leadEmail: 'test@example.com',
        })
      ).rejects.toThrow(/Contact details/);

      await expect(
        pricingService.initiatePurchase({
          tierCode: PRICING_TIER_CODES.COMPLETE_REPORT_199,
          leadName: 'Valid Name',
          leadPhone: '',
          leadEmail: 'test@example.com',
        })
      ).rejects.toThrow(/Contact details/);

      await expect(
        pricingService.initiatePurchase({
          tierCode: PRICING_TIER_CODES.COMPLETE_REPORT_199,
          leadName: 'Valid Name',
          leadPhone: '9845012345',
          leadEmail: '',
        })
      ).rejects.toThrow(/Contact details/);
    });
  });
});
