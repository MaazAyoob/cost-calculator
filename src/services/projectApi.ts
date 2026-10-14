// ==============================================================================
// Hutty Project API Client
// Handles durable server-side project persistence and retrieval
// ==============================================================================

import { getApiUrl } from '../config/api';

export interface PersistProjectPayload {
  name?: string;
  leadName?: string;
  leadEmail: string;
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

export async function persistProject(payload: PersistProjectPayload): Promise<PersistedProject> {
  const url = getApiUrl('/projects');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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

export function getCachedProjectId(): string | null {
  if (cachedPersistedProjectId) return cachedPersistedProjectId;
  try {
    return sessionStorage.getItem('hutty_persisted_project_id');
  } catch {
    return null;
  }
}

export function setCachedProjectId(id: string): void {
  cachedPersistedProjectId = id;
  try {
    sessionStorage.setItem('hutty_persisted_project_id', id);
  } catch {}
}
