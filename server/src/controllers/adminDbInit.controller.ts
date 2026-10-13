// ============================================================
// ADMIN DATABASE INITIALIZATION CONTROLLER
// Secure, one-time HTTP trigger to initialize, seed, and verify
// the PostgreSQL database directly on Render without terminal access.
//
// SECURITY:
// - Protected by x-admin-key header (matches JWT_SECRET) or Admin JWT.
// - Never logs raw secrets, credentials, or connection strings.
// ============================================================

import { Request, Response } from 'express';
import { runInitAndVerifyPipeline } from '../services/initDb.service';
import { pricingService } from '../services/pricing.service';
import { ENV } from '../config/env';

export async function handleAdminDbInit(req: Request, res: Response) {
  const adminKey = req.headers['x-admin-key'] as string | undefined;
  const user = (req as any).user;

  // Authorization check: Must provide x-admin-key matching JWT_SECRET OR be authenticated as ADMIN
  const isKeyAuthorized = Boolean(
    adminKey &&
    ENV.JWT_SECRET &&
    adminKey.trim() === ENV.JWT_SECRET.trim()
  );
  const isJwtAdmin = Boolean(user && user.role === 'ADMIN');

  if (!isKeyAuthorized && !isJwtAdmin) {
    return res.status(403).json({
      success: false,
      error: 'FORBIDDEN: Requires valid x-admin-key header (matching JWT_SECRET) or Admin authentication.',
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
