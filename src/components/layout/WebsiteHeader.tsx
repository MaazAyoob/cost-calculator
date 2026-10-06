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

  // Track scroll for architectural sticky transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const isCurrent = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Editorial Micro-Banner */}
      <div className="hidden md:flex items-center justify-between px-6 py-1 bg-[#1B3D34] text-white/80 text-[10px] font-mono tracking-widest uppercase border-b border-white/10 select-none">
        <div className="flex items-center gap-3">
          <span className="text-[#F28C28] font-bold">HUTTY ARCHITECTURAL ENGINE</span>
          <span className="text-white/30">•</span>
          <span>IS-456:2000 &amp; NBC 2016 COMPLIANT</span>
          <span className="text-white/30">•</span>
          <span>BANGALORE URBAN JURISDICTION</span>
        </div>
        <div className="flex items-center gap-4 text-white/60">
          <span>DETERMINISTIC BOQ TAKEOFF</span>
          <span className="text-white/30">•</span>
          <span className="text-[#F28C28]">VERIFIED V2 RATE MASTER</span>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-[#F8F8F6]/95 backdrop-blur-md border-[#E5E7EB] py-2.5 shadow-sm'
            : 'bg-[#F8F8F6] border-[#E5E7EB] py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">

          {/* Hutty Logo & Engineering Label */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => handleNav('/')}
              className="cursor-pointer shrink-0 transition-transform active:scale-[0.98]"
              role="link"
              aria-label="Hutty — Home"
            >
              <HuttyLogo variant="full" width={105} className="hidden sm:block" />
              <HuttyLogo variant="full" width={92} className="sm:hidden" />
            </div>
            <span className="hidden xl:inline-block font-mono text-[9px] uppercase tracking-widest text-[#4B5563] bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/15 px-2 py-0.5 rounded">
              STUDIO EDITION
            </span>
          </div>

          {/* Desktop Navigation: Editorial & Architectural */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            <button
              onClick={() => {
                useWizardStore.getState().startNewProject();
                navigate('/calculator');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isCurrent('/calculator') || isCurrent('/planner')
                  ? 'text-[#1B3D34] bg-[rgba(27,61,52,0.1)] font-bold shadow-2xs'
                  : 'text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)]'
              }`}
            >
              <span className="font-mono text-[10px] text-[#F28C28] font-bold">01</span>
              <span>Calculate</span>
            </button>

            <button
              onClick={() => handleNav('/consult')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isCurrent('/consult')
                  ? 'text-[#1B3D34] bg-[rgba(27,61,52,0.1)] font-bold shadow-2xs'
                  : 'text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)]'
              }`}
            >
              <span className="font-mono text-[10px] text-[#4B5563]">02</span>
              <span>Consult</span>
            </button>

            <button
              onClick={() => handleNav('/pricing')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isCurrent('/pricing')
                  ? 'text-[#1B3D34] bg-[rgba(27,61,52,0.1)] font-bold shadow-2xs'
                  : 'text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)]'
              }`}
            >
              <span className="font-mono text-[10px] text-[#4B5563]">03</span>
              <span>Pricing</span>
            </button>

            <button
              onClick={() => handleNav('/dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isCurrent('/dashboard')
                  ? 'text-[#1B3D34] bg-[rgba(27,61,52,0.1)] font-bold shadow-2xs'
                  : 'text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)]'
              }`}
            >
              <span className="font-mono text-[10px] text-[#4B5563]">04</span>
              <span>My Project</span>
            </button>

            <button
              onClick={() => handleNav('/report')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isCurrent('/report')
                  ? 'text-[#1B3D34] bg-[rgba(27,61,52,0.1)] font-bold shadow-2xs'
                  : 'text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)]'
              }`}
            >
              <span className="font-mono text-[10px] text-[#4B5563]">05</span>
              <span>BOQ Report</span>
            </button>

            <button
              onClick={() => handleNav('/admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isCurrent('/admin')
                  ? 'text-[#1B3D34] bg-[rgba(27,61,52,0.1)] font-bold'
                  : 'text-[#9CA3AF] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)]'
              }`}
            >
              <span className="font-mono text-[9px] text-[#9CA3AF]">ADM</span>
              <span>Admin</span>
            </button>
          </nav>

          {/* Right Action Block */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                useWizardStore.getState().startNewProject();
                navigate('/calculator');
              }}
              className="hutty-btn-primary text-xs font-bold px-4 sm:px-5 py-2.5 rounded-lg transition-all cursor-pointer shadow-xs active:scale-[0.98] border border-[#1B3D34]"
            >
              <span>Start Free Estimate</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg lg:hidden text-[#1B3D34] hover:bg-[rgba(27,61,52,0.06)] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center border border-[#E5E7EB]"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#1B3D34]" /> : <Menu className="w-5 h-5 text-[#1B3D34]" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation: Intentional Fullscreen Architectural Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[57px] bottom-0 z-50 bg-[#F8F8F6] flex flex-col border-t border-[#E5E7EB] animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#4B5563] font-bold">
                  ARCHITECTURAL DIRECTORY
                </span>
                <span className="font-mono text-[10px] text-[#F28C28] font-bold">
                  BANGALORE RESIDENTIAL
                </span>
              </div>

              {/* Navigation Items with Large Editorial Style */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    useWizardStore.getState().startNewProject();
                    navigate('/calculator');
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between ${
                    isCurrent('/calculator') || isCurrent('/planner')
                      ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                      : 'bg-white text-[#1B3D34] border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#F28C28]">01</span>
                      <span className="text-base font-extrabold font-heading">Cost Calculator</span>
                    </div>
                    <p className={`text-xs ${isCurrent('/calculator') ? 'text-white/70' : 'text-[#4B5563]'}`}>
                      Plan plot, BUA, RCC framing &amp; live estimate
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${
                    isCurrent('/calculator') ? 'bg-white/20 text-white' : 'bg-[rgba(27,61,52,0.08)] text-[#1B3D34]'
                  }`}>
                    FREE
                  </span>
                </button>

                <button
                  onClick={() => handleNav('/consult')}
                  className={`w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between ${
                    isCurrent('/consult')
                      ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                      : 'bg-white text-[#1B3D34] border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#F28C28]">02</span>
                      <span className="text-base font-extrabold font-heading">Consult an Expert</span>
                    </div>
                    <p className={`text-xs ${isCurrent('/consult') ? 'text-white/70' : 'text-[#4B5563]'}`}>
                      Independent architectural &amp; structural reviews
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${
                    isCurrent('/consult') ? 'bg-white/20 text-white' : 'bg-[#F28C28]/15 text-[#F28C28]'
                  }`}>
                    ₹1,499
                  </span>
                </button>

                <button
                  onClick={() => handleNav('/pricing')}
                  className={`w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between ${
                    isCurrent('/pricing')
                      ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                      : 'bg-white text-[#1B3D34] border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#F28C28]">03</span>
                      <span className="text-base font-extrabold font-heading">Commercial Plans</span>
                    </div>
                    <p className={`text-xs ${isCurrent('/pricing') ? 'text-white/70' : 'text-[#4B5563]'}`}>
                      Free preview, ₹99 verified, ₹499 bank-ready BOQ
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${
                    isCurrent('/pricing') ? 'bg-white/20 text-white' : 'bg-[rgba(27,61,52,0.08)] text-[#1B3D34]'
                  }`}>
                    DETAILS
                  </span>
                </button>

                <button
                  onClick={() => handleNav('/dashboard')}
                  className={`w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between ${
                    isCurrent('/dashboard')
                      ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                      : 'bg-white text-[#1B3D34] border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#F28C28]">04</span>
                      <span className="text-base font-extrabold font-heading">My Project Command</span>
                    </div>
                    <p className={`text-xs ${isCurrent('/dashboard') ? 'text-white/70' : 'text-[#4B5563]'}`}>
                      Active residence status, quantities &amp; budget
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#4B5563]" />
                </button>

                <button
                  onClick={() => handleNav('/report')}
                  className={`w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between ${
                    isCurrent('/report')
                      ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                      : 'bg-white text-[#1B3D34] border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#F28C28]">05</span>
                      <span className="text-base font-extrabold font-heading">22-Section BOQ Report</span>
                    </div>
                    <p className={`text-xs ${isCurrent('/report') ? 'text-white/70' : 'text-[#4B5563]'}`}>
                      Download formal construction takeoff schedules
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${
                    isCurrent('/report') ? 'bg-white/20 text-white' : 'bg-[#F28C28]/15 text-[#F28C28]'
                  }`}>
                    ₹499
                  </span>
                </button>

                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full text-left p-3.5 rounded-xl border border-dashed border-[#E5E7EB] text-[#4B5563] hover:text-[#1B3D34] hover:bg-white flex items-center justify-between text-xs font-semibold"
                >
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[10px] text-[#9CA3AF]">ADM</span>
                    <span>Admin Operations &amp; Rate Master</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </button>
              </div>
            </div>

            {/* Bottom Sticky Action inside Mobile Drawer */}
            <div className="p-5 border-t border-[#E5E7EB] bg-white">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  useWizardStore.getState().startNewProject();
                  navigate('/calculator');
                }}
                className="w-full hutty-btn-primary py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm min-h-[50px]"
              >
                <span>Launch Architectural Calculator</span>
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