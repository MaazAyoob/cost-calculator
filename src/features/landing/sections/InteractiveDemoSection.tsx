import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, BarChart3, FileSpreadsheet, Calendar, FileCheck2, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
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
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Product Experience
          </span>
          <h2 className="heading-xl tracking-tight text-[var(--cc-text-primary)]">
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
                  isSelected ? 'bg-[var(--cc-brand)] text-white shadow-soft-md border border-[var(--cc-brand)]'
                    : 'bg-[var(--cc-surface)] text-[var(--cc-text-secondary)] border border-[var(--cc-border)] hover:text-[var(--cc-text-primary)] hover:bg-[var(--cc-surface-muted)]'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Showcase Card */}
        <div className="rounded-3xl p-1 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 border border-[var(--cc-border)] shadow-soft-xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-10 bg-[var(--cc-surface)] rounded-[22px] text-left space-y-8"
            >
              {activeTab === 'wizard' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--cc-border)] pb-4">
                    <div>
                      <span className="text-xs font-bold text-[var(--cc-brand)] uppercase tracking-widest block">Step 08 of 10</span>
                      <h3 className="text-xl font-extrabold text-[var(--cc-text-primary)]">Material Brand Selection Matrix</h3>
                    </div>
                    <Button size="sm" onClick={() => navigate('/calculator')} className="bg-[var(--cc-brand)] text-white font-bold text-xs cursor-pointer">
                      Try Wizard →
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-[var(--cc-border)] space-y-2">
                      <div className="text-xs font-bold text-blue-600 uppercase">Cement Grade</div>
                      <div className="text-sm font-extrabold text-[var(--cc-text-primary)]">UltraTech Super PPC</div>
                      <div className="text-[11px] text-[var(--cc-text-secondary)]">1,056 Bags &bull; ₹390 / bag</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-[var(--cc-border)] space-y-2">
                      <div className="text-xs font-bold text-indigo-600 uppercase">TMT Steel Grade</div>
                      <div className="text-sm font-extrabold text-[var(--cc-text-primary)]">Tata Tiscon 550D Fe</div>
                      <div className="text-[11px] text-[var(--cc-text-secondary)]">9.6 Metric Tons &bull; ₹78 / kg</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-[var(--cc-border)] space-y-2">
                      <div className="text-xs font-bold text-emerald-600 uppercase">Sanitaryware</div>
                      <div className="text-sm font-extrabold text-[var(--cc-text-primary)]">Kohler / Grohe Premium</div>
                      <div className="text-[11px] text-[var(--cc-text-secondary)]">CPVC Ashirwad &bull; Kohler Fittings</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--cc-border)] pb-4">
                    <div>
                      <span className="text-xs font-bold text-[var(--cc-brand)] uppercase tracking-widest block">Real-time Financial Overview</span>
                      <h3 className="text-xl font-extrabold text-[var(--cc-text-primary)]">Executive Project Summary Dashboard</h3>
                    </div>
                    <Button size="sm" onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white font-bold text-xs cursor-pointer">
                      Open Live Workspace →
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-[var(--cc-border)]">
                      <span className="text-[10px] text-[var(--cc-text-secondary)] block font-medium uppercase">Estimated Cost</span>
                      <span className="text-lg font-black text-blue-600">₹68.4 Lakhs</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-[var(--cc-border)]">
                      <span className="text-[10px] text-[var(--cc-text-secondary)] block font-medium uppercase">Base Rate / Sq.Ft</span>
                      <span className="text-lg font-black text-[var(--cc-text-primary)]">₹2,850 / sq.ft</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-[var(--cc-border)]">
                      <span className="text-[10px] text-[var(--cc-text-secondary)] block font-medium uppercase">Built-up Area</span>
                      <span className="text-lg font-black text-[var(--cc-text-primary)]">2,400 sq.ft</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-[var(--cc-border)]">
                      <span className="text-[10px] text-[var(--cc-text-secondary)] block font-medium uppercase">Build Duration</span>
                      <span className="text-lg font-black text-emerald-600">10 Months</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'boq' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--cc-border)] pb-4">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">IS Code Itemization</span>
                      <h3 className="text-xl font-extrabold text-[var(--cc-text-primary)]">13 Construction Stages BOQ Matrix</h3>
                    </div>
                    <Button size="sm" onClick={() => navigate('/calculator')} className="bg-blue-600 text-white font-bold text-xs cursor-pointer">
                      View Full BOQ →
                    </Button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-[var(--cc-border)] font-bold">
                      <span className="text-slate-800">Stage 01: Excavation & Footing Concrete (M20)</span>
                      <span className="text-blue-600 font-extrabold">₹4,20,000</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-[var(--cc-border)] font-bold">
                      <span className="text-slate-800">Stage 02: Plinth Beam & RCC Columns (Tata 550D)</span>
                      <span className="text-blue-600 font-extrabold">₹8,60,000</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-[var(--cc-border)] font-bold">
                      <span className="text-slate-800">Stage 03: AAC Block Masonry & Lintels</span>
                      <span className="text-blue-600 font-extrabold">₹5,40,000</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--cc-border)] pb-4">
                    <div>
                      <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest block">Milestone Roadmap</span>
                      <h3 className="text-xl font-extrabold text-[var(--cc-text-primary)]">10-Month Milestone Schedule</h3>
                    </div>
                    <Button size="sm" onClick={() => navigate('/calculator')} className="bg-blue-600 text-white font-bold text-xs cursor-pointer">
                      Configure Timeline →
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-[var(--cc-border)]">
                      <div className="font-bold text-cyan-600 uppercase text-[10px]">Month 1-2</div>
                      <div className="text-[var(--cc-text-primary)] font-extrabold text-sm">Substructure & Foundation</div>
                      <div className="text-[var(--cc-text-secondary)] text-[11px] mt-1">Advance 15% &bull; Sump & Footing</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-[var(--cc-border)]">
                      <div className="font-bold text-cyan-600 uppercase text-[10px]">Month 3-5</div>
                      <div className="text-[var(--cc-text-primary)] font-extrabold text-sm">Superstructure Slabs</div>
                      <div className="text-[var(--cc-text-secondary)] text-[11px] mt-1">Milestone 25% &bull; G+1/G+2 Slabs</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-[var(--cc-border)]">
                      <div className="font-bold text-cyan-600 uppercase text-[10px]">Month 6-10</div>
                      <div className="text-[var(--cc-text-primary)] font-extrabold text-sm">Finishes & Handover</div>
                      <div className="text-[var(--cc-text-secondary)] text-[11px] mt-1">Milestone 60% &bull; Plaster & Paint</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--cc-border)] pb-4">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">Loan Approval Ready</span>
                      <h3 className="text-xl font-extrabold text-[var(--cc-text-primary)]">Bank Home Loan Certified Reports</h3>
                    </div>
                    <Button size="sm" onClick={() => navigate('/report')} className="bg-blue-600 text-white font-bold text-xs cursor-pointer">
                      Export Sample PDF →
                    </Button>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-[var(--cc-border)] flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <FileCheck2 className="w-8 h-8 text-blue-600 shrink-0" />
                      <div>
                        <div className="text-sm font-extrabold text-[var(--cc-text-primary)]">Bank_Disbursement_BOQ_Report.pdf</div>
                        <div className="text-xs text-[var(--cc-text-secondary)]">SBI / HDFC / ICICI Certified Structural Format &bull; 22 Sections</div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => navigate('/report')} className="bg-blue-600 text-white font-bold text-xs cursor-pointer">
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
