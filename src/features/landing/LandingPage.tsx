import React from 'react';
import { SEO } from '../../components/common/SEO';
import { HeroSection } from './sections/HeroSection';
import { FourOfferingsSection } from './sections/FourOfferingsSection';
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
    <div className="w-full min-h-screen font-sans bg-[#F8F8F6] text-[#1B3D34]">
      <SEO
        title="Hutty — Home Construction Planning Platform | Build your home with clarity"
        description="Plan your plot, spaces, materials and construction cost before you build with Hutty. Deterministic, quantity-based estimates and bank-ready BOQ."
      />

      {/* 01. Hero */}
      <HeroSection />

      {/* 01b. 4 Core Offerings */}
      <FourOfferingsSection />

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
