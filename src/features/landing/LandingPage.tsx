import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { containerStaggerVariant, itemFadeUpVariant } from '../../animations/variants';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ArrowRight,
  Compass,
  ShieldCheck,
  BarChart3,
  Layers,
  CheckCircle2,
  Sparkles,
  Building2,
  DollarSign,
  Calendar,
  ChevronRight,
  Star,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Compass className="w-6 h-6 text-blue-600" />,
      title: 'Tesla-Style Planning Wizard',
      description:
        'Configure your entire home — from plot size to material brands — in a visual 10-step guided experience. Every choice updates your estimate in real time.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
      title: 'IS-Code Accurate BOQ',
      description:
        'Automated Bill of Quantities covering 13 construction stages with IS 456 compliant cement, steel, AAC block, plastering, and MEP itemizations.',
    },
    {
      icon: <Layers className="w-6 h-6 text-blue-600" />,
      title: 'Material Intelligence Matrix',
      description:
        'Compare Standard, Premium, and Luxury material tiers from UltraTech, Tata, Kohler, Grohe, and Asian Paints with instant cost-impact updates.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      title: 'Bank-Ready Payment Roadmap',
      description:
        '6-stage milestone-linked construction payment schedule aligned with Home Loan disbursement protocols for hassle-free financing.',
    },
  ];

  const stats = [
    { value: '13', label: 'Construction Stages', icon: <Building2 className="w-5 h-5 text-blue-600" /> },
    { value: '₹2,200+', label: 'Base Rate / Sq Ft', icon: <DollarSign className="w-5 h-5 text-emerald-600" /> },
    { value: '10 Mo', label: 'Avg. Build Timeline', icon: <Calendar className="w-5 h-5 text-amber-600" /> },
    { value: '200+', label: 'Quality Checkpoints', icon: <Star className="w-5 h-5 text-indigo-600" /> },
  ];

  return (
    <motion.div
      variants={containerStaggerVariant}
      initial="hidden"
      animate="show"
      className="space-y-16 py-4"
    >
      {/* ── Hero Banner ── */}
      <motion.div variants={itemFadeUpVariant}>
        <div className="relative overflow-hidden rounded-[24px] bg-slate-900 text-white p-8 md:p-14 border border-slate-800 shadow-soft-xl">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 -translate-y-16 translate-x-16 w-[480px] h-[480px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-16 -translate-x-16 w-[320px] h-[320px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-7">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" /> India's First Architecture-Grade Home Planning SaaS
              </div>
              <StatusBadge status="success" label="IS 456 Compliant" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Engineer Every<br />
              <span className="text-blue-400">Square Foot</span><br />
              Before You Build.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-2xl">
              Cost Calculator gives Indian homeowners total financial clarity — precise material quantities, IS-code accurate BOQ, stage-linked milestones, and bank-loan ready reports. Before a single brick is laid.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                onClick={() => navigate('/planner')}
                className="bg-blue-600 hover:bg-blue-500 text-white shadow-soft-md text-base h-14 px-8"
              >
                Start Free Planning Wizard
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="bg-slate-900 border border-slate-700 text-slate-100 hover:bg-slate-800 hover:border-slate-600 hover:text-white h-14 px-8"
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Explore Sample Workspace
              </Button>
            </div>

            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> IS Code 456 Structural Compliance</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Bangalore & Mysore Regional Price Index</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Bank Home Loan Disbursement Friendly</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div variants={itemFadeUpVariant}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm text-center space-y-2"
            >
              <div className="p-3 bg-slate-50 rounded-xl">{s.icon}</div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{s.value}</div>
              <div className="text-xs text-slate-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Feature Grid ── */}
      <motion.div variants={itemFadeUpVariant} className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" /> Enterprise Construction Intelligence
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything you need before construction begins.
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Built for precision, transparency, and complete construction budget control — from foundation to handover.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, idx) => (
            <Card
              key={idx}
              variant="interactive"
              onClick={() => navigate('/planner')}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl shrink-0">{f.icon}</div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 pt-2 border-t border-slate-100">
                  <span>Explore in Wizard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* ── Final CTA ── */}
      <motion.div variants={itemFadeUpVariant}>
        <div className="text-center p-10 bg-blue-600 rounded-2xl text-white shadow-soft-xl space-y-4">
          <h3 className="text-2xl font-extrabold tracking-tight">Ready to plan your dream home?</h3>
          <p className="text-blue-200 text-sm max-w-md mx-auto">
            Start the 10-step configurator and get a bank-ready BOQ in under 5 minutes.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/planner')}
            className="bg-white text-blue-700 hover:bg-slate-100 font-bold shadow-soft-sm"
            rightIcon={<ArrowRight className="w-5 h-5 text-blue-700" />}
          >
            Launch Home Planning Configurator
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
