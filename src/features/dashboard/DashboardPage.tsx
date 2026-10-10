import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { useBudgetResult, useArea, useCalculationStore } from '../../store/useCalculationStore';
import { useWizardStore } from '../../store/useWizardStore';
import { useEntitlementStore } from '../../store/useEntitlementStore';
import { useReportStore } from '../../store/useReportStore';
import { SavedEstimationsModal } from '../../components/modals/SavedEstimationsModal';
import { UnlockReportModal } from '../../components/modals/UnlockReportModal';
import { QuoteReviewModal } from '../../components/modals/QuoteReviewModal';
import { BuildTrackingModal } from '../../components/modals/BuildTrackingModal';
import { PackageComparisonModal } from '../../components/modals/PackageComparisonModal';
import { generateAndDownloadDetailedReportPdf, viewDetailedReportPdfInNewTab } from '../report/pdfService';
import { isDevPdfTestingEnabled } from '../../config/devTesting';
import { formatCurrency } from '../../utils/cn';
import { SEO } from '../../components/common/SEO';
import { HowWeCalculatedThis } from '../../components/common/HowWeCalculatedThis';
import {
  ChevronLeft,
  FileText,
  Save,
  ArrowRight,
  Download,
  Lock,
  ShieldCheck,
  CheckCircle2,
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
  const { result } = useCalculationStore();
  const quantities = result.quantities;
  const { city, plotLength, plotWidth, houseType, specificationTier, selectedPackage } = useWizardStore();
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

  const [isGeneratingDevPdf, setIsGeneratingDevPdf] = useState(false);
  const devTestingActive = isDevPdfTestingEnabled();

  const handleDevViewPdf = async () => {
    if (!isDevPdfTestingEnabled()) return;
    setIsGeneratingDevPdf(true);
    try {
      await viewDetailedReportPdfInNewTab({
        data: result,
        projectName: `${houseType || 'Residential'} Construction Dossier`,
        preparedFor: preparedFor || 'Developer Testing',
        specificationTier: specificationTier || 'Premium',
      });
    } catch (err) {
      console.error('Dev PDF preview error:', err);
    } finally {
      setIsGeneratingDevPdf(false);
    }
  };

  const handleDevDownloadPdf = async () => {
    if (!isDevPdfTestingEnabled()) return;
    setIsGeneratingDevPdf(true);
    try {
      await generateAndDownloadDetailedReportPdf({
        data: result,
        projectName: `${houseType || 'Residential'} Construction Dossier`,
        preparedFor: preparedFor || 'Developer Testing',
        specificationTier: specificationTier || 'Premium',
      });
    } catch (err) {
      console.error('Dev PDF download error:', err);
    } finally {
      setIsGeneratingDevPdf(false);
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
              className="flex items-center gap-1.5 text-xs font-bold text-[#1B3D34] px-3 py-1.5 rounded-lg border border-[#E3E8E2] bg-white hover:bg-[rgba(27,61,52,0.04)] transition-colors cursor-pointer shadow-2xs"
            >
              <Save className="w-3.5 h-3.5 text-[#1B3D34]" />
              Saved Projects
            </button>
          </div>
        </div>

        {/* ── HOME COMMAND CENTER HERO ── */}
        <section className="bg-white border border-[#E3E8E2] rounded-3xl p-6 sm:p-9 shadow-xs space-y-6 arch-bracketed text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E8E2] pb-4">
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F28C28]">
                YOUR HOME &bull; PRE-CONSTRUCTION COMMAND CENTER
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1B3D34] font-heading">
                {houseType || 'Residential'} Active Residence
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-3 py-1 rounded-full border border-[#1B3D34]/15">
                PACKAGE: {(selectedPackage || 'PREMIUM').toUpperCase()}
              </span>
            </div>
          </div>

          {hasProject ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="md:col-span-2 space-y-1">
                  <span className="font-mono text-xs text-[#4B5563] block uppercase tracking-wider">
                    ESTIMATED TOTAL CONSTRUCTION BUDGET
                  </span>
                  <div className="arch-stat-hero text-[#1B3D34]">
                    {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
                  </div>
                  <p className="text-xs text-[#4B5563]">
                    Includes civil frame, materials, MEP conduit, and contractor execution schedules.
                  </p>
                </div>

                <div className="space-y-1 p-4 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2]">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#4B5563] block">
                    GROSS BUILT-UP AREA
                  </span>
                  <span className="text-2xl font-black text-[#1B3D34] font-heading block tabular-nums">
                    {buaSqFt.toLocaleString()} <span className="text-xs font-normal text-[#4B5563]">sq.ft</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#1B3D34]">
                    Effective: ₹{ratePerSqFt.toLocaleString()} / sq.ft
                  </span>
                </div>

                <div className="space-y-1 p-4 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2]">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#4B5563] block">
                    SITE COORDINATES
                  </span>
                  <span className="text-2xl font-black text-[#1B3D34] font-heading block tabular-nums">
                    {plotLength}' × {plotWidth}'
                  </span>
                  <span className="text-[11px] font-mono text-[#F28C28] font-bold">
                    {city || 'Bangalore'} &bull; Zone II
                  </span>
                </div>
              </div>

              {/* Physical Material Consumption Takeoff Strip */}
              <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#4B5563] uppercase font-bold text-[10px]">
                    PHYSICAL MATERIAL CONSUMPTION TAKEOFF
                  </span>
                  <span className="text-[#1B3D34] font-bold text-[10px]">
                    IS-456 DETERMINISTIC QUANTITIES
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-white p-2.5 rounded-xl border border-[#E3E8E2]">
                    <span className="text-[#4B5563] text-[10px] block">Fe550D Steel:</span>
                    <span className="text-sm font-bold text-[#1B3D34] block mt-0.5">{quantities.steelTonnes || 8.64} Tonnes</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E3E8E2]">
                    <span className="text-[#4B5563] text-[10px] block">Grade 53 Cement:</span>
                    <span className="text-sm font-bold text-[#1B3D34] block mt-0.5">{quantities.cementBags?.toLocaleString() || 1080} Bags</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E3E8E2]">
                    <span className="text-[#4B5563] text-[10px] block">RCC Concrete:</span>
                    <span className="text-sm font-bold text-[#1B3D34] block mt-0.5">{quantities.rccConcreteTotalCuM || 48} m³</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E3E8E2]">
                    <span className="text-[#4B5563] text-[10px] block">Masonry Blocks:</span>
                    <span className="text-sm font-bold text-[#1B3D34] block mt-0.5">{quantities.masonryUnitsCount?.toLocaleString() || 10752} Nos</span>
                  </div>
                </div>
              </div>

              {/* Command Center Action Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/calculator')}
                  className="hutty-btn-primary text-xs font-bold px-5 py-3 rounded-xl cursor-pointer shadow-xs"
                >
                  <span>Modify Configuration in Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/report')}
                  className="hutty-btn-secondary text-xs font-semibold px-4 py-3 rounded-xl cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#1B3D34]" />
                  <span>View 22-Section BOQ</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/consult')}
                  className="hutty-btn-secondary text-xs font-semibold px-4 py-3 rounded-xl cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
                  <span>Book Expert Review (₹1,499)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-[#4B5563]">No active project configuration yet in this session.</p>
              <button
                type="button"
                onClick={() => navigate('/calculator')}
                className="hutty-btn-primary text-xs font-bold px-6 py-3 rounded-xl cursor-pointer"
              >
                Launch Architectural Calculator
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
            <div className="p-5 bg-white rounded-2xl border border-[#E3E8E2] shadow-xs space-y-3 flex flex-col justify-between">
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

              <div className="pt-2 border-t border-[#E3E8E2] flex items-center justify-between">
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

            {/* 2. Detailed Report (₹499) */}
            <div className={`p-5 bg-white rounded-2xl border shadow-xs space-y-3 flex flex-col justify-between transition-all ${
              isReportUnlocked ? 'border-[#1B3D34] ring-1 ring-[#1B3D34]' : 'border-[#E3E8E2]'
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
                      ₹499
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Detailed 13-stage BOQ, physical steel/cement schedules, fixture lists, and contractor margin breakdowns.
                </p>
              </div>

              <div className="pt-2 border-t border-[#E3E8E2] flex items-center justify-between gap-2">
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
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    {devTestingActive && (
                      <div className="flex items-center gap-1 p-1 bg-amber-50 border border-amber-300 rounded-lg text-xs shadow-2xs">
                        <span className="text-[9px] font-mono font-bold uppercase bg-amber-200 text-amber-900 px-1 py-0.5 rounded">
                          DEV
                        </span>
                        <button
                          type="button"
                          onClick={handleDevViewPdf}
                          disabled={isGeneratingDevPdf}
                          className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold transition-colors cursor-pointer text-[10px] inline-flex items-center gap-1"
                          title="Developer Testing: View full paid PDF in new tab"
                        >
                          <FileText className="w-3 h-3 text-amber-700" />
                          <span>View Full (Test)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDevDownloadPdf}
                          disabled={isGeneratingDevPdf}
                          className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors cursor-pointer text-[10px] inline-flex items-center gap-1"
                          title="Developer Testing: Download full paid PDF file"
                        >
                          <Download className="w-3 h-3 text-white" />
                          <span>Download (Test)</span>
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowUnlockModal(true)}
                      className="hutty-btn-primary px-3.5 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#F28C28]" />
                      <span>Unlock Detailed Report &bull; ₹499</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Quote Review (₹8,999) */}
            <div className="p-5 bg-white rounded-2xl border border-[#E3E8E2] shadow-xs space-y-3 flex flex-col justify-between">
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

              <div className="pt-2 border-t border-[#E3E8E2] flex items-center justify-between">
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
            <div className="p-5 bg-white rounded-2xl border border-[#E3E8E2] shadow-xs space-y-3 flex flex-col justify-between">
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

              <div className="pt-2 border-t border-[#E3E8E2] flex items-center justify-between">
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
          <section className="bg-white border border-[#E3E8E2] rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563] block">
              TRADE COST ALLOCATION
            </span>
            <div className="divide-y divide-[#E3E8E2] text-xs">
              {breakdownRows.map((row) => (
                <div key={row.label} className="py-2.5 flex items-center justify-between">
                  <span className="text-[#4B5563]">{row.label}</span>
                  <span className="font-bold text-[#1B3D34] font-mono">{formatCurrency(row.amount)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CALCULATION TRANSPARENCY: SUMMARY & LABOUR RECONCILIATION ── */}
        {hasProject && (
          <div className="space-y-4">
            <HowWeCalculatedThis stepKey="summary" defaultExpanded={false} />
            <HowWeCalculatedThis stepKey="labour" defaultExpanded={false} />
          </div>
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
