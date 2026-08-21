import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useReportStore } from '../../store/useReportStore';
import { FileText, ShieldCheck, ArrowRight, User, Phone, Mail, X } from 'lucide-react';
import { useCalculationStore } from '../../store/useCalculationStore';
import { useWizardStore } from '../../store/useWizardStore';
import { formatCurrency } from '../../utils/cn';
import { HuttyLogo } from '../common/HuttyLogo';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { saveLeadInfo, leadInfo } = useReportStore();

  const [name, setName] = useState(leadInfo?.name || '');
  const [phone, setPhone] = useState(leadInfo?.phone || '');
  const [email, setEmail] = useState(leadInfo?.email || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const { budget, area } = useCalculationStore((s) => s.result);
  const { city, plotLength, plotWidth, floors } = useWizardStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError('Please provide your name, phone number, and email address.');
      return;
    }
    if (phone.trim().length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setError('');
    saveLeadInfo({ name: name.trim(), phone: phone.trim(), email: email.trim() });
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B3D34]/40 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E5E7EB] space-y-4 text-left"
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#1B3D34] font-heading">Access Construction Dossier</h3>
            <p className="text-xs text-[#4B5563]">Enter details to download complete BOQ &amp; report</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[rgba(27,61,52,0.04)] text-[#4B5563] hover:text-[#1B3D34] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-start gap-3">
            <FileText className="w-5 h-5 text-[#1B3D34] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-bold text-[#1B3D34] text-xs">Bank-Ready Construction Dossier</h4>
              <p className="text-[#4B5563] text-[11px]">
                Receive the itemized 13-stage BOQ schedule, material quantities takeoff, and SBI/HDFC format payment roadmap.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-[11px] font-bold border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-[#1B3D34] uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#4B5563] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#1B3D34] focus:outline-none focus:border-[#1B3D34]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#1B3D34] uppercase tracking-wider block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#4B5563] absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#1B3D34] focus:outline-none focus:border-[#1B3D34]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#1B3D34] uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#4B5563] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. anand@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#1B3D34] focus:outline-none focus:border-[#1B3D34]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full hutty-btn-primary py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Download Report</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>
            </div>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#4B5563] pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1B3D34]" />
            <span>Your contact details are strictly confidential.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
