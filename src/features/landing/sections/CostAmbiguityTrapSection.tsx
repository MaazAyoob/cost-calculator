import React from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CostAmbiguityTrapSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-[#F8F8F6] border-b border-[#E5E7EB] relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 arch-spec-pill text-[#1B3D34]">
            <span className="text-[#F28C28] font-bold">02 // THE INDUSTRY PROBLEM</span>
            <span>&bull;</span>
            <span>WHY SQUARE-FOOT QUOTES FAIL</span>
          </div>

          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B3D34] tracking-tight">
            The Cost Ambiguity Trap.
          </h2>

          <p className="body-lg text-[#4B5563] leading-relaxed">
            Every residential project starts with an innocent question: <em className="text-[#1B3D34] font-semibold">"What is your rate per square foot?"</em> And almost every project suffers 25% to 40% cost overruns because of it.
          </p>
        </div>

        {/* Visual Architectural Comparison: Blind Guess vs Deterministic Quantity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          
          {/* LEFT: The Conventional Blind Flat-Rate Trap */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-200/80 shadow-xs relative overflow-hidden text-left">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-400" />
            
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
              <span className="font-mono text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                CONVENTIONAL CONTRACTOR ESTIMATE
              </span>
              <span className="font-mono text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                UNPREDICTABLE
              </span>
            </div>

            <div className="my-6 space-y-2">
              <span className="text-xs font-mono text-[#4B5563] uppercase">The Single Flat Number</span>
              <div className="text-4xl sm:text-5xl font-black text-[#1B3D34] font-heading">
                ₹2,100 <span className="text-lg font-normal text-[#4B5563]">/ sq.ft</span>
              </div>
              <p className="text-xs text-red-600 font-medium">
                Flat multiplication hiding variable soil, structural steel ratios, and grade substitutions.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#E5E7EB] text-xs text-[#4B5563]">
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-red-500 font-bold shrink-0">&times;</span>
                <span><strong>No Physical Steel Count:</strong> Contractor assumes 2.8 kg/sqft, but actual structural design requires 3.8 kg/sqft — resulting in ₹3.5L unexpected variation.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-red-500 font-bold shrink-0">&times;</span>
                <span><strong>Undisclosed Brand Switches:</strong> Unspecified cement grades (Grade 43 vs 53) and river sand vs engineered M-Sand substitutions.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-red-500 font-bold shrink-0">&times;</span>
                <span><strong>Vague Inclusions:</strong> Electrical points, plumbing fixtures, and waterproofing quoted as "standard" with high dispute potential at execution.</span>
              </div>
            </div>

            <div className="mt-6 p-3.5 bg-red-50/70 rounded-2xl border border-red-100 text-left">
              <span className="font-mono text-[11px] font-bold text-red-700 block">
                TYPICAL OUTCOME: ₹12L - ₹18L BUDGET COMPROMISE MID-CONSTRUCTION
              </span>
            </div>
          </div>

          {/* RIGHT: Hutty's Deterministic Quantity Takeoff */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#1B3D34] shadow-md relative overflow-hidden text-left arch-bracketed">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F28C28]" />
            
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
              <span className="font-mono text-xs font-bold text-[#1B3D34] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F28C28]" />
                HUTTY QUANTITY-FIRST METHODOLOGY
              </span>
              <span className="font-mono text-xs font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded">
                DETERMINISTIC
              </span>
            </div>

            <div className="my-6 space-y-2">
              <span className="text-xs font-mono text-[#4B5563] uppercase">Physical Material &amp; Labour Schedules</span>
              <div className="text-4xl sm:text-5xl font-black text-[#1B3D34] font-heading tabular-nums">
                8.64 T <span className="text-lg font-normal text-[#4B5563]">Steel + 1,080 Bags</span>
              </div>
              <p className="text-xs text-[#1B3D34] font-medium">
                Deterministic mathematical formulas calculated strictly from building physics and room matrix.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#E5E7EB] text-xs text-[#4B5563]">
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-[#1B3D34] font-bold shrink-0">&check;</span>
                <span><strong>Mathematical BUA Calculation:</strong> Sets setbacks, carpet areas, and structural ratios based strictly on BBMP bye-laws and floor loads.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-[#1B3D34] font-bold shrink-0">&check;</span>
                <span><strong>Transparent Brand Rate Master:</strong> Compare Tata Tiscon vs JSW Steel, UltraTech vs ACC cement at real verified Bangalore retail rates.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-[#1B3D34] font-bold shrink-0">&check;</span>
                <span><strong>Bank-Ready 13-Stage BOQ:</strong> Itemized schedule ready for nationalized bank construction loan appraisal and contractor agreement exhibits.</span>
              </div>
            </div>

            <div className="mt-6 p-3.5 bg-[rgba(27,61,52,0.06)] rounded-2xl border border-[#1B3D34]/20 flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-[#1B3D34]">
                HUTTY OUTCOME: COMPLETE FINANCIAL INTEGRITY
              </span>
              <button
                onClick={() => navigate('/calculator')}
                className="text-xs font-bold text-[#1B3D34] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Calculate Now</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
