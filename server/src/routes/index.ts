import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import downloadRoutes from './download.routes';
import adminRoutes from './admin.routes';
import ratesRoutes from './rates.routes';
import configRoutes from './config.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/download', downloadRoutes);
router.use('/admin', adminRoutes);
router.use('/rates', ratesRoutes);
router.use('/config', configRoutes);


// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    platform: 'Cost Calculator API Engine v1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
