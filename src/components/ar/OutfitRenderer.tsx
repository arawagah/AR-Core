'use client';

import { forwardRef } from 'react';

interface OutfitRendererProps {
  width: number;
  height: number;
  className?: string;
}

/**
 * Canvas element for outfit overlay rendering.
 * The actual rendering logic lives in useOutfitOverlay hook.
 * This component just provides the canvas DOM element.
 */
export const OutfitRenderer = forwardRef<HTMLCanvasElement, OutfitRendererProps>(
  ({ width, height, className = '' }, ref) => {
    return (
      <canvas
        ref={ref}
        width={width}
        height={height}
        className={`absolute inset-0 w-full h-full ar-canvas ${className}`}
        aria-label="AR outfit overlay - showing clothing overlay on your body"
      />
    );
  }
);

OutfitRenderer.displayName = 'OutfitRenderer';
