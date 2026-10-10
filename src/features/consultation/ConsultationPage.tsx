import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SEO } from '../../components/common/SEO';
import { useConsultationStore } from '../../store/useConsultationStore';
import { ConsultationHero } from './components/ConsultationHero';
import { ConsultationFilters } from './components/ConsultationFilters';
import { ConsultantCard } from './components/ConsultantCard';
import { ConsultationBookingModal } from './components/ConsultationBookingModal';
import { MyConsultationsModal } from './components/MyConsultationsModal';
import { Consultant } from '../../types/consultation';
import {
  LAUNCH_CONSULTATION_PRICE_DISPLAY,
  LAUNCH_CONSULTATION_PRICE_INR,
} from '../../config/consultation';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  HelpCircle,
  FileCheck,
  ArrowRight,
  RefreshCw,
  SearchX,
} from 'lucide-react';

export const ConsultationPage: React.FC = () => {
  const {
    consultants,
    isLoading,
    error,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    fetchConsultants,
  } = useConsultationStore();

  const [bookingConsultant, setBookingConsultant] = useState<Consultant | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const directoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConsultants();
  }, [fetchConsultants, activeCategory, searchQuery, selectedCity]);

  const scrollToDirectory = () => {
    directoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBookClick = (consultant: Consultant) => {
    setBookingConsultant(consultant);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#1B3D34]">
      <SEO
        title="Expert Construction Consultation — Verified Architects & Engineers | Hutty"
        description="Book independent consultations with Hutty-approved residential architects, structural engineers, and contractors in Bangalore. Flat ₹1,499 per consultation."
      />

      {/* ── HERO SECTION ── */}
      <ConsultationHero onFindExpertClick={scrollToDirectory} />

      {/* ── MAIN DIRECTORY AREA ── */}
      <div ref={directoryRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Top Header & My Consultations Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28]">
              DIRECTORY OF CERTIFIED PRACTITIONERS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] mt-0.5 font-heading">
              Browse Hutty-Approved Experts
            </h2>
            <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
              Select an expert below or filter by category to inspect drawings, review quotes, or schedule an on-site audit.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-[#F8F8F6] text-xs font-bold text-[#1B3D34] border border-[#E3E8E2] rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#1B3D34]" />
            <span>Track My Consultation</span>
          </button>
        </div>

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <ConsultationFilters
          selectedCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          totalResults={consultants.length}
        />

        {/* ── CONSULTANT CARDS GRID / STATES ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#E3E8E2] p-6 space-y-4 animate-pulse h-72"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#E3E8E2]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-[#E3E8E2] rounded w-3/4" />
                    <div className="h-3 bg-[#E3E8E2] rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-[#E3E8E2] rounded w-full" />
                  <div className="h-3 bg-[#E3E8E2] rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-3 shadow-xs">
            <SearchX className="w-8 h-8 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Unable to load consultants</h3>
            <p className="text-xs text-[#4B5563] max-w-md mx-auto">{error}</p>
            <button
              type="button"
              onClick={() => fetchConsultants()}
              className="px-4 py-2 bg-[#1B3D34] text-white text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : consultants.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E3E8E2] text-center space-y-3 shadow-xs">
            <SearchX className="w-10 h-10 text-[#4B5563]/50 mx-auto" />
            <h3 className="text-lg font-bold text-[#1B3D34] font-heading">
              No experts match your current filters
            </h3>
            <p className="text-xs text-[#4B5563] max-w-sm mx-auto">
              Try adjusting your category, city location, or search keyword to view available approved consultants.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('ALL');
                setSearchQuery('');
                setSelectedCity('ALL');
              }}
              className="px-4 py-2 bg-[#1B3D34] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultants.map((consultant) => (
              <ConsultantCard
                key={consultant.id}
                consultant={consultant}
                onBookClick={handleBookClick}
              />
            ))}
          </div>
        )}

        {/* ── HOW HUTTY CONSULTATION WORKS ── */}
        <section className="bg-white rounded-3xl border border-[#E3E8E2] p-6 sm:p-10 shadow-xs space-y-8 mt-14">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28]">
              TRANSPARENT PROCESS
            </span>
            <h3 className="text-2xl font-bold text-[#1B3D34] mt-1 font-heading">
              How Hutty Consultation Works
            </h3>
            <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
              Direct, unhurried, conflict-free advice from experienced practitioners without commercial sales pitches.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1B3D34] text-[#F28C28] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-[#1B3D34]">Select Your Specialist</h4>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Choose an architect, structural engineer, contractor, or approvals liaison based on your exact project stage.
              </p>
            </div>

            <div className="p-5 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1B3D34] text-[#F28C28] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-[#1B3D34]">Submit Details &amp; Pay {LAUNCH_CONSULTATION_PRICE_DISPLAY}</h4>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Optionally link your Hutty calculation or drawings. A single flat launch fee of {LAUNCH_CONSULTATION_PRICE_DISPLAY} covers the session.
              </p>
            </div>

            <div className="p-5 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1B3D34] text-[#F28C28] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-[#1B3D34]">Admin Scheduling &amp; Session</h4>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Our team reviews your topic, assigns the expert, and confirms your appointment with a meeting link and notes.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── BOOKING MODAL ── */}
      <ConsultationBookingModal
        isOpen={Boolean(bookingConsultant)}
        onClose={() => setBookingConsultant(null)}
        consultant={bookingConsultant}
      />

      {/* ── MY CONSULTATIONS HISTORY MODAL ── */}
      <MyConsultationsModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
};
