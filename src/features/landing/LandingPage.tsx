import React from 'react';
import { HeroSection } from './sections/HeroSection';
import { TrustStatsSection } from './sections/TrustStatsSection';
import { WhyPlanningSection } from './sections/WhyPlanningSection';
import { CalculatorSolutionsSection } from './sections/CalculatorSolutionsSection';
import { InteractiveDemoSection } from './sections/InteractiveDemoSection';
import { FeatureShowcaseSection } from './sections/FeatureShowcaseSection';
import { EngineeringStandardsSection } from './sections/EngineeringStandardsSection';
import { PackagesSection } from './sections/PackagesSection';
import { ProjectGallerySection } from './sections/ProjectGallerySection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { FaqSection } from './sections/FaqSection';
import { FinalCtaSection } from './sections/FinalCtaSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen font-sans bg-[#F7F7F5] text-[#172033]">
      {/* 01. Hero */}
      <HeroSection />

      {/* 02. Trust Strip */}
      <TrustStatsSection />

      {/* 03. Why Planning */}
      <WhyPlanningSection />

      {/* 04. How It Works */}
      <CalculatorSolutionsSection />

      {/* 05. Live Interactive Demo */}
      <InteractiveDemoSection />

      {/* 06. Features Showcase */}
      <FeatureShowcaseSection />

      {/* 07. Dark Technical Engineering Standards */}
      <EngineeringStandardsSection />

      {/* 08. Construction Packages Matrix */}
      <PackagesSection />

      {/* 09. Architectural Projects Gallery */}
      <ProjectGallerySection />

      {/* 10. Large Testimonial */}
      <TestimonialsSection />

      {/* 11. Minimal FAQ Accordion */}
      <FaqSection />

      {/* 12. Final Action CTA */}
      <FinalCtaSection />
    </div>
  );
};
