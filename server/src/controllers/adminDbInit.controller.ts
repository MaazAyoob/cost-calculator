// ============================================================
// ADMIN DATABASE INITIALIZATION CONTROLLER
// Secure, one-time HTTP trigger to initialize, seed, and verify
// the PostgreSQL database directly on Render without terminal access.
//
// SECURITY SPECIFICATION:
// - Strictly requires a dedicated temporary initialization secret (DB_INIT_SECRET).
// - DOES NOT reuse or accept JWT_SECRET.
// - Constant-time secure comparison using crypto.timingSafeEqual with SHA-256 digests.
// - Returns 403 for missing, empty, or invalid credentials.
// - Never logs raw secrets, credentials, or connection strings.
// ============================================================

import crypto from 'crypto';
import { Request, Response } from 'express';
import { runInitAndVerifyPipeline } from '../services/initDb.service';
import { pricingService } from '../services/pricing.service';
import { ENV } from '../config/env';

export function secureTimingSafeCompare(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  // Hash both strings with SHA-256 to ensure identical 32-byte buffers for timingSafeEqual,
  // completely preventing length-leak timing attacks.
  const providedHash = crypto.createHash('sha256').update(provided.trim()).digest();
  const expectedHash = crypto.createHash('sha256').update(expected.trim()).digest();
  return crypto.timingSafeEqual(providedHash, expectedHash);
}

export async function handleAdminDbInit(req: Request, res: Response) {
  const configuredSecret = ENV.DB_INIT_SECRET || process.env.DB_INIT_SECRET || '';

  // Security Gate 1: Server must have DB_INIT_SECRET configured in environment
  if (!configuredSecret || configuredSecret.trim().length === 0) {
    console.warn('[AdminDbInit] Initialization request rejected: DB_INIT_SECRET is not configured on this server.');
    return res.status(403).json({
      success: false,
      error: 'FORBIDDEN: Database initialization is disabled because DB_INIT_SECRET environment variable is not configured.',
    });
  }

  // Security Gate 2: Client must provide the secret via x-init-key or x-admin-key header
  const rawProvidedKey = req.headers['x-init-key'] || req.headers['x-admin-key'];
  const providedKey = typeof rawProvidedKey === 'string' ? rawProvidedKey : undefined;

  if (!providedKey || providedKey.trim().length === 0) {
    console.warn(`[AdminDbInit] Initialization request rejected: Missing secret header from IP: ${req.ip}`);
    return res.status(403).json({
      success: false,
      error: 'FORBIDDEN: Missing required database initialization key header (x-init-key).',
    });
  }

  // Security Gate 3: Constant-time comparison against configured DB_INIT_SECRET
  const isAuthorized = secureTimingSafeCompare(providedKey, configuredSecret);

  if (!isAuthorized) {
    console.warn(`[AdminDbInit] Initialization request rejected: Invalid key attempt from IP: ${req.ip}`);
    return res.status(403).json({
      success: false,
      error: 'FORBIDDEN: Invalid database initialization credentials.',
    });
  }

  console.log('[AdminDbInit] Authorized database initialization request received from IP:', req.ip);

  try {
    const result = await runInitAndVerifyPipeline();

    // Reconnect and sync PricingService in memory immediately
    await pricingService.reconnectDatabase();
    const persistenceStatus = pricingService.getPersistenceStatus();

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        alreadyInitialized: result.alreadyInitialized,
        tables: result.tableCounts,
        persistence: persistenceStatus,
        timestamp: result.timestamp,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.message,
        tables: result.tableCounts,
        persistence: persistenceStatus,
        timestamp: result.timestamp,
      });
    }
  } catch (err: any) {
    console.error('[AdminDbInit] Pipeline encountered an exception:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}
