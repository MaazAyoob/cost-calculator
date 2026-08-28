import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
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
      <footer className="bg-[#1B3D34] text-white border-t border-white/10 select-none">
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
                <div className="inline-block bg-white rounded-xl px-3 py-2">
                  <HuttyLogo variant="full" width={140} />
                </div>
              </div>
              <p className="text-sm text-white/70 max-w-sm font-normal leading-relaxed">
                Build your home with clarity. Formula-driven architectural planning, physical quantities, and bank-ready construction cost estimates.
              </p>
              <div className="text-xs text-white/40 pt-1">
                Bangalore &bull; Mysore &bull; Karnataka
              </div>
            </div>

            {/* Hutty Offerings */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/90 font-heading">
                Offerings
              </h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <button
                    onClick={handleStartEstimate}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1"
                  >
                    1. What should it cost? (Free) <ArrowUpRight className="w-3 h-3 text-[#F28C28]" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/report')}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1"
                  >
                    2. What am I paying for? (₹4,999)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowQuoteModal(true)}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1"
                  >
                    3. Should I sign this? (₹8,999)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowTrackModal(true)}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1"
                  >
                    4. Where is my money going? (Sub)
                  </button>
                </li>
              </ul>
            </div>

            {/* Product Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/90 font-heading">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Project Dashboard
                  </button>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    Construction Pipeline
                  </a>
                </li>
                <li>
                  <a href="#standards" className="hover:text-white transition-colors">
                    Engineering Standards
                  </a>
                </li>
                <li>
                  <a href="#packages" className="hover:text-white transition-colors">
                    Specification Matrix
                  </a>
                </li>
              </ul>
            </div>

            {/* Engineering Standards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/90 font-heading">
                Standards
              </h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <span className="text-white/60">IS 456:2000 Plain &amp; RCC</span>
                </li>
                <li>
                  <span className="text-white/60">IS 1786 Fe550D Steel</span>
                </li>
                <li>
                  <span className="text-white/60">NBC 2016 Safety Standards</span>
                </li>
                <li>
                  <span className="text-white/60">BBMP / BDA Zoning Bylaws</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
            <p>© {new Date().getFullYear()} Hutty. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Deterministic Quantity Takeoff</span>
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
