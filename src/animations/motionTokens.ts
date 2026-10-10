/**
 * HUTTY ARCHITECTURAL MOTION SYSTEM — CORE TOKENS
 *
 * Natural, restrained, and purposeful motion tokens.
 * Follows Apple & Google interaction design principles:
 * - Immediate feedback without lag
 * - Opacity & small transforms (4-8px)
 * - Zero decorative bounciness or elastic wobble
 * - Strictly respects prefers-reduced-motion
 */

export const MOTION_DURATIONS = {
  /** Fast micro-interactions & feedback: 120–180ms */
  fast: 0.15,
  /** Standard controls & toggles: 150–220ms */
  control: 0.18,
  /** Panels, dropdowns & disclosures: 180–260ms */
  panel: 0.22,
  /** Cards & modal dialogs: 200–300ms */
  dialog: 0.25,
  /** Page & calculator step transitions: 220–350ms */
  page: 0.28,
} as const;

export const MOTION_EASINGS = {
  /** Natural architectural deceleration (Apple style) */
  natural: [0.16, 1, 0.3, 1] as const,
  /** Standard smooth easing for symmetric controls */
  smooth: [0.25, 0.1, 0.25, 1] as const,
  /** Quick exit easing */
  exit: [0.4, 0, 1, 1] as const,
  /** Clean ease out */
  easeOut: 'easeOut' as const,
};

export const MOTION_TRANSITIONS = {
  fast: {
    duration: MOTION_DURATIONS.fast,
    ease: MOTION_EASINGS.natural,
  },
  control: {
    duration: MOTION_DURATIONS.control,
    ease: MOTION_EASINGS.natural,
  },
  panel: {
    duration: MOTION_DURATIONS.panel,
    ease: MOTION_EASINGS.natural,
  },
  dialog: {
    duration: MOTION_DURATIONS.dialog,
    ease: MOTION_EASINGS.natural,
  },
  page: {
    duration: MOTION_DURATIONS.page,
    ease: MOTION_EASINGS.natural,
  },
} as const;

/**
 * Checks if the user prefers reduced motion in browser environments.
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
