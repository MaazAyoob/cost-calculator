import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore, ToastType } from '../../store/useToastStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-[#1B3D34]" />,
  error: <AlertCircle className="w-4 h-4 text-red-600" />,
  warning: <AlertTriangle className="w-4 h-4 text-[#F28C28]" />,
  info: <Info className="w-4 h-4 text-[#1B3D34]" />,
};

const bgMap: Record<ToastType, string> = {
  success: 'bg-white border-[#1B3D34]/30 text-[#1B3D34]',
  error: 'bg-white border-red-200 text-red-950',
  warning: 'bg-white border-[#F28C28]/40 text-[#1B3D34]',
  info: 'bg-white border-[#1B3D34]/30 text-[#1B3D34]',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0 select-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={cn(
              'pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start gap-3 text-xs',
              bgMap[toast.type]
            )}
          >
            <div className="shrink-0 mt-0.5">{iconMap[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold leading-tight font-heading">{toast.title}</div>
              {toast.message && <div className="text-[11px] text-[#4B5563] mt-0.5 leading-snug">{toast.message}</div>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-md text-[#4B5563] hover:text-[#1B3D34] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
