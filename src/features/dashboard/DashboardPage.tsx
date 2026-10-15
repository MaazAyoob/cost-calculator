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
  ChevronDown,
  ChevronUp,
  FileText,
  Save,
  ArrowRight,
  Download,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  HardHat,
  Receipt,
  Building,
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
  const { city, plotLength, plotWidth, houseType, specificationTier, selectedPackage, floors } = useWizardStore();
  const { hasDetailedReportAccess } = useEntitlementStore();
  const { preparedFor } = useReportStore();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    materials: true,
    labour: false,
    other: false,
    taxes: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const projectId = result.report?.projectId || 'HUTTY-2026-BLR';
  const isReportUnlocked = hasDetailedReportAccess(projectId);

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = budget.costPerSqFt || 0;
  const hasProject = buaSqFt > 0;

  // Reconciled 4 Familiar Cost Groups from the canonical calculation output
  const materialsCost =
    (budget.directMaterialCost || 0) + (budget.directFixtureCost || 0) > 0
      ? (budget.directMaterialCost || 0) + (budget.directFixtureCost || 0)
      : Math.round(totalCost * 0.58);

  const labourCost =
    (budget.directLabourCost || 0) > 0
      ? budget.directLabourCost
      : Math.round(totalCost * 0.22);

  const otherCost =
    (budget.contractorMargin || 0) + (budget.contingency || 0) + (budget.professionalFees || 0) > 0
      ? (budget.contractorMargin || 0) + (budget.contingency || 0) + (budget.professionalFees || 0)
      : Math.round(totalCost * 0.10);

  const taxesCost =
    (budget.gstAmount || 0) > 0
      ? budget.gstAmount
      : Math.max(0, totalCost - materialsCost - labourCost - otherCost);

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

  const materialHeads = [
    { label: 'Foundation & Structural Frame', amount: budget.structuralCost },
    { label: 'Flooring & Wet Areas', amount: budget.heads?.find((h) => h.id === 'flooring')?.allocatedAmount ?? 0 },
    { label: 'Doors & Joinery', amount: budget.heads?.find((h) => h.id === 'doorsJoinery')?.allocatedAmount ?? 0 },
    { label: 'Windows & Glazing', amount: budget.heads?.find((h) => h.id === 'windows')?.allocatedAmount ?? 0 },
    { label: 'Electrical Wiring & Conduit', amount: budget.heads?.find((h) => h.id === 'electrical')?.allocatedAmount ?? 0 },
    { label: 'Plumbing & Sanitaryware', amount: budget.heads?.find((h) => h.id === 'plumbingSanitary')?.allocatedAmount ?? 0 },
    { label: 'Painting & Weatherproofing', amount: budget.heads?.find((h) => h.id === 'paintingWaterproofing')?.allocatedAmount ?? 0 },
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
        title="Your Home Construction Estimate | Hutty"
        description="Review your residential construction project estimate, cost breakdown, material takeoffs, and downloadable dossiers."
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

        {/* ── 1. YOUR HOME CONSTRUCTION ESTIMATE HERO ── */}
        <section className="bg-white border border-[#E3E8E2] rounded-3xl p-6 sm:p-9 shadow-xs space-y-6 arch-bracketed text-left">
          
          {/* Header & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E8E2] pb-5">
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F28C28]">
                RESIDENTIAL COST ESTIMATE
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1B3D34] font-heading">
                Your Home Construction Estimate
              </h1>
              <p className="text-xs text-[#52605B]">
                Based on your plot, floor plan, and selected material standards.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-3 py-1.5 rounded-full border border-[#1B3D34]/15">
                PACKAGE: {(selectedPackage || 'PREMIUM').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Approved Disclaimer Notice */}
          <div className="p-3.5 bg-[#FAFBF9] rounded-2xl border border-[#DCE4DE] flex items-start gap-3">
            <Info className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
            <div className="text-xs text-[#4B5563] leading-relaxed">
              <strong className="text-[#1B3D34] font-semibold">Estimate Note:</strong> This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked.
            </div>
          </div>

          {hasProject ? (
            <div className="space-y-6">
              {/* Primary Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-6 lg:col-span-6 space-y-1.5 min-w-0">
                  <span className="font-mono text-xs text-[#4B5563] block uppercase tracking-wider">
                    TOTAL ESTIMATED CONSTRUCTION BUDGET
                  </span>
                  <div className="arch-stat-hero text-[#1B3D34]">
                    {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
                  </div>
                  <p className="text-xs text-[#4B5563] max-w-lg">
                    Includes civil frame, materials, MEP conduit, and contractor execution schedules.
                  </p>
                </div>

                <div className="md:col-span-6 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="space-y-1 p-4 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2] min-w-0">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#4B5563] block">
                  TOTAL BUILT-UP AREA
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#1B3D34] font-heading block tabular-nums">
                  {buaSqFt.toLocaleString()} <span className="text-xs font-normal text-[#4B5563]">sq.ft</span>
                </span>
                <span className="text-[11px] font-mono text-[#1B3D34] block whitespace-nowrap">
                  Effective: ₹{ratePerSqFt.toLocaleString()} / sq.ft
                </span>
              </div>

              <div className="space-y-1 p-4 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2] min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#4B5563] block">
                  SITE &amp; FLOORS
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#1B3D34] font-heading block tabular-nums">
                  {plotLength > 0 ? `${plotLength}' × ${plotWidth}'` : 'Custom'}
                </span>
                <span className="text-[11px] font-mono text-[#F28C28] font-bold block whitespace-nowrap">
                  {floors ? `G+${floors - 1} Floors` : 'G+1 Floors'} &bull; {city || 'Bangalore'}
                </span>
              </div>
            </div>
          </div>

              {/* Physical Materials Needed Takeoff Strip */}
              <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E3E8E2] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#4B5563] uppercase font-bold text-[10px]">
                    MATERIALS NEEDED FOR YOUR HOUSE
                  </span>
                  <span className="text-[#1B3D34] font-bold text-[10px]">
                    ESTIMATED MATERIAL QUANTITIES
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-white p-3 rounded-xl border border-[#E3E8E2]">
                    <span className="text-[#4B5563] text-[10px] block">Fe 550D Steel:</span>
                    <span className="text-sm font-bold text-[#1B3D34] block mt-0.5">{quantities.steelTonnes || 8.64} Tonnes</span>
                    <span className="text-[9px] text-[#687770] block mt-0.5">Earthquake ductile</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#E3E8E2]">
                    <span className="text-[#4B5563] text-[10px] block">Grade 53 Cement:</span>
                    <span className="text-sm font-bold text-[#1B3D34] block mt-0.5">{quantities.cementBags?.toLocaleString() || 1080} Bags</span>
                    <span className="text-[9px] text-[#687770] block mt-0.5">High-strength structural</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#E3E8E2]">
                    <span className="text-[#4B5563] text-[10px] block">RCC Concrete:</span>
                    <span className="text-sm font-bold text-[#1B3D34] block mt-0.5">{quantities.rccConcreteTotalCuM || 48} m³</span>
                    <span className="text-[9px] text-[#687770] block mt-0.5">Cubic Metres</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#E3E8E2]">
                    <span className="text-[#4B5563] text-[10px] block">Masonry Blocks:</span>
                    <span className="text-sm font-bold text-[#1B3D34] block mt-0.5">{quantities.masonryUnitsCount?.toLocaleString() || 10752} Blocks</span>
                    <span className="text-[9px] text-[#687770] block mt-0.5">Precision wall blocks</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
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
                  <span>Consult an Expert — ₹1,499</span>
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

        {/* ── 2. EXPANDABLE COST BREAKDOWN (THE 4 FAMILIAR GROUPS) ── */}
        {hasProject && (
          <section className="bg-white border border-[#E3E8E2] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#E3E8E2] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#1B3D34] font-heading">
                  Cost Breakdown in 4 Familiar Groups
                </h2>
                <p className="text-xs text-[#52605B]">
                  Click any category to inspect itemized costs and trade schedules.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#1B3D34] bg-[#F8F8F6] px-3 py-1 rounded-full border border-[#E3E8E2] self-start sm:self-auto">
                Total: {formatCurrency(totalCost)}
              </span>
            </div>

            <div className="space-y-3">
              
              {/* Category 1: Materials */}
              <div className="border border-[#E3E8E2] rounded-2xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection('materials')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 bg-white hover:bg-[#FAFBF9] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(27,61,52,0.08)] text-[#1B3D34] flex items-center justify-center font-bold text-xs shrink-0">
                      <Layers className="w-4 h-4 text-[#1B3D34]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#1B3D34]">Materials</h3>
                      <p className="text-[11px] text-[#52605B]">
                        Steel, cement, concrete, blocks, tiles, doors, windows, and fittings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-sm font-extrabold text-[#1B3D34]">
                      {formatCurrency(materialsCost)}
                    </span>
                    {expandedSections.materials ? (
                      <ChevronUp className="w-4 h-4 text-[#52605B]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#52605B]" />
                    )}
                  </div>
                </button>

                {expandedSections.materials && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-[#E3E8E2] bg-[#FAFBF9] space-y-2 text-xs">
                    <div className="divide-y divide-[#E3E8E2]/60">
                      {materialHeads.map((item) => (
                        <div key={item.label} className="py-2 flex items-center justify-between">
                          <span className="text-[#52605B]">{item.label}</span>
                          <span className="font-mono font-semibold text-[#1B3D34]">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Category 2: Labour and Work Costs */}
              <div className="border border-[#E3E8E2] rounded-2xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection('labour')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 bg-white hover:bg-[#FAFBF9] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(27,61,52,0.08)] text-[#1B3D34] flex items-center justify-center font-bold text-xs shrink-0">
                      <HardHat className="w-4 h-4 text-[#1B3D34]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#1B3D34]">Labour and Work Costs</h3>
                      <p className="text-[11px] text-[#52605B]">
                        Civil framing works, masonry, bar bending, plastering, plumbing &amp; electrical labor
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-sm font-extrabold text-[#1B3D34]">
                      {formatCurrency(labourCost)}
                    </span>
                    {expandedSections.labour ? (
                      <ChevronUp className="w-4 h-4 text-[#52605B]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#52605B]" />
                    )}
                  </div>
                </button>

                {expandedSections.labour && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-[#E3E8E2] bg-[#FAFBF9] space-y-2 text-xs">
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-[#52605B]">Civil Structure &amp; Masonry Execution</span>
                      <span className="font-mono font-semibold text-[#1B3D34]">
                        {formatCurrency(Math.round(labourCost * 0.65))}
                      </span>
                    </div>
                    <div className="py-2 flex items-center justify-between border-t border-[#E3E8E2]/60">
                      <span className="text-[#52605B]">Finishing Trades (Plumbing, Electrical, Tile Laying, Painting)</span>
                      <span className="font-mono font-semibold text-[#1B3D34]">
                        {formatCurrency(Math.round(labourCost * 0.35))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Category 3: Other Costs */}
              <div className="border border-[#E3E8E2] rounded-2xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection('other')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 bg-white hover:bg-[#FAFBF9] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(27,61,52,0.08)] text-[#1B3D34] flex items-center justify-center font-bold text-xs shrink-0">
                      <Receipt className="w-4 h-4 text-[#1B3D34]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#1B3D34]">Other Costs</h3>
                      <p className="text-[11px] text-[#52605B]">
                        Contractor site supervision, contingency buffer, and architectural/engineering fees
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-sm font-extrabold text-[#1B3D34]">
                      {formatCurrency(otherCost)}
                    </span>
                    {expandedSections.other ? (
                      <ChevronUp className="w-4 h-4 text-[#52605B]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#52605B]" />
                    )}
                  </div>
                </button>

                {expandedSections.other && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-[#E3E8E2] bg-[#FAFBF9] space-y-2 text-xs">
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-[#52605B]">Site Supervision &amp; Execution Overheads</span>
                      <span className="font-mono font-semibold text-[#1B3D34]">
                        {formatCurrency(budget.contractorMargin || Math.round(otherCost * 0.55))}
                      </span>
                    </div>
                    <div className="py-2 flex items-center justify-between border-t border-[#E3E8E2]/60">
                      <span className="text-[#52605B]">Contingency Buffer (Unforeseen Site Expenses)</span>
                      <span className="font-mono font-semibold text-[#1B3D34]">
                        {formatCurrency(budget.contingency || Math.round(otherCost * 0.25))}
                      </span>
                    </div>
                    <div className="py-2 flex items-center justify-between border-t border-[#E3E8E2]/60">
                      <span className="text-[#52605B]">Architectural, Structural &amp; MEP Design Fees</span>
                      <span className="font-mono font-semibold text-[#1B3D34]">
                        {formatCurrency(budget.professionalFees || Math.round(otherCost * 0.20))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Category 4: Taxes and Commercial Charges */}
              <div className="border border-[#E3E8E2] rounded-2xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection('taxes')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 bg-white hover:bg-[#FAFBF9] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(27,61,52,0.08)] text-[#1B3D34] flex items-center justify-center font-bold text-xs shrink-0">
                      <Receipt className="w-4 h-4 text-[#F28C28]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#1B3D34]">Taxes &amp; Commercial Charges</h3>
                      <p className="text-[11px] text-[#52605B]">
                        Statutory Goods &amp; Services Tax (GST) applicable on works contract
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-sm font-extrabold text-[#1B3D34]">
                      {formatCurrency(taxesCost)}
                    </span>
                    {expandedSections.taxes ? (
                      <ChevronUp className="w-4 h-4 text-[#52605B]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#52605B]" />
                    )}
                  </div>
                </button>

                {expandedSections.taxes && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-[#E3E8E2] bg-[#FAFBF9] space-y-2 text-xs">
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-[#52605B]">Statutory GST (Works Contract / Materials)</span>
                      <span className="font-mono font-semibold text-[#1B3D34]">
                        {formatCurrency(taxesCost)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Reconciled Cost Row */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] block">
                    TOTAL ESTIMATED COST
                  </span>
                  <span className="text-[11px] text-[#52605B] block mt-0.5">
                    Materials + Labour + Other Costs + Statutory GST
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-black text-[#1B3D34] font-mono">
                  {formatCurrency(totalCost)}
                </span>
              </div>

            </div>
          </section>
        )}

        {/* ── 3. MY HUTTY PRODUCTS (THE 4 OFFERINGS HUB) ── */}
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
                  Interactive construction estimate based on your plot size, floor plan, and local bylaws.
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

            {/* 3. Quote Review (₹1,499) */}
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
                    ₹1,499
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

        {/* ── 4. CALCULATION TRANSPARENCY: SUMMARY & LABOUR RECONCILIATION ── */}
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
