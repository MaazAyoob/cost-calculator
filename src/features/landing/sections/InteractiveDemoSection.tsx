import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, BarChart3, FileSpreadsheet, Calendar, FileCheck2, ArrowRight, CheckCircle2, Sparkles, Building2, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const InteractiveDemoSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'wizard' | 'dashboard' | 'boq' | 'timeline' | 'reports'>('wizard');

  const tabs = [
    { id: 'wizard', label: 'Planning Wizard', icon: <Layout className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Interactive Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'boq', label: '13-Stage BOQ', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'timeline', label: 'Construction Timeline', icon: <Calendar className="w-4 h-4" /> },
    { id: 'reports', label: 'Bank-Ready Reports', icon: <FileCheck2 className="w-4 h-4" /> },
  ];

  return (
    <section id="demo" className="bg-[var(--cc-bg)] py-20 border-b border-[var(--cc-border)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Product Experience
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--cc-text-primary)] tracking-tight">
            See the Flagship Engine in Action.
          </h2>
          <p className="text-[var(--cc-text-secondary)] text-base leading-relaxed">
            Explore how Cost Calculator turns complex architectural variables into clean, actionable dashboards and reports.
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          {tabs.map((t) => {
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected ? 'bg-[var(--cc-brand)] text-white shadow-lg shadow-teal-900/10 scale-105 border border-[var(--cc-brand)]/40'
                    : 'bg-[var(--cc-surface)]/80 text-[var(--cc-text-secondary)] border border-[var(--cc-border)] hover:text-[var(--cc-text-primary)] hover:bg-[var(--cc-surface-muted)]'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Showcase Card */}
        <div className="rounded-3xl p-1 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border border-[var(--cc-border)] shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-10 bg-[var(--cc-bg)] rounded-[22px] text-left space-y-8"
            >
              {activeTab === 'wizard' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--cc-border)] pb-4">
                    <div>
                      <span className="text-xs font-bold text-[var(--cc-brand)] uppercase tracking-widest block">Step 08 of 10</span>
                      <h3 className="text-xl font-bold text-[var(--cc-text-primary)]">Material Brand Selection Matrix</h3>
                    </div>
                    <Button size="sm" onClick={() => navigate('/calculator')} className="bg-[var(--cc-brand)] text-white font-bold text-xs">
                      Try Wizard â†’
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--cc-surface)] border border-[var(--cc-brand)]/50 space-y-2">
                      <div className="text-xs font-bold text-[var(--cc-brand)] uppercase">Cement Grade</div>
                      <div className="text-sm font-extrabold text-[var(--cc-text-primary)]">UltraTech Super PPC</div>
                      <div className="text-[11px] text-[var(--cc-text-secondary)]">1,056 Bags • ₹390 / bag</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--cc-surface)] border border-indigo-500/50 space-y-2">
                      <div className="text-xs font-bold text-indigo-400 uppercase">TMT Steel Grade</div>
                      <div className="text-sm font-extrabold text-[var(--cc-text-primary)]">Tata Tiscon 550D Fe</div>
                      <div className="text-[11px] text-[var(--cc-text-secondary)]">9.6 Metric Tons • ₹68,500 / Ton</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--cc-surface)] border border-cyan-500/50 space-y-2">
                      <div className="text-xs font-bold text-cyan-400 uppercase">Sanitaryware</div>
                      <div className="text-sm font-extrabold text-[var(--cc-text-primary)]">Kohler / Grohe Premium</div>
                      <div className="text-[11px] text-[var(--cc-text-secondary)]">CPVC Astral • Kohler Fittings</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--cc-border)] pb-4">
                    <div>
                      <span className="text-xs font-bold text-[var(--cc-brand)] uppercase tracking-widest block">Real-time Financial Overview</span>
                      <h3 className="text-xl font-bold text-[var(--cc-text-primary)]">Executive Project Summary Dashboard</h3>
                    </div>
                    <Button size="sm" onClick={() => navigate('/dashboard')} className="bg-emerald-600 text-[var(--cc-text-primary)] font-bold text-xs">
                      Open Live Workspace â†’
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--cc-surface)] border border-[var(--cc-border)]">
                      <span className="text-[10px] text-[var(--cc-text-secondary)] block font-medium">Estimated Project Cost</span>
                      <span className="text-lg font-black text-[var(--cc-brand)]">₹68₹40₹000</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--cc-surface)] border border-[var(--cc-border)]">
                      <span className="text-[10px] text-[var(--cc-text-secondary)] block font-medium">Base Rate / Sq.Ft</span>
                      <span className="text-lg font-black text-[var(--cc-text-primary)]">₹2₹850 / sq.ft</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--cc-surface)] border border-[var(--cc-border)]">
                      <span className="text-[10px] text-[var(--cc-text-secondary)] block font-medium">Total Built-up Area</span>
                      <span className="text-lg font-black text-[var(--cc-text-primary)]">2₹400 sq.ft</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--cc-surface)] border border-[var(--cc-border)]">
                      <span className="text-[10px] text-[var(--cc-text-secondary)] block font-medium">Build Duration</span>
                      <span className="text-lg font-black text-[var(--cc-brand)]">10 Months</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'boq' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--cc-border)] pb-4">
                    <div>
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">IS Code Itemization</span>
                      <h3 className="text-xl font-bold text-[var(--cc-text-primary)]">13 Construction Stages BOQ Matrix</h3>
                    </div>
                    <Button size="sm" onClick={() => navigate('/calculator')} className="bg-[var(--cc-brand)] text-white font-bold text-xs">
                      View Full BOQ â†’
                    </Button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-3 rounded-lg bg-[var(--cc-surface)] border border-[var(--cc-border)] text-[var(--cc-text-secondary)] font-bold">
                      <span>Stage 01: Excavation & Footing Concrete (M20)</span>
                      <span className="text-[var(--cc-brand)]">₹4₹20₹000</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-[var(--cc-surface)] border border-[var(--cc-border)] text-[var(--cc-text-secondary)] font-bold">
                      <span>Stage 02: Plinth Beam & RCC Columns (Tata 550D)</span>
                      <span className="text-[var(--cc-brand)]">₹8₹60₹000</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-[var(--cc-surface)] border border-[var(--cc-border)] text-[var(--cc-text-secondary)] font-bold">
                      <span>Stage 03: AAC Block Masonry & Lintels</span>
                      <span className="text-[var(--cc-brand)]">₹5₹40₹000</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--cc-border)] pb-4">
                    <div>
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">Milestone Roadmap</span>
                      <h3 className="text-xl font-bold text-[var(--cc-text-primary)]">10-Month Milestone Schedule</h3>
                    </div>
                    <Button size="sm" onClick={() => navigate('/calculator')} className="bg-cyan-600 text-[var(--cc-text-primary)] font-bold text-xs">
                      Configure Timeline â†’
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[var(--cc-surface)] border border-[var(--cc-border)]">
                      <div className="font-bold text-cyan-400">Month 1-2</div>
                      <div className="text-[var(--cc-text-primary)] font-extrabold">Substructure & Foundation</div>
                      <div className="text-[var(--cc-text-secondary)] text-[11px]">Advance 15% • Sump & Footing</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--cc-surface)] border border-[var(--cc-border)]">
                      <div className="font-bold text-cyan-400">Month 3-5</div>
                      <div className="text-[var(--cc-text-primary)] font-extrabold">Superstructure Slabs</div>
                      <div className="text-[var(--cc-text-secondary)] text-[11px]">Milestone 25% • G+1/G+2 Slabs</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--cc-surface)] border border-[var(--cc-border)]">
                      <div className="font-bold text-cyan-400">Month 6-10</div>
                      <div className="text-[var(--cc-text-primary)] font-extrabold">Finishes & Handover</div>
                      <div className="text-[var(--cc-text-secondary)] text-[11px]">Milestone 60% • Plaster & Paint</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--cc-border)] pb-4">
                    <div>
                      <span className="text-xs font-bold text-[var(--cc-brand)] uppercase tracking-widest block">Loan Approval Ready</span>
                      <h3 className="text-xl font-bold text-[var(--cc-text-primary)]">Bank Home Loan Certified Reports</h3>
                    </div>
                    <Button size="sm" onClick={() => navigate('/reports')} className="bg-emerald-600 text-[var(--cc-text-primary)] font-bold text-xs">
                      Export Sample PDF â†’
                    </Button>
                  </div>

                  <div className="p-5 rounded-2xl bg-[var(--cc-surface)] border border-[var(--cc-border)] flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <FileCheck2 className="w-8 h-8 text-[var(--cc-brand)] shrink-0" />
                      <div>
                        <div className="text-sm font-extrabold text-[var(--cc-text-primary)]">Bank_Disbursement_BOQ_Report.pdf</div>
                        <div className="text-xs text-[var(--cc-text-secondary)]">SBI / HDFC / ICICI Certified Structural Format • 14 Pages</div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => navigate('/reports')} className="bg-[var(--cc-brand)] text-white font-bold text-xs">
                      Download Sample PDF
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

