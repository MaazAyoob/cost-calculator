import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useUIStore } from '../../store/useUIStore';
import { Home, Compass, LayoutDashboard, Palette, Sliders } from 'lucide-react';
import { cn } from '../../utils/cn';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { setActiveTab } = useDashboardStore();
  const { openBottomSheet } = useUIStore();

  const items = [
    { label: 'Home', icon: <Home className="w-5 h-5" />, path: '/' },
    { label: 'Planner', icon: <Compass className="w-5 h-5" />, path: '/planner' },
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard', action: () => setActiveTab('overview') },
    { label: 'Palette', icon: <Palette className="w-5 h-5" />, path: '/dashboard', action: () => setActiveTab('materials') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 h-16 bg-white border-t border-slate-200/80 flex items-center justify-around px-2 lg:hidden shadow-soft-lg">
      {items.map((item, idx) => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={idx}
            to={item.path}
            onClick={item.action}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-colors',
              isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </NavLink>
        );
      })}

      <button
        onClick={() => openBottomSheet('quick_actions')}
        className="flex flex-col items-center justify-center w-full h-full text-[10px] font-medium text-slate-500 hover:text-slate-900"
      >
        <Sliders className="w-5 h-5" />
        <span className="mt-1">More</span>
      </button>
    </nav>
  );
};
