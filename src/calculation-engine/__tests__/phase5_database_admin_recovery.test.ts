import { describe, it, expect, beforeEach, vi } from 'vitest';

// Provide global localStorage mock for Node test environment
const storage = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, String(value)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};
(global as any).localStorage = mockLocalStorage;

import { consultationService } from '../../../server/src/services/consultation.service';
import { cashfreeService } from '../../../server/src/services/cashfree.service';
import { pricingService } from '../../../server/src/services/pricing.service';
import { useAdminStore } from '../../store/useAdminStore';
import { fetchAdminUsers } from '../../services/adminUsersApi';

describe('HUTTY 3.0 — PHASE 05: Database Connectivity, Admin Recovery & Payment Integrity', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockLocalStorage.clear();
    useAdminStore.setState({
      token: null,
      adminUser: null,
      isAuthenticated: false,
      authError: null,
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // FAILURE A REGRESSION: CONSULTATION BOOKING FOREIGN-KEY SAFEGUARDS
  // ═════════════════════════════════════════════════════════════════════════
  describe('Failure A: Consultation Booking Foreign-Key Safeguard', () => {
    it('1. Handles orphaned/unregistered userId without PostgreSQL foreign-key constraint violation', async () => {
      // Mock Prisma client where user does not exist in the database
      const mockPrisma = {
        user: {
          findUnique: vi.fn().mockResolvedValue(null),
          findFirst: vi.fn().mockResolvedValue(null),
        },
        consultant: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'c-01',
            name: 'Rahul Sharma',
            title: 'Lead Architect',
            category: 'ARCHITECTURE',
            active: true,
          }),
        },
        project: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
        $transaction: vi.fn().mockImplementation(async (promises) => {
          return Promise.all(promises);
        }),
        consultationRequest: {
          create: vi.fn().mockImplementation(async ({ data }) => {
            // Emulate PostgreSQL strict foreign key check
            if (data.userId === 'orphaned-user-id-999') {
              throw new Error('Foreign key constraint violated: consultation_requests_userId_fkey');
            }
            return { ...data, createdAt: new Date(), updatedAt: new Date() };
          }),
        },
        consultationPayment: {
          create: vi.fn().mockImplementation(async ({ data }) => ({ ...data })),
        },
        consultationEvent: {
          create: vi.fn().mockImplementation(async ({ data }) => ({ ...data })),
        },
      };

      (consultationService as any).prisma = mockPrisma;

      const booking = await consultationService.createBookingRequest(
        {
          homeownerName: 'Priya Sundaram',
          homeownerPhone: '9845012345',
          homeownerEmail: 'priya.sundaram@example.com',
          consultantId: 'c-01',
          preferredDate: '2026-11-05',
          preferredTime: '10:00 AM',
          consultationTopic: 'Structural & Cost Review',
          projectLocation: 'Indiranagar, Bangalore',
          projectType: 'G+2 Independent Residential House',
        },
        { id: 'orphaned-user-id-999', email: 'priya.sundaram@example.com' },
        { enforcePhoneVerification: false }
      );

      expect(booking).toBeDefined();
      expect(booking.request).toBeDefined();
      expect(booking.request.publicReference).toMatch(/^HT-CON-[A-F0-9]{6}$/);
      // Confirms safeUserId was nullified to prevent foreign key abort
      expect(booking.request.userId).toBeNull();
      expect(booking.request.homeownerEmail).toBe('priya.sundaram@example.com');
      expect(booking.request.amountMinorUnits).toBe(149900);
    });

    it('2. Links valid database user when userId exists in PostgreSQL User table', async () => {
      const mockPrisma = {
        user: {
          findUnique: vi.fn().mockResolvedValue({ id: 'usr-valid-101', email: 'arun@example.com' }),
        },
        consultant: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'c-01',
            name: 'Rahul Sharma',
            title: 'Lead Architect',
            category: 'ARCHITECTURE',
            active: true,
          }),
        },
        $transaction: vi.fn().mockImplementation(async (promises) => Promise.all(promises)),
        consultationRequest: {
          create: vi.fn().mockImplementation(async ({ data }) => ({ ...data })),
        },
        consultationPayment: {
          create: vi.fn().mockImplementation(async ({ data }) => ({ ...data })),
        },
        consultationEvent: {
          create: vi.fn().mockImplementation(async ({ data }) => ({ ...data })),
        },
      };

      (consultationService as any).prisma = mockPrisma;

      const booking = await consultationService.createBookingRequest(
        {
          homeownerName: 'Arun Patel',
          homeownerPhone: '9845022334',
          homeownerEmail: 'arun@example.com',
          consultantId: 'c-01',
          preferredDate: '2026-11-06',
          preferredTime: '11:00 AM',
          consultationTopic: 'Plan & Layout Review',
          projectLocation: 'Koramangala, Bangalore',
          projectType: 'G+1 Villa',
        },
        { id: 'usr-valid-101', email: 'arun@example.com' },
        { enforcePhoneVerification: false }
      );

      expect(booking.request.userId).toBe('usr-valid-101');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'usr-valid-101' },
        select: { id: true },
      });
    });

    it('3. Safely handles guest bookings without user context or authentication headers', async () => {
      (consultationService as any).prisma = null; // In-memory/guest mode

      const booking = await consultationService.createBookingRequest(
        {
          homeownerName: 'Guest Homeowner',
          homeownerPhone: '9123456789',
          homeownerEmail: 'guest.booking@example.com',
          preferredDate: '2026-11-07',
          preferredTime: '02:00 PM',
          consultationTopic: 'Material Quality Inspection',
          projectLocation: 'HSR Layout, Bangalore',
          projectType: 'Duplex House',
        },
        undefined,
        { enforcePhoneVerification: false }
      );

      expect(booking.request).toBeDefined();
      expect(booking.request.userId).toBeNull();
      expect(booking.request.amountMinorUnits).toBe(149900);
      expect(booking.request.homeownerEmail).toBe('guest.booking@example.com');
    });

    it('4. Attaches calculator snapshot without requiring account login and preserves snapshot metadata', async () => {
      (consultationService as any).prisma = null;

      const booking = await consultationService.createBookingRequest(
        {
          homeownerName: 'Vikas Gowda',
          homeownerPhone: '9880011223',
          homeownerEmail: 'vikas.gowda@example.com',
          projectSnapshot: {
            houseType: 'Independent Residential House',
            floors: 2,
            totalBUASqFt: 2400,
            estimatedTotalCostINR: 4800000,
            city: 'Bangalore',
          },
          preferredDate: '2026-11-08',
          preferredTime: '04:00 PM',
          consultationTopic: 'Estimation Audit',
          projectLocation: 'Hebbal, Bangalore',
          projectType: 'Independent Residential House',
        },
        undefined,
        { enforcePhoneVerification: false }
      );

      expect(booking.request.projectId).toBeNull();
      expect(booking.request.projectSnapshot).toBeDefined();
      expect(booking.request.projectSnapshot.totalBUASqFt).toBe(2400);
      expect(booking.request.projectSnapshot.estimatedTotalCostINR).toBe(4800000);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // FAILURE B REGRESSION: ADMIN AUTHENTICATION, EXPIRY & ERROR STATES
  // ═════════════════════════════════════════════════════════════════════════
  describe('Failure B: Admin Authentication & Session Recovery', () => {
    it('1. Evicts expired admin JWT tokens and resets session state upon store initialization', () => {
      // Create an expired JWT token (exp in the past)
      const expiredPayload = {
        id: 'admin-1',
        email: 'admin@hutty.in',
        role: 'ADMIN',
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };
      const b64 = Buffer.from(JSON.stringify(expiredPayload)).toString('base64');
      const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${b64}.mockSignature`;

      mockLocalStorage.setItem('hutty_admin_token', expiredToken);

      // Verify decode directly
      const parts = expiredToken.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      expect(payload.exp * 1000).toBeLessThan(Date.now());

      // Invoking handleAuthError evicts token and sets clear error
      const handled = useAdminStore.getState().handleAuthError(401, 'Invalid or expired token');
      expect(handled).toBe(true);
      expect(useAdminStore.getState().token).toBeNull();
      expect(useAdminStore.getState().isAuthenticated).toBe(false);
      expect(useAdminStore.getState().authError).toContain('expired');
      expect(mockLocalStorage.getItem('hutty_admin_token')).toBeNull();
    });

    it('2. API client fetchAdminUsers invokes handleAuthError on 401/403 Invalid or expired token', async () => {
      useAdminStore.setState({
        token: 'stale-token-xyz',
        isAuthenticated: true,
      });

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          error: 'Invalid or expired token',
        }),
      });
      global.fetch = mockFetch;

      await expect(fetchAdminUsers({}, 'stale-token-xyz')).rejects.toThrow(
        /expired token|Failed to fetch/i
      );

      // Store must be logged out and show session expired notice
      expect(useAdminStore.getState().token).toBeNull();
      expect(useAdminStore.getState().isAuthenticated).toBe(false);
      expect(useAdminStore.getState().authError).toContain('expired');
    });

    it('3. Successful admin login sets genuine token, isAuthenticated flag, and clears auth error', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          token: 'valid-signed-admin-jwt-token-2026',
          user: {
            id: 'admin-01',
            email: 'admin@hutty.in',
            role: 'ADMIN',
            name: 'Hutty Lead Admin',
          },
        }),
      });
      global.fetch = mockFetch;

      const success = await useAdminStore.getState().login('ValidAdminPass@2026', 'admin@hutty.in');
      expect(success).toBe(true);
      expect(useAdminStore.getState().isAuthenticated).toBe(true);
      expect(useAdminStore.getState().token).toBe('valid-signed-admin-jwt-token-2026');
      expect(useAdminStore.getState().adminUser?.email).toBe('admin@hutty.in');
      expect(useAdminStore.getState().authError).toBeNull();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // CASHFREE PAYMENT INTEGRATION & ENTITLEMENTS AUDIT
  // ═════════════════════════════════════════════════════════════════════════
  describe('Cashfree Payment Sandbox & Verification Guard', () => {
    it('1. Cashfree environment defaults to TEST in sandbox and uses sandbox PG endpoint', () => {
      expect(cashfreeService.environment).toBe('TEST');
      expect(cashfreeService.baseUrl).toBe('https://sandbox.cashfree.com/pg');
    });

    it('2. Normalizes phone numbers strictly to 10 digits as required by Cashfree API', () => {
      expect(cashfreeService.sanitizePhone('+91 98450 12345')).toBe('9845012345');
      expect(cashfreeService.sanitizePhone('919845012345')).toBe('9845012345');
      expect(cashfreeService.sanitizePhone('9845012345')).toBe('9845012345');
    });

    it('3. Authoritative verification flags AMOUNT_MISMATCH if payment amount differs from required price', async () => {
      vi.spyOn(cashfreeService, 'isConfigured').mockReturnValue(true);
      vi.spyOn(cashfreeService, 'getOrderPayments').mockResolvedValue([
        {
          payment_status: 'SUCCESS',
          payment_amount: 99.0, // Customer paid ₹99
          cf_payment_id: 'cf_pay_test_01',
        },
      ]);

      // Verification expects ₹1,499 for Consultation
      const result = await cashfreeService.verifyOrderPayment('order_test_123', 1499);
      expect(result.verified).toBe(false);
      expect(result.paymentStatus).toBe('AMOUNT_MISMATCH');
      expect(result.message).toContain('does not match');
    });

    it('4. Confirms purchase and grants entitlements server-authoritatively and idempotently', async () => {
      vi.spyOn(cashfreeService, 'isConfigured').mockReturnValue(true);
      vi.spyOn(cashfreeService, 'createOrder').mockResolvedValue({
        orderId: 'cf_ord_naveen_01',
        paymentSessionId: 'cf_session_naveen_01',
        orderStatus: 'ACTIVE',
        orderAmount: 99.0,
        currency: 'INR',
        environment: 'TEST',
        gateway: 'CASHFREE',
      });

      const initiated = await pricingService.initiatePurchase({
        tierCode: 'BASIC_ESTIMATE_PDF',
        leadName: 'Naveen Kumar',
        leadEmail: 'naveen.kumar@example.com',
        leadPhone: '9845033445',
        gateway: 'CASHFREE',
      });

      expect(initiated.purchase).toBeDefined();
      expect(initiated.purchase.amountMinorUnits).toBe(9900); // Strict ₹99 in paise

      // Confirm purchase
      const confirmed = await pricingService.confirmPurchasePayment(
        initiated.purchase.id,
        'cf_pay_naveen_01',
        initiated.purchase.gatewayOrderId,
        undefined,
        true // Webhook / direct verified
      );

      expect(confirmed.purchase.status).toBe('PAID');
      expect(confirmed.entitlements.length).toBeGreaterThan(0);

      // Verify idempotency on second call
      const secondCall = await pricingService.confirmPurchasePayment(
        initiated.purchase.id,
        'cf_pay_naveen_01',
        initiated.purchase.gatewayOrderId,
        undefined,
        true
      );
      expect(secondCall.purchase.status).toBe('PAID');
    });
  });
});
