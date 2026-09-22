import { getApiUrl } from '../config/api';

/**
 * Resolves an image URL safely:
 * - External absolute URLs (https://...) are preserved.
 * - Data URLs (data:image/...) are preserved.
 * - Relative upload paths (/uploads/...) are prefixed with the configured API origin via getApiUrl.
 * - Empty/null URLs return an empty string.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  return getApiUrl(trimmed);
}
