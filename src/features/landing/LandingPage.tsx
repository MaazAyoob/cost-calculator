import React, { useEffect } from 'react';
import { SEO } from '../../components/common/SEO';
import { HeroSection } from './sections/HeroSection';
import { WhatYourReportIncludesSection } from './sections/WhatYourReportIncludesSection';
import { WhatHuttyHelpsYouUnderstandSection } from './sections/WhatHuttyHelpsYouUnderstandSection';
import { ThreeEasyStepsSection } from './sections/ThreeEasyStepsSection';
import { SignaturePricingSection } from './sections/SignaturePricingSection';
import { FaqSection } from './sections/FaqSection';
import { FinalCtaSection } from './sections/FinalCtaSection';
import { analytics } from '../../utils/analytics';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    analytics.trackLandingView();
  }, []);

  return (
    <div className="w-full min-h-screen font-sans bg-[#F8F8F6] text-[#18211E]">
      <SEO
        title="Hutty — Residential Construction Planning & Estimation Report"
        description="Understand your estimated construction costs, physical material quantities, municipal setbacks, and 22-package works BOQ before building in Bangalore."
      />

      {/* Section 1 — Hero: Clear home planning pitch, sample download & primary CTA */}
      <HeroSection />

      {/* Section 2 — Report Showcase: Everything you need to plan your home */}
      <WhatYourReportIncludesSection />

      {/* Section 3 — Key Benefits: What Hutty helps you understand (costs, materials, stages, report) */}
      <WhatHuttyHelpsYouUnderstandSection />

      {/* Section 4 — How Hutty Works: 3 simple steps (Plot details, Estimate, Full report) */}
      <ThreeEasyStepsSection />

      {/* Section 5 — Simple Pricing: Free preview (₹0) vs Complete PDF Report (₹199 one-time) */}
      <SignaturePricingSection />

      {/* Section 6 — Compact FAQ: 4 essential homeowner questions */}
      <FaqSection />

      {/* Section 7 — Final CTA: Start planning your home today */}
      <FinalCtaSection />
    </div>
  );
};