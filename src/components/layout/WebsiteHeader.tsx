import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, Building2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';
import { useWizardStore } from '../../store/useWizardStore';

export const WebsiteHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Why Planning', href: '#why-planning' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Standards', href: '#standards' },
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

  const isDark = theme === 'dark';

  const headerStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    transition: 'all 0.3s ease',
    padding: '0.875rem 0',
    backgroundColor: scrolled
      ? 'rgba(255,255,255,0.95)'
      : 'rgba(249,250,251,0.85)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    borderBottom: '1px solid #E5E7EB',
    boxShadow: scrolled ? '0 2px 12px rgba(15,23,42,0.06)' : 'none',
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
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold tracking-tight text-slate-900 text-base">
              Cost Calculator
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 mt-0.5 uppercase">
              by Rightcon
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Actions — Dashboard first, Start Free Estimate LAST */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden md:block text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            Dashboard
          </button>

          <button
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="hidden sm:inline-flex items-center gap-2 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer shadow-soft-xs"
          >
            Start Free Estimate <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Hamburger (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl md:hidden text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-5 py-5 space-y-4 border-t border-slate-200 bg-white">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                useWizardStore.getState().startNewProject();
                navigate('/calculator');
              }}
              className="w-full flex items-center justify-center gap-2 text-white text-xs font-extrabold py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer shadow-soft-xs"
            >
              Start Free Estimate <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
              className="w-full flex items-center justify-center text-xs font-bold text-slate-700 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              View Sample Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
};