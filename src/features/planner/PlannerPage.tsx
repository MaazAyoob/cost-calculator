import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { useWizardStore } from '../../store/useWizardStore';
import { useUIStore } from '../../store/useUIStore';
import { Button } from '../../components/ui/Button';
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

import { ArrowLeft, ArrowRight, Save, Sparkles, ChevronLeft, RotateCcw, ChevronDown, CheckCircle2 } from 'lucide-react';
import { SavedEstimationsModal } from '../../components/modals/SavedEstimationsModal';

const STEP_DEFINITIONS = [
  { step: 1, title: 'Basic Info & Plot' },
  { step: 2, title: 'Space Requirements' },
  { step: 3, title: 'Core Materials' },
  { step: 4, title: 'Flooring' },
  { step: 5, title: 'Wall Cladding' },
  { step: 6, title: 'Doors & Joinery' },
  { step: 7, title: 'Windows & Glazing' },
  { step: 8, title: 'Electrical' },
  { step: 9, title: 'Bathroom & CPVC' },
  { step: 10, title: 'Painting & Finishes' },
];

export const PlannerPage: React.FC = () => {
  const { currentStep, nextStep, prevStep, setStep, startNewProject } = useWizardStore();
  const { addToast } = useUIStore();
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showStepJumper, setShowStepJumper] = useState(false);

  const progressPercentage = Math.round((currentStep / 10) * 100);
  const currentStepDef = STEP_DEFINITIONS.find((s) => s.step === currentStep);

  return (
    <motion.div variants={pageFadeVariant} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#F9FAFB] text-slate-900 flex flex-col">
      {/* Top Application Header */}
      {currentStep > 0 && currentStep < 11 && (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left: Brand & Back */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Go Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">Cost Calculator</h1>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">by Rightcon</p>
              </div>
            </div>

            {/* Center: Interactive Step Jumper */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStepJumper(!showStepJumper)}
                className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-full border border-slate-200 transition-colors cursor-pointer"
                title="Click to jump to any step"
              >
                <span>Step {currentStep} of 10</span>
                <span className="hidden sm:inline font-bold text-slate-500">• {currentStepDef?.title}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showStepJumper ? 'rotate-180' : ''}`} />
              </button>

              {/* Step Jumper Dropdown Menu */}
              {showStepJumper && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowStepJumper(false)}
                  />
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 mb-1">
                      Jump to Step
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-0.5 pr-1">
                      {STEP_DEFINITIONS.map((def) => {
                        const isCurrent = def.step === currentStep;
                        const isPast = def.step < currentStep;
                        return (
                          <button
                            key={def.step}
                            type="button"
                            onClick={() => {
                              setStep(def.step);
                              setShowStepJumper(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                              isCurrent
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                                  isCurrent
                                    ? 'bg-blue-600 text-white'
                                    : isPast
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {def.step}
                              </span>
                              <span>{def.title}</span>
                            </span>
                            {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSavedModal(true)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Saved Projects</span>
              </button>

              <button
                type="button"
                onClick={startNewProject}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset estimate to fresh state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Minimal 2px Progress Line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </header>
      )}

      {/* Step 0 Onboarding View */}
      {currentStep === 0 && <Step0Onboarding />}

      {/* Step 11 Report Processing View */}
      {currentStep === 11 && <Step10LoadingExperience />}

      {/* Steps 1 to 10 Application Workspace: Two-Column Desktop Layout */}
      {currentStep > 0 && currentStep < 11 && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28">
          
          {/* Mobile Preview Bar (< lg) */}
          <div className="lg:hidden">
            <LivePreviewPanel />
          </div>

          {/* Two-Column Grid on Desktop (>= lg) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Calculator Form / Current Step (lg:col-span-7 xl:col-span-8) */}
            <div className="lg:col-span-7 xl:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div key={currentStep} variants={pageFadeVariant} initial="initial" animate="animate" exit="exit">
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

            {/* RIGHT COLUMN: Sticky Live Estimate Preview (lg:col-span-5 xl:col-span-4) */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
              <LivePreviewPanel />
            </div>

          </div>
        </main>
      )}

      {/* Sticky Bottom Action Bar */}
      {currentStep > 0 && currentStep < 11 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-soft-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={prevStep}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="cursor-pointer font-bold text-xs rounded-xl"
            >
              {currentStep === 1 ? 'Back to Intro' : 'Back'}
            </Button>

            <div className="flex items-center gap-3">
              {currentStep < 10 ? (
                <Button
                  onClick={nextStep}
                  rightIcon={<ArrowRight className="w-4 h-4 text-white" />}
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20"
                >
                  Continue →
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  rightIcon={<Sparkles className="w-4 h-4 text-emerald-300" />}
                  className="bg-blue-600 hover:bg-blue-700 cursor-pointer font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20"
                >
                  Generate Feasibility Report
                </Button>
              )}
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
