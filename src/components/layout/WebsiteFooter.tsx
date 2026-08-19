import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useWizardStore } from '../../store/useWizardStore';

export const WebsiteFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#172033] text-white pt-16 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Quiet Editorial Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 text-left">

          {/* Brand & Mission (md:col-span-5) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1F4B43] flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="leading-none">
                <span className="font-bold text-base tracking-tight text-white block">
                  Cost Calculator
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5 block">
                  by Rightcon
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Formula-driven Indian Standard pre-construction planning platform. Estimating civil quantities, brand rate variations, and milestone cashflows for residential builders in Bangalore and Mysore.
            </p>
          </div>

          {/* Product Links (md:col-span-3) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Product</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => {
                    useWizardStore.getState().startNewProject();
                    navigate('/calculator');
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Calculator
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#standards" className="hover:text-white transition-colors">
                  Engineering Standards
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate('/report')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Reports &amp; BOQ
                </button>
              </li>
            </ul>
          </div>

          {/* Company Links (md:col-span-2) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#why-planning" className="hover:text-white transition-colors">
                  Why Planning
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-white transition-colors">
                  Projects Gallery
                </a>
              </li>
              <li>
                <a href="mailto:contact@rightcon.in" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links (md:col-span-2) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Legal</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  Terms of Use
                </a>
              </li>
              <li>
                <span className="text-[11px] text-slate-500 block pt-1">IS 456 / IS 1786 Compliant</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Minimal Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-left">
          <p>&copy; {new Date().getFullYear()} Cost Calculator by Rightcon. All rights reserved.</p>
          <p className="text-[11px] text-slate-400">Indicative pre-construction estimates for residential planning.</p>
        </div>

      </div>
    </footer>
  );
};
