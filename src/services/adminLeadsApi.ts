/**
 * ==============================================================================
 * Hutty Admin Leads API Service
 * ==============================================================================
 */

export type LeadSource = 'ACCOUNT_SIGNUP' | 'CONSULTATION_BOOKING' | 'GENERAL_ENQUIRY' | 'REPORT_PURCHASE';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';

export interface AdminLead {
  id: string;
  leadKey: string;
  name: string;
  phone: string;
  phoneFormatted: string;
  phoneVerified: boolean;
  phoneVerifiedAt: string | null;
  email: string | null;
  source: LeadSource;
  sourceLabel: string;
  status: LeadStatus;
  enquiryDetails: string;
  notes: string | null;
  assignedTo: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  reference: string | null;
  userId: string | null;
  consultationId: string | null;
  projectLocation?: string | null;
  projectType?: string | null;
}

export interface LeadFilters {
  dateFilter?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  source?: string;
  phoneVerified?: string;
  status?: string;
  sort?: 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

export interface LeadsApiResponse {
  success: boolean;
  data: {
    leads: AdminLead[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    summary: {
      totalLeads: number;
      phoneVerified: number;
      unverified: number;
      newEnquiries: number;
    };
    activeDateRange: {
      label: string;
      startDate: string;
      endDate: string;
    };
  };
  error?: string;
}

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).__API_URL__) {
    return (window as any).__API_URL__;
  }
  return import.meta.env.VITE_API_URL || '';
};

/**
 * Fetch filtered leads with pagination and metrics
 */
export async function fetchAdminLeads(filters: LeadFilters, token?: string | null): Promise<LeadsApiResponse['data']> {
  const query = new URLSearchParams();
  if (filters.dateFilter) query.set('dateFilter', filters.dateFilter);
  if (filters.startDate) query.set('startDate', filters.startDate);
  if (filters.endDate) query.set('endDate', filters.endDate);
  if (filters.search) query.set('search', filters.search);
  if (filters.source && filters.source !== 'ALL') query.set('source', filters.source);
  if (filters.phoneVerified && filters.phoneVerified !== 'ALL') query.set('phoneVerified', filters.phoneVerified);
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

  const res = await fetch(`${getApiBaseUrl()}/api/v1/admin/leads?${query.toString()}`, {
    method: 'GET',
    headers,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to fetch leads');
  }

  return json.data;
}

/**
 * Update lead status and internal notes
 */
export async function updateAdminLeadStatus(
  leadKey: string,
  status: LeadStatus,
  notes?: string,
  token?: string | null
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}/api/v1/admin/leads/${encodeURIComponent(leadKey)}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, notes }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to update lead status');
  }

  return json.data;
}

/**
 * Download leads export file (CSV or XLSX)
 */
export async function downloadAdminLeadsExport(
  filters: LeadFilters,
  format: 'csv' | 'xlsx',
  scope: 'all' | 'selected' | 'verified_only',
  selectedIds?: string[],
  token?: string | null
): Promise<{ filename: string }> {
  const query = new URLSearchParams();
  query.set('format', format);
  query.set('scope', scope);
  if (filters.dateFilter) query.set('dateFilter', filters.dateFilter);
  if (filters.startDate) query.set('startDate', filters.startDate);
  if (filters.endDate) query.set('endDate', filters.endDate);
  if (filters.search) query.set('search', filters.search);
  if (filters.source && filters.source !== 'ALL') query.set('source', filters.source);
  if (filters.phoneVerified && filters.phoneVerified !== 'ALL') query.set('phoneVerified', filters.phoneVerified);
  if (filters.status && filters.status !== 'ALL') query.set('status', filters.status);
  if (filters.sort) query.set('sort', filters.sort);
  if (selectedIds && selectedIds.length > 0) {
    query.set('selectedIds', selectedIds.join(','));
  }

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}/api/v1/admin/leads/export?${query.toString()}`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.error || 'Export failed');
  }

  const disposition = res.headers.get('Content-Disposition');
  let filename = `hutty-leads-${Date.now()}.${format}`;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);

  return { filename };
}
