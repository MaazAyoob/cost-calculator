import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUIStore } from '../../../store/useUIStore';
import { useWizardStore } from '../../../store/useWizardStore';
import { Check, Loader2, ArrowRight, ShieldCheck, FileCheck2 } from 'lucide-react';
import { HuttyLogo } from '../../../components/common/HuttyLogo';

export const Step10LoadingExperience: React.FC = () => {
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
              Executing Engineering Takeoff
            </h2>
            <p className="text-xs sm:text-sm text-[#4B5563]">
              Computing physical quantities and market rates for {city || 'Bangalore'}...
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

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[rgba(27,61,52,0.08)] text-[#1B3D34] border border-[#1B3D34]/20 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1B3D34]" /> COMPUTATION COMPLETE
            </span>
            <h2 className="heading-xl text-3xl font-extrabold text-[#1B3D34] tracking-tight">
              Your Estimate is Ready.
            </h2>
            <p className="text-xs sm:text-sm text-[#4B5563] max-w-md mx-auto leading-relaxed">
              Your itemized Bill of Quantities, physical material takeoffs, and payment schedule are fully compiled.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/report')}
              className="hutty-btn-primary px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm cursor-pointer"
            >
              <span>View Construction Report</span>
              <ArrowRight className="w-4 h-4 text-[#F28C28]" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="hutty-btn-secondary px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm cursor-pointer"
            >
              <span>Project Summary</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
