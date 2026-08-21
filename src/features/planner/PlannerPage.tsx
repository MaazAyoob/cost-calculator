import React, { useState } from 'react';
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

import { ArrowLeft, ArrowRight, Save, RotateCcw, Eye, X } from 'lucide-react';
import { SavedEstimationsModal } from '../../components/modals/SavedEstimationsModal';

const STEPS = [
  { num: '01', key: 'Plot', title: 'Plot & Dimensions', label: '01 Plot' },
  { num: '02', key: 'Space', title: 'Space Requirements', label: '02 Space' },
  { num: '03', key: 'Structure', title: 'Core Structural Materials', label: '03 Structure' },
  { num: '04', key: 'Flooring', title: 'Flooring & Finishes', label: '04 Flooring' },
  { num: '05', key: 'Walls', title: 'Wall Cladding & Dado', label: '05 Walls' },
  { num: '06', key: 'Doors', title: 'Doors & Joinery', label: '06 Doors' },
  { num: '07', key: 'Windows', title: 'Windows & Glazing', label: '07 Windows' },
  { num: '08', key: 'Electrical', title: 'Electrical & MEP', label: '08 Electrical' },
  { num: '09', key: 'Bathroom', title: 'Bathroom Fixtures & Plumbing', label: '09 Bathroom' },
  { num: '10', key: 'Paint', title: 'Painting & Surface Treatment', label: '10 Paint' },
];

export const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, nextStep, prevStep, setStep, startNewProject } = useWizardStore();
  const budget = useBudgetResult();
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [mobileEstimateOpen, setMobileEstimateOpen] = useState(false);

  const totalCost = budget.totalProjectCost || 0;
  const currentStepDef = STEPS[currentStep - 1] || STEPS[0];
  const progressPct = Math.min(100, Math.round((currentStep / 10) * 100));

  return (
    <motion.div
      variants={pageFadeVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-[#F8F8F6] text-[#1B3D34] flex flex-col font-sans select-none"
    >
      <SEO
        title={`Step ${currentStep} of 10: ${currentStepDef.title} | Hutty Calculator`}
        description="Configure plot dimensions, room allocations, structural materials, and finishes to compute your deterministic home construction estimate."
      />

      {/* ── TOP BAR (Clean, Quiet, Minimal) ── */}
      {currentStep > 0 && currentStep < 11 && (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Left: Brand & Exit to Home */}
            <div
              onClick={() => navigate('/')}
              className="cursor-pointer group shrink-0"
              role="button"
              aria-label="Back to home"
            >
              <HuttyLogo variant="compact" width={110} />
            </div>

            {/* Center: Step Count Indicator & Title */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2.5 py-1 rounded-md border border-[#1B3D34]/20">
                Step {currentStep} of 10
              </span>
              <span className="hidden sm:inline text-xs font-semibold text-[#4B5563]">
                • {currentStepDef.title}
              </span>
            </div>

            {/* Right: Actions (Save & Reset) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowSavedModal(true)}
                className="text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] px-2.5 py-1.5 rounded-md hover:bg-[rgba(27,61,52,0.04)] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Saved Projects"
              >
                <Save className="w-3.5 h-3.5 text-[#1B3D34]" />
                <span className="hidden md:inline">Save</span>
              </button>

              <button
                type="button"
                onClick={startNewProject}
                className="text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] px-2.5 py-1.5 rounded-md hover:bg-[rgba(27,61,52,0.04)] transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset to 0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Thin Progress Line */}
          <div className="max-w-7xl mx-auto mt-3 h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1B3D34] transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </header>
      )}

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-32 lg:pb-12">
        {currentStep === 0 && <Step0Onboarding />}
        {currentStep === 11 && <Step10LoadingExperience />}

        {currentStep >= 1 && currentStep <= 10 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── LEFT 60% (col-span-12 lg:col-span-7 xl:col-span-7): STEP FORM ── */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step Header */}
              <div className="text-left space-y-1 pb-2 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#F28C28]">
                    0{currentStep}
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#4B5563]">
                    {currentStepDef.title}
                  </span>
                </div>
              </div>

              {/* Step Dynamic Form Components */}
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
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

              {/* Navigation Actions (Previous / Next) */}
              <div className="pt-6 border-t border-[#E5E7EB] flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep <= 1}
                  className={`hutty-btn-secondary text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-lg ${
                    currentStep <= 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  className="hutty-btn-primary text-xs sm:text-sm font-bold px-6 sm:px-8 py-2.5 rounded-lg"
                >
                  <span>{currentStep === 10 ? 'Generate Full Report' : 'Next Step'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* ── RIGHT 40% (col-span-12 lg:col-span-5 xl:col-span-5): LIVE PREVIEW ── */}
            <div className="hidden lg:block lg:col-span-5">
              <LivePreviewPanel />
            </div>

          </div>
        )}
      </main>

      {/* ── MOBILE STICKY BOTTOM ESTIMATE SUMMARY BAR ── */}
      {currentStep >= 1 && currentStep <= 10 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] p-3 shadow-lg flex items-center justify-between gap-3">
          <div
            onClick={() => setMobileEstimateOpen(true)}
            className="flex-1 text-left cursor-pointer"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] block">
              Estimated Total
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold text-[#1B3D34] font-heading">
                {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
              </span>
              <span className="text-[10px] text-[#4B5563] underline">
                View Breakdown
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep <= 1}
              className={`p-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[#1B3D34] ${
                currentStep <= 1 ? 'opacity-30' : 'cursor-pointer'
              }`}
              aria-label="Previous step"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={nextStep}
              className="hutty-btn-primary px-4 py-2.5 rounded-lg text-xs font-bold"
            >
              <span>{currentStep === 10 ? 'Report →' : 'Next →'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MOBILE ESTIMATE BOTTOM SHEET MODAL ── */}
      {mobileEstimateOpen && (
        <div className="fixed inset-0 z-50 bg-[#1B3D34]/40 backdrop-blur-xs flex flex-col justify-end lg:hidden">
          <div className="bg-white rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] font-heading">
                Live Estimate Breakdown
              </span>
              <button
                onClick={() => setMobileEstimateOpen(false)}
                className="p-1 rounded-md text-[#4B5563] hover:text-[#1B3D34]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <LivePreviewPanel />
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
