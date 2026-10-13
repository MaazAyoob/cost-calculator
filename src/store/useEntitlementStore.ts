import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { usePricingStore } from './usePricingStore';

export interface ReportEntitlement {
  projectId: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  orderId?: string;
  amountPaidINR: number;
}

interface EntitlementState {
  // Map of projectId -> ReportEntitlement for Detailed BOQ (₹499)
  unlockedReports: Record<string, ReportEntitlement>;
  // Map of projectId -> ReportEntitlement for Basic Estimate PDF (₹99)
  basicPdfUnlockedReports: Record<string, ReportEntitlement>;
  // Global unlocked status for current project session
  isCurrentProjectUnlocked: boolean;
  hasDetailedReportAccess: (projectId?: string) => boolean;
  hasBasicPdfAccess: (projectId?: string) => boolean;
  grantReportAccess: (projectId: string, orderId?: string) => void;
  grantBasicPdfAccess: (projectId: string, orderId?: string) => void;
  revokeReportAccess: (projectId: string) => void;
  revokeBasicPdfAccess: (projectId: string) => void;
}

export const useEntitlementStore = create<EntitlementState>()(
  persist(
    (set, get) => ({
      unlockedReports: {},
      basicPdfUnlockedReports: {},
      isCurrentProjectUnlocked: false,

      hasDetailedReportAccess: (projectId?: string) => {
        // Check centralized pricing store first
        if (usePricingStore.getState().canAccessFeature('FULL_PDF_REPORT', projectId)) {
          return true;
        }
        const state = get();
        if (state.isCurrentProjectUnlocked) return true;
        if (!projectId) return false;
        return Boolean(state.unlockedReports[projectId]?.isUnlocked);
      },

      hasBasicPdfAccess: (projectId?: string) => {
        // Detailed report unlock (₹499 or ₹1,499) inherently unlocks basic PDF
        if (get().hasDetailedReportAccess(projectId)) {
          return true;
        }
        // Check centralized pricing store for BASIC_PDF_DOWNLOAD
        if (usePricingStore.getState().canAccessFeature('BASIC_PDF_DOWNLOAD', projectId)) {
          return true;
        }
        const state = get();
        if (!projectId) return false;
        return Boolean(state.basicPdfUnlockedReports[projectId]?.isUnlocked);
      },

      grantReportAccess: (projectId: string, orderId?: string) => {
        const entitlement: ReportEntitlement = {
          projectId,
          isUnlocked: true,
          unlockedAt: new Date().toISOString(),
          orderId: orderId || `ORD-HUTTY-${Date.now().toString(36).toUpperCase()}`,
          amountPaidINR: 499, // Authoritative ₹499 Detailed Construction Dossier
        };

        // Also grant in centralized pricing store
        usePricingStore.getState().grantEntitlementsDirectly(
          'DETAILED_ESTIMATE_499',
          projectId,
          undefined,
          entitlement.orderId
        );

        set((state) => ({
          isCurrentProjectUnlocked: true,
          unlockedReports: {
            ...state.unlockedReports,
            [projectId]: entitlement,
          },
        }));
      },

      grantBasicPdfAccess: (projectId: string, orderId?: string) => {
        const entitlement: ReportEntitlement = {
          projectId,
          isUnlocked: true,
          unlockedAt: new Date().toISOString(),
          orderId: orderId || `ORD-BASIC-${Date.now().toString(36).toUpperCase()}`,
          amountPaidINR: 99, // Authoritative ₹99 Basic Estimate PDF
        };

        // Also grant in centralized pricing store
        usePricingStore.getState().grantEntitlementsDirectly(
          'BASIC_ESTIMATE_PDF',
          projectId,
          undefined,
          entitlement.orderId
        );

        set((state) => ({
          basicPdfUnlockedReports: {
            ...state.basicPdfUnlockedReports,
            [projectId]: entitlement,
          },
        }));
      },

      revokeReportAccess: (projectId: string) => {
        set((state) => {
          const copy = { ...state.unlockedReports };
          delete copy[projectId];
          return {
            isCurrentProjectUnlocked: false,
            unlockedReports: copy,
          };
        });
      },

      revokeBasicPdfAccess: (projectId: string) => {
        set((state) => {
          const copy = { ...state.basicPdfUnlockedReports };
          delete copy[projectId];
          return {
            basicPdfUnlockedReports: copy,
          };
        });
      },
    }),
    {
      name: 'cost_calculator_report_entitlements_v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
