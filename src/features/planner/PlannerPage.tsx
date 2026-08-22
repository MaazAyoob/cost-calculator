import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { pageFadeVariant } from '../../animations/variants';
import { useWizardStore } from '../../store/useWizardStore';
import { useBudgetResult } from '../../store/useCalculationStore';
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
  Layers,
} from 'lucide-react';
import { SavedEstimationsModal } from '../../components/modals/SavedEstimationsModal';

const STEPS = [
  { num: '01', key: 'Plot', title: 'Define your plot', shortTitle: 'Plot & Geometry' },
  { num: '02', key: 'Space', title: 'Shape your home', shortTitle: 'Spaces & Layout' },
  { num: '03', key: 'Structure', title: 'Core Structural Materials', shortTitle: 'Steel & Cement' },
  { num: '04', key: 'Flooring', title: 'Flooring & Finishes', shortTitle: 'Floor Finishes' },
  { num: '05', key: 'Walls', title: 'Wall Cladding & Dado', shortTitle: 'Wall Cladding' },
  { num: '06', key: 'Doors', title: 'Doors & Joinery', shortTitle: 'Doors & Frames' },
  { num: '07', key: 'Windows', title: 'Windows & Glazing', shortTitle: 'Windows & Glass' },
  { num: '08', key: 'Electrical', title: 'Electrical & MEP', shortTitle: 'Wiring & MEP' },
  { num: '09', key: 'Bathroom', title: 'Bathroom Fixtures & Plumbing', shortTitle: 'Sanitary & CPVC' },
  { num: '10', key: 'Paint', title: 'Painting & Surface Treatment', shortTitle: 'Paint & Coating' },
];

export const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, nextStep, prevStep, setStep, startNewProject } = useWizardStore();
  const budget = useBudgetResult();
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Mobile View Switcher: 'form' | 'preview'
  const [mobileActiveTab, setMobileActiveTab] = useState<'form' | 'preview'>('form');

  const totalCost = budget.totalProjectCost || 0;
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

      {/* ── COMPACT ARCHITECTURAL HEADER (56px) ── */}
      {currentStep > 0 && currentStep < 11 && (
        <header className="h-14 shrink-0 bg-white border-b border-[#E5E7EB] px-3 sm:px-6 flex items-center justify-between gap-3 z-30">
          
          {/* Left: Brand & Exit */}
          <div
            onClick={() => navigate('/')}
            className="cursor-pointer group shrink-0 flex items-center gap-2"
            role="button"
            aria-label="Back to home"
          >
            <HuttyLogo variant="compact" width={92} />
          </div>

          {/* Center: Step Indicator & Title (Desktop) / Mobile Tab Switcher */}
          <div className="flex flex-col items-center justify-center max-w-md w-full px-2">
            
            {/* Desktop step title */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.06)] px-2.5 py-0.5 rounded border border-[#1B3D34]/15">
                Step {currentStep} of 10
              </span>
              <span className="font-semibold text-[#4B5563] truncate">
                • {currentStepDef.title}
              </span>
            </div>

            {/* Mobile View Switcher Pills */}
            <div className="flex sm:hidden items-center bg-[#F8F8F6] p-0.5 rounded-lg border border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setMobileActiveTab('form')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  mobileActiveTab === 'form'
                    ? 'bg-[#1B3D34] text-white shadow-xs'
                    : 'text-[#4B5563]'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Form ({currentStep}/10)</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileActiveTab('preview')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  mobileActiveTab === 'preview'
                    ? 'bg-[#1B3D34] text-white shadow-xs'
                    : 'text-[#4B5563]'
                }`}
              >
                <Box className="w-3 h-3 text-[#F28C28]" />
                <span>3D &amp; Cost</span>
              </button>
            </div>

            {/* Compact Progress Line */}
            <div className="w-full max-w-xs mt-1 h-1 bg-[#E5E7EB] rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-[#1B3D34] transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] p-1.5 sm:px-2 sm:py-1 rounded-lg hover:bg-[rgba(27,61,52,0.04)] transition-colors flex items-center gap-1 cursor-pointer"
              title="Share Project"
            >
              <Share2 className="w-3.5 h-3.5 text-[#1B3D34]" />
              <span className="hidden lg:inline">Share</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSavedModal(true)}
              className="text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] p-1.5 sm:px-2 sm:py-1 rounded-lg hover:bg-[rgba(27,61,52,0.04)] transition-colors flex items-center gap-1 cursor-pointer"
              title="Saved Projects"
            >
              <Save className="w-3.5 h-3.5 text-[#1B3D34]" />
              <span className="hidden md:inline">Save</span>
            </button>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] p-1.5 sm:px-2 sm:py-1 rounded-lg hover:bg-[rgba(27,61,52,0.04)] transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset to 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] p-1.5 rounded-lg hover:bg-[rgba(27,61,52,0.04)] transition-colors cursor-pointer"
              title="Calculator Guide & Shortcuts"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      )}

      {/* ── FULL VIEWPORT WORKSPACE (60% Form / 40% Live Preview on Desktop + Tab Switching on Mobile) ── */}
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
            
            {/* ── LEFT PANEL (60% Desktop / Form view on Mobile): INPUT FORM & DOCKED NAVIGATION ── */}
            <div
              className={`w-full lg:w-[60%] xl:w-[60%] flex flex-col h-full bg-white border-r border-[#E5E7EB] overflow-hidden shrink-0 ${
                mobileActiveTab === 'form' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              
              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 xl:p-8 space-y-6 scrollbar-thin">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="max-w-2xl mx-auto w-full"
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

              {/* Desktop Docked Sticky Bottom Navigation */}
              <div className="hidden lg:flex p-3.5 sm:p-4 bg-white border-t border-[#E5E7EB] items-center justify-between gap-3 shrink-0 z-10 shadow-xs">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep <= 1}
                  className={`hutty-btn-secondary text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 ${
                    currentStep <= 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-[rgba(27,61,52,0.04)]'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                {/* Step Dots indicator */}
                <div className="flex items-center gap-1">
                  {STEPS.map((s, idx) => {
                    const stepNum = idx + 1;
                    const isCurrent = currentStep === stepNum;
                    const isDone = currentStep > stepNum;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setStep(stepNum)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                          isCurrent
                            ? 'w-5 bg-[#1B3D34]'
                            : isDone
                            ? 'bg-[#1B3D34]/40 hover:bg-[#1B3D34]'
                            : 'bg-[#E5E7EB] hover:bg-[#D1D5DB]'
                        }`}
                        title={`Step ${stepNum}: ${s.shortTitle}`}
                      />
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="hutty-btn-primary text-xs sm:text-sm font-bold px-5 sm:px-6 py-2 rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>{currentStep === 10 ? 'Generate Full Dossier' : 'Continue'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                </button>
              </div>

            </div>

            {/* ── RIGHT PANEL (40% Desktop / 3D & Live Preview on Mobile): LIVE PREVIEW & 3D WORKSPACE ── */}
            <div
              className={`w-full lg:w-[40%] xl:w-[40%] flex-col h-full bg-[#F8F8F6] overflow-y-auto p-4 xl:p-5 scrollbar-thin ${
                mobileActiveTab === 'preview' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              <LivePreviewPanel />
            </div>

          </div>
        )}
      </div>

      {/* ── MOBILE STICKY BOTTOM ESTIMATE & NAVIGATION BAR (Always visible on mobile) ── */}
      {currentStep >= 1 && currentStep <= 10 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] p-3 shadow-lg flex items-center justify-between gap-2">
          
          {/* Quick Price & 3D Switcher */}
          <div
            onClick={() => setMobileActiveTab(mobileActiveTab === 'form' ? 'preview' : 'form')}
            className="flex-1 text-left cursor-pointer"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block">
              Estimated Total
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
              className={`p-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1B3D34] ${
                currentStep <= 1 ? 'opacity-30' : 'cursor-pointer active:bg-gray-100'
              }`}
              aria-label="Previous step"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={nextStep}
              className="hutty-btn-primary px-4 py-2 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              <span>{currentStep === 10 ? 'Dossier →' : 'Next →'}</span>
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
