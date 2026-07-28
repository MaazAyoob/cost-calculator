import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/useUIStore';
import { useProjectStore } from '../../store/useProjectStore';
import { Menu, Search, Bell, ChevronDown, Building2, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export const TopNavigation: React.FC = () => {
  const { toggleSidebar, isSidebarCollapsed, toggleSidebarCollapse, openModal } = useUIStore();
  const { project } = useProjectStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 shadow-soft-xs flex items-center justify-between px-4 lg:px-6">
      {/* Left section: Logo & Sidebar Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black tracking-wider shadow-soft-xs">
            C
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">COST CALCULATOR</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded border border-blue-200/60 uppercase">
                PRO MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Home Construction Planning Engine</p>
          </div>
        </div>

        {/* Project Quick Switcher — click to reconfigure project */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
          <button
            onClick={() => navigate('/planner')}
            title="Click to reconfigure your project"
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200/80 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 cursor-pointer transition-colors group"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">{project.name}</div>
              <div className="text-[10px] text-slate-400">{project.location.city} • {project.builtUpAreaSqFt} sq ft</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 group-hover:text-blue-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Middle section: Global Search */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search BOQ items, materials, specifications (Press ⌘K)..."
            className="w-full h-9 pl-9 pr-12 text-xs bg-slate-50 border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-200/60 rounded border border-slate-300">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right section: Quick actions, currency, profile */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>INR (₹)</span>
        </div>

        <button
          onClick={() => openModal('quick_settings')}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
          title="Notifications"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
        </button>

        <div className="pl-2 border-l border-slate-200 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold ring-2 ring-blue-500/20">
            RS
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-900">Rajesh Sharma</div>
            <div className="text-[10px] text-slate-400">Home Owner</div>
          </div>
        </div>
      </div>
    </header>
  );
};
