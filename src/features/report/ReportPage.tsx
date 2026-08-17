import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { useReportStore } from '../../store/useReportStore';
import { useCalculationStore } from '../../store/useCalculationStore';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LeadCaptureModal } from '../../components/modals/LeadCaptureModal';
import {
  Download, Printer, Shield, Building, Layers, CheckCircle2,
  FileSpreadsheet, Calendar, CreditCard, ShoppingCart, Lightbulb,
  ChevronDown, ChevronUp, Lock,
} from 'lucide-react';
import { formatCurrency } from '../../utils/cn';

export const ReportPage: React.FC = () => {
  const { preparedFor, isLeadCaptured, leadInfo } = useReportStore();
  const { result } = useCalculationStore();
  const { report, area, quantities, budget, timeline, paymentPlan, boq, input } = result;

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    exec: true,
    config: true,
    materials: true,
    boq: true,
    payments: false,
    assumptions: true,
  });

  const toggleAccordion = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrintRequest = () => {
    if (!isLeadCaptured) {
      setShowLeadModal(true);
    } else {
      window.print();
    }
  };

  return (
    <motion.div variants={pageFadeVariant} initial="initial" animate="animate" exit="exit" className="space-y-6 max-w-4xl mx-auto py-2">
      <PageHeader
        title="Digital QS BOQ & Feasibility Report"
        subtitle="Bank-loan ready engineering specification, itemized BOQ, timeline & payment roadmap."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Quantity Surveyor Report' }]}
        actions={
          <div className="flex items-center gap-3 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrintRequest} leftIcon={<Printer className="w-4 h-4" />}>
              Print / Save PDF
            </Button>
            <Button size="sm" onClick={handlePrintRequest} leftIcon={isLeadCaptured ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}>
              {isLeadCaptured ? 'Download Official BOQ' : 'Unlock Full Report'}
            </Button>
          </div>
        }
      />


      {/* Legend Bar */}
      <Card className="p-3 bg-slate-900 text-white border-none print:hidden flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Data Source Tags:</span>
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">[USER INPUT]</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">[CALCULATED VALUE]</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">[ASSUMPTION]</span>
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">[MARKET RATE]</span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">[ESTIMATED COST]</span>
        </div>
      </Card>

      {/* Document Sheet Container */}
      <Card className="p-6 sm:p-10 bg-white border border-slate-200 shadow-soft-lg space-y-6 print:shadow-none print:border-none">
        {/* Header Branding */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                C
              </div>
              <span className="font-black text-slate-900 text-lg tracking-tight">COST CALCULATOR BY RIGHTCON</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Construction Feasibility & BOQ Specification</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {report.projectId} | IS 456 Verified</p>
          </div>

          <div className="text-right space-y-1">
            <StatusBadge status="success" label="Calculations Verified" />
            <p className="text-[11px] text-slate-500 font-medium pt-1">Prepared For: {preparedFor}</p>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden print-avoid-break">
          <button
            type="button"
            onClick={() => toggleAccordion('exec')}
            className="w-full p-4 bg-slate-50 flex items-center justify-between font-extrabold text-xs text-slate-900 cursor-pointer print:bg-white print:p-2"
          >
            <span className="flex items-center gap-2 uppercase tracking-wider text-blue-600">
              <Building className="w-4 h-4" /> 1. Executive Summary & Core Feasibility
            </span>
            <span className="print:hidden">
              {openSections.exec ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {(openSections.exec || true) && (
            <div className={`p-4 bg-white border-t border-slate-200 space-y-3 ${openSections.exec ? 'block' : 'hidden'} print:block print:p-2`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Usable BUA</span>
                  <p className="text-sm font-black text-slate-900">{area.totalBUASqFt.toLocaleString('en-IN')} Sq Ft</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Estimated Cost</span>
                  <p className="text-sm font-black text-blue-600">{formatCurrency(budget.totalProjectCost)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Rate / Sq Ft</span>
                  <p className="text-sm font-black text-slate-900">₹{budget.costPerSqFt.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Est. Duration</span>
                  <p className="text-sm font-black text-slate-900">{timeline.totalMonths} Months</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Project Configuration & Area */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden print-avoid-break">
          <button
            type="button"
            onClick={() => toggleAccordion('config')}
            className="w-full p-4 bg-slate-50 flex items-center justify-between font-extrabold text-xs text-slate-900 cursor-pointer print:bg-white print:p-2"
          >
            <span className="flex items-center gap-2 uppercase tracking-wider text-blue-600">
              <Shield className="w-4 h-4" /> 2-4. Project Inputs, Sanction Body & Footprint
            </span>
            <span className="print:hidden">
              {openSections.config ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {(openSections.config || true) && (
            <div className={`p-4 bg-white border-t border-slate-200 space-y-3 text-xs ${openSections.config ? 'block' : 'hidden'} print:block print:p-2`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-blue-600 block">[USER INPUT] Location</span>
                  <div className="font-extrabold text-slate-900">{input.city}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-emerald-600 block">[CALCULATED] Sanction Body</span>
                  <div className="font-extrabold text-slate-900">{input.authority}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-blue-600 block">[USER INPUT] Plot Dimensions</span>
                  <div className="font-extrabold text-slate-900">{input.plotWidth}' x {input.plotLength}'</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-blue-600 block">[USER INPUT] Floor Config</span>
                  <div className="font-extrabold text-slate-900">{input.floors} Levels (G+{input.floors - 1})</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5-15. Materials & Specifications */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden print-avoid-break">
          <button
            type="button"
            onClick={() => toggleAccordion('materials')}
            className="w-full p-4 bg-slate-50 flex items-center justify-between font-extrabold text-xs text-slate-900 cursor-pointer print:bg-white print:p-2"
          >
            <span className="flex items-center gap-2 uppercase tracking-wider text-blue-600">
              <Layers className="w-4 h-4" /> 5-15. Materials, Finishes & Engineering Specifications
            </span>
            <span className="print:hidden">
              {openSections.materials ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {(openSections.materials || true) && (
            <div className={`p-4 bg-white border-t border-slate-200 space-y-4 text-xs ${openSections.materials ? 'block' : 'hidden'} print:block print:p-2`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">Structural TMT Steel</span>
                  <div className="font-black text-slate-900">{input.materialBrands.steel || 'Unselected'} &bull; {quantities.steelTonnes} Tonnes</div>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Portland Cement</span>
                  <div className="font-black text-slate-900">{input.materialBrands.cement || 'Unselected'} &bull; {quantities.cementBags.toLocaleString()} Bags</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block">Flooring (Living)</span>
                  <div className="font-extrabold text-slate-800">{input.flooringZones.living}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block">Doors</span>
                  <div className="font-extrabold text-slate-800">{input.doors.mainDoor}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block">Windows</span>
                  <div className="font-extrabold text-slate-800">{input.windows.primaryMaterial} ({input.windows.subGrade})</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block">Electrical Wires</span>
                  <div className="font-extrabold text-slate-800">{input.electrical.wireTier}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block">Plumbing & Fittings</span>
                  <div className="font-extrabold text-slate-800">{input.bathroomFittings.cpvcBrand} / {input.bathroomFittings.sanitaryTier}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block">Painting</span>
                  <div className="font-extrabold text-slate-800">{input.painting.brand} ({input.painting.internalPaint})</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 16-17. BOQ & Cost Schedule */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion('boq')}
            className="w-full p-4 bg-slate-50 flex items-center justify-between font-extrabold text-xs text-slate-900 cursor-pointer print:bg-white print:p-2"
          >
            <span className="flex items-center gap-2 uppercase tracking-wider text-blue-600">
              <FileSpreadsheet className="w-4 h-4" /> 16-17. Itemized BOQ & Cost Allocations ({boq.length} Line Items)
            </span>
            <span className="print:hidden">
              {openSections.boq ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {(openSections.boq || true) && (
            <div className={`p-4 bg-white border-t border-slate-200 space-y-4 text-xs ${openSections.boq ? 'block' : 'hidden'} print:block print:p-2`}>
              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5 text-right">Qty</th>
                      <th className="p-2.5">Unit</th>
                      <th className="p-2.5 text-right">Rate (₹)</th>
                      <th className="p-2.5 text-right">%</th>
                      <th className="p-2.5 text-right">Amount (₹)</th>
                      <th className="p-2.5">Material / Spec</th>
                      <th className="p-2.5">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {boq.map((item) => (
                      <tr key={item.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 font-mono text-[10px] text-slate-400">{item.code}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{item.description}</td>
                        <td className="p-2.5 text-slate-500">{item.category}</td>
                        <td className="p-2.5 text-right font-medium text-slate-800">{item.quantity.toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-slate-500">{item.unit}</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">₹{item.unitRate.toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-right font-bold text-blue-600">{item.percentage}%</td>
                        <td className="p-2.5 text-right font-extrabold text-slate-900">{formatCurrency(item.amount)}</td>
                        <td className="p-2.5 font-medium text-slate-600 max-w-[140px] truncate">{item.brand}</td>
                        <td className="p-2.5 text-slate-400 text-[10px] max-w-[140px] truncate">{item.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 18-20. Timeline & Payment Roadmap */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden print-avoid-break">
          <button
            type="button"
            onClick={() => toggleAccordion('payments')}
            className="w-full p-4 bg-slate-50 flex items-center justify-between font-extrabold text-xs text-slate-900 cursor-pointer print:bg-white print:p-2"
          >
            <span className="flex items-center gap-2 uppercase tracking-wider text-blue-600">
              <CreditCard className="w-4 h-4" /> 18-20. Construction Timeline & Payment Milestones
            </span>
            <span className="print:hidden">
              {openSections.payments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {(openSections.payments || true) && (
            <div className={`p-4 bg-white border-t border-slate-200 space-y-3 text-xs ${openSections.payments ? 'block' : 'hidden'} print:block print:p-2`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {paymentPlan.slice(0, 6).map((m) => (
                  <div key={m.stage} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-blue-600">Stage {m.stage}:</span>{' '}
                      <span className="font-bold text-slate-800">{m.title}</span>
                      <div className="text-[10px] text-slate-400">{m.targetDate} • {m.percentage}%</div>
                    </div>
                    <div className="text-right font-extrabold text-slate-900">{formatCurrency(m.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 21-22. Assumptions & References */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden print-avoid-break">
          <button
            type="button"
            onClick={() => toggleAccordion('assumptions')}
            className="w-full p-4 bg-slate-50 flex items-center justify-between font-extrabold text-xs text-slate-900 cursor-pointer print:bg-white print:p-2"
          >
            <span className="flex items-center gap-2 uppercase tracking-wider text-blue-600">
              <Lightbulb className="w-4 h-4 text-amber-500" /> 21-22. Feasibility Assumptions & Engineering Standards
            </span>
            <span className="print:hidden">
              {openSections.assumptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {(openSections.assumptions || true) && (
            <div className={`p-4 bg-white border-t border-slate-200 space-y-4 text-xs text-slate-600 ${openSections.assumptions ? 'block' : 'hidden'} print:block print:p-2`}>
              <div className="space-y-1.5">
                <p>• <span className="font-bold text-slate-800">Nominal Soil Bearing Capacity</span>: 180 kN/sqm (Standard Isolated Footings assumption &bull; <span className="text-amber-600 font-semibold">Requires Client Confirmation</span>).</p>
                <p>• <span className="font-bold text-slate-800">IS 456:2000 & IS 13920</span> Code of Practice for Plain, Reinforced and Ductile Concrete.</p>
                <p>• <span className="font-bold text-slate-800">IS 875:1987</span> Code of Practice for Structural Design Loads (Dead, Live & Wind).</p>
                <p>• <span className="font-bold text-slate-800">NBC 2016</span> National Building Code of India (Clear Height 10ft, Stairway & Fire Norms).</p>
                <p>• <span className="font-bold text-slate-800">{input.authority}</span> Bylaws & Zoned FAR Compliance (60% Ground Coverage, 92% Floor Efficiency).</p>
              </div>

              {/* Engineering Trace Audit Table */}
              {report.trace && report.trace.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Mathematical Calculation Trace (Auditable Derivations)
                  </span>
                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-2">Parameter</th>
                          <th className="p-2">Category</th>
                          <th className="p-2">Formula</th>
                          <th className="p-2">Governing Assumption</th>
                          <th className="p-2 text-right">Result</th>
                          <th className="p-2">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.trace.map((t, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-900">{t.parameter}</td>
                            <td className="p-2 text-slate-500">{t.category}</td>
                            <td className="p-2 font-mono text-blue-600">{t.formula}</td>
                            <td className="p-2 text-slate-600">{t.assumption}</td>
                            <td className="p-2 text-right font-black text-slate-900">{typeof t.result === 'number' ? t.result.toLocaleString('en-IN') : t.result}</td>
                            <td className="p-2 text-slate-500">{t.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Report Footer Verification */}
        <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
          <span>Cost Calculator Engine v1.0.0 &bull; Rightcon Digital Quantity Surveyor</span>
          <span>Formula-Driven Indicative Construction Estimate</span>
        </div>
      </Card>


      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSuccess={() => {
          setTimeout(() => window.print(), 300);
        }}
      />
    </motion.div>
  );
};

