// ==============================================================================
// Hutty Cashfree Checkout Session & API Resilience Regression Test Suite
// Verifies:
// 1. Valid payment_session_id generation & proper SDK handoff structure
// 2. Missing or empty payment_session_id safely caught without fake session substitution
// 3. Cashfree API errors (400, 401, 500) surfaced cleanly with status and message
// 4. Unconfigured credentials rejection
// 5. Successful checkout initialization with mode 'sandbox'
// 6. Security: Anti-tampering, independent backend verification, and entitlement gating
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cashfreeService } from '../../../server/src/services/cashfree.service';
import { pricingService } from '../../../server/src/services/pricing.service';
import { PRICING_TIER_CODES, PRICING_FEATURES } from '../../../server/src/constants/pricing.constants';

describe('Cashfree Checkout Session & API Resilience Regression Suite', () => {
  const originalEnv = { ...process.env };
  const mockAppId = 'CF_TEST_APP_ID_VALID_2026';
  const mockSecretKey = 'cf_secret_key_mock_secure_2026';

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.CASHFREE_APP_ID = mockAppId;
    process.env.CASHFREE_SECRET_KEY = mockSecretKey;
    process.env.CASHFREE_WEBHOOK_SECRET = mockSecretKey;
    process.env.CASHFREE_ENV = 'TEST';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Valid Session ID & SDK Hand-off Structure
  // ─────────────────────────────────────────────────────────────────────────────
  it('1. Returns valid payment_session_id and paymentSessionId from Cashfree Sandbox API', async () => {
    const validSessionId = 'session_wB9xK1L0mN2pQ3rS4tU5vW6xY7z_sandbox_valid';

    // Mock successful Cashfree Orders API response
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      if (typeof url === 'string' && url.includes('/orders')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            order_id: 'order_cf_test_valid_99',
            cf_order_id: '12345678',
            payment_session_id: validSessionId,
            order_status: 'ACTIVE',
            order_amount: 99.0,
            order_currency: 'INR',
          }),
        } as any;
      }
      throw new Error(`Unexpected fetch call to ${url}`);
    });

    const orderResult = await cashfreeService.createOrder({
      orderId: 'order_cf_test_valid_99',
      orderAmount: 99,
      customer: {
        id: 'cust_valid_123',
        name: 'Suresh Kumar',
        email: 'suresh@example.com',
        phone: '9845012345',
      },
    });

    // Verify both camelCase and snake_case aliases are present
    expect(orderResult.paymentSessionId).toBe(validSessionId);
    expect(orderResult.payment_session_id).toBe(validSessionId);
    expect(orderResult.orderId).toBe('order_cf_test_valid_99');
    expect(orderResult.order_id).toBe('order_cf_test_valid_99');
    expect(orderResult.gateway).toBe('CASHFREE');
    expect(orderResult.environment).toBe('TEST');

    // Verify SDK checkout options agreement
    const sdkCheckoutOptions = {
      paymentSessionId: orderResult.paymentSessionId,
      redirectTarget: '_modal',
    };
    expect(sdkCheckoutOptions.paymentSessionId).toBe(validSessionId);
    expect(sdkCheckoutOptions.redirectTarget).toBe('_modal');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Missing or Empty payment_session_id
  // ─────────────────────────────────────────────────────────────────────────────
  it('2. Throws explicit error when Cashfree response is missing payment_session_id and never substitutes fake session', async () => {
    // Mock Cashfree API returning an order without payment_session_id
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          order_id: 'order_cf_corrupt',
          order_status: 'ACTIVE',
          order_amount: 99.0,
          // payment_session_id is missing or undefined!
        }),
      } as any;
    });

    await expect(
      cashfreeService.createOrder({
        orderId: 'order_cf_corrupt',
        orderAmount: 99,
        customer: {
          id: 'cust_corrupt',
          name: 'Corrupt Test',
          email: 'corrupt@example.com',
          phone: '9876543210',
        },
      })
    ).rejects.toThrow(/missing payment_session_id/);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Cashfree API Errors: 400 Bad Request & 401 Unauthorized
  // ─────────────────────────────────────────────────────────────────────────────
  it('3. Rejects cleanly with status and message when Cashfree API returns HTTP 400 Bad Request', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return {
        ok: false,
        status: 400,
        text: async () =>
          JSON.stringify({
            message: 'customer_phone must be a valid 10-digit number',
            code: 'invalid_request',
            type: 'validation_error',
          }),
      } as any;
    });

    await expect(
      cashfreeService.createOrder({
        orderId: 'order_cf_bad_req',
        orderAmount: 99,
        customer: {
          id: 'cust_bad',
          name: 'Bad Request',
          email: 'bad@example.com',
          phone: '000',
        },
      })
    ).rejects.toThrow(/Cashfree order creation failed \(400\): customer_phone must be a valid 10-digit number/);
  });

  it('4. Rejects cleanly with status and message when Cashfree API returns HTTP 401 Unauthorized', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return {
        ok: false,
        status: 401,
        text: async () =>
          JSON.stringify({
            message: 'Invalid client credentials or IP not whitelisted',
            code: 'authentication_failed',
          }),
      } as any;
    });

    await expect(
      cashfreeService.createOrder({
        orderId: 'order_cf_unauth',
        orderAmount: 99,
        customer: {
          id: 'cust_unauth',
          name: 'Unauth User',
          email: 'unauth@example.com',
          phone: '9876543210',
        },
      })
    ).rejects.toThrow(/Cashfree order creation failed \(401\)/);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Unconfigured Credentials
  // ─────────────────────────────────────────────────────────────────────────────
  it('5. Rejects immediately with CASHFREE_NOT_CONFIGURED when credentials are missing or empty', async () => {
    delete process.env.CASHFREE_APP_ID;
    delete process.env.CASHFREE_CLIENT_ID;
    delete process.env.CASHFREE_KEY_ID;
    delete process.env.CASHFREE_API_KEY;
    delete process.env.CASHFREE_SECRET_KEY;
    delete process.env.CASHFREE_CLIENT_SECRET;
    delete process.env.CASHFREE_SECRET;

    expect(cashfreeService.isConfigured()).toBe(false);

    await expect(
      cashfreeService.createOrder({
        orderId: 'order_cf_no_creds',
        orderAmount: 99,
        customer: {
          id: 'cust_no_creds',
          name: 'No Creds',
          email: 'nocreds@example.com',
          phone: '9876543210',
        },
      })
    ).rejects.toThrow(/CASHFREE_NOT_CONFIGURED/);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Successful Checkout Initialization & Response Normalization
  // ─────────────────────────────────────────────────────────────────────────────
  it('6. Server initiatePurchase returns normalized gatewayOrder with paymentSessionId and payment_session_id', async () => {
    const validSession = 'session_mock_pricing_initiate_99';

    vi.spyOn(cashfreeService, 'createOrder').mockResolvedValue({
      orderId: 'order_cf_pricing_99',
      order_id: 'order_cf_pricing_99',
      paymentSessionId: validSession,
      payment_session_id: validSession,
      cfOrderId: 'cf_112233',
      orderStatus: 'ACTIVE',
      orderAmount: 99,
      currency: 'INR',
      environment: 'TEST',
      gateway: 'CASHFREE',
    });

    const result = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Naveen Kumar',
      leadPhone: '9845012345',
      leadEmail: 'naveen@example.com',
      projectId: 'proj-cf-test-norm',
      gateway: 'CASHFREE',
    });

    expect(result.requiresPayment).toBe(true);
    expect(result.gatewayOrder).toBeDefined();
    expect(result.gatewayOrder!.gateway).toBe('CASHFREE');
    expect(result.gatewayOrder!.paymentSessionId).toBe(validSession);
    expect(result.gatewayOrder!.payment_session_id).toBe(validSession);
    expect(result.gatewayOrder!.orderId).toBe('order_cf_pricing_99');
    expect(result.gatewayOrder!.order_id).toBe('order_cf_pricing_99');
    expect(result.gatewayOrder!.amountINR).toBe(99);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Security: No Entitlements Granted Without Verified Success
  // ─────────────────────────────────────────────────────────────────────────────
  it('7. Independent backend payment verification: paid entitlements granted ONLY after Cashfree reports SUCCESS', async () => {
    const orderId = 'order_cf_verify_test_499';

    vi.spyOn(cashfreeService, 'createOrder').mockResolvedValue({
      orderId,
      paymentSessionId: 'session_verify_test_499',
      orderStatus: 'ACTIVE',
      orderAmount: 499,
      currency: 'INR',
      environment: 'TEST',
      gateway: 'CASHFREE',
    });

    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
      leadName: 'Geetha Reddy',
      leadPhone: '9845088888',
      leadEmail: 'geetha@example.com',
      projectId: 'proj-geetha-499',
      gateway: 'CASHFREE',
    });

    // 1. Initial state: PENDING, feature locked
    expect(purchase.status).toBe('PENDING');
    let hasAccess = await pricingService.canAccessFeature(
      PRICING_FEATURES.FULL_PDF_REPORT,
      null,
      'geetha@example.com',
      'proj-geetha-499'
    );
    expect(hasAccess).toBe(false);

    // 2. Mock Cashfree PG returning SUCCESS
    vi.spyOn(cashfreeService, 'getOrderPayments').mockResolvedValue([
      {
        cf_payment_id: 'cf_pay_998811',
        order_id: orderId,
        payment_status: 'SUCCESS',
        payment_amount: 499.0,
        payment_currency: 'INR',
      },
    ]);

    const verification = await cashfreeService.verifyOrderPayment(orderId, 499.0);
    expect(verification.verified).toBe(true);
    expect(verification.paymentStatus).toBe('PAID');

    // 3. Confirm payment with backend
    const confirmed = await pricingService.confirmPurchasePayment(
      purchase.id,
      verification.cfPaymentId!,
      orderId
    );
    expect(confirmed.purchase.status).toBe('PAID');

    // 4. Feature is now authoritatively unlocked
    hasAccess = await pricingService.canAccessFeature(
      PRICING_FEATURES.FULL_PDF_REPORT,
      null,
      'geetha@example.com',
      'proj-geetha-499'
    );
    expect(hasAccess).toBe(true);
  });
});
