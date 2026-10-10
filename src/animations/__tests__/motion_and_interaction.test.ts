import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MOTION_DURATIONS,
  MOTION_EASINGS,
  MOTION_TRANSITIONS,
  prefersReducedMotion,
} from '../motionTokens';
import {
  pageFadeVariant,
  modalScaleVariant,
  backdropFadeVariant,
  accordionVariant,
  bottomSheetVariant,
  drawerSlideVariant,
  itemFadeUpVariant,
} from '../variants';

describe('Hutty Motion System & Interaction Tokens', () => {
  describe('MOTION_DURATIONS', () => {
    it('adheres to architectural timing constraints', () => {
      // Fast feedback: 120–180ms
      expect(MOTION_DURATIONS.fast).toBeGreaterThanOrEqual(0.12);
      expect(MOTION_DURATIONS.fast).toBeLessThanOrEqual(0.18);

      // Standard controls: 150–220ms
      expect(MOTION_DURATIONS.control).toBeGreaterThanOrEqual(0.15);
      expect(MOTION_DURATIONS.control).toBeLessThanOrEqual(0.22);

      // Panels and dropdowns: 180–260ms
      expect(MOTION_DURATIONS.panel).toBeGreaterThanOrEqual(0.18);
      expect(MOTION_DURATIONS.panel).toBeLessThanOrEqual(0.26);

      // Cards and dialogs: 200–300ms
      expect(MOTION_DURATIONS.dialog).toBeGreaterThanOrEqual(0.20);
      expect(MOTION_DURATIONS.dialog).toBeLessThanOrEqual(0.30);

      // Page and calculator step transitions: 220–350ms
      expect(MOTION_DURATIONS.page).toBeGreaterThanOrEqual(0.22);
      expect(MOTION_DURATIONS.page).toBeLessThanOrEqual(0.35);
    });
  });

  describe('MOTION_EASINGS', () => {
    it('uses restrained, non-bouncy curves', () => {
      expect(MOTION_EASINGS.natural).toEqual([0.16, 1, 0.3, 1]);
      expect(MOTION_EASINGS.smooth).toEqual([0.25, 0.1, 0.25, 1]);
      expect(MOTION_EASINGS.exit).toEqual([0.4, 0, 1, 1]);
      expect(MOTION_EASINGS.easeOut).toBe('easeOut');
    });
  });

  describe('MOTION_TRANSITIONS', () => {
    it('maps durations and easings consistently', () => {
      expect(MOTION_TRANSITIONS.fast.duration).toBe(MOTION_DURATIONS.fast);
      expect(MOTION_TRANSITIONS.fast.ease).toEqual(MOTION_EASINGS.natural);

      expect(MOTION_TRANSITIONS.control.duration).toBe(MOTION_DURATIONS.control);
      expect(MOTION_TRANSITIONS.control.ease).toEqual(MOTION_EASINGS.natural);

      expect(MOTION_TRANSITIONS.panel.duration).toBe(MOTION_DURATIONS.panel);
      expect(MOTION_TRANSITIONS.panel.ease).toEqual(MOTION_EASINGS.natural);

      expect(MOTION_TRANSITIONS.dialog.duration).toBe(MOTION_DURATIONS.dialog);
      expect(MOTION_TRANSITIONS.dialog.ease).toEqual(MOTION_EASINGS.natural);

      expect(MOTION_TRANSITIONS.page.duration).toBe(MOTION_DURATIONS.page);
      expect(MOTION_TRANSITIONS.page.ease).toEqual(MOTION_EASINGS.natural);
    });
  });

  describe('prefersReducedMotion', () => {
    afterEach(() => {
      if ((global as any).window) {
        delete (global as any).window;
      }
    });

    it('returns false in server/node environments where window is undefined', () => {
      expect(prefersReducedMotion()).toBe(false);
    });

    it('returns true when reduced-motion is requested in browser environment', () => {
      (global as any).window = {
        matchMedia: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
        })),
      };

      expect(prefersReducedMotion()).toBe(true);
    });

    it('returns false when standard motion is enabled in browser environment', () => {
      (global as any).window = {
        matchMedia: vi.fn().mockImplementation(() => ({
          matches: false,
        })),
      };

      expect(prefersReducedMotion()).toBe(false);
    });
  });

  describe('Animation Variants Precision', () => {
    it('pageFadeVariant provides restrained 6px vertical displacement without layout shifts', () => {
      expect(pageFadeVariant.initial).toEqual({ opacity: 0, y: 6 });
      expect(pageFadeVariant.animate).toEqual({
        opacity: 1,
        y: 0,
        transition: {
          duration: MOTION_DURATIONS.page,
          ease: MOTION_EASINGS.natural,
        },
      });
      expect(pageFadeVariant.exit).toEqual({
        opacity: 0,
        y: -6,
        transition: {
          duration: MOTION_DURATIONS.fast,
          ease: MOTION_EASINGS.exit,
        },
      });
    });

    it('modalScaleVariant uses subtle 0.98 scale without elastic bounce', () => {
      expect(modalScaleVariant.initial).toEqual({ opacity: 0, scale: 0.98, y: 6 });
      expect(modalScaleVariant.animate).toEqual({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: MOTION_DURATIONS.dialog,
          ease: MOTION_EASINGS.natural,
        },
      });
      expect(modalScaleVariant.exit).toEqual({
        opacity: 0,
        scale: 0.98,
        y: 6,
        transition: {
          duration: MOTION_DURATIONS.fast,
          ease: MOTION_EASINGS.exit,
        },
      });
    });

    it('backdropFadeVariant provides clean opacity transitions', () => {
      expect(backdropFadeVariant.initial).toEqual({ opacity: 0 });
      expect(backdropFadeVariant.animate).toEqual({
        opacity: 1,
        transition: {
          duration: MOTION_DURATIONS.fast,
          ease: MOTION_EASINGS.natural,
        },
      });
      expect(backdropFadeVariant.exit).toEqual({
        opacity: 0,
        transition: {
          duration: MOTION_DURATIONS.fast,
          ease: MOTION_EASINGS.exit,
        },
      });
    });

    it('accordionVariant uses height auto and restrained panel timing', () => {
      expect(accordionVariant.initial).toEqual({ height: 0, opacity: 0 });
      expect(accordionVariant.animate).toEqual({
        height: 'auto',
        opacity: 1,
        transition: {
          duration: MOTION_DURATIONS.panel,
          ease: MOTION_EASINGS.natural,
        },
      });
      expect(accordionVariant.exit).toEqual({
        height: 0,
        opacity: 0,
        transition: {
          duration: MOTION_DURATIONS.fast,
          ease: MOTION_EASINGS.exit,
        },
      });
    });

    it('itemFadeUpVariant maintains subtle 8px micro-interaction offset', () => {
      expect(itemFadeUpVariant.hidden).toEqual({ opacity: 0, y: 8 });
      expect(itemFadeUpVariant.show).toEqual({
        opacity: 1,
        y: 0,
        transition: {
          duration: MOTION_DURATIONS.dialog,
          ease: MOTION_EASINGS.natural,
        },
      });
    });
  });

  describe('Slider Range Progress Calculation Semantics', () => {
    const calculateProgressPercentage = (min: number, max: number, value: number): number => {
      const range = max - min;
      return range > 0 ? Math.min(100, Math.max(0, ((value - min) / range) * 100)) : 0;
    };

    it('accurately computes 50% for midpoint values', () => {
      expect(calculateProgressPercentage(1000, 5000, 3000)).toBe(50);
      expect(calculateProgressPercentage(20, 100, 60)).toBe(50);
    });

    it('accurately computes boundary minimum (0%) and maximum (100%)', () => {
      expect(calculateProgressPercentage(600, 3000, 600)).toBe(0);
      expect(calculateProgressPercentage(600, 3000, 3000)).toBe(100);
    });

    it('clamps values below min or above max gracefully', () => {
      expect(calculateProgressPercentage(0, 100, -25)).toBe(0);
      expect(calculateProgressPercentage(0, 100, 150)).toBe(100);
    });

    it('handles zero or inverted range safely', () => {
      expect(calculateProgressPercentage(50, 50, 50)).toBe(0);
      expect(calculateProgressPercentage(100, 50, 75)).toBe(0);
    });
  });
});
