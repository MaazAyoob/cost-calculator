import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Building2,
  FileCheck,
  UploadCloud,
  Lock,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Sparkles,
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import {
  CANONICAL_CONSULTATION_CATEGORIES,
  CATEGORY_DETAILS,
  POPULAR_LOCATIONS,
  LAUNCH_CONSULTATION_PRICE_INR,
  LAUNCH_CONSULTATION_PRICE_DISPLAY,
} from '../../config/consultation';
import { useConsultationStore } from '../../store/useConsultationStore';
import { consultationAnalytics } from '../../utils/consultationAnalytics';

export const ProfessionalJoinPage: React.FC = () => {
  const navigate = useNavigate();
  const { submitProfessionalApplication } = useConsultationStore();

  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState<string>(CANONICAL_CONSULTATION_CATEGORIES[0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(8);
  const [city, setCity] = useState('Bangalore');
  const [serviceAreas, setServiceAreas] = useState<string[]>(['All Bangalore']);
  const [expertise, setExpertise] = useState<string>('Space Planning, Plan Review, BBMP Bylaws');
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [consultationModes, setConsultationModes] = useState<string[]>(['VIDEO', 'AUDIO']);
  const [proposedServices, setProposedServices] = useState('Drawing Review, Site Guidance, Quote Audit');
  const [proposedFeeINR, setProposedFeeINR] = useState<number>(LAUNCH_CONSULTATION_PRICE_INR);
  const [documentUrl, setDocumentUrl] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    fullName: string;
    category: string;
    status: string;
    createdAt: string;
  } | null>(null);

  React.useEffect(() => {
    consultationAnalytics.track({ eventName: 'consultation_pro_application_started' });
  }, []);

  const handleToggleServiceArea = (area: string) => {
    if (serviceAreas.includes(area)) {
      setServiceAreas(serviceAreas.filter((a) => a !== area));
    } else {
      setServiceAreas([...serviceAreas, area]);
    }
  };

  const handleToggleMode = (mode: string) => {
    if (consultationModes.includes(mode)) {
      if (consultationModes.length > 1) {
        setConsultationModes(consultationModes.filter((m) => m !== mode));
      }
    } else {
      setConsultationModes([...consultationModes, mode]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (!qualifications.trim()) {
      setErrorMessage('Please state your primary qualifications or degrees.');
      return;
    }

    if (!consentGiven) {
      setErrorMessage('Consent to Hutty verification and terms is required to apply.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        category,
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        qualifications: qualifications.trim(),
        licenseNumber: licenseNumber.trim() || null,
        experienceYears: Number(experienceYears) || 0,
        city: city.trim(),
        serviceAreas: serviceAreas.length > 0 ? serviceAreas : ['Bangalore'],
        expertise: expertise
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        portfolioLinks: portfolioLinks
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        consultationModes,
        proposedServices: proposedServices
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        proposedFeeINR: Number(proposedFeeINR) || LAUNCH_CONSULTATION_PRICE_INR,
        documents: documentUrl.trim()
          ? [{ type: 'CREDENTIAL_LINK', url: documentUrl.trim() }]
          : null,
        consentGiven,
      };

      const result = await submitProfessionalApplication(payload);
      const appRecord = result.data || result;
      setSubmittedData(appRecord);
      consultationAnalytics.track({
        eventName: 'consultation_pro_application_submitted',
        category,
        referenceId: appRecord?.id,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit application. Please check details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#1B3D34] pb-24">
      <SEO
        title="Join Hutty as a Construction Professional — Architect, Engineer & Contractor Network"
        description="Connect with genuine homeowners planning residential construction across Bangalore. Offer verified independent advisory consultations. Submit your application for review."
      />

      {/* Top Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 text-left">
        <button
          type="button"
          onClick={() => navigate('/consult')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#687770] hover:text-[#1B3D34] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Consultation Platform</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-left">
        {submittedData ? (
          /* Success Screen */
          <div className="bg-white rounded-3xl border border-[#E3E8E2] p-8 sm:p-12 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-700" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                APPLICATION SUBMITTED &bull; UNDER REVIEW
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] font-heading pt-1">
                Thank you, {submittedData.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                Your application to join the Hutty Professional Network has been received and recorded.
              </p>
            </div>

            {/* Reference Box */}
            <div className="p-5 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2] max-w-md mx-auto text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#687770]">Application Reference:</span>
                <span className="font-mono font-bold text-[#1B3D34]">{submittedData.id}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#687770]">Category:</span>
                <span className="font-semibold text-[#1B3D34]">{submittedData.category}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#687770]">Review Status:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Under Review
                </span>
              </div>
            </div>

            {/* Explanation Note */}
            <div className="p-4 bg-[rgba(27,61,52,0.04)] border border-[#1B3D34]/15 rounded-2xl max-w-lg mx-auto text-xs text-[#1B3D34] text-left space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>What happens next?</span>
              </div>
              <p className="text-[11px] text-[#687770] leading-relaxed">
                To protect homeowners, all applicants undergo administrative review of their credentials (such as Council of Architecture or municipal chartered licenses). You will receive an email update within 2-3 business days once your profile is verified and published to the public directory.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/consult')}
                className="hutty-btn-primary px-6 py-3 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Return to Consultation Directory</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <div className="space-y-8">
            {/* Header Card */}
            <div className="bg-white rounded-3xl border border-[#E3E8E2] p-8 sm:p-10 shadow-xs space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(27,61,52,0.08)] border border-[rgba(27,61,52,0.12)] text-[#1B3D34] text-xs font-bold uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>Professional Practitioner Registration</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[#1B3D34] tracking-tight font-heading">
                Apply to Join Hutty as a Construction Professional
              </h1>

              <p className="text-sm sm:text-base text-[#687770] leading-relaxed max-w-2xl">
                Join our verified network of residential architects, structural engineers, cost specialists, and contractors. Showcase your expertise to pre-screened homeowners seeking independent paid advisory.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#E3E8E2] text-xs text-[#1B3D34]">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Genuine Homeowners</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Fixed Launch Fee ({LAUNCH_CONSULTATION_PRICE_DISPLAY})</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Administrative Review Before Public Listing</span>
                </div>
              </div>
            </div>

            {/* Error alert */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">Application Submission Error</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Main Multi-Part Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Step 1: Personal & Contact Information */}
              <div className="bg-white rounded-3xl border border-[#E3E8E2] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 border-b border-[#E3E8E2] pb-3">
                  <span className="w-6 h-6 rounded-lg bg-[#1B3D34] text-white flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <h2 className="text-base font-bold text-[#1B3D34] font-heading">
                    Personal &amp; Contact Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#1B3D34]">
                      Full Name (as registered with professional body) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#687770] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ar. Ramesh Nambiar or Er. Sneha Kulkarni"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F8F6] border border-[#E3E8E2] rounded-xl text-xs sm:text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1B3D34]">
                      Professional Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#687770] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@practice.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F8F6] border border-[#E3E8E2] rounded-xl text-xs sm:text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1B3D34]">
                      Mobile Number (10 Digits) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#687770] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98XXXXXXXX"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F8F6] border border-[#E3E8E2] rounded-xl text-xs sm:text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:bg-white transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1B3D34]">
                      Primary City *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#687770] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F8F6] border border-[#E3E8E2] rounded-xl text-xs sm:text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#1B3D34] block">
                      Active Service Areas in Bangalore
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {POPULAR_LOCATIONS.map((loc) => {
                        const active = serviceAreas.includes(loc);
                        return (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => handleToggleServiceArea(loc)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#1B3D34] text-white border-[#1B3D34]'
                                : 'bg-[#F8F8F6] text-[#4B5563] border-[#E3E8E2] hover:bg-white'
                            }`}
                          >
                            {loc}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Category & Qualifications */}
              <div className="bg-white rounded-3xl border border-[#E3E8E2] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 border-b border-[#E3E8E2] pb-3">
                  <span className="w-6 h-6 rounded-lg bg-[#1B3D34] text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h2 className="text-base font-bold text-[#1B3D34] font-heading">
                    Specialty Category &amp; Credentials
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#1B3D34]">
                      Consultation Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#E3E8E2] rounded-xl text-xs sm:text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:bg-white transition-all font-semibold cursor-pointer"
                    >
                      {CANONICAL_CONSULTATION_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat} — {CATEGORY_DETAILS[cat].description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#1B3D34]">
                      Qualifications / Degrees *
                    </label>
                    <input
                      type="text"
                      required
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      placeholder="e.g. B.Arch (SPA Delhi), M.Tech Structural Engg (IISc), B.E. Civil"
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#E3E8E2] rounded-xl text-xs sm:text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1B3D34]">
                      License / Registration No. (if applicable)
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="e.g. CA/2012/54821 or BBMP/BL-4819"
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#E3E8E2] rounded-xl text-xs sm:text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:bg-white transition-all font-mono"
                    />
                    <p className="text-[10px] text-[#687770]">
                      Required for Council of Architecture or Chartered Engineers; optional for interior specialists.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1B3D34]">
                      Years in Active Practice *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={60}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#E3E8E2] rounded-xl text-xs sm:text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Practice & Services */}
              <div className="bg-white rounded-3xl border border-[#E3E8E2] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 border-b border-[#E3E8E2] pb-3">
                  <span className="w-6 h-6 rounded-lg bg-[#1B3D34] text-white flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h2 className="text-base font-bold text-[#1B3D34] font-heading">
                    Expertise &amp; Consultation Offerings
                  </h2>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1B3D34]">
                      Areas of Expertise (comma separated) *
                    </label>
                    <input
                      type="text"
                      required
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      placeholder="e.g. Bespoke Villa Design, Vastu Space Planning, BBMP Setbacks, RCC Detail"
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#E3E8E2] rounded-xl text-xs sm:text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1B3D34]">
                      Proposed Consultation Services (comma separated)
                    </label>
                    <input
                      type="text"
                      value={proposedServices}
                      onChange={(e) => setProposedServices(e.target.value)}
                      placeholder="e.g. Plan Audit, Foundation Review, Contractor Quote Sanity Check"
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#E3E8E2] rounded-xl text-xs sm:text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1B3D34] block">
                      Supported Consultation Modes *
                    </label>
                    <div className="flex flex-wrap gap-3 pt-1">
                      {[
                        { id: 'VIDEO', label: 'Online Video Session' },
                        { id: 'AUDIO', label: 'Audio / Phone Call' },
                        { id: 'IN_PERSON', label: 'Site Inspection (Bangalore)' },
                      ].map((m) => {
                        const active = consultationModes.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleToggleMode(m.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#1B3D34] text-white border-[#1B3D34]'
                                : 'bg-[#F8F8F6] text-[#4B5563] border-[#E3E8E2] hover:bg-white'
                            }`}
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1B3D34]">
                      Portfolio / Work Sample Links (comma separated)
                    </label>
                    <input
                      type="text"
                      value={portfolioLinks}
                      onChange={(e) => setPortfolioLinks(e.target.value)}
                      placeholder="e.g. https://instagram.com/myarchitecture, https://behance.net/..."
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F6] border border-[#E3E8E2] rounded-xl text-xs sm:text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1B3D34]">
                      Verification Document Link (Google Drive / Portfolio PDF)
                    </label>
                    <div className="relative">
                      <UploadCloud className="w-4 h-4 text-[#687770] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={documentUrl}
                        onChange={(e) => setDocumentUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/... or public credential document link"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F8F6] border border-[#E3E8E2] rounded-xl text-xs sm:text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:bg-white transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-[#687770]">
                      Private access: Verification documents are strictly reviewed by Hutty staff and never shared with homeowners.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4: Verification Consent & Terms */}
              <div className="bg-white rounded-3xl border border-[#E3E8E2] p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consentCheckbox"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#1B3D34] focus:ring-[#1B3D34] border-gray-300 cursor-pointer"
                  />
                  <label htmlFor="consentCheckbox" className="text-xs text-[#4B5563] leading-relaxed cursor-pointer">
                    I confirm that the details, qualifications, and credentials provided above are genuine. I agree to Hutty&apos;s professional vetting process, independent advisory code of conduct, and privacy policy. I understand that submitting this application does not automatically list me publicly until authorized admin review is complete.
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="text-xs text-[#687770]">
                  Takes ~3 minutes to submit &bull; Hutty review within 2-3 business days
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="hutty-btn-primary px-8 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer active:scale-[0.98] w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Professional Application</span>
                      <ArrowRight className="w-4 h-4 text-[#F28C28]" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
};
