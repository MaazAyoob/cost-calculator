import React from 'react';
import { SEO } from '../../components/common/SEO';
import { HeroSection } from './sections/HeroSection';
import { IntroductionSection } from './sections/IntroductionSection';
import { FourOfferingsSection } from './sections/FourOfferingsSection';
import { ThreeEasyStepsSection } from './sections/ThreeEasyStepsSection';
import { InteractiveDemoSection } from './sections/InteractiveDemoSection';
import { SignaturePlanningTimelineSection } from './sections/SignaturePlanningTimelineSection';
import { SignatureConstructionBreakdownSection } from './sections/SignatureConstructionBreakdownSection';
import { WhyPlanningSection } from './sections/WhyPlanningSection';
import { EngineeringStandardsSection } from './sections/EngineeringStandardsSection';
import { SignatureExpertSection } from './sections/SignatureExpertSection';
import { FaqSection } from './sections/FaqSection';
import { FinalCtaSection } from './sections/FinalCtaSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen font-sans bg-[#F8F8F6] text-[#18211E]">
      <SEO
        title="Hutty — Build your home with clarity"
        description="Residential construction planning and estimation platform for Bangalore. Calculate permissible setbacks, material quantities, and costs before you build."
      />

      {/* 01. Hero Experience — Architectural Split Statement + Interactive Planning Panel */}
      <HeroSection />

      {/* 02. Introduction to Hutty — Editorial Technical Architecture & Platform Mission */}
      <IntroductionSection />

      {/* 03. Construction Intelligence Features — Free Estimate, Detailed BOQ (₹499), Expert Consultation (₹1,499) */}
      <FourOfferingsSection />

      {/* 04. How Hutty Works — Three Clear Steps + Family Photographic Storytelling */}
      <ThreeEasyStepsSection />

      {/* 05. Calculator Showcase — Live Interactive Demo with Real Mathematical Takeoffs */}
      <InteractiveDemoSection />

      {/* 06. Construction Stages — 13-Milestone Residential Project Roadmap */}
      <SignaturePlanningTimelineSection />

      {/* 07. Materials & Cost Transparency — Steel Tonnage, Cement Bags, Sand, Blocks, and Rates */}
      <SignatureConstructionBreakdownSection />

      {/* 08. Why Homeowners Should Use Hutty — Conventional Pitfalls vs. Quantity-First Planning */}
      <WhyPlanningSection />

      {/* 09. Trust & Credibility — Indian Civil Codes (IS 456, IS 1786, NBC 2016) & Formulas */}
      <EngineeringStandardsSection />

      {/* 10. Consultation Call-to-Action — Unbiased COA Architects & Structural Engineers (₹1,499) */}
      <SignatureExpertSection />

      {/* 11. FAQ Section — Clear Homeowner Answers on Municipal Bye-Laws & Cost Variances */}
      <FaqSection />

      {/* Closing Action Anchor */}
      <FinalCtaSection />
    </div>
  );
};
