import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Layers, Cpu, FileText, Compass, Sparkles, Building2, Sliders, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const BuniyadSolutionsSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: '01',
      title: 'Enter Plot & Floor Details',
      subtitle: 'Input dimensions (e.g. 30x40, 40x60), setback rules, and target floor plan (G+1, G+2, G+3).',
      detail: 'Cost Calculator calculates total ground coverage, super built-up area, balcony extensions, and FAR ratios compliant with BBMP / BDA and Karnataka regional bylaws.',
      tag: 'Plot & Geometry',
      icon: <Compass className="w-5 h-5 text-[var(--cc-brand)]" />,
      features: ['Automatic FAR & Built-up Area Calculation', 'Setback & Parking Area Allocation', 'Multi-Floor Structural Layouts'],
    },
    {
      step: '02',
      title: 'Choose Material Specifications',
      subtitle: 'Select quality grade (Essential, Premium, Luxury) and brand matrix for cement, steel, and fittings.',
      detail: 'Compare UltraTech vs ACC cement, Tata Tiscon 550D vs JSW steel, Kohler vs Jaquar sanitaryware, and Asian Paints Royale with live cost impacts.',
      tag: 'Material Matrix',
      icon: <Sliders className="w-5 h-5 text-indigo-400" />,
      features: ['UltraTech, ACC & Dalmia Cement Pricing', 'Tata Tiscon 550D TMT Steel Quantities', 'Kohler, Grohe & Jaquar Fixture Tiers'],
    },
    {
      step: '03',
      title: 'IS 456 Engineering Computation',
      subtitle: 'Our engine applies Indian Standard structural formulas across 13 construction stages.',
      detail: 'Computes exact bags of cement, metric tons of steel, cubic feet of coarse aggregate, m2 plastering, and AAC block counts for earthwork to handover.',
      tag: 'IS Code Engine',
      icon: <Cpu className="w-5 h-5 text-[var(--cc-brand)]" />,
      features: ['13 Stage Structural BOQ Itemization', 'IS 456 M20/M25 RMC Concrete Ratios', 'Plastering, Tiling & MEP Stage Work'],
    },
    {
      step: '04',
      title: 'Receive Bank-Ready Reports',
      subtitle: 'Generate itemized BOQ, milestone payment schedule, and PDF export in under 3 minutes.',
      detail: 'Download bank-compliant estimates ready for home loan sanctioning (SBI, HDFC, ICICI) and contractor tender comparison.',
      tag: 'Bank BOQ Export',
      icon: <FileText className="w-5 h-5 text-cyan-400" />,
      features: ['6-Milestone Payment Schedule', 'Home Loan Bank Audit Certified Format', 'Instant PDF & Excel Data Exports'],
    },
  ];

  return (
    <section id="solutions" className="bg-[var(--cc-bg)] py-20 border-b border-[var(--cc-border)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--cc-brand)]/10 border border-[var(--cc-brand)]/30 text-[var(--cc-brand)] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> How Cost Calculator Solves It
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--cc-text-primary)] tracking-tight">
            From Plot Dimensions to Bank-Ready BOQ in 4 Steps.
          </h2>
          <p className="text-[var(--cc-text-secondary)] text-base leading-relaxed">
            Experience our 10-step guided configurator that translates your dream home vision into exact engineering and financial clarity.
          </p>
        </div>

        {/* Interactive Step Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Navigation Steps */}
          <div className="lg:col-span-5 space-y-3">
            {steps.map((s, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isActive ? 'bg-[var(--cc-surface)] border-teal-500/80 shadow-lg shadow-teal-900/5'
                      : 'bg-[var(--cc-bg)]/60 border-[var(--cc-border)]/80 hover:bg-[var(--cc-surface)]/60 hover:border-[var(--cc-border)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                        isActive ? 'bg-[var(--cc-brand)] text-white' : 'bg-[var(--cc-surface-muted)] text-[var(--cc-text-secondary)]'
                      }`}>
                        {s.step}
                      </span>
                      <h3 className={`text-base font-bold ${isActive ? 'text-[var(--cc-text-primary)]' : 'text-[var(--cc-text-secondary)]'}`}>
                        {s.title}
                      </h3>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-[var(--cc-brand)] rotate-90' : 'text-slate-600'}`} />
                  </div>
                </div>
              );
            })}

            <div className="pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/calculator')}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="w-full bg-[var(--cc-brand)] hover:bg-[var(--cc-brand)] text-white font-bold text-sm h-13 shadow-lg shadow-teal-900/10"
              >
                Start Free Estimate Now
              </Button>
            </div>
          </div>

          {/* Right Active Step Display Card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-[var(--cc-border)] space-y-6 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-[var(--cc-border)] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[var(--cc-bg)] border border-[var(--cc-border)]">
                      {steps[activeStep].icon}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--cc-text-secondary)] uppercase tracking-widest block">Step {steps[activeStep].step}</span>
                      <h4 className="text-xl font-extrabold text-[var(--cc-text-primary)]">{steps[activeStep].title}</h4>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold bg-[var(--cc-brand)]/10 text-[var(--cc-brand)] border border-[var(--cc-brand)]/30 rounded-full">
                    {steps[activeStep].tag}
                  </span>
                </div>

                <p className="text-[var(--cc-text-secondary)] text-sm leading-relaxed">
                  {steps[activeStep].detail}
                </p>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-extrabold text-[var(--cc-text-primary)] uppercase tracking-wider block">Key Deliverables</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {steps[activeStep].features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-[var(--cc-text-secondary)] bg-[var(--cc-surface)]/80 p-2.5 rounded-xl border border-[var(--cc-border)]">
                        <CheckCircle2 className="w-4 h-4 text-[var(--cc-brand)] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
};

