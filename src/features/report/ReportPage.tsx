import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { useReportStore } from '../../store/useReportStore';
import { useCalculationStore } from '../../store/useCalculationStore';
import { LeadCaptureModal } from '../../components/modals/LeadCaptureModal';
import { Printer, Download, ArrowLeft, Building2 } from 'lucide-react';
import { formatCurrency } from '../../utils/cn';

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { preparedFor, isLeadCaptured } = useReportStore();
  const { result } = useCalculationStore();
  const { report, area, quantities, budget, timeline, paymentPlan, boq, input } = result;

  const [showLeadModal, setShowLeadModal] = useState(false);

  const handlePrintRequest = () => {
    if (!isLeadCaptured) {
      setShowLeadModal(true);
    } else {
      window.print();
    }
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.div
      variants={pageFadeVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-[#F7F7F5] py-8 sm:py-12"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 text-left">

        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between gap-4 print:hidden">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#667085] hover:text-[#172033] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintRequest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 text-xs font-bold text-[#172033] transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#1F4B43]" /> Print / PDF
            </button>
            <button
              type="button"
              onClick={handlePrintRequest}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1F4B43] hover:bg-[#163731] text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download Report
            </button>
          </div>
        </div>

        {/* Document Sheet (Professional Construction Document) */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 sm:p-12 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">

          {/* 1. Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-[#172033]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#1F4B43] flex items-center justify-center text-white text-xs font-bold">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-extrabold text-lg sm:text-xl text-[#172033] tracking-tight">
                  Cost Calculator by Rightcon
                </span>
              </div>
              <p className="text-xs text-[#667085]">Pre-Construction Quantity Feasibility &amp; BOQ Specification</p>
            </div>

            <div className="text-xs text-left sm:text-right space-y-0.5 text-[#667085]">
              <p><strong className="text-[#172033]">Project ID:</strong> {report.projectId || 'PRJ-2026-BLR'}</p>
              <p><strong className="text-[#172033]">Date:</strong> {currentDate}</p>
              <p><strong className="text-[#172033]">Prepared For:</strong> {preparedFor || 'Residential Client'}</p>
            </div>
          </div>

          {/* 2. Project Summary */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4B43] border-b border-[#E5E7EB] pb-1.5">
              1. Project Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-[#F7F7F5] rounded-lg">
                <span className="text-[10px] text-[#667085] uppercase block">Location</span>
                <span className="font-bold text-[#172033]">{input.city} ({input.authority})</span>
              </div>
              <div className="p-3 bg-[#F7F7F5] rounded-lg">
                <span className="text-[10px] text-[#667085] uppercase block">Plot Dimensions</span>
                <span className="font-bold text-[#172033]">{input.plotWidth}' × {input.plotLength}' ({(input.plotWidth * input.plotLength).toLocaleString()} sq.ft)</span>
              </div>
              <div className="p-3 bg-[#F7F7F5] rounded-lg">
                <span className="text-[10px] text-[#667085] uppercase block">Built-Up Area</span>
                <span className="font-bold text-[#172033]">{area.totalBUASqFt.toLocaleString()} sq.ft ({input.floors} Floors)</span>
              </div>
              <div className="p-3 bg-[#F7F7F5] rounded-lg">
                <span className="text-[10px] text-[#667085] uppercase block">Typology</span>
                <span className="font-bold text-[#172033]">{input.houseType} ({input.qualityTier})</span>
              </div>
            </div>
          </section>

          {/* 3. Cost Summary */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4B43] border-b border-[#E5E7EB] pb-1.5">
              2. Cost Summary
            </h2>
            <div className="p-4 bg-[#F7F7F5] rounded-xl border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Total Estimated Project Cost</span>
                <span className="text-3xl font-black text-[#1F4B43]">{formatCurrency(budget.totalProjectCost)}</span>
              </div>
              <div className="text-xs text-[#667085]">
                <span>Effective Rate: <strong className="text-[#172033]">₹{budget.costPerSqFt.toLocaleString()} / sq.ft</strong></span>
                <span className="mx-2">•</span>
                <span>Est. Duration: <strong className="text-[#172033]">{timeline.totalMonths} Months</strong></span>
              </div>
            </div>
          </section>

          {/* 4. Itemized BOQ Table */}
          <section className="space-y-3">
            <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4B43]">
                3. Bill of Quantities (BOQ Takeoff)
              </h2>
              <span className="text-[11px] text-[#667085] font-mono">{boq.length} Line Items</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F7F7F5] text-[#172033] font-bold border-b border-[#E5E7EB] text-[11px]">
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Trade Description</th>
                    <th className="p-2.5 text-right">Quantity</th>
                    <th className="p-2.5">Unit</th>
                    <th className="p-2.5 text-right">Rate (₹)</th>
                    <th className="p-2.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-[11px]">
                  {boq.map((item) => (
                    <tr key={item.code} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-[10px] text-[#667085]">{item.code}</td>
                      <td className="p-2.5 font-semibold text-[#172033]">{item.description}</td>
                      <td className="p-2.5 text-right text-[#172033]">{item.quantity.toLocaleString()}</td>
                      <td className="p-2.5 text-[#667085]">{item.unit}</td>
                      <td className="p-2.5 text-right font-mono text-[#667085]">₹{item.unitRate.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-bold text-[#172033]">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. Material Specifications */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4B43] border-b border-[#E5E7EB] pb-1.5">
              4. Materials &amp; Brand Specifications
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-[#F7F7F5] rounded border border-[#E5E7EB]">
                <span className="text-[10px] text-[#667085] block font-semibold">Structural Steel</span>
                <span className="font-bold text-[#172033]">{input.materialBrands.steel || 'Tata Tiscon'} ({quantities.steelTonnes} Tonnes)</span>
              </div>
              <div className="p-2.5 bg-[#F7F7F5] rounded border border-[#E5E7EB]">
                <span className="text-[10px] text-[#667085] block font-semibold">Portland Cement</span>
                <span className="font-bold text-[#172033]">{input.materialBrands.cement || 'UltraTech'} ({quantities.cementBags.toLocaleString()} Bags)</span>
              </div>
              <div className="p-2.5 bg-[#F7F7F5] rounded border border-[#E5E7EB]">
                <span className="text-[10px] text-[#667085] block font-semibold">Flooring</span>
                <span className="font-bold text-[#172033]">{input.flooringZones.living}</span>
              </div>
              <div className="p-2.5 bg-[#F7F7F5] rounded border border-[#E5E7EB]">
                <span className="text-[10px] text-[#667085] block font-semibold">Main Door</span>
                <span className="font-bold text-[#172033]">{input.doors.mainDoor}</span>
              </div>
              <div className="p-2.5 bg-[#F7F7F5] rounded border border-[#E5E7EB]">
                <span className="text-[10px] text-[#667085] block font-semibold">Windows</span>
                <span className="font-bold text-[#172033]">{input.windows.primaryMaterial} ({input.windows.subGrade})</span>
              </div>
              <div className="p-2.5 bg-[#F7F7F5] rounded border border-[#E5E7EB]">
                <span className="text-[10px] text-[#667085] block font-semibold">Electrical Wires</span>
                <span className="font-bold text-[#172033]">{input.electrical.wireTier}</span>
              </div>
            </div>
          </section>

          {/* 6. Assumptions & Engineering Trace */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4B43] border-b border-[#E5E7EB] pb-1.5">
              5. Assumptions &amp; Engineering References
            </h2>
            <div className="space-y-1.5 text-xs text-[#667085]">
              <p>• <strong className="text-[#172033]">IS 456:2000</strong> Code of Practice for Plain and Reinforced Concrete (M20/M25 mixes).</p>
              <p>• <strong className="text-[#172033]">IS 1786:2008</strong> High-Strength Deformed Steel Bars for Concrete Reinforcement.</p>
              <p>• <strong className="text-[#172033]">NBC 2016</strong> National Building Code of India (clear heights, floor space index, setback norms).</p>
              <p>• <strong className="text-[#172033]">Regional Tender Indices</strong> Indexed market Schedule of Rates for Bangalore &amp; Mysore.</p>
            </div>
          </section>

          {/* Document Footer */}
          <div className="pt-6 border-t border-[#E5E7EB] flex justify-between items-center text-[10px] text-[#667085]">
            <span>Cost Calculator by Rightcon • Verified Engineering Report</span>
            <span>Formula-Driven Indicative Construction Estimate</span>
          </div>

        </div>

      </div>

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
