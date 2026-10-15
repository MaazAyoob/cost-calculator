// ==============================================================================
// Hutty Authentication Route Guard
// Protects customer-only routes (calculator, planner, account, reports)
// by redirecting unauthenticated visitors to login while safely preserving
// their intended destination.
// ==============================================================================

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Validates that a redirect path is internal and safe to prevent open redirect vulnerabilities.
 */
export function sanitizeRedirectUrl(url?: string | null): string {
  if (!url) return '/calculator';
  const trimmed = url.trim();
  // Must start with '/' and not '//' or 'http:' or 'https:' or 'javascript:'
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes(':')) {
    return trimmed;
  }
  return '/calculator';
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, checkAuth } = useCustomerAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${returnUrl}`} replace />;
  }

  return <>{children}</>;
};
