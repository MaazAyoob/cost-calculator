import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { useWizardStore } from '../../store/useWizardStore';
import { useUIStore } from '../../store/useUIStore';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressIndicator } from '../../components/common/ProgressIndicator';
import { LivePreviewPanel } from './LivePreviewPanel';

import { Step1Location } from './steps/Step1Location';
import { Step2Authority } from './steps/Step2Authority';
import { Step3PlotDetails } from './steps/Step3PlotDetails';
import { Step4HouseConfig } from './steps/Step4HouseConfig';
import { Step5ParkingTech } from './steps/Step5ParkingTech';
import { Step6RoomPlanning } from './steps/Step6RoomPlanning';
import { Step7QualityTier } from './steps/Step7QualityTier';
import { Step8MaterialSelection } from './steps/Step8MaterialSelection';
import { Step9Review } from './steps/Step9Review';
import { Step10LoadingExperience } from './steps/Step10LoadingExperience';

import { ArrowLeft, ArrowRight, Save, Sparkles, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PlannerPage: React.FC = () => {
  const { currentStep, totalSteps, nextStep, prevStep, setStep } = useWizardStore();
  const { addToast } = useUIStore();

  const stepTitles = [
    'Location',
    'Sanction',
    'Plot Size',
    'House Config',
    'Parking & Tech',
    'Room Planning',
    'Quality Grade',
    'Materials',
    'Review',
    'Generating BOQ',
  ];

  const handleSaveProgress = () => {
    addToast({
      title: 'Progress Saved',
      description: 'Your home planning configuration parameters have been saved to local workspace.',
      type: 'info',
    });
  };

  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <motion.div variants={pageFadeVariant} initial="initial" animate="animate" exit="exit" className="space-y-6 pb-12">
      {/* Page Header */}
      {currentStep < 10 && (
        <PageHeader
          title="Home Planning Configurator"
          subtitle="Configure location, plot dimensions, floor plans, and material tiers in real time."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Planning Configurator' }]}
        />
      )}

      {/* Sticky Progress Bar */}
      {currentStep < 10 && (
        <Card className="p-4 bg-white border border-slate-200/80 sticky top-16 z-20 shadow-soft-xs">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Step {currentStep} of {totalSteps - 1}: {stepTitles[currentStep - 1]}</span>
              <span className="text-blue-600 font-extrabold">{progressPercentage}% Configured</span>
            </div>
            <ProgressIndicator value={progressPercentage} size="md" color="bg-blue-600" />

            {/* Step Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-1">
              {stepTitles.slice(0, 9).map((title, idx) => {
                const stepNum = idx + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;

                return (
                  <button
                    key={idx}
                    onClick={() => setStep(stepNum)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer',
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-soft-xs'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    )}
                  >
                    {isCompleted ? <Check className="w-3 h-3 text-emerald-600" /> : <span>{stepNum}.</span>}
                    <span>{title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Main 2-Column Split Workspace (Step 1-9) or Loading View (Step 10) */}
      {currentStep === 10 ? (
        <Step10LoadingExperience />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Interactive Wizard Steps */}
          <div className="flex-1 w-full min-w-0">
            <Card className="p-6 sm:p-8 bg-white border border-slate-200/80 shadow-soft-sm">
              <AnimatePresence mode="wait">
                <motion.div key={currentStep} variants={pageFadeVariant} initial="initial" animate="animate" exit="exit">
                  {currentStep === 1 && <Step1Location />}
                  {currentStep === 2 && <Step2Authority />}
                  {currentStep === 3 && <Step3PlotDetails />}
                  {currentStep === 4 && <Step4HouseConfig />}
                  {currentStep === 5 && <Step5ParkingTech />}
                  {currentStep === 6 && <Step6RoomPlanning />}
                  {currentStep === 7 && <Step7QualityTier />}
                  {currentStep === 8 && <Step8MaterialSelection />}
                  {currentStep === 9 && <Step9Review />}
                </motion.div>
              </AnimatePresence>

              {/* Bottom Navigation */}
              <div className="flex justify-between items-center pt-8 mt-8 border-t border-slate-100">
                <Button
                  variant="outline"
                  disabled={currentStep === 1}
                  onClick={prevStep}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleSaveProgress}
                    leftIcon={<Save className="w-4 h-4 text-slate-500" />}
                  >
                    Save Progress
                  </Button>

                  {currentStep < 9 ? (
                    <Button onClick={nextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      onClick={nextStep}
                      rightIcon={<Sparkles className="w-4 h-4 text-emerald-300" />}
                      className="bg-blue-600"
                    >
                      Generate Dashboard BOQ
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Live Preview Panel */}
          <LivePreviewPanel />
        </div>
      )}
    </motion.div>
  );
};
