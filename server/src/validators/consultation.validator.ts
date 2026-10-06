import { z } from 'zod';
import { CONSULTATION_CATEGORIES } from '../constants/consultation.constants';

export const createConsultantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2).max(100).optional(),
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  category: z.enum(CONSULTATION_CATEGORIES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid consultation category' }),
  }),
  profileImage: z.string().url('Invalid image URL').optional().nullable(),
  experienceYears: z.coerce.number().int().min(1, 'Experience must be at least 1 year').max(60),
  city: z.string().min(2).max(100).default('Bangalore'),
  serviceAreas: z.array(z.string()).default([]),
  about: z.string().min(10, 'About section must be at least 10 characters').max(2000),
  specializations: z.array(z.string()).default([]),
  services: z.array(z.string()).default([]),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().default(0),
});

export const updateConsultantSchema = createConsultantSchema.partial();

export const createBookingRequestSchema = z.object({
  consultantId: z.string().min(1, 'Consultant ID is required'),
  homeownerName: z.string().min(2, 'Full name is required').max(100),
  homeownerPhone: z.string().min(10, 'Valid 10-digit mobile number required').max(15),
  homeownerEmail: z.string().email('Valid email address required'),
  projectId: z.string().optional().nullable(),
  projectLocation: z.string().min(2, 'Project location / city is required').max(150),
  projectType: z.string().min(2, 'Project type is required').max(100),
  consultationTopic: z.string().min(2, 'Consultation topic is required').max(150),
  message: z.string().max(1500).optional().nullable(),
  preferredDate: z.string().min(8, 'Preferred date is required'),
  preferredTime: z.string().min(2, 'Preferred time slot is required'),
  idempotencyKey: z.string().max(100).optional().nullable(),
  // Explicitly capture any tampering attempt so it can be discarded by service
  amount: z.any().optional(),
  fee: z.any().optional(),
});

export const verifyPaymentSchema = z.object({
  gatewayOrderId: z.string().min(1, 'Gateway order ID required'),
  gatewayPaymentId: z.string().min(1, 'Gateway payment ID required'),
  gatewaySignature: z.string().optional(),
});

export const assignConsultantSchema = z.object({
  consultantId: z.string().min(1, 'Consultant ID is required'),
});

export const scheduleConsultationSchema = z.object({
  confirmedDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid ISO date/time string required',
  }),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    'AWAITING_REVIEW',
    'UNDER_REVIEW',
    'ASSIGNED',
    'ACCEPTED',
    'SCHEDULED',
    'RESCHEDULE_REQUESTED',
    'COMPLETED',
    'REJECTED',
    'CANCELLED',
  ]),
});

export const addNoteSchema = z.object({
  note: z.string().min(2, 'Internal note must be at least 2 characters').max(2000),
});

export const razorpayWebhookSchema = z.object({
  entity: z.string().optional(),
  account_id: z.string().optional(),
  event: z.string(),
  contains: z.array(z.string()).optional(),
  payload: z.object({
    payment: z
      .object({
        entity: z.object({
          id: z.string(),
          order_id: z.string(),
          amount: z.number().int(),
          currency: z.string(),
          status: z.string(),
        }),
      })
      .optional(),
    order: z
      .object({
        entity: z.object({
          id: z.string(),
          amount: z.number().int(),
          currency: z.string(),
          status: z.string(),
        }),
      })
      .optional(),
  }),
});

