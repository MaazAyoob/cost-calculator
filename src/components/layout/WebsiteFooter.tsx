import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const WebsiteFooter: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg = isDark ? '#0F172A' : '#F9FAFB';
  const border = isDark ? '#1E293B' : '#E2E8F0';
  const textPrimary = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const brandColor = '#2563EB';

  return (
    <footer style={{ backgroundColor: bg, borderColor: border }} className="border-t pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">

          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight block" style={{ color: textPrimary }}>
                  Cost Calculator
                </span>
                <span className="text-xs font-medium" style={{ color: textSecondary }}>
                  by Rightcon
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed max-w-sm" style={{ color: textSecondary }}>
              Deterministic Indian Standard home construction planning and cost estimation platform by Rightcon. 
              Helping homeowners calculate structural requirements, material budgets, and construction milestones before ground break.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs font-medium" style={{ color: textSecondary }}>
              <ShieldCheck className="w-4 h-4 text-blue-600" /> IS 456 & IS 1786 Engineering Compliant
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: textPrimary }}>Platform</h4>
            <ul className="space-y-2">
              {[
                { label: 'Start Free Estimate', action: () => navigate('/calculator') },
                { label: 'Project Dashboard', action: () => navigate('/dashboard') },
                { label: 'BOQ Breakdown', action: () => navigate('/report') },
                { label: 'How It Works', href: '#how-it-works' },
              ].map(({ label, action, href }) => (
                <li key={label}>
                  {href ? (
                    <a href={href} className="text-sm font-medium transition-colors hover:text-blue-600" style={{ color: textSecondary }}>
                      {label}
                    </a>
                  ) : (
                    <button onClick={action} className="text-sm font-medium transition-colors hover:text-blue-600 text-left cursor-pointer" style={{ color: textSecondary }}>
                      {label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: textPrimary }}>Standards & Rules</h4>
            <ul className="space-y-2">
              {[
                { label: 'IS 456 Concrete Codes', href: '#standards' },
                { label: 'IS 1786 TMT Steel Grades', href: '#standards' },
                { label: 'Why Planning Matters', href: '#why-planning' },
                { label: 'Architectural Portfolio', href: '#projects' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm font-medium transition-colors hover:text-blue-600" style={{ color: textSecondary }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: textPrimary }}>Rightcon Headquarters</h4>
            <div className="space-y-2 pt-1 text-xs" style={{ color: textSecondary }}>
              {[
                { icon: <MapPin className="w-3.5 h-3.5" />, text: 'Indiranagar & Whitefield, Bangalore' },
                { icon: <Phone className="w-3.5 h-3.5" />, text: '+91 (080) 4590-2200' },
                { icon: <Mail className="w-3.5 h-3.5" />, text: 'contact@rightcon.in' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <span className="text-blue-600">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ borderColor: border }}>
          <div style={{ color: textSecondary }}>
            &copy; {new Date().getFullYear()} Cost Calculator by Rightcon. All rights reserved.
          </div>
          <div className="flex items-center gap-6" style={{ color: textSecondary }}>
            {['Privacy Policy', 'Terms of Service', 'IS 456 Disclaimer'].map(link => (
              <a key={link} href="#" className="hover:text-blue-600 transition-colors font-medium">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
