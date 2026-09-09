import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp, Flame, PieChart, ShieldX } from 'lucide-react';

export const CostProblemsSection: React.FC = () => {
  const problems = [
    {
      icon: <Flame className="w-6 h-6 text-rose-400" />,
      title: 'Material Price Inflation Traps',
      description: 'Cement, TMT steel, and sand prices fluctuate by 15-25% annually in Karnataka. Without exact unit quantity bills, homebuilders overpay contractors during market spikes.',
      tag: 'Financial Loss',
    },
    {
      icon: <PieChart className="w-6 h-6 text-amber-400" />,
      title: 'Omitted Stage Items',
      description: 'Lump-sum contractor quotes routinely exclude waterproofing, soil excavation depth adjustments, sump tank RMC concrete, and electrical earthings "” triggering costly mid-build change orders.',
      tag: 'Scope Creep',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-400" />,
      title: 'Built-up Area & FAR Discrepancies',
      description: 'Miscalculating balcony projections, staircase headrooms, and car park slabs leads to structural redesigns or municipal sanction penalty fees during BBMP/BDA inspections.',
      tag: 'Sanction Risk',
    },
    {
      icon: <ShieldX className="w-6 h-6 text-red-400" />,
      title: 'Disbursement Deadlocks',
      description: 'Home loan banks require detailed engineer-certified BOQs. Generic contractor notes delay bank stage releases, causing worker site halts and interest penalties.',
      tag: 'Cashflow Halt',
    },
  ];

  return (
    <section className="bg-[var(--cc-bg)] py-20 border-b border-[var(--cc-border)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" /> Construction Cost Pitfalls
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--cc-text-primary)] tracking-tight">
            The 4 Cost Pitfalls That Ruin Homebuilding Budgets
          </h2>
          <p className="text-[var(--cc-text-secondary)] text-sm sm:text-base leading-relaxed">
            Understanding where traditional home construction fails financially is the first step toward building with total confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((prob, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-7 rounded-2xl bg-[var(--cc-surface)]/40 border border-[var(--cc-border)]/80 hover:border-[var(--cc-border)] transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-[var(--cc-bg)] border border-[var(--cc-border)]">
                  {prob.icon}
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full">
                  {prob.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--cc-text-primary)]">{prob.title}</h3>
              <p className="text-xs text-[var(--cc-text-secondary)] leading-relaxed">{prob.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

