import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './motionTokens';
import gsap from 'gsap';

export interface ScrollRevealOptions {
  /** Target translation in pixels (default: 12) */
  y?: number;
  /** Duration in seconds (default: 0.5) */
  duration?: number;
  /** Stagger delay across multiple child targets in seconds (default: 0.06) */
  stagger?: number;
  /** Delay before animation begins (default: 0) */
  delay?: number;
  /** Viewport trigger threshold 0-1 (default: 0.15) */
  threshold?: number;
}

/**
 * useArchitecturalReveal
 *
 * Provides a clean, GSAP-powered or CSS-based scroll reveal with:
 * - Strict automatic `prefers-reduced-motion` compliance
 * - Zero layout shift (opacity & subtle 4-12px transform)
 * - Clean teardown and instance cleanup on unmount
 * - Safe server-side and unit-test execution
 */
export function useArchitecturalReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Strict reduced motion check — show instantly with zero translation
    if (prefersReducedMotion()) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    // Set initial clean hidden state
    const yOffset = options.y ?? 10;
    const duration = options.duration ?? 0.45;
    const stagger = options.stagger ?? 0.05;
    const delay = options.delay ?? 0;

    // Use GSAP context for automated unmount cleanup
    const ctx = gsap.context(() => {
      const targets = el.children.length > 0 ? Array.from(el.children) : [el];

      gsap.fromTo(
        targets,
        {
          opacity: 0,
          y: yOffset,
        },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          delay,
          ease: 'power2.out',
          clearProps: 'transform',
        }
      );
    }, el);

    return () => {
      ctx.revert(); // Complete cleanup on unmount
    };
  }, [options.y, options.duration, options.stagger, options.delay]);

  return containerRef;
}

