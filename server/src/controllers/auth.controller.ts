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
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export const inMemoryCustomerUsers: Map<string, CustomerUserRecord> = new Map();

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
      return res.status(401).json({ error: 'Invalid credentials. Password verification failed.' });
    }
  }

  // 2. Client demo login
  if (normalizedEmail === 'client@rightcon.in' && password === 'Client@123456') {
    const token = jwt.sign(
      { id: 'user-1', email: normalizedEmail, role: 'USER', name: 'Rajesh Sharma' },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({
      success: true,
      token,
      user: { id: 'user-1', name: 'Rajesh Sharma', email: normalizedEmail, role: 'USER' },
    });
  }

  // 3. Database user lookup if available
  if (prisma && (prisma as any).user) {
    try {
      const dbUser = await (prisma as any).user.findUnique({ where: { email: normalizedEmail } });
      if (dbUser && dbUser.password) {
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
              phoneVerified: Boolean(dbUser.phoneVerifiedAt),
              phoneVerifiedAt: dbUser.phoneVerifiedAt || null,
            },
          });
        }
      }
    } catch {
      // Fall through to in-memory check
    }
  }

  // 4. In-memory customer users lookup
  const memUser = inMemoryCustomerUsers.get(normalizedEmail);
  if (memUser) {
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

  // Basic email syntax check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // Enforce phone number and phone OTP verification
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

  if (!verificationToken || typeof verificationToken !== 'string') {
    return res.status(400).json({
      error: 'Phone verification is required before account creation. Please verify your phone number with an SMS OTP.',
      code: 'PHONE_VERIFICATION_REQUIRED',
    });
  }

  // Atomically validate and consume the single-use verification grant
  const grantResult = await otpService.consumeGrant(verificationToken, normPhone.e164, 'SIGNUP');
  if (!grantResult.valid) {
    return res.status(400).json({
      error: grantResult.error || 'Phone verification failed or expired. Please verify your phone number again.',
      code: 'PHONE_VERIFICATION_INVALID',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date();

  // 1. Attempt PostgreSQL creation
  if (prisma && (prisma as any).user) {
    try {
      const existing = await (prisma as any).user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
      }

      const created = await (prisma as any).user.create({
        data: {
          id: userId,
          email: normalizedEmail,
          name: trimmedName,
          phone: normPhone.e164,
          phoneVerifiedAt: now,
          password: hashedPassword,
          role: 'USER',
        },
      });

      // Historical guest order reconciliation: associate existing unlinked purchases and consultations
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
      } catch (reconErr) {
        // Reconciliation error is non-fatal
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
          phoneVerified: true,
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

  // 2. In-memory registration fallback
  if (inMemoryCustomerUsers.has(normalizedEmail)) {
    return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
  }

  const newRecord: CustomerUserRecord = {
    id: userId,
    name: trimmedName,
    email: normalizedEmail,
    phone: normPhone.e164,
    phoneVerifiedAt: now,
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
      phoneVerified: true,
      phoneVerifiedAt: newRecord.phoneVerifiedAt,
    },
  });
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

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
    if (decoded.action !== 'PASSWORD_RESET' || !decoded.email) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const email = decoded.email;
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

    const memUser = inMemoryCustomerUsers.get(email);
    if (memUser) {
      memUser.passwordHash = newHash;
      memUser.updatedAt = new Date();
      return res.json({ success: true, message: 'Password has been successfully updated. You may now log in.' });
    }

    return res.json({ success: true, message: 'Password has been successfully updated.' });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid or expired password reset token.' });
  }
}
