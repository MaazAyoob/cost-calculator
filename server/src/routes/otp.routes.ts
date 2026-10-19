// ==============================================================================
// Hutty OTP Routes
// /api/v1/otp
// ==============================================================================

import { Router } from 'express';
import { sendOtp, resendOtp, verifyOtp } from '../controllers/otp.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Optional authentication middleware: if Authorization header is present, decode user
const optionalAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return (authenticateToken as any)(req, res, next);
  }
  next();
};

router.post('/send', optionalAuth, sendOtp as any);
router.post('/resend', optionalAuth, resendOtp as any);
router.post('/verify', optionalAuth, verifyOtp as any);

export default router;
