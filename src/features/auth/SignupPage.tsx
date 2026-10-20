// ==============================================================================
// Hutty Customer Sign-Up Page
// Friendly, straightforward onboarding for homeowners with project persistence.
// Includes debounced email availability check, robust validation, and submission protection.
// ==============================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';
import { HuttyLogo } from '../../components/brand/HuttyLogo';
import { sanitizeRedirectUrl } from '../../components/auth/AuthGuard';
import { normalizeIndianPhoneNumber } from '../../utils/phone';
import { getApiUrl } from '../../config/api';

const isValidEmailSyntax = (val: string): boolean => {
  const trimmed = val.trim();
  if (!trimmed || trimmed.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) return false;
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (local.length > 64 || local.length === 0) return false;
  if (domain.length > 255 || domain.length === 0) return false;
  if (domain.startsWith('-') || domain.endsWith('-')) return false;
  if (domain.includes('..')) return false;
  return true;
};

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const redirectDestination = sanitizeRedirectUrl(rawRedirect);

  const { signup, isLoading, error, clearError } = useCustomerAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(true);
  const [clientError, setClientError] = useState<string | null>(null);

  // Email availability check states
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailDuplicateError, setEmailDuplicateError] = useState<string | null>(null);
  const [emailAvailableSuccess, setEmailAvailableSuccess] = useState(false);

  // Submission protection guard
  const isSubmittingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<any>(null);
  const lastCheckedEmailRef = useRef<string>('');
  const emailRef = useRef<string>('');
  emailRef.current = email;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const normPhone = normalizeIndianPhoneNumber(phone);

  const checkEmailAvailability = useCallback(async (emailToCheck: string) => {
    const normalized = emailToCheck.trim().toLowerCase();
    if (!normalized || !isValidEmailSyntax(normalized)) {
      return;
    }

    // Do not re-check if already confirmed for this exact address
    if (lastCheckedEmailRef.current === normalized && (emailAvailableSuccess || emailDuplicateError)) {
      return;
    }

    // Cancel any previous in-flight check request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsCheckingEmail(true);

    try {
      const res = await fetch(getApiUrl('/api/v1/auth/check-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized }),
        signal: controller.signal,
      });

      // Discard stale responses if user typed a different email in the meantime
      if (emailRef.current.trim().toLowerCase() !== normalized) {
        return;
      }

      lastCheckedEmailRef.current = normalized;

      if (!res.ok) {
        // Handle network/server errors separately from duplicate-email errors:
        // Never claim "Email already exists" for network errors!
        setEmailDuplicateError(null);
        setEmailAvailableSuccess(false);
        return;
      }

      const data = await res.json();
      if (data.available === false) {
        setEmailDuplicateError(data.message || 'An account with this email address already exists. Please log in.');
        setEmailAvailableSuccess(false);
      } else {
        setEmailDuplicateError(null);
        setEmailAvailableSuccess(true);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      // Stale or network failure: never falsely display duplicate warning
      setEmailDuplicateError(null);
      setEmailAvailableSuccess(false);
    } finally {
      if (abortControllerRef.current === controller) {
        setIsCheckingEmail(false);
        abortControllerRef.current = null;
      }
    }
  }, [emailAvailableSuccess, emailDuplicateError]);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    // Typing into the email field must immediately clear any duplicate warning and cancel stale requests
    setEmailDuplicateError(null);
    setEmailAvailableSuccess(false);
    setClientError(null);
    clearError();

    // Cancel in-flight check request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsCheckingEmail(false);
    }

    // Cancel pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const trimmed = val.trim();
    // Only schedule a check if syntax is valid, debounced by 600ms
    if (isValidEmailSyntax(trimmed)) {
      debounceTimerRef.current = setTimeout(() => {
        checkEmailAvailability(trimmed);
      }, 600);
    }
  };

  const handleEmailBlur = () => {
    const trimmed = email.trim();
    if (isValidEmailSyntax(trimmed)) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      checkEmailAvailability(trimmed);
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setClientError(null);
    clearError();
  };

  const handlePasswordChange = (val: string) => {
    // Never silently trim or modify passwords
    setPassword(val);
    setClientError(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setClientError(null);

    // Prevent accidental duplicate form submissions
    if (isSubmittingRef.current || isLoading) {
      return;
    }

    if (!name.trim()) {
      setClientError('Please enter your full name.');
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setClientError('Please enter your email address.');
      return;
    }

    if (!isValidEmailSyntax(trimmedEmail)) {
      setClientError('Please enter a valid email address.');
      return;
    }

    if (emailDuplicateError) {
      setClientError('This email is already registered. Please log in instead.');
      return;
    }

    if (!phone.trim()) {
      setClientError('Mobile number is required for account creation.');
      return;
    }

    if (!normPhone.isValid) {
      setClientError(normPhone.error || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    // Documented password policy: min 12 characters. Never silently trim passwords.
    if (!password || password.length < 12) {
      setClientError('Password must be at least 12 characters long.');
      return;
    }

    if (!consent) {
      setClientError('Please accept the terms to create your account.');
      return;
    }

    isSubmittingRef.current = true;
    try {
      const success = await signup(
        name.trim(),
        trimmedEmail.toLowerCase(),
        password,
        normPhone.e164
      );

      if (success) {
        navigate(redirectDestination, { replace: true });
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] flex flex-col justify-center py-10 sm:px-6 lg:px-8 selection:bg-[#1B3D34] selection:text-white relative">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none arch-grid-bg opacity-30" />

      {/* Top Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-6">
        <Link to="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <HuttyLogo variant="full" width={125} />
        </Link>
        <h2 className="mt-4 text-3xl font-black text-[#1B3D34] tracking-tight font-heading">
          Let's get your home project started.
        </h2>
        <p className="mt-1.5 text-sm text-[#52605B] max-w-sm mx-auto leading-relaxed">
          Create an account to save your plans, track your estimates and access your reports whenever you need them.
        </p>
      </div>

      {/* Main Card Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E2E8E3] shadow-sm">
          
          {/* General Error Banner */}
          {(error || clientError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error || clientError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-[#1B3D34] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687770]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setClientError(null);
                    clearError();
                  }}
                  placeholder="e.g. Ramesh Kumar"
                  className="block w-full pl-10 pr-3.5 py-3 border border-[#D5E1D8] rounded-xl text-sm text-[#1B3D34] placeholder-[#8A9A92] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:border-[#1B3D34] transition-all bg-[#FAFBF9]"
                />
              </div>
            </div>

            {/* Email Address Field with Debounced Duplicate Check */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#1B3D34] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687770]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="name@example.com"
                  className={`block w-full pl-10 pr-10 py-3 border rounded-xl text-sm text-[#1B3D34] placeholder-[#8A9A92] focus:outline-none transition-all bg-[#FAFBF9] ${
                    emailDuplicateError
                      ? 'border-red-400 focus:ring-2 focus:ring-red-400 focus:border-red-400'
                      : 'border-[#D5E1D8] focus:ring-2 focus:ring-[#1B3D34] focus:border-[#1B3D34]'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  {isCheckingEmail ? (
                    <Loader2 className="w-4 h-4 text-[#8A9A92] animate-spin" />
                  ) : emailAvailableSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : null}
                </div>
              </div>

              {/* Inline duplicate email warning */}
              {emailDuplicateError && (
                <div className="mt-1.5 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>Email already registered.</span>
                  </div>
                  <Link
                    to={`/login?redirect=${encodeURIComponent(redirectDestination)}`}
                    className="font-bold underline text-[#1B3D34] hover:text-[#F28C28] whitespace-nowrap ml-1"
                  >
                    Log in here
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Number Field (Indian +91) */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-[#1B3D34] uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-red-500">*</span>
              </label>

              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687770]">
                  <Phone className="w-4 h-4" />
                  <span className="text-xs font-bold font-mono text-[#52605B] ml-1 border-r border-[#D5E1D8] pr-2">
                    +91
                  </span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="98765 43210"
                  className="block w-full pl-20 pr-3.5 py-3 border border-[#D5E1D8] rounded-xl text-sm text-[#1B3D34] placeholder-[#8A9A92] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:border-[#1B3D34] transition-all bg-[#FAFBF9]"
                />
              </div>

              <p className="mt-1.5 text-[11px] text-[#687770]">
                10-digit Indian mobile number for saving your estimates.
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#1B3D34] uppercase tracking-wider mb-1.5">
                Password <span className="text-gray-400 font-normal lowercase">(min. 12 characters)</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687770]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Create a secure password (12+ characters)"
                  className="block w-full pl-10 pr-10 py-3 border border-[#D5E1D8] rounded-xl text-sm text-[#1B3D34] placeholder-[#8A9A92] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:border-[#1B3D34] transition-all bg-[#FAFBF9]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A9A92] hover:text-[#1B3D34] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-[#8A9A92]">
                Use 12 or more characters. Password managers and special characters are welcome.
              </p>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#1B3D34] focus:ring-[#1B3D34] border-[#D5E1D8] cursor-pointer"
              />
              <label htmlFor="consent" className="text-xs text-[#52605B] leading-tight cursor-pointer">
                I agree to save my project plans and estimates securely with Hutty.
              </label>
            </div>

            {/* Submit Button with Loading & Double-Submission Guard */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1B3D34] hover:bg-[#142E27] text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 text-[#F28C28]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Redirect Link */}
          <div className="mt-6 pt-5 border-t border-[#EDF2EE] text-center">
            <p className="text-xs text-[#52605B]">
              Already have a Hutty account?{' '}
              <Link
                to={`/login?redirect=${encodeURIComponent(redirectDestination)}`}
                className="font-bold text-[#1B3D34] hover:text-[#F28C28] underline underline-offset-2 transition-colors ml-1"
              >
                Log in here
              </Link>
            </p>
          </div>

        </div>

        {/* Benefits reminder without false verification labels */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-[#687770]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#1B3D34]" />
            <span>Auto-saved progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1B3D34]" />
            <span>256-Bit SSL Protection</span>
          </div>
        </div>

      </div>
    </div>
  );
};

