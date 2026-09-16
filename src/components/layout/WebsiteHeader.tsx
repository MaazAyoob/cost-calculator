import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, ChevronDown } from 'lucide-react';
import { useWizardStore } from '../../store/useWizardStore';
import { HuttyLogo } from '../brand/HuttyLogo';
import { QuoteReviewModal } from '../modals/QuoteReviewModal';
import { BuildTrackingModal } from '../modals/BuildTrackingModal';

export const WebsiteHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [offeringsDropdown, setOfferingsDropdown] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (link: { label: string; href?: string; action?: () => void }) => {
    setMobileMenuOpen(false);
    setOfferingsDropdown(false);
    if (link.action) {
      link.action();
      return;
    }
    if (!link.href) return;
    if (location.pathname !== '/') {
      navigate('/' + link.href);
    } else {
      document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-200 border-b ${
          scrolled
            ? 'bg-[#F8F8F6]/95 backdrop-blur-md border-[#E5E7EB] py-3.5 shadow-xs'
            : 'bg-[#F8F8F6] border-[#E5E7EB] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">

          {/* Hutty Logo */}
          <div
            onClick={() => navigate('/')}
            className="cursor-pointer shrink-0"
            role="link"
            aria-label="Hutty — Home"
          >
            <HuttyLogo variant="full" width={100} className="hidden sm:block" />
            <HuttyLogo variant="full" width={84} className="sm:hidden" />
          </div>

          {/* Center Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
            {/* Offerings Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOfferingsDropdown(!offeringsDropdown)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] transition-all cursor-pointer flex items-center gap-1"
              >
                <span>How Hutty Helps</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${offeringsDropdown ? 'rotate-180' : ''}`} />
              </button>

              {offeringsDropdown && (
                <div
                  className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl p-2 z-50 space-y-1 text-left animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setOfferingsDropdown(false)}
                >
                  <button
                    onClick={() => {
                      setOfferingsDropdown(false);
                      useWizardStore.getState().startNewProject();
                      navigate('/calculator');
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-[#F8F8F6] text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1B3D34]">What should it cost?</span>
                      <span className="text-[9px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-1.5 py-0.5 rounded">FREE</span>
                    </div>
                    <p className="text-[10px] text-[#4B5563]">Free construction cost estimate</p>
                  </button>

                  <button
                    onClick={() => {
                      setOfferingsDropdown(false);
                      navigate('/report');
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-[#F8F8F6] text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1B3D34]">What am I paying for?</span>
                      <span className="text-[9px] font-mono font-bold text-[#F28C28]">₹4,999</span>
                    </div>
                    <p className="text-[10px] text-[#4B5563]">Detailed cost + BOQ report</p>
                  </button>

                  <button
                    onClick={() => {
                      setOfferingsDropdown(false);
                      setShowQuoteModal(true);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-[#F8F8F6] text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1B3D34]">Should I sign this?</span>
                      <span className="text-[9px] font-mono font-bold text-[#F28C28]">₹8,999</span>
                    </div>
                    <p className="text-[10px] text-[#4B5563]">Quote review &amp; negotiation support</p>
                  </button>

                  <button
                    onClick={() => {
                      setOfferingsDropdown(false);
                      setShowTrackModal(true);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-[#F8F8F6] text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1B3D34]">Where is my money going?</span>
                      <span className="text-[9px] font-mono font-bold text-[#1B3D34]">SUBSCRIPTION</span>
                    </div>
                    <p className="text-[10px] text-[#4B5563]">Construction budget &amp; progress tracking</p>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick({ label: 'Why Planning', href: '#why-planning' })}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] transition-all cursor-pointer"
            >
              Why Planning
            </button>
            <button
              onClick={() => handleNavClick({ label: 'How It Works', href: '#how-it-works' })}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] transition-all cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick({ label: 'Engineering', href: '#standards' })}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] transition-all cursor-pointer"
            >
              Engineering
            </button>
            <button
              onClick={() => {
                useWizardStore.getState().startNewProject();
                navigate('/calculator');
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] transition-all cursor-pointer"
            >
              Calculator
            </button>
            <button
              onClick={() => handleNavClick({ label: 'Dashboard', action: () => navigate('/dashboard') })}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] transition-all cursor-pointer"
            >
              Dashboard
            </button>
          </nav>

          {/* Right CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                useWizardStore.getState().startNewProject();
                navigate('/calculator');
              }}
              className="hutty-btn-primary text-xs font-bold px-4 sm:px-5 py-2.5 rounded-lg transition-all cursor-pointer"
            >
              <span>Start Free Estimate</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg lg:hidden text-[#4B5563] hover:bg-[rgba(27,61,52,0.04)] transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-5 py-5 space-y-4 border-t border-[#E5E7EB] bg-[#F8F8F6]">
            <div className="grid grid-cols-1 gap-1 text-left">
              <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider px-3 pt-1">
                How Hutty Helps
              </span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  useWizardStore.getState().startNewProject();
                  navigate('/calculator');
                }}
                className="text-left px-3 py-2 text-xs font-bold text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] rounded-lg"
              >
                1. What should it cost? (Free Estimate)
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/report');
                }}
                className="text-left px-3 py-2 text-xs font-bold text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] rounded-lg"
              >
                2. What am I paying for? (₹4,999 Report)
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowQuoteModal(true);
                }}
                className="text-left px-3 py-2 text-xs font-bold text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] rounded-lg"
              >
                3. Should I sign this? (₹8,999 Review)
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowTrackModal(true);
                }}
                className="text-left px-3 py-2 text-xs font-bold text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] rounded-lg"
              >
                4. Where is my money going? (Tracking)
              </button>
            </div>

            <div className="pt-2 border-t border-[#E5E7EB]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  useWizardStore.getState().startNewProject();
                  navigate('/calculator');
                }}
                className="w-full hutty-btn-primary py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Start Free Estimate</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>
            </div>
          </div>
        )}
      </header>

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