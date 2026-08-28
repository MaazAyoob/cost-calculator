import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ReportEntitlement {
  projectId: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  orderId?: string;
  amountPaidINR: number;
}

interface EntitlementState {
  // Map of projectId -> ReportEntitlement
  unlockedReports: Record<string, ReportEntitlement>;
  // Global unlocked status for current project session
  isCurrentProjectUnlocked: boolean;
  hasDetailedReportAccess: (projectId?: string) => boolean;
  grantReportAccess: (projectId: string, orderId?: string) => void;
  revokeReportAccess: (projectId: string) => void;
}

export const useEntitlementStore = create<EntitlementState>()(
  persist(
    (set, get) => ({
      unlockedReports: {},
      isCurrentProjectUnlocked: false,

      hasDetailedReportAccess: (projectId?: string) => {
        const state = get();
        if (state.isCurrentProjectUnlocked) return true;
        if (!projectId) return false;
        return Boolean(state.unlockedReports[projectId]?.isUnlocked);
      },

      grantReportAccess: (projectId: string, orderId?: string) => {
        const entitlement: ReportEntitlement = {
          projectId,
          isUnlocked: true,
          unlockedAt: new Date().toISOString(),
          orderId: orderId || `ORD-HUTTY-${Date.now().toString(36).toUpperCase()}`,
          amountPaidINR: 4999,
        };

        set((state) => ({
          isCurrentProjectUnlocked: true,
          unlockedReports: {
            ...state.unlockedReports,
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
    }),
    {
      name: 'hutty_report_entitlements_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
