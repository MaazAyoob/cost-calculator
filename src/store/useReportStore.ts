import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface LeadInfo {
  name: string;
  phone: string;
  email: string;
  capturedAt: string;
}

interface ReportState {
  includeArchitecturalDrawings: boolean;
  includeDetailedBOQ: boolean;
  includeMaterialSpecification: boolean;
  includeCashflowSchedule: boolean;
  preparedFor: string;
  clientNotes: string;
  leadInfo: LeadInfo | null;
  isLeadCaptured: boolean;

  toggleOption: (key: 'includeArchitecturalDrawings' | 'includeDetailedBOQ' | 'includeMaterialSpecification' | 'includeCashflowSchedule') => void;
  setPreparedFor: (name: string) => void;
  setClientNotes: (notes: string) => void;
  saveLeadInfo: (info: { name: string; phone: string; email: string }) => void;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set) => ({
      includeArchitecturalDrawings: true,
      includeDetailedBOQ: true,
      includeMaterialSpecification: true,
      includeCashflowSchedule: true,
      preparedFor: 'Valued Client',
      clientNotes: 'Custom residential construction feasibility & BOQ report.',
      leadInfo: null,
      isLeadCaptured: false,

      toggleOption: (key) => set((state) => ({ [key]: !state[key] })),
      setPreparedFor: (preparedFor) => set({ preparedFor }),
      setClientNotes: (clientNotes) => set({ clientNotes }),
      saveLeadInfo: (info) =>
        set({
          leadInfo: { ...info, capturedAt: new Date().toISOString() },
          isLeadCaptured: true,
          preparedFor: info.name || 'Valued Client',
        }),
    }),
    {
      name: 'cost_calculator_report_lead_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

