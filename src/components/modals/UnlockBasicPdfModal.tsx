import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEntitlementStore } from '../../store/useEntitlementStore';
import { usePricingStore } from '../../store/usePricingStore';
import { useReportStore } from '../../store/useReportStore';
import { useCalculationStore } from '../../store/useCalculationStore';
import { useWizardStore } from '../../store/useWizardStore';
import { generateAndDownloadBasicEstimatePdf, viewBasicEstimatePdfInNewTab } from '../../features/report/pdfService';
import { X, Check, Lock, Download, ShieldCheck, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { modalScaleVariant } from '../../animations/variants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UnlockBasicPdfModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { grantBasicPdfAccess } = useEntitlementStore();
  const { initiatePurchase, confirmPurchasePayment, grantEntitlementsDirectly, failPurchasePayment } = usePricingStore();
  const { result } = useCalculationStore();
  const { specificationTier } = useWizardStore();
  const { preparedFor, saveLeadInfo } = useReportStore();

  const [name, setName] = useState(preparedFor || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedOrderRef, setCompletedOrderRef] = useState<string>('');
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

  const projectId = result.report?.projectId || 'HUTTY-EST-2026';

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsProcessing(true);

    const leadName = name.trim() || 'Valued Homeowner';
    const leadPhone = phone.trim() || '9876543210';
    const leadEmail = email.trim() || 'client@example.com';

    saveLeadInfo({
      name: leadName,
      phone: leadPhone,
      email: leadEmail,
    });

    try {
      // 1. Authoritative server purchase creation (enforces ₹99 / 9900 paise on server)
      const { purchase, requiresPayment, gatewayOrder } = await initiatePurchase({
        tierCode: 'BASIC_ESTIMATE_PDF',
        leadName,
        leadPhone,
        leadEmail,
        projectId,
        projectSnapshot: {
          buaSqFt: result.area?.totalBUASqFt,
          totalCostINR: result.budget?.totalProjectCost,
          houseType: result.input?.houseType,
          productType: 'BASIC_ESTIMATE_PDF',
        },
        testBypassPayment: false,
      });

      const hasRazorpay = typeof (window as any).Razorpay !== 'undefined';

      // 2. Real Razorpay gateway integration
      if (requiresPayment && hasRazorpay && gatewayOrder?.keyId && !gatewayOrder.keyId.includes('placeholder')) {
        const rzp = new (window as any).Razorpay({
          key: gatewayOrder.keyId,
          amount: gatewayOrder.amountMinorUnits,
          currency: gatewayOrder.currency,
          name: 'Hutty Pre-Construction Platform',
          description: 'Basic Estimate PDF (Concise Summary)',
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
              grantBasicPdfAccess(projectId, purchase.publicReference);
              grantEntitlementsDirectly('BASIC_ESTIMATE_PDF', projectId, leadEmail, purchase.publicReference);

              try {
                await generateAndDownloadBasicEstimatePdf({
                  data: result,
                  projectName: `${result.input?.houseType || 'Residential'} Estimate`,
                  preparedFor: leadName,
                  specificationTier: specificationTier || 'Premium',
                });
              } catch (pdfErr) {
                console.warn('Basic PDF auto-download notification:', pdfErr);
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
              failPurchasePayment(purchase.id, 'User dismissed checkout modal');
            },
          },
        });
        rzp.open();
        return;
      }

      // 3. In Sandbox / Test environment or when payment is confirmed:
      if (requiresPayment) {
        const testPaymentId = `pay_sandbox_basic_${Date.now()}`;
        await confirmPurchasePayment(purchase.id, testPaymentId, gatewayOrder?.orderId);
      }

      setCompletedOrderRef(purchase.publicReference);
      grantBasicPdfAccess(projectId, purchase.publicReference);
      grantEntitlementsDirectly('BASIC_ESTIMATE_PDF', projectId, leadEmail, purchase.publicReference);

      try {
        await generateAndDownloadBasicEstimatePdf({
          data: result,
          projectName: `${result.input?.houseType || 'Residential'} Estimate`,
          preparedFor: leadName,
          specificationTier: specificationTier || 'Premium',
        });
      } catch (pdfErr) {
        console.warn('Basic PDF auto-download notification:', pdfErr);
      }

      setIsProcessing(false);
      setIsCompleted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setIsProcessing(false);
      setFormError(err.message || 'Payment processing failed. Please check your network or retry.');
    }
  };

  const handleDownloadAgain = async () => {
    try {
      await generateAndDownloadBasicEstimatePdf({
        data: result,
        projectName: `${result.input?.houseType || 'Residential'} Estimate`,
        preparedFor: name || preparedFor || 'Valued Homeowner',
        specificationTier: specificationTier || 'Premium',
      });
    } catch (err) {
      console.error('PDF download error:', err);
    }
  };

  const handlePreviewInTab = async () => {
    try {
      await viewBasicEstimatePdfInNewTab({
        data: result,
        projectName: `${result.input?.houseType || 'Residential'} Estimate`,
        preparedFor: name || preparedFor || 'Valued Homeowner',
        specificationTier: specificationTier || 'Premium',
      });
    } catch (err) {
      console.error('PDF preview error:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="unlock-basic-pdf-portal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unlock-basic-pdf-title"
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
            className="relative z-10 bg-white rounded-2xl border border-[#E3E8E2] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl text-left max-h-[90vh] overflow-y-auto"
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
                {/* Header */}
                <div className="space-y-1.5 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F28C28] bg-[rgba(242,140,40,0.1)] px-2 py-0.5 rounded border border-[#F28C28]/20">
                      HUTTY ESTIMATION &bull; PDF DOWNLOAD
                    </span>
                  </div>
                  <h2 id="unlock-basic-pdf-title" className="text-xl sm:text-2xl font-extrabold text-[#1B3D34] font-heading tracking-tight">
                    Download Basic Estimate PDF
                  </h2>
                  <p className="text-xs text-[#4B5563]">
                    Unlock and download a concise, executive summary of your current estimate in PDF format.
                  </p>
                </div>

                {/* Product & Price Summary Card */}
                <div className="p-4 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider block">Product: Basic Estimate PDF</span>
                    <span className="text-2xl font-black text-[#1B3D34] font-mono">₹99</span>
                    <span className="text-[10px] text-[#4B5563] ml-1">one-time payment</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#1B3D34] bg-white px-2 py-1 rounded border border-[#E3E8E2] block font-mono">
                      Instant PDF Download
                    </span>
                    <span className="text-[9px] text-[#4B5563] block mt-0.5">
                      Single project entitlement
                    </span>
                  </div>
                </div>

                {/* Scope Included */}
                <div className="space-y-2 text-xs text-[#1B3D34]">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-[#4B5563] block">
                    What's Included in the ₹99 PDF:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 text-xs text-[#1B3D34]">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                      <span><strong>Plot &amp; Area Scope:</strong> Plot dimensions, house configuration, and gross built-up area (BUA).</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                      <span><strong>Budget &amp; Rates:</strong> Total estimated construction cost with effective rate per sq.ft.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                      <span><strong>High-Level Cost Split:</strong> High-level breakdown for materials, trade labour, and fixtures.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                      <span><strong>Planning Disclaimer:</strong> Official early planning disclaimer for discussions with contractors.</span>
                    </div>
                  </div>
                </div>

                {/* Transparent Exclusions Notice */}
                <div className="p-3 bg-[rgba(27,61,52,0.04)] border border-[#E3E8E2] rounded-xl text-[11px] text-[#4B5563] space-y-1">
                  <div className="font-bold text-[#1B3D34] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>Please Note:</span>
                  </div>
                  <p>
                    The ₹99 PDF is a concise estimate summary. It does not include itemized trade bills of quantities (BOQ), material takeoff schedules (steel kg, cement bags), or contractor quote audits (available in the Detailed BOQ report for ₹499).
                  </p>
                </div>

                {/* Checkout Form */}
                <form onSubmit={handleUnlock} className="space-y-3.5 pt-1">
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#E3E8E2] focus:border-[#1B3D34] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#E3E8E2] focus:border-[#1B3D34] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E3E8E2] focus:border-[#1B3D34] focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full hutty-btn-primary py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing Secure Payment...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-[#F28C28]" />
                          <span>Pay ₹99 &bull; Download Basic Estimate PDF</span>
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#4B5563] mt-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1B3D34]" />
                      <span>256-bit encrypted checkout &bull; Instant delivery</span>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              /* Success State */
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 bg-[#1B3D34] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F28C28]">
                    PAYMENT CONFIRMED &bull; {completedOrderRef}
                  </span>
                  <h3 className="text-xl font-bold text-[#1B3D34] font-heading">
                    Basic Estimate PDF Unlocked!
                  </h3>
                  <p className="text-xs text-[#4B5563] max-w-sm mx-auto">
                    Your payment of ₹99 was verified. Your Basic Estimate PDF has been generated and downloaded.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    type="button"
                    onClick={handleDownloadAgain}
                    className="hutty-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#F28C28]" />
                    <span>Download PDF Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePreviewInTab}
                    className="px-4 py-2.5 rounded-xl border border-[#E3E8E2] text-xs font-bold text-[#1B3D34] hover:bg-[#F8F8F6] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Preview in Tab</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-[#4B5563] hover:text-[#1B3D34] font-bold underline cursor-pointer"
                  >
                    Back to Estimate
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
