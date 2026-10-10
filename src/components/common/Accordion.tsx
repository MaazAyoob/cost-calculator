import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { accordionVariant } from '../../animations/variants';

export interface AccordionItemProps {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  title,
  subtitle,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const headerId = id ? `accordion-header-${id}` : undefined;
  const panelId = id ? `accordion-panel-${id}` : undefined;

  return (
    <div className="border border-[#E3E8E2] rounded-[14px] bg-white overflow-hidden shadow-2xs mb-3 transition-colors">
      <button
        type="button"
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-4.5 text-left hover:bg-[#F8F8F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34] transition-colors cursor-pointer"
      >
        <div className="pr-3">
          <h4 className="text-sm font-bold text-[#172722] font-heading">{title}</h4>
          {subtitle && <p className="text-xs text-[#687770] mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[#687770] transition-transform duration-200 shrink-0',
            isOpen && 'rotate-180 text-[#F28C28]'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            variants={accordionVariant}
            initial="initial"
            animate="animate"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-4.5 pt-0 border-t border-[#E3E8E2] text-xs text-[#687770] leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
