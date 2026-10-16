// ============================================================
// ADMIN CONTROL CENTER — PLOT SETBACKS SECTION (V2)
// Authoritative municipal plot-area setback rule manager,
// boundary-specific configurator, and canonical simulation workstation.
//
// Referenced Sources:
// - Karnataka Gazette amendment dated 5 January 2026 (Summary for Residential up to 12m)
// - GBA_Setback_Rules_Feet_Reference.pdf
//
// Invariant Scope: Residential buildings up to G+4 (≤ 12m / ~39.37 ft).
// Height-based taller building tables are explicitly excluded by design.
// ============================================================

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import {
  PlotSetbackRule,
  SetbackMethod,
  VerificationStatus,
  BoundaryRequirement,
} from '../../../calculation-engine/data/authorityRules/types';
import { GBA_2026_SETBACK_RULES } from '../../../calculation-engine/data/authorityRules/gbaRules';
import { evaluatePlotSetbacks } from '../../../calculation-engine/data/authorityRules';
import {
  Building,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  RotateCcw,
  Plus,
  Copy,
  Trash2,
  Edit3,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  HelpCircle,
  Eye,
  Compass,
  CornerDownRight,
  Maximize2,
  FileText,
} from 'lucide-react';

export const PlotSetbacksSection: React.FC = () => {
  const {
    adminViewMode,
    draftParameters,
    updateDraftParameter,
    saveDraftToBackend,
    publishDraftConfig,
    resetDraftParameters,
    isSavingDraft,
    isPublishingConfig,
    activeConfigVersion,
  } = useAdminStore();

  // Active / Published rules from canonical configuration
  const activeRules: PlotSetbackRule[] = useMemo(() => {
    return GBA_2026_SETBACK_RULES;
  }, []);

  // Draft rules from draftParameters or falling back to activeRules
  const currentRules: PlotSetbackRule[] = useMemo(() => {
    const draft = draftParameters['config.setbacks.rules'];
    if (Array.isArray(draft) && draft.length > 0) {
      return draft;
    }
    return activeRules;
  }, [draftParameters, activeRules]);

  const hasDraftChanges = draftParameters['config.setbacks.rules'] !== undefined;

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('ALL');

  // Modal / Editing state
  const [editingRule, setEditingRule] = useState<PlotSetbackRule | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Test Simulation State (Section 6)
  const [testLength, setTestLength] = useState(40);
  const [testWidth, setTestWidth] = useState(30);
  const [testRoadWidth, setTestRoadWidth] = useState(30);
  const [testRoadFacingBoundaries, setTestRoadFacingBoundaries] = useState<Array<'front' | 'rear' | 'left' | 'right'>>(['front']);
  const [testIsCornerPlot, setTestIsCornerPlot] = useState(false);
  const [testRoadWideningFt, setTestRoadWideningFt] = useState(0);
  const [testPrescribedBuildingLineFt, setTestPrescribedBuildingLineFt] = useState(0);
  const [testCustomFront, setTestCustomFront] = useState<number | null>(null);
  const [testCustomRear, setTestCustomRear] = useState<number | null>(null);
  const [testCustomLeft, setTestCustomLeft] = useState<number | null>(null);
  const [testCustomRight, setTestCustomRight] = useState<number | null>(null);
  const [testOverrideReason, setTestOverrideReason] = useState('');

  // Common Regression Plot Sizes from the Gazette & Reference Rules
  const commonPresets = [
    { label: '20 × 30 ft', l: 30, w: 20, area: 600, tag: 'Micro Plot' },
    { label: '30 × 40 ft', l: 40, w: 30, area: 1200, tag: 'Standard Bangalore' },
    { label: '40 × 30 ft (Wide Frontage)', l: 30, w: 40, area: 1200, tag: 'Wide Frontage' },
    { label: '30 × 50 ft', l: 50, w: 30, area: 1500, tag: 'Standard Bangalore' },
    { label: '40 × 60 ft', l: 60, w: 40, area: 2400, tag: 'Medium Villa' },
    { label: '50 × 80 ft', l: 80, w: 50, area: 4000, tag: 'Large Residence' },
    { label: '60 × 80 ft', l: 80, w: 60, area: 4800, tag: 'Large Residence' },
  ];

  // Helper to commit updated rules array to draftParameters
  const commitRulesUpdate = (updated: PlotSetbackRule[]) => {
    updateDraftParameter('config.setbacks.rules', updated);
  };

  // Rule CRUD Actions
  const handleToggleRuleActive = (ruleId: string) => {
    const updated = currentRules.map((r) =>
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r
    );
    commitRulesUpdate(updated);
  };

  const handleDuplicateRule = (ruleId: string) => {
    const existing = currentRules.find((r) => r.id === ruleId);
    if (!existing) return;
    const duplicated: PlotSetbackRule = {
      ...existing,
      id: `${existing.id}-COPY-${Date.now().toString().slice(-4)}`,
      name: `${existing.name} (Copy)`,
      precedence: (existing.precedence || 10) + 1,
      adminNotes: `Duplicated from ${existing.name}`,
    };
    commitRulesUpdate([...currentRules, duplicated]);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this setback rule from the draft?')) return;
    const updated = currentRules.filter((r) => r.id !== ruleId);
    commitRulesUpdate(updated);
  };

  const handleSaveRuleForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    if (isCreatingNew) {
      commitRulesUpdate([...currentRules, editingRule]);
    } else {
      const updated = currentRules.map((r) => (r.id === editingRule.id ? editingRule : r));
      commitRulesUpdate(updated);
    }
    setEditingRule(null);
    setIsCreatingNew(false);
  };

  const handleResetToGazetteDefaults = () => {
    if (confirm('Reset all setback rules to the Karnataka Gazette 5 Jan 2026 reference baseline?')) {
      commitRulesUpdate(GBA_2026_SETBACK_RULES);
    }
  };

  // Conflict Detection: check overlapping ranges with identical precedence
  const ruleConflicts = useMemo(() => {
    const conflicts: Array<{ rule1: string; rule2: string; message: string }> = [];
    const activeList = currentRules.filter((r) => r.isActive !== false);
    for (let i = 0; i < activeList.length; i++) {
      for (let j = i + 1; j < activeList.length; j++) {
        const r1 = activeList[i];
        const r2 = activeList[j];
        const overlaps =
          Math.max(r1.minPlotAreaSqFt, r2.minPlotAreaSqFt) <
          Math.min(r1.maxPlotAreaSqFt, r2.maxPlotAreaSqFt);
        if (overlaps && (r1.precedence || 0) === (r2.precedence || 0)) {
          conflicts.push({
            rule1: r1.name,
            rule2: r2.name,
            message: `Overlapping plot area range between '${r1.name}' and '${r2.name}' without distinct precedence.`,
          });
        }
      }
    }
    return conflicts;
  }, [currentRules]);

  // Filtered Rules List
  const filteredRules = useMemo(() => {
    return currentRules.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchJurisdiction =
        selectedJurisdiction === 'ALL' || r.jurisdiction === selectedJurisdiction;
      return matchSearch && matchJurisdiction;
    });
  }, [currentRules, searchQuery, selectedJurisdiction]);

  // ── TEST CALCULATOR SIMULATION RUN (Side-by-Side: Active vs Draft) ──
  const testCustomSetbacks = useMemo(() => {
    if (
      testCustomFront !== null ||
      testCustomRear !== null ||
      testCustomLeft !== null ||
      testCustomRight !== null
    ) {
      return {
        frontSetbackFt: testCustomFront !== null ? testCustomFront : undefined,
        rearSetbackFt: testCustomRear !== null ? testCustomRear : undefined,
        leftSetbackFt: testCustomLeft !== null ? testCustomLeft : undefined,
        rightSetbackFt: testCustomRight !== null ? testCustomRight : undefined,
      };
    }
    return undefined;
  }, [testCustomFront, testCustomRear, testCustomLeft, testCustomRight]);

  const activeSimulation = useMemo(() => {
    return evaluatePlotSetbacks({
      plotLength: testLength,
      plotWidth: testWidth,
      roadWidthFt: testRoadWidth,
      roadFacingBoundaries: testRoadFacingBoundaries,
      isCornerPlot: testIsCornerPlot,
      roadWideningFt: testRoadWideningFt,
      prescribedBuildingLineFt: testPrescribedBuildingLineFt,
      customSetbacks: testCustomSetbacks,
      rules: activeRules,
      overrideReason: testOverrideReason,
    });
  }, [
    testLength,
    testWidth,
    testRoadWidth,
    testRoadFacingBoundaries,
    testIsCornerPlot,
    testRoadWideningFt,
    testPrescribedBuildingLineFt,
    testCustomSetbacks,
    activeRules,
    testOverrideReason,
  ]);

  const draftSimulation = useMemo(() => {
    return evaluatePlotSetbacks({
      plotLength: testLength,
      plotWidth: testWidth,
      roadWidthFt: testRoadWidth,
      roadFacingBoundaries: testRoadFacingBoundaries,
      isCornerPlot: testIsCornerPlot,
      roadWideningFt: testRoadWideningFt,
      prescribedBuildingLineFt: testPrescribedBuildingLineFt,
      customSetbacks: testCustomSetbacks,
      rules: currentRules,
      overrideReason: testOverrideReason,
    });
  }, [
    testLength,
    testWidth,
    testRoadWidth,
    testRoadFacingBoundaries,
    testIsCornerPlot,
    testRoadWideningFt,
    testPrescribedBuildingLineFt,
    testCustomSetbacks,
    currentRules,
    testOverrideReason,
  ]);

  const testPlotArea = testLength * testWidth;

  return (
    <div className="space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              <Building className="w-3.5 h-3.5 text-emerald-700" />
              <span>Group 01: Project Planning</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              GBA 2026 GAZETTE REFERENCE
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
              RESIDENTIAL SCOPE: UP TO G+4 (≤ 12M)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Plot Setbacks
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Configure boundary setbacks, percentage-of-depth/width rules, and permissible buildable envelopes. Persisted to PostgreSQL under the active calculation lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          {hasDraftChanges && (
            <button
              type="button"
              onClick={() => resetDraftParameters()}
              className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
            >
              Discard Draft
            </button>
          )}
          <Button
            onClick={() => {
              setIsCreatingNew(true);
              setEditingRule({
                id: `RULE-CUSTOM-${Date.now().toString().slice(-4)}`,
                name: 'New Custom Setback Rule',
                authority: 'Bengaluru / Greater Bengaluru',
                jurisdiction: 'Bangalore',
                sourceDocument: 'Municipal Planning Guidelines',
                sourceDate: new Date().toISOString().slice(0, 10),
                verificationStatus: 'AWAITING_REVIEW',
                minPlotAreaSqFt: 1000,
                maxPlotAreaSqFt: 2000,
                isMinInclusive: true,
                isMaxInclusive: true,
                front: { method: 'FIXED_DISTANCE', value: 3.0, unit: 'ft', description: '3.0 ft front clearance' },
                rear: { method: 'FIXED_DISTANCE', value: 2.5, unit: 'ft', description: '2.5 ft rear clearance' },
                left: { method: 'FIXED_DISTANCE', value: 2.5, unit: 'ft', description: '2.5 ft left clearance' },
                right: { method: 'FIXED_DISTANCE', value: 0.0, unit: 'ft', description: '0 ft attached' },
                sideConditionNote: 'one_side',
                maxGroundCoveragePct: 70,
                maxBuildingHeightM: 12,
                maxFloorsAllowed: 4,
                precedence: 10,
                isActive: true,
                adminNotes: 'Admin configured custom setback rule',
              });
            }}
            className="bg-[#1B3D34] hover:bg-[#142E27] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Setback Rule</span>
          </Button>
        </div>
      </div>

      {/* ── RULE CONFLICT / OVERLAP WARNING ── */}
      {ruleConflicts.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-2xl text-xs text-red-900 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Configuration Conflict Detected — Publishing Blocked</span>
          </div>
          {ruleConflicts.map((c, i) => (
            <p key={i} className="pl-6 text-[11px] font-mono text-red-700">
              • {c.message}
            </p>
          ))}
          <p className="pl-6 text-[10px] text-red-600 pt-1">
            Adjust plot area ranges or assign explicit precedence (higher number wins) before publishing to production.
          </p>
        </div>
      )}

      {/* ── STATUTORY & SCOPE NOTICE ── */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-emerald-900">
          <Info className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Statutory Authority Invariants & Product Scope</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700 text-[11px] leading-relaxed">
          <div>
            <strong className="text-emerald-800 font-semibold block mb-0.5">✓ Scope: Residential up to G+4 (≤ 12m)</strong>
            Based on the Karnataka Gazette amendment dated 5 January 2026. Medium &amp; large plots (1,615 to 43,056 sq.ft) apply depth-based front/rear percentages and width-based side percentages.
          </div>
          <div>
            <strong className="text-slate-700 font-semibold block mb-0.5">✗ Height-Based Tables Excluded</strong>
            Section 3 of the reference document (*Taller buildings — preliminary height-based guide*) is intentionally excluded. Commercial/multi-storey height engines are outside residential G+4 scope.
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════ */}
      {/* SECTION 6: TEST SETBACK RULES WORKFLOW (INTERACTIVE PANEL) */}
      {/* ═════════════════════════════════════════════════════════ */}
      <Card className="border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs border border-emerald-500/30">
              06
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Test Setback Rules &amp; Geometry Simulator</h3>
              <p className="text-[11px] text-slate-400">
                Simulate real plot dimensions side-by-side: Active Configuration vs Draft Configuration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-slate-800 px-2.5 py-1 rounded-md text-slate-300 border border-slate-700">
              Real Engine Evaluation
            </span>
          </div>
        </div>

        <CardContent className="p-5 space-y-6">
          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>Quick Preset Regression Fixtures (Gazette Summary Section 2):</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {commonPresets.map((preset) => {
                const isSelected = testLength === preset.l && testWidth === preset.w;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setTestLength(preset.l);
                      setTestWidth(preset.w);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {preset.area} sq.ft
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimension Controls & Conditions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            {/* Width (Frontage) */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Plot Width (Frontage)</span>
                <span className="font-mono text-[#1B3D34]">{testWidth} ft</span>
              </label>
              <input
                type="number"
                value={testWidth}
                onChange={(e) => setTestWidth(Math.max(1, parseFloat(e.target.value) || 0))}
                min="10"
                max="500"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-[#1B3D34]"
              />
            </div>

            {/* Depth / Length */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Plot Depth / Length</span>
                <span className="font-mono text-[#1B3D34]">{testLength} ft</span>
              </label>
              <input
                type="number"
                value={testLength}
                onChange={(e) => setTestLength(Math.max(1, parseFloat(e.target.value) || 0))}
                min="10"
                max="500"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-[#1B3D34]"
              />
            </div>

            {/* Road Width */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Road Width</span>
                <span className="font-mono text-slate-500">{testRoadWidth} ft</span>
              </label>
              <select
                value={testRoadWidth}
                onChange={(e) => setTestRoadWidth(parseFloat(e.target.value) || 30)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs cursor-pointer"
              >
                <option value={24}>&lt; 30 ft (Narrow)</option>
                <option value={30}>30 ft (Standard 9m)</option>
                <option value={40}>40 ft (Medium 12m)</option>
                <option value={50}>50 ft+ (Arterial 15m)</option>
              </select>
            </div>

            {/* Road Widening */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Road Widening Reservation</span>
                <span className="font-mono text-amber-700">+{testRoadWideningFt} ft</span>
              </label>
              <input
                type="number"
                value={testRoadWideningFt}
                onChange={(e) => setTestRoadWideningFt(Math.max(0, parseFloat(e.target.value) || 0))}
                min="0"
                step="0.5"
                placeholder="0 ft"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs"
              />
            </div>

            {/* Prescribed Building Line */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Prescribed Building Line</span>
                <span className="font-mono text-slate-600">{testPrescribedBuildingLineFt} ft</span>
              </label>
              <input
                type="number"
                value={testPrescribedBuildingLineFt}
                onChange={(e) => setTestPrescribedBuildingLineFt(Math.max(0, parseFloat(e.target.value) || 0))}
                min="0"
                step="0.5"
                placeholder="0 ft"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs"
              />
            </div>

            {/* Corner Plot & Road Frontages */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-700 block">
                Road-Facing Boundaries (Corner Plot):
              </label>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {(['front', 'rear', 'left', 'right'] as Array<'front' | 'rear' | 'left' | 'right'>).map((b) => {
                  const isChecked = testRoadFacingBoundaries.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        if (isChecked && testRoadFacingBoundaries.length > 1) {
                          setTestRoadFacingBoundaries(testRoadFacingBoundaries.filter((x) => x !== b));
                        } else if (!isChecked) {
                          setTestRoadFacingBoundaries([...testRoadFacingBoundaries, b]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer border ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {b} Boundary {isChecked && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total Plot Area Badge */}
            <div className="flex flex-col justify-end">
              <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Calculated Site Area</span>
                <span className="text-base font-extrabold font-mono text-slate-900">
                  {testPlotArea.toLocaleString()} <span className="text-xs font-normal text-slate-500">sq.ft</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── SIDE-BY-SIDE SIMULATION RESULTS TABLE & VISUALIZER ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Footprint Preview (lg:col-span-4) */}
            <div className="lg:col-span-4 bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold flex items-center gap-1.5 text-slate-200">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Top-Down Footprint Preview</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {draftSimulation.buildableFootprintSqFt} sq.ft Buildable
                </span>
              </div>

              {/* Interactive SVG Top-Down Plot Diagram */}
              <div className="relative w-full aspect-square bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-3 overflow-hidden">
                {(() => {
                  const svgW = 280;
                  const svgH = 280;
                  const margin = 28;
                  const availW = svgW - margin * 2;
                  const availH = svgH - margin * 2;

                  // Scale plot to fit container
                  const scale = Math.min(availW / Math.max(1, testWidth), availH / Math.max(1, testLength));
                  const plotW = Math.max(20, testWidth * scale);
                  const plotH = Math.max(20, testLength * scale);
                  const plotX = (svgW - plotW) / 2;
                  const plotY = (svgH - plotH) / 2;

                  // Envelope coordinates
                  const fSet = draftSimulation.appliedFrontFt * scale;
                  const rSet = draftSimulation.appliedRearFt * scale;
                  const lSet = draftSimulation.appliedLeftFt * scale;
                  const rtSet = draftSimulation.appliedRightFt * scale;

                  const envX = plotX + lSet;
                  const envY = plotY + fSet;
                  const envW = Math.max(0, plotW - lSet - rtSet);
                  const envH = Math.max(0, plotH - fSet - rSet);

                  return (
                    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full select-none">
                      {/* Grid background */}
                      <defs>
                        <pattern id="grid" width="14" height="14" patternUnits="userSpaceOnUse">
                          <path d="M 14 0 L 0 0 0 14" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width={svgW} height={svgH} fill="url(#grid)" />

                      {/* Road boundary marker at top */}
                      <rect x={plotX - 10} y={plotY - 14} width={plotW + 20} height={10} fill="#1e3a5f" rx="3" />
                      <text x={svgW / 2} y={plotY - 6} fill="#60a5fa" fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                        MAIN ROAD FRONTAGE
                      </text>

                      {/* Optional Secondary Road Frontages for Corner Plots */}
                      {testRoadFacingBoundaries.includes('rear') && (
                        <>
                          <rect x={plotX - 10} y={plotY + plotH + 4} width={plotW + 20} height={10} fill="#1e3a5f" rx="3" />
                          <text x={svgW / 2} y={plotY + plotH + 12} fill="#60a5fa" fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                            REAR ROAD
                          </text>
                        </>
                      )}
                      {testRoadFacingBoundaries.includes('left') && (
                        <>
                          <rect x={plotX - 14} y={plotY - 10} width={10} height={plotH + 20} fill="#1e3a5f" rx="3" />
                          <text x={plotX - 9} y={plotY + plotH / 2} fill="#60a5fa" fontSize="6" fontWeight="bold" textAnchor="middle" transform={`rotate(-90 ${plotX - 9} ${plotY + plotH / 2})`}>
                            SIDE ROAD (L)
                          </text>
                        </>
                      )}
                      {testRoadFacingBoundaries.includes('right') && (
                        <>
                          <rect x={plotX + plotW + 4} y={plotY - 10} width={10} height={plotH + 20} fill="#1e3a5f" rx="3" />
                          <text x={plotX + plotW + 9} y={plotY + plotH / 2} fill="#60a5fa" fontSize="6" fontWeight="bold" textAnchor="middle" transform={`rotate(90 ${plotX + plotW + 9} ${plotY + plotH / 2})`}>
                            SIDE ROAD (R)
                          </text>
                        </>
                      )}

                      {/* Site Plot Boundary */}
                      <rect
                        x={plotX}
                        y={plotY}
                        width={plotW}
                        height={plotH}
                        fill="#0f172a"
                        stroke="#475569"
                        strokeWidth="1.5"
                        strokeDasharray="3 2"
                        rx="2"
                      />

                      {/* Setback Clearance Buffer Area (Light hatched overlay) */}
                      <rect
                        x={plotX}
                        y={plotY}
                        width={plotW}
                        height={plotH}
                        fill="#334155"
                        opacity="0.35"
                      />

                      {/* Buildable Footprint Envelope */}
                      {envW > 0 && envH > 0 && (
                        <rect
                          x={envX}
                          y={envY}
                          width={envW}
                          height={envH}
                          fill="#059669"
                          fillOpacity="0.45"
                          stroke="#10b981"
                          strokeWidth="2"
                          rx="3"
                        />
                      )}

                      {/* Dimension Labels */}
                      {/* Front Setback */}
                      <text x={plotX + plotW / 2} y={plotY + Math.max(10, fSet / 2 + 3)} fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">
                        F: {draftSimulation.appliedFrontFt.toFixed(1)}'
                      </text>

                      {/* Rear Setback */}
                      <text x={plotX + plotW / 2} y={plotY + plotH - Math.max(4, rSet / 2)} fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">
                        R: {draftSimulation.appliedRearFt.toFixed(1)}'
                      </text>

                      {/* Left Setback */}
                      <text x={plotX + Math.max(3, lSet / 2)} y={plotY + plotH / 2} fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">
                        L: {draftSimulation.appliedLeftFt.toFixed(1)}'
                      </text>

                      {/* Right Setback */}
                      <text x={plotX + plotW - Math.max(3, rtSet / 2)} y={plotY + plotH / 2} fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">
                        R: {draftSimulation.appliedRightFt.toFixed(1)}'
                      </text>

                      {/* Envelope Center Label */}
                      {envW > 25 && envH > 25 && (
                        <text x={envX + envW / 2} y={envY + envH / 2 + 2} fill="#ecfdf5" fontSize="8" fontWeight="bold" textAnchor="middle">
                          {draftSimulation.buildableWidthFt.toFixed(1)}' W × {draftSimulation.buildableLengthFt.toFixed(1)}' D
                        </text>
                      )}
                    </svg>
                  );
                })()}
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span>Site Dimensions:</span>
                  <span className="font-mono text-slate-200">{testWidth} ft (W) × {testLength} ft (D)</span>
                </div>
                <div className="flex justify-between">
                  <span>Buildable Dimensions:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {draftSimulation.buildableWidthFt} ft (W) × {draftSimulation.buildableLengthFt} ft (D)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Coverage Ratio:</span>
                  <span className="font-mono text-slate-200">
                    {testPlotArea > 0 ? ((draftSimulation.buildableFootprintSqFt / testPlotArea) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Side-by-Side Comparison Matrix (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ── ACTIVE CONFIGURATION COLUMN ── */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Configuration</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Production Rules
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Matched Rule</span>
                    <span className="font-bold text-slate-900 block truncate">
                      {activeSimulation.matchedRule?.name || 'Default Baseline'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Range: {activeSimulation.matchedRule?.minPlotAreaSqFt} - {activeSimulation.matchedRule?.maxPlotAreaSqFt} sq.ft
                    </span>
                  </div>

                  {/* Setback Values */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Front Setback</span>
                      <span className="font-mono font-bold text-slate-900">{activeSimulation.appliedFrontFt.toFixed(2)} ft</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Rear Setback</span>
                      <span className="font-mono font-bold text-slate-900">
                        {activeSimulation.appliedRearFt > 0 ? `${activeSimulation.appliedRearFt.toFixed(2)} ft` : 'Unspecified'}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Left Side</span>
                      <span className="font-mono font-bold text-slate-900">{activeSimulation.appliedLeftFt.toFixed(2)} ft</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Right Side</span>
                      <span className="font-mono font-bold text-slate-900">{activeSimulation.appliedRightFt.toFixed(2)} ft</span>
                    </div>
                  </div>

                  {/* Output Envelope */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Buildable Envelope:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {activeSimulation.buildableWidthFt} × {activeSimulation.buildableLengthFt} ft (Width × Depth)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Footprint Area:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {activeSimulation.buildableFootprintSqFt} sq.ft
                      </span>
                    </div>
                  </div>

                  {/* Validation warnings */}
                  {activeSimulation.unresolvedReasons.length > 0 && (
                    <div className="p-2.5 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-200 space-y-0.5">
                      <span className="font-bold block">Status Note:</span>
                      {activeSimulation.unresolvedReasons.map((r, i) => (
                        <p key={i}>• {r}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── DRAFT CONFIGURATION COLUMN ── */}
                <div className="bg-emerald-50/50 border border-emerald-300 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Draft Configuration</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300 font-bold">
                      {hasDraftChanges ? 'Draft Overrides' : 'Matches Active'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-emerald-700 block text-[10px] uppercase font-bold">Matched Rule</span>
                    <span className="font-bold text-slate-900 block truncate">
                      {draftSimulation.matchedRule?.name || 'Default Baseline'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Range: {draftSimulation.matchedRule?.minPlotAreaSqFt} - {draftSimulation.matchedRule?.maxPlotAreaSqFt} sq.ft
                    </span>
                  </div>

                  {/* Setback Values with Deltas */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-white p-2 rounded-xl border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 block font-bold">Front Setback</span>
                        {draftSimulation.appliedFrontFt !== activeSimulation.appliedFrontFt && (
                          <span className="text-[10px] font-mono text-blue-600 font-bold">
                            {(draftSimulation.appliedFrontFt - activeSimulation.appliedFrontFt > 0 ? '+' : '')}
                            {(draftSimulation.appliedFrontFt - activeSimulation.appliedFrontFt).toFixed(2)}'
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-900">{draftSimulation.appliedFrontFt.toFixed(2)} ft</span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 block font-bold">Rear Setback</span>
                        {draftSimulation.appliedRearFt !== activeSimulation.appliedRearFt && (
                          <span className="text-[10px] font-mono text-blue-600 font-bold">
                            {(draftSimulation.appliedRearFt - activeSimulation.appliedRearFt > 0 ? '+' : '')}
                            {(draftSimulation.appliedRearFt - activeSimulation.appliedRearFt).toFixed(2)}'
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {draftSimulation.appliedRearFt > 0 ? `${draftSimulation.appliedRearFt.toFixed(2)} ft` : 'Unspecified'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 block font-bold">Left Side</span>
                        {draftSimulation.appliedLeftFt !== activeSimulation.appliedLeftFt && (
                          <span className="text-[10px] font-mono text-blue-600 font-bold">
                            {(draftSimulation.appliedLeftFt - activeSimulation.appliedLeftFt > 0 ? '+' : '')}
                            {(draftSimulation.appliedLeftFt - activeSimulation.appliedLeftFt).toFixed(2)}'
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-900">{draftSimulation.appliedLeftFt.toFixed(2)} ft</span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 block font-bold">Right Side</span>
                        {draftSimulation.appliedRightFt !== activeSimulation.appliedRightFt && (
                          <span className="text-[10px] font-mono text-blue-600 font-bold">
                            {(draftSimulation.appliedRightFt - activeSimulation.appliedRightFt > 0 ? '+' : '')}
                            {(draftSimulation.appliedRightFt - activeSimulation.appliedRightFt).toFixed(2)}'
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-900">{draftSimulation.appliedRightFt.toFixed(2)} ft</span>
                    </div>
                  </div>

                  {/* Output Envelope */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Buildable Envelope:</span>
                      <span className="font-mono font-bold text-emerald-900">
                        {draftSimulation.buildableWidthFt} × {draftSimulation.buildableLengthFt} ft (Width × Depth)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Footprint Area:</span>
                      <span className="font-mono font-bold text-[#1B3D34]">
                        {draftSimulation.buildableFootprintSqFt} sq.ft
                        {draftSimulation.buildableFootprintSqFt !== activeSimulation.buildableFootprintSqFt && (
                          <span className="ml-1 text-[11px] text-blue-600 font-bold">
                            ({draftSimulation.buildableFootprintSqFt - activeSimulation.buildableFootprintSqFt > 0 ? '+' : ''}
                            {draftSimulation.buildableFootprintSqFt - activeSimulation.buildableFootprintSqFt} sq.ft)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Validation warnings */}
                  {draftSimulation.unresolvedReasons.length > 0 && (
                    <div className="p-2.5 bg-amber-50 rounded-xl text-[11px] text-amber-900 border border-amber-300 space-y-0.5">
                      <span className="font-bold block flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Validation Notice:</span>
                      </span>
                      {draftSimulation.unresolvedReasons.map((r, i) => (
                        <p key={i}>• {r}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Explanatory Steps Breakdown */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Calculation Formula Explanations &amp; Substituted Values:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {draftSimulation.explanationSteps.map((step) => (
                    <div key={step.boundary} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{step.boundary} Setback ({step.method})</span>
                        <span className="font-mono font-bold text-emerald-700">{step.valueFt} ft</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">{step.substitutions}</div>
                      {step.notes && <div className="text-[10px] text-slate-400 italic">{step.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═════════════════════════════════════════════════════════ */}
      {/* AREA A: SETBACK RULE LIBRARY TABLE & MANAGEMENT */}
      {/* ═════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        {/* Search, Filter & Actions Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Setback Rule Library
              </h3>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                {currentRules.length} RULES
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Editable municipal rules library. Changes are drafted locally and persisted to PostgreSQL upon saving.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rule name..."
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#1B3D34]"
            />
            <select
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
            >
              <option value="ALL">All Jurisdictions</option>
              <option value="Bangalore">Bengaluru / Greater Bengaluru</option>
              <option value="Mysore">Mysuru (MUDA)</option>
            </select>
            <button
              type="button"
              onClick={handleResetToGazetteDefaults}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1"
              title="Reset rules to Karnataka Gazette 2026 baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Baseline</span>
            </button>
          </div>
        </div>

        {/* Rules Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <th className="p-3 w-8">#</th>
                  <th className="p-3">Rule Name &amp; Jurisdiction</th>
                  <th className="p-3">Plot Area Range</th>
                  <th className="p-3">Front</th>
                  <th className="p-3">Rear</th>
                  <th className="p-3">Left Side</th>
                  <th className="p-3">Right Side</th>
                  <th className="p-3 text-center">Status / Source</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRules.map((rule, idx) => {
                  const isOverlapping = ruleConflicts.some(
                    (c) => c.rule1 === rule.name || c.rule2 === rule.name
                  );

                  return (
                    <tr
                      key={rule.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        !rule.isActive ? 'opacity-50 bg-slate-50/40' : ''
                      } ${isOverlapping ? 'bg-red-50/30' : ''}`}
                    >
                      <td className="p-3 font-mono text-[10px] text-slate-400 text-center">
                        {idx + 1}
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-900">{rule.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {rule.authority} · Max Coverage: {rule.maxGroundCoveragePct}%
                        </div>
                        {rule.sideConditionNote && (
                          <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                            {rule.sideConditionNote === 'one_side' ? '1 side only' : 'Both sides'}
                          </span>
                        )}
                      </td>

                      <td className="p-3 font-mono">
                        <span className="font-semibold text-slate-800">
                          {rule.minPlotAreaSqFt.toLocaleString()} - {rule.maxPlotAreaSqFt.toLocaleString()}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400">sq.ft</span>
                      </td>

                      {/* Front */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-slate-800">
                          {rule.front.method === 'FIXED_DISTANCE' && `${rule.front.value} ft`}
                          {rule.front.method === 'PERCENT_OF_DEPTH' && `${rule.front.value}% depth`}
                          {rule.front.method === 'MINIMUM_REQUIRED' && `Min ${rule.front.value} ft`}
                          {rule.front.method === 'UNSPECIFIED' && <span className="text-amber-700">Unspecified</span>}
                        </div>
                        <span className="text-[10px] text-slate-400 block">{rule.front.method}</span>
                      </td>

                      {/* Rear */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-slate-800">
                          {rule.rear.method === 'FIXED_DISTANCE' && `${rule.rear.value} ft`}
                          {rule.rear.method === 'PERCENT_OF_DEPTH' && `${rule.rear.value}% depth`}
                          {rule.rear.method === 'MINIMUM_REQUIRED' && `Min ${rule.rear.value} ft`}
                          {rule.rear.method === 'UNSPECIFIED' && (
                            <span className="text-amber-700 bg-amber-50 px-1 py-0.2 rounded font-semibold">
                              Review Req
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block">{rule.rear.method}</span>
                      </td>

                      {/* Left */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-slate-800">
                          {rule.left.method === 'FIXED_DISTANCE' && `${rule.left.value} ft`}
                          {rule.left.method === 'PERCENT_OF_WIDTH' && `${rule.left.value}% width`}
                          {rule.left.method === 'MINIMUM_REQUIRED' && `Min ${rule.left.value} ft`}
                          {rule.left.method === 'UNSPECIFIED' && <span className="text-amber-700">Unspecified</span>}
                        </div>
                        <span className="text-[10px] text-slate-400 block">{rule.left.method}</span>
                      </td>

                      {/* Right */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-slate-800">
                          {rule.right.method === 'FIXED_DISTANCE' && `${rule.right.value} ft`}
                          {rule.right.method === 'PERCENT_OF_WIDTH' && `${rule.right.value}% width`}
                          {rule.right.method === 'MINIMUM_REQUIRED' && `Min ${rule.right.value} ft`}
                          {rule.right.method === 'UNSPECIFIED' && <span className="text-amber-700">Unspecified</span>}
                        </div>
                        <span className="text-[10px] text-slate-400 block">{rule.right.method}</span>
                      </td>

                      {/* Status / Verification */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rule.verificationStatus === 'INDEPENDENTLY_VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rule.verificationStatus === 'OFFICIAL_GAZETTE_PENDING_CONFIRMATION'
                              ? 'bg-blue-100 text-blue-800'
                              : rule.verificationStatus === 'MANUAL_OVERRIDE'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rule.verificationStatus === 'OFFICIAL_GAZETTE_PENDING_CONFIRMATION'
                            ? 'Gazette 2026'
                            : rule.verificationStatus}
                        </span>
                        <div className="text-[9px] text-slate-400 truncate max-w-[130px] mx-auto mt-0.5">
                          {rule.sourceDocument}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRule(rule);
                              setIsCreatingNew(false);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                            title="Edit rule parameters"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicateRule(rule.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                            title="Duplicate rule"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleRuleActive(rule.id)}
                            className={`p-1.5 rounded-lg cursor-pointer ${
                              rule.isActive
                                ? 'text-emerald-700 hover:bg-emerald-50'
                                : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title={rule.isActive ? 'Deactivate rule' : 'Activate rule'}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            title="Delete rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════ */}
      {/* MODAL: EDIT / CREATE SETBACK RULE (AREAS B, C, D) */}
      {/* ═════════════════════════════════════════════════════════ */}
      {editingRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  {isCreatingNew ? 'Create New Setback Rule' : `Edit Setback Rule: ${editingRule.name}`}
                </h3>
                <span className="text-[11px] font-mono text-slate-400">{editingRule.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRuleForm} className="space-y-4 text-xs">
              {/* Rule Identity & Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rule Name</label>
                  <input
                    type="text"
                    value={editingRule.name}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jurisdiction / Authority</label>
                  <input
                    type="text"
                    value={editingRule.authority}
                    onChange={(e) => setEditingRule({ ...editingRule, authority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Area Range */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Plot Area (sq.ft)</label>
                  <input
                    type="number"
                    value={editingRule.minPlotAreaSqFt}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, minPlotAreaSqFt: parseFloat(e.target.value) || 0 })
                    }
                    min="0"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Plot Area (sq.ft)</label>
                  <input
                    type="number"
                    value={editingRule.maxPlotAreaSqFt}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, maxPlotAreaSqFt: parseFloat(e.target.value) || 0 })
                    }
                    min="1"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Coverage %</label>
                  <input
                    type="number"
                    value={editingRule.maxGroundCoveragePct || 70}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, maxGroundCoveragePct: parseFloat(e.target.value) || 70 })
                    }
                    min="30"
                    max="90"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precedence</label>
                  <input
                    type="number"
                    value={editingRule.precedence || 10}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, precedence: parseInt(e.target.value) || 10 })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono"
                    title="Higher precedence resolves overlapping plot area ranges"
                  />
                </div>
              </div>

              {/* ── BOUNDARY CALCULATIONS (FRONT, REAR, LEFT, RIGHT) ── */}
              <div className="space-y-3">
                <span className="font-bold text-slate-800 block text-xs">
                  Boundary Requirements (Front, Rear, Left, Right):
                </span>

                {(['front', 'rear', 'left', 'right'] as Array<'front' | 'rear' | 'left' | 'right'>).map((b) => {
                  const req = editingRule[b] as BoundaryRequirement;

                  return (
                    <div key={b} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 capitalize text-xs">{b} Setback</span>
                        <select
                          value={req.method}
                          onChange={(e) => {
                            const newMethod = e.target.value as SetbackMethod;
                            const isPct = newMethod === 'PERCENT_OF_DEPTH' || newMethod === 'PERCENT_OF_WIDTH';
                            setEditingRule({
                              ...editingRule,
                              [b]: {
                                ...req,
                                method: newMethod,
                                unit: isPct ? '%' : (newMethod === 'UNSPECIFIED' ? 'none' : 'ft'),
                                value: newMethod === 'UNSPECIFIED' ? undefined : (req.value || (isPct ? 8 : 2.5)),
                              },
                            });
                          }}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs cursor-pointer font-medium"
                        >
                          <option value="FIXED_DISTANCE">Fixed Distance (ft)</option>
                          <option value="PERCENT_OF_DEPTH">% of Plot Depth</option>
                          <option value="PERCENT_OF_WIDTH">% of Plot Width</option>
                          <option value="MINIMUM_REQUIRED">Minimum Required (ft)</option>
                          <option value="UNSPECIFIED">Not Specified / Requires Review</option>
                        </select>
                      </div>

                      {req.method !== 'UNSPECIFIED' ? (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                              {req.method === 'PERCENT_OF_DEPTH' || req.method === 'PERCENT_OF_WIDTH'
                                ? 'Percentage (%)'
                                : 'Distance (ft)'}
                            </label>
                            <input
                              type="number"
                              value={req.value || 0}
                              onChange={(e) =>
                                setEditingRule({
                                  ...editingRule,
                                  [b]: { ...req, value: parseFloat(e.target.value) || 0 },
                                })
                              }
                              step="0.01"
                              min="0"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Description Note</label>
                            <input
                              type="text"
                              value={req.description || ''}
                              onChange={(e) =>
                                setEditingRule({
                                  ...editingRule,
                                  [b]: { ...req, description: e.target.value },
                                })
                              }
                              placeholder="e.g. 12% of plot depth"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-200">
                          Boundary requirement will be flagged as unresolved. Authoritative buildable area will require plan sanction verification.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Side Clearance Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Side Clearance Condition</label>
                  <select
                    value={editingRule.sideConditionNote || 'both_sides'}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        sideConditionNote: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <option value="both_sides">Both Sides (Each Side Required)</option>
                    <option value="one_side">One Side Only (e.g. 2.30 ft on 1 side)</option>
                    <option value="all_sides">All Sides (Estates Standard)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Verification Status</label>
                  <select
                    value={editingRule.verificationStatus}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        verificationStatus: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <option value="OFFICIAL_GAZETTE_PENDING_CONFIRMATION">Official Gazette (Pending Confirmation)</option>
                    <option value="INDEPENDENTLY_VERIFIED">Independently Verified</option>
                    <option value="AWAITING_REVIEW">Awaiting Review</option>
                    <option value="MANUAL_OVERRIDE">Manual Override</option>
                  </select>
                </div>
              </div>

              {/* Source Reference & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Source Document</label>
                  <input
                    type="text"
                    value={editingRule.sourceDocument}
                    onChange={(e) => setEditingRule({ ...editingRule, sourceDocument: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Administrator Notes</label>
                  <input
                    type="text"
                    value={editingRule.adminNotes || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, adminNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" className="bg-[#1B3D34] text-white px-5 py-2 rounded-xl font-bold">
                  {isCreatingNew ? 'Create Rule in Draft' : 'Save Rule to Draft'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
