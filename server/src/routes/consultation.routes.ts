import { Router } from 'express';
import {
  getActiveConsultants,
  getConsultantBySlug,
  getConsultationCategories,
  createBookingRequest,
  verifyPayment,
  getMyConsultations,
  getMyConsultationById,
  getAllConsultantsAdmin,
  createConsultant,
  updateConsultant,
  setConsultantStatus,
  getAdminConsultations,
  getAdminConsultationById,
  assignConsultant,
  scheduleConsultation,
  updateRequestStatus,
  addInternalNote,
} from '../controllers/consultation.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

import {
  bookingRateLimiter,
  paymentVerifyRateLimiter,
  webhookRateLimiter,
  publicRateLimiter,
} from '../middlewares/rateLimiter.middleware';
import { handleWebhook } from '../controllers/consultation.controller';

// ── Public Router ──
export const consultationPublicRouter = Router();
consultationPublicRouter.get('/consultants', publicRateLimiter, getActiveConsultants);
consultationPublicRouter.get('/consultants/categories', publicRateLimiter, getConsultationCategories);
consultationPublicRouter.get('/consultants/:slug', publicRateLimiter, getConsultantBySlug);

// ── Customer Booking & Payment Router (Mounted at /api/v1/consultations) ──
export const consultationCustomerRouter = Router();

// Webhook endpoint (Raw body verification)
consultationCustomerRouter.post('/webhook', webhookRateLimiter, handleWebhook as any);

// Booking creation with optional auth decoding and rate limiting
consultationCustomerRouter.post(
  '/',
  bookingRateLimiter,
  (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      return (authenticateToken as any)(req, res, next);
    }
    next();
  },
  createBookingRequest as any
);

consultationCustomerRouter.post('/:id/verify-payment', paymentVerifyRateLimiter, verifyPayment as any);

// Optional auth: if token present, populated via header, otherwise email query param checked
consultationCustomerRouter.get('/my', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return (authenticateToken as any)(req, res, next);
  }
  next();
}, getMyConsultations as any);

consultationCustomerRouter.get('/:id', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return (authenticateToken as any)(req, res, next);
  }
  next();
}, getMyConsultationById as any);

// ── Admin Router (Mounted at /api/v1/admin) ──
export const consultationAdminRouter = Router();
consultationAdminRouter.use(authenticateToken as any);
consultationAdminRouter.use(requireAdmin as any);

// Consultant Management
consultationAdminRouter.get('/consultants', getAllConsultantsAdmin as any);
consultationAdminRouter.post('/consultants', createConsultant as any);
consultationAdminRouter.put('/consultants/:id', updateConsultant as any);
consultationAdminRouter.patch('/consultants/:id/status', setConsultantStatus as any);

// Consultation Request Management
consultationAdminRouter.get('/consultations', getAdminConsultations as any);
consultationAdminRouter.get('/consultations/:id', getAdminConsultationById as any);
consultationAdminRouter.patch('/consultations/:id/assign', assignConsultant as any);
consultationAdminRouter.patch('/consultations/:id/schedule', scheduleConsultation as any);
consultationAdminRouter.patch('/consultations/:id/status', updateRequestStatus as any);
consultationAdminRouter.post('/consultations/:id/notes', addInternalNote as any);
