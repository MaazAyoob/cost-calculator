import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { pageFadeVariant, containerStaggerVariant } from '../../animations/variants';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Database,
  Activity,
  TrendingUp,
  Sliders,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface MaterialPriceRow {
  id: string;
  category: string;
  materialName: string;
  brand: string;
  unit: string;
  bangaloreRate: number;
  mysoreRate: number;
}

const initialPrices: MaterialPriceRow[] = [
  { id: 'p-1', category: 'Structure', materialName: 'TMT Steel Fe 550D', brand: 'Tata Tiscon', unit: 'per Tonne', bangaloreRate: 64000, mysoreRate: 62000 },
  { id: 'p-2', category: 'Structure', materialName: 'OPC 53 Cement', brand: 'UltraTech', unit: 'per 50kg bag', bangaloreRate: 420, mysoreRate: 395 },
  { id: 'p-3', category: 'Structure', materialName: 'M25 Ready Mix Concrete', brand: 'UltraTech RMC', unit: 'per Cu M', bangaloreRate: 4800, mysoreRate: 4500 },
  { id: 'p-4', category: 'Flooring', materialName: 'Vitrified Tiles (4x2 ft)', brand: 'Kajaria', unit: 'per Sq Ft', bangaloreRate: 140, mysoreRate: 130 },
  { id: 'p-5', category: 'Paint', materialName: 'Royale Luxury Emulsion', brand: 'Asian Paints', unit: 'per Litre', bangaloreRate: 680, mysoreRate: 650 },
  { id: 'p-6', category: 'Electrical', materialName: 'FRLS Copper Wire', brand: 'Havells / Polycab', unit: 'per Metre', bangaloreRate: 85, mysoreRate: 80 },
  { id: 'p-7', category: 'Plumbing', materialName: 'CPVC Pro SDR11 Pipe', brand: 'Astral', unit: 'per Metre', bangaloreRate: 220, mysoreRate: 210 },
  { id: 'p-8', category: 'Joinery', materialName: 'Burma Teak Main Door', brand: 'Custom Joinery', unit: 'per Set', bangaloreRate: 145000, mysoreRate: 135000 },
];

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kpi' | 'pricing' | 'audit'>('pricing');
  const [prices, setPrices] = useState(initialPrices);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRateChange = (id: string, field: 'bangaloreRate' | 'mysoreRate', value: number) => {
    setPrices((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const savePricing = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <motion.div variants={pageFadeVariant} initial="initial" animate="animate" exit="exit" className="space-y-6 max-w-6xl mx-auto py-2">
      <PageHeader
        title="Admin Portal & Material Price Index"
        subtitle="Manage regional price feeds, vendor rate cards, and platform analytics."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Admin Portal' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={savePricing} leftIcon={savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}>
              {savedSuccess ? 'Saved to Engine!' : 'Save Pricing Changes'}
            </Button>
          </div>
        }
      />

      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        {[
          { id: 'pricing', label: 'Regional Material Pricing Index', icon: <Sliders className="w-3.5 h-3.5" /> },
          { id: 'kpi', label: 'Platform KPIs & Revenue', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { id: 'audit', label: 'System Audit Logs', icon: <Activity className="w-3.5 h-3.5" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === t.id
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Pricing Tab */}
      {activeTab === 'pricing' && (
        <motion.div variants={containerStaggerVariant} initial="hidden" animate="show" className="space-y-5">
          <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200/60 text-xs text-blue-900 flex items-start gap-3">
            <Database className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Live Deterministic Pricing Engine Controls</div>
              <p className="text-blue-700 mt-0.5">
                Updating unit rates below instantly modifies downstream BOQ calculations, budget distributions, and PDF exports across all user sessions.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Regional Price Feeds (Bangalore vs Mysore)</CardTitle>
                <span className="text-xs text-slate-400 font-medium">{prices.length} Active Material Items</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-3">Category</th>
                      <th className="p-3">Material & Brand</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3 text-right">Bangalore Rate (₹)</th>
                      <th className="p-3 text-right">Mysore Rate (₹)</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prices.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{p.materialName}</div>
                          <div className="text-[10px] text-slate-400">{p.brand}</div>
                        </td>
                        <td className="p-3 text-slate-500">{p.unit}</td>
                        <td className="p-3 text-right font-mono">
                          <input
                            type="number"
                            value={p.bangaloreRate}
                            onChange={(e) => handleRateChange(p.id, 'bangaloreRate', Number(e.target.value))}
                            className="w-28 text-right p-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-3 text-right font-mono">
                          <input
                            type="number"
                            value={p.mysoreRate}
                            onChange={(e) => handleRateChange(p.id, 'mysoreRate', Number(e.target.value))}
                            className="w-28 text-right p-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <StatusBadge status="success" label="Active" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* KPI Tab */}
      {activeTab === 'kpi' && (
        <motion.div variants={containerStaggerVariant} initial="hidden" animate="show" className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-soft-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total Configured Projects</div>
              <div className="text-xl font-extrabold text-slate-900">1,248</div>
              <span className="text-[10px] text-emerald-600 font-bold">+18% this month</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-soft-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Active Users</div>
              <div className="text-xl font-extrabold text-blue-600">3,420</div>
              <span className="text-[10px] text-blue-600 font-bold">Bangalore & Mysore</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-soft-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">PDF Reports Generated</div>
              <div className="text-xl font-extrabold text-amber-600">892</div>
              <span className="text-[10px] text-slate-400">Bank-loan ready</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-soft-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Pipeline Opportunity</div>
              <div className="text-xl font-extrabold text-emerald-600">₹118 Cr</div>
              <span className="text-[10px] text-emerald-600 font-bold">Total BOQ Value</span>
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle>Most Selected Material Brands</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-xs">
              {[
                { brand: 'Tata Tiscon Fe 550D Steel', share: '64% market preference', color: 'bg-blue-600' },
                { brand: 'UltraTech OPC 53 Cement', share: '78% market preference', color: 'bg-amber-600' },
                { brand: 'Fenesta UPVC Glazing', share: '52% market preference', color: 'bg-indigo-600' },
                { brand: 'Kohler Concealed Plumbing', share: '45% market preference', color: 'bg-emerald-600' },
              ].map((b) => (
                <div key={b.brand} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-800">{b.brand}</span>
                  <span className="text-slate-500 font-semibold">{b.share}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <motion.div variants={containerStaggerVariant} initial="hidden" animate="show" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Recent System Audit Trail</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                {[
                  { time: '2 mins ago', action: 'Material Rate Update', user: 'admin@costcalculator.app', detail: 'TMT Steel rate updated to ₹64,000/tonne' },
                  { time: '14 mins ago', action: 'PDF Report Export', user: 'client@rightcon.in', detail: 'Generated executive report ref CC-2026-8912' },
                  { time: '1 hour ago', action: 'New Project Saved', user: 'client@rightcon.in', detail: 'Created 4BHK Duplex in HSR Layout (3,850 sq ft)' },
                ].map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{log.action}</div>
                      <div className="text-[11px] text-slate-500">{log.detail} • <span className="font-mono text-slate-400">{log.user}</span></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
