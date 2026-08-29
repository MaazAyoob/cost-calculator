import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { useBudgetResult, useArea, useBOQ, useCalculationStore } from '../../store/useCalculationStore';
import { useWizardStore } from '../../store/useWizardStore';
import { useEntitlementStore } from '../../store/useEntitlementStore';
import { useReportStore } from '../../store/useReportStore';
import { SavedEstimationsModal } from '../../components/modals/SavedEstimationsModal';
import { UnlockReportModal } from '../../components/modals/UnlockReportModal';
import { QuoteReviewModal } from '../../components/modals/QuoteReviewModal';
import { BuildTrackingModal } from '../../components/modals/BuildTrackingModal';
import { PackageComparisonModal } from '../../components/modals/PackageComparisonModal';
import { generateAndDownloadDetailedReportPdf } from '../report/pdfService';
import { formatCurrency } from '../../utils/cn';
import { HuttyLogo } from '../../components/common/HuttyLogo';
import { SEO } from '../../components/common/SEO';
import {
  ChevronLeft,
  FileText,
  PencilLine,
  Save,
  ArrowRight,
  Download,
  Lock,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Activity,
  Layers,
  Award,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const budget = useBudgetResult();
  const area = useArea();
  const boq = useBOQ();
  const { result } = useCalculationStore();
  const { city, plotLength, plotWidth, floors, houseType, specificationTier, selectedPackage } = useWizardStore();
  const { hasDetailedReportAccess } = useEntitlementStore();
  const { preparedFor } = useReportStore();

  const projectId = result.report?.projectId || 'HUTTY-2026-BLR';
  const isReportUnlocked = hasDetailedReportAccess(projectId);

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = budget.costPerSqFt || 0;
  const hasProject = buaSqFt > 0;

  const handleDownloadPdf = async () => {
    if (!isReportUnlocked) {
      setShowUnlockModal(true);
      return;
    }
    setIsGeneratingPdf(true);
    try {
      await generateAndDownloadDetailedReportPdf({
        data: result,
        projectName: `${houseType || 'Residential'} Construction Dossier`,
        preparedFor: preparedFor || 'Valued Homeowner',
        specificationTier: specificationTier || 'Premium',
      });
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const breakdownRows = [
    { label: 'Foundation & Structural Frame', amount: budget.structuralCost },
    { label: 'Flooring & Wet Areas', amount: budget.heads?.find((h) => h.id === 'flooring')?.allocatedAmount ?? 0 },
    { label: 'Doors & Joinery', amount: budget.heads?.find((h) => h.id === 'doorsJoinery')?.allocatedAmount ?? 0 },
    { label: 'Windows & Glazing', amount: budget.heads?.find((h) => h.id === 'windows')?.allocatedAmount ?? 0 },
    { label: 'Electrical Wiring & Conduit', amount: budget.heads?.find((h) => h.id === 'electrical')?.allocatedAmount ?? 0 },
    { label: 'Plumbing & Sanitaryware', amount: budget.heads?.find((h) => h.id === 'plumbingSanitary')?.allocatedAmount ?? 0 },
    { label: 'Painting & Weather Guard', amount: budget.heads?.find((h) => h.id === 'paintingWaterproofing')?.allocatedAmount ?? 0 },
  ];

  return (
    <motion.div
      variants={pageFadeVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-[#F8F8F6] py-8 sm:py-12 select-none"
    >
      <SEO
        title="Project Dashboard | Hutty"
        description="Review your residential construction project summary, product access, and itemized construction dossiers."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 text-left">

        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/calculator')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#4B5563] hover:text-[#1B3D34] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Calculator
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCompareModal(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#1B3D34] px-3 py-1.5 rounded-lg border border-[#1B3D34]/20 bg-[rgba(27,61,52,0.06)] hover:bg-[rgba(27,61,52,0.12)] transition-colors cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
              Compare Standards
            </button>
            <button
              type="button"
              onClick={() => setShowSavedModal(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#1B3D34] px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[rgba(27,61,52,0.04)] transition-colors cursor-pointer shadow-2xs"
            >
              <Save className="w-3.5 h-3.5 text-[#1B3D34]" />
              Saved Projects
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] block">
            HUTTY DASHBOARD
          </span>
          <h1 className="heading-sm text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight">
            Project Overview &amp; Products
          </h1>
        </div>

        {/* ── 1. PROJECT METRICS HERO ── */}
        <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563]">
              ACTIVE PROJECT ESTIMATE
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2.5 py-0.5 rounded border border-[#1B3D34]/15">
                PACKAGE: {(selectedPackage || 'PREMIUM').toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => setShowCompareModal(true)}
                className="text-[10px] font-bold text-[#F28C28] hover:underline cursor-pointer"
              >
                Compare 3 Standards &rarr;
              </button>
            </div>
          </div>

          {hasProject ? (
            <div className="space-y-4">
              <div className="text-4xl sm:text-5xl font-black text-[#1B3D34] tracking-tight font-heading">
                {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E5E7EB]">
                <div>
                  <span className="text-[10px] font-bold text-[#4B5563] uppercase block">BUILT-UP AREA</span>
                  <span className="text-base font-bold text-[#1B3D34] font-heading">{buaSqFt.toLocaleString()} sq.ft</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#4B5563] uppercase block">EFFECTIVE RATE</span>
                  <span className="text-base font-bold text-[#1B3D34] font-heading">₹{ratePerSqFt.toLocaleString()} / sq.ft</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#4B5563] uppercase block">SPECIFICATION</span>
                  <span className="text-base font-bold text-[#1B3D34] font-heading capitalize">{selectedPackage || 'Premium'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#4B5563] uppercase block">PLOT &amp; LOCATION</span>
                  <span className="text-base font-bold text-[#1B3D34] font-heading">{city || 'Bangalore'} &bull; {plotLength}×{plotWidth}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-[#4B5563]">No active project configuration yet.</p>
              <button
                type="button"
                onClick={() => navigate('/calculator')}
                className="hutty-btn-primary text-xs font-bold px-4 py-2 rounded-lg"
              >
                Configure in Calculator
              </button>
            </div>
          )}
        </section>

        {/* ── 2. MY HUTTY PRODUCTS (THE 4 OFFERINGS HUB) ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1B3D34] font-heading">
              MY HUTTY PRODUCTS
            </h2>
            <span className="text-[10px] text-[#4B5563]">4 Core Customer Offerings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* 1. Free Estimate */}
            <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[rgba(27,61,52,0.08)] text-[#1B3D34] flex items-center justify-center font-bold text-xs">
                      01
                    </div>
                    <span className="text-xs font-bold text-[#1B3D34]">What should it cost?</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#1B3D34]" /> Completed &bull; Free
                  </span>
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Interactive deterministic construction estimate based on site geometry and municipal bylaws.
                </p>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#1B3D34]">{formatCurrency(totalCost)}</span>
                <button
                  type="button"
                  onClick={() => navigate('/calculator')}
                  className="hutty-btn-secondary px-3 py-1.5 text-xs rounded-lg font-bold cursor-pointer"
                >
                  Edit Inputs &rarr;
                </button>
              </div>
            </div>

            {/* 2. Detailed Report (₹4,999) */}
            <div className={`p-5 bg-white rounded-2xl border shadow-xs space-y-3 flex flex-col justify-between transition-all ${
              isReportUnlocked ? 'border-[#1B3D34] ring-1 ring-[#1B3D34]' : 'border-[#E5E7EB]'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[rgba(27,61,52,0.08)] text-[#1B3D34] flex items-center justify-center font-bold text-xs">
                      02
                    </div>
                    <span className="text-xs font-bold text-[#1B3D34]">What am I paying for?</span>
                  </div>
                  {isReportUnlocked ? (
                    <span className="text-[10px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-[#F28C28] bg-[rgba(242,140,40,0.1)] px-2 py-0.5 rounded border border-[#F28C28]/20">
                      ₹4,999
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Detailed 13-stage BOQ, physical steel/cement schedules, fixture lists, and contractor margin breakdowns.
                </p>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/report')}
                  className="text-xs font-bold text-[#1B3D34] hover:underline cursor-pointer"
                >
                  View Dossier
                </button>

                {isReportUnlocked ? (
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="hutty-btn-primary px-3.5 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>Download PDF</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowUnlockModal(true)}
                    className="hutty-btn-primary px-3.5 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>Unlock Detailed Report &bull; ₹4,999</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3. Quote Review (₹8,999) */}
            <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[rgba(27,61,52,0.08)] text-[#1B3D34] flex items-center justify-center font-bold text-xs">
                      03
                    </div>
                    <span className="text-xs font-bold text-[#1B3D34]">Should I sign this?</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#F28C28] bg-[rgba(242,140,40,0.1)] px-2 py-0.5 rounded border border-[#F28C28]/20">
                    ₹8,999
                  </span>
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Contractor quote review, rate validation, missing scope identification, and agreement negotiation support.
                </p>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-[11px] text-[#4B5563]">Before appointing contractor</span>
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(true)}
                  className="hutty-btn-primary px-3.5 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Get a Second Opinion</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                </button>
              </div>
            </div>

            {/* 4. Build Tracking (Subscription) */}
            <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[rgba(27,61,52,0.08)] text-[#1B3D34] flex items-center justify-center font-bold text-xs">
                      04
                    </div>
                    <span className="text-xs font-bold text-[#1B3D34]">Where is my money going?</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded">
                    SUBSCRIPTION
                  </span>
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Construction budget, planned vs. actual spending ledger, milestone verification, and material cost tracking.
                </p>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-[11px] text-[#4B5563]">During site construction</span>
                <button
                  type="button"
                  onClick={() => setShowTrackModal(true)}
                  className="hutty-btn-primary px-3.5 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Track My Build</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ── 3. TRADE ALLOCATION PREVIEW ── */}
        {hasProject && (
          <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563] block">
              TRADE COST ALLOCATION
            </span>
            <div className="divide-y divide-[#E5E7EB] text-xs">
              {breakdownRows.map((row) => (
                <div key={row.label} className="py-2.5 flex items-center justify-between">
                  <span className="text-[#4B5563]">{row.label}</span>
                  <span className="font-bold text-[#1B3D34] font-mono">{formatCurrency(row.amount)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Modals */}
      <PackageComparisonModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
      />
      <SavedEstimationsModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
      />
      <UnlockReportModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
      />
      <QuoteReviewModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
      <BuildTrackingModal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
      />
    </motion.div>
  );
};
