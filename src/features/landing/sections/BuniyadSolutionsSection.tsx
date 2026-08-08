import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Cpu, FileText, Compass, Sparkles, Sliders, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const BuniyadSolutionsSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: '01',
      title: 'Enter Plot & Basic Info',
      subtitle: 'Input dimensions (10-200 ft), floor count (G to G+4), and parking configuration.',
      detail: 'Cost Calculator calculates total ground coverage, super built-up area, setback rules, and FAR ratios compliant with BBMP / BDA and MUDA bylaws.',
      tag: 'Plot & Geometry',
      icon: <Compass className="w-5 h-5 text-blue-600" />,
      features: ['Automatic FAR & Built-up Area Calculation', 'Setback & Parking Allocation', 'Floor Count & Stilt Constraints'],
    },
    {
      step: '02',
      title: 'Define Space Requirements',
      subtitle: 'Specify room counts (bedrooms, bathrooms, kitchens, balconies) and elevator provision.',
      detail: 'Directly drives downstream engineering quantities for plumbing, wiring, doors, windows, and room flooring.',
      tag: 'Space Layout',
      icon: <Sliders className="w-5 h-5 text-indigo-600" />,
      features: ['1-10 Bedrooms & 1-12 Bathrooms', 'Kitchen & Living Room Allocation', 'Elevator & Balcony Specifications'],
    },
    {
      step: '03',
      title: 'Select Material Brands & Grades',
      subtitle: 'Choose TMT steel, cement, flooring, cladding, doors, windows, electrical, and paint brands.',
      detail: 'Compare Tata Tiscon vs JSW steel, UltraTech vs ACC cement, uPVC vs Wooden windows, and Finolex vs V-Guard wiring with live cost impacts.',
      tag: 'Material Matrix',
      icon: <Cpu className="w-5 h-5 text-emerald-600" />,
      features: ['Tata Tiscon & UltraTech Material Rates', 'Zone-Specific Flooring & Wall Cladding', 'uPVC Window Sub-Grades & Sanitary Tiers'],
    },
    {
      step: '04',
      title: 'Receive Bank-Ready BOQ & Reports',
      subtitle: 'Generate itemized BOQ, milestone payment schedule, and 22-section PDF report in under 3 minutes.',
      detail: 'Download bank-compliant estimates ready for home loan sanctioning (SBI, HDFC, ICICI) and contractor tender comparison.',
      tag: 'Bank BOQ Export',
      icon: <FileText className="w-5 h-5 text-cyan-600" />,
      features: ['10-Stage Milestone Payment Schedule', 'Home Loan Bank Audit Certified Format', 'Instant PDF & CSV Exports'],
    },
  ];

  return (
    <section id="solutions" className="bg-slate-50 py-20 border-b border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> How Cost Calculator Solves It
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            From Plot Dimensions to Bank-Ready BOQ in 4 Simple Steps.
          </h2>
          <p className="text-slate-600 text-base leading-relaxed font-medium">
            Experience our 11-step guided configurator that translates your dream home vision into exact engineering and financial clarity.
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
                    isActive
                      ? 'bg-white border-blue-600 shadow-soft-md ring-2 ring-blue-500/20'
                      : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.step}
                      </span>
                      <h3 className={`text-base font-extrabold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                        {s.title}
                      </h3>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${isActive ? 'text-blue-600 rotate-90' : 'text-slate-400'}`}
                    />
                  </div>
                </div>
              );
            })}

            <div className="pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/calculator')}
                rightIcon={<ArrowRight className="w-5 h-5 text-white" />}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm h-13 shadow-soft-md cursor-pointer"
              >
                Start Free Estimate Now →
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
                className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6 shadow-soft-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                      {steps[activeStep].icon}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                        Step {steps[activeStep].step}
                      </span>
                      <h4 className="text-xl font-extrabold text-white">{steps[activeStep].title}</h4>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full">
                    {steps[activeStep].tag}
                  </span>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                  {steps[activeStep].detail}
                </p>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider block">Key Deliverables</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {steps[activeStep].features.map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center gap-2 text-xs text-slate-200 bg-white/10 p-2.5 rounded-xl border border-white/10 font-semibold"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
