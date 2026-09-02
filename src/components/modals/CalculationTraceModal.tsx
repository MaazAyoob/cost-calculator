import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculationTraceStep } from '../../calculation-engine/types';
import { X, ChevronDown, ChevronUp, Calculator, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/cn';

export interface CalculationTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  trace: CalculationTraceStep[];
}

export const CalculationTraceModal: React.FC<CalculationTraceModalProps> = ({
  isOpen,
  onClose,
  trace = [],
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1B3D34]/50 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[88vh] text-left z-10"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-[#F8F8F6] border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(27,61,52,0.08)] flex items-center justify-center text-[#1B3D34]">
                <Calculator className="w-5 h-5 text-[#1B3D34]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1B3D34] font-heading">
                  How This Was Calculated
                </h3>
                <p className="text-xs text-[#4B5563]">
                  Hutty preliminary estimation rules, formulas, inputs &amp; adjustments
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#E5E7EB] text-[#4B5563] flex items-center justify-center transition-colors cursor-pointer border border-[#E5E7EB]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preliminary Notice */}
          <div className="px-6 py-3 bg-[rgba(242,140,40,0.08)] border-b border-[#F28C28]/20 flex items-center gap-2 text-xs text-[#1B3D34]">
            <ShieldAlert className="w-4 h-4 text-[#F28C28] shrink-0" />
            <span>
              Preliminary estimation rules only. Final structural drawings and member detailing are certified by the appointed engineer.
            </span>
          </div>

          {/* Trace Steps List */}
          <div className="p-6 overflow-y-auto space-y-3 divide-y divide-[#E5E7EB]/60">
            {trace.map((step, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div key={step.ruleId || idx} className="pt-3 first:pt-0">
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#F8F8F6] hover:bg-[#E5E7EB]/40 transition-colors text-left cursor-pointer border border-[#E5E7EB]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB] text-[#1B3D34]">
                        {step.ruleId || `RULE-${idx + 1}`}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-[#1B3D34] block">
                          {step.tradeCategory || step.category}: {step.parameter}
                        </span>
                        <span className="text-[11px] text-[#4B5563] line-clamp-1 font-mono">
                          {step.formula}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-black text-[#1B3D34] font-mono block">
                          {typeof step.result === 'number' ? step.result.toLocaleString() : step.result} {step.unit}
                        </span>
                        {step.amount ? (
                          <span className="text-[10px] text-[#4B5563] font-mono">
                            {formatCurrency(step.amount)}
                          </span>
                        ) : null}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#4B5563]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#4B5563]" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Calculation Chain Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-white rounded-b-xl border-x border-b border-[#E5E7EB] space-y-3 text-xs"
                    >
                      {step.explanation && (
                        <div className="p-3 bg-[rgba(27,61,52,0.03)] rounded-lg border border-[#1B3D34]/10 text-[#1B3D34] leading-relaxed">
                          <strong className="block text-[11px] font-bold text-[#1B3D34] mb-0.5">
                            Customer-Friendly Explanation
                          </strong>
                          {step.explanation}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
                          <span className="text-[10px] uppercase font-bold text-[#4B5563] block">Formula Applied</span>
                          <span className="font-mono text-[#1B3D34] font-bold text-[11px]">{step.formula}</span>
                        </div>
                        <div className="p-2.5 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
                          <span className="text-[10px] uppercase font-bold text-[#4B5563] block">Wastage / Adjustments</span>
                          <span className="text-[#1B3D34] font-medium text-[11px]">{step.adjustments || 'Standard trade factor'}</span>
                        </div>
                      </div>

                      {step.inputs && (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-[#4B5563] block">Source Inputs &amp; Parameters</span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(step.inputs).map(([k, v]) => (
                              <div key={k} className="p-2 bg-[#F8F8F6] rounded-md text-[10px] border border-[#E5E7EB]/80 font-mono">
                                <span className="text-[#4B5563] block truncate">{k}:</span>
                                <span className="font-bold text-[#1B3D34] truncate block">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#4B5563]">
                        <span>Assumption: {step.assumption}</span>
                        {step.unitRate ? (
                          <span className="font-mono font-bold text-[#1B3D34]">Unit Rate: ₹{step.unitRate.toLocaleString('en-IN')}/{step.unit}</span>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#F8F8F6] border-t border-[#E5E7EB] flex items-center justify-between text-xs">
            <span className="text-[#4B5563]">Hutty Calculation Traceability &bull; 100% Auditable Chain</span>
            <button
              onClick={onClose}
              className="hutty-btn-primary px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
            >
              Done Inspecting
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
