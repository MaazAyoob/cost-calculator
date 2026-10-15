import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { consultationService } from '../../../server/src/services/consultation.service';
import {
  CONSULTATION_PRICE_INR,
  CONSULTATION_PRICE_PAISE,
} from '../../../server/src/constants/consultation.constants';
import {
  assignConsultant,
  scheduleConsultation,
  updateRequestStatus,
} from '../../../server/src/controllers/consultation.controller';

describe('Authoritative Backend Consultation Payment Guard Test Suite', () => {
  let sampleConsultantId: string;
  let alternateConsultantId: string;

  beforeEach(async () => {
    const consultants = await consultationService.getActiveConsultants();
    expect(consultants.length).toBeGreaterThanOrEqual(2);
    sampleConsultantId = consultants[0].id;
    alternateConsultantId = consultants[1].id;
  });

  const createTestBooking = async (nameSuffix = 'GuardTest') => {
    return consultationService.createBookingRequest({
      consultantId: sampleConsultantId,
      homeownerName: `User ${nameSuffix}`,
      homeownerPhone: '9845012345',
      homeownerEmail: `user.${nameSuffix.toLowerCase()}@test.com`,
      projectLocation: 'Indiranagar, Bangalore',
      projectType: 'Independent Villa',
      consultationTopic: 'Structural Feasibility & Cost Review',
      preferredDate: '2026-11-20',
      preferredTime: '10:00 AM - 12:00 PM',
    });
  };

  // 1. PENDING payment: assignment is rejected
  it('1. PENDING payment: consultant assignment is rejected with clear error', async () => {
    const booking = await createTestBooking('PendingAssign');
    expect(booking.payment.status).toBe('PENDING');

    await expect(
      consultationService.assignConsultant(
        booking.request.id,
        alternateConsultantId,
        'admin@hutty.in'
      )
    ).rejects.toThrow(/verified payment.*required/i);

    // Verify request state unchanged
    const current = await consultationService.getRequestById(booking.request.id);
    expect(current?.consultantId).toBe(sampleConsultantId);
    expect(current?.status).toBe('AWAITING_REVIEW');
  });

  // 2. PENDING payment: scheduling is rejected
  it('2. PENDING payment: appointment scheduling is rejected with clear error', async () => {
    const booking = await createTestBooking('PendingSchedule');
    expect(booking.payment.status).toBe('PENDING');

    const confirmedTime = '2026-11-20T10:30:00.000Z';
    await expect(
      consultationService.scheduleConsultation(
        booking.request.id,
        confirmedTime,
        'admin@hutty.in'
      )
    ).rejects.toThrow(/verified payment.*required/i);

    // Verify schedule state unchanged
    const current = await consultationService.getRequestById(booking.request.id);
    expect(current?.confirmedDateTime).toBeNull();
    expect(current?.status).toBe('AWAITING_REVIEW');
  });

  // 3. PENDING payment: transitions into paid-service states are rejected
  it('3. PENDING payment: status transitions into paid-service delivery states are rejected', async () => {
    const booking = await createTestBooking('PendingTransition');
    expect(booking.payment.status).toBe('PENDING');

    // Attempt UNDER_REVIEW
    await expect(
      consultationService.updateRequestStatus(booking.request.id, 'UNDER_REVIEW', 'admin@hutty.in')
    ).rejects.toThrow(/verified payment.*required/i);

    // Attempt ASSIGNED
    await expect(
      consultationService.updateRequestStatus(booking.request.id, 'ASSIGNED', 'admin@hutty.in')
    ).rejects.toThrow(/verified payment.*required/i);

    // State must remain AWAITING_REVIEW
    const current = await consultationService.getRequestById(booking.request.id);
    expect(current?.status).toBe('AWAITING_REVIEW');
  });

  // 4. FAILED payment: assignment and scheduling are rejected
  it('4. FAILED payment: assignment, scheduling and paid transitions are rejected', async () => {
    const booking = await createTestBooking('FailedPayment');

    // Mark payment as FAILED
    const payment = await consultationService.getPaymentByOrderId(booking.payment.gatewayOrderId);
    expect(payment).toBeDefined();
    if (payment) payment.status = 'FAILED';

    // 4a. Assignment rejected
    await expect(
      consultationService.assignConsultant(
        booking.request.id,
        alternateConsultantId,
        'admin@hutty.in'
      )
    ).rejects.toThrow(/payment has not been verified \(current payment status: FAILED\)/i);

    // 4b. Scheduling rejected
    await expect(
      consultationService.scheduleConsultation(
        booking.request.id,
        '2026-11-21T11:00:00.000Z',
        'admin@hutty.in'
      )
    ).rejects.toThrow(/payment has not been verified \(current payment status: FAILED\)/i);

    // 4c. Paid transition rejected
    await expect(
      consultationService.updateRequestStatus(booking.request.id, 'UNDER_REVIEW', 'admin@hutty.in')
    ).rejects.toThrow(/payment has not been verified \(current payment status: FAILED\)/i);

    // State remains unchanged
    const current = await consultationService.getRequestById(booking.request.id);
    expect(current?.status).toBe('AWAITING_REVIEW');
  });

  // 5. Missing payment record: paid-service operations fail closed
  it('5. Missing payment record: operations fail closed', async () => {
    const dummyRequestId = 'req-no-payment-' + Date.now().toString(36);

    // Guard directly on non-existent or payment-free request
    await expect(
      consultationService.assertConsultationPaymentVerified(dummyRequestId, 'test action')
    ).rejects.toThrow(/no payment record found/i);
  });

  // 6. PAID payment: valid assignment succeeds
  it('6. PAID payment: valid assignment succeeds', async () => {
    const booking = await createTestBooking('PaidAssign');

    // Simulate verified Cashfree/gateway payment
    const payment = await consultationService.getPaymentByOrderId(booking.payment.gatewayOrderId);
    expect(payment).toBeDefined();
    if (payment) {
      payment.status = 'PAID';
      payment.amountMinorUnits = CONSULTATION_PRICE_PAISE;
    }

    const assigned = await consultationService.assignConsultant(
      booking.request.id,
      alternateConsultantId,
      'admin@hutty.in'
    );

    expect(assigned.consultantId).toBe(alternateConsultantId);
    expect(assigned.status).toBe('ASSIGNED');
  });

  // 7. PAID payment: valid scheduling succeeds
  it('7. PAID payment: valid scheduling succeeds', async () => {
    const booking = await createTestBooking('PaidSchedule');

    const payment = await consultationService.getPaymentByOrderId(booking.payment.gatewayOrderId);
    expect(payment).toBeDefined();
    if (payment) {
      payment.status = 'PAID';
      payment.amountMinorUnits = CONSULTATION_PRICE_PAISE;
    }

    const confirmedTime = '2026-11-22T15:00:00.000Z';
    const scheduled = await consultationService.scheduleConsultation(
      booking.request.id,
      confirmedTime,
      'admin@hutty.in'
    );

    expect(scheduled.status).toBe('SCHEDULED');
    expect(scheduled.confirmedDateTime).toBe(confirmedTime);
  });

  // 8. PAID payment: valid status transitions still work
  it('8. PAID payment: valid service status transitions proceed as expected', async () => {
    const booking = await createTestBooking('PaidTransitions');

    const payment = await consultationService.getPaymentByOrderId(booking.payment.gatewayOrderId);
    if (payment) {
      payment.status = 'PAID';
      payment.amountMinorUnits = CONSULTATION_PRICE_PAISE;
    }

    // AWAITING_REVIEW -> UNDER_REVIEW
    const underReview = await consultationService.updateRequestStatus(
      booking.request.id,
      'UNDER_REVIEW',
      'admin@hutty.in'
    );
    expect(underReview.status).toBe('UNDER_REVIEW');

    // UNDER_REVIEW -> ASSIGNED
    const assigned = await consultationService.updateRequestStatus(
      booking.request.id,
      'ASSIGNED',
      'admin@hutty.in'
    );
    expect(assigned.status).toBe('ASSIGNED');

    // ASSIGNED -> SCHEDULED
    const scheduled = await consultationService.updateRequestStatus(
      booking.request.id,
      'SCHEDULED',
      'admin@hutty.in'
    );
    expect(scheduled.status).toBe('SCHEDULED');

    // SCHEDULED -> COMPLETED
    const completed = await consultationService.updateRequestStatus(
      booking.request.id,
      'COMPLETED',
      'admin@hutty.in'
    );
    expect(completed.status).toBe('COMPLETED');
  });

  // 9. Cancellation and rejection remain possible when appropriate without payment
  it('9. Administrative cleanup: CANCELLED and REJECTED transitions succeed for unpaid bookings', async () => {
    // 9a. Cancel an unpaid booking
    const unpaid1 = await createTestBooking('UnpaidCancel');
    expect(unpaid1.payment.status).toBe('PENDING');

    const cancelled = await consultationService.updateRequestStatus(
      unpaid1.request.id,
      'CANCELLED',
      'admin@hutty.in'
    );
    expect(cancelled.status).toBe('CANCELLED');

    // 9b. Reject a failed-payment booking
    const unpaid2 = await createTestBooking('FailedReject');
    const payment2 = await consultationService.getPaymentByOrderId(unpaid2.payment.gatewayOrderId);
    if (payment2) payment2.status = 'FAILED';

    const rejected = await consultationService.updateRequestStatus(
      unpaid2.request.id,
      'REJECTED',
      'admin@hutty.in'
    );
    expect(rejected.status).toBe('REJECTED');
  });

  // 10. Direct API endpoint calls cannot bypass the payment guard
  it('10. Controller endpoints enforce payment guard and return HTTP 400 for unpaid bookings', async () => {
    const booking = await createTestBooking('EndpointBypassTest');
    expect(booking.payment.status).toBe('PENDING');

    // Helper to mock Express req & res
    const createMockReqRes = (params: any, body: any) => {
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status(code: number) {
          statusCode = code;
          return this;
        },
        json(data: any) {
          jsonPayload = data;
          return this;
        },
      };
      const req: any = {
        params,
        body,
        user: { email: 'admin@hutty.in', role: 'ADMIN' },
      };
      return { req, res, getStatus: () => statusCode, getJson: () => jsonPayload };
    };

    // 10a. Assign endpoint
    const assignMock = createMockReqRes(
      { id: booking.request.id },
      { consultantId: alternateConsultantId }
    );
    await assignConsultant(assignMock.req, assignMock.res);
    expect(assignMock.getStatus()).toBe(400);
    expect(assignMock.getJson().success).toBe(false);
    expect(assignMock.getJson().error).toMatch(/verified payment.*required/i);

    // 10b. Schedule endpoint
    const scheduleMock = createMockReqRes(
      { id: booking.request.id },
      { confirmedDateTime: '2026-11-20T10:00:00.000Z' }
    );
    await scheduleConsultation(scheduleMock.req, scheduleMock.res);
    expect(scheduleMock.getStatus()).toBe(400);
    expect(scheduleMock.getJson().success).toBe(false);
    expect(scheduleMock.getJson().error).toMatch(/verified payment.*required/i);

    // 10c. Status update endpoint
    const statusMock = createMockReqRes(
      { id: booking.request.id },
      { status: 'UNDER_REVIEW' }
    );
    await updateRequestStatus(statusMock.req, statusMock.res);
    expect(statusMock.getStatus()).toBe(400);
    expect(statusMock.getJson().success).toBe(false);
    expect(statusMock.getJson().error).toMatch(/verified payment.*required/i);
  });

  // 11. Payment status and request status remain unchanged when rejected
  it('11. Rejected operations leave request and payment states strictly unchanged', async () => {
    const booking = await createTestBooking('UnchangedStateTest');
    const originalRequest = await consultationService.getRequestById(booking.request.id);
    const originalPayment = await consultationService.getPaymentByOrderId(booking.payment.gatewayOrderId);

    try {
      await consultationService.assignConsultant(
        booking.request.id,
        alternateConsultantId,
        'admin@hutty.in'
      );
    } catch {}

    const afterRequest = await consultationService.getRequestById(booking.request.id);
    const afterPayment = await consultationService.getPaymentByOrderId(booking.payment.gatewayOrderId);

    expect(afterRequest?.status).toBe(originalRequest?.status);
    expect(afterRequest?.consultantId).toBe(originalRequest?.consultantId);
    expect(afterRequest?.confirmedDateTime).toBe(originalRequest?.confirmedDateTime);
    expect(afterPayment?.status).toBe(originalPayment?.status);
  });

  // 12. Both database and in-memory paths enforce equivalent safeguards
  it('12. Refunded payment and amount mismatch are strictly rejected', async () => {
    const booking = await createTestBooking('RefundAndMismatch');

    // 12a. Amount mismatch
    const payment = await consultationService.getPaymentByOrderId(booking.payment.gatewayOrderId);
    if (payment) {
      payment.status = 'PAID';
      payment.amountMinorUnits = 9900; // ₹99 instead of ₹1,499
    }

    await expect(
      consultationService.assignConsultant(
        booking.request.id,
        alternateConsultantId,
        'admin@hutty.in'
      )
    ).rejects.toThrow(/amount mismatch/i);

    // 12b. REFUNDED payment cannot satisfy guard
    if (payment) {
      payment.status = 'REFUNDED';
      payment.amountMinorUnits = CONSULTATION_PRICE_PAISE;
    }

    await expect(
      consultationService.assignConsultant(
        booking.request.id,
        alternateConsultantId,
        'admin@hutty.in'
      )
    ).rejects.toThrow(/payment has not been verified \(current payment status: REFUNDED\)/i);
  });

  // 13. Production database query failure fails closed and rejects operations without falling back to stale in-memory records
  it('13. Production database query failure fails closed and does NOT fall back to stale in-memory records', async () => {
    const booking = await createTestBooking('DbFailureTest');
    const originalEnv = process.env.NODE_ENV;
    const originalPrisma = (consultationService as any).prisma;

    try {
      process.env.NODE_ENV = 'production';

      // Inject a stale PAID record in memory
      const memPayments = (consultationService as any).inMemoryPayments as any[];
      const pIdx = memPayments.findIndex((p) => p.consultationRequestId === booking.request.id);
      if (pIdx !== -1) {
        memPayments[pIdx].status = 'PAID';
        memPayments[pIdx].amountMinorUnits = CONSULTATION_PRICE_PAISE;
      }

      // Configure mock Prisma that fails with a database connection error
      (consultationService as any).prisma = {
        consultationPayment: {
          findMany: vi.fn().mockRejectedValue(new Error('PostgreSQL connection timeout: pool exhausted')),
        },
      };

      // Guard must fail closed with AUTHORITATIVE_STORAGE_UNAVAILABLE and reject assignment
      await expect(
        consultationService.assignConsultant(
          booking.request.id,
          alternateConsultantId,
          'admin@hutty.in'
        )
      ).rejects.toThrow(/AUTHORITATIVE_STORAGE_UNAVAILABLE/i);

      // Verify scheduling also fails closed
      await expect(
        consultationService.scheduleConsultation(
          booking.request.id,
          '2026-11-20T10:00:00.000Z',
          'admin@hutty.in'
        )
      ).rejects.toThrow(/AUTHORITATIVE_STORAGE_UNAVAILABLE/i);
    } finally {
      process.env.NODE_ENV = originalEnv;
      (consultationService as any).prisma = originalPrisma;
    }
  });

  // 14. Empty database query result is authoritative and cannot be overridden by stale in-memory records
  it('14. Empty database query result is authoritative and cannot be overridden by stale in-memory records', async () => {
    const booking = await createTestBooking('DbEmptyResultTest');
    const originalPrisma = (consultationService as any).prisma;

    try {
      // Inject a stale PAID record in memory
      const memPayments = (consultationService as any).inMemoryPayments as any[];
      const pIdx = memPayments.findIndex((p) => p.consultationRequestId === booking.request.id);
      if (pIdx !== -1) {
        memPayments[pIdx].status = 'PAID';
        memPayments[pIdx].amountMinorUnits = CONSULTATION_PRICE_PAISE;
      }

      // Database returns empty array: 0 records found for this consultation
      (consultationService as any).prisma = {
        consultationPayment: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      const dbPayments = await consultationService.getPaymentsByRequestId(booking.request.id);
      expect(dbPayments).toEqual([]);

      // assertConsultationPaymentVerified must fail closed
      await expect(
        consultationService.assertConsultationPaymentVerified(booking.request.id, 'assign a consultant to')
      ).rejects.toThrow(/no payment record found/i);
    } finally {
      (consultationService as any).prisma = originalPrisma;
    }
  });

  // 15. In-memory payment lookup continues to work cleanly when database persistence is not configured
  it('15. Supported in-memory lookup works as expected when database persistence is not configured', async () => {
    const booking = await createTestBooking('InMemorySupported');
    const originalPrisma = (consultationService as any).prisma;

    try {
      (consultationService as any).prisma = null;

      // Initially unpaid (PENDING)
      await expect(
        consultationService.assignConsultant(
          booking.request.id,
          alternateConsultantId,
          'admin@hutty.in'
        )
      ).rejects.toThrow(/verified payment.*required/i);

      // Once marked PAID in in-memory store
      const memPayments = (consultationService as any).inMemoryPayments as any[];
      const pIdx = memPayments.findIndex((p) => p.consultationRequestId === booking.request.id);
      expect(pIdx).toBeGreaterThanOrEqual(0);
      memPayments[pIdx].status = 'PAID';
      memPayments[pIdx].amountMinorUnits = CONSULTATION_PRICE_PAISE;

      const assigned = await consultationService.assignConsultant(
        booking.request.id,
        alternateConsultantId,
        'admin@hutty.in'
      );
      expect(assigned.status).toBe('ASSIGNED');
      expect(assigned.consultantId).toBe(alternateConsultantId);
    } finally {
      (consultationService as any).prisma = originalPrisma;
    }
  });

  // 16. Authoritative database returning a valid PAID record allows assignment and scheduling
  it('16. Authoritative database returning a valid PAID record permits assignment and scheduling', async () => {
    const booking = await createTestBooking('AuthoritativeDbSuccess');
    const originalPrisma = (consultationService as any).prisma;

    try {
      const now = new Date();
      (consultationService as any).prisma = {
        consultationPayment: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: 'pay-db-authoritative-1',
              consultationRequestId: booking.request.id,
              gateway: 'CASHFREE',
              gatewayOrderId: 'order_cf_authoritative',
              gatewayPaymentId: 'pay_cf_authoritative',
              gatewaySignature: null,
              amountMinorUnits: CONSULTATION_PRICE_PAISE,
              currency: 'INR',
              status: 'PAID',
              verifiedAt: now,
              rawResponseJson: null,
              createdAt: now,
              updatedAt: now,
            },
          ]),
        },
        consultationRequest: {
          update: vi.fn().mockResolvedValue({}),
        },
        consultationEvent: {
          create: vi.fn().mockResolvedValue({}),
        },
        $transaction: vi.fn().mockResolvedValue([{ status: 'ASSIGNED' }, {}]),
      };

      const verified = await consultationService.assertConsultationPaymentVerified(
        booking.request.id,
        'assign a consultant to'
      );
      expect(verified.status).toBe('PAID');
      expect(verified.amountMinorUnits).toBe(CONSULTATION_PRICE_PAISE);

      const assigned = await consultationService.assignConsultant(
        booking.request.id,
        alternateConsultantId,
        'admin@hutty.in'
      );
      expect(assigned.status).toBe('ASSIGNED');
      expect(assigned.consultantId).toBe(alternateConsultantId);
    } finally {
      (consultationService as any).prisma = originalPrisma;
    }
  });
});
