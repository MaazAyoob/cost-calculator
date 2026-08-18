import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { useWizardStore } from '../../store/useWizardStore';

export const WebsiteFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#172033] text-white pt-16 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">

          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1F4B43] flex items-center justify-center shadow-sm border border-white/10">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-white block">
                  Cost Calculator
                </span>
                <span className="text-xs font-medium text-slate-400">
                  by Rightcon
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed max-w-sm text-slate-400">
              Formula-driven Indian Standard residential construction planning and cost estimation platform.
              Helping Bangalore homeowners calculate structural requirements, material budgets, and construction milestones before ground break.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs font-medium text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#1F4B43]" /> IS 456 & IS 1786 Engineering Compliant
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2">
              {[
                { label: 'Start Free Estimate', action: () => { useWizardStore.getState().startNewProject(); navigate('/calculator'); } },
                { label: 'Project Dashboard', action: () => navigate('/dashboard') },
                { label: 'BOQ Report', action: () => navigate('/report') },
                { label: 'How It Works', href: '#how-it-works' },
              ].map(({ label, action, href }) => (
                <li key={label}>
                  {href ? (
                    <a href={href} className="text-xs font-medium text-slate-400 hover:text-white transition-colors">
                      {label}
                    </a>
                  ) : (
                    <button onClick={action} className="text-xs font-medium text-slate-400 hover:text-white transition-colors text-left cursor-pointer">
                      {label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Engineering */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white">Engineering</h4>
            <ul className="space-y-2">
              {[
                { label: 'IS 456 Concrete Standards', href: '#standards' },
                { label: 'IS 1786 TMT Steel', href: '#standards' },
                { label: 'Why Planning Matters', href: '#why-planning' },
                { label: 'Specification Tiers', href: '#packages' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-xs font-medium text-slate-400 hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white">Rightcon</h4>
            <div className="space-y-2 pt-1 text-xs text-slate-400">
              {[
                { icon: <MapPin className="w-3.5 h-3.5 shrink-0" />, text: 'Indiranagar & Whitefield, Bangalore' },
                { icon: <Mail className="w-3.5 h-3.5 shrink-0" />, text: 'contact@rightcon.in' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <span className="text-[#1F4B43]">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Cost Calculator by Rightcon. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'IS 456 Disclaimer'].map(link => (
              <a key={link} href="#" className="hover:text-white transition-colors font-medium">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

