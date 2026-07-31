import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, XCircle, TrendingDown, DollarSign, Clock, AlertTriangle, Lightbulb } from 'lucide-react';

export const WhyPlanningSection: React.FC = () => {
  return (
    <section id="why-planning" className="bg-[var(--cc-bg)] py-20 border-b border-[var(--cc-border)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Lightbulb className="w-3.5 h-3.5" /> Homeowner Empowerment
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--cc-text-primary)] tracking-tight">
            Why Build Without Planning is a Risk You Shouldn't Take.
          </h2>
          <p className="text-[var(--cc-text-secondary)] text-base leading-relaxed">
            In India, 78% of home construction projects suffer from 20% to 45% budget overruns due to inaccurate initial estimates, hidden contractor markups, and uncalculated material waste.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Unplanned Construction (The Risk) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-6 relative overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-rose-200/60 dark:border-rose-900/30 pb-4">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-rose-950 dark:text-rose-200">Traditional Unplanned Building</h3>
                <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">Relying solely on informal contractor lump-sum quotes</p>
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-750 dark:text-[var(--cc-text-secondary)]">
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-rose-900 dark:text-rose-200">Surprise Cost Overruns:</strong> Lump-sum rates jump by ₹400-₹700/sq.ft halfway through the build when structural extras arise.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-rose-900 dark:text-rose-200">Unverified Material Tiers:</strong> Contractors swap premium steel & cement grades for non-certified regional brands without notice.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-rose-900 dark:text-rose-200">Loan Approval Friction:</strong> Banks reject informal handwritten contractor estimates during home loan disbursement audits.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-rose-900 dark:text-rose-200">Undefined Milestones:</strong> Paying large upfront advances without stage-wise physical verification checkpoints.</span>
              </li>
            </ul>
          </motion.div>

          {/* Cost Calculator-Planned Building (The Solution) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/40 space-y-6 relative overflow-hidden shadow-xl"
          >
            <div className="flex items-center gap-3 border-b border-teal-200/60 dark:border-teal-900/30 pb-4">
              <div className="p-3 rounded-2xl bg-teal-100/80 dark:bg-[var(--cc-brand)]/20 text-[var(--cc-brand)] border border-teal-200/50 dark:border-[var(--cc-brand)]/30">
                <ShieldAlert className="w-6 h-6 text-[var(--cc-brand)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-teal-950 dark:text-[var(--cc-text-primary)]">Cost Calculator Engineered Planning</h3>
                <p className="text-xs text-teal-700 dark:text-[var(--cc-brand)] font-bold">IS 456 compliant pre-construction calculation matrix</p>
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-750 dark:text-[var(--cc-text-primary)]">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--cc-brand)] shrink-0 mt-0.5" />
                <span><strong className="text-teal-900 dark:text-[var(--cc-text-primary)]">100% Itemized BOQ:</strong> Know exact bags of UltraTech cement, tons of Tata steel, and AAC block units needed for all 13 stages.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--cc-brand)] shrink-0 mt-0.5" />
                <span><strong className="text-teal-900 dark:text-[var(--cc-text-primary)]">Material Brand Transparency:</strong> Compare Standard, Premium, and Luxury brand matrices (Kohler, Asian Paints, Grohe) in real time.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--cc-brand)] shrink-0 mt-0.5" />
                <span><strong className="text-teal-900 dark:text-[var(--cc-text-primary)]">Bank-Ready BOQ Reports:</strong> Instant downloadable PDF reports compliant with SBI, HDFC, and ICICI home loan disbursement standards.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--cc-brand)] shrink-0 mt-0.5" />
                <span><strong className="text-teal-900 dark:text-[var(--cc-text-primary)]">Stage-Linked Payment Schedule:</strong> 6-milestone payment roadmap tying payments strictly to verified construction completion.</span>
              </li>
            </ul>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
