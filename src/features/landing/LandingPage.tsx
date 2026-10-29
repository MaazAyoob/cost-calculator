import React from 'react';
import { SEO } from '../../components/common/SEO';
import { HeroSection } from './sections/HeroSection';
import { ThreeEasyStepsSection } from './sections/ThreeEasyStepsSection';
import { FourOfferingsSection } from './sections/FourOfferingsSection';
import { SignatureConstructionBreakdownSection } from './sections/SignatureConstructionBreakdownSection';
import { SignatureExpertSection } from './sections/SignatureExpertSection';
import { FaqSection } from './sections/FaqSection';
import { FinalCtaSection } from './sections/FinalCtaSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen font-sans bg-[#F8F8F6] text-[#1B3D34]">
      <SEO
        title="Hutty — Understand your home before you build"
        description="Plan your house, see how much it may cost, understand the materials you may need, and get help from experts when you need it."
      />

      {/* 01. Hero — Architectural Split Statement + Interactive Planning Panel */}
      <HeroSection />

      {/* 02. Three Simple Steps — Plot, Home, Estimate */}
      <ThreeEasyStepsSection />

      {/* 03. Core Offerings — Free, Detailed BOQ (₹499), Expert Consultation (₹1,499) */}
      <FourOfferingsSection />

      {/* 04. Construction Breakdown — Steel, Cement, Sand, Labour */}
      <SignatureConstructionBreakdownSection />

      {/* 05. Independent Expert Consultation — Unbiased Review (₹1,499) */}
      <SignatureExpertSection />

      {/* 06. Homeowner Frequently Asked Questions */}
      <FaqSection />

      {/* 07. Final Call to Action */}
      <FinalCtaSection />
    </div>
  );
};
