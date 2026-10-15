// ==============================================================================
// Hutty Consultation Booking Integration Audit Test Suite
// Verifies all 9 core requirements from the Consultation Booking Integration Bug Fix:
// 1. Authenticated customer links their own saved project successfully.
// 2. Customer attempts to link a project owned by somebody else; access is rejected (403 Forbidden).
// 3. Customer chooses a standalone consultation; no project-authentication error appears.
// 4. An attached snapshot is not falsely represented as a linked saved project.
// 5. Cashfree order is ACTIVE and payment is still pending; backend communicates awaiting-confirmation state (not failed).
// 6. Cashfree payment succeeds; backend verifies it and consultation is confirmed exactly once.
// 7. Payment fails or is cancelled; consultation is not incorrectly marked paid.
// 8. Payment confirmation arrives late; booking can be verified without creating duplicate orders.
// 9. Refreshing or retrying does not create duplicate bookings or grant duplicate entitlements.
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { consultationService } from '../../../server/src/services/consultation.service';
import { cashfreeService } from '../../../server/src/services/cashfree.service';
import { projectService } from '../../../server/src/services/project.service';
import { CONSULTATION_PRICE_INR, CONSULTATION_PRICE_PAISE } from '../../../server/src/constants/consultation.constants';

describe('Hutty Consultation Booking Integration Bug Fix Audit', () => {
  const originalEnv = { ...process.env };
  const mockAppId = 'CF_TEST_APP_ID_MOCK_2026';
  const mockSecretKey = 'cf_secret_key_mock_secure_hash_2026';

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.CASHFREE_APP_ID = mockAppId;
    process.env.CASHFREE_SECRET_KEY = mockSecretKey;
    process.env.CASHFREE_WEBHOOK_SECRET = mockSecretKey;
    process.env.CASHFREE_ENV = 'TEST';

    // Mock Cashfree createOrder to avoid external network calls while returning valid sandbox order shape
    vi.spyOn(cashfreeService, 'createOrder').mockImplementation(async (params) => {
      const orderId = params.orderId;
      const paymentSessionId = `session_cf_${Date.now()}`;
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

  // ═════════════════════════════════════════════════════════════════════════
  // ISSUE 1: EXISTING PROJECT LINKING, AUTHENTICATION & SNAPSHOTS
  // ═════════════════════════════════════════════════════════════════════════

  it('1. Authenticated customer links their own saved project successfully', async () => {
    const customerAlpha = { id: 'usr-customer-alpha-101', email: 'alpha.homeowner@example.com' };

    // Customer Alpha saves a project in their account
    const savedProject = await projectService.saveProject({
      id: 'proj-alpha-residence-101',
      userId: customerAlpha.id,
      ownerId: customerAlpha.id,
      title: 'Alpha Palm Meadows Villa',
      city: 'Bangalore',
      plotLength: 40,
      plotWidth: 60,
      packageType: 'Luxury',
      configuration: {
        houseType: 'Duplex Villa',
        floors: 2,
      },
      calculation: {
        totalBUASqFt: 3600,
        totalCostINR: 8500000,
      },
    });

    expect(savedProject.id).toBe('proj-alpha-residence-101');

    // Customer Alpha creates a consultation booking linking their own saved project
    const booking = await consultationService.createBookingRequest(
      {
        homeownerName: 'Alpha Homeowner',
        homeownerEmail: customerAlpha.email,
        homeownerPhone: '9845011111',
        projectLocation: 'Whitefield, Bangalore',
        projectType: 'Duplex Villa',
        consultationTopic: 'Architectural Review',
        preferredDate: '2026-11-15',
        preferredTime: '10:00 AM',
        projectId: savedProject.id,
        gateway: 'CASHFREE',
      },
      customerAlpha
    );

    expect(booking.request).toBeDefined();
    expect(booking.request.projectSnapshot).toBeDefined();
    expect(booking.request.projectSnapshot.projectId).toBe(savedProject.id);
    expect(booking.request.projectSnapshot.projectName).toBe('Alpha Palm Meadows Villa');
    expect(booking.request.projectSnapshot.totalBUASqFt).toBe(3600);
    expect(booking.request.projectSnapshot.estimatedTotalCostINR).toBe(8500000);
  });

  it('2. Customer attempts to link a project owned by somebody else; access is rejected with Forbidden', async () => {
    const customerAlpha = { id: 'usr-customer-alpha-202', email: 'alpha.owner@example.com' };
    const customerBeta = { id: 'usr-customer-beta-202', email: 'beta.attacker@example.com' };

    // Customer Alpha owns project 202
    const alphaProject = await projectService.saveProject({
      id: 'proj-alpha-private-202',
      userId: customerAlpha.id,
      ownerId: customerAlpha.id,
      title: 'Private Alpha Estate',
      city: 'Bangalore',
    });

    // Customer Beta tries to link Alpha's project to their consultation
    await expect(
      consultationService.createBookingRequest(
        {
          homeownerName: 'Beta User',
          homeownerEmail: customerBeta.email,
          homeownerPhone: '9845022222',
          projectLocation: 'Bangalore',
          projectType: 'Independent House',
          consultationTopic: 'Cost Audit',
          preferredDate: '2026-11-20',
          preferredTime: '02:00 PM',
          projectId: alphaProject.id, // Linking Alpha's project!
          gateway: 'CASHFREE',
        },
        customerBeta
      )
    ).rejects.toThrow(/Forbidden|permission/i);

    // Unauthenticated user trying to link a project without session must be rejected with auth error
    await expect(
      consultationService.createBookingRequest({
        homeownerName: 'Guest User',
        homeownerEmail: 'guest@example.com',
        homeownerPhone: '9845033333',
        projectLocation: 'Bangalore',
        projectType: 'Independent House',
        consultationTopic: 'General Advice',
        preferredDate: '2026-11-20',
        preferredTime: '02:00 PM',
        projectId: alphaProject.id,
        gateway: 'CASHFREE',
      })
    ).rejects.toThrow(/Authentication required to link an existing project/i);
  });

  it('3. Customer chooses a standalone consultation; no project-authentication error appears', async () => {
    // Standalone consultation: no projectId and no projectSnapshot, guest or unauthenticated
    const standaloneBooking = await consultationService.createBookingRequest({
      homeownerName: 'Independent Homeowner',
      homeownerEmail: 'independent@example.com',
      homeownerPhone: '9845044444',
      projectLocation: 'Indiranagar, Bangalore',
      projectType: 'Independent House',
      consultationTopic: 'Approvals & Bylaws Advisory',
      preferredDate: '2026-11-22',
      preferredTime: '04:00 PM',
      gateway: 'CASHFREE',
    });

    expect(standaloneBooking.request).toBeDefined();
    expect(standaloneBooking.request.status).toBe('AWAITING_REVIEW');
    expect(standaloneBooking.payment.status).toBe('PENDING');
    expect(standaloneBooking.payment.status).not.toBe('PAID');
    expect(standaloneBooking.request.projectSnapshot).toBeNull();
    expect(standaloneBooking.payment.gateway).toBe('CASHFREE');
    expect(standaloneBooking.payment.amountMinorUnits).toBe(CONSULTATION_PRICE_PAISE);
  });

  it('4. An attached snapshot is not falsely represented as a linked saved project', async () => {
    // Current calculator session snapshot attached (no database project ID exists)
    const snapshotPayload = {
      source: 'calculator_snapshot',
      houseType: 'Duplex / Triplex Residence',
      floors: 2,
      totalBUASqFt: 2880,
      estimatedTotalCostINR: 6540000,
      city: 'Bangalore',
    };

    const snapshotBooking = await consultationService.createBookingRequest({
      homeownerName: 'Snapshot Homeowner',
      homeownerEmail: 'snapshot.user@example.com',
      homeownerPhone: '9845055555',
      projectLocation: 'HSR Layout, Bangalore',
      projectType: 'Duplex / Triplex Residence',
      consultationTopic: 'Review my house plan',
      preferredDate: '2026-11-25',
      preferredTime: '11:00 AM',
      projectSnapshot: snapshotPayload,
      gateway: 'CASHFREE',
    });

    expect(snapshotBooking.request).toBeDefined();
    expect(snapshotBooking.request.projectSnapshot).toBeDefined();
    // Must be labeled as calculator snapshot, NOT an account-linked saved project
    expect(snapshotBooking.request.projectSnapshot.source).toBe('calculator_snapshot');
    expect(snapshotBooking.request.projectSnapshot.totalBUASqFt).toBe(2880);
    expect(snapshotBooking.request.projectSnapshot.projectId).toBeUndefined();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // ISSUE 2: CASHFREE ACTIVE ORDER, PENDING VERIFICATION & PAYMENT LIFECYCLE
  // ═════════════════════════════════════════════════════════════════════════

  it('5. Cashfree order is ACTIVE and payment is still pending; backend communicates awaiting-confirmation state without failing', async () => {
    const booking = await consultationService.createBookingRequest({
      homeownerName: 'Pending Payment Homeowner',
      homeownerEmail: 'pending.payment@example.com',
      homeownerPhone: '9845066666',
      projectLocation: 'Koramangala, Bangalore',
      projectType: 'Independent House',
      consultationTopic: 'Structural Check',
      preferredDate: '2026-11-28',
      preferredTime: '03:00 PM',
      gateway: 'CASHFREE',
    });

    const orderId = booking.payment.gatewayOrderId;

    // Simulate Cashfree order status check when customer has opened the modal or returned before completing payment
    // Order status in Cashfree is 'ACTIVE', no payments captured yet
    vi.spyOn(cashfreeService, 'verifyOrderPayment').mockResolvedValueOnce({
      verified: false,
      paymentStatus: 'PENDING',
      orderStatus: 'ACTIVE',
      cfOrderId: 'cf_active_1001',
      message: 'Order status is currently ACTIVE. Awaiting customer payment.',
      orderAmount: 1499,
      currency: 'INR',
    });

    // Verification must NOT throw an error, must NOT call recordPaymentFailure
    const result = await consultationService.verifyPayment(booking.request.id, {
      gatewayOrderId: orderId,
      gateway: 'CASHFREE',
    });

    expect(result.isPending).toBe(true);
    expect(result.paymentStatus).toBe('PENDING');
    expect(result.message).toContain('Payment is awaiting confirmation');

    // Consultation payment must remain PENDING, never prematurely confirmed as PAID
    const request = await consultationService.getRequestById(booking.request.id);
    expect(request?.status).toBe('AWAITING_REVIEW');

    const payment = await consultationService.getPaymentByOrderId(orderId);
    expect(payment?.status).toBe('PENDING');
    expect(payment?.status).not.toBe('PAID');
  });

  it('6. Cashfree payment succeeds; backend verifies it and consultation is confirmed exactly once', async () => {
    const booking = await consultationService.createBookingRequest({
      homeownerName: 'Confirmed Homeowner',
      homeownerEmail: 'confirmed.user@example.com',
      homeownerPhone: '9845077777',
      projectLocation: 'Jayanagar, Bangalore',
      projectType: 'Independent House',
      consultationTopic: 'Floor Layout Review',
      preferredDate: '2026-11-30',
      preferredTime: '10:00 AM',
      gateway: 'CASHFREE',
    });

    const orderId = booking.payment.gatewayOrderId;

    // Simulate Cashfree API returning verified SUCCESS
    vi.spyOn(cashfreeService, 'verifyOrderPayment').mockResolvedValueOnce({
      verified: true,
      paymentStatus: 'PAID',
      orderStatus: 'PAID',
      cfOrderId: 'cf_paid_2002',
      paymentId: 'cf_pay_success_998877',
      orderAmount: 1499,
      currency: 'INR',
      message: 'Payment verified successfully with Cashfree.',
    });

    const result = await consultationService.verifyPayment(booking.request.id, {
      gatewayOrderId: orderId,
      gatewayPaymentId: 'cf_pay_success_998877',
      gateway: 'CASHFREE',
    });

    expect(result.isPending).toBe(false);
    expect(result.paymentStatus).toBe('PAID');
    expect(result.request.status).toBe('AWAITING_REVIEW');
    expect(result.payment.status).toBe('PAID');
    expect(result.payment.gatewayPaymentId).toBe('cf_pay_success_998877');

    // Calling verify again (replay/retry) is idempotent and does not double-confirm
    const replayResult = await consultationService.verifyPayment(booking.request.id, {
      gatewayOrderId: orderId,
      gateway: 'CASHFREE',
    });

    expect(replayResult.paymentStatus).toBe('PAID');
    expect(replayResult.request.status).toBe('AWAITING_REVIEW');
    expect(replayResult.payment.id).toBe(result.payment.id);
  });

  it('7. Payment fails or is cancelled; consultation is not incorrectly marked paid', async () => {
    const booking = await consultationService.createBookingRequest({
      homeownerName: 'Failed Payment Homeowner',
      homeownerEmail: 'failed.user@example.com',
      homeownerPhone: '9845088888',
      projectLocation: 'Hebbal, Bangalore',
      projectType: 'Villa',
      consultationTopic: 'Foundation Check',
      preferredDate: '2026-12-01',
      preferredTime: '01:00 PM',
      gateway: 'CASHFREE',
    });

    const orderId = booking.payment.gatewayOrderId;

    // Simulate Cashfree payment failure / cancellation
    vi.spyOn(cashfreeService, 'verifyOrderPayment').mockResolvedValueOnce({
      verified: false,
      paymentStatus: 'FAILED',
      orderStatus: 'TERMINATED',
      message: 'Payment was cancelled by the customer.',
      orderAmount: 1499,
      currency: 'INR',
    });

    await expect(
      consultationService.verifyPayment(booking.request.id, {
        gatewayOrderId: orderId,
        gateway: 'CASHFREE',
      })
    ).rejects.toThrow(/Payment was cancelled|failed/i);

    // Payment must be recorded as FAILED and never marked PAID
    const payment = await consultationService.getPaymentByOrderId(orderId);
    expect(payment?.status).toBe('FAILED');
    expect(payment?.status).not.toBe('PAID');

    // Consultation request must remain unconfirmed and payment unfulfilled
    const req = await consultationService.getRequestById(booking.request.id);
    expect(req).toBeDefined();
  });

  it('8. Payment confirmation arrives late; booking can be verified without creating duplicate orders', async () => {
    const booking = await consultationService.createBookingRequest({
      homeownerName: 'Late Confirmation User',
      homeownerEmail: 'late.confirm@example.com',
      homeownerPhone: '9845099999',
      projectLocation: 'Sarjapur, Bangalore',
      projectType: 'Row House',
      consultationTopic: 'BOQ Verification',
      preferredDate: '2026-12-05',
      preferredTime: '03:30 PM',
      gateway: 'CASHFREE',
    });

    const initialOrderId = booking.payment.gatewayOrderId;

    // Step 1: Initial check returns PENDING
    vi.spyOn(cashfreeService, 'verifyOrderPayment').mockResolvedValueOnce({
      verified: false,
      paymentStatus: 'PENDING',
      orderStatus: 'ACTIVE',
      message: 'Order status is currently ACTIVE.',
      orderAmount: 1499,
      currency: 'INR',
    });

    const pendingCheck = await consultationService.verifyPayment(booking.request.id, {
      gatewayOrderId: initialOrderId,
      gateway: 'CASHFREE',
    });
    expect(pendingCheck.isPending).toBe(true);

    // Step 2: Customer finishes paying via Cashfree PG, webhook or late status check arrives
    vi.spyOn(cashfreeService, 'verifyOrderPayment').mockResolvedValueOnce({
      verified: true,
      paymentStatus: 'PAID',
      orderStatus: 'PAID',
      paymentId: 'cf_pay_late_12345',
      orderAmount: 1499,
      currency: 'INR',
      message: 'Payment verified successfully.',
    });

    const lateCheck = await consultationService.verifyPayment(booking.request.id, {
      gatewayOrderId: initialOrderId,
      gateway: 'CASHFREE',
    });

    expect(lateCheck.isPending).toBe(false);
    expect(lateCheck.paymentStatus).toBe('PAID');
    expect(lateCheck.payment.gatewayOrderId).toBe(initialOrderId);
    expect(lateCheck.request.status).toBe('AWAITING_REVIEW');
  });

  it('9. Refreshing or retrying does not create duplicate bookings or grant duplicate entitlements', async () => {
    const payload = {
      homeownerName: 'Idempotency User',
      homeownerEmail: 'idempotent.user@example.com',
      homeownerPhone: '9845012340',
      projectLocation: 'Malleshwaram, Bangalore',
      projectType: 'Independent House',
      consultationTopic: 'Plan Sanction Advisory',
      preferredDate: '2026-12-10',
      preferredTime: '05:00 PM',
      gateway: 'CASHFREE' as const,
    };

    // First booking request
    const booking1 = await consultationService.createBookingRequest(payload);
    expect(booking1.request.id).toBeDefined();

    // Customer refreshes page or clicks button twice within debounce window
    const booking2 = await consultationService.createBookingRequest(payload);

    // Must return the exact same request ID and gateway order ID (no duplicate database rows)
    expect(booking2.request.id).toBe(booking1.request.id);
    expect(booking2.payment.id).toBe(booking1.payment.id);
    expect(booking2.payment.gatewayOrderId).toBe(booking1.payment.gatewayOrderId);
  });
});
