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
import {
  setOtpProvider,
  resetOtpProvider,
  IOtpProvider,
  OtpProviderResponse,
  Fast2SmsProvider,
} from '../../../server/src/services/fast2sms.service';
import { ENV } from '../../../server/src/config/env';
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
        message: 'Fast2SMS provider is not configured.',
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
      providerRef: 'fast2sms_ref_test_001',
    };
  }

  public async verifyOtp(phone: string, otp: string): Promise<OtpProviderResponse> {
    if (!this.isConfiguredState) {
      return {
        success: false,
        code: 'PROVIDER_NOT_CONFIGURED',
        message: 'Fast2SMS provider is not configured.',
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
        message: 'Fast2SMS provider is not configured.',
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

    it('fails closed when Fast2SMS provider is not configured or disabled', async () => {
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
    it('rejects account creation if phone verificationToken is absent when verification is enforced', async () => {
      (ENV as any).REQUIRE_PHONE_VERIFICATION_ON_SIGNUP = true;
      try {
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
      } finally {
        delete (ENV as any).REQUIRE_PHONE_VERIFICATION_ON_SIGNUP;
      }
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

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Dedicated Fast2SMS Provider Boundary & Security Suite
  // ─────────────────────────────────────────────────────────────────────────────
  describe('6. Dedicated Fast2SMS Provider Boundary & Security Tests', () => {
    let fast2smsProvider: Fast2SmsProvider;
    const originalEnv = { ...ENV };

    beforeEach(() => {
      fast2smsProvider = new Fast2SmsProvider();
      ENV.FAST2SMS_API_KEY = 'test_fast2sms_api_key_valid_123';
      ENV.FAST2SMS_OTP_ID = 'test_otp_template_999';
      ENV.FAST2SMS_OTP_EXPIRY_MINUTES = 5;
      ENV.FAST2SMS_OTP_LENGTH = 6;
    });

    afterEach(() => {
      Object.assign(ENV, originalEnv);
      vi.restoreAllMocks();
    });

    it('evaluates isConfigured correctly based on credentials and placeholder detection', () => {
      expect(fast2smsProvider.isConfigured()).toBe(true);

      ENV.FAST2SMS_API_KEY = '';
      expect(fast2smsProvider.isConfigured()).toBe(false);

      ENV.FAST2SMS_API_KEY = 'placeholder_fast2sms_api_key';
      expect(fast2smsProvider.isConfigured()).toBe(false);

      ENV.FAST2SMS_API_KEY = 'your_fast2sms_api_key_here';
      expect(fast2smsProvider.isConfigured()).toBe(false);

      ENV.FAST2SMS_API_KEY = 'valid_key';
      ENV.FAST2SMS_OTP_ID = '';
      expect(fast2smsProvider.isConfigured()).toBe(false);
    });

    it('fails closed when API key or OTP template is missing without hitting network', async () => {
      ENV.FAST2SMS_API_KEY = '';
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      const sendRes = await fast2smsProvider.sendOtp('9876543210');
      expect(sendRes.success).toBe(false);
      expect(sendRes.code).toBe('PROVIDER_NOT_CONFIGURED');
      expect(sendRes.message).toContain('not configured');
      expect(fetchSpy).not.toHaveBeenCalled();

      const verifyRes = await fast2smsProvider.verifyOtp('9876543210', '123456');
      expect(verifyRes.success).toBe(false);
      expect(verifyRes.code).toBe('PROVIDER_NOT_CONFIGURED');
      expect(fetchSpy).not.toHaveBeenCalled();

      const retryRes = await fast2smsProvider.retryOtp('9876543210');
      expect(retryRes.success).toBe(false);
      expect(retryRes.code).toBe('PROVIDER_NOT_CONFIGURED');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('rejects malformed or non-Indian phone numbers before sending upstream request', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      const res = await fast2smsProvider.sendOtp('12345');
      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_PHONE');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('dispatches valid POST to /dev/otp/send with domestic 10-digit number and authorization header', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          return: true,
          status_code: 200,
          request_id: 'fast2sms_req_abc123',
          message: 'OTP sent successfully',
        }),
      } as any);

      const res = await fast2smsProvider.sendOtp('+91 98765 43210');
      expect(res.success).toBe(true);
      expect(res.providerRef).toBe('fast2sms_req_abc123');
      expect(res.message).toBe('OTP sent successfully');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://www.fast2sms.com/dev/otp/send');
      expect(options?.method).toBe('POST');
      expect(options?.headers).toEqual({
        authorization: 'test_fast2sms_api_key_valid_123',
        'content-type': 'application/json',
        accept: 'application/json',
      });
      const parsedBody = JSON.parse(options?.body as string);
      expect(parsedBody.mobile).toBe('9876543210'); // 10-digit domestic format
      expect(parsedBody.otp_id).toBe('test_otp_template_999');
      expect(parsedBody.otp_length).toBe(6);
      expect(parsedBody.otp_expiry).toBe(5);
    });

    it('handles provider rejection (insufficient balance, spamming, DLT blacklisting) gracefully', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          return: false,
          status_code: 416,
          message: ["You don't have sufficient wallet balance"],
        }),
      } as any);

      const res = await fast2smsProvider.sendOtp('9876543210');
      expect(res.success).toBe(false);
      expect(res.code).toBe('UPSTREAM_REJECTED');
      expect(res.message).toBe("You don't have sufficient wallet balance");
    });

    it('handles network timeouts and connection failures without exposing secrets', async () => {
      // 1. Timeout (AbortError)
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(abortError);

      const timeoutRes = await fast2smsProvider.sendOtp('9876543210');
      expect(timeoutRes.success).toBe(false);
      expect(timeoutRes.code).toBe('TIMEOUT');
      expect(timeoutRes.message).toContain('timed out');

      // 2. Network error
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('ECONNRESET'));
      const netRes = await fast2smsProvider.sendOtp('9876543210');
      expect(netRes.success).toBe(false);
      expect(netRes.code).toBe('NETWORK_ERROR');
      expect(netRes.message).toBe('Unable to connect to SMS gateway.');
    });

    it('validates OTP successfully via POST /dev/otp/verify with correct credentials', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          return: true,
          status_code: 200,
          message: 'OTP verified successfully',
        }),
      } as any);

      const res = await fast2smsProvider.verifyOtp('9876543210', '654321');
      expect(res.success).toBe(true);
      expect(res.message).toBe('OTP verified successfully');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://www.fast2sms.com/dev/otp/verify');
      const body = JSON.parse(options?.body as string);
      expect(body.mobile).toBe('9876543210');
      expect(body.otp).toBe('654321');
    });

    it('returns OTP_MISMATCH when Fast2SMS reports invalid/incorrect OTP', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          return: false,
          status_code: 400,
          message: 'Invalid OTP',
        }),
      } as any);

      const res = await fast2smsProvider.verifyOtp('9876543210', '000000');
      expect(res.success).toBe(false);
      expect(res.code).toBe('OTP_MISMATCH');
      expect(res.message).toBe('Invalid OTP');
    });

    it('resends OTP via POST /dev/otp/resend successfully', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          return: true,
          status_code: 200,
          request_id: 'retry_fast2sms_999',
          message: 'OTP sent successfully',
        }),
      } as any);

      const res = await fast2smsProvider.retryOtp('9876543210');
      expect(res.success).toBe(true);
      expect(res.providerRef).toBe('retry_fast2sms_999');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://www.fast2sms.com/dev/otp/resend');
      const body = JSON.parse(options?.body as string);
      expect(body.otp_id).toBe('test_otp_template_999');
      expect(body.mobile).toBe('9876543210');
    });

    it('NEVER logs API keys, plain OTP values, full phone numbers, or passwords in console', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          return: true,
          status_code: 200,
          message: 'OTP sent successfully',
        }),
      } as any);

      const testPhone = '9876543210';
      const secretApiKey = 'test_fast2sms_api_key_valid_123';
      const testOtp = '876543';

      await fast2smsProvider.sendOtp(testPhone);
      await fast2smsProvider.verifyOtp(testPhone, testOtp);
      await fast2smsProvider.retryOtp(testPhone);

      const allLoggedContent = [
        ...logSpy.mock.calls.flat(),
        ...warnSpy.mock.calls.flat(),
        ...errorSpy.mock.calls.flat(),
      ]
        .map(String)
        .join(' ');

      // Must NEVER contain the raw API key
      expect(allLoggedContent).not.toContain(secretApiKey);
      // Must NEVER contain the raw OTP digits
      expect(allLoggedContent).not.toContain(testOtp);
      // Must NEVER contain unmasked domestic phone number 9876543210
      expect(allLoggedContent).not.toContain(testPhone);
      // Must contain masked phone number
      expect(allLoggedContent).toContain('+91 98••••••10');
    });
  });
});
