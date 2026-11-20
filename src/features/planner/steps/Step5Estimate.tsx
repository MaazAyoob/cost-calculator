import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCalculationStore,
  useBudgetResult,
  useArea,
  useQuantities,
  useBOQ,
} from '../../../store/useCalculationStore';
import { useWizardStore } from '../../../store/useWizardStore';
import { useEntitlementStore } from '../../../store/useEntitlementStore';
import { useReportStore } from '../../../store/useReportStore';
import { formatCurrency } from '../../../utils/cn';
import { AnimatedNumber } from '../../../components/common/AnimatedNumber';
import { UnlockReportModal } from '../../../components/modals/UnlockReportModal';
import {
  generateAndDownloadDetailedReportPdf,
  viewDetailedReportPdfInNewTab,
} from '../../report/pdfService';
import { analytics } from '../../../utils/analytics';
import {
  getHouseTypeLabel,
  getFloorLabel,
  getConstructionQualityLabel,
} from '../plannerLabels';
import {
  Calculator,
  IndianRupee,
  Layers,
  Package,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Download,
  Check,
  Compass,
  Home,
  Bed,
  Maximize2,
  Building2,
  FileText,
  Lock,
  ExternalLink,
  ShieldCheck,
  User,
  Loader2,
  Eye,
  Info,
  Clock,
} from 'lucide-react';

interface Step5EstimateProps {
  onAdjustSelections: (step: number) => void;
  onOpenUnlockModal?: () => void;
}

export const Step5Estimate: React.FC<Step5EstimateProps> = ({
  onAdjustSelections,
  onOpenUnlockModal,
}) => {
  const navigate = useNavigate();
  const { result } = useCalculationStore();
  const budget = useBudgetResult();
  const area = useArea();
  const quantities = useQuantities();
  const boq = useBOQ();
  const {
    plotLength,
    plotWidth,
    floors,
    houseType,
    selectedPackage,
    rooms,
    city,
    authority,
    specificationTier,
  } = useWizardStore();

  const { hasDetailedReportAccess } = useEntitlementStore();
  const { preparedFor } = useReportStore();

  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const projectId = result.report?.projectId || 'HUTTY-PROJECT-ESTIMATE';
  const isUnlocked = hasDetailedReportAccess(projectId);

  const effectiveFloors = floors && floors > 0 ? floors : 2;
  const effectiveHouseType = houseType || 'Duplex';
  const qualityLabel = getConstructionQualityLabel(specificationTier || selectedPackage);

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = totalCost > 0 && buaSqFt > 0 ? Math.round(totalCost / buaSqFt) : 0;

  // Realistic range based on standard construction tolerance (±4%)
  const minCostRange = Math.round(totalCost * 0.96);
  const maxCostRange = Math.round(totalCost * 1.04);

  // Cost heads
  const materialCost = budget.directMaterialCost || 0;
  const labourCost = budget.directLabourCost || 0;
  const fittingsCost = Math.max(0, totalCost - (materialCost + labourCost));

  const matPct = totalCost > 0 ? Math.round((materialCost / totalCost) * 100) : 58;
  const labPct = totalCost > 0 ? Math.round((labourCost / totalCost) * 100) : 23;
  const fixPct = Math.max(0, 100 - (matPct + labPct));

  // Category breakdown approximate allocation
  const catFoundation = Math.round(totalCost * 0.38);
  const catMasonry = Math.round(totalCost * 0.18);
  const catFinishes = Math.round(totalCost * 0.14);
  const catDoorsWindows = Math.round(totalCost * 0.12);
  const catServices = Math.round(totalCost * 0.11);
  const catPainting = Math.max(0, totalCost - (catFoundation + catMasonry + catFinishes + catDoorsWindows + catServices));

  // Timeline estimate
  const timelineMonths = effectiveFloors <= 1 ? 6 : effectiveFloors === 2 ? 8 : effectiveFloors === 3 ? 10 : 12;

  const handleOpenUnlock = () => {
    if (onOpenUnlockModal) {
      onOpenUnlockModal();
    } else {
      setShowUnlockModal(true);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateAndDownloadDetailedReportPdf({
        data: result,
        projectName: `${result.input?.houseType || 'Residential'} Construction Dossier`,
        preparedFor: preparedFor || 'Valued Homeowner',
        specificationTier: specificationTier || 'Premium',
      });
      analytics.trackReportDownloaded('DETAILED_REPORT_PDF', 'PDF');
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleViewPdfInTab = async () => {
    setIsGeneratingPdf(true);
    try {
      await viewDetailedReportPdfInNewTab({
        data: result,
        projectName: `${result.input?.houseType || 'Residential'} Construction Dossier`,
        preparedFor: preparedFor || 'Valued Homeowner',
        specificationTier: specificationTier || 'Premium',
      });
    } catch (err) {
      console.error('PDF preview error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-[11px] font-bold text-[#183B32]">
          <Calculator className="w-3 h-3 text-[#C66B4E]" />
          <span>STEP 05 OF 05 &bull; YOUR ON-SCREEN ESTIMATE (100% FREE)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#18211E] tracking-tight">
          Your Home Construction Estimate
        </h2>
        <p className="text-xs sm:text-sm text-[#66716B]">
          Based on your {plotWidth || 30} × {plotLength || 40} ft plot, {effectiveFloors} floors, and selected materials in {city || 'Bangalore'}.
        </p>
      </div>

      {/* ── 1. PRIMARY ESTIMATED COST CARD ── */}
      <div className="p-6 sm:p-8 bg-[#183B32] text-white rounded-3xl shadow-md space-y-5 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C66B4E]">
                Total Estimated Construction Budget
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">
                Free Estimate &bull; {qualityLabel}
              </span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight tabular-nums flex items-baseline">
                <span>₹&nbsp;</span>
                <AnimatedNumber value={totalCost} />
              </span>
              <span className="text-xs sm:text-sm text-white/70 font-mono">
                (Realistic Range: {formatCurrency(minCostRange)} – {formatCurrency(maxCostRange)})
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-white/60 uppercase tracking-wider block">Estimated Rate</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-white flex items-baseline sm:justify-end">
              <span>₹&nbsp;</span>
              <AnimatedNumber value={ratePerSqFt} />
              <span className="text-xs font-normal text-white/70 ml-1">/sq.ft BUA</span>
            </span>
          </div>
        </div>

        {/* Key Metrics Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-white/90 pt-1 relative z-10">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
            <span className="text-[10px] text-white/60 block uppercase">Total Built-Up Area</span>
            <strong className="text-white font-mono text-sm sm:text-base">{buaSqFt.toLocaleString()} sq.ft</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
            <span className="text-[10px] text-white/60 block uppercase">Configuration</span>
            <strong className="text-white font-mono text-xs sm:text-sm">
              {getFloorLabel(effectiveFloors)} &bull; {getHouseTypeLabel(effectiveHouseType)}
            </strong>
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
            <span className="text-[10px] text-white/60 block uppercase">Rooms Configured</span>
            <strong className="text-white font-mono text-xs sm:text-sm">
              {rooms.bedrooms || 3} BHK &bull; {rooms.bathrooms || 3} Baths
            </strong>
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
            <span className="text-[10px] text-white/60 block uppercase">Est. Construction Time</span>
            <strong className="text-white font-mono text-sm sm:text-base">{timelineMonths} Months</strong>
          </div>
        </div>
      </div>

      {/* ── 2. THE COMPLETE REPORT CALLOUT CARD (CENTRAL PRODUCT ₹199) ── */}
      <div className="p-6 sm:p-7 bg-[#FAF4E8] rounded-3xl border-2 border-[#C5A46D]/60 shadow-xs space-y-5 text-left relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#183B32] text-white text-[11px] font-bold">
                <FileText className="w-3 h-3 text-[#C66B4E]" />
                <span>COMPLETE REPORT</span>
              </span>
              <span className="text-xs font-bold text-[#C66B4E] uppercase tracking-wider">
                Downloadable PDF Report
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black font-heading text-[#183B32] tracking-tight">
              Complete Construction Planning &amp; Estimation Report
            </h3>

            <p className="text-xs sm:text-sm text-[#4B5563] max-w-xl">
              Get your complete 10-page planning guide with an itemized list of work &amp; costs (BOQ), materials needed, open space rules, and milestone payment plan.
            </p>
          </div>

          {/* Pricing Box */}
          <div className="shrink-0 p-4 bg-white rounded-2xl border border-[#C5A46D]/40 text-left md:text-right shadow-2xs min-w-[160px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#66716B] block">
              One-Time Payment
            </span>
            <div className="flex items-baseline md:justify-end gap-1.5 my-0.5">
              <span className="text-2xl sm:text-3xl font-black font-heading text-[#183B32]">₹ 199</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold block">
              Instant Download &bull; PDF
            </span>
          </div>
        </div>

        {/* Feature Checkpoints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#C5A46D]/20">
          <div className="flex items-start gap-2 text-xs text-[#183B32]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Itemized List of Work (BOQ)</strong> with measurements &amp; Bangalore market rates</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-[#183B32]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Materials Needed:</strong> Exact steel tonnes, cement bags, sand &amp; blocks</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-[#183B32]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Open Space Rules (Setbacks):</strong> BBMP/BDA rules &amp; allowable building area</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-[#183B32]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Clear Cost Breakdown:</strong> Materials, labour, fittings &amp; tax details</span>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {isUnlocked ? (
            <>
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={handleDownloadPdf}
                className="flex-1 min-h-[46px] px-6 py-3 rounded-xl bg-[#183B32] hover:bg-[#245747] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing Your PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#C66B4E]" />
                    <span>Download Complete Report (PDF)</span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={handleViewPdfInTab}
                className="px-4 py-3 rounded-xl border border-[#183B32] text-[#183B32] bg-white hover:bg-[#F8F8F6] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View in New Tab</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleOpenUnlock}
              className="w-full min-h-[48px] px-6 py-3.5 rounded-xl bg-[#183B32] hover:bg-[#245747] text-white text-sm font-extrabold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <Lock className="w-4 h-4 text-[#C66B4E]" />
              <span>Unlock Complete Construction Report — ₹199</span>
              <ArrowRight className="w-4 h-4 text-[#C66B4E]" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#66716B]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Cashfree / UPI Checkout &bull; Instant Delivery</span>
          </span>
          <span className="hidden sm:inline">Free on-screen estimate remains always available</span>
        </div>
      </div>

      {/* ── 3. WHERE YOUR BUDGET GOES (COST HEAD PROPORTIONS) ── */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#183B32] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#C66B4E]" />
            <span>Where Your Budget Goes &bull; Core Cost Heads</span>
          </h3>
          <span className="text-xs font-mono text-[#66716B]">100% Accounted</span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[#E5E7EB] overflow-hidden flex">
          <div style={{ width: `${matPct}%` }} className="bg-[#183B32]" title={`Materials: ${matPct}%`} />
          <div style={{ width: `${labPct}%` }} className="bg-[#C66B4E]" title={`Labour: ${labPct}%`} />
          <div style={{ width: `${fixPct}%` }} className="bg-[#52605B]" title={`Fittings & Services: ${fixPct}%`} />
        </div>

        {/* 3 Main Head Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#183B32]" />
              <strong className="text-[#183B32]">Materials Needed ({matPct}%)</strong>
            </div>
            <span className="text-base font-black font-mono text-[#183B32] block">
              {formatCurrency(materialCost)}
            </span>
            <span className="text-[11px] text-[#66716B]">Cement, steel, sand, aggregate &amp; masonry blocks</span>
          </div>

          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#C66B4E]" />
              <strong className="text-[#183B32]">Labour &amp; Work Costs ({labPct}%)</strong>
            </div>
            <span className="text-base font-black font-mono text-[#183B32] block">
              {formatCurrency(labourCost)}
            </span>
            <span className="text-[11px] text-[#66716B]">Masons, bar-benders, shuttering, carpenters &amp; helpers</span>
          </div>

          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#52605B]" />
              <strong className="text-[#183B32]">Fittings &amp; Services ({fixPct}%)</strong>
            </div>
            <span className="text-base font-black font-mono text-[#183B32] block">
              {formatCurrency(fittingsCost)}
            </span>
            <span className="text-[11px] text-[#66716B]">Plumbing, wiring, doors, windows &amp; paint</span>
          </div>
        </div>

        {/* Trade Category Breakdown Grid */}
        <div className="pt-3 border-t border-[#E5E7EB] space-y-2">
          <span className="text-xs font-bold text-[#183B32] block">
            Approximate Construction Stage Allocations:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FDFDFD]">
              <span className="text-[10px] text-[#66716B] block">Foundation &amp; RCC Structure</span>
              <strong className="text-[#183B32] font-mono">{formatCurrency(catFoundation)}</strong>
            </div>
            <div className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FDFDFD]">
              <span className="text-[10px] text-[#66716B] block">Masonry &amp; Plastering</span>
              <strong className="text-[#183B32] font-mono">{formatCurrency(catMasonry)}</strong>
            </div>
            <div className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FDFDFD]">
              <span className="text-[10px] text-[#66716B] block">Flooring &amp; Wall Cladding</span>
              <strong className="text-[#183B32] font-mono">{formatCurrency(catFinishes)}</strong>
            </div>
            <div className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FDFDFD]">
              <span className="text-[10px] text-[#66716B] block">Doors, Windows &amp; Joinery</span>
              <strong className="text-[#183B32] font-mono">{formatCurrency(catDoorsWindows)}</strong>
            </div>
            <div className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FDFDFD]">
              <span className="text-[10px] text-[#66716B] block">Electrical &amp; Plumbing Lines</span>
              <strong className="text-[#183B32] font-mono">{formatCurrency(catServices)}</strong>
            </div>
            <div className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FDFDFD]">
              <span className="text-[10px] text-[#66716B] block">Painting &amp; Finishing</span>
              <strong className="text-[#183B32] font-mono">{formatCurrency(catPainting)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. MATERIALS SUMMARY (QUANTITIES) ── */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#183B32] flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[#C66B4E]" />
            <span>Materials Needed &bull; Quantities for Your House</span>
          </h3>
          <span className="text-[11px] text-[#66716B]">Derived from IS 456 Structural Physics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#E8EFE9] rounded-2xl border border-[#B7CDBB]">
            <span className="text-[10px] uppercase font-bold text-[#183B32]/70 block">Steel Needed</span>
            <span className="text-lg sm:text-xl font-black font-mono text-[#183B32] block mt-0.5">
              {quantities.steelTonnes || Number(((buaSqFt * 3.2) / 1000).toFixed(2))} Tonnes
            </span>
            <span className="text-[10px] text-[#66716B] block">Fe550D TMT Rebar</span>
          </div>

          <div className="p-3.5 bg-[#E8EFE9] rounded-2xl border border-[#B7CDBB]">
            <span className="text-[10px] uppercase font-bold text-[#183B32]/70 block">Cement Needed</span>
            <span className="text-lg sm:text-xl font-black font-mono text-[#183B32] block mt-0.5">
              {(quantities.cementBags || Math.round(buaSqFt * 0.4)).toLocaleString()} Bags
            </span>
            <span className="text-[10px] text-[#66716B] block">50kg Portland Bags</span>
          </div>

          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
            <span className="text-[10px] uppercase font-bold text-[#66716B] block">M-Sand / Plastering</span>
            <span className="text-lg sm:text-xl font-black font-mono text-[#183B32] block mt-0.5">
              {(quantities.sandCuFt || Math.round(buaSqFt * 1.8)).toLocaleString()} CFT
            </span>
            <span className="text-[10px] text-[#66716B] block">Manufactured Sand</span>
          </div>

          <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB]">
            <span className="text-[10px] uppercase font-bold text-[#66716B] block">Masonry Blocks</span>
            <span className="text-lg sm:text-xl font-black font-mono text-[#183B32] block mt-0.5">
              {(quantities.finalBlocksRequired || quantities.masonryUnitsCount || Math.round(buaSqFt * 4.2)).toLocaleString()} Pcs
            </span>
            <span className="text-[10px] text-[#66716B] block">Solid 6" &amp; 4" Units</span>
          </div>
        </div>
      </div>

      {/* ── 5. INCLUSIONS & EXCLUSIONS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-2">
          <span className="text-xs font-bold text-[#183B32] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            What Is Included in this Estimate:
          </span>
          <ul className="space-y-1.5 text-xs text-[#4B5563]">
            <li className="flex items-start gap-1.5">&bull; Complete RCC structural foundation, columns &amp; roof slabs</li>
            <li className="flex items-start gap-1.5">&bull; Solid masonry blocks walling with 2 coats internal &amp; external plastering</li>
            <li className="flex items-start gap-1.5">&bull; Vitrified tile flooring in living/bedrooms &amp; anti-skid in wet areas</li>
            <li className="flex items-start gap-1.5">&bull; Complete concealed CPVC water plumbing &amp; sanitary fittings</li>
            <li className="flex items-start gap-1.5">&bull; Fire-retardant wiring, switchboards &amp; MCB distribution boxes</li>
          </ul>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-2">
          <span className="text-xs font-bold text-[#183B32] flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-amber-600" />
            What Is Excluded (Quoted Separately):
          </span>
          <ul className="space-y-1.5 text-xs text-[#4B5563]">
            <li className="flex items-start gap-1.5">&bull; Compound boundary wall and steel main entrance gate</li>
            <li className="flex items-start gap-1.5">&bull; Deep borewell drilling, casing pipe &amp; submersible pump</li>
            <li className="flex items-start gap-1.5">&bull; BESCOM permanent 3-phase electricity meter deposit</li>
            <li className="flex items-start gap-1.5">&bull; Interior modular woodwork (kitchen cabinets, wardrobes)</li>
            <li className="flex items-start gap-1.5">&bull; Lift machine installation (civil shaft structure is included)</li>
          </ul>
        </div>
      </div>

      {/* ── 6. SEPARATE CONSULTATION CALLOUT (FLAT ₹1,499) ── */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#C66B4E]" />
            <span className="text-xs font-bold text-[#183B32]">
              Need a Civil Engineer or Architect to Review Your Site?
            </span>
          </div>
          <p className="text-xs text-[#66716B]">
            Get 45-minute 1-on-1 guidance from a senior structural engineer on plot feasibility, BBMP bylaws, and contractor quotes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/consult')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E8EFE9] hover:bg-[#D5E5DC] border border-[#B7CDBB] text-[#183B32] text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs min-h-[40px]"
        >
          <span>Book Consultation (₹1,499)</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#C66B4E]" />
        </button>
      </div>

      {/* ── 7. JUMP TO ANY DECISION TO REFINE ── */}
      <div className="p-5 bg-white rounded-3xl border border-[#E5E7EB] shadow-xs space-y-3 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#183B32] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C66B4E]" />
            <span>Want to modify your selections? Jump back to any step:</span>
          </span>
          <span className="text-[10px] text-[#66716B]">Updates live</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { step: 1, label: '01 Plot & Setbacks', icon: Compass },
            { step: 2, label: '02 Home & Spaces', icon: Home },
            { step: 3, label: '03 Structure & Quality', icon: Building2 },
            { step: 4, label: '04 Finishes & Materials', icon: Layers },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => onAdjustSelections(item.step)}
                className="p-3 rounded-xl border border-[#E5E7EB] hover:border-[#183B32] hover:bg-[#F8F9F7] text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-[#E8EFE9] text-[#183B32] text-[10px] font-bold flex items-center justify-center font-mono">
                    {item.step}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-[#66716B] group-hover:text-[#183B32]" />
                </div>
                <span className="text-xs font-bold text-[#183B32] block leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 8. DISCLAIMER NOTICE ── */}
      <div className="p-4 rounded-2xl bg-[#F8F8F6] border border-[#E5E7EB] flex items-start gap-3 text-left">
        <Info className="w-4 h-4 text-[#66716B] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#66716B] leading-relaxed">
          <strong>Early Planning Notice:</strong> This preliminary estimate is computed using standard Bangalore residential schedules (IS 456 / BBMP bylaws). Final construction cost may vary based on exact architectural blueprints, soil bearing capacity test (SBC), and contractor negotiations.
        </p>
      </div>

      {/* Unlock Report Modal */}
      {showUnlockModal && (
        <UnlockReportModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          initialTierCode="DETAILED_ESTIMATE_499"
        />
      )}
    </div>
  );
};
