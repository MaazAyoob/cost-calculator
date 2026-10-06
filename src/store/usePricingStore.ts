// ==============================================================================
// Hutty Centralized Pricing & Entitlement Store (Pricing Model V1)
// Clean separation: Canonical calculator calculates canonical engineering math.
// Pricing layer controls COMMERCIAL ACCESS & ENTITLEMENTS.
// Price authority resides on the server (integer minor units).
// Consultation (₹1,499) is strictly decoupled and governed separately.
// ==============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  PricingTier,
  PricingPurchase,
  UserEntitlement,
  PricingFeatureCode,
  PricingTierCode,
} from '../types/pricing';
import { DEFAULT_PRICING_TIERS } from '../config/pricing';
import { getApiUrl } from '../config/api';

interface PricingState {
  tiers: PricingTier[];
  userEntitlements: UserEntitlement[];
  purchases: PricingPurchase[];
  isLoading: boolean;
  error: string | null;

  // Access Control Query
  canAccessFeature: (featureCode: PricingFeatureCode | string, projectId?: string) => boolean;
  getProjectTier: (projectId?: string) => PricingTierCode;
  hasDetailedReportAccess: (projectId?: string) => boolean;

  // Sync & CRUD
  fetchTiers: () => Promise<void>;
  fetchMyEntitlements: (email?: string, projectId?: string) => Promise<void>;
  
  // Checkout & Entitlement Actions
  initiatePurchase: (payload: {
    tierCode: PricingTierCode | string;
    leadName: string;
    leadPhone: string;
    leadEmail: string;
    projectId?: string;
    projectSnapshot?: any;
    testBypassPayment?: boolean;
  }) => Promise<{
    purchase: PricingPurchase;
    requiresPayment: boolean;
    gatewayOrder: any;
  }>;
  confirmPurchasePayment: (
    purchaseId: string,
    gatewayPaymentId: string,
    gatewayOrderId?: string
  ) => Promise<void>;

  // Direct local entitlement grant (e.g. for offline/dev test or instant unlocked state)
  grantEntitlementsDirectly: (
    tierCode: PricingTierCode,
    projectId: string,
    leadEmail?: string,
    orderId?: string
  ) => void;
}

export const usePricingStore = create<PricingState>()(
  persist(
    (set, get) => ({
      tiers: DEFAULT_PRICING_TIERS,
      userEntitlements: [],
      purchases: [],
      isLoading: false,
      error: null,

      canAccessFeature: (featureCode: PricingFeatureCode | string, projectId?: string) => {
        // Basic summaries are universally open to all users (Free tier)
        if (
          featureCode === 'BASIC_PROJECT_SUMMARY' ||
          featureCode === 'BASIC_COST_SUMMARY'
        ) {
          return true;
        }

        const state = get();
        const activeEntitlements = state.userEntitlements.filter((e) => e.active);

        // Check if there is an active matching entitlement
        const match = activeEntitlements.some((e) => {
          if (e.featureCode !== featureCode) return false;
          if (projectId && e.projectId && e.projectId !== projectId) return false;
          return true;
        });

        return match;
      },

      getProjectTier: (projectId?: string): PricingTierCode => {
        const state = get();
        if (state.canAccessFeature('FULL_PDF_REPORT', projectId)) {
          return 'DETAILED_ESTIMATE_499';
        }
        if (state.canAccessFeature('SAVED_PROJECT', projectId)) {
          return 'ESTIMATE_99';
        }
        return 'FREE';
      },

      hasDetailedReportAccess: (projectId?: string): boolean => {
        return get().canAccessFeature('FULL_PDF_REPORT', projectId);
      },

      fetchTiers: async () => {
        try {
          set({ isLoading: true, error: null });
          const res = await fetch(getApiUrl('/pricing/tiers'));
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              set({ tiers: json.data, isLoading: false });
              return;
            }
          }
        } catch {
          // Fall back gracefully to bundled default tiers
        }
        set({ tiers: DEFAULT_PRICING_TIERS, isLoading: false });
      },

      fetchMyEntitlements: async (email?: string, projectId?: string) => {
        try {
          const params = new URLSearchParams();
          if (email) params.set('email', email);
          if (projectId) params.set('projectId', projectId);

          const res = await fetch(getApiUrl(`/pricing/my/entitlements?${params.toString()}`));
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
              set({ userEntitlements: json.data });
            }
          }
        } catch {
          // Keep local cached entitlements on error
        }
      },

      initiatePurchase: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(getApiUrl('/pricing/purchases'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.message || 'Failed to initiate purchase');
          }

          const { purchase, requiresPayment, gatewayOrder } = json.data;

          set((state) => ({
            purchases: [purchase, ...state.purchases.filter((p) => p.id !== purchase.id)],
            isLoading: false,
          }));

          // If payment was not required (e.g. Free or instant bypass), refresh entitlements
          if (!requiresPayment) {
            const tier = get().tiers.find((t) => t.code === payload.tierCode);
            if (tier && payload.projectId) {
              get().grantEntitlementsDirectly(
                payload.tierCode as PricingTierCode,
                payload.projectId,
                payload.leadEmail,
                purchase.publicReference
              );
            }
          }

          return { purchase, requiresPayment, gatewayOrder };
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      confirmPurchasePayment: async (purchaseId, gatewayPaymentId, gatewayOrderId) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(getApiUrl('/pricing/purchases/confirm'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ purchaseId, gatewayPaymentId, gatewayOrderId }),
          });

          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.message || 'Failed to confirm purchase payment');
          }

          const { purchase, entitlements } = json.data;

          set((state) => ({
            purchases: state.purchases.map((p) => (p.id === purchase.id ? purchase : p)),
            userEntitlements: [...state.userEntitlements, ...(entitlements || [])],
            isLoading: false,
          }));
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      grantEntitlementsDirectly: (tierCode, projectId, leadEmail, orderId) => {
        const tier = get().tiers.find((t) => t.code === tierCode) ||
          DEFAULT_PRICING_TIERS.find((t) => t.code === tierCode);
        if (!tier) return;

        const newEntitlements: UserEntitlement[] = tier.features.map((feat) => ({
          id: `ent-local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          projectId,
          userEmail: leadEmail || 'client@hutty.in',
          featureCode: feat,
          sourcePurchaseId: orderId || `ORD-${Date.now()}`,
          active: true,
          startsAt: new Date().toISOString(),
          expiresAt: null,
        }));

        set((state) => {
          // Remove duplicate feature grants for the same project
          const filtered = state.userEntitlements.filter(
            (e) => !(e.projectId === projectId && tier.features.includes(e.featureCode as any))
          );
          return {
            userEntitlements: [...filtered, ...newEntitlements],
          };
        });
      },
    }),
    {
      name: 'hutty_pricing_entitlements_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
