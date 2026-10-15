// ==============================================================================
// Hutty Customer Sign-Up Page
// Friendly, straightforward onboarding for homeowners with project persistence
// ==============================================================================

import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';
import { HuttyLogo } from '../../components/brand/HuttyLogo';
import { sanitizeRedirectUrl } from '../../components/auth/AuthGuard';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setClientError(null);

    if (!name.trim()) {
      setClientError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setClientError('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setClientError('Password must be at least 6 characters long.');
      return;
    }
    if (!consent) {
      setClientError('Please accept the terms to create your account.');
      return;
    }

    const success = await signup(name.trim(), email.trim(), password, phone.trim() || undefined);
    if (success) {
      navigate(redirectDestination, { replace: true });
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
          
          {/* Error Banner */}
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
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="block w-full pl-10 pr-3.5 py-3 border border-[#D5E1D8] rounded-xl text-sm text-[#1B3D34] placeholder-[#8A9A92] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:border-[#1B3D34] transition-all bg-[#FAFBF9]"
                />
              </div>
            </div>

            {/* Email Address */}
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3.5 py-3 border border-[#D5E1D8] rounded-xl text-sm text-[#1B3D34] placeholder-[#8A9A92] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:border-[#1B3D34] transition-all bg-[#FAFBF9]"
                />
              </div>
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-[#1B3D34] uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687770]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="block w-full pl-10 pr-3.5 py-3 border border-[#D5E1D8] rounded-xl text-sm text-[#1B3D34] placeholder-[#8A9A92] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:border-[#1B3D34] transition-all bg-[#FAFBF9]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#1B3D34] uppercase tracking-wider mb-1.5">
                Password <span className="text-gray-400 font-normal lowercase">(min. 6 characters)</span>
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="block w-full pl-10 pr-10 py-3 border border-[#D5E1D8] rounded-xl text-sm text-[#1B3D34] placeholder-[#8A9A92] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:border-[#1B3D34] transition-all bg-[#FAFBF9]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A9A92] hover:text-[#1B3D34] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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

            {/* Submit Button */}
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

        {/* Benefits reminder */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-[#687770]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#1B3D34]" />
            <span>Auto-saved progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1B3D34]" />
            <span>100% Free estimates</span>
          </div>
        </div>

      </div>
    </div>
  );
};
