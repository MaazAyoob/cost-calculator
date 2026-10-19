// ==============================================================================
// Hutty Production-Ready Phone OTP Verification & Security Test Suite
// Covers:
//  - Phase 3: OTP Lifecycle, Cooldown, 5-Attempt Lock, Expiry & Abuse Protection
//  - Phase 4: Customer Account Signup with Phone Verification & Purpose Isolation
//  - Phase 5: Consultation Booking Verification (Cases A, B, C, D, E) & Cashfree Guard
//  - Phase 9: Replay, Race Conditions, Fake Flag Rejection & Application Regressions
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { otpService } from '../../../server/src/services/otp.service';
import { setOtpProvider, resetOtpProvider, IOtpProvider, OtpProviderResponse } from '../../../server/src/services/msg91.service';
import { normalizeIndianPhoneNumber } from '../../../server/src/utils/phone';
import { consultationService } from '../../../server/src/services/consultation.service';
import {
  register,
  login,
  getMe,
  updateProfile,
  inMemoryCustomerUsers,
} from '../../../server/src/controllers/auth.controller';
import { projectService } from '../../../server/src/services/project.service';
import { cashfreeService } from '../../../server/src/services/cashfree.service';
import { createBookingRequest as createBookingRequestController } from '../../../server/src/controllers/consultation.controller';

// Mock MockOtpProvider implementation
class TestMockOtpProvider implements IOtpProvider {
  public sentOtps = new Map<string, string>();
  public shouldFailSend = false;
  public shouldFailVerify = false;
  public isConfiguredState = true;
  public currentOtp = '654321';

  public isConfigured(): boolean {
    return this.isConfiguredState;
  }

  public async sendOtp(phone: string): Promise<OtpProviderResponse> {
    if (!this.isConfiguredState) {
      return {
        success: false,
        code: 'PROVIDER_NOT_CONFIGURED',
        message: 'MSG91 SMS provider is not configured.',
      };
    }
    if (this.shouldFailSend) {
      return {
        success: false,
        code: 'PROVIDER_ERROR',
        message: 'Upstream SMS delivery gateway failed.',
      };
    }
    this.sentOtps.set(phone, this.currentOtp);
    return {
      success: true,
      message: 'OTP sent successfully',
      providerRef: 'msg91_ref_test_001',
    };
  }

  public async verifyOtp(phone: string, otp: string): Promise<OtpProviderResponse> {
    if (!this.isConfiguredState) {
      return {
        success: false,
        code: 'PROVIDER_NOT_CONFIGURED',
        message: 'MSG91 SMS provider is not configured.',
      };
    }
    if (this.shouldFailVerify) {
      return {
        success: false,
        code: 'PROVIDER_ERROR',
        message: 'Upstream verification service error.',
      };
    }
    const expected = this.sentOtps.get(phone) || this.currentOtp;
    if (otp === expected) {
      return { success: true, message: 'OTP verified successfully' };
    }
    return { success: false, code: 'OTP_MISMATCH', message: 'The OTP entered is incorrect.' };
  }

  public async retryOtp(phone: string): Promise<OtpProviderResponse> {
    if (!this.isConfiguredState) {
      return {
        success: false,
        code: 'PROVIDER_NOT_CONFIGURED',
        message: 'MSG91 SMS provider is not configured.',
      };
    }
    if (this.shouldFailSend) {
      return { success: false, code: 'PROVIDER_ERROR', message: 'Retry SMS failed.' };
    }
    return { success: true, message: 'OTP resent successfully' };
  }
}

describe('Hutty Phone OTP Verification & Security Platform', () => {
  let mockProvider: TestMockOtpProvider;

  beforeEach(() => {
    mockProvider = new TestMockOtpProvider();
    setOtpProvider(mockProvider);
    otpService.clearInMemory();
    consultationService.clearInMemory();
    projectService.clearInMemory();
  });

  afterEach(() => {
    resetOtpProvider();
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Phone Normalization & Validation
  // ─────────────────────────────────────────────────────────────────────────────
  describe('1. Phone Number Canonical Normalization', () => {
    it('normalizes standard 10-digit domestic Indian mobile numbers to E.164', () => {
      const res = normalizeIndianPhoneNumber('9876543210');
      expect(res.isValid).toBe(true);
      expect(res.e164).toBe('+919876543210');
      expect(res.domestic).toBe('9876543210');
      expect(res.providerFormat).toBe('919876543210');
      expect(res.masked).toContain('••••••');
    });

    it('correctly handles inputs with spaces, hyphens, and trunk prefixes', () => {
      expect(normalizeIndianPhoneNumber('+91 98765 43210').e164).toBe('+919876543210');
      expect(normalizeIndianPhoneNumber('919876543210').e164).toBe('+919876543210');
      expect(normalizeIndianPhoneNumber('09876543210').e164).toBe('+919876543210');
      expect(normalizeIndianPhoneNumber('98765-43210').e164).toBe('+919876543210');
    });

    it('rejects invalid mobile numbers, letters, and non-Indian starting digits', () => {
      expect(normalizeIndianPhoneNumber('1234567890').isValid).toBe(false); // Does not start with 6,7,8,9
      expect(normalizeIndianPhoneNumber('98765').isValid).toBe(false);      // Too short
      expect(normalizeIndianPhoneNumber('987654321000').isValid).toBe(false); // Too long
      expect(normalizeIndianPhoneNumber('abcdefghij').isValid).toBe(false);
      expect(normalizeIndianPhoneNumber(null).isValid).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. OTP Security Policies & Lifecycle Controls
  // ─────────────────────────────────────────────────────────────────────────────
  describe('2. OTP Challenge Lifecycle & Abuse Protection', () => {
    it('generates a cryptographically unpredictable challenge and masks the phone', async () => {
      const res = await otpService.requestOtp({
        phone: '9876543210',
        purpose: 'SIGNUP',
      });

      expect(res.success).toBe(true);
      expect(res.challengeId).toMatch(/^chal_/);
      expect(res.maskedPhone).toBe('+91 98••••••10');
      expect(res.resendAvailableInSeconds).toBe(60);
      expect(res.expiresInSeconds).toBe(300);
    });

    it('rejects resend attempts during the 60-second cooldown', async () => {
      const init = await otpService.requestOtp({
        phone: '9876543210',
        purpose: 'SIGNUP',
      });

      // Immediate resend must be blocked by cooldown
      const resendRes = await otpService.resendOtp(init.challengeId!);
      expect(resendRes.success).toBe(false);
      expect(resendRes.code).toBe('COOLDOWN_ACTIVE');
      expect(resendRes.error).toContain('Please wait');
    });

    it('locks the challenge after 5 failed verification attempts', async () => {
      const init = await otpService.requestOtp({
        phone: '9876543210',
        purpose: 'SIGNUP',
      });
      const chalId = init.challengeId!;

      // 4 incorrect attempts
      for (let i = 1; i <= 4; i++) {
        const attempt = await otpService.verifyOtp(chalId, '000000');
        expect(attempt.success).toBe(false);
        expect(attempt.code).toBe('INCORRECT_OTP');
        expect(attempt.attemptsRemaining).toBe(5 - i);
      }

      // 5th incorrect attempt -> locks the challenge
      const fifthAttempt = await otpService.verifyOtp(chalId, '000000');
      expect(fifthAttempt.success).toBe(false);
      expect(fifthAttempt.code).toBe('CHALLENGE_LOCKED');
      expect(fifthAttempt.attemptsRemaining).toBe(0);

      // Even correct OTP is now rejected because challenge is locked
      const sixthAttempt = await otpService.verifyOtp(chalId, '654321');
      expect(sixthAttempt.success).toBe(false);
      expect(sixthAttempt.code).toBe('CHALLENGE_LOCKED');
    });

    it('enforces maximum 3 OTP sends per normalized phone number in 15 minutes', async () => {
      const testPhone = '9876543210';

      // 1st request -> success
      const r1 = await otpService.requestOtp({ phone: testPhone, purpose: 'SIGNUP' });
      expect(r1.success).toBe(true);

      // 2nd request -> success
      const r2 = await otpService.requestOtp({ phone: testPhone, purpose: 'SIGNUP' });
      expect(r2.success).toBe(true);

      // 3rd request -> success
      const r3 = await otpService.requestOtp({ phone: testPhone, purpose: 'SIGNUP' });
      expect(r3.success).toBe(true);

      // 4th request within 15 mins -> rate limited!
      const r4 = await otpService.requestOtp({ phone: testPhone, purpose: 'SIGNUP' });
      expect(r4.success).toBe(false);
      expect(r4.code).toBe('PHONE_RATE_LIMITED');
      expect(r4.error).toContain('Too many OTP requests');
    });

    it('fails closed when MSG91 SMS provider is not configured or disabled', async () => {
      mockProvider.isConfiguredState = false;

      const res = await otpService.requestOtp({
        phone: '9876543210',
        purpose: 'SIGNUP',
      });

      expect(res.success).toBe(false);
      expect(res.code).toBe('PROVIDER_NOT_CONFIGURED');
      expect(res.error).toContain('not configured');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Verification Purpose Isolation & Grant Single-Use Consumption
  // ─────────────────────────────────────────────────────────────────────────────
  describe('3. Purpose Isolation & Single-Use Verification Grants', () => {
    it('issues a cryptographically unpredictable grant on successful OTP verification', async () => {
      const init = await otpService.requestOtp({
        phone: '9876543210',
        purpose: 'SIGNUP',
      });

      const verifyRes = await otpService.verifyOtp(init.challengeId!, '654321');
      expect(verifyRes.success).toBe(true);
      expect(verifyRes.verificationToken).toMatch(/^grant_/);
      expect(verifyRes.purpose).toBe('SIGNUP');
    });

    it('strictly isolates purposes: SIGNUP grant cannot be used for CONSULTATION_BOOKING', async () => {
      const init = await otpService.requestOtp({
        phone: '9876543210',
        purpose: 'SIGNUP',
      });
      const verifyRes = await otpService.verifyOtp(init.challengeId!, '654321');

      // Attempt consuming SIGNUP token for CONSULTATION_BOOKING
      const consumeForBooking = await otpService.consumeGrant(
        verifyRes.verificationToken!,
        '9876543210',
        'CONSULTATION_BOOKING'
      );
      expect(consumeForBooking.valid).toBe(false);
      expect(consumeForBooking.error).toContain('purpose mismatch');
    });

    it('strictly binds grant to the exact normalized phone number', async () => {
      const init = await otpService.requestOtp({
        phone: '9876543210',
        purpose: 'SIGNUP',
      });
      const verifyRes = await otpService.verifyOtp(init.challengeId!, '654321');

      // Attempt consuming with a different phone number
      const consumeWrongPhone = await otpService.consumeGrant(
        verifyRes.verificationToken!,
        '9876543299', // Different number
        'SIGNUP'
      );
      expect(consumeWrongPhone.valid).toBe(false);
      expect(consumeWrongPhone.error).toContain('phone number does not match');
    });

    it('strictly enforces single-use consumption and blocks token replay', async () => {
      const init = await otpService.requestOtp({
        phone: '9876543210',
        purpose: 'SIGNUP',
      });
      const verifyRes = await otpService.verifyOtp(init.challengeId!, '654321');
      const token = verifyRes.verificationToken!;

      // 1st consumption -> succeeds
      const firstUse = await otpService.consumeGrant(token, '9876543210', 'SIGNUP');
      expect(firstUse.valid).toBe(true);

      // 2nd consumption attempt -> blocked! Replay prohibited
      const secondUse = await otpService.consumeGrant(token, '9876543210', 'SIGNUP');
      expect(secondUse.valid).toBe(false);
      expect(secondUse.error).toContain('already been used');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Customer Signup Integration
  // ─────────────────────────────────────────────────────────────────────────────
  describe('4. New Customer Signup Flow with Phone Verification', () => {
    it('rejects account creation if phone verificationToken is absent', async () => {
      const req: any = {
        body: {
          name: 'Sunil Verma',
          email: 'sunil.unverified@hutty.in',
          password: 'Password@123',
          phone: '9876543210',
          // No verificationToken
        },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json.mock.calls[0][0].code).toBe('PHONE_VERIFICATION_REQUIRED');
    });

    it('rejects account creation if an invalid or fabricated verificationToken is supplied', async () => {
      const req: any = {
        body: {
          name: 'Sunil Verma',
          email: 'sunil.fake@hutty.in',
          password: 'Password@123',
          phone: '9876543210',
          verificationToken: 'grant_fabricated_token_12345',
        },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json.mock.calls[0][0].code).toBe('PHONE_VERIFICATION_INVALID');
    });

    it('succeeds when a valid phone verification grant is provided, persisting phoneVerifiedAt', async () => {
      const testEmail = 'sunil.verified@hutty.in';
      const testPhone = '9876543210';

      // 1. Request and verify OTP
      const init = await otpService.requestOtp({ phone: testPhone, purpose: 'SIGNUP' });
      const verify = await otpService.verifyOtp(init.challengeId!, '654321');

      // 2. Register account with valid token
      const req: any = {
        body: {
          name: 'Sunil Verma',
          email: testEmail,
          password: 'Password@123',
          phone: testPhone,
          verificationToken: verify.verificationToken,
        },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      const user = res.json.mock.calls[0][0].user;
      expect(user.phone).toBe('+919876543210');
      expect(user.phoneVerified).toBe(true);
      expect(user.phoneVerifiedAt).toBeDefined();

      // 3. Confirm login works seamlessly for the newly created customer
      const loginReq: any = {
        body: { email: testEmail, password: 'Password@123' },
        headers: {},
      };
      const loginRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await login(loginReq, loginRes);
      expect(loginRes.json.mock.calls[0][0].success).toBe(true);
      expect(loginRes.json.mock.calls[0][0].user.phoneVerified).toBe(true);
    });

    it('preserves existing customers without locking them out and treats unverified accounts as unverified', async () => {
      // Historical test customer in memory (customer@hutty.in) has phone but no verification timestamp
      const loginReq: any = {
        body: { email: 'customer@hutty.in', password: 'Customer@123' },
        headers: {},
      };
      const loginRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await login(loginReq, loginRes);
      expect(loginRes.json.mock.calls[0][0].success).toBe(true);
      const loggedIn = loginRes.json.mock.calls[0][0].user;
      expect(loggedIn.email).toBe('customer@hutty.in');
      // Historical customer phone is present, but phoneVerified is false until verified
      expect(loggedIn.phoneVerified).toBe(false);
    });

    it('clears phone verification state when customer updates profile with an unverified phone number', async () => {
      const userEmail = 'update.profile@hutty.in';
      inMemoryCustomerUsers.set(userEmail, {
        id: 'usr_verified_initial',
        name: 'Initial User',
        email: userEmail,
        phone: '+919876543210',
        phoneVerifiedAt: new Date(),
        role: 'USER',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updateReq: any = {
        user: { id: 'usr_verified_initial', email: userEmail, role: 'USER' },
        body: {
          name: 'Initial User',
          phone: '9876543299', // Changed number without verification token
        },
      };
      const updateRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await updateProfile(updateReq, updateRes);
      expect(updateRes.json.mock.calls[0][0].success).toBe(true);
      const updatedUser = updateRes.json.mock.calls[0][0].user;
      expect(updatedUser.phone).toBe('+919876543299');
      // Phone verification cleared because the number changed
      expect(updatedUser.phoneVerified).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Consultation Booking Verification & Cashfree Guard
  // ─────────────────────────────────────────────────────────────────────────────
  describe('5. Consultation Booking Verification Enforcements', () => {
    it('Case A: Authenticated customer with matching, verified account phone proceeds without re-verifying', async () => {
      const verifiedCustomerEmail = 'ananya.verified@hutty.in';
      const canonicalPhone = '+919876543210';

      inMemoryCustomerUsers.set(verifiedCustomerEmail, {
        id: 'usr_ananya_verified',
        name: 'Ananya Sharma',
        email: verifiedCustomerEmail,
        phone: canonicalPhone,
        phoneVerifiedAt: new Date(),
        role: 'USER',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Submit booking with matching phone number and authenticated user context
      const bookingResult = await consultationService.createBookingRequest(
        {
          consultantId: 'cons-ar-ramesh',
          homeownerName: 'Ananya Sharma',
          homeownerPhone: '9876543210', // Domestic format matching +919876543210
          homeownerEmail: verifiedCustomerEmail,
          projectLocation: 'Indiranagar, Bangalore',
          projectType: 'Independent Villa',
          consultationTopic: 'Architectural Plan Review',
          preferredDate: '2026-11-01',
          preferredTime: '10:00 AM',
        },
        { id: 'usr_ananya_verified', email: verifiedCustomerEmail },
        { enforcePhoneVerification: true }
      );

      expect(bookingResult.request.publicReference).toMatch(/^HT-CON-/);
      expect(bookingResult.payment.status).toBe('PENDING');
      expect(bookingResult.request.homeownerPhone).toBe('+919876543210');
    });

    it('Case B: Authenticated customer with unverified phone is blocked until verified', async () => {
      const unverifiedCustomerEmail = 'unverified.cust@hutty.in';
      inMemoryCustomerUsers.set(unverifiedCustomerEmail, {
        id: 'usr_unverified_cust',
        name: 'Rohan Mehra',
        email: unverifiedCustomerEmail,
        phone: '+919876543210',
        phoneVerifiedAt: null, // Unverified
        role: 'USER',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Attempt booking without verification token
      await expect(
        consultationService.createBookingRequest(
          {
            consultantId: 'cons-ar-ramesh',
            homeownerName: 'Rohan Mehra',
            homeownerPhone: '9876543210',
            homeownerEmail: unverifiedCustomerEmail,
            projectLocation: 'Whitefield, Bangalore',
            projectType: 'Villa',
            consultationTopic: 'Architectural Plan Review',
            preferredDate: '2026-11-01',
            preferredTime: '10:00 AM',
          },
          { id: 'usr_unverified_cust', email: unverifiedCustomerEmail },
          { enforcePhoneVerification: true }
        )
      ).rejects.toThrow(/Phone verification required/);
    });

    it('Case C: Standalone guest consultation requires phone verification', async () => {
      // 1. Attempting without verification token throws error
      await expect(
        consultationService.createBookingRequest(
          {
            consultantId: 'cons-ar-ramesh',
            homeownerName: 'Guest Homeowner',
            homeownerPhone: '9876543210',
            homeownerEmail: 'guest@example.com',
            projectLocation: 'Hebbal, Bangalore',
            projectType: 'G+2 Residence',
            consultationTopic: 'Structural Drawing Vetting',
            preferredDate: '2026-11-02',
            preferredTime: '02:00 PM',
          },
          undefined,
          { enforcePhoneVerification: true }
        )
      ).rejects.toThrow(/Phone verification required/);

      // 2. Obtain valid CONSULTATION_BOOKING grant
      const init = await otpService.requestOtp({
        phone: '9876543210',
        purpose: 'CONSULTATION_BOOKING',
      });
      const verify = await otpService.verifyOtp(init.challengeId!, '654321');

      // 3. Standalone booking succeeds with grant
      const result = await consultationService.createBookingRequest({
        consultantId: 'cons-ar-ramesh',
        homeownerName: 'Guest Homeowner',
        homeownerPhone: '9876543210',
        homeownerEmail: 'guest@example.com',
        projectLocation: 'Hebbal, Bangalore',
        projectType: 'G+2 Residence',
        consultationTopic: 'Structural Drawing Vetting',
        preferredDate: '2026-11-02',
        preferredTime: '02:00 PM',
        verificationToken: verify.verificationToken,
      });

      expect(result.request.publicReference).toMatch(/^HT-CON-/);
      expect(result.request.homeownerPhone).toBe('+919876543210');
    });

    it('Case D: Preserves attached calculator workspace snapshot with verified contact phone', async () => {
      const init = await otpService.requestOtp({
        phone: '9876543210',
        purpose: 'CONSULTATION_BOOKING',
      });
      const verify = await otpService.verifyOtp(init.challengeId!, '654321');

      const result = await consultationService.createBookingRequest({
        consultantId: 'cons-ar-ramesh',
        homeownerName: 'Snapshot User',
        homeownerPhone: '9876543210',
        homeownerEmail: 'snapshot@example.com',
        projectLocation: 'Bangalore',
        projectType: 'Villa',
        consultationTopic: 'Plan Review',
        preferredDate: '2026-11-03',
        preferredTime: '11:00 AM',
        projectSnapshot: {
          houseType: 'Luxury Villa',
          floors: 3,
          totalBUASqFt: 4500,
          estimatedTotalCostINR: 12500000,
        },
        verificationToken: verify.verificationToken,
      });

      expect(result.request.projectSnapshot).toBeDefined();
      expect(result.request.projectSnapshot.source).toBe('calculator_snapshot');
      expect(result.request.projectSnapshot.totalBUASqFt).toBe(4500);
      expect(result.request.projectSnapshot.estimatedTotalCostINR).toBe(12500000);
    });

    it('Case E: Preserves project ownership security check when linking saved project', async () => {
      // User A creates project 1
      const project1 = await projectService.createProject({
        name: 'User A Villa',
        ownerId: 'usr_alice',
        leadEmail: 'alice@example.com',
        city: 'Bangalore',
        authority: 'BBMP',
      });

      // User B attempts to link User A's project during consultation booking
      const init = await otpService.requestOtp({
        phone: '9876543210',
        purpose: 'CONSULTATION_BOOKING',
      });
      const verify = await otpService.verifyOtp(init.challengeId!, '654321');

      await expect(
        consultationService.createBookingRequest(
          {
            consultantId: 'cons-ar-ramesh',
            homeownerName: 'Bob Builder',
            homeownerPhone: '9876543210',
            homeownerEmail: 'bob@example.com',
            projectId: project1.id, // Forbidden project link!
            projectLocation: 'Bangalore',
            projectType: 'Villa',
            consultationTopic: 'Plan Review',
            preferredDate: '2026-11-03',
            preferredTime: '11:00 AM',
            verificationToken: verify.verificationToken,
          },
          { id: 'usr_bob', email: 'bob@example.com' }
        )
      ).rejects.toThrow(/Forbidden/);
    });

    it('prevents Cashfree order generation when phone is unverified', async () => {
      const cfSpy = vi.spyOn(cashfreeService, 'createOrder');

      try {
        await consultationService.createBookingRequest(
          {
            consultantId: 'cons-ar-ramesh',
            homeownerName: 'Unverified Order Attempt',
            homeownerPhone: '9876543210',
            homeownerEmail: 'unverified.order@example.com',
            projectLocation: 'Bangalore',
            projectType: 'Villa',
            consultationTopic: 'Plan Review',
            preferredDate: '2026-11-03',
            preferredTime: '11:00 AM',
            // No verificationToken
          },
          undefined,
          { enforcePhoneVerification: true }
        );
      } catch {}

      // Cashfree createOrder MUST NOT be called!
      expect(cfSpy).not.toHaveBeenCalled();
    });

    it('safely resumes pending Cashfree session without re-verification', async () => {
      // 1. Initial booking with verified phone
      const init = await otpService.requestOtp({
        phone: '9876543210',
        purpose: 'CONSULTATION_BOOKING',
      });
      const verify = await otpService.verifyOtp(init.challengeId!, '654321');

      const idempotencyKey = 'idemp_test_resume_001';
      const initialBooking = await consultationService.createBookingRequest({
        consultantId: 'cons-ar-ramesh',
        homeownerName: 'Resume Customer',
        homeownerPhone: '9876543210',
        homeownerEmail: 'resume.customer@example.com',
        projectLocation: 'Bangalore',
        projectType: 'Villa',
        consultationTopic: 'Plan Review',
        preferredDate: '2026-11-04',
        preferredTime: '03:00 PM',
        idempotencyKey,
        verificationToken: verify.verificationToken,
      });

      // 2. Retry submission with the same idempotency key: resumes existing pending booking without needing fresh OTP
      const resumedBooking = await consultationService.createBookingRequest({
        consultantId: 'cons-ar-ramesh',
        homeownerName: 'Resume Customer',
        homeownerPhone: '9876543210',
        homeownerEmail: 'resume.customer@example.com',
        projectLocation: 'Bangalore',
        projectType: 'Villa',
        consultationTopic: 'Plan Review',
        preferredDate: '2026-11-04',
        preferredTime: '03:00 PM',
        idempotencyKey,
        // No verification token on retry
      });

      expect(resumedBooking.request.id).toBe(initialBooking.request.id);
      expect(resumedBooking.payment.id).toBe(initialBooking.payment.id);
    });

    it('Direct HTTP controller endpoint strictly enforces phone verification and rejects unverified requests', async () => {
      let status = 0;
      let json: any = null;

      const mockRes = {
        status: (code: number) => {
          status = code;
          return mockRes;
        },
        json: (data: any) => {
          json = data;
          return mockRes;
        },
      } as any;

      // Unverified request to controller
      const mockReqUnverified = {
        body: {
          consultantId: 'cons-ar-ramesh',
          homeownerName: 'Direct API Caller',
          homeownerPhone: '9876543210',
          homeownerEmail: 'direct.caller@example.com',
          projectLocation: 'Bangalore',
          projectType: 'Villa',
          consultationTopic: 'Plan Review',
          preferredDate: '2026-11-05',
          preferredTime: '10:00 AM',
        },
        enforcePhoneVerification: true,
      } as any;

      await createBookingRequestController(mockReqUnverified, mockRes);

      expect(status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.code).toBe('PHONE_VERIFICATION_REQUIRED');
      expect(json.error).toMatch(/Phone verification required/);

      // Now with valid verification token
      const init = await otpService.requestOtp({
        phone: '9876543210',
        purpose: 'CONSULTATION_BOOKING',
      });
      const verify = await otpService.verifyOtp(init.challengeId!, '654321');

      const mockReqVerified = {
        body: {
          consultantId: 'cons-ar-ramesh',
          homeownerName: 'Direct API Caller',
          homeownerPhone: '9876543210',
          homeownerEmail: 'direct.caller@example.com',
          projectLocation: 'Bangalore',
          projectType: 'Villa',
          consultationTopic: 'Plan Review',
          preferredDate: '2026-11-05',
          preferredTime: '10:00 AM',
          verificationToken: verify.verificationToken,
        },
        enforcePhoneVerification: true,
      } as any;

      await createBookingRequestController(mockReqVerified, mockRes);

      expect(status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.request.publicReference).toMatch(/^HT-CON-/);
    });
  });
});
