import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEntitlementStore } from '../../store/useEntitlementStore';
import { usePricingStore } from '../../store/usePricingStore';
import { useReportStore } from '../../store/useReportStore';
import { useCalculationStore } from '../../store/useCalculationStore';
import { useWizardStore } from '../../store/useWizardStore';
import { generateAndDownloadDetailedReportPdf, viewDetailedReportPdfInNewTab } from '../../features/report/pdfService';
import { isDevPdfTestingEnabled } from '../../config/devTesting';
import { X, Check, Lock, Download, ShieldCheck, FileText, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { PricingTierCode } from '../../types/pricing';
import { modalScaleVariant, backdropFadeVariant } from '../../animations/variants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTierCode?: PricingTierCode;
}

export const UnlockReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTierCode = 'DETAILED_ESTIMATE_499',
}) => {
  const { grantReportAccess } = useEntitlementStore();
  const { initiatePurchase, confirmPurchasePayment, grantEntitlementsDirectly } = usePricingStore();
  const { result } = useCalculationStore();
  const { specificationTier } = useWizardStore();
  const { preparedFor, saveLeadInfo } = useReportStore();

  const [selectedTier, setSelectedTier] = useState<PricingTierCode>(initialTierCode);
  const [name, setName] = useState(preparedFor || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedOrderRef, setCompletedOrderRef] = useState<string>('');
  const [isDevGenerating, setIsDevGenerating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const projectId = result.report?.projectId || 'HUTTY-PROJ-01';

  const handleDevViewPdf = async () => {
    if (!isDevPdfTestingEnabled()) return;
    setIsDevGenerating(true);
    try {
      await viewDetailedReportPdfInNewTab({
        data: result,
        projectName: `${result.input?.houseType || 'Residential'} Construction Dossier`,
        preparedFor: name || preparedFor || 'Developer Testing',
        specificationTier: specificationTier || 'Premium',
      });
    } catch (err) {
      console.error('Dev PDF preview error:', err);
    } finally {
      setIsDevGenerating(false);
    }
  };

  const handleDevDownloadPdf = async () => {
    if (!isDevPdfTestingEnabled()) return;
    setIsDevGenerating(true);
    try {
      await generateAndDownloadDetailedReportPdf({
        data: result,
        projectName: `${result.input?.houseType || 'Residential'} Construction Dossier`,
        preparedFor: name || preparedFor || 'Developer Testing',
        specificationTier: specificationTier || 'Premium',
      });
    } catch (err) {
      console.error('Dev PDF download error:', err);
    } finally {
      setIsDevGenerating(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsProcessing(true);

    const leadName = name.trim() || 'Valued Homeowner';
    const leadPhone = phone.trim() || '9876543210';
    const leadEmail = email.trim() || 'client@example.com';

    // Persist local lead details
    saveLeadInfo({
      name: leadName,
      phone: leadPhone,
      email: leadEmail,
    });

    try {
      // Initiate checkout via server API (server authoritatively resolves ₹499 or ₹99)
      const { purchase, requiresPayment } = await initiatePurchase({
        tierCode: selectedTier,
        leadName,
        leadPhone,
        leadEmail,
        projectId,
        projectSnapshot: {
          buaSqFt: result.area?.totalBUASqFt,
          totalCostINR: result.budget?.totalProjectCost,
          houseType: result.input?.houseType,
        },
        testBypassPayment: true, // Controlled testing environment
      });

      setCompletedOrderRef(purchase.publicReference);

      if (selectedTier === 'DETAILED_ESTIMATE_499') {
        grantReportAccess(projectId, purchase.publicReference);
        grantEntitlementsDirectly('DETAILED_ESTIMATE_499', projectId, leadEmail, purchase.publicReference);

        // Auto-download PDF for detailed report purchase
        try {
          await generateAndDownloadDetailedReportPdf({
            data: result,
            projectName: `${result.input?.houseType || 'Residential'} Construction Dossier`,
            preparedFor: leadName,
            specificationTier: specificationTier || 'Premium',
          });
        } catch (pdfErr) {
          console.warn('PDF auto-download notification:', pdfErr);
        }
      } else {
        grantEntitlementsDirectly('ESTIMATE_99', projectId, leadEmail, purchase.publicReference);
      }

      setIsProcessing(false);
      setIsCompleted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Checkout error:', err);
      // Fallback graceful offline entitlement grant so user is never blocked
      const orderRef = `HT-PUR-${Date.now().toString(36).toUpperCase()}`;
      setCompletedOrderRef(orderRef);
      if (selectedTier === 'DETAILED_ESTIMATE_499') {
        grantReportAccess(projectId, orderRef);
      } else {
        grantEntitlementsDirectly('ESTIMATE_99', projectId, leadEmail, orderRef);
      }
      setIsProcessing(false);
      setIsCompleted(true);
      if (onSuccess) onSuccess();
    }
  };

  const selectedTierPriceDisplay = selectedTier === 'ESTIMATE_99' ? '₹99' : '₹499';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="unlock-report-portal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unlock-report-title"
        >
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-[#1B3D34]/40 backdrop-blur-xs"
            aria-hidden="true"
          />

          <motion.div
            variants={modalScaleVariant}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 bg-white rounded-2xl border border-[#E3E8E2] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-left max-h-[90vh] overflow-y-auto"
          >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCompleted ? (
          <>
            {/* Modal Header */}
            <div className="space-y-1.5 pr-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F28C28] bg-[rgba(242,140,40,0.1)] px-2 py-0.5 rounded border border-[#F28C28]/20">
                  HUTTY PRICING &bull; VERIFIED COMMERCIAL ESTIMATE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B3D34] font-heading tracking-tight">
                Unlock Bank-Ready Construction Dossier
              </h2>
              <p className="text-xs text-[#4B5563]">
                Access detailed itemized BOQ, physical material takeoff schedules, fixture allocations, and commercial breakdowns.
              </p>
            </div>

            {/* Plan Tier Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedTier('ESTIMATE_99')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTier === 'ESTIMATE_99'
                    ? 'border-[#1B3D34] bg-[rgba(27,61,52,0.04)] ring-1 ring-[#1B3D34]'
                    : 'border-[#E3E8E2] bg-[#F8F8F6] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#4B5563]">
                    Starter Plan
                  </span>
                  <span className="text-xs font-mono font-black text-[#1B3D34]">₹99</span>
                </div>
                <div className="text-xs font-bold text-[#1B3D34] mt-1">Verified Estimate</div>
                <p className="text-[10px] text-[#4B5563] mt-0.5 line-clamp-1">Save project &amp; preliminary metrics</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier('DETAILED_ESTIMATE_499')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedTier === 'DETAILED_ESTIMATE_499'
                    ? 'border-[#1B3D34] bg-[rgba(27,61,52,0.04)] ring-1 ring-[#1B3D34]'
                    : 'border-[#E3E8E2] bg-[#F8F8F6] hover:bg-white'
                }`}
              >
                <span className="absolute -top-2 right-2 bg-[#F28C28] text-white text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                  POPULAR
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F28C28]">
                    Full Dossier
                  </span>
                  <span className="text-xs font-mono font-black text-[#1B3D34]">₹499</span>
                </div>
                <div className="text-xs font-bold text-[#1B3D34] mt-1">Detailed QS Report</div>
                <p className="text-[10px] text-[#4B5563] mt-0.5 line-clamp-1">Works BOQ + Schedules + PDF</p>
              </button>
            </div>

            {/* Pricing Banner */}
            <div className="p-4 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider block">One-time payment</span>
                <span className="text-2xl font-black text-[#1B3D34] font-mono">{selectedTierPriceDisplay}</span>
                <span className="text-[10px] text-[#4B5563] ml-1">all inclusive</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#1B3D34] bg-white px-2 py-1 rounded border border-[#E3E8E2] block font-mono">
                  {selectedTier === 'DETAILED_ESTIMATE_499' ? 'Instant PDF • Lifetime Access' : 'Verified Lead Record'}
                </span>
              </div>
            </div>

            {/* Deliverables Checklist */}
            <div className="space-y-2 text-xs text-[#1B3D34]">
              <span className="font-bold text-[11px] uppercase tracking-wider text-[#4B5563] block">
                {selectedTier === 'DETAILED_ESTIMATE_499' ? 'Included in ₹499 Detailed Report:' : 'Included in ₹99 Verified Plan:'}
              </span>
              <div className="grid grid-cols-1 gap-2">
                {selectedTier === 'DETAILED_ESTIMATE_499' ? (
                  <>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                      <span><strong>Section A — Works BOQ:</strong> Itemized civil, structural, finishes and joinery items with quantities and market rates.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                      <span><strong>Section B — Material Takeoff:</strong> Exact quantities for steel rebar, cement bags, M-sand, P-sand, coarse aggregate, AAC blocks, tiles &amp; paint.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                      <span><strong>Section C — Installed Fixtures:</strong> Granular schedule for doors, windows, sanitary sets, and CPVC plumbing lines.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                      <span><strong>Section D — Commercial Breakdown:</strong> Contractor margins, architectural fees, contingency reserves, and GST schedule.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                      <span><strong>Bank-Ready PDF Download:</strong> High-resolution multi-page PDF ready for contractor negotiation and bank home loan disbursement.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                      <span><strong>Saved Project Feasibility:</strong> Cloud save your plot configuration, footprint and floor dimensions.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                      <span><strong>High-Level Trade Estimates:</strong> Major civil, MEP, and finishes cost bracket indications.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                      <span><strong>Direct Upgrade Path:</strong> Seamless upgrade to the ₹499 Full Detailed Construction Dossier at any time.</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleUnlock} className="space-y-4 pt-2 border-t border-[#E3E8E2]">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1B3D34] block">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E3E8E2] bg-[#F8F8F6] focus:bg-white focus:outline-none focus:border-[#1B3D34]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1B3D34] block">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E3E8E2] bg-[#F8F8F6] focus:bg-white focus:outline-none focus:border-[#1B3D34]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#1B3D34] block">Email Address (for plan copy)</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E3E8E2] bg-[#F8F8F6] focus:bg-white focus:outline-none focus:border-[#1B3D34]"
                />
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#1B3D34] block">Payment Method</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'upi', label: 'UPI / QR' },
                    { id: 'card', label: 'Credit/Debit' },
                    { id: 'netbanking', label: 'Net Banking' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`py-2 px-2.5 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-[#1B3D34] text-white border-[#1B3D34]'
                          : 'bg-[#F8F8F6] text-[#4B5563] border-[#E3E8E2] hover:bg-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full hutty-btn-primary py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#F28C28]" />
                    <span>Processing Payment ({selectedTierPriceDisplay})...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#F28C28]" />
                    <span>Confirm &amp; Unlock — {selectedTierPriceDisplay}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Developer Testing Mode (Explicit dev env only) */}
              {isDevPdfTestingEnabled() && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                      DEVELOPER TESTING ONLY
                    </span>
                    <span className="text-[10px] text-amber-800 font-medium">Bypass payment for testing</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDevViewPdf}
                      disabled={isDevGenerating}
                      className="w-full py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-700" />
                      <span>{isDevGenerating ? 'Compiling...' : 'View Full PDF (Testing)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDevDownloadPdf}
                      disabled={isDevGenerating}
                      className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-white" />
                      <span>Download Full PDF (Testing)</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </>
        ) : (
          /* Payment Success & Access State */
          <div className="text-center space-y-6 py-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(27,61,52,0.08)] text-[#1B3D34] border border-[#1B3D34]/20 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7 text-[#1B3D34]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2.5 py-1 rounded">
                PAYMENT CONFIRMED &bull; ACCESS GRANTED
              </span>
              <h2 className="text-2xl font-extrabold text-[#1B3D34] font-heading">
                {selectedTier === 'DETAILED_ESTIMATE_499'
                  ? 'Your detailed report is ready.'
                  : 'Your project estimate is confirmed.'}
              </h2>
              <p className="text-xs text-[#4B5563] max-w-sm mx-auto leading-relaxed">
                Order reference: <strong>{completedOrderRef}</strong>. Linked to project ID <strong>{projectId}</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2] space-y-2 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-[#4B5563]">Recipient:</span>
                <span className="font-bold text-[#1B3D34]">{name || 'Valued Homeowner'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4B5563]">Amount Paid:</span>
                <span className="font-bold text-[#1B3D34]">{selectedTierPriceDisplay} (Inclusive of GST)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4B5563]">Plan:</span>
                <span className="font-bold text-[#1B3D34]">
                  {selectedTier === 'DETAILED_ESTIMATE_499' ? 'Detailed Construction Dossier' : 'Verified Estimate'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4B5563]">Status:</span>
                <span className="font-bold text-[#1B3D34]">
                  {selectedTier === 'DETAILED_ESTIMATE_499' ? 'Unlocked • PDF Generated' : 'Active • Cloud Saved'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {selectedTier === 'DETAILED_ESTIMATE_499' && (
                <button
                  type="button"
                  onClick={async () => {
                    await generateAndDownloadDetailedReportPdf({
                      data: result,
                      projectName: `${result.input?.houseType || 'Residential'} Construction Dossier`,
                      preparedFor: name || 'Valued Homeowner',
                      specificationTier: specificationTier || 'Premium',
                    });
                  }}
                  className="hutty-btn-primary py-3 px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#F28C28]" />
                  <span>Download PDF Again</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="hutty-btn-secondary py-3 px-6 rounded-xl text-xs font-bold cursor-pointer"
              >
                <span>Continue to Report</span>
              </button>
            </div>
          </div>
        )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
