import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { pageFadeVariant } from '../../animations/variants';
import { useWizardStore } from '../../store/useWizardStore';
import { useBudgetResult, useArea, useCalculationStore } from '../../store/useCalculationStore';
import { formatCurrency } from '../../utils/cn';
import { LivePreviewPanel } from './LivePreviewPanel';
import { HuttyLogo } from '../../components/common/HuttyLogo';
import { SEO } from '../../components/common/SEO';
import {
  getCustomizationDiff,
  getPackageConfig,
} from '../../calculation-engine/data/packageConfig';

import { Step0Onboarding } from './steps/Step0Onboarding';
import { Step1BasicInfo } from './steps/Step1BasicInfo';
import { Step2SpaceRequirements } from './steps/Step2SpaceRequirements';
import { Step3CoreMaterials } from './steps/Step3CoreMaterials';
import { Step4Flooring } from './steps/Step4Flooring';
import { Step5WallCladding } from './steps/Step5WallCladding';
import { Step6Doors } from './steps/Step6Doors';
import { Step7Windows } from './steps/Step7Windows';
import { Step8Electrical } from './steps/Step8Electrical';
import { Step9BathroomFittings } from './steps/Step9BathroomFittings';
import { Step10Painting } from './steps/Step10Painting';
import { Step10LoadingExperience } from './steps/Step10LoadingExperience';

import {
  ArrowLeft,
  ArrowRight,
  Save,
  RotateCcw,
  X,
  HelpCircle,
  Share2,
  Check,
  Copy,
  Sliders,
  Box,
  Sparkles,
  Edit2,
  FileCheck2,
} from 'lucide-react';
import { SavedEstimationsModal } from '../../components/modals/SavedEstimationsModal';
import { PackageComparisonModal } from '../../components/modals/PackageComparisonModal';
import { Modal } from '../../components/ui/Modal';
import { analytics } from '../../utils/analytics';

const STEP_METADATA = [
  {
    step: 0,
    title: 'Choose your construction package',
    subtitle: 'Choose the overall quality and finish level for your home.',
    help: 'You can customise individual structural materials, finishes, and fixtures later.',
    shortTitle: 'Package',
  },
  {
    step: 1,
    title: 'Tell us about your plot & planning',
    subtitle: 'Your plot details help estimate how much you can build.',
    help: 'Enter dimensions from your plot documents where possible. Municipal bylaws determine buildable area.',
    shortTitle: 'Plot',
  },
  {
    step: 2,
    title: 'Choose your rooms & living spaces',
    subtitle: 'Configure how many rooms and circulation spaces you need.',
    help: 'Quantities for doors, windows, and electrical points adjust automatically based on room counts.',
    shortTitle: 'Space',
  },
  {
    step: 3,
    title: 'Steel, cement & core materials',
    subtitle: 'Choose preferred brands and structural material categories.',
    help: 'Concrete volumes, steel tonnage, and masonry block counts are derived deterministically.',
    shortTitle: 'Structure',
  },
  {
    step: 4,
    title: 'Flooring & surface finishes',
    subtitle: 'Choose finishes for living, bedrooms, and common areas.',
    help: 'Vitrified tiles, granite, Italian marble, or wooden flooring options with live price updates.',
    shortTitle: 'Flooring',
  },
  {
    step: 5,
    title: 'Wall cladding & dado tiles',
    subtitle: 'Configure wall tiles for bathrooms, kitchens, and utilities.',
    help: 'Wall dado height options determine exact tile coverage and wet area waterproofing.',
    shortTitle: 'Cladding',
  },
  {
    step: 6,
    title: 'Doors & internal joinery',
    subtitle: 'Choose main door styles and internal flush doors.',
    help: 'Door frame joinery and hardware sets are calculated per room opening.',
    shortTitle: 'Doors',
  },
  {
    step: 7,
    title: 'Windows & glazing systems',
    subtitle: 'Choose window materials and glazing preferences.',
    help: 'Window surface area and lintel framing follow NBC lighting & ventilation norms.',
    shortTitle: 'Windows',
  },
  {
    step: 8,
    title: 'Electrical points & MEP services',
    subtitle: 'Configure electrical points, wiring grades, and circuit protections.',
    help: 'Point counts for lights, fans, power sockets, ACs, and geysers are calculated per space.',
    shortTitle: 'Services',
  },
  {
    step: 9,
    title: 'Bathroom fixtures & plumbing',
    subtitle: 'Choose sanitaryware tiers and CPVC plumbing standards.',
    help: 'Fixture sets, pipes, and drainage lines are verified against attached and powder washrooms.',
    shortTitle: 'Sanitary',
  },
  {
    step: 10,
    title: 'Paint & surface finishes',
    subtitle: 'Select your interior and exterior finish preferences.',
    help: 'Review your choices before preparing your detailed report and BOQ dossier.',
    shortTitle: 'Finishes',
  },
];

export const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const store = useWizardStore();
  const {
    currentStep,
    nextStep,
    prevStep,
    setStep,
    startNewProject,
    selectedPackage,
    plotLength,
    plotWidth,
    city,
    houseType,
    floors,
    rooms,
    materialBrands,
    flooringZones,
    wallCladding,
    doors,
    windows,
    electrical,
    bathroomFittings,
    painting,
  } = store;

  const budget = useBudgetResult();
  const area = useArea();
  const { result } = useCalculationStore();

  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showReviewSummary, setShowReviewSummary] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Mobile View Switcher: 'form' | 'preview'
  const [mobileActiveTab, setMobileActiveTab] = useState<'form' | 'preview'>('form');

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const currentMeta = STEP_METADATA[currentStep] || STEP_METADATA[0];
  const progressPct = Math.min(100, Math.round((currentStep / 10) * 100));

  useEffect(() => {
    if (currentStep >= 11) {
      setStep(0);
    }
  }, []);

  // Customization tracking
  const customizations = getCustomizationDiff(selectedPackage || 'PREMIUM', store);
  const customCount = customizations.length;
  const pkgConfig = getPackageConfig(selectedPackage || 'PREMIUM');

  const handleReset = () => {
    startNewProject();
    setShowResetConfirm(false);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Keyboard navigation shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const tagName = (e.target as HTMLElement)?.tagName;
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName);

      if (e.key === 'Escape') {
        setShowSavedModal(false);
        setShowResetConfirm(false);
        setShowHelpModal(false);
        setShowShareModal(false);
        setShowCompareModal(false);
        setShowReviewSummary(false);
        return;
      }

      if (isInputFocused) {
        return;
      }

      // Safe Enter to continue: only when not typing and no modal is active
      const hasActiveModal =
        showSavedModal ||
        showResetConfirm ||
        showHelpModal ||
        showShareModal ||
        showCompareModal;

      if (e.key === 'Enter' && !hasActiveModal && activeEl?.tagName !== 'BUTTON') {
        if (currentStep === 10 || showReviewSummary) {
          setStep(11);
        } else if (currentStep < 10) {
          nextStep();
        }
        return;
      }

      if (e.key === 'ArrowRight' && currentStep < 10) {
        nextStep();
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        prevStep();
      }
    },
    [
      currentStep,
      nextStep,
      prevStep,
      setStep,
      showReviewSummary,
      showSavedModal,
      showResetConfirm,
      showHelpModal,
      showShareModal,
      showCompareModal,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Analytics: Record step entry and clean exit timing without double-counting
  useEffect(() => {
    const stepName = currentMeta.title;
    analytics.recordStepEnter(stepName, selectedPackage || 'PREMIUM', store.city || 'Bangalore', currentStep);

    return () => {
      analytics.recordStepExit(stepName, selectedPackage || 'PREMIUM', store.city || 'Bangalore');
    };
  }, [currentStep, selectedPackage, store.city, currentMeta.title]);

  const handleJumpToReview = () => {
    setStep(10);
    setShowReviewSummary(true);
  };

  return (
    <motion.div
      variants={pageFadeVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full max-h-screen w-full flex flex-col bg-[#F8F8F6] text-[#172722] font-sans overflow-hidden"
    >
      <SEO
        title={
          currentStep === 0
            ? 'Choose Construction Package | Hutty Calculator'
            : `Step ${currentStep} of 10: ${currentMeta.title} | Hutty Calculator`
        }
        description="Configure plot dimensions, room allocations, structural materials, and finishes to compute your deterministic home construction estimate."
      />

      {/* ── 1. GLOBAL ARCHITECTURAL TOP HEADER ── */}
      <header className="shrink-0 bg-white border-b border-[#E3E8E2] px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between z-30 shadow-2xs">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => navigate('/')}
            className="cursor-pointer flex items-center"
            role="button"
            aria-label="Back to home"
          >
            <HuttyLogo variant="compact" width={92} />
          </div>

          <div className="hidden sm:block border-l border-[#E3E8E2] pl-3">
            <span className="text-[11px] font-bold text-[#172722] tracking-wider uppercase block leading-tight">
              HOME COST PLANNER
            </span>
            <span className="text-[10px] text-[#687770] block leading-tight">
              Residential Planning &amp; Cost Estimation
            </span>
          </div>
        </div>

        {/* Center: Active Package Badge (when step > 0) */}
        {currentStep > 0 && (
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCompareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EDF3ED] text-[#1B3D34] border border-[#CBE0CD] hover:bg-[#DDF4E7] transition-colors cursor-pointer"
              title="Click to compare construction packages"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28]" />
              <span>{pkgConfig.title} Package</span>
              {customCount > 0 ? (
                <span className="text-[#F28C28]">· {customCount} custom</span>
              ) : (
                <span className="text-[#687770] font-normal">· Standard</span>
              )}
            </button>
          </div>
        )}

        {/* Right: Actions (Compare, Save, Reset, Share, Help, Close) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowCompareModal(true)}
            className="text-xs font-semibold text-[#172722] bg-[rgba(27,61,52,0.05)] hover:bg-[rgba(27,61,52,0.1)] p-1.5 sm:px-2.5 sm:py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-[#E3E8E2]"
            title="Compare Packages"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
            <span className="hidden xl:inline">Compare</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSavedModal(true)}
            className="text-xs font-semibold text-[#687770] hover:text-[#172722] p-1.5 sm:px-2.5 sm:py-1 rounded-lg hover:bg-[rgba(27,61,52,0.04)] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Saved Projects"
          >
            <Save className="w-3.5 h-3.5 text-[#1B3D34]" />
            <span className="hidden md:inline">Saved</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="text-xs font-semibold text-[#687770] hover:text-[#172722] p-1.5 sm:px-2.5 sm:py-1 rounded-lg hover:bg-[rgba(27,61,52,0.04)] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset Configuration"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="text-xs font-semibold text-[#687770] hover:text-[#172722] p-1.5 sm:px-2.5 sm:py-1 rounded-lg hover:bg-[rgba(27,61,52,0.04)] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Share Project"
          >
            <Share2 className="w-3.5 h-3.5 text-[#1B3D34]" />
            <span className="hidden lg:inline">Share</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="text-xs font-semibold text-[#687770] hover:text-[#172722] p-1.5 rounded-lg hover:bg-[rgba(27,61,52,0.04)] transition-colors cursor-pointer"
            title="Help & Shortcuts"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-[#687770] hover:text-[#172722] p-1.5 rounded-lg hover:bg-[rgba(27,61,52,0.04)] transition-colors cursor-pointer ml-1"
            title="Exit Calculator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── 2. GUIDED STEP JOURNEY SUB-HEADER (Prototype Style) ── */}
      {currentStep <= 10 && (
        <div className="shrink-0 bg-white border-b border-[#E3E8E2] px-4 sm:px-6 lg:px-8 pt-2 pb-2 sm:pt-3 sm:pb-2.5">
          <div className="max-w-7xl mx-auto space-y-1.5 sm:space-y-2">
            
            {/* Top row: Eyebrow, Title & Step Count */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#687770] block leading-none mb-0.5 sm:mb-1">
                  Your home journey
                </span>
                <h1 className="text-lg sm:text-2xl font-extrabold text-[#172722] tracking-tight font-heading leading-tight">
                  {currentMeta.title}
                </h1>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-[#687770] font-mono">
                  {currentStep === 0
                    ? 'Start here'
                    : currentStep === 10
                    ? 'Step 10 of 10 · Review ready'
                    : `Step ${currentStep} of 10`}
                </span>
              </div>
            </div>

            {/* Progress track (4px height) */}
            <div className="h-1 w-full bg-[#E7EBE5] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#1B3D34] rounded-full relative"
                initial={false}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#F28C28] rounded-full" />
              </motion.div>
            </div>

            {/* Horizontal Step Navigation Pills */}
            <nav
              className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none select-none text-xs"
              aria-label="Calculator Steps Navigation"
            >
              {STEP_METADATA.map((m) => {
                const isCurrent = currentStep === m.step;
                const isCompleted = currentStep > m.step;

                return (
                  <button
                    key={m.step}
                    type="button"
                    onClick={() => {
                      setShowReviewSummary(false);
                      setStep(m.step);
                    }}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-md font-medium text-xs transition-all cursor-pointer shrink-0 ${
                      isCurrent
                        ? 'bg-[#1B3D34] text-white font-bold shadow-xs'
                        : isCompleted
                        ? 'bg-[#EDF3ED] text-[#1B3D34] font-semibold hover:bg-[#DDF4E7]'
                        : 'bg-transparent text-[#687770] hover:text-[#172722] hover:bg-[rgba(27,61,52,0.04)]'
                    }`}
                  >
                    <span>
                      {isCompleted ? '✓ ' : `${m.step}. `}
                      {m.shortTitle}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleJumpToReview}
                className={`whitespace-nowrap px-3 py-1.5 rounded-md font-bold text-xs transition-all cursor-pointer shrink-0 border ${
                  currentStep === 10 && showReviewSummary
                    ? 'bg-[#1B3D34] text-white border-[#1B3D34]'
                    : 'bg-transparent text-[#1B3D34] border-[#E3E8E2] hover:bg-[#EDF3ED]'
                }`}
              >
                <span>✓ Review</span>
              </button>
            </nav>

          </div>
        </div>
      )}

      {/* ── 3. MAIN WORKSPACE (Form Panel & Home Snapshot Sidebar) ── */}
      <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
        {currentStep === 11 ? (
          <div className="h-full w-full overflow-y-auto p-6 scrollbar-thin">
            <Step10LoadingExperience />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto w-full h-full flex flex-col p-4 sm:p-5 lg:p-6 min-h-0 overflow-hidden pb-16 lg:pb-6">
            
            {/* Mobile View Switcher Tab Bar (Configure Form vs 3D & Estimate) */}
            <div className="lg:hidden flex items-center bg-white p-1 rounded-xl border border-[#E3E8E2] mb-3 shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={() => setMobileActiveTab('form')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mobileActiveTab === 'form'
                    ? 'bg-[#1B3D34] text-white shadow-xs'
                    : 'text-[#687770]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Configure Form</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileActiveTab('preview')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mobileActiveTab === 'preview'
                    ? 'bg-[#1B3D34] text-white shadow-xs'
                    : 'text-[#687770]'
                }`}
              >
                <Box className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>Home Snapshot ({totalCost > 0 ? formatCurrency(totalCost) : '₹0'})</span>
              </button>
            </div>

            {/* Layout Grid: Main Column (Flexible Form) + Sidebar (Home Snapshot) */}
            <div className="w-full h-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_350px] gap-5 items-start min-h-0 overflow-hidden">
              
              {/* ── LEFT COLUMN: MAIN FORM PANEL (Spacious, White, 14px Radius) ── */}
              <section
                className={`h-full min-h-0 bg-white rounded-[14px] border border-[#E3E8E2] shadow-xs flex flex-col overflow-hidden ${
                  mobileActiveTab === 'form' ? 'flex' : 'hidden lg:flex'
                }`}
              >
                
                {/* Scrollable Form Body */}
                <div
                  id="step-content-scroll-container"
                  className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-7 pb-20 lg:pb-12 space-y-4 sm:space-y-5 scrollbar-thin"
                >
                  {/* Step Subtitle & Plain-Language Help Guidance */}
                  {currentStep > 0 && !showReviewSummary && (
                    <div className="space-y-1 pb-2.5 border-b border-[#E3E8E2]">
                      <h2 className="text-sm sm:text-base font-bold text-[#172722]">
                        {currentMeta.subtitle}
                      </h2>
                      <p className="text-xs text-[#687770] leading-relaxed">
                        {currentMeta.help}
                      </p>
                    </div>
                  )}

                  {/* Active Step Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={showReviewSummary ? 'review' : currentStep}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="w-full"
                    >
                      {showReviewSummary ? (
                        /* ── FULL SELECTIONS REVIEW SUMMARY ── */
                        <div className="space-y-4 text-left">
                          <div className="p-3.5 bg-[#EDF3ED] rounded-xl border border-[#CBE0CD] space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B3D34] block">
                              Review Your Home Plan
                            </span>
                            <h3 className="text-sm font-bold text-[#172722]">
                              Your selections are saved. Review before preparing the dossier.
                            </h3>
                            <p className="text-xs text-[#687770]">
                              Use the Edit button beside any section to return and modify specifications.
                            </p>
                          </div>

                          <div className="divide-y divide-[#E3E8E2] border border-[#E3E8E2] rounded-xl overflow-hidden bg-white">
                            {[
                              { label: 'Package Standard', value: `${pkgConfig.title} Package`, step: 0 },
                              { label: 'Plot & Dimensions', value: `${plotLength || 40} × ${plotWidth || 30} ft · ${city || 'Bengaluru'}`, step: 1 },
                              { label: 'House & Floors', value: `${houseType || 'Independent house'} · ${floors === 1 ? 'Ground' : `G+${(floors || 1) - 1}`}`, step: 1 },
                              { label: 'Rooms & Spaces', value: `${rooms.bedrooms || 3} Bed · ${rooms.bathrooms || 3} Bath · ${rooms.kitchen || 1} Kitchen`, step: 2 },
                              { label: 'Core Structural Materials', value: `${materialBrands?.steel || 'Tata Tiscon'} · ${materialBrands?.cement || 'UltraTech'}`, step: 3 },
                              { label: 'Main Flooring', value: `${flooringZones?.living || 'Vitrified tiles'} in living area`, step: 4 },
                              { label: 'Wall Cladding', value: `${wallCladding?.bathroomTileHeight || '7 ft'} bathroom tiles`, step: 5 },
                              { label: 'Doors & Joinery', value: `${doors?.mainDoor || 'Teak finish'} main door`, step: 6 },
                              { label: 'Windows & Glazing', value: `${windows?.primaryMaterial || 'uPVC'} soundproof windows`, step: 7 },
                              { label: 'Electrical & MEP', value: `${electrical?.wireTier || 'Finolex'} · ${result.quantities.totalElectricalPoints || 120} points`, step: 8 },
                              { label: 'Bathroom Fixtures', value: `${bathroomFittings?.sanitaryTier || 'Premium'} sanitary fittings`, step: 9 },
                              { label: 'Paint & Finishes', value: `${painting?.brand || 'Asian Paints'} · ${painting?.internalPaint || 'Premium Emulsion'}`, step: 10 },
                            ].map((row, idx) => (
                              <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-[#F8F8F6] transition-colors">
                                <div>
                                  <b className="text-[#172722] block font-semibold">{row.label}</b>
                                  <span className="text-[#687770] text-[11px] block mt-0.5">{row.value}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowReviewSummary(false);
                                    setStep(row.step);
                                  }}
                                  className="text-xs font-bold text-[#1B3D34] hover:text-[#142F28] flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EDF3ED] hover:bg-[#DDF4E7] transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E3E8E2] text-xs text-[#687770] flex items-center gap-2">
                            <FileCheck2 className="w-4 h-4 text-[#1B3D34] shrink-0" />
                            <span>
                              Ready for full engineering report preparation: itemized BOQ, physical takeoffs, and trade cost schedules.
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          {currentStep === 0 && <Step0Onboarding />}
                          {currentStep === 1 && <Step1BasicInfo />}
                          {currentStep === 2 && <Step2SpaceRequirements />}
                          {currentStep === 3 && <Step3CoreMaterials />}
                          {currentStep === 4 && <Step4Flooring />}
                          {currentStep === 5 && <Step5WallCladding />}
                          {currentStep === 6 && <Step6Doors />}
                          {currentStep === 7 && <Step7Windows />}
                          {currentStep === 8 && <Step8Electrical />}
                          {currentStep === 9 && <Step9BathroomFittings />}
                          {currentStep === 10 && <Step10Painting />}
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* ── STICKY / DOCKED FOOTER ACTIONS (Short Viewport Reachable) ── */}
                <div className="hidden lg:flex sticky bottom-0 shrink-0 py-2.5 sm:py-3 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-t border-[#E3E8E2] items-center justify-between gap-3 z-20 shadow-2xs">
                  <button
                    type="button"
                    disabled={currentStep === 0 && !showReviewSummary}
                    onClick={() => {
                      if (showReviewSummary) {
                        setShowReviewSummary(false);
                      } else if (currentStep > 0) {
                        prevStep();
                      }
                    }}
                    className={`hutty-btn-secondary text-xs font-bold px-4 py-2 sm:py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34] ${
                      currentStep === 0 && !showReviewSummary ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                    id="step-nav-prev-btn"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <span className="hidden sm:inline text-[11px] text-[#687770]">
                    Selections stay saved as you navigate.
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep === 10 || showReviewSummary) {
                        setStep(11);
                      } else {
                        nextStep();
                      }
                    }}
                    className="hutty-btn-primary text-xs font-bold px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-xs hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34]"
                    id="step-nav-next-btn"
                  >
                    <span>
                      {currentStep === 10 || showReviewSummary
                        ? 'Generate Full Dossier'
                        : `Continue →`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                  </button>
                </div>

              </section>

              {/* ── RIGHT COLUMN: HOME SNAPSHOT SIDEBAR (Compact, Informative) ── */}
              <div
                className={`w-full h-full min-h-0 overflow-y-auto pb-16 lg:pb-0 scrollbar-thin ${
                  mobileActiveTab === 'preview' ? 'flex flex-col' : 'hidden lg:block'
                }`}
              >
                <LivePreviewPanel
                  onOpenPackageComparison={() => setShowCompareModal(true)}
                  onReviewAllSelections={handleJumpToReview}
                />
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE STICKY BOTTOM ESTIMATE & CONTROLS ── */}
      {currentStep <= 10 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E3E8E2] px-4 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between gap-3">
          <div
            onClick={() => setMobileActiveTab(mobileActiveTab === 'form' ? 'preview' : 'form')}
            className="flex-1 text-left cursor-pointer"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#687770] block">
              Estimated Total &bull; {selectedPackage}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-[#1B3D34] font-heading leading-tight">
                {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
              </span>
              <span className="text-[10px] text-[#F28C28] font-bold underline">
                {mobileActiveTab === 'form' ? 'View 3D Snapshot →' : 'Edit Form →'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={currentStep === 0 && !showReviewSummary}
              onClick={() => {
                if (showReviewSummary) {
                  setShowReviewSummary(false);
                } else if (currentStep > 0) {
                  prevStep();
                }
              }}
              className="p-2.5 rounded-lg border border-[#E3E8E2] bg-white text-[#172722] cursor-pointer disabled:opacity-30"
              aria-label="Previous step"
              id="mobile-step-nav-prev-btn"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentStep === 10 || showReviewSummary) {
                  setStep(11);
                } else {
                  nextStep();
                }
              }}
              className="hutty-btn-primary px-4 py-2.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              id="mobile-step-nav-next-btn"
            >
              <span>{currentStep === 10 || showReviewSummary ? 'Dossier →' : 'Continue →'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Package Comparison Modal */}
      <PackageComparisonModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
      />

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Construction Plan"
        description="Share your live interactive 3D plan and BOQ estimate with your family, architect, or contractor."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-[#F8F8F6] rounded-lg border border-[#E3E8E2] flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-[#172722] truncate">{window.location.href}</span>
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="hutty-btn-primary px-3 py-1.5 text-xs rounded-md shrink-0 flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset configuration to zero?"
        description="This will clear all plot dimensions, room allocations, and selected materials."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="hutty-btn-secondary px-3 py-1.5 text-xs rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-[#1B3D34] text-white hover:bg-[#142F28] font-bold px-4 py-1.5 text-xs rounded-md cursor-pointer transition-colors"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      </Modal>

      {/* Help & Shortcuts Modal */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Hutty Planning Methodology"
        description="Architectural guidelines, engineering standards, and calculator interaction shortcuts."
        maxWidth="md"
      >
        <div className="space-y-3 text-xs text-[#687770] leading-relaxed">
          <div className="p-3 bg-[#F8F8F6] rounded-lg border border-[#E3E8E2] space-y-1">
            <span className="font-bold text-[#172722] block">3-Tier Construction Standards</span>
            <p>Start with Standard, Premium, or Luxury specifications, then customize individual structural, finish, and MEP items as needed.</p>
          </div>

          <div className="p-3 bg-[#F8F8F6] rounded-lg border border-[#E3E8E2] space-y-1">
            <span className="font-bold text-[#172722] block">Deterministic Quantity Surveying</span>
            <p>Calculations compute true structural concrete volumes, rebar tonnage, and exact masonry counts based on geometry and Bangalore/Mysore municipal bylaws.</p>
          </div>

          <div className="p-3 bg-[#F8F8F6] rounded-lg border border-[#E3E8E2] space-y-1">
            <span className="font-bold text-[#172722] block">Keyboard Navigation Shortcuts</span>
            <div className="grid grid-cols-2 gap-1.5 pt-1 font-mono text-[11px] text-[#172722]">
              <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-[#E3E8E2]">←</kbd> Previous Step</div>
              <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-[#E3E8E2]">→</kbd> Next Step</div>
              <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-[#E3E8E2]">Enter</kbd> Continue</div>
              <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-[#E3E8E2]">Esc</kbd> Close Modals</div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="hutty-btn-primary px-4 py-2 text-xs rounded-md cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      </Modal>

      {/* Saved Estimations Modal */}
      <SavedEstimationsModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
      />
    </motion.div>
  );
};
