import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { pageFadeVariant } from '../../animations/variants';
import { useWizardStore } from '../../store/useWizardStore';
import { useUIStore } from '../../store/useUIStore';
import { useBudgetResult } from '../../store/useCalculationStore';
import { formatCurrency } from '../../utils/cn';
import { LivePreviewPanel } from './LivePreviewPanel';

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

import { ArrowLeft, ArrowRight, Save, RotateCcw, Building2, ChevronDown, Check, Eye } from 'lucide-react';
import { SavedEstimationsModal } from '../../components/modals/SavedEstimationsModal';

const STEPS = [
  { num: '01', key: 'Plot', title: 'Plot & Geometry', label: '01 Plot' },
  { num: '02', key: 'Space', title: 'Space Requirements', label: '02 Space' },
  { num: '03', key: 'Structure', title: 'Core Materials', label: '03 Structure' },
  { num: '04', key: 'Flooring', title: 'Flooring Finishes', label: '04 Flooring' },
  { num: '05', key: 'Walls', title: 'Wall Cladding', label: '05 Walls' },
  { num: '06', key: 'Doors', title: 'Doors & Joinery', label: '06 Doors' },
  { num: '07', key: 'Windows', title: 'Windows & Glazing', label: '07 Windows' },
  { num: '08', key: 'Electrical', title: 'Electrical & MEP', label: '08 Electrical' },
  { num: '09', key: 'Bathroom', title: 'Bathroom & CPVC', label: '09 Bathroom' },
  { num: '10', key: 'Paint', title: 'Painting & Coats', label: '10 Paint' },
];

export const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, nextStep, prevStep, setStep, startNewProject } = useWizardStore();
  const { addToast } = useUIStore();
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
      className="min-h-screen bg-[#F7F7F5] text-[#172033] flex flex-col font-sans"
    >
      {/* ── TOP BAR (Clean, Quiet, Minimal) ── */}
      {currentStep > 0 && currentStep < 11 && (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Left: Brand & Exit to Home */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
              role="button"
              aria-label="Back to home"
            >
              <div className="w-7 h-7 rounded-md bg-[#1F4B43] flex items-center justify-center text-white shadow-xs">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col leading-none text-left">
                <span className="font-bold text-xs sm:text-sm text-[#172033]">
                  Cost Calculator
                </span>
                <span className="text-[9px] font-semibold text-[#667085] uppercase tracking-wider">
                  by Rightcon
                </span>
              </div>
            </div>

            {/* Center: Step Count Indicator & Title */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#1F4B43] bg-[#EBF2F0] px-2.5 py-1 rounded-md border border-[#1F4B43]/20">
                Step {currentStep} of 10
              </span>
              <span className="hidden sm:inline text-xs font-semibold text-[#667085]">
                • {currentStepDef.title}
              </span>
            </div>

            {/* Right: Actions (Save & Reset) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowSavedModal(true)}
                className="text-xs font-semibold text-[#667085] hover:text-[#172033] px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Saved Projects"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Save</span>
              </button>

              <button
                type="button"
                onClick={startNewProject}
                className="text-xs font-semibold text-[#667085] hover:text-red-700 px-2.5 py-1.5 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset estimate"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* ── PROGRESS BAR / STEP BREADCRUMBS ── */}
          {/* Desktop Horizontal Step Track */}
          <div className="hidden lg:flex items-center justify-between max-w-7xl mx-auto pt-3 border-t border-[#E5E7EB]/60 mt-2.5 gap-1">
            {STEPS.map((s, idx) => {
              const stepNum = idx + 1;
              const isCurrent = stepNum === currentStep;
              const isPast = stepNum < currentStep;

              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStep(stepNum)}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold py-1 px-2 rounded-md transition-all cursor-pointer ${
                    isCurrent
                      ? 'text-[#1F4B43] font-bold bg-[#EBF2F0] border border-[#1F4B43]/20 shadow-2xs'
                      : isPast
                      ? 'text-[#172033] hover:text-[#1F4B43] hover:bg-slate-100'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[9px] font-mono font-bold flex items-center justify-center ${
                      isCurrent
                        ? 'bg-[#1F4B43] text-white'
                        : isPast
                        ? 'bg-[#EBF2F0] text-[#1F4B43]'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast ? '✓' : stepNum}
                  </span>
                  <span>{s.key}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Linear Progress Line */}
          <div className="lg:hidden absolute bottom-0 left-0 right-0 h-[2px] bg-slate-200">
            <div
              className="h-full bg-[#1F4B43] transition-all duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </header>
      )}

      {/* Step 0 Onboarding View */}
      {currentStep === 0 && <Step0Onboarding />}

      {/* Step 11 Report Processing View */}
      {currentStep === 11 && <Step10LoadingExperience />}

      {/* ── MAIN WORKSPACE (60% Form / 40% Live Preview on Desktop) ── */}
      {currentStep > 0 && currentStep < 11 && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* LEFT 60% (lg:col-span-7): Current Calculator Step Form */}
            <div className="lg:col-span-7 text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  variants={pageFadeVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs"
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

            {/* RIGHT 40% (lg:col-span-5): Sticky Live Estimate Preview */}
            <div className="hidden lg:block lg:col-span-5">
              <LivePreviewPanel />
            </div>

          </div>
        </main>
      )}

      {/* ── STICKY BOTTOM BAR (Desktop & Mobile-First) ── */}
      {currentStep > 0 && currentStep < 11 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] px-4 sm:px-8 py-3 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Back Button */}
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 text-xs font-bold text-[#172033] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentStep === 1 ? 'Home' : 'Back'}</span>
            </button>

            {/* Center (Mobile Only): Sticky Estimate summary + View toggle */}
            <div className="lg:hidden flex items-center gap-2 text-left">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#667085] block">
                  Est. Total
                </span>
                <span className="text-sm font-bold text-[#1F4B43] leading-none block truncate">
                  {totalCost > 0 ? formatCurrency(totalCost) : '₹0'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileEstimateOpen(!mobileEstimateOpen)}
                className="p-2 rounded-lg bg-[#F7F7F5] border border-[#E5E7EB] text-[#1F4B43] text-xs font-semibold flex items-center gap-1"
                title="Toggle live estimate breakdown"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Next / Continue Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 bg-[#1F4B43] hover:bg-[#163731] text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-all cursor-pointer shadow-xs"
              >
                <span>{currentStep < 10 ? 'Next Step' : 'Generate Full Feasibility Report'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Live Preview Modal / Drawer */}
      {mobileEstimateOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end p-3">
          <div className="bg-white rounded-2xl max-h-[85vh] overflow-y-auto p-4 border border-[#E5E7EB] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#E5E7EB]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                Your Live Estimate
              </span>
              <button
                type="button"
                onClick={() => setMobileEstimateOpen(false)}
                className="text-xs font-bold text-[#667085] p-1"
              >
                Close ✕
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
