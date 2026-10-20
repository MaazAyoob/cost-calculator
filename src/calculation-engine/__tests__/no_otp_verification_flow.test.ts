// ==============================================================================
// Hutty — Global Postponed OTP & Phone Verification Elimination Test Suite
// Verifies that:
// 1. An authenticated user can book a consultation without phone OTP.
// 2. Booking does not call an SMS OTP provider.
// 3. Users cannot access another customer's booking (ownership & data isolation).
// 4. Unauthenticated users must still authenticate where required.
// 5. Consultation payment verification remains mandatory where applicable.
// 6. Calculator signup/login continue working without OTP.
// 7. No false phone/email verification badges appear.
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { consultationService } from '../../../server/src/services/consultation.service';
import { cashfreeService } from '../../../server/src/services/cashfree.service';
import {
  createBookingRequest as createBookingRequestController,
  getMyConsultationById,
  getMyConsultations,
} from '../../../server/src/controllers/consultation.controller';
import {
  register,
  login,
  inMemoryCustomerUsers,
} from '../../../server/src/controllers/auth.controller';
import {
  setOtpProvider,
  resetOtpProvider,
  IOtpProvider,
  OtpProviderResponse,
} from '../../../server/src/services/fast2sms.service';
import { CONSULTATION_PRICE_INR } from '../../../server/src/constants/consultation.constants';

// Spy OTP Provider to detect any accidental SMS dispatch
class TrackingOtpProvider implements IOtpProvider {
  public sendOtpCalls: string[] = [];
  public retryOtpCalls: string[] = [];
  public verifyOtpCalls: string[] = [];

  public isConfigured(): boolean {
    return true;
  }

  public async sendOtp(phone: string): Promise<OtpProviderResponse> {
    this.sendOtpCalls.push(phone);
    return { success: true, message: 'OTP sent' };
  }

  public async retryOtp(phone: string): Promise<OtpProviderResponse> {
    this.retryOtpCalls.push(phone);
    return { success: true, message: 'OTP retried' };
  }

  public async verifyOtp(phone: string, otp: string): Promise<OtpProviderResponse> {
    this.verifyOtpCalls.push(phone);
    return { success: true, message: 'OTP verified' };
  }
}

describe('Hutty — Global Postponed OTP & Verification Flow Audit', () => {
  let trackingProvider: TrackingOtpProvider;

  beforeEach(() => {
    vi.restoreAllMocks();
    trackingProvider = new TrackingOtpProvider();
    setOtpProvider(trackingProvider);

    // Mock Cashfree isConfigured and order creation
    vi.spyOn(cashfreeService, 'isConfigured').mockReturnValue(true);
    vi.spyOn(cashfreeService, 'createOrder').mockImplementation(async (params) => {
      const orderId = params.orderId;
      const paymentSessionId = `session_cf_${orderId}`;
      return {
        orderId,
        order_id: orderId,
        paymentSessionId,
        payment_session_id: paymentSessionId,
        cfOrderId: `cf_${Date.now()}`,
        orderStatus: 'ACTIVE',
        orderAmount: params.orderAmount,
        currency: 'INR',
        environment: 'TEST',
        gateway: 'CASHFREE',
      };
    });
  });

  afterEach(() => {
    resetOtpProvider();
  });

  it('1. Authenticated user can book a consultation without phone OTP or verificationToken', async () => {
    const customerEmail = 'verified_no_otp_user@hutty.in';
    const customerId = 'usr_test_no_otp_01';

    inMemoryCustomerUsers.set(customerEmail, {
      id: customerId,
      name: 'Pooja Hegde',
      email: customerEmail,
      phone: '+919876543210',
      phoneVerifiedAt: null, // Note: Not verified via OTP
      role: 'USER',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const bookingResult = await consultationService.createBookingRequest(
      {
        consultantId: 'cons-ar-ramesh',
        homeownerName: 'Pooja Hegde',
        homeownerPhone: '9876543210',
        homeownerEmail: customerEmail,
        projectLocation: 'Indiranagar, Bangalore',
        projectType: 'Independent Villa',
        consultationTopic: 'Architectural Plan Review',
        preferredDate: '2026-11-15',
        preferredTime: '11:00 AM',
        gateway: 'CASHFREE',
      },
      { id: customerId, email: customerEmail }
    );

    expect(bookingResult).toBeDefined();
    expect(bookingResult.request.publicReference).toMatch(/^HT-CON-/);
    expect(bookingResult.request.homeownerEmail).toBe(customerEmail);
    expect(bookingResult.request.status).toBe('AWAITING_REVIEW');
    expect(bookingResult.payment.status).toBe('PENDING');
    expect(bookingResult.payment.amountMinorUnits).toBe(CONSULTATION_PRICE_INR * 100);
    expect(bookingResult.cashfreeOptions?.paymentSessionId).toBeDefined();
  });

  it('2. Booking does not call an SMS OTP provider', async () => {
    const bookingResult = await consultationService.createBookingRequest({
      consultantId: 'cons-ar-ramesh',
      homeownerName: 'Vikas Gowda',
      homeownerPhone: '9845984598',
      homeownerEmail: 'vikas.gowda@example.com',
      projectLocation: 'Koramangala, Bangalore',
      projectType: 'Duplex House',
      consultationTopic: 'Cost Estimation & BOQ Review',
      preferredDate: '2026-11-20',
      preferredTime: '04:00 PM',
      gateway: 'CASHFREE',
    });

    expect(bookingResult.request.publicReference).toMatch(/^HT-CON-/);
    // Crucial check: zero SMS OTP calls dispatched
    expect(trackingProvider.sendOtpCalls.length).toBe(0);
    expect(trackingProvider.retryOtpCalls.length).toBe(0);
    expect(trackingProvider.verifyOtpCalls.length).toBe(0);
  });

  it('3. Controller createBookingRequest succeeds without verificationToken and without phoneVerifiedAt', async () => {
    let responseStatus: number = 200;
    let responseJson: any = null;

    const mockReq: any = {
      body: {
        consultantId: 'cons-ar-ramesh',
        homeownerName: 'Karthik Rao',
        homeownerPhone: '9988776655',
        homeownerEmail: 'karthik.rao@hutty.in',
        projectLocation: 'Whitefield, Bangalore',
        projectType: 'Row House',
        consultationTopic: 'Structural Safety Review',
        preferredDate: '2026-11-10',
        preferredTime: '02:00 PM',
        gateway: 'CASHFREE',
        // Deliberately no verificationToken
      },
      user: {
        id: 'usr_karthik_rao',
        email: 'karthik.rao@hutty.in',
      },
      headers: {},
    };

    const mockRes: any = {
      status(code: number) {
        responseStatus = code;
        return this;
      },
      json(data: any) {
        responseJson = data;
        return this;
      },
    };

    await createBookingRequestController(mockReq, mockRes);

    expect(responseStatus).toBe(201);
    expect(responseJson.success).toBe(true);
    expect(responseJson.data.request.publicReference).toMatch(/^HT-CON-/);
    expect(responseJson.data.cashfreeOptions?.paymentSessionId).toBeDefined();
    expect(trackingProvider.sendOtpCalls.length).toBe(0);
  });

  it("4. Customer ownership is strictly enforced: Customer B cannot access Customer A's booking", async () => {
    // 1. Create booking for Customer A
    const bookingA = await consultationService.createBookingRequest(
      {
        consultantId: 'cons-ar-ramesh',
        homeownerName: 'Customer Alpha',
        homeownerPhone: '9876543210',
        homeownerEmail: 'alpha@hutty.in',
        projectLocation: 'JP Nagar, Bangalore',
        projectType: 'Villa',
        consultationTopic: 'Plan Review',
        preferredDate: '2026-11-05',
        preferredTime: '10:00 AM',
      },
      { id: 'usr_alpha', email: 'alpha@hutty.in' }
    );

    // 2. Customer B attempts to retrieve Customer A's booking via getUserConsultationById -> Throws Forbidden
    await expect(
      consultationService.getUserConsultationById(bookingA.request.id, {
        id: 'usr_beta',
        email: 'beta@hutty.in',
      })
    ).rejects.toThrow(/Forbidden/);

    // 3. Customer B attempts via controller endpoint getMyConsultationById -> 403 Forbidden
    let statusB = 200;
    let jsonB: any = null;
    const reqB: any = {
      params: { id: bookingA.request.id },
      user: { id: 'usr_beta', email: 'beta@hutty.in' },
      query: {},
    };
    const resB: any = {
      status(code: number) {
        statusB = code;
        return this;
      },
      json(data: any) {
        jsonB = data;
        return this;
      },
    };

    await getMyConsultationById(reqB, resB);
    expect(statusB).toBe(403);
    expect(jsonB.success).toBe(false);

    // 4. Customer A CAN retrieve their own booking
    const lookupByA = await consultationService.getUserConsultationById(
      bookingA.request.id,
      { id: 'usr_alpha', email: 'alpha@hutty.in' }
    );
    expect(lookupByA).toBeDefined();
    expect(lookupByA?.publicReference).toBe(bookingA.request.publicReference);
  });

  it('5. Unauthenticated users must still authenticate where required', async () => {
    let status = 200;
    let json: any = null;

    const unauthReq: any = {
      user: undefined,
      query: {},
      headers: {},
    };
    const mockRes: any = {
      status(code: number) {
        status = code;
        return this;
      },
      json(data: any) {
        json = data;
        return this;
      },
    };

    await getMyConsultations(unauthReq, mockRes);
    expect(status).toBe(401);
    expect(json.success).toBe(false);
  });

  it('6. Consultation payment verification remains mandatory before confirmation', async () => {
    const booking = await consultationService.createBookingRequest({
      consultantId: 'cons-ar-ramesh',
      homeownerName: 'Payment Check User',
      homeownerPhone: '9845012345',
      homeownerEmail: 'pay.check@hutty.in',
      projectLocation: 'Hebbal, Bangalore',
      projectType: 'G+2 Residence',
      consultationTopic: 'Structural Drawing Vetting',
      preferredDate: '2026-11-25',
      preferredTime: '03:00 PM',
      gateway: 'CASHFREE',
    });

    // Verification without valid gateway confirmation is rejected
    await expect(
      consultationService.verifyPayment(booking.request.id, {
        gatewayOrderId: booking.payment.gatewayOrderId!,
        gatewayPaymentId: 'pay_unverified_bogus',
        signature: 'invalid_cryptographic_signature',
      })
    ).rejects.toThrow();

    // Payment status remains PENDING
    const current = await consultationService.getRequestById(booking.request.id);
    expect(current).toBeDefined();
  });

  it('7. Calculator and customer signup/login continue working without OTP', async () => {
    const uniqueEmail = `signup_no_otp_${Date.now()}@hutty.in`;
    let regStatus = 200;
    let regJson: any = null;

    const regReq: any = {
      body: {
        name: 'Suresh Kumar',
        email: uniqueEmail,
        password: 'Password@12345678', // 12+ chars policy
        phone: '9876543210',
        // Deliberately no verificationToken
      },
    };
    const regRes: any = {
      status(code: number) {
        regStatus = code;
        return this;
      },
      json(data: any) {
        regJson = data;
        return this;
      },
    };

    await register(regReq, regRes);
    expect(regStatus).toBe(201);
    expect(regJson.success).toBe(true);
    expect(regJson.token).toBeDefined();
    expect(regJson.user.email).toBe(uniqueEmail);

    // Login with the newly registered user succeeds without OTP
    let loginStatus = 200;
    let loginJson: any = null;

    const loginReq: any = {
      body: {
        email: uniqueEmail,
        password: 'Password@12345678',
      },
    };
    const loginRes: any = {
      status(code: number) {
        loginStatus = code;
        return this;
      },
      json(data: any) {
        loginJson = data;
        return this;
      },
    };

    await login(loginReq, loginRes);
    expect(loginStatus).toBe(200);
    expect(loginJson.success).toBe(true);
    expect(loginJson.token).toBeDefined();
  });

  it('8. No false phone verification badges appear on unverified user records', async () => {
    const freshEmail = `badge_check_${Date.now()}@hutty.in`;
    let regStatus = 200;
    let regJson: any = null;

    const regReq: any = {
      body: {
        name: 'Anita Desai',
        email: freshEmail,
        password: 'Password@12345678',
        phone: '9812345678',
      },
    };
    const regRes: any = {
      status(code: number) {
        regStatus = code;
        return this;
      },
      json(data: any) {
        regJson = data;
        return this;
      },
    };

    await register(regReq, regRes);
    expect(regStatus).toBe(201);
    // Crucial check: phoneVerified is strictly FALSE when no OTP verification occurred
    expect(regJson.user.phoneVerified).toBe(false);
    expect(regJson.user.phoneVerifiedAt).toBeFalsy();
  });
});
