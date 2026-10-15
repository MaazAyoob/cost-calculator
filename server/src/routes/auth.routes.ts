import { Router } from 'express';
import {
  login,
  register,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateToken as any, getMe as any);
router.put('/profile', authenticateToken as any, updateProfile as any);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
