import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, FileText, SlidersHorizontal, FileCheck, ArrowRight, Check } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const FeatureShowcaseSection: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      num: 'FEATURE 01',
      title: 'LIVE ESTIMATE',
      quote: 'See the cost move as your decisions change.',
      description: 'Adjust room counts, add a floor, or shift your footprint. Our single source-of-truth engine recalculates structural requirements, built-up area, and cost per square foot dynamically.',
      bullets: [
        'Instant response to every dimension and floor adjustment',
        'Automatic calculation of super built-up area and ground footprint',
        'Transparent breakdown across civil, finishes, and MEP trades',
      ],
      visual: (
        <div className="p-6 bg-white rounded-xl border border-[#E5E7EB] space-y-4 text-left shadow-xs">
          <div className="flex justify-between items-center text-xs pb-3 border-b border-[#E5E7EB]">
            <span className="font-bold text-[#172033]">Live Calculation Preview</span>
            <span className="text-[#1F4B43] font-bold text-[11px] bg-[#EBF2F0] px-2 py-0.5 rounded">● Synchronized</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">Estimated Project Total</span>
            <div className="text-3xl font-black text-[#1F4B43]">₹68,40,000</div>
            <div className="text-xs text-[#667085]">2,400 sq.ft total BUA @ ₹2,850/sq.ft</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 bg-[#F7F7F5] rounded border border-[#E5E7EB]">
              <span className="text-[#667085] text-[10px] block font-semibold">TMT Steel</span>
              <span className="font-bold text-[#172033]">9.6 Tonnes</span>
            </div>
            <div className="p-2.5 bg-[#F7F7F5] rounded border border-[#E5E7EB]">
              <span className="text-[#667085] text-[10px] block font-semibold">Cement</span>
              <span className="font-bold text-[#172033]">1,056 Bags</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: 'FEATURE 02',
      title: 'QUANTITY-BASED BOQ',
      quote: 'Your rooms and built-up area drive physical quantities.',
      description: 'We do not use rough square-foot rules of thumb. Every line item in your 13-stage Bill of Quantities is mathematically derived from physical geometry, slab spans, and room perimeters.',
      bullets: [
        'Concrete volume, rebar tonnage, and masonry area takeoff',
        '13 civil and architectural trade schedules',
        'Verifiable against contractor quotation line items',
      ],
      visual: (
        <div className="p-6 bg-white rounded-xl border border-[#E5E7EB] space-y-2.5 text-left text-xs shadow-xs">
          <div className="font-bold text-[#172033] pb-2 border-b border-[#E5E7EB] flex justify-between">
            <span>13-Stage Schedule of Rates</span>
            <span className="text-[#667085] font-mono text-[10px]">IS 456</span>
          </div>
          <div className="p-2.5 bg-[#F7F7F5] rounded border border-[#E5E7EB] flex justify-between items-center">
            <span className="font-medium text-[#172033]">01. Earthwork & Foundation Concrete</span>
            <span className="font-bold text-[#172033]">₹3,42,000</span>
          </div>
          <div className="p-2.5 bg-[#F7F7F5] rounded border border-[#E5E7EB] flex justify-between items-center">
            <span className="font-medium text-[#172033]">02. Plinth Beams & Substructure</span>
            <span className="font-bold text-[#172033]">₹8,89,200</span>
          </div>
          <div className="p-2.5 bg-[#F7F7F5] rounded border border-[#E5E7EB] flex justify-between items-center">
            <span className="font-medium text-[#172033]">03. Superstructure Columns & Slabs</span>
            <span className="font-bold text-[#172033]">₹12,31,200</span>
          </div>
        </div>
      ),
    },
    {
      num: 'FEATURE 03',
      title: 'MATERIAL SPECIFICATIONS',
      quote: 'Change brands and finishes without changing the underlying quantity.',
      description: 'Switch between Tata Tiscon, JSW Neosteel, UltraTech, ACC, Italian Marble, or Vitrified Tiles. The required physical material volume remains structurally invariant while unit rates adjust.',
      bullets: [
        'Brand invariance: changing brand updates rate, not physical physics',
        'Zonal flooring selection for living, bedrooms, kitchen, and wet areas',
        'Real regional vendor price indices for Bangalore & Mysore',
      ],
      visual: (
        <div className="p-6 bg-white rounded-xl border border-[#E5E7EB] space-y-3 text-left text-xs shadow-xs">
          <div className="font-bold text-[#172033] pb-2 border-b border-[#E5E7EB]">
            Specification Invariance Matrix
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-[#EBF2F0] rounded-lg border border-[#1F4B43]/30">
              <span className="text-[10px] font-bold text-[#1F4B43] block">TATA TISCON 550D</span>
              <span className="font-bold text-[#172033]">9.6 T @ ₹78/kg</span>
            </div>
            <div className="p-3 bg-[#F7F7F5] rounded-lg border border-[#E5E7EB]">
              <span className="text-[10px] font-bold text-[#667085] block">JSW NEOSTEEL</span>
              <span className="font-bold text-[#172033]">9.6 T @ ₹74/kg</span>
            </div>
          </div>
          <p className="text-[10px] text-[#667085] leading-relaxed">
            * Structural physics remains invariant (9.6 Tonnes required) while material budget adjusts accurately.
          </p>
        </div>
      ),
    },
    {
      num: 'FEATURE 04',
      title: 'DETAILED REPORT',
      quote: 'Turn your configuration into a structured project report.',
      description: 'Generate a clean, bank-ready PDF document complete with 13-stage BOQ, 6-stage milestone payment plan, and engineering assumptions formatted for SBI, HDFC, ICICI, and Axis Bank loans.',
      bullets: [
        'Structured milestone payment schedule aligned with construction stages',
        'Auditable engineering calculation trace',
        'Downloadable bank-ready pre-construction dossier',
      ],
      visual: (
        <div className="p-6 bg-white rounded-xl border border-[#E5E7EB] space-y-3 text-left text-xs shadow-xs">
          <div className="flex items-center gap-2 text-[#1F4B43] font-bold pb-2 border-b border-[#E5E7EB]">
            <FileCheck className="w-4 h-4" />
            <span>Bank-Ready Audit Format</span>
          </div>
          <div className="space-y-1.5 text-xs text-[#667085]">
            <div className="flex justify-between py-1 border-b border-[#E5E7EB]/60">
              <span>Project Summary</span>
              <span className="font-bold text-[#172033]">Included</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E5E7EB]/60">
              <span>13-Stage Schedule of Rates</span>
              <span className="font-bold text-[#172033]">Included</span>
            </div>
            <div className="flex justify-between py-1">
              <span>6-Stage Bank Disbursement</span>
              <span className="font-bold text-[#172033]">Included</span>
            </div>
          </div>
          <button
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="text-xs font-bold text-[#1F4B43] hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
          >
            Try in Calculator <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md inline-block">
            Core Engineering Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#172033] tracking-tight leading-[1.15]">
            Four architectural capabilities that define the product.
          </h2>
          <p className="text-base text-[#667085] leading-relaxed font-normal">
            Every feature is engineered for pre-construction transparency, accuracy, and homeowner confidence.
          </p>
        </div>

        {/* 4 Large Editorial Sections with Alternating Left/Right Layouts */}
        <div className="space-y-16 lg:space-y-24">
          {features.map((feat, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={feat.num}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
              >
                {/* Content Column */}
                <div className={`space-y-5 text-left lg:col-span-7 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <span className="text-xs font-mono font-bold tracking-widest text-[#1F4B43] uppercase block">
                    {feat.num}
                  </span>

                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
                      {feat.title}
                    </h3>
                    <p className="text-base sm:text-lg font-semibold text-[#1F4B43]">
                      "{feat.quote}"
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-[#667085] leading-relaxed font-normal">
                    {feat.description}
                  </p>

                  <ul className="space-y-2 pt-2 text-xs text-[#172033]">
                    {feat.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-[#EBF2F0] text-[#1F4B43] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                          ✓
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Column */}
                <div className={`lg:col-span-5 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="p-3 bg-[#F7F7F5] rounded-2xl border border-[#E5E7EB]">
                    {feat.visual}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
