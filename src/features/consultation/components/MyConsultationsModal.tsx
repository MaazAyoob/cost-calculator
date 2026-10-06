import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Clock, Calendar, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useConsultationStore } from '../../../store/useConsultationStore';
import { LAUNCH_CONSULTATION_PRICE_DISPLAY } from '../../../config/consultation';

interface MyConsultationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyConsultationsModal: React.FC<MyConsultationsModalProps> = ({ isOpen, onClose }) => {
  const { myConsultations, fetchMyConsultations, isLoadingMyConsultations } = useConsultationStore();
  const [lookupEmail, setLookupEmail] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMyConsultations();
    }
  }, [isOpen, fetchMyConsultations]);

  if (!isOpen) return null;

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmail.trim()) return;
    setHasSearched(true);
    await fetchMyConsultations(lookupEmail.trim().toLowerCase());
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AWAITING_REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            Paid — Awaiting Review
          </span>
        );
      case 'ASSIGNED':
      case 'UNDER_REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
            Expert Assigned
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
            Appointment Scheduled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1B3D34]/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl border border-[#E5E7EB] my-8 text-left space-y-5 max-h-[88vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28]">
              HOMEOWNER PORTAL
            </span>
            <h2 className="text-xl font-bold text-[#1B3D34] mt-0.5 font-heading">
              My Consultation Requests
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#F8F8F6] text-[#4B5563] hover:text-[#1B3D34] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Lookup Input */}
        <form onSubmit={handleLookupSubmit} className="flex gap-2">
          <input
            type="email"
            required
            value={lookupEmail}
            onChange={(e) => setLookupEmail(e.target.value)}
            placeholder="Enter your booking email (e.g. rahul@example.com)..."
            className="flex-1 px-3.5 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3D34] bg-[#F8F8F6]"
          />
          <button
            type="submit"
            className="hutty-btn-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
          >
            Find Requests
          </button>
        </form>

        {/* Requests List */}
        <div className="space-y-3 pt-2">
          {isLoadingMyConsultations ? (
            <div className="py-8 text-center text-xs text-[#4B5563]">
              Loading your consultation requests...
            </div>
          ) : myConsultations.length === 0 ? (
            <div className="p-8 text-center bg-[#F8F8F6] rounded-2xl border border-dashed border-[#E5E7EB] space-y-2">
              <ShieldCheck className="w-8 h-8 text-[#4B5563]/50 mx-auto" />
              <p className="text-xs font-semibold text-[#1B3D34]">
                {hasSearched ? 'No consultation requests found for this email.' : 'Look up your requests using your booking email.'}
              </p>
              <p className="text-[11px] text-[#4B5563]">
                Consultations booked with fixed {LAUNCH_CONSULTATION_PRICE_DISPLAY} will show here after payment verification.
              </p>
            </div>
          ) : (
            myConsultations.map((req) => (
              <div
                key={req.id}
                className="bg-[#F8F8F6] p-4 rounded-2xl border border-[#E5E7EB] space-y-2.5 text-xs text-[#1B3D34]"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                      {req.publicReference}
                    </span>
                    <span className="text-xs font-bold text-[#1B3D34]">
                      {req.consultant?.name || 'Expert Assigned by Hutty'}
                    </span>
                  </div>
                  {getStatusBadge(req.status)}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E5E7EB]/70 text-[11px]">
                  <div>
                    <span className="text-[#4B5563] block">Topic</span>
                    <span className="font-semibold truncate block">{req.consultationTopic}</span>
                  </div>
                  <div>
                    <span className="text-[#4B5563] block">Preferred Schedule</span>
                    <span className="font-semibold block">{req.preferredDate} ({req.preferredTime})</span>
                  </div>
                  <div>
                    <span className="text-[#4B5563] block">Fee Paid</span>
                    <span className="font-mono font-bold text-emerald-800">{LAUNCH_CONSULTATION_PRICE_DISPLAY}</span>
                  </div>
                </div>

                {req.confirmedDateTime && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 flex items-center gap-2 text-xs">
                    <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      <strong>Confirmed Appointment:</strong>{' '}
                      {new Date(req.confirmedDateTime).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
