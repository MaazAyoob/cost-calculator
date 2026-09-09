import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUIStore } from '../../store/useUIStore';
import { useDashboardStore } from '../../store/useDashboardStore';
import { DashboardTab } from '../../types';
import {
  LayoutDashboard,
  Compass,
  Palette,
  FileSpreadsheet,
  PieChart,
  CreditCard,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { HuttyLogo } from '../brand/HuttyLogo';

interface NavMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  tab?: DashboardTab;
}

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, isSidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const { activeTab, setActiveTab } = useDashboardStore();
  const location = useLocation();

  const mainNavItems: NavMenuItem[] = [
    { id: 'landing', label: 'Platform Home', icon: <Home className="w-4 h-4" />, path: '/' },
    { id: 'planner', label: 'Planning Calculator', icon: <Compass className="w-4 h-4" />, path: '/calculator' },
    { id: 'dashboard', label: 'Project Summary', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard', tab: 'overview' },
    { id: 'materials', label: 'Specifications', icon: <Palette className="w-4 h-4" />, path: '/dashboard', tab: 'materials' },
    { id: 'boq', label: 'Itemized BOQ', icon: <FileSpreadsheet className="w-4 h-4" />, path: '/dashboard', tab: 'boq' },
    { id: 'budget', label: 'Cost Breakdown', icon: <PieChart className="w-4 h-4" />, path: '/dashboard', tab: 'budget' },
    { id: 'payment', label: 'Milestone Roadmap', icon: <CreditCard className="w-4 h-4" />, path: '/dashboard', tab: 'payment' },
    { id: 'report', label: 'Construction Report', icon: <FileCheck2 className="w-4 h-4" />, path: '/report' },
  ];

  const handleNavClick = (item: NavMenuItem) => {
    if (item.tab && location.pathname === '/dashboard') {
      setActiveTab(item.tab);
    }
  };

  return (
    <aside
      className={cn(
        'fixed top-16 bottom-0 left-0 z-20 bg-white border-r border-[#E5E7EB] transition-all duration-300 flex flex-col select-none',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        isSidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Upper Navigation Section */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!isSidebarCollapsed && (
            <h3 className="px-3 text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mb-2">
              Workspace
            </h3>
          )}
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const isDashboardTabMatch =
                location.pathname === '/dashboard' && item.tab && activeTab === item.tab;
              const isPathMatch = location.pathname === item.path && !item.tab;
              const isActive = isDashboardTabMatch || isPathMatch;

              return (
                <NavLink
                  key={item.id}
                  to={item.tab ? `/dashboard` : item.path}
                  onClick={() => handleNavClick(item)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group relative',
                    isActive
                      ? 'bg-[rgba(27,61,52,0.08)] text-[#1B3D34] font-bold border border-[#1B3D34]/30'
                      : 'text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)]'
                  )}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <span className={cn('transition-colors', isActive ? 'text-[#1B3D34]' : 'text-[#4B5563] group-hover:text-[#1B3D34]')}>
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-[#E5E7EB] flex items-center justify-between">
        {!isSidebarCollapsed && (
          <HuttyLogo variant="compact" width={80} />
        )}
        <button
          onClick={toggleSidebarCollapse}
          className="p-2 rounded-lg text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] transition-colors ml-auto cursor-pointer"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
