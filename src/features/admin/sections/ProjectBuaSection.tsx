// ============================================================
// ADMIN CONTROL CENTER — PROJECT & BUA SECTION
// Non-technical controls for plot dimensions, floor areas, and BUA rules
// ============================================================

import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import {
  Building,
  CheckCircle2,
  Info,
  Layers,
  Sparkles,
  Sliders,
  HelpCircle,
  RotateCcw,
  Check
} from 'lucide-react';

export const ProjectBuaSection: React.FC = () => {
  const {
    adminViewMode,
    draftParameters,
    updateDraftParameter,
    activeTab
  } = useAdminStore();

  // Local draft values falling back to canonical defaults
  const superBuaFactor = draftParameters['config.planning.super_bua_multiplier'] ?? 1.15;
  const coverageRatio = draftParameters['config.planning.default_coverage_ratio'] ?? 0.60;
  const circulationPct = draftParameters['config.flooring.circulation_allowance_pct'] ?? 10.0;
  const balconyAllowancePct = draftParameters['config.planning.balcony_allowance_pct'] ?? 8.0;
  const utilityAllowancePct = draftParameters['config.planning.utility_allowance_pct'] ?? 5.0;
  const staircaseAreaSqFt = draftParameters['config.flooring.staircase_granite_sqft'] ?? 180.0;
  const buaCalculationMethod = draftParameters['config.planning.bua_method'] ?? 'CARPET_CIRCULATION';

  // Sample plot & area inputs for visual reference
  const [plotLength, setPlotLength] = useState(60);
  const [plotWidth, setPlotWidth] = useState(40);
  const [floors, setFloors] = useState(2);

  const plotArea = plotLength * plotWidth;
  const estimatedGroundFootprint = Math.round(plotArea * coverageRatio);
  const totalBua = Math.round(estimatedGroundFootprint * floors * superBuaFactor);

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold mb-1">
            <Building className="w-3.5 h-3.5 text-emerald-700" />
            <span>Group 1: Project Planning</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Project & Built-Up Area (BUA)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure how building footprint, floor allowances, and built-up areas are calculated for residential estimates.
          </p>
        </div>

        {/* Current BUA Readout */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Sample Scenario</p>
            <p className="text-sm font-bold text-slate-800">
              {plotLength} × {plotWidth} ft ({plotArea} sq.ft, {floors} Floors)
            </p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <p className="text-[10px] uppercase font-bold text-emerald-700">Estimated Total BUA</p>
            <p className="text-lg font-bold text-[#1B3D34]">
              {totalBua.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">sq.ft</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── WHAT DOES THIS AFFECT? BADGE ── */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1.5">
          <Info className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>What do these settings affect?</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
          <p>
            <strong className="text-emerald-800 font-semibold">✓ Affects:</strong> Total Built-up Area, structural steel tonnage, total cement bags, concrete volume, and structural cost.
          </p>
          <p>
            <strong className="text-slate-600 font-semibold">✗ Does not affect:</strong> Clear wall height, individual tile wastage %, or material unit rates.
          </p>
        </div>
      </div>

      {/* ── BUA CALCULATION METHOD SELECTOR ── */}
      <Card className="border border-slate-200 bg-white">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Built-up Area Calculation Method
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose how the calculator derives built-up area from user drawings or room configurations.
              </p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              Client Friendly Method
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Method 1: Carpet + Circulation */}
            <div
              onClick={() => updateDraftParameter('config.planning.bua_method', 'CARPET_CIRCULATION')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                buaCalculationMethod === 'CARPET_CIRCULATION'
                  ? 'border-[#1B3D34] bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900">Carpet + Circulation</span>
                {buaCalculationMethod === 'CARPET_CIRCULATION' && (
                  <span className="w-4 h-4 rounded-full bg-[#1B3D34] text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Calculates BUA from livable carpet area plus hallway, corridor, and wall thickness allowances. Recommended for residential floorplans.
              </p>
            </div>

            {/* Method 2: Room Based */}
            <div
              onClick={() => updateDraftParameter('config.planning.bua_method', 'ROOM_BASED')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                buaCalculationMethod === 'ROOM_BASED'
                  ? 'border-[#1B3D34] bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900">Room Based</span>
                {buaCalculationMethod === 'ROOM_BASED' && (
                  <span className="w-4 h-4 rounded-full bg-[#1B3D34] text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Built-up area is calculated directly by summing configured room dimensions (Bedrooms + Living + Kitchen + Bathrooms).
              </p>
            </div>

            {/* Method 3: Manual / Plot Footprint */}
            <div
              onClick={() => updateDraftParameter('config.planning.bua_method', 'MANUAL')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                buaCalculationMethod === 'MANUAL'
                  ? 'border-[#1B3D34] bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900">Plot Footprint (Manual)</span>
                {buaCalculationMethod === 'MANUAL' && (
                  <span className="w-4 h-4 rounded-full bg-[#1B3D34] text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Calculates BUA by applying maximum ground coverage and super built-up multiplier directly to plot dimensions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── CORE PLANNING PARAMETERS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ground Coverage Ratio */}
        <Card className="border border-slate-200 bg-white">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Ground Coverage Ratio</span>
                <span className="text-slate-400 cursor-help" title="Percentage of plot footprint permitted for ground construction under municipal bylaws.">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </label>
              <span className="text-xs font-mono font-bold text-[#1B3D34]">
                {(coverageRatio * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Default maximum ground construction footprint (BBMP / BDA standard is 60%).
            </p>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="range"
                min="40"
                max="85"
                step="5"
                value={Math.round(coverageRatio * 100)}
                onChange={(e) => updateDraftParameter('config.planning.default_coverage_ratio', Number(e.target.value) / 100)}
                className="w-full accent-[#1B3D34] cursor-pointer"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min="40"
                  max="85"
                  value={Math.round(coverageRatio * 100)}
                  onChange={(e) => updateDraftParameter('config.planning.default_coverage_ratio', Number(e.target.value) / 100)}
                  className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded-lg text-right"
                />
                <span className="text-xs text-slate-500">%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Super Built-up Multiplier */}
        <Card className="border border-slate-200 bg-white">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Super Built-up Multiplier</span>
                <span className="text-slate-400 cursor-help" title="Multiplier converting net plinth area to super built-up area accounting for external walls and shafts.">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </label>
              <span className="text-xs font-mono font-bold text-[#1B3D34]">
                {superBuaFactor.toFixed(2)}x
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Standard factor accounting for external wall offsets and structural columns.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="range"
                min="100"
                max="135"
                step="1"
                value={Math.round(superBuaFactor * 100)}
                onChange={(e) => updateDraftParameter('config.planning.super_bua_multiplier', Number(e.target.value) / 100)}
                className="w-full accent-[#1B3D34] cursor-pointer"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  step="0.01"
                  min="1.0"
                  max="1.35"
                  value={superBuaFactor}
                  onChange={(e) => updateDraftParameter('config.planning.super_bua_multiplier', Number(e.target.value))}
                  className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded-lg text-right"
                />
                <span className="text-xs text-slate-500">ratio</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── ADVANCED PLANNING CONTROLS ── */}
      {adminViewMode === 'ADVANCED' && (
        <Card className="border border-slate-200 bg-white">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Advanced Circulation & Floor Allowances
                </h3>
                <p className="text-[11px] text-slate-500">
                  Granular area factors for corridors, balconies, utilities, and vertical staircase risers.
                </p>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Advanced Controls
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
              {/* Circulation % */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Circulation Allowance</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="5"
                    max="20"
                    value={circulationPct}
                    onChange={(e) => updateDraftParameter('config.flooring.circulation_allowance_pct', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
                <p className="text-[10px] text-slate-400">Hallway & corridor area</p>
              </div>

              {/* Balcony % */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Balcony Allowance</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="2"
                    max="15"
                    value={balconyAllowancePct}
                    onChange={(e) => updateDraftParameter('config.planning.balcony_allowance_pct', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
                <p className="text-[10px] text-slate-400">External sit-out balcony</p>
              </div>

              {/* Utility % */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Utility Allowance</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={utilityAllowancePct}
                    onChange={(e) => updateDraftParameter('config.planning.utility_allowance_pct', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
                <p className="text-[10px] text-slate-400">Washing & service balcony</p>
              </div>

              {/* Staircase Area */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Staircase Allowance</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="120"
                    max="260"
                    value={staircaseAreaSqFt}
                    onChange={(e) => updateDraftParameter('config.flooring.staircase_granite_sqft', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                  <span className="text-xs text-slate-500">sqft/flr</span>
                </div>
                <p className="text-[10px] text-slate-400">Treads, risers & landings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
