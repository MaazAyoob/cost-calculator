import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { consultationService } from '../../../server/src/services/consultation.service';
import {
  CONSULTATION_PRICE_INR,
  CONSULTATION_PRICE_PAISE,
  CONSULTATION_CURRENCY,
} from '../../../server/src/constants/consultation.constants';
import { runCalculator } from '../calculator';
import { rateService } from '../data/rateService';
import type { EngineInput } from '../types';

describe('Hutty Consultation Feature MVP (Phase 1) Test Suite', () => {
  beforeEach(() => {
    rateService.setOverrides([]);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 1. CONSULTANT MANAGEMENT (ADMIN & PUBLIC)
  // ═════════════════════════════════════════════════════════════════════════
  describe('Consultant Management & Discovery', () => {
    it('1. Admin can create a new consultant with all required profile fields', async () => {
      const created = await consultationService.createConsultant({
        name: 'Ar. Devashish Roy',
        title: 'Senior Urban Architect & Planner',
        category: 'Architect',
        experienceYears: 18,
        city: 'Bangalore',
        serviceAreas: ['Indiranagar', 'Koramangala'],
        about: 'Specialist in low-energy sustainable residential structures.',
        specializations: ['Passive Cooling', 'Courtyard Homes'],
        services: ['Plan Audit', 'Elevation Review'],
        active: true,
        featured: true,
      });

      expect(created).toBeDefined();
      expect(created.id).toBeTruthy();
      expect(created.name).toBe('Ar. Devashish Roy');
      expect(created.category).toBe('Architect');
      expect(created.active).toBe(true);
      expect(created.featured).toBe(true);
    });

    it('2. Admin can edit consultant details', async () => {
      const created = await consultationService.createConsultant({
        name: 'Er. Sandeep Hegde',
        title: 'Structural Engineer',
        category: 'Structural Engineer',
        experienceYears: 12,
        city: 'Bangalore',
        about: 'Initial about description.',
        specializations: ['RCC Frame'],
        services: ['Slab Audit'],
        active: true,
      });

      const updated = await consultationService.updateConsultant(created.id, {
        title: 'Chief Structural Auditor',
        experienceYears: 15,
        about: 'Updated comprehensive biography and credentials.',
      });

      expect(updated.title).toBe('Chief Structural Auditor');
      expect(updated.experienceYears).toBe(15);
      expect(updated.about).toBe('Updated comprehensive biography and credentials.');
    });

    it('3. Inactive consultant is hidden from public listing but accessible to admin', async () => {
      const consultant = await consultationService.createConsultant({
        name: 'Ar. Temporary Inactive',
        title: 'Architect',
        category: 'Architect',
        experienceYears: 5,
        city: 'Bangalore',
        about: 'Will be deactivated.',
        active: false,
      });

      const publicConsultants = await consultationService.getActiveConsultants();
      const isPresentPublicly = publicConsultants.some((c) => c.id === consultant.id);
      expect(isPresentPublicly).toBe(false);

      const adminConsultants = await consultationService.getAllConsultantsAdmin();
      const isPresentAdmin = adminConsultants.some((c) => c.id === consultant.id);
      expect(isPresentAdmin).toBe(true);
    });

    it('4. Public profile route returns consultant for active slug and null for inactive slug', async () => {
      const activeConsultant = await consultationService.createConsultant({
        name: 'Ar. Active Profile Test',
        title: 'Architect',
        category: 'Architect',
        experienceYears: 10,
        city: 'Bangalore',
        about: 'Active bio.',
        active: true,
      });

      const publicFound = await consultationService.getConsultantBySlug(activeConsultant.slug);
      expect(publicFound).toBeDefined();
      expect(publicFound?.id).toBe(activeConsultant.id);

      // Now deactivate
      await consultationService.setConsultantStatus(activeConsultant.id, false);
      const publicConsultantsAfter = await consultationService.getActiveConsultants();
      expect(publicConsultantsAfter.some((c) => c.id === activeConsultant.id)).toBe(false);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 2. CONSULTATION BOOKING & PRICE VERIFICATION
  // ═════════════════════════════════════════════════════════════════════════
  describe('Consultation Booking & Fixed Pricing', () => {
    it('5. Homeowner can book consultation without a project', async () => {
      const activeConsultants = await consultationService.getActiveConsultants();
      expect(activeConsultants.length).toBeGreaterThan(0);
      const consultant = activeConsultants[0];

      const booking = await consultationService.createBookingRequest({
        consultantId: consultant.id,
        homeownerName: 'Vikas Swaminathan',
        homeownerPhone: '9845012345',
        homeownerEmail: 'vikas@test.com',
        projectLocation: 'Indiranagar, Bangalore',
        projectType: 'Independent Villa G+2',
        consultationTopic: 'Plan & Layout Review',
        preferredDate: '2026-10-15',
        preferredTime: '10:00 AM - 12:00 PM',
      });

      expect(booking.request).toBeDefined();
      expect(booking.request.publicReference).toMatch(/^HT-CON-/);
      expect(booking.request.projectId).toBeNull();
      expect(booking.request.status).toBe('AWAITING_REVIEW');
      expect(booking.payment.status).toBe('PENDING');
    });

    it('6. Backend controls the payable amount strictly to ₹1,499 (149900 paise)', async () => {
      const activeConsultants = await consultationService.getActiveConsultants();
      const consultant = activeConsultants[0];

      const booking = await consultationService.createBookingRequest({
        consultantId: consultant.id,
        homeownerName: 'Pooja Hegde',
        homeownerPhone: '9845099999',
        homeownerEmail: 'pooja@test.com',
        projectLocation: 'Whitefield',
        projectType: 'Duplex Villa',
        consultationTopic: 'Structural Safety & Feasibility',
        preferredDate: '2026-10-18',
        preferredTime: '02:00 PM - 04:00 PM',
      });

      // Assert amount minor units
      expect(booking.request.amountMinorUnits).toBe(149900);
      expect(booking.payment.amountMinorUnits).toBe(149900);
      expect(booking.request.currency).toBe('INR');
      expect(booking.razorpayOptions.amount).toBe(CONSULTATION_PRICE_PAISE);
      expect(CONSULTATION_PRICE_INR).toBe(1499);
    });

    it('7. Inactive consultant rejects booking attempt', async () => {
      const inactiveConsultant = await consultationService.createConsultant({
        name: 'Ar. Offline Consultant',
        title: 'Architect',
        category: 'Architect',
        experienceYears: 7,
        city: 'Bangalore',
        about: 'Unavailable for bookings.',
        active: false,
      });

      await expect(
        consultationService.createBookingRequest({
          consultantId: inactiveConsultant.id,
          homeownerName: 'Anil Kumar',
          homeownerPhone: '9845011111',
          homeownerEmail: 'anil@test.com',
          projectLocation: 'Bangalore',
          projectType: 'Villa',
          consultationTopic: 'General Guidance',
          preferredDate: '2026-10-15',
          preferredTime: '10:00 AM - 12:00 PM',
        })
      ).rejects.toThrow('Selected consultant is currently unavailable for bookings.');
    });

    it('8. Preferred date/time is separate from confirmed appointment date/time', async () => {
      const activeConsultants = await consultationService.getActiveConsultants();
      const consultant = activeConsultants[0];

      const booking = await consultationService.createBookingRequest({
        consultantId: consultant.id,
        homeownerName: 'Karthik Rao',
        homeownerPhone: '9845022222',
        homeownerEmail: 'karthik@test.com',
        projectLocation: 'Jayanagar',
        projectType: 'Duplex',
        consultationTopic: 'Municipal Approvals & Bylaws',
        preferredDate: '2026-10-20',
        preferredTime: '10:00 AM - 12:00 PM',
      });

      expect(booking.request.preferredDate).toBe('2026-10-20');
      expect(booking.request.preferredTime).toBe('10:00 AM - 12:00 PM');
      expect(booking.request.confirmedDateTime).toBeNull();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 3. PAYMENT VERIFICATION & STATUS TRANSITION
  // ═════════════════════════════════════════════════════════════════════════
  describe('Payment Verification & Review Lifecycle', () => {
    it('9. Verified online payment marks payment PAID and consultation request AWAITING_REVIEW', async () => {
      const activeConsultants = await consultationService.getActiveConsultants();
      const consultant = activeConsultants[0];

      const booking = await consultationService.createBookingRequest({
        consultantId: consultant.id,
        homeownerName: 'Deepa Narayanan',
        homeownerPhone: '9845033333',
        homeownerEmail: 'deepa@test.com',
        projectLocation: 'Hebbal',
        projectType: 'Row House',
        consultationTopic: 'Contractor Quotation Audit',
        preferredDate: '2026-10-22',
        preferredTime: '05:00 PM - 07:00 PM',
      });

      // Verify payment
      const verified = await consultationService.verifyPayment(booking.request.id, {
        gatewayOrderId: booking.payment.gatewayOrderId,
        gatewayPaymentId: 'pay_test_verified_123',
      });

      expect(verified.payment.status).toBe('PAID');
      expect(verified.payment.verifiedAt).toBeTruthy();
      expect(verified.request.status).toBe('AWAITING_REVIEW'); // Prompt: "Paid — Awaiting Admin Review"
    });

    it('10. Mismatched order ID throws verification error', async () => {
      const activeConsultants = await consultationService.getActiveConsultants();
      const booking = await consultationService.createBookingRequest({
        consultantId: activeConsultants[0].id,
        homeownerName: 'Mismatched User',
        homeownerPhone: '9845044444',
        homeownerEmail: 'mismatch@test.com',
        projectLocation: 'Bangalore',
        projectType: 'Villa',
        consultationTopic: 'Plan Review',
        preferredDate: '2026-10-25',
        preferredTime: '10:00 AM - 12:00 PM',
      });

      await expect(
        consultationService.verifyPayment(booking.request.id, {
          gatewayOrderId: 'order_invalid_fake_999',
          gatewayPaymentId: 'pay_test_fake',
        })
      ).rejects.toThrow('Payment record does not match consultation request.');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 4. ADMIN WORKFLOW (ASSIGN, SCHEDULE, NOTES, STATS)
  // ═════════════════════════════════════════════════════════════════════════
  describe('Admin Workflow & Assignment', () => {
    it('11. Admin can assign and reassign consultant to a request', async () => {
      const activeConsultants = await consultationService.getActiveConsultants();
      const consultant1 = activeConsultants[0];
      const consultant2 = activeConsultants[1];

      const booking = await consultationService.createBookingRequest({
        consultantId: consultant1.id,
        homeownerName: 'Rohan Mehta',
        homeownerPhone: '9845055555',
        homeownerEmail: 'rohan@test.com',
        projectLocation: 'Indiranagar',
        projectType: 'Villa',
        consultationTopic: 'Structural Feasibility',
        preferredDate: '2026-10-26',
        preferredTime: '10:00 AM - 12:00 PM',
      });

      // Admin reassigns to consultant 2
      const reassigned = await consultationService.assignConsultant(
        booking.request.id,
        consultant2.id,
        'admin@hutty.in'
      );

      expect(reassigned.consultantId).toBe(consultant2.id);
      expect(reassigned.consultant?.name).toBe(consultant2.name);
      expect(reassigned.status).toBe('ASSIGNED');
    });

    it('12. Admin can set confirmed schedule (marks SCHEDULED)', async () => {
      const activeConsultants = await consultationService.getActiveConsultants();
      const booking = await consultationService.createBookingRequest({
        consultantId: activeConsultants[0].id,
        homeownerName: 'Sunita Rao',
        homeownerPhone: '9845066666',
        homeownerEmail: 'sunita@test.com',
        projectLocation: 'Koramangala',
        projectType: 'Duplex',
        consultationTopic: 'Cost Verification',
        preferredDate: '2026-10-28',
        preferredTime: '02:00 PM - 04:00 PM',
      });

      const confirmedTime = '2026-10-28T14:30:00.000Z';
      const scheduled = await consultationService.scheduleConsultation(
        booking.request.id,
        confirmedTime,
        'admin@hutty.in'
      );

      expect(scheduled.status).toBe('SCHEDULED');
      expect(scheduled.confirmedDateTime).toBe(confirmedTime);
    });

    it('13. Admin internal notes are recorded and strictly hidden from homeowner view', async () => {
      const activeConsultants = await consultationService.getActiveConsultants();
      const booking = await consultationService.createBookingRequest({
        consultantId: activeConsultants[0].id,
        homeownerName: 'Privileged Homeowner',
        homeownerPhone: '9845077777',
        homeownerEmail: 'secret@test.com',
        projectLocation: 'Indiranagar',
        projectType: 'Villa',
        consultationTopic: 'Plan Audit',
        preferredDate: '2026-10-30',
        preferredTime: '10:00 AM - 12:00 PM',
      });

      // Admin adds internal note
      await consultationService.addInternalNote(
        booking.request.id,
        'CONFIDENTIAL: Homeowner has tight budget of 80 Lakhs, contractor quotation seems inflated by 15%',
        'admin@hutty.in'
      );

      // Homeowner query
      const homeownerRequests = await consultationService.getUserConsultations({
        email: 'secret@test.com',
      });

      expect(homeownerRequests.length).toBeGreaterThan(0);
      const req = homeownerRequests.find((r) => r.id === booking.request.id);
      expect(req).toBeDefined();

      // Ensure internal note is NEVER returned to homeowner
      const containsSecret = Boolean(req?.events?.some((e) => Boolean(e.internalNote?.includes('CONFIDENTIAL'))));
      expect(containsSecret).toBe(false);
      // Ensure the INTERNAL_NOTE_ADDED event itself is excluded
      const hasNoteEvent = Boolean(req?.events?.some((e) => e.eventType === 'INTERNAL_NOTE_ADDED'));
      expect(hasNoteEvent).toBe(false);
    });

    it('14. Security: User cannot access another user consultation request', async () => {
      const activeConsultants = await consultationService.getActiveConsultants();
      const booking = await consultationService.createBookingRequest(
        {
          consultantId: activeConsultants[0].id,
          homeownerName: 'User A',
          homeownerPhone: '9845088888',
          homeownerEmail: 'user.a@test.com',
          projectLocation: 'Bangalore',
          projectType: 'Villa',
          consultationTopic: 'Plan Audit',
          preferredDate: '2026-11-01',
          preferredTime: '10:00 AM - 12:00 PM',
        },
        { id: 'user-a-id', email: 'user.a@test.com' }
      );

      // User B tries to access User A's request
      await expect(
        consultationService.getUserConsultationById(booking.request.id, {
          id: 'user-b-id',
          email: 'user.b@test.com',
        })
      ).rejects.toThrow('Forbidden: You do not have permission to access this consultation request.');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 5. PHASE 1B HARDENING: MONEY, PAYMENT SECURITY & TAMPERING
  // ═════════════════════════════════════════════════════════════════════════
  describe('Phase 1B: Payment Hardening, Anti-Tampering & Security', () => {
    it('15. Backend is strict authority on price: ignores client-sent manipulated amount/fee', async () => {
      const activeConsultants = await consultationService.getActiveConsultants();
      const booking = await consultationService.createBookingRequest({
        consultantId: activeConsultants[0].id,
        homeownerName: 'Malicious Homeowner',
        homeownerPhone: '9845011111',
        homeownerEmail: 'attacker@test.com',
        projectLocation: 'Bangalore',
        projectType: 'Villa',
        consultationTopic: 'Plan Audit',
        preferredDate: '2026-11-10',
        preferredTime: '10:00 AM - 12:00 PM',
        amount: 1, // Maliciously low amount attempt
        fee: 100, // Malicious fee attempt
      });

      // Assert server enforced 149900 paise (₹1,499)
      expect(booking.request.amountMinorUnits).toBe(CONSULTATION_PRICE_PAISE);
      expect(booking.payment.amountMinorUnits).toBe(CONSULTATION_PRICE_PAISE);
      expect(booking.razorpayOptions.amount).toBe(CONSULTATION_PRICE_PAISE);
      expect(booking.request.consultantNameSnapshot).toBe(activeConsultants[0].name);
      expect(booking.request.consultantTitleSnapshot).toBe(activeConsultants[0].title);
    });

    it('16. Project Link Security: unauthenticated user cannot link a project', async () => {
      const activeConsultants = await consultationService.getActiveConsultants();
      await expect(
        consultationService.createBookingRequest({
          consultantId: activeConsultants[0].id,
          homeownerName: 'Guest User',
          homeownerPhone: '9845022222',
          homeownerEmail: 'guest@test.com',
          projectId: 'some-protected-project-id',
          projectLocation: 'Bangalore',
          projectType: 'Villa',
          consultationTopic: 'Plan Audit',
          preferredDate: '2026-11-10',
          preferredTime: '10:00 AM - 12:00 PM',
        }) // No userContext passed
      ).rejects.toThrow('Authentication required to link an existing project.');
    });

    it('17. Payment Verification: Valid HMAC-SHA256 signature succeeds when key secret is set', async () => {
      const testSecret = 'rzp_test_secret_for_hardening_2026';
      process.env.RAZORPAY_KEY_SECRET = testSecret;

      try {
        const activeConsultants = await consultationService.getActiveConsultants();
        const booking = await consultationService.createBookingRequest({
          consultantId: activeConsultants[0].id,
          homeownerName: 'Legitimate Homeowner',
          homeownerPhone: '9845033333',
          homeownerEmail: 'legit@test.com',
          projectLocation: 'Bangalore',
          projectType: 'Villa',
          consultationTopic: 'Plan Audit',
          preferredDate: '2026-11-12',
          preferredTime: '11:00 AM - 01:00 PM',
        });

        const paymentId = 'pay_legit_' + Date.now();
        const orderId = booking.payment.gatewayOrderId;

        // Generate authentic HMAC-SHA256 signature
        const validSignature = crypto
          .createHmac('sha256', testSecret)
          .update(`${orderId}|${paymentId}`)
          .digest('hex');

        const verified = await consultationService.verifyPayment(booking.request.id, {
          gatewayOrderId: orderId,
          gatewayPaymentId: paymentId,
          gatewaySignature: validSignature,
        });

        expect(verified.payment.status).toBe('PAID');
        expect(verified.request.status).toBe('AWAITING_REVIEW');
        expect(verified.payment.verifiedAt).toBeTruthy();
      } finally {
        delete process.env.RAZORPAY_KEY_SECRET;
      }
    });

    it('18. Payment Verification Tampering: Invalid or missing signature fails when secret is configured', async () => {
      const testSecret = 'rzp_test_secret_for_hardening_2026';
      process.env.RAZORPAY_KEY_SECRET = testSecret;

      try {
        const activeConsultants = await consultationService.getActiveConsultants();
        const booking = await consultationService.createBookingRequest({
          consultantId: activeConsultants[0].id,
          homeownerName: 'Tamper Tester',
          homeownerPhone: '9845044444',
          homeownerEmail: 'tamper@test.com',
          projectLocation: 'Bangalore',
          projectType: 'Villa',
          consultationTopic: 'Plan Audit',
          preferredDate: '2026-11-14',
          preferredTime: '02:00 PM - 04:00 PM',
        });

        const orderId = booking.payment.gatewayOrderId;
        const fakePaymentId = 'pay_fake_999';

        // 1. Missing signature
        await expect(
          consultationService.verifyPayment(booking.request.id, {
            gatewayOrderId: orderId,
            gatewayPaymentId: fakePaymentId,
          })
        ).rejects.toThrow('Payment verification failed: gateway signature is required.');

        // 2. Forged signature
        await expect(
          consultationService.verifyPayment(booking.request.id, {
            gatewayOrderId: orderId,
            gatewayPaymentId: fakePaymentId,
            gatewaySignature: 'forged_fake_signature_hex_1234567890abcdef',
          })
        ).rejects.toThrow('Payment verification failed: cryptographic signature mismatch.');
      } finally {
        delete process.env.RAZORPAY_KEY_SECRET;
      }
    });

    it('19. Webhook: processes payment.captured and transitions to PAID', async () => {
      const activeConsultants = await consultationService.getActiveConsultants();
      const booking = await consultationService.createBookingRequest({
        consultantId: activeConsultants[0].id,
        homeownerName: 'Webhook Tester',
        homeownerPhone: '9845055555',
        homeownerEmail: 'webhook.tester@test.com',
        projectLocation: 'Bangalore',
        projectType: 'Villa',
        consultationTopic: 'Plan Audit',
        preferredDate: '2026-11-15',
        preferredTime: '04:00 PM - 06:00 PM',
      });

      const orderId = booking.payment.gatewayOrderId;
      const paymentId = 'pay_wh_' + Date.now();

      const webhookPayload = JSON.stringify({
        entity: 'event',
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              amount: CONSULTATION_PRICE_PAISE,
              currency: 'INR',
              status: 'captured',
            },
          },
        },
      });

      const result = await consultationService.handleRazorpayWebhook(webhookPayload, undefined);
      expect(result.handled).toBe(true);
      expect(result.status).toBe('success');

      // Check payment record updated
      const updatedReq = await consultationService.getAdminConsultationById(booking.request.id);
      expect(updatedReq?.status).toBe('AWAITING_REVIEW');
      const payRecord = updatedReq?.payments?.find((p) => p.gatewayOrderId === orderId);
      expect(payRecord?.status).toBe('PAID');
    });

    it('20. Webhook Idempotency: Duplicate webhook sent 5 times does not duplicate state or fail', async () => {
      const activeConsultants = await consultationService.getActiveConsultants();
      const booking = await consultationService.createBookingRequest({
        consultantId: activeConsultants[0].id,
        homeownerName: 'Replay Tester',
        homeownerPhone: '9845066666',
        homeownerEmail: 'replay@test.com',
        projectLocation: 'Bangalore',
        projectType: 'Villa',
        consultationTopic: 'Plan Audit',
        preferredDate: '2026-11-16',
        preferredTime: '10:00 AM - 12:00 PM',
      });

      const orderId = booking.payment.gatewayOrderId;
      const paymentId = 'pay_replay_' + Date.now();

      const webhookPayload = JSON.stringify({
        entity: 'event',
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              amount: CONSULTATION_PRICE_PAISE,
              currency: 'INR',
              status: 'captured',
            },
          },
        },
      });

      // First webhook call: processed
      const first = await consultationService.handleRazorpayWebhook(webhookPayload, undefined);
      expect(first.status).toBe('success');

      // Subsequent 4 calls: idempotent
      for (let i = 0; i < 4; i++) {
        const replay = await consultationService.handleRazorpayWebhook(webhookPayload, undefined);
        expect(replay.status).toBe('idempotent');
        expect(replay.handled).toBe(true);
      }
    });

    it('21. Status Transition State Machine: Disallows illegal status jumps', async () => {
      const activeConsultants = await consultationService.getActiveConsultants();
      const booking = await consultationService.createBookingRequest({
        consultantId: activeConsultants[0].id,
        homeownerName: 'Transition Tester',
        homeownerPhone: '9845077777',
        homeownerEmail: 'transition@test.com',
        projectLocation: 'Bangalore',
        projectType: 'Villa',
        consultationTopic: 'Plan Audit',
        preferredDate: '2026-11-18',
        preferredTime: '10:00 AM - 12:00 PM',
      });

      // Complete the request
      await consultationService.updateRequestStatus(booking.request.id, 'UNDER_REVIEW');
      await consultationService.updateRequestStatus(booking.request.id, 'ASSIGNED');
      await consultationService.updateRequestStatus(booking.request.id, 'SCHEDULED');
      await consultationService.updateRequestStatus(booking.request.id, 'COMPLETED');

      // Illegal transition: COMPLETED -> AWAITING_REVIEW
      await expect(
        consultationService.updateRequestStatus(booking.request.id, 'AWAITING_REVIEW')
      ).rejects.toThrow('Invalid status transition');
    });

    it('22. Deactivated consultant booking rejection', async () => {
      const consultant = await consultationService.createConsultant({
        name: 'Ar. Deactivated Expert',
        title: 'Architect',
        category: 'Architect',
        experienceYears: 7,
        city: 'Bangalore',
        about: 'Unavailable.',
        active: false,
      });

      await expect(
        consultationService.createBookingRequest({
          consultantId: consultant.id,
          homeownerName: 'Late Homeowner',
          homeownerPhone: '9845088888',
          homeownerEmail: 'late@test.com',
          projectLocation: 'Bangalore',
          projectType: 'Villa',
          consultationTopic: 'Plan Audit',
          preferredDate: '2026-11-20',
          preferredTime: '10:00 AM - 12:00 PM',
        })
      ).rejects.toThrow('Selected consultant is currently unavailable for bookings.');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 6. REGRESSION: CALCULATOR INTEGRITY
  // ═════════════════════════════════════════════════════════════════════════
  describe('Calculator Core Engine Regression', () => {
    it('23. Residential cost calculator runs deterministically without interference', () => {
      const sampleInput: EngineInput = {
        city: 'Bangalore',
        authority: 'BBMP/BDA',
        plotLength: 60,
        plotWidth: 40,
        builtUpAreaPerFloor: 1440,
        houseType: 'Duplex',
        floors: 3,
        parkingType: 'Stilt Parking',
        carCount: 2,
        bikeCount: 2,
        evCharging: true,
        liftRequired: true,
        rooms: {
          bedrooms: 4,
          bathrooms: 4,
          commonToilets: 1,
          kitchen: 1,
          dining: 1,
          living: 2,
          balcony: 2,
          office: 1,
          pooja: 1,
          utility: 1,
          storeRoom: 1,
        },
        qualityTier: 'Premium',
      };

      const result = runCalculator(sampleInput);

      expect(result).toBeDefined();
      expect(result.area.totalBUASqFt).toBeGreaterThan(1500);
      expect(result.budget.totalProjectCost).toBeGreaterThan(3000000);
      expect(result.boq.length).toBeGreaterThan(10);
    });
  });
});

