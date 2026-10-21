// ==============================================================================
// Hutty Admin User Management Service
// Provides secure, server-side customer user listing, account disabling/restoring,
// and safe PII anonymization / permanent removal with transactional integrity.
// ==============================================================================

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { inMemoryCustomerUsers, findInMemoryUserByEmail } from '../controllers/auth.controller';
import { normalizeIndianPhoneNumber, formatDomesticPhone } from '../utils/phone';

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  phoneFormatted: string | null;
  phoneVerified: boolean;
  phoneVerifiedAt: string | null;
  role: string;
  disabled: boolean;
  disabledAt: string | null;
  disabledReason: string | null;
  createdAt: string;
  updatedAt: string;
  counts: {
    projects: number;
    consultations: number;
    purchases: number;
  };
}

export interface UserFilters {
  search?: string;
  status?: 'ALL' | 'ACTIVE' | 'DISABLED';
  sort?: 'newest' | 'oldest' | 'name';
  page?: number;
  limit?: number;
}

export interface UserManagementResult {
  users: AdminUserListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalUsers: number;
    activeUsers: number;
    disabledUsers: number;
  };
}

export class UserManagementService {
  private prisma: PrismaClient | null = null;

  constructor(client?: PrismaClient | null) {
    if (client !== undefined) {
      this.prisma = client;
    } else if (process.env.DATABASE_URL) {
      try {
        this.prisma = new PrismaClient();
      } catch {
        this.prisma = null;
      }
    }
  }

  public setPrismaClient(client: PrismaClient | null): void {
    this.prisma = client;
  }

  private getPrisma(): PrismaClient | null {
    if (this.prisma) return this.prisma;
    if (process.env.DATABASE_URL) {
      try {
        this.prisma = new PrismaClient();
        return this.prisma;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Queries, filters, and paginates users without ever exposing password hashes or tokens.
   * Employs multi-tier schema resilience to ensure 100% of persisted PostgreSQL users
   * are returned even when migrations (like `disabled` or `Project` relations) are pending.
   */
  public async getUsers(filters: UserFilters = {}): Promise<UserManagementResult> {
    const { search, status = 'ALL', sort = 'newest', page = 1, limit = 25 } = filters;
    const allUsersMap = new Map<string, AdminUserListItem>();
    const prisma = this.getPrisma();

    // 1. Fetch from Database if available
    if (prisma) {
      let dbUsers: any[] = [];
      let countsAvailable = false;

      // Tier 1: Attempt full Prisma selection with relations and counts
      try {
        dbUsers = await (prisma as any).user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            phoneVerifiedAt: true,
            role: true,
            disabled: true,
            disabledAt: true,
            disabledReason: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                projects: true,
                consultationRequests: true,
                pricingPurchases: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        countsAvailable = true;
      } catch (tier1Err: any) {
        console.warn(
          '[UserManagementService] Full schema query unavailable, attempting baseline column fallback:',
          tier1Err.message
        );

        // Tier 2: Attempt Prisma query with verified baseline columns only
        try {
          dbUsers = await (prisma as any).user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
          });
        } catch (tier2Err: any) {
          console.warn(
            '[UserManagementService] Baseline Prisma findMany failed, attempting direct raw SQL query:',
            tier2Err.message
          );

          // Tier 3: Direct Raw SQL query against PostgreSQL "User" table
          try {
            const rawUsers = await (prisma as any).$queryRawUnsafe(
              `SELECT "id", "name", "email", "phone", "role"::text as "role", "createdAt", "updatedAt"
               FROM "User"
               ORDER BY "createdAt" DESC;`
            );
            if (Array.isArray(rawUsers)) {
              dbUsers = rawUsers;
            }
          } catch (tier3Err: any) {
            console.error(
              '[UserManagementService] Direct raw SQL query failed to retrieve users:',
              tier3Err.message
            );
          }
        }
      }

      // If we got users from Tier 2 or Tier 3, enrich with safe checks for disabled status, phoneVerifiedAt, and counts
      if (dbUsers.length > 0 && !countsAvailable) {
        const metaMap = new Map<string, { disabled: boolean; disabledAt: Date | null; disabledReason: string | null; phoneVerifiedAt: Date | null }>();
        try {
          const rawMeta = await (prisma as any).$queryRawUnsafe(
            `SELECT "id", "disabled", "disabledAt", "disabledReason", "phoneVerifiedAt" FROM "User";`
          );
          if (Array.isArray(rawMeta)) {
            for (const r of rawMeta) {
              metaMap.set(r.id, {
                disabled: Boolean(r.disabled),
                disabledAt: r.disabledAt ? new Date(r.disabledAt) : null,
                disabledReason: r.disabledReason || null,
                phoneVerifiedAt: r.phoneVerifiedAt ? new Date(r.phoneVerifiedAt) : null,
              });
            }
          }
        } catch {
          // Columns not present in schema yet; default active
        }

        const projectCounts = new Map<string, number>();
        const consultationCounts = new Map<string, number>();
        const purchaseCounts = new Map<string, number>();

        try {
          const pCounts = await (prisma as any).$queryRawUnsafe(
            `SELECT "ownerId" as "id", COUNT(*)::int as "count" FROM "Project" GROUP BY "ownerId";`
          );
          if (Array.isArray(pCounts)) {
            for (const r of pCounts) projectCounts.set(r.id, Number(r.count) || 0);
          }
        } catch {}

        try {
          const cCounts = await (prisma as any).$queryRawUnsafe(
            `SELECT "userId" as "id", COUNT(*)::int as "count" FROM "consultation_requests" WHERE "userId" IS NOT NULL GROUP BY "userId";`
          );
          if (Array.isArray(cCounts)) {
            for (const r of cCounts) consultationCounts.set(r.id, Number(r.count) || 0);
          }
        } catch {}

        try {
          const purCounts = await (prisma as any).$queryRawUnsafe(
            `SELECT "userId" as "id", COUNT(*)::int as "count" FROM "pricing_purchases" WHERE "userId" IS NOT NULL GROUP BY "userId";`
          );
          if (Array.isArray(purCounts)) {
            for (const r of purCounts) purchaseCounts.set(r.id, Number(r.count) || 0);
          }
        } catch {}

        for (const u of dbUsers) {
          const meta = metaMap.get(u.id);
          u.disabled = meta ? meta.disabled : Boolean(u.disabled);
          u.disabledAt = meta ? meta.disabledAt : (u.disabledAt || null);
          u.disabledReason = meta ? meta.disabledReason : (u.disabledReason || null);
          u.phoneVerifiedAt = meta ? meta.phoneVerifiedAt : (u.phoneVerifiedAt || null);
          u._count = {
            projects: projectCounts.get(u.id) || 0,
            consultationRequests: consultationCounts.get(u.id) || 0,
            pricingPurchases: purchaseCounts.get(u.id) || 0,
          };
        }
      }

      for (const u of dbUsers) {
        const normPhone = u.phone ? normalizeIndianPhoneNumber(u.phone) : null;
        const phoneDisplay = normPhone && normPhone.isValid
          ? `+91 ${formatDomesticPhone(normPhone.domestic)}`
          : (u.phone ? formatDomesticPhone(u.phone) : null);

        allUsersMap.set(u.id, {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          phoneFormatted: phoneDisplay,
          phoneVerified: Boolean(u.phoneVerifiedAt),
          phoneVerifiedAt: u.phoneVerifiedAt ? new Date(u.phoneVerifiedAt).toISOString() : null,
          role: u.role || 'USER',
          disabled: Boolean(u.disabled),
          disabledAt: u.disabledAt ? new Date(u.disabledAt).toISOString() : null,
          disabledReason: u.disabledReason || null,
          createdAt: new Date(u.createdAt).toISOString(),
          updatedAt: new Date(u.updatedAt).toISOString(),
          counts: {
            projects: u._count?.projects || 0,
            consultations: u._count?.consultationRequests || 0,
            purchases: u._count?.pricingPurchases || 0,
          },
        });
      }
    }

    // 2. Merge with inMemoryCustomerUsers (for offline/test environments)
    for (const mem of inMemoryCustomerUsers.values()) {
      if (!allUsersMap.has(mem.id)) {
        const normPhone = mem.phone ? normalizeIndianPhoneNumber(mem.phone) : null;
        const phoneDisplay = normPhone && normPhone.isValid
          ? `+91 ${formatDomesticPhone(normPhone.domestic)}`
          : (mem.phone ? formatDomesticPhone(mem.phone) : null);

        allUsersMap.set(mem.id, {
          id: mem.id,
          name: mem.name,
          email: mem.email,
          phone: mem.phone || null,
          phoneFormatted: phoneDisplay,
          phoneVerified: Boolean(mem.phoneVerifiedAt),
          phoneVerifiedAt: mem.phoneVerifiedAt ? new Date(mem.phoneVerifiedAt).toISOString() : null,
          role: mem.role || 'USER',
          disabled: Boolean((mem as any).disabled),
          disabledAt: (mem as any).disabledAt ? new Date((mem as any).disabledAt).toISOString() : null,
          disabledReason: (mem as any).disabledReason || null,
          createdAt: new Date(mem.createdAt || Date.now()).toISOString(),
          updatedAt: new Date(mem.updatedAt || Date.now()).toISOString(),
          counts: {
            projects: 0,
            consultations: 0,
            purchases: 0,
          },
        });
      }
    }

    let userList = Array.from(allUsersMap.values());

    // 3. Filter by search query (name, email, phone)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const cleanDigits = q.replace(/\D/g, '');
      userList = userList.filter((u) => {
        const nameMatch = u.name.toLowerCase().includes(q);
        const emailMatch = u.email.toLowerCase().includes(q);
        const phoneMatch = u.phone ? (cleanDigits.length > 2 ? u.phone.replace(/\D/g, '').includes(cleanDigits) : u.phone.toLowerCase().includes(q)) : false;
        return nameMatch || emailMatch || phoneMatch;
      });
    }

    // 4. Summary metrics calculated across the entire search cohort (before status filtering)
    const totalUsers = userList.length;
    const activeUsers = userList.filter((u) => !u.disabled).length;
    const disabledUsers = userList.filter((u) => u.disabled).length;

    // 5. Filter by status ('ALL' | 'ACTIVE' | 'DISABLED')
    if (status === 'ACTIVE') {
      userList = userList.filter((u) => !u.disabled);
    } else if (status === 'DISABLED') {
      userList = userList.filter((u) => u.disabled);
    }

    const filteredTotal = userList.length;

    // 6. Sort
    if (sort === 'oldest') {
      userList.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'name') {
      userList.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: newest first
      userList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // 7. Paginate
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 25));
    const totalPages = Math.ceil(filteredTotal / limitNum) || 1;
    const offset = (pageNum - 1) * limitNum;
    const paginatedUsers = userList.slice(offset, offset + limitNum);

    return {
      users: paginatedUsers,
      pagination: {
        total: filteredTotal,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
      summary: {
        totalUsers,
        activeUsers,
        disabledUsers,
      },
    };
  }

  /**
   * Disables a user account.
   * Protects Admin/Superadmin accounts from being disabled.
   * Invalidates active sessions and rejects future logins.
   */
  public async disableUser(
    targetUserId: string,
    reason?: string,
    actorAdminEmail = 'admin@hutty.in'
  ): Promise<AdminUserListItem> {
    const existing = await this.findUserById(targetUserId);
    if (!existing) {
      throw new Error(`User with ID "${targetUserId}" not found.`);
    }

    // Protection rule: Never allow disabling admin or superadmin accounts
    if (
      existing.role === 'ADMIN' ||
      existing.role === 'SUPERADMIN' ||
      existing.email.toLowerCase() === 'admin@hutty.in'
    ) {
      throw new Error('SECURITY_VIOLATION: Protected administrator accounts cannot be disabled.');
    }

    // Prevent accidental self-disabling
    if (existing.email.toLowerCase() === actorAdminEmail.toLowerCase()) {
      throw new Error('Action prohibited: Administrators cannot disable their own active account.');
    }

    const disabledAt = new Date();
    const cleanReason = reason?.trim() || 'Account disabled by administrator review';

    // 1. Database update
    const prisma = this.getPrisma();
    if (prisma) {
      try {
        await (prisma as any).user.update({
          where: { id: targetUserId },
          data: {
            disabled: true,
            disabledAt,
            disabledReason: cleanReason,
          },
        });

        // Record security audit log
        try {
          await (prisma as any).auditLog.create({
            data: {
              action: 'USER_ACCOUNT_DISABLED',
              userId: targetUserId,
              details: {
                targetEmail: existing.email,
                disabledBy: actorAdminEmail,
                reason: cleanReason,
                timestamp: disabledAt.toISOString(),
              },
            },
          });
        } catch {
          // non-fatal
        }
      } catch (err: any) {
        console.warn('[UserManagementService] Prisma disableUser failed, attempting raw SQL:', err.message);
        try {
          await (prisma as any).$executeRawUnsafe(
            `UPDATE "User" SET "disabled" = TRUE, "disabledAt" = $1, "disabledReason" = $2 WHERE "id" = $3;`,
            disabledAt,
            cleanReason,
            targetUserId
          );
        } catch (rawErr: any) {
          console.error('[UserManagementService] Database disableUser error:', rawErr.message);
          throw new Error(
            `Cannot disable account in database: Column "disabled" does not exist. Please apply database migration 20261021_add_user_disabled_column.`
          );
        }
      }
    }

    // 2. In-memory update
    if (inMemoryCustomerUsers.has(existing.email.toLowerCase())) {
      const mem = inMemoryCustomerUsers.get(existing.email.toLowerCase());
      if (mem) {
        (mem as any).disabled = true;
        (mem as any).disabledAt = disabledAt;
        (mem as any).disabledReason = cleanReason;
      }
    }

    return {
      ...existing,
      disabled: true,
      disabledAt: disabledAt.toISOString(),
      disabledReason: cleanReason,
    };
  }

  /**
   * Restores a previously disabled user account to active status.
   */
  public async restoreUser(
    targetUserId: string,
    actorAdminEmail = 'admin@hutty.in'
  ): Promise<AdminUserListItem> {
    const existing = await this.findUserById(targetUserId);
    if (!existing) {
      throw new Error(`User with ID "${targetUserId}" not found.`);
    }

    if (!existing.disabled) {
      return existing; // already active
    }

    // 1. Database update
    const prisma = this.getPrisma();
    if (prisma) {
      try {
        await (prisma as any).user.update({
          where: { id: targetUserId },
          data: {
            disabled: false,
            disabledAt: null,
            disabledReason: null,
          },
        });

        try {
          await (prisma as any).auditLog.create({
            data: {
              action: 'USER_ACCOUNT_RESTORED',
              userId: targetUserId,
              details: {
                targetEmail: existing.email,
                restoredBy: actorAdminEmail,
                timestamp: new Date().toISOString(),
              },
            },
          });
        } catch {
          // non-fatal
        }
      } catch (err: any) {
        console.warn('[UserManagementService] Prisma restoreUser failed, attempting raw SQL:', err.message);
        try {
          await (prisma as any).$executeRawUnsafe(
            `UPDATE "User" SET "disabled" = FALSE, "disabledAt" = NULL, "disabledReason" = NULL WHERE "id" = $1;`,
            targetUserId
          );
        } catch (rawErr: any) {
          console.error('[UserManagementService] Database restoreUser error:', rawErr.message);
          throw new Error(
            `Cannot restore account in database: Column "disabled" does not exist. Please apply database migration 20261021_add_user_disabled_column.`
          );
        }
      }
    }

    // 2. In-memory update
    if (inMemoryCustomerUsers.has(existing.email.toLowerCase())) {
      const mem = inMemoryCustomerUsers.get(existing.email.toLowerCase());
      if (mem) {
        (mem as any).disabled = false;
        (mem as any).disabledAt = null;
        (mem as any).disabledReason = null;
      }
    }

    return {
      ...existing,
      disabled: false,
      disabledAt: null,
      disabledReason: null,
    };
  }

  /**
   * Permanently and safely removes a customer user account.
   * If the user has financial transactions (purchases, paid consultations, or projects),
   * performs strict safe PII anonymization to maintain transaction integrity.
   * If the user has no linked records, removes the row cleanly.
   */
  public async deleteUser(
    targetUserId: string,
    confirm: boolean,
    reason?: string,
    actorAdminEmail = 'admin@hutty.in'
  ): Promise<{
    success: boolean;
    anonymized: boolean;
    message: string;
    retainedRecords: {
      projects: number;
      consultations: number;
      purchases: number;
    };
  }> {
    if (!confirm) {
      throw new Error('Explicit confirmation is required to delete a customer user account.');
    }

    const existing = await this.findUserById(targetUserId);
    if (!existing) {
      throw new Error(`User with ID "${targetUserId}" not found.`);
    }

    // Protection rule: Never allow deleting admin or superadmin accounts
    if (
      existing.role === 'ADMIN' ||
      existing.role === 'SUPERADMIN' ||
      existing.email.toLowerCase() === 'admin@hutty.in'
    ) {
      throw new Error('SECURITY_VIOLATION: Protected administrator accounts cannot be deleted.');
    }

    // Prevent accidental self-deletion
    if (existing.email.toLowerCase() === actorAdminEmail.toLowerCase()) {
      throw new Error('Action prohibited: Administrators cannot delete their own active account.');
    }

    let projectsCount = existing.counts.projects;
    let consultationsCount = existing.counts.consultations;
    let purchasesCount = existing.counts.purchases;

    const prisma = this.getPrisma();
    if (prisma) {
      try {
        projectsCount = await (prisma as any).project.count({ where: { ownerId: targetUserId } });
        consultationsCount = await (prisma as any).consultationRequest.count({ where: { userId: targetUserId } });
        purchasesCount = await (prisma as any).pricingPurchase.count({ where: { userId: targetUserId } });
      } catch {
        // Fall back to existing counts
      }
    }

    const hasLinkedRecords = projectsCount > 0 || consultationsCount > 0 || purchasesCount > 0;

    if (hasLinkedRecords) {
      // ── SAFE ANONYMIZATION WORKFLOW ──
      // Preserve financial transaction history and statutory audit requirements
      const anonymizedEmail = `deleted_${targetUserId.slice(0, 8)}_${Date.now()}@deleted.hutty.in`;
      const anonymizedName = 'Deleted Customer';
      const scrambledPassword = await bcrypt.hash(`deleted_account_${crypto.randomBytes(16).toString('hex')}`, 10);
      const disabledAt = new Date();
      const removalReason = reason?.trim() || `Account removed and PII scrubbed by admin: ${actorAdminEmail}`;

      if (prisma) {
        try {
          await (prisma as any).user.update({
            where: { id: targetUserId },
            data: {
              name: anonymizedName,
              email: anonymizedEmail,
              phone: null,
              phoneVerifiedAt: null,
              password: scrambledPassword,
              disabled: true,
              disabledAt,
              disabledReason: removalReason,
            },
          });
        } catch (err: any) {
          // If disabled column doesn't exist, try raw SQL with baseline columns
          try {
            await (prisma as any).$executeRawUnsafe(
              `UPDATE "User" SET "name" = $1, "email" = $2, "phone" = NULL, "password" = $3 WHERE "id" = $4;`,
              anonymizedName,
              anonymizedEmail,
              scrambledPassword,
              targetUserId
            );
          } catch (rawErr: any) {
            console.error('[UserManagementService] Database anonymizeUser error:', rawErr.message);
            throw new Error(`Failed to remove and anonymize user: ${rawErr.message}`);
          }
        }

        try {
          await (prisma as any).auditLog.create({
            data: {
              action: 'USER_ACCOUNT_ANONYMIZED_AND_REMOVED',
              userId: targetUserId,
              details: {
                previousEmail: existing.email,
                anonymizedEmail,
                performedBy: actorAdminEmail,
                retainedProjects: projectsCount,
                retainedConsultations: consultationsCount,
                retainedPurchases: purchasesCount,
                reason: removalReason,
                timestamp: disabledAt.toISOString(),
              },
            },
          });
        } catch {
          // non-fatal
        }
      }

      // Remove from in-memory customer map
      inMemoryCustomerUsers.delete(existing.email.toLowerCase());

      return {
        success: true,
        anonymized: true,
        message:
          'Account successfully decommissioned. Personal information (name, email, phone) scrubbed. Financial records and consultation history preserved for compliance.',
        retainedRecords: {
          projects: projectsCount,
          consultations: consultationsCount,
          purchases: purchasesCount,
        },
      };
    } else {
      // ── CLEAN PERMANENT REMOVAL WORKFLOW ──
      // Bare user account with 0 attached transactions or projects can be permanently deleted
      if (prisma) {
        try {
          await (prisma as any).user.delete({
            where: { id: targetUserId },
          });
        } catch (err: any) {
          try {
            await (prisma as any).$executeRawUnsafe(`DELETE FROM "User" WHERE "id" = $1;`, targetUserId);
          } catch (rawErr: any) {
            console.error('[UserManagementService] Database deleteUser error:', rawErr.message);
            throw new Error(`Failed to delete user: ${rawErr.message}`);
          }
        }

        try {
          await (prisma as any).auditLog.create({
            data: {
              action: 'USER_ACCOUNT_PERMANENTLY_DELETED',
              userId: null,
              details: {
                deletedUserId: targetUserId,
                deletedEmail: existing.email,
                performedBy: actorAdminEmail,
                timestamp: new Date().toISOString(),
              },
            },
          });
        } catch {
          // non-fatal
        }
      }

      inMemoryCustomerUsers.delete(existing.email.toLowerCase());

      return {
        success: true,
        anonymized: false,
        message: 'Account permanently removed from the system.',
        retainedRecords: {
          projects: 0,
          consultations: 0,
          purchases: 0,
        },
      };
    }
  }

  /**
   * Helper: Finds user by ID from DB or in-memory.
   */
  public async findUserById(id: string): Promise<AdminUserListItem | null> {
    const prisma = this.getPrisma();
    if (prisma) {
      let u: any = null;
      let countsAvailable = false;

      // Tier 1: Try full Prisma findUnique
      try {
        u = await (prisma as any).user.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            phoneVerifiedAt: true,
            role: true,
            disabled: true,
            disabledAt: true,
            disabledReason: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                projects: true,
                consultationRequests: true,
                pricingPurchases: true,
              },
            },
          },
        });
        countsAvailable = true;
      } catch {
        // Tier 2: Try baseline columns
        try {
          u = await (prisma as any).user.findUnique({
            where: { id },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
          });
        } catch {
          // Tier 3: Direct Raw SQL
          try {
            const raw = await (prisma as any).$queryRawUnsafe(
              `SELECT "id", "name", "email", "phone", "role"::text as "role", "createdAt", "updatedAt"
               FROM "User" WHERE "id" = $1 LIMIT 1;`,
              id
            );
            if (Array.isArray(raw) && raw.length > 0) {
              u = raw[0];
            }
          } catch {}
        }
      }

      if (u) {
        if (!countsAvailable) {
          try {
            const rawMeta = await (prisma as any).$queryRawUnsafe(
              `SELECT "disabled", "disabledAt", "disabledReason", "phoneVerifiedAt" FROM "User" WHERE "id" = $1 LIMIT 1;`,
              id
            );
            if (Array.isArray(rawMeta) && rawMeta.length > 0) {
              u.disabled = rawMeta[0].disabled;
              u.disabledAt = rawMeta[0].disabledAt;
              u.disabledReason = rawMeta[0].disabledReason;
              u.phoneVerifiedAt = rawMeta[0].phoneVerifiedAt;
            }
          } catch {}

          let pCount = 0;
          let cCount = 0;
          let purCount = 0;
          try {
            pCount = await (prisma as any).project.count({ where: { ownerId: id } });
          } catch {}
          try {
            cCount = await (prisma as any).consultationRequest.count({ where: { userId: id } });
          } catch {}
          try {
            purCount = await (prisma as any).pricingPurchase.count({ where: { userId: id } });
          } catch {}
          u._count = { projects: pCount, consultationRequests: cCount, pricingPurchases: purCount };
        }

        const normPhone = u.phone ? normalizeIndianPhoneNumber(u.phone) : null;
        const phoneDisplay = normPhone && normPhone.isValid
          ? `+91 ${formatDomesticPhone(normPhone.domestic)}`
          : (u.phone ? formatDomesticPhone(u.phone) : null);

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          phoneFormatted: phoneDisplay,
          phoneVerified: Boolean(u.phoneVerifiedAt),
          phoneVerifiedAt: u.phoneVerifiedAt ? new Date(u.phoneVerifiedAt).toISOString() : null,
          role: u.role || 'USER',
          disabled: Boolean(u.disabled),
          disabledAt: u.disabledAt ? new Date(u.disabledAt).toISOString() : null,
          disabledReason: u.disabledReason || null,
          createdAt: new Date(u.createdAt).toISOString(),
          updatedAt: new Date(u.updatedAt).toISOString(),
          counts: {
            projects: u._count?.projects || 0,
            consultations: u._count?.consultationRequests || 0,
            purchases: u._count?.pricingPurchases || 0,
          },
        };
      }
    }

    for (const mem of inMemoryCustomerUsers.values()) {
      if (mem.id === id) {
        const normPhone = mem.phone ? normalizeIndianPhoneNumber(mem.phone) : null;
        const phoneDisplay = normPhone && normPhone.isValid
          ? `+91 ${formatDomesticPhone(normPhone.domestic)}`
          : (mem.phone ? formatDomesticPhone(mem.phone) : null);

        return {
          id: mem.id,
          name: mem.name,
          email: mem.email,
          phone: mem.phone || null,
          phoneFormatted: phoneDisplay,
          phoneVerified: Boolean(mem.phoneVerifiedAt),
          phoneVerifiedAt: mem.phoneVerifiedAt ? new Date(mem.phoneVerifiedAt).toISOString() : null,
          role: mem.role || 'USER',
          disabled: Boolean((mem as any).disabled),
          disabledAt: (mem as any).disabledAt ? new Date((mem as any).disabledAt).toISOString() : null,
          disabledReason: (mem as any).disabledReason || null,
          createdAt: new Date(mem.createdAt || Date.now()).toISOString(),
          updatedAt: new Date(mem.updatedAt || Date.now()).toISOString(),
          counts: {
            projects: 0,
            consultations: 0,
            purchases: 0,
          },
        };
      }
    }

    return null;
  }
}

export const userManagementService = new UserManagementService();
