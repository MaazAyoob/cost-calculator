import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Cpu, Sliders, Compass, FileText, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const CalculatorSolutionsSection: React.FC = () => {
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
      icon: <Sliders className="w-5 h-5 text-blue-600" />,
      features: ['1-10 Bedrooms & 1-12 Bathrooms', 'Kitchen & Living Room Allocation', 'Elevator & Balcony Specifications'],
    },
    {
      step: '03',
      title: 'Select Material Brands & Grades',
      subtitle: 'Choose TMT steel, cement, flooring, cladding, doors, windows, electrical, and paint brands.',
      detail: 'Compare Tata Tiscon vs JSW steel, UltraTech vs ACC cement, uPVC vs Wooden windows, and Finolex vs V-Guard wiring with live cost impacts.',
      tag: 'Material Matrix',
      icon: <Cpu className="w-5 h-5 text-blue-600" />,
      features: ['Tata Tiscon & UltraTech Material Rates', 'Zone-Specific Flooring & Wall Cladding', 'uPVC Window Sub-Grades & Sanitary Tiers'],
    },
    {
      step: '04',
      title: 'Get Estimate & Comprehensive Reports',
      subtitle: 'Instantly view line-item BOQ, budget breakdown, construction schedule, and bank-ready report.',
      detail: 'Export professional bank loan friendly estimates, 13-stage BOQ line items, material consumption tables, and payment milestone schedules.',
      tag: 'BOQ & Reports',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      features: ['13-Stage Detailed BOQ Matrix', 'Bank Loan Compliant Summary', 'Material Consumption Schedule'],
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How Cost Calculator Works
          </h2>
          <p className="text-base text-slate-600 leading-relaxed font-normal">
            Four simple steps to transform your plot dimensions into an accurate, engineering-grade construction budget.
          </p>
        </div>

        {/* Step Selector & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Step Navigation Tabs */}
          <div className="lg:col-span-5 space-y-3">
            {steps.map((item, index) => {
              const isActive = activeStep === index;
              return (
                <div
                  key={item.step}
                  onClick={() => setActiveStep(index)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-white border-blue-600 shadow-soft-md ring-2 ring-blue-500/10'
                      : 'bg-white/60 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.step}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900">{item.title}</h3>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-blue-600 translate-x-1' : 'text-slate-400'
                    }`} />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Step Details Visual */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-md space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                      {steps[activeStep].icon}
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 block">
                        Step {steps[activeStep].step} — {steps[activeStep].tag}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {steps[activeStep].title}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {steps[activeStep].detail}
                </p>

                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                    Key Engineering Capabilities
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {steps[activeStep].features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={() => navigate('/calculator')}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-5 py-2.5 inline-flex items-center gap-2 cursor-pointer"
                  >
                    Start Free Estimate <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
