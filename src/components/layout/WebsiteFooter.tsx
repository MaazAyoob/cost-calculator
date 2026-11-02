import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useWizardStore } from '../../store/useWizardStore';
import { HuttyLogo } from '../brand/HuttyLogo';
import { QuoteReviewModal } from '../modals/QuoteReviewModal';
import { BuildTrackingModal } from '../modals/BuildTrackingModal';

export const WebsiteFooter: React.FC = () => {
  const navigate = useNavigate();
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);

  const handleStartEstimate = () => {
    useWizardStore.getState().startNewProject();
    navigate('/calculator');
  };

  return (
    <>
      <footer className="bg-[#183B32] text-white border-t border-[#245747] select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12">
            
            {/* Brand Col */}
            <div className="md:col-span-2 space-y-4">
              <div
                onClick={() => navigate('/')}
                className="cursor-pointer inline-block"
                role="link"
                aria-label="Hutty — Home"
              >
                <div className="inline-block bg-white rounded-xl px-3 py-2 border border-[#E5E7EB]">
                  <HuttyLogo variant="full" width={140} />
                </div>
              </div>
              <p className="text-sm text-[#B7CDBB] max-w-sm font-normal leading-relaxed">
                Build your home with clarity. Architectural planning, materials needed, and itemized construction cost intelligence before you build.
              </p>
              <div className="text-xs text-[#E5D5B4] font-medium pt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C66B4E]" />
                <span>Bangalore &bull; Mysore &bull; Karnataka</span>
              </div>
            </div>

            {/* Hutty Offerings */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#E5D5B4] font-heading">
                Offerings
              </h4>
              <ul className="space-y-2 text-xs text-[#B7CDBB]">
                <li>
                  <button
                    onClick={handleStartEstimate}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1"
                  >
                    1. Instant Estimate (Free) <ArrowUpRight className="w-3 h-3 text-[#C66B4E]" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/report')}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1"
                  >
                    2. Detailed Estimate &amp; BOQ (₹499)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1"
                  >
                    3. Calculator — Premium (₹1,499)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/consult')}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1"
                  >
                    4. Expert Consultation (₹1,499)
                  </button>
                </li>
              </ul>
            </div>

            {/* Product Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#E5D5B4] font-heading">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-[#B7CDBB]">
                <li>
                  <button
                    onClick={handleStartEstimate}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Calculate Cost
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/how-it-works')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/consult')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Consult an Expert
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Pricing &amp; Plans
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/professionals/join')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    For Professionals
                  </button>
                </li>
              </ul>
            </div>

            {/* Engineering Standards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#E5D5B4] font-heading">
                Standards
              </h4>
              <ul className="space-y-2 text-xs text-[#B7CDBB]">
                <li>
                  <span className="text-[#B7CDBB]/80">IS 456:2000 Plain &amp; RCC</span>
                </li>
                <li>
                  <span className="text-[#B7CDBB]/80">IS 1786 Fe550D Steel</span>
                </li>
                <li>
                  <span className="text-[#B7CDBB]/80">NBC 2016 Safety Standards</span>
                </li>
                <li>
                  <span className="text-[#B7CDBB]/80">BBMP / BDA Zoning Bylaws</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="mt-10 p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-[#B7CDBB] leading-relaxed">
            <strong className="text-white block mb-1">Planning Disclaimer:</strong>
            This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked. Hutty does not guarantee municipal sanction or bank loan approval.
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-[#245747] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B7CDBB]/70">
            <p>© {new Date().getFullYear()} Hutty. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <button
                onClick={() => navigate('/how-it-works')}
                className="hover:text-white transition-colors cursor-pointer text-[#B7CDBB]/70"
              >
                How It Works
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="hover:text-white transition-colors cursor-pointer text-[#B7CDBB]/50 hover:underline"
                aria-label="Admin Portal"
              >
                Admin Portal
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QuoteReviewModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
      <BuildTrackingModal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
      />
    </>
  );
};
