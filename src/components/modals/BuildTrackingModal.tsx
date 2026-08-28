import React, { useState } from 'react';
import { X, TrendingUp, DollarSign, CalendarCheck, BarChart3, ArrowRight, Shield, Layers, CheckCircle2 } from 'lucide-react';
import { useCalculationStore } from '../../store/useCalculationStore';
import { formatCurrency } from '../../utils/cn';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BuildTrackingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { result } = useCalculationStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'enroll'>('overview');
  const [email, setEmail] = useState('');
  const [enrolled, setEnrolled] = useState(false);

  if (!isOpen) return null;

  const totalCost = result.budget?.totalProjectCost || 5000000;
  const buaSqFt = result.area?.totalBUASqFt || 1440;

  return (
    <div className="fixed inset-0 z-50 bg-[#1B3D34]/40 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-left relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!enrolled ? (
          <>
            {/* Header */}
            <div className="space-y-1.5 pr-6">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F28C28] bg-[rgba(242,140,40,0.1)] px-2 py-0.5 rounded border border-[#F28C28]/20">
                OFFERING #4 &bull; LIVE CONSTRUCTION TRACKING
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B3D34] font-heading tracking-tight">
                Where is my money going?
              </h2>
              <p className="text-xs text-[#4B5563]">
                Live construction budget, actual vs planned spending, milestone progress verification, and material cost change alerts.
              </p>
            </div>

            {/* Pricing Card */}
            <div className="p-4 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider block">Monthly Subscription</span>
                <span className="text-2xl font-black text-[#1B3D34] font-mono">₹1,999</span>
                <span className="text-[10px] text-[#4B5563] ml-1">/ month during build</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#1B3D34] bg-white px-2.5 py-1 rounded border border-[#E5E7EB] font-mono">
                  Cancel Anytime
                </span>
              </div>
            </div>

            {/* Mock Live Budget Status Preview Shell */}
            <div className="p-4 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#E5E7EB]">
                <span className="font-bold text-[#1B3D34]">Live Project Budget Shell</span>
                <span className="font-mono text-[11px] text-[#4B5563]">Target: {formatCurrency(totalCost)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-white rounded-lg border border-[#E5E7EB]">
                  <span className="text-[9px] font-bold text-[#4B5563] uppercase block">Planned</span>
                  <span className="text-xs font-black text-[#1B3D34] font-mono">{formatCurrency(totalCost * 0.35)}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-[#E5E7EB]">
                  <span className="text-[9px] font-bold text-[#4B5563] uppercase block">Actual Spent</span>
                  <span className="text-xs font-black text-[#1B3D34] font-mono">{formatCurrency(totalCost * 0.33)}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-[#E5E7EB]">
                  <span className="text-[9px] font-bold text-[#4B5563] uppercase block">Remaining</span>
                  <span className="text-xs font-black text-[#1B3D34] font-mono">{formatCurrency(totalCost * 0.67)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-[#4B5563]">
                  <span>Physical Stage: Plinth &amp; RCC Column Casting</span>
                  <span className="font-mono font-bold text-[#1B3D34]">35% Complete</span>
                </div>
                <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1B3D34] w-[35%] rounded-full" />
                </div>
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-2 text-xs text-[#1B3D34]">
              <span className="font-bold text-[11px] uppercase tracking-wider text-[#4B5563] block">
                Platform Capabilities:
              </span>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Planned vs. Actual Spend:</strong> Track contractor invoices directly against the baseline BOQ.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Material Cost Fluctuation Tracking:</strong> Monitor market movements in steel, cement, and sand rates in real time.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Milestone Inspection Verification:</strong> Unlock disbursements only when physical quality checklists pass.</span>
                </div>
              </div>
            </div>

            {/* Subscribe Shell */}
            <form onSubmit={(e) => { e.preventDefault(); setEnrolled(true); }} className="space-y-3 pt-2 border-t border-[#E5E7EB]">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#1B3D34] block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E7EB] bg-[#F8F8F6] focus:bg-white focus:outline-none focus:border-[#1B3D34]"
                />
              </div>

              <button
                type="submit"
                className="w-full hutty-btn-primary py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Track My Build</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>
            </form>
          </>
        ) : (
          /* Enrollment Confirmation */
          <div className="text-center space-y-5 py-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(27,61,52,0.08)] text-[#1B3D34] border border-[#1B3D34]/20 flex items-center justify-center mx-auto">
              <CalendarCheck className="w-7 h-7 text-[#1B3D34]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2.5 py-1 rounded">
                BUILD TRACKING INITIALIZED
              </span>
              <h3 className="text-2xl font-extrabold text-[#1B3D34] font-heading">
                Welcome to Hutty Build Tracking.
              </h3>
              <p className="text-xs text-[#4B5563] max-w-sm mx-auto leading-relaxed">
                Your construction spending ledger is being linked to your project BOQ. We have sent setup details and invite links to <strong>{email || 'your email'}</strong>.
              </p>
            </div>

            <button
              onClick={onClose}
              className="hutty-btn-secondary px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
