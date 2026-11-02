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

// 8 Stages Components & Hutty 3.1 Chapters
import { Chapter1PlotSetbacks } from './chapters/Chapter1PlotSetbacks';
import { Chapter2DreamHome } from './chapters/Chapter2DreamHome';
import { Chapter3CoreMaterials } from './chapters/Chapter3CoreMaterials';
import { Chapter7ReviewCommercial } from './chapters/Chapter7ReviewCommercial';
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
  { stage: 1, label: 'Plot & Setbacks', shortLabel: 'Plot', icon: Compass, color: 'text-[#183B32]', bg: 'bg-[#E8EFE9]' },
  { stage: 2, label: 'Your Home & Rooms', shortLabel: 'Home', icon: Home, color: 'text-[#C66B4E]', bg: 'bg-[#FDF0EB]' },
  { stage: 3, label: 'Room Layout', shortLabel: 'Rooms', icon: Bed, color: 'text-[#C66B4E]', bg: 'bg-[#FDF0EB]' },
  { stage: 4, label: 'Space & Setbacks', shortLabel: 'Setbacks', icon: Maximize2, color: 'text-[#347A62]', bg: 'bg-[#DDF4E7]' },
  { stage: 5, label: 'Choose Materials', shortLabel: 'Materials', icon: Building2, color: 'text-[#C5A46D]', bg: 'bg-[#FAF4E8]' },
  { stage: 6, label: 'Flooring & Finishes', shortLabel: 'Finishes', icon: Layers, color: 'text-[#183B32]', bg: 'bg-[#E8EFE9]' },
  { stage: 7, label: 'Review Estimate', shortLabel: 'Estimate', icon: Calculator, color: 'text-[#347A62]', bg: 'bg-[#DDF4E7]' },
  { stage: 8, label: 'Detailed BOQ', shortLabel: 'BOQ', icon: FileText, color: 'text-[#183B32]', bg: 'bg-[#E8EFE9]' },
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

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const ratePerSqFt = totalCost > 0 && buaSqFt > 0 ? Math.round(totalCost / buaSqFt) : 0;

  // Track initial stage entry on mount
  useEffect(() => {
    analytics.trackCalculatorStart(activeStage);
    analytics.trackChapterStarted(
      activeStage,
      STAGE_CONFIG[activeStage - 1]?.label || 'Plot'
    );
    analytics.recordStepEnter(
      STAGE_CONFIG[activeStage - 1]?.label || 'Plot',
      selectedPackage,
      undefined,
      activeStage
    );
  }, []);

  // Track chapter transition & estimate generation across stage updates
  const prevStageRef = React.useRef(activeStage);
  useEffect(() => {
    if (prevStageRef.current !== activeStage) {
      const prev = prevStageRef.current;
      analytics.trackChapterCompleted(prev, STAGE_CONFIG[prev - 1]?.label || `Stage ${prev}`);
      analytics.trackChapterStarted(activeStage, STAGE_CONFIG[activeStage - 1]?.label || `Stage ${activeStage}`);
      if (activeStage === 7 || activeStage === 8) {
        analytics.trackEstimateGenerated(totalCost, buaSqFt, ratePerSqFt, selectedPackage);
      }
      prevStageRef.current = activeStage;
    }
  }, [activeStage, totalCost, buaSqFt, ratePerSqFt, selectedPackage]);

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
    if (activeStage === 2 || activeStage === 3) {
      // Chapter 2 deduplication: Clicking Next from Chapter 2 advances directly to Stage 4
      handleSetStage(4);
    } else if (activeStage < 8) {
      handleSetStage(activeStage + 1);
    }
  };

  const handlePrev = () => {
    if (activeStage === 4) {
      // Chapter 2 deduplication: Clicking Previous from Stage 4 returns directly to Chapter 2 (Stage 2)
      handleSetStage(2);
    } else if (activeStage === 3) {
      handleSetStage(1);
    } else if (activeStage > 1) {
      handleSetStage(activeStage - 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#F8F8F6] text-[#18211E] overflow-hidden select-none">
      <SEO
        title={`Hutty Calculator — ${STAGE_CONFIG[activeStage - 1]?.label || 'Estimate Home Construction Cost'}`}
        description="Plan your home, estimate construction cost, check municipal setbacks, and explore materials with Hutty."
      />

      {/* ── TOP SLIM BRAND & PROGRESS HEADER ── */}
      <header className="shrink-0 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-6 py-2.5 z-30 shadow-2xs">
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
            <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-[#E5E7EB] text-xs font-semibold text-[#66716B]">
              <span>Residential Construction Calculator</span>
              <span>&bull;</span>
              <span className="text-[#183B32]">Bangalore</span>
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
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#66716B] hover:text-[#183B32] px-2.5 py-1.5 rounded-lg hover:bg-[#F8F8F6] transition-all cursor-pointer min-h-[36px]"
              title="Reset all inputs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Over</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/consult')}
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold text-[#183B32] bg-[#E8EFE9] border border-[#B7CDBB]/80 hover:bg-[#D5E5DC] px-3 py-1.5 rounded-xl transition-all cursor-pointer min-h-[36px]"
            >
              <User className="w-3.5 h-3.5 text-[#C66B4E]" />
              <span>Consult an Expert (₹1,499)</span>
            </button>

            {/* Mobile View Toggle */}
            <button
              type="button"
              onClick={() => setMobileTab(mobileTab === 'form' ? 'preview' : 'form')}
              className="lg:hidden min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E8EFE9] border border-[#B7CDBB]/80 text-[#183B32] flex items-center gap-1.5 cursor-pointer touch-manipulation"
              aria-label={mobileTab === 'form' ? 'Switch to 3D View' : 'Switch to Planner'}
            >
              <Eye className="w-4 h-4 text-[#C66B4E]" />
              <span>{mobileTab === 'form' ? '3D View' : 'Planner'}</span>
            </button>
          </div>
        </div>

        {/* Navigation & Progress Header */}
        <div className="max-w-7xl mx-auto pt-2 pb-0.5">
          {/* Mobile Step Header (Compact & Clear for touch screens) */}
          <div className="sm:hidden flex items-center justify-between py-1 px-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#183B32] text-white flex items-center justify-center font-bold text-xs">
                {activeStage}
              </span>
              <span className="text-xs font-extrabold text-[#18211E]">
                Step {Math.min(activeStage, 7)} of 7 &bull; {STAGE_CONFIG[activeStage - 1]?.label}
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#183B32] bg-[#E8EFE9] px-2 py-0.5 rounded-md">
              {Math.round((activeStage / 8) * 100)}%
            </span>
          </div>

          {/* Desktop/Tablet Stage Pills Track */}
          <div className="hidden sm:flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
            {STAGE_CONFIG.map((cfg) => {
              const isCurrent = activeStage === cfg.stage;
              const isPast = activeStage > cfg.stage;
              const Icon = cfg.icon;

              return (
                <button
                  key={cfg.stage}
                  type="button"
                  onClick={() => handleSetStage(cfg.stage)}
                  className={`py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap min-h-[38px] ${
                    isCurrent
                      ? 'bg-[#183B32] text-white shadow-xs'
                      : isPast
                      ? 'bg-[#E8EFE9] text-[#183B32] hover:bg-[#D5E5DC]'
                      : 'text-[#66716B] hover:text-[#183B32] hover:bg-[#F8F8F6]'
                  }`}
                  aria-label={`Jump to stage ${cfg.stage}: ${cfg.label}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      isCurrent
                        ? 'bg-[#C66B4E] text-white'
                        : isPast
                        ? 'bg-[#347A62] text-white'
                        : 'bg-[#E5E7EB] text-[#66716B]'
                    }`}
                  >
                    {isPast ? <Check className="w-2.5 h-2.5" /> : cfg.stage}
                  </span>
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Smooth Animated Progress Bar */}
          <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full mt-2 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#183B32] via-[#245747] to-[#347A62] transition-all duration-300 ease-out"
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
            className={`w-full h-full min-h-0 lg:col-span-7 xl:col-span-8 flex flex-col bg-white rounded-3xl border-2 border-[#E5E7EB] shadow-xs overflow-hidden ${
              mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Scrollable Stage Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7 md:p-8 space-y-6 scrollbar-thin">
              
              {/* ── LIVE PRELIMINARY ESTIMATE BANNER (Early Feedback for Homeowners) ── */}
              {totalCost > 0 && (
                <div className="bg-[#E8EFE9] border-2 border-[#B7CDBB]/70 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C66B4E] animate-pulse shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#66716B]">
                          Estimated Cost So Far:
                        </span>
                        <span className="text-base sm:text-lg font-black text-[#183B32] font-heading tabular-nums">
                          ₹ {totalCost.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-[#66716B] hidden xs:inline">
                          (~₹{ratePerSqFt.toLocaleString()}/sq.ft &bull; {buaSqFt.toLocaleString()} sq.ft built area)
                        </span>
                      </div>
                    </div>
                  </div>

                  {activeStage < 7 && (
                    <button
                      type="button"
                      onClick={() => handleSetStage(7)}
                      className="shrink-0 bg-[#183B32] hover:bg-[#245747] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1 active:scale-95 min-h-[36px]"
                      title="Jump directly to your preliminary estimate"
                    >
                      <span>Review Estimate</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C66B4E]" />
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
                  {activeStage === 1 && <Chapter1PlotSetbacks />}
                  {activeStage === 2 && <Chapter2DreamHome />}
                  {activeStage === 3 && <Chapter2DreamHome />}
                  {activeStage === 4 && <Stage4BuildableSpace />}
                  {activeStage === 5 && <Chapter3CoreMaterials />}
                  {activeStage === 6 && <Stage6FinishesMaterials />}
                  {activeStage === 7 && (
                    <Chapter7ReviewCommercial
                      initialTab="review"
                      onAdjustSelections={(step) => handleSetStage(step || 1)}
                      onProceedToBOQ={() => handleSetStage(8)}
                    />
                  )}
                  {activeStage === 8 && (
                    <Chapter7ReviewCommercial
                      initialTab="boq"
                      onAdjustSelections={(step) => handleSetStage(step || 1)}
                      onBackToEstimate={() => handleSetStage(7)}
                    />
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
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[#18211E] bg-white hover:bg-[#F8F8F6] text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer touch-manipulation"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="hidden md:inline text-[11px] text-[#66716B]">
                    Selections save automatically as you plan.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSetStage(7)}
                    className="min-h-[44px] inline-flex items-center text-xs font-bold text-[#183B32] hover:text-[#C66B4E] underline underline-offset-4 cursor-pointer touch-manipulation"
                  >
                    Skip to Estimate (Stage 7) →
                  </button>
                </div>

                <button
                  type="button"
                  data-testid="stage-next-btn"
                  onClick={handleNext}
                  className="min-h-[44px] px-6 py-2.5 sm:py-3 rounded-xl bg-[#183B32] hover:bg-[#245747] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs flex items-center gap-2 active:scale-95 touch-manipulation"
                >
                  <span>
                    {activeStage === 6
                      ? 'View Estimate →'
                      : activeStage === 2
                      ? `Next: ${STAGE_CONFIG[3]?.shortLabel || 'Buildable Space'} →`
                      : `Next: ${STAGE_CONFIG[activeStage]?.shortLabel || 'Continue'} →`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C66B4E]" />
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
