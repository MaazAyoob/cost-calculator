// ============================================================
// ADMIN CONTROL CENTER — VERSION HISTORY & HEALTH TAB
// Parts 27, 30, 38, 39, 45 — Immutable Versioning & Health
// ============================================================

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Upload,
  Calendar,
  User,
  Shield,
  FileCode,
  Sparkles
} from 'lucide-react';

export const VersionHistoryTab: React.FC = () => {
  const {
    configVersions,
    activeConfigVersion,
    fetchConfigVersions,
    rollbackConfigVersion,
    configHealth,
    updateDraftParameter
  } = useAdminStore();

  const [selectedVersionForRollback, setSelectedVersionForRollback] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchConfigVersions();
  }, [fetchConfigVersions]);

  const handleRollbackConfirm = async () => {
    if (selectedVersionForRollback === null) return;
    await rollbackConfigVersion(selectedVersionForRollback);
    setSelectedVersionForRollback(null);
  };

  const handleExportJson = () => {
    setIsExporting(true);
    const data = {
      exportDate: new Date().toISOString(),
      activeVersion: activeConfigVersion,
      versions: configVersions
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hutty_configuration_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
            <History className="w-5 h-5 text-[#1B3D34]" />
            Configuration Version History & System Health
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable version catalog, rollback controls, configuration health diagnostics, and JSON import/export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleExportJson}
            disabled={isExporting}
            className="px-3.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Config JSON</span>
          </Button>
        </div>
      </div>

      {/* ── CONFIGURATION HEALTH DASHBOARD (Part 45) ── */}
      <Card className="border border-slate-200 bg-white">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#1B3D34]" />
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Configuration Health Diagnostic
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              configHealth.status === 'HEALTHY'
                ? 'bg-emerald-100 text-emerald-800'
                : configHealth.status === 'WARNINGS'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {configHealth.status}
            </span>
          </div>

          {configHealth.conflicts.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                Detected Baseline Conflicts Awaiting Administrative Clarification:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {configHealth.conflicts.map((c) => (
                  <div key={c.key} className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono font-bold text-amber-900 text-[11px]">
                      <span>{c.key}</span>
                      <span className="text-[10px] text-amber-700 bg-amber-200/50 px-1.5 rounded">
                        {c.values}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      {c.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── VERSIONS CATALOG (Part 27 & 39) ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 font-heading">
          Published Configuration Versions
        </h3>

        <div className="space-y-2.5">
          {configVersions.map((v: any) => {
            const isActive = v.status === 'ACTIVE' || activeConfigVersion?.id === v.id;

            return (
              <Card
                key={v.id}
                className={`border transition-all ${
                  isActive ? 'border-[#1B3D34] bg-emerald-50/20 shadow-xs' : 'border-slate-200 bg-white'
                }`}
              >
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-slate-900">
                        {v.versionLabel || `v2.${v.versionNumber}`}
                      </span>
                      {isActive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1B3D34] text-white">
                          PRODUCTION / ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                          ARCHIVED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      {v.changeSummary || 'Approved production baseline configuration'}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {v.publishedBy || 'System Architect'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString() : 'Baseline'}
                      </span>
                      <span>{v.parameterCount || 68} parameters snapshot</span>
                    </div>
                  </div>

                  {!isActive && (
                    <Button
                      type="button"
                      onClick={() => setSelectedVersionForRollback(v.versionNumber)}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rollback to this Version</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── ROLLBACK CONFIRMATION MODAL (Part 39) ── */}
      {selectedVersionForRollback !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Safe Rollback Operation
              </span>
              <h3 className="text-lg font-bold text-slate-900 font-heading mt-2">
                Rollback to Version #{selectedVersionForRollback}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This action creates a <strong>NEW</strong> active version containing the parameters of version #{selectedVersionForRollback}. Old versions remain completely immutable and unmutated.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedVersionForRollback(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button
                type="button"
                onClick={handleRollbackConfirm}
                className="px-4 py-2 text-xs font-bold bg-red-700 hover:bg-red-800 text-white rounded-xl"
              >
                Confirm Rollback
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
