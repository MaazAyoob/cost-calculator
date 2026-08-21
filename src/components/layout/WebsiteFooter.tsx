import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useWizardStore } from '../../store/useWizardStore';
import { HuttyLogo } from '../brand/HuttyLogo';

export const WebsiteFooter: React.FC = () => {
  const navigate = useNavigate();

  const handleStartEstimate = () => {
    useWizardStore.getState().startNewProject();
    navigate('/calculator');
  };

  return (
    <footer className="bg-[#1B3D34] text-white border-t border-white/10 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div
              onClick={() => navigate('/')}
              className="cursor-pointer inline-block"
              role="link"
              aria-label="Hutty — Home"
            >
              {/* Official logo on dark bg: clean white pill preserves artwork without distortion */}
              <div className="inline-block bg-white rounded-xl px-3 py-2">
                <HuttyLogo variant="full" width={140} />
              </div>
            </div>
            <p className="text-sm text-white/70 max-w-sm font-normal leading-relaxed">
              Build your home with clarity. Formula-driven architectural planning, physical quantities, and bank-ready construction cost estimates.
            </p>
              <span className="text-xs text-white/40">Bangalore, India</span>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/90 font-heading">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <button
                  onClick={handleStartEstimate}
                  className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1"
                >
                  Calculator Workspace <ArrowUpRight className="w-3 h-3 text-[#F28C28]" />
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate('/report')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Construction Report
                </button>
              </li>
              <li>
                <a href="#standards" className="hover:text-white transition-colors">
                  Engineering Standards
                </a>
              </li>
              <li>
                <a href="#packages" className="hover:text-white transition-colors">
                  Material Packages
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/90 font-heading">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <a href="#why-planning" className="hover:text-white transition-colors">
                  Why Hutty
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-white transition-colors">
                  Project Gallery
                </a>
              </li>

              <li>
                <a
                  href="https://wa.me/919900000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Contact Engineers <ArrowUpRight className="w-3 h-3 text-white/40" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/90 font-heading">
              Engineering
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <span className="text-white/60">IS 456:2000 Plain & RCC</span>
              </li>
              <li>
                <span className="text-white/60">IS 1786 High Strength Deformed Steel</span>
              </li>
              <li>
                <span className="text-white/60">NBC 2016 Structural Safety</span>
              </li>
              <li>
                <span className="text-white/60">BBMP / BDA Zoning Bylaws</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Hutty. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Formula-Driven Estimation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
