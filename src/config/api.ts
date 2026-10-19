// ==============================================================================
// Hutty Cost Calculator — Centralized API Configuration
// ==============================================================================

/**
 * Resolves the API base URL cleanly across environments:
 * - Production: Defaults to 'https://hutty-api-st46.onrender.com' (or VITE_API_BASE_URL if set in Render/Vercel)
 * - Development: Defaults to '' (using Vite reverse proxy to localhost:4000) unless VITE_API_BASE_URL is specified
 */
function resolveApiBaseUrl(): string {
  const metaEnv = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};
  const envUrl = metaEnv.VITE_API_BASE_URL || metaEnv.VITE_API_URL || procEnv.VITE_API_BASE_URL || procEnv.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    // Guard against accidental '/api/v1' suffix in the base URL configuration
    if (clean.endsWith('/api/v1')) {
      clean = clean.slice(0, -7);
    }
    return clean;
  }
  // When running in a browser on localhost or 127.0.0.1, use relative path to hit local backend
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '';
  }
  return metaEnv.PROD ? 'https://hutty-api-st46.onrender.com' : (metaEnv.DEV ? '' : 'https://hutty-api-st46.onrender.com');
}

export const API_BASE_URL = resolveApiBaseUrl();

/**
 * Safely constructs a fully qualified or proxy-compatible API URL.
 * Prevents double slashes and accidental '/api/v1/api/v1' duplications.
 *
 * @param endpoint - e.g. '/api/v1/health', '/api/v1/auth/login'
 * @returns Complete URL e.g. 'https://hutty-api-st46.onrender.com/api/v1/health'
 */
export function getApiUrl(endpoint: string): string {
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Guarantee that relative API routes include the /api/v1 prefix required by Express routes & Vite proxy
  if (!cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = `/api/v1${cleanEndpoint}`;
  } else if (!cleanEndpoint.startsWith('/api/v1/')) {
    cleanEndpoint = `/api/v1${cleanEndpoint.slice(4)}`;
  }

  // When running inside a browser on localhost / 127.0.0.1, ALWAYS use relative path
  // so requests hit the local backend (port 4000) instead of remote Render
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0')
  ) {
    return cleanEndpoint;
  }

  if (!API_BASE_URL) {
    return cleanEndpoint;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
}
