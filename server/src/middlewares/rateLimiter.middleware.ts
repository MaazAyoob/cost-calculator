import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipInTests?: boolean;
}) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    skipInTests = true,
  } = options;

  const hits = new Map<string, RateLimitRecord>();

  // Periodic cleanup to avoid memory leak
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        hits.delete(key);
      }
    }
  }, Math.max(windowMs, 60000));

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    if (skipInTests && (process.env.NODE_ENV === 'test' || process.env.VITEST)) {
      return next();
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    let record = hits.get(clientIp);

    if (!record) {
      record = { timestamps: [] };
      hits.set(clientIp, record);
    }

    // Filter to current window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const retryAfterSec = Math.ceil((oldest + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec.toString());
      return res.status(429).json({
        success: false,
        error: message,
        retryAfterSeconds: retryAfterSec,
      });
    }

    record.timestamps.push(now);
    next();
  };
}

// ── Specific Limiters for Consultation MVP ──

export const bookingRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 15,
  message: 'Too many booking attempts. Please wait a few minutes before trying again.',
});

export const paymentVerifyRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20,
  message: 'Too many payment verification attempts. Please contact support if your payment was deducted.',
});

export const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 120,
  message: 'Webhook rate limit exceeded.',
});

export const publicRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 150,
  message: 'Too many requests. Please slow down.',
});
