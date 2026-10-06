import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Building,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Consultant, ConsultationRequest } from '../../../types/consultation';
import {
  LAUNCH_CONSULTATION_PRICE_INR,
  LAUNCH_CONSULTATION_PRICE_DISPLAY,
  LAUNCH_CONSULTATION_TOPICS,
} from '../../../config/consultation';
import { useConsultationStore } from '../../../store/useConsultationStore';
import { useSavedEstimationsStore } from '../../../store/useSavedEstimationsStore';
import { useCalculationStore } from '../../../store/useCalculationStore';
import { useWizardStore } from '../../../store/useWizardStore';
import { formatCurrency } from '../../../utils/cn';

interface ConsultationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultant: Consultant | null;
}

export const ConsultationBookingModal: React.FC<ConsultationBookingModalProps> = ({
  isOpen,
  onClose,
  consultant,
}) => {
  const { submitBooking, verifyPayment, isSubmittingBooking } = useConsultationStore();
  const { savedEstimations } = useSavedEstimationsStore();
  const { result } = useCalculationStore();
  const wizard = useWizardStore();

  // Wizard Steps: 1: Details, 2: Project Link (Optional), 3: Review & Pay, 4: Confirmed
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [homeownerName, setHomeownerName] = useState('');
  const [homeownerPhone, setHomeownerPhone] = useState('');
  const [homeownerEmail, setHomeownerEmail] = useState('');
  const [consultationTopic, setConsultationTopic] = useState<string>(LAUNCH_CONSULTATION_TOPICS[0]);
  const [projectLocation, setProjectLocation] = useState('Bangalore');
  const [projectType, setProjectType] = useState('Independent Villa / House');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('10:00 AM - 12:00 PM');
  const [message, setMessage] = useState('');

  // Project Linking
  const [linkedProjectId, setLinkedProjectId] = useState<string | null>(null);
  const [linkProjectChoice, setLinkProjectChoice] = useState<'none' | 'saved' | 'current'>('none');

  // Confirmation result
  const [confirmedRequest, setConfirmedRequest] = useState<ConsultationRequest | null>(null);

  // Set min date to tomorrow
  const tomorrowStr = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMessage(null);
      setPreferredDate(tomorrowStr);
      // Pre-fill location from consultant city or wizard
      if (wizard.city) setProjectLocation(wizard.city);
    }
  }, [isOpen, tomorrowStr, wizard.city]);

  if (!isOpen || !consultant) return null;

  // Handle Project Linking selection
  const handleSelectSavedProject = (projectId: string) => {
    setLinkedProjectId(projectId);
    setLinkProjectChoice('saved');
    const selected = savedEstimations.find((e) => e.id === projectId);
    if (selected) {
      if (selected.city) setProjectLocation(selected.city);
      if (selected.wizardState?.houseType) setProjectType(selected.wizardState.houseType);
    }
  };

  const handleSelectCurrentProject = () => {
    setLinkedProjectId(result.report?.projectId || 'current-workspace-project');
    setLinkProjectChoice('current');
    if (wizard.city) setProjectLocation(wizard.city);
    if (wizard.houseType) setProjectType(wizard.houseType);
  };

  const handleClearProjectLink = () => {
    setLinkedProjectId(null);
    setLinkProjectChoice('none');
  };

  // Form Validation for Step 1
  const validateStep1 = () => {
    if (!homeownerName.trim() || homeownerName.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return false;
    }
    const cleanPhone = homeownerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!homeownerEmail.includes('@') || !homeownerEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (!preferredDate) {
      setErrorMessage('Please select your preferred date.');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  // Proceed to Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setStep(2);
  };

  // Handle Final Payment & Request Submission
  const handleInitiatePaymentAndSubmit = async () => {
    setErrorMessage(null);
    try {
      // 1. Submit booking details to backend (Strictly resolves to ₹1,499)
      const bookingData = await submitBooking({
        consultantId: consultant.id,
        homeownerName: homeownerName.trim(),
        homeownerPhone: homeownerPhone.trim(),
        homeownerEmail: homeownerEmail.toLowerCase().trim(),
        projectId: linkedProjectId,
        projectLocation: projectLocation.trim(),
        projectType: projectType.trim(),
        consultationTopic,
        message: message.trim() || null,
        preferredDate,
        preferredTime,
      });

      const { request, payment, razorpayOptions } = bookingData;

      // 2. Razorpay Checkout Flow
      // Check if Razorpay client SDK is available in the window
      const hasRazorpay = typeof (window as any).Razorpay !== 'undefined';

      if (hasRazorpay && razorpayOptions?.keyId && !razorpayOptions.keyId.includes('mock')) {
        const rzp = new (window as any).Razorpay({
          key: razorpayOptions.keyId,
          amount: razorpayOptions.amount,
          currency: razorpayOptions.currency,
          name: razorpayOptions.name,
          description: razorpayOptions.description,
          order_id: razorpayOptions.orderId,
          prefill: razorpayOptions.prefill,
          theme: { color: '#1B3D34' },
          handler: async (response: any) => {
            try {
              const verified = await verifyPayment(request.id, {
                gatewayOrderId: response.razorpay_order_id || payment.gatewayOrderId,
                gatewayPaymentId: response.razorpay_payment_id,
                gatewaySignature: response.razorpay_signature,
              });
              setConfirmedRequest(verified);
              setStep(4);
            } catch (err: any) {
              setErrorMessage(err.message || 'Payment verification failed.');
            }
          },
          modal: {
            ondismiss: () => {
              setErrorMessage('Payment was cancelled. You can retry whenever ready.');
            },
          },
        });
        rzp.open();
      } else {
        // Development Sandbox / Direct Verification
        // In local development or test environment, simulate the verified gateway callback with real backend signature validation
        const simulatedPaymentId = `pay_sim_${Date.now()}`;
        const verified = await verifyPayment(request.id, {
          gatewayOrderId: payment.gatewayOrderId,
          gatewayPaymentId: simulatedPaymentId,
        });
        setConfirmedRequest(verified);
        setStep(4);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while booking. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1B3D34]/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl p-5 sm:p-8 max-w-2xl w-full shadow-2xl border border-[#E5E7EB] my-8 text-left space-y-6 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E5E7EB]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28]">
                HUTTY EXPERT CONSULTATION
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1B3D34]/10 text-[#1B3D34]">
                Phase 1 MVP
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B3D34] mt-1 font-heading">
              {step === 4 ? 'Consultation Request Received' : `Book Consultation with ${consultant.name}`}
            </h2>
            <p className="text-xs text-[#4B5563] mt-0.5">
              {consultant.title} · {consultant.category}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#F8F8F6] text-[#4B5563] hover:text-[#1B3D34] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        {step !== 4 && (
          <div className="flex items-center justify-between text-xs font-bold text-[#4B5563] bg-[#F8F8F6] p-2.5 rounded-xl border border-[#E5E7EB]">
            <span className={step === 1 ? 'text-[#1B3D34]' : ''}>1. Consultation Details</span>
            <span>→</span>
            <span className={step === 2 ? 'text-[#1B3D34]' : ''}>2. Optional Project Link</span>
            <span>→</span>
            <span className={step === 3 ? 'text-[#1B3D34]' : ''}>3. Review &amp; Pay {LAUNCH_CONSULTATION_PRICE_DISPLAY}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-500 font-bold">×</button>
          </div>
        )}

        {/* ── STEP 1: CONSULTATION DETAILS ── */}
        {step === 1 && (
          <form onSubmit={handleProceedToStep2} className="space-y-4">
            {/* Consultant Quick Summary Bar */}
            <div className="flex items-center gap-3 p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-[#E5E7EB]">
                {consultant.profileImage ? (
                  <img src={consultant.profileImage} alt={consultant.name} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-[#1B3D34]">
                    {consultant.name.slice(0, 2)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <span className="font-bold text-[#1B3D34] block truncate">{consultant.name}</span>
                <span className="text-[#4B5563] block truncate">{consultant.specializations.slice(0, 2).join(' · ')}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-[#4B5563] block">Fixed Fee</span>
                <span className="font-mono font-bold text-sm text-[#1B3D34]">{LAUNCH_CONSULTATION_PRICE_DISPLAY}</span>
              </div>
            </div>

            {/* Required Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#1B3D34] block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#4B5563] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={homeownerName}
                    onChange={(e) => setHomeownerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3D34]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1B3D34] block mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#4B5563] absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={homeownerPhone}
                    onChange={(e) => setHomeownerPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3D34]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1B3D34] block mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#4B5563] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={homeownerEmail}
                  onChange={(e) => setHomeownerEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3D34]"
                />
              </div>
              <span className="text-[10px] text-[#4B5563] mt-0.5 block">
                Appointment review updates and schedule links will be sent here.
              </span>
            </div>

            {/* Consultation Topic & Project Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#1B3D34] block mb-1">
                  Consultation Topic <span className="text-red-500">*</span>
                </label>
                <select
                  value={consultationTopic}
                  onChange={(e) => setConsultationTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3D34] bg-white cursor-pointer"
                >
                  {LAUNCH_CONSULTATION_TOPICS.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1B3D34] block mb-1">
                  Project Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  placeholder="e.g. Independent Villa, Duplex, G+3"
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3D34]"
                />
              </div>
            </div>

            {/* Location & Preferred Date/Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#1B3D34] block mb-1">
                  Project Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#4B5563] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                    placeholder="e.g. Indiranagar, Bangalore"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3D34]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1B3D34] block mb-1">
                  Preferred Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={tomorrowStr}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3D34] bg-white cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1B3D34] block mb-1">
                  Preferred Time Slot <span className="text-red-500">*</span>
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3D34] bg-white cursor-pointer"
                >
                  <option value="10:00 AM - 12:00 PM">Morning (10:00 AM – 12:00 PM)</option>
                  <option value="02:00 PM - 04:00 PM">Afternoon (02:00 PM – 04:00 PM)</option>
                  <option value="05:00 PM - 07:00 PM">Evening (05:00 PM – 07:00 PM)</option>
                </select>
              </div>
            </div>

            {/* Additional Message */}
            <div>
              <label className="text-xs font-bold text-[#1B3D34] block mb-1">
                Additional Questions / Specific Notes <span className="text-[#4B5563] font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mention specific concerns, e.g. 'Need structural review of our 30x40 G+2 slab thickness' or 'Review contractor quotation timeline'..."
                className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3D34] resize-none"
              />
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 flex items-center justify-between">
              <span className="text-[11px] text-[#4B5563]">Step 1 of 3</span>
              <button
                type="submit"
                className="hutty-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Project Link</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: OPTIONAL PROJECT LINKING ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#1B3D34] font-heading">
                Link a Hutty Project <span className="text-[#4B5563] font-normal text-xs">(Optional)</span>
              </h3>
              <p className="text-xs text-[#4B5563] mt-1">
                If you have an existing cost calculation or estimation in Hutty, you can link it so the expert can review
                your area and budget summary. You can also proceed without linking any project.
              </p>
            </div>

            {/* Current Session Project Option */}
            {result.area?.totalBUASqFt && result.area.totalBUASqFt > 0 ? (
              <div
                onClick={handleSelectCurrentProject}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  linkProjectChoice === 'current'
                    ? 'border-[#1B3D34] bg-emerald-50/50 ring-1 ring-[#1B3D34]'
                    : 'border-[#E5E7EB] bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#1B3D34]" />
                    <span className="text-xs font-bold text-[#1B3D34]">
                      Current Calculator Workspace ({wizard.houseType || 'Residential'})
                    </span>
                  </div>
                  {linkProjectChoice === 'current' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#E5E7EB]/70 text-xs">
                  <div>
                    <span className="text-[10px] text-[#4B5563] block">Built-Up Area</span>
                    <strong className="text-[#1B3D34]">{result.area.totalBUASqFt} sq.ft</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#4B5563] block">Estimated Cost</span>
                    <strong className="text-[#1B3D34] font-mono">{formatCurrency(result.budget.totalProjectCost || 0)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#4B5563] block">Floors</span>
                    <strong className="text-[#1B3D34]">{wizard.floors} floors</strong>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Saved Estimations List Option */}
            {savedEstimations && savedEstimations.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#1B3D34] block">Saved Estimations:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {savedEstimations.map((est) => {
                    const isSelected = linkProjectChoice === 'saved' && linkedProjectId === est.id;
                    return (
                      <div
                        key={est.id}
                        onClick={() => handleSelectSavedProject(est.id)}
                        className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#1B3D34] bg-emerald-50/50 ring-1 ring-[#1B3D34]'
                            : 'border-[#E5E7EB] bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[#1B3D34]">
                          <span className="truncate">{est.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </div>
                        <div className="text-[11px] text-[#4B5563] mt-1 flex justify-between">
                          <span>{est.buaSqFt} sq.ft</span>
                          <span className="font-mono font-semibold">{formatCurrency(est.totalCost)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Option to Continue Without a Project */}
            <div
              onClick={handleClearProjectLink}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                linkProjectChoice === 'none'
                  ? 'border-[#1B3D34] bg-emerald-50/50 ring-1 ring-[#1B3D34]'
                  : 'border-[#E5E7EB] bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-[#1B3D34] block">Continue without linking a project</span>
                <span className="text-[11px] text-[#4B5563]">
                  I don't have a saved calculation or prefer to discuss my requirements directly.
                </span>
              </div>
              {linkProjectChoice === 'none' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            </div>

            {/* Step 2 Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4B5563] hover:text-[#1B3D34] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="hutty-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Review &amp; Pay {LAUNCH_CONSULTATION_PRICE_DISPLAY}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: REVIEW & PAY ── */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Booking Summary Card */}
            <div className="bg-[#F8F8F6] p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                <span className="text-[#4B5563]">Selected Expert:</span>
                <strong className="text-[#1B3D34] text-sm">{consultant.name} ({consultant.category})</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#4B5563]">Homeowner:</span>
                <span className="font-semibold text-[#1B3D34]">{homeownerName} ({homeownerPhone})</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#4B5563]">Email:</span>
                <span className="font-semibold text-[#1B3D34]">{homeownerEmail}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#4B5563]">Consultation Topic:</span>
                <span className="font-semibold text-[#1B3D34]">{consultationTopic}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#4B5563]">Preferred Schedule:</span>
                <span className="font-semibold text-[#1B3D34]">
                  {preferredDate} ({preferredTime})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#4B5563]">Linked Project:</span>
                <span className="font-semibold text-[#1B3D34]">
                  {linkedProjectId ? 'Hutty Project Snapshot Attached' : 'None (Standalone Consultation)'}
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between text-sm">
                <span className="font-bold text-[#1B3D34]">Total Consultation Fee:</span>
                <span className="font-mono font-extrabold text-base text-[#1B3D34]">
                  {LAUNCH_CONSULTATION_PRICE_DISPLAY}
                </span>
              </div>
            </div>

            {/* MANDATORY DISCLAIMER AS REQUESTED */}
            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Important Scheduling Policy</span>
              </div>
              <p className="leading-relaxed">
                <strong>Payment confirms your consultation request</strong>, but the appointment is confirmed
                only after Hutty reviews and schedules it. Our administrative team will verify expert availability
                and send your confirmed schedule invitation.
              </p>
            </div>

            {/* Step 3 Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmittingBooking}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4B5563] hover:text-[#1B3D34] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleInitiatePaymentAndSubmit}
                disabled={isSubmittingBooking}
                className="hutty-btn-primary px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>{isSubmittingBooking ? 'Securing Request...' : `Pay ${LAUNCH_CONSULTATION_PRICE_DISPLAY} Online`}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: REQUEST CONFIRMATION ── */}
        {step === 4 && confirmedRequest && (
          <div className="space-y-6 text-center py-2 animate-in fade-in duration-300">
            {/* Green Success Badge */}
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-700" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                Paid — Awaiting Admin Review
              </span>
              <h3 className="text-2xl font-extrabold text-[#1B3D34] mt-3 font-heading">
                Consultation Request Received
              </h3>
              <p className="text-xs sm:text-sm text-[#4B5563] mt-2 max-w-md mx-auto leading-relaxed">
                Your payment has been received. Our team will review your request and assign the appropriate expert.
                Your consultation time will be confirmed separately.
              </p>
            </div>

            {/* Confirmation Dossier Card */}
            <div className="bg-[#F8F8F6] rounded-2xl p-5 border border-[#E5E7EB] text-left text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                <span className="text-[#4B5563]">Reference ID:</span>
                <span className="font-mono font-bold text-[#1B3D34]">{confirmedRequest.publicReference}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#4B5563]">Expert:</span>
                <strong className="text-[#1B3D34]">{consultant.name}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#4B5563]">Amount Paid:</span>
                <span className="font-mono font-bold text-emerald-800">{LAUNCH_CONSULTATION_PRICE_DISPLAY}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#4B5563]">Status:</span>
                <span className="font-bold text-[#F28C28]">Paid — Awaiting Admin Review</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#4B5563]">Preferred Schedule:</span>
                <span className="font-semibold text-[#1B3D34]">
                  {confirmedRequest.preferredDate} ({confirmedRequest.preferredTime})
                </span>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] text-xs text-[#4B5563] text-left space-y-1.5 max-w-md mx-auto">
              <strong className="text-[#1B3D34] block">What happens next?</strong>
              <p>1. Hutty Admin reviews your topic and verifies expert availability.</p>
              <p>2. You will receive an email confirmation with the scheduled video/call link.</p>
              <p>3. If any schedule conflict arises, our team will propose alternative convenient slots.</p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="hutty-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close &amp; Return to Directory
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
