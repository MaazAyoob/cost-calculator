// ==============================================================================
// Hutty Admin User Management & Account Governance Test Suite
// Covers:
//  - 1. User Listing, Search, Status Filtering, and Pagination
//  - 2. Disabling Customer Accounts & Immediate Session Invalidation
//  - 3. Rejecting New Logins and Bookings/Purchases for Disabled Accounts
//  - 4. Restoring Accounts & Restoring Full Access
//  - 5. Protection of Administrator Accounts & Self-Action Guards
//  - 6. Safe Deletion Workflow: PII Anonymization & Financial Retention
//  - 7. Bare User Permanent Deletion
//  - 8. Role-Based Access Control & Controller Security
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userManagementService } from '../../../server/src/services/userManagement.service';
import { inMemoryCustomerUsers } from '../../../server/src/controllers/auth.controller';
import { authenticateToken, requireAdmin } from '../../../server/src/middlewares/auth.middleware';
import {
  getUsers as getUsersController,
  disableUser as disableUserController,
  restoreUser as restoreUserController,
  deleteUser as deleteUserController,
} from '../../../server/src/controllers/userManagement.controller';
import { login as loginController } from '../../../server/src/controllers/auth.controller';
import { consultationService } from '../../../server/src/services/consultation.service';
import { pricingService } from '../../../server/src/services/pricing.service';
import { ENV } from '../../../server/src/config/env';

describe('Admin User Management & Account Governance', () => {
  beforeEach(() => {
    inMemoryCustomerUsers.clear();
    consultationService.clearInMemory();
    pricingService.clearInMemory();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. User Listing, Search, and Status Filtering
  // ─────────────────────────────────────────────────────────────────────────────
  describe('1. User Listing & Filtering', () => {
    it('returns empty user list when no customers exist', async () => {
      const result = await userManagementService.getUsers();
      expect(result.users).toEqual([]);
      expect(result.summary.totalUsers).toBe(0);
      expect(result.summary.activeUsers).toBe(0);
      expect(result.summary.disabledUsers).toBe(0);
    });

    it('lists registered users with sanitized fields (never exposing password hash)', async () => {
      const passHash = await bcrypt.hash('SecretPass123!', 10);
      inMemoryCustomerUsers.set('user1@example.com', {
        id: 'u-1',
        name: 'Arjun Verma',
        email: 'user1@example.com',
        phone: '+919876543210',
        phoneVerifiedAt: new Date(),
        role: 'USER',
        passwordHash: passHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await userManagementService.getUsers();
      expect(result.users.length).toBe(1);
      const user = result.users[0];
      expect(user.id).toBe('u-1');
      expect(user.name).toBe('Arjun Verma');
      expect(user.email).toBe('user1@example.com');
      expect(user.phoneVerified).toBe(true);
      expect(user.disabled).toBe(false);
      expect((user as any).passwordHash).toBeUndefined();
      expect((user as any).password).toBeUndefined();
    });

    it('filters users by search query (name, email, phone)', async () => {
      const passHash = await bcrypt.hash('SecretPass123!', 10);
      inMemoryCustomerUsers.set('priya@gmail.com', {
        id: 'u-1',
        name: 'Priya Sharma',
        email: 'priya@gmail.com',
        phone: '+919845011111',
        role: 'USER',
        passwordHash: passHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      inMemoryCustomerUsers.set('rahul@outlook.com', {
        id: 'u-2',
        name: 'Rahul Nair',
        email: 'rahul@outlook.com',
        phone: '+919845022222',
        role: 'USER',
        passwordHash: passHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Search by name
      const resName = await userManagementService.getUsers({ search: 'priya' });
      expect(resName.users.length).toBe(1);
      expect(resName.users[0].name).toBe('Priya Sharma');

      // Search by email domain
      const resEmail = await userManagementService.getUsers({ search: 'outlook' });
      expect(resEmail.users.length).toBe(1);
      expect(resEmail.users[0].name).toBe('Rahul Nair');

      // Search by phone digits
      const resPhone = await userManagementService.getUsers({ search: '2222' });
      expect(resPhone.users.length).toBe(1);
      expect(resPhone.users[0].name).toBe('Rahul Nair');
    });

    it('filters users by account status (ACTIVE vs DISABLED)', async () => {
      const passHash = await bcrypt.hash('SecretPass123!', 10);
      inMemoryCustomerUsers.set('active@example.com', {
        id: 'u-act',
        name: 'Active User',
        email: 'active@example.com',
        role: 'USER',
        disabled: false,
        passwordHash: passHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      inMemoryCustomerUsers.set('disabled@example.com', {
        id: 'u-dis',
        name: 'Disabled User',
        email: 'disabled@example.com',
        role: 'USER',
        disabled: true,
        disabledAt: new Date(),
        disabledReason: 'Terms violation',
        passwordHash: passHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const activeOnly = await userManagementService.getUsers({ status: 'ACTIVE' });
      expect(activeOnly.users.length).toBe(1);
      expect(activeOnly.users[0].id).toBe('u-act');

      const disabledOnly = await userManagementService.getUsers({ status: 'DISABLED' });
      expect(disabledOnly.users.length).toBe(1);
      expect(disabledOnly.users[0].id).toBe('u-dis');
      expect(disabledOnly.summary.totalUsers).toBe(2);
      expect(disabledOnly.summary.activeUsers).toBe(1);
      expect(disabledOnly.summary.disabledUsers).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Disabling & Restoring Accounts
  // ─────────────────────────────────────────────────────────────────────────────
  describe('2. Disabling & Restoring Accounts', () => {
    it('disables an active account and records reason and timestamp', async () => {
      const passHash = await bcrypt.hash('Pass123!', 10);
      inMemoryCustomerUsers.set('customer@hutty.in', {
        id: 'cust-10',
        name: 'Vikram Mehta',
        email: 'customer@hutty.in',
        role: 'USER',
        passwordHash: passHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const disabled = await userManagementService.disableUser('cust-10', 'Suspicious activity reported', 'admin@hutty.in');
      expect(disabled.disabled).toBe(true);
      expect(disabled.disabledReason).toBe('Suspicious activity reported');
      expect(disabled.disabledAt).toBeDefined();

      const inMem = inMemoryCustomerUsers.get('customer@hutty.in');
      expect((inMem as any).disabled).toBe(true);
    });

    it('rejects login attempts when account is disabled', async () => {
      const passHash = await bcrypt.hash('CorrectPassword123!', 10);
      inMemoryCustomerUsers.set('blocked@example.com', {
        id: 'cust-blocked',
        name: 'Blocked User',
        email: 'blocked@example.com',
        role: 'USER',
        disabled: true,
        disabledAt: new Date(),
        disabledReason: 'Account under investigation',
        passwordHash: passHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const req: any = {
        body: { email: 'blocked@example.com', password: 'CorrectPassword123!' },
        ip: '127.0.0.1',
        headers: {},
      };
      let statusSent = 0;
      let jsonSent: any = null;
      const res: any = {
        status: (s: number) => {
          statusSent = s;
          return {
            json: (j: any) => {
              jsonSent = j;
            },
          };
        },
        json: (j: any) => {
          jsonSent = j;
        },
      };

      await loginController(req, res);
      expect(statusSent).toBe(403);
      expect(jsonSent.error).toBe('ACCOUNT_DISABLED');
      expect(jsonSent.message).toContain('disabled');
    });

    it('rejects existing active JWTs on protected requests when account is disabled', async () => {
      const token = jwt.sign(
        { id: 'u-jwt-check', email: 'jwtuser@example.com', role: 'USER', name: 'JWT User' },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Disable account in memory
      inMemoryCustomerUsers.set('jwtuser@example.com', {
        id: 'u-jwt-check',
        name: 'JWT User',
        email: 'jwtuser@example.com',
        role: 'USER',
        disabled: true,
        disabledAt: new Date(),
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const req: any = {
        headers: { authorization: `Bearer ${token}` },
      };
      let statusSent = 0;
      let jsonSent: any = null;
      const res: any = {
        status: (s: number) => {
          statusSent = s;
          return {
            json: (j: any) => {
              jsonSent = j;
            },
          };
        },
      };
      const next = vi.fn();

      await authenticateToken(req, res, next);
      expect(statusSent).toBe(403);
      expect(jsonSent.error).toBe('ACCOUNT_DISABLED');
      expect(next).not.toHaveBeenCalled();
    });

    it('restores a disabled account allowing logins and sessions again', async () => {
      const passHash = await bcrypt.hash('CorrectPassword123!', 10);
      inMemoryCustomerUsers.set('restored@example.com', {
        id: 'cust-restore',
        name: 'Restored User',
        email: 'restored@example.com',
        role: 'USER',
        disabled: true,
        disabledAt: new Date(),
        disabledReason: 'Investigated and resolved',
        passwordHash: passHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const restored = await userManagementService.restoreUser('cust-restore', 'admin@hutty.in');
      expect(restored.disabled).toBe(false);
      expect(restored.disabledAt).toBeNull();
      expect(restored.disabledReason).toBeNull();

      // Now verify login succeeds
      const req: any = {
        body: { email: 'restored@example.com', password: 'CorrectPassword123!' },
        ip: '127.0.0.1',
        headers: {},
      };
      let jsonSent: any = null;
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: (j: any) => {
          jsonSent = j;
        },
      };

      await loginController(req, res);
      expect(jsonSent.success).toBe(true);
      expect(jsonSent.token).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Blocking New Bookings & Purchases for Disabled Accounts
  // ─────────────────────────────────────────────────────────────────────────────
  describe('3. Preventing Actions for Disabled Accounts', () => {
    it('prevents disabled accounts from initiating consultation bookings', async () => {
      inMemoryCustomerUsers.set('disabled-booker@example.com', {
        id: 'u-booker',
        name: 'Disabled Booker',
        email: 'disabled-booker@example.com',
        role: 'USER',
        disabled: true,
        disabledAt: new Date(),
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        consultationService.createBookingRequest(
          {
            consultantId: null,
            homeownerName: 'Disabled Booker',
            homeownerPhone: '+919876543210',
            homeownerEmail: 'disabled-booker@example.com',
            projectLocation: 'Bangalore',
            projectType: 'Villa',
            consultationTopic: 'Structural Review',
            preferredDate: '2026-11-01',
            preferredTime: '10:00 AM',
          },
          { id: 'u-booker', email: 'disabled-booker@example.com' }
        )
      ).rejects.toThrow('ACCOUNT_DISABLED');
    });

    it('prevents disabled accounts from initiating pricing report purchases', async () => {
      inMemoryCustomerUsers.set('disabled-buyer@example.com', {
        id: 'u-buyer',
        name: 'Disabled Buyer',
        email: 'disabled-buyer@example.com',
        role: 'USER',
        disabled: true,
        disabledAt: new Date(),
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        pricingService.initiatePurchase({
          tierCode: 'DETAILED_ESTIMATE_499',
          leadName: 'Disabled Buyer',
          leadPhone: '+919876543210',
          leadEmail: 'disabled-buyer@example.com',
          userId: 'u-buyer',
        })
      ).rejects.toThrow('ACCOUNT_DISABLED');

      const allPurchases = await pricingService.getPurchaseHistory();
      expect(allPurchases.length).toBe(0);
    });

    it('rejects disabled accounts with ACCOUNT_DISABLED before inactive-tier rejection', async () => {
      inMemoryCustomerUsers.set('disabled-legacy@example.com', {
        id: 'u-legacy-buyer',
        name: 'Disabled Legacy Buyer',
        email: 'disabled-legacy@example.com',
        role: 'USER',
        disabled: true,
        disabledAt: new Date(),
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Even though 'ESTIMATE_99' is inactive, disabled account guard must trigger first
      await expect(
        pricingService.initiatePurchase({
          tierCode: 'ESTIMATE_99',
          leadName: 'Disabled Legacy Buyer',
          leadPhone: '+919876543210',
          leadEmail: 'disabled-legacy@example.com',
          userId: 'u-legacy-buyer',
        })
      ).rejects.toThrow('ACCOUNT_DISABLED');

      const allPurchases = await pricingService.getPurchaseHistory();
      expect(allPurchases.length).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Security Guards: Admin Protection & Self-Action Prohibition
  // ─────────────────────────────────────────────────────────────────────────────
  describe('4. Administrator Protection & Self-Action Guards', () => {
    it('prevents disabling admin accounts', async () => {
      inMemoryCustomerUsers.set('admin@hutty.in', {
        id: 'admin-id',
        name: 'Hutty System Admin',
        email: 'admin@hutty.in',
        role: 'ADMIN',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        userManagementService.disableUser('admin-id', 'test', 'superadmin@hutty.in')
      ).rejects.toThrow('SECURITY_VIOLATION');
    });

    it('prevents an administrator from disabling themselves', async () => {
      inMemoryCustomerUsers.set('admin2@hutty.in', {
        id: 'admin-2',
        name: 'Admin Two',
        email: 'admin2@hutty.in',
        role: 'ADMIN',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        userManagementService.disableUser('admin-2', 'accidental', 'admin2@hutty.in')
      ).rejects.toThrow();
    });

    it('prevents deleting admin accounts', async () => {
      inMemoryCustomerUsers.set('admin@hutty.in', {
        id: 'admin-id',
        name: 'Hutty System Admin',
        email: 'admin@hutty.in',
        role: 'ADMIN',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        userManagementService.deleteUser('admin-id', true, 'attempted purge', 'other@hutty.in')
      ).rejects.toThrow('SECURITY_VIOLATION');
    });

    it('requires explicit confirmation { confirm: true } to delete', async () => {
      inMemoryCustomerUsers.set('user@example.com', {
        id: 'u-del-check',
        name: 'Normal User',
        email: 'user@example.com',
        role: 'USER',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        userManagementService.deleteUser('u-del-check', false, 'test', 'admin@hutty.in')
      ).rejects.toThrow('Explicit confirmation is required');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Safe Deletion Workflows: Anonymization vs Bare Deletion
  // ─────────────────────────────────────────────────────────────────────────────
  describe('5. Safe Deletion & Data Retention Invariants', () => {
    it('deletes bare user account cleanly when no linked records exist', async () => {
      inMemoryCustomerUsers.set('bare@example.com', {
        id: 'u-bare',
        name: 'Bare User',
        email: 'bare@example.com',
        role: 'USER',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await userManagementService.deleteUser('u-bare', true, 'Account closed upon request', 'admin@hutty.in');
      expect(res.success).toBe(true);
      expect(res.anonymized).toBe(false);
      expect(inMemoryCustomerUsers.has('bare@example.com')).toBe(false);
    });

    it('controller handles delete with 400 when confirm is not provided', async () => {
      const req: any = {
        params: { id: 'u-123' },
        body: { confirm: false },
        user: { email: 'admin@hutty.in', role: 'ADMIN' },
      };
      let statusSent = 0;
      let jsonSent: any = null;
      const res: any = {
        status: (s: number) => {
          statusSent = s;
          return {
            json: (j: any) => {
              jsonSent = j;
            },
          };
        },
      };

      await deleteUserController(req, res);
      expect(statusSent).toBe(400);
      expect(jsonSent.error).toContain('Explicit confirmation');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Role-Based Access Control on User Management Endpoints
  // ─────────────────────────────────────────────────────────────────────────────
  describe('6. RBAC Protection', () => {
    it('rejects non-admin users with 403 on requireAdmin middleware', () => {
      const req: any = {
        user: { id: 'u-customer', email: 'customer@example.com', role: 'USER' },
      };
      let statusSent = 0;
      let jsonSent: any = null;
      const res: any = {
        status: (s: number) => {
          statusSent = s;
          return {
            json: (j: any) => {
              jsonSent = j;
            },
          };
        },
      };
      const next = vi.fn();

      requireAdmin(req, res, next);
      expect(statusSent).toBe(403);
      expect(jsonSent.error).toContain('Admin authorization required');
      expect(next).not.toHaveBeenCalled();
    });

    it('passes admin users on requireAdmin middleware', () => {
      const req: any = {
        user: { id: 'admin-1', email: 'admin@hutty.in', role: 'ADMIN' },
      };
      const res: any = {};
      const next = vi.fn();

      requireAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
