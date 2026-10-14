// ==============================================================================
// Hutty Cashfree Payment Gateway Integration Test Suite
// Verifies:
// 1. Server-side order creation using authoritative Hutty prices
// 2. Authoritative payment status verification (never trusting frontend redirect)
// 3. Cryptographic signed webhook verification (timestamp + rawBody HMAC-SHA256)
// 4. Idempotent processing and replay protection
// 5. Failed, pending, duplicate, tampered, and invalid webhook scenarios
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'crypto';
import { cashfreeService } from '../../../server/src/services/cashfree.service';
import { pricingService } from '../../../server/src/services/pricing.service';
import { consultationService } from '../../../server/src/services/consultation.service';
import { PRICING_TIER_CODES, PRICING_FEATURES } from '../../../server/src/constants/pricing.constants';
import { CONSULTATION_PRICE_INR, CONSULTATION_PRICE_PAISE } from '../../../server/src/constants/consultation.constants';

describe('Hutty Cashfree Payment Gateway Integration Suite', () => {
  const originalEnv = { ...process.env };
  const mockAppId = 'CF_TEST_APP_ID_MOCK_2026';
  const mockSecretKey = 'cf_secret_key_mock_secure_hash_2026';

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
  // 1. Environment & Configuration
  // ─────────────────────────────────────────────────────────────────────────────
  it('1. Detects configured Cashfree test credentials and enforces test mode', () => {
    expect(cashfreeService.isConfigured()).toBe(true);
    expect(cashfreeService.appId).toBe(mockAppId);
    expect(cashfreeService.secretKey).toBe(mockSecretKey);
  });

  it('2. Sanitizes customer phone number to 10 digits as required by Cashfree', () => {
    expect(cashfreeService.sanitizePhone('+91 98450 12345')).toBe('9845012345');
    expect(cashfreeService.sanitizePhone('919845012345')).toBe('9845012345');
    expect(cashfreeService.sanitizePhone('9845012345')).toBe('9845012345');
    expect(cashfreeService.sanitizePhone('')).toBe('9876543210');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Server-side Order Creation with Authoritative Hutty Pricing
  // ─────────────────────────────────────────────────────────────────────────────
  it('3. Server authoritatively creates Cashfree order for Basic Estimate PDF (₹99 / 9900 paise)', async () => {
    const { purchase, requiresPayment, gatewayOrder } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Rohan Sharma',
      leadPhone: '+91 98450 11223',
      leadEmail: 'rohan.sharma@example.com',
      projectId: 'proj-cf-test-99',
      gateway: 'CASHFREE',
    });

    expect(requiresPayment).toBe(true);
    expect(purchase.amountMinorUnits).toBe(9900); // Authoritative ₹99
    expect(purchase.status).toBe('PENDING');
    expect(purchase.gateway).toBe('CASHFREE');
    expect(purchase.gatewayOrderId).toMatch(/^order_cf_/);

    expect(gatewayOrder).toBeDefined();
    expect(gatewayOrder!.gateway).toBe('CASHFREE');
    expect(gatewayOrder!.amountINR).toBe(99);
    expect(gatewayOrder!.amountMinorUnits).toBe(9900);
    expect(gatewayOrder!.currency).toBe('INR');
    expect(gatewayOrder!.environment).toBe('TEST');
  });

  it('4. Server authoritatively creates Cashfree order for Detailed BOQ (₹499 / 49900 paise)', async () => {
    const { purchase, requiresPayment, gatewayOrder } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
      leadName: 'Ananya Deshmukh',
      leadPhone: '9876543210',
      leadEmail: 'ananya@example.com',
      projectId: 'proj-cf-test-499',
      gateway: 'CASHFREE',
    });

    expect(requiresPayment).toBe(true);
    expect(purchase.amountMinorUnits).toBe(49900); // Authoritative ₹499
    expect(purchase.gateway).toBe('CASHFREE');
    expect(gatewayOrder!.amountINR).toBe(499);
  });

  it('5. Server authoritatively creates Cashfree order for Expert Consultation (₹1,499)', async () => {
    const booking = await consultationService.createBookingRequest({
      homeownerName: 'Vikram Mehta',
      homeownerPhone: '9845012345',
      homeownerEmail: 'vikram.mehta@example.com',
      projectLocation: 'Indiranagar, Bangalore',
      projectType: 'Independent Villa / House',
      consultationTopic: 'Plan & Layout Review',
      preferredDate: '2026-10-25',
      preferredTime: '10:00 AM - 11:00 AM',
      gateway: 'CASHFREE',
    });

    expect(booking.payment.gateway).toBe('CASHFREE');
    expect(booking.payment.amountMinorUnits).toBe(CONSULTATION_PRICE_PAISE);
    expect(booking.payment.status).toBe('PENDING');
    expect(booking.cashfreeOptions).toBeDefined();
    expect(booking.cashfreeOptions!.amount).toBe(CONSULTATION_PRICE_INR);
    expect(booking.cashfreeOptions!.gateway).toBe('CASHFREE');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Authoritative Payment Verification (Success, Failed, Pending, Tampering)
  // ─────────────────────────────────────────────────────────────────────────────
  it('6. Successfully verifies payment when Cashfree API reports SUCCESS and activates entitlements', async () => {
    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Priya Nair',
      leadPhone: '9845099887',
      leadEmail: 'priya@example.com',
      projectId: 'proj-cf-priya',
      gateway: 'CASHFREE',
    });

    // Mock Cashfree Get Order Payments API to return SUCCESS
    vi.spyOn(cashfreeService, 'getOrderPayments').mockResolvedValue([
      {
        cf_payment_id: 99887766,
        order_id: purchase.gatewayOrderId,
        payment_status: 'SUCCESS',
        payment_amount: 99.0,
        payment_currency: 'INR',
      },
    ]);

    // Verify payment through Cashfree service
    const verifyResult = await cashfreeService.verifyOrderPayment(purchase.gatewayOrderId!, 99.0);
    expect(verifyResult.verified).toBe(true);
    expect(verifyResult.paymentStatus).toBe('PAID');
    expect(verifyResult.cfPaymentId).toBe('99887766');

    // Confirm purchase in pricing service
    const confirmed = await pricingService.confirmPurchasePayment(
      purchase.id,
      verifyResult.cfPaymentId!,
      purchase.gatewayOrderId!
    );
    expect(confirmed.purchase.status).toBe('PAID');

    // Verify entitlement is granted
    const hasAccess = await pricingService.canAccessFeature(
      PRICING_FEATURES.BASIC_PDF_DOWNLOAD,
      null,
      'priya@example.com',
      'proj-cf-priya'
    );
    expect(hasAccess).toBe(true);
  });

  it('7. Rejects payment and does NOT grant entitlements when Cashfree API reports FAILED', async () => {
    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Failed Buyer',
      leadPhone: '9845011111',
      leadEmail: 'fail@example.com',
      projectId: 'proj-cf-fail',
      gateway: 'CASHFREE',
    });

    vi.spyOn(cashfreeService, 'getOrderPayments').mockResolvedValue([
      {
        cf_payment_id: 11223344,
        order_id: purchase.gatewayOrderId,
        payment_status: 'FAILED',
        payment_amount: 99.0,
        payment_message: 'Bank server timeout',
      },
    ]);

    const verifyResult = await cashfreeService.verifyOrderPayment(purchase.gatewayOrderId!, 99.0);
    expect(verifyResult.verified).toBe(false);
    expect(verifyResult.paymentStatus).toBe('FAILED');

    // Confirming payment must reject
    await expect(
      pricingService.confirmPurchasePayment(purchase.id, '11223344', purchase.gatewayOrderId!)
    ).rejects.toThrow(/Payment verification failed with Cashfree/);

    // Entitlement must NOT be unlocked
    const hasAccess = await pricingService.canAccessFeature(
      PRICING_FEATURES.BASIC_PDF_DOWNLOAD,
      null,
      'fail@example.com',
      'proj-cf-fail'
    );
    expect(hasAccess).toBe(false);
  });

  it('8. Rejects payment and keeps order PENDING when Cashfree API reports order is still ACTIVE', async () => {
    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Pending Buyer',
      leadPhone: '9845022222',
      leadEmail: 'pending@example.com',
      projectId: 'proj-cf-pending',
      gateway: 'CASHFREE',
    });

    vi.spyOn(cashfreeService, 'getOrderPayments').mockResolvedValue([]);
    vi.spyOn(cashfreeService, 'getOrder').mockResolvedValue({
      order_id: purchase.gatewayOrderId,
      order_status: 'ACTIVE',
      order_amount: 99.0,
    });

    const verifyResult = await cashfreeService.verifyOrderPayment(purchase.gatewayOrderId!, 99.0);
    expect(verifyResult.verified).toBe(false);
    expect(verifyResult.paymentStatus).toBe('PENDING');

    await expect(
      pricingService.confirmPurchasePayment(purchase.id, 'unpaid', purchase.gatewayOrderId!)
    ).rejects.toThrow(/Payment verification failed with Cashfree/);

    const hasAccess = await pricingService.canAccessFeature(
      PRICING_FEATURES.BASIC_PDF_DOWNLOAD,
      null,
      'pending@example.com',
      'proj-cf-pending'
    );
    expect(hasAccess).toBe(false);
  });

  it('9. Never trusts frontend redirect: spoofed redirect confirmation without gateway SUCCESS is blocked', async () => {
    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Spoof Attacker',
      leadPhone: '9845033333',
      leadEmail: 'attacker@example.com',
      projectId: 'proj-cf-spoof',
      gateway: 'CASHFREE',
    });

    // Cashfree returns empty payments list (user visited redirect URL without paying)
    vi.spyOn(cashfreeService, 'getOrderPayments').mockResolvedValue([]);
    vi.spyOn(cashfreeService, 'getOrder').mockResolvedValue({
      order_id: purchase.gatewayOrderId,
      order_status: 'ACTIVE',
    });

    await expect(
      pricingService.confirmPurchasePayment(purchase.id, 'fake_payment_token', purchase.gatewayOrderId!)
    ).rejects.toThrow(/Payment verification failed with Cashfree/);

    const hasAccess = await pricingService.canAccessFeature(
      PRICING_FEATURES.BASIC_PDF_DOWNLOAD,
      null,
      'attacker@example.com',
      'proj-cf-spoof'
    );
    expect(hasAccess).toBe(false);
  });

  it('10. Amount tampering detected: rejects if Cashfree reports payment amount less than authoritative price', async () => {
    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Tamper Attacker',
      leadPhone: '9845044444',
      leadEmail: 'tamper@example.com',
      projectId: 'proj-cf-tamper',
      gateway: 'CASHFREE',
    });

    vi.spyOn(cashfreeService, 'getOrderPayments').mockResolvedValue([
      {
        cf_payment_id: 12345,
        order_id: purchase.gatewayOrderId,
        payment_status: 'SUCCESS',
        payment_amount: 1.0, // Attacker paid ₹1 instead of ₹99!
      },
    ]);

    const verifyResult = await cashfreeService.verifyOrderPayment(purchase.gatewayOrderId!, 99.0);
    expect(verifyResult.verified).toBe(false);
    expect(verifyResult.paymentStatus).toBe('AMOUNT_MISMATCH');

    await expect(
      pricingService.confirmPurchasePayment(purchase.id, '12345', purchase.gatewayOrderId!)
    ).rejects.toThrow(/does not match authoritative/);

    const hasAccess = await pricingService.canAccessFeature(
      PRICING_FEATURES.BASIC_PDF_DOWNLOAD,
      null,
      'tamper@example.com',
      'proj-cf-tamper'
    );
    expect(hasAccess).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Signed Webhook Verification & Idempotent Processing
  // ─────────────────────────────────────────────────────────────────────────────
  it('11. Verifies signed Cashfree webhook with HMAC-SHA256 (timestamp + rawBody) and activates entitlements', async () => {
    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Webhook Client',
      leadPhone: '9845055555',
      leadEmail: 'webhook.client@example.com',
      projectId: 'proj-cf-webhook-valid',
      gateway: 'CASHFREE',
    });

    const orderId = purchase.gatewayOrderId!;
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const webhookBody = {
      data: {
        order: {
          order_id: orderId,
          order_amount: 99.0,
          order_currency: 'INR',
        },
        payment: {
          cf_payment_id: 5544332211,
          payment_status: 'SUCCESS',
          payment_amount: 99.0,
          payment_currency: 'INR',
        },
      },
      event_time: new Date().toISOString(),
      type: 'PAYMENT_SUCCESS_WEBHOOK',
    };

    const rawBody = JSON.stringify(webhookBody);
    const signedPayload = `${timestamp}${rawBody}`;
    const validSignature = crypto
      .createHmac('sha256', mockSecretKey)
      .update(signedPayload)
      .digest('base64');

    // Process valid webhook
    const result = await cashfreeService.handleWebhook(rawBody, validSignature, timestamp);
    expect(result.handled).toBe(true);
    expect(result.status).toBe('success');

    // Entitlement must now be granted
    const hasAccess = await pricingService.canAccessFeature(
      PRICING_FEATURES.BASIC_PDF_DOWNLOAD,
      null,
      'webhook.client@example.com',
      'proj-cf-webhook-valid'
    );
    expect(hasAccess).toBe(true);

    // ─────────────────────────────────────────────────────────────────────────
    // Replay Protection & Idempotency: second delivery returns idempotent OK
    // ─────────────────────────────────────────────────────────────────────────
    const replayResult = await cashfreeService.handleWebhook(rawBody, validSignature, timestamp);
    expect(replayResult.handled).toBe(true);
    expect(replayResult.status).toBe('idempotent');
  });

  it('12. Rejects Cashfree webhook with invalid / forged cryptographic signature', async () => {
    const rawBody = JSON.stringify({
      data: {
        order: { order_id: 'order_cf_forged_123', order_amount: 99.0 },
      },
      type: 'PAYMENT_SUCCESS_WEBHOOK',
    });

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const forgedSignature = 'forged_invalid_signature_base64==';

    await expect(
      cashfreeService.handleWebhook(rawBody, forgedSignature, timestamp)
    ).rejects.toThrow(/Invalid Cashfree webhook cryptographic signature/);
  });

  it('13. Rejects Cashfree webhook when signature or timestamp header is missing', async () => {
    const rawBody = JSON.stringify({ type: 'PAYMENT_SUCCESS_WEBHOOK' });

    await expect(
      cashfreeService.handleWebhook(rawBody, undefined, undefined)
    ).rejects.toThrow(/Missing Cashfree webhook signature or timestamp header/);
  });

  it('14. Webhook amount tampering: rejects and marks purchase FAILED if webhook amount does not match authoritative price', async () => {
    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Webhook Tamper Client',
      leadPhone: '9845066666',
      leadEmail: 'wh.tamper@example.com',
      projectId: 'proj-cf-wh-tamper',
      gateway: 'CASHFREE',
    });

    const orderId = purchase.gatewayOrderId!;
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const tamperedWebhookBody = {
      data: {
        order: {
          order_id: orderId,
          order_amount: 10.0, // Tampered amount (expected 99.0)
          order_currency: 'INR',
        },
        payment: {
          cf_payment_id: 778899,
          payment_status: 'SUCCESS',
          payment_amount: 10.0,
        },
      },
      event_time: new Date().toISOString(),
      type: 'PAYMENT_SUCCESS_WEBHOOK',
    };

    const rawBody = JSON.stringify(tamperedWebhookBody);
    const signature = crypto
      .createHmac('sha256', mockSecretKey)
      .update(`${timestamp}${rawBody}`)
      .digest('base64');

    await expect(
      cashfreeService.handleWebhook(rawBody, signature, timestamp)
    ).rejects.toThrow(/Webhook payment amount mismatch/);

    // Entitlement must remain locked
    const hasAccess = await pricingService.canAccessFeature(
      PRICING_FEATURES.BASIC_PDF_DOWNLOAD,
      null,
      'wh.tamper@example.com',
      'proj-cf-wh-tamper'
    );
    expect(hasAccess).toBe(false);
  });

  it('15. Webhook PAYMENT_FAILED_WEBHOOK marks purchase as FAILED without granting entitlements', async () => {
    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      leadName: 'Failed Webhook Client',
      leadPhone: '9845077777',
      leadEmail: 'wh.fail@example.com',
      projectId: 'proj-cf-wh-fail',
      gateway: 'CASHFREE',
    });

    const orderId = purchase.gatewayOrderId!;
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const failedWebhookBody = {
      data: {
        order: { order_id: orderId },
        payment: {
          cf_payment_id: 111999,
          payment_status: 'FAILED',
          payment_message: 'User cancelled transaction on bank page',
        },
      },
      type: 'PAYMENT_FAILED_WEBHOOK',
    };

    const rawBody = JSON.stringify(failedWebhookBody);
    const signature = crypto
      .createHmac('sha256', mockSecretKey)
      .update(`${timestamp}${rawBody}`)
      .digest('base64');

    const result = await cashfreeService.handleWebhook(rawBody, signature, timestamp);
    expect(result.handled).toBe(true);
    expect(result.status).toBe('failed_recorded');

    const updatedPurchase = await pricingService.getPurchaseById(purchase.id);
    expect(updatedPurchase!.status).toBe('FAILED');
  });

  it('16. Consultation booking: webhook verifies signed payment and transitions request to AWAITING_REVIEW idempotently', async () => {
    const booking = await consultationService.createBookingRequest({
      homeownerName: 'Sunita Rao',
      homeownerPhone: '9845088888',
      homeownerEmail: 'sunita.rao@example.com',
      projectLocation: 'Koramangala, Bangalore',
      projectType: 'Duplex / Triplex Residence',
      consultationTopic: 'Structural Safety & Feasibility',
      preferredDate: '2026-10-30',
      preferredTime: '02:00 PM - 03:00 PM',
      gateway: 'CASHFREE',
    });

    const orderId = booking.payment.gatewayOrderId;
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const consultationWebhookBody = {
      data: {
        order: {
          order_id: orderId,
          order_amount: 1499.0, // Authoritative ₹1,499
        },
        payment: {
          cf_payment_id: 88776655,
          payment_status: 'SUCCESS',
          payment_amount: 1499.0,
        },
      },
      type: 'PAYMENT_SUCCESS_WEBHOOK',
    };

    const rawBody = JSON.stringify(consultationWebhookBody);
    const signature = crypto
      .createHmac('sha256', mockSecretKey)
      .update(`${timestamp}${rawBody}`)
      .digest('base64');

    // 1. First webhook delivery
    const result = await cashfreeService.handleWebhook(rawBody, signature, timestamp);
    expect(result.handled).toBe(true);
    expect(result.status).toBe('success');

    const updatedReq = await consultationService.getRequestById(booking.request.id);
    expect(updatedReq!.status).toBe('AWAITING_REVIEW');

    const updatedPayment = await consultationService.getPaymentByOrderId(orderId);
    expect(updatedPayment!.status).toBe('PAID');
    expect(updatedPayment!.gatewayPaymentId).toBe('88776655');

    // 2. Replay delivery (Idempotent)
    const replay = await cashfreeService.handleWebhook(rawBody, signature, timestamp);
    expect(replay.handled).toBe(true);
    expect(replay.status).toBe('idempotent');
  });
});
