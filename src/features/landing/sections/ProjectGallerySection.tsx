import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Building2, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const ProjectGallerySection: React.FC = () => {
  const navigate = useNavigate();

  const projects = [
    {
      title: 'The Whitefield Sanctuary',
      location: 'Whitefield, Bangalore',
      plot: '30 × 40 Plot',
      area: '2,400 sq.ft Built-up',
      floors: 'G+2 Duplex Villa',
      cost: '₹68.4L Total Build Cost',
      tier: 'Premium Tier',
      status: 'Completed',
    },
    {
      title: 'Indiranagar Urban Residence',
      location: 'Indiranagar 100ft Road, Bangalore',
      plot: '40 × 60 Plot',
      area: '4,200 sq.ft Built-up',
      floors: 'G+3 Modern Residence',
      cost: '₹1.20 Cr Total Build Cost',
      tier: 'Luxury Tier',
      status: 'Completed',
    },
    {
      title: 'HSR Skylight Duplex',
      location: 'HSR Layout Sector 3, Bangalore',
      plot: '30 × 50 Plot',
      area: '3,050 sq.ft Built-up',
      floors: 'G+2 Family Villa',
      cost: '₹89.7L Total Build Cost',
      tier: 'Premium Tier',
      status: 'Completed',
    },
    {
      title: 'Hebbal Lakeview Manor',
      location: 'Hebbal Near Manyata, Bangalore',
      plot: '50 × 80 Plot',
      area: '6,400 sq.ft Built-up',
      floors: 'G+3 Architectural Build',
      cost: '₹2.30 Cr Total Build Cost',
      tier: 'Luxury Tier',
      status: 'In Progress',
    },
  ];

  return (
    <section id="projects" className="bg-[var(--cc-bg)] py-20 border-b border-[var(--cc-border)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4 max-w-2xl text-left">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" /> Project Portfolio
            </span>
            <h2 className="heading-xl tracking-tight text-[var(--cc-text-primary)]">
              Engineered Homes Built with Cost Calculator.
            </h2>
            <p className="text-[var(--cc-text-secondary)] text-base leading-relaxed font-medium">
              Explore completed and ongoing homes across Bangalore engineered with our 13-stage BOQ matrix.
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => navigate('/calculator')}
            rightIcon={<ArrowRight className="w-4 h-4 text-white" />}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shrink-0 cursor-pointer shadow-soft-md"
          >
            Estimate Your Project
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-7 rounded-3xl bg-[var(--cc-surface)] border border-[var(--cc-border)] shadow-soft-sm hover:shadow-soft-md transition-all space-y-5 text-left group"
            >
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                  proj.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {proj.status}
                </span>
                <span className="text-xs font-bold text-[var(--cc-text-secondary)] bg-slate-100 px-3 py-1 rounded-full border border-[var(--cc-border)]">
                  {proj.tier}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[var(--cc-text-primary)] group-hover:text-blue-600 transition-colors">
                  {proj.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[var(--cc-text-secondary)] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{proj.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-[var(--cc-border)]">
                  <span className="text-[10px] text-[var(--cc-text-secondary)] block font-medium uppercase">Plot & Built-up</span>
                  <span className="text-xs font-bold text-[var(--cc-text-primary)]">{proj.plot} &bull; {proj.area}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-[var(--cc-border)]">
                  <span className="text-[10px] text-[var(--cc-text-secondary)] block font-medium uppercase">Structure & Cost</span>
                  <span className="text-xs font-bold text-blue-600">{proj.floors} &bull; {proj.cost}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
