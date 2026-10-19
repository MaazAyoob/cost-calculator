// ==============================================================================
// Hutty MSG91 OTP Provider Integration
// Official v5 Server-Side OTP APIs: SendOTP, Verify OTP, Resend OTP
// Documentation: https://docs.msg91.com/otp
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

export class Msg91Provider implements IOtpProvider {
  private readonly baseUrl = 'https://control.msg91.com/api/v5/otp';
  private readonly requestTimeoutMs = 8000;

  /**
   * Evaluates if MSG91 required credentials and templates are configured in environment.
   */
  public isConfigured(): boolean {
    const authKey = ENV.MSG91_AUTH_KEY?.trim();
    const templateId = ENV.MSG91_TEMPLATE_ID?.trim();
    return Boolean(authKey && templateId && authKey !== 'placeholder_msg91_auth_key');
  }

  /**
   * Official MSG91 SendOTP API:
   * POST https://control.msg91.com/api/v5/otp
   * Header: authkey: <AUTH_KEY>, Content-Type: application/json
   * Body: { template_id: <TEMPLATE_ID>, mobile: "91XXXXXXXXXX", otp_expiry: <MINUTES> }
   */
  public async sendOtp(phone: string): Promise<OtpProviderResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        code: 'PROVIDER_NOT_CONFIGURED',
        message: 'MSG91 SMS provider is not configured. Real SMS OTP delivery is unavailable.',
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
      console.log(`[MSG91] Dispatching SendOTP request to ${norm.masked}`);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          authkey: ENV.MSG91_AUTH_KEY.trim(),
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          template_id: ENV.MSG91_TEMPLATE_ID.trim(),
          mobile: norm.providerFormat,
          otp_length: ENV.MSG91_OTP_LENGTH || 6,
          otp_expiry: ENV.MSG91_OTP_EXPIRY_MINUTES || 5,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = json?.message || `HTTP ${response.status} from MSG91`;
        console.warn(`[MSG91] SendOTP rejected for ${norm.masked}: ${errorMsg}`);
        return {
          success: false,
          code: 'UPSTREAM_REJECTED',
          message: errorMsg,
        };
      }

      // MSG91 v5 returns { type: "success" | "error", message: "..." }
      if (json?.type === 'success' || (response.status >= 200 && response.status < 300 && json?.type !== 'error')) {
        console.log(`[MSG91] SendOTP success for ${norm.masked}`);
        return {
          success: true,
          message: json?.message || 'OTP sent successfully',
          providerRef: json?.request_id || undefined,
        };
      }

      return {
        success: false,
        code: 'SEND_FAILED',
        message: json?.message || 'Failed to dispatch OTP via MSG91',
      };
    } catch (err: any) {
      clearTimeout(timeout);
      const isTimeout = err.name === 'AbortError';
      console.error(`[MSG91] Network error during SendOTP for ${norm.masked}:`, isTimeout ? 'Request timed out' : err.message);
      return {
        success: false,
        code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout ? 'SMS gateway timed out. Please try again.' : 'Unable to connect to SMS gateway.',
      };
    }
  }

  /**
   * Official MSG91 Verify OTP API:
   * GET https://control.msg91.com/api/v5/otp/verify?otp=123456&mobile=91XXXXXXXXXX
   * Header: authkey: <AUTH_KEY>, accept: application/json
   */
  public async verifyOtp(phone: string, otp: string): Promise<OtpProviderResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        code: 'PROVIDER_NOT_CONFIGURED',
        message: 'MSG91 SMS provider is not configured. Verification service is unavailable.',
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
      const url = new URL(`${this.baseUrl}/verify`);
      url.searchParams.set('otp', cleanOtp);
      url.searchParams.set('mobile', norm.providerFormat);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          authkey: ENV.MSG91_AUTH_KEY.trim(),
          accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = json?.message || `HTTP ${response.status} from MSG91`;
        console.warn(`[MSG91] Verify OTP rejected for ${norm.masked}: ${errorMsg}`);
        return {
          success: false,
          code: 'VERIFY_REJECTED',
          message: errorMsg,
        };
      }

      // Check MSG91 response type
      if (json?.type === 'success') {
        console.log(`[MSG91] OTP verified successfully for ${norm.masked}`);
        return {
          success: true,
          message: json?.message || 'OTP verified successfully',
        };
      }

      console.warn(`[MSG91] OTP match failed for ${norm.masked}: ${json?.message}`);
      return {
        success: false,
        code: 'OTP_MISMATCH',
        message: json?.message || 'The OTP entered is incorrect.',
      };
    } catch (err: any) {
      clearTimeout(timeout);
      const isTimeout = err.name === 'AbortError';
      console.error(`[MSG91] Error verifying OTP for ${norm.masked}:`, isTimeout ? 'Timed out' : err.message);
      return {
        success: false,
        code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout ? 'SMS gateway timed out during verification.' : 'Unable to connect to SMS gateway.',
      };
    }
  }

  /**
   * Official MSG91 Resend (Retry) OTP API:
   * GET https://control.msg91.com/api/v5/otp/retry?mobile=91XXXXXXXXXX&retrytype=text
   * Header: authkey: <AUTH_KEY>, accept: application/json
   */
  public async retryOtp(phone: string): Promise<OtpProviderResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        code: 'PROVIDER_NOT_CONFIGURED',
        message: 'MSG91 SMS provider is not configured. Resend service is unavailable.',
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
      console.log(`[MSG91] Retrying OTP for ${norm.masked} via text SMS`);
      const url = new URL(`${this.baseUrl}/retry`);
      url.searchParams.set('mobile', norm.providerFormat);
      url.searchParams.set('retrytype', 'text');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          authkey: ENV.MSG91_AUTH_KEY.trim(),
          accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = json?.message || `HTTP ${response.status} from MSG91`;
        console.warn(`[MSG91] Retry rejected for ${norm.masked}: ${errorMsg}`);
        return {
          success: false,
          code: 'RETRY_REJECTED',
          message: errorMsg,
        };
      }

      if (json?.type === 'success') {
        console.log(`[MSG91] OTP resent successfully for ${norm.masked}`);
        return {
          success: true,
          message: json?.message || 'OTP resent successfully',
        };
      }

      return {
        success: false,
        code: 'RETRY_FAILED',
        message: json?.message || 'Failed to resend OTP via MSG91',
      };
    } catch (err: any) {
      clearTimeout(timeout);
      const isTimeout = err.name === 'AbortError';
      console.error(`[MSG91] Error during retry OTP for ${norm.masked}:`, isTimeout ? 'Timed out' : err.message);
      return {
        success: false,
        code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout ? 'SMS gateway timed out during retry.' : 'Unable to connect to SMS gateway.',
      };
    }
  }
}

// ── Provider Singleton & Test Swapping ──
let activeProvider: IOtpProvider = new Msg91Provider();

export function getOtpProvider(): IOtpProvider {
  return activeProvider;
}

export function setOtpProvider(provider: IOtpProvider): void {
  activeProvider = provider;
}

export function resetOtpProvider(): void {
  activeProvider = new Msg91Provider();
}
