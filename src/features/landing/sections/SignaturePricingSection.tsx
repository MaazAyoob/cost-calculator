import React from 'react';
import { ArrowRight, Check, Sparkles, FileText, Lock, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWizardStore } from '../../../store/useWizardStore';

export const SignaturePricingSection: React.FC = () => {
  const navigate = useNavigate();
  const { startNewProject } = useWizardStore();

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-[#E3E8E2] relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/10 text-xs font-semibold text-[#1B3D34]">
            <span className="text-[#F28C28] font-bold">Plans &amp; Pricing</span>
            <span>&bull;</span>
            <span>Transparent Value Tiers</span>
          </div>

          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B3D34] tracking-tight">
            Choose how much clarity you need.
          </h2>

          <p className="body-lg text-[#4B5563] leading-relaxed">
            From preliminary massing exploration to the official 22-section bank-ready construction dossier. Upgrade whenever your project demands greater depth.
          </p>
        </div>

        {/* Visual Asymmetric Hierarchy: Featured ₹499 Centerpiece with Supporting Tiers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Free & ₹99 Supporting Plans (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* Free Tier Card */}
            <div className="p-6 sm:p-7 bg-[#F8F8F6] rounded-3xl border border-[#E3E8E2] hover:border-[#1B3D34] transition-all text-left space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3E8E2] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                  Explore Your Project
                </span>
                <span className="text-xs font-bold text-[#1B3D34] bg-white px-2.5 py-0.5 rounded-lg border border-[#E3E8E2]">
                  ₹0 Free
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#1B3D34] font-heading">
                  Preliminary Massing &amp; Estimate
                </h3>
                <p className="text-xs text-[#4B5563] mt-1">
                  Explore plot dimensions, room matrices, and rough budget envelope.
                </p>
              </div>

              <div className="space-y-2 text-xs text-[#4B5563] pt-2 border-t border-[#E3E8E2]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span>Interactive 3D building massing preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span>Gross Built-Up Area (BUA) calculations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span>Preliminary cost range across 3 standards</span>
                </div>
              </div>

              <button
                onClick={() => {
                  startNewProject();
                  navigate('/calculator');
                }}
                className="w-full hutty-btn-secondary text-xs font-bold py-2.5 rounded-xl cursor-pointer"
              >
                <span>Start Free Explorer</span>
              </button>
            </div>

            {/* ₹99 Verified Estimate Tier Card */}
            <div className="p-6 sm:p-7 bg-[#F8F8F6] rounded-3xl border border-[#E3E8E2] hover:border-[#1B3D34] transition-all text-left space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3E8E2] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                  Save &amp; Customize
                </span>
                <span className="text-xs font-bold text-[#1B3D34] bg-white px-2.5 py-0.5 rounded-lg border border-[#E3E8E2]">
                  ₹99 One-time
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#1B3D34] font-heading">
                  Verified Specification Plan
                </h3>
                <p className="text-xs text-[#4B5563] mt-1">
                  Save your project configuration and lock in verified brand material costs.
                </p>
              </div>

              <div className="space-y-2 text-xs text-[#4B5563] pt-2 border-t border-[#E3E8E2]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span>Permanent project save &amp; dashboard recovery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span>Custom brand selection (Tata Tiscon, UltraTech)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />
                  <span>Shareable interactive web link for family</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/pricing')}
                className="w-full hutty-btn-secondary text-xs font-bold py-2.5 rounded-xl cursor-pointer hover:border-[#1B3D34]"
              >
                <span>Upgrade to ₹99 Plan</span>
              </button>
            </div>

          </div>

          {/* RIGHT: Featured ₹499 Detailed BOQ Dossier Centerpiece (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border-2 border-[#1B3D34] shadow-md flex flex-col justify-between space-y-6 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#1B3D34] text-white text-[11px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>Most Popular Homeowner Plan</span>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="arch-stat-giant text-[#1B3D34]">
                  ₹499
                </span>
                <div>
                  <span className="text-xs font-bold text-[#F28C28] uppercase tracking-wider block">
                    Complete Construction Picture
                  </span>
                  <span className="text-xs text-[#4B5563] block">
                    One-time payment &bull; Lifetime PDF access
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-[#1B3D34] font-heading">
                  22-Section Bank-Ready BOQ Dossier
                </h3>
                <p className="text-sm text-[#4B5563] leading-relaxed">
                  The definitive construction planning document. Everything your bank loan appraiser, structural engineer, and execution contractor need to proceed without budgetary surprises.
                </p>
              </div>

              {/* Dossier Feature Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#E3E8E2] text-xs text-[#1B3D34]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <span><strong>Full Material Schedules:</strong> Steel, cement, sand, aggregate, blocks, and tiles.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <span><strong>13 Trade Heads BOQ:</strong> Itemized labour and material allocation per IS-456 standards.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <span><strong>Disbursement Roadmap:</strong> Milestone schedule tied to slab casting stages.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <span><strong>Bank-Ready PDF Download:</strong> Formatted for SBI, HDFC, ICICI home loan sanction.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E3E8E2] space-y-3">
              <button
                onClick={() => navigate('/pricing')}
                className="w-full hutty-btn-primary py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Unlock 22-Section Detailed Dossier (₹499)</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>

              <div className="flex items-center justify-between text-xs text-[#4B5563]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B3D34]" /> 100% Secure Razorpay Checkout
                </span>
                <span>Instant PDF Generation</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
