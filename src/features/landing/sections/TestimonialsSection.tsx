import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Play, ShieldCheck, UserCheck } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Rajesh Sharma',
      role: 'Homeowner • Whitefield, Bangalore',
      project: '30 Ã— 40 G+2 Duplex Villa',
      saved: 'Saved ₹6.4 Lakhs',
      rating: 5,
      text: 'Cost Calculator saved us over ₹6.4 Lakhs in uncalculated contractor extras. The 13-stage BOQ was accepted by SBI for our home loan disbursement without a single query.',
      initials: 'RS',
    },
    {
      name: 'Archana & Vikram Rao',
      role: 'Homeowners • Indiranagar, Bangalore',
      project: '40 Ã— 60 G+3 Residence',
      saved: 'Zero Budget Overrun',
      rating: 5,
      text: 'Comparing UltraTech vs ACC cement and Kohler vs Jaquar fittings inside the calculator before breaking ground gave us 100% material clarity.',
      initials: 'VR',
    },
    {
      name: 'Er. Suresh Hegde',
      role: 'Chief Structural Consultant • Bengaluru',
      project: '120+ Home Audits',
      saved: 'IS 456 Certified',
      rating: 5,
      text: 'As a structural consultant, I recommend Cost Calculator to all residential clients. Its IS 456 cement-to-steel algorithms match actual site consumption with 98.4% precision.',
      initials: 'SH',
    },
  ];

  return (
    <section className="bg-[var(--cc-bg)] py-20 border-b border-[var(--cc-border)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5" /> Homeowner Stories
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--cc-text-primary)] tracking-tight">
            Trusted by Homeowners Across Karnataka.
          </h2>
          <p className="text-[var(--cc-text-secondary)] text-base leading-relaxed">
            Read how Cost Calculator gave home builders complete financial clarity and bank approval confidence.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-[var(--cc-surface)]/50 border border-[var(--cc-border)]/80 hover:border-[var(--cc-border)] transition-all flex flex-col justify-between space-y-6 text-left"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-black bg-emerald-500/10 text-[var(--cc-brand)] border border-emerald-500/30 rounded-full">
                    {t.saved}
                  </span>
                </div>

                <p className="text-[var(--cc-text-secondary)] text-xs sm:text-sm leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--cc-border)]/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--cc-brand)]/20 text-[var(--cc-brand)] border border-[var(--cc-brand)]/30 flex items-center justify-center font-extrabold text-sm">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--cc-text-primary)]">{t.name}</div>
                  <div className="text-[11px] text-[var(--cc-text-secondary)]">{t.role}</div>
                  <div className="text-[10px] text-[var(--cc-brand)] font-semibold">{t.project}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

