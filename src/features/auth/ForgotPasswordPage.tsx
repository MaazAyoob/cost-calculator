// ==============================================================================
// Hutty Customer Password Recovery Page
// Handles password reset token requests and new password submissions
// ==============================================================================

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { requestPasswordReset, completePasswordReset } from '../../services/accountApi';
import { HuttyLogo } from '../../components/brand/HuttyLogo';

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [manualToken, setManualToken] = useState(tokenFromUrl || '');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  // If token is present, we are in Step 2 (Reset Password)
  const isResetting = Boolean(tokenFromUrl || manualToken);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Please enter your account email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email.trim());
      setSuccessMessage(res.message);
      if (res.resetToken) {
        setDevResetToken(res.resetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!manualToken.trim()) {
      setError('Please provide the reset token.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await completePasswordReset(manualToken.trim(), newPassword);
      setSuccessMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-[#1B3D34] selection:text-white">
      <div className="absolute inset-0 pointer-events-none arch-grid-bg opacity-30" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-6">
        <Link to="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <HuttyLogo variant="full" width={125} />
        </Link>
        <h2 className="mt-4 text-3xl font-black text-[#1B3D34] tracking-tight font-heading">
          {isResetting ? 'Reset your password' : 'Recover your account'}
        </h2>
        <p className="mt-1.5 text-sm text-[#52605B]">
          {isResetting
            ? 'Enter your new secure password below.'
            : 'Enter your email address and we will help you reset your password.'}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E2E8E3] shadow-sm">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#EBF3EF] border border-[#D5E5DC] text-[#1B3D34] text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span>{successMessage}</span>
                {devResetToken && !isResetting && (
                  <div className="mt-2 pt-2 border-t border-[#D5E5DC]">
                    <button
                      type="button"
                      onClick={() => setManualToken(devResetToken)}
                      className="text-xs font-bold text-[#F28C28] hover:underline"
                    >
                      Click here to proceed to Set New Password &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isResetting ? (
            /* Step 1: Request Reset */
            <form onSubmit={handleRequestReset} className="space-y-4 text-left">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full pl-10 pr-3.5 py-3 border border-[#D5E1D8] rounded-xl text-sm text-[#1B3D34] placeholder-[#8A9A92] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:border-[#1B3D34] transition-all bg-[#FAFBF9]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1B3D34] hover:bg-[#142E27] text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4 text-[#F28C28]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: Set New Password */
            <form onSubmit={handleCompleteReset} className="space-y-4 text-left">
              <div>
                <label htmlFor="manualToken" className="block text-xs font-bold text-[#1B3D34] uppercase tracking-wider mb-1.5">
                  Reset Token
                </label>
                <input
                  id="manualToken"
                  type="text"
                  required
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="block w-full px-3.5 py-2.5 border border-[#D5E1D8] rounded-xl text-xs text-[#1B3D34] font-mono bg-[#FAFBF9]"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-xs font-bold text-[#1B3D34] uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687770]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="block w-full pl-10 pr-10 py-3 border border-[#D5E1D8] rounded-xl text-sm text-[#1B3D34] placeholder-[#8A9A92] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] bg-[#FAFBF9]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A9A92] hover:text-[#1B3D34]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#1B3D34] uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687770]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="block w-full pl-10 pr-10 py-3 border border-[#D5E1D8] rounded-xl text-sm text-[#1B3D34] placeholder-[#8A9A92] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] bg-[#FAFBF9]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1B3D34] hover:bg-[#142E27] text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Set New Password</span>
                      <ArrowRight className="w-4 h-4 text-[#F28C28]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#EDF2EE] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B3D34] hover:text-[#F28C28] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
