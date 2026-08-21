import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { useReportStore } from '../../store/useReportStore';
import { useCalculationStore } from '../../store/useCalculationStore';
import { LeadCaptureModal } from '../../components/modals/LeadCaptureModal';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/cn';
import { HuttyLogo } from '../../components/common/HuttyLogo';
import { SEO } from '../../components/common/SEO';

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
      className="min-h-screen bg-[#F8F8F6] py-8 sm:py-12 select-none"
    >
      <SEO
        title="Construction Dossier & BOQ Report | Hutty"
        description="Comprehensive pre-construction engineering report, physical material takeoff, and 13-stage BOQ schedule."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 text-left">

        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between gap-4 print:hidden">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#4B5563] hover:text-[#1B3D34] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintRequest}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[rgba(27,61,52,0.04)] text-xs font-bold text-[#1B3D34] transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#1B3D34]" /> Print / PDF
            </button>
            <button
              type="button"
              onClick={handlePrintRequest}
              className="hutty-btn-primary px-4 py-1.5 rounded-lg text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5" /> Download Dossier
            </button>
          </div>
        </div>

        {/* Document Sheet (Professional Construction Document) */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 sm:p-12 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">

          {/* 1. Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-[#1B3D34]">
            <div className="space-y-1">
              <HuttyLogo variant="full" width={140} />
              <p className="text-xs text-[#4B5563] mt-1">Pre-Construction Quantity Feasibility &amp; BOQ Dossier</p>
            </div>

            <div className="text-xs text-left sm:text-right space-y-0.5 text-[#4B5563]">
              <p><strong className="text-[#1B3D34]">Project ID:</strong> {report.projectId || 'HUTTY-2026-BLR'}</p>
              <p><strong className="text-[#1B3D34]">Date:</strong> {currentDate}</p>
              <p><strong className="text-[#1B3D34]">Prepared For:</strong> {preparedFor || 'Residential Client'}</p>
            </div>
          </div>

          {/* 2. Project Summary */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] border-b border-[#E5E7EB] pb-1.5 font-heading">
              1. Project Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#4B5563] block">Estimated Total</span>
                <span className="text-sm font-extrabold text-[#1B3D34] font-heading">{formatCurrency(budget.totalProjectCost)}</span>
              </div>
              <div>
                <span className="text-[#4B5563] block">Built-Up Area</span>
                <span className="text-sm font-bold text-[#1B3D34] font-heading">{area.totalBUASqFt.toLocaleString()} sq.ft</span>
              </div>
              <div>
                <span className="text-[#4B5563] block">Effective Rate</span>
                <span className="text-sm font-bold text-[#1B3D34] font-heading">₹{budget.costPerSqFt.toLocaleString()} / sq.ft</span>
              </div>
              <div>
                <span className="text-[#4B5563] block">Estimated Timeline</span>
                <span className="text-sm font-bold text-[#1B3D34] font-heading">{timeline.totalMonths} Months</span>
              </div>
            </div>
          </section>

          {/* 3. Physical Quantities Takeoff */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] border-b border-[#E5E7EB] pb-1.5 font-heading">
              2. Physical Quantities Takeoff (IS 456 / IS 1786)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <span className="text-[#4B5563] text-[10px] block">TMT Steel</span>
                <span className="font-bold text-[#1B3D34] font-heading text-sm">{quantities.steelTonnes} Tonnes</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <span className="text-[#4B5563] text-[10px] block">Portland Cement</span>
                <span className="font-bold text-[#1B3D34] font-heading text-sm">{quantities.cementBags.toLocaleString()} Bags</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <span className="text-[#4B5563] text-[10px] block">AAC Masonry</span>
                <span className="font-bold text-[#1B3D34] font-heading text-sm">{quantities.aacBlocksCuM} Cu.M</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                <span className="text-[#4B5563] text-[10px] block">Concrete Volume</span>
                <span className="font-bold text-[#1B3D34] font-heading text-sm">{quantities.concreteCuM} Cu.M</span>
              </div>
            </div>
          </section>

          {/* 4. Trade Budget Allocation */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] border-b border-[#E5E7EB] pb-1.5 font-heading">
              3. Trade Budget Allocation
            </h2>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#4B5563]">
                  <th className="py-2 font-bold uppercase">Trade Category</th>
                  <th className="py-2 font-bold uppercase text-right">Amount (INR)</th>
                  <th className="py-2 font-bold uppercase text-right">% Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {budget.heads.map((head) => (
                  <tr key={head.id}>
                    <td className="py-2 font-medium text-[#1B3D34]">{head.name}</td>
                    <td className="py-2 text-right font-bold text-[#1B3D34] font-mono">{formatCurrency(head.allocatedAmount)}</td>
                    <td className="py-2 text-right text-[#4B5563] font-mono">{head.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 5. 13-Stage BOQ Summary */}
          {Array.isArray(boq) && boq.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] border-b border-[#E5E7EB] pb-1.5 font-heading">
                4. Itemized Bill of Quantities (13 Stages)
              </h2>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#4B5563]">
                    <th className="py-2 font-bold uppercase">Item</th>
                    <th className="py-2 font-bold uppercase">Description</th>
                    <th className="py-2 font-bold uppercase text-right">Qty</th>
                    <th className="py-2 font-bold uppercase text-right">Rate</th>
                    <th className="py-2 font-bold uppercase text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {boq.map((item) => (
                    <tr key={item.code || item.slNo}>
                      <td className="py-2 font-mono text-[#4B5563]">{item.slNo}</td>
                      <td className="py-2 text-[#1B3D34] font-medium">{item.description}</td>
                      <td className="py-2 text-right text-[#4B5563] font-mono">{item.quantity} {item.unit}</td>
                      <td className="py-2 text-right text-[#4B5563] font-mono">₹{item.unitRate}</td>
                      <td className="py-2 text-right font-bold text-[#1B3D34] font-mono">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* 6. Milestone Payment Schedule */}
          {Array.isArray(paymentPlan) && paymentPlan.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] border-b border-[#E5E7EB] pb-1.5 font-heading">
                5. Milestone Disbursement Roadmap
              </h2>
              <div className="space-y-2">
                {paymentPlan.map((stage) => (
                  <div key={stage.stage} className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#1B3D34] block">Stage {stage.stage}: {stage.title}</span>
                      <span className="text-[10px] text-[#4B5563]">{stage.description}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#1B3D34] font-mono block">{formatCurrency(stage.amount)}</span>
                      <span className="text-[10px] text-[#4B5563]">{stage.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 7. Engineering Notes & Trace */}
          <section className="space-y-2 text-xs text-[#4B5563] border-t border-[#E5E7EB] pt-4">
            <h3 className="font-bold text-[#1B3D34]">Engineering Assumptions &amp; Disclaimers</h3>
            <p>
              * Estimates calculated using deterministic formula algorithms conforming to IS 456 (Plain and Reinforced Concrete), IS 1786 (High Strength Deformed Steel Bars), and Bangalore Schedule of Rates.
            </p>
            <p>
              * Final structural sizes, rebar schedules, and soil bearing capacities must be validated by a registered structural engineer prior to construction.
            </p>
          </section>

          {/* Document Footer */}
          <div className="pt-6 border-t border-[#E5E7EB] flex items-center justify-between text-[10px] text-[#4B5563]">
            <span>Hutty &bull; Verified Engineering Dossier</span>
            <span>https://hutty.in</span>
          </div>

        </div>

      </div>

      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
      />
    </motion.div>
  );
};
