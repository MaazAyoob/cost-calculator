import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { Button } from '../../components/ui/Button';
import { Building2, Home, ArrowLeft, Calculator } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={pageFadeVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 space-y-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
        <Building2 className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">404</span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Page Not Found</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          This page does not exist or has been relocated.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/')} leftIcon={<Home className="w-4 h-4" />}>
          Return Home
        </Button>
        <Button size="sm" onClick={() => navigate('/calculator')} leftIcon={<Calculator className="w-4 h-4" />}>
          Go to Calculator
        </Button>
      </div>
    </motion.div>
  );
};
