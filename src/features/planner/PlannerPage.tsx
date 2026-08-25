import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { pageFadeVariant } from '../../animations/variants';
import { useWizardStore } from '../../store/useWizardStore';
import { useBudgetResult, useArea } from '../../store/useCalculationStore';
import { formatCurrency } from '../../utils/cn';
import { LivePreviewPanel } from './LivePreviewPanel';
import { HuttyLogo } from '../../components/common/HuttyLogo';
import { SEO } from '../../components/common/SEO';

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
  Home,
} from 'lucide-react';
import { SavedEstimationsModal } from '../../components/modals/SavedEstimationsModal';

const STEPS = [
  { num: '01', key: 'Plot', title: 'Plot Dimensions & Site', shortTitle: 'Plot' },
  { num: '02', key: 'Space', title: 'Rooms & Layout', shortTitle: 'Space' },
  { num: '03', key: 'Structure', title: 'Structural Materials', shortTitle: 'Structure' },
  { num: '04', key: 'Flooring', title: 'Flooring & Finishes', shortTitle: 'Flooring' },
  { num: '05', key: 'Walls', title: 'Wall Cladding & Dado', shortTitle: 'Cladding' },
  { num: '06', key: 'Doors', title: 'Doors & Joinery', shortTitle: 'Doors' },
  { num: '07', key: 'Windows', title: 'Windows & Glazing', shortTitle: 'Windows' },
  { num: '08', key: 'Electrical', title: 'Electrical & MEP', shortTitle: 'Electrical' },
  { num: '09', key: 'Bathroom', title: 'Bathroom Fixtures', shortTitle: 'Sanitary' },
  { num: '10', key: 'Paint', title: 'Painting & Surfaces', shortTitle: 'Painting' },
];

export const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, nextStep, prevStep, setStep, startNewProject } = useWizardStore();
  const budget = useBudgetResult();
  const area = useArea();

  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Mobile View Switcher: 'form' | 'preview'
  const [mobileActiveTab, setMobileActiveTab] = useState<'form' | 'preview'>('form');

  const totalCost = budget.totalProjectCost || 0;
  const buaSqFt = area.totalBUASqFt || 0;
  const currentStepDef = STEPS[currentStep - 1] || STEPS[0];
  const progressPct = Math.min(100, Math.round((currentStep / 10) * 100));

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
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight' && currentStep < 10) {
        nextStep();
      } else if (e.key === 'ArrowLeft' && currentStep > 1) {
        prevStep();
      } else if (e.key === 'Escape') {
        setShowSavedModal(false);
        setShowResetConfirm(false);
        setShowHelpModal(false);
        setShowShareModal(false);
      }
    },
    [currentStep, nextStep, prevStep]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <motion.div
      variants={pageFadeVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-[100dvh] max-h-[100dvh] flex flex-col bg-[#F8F8F6] text-[#1B3D34] font-sans select-none overflow-hidden"
    >
      <SEO
        title={`Step ${currentStep} of 10: ${currentStepDef.title} | Hutty Calculator`}
        description="Configure plot dimensions, room allocations, structural materials, and finishes to compute your deterministic home construction estimate."
      />

      {/* ── TOP BAR (Clean, Minimal Architectural Header) ── */}
      {currentStep > 0 && currentStep < 11 && (
        <header className="relative shrink-0 bg-white border-b border-[#E5E7EB] z-30">
          <div className="h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            
            {/* Left: Brand Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div
                onClick={() => navigate('/')}
                className="cursor-pointer group flex items-center"
                role="button"
                aria-label="Back to home"
              >
                <HuttyLogo variant="compact" width={92} />
              </div>
            </div>

            {/* Center: Dynamic Sleek Step Timeline (Desktop) & Switcher (Mobile) */}
            <div className="flex flex-col items-center justify-center flex-1 max-w-xl px-2">
              
              {/* Desktop Wispr / Linear inspired Stepper: Inactive compact dots + Active expanding pill */}
              <div className="hidden lg:flex items-center justify-center gap-1.5 w-full">
                {STEPS.map((s, idx) => {
                  const stepNum = idx + 1;
                  const isCurrent = currentStep === stepNum;
                  const isCompleted = currentStep > stepNum;
                  return (
                    <React.Fragment key={s.key}>
                      <button
                        type="button"
                        onClick={() => setStep(stepNum)}
                        className={`group relative flex items-center transition-all duration-200 cursor-pointer ${
                          isCurrent
                            ? 'bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/25 px-2.5 py-1 rounded-full text-[#1B3D34]'
                            : 'p-1 rounded-full text-[#4B5563] hover:text-[#1B3D34]'
                        }`}
                        title={`Step ${stepNum}: ${s.title}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-[#1B3D34] text-white shadow-2xs'
                                : isCompleted
                                ? 'bg-[rgba(27,61,52,0.12)] text-[#1B3D34]'
                                : 'bg-[#F8F8F6] text-[#4B5563] border border-[#E5E7EB] group-hover:bg-[#E5E7EB] group-hover:border-[#D1D5DB]'
                            }`}
                          >
                            {isCompleted ? '✓' : stepNum}
                          </span>
                          
                          {/* Only show title for the ACTIVE step to avoid horizontal crowding */}
                          {isCurrent && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              className="text-xs font-bold text-[#1B3D34] whitespace-nowrap overflow-hidden pr-0.5"
                            >
                              {s.shortTitle}
                            </motion.span>
                          )}
                        </div>
                      </button>
                      
                      {idx < STEPS.length - 1 && (
                        <span
                          className={`h-px w-1.5 sm:w-2 transition-colors ${
                            isCompleted ? 'bg-[#1B3D34]/40' : 'bg-[#E5E7EB]'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Tablet Step Title */}
              <div className="hidden sm:flex lg:hidden items-center gap-2 text-xs">
                <span className="font-mono font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.06)] px-2.5 py-0.5 rounded border border-[#1B3D34]/15">
                  Step {currentStep} of 10
                </span>
                <span className="font-semibold text-[#4B5563] truncate">
                  • {currentStepDef.title}
                </span>
              </div>

              {/* Mobile View Switcher (Form / 3D & Cost) */}
              <div className="flex sm:hidden items-center bg-[#F8F8F6] p-0.5 rounded-lg border border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setMobileActiveTab('form')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    mobileActiveTab === 'form'
                      ? 'bg-[#1B3D34] text-white shadow-xs'
                      : 'text-[#4B5563]'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  <span>Configure ({currentStep}/10)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMobileActiveTab('preview')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    mobileActiveTab === 'preview'
                      ? 'bg-[#1B3D34] text-white shadow-xs'
                      : 'text-[#4B5563]'
                  }`}
                >
                  <Box className="w-3 h-3 text-[#F28C28]" />
                  <span>3D &amp; Estimate</span>
                </button>
              </div>
            </div>

            {/* Right: Actions (Save, Reset, Share, Help, Close) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowSavedModal(true)}
                className="text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] p-1.5 sm:px-2.5 sm:py-1 rounded-lg hover:bg-[rgba(27,61,52,0.04)] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Save Project"
              >
                <Save className="w-3.5 h-3.5 text-[#1B3D34]" />
                <span className="hidden md:inline">Save</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] p-1.5 sm:px-2.5 sm:py-1 rounded-lg hover:bg-[rgba(27,61,52,0.04)] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Reset Configuration"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset</span>
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] p-1.5 sm:px-2.5 sm:py-1 rounded-lg hover:bg-[rgba(27,61,52,0.04)] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Share Project"
              >
                <Share2 className="w-3.5 h-3.5 text-[#1B3D34]" />
                <span className="hidden lg:inline">Share</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] p-1.5 rounded-lg hover:bg-[rgba(27,61,52,0.04)] transition-colors cursor-pointer"
                title="Help & Shortcuts"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] p-1.5 rounded-lg hover:bg-[rgba(27,61,52,0.04)] transition-colors cursor-pointer ml-1"
                title="Exit Calculator"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Architectural Thin Progress Track with Lead Accent */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E5E7EB]">
            <motion.div
              className="h-full bg-[#1B3D34] relative"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#F28C28] rounded-full shadow-xs" />
            </motion.div>
          </div>
        </header>
      )}

      {/* ── MAIN WORKSPACE (Desktop 45% Left Form / 55% Right Live Preview) ── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {currentStep === 0 && (
          <div className="flex-1 overflow-y-auto p-6">
            <Step0Onboarding />
          </div>
        )}

        {currentStep === 11 && (
          <div className="flex-1 overflow-y-auto p-6">
            <Step10LoadingExperience />
          </div>
        )}

        {currentStep >= 1 && currentStep <= 10 && (
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden pb-16 lg:pb-0">
            
            {/* ── LEFT PANEL (45% Desktop): FOCUSED INPUT CONFIGURATION ── */}
            <div
              className={`w-full lg:w-[45%] xl:w-[44%] 2xl:w-[42%] flex flex-col h-full bg-white border-r border-[#E5E7EB] overflow-hidden shrink-0 ${
                mobileActiveTab === 'form' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              
              {/* Scrollable Configuration Panel */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-7 xl:p-8 space-y-6 scrollbar-thin">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-xl mx-auto w-full"
                  >
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
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Desktop Docked Navigation Bar */}
              <div className="hidden lg:flex p-4 bg-white border-t border-[#E5E7EB] items-center justify-between gap-4 shrink-0 z-10">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep <= 1}
                  className={`hutty-btn-secondary text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 ${
                    currentStep <= 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                {/* Compact Step Progress Indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-[#4B5563]">
                    {currentStep} / 10
                  </span>
                  <div className="w-24 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1B3D34] rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="hutty-btn-primary text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>{currentStep === 10 ? 'Generate Full Dossier' : 'Continue'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                </button>
              </div>

            </div>

            {/* ── RIGHT PANEL (55% Desktop): LIVE PREVIEW & ARCHITECTURAL 3D ── */}
            <div
              className={`w-full lg:w-[55%] xl:w-[56%] 2xl:w-[58%] flex-col h-full bg-[#F8F8F6] overflow-y-auto p-4 sm:p-5 lg:p-6 scrollbar-thin ${
                mobileActiveTab === 'preview' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              <LivePreviewPanel />
            </div>

          </div>
        )}
      </div>

      {/* ── MOBILE STICKY BOTTOM ESTIMATE & NAVIGATION BAR ── */}
      {currentStep >= 1 && currentStep <= 10 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] p-3 shadow-lg flex items-center justify-between gap-3">
          
          {/* Quick Price & Preview Switcher */}
          <div
            onClick={() => setMobileActiveTab(mobileActiveTab === 'form' ? 'preview' : 'form')}
            className="flex-1 text-left cursor-pointer"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block">
              Estimated Total ({buaSqFt > 0 ? `${buaSqFt} sq.ft` : 'Live'})
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-[#1B3D34] font-heading leading-tight">
                {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
              </span>
              <span className="text-[10px] text-[#F28C28] font-bold underline">
                {mobileActiveTab === 'form' ? 'View 3D →' : 'Edit Form →'}
              </span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep <= 1}
              className={`p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1B3D34] ${
                currentStep <= 1 ? 'opacity-30' : 'cursor-pointer active:bg-gray-100'
              }`}
              aria-label="Previous step"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={nextStep}
              className="hutty-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <span>{currentStep === 10 ? 'Dossier →' : 'Continue →'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-[#1B3D34]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 max-w-sm w-full space-y-4 shadow-xl text-left">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#1B3D34]" />
                <h3 className="text-sm font-bold text-[#1B3D34] font-heading">Share Construction Plan</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-md text-[#4B5563] hover:text-[#1B3D34] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#4B5563] leading-relaxed">
              Share your live interactive 3D plan and BOQ estimate with your family, architect, or contractor.
            </p>

            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-[#1B3D34] truncate">{window.location.href}</span>
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="hutty-btn-primary px-3 py-1.5 text-xs rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-[#1B3D34]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 max-w-sm w-full space-y-4 shadow-lg text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#F28C28] uppercase tracking-wider">RESET PROJECT</span>
              <h3 className="text-base font-bold text-[#1B3D34]">Reset configuration to zero?</h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                This will clear all plot dimensions, room allocations, and selected materials.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="hutty-btn-secondary px-3 py-1.5 text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-[#1B3D34] text-white hover:bg-[#132C25] font-bold px-4 py-1.5 text-xs rounded-lg cursor-pointer transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help & Shortcuts Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-[#1B3D34]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 max-w-md w-full space-y-4 shadow-lg text-left">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#1B3D34]" />
                <h3 className="text-sm font-bold text-[#1B3D34]">Hutty Planning Methodology</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-md text-[#4B5563] hover:text-[#1B3D34] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#4B5563] leading-relaxed">
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-1">
                <span className="font-bold text-[#1B3D34] block">Deterministic Quantity Surveying</span>
                <p>Calculations compute true structural concrete volumes, rebar tonnage, and exact masonry counts based on geometry and Bangalore/Mysore municipal bylaws.</p>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-1">
                <span className="font-bold text-[#1B3D34] block">Brand Rate Invariance</span>
                <p>Changing brands adjusts material rates and item sums while physical quantities remain identical.</p>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] space-y-1">
                <span className="font-bold text-[#1B3D34] block">Keyboard Navigation Shortcuts</span>
                <div className="grid grid-cols-2 gap-1.5 pt-1 font-mono text-[11px] text-[#1B3D34]">
                  <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB]">←</kbd> Previous Step</div>
                  <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB]">→</kbd> Next Step</div>
                  <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB]">Esc</kbd> Close Modals</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="hutty-btn-primary px-4 py-2 text-xs rounded-lg cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Estimations Modal */}
      <SavedEstimationsModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
      />
    </motion.div>
  );
};
