import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Building2, Layers, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const ProjectGallerySection: React.FC = () => {
  const navigate = useNavigate();

  const projects = [
    {
      title: 'The Whitefield Sanctuary',
      location: 'Whitefield, Bangalore',
      plot: '30 Ã— 40 Plot',
      area: '2₹400 sq.ft Built-up',
      floors: 'G+2 Duplex Villa',
      cost: '₹68.4L Total Build Cost',
      tier: 'Premium Tier',
      status: 'Completed',
    },
    {
      title: 'Indiranagar Urban Residence',
      location: 'Indiranagar 100ft Road, Bangalore',
      plot: '40 Ã— 60 Plot',
      area: '4₹200 sq.ft Built-up',
      floors: 'G+3 Modern Residence',
      cost: '₹1.20 Cr Total Build Cost',
      tier: 'Luxury Tier',
      status: 'Completed',
    },
    {
      title: 'HSR Skylight Duplex',
      location: 'HSR Layout Sector 3, Bangalore',
      plot: '30 Ã— 50 Plot',
      area: '3₹50 sq.ft Built-up',
      floors: 'G+2 Family Villa',
      cost: '₹89.7L Total Build Cost',
      tier: 'Premium Tier',
      status: 'Completed',
    },
    {
      title: 'Hebbal Lakeview Manor',
      location: 'Hebbal Near Manyata, Bangalore',
      plot: '50 Ã— 80 Plot',
      area: '6₹400 sq.ft Built-up',
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
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--cc-brand)]/10 border border-[var(--cc-brand)]/30 text-[var(--cc-brand)] text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" /> Project Portfolio
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[var(--cc-text-primary)] tracking-tight">
              Engineered Homes Built with Cost Calculator.
            </h2>
            <p className="text-[var(--cc-text-secondary)] text-base leading-relaxed">
              Explore completed and ongoing homes across Bangalore engineered with our 13-stage BOQ matrix.
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => navigate('/calculator')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="bg-[var(--cc-brand)] hover:bg-[var(--cc-brand)] text-white font-bold text-xs shrink-0"
          >
            Estimate Your Project
          </Button>
        </div>

        {/* Masonry / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-7 rounded-3xl bg-[var(--cc-surface)]/60 border border-[var(--cc-border)]/80 hover:border-[var(--cc-border)] transition-all space-y-5 text-left group"
            >
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                  proj.status === 'Completed' ? 'bg-emerald-500/10 text-[var(--cc-brand)] border border-emerald-500/30'
                    : 'bg-[var(--cc-brand)]/10 text-[var(--cc-brand)] border border-[var(--cc-brand)]/30'
                }`}>
                  {proj.status}
                </span>
                <span className="text-xs font-bold text-[var(--cc-text-secondary)] bg-[var(--cc-surface-muted)] px-3 py-1 rounded-full border border-[var(--cc-border)]">
                  {proj.tier}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[var(--cc-text-primary)] group-hover:text-[var(--cc-brand)] transition-colors">
                  {proj.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[var(--cc-text-secondary)] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--cc-brand)]" />
                  <span>{proj.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[var(--cc-bg)] border border-[var(--cc-border)]">
                  <span className="text-[10px] text-[var(--cc-text-secondary)] block font-medium">Plot & Built-up</span>
                  <span className="text-xs font-bold text-[var(--cc-text-primary)]">{proj.plot} • {proj.area}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--cc-bg)] border border-[var(--cc-border)]">
                  <span className="text-[10px] text-[var(--cc-text-secondary)] block font-medium">Structure & Cost</span>
                  <span className="text-xs font-bold text-[var(--cc-brand)]">{proj.floors} • {proj.cost}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

