import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, AlertTriangle, ShieldCheck, ArrowRight, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWizardStore } from '../../../store/useWizardStore';

export const WhyPlanningSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'with' | 'without'>('with');

  const comparisonData = {
    without: {
      title: 'Conventional Home Building',
      badge: 'HIGH RISK OF SURPRISES',
      points: [
        { title: 'Vague Lump-Sum Quotes', desc: 'Contractors quote "₹2,200/sq.ft" with unwritten material assumptions and ambiguous finish grades.' },
        { title: 'Hidden Quantity Disputes', desc: 'Steel tonnage and cement bags are calculated informally on-site, causing frequent cost escalations.' },
        { title: 'Brand Substitution', desc: 'Lower-grade steel (Fe 500 vs 550D) or lower cement grades are swapped in without client awareness.' },
        { title: '15-30% Budget Overruns', desc: 'Unplanned architectural variations and unclear BOQ schedules derail finances midway through construction.' },
      ],
    },
    with: {
      title: 'With Hutty Planning Intelligence',
      badge: 'BANK & TENDER READY',
      points: [
        { title: 'Formulaic Quantity Certainty', desc: 'Physical steel weight (T), cement bags, and masonry are calculated upfront from exact structural spans.' },
        { title: 'Deterministic Brand Matrix', desc: 'Tata Tiscon, UltraTech, and premium fittings are locked down with invariant physical geometry.' },
        { title: 'Bank-Ready 13-Stage BOQ', desc: 'Clear line-item Schedule of Rates ready for home loan disbursements and transparent contractor tenders.' },
        { title: 'Predictable Fixed Budget', desc: 'Complete mathematical transparency with real-time feedback for every room, floor, or finish change.' },
      ],
    },
  };

  return (
    <section id="why-planning" className="py-20 lg:py-24 bg-[#F8F8F6] border-b border-[#E5E7EB] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-3 py-1.5 rounded-full inline-block">
            THE HUTTY DIFFERENCE
          </span>
          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.12]">
            Construction becomes simple <br />
            when the numbers are clear.
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
            Compare conventional construction quotes against Hutty's quantity-first pre-construction methodology.
          </p>
        </div>

        {/* Before / After Interactive Split Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT: Conventional Home Building */}
          <div className="bg-white rounded-2xl border border-red-200/80 p-6 sm:p-8 shadow-xs text-left space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-red-100">
                <span className="text-xs font-bold uppercase tracking-wider text-red-900 font-heading">
                  WITHOUT HUTTY
                </span>
                <span className="text-[9px] font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  CONVENTIONAL PROCESS
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-stone-900 font-heading">
                {comparisonData.without.title}
              </h3>
              
              <div className="space-y-3 pt-2">
                {comparisonData.without.points.map((pt) => (
                  <div key={pt.title} className="flex items-start gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="font-bold text-stone-900 block">{pt.title}</strong>
                      <span className="text-[#4B5563] text-[11px] leading-relaxed">{pt.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-red-50/70 border border-red-200/70 rounded-xl text-[11px] text-red-900 font-medium">
              Average 18–25% budget overruns due to undisclosed takeoff discrepancies.
            </div>
          </div>

          {/* RIGHT: With Hutty Planning Intelligence */}
          <div className="bg-white rounded-2xl border-2 border-[#1B3D34] p-6 sm:p-8 shadow-md text-left space-y-5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[rgba(27,61,52,0.04)] rounded-bl-full pointer-events-none" />
            
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] font-heading">
                  WITH HUTTY
                </span>
                <span className="text-[9px] font-mono font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-2.5 py-0.5 rounded-full">
                  QUANTITY-FIRST PLATFORM
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[#1B3D34] font-heading">
                {comparisonData.with.title}
              </h3>
              
              <div className="space-y-3 pt-2">
                {comparisonData.with.points.map((pt) => (
                  <div key={pt.title} className="flex items-start gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-[rgba(27,61,52,0.1)] text-[#1B3D34] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="font-bold text-[#1B3D34] block">{pt.title}</strong>
                      <span className="text-[#4B5563] text-[11px] leading-relaxed">{pt.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/20 rounded-xl text-[11px] text-[#1B3D34] font-bold flex items-center justify-between">
              <span>Ready for architect, contractor tender & bank loan verification.</span>
              <ShieldCheck className="w-4 h-4 text-[#1B3D34] shrink-0" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

