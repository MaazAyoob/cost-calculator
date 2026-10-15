// ==============================================================================
// Hutty Cashfree Controller
// Handles Cashfree Sandbox checkout, server-side order initiation,
// authoritative payment verification, and signed webhook processing.
// ==============================================================================

import { Request, Response } from 'express';
import { cashfreeService } from '../services/cashfree.service';
import { pricingService } from '../services/pricing.service';
import { consultationService } from '../services/consultation.service';

export class CashfreeController {
  /**
   * Universal Webhook handler for Cashfree PG.
   * Signature is verified with x-webhook-signature and x-webhook-timestamp.
   * Processing is fully idempotent.
   */
  public static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = (req.headers['x-webhook-signature'] ||
        req.headers['X-Webhook-Signature'] ||
        req.headers['x-cashfree-signature']) as string | undefined;

      const timestamp = (req.headers['x-webhook-timestamp'] ||
        req.headers['X-Webhook-Timestamp']) as string | undefined;

      const rawBody = (req as any).rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

      const result = await cashfreeService.handleWebhook(rawBody, signature, timestamp);
      res.status(200).json(result);
    } catch (err: any) {
      console.warn('[CashfreeController] Webhook verification error:', err.message);
      res.status(400).json({
        success: false,
        error: err.message || 'Webhook verification failed',
      });
    }
  }

  /**
   * Initiates a Cashfree sandbox purchase order with authoritative price.
   */
  public static async initiatePurchaseOrder(req: Request, res: Response): Promise<void> {
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
          message: 'Contact details (leadName, leadPhone, leadEmail) are required',
        });
        return;
      }

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
        gateway: 'CASHFREE',
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Authoritatively verifies a payment with Cashfree.
   * NEVER trusts client frontend redirect as proof of payment.
   */
  public static async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, purchaseId, consultationRequestId, cfPaymentId } = req.body;

      if (!orderId && !purchaseId && !consultationRequestId) {
        res.status(400).json({
          success: false,
          message: 'Either orderId, purchaseId, or consultationRequestId is required for verification',
        });
        return;
      }

      // Check Pricing Purchase
      const purchase = purchaseId
        ? await pricingService.getPurchaseById(purchaseId)
        : orderId
        ? await pricingService.getPurchaseByGatewayOrderId(orderId)
        : null;

      if (purchase) {
        const expectedINR = purchase.amountMinorUnits / 100;
        const targetOrderId = orderId || purchase.gatewayOrderId;

        if (!targetOrderId) {
          res.status(400).json({ success: false, message: 'No gateway order ID associated with purchase' });
          return;
        }

        // Check if already paid (idempotent)
        if (purchase.status === 'PAID') {
          const entitlements = await pricingService.getUserEntitlements(
            purchase.userId,
            purchase.leadEmail,
            purchase.projectId
          );
          res.json({
            success: true,
            status: 'PAID',
            message: 'Payment already verified',
            data: { purchase, entitlements },
          });
          return;
        }

        // Authoritatively verify with Cashfree
        const verification = await cashfreeService.verifyOrderPayment(targetOrderId, expectedINR);

        if (!verification.verified) {
          res.status(400).json({
            success: false,
            status: verification.paymentStatus,
            message: verification.message || 'Payment not yet verified with Cashfree',
          });
          return;
        }

        // Mark PAID and grant entitlements
        const confirmResult = await pricingService.confirmPurchasePayment(
          purchase.id,
          verification.cfPaymentId || cfPaymentId || `cf_pay_${Date.now()}`,
          targetOrderId
        );

        res.json({
          success: true,
          status: 'PAID',
          message: 'Payment verified and entitlements activated successfully',
          data: confirmResult,
        });
        return;
      }

      // Check Consultation Booking
      const requestId = consultationRequestId;
      const payment = orderId ? await consultationService.getPaymentByOrderId(orderId) : null;
      const targetReqId = requestId || (payment ? payment.consultationRequestId : null);

      if (targetReqId) {
        const request = await consultationService.getRequestById(targetReqId);
        if (!request) {
          res.status(404).json({ success: false, message: 'Consultation request not found' });
          return;
        }

        const targetOrderId = orderId || (payment ? payment.gatewayOrderId : '');
        const expectedINR = request.amountMinorUnits / 100;

        const verification = await cashfreeService.verifyOrderPayment(targetOrderId, expectedINR);

        if (verification.paymentStatus === 'PENDING') {
          res.json({
            success: true,
            isPending: true,
            status: 'PENDING',
            message: 'Payment is awaiting confirmation. Complete payment in Cashfree or check your payment status.',
            data: {
              request,
              payment,
              statusText: 'Payment Awaiting Confirmation',
            },
          });
          return;
        }

        if (!verification.verified) {
          res.status(400).json({
            success: false,
            status: verification.paymentStatus,
            message: verification.message || 'Payment not yet verified with Cashfree',
          });
          return;
        }

        const verified = await consultationService.verifyPayment(targetReqId, {
          gatewayOrderId: targetOrderId,
          gatewayPaymentId: verification.cfPaymentId || cfPaymentId || `cf_pay_${Date.now()}`,
        });

        res.json({
          success: true,
          status: 'PAID',
          message: 'Consultation payment verified and status transitioned to AWAITING_REVIEW',
          data: verified,
        });
        return;
      }

      res.status(404).json({
        success: false,
        message: 'Order record not found in Hutty database',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Queries order status directly from Cashfree PG.
   */
  public static async getOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      if (!orderId) {
        res.status(400).json({ success: false, message: 'orderId parameter is required' });
        return;
      }

      const order = await cashfreeService.getOrder(orderId);
      const payments = await cashfreeService.getOrderPayments(orderId);

      res.json({
        success: true,
        data: {
          order,
          payments,
          environment: 'TEST',
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
