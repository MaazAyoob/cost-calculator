// ==============================================================================
// Hutty Pricing Routes (Pricing Model V1)
// Decoupled pricing, checkout, entitlement queries, and admin controls.
// ==============================================================================

import { Router } from 'express';
import { PricingController } from '../controllers/pricing.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import { publicRateLimiter, bookingRateLimiter, paymentVerifyRateLimiter } from '../middlewares/rateLimiter.middleware';

// ── Public Pricing Router (Mounted at /api/v1/pricing) ──
export const pricingPublicRouter = Router();

// Get active pricing tiers for /pricing page and calculator modals
pricingPublicRouter.get('/tiers', publicRateLimiter, PricingController.getPublicTiers);

// Check access for a specific feature code
pricingPublicRouter.get('/check-access', publicRateLimiter, PricingController.checkAccess);

// Initiate purchase (server resolves price authoritatively from tierCode)
pricingPublicRouter.post(
  '/purchases',
  bookingRateLimiter,
  (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      return (authenticateToken as any)(req, res, next);
    }
    next();
  },
  PricingController.initiatePurchase
);

// Confirm purchase payment and activate entitlements
pricingPublicRouter.post('/purchases/confirm', paymentVerifyRateLimiter, PricingController.confirmPurchase);

// Query user/project entitlements
pricingPublicRouter.get('/my/entitlements', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return (authenticateToken as any)(req, res, next);
  }
  next();
}, PricingController.getMyEntitlements);

// ── Admin Pricing Router (Mounted at /api/v1/admin/pricing) ──
export const pricingAdminRouter = Router();

pricingAdminRouter.use(authenticateToken as any);
pricingAdminRouter.use(requireAdmin as any);

pricingAdminRouter.get('/tiers', PricingController.getAdminTiers as any);
pricingAdminRouter.put('/tiers/:id', PricingController.updateAdminTier as any);
pricingAdminRouter.get('/purchases', PricingController.getAdminPurchases as any);
pricingAdminRouter.get('/metrics', PricingController.getAdminMetrics as any);
pricingAdminRouter.get('/audit-logs', PricingController.getAdminAuditLogs as any);
