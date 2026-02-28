'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CameraFeed } from './CameraFeed';
import { OutfitRenderer } from './OutfitRenderer';
import { PoseDetector } from './PoseDetector';
import { useCamera } from '@/hooks/useCamera';
import { useOutfitOverlay } from '@/hooks/useOutfitOverlay';
import { PoseResult } from '@/types/pose';
import { Outfit } from '@/types/outfit';
import { getPoseHint } from './BodySegments';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

interface ARSceneProps {
  outfits: Outfit[];
  onBack: () => void;
  allOutfits: Outfit[];
  onOutfitSelect: (outfit: Outfit) => void;
}

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 1280;

export function ARScene({ outfits, onBack, allOutfits, onOutfitSelect }: ARSceneProps) {
  const [poseResult, setPoseResult] = useState<PoseResult | null>(null);
  const [fps, setFps] = useState(0);
  const [showFps, setShowFps] = useState(false);
  const [poseLoading, setPoseLoading] = useState(true);
  const [poseError, setPoseError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pinch-to-scale state
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);
  const activeOutfitIdRef = useRef<string | null>(null);

  const {
    videoRef,
    stream,
    error: cameraError,
    loading: cameraLoading,
    facing,
    hasPermission,
    flipCamera,
    requestPermission,
  } = useCamera();

  const isFrontCamera = facing === 'user';
  const cameraReady = !!stream && !cameraLoading;

  const { captureScreenshot, updateScale } = useOutfitOverlay({
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
    videoRef: videoRef as React.RefObject<HTMLVideoElement>,
    poseResult,
    outfits,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
  });

  const handlePoseResult = useCallback((result: PoseResult | null) => {
    setPoseResult(result);
  }, []);

  const handleFpsUpdate = useCallback((newFps: number) => {
    setFps(newFps);
  }, []);

  const handlePoseLoadingChange = useCallback((loading: boolean) => {
    setPoseLoading(loading);
  }, []);

  const handlePoseError = useCallback((error: string | null) => {
    setPoseError(error);
  }, []);

  // 3-finger tap to toggle FPS counter
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 3) {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      tapCountRef.current += 1;
      tapTimerRef.current = setTimeout(() => {
        if (tapCountRef.current >= 1) {
          setShowFps((prev) => !prev);
        }
        tapCountRef.current = 0;
      }, 300);
    }

    // Pinch gesture detection
    if (e.touches.length === 2 && outfits.length > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistRef.current = Math.sqrt(dx * dx + dy * dy);
      pinchStartScaleRef.current = 1;
      activeOutfitIdRef.current = outfits[0].id;
    }
  }, [outfits]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null && activeOutfitIdRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const scale = Math.max(0.5, Math.min(2.0, currentDist / pinchStartDistRef.current));
      updateScale(activeOutfitIdRef.current, scale);
    }
  }, [updateScale]);

  const handleTouchEnd = useCallback(() => {
    pinchStartDistRef.current = null;
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    };
  }, []);

  const poseHint = getPoseHint(poseResult?.landmarks ?? null, poseLoading || !cameraReady);

  // Camera error state
  if (cameraError) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-6" aria-hidden="true">📷</div>
        <h2 className="text-xl font-bold mb-3">Camera Access Required</h2>
        <p className="text-white/60 mb-6 max-w-sm leading-relaxed">{cameraError}</p>

        {hasPermission === false && (
          <div className="glass rounded-xl p-4 mb-6 text-left max-w-sm text-sm text-white/70">
            <p className="font-semibold mb-2 text-white">How to enable camera:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open Safari Settings</li>
              <li>Tap &ldquo;Camera&rdquo; under this website</li>
              <li>Select &ldquo;Allow&rdquo;</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack}>← Back</Button>
          {hasPermission !== false && (
            <Button onClick={requestPermission}>Try Again</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Camera feed (hidden behind canvas, provides video source) */}
      <CameraFeed
        ref={videoRef}
        isFrontCamera={isFrontCamera}
        className="opacity-0 pointer-events-none"
      />

      {/* AR Canvas overlay (renders camera + outfits) */}
      <OutfitRenderer
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className={isFrontCamera ? '-scale-x-100' : ''}
      />

      {/* Pose detector (runs in background, no UI) */}
      {cameraReady && (
        <PoseDetector
          videoRef={videoRef as React.RefObject<HTMLVideoElement>}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
          enabled={cameraReady}
          onPoseResult={handlePoseResult}
          onFpsUpdate={handleFpsUpdate}
          onLoadingChange={handlePoseLoadingChange}
          onError={handlePoseError}
        />
      )}

      {/* Loading state */}
      {(cameraLoading || (cameraReady && poseLoading)) && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
          <LoadingSpinner size="lg" label={cameraLoading ? 'Starting camera...' : 'Loading AI model...'} />
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="w-10 h-10 glass rounded-full flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-all"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Outfit names */}
          <div className="glass rounded-full px-4 py-1.5 text-sm text-white/80 max-w-[50%] truncate text-center">
            {outfits.length > 0
              ? outfits.map((o) => o.name).join(' + ')
              : 'No outfit selected'}
          </div>

          <button
            onClick={flipCamera}
            className="w-10 h-10 glass rounded-full flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-all"
            aria-label="Flip camera"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* FPS counter (debug mode) */}
      {showFps && (
        <div className="absolute top-16 right-4 z-30 glass rounded-lg px-3 py-1 text-xs font-mono text-[#a29bfe]" aria-live="polite">
          {fps} FPS
        </div>
      )}

      {/* Pose error banner */}
      {poseError && !poseLoading && (
        <div className="absolute top-16 left-4 right-4 z-30 glass rounded-xl px-4 py-2 text-xs text-amber-400 text-center" role="alert">
          AI model error: {poseError}
        </div>
      )}

      {/* Pose detection loading indicator */}
      {!poseLoading && !poseError && cameraReady && (
        <div
          className={`absolute top-16 left-4 z-30 flex items-center gap-1.5 glass rounded-full px-3 py-1 text-xs transition-opacity ${
            poseResult ? 'opacity-100' : 'opacity-60'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className={`w-2 h-2 rounded-full ${poseResult ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} aria-hidden="true" />
          <span className="text-white/70">{poseResult ? 'Tracking' : 'No pose'}</span>
        </div>
      )}

      {/* Pose hint */}
      {poseHint && !cameraLoading && !poseLoading && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30" role="alert" aria-live="polite">
          <div className="glass rounded-xl px-5 py-3 text-sm text-white/80 text-center max-w-xs">
            {poseHint}
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 safe-bottom">
        {/* Outfit thumbnail strip */}
        <div className="px-4 mb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scroll-smooth-mobile" role="list" aria-label="Quick outfit selector">
            {allOutfits.map((outfit) => {
              const isActive = outfits.some((o) => o.id === outfit.id);
              return (
                <button
                  key={outfit.id}
                  role="listitem"
                  onClick={() => onOutfitSelect(outfit)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all active:scale-95 ${
                    isActive ? 'border-[#6C5CE7] shadow-lg shadow-[#6C5CE7]/30' : 'border-white/10 glass'
                  }`}
                  aria-label={`${isActive ? 'Remove' : 'Add'} ${outfit.name}`}
                  aria-pressed={isActive}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={outfit.assetPath}
                      alt={outfit.name}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Capture button row */}
        <div className="flex items-center justify-center gap-8 pb-6 px-4">
          {/* Spacer */}
          <div className="w-12" />

          {/* Capture button */}
          <button
            onClick={captureScreenshot}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform shadow-2xl"
            aria-label="Take photo"
          >
            <div className="w-16 h-16 bg-white rounded-full" />
          </button>

          {/* Flip camera shortcut */}
          <button
            onClick={flipCamera}
            className="w-12 h-12 glass rounded-full flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Switch camera"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Pinch hint (shown briefly when outfits loaded) */}
      {outfits.length > 0 && !cameraLoading && !poseLoading && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <p className="text-xs text-white/30 text-center">Pinch to resize • 3-finger tap for FPS</p>
        </div>
      )}
    </div>
  );
}
