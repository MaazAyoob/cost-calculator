import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUIStore } from '../../../store/useUIStore';
import { useWizardStore } from '../../../store/useWizardStore';
import { Sparkles, Building2, CheckCircle2, Loader2, ArrowRight, Trophy, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const Step10LoadingExperience: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const { city } = useWizardStore();

  const loadingStages = [
    'Calculating Total Built-up Area & Floor Space Index...',
    'Estimating Steel Tonnage & Cement Bag Requirements...',
    'Aggregating Plumbing, Electrical & Conduit Quantities...',
    `Applying ${city} Material Market Rates...`,
    'Finalizing Feasibility & Material Report...',
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
    }, 800);

    return () => clearInterval(interval);
  }, [loadingStages.length]);

  useEffect(() => {
    if (isDone) {
      addToast({
        title: 'Estimate Generation Complete!',
        description: 'Your comprehensive feasibility and BOQ report is ready.',
        type: 'success',
      });
    }
  }, [isDone, addToast]);

  const progressPercent = Math.min(100, Math.round((activeStageIndex / loadingStages.length) * 100));

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 space-y-8 max-w-2xl mx-auto text-center">
      {!isDone ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="w-full space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-soft-xl"
        >
          {/* Animated Logo Container */}
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-soft-xl animate-pulse">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-white rounded-xl shadow-soft-sm">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">COST CALCULATOR BY RIGHTCON</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Executing Architectural & Material Estimations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Processing inputs against {city} market rates and structural engineering specifications...
            </p>
          </div>

          {/* 5 Client Required Stages Checklist */}
          <div className="space-y-3 text-left">
            {loadingStages.map((stageText, idx) => {
              const isCompleted = idx < activeStageIndex;
              const isCurrent = idx === activeStageIndex;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    isCompleted
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                      : isCurrent
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-extrabold shadow-soft-xs'
                      : 'bg-slate-50 border-slate-200/60 text-slate-400 opacity-50'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs text-slate-400 font-bold">
                      {idx + 1}
                    </span>
                  )}
                  <span className="text-xs sm:text-sm">{stageText}</span>
                </div>
              );
            })}
          </div>

          {/* Smooth Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
              <span>Engineering Computation Progress</span>
              <span className="text-blue-600 font-extrabold">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </motion.div>
      ) : (
        /* Completion State */
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-full space-y-8 bg-gradient-to-b from-white to-slate-50 p-8 sm:p-14 rounded-3xl border border-slate-200/80 shadow-soft-2xl"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-soft-xl">
            <Trophy className="w-12 h-12 text-emerald-600" />
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Feasibility Computation Complete
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Congratulations!
            </h2>
            <p className="text-base sm:text-xl font-black text-blue-600">
              Your Construction Estimate is Ready.
            </p>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Your comprehensive itemized BOQ, material matrix, timeline, and disbursement schedule are fully computed.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/dashboard')}
              rightIcon={<ArrowRight className="w-5 h-5 text-white" />}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-soft-xl text-base h-14 px-10 rounded-2xl w-full sm:w-auto cursor-pointer"
            >
              View Dashboard
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/report')}
              className="font-extrabold text-base h-14 px-8 rounded-2xl w-full sm:w-auto cursor-pointer"
            >
              View Full Feasibility Report
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
