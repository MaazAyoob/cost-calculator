import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopNavigation } from './TopNavigation';
import { WebsiteHeader } from './WebsiteHeader';
import { WebsiteFooter } from './WebsiteFooter';
import { Sidebar } from './Sidebar';
import { DetailDrawer } from './DetailDrawer';
import { BottomNavigation } from './BottomNavigation';
import { BottomSheet } from '../bottom-sheet/BottomSheet';
import { ToastContainer } from '../ui/Toast';
import { useUIStore } from '../../store/useUIStore';
import { cn } from '../../utils/cn';

export const AppLayout: React.FC = () => {
  const { isSidebarCollapsed } = useUIStore();
  const location = useLocation();

  const isLandingRoute = location.pathname === '/';
  const isCalculatorRoute = location.pathname === '/calculator' || location.pathname === '/planner';

  // Landing website gets full-screen custom landing layout
  if (isLandingRoute) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans antialiased text-slate-100 selection:bg-blue-600 selection:text-white">
        <WebsiteHeader />
        <main className="flex-1 w-full min-w-0">
          <Outlet />
        </main>
        <WebsiteFooter />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans antialiased text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Header — only render TopNavigation for internal app routes, calculator wizard manages its own minimalist header */}
      {!isCalculatorRoute && <TopNavigation />}

      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Sidebar — hidden on calculator wizard routes */}
        {!isCalculatorRoute && <Sidebar />}

        {/* Main Workspace */}
        <main
          className={cn(
            'flex-1 transition-all duration-300 min-w-0 pb-20 lg:pb-10',
            isCalculatorRoute
              ? 'lg:ml-0 pt-0 px-0 sm:px-4' // full width flush for calculator
              : isSidebarCollapsed
              ? 'lg:ml-16 pt-6 px-4 lg:px-8'
              : 'lg:ml-64 pt-6 px-4 lg:px-8'
          )}
        >
          <div className={cn('mx-auto', isCalculatorRoute ? 'max-w-[1440px]' : 'max-w-7xl')}>
            <Outlet />
          </div>
        </main>

        {/* Right Detail Drawer — only on app dashboard routes */}
        {!isCalculatorRoute && <DetailDrawer />}
      </div>

      {/* Mobile Bottom Navigation — hidden on landing */}
      <BottomNavigation />

      {/* Mobile Bottom Sheet Drawer */}
      <BottomSheet />

      {/* Global Toast Stack */}
      <ToastContainer />
    </div>
  );
};
