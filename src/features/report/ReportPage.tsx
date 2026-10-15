import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { useReportStore } from '../../store/useReportStore';
import { useCalculationStore } from '../../store/useCalculationStore';
import { useWizardStore } from '../../store/useWizardStore';
import { useEntitlementStore } from '../../store/useEntitlementStore';
import { usePricingStore } from '../../store/usePricingStore';
import { PricingTierCode } from '../../types/pricing';
import { UnlockReportModal } from '../../components/modals/UnlockReportModal';
import { UnlockBasicPdfModal } from '../../components/modals/UnlockBasicPdfModal';
import { CalculationTraceModal } from '../../components/modals/CalculationTraceModal';
import { generateAndDownloadDetailedReportPdf, viewDetailedReportPdfInNewTab, generateAndDownloadBasicEstimatePdf } from './pdfService';
import { isDevPdfTestingEnabled } from '../../config/devTesting';
import { Printer, Download, ArrowLeft, Lock, ShieldCheck, Sparkles, FileText, ArrowRight, Calculator, RotateCcw, AlertCircle, CheckCircle2, Check, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/cn';
import { HuttyLogo } from '../../components/common/HuttyLogo';
import { SEO } from '../../components/common/SEO';
import { getApiUrl } from '../../config/api';

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { preparedFor } = useReportStore();
  const { specificationTier } = useWizardStore();
  const { result } = useCalculationStore();
  const { hasDetailedReportAccess, hasBasicPdfAccess, revokeReportAccess, revokeBasicPdfAccess } = useEntitlementStore();
  const { canAccessFeature, getProjectTier } = usePricingStore();

  const { report, area, quantities, budget, timeline, paymentPlan, boq, materialSchedule, fixtureSchedule } = result;
  const projectId = report?.projectId || 'HUTTY-2026-BLR';
  const isUnlocked = hasDetailedReportAccess(projectId);
  const isBasicPdfUnlocked = hasBasicPdfAccess(projectId);
  const currentTier = getProjectTier(projectId);
  const isPremiumUnlocked = canAccessFeature('PREMIUM_COMPARISON', projectId) || currentTier === 'PREMIUM_1499';
  const devTestingActive = isDevPdfTestingEnabled();

  const totalCost = budget.totalProjectCost || budget.directConstructionBudget || 0;
  const materialCost = budget.directMaterialCost || Math.round(totalCost * 0.58);
  const labourCost = budget.directLabourCost || Math.round(totalCost * 0.23);
  const fixtureCost = budget.directFixtureCost || Math.round(totalCost * 0.11);
  const commercialReserves = Math.max(0, totalCost - (materialCost + labourCost + fixtureCost));

  const [unlockModalTier, setUnlockModalTier] = useState<PricingTierCode>('DETAILED_ESTIMATE_499');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showBasicPdfModal, setShowBasicPdfModal] = useState(false);
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingBasicPdf, setIsGeneratingBasicPdf] = useState(false);
  const [isGeneratingDevPdf, setIsGeneratingDevPdf] = useState(false);
  const [devPdfError, setDevPdfError] = useState<string | null>(null);

  const handleDevViewPdf = async () => {
    if (!isDevPdfTestingEnabled()) return;
    setDevPdfError(null);
    setIsGeneratingDevPdf(true);
    try {
      await viewDetailedReportPdfInNewTab({
        data: result,
        projectName: `${result.input?.houseType || 'Residential'} Construction Dossier`,
        preparedFor: preparedFor || 'Developer Testing',
        specificationTier: specificationTier || 'Premium',
        isPremium: true,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Dev PDF preview error:', err);
      setDevPdfError(msg);
    } finally {
      setIsGeneratingDevPdf(false);
    }
  };

  const handleDevDownloadPdf = async () => {
    if (!isDevPdfTestingEnabled()) return;
    setDevPdfError(null);
    setIsGeneratingDevPdf(true);
    try {
      await generateAndDownloadDetailedReportPdf({
        data: result,
        projectName: `${result.input?.houseType || 'Residential'} Construction Dossier`,
        preparedFor: preparedFor || 'Developer Testing',
        specificationTier: specificationTier || 'Premium',
        isPremium: true,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Dev PDF download error:', err);
      setDevPdfError(msg);
    } finally {
      setIsGeneratingDevPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!isUnlocked) {
      setUnlockModalTier('DETAILED_ESTIMATE_499');
      setShowUnlockModal(true);
      return;
    }

    setIsGeneratingPdf(true);
    try {
      // Server-authoritative entitlement verification (do not trust localStorage alone)
      try {
        const leadEmail = useReportStore.getState().leadInfo?.email || '';
        const verifyRes = await fetch(
          getApiUrl(`/api/v1/pricing/check-access?featureCode=FULL_PDF_REPORT&projectId=${encodeURIComponent(projectId)}&email=${encodeURIComponent(leadEmail)}`)
        );
        if (verifyRes.ok) {
          const authData = await verifyRes.json();
          if (authData && authData.allowed === false) {
            revokeReportAccess(projectId);
            setUnlockModalTier('DETAILED_ESTIMATE_499');
            setShowUnlockModal(true);
            return;
          }
        }
      } catch {
        // Network offline graceful fallback
      }

      await generateAndDownloadDetailedReportPdf({
        data: result,
        projectName: `${result.input?.houseType || 'Residential'} Construction Dossier`,
        preparedFor: preparedFor || 'Valued Client',
        specificationTier: isPremiumUnlocked ? 'Calculator — Premium' : (specificationTier || 'Detailed BOQ'),
        isPremium: isPremiumUnlocked,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadBasicPdf = async () => {
    if (!isBasicPdfUnlocked) {
      setShowBasicPdfModal(true);
      return;
    }

    setIsGeneratingBasicPdf(true);
    try {
      // Server-authoritative entitlement verification (do not trust localStorage alone)
      try {
        const leadEmail = useReportStore.getState().leadInfo?.email || '';
        const verifyRes = await fetch(
          getApiUrl(`/api/v1/pricing/check-access?featureCode=BASIC_PDF_DOWNLOAD&projectId=${encodeURIComponent(projectId)}&email=${encodeURIComponent(leadEmail)}`)
        );
        if (verifyRes.ok) {
          const authData = await verifyRes.json();
          if (authData && authData.allowed === false) {
            revokeBasicPdfAccess(projectId);
            setShowBasicPdfModal(true);
            return;
          }
        }
      } catch {
        // Network offline graceful fallback
      }

      await generateAndDownloadBasicEstimatePdf({
        data: result,
        projectName: `${result.input?.houseType || 'Residential'} Estimate`,
        preparedFor: preparedFor || 'Valued Homeowner',
        specificationTier: specificationTier || 'Premium',
      });
    } catch (err) {
      console.error('Error generating Basic PDF:', err);
    } finally {
      setIsGeneratingBasicPdf(false);
    }
  };

  const handlePrintRequest = () => {
    if (!isUnlocked) {
      setUnlockModalTier('DETAILED_ESTIMATE_499');
      setShowUnlockModal(true);
      return;
    }
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.div
      variants={pageFadeVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-[#F8F8F6] py-8 sm:py-12 select-none"
    >
      <SEO
        title={isUnlocked ? "Detailed Construction Report & Work List | Hutty" : "Construction Estimate Preview | Hutty"}
        description="Detailed pre-construction report: Construction Works, Materials Needed, Fixtures & Fittings, and Cost Summary."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 text-left">

        {/* Top Control Bar (Hidden on print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#4B5563] hover:text-[#1B3D34] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                useWizardStore.getState().startNewProject();
                navigate('/calculator');
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-[#1B3D34] hover:bg-[rgba(27,61,52,0.06)] px-3 py-1.5 rounded-lg border border-[#E3E8E2] bg-white transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#F28C28]" /> Start New Project
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!isUnlocked) {
                  setUnlockModalTier('DETAILED_ESTIMATE_499');
                  setShowUnlockModal(true);
                  return;
                }
                setShowTraceModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E3E8E2] bg-white hover:bg-[rgba(27,61,52,0.04)] text-xs font-bold text-[#1B3D34] transition-colors cursor-pointer shadow-2xs"
            >
              <Calculator className="w-3.5 h-3.5 text-[#F28C28]" /> How Calculated
            </button>

            {isUnlocked ? (
              <>
                <button
                  type="button"
                  onClick={handlePrintRequest}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E3E8E2] bg-white hover:bg-[rgba(27,61,52,0.04)] text-xs font-bold text-[#1B3D34] transition-colors cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#1B3D34]" /> Print
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBasicPdf}
                  disabled={isGeneratingBasicPdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E3E8E2] bg-white hover:bg-[rgba(27,61,52,0.04)] text-xs font-bold text-[#1B3D34] transition-colors cursor-pointer shadow-2xs"
                  title="Download concise 1-page summary PDF"
                >
                  <FileText className="w-3.5 h-3.5 text-[#1B3D34]" /> Basic PDF
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="hutty-btn-primary px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#F28C28]" />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Detailed PDF'}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {devTestingActive && (
                  <div className="flex flex-col gap-1 print:hidden">
                    <div className="flex items-center gap-1.5 p-1 bg-amber-50 border border-amber-300 rounded-lg text-xs shadow-2xs">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                        DEV ONLY
                      </span>
                      <button
                        type="button"
                        onClick={handleDevViewPdf}
                        disabled={isGeneratingDevPdf}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold transition-colors cursor-pointer text-[11px] disabled:opacity-60"
                        title="Developer Testing: View full paid PDF in new browser tab"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-700" />
                        <span>{isGeneratingDevPdf ? 'Compiling...' : 'View Full PDF (Testing)'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDevDownloadPdf}
                        disabled={isGeneratingDevPdf}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors cursor-pointer text-[11px] disabled:opacity-60"
                        title="Developer Testing: Download full paid PDF file"
                      >
                        <Download className="w-3.5 h-3.5 text-white" />
                        <span>Download Full PDF (Testing)</span>
                      </button>
                    </div>
                    {devPdfError && (
                      <div className="text-[10px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 font-mono max-w-xs break-words">
                        ⛔ {devPdfError}
                      </div>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleDownloadBasicPdf}
                  disabled={isGeneratingBasicPdf}
                  className="px-3.5 py-1.5 rounded-lg border border-[#1B3D34] bg-white hover:bg-[rgba(27,61,52,0.04)] text-xs font-bold text-[#1B3D34] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Concise estimate summary in downloadable PDF format"
                >
                  <Download className="w-3.5 h-3.5 text-[#F28C28]" />
                  <span>
                    {isGeneratingBasicPdf
                      ? 'Generating PDF...'
                      : isBasicPdfUnlocked
                      ? 'Download Basic Estimate PDF'
                      : 'Download Basic Estimate PDF — ₹99'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(true)}
                  className="hutty-btn-primary px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5 text-[#F28C28]" />
                  <span>Unlock Detailed Report — ₹499</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── UNLOCKED NOTIFICATION BANNER ── */}
        {isUnlocked && (
          <div className="p-4 bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 rounded-2xl flex items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1B3D34] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#1B3D34]">Your detailed report is ready.</h3>
                <p className="text-[11px] text-[#4B5563]">
                  All construction works, materials needed, and stage-by-stage cost schedules are fully unlocked.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="hutty-btn-primary px-4 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>Download Detailed PDF</span>
            </button>
          </div>
        )}

        {/* ── FREE ESTIMATE SUMMARY BANNER (Section 3) ── */}
        {!isUnlocked && (
          <div className="p-4 sm:p-5 bg-white border border-[#E3E8E2] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs print:hidden">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1B3D34] bg-[#F0F5F3] px-2 py-0.5 rounded border border-[#1B3D34]/15">
                  ✓ YOUR ESTIMATE IS READY
                </span>
                <span className="text-xs font-bold text-[#1B3D34]">
                  You can view your estimate here for free.
                </span>
              </div>
              <p className="text-xs text-[#4B5563] leading-relaxed max-w-2xl">
                Your full house configuration, estimated built-up area, and preliminary cost breakdown are visible below. If you need a downloadable copy for your records, unlock the Basic Estimate PDF for ₹99, or get the complete contractor-grade Detailed BOQ for ₹499.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadBasicPdf}
                disabled={isGeneratingBasicPdf}
                className="px-3.5 py-2 rounded-xl border border-[#1B3D34] bg-white hover:bg-[rgba(27,61,52,0.04)] text-xs font-bold text-[#1B3D34] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>
                  {isGeneratingBasicPdf
                    ? 'Generating...'
                    : isBasicPdfUnlocked
                    ? 'Download Basic Estimate PDF'
                    : 'Download Basic Estimate PDF — ₹99'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowUnlockModal(true)}
                className="hutty-btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>Unlock Detailed Report — ₹499</span>
              </button>
            </div>
          </div>
        )}

        {/* ── GRAND ARCHITECTURAL HERO BANNER ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E3E8E2] shadow-xs space-y-6 arch-bracketed print:hidden text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E8E2] pb-4">
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F28C28]">
                YOUR HOME &bull; ESTIMATED CONSTRUCTION PICTURE
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1B3D34] font-heading">
                {result.input?.houseType || 'Residential'} Pre-Construction Dossier
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-3 py-1 rounded-full border border-[#1B3D34]/15">
                PROJECT: {projectId}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-6 lg:col-span-6 space-y-1.5 min-w-0">
              <span className="font-mono text-xs text-[#4B5563] block uppercase tracking-wider">
                TOTAL ESTIMATED CONSTRUCTION BUDGET
              </span>
              <div className="arch-stat-hero text-[#1B3D34]">
                {formatCurrency(budget.totalProjectCost || budget.directConstructionBudget)}
              </div>
              <p className="text-xs text-[#4B5563] max-w-lg">
                Includes civil structural frame, material finishes, MEP services, and verified statutory margins.
              </p>
            </div>

            <div className="md:col-span-6 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="space-y-1 p-4 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2] min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#4B5563] block">
                  GROSS BUILT-UP AREA
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#1B3D34] font-heading block tabular-nums">
                  {area.totalBUASqFt.toLocaleString()} <span className="text-xs font-normal text-[#4B5563]">sq.ft</span>
                </span>
                <span className="text-[11px] font-mono text-[#1B3D34] block whitespace-nowrap">
                  Effective: ₹{(budget.costPerSqFt || budget.directCostPerSqFt).toLocaleString()} / sq.ft
                </span>
              </div>

              <div className="space-y-1 p-4 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2] min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#4B5563] block">
                  ESTIMATED TIMELINE
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#1B3D34] font-heading block tabular-nums">
                  {timeline.totalMonths} <span className="text-xs font-normal text-[#4B5563]">Months</span>
                </span>
                <span className="text-[11px] font-mono text-[#F28C28] font-bold block whitespace-nowrap">
                  {specificationTier?.toUpperCase() || 'PREMIUM'} STANDARDS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── MANDATORY CLIENT ESTIMATE NOTE & COST NOTICE ── */}
        <div className="p-4 sm:p-5 bg-amber-50/90 border-2 border-amber-300 rounded-2xl text-amber-950 flex items-start gap-3.5 shadow-2xs text-left">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 font-heading">
              Important Estimate Note
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-amber-950 leading-relaxed">
              This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked.
            </p>
            <p className="text-[11px] text-amber-800 leading-normal">
              Estimated prices can change by location, material choices, house design, and site conditions. All rates shown are baseline estimates for residential planning.
            </p>
          </div>
        </div>

        {/* Document Sheet */}
        <div className="bg-white border border-[#E3E8E2] rounded-3xl p-8 sm:p-12 shadow-xs space-y-10 print:border-none print:shadow-none print:p-0 arch-bracketed">

          {/* 1. Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-[#1B3D34]">
            <div className="space-y-1">
              <HuttyLogo variant="full" width={140} />
              <p className="text-xs text-[#4B5563] mt-1 font-mono">
                {isUnlocked ? 'Authoritative Construction Dossier & BOQ' : 'High-Level Construction Cost Estimate'}
              </p>
            </div>

            <div className="text-xs text-left sm:text-right space-y-0.5 text-[#4B5563] font-mono">
              <p><strong className="text-[#1B3D34]">Project ID:</strong> {projectId}</p>
              <p><strong className="text-[#1B3D34]">Date:</strong> {currentDate}</p>
              <p><strong className="text-[#1B3D34]">Specification:</strong> {(specificationTier || 'Premium').toUpperCase()}</p>
              <p><strong className="text-[#1B3D34]">Prepared For:</strong> {preparedFor || 'Residential Client'}</p>
              <p><strong className="text-[#1B3D34]">Rate Master:</strong> {report?.rateSourceMetadata?.datasetVersion || result.rateSourceMetadata?.datasetVersion || 'HUTTY-RM-2026.1'}</p>
            </div>
          </div>

          {/* 01. WHAT WE BUILD: Project Geometry & Summary */}
          <section className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b-2 border-[#1B3D34] pb-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-black text-[#F28C28]">01</span>
                <h2 className="text-base font-extrabold uppercase tracking-wider text-[#1B3D34] font-heading">
                  WHAT WE BUILD &bull; PROJECT GEOMETRY &amp; SCOPE
                </h2>
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-[rgba(27,61,52,0.08)] text-[#1B3D34]">
                {result.input?.contractorMode === 'contractor' ? 'Contractor Build' : 'Independent Self-Build'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2]">
                <span className="text-[#4B5563] block">Direct Construction Budget</span>
                <span className="text-base font-extrabold text-[#1B3D34] font-heading block mt-0.5">{formatCurrency(budget.directConstructionBudget || budget.totalProjectCost)}</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2]">
                <span className="text-[#4B5563] block">Built-Up Area (BUA)</span>
                <span className="text-base font-bold text-[#1B3D34] font-heading block mt-0.5">{area.totalBUASqFt.toLocaleString()} sq.ft</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2]">
                <span className="text-[#4B5563] block">Direct Execution Rate</span>
                <span className="text-base font-bold text-[#1B3D34] font-heading block mt-0.5">₹{(budget.directCostPerSqFt || budget.costPerSqFt).toLocaleString()} / sq.ft</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2]">
                <span className="text-[#4B5563] block">Estimated Timeline</span>
                <span className="text-base font-bold text-[#1B3D34] font-heading block mt-0.5">{timeline.totalMonths} Months</span>
              </div>
            </div>

            {/* High-Level Cost Distribution Summary (Basic PDF Content Boundary) */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4B5563] block">
                High-Level Cost Distribution
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[rgba(27,61,52,0.04)] rounded-xl border border-[rgba(27,61,52,0.12)]">
                  <span className="text-[#4B5563] block text-[11px]">1. Construction Materials</span>
                  <span className="text-sm font-bold text-[#1B3D34] font-mono">{formatCurrency(materialCost)}</span>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">Cement, steel, sand &amp; blocks</span>
                </div>
                <div className="p-3 bg-[rgba(27,61,52,0.04)] rounded-xl border border-[rgba(27,61,52,0.12)]">
                  <span className="text-[#4B5563] block text-[11px]">2. Trade Labour</span>
                  <span className="text-sm font-bold text-[#1B3D34] font-mono">{formatCurrency(labourCost)}</span>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">RCC framing, masonry &amp; trades</span>
                </div>
                <div className="p-3 bg-[rgba(27,61,52,0.04)] rounded-xl border border-[rgba(27,61,52,0.12)]">
                  <span className="text-[#4B5563] block text-[11px]">3. Fixtures &amp; Finishes</span>
                  <span className="text-sm font-bold text-[#1B3D34] font-mono">{formatCurrency(fixtureCost)}</span>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">Doors, windows, tiles &amp; MEP</span>
                </div>
                <div className="p-3 bg-[rgba(27,61,52,0.04)] rounded-xl border border-[rgba(27,61,52,0.12)]">
                  <span className="text-[#4B5563] block text-[11px]">4. Commercial Reserves</span>
                  <span className="text-sm font-bold text-[#1B3D34] font-mono">{formatCurrency(commercialReserves)}</span>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">Prelims, margin &amp; contingency</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── PAID DETAILED REPORT DELIVERABLES (GATED BY isUnlocked) ── */}
          {isUnlocked ? (
            <>
              {/* 2. Key Quantities Summary */}
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E3E8E2] pb-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] font-heading">
                    2. Key Structural Quantities
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowTraceModal(true)}
                    className="text-[11px] font-bold text-[#F28C28] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Inspect calculation trace
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2]">
                    <span className="text-[#4B5563] block">Structural Steel</span>
                    <span className="text-sm font-bold text-[#1B3D34] font-mono">{quantities.steelTonnes} Tonnes</span>
                  </div>
                  <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2]">
                    <span className="text-[#4B5563] block">Portland Cement</span>
                    <span className="text-sm font-bold text-[#1B3D34] font-mono">{quantities.cementBags?.toLocaleString()} Bags</span>
                  </div>
                  <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2]">
                    <span className="text-[#4B5563] block">Total RCC Concrete</span>
                    <span className="text-sm font-bold text-[#1B3D34] font-mono">{quantities.rccConcreteTotalCuM || 0} m³</span>
                  </div>
                  <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2]">
                    <span className="text-[#4B5563] block">Block Wall Coverage</span>
                    <span className="text-sm font-bold text-[#1B3D34] font-mono">{(quantities.blockWallCoverageSqFt || quantities.netWallAreaSqFt)?.toLocaleString()} sq.ft</span>
                    <span className="text-[10px] text-[#4B5563] block">{quantities.masonryUnitsCount?.toLocaleString()} Nos</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-2.5 bg-[rgba(27,61,52,0.02)] rounded-lg border border-[#E3E8E2]/80">
                    <span className="text-[10px] text-[#6B7280] block uppercase tracking-wider font-semibold">Footing Concrete</span>
                    <span className="text-xs font-bold text-[#1B3D34] font-mono">{quantities.footingConcreteCuM || 0} m³</span>
                  </div>
                  <div className="p-2.5 bg-[rgba(27,61,52,0.02)] rounded-lg border border-[#E3E8E2]/80">
                    <span className="text-[10px] text-[#6B7280] block uppercase tracking-wider font-semibold">Column Concrete</span>
                    <span className="text-xs font-bold text-[#1B3D34] font-mono">{quantities.columnConcreteCuM || 0} m³</span>
                  </div>
                  <div className="p-2.5 bg-[rgba(27,61,52,0.02)] rounded-lg border border-[#E3E8E2]/80">
                    <span className="text-[10px] text-[#6B7280] block uppercase tracking-wider font-semibold">Slab Concrete</span>
                    <span className="text-xs font-bold text-[#1B3D34] font-mono">{quantities.slabConcreteCuM || 0} m³</span>
                  </div>
                  <div className="p-2.5 bg-[rgba(27,61,52,0.02)] rounded-lg border border-[#E3E8E2]/80">
                    <span className="text-[10px] text-[#6B7280] block uppercase tracking-wider font-semibold">Sand &amp; Aggregates</span>
                    <span className="text-xs font-bold text-[#1B3D34] font-mono">{((quantities.mSandCuFt || 0) + (quantities.pSandCuFt || 0) + (quantities.coarseAggregateCuFt || 0))?.toLocaleString()} CFT</span>
                  </div>
                </div>
              </section>

              {/* ── SECTION 01: WHAT WE BUILD (Works BOQ) ── */}
              {Array.isArray(boq) && boq.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-[#1B3D34] pb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl font-black text-[#F28C28]">01</span>
                      <h2 className="text-base font-extrabold uppercase tracking-wider text-[#1B3D34] font-heading">
                        WHAT WE BUILD &bull; CONSTRUCTION WORKS BOQ
                      </h2>
                    </div>
                    <span className="text-xs text-[#4B5563] font-mono font-bold">{boq.length} Line Items</span>
                  </div>
                  
                  <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                    <table className="w-full text-left text-xs border-collapse min-w-[560px]">
                      <thead>
                        <tr className="border-b border-[#E3E8E2] text-[#687770] font-mono">
                          <th className="py-2.5 font-bold uppercase w-10">Sl</th>
                          <th className="py-2.5 font-bold uppercase">Activity / Work Description</th>
                          <th className="py-2.5 font-bold uppercase text-right">Quantity</th>
                          <th className="py-2.5 font-bold uppercase text-right">Rate</th>
                          <th className="py-2.5 font-bold uppercase text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3E8E2]">
                        {boq.map((item) => (
                          <tr key={item.code || item.slNo} className="hover:bg-[#F8F8F6]/60 transition-colors">
                            <td className="py-2.5 font-mono text-[#687770]">{item.slNo}</td>
                            <td className="py-2.5 text-[#172722] font-medium">
                              {item.description}
                              <span className="block text-[10px] text-[#687770] font-normal">{item.brand} &bull; {item.remarks}</span>
                            </td>
                            <td className="py-2.5 text-right text-[#687770] font-mono whitespace-nowrap">{item.quantity} {item.unit}</td>
                            <td className="py-2.5 text-right text-[#687770] font-mono whitespace-nowrap">₹{item.unitRate.toLocaleString()}</td>
                            <td className="py-2.5 text-right font-bold text-[#172722] font-mono whitespace-nowrap">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* SECTION 02: WHAT WE CONSUME */}
              {Array.isArray(materialSchedule) && materialSchedule.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-[#1B3D34] pb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl font-black text-[#F28C28]">02</span>
                      <h2 className="text-base font-extrabold uppercase tracking-wider text-[#1B3D34] font-heading">
                        WHAT WE CONSUME &bull; MATERIALS NEEDED
                      </h2>
                    </div>
                    <span className="text-xs text-[#4B5563] font-mono font-bold">{materialSchedule.length} Physical Materials</span>
                  </div>
                  <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                    <table className="w-full text-left text-xs border-collapse min-w-[560px]">
                      <thead>
                        <tr className="border-b border-[#E3E8E2] text-[#687770] font-mono">
                          <th className="py-2.5 font-bold uppercase w-10">Sl</th>
                          <th className="py-2.5 font-bold uppercase">Physical Material &amp; Brand</th>
                          <th className="py-2.5 font-bold uppercase text-right">Quantity</th>
                          <th className="py-2.5 font-bold uppercase text-right">Unit Rate</th>
                          <th className="py-2.5 font-bold uppercase text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3E8E2]">
                        {materialSchedule.map((mat) => (
                          <tr key={mat.slNo} className="hover:bg-[#F8F8F6]/60 transition-colors">
                            <td className="py-2.5 font-mono text-[#687770]">{mat.slNo}</td>
                            <td className="py-2.5 text-[#172722] font-medium">
                              {mat.material}
                              <span className="block text-[10px] text-[#687770] font-normal">{mat.brand} &bull; {mat.specification}</span>
                            </td>
                            <td className="py-2.5 text-right text-[#687770] font-mono whitespace-nowrap">{mat.quantity.toLocaleString()} {mat.unit}</td>
                            <td className="py-2.5 text-right text-[#687770] font-mono whitespace-nowrap">₹{mat.unitRate.toLocaleString()}</td>
                            <td className="py-2.5 text-right font-bold text-[#172722] font-mono whitespace-nowrap">{formatCurrency(mat.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* SECTION 03: WHAT WE INSTALL */}
              {Array.isArray(fixtureSchedule) && fixtureSchedule.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-[#1B3D34] pb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl font-black text-[#F28C28]">03</span>
                      <h2 className="text-base font-extrabold uppercase tracking-wider text-[#1B3D34] font-heading">
                        WHAT WE INSTALL &bull; FIXTURES, FITTINGS, AND SERVICES
                      </h2>
                    </div>
                    <span className="text-xs text-[#687770] font-mono font-bold">{fixtureSchedule.length} Installed Units</span>
                  </div>
                  <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                    <table className="w-full text-left text-xs border-collapse min-w-[560px]">
                      <thead>
                        <tr className="border-b border-[#E3E8E2] text-[#687770] font-mono">
                          <th className="py-2.5 font-bold uppercase w-10">Sl</th>
                          <th className="py-2.5 font-bold uppercase">Installed Fixture / Equipment</th>
                          <th className="py-2.5 font-bold uppercase">Location</th>
                          <th className="py-2.5 font-bold uppercase text-right">Quantity</th>
                          <th className="py-2.5 font-bold uppercase text-right">Rate</th>
                          <th className="py-2.5 font-bold uppercase text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3E8E2]">
                        {fixtureSchedule.map((fix) => (
                          <tr key={fix.slNo} className="hover:bg-[#F8F8F6]/60 transition-colors">
                            <td className="py-2.5 font-mono text-[#687770]">{fix.slNo}</td>
                            <td className="py-2.5 text-[#172722] font-medium">
                              {fix.item}
                              <span className="block text-[10px] text-[#687770] font-normal">{fix.brand} &bull; {fix.specification}</span>
                            </td>
                            <td className="py-2.5 text-[#687770] text-[11px]">{fix.location}</td>
                            <td className="py-2.5 text-right text-[#687770] font-mono whitespace-nowrap">{fix.quantity} {fix.unit}</td>
                            <td className="py-2.5 text-right text-[#687770] font-mono whitespace-nowrap">₹{fix.unitRate.toLocaleString()}</td>
                            <td className="py-2.5 text-right font-bold text-[#172722] font-mono whitespace-nowrap">{formatCurrency(fix.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* SECTION 04: WHAT IT COSTS */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-[#1B3D34] pb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl font-black text-[#F28C28]">04</span>
                    <h2 className="text-base font-extrabold uppercase tracking-wider text-[#1B3D34] font-heading">
                      WHAT IT COSTS &bull; COST SUMMARY &amp; COMMERCIAL DETAILS
                    </h2>
                  </div>
                  <span className="text-xs text-[#687770] font-mono font-bold">100% RECONCILED</span>
                </div>

                {/* 4 Summary Cards: Materials, Labour, Other Costs, Total Estimated Cost */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                  <div className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#687770] block">Materials</span>
                    <span className="text-base font-extrabold text-[#1B3D34] font-heading block mt-0.5">
                      {formatCurrency(budget.baseConstructionCost ? Math.round(budget.baseConstructionCost * 0.65) : Math.round((budget.totalProjectCost || 0) * 0.55))}
                    </span>
                    <span className="text-[10px] text-[#687770] block">Civil materials, steel, cement &amp; finishes</span>
                  </div>
                  <div className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#687770] block">Labour</span>
                    <span className="text-base font-extrabold text-[#1B3D34] font-heading block mt-0.5">
                      {formatCurrency(budget.baseConstructionCost ? Math.round(budget.baseConstructionCost * 0.35) : Math.round((budget.totalProjectCost || 0) * 0.25))}
                    </span>
                    <span className="text-[10px] text-[#687770] block">Execution trades &amp; workmanship</span>
                  </div>
                  <div className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#687770] block">Other Costs</span>
                    <span className="text-base font-extrabold text-[#1B3D34] font-heading block mt-0.5">
                      {formatCurrency((budget.contractorMargin || 0) + (budget.contingency || 0) + (budget.gstAmount || 0))}
                    </span>
                    <span className="text-[10px] text-[#687770] block">Margin, contingency &amp; GST</span>
                  </div>
                  <div className="p-3.5 bg-[rgba(27,61,52,0.06)] rounded-xl border border-[#1B3D34]/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B3D34] block">Total Estimated Cost</span>
                    <span className="text-base font-extrabold text-[#1B3D34] font-heading block mt-0.5">
                      {formatCurrency(budget.totalProjectCost)}
                    </span>
                    <span className="text-[10px] text-[#1B3D34] font-semibold block">All-inclusive total</span>
                  </div>
                </div>

                {/* Proportional Trade Allocation Horizontal Bar */}
                <div className="space-y-2 p-4 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2]">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#687770] block">
                    WHERE YOUR MONEY GOES (PROPORTIONAL DISTRIBUTION)
                  </span>
                  <div className="h-6 w-full rounded-xl overflow-hidden flex border border-[#E3E8E2] bg-white p-0.5">
                    {budget.heads.map((head, idx) => (
                      <div
                        key={head.id}
                        style={{
                          width: `${Math.max(4, head.percentage)}%`,
                          backgroundColor: idx % 2 === 0 ? '#1B3D34' : '#F28C28',
                        }}
                        className="h-full first:rounded-l-lg last:rounded-r-lg opacity-90 transition-all hover:opacity-100"
                        title={`${head.name}: ${head.percentage}%`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                    <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-[#E3E8E2] text-[#687770] font-mono">
                          <th className="py-2.5 font-bold uppercase">Trade Category</th>
                          <th className="py-2.5 font-bold uppercase text-right">Amount (INR)</th>
                          <th className="py-2.5 font-bold uppercase text-right">% of Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3E8E2]">
                        {budget.heads.map((head) => (
                          <tr key={head.id} className="hover:bg-[#F8F8F6]/60 transition-colors">
                            <td className="py-2.5 font-medium text-[#172722]">{head.name}</td>
                            <td className="py-2.5 text-right font-bold text-[#172722] font-mono">{formatCurrency(head.allocatedAmount)}</td>
                            <td className="py-2.5 text-right font-mono text-[#687770]">{head.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-[#1B3D34] text-xs">
                          <td className="py-3 font-black text-[#1B3D34] uppercase font-heading">Total Project Cost (All Inclusive)</td>
                          <td className="py-3 text-right font-black text-[#1B3D34] font-mono text-sm">{formatCurrency(budget.totalProjectCost)}</td>
                          <td className="py-3 text-right font-black text-[#1B3D34] font-mono text-sm">100.0%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </section>

              {/* 5. Milestone Payment Schedule */}
              {Array.isArray(paymentPlan) && paymentPlan.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] border-b border-[#E3E8E2] pb-1.5 font-heading">
                    5. Payment Plan (Milestone Schedule)
                  </h2>
                  <div className="space-y-2">
                    {paymentPlan.map((stage) => (
                      <div key={stage.stage} className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2] flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-[#1B3D34] block">Stage {stage.stage}: {stage.title}</span>
                          <span className="text-[10px] text-[#4B5563]">{stage.description}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#1B3D34] font-mono block">{formatCurrency(stage.amount)}</span>
                          <span className="text-[10px] text-[#4B5563]">{stage.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            /* Locked Teaser Banner for Detailed BOQ Deliverables */
            <div className="p-8 bg-[#F8F8F6] rounded-2xl border-2 border-dashed border-[#1B3D34]/30 space-y-6 text-center">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F28C28] bg-white px-3 py-1 rounded-md border border-[#E3E8E2] inline-block">
                  DETAILED DELIVERABLES &bull; ₹499
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1B3D34] font-heading">
                  Want to see the complete contractor-grade bill of quantities?
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] max-w-lg mx-auto leading-relaxed">
                  Unlock the full itemized Works BOQ, structural steel and cement schedules, doors and windows schedule, and milestone payment roadmap.
                </p>
              </div>

              {/* Teaser Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left max-w-3xl mx-auto">
                <div className="p-3.5 bg-white rounded-xl border border-[#E3E8E2] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B3D34]">
                    <FileText className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>Section 01 &bull; Works BOQ</span>
                  </div>
                  <p className="text-[10px] text-[#4B5563]">Itemized trade activities with verified quantities, unit rates, and totals.</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-[#E3E8E2] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B3D34]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>Section 02 &bull; Materials</span>
                  </div>
                  <p className="text-[10px] text-[#4B5563]">Exact steel tonnage, cement bag counts, sand volumes &amp; masonry blocks.</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-[#E3E8E2] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B3D34]">
                    <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>Section 03 &bull; Fixtures</span>
                  </div>
                  <p className="text-[10px] text-[#4B5563]">Door schedule, window areas, sanitary suites &amp; CPVC plumbing lengths.</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-[#E3E8E2] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B3D34]">
                    <Calculator className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>Section 04/05 &bull; Costs</span>
                  </div>
                  <p className="text-[10px] text-[#4B5563]">Contractor margins, contingency, and milestone payment roadmap.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUnlockModalTier('DETAILED_ESTIMATE_499');
                    setShowUnlockModal(true);
                  }}
                  className="hutty-btn-primary px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-[#F28C28]" />
                  <span>Unlock Detailed Report — ₹499</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {devTestingActive && (
                  <div className="mt-4 pt-3 border-t border-dashed border-amber-300 flex flex-col items-center gap-2">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                        DEV TESTING BYPASS
                      </span>
                      <button
                        type="button"
                        onClick={handleDevViewPdf}
                        disabled={isGeneratingDevPdf}
                        className="text-xs font-bold text-amber-900 hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-60"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-700" />
                        <span>{isGeneratingDevPdf ? 'Compiling...' : 'View Full PDF (Testing)'}</span>
                      </button>
                      <span className="text-amber-400 hidden sm:inline">&bull;</span>
                      <button
                        type="button"
                        onClick={handleDevDownloadPdf}
                        disabled={isGeneratingDevPdf}
                        className="text-xs font-bold text-amber-900 hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-60"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-700" />
                        <span>Download Full PDF (Testing)</span>
                      </button>
                    </div>
                    {devPdfError && (
                      <div className="text-[10px] text-red-700 bg-red-50 border border-red-200 rounded px-3 py-1.5 font-mono max-w-lg text-left break-words w-full">
                        ⛔ {devPdfError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SECTION 05, 06, 07: PREMIUM DELIVERABLES (₹1,499) ── */}
          {isPremiumUnlocked ? (
            <div className="space-y-8 pt-4 border-t-2 border-[#1B3D34]">
              {/* Premium Plan Unlocked Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E3E8E2]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-white bg-[#1B3D34] px-2.5 py-1 rounded">
                    PREMIUM TIER DELIVERABLES
                  </span>
                  <span className="text-xs font-bold text-[#1B3D34]">
                    Contractor Quote Audit, Finish Sensitivity &amp; Multi-Scenario Comparison
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> UNLOCKED
                </span>
              </div>

              {/* 05. Contractor Quote Audit & Redline Checklist */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-[#1B3D34] pb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl font-black text-[#F28C28]">05</span>
                    <div>
                      <h2 className="text-base font-extrabold uppercase tracking-wider text-[#1B3D34] font-heading">
                        CONTRACTOR QUOTE AUDIT &bull; REDLINE CHECKLIST
                      </h2>
                      <p className="text-[11px] text-[#4B5563]">
                        Compare your contractor's quotation against Bangalore benchmark trade rates and verify high-risk exclusions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trade Tolerance Benchmarks Table */}
                <div className="border border-[#E3E8E2] rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <div className="p-3 bg-[#F8F8F6] border-b border-[#E3E8E2] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1B3D34]">Trade Rate Tolerance Benchmarks (Bangalore Q1 2026)</span>
                    <span className="text-[10px] text-[#4B5563] font-mono">Acceptable Market Tolerances</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#F8F8F6]/60 border-b border-[#E3E8E2] text-[10px] text-[#4B5563] uppercase">
                        <tr>
                          <th className="py-2.5 px-4">Material / Trade Item</th>
                          <th className="py-2.5 px-4">Standard Unit</th>
                          <th className="py-2.5 px-4 text-right">Market Benchmark</th>
                          <th className="py-2.5 px-4 text-right">Allowable Variance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3E8E2]">
                        <tr className="hover:bg-[#F8F8F6]">
                          <td className="py-2.5 px-4 font-bold text-[#1B3D34]">Structural TMT Steel (Fe 550D)</td>
                          <td className="py-2.5 px-4 text-[#4B5563]">Per Kg</td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#1B3D34]">₹68 – ₹76</td>
                          <td className="py-2.5 px-4 text-right text-emerald-700 font-semibold">±5% max</td>
                        </tr>
                        <tr className="hover:bg-[#F8F8F6]">
                          <td className="py-2.5 px-4 font-bold text-[#1B3D34]">53-Grade Portland Cement</td>
                          <td className="py-2.5 px-4 text-[#4B5563]">50kg Bag</td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#1B3D34]">₹380 – ₹420</td>
                          <td className="py-2.5 px-4 text-right text-emerald-700 font-semibold">±4% max</td>
                        </tr>
                        <tr className="hover:bg-[#F8F8F6]">
                          <td className="py-2.5 px-4 font-bold text-[#1B3D34]">Solid Concrete Masonry Blocks (6")</td>
                          <td className="py-2.5 px-4 text-[#4B5563]">Per Block</td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#1B3D34]">₹42 – ₹48</td>
                          <td className="py-2.5 px-4 text-right text-emerald-700 font-semibold">±5% max</td>
                        </tr>
                        <tr className="hover:bg-[#F8F8F6]">
                          <td className="py-2.5 px-4 font-bold text-[#1B3D34]">Civil RCC Labour (Framed Structure)</td>
                          <td className="py-2.5 px-4 text-[#4B5563]">Per sq.ft BUA</td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#1B3D34]">₹240 – ₹280</td>
                          <td className="py-2.5 px-4 text-right text-emerald-700 font-semibold">±6% max</td>
                        </tr>
                        <tr className="hover:bg-[#F8F8F6]">
                          <td className="py-2.5 px-4 font-bold text-[#1B3D34]">Tile Laying &amp; Grouting Labour</td>
                          <td className="py-2.5 px-4 text-[#4B5563]">Per sq.ft</td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#1B3D34]">₹35 – ₹45</td>
                          <td className="py-2.5 px-4 text-right text-emerald-700 font-semibold">±8% max</td>
                        </tr>
                        <tr className="hover:bg-[#F8F8F6]">
                          <td className="py-2.5 px-4 font-bold text-[#1B3D34]">Interior Emulsion (2 Coats + Putty)</td>
                          <td className="py-2.5 px-4 text-[#4B5563]">Per sq.ft</td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#1B3D34]">₹18 – ₹26</td>
                          <td className="py-2.5 px-4 text-right text-emerald-700 font-semibold">±7% max</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Missing Scope Redlines Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Soil Bearing Capacity Test</span>
                    </div>
                    <p className="text-[11px] text-amber-950 leading-relaxed">
                      Frequently excluded by turnkey contractors. Demand a geotechnical soil test report before footing depth sign-off to prevent foundation settlement.
                    </p>
                  </div>
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Temporary 3-Phase Power &amp; Water</span>
                    </div>
                    <p className="text-[11px] text-amber-950 leading-relaxed">
                      Verify whether BESCOM temporary power deposit, commercial meter wiring, and borewell curing water are included in contractor lump sum.
                    </p>
                  </div>
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Compound Wall &amp; Gate Columns</span>
                    </div>
                    <p className="text-[11px] text-amber-950 leading-relaxed">
                      Often billed as an unexpected extra variation later. Ensure running linear footage, foundation depth, and main gate pillars are in contract.
                    </p>
                  </div>
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Sump Waterproofing &amp; Debris Clearing</span>
                    </div>
                    <p className="text-[11px] text-amber-950 leading-relaxed">
                      Ensure 2-coat crystalline polymer waterproofing for underground RCC water tank and periodic carting of construction debris away from site.
                    </p>
                  </div>
                </div>
              </section>

              {/* 06. Material Finish Sensitivity Matrix */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-[#1B3D34] pb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl font-black text-[#F28C28]">06</span>
                    <div>
                      <h2 className="text-base font-extrabold uppercase tracking-wider text-[#1B3D34] font-heading">
                        MATERIAL FINISH SENSITIVITY &bull; PRICE MATRIX
                      </h2>
                      <p className="text-[11px] text-[#4B5563]">
                        Trade-off analysis across Standard, Premium, and Luxury specifications on your {area.totalBUASqFt.toLocaleString()} sq.ft gross BUA.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-[#E3E8E2] rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono min-w-[560px]">
                    <thead className="bg-[#F8F8F6] border-b border-[#E3E8E2] text-[10px] text-[#4B5563] uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Finish Package</th>
                        <th className="py-2.5 px-4">Material Specification Scope</th>
                        <th className="py-2.5 px-4 text-right">Est. Rate / sq.ft</th>
                        <th className="py-2.5 px-4 text-right">Total Project Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E8E2]">
                      <tr className="hover:bg-[#F8F8F6]">
                        <td className="py-3 px-4 font-bold text-[#1B3D34]">Standard Package</td>
                        <td className="py-3 px-4 text-[#4B5563]">Vitrified 2x2, standard 3-track UPVC, OBD paint, baseline CP fixtures</td>
                        <td className="py-3 px-4 text-right font-bold text-[#1B3D34]">₹1,950 / sq.ft</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">
                          - {formatCurrency(Math.max(0, (budget.costPerSqFt || 2250) - 1950) * area.totalBUASqFt)}
                        </td>
                      </tr>
                      <tr className="bg-[rgba(27,61,52,0.04)] font-bold text-[#1B3D34]">
                        <td className="py-3 px-4 flex items-center gap-1.5">
                          <span>Premium Package</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#1B3D34] text-white">Selected</span>
                        </td>
                        <td className="py-3 px-4 text-[#1B3D34]">GVT 4x2, Schuco/Kommerling UPVC, Royal luxury emulsion, Jaguar fittings</td>
                        <td className="py-3 px-4 text-right">₹{Math.round(budget.costPerSqFt || 2250).toLocaleString('en-IN')} / sq.ft</td>
                        <td className="py-3 px-4 text-right text-[#F28C28]">Baseline Reference</td>
                      </tr>
                      <tr className="hover:bg-[#F8F8F6]">
                        <td className="py-3 px-4 font-bold text-[#1B3D34]">Luxury Package</td>
                        <td className="py-3 px-4 text-[#4B5563]">Italian marble/engineered wood, thermal-break aluminium, Grohe/Kohler, smart home</td>
                        <td className="py-3 px-4 text-right font-bold text-[#1B3D34]">₹2,850 / sq.ft</td>
                        <td className="py-3 px-4 text-right font-bold text-red-700">
                          + {formatCurrency(Math.max(0, 2850 - (budget.costPerSqFt || 2250)) * area.totalBUASqFt)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

              {/* 07. Multi-Scenario Layout Comparison */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-[#1B3D34] pb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl font-black text-[#F28C28]">07</span>
                    <div>
                      <h2 className="text-base font-extrabold uppercase tracking-wider text-[#1B3D34] font-heading">
                        MULTI-SCENARIO PROJECT COMPARISON
                      </h2>
                      <p className="text-[11px] text-[#4B5563]">
                        Compare alternative floor configurations on your {result.input?.plotLength || 30}' × {result.input?.plotWidth || 40}' plot.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#F8F8F6] border border-[#E3E8E2] rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#4B5563] block">Scenario A</span>
                    <h3 className="text-sm font-bold text-[#1B3D34]">Single Floor (Compact)</h3>
                    <div className="text-xs space-y-1 pt-1 font-mono">
                      <div className="flex justify-between text-[#4B5563]">
                        <span>Gross BUA:</span>
                        <span className="font-bold text-[#1B3D34]">{(area.buaPerFloorSqFt || Math.round(area.totalBUASqFt / (result.input?.floors || 1))).toLocaleString()} sq.ft</span>
                      </div>
                      <div className="flex justify-between text-[#4B5563]">
                        <span>Budget:</span>
                        <span className="font-bold text-[#1B3D34]">{formatCurrency((area.buaPerFloorSqFt || Math.round(area.totalBUASqFt / (result.input?.floors || 1))) * (budget.costPerSqFt || 2250))}</span>
                      </div>
                      <div className="flex justify-between text-[#4B5563]">
                        <span>Rate:</span>
                        <span>₹{Math.round(budget.costPerSqFt || 2250).toLocaleString('en-IN')}/sqft</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[rgba(27,61,52,0.06)] border-2 border-[#1B3D34] rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#1B3D34] font-bold">Scenario B</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#1B3D34] text-white font-bold">Current Plan</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1B3D34]">G+{Math.max(0, (result.input?.floors || 1) - 1)} Design ({result.input?.floors || 1} Floors)</h3>
                    <div className="text-xs space-y-1 pt-1 font-mono">
                      <div className="flex justify-between text-[#4B5563]">
                        <span>Gross BUA:</span>
                        <span className="font-bold text-[#1B3D34]">{area.totalBUASqFt.toLocaleString()} sq.ft</span>
                      </div>
                      <div className="flex justify-between text-[#4B5563]">
                        <span>Budget:</span>
                        <span className="font-bold text-[#1B3D34]">{formatCurrency(budget.totalProjectCost || budget.directConstructionBudget)}</span>
                      </div>
                      <div className="flex justify-between text-[#4B5563]">
                        <span>Rate:</span>
                        <span>₹{Math.round(budget.costPerSqFt || budget.directCostPerSqFt).toLocaleString('en-IN')}/sqft</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F8F8F6] border border-[#E3E8E2] rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#4B5563] block">Scenario C</span>
                    <h3 className="text-sm font-bold text-[#1B3D34]">+1 Floor (Rental Unit)</h3>
                    <div className="text-xs space-y-1 pt-1 font-mono">
                      <div className="flex justify-between text-[#4B5563]">
                        <span>Gross BUA:</span>
                        <span className="font-bold text-[#1B3D34]">{(area.totalBUASqFt + Math.round(area.totalBUASqFt / (result.input?.floors || 1))).toLocaleString()} sq.ft</span>
                      </div>
                      <div className="flex justify-between text-[#4B5563]">
                        <span>Budget:</span>
                        <span className="font-bold text-[#1B3D34]">{formatCurrency((budget.totalProjectCost || budget.directConstructionBudget) + Math.round(area.totalBUASqFt / (result.input?.floors || 1)) * (budget.costPerSqFt || 2250) * 0.88)}</span>
                      </div>
                      <div className="flex justify-between text-[#4B5563]">
                        <span>Rate:</span>
                        <span>₹{Math.round((budget.costPerSqFt || 2250) * 0.96).toLocaleString('en-IN')}/sqft</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            /* Premium Teaser / Upgrade Card (shown for Free or Detailed BOQ users) */
            <section className="p-6 bg-gradient-to-br from-[rgba(27,61,52,0.04)] to-[rgba(242,140,40,0.04)] border-2 border-dashed border-[#1B3D34]/20 rounded-3xl space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1B3D34] text-white">
                      CALCULATOR — PREMIUM DELIVERABLES
                    </span>
                    <span className="text-xs font-mono font-black text-[#1B3D34]">₹1,499</span>
                  </div>
                  <h3 className="text-base font-bold text-[#1B3D34]">
                    Contractor Quote Audit, Finish Sensitivity &amp; Multi-Scenario Comparison
                  </h3>
                  <p className="text-xs text-[#4B5563]">
                    Upgrade your calculator package to unlock benchmark rate vetting, high-risk contractor redlines, and 1-floor vs multi-floor plot scenarios.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUnlockModalTier('PREMIUM_1499');
                    setShowUnlockModal(true);
                  }}
                  className="hutty-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#F28C28]" />
                  <span>Upgrade to Premium — ₹1,499</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#E3E8E2] space-y-1">
                  <span className="font-bold text-[#1B3D34] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#F28C28]" />
                    Contractor Quote Audit
                  </span>
                  <p className="text-[10px] text-[#4B5563]">Bangalore market tolerance benchmarks for steel, cement, masonry, and civil labour.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#E3E8E2] space-y-1">
                  <span className="font-bold text-[#1B3D34] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#F28C28]" />
                    Finish Sensitivity Matrix
                  </span>
                  <p className="text-[10px] text-[#4B5563]">Live INR cost delta across Standard, Premium, and Luxury brand specifications.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#E3E8E2] space-y-1">
                  <span className="font-bold text-[#1B3D34] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#F28C28]" />
                    Multi-Scenario Comparison
                  </span>
                  <p className="text-[10px] text-[#4B5563]">Side-by-side plot area and budget comparison for single floor vs multi-floor variants.</p>
                </div>
              </div>
            </section>
          )}

          {/* 7. Preliminary Estimate Disclaimers & Engineering Notice */}
          <section className="space-y-2 text-xs text-[#4B5563] border-t border-[#E3E8E2] pt-4">
            <h3 className="font-bold text-[#1B3D34]">IMPORTANT — PRELIMINARY ESTIMATE &amp; ENGINEERING NOTICE</h3>
            <p>
              * Generated using Hutty's preliminary estimation rules; final structural design is by the appointed engineer.
            </p>
            <p>
              * Electrical Notice: Hutty's electrical quantities are preliminary estimation quantities. They are not a substitute for final electrical design. Final conductor sizing, circuit loading, voltage-drop checks, protection, DB design and installation details must be verified by a qualified electrical designer/engineer for the actual project.
            </p>
            <p>
              * This report is a preliminary construction cost and quantity estimate generated from the project configuration. Actual quantities and costs may vary based on architectural/structural drawings, soil and site conditions, construction methods, specifications, brands, supplier quotations, taxes and market conditions.
            </p>
            <p>
              * Structural member sizes, reinforcement detailing schedules, foundation design, soil bearing capacity and other engineering requirements must be determined and certified by the appointed qualified engineer before construction.
            </p>
          </section>

          {/* Document Footer */}
          <div className="pt-6 border-t border-[#E3E8E2] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#4B5563]">
            <span>Hutty &bull; Construction Estimate &amp; BOQ &bull; Engine {result.rateSourceMetadata?.calculationEngineVersion || 'v2.6.0'}</span>
            <span>Rate Master: {result.rateSourceMetadata?.datasetVersion || 'HUTTY-RM-2026.1'} &bull; https://hutty.in</span>
          </div>

        </div>

      </div>

      <UnlockReportModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        initialTierCode={unlockModalTier}
      />

      <UnlockBasicPdfModal
        isOpen={showBasicPdfModal}
        onClose={() => setShowBasicPdfModal(false)}
      />

      <CalculationTraceModal
        isOpen={showTraceModal}
        onClose={() => setShowTraceModal(false)}
        trace={result.trace}
      />
    </motion.div>
  );
};
