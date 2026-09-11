import { Router } from 'express';
import {
  getRates,
  setOverride,
  removeOverride,
  resetAllOverrides,
  getAuditLogs,
  getCalculatorConfig,
  updateCalculatorConfig,
  recordAnalyticsEvent,
  getAnalyticsSummary,
  exportAnalytics,
} from '../controllers/admin.controller';
import {
  getPriceProviders,
  getPriceUpdates,
  runPriceUpdate,
  approveProposal,
  rejectProposal,
  bulkApproveProposals,
} from '../controllers/priceUpdate.controller';
import {
  getProfile,
  changePassword,
  changeEmail,
  revokeAllOtherSessions,
  getSecurityAuditLogs,
} from '../controllers/account.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Publicly readable rates / config for calculator initialization & failsafe fallback
router.get('/rates', getRates);
router.get('/rates/overrides', getRates); // Alias for frontend fetch
router.get('/config', getCalculatorConfig);

// Publicly recordable first-party calculator analytics events (failsafe non-blocking)
router.post('/analytics/event', recordAnalyticsEvent);

// ── ADMIN RBAC PROTECTED ENDPOINTS ──
router.use(authenticateToken as any);
router.use(requireAdmin as any);

// Rate Master & Overrides
router.put('/rates/:rateId', setOverride as any);
router.post('/rates/override', (req, res) => {
  // Translate POST /rates/override body to setOverride format
  const { rateId, overrideRate } = req.body;
  (req as any).params = { rateId: rateId || (req.params as any)?.rateId };
  if (req.body.rate === undefined && typeof overrideRate === 'number') {
    req.body.rate = overrideRate;
  }
  return setOverride(req as any, res);
});
router.delete('/rates/:rateId', removeOverride as any);
router.delete('/rates/override/:rateId', removeOverride as any);
router.post('/rates/reset-all', resetAllOverrides as any);
router.get('/audit-logs', getAuditLogs as any);
router.get('/audit', getAuditLogs as any); // Alias for frontend
router.put('/config', updateCalculatorConfig as any);

// Auto Price Update Endpoints
router.get('/price-updates/providers', getPriceProviders as any);
router.get('/price-updates', getPriceUpdates as any);
router.post('/price-updates/run', runPriceUpdate as any);
router.post('/price-updates/:id/approve', approveProposal as any);
router.post('/price-updates/:id/reject', rejectProposal as any);
router.post('/price-updates/bulk-approve', bulkApproveProposals as any);

// Analytics Endpoints
router.get('/analytics', getAnalyticsSummary as any);
router.get('/analytics/metrics', getAnalyticsSummary as any); // Alias for frontend
router.get('/analytics/export', exportAnalytics as any);

// Admin Account & Credential Management Endpoints
router.get('/account/profile', getProfile as any);
router.post('/account/password', changePassword as any);
router.post('/account/email', changeEmail as any);
router.post('/account/revoke-sessions', revokeAllOtherSessions as any);
router.get('/account/security-audit', getSecurityAuditLogs as any);

export default router;
