import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Loader2, HelpCircle, Phone, Mail, User, MapPin } from 'lucide-react';
import { getApiUrl } from '../../../config/api';
import { modalScaleVariant } from '../../../animations/variants';

interface ExpertFallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

const REASONS = [
  "Check my contractor's quote",
  "Find an architect or engineer",
  "Get help with a problem at my site",
  "I'm not sure — help me choose",
];

export const ExpertFallbackModal: React.FC<ExpertFallbackModalProps> = ({
  isOpen,
  onClose,
  initialTopic = REASONS[3],
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(initialTopic);
  const [city, setCity] = useState('Bangalore');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationRef, setConfirmationRef] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setConfirmationRef(null);
      if (initialTopic) setTopic(initialTopic);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialTopic]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setErrorMessage('Please provide a brief description of your question (at least 5 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(getApiUrl('/consultations/enquiries'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          email: email.trim().toLowerCase(),
          topic,
          message: message.trim(),
          city: city.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || 'Failed to submit enquiry.');
      }

      setConfirmationRef(json.reference || json.data?.reference || 'HT-ENQ-SUBMITTED');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not connect to Hutty enquiry desk. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="expert-fallback-portal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto select-none"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-[#1B3D34]/50 backdrop-blur-xs"
            aria-hidden="true"
          />

          <motion.div
            variants={modalScaleVariant}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E3E8E2] my-8 text-left space-y-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E3E8E2]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28] block">
                  TALK TO A HUTTY EXPERT &bull; DIRECT ASSISTANCE
                </span>
                <h2 className="text-xl font-bold text-[#1B3D34] mt-1 font-heading">
                  {confirmationRef ? 'Enquiry Confirmed' : 'Request Expert Guidance'}
                </h2>
                <p className="text-xs text-[#4B5563] mt-0.5">
                  {confirmationRef
                    ? 'Our senior engineering review desk has received your request.'
                    : 'Tell us about your project question and our team will match you with the right specialist.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-[#4B5563] hover:text-[#1B3D34] hover:bg-black/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {confirmationRef ? (
              /* Genuine Confirmation State */
              <div className="space-y-5 py-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Reference: {confirmationRef}
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      Your request is recorded with our senior desk. A specialist will review your question and reach out within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#F8F8F6] border border-[#E3E8E2] rounded-2xl text-xs space-y-2 text-[#4B5563]">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span>Name:</span>
                    <strong className="text-[#1B3D34]">{name}</strong>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span>Phone:</span>
                    <strong className="text-[#1B3D34]">{phone}</strong>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span>Topic:</span>
                    <strong className="text-[#1B3D34]">{topic}</strong>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span>Location:</span>
                    <strong className="text-[#1B3D34]">{city}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-[#1B3D34] text-white rounded-xl text-xs font-bold hover:bg-[#2A5C4E] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Request Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1B3D34] block">How can we help you?</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E3E8E2] rounded-xl text-xs text-[#1B3D34] bg-white focus:outline-none focus:border-[#1B3D34]"
                  >
                    {REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#1B3D34] block">Your Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#4B5563] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full pl-9 pr-3 py-2 border border-[#E3E8E2] rounded-xl text-xs text-[#1B3D34] focus:outline-none focus:border-[#1B3D34]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#1B3D34] block">Mobile Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#4B5563] absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile"
                        className="w-full pl-9 pr-3 py-2 border border-[#E3E8E2] rounded-xl text-xs text-[#1B3D34] focus:outline-none focus:border-[#1B3D34]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#1B3D34] block">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#4B5563] absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2 border border-[#E3E8E2] rounded-xl text-xs text-[#1B3D34] focus:outline-none focus:border-[#1B3D34]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#1B3D34] block">Project City / Area</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#4B5563] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bangalore (Whitefield)"
                        className="w-full pl-9 pr-3 py-2 border border-[#E3E8E2] rounded-xl text-xs text-[#1B3D34] focus:outline-none focus:border-[#1B3D34]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1B3D34] block">
                    Your Question / Project Summary
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Briefly describe your site location, drawings available, or contractor quote doubt..."
                    className="w-full p-3 border border-[#E3E8E2] rounded-xl text-xs text-[#1B3D34] focus:outline-none focus:border-[#1B3D34] resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#1B3D34] text-white rounded-xl text-xs font-bold hover:bg-[#2A5C4E] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#F28C28]" />
                        <span>Submitting to Engineering Desk...</span>
                      </>
                    ) : (
                      <span>Submit Request &bull; 24 hr Response</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
