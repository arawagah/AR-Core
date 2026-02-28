/**
 * Utility: Map MediaPipe pose landmarks to body regions.
 * Provides helper functions for body segment analysis.
 */

import { Landmark, POSE_LANDMARKS } from '@/types/pose';

export interface BodySegment {
  name: string;
  landmarks: number[];
  isVisible: boolean;
  avgVisibility: number;
}

const {
  LEFT_SHOULDER, RIGHT_SHOULDER,
  LEFT_ELBOW, RIGHT_ELBOW,
  LEFT_WRIST, RIGHT_WRIST,
  LEFT_HIP, RIGHT_HIP,
  LEFT_KNEE, RIGHT_KNEE,
  LEFT_ANKLE, RIGHT_ANKLE,
  NOSE, LEFT_EAR, RIGHT_EAR,
} = POSE_LANDMARKS;

export const BODY_SEGMENTS = {
  HEAD: [NOSE, LEFT_EAR, RIGHT_EAR],
  LEFT_ARM: [LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST],
  RIGHT_ARM: [RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST],
  TORSO: [LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_HIP, RIGHT_HIP],
  LEFT_LEG: [LEFT_HIP, LEFT_KNEE, LEFT_ANKLE],
  RIGHT_LEG: [RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE],
} as const;

export function getSegmentVisibility(
  landmarks: Landmark[],
  segmentIndices: readonly number[],
  threshold = 0.4
): { isVisible: boolean; avgVisibility: number } {
  const visibilities = segmentIndices.map((i) => landmarks[i]?.visibility ?? 0);
  const avgVisibility = visibilities.reduce((sum, v) => sum + v, 0) / visibilities.length;
  const isVisible = visibilities.every((v) => v > threshold);

  return { isVisible, avgVisibility };
}

export function analyzeBodySegments(landmarks: Landmark[]): Record<string, BodySegment> {
  const segments: Record<string, BodySegment> = {};

  for (const [name, indices] of Object.entries(BODY_SEGMENTS)) {
    const { isVisible, avgVisibility } = getSegmentVisibility(landmarks, indices);
    segments[name] = {
      name,
      landmarks: [...indices],
      isVisible,
      avgVisibility,
    };
  }

  return segments;
}

/**
 * Determine if the user is close enough to the camera for good tracking.
 */
export function isUserInFrame(landmarks: Landmark[]): boolean {
  const shoulder = landmarks[LEFT_SHOULDER];
  const hip = landmarks[LEFT_HIP];

  if (!shoulder || !hip) return false;

  // Check if torso occupies a reasonable portion of the frame
  const torsoHeight = Math.abs(hip.y - shoulder.y);
  const shoulderWidth = Math.abs(
    (landmarks[RIGHT_SHOULDER]?.x ?? 0) - (landmarks[LEFT_SHOULDER]?.x ?? 0)
  );

  // Torso should be at least 20% of frame height and shoulder width > 15%
  return torsoHeight > 0.2 && shoulderWidth > 0.15;
}

/**
 * Generate a hint message based on pose detection quality.
 */
export function getPoseHint(
  landmarks: Landmark[] | null,
  isLoading: boolean
): string | null {
  if (isLoading) return null;
  if (!landmarks) return 'Step into frame and face the camera';

  const torsoVisible = getSegmentVisibility(landmarks, BODY_SEGMENTS.TORSO).isVisible;
  if (!torsoVisible) return 'Step back so your full upper body is visible';

  const shoulderWidth = Math.abs(
    (landmarks[RIGHT_SHOULDER]?.x ?? 0) - (landmarks[LEFT_SHOULDER]?.x ?? 0)
  );
  if (shoulderWidth < 0.1) return 'Move closer to the camera';
  if (shoulderWidth > 0.7) return 'Step back a bit';

  return null;
}
