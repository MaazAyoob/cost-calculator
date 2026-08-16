import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useReportStore } from '../../store/useReportStore';
import { FileText, ShieldCheck, ArrowRight, User, Phone, Mail, X, MessageSquareShare } from 'lucide-react';
import { useCalculationStore } from '../../store/useCalculationStore';
import { useWizardStore } from '../../store/useWizardStore';
import { formatCurrency } from '../../utils/cn';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

  const handleWhatsAppShare = () => {
    const totalCostStr = formatCurrency(budget.totalProjectCost || 0);
    const buaStr = `${(area.totalBUASqFt || 0).toLocaleString('en-IN')} sq.ft`;
    const plotStr = plotLength && plotWidth ? `${plotLength}x${plotWidth} ft` : 'Custom Plot';
    const floorsStr = floors === 1 ? 'Ground Floor' : `G+${(floors || 2) - 1}`;
    const text = encodeURIComponent(
      `Hello Rightcon Team! Here is my project estimation from Cost Calculator:\n\n` +
      `📍 Location: ${city || 'Bangalore'}\n` +
      `📐 Plot: ${plotStr}\n` +
      `🏢 Floors: ${floorsStr}\n` +
      `🏗️ BUA: ${buaStr}\n` +
      `💰 Estimated Cost: ${totalCostStr}\n\n` +
      `Please connect with me regarding next steps!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

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
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Access BOQ & Report</h3>
            <p className="text-xs text-slate-500">Enter details to view full engineering report</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-slate-900 text-xs">Your Detailed BOQ Report is Ready</h4>
              <p className="text-slate-600 text-[11px]">
                Enter your details to receive and download your bank-loan ready BOQ report, timeline, and material breakdown.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">Full Name *</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">Phone Number *</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">Email Address *</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-3 space-y-2">
              <Button type="submit" size="md" className="w-full justify-center text-xs font-black py-2.5 rounded-xl cursor-pointer" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Unlock &amp; Download Full BOQ
              </Button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-emerald-200 cursor-pointer"
              >
                <MessageSquareShare className="w-4 h-4 text-emerald-600" />
                Share Estimate on WhatsApp
              </button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Rightcon Privacy Protected &bull; 100% Confidential</span>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
