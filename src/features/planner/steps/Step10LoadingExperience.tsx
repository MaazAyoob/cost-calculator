import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUIStore } from '../../../store/useUIStore';
import { useWizardStore } from '../../../store/useWizardStore';
import { Check, Loader2, ArrowRight, ShieldCheck, FileCheck2, AlertCircle, RefreshCw } from 'lucide-react';
import { HuttyLogo } from '../../../components/common/HuttyLogo';
import type { AutoSaveStatus } from '../../../hooks/useProjectAutoSave';

interface Step10LoadingExperienceProps {
  autoSaveStatus?: AutoSaveStatus;
  errorMessage?: string | null;
  onRetryAutoSave?: () => void;
}

export const Step10LoadingExperience: React.FC<Step10LoadingExperienceProps> = ({
  autoSaveStatus = 'SAVED',
  errorMessage,
  onRetryAutoSave,
}) => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const { city } = useWizardStore();

  const loadingStages = [
    'Calculating Total Built-up Area & Floor Space Index...',
    'Estimating Steel Tonnage & Cement Bag Requirements...',
    'Aggregating Plumbing, Electrical & Conduit Quantities...',
    `Applying ${city || 'Bangalore'} Material Market Rates...`,
    'Finalizing Construction Dossier & BOQ...',
  ];

  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const isDone = activeStageIndex >= loadingStages.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStageIndex((prev) => {
        if (prev >= loadingStages.length) {
          clearInterval(interval);
          return loadingStages.length;
        }
        return prev + 1;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [loadingStages.length]);

  useEffect(() => {
    if (isDone) {
      addToast({
        title: 'Estimate Generation Complete!',
        description: 'Your comprehensive construction dossier and BOQ is ready.',
        type: 'success',
      });
    }
  }, [isDone, addToast]);

  const progressPercent = Math.min(100, Math.round((activeStageIndex / loadingStages.length) * 100));

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 space-y-8 max-w-2xl mx-auto text-center select-none">
      {!isDone ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="w-full space-y-8 bg-white p-8 sm:p-12 rounded-2xl border border-[#E5E7EB] shadow-xs text-left"
        >
          <div className="text-center space-y-3">
            <HuttyLogo variant="compact" width={130} />
            <h2 className="heading-sm text-2xl font-extrabold text-[#1B3D34] tracking-tight">
              Calculating Your Estimate
            </h2>
            <p className="text-xs sm:text-sm text-[#4B5563]">
              Calculating materials needed and current rates for {city || 'Bangalore'}...
            </p>
          </div>

          {/* Stages Checklist */}
          <div className="space-y-2.5">
            {loadingStages.map((stageText, idx) => {
              const isCompleted = idx < activeStageIndex;
              const isCurrent = idx === activeStageIndex;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-xs font-semibold ${
                    isCompleted
                      ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] text-[#1B3D34]'
                      : isCurrent
                      ? 'bg-[#F8F8F6] border-[#1B3D34] text-[#1B3D34] font-bold'
                      : 'bg-white border-[#E5E7EB] text-[#4B5563] opacity-50'
                  }`}
                >
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-[#1B3D34] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-[#F28C28] animate-spin shrink-0" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[10px] text-[#4B5563] font-mono">
                      {idx + 1}
                    </span>
                  )}
                  <span>{stageText}</span>
                </div>
              );
            })}
          </div>

          {/* Smooth Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#1B3D34]">
              <span>Computation Progress</span>
              <span className="font-mono text-[#F28C28]">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#F8F8F6] rounded-full overflow-hidden border border-[#E5E7EB]">
              <div
                className="h-full bg-[#1B3D34] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </motion.div>
      ) : (
        /* Completion State */
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full space-y-8 bg-white p-8 sm:p-12 rounded-2xl border border-[#E5E7EB] shadow-xs text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[rgba(27,61,52,0.08)] text-[#1B3D34] border border-[#1B3D34]/20 flex items-center justify-center mx-auto">
            <FileCheck2 className="w-8 h-8 text-[#1B3D34]" />
          </div>

          <div className="space-y-3">
            {autoSaveStatus === 'ERROR' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> COMPUTATION COMPLETE · CLOUD SAVE PENDING
              </span>
            ) : autoSaveStatus === 'SAVING' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" /> COMPUTATION COMPLETE · SAVING TO CLOUD...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[rgba(27,61,52,0.08)] text-[#1B3D34] border border-[#1B3D34]/20 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1B3D34]" /> COMPUTATION COMPLETE · SAVED TO CLOUD
              </span>
            )}

            <h2 className="heading-xl text-3xl font-extrabold text-[#1B3D34] tracking-tight">
              {autoSaveStatus === 'ERROR' ? 'Estimate Ready (Cloud Save Pending)' : 'Your Estimate is Ready.'}
            </h2>
            <p className="text-xs sm:text-sm text-[#4B5563] max-w-md mx-auto leading-relaxed">
              {autoSaveStatus === 'ERROR'
                ? (errorMessage && (errorMessage.includes('expired') || errorMessage.includes('sign in'))
                    ? 'Your session has expired. Please sign in to sync this estimate to your account, or click Retry.'
                    : `Your local construction estimate is calculated. Cloud sync note: ${errorMessage || 'Saving encountered an issue — click Retry below to save your project.'}`)
                : 'Your itemized cost list, materials needed, and payment plan are ready and safely stored.'}
            </p>

            {autoSaveStatus === 'ERROR' && onRetryAutoSave && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onRetryAutoSave}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Saving Project</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => {
                useWizardStore.getState().setStep(0);
                navigate('/report');
              }}
              className="hutty-btn-primary px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm cursor-pointer"
            >
              <span>View Construction Report</span>
              <ArrowRight className="w-4 h-4 text-[#F28C28]" />
            </button>
            <button
              onClick={() => {
                useWizardStore.getState().setStep(0);
                navigate('/dashboard');
              }}
              className="hutty-btn-secondary px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm cursor-pointer"
            >
              <span>Project Summary</span>
            </button>
            <button
              onClick={() => {
                useWizardStore.getState().startNewProject();
                navigate('/calculator');
              }}
              className="px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-[#1B3D34] hover:bg-[rgba(27,61,52,0.06)] border border-[#E5E7EB] bg-white cursor-pointer transition-colors"
            >
              <span>Start New Project</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
