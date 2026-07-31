import React from 'react';
import { HeroSection } from './sections/HeroSection';
import { TrustStatsSection } from './sections/TrustStatsSection';
import { WhyPlanningSection } from './sections/WhyPlanningSection';
import { CostProblemsSection } from './sections/CostProblemsSection';
import { BuniyadSolutionsSection } from './sections/BuniyadSolutionsSection';
import { InteractiveDemoSection } from './sections/InteractiveDemoSection';
import { EngineeringStandardsSection } from './sections/EngineeringStandardsSection';
import { FeatureShowcaseSection } from './sections/FeatureShowcaseSection';
import { PackagesSection } from './sections/PackagesSection';
import { ProjectGallerySection } from './sections/ProjectGallerySection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { FaqSection } from './sections/FaqSection';
import { FinalCtaSection } from './sections/FinalCtaSection';

export const LandingPage: React.FC = () => {
  return (
    <div
      className="w-full min-h-screen font-sans"
      style={{ backgroundColor: 'var(--cc-bg)', color: 'var(--cc-text-primary)' }}
    >
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Trust Stats */}
      <TrustStatsSection />

      {/* 3. Why Build Without Planning? */}
      <WhyPlanningSection />

      {/* 4. Construction Cost Problems */}
      <CostProblemsSection />

      {/* 5. How Cost Calculator Solves Them */}
      <BuniyadSolutionsSection />

      {/* 6. Interactive Calculator Demo */}
      <InteractiveDemoSection />

      {/* 7. Engineering Standards */}
      <EngineeringStandardsSection />

      {/* 8. Feature Showcase */}
      <FeatureShowcaseSection />

      {/* 9. Construction Packages */}
      <PackagesSection />

      {/* 10. Project Gallery */}
      <ProjectGallerySection />

      {/* 11. Testimonials */}
      <TestimonialsSection />

      {/* 12. FAQ */}
      <FaqSection />

      {/* 13. Final CTA */}
      <FinalCtaSection />
    </div>
  );
};
