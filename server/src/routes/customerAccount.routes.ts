// ==============================================================================
// Hutty Customer Account Routes
// /api/v1/account
// ==============================================================================

import { Router } from 'express';
import { CustomerAccountController } from '../controllers/customerAccount.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All customer account routes require authentication
router.use(authenticateToken as any);

router.get('/overview', CustomerAccountController.getOverview as any);
router.get('/purchases', CustomerAccountController.getPurchases as any);
router.get('/reports', CustomerAccountController.getReports as any);
router.get('/consultations', CustomerAccountController.getConsultations as any);

export default router;
