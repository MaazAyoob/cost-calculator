import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const FinalCtaSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[var(--cc-bg)] py-24 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/25 via-indigo-600/20 to-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-[var(--cc-border)] shadow-2xl text-center space-y-8 max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--cc-brand)]/10 border border-[var(--cc-brand)]/30 text-[var(--cc-brand)] text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Start Your Home Journey
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl sm:text-6xl font-black text-[var(--cc-text-primary)] tracking-tight leading-tight">
              Ready to Build Smarter•
            </h2>
            <p className="text-[var(--cc-text-secondary)] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Configure your plot, choose material brands, generate IS 456 compliant BOQs, and get bank-ready reports in under 5 minutes.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => navigate('/calculator')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="bg-[var(--cc-brand)] hover:bg-[var(--cc-brand)] text-white font-extrabold shadow-xl shadow-teal-900/10 text-base h-14 px-10 rounded-2xl border border-[var(--cc-brand)]/30 transition-all hover:scale-[1.02]"
            >
              Start Free Estimate
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="border-[var(--cc-border)] hover:border-[var(--cc-border)] bg-[var(--cc-surface)]/80 text-[var(--cc-text-primary)] hover:text-[var(--cc-text-primary)] text-base h-14 px-8 rounded-2xl"
            >
              Explore Sample Dashboard
            </Button>
          </div>

          <div className="pt-8 border-t border-[var(--cc-border)]/80 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--cc-text-secondary)] font-semibold">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[var(--cc-brand)]" /> IS Code 456 Compliant</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[var(--cc-brand)]" /> Bangalore Regional Price Index</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[var(--cc-brand)]" /> Bank Home Loan Friendly</span>
          </div>

        </div>
      </div>
    </section>
  );
};

