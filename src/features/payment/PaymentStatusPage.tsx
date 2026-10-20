import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Home,
  FileText,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { getApiUrl } from '../../config/api';
import { formatCurrency } from '../../utils/cn';

interface PaymentStatusState {
  status: 'LOADING' | 'PAID' | 'PENDING' | 'FAILED';
  orderId: string | null;
  message: string;
  data?: any;
  type?: 'CONSULTATION' | 'REPORT' | 'OTHER';
}

export const PaymentStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id') || searchParams.get('orderId');

  const [state, setState] = useState<PaymentStatusState>({
    status: 'LOADING',
    orderId,
    message: 'Verifying payment status with Cashfree secure banking network...',
  });

  const checkStatus = async () => {
    if (!orderId) {
      setState({
        status: 'FAILED',
        orderId: null,
        message: 'No order identifier found in redirect URL. Please check your account or retry booking.',
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      status: 'LOADING',
      message: 'Contacting payment gateway to confirm transaction...',
    }));

    try {
      const url = getApiUrl('/api/v1/cashfree/verify');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const json = await res.json();

      if (json.status === 'PAID' || json.data?.payment?.status === 'PAID' || json.data?.purchase?.status === 'PAID') {
        const isConsultation = Boolean(
          json.data?.request ||
          json.data?.consultationRequestId ||
          orderId.includes('con_')
        );

        setState({
          status: 'PAID',
          orderId,
          message: json.message || 'Payment successfully verified.',
          data: json.data,
          type: isConsultation ? 'CONSULTATION' : 'REPORT',
        });
      } else if (json.isPending || json.status === 'PENDING') {
        setState({
          status: 'PENDING',
          orderId,
          message:
            json.message ||
            'Payment is currently awaiting confirmation from your bank. If money was debited, your booking will be confirmed automatically.',
          data: json.data,
        });
      } else {
        setState({
          status: 'FAILED',
          orderId,
          message: json.message || 'Payment could not be confirmed or was cancelled.',
          data: json.data,
        });
      }
    } catch (err: any) {
      setState({
        status: 'FAILED',
        orderId,
        message: err.message || 'Failed to verify transaction status. Please check your connection and retry.',
      });
    }
  };

  useEffect(() => {
    checkStatus();
  }, [orderId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 text-center space-y-6"
      >
        {/* Loading State */}
        {state.status === 'LOADING' && (
          <div className="space-y-4 py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">Verifying Transaction</h2>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">{state.message}</p>
            {orderId && (
              <span className="inline-block text-[11px] font-mono bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                Order: {orderId}
              </span>
            )}
          </div>
        )}

        {/* Paid / Confirmed State */}
        {state.status === 'PAID' && (
          <div className="space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                Payment Confirmed
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2 font-heading">
                {state.type === 'CONSULTATION'
                  ? 'Consultation Booking Confirmed!'
                  : 'Estimate Report Unlocked!'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your payment of ₹1,499 has been authoritatively verified with Cashfree PG.
              </p>
            </div>

            {state.data?.request && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {state.data.request.publicReference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consultant / Desk:</span>
                  <span className="font-semibold text-slate-800">
                    {state.data.request.consultantNameSnapshot || 'Hutty Expert Review'}
                  </span>
                </div>
                {state.data.request.preferredDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Preferred Slot:</span>
                    <span className="text-slate-700">
                      {state.data.request.preferredDate} {state.data.request.preferredTime || ''}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500">Review Status:</span>
                  <span className="font-bold text-emerald-700">Awaiting Admin Review</span>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              {state.type === 'CONSULTATION' ? (
                <>
                  <Link
                    to="/consult"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    Back to Consultations
                  </Link>
                  <Link
                    to="/account"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                  >
                    View Account
                  </Link>
                </>
              ) : (
                <Link
                  to="/report"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4" />
                  View Estimate Report
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Pending State */}
        {state.status === 'PENDING' && (
          <div className="space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
                Awaiting Confirmation
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2 font-heading">Payment In Progress</h2>
              <p className="text-xs text-slate-600 mt-1">{state.message}</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={checkStatus}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Check Status Again
              </button>
              <Link
                to="/consult"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
              >
                Return to Consultations
              </Link>
            </div>
          </div>
        )}

        {/* Failed State */}
        {state.status === 'FAILED' && (
          <div className="space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-full border border-rose-200 uppercase tracking-wider">
                Verification Note
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2 font-heading">Payment Not Confirmed</h2>
              <p className="text-xs text-slate-600 mt-1">{state.message}</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={checkStatus}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Verification
              </button>
              <Link
                to="/consult"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hutty Authoritative Verification · 256-bit SSL Encrypted</span>
        </div>
      </motion.div>
    </div>
  );
};
