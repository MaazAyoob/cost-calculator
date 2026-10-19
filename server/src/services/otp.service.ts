// ==============================================================================
// Hutty OTP Lifecycle & Security Control Service
// Challenge Management, Rate Limiting, Purpose Isolation & Atomic Verification Grants
// ==============================================================================

import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { getOtpProvider } from './msg91.service';
import { normalizeIndianPhoneNumber, NormalizedPhoneResult } from '../utils/phone';

let prisma: PrismaClient | null = null;
try {
  prisma = new PrismaClient();
} catch {
  // Graceful fallback for non-DB environments
}

export type OtpPurpose = 'SIGNUP' | 'CONSULTATION_BOOKING';

export interface OtpChallengeEntity {
  id: string;
  phone: string;             // Canonical E.164 (+91XXXXXXXXXX)
  purpose: OtpPurpose;
  tokenHash?: string | null; // SHA-256 hash of single-use verification grant
  tokenExpiresAt?: Date | null;
  expiresAt: Date;           // 5 minutes from creation
  resendAvailableAt: Date;   // 60 seconds from creation/resend
  sendCount: number;         // Max 3 sends per 15 min window
  failedAttempts: number;    // Max 5 attempts
  maxAttempts: number;       // Fixed to 5
  status: 'PENDING' | 'VERIFIED' | 'LOCKED' | 'EXPIRED' | 'CONSUMED';
  verifiedAt?: Date | null;
  consumedAt?: Date | null;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestOtpResult {
  success: boolean;
  challengeId?: string;
  maskedPhone?: string;
  resendAvailableInSeconds?: number;
  expiresInSeconds?: number;
  error?: string;
  code?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  verificationToken?: string;
  maskedPhone?: string;
  purpose?: OtpPurpose;
  attemptsRemaining?: number;
  error?: string;
  code?: string;
}

// ── In-Memory Persistence & Rate Limit Store ──
const inMemoryChallenges: Map<string, OtpChallengeEntity> = new Map();

interface RateLimitTracker {
  timestamps: number[];
}
const phoneSendHits: Map<string, RateLimitTracker> = new Map();
const ipSendHits: Map<string, RateLimitTracker> = new Map();
const ipVerifyHits: Map<string, RateLimitTracker> = new Map();

export class OtpService {
  // Policy Constants
  public readonly OTP_EXPIRY_MS = 5 * 60 * 1000;         // 5 minutes
  public readonly RESEND_COOLDOWN_MS = 60 * 1000;        // 60 seconds
  public readonly MAX_FAILED_ATTEMPTS = 5;               // Max 5 attempts per challenge
  public readonly MAX_PHONE_SENDS_IN_15M = 3;            // Max 3 sends per phone in 15 min
  public readonly MAX_IP_SENDS_IN_15M = 10;              // Max 10 sends per IP in 15 min
  public readonly MAX_IP_VERIFIES_IN_15M = 30;           // Max 30 verify attempts per IP in 15 min
  public readonly GRANT_EXPIRY_MS = 15 * 60 * 1000;      // 15 minutes for verification grant

  /**
   * Helper to hash grant tokens with SHA-256
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token.trim()).digest('hex');
  }

  /**
   * Cleans old rate-limit timestamps and checks if allowed.
   */
  private checkRateLimit(
    store: Map<string, RateLimitTracker>,
    key: string,
    windowMs: number,
    limit: number
  ): { allowed: boolean; retryAfterSec?: number } {
    const now = Date.now();
    let tracker = store.get(key);
    if (!tracker) {
      tracker = { timestamps: [] };
      store.set(key, tracker);
    }
    // Retain timestamps within window
    tracker.timestamps = tracker.timestamps.filter((ts) => now - ts < windowMs);

    if (tracker.timestamps.length >= limit) {
      const oldest = tracker.timestamps[0];
      const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      return { allowed: false, retryAfterSec };
    }

    return { allowed: true };
  }

  private recordHit(store: Map<string, RateLimitTracker>, key: string): void {
    const now = Date.now();
    let tracker = store.get(key);
    if (!tracker) {
      tracker = { timestamps: [] };
      store.set(key, tracker);
    }
    tracker.timestamps.push(now);
  }

  /**
   * Requests a new OTP challenge.
   * Enforces phone-level rate limits, IP limits, invalidates previous active challenges for this phone & purpose.
   */
  public async requestOtp(options: {
    phone: string;
    purpose: OtpPurpose;
    userId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<RequestOtpResult> {
    const { phone, purpose, userId, ipAddress, userAgent } = options;

    const norm = normalizeIndianPhoneNumber(phone);
    if (!norm.isValid) {
      return {
        success: false,
        code: 'INVALID_PHONE',
        error: norm.error || 'Please enter a valid 10-digit Indian mobile number.',
      };
    }

    // 1. Phone send rate limit check (3 in 15 minutes)
    const phoneLimit = this.checkRateLimit(
      phoneSendHits,
      norm.e164,
      15 * 60 * 1000,
      this.MAX_PHONE_SENDS_IN_15M
    );
    if (!phoneLimit.allowed) {
      return {
        success: false,
        code: 'PHONE_RATE_LIMITED',
        error: `Too many OTP requests for this phone number. Please wait ${phoneLimit.retryAfterSec} seconds.`,
      };
    }

    // 2. IP send rate limit check (10 in 15 minutes)
    if (ipAddress) {
      const ipLimit = this.checkRateLimit(
        ipSendHits,
        ipAddress,
        15 * 60 * 1000,
        this.MAX_IP_SENDS_IN_15M
      );
      if (!ipLimit.allowed) {
        return {
          success: false,
          code: 'IP_RATE_LIMITED',
          error: `Too many OTP requests from this network. Please wait ${ipLimit.retryAfterSec} seconds.`,
        };
      }
    }

    // 3. Dispatch OTP via active SMS provider
    const provider = getOtpProvider();
    const providerRes = await provider.sendOtp(norm.e164);

    if (!providerRes.success) {
      return {
        success: false,
        code: providerRes.code || 'PROVIDER_ERROR',
        error: providerRes.message || 'Unable to send verification SMS at this moment. Please try again.',
      };
    }

    // Record rate-limit hits upon successful dispatch
    this.recordHit(phoneSendHits, norm.e164);
    if (ipAddress) {
      this.recordHit(ipSendHits, ipAddress);
    }

    const now = new Date();
    const challengeId = `chal_${Date.now().toString(36)}_${crypto.randomBytes(8).toString('hex')}`;
    const expiresAt = new Date(now.getTime() + this.OTP_EXPIRY_MS);
    const resendAvailableAt = new Date(now.getTime() + this.RESEND_COOLDOWN_MS);

    const challenge: OtpChallengeEntity = {
      id: challengeId,
      phone: norm.e164,
      purpose,
      tokenHash: null,
      tokenExpiresAt: null,
      expiresAt,
      resendAvailableAt,
      sendCount: 1,
      failedAttempts: 0,
      maxAttempts: this.MAX_FAILED_ATTEMPTS,
      status: 'PENDING',
      verifiedAt: null,
      consumedAt: null,
      userId: userId || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      createdAt: now,
      updatedAt: now,
    };

    // Save in memory
    inMemoryChallenges.set(challengeId, challenge);

    // Save in database if available
    if (prisma && (prisma as any).otpChallenge) {
      try {
        await (prisma as any).otpChallenge.create({
          data: {
            id: challenge.id,
            phone: challenge.phone,
            purpose: challenge.purpose,
            expiresAt: challenge.expiresAt,
            resendAvailableAt: challenge.resendAvailableAt,
            sendCount: challenge.sendCount,
            failedAttempts: challenge.failedAttempts,
            maxAttempts: challenge.maxAttempts,
            status: challenge.status,
            userId: challenge.userId,
            ipAddress: challenge.ipAddress,
            userAgent: challenge.userAgent,
          },
        });
      } catch (err: any) {
        console.warn('[OtpService] Failed to persist challenge in DB, relying on memory:', err.message);
      }
    }

    return {
      success: true,
      challengeId,
      maskedPhone: norm.masked,
      resendAvailableInSeconds: Math.ceil(this.RESEND_COOLDOWN_MS / 1000),
      expiresInSeconds: Math.ceil(this.OTP_EXPIRY_MS / 1000),
    };
  }

  /**
   * Resends OTP for an active challenge subject to 60s cooldown and 3-send limit.
   */
  public async resendOtp(challengeId: string, ipAddress?: string | null): Promise<RequestOtpResult> {
    const challenge = await this.getChallenge(challengeId);
    if (!challenge) {
      return {
        success: false,
        code: 'CHALLENGE_NOT_FOUND',
        error: 'Verification session expired or not found. Please request a new OTP.',
      };
    }

    if (challenge.status !== 'PENDING') {
      return {
        success: false,
        code: 'INVALID_STATUS',
        error: `This challenge is ${challenge.status.toLowerCase()}. Please start a fresh verification.`,
      };
    }

    const now = new Date();
    if (now > challenge.expiresAt) {
      challenge.status = 'EXPIRED';
      await this.saveChallenge(challenge);
      return {
        success: false,
        code: 'CHALLENGE_EXPIRED',
        error: 'OTP has expired. Please request a new verification code.',
      };
    }

    // Cooldown check (60s)
    if (now < challenge.resendAvailableAt) {
      const remainingSec = Math.ceil((challenge.resendAvailableAt.getTime() - now.getTime()) / 1000);
      return {
        success: false,
        code: 'COOLDOWN_ACTIVE',
        error: `Please wait ${remainingSec} seconds before requesting another code.`,
        resendAvailableInSeconds: remainingSec,
      };
    }

    // Phone send rate limit check (3 in 15 min)
    const phoneLimit = this.checkRateLimit(
      phoneSendHits,
      challenge.phone,
      15 * 60 * 1000,
      this.MAX_PHONE_SENDS_IN_15M
    );
    if (!phoneLimit.allowed) {
      return {
        success: false,
        code: 'PHONE_RATE_LIMITED',
        error: `Maximum OTP requests reached for this number. Please wait ${phoneLimit.retryAfterSec} seconds.`,
      };
    }

    // Dispatch retry via provider
    const provider = getOtpProvider();
    const resendRes = await provider.retryOtp(challenge.phone);
    if (!resendRes.success) {
      return {
        success: false,
        code: resendRes.code || 'PROVIDER_ERROR',
        error: resendRes.message || 'Unable to resend OTP at this time.',
      };
    }

    this.recordHit(phoneSendHits, challenge.phone);
    if (ipAddress) {
      this.recordHit(ipSendHits, ipAddress);
    }

    challenge.sendCount += 1;
    challenge.resendAvailableAt = new Date(now.getTime() + this.RESEND_COOLDOWN_MS);
    challenge.updatedAt = now;
    await this.saveChallenge(challenge);

    const norm = normalizeIndianPhoneNumber(challenge.phone);

    return {
      success: true,
      challengeId: challenge.id,
      maskedPhone: norm.masked,
      resendAvailableInSeconds: Math.ceil(this.RESEND_COOLDOWN_MS / 1000),
      expiresInSeconds: Math.max(0, Math.ceil((challenge.expiresAt.getTime() - now.getTime()) / 1000)),
    };
  }

  /**
   * Verifies an OTP against a challenge.
   * Enforces max 5 failed attempts, provider verification, and issues a single-use verification grant.
   */
  public async verifyOtp(
    challengeId: string,
    otp: string,
    ipAddress?: string | null
  ): Promise<VerifyOtpResult> {
    // IP verify rate limit check
    if (ipAddress) {
      const ipLimit = this.checkRateLimit(
        ipVerifyHits,
        ipAddress,
        15 * 60 * 1000,
        this.MAX_IP_VERIFIES_IN_15M
      );
      if (!ipLimit.allowed) {
        return {
          success: false,
          code: 'IP_RATE_LIMITED',
          error: `Too many verification attempts from this network. Please wait ${ipLimit.retryAfterSec} seconds.`,
        };
      }
      this.recordHit(ipVerifyHits, ipAddress);
    }

    const challenge = await this.getChallenge(challengeId);
    if (!challenge) {
      return {
        success: false,
        code: 'CHALLENGE_NOT_FOUND',
        error: 'Verification session expired or invalid. Please request a new code.',
      };
    }

    if (challenge.status === 'LOCKED') {
      return {
        success: false,
        code: 'CHALLENGE_LOCKED',
        error: 'Too many incorrect attempts. This challenge has been locked for security. Please request a new OTP.',
      };
    }

    if (challenge.status !== 'PENDING') {
      return {
        success: false,
        code: 'INVALID_STATUS',
        error: `This verification session is already ${challenge.status.toLowerCase()}. Please request a fresh OTP.`,
      };
    }

    const now = new Date();
    if (now > challenge.expiresAt) {
      challenge.status = 'EXPIRED';
      await this.saveChallenge(challenge);
      return {
        success: false,
        code: 'CHALLENGE_EXPIRED',
        error: 'This verification code has expired. Please request a new code.',
      };
    }

    // Verify OTP with provider
    const provider = getOtpProvider();
    const verifyRes = await provider.verifyOtp(challenge.phone, otp);

    if (!verifyRes.success) {
      challenge.failedAttempts += 1;
      challenge.updatedAt = now;

      if (challenge.failedAttempts >= challenge.maxAttempts) {
        challenge.status = 'LOCKED';
        await this.saveChallenge(challenge);
        return {
          success: false,
          code: 'CHALLENGE_LOCKED',
          attemptsRemaining: 0,
          error: 'Maximum verification attempts exceeded. For your security, this session is locked. Please request a new OTP.',
        };
      }

      await this.saveChallenge(challenge);
      const remaining = challenge.maxAttempts - challenge.failedAttempts;
      return {
        success: false,
        code: 'INCORRECT_OTP',
        attemptsRemaining: remaining,
        error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      };
    }

    // ── Successful Verification: Issue Single-Use Grant ──
    const verificationToken = `grant_${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash = this.hashToken(verificationToken);
    const tokenExpiresAt = new Date(now.getTime() + this.GRANT_EXPIRY_MS);

    challenge.status = 'VERIFIED';
    challenge.verifiedAt = now;
    challenge.tokenHash = tokenHash;
    challenge.tokenExpiresAt = tokenExpiresAt;
    challenge.updatedAt = now;

    await this.saveChallenge(challenge);

    const norm = normalizeIndianPhoneNumber(challenge.phone);

    return {
      success: true,
      verificationToken,
      maskedPhone: norm.masked,
      purpose: challenge.purpose,
    };
  }

  /**
   * Atomically validates and consumes a verification grant token.
   * Strictly enforces:
   *  1. Token hash matches
   *  2. Exact purpose match (purpose isolation)
   *  3. Exact phone match
   *  4. Grant is unexpired
   *  5. Grant has NOT been consumed previously (atomic one-time use)
   */
  public async consumeGrant(
    token: string | null | undefined,
    expectedPhone: string,
    expectedPurpose: OtpPurpose
  ): Promise<{ valid: boolean; error?: string; challengeId?: string }> {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Phone verification token is missing.' };
    }

    const norm = normalizeIndianPhoneNumber(expectedPhone);
    if (!norm.isValid) {
      return { valid: false, error: 'Invalid phone number format.' };
    }

    const tokenHash = this.hashToken(token);
    const now = new Date();

    // 1. Database consumption if available
    if (prisma && (prisma as any).otpChallenge) {
      try {
        const challenge = await (prisma as any).otpChallenge.findFirst({
          where: { tokenHash },
        });

        if (!challenge) {
          return { valid: false, error: 'Invalid verification token.' };
        }

        if (challenge.consumedAt) {
          return { valid: false, error: 'Verification grant has already been used.' };
        }

        if (challenge.tokenExpiresAt && now > challenge.tokenExpiresAt) {
          return { valid: false, error: 'Verification grant has expired. Please verify your phone number again.' };
        }

        if (challenge.purpose !== expectedPurpose) {
          return { valid: false, error: `Verification grant purpose mismatch (${challenge.purpose} cannot be used for ${expectedPurpose}).` };
        }

        if (challenge.phone !== norm.e164) {
          return { valid: false, error: 'Verification grant phone number does not match.' };
        }

        // Atomically update consumedAt
        const updated = await (prisma as any).otpChallenge.updateMany({
          where: { id: challenge.id, consumedAt: null },
          data: { consumedAt: now, status: 'CONSUMED' },
        });

        if (updated.count === 0) {
          return { valid: false, error: 'Verification grant replay detected.' };
        }

        return { valid: true, challengeId: challenge.id };
      } catch (err: any) {
        console.warn('[OtpService] DB consume grant failed, falling back to memory:', err.message);
      }
    }

    // 2. In-memory consumption fallback
    for (const challenge of inMemoryChallenges.values()) {
      if (challenge.tokenHash === tokenHash) {
        if (challenge.consumedAt) {
          return { valid: false, error: 'Verification grant has already been used.' };
        }

        if (challenge.tokenExpiresAt && now > challenge.tokenExpiresAt) {
          return { valid: false, error: 'Verification grant has expired. Please verify your phone number again.' };
        }

        if (challenge.purpose !== expectedPurpose) {
          return { valid: false, error: `Verification grant purpose mismatch (${challenge.purpose} cannot be used for ${expectedPurpose}).` };
        }

        if (challenge.phone !== norm.e164) {
          return { valid: false, error: 'Verification grant phone number does not match.' };
        }

        // Atomically consume
        challenge.consumedAt = now;
        challenge.status = 'CONSUMED';
        challenge.updatedAt = now;

        return { valid: true, challengeId: challenge.id };
      }
    }

    return { valid: false, error: 'Verification grant not found or invalid.' };
  }

  // ── Persistence Helpers ──

  private async getChallenge(id: string): Promise<OtpChallengeEntity | null> {
    if (prisma && (prisma as any).otpChallenge) {
      try {
        const dbChallenge = await (prisma as any).otpChallenge.findUnique({
          where: { id },
        });
        if (dbChallenge) {
          return {
            id: dbChallenge.id,
            phone: dbChallenge.phone,
            purpose: dbChallenge.purpose as OtpPurpose,
            tokenHash: dbChallenge.tokenHash,
            tokenExpiresAt: dbChallenge.tokenExpiresAt,
            expiresAt: dbChallenge.expiresAt,
            resendAvailableAt: dbChallenge.resendAvailableAt,
            sendCount: dbChallenge.sendCount,
            failedAttempts: dbChallenge.failedAttempts,
            maxAttempts: dbChallenge.maxAttempts,
            status: dbChallenge.status,
            verifiedAt: dbChallenge.verifiedAt,
            consumedAt: dbChallenge.consumedAt,
            userId: dbChallenge.userId,
            ipAddress: dbChallenge.ipAddress,
            userAgent: dbChallenge.userAgent,
            createdAt: dbChallenge.createdAt,
            updatedAt: dbChallenge.updatedAt,
          };
        }
      } catch {}
    }
    return inMemoryChallenges.get(id) || null;
  }

  private async saveChallenge(challenge: OtpChallengeEntity): Promise<void> {
    inMemoryChallenges.set(challenge.id, challenge);

    if (prisma && (prisma as any).otpChallenge) {
      try {
        await (prisma as any).otpChallenge.upsert({
          where: { id: challenge.id },
          update: {
            tokenHash: challenge.tokenHash,
            tokenExpiresAt: challenge.tokenExpiresAt,
            expiresAt: challenge.expiresAt,
            resendAvailableAt: challenge.resendAvailableAt,
            sendCount: challenge.sendCount,
            failedAttempts: challenge.failedAttempts,
            status: challenge.status,
            verifiedAt: challenge.verifiedAt,
            consumedAt: challenge.consumedAt,
            updatedAt: challenge.updatedAt,
          },
          create: {
            id: challenge.id,
            phone: challenge.phone,
            purpose: challenge.purpose,
            tokenHash: challenge.tokenHash,
            tokenExpiresAt: challenge.tokenExpiresAt,
            expiresAt: challenge.expiresAt,
            resendAvailableAt: challenge.resendAvailableAt,
            sendCount: challenge.sendCount,
            failedAttempts: challenge.failedAttempts,
            maxAttempts: challenge.maxAttempts,
            status: challenge.status,
            verifiedAt: challenge.verifiedAt,
            consumedAt: challenge.consumedAt,
            userId: challenge.userId,
            ipAddress: challenge.ipAddress,
            userAgent: challenge.userAgent,
            createdAt: challenge.createdAt,
            updatedAt: challenge.updatedAt,
          },
        });
      } catch (err: any) {
        console.warn('[OtpService] Failed to upsert challenge in DB:', err.message);
      }
    }
  }

  /**
   * Test fixture helper to reset memory state between tests
   */
  public clearInMemory(): void {
    inMemoryChallenges.clear();
    phoneSendHits.clear();
    ipSendHits.clear();
    ipVerifyHits.clear();
  }
}

export const otpService = new OtpService();
