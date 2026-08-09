import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProjectGallerySection: React.FC = () => {
  const navigate = useNavigate();

  const projects = [
    {
      name: 'WHITEFIELD',
      type: 'Modern Duplex Villa',
      area: '3,800 sq.ft',
      cost: '₹88.5L',
    },
    {
      name: 'INDIRANAGAR',
      type: 'Urban Residence',
      area: '4,200 sq.ft',
      cost: '₹1.20 Cr',
    },
    {
      name: 'HSR LAYOUT',
      type: 'Skylight Family Home',
      area: '3,050 sq.ft',
      cost: '₹89.7L',
    },
    {
      name: 'HEBBAL',
      type: 'Architectural Manor',
      area: '6,400 sq.ft',
      cost: '₹2.30 Cr',
    },
  ];

  return (
    <section id="projects" className="py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Architectural Portfolio
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Homes Planned with Cost Calculator.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              Real residential projects engineered with line-item precision before construction.
            </p>
          </div>

          <button
            onClick={() => navigate('/calculator')}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 text-sm font-semibold px-5 py-3 rounded-xl transition-all shrink-0 cursor-pointer"
          >
            Start Your Project <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Portfolio Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((proj) => (
            <div key={proj.name} className="bg-white rounded-2xl p-8 border border-slate-200 space-y-4 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-600 tracking-wider">
                  {proj.name}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {proj.area}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">
                  {proj.type}
                </h3>
                <p className="text-sm font-semibold text-slate-700">
                  Total Estimated Cost: {proj.cost}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
