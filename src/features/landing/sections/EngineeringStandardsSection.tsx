import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, CheckCircle2, Cpu, Layers, Flame, BookOpen } from 'lucide-react';

export const EngineeringStandardsSection: React.FC = () => {
  const standards = [
    {
      code: 'IS 456 : 2000',
      title: 'Plain and Reinforced Concrete Code',
      description: 'Defines minimum cement content, water-cement ratios, structural cover, and M20/M25 compressive strength standards for columns and slabs.',
    },
    {
      code: 'IS 1786 : 2008',
      title: 'High Strength TMT Steel Standards',
      description: 'Mandates Fe 550D grade steel with high elongation properties for earthquake-resistant structural ductility in South India seismic zone II/III.',
    },
    {
      code: 'IS 2185 : 2005',
      title: 'Concrete & AAC Block Masonry Specs',
      description: 'Standardizes thermal conductivity, compressive strength (4 N/mm2), and dry density for light-weight AAC block walling.',
    },
    {
      code: 'IS 383 : 2016',
      title: 'Coarse & Fine Aggregate Benchmarks',
      description: 'Establishes river sand and manufactured sand (M-Sand / P-Sand) silt limits (<3%) for plastering and concrete mix durability.',
    },
  ];

  return (
    <section id="standards" className="bg-[var(--cc-bg)] py-20 border-b border-[var(--cc-border)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[var(--cc-brand)] text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" /> Engineering & Bureau of Indian Standards
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--cc-text-primary)] tracking-tight">
            Built Strictly on IS 456 Structural Algorithms.
          </h2>
          <p className="text-[var(--cc-text-secondary)] text-base leading-relaxed">
            Cost Calculator is not a rough rule-of-thumb estimator. Every quantity bill is calculated using certified Indian Bureau of Standards code formulas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {standards.map((std, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-7 rounded-2xl bg-[var(--cc-surface)]/60 border border-[var(--cc-border)]/80 hover:border-[var(--cc-border)] transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 text-xs font-extrabold bg-emerald-500/10 text-[var(--cc-brand)] border border-emerald-500/30 rounded-lg">
                  {std.code}
                </span>
                <ShieldCheck className="w-5 h-5 text-[var(--cc-brand)]" />
              </div>
              <h3 className="text-lg font-extrabold text-[var(--cc-text-primary)]">{std.title}</h3>
              <p className="text-xs text-[var(--cc-text-secondary)] leading-relaxed">{std.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

