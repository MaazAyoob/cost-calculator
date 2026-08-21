import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useWizardStore } from '../../store/useWizardStore';
import { HuttyLogo } from '../brand/HuttyLogo';

export const WebsiteHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Why Planning', href: '#why-planning' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Calculator', action: () => { useWizardStore.getState().startNewProject(); navigate('/calculator'); } },
    { label: 'Engineering', href: '#standards' },
    { label: 'Projects', href: '#projects' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleNavClick = (link: { label: string; href?: string; action?: () => void }) => {
    setMobileMenuOpen(false);
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
          {/* Full logo: 100px desktop, 84px mobile */}
          <HuttyLogo variant="full" width={100} className="hidden sm:block" />
          <HuttyLogo variant="full" width={84} className="sm:hidden" />
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] transition-all cursor-pointer"
            >
              {link.label}
            </button>
          ))}
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
            <ArrowRight className="w-3.5 h-3.5" />
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
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="text-left px-3 py-2 text-xs font-semibold text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E5E7EB]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                useWizardStore.getState().startNewProject();
                navigate('/calculator');
              }}
              className="w-full hutty-btn-primary py-3 rounded-lg text-xs font-bold"
            >
              Start Free Estimate <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};