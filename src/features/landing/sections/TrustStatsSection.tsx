import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Layers, TrendingUp, Award, BadgeCheck } from 'lucide-react';

export const TrustStatsSection: React.FC = () => {
  const stats = [
    {
      value: '100%',
      label: 'IS 456 Structural Compliance',
      description: 'Indian Standard codes for reinforced concrete & structural design',
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      badge: 'Certified',
    },
    {
      value: '13',
      label: 'Stage BOQ Breakdown',
      description: 'From foundation excavation to final painting & sanitisation',
      icon: <Layers className="w-6 h-6 text-blue-600" />,
      badge: 'IS Code',
    },
    {
      value: '200+',
      label: 'Quality Checkpoints',
      description: 'Material specifications, mix ratios, and structural tolerances',
      icon: <BadgeCheck className="w-6 h-6 text-blue-600" />,
      badge: 'Audit Grade',
    },
    {
      value: '10,000+',
      label: 'Karnataka Price Index',
      description: 'Live price benchmarks for Bangalore and Mysore regional markets',
      icon: <TrendingUp className="w-6 h-6 text-amber-500" />,
      badge: 'Live Index',
    },
  ];

  return (
    <section className="bg-[var(--cc-bg)] py-16 border-b border-[var(--cc-border)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" /> Trusted Construction Intelligence Platform
          </span>
          <h2 className="heading-lg tracking-tight text-[var(--cc-text-primary)]">
            Engineered for Precision & Financial Transparency
          </h2>
          <p className="text-[var(--cc-text-secondary)] text-sm sm:text-base leading-relaxed font-medium">
            Cost Calculator is built on Indian Standard IS 456 engineering algorithms to eliminate budget overruns and provide bank-ready cost reports.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-6 rounded-2xl bg-[var(--cc-surface)] border border-[var(--cc-border)] shadow-soft-xs hover:shadow-soft-md transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-[var(--cc-border)] group-hover:scale-105 transition-transform">
                  {stat.icon}
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-[var(--cc-text-secondary)] border border-[var(--cc-border)] rounded-full">
                  {stat.badge}
                </span>
              </div>
              <div className="text-3xl font-black text-[var(--cc-text-primary)] tracking-tight mb-1 group-hover:text-blue-600 transition-colors">
                {stat.value}
              </div>
              <div className="text-xs font-extrabold text-[var(--cc-text-primary)] mb-1.5">{stat.label}</div>
              <p className="text-[11px] text-[var(--cc-text-secondary)] leading-relaxed">{stat.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
