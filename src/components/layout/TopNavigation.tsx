import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/useUIStore';
import { useProjectStore } from '../../store/useProjectStore';
import { Menu, Search, ChevronDown, Building2 } from 'lucide-react';
import { HuttyLogo } from '../brand/HuttyLogo';

export const TopNavigation: React.FC = () => {
  const { toggleSidebar } = useUIStore();
  const { project } = useProjectStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E5E7EB] shadow-xs flex items-center justify-between px-4 lg:px-6 select-none">
      {/* Left section: Logo & Sidebar Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] lg:hidden cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div onClick={() => navigate('/')} className="cursor-pointer">
          <HuttyLogo variant="compact" width={100} />
        </div>

        {/* Project Quick Switcher */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#E5E7EB]">
          <button
            onClick={() => navigate('/calculator')}
            title="Click to reconfigure your project"
            className="flex items-center gap-2 px-3 py-1.5 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB] hover:border-[#1B3D34] cursor-pointer transition-colors group"
          >
            <Building2 className="w-4 h-4 text-[#1B3D34]" />
            <div className="text-left">
              <div className="text-xs font-bold text-[#1B3D34] leading-tight">{project.name || 'Current Residence'}</div>
              <div className="text-[10px] text-[#4B5563]">{project.location?.city || 'Bangalore'} • {project.builtUpAreaSqFt || 0} sq ft</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#4B5563] ml-1 group-hover:text-[#1B3D34] transition-colors" />
          </button>
        </div>
      </div>

      {/* Middle section: Global Search */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search specifications, materials, BOQ..."
            className="w-full h-9 pl-9 pr-4 text-xs bg-[#F8F8F6] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1B3D34] focus:bg-white transition-all text-[#1B3D34]"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#F8F8F6] rounded-lg text-xs font-semibold text-[#1B3D34] border border-[#E5E7EB]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1B3D34]" />
          <span>INR (₹)</span>
        </div>

        <button
          onClick={() => navigate('/calculator')}
          className="hutty-btn-primary text-xs font-bold px-3.5 py-1.5 rounded-lg"
        >
          Calculator
        </button>
      </div>
    </header>
  );
};
