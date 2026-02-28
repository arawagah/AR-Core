'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CAMERA_CONSTRAINTS, CAMERA_CONSTRAINTS_REAR } from '@/lib/constants';

export type CameraFacing = 'user' | 'environment';

export interface CameraState {
  stream: MediaStream | null;
  error: string | null;
  loading: boolean;
  facing: CameraFacing;
  hasPermission: boolean | null;
}

export interface UseCameraReturn extends CameraState {
  videoRef: React.RefObject<HTMLVideoElement>;
  flipCamera: () => void;
  requestPermission: () => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<CameraState>({
    stream: null,
    error: null,
    loading: true,
    facing: 'user',
    hasPermission: null,
  });
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async (facing: CameraFacing) => {
    stopStream();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not supported on this browser.');
      }

      const constraints = facing === 'user' ? CAMERA_CONSTRAINTS : CAMERA_CONSTRAINTS_REAR;
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback: try without exact constraint
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
      }

      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // iOS Safari requires these attributes to be set programmatically too
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');
        videoRef.current.muted = true;

        await videoRef.current.play();
      }

      setState({
        stream,
        error: null,
        loading: false,
        facing,
        hasPermission: true,
      });
    } catch (err) {
      if (!mountedRef.current) return;

      const error = err as Error;
      let message = 'Failed to access camera.';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        message = 'Camera permission denied. Please allow camera access in your browser settings, then refresh the page.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        message = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        message = 'Camera is in use by another application. Please close other apps and try again.';
      } else if (error.name === 'OverconstrainedError') {
        message = 'Camera does not support the requested configuration.';
      } else if (error.message) {
        message = error.message;
      }

      setState({
        stream: null,
        error: message,
        loading: false,
        facing,
        hasPermission: error.name === 'NotAllowedError' ? false : null,
      });
    }
  }, [stopStream]);

  // Initial camera start
  useEffect(() => {
    mountedRef.current = true;
    void startCamera('user');

    return () => {
      mountedRef.current = false;
      stopStream();
    };
  }, [startCamera, stopStream]);

  const flipCamera = useCallback(() => {
    const newFacing: CameraFacing = state.facing === 'user' ? 'environment' : 'user';
    void startCamera(newFacing);
  }, [state.facing, startCamera]);

  const requestPermission = useCallback(() => {
    void startCamera(state.facing);
  }, [startCamera, state.facing]);

  return {
    ...state,
    videoRef,
    flipCamera,
    requestPermission,
  };
}
