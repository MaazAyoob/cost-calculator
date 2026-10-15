// ==============================================================================
// Hutty Consultation API Client
// Secure typed client communicating with backend /api/v1 endpoints
// ==============================================================================

import { getApiUrl } from '../config/api';
import {
  Consultant,
  ConsultationRequest,
  ConsultationPayment,
  BookingSubmissionPayload,
  RazorpayCheckoutOptions,
  CashfreeCheckoutOptions,
} from '../types/consultation';

export interface BookingResponse {
  request: ConsultationRequest;
  payment: ConsultationPayment;
  razorpayOptions: RazorpayCheckoutOptions;
  cashfreeOptions?: CashfreeCheckoutOptions;
}

export interface AdminConsultationsResponse {
  requests: ConsultationRequest[];
  stats: {
    total: number;
    paid: number;
    awaitingReview: number;
    assigned: number;
    scheduled: number;
    completed: number;
    cancelled: number;
  };
}

class ConsultationApiClient {
  private getHeaders(adminToken?: string | null): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }
    return headers;
  }

  // ── Public Endpoints ──

  public async getConsultants(params?: {
    category?: string;
    search?: string;
    city?: string;
  }): Promise<Consultant[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'ALL') query.set('category', params.category);
    if (params?.search && params.search.trim()) query.set('search', params.search.trim());
    if (params?.city && params.city !== 'ALL') query.set('city', params.city);

    const url = getApiUrl(`/api/v1/consultants${query.toString() ? `?${query.toString()}` : ''}`);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load consultants (${res.status})`);
    }
    const json = await res.json();
    return json.data || [];
  }

  public async getConsultantBySlug(slug: string): Promise<Consultant> {
    const url = getApiUrl(`/api/v1/consultants/${encodeURIComponent(slug)}`);
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Consultant profile not found or currently inactive');
      }
      throw new Error(`Failed to load consultant (${res.status})`);
    }
    const json = await res.json();
    return json.data;
  }

  // ── Homeowner Booking Endpoints ──

  public async createBooking(payload: BookingSubmissionPayload, userToken?: string | null): Promise<BookingResponse> {
    const url = getApiUrl('/api/v1/consultations');
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(userToken),
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to submit consultation booking request');
    }
    return json.data;
  }

  public async verifyPayment(
    requestId: string,
    paymentDetails: {
      gatewayOrderId: string;
      gatewayPaymentId: string;
      gatewaySignature?: string;
    },
    userToken?: string | null
  ): Promise<{
    request: ConsultationRequest;
    payment: ConsultationPayment;
    statusText: string;
    isPending?: boolean;
    paymentStatus?: string;
    message?: string;
  }> {
    const url = getApiUrl(`/api/v1/consultations/${encodeURIComponent(requestId)}/verify-payment`);
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(userToken),
      body: JSON.stringify(paymentDetails),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Payment verification failed');
    }
    return {
      request: json.data?.request,
      payment: json.data?.payment,
      statusText: json.data?.statusText || (json.isPending ? 'Payment Awaiting Confirmation' : 'Paid — Awaiting Admin Review'),
      isPending: Boolean(json.isPending),
      paymentStatus: json.data?.paymentStatus || (json.isPending ? 'PENDING' : 'PAID'),
      message: json.message,
    };
  }

  public async getMyConsultations(userEmail?: string, userToken?: string | null): Promise<ConsultationRequest[]> {
    const query = new URLSearchParams();
    if (userEmail) query.set('email', userEmail);

    const url = getApiUrl(`/api/v1/consultations/my${query.toString() ? `?${query.toString()}` : ''}`);
    const res = await fetch(url, {
      headers: this.getHeaders(userToken),
    });

    if (!res.ok) {
      throw new Error(`Failed to load consultation history (${res.status})`);
    }
    const json = await res.json();
    return json.data || [];
  }

  // ── Admin Endpoints (RBAC Protected) ──

  public async getAdminConsultants(token: string): Promise<Consultant[]> {
    const url = getApiUrl('/api/v1/admin/consultants');
    const res = await fetch(url, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) {
      throw new Error(`Failed to load admin consultants (${res.status})`);
    }
    const json = await res.json();
    return json.data || [];
  }

  public async createAdminConsultant(data: Partial<Consultant>, token: string): Promise<Consultant> {
    const url = getApiUrl('/api/v1/admin/consultants');
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to create consultant');
    }
    return json.data;
  }

  public async updateAdminConsultant(id: string, data: Partial<Consultant>, token: string): Promise<Consultant> {
    const url = getApiUrl(`/api/v1/admin/consultants/${encodeURIComponent(id)}`);
    const res = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to update consultant');
    }
    return json.data;
  }

  public async setAdminConsultantStatus(
    id: string,
    status: { active?: boolean; featured?: boolean },
    token: string
  ): Promise<Consultant> {
    const url = getApiUrl(`/api/v1/admin/consultants/${encodeURIComponent(id)}/status`);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify(status),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to update status');
    }
    return json.data;
  }

  public async getAdminConsultations(
    params: { status?: string; search?: string } | undefined,
    token: string
  ): Promise<AdminConsultationsResponse> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search && params.search.trim()) query.set('search', params.search.trim());

    const url = getApiUrl(`/api/v1/admin/consultations${query.toString() ? `?${query.toString()}` : ''}`);
    const res = await fetch(url, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) {
      throw new Error(`Failed to load requests (${res.status})`);
    }
    const json = await res.json();
    return {
      requests: json.data || [],
      stats: json.stats || {
        total: 0,
        paid: 0,
        awaitingReview: 0,
        assigned: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
      },
    };
  }

  public async getAdminConsultationById(id: string, token: string): Promise<ConsultationRequest> {
    const url = getApiUrl(`/api/v1/admin/consultations/${encodeURIComponent(id)}`);
    const res = await fetch(url, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) {
      throw new Error(`Failed to load request detail (${res.status})`);
    }
    const json = await res.json();
    return json.data;
  }

  public async assignConsultant(requestId: string, consultantId: string, token: string): Promise<ConsultationRequest> {
    const url = getApiUrl(`/api/v1/admin/consultations/${encodeURIComponent(requestId)}/assign`);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ consultantId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to assign consultant');
    }
    return json.data;
  }

  public async scheduleConsultation(
    requestId: string,
    confirmedDateTime: string,
    token: string
  ): Promise<ConsultationRequest> {
    const url = getApiUrl(`/api/v1/admin/consultations/${encodeURIComponent(requestId)}/schedule`);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ confirmedDateTime }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to confirm schedule');
    }
    return json.data;
  }

  public async updateRequestStatus(
    requestId: string,
    status: ConsultationRequest['status'],
    token: string
  ): Promise<ConsultationRequest> {
    const url = getApiUrl(`/api/v1/admin/consultations/${encodeURIComponent(requestId)}/status`);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to update request status');
    }
    return json.data;
  }

  public async addInternalNote(requestId: string, note: string, token: string): Promise<any> {
    const url = getApiUrl(`/api/v1/admin/consultations/${encodeURIComponent(requestId)}/notes`);
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ note }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to add internal note');
    }
    return json.data;
  }

  // ── Professional Registration & Admin Applications Queue ──

  public async submitProfessionalApplication(payload: any): Promise<any> {
    const url = getApiUrl('/api/v1/professionals/apply');
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to submit professional application');
    }
    return json.data;
  }

  public async getAdminProfessionalApplications(
    params?: { status?: string; category?: string; search?: string },
    token?: string
  ): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.category && params.category !== 'ALL') query.set('category', params.category);
    if (params?.search && params.search.trim()) query.set('search', params.search.trim());

    const url = getApiUrl(`/api/v1/admin/professionals/applications${query.toString() ? `?${query.toString()}` : ''}`);
    const res = await fetch(url, {
      headers: this.getHeaders(token),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to load professional applications');
    }
    return json.data || [];
  }

  public async getAdminProfessionalApplicationById(id: string, token?: string): Promise<any> {
    const url = getApiUrl(`/api/v1/admin/professionals/applications/${encodeURIComponent(id)}`);
    const res = await fetch(url, {
      headers: this.getHeaders(token),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to load professional application');
    }
    return json.data;
  }

  public async reviewAdminProfessionalApplication(
    id: string,
    review: {
      status: string;
      adminReviewNotes?: string;
      reviewerNotes?: string;
      rejectionReason?: string;
      reviewerEmail?: string;
    },
    token?: string
  ): Promise<any> {
    const url = getApiUrl(`/api/v1/admin/professionals/applications/${encodeURIComponent(id)}`);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify(review),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to review professional application');
    }
    return json.data;
  }
}

export const consultationApi = new ConsultationApiClient();
