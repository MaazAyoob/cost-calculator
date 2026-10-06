import React from 'react';
import { SEO } from '../../components/common/SEO';
import { HeroSection } from './sections/HeroSection';
import { CostAmbiguityTrapSection } from './sections/CostAmbiguityTrapSection';
import { VisualStorytellingSection } from './sections/VisualStorytellingSection';
import { SignatureMeasurementSection } from './sections/SignatureMeasurementSection';
import { SignatureConstructionBreakdownSection } from './sections/SignatureConstructionBreakdownSection';
import { SignatureCostMapSection } from './sections/SignatureCostMapSection';
import { SignaturePlanningTimelineSection } from './sections/SignaturePlanningTimelineSection';
import { SignatureExpertSection } from './sections/SignatureExpertSection';
import { SignaturePricingSection } from './sections/SignaturePricingSection';
import { EngineeringStandardsSection } from './sections/EngineeringStandardsSection';
import { LiveMaterialPricesSection } from './sections/LiveMaterialPricesSection';
import { FaqSection } from './sections/FaqSection';
import { FinalCtaSection } from './sections/FinalCtaSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen font-sans bg-[#F8F8F6] text-[#1B3D34]">
      <SEO
        title="Hutty — Home Construction Planning Platform | Build your home with clarity"
        description="Plan your plot, spaces, materials and construction cost before you build with Hutty. Deterministic, quantity-based estimates and bank-ready BOQ."
      />

      {/* 01. Hero — Architectural Split Statement + Interactive 3D Massing HUD */}
      <HeroSection />

      {/* 02. The Problem — The Cost Ambiguity Trap & Why Square-Foot Rates Fail */}
      <CostAmbiguityTrapSection />

      {/* 03. Hutty's Approach — The 7-Stage Progression Flow (Plot to Total BOQ) */}
      <VisualStorytellingSection />

      {/* 04. Signature A — Architectural Measurement & Setbacks (Large BUA) */}
      <SignatureMeasurementSection />

      {/* 05. Signature B — Construction Breakdown (What Your Home Consumes: Steel, Cement, Sand) */}
      <SignatureConstructionBreakdownSection />

      {/* 06. Signature C — The Cost Map (Proportional Trade Allocation & Rupee Distribution) */}
      <SignatureCostMapSection />

      {/* 07. Signature D — Homeowner Roadmap (Plan, Measure, Estimate, Review, Build) */}
      <SignaturePlanningTimelineSection />

      {/* 08. Signature E — Independent Expert Consultation (Flat ₹1,499) */}
      <SignatureExpertSection />

      {/* 09. Commercial Pricing — Asymmetric Hierarchy (Spotlight ₹499 BOQ Dossier) */}
      <SignaturePricingSection />

      {/* 10. Engineering Standards — IS 456:2000, IS 1786 Fe550D & NBC 2016 Standards */}
      <EngineeringStandardsSection />

      {/* 11. Live Material Trackers — Bangalore Verified Brand Retail Prices */}
      <LiveMaterialPricesSection />

      {/* 12. Architectural Planning FAQ */}
      <FaqSection />

      {/* 13. Final Action Callout */}
      <FinalCtaSection />
    </div>
  );
};
