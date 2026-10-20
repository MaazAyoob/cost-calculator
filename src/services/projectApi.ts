// ==============================================================================
// Hutty Project API Client
// Handles durable server-side project persistence, listing, auto-saving,
// renaming, and deletion with authentication headers.
// ==============================================================================

import { getApiUrl } from '../config/api';
import { useCustomerAuthStore } from '../store/useCustomerAuthStore';

export interface PersistProjectPayload {
  name?: string;
  leadName?: string;
  leadEmail?: string;
  leadPhone?: string;
  city?: string;
  authority?: string;
  configuration?: {
    plotLength?: number;
    plotWidth?: number;
    houseType?: string;
    floors?: number;
    parkingType?: string;
    carCount?: number;
    bikeCount?: number;
    evCharging?: boolean;
    liftRequired?: boolean;
    rooms?: any;
    qualityTier?: string;
    materialBrands?: any;
  };
  calculation?: {
    totalBUASqFt?: number;
    totalCostINR?: number;
    costPerSqFt?: number;
    steelTonnes?: number;
    cementBags?: number;
    concreteCuM?: number;
    timelineMonths?: number;
    budgetBreakdown?: any;
    quantitiesJson?: any;
    configSnapshot?: any;
  };
  snapshot?: any;
}

export interface PersistedProject {
  id: string;
  name: string;
  ownerId: string;
  city: string;
  authority: string;
  status: string;
  configuration?: any;
  calculation?: any;
  createdAt: string;
  updatedAt: string;
}

let cachedPersistedProjectId: string | null = null;

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = useCustomerAuthStore.getState().token;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Creates or persists a project to the backend database.
 */
export async function persistProject(payload: PersistProjectPayload): Promise<PersistedProject> {
  const url = getApiUrl('/projects');
  const user = useCustomerAuthStore.getState().user;

  const bodyPayload = {
    ...payload,
    leadEmail: payload.leadEmail || user?.email,
    leadName: payload.leadName || user?.name,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bodyPayload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to persist project in database');
  }

  cachedPersistedProjectId = json.data.id;
  try {
    sessionStorage.setItem('hutty_persisted_project_id', json.data.id);
  } catch {}

  return json.data;
}

/**
 * Retrieves all projects owned by the authenticated customer.
 */
export async function fetchUserProjects(): Promise<PersistedProject[]> {
  const url = getApiUrl('/projects');
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to load projects');
  }
  return json.data || [];
}

/**
 * Retrieves a single project by ID.
 */
export async function fetchProjectById(id: string): Promise<PersistedProject> {
  const url = getApiUrl(`/projects/${id}`);
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to load project');
  }
  return json.data;
}

/**
 * Auto-saves updated configuration and calculation snapshots for a project.
 */
export async function updateProject(id: string, payload: Partial<PersistProjectPayload>): Promise<PersistedProject> {
  const url = getApiUrl(`/projects/${id}`);
  const res = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to auto-save project');
  }
  return json.data;
}

/**
 * Renames a project owned by the customer.
 */
export async function renameProject(id: string, name: string): Promise<PersistedProject> {
  const url = getApiUrl(`/projects/${id}/rename`);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to rename project');
  }
  return json.data;
}

/**
 * Deletes or archives a project owned by the customer.
 */
export async function deleteProject(id: string): Promise<{ success: boolean; message: string }> {
  const url = getApiUrl(`/projects/${id}`);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to delete project');
  }
  return json;
}

export function getCachedProjectId(): string | null {
  if (cachedPersistedProjectId) return cachedPersistedProjectId;
  try {
    return sessionStorage.getItem('hutty_persisted_project_id');
  } catch {
    return null;
  }
}

export function setCachedProjectId(id: string | null): void {
  cachedPersistedProjectId = id;
  try {
    if (id) {
      sessionStorage.setItem('hutty_persisted_project_id', id);
    } else {
      sessionStorage.removeItem('hutty_persisted_project_id');
    }
  } catch {}
}

export function clearCachedProjectId(): void {
  setCachedProjectId(null);
}
