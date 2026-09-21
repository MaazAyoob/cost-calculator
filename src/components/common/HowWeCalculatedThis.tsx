import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Calculator,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Info,
} from 'lucide-react';
import { useStepExplanation } from '../../store/useCalculationStore';
import { formatCurrency, cn } from '../../utils/cn';

interface HowWeCalculatedThisProps {
  stepKey: string;
  defaultExpanded?: boolean;
  className?: string;
}

export const HowWeCalculatedThis: React.FC<HowWeCalculatedThisProps> = ({
  stepKey,
  defaultExpanded = false,
  className,
}) => {
  const explanation = useStepExplanation(stepKey);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!explanation) {
    return null;
  }

  const {
    title,
    stepTotal,
    unitRateOrBenchmark,
    summaryMetrics = [],
    inputsUsed = [],
    derivedQuantities = [],
    calculationLogic = [],
    rateBreakdown = [],
    costBreakdown,
    whatDoesThisAffect = [],
    quantityVsPriceNote,
  } = explanation;

  return (
    <div
      className={cn(
        'rounded-2xl border border-[#E5E7EB] bg-[#FDFDFC] overflow-hidden transition-all duration-200 shadow-sm',
        className
      )}
    >
      {/* ── HEADER / SUMMARY ACCORDION TRIGGER ── */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none hover:bg-[#F8F8F6] transition-colors border-b border-transparent data-[expanded=true]:border-[#E5E7EB]"
        data-expanded={isExpanded}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[rgba(27,61,52,0.08)] text-[#1B3D34] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1B3D34]">
                Calculation Transparency
              </span>
              {unitRateOrBenchmark && (
                <span className="text-[11px] font-medium bg-[#F0F2F1] text-[#1B3D34] px-2 py-0.5 rounded-md">
                  {unitRateOrBenchmark}
                </span>
              )}
            </div>
            <h4 className="text-sm font-semibold text-[#1B3D34] mt-0.5">
              How we calculated this &bull; {title}
            </h4>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0F2F1]">
          {stepTotal > 0 && (
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-[#4B5563] block">Step Total</span>
              <span className="text-sm font-bold text-[#1B3D34] font-mono">
                {formatCurrency(stepTotal)}
              </span>
            </div>
          )}

          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1B3D34] bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-lg shadow-2xs hover:bg-[#F8F8F6] transition-colors"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Formula & Rates'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-[#F28C28]" /> : <ChevronDown className="w-4 h-4 text-[#F28C28]" />}
          </button>
        </div>
      </div>

      {/* ── EXPANDED TRANSPARENCY BODY ── */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6 bg-white divide-y divide-[#F0F2F1]">
          {/* ── SECTION 1: SUMMARY METRICS PILLS ── */}
          {summaryMetrics.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pb-5">
              {summaryMetrics.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex flex-col justify-between"
                >
                  <span className="text-[11px] text-[#4B5563] font-medium">{m.label}</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-base font-bold text-[#1B3D34] font-mono">
                      {m.value}
                    </span>
                    {m.unit && <span className="text-[11px] text-[#4B5563] font-medium">{m.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── SECTION 2: INPUTS USED & DOWNSTREAM IMPACTS ── */}
          <div className="pt-5 space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#1B3D34]" />
              <h5 className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider">
                1. Inputs &amp; Parameters Used
              </h5>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {inputsUsed.map((inp, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#FAFBF9] rounded-lg border border-[#E5E7EB] flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-[#1B3D34]">{inp.label}</span>
                    {inp.description && (
                      <span className="block text-[10px] text-[#4B5563] mt-0.5">{inp.description}</span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-[#1B3D34] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                    {inp.value} {inp.unit || ''}
                  </span>
                </div>
              ))}
            </div>

            {/* WHAT DOES THIS AFFECT? */}
            {whatDoesThisAffect.length > 0 && (
              <div className="p-3 bg-[rgba(27,61,52,0.04)] rounded-xl border border-[rgba(27,61,52,0.12)] space-y-1.5">
                <span className="text-[11px] font-bold text-[#1B3D34] flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                  What Does This Step Affect?
                </span>
                <ul className="text-xs text-[#4B5563] space-y-1 list-disc list-inside">
                  {whatDoesThisAffect.map((eff, idx) => (
                    <li key={idx} className="leading-snug">
                      {eff}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── SECTION 3: DERIVED PHYSICAL QUANTITIES ── */}
          {derivedQuantities.length > 0 && (
            <div className="pt-5 space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1B3D34]" />
                <h5 className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider">
                  2. Derived Physical Quantities (Takeoff)
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {derivedQuantities.map((dq, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-[#E5E7EB] shadow-2xs flex flex-col justify-between"
                  >
                    <span className="text-[11px] text-[#4B5563] font-medium">{dq.label}</span>
                    <div className="my-1 flex items-baseline gap-1 font-mono font-bold text-[#1B3D34]">
                      <span className="text-sm">{dq.quantity}</span>
                      <span className="text-[10px] text-[#4B5563] font-sans font-normal">{dq.unit}</span>
                    </div>
                    {dq.description && (
                      <span className="text-[10px] text-[#4B5563] line-clamp-2 leading-tight">
                        {dq.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SECTION 4: STEP-BY-STEP CALCULATION LOGIC ── */}
          {calculationLogic.length > 0 && (
            <div className="pt-5 space-y-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#1B3D34]" />
                <h5 className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider">
                  3. Calculation Logic &amp; Engineering Formulae
                </h5>
              </div>

              <div className="space-y-2.5">
                {calculationLogic.map((logic, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1B3D34]">{logic.title}</span>
                      <span className="font-mono font-bold text-[#1B3D34] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                        = {logic.resultText}
                      </span>
                    </div>
                    <div className="text-[#4B5563] font-mono text-[11px] bg-white p-2 rounded-md border border-[#E5E7EB]">
                      <span className="text-[10px] uppercase font-sans text-[#9CA3AF] block mb-0.5">Formula</span>
                      {logic.formula}
                    </div>
                    {logic.substitutions && (
                      <div className="text-[11px] text-[#4B5563]">
                        <span className="font-semibold text-[#1B3D34]">Substituted values:</span>{' '}
                        {logic.substitutions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SECTION 5: RATE BREAKDOWN & PRICE TRANSPARENCY ── */}
          {rateBreakdown.length > 0 && (
            <div className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#1B3D34]" />
                  <h5 className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider">
                    4. Resolved Item Rates &amp; Costs
                  </h5>
                </div>
                <span className="text-[11px] text-[#4B5563] font-medium">
                  {rateBreakdown.length} Itemized Lines
                </span>
              </div>

              <div className="overflow-x-auto border border-[#E5E7EB] rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAFBF9] border-b border-[#E5E7EB] text-[#4B5563]">
                      <th className="py-2.5 px-3 font-bold uppercase">Item / Specification</th>
                      <th className="py-2.5 px-3 font-bold uppercase text-right">Quantity</th>
                      <th className="py-2.5 px-3 font-bold uppercase text-right">Unit Rate</th>
                      <th className="py-2.5 px-3 font-bold uppercase text-right">Cost (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] bg-white">
                    {rateBreakdown.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FDFDFC]">
                        <td className="py-2 px-3 text-[#1B3D34] font-medium">
                          {item.item}
                          {item.rateSource && (
                            <span className="block text-[10px] text-[#4B5563] font-normal">
                              Source: {item.rateSource}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right text-[#4B5563] font-mono whitespace-nowrap">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2 px-3 text-right text-[#4B5563] font-mono whitespace-nowrap">
                          ₹{Number(item.rate).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-[#1B3D34] font-mono whitespace-nowrap">
                          {formatCurrency(item.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* QUANTITY VS PRICE INVARIANCE NOTE */}
              {quantityVsPriceNote && (
                <div className="p-3 bg-[rgba(242,140,40,0.06)] rounded-xl border border-[rgba(242,140,40,0.2)] flex items-start gap-2 text-xs text-[#4B5563]">
                  <ShieldCheck className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1B3D34] block">Quantity vs. Price Independence:</span>
                    <p className="mt-0.5 leading-relaxed">{quantityVsPriceNote}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SECTION 6: COST RECONCILIATION ── */}
          {costBreakdown && costBreakdown.total > 0 && (
            <div className="pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#1B3D34]" />
                <div>
                  <span className="text-xs font-bold text-[#1B3D34] block">Step Cost Reconciliation</span>
                  <span className="text-[11px] text-[#4B5563]">
                    {costBreakdown.materials !== undefined && `Materials: ${formatCurrency(costBreakdown.materials)}`}
                    {costBreakdown.fixtures !== undefined && ` • Fixtures: ${formatCurrency(costBreakdown.fixtures)}`}
                    {costBreakdown.labour !== undefined && ` • Labour: ${formatCurrency(costBreakdown.labour)}`}
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E7EB]">
                <span className="text-[10px] uppercase font-bold text-[#4B5563] block">Reconciled Total</span>
                <span className="text-base font-bold text-[#1B3D34] font-mono">
                  {formatCurrency(costBreakdown.total)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
