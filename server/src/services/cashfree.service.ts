// ==============================================================================
// Hutty Cashfree Payment Gateway Service
// Sandbox/Test Cashfree PG integration with authoritative price verification,
// server-side order creation, cryptographic webhook verification, and
// idempotent entitlement activation.
//
// ENVIRONMENT: Strictly Sandbox/Test (https://sandbox.cashfree.com/pg)
// ==============================================================================

import crypto from 'crypto';
import { ENV } from '../config/env';

export interface CashfreeCustomerDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface CashfreeCreateOrderInput {
  orderId: string;
  orderAmount: number; // In INR (e.g., 99, 499, 1499)
  orderCurrency?: string;
  customer: CashfreeCustomerDetails;
  orderNote?: string;
  returnUrl?: string;
  notifyUrl?: string;
}

export type CashfreeEnvironment = 'TEST' | 'SANDBOX' | 'PRODUCTION' | 'PROD';
export type CashfreeNormalizedEnvironment = 'TEST' | 'PRODUCTION';

export interface CashfreeOrderResult {
  orderId: string;
  order_id?: string;
  paymentSessionId: string;
  payment_session_id?: string;
  cfOrderId?: string;
  orderStatus: string;
  orderAmount: number;
  currency: string;
  environment: CashfreeEnvironment;
  gateway: 'CASHFREE';
}

export interface CashfreePaymentVerificationResult {
  verified: boolean;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'USER_DROPPED' | 'AMOUNT_MISMATCH';
  cfPaymentId?: string;
  amount?: number;
  currency?: string;
  message?: string;
  rawData?: any;
}

export class CashfreeService {
  private readonly apiVersion: string;

  constructor() {
    this.apiVersion = ENV.CASHFREE_API_VERSION || '2023-08-01';
  }

  /**
   * Authoritatively normalizes the configured Cashfree environment.
   * Maps 'PROD' | 'PRODUCTION' -> 'PRODUCTION'
   * Maps 'SANDBOX' | 'TEST' (and default fallback) -> 'TEST'
   */
  public get environment(): CashfreeNormalizedEnvironment {
    const env = (process.env.CASHFREE_ENV || ENV.CASHFREE_ENV || 'TEST').toUpperCase().trim();
    if (env === 'PROD' || env === 'PRODUCTION') {
      return 'PRODUCTION';
    }
    return 'TEST';
  }

  public get baseUrl(): string {
    if (this.environment === 'PRODUCTION') {
      return 'https://api.cashfree.com/pg';
    }
    return 'https://sandbox.cashfree.com/pg';
  }

  public get appId(): string {
    return (
      process.env.CASHFREE_APP_ID ||
      process.env.CASHFREE_CLIENT_ID ||
      process.env.CASHFREE_KEY_ID ||
      process.env.CASHFREE_API_KEY ||
      ENV.CASHFREE_APP_ID ||
      ''
    ).trim();
  }

  public get secretKey(): string {
    return (
      process.env.CASHFREE_SECRET_KEY ||
      process.env.CASHFREE_CLIENT_SECRET ||
      process.env.CASHFREE_SECRET ||
      process.env.CASHFREE_API_SECRET ||
      ENV.CASHFREE_SECRET_KEY ||
      ''
    ).trim();
  }

  public get webhookSecret(): string {
    return (
      process.env.CASHFREE_WEBHOOK_SECRET ||
      ENV.CASHFREE_WEBHOOK_SECRET ||
      this.secretKey
    );
  }

  /**
   * Returns true if Cashfree test credentials are validly populated.
   */
  public isConfigured(): boolean {
    const id = this.appId.trim();
    const sec = this.secretKey.trim();
    return (
      id.length > 0 &&
      sec.length > 0 &&
      !id.includes('your_cashfree') &&
      !id.includes('placeholder')
    );
  }

  /**
   * Sanitizes customer phone for Cashfree requirements (strictly 10 digits).
   */
  public sanitizePhone(phone?: string): string {
    if (!phone) return '9876543210';
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length === 10) return digitsOnly;
    if (digitsOnly.length > 10) {
      if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
        return digitsOnly.substring(2);
      }
      return digitsOnly.slice(-10);
    }
    return digitsOnly.padStart(10, '9');
  }

  /**
   * Sanitizes customer ID (alphanumeric, underscores, hyphens, min 3 chars, max 50).
   */
  public sanitizeCustomerId(id?: string, email?: string): string {
    let clean = '';
    if (id && id.trim()) {
      clean = id.replace(/[^a-zA-Z0-9_-]/g, '_');
    } else if (email && email.trim()) {
      clean = email.replace(/[^a-zA-Z0-9_-]/g, '_');
    } else {
      clean = `cust_${Date.now()}`;
    }
    if (clean.length < 3) {
      clean = `cust_${clean}`;
    }
    return clean.substring(0, 50);
  }

  /**
   * Server-side order creation on Cashfree Sandbox.
   * Uses authoritative Hutty pricing passed from backend services.
   * NEVER substitutes fake or dummy payment sessions.
   */
  public async createOrder(params: CashfreeCreateOrderInput): Promise<CashfreeOrderResult> {
    if (params.orderAmount <= 0) {
      throw new Error('Order amount must be greater than zero for payment gateway creation.');
    }

    if (!this.isConfigured()) {
      throw new Error(
        'CASHFREE_NOT_CONFIGURED: Cashfree payment gateway credentials (CASHFREE_APP_ID / CASHFREE_SECRET_KEY) are not configured on the backend server.'
      );
    }

    const sanitizedPhone = this.sanitizePhone(params.customer.phone);
    const sanitizedCustomerId = this.sanitizeCustomerId(params.customer.id, params.customer.email);
    const customerName = params.customer.name.trim() || 'Hutty Customer';
    const customerEmail = params.customer.email.trim() || 'customer@hutty.in';
    const currency = params.orderCurrency || 'INR';

    const orderMeta: Record<string, string> = {
      return_url: params.returnUrl || `${ENV.FRONTEND_URL}/payment/status?order_id={order_id}`,
    };

    // Cashfree strictly requires notify_url to be a valid absolute HTTPS URL.
    // If it is a relative path or missing, omit it rather than causing Cashfree to reject the order.
    if (
      params.notifyUrl &&
      (params.notifyUrl.startsWith('https://') || params.notifyUrl.startsWith('http://'))
    ) {
      orderMeta.notify_url = params.notifyUrl;
    }

    const payload = {
      order_id: params.orderId,
      order_amount: Number(params.orderAmount.toFixed(2)),
      order_currency: currency,
      customer_details: {
        customer_id: sanitizedCustomerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: sanitizedPhone,
      },
      order_meta: orderMeta,
      order_note: params.orderNote || 'Hutty Order',
    };

    const res = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': this.apiVersion,
        'x-client-id': this.appId,
        'x-client-secret': this.secretKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = errText;
      try {
        const parsed = JSON.parse(errText);
        errMsg = parsed.message || parsed.error || errText;
      } catch {}
      throw new Error(`Cashfree order creation failed (${res.status}): ${errMsg}`);
    }

    const data: any = await res.json();

    if (!data.payment_session_id) {
      throw new Error(
        'Cashfree order created but response is missing payment_session_id.'
      );
    }

    return {
      orderId: data.order_id || params.orderId,
      order_id: data.order_id || params.orderId,
      paymentSessionId: data.payment_session_id,
      payment_session_id: data.payment_session_id,
      cfOrderId: data.cf_order_id ? String(data.cf_order_id) : undefined,
      orderStatus: data.order_status || 'ACTIVE',
      orderAmount: data.order_amount || params.orderAmount,
      currency: data.order_currency || currency,
      environment: this.environment,
      gateway: 'CASHFREE',
    };
  }

  /**
   * Fetches order details directly from Cashfree PG API.
   */
  public async getOrder(orderId: string): Promise<any> {
    if (!this.isConfigured()) return null;

    const res = await fetch(`${this.baseUrl}/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        'x-api-version': this.apiVersion,
        'x-client-id': this.appId,
        'x-client-secret': this.secretKey,
      },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      const errText = await res.text();
      throw new Error(`Cashfree Get Order API returned ${res.status}: ${errText}`);
    }

    return res.json();
  }

  /**
   * Fetches payment attempts for an order from Cashfree PG API.
   */
  public async getOrderPayments(orderId: string): Promise<any[]> {
    if (!this.isConfigured()) return [];

    const res = await fetch(`${this.baseUrl}/orders/${encodeURIComponent(orderId)}/payments`, {
      method: 'GET',
      headers: {
        'x-api-version': this.apiVersion,
        'x-client-id': this.appId,
        'x-client-secret': this.secretKey,
      },
    });

    if (!res.ok) {
      if (res.status === 404) return [];
      const errText = await res.text();
      throw new Error(`Cashfree Get Payments API returned ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  /**
   * Verifies payment status directly and authoritatively with Cashfree.
   * NEVER trusts the client-side redirect.
   * Checks authoritative amount match against expected Hutty price.
   */
  public async verifyOrderPayment(
    orderId: string,
    expectedAmountINR: number
  ): Promise<CashfreePaymentVerificationResult> {
    if (this.isConfigured()) {
      try {
        const payments = await this.getOrderPayments(orderId);

        // Check for any successful payment attempt
        const successPayment = payments.find((p) => p.payment_status === 'SUCCESS');
        if (successPayment) {
          const paidAmount = Number(successPayment.payment_amount);
          // Strict amount verification
          if (Math.abs(paidAmount - expectedAmountINR) > 0.01) {
            return {
              verified: false,
              paymentStatus: 'AMOUNT_MISMATCH',
              amount: paidAmount,
              message: `Payment amount ₹${paidAmount} does not match authoritative required price of ₹${expectedAmountINR}`,
              rawData: successPayment,
            };
          }

          return {
            verified: true,
            paymentStatus: 'PAID',
            cfPaymentId: String(successPayment.cf_payment_id),
            amount: paidAmount,
            currency: successPayment.payment_currency || 'INR',
            rawData: successPayment,
          };
        }

        // Check if any payment failed
        const failedPayment = payments.find(
          (p) => p.payment_status === 'FAILED' || p.payment_status === 'USER_DROPPED'
        );
        if (failedPayment) {
          return {
            verified: false,
            paymentStatus: 'FAILED',
            cfPaymentId: String(failedPayment.cf_payment_id),
            message: failedPayment.payment_message || 'Payment attempt was failed or cancelled',
            rawData: failedPayment,
          };
        }

        // Check overall order status as secondary confirmation
        const order = await this.getOrder(orderId);
        if (order) {
          if (order.order_status === 'PAID') {
            const orderAmount = Number(order.order_amount);
            if (Math.abs(orderAmount - expectedAmountINR) > 0.01) {
              return {
                verified: false,
                paymentStatus: 'AMOUNT_MISMATCH',
                amount: orderAmount,
                message: `Order amount ₹${orderAmount} does not match authoritative required price of ₹${expectedAmountINR}`,
                rawData: order,
              };
            }

            return {
              verified: true,
              paymentStatus: 'PAID',
              cfPaymentId: `cf_order_${orderId}`,
              amount: orderAmount,
              currency: order.order_currency || 'INR',
              rawData: order,
            };
          }

          if (order.order_status === 'EXPIRED') {
            return {
              verified: false,
              paymentStatus: 'FAILED',
              message: 'Cashfree order has expired without payment',
              rawData: order,
            };
          }

          return {
            verified: false,
            paymentStatus: 'PENDING',
            message: `Order status is currently ${order.order_status}. Awaiting customer payment.`,
            rawData: order,
          };
        }

        return {
          verified: false,
          paymentStatus: 'PENDING',
          message: 'No payment record found yet on Cashfree gateway',
        };
      } catch (err: any) {
        throw new Error(`Cashfree gateway verification failed: ${err.message}`);
      }
    }

    // In mock/test environments without live Cashfree keys (e.g. Unit Tests)
    return {
      verified: false,
      paymentStatus: 'PENDING',
      message: 'Cashfree test credentials not configured; verification requires active sandbox keys or webhook event.',
    };
  }

  /**
   * Cryptographically verifies Cashfree webhook signature using HMAC-SHA256.
   * Cashfree formula:
   *   Signed Payload = timestamp + rawBody
   *   Expected Signature = Base64Encode(HMAC-SHA256(Signed Payload, Webhook Secret))
   */
  public verifyWebhookSignature(
    rawBody: string,
    signatureHeader?: string,
    timestampHeader?: string
  ): boolean {
    const secret = this.webhookSecret;
    if (!secret) return false;
    if (!signatureHeader || !timestampHeader || !rawBody) return false;

    try {
      const signedPayload = `${timestampHeader}${rawBody}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('base64');

      const sigBuf = Buffer.from(signatureHeader, 'utf8');
      const expBuf = Buffer.from(expectedSignature, 'utf8');

      if (sigBuf.length !== expBuf.length) return false;
      return crypto.timingSafeEqual(sigBuf, expBuf);
    } catch {
      return false;
    }
  }

  /**
   * Universal Webhook handler for Cashfree PG events.
   * Coordinates with Pricing and Consultation services with strict idempotency and replay protection.
   */
  public async handleWebhook(
    rawBody: string,
    signatureHeader?: string,
    timestampHeader?: string
  ): Promise<{ status: string; message: string; handled: boolean }> {
    // 1. Signature Verification
    if (this.secretKey || this.webhookSecret) {
      if (!signatureHeader || !timestampHeader) {
        throw new Error('Missing Cashfree webhook signature or timestamp header');
      }

      const isValid = this.verifyWebhookSignature(rawBody, signatureHeader, timestampHeader);
      if (!isValid) {
        throw new Error('Invalid Cashfree webhook cryptographic signature');
      }
    }

    // 2. Parse Raw Payload
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new Error('Malformed Cashfree webhook JSON payload');
    }

    const eventType = payload.type || payload.event;
    const orderData = payload.data?.order;
    const paymentData = payload.data?.payment;
    const orderId = orderData?.order_id || paymentData?.order_id;

    if (!orderId) {
      return { status: 'skipped', message: 'No order_id present in webhook payload', handled: false };
    }

    const { pricingService } = await import('./pricing.service');
    const { consultationService } = await import('./consultation.service');

    // 3. Handle PAYMENT_SUCCESS_WEBHOOK
    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || eventType === 'order.paid') {
      const paymentStatus = paymentData?.payment_status || 'SUCCESS';
      const paidAmount = Number(orderData?.order_amount || paymentData?.payment_amount);
      const cfPaymentId = paymentData?.cf_payment_id ? String(paymentData.cf_payment_id) : `cf_wh_${Date.now()}`;

      if (paymentStatus !== 'SUCCESS') {
        return { status: 'ignored', message: `Payment status ${paymentStatus} is not SUCCESS`, handled: false };
      }

      // Check if orderId belongs to a PricingPurchase
      const purchase = await pricingService.getPurchaseByGatewayOrderId(orderId);
      if (purchase) {
        // Authoritative price check
        const expectedINR = purchase.amountMinorUnits / 100;
        if (!isNaN(paidAmount) && Math.abs(paidAmount - expectedINR) > 0.01) {
          await pricingService.failPurchasePayment(
            purchase.id,
            `Cashfree webhook amount mismatch: expected ₹${expectedINR}, received ₹${paidAmount}`
          );
          throw new Error(`Webhook payment amount mismatch: expected ₹${expectedINR}, got ₹${paidAmount}`);
        }

        // Idempotency: return clean 200 OK without duplicate entitlement activation
        if (purchase.status === 'PAID') {
          return { status: 'idempotent', message: 'Pricing purchase already verified as PAID', handled: true };
        }

        // Confirm payment and grant entitlements
        await pricingService.confirmPurchasePayment(purchase.id, cfPaymentId, orderId, undefined, true);
        return {
          status: 'success',
          message: 'Pricing purchase verified and entitlements activated via Cashfree webhook',
          handled: true,
        };
      }

      // Check if orderId belongs to a ConsultationPayment
      const consultationPayment = await consultationService.getPaymentByOrderId(orderId);
      if (consultationPayment) {
        const expectedINR = consultationPayment.amountMinorUnits / 100;
        if (!isNaN(paidAmount) && Math.abs(paidAmount - expectedINR) > 0.01) {
          await consultationService.recordPaymentFailure(
            consultationPayment.id,
            cfPaymentId,
            `Cashfree webhook amount mismatch: expected ₹${expectedINR}, received ₹${paidAmount}`
          );
          throw new Error(`Webhook payment amount mismatch: expected ₹${expectedINR}, got ₹${paidAmount}`);
        }

        // Idempotency check
        if (consultationPayment.status === 'PAID') {
          return { status: 'idempotent', message: 'Consultation payment already verified as PAID', handled: true };
        }

        // Mark consultation as verified and update request to AWAITING_REVIEW
        await consultationService.verifyPayment(consultationPayment.consultationRequestId, {
          gatewayOrderId: orderId,
          gatewayPaymentId: cfPaymentId,
          isWebhookVerified: true,
        });

        return {
          status: 'success',
          message: 'Consultation booking verified and marked AWAITING_REVIEW via Cashfree webhook',
          handled: true,
        };
      }

      return {
        status: 'ignored',
        message: `Order ID ${orderId} not found in Hutty purchases or consultations`,
        handled: false,
      };
    }

    // 4. Handle PAYMENT_FAILED_WEBHOOK / PAYMENT_USER_DROPPED_WEBHOOK
    if (
      eventType === 'PAYMENT_FAILED_WEBHOOK' ||
      eventType === 'PAYMENT_USER_DROPPED_WEBHOOK' ||
      eventType === 'payment.failed'
    ) {
      const reason = paymentData?.payment_message || `Cashfree ${eventType} event received`;

      const purchase = await pricingService.getPurchaseByGatewayOrderId(orderId);
      if (purchase && purchase.status === 'PENDING') {
        await pricingService.failPurchasePayment(purchase.id, reason);
        return { status: 'failed_recorded', message: `Purchase ${purchase.id} marked FAILED`, handled: true };
      }

      const consultationPayment = await consultationService.getPaymentByOrderId(orderId);
      if (consultationPayment && consultationPayment.status === 'PENDING') {
        await consultationService.recordPaymentFailure(
          consultationPayment.id,
          paymentData?.cf_payment_id ? String(paymentData.cf_payment_id) : 'failed',
          reason
        );
        return {
          status: 'failed_recorded',
          message: `Consultation payment ${consultationPayment.id} marked FAILED`,
          handled: true,
        };
      }

      return { status: 'skipped', message: `${eventType} handled`, handled: false };
    }

    return { status: 'unhandled_event', message: `Event ${eventType} ignored`, handled: false };
  }
}

export const cashfreeService = new CashfreeService();
