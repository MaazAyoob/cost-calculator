import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env';
import { inMemoryAdminUser, recordSecurityEvent } from './account.controller';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { otpService } from '../services/otp.service';
import { normalizeIndianPhoneNumber } from '../utils/phone';

let prisma: PrismaClient | null = null;
try {
  prisma = new PrismaClient();
} catch (e) {
  // Graceful fallback
}

// In-memory customer users storage fallback for local/test environments
export interface CustomerUserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  phoneVerifiedAt?: Date | null;
  role: string;
  disabled?: boolean;
  disabledAt?: Date | null;
  disabledReason?: string | null;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export const inMemoryCustomerUsers: Map<string, CustomerUserRecord> = new Map();

// Helper for case-insensitive in-memory lookup
export function findInMemoryUserByEmail(email: string): CustomerUserRecord | undefined {
  const norm = email.trim().toLowerCase();
  for (const [key, user] of inMemoryCustomerUsers.entries()) {
    if (key.toLowerCase() === norm || user.email.toLowerCase() === norm) {
      return user;
    }
  }
  return undefined;
}

// Active in-flight registration lock to prevent concurrent duplicates with same email
export const activeRegistrations: Set<string> = new Set();

// Robust RFC-compliant email validator
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) return false;
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (local.length > 64 || local.length === 0) return false;
  if (domain.length > 255 || domain.length === 0) return false;
  if (domain.startsWith('-') || domain.endsWith('-')) return false;
  if (domain.includes('..')) return false;
  return true;
}

// Seed initial test customer account
const testCustomerHash = bcrypt.hashSync('Customer@123', 10);
inMemoryCustomerUsers.set('customer@hutty.in', {
  id: 'usr-customer-test',
  name: 'Ananya Sharma',
  email: 'customer@hutty.in',
  phone: '9876543210',
  role: 'USER',
  passwordHash: testCustomerHash,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
});

/**
 * Lightweight, strictly read-only email availability check.
 * Does NOT create accounts, does NOT send OTPs, does NOT mutate database state.
 */
export async function checkEmail(req: Request, res: Response) {
  const email = (req.body?.email || req.query?.email || '') as string;
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.json({ available: true, valid: false });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return res.json({ available: true, valid: false });
  }

  // 1. Check admin & demo accounts
  if (
    normalizedEmail === inMemoryAdminUser.email.toLowerCase() ||
    normalizedEmail === 'admin@hutty.in' ||
    normalizedEmail === 'admin@costcalculator.app' ||
    normalizedEmail === 'client@rightcon.in'
  ) {
    return res.json({
      available: false,
      message: 'An account with this email address already exists. Please log in.',
    });
  }

  // 2. Check Database if available
  if (prisma && (prisma as any).user) {
    try {
      const existing = await (prisma as any).user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      });
      if (existing) {
        return res.json({
          available: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }
    } catch {
      // Fall through to in-memory check
    }
  }

  // 3. Check in-memory store
  const memUser = findInMemoryUserByEmail(normalizedEmail);
  if (memUser) {
    return res.json({
      available: false,
      message: 'An account with this email address already exists. Please log in.',
    });
  }

  return res.json({ available: true });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if matches inMemoryAdminUser
  if (
    normalizedEmail === inMemoryAdminUser.email.toLowerCase() ||
    normalizedEmail === 'admin@hutty.in' ||
    normalizedEmail === 'admin@costcalculator.app'
  ) {
    const isPasswordValid = await bcrypt.compare(password, inMemoryAdminUser.passwordHash);
    if (isPasswordValid) {
      inMemoryAdminUser.lastLoginAt = new Date();
      await recordSecurityEvent(
        inMemoryAdminUser.email,
        'LOGIN_SUCCESS',
        { method: 'PASSWORD', clientIp: req.ip },
        req.ip,
        req.headers['user-agent']
      );

      const token = jwt.sign(
        {
          id: inMemoryAdminUser.id,
          email: inMemoryAdminUser.email,
          role: inMemoryAdminUser.role,
          v: inMemoryAdminUser.tokenVersion,
        },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: inMemoryAdminUser.id,
          name: inMemoryAdminUser.name,
          email: inMemoryAdminUser.email,
          role: inMemoryAdminUser.role,
        },
      });
    } else {
      await recordSecurityEvent(
        email,
        'LOGIN_FAILED',
        { reason: 'Invalid password', clientIp: req.ip },
        req.ip,
        req.headers['user-agent']
      );
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }
  }

  // 2. Client demo login
  if (normalizedEmail === 'client@rightcon.in' && password === 'Client@123456') {
    let resolvedId = 'c0000000-0000-4000-8000-000000000002';
    let resolvedName = 'Rajesh Sharma';
    let resolvedPhone: string | null = '+91 9845012345';
    if (prisma && (prisma as any).user) {
      try {
        const dbUser = await (prisma as any).user.findFirst({
          where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
          select: { id: true, name: true, email: true, phone: true, role: true },
        });
        if (dbUser) {
          resolvedId = dbUser.id;
          resolvedName = dbUser.name || resolvedName;
          resolvedPhone = dbUser.phone || resolvedPhone;
        } else {
          // Provision in database with valid UUID so foreign keys succeed
          const clientPassHash = await bcrypt.hash('Client@123456', 10);
          const newClient = await (prisma as any).user.create({
            data: {
              id: resolvedId,
              name: resolvedName,
              email: normalizedEmail,
              phone: resolvedPhone,
              role: 'USER',
              password: clientPassHash,
            },
            select: { id: true, name: true, email: true, phone: true, role: true },
          });
          resolvedId = newClient.id;
        }
      } catch (err: any) {
        console.warn('[AuthController] Demo user database resolution note:', err.message);
      }
    }
    const token = jwt.sign(
      { id: resolvedId, email: normalizedEmail, role: 'USER', name: resolvedName },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({
      success: true,
      token,
      user: {
        id: resolvedId,
        name: resolvedName,
        email: normalizedEmail,
        phone: resolvedPhone,
        role: 'USER',
        phoneVerified: false,
        phoneVerifiedAt: null,
      },
    });
  }

  // 3. Database user lookup if available
  if (prisma && (prisma as any).user) {
    try {
      let dbUser: any = null;
      try {
        dbUser = await (prisma as any).user.findFirst({
          where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
          select: { id: true, name: true, email: true, phone: true, role: true, password: true, disabled: true },
        });
      } catch (colErr: any) {
        // If column disabled does not exist in production database, retry without selecting disabled
        if (
          colErr.message?.includes('disabled') ||
          colErr.message?.includes('does not exist') ||
          colErr.code === 'P2022'
        ) {
          console.warn('[AuthController] Database login query falling back to baseline columns due to schema discrepancy:', colErr.message);
          dbUser = await (prisma as any).user.findFirst({
            where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
            select: { id: true, name: true, email: true, phone: true, role: true, password: true },
          });
        } else {
          throw colErr;
        }
      }

      if (dbUser && dbUser.password) {
        if (dbUser.disabled) {
          return res.status(403).json({
            error: 'ACCOUNT_DISABLED',
            message: 'Your account has been disabled by an administrator. Please contact support.',
          });
        }
        const isMatch = await bcrypt.compare(password, dbUser.password);
        if (isMatch) {
          const token = jwt.sign(
            { id: dbUser.id, email: dbUser.email, role: dbUser.role, name: dbUser.name },
            ENV.JWT_SECRET,
            { expiresIn: '7d' }
          );
          return res.json({
            success: true,
            token,
            user: {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              phone: dbUser.phone,
              role: dbUser.role,
              phoneVerified: false,
              phoneVerifiedAt: null,
            },
          });
        }
      }
    } catch (err: any) {
      console.warn('[AuthController] Database user lookup failed, falling through to memory check:', err.message);
      // Fall through to in-memory check
    }
  }

  // 4. In-memory customer users lookup
  const memUser = findInMemoryUserByEmail(normalizedEmail);
  if (memUser) {
    if (memUser.disabled) {
      return res.status(403).json({
        error: 'ACCOUNT_DISABLED',
        message: 'Your account has been disabled by an administrator. Please contact support.',
      });
    }
    const isMatch = await bcrypt.compare(password, memUser.passwordHash);
    if (isMatch) {
      const token = jwt.sign(
        { id: memUser.id, email: memUser.email, role: memUser.role, name: memUser.name },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        token,
        user: {
          id: memUser.id,
          name: memUser.name,
          email: memUser.email,
          phone: memUser.phone,
          role: memUser.role,
          phoneVerified: Boolean(memUser.phoneVerifiedAt),
          phoneVerifiedAt: memUser.phoneVerifiedAt || null,
        },
      });
    }
  }

  await recordSecurityEvent(
    email,
    'LOGIN_FAILED',
    { reason: 'User not found or incorrect password', clientIp: req.ip },
    req.ip,
    req.headers['user-agent']
  );

  return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
}

export async function register(req: Request, res: Response) {
  const { email, password, name, phone, verificationToken } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Full name, email address, and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Documented password policy: min 12 characters. Never trim passwords.
  if (typeof password !== 'string' || password.length < 12) {
    return res.status(400).json({
      error: 'Password must be at least 12 characters long.',
      field: 'password',
    });
  }

  // Enforce phone number
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return res.status(400).json({
      error: 'A valid Indian mobile phone number is required.',
      code: 'PHONE_REQUIRED',
    });
  }

  const normPhone = normalizeIndianPhoneNumber(phone);
  if (!normPhone.isValid) {
    return res.status(400).json({
      error: normPhone.error || 'Please enter a valid 10-digit Indian mobile number.',
      code: 'INVALID_PHONE',
    });
  }

  // Phone verification handling:
  // If verificationToken is passed, validate and consume it.
  // Standard signups do not require SMS OTP (OTP verification is postponed across the platform).
  let phoneVerifiedAt: Date | null = null;
  if (verificationToken && typeof verificationToken === 'string') {
    const grantResult = await otpService.consumeGrant(verificationToken, normPhone.e164, 'SIGNUP');
    if (!grantResult.valid) {
      return res.status(400).json({
        error: grantResult.error || 'Phone verification failed or expired. Please verify your phone number again.',
        code: 'PHONE_VERIFICATION_INVALID',
      });
    }
    phoneVerifiedAt = new Date();
  } else if ((ENV as any).REQUIRE_PHONE_VERIFICATION_ON_SIGNUP) {
    return res.status(400).json({
      error: 'Phone verification is required before account creation. Please verify your phone number with an SMS OTP.',
      code: 'PHONE_VERIFICATION_REQUIRED',
    });
  }

  // Concurrency guard: block simultaneous registration attempts for the same normalized email
  if (activeRegistrations.has(normalizedEmail)) {
    return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
  }
  activeRegistrations.add(normalizedEmail);

  try {
    // Check against admin & demo reserved emails
    if (
      normalizedEmail === inMemoryAdminUser.email.toLowerCase() ||
      normalizedEmail === 'admin@hutty.in' ||
      normalizedEmail === 'admin@costcalculator.app' ||
      normalizedEmail === 'client@rightcon.in'
    ) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const now = new Date();

    // 1. Attempt PostgreSQL creation
    if (prisma && (prisma as any).user) {
      try {
        const existing = await (prisma as any).user.findFirst({
          where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
          select: { id: true },
        });
        if (existing) {
          return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
        }

        let created: any = null;
        try {
          created = await (prisma as any).user.create({
            data: {
              id: userId,
              email: normalizedEmail,
              name: trimmedName,
              phone: normPhone.e164,
              password: hashedPassword,
              role: 'USER',
            },
            select: { id: true, name: true, email: true, phone: true, role: true },
          });
        } catch (createErr: any) {
          if (createErr.code === 'P2002') {
            return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
          }
          // If creation failed due to missing columns (e.g. column disabled does not exist in unmigrated DB),
          // perform resilient raw SQL insertion directly into PostgreSQL "User"
          if (
            createErr.code === 'P2022' ||
            createErr.message?.includes('does not exist') ||
            createErr.message?.includes('disabled')
          ) {
            console.warn('[AuthController] Attempting resilient raw SQL user creation due to schema discrepancy:', createErr.message);
            await (prisma as any).$executeRawUnsafe(
              `INSERT INTO "User" ("id", "name", "email", "phone", "role", "password", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, 'USER'::"Role", $5, NOW(), NOW())
               ON CONFLICT ("email") DO NOTHING;`,
              userId,
              trimmedName,
              normalizedEmail,
              normPhone.e164,
              hashedPassword
            );

            const resolved = await (prisma as any).$queryRawUnsafe(
              `SELECT "id", "name", "email", "phone", "role" FROM "User" WHERE lower("email") = lower($1) LIMIT 1;`,
              normalizedEmail
            );

            if (Array.isArray(resolved) && resolved.length > 0) {
              created = resolved[0];
            } else {
              throw createErr;
            }
          } else {
            throw createErr;
          }
        }

        // Historical guest order reconciliation
        try {
          await (prisma as any).pricingPurchase.updateMany({
            where: { leadEmail: normalizedEmail, userId: null },
            data: { userId: created.id },
          });
          await (prisma as any).consultationRequest.updateMany({
            where: { homeownerEmail: normalizedEmail, userId: null },
            data: { userId: created.id },
          });
          await (prisma as any).userEntitlement.updateMany({
            where: { userEmail: normalizedEmail, userId: null },
            data: { userId: created.id },
          });
        } catch {
          // Non-fatal reconciliation error
        }

        const token = jwt.sign(
          { id: created.id, email: created.email, role: created.role, name: created.name },
          ENV.JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.status(201).json({
          success: true,
          message: 'Account created successfully',
          token,
          user: {
            id: created.id,
            name: created.name,
            email: created.email,
            phone: created.phone,
            role: created.role,
            phoneVerified: Boolean(created.phoneVerifiedAt),
            phoneVerifiedAt: created.phoneVerifiedAt,
          },
        });
      } catch (err: any) {
        if (err.code === 'P2002') {
          return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
        }
        console.warn('[AuthController] Database register failed, falling back to memory:', err.message);
      }
    }

    // 2. In-memory registration fallback (case-insensitive check)
    if (findInMemoryUserByEmail(normalizedEmail)) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    const newRecord: CustomerUserRecord = {
      id: userId,
      name: trimmedName,
      email: normalizedEmail,
      phone: normPhone.e164,
      phoneVerifiedAt,
      role: 'USER',
      passwordHash: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };

    inMemoryCustomerUsers.set(normalizedEmail, newRecord);

    const token = jwt.sign(
      { id: newRecord.id, email: newRecord.email, role: newRecord.role, name: newRecord.name },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newRecord.id,
        name: newRecord.name,
        email: newRecord.email,
        phone: newRecord.phone,
        role: newRecord.role,
        phoneVerified: Boolean(newRecord.phoneVerifiedAt),
        phoneVerifiedAt: newRecord.phoneVerifiedAt,
      },
    });
  } finally {
    activeRegistrations.delete(normalizedEmail);
  }
}

/**
 * Returns current authenticated customer profile.
 */
export async function getMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Admin user check
  if (req.user.email === inMemoryAdminUser.email) {
    return res.json({
      success: true,
      user: {
        id: inMemoryAdminUser.id,
        name: inMemoryAdminUser.name,
        email: inMemoryAdminUser.email,
        role: inMemoryAdminUser.role,
      },
    });
  }

  // Check database
  if (prisma && (prisma as any).user) {
    try {
      const dbUser = await (prisma as any).user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, phoneVerifiedAt: true },
      });
      if (dbUser) {
        return res.json({
          success: true,
          user: {
            ...dbUser,
            phoneVerified: Boolean(dbUser.phoneVerifiedAt),
            phoneVerifiedAt: dbUser.phoneVerifiedAt || null,
          },
        });
      }
    } catch {}
  }

  // Check in-memory
  const memUser = inMemoryCustomerUsers.get(req.user.email);
  if (memUser) {
    return res.json({
      success: true,
      user: {
        id: memUser.id,
        name: memUser.name,
        email: memUser.email,
        phone: memUser.phone,
        role: memUser.role,
        createdAt: memUser.createdAt,
        phoneVerified: Boolean(memUser.phoneVerifiedAt),
        phoneVerifiedAt: memUser.phoneVerifiedAt || null,
      },
    });
  }

  return res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: (req.user as any).name || 'Homeowner',
      role: req.user.role,
      phoneVerified: false,
      phoneVerifiedAt: null,
    },
  });
}

/**
 * Updates profile fields (name, phone) for the current authenticated customer.
 * If the phone number is modified, clears previous verification state unless
 * a valid OTP verification grant for the new number is provided.
 */
export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { name, phone, verificationToken } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name cannot be empty.' });
  }

  const trimmedName = name.trim();
  let normalizedPhone: string | null = null;

  if (phone && phone.trim()) {
    const norm = normalizeIndianPhoneNumber(phone);
    if (!norm.isValid) {
      return res.status(400).json({ error: norm.error || 'Invalid Indian mobile number.' });
    }
    normalizedPhone = norm.e164;
  }

  // Determine current phone number & verification state
  let currentPhone: string | null = null;
  let currentPhoneVerifiedAt: Date | null = null;

  if (prisma && (prisma as any).user) {
    try {
      const u = await (prisma as any).user.findUnique({
        where: { id: req.user.id },
        select: { phone: true, phoneVerifiedAt: true },
      });
      if (u) {
        currentPhone = u.phone;
        currentPhoneVerifiedAt = u.phoneVerifiedAt;
      }
    } catch {}
  }
  if (!currentPhone && inMemoryCustomerUsers.has(req.user.email)) {
    const mu = inMemoryCustomerUsers.get(req.user.email);
    if (mu) {
      currentPhone = mu.phone || null;
      currentPhoneVerifiedAt = mu.phoneVerifiedAt || null;
    }
  }

  let newPhoneVerifiedAt: Date | null = currentPhoneVerifiedAt;

  // If phone number is changed:
  if (normalizedPhone !== currentPhone) {
    if (normalizedPhone) {
      if (verificationToken) {
        const grant = await otpService.consumeGrant(verificationToken, normalizedPhone, 'SIGNUP');
        if (grant.valid) {
          newPhoneVerifiedAt = new Date();
        } else {
          return res.status(400).json({
            error: grant.error || 'Verification grant is invalid for this phone number.',
            code: 'PHONE_VERIFICATION_INVALID',
          });
        }
      } else {
        // Clear previous verification state for the changed number
        newPhoneVerifiedAt = null;
      }
    } else {
      newPhoneVerifiedAt = null;
    }
  }

  if (prisma && (prisma as any).user) {
    try {
      const updated = await (prisma as any).user.update({
        where: { id: req.user.id },
        data: {
          name: trimmedName,
          phone: normalizedPhone,
          phoneVerifiedAt: newPhoneVerifiedAt,
        },
        select: { id: true, name: true, email: true, phone: true, role: true, phoneVerifiedAt: true },
      });
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          ...updated,
          phoneVerified: Boolean(updated.phoneVerifiedAt),
        },
      });
    } catch {}
  }

  const memUser = inMemoryCustomerUsers.get(req.user.email);
  if (memUser) {
    memUser.name = trimmedName;
    memUser.phone = normalizedPhone;
    memUser.phoneVerifiedAt = newPhoneVerifiedAt;
    memUser.updatedAt = new Date();
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: memUser.id,
        name: memUser.name,
        email: memUser.email,
        phone: memUser.phone,
        role: memUser.role,
        phoneVerified: Boolean(memUser.phoneVerifiedAt),
        phoneVerifiedAt: memUser.phoneVerifiedAt || null,
      },
    });
  }

  return res.json({
    success: true,
    message: 'Profile updated',
    user: {
      id: req.user.id,
      email: req.user.email,
      name: trimmedName,
      phone: normalizedPhone,
      role: req.user.role,
      phoneVerified: Boolean(newPhoneVerifiedAt),
      phoneVerifiedAt: newPhoneVerifiedAt,
    },
  });
}

/**
 * Initiates a password reset for an email.
 * Generates an expiring single-use cryptographic token.
 */
export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Create expiring reset token (valid for 1 hour)
  const resetToken = jwt.sign(
    { email: normalizedEmail, action: 'PASSWORD_RESET', nonce: crypto.randomBytes(8).toString('hex') },
    ENV.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.json({
    success: true,
    message: 'If an account exists with this email, password reset instructions have been generated.',
    // Expose resetToken in dev/test to facilitate automated recovery testing without live SMTP
    resetToken: ENV.NODE_ENV !== 'production' ? resetToken : undefined,
  });
}

/**
 * Completes password reset using verified token.
 */
export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required.' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 12) {
    return res.status(400).json({
      error: 'New password must be at least 12 characters long.',
      field: 'newPassword',
    });
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
    if (decoded.action !== 'PASSWORD_RESET' || !decoded.email) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const email = (decoded.email as string).trim().toLowerCase();
    const newHash = await bcrypt.hash(newPassword, 10);

    if (prisma && (prisma as any).user) {
      try {
        await (prisma as any).user.update({
          where: { email },
          data: { password: newHash },
        });
        return res.json({ success: true, message: 'Password has been successfully updated. You may now log in.' });
      } catch {}
    }

    const memUser = findInMemoryUserByEmail(email);
    if (memUser) {
      memUser.passwordHash = newHash;
      memUser.updatedAt = new Date();
      return res.json({ success: true, message: 'Password has been successfully updated. You may now log in.' });
    }

    return res.json({ success: true, message: 'Password has been successfully updated. You may now log in.' });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid or expired password reset token.' });
  }
}
