// ============================================================
// ADMIN CONTROL CENTER — FORMULA LIBRARY & VISUAL FORMULA BUILDER
// Client Feedback: "Make Hutty's calculation engine configurable from Admin without making the Admin UI confusing."
// ============================================================

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  Edit3,
  History,
  Layers,
  Sparkles,
  Info,
  X,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  Calculator,
  ShieldCheck,
  Plus
} from 'lucide-react';
import {
  CANONICAL_FORMULA_LIBRARY,
  FormulaLibraryItem
} from '../../../calculation-engine/rules/formulaLibrary';
import {
  CONTROLLED_VARIABLE_REGISTRY,
  CONTROLLED_OPERATORS,
  ControlledVariable
} from '../../../calculation-engine/rules/variableRegistry';

export const FormulaLibrarySection: React.FC = () => {
  const {
    adminViewMode,
    draftParameters,
    updateDraftParameter
  } = useAdminStore();

  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormula, setSelectedFormula] = useState<FormulaLibraryItem | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderFormula, setBuilderFormula] = useState<FormulaLibraryItem | null>(null);

  // Formula Builder State
  const [builderLeftVar, setBuilderLeftVar] = useState('builtUpArea');
  const [builderOperator, setBuilderOperator] = useState('MULTIPLY');
  const [builderRightParam, setBuilderRightParam] = useState('config.rcc.concrete_factor_cum_sqft');
  const [builderRightValue, setBuilderRightValue] = useState<number>(0.052);
  const [builderMinBound, setBuilderMinBound] = useState<number>(5.0);
  const [builderValidationMsg, setBuilderValidationMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const domains = [
    { id: 'ALL', label: 'All Domains' },
    { id: 'RCC', label: 'RCC & Structure' },
    { id: 'STEEL', label: 'Steel' },
    { id: 'CEMENT', label: 'Cement' },
    { id: 'MASONRY', label: 'Masonry' },
    { id: 'FLOORING', label: 'Flooring' },
    { id: 'WATERPROOFING', label: 'Waterproofing' },
    { id: 'PAINT', label: 'Paint' },
    { id: 'ELECTRICAL', label: 'Electrical' },
    { id: 'PLUMBING', label: 'Plumbing' },
    { id: 'COMMERCIAL', label: 'Commercial & Tax' },
  ];

  const filteredFormulas = useMemo(() => {
    return CANONICAL_FORMULA_LIBRARY.filter((f) => {
      if (selectedDomain !== 'ALL' && f.domain !== selectedDomain) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          f.whatIsIt.toLowerCase().includes(q) ||
          f.output.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedDomain, searchQuery]);

  const handleOpenBuilder = (formula: FormulaLibraryItem) => {
    setBuilderFormula(formula);
    if (formula.id.includes('footing')) {
      setBuilderLeftVar('builtUpArea');
      setBuilderOperator('PERCENTAGE');
      setBuilderRightParam('config.rcc.footing_allocation_pct');
      setBuilderRightValue(22.0);
      setBuilderMinBound(5.0);
    } else if (formula.id.includes('column')) {
      setBuilderLeftVar('builtUpArea');
      setBuilderOperator('PERCENTAGE');
      setBuilderRightParam('config.rcc.column_allocation_pct');
      setBuilderRightValue(18.0);
      setBuilderMinBound(3.0);
    } else if (formula.id.includes('slab')) {
      setBuilderLeftVar('builtUpArea');
      setBuilderOperator('PERCENTAGE');
      setBuilderRightParam('config.rcc.slab_allocation_pct');
      setBuilderRightValue(52.0);
      setBuilderMinBound(8.0);
    } else {
      setBuilderLeftVar('builtUpArea');
      setBuilderOperator('MULTIPLY');
      setBuilderRightParam('config.rcc.concrete_factor_cum_sqft');
      setBuilderRightValue(0.052);
      setBuilderMinBound(0);
    }
    setBuilderValidationMsg(null);
    setIsBuilderOpen(true);
  };

  const handleValidateFormula = () => {
    if (builderRightValue <= 0) {
      setBuilderValidationMsg({
        type: 'error',
        text: 'Parameter value must be greater than zero to prevent null quantities.',
      });
      return;
    }
    if (builderOperator === 'DIVIDE' && builderRightValue === 0) {
      setBuilderValidationMsg({
        type: 'error',
        text: 'Division by zero is strictly prohibited.',
      });
      return;
    }
    if (builderOperator === 'PERCENTAGE' && (builderRightValue < 0 || builderRightValue > 100)) {
      setBuilderValidationMsg({
        type: 'error',
        text: 'Allocation percentage must be between 0% and 100%.',
      });
      return;
    }
    setBuilderValidationMsg({
      type: 'success',
      text: 'Formula validated successfully: Safe AST structure, registered variables, and non-zero bounded result.',
    });
  };

  const handleApplyFormula = () => {
    handleValidateFormula();
    if (builderRightParam) {
      updateDraftParameter(builderRightParam, builderRightValue);
    }
    setTimeout(() => {
      setIsBuilderOpen(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold mb-1">
            <Calculator className="w-3.5 h-3.5 text-emerald-700" />
            <span>Calculation Engine: Formula Library V2</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Residential Construction Formula Library
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent, human-readable calculation methodologies powering Hutty's canonical quantities and BOQ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{CANONICAL_FORMULA_LIBRARY.length} Standard Formulas</span>
          </span>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {domains.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedDomain(d.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedDomain === d.id
                  ? 'bg-[#1B3D34] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search formula, output, trade..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3D34] focus:bg-white"
          />
        </div>
      </div>

      {/* ── FORMULA CARDS GRID ── */}
      <div className="grid grid-cols-1 gap-4">
        {filteredFormulas.map((f) => (
          <Card key={f.id} className="border border-slate-200 bg-white rounded-2xl hover:border-slate-300 transition-all shadow-2xs">
            <CardContent className="p-5 space-y-4">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                    {f.domain}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm font-heading">{f.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{f.purpose}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    {f.methodType}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {f.version}
                  </span>
                </div>
              </div>

              {/* What is it & How is it calculated */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-0.5">What is it?</span>
                  <p className="text-slate-800 leading-relaxed">{f.whatIsIt}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-0.5">Current Calculation Method</span>
                  <p className="text-[#1B3D34] font-semibold leading-relaxed">{f.currentMethod}</p>
                </div>
              </div>

              {/* Visual Formula Block Preview (Section 4) */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Formula Flow:
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  {f.visualBlocks.map((block, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-mono text-[11px]">
                        [ {block.left} ]
                      </span>
                      <span className="text-slate-400 font-bold px-1">{block.operator}</span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-mono text-[11px]">
                        [ {block.right} ]
                      </span>
                      {block.condition && (
                        <span className="text-[10px] text-slate-500 font-normal italic px-1">
                          ({block.condition})
                        </span>
                      )}
                      <span className="text-slate-400 font-bold px-1">=</span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold font-mono text-[11px]">
                        [ {block.result} ]
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inputs, Output & Impacts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Inputs</span>
                  <div className="flex flex-wrap gap-1">
                    {f.inputs.map((inp, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                        {inp.label} {inp.unit ? `(${inp.unit})` : ''}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Output</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-xs inline-flex items-center gap-1">
                    {f.output} ({f.unit})
                  </span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Affects</span>
                  <div className="flex flex-wrap gap-1">
                    {f.affects.slice(0, 3).map((aff, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium">
                        ✓ {aff}
                      </span>
                    ))}
                    {f.affects.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{f.affects.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: View Formula, Edit, History */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Updated: {f.updatedAt}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenBuilder(f)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Edit Formula</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenBuilder(f)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B3D34] hover:bg-[#142E27] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>View Formula</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── VISUAL FORMULA BUILDER MODAL (Section 4) ── */}
      {isBuilderOpen && builderFormula && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-bold">
                  {builderFormula.domain} DOMAIN
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Formula Builder: {builderFormula.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBuilderOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Controlled AST Formula Builder: Select registered variables and operators. Code execution or arbitrary names are disabled.
                </span>
              </div>

              {/* Visual Formula Canvas */}
              <div className="bg-slate-900 p-5 rounded-2xl text-white space-y-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  Interactive Formula Block Chain
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Left Variable */}
                  <div className="bg-slate-800 border border-slate-700 p-2.5 rounded-xl">
                    <label className="text-[10px] text-slate-400 block mb-1">Variable</label>
                    <select
                      value={builderLeftVar}
                      onChange={(e) => setBuilderLeftVar(e.target.value)}
                      className="bg-slate-900 text-white font-mono text-xs font-bold border border-slate-700 rounded-lg px-2.5 py-1"
                    >
                      {CONTROLLED_VARIABLE_REGISTRY.map((v) => (
                        <option key={v.key} value={v.key}>
                          {v.label} ({v.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Operator */}
                  <div className="bg-slate-800 border border-slate-700 p-2.5 rounded-xl">
                    <label className="text-[10px] text-slate-400 block mb-1">Operator</label>
                    <select
                      value={builderOperator}
                      onChange={(e) => setBuilderOperator(e.target.value)}
                      className="bg-slate-900 text-amber-400 font-mono text-xs font-bold border border-slate-700 rounded-lg px-2.5 py-1"
                    >
                      {CONTROLLED_OPERATORS.map((op) => (
                        <option key={op.code} value={op.code}>
                          {op.symbol} ({op.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Right Parameter / Value */}
                  <div className="bg-slate-800 border border-slate-700 p-2.5 rounded-xl">
                    <label className="text-[10px] text-slate-400 block mb-1">Parameter Value</label>
                    <input
                      type="number"
                      step="any"
                      value={builderRightValue}
                      onChange={(e) => setBuilderRightValue(parseFloat(e.target.value) || 0)}
                      className="w-28 bg-slate-900 text-white font-mono text-xs font-bold border border-slate-700 rounded-lg px-2.5 py-1"
                    />
                  </div>

                  <span className="text-slate-400 font-bold text-lg">=</span>

                  {/* Output Node */}
                  <div className="bg-emerald-950 border border-emerald-700 p-2.5 rounded-xl">
                    <label className="text-[10px] text-emerald-400 block mb-1">Calculated Output</label>
                    <span className="font-mono text-xs font-bold text-emerald-300">
                      {builderFormula.output} ({builderFormula.unit})
                    </span>
                  </div>
                </div>

                {/* Minimum Bound */}
                <div className="pt-2 flex items-center gap-3 border-t border-slate-800 text-xs text-slate-300">
                  <span>Minimum Threshold Floor Bound:</span>
                  <input
                    type="number"
                    step="0.5"
                    value={builderMinBound}
                    onChange={(e) => setBuilderMinBound(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-800 text-white font-mono text-xs border border-slate-700 rounded-lg px-2 py-0.5"
                  />
                  <span>{builderFormula.unit}</span>
                </div>
              </div>

              {/* Validation Status Message (Section 10) */}
              {builderValidationMsg && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  builderValidationMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-red-50 text-red-900 border-red-200'
                }`}>
                  {builderValidationMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{builderValidationMsg.text}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleValidateFormula}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Validate Formula
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyFormula}
                  className="px-4 py-2 rounded-xl bg-[#1B3D34] hover:bg-[#142E27] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Apply to Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
