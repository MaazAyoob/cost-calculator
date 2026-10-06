import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import downloadRoutes from './download.routes';
import adminRoutes from './admin.routes';
import ratesRoutes from './rates.routes';
import configRoutes from './config.routes';
import { catalogPublicRouter } from './catalog.routes';
import {
  consultationPublicRouter,
  consultationCustomerRouter,
  consultationAdminRouter,
} from './consultation.routes';
import {
  pricingPublicRouter,
  pricingAdminRouter,
} from './pricing.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/download', downloadRoutes);
router.use('/admin', adminRoutes);
router.use('/admin', consultationAdminRouter);
router.use('/admin/pricing', pricingAdminRouter);
router.use('/rates', ratesRoutes);
router.use('/config', configRoutes);
router.use('/catalog', catalogPublicRouter);
router.use('/', consultationPublicRouter);
router.use('/consultations', consultationCustomerRouter);
router.use('/pricing', pricingPublicRouter);

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    platform: 'Cost Calculator API Engine v1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
