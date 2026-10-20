// ==============================================================================
// Hutty Admin User Management API Client
// ==============================================================================

import { getApiUrl } from '../config/api';

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  phoneFormatted: string | null;
  phoneVerified: boolean;
  phoneVerifiedAt: string | null;
  role: string;
  disabled: boolean;
  disabledAt: string | null;
  disabledReason: string | null;
  createdAt: string;
  updatedAt: string;
  counts: {
    projects: number;
    consultations: number;
    purchases: number;
  };
}

export interface UserFilters {
  search?: string;
  status?: 'ALL' | 'ACTIVE' | 'DISABLED';
  sort?: 'newest' | 'oldest' | 'name';
  page?: number;
  limit?: number;
}

export interface UserManagementApiResponse {
  success: boolean;
  data: {
    users: AdminUserListItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    summary: {
      totalUsers: number;
      activeUsers: number;
      disabledUsers: number;
    };
  };
  error?: string;
}

export async function fetchAdminUsers(
  filters: UserFilters = {},
  token?: string | null
): Promise<UserManagementApiResponse['data']> {
  const query = new URLSearchParams();
  if (filters.search) query.set('search', filters.search);
  if (filters.status && filters.status !== 'ALL') query.set('status', filters.status);
  if (filters.sort) query.set('sort', filters.sort);
  if (filters.page) query.set('page', String(filters.page));
  if (filters.limit) query.set('limit', String(filters.limit));

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = getApiUrl(`/api/v1/admin/users?${query.toString()}`);
  const res = await fetch(url, {
    method: 'GET',
    headers,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to fetch customer accounts');
  }

  return json.data;
}

export async function disableAdminUser(
  userId: string,
  reason?: string,
  token?: string | null
): Promise<AdminUserListItem> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = getApiUrl(`/api/v1/admin/users/${encodeURIComponent(userId)}/disable`);
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ reason }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to disable customer account');
  }

  return json.data;
}

export async function restoreAdminUser(
  userId: string,
  token?: string | null
): Promise<AdminUserListItem> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = getApiUrl(`/api/v1/admin/users/${encodeURIComponent(userId)}/restore`);
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to restore customer account');
  }

  return json.data;
}

export async function deleteAdminUser(
  userId: string,
  confirm: boolean,
  reason?: string,
  token?: string | null
): Promise<{
  success: boolean;
  anonymized: boolean;
  message: string;
  retainedRecords?: {
    projects: number;
    consultations: number;
    purchases: number;
  };
}> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = getApiUrl(`/api/v1/admin/users/${encodeURIComponent(userId)}`);
  const res = await fetch(url, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ confirm, reason }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to delete customer account');
  }

  return json;
}
