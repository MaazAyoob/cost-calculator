import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, FileText, CheckCircle2, SlidersHorizontal, ArrowRight, Check } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const FeatureShowcaseSection: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'live-cost',
      title: 'Live Cost Estimate',
      tagline: 'See the effect of every specification as you build your estimate.',
      description: 'Every time you adjust a dimension, add a bedroom, or switch a flooring material, our single source-of-truth calculation engine immediately updates your estimated project cost, built-up area, and cost per square foot.',
      bullets: [
        'Zero initial state for unconfigured plots',
        'Automatic calculation of super built-up area and ground footprint',
        'Instant cost updates across all civil, finishing, and MEP trades',
      ],
      icon: <Activity className="w-5 h-5 text-[#1F4B43]" />,
      badge: 'Live Calculation',
      preview: (
        <div className="p-5 bg-slate-50 rounded-xl border border-[#E5E7EB] space-y-3">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-[#E5E7EB]">
            <span className="font-semibold text-[#172033]">Live Calculation Engine</span>
            <span className="text-[#287A55] font-bold">● Active Sync</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">Dynamic Project Total</span>
            <div className="text-2xl font-bold text-[#1F4B43]">₹68,40,000</div>
            <div className="text-xs text-[#667085]">2,400 sq.ft total BUA @ ₹2,850/sq.ft</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="p-2 bg-white rounded border border-[#E5E7EB]">
              <span className="text-[#667085] block">Steel Required</span>
              <span className="font-bold text-[#172033]">9.6 Tonnes</span>
            </div>
            <div className="p-2 bg-white rounded border border-[#E5E7EB]">
              <span className="text-[#667085] block">Cement Required</span>
              <span className="font-bold text-[#172033]">1,056 Bags</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'boq',
      title: 'Quantity-Based BOQ',
      tagline: 'Every quantity is derived from your project configuration.',
      description: 'We do not use rough square-foot rules of thumb. Every line item in your 13-stage Bill of Quantities is mathematically derived from your room dimensions, floor slab areas, wall heights, and plumbing fixtures.',
      bullets: [
        'Concrete volume, rebar tonnage, and AAC block masonry takeoff',
        'Itemized Schedule of Rates with transparent labor/material splits',
        'Directly usable for contractor quote verification',
      ],
      icon: <FileText className="w-5 h-5 text-[#1F4B43]" />,
      badge: '13 Stages Takeoff',
      preview: (
        <div className="p-5 bg-slate-50 rounded-xl border border-[#E5E7EB] space-y-2 text-xs">
          <div className="font-semibold text-[#172033] pb-2 border-b border-[#E5E7EB]">
            13-Stage Schedule of Rates (BOQ)
          </div>
          <div className="p-2 bg-white rounded border border-[#E5E7EB] flex justify-between">
            <span>01. Earthwork & Foundation Concrete</span>
            <span className="font-bold text-[#172033]">₹3,42,000</span>
          </div>
          <div className="p-2 bg-white rounded border border-[#E5E7EB] flex justify-between">
            <span>02. Plinth Beams & Substructure</span>
            <span className="font-bold text-[#172033]">₹8,89,200</span>
          </div>
          <div className="p-2 bg-white rounded border border-[#E5E7EB] flex justify-between">
            <span>03. Superstructure Columns & Slabs</span>
            <span className="font-bold text-[#172033]">₹12,31,200</span>
          </div>
        </div>
      ),
    },
    {
      id: 'brands',
      title: 'Material & Brand Selection',
      tagline: 'Compare specifications and brands without changing physical quantities.',
      description: 'Switch between Tata Tiscon, JSW Neosteel, UltraTech, ACC, Italian Marble, or Vitrified Tiles. The physical required quantity stays true to engineering while your budget reflects true market rate variations.',
      bullets: [
        'Brand invariance: switching brand updates rates, not physical physics',
        'Zonal flooring selection (Living, Bedrooms, Kitchen, Bathrooms)',
        'True regional market pricing benchmarks',
      ],
      icon: <SlidersHorizontal className="w-5 h-5 text-[#1F4B43]" />,
      badge: 'Brand Matrix',
      preview: (
        <div className="p-5 bg-slate-50 rounded-xl border border-[#E5E7EB] space-y-2.5 text-xs">
          <div className="font-semibold text-[#172033] pb-2 border-b border-[#E5E7EB]">
            Specification Invariance Matrix
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-white rounded border border-[#1F4B43]/30">
              <span className="text-[10px] font-bold text-[#1F4B43] block">TATA TISCON 550D</span>
              <span className="font-bold text-[#172033]">9.6 T @ ₹78/kg</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-[#E5E7EB]">
              <span className="text-[10px] font-bold text-[#667085] block">JSW NEOSTEEL</span>
              <span className="font-bold text-[#172033]">9.6 T @ ₹74/kg</span>
            </div>
          </div>
          <p className="text-[10px] text-[#667085]">
            Physical rebar tonnage remains identical (9.6 T) while material expenditure updates accurately.
          </p>
        </div>
      ),
    },
    {
      id: 'reports',
      title: 'Detailed Report',
      tagline: 'Take your completed estimate with you.',
      description: 'Generate comprehensive, bank-ready documentation formatted for SBI, HDFC, ICICI, and Axis Bank home loan disbursements. Save, compare multiple design versions, or print full PDF project summaries.',
      bullets: [
        '6-stage milestone payment schedule aligned with construction milestones',
        'Structured pre-construction dossier for loan sanction',
        'Downloadable bank-ready summary',
      ],
      icon: <CheckCircle2 className="w-5 h-5 text-[#1F4B43]" />,
      badge: 'Loan & Bank Ready',
      preview: (
        <div className="p-5 bg-slate-50 rounded-xl border border-[#E5E7EB] space-y-3 text-xs">
          <div className="flex items-center gap-2 text-[#287A55] font-bold pb-2 border-b border-[#E5E7EB]">
            <Check className="w-4 h-4" />
            <span>Bank-Ready Audit Format</span>
          </div>
          <p className="text-[#667085] leading-relaxed">
            Standardized documentation with stage disbursements, civil specifications, and itemized bills of quantities ready for technical loan appraisal.
          </p>
          <button
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="text-xs font-bold text-[#1F4B43] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Try in Calculator <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md inline-block">
            Core Engineering Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172033] tracking-tight leading-[1.15]">
            Built with transparency at every level.
          </h2>
          <p className="text-base text-[#667085] leading-relaxed">
            Every feature in Cost Calculator is engineered to give homeowners clarity over quantities, materials, and costs.
          </p>
        </div>

        {/* 4 Strong Editorial Feature Blocks */}
        <div className="space-y-12">
          {features.map((feat, idx) => (
            <div
              key={feat.id}
              className="p-7 sm:p-10 rounded-2xl bg-[#F7F7F5] border border-[#E5E7EB] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left"
            >
              {/* Left Details (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-[#E5E7EB] text-xs font-semibold text-[#172033]">
                  {feat.icon}
                  <span>{feat.badge}</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-2xl font-bold text-[#172033] tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-sm font-semibold text-[#1F4B43]">
                    "{feat.tagline}"
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                  {feat.description}
                </p>

                <ul className="space-y-2 pt-1 text-xs text-[#172033]">
                  {feat.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#EBF2F0] text-[#1F4B43] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Visual Demonstration (5 cols) */}
              <div className="lg:col-span-5 bg-white p-2 rounded-xl border border-[#E5E7EB] shadow-xs">
                {feat.preview}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

