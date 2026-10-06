import { Request, Response } from 'express';
import { consultationService } from '../services/consultation.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import {
  createConsultantSchema,
  updateConsultantSchema,
  createBookingRequestSchema,
  verifyPaymentSchema,
  assignConsultantSchema,
  scheduleConsultationSchema,
  updateStatusSchema,
  addNoteSchema,
} from '../validators/consultation.validator';
import { CONSULTATION_CATEGORIES, CONSULTATION_PRICE_INR } from '../constants/consultation.constants';

// ═════════════════════════════════════════════════════════════════════════
// PUBLIC CONSULTATION CONTROLLERS
// ═════════════════════════════════════════════════════════════════════════

export async function getActiveConsultants(req: Request, res: Response): Promise<void> {
  try {
    const { category, search, city } = req.query as {
      category?: string;
      search?: string;
      city?: string;
    };

    const consultants = await consultationService.getActiveConsultants({ category, search, city });
    res.json({
      success: true,
      count: consultants.length,
      feeINR: CONSULTATION_PRICE_INR,
      data: consultants,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve consultants',
      message: err.message,
    });
  }
}

export async function getConsultantBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const consultant = await consultationService.getConsultantBySlug(slug);

    if (!consultant) {
      res.status(404).json({
        success: false,
        error: 'Consultant not found or currently unavailable',
      });
      return;
    }

    res.json({
      success: true,
      feeINR: CONSULTATION_PRICE_INR,
      data: consultant,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve consultant profile',
      message: err.message,
    });
  }
}

export async function getConsultationCategories(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    data: CONSULTATION_CATEGORIES,
    feeINR: CONSULTATION_PRICE_INR,
  });
}

// ═════════════════════════════════════════════════════════════════════════
// HOMEOWNER / BOOKING CONTROLLERS
// ═════════════════════════════════════════════════════════════════════════

export async function createBookingRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = createBookingRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const userContext = req.user ? { id: req.user.id, email: req.user.email } : undefined;
    const result = await consultationService.createBookingRequest(parsed.data, userContext);

    res.status(201).json({
      success: true,
      message: 'Consultation request initiated. Please complete payment to submit for review.',
      data: {
        request: result.request,
        payment: result.payment,
        razorpayOptions: result.razorpayOptions,
      },
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to create consultation request',
    });
  }
}

export async function verifyPayment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsed = verifyPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await consultationService.verifyPayment(id, parsed.data);

    res.json({
      success: true,
      message: 'Payment verified successfully. Your consultation request is now awaiting admin review.',
      data: {
        request: result.request,
        payment: result.payment,
        statusText: 'Paid — Awaiting Admin Review',
      },
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Payment verification failed',
    });
  }
}

export async function getMyConsultations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userEmail = (req.user?.email || (req.query.email as string) || '').toLowerCase();
    const userId = req.user?.id;

    if (!userId && !userEmail) {
      res.status(401).json({
        success: false,
        error: 'Authentication or email identification required to view consultation history',
      });
      return;
    }

    const requests = await consultationService.getUserConsultations({ id: userId, email: userEmail });
    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve your consultations',
      message: err.message,
    });
  }
}

export async function getMyConsultationById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userEmail = (req.user?.email || (req.query.email as string) || '').toLowerCase();
    const userId = req.user?.id;

    if (!userId && !userEmail) {
      res.status(401).json({
        success: false,
        error: 'Authentication or email identification required',
      });
      return;
    }

    const request = await consultationService.getUserConsultationById(id, { id: userId, email: userEmail });
    if (!request) {
      res.status(404).json({
        success: false,
        error: 'Consultation request not found',
      });
      return;
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (err: any) {
    res.status(403).json({
      success: false,
      error: err.message || 'Access denied to this consultation',
    });
  }
}

// ═════════════════════════════════════════════════════════════════════════
// ADMIN CONSULTATION CONTROLLERS (RBAC Protected)
// ═════════════════════════════════════════════════════════════════════════

export async function getAllConsultantsAdmin(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const consultants = await consultationService.getAllConsultantsAdmin();
    res.json({
      success: true,
      count: consultants.length,
      data: consultants,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve consultants',
      message: err.message,
    });
  }
}

export async function createConsultant(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = createConsultantSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const adminEmail = req.user?.email || 'admin@hutty.in';
    const consultant = await consultationService.createConsultant(parsed.data, adminEmail);

    res.status(201).json({
      success: true,
      message: `Consultant "${consultant.name}" created successfully`,
      data: consultant,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to create consultant',
    });
  }
}

export async function updateConsultant(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsed = updateConsultantSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const adminEmail = req.user?.email || 'admin@hutty.in';
    const updated = await consultationService.updateConsultant(id, parsed.data, adminEmail);

    res.json({
      success: true,
      message: `Consultant "${updated.name}" updated successfully`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update consultant',
    });
  }
}

export async function setConsultantStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { active, featured } = req.body;
    const adminEmail = req.user?.email || 'admin@hutty.in';

    const updated = await consultationService.setConsultantStatus(id, active, featured, adminEmail);
    res.json({
      success: true,
      message: `Status updated for "${updated.name}"`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update consultant status',
    });
  }
}

export async function getAdminConsultations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status, search } = req.query as { status?: string; search?: string };
    const { requests, stats } = await consultationService.getAdminConsultations({ status, search });

    res.json({
      success: true,
      count: requests.length,
      stats,
      data: requests,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve consultation requests',
      message: err.message,
    });
  }
}

export async function getAdminConsultationById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const request = await consultationService.getAdminConsultationById(id);

    if (!request) {
      res.status(404).json({
        success: false,
        error: 'Consultation request not found',
      });
      return;
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve consultation detail',
      message: err.message,
    });
  }
}

export async function assignConsultant(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsed = assignConsultantSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const adminEmail = req.user?.email || 'admin@hutty.in';
    const updated = await consultationService.assignConsultant(id, parsed.data.consultantId, adminEmail);

    res.json({
      success: true,
      message: `Consultant assigned successfully to request ${updated.publicReference}`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to assign consultant',
    });
  }
}

export async function scheduleConsultation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsed = scheduleConsultationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const adminEmail = req.user?.email || 'admin@hutty.in';
    const updated = await consultationService.scheduleConsultation(id, parsed.data.confirmedDateTime, adminEmail);

    res.json({
      success: true,
      message: `Appointment schedule confirmed for request ${updated.publicReference}`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to schedule appointment',
    });
  }
}

export async function updateRequestStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const adminEmail = req.user?.email || 'admin@hutty.in';
    const updated = await consultationService.updateRequestStatus(id, parsed.data.status as any, adminEmail);

    res.json({
      success: true,
      message: `Status transitioned to ${updated.status} for request ${updated.publicReference}`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update request status',
    });
  }
}

export async function addInternalNote(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsed = addNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const adminEmail = req.user?.email || 'admin@hutty.in';
    const event = await consultationService.addInternalNote(id, parsed.data.note, adminEmail);

    res.status(201).json({
      success: true,
      message: 'Internal note added to request timeline',
      data: event,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to add internal note',
    });
  }
}

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  try {
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const signature = req.headers['x-razorpay-signature'] as string | undefined;

    const result = await consultationService.handleRazorpayWebhook(rawBody, signature);
    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Webhook processing failed',
    });
  }
}

