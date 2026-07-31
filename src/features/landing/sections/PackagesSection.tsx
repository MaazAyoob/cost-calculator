import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const PackagesSection: React.FC = () => {
  const navigate = useNavigate();

  const packages = [
    {
      name: 'Essential Package',
      rate: '₹2₹200',
      unit: '/ sq.ft',
      description: 'Ideal for budget-conscious homebuilders seeking IS-compliant structural safety.',
      badge: 'Standard Quality',
      popular: false,
      features: [
        'ACC / Dalmia PPC Cement Grade',
        'JSW / Prime Fe 500 TMT Steel',
        'Vitrified Tile Flooring (2x2 ft @ ₹55/sq.ft)',
        'Jaquar / Hindware CP & Sanitary Fittings',
        'Asian Paints Tractor Emulsion (Interior)',
        'Teakwood Flush Main Door Frame',
        'IS 456 Structural Compliance Warranty',
      ],
    },
    {
      name: 'Premium Package',
      rate: '₹2₹850',
      unit: '/ sq.ft',
      description: 'Our most popular tier combining luxury aesthetics with top-tier brand matrix.',
      badge: 'Most Popular',
      popular: true,
      features: [
        'UltraTech Super PPC Concrete Cement',
        'Tata Tiscon 550D Fe High Ductility Steel',
        'GVT Vitrified / Italian Marble Tiles (4x2 ft @ ₹95/sq.ft)',
        'Kohler / Grohe Diverter Sanitary Fittings',
        'Asian Paints Apex Ultima Exterior & Royale Interior',
        'Teakwood Main Door with Digital Lock',
        'UPVC 3-Track Windows with Mosquito Mesh',
        'Solar Water Heater & Sump Tank RMC Waterproofing',
      ],
    },
    {
      name: 'Luxury Package',
      rate: '₹3₹600',
      unit: '/ sq.ft',
      description: 'Ultra-luxury architectural finish with Italian marble, home automation, and teakwood.',
      badge: 'Ultra Luxury',
      popular: false,
      features: [
        'UltraTech Super / RMC M25 Grade Concrete',
        'Tata Tiscon 550D Corrosion Resistant Steel',
        'Imported Italian Bottochino Marble Flooring (@ ₹280/sq.ft)',
        'Hansgrohe / Kohler Concealed Thermostatic Shower System',
        'Asian Paints Royale Aspira Silk Polish & PU Wood Finish',
        'Solid Teakwood Main & Interior Doors',
        'Smart Home Automation & Video Door Phone',
        'EV Car Charging Dock & Solar Roof Provisions',
      ],
    },
  ];

  return (
    <section id="packages" className="bg-[var(--cc-bg)] py-20 border-b border-[var(--cc-border)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--cc-brand)]/10 border border-[var(--cc-brand)]/30 text-[var(--cc-brand)] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Construction Packages & Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--cc-text-primary)] tracking-tight">
            Transparent Pricing Per Square Foot.
          </h2>
          <p className="text-[var(--cc-text-secondary)] text-base leading-relaxed">
            Compare material brands and specifications. Every tier is fully customizable inside our 10-step calculator.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`rounded-3xl p-8 flex flex-col justify-between relative transition-all ${
                pkg.popular ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-[var(--cc-brand)] shadow-2xl shadow-teal-900/5 scale-105 z-10'
                  : 'bg-[var(--cc-surface)]/50 border border-[var(--cc-border)]/80 hover:border-[var(--cc-border)]'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--cc-brand)] text-white text-[11px] font-black uppercase tracking-widest shadow-md">
                  â˜… Most Selected Tier
                </div>
              )}

              <div className="space-y-6 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--cc-surface-muted)] text-[var(--cc-text-secondary)] border border-[var(--cc-border)]">
                    {pkg.badge}
                  </span>
                  <ShieldCheck className="w-5 h-5 text-[var(--cc-brand)]" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[var(--cc-text-primary)]">{pkg.name}</h3>
                  <p className="text-xs text-[var(--cc-text-secondary)] mt-1">{pkg.description}</p>
                </div>

                <div className="flex items-baseline gap-1 border-b border-[var(--cc-border)] pb-4">
                  <span className="text-4xl font-black text-[var(--cc-text-primary)]">{pkg.rate}</span>
                  <span className="text-xs text-[var(--cc-text-secondary)] font-bold">{pkg.unit}</span>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[var(--cc-text-secondary)] uppercase tracking-wider block">Included Specifications:</span>
                  <ul className="space-y-2 text-xs text-[var(--cc-text-secondary)]">
                    {pkg.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[var(--cc-brand)] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Button
                  size="lg"
                  onClick={() => navigate('/calculator')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className={`w-full font-bold text-xs justify-center ${
                    pkg.popular ? 'bg-[var(--cc-brand)] hover:bg-[var(--cc-brand)] text-white shadow-lg shadow-teal-900/10'
                      : 'bg-[var(--cc-surface-muted)] hover:bg-slate-700 text-[var(--cc-text-primary)] border border-[var(--cc-border)]'
                  }`}
                >
                  Estimate in {pkg.name.split(' ')[0]} Tier
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

