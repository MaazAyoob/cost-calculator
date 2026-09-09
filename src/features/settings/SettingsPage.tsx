import React from 'react';
import { motion } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export const SettingsPage: React.FC = () => {
  return (
    <motion.div variants={pageFadeVariant} initial="initial" animate="animate" exit="exit" className="space-y-6 max-w-4xl mx-auto py-2">
      <PageHeader
        title="Settings & Workspace Preferences"
        subtitle="Manage default unit metrics, tax parameters, and notification preferences."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Settings' }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Platform Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <div>
              <span className="font-bold text-slate-900">Currency Symbol</span>
              <p className="text-slate-500">Default financial formatting currency</p>
            </div>
            <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">INR (₹)</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <div>
              <span className="font-bold text-slate-900">Unit System</span>
              <p className="text-slate-500">Imperial (Sq Ft, Feet) vs Metric (Sq Metres)</p>
            </div>
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">Imperial (Sq Ft)</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
