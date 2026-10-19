// ==============================================================================
// Hutty OTP Controller
// Safe Endpoints for Requesting, Resending, and Verifying SMS OTPs
// ==============================================================================

import { Request, Response } from 'express';
import { z } from 'zod';
import { otpService } from '../services/otp.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const requestOtpSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(16),
  purpose: z.enum(['SIGNUP', 'CONSULTATION_BOOKING'], {
    errorMap: () => ({ message: 'Invalid verification purpose. Must be SIGNUP or CONSULTATION_BOOKING.' }),
  }),
});

const resendOtpSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
});

const verifyOtpSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
  otp: z.string().min(4, 'OTP code is required').max(8),
});

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

export async function sendOtp(req: AuthenticatedRequest, res: Response): Promise<void> {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.issues[0]?.message || 'Validation failed',
      code: 'INVALID_INPUT',
    });
    return;
  }

  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'];
  const userId = req.user?.id || null;

  const result = await otpService.requestOtp({
    phone: parsed.data.phone,
    purpose: parsed.data.purpose,
    userId,
    ipAddress: clientIp,
    userAgent,
  });

  if (!result.success) {
    if (result.code === 'PROVIDER_NOT_CONFIGURED') {
      res.status(503).json({
        success: false,
        code: 'SERVICE_UNAVAILABLE',
        error: 'SMS verification service is temporarily unavailable. Please try again later or contact support.',
      });
      return;
    }

    if (result.code === 'PHONE_RATE_LIMITED' || result.code === 'IP_RATE_LIMITED') {
      res.status(429).json({
        success: false,
        code: result.code,
        error: result.error,
      });
      return;
    }

    res.status(400).json({
      success: false,
      code: result.code || 'REQUEST_FAILED',
      error: result.error,
    });
    return;
  }

  res.json({
    success: true,
    message: 'Verification code sent successfully',
    challengeId: result.challengeId,
    maskedPhone: result.maskedPhone,
    resendAvailableInSeconds: result.resendAvailableInSeconds,
    expiresInSeconds: result.expiresInSeconds,
  });
}

export async function resendOtp(req: Request, res: Response): Promise<void> {
  const parsed = resendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.issues[0]?.message || 'Validation failed',
      code: 'INVALID_INPUT',
    });
    return;
  }

  const clientIp = getClientIp(req);
  const result = await otpService.resendOtp(parsed.data.challengeId, clientIp);

  if (!result.success) {
    if (result.code === 'COOLDOWN_ACTIVE' || result.code === 'PHONE_RATE_LIMITED' || result.code === 'IP_RATE_LIMITED') {
      res.status(429).json({
        success: false,
        code: result.code,
        error: result.error,
        resendAvailableInSeconds: result.resendAvailableInSeconds,
      });
      return;
    }

    if (result.code === 'PROVIDER_NOT_CONFIGURED') {
      res.status(503).json({
        success: false,
        code: 'SERVICE_UNAVAILABLE',
        error: 'SMS service is temporarily unavailable. Please try again later.',
      });
      return;
    }

    res.status(400).json({
      success: false,
      code: result.code || 'RESEND_FAILED',
      error: result.error,
    });
    return;
  }

  res.json({
    success: true,
    message: 'Verification code resent successfully',
    challengeId: result.challengeId,
    maskedPhone: result.maskedPhone,
    resendAvailableInSeconds: result.resendAvailableInSeconds,
    expiresInSeconds: result.expiresInSeconds,
  });
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.issues[0]?.message || 'Validation failed',
      code: 'INVALID_INPUT',
    });
    return;
  }

  const clientIp = getClientIp(req);
  const result = await otpService.verifyOtp(parsed.data.challengeId, parsed.data.otp, clientIp);

  if (!result.success) {
    if (result.code === 'CHALLENGE_LOCKED') {
      res.status(429).json({
        success: false,
        code: result.code,
        error: result.error,
        attemptsRemaining: 0,
      });
      return;
    }

    if (result.code === 'IP_RATE_LIMITED') {
      res.status(429).json({
        success: false,
        code: result.code,
        error: result.error,
      });
      return;
    }

    if (result.code === 'PROVIDER_NOT_CONFIGURED') {
      res.status(503).json({
        success: false,
        code: 'SERVICE_UNAVAILABLE',
        error: 'Verification service is temporarily unavailable. Please try again later.',
      });
      return;
    }

    res.status(400).json({
      success: false,
      code: result.code || 'VERIFICATION_FAILED',
      error: result.error,
      attemptsRemaining: result.attemptsRemaining,
    });
    return;
  }

  res.json({
    success: true,
    message: 'Phone number verified successfully',
    verificationToken: result.verificationToken,
    maskedPhone: result.maskedPhone,
    purpose: result.purpose,
  });
}
