import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const WebsiteFooter: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg = isDark ? '#0F172A' : '#F9FAFB';
  const surface = isDark ? '#1E293B' : '#FFFFFF';
  const border = isDark ? '#334155' : '#E2E8F0';
  const textPrimary = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const brandColor = isDark ? '#3B82F6' : '#2563EB';

  return (
    <footer style={{ backgroundColor: bg, borderTopColor: border }} className="border-t pt-16 pb-12 relative overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="absolute bottom-0 right-1/4 w-[600px] h-[300px] rounded-full blur-[120px] pointer-events-none opacity-40"
        style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.06)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">

          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-[0_4px_14px_rgba(37,99,235,0.30)]">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight block" style={{ color: textPrimary }}>
                  BuildPlan AI
                </span>
                <span className="text-xs font-semibold" style={{ color: brandColor }}>
                  Engineering Cost Intelligence by Rightcon
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed max-w-sm" style={{ color: textSecondary }}>
              India's premier IS 456 compliant architecture and home estimation platform by Rightcon.
              Helping homeowners, architects, and structural engineers estimate costs and timeline milestones before ground break.
            </p>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
                style={{ backgroundColor: isDark ? '#134E4A' : '#CCFBF1', color: brandColor, borderColor: isDark ? '#0F766E40' : '#0F766E30' }}>
                <ShieldCheck className="w-3.5 h-3.5" /> IS 456 Compliant BOQ
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
                style={{ backgroundColor: isDark ? '#44381A' : '#FEF3C7', color: isDark ? '#D4A847' : '#C6A75E', borderColor: isDark ? '#C6A75E20' : '#C6A75E30' }}>
                Bangalore & Karnataka Index
              </span>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest" style={{ color: textPrimary }}>Platform</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Cost Calculator', action: () => navigate('/calculator') },
                { label: 'Sample Dashboard', action: () => navigate('/dashboard') },
                { label: 'Bank-Ready Reports', action: () => navigate('/report') },
                { label: 'Interactive Demo', action: () => {}, href: '#demo' },
                { label: 'Construction Packages', action: () => {}, href: '#packages' },
              ].map(({ label, action, href }) => (
                <li key={label}>
                  {href ? (
                    <a href={href} className="text-sm font-medium transition-colors hover:underline" style={{ color: textSecondary }}>
                      {label}
                    </a>
                  ) : (
                    <button onClick={action} className="text-sm font-medium transition-colors hover:underline text-left cursor-pointer" style={{ color: textSecondary }}>
                      {label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Standards */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest" style={{ color: textPrimary }}>Standards & Guides</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'IS 456 Structural Codes', href: '#standards' },
                { label: 'Why Estimate First', href: '#why-planning' },
                { label: 'Completed Villa Showcase', href: '#projects' },
                { label: 'Homebuilder FAQs', href: '#faq' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm font-medium transition-colors hover:underline" style={{ color: textSecondary }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest" style={{ color: textPrimary }}>Stay Informed</h4>
            <p className="text-xs" style={{ color: textSecondary }}>
              Monthly updates on Bangalore & South India steel, cement, and material pricing.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full h-9 px-3 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#0F766E]/40 transition-all"
                style={{ backgroundColor: surface, borderColor: border, color: textPrimary }}
              />
              <button className="bg-[#0F766E] hover:bg-[#0D6560] text-white rounded-xl px-3 shrink-0 transition-colors cursor-pointer">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 pt-1">
              {[
                { icon: <MapPin className="w-3.5 h-3.5" />, text: 'Indiranagar & Whitefield, Bangalore' },
                { icon: <Phone className="w-3.5 h-3.5" />, text: '+91 (080) 4590-2200' },
                { icon: <Mail className="w-3.5 h-3.5" />, text: 'support@rightcon.in' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs" style={{ color: textSecondary }}>
                  <span style={{ color: brandColor }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ borderColor: border }}>
          <div style={{ color: textSecondary }}>
            &copy; {new Date().getFullYear()} Cost Calculator by Rightcon Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-6" style={{ color: textSecondary }}>
            {['Privacy Policy', 'Terms of Service', 'IS 456 Structural Disclaimer'].map(link => (
              <a key={link} href="#" className="hover:underline transition-colors font-medium" style={{ color: textSecondary }}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
