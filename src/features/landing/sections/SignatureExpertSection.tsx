import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2, Award, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import consultationArchitectImg from '../../../assets/consultation-architect.jpg';

const EXPERT_SPECIALTIES = [
  {
    role: 'Architect Review',
    service: 'Floor Plan & Setback Review',
    deliverables: ['Check municipal setback distances', 'Review light, room flow & ventilation', 'Verify staircase & door placements'],
    credential: 'Registered Architecture Specialist',
    badge: 'Floor Layout & Setbacks',
    btnText: 'Book Architect Review',
  },
  {
    role: 'Structural Engineer Review',
    service: 'Column & Beam Layout Advice',
    deliverables: ['Check column spacing & beam alignments', 'Recommend standard steel & cement grades', 'Foundation advice for Bangalore red soil'],
    credential: 'Chartered Structural Engineer',
    badge: 'Structural Planning',
    btnText: 'Book Structural Review',
  },
  {
    role: 'Contract & Quote Review',
    service: 'Contractor Quotation Audit',
    deliverables: ['Line-by-line check of contractor quotation', 'Identify hidden omissions or surprise costs', 'Tie payment stages to actual finished work'],
    credential: 'Quantity Surveying Specialist',
    badge: 'Quote & Contract Audit',
    btnText: 'Book Quote Review',
  },
];

export const SignatureExpertSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-[#F8F8F6] border-b border-[#E5E7EB] relative select-none text-[#18211E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E5E7EB] pb-6 text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
              <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
              <span className="text-[#C66B4E] font-bold">Expert Review</span>
              <span>&bull;</span>
              <span>Independent Consultation</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#18211E] tracking-tight font-heading leading-[1.14]">
              Get an expert to review your plan.
            </h2>
          </div>

          <div className="space-y-1 text-left lg:text-right">
            <span className="text-xl sm:text-2xl font-black text-[#183B32] block">
              Flat ₹1,499 <span className="text-xs font-normal text-[#66716B]">/ consultation</span>
            </span>
            <span className="text-xs font-semibold text-[#C66B4E] block">
              100% Unbiased &bull; Independent Review
            </span>
          </div>
        </div>

        {/* Editorial Photo Banner: Architect & Homeowner Consultation */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-[#E5E7EB] shadow-sm bg-white grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5 h-64 sm:h-72 w-full relative overflow-hidden bg-[#E8EFE9]">
            <img
              src={consultationArchitectImg}
              alt="Indian architect reviewing floor plans with homeowners in Bangalore studio"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 hidden lg:block" />
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE9] text-xs font-bold text-[#183B32]">
              <Sparkles className="w-3.5 h-3.5 text-[#C66B4E]" />
              <span>Unbiased Expert Advice</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#18211E] font-heading tracking-tight leading-snug">
              A private review with an independent architect or engineer can save lakhs in site mistakes.
            </h3>

            <p className="text-xs sm:text-sm text-[#66716B] leading-relaxed max-w-xl">
              Hutty is completely independent. We do not sell materials or take contractor cuts. When you book a review, an experienced professional checks your floor layout, municipal setback rules, and contractor quote with complete objectivity.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#183B32]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#183B32]" />
                <span>Private 1-on-1 Online Session</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#183B32]" />
                <span>Written Discussion Summary</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Expert Category Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {EXPERT_SPECIALTIES.map((spec, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-6 hover:border-[#183B32] transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#66716B]">
                    {spec.badge}
                  </span>
                  <span className="text-xs font-bold text-[#C66B4E] bg-[#C66B4E]/10 border border-[#C66B4E]/30 px-2.5 py-0.5 rounded-lg font-mono">
                    ₹1,499
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#183B32] font-heading">
                    {spec.role}
                  </h3>
                  <p className="text-xs font-medium text-[#66716B]">
                    {spec.service}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                  {spec.deliverables.map((item, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 text-xs text-[#66716B]">
                      <Check className="w-3.5 h-3.5 text-[#183B32] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-[#66716B]">
                  <Award className="w-3.5 h-3.5 text-[#C66B4E] shrink-0" />
                  <span className="truncate">{spec.credential}</span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/consult')}
                  className="w-full bg-white hover:bg-[#F8F8F6] text-[#183B32] border border-[#183B32]/30 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <span>{spec.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C66B4E]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Credibility Guarantee Strip */}
        <div className="p-6 bg-white rounded-2xl border-2 border-[#E5E7EB] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8EFE9] border border-[#B7CDBB]/70 flex items-center justify-center text-[#183B32] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#183B32]" />
            </div>
            <div>
              <span className="font-heading text-sm font-bold text-[#183B32] block">
                100% Unbiased Advice
              </span>
              <p className="text-xs text-[#66716B]">
                Our experts work directly for you. We do not sell building materials, take contractor commissions, or recommend construction firms.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/consult')}
            className="bg-[#183B32] hover:bg-[#245747] text-white text-xs font-bold px-6 py-2.5 rounded-xl shrink-0 cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
          >
            <span>Browse All Bangalore Experts</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C66B4E]" />
          </button>
        </div>

      </div>
    </section>
  );
};
