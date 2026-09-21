// ============================================================
// ADMIN CONTROL CENTER — CALCULATION METHODS & CUSTOM RULES
// Simple card-based method switcher and non-technical visual rule builder
// ============================================================

import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import {
  TrendingUp,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Plus,
  Trash2,
  Sliders,
  Check,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';
import { calculationMethodManager } from '../../../calculation-engine/rules/methodRegistry';

export const CalculationMethodsSection: React.FC = () => {
  const {
    activeMethods,
    setActiveMethod,
    adminViewMode,
    customRules,
    addCustomRule,
    toggleCustomRule,
    deleteCustomRule
  } = useAdminStore();

  const allMethods = calculationMethodManager.getAllMethods();

  // Visual Rule Builder form state
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [whenField, setWhenField] = useState('bathrooms');
  const [condition, setCondition] = useState('GREATER_THAN');
  const [conditionValue, setConditionValue] = useState<any>(3);
  const [thenTarget, setThenTarget] = useState('config.waterproofing.bathroom_upturn_ft');
  const [targetValue, setTargetValue] = useState<any>(1.10);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomRule({
      whenField,
      condition,
      value: Number(conditionValue) || conditionValue,
      thenTarget,
      action: 'SET_TO',
      targetValue: Number(targetValue) || targetValue,
    });
    setShowAddRuleModal(false);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[11px] font-bold mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-700" />
            <span>Calculator: Calculation Methods</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Construction Calculation Methods
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch between safe, registered calculation methodologies without touching code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Registered Safe Methods Active</span>
          </span>
        </div>
      </div>

      {/* ── METHOD SELECTION CARDS GRID ── */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Trade Calculation Methods ({allMethods.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allMethods.map((def) => {
            const currentActiveId = activeMethods[def.category] || def.activeMethodId;
            const currentMethod = def.supportedMethods.find((m) => m.methodId === currentActiveId) || def.supportedMethods[0];

            return (
              <Card key={def.id} className="border border-slate-200 bg-white rounded-2xl hover:border-slate-300 transition-all">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{def.name}</h4>
                      <p className="text-xs text-slate-500">{def.description}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      {def.category}
                    </span>
                  </div>

                  {/* Active Method Badge */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      Current Active Method:
                    </p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {currentMethod?.displayName}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {currentMethod?.description}
                    </p>
                  </div>

                  {/* Method Switcher Dropdown */}
                  <div className="pt-1">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Select Method:
                    </label>
                    <select
                      value={currentActiveId}
                      onChange={(e) => setActiveMethod(def.category, e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {def.supportedMethods.map((m) => (
                        <option key={m.methodId} value={m.methodId}>
                          {m.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── ADVANCED CUSTOM RULES BUILDER (Section 22) ── */}
      {adminViewMode === 'ADVANCED' && (
        <Card className="border border-slate-200 bg-white rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Advanced Construction Rules (Visual Rule Builder)
                  </h3>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Optional
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual conditional rules for custom construction requirements. Evaluated securely using the bounded rule engine.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setShowAddRuleModal(true)}
                className="px-3.5 py-1.5 text-xs font-bold bg-[#1B3D34] hover:bg-[#142E27] text-white rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </Button>
            </div>

            {/* List of custom rules */}
            {customRules.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No custom conditional rules created yet.
              </p>
            ) : (
              <div className="space-y-3">
                {customRules.map((r) => (
                  <div
                    key={r.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      r.isActive ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/40 border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={r.isActive}
                        onChange={() => toggleCustomRule(r.id)}
                        className="rounded text-[#1B3D34] accent-[#1B3D34] cursor-pointer"
                        title="Enable/Disable rule"
                      />
                      <div className="text-xs text-slate-800">
                        <span className="font-bold text-purple-700 uppercase">WHEN </span>
                        <span className="font-semibold">{r.whenField} </span>
                        <span className="text-slate-500">{r.condition === 'GREATER_THAN' ? '>' : '='} </span>
                        <span className="font-semibold">{r.value} </span>
                        <span className="font-bold text-emerald-700 uppercase">THEN </span>
                        <span className="font-semibold">{r.thenTarget.replace(/^config\./, '')} </span>
                        <span className="text-slate-500">set to </span>
                        <strong className="text-slate-900">{r.targetValue}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteCustomRule(r.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-md cursor-pointer self-end sm:self-auto"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── MODAL: ADD CUSTOM RULE ── */}
      {showAddRuleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Create Construction Rule
              </h3>
              <button
                type="button"
                onClick={() => setShowAddRuleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3">
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
                <p className="text-[11px] font-bold text-purple-900 uppercase">WHEN (Condition)</p>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={whenField}
                    onChange={(e) => setWhenField(e.target.value)}
                    className="px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="bathrooms">Bathrooms</option>
                    <option value="bedrooms">Bedrooms</option>
                    <option value="floors">Floors</option>
                    <option value="builtUpArea">Built-up Area</option>
                    <option value="qualityTier">Specification Tier</option>
                  </select>

                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="px-2 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="GREATER_THAN">is greater than</option>
                    <option value="EQUALS">is equal to</option>
                    <option value="LESS_THAN">is less than</option>
                  </select>

                  <input
                    type="text"
                    required
                    value={conditionValue}
                    onChange={(e) => setConditionValue(e.target.value)}
                    placeholder="Value"
                    className="px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                <p className="text-[11px] font-bold text-emerald-900 uppercase">THEN (Action)</p>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={thenTarget}
                    onChange={(e) => setThenTarget(e.target.value)}
                    className="px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="config.waterproofing.bathroom_upturn_ft">Waterproofing Factor</option>
                    <option value="config.paint.interior_coats">Paint Coats</option>
                    <option value="config.wastage.flooring">Tile Wastage %</option>
                    <option value="config.wastage.steel">Steel Wastage %</option>
                  </select>

                  <input
                    type="text"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="New Value"
                    className="px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-[#1B3D34] hover:bg-[#142E27] text-white rounded-xl"
                >
                  Save Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
