import { Variants } from 'framer-motion';
import {
  MOTION_DURATIONS,
  MOTION_EASINGS,
  MOTION_TRANSITIONS,
} from './motionTokens';

/**
 * Standard page / step entrance and exit
 * Subtle upward translation (6px) and natural architectural easing.
 */
export const pageFadeVariant: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.page,
      ease: MOTION_EASINGS.natural,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.exit,
    },
  },
};

/**
 * Clean modal backdrop fade
 */
export const backdropFadeVariant: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: MOTION_DURATIONS.fast, ease: MOTION_EASINGS.natural },
  },
  exit: {
    opacity: 0,
    transition: { duration: MOTION_DURATIONS.fast, ease: MOTION_EASINGS.exit },
  },
};

/**
 * Architectural modal scale & settle
 * Scale from 0.98, translateY from 6px, zero rubber-band bounce.
 */
export const modalScaleVariant: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 6 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.dialog,
      ease: MOTION_EASINGS.natural,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 6,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.exit,
    },
  },
  // Aliases for open/closed state models
  closed: { opacity: 0, scale: 0.98, y: 6 },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.dialog,
      ease: MOTION_EASINGS.natural,
    },
  },
};

/**
 * Slide-in drawer
 */
export const drawerSlideVariant: Variants = {
  closed: { x: '100%', opacity: 0 },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      duration: MOTION_DURATIONS.dialog,
      ease: MOTION_EASINGS.natural,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.exit,
    },
  },
};

/**
 * Mobile bottom sheet
 */
export const bottomSheetVariant: Variants = {
  closed: { y: '100%', opacity: 0 },
  open: {
    y: 0,
    opacity: 1,
    transition: {
      duration: MOTION_DURATIONS.dialog,
      ease: MOTION_EASINGS.natural,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.exit,
    },
  },
};

/**
 * Accordion / Expandable Disclosure
 */
export const accordionVariant: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: MOTION_DURATIONS.panel,
      ease: MOTION_EASINGS.natural,
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.exit,
    },
  },
};

/**
 * Subtle container stagger for lists/grids
 */
export const containerStaggerVariant: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

/**
 * Item reveal with small 8px upward translation
 */
export const itemFadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.dialog,
      ease: MOTION_EASINGS.natural,
    },
  },
};
