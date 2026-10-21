// ==============================================================================
// Hutty Admin Customer Persistence & Backend Restart Regression Test Suite
// Proves:
//  - 1. A newly registered customer appears in the admin user list.
//  - 2. A customer remains present after a backend restart (wiped in-memory state).
//  - 3. Admin summary statistics match actual database records.
//  - 4. Schema resilience: 100% of PostgreSQL users are returned even when
//       unmigrated columns (like `disabled`) or relations (`Project`) throw P2022/P2021.
//  - 5. No silent in-memory fallback in production when database write fails.
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { UserManagementService } from '../../../server/src/services/userManagement.service';
import { inMemoryCustomerUsers, setAuthPrismaClient, register } from '../../../server/src/controllers/auth.controller';

describe('Admin Customer Persistence & Backend Restart Regression', () => {
  beforeEach(() => {
    inMemoryCustomerUsers.clear();
    setAuthPrismaClient(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setAuthPrismaClient(null);
  });

  it('proves a newly registered customer appears in admin list and remains present after backend restart', async () => {
    // Simulated PostgreSQL User Table
    const mockDbUserStore: any[] = [];
    const passwordHash = await bcrypt.hash('SecurePassword@123', 10);

    const mockPrisma: any = {
      user: {
        findFirst: vi.fn(async ({ where }: any) => {
          if (where?.email?.equals) {
            return mockDbUserStore.find((u) => u.email.toLowerCase() === where.email.equals.toLowerCase()) || null;
          }
          return null;
        }),
        findUnique: vi.fn(async ({ where }: any) => {
          return mockDbUserStore.find((u) => u.id === where.id) || null;
        }),
        create: vi.fn(async ({ data }: any) => {
          const record = {
            id: data.id || 'usr-reg-001',
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            role: data.role || 'USER',
            password: data.password,
            disabled: false,
            disabledAt: null,
            disabledReason: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: { projects: 0, consultationRequests: 0, pricingPurchases: 0 },
          };
          mockDbUserStore.push(record);
          return record;
        }),
        findMany: vi.fn(async () => {
          return mockDbUserStore.map((u) => ({
            ...u,
            _count: { projects: 0, consultationRequests: 0, pricingPurchases: 0 },
          }));
        }),
      },
      pricingPurchase: { updateMany: vi.fn() },
      consultationRequest: { updateMany: vi.fn() },
      userEntitlement: { updateMany: vi.fn() },
      $executeRawUnsafe: vi.fn(),
      $queryRawUnsafe: vi.fn(),
    };

    setAuthPrismaClient(mockPrisma);
    const serviceBeforeRestart = new UserManagementService(mockPrisma);

    // 1. Register a new customer through the auth controller
    const regReq: any = {
      body: {
        name: 'Kavitha Ramesh',
        email: 'kavitha.ramesh@example.com',
        phone: '9845012345',
        password: 'ValidPassword123!',
      },
    };
    let regStatus = 0;
    let regJson: any = null;
    const regRes: any = {
      status: (s: number) => {
        regStatus = s;
        return {
          json: (j: any) => {
            regJson = j;
          },
        };
      },
      json: (j: any) => {
        regJson = j;
      },
    };

    await register(regReq, regRes);
    expect(regStatus).toBe(201);
    expect(regJson.success).toBe(true);
    expect(regJson.user.email).toBe('kavitha.ramesh@example.com');
    expect(mockDbUserStore.length).toBe(1);

    // 2. Query admin user management page BEFORE restart
    const listBeforeRestart = await serviceBeforeRestart.getUsers();
    expect(listBeforeRestart.users.length).toBe(1);
    expect(listBeforeRestart.users[0].email).toBe('kavitha.ramesh@example.com');
    expect(listBeforeRestart.users[0].name).toBe('Kavitha Ramesh');
    expect(listBeforeRestart.summary.totalUsers).toBe(1);
    expect(listBeforeRestart.summary.activeUsers).toBe(1);
    expect(listBeforeRestart.summary.disabledUsers).toBe(0);

    // ── 3. SIMULATE COMPLETE BACKEND CONTAINER RESTART ──
    // In a container restart, all in-memory Maps and singleton state are wiped clean
    inMemoryCustomerUsers.clear();
    expect(inMemoryCustomerUsers.size).toBe(0);

    // A new service instance is spun up on boot connected to the persistent database
    const serviceAfterRestart = new UserManagementService(mockPrisma);

    // 4. Query admin user management page AFTER restart
    const listAfterRestart = await serviceAfterRestart.getUsers();
    expect(listAfterRestart.users.length).toBe(1);
    expect(listAfterRestart.users[0].email).toBe('kavitha.ramesh@example.com');
    expect(listAfterRestart.users[0].id).toBe(regJson.user.id);
    expect(listAfterRestart.summary.totalUsers).toBe(1);
    expect(listAfterRestart.summary.activeUsers).toBe(1);
    expect(listAfterRestart.summary.disabledUsers).toBe(0);
  });

  it('resiliently returns all PostgreSQL users even when schema columns or relations throw P2022/P2021', async () => {
    // Simulate database where `disabled` column or `_count: { projects: true }` fails
    const mockPostgresUsers = [
      {
        id: 'pg-usr-1',
        name: 'Suresh Kumar',
        email: 'suresh@example.com',
        phone: '+919845011111',
        role: 'USER',
        createdAt: new Date('2026-03-01'),
        updatedAt: new Date('2026-03-01'),
      },
      {
        id: 'pg-usr-2',
        name: 'Meera Patel',
        email: 'meera@example.com',
        phone: '+919845022222',
        role: 'USER',
        createdAt: new Date('2026-03-02'),
        updatedAt: new Date('2026-03-02'),
      },
    ];

    const mockPrismaWithSchemaMismatch: any = {
      user: {
        findMany: vi.fn(async (args: any) => {
          // If query selects `disabled` or `_count` (Tier 1), simulate PostgreSQL missing column error
          if (args?.select?.disabled || args?.select?._count) {
            const err: any = new Error('The column disabled does not exist in the current database.');
            err.code = 'P2022';
            throw err;
          }
          // Tier 2 baseline selection succeeds
          return mockPostgresUsers;
        }),
      },
      $queryRawUnsafe: vi.fn(async (sql: string) => {
        if (sql.includes('disabled')) {
          // Meta columns do not exist
          throw new Error('column disabled does not exist');
        }
        return [];
      }),
    };

    const service = new UserManagementService(mockPrismaWithSchemaMismatch);
    const result = await service.getUsers();

    // Must return ALL 2 PostgreSQL users despite the schema mismatch
    expect(result.users.length).toBe(2);
    expect(result.summary.totalUsers).toBe(2);
    expect(result.summary.activeUsers).toBe(2);
    expect(result.summary.disabledUsers).toBe(0);
    expect(result.users.map((u) => u.email)).toContain('suresh@example.com');
    expect(result.users.map((u) => u.email)).toContain('meera@example.com');
  });

  it('resiliently falls back to direct raw SQL when Prisma findMany completely fails', async () => {
    const rawPostgresUsers = [
      {
        id: 'raw-usr-1',
        name: 'Deepak Roy',
        email: 'deepak@example.com',
        phone: '+919845033333',
        role: 'USER',
        createdAt: new Date('2026-03-05'),
        updatedAt: new Date('2026-03-05'),
      },
    ];

    const mockPrismaWithBrokenFindMany: any = {
      user: {
        findMany: vi.fn(async () => {
          throw new Error('Prisma Client validation error: Table Project is not known to schema.');
        }),
      },
      $queryRawUnsafe: vi.fn(async (sql: string) => {
        if (sql.includes('SELECT "id", "name", "email"')) {
          return rawPostgresUsers;
        }
        return [];
      }),
    };

    const service = new UserManagementService(mockPrismaWithBrokenFindMany);
    const result = await service.getUsers();

    expect(result.users.length).toBe(1);
    expect(result.users[0].name).toBe('Deepak Roy');
    expect(result.users[0].email).toBe('deepak@example.com');
    expect(result.summary.totalUsers).toBe(1);
  });

  it('does NOT silently fall back to in-memory storage in production when database write fails', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const failingPrisma: any = {
      user: {
        findFirst: vi.fn(async () => null),
        create: vi.fn(async () => {
          throw new Error('Connection pool exhausted: FATAL error connecting to PostgreSQL');
        }),
      },
      $executeRawUnsafe: vi.fn(async () => {
        throw new Error('Connection pool exhausted');
      }),
    };

    setAuthPrismaClient(failingPrisma);

    const regReq: any = {
      body: {
        name: 'Fail User',
        email: 'fail.user@example.com',
        phone: '9845099999',
        password: 'ValidPassword123!',
      },
    };
    let regStatus = 0;
    let regJson: any = null;
    const regRes: any = {
      status: (s: number) => {
        regStatus = s;
        return {
          json: (j: any) => {
            regJson = j;
          },
        };
      },
      json: (j: any) => {
        regJson = j;
      },
    };

    try {
      await register(regReq, regRes);
      // In production, must NOT report 201 Created with volatile memory fallback!
      expect(regStatus).toBe(500);
      expect(regJson.error).toContain('DURABLE_STORAGE_WRITE_FAILED');
      // In-memory store must NOT have captured this user
      expect(inMemoryCustomerUsers.has('fail.user@example.com')).toBe(false);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
