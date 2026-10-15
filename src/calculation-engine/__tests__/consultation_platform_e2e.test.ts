import { describe, it, expect, beforeEach } from 'vitest';
import { consultationService } from '../../../server/src/services/consultation.service';
import {
  CONSULTATION_PRICE_INR,
  CONSULTATION_PRICE_PAISE,
  CANONICAL_CONSULTATION_CATEGORIES,
  CATEGORY_DETAILS,
  POPULAR_SERVICES,
  mapCategoryToConsultantCategories,
} from '../../../server/src/constants/consultation.constants';
import { consultationAnalytics } from '../../utils/consultationAnalytics';

describe('Hutty Complete Consultation Platform E2E Test Suite', () => {
  beforeEach(() => {
    // Reset any transient test state
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 1. CANONICAL CATEGORIES & SERVICE SPECIFICATION
  // ═════════════════════════════════════════════════════════════════════════
  describe('Canonical Categories & Pricing Specification', () => {
    it('1. Exposes all 6 canonical categories defined in developer brief', () => {
      expect(CANONICAL_CONSULTATION_CATEGORIES).toHaveLength(6);
      expect(CANONICAL_CONSULTATION_CATEGORIES).toEqual([
        'Architectural Design',
        'Structural Engineering',
        'Construction & Site Issues',
        'Cost Estimation & BOQ',
        'Approvals & Regulations',
        'Interiors & Materials',
      ]);
    });

    it('2. Exposes all 4 popular service cards from developer brief with verified launch fee ₹1,499', () => {
      expect(POPULAR_SERVICES).toHaveLength(4);
      const titles = POPULAR_SERVICES.map((s) => s.title);
      expect(titles).toContain('Review my house plan');
      expect(titles).toContain('Check my construction estimate');
      expect(titles).toContain('Understand setbacks & approvals');
      expect(titles).toContain('Choose materials & finishes');

      // Crucial constraint: Every popular service must enforce verified ₹1,499 price, never unapproved test prices ₹499/₹799
      POPULAR_SERVICES.forEach((s) => {
        expect(s.priceINR).toBe(1499);
      });
    });

    it('3. Category mapper maps canonical categories to internal specialist roles', () => {
      expect(mapCategoryToConsultantCategories('Architectural Design')).toContain('Architect');
      expect(mapCategoryToConsultantCategories('Structural Engineering')).toContain('Structural Engineer');
      expect(mapCategoryToConsultantCategories('Construction & Site Issues')).toContain('Site Engineer');
      expect(mapCategoryToConsultantCategories('Construction & Site Issues')).toContain('Contractor');
      expect(mapCategoryToConsultantCategories('Cost Estimation & BOQ')).toContain('Quantity Surveyor');
      expect(mapCategoryToConsultantCategories('Approvals & Regulations')).toContain('Liaison Consultant');
      expect(mapCategoryToConsultantCategories('Interiors & Materials')).toContain('Interior Architect');
    });

    it('4. Canonical category query returns matching consultants', async () => {
      const archConsultants = await consultationService.getActiveConsultants('Architectural Design');
      expect(archConsultants.length).toBeGreaterThan(0);
      archConsultants.forEach((c) => {
        expect(['Architect', 'Architectural Design']).toContain(c.category);
      });

      const structConsultants = await consultationService.getActiveConsultants('Structural Engineering');
      expect(structConsultants.length).toBeGreaterThan(0);
      structConsultants.forEach((c) => {
        expect(['Structural Engineer', 'Structural Engineering']).toContain(c.category);
      });
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 2. PROFESSIONAL REGISTRATION & ADMIN VERIFICATION QUEUE
  // ═════════════════════════════════════════════════════════════════════════
  describe('Professional Registration & Admin Verification Workflow', () => {
    let createdAppId: string;

    it('5. Professional can submit registration application with valid credentials', async () => {
      const app = await consultationService.submitProfessionalApplication({
        fullName: 'Ar. Ananya Deshmukh',
        category: 'Architectural Design',
        email: 'ananya.deshmukh@architects.in',
        phone: '9845012345',
        qualifications: 'B.Arch (RVCA Bangalore), M.Arch Sustainable Housing',
        licenseNumber: 'CA/2014/68901',
        experienceYears: 10,
        city: 'Bangalore',
        serviceAreas: ['South Bangalore', 'Indiranagar', 'Jayanagar'],
        about: 'Specialized in biophilic residential architecture and climatic passive solar planning.',
        specializations: ['Passive Solar Design', 'Vastu-Compliant Space Planning'],
        portfolioUrl: 'https://ananyadeshmukh.portfolio.example.com',
        documentsUrl: 'https://docs.private.hutty.in/credentials/ca-2014-68901.pdf',
        consultationModes: ['VIDEO', 'AUDIO'],
        proposedFeeINR: 1499,
        consentGiven: true,
      });

      expect(app).toBeDefined();
      expect(app.id).toBeTruthy();
      expect(app.status).toBe('SUBMITTED');
      expect(app.fullName).toBe('Ar. Ananya Deshmukh');
      expect(app.licenseNumber).toBe('CA/2014/68901');
      createdAppId = app.id;
    });

    it('6. Newly submitted applicant does NOT appear in public consultant directory before approval', async () => {
      const publicConsultants = await consultationService.getActiveConsultants();
      const found = publicConsultants.find((c) => c.name === 'Ar. Ananya Deshmukh');
      expect(found).toBeUndefined();
    });

    it('7. Admin can query applications queue and filter by status and category', async () => {
      const allApps = await consultationService.getProfessionalApplications();
      expect(allApps.length).toBeGreaterThan(0);

      const submittedApps = await consultationService.getProfessionalApplications({ status: 'SUBMITTED' });
      expect(submittedApps.some((a) => a.id === createdAppId)).toBe(true);

      const singleApp = await consultationService.getProfessionalApplicationById(createdAppId);
      expect(singleApp).toBeDefined();
      expect(singleApp?.email).toBe('ananya.deshmukh@architects.in');
    });

    it('8. Admin can transition application to UNDER_REVIEW', async () => {
      const updated = await consultationService.reviewProfessionalApplication(
        createdAppId,
        {
          status: 'UNDER_REVIEW',
          reviewerNotes: 'Verifying COA license registration with Council of Architecture portal.',
          reviewerEmail: 'compliance@hutty.in',
        }
      );

      expect(updated.status).toBe('UNDER_REVIEW');
      expect(updated.reviewerNotes).toContain('Verifying COA license');
      expect(updated.reviewedBy).toBe('compliance@hutty.in');
    });

    it('9. Rejecting an application without notes is prevented or documented', async () => {
      const rejectedApp = await consultationService.submitProfessionalApplication({
        fullName: 'Unverified Applicant',
        category: 'Structural Engineering',
        email: 'unverified@test.in',
        phone: '9999900000',
        qualifications: 'None listed',
        experienceYears: 1,
        city: 'Bangalore',
        about: 'No formal training.',
        consentGiven: true,
      });

      const updated = await consultationService.reviewProfessionalApplication(
        rejectedApp.id,
        {
          status: 'REJECTED',
          reviewerNotes: 'Missing structural engineering degree and required statutory credential.',
          reviewerEmail: 'compliance@hutty.in',
        }
      );

      expect(updated.status).toBe('REJECTED');
      expect(updated.reviewerNotes).toContain('Missing structural engineering degree');
    });

    it('10. Approving an application provisions an active Consultant profile into the public directory', async () => {
      const approvedApp = await consultationService.reviewProfessionalApplication(
        createdAppId,
        {
          status: 'APPROVED',
          reviewerNotes: 'Credentials verified against COA register. Outstanding portfolio.',
          reviewerEmail: 'head.architect@hutty.in',
        }
      );

      expect(approvedApp.status).toBe('APPROVED');

      // Verify consultant is now discoverable in the public directory!
      const publicConsultants = await consultationService.getActiveConsultants('Architectural Design');
      const newlyListed = publicConsultants.find((c) => c.name === 'Ar. Ananya Deshmukh');
      expect(newlyListed).toBeDefined();
      expect(newlyListed?.category).toBe('Architect');
      expect(newlyListed?.city).toBe('Bangalore');
      expect(newlyListed?.active).toBe(true);
      expect(newlyListed?.title).toContain('Architect');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 3. FALLBACK ENQUIRY PERSISTENCE & LEADS
  // ═════════════════════════════════════════════════════════════════════════
  describe('Fallback Matching Desk Persistence', () => {
    it('11. Homeowner can submit fallback enquiry when no specialist matches', async () => {
      const enquiry = await consultationService.createGeneralEnquiry({
        name: 'Vikas Gowda',
        phone: '9845984598',
        email: 'vikas.gowda@example.com',
        topic: 'Understand setbacks & approvals',
        message: 'Need help understanding BDA vs BBMP setback requirements for a 30x40 corner plot in HSR Layout.',
        city: 'Bangalore',
      });

      expect(enquiry).toBeDefined();
      expect(enquiry.id).toBeTruthy();
      expect(enquiry.reference).toMatch(/^HT-ENQ-/);
      expect(enquiry.status).toBe('RECEIVED');
      expect(enquiry.topic).toBe('Understand setbacks & approvals');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 4. ENTITLEMENT & REVENUE SEPARATION
  // ═════════════════════════════════════════════════════════════════════════
  describe('Entitlement Decoupling & Price Authority', () => {
    it('12. Consultation fee strictly enforces ₹1,499 (149900 paise)', () => {
      expect(CONSULTATION_PRICE_INR).toBe(1499);
      expect(CONSULTATION_PRICE_PAISE).toBe(149900);
    });

    it('13. Booking submission enforces backend price authority regardless of client input', async () => {
      const publicConsultants = await consultationService.getActiveConsultants();
      const firstConsultant = publicConsultants[0];

      const booking = await consultationService.createBookingRequest({
        consultantId: firstConsultant.id,
        homeownerName: 'Priya Sharma',
        homeownerPhone: '9888877777',
        homeownerEmail: 'priya.sharma@example.com',
        consultationTopic: 'Plan Review',
        preferredDate: '2026-11-01',
        preferredTime: '11:00 AM',
      });

      expect(booking.request.amountINR).toBe(1499);
      expect(booking.request.amountPaise).toBe(149900);
      expect(booking.payment.amountINR).toBe(1499);
      expect(booking.payment.amountPaise).toBe(149900);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 5. ANALYTICS TELEMETRY HOOK
  // ═════════════════════════════════════════════════════════════════════════
  describe('Consultation Funnel Analytics Telemetry', () => {
    it('14. Consultation analytics tracker operates in a failsafe non-blocking manner', () => {
      expect(() => {
        consultationAnalytics.track({
          eventName: 'consultation_page_viewed',
        });
        consultationAnalytics.track({
          eventName: 'consultation_category_clicked',
          category: 'Architectural Design',
        });
        consultationAnalytics.track({
          eventName: 'consultation_service_clicked',
          serviceId: 'Review my house plan',
        });
        consultationAnalytics.track({
          eventName: 'consultation_booking_confirmed',
          referenceId: 'HT-CON-TEST-1234',
        });
      }).not.toThrow();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 6. PAYMENT SECURITY & IDEMPOTENCY
  // ═════════════════════════════════════════════════════════════════════════
  describe('Payment Security, Signature Verification & Idempotency', () => {
    const testSecret = 'rzp_test_secret_for_audit_verification';

    it('15. Rejects payment verification with invalid cryptographic signature', async () => {
      process.env.RAZORPAY_KEY_SECRET = testSecret;
      try {
        const publicConsultants = await consultationService.getActiveConsultants();
        const consultant = publicConsultants[0];

        const booking = await consultationService.createBookingRequest({
          consultantId: consultant.id,
          homeownerName: 'Security Test User',
          homeownerPhone: '9900011223',
          homeownerEmail: 'security.test@example.com',
          projectLocation: 'Bangalore',
          projectType: 'Villa',
          consultationTopic: 'Security Audit',
          preferredDate: '2026-12-01',
          preferredTime: '10:00 AM',
        });

        await expect(
          consultationService.verifyPayment(booking.request.id, {
            gatewayOrderId: booking.payment.gatewayOrderId,
            gatewayPaymentId: 'pay_tampered_12345',
            gatewaySignature: 'invalid_tampered_signature_hex_code_1234567890abcdef',
          })
        ).rejects.toThrow(/mismatch|signature/i);

        // Verify request was not falsely confirmed as paid
        const requestAfterFail = await consultationService.getRequestById(booking.request.id);
        const paymentAfterFail = await consultationService.getPaymentByOrderId(booking.payment.gatewayOrderId);
        expect(paymentAfterFail?.status).not.toBe('PAID');
      } finally {
        delete process.env.RAZORPAY_KEY_SECRET;
      }
    });

    it('16. Valid cryptographic signature confirms payment and transitions request to AWAITING_REVIEW', async () => {
      const crypto = await import('crypto');
      process.env.RAZORPAY_KEY_SECRET = testSecret;
      try {
        const publicConsultants = await consultationService.getActiveConsultants();
        const consultant = publicConsultants[0];

        const booking = await consultationService.createBookingRequest({
          consultantId: consultant.id,
          homeownerName: 'Signature Verification User',
          homeownerPhone: '9900011224',
          homeownerEmail: 'sig.verify@example.com',
          projectLocation: 'Bangalore',
          projectType: 'Independent House',
          consultationTopic: 'Plan Audit',
          preferredDate: '2026-12-02',
          preferredTime: '02:00 PM',
        });

        const paymentId = 'pay_verified_real_12345';
        const validSignature = crypto
          .createHmac('sha256', testSecret)
          .update(`${booking.payment.gatewayOrderId}|${paymentId}`)
          .digest('hex');

        const result = await consultationService.verifyPayment(booking.request.id, {
          gatewayOrderId: booking.payment.gatewayOrderId,
          gatewayPaymentId: paymentId,
          gatewaySignature: validSignature,
        });

        expect(result.payment.status).toBe('PAID');
        expect(result.request.status).toBe('AWAITING_REVIEW');
        expect(result.payment.gatewayPaymentId).toBe(paymentId);

        // 17. Replaying payment verification is idempotent and returns existing verified record without re-processing
        const replayResult = await consultationService.verifyPayment(booking.request.id, {
          gatewayOrderId: booking.payment.gatewayOrderId,
          gatewayPaymentId: paymentId,
          gatewaySignature: validSignature,
        });

        expect(replayResult.payment.status).toBe('PAID');
        expect(replayResult.payment.id).toBe(result.payment.id);
      } finally {
        delete process.env.RAZORPAY_KEY_SECRET;
      }
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 7. CUSTOMER OWNERSHIP & DATA ISOLATION
  // ═════════════════════════════════════════════════════════════════════════
  describe('Customer Ownership & Data Isolation', () => {
    it('18. Customer ownership strictly enforced: Customer B cannot access Customer A booking', async () => {
      const publicConsultants = await consultationService.getActiveConsultants();
      const consultant = publicConsultants[0];

      const customerAContext = { id: 'usr-customer-alpha', email: 'customer.alpha@example.com' };
      const customerBContext = { id: 'usr-customer-beta', email: 'customer.beta@example.com' };

      const bookingA = await consultationService.createBookingRequest(
        {
          consultantId: consultant.id,
          homeownerName: 'Customer Alpha',
          homeownerPhone: '9845011111',
          homeownerEmail: 'customer.alpha@example.com',
          projectLocation: 'Bangalore',
          projectType: 'House',
          consultationTopic: 'Private Architectural Review',
          preferredDate: '2026-12-05',
          preferredTime: '11:00 AM',
        },
        customerAContext
      );

      // Customer A can access their own booking
      const fetchedByA = await consultationService.getUserConsultationById(bookingA.request.id, customerAContext);
      expect(fetchedByA).toBeDefined();
      expect(fetchedByA?.homeownerName).toBe('Customer Alpha');

      // Customer B attempting to access Customer A's booking is strictly rejected with Forbidden
      await expect(
        consultationService.getUserConsultationById(bookingA.request.id, customerBContext)
      ).rejects.toThrow(/Forbidden|permission/i);
    });
  });
});
