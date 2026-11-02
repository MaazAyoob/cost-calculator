import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCalculationStore,
  useBudgetResult,
  useArea,
  useQuantities,
  useBOQ,
  useBuildingModel,
} from '../../../store/useCalculationStore';
import { useWizardStore } from '../../../store/useWizardStore';
import { useCustomerAuthStore } from '../../../store/useCustomerAuthStore';
import { useEntitlementStore } from '../../../store/useEntitlementStore';
import { usePricingStore } from '../../../store/usePricingStore';
import { useReportStore } from '../../../store/useReportStore';
import { UnlockReportModal } from '../../../components/modals/UnlockReportModal';
import { UnlockBasicPdfModal } from '../../../components/modals/UnlockBasicPdfModal';
import { BuildableFootprintCanvas } from '../components/BuildableFootprintCanvas';
import { ConstructionStageDiagram } from '../components/ConstructionStageDiagram';
import {
  generateAndDownloadBasicEstimatePdf,
  generateAndDownloadDetailedReportPdf,
  viewBasicEstimatePdfInNewTab,
  viewDetailedReportPdfInNewTab,
} from '../../report/pdfService';
import { PricingTierCode } from '../../../types/pricing';
import { analytics } from '../../../utils/analytics';
import { BOQItem } from '../../../calculation-engine/types';
import { formatCurrency } from '../../../utils/cn';
import { AnimatedNumber } from '../../../components/common/AnimatedNumber';
import {
  Calculator,
  FileText,
  Check,
  Lock,
  Download,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Table,
  Layers,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  ExternalLink,
  Compass,
  Home,
  Bed,
  Building2,
  PhoneCall,
  ChevronRight,
  Search,
  Filter,
  IndianRupee,
  Database,
  Radio,
  SlidersHorizontal,
  DoorClosed,
  Zap,
  CheckSquare,
  XCircle,
  Loader2,
} from 'lucide-react';

// ── QUANTITY TRANSPARENCY TAXONOMY ──
export type QuantityTransparencyType =
  | 'GEOMETRIC_CALCULATION'
  | 'ENGINEERING_FORMULA'
  | 'SPACE_PLANNING_ALLOWANCE'
  | 'SITE_VERIFICATION_REQUIRED';

export interface QuantityBadgeInfo {
  type: QuantityTransparencyType;
  label: string;
  badgeClass: string;
  tooltip: string;
}

export function getQuantityTransparencyInfo(item: BOQItem): QuantityBadgeInfo {
  const code = (item.code || '').toUpperCase();
  const desc = (item.description || '').toLowerCase();
  const cat = (item.category || '').toLowerCase();

  if (
    code.startsWith('EX') ||
    desc.includes('soil') ||
    desc.includes('strata') ||
    desc.includes('footing depth') ||
    desc.includes('hard rock')
  ) {
    return {
      type: 'SITE_VERIFICATION_REQUIRED',
      label: 'Site verification required',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      tooltip: 'Actual excavation depth and footing size depend on soil bearing capacity test (SBC) at your plot site.',
    };
  }

  if (
    code.startsWith('SP') ||
    code.startsWith('PCC') ||
    desc.includes('water tank') ||
    desc.includes('septic') ||
    desc.includes('anti-termite')
  ) {
    return {
      type: 'ENGINEERING_FORMULA',
      label: 'Calculated from standard civil rules',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
      tooltip: 'Calculated using standard civil engineering sizing formulas based on occupancy and plot area.',
    };
  }

  if (
    desc.includes('staircase') ||
    desc.includes('parking') ||
    desc.includes('skirting') ||
    desc.includes('circulation') ||
    cat.includes('plinth')
  ) {
    return {
      type: 'SPACE_PLANNING_ALLOWANCE',
      label: 'Approximate early planning allowance',
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
      tooltip: 'An approximate allowance used for early planning based on typical residential circulation and common spaces.',
    };
  }

  return {
    type: 'GEOMETRIC_CALCULATION',
    label: 'Calculated from your room dimensions',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    tooltip: 'Directly calculated from your entered room lengths, widths, floor heights, and wall areas.',
  };
}

// ── BOQ TRADE CATEGORY FILTER DEFINITIONS ──
interface CategoryFilter {
  id: string;
  label: string;
  matches: (item: BOQItem) => boolean;
}

const CATEGORY_FILTERS: CategoryFilter[] = [
  { id: 'all', label: 'All Trades', matches: () => true },
  {
    id: 'site_earth',
    label: 'Site & Earthwork',
    matches: (i) => i.category === 'Site Preparation' || i.category === 'Excavation & Earthwork',
  },
  {
    id: 'structure',
    label: 'Concrete & Structure',
    matches: (i) =>
      i.category === 'PCC & Sub-structure' ||
      i.category === 'Foundation' ||
      i.category === 'Plinth' ||
      i.category === 'RCC Structure' ||
      i.category === 'Roofing',
  },
  {
    id: 'masonry_plaster',
    label: 'Masonry & Plastering',
    matches: (i) => i.category === 'Masonry' || i.category === 'Plastering',
  },
  {
    id: 'flooring',
    label: 'Flooring & Tiling',
    matches: (i) => i.category === 'Flooring',
  },
  {
    id: 'doors_windows',
    label: 'Doors & Windows',
    matches: (i) => i.category === 'Doors & Joinery' || i.category === 'Windows & Glazing',
  },
  {
    id: 'electrical',
    label: 'Electrical',
    matches: (i) => i.category === 'Electrical',
  },
  {
    id: 'plumbing',
    label: 'Plumbing & Sanitary',
    matches: (i) => i.category === 'Plumbing & Sanitary',
  },
  {
    id: 'painting',
    label: 'Painting & Finishes',
    matches: (i) => i.category === 'Painting & Waterproofing' || i.category === 'Fixtures & Finishes',
  },
];

export interface Chapter7ReviewCommercialProps {
  initialTab?: 'review' | 'boq' | 'reports';
  onAdjustSelections?: (targetStep?: number) => void;
  onProceedToBOQ?: () => void;
  onBackToEstimate?: () => void;
}

export const Chapter7ReviewCommercial: React.FC<Chapter7ReviewCommercialProps> = ({
  initialTab = 'review',
  onAdjustSelections,
  onProceedToBOQ,
  onBackToEstimate,
}) => {
  const navigate = useNavigate();

  // Stores
  const { result } = useCalculationStore();
  const budget = useBudgetResult();
  const area = useArea();
  const quantities = useQuantities();
  const boq = useBOQ();
  const buildingModel = useBuildingModel();
  const rateSourceMetadata = result.rateSourceMetadata;

  const {
    plotLength,
    plotWidth,
    floors,
    houseType,
    selectedPackage,
    parkingType,
    carCount,
    bikeCount,
    rooms,
    specificationTier,
    doors,
    windows,
    electrical,
    bathroomFittings,
    flooringZones,
    wallCladding,
    painting,
  } = useWizardStore();

  const { preparedFor } = useReportStore();
  const { hasDetailedReportAccess, hasBasicPdfAccess } = useEntitlementStore();

  // Active Tab: 1 = Review, 2 = BOQ, 3 = Reports
  const [activeTab, setActiveTab] = useState<'review' | 'boq' | 'reports'>(initialTab);

  // BOQ filtering & search
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showDetailedModal, setShowDetailedModal] = useState<boolean>(false);
  const [detailedModalTier, setDetailedModalTier] = useState<PricingTierCode>('DETAILED_ESTIMATE_499');
  const [showBasicPdfModal, setShowBasicPdfModal] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // GST toggle (statutory opt-in preview)
  const [includeGstInBreakdown, setIncludeGstInBreakdown] = useState<boolean>(false);

  // Project ID and entitlements
  const projectId = result.report?.projectId || 'HUTTY-PROJECT-ESTIMATE';
  const hasDetailedUnlocked = hasDetailedReportAccess(projectId);
  const hasBasicPdfUnlocked = hasBasicPdfAccess(projectId);
  const hasPremiumUnlocked = usePricingStore.getState().canAccessFeature('SCENARIO_COMPARISONS', projectId);

  // Metrics
  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const plotAreaSqFt = (plotLength || 40) * (plotWidth || 30);
  const ratePerSqFt = totalCost > 0 && buaSqFt > 0 ? Math.round(totalCost / buaSqFt) : 0;

  // Realistic range based on standard construction tolerance (±4%)
  const minCostRange = Math.round(totalCost * 0.96);
  const maxCostRange = Math.round(totalCost * 1.04);

  // Cost Heads with Zero Residual Mathematical Reconciliation
  const materialCost = budget.directMaterialCost || 0;
  const labourCost = budget.directLabourCost || 0;
  const fixturesCost = budget.directFixtureCost || Math.max(0, totalCost - (materialCost + labourCost));
  const contractorMargin = budget.contractorMargin || Math.round(totalCost * 0.10);
  const gstAmount = budget.gstAmount || Math.round(totalCost * 0.18);

  const matPct = totalCost > 0 ? Math.round((materialCost / totalCost) * 100) : 58;
  const labPct = totalCost > 0 ? Math.round((labourCost / totalCost) * 100) : 23;
  const fixPct = Math.max(0, 100 - (matPct + labPct));

  // Rate catalog freshness
  const isLiveRates = Boolean(rateSourceMetadata?.isLive);
  const rateDatasetVersion = rateSourceMetadata?.datasetVersion || 'HUTTY-RM-2026.1';

  // Filtered BOQ items
  const filteredBOQ = useMemo(() => {
    let items = boq || [];
    if (selectedTradeFilter !== 'all') {
      const activeFilter = CATEGORY_FILTERS.find((f) => f.id === selectedTradeFilter);
      if (activeFilter) {
        items = items.filter(activeFilter.matches);
      }
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.code.toLowerCase().includes(query)
      );
    }
    return items;
  }, [boq, selectedTradeFilter, searchQuery]);

  // Preview vs Unlocked items
  const displayedBOQ = hasDetailedUnlocked ? filteredBOQ : filteredBOQ.slice(0, 5);
  const lockedCount = Math.max(0, (boq?.length || 62) - 5);

  // Canonical Funnel Tracking: BOQ Preview Viewed
  React.useEffect(() => {
    if (activeTab === 'boq') {
      analytics.trackBoqPreviewViewed();
    }
  }, [activeTab]);

  // Handlers for checkout
  const handleOpenDetailedModal = (tier: PricingTierCode) => {
    setDetailedModalTier(tier);
    setShowDetailedModal(true);
    const amount = tier === 'PREMIUM_1499' ? 1499 : 499;
    analytics.trackCheckoutStarted(tier, amount, 'CASHFREE');
  };

  const handleOpenBasicPdfModal = () => {
    setShowBasicPdfModal(true);
    analytics.trackCheckoutStarted('BASIC_ESTIMATE_PDF', 99, 'CASHFREE');
  };

  // Handlers for PDF downloads
  const handleDownloadBasicPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateAndDownloadBasicEstimatePdf({
        data: result,
        projectName: 'Hutty Residential Estimate',
        preparedFor: preparedFor || 'Valued Homeowner',
        specificationTier,
      });
      analytics.trackReportDownloaded('BASIC_ESTIMATE_PDF', 'PDF');
    } catch (err) {
      console.error('Basic PDF download failed:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadDetailedPdf = async (isPremium: boolean = false) => {
    setIsGeneratingPdf(true);
    try {
      await generateAndDownloadDetailedReportPdf({
        data: result,
        projectName: 'Hutty Residential Estimate',
        preparedFor: preparedFor || 'Valued Homeowner',
        specificationTier,
        isPremium,
      });
      analytics.trackReportDownloaded(isPremium ? 'PREMIUM_1499' : 'DETAILED_BOQ_499', 'PDF');
    } catch (err) {
      console.error('Detailed PDF download failed:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleViewInNewTab = async (isPremium: boolean = false) => {
    try {
      await viewDetailedReportPdfInNewTab({
        data: result,
        projectName: 'Hutty Residential Estimate',
        preparedFor: preparedFor || 'Valued Homeowner',
        specificationTier,
        isPremium,
      });
    } catch (err) {
      console.error('View PDF failed:', err);
    }
  };

  // CSV Export for unlocked users
  const handleExportCsv = () => {
    if (!boq || boq.length === 0) return;
    const headers = [
      'Sl No',
      'Code',
      'Category',
      'Work Description',
      'Quantity',
      'Unit',
      'Unit Rate (INR)',
      'Amount (INR)',
      'Transparency Classification',
    ];
    const rows = boq.map((item, idx) => {
      const badge = getQuantityTransparencyInfo(item);
      return [
        idx + 1,
        `"${item.code}"`,
        `"${item.category}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        item.quantity ? Math.round(item.quantity) : 0,
        `"${item.unit || 'sq.ft'}"`,
        item.unitRate ? Math.round(item.unitRate) : 0,
        item.amount ? Math.round(item.amount) : 0,
        `"${badge.label}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Hutty_BOQ_Schedule_${projectId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* ── CHAPTER HEADER ── */}
      <div className="space-y-1.5 border-b border-[#CBD5CB] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-[11px] font-bold text-[#183B32]">
            <Calculator className="w-3 h-3 text-[#C66B4E]" />
            <span>STEP 7 OF 7 &bull; REVIEW YOUR ESTIMATE &amp; REPORTS</span>
          </div>

          {/* Rate Catalog Freshness Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border border-[#CBD5CB] bg-white shadow-2xs">
            {isLiveRates ? (
              <>
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span className="text-emerald-800 font-bold">Live Market Rates</span>
              </>
            ) : (
              <>
                <Database className="w-3 h-3 text-[#C66B4E]" />
                <span className="text-[#183B32] font-medium">
                  Rates: <strong className="font-bold">{rateDatasetVersion}</strong> (Bengaluru Q1 2026)
                </span>
              </>
            )}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
          Your complete home estimate.
        </h2>
        <p className="text-xs sm:text-sm text-[#505D56]">
          Review your customized budget, check the required materials, inspect trade quantities, or download your official estimate reports.
        </p>
      </div>

      {/* ── THREE MAIN SUB-TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#CBD5CB] no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('review')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'review'
              ? 'bg-[#183B32] text-white shadow-xs'
              : 'bg-white text-[#505D56] border border-[#CBD5CB] hover:bg-[#F8F9F7] hover:border-[#183B32]/30'
          }`}
        >
          <Calculator className={`w-3.5 h-3.5 ${activeTab === 'review' ? 'text-[#C66B4E]' : 'text-[#687770]'}`} />
          <span>1. Project &amp; Cost Review</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('boq');
            if (onProceedToBOQ) onProceedToBOQ();
          }}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'boq'
              ? 'bg-[#183B32] text-white shadow-xs'
              : 'bg-white text-[#505D56] border border-[#CBD5CB] hover:bg-[#F8F9F7] hover:border-[#183B32]/30'
          }`}
        >
          <Table className={`w-3.5 h-3.5 ${activeTab === 'boq' ? 'text-[#C66B4E]' : 'text-[#687770]'}`} />
          <span>2. Detailed BOQ Schedule</span>
          {hasDetailedUnlocked ? (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              Unlocked
            </span>
          ) : (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              Preview
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'reports'
              ? 'bg-[#183B32] text-white shadow-xs'
              : 'bg-white text-[#505D56] border border-[#CBD5CB] hover:bg-[#F8F9F7] hover:border-[#183B32]/30'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'reports' ? 'text-[#C66B4E]' : 'text-[#687770]'}`} />
          <span>3. Reports &amp; Advisory Plans (5 Options)</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: PROJECT & COST REVIEW                                          */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          {/* Executive Budget Hero Card */}
          <div className="p-6 sm:p-8 bg-[#183B32] text-white rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold tracking-wider text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-[#C66B4E]" />
                  ESTIMATED CONSTRUCTION INVESTMENT
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono text-[11px] border border-white/20">
                  Indicative Planning Range: &plusmn;4%
                </span>
              </div>

              {/* Big Animated Currency Display */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                <div>
                  <div className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-white">
                    <AnimatedNumber value={totalCost} format={formatCurrency} />
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-200 mt-1">
                    Indicative Planning Range: <strong>{formatCurrency(minCostRange)}</strong> &ndash;{' '}
                    <strong>{formatCurrency(maxCostRange)}</strong>
                  </p>
                  <p className="text-[11px] text-emerald-300/80 mt-0.5">
                    Early planning allowance based on typical material procurement and local site conditions. Not a contractually guaranteed bid.
                  </p>
                </div>

                <div className="sm:text-right bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15 backdrop-blur-xs">
                  <div className="text-xl sm:text-2xl font-black font-heading text-white">
                    &#8377;{ratePerSqFt.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-emerald-200 font-sans">/ sq.ft BUA</span>
                  </div>
                  <div className="text-[11px] text-emerald-300">
                    Total Built-up Area: <strong>{buaSqFt.toLocaleString()} sq.ft</strong>
                  </div>
                </div>
              </div>

              {/* Quick Jump Call to Action */}
              <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-emerald-200">
                  Ready to inspect line-by-line trade costs?
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('boq')}
                    className="px-4 py-2 rounded-xl bg-white text-[#183B32] text-xs font-bold hover:bg-emerald-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>Inspect BOQ Schedule</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C66B4E]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reports')}
                    className="px-4 py-2 rounded-xl bg-[#C66B4E] text-white text-xs font-bold hover:bg-[#d9771e] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>Download Report</span>
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture & Specification Snapshot */}
          <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#CBD5CB] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#CBD5CB] pb-3">
              <h3 className="text-sm font-bold text-[#183B32] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C66B4E]" />
                <span>Architecture &amp; Space Configuration</span>
              </h3>
              {onAdjustSelections && (
                <button
                  type="button"
                  onClick={() => onAdjustSelections(1)}
                  className="text-xs text-[#C66B4E] hover:text-[#d9771e] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Edit in Chapter 1 / 2</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <div className="text-[11px] text-[#687770]">Plot Dimensions</div>
                <div className="font-bold text-[#183B32] font-mono mt-0.5">
                  {plotLength}&prime; &times; {plotWidth}&prime; ({plotAreaSqFt.toLocaleString()} sq.ft)
                </div>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <div className="text-[11px] text-[#687770]">Floors &amp; Structure</div>
                <div className="font-bold text-[#183B32] mt-0.5">
                  G+{floors} Floors &bull; {houseType}
                </div>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <div className="text-[11px] text-[#687770]">Built-up Area (BUA)</div>
                <div className="font-bold text-[#183B32] font-mono mt-0.5">
                  {buaSqFt.toLocaleString()} sq.ft
                </div>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <div className="text-[11px] text-[#687770]">Specification Tier</div>
                <div className="font-bold text-[#183B32] mt-0.5 capitalize">
                  {specificationTier} Package
                </div>
              </div>
            </div>

            {/* Room Summary Pills */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E5E7EB] text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-[#E8EFE9] text-[#183B32] font-medium border border-[#B7CDBB]">
                {rooms?.bedrooms || 3} Bedrooms
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#E8EFE9] text-[#183B32] font-medium border border-[#B7CDBB]">
                {rooms?.bathrooms || 3} Bathrooms
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#E8EFE9] text-[#183B32] font-medium border border-[#B7CDBB]">
                {rooms?.kitchen || 1} Kitchen
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#E8EFE9] text-[#183B32] font-medium border border-[#B7CDBB]">
                {rooms?.living || 1} Living Room
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#E8EFE9] text-[#183B32] font-medium border border-[#B7CDBB]">
                {rooms?.balcony || 2} Balconies
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#E8EFE9] text-[#183B32] font-medium border border-[#B7CDBB]">
                {carCount || 1} Car ({parkingType})
              </span>
            </div>
          </div>

          {/* Transparent Cost Heads Breakdown (Zero Residual Reconciliation) */}
          <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#CBD5CB] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5CB] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#183B32] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C66B4E]" />
                  <span>Transparent Cost Heads (Zero-Residual Reconciliation)</span>
                </h3>
                <p className="text-[11px] text-[#687770]">
                  Mathematical sum of materials, labour and fittings reconciles 100% to your total project estimate.
                </p>
              </div>

              {/* GST Toggle Option */}
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#183B32] cursor-pointer bg-[#F8F8F6] px-3 py-1.5 rounded-xl border border-[#CBD5CB]">
                <input
                  type="checkbox"
                  checked={includeGstInBreakdown}
                  onChange={(e) => setIncludeGstInBreakdown(e.target.checked)}
                  className="rounded border-[#CBD5CB] text-[#183B32] focus:ring-[#183B32]"
                />
                <span>Include 18% GST Preview</span>
              </label>
            </div>

            {/* Proportion Bar */}
            <div className="space-y-1.5">
              <div className="h-4 w-full bg-[#E5E7EB] rounded-full overflow-hidden flex">
                <div style={{ width: `${matPct}%` }} className="bg-[#183B32] transition-all" title={`Materials: ${matPct}%`} />
                <div style={{ width: `${labPct}%` }} className="bg-[#C66B4E] transition-all" title={`Labour: ${labPct}%`} />
                <div style={{ width: `${fixPct}%` }} className="bg-[#5B8C78] transition-all" title={`Fixtures: ${fixPct}%`} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#687770] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#183B32] inline-block" />
                  Direct Materials ({matPct}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C66B4E] inline-block" />
                  Direct Labour ({labPct}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5B8C78] inline-block" />
                  Fittings &amp; Services ({fixPct}%)
                </span>
              </div>
            </div>

            {/* Itemized Heads Table */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB] space-y-1">
                <div className="text-[11px] text-[#687770] font-medium">1. Physical Materials (Takeoff)</div>
                <div className="text-base font-bold text-[#183B32] font-mono">
                  {formatCurrency(materialCost)}
                </div>
                <div className="text-[10px] text-[#505D56]">
                  Steel, cement, sand, aggregates, blocks, tiles &amp; paint
                </div>
              </div>

              <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB] space-y-1">
                <div className="text-[11px] text-[#687770] font-medium">2. Trade Labour (Milestones)</div>
                <div className="text-base font-bold text-[#183B32] font-mono">
                  {formatCurrency(labourCost)}
                </div>
                <div className="text-[10px] text-[#505D56]">
                  Excavation, bar bending, shuttering, masonry, plaster &amp; tiling
                </div>
              </div>

              <div className="p-3.5 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB] space-y-1">
                <div className="text-[11px] text-[#687770] font-medium">3. Installed Fixtures &amp; Services</div>
                <div className="text-base font-bold text-[#183B32] font-mono">
                  {formatCurrency(fixturesCost)}
                </div>
                <div className="text-[10px] text-[#505D56]">
                  Doors, windows, sanitary sets, wiring circuits &amp; plumbing
                </div>
              </div>
            </div>

            {/* Contractor Margin & GST Note */}
            <div className="p-3 bg-[#E8EFE9] rounded-xl border border-[#B7CDBB] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-[#183B32]">
                <strong>Contractor Overhead &amp; Margin:</strong> Estimated at standard 10% builder execution margin.
                {includeGstInBreakdown && (
                  <span className="block text-[11px] text-[#505D56] mt-0.5">
                    Statutory 18% GST estimate: {formatCurrency(gstAmount)} (brings total to {formatCurrency(totalCost + gstAmount)}).
                  </span>
                )}
              </div>
              <div className="text-[11px] font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-[#B7CDBB] shrink-0">
                Architecture Fee: &#8377;0 (Included)
              </div>
            </div>
          </div>

          {/* Major Physical Quantities Takeoff */}
          <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#CBD5CB] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#CBD5CB] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#183B32] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#C66B4E]" />
                  <span>Physical Material Quantities Takeoff</span>
                </h3>
                <p className="text-[11px] text-[#687770]">
                  Calculated from wall geometry and structural frame rules (IS-456).
                </p>
              </div>
              {onAdjustSelections && (
                <button
                  type="button"
                  onClick={() => onAdjustSelections(5)}
                  className="text-xs text-[#C66B4E] hover:text-[#d9771e] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Edit in Chapter 3 &ndash; 6</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <div className="text-[11px] text-[#687770]">Structural Steel (TMT Fe550D)</div>
                <div className="font-bold text-[#183B32] font-mono text-sm mt-0.5">
                  {quantities?.steelTonnes ? quantities.steelTonnes.toFixed(2) : '-'} Tonnes
                </div>
                <div className="text-[10px] text-[#505D56]">
                  ~{quantities?.steelFactorKgPerSqFt ? quantities.steelFactorKgPerSqFt.toFixed(2) : '3.40'} kg/sq.ft BUA
                </div>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <div className="text-[11px] text-[#687770]">Cement (OPC 53 / PPC)</div>
                <div className="font-bold text-[#183B32] font-mono text-sm mt-0.5">
                  {quantities?.cementBags ? Math.round(quantities.cementBags).toLocaleString() : '-'} Bags
                </div>
                <div className="text-[10px] text-[#505D56]">
                  ~{quantities?.cementBags && buaSqFt > 0 ? (quantities.cementBags / buaSqFt).toFixed(2) : '0.40'} bags/sq.ft BUA
                </div>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <div className="text-[11px] text-[#687770]">M-Sand &amp; P-Sand</div>
                <div className="font-bold text-[#183B32] font-mono text-sm mt-0.5">
                  {quantities?.sandCuFt ? Math.round(quantities.sandCuFt).toLocaleString() : '-'} CFT
                </div>
                <div className="text-[10px] text-[#505D56]">Manufactured Sand</div>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <div className="text-[11px] text-[#687770]">Coarse Aggregates</div>
                <div className="font-bold text-[#183B32] font-mono text-sm mt-0.5">
                  {quantities?.coarseAggregateCuFt ? Math.round(quantities.coarseAggregateCuFt).toLocaleString() : '-'} CFT
                </div>
                <div className="text-[10px] text-[#505D56]">20mm &amp; 40mm Graded</div>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <div className="text-[11px] text-[#687770]">Masonry Wall Units</div>
                <div className="font-bold text-[#183B32] font-mono text-sm mt-0.5">
                  {quantities?.masonryUnitsCount ? Math.round(quantities.masonryUnitsCount).toLocaleString() : (quantities?.finalBlocksRequired ? Math.round(quantities.finalBlocksRequired).toLocaleString() : '-')} Blocks
                </div>
                <div className="text-[10px] text-[#505D56]">AAC / Concrete Blocks</div>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <div className="text-[11px] text-[#687770]">Concrete Volume</div>
                <div className="font-bold text-[#183B32] font-mono text-sm mt-0.5">
                  {quantities?.rccConcreteTotalCuM ? quantities.rccConcreteTotalCuM.toFixed(1) : (quantities?.totalStructuralConcreteCuM ? quantities.totalStructuralConcreteCuM.toFixed(1) : '-')} m&sup3;
                </div>
                <div className="text-[10px] text-[#505D56]">Columns, Beams &amp; Slabs</div>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <div className="text-[11px] text-[#687770]">Flooring &amp; Tiling</div>
                <div className="font-bold text-[#183B32] font-mono text-sm mt-0.5">
                  {quantities?.floorTilesSqFt ? Math.round(quantities.floorTilesSqFt).toLocaleString() : '-'} sq.ft
                </div>
                <div className="text-[10px] text-[#505D56]">Vitrified &amp; Anti-skid</div>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <div className="text-[11px] text-[#687770]">Wall &amp; Ceiling Paint</div>
                <div className="font-bold text-[#183B32] font-mono text-sm mt-0.5">
                  {quantities?.totalPaintableAreaSqFt ? Math.round(quantities.totalPaintableAreaSqFt).toLocaleString() : '-'} sq.ft
                </div>
                <div className="text-[10px] text-[#505D56]">Internal &amp; External Coats</div>
              </div>
            </div>
          </div>

          {/* Construction Stage & Milestone Workflow */}
          <ConstructionStageDiagram currentStageIndex={2} />

          {/* Inclusions vs Exclusions Grid */}
          <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#CBD5CB] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#183B32] flex items-center gap-2 border-b border-[#CBD5CB] pb-3">
              <ShieldCheck className="w-4 h-4 text-[#C66B4E]" />
              <span>Scope Clarity &bull; What's Included vs Excluded</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Inclusions */}
              <div className="p-4 bg-[#E8EFE9] rounded-2xl border border-[#B7CDBB] space-y-2">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Standard Inclusions in this Estimate</span>
                </div>
                <ul className="space-y-1.5 text-[#183B32] text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Complete RCC frame structure: footings, plinth, columns, beams &amp; roof slabs.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>External and internal masonry walls with 1:6 cement mortar / thin-bed adhesive.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Double-coat internal and external sponge plastering.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Selected vitrified / granite flooring across living, bedrooms and balconies.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Complete electrical conduit rough-ins, copper wiring and modular switches.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Concealed CPVC/PVC water lines and sanitary fittings as per chosen tier.</span>
                  </li>
                </ul>
              </div>

              {/* Exclusions */}
              <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-[#FED7AA] space-y-2">
                <div className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Explicit Exclusions &amp; Site-Specific Items</span>
                </div>
                <ul className="space-y-1.5 text-[#7C2D12] text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0">&bull;</span>
                    <span>Borewell drilling, casing pipe and submersible pump set.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0">&bull;</span>
                    <span>BESCOM / CHESCOM 3-phase permanent meter deposit and transformer charges.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0">&bull;</span>
                    <span>BWSSB water connection, UGD connection charges and road-cutting fees.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0">&bull;</span>
                    <span>Interior woodwork, modular kitchen cabinets, wardrobes and loose furniture.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0">&bull;</span>
                    <span>Municipal building sanction plan approval fees and liaison costs.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0">&bull;</span>
                    <span>Compound wall and main gate fabrication (unless specifically configured).</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Statutory Approvals & Geotechnical Disclaimer */}
          <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#CBD5CB] text-xs space-y-1.5 text-[#505D56]">
            <div className="flex items-center gap-1.5 font-bold text-[#183B32]">
              <Info className="w-4 h-4 text-[#C66B4E]" />
              <span>Engineering Assumptions &amp; Regulatory Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              This estimate is generated by Hutty&apos;s computational civil engineering engine based on typical Bengaluru/Mysuru soil bearing capacity (SBC 180&ndash;200 kN/m&sup2;) and standard residential bylaws (BBMP/BDA/MUDA). Soil testing and verified surveyor boundary measurements are recommended before commencement.
            </p>
          </div>

          {/* Backward Editing Jump Strip */}
          <div className="p-4 bg-white rounded-2xl border border-[#CBD5CB] space-y-2">
            <div className="text-xs font-bold text-[#183B32]">Want to adjust any of your previous choices?</div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => onAdjustSelections && onAdjustSelections(1)}
                className="px-3 py-1.5 rounded-lg border border-[#CBD5CB] bg-[#F8F8F6] hover:bg-emerald-50 hover:border-[#183B32] text-[#183B32] font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#C66B4E]" />
                <span>Step 1: Your Plot</span>
              </button>
              <button
                type="button"
                onClick={() => onAdjustSelections && onAdjustSelections(2)}
                className="px-3 py-1.5 rounded-lg border border-[#CBD5CB] bg-[#F8F8F6] hover:bg-emerald-50 hover:border-[#183B32] text-[#183B32] font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-[#C66B4E]" />
                <span>Step 2: Your Home &amp; Rooms</span>
              </button>
              <button
                type="button"
                onClick={() => onAdjustSelections && onAdjustSelections(5)}
                className="px-3 py-1.5 rounded-lg border border-[#CBD5CB] bg-[#F8F8F6] hover:bg-emerald-50 hover:border-[#183B32] text-[#183B32] font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-[#C66B4E]" />
                <span>Step 3: Core Materials</span>
              </button>
              <button
                type="button"
                onClick={() => onAdjustSelections && onAdjustSelections(6)}
                className="px-3 py-1.5 rounded-lg border border-[#CBD5CB] bg-[#F8F8F6] hover:bg-emerald-50 hover:border-[#183B32] text-[#183B32] font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#C66B4E]" />
                <span>Step 4–6: Doors, Windows &amp; Finishes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: DETAILED BOQ SCHEDULE                                          */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'boq' && (
        <div className="space-y-6">
          {/* BOQ Header & Actions */}
          <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#CBD5CB] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#CBD5CB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#183B32] flex items-center gap-2">
                  <Table className="w-4 h-4 text-[#C66B4E]" />
                  <span>Itemized Construction Works BOQ</span>
                </h3>
                <p className="text-xs text-[#687770]">
                  Trade-by-trade engineering schedule covering site prep, civil structure, services, and finishing works.
                </p>
              </div>

              {/* Unlocked Actions vs Locked Status */}
              <div className="flex items-center gap-2 shrink-0">
                {hasDetailedUnlocked ? (
                  <>
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="px-3 py-1.5 rounded-xl border border-[#CBD5CB] bg-white text-[#183B32] text-xs font-bold hover:bg-[#F8F9F7] transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Export full BOQ schedule as spreadsheet CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C66B4E]" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadDetailedPdf(hasPremiumUnlocked)}
                      disabled={isGeneratingPdf}
                      className="px-3.5 py-1.5 rounded-xl bg-[#183B32] text-white text-xs font-bold hover:bg-[#245747] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isGeneratingPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-[#C66B4E]" />
                      )}
                      <span>Download PDF</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenDetailedModal('DETAILED_ESTIMATE_499')}
                    className="px-4 py-2 rounded-xl bg-[#183B32] text-white text-xs font-bold hover:bg-[#245747] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#C66B4E]" />
                    <span>Unlock Full BOQ (&#8377;499)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#687770] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search trade items, codes (e.g. RCC, Tile, Paint)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#CBD5CB] text-xs text-[#183B32] bg-white focus:outline-none focus:border-[#183B32]"
                  />
                </div>

                <div className="text-xs text-[#687770] font-mono self-center">
                  Showing {displayedBOQ.length} of {boq.length} items
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {CATEGORY_FILTERS.map((filter) => {
                  const isSelected = selectedTradeFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setSelectedTradeFilter(filter.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#183B32] text-white font-bold'
                          : 'bg-[#F8F8F6] text-[#505D56] border border-[#CBD5CB] hover:bg-white'
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BOQ Table */}
            <div className="overflow-x-auto no-scrollbar border border-[#CBD5CB] rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F8F6] text-[#687770] font-bold uppercase text-[10px] border-b border-[#CBD5CB]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Trade Category</th>
                    <th className="py-2.5 px-4 min-w-[240px]">Work Description</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3 text-right">Rate (&#8377;)</th>
                    <th className="py-2.5 px-4 text-right">Amount (&#8377;)</th>
                    <th className="py-2.5 px-3">Transparency Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] font-mono text-[11px] text-[#202522]">
                  {displayedBOQ.map((item, idx) => {
                    const badge = getQuantityTransparencyInfo(item);
                    return (
                      <tr key={item.code || idx} className="hover:bg-[#F8F9F7] transition-colors">
                        <td className="py-2.5 px-3 text-[#687770]">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="py-2.5 px-3 font-bold text-[#183B32]">{item.code}</td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-[#183B32]">{item.category}</td>
                        <td className="py-2.5 px-4 font-sans text-xs text-[#4B5563]">
                          {item.description}
                          {item.remarks && (
                            <span className="block text-[10px] text-[#687770] mt-0.5">{item.remarks}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          {item.quantity ? Math.round(item.quantity).toLocaleString() : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-[#687770]">{item.unit || 'sq.ft'}</td>
                        <td className="py-2.5 px-3 text-right text-[#505D56]">
                          &#8377;{item.unitRate ? Math.round(item.unitRate).toLocaleString() : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-[#183B32]">
                          &#8377;{item.amount ? Math.round(item.amount).toLocaleString() : '-'}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badge.badgeClass}`}
                            title={badge.tooltip}
                          >
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Locked Items Notice (If Free User) */}
            {!hasDetailedUnlocked && (
              <div className="p-6 bg-[#F8F8F6] rounded-2xl border-2 border-dashed border-[#CBD5CB] text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-xs border border-[#CBD5CB] text-[#C66B4E]">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-base font-bold text-[#183B32]">
                    {lockedCount}+ Engineering Line Items Locked
                  </h4>
                  <p className="text-xs text-[#505D56]">
                    Unlock the complete Detailed Construction Estimate &amp; BOQ with trade-by-trade material takeoffs, labour milestone schedules, and contractor audit redlines.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenDetailedModal('DETAILED_ESTIMATE_499')}
                    className="px-6 py-2.5 rounded-xl bg-[#183B32] text-white text-xs font-bold hover:bg-[#245747] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#C66B4E]" />
                    <span>Unlock Detailed BOQ &bull; &#8377;499</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenBasicPdfModal}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#CBD5CB] text-[#183B32] text-xs font-bold hover:bg-[#F8F9F7] transition-all cursor-pointer"
                  >
                    <span>Get 1-Page Summary &bull; &#8377;99</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: THE FIVE COMMERCIAL OFFERINGS                                  */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-[#183B32] font-heading">
              Choose your project deliverable or expert guidance.
            </h3>
            <p className="text-xs sm:text-sm text-[#505D56]">
              From free online planning to comprehensive Detailed Construction Estimates &amp; BOQs and 1-on-1 expert advisory sessions.
            </p>
          </div>

          {/* 5 Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Free Calculator (₹0) */}
            <div className="p-5 bg-white rounded-3xl border border-[#CBD5CB] shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#687770] uppercase tracking-wider">
                    Tier 1 &bull; Calculator
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8EFE9] text-[#183B32] border border-[#B7CDBB]">
                    Active Plan
                  </span>
                </div>
                <h4 className="text-lg font-black text-[#183B32] font-heading">Online Calculator</h4>
                <div className="text-2xl font-black text-[#183B32] font-heading">
                  &#8377;0 <span className="text-xs font-normal text-[#687770]">/ Free forever</span>
                </div>
                <p className="text-xs text-[#505D56]">
                  Interactive online floor planning, municipal setback preview, material selection, and high-level cost indication.
                </p>

                <ul className="space-y-1.5 text-xs text-[#183B32] pt-2 border-t border-[#E5E7EB]">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Interactive 3D/2D plot setbacks</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Real-time material specification</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>5-item BOQ preview table</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-[#687770]">
                    <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>No downloadable PDF document</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                disabled
                className="w-full py-2.5 rounded-xl bg-[#F8F8F6] border border-[#CBD5CB] text-[#687770] text-xs font-bold cursor-not-allowed"
              >
                Included in Session
              </button>
            </div>

            {/* 2. Basic PDF (₹99) */}
            <div className="p-5 bg-white rounded-3xl border border-[#CBD5CB] shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#687770] uppercase tracking-wider">
                    Tier 2 &bull; PDF Export
                  </span>
                  {hasBasicPdfUnlocked && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Purchased
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-black text-[#183B32] font-heading">Basic Estimate PDF</h4>
                <div className="text-2xl font-black text-[#183B32] font-heading">
                  &#8377;99 <span className="text-xs font-normal text-[#687770]">/ One-time</span>
                </div>
                <p className="text-xs text-[#505D56]">
                  A concise 1-page executive summary PDF with plot dimensions, cost ranges, and material/labour proportions.
                </p>

                <ul className="space-y-1.5 text-xs text-[#183B32] pt-2 border-t border-[#E5E7EB]">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>1-Page executive summary PDF</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Official estimate reference ID</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Perfect for family review &amp; initial bank discussions</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-[#687770]">
                    <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>Excludes itemized trade line items</span>
                  </li>
                </ul>
              </div>

              {hasBasicPdfUnlocked ? (
                <button
                  type="button"
                  onClick={handleDownloadBasicPdf}
                  disabled={isGeneratingPdf}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Basic PDF</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenBasicPdfModal}
                  className="w-full py-2.5 rounded-xl bg-[#183B32] text-white text-xs font-bold hover:bg-[#245747] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-[#C66B4E]" />
                  <span>Get Basic PDF &bull; &#8377;99</span>
                </button>
              )}
            </div>

            {/* 3. Detailed BOQ (₹499) — Recommended */}
            <div className="p-5 bg-white rounded-3xl border-2 border-[#183B32] shadow-md flex flex-col justify-between space-y-4 relative">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#183B32] text-white text-[10px] font-bold uppercase tracking-wider">
                Recommended
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#C66B4E] uppercase tracking-wider">
                    Tier 3 &bull; Engineering Dossier
                  </span>
                  {hasDetailedUnlocked && !hasPremiumUnlocked && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Purchased
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-black text-[#183B32] font-heading">Detailed BOQ Report</h4>
                <div className="text-2xl font-black text-[#183B32] font-heading">
                  &#8377;499 <span className="text-xs font-normal text-[#687770]">/ One-time</span>
                </div>
                <p className="text-xs text-[#505D56]">
                  Complete 5&ndash;8 page Detailed Construction Estimate &amp; BOQ with 60+ itemized trade works, material takeoff schedules, and cash-flow milestones.
                </p>

                <ul className="space-y-1.5 text-xs text-[#183B32] pt-2 border-t border-[#E5E7EB]">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Section A: 60+ Itemized Civil BOQ</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Section B: Material Takeoff (Steel, Cement, Sand)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Section C: Fixtures &amp; Fittings Schedule</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Section D: Commercial Cash-Flow Milestones</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Automated QA Gate Certification</span>
                  </li>
                </ul>
              </div>

              {hasDetailedUnlocked ? (
                <button
                  type="button"
                  onClick={() => handleDownloadDetailedPdf(false)}
                  disabled={isGeneratingPdf}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Detailed BOQ</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenDetailedModal('DETAILED_ESTIMATE_499')}
                  className="w-full py-2.5 rounded-xl bg-[#183B32] text-white text-xs font-bold hover:bg-[#245747] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C66B4E]" />
                  <span>Unlock Detailed BOQ &bull; &#8377;499</span>
                </button>
              )}
            </div>

            {/* 4. Premium BOQ (₹1,499) */}
            <div className="p-5 bg-white rounded-3xl border border-[#CBD5CB] shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                    Tier 4 &bull; Comprehensive
                  </span>
                  {hasPremiumUnlocked && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      Active
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-black text-[#183B32] font-heading">Premium Dossier</h4>
                <div className="text-2xl font-black text-[#183B32] font-heading">
                  &#8377;1,499 <span className="text-xs font-normal text-[#687770]">/ One-time</span>
                </div>
                <p className="text-xs text-[#505D56]">
                  Everything in Detailed BOQ plus Section E contractor audit redlines, Q1 2026 Bengaluru benchmark rates, and Excel export.
                </p>

                <ul className="space-y-1.5 text-xs text-[#183B32] pt-2 border-t border-[#E5E7EB]">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Everything in Detailed BOQ (&#8377;499)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Section E: Contractor Quote Audit Redlines</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Static Q1 2026 Bengaluru Rate Benchmarks</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Multi-scenario specification comparison</span>
                  </li>
                </ul>

                <p className="text-[10px] text-[#687770] italic pt-1">
                  (Note: Consultation with an expert is an independent human service and is booked separately).
                </p>
              </div>

              {hasPremiumUnlocked ? (
                <button
                  type="button"
                  onClick={() => handleDownloadDetailedPdf(true)}
                  disabled={isGeneratingPdf}
                  className="w-full py-2.5 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Premium Dossier</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenDetailedModal('PREMIUM_1499')}
                  className="w-full py-2.5 rounded-xl bg-[#183B32] text-white text-xs font-bold hover:bg-[#245747] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5 text-[#C66B4E]" />
                  <span>Unlock Premium &bull; &#8377;1,499</span>
                </button>
              )}
            </div>

            {/* 5. Independent Expert Consultation (₹1,499) — Visually Decoupled */}
            <div className="p-5 bg-gradient-to-br from-[#FFFDF9] to-[#FFF8F0] rounded-3xl border-2 border-[#C66B4E]/40 shadow-xs flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#C66B4E] uppercase tracking-wider flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5" />
                    HUMAN ADVISORY SERVICE &bull; DECOUPLED FROM SOFTWARE
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FED7AA] text-[#7C2D12]">
                    1-on-1 Advisory Session
                  </span>
                </div>
                <h4 className="text-lg font-black text-[#183B32] font-heading">
                  Independent Expert Consultation
                </h4>
                <div className="text-2xl font-black text-[#183B32] font-heading">
                  &#8377;1,499 <span className="text-xs font-normal text-[#687770]">/ Private session</span>
                </div>
                <p className="text-xs text-[#505D56]">
                  A private 1-on-1 consultation session with an independent construction advisor. Review your floor plan, clarify municipal setback rules, and examine contractor estimates without builder bias.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#FED7AA]/60 text-xs text-[#183B32]">
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#C66B4E] shrink-0 mt-0.5" />
                    <span>Architectural plan &amp; room zoning review</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#C66B4E] shrink-0 mt-0.5" />
                    <span>Municipal setback &amp; bye-law guidance</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#C66B4E] shrink-0 mt-0.5" />
                    <span>Contractor quote margin &amp; hidden extras review</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#C66B4E] shrink-0 mt-0.5" />
                    <span>100% unbiased independent advisory</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/consult')}
                className="w-full sm:w-fit px-6 py-2.5 rounded-xl bg-[#C66B4E] text-white text-xs font-bold hover:bg-[#d9771e] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <span>Book Expert Consultation &bull; &#8377;1,499</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS INTEGRATION ── */}
      {showDetailedModal && (
        <UnlockReportModal
          isOpen={showDetailedModal}
          onClose={() => setShowDetailedModal(false)}
          initialTierCode={detailedModalTier}
          onSuccess={() => {
            setShowDetailedModal(false);
          }}
        />
      )}

      {showBasicPdfModal && (
        <UnlockBasicPdfModal
          isOpen={showBasicPdfModal}
          onClose={() => setShowBasicPdfModal(false)}
          onSuccess={() => {
            setShowBasicPdfModal(false);
          }}
        />
      )}
    </div>
  );
};
