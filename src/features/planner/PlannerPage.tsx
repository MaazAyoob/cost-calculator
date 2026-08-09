import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { useWizardStore } from '../../store/useWizardStore';
import { useUIStore } from '../../store/useUIStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
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

import { ArrowLeft, ArrowRight, Save, Sparkles, Check, ChevronLeft, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';

import { SavedEstimationsModal } from '../../components/modals/SavedEstimationsModal';
import { useState } from 'react';

export const PlannerPage: React.FC = () => {
  const { currentStep, totalSteps, nextStep, prevStep, setStep, startNewProject } = useWizardStore();
  const { addToast } = useUIStore();
  const [showSavedModal, setShowSavedModal] = useState(false);

  const handleSaveProgress = () => {
    addToast({
      title: 'Progress Saved',
      description: 'Your project parameters have been saved to local workspace.',
      type: 'info',
    });
  };

  const progressPercentage = Math.round((currentStep / 10) * 100);

  return (
    <motion.div variants={pageFadeVariant} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#F9FAFB] text-slate-900 flex flex-col">
      {/* Top Application Header */}
      {currentStep > 0 && currentStep < 11 && (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Left: Brand */}
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

            {/* Center: Step Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Step {currentStep} of 11
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSavedModal(true)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Projects</span>
              </button>

              <button
                type="button"
                onClick={startNewProject}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset estimate to fresh state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
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

      {/* Steps 1 to 10 Application Workspace */}
      {currentStep > 0 && currentStep < 11 && (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-4 pb-28">
          {/* Live Estimate Floating Summary */}
          <LivePreviewPanel />

          {/* Main Step Content Container */}
          <div className="max-w-[760px] mx-auto mt-6">
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
        </main>
      )}

      {/* Sticky Bottom Action Bar */}
      {currentStep > 0 && currentStep < 11 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-soft-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
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
