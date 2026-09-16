import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { useReportStore } from '../../store/useReportStore';
import { useCalculationStore } from '../../store/useCalculationStore';
import { useWizardStore } from '../../store/useWizardStore';
import { useEntitlementStore } from '../../store/useEntitlementStore';
import { UnlockReportModal } from '../../components/modals/UnlockReportModal';
import { CalculationTraceModal } from '../../components/modals/CalculationTraceModal';
import { generateAndDownloadDetailedReportPdf, viewDetailedReportPdfInNewTab } from './pdfService';
import { isDevPdfTestingEnabled } from '../../config/devTesting';
import { Printer, Download, ArrowLeft, Lock, ShieldCheck, Sparkles, FileText, ArrowRight, Calculator, RotateCcw } from 'lucide-react';
import { formatCurrency } from '../../utils/cn';
import { HuttyLogo } from '../../components/common/HuttyLogo';
import { SEO } from '../../components/common/SEO';

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { preparedFor } = useReportStore();
  const { specificationTier } = useWizardStore();
  const { result } = useCalculationStore();
  const { hasDetailedReportAccess } = useEntitlementStore();

  const { report, area, quantities, budget, timeline, paymentPlan, boq, materialSchedule, fixtureSchedule } = result;
  const projectId = report?.projectId || 'HUTTY-2026-BLR';
  const isUnlocked = hasDetailedReportAccess(projectId);
  const devTestingActive = isDevPdfTestingEnabled();

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
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
      setShowUnlockModal(true);
      return;
    }

    setIsGeneratingPdf(true);
    try {
      await generateAndDownloadDetailedReportPdf({
        data: result,
        projectName: `${result.input?.houseType || 'Residential'} Construction Dossier`,
        preparedFor: preparedFor || 'Valued Client',
        specificationTier: specificationTier || 'Premium',
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintRequest = () => {
    if (!isUnlocked) {
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
        title={isUnlocked ? "Detailed Construction Dossier & BOQ | Hutty" : "Construction Estimate Preview | Hutty"}
        description="Authoritative pre-construction digital QS dossier: Works BOQ, Material Takeoff, Fixtures Schedule & Cost Breakdown."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 text-left">

        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
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
              className="flex items-center gap-1.5 text-xs font-bold text-[#1B3D34] hover:bg-[rgba(27,61,52,0.06)] px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#F28C28]" /> Start New Project
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTraceModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[rgba(27,61,52,0.04)] text-xs font-bold text-[#1B3D34] transition-colors cursor-pointer shadow-2xs"
            >
              <Calculator className="w-3.5 h-3.5 text-[#F28C28]" /> How Calculated
            </button>

            {isUnlocked ? (
              <>
                <button
                  type="button"
                  onClick={handlePrintRequest}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[rgba(27,61,52,0.04)] text-xs font-bold text-[#1B3D34] transition-colors cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#1B3D34]" /> Print
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="hutty-btn-primary px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#F28C28]" />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
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
                  onClick={() => setShowUnlockModal(true)}
                  className="hutty-btn-primary px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5 text-[#F28C28]" />
                  <span>Unlock Detailed Report — ₹4,999</span>
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
                  All works BOQ, physical material takeoffs, and trade cost schedules are fully unlocked.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="hutty-btn-primary px-4 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>Download PDF</span>
            </button>
          </div>
        )}

        {/* Document Sheet */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 sm:p-12 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">

          {/* 1. Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-[#1B3D34]">
            <div className="space-y-1">
              <HuttyLogo variant="full" width={140} />
              <p className="text-xs text-[#4B5563] mt-1">
                {isUnlocked ? 'Authoritative Construction Dossier & BOQ' : 'High-Level Construction Cost Estimate'}
              </p>
            </div>

            <div className="text-xs text-left sm:text-right space-y-0.5 text-[#4B5563]">
              <p><strong className="text-[#1B3D34]">Project ID:</strong> {projectId}</p>
              <p><strong className="text-[#1B3D34]">Date:</strong> {currentDate}</p>
              <p><strong className="text-[#1B3D34]">Specification:</strong> {(specificationTier || 'Premium').toUpperCase()}</p>
              <p><strong className="text-[#1B3D34]">Prepared For:</strong> {preparedFor || 'Residential Client'}</p>
              <p><strong className="text-[#1B3D34]">Rate Master:</strong> {report?.rateSourceMetadata?.datasetVersion || result.rateSourceMetadata?.datasetVersion || 'HUTTY-RM-2026.1'} ({report?.rateSourceMetadata?.isLive ? 'Live API' : '2026-Q1 Fallback'})</p>
            </div>
          </div>

          {/* 2. Project Geometry & Summary (Available to all) */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] border-b border-[#E5E7EB] pb-1.5 font-heading">
              1. Project Geometry &amp; Parameters
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#4B5563] block">Total Estimated Cost</span>
                <span className="text-base font-extrabold text-[#1B3D34] font-heading">{formatCurrency(budget.totalProjectCost)}</span>
              </div>
              <div>
                <span className="text-[#4B5563] block">Built-Up Area (BUA)</span>
                <span className="text-base font-bold text-[#1B3D34] font-heading">{area.totalBUASqFt.toLocaleString()} sq.ft</span>
              </div>
              <div>
                <span className="text-[#4B5563] block">Effective Rate</span>
                <span className="text-base font-bold text-[#1B3D34] font-heading">₹{budget.costPerSqFt.toLocaleString()} / sq.ft</span>
              </div>
              <div>
                <span className="text-[#4B5563] block">Estimated Timeline</span>
                <span className="text-base font-bold text-[#1B3D34] font-heading">{timeline.totalMonths} Months</span>
              </div>
            </div>
          </section>

          {/* 3. Key Quantities Summary (Free Preview) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-1.5">
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
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <span className="text-[#4B5563] block">Structural Steel</span>
                <span className="text-sm font-bold text-[#1B3D34] font-mono">{quantities.steelTonnes} Tonnes</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <span className="text-[#4B5563] block">Portland Cement</span>
                <span className="text-sm font-bold text-[#1B3D34] font-mono">{quantities.cementBags?.toLocaleString()} Bags</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <span className="text-[#4B5563] block">Sand &amp; Aggregates</span>
                <span className="text-sm font-bold text-[#1B3D34] font-mono">{((quantities.mSandCuFt || 0) + (quantities.pSandCuFt || 0) + (quantities.coarseAggregateCuFt || 0))?.toLocaleString()} CFT</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <span className="text-[#4B5563] block">Masonry Units</span>
                <span className="text-sm font-bold text-[#1B3D34] font-mono">{quantities.masonryUnitsCount?.toLocaleString()} Units</span>
              </div>
            </div>
          </section>

          {/* ── SECTION A: WHAT WE BUILD (Works BOQ) ── */}
          {Array.isArray(boq) && boq.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] font-heading">
                  SECTION A — WHAT WE BUILD (Construction Works BOQ)
                </h2>
                <span className="text-[10px] text-[#4B5563] font-mono">{boq.length} line items</span>
              </div>
              
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#4B5563]">
                    <th className="py-2 font-bold uppercase w-10">Sl</th>
                    <th className="py-2 font-bold uppercase">Activity / Work Description</th>
                    <th className="py-2 font-bold uppercase text-right">Quantity</th>
                    <th className="py-2 font-bold uppercase text-right">Rate</th>
                    <th className="py-2 font-bold uppercase text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {(isUnlocked ? boq : boq.slice(0, 4)).map((item) => (
                    <tr key={item.code || item.slNo}>
                      <td className="py-2 font-mono text-[#4B5563]">{item.slNo}</td>
                      <td className="py-2 text-[#1B3D34] font-medium">
                        {item.description}
                        <span className="block text-[10px] text-[#4B5563] font-normal">{item.brand} &bull; {item.remarks}</span>
                      </td>
                      <td className="py-2 text-right text-[#4B5563] font-mono whitespace-nowrap">{item.quantity} {item.unit}</td>
                      <td className="py-2 text-right text-[#4B5563] font-mono whitespace-nowrap">₹{item.unitRate.toLocaleString()}</td>
                      <td className="py-2 text-right font-bold text-[#1B3D34] font-mono whitespace-nowrap">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Free Teaser for Remaining Items */}
              {!isUnlocked && boq.length > 4 && (
                <div className="py-3 px-4 bg-[#F8F8F6] border border-dashed border-[#1B3D34]/30 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-[#4B5563] font-medium">
                    + {boq.length - 4} additional detailed work line items locked in free estimate preview
                  </span>
                  <button
                    onClick={() => setShowUnlockModal(true)}
                    className="text-xs font-bold text-[#1B3D34] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>Unlock Full Works BOQ &rarr;</span>
                  </button>
                </div>
              )}
            </section>
          )}

          {/* ── PAID REPORT SECTIONS (LOCKED OR UNLOCKED) ── */}
          {isUnlocked ? (
            <>
              {/* SECTION B: WHAT WE CONSUME */}
              {Array.isArray(materialSchedule) && materialSchedule.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-1.5">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] font-heading">
                      SECTION B — WHAT WE CONSUME (Material Schedule)
                    </h2>
                    <span className="text-[10px] text-[#4B5563] font-mono">{materialSchedule.length} physical materials</span>
                  </div>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] text-[#4B5563]">
                        <th className="py-2 font-bold uppercase w-10">Sl</th>
                        <th className="py-2 font-bold uppercase">Physical Material &amp; Brand</th>
                        <th className="py-2 font-bold uppercase text-right">Quantity</th>
                        <th className="py-2 font-bold uppercase text-right">Unit Rate</th>
                        <th className="py-2 font-bold uppercase text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {materialSchedule.map((mat) => (
                        <tr key={mat.slNo}>
                          <td className="py-2 font-mono text-[#4B5563]">{mat.slNo}</td>
                          <td className="py-2 text-[#1B3D34] font-medium">
                            {mat.material}
                            <span className="block text-[10px] text-[#4B5563] font-normal">{mat.brand} &bull; {mat.specification}</span>
                          </td>
                          <td className="py-2 text-right text-[#4B5563] font-mono whitespace-nowrap">{mat.quantity.toLocaleString()} {mat.unit}</td>
                          <td className="py-2 text-right text-[#4B5563] font-mono whitespace-nowrap">₹{mat.unitRate.toLocaleString()}</td>
                          <td className="py-2 text-right font-bold text-[#1B3D34] font-mono whitespace-nowrap">{formatCurrency(mat.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* SECTION C: WHAT WE INSTALL */}
              {Array.isArray(fixtureSchedule) && fixtureSchedule.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-1.5">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] font-heading">
                      SECTION C — WHAT WE INSTALL (Fixtures &amp; Fittings Schedule)
                    </h2>
                    <span className="text-[10px] text-[#4B5563] font-mono">{fixtureSchedule.length} installed units</span>
                  </div>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] text-[#4B5563]">
                        <th className="py-2 font-bold uppercase w-10">Sl</th>
                        <th className="py-2 font-bold uppercase">Installed Fixture / Equipment</th>
                        <th className="py-2 font-bold uppercase">Location</th>
                        <th className="py-2 font-bold uppercase text-right">Quantity</th>
                        <th className="py-2 font-bold uppercase text-right">Rate</th>
                        <th className="py-2 font-bold uppercase text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {fixtureSchedule.map((fix) => (
                        <tr key={fix.slNo}>
                          <td className="py-2 font-mono text-[#4B5563]">{fix.slNo}</td>
                          <td className="py-2 text-[#1B3D34] font-medium">
                            {fix.item}
                            <span className="block text-[10px] text-[#4B5563] font-normal">{fix.brand} &bull; {fix.specification}</span>
                          </td>
                          <td className="py-2 text-[#4B5563] text-[11px]">{fix.location}</td>
                          <td className="py-2 text-right text-[#4B5563] font-mono whitespace-nowrap">{fix.quantity} {fix.unit}</td>
                          <td className="py-2 text-right text-[#4B5563] font-mono whitespace-nowrap">₹{fix.unitRate.toLocaleString()}</td>
                          <td className="py-2 text-right font-bold text-[#1B3D34] font-mono whitespace-nowrap">{formatCurrency(fix.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* SECTION D: WHAT IT COSTS */}
              <section className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] border-b border-[#E5E7EB] pb-1.5 font-heading">
                  SECTION D — WHAT IT COSTS (Trade Breakdown &amp; Commercial Additions)
                </h2>
                <div className="space-y-2">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] text-[#4B5563]">
                        <th className="py-2 font-bold uppercase">Trade Category</th>
                        <th className="py-2 font-bold uppercase text-right">Amount (INR)</th>
                        <th className="py-2 font-bold uppercase text-right">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {budget.heads.map((head) => (
                        <tr key={head.id}>
                          <td className="py-2 font-medium text-[#1B3D34]">{head.name}</td>
                          <td className="py-2 text-right font-bold text-[#1B3D34] font-mono">{formatCurrency(head.allocatedAmount)}</td>
                          <td className="py-2 text-right text-[#4B5563] font-mono">{head.percentage}%</td>
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
              </section>
            </>
          ) : (
            /* Locked Teaser Banner for What Am I Paying For? */
            <div className="p-8 bg-[#F8F8F6] rounded-2xl border-2 border-dashed border-[#1B3D34]/30 space-y-6 text-center">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F28C28] bg-white px-3 py-1 rounded-md border border-[#E5E7EB] inline-block">
                  WHAT AM I PAYING FOR? &bull; ₹4,999
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1B3D34] font-heading">
                  Want to know exactly where the money goes?
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] max-w-lg mx-auto leading-relaxed">
                  Get your complete itemized construction cost &amp; BOQ report with physical material schedules, installed fixture lists, and contractor profit breakdowns.
                </p>
              </div>

              {/* Teaser Points */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto">
                <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B3D34]">
                    <FileText className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>Section B &bull; Materials</span>
                  </div>
                  <p className="text-[10px] text-[#4B5563]">Exact steel tonnage, cement bags, sand &amp; masonry block takeoffs.</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B3D34]">
                    <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>Section C &bull; Fixtures</span>
                  </div>
                  <p className="text-[10px] text-[#4B5563]">Door schedule, window areas, sanitary suites &amp; CPVC plumbing lengths.</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B3D34]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>Section D &bull; Costs</span>
                  </div>
                  <p className="text-[10px] text-[#4B5563]">Contractor margins, architectural fees, contingency reserves &amp; GST.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(true)}
                  className="hutty-btn-primary px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-[#F28C28]" />
                  <span>Unlock Detailed Report — ₹4,999</span>
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

          {/* Milestone Payment Schedule */}
          {Array.isArray(paymentPlan) && paymentPlan.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] border-b border-[#E5E7EB] pb-1.5 font-heading">
                5. Milestone Disbursement Roadmap
              </h2>
              <div className="space-y-2">
                {paymentPlan.map((stage) => (
                  <div key={stage.stage} className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs">
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

          {/* 7. Preliminary Estimate Disclaimers & Engineering Notice */}
          <section className="space-y-2 text-xs text-[#4B5563] border-t border-[#E5E7EB] pt-4">
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
          <div className="pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#4B5563]">
            <span>Hutty &bull; Construction Estimate &amp; BOQ &bull; Engine {result.rateSourceMetadata?.calculationEngineVersion || 'v2.6.0'}</span>
            <span>Rate Master: {result.rateSourceMetadata?.datasetVersion || 'HUTTY-RM-2026.1'} &bull; https://hutty.in</span>
          </div>

        </div>

      </div>

      <UnlockReportModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
      />

      <CalculationTraceModal
        isOpen={showTraceModal}
        onClose={() => setShowTraceModal(false)}
        trace={result.trace}
      />
    </motion.div>
  );
};
