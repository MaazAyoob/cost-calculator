import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2, Compass, Award, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EXPERT_SPECIALTIES = [
  {
    role: 'Council of Architecture (COA) Architect',
    service: 'Floor Plan & Setback Audit',
    deliverables: ['Bangalore BBMP bye-law compliance check', 'Daylight, ventilation & carpet efficiency review', 'Structural opening & window placement guidance'],
    credential: 'Licensed COA Practitioner • 10+ Yrs Experience',
    badge: 'Architectural Design',
  },
  {
    role: 'Licensed Structural Consultant',
    service: 'Soil & Structural Frame Audit',
    deliverables: ['Column grid & beam depth verification', 'Fe550D rebar & foundation schedule inspection', 'Seismic Zone II design safety review'],
    credential: 'M.Tech Structural Engineering • Inst. of Engineers',
    badge: 'RCC & Structural Safety',
  },
  {
    role: 'Senior Construction Quantity Surveyor',
    service: 'Contractor Quote & BOQ Audit',
    deliverables: ['Line-by-line contractor quotation review', 'Identification of hidden extras & missing line items', 'Payment milestone & cashflow schedule sanity check'],
    credential: 'RICS Certified Estimator • 12+ Yrs Experience',
    badge: 'Cost & Contract Audit',
  },
];

export const SignatureExpertSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-[#F8F8F6] border-b border-[#E3E8E2] relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E3E8E2] pb-6 text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/10 text-xs font-semibold text-[#1B3D34]">
              <span className="text-[#F28C28] font-bold">Expert Advice</span>
              <span>&bull;</span>
              <span>Independent Consultation</span>
            </div>

            <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B3D34] tracking-tight">
              Sometimes you need a second pair of eyes.
            </h2>
          </div>

          <div className="space-y-1 text-left lg:text-right">
            <span className="text-xl sm:text-2xl font-black text-[#1B3D34] block">
              Flat ₹1,499 <span className="text-xs font-normal text-[#4B5563]">/ consultation</span>
            </span>
            <span className="text-xs font-semibold text-[#F28C28] block">
              100% Unbiased &bull; Independent Review
            </span>
          </div>
        </div>

        {/* 3 Expert Category Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {EXPERT_SPECIALTIES.map((spec, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3E8E2] shadow-xs flex flex-col justify-between space-y-6 hover:border-[#1B3D34] transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E3E8E2] pb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563]">
                    {spec.badge}
                  </span>
                  <span className="text-xs font-bold text-[#F28C28] bg-[#F28C28]/10 px-2.5 py-0.5 rounded-lg">
                    ₹1,499
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#1B3D34] font-heading">
                    {spec.role}
                  </h3>
                  <p className="text-xs font-medium text-[#1B3D34]/80">
                    {spec.service}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E3E8E2]">
                  {spec.deliverables.map((item, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 text-xs text-[#4B5563]">
                      <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E3E8E2] space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-[#4B5563]">
                  <Award className="w-3.5 h-3.5 text-[#F28C28] shrink-0" />
                  <span className="truncate">{spec.credential}</span>
                </div>

                <button
                  onClick={() => navigate('/consult')}
                  className="w-full hutty-btn-secondary text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#1B3D34]"
                >
                  <span>Book 1-on-1 Review</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Credibility Guarantee Strip */}
        <div className="p-6 bg-white rounded-2xl border border-[#E3E8E2] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#1B3D34] shrink-0" />
            <div>
              <span className="font-heading text-sm font-bold text-[#1B3D34] block">
                The Hutty Conflict-Free Guarantee
              </span>
              <p className="text-xs text-[#4B5563]">
                Our consultants do not take contractor commissions or sell construction contracts. Their only incentive is protecting your build quality and budget.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/consult')}
            className="hutty-btn-primary text-xs font-bold px-6 py-2.5 rounded-xl shrink-0 cursor-pointer min-h-[44px]"
          >
            <span>Browse All Bangalore Experts</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
          </button>
        </div>

      </div>
    </section>
  );
};
