'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { disposePoseLandmarker, PoseLandmarkerResult } from '@/lib/mediapipe';
import { Landmark, PoseResult, BodyMetrics } from '@/types/pose';
import { applyEMA } from '@/lib/transformations';
import { POSE_LANDMARKS } from '@/types/pose';
import { EMA_ALPHA } from '@/lib/constants';

interface UsePoseDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasWidth: number;
  canvasHeight: number;
  enabled: boolean;
}

interface UsePoseDetectionReturn {
  poseResult: PoseResult | null;
  isLoading: boolean;
  error: string | null;
  fps: number;
}

function calculateBodyMetrics(
  landmarks: Landmark[],
  canvasWidth: number,
  canvasHeight: number
): BodyMetrics {
  const ls = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rs = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const lh = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rh = landmarks[POSE_LANDMARKS.RIGHT_HIP];

  const lsX = ls.x * canvasWidth;
  const lsY = ls.y * canvasHeight;
  const rsX = rs.x * canvasWidth;
  const rsY = rs.y * canvasHeight;
  const lhX = lh.x * canvasWidth;
  const lhY = lh.y * canvasHeight;
  const rhX = rh.x * canvasWidth;
  const rhY = rh.y * canvasHeight;

  const shoulderWidth = Math.sqrt((rsX - lsX) ** 2 + (rsY - lsY) ** 2);
  const torsoHeight = Math.sqrt(
    ((lsX + rsX) / 2 - (lhX + rhX) / 2) ** 2 +
    ((lsY + rsY) / 2 - (lhY + rhY) / 2) ** 2
  );
  const bodyAngle = Math.atan2(rsY - lsY, rsX - lsX);

  return {
    shoulderWidth,
    torsoHeight,
    bodyAngle,
    bodyScale: 1, // Calculated relative to outfit asset in renderer
    centerX: ((lsX + rsX) / 2 + (lhX + rhX) / 2) / 2,
    centerY: ((lsY + rsY) / 2 + (lhY + rhY) / 2) / 2,
  };
}

export function usePoseDetection({
  videoRef,
  canvasWidth,
  canvasHeight,
  enabled,
}: UsePoseDetectionOptions): UsePoseDetectionReturn {
  const [poseResult, setPoseResult] = useState<PoseResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  const rafRef = useRef<number | null>(null);
  const smoothedLandmarks = useRef<Landmark[] | null>(null);
  const lastTimestamp = useRef<number>(-1);
  const fpsFrames = useRef<number[]>([]);
  const mountedRef = useRef(true);

  const runDetection = useCallback(async () => {
    if (!mountedRef.current || !enabled) return;

    try {
      const { initializePoseLandmarker: init } = await import('@/lib/mediapipe');
      const landmarker = await init();

      if (!mountedRef.current) return;
      setIsLoading(false);

      const detect = (timestamp: number) => {
        if (!mountedRef.current || !enabled) return;

        const video = videoRef.current;
        if (!video || video.readyState < 2 || video.paused) {
          rafRef.current = requestAnimationFrame(detect);
          return;
        }

        // Skip if same timestamp (video hasn't updated)
        if (timestamp === lastTimestamp.current) {
          rafRef.current = requestAnimationFrame(detect);
          return;
        }
        lastTimestamp.current = timestamp;

        let result: PoseLandmarkerResult;
        try {
          result = landmarker.detectForVideo(video, timestamp);
        } catch {
          rafRef.current = requestAnimationFrame(detect);
          return;
        }

        if (result.landmarks && result.landmarks.length > 0) {
          const rawLandmarks = result.landmarks[0] as Landmark[];

          // Apply EMA smoothing
          if (smoothedLandmarks.current === null) {
            smoothedLandmarks.current = rawLandmarks;
          } else {
            smoothedLandmarks.current = rawLandmarks.map((lm, i) =>
              applyEMA(lm, smoothedLandmarks.current![i], EMA_ALPHA)
            );
          }

          const worldLandmarks = (result.worldLandmarks?.[0] as Landmark[]) ?? rawLandmarks;

          // Only calculate body metrics if key landmarks are visible
          const hasRequiredLandmarks =
            (smoothedLandmarks.current[POSE_LANDMARKS.LEFT_SHOULDER]?.visibility ?? 0) > 0.3 &&
            (smoothedLandmarks.current[POSE_LANDMARKS.RIGHT_SHOULDER]?.visibility ?? 0) > 0.3;

          if (hasRequiredLandmarks) {
            const bodyMetrics = calculateBodyMetrics(
              smoothedLandmarks.current,
              canvasWidth,
              canvasHeight
            );

            if (mountedRef.current) {
              setPoseResult({
                landmarks: smoothedLandmarks.current,
                worldLandmarks,
                bodyMetrics,
                timestamp,
              });
            }
          }
        } else {
          // No pose detected - gradually fade smoothed landmarks
          smoothedLandmarks.current = null;
          if (mountedRef.current) {
            setPoseResult(null);
          }
        }

        // FPS tracking
        const now = performance.now();
        fpsFrames.current.push(now);
        fpsFrames.current = fpsFrames.current.filter((t) => now - t < 1000);
        if (mountedRef.current) {
          setFps(fpsFrames.current.length);
        }

        rafRef.current = requestAnimationFrame(detect);
      };

      rafRef.current = requestAnimationFrame(detect);
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : 'Failed to initialize pose detection';
      setError(message);
      setIsLoading(false);
    }
  }, [videoRef, canvasWidth, canvasHeight, enabled]);

  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      void runDetection();
    }

    return () => {
      mountedRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled, runDetection]);

  // Cleanup pose landmarker on unmount
  useEffect(() => {
    return () => {
      disposePoseLandmarker();
    };
  }, []);

  return { poseResult, isLoading, error, fps };
}
