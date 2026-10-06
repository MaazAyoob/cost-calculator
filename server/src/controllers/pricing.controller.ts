// ==============================================================================
// Hutty Pricing Controller (Pricing Model V1)
// Handles public tier queries, server-authoritative checkout, entitlement checks,
// and Admin pricing management.
// ==============================================================================

import { Request, Response } from 'express';
import { pricingService } from '../services/pricing.service';

export class PricingController {
  // ── Public Routes ──

  public static async getPublicTiers(_req: Request, res: Response): Promise<void> {
    try {
      const tiers = await pricingService.getPublicTiers();
      res.json({
        success: true,
        data: tiers,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async initiatePurchase(req: Request, res: Response): Promise<void> {
    try {
      const {
        tierCode,
        leadName,
        leadPhone,
        leadEmail,
        projectId,
        projectSnapshot,
        testBypassPayment,
      } = req.body;

      if (!tierCode) {
        res.status(400).json({ success: false, message: 'tierCode is required' });
        return;
      }
      if (!leadName || !leadPhone || !leadEmail) {
        res.status(400).json({
          success: false,
          message: 'Contact details (leadName, leadPhone, leadEmail) are required for purchase and entitlement delivery',
        });
        return;
      }

      // NOTE: We intentionally DO NOT read or trust any `amount` or `price` from req.body.
      // The service authoritatively looks up the price in minor units based on tierCode.
      const userId = (req as any).user?.id || null;

      const result = await pricingService.initiatePurchase({
        tierCode,
        leadName,
        leadPhone,
        leadEmail,
        userId,
        projectId,
        projectSnapshot,
        testBypassPayment: Boolean(testBypassPayment),
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async confirmPurchase(req: Request, res: Response): Promise<void> {
    try {
      const { purchaseId, gatewayPaymentId, gatewayOrderId } = req.body;

      if (!purchaseId) {
        res.status(400).json({ success: false, message: 'purchaseId is required' });
        return;
      }

      const paymentId = gatewayPaymentId || `pay_manual_${Date.now()}`;
      const result = await pricingService.confirmPurchasePayment(purchaseId, paymentId, gatewayOrderId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async getMyEntitlements(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || null;
      const userEmail = (req.query.email as string) || (req as any).user?.email || null;
      const projectId = (req.query.projectId as string) || null;

      const entitlements = await pricingService.getUserEntitlements(userId, userEmail, projectId);

      res.json({
        success: true,
        data: entitlements,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async checkAccess(req: Request, res: Response): Promise<void> {
    try {
      const featureCode = req.query.featureCode as string;
      if (!featureCode) {
        res.status(400).json({ success: false, message: 'featureCode query parameter is required' });
        return;
      }

      const userId = (req as any).user?.id || null;
      const userEmail = (req.query.email as string) || (req as any).user?.email || null;
      const projectId = (req.query.projectId as string) || null;

      const allowed = await pricingService.canAccessFeature(featureCode, userId, userEmail, projectId);

      res.json({
        success: true,
        featureCode,
        allowed,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ── Admin Routes ──

  public static async getAdminTiers(_req: Request, res: Response): Promise<void> {
    try {
      const tiers = await pricingService.getAllTiersAdmin();
      res.json({
        success: true,
        data: tiers,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateAdminTier(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        priceMinorUnits,
        active,
        purchasable,
        sortOrder,
        badge,
        features,
        reason,
      } = req.body;

      const actorEmail = (req as any).user?.email || 'admin@hutty.in';

      const updated = await pricingService.updateTier(
        id,
        {
          name,
          description,
          priceMinorUnits,
          active,
          purchasable,
          sortOrder,
          badge,
          features,
          reason,
        },
        actorEmail
      );

      res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async getAdminPurchases(_req: Request, res: Response): Promise<void> {
    try {
      const purchases = await pricingService.getPurchaseHistory();
      res.json({
        success: true,
        data: purchases,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getAdminMetrics(_req: Request, res: Response): Promise<void> {
    try {
      const metrics = await pricingService.getPricingMetrics();
      res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getAdminAuditLogs(_req: Request, res: Response): Promise<void> {
    try {
      const logs = await pricingService.getPricingAuditLogs();
      res.json({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
