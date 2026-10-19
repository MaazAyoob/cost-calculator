import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import { getLeads, updateLeadStatus, exportLeads } from '../controllers/leads.controller';

const router = Router();

// Strict server-side Admin authentication & authorization guards
router.use(authenticateToken as any);
router.use(requireAdmin as any);

router.get('/', getLeads as any);
router.patch('/:leadKey/status', updateLeadStatus as any);
router.get('/export', exportLeads as any);

export default router;
