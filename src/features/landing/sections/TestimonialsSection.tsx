import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  const testimonials = [
    {
      quote: 'Hutty gave us a transparent itemized BOQ before signing with a contractor. We avoided arbitrary extras and kept our build within 4% of the calculated budget.',
      author: 'Rajesh & Malini Sharma',
      location: 'Whitefield, Bangalore',
      project: '30 × 40 Plot • 2,400 sq.ft Duplex • Premium Tier',
    },
    {
      quote: 'Being able to switch between UltraTech and ACC cement or Tata Tiscon vs JSW steel to see the immediate rate per sq.ft impact gave us tremendous financial clarity.',
      author: 'Archana & Vikram Rao',
      location: 'Indiranagar, Bangalore',
      project: '40 × 60 Plot • 3,840 sq.ft Villa • Luxury Tier',
    },
    {
      quote: 'The milestone payment structure and 13-stage BOQ breakdown made bank home loan documentation seamless without needing external QS estimates.',
      author: 'Karthik Narayanan',
      location: 'HSR Layout, Bangalore',
      project: '30 × 50 Plot • 2,700 sq.ft Home • Premium Tier',
    },
  ];

  const current = testimonials[currentIdx];

  return (
    <section className="py-20 lg:py-24 bg-[#F8F8F6] border-b border-[#E5E7EB] select-none">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Tag */}
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-3 py-1.5 rounded-md inline-block">
            HOMEOWNER EXPERIENCES
          </span>
        </div>

        {/* Large Editorial Quotation */}
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#E5E7EB] shadow-xs text-left space-y-8 relative">
          <Quote className="w-10 h-10 text-[#1B3D34]/20" />

          <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-[#1B3D34] leading-relaxed tracking-tight font-heading">
            "{current.quote}"
          </p>

          <div className="pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-[#1B3D34] font-heading">
                {current.author}
              </h4>
              <p className="text-xs text-[#4B5563] mt-0.5">
                {current.location} &bull; <span className="text-[#1B3D34] font-semibold">{current.project}</span>
              </p>
            </div>

            {/* Prev / Next Navigation */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setCurrentIdx((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1))}
                className="w-9 h-9 rounded-full bg-[#F8F8F6] hover:bg-[rgba(27,61,52,0.08)] border border-[#E5E7EB] flex items-center justify-center text-[#1B3D34] transition-colors cursor-pointer"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-[#4B5563] px-1">
                {currentIdx + 1} / {testimonials.length}
              </span>
              <button
                onClick={() => setCurrentIdx((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0))}
                className="w-9 h-9 rounded-full bg-[#F8F8F6] hover:bg-[rgba(27,61,52,0.08)] border border-[#E5E7EB] flex items-center justify-center text-[#1B3D34] transition-colors cursor-pointer"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
