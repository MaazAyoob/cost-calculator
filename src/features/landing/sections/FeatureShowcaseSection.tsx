import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Layers, FileSpreadsheet, Calendar, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, Building2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const FeatureShowcaseSection: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'configurator',
      title: 'Visual Plot & Floor Plan Configurator',
      subtitle: 'Tesla-style guided configurator tailored for Indian plot geometries.',
      description: 'Input plot dimensions (e.g. 30x40, 40x60, 50x80), choose floor counts (G+1 to G+4), setback ratios, parking bays, and room specifications. Every input dynamically updates your built-up area and structural volume.',
      bullets: [
        'BBMP / BDA & Karnataka regional setback compliance',
        'Automatic super built-up vs carpet area calculation',
        'Multi-floor configuration with G+1 to G+4 support',
      ],
      icon: <Compass className="w-6 h-6 text-[var(--cc-brand)]" />,
      tag: 'Plot & Geometry',
      align: 'left',
    },
    {
      id: 'materials',
      title: 'Material Intelligence & Brand Matrix',
      subtitle: 'Compare UltraTech, ACC, Tata Tiscon, Kohler, and Asian Paints in real time.',
      description: 'Switch between Standard, Premium, and Luxury material tiers. Instantly see how upgrading from Standard ACC Cement to UltraTech Super or switching sanitaryware from Jaquar to Kohler affects your total cost per square foot.',
      bullets: [
        'Live regional price indices for South India',
        'Transparent brand tier comparison',
        'Granular itemization of cement, steel, sand & blocks',
      ],
      icon: <Layers className="w-6 h-6 text-indigo-400" />,
      tag: 'Brand Matrix',
      align: 'right',
    },
    {
      id: 'boq',
      title: '13-Stage IS Code Bill of Quantities (BOQ)',
      subtitle: 'Automated quantity takeoff covering all 13 construction stages.',
      description: 'From earthwork excavation, footing concrete, plinth beams, and AAC block masonry to electrical piping, wall plastering, flooring, and exterior weather-proof painting.',
      bullets: [
        '100% IS 456 Structural code compliance',
        'Itemized labor & material cost split',
        'Tender-ready for contractor quote verification',
      ],
      icon: <FileSpreadsheet className="w-6 h-6 text-[var(--cc-brand)]" />,
      tag: 'Quantity Takeoff',
      align: 'left',
    },
    {
      id: 'timeline',
      title: 'Milestone Payment & Timeline Roadmap',
      subtitle: 'Protect your cashflow with bank-ready stage disbursements.',
      description: 'Never pay large unverified upfront advances. Cost Calculator generates a 6-stage milestone payment schedule that ties contractor payments strictly to verified physical site progress.',
      bullets: [
        '10-month stage-by-stage construction timeline',
        'SBI, HDFC, and ICICI home loan friendly disbursement format',
        'Zero upfront over-payment protection',
      ],
      icon: <Calendar className="w-6 h-6 text-cyan-400" />,
      tag: 'Payment Roadmap',
      align: 'right',
    },
  ];

  return (
    <section id="features" className="bg-[var(--cc-bg)] py-20 border-b border-[var(--cc-border)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--cc-brand)]/10 border border-[var(--cc-brand)]/30 text-[var(--cc-brand)] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Feature Deep-Dive
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--cc-text-primary)] tracking-tight">
            Flagship Features Built for Complete Confidence.
          </h2>
          <p className="text-[var(--cc-text-secondary)] text-base leading-relaxed">
            Every tool in Cost Calculator is designed to give Indian homeowners total control over their construction budget.
          </p>
        </div>

        {/* Alternating Feature Showcase Blocks */}
        <div className="space-y-16">
          {features.map((feat, idx) => {
            const isLeft = feat.align === 'left';
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 rounded-3xl bg-[var(--cc-surface)]/40 border border-[var(--cc-border)]/80 ${
                  isLeft ? '' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`lg:col-span-6 space-y-6 ${isLeft ? '' : 'lg:order-2'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[var(--cc-bg)] border border-[var(--cc-border)]">
                      {feat.icon}
                    </div>
                    <span className="px-3 py-1 text-xs font-bold bg-[var(--cc-brand)]/10 text-[var(--cc-brand)] border border-[var(--cc-brand)]/30 rounded-full">
                      {feat.tag}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--cc-text-primary)]">{feat.title}</h3>
                    <p className="text-xs sm:text-sm font-semibold text-[var(--cc-brand)]">{feat.subtitle}</p>
                    <p className="text-[var(--cc-text-secondary)] text-xs sm:text-sm leading-relaxed">{feat.description}</p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {feat.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2.5 text-xs text-[var(--cc-text-primary)]">
                        <CheckCircle2 className="w-4 h-4 text-[var(--cc-brand)] shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Button
                      size="md"
                      onClick={() => navigate('/calculator')}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="bg-[var(--cc-brand)] hover:bg-[var(--cc-brand)] text-white font-bold text-xs px-6 py-2.5"
                    >
                      Explore in Configurator
                    </Button>
                  </div>
                </div>

                {/* Mockup Card */}
                <div className={`lg:col-span-6 ${isLeft ? '' : 'lg:order-1'}`}>
                  <div className="p-6 rounded-2xl bg-[var(--cc-bg)] border border-[var(--cc-border)] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--cc-border)] pb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--cc-text-secondary)]">
                        <Building2 className="w-4 h-4 text-[var(--cc-brand)]" />
                        <span>Cost Calculator • {feat.tag} Preview</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    </div>

                    <div className="bg-[var(--cc-surface)]/90 p-4 rounded-xl border border-[var(--cc-border)] space-y-3">
                      <div className="text-xs font-bold text-[var(--cc-text-primary)]">{feat.title} Output</div>
                      <div className="text-[11px] text-[var(--cc-text-secondary)] leading-relaxed">
                        Automated computation output verified against regional price index and IS 456 standards.
                      </div>
                      <div className="pt-2 flex justify-between items-center text-xs font-extrabold">
                        <span className="text-[var(--cc-text-secondary)]">Calculation Status:</span>
                        <span className="text-[var(--cc-brand)] font-bold">100% Accurate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

