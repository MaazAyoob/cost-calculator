// ============================================================
// ADMIN CONTROL CENTER — OVERVIEW SECTION (DASHBOARD HOME)
// Clean executive dashboard with plain-language construction indicators
// ============================================================

import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore, AdminTab } from '../../../store/useAdminStore';
import {
  Building,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
  GitCommit,
  ArrowRight,
  ShieldCheck,
  Hammer,
  Coins,
  FileSpreadsheet,
  CheckSquare
} from 'lucide-react';
import { formatCurrency } from '../../../utils/cn';

interface AdminOverviewSectionProps {
  onNavigate: (tab: AdminTab) => void;
}

export const AdminOverviewSection: React.FC<AdminOverviewSectionProps> = ({ onNavigate }) => {
  const {
    activeConfigVersion,
    draftParameters,
    rates,
    overrides,
    simulationReport,
    runSimulation,
    isSimulating,
    publishDraftConfig,
    isPublishingConfig,
    activeTab
  } = useAdminStore();

  const changedCount = Object.keys(draftParameters).length;
  const versionLabel = activeConfigVersion?.versionNumber || 'Version 12 (Production Active)';
  const lastUpdated = activeConfigVersion?.publishedAt
    ? new Date(activeConfigVersion.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Today, 2:30 PM';

  return (
    <div className="space-y-6">
      {/* ── 1. ACTIVE CONFIGURATION BANNER ── */}
      <div className="bg-gradient-to-r from-[#1B3D34] to-[#122A24] rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Active Construction Configuration</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading">
              Bengaluru Residential Standard
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100/80 pt-1">
              <span>Location: <strong className="text-white font-semibold">Bengaluru (BBMP/BDA)</strong></span>
              <span>•</span>
              <span>Specification: <strong className="text-white font-semibold">Premium Quality</strong></span>
              <span>•</span>
              <span>Configuration: <strong className="text-white font-semibold">{versionLabel}</strong></span>
              <span>•</span>
              <span>Last Published: <strong className="text-white font-semibold">{lastUpdated}</strong></span>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              onClick={() => onNavigate('test-calculator')}
              className="px-4 py-2.5 bg-[#F28C28] hover:bg-[#D9771A] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Test Calculator</span>
            </Button>

            <Button
              type="button"
              onClick={() => onNavigate('material-prices')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>Material Rates</span>
            </Button>

            <Button
              type="button"
              onClick={() => onNavigate('versions-history')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>View History</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. DRAFT & REVIEW STATUS BAR ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`border rounded-2xl ${changedCount > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Draft Changes</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {changedCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {changedCount > 0 ? 'Awaiting test & publication' : 'All parameters synced'}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${changedCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Rate Overrides</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {overrides.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Across {rates.length} tracked items
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Pending Review</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {changedCount > 0 ? '1' : '0'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {changedCount > 0 ? 'Review before activation' : 'Production is up to date'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Engine Status</p>
              <p className="text-base font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Single Source Active</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Zero duplicate engines
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. MAJOR CONTROL DOMAINS CARDS ── */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Quick Access Construction Settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Project & BUA */}
          <div
            onClick={() => onNavigate('project-bua')}
            className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B3D34] flex items-center justify-center group-hover:bg-[#1B3D34] group-hover:text-white transition-colors">
                <Building className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-slate-900 mt-3 text-base">Project & Built-up Area</h3>
            <p className="text-xs text-slate-500 mt-1">
              Plot dimensions, floor counts, circulation %, balcony %, and BUA calculation methods.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Standard Footprint</span>
              <span className="font-bold text-[#1B3D34]">60% Coverage</span>
            </div>
          </div>

          {/* Card 2: Rooms & Spaces */}
          <div
            onClick={() => onNavigate('rooms-spaces')}
            className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-slate-900 mt-3 text-base">Rooms & Spaces</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bedroom, Living, and Kitchen dimensions, plus dedicated Bathroom Master and custom room creation.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Templates Configured</span>
              <span className="font-bold text-blue-700">12 Room Types</span>
            </div>
          </div>

          {/* Card 3: RCC & Structure */}
          <div
            onClick={() => onNavigate('rcc-structure')}
            className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Hammer className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-slate-900 mt-3 text-base">RCC & Structure</h3>
            <p className="text-xs text-slate-500 mt-1">
              Steel factor per sq.ft (2.8 kg), floor increments, cement consumption (0.40 bags/sqft), sand, and aggregates.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Ground Steel</span>
              <span className="font-bold text-amber-700">2.80 kg/sq.ft</span>
            </div>
          </div>

          {/* Card 4: Material Prices */}
          <div
            onClick={() => onNavigate('material-prices')}
            className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Coins className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-slate-900 mt-3 text-base">Material Prices</h3>
            <p className="text-xs text-slate-500 mt-1">
              Authoritative Rate Master for steel, cement, blocks, tiles, paints, and electrical supplies.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Invariance</span>
              <span className="font-bold text-emerald-700">Rates Never Alter Quantities</span>
            </div>
          </div>

          {/* Card 5: Calculation Methods */}
          <div
            onClick={() => onNavigate('calculation-methods')}
            className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-slate-900 mt-3 text-base">Calculation Methods</h3>
            <p className="text-xs text-slate-500 mt-1">
              Switch safe registered calculation formulas for Steel, Paint, Flooring, Masonry, MEP, and Labour.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Safety</span>
              <span className="font-bold text-purple-700">Zero Arbitrary Code</span>
            </div>
          </div>

          {/* Card 6: Test Calculator */}
          <div
            onClick={() => onNavigate('test-calculator')}
            className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl hover:border-orange-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center group-hover:bg-[#F28C28] transition-colors">
                <Play className="w-5 h-5 fill-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-orange-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-slate-900 mt-3 text-base">In-Admin Test Calculator</h3>
            <p className="text-xs text-slate-600 mt-1">
              Run real calculations and inspect Active vs Draft differences without affecting customers.
            </p>
            <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs font-medium text-amber-800">
              <span>Simulation</span>
              <span className="font-bold text-orange-700">Interactive Sandbox</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
