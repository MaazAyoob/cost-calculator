// ==============================================================================
// Hutty Cashfree Production Mode & Environment Regression Test Suite
// Verifies:
// 1. TEST and SANDBOX configurations return normalized 'TEST' mode for frontend SDK
// 2. PRODUCTION and PROD configurations return normalized 'PRODUCTION' mode for frontend SDK
// 3. Base URL and returned environment strictly agree (sandbox vs api.cashfree.com)
// 4. Order-status response (/status/:orderId) returns the identical authoritative environment
// 5. Frontend never receives Cashfree secrets in order result, status, or booking responses
// 6. Existing Cashfree amount verification, signature validation, idempotency, and
//    entitlement gating rules remain completely intact across environments
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'crypto';
import { cashfreeService } from '../../../server/src/services/cashfree.service';
import { CashfreeController } from '../../../server/src/controllers/cashfree.controller';
import { consultationService } from '../../../server/src/services/consultation.service';
import { pricingService } from '../../../server/src/services/pricing.service';
import { CONSULTATION_PRICE_INR, CONSULTATION_PRICE_PAISE } from '../../../server/src/constants/consultation.constants';

describe('Cashfree Production Mode & Environment Regression Suite', () => {
  const originalEnv = { ...process.env };
  const mockTestAppId = 'CF_TEST_APP_ID_2026';
  const mockTestSecret = 'cf_test_secret_key_hash_2026';
  const mockProdAppId = 'CF_PROD_APP_ID_LIVE_2026';
  const mockProdSecret = 'cf_prod_secret_key_live_hash_2026';
  const mockWebhookSecret = 'cf_webhook_secret_separate_2026';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. TEST and SANDBOX Mode Normalization & Agreement
  // ─────────────────────────────────────────────────────────────────────────────
  describe('TEST & SANDBOX Configuration Normalization', () => {
    const testCases = [
      { name: 'explicit CASHFREE_ENV=TEST', envVal: 'TEST' },
      { name: 'lowercase CASHFREE_ENV=test', envVal: 'test' },
      { name: 'CASHFREE_ENV=SANDBOX', envVal: 'SANDBOX' },
      { name: 'lowercase CASHFREE_ENV=sandbox', envVal: 'sandbox' },
      { name: 'unset CASHFREE_ENV (default fallback)', envVal: undefined },
    ];

    testCases.forEach(({ name, envVal }) => {
      it(`normalizes environment to 'TEST' and targets sandbox API for ${name}`, async () => {
        if (envVal !== undefined) {
          process.env.CASHFREE_ENV = envVal;
        } else {
          delete process.env.CASHFREE_ENV;
        }
        process.env.CASHFREE_APP_ID = mockTestAppId;
        process.env.CASHFREE_SECRET_KEY = mockTestSecret;

        // Verify authoritative environment getter
        expect(cashfreeService.environment).toBe('TEST');
        expect(cashfreeService.baseUrl).toBe('https://sandbox.cashfree.com/pg');

        // Mock Cashfree API response
        let requestedUrl = '';
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
          requestedUrl = String(url);
          return {
            ok: true,
            status: 200,
            json: async () => ({
              order_id: 'order_test_mode_1',
              payment_session_id: 'session_sandbox_valid_123',
              order_status: 'ACTIVE',
              order_amount: 1499.0,
              order_currency: 'INR',
            }),
          } as any;
        });

        const orderResult = await cashfreeService.createOrder({
          orderId: 'order_test_mode_1',
          orderAmount: 1499,
          customer: {
            id: 'cust_test_1',
            name: 'Sunita Rao',
            email: 'sunita@example.com',
            phone: '9845012345',
          },
        });

        // Backend order creation environment matches
        expect(orderResult.environment).toBe('TEST');
        expect(requestedUrl).toContain('https://sandbox.cashfree.com/pg/orders');

        // Frontend SDK mode agreement
        const frontendSdkMode =
          orderResult.environment === 'PROD' || orderResult.environment === 'PRODUCTION'
            ? 'production'
            : 'sandbox';
        expect(frontendSdkMode).toBe('sandbox');
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. PRODUCTION and PROD Mode Normalization & Agreement
  // ─────────────────────────────────────────────────────────────────────────────
  describe('PRODUCTION & PROD Configuration Normalization', () => {
    const prodCases = [
      { name: 'CASHFREE_ENV=PRODUCTION', envVal: 'PRODUCTION' },
      { name: 'lowercase CASHFREE_ENV=production', envVal: 'production' },
      { name: 'CASHFREE_ENV=PROD', envVal: 'PROD' },
      { name: 'lowercase CASHFREE_ENV=prod', envVal: 'prod' },
    ];

    prodCases.forEach(({ name, envVal }) => {
      it(`normalizes environment to 'PRODUCTION' and targets live API for ${name}`, async () => {
        process.env.CASHFREE_ENV = envVal;
        process.env.CASHFREE_APP_ID = mockProdAppId;
        process.env.CASHFREE_SECRET_KEY = mockProdSecret;

        // Verify authoritative environment getter
        expect(cashfreeService.environment).toBe('PRODUCTION');
        expect(cashfreeService.baseUrl).toBe('https://api.cashfree.com/pg');

        // Mock Cashfree API response
        let requestedUrl = '';
        let headersSent: any = {};
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any, init: any) => {
          requestedUrl = String(url);
          headersSent = init?.headers || {};
          return {
            ok: true,
            status: 200,
            json: async () => ({
              order_id: 'order_prod_mode_1',
              payment_session_id: 'session_live_prod_valid_789',
              order_status: 'ACTIVE',
              order_amount: 1499.0,
              order_currency: 'INR',
            }),
          } as any;
        });

        const orderResult = await cashfreeService.createOrder({
          orderId: 'order_prod_mode_1',
          orderAmount: 1499,
          customer: {
            id: 'cust_prod_1',
            name: 'Ananya Sharma',
            email: 'ananya@example.com',
            phone: '9845099887',
          },
        });

        // Backend order creation environment matches PRODUCTION
        expect(orderResult.environment).toBe('PRODUCTION');
        expect(requestedUrl).toBe('https://api.cashfree.com/pg/orders');
        expect(headersSent['x-client-id']).toBe(mockProdAppId);
        expect(headersSent['x-client-secret']).toBe(mockProdSecret);

        // Frontend SDK mode agreement: must resolve to 'production'
        const frontendSdkMode =
          orderResult.environment === 'PROD' || orderResult.environment === 'PRODUCTION'
            ? 'production'
            : 'sandbox';
        expect(frontendSdkMode).toBe('production');

        // SDK mode and Base URL must NEVER disagree
        const isProdMode = frontendSdkMode === 'production';
        const isLiveBaseUrl = requestedUrl.startsWith('https://api.cashfree.com/pg');
        expect(isProdMode).toBe(isLiveBaseUrl);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Order-Status Response (/status/:orderId) Environment Consistency
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Order-Status Response (/status/:orderId) Consistency', () => {
    it('returns environment: "TEST" when in test mode', async () => {
      process.env.CASHFREE_ENV = 'TEST';
      process.env.CASHFREE_APP_ID = mockTestAppId;
      process.env.CASHFREE_SECRET_KEY = mockTestSecret;

      vi.spyOn(cashfreeService, 'getOrder').mockResolvedValue({
        order_id: 'order_cf_status_test',
        payment_session_id: 'session_test_abc',
        order_status: 'ACTIVE',
      });
      vi.spyOn(cashfreeService, 'getOrderPayments').mockResolvedValue([]);

      let responseJson: any;
      const req = { params: { orderId: 'order_cf_status_test' } } as any;
      const res = {
        status: () => res,
        json: (data: any) => {
          responseJson = data;
          return res;
        },
      } as any;

      await CashfreeController.getOrderStatus(req, res);

      expect(responseJson.success).toBe(true);
      expect(responseJson.data.environment).toBe('TEST');
      expect(responseJson.data.order.payment_session_id).toBe('session_test_abc');
    });

    it('returns environment: "PRODUCTION" when in production mode', async () => {
      process.env.CASHFREE_ENV = 'PRODUCTION';
      process.env.CASHFREE_APP_ID = mockProdAppId;
      process.env.CASHFREE_SECRET_KEY = mockProdSecret;

      vi.spyOn(cashfreeService, 'getOrder').mockResolvedValue({
        order_id: 'order_cf_status_prod',
        payment_session_id: 'session_prod_live_xyz',
        order_status: 'ACTIVE',
      });
      vi.spyOn(cashfreeService, 'getOrderPayments').mockResolvedValue([]);

      let responseJson: any;
      const req = { params: { orderId: 'order_cf_status_prod' } } as any;
      const res = {
        status: () => res,
        json: (data: any) => {
          responseJson = data;
          return res;
        },
      } as any;

      await CashfreeController.getOrderStatus(req, res);

      expect(responseJson.success).toBe(true);
      expect(responseJson.data.environment).toBe('PRODUCTION');
      expect(responseJson.data.order.payment_session_id).toBe('session_prod_live_xyz');

      // Frontend fallback query mode agreement
      const frontendMode =
        responseJson.data.environment === 'PROD' || responseJson.data.environment === 'PRODUCTION'
          ? 'production'
          : 'sandbox';
      expect(frontendMode).toBe('production');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Secret Leakage Guard
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Secret Leakage Guard', () => {
    it('ensures Cashfree secrets are never exposed in order creation or status responses', async () => {
      process.env.CASHFREE_ENV = 'PRODUCTION';
      process.env.CASHFREE_APP_ID = mockProdAppId;
      process.env.CASHFREE_SECRET_KEY = mockProdSecret;
      process.env.CASHFREE_WEBHOOK_SECRET = mockWebhookSecret;

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          order_id: 'order_cf_secret_check',
          payment_session_id: 'session_clean_123',
          order_status: 'ACTIVE',
          order_amount: 1499.0,
          order_currency: 'INR',
        }),
      } as any);

      const orderResult = await cashfreeService.createOrder({
        orderId: 'order_cf_secret_check',
        orderAmount: 1499,
        customer: {
          id: 'cust_sec_1',
          name: 'Pooja Hegde',
          email: 'pooja@example.com',
          phone: '9845112233',
        },
      });

      const serializedOrder = JSON.stringify(orderResult);
      expect(serializedOrder).not.toContain(mockProdSecret);
      expect(serializedOrder).not.toContain(mockWebhookSecret);
      expect((orderResult as any).secretKey).toBeUndefined();
      expect((orderResult as any).secret).toBeUndefined();

      // Check status endpoint
      vi.spyOn(cashfreeService, 'getOrder').mockResolvedValue({
        order_id: 'order_cf_secret_check',
        payment_session_id: 'session_clean_123',
      });
      vi.spyOn(cashfreeService, 'getOrderPayments').mockResolvedValue([]);

      let statusJson: any;
      const res = {
        status: () => res,
        json: (data: any) => {
          statusJson = data;
          return res;
        },
      } as any;

      await CashfreeController.getOrderStatus({ params: { orderId: 'order_cf_secret_check' } } as any, res);

      const serializedStatus = JSON.stringify(statusJson);
      expect(serializedStatus).not.toContain(mockProdSecret);
      expect(serializedStatus).not.toContain(mockWebhookSecret);
      expect(serializedStatus).not.toContain(mockTestSecret);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Existing Business Invariants Remain Intact Across Environments
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Preservation of Existing Business & Security Invariants', () => {
    it('authoritatively rejects mismatched payment amounts in both TEST and PRODUCTION', async () => {
      ['TEST', 'PRODUCTION'].forEach(async (env) => {
        process.env.CASHFREE_ENV = env;
        process.env.CASHFREE_APP_ID = env === 'PRODUCTION' ? mockProdAppId : mockTestAppId;
        process.env.CASHFREE_SECRET_KEY = env === 'PRODUCTION' ? mockProdSecret : mockTestSecret;

        // Mock payment returned with ₹999 instead of expected ₹1,499
        vi.spyOn(cashfreeService, 'getOrderPayments').mockResolvedValue([
          {
            cf_payment_id: 11223344,
            payment_status: 'SUCCESS',
            payment_amount: 999.0, // Tampered / wrong amount!
            payment_currency: 'INR',
          },
        ]);

        const verification = await cashfreeService.verifyOrderPayment('order_amount_mismatch', 1499.0);

        expect(verification.verified).toBe(false);
        expect(verification.paymentStatus).toBe('AMOUNT_MISMATCH');
        expect(verification.message).toContain('does not match authoritative required price');
      });
    });

    it('cryptographically verifies webhook signature using HMAC-SHA256 Base64 in both environments', () => {
      ['TEST', 'PRODUCTION'].forEach((env) => {
        process.env.CASHFREE_ENV = env;
        process.env.CASHFREE_WEBHOOK_SECRET = mockWebhookSecret;

        const rawBody = JSON.stringify({
          type: 'PAYMENT_SUCCESS_WEBHOOK',
          data: {
            order: { order_id: `order_wh_${env}`, order_amount: 1499.0 },
            payment: { cf_payment_id: 998877, payment_status: 'SUCCESS', payment_amount: 1499.0 },
          },
        });
        const timestamp = String(Date.now());

        const validSignature = crypto
          .createHmac('sha256', mockWebhookSecret)
          .update(`${timestamp}${rawBody}`)
          .digest('base64');

        const isSignatureValid = cashfreeService.verifyWebhookSignature(rawBody, validSignature, timestamp);
        expect(isSignatureValid).toBe(true);

        const tamperedSignature = crypto
          .createHmac('sha256', 'wrong_secret_attacker')
          .update(`${timestamp}${rawBody}`)
          .digest('base64');

        const isTamperedValid = cashfreeService.verifyWebhookSignature(rawBody, tamperedSignature, timestamp);
        expect(isTamperedValid).toBe(false);
      });
    });

    it('maintains strict idempotency on repeated webhook deliveries', async () => {
      process.env.CASHFREE_ENV = 'PRODUCTION';
      process.env.CASHFREE_APP_ID = mockProdAppId;
      process.env.CASHFREE_SECRET_KEY = mockProdSecret;
      process.env.CASHFREE_WEBHOOK_SECRET = mockWebhookSecret;

      const orderId = `order_wh_idempotent_${Date.now()}`;
      const consultationRequestId = `req_idempotent_${Date.now()}`;

      // Mock consultation payment in memory
      vi.spyOn(consultationService, 'getPaymentByOrderId').mockResolvedValue({
        id: 'pay_idem_1',
        consultationRequestId,
        gatewayOrderId: orderId,
        gatewayPaymentId: null,
        gatewaySignature: null,
        amountMinorUnits: CONSULTATION_PRICE_PAISE,
        currency: 'INR',
        status: 'PAID', // Already PAID!
        verifiedAt: new Date().toISOString(),
        gateway: 'CASHFREE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const rawBody = JSON.stringify({
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: {
          order: { order_id: orderId, order_amount: CONSULTATION_PRICE_INR },
          payment: { cf_payment_id: 554433, payment_status: 'SUCCESS', payment_amount: CONSULTATION_PRICE_INR },
        },
      });
      const timestamp = String(Date.now());
      const signature = crypto
        .createHmac('sha256', mockWebhookSecret)
        .update(`${timestamp}${rawBody}`)
        .digest('base64');

      const result = await cashfreeService.handleWebhook(rawBody, signature, timestamp);

      expect(result.status).toBe('idempotent');
      expect(result.handled).toBe(true);
      expect(result.message).toContain('already verified as PAID');
    });
  });
});
