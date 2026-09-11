// ==============================================================================
// Hutty Cost Calculator — Centralized API Configuration
// ==============================================================================

/**
 * Resolves the API base URL cleanly across environments:
 * - Production: Defaults to 'https://hutty-api.onrender.com' (or VITE_API_BASE_URL if set in Vercel)
 * - Development: Defaults to '' (using Vite reverse proxy to localhost:4000) unless VITE_API_BASE_URL is specified
 */
function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    // Guard against accidental '/api/v1' suffix in the base URL configuration
    if (clean.endsWith('/api/v1')) {
      clean = clean.slice(0, -7);
    }
    return clean;
  }
  return import.meta.env.PROD ? 'https://hutty-api.onrender.com' : '';
}

export const API_BASE_URL = resolveApiBaseUrl();

/**
 * Safely constructs a fully qualified or proxy-compatible API URL.
 * Prevents double slashes and accidental '/api/v1/api/v1' duplications.
 *
 * @param endpoint - e.g. '/api/v1/health', '/api/v1/auth/login'
 * @returns Complete URL e.g. 'https://hutty-api.onrender.com/api/v1/health'
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!API_BASE_URL) {
    return cleanEndpoint;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
}
