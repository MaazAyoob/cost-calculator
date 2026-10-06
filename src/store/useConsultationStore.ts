// ==============================================================================
// Hutty Consultation Store (Zustand)
// State management for discovery, booking flow, payment, and admin workflow
// ==============================================================================

import { create } from 'zustand';
import {
  Consultant,
  ConsultationRequest,
  ConsultationPayment,
  BookingSubmissionPayload,
} from '../types/consultation';
import { consultationApi, BookingResponse, AdminConsultationsResponse } from '../services/consultationApi';

interface ConsultationState {
  // Discovery & Public Catalog
  consultants: Consultant[];
  activeCategory: string;
  searchQuery: string;
  selectedCity: string;
  isLoading: boolean;
  error: string | null;

  // Booking Flow State
  selectedConsultant: Consultant | null;
  isBookingModalOpen: boolean;
  isSubmittingBooking: boolean;
  activeBookingResponse: BookingResponse | null;
  confirmedRequest: ConsultationRequest | null;

  // Homeowner History
  myConsultations: ConsultationRequest[];
  isLoadingMyConsultations: boolean;

  // Admin State
  adminConsultants: Consultant[];
  adminRequests: ConsultationRequest[];
  adminStats: AdminConsultationsResponse['stats'];
  adminSelectedRequest: ConsultationRequest | null;
  isAdminLoading: boolean;
  adminError: string | null;
  adminSuccessMessage: string | null;

  // Actions — Public & Discovery
  setActiveCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCity: (city: string) => void;
  fetchConsultants: () => Promise<void>;

  // Actions — Booking
  openBookingModal: (consultant: Consultant) => void;
  closeBookingModal: () => void;
  submitBooking: (payload: BookingSubmissionPayload) => Promise<BookingResponse>;
  verifyPayment: (
    requestId: string,
    paymentDetails: {
      gatewayOrderId: string;
      gatewayPaymentId: string;
      gatewaySignature?: string;
    }
  ) => Promise<ConsultationRequest>;
  clearActiveBooking: () => void;

  // Actions — Homeowner
  fetchMyConsultations: (email?: string) => Promise<void>;

  // Actions — Admin
  fetchAdminConsultants: (token: string) => Promise<void>;
  createAdminConsultant: (data: Partial<Consultant>, token: string) => Promise<void>;
  updateAdminConsultant: (id: string, data: Partial<Consultant>, token: string) => Promise<void>;
  toggleConsultantStatus: (id: string, active: boolean, token: string) => Promise<void>;
  fetchAdminRequests: (params: { status?: string; search?: string } | undefined, token: string) => Promise<void>;
  fetchAdminRequestDetail: (id: string, token: string) => Promise<void>;
  assignConsultant: (requestId: string, consultantId: string, token: string) => Promise<void>;
  scheduleConsultation: (requestId: string, confirmedDateTime: string, token: string) => Promise<void>;
  updateRequestStatus: (
    requestId: string,
    status: ConsultationRequest['status'],
    token: string
  ) => Promise<void>;
  addInternalNote: (requestId: string, note: string, token: string) => Promise<void>;
  clearAdminMessages: () => void;
}

import { CURATED_INITIAL_CONSULTANTS } from '../config/consultation';

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  // Discovery & Public
  consultants: CURATED_INITIAL_CONSULTANTS as unknown as Consultant[],
  activeCategory: 'ALL',
  searchQuery: '',
  selectedCity: 'ALL',
  isLoading: false,
  error: null,

  // Booking Flow
  selectedConsultant: null,
  isBookingModalOpen: false,
  isSubmittingBooking: false,
  activeBookingResponse: null,
  confirmedRequest: null,

  // Homeowner History
  myConsultations: [],
  isLoadingMyConsultations: false,

  // Admin
  adminConsultants: CURATED_INITIAL_CONSULTANTS as unknown as Consultant[],
  adminRequests: [],
  adminStats: {
    total: 0,
    paid: 0,
    awaitingReview: 0,
    assigned: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  },
  adminSelectedRequest: null,
  isAdminLoading: false,
  adminError: null,
  adminSuccessMessage: null,

  setActiveCategory: (activeCategory) => {
    set({ activeCategory });
    get().fetchConsultants();
  },
  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().fetchConsultants();
  },
  setSelectedCity: (selectedCity) => {
    set({ selectedCity });
    get().fetchConsultants();
  },

  fetchConsultants: async () => {
    set({ isLoading: true, error: null });
    try {
      const { activeCategory, searchQuery, selectedCity } = get();
      const data = await consultationApi.getConsultants({
        category: activeCategory,
        search: searchQuery,
        city: selectedCity,
      });
      set({ consultants: data && data.length > 0 ? data : (CURATED_INITIAL_CONSULTANTS as unknown as Consultant[]), isLoading: false });
    } catch {
      // Graceful fallback to client-side curated catalog filtering
      const { activeCategory, searchQuery, selectedCity } = get();
      let list = [...(CURATED_INITIAL_CONSULTANTS as unknown as Consultant[])];
      if (activeCategory && activeCategory !== 'ALL') {
        list = list.filter((c) => c.category.toLowerCase() === activeCategory.toLowerCase());
      }
      if (selectedCity && selectedCity !== 'ALL') {
        list = list.filter((c) => c.city.toLowerCase() === selectedCity.toLowerCase() || c.serviceAreas.some(a => a.toLowerCase().includes(selectedCity.toLowerCase())));
      }
      if (searchQuery && searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter((c) => c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.specializations.some(s => s.toLowerCase().includes(q)));
      }
      set({ consultants: list, isLoading: false, error: null });
    }
  },

  openBookingModal: (consultant) => {
    set({
      selectedConsultant: consultant,
      isBookingModalOpen: true,
      activeBookingResponse: null,
      confirmedRequest: null,
    });
  },

  closeBookingModal: () => {
    set({
      isBookingModalOpen: false,
      selectedConsultant: null,
      activeBookingResponse: null,
    });
  },

  submitBooking: async (payload) => {
    set({ isSubmittingBooking: true, error: null });
    try {
      const response = await consultationApi.createBooking(payload);
      set({
        activeBookingResponse: response,
        isSubmittingBooking: false,
      });
      return response;
    } catch (err: any) {
      set({ isSubmittingBooking: false, error: err.message || 'Booking submission failed' });
      throw err;
    }
  },

  verifyPayment: async (requestId, paymentDetails) => {
    set({ isSubmittingBooking: true, error: null });
    try {
      const res = await consultationApi.verifyPayment(requestId, paymentDetails);
      set({
        confirmedRequest: res.request,
        isSubmittingBooking: false,
      });
      // Refresh user consultations if any
      get().fetchMyConsultations(res.request.homeownerEmail);
      return res.request;
    } catch (err: any) {
      set({ isSubmittingBooking: false, error: err.message || 'Payment verification failed' });
      throw err;
    }
  },

  clearActiveBooking: () => {
    set({
      activeBookingResponse: null,
      confirmedRequest: null,
      selectedConsultant: null,
      isBookingModalOpen: false,
    });
  },

  fetchMyConsultations: async (email?: string) => {
    set({ isLoadingMyConsultations: true });
    try {
      const data = await consultationApi.getMyConsultations(email);
      set({ myConsultations: data, isLoadingMyConsultations: false });
    } catch {
      set({ isLoadingMyConsultations: false });
    }
  },

  // ── Admin Actions ──

  fetchAdminConsultants: async (token: string) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      const data = await consultationApi.getAdminConsultants(token);
      set({ adminConsultants: data, isAdminLoading: false });
    } catch (err: any) {
      set({ adminError: err.message, isAdminLoading: false });
    }
  },

  createAdminConsultant: async (data: Partial<Consultant>, token: string) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      await consultationApi.createAdminConsultant(data, token);
      set({ adminSuccessMessage: 'Consultant created successfully' });
      await get().fetchAdminConsultants(token);
      await get().fetchConsultants();
    } catch (err: any) {
      set({ adminError: err.message, isAdminLoading: false });
      throw err;
    }
  },

  updateAdminConsultant: async (id: string, data: Partial<Consultant>, token: string) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      await consultationApi.updateAdminConsultant(id, data, token);
      set({ adminSuccessMessage: 'Consultant updated successfully' });
      await get().fetchAdminConsultants(token);
      await get().fetchConsultants();
    } catch (err: any) {
      set({ adminError: err.message, isAdminLoading: false });
      throw err;
    }
  },

  toggleConsultantStatus: async (id: string, active: boolean, token: string) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      await consultationApi.setAdminConsultantStatus(id, { active }, token);
      set({ adminSuccessMessage: `Consultant ${active ? 'activated' : 'deactivated'} successfully` });
      await get().fetchAdminConsultants(token);
      await get().fetchConsultants();
    } catch (err: any) {
      set({ adminError: err.message, isAdminLoading: false });
      throw err;
    }
  },

  fetchAdminRequests: async (params, token: string) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      const res = await consultationApi.getAdminConsultations(params, token);
      set({
        adminRequests: res.requests,
        adminStats: res.stats,
        isAdminLoading: false,
      });
    } catch (err: any) {
      set({ adminError: err.message, isAdminLoading: false });
    }
  },

  fetchAdminRequestDetail: async (id: string, token: string) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      const detail = await consultationApi.getAdminConsultationById(id, token);
      set({ adminSelectedRequest: detail, isAdminLoading: false });
    } catch (err: any) {
      set({ adminError: err.message, isAdminLoading: false });
    }
  },

  assignConsultant: async (requestId: string, consultantId: string, token: string) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      const updated = await consultationApi.assignConsultant(requestId, consultantId, token);
      set({
        adminSelectedRequest: updated,
        adminSuccessMessage: `Consultant assigned to ${updated.publicReference}`,
      });
      await get().fetchAdminRequests(undefined, token);
    } catch (err: any) {
      set({ adminError: err.message, isAdminLoading: false });
      throw err;
    }
  },

  scheduleConsultation: async (requestId: string, confirmedDateTime: string, token: string) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      const updated = await consultationApi.scheduleConsultation(requestId, confirmedDateTime, token);
      set({
        adminSelectedRequest: updated,
        adminSuccessMessage: `Schedule confirmed for ${updated.publicReference}`,
      });
      await get().fetchAdminRequests(undefined, token);
    } catch (err: any) {
      set({ adminError: err.message, isAdminLoading: false });
      throw err;
    }
  },

  updateRequestStatus: async (requestId: string, status: ConsultationRequest['status'], token: string) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      const updated = await consultationApi.updateRequestStatus(requestId, status, token);
      set({
        adminSelectedRequest: updated,
        adminSuccessMessage: `Status changed to ${updated.status}`,
      });
      await get().fetchAdminRequests(undefined, token);
    } catch (err: any) {
      set({ adminError: err.message, isAdminLoading: false });
      throw err;
    }
  },

  addInternalNote: async (requestId: string, note: string, token: string) => {
    try {
      await consultationApi.addInternalNote(requestId, note, token);
      set({ adminSuccessMessage: 'Internal note saved' });
      await get().fetchAdminRequestDetail(requestId, token);
    } catch (err: any) {
      set({ adminError: err.message });
      throw err;
    }
  },

  clearAdminMessages: () => {
    set({ adminError: null, adminSuccessMessage: null });
  },
}));
