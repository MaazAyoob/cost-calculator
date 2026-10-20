// ==============================================================================
// Hutty Signup & Login Robustness Verification Test Suite
// Verifies all 12 core requirements from the Signup & Login Robustness Audit:
// 1. Type an email without submitting signup: no false duplicate warning.
// 2. Enter a registered email: accurate duplicate warning at the appropriate time.
// 3. Enter a new, valid-format email: signup proceeds to submission.
// 4. Enter malformed email and phone values: rejected on the server.
// 5. Enter a weak password: rejected with a clear explanation.
// 6. Enter a valid password containing special characters: accepted.
// 7. Submit signup twice rapidly: no duplicate accounts.
// 8. Attempt concurrent registrations with the same email: at most one succeeds.
// 9. Log in with correct credentials: succeeds.
// 10. Log in with an incorrect password: fails safely.
// 11. Simulate a network error: show a recoverable error, not "Email already exists."
// 12. Verify that existing customer accounts and saved projects still work.
// ==============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import {
  register,
  login,
  checkEmail,
  isValidEmail,
  inMemoryCustomerUsers,
  findInMemoryUserByEmail,
} from '../../../server/src/controllers/auth.controller';
import { normalizeIndianPhoneNumber } from '../../../server/src/utils/phone';
import { projectService } from '../../../server/src/services/project.service';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';

// Helper to simulate Express req/res
function createMockReqRes(body: any = {}, query: any = {}) {
  const req: any = {
    body,
    query,
    ip: '127.0.0.1',
    headers: { 'user-agent': 'Vitest-Test-Agent' },
  };
  const res: any = {
    statusCode: 200,
    jsonData: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.jsonData = data;
      return this;
    },
  };
  return { req, res };
}

describe('Hutty — Signup & Login Robustness Audit and Fix', () => {
  beforeEach(() => {
    projectService.clearInMemory();
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Case 1: Type an email without submitting signup: no false duplicate warning
  // ---------------------------------------------------------------------------
  it('Case 1: typing an email without submitting signup never emits false duplicate warnings or creates accounts', async () => {
    const userCountBefore = inMemoryCustomerUsers.size;

    // A. Incomplete / in-progress keystroke: "newhomeowner" (no @)
    const probe1 = createMockReqRes({ email: 'newhomeowner' });
    await checkEmail(probe1.req, probe1.res);
    expect(probe1.res.jsonData.available).toBe(true);
    expect(probe1.res.jsonData.valid).toBe(false);

    // B. Incomplete domain: "newhomeowner@gmail"
    const probe2 = createMockReqRes({ email: 'newhomeowner@gmail' });
    await checkEmail(probe2.req, probe2.res);
    expect(probe2.res.jsonData.available).toBe(true);
    expect(probe2.res.jsonData.valid).toBe(false);

    // C. Complete unregistered address: "brandnew.homeowner@example.com"
    const probe3 = createMockReqRes({ email: 'brandnew.homeowner@example.com' });
    await checkEmail(probe3.req, probe3.res);
    expect(probe3.res.jsonData.available).toBe(true);
    expect(probe3.res.jsonData.message).toBeUndefined();

    // Verify checking email did NOT create any accounts
    expect(inMemoryCustomerUsers.size).toBe(userCountBefore);
  });

  // ---------------------------------------------------------------------------
  // Case 2: Enter a registered email: accurate duplicate warning at appropriate time
  // ---------------------------------------------------------------------------
  it('Case 2: accurately detects registered email case-insensitively and returns friendly warning', async () => {
    // Seeded account: customer@hutty.in
    // Test lowercase
    const check1 = createMockReqRes({ email: 'customer@hutty.in' });
    await checkEmail(check1.req, check1.res);
    expect(check1.res.jsonData.available).toBe(false);
    expect(check1.res.jsonData.message).toContain('already exists');

    // Test uppercase / mixed case
    const check2 = createMockReqRes({ email: 'CUSTOMER@HUTTY.IN' });
    await checkEmail(check2.req, check2.res);
    expect(check2.res.jsonData.available).toBe(false);
    expect(check2.res.jsonData.message).toContain('already exists');

    // Test leading/trailing whitespace
    const check3 = createMockReqRes({ email: '  Customer@Hutty.in   ' });
    await checkEmail(check3.req, check3.res);
    expect(check3.res.jsonData.available).toBe(false);

    // Test admin reserved emails
    const checkAdmin = createMockReqRes({ email: 'admin@hutty.in' });
    await checkEmail(checkAdmin.req, checkAdmin.res);
    expect(checkAdmin.res.jsonData.available).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // Case 3: Enter a new, valid-format email: signup proceeds to submission
  // ---------------------------------------------------------------------------
  it('Case 3: valid signup proceeds to submission without OTP gating and creates exactly one account', async () => {
    const testEmail = 'priya.nair@example.com';
    const testPhone = '9845112233';
    const testPassword = 'Password@2026Safe';

    const { req, res } = createMockReqRes({
      name: 'Priya Nair',
      email: testEmail,
      phone: testPhone,
      password: testPassword,
    });

    await register(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.jsonData.success).toBe(true);
    expect(res.jsonData.token).toBeDefined();
    expect(res.jsonData.user.email).toBe(testEmail);
    expect(res.jsonData.user.name).toBe('Priya Nair');
    expect(res.jsonData.user.phone).toBe('+919845112233');
    // Requirement 3: Do not label number as verified
    expect(res.jsonData.user.phoneVerified).toBe(false);
    expect(res.jsonData.user.phoneVerifiedAt).toBeNull();

    // Verify account exists in storage
    const stored = findInMemoryUserByEmail(testEmail);
    expect(stored).toBeDefined();
    expect(stored?.name).toBe('Priya Nair');
  });

  // ---------------------------------------------------------------------------
  // Case 4: Enter malformed email and phone values: rejected on the server
  // ---------------------------------------------------------------------------
  it('Case 4: rejects malformed emails and invalid Indian phone numbers with field-specific errors', async () => {
    // A. Malformed emails
    const malformedEmails = [
      'plainaddress',
      '@missinglocal.com',
      'missingdomain@.com',
      'user@domain..com',
      'user with spaces@domain.com',
      'user@',
    ];

    for (const badEmail of malformedEmails) {
      const { req, res } = createMockReqRes({
        name: 'Test User',
        email: badEmail,
        phone: '9876543210',
        password: 'ValidPassword123!',
      });
      await register(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.jsonData.error).toContain('valid email');
    }

    // B. Malformed Indian phone numbers
    const malformedPhones = [
      '',
      '12345',              // Too short
      '1234567890',         // Starts with 1 (invalid Indian mobile prefix)
      '5555555555',         // Starts with 5 (invalid Indian mobile prefix)
      '987654321012345',    // Too long (impossible length)
      '98765abcde',         // Alphabetic characters
    ];

    for (const badPhone of malformedPhones) {
      const { req, res } = createMockReqRes({
        name: 'Test User',
        email: `valid.${Date.now()}@example.com`,
        phone: badPhone,
        password: 'ValidPassword123!',
      });
      await register(req, res);
      expect(res.statusCode).toBe(400);
    }
  });

  // ---------------------------------------------------------------------------
  // Case 5: Enter a weak password: rejected with a clear explanation
  // ---------------------------------------------------------------------------
  it('Case 5: rejects passwords shorter than 12 characters with clear explanatory message', async () => {
    const weakPasswords = [
      '123456',        // 6 chars
      'short',         // 5 chars
      'Password12',    // 10 chars
      'WeakPass11!',   // 11 chars
    ];

    for (const weak of weakPasswords) {
      const { req, res } = createMockReqRes({
        name: 'Test User',
        email: `pwd.test.${Date.now()}@example.com`,
        phone: '9876543210',
        password: weak,
      });

      await register(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.jsonData.error).toContain('12 characters');
      expect(res.jsonData.field).toBe('password');
    }
  });

  // ---------------------------------------------------------------------------
  // Case 6: Enter a valid password containing special characters: accepted
  // ---------------------------------------------------------------------------
  it('Case 6: accepts valid 12+ character passwords with diverse special characters without altering characters', async () => {
    const complexPassword = 'Hutt¥_#Building@2026!$€';
    const email = 'complex.pass@example.com';

    const { req, res } = createMockReqRes({
      name: 'Special Char User',
      email,
      phone: '9845984598',
      password: complexPassword,
    });

    await register(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.jsonData.success).toBe(true);

    // Verify login works with the exact unaltered special characters
    const loginProbe = createMockReqRes({
      email,
      password: complexPassword,
    });
    await login(loginProbe.req, loginProbe.res);
    expect(loginProbe.res.statusCode).toBe(200);
    expect(loginProbe.res.jsonData.success).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // Case 7: Submit signup twice rapidly: no duplicate accounts
  // ---------------------------------------------------------------------------
  it('Case 7: rapid duplicate submission creates exactly one account and returns 409 on the second', async () => {
    const email = 'rapid.double@example.com';
    const phone = '9876543299';
    const password = 'DoubleSubmitSafe@123';

    // First submission
    const first = createMockReqRes({
      name: 'Double Submitter',
      email,
      phone,
      password,
    });
    await register(first.req, first.res);
    expect(first.res.statusCode).toBe(201);

    // Second rapid submission with same email
    const second = createMockReqRes({
      name: 'Double Submitter',
      email,
      phone,
      password,
    });
    await register(second.req, second.res);
    expect(second.res.statusCode).toBe(409);
    expect(second.res.jsonData.error).toContain('already exists');

    // Verify only 1 account exists
    const usersWithEmail = Array.from(inMemoryCustomerUsers.values()).filter(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    expect(usersWithEmail.length).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // Case 8: Attempt concurrent registrations with the same email: at most one succeeds
  // ---------------------------------------------------------------------------
  it('Case 8: concurrent registrations for the same email execute safely with at most one success', async () => {
    const email = 'concurrent.race@example.com';
    const phone = '9845001122';
    const password = 'ConcurrentRace@123';

    const req1 = createMockReqRes({ name: 'Race One', email, phone, password });
    const req2 = createMockReqRes({ name: 'Race Two', email, phone, password });

    // Execute concurrently
    await Promise.all([
      register(req1.req, req1.res),
      register(req2.req, req2.res),
    ]);

    const statusCodes = [req1.res.statusCode, req2.res.statusCode];
    // Exactly one should be 201, the other should be 409
    expect(statusCodes).toContain(201);
    expect(statusCodes).toContain(409);

    const usersWithEmail = Array.from(inMemoryCustomerUsers.values()).filter(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    expect(usersWithEmail.length).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // Case 9: Log in with correct credentials: succeeds
  // ---------------------------------------------------------------------------
  it('Case 9: logs in successfully with correct credentials and supports case-insensitive email', async () => {
    const email = 'case.insensitive.login@example.com';
    const password = 'LoginSuccess@123';

    // Register user
    const reg = createMockReqRes({
      name: 'Case User',
      email,
      phone: '9876543201',
      password,
    });
    await register(reg.req, reg.res);
    expect(reg.res.statusCode).toBe(201);

    // Login with uppercase variation
    const loginUp = createMockReqRes({
      email: 'CASE.INSENSITIVE.LOGIN@EXAMPLE.COM',
      password,
    });
    await login(loginUp.req, loginUp.res);
    expect(loginUp.res.statusCode).toBe(200);
    expect(loginUp.res.jsonData.success).toBe(true);
    expect(loginUp.res.jsonData.token).toBeDefined();
    expect(loginUp.res.jsonData.user.email).toBe(email);
  });

  // ---------------------------------------------------------------------------
  // Case 10: Log in with an incorrect password: fails safely
  // ---------------------------------------------------------------------------
  it('Case 10: login with incorrect password fails safely with 401 without revealing account details', async () => {
    const { req, res } = createMockReqRes({
      email: 'customer@hutty.in',
      password: 'CompletelyWrongPassword!123',
    });

    await login(req, res);
    expect(res.statusCode).toBe(401);
    expect(res.jsonData.error).toContain('Invalid credentials');
    expect(res.jsonData.token).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // Case 11: Simulate a network error: show a recoverable error, not "Email already exists"
  // ---------------------------------------------------------------------------
  it('Case 11: network error produces recoverable network failure message, never "Email already exists" and does not create fake session', async () => {
    // Mock global fetch to throw a network disconnect error
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const authStore = useCustomerAuthStore.getState();
    const loginResult = await authStore.login('anyone@example.com', 'SomePassword@123');

    expect(loginResult).toBe(false);
    expect(useCustomerAuthStore.getState().isAuthenticated).toBe(false);
    expect(useCustomerAuthStore.getState().token).toBeNull();
    const currentError = useCustomerAuthStore.getState().error;
    expect(currentError).not.toContain('already exists');
    expect(currentError).toContain('Unable to connect');

    // Simulate network error on signup as well
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network request failed'));
    const signupResult = await authStore.signup('User', 'new@example.com', 'Password@12345', '9876543210');
    expect(signupResult).toBe(false);
    expect(useCustomerAuthStore.getState().isAuthenticated).toBe(false);
    const signupError = useCustomerAuthStore.getState().error;
    expect(signupError).not.toContain('already exists');
    expect(signupError).toContain('Unable to connect');
  });

  // ---------------------------------------------------------------------------
  // Case 12: Verify that existing customer accounts and saved projects still work
  // ---------------------------------------------------------------------------
  it('Case 12: preserves existing customer accounts, login, and project persistence end-to-end', async () => {
    // 1. Existing seeded customer: customer@hutty.in with Customer@123
    const loginReq = createMockReqRes({
      email: 'customer@hutty.in',
      password: 'Customer@123',
    });
    await login(loginReq.req, loginReq.res);
    expect(loginReq.res.statusCode).toBe(200);
    const user = loginReq.res.jsonData.user;
    expect(user.id).toBe('usr-customer-test');
    expect(user.name).toBe('Ananya Sharma');

    // 2. Customer creates a persistent house project
    const project = await projectService.createProject({
      name: 'Ananya Whitefield Villa',
      leadEmail: user.email,
      leadName: user.name,
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      configuration: { plotLength: 40, plotWidth: 60, floors: 2 },
      calculation: { totalBUASqFt: 3200, totalCostINR: 7200000 },
    });

    expect(project.id).toBeDefined();
    expect(project.name).toBe('Ananya Whitefield Villa');

    // 3. Customer updates project
    const updated = await projectService.updateProject(project.id, project.ownerId, {
      configuration: { plotLength: 40, plotWidth: 60, floors: 3 },
    });
    expect(updated.configuration.floors).toBe(3);

    // 4. Retrieve saved project
    const retrieved = await projectService.getProjectById(project.id);
    expect(retrieved?.name).toBe('Ananya Whitefield Villa');
    expect(retrieved?.configuration.floors).toBe(3);
  });
});
