import React from 'react';
import { Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote: 'Cost Calculator gave us a transparent itemized BOQ before signing with a contractor. We avoided arbitrary extras and kept our build within 4% of the calculated budget.',
      author: 'Rajesh & Malini Sharma',
      location: 'Whitefield, Bangalore',
      project: '30 × 40 Plot • 2,400 sq.ft Duplex',
      tier: 'Premium Tier',
    },
    {
      quote: 'Being able to switch between UltraTech and ACC cement or Tata Tiscon vs JSW steel to see the immediate rate per sq.ft impact gave us tremendous financial clarity.',
      author: 'Archana & Vikram Rao',
      location: 'Indiranagar, Bangalore',
      project: '40 × 60 Plot • 3,840 sq.ft Villa',
      tier: 'Luxury Tier',
    },
    {
      quote: 'The milestone payment structure and 13-stage BOQ breakdown made bank home loan documentation seamless without needing external QS estimates.',
      author: 'Karthik Narayanan',
      location: 'HSR Layout, Bangalore',
      project: '30 × 50 Plot • 2,700 sq.ft Home',
      tier: 'Premium Tier',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md inline-block">
            Homeowner Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172033] tracking-tight leading-[1.15]">
            Trusted by Bangalore homeowners.
          </h2>
          <p className="text-base text-[#667085] leading-relaxed">
            Real feedback from homebuilders who planned their construction using Cost Calculator.
          </p>
        </div>

        {/* 3 Quotation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-[#F7F7F5] border border-[#E5E7EB] flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <Quote className="w-6 h-6 text-[#1F4B43]/40" />
                <p className="text-sm sm:text-base text-[#172033] leading-relaxed font-normal">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] space-y-1">
                <div className="text-sm font-bold text-[#172033]">
                  {t.author}
                </div>
                <div className="text-xs text-[#667085]">
                  {t.location}
                </div>
                <div className="text-[11px] text-[#1F4B43] font-semibold">
                  {t.project} • {t.tier}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

