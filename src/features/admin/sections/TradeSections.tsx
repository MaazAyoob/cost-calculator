// ============================================================
// ADMIN CONTROL CENTER — TRADE SECTIONS (CONSTRUCTION & SERVICES)
// Clean card-based editors for all construction disciplines with
// Basic / Advanced filtering and plain construction language
// ============================================================

import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore, AdminTab } from '../../../store/useAdminStore';
import {
  Hammer,
  Layers,
  Paintbrush,
  Droplets,
  Zap,
  Shield,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Info,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Coins,
  Wrench,
  Sliders,
  Eye,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../../../utils/cn';

interface TradeSectionProps {
  sectionId: AdminTab;
}

export const TradeSections: React.FC<TradeSectionProps> = ({ sectionId }) => {
  const {
    adminViewMode,
    draftParameters,
    updateDraftParameter,
    rates,
    overrides,
    saveOverride
  } = useAdminStore();

  // ────────────────────────────────────────────────────────────
  // 1. WALLS & MASONRY (Section 9)
  // ────────────────────────────────────────────────────────────
  if (sectionId === 'walls-masonry' || sectionId === 'masonry') {
    const wallHeight = draftParameters['config.structure.wall_height_ft'] ?? 10.0;
    const extWallThickness = draftParameters['config.masonry.external_wall_thickness_m'] ?? 0.15;
    const intWallThickness = draftParameters['config.masonry.internal_wall_thickness_m'] ?? 0.10;
    const masonryWastage = draftParameters['config.wastage.masonry'] ?? 5.0;
    const masonryType = draftParameters['config.masonry.type'] ?? 'AAC_BLOCK';

    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold mb-1">
              <Layers className="w-3.5 h-3.5 text-amber-700" />
              <span>Construction: Walls & Masonry</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Walls & Masonry Parameters
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Wall heights, thickness standards, block specifications, and opening deductions.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
            Standard Height: {wallHeight} ft
          </span>
        </div>

        {/* What Does This Affect? */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900 mb-1.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>What do these wall settings affect?</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
            <p>
              <strong className="text-amber-800 font-semibold">✓ Affects:</strong> Wall masonry block counts, joint mortar, 2-coat internal/external plaster, and wall paint area.
            </p>
            <p>
              <strong className="text-slate-600 font-semibold">✗ Does not affect:</strong> Floor built-up area (BUA) or structural steel thumb rules.
            </p>
          </div>
        </div>

        {/* Basic Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Wall Height */}
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Standard Wall Height</span>
                  <span className="text-slate-400 cursor-help" title="Clear floor-to-ceiling vertical height used when calculating wall surface area, blockwork, plaster, and paint.">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </label>
                <span className="text-xs font-mono font-bold text-[#1B3D34]">{wallHeight} ft</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Default residential clear height (NBC 2016 recommendation is 10 ft).
              </p>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="range"
                  min="9.0"
                  max="14.0"
                  step="0.5"
                  value={wallHeight}
                  onChange={(e) => updateDraftParameter('config.structure.wall_height_ft', Number(e.target.value))}
                  className="w-full accent-[#1B3D34] cursor-pointer"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    step="0.5"
                    min="9.0"
                    max="14.0"
                    value={wallHeight}
                    onChange={(e) => updateDraftParameter('config.structure.wall_height_ft', Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded-lg text-right"
                  />
                  <span className="text-xs text-slate-500">ft</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Masonry Material Type */}
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-5 space-y-2">
              <label className="text-xs font-bold text-slate-900 block">Primary Masonry Type</label>
              <p className="text-[11px] text-slate-500">
                Select block material used for external envelope and internal partition walls.
              </p>
              <select
                value={masonryType}
                onChange={(e) => updateDraftParameter('config.masonry.type', e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50/50 mt-2"
              >
                <option value="AAC_BLOCK">Autoclaved Aerated Concrete (AAC Block 150mm)</option>
                <option value="CONCRETE_BLOCK">Solid Concrete Block (6" / 150mm)</option>
                <option value="RED_BRICK">Wire-cut Table Mould Red Clay Bricks</option>
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Controls */}
        {adminViewMode === 'ADVANCED' && (
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Advanced Wall Thicknesses & Wastage Allowances
                </h3>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Advanced
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">External Wall Thickness</label>
                  <select
                    value={extWallThickness.toString()}
                    onChange={(e) => updateDraftParameter('config.masonry.external_wall_thickness_m', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="0.15">6 inches (150 mm) — Standard External</option>
                    <option value="0.20">8 inches (200 mm) — Heavy Envelope</option>
                    <option value="0.23">9 inches (230 mm) — Red Brick 1-Brick Wall</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Internal Wall Thickness</label>
                  <select
                    value={intWallThickness.toString()}
                    onChange={(e) => updateDraftParameter('config.masonry.internal_wall_thickness_m', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="0.10">4 inches (100 mm) — Standard Partition</option>
                    <option value="0.115">4.5 inches (115 mm) — Half-Brick Wall</option>
                    <option value="0.15">6 inches (150 mm) — Robust Partition</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Cutting & Breakage Wastage</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="2"
                      max="15"
                      value={masonryWastage}
                      onChange={(e) => updateDraftParameter('config.wastage.masonry', Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                    />
                    <span className="text-xs text-slate-500">%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // 2. RCC & STRUCTURE (Section 10)
  // ────────────────────────────────────────────────────────────
  if (sectionId === 'rcc-structure' || sectionId === 'structure-rcc') {
    const steelBase = draftParameters['config.rcc.steel_base_factor_kg_sqft'] ?? 2.80;
    const steelFloorIncr = draftParameters['config.rcc.steel_additional_floor_factor'] ?? 0.20;
    const cementFactor = draftParameters['config.material.cement_bags_per_sqft'] ?? 0.40;
    const mSandFactor = draftParameters['config.material.m_sand_cft_per_sqft'] ?? 0.60;
    const pSandFactor = draftParameters['config.material.p_sand_cft_per_sqft'] ?? 0.60;
    const aggFactor = draftParameters['config.material.coarse_aggregate_cft_per_sqft'] ?? 1.35;
    const steelWastage = draftParameters['config.wastage.steel'] ?? 4.0;

    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold mb-1">
              <Hammer className="w-3.5 h-3.5 text-blue-700" />
              <span>Construction: RCC & Structural Frame</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              RCC & Structural Frame Parameters
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reinforcement steel factors, structural cement consumption, concrete sand, and aggregates.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1.5 rounded-xl">
            Base Steel: {steelBase} kg/sq.ft
          </span>
        </div>

        {/* What Does This Affect? */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-blue-900 mb-1.5">
            <Info className="w-4 h-4 text-blue-700 shrink-0" />
            <span>What do structural parameters affect?</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
            <p>
              <strong className="text-blue-800 font-semibold">✓ Affects:</strong> Total TMT reinforcement steel tonnage, cement bag count for RCC slabs/columns, fine sand volume, and coarse aggregates.
            </p>
            <p>
              <strong className="text-slate-600 font-semibold">✗ Does not affect:</strong> Paint coverage, tile wastage, or bathroom waterproofing membrane area.
            </p>
          </div>
        </div>

        {/* Basic Primary Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Steel Base Factor */}
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Steel Quantity Factor (Ground Floor)</span>
                  <span className="text-slate-400 cursor-help" title="Estimated steel reinforcement quantity per square foot of built-up area for the ground level structure.">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </label>
                <span className="text-xs font-mono font-bold text-[#1B3D34]">{steelBase} kg/sq.ft</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Baseline structural steel for ground floor frame (IS 456 standard: 2.80 kg/sq.ft).
              </p>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="range"
                  min="2.2"
                  max="4.5"
                  step="0.1"
                  value={steelBase}
                  onChange={(e) => updateDraftParameter('config.rcc.steel_base_factor_kg_sqft', Number(e.target.value))}
                  className="w-full accent-[#1B3D34] cursor-pointer"
                />
                <input
                  type="number"
                  step="0.05"
                  min="2.0"
                  max="5.0"
                  value={steelBase}
                  onChange={(e) => updateDraftParameter('config.rcc.steel_base_factor_kg_sqft', Number(e.target.value))}
                  className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded-lg text-right"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cement Consumption */}
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Overall Cement Factor</span>
                  <span className="text-slate-400 cursor-help" title="Total structural cement bags estimated per square foot of built-up area across all concrete works.">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </label>
                <span className="text-xs font-mono font-bold text-[#1B3D34]">{cementFactor} bags/sq.ft</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Total cement bags per sq.ft of BUA (CPWD works manual thumb rule: 0.40 bags/sq.ft).
              </p>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="range"
                  min="0.30"
                  max="0.55"
                  step="0.01"
                  value={cementFactor}
                  onChange={(e) => updateDraftParameter('config.material.cement_bags_per_sqft', Number(e.target.value))}
                  className="w-full accent-[#1B3D34] cursor-pointer"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0.25"
                  max="0.60"
                  value={cementFactor}
                  onChange={(e) => updateDraftParameter('config.material.cement_bags_per_sqft', Number(e.target.value))}
                  className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded-lg text-right"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Concrete Aggregates */}
        {adminViewMode === 'ADVANCED' && (
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Upper Floor Steel Increments & Concrete Aggregates
                </h3>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  Advanced
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Upper Floor Increment</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="0.5"
                      value={steelFloorIncr}
                      onChange={(e) => updateDraftParameter('config.rcc.steel_additional_floor_factor', Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-400">kg/flr</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">M-Sand (Concrete)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.05"
                      min="0.45"
                      max="0.85"
                      value={mSandFactor}
                      onChange={(e) => updateDraftParameter('config.material.m_sand_cft_per_sqft', Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-400">CFT/sqft</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">P-Sand (Plaster)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.05"
                      min="0.45"
                      max="0.85"
                      value={pSandFactor}
                      onChange={(e) => updateDraftParameter('config.material.p_sand_cft_per_sqft', Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-400">CFT/sqft</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Coarse Aggregate (20mm)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="1.8"
                      value={aggFactor}
                      onChange={(e) => updateDraftParameter('config.material.coarse_aggregate_cft_per_sqft', Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-400">CFT/sqft</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // 3. PAINT & FINISHES (Section 13) WITH 45 vs 60 WARNING
  // ────────────────────────────────────────────────────────────
  if (sectionId === 'paint-finishes' || sectionId === 'paint') {
    const interiorCoverage = draftParameters['config.paint.interior_coverage_sqft_per_litre'] ?? 45.0;
    const exteriorCoverage = draftParameters['config.paint.exterior_coverage_sqft_per_litre'] ?? 60.0;
    const paintCoats = draftParameters['config.paint.interior_coats'] ?? 2;
    const paintWastage = draftParameters['config.wastage.paint'] ?? 10.0;
    const puttyConsumption = draftParameters['config.paint.putty_kg_per_sqft'] ?? 0.55;

    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[11px] font-bold mb-1">
              <Paintbrush className="w-3.5 h-3.5 text-purple-700" />
              <span>Finishes: Paint & Plaster</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Paint & Finishes Parameters
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Interior and exterior paint spread rates, putty coats, and cutting allowances.
            </p>
          </div>
        </div>

        {/* ── CRITICAL CONFLICT WARNING (Section 13) ── */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-900">
              Please confirm the approved interior paint coverage.
            </h4>
            <p className="text-xs text-amber-800">
              The standard residential benchmark specifies <strong>45 sq.ft / Litre</strong> (2 coats over putty), whereas some high-spread luxury emulsions advertise <strong>60 sq.ft / Litre</strong>. Please review and confirm your company standard below.
            </p>
          </div>
        </div>

        {/* Core Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Interior Paint Coverage */}
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Interior Paint Coverage</span>
                  <span className="text-slate-400 cursor-help" title="Square feet of wall covered per litre of interior paint for 2 coats.">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </label>
                <span className="text-xs font-mono font-bold text-[#1B3D34]">
                  {interiorCoverage} sq.ft/L
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Approved interior emulsion spread rate.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="range"
                  min="35"
                  max="70"
                  step="5"
                  value={interiorCoverage}
                  onChange={(e) => updateDraftParameter('config.paint.interior_coverage_sqft_per_litre', Number(e.target.value))}
                  className="w-full accent-[#1B3D34] cursor-pointer"
                />
                <input
                  type="number"
                  min="30"
                  max="80"
                  value={interiorCoverage}
                  onChange={(e) => updateDraftParameter('config.paint.interior_coverage_sqft_per_litre', Number(e.target.value))}
                  className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded-lg text-right"
                />
              </div>
            </CardContent>
          </Card>

          {/* Exterior Paint Coverage */}
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Exterior Weatherproof Coverage</span>
                  <span className="text-slate-400 cursor-help" title="Square feet covered per litre of exterior weatherproof emulsion.">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </label>
                <span className="text-xs font-mono font-bold text-[#1B3D34]">
                  {exteriorCoverage} sq.ft/L
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Exterior acrylic weatherproof paint (Standard: 60 sq.ft/L).
              </p>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="range"
                  min="45"
                  max="80"
                  step="5"
                  value={exteriorCoverage}
                  onChange={(e) => updateDraftParameter('config.paint.exterior_coverage_sqft_per_litre', Number(e.target.value))}
                  className="w-full accent-[#1B3D34] cursor-pointer"
                />
                <input
                  type="number"
                  min="40"
                  max="90"
                  value={exteriorCoverage}
                  onChange={(e) => updateDraftParameter('config.paint.exterior_coverage_sqft_per_litre', Number(e.target.value))}
                  className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded-lg text-right"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Coats and Wastage */}
        {adminViewMode === 'ADVANCED' && (
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Putty Consumption & Number of Coats
                </h3>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  Advanced
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Wall Putty Consumption</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.05"
                      min="0.3"
                      max="1.0"
                      value={puttyConsumption}
                      onChange={(e) => updateDraftParameter('config.paint.putty_kg_per_sqft', Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                    />
                    <span className="text-xs text-slate-500">kg/sqft</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Paint Coats</label>
                  <select
                    value={paintCoats}
                    onChange={(e) => updateDraftParameter('config.paint.interior_coats', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="1">1 Coat (Primer/Touch-up)</option>
                    <option value="2">2 Coats (Standard Finish)</option>
                    <option value="3">3 Coats (High Sheen Luxury)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Paint Wastage & Spillage</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="20"
                      value={paintWastage}
                      onChange={(e) => updateDraftParameter('config.wastage.paint', Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                    />
                    <span className="text-xs text-slate-500">%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // 4. COMMERCIAL & TAX (Section 23)
  // ────────────────────────────────────────────────────────────
  if (sectionId === 'commercial-tax' || sectionId === 'commercial') {
    const marginPct = (draftParameters['config.commercial.contractor_margin'] ?? 0.15) * 100;
    const gstPct = (draftParameters['config.commercial.gst_rate'] ?? 0.18) * 100;
    const contingencyPct = (draftParameters['config.commercial.contingency'] ?? 0.0) * 100;
    const profFeesPct = (draftParameters['config.commercial.professional_fees'] ?? 0.0) * 100;

    const gstEnabled = draftParameters['config.commercial.gst_enabled'] ?? true;
    const marginEnabled = draftParameters['config.commercial.margin_enabled'] ?? true;

    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold mb-1">
              <Percent className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pricing: Commercial & Tax</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Commercial Margins & Tax Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Contractor execution margins, professional design fees, contingency reserves, and GST tax rules.
            </p>
          </div>
        </div>

        {/* What Does This Affect? */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1.5">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Commercial Invariance Rule</span>
          </div>
          <p className="text-slate-700">
            Changing contractor margin, contingency, or GST rates <strong>strictly modifies final commercial costs</strong> and will <strong>NEVER alter physical material quantities</strong> (steel tonnes, cement bags, sand CFT remain exactly unchanged).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Contractor Margin */}
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={marginEnabled}
                    onChange={(e) => updateDraftParameter('config.commercial.margin_enabled', e.target.checked)}
                    className="rounded text-[#1B3D34] accent-[#1B3D34]"
                  />
                  <label className="text-xs font-bold text-slate-900">Contractor Execution Margin</label>
                </div>
                <span className="text-xs font-mono font-bold text-[#1B3D34]">{marginPct}%</span>
              </div>
              <p className="text-[11px] text-slate-500">
                General contractor overhead and execution margin applied on net cost.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  disabled={!marginEnabled}
                  value={marginPct}
                  onChange={(e) => updateDraftParameter('config.commercial.contractor_margin', Number(e.target.value) / 100)}
                  className="w-full accent-[#1B3D34] cursor-pointer"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    disabled={!marginEnabled}
                    value={marginPct}
                    onChange={(e) => updateDraftParameter('config.commercial.contractor_margin', Number(e.target.value) / 100)}
                    className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded-lg text-right"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Works Contract GST */}
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={gstEnabled}
                    onChange={(e) => updateDraftParameter('config.commercial.gst_enabled', e.target.checked)}
                    className="rounded text-[#1B3D34] accent-[#1B3D34]"
                  />
                  <label className="text-xs font-bold text-slate-900">Works Contract GST</label>
                </div>
                <span className="text-xs font-mono font-bold text-[#1B3D34]">{gstPct}%</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Government Works Contract GST (statutory rate: 18%).
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="0"
                  max="28"
                  step="1"
                  disabled={!gstEnabled}
                  value={gstPct}
                  onChange={(e) => updateDraftParameter('config.commercial.gst_rate', Number(e.target.value) / 100)}
                  className="w-full accent-[#1B3D34] cursor-pointer"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="28"
                    disabled={!gstEnabled}
                    value={gstPct}
                    onChange={(e) => updateDraftParameter('config.commercial.gst_rate', Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded-lg text-right"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // 5. DEFAULT FALLBACK: TRADE PARAMETER CARD
  // ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading capitalize">
            {sectionId.replace(/-/g, ' ')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Client-friendly construction settings and rates.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
          Active Configuration
        </span>
      </div>

      <Card className="border border-slate-200 bg-white">
        <CardContent className="p-5 space-y-3 text-xs text-slate-600">
          <p>
            All assumptions and benchmarks in this trade are resolved dynamically through the single source of truth configuration resolver.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
