import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#F9FAFB] pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* ── Left: Headline & Actions ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-md">
              Cost Calculator by Rightcon
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Plan Your Home <br className="hidden sm:inline" />
                Before You Build It.
              </h1>
              <p className="text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
                Estimate construction costs, materials, timelines and project requirements before construction begins.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  useWizardStore.getState().startNewProject();
                  navigate('/calculator');
                }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Start Free Estimate <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold px-6 py-3.5 rounded-xl transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
                See How It Works
              </button>
            </div>

            {/* Key Value Directives */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Deterministic IS 456 Formulas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Line-Item BOQ Quantities</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Bank-Ready Reports</span>
              </div>
            </div>
          </motion.div>

          {/* ── Right: ONE Clean Architectural Calculator Preview ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-5"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Project Estimate Preview</h3>
                  <p className="text-xs text-slate-500">30' × 40' Plot • Bengaluru • G+2</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                  Live Calculator
                </span>
              </div>

              {/* Main Metric Focus */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-1">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estimated Construction Cost
                </span>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900">
                  ₹68.4 Lakhs
                </div>
                <p className="text-xs text-slate-500">
                  2,400 sq.ft built-up area • ₹2,850 / sq.ft
                </p>
              </div>

              {/* Quantities Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-slate-500 block mb-0.5">TMT Steel (Tata 550D)</span>
                  <span className="font-bold text-slate-900 text-sm">9.6 Tonnes</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-slate-500 block mb-0.5">Cement (UltraTech)</span>
                  <span className="font-bold text-slate-900 text-sm">1,056 Bags</span>
                </div>
              </div>

              <button
                onClick={() => {
                  useWizardStore.getState().startNewProject();
                  navigate('/calculator');
                }}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Configure Your Plot Dimensions →
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
