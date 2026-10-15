// ==============================================================================
// Hutty Customer Account Controller
// Provides customer-facing dashboard aggregations: project summaries,
// purchased reports recovery, verified order history, and consultations.
// ==============================================================================

import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { projectService } from '../services/project.service';
import { inMemoryCustomerUsers } from './auth.controller';

let prisma: PrismaClient | null = null;
try {
  prisma = new PrismaClient();
} catch (e) {
  // Graceful fallback
}

export class CustomerAccountController {
  /**
   * Retrieves high-level dashboard metrics for the authenticated customer.
   * GET /api/v1/account/overview
   */
  public static async getOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      if (!userId || !userEmail) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // 1. Projects
      const userProjects = await projectService.getUserProjects(userId);

      let purchasesCount = 0;
      let reportsCount = 0;
      let consultationsCount = 0;

      if (prisma) {
        try {
          const [purchases, entitlements, consultations] = await Promise.all([
            (prisma as any).pricingPurchase.count({
              where: {
                OR: [{ userId }, { leadEmail: userEmail }],
              },
            }),
            (prisma as any).userEntitlement.count({
              where: {
                OR: [{ userId }, { userEmail }],
                active: true,
              },
            }),
            (prisma as any).consultationRequest.count({
              where: {
                OR: [{ userId }, { homeownerEmail: userEmail }],
              },
            }),
          ]);

          purchasesCount = purchases;
          reportsCount = entitlements;
          consultationsCount = consultations;
        } catch (dbErr) {
          // Keep defaults if db queries fail
        }
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: userId,
            email: userEmail,
            name: req.user?.name || 'Homeowner',
          },
          metrics: {
            projectsCount: userProjects.length,
            reportsCount,
            ordersCount: purchasesCount,
            consultationsCount,
          },
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to load account overview' });
    }
  }

  /**
   * Retrieves all verified orders and payment history for the authenticated customer.
   * GET /api/v1/account/purchases
   */
  public static async getPurchases(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      if (!userId || !userEmail) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const orders: any[] = [];

      if (prisma) {
        try {
          // Pricing purchases (PDFs, BOQ reports)
          const purchases = await (prisma as any).pricingPurchase.findMany({
            where: {
              OR: [{ userId }, { leadEmail: userEmail }],
            },
            include: {
              project: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
          });

          for (const p of purchases) {
            orders.push({
              id: p.id,
              reference: p.publicReference || p.id,
              type: 'CALCULATOR_REPORT',
              productName: p.tierNameSnapshot || 'Construction Cost Report',
              amountINR: Math.round(p.amountMinorUnits / 100),
              status: p.status,
              gateway: p.gateway,
              gatewayPaymentId: p.gatewayPaymentId,
              date: p.createdAt?.toISOString?.() || String(p.createdAt),
              projectName: p.project?.name || 'Home Estimation Project',
              projectId: p.projectId,
            });
          }

          // Consultation payments
          const consultationRequests = await (prisma as any).consultationRequest.findMany({
            where: {
              OR: [{ userId }, { homeownerEmail: userEmail }],
            },
            include: {
              payments: true,
              consultant: { select: { name: true, title: true } },
            },
            orderBy: { createdAt: 'desc' },
          });

          for (const c of consultationRequests) {
            for (const pay of c.payments || []) {
              orders.push({
                id: pay.id,
                reference: c.publicReference || pay.gatewayOrderId || pay.id,
                type: 'CONSULTATION_SERVICE',
                productName: `Expert Consultation: ${c.consultationTopic || c.consultant?.name || 'Architectural Review'}`,
                amountINR: Math.round(pay.amountMinorUnits / 100),
                status: pay.status,
                gateway: pay.gateway,
                gatewayPaymentId: pay.gatewayPaymentId,
                date: pay.createdAt?.toISOString?.() || String(pay.createdAt),
                projectName: `${c.projectLocation} (${c.projectType})`,
                projectId: c.projectId,
              });
            }
          }
        } catch (dbErr) {
          console.warn('[CustomerAccountController] Purchases query fallback:', dbErr);
        }
      }

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to retrieve purchases' });
    }
  }

  /**
   * Retrieves all entitled and purchased reports for the authenticated customer.
   * GET /api/v1/account/reports
   */
  public static async getReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      if (!userId || !userEmail) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const reports: any[] = [];

      if (prisma) {
        try {
          const entitlements = await (prisma as any).userEntitlement.findMany({
            where: {
              OR: [{ userId }, { userEmail }],
              active: true,
            },
            include: {
              project: { select: { id: true, name: true, city: true } },
              sourcePurchase: true,
            },
            orderBy: { createdAt: 'desc' },
          });

          for (const ent of entitlements) {
            const isDetailed = ent.featureCode === 'FULL_PDF_REPORT' || ent.featureCode === 'DETAILED_BOQ_ACCESS';
            const reportTitle = isDetailed ? 'Detailed BOQ & Construction Dossier' : 'Hutty Verified Basic Estimate Report';
            const tierCode = isDetailed ? 'DETAILED_ESTIMATE_499' : 'ESTIMATE_99';
            const cost = isDetailed ? 499 : 99;

            reports.push({
              id: ent.id,
              featureCode: ent.featureCode,
              reportTitle,
              tierCode,
              amountPaidINR: cost,
              projectId: ent.projectId,
              projectName: ent.project?.name || 'Residential Project',
              city: ent.project?.city || 'Bangalore',
              active: ent.active,
              unlockedAt: ent.createdAt?.toISOString?.() || String(ent.createdAt),
              downloadUrl: `/api/v1/download/report-pdf?projectId=${ent.projectId}&tier=${tierCode}`,
            });
          }
        } catch (dbErr) {
          console.warn('[CustomerAccountController] Reports query fallback:', dbErr);
        }
      }

      res.status(200).json({
        success: true,
        data: reports,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to retrieve reports' });
    }
  }

  /**
   * Retrieves all consultation requests initiated by the authenticated customer.
   * GET /api/v1/account/consultations
   */
  public static async getConsultations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      if (!userId || !userEmail) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      let requests: any[] = [];

      if (prisma) {
        try {
          const found = await (prisma as any).consultationRequest.findMany({
            where: {
              OR: [{ userId }, { homeownerEmail: userEmail }],
            },
            include: {
              consultant: {
                select: { id: true, name: true, title: true, category: true, profileImage: true },
              },
              payments: true,
            },
            orderBy: { createdAt: 'desc' },
          });

          requests = found.map((c: any) => ({
            id: c.id,
            publicReference: c.publicReference,
            topic: c.consultationTopic,
            status: c.status,
            preferredDate: c.preferredDate,
            preferredTime: c.preferredTime,
            confirmedDateTime: c.confirmedDateTime,
            amountINR: Math.round(c.amountMinorUnits / 100),
            createdAt: c.createdAt?.toISOString?.() || String(c.createdAt),
            consultant: c.consultant
              ? {
                  name: c.consultant.name,
                  title: c.consultant.title,
                  category: c.consultant.category,
                  profileImage: c.consultant.profileImage,
                }
              : {
                  name: c.consultantNameSnapshot || 'Verified Hutty Specialist',
                  title: c.consultantTitleSnapshot || 'Construction Expert',
                },
            paymentStatus: c.payments?.[0]?.status || 'PENDING',
          }));
        } catch (dbErr) {
          console.warn('[CustomerAccountController] Consultations query fallback:', dbErr);
        }
      }

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to retrieve consultations' });
    }
  }
}
