// ==============================================================================
// Hutty Phone OTP Verification Modal
// Accessible, Production-Ready SMS OTP Verification Dialog
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldCheck,
  Smartphone,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Edit2,
  Lock,
} from 'lucide-react';
import { otpApi } from '../../services/otpApi';
import { normalizeIndianPhoneNumber } from '../../utils/phone';
import { modalScaleVariant, backdropFadeVariant } from '../../animations/variants';

interface PhoneOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  purpose: 'SIGNUP' | 'CONSULTATION_BOOKING';
  onVerified: (verificationToken: string, normalizedPhone: string) => void;
  onEditPhone?: () => void;
}

export const PhoneOtpModal: React.FC<PhoneOtpModalProps> = ({
  isOpen,
  onClose,
  phone,
  purpose,
  onVerified,
  onEditPhone,
}) => {
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [expiresIn, setExpiresIn] = useState<number>(300);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Challenge expiry countdown
  useEffect(() => {
    if (expiresIn <= 0) return;
    const interval = setInterval(() => {
      setExpiresIn((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresIn]);

  // Request OTP when modal opens with a valid phone number
  useEffect(() => {
    if (isOpen && phone) {
      setOtpDigits(['', '', '', '', '', '']);
      setErrorMessage(null);
      setSuccessMessage(null);
      setAttemptsRemaining(null);
      handleInitialSend();
    }
  }, [isOpen, phone, purpose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleInitialSend = async () => {
    const norm = normalizeIndianPhoneNumber(phone);
    if (!norm.isValid) {
      setErrorMessage(norm.error || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      const res = await otpApi.sendOtp(norm.e164, purpose);
      setChallengeId(res.challengeId);
      setMaskedPhone(res.maskedPhone);
      setResendCooldown(res.resendAvailableInSeconds || 60);
      setExpiresIn(res.expiresInSeconds || 300);
      // Focus first input box after send
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !challengeId) return;

    setIsSending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await otpApi.resendOtp(challengeId);
      setResendCooldown(res.resendAvailableInSeconds || 60);
      setExpiresIn(res.expiresInSeconds || 300);
      setSuccessMessage('A new verification code has been sent via SMS.');
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend OTP.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    // If user pasted a 6-digit code
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = cleaned[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(cleaned.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const singleDigit = cleaned.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = singleDigit;
    setOtpDigits(newDigits);
    setErrorMessage(null);

    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullOtp = otpDigits.join('');

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!challengeId) {
      setErrorMessage('Verification session expired. Please request a new OTP.');
      return;
    }

    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await otpApi.verifyOtp(challengeId, fullOtp);
      const norm = normalizeIndianPhoneNumber(phone);
      setSuccessMessage('Phone number verified successfully!');
      setTimeout(() => {
        onVerified(res.verificationToken, norm.e164);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Incorrect OTP.');
      if (typeof err.attemptsRemaining === 'number') {
        setAttemptsRemaining(err.attemptsRemaining);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const norm = normalizeIndianPhoneNumber(phone);
  const displayPhone = maskedPhone || norm.masked || phone;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            variants={backdropFadeVariant}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            variants={modalScaleVariant}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#D5E1D8] overflow-hidden z-10 my-auto text-left"
          >
            {/* Header bar */}
            <div className="bg-[#1B3D34] text-white p-6 relative">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close verification modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#F28C28]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight font-heading text-white">
                    Verify Your Mobile
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    {purpose === 'SIGNUP' ? 'Complete Account Creation' : 'Secure Consultation Booking'}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-7 space-y-5">
              {/* Phone target indicator & edit option */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F9F8] border border-[#E2E8E3]">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-[#1B3D34]" />
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#687770] block">
                      Code sent to
                    </span>
                    <span className="text-sm font-bold text-[#1B3D34] font-mono">
                      {displayPhone}
                    </span>
                  </div>
                </div>

                {onEditPhone && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditPhone();
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[#1B3D34] hover:text-[#F28C28] hover:underline transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-medium">{errorMessage}</p>
                    {attemptsRemaining !== null && attemptsRemaining > 0 && (
                      <p className="text-[11px] text-red-600 font-bold">
                        {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Success Banner */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="font-semibold">{successMessage}</p>
                </motion.div>
              )}

              {/* 6-Digit Code Input Fields */}
              <div>
                <label className="block text-xs font-bold text-[#1B3D34] uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <div className="flex items-center justify-between gap-2 max-w-xs mx-auto">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={idx === 0 ? 6 : 1}
                      autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      disabled={isSending || isVerifying}
                      className="w-11 h-13 text-center text-xl font-bold font-mono text-[#1B3D34] bg-[#FAFBF9] border-2 border-[#D5E1D8] rounded-xl focus:border-[#1B3D34] focus:ring-2 focus:ring-[#1B3D34]/15 focus:outline-none transition-all disabled:opacity-50"
                      aria-label={`Digit ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifying || isSending || fullOtp.length !== 6}
                  className="w-full bg-[#1B3D34] hover:bg-[#142E27] text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Verify</span>
                      <ArrowRight className="w-4 h-4 text-[#F28C28]" />
                    </>
                  )}
                </button>

                {/* Resend & Cooldown info */}
                <div className="flex items-center justify-between text-xs text-[#52605B] px-1 pt-1">
                  {resendCooldown > 0 ? (
                    <span className="text-[#687770] flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5 animate-spin-reverse opacity-70" />
                      Resend code in <strong className="font-mono text-[#1B3D34]">{resendCooldown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isSending || isVerifying}
                      className="font-bold text-[#1B3D34] hover:text-[#F28C28] underline underline-offset-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Resend OTP via SMS
                    </button>
                  )}

                  <span className="text-[11px] text-[#8A9A92]">
                    Valid for {Math.floor(expiresIn / 60)}:{(expiresIn % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Security guarantee */}
              <div className="pt-2 border-t border-[#EDF2EE] flex items-center justify-center gap-2 text-[11px] text-[#687770]">
                <Lock className="w-3 h-3 text-[#1B3D34]" />
                <span>Protected by Hutty Server-Side SMS Security</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
