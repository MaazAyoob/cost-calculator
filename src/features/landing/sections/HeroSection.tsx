import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, ShieldCheck, CheckCircle2, Calculator } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg         = isDark ? '#0F172A' : '#FAFAF8';
  const surface    = isDark ? '#1E293B' : '#FFFFFF';
  const textPri    = isDark ? '#F8FAFC' : '#111827';
  const textSec    = isDark ? '#94A3B8' : '#6B7280';
  const border     = isDark ? '#1F2937' : '#E5E7EB';
  const brand      = isDark ? '#14B8A6' : '#0F766E';
  const brandLight = isDark ? '#134E4A' : '#CCFBF1';

  const statItems = [
    { value: '₹6.4L', label: 'Avg. savings per project' },
    { value: '98.4%', label: 'Estimation accuracy' },
    { value: '13-Stage', label: 'BOQ breakdown depth' },
    { value: 'SBI / HDFC', label: 'Bank-approved format' },
  ];

  return (
    <section
      style={{ backgroundColor: bg }}
      className="relative overflow-hidden pt-14 pb-24 lg:pt-20 lg:pb-32"
    >
      {/* Decorative gradient — top-center */}
      <div
        className="absolute inset-x-0 top-0 h-[480px] pointer-events-none"
        style={{
          background: isDark ? 'radial-gradient(ellipse 70% 60% at 50% -10%, rgba(15, 118, 110, 0.18) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 70% 60% at 50% -10%, rgba(15, 118, 110, 0.10) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* ── Left: Hero Copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border"
                style={{ backgroundColor: brandLight, color: brand, borderColor: brand + '30' }}
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Cost Calculator by Rightcon
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border"
                style={{ backgroundColor: isDark ? '#14532D' : '#DCFCE7', color: '#16A34A', borderColor: '#16A34A30' }}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> IS 456 &amp; BBMP Compliant
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.07]" style={{ color: textPri }}>
                Plan Your Dream Home{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, ' + brand + ' 0%, #C6A75E 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Before You Build It.
                </span>
              </h1>
              <p className="text-lg sm:text-xl leading-relaxed max-w-2xl font-normal" style={{ color: textSec }}>
                Estimate construction costs, explore material requirements, understand your timeline,
                and make fully informed decisions before ground break.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/calculator')}
                className="inline-flex items-center gap-2 text-[var(--cc-text-primary)] text-sm font-bold px-7 py-3.5 rounded-2xl transition-all hover:-translate-y-px"
                style={{ backgroundColor: brand, boxShadow: '0 6px 20px ' + brand + '45' }}
              >
                Start Free Estimate <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#demo"
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3.5 rounded-2xl border transition-all hover:-translate-y-px"
                style={{ backgroundColor: surface, borderColor: border, color: textPri }}
              >
                <Play className="w-4 h-4" style={{ color: brand, fill: brand }} />
                Watch Interactive Demo
              </a>
            </div>

            {/* Trust micro-stats */}
            <div className="flex flex-wrap gap-5 pt-4">
              {[
                'Bangalore & South India Index',
                '13-Stage BOQ Breakdown',
                'Bank Loan Friendly Reports',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs font-semibold" style={{ color: textSec }}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: '#16A34A' }} />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Live Estimate Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.70, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            {/* Outer gradient ring */}
            <div
              className="rounded-3xl p-px"
              style={{
                background: isDark ? 'linear-gradient(135deg, #0F766E40, #C6A75E30, transparent)'
                  : 'linear-gradient(135deg, #0F766E25, #C6A75E20, #E5E7EB)',
              }}
            >
              <div
                className="rounded-[calc(24px-1px)] overflow-hidden"
                style={{ backgroundColor: surface, boxShadow: isDark ? '0 24px 48px rgba(0, 0, 0, 0.50)' : '0 24px 48px rgba(17, 24, 39, 0.10)' }}
              >
                {/* Header bar */}
                <div
                  className="flex items-center justify-between px-6 py-4 border-b"
                  style={{ backgroundColor: isDark ? '#1E293B' : '#F4F4F0', borderColor: border }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: brandLight }}
                    >
                      <Calculator className="w-4 h-4" style={{ color: brand }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: textPri }}>30 × 40 Luxury Duplex Villa</p>
                      <p className="text-[10px] font-medium" style={{ color: textSec }}>Whitefield, Bangalore • G+2</p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                    style={{ backgroundColor: isDark ? '#14532D' : '#DCFCE7', color: '#16A34A', borderColor: '#16A34A25' }}
                  >
                    Live Estimate
                  </span>
                </div>

                {/* Metric grid */}
                <div className="p-6 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Built-up Area', value: '2₹400 sq.ft', highlight: false },
                    { label: 'Estimated Project Cost', value: '₹68₹40₹000', highlight: true },
                    { label: 'Cement (UltraTech)', value: '1₹056 Bags', highlight: false },
                    { label: 'TMT Steel (Tata 550D)', value: '9.6 MT', highlight: false },
                  ].map(({ label, value, highlight }) => (
                    <div
                      key={label}
                      className="p-3 rounded-2xl border"
                      style={{ backgroundColor: isDark ? '#1E293B' : '#F4F4F0', borderColor: border }}
                    >
                      <p className="text-[10px] font-medium mb-1" style={{ color: textSec }}>{label}</p>
                      <p
                        className="text-sm font-extrabold"
                        style={{ color: highlight ? '#16A34A' : textPri }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Stat bar */}
                <div
                  className="px-6 pb-6 grid grid-cols-2 gap-3"
                >
                  {statItems.map(({ value, label }) => (
                    <div
                      key={label}
                      className="text-center p-2 rounded-xl border"
                      style={{ borderColor: border }}
                    >
                      <p className="text-sm font-black" style={{ color: brand }}>{value}</p>
                      <p className="text-[10px] font-medium" style={{ color: textSec }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Footer CTA */}
                <div
                  className="flex items-center justify-between px-6 py-4 border-t"
                  style={{ borderColor: border }}
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: textSec }}>
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: brand }} />
                    IS 456 Structural Integrity
                  </span>
                  <button
                    onClick={() => navigate('/calculator')}
                    className="text-xs font-bold hover:underline transition-colors"
                    style={{ color: brand }}
                  >
                    Configure Yours →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

