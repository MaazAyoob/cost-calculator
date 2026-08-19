import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, Building2 } from 'lucide-react';
import { useWizardStore } from '../../store/useWizardStore';

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
          ? 'bg-[#F7F7F5]/90 backdrop-blur-md border-[#E5E7EB] py-3 shadow-xs'
          : 'bg-[#F7F7F5] border-[#E5E7EB]/80 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">

        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          role="link"
          aria-label="Cost Calculator by Rightcon — Home"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1F4B43] flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col leading-none text-left">
            <span className="font-bold tracking-tight text-[#172033] text-sm sm:text-base">
              Cost Calculator
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-[#667085] mt-0.5 uppercase">
              by Rightcon
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#667085] hover:text-[#172033] hover:bg-black/5 transition-all cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="inline-flex items-center gap-2 text-white text-xs font-bold px-4 sm:px-5 py-2.5 rounded-lg bg-[#1F4B43] hover:bg-[#163731] transition-all cursor-pointer shadow-xs"
          >
            Start Free Estimate <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg lg:hidden text-[#667085] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-5 py-5 space-y-4 border-t border-[#E5E7EB] bg-[#F7F7F5]">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="text-left px-3 py-2 text-xs font-semibold text-[#172033] hover:bg-black/5 rounded-lg transition-colors"
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
              className="w-full flex items-center justify-center gap-2 text-white text-xs font-bold py-3 rounded-lg bg-[#1F4B43] hover:bg-[#163731] transition-all cursor-pointer shadow-xs"
            >
              Start Free Estimate <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};