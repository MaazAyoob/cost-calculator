// ============================================================
// ADMIN CONTROL CENTER — CALCULATION RULES & METHOD SELECTION
// Parts 7, 8, 9, 10 — Controlled AST Rule Builder & Method Registry
// ============================================================

import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  GitBranch,
  Split,
  Settings,
  HelpCircle
} from 'lucide-react';
import { calculationMethodManager } from '../../../calculation-engine/rules/methodRegistry';
import { DependencyGraph } from '../../../calculation-engine/rules/dependencyGraph';

export const CalculationRulesTab: React.FC = () => {
  const { activeMethods, setActiveMethod } = useAdminStore();
  const [selectedCategory, setSelectedCategory] = useState<'STEEL' | 'PAINT' | 'FLOORING'>('STEEL');

  const supportedDef = calculationMethodManager.getMethodDefinition(selectedCategory);
  const activeMethodId = activeMethods[selectedCategory] || supportedDef?.activeMethodId || '';

  // Instantiate dependency graph for validation
  const depGraph = new DependencyGraph();
  const graphValidation = depGraph.validateGraph();

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#1B3D34]" />
            Calculation Methods & Structured Rule Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin selection between supported calculation methodologies and structured mathematical AST rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            graphValidation.isValid
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {graphValidation.isValid ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>DAG Rules Valid (No Cycles)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Circular Dependency Detected</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* ── CATEGORY SELECTOR ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(['STEEL', 'PAINT', 'FLOORING'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#1B3D34] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat === 'STEEL' && 'Reinforcement Steel'}
            {cat === 'PAINT' && 'Interior & Exterior Paint'}
            {cat === 'FLOORING' && 'Flooring & Tiling'}
          </button>
        ))}
      </div>

      {/* ── METHOD SELECTION (Part 7) ── */}
      {supportedDef && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Select Active Calculation Method for {supportedDef.name}
            </h3>
            <span className="text-xs text-slate-400">
              Only methods verified by engine test suites are selectable.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supportedDef.supportedMethods.map((m: any) => {
              const isActive = activeMethodId === m.methodId;

              return (
                <Card
                  key={m.methodId}
                  className={`border transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#1B3D34] bg-emerald-50/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                  onClick={() => setActiveMethod(selectedCategory, m.methodId)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-bold text-slate-900 font-heading">
                        {m.displayName}
                      </h4>
                      {isActive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1B3D34] text-white">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                          AVAILABLE
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600">
                      {m.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Required Parameters:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {m.requiredParameters.map((p: any) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-600"
                          >
                            {p.split('.').pop()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STRUCTURED RULE BUILDER VISUALIZATION (Part 8 & 9) ── */}
      <Card className="border border-slate-200 bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#F28C28]" />
                Structured AST Rule Visualization (Deterministic & Safe)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                No code execution (no eval/Function). Rules evaluate as structured mathematical expression trees.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Safe Execution Guaranteed
            </span>
          </div>

          {/* Rule Flow Tree */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 font-mono text-xs text-slate-700">
            {selectedCategory === 'STEEL' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="px-2 py-0.5 bg-slate-200 rounded text-[11px] font-bold text-slate-800">STEP 1</span>
                  <span>Ground Steel = groundFloorArea × steel_base_factor_kg_sqft</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="px-2 py-0.5 bg-slate-200 rounded text-[11px] font-bold text-slate-800">STEP 2</span>
                  <span>Upper Floors Steel = (floors - 1) × upperFloorArea × (steel_base_factor_kg_sqft + steel_floor_increment_kg_sqft)</span>
                </div>
                <div className="flex items-center gap-2 text-[#1B3D34] font-bold">
                  <span className="px-2 py-0.5 bg-emerald-200 rounded text-[11px] text-emerald-900">OUTPUT</span>
                  <span>Total Steel Weight (kg) = Ground Steel + Upper Floors Steel</span>
                </div>
              </div>
            )}

            {selectedCategory === 'PAINT' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="px-2 py-0.5 bg-slate-200 rounded text-[11px] font-bold text-slate-800">STEP 1</span>
                  <span>Gross Paint Area = internalWallArea + ceilingArea - openingsDeduction</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="px-2 py-0.5 bg-slate-200 rounded text-[11px] font-bold text-slate-800">STEP 2</span>
                  <span>Base Litres = Gross Paint Area ÷ interior_coverage_sqft_per_litre</span>
                </div>
                <div className="flex items-center gap-2 text-[#1B3D34] font-bold">
                  <span className="px-2 py-0.5 bg-emerald-200 rounded text-[11px] text-emerald-900">OUTPUT</span>
                  <span>Total Interior Paint (L) = Base Litres × interior_coats × (1 + paint_wastage_percent ÷ 100)</span>
                </div>
              </div>
            )}

            {selectedCategory === 'FLOORING' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="px-2 py-0.5 bg-slate-200 rounded text-[11px] font-bold text-slate-800">STEP 1</span>
                  <span>Gross Carpet Area = sum(room_areas) × (1 + circulation_allowance_percent ÷ 100)</span>
                </div>
                <div className="flex items-center gap-2 text-[#1B3D34] font-bold">
                  <span className="px-2 py-0.5 bg-emerald-200 rounded text-[11px] text-emerald-900">OUTPUT</span>
                  <span>Total Tile Area (sqft) = Gross Carpet Area × (1 + tile_wastage_percent ÷ 100)</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
