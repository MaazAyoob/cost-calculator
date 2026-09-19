// ============================================================
// CONFIGURATION VERSIONING ROUTES
// Mounts public active configuration resolution and admin lifecycle endpoints
// ============================================================

import { Router } from 'express';
import {
  getActiveConfig,
  listVersions,
  getVersion,
  createDraft,
  updateDraft,
  validateVersion,
  submitReview,
  simulateVersion,
  publishVersion,
  archiveVersion,
  getVersionAudit,
  compareVersions,
  rollbackVersion,
} from '../controllers/configVersion.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// ── 1. PUBLIC RESOLUTION ENDPOINT ──
// Consumed by public calculator and client resolver
router.get('/active', getActiveConfig);

// ── 2. ADMIN LIFECYCLE RBAC PROTECTED ENDPOINTS ──
router.use(authenticateToken as any);
router.use(requireAdmin as any);

// Version catalog & draft operations
router.get('/versions', listVersions as any);
router.post('/versions', createDraft as any);
router.get('/versions/:id', getVersion as any);
router.put('/versions/:id', updateDraft as any);

// Lifecycle transition endpoints
router.post('/versions/:id/validate', validateVersion as any);
router.post('/versions/:id/simulate', simulateVersion as any);
router.post('/versions/:id/submit-review', submitReview as any);
router.post('/versions/:id/publish', publishVersion as any);
router.post('/versions/:id/archive', archiveVersion as any);

// Audit, comparison & rollback
router.get('/versions/:id/audit', getVersionAudit as any);
router.get('/compare/:a/:b', compareVersions as any);
router.post('/rollback/:id', rollbackVersion as any);

export default router;
