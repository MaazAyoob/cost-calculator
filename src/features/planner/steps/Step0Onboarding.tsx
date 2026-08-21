import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { ArrowRight, ShieldCheck, Zap, Compass, Calculator, Play } from 'lucide-react';
import { HuttyLogo } from '../../../components/common/HuttyLogo';

export const Step0Onboarding: React.FC = () => {
  const { hasStartedSelection, city, startNewProject, setStep } = useWizardStore();

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-10 text-center select-none">
      {/* Top Engineering Tag */}
      <div>
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-[rgba(27,61,52,0.08)] text-[#1B3D34] border border-[#1B3D34]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28]" />
          Hutty
        </span>
      </div>

      {/* Main Title & Description */}
      <div className="space-y-3">
        <h1 className="heading-xl text-3xl sm:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-tight">
          Build your home <br />
          with clarity.
        </h1>
        <p className="text-sm sm:text-base text-[#4B5563] font-medium max-w-lg mx-auto leading-relaxed">
          A progressive planning configurator that calculates structural quantities, brand choices, and physical costs in real time.
        </p>
      </div>

      {/* Primary Action Card */}
      <div className="p-8 bg-white border border-[#E5E7EB] shadow-xs rounded-2xl space-y-6 text-center">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563]">HUTTY PLANNING PLATFORM</span>
          <h2 className="text-lg sm:text-xl font-bold text-[#1B3D34] font-heading">Interactive Estimator &amp; BOQ Generator</h2>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-3.5 rounded-xl bg-[#F8F8F6] border border-[#E5E7EB] flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#1B3D34] shrink-0" />
            <span className="text-xs font-bold text-[#1B3D34]">BBMP/BDA &amp; MUDA</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8F8F6] border border-[#E5E7EB] flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-[#1B3D34] shrink-0" />
            <span className="text-xs font-bold text-[#1B3D34]">Live Material Rates</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8F8F6] border border-[#E5E7EB] flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-[#1B3D34] shrink-0" />
            <span className="text-xs font-bold text-[#1B3D34]">13-Stage BOQ</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              startNewProject();
              setStep(1);
            }}
            className="hutty-btn-primary px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold w-full sm:w-auto cursor-pointer"
          >
            <span>Start Configuration</span>
            <ArrowRight className="w-4 h-4 text-[#F28C28]" />
          </button>

          {hasStartedSelection && (
            <button
              onClick={() => setStep(1)}
              className="hutty-btn-secondary px-6 py-3.5 rounded-xl text-xs font-bold w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-[#1B3D34]" />
              <span>Resume ({city ?? 'In Progress'})</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Assurance */}
      <div className="flex items-center justify-center gap-4 text-xs font-medium text-[#4B5563]">
        <span className="flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-[#1B3D34]" /> Free Construction Dossier
        </span>
        <span>•</span>
        <span>Instant Local Save</span>
        <span>•</span>
        <span>PDF / Bank-Ready Export</span>
      </div>
    </div>
  );
};
