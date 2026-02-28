'use client';

import { forwardRef } from 'react';

interface CameraFeedProps {
  isFrontCamera: boolean;
  className?: string;
}

/**
 * Camera video element with iOS Safari-compatible attributes.
 * - playsinline is CRITICAL for iOS Safari (prevents fullscreen takeover)
 * - autoplay + muted required for iOS to auto-play
 * - Mirror transform for front (selfie) camera
 */
export const CameraFeed = forwardRef<HTMLVideoElement, CameraFeedProps>(
  ({ isFrontCamera, className = '' }, ref) => {
    return (
      <video
        ref={ref}
        // CRITICAL for iOS Safari: prevents fullscreen
        playsInline
        // Required for iOS autoplay
        autoPlay
        muted
        // Hidden but functional: the canvas overlay renders the video frames
        className={`absolute inset-0 w-full h-full object-cover ${
          // Mirror front camera for natural selfie experience
          isFrontCamera ? '-scale-x-100' : ''
        } ${className}`}
        aria-hidden="true"
      />
    );
  }
);

CameraFeed.displayName = 'CameraFeed';
