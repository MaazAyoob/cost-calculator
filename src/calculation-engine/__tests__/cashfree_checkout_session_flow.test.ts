// ==============================================================================
// Hutty Cashfree Checkout Session Flow Test Suite
// Verifies:
// 1. Controller creates Cashfree order and includes cashfreeOptions with paymentSessionId in data
// 2. Both camelCase (paymentSessionId) and snake_case (payment_session_id) are provided
// 3. Existing pending bookings resume with valid payment session without creating duplicate orders
// 4. Idempotent requests reuse existing session ID without duplicate order generation
// 5. Missing or invalid session ID validation logic protects against invoking SDK with undefined/empty
// 6. Resuming pending checkout works with existing session and avoids duplicate orders
// 7. Authoritative backend verification required for paid status (client callback alone cannot mark paid)
// 8. Saved-project, calculator-snapshot, and standalone consultation flows all succeed with valid Cashfree options
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { consultationService } from '../../../server/src/services/consultation.service';
import { cashfreeService } from '../../../server/src/services/cashfree.service';
import { projectService } from '../../../server/src/services/project.service';
import { createBookingRequest } from '../../../server/src/controllers/consultation.controller';
import { CONSULTATION_PRICE_INR, CONSULTATION_PRICE_PAISE } from '../../../server/src/constants/consultation.constants';

describe('Cashfree Checkout Session Flow & Option Validation', () => {
  const originalEnv = { ...process.env };
  const mockAppId = 'CF_TEST_APP_ID_MOCK_2026';
  const mockSecretKey = 'cf_secret_key_mock_secure_hash_2026';
  let orderCreationCount = 0;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.CASHFREE_APP_ID = mockAppId;
    process.env.CASHFREE_SECRET_KEY = mockSecretKey;
    process.env.CASHFREE_WEBHOOK_SECRET = mockSecretKey;
    process.env.CASHFREE_ENV = 'TEST';
    orderCreationCount = 0;

    vi.spyOn(cashfreeService, 'createOrder').mockImplementation(async (params) => {
      orderCreationCount++;
      const orderId = params.orderId;
      const paymentSessionId = `session_cf_valid_sandbox_${Date.now()}_${orderCreationCount}`;
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

    vi.spyOn(cashfreeService, 'getOrder').mockImplementation(async (orderId) => {
      return {
        order_id: orderId,
        payment_session_id: `session_resumed_${orderId}`,
        order_status: 'ACTIVE',
        order_amount: CONSULTATION_PRICE_INR,
      };
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('1. Controller createBookingRequest returns cashfreeOptions with paymentSessionId in data', async () => {
    let responseStatus: number | undefined;
    let responseJson: any;

    const req = {
      body: {
        homeownerName: 'Sunita Rao',
        homeownerPhone: '9845112233',
        homeownerEmail: 'sunita.rao@example.com',
        projectLocation: 'Whitefield, Bangalore',
        projectType: 'Independent Villa',
        consultationTopic: 'Plan & Layout Review',
        preferredDate: '2026-10-30',
        preferredTime: '10:00 AM - 12:00 PM',
        gateway: 'CASHFREE',
      },
      headers: {},
      user: undefined,
    } as any;

    const res = {
      status: (code: number) => {
        responseStatus = code;
        return res;
      },
      json: (data: any) => {
        responseJson = data;
        return res;
      },
    } as any;

    await createBookingRequest(req, res);

    expect(responseStatus).toBe(201);
    expect(responseJson.success).toBe(true);
    expect(responseJson.data).toBeDefined();

    // Verify cashfreeOptions is present in controller data response
    const { cashfreeOptions, payment, request } = responseJson.data;
    expect(cashfreeOptions).toBeDefined();
    expect(cashfreeOptions.gateway).toBe('CASHFREE');
    expect(cashfreeOptions.amount).toBe(CONSULTATION_PRICE_INR);
    expect(cashfreeOptions.amountMinorUnits).toBe(CONSULTATION_PRICE_PAISE);

    // Verify paymentSessionId reaches checkout options
    expect(typeof cashfreeOptions.paymentSessionId).toBe('string');
    expect(cashfreeOptions.paymentSessionId.length).toBeGreaterThan(0);
    expect(cashfreeOptions.paymentSessionId).toMatch(/^session_cf_valid_sandbox_/);

    // Verify normalized snake_case property also present
    expect(cashfreeOptions.payment_session_id).toBe(cashfreeOptions.paymentSessionId);
    expect(cashfreeOptions.orderId).toBe(payment.gatewayOrderId);
    expect(payment.paymentSessionId).toBe(cashfreeOptions.paymentSessionId);
    expect(payment.payment_session_id).toBe(cashfreeOptions.paymentSessionId);
    expect(request.status).toBe('AWAITING_REVIEW');
    expect(payment.status).toBe('PENDING');
  });

  it('2. Resumes pending payment session without duplicate Cashfree order creation', async () => {
    const email = 'duplicate.check@example.com';
    const date = '2026-11-05';
    const time = '02:00 PM - 04:00 PM';

    // First booking
    const firstBooking = await consultationService.createBookingRequest({
      homeownerName: 'Kavita Krishnan',
      homeownerPhone: '9876543210',
      homeownerEmail: email,
      projectLocation: 'Koramangala, Bangalore',
      projectType: 'Independent Villa',
      consultationTopic: 'Structural Safety Review',
      preferredDate: date,
      preferredTime: time,
      gateway: 'CASHFREE',
    });

    expect(orderCreationCount).toBe(1);
    expect(firstBooking.cashfreeOptions?.paymentSessionId).toBeDefined();

    // Second booking attempt within deduplication window (same email, date, time)
    const secondBooking = await consultationService.createBookingRequest({
      homeownerName: 'Kavita Krishnan',
      homeownerPhone: '9876543210',
      homeownerEmail: email,
      projectLocation: 'Koramangala, Bangalore',
      projectType: 'Independent Villa',
      consultationTopic: 'Structural Safety Review',
      preferredDate: date,
      preferredTime: time,
      gateway: 'CASHFREE',
    });

    // Should NOT create a second Cashfree order
    expect(orderCreationCount).toBe(1);
    expect(secondBooking.request.id).toBe(firstBooking.request.id);
    expect(secondBooking.payment.id).toBe(firstBooking.payment.id);
    expect(secondBooking.cashfreeOptions?.orderId).toBe(firstBooking.payment.gatewayOrderId);
    expect(secondBooking.cashfreeOptions?.paymentSessionId).toBe(`session_resumed_${firstBooking.payment.gatewayOrderId}`);
    expect(secondBooking.cashfreeOptions?.payment_session_id).toBe(secondBooking.cashfreeOptions?.paymentSessionId);
  });

  it('3. Idempotent booking with idempotencyKey returns existing session without duplicate order', async () => {
    const idempotencyKey = `idem-cf-test-${Date.now()}`;

    const first = await consultationService.createBookingRequest({
      idempotencyKey,
      homeownerName: 'Anand Kumar',
      homeownerPhone: '9845012345',
      homeownerEmail: 'anand.kumar@example.com',
      projectLocation: 'Jayanagar, Bangalore',
      projectType: 'Independent Residential House',
      consultationTopic: 'Cost Estimation & BOQ',
      preferredDate: '2026-11-10',
      preferredTime: '11:00 AM - 01:00 PM',
      gateway: 'CASHFREE',
    });

    expect(orderCreationCount).toBe(1);

    const second = await consultationService.createBookingRequest({
      idempotencyKey,
      homeownerName: 'Anand Kumar',
      homeownerPhone: '9845012345',
      homeownerEmail: 'anand.kumar@example.com',
      projectLocation: 'Jayanagar, Bangalore',
      projectType: 'Independent Residential House',
      consultationTopic: 'Cost Estimation & BOQ',
      preferredDate: '2026-11-10',
      preferredTime: '11:00 AM - 01:00 PM',
      gateway: 'CASHFREE',
    });

    expect(orderCreationCount).toBe(1);
    expect(second.request.id).toBe(first.request.id);
    expect(second.payment.id).toBe(first.payment.id);
    expect(second.cashfreeOptions?.paymentSessionId).toBeDefined();
    expect(second.cashfreeOptions?.payment_session_id).toBe(second.cashfreeOptions?.paymentSessionId);
  });

  it('4. Client checkout extraction & validation rules prevent invoking SDK with empty or missing session IDs', () => {
    // Helper replicating the frontend validation in ConsultationBookingModal.tsx
    const validateCheckoutSession = (cashfreeOptions?: any): { canLaunch: boolean; sessionId?: string; error?: string } => {
      const cfSessionId = (
        cashfreeOptions?.paymentSessionId ||
        cashfreeOptions?.payment_session_id ||
        ''
      ).toString().trim();

      if (!cfSessionId) {
        return {
          canLaunch: false,
          error: 'Cashfree payment session is missing or expired. Please retry initiating your booking.',
        };
      }
      return { canLaunch: true, sessionId: cfSessionId };
    };

    // Case A: Valid camelCase paymentSessionId
    const resA = validateCheckoutSession({ paymentSessionId: 'session_cf_12345' });
    expect(resA.canLaunch).toBe(true);
    expect(resA.sessionId).toBe('session_cf_12345');

    // Case B: Valid snake_case payment_session_id
    const resB = validateCheckoutSession({ payment_session_id: 'session_cf_67890' });
    expect(resB.canLaunch).toBe(true);
    expect(resB.sessionId).toBe('session_cf_67890');

    // Case C: Empty string paymentSessionId
    const resC = validateCheckoutSession({ paymentSessionId: '' });
    expect(resC.canLaunch).toBe(false);
    expect(resC.error).toContain('missing or expired');

    // Case D: Whitespace-only paymentSessionId
    const resD = validateCheckoutSession({ paymentSessionId: '   ' });
    expect(resD.canLaunch).toBe(false);
    expect(resD.error).toContain('missing or expired');

    // Case E: Completely undefined cashfreeOptions
    const resE = validateCheckoutSession(undefined);
    expect(resE.canLaunch).toBe(false);
    expect(resE.error).toContain('missing or expired');
  });

  it('5. Successfully supports saved-project, snapshot attachments, and standalone consultation flows with Cashfree', async () => {
    // 5A: Standalone consultation (no project attached)
    const standalone = await consultationService.createBookingRequest({
      homeownerName: 'Deepa Roy',
      homeownerPhone: '9123456789',
      homeownerEmail: 'deepa.roy@example.com',
      projectLocation: 'HSR Layout, Bangalore',
      projectType: 'Villa',
      consultationTopic: 'Interiors & Materials',
      preferredDate: '2026-11-15',
      preferredTime: '10:00 AM - 12:00 PM',
      projectId: null,
      projectSnapshot: null,
      gateway: 'CASHFREE',
    });
    expect(standalone.request.projectId).toBeNull();
    expect(standalone.request.projectSnapshot).toBeNull();
    expect(standalone.cashfreeOptions?.paymentSessionId).toBeDefined();

    // 5B: Calculator snapshot attached
    const withSnapshot = await consultationService.createBookingRequest({
      homeownerName: 'Gaurav Sen',
      homeownerPhone: '9845022334',
      homeownerEmail: 'gaurav.sen@example.com',
      projectLocation: 'Electronic City, Bangalore',
      projectType: 'Independent House',
      consultationTopic: 'Cost Estimation & BOQ',
      preferredDate: '2026-11-16',
      preferredTime: '02:00 PM - 04:00 PM',
      projectSnapshot: {
        source: 'WIZARD_CALCULATION',
        houseType: 'Independent House',
        floors: 2,
        totalBUASqFt: 2400,
        estimatedTotalCostINR: 4800000,
        city: 'Bangalore',
      },
      gateway: 'CASHFREE',
    });
    expect(withSnapshot.request.projectSnapshot).toBeDefined();
    expect(withSnapshot.request.projectSnapshot?.totalBUASqFt).toBe(2400);
    expect(withSnapshot.cashfreeOptions?.paymentSessionId).toBeDefined();

    // 5C: Saved project link (requires authenticated customer context)
    vi.spyOn(projectService, 'getProjectById').mockResolvedValueOnce({
      id: 'proj_saved_manish_123',
      ownerId: 'usr_manish_123',
      userId: 'usr_manish_123',
      name: 'Manish Villa Project',
      city: 'Hebbal, Bangalore',
      configuration: { houseType: 'Independent Villa', floors: 2 },
      calculation: { totalBUASqFt: 2800, totalCostINR: 5600000 },
    } as any);

    const withSavedProject = await consultationService.createBookingRequest(
      {
        homeownerName: 'Manish Verma',
        homeownerPhone: '9876501234',
        homeownerEmail: 'manish.verma@example.com',
        projectLocation: 'Hebbal, Bangalore',
        projectType: 'Independent Villa',
        consultationTopic: 'Structural Safety Review',
        preferredDate: '2026-11-17',
        preferredTime: '04:00 PM - 06:00 PM',
        projectId: 'proj_saved_manish_123',
        gateway: 'CASHFREE',
      },
      { id: 'usr_manish_123', email: 'manish.verma@example.com' }
    );
    expect(withSavedProject.request.projectId).toBe('proj_saved_manish_123');
    expect(withSavedProject.cashfreeOptions?.paymentSessionId).toBeDefined();
    expect(withSavedProject.cashfreeOptions?.amount).toBe(CONSULTATION_PRICE_INR);
  });

  it('6. Authoritative payment verification required — payment remains PENDING without server verification', async () => {
    const booking = await consultationService.createBookingRequest({
      homeownerName: 'Ritu Varma',
      homeownerPhone: '9876543211',
      homeownerEmail: 'ritu.varma@example.com',
      projectLocation: 'BTM Layout, Bangalore',
      projectType: 'Independent Villa',
      consultationTopic: 'Architectural Design',
      preferredDate: '2026-11-20',
      preferredTime: '10:00 AM - 12:00 PM',
      gateway: 'CASHFREE',
    });

    // Verify payment starts as PENDING
    expect(booking.payment.status).toBe('PENDING');

    // Attempt verification when Cashfree reports PENDING
    vi.spyOn(cashfreeService, 'verifyOrderPayment').mockResolvedValueOnce({
      verified: false,
      paymentStatus: 'PENDING',
      message: 'Payment is awaiting confirmation',
    });

    const verifyResult = await consultationService.verifyPayment(booking.request.id, {
      gatewayOrderId: booking.payment.gatewayOrderId,
      gatewayPaymentId: 'cf_pay_pending_test',
    });

    expect(verifyResult.isPending).toBe(true);
    expect(verifyResult.paymentStatus).toBe('PENDING');

    // Authoritative payment record in service must still be PENDING
    const paymentRecord = await consultationService.getPaymentByOrderId(booking.payment.gatewayOrderId);
    expect(paymentRecord?.status).toBe('PENDING');

    // Now simulate Cashfree reporting SUCCESS
    vi.spyOn(cashfreeService, 'verifyOrderPayment').mockResolvedValueOnce({
      verified: true,
      paymentStatus: 'PAID',
      cfPaymentId: 'cf_pay_confirmed_12345',
      orderAmount: CONSULTATION_PRICE_INR,
    });

    const successResult = await consultationService.verifyPayment(booking.request.id, {
      gatewayOrderId: booking.payment.gatewayOrderId,
      gatewayPaymentId: 'cf_pay_confirmed_12345',
    });

    expect(successResult.isPending).toBe(false);
    expect(successResult.payment.status).toBe('PAID');
    expect(successResult.payment.gatewayPaymentId).toBe('cf_pay_confirmed_12345');
  });

  it('7. When gateway is RAZORPAY, cashfreeOptions is strictly undefined so Cashfree validation is not triggered', async () => {
    // When Cashfree is unconfigured, or explicit Razorpay gateway is passed
    const booking = await consultationService.createBookingRequest({
      homeownerName: 'Razorpay User',
      homeownerPhone: '9876543212',
      homeownerEmail: 'razorpay.user@example.com',
      projectLocation: 'Indiranagar, Bangalore',
      projectType: 'Independent Villa',
      consultationTopic: 'Plan & Layout Review',
      preferredDate: '2026-11-25',
      preferredTime: '10:00 AM - 12:00 PM',
      gateway: 'RAZORPAY',
    });

    expect(booking.payment.gateway).toBe('RAZORPAY');
    expect(booking.cashfreeOptions).toBeUndefined();
    expect(booking.razorpayOptions).toBeDefined();
    expect(booking.razorpayOptions.orderId).toBe(booking.payment.gatewayOrderId);
  });

  it('8. Resilient session extraction extracts session from cashfreeOptions, payment, or direct response', () => {
    const extractSession = (bookingData: any): string => {
      const { payment, cashfreeOptions } = bookingData;
      return (
        cashfreeOptions?.paymentSessionId ||
        cashfreeOptions?.payment_session_id ||
        payment?.paymentSessionId ||
        payment?.payment_session_id ||
        bookingData?.paymentSessionId ||
        bookingData?.payment_session_id ||
        ''
      ).toString().trim();
    };

    // Case 1: Standard cashfreeOptions.paymentSessionId
    expect(extractSession({ cashfreeOptions: { paymentSessionId: 'sess_1' } })).toBe('sess_1');

    // Case 2: Snake_case cashfreeOptions.payment_session_id
    expect(extractSession({ cashfreeOptions: { payment_session_id: 'sess_2' } })).toBe('sess_2');

    // Case 3: payment.paymentSessionId (when cashfreeOptions is missing/stripped)
    expect(extractSession({ payment: { paymentSessionId: 'sess_3' } })).toBe('sess_3');

    // Case 4: payment.payment_session_id
    expect(extractSession({ payment: { payment_session_id: 'sess_4' } })).toBe('sess_4');

    // Case 5: direct top-level session ID
    expect(extractSession({ paymentSessionId: 'sess_5' })).toBe('sess_5');

    // Case 6: all empty/missing
    expect(extractSession({})).toBe('');
  });
});
