import React from 'react';

/**
 * HuttyLogo — Official brand asset component.
 *
 * Uses the supplied /hutty-logo.png asset directly.
 * DO NOT recreate the logo in SVG or alter the artwork.
 *
 * Variants:
 *   "full"    — Full logo (default): wordmark + tagline at standard width (140px desktop / 120px mobile)
 *   "compact" — Shorter width, no tagline visible at small sizes (100px)
 *   "icon"    — Tight crop showing only the roof/house mark (~40px square)
 *
 * For the dark footer (#1B3D34 bg), set inverted=true.
 * This applies mix-blend-mode: screen which makes the white background
 * transparent on dark surfaces without altering the logo artwork.
 */

interface HuttyLogoProps {
  /** Layout variant. Defaults to "full". */
  variant?: 'full' | 'compact' | 'icon';
  /**
   * Set true when rendering on dark backgrounds (e.g. the #1B3D34 footer).
   * Applies CSS mix-blend-mode: screen to make the white background invisible.
   */
  inverted?: boolean;
  className?: string;
  /** Override width in pixels. Defaults per variant: full=148, compact=108, icon=44 */
  width?: number;
}

export const HuttyLogo: React.FC<HuttyLogoProps> = ({
  variant = 'full',
  inverted = false,
  className = '',
  width,
}) => {
  const defaultWidths: Record<NonNullable<HuttyLogoProps['variant']>, number> = {
    full: 148,
    compact: 108,
    icon: 44,
  };

  const w = width ?? defaultWidths[variant];

  // The source image is 1456 × 816 px (approx 16:9 aspect ratio).
  // For the icon variant we show only the top-right roof mark portion.
  // We do this via a wrapper div with overflow:hidden + object positioning.

  if (variant === 'icon') {
    // Crop to the house/roof mark (top-right quadrant of the image).
    // The mark sits roughly at x: 55%–80%, y: 5%–40% of the full image.
    // We render a larger image and clip it.
    const rendered = w * 2.5; // rendered image width
    const aspect = 816 / 1456; // height/width ratio of source
    const renderedH = rendered * aspect;

    return (
      <div
        className={`inline-block overflow-hidden shrink-0 ${className}`}
        style={{ width: w, height: w }}
        aria-label="Hutty logo mark"
        role="img"
      >
        <img
          src="/hutty-logo.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            width: rendered,
            height: renderedH,
            // Shift to show the roof mark portion
            marginLeft: -(rendered * 0.50),
            marginTop: -(renderedH * 0.00),
            maxWidth: 'none',
            display: 'block',
            mixBlendMode: inverted ? 'screen' : undefined,
          }}
        />
      </div>
    );
  }

  // Full / Compact — render the whole logo image at target width
  const aspect = 816 / 1456;
  const h = Math.round(w * aspect);

  return (
    <img
      src="/hutty-logo.png"
      alt="Hutty — Build your home with clarity."
      draggable={false}
      width={w}
      height={h}
      className={`block shrink-0 select-none ${className}`}
      style={{
        width: w,
        height: 'auto',
        mixBlendMode: inverted ? 'screen' : undefined,
      }}
    />
  );
};

export default HuttyLogo;
