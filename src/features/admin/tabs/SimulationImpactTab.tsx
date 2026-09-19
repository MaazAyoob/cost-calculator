// ============================================================
// ADMIN CONTROL CENTER — SIMULATION & IMPACT ANALYSIS TAB
// Parts 28, 29, 44 — Full Pre-Publish Impact Graph & Comparison
// ============================================================

import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import {
  Activity,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  RefreshCw,
  GitCommit,
  ShieldAlert
} from 'lucide-react';
import { formatCurrency } from '../../../utils/cn';

export const SimulationImpactTab: React.FC = () => {
  const {
    draftParameters,
    simulationReport,
    isSimulating,
    runSimulation,
    publishDraftConfig,
    isPublishingConfig
  } = useAdminStore();

  const [publishSummary, setPublishSummary] = useState('');
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  const changedCount = Object.keys(draftParameters).length;

  const handleSimulate = async () => {
    await runSimulation();
  };

  const handlePublish = async () => {
    const success = await publishDraftConfig(publishSummary || 'Admin parameter and rule update');
    if (success) {
      setShowPublishConfirm(false);
      setPublishSummary('');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER & ACTIONS ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#1B3D34]" />
            Simulation & Pre-Publish Impact Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate exact physical quantity, BOQ, and budget ramifications across the calculation engine before activating configuration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleSimulate}
            disabled={changedCount === 0 || isSimulating}
            className="px-4 py-2 text-xs font-bold bg-[#F28C28] hover:bg-[#D9771A] text-white rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Simulate Changes ({changedCount})</span>
              </>
            )}
          </Button>

          {simulationReport && (
            <Button
              type="button"
              onClick={() => setShowPublishConfirm(true)}
              disabled={isPublishingConfig}
              className="px-4 py-2 text-xs font-bold bg-[#1B3D34] hover:bg-[#142E27] text-white rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <GitCommit className="w-4 h-4" />
              <span>Publish to Production</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── EMPTY STATE / PROMPT TO MODIFY ── */}
      {changedCount === 0 && !simulationReport && (
        <Card className="border border-dashed border-slate-300 bg-slate-50/50">
          <CardContent className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto border border-slate-200 text-slate-400">
              <Sparkles className="w-6 h-6 text-[#F28C28]" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-heading">
              No Draft Parameters Modified
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Go to <strong>Construction Parameters</strong> or any trade tab (Structure, Masonry, Paint, etc.) to modify values.
              Then return here to simulate side-by-side impact before publishing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── SIMULATION REPORT DASHBOARD (Part 28) ── */}
      {simulationReport && (
        <div className="space-y-6">
          {/* Severity & Critical Warning Banner (Part 44) */}
          {simulationReport.severitySummary.requiresConfirmation && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-[#F28C28]" />
                <span>High-Impact Parameter Modifications Detected</span>
              </div>
              <ul className="text-xs text-amber-800 list-disc list-inside space-y-1 pl-1">
                {simulationReport.severitySummary.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Top Summary KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Cost Active vs Draft */}
            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Active Production Cost</span>
                <span className="text-lg font-bold font-mono text-slate-900 block">
                  {formatCurrency(simulationReport.totalCost.oldCost)}
                </span>
                <span className="text-[11px] text-slate-400">Base v2.0-ACTIVE</span>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Simulated Draft Cost</span>
                <span className="text-lg font-bold font-mono text-[#1B3D34] block">
                  {formatCurrency(simulationReport.totalCost.newCost)}
                </span>
                <span className="text-[11px] text-slate-400">Proposed Draft State</span>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Cost Shift (Delta)</span>
                <div className="flex items-center gap-1.5">
                  {simulationReport.totalCost.delta >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className={`text-lg font-bold font-mono ${
                    simulationReport.totalCost.delta >= 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {simulationReport.totalCost.delta >= 0 ? '+' : ''}
                    {formatCurrency(simulationReport.totalCost.delta)}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {simulationReport.totalCost.percentChange >= 0 ? '+' : ''}
                  {simulationReport.totalCost.percentChange}% variance
                </span>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Affected BOQ Lines</span>
                <span className="text-lg font-bold font-mono text-slate-800 block">
                  {simulationReport.affectedBOQLines.length} items
                </span>
                <span className="text-[11px] text-slate-400">
                  Across {simulationReport.changedParameters.length} modified inputs
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Key Physical Metric Deltas */}
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Physical Quantity Impact Analysis
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {simulationReport.keyMetrics.map((m) => (
                  <div key={m.metricKey} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block truncate">{m.name}</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-mono text-slate-500">
                        {m.oldValue.toFixed(1)} {m.unit}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-bold font-mono text-[#1B3D34]">
                        {m.newValue.toFixed(1)} {m.unit}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono block ${
                      m.delta === 0 ? 'text-slate-400' : m.delta > 0 ? 'text-amber-700' : 'text-emerald-700'
                    }`}>
                      {m.delta > 0 ? `+${m.delta.toFixed(1)}` : m.delta.toFixed(1)} {m.unit} ({m.percentChange > 0 ? '+' : ''}{m.percentChange}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Affected BOQ Schedule Lines */}
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Shifted Bill of Quantities (BOQ) Lines
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">BOQ Description</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5 text-right">Old Qty</th>
                      <th className="p-2.5 text-right">New Qty</th>
                      <th className="p-2.5 text-right">Old Total</th>
                      <th className="p-2.5 text-right">New Total</th>
                      <th className="p-2.5 text-right">Cost Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {simulationReport.affectedBOQLines.map((line) => (
                      <tr key={line.lineId} className="hover:bg-slate-50/70">
                        <td className="p-2.5 font-sans font-medium text-slate-800">
                          {line.title}
                        </td>
                        <td className="p-2.5 text-[10px] text-slate-500 font-sans">
                          {line.category}
                        </td>
                        <td className="p-2.5 text-right text-slate-500">
                          {line.oldQuantity} {line.unit}
                        </td>
                        <td className="p-2.5 text-right font-bold text-[#1B3D34]">
                          {line.newQuantity} {line.unit}
                        </td>
                        <td className="p-2.5 text-right text-slate-500">
                          {formatCurrency(line.oldTotal)}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          {formatCurrency(line.newTotal)}
                        </td>
                        <td className={`p-2.5 text-right font-bold ${
                          line.costDelta >= 0 ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                          {line.costDelta >= 0 ? '+' : ''}{formatCurrency(line.costDelta)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── PUBLISH CONFIRMATION MODAL (Part 27 & 49) ── */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Production Deployment
              </span>
              <h3 className="text-lg font-bold text-slate-900 font-heading mt-2">
                Publish Draft Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Activating this configuration immediately updates the calculation engine for all public users. Historical estimates remain strictly snapshotted.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Change Summary / Reason (Mandatory for Audit Trail)
              </label>
              <textarea
                value={publishSummary}
                onChange={(e) => setPublishSummary(e.target.value)}
                placeholder="e.g. Updated standard wall height to 10.5ft and adjusted AAC block wastage."
                rows={3}
                className="w-full p-2.5 text-xs text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3D34]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPublishConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button
                type="button"
                onClick={handlePublish}
                isLoading={isPublishingConfig}
                className="px-4 py-2 text-xs font-bold bg-[#1B3D34] hover:bg-[#142E27] text-white rounded-xl"
              >
                Confirm & Publish LIVE
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
