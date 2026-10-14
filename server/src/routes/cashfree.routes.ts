// ==============================================================================
// Hutty Cashfree Routes (Sandbox/Test Environment)
// Provides Cashfree order creation, payment status verification, and
// signed webhook endpoints.
// ==============================================================================

import { Router } from 'express';
import { CashfreeController } from '../controllers/cashfree.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
  bookingRateLimiter,
  paymentVerifyRateLimiter,
  webhookRateLimiter,
  publicRateLimiter,
} from '../middlewares/rateLimiter.middleware';

export const cashfreeRouter = Router();

// 1. Signed Webhook Endpoint (Mounted at /api/v1/cashfree/webhook)
cashfreeRouter.post('/webhook', webhookRateLimiter, CashfreeController.handleWebhook);

// 2. Server-side Order Initiation with authoritative price
cashfreeRouter.post(
  '/orders',
  bookingRateLimiter,
  (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      return (authenticateToken as any)(req, res, next);
    }
    next();
  },
  CashfreeController.initiatePurchaseOrder
);

// 3. Authoritative Payment Verification
cashfreeRouter.post('/verify', paymentVerifyRateLimiter, CashfreeController.verifyPayment);

// 4. Query Order Status from Cashfree
cashfreeRouter.get('/status/:orderId', publicRateLimiter, CashfreeController.getOrderStatus);

export default cashfreeRouter;
