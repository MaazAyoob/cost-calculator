import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { WebsiteHeader } from './WebsiteHeader';
import { WebsiteFooter } from './WebsiteFooter';
import { ToastContainer } from '../ui/Toast';
import { rateService } from '../../calculation-engine/data/rateService';

export const AppLayout: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Sync active rate overrides and configuration from backend on initial mount
    rateService.syncWithServer();

    // Re-sync whenever the window regains focus (e.g. after changing price in an Admin tab)
    const handleFocus = () => {
      rateService.syncWithServer();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const isCalculatorRoute = location.pathname === '/calculator' || location.pathname === '/planner';

  // Calculator wizard manages its own minimalist top bar & sticky bottom bar
  if (isCalculatorRoute) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-sans antialiased text-[#172033]">
        <main className="flex-1 w-full min-w-0">
          <Outlet />
        </main>
        <ToastContainer />
      </div>
    );
  }

  // All other pages (Landing, Dashboard, Report, etc.) share the clean architectural header & footer
  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-sans antialiased text-[#172033]">
      <WebsiteHeader />
      <main className="flex-1 w-full min-w-0">
        <Outlet />
      </main>
      <WebsiteFooter />
      <ToastContainer />
    </div>
  );
};
