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
import { persistProject, getCachedProjectId, setCachedProjectId } from '../../services/projectApi';

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
      // Ensure project is persisted in PostgreSQL
      let effectiveProjectId = getCachedProjectId();
      if (!effectiveProjectId) {
        try {
          const wizard = useWizardStore.getState();
          const persisted = await persistProject({
            name: `${result.input?.houseType || wizard.houseType || 'Residential'} Construction Dossier`,
            leadName,
            leadEmail,
            leadPhone,
            city: wizard.city || 'Bangalore',
            authority: wizard.authority || 'BBMP/BDA',
            configuration: {
              plotLength: wizard.plotLength,
              plotWidth: wizard.plotWidth,
              houseType: result.input?.houseType || wizard.houseType || 'Duplex',
              floors: wizard.floors || 2,
              parkingType: wizard.parkingType || 'Normal Ground',
              rooms: wizard.rooms || {},
              qualityTier: wizard.qualityTier || specificationTier || 'Premium',
              materialBrands: wizard.materialBrands || {},
            },
            calculation: {
              totalBUASqFt: result.area?.totalBUASqFt,
              totalCostINR: result.budget?.totalProjectCost,
              costPerSqFt: result.budget?.costPerSqFt,
              steelTonnes: result.quantities?.steelTonnes || 0,
              cementBags: result.quantities?.cementBags || 0,
              concreteCuM: result.quantities?.totalStructuralConcreteCuM || result.quantities?.approxConcreteCuM || 0,
              timelineMonths: result.timeline?.totalMonths || 12,
              budgetBreakdown: result.budget || {},
              quantitiesJson: result.quantities || {},
            },
          });
          effectiveProjectId = persisted.id;
          setCachedProjectId(persisted.id);
        } catch (persistErr) {
          console.warn('Pre-persisting project notice:', persistErr);
        }
      }

      // Initiate checkout via server API (server authoritatively resolves ₹499 or ₹1,499)
      const { purchase, requiresPayment, gatewayOrder } = await initiatePurchase({
        tierCode: selectedTier,
        leadName,
        leadPhone,
        leadEmail,
        projectId: effectiveProjectId || projectId,
        projectSnapshot: {
          buaSqFt: result.area?.totalBUASqFt,
          totalCostINR: result.budget?.totalProjectCost,
          houseType: result.input?.houseType,
          city: useWizardStore.getState().city || 'Bangalore',
          authority: useWizardStore.getState().authority || 'BBMP/BDA',
          floors: useWizardStore.getState().floors || 2,
          qualityTier: specificationTier || 'Premium',
        },
        testBypassPayment: false, // Enforce verified checkout
      });

      const targetProjectId = purchase.projectId || effectiveProjectId || projectId;

      const hasRazorpay = typeof (window as any).Razorpay !== 'undefined';

      if (requiresPayment && hasRazorpay && gatewayOrder?.keyId && !gatewayOrder.keyId.includes('placeholder')) {
        // Real Razorpay gateway checkout
        const rzp = new (window as any).Razorpay({
          key: gatewayOrder.keyId,
          amount: gatewayOrder.amountMinorUnits,
          currency: gatewayOrder.currency,
          name: 'Hutty Pre-Construction Platform',
          description: selectedTier === 'PREMIUM_1499' ? 'Calculator — Premium BOQ' : 'Calculator — Detailed BOQ',
          order_id: gatewayOrder.orderId,
          prefill: {
            name: leadName,
            email: leadEmail,
            contact: leadPhone,
          },
          theme: { color: '#1B3D34' },
          handler: async (response: any) => {
            try {
              await confirmPurchasePayment(
                purchase.id,
                response.razorpay_payment_id,
                response.razorpay_order_id,
                response.razorpay_signature
              );
              setCompletedOrderRef(purchase.publicReference);
              grantReportAccess(targetProjectId, purchase.publicReference);
              grantEntitlementsDirectly(selectedTier, targetProjectId, leadEmail, purchase.publicReference);
              if (projectId && projectId !== targetProjectId) {
                grantReportAccess(projectId, purchase.publicReference);
                grantEntitlementsDirectly(selectedTier, projectId, leadEmail, purchase.publicReference);
              }

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

              setIsProcessing(false);
              setIsCompleted(true);
              if (onSuccess) onSuccess();
            } catch (verErr: any) {
              setIsProcessing(false);
              setFormError(verErr.message || 'Payment verification failed. Please contact support.');
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              setFormError('Payment was cancelled. You can retry whenever you are ready.');
            },
          },
        });
        rzp.open();
        return;
      }

      // In Sandbox / Test environment or when payment is confirmed:
      // Confirm with server to activate entitlements
      if (requiresPayment) {
        const testPaymentId = `pay_sandbox_${Date.now()}`;
        await confirmPurchasePayment(purchase.id, testPaymentId, gatewayOrder?.orderId);
      }

      setCompletedOrderRef(purchase.publicReference);
      grantReportAccess(targetProjectId, purchase.publicReference);
      grantEntitlementsDirectly(selectedTier, targetProjectId, leadEmail, purchase.publicReference);
      if (projectId && projectId !== targetProjectId) {
        grantReportAccess(projectId, purchase.publicReference);
        grantEntitlementsDirectly(selectedTier, projectId, leadEmail, purchase.publicReference);
      }

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

      setIsProcessing(false);
      setIsCompleted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Checkout error:', err);
      // Strictly enforce access control: NEVER grant free entitlement on error
      setIsProcessing(false);
      setFormError(err.message || 'Payment processing failed. Please check your network or retry.');
    }
  };

  const selectedTierPriceDisplay = selectedTier === 'PREMIUM_1499' ? '₹1,499' : '₹499';

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
                  HUTTY ESTIMATION &bull; DETAILED REPORT UNLOCK
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B3D34] font-heading tracking-tight">
                Unlock Detailed Construction Cost Report
              </h2>
              <p className="text-xs text-[#4B5563]">
                Get a comprehensive breakdown of the work, materials needed, estimated costs, and downloadable PDF report.
              </p>
            </div>

            {/* Plan Tier Selector */}
            <div className="grid grid-cols-2 gap-3">
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
                  RECOMMENDED
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F28C28]">
                    Detailed Report
                  </span>
                  <span className="text-xs font-mono font-black text-[#1B3D34]">₹499</span>
                </div>
                <div className="text-xs font-bold text-[#1B3D34] mt-1">Detailed BOQ Report</div>
                <p className="text-[10px] text-[#4B5563] mt-0.5 line-clamp-1">Works BOQ + Materials + PDF</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier('PREMIUM_1499')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTier === 'PREMIUM_1499'
                    ? 'border-[#1B3D34] bg-[rgba(27,61,52,0.04)] ring-1 ring-[#1B3D34]'
                    : 'border-[#E3E8E2] bg-[#F8F8F6] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#4B5563]">
                    Upgraded
                  </span>
                  <span className="text-xs font-mono font-black text-[#1B3D34]">₹1,499</span>
                </div>
                <div className="text-xs font-bold text-[#1B3D34] mt-1">Calculator — Premium</div>
                <p className="text-[10px] text-[#4B5563] mt-0.5 line-clamp-1">Multi-scenario compare + Full suite</p>
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
                  Instant PDF • Lifetime Access
                </span>
                {selectedTier === 'PREMIUM_1499' && (
                  <span className="text-[9px] text-[#4B5563] block mt-0.5">
                    *Consultation is a separate service
                  </span>
                )}
              </div>
            </div>

            {/* Deliverables Checklist */}
            <div className="space-y-2 text-xs text-[#1B3D34]">
              <span className="font-bold text-[11px] uppercase tracking-wider text-[#4B5563] block">
                {selectedTier === 'PREMIUM_1499'
                  ? 'Included in ₹1,499 Calculator — Premium Plan:'
                  : 'Included in ₹499 Detailed BOQ Report:'}
              </span>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Works BOQ (What We Build):</strong> Detailed civil, structural, finishing, and joinery line items with estimated quantities and market rates.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Materials Needed (What We Consume):</strong> Quantities for steel needed for the house, cement bags, sand, aggregate, blocks, tiles &amp; paint.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Installed Fixtures (What We Install):</strong> Doors, windows, sanitary sets, and plumbing runs.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Cost Summary &amp; Payment Plan:</strong> Labour and work costs, margin &amp; tax schedule, and milestone payment plan.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Downloadable PDF Report:</strong> A detailed report you can discuss with your bank or contractor.</span>
                </div>
                {selectedTier === 'PREMIUM_1499' && (
                  <>
                    <div className="flex items-start gap-2 text-[#1B3D34] font-medium">
                      <Sparkles className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                      <span><strong>Multi-Scenario Comparison:</strong> Save and compare different house plan layouts, floor areas, and finish options side by side.</span>
                    </div>
                    <div className="flex items-start gap-2 text-[#1B3D34] font-medium">
                      <Sparkles className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                      <span><strong>Premium Specification Customizer:</strong> Fine-tune luxury material brands, fixture upgrades, and custom structural specifications.</span>
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
                  {selectedTier === 'PREMIUM_1499' ? 'Calculator — Premium BOQ (₹1,499)' : 'Detailed BOQ Report (₹499)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4B5563]">Status:</span>
                <span className="font-bold text-[#1B3D34]">
                  Unlocked • PDF Generated
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
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
