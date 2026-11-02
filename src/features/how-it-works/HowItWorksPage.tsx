import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Home,
  Layers,
  Calculator,
  FileText,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { useWizardStore } from '../../store/useWizardStore';
import familyHomeImg from '../../assets/how-it-works-family.jpg';

const STEPS = [
  {
    step: '01',
    title: 'Your Plot & Living Spaces',
    subtitle: 'Start with the basics',
    desc: 'Enter your plot dimensions (width and length) or plot area in Bengaluru or Mysuru. Tell us how many floors (Ground to G+4) and configure your rooms—bedrooms, bathrooms, kitchen, pooja, utility, and balcony.',
    icon: Compass,
    highlights: ['Dimensions in feet', 'Support for standard & custom plots', 'Room count customization'],
  },
  {
    step: '02',
    title: 'Your Buildable Space & Setbacks',
    subtitle: 'See how much you can legally build',
    desc: 'Our engine computes municipal setbacks based on Bengaluru GBA 2026 guidelines. We distinguish your gross plot area from the maximum allowable ground coverage, buildable footprint, and total built-up area (BUA).',
    icon: Home,
    highlights: ['GBA 2026 setback rules', 'Footprint vs built-up area clarity', 'No confusing legal jargon'],
  },
  {
    step: '03',
    title: 'Construction Style & Materials',
    subtitle: 'Customize structural & finish specifications',
    desc: 'Choose between RCC Framed or Load-Bearing structures. Select walling types (solid concrete blocks, clay bricks, or AAC blocks) and configure finishes across flooring, doors, windows, electrical, and plumbing.',
    icon: Layers,
    highlights: ['Standard, Premium & Luxury tiers', 'Brand selections optional', 'Only changes rates, never fake quantities'],
  },
  {
    step: '04',
    title: 'Free Preliminary Estimate',
    subtitle: 'Instant clarity with no login required',
    desc: 'Review your total built-up area, projected construction cost range, and major material needs (steel tonnage, cement bags, sand volumes). Free users get instant access without having to create an account.',
    icon: Calculator,
    highlights: ['Instant calculations', 'Materials & labour breakdown', 'No mandatory login'],
  },
  {
    step: '05',
    title: 'Detailed Construction Cost Report',
    subtitle: 'Work-wise BOQ and report',
    desc: 'Unlock the complete itemized bill of quantities (BOQ) with granular material quantities, market rates, trade labour milestones, and a downloadable PDF report you can discuss with your contractor or consultant.',
    icon: FileText,
    highlights: ['Available for ₹499', 'Itemized civil & MEP line items', 'Downloadable PDF format'],
  },
  {
    step: '06',
    title: 'Independent Expert Guidance',
    subtitle: 'Unbiased advice before you break ground',
    desc: 'Need drawings vetted or contractor quotes reviewed? Book an online 1-on-1 consultation with certified, independent architects and structural engineers for a flat fee of ₹1,499. No builder commissions, pure clarity.',
    icon: UserCheck,
    highlights: ['Flat ₹1,499 fee', 'Verified independent specialists', 'Convenient online video session'],
  },
];

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();
  const { startNewProject } = useWizardStore();

  const handleStartEstimate = () => {
    startNewProject();
    navigate('/calculator');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#183B32] py-10 sm:py-16">
      <SEO
        title="How Hutty Works — Step-by-Step Home Construction Planning"
        description="Learn how Hutty calculates your home construction cost, checks municipal setbacks, plans material quantities, and connects you with verified independent experts."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Editorial Hero with Authentic Indian Family Photography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-left">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#CBD5CB] text-xs font-semibold text-[#183B32]">
              <Sparkles className="w-3.5 h-3.5 text-[#C66B4E]" />
              <span className="font-bold">HOW HUTTY WORKS &bull; FROM PLOT TO HOME</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-[#183B32] tracking-tight leading-tight">
              Build your home with clarity, <br className="hidden sm:inline" />
              one step at a time.
            </h1>

            <p className="text-sm sm:text-base text-[#66716B] leading-relaxed max-w-xl">
              Hutty demystifies residential construction. We combine statutory bylaws, structural quantity algorithms, and verified local market rates into an intuitive journey designed for first-time homebuilders.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleStartEstimate}
                className="bg-[#183B32] hover:bg-[#245747] text-white text-sm font-bold px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-soft-sm hover:shadow-soft-md flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Start Free Estimate</span>
                <ArrowRight className="w-4 h-4 text-[#C66B4E]" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/consult')}
                className="bg-white hover:bg-[#E8EFE9] text-[#183B32] border border-[#CBD5CB] text-sm font-semibold px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-soft-xs flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Consult an Expert — ₹1,499</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Warm Family Photography Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#CBD5CB] shadow-soft-md bg-white group">
              <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-100">
                <img
                  src={familyHomeImg}
                  alt="Authentic Indian family smiling together in their newly planned contemporary home in Bengaluru"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500 ease-out"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#112821]/80 via-transparent to-black/20 pointer-events-none" />

                {/* Floating Bottom Card */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-left text-white space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white">
                    <Sparkles className="w-3 h-3 text-[#C66B4E]" />
                    <span>Real Homeowners</span>
                  </div>
                  <h3 className="text-sm font-bold leading-tight">
                    Every detail planned before pouring concrete.
                  </h3>
                  <p className="text-[11px] text-white/80 line-clamp-1">
                    Clear quantities, zero hidden contractor markups, and independent guidance.
                  </p>
                </div>
              </div>

              {/* Bottom Quick Metric */}
              <div className="p-3.5 bg-[#F8F8F6] border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#183B32]">
                <span className="font-semibold">Average Homeowner Clarity</span>
                <span className="font-bold text-[#C66B4E]">₹21.4L+ In Decisions Planned</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 6 Steps Grid with Staggered Framer Motion Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5E7EB] hover:border-[#183B32]/40 transition-all shadow-soft-xs hover:shadow-soft-md flex flex-col justify-between space-y-4 text-left"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#C66B4E] bg-[#C66B4E]/10 px-2.5 py-1 rounded-md">
                      STAGE {step.step}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#E8EFE9] border border-[#CBD5CB] flex items-center justify-center text-[#183B32]">
                      <Icon className="w-4 h-4 text-[#245747]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#66716B] uppercase tracking-wider block">
                      {step.subtitle}
                    </span>
                    <h3 className="text-xl font-bold font-heading text-[#183B32] leading-snug">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#66716B] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E5E7EB] space-y-1.5">
                  {step.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#183B32]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#347A62] shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Estimation Disclaimer Callout */}
        <div className="bg-[#E8EFE9]/60 rounded-3xl p-6 sm:p-8 border border-[#CBD5CB] max-w-4xl mx-auto space-y-3 text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#183B32]" />
            <h4 className="text-sm sm:text-base font-bold text-[#183B32]">
              Independent, Transparent &amp; Code-Compliant
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-[#66716B] leading-relaxed">
            Hutty does not take contractor kickbacks or inflate material rates. All calculations are derived from published engineering standards (IS 456:2000, IS 1786 Fe550D, NBC 2016) and active Bengaluru retail material benchmarks.
          </p>
          <p className="text-[11px] text-[#66716B] italic pt-1 border-t border-[#CBD5CB]/60">
            <strong>Important Planning Disclaimer:</strong> This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked.
          </p>
        </div>

        {/* Bottom CTA Block */}
        <div className="bg-[#183B32] text-white rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 shadow-soft-lg">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight">
              Ready to understand your home?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-lg mx-auto">
              Start your free residential estimate in under 3 minutes without registration.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleStartEstimate}
              className="w-full sm:w-auto bg-[#C66B4E] hover:bg-[#A95640] text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-soft-sm flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Start Free Estimate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/consult')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Talk to an Expert (₹1,499)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
