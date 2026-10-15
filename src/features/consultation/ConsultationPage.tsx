import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { useConsultationStore } from '../../store/useConsultationStore';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';
import { ConsultationHero } from './components/ConsultationHero';
import { ConsultationTrustStrip } from './components/ConsultationTrustStrip';
import { ConsultationCategoriesGrid } from './components/ConsultationCategoriesGrid';
import { PopularConsultationsSection } from './components/PopularConsultationsSection';
import { HowConsultationWorksSection } from './components/HowConsultationWorksSection';
import { FallbackHelpSection } from './components/FallbackHelpSection';
import { ProfessionalSignUpBanner } from './components/ProfessionalSignUpBanner';
import { ConsultationFilters } from './components/ConsultationFilters';
import { ConsultantCard } from './components/ConsultantCard';
import { ConsultationBookingModal } from './components/ConsultationBookingModal';
import { MyConsultationsModal } from './components/MyConsultationsModal';
import { ExpertFallbackModal } from './components/ExpertFallbackModal';
import { Consultant, CanonicalConsultationCategory } from '../../types/consultation';
import {
  LAUNCH_CONSULTATION_PRICE_DISPLAY,
  mapCategoryToConsultantCategories,
} from '../../config/consultation';
import {
  HelpCircle,
  Clock,
  RefreshCw,
  SearchX,
  CheckCircle2,
  X,
  Users,
} from 'lucide-react';
import { consultationAnalytics } from '../../utils/consultationAnalytics';

export const ConsultationPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useCustomerAuthStore();
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
  const [bookingTopic, setBookingTopic] = useState<string | undefined>(undefined);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [fallbackTopic, setFallbackTopic] = useState("I'm not sure — help me choose");
  const [activeChoiceBanner, setActiveChoiceBanner] = useState<string | null>(null);

  const directoryRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consultationAnalytics.track({ eventName: 'consultation_page_viewed' });
  }, []);

  useEffect(() => {
    fetchConsultants();
  }, [fetchConsultants, activeCategory, searchQuery, selectedCity]);

  const scrollToDirectory = () => {
    directoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCategories = () => {
    categoriesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBookClick = (consultant: Consultant, topic?: string) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent('/consult'));
      return;
    }
    consultationAnalytics.track({
      eventName: 'consultation_booking_started',
      consultantId: consultant.id,
      consultantCategory: consultant.category,
      serviceId: topic,
    });
    setBookingConsultant(consultant);
    setBookingTopic(topic);
  };

  const handleSelectCategory = (categoryName: string) => {
    consultationAnalytics.track({
      eventName: 'consultation_category_clicked',
      category: categoryName,
    });
    setActiveCategory(categoryName);
    setSearchQuery('');
    if (categoryName !== 'ALL') {
      setActiveChoiceBanner(`Showing approved specialists for "${categoryName}".`);
    } else {
      setActiveChoiceBanner(null);
    }
    scrollToDirectory();
  };

  const handleSelectServiceExample = (categoryName: string, exampleTitle: string) => {
    consultationAnalytics.track({
      eventName: 'consultation_service_clicked',
      serviceId: exampleTitle,
      category: categoryName,
    });
    setActiveCategory(categoryName);
    setSearchQuery('');
    setActiveChoiceBanner(`Selected topic: "${exampleTitle}". Choose a verified specialist below.`);
    setBookingTopic(exampleTitle);
    scrollToDirectory();
  };

  const handleSelectPopularService = (serviceTitle: string, category: CanonicalConsultationCategory) => {
    consultationAnalytics.track({
      eventName: 'consultation_service_clicked',
      serviceId: serviceTitle,
      category,
    });
    // Filter to mapped specialists
    setActiveCategory(category);
    setSearchQuery('');
    setActiveChoiceBanner(`Popular Service: "${serviceTitle}". Select an approved expert to schedule.`);
    setBookingTopic(serviceTitle);

    // If an expert is already available in this category, pre-select first matching
    const mapped = mapCategoryToConsultantCategories(category);
    const candidate = consultants.find(
      (c) => c.category === category || mapped.includes(c.category)
    );

    if (candidate) {
      setBookingConsultant(candidate);
    } else {
      scrollToDirectory();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#1B3D34]">
      <SEO
        title="Consult Construction Experts — Verified Architects, Structural Engineers & Contractors | Hutty"
        description="Get practical guidance for your home construction—from planning and approvals to structure, materials and interiors. Verified independent professionals in Bangalore for a single fixed fee of ₹1,499."
      />

      {/* ── 1. HERO SECTION ── */}
      <ConsultationHero onFindExpertClick={scrollToCategories} />

      {/* ── 2. TRUST STRIP (4 ITEMS) ── */}
      <ConsultationTrustStrip />

      {/* ── 3. SIX CANONICAL CONSULTATION CATEGORIES ── */}
      <div ref={categoriesRef}>
        <ConsultationCategoriesGrid
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          onSelectServiceExample={handleSelectServiceExample}
        />
      </div>

      {/* ── 4. FOUR POPULAR CONSULTATION SERVICES ── */}
      <PopularConsultationsSection onSelectService={handleSelectPopularService} />

      {/* ── 5. EXPERT DIRECTORY SECTION ── */}
      <div ref={directoryRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 text-left">
        {/* Active Feedback Banner */}
        {activeChoiceBanner && (
          <div className="p-4 bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-[#1B3D34]">
            <div className="flex items-center gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{activeChoiceBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveChoiceBanner(null)}
              className="p-1 hover:bg-black/5 rounded cursor-pointer"
            >
              <X className="w-4 h-4 text-[#1B3D34]" />
            </button>
          </div>
        )}

        {/* Directory Header & Tracking Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28]">
              APPROVED PRACTITIONERS DIRECTORY
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] font-heading tracking-tight">
              Browse Available Construction Experts
            </h2>
            <p className="text-xs sm:text-sm text-[#687770]">
              Every listed professional is pre-vetted with certified credentials. Fixed fee of {LAUNCH_CONSULTATION_PRICE_DISPLAY} per consultation.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                setFallbackTopic("I'm not sure — help me choose");
                setShowFallbackModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-900 border border-emerald-300 rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>Match Me with an Expert</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="px-4 py-2.5 bg-white hover:bg-[#F8F8F6] text-xs font-bold text-[#1B3D34] border border-[#E3E8E2] rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#1B3D34]" />
              <span>Track My Consultation</span>
            </button>
          </div>
        </div>

        {/* ── Search & Filter Controls ── */}
        <ConsultationFilters
          selectedCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          totalResults={consultants.length}
        />

        {/* ── Cards Grid / Loading / Empty State ── */}
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
          <div className="bg-white p-10 sm:p-12 rounded-3xl border border-[#E3E8E2] text-center space-y-4 shadow-xs">
            <SearchX className="w-10 h-10 text-[#687770]/60 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#1B3D34] font-heading">
                No verified experts currently available for this selection
              </h3>
              <p className="text-xs text-[#687770] max-w-md mx-auto leading-relaxed">
                We couldn&apos;t find approved consultants matching &ldquo;{activeCategory !== 'ALL' ? activeCategory : searchQuery}&rdquo;.
                Tell us about your project and our advisory desk will match the right specialist.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('ALL');
                  setSearchQuery('');
                  setSelectedCity('ALL');
                }}
                className="px-4 py-2.5 bg-[#F8F8F6] hover:bg-[#E3E8E2] text-[#1B3D34] border border-[#E3E8E2] text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Clear All Filters
              </button>
              <button
                type="button"
                onClick={() => {
                  setFallbackTopic(
                    activeCategory !== 'ALL'
                      ? `Matching request for ${activeCategory}`
                      : searchQuery
                      ? `Search assistance: ${searchQuery}`
                      : "I'm not sure — help me choose"
                  );
                  setShowFallbackModal(true);
                }}
                className="hutty-btn-primary px-5 py-2.5 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Submit Project Question to Hutty</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultants.map((consultant) => (
              <ConsultantCard
                key={consultant.id}
                consultant={consultant}
                onBookClick={(c) => handleBookClick(c, bookingTopic)}
              />
            ))}
          </div>
        )}

        {/* ── 6. HOW CONSULTATION WORKS SECTION ── */}
        <div className="pt-8">
          <HowConsultationWorksSection />
        </div>

        {/* ── 7. NO-EXPERT-AVAILABLE FALLBACK SECTION ── */}
        <div className="pt-4">
          <FallbackHelpSection
            selectedCategory={activeCategory}
            onOpenFallbackModal={(t) => {
              if (t) setFallbackTopic(t);
              setShowFallbackModal(true);
            }}
          />
        </div>

        {/* ── 8. PROFESSIONAL REGISTRATION PROMO BANNER ── */}
        <div className="pt-4">
          <ProfessionalSignUpBanner />
        </div>
      </div>

      {/* ── BOOKING MODAL ── */}
      <ConsultationBookingModal
        isOpen={Boolean(bookingConsultant)}
        onClose={() => {
          setBookingConsultant(null);
          setBookingTopic(undefined);
        }}
        consultant={bookingConsultant}
        initialTopic={bookingTopic}
      />

      {/* ── HOMEOWNER CONSULTATIONS HISTORY MODAL ── */}
      <MyConsultationsModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      {/* ── FALLBACK ENQUIRY MODAL ── */}
      <ExpertFallbackModal
        isOpen={showFallbackModal}
        onClose={() => setShowFallbackModal(false)}
        initialTopic={fallbackTopic}
      />
    </div>
  );
};
