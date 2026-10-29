import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { pageFadeVariant } from '../../animations/variants';
import { useWizardStore } from '../../store/useWizardStore';
import { useBudgetResult, useArea, useCalculationStore } from '../../store/useCalculationStore';
import { formatCurrency } from '../../utils/cn';
import { LivePreviewPanel } from './LivePreviewPanel';
import { HuttyLogo } from '../../components/brand/HuttyLogo';
import { SEO } from '../../components/common/SEO';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';

// 8 Stages Components
import { Stage1Plot } from './stages/Stage1Plot';
import { Stage2Home } from './stages/Stage2Home';
import { Stage3Rooms } from './stages/Stage3Rooms';
import { Stage4BuildableSpace } from './stages/Stage4BuildableSpace';
import { Stage5ConstructionStyle } from './stages/Stage5ConstructionStyle';
import { Stage6FinishesMaterials } from './stages/Stage6FinishesMaterials';
import { Stage7Estimate } from './stages/Stage7Estimate';
import { Stage8DetailedBOQ } from './stages/Stage8DetailedBOQ';
import { DetailsAndAssumptions } from '../../components/common/DetailsAndAssumptions';

import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  User,
  Check,
  Compass,
  Home,
  Bed,
  Maximize2,
  Building2,
  Layers,
  Calculator,
  FileText,
  Save,
  Clock,
  Eye,
} from 'lucide-react';
import { analytics } from '../../utils/analytics';
import { ProjectSaveStatusBadge } from '../../components/common/ProjectSaveStatusBadge';
import { PackageComparisonModal } from '../../components/modals/PackageComparisonModal';

export const STAGE_CONFIG = [
  { stage: 1, label: 'Your Plot', shortLabel: 'Plot', icon: Compass },
  { stage: 2, label: 'Your Home', shortLabel: 'Home', icon: Home },
  { stage: 3, label: 'Your Rooms', shortLabel: 'Rooms', icon: Bed },
  { stage: 4, label: 'Buildable Space', shortLabel: 'Setbacks', icon: Maximize2 },
  { stage: 5, label: 'Construction Style', shortLabel: 'Style', icon: Building2 },
  { stage: 6, label: 'Finishes & Materials', shortLabel: 'Finishes', icon: Layers },
  { stage: 7, label: 'Your Estimate', shortLabel: 'Estimate', icon: Calculator },
  { stage: 8, label: 'Detailed BOQ', shortLabel: 'BOQ', icon: FileText },
];

export const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const store = useWizardStore();
  const { isAuthenticated, user } = useCustomerAuthStore();
  const budget = useBudgetResult();
  const area = useArea();

  const {
    currentStep,
    setStep,
    startNewProject,
    selectedPackage,
    plotLength,
    plotWidth,
    floors,
  } = store;

  const [searchParams, setSearchParams] = useSearchParams();
  const stageParam = searchParams.get('stage');

  useEffect(() => {
    if (stageParam) {
      const parsed = parseInt(stageParam, 10);
      if (parsed >= 1 && parsed <= 8 && parsed !== currentStep) {
        setStep(parsed);
      }
    }
  }, [stageParam, currentStep, setStep]);

  // Active stage (1 to 8). If store currentStep is 0, default to stage 1
  const activeStage = currentStep >= 1 && currentStep <= 8 ? currentStep : 1;
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // Track initial stage entry on mount
  useEffect(() => {
    analytics.recordStepEnter(
      STAGE_CONFIG[activeStage - 1]?.label || 'Plot',
      selectedPackage,
      undefined,
      activeStage
    );
  }, []);

  // Sync stage to store on change
  const handleSetStage = (stage: number) => {
    const bounded = Math.max(1, Math.min(8, stage));
    setStep(bounded);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('stage', bounded.toString());
      return next;
    }, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    analytics.recordStepEnter(
      STAGE_CONFIG[bounded - 1]?.label || 'Plot',
      selectedPackage,
      undefined,
      bounded
    );
  };

  const handleNext = () => {
    if (activeStage < 8) {
      handleSetStage(activeStage + 1);
    }
  };

  const handlePrev = () => {
    if (activeStage > 1) {
      handleSetStage(activeStage - 1);
    }
  };

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = totalCost > 0 && buaSqFt > 0 ? Math.round(totalCost / buaSqFt) : 0;

  return (
    <div className="w-full h-full flex flex-col bg-[#F8F8F6] text-[#1B3D34] overflow-hidden select-none">
      <SEO
        title={`Hutty Calculator — ${STAGE_CONFIG[activeStage - 1]?.label || 'Estimate Home Construction Cost'}`}
        description="Plan your home, estimate construction cost, check municipal setbacks, and explore materials with Hutty."
      />

      {/* ── TOP SLIM BRAND & PROGRESS HEADER ── */}
      <header className="shrink-0 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 py-2.5 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Home Link */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="cursor-pointer active:scale-95 transition-transform"
              title="Return to Hutty Home"
            >
              <HuttyLogo variant="full" width={96} />
            </button>
            <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-[#E5E7EB] text-xs font-semibold text-[#687770]">
              <span>Residential Construction Calculator</span>
              <span>&bull;</span>
              <span className="text-[#1B3D34]">Bangalore</span>
            </div>
          </div>

          {/* Active Stage Indicator & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset calculator to standard starting plot?')) {
                  startNewProject();
                  handleSetStage(1);
                }
              }}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#687770] hover:text-[#1B3D34] px-2.5 py-1.5 rounded-lg hover:bg-[#F8F9F7] transition-all cursor-pointer"
              title="Reset all inputs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Over</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/consult')}
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold text-[#1B3D34] bg-[#EBF3EF] border border-[#D5E5DC] hover:bg-[#DDF0E5] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>Consult an Expert (₹1,499)</span>
            </button>

            {/* Mobile View Toggle */}
            <button
              type="button"
              onClick={() => setMobileTab(mobileTab === 'form' ? 'preview' : 'form')}
              className="lg:hidden px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EBF3EF] border border-[#D5E5DC] text-[#1B3D34] flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>{mobileTab === 'form' ? '3D View' : 'Planner'}</span>
            </button>
          </div>
        </div>

        {/* 8-Stage Pill Navigation Track */}
        <div className="max-w-7xl mx-auto pt-2.5 pb-0.5">
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
            {STAGE_CONFIG.map((cfg) => {
              const isCurrent = activeStage === cfg.stage;
              const isPast = activeStage > cfg.stage;
              const Icon = cfg.icon;

              return (
                <button
                  key={cfg.stage}
                  type="button"
                  onClick={() => handleSetStage(cfg.stage)}
                  className={`py-1.5 px-2.5 sm:px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                    isCurrent
                      ? 'bg-[#1B3D34] text-white shadow-2xs'
                      : isPast
                      ? 'bg-[#EBF3EF] text-[#1B3D34] hover:bg-[#DDF0E5]'
                      : 'text-[#687770] hover:text-[#1B3D34] hover:bg-[#F8F9F7]'
                  }`}
                  aria-label={`Jump to stage ${cfg.stage}: ${cfg.label}`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    isCurrent
                      ? 'bg-[#F28C28] text-white'
                      : isPast
                      ? 'bg-[#1B3D34] text-white'
                      : 'bg-[#E5E7EB] text-[#4B5563]'
                  }`}>
                    {isPast ? <Check className="w-2.5 h-2.5" /> : cfg.stage}
                  </span>
                  <span className="hidden sm:inline">{cfg.label}</span>
                  <span className="sm:hidden">{cfg.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Thin Progress Line with Roof Accent Dot */}
          <div className="w-full h-1 bg-[#E5E7EB] rounded-full mt-2 overflow-hidden relative">
            <div
              className="h-full bg-[#1B3D34] transition-all duration-300 ease-out"
              style={{ width: `${(activeStage / 8) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE CONTAINER (Balanced Split Desktop / Stacked Mobile) ── */}
      <div className="flex-1 w-full min-h-0 overflow-hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0 items-start">
          
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* LEFT 7/12: GUIDED STAGE FORM CONTAINER                            */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div
            className={`w-full h-full min-h-0 lg:col-span-7 xl:col-span-8 flex flex-col bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden ${
              mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Scrollable Stage Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7 md:p-8 space-y-6 scrollbar-thin">
              
              {/* ── LIVE PRELIMINARY ESTIMATE BANNER (Early Feedback for Homeowners) ── */}
              {totalCost > 0 && (
                <div className="bg-[#EBF3EF] border border-[#D5E5DC] rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#687770]">
                          Live Preliminary Estimate:
                        </span>
                        <span className="text-base sm:text-lg font-black text-[#1B3D34] font-heading tabular-nums">
                          ₹ {totalCost.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-[#687770] hidden xs:inline">
                          (~₹{ratePerSqFt.toLocaleString()}/sq.ft &bull; {buaSqFt.toLocaleString()} sq.ft BUA)
                        </span>
                      </div>
                    </div>
                  </div>

                  {activeStage < 7 && (
                    <button
                      type="button"
                      onClick={() => handleSetStage(7)}
                      className="shrink-0 bg-[#1B3D34] hover:bg-[#142E27] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1 active:scale-95"
                      title="Jump directly to your preliminary estimate"
                    >
                      <span>See Estimate</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                    </button>
                  )}
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage}
                  variants={pageFadeVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
                  {activeStage === 1 && <Stage1Plot />}
                  {activeStage === 2 && <Stage2Home />}
                  {activeStage === 3 && <Stage3Rooms />}
                  {activeStage === 4 && <Stage4BuildableSpace />}
                  {activeStage === 5 && <Stage5ConstructionStyle />}
                  {activeStage === 6 && <Stage6FinishesMaterials />}
                  {activeStage === 7 && (
                    <Stage7Estimate
                      onAdjustSelections={(step) => handleSetStage(step || 1)}
                      onProceedToDetailedBOQ={() => handleSetStage(8)}
                    />
                  )}
                  {activeStage === 8 && (
                    <Stage8DetailedBOQ onBackToEstimate={() => handleSetStage(7)} />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Consistent Progressive Disclosure: Details & assumptions */}
              <div className="pt-2 border-t border-[#E5E7EB]">
                <DetailsAndAssumptions
                  activeStage={activeStage}
                  initialOpen={searchParams.get('details') === 'open'}
                />
              </div>
            </div>

            {/* Docked Sticky Bottom Navigation Bar (Stages 1-6) */}
            {activeStage <= 6 && (
              <div className="shrink-0 p-3.5 sm:p-4 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] flex items-center justify-between gap-3 z-20">
                <button
                  type="button"
                  data-testid="stage-prev-btn"
                  disabled={activeStage === 1}
                  onClick={handlePrev}
                  className="px-4 py-2.5 rounded-xl border border-[#CBD5CB] text-[#1B3D34] bg-white hover:bg-[#F8F9F7] text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="hidden md:inline text-[11px] text-[#687770]">
                    Selections save automatically as you plan.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSetStage(7)}
                    className="text-xs font-bold text-[#1B3D34] hover:text-[#F28C28] underline underline-offset-4 cursor-pointer"
                  >
                    Skip to Estimate (Stage 7) →
                  </button>
                </div>

                <button
                  type="button"
                  data-testid="stage-next-btn"
                  onClick={handleNext}
                  className="px-6 py-2.5 sm:py-3 rounded-xl bg-[#1B3D34] hover:bg-[#142E27] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs flex items-center gap-2 active:scale-95"
                >
                  <span>
                    {activeStage === 6 ? 'View Estimate →' : `Next: ${STAGE_CONFIG[activeStage]?.shortLabel || 'Continue'} →`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                </button>
              </div>
            )}
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* RIGHT 5/12: HOME SNAPSHOT & 3D MASSING PREVIEW                    */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div
            className={`w-full h-full min-h-0 lg:col-span-5 xl:col-span-4 overflow-y-auto pb-16 lg:pb-0 scrollbar-thin ${
              mobileTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            <LivePreviewPanel
              onOpenPackageComparison={() => setShowCompareModal(true)}
              onReviewAllSelections={() => handleSetStage(7)}
            />
          </div>

        </div>
      </div>

      {/* Package comparison modal */}
      {showCompareModal && (
        <PackageComparisonModal
          isOpen={showCompareModal}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  );
};
