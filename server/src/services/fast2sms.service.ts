// ==============================================================================
// Hutty Fast2SMS OTP Provider Integration
// Official Server-Side Smart OTP APIs: SendOTP, Verify OTP, Resend OTP
// Documentation: https://www.fast2sms.com/dev/otp
// ==============================================================================

import { ENV } from '../config/env';
import { normalizeIndianPhoneNumber } from '../utils/phone';

export interface OtpProviderResponse {
  success: boolean;
  message?: string;
  providerRef?: string;
  code?: string;
}

export interface IOtpProvider {
  isConfigured(): boolean;
  sendOtp(phone: string): Promise<OtpProviderResponse>;
  verifyOtp(phone: string, otp: string): Promise<OtpProviderResponse>;
  retryOtp(phone: string): Promise<OtpProviderResponse>;
}

export class Fast2SmsProvider implements IOtpProvider {
  private readonly baseUrl = 'https://www.fast2sms.com/dev/otp';
  private readonly requestTimeoutMs = 8000;

  /**
   * Evaluates if Fast2SMS required credentials and template IDs are configured in environment.
   */
  public isConfigured(): boolean {
    const apiKey = ENV.FAST2SMS_API_KEY?.trim();
    const otpId = ENV.FAST2SMS_OTP_ID?.trim();
    const isPlaceholder =
      !apiKey ||
      apiKey === 'placeholder_fast2sms_api_key' ||
      apiKey === 'your_fast2sms_api_key_here';
    return Boolean(apiKey && otpId && !isPlaceholder);
  }

  /**
   * Helper to format string or array messages from Fast2SMS responses safely.
   */
  private extractMessage(msg: any): string | undefined {
    if (typeof msg === 'string') {
      const trimmed = msg.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
    if (Array.isArray(msg) && msg.length > 0) {
      return msg.map((m) => String(m)).join(', ').trim();
    }
    return undefined;
  }

  /**
   * Official Fast2SMS Send OTP API:
   * POST https://www.fast2sms.com/dev/otp/send
   * Header: authorization: <FAST2SMS_API_KEY>, Content-Type: application/json
   * Body: { otp_id: <OTP_ID>, mobile: "9876543210", otp_length: 6, otp_expiry: 5 }
   */
  public async sendOtp(phone: string): Promise<OtpProviderResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        code: 'PROVIDER_NOT_CONFIGURED',
        message: 'Fast2SMS provider is not configured. Real SMS OTP delivery is unavailable.',
      };
    }

    const norm = normalizeIndianPhoneNumber(phone);
    if (!norm.isValid) {
      return {
        success: false,
        code: 'INVALID_PHONE',
        message: norm.error || 'Invalid Indian mobile number',
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      console.log(`[Fast2SMS] Dispatching SendOTP request to ${norm.masked}`);

      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          authorization: ENV.FAST2SMS_API_KEY.trim(),
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          otp_id: ENV.FAST2SMS_OTP_ID.trim(),
          mobile: norm.domestic,
          otp_length: ENV.FAST2SMS_OTP_LENGTH || 6,
          otp_expiry: ENV.FAST2SMS_OTP_EXPIRY_MINUTES || 5,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = this.extractMessage(json?.message) || `HTTP ${response.status} from Fast2SMS`;
        console.warn(`[Fast2SMS] SendOTP rejected for ${norm.masked}: ${errorMsg}`);
        return {
          success: false,
          code: 'UPSTREAM_REJECTED',
          message: errorMsg,
        };
      }

      // Fast2SMS returns { return: true, status_code: 200, request_id: "...", message: "..." }
      if (json?.return === true) {
        console.log(`[Fast2SMS] SendOTP success for ${norm.masked}`);
        return {
          success: true,
          message: this.extractMessage(json?.message) || 'OTP sent successfully',
          providerRef: typeof json?.request_id === 'string' ? json.request_id : undefined,
        };
      }

      return {
        success: false,
        code: 'SEND_FAILED',
        message: this.extractMessage(json?.message) || 'Failed to dispatch OTP via Fast2SMS',
      };
    } catch (err: any) {
      clearTimeout(timeout);
      const isTimeout = err.name === 'AbortError';
      console.error(
        `[Fast2SMS] Network error during SendOTP for ${norm.masked}:`,
        isTimeout ? 'Request timed out' : err.message
      );
      return {
        success: false,
        code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout
          ? 'SMS gateway timed out. Please try again.'
          : 'Unable to connect to SMS gateway.',
      };
    }
  }

  /**
   * Official Fast2SMS Verify OTP API:
   * POST https://www.fast2sms.com/dev/otp/verify
   * Header: authorization: <FAST2SMS_API_KEY>, Content-Type: application/json
   * Body: { mobile: "9876543210", otp: "123456" }
   */
  public async verifyOtp(phone: string, otp: string): Promise<OtpProviderResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        code: 'PROVIDER_NOT_CONFIGURED',
        message: 'Fast2SMS provider is not configured. Verification service is unavailable.',
      };
    }

    const norm = normalizeIndianPhoneNumber(phone);
    if (!norm.isValid) {
      return {
        success: false,
        code: 'INVALID_PHONE',
        message: norm.error || 'Invalid phone number',
      };
    }

    const cleanOtp = (otp || '').trim();
    if (!/^\d{4,8}$/.test(cleanOtp)) {
      return {
        success: false,
        code: 'INVALID_OTP_FORMAT',
        message: 'Invalid OTP format. Please enter a valid verification code.',
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      console.log(`[Fast2SMS] Verifying OTP for ${norm.masked}`);

      const response = await fetch(`${this.baseUrl}/verify`, {
        method: 'POST',
        headers: {
          authorization: ENV.FAST2SMS_API_KEY.trim(),
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          mobile: norm.domestic,
          otp: cleanOtp,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = this.extractMessage(json?.message) || `HTTP ${response.status} from Fast2SMS`;

        // If Fast2SMS returns 400 with invalid OTP error, treat as OTP_MISMATCH
        if (
          response.status === 400 ||
          json?.status_code === 400 ||
          /invalid|mismatch|incorrect|wrong/i.test(errorMsg)
        ) {
          console.warn(`[Fast2SMS] OTP match failed for ${norm.masked}: ${errorMsg}`);
          return {
            success: false,
            code: 'OTP_MISMATCH',
            message: errorMsg || 'The OTP entered is incorrect.',
          };
        }

        console.warn(`[Fast2SMS] Verify OTP rejected for ${norm.masked}: ${errorMsg}`);
        return {
          success: false,
          code: 'VERIFY_REJECTED',
          message: errorMsg,
        };
      }

      // Check Fast2SMS response status
      if (json?.return === true) {
        console.log(`[Fast2SMS] OTP verified successfully for ${norm.masked}`);
        return {
          success: true,
          message: this.extractMessage(json?.message) || 'OTP verified successfully',
        };
      }

      const failMsg = this.extractMessage(json?.message) || 'The OTP entered is incorrect.';
      console.warn(`[Fast2SMS] OTP match failed for ${norm.masked}: ${failMsg}`);
      return {
        success: false,
        code: 'OTP_MISMATCH',
        message: failMsg,
      };
    } catch (err: any) {
      clearTimeout(timeout);
      const isTimeout = err.name === 'AbortError';
      console.error(
        `[Fast2SMS] Error verifying OTP for ${norm.masked}:`,
        isTimeout ? 'Timed out' : err.message
      );
      return {
        success: false,
        code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout
          ? 'SMS gateway timed out during verification.'
          : 'Unable to connect to SMS gateway.',
      };
    }
  }

  /**
   * Official Fast2SMS Resend OTP API:
   * POST https://www.fast2sms.com/dev/otp/resend
   * Header: authorization: <FAST2SMS_API_KEY>, Content-Type: application/json
   * Body: { otp_id: <OTP_ID>, mobile: "9876543210" }
   */
  public async retryOtp(phone: string): Promise<OtpProviderResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        code: 'PROVIDER_NOT_CONFIGURED',
        message: 'Fast2SMS provider is not configured. Resend service is unavailable.',
      };
    }

    const norm = normalizeIndianPhoneNumber(phone);
    if (!norm.isValid) {
      return {
        success: false,
        code: 'INVALID_PHONE',
        message: norm.error || 'Invalid phone number',
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      console.log(`[Fast2SMS] Retrying OTP for ${norm.masked}`);

      const response = await fetch(`${this.baseUrl}/resend`, {
        method: 'POST',
        headers: {
          authorization: ENV.FAST2SMS_API_KEY.trim(),
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          otp_id: ENV.FAST2SMS_OTP_ID.trim(),
          mobile: norm.domestic,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = this.extractMessage(json?.message) || `HTTP ${response.status} from Fast2SMS`;
        console.warn(`[Fast2SMS] Retry rejected for ${norm.masked}: ${errorMsg}`);
        return {
          success: false,
          code: 'RETRY_REJECTED',
          message: errorMsg,
        };
      }

      if (json?.return === true) {
        console.log(`[Fast2SMS] OTP resent successfully for ${norm.masked}`);
        return {
          success: true,
          message: this.extractMessage(json?.message) || 'OTP resent successfully',
          providerRef: typeof json?.request_id === 'string' ? json.request_id : undefined,
        };
      }

      return {
        success: false,
        code: 'RETRY_FAILED',
        message: this.extractMessage(json?.message) || 'Failed to resend OTP via Fast2SMS',
      };
    } catch (err: any) {
      clearTimeout(timeout);
      const isTimeout = err.name === 'AbortError';
      console.error(
        `[Fast2SMS] Error during retry OTP for ${norm.masked}:`,
        isTimeout ? 'Timed out' : err.message
      );
      return {
        success: false,
        code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout
          ? 'SMS gateway timed out during retry.'
          : 'Unable to connect to SMS gateway.',
      };
    }
  }
}

// ── Provider Singleton & Test Swapping ──
let activeProvider: IOtpProvider = new Fast2SmsProvider();

export function getOtpProvider(): IOtpProvider {
  return activeProvider;
}

export function setOtpProvider(provider: IOtpProvider): void {
  activeProvider = provider;
}

export function resetOtpProvider(): void {
  activeProvider = new Fast2SmsProvider();
}
