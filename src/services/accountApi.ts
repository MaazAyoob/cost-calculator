// ==============================================================================
// Hutty Customer Account API Client
// Provides methods to fetch account metrics, verified orders, unlocked reports,
// consultations, and password recovery.
// ==============================================================================

import { getApiUrl } from '../config/api';
import { useCustomerAuthStore } from '../store/useCustomerAuthStore';

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = useCustomerAuthStore.getState().token;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface AccountOverviewData {
  user: {
    id: string;
    email: string;
    name: string;
  };
  metrics: {
    projectsCount: number;
    reportsCount: number;
    ordersCount: number;
    consultationsCount: number;
  };
}

export interface CustomerOrder {
  id: string;
  reference: string;
  type: string;
  productName: string;
  amountINR: number;
  status: string;
  gateway: string;
  gatewayPaymentId?: string;
  date: string;
  projectName?: string;
  projectId?: string;
}

export interface CustomerReport {
  id: string;
  featureCode: string;
  reportTitle: string;
  tierCode: string;
  amountPaidINR: number;
  projectId: string;
  projectName: string;
  city: string;
  active: boolean;
  unlockedAt: string;
  downloadUrl: string;
}

export interface CustomerConsultation {
  id: string;
  publicReference: string;
  topic: string;
  status: string;
  preferredDate: string;
  preferredTime: string;
  confirmedDateTime?: string;
  amountINR: number;
  createdAt: string;
  consultant: {
    name: string;
    title: string;
    category?: string;
    profileImage?: string;
  };
  paymentStatus: string;
}

export async function fetchAccountOverview(): Promise<AccountOverviewData> {
  const res = await fetch(getApiUrl('/api/v1/account/overview'), {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to load account overview');
  }
  return json.data;
}

export async function fetchAccountPurchases(): Promise<CustomerOrder[]> {
  const res = await fetch(getApiUrl('/api/v1/account/purchases'), {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to load purchase history');
  }
  return json.data || [];
}

export async function fetchAccountReports(): Promise<CustomerReport[]> {
  const res = await fetch(getApiUrl('/api/v1/account/reports'), {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to load reports');
  }
  return json.data || [];
}

export async function fetchAccountConsultations(): Promise<CustomerConsultation[]> {
  const res = await fetch(getApiUrl('/api/v1/account/consultations'), {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to load consultations');
  }
  return json.data || [];
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
  const res = await fetch(getApiUrl('/api/v1/auth/forgot-password'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || json.message || 'Password reset request failed');
  }
  return json;
}

export async function completePasswordReset(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(getApiUrl('/api/v1/auth/reset-password'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || json.message || 'Password reset failed');
  }
  return json;
}
