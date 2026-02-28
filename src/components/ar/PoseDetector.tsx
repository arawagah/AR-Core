'use client';

import { useEffect } from 'react';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { PoseResult } from '@/types/pose';

interface PoseDetectorProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasWidth: number;
  canvasHeight: number;
  enabled: boolean;
  onPoseResult: (result: PoseResult | null) => void;
  onFpsUpdate: (fps: number) => void;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (error: string | null) => void;
}

/**
 * Pose detection wrapper component.
 * Initializes MediaPipe and streams pose results to parent.
 */
export function PoseDetector({
  videoRef,
  canvasWidth,
  canvasHeight,
  enabled,
  onPoseResult,
  onFpsUpdate,
  onLoadingChange,
  onError,
}: PoseDetectorProps) {
  const { poseResult, isLoading, error, fps } = usePoseDetection({
    videoRef,
    canvasWidth,
    canvasHeight,
    enabled,
  });

  useEffect(() => {
    onPoseResult(poseResult);
  }, [poseResult, onPoseResult]);

  useEffect(() => {
    onFpsUpdate(fps);
  }, [fps, onFpsUpdate]);

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    onError?.(error);
  }, [error, onError]);

  return null;
}
