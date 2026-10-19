// ==============================================================================
// Hutty Client OTP API Service
// Communicates with backend /api/v1/otp endpoints
// ==============================================================================

import { getApiUrl } from '../config/api';

export interface SendOtpResponse {
  success: boolean;
  message?: string;
  challengeId: string;
  maskedPhone: string;
  resendAvailableInSeconds: number;
  expiresInSeconds: number;
}

export interface ResendOtpResponse {
  success: boolean;
  message?: string;
  challengeId: string;
  maskedPhone: string;
  resendAvailableInSeconds: number;
  expiresInSeconds: number;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  verificationToken: string;
  maskedPhone: string;
  purpose: string;
}

class OtpApiService {
  private getHeaders(token?: string | null): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  public async sendOtp(
    phone: string,
    purpose: 'SIGNUP' | 'CONSULTATION_BOOKING',
    token?: string | null
  ): Promise<SendOtpResponse> {
    const url = getApiUrl('/api/v1/otp/send');
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ phone, purpose }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      const errorMsg = json?.error || json?.message || 'Failed to send verification code.';
      const err = new Error(errorMsg) as any;
      err.code = json?.code;
      err.status = res.status;
      err.retryAfterSeconds = json?.retryAfterSeconds;
      throw err;
    }

    return json;
  }

  public async resendOtp(challengeId: string, token?: string | null): Promise<ResendOtpResponse> {
    const url = getApiUrl('/api/v1/otp/resend');
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ challengeId }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      const errorMsg = json?.error || json?.message || 'Failed to resend verification code.';
      const err = new Error(errorMsg) as any;
      err.code = json?.code;
      err.status = res.status;
      err.resendAvailableInSeconds = json?.resendAvailableInSeconds;
      throw err;
    }

    return json;
  }

  public async verifyOtp(challengeId: string, otp: string, token?: string | null): Promise<VerifyOtpResponse> {
    const url = getApiUrl('/api/v1/otp/verify');
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ challengeId, otp }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      const errorMsg = json?.error || json?.message || 'Verification failed. Please check your code.';
      const err = new Error(errorMsg) as any;
      err.code = json?.code;
      err.status = res.status;
      err.attemptsRemaining = json?.attemptsRemaining;
      throw err;
    }

    return json;
  }
}

export const otpApi = new OtpApiService();
