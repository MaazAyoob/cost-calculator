import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileText,
  UserX,
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { consultationApi } from '../../services/consultationApi';
import { Consultant } from '../../types/consultation';
import {
  LAUNCH_CONSULTATION_PRICE_DISPLAY,
  LAUNCH_CONSULTATION_PRICE_INR,
  CURATED_INITIAL_CONSULTANTS,
} from '../../config/consultation';
import { ConsultationBookingModal } from './components/ConsultationBookingModal';

export const ConsultantProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setNotFound(false);

    consultationApi
      .getConsultantBySlug(slug)
      .then((data) => {
        if (!isMounted) return;
        if (!data || !data.active) {
          const fallback = CURATED_INITIAL_CONSULTANTS.find((c) => c.slug === slug);
          if (fallback) {
            setConsultant(fallback as unknown as Consultant);
          } else {
            setNotFound(true);
          }
        } else {
          setConsultant(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          const fallback = CURATED_INITIAL_CONSULTANTS.find((c) => c.slug === slug);
          if (fallback) {
            setConsultant(fallback as unknown as Consultant);
          } else {
            setNotFound(true);
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-[#F8F8F6]">
        <div className="w-10 h-10 border-3 border-[#1B3D34] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#4B5563] font-medium">Loading Expert Profile...</p>
      </div>
    );
  }

  if (notFound || !consultant) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#F8F8F6]">
        <div className="max-w-md w-full p-8 bg-white border border-[#E3E8E2] rounded-3xl shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F8F8F6] border border-[#E3E8E2] flex items-center justify-center mx-auto text-[#4B5563]">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1B3D34] font-heading">
              Expert Not Available
            </h2>
            <p className="text-xs text-[#4B5563] mt-1.5 leading-relaxed">
              This professional profile is either inactive or does not exist. Please return to the consultant directory
              to view currently active experts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/consult')}
            className="hutty-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse All Experts</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#1B3D34] pb-24">
      <SEO
        title={`${consultant.name} — ${consultant.title} | Hutty Consultation`}
        description={consultant.about.slice(0, 160)}
      />

      {/* Top Breadcrumb & Back Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button
          type="button"
          onClick={() => navigate('/consult')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#4B5563] hover:text-[#1B3D34] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Experts</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Main Dossier */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Overview Card */}
            <div className="bg-white rounded-3xl border border-[#E3E8E2] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Photo */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-[#F8F8F6] border border-[#E3E8E2] shrink-0">
                  {consultant.profileImage ? (
                    <img
                      src={consultant.profileImage}
                      alt={consultant.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-[#1B3D34]">
                      {consultant.name.slice(0, 2)}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[rgba(27,61,52,0.08)] text-[#1B3D34] border border-[rgba(27,61,52,0.12)]">
                      {consultant.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Hutty Verified</span>
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] font-heading">
                    {consultant.name}
                  </h1>

                  <p className="text-sm font-semibold text-[#4B5563]">
                    {consultant.title}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#4B5563] pt-1">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-[#1B3D34]/70" />
                      <span>{consultant.experienceYears}+ Years Practical Experience</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#1B3D34]/70" />
                      <span>{consultant.city}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              {consultant.serviceAreas && consultant.serviceAreas.length > 0 && (
                <div className="pt-4 border-t border-[#E3E8E2] text-xs">
                  <span className="font-bold text-[#1B3D34] block mb-1">Service Areas &amp; Site Visits:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {consultant.serviceAreas.map((area, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-[#F8F8F6] border border-[#E3E8E2] text-[#4B5563]">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* About & Philosophy Card */}
            <div className="bg-white rounded-3xl border border-[#E3E8E2] p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-[#1B3D34] font-heading">
                About the Expert
              </h3>
              <p className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-line">
                {consultant.about}
              </p>
            </div>

            {/* Specializations & Core Competencies */}
            {consultant.specializations && consultant.specializations.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#E3E8E2] p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#1B3D34] font-heading">
                  Specializations &amp; Advisory Focus
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {consultant.specializations.map((spec, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2] text-xs font-semibold text-[#1B3D34] flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Offered Card */}
            {consultant.services && consultant.services.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#E3E8E2] p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#1B3D34] font-heading">
                  Consultation Services Covered
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#4B5563]">
                  {consultant.services.map((svc, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28] mt-2 shrink-0" />
                      <span>{svc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Col: Fixed Fee & Booking Card (Sticky) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#E3E8E2] p-6 sm:p-7 shadow-sm sticky top-24 space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28]">
                  TRANSPARENT PRICING
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-extrabold text-[#1B3D34]">
                    {LAUNCH_CONSULTATION_PRICE_DISPLAY}
                  </span>
                  <span className="text-xs text-[#4B5563]">/ consultation</span>
                </div>
                <p className="text-xs text-[#4B5563] mt-1">
                  Flat launch rate. No hidden platform surcharges or commissions.
                </p>
              </div>

              {/* Consultation Inclusions */}
              <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#1B3D34] font-semibold">
                  <Clock className="w-3.5 h-3.5 text-[#1B3D34]" />
                  <span>45–60 Minutes Focused Advisory</span>
                </div>
                <div className="flex items-center gap-2 text-[#1B3D34] font-semibold">
                  <FileText className="w-3.5 h-3.5 text-[#1B3D34]" />
                  <span>Drawing / BOQ Review Included</span>
                </div>
                <div className="flex items-center gap-2 text-[#1B3D34] font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-[#1B3D34]" />
                  <span>Flexible Date &amp; Time Slots</span>
                </div>
              </div>

              {/* Booking CTA */}
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full hutty-btn-primary py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Book Consultation</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>

              {/* Reassurance Disclaimer */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <strong className="block">Scheduling Note:</strong>
                <span>
                  Payment confirms your consultation request. The exact appointment is confirmed once Hutty reviews and schedules it.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Booking CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E3E8E2] p-3.5 shadow-lg flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#4B5563] uppercase block">Fee</span>
          <span className="text-base font-extrabold text-[#1B3D34] font-mono leading-tight">
            {LAUNCH_CONSULTATION_PRICE_DISPLAY}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsBookingModalOpen(true)}
          className="hutty-btn-primary px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
        >
          <span>Book Consultation — {LAUNCH_CONSULTATION_PRICE_DISPLAY}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
        </button>
      </div>

      {/* Booking Modal */}
      <ConsultationBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        consultant={consultant}
      />
    </div>
  );
};

