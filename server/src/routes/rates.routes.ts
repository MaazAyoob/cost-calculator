import { Router } from 'express';
import { getLatestRates } from '../controllers/rates.controller';

const router = Router();

// GET /api/v1/rates/latest?location=Bengaluru&packageTier=Standard
router.get('/latest', getLatestRates);
router.get('/', getLatestRates);

export default router;
