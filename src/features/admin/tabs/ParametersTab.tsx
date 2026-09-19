// ============================================================
// ADMIN CONTROL CENTER — CONSTRUCTION PARAMETERS TAB (Part 3 & 44)
// Central Searchable Parameter Manager with Impact Assessment
// ============================================================

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import {
  Search,
  Sliders,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Eye,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getParameterImpact } from '../../../calculation-engine/rules/impactAnalysis';

export interface ParameterItem {
  key: string;
  name: string;
  category: string;
  defaultValue: number | string;
  unit: string;
  min?: number;
  max?: number;
  location: string;
  tier: string;
  source: string;
  sourceType: 'STATUTORY' | 'PLANNING_ASSUMPTION' | 'MARKET_BENCHMARK';
  description: string;
}

export const CANONICAL_CONSTRUCTION_PARAMETERS: ParameterItem[] = [
  {
    key: 'structure.wall_height_ft',
    name: 'Standard Wall Height',
    category: 'STRUCTURE',
    defaultValue: 10.0,
    unit: 'ft',
    min: 9.0,
    max: 14.0,
    location: 'ALL',
    tier: 'ALL',
    source: 'National Building Code (NBC) 2016 Part 3',
    sourceType: 'STATUTORY',
    description: 'Finished floor-to-ceiling vertical clearance determining wall masonry and plaster geometry.'
  },
  {
    key: 'structure.super_builtup_factor',
    name: 'Super Built-up Area Factor',
    category: 'STRUCTURE',
    defaultValue: 1.15,
    unit: 'ratio',
    min: 1.05,
    max: 1.30,
    location: 'ALL',
    tier: 'ALL',
    source: 'CREDAI Karnataka Residential Benchmarks',
    sourceType: 'PLANNING_ASSUMPTION',
    description: 'Multiplier converting Carpet/Plinth area to Super Built-up Area accounting for common walls and ducting.'
  },
  {
    key: 'rcc.steel_base_factor_kg_sqft',
    name: 'Steel Base Factor (Ground)',
    category: 'RCC',
    defaultValue: 2.80,
    unit: 'kg/sqft',
    min: 2.2,
    max: 4.5,
    location: 'ALL',
    tier: 'ALL',
    source: 'IS 456:2000 Plain and Reinforced Concrete',
    sourceType: 'STATUTORY',
    description: 'Baseline reinforcement steel allocation per square foot of built-up area for ground floor.'
  },
  {
    key: 'rcc.steel_floor_increment_kg_sqft',
    name: 'Steel Upper Floor Increment',
    category: 'RCC',
    defaultValue: 0.20,
    unit: 'kg/sqft/floor',
    min: 0.1,
    max: 0.5,
    location: 'ALL',
    tier: 'ALL',
    source: 'Standard Structural Design Practice',
    sourceType: 'PLANNING_ASSUMPTION',
    description: 'Incremental steel required per upper floor due to column load accumulation and seismic drift.'
  },
  {
    key: 'rcc.cement_factor_bags_sqft',
    name: 'Cement Overall Factor',
    category: 'RCC',
    defaultValue: 0.40,
    unit: 'bags/sqft',
    min: 0.32,
    max: 0.55,
    location: 'ALL',
    tier: 'ALL',
    source: 'CPWD Works Manual / IS 10262 Concrete Mix Design',
    sourceType: 'STATUTORY',
    description: 'Total structural cement bags per sqft of built-up area for foundation, columns, slabs, and mortar.'
  },
  {
    key: 'rcc.m_sand_factor_cft_sqft',
    name: 'M-Sand Structural Factor',
    category: 'RCC',
    defaultValue: 0.60,
    unit: 'CFT/sqft',
    min: 0.45,
    max: 0.85,
    location: 'ALL',
    tier: 'ALL',
    source: 'Karnataka PWD Specifications',
    sourceType: 'PLANNING_ASSUMPTION',
    description: 'Manufactured sand consumed per sqft for concrete works and masonry mortar.'
  },
  {
    key: 'rcc.p_sand_factor_cft_sqft',
    name: 'P-Sand Plastering Factor',
    category: 'RCC',
    defaultValue: 0.60,
    unit: 'CFT/sqft',
    min: 0.45,
    max: 0.85,
    location: 'ALL',
    tier: 'ALL',
    source: 'Karnataka PWD Specifications',
    sourceType: 'PLANNING_ASSUMPTION',
    description: 'Plaster sand consumed per sqft for 2-coat internal and external wall plastering.'
  },
  {
    key: 'rcc.aggregate_factor_cft_sqft',
    name: 'Coarse Aggregate (20mm) Factor',
    category: 'RCC',
    defaultValue: 1.35,
    unit: 'CFT/sqft',
    min: 1.0,
    max: 1.8,
    location: 'ALL',
    tier: 'ALL',
    source: 'IS 383 Coarse Aggregates for Concrete',
    sourceType: 'STATUTORY',
    description: 'Graded 20mm and 12mm blue metal granite aggregates required per sqft of built-up area.'
  },
  {
    key: 'paint.interior_coverage_sqft_per_litre',
    name: 'Interior Paint Coverage',
    category: 'PAINT',
    defaultValue: 45.0,
    unit: 'sqft/L',
    min: 35.0,
    max: 75.0,
    location: 'ALL',
    tier: 'ALL',
    source: 'Asian Paints Technical Data Sheet (2 coats over putty)',
    sourceType: 'MARKET_BENCHMARK',
    description: 'Coverage rate for interior emulsion paint. Note: Audit identified alternate 60 sqft/L reference.'
  },
  {
    key: 'paint.interior_coats',
    name: 'Interior Paint Coats',
    category: 'PAINT',
    defaultValue: 2,
    unit: 'coats',
    min: 1,
    max: 3,
    location: 'ALL',
    tier: 'ALL',
    source: 'Hutty Finishes Standard',
    sourceType: 'PLANNING_ASSUMPTION',
    description: 'Number of coats of premium acrylic emulsion applied on internal plastered surfaces.'
  },
  {
    key: 'flooring.tile_wastage_percent',
    name: 'Flooring Tile Wastage Allowance',
    category: 'FLOORING',
    defaultValue: 8.0,
    unit: '%',
    min: 5.0,
    max: 15.0,
    location: 'ALL',
    tier: 'ALL',
    source: 'Indian Ceramic Society Tiling Standards',
    sourceType: 'PLANNING_ASSUMPTION',
    description: 'Allowance for corner cuts, border diagonal cuts, transport breakage, and room shape offsets.'
  },
  {
    key: 'commercial.contractor_margin_percent',
    name: 'Contractor Commercial Margin',
    category: 'COMMERCIAL',
    defaultValue: 15.0,
    unit: '%',
    min: 5.0,
    max: 25.0,
    location: 'ALL',
    tier: 'ALL',
    source: 'Contractor Turnkey Agreement Benchmarks',
    sourceType: 'PLANNING_ASSUMPTION',
    description: 'Contractor overhead and net profit margin in Turnkey mode. Self-build mode defaults to 0%.'
  },
  {
    key: 'commercial.contingency_percent',
    name: 'Contingency Reserve',
    category: 'COMMERCIAL',
    defaultValue: 3.0,
    unit: '%',
    min: 0.0,
    max: 10.0,
    location: 'ALL',
    tier: 'ALL',
    source: 'Project Finance Guidelines',
    sourceType: 'PLANNING_ASSUMPTION',
    description: 'Buffer provision for unforeseen soil condition variations, design enhancements, or material price drift.'
  },
  {
    key: 'commercial.gst_percent',
    name: 'Works Contract GST',
    category: 'COMMERCIAL',
    defaultValue: 18.0,
    unit: '%',
    min: 0.0,
    max: 28.0,
    location: 'ALL',
    tier: 'ALL',
    source: 'GST Council Notification on Works Contracts (Residential)',
    sourceType: 'STATUTORY',
    description: 'Statutory GST applicable on commercial construction contracts.'
  },
  {
    key: 'waterproofing.bathroom_upturn_height_mm',
    name: 'Bathroom Waterproofing Upturn',
    category: 'WATERPROOFING',
    defaultValue: 300,
    unit: 'mm',
    min: 150,
    max: 600,
    location: 'ALL',
    tier: 'ALL',
    source: 'Fosroc Waterproofing Architectural Guide',
    sourceType: 'PLANNING_ASSUMPTION',
    description: 'Vertical skirting barrier along perimeter bathroom brick walls to prevent capillary dampness.'
  }
];

export const ParametersTab: React.FC = () => {
  const {
    draftParameters,
    updateDraftParameter,
    activeConfigVersion
  } = useAdminStore();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [editingParam, setEditingParam] = useState<ParameterItem | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set<string>();
    CANONICAL_CONSTRUCTION_PARAMETERS.forEach((p) => cats.add(p.category));
    return ['ALL', ...Array.from(cats)];
  }, []);

  // Filtered parameters
  const filteredParams = useMemo(() => {
    return CANONICAL_CONSTRUCTION_PARAMETERS.filter((p) => {
      if (selectedCat !== 'ALL' && p.category !== selectedCat) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesKey = p.key.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesKey && !matchesDesc) return false;
      }
      return true;
    });
  }, [search, selectedCat]);

  const handleEditClick = (param: ParameterItem) => {
    const currentEffective = draftParameters[param.key] !== undefined
      ? draftParameters[param.key]
      : param.defaultValue;
    setEditingParam(param);
    setTempValue(String(currentEffective));
  };

  const handleSaveParam = () => {
    if (!editingParam) return;
    const num = Number(tempValue);
    const impact = getParameterImpact(editingParam.key);

    if (impact.severity === 'CRITICAL' && !showWarningModal) {
      setShowWarningModal(true);
      return;
    }

    updateDraftParameter(editingParam.key, isNaN(num) ? tempValue : num);
    setShowWarningModal(false);
    setEditingParam(null);
  };

  const handleRevertParam = (key: string) => {
    const next = { ...draftParameters };
    delete next[key];
    // update store
    updateDraftParameter(key, undefined);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER & SEARCH ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#1B3D34]" />
            Central Construction Parameters
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Client-controlled calculation factors, wastage percentages, and physical dimensional rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search parameter (e.g. wall height, steel)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3D34]"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── DRAFT ACTIVE NOTICE ── */}
      {Object.keys(draftParameters).length > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F28C28] shrink-0" />
            <span>
              <strong>{Object.keys(draftParameters).length} parameters</strong> have unsaved draft modifications.
              Run simulation before publishing to production.
            </span>
          </div>
          <span className="font-mono font-bold text-[11px] bg-amber-200/60 px-2 py-0.5 rounded-md">
            DRAFT NOT LIVE
          </span>
        </div>
      )}

      {/* ── PARAMETER CARDS / TABLE ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredParams.map((param) => {
          const isOverridden = draftParameters[param.key] !== undefined;
          const effectiveVal = isOverridden ? draftParameters[param.key] : param.defaultValue;
          const impact = getParameterImpact(param.key, param.name, param.category);

          return (
            <Card
              key={param.key}
              className={`border transition-all ${
                isOverridden ? 'border-[#F28C28] bg-amber-50/20' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-heading">
                        {param.name}
                      </span>
                      {impact.severity === 'CRITICAL' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                          CRITICAL
                        </span>
                      )}
                      {isOverridden && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-[#F28C28] border border-amber-300">
                          DRAFT
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                      {param.key}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-[#1B3D34]">
                      {effectiveVal}
                    </span>
                    <span className="text-xs text-slate-500 ml-1 font-medium">
                      {param.unit}
                    </span>
                    {isOverridden && (
                      <span className="text-[10px] text-slate-400 block line-through">
                        prod: {param.defaultValue} {param.unit}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {param.description}
                </p>

                {/* Impact Summary */}
                <div className="pt-2 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-600">
                      {param.sourceType}
                    </span>
                    {param.min !== undefined && param.max !== undefined && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Range: {param.min}–{param.max} {param.unit}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isOverridden && (
                      <button
                        type="button"
                        onClick={() => handleRevertParam(param.key)}
                        className="text-xs text-slate-500 hover:text-red-600 font-semibold cursor-pointer"
                        title="Revert to baseline"
                      >
                        Revert
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEditClick(param)}
                      className="px-2.5 py-1 text-xs font-bold text-[#1B3D34] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Edit Value
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── EDIT PARAMETER MODAL (Part 43 & 44) ── */}
      {editingParam && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {editingParam.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {editingParam.key}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading mt-2">
                Configure {editingParam.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {editingParam.description}
              </p>
            </div>

            {/* Impact Explanation */}
            {(() => {
              const impact = getParameterImpact(editingParam.key, editingParam.name, editingParam.category);
              return (
                <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  impact.severity === 'CRITICAL'
                    ? 'bg-red-50/70 border-red-200 text-red-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    {impact.severity === 'CRITICAL' ? (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    ) : (
                      <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span>What this parameter controls:</span>
                  </div>
                  <p className="text-[11px]">
                    {impact.explanation}
                  </p>
                  <div className="pt-1 text-[11px] flex items-center gap-1 text-slate-500">
                    <strong>Downstream effects:</strong> {impact.affectedBOQLines.slice(0, 3).join(', ')}...
                  </div>
                </div>
              );
            })()}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Parameter Value ({editingParam.unit})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3D34]"
                />
                <span className="px-3 py-2 text-xs bg-slate-100 rounded-xl text-slate-600 font-medium">
                  {editingParam.unit}
                </span>
              </div>
              {editingParam.min !== undefined && editingParam.max !== undefined && (
                <span className="text-[11px] text-slate-400 block">
                  Permitted bounds: {editingParam.min} to {editingParam.max} {editingParam.unit}
                </span>
              )}
            </div>

            {/* Warning confirmation for critical parameters */}
            {showWarningModal && (
              <div className="p-3 bg-red-100/70 border border-red-300 rounded-xl text-xs text-red-900 space-y-1">
                <strong>CRITICAL PARAMETER CONFIRMATION:</strong>
                <p>
                  Modifying {editingParam.name} materially alters structural safety factors and core project cost.
                  Are you certain you wish to stage this draft change?
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditingParam(null);
                  setShowWarningModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button
                type="button"
                onClick={handleSaveParam}
                className="px-4 py-2 text-xs font-bold bg-[#1B3D34] hover:bg-[#142E27] text-white rounded-xl"
              >
                {showWarningModal ? 'Confirm & Apply Draft' : 'Apply to Draft'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
