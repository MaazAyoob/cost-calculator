import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageFadeVariant } from '../../animations/variants';
import { Home, Calculator, Compass, ArrowRight } from 'lucide-react';
import { HuttyLogo } from '../../components/brand/HuttyLogo';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={pageFadeVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 select-none bg-[#F8F8F6]"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E5E7EB] shadow-soft-lg p-8 sm:p-12 space-y-6">
        <div className="flex justify-center">
          <HuttyLogo variant="compact" width={120} />
        </div>

        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-[#E8EFE9] rotate-6 border border-[#CBD5CB]/50" />
          <div className="relative w-full h-full rounded-3xl bg-white border border-[#CBD5CB] flex flex-col items-center justify-center shadow-soft-sm">
            <Compass className="w-10 h-10 text-[#245747]" />
            <span className="text-[10px] font-bold tracking-widest text-[#C66B4E] uppercase mt-1">404</span>
          </div>
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#C66B4E] bg-[#C66B4E]/10 px-3 py-1 rounded-full">
            Blueprint Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#183B32] tracking-tight">
            This Page Doesn't Exist
          </h1>
          <p className="text-sm text-[#4B5563] leading-relaxed">
            The page you're looking for might have been moved or renamed. But your dream home project is just a click away.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#CBD5CB] text-[#183B32] hover:bg-[#E8EFE9] font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-[#245747]" />
            <span>Return to Home</span>
          </button>
          <button
            onClick={() => navigate('/calculator')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#183B32] hover:bg-[#245747] text-white font-semibold text-sm shadow-soft-md hover:shadow-soft-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Calculator className="w-4 h-4 text-[#C5A46D]" />
            <span>Open Cost Calculator</span>
            <ArrowRight className="w-4 h-4 opacity-70" />
          </button>
        </div>

        <div className="pt-4 border-t border-[#E5E7EB]/80 text-xs text-[#6B7280]">
          Looking for expert consultation or pricing?{' '}
          <button
            onClick={() => navigate('/consultation')}
            className="text-[#245747] hover:underline font-semibold"
          >
            Speak with an architect
          </button>{' '}
          or{' '}
          <button
            onClick={() => navigate('/pricing')}
            className="text-[#245747] hover:underline font-semibold"
          >
            view report plans
          </button>
          .
        </div>
      </div>
    </motion.div>
  );
};
