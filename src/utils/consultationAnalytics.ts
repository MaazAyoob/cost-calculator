// ============================================================
// HUTTY CONSULTATION FUNNEL ANALYTICS TELEMETRY
// Failsafe non-blocking tracking for the consultation discovery,
// booking, payment, fallback enquiry, and professional application funnel.
// Strictly prevents leakage of PII, secrets, or private documents.
// ============================================================

import { getApiUrl } from '../config/api';

export type ConsultationFunnelEvent =
  | 'consultation_page_viewed'
  | 'consultation_category_clicked'
  | 'consultation_service_clicked'
  | 'consultation_listing_viewed'
  | 'consultation_profile_viewed'
  | 'consultation_booking_started'
  | 'consultation_slot_selected'
  | 'consultation_checkout_started'
  | 'consultation_payment_succeeded'
  | 'consultation_payment_failed'
  | 'consultation_booking_confirmed'
  | 'consultation_fallback_submitted'
  | 'consultation_pro_application_started'
  | 'consultation_pro_application_submitted'
  | 'consultation_pro_application_reviewed';

export interface ConsultationAnalyticsPayload {
  eventName: ConsultationFunnelEvent;
  category?: string;
  serviceId?: string;
  consultantId?: string;
  consultantCategory?: string;
  slotPreference?: string;
  amount?: number;
  referenceId?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

class ConsultationAnalytics {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    try {
      let id = sessionStorage.getItem('hutty_consult_session_id');
      if (!id) {
        id = `consult_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('hutty_consult_session_id', id);
      }
      return id;
    } catch {
      return `consult_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
  }

  public track(payload: ConsultationAnalyticsPayload) {
    try {
      // 1. Hook into Clarity if available
      if (typeof window !== 'undefined' && typeof (window as any).clarity === 'function') {
        try {
          (window as any).clarity('event', payload.eventName);
          if (payload.category) (window as any).clarity('set', 'consultCategory', payload.category);
          if (payload.serviceId) (window as any).clarity('set', 'consultService', payload.serviceId);
        } catch {
          // Non-blocking
        }
      }

      // 2. Post to first-party server analytics endpoint asynchronously
      const body = {
        sessionId: this.sessionId,
        eventName: payload.eventName,
        metadata: {
          category: payload.category,
          serviceId: payload.serviceId,
          consultantId: payload.consultantId,
          consultantCategory: payload.consultantCategory,
          slotPreference: payload.slotPreference,
          amount: payload.amount,
          referenceId: payload.referenceId,
          status: payload.status,
          ...payload.metadata,
        },
      };

      const eventEndpoint = getApiUrl('/api/v1/admin/analytics/event');
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
        navigator.sendBeacon(eventEndpoint, blob);
      } else if (typeof fetch !== 'undefined') {
        fetch(eventEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          keepalive: true,
        }).catch(() => {
          // Silently absorb network error
        });
      }
    } catch {
      // Failsafe: never throw to user or interrupt booking/navigation flow
    }
  }
}

export const consultationAnalytics = new ConsultationAnalytics();
