import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { Home, Calculator } from 'lucide-react';
import { HuttyLogo } from '../../components/common/HuttyLogo';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={pageFadeVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 space-y-6 select-none"
    >
      <HuttyLogo variant="compact" width={130} />

      <div className="space-y-2 max-w-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28]">404 ERROR</span>
        <h1 className="heading-sm text-3xl font-extrabold text-[#1B3D34] tracking-tight">Page Not Found</h1>
        <p className="text-sm text-[#4B5563] leading-relaxed">
          The requested page does not exist or has been relocated.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => navigate('/')}
          className="hutty-btn-secondary px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </button>
        <button
          onClick={() => navigate('/calculator')}
          className="hutty-btn-primary px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2"
        >
          <Calculator className="w-4 h-4 text-[#F28C28]" />
          <span>Start Calculator</span>
        </button>
      </div>
    </motion.div>
  );
};
