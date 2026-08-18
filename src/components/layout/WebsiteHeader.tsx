import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, Building2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useWizardStore } from '../../store/useWizardStore';

export const WebsiteHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Why Planning', href: '#why-planning' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Engineering', href: '#standards' },
    { label: 'Packages', href: '#packages' },
    { label: 'Projects', href: '#projects' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + href);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const headerStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    transition: 'all 0.25s ease',
    padding: scrolled ? '0.75rem 0' : '0.95rem 0',
    backgroundColor: scrolled
      ? 'rgba(247, 247, 245, 0.94)'
      : 'rgba(247, 247, 245, 0.85)',
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    borderBottom: '1px solid #E5E7EB',
    boxShadow: scrolled ? '0 2px 10px -2px rgba(23,32,51,0.05)' : 'none',
  };

  return (
    <header style={headerStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">

        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          role="link"
          aria-label="Cost Calculator by Rightcon — Home"
        >
          <div className="w-9 h-9 rounded-lg bg-[#1F4B43] flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-102">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold tracking-tight text-[#172033] text-sm sm:text-base">
              Cost Calculator
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-[#667085] mt-0.5 uppercase">
              by Rightcon
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#667085] hover:text-[#172033] hover:bg-black/5 transition-all cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden sm:block text-xs font-semibold text-[#667085] hover:text-[#172033] px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Dashboard
          </button>

          <button
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="inline-flex items-center gap-2 text-white text-xs font-bold px-4 sm:px-5 py-2.5 rounded-lg bg-[#1F4B43] hover:bg-[#163731] transition-all cursor-pointer shadow-xs"
          >
            Start Free Estimate <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Hamburger (Mobile) */}
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
          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-left px-3 py-2.5 text-xs font-semibold text-[#172033] hover:bg-black/5 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex flex-col gap-2">
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
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
              className="w-full flex items-center justify-center text-xs font-semibold text-[#667085] py-2.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 transition-colors"
            >
              View Sample Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
};