/**
 * MediaPipe Pose Landmarker initialization and configuration.
 * Self-hosts WASM and model files to avoid CDN CORS issues on Safari.
 */

import type { PoseLandmarker, PoseLandmarkerResult } from '@mediapipe/tasks-vision';

// Re-export the result type for use in other modules
export type { PoseLandmarkerResult };

let poseLandmarker: PoseLandmarker | null = null;
let initializationPromise: Promise<PoseLandmarker> | null = null;

export async function initializePoseLandmarker(): Promise<PoseLandmarker> {
  // Return existing instance
  if (poseLandmarker) return poseLandmarker;

  // Return in-progress initialization
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    // Dynamic import to avoid SSR issues
    const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

    // Use self-hosted WASM files to avoid Safari CDN CORS issues
    const vision = await FilesetResolver.forVisionTasks('/models/mediapipe');

    const landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/pose_landmarker_lite.task',
        // Use GPU delegate for performance, fall back to CPU automatically
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputSegmentationMasks: false,
    });

    poseLandmarker = landmarker;
    return landmarker;
  })();

  return initializationPromise;
}

export function disposePoseLandmarker(): void {
  if (poseLandmarker) {
    poseLandmarker.close();
    poseLandmarker = null;
    initializationPromise = null;
  }
}

export function getPoseLandmarker(): PoseLandmarker | null {
  return poseLandmarker;
}
