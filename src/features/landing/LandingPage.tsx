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
    <div
      className="w-full min-h-screen font-sans bg-slate-50 text-slate-900"
    >
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Trust Stats / Credibility */}
      <TrustStatsSection />

      {/* 3. Why Planning Matters */}
      <WhyPlanningSection />

      {/* 4. How It Works */}
      <CalculatorSolutionsSection />

      {/* 5. Interactive Calculator Preview */}
      <InteractiveDemoSection />

      {/* 6. Features Showcase */}
      <FeatureShowcaseSection />

      {/* 7. Engineering Standards */}
      <EngineeringStandardsSection />

      {/* 8. Construction Packages */}
      <PackagesSection />

      {/* 9. Project Gallery */}
      <ProjectGallerySection />

      {/* 10. Testimonials */}
      <TestimonialsSection />

      {/* 11. FAQ */}
      <FaqSection />

      {/* 12. Final CTA */}
      <FinalCtaSection />
    </div>
  );
};
