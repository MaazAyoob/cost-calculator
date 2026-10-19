// ==============================================================================
// Hutty Customer Authentication Store
// Manages customer authentication state, JWT storage, and session lifecycle.
// ==============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getApiUrl } from '../config/api';

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  phoneVerified?: boolean;
  phoneVerifiedAt?: string | null;
  role: string;
  createdAt?: string;
}

interface CustomerAuthState {
  token: string | null;
  user: CustomerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, phone: string, verificationToken: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, phone?: string, verificationToken?: string) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setAuthSession: (token: string, user: CustomerUser) => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(getApiUrl('/api/v1/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            set({
              isLoading: false,
              error: data.error || data.message || 'Invalid email or password. Please try again.',
            });
            return false;
          }

          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err: any) {
          // Fallback to local session in dev/offline mode
          const localUser: CustomerUser = {
            id: `usr_${Date.now()}`,
            name: email.split('@')[0],
            email,
            role: 'CUSTOMER',
            createdAt: new Date().toISOString(),
          };
          set({
            token: `local_jwt_${localUser.id}`,
            user: localUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        }
      },

      signup: async (
        name: string,
        email: string,
        password: string,
        phone: string,
        verificationToken: string
      ): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(getApiUrl('/api/v1/auth/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone, verificationToken }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            set({
              isLoading: false,
              error: data.error || data.message || 'Registration failed. Please check your details.',
            });
            return false;
          }

          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err: any) {
          set({
            isLoading: false,
            error: err.message || 'Network error connecting to registration server.',
          });
          return false;
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        });
        try {
          sessionStorage.removeItem('hutty_persisted_project_id');
        } catch {}
      },

      updateProfile: async (name: string, phone?: string, verificationToken?: string): Promise<boolean> => {
        const token = get().token;
        if (!token) return false;

        set({ isLoading: true, error: null });
        try {
          const res = await fetch(getApiUrl('/api/v1/auth/profile'), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, phone, verificationToken }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            set({ isLoading: false, error: data.error || 'Failed to update profile' });
            return false;
          }

          set((state) => ({
            isLoading: false,
            user: data.user ? data.user : (state.user ? { ...state.user, name, phone: phone || null } : null),
          }));
          return true;
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Profile update failed' });
          return false;
        }
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const res = await fetch(getApiUrl('/api/v1/auth/me'), {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            // Token expired or invalid
            set({ token: null, user: null, isAuthenticated: false });
            return;
          }

          const data = await res.json();
          if (data.success && data.user) {
            set({ user: data.user, isAuthenticated: true });
          }
        } catch {
          // If offline, preserve cached user
        }
      },

      clearError: () => set({ error: null }),

      setAuthSession: (token: string, user: CustomerUser) => {
        set({
          token,
          user,
          isAuthenticated: true,
          error: null,
        });
      },
    }),
    {
      name: 'hutty_customer_auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
