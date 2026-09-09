/**
 * Developer Testing Configuration & Safeguards
 *
 * This module controls developer-only testing features such as the Full PDF testing bypass.
 *
 * SECURITY & PRODUCTION SAFEGUARDS:
 * 1. Hard compile-time barrier: Vite replaces `import.meta.env.DEV` with `false` in production bundles,
 *    enabling dead-code elimination.
 * 2. Unconditionally returns `false` in production environments (`import.meta.env.PROD === true` or `!import.meta.env.DEV`).
 * 3. Strict explicit opt-in: Does NOT default to true. Requires `VITE_DEVELOPMENT_FULL_PDF_TESTING === 'true'`
 *    or `DEVELOPMENT_FULL_PDF_TESTING === 'true'`.
 * 4. If the flag is absent, false, or anything other than "true", returns `false` even in development.
 */

export function isDevPdfTestingEnabled(): boolean {
  // Hard Barrier: In production mode, always false regardless of any variables
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (!import.meta.env.DEV || import.meta.env.PROD) {
      return false;
    }

    const flag =
      import.meta.env.VITE_DEVELOPMENT_FULL_PDF_TESTING ??
      (import.meta.env as Record<string, unknown>).DEVELOPMENT_FULL_PDF_TESTING;

    if (typeof flag === 'string') {
      return flag.trim().toLowerCase() === 'true';
    }

    return false;
  }

  return false;
}
