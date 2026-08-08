import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Compass, Calculator, RotateCcw, Play } from 'lucide-react';

export const Step0Onboarding: React.FC = () => {
  const { hasStartedSelection, city, startNewProject, setStep } = useWizardStore();

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-10 text-center">
      {/* Top Engineering Tag */}
      <div>
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200/80">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Rightcon Construction Intelligence
        </span>
      </div>

      {/* Main Title & Description */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Configure Your Home. <br />
          <span className="text-blue-600">Estimate Every Detail.</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
          A progressive, single-decision configurator that calculates structural, material, and finishing costs in real time.
        </p>
      </div>

      {/* Primary Action Card */}
      <Card className="p-8 bg-white border border-slate-200/90 shadow-soft-md rounded-3xl space-y-6 text-center">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">COST CALCULATOR BY RIGHTCON</span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Guided Estimator &amp; BOQ Generator</h2>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">BBMP/BDA &amp; MUDA Rules</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Live Material Rates</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Detailed 22-Head BOQ</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={() => {
              startNewProject();
              setStep(1);
            }}
            rightIcon={<ArrowRight className="w-5 h-5 text-white" />}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-md shadow-blue-600/20 text-sm cursor-pointer w-full sm:w-auto"
          >
            Start Configuration →
          </Button>

          {hasStartedSelection && (
            <Button
              size="lg"
              onClick={() => setStep(1)}
              leftIcon={<Play className="w-4 h-4 text-blue-600" />}
              variant="outline"
              className="font-bold px-6 py-3.5 rounded-xl text-xs cursor-pointer w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Resume ({city ?? 'In Progress'})
            </Button>
          )}
        </div>
      </Card>

      {/* Footer Assurance */}
      <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-blue-600" /> Free Feasibility Report
        </span>
        <span>•</span>
        <span>Instant Local Save</span>
        <span>•</span>
        <span>PDF / CSV Export</span>
      </div>
    </div>
  );
};
