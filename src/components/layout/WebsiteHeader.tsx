import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, Building2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

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
    { label: 'How It Works', href: '#solutions' },
    { label: 'Features', href: '#features' },
    { label: 'IS 456 Standards', href: '#standards' },
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

  // Computed style values — no template-literal classNames needed
  const headerStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    transition: 'all 0.3s ease',
    padding: '0.875rem 0',
    backgroundColor: scrolled
      ? (isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)')
      : (isDark ? 'rgba(15,23,42,0.60)' : 'rgba(250,250,248,0.75)'),
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    borderBottom: `1px solid ${isDark ? '#1F2937' : '#E5E7EB'}`,
    boxShadow: scrolled ? (isDark ? 'none' : '0 2px 12px rgba(17,24,39,0.07)') : 'none',
  };

  const textPri    = isDark ? '#F8FAFC' : '#111827';
  const textSec    = isDark ? '#94A3B8' : '#6B7280';
  const brand      = isDark ? '#14B8A6' : '#0F766E';
  const hoverBg    = isDark ? 'rgba(255,255,255,0.08)' : '#F4F4F0';
  const mobileBg   = isDark ? '#0F172A' : '#FFFFFF';
  const mobileBdr  = isDark ? '#1F2937' : '#E5E7EB';

  return (
    <header style={headerStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">

        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          role="link"
          aria-label="Cost Calculator — Home"
        >
          <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#0F766E] to-[#0D9488] flex items-center justify-center transition-all"
            style={{ boxShadow: '0 4px 14px rgba(15,118,110,0.35)' }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold tracking-tight text-[1.05rem] transition-colors" style={{ color: textPri }}>
              Cost Calculator
            </span>
            <span className="text-[10px] font-semibold tracking-wide mt-0.5 flex items-center gap-1.5" style={{ color: textSec }}>
              <span>by Rightcon</span>
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: brand }} />
              <span className="font-bold" style={{ color: brand }}>IS 456</span>
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              style={{ color: textSec }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverBg; (e.currentTarget as HTMLButtonElement).style.color = textPri; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = textSec; }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme toggle */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg transition-all cursor-pointer"
            style={{ color: isDark ? '#94A3B8' : '#6B7280' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverBg; (e.currentTarget as HTMLButtonElement).style.color = isDark ? '#FDE68A' : '#C6A75E'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = isDark ? '#94A3B8' : '#6B7280'; }}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Sample Dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden sm:block text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer"
            style={{ color: textSec }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverBg; (e.currentTarget as HTMLButtonElement).style.color = textPri; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = textSec; }}
          >
            Dashboard
          </button>

          {/* Primary CTA */}
          <button
            onClick={() => navigate('/calculator')}
            className="hidden sm:flex items-center gap-1.5 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-px cursor-pointer"
            style={{ backgroundColor: brand, boxShadow: '0 4px 14px rgba(15,118,110,0.35)' }}
          >
            Start Free Estimate
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile CTA (shown only on small screens) */}
          <button
            onClick={() => navigate('/calculator')}
            className="text-xs font-bold text-white px-3 py-1.5 rounded-lg sm:hidden"
            style={{ backgroundColor: brand }}
          >
            Estimate
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg xl:hidden transition-colors"
            aria-label="Toggle menu"
            style={{ color: textSec }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden px-5 py-5 space-y-4 border-t" style={{ backgroundColor: mobileBg, borderColor: mobileBdr }}>
          <div className="grid grid-cols-2 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-left px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors"
                style={{ color: textSec }}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t flex flex-col gap-3" style={{ borderColor: mobileBdr }}>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/calculator'); }}
              className="w-full flex items-center justify-center gap-2 text-white text-sm font-bold py-3 rounded-xl transition-all"
              style={{ backgroundColor: brand, boxShadow: '0 4px 14px rgba(15,118,110,0.30)' }}
            >
              Start Free Estimate <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
              className="w-full flex items-center justify-center text-xs font-semibold py-2.5 rounded-xl border transition-colors"
              style={{ color: textSec, borderColor: mobileBdr }}
            >
              View Sample Dashboard
            </button>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl border transition-colors"
              style={{ color: isDark ? '#FDE68A' : '#C6A75E', borderColor: mobileBdr }}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};