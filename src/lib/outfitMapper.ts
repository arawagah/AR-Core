/**
 * Maps outfit control points to detected body landmark positions.
 * Calculates the destination quad on screen for each outfit category.
 */

import { Landmark, POSE_LANDMARKS } from '@/types/pose';
import { ControlData, Category } from '@/types/outfit';
import { Point2D, distance } from './transformations';

export interface OutfitQuad {
  srcQuad: [Point2D, Point2D, Point2D, Point2D]; // Source (asset) corners: TL, TR, BL, BR
  dstQuad: [Point2D, Point2D, Point2D, Point2D]; // Destination (screen) corners: TL, TR, BL, BR
  opacity: number;
  visible: boolean;
}

const { LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_HIP, RIGHT_HIP,
        LEFT_KNEE, RIGHT_KNEE, LEFT_ANKLE, RIGHT_ANKLE,
        NOSE } = POSE_LANDMARKS;

/**
 * Convert normalized landmark coordinates to canvas pixel coordinates.
 */
function toCanvas(lm: Landmark, canvasWidth: number, canvasHeight: number): Point2D {
  return {
    x: lm.x * canvasWidth,
    y: lm.y * canvasHeight,
  };
}

/**
 * Calculate midpoint between two landmarks.
 */
function midpoint(a: Landmark, b: Landmark, w: number, h: number): Point2D {
  return {
    x: ((a.x + b.x) / 2) * w,
    y: ((a.y + b.y) / 2) * h,
  };
}

/**
 * Check if body region is sufficiently visible for rendering.
 */
function isRegionVisible(landmarks: Landmark[], indices: number[], threshold = 0.4): boolean {
  return indices.every((i) => (landmarks[i]?.visibility ?? 0) > threshold);
}

/**
 * Calculate the destination quad for a TOP/OUTERWEAR item.
 * Covers the torso region (shoulders to hips) with sleeve extensions.
 */
function calculateTopQuad(
  landmarks: Landmark[],
  canvasWidth: number,
  canvasHeight: number
): { quad: [Point2D, Point2D, Point2D, Point2D]; visible: boolean } {
  const required = [LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_HIP, RIGHT_HIP];
  const visible = isRegionVisible(landmarks, required);

  const ls = toCanvas(landmarks[LEFT_SHOULDER], canvasWidth, canvasHeight);
  const rs = toCanvas(landmarks[RIGHT_SHOULDER], canvasWidth, canvasHeight);
  const lh = toCanvas(landmarks[LEFT_HIP], canvasWidth, canvasHeight);
  const rh = toCanvas(landmarks[RIGHT_HIP], canvasWidth, canvasHeight);

  // Extend shoulders outward for sleeve coverage
  const shoulderExtend = distance(ls, rs) * 0.35;
  const shoulderUp = distance(ls, lh) * 0.08;

  // Calculate body rotation
  const bodyAngle = Math.atan2(rs.y - ls.y, rs.x - ls.x);
  const cosA = Math.cos(bodyAngle);
  const sinA = Math.sin(bodyAngle);

  const extLeft: Point2D = {
    x: ls.x - shoulderExtend * cosA - shoulderUp * sinA,
    y: ls.y - shoulderExtend * sinA + shoulderUp * cosA,
  };
  const extRight: Point2D = {
    x: rs.x + shoulderExtend * cosA - shoulderUp * sinA,
    y: rs.y + shoulderExtend * sinA + shoulderUp * cosA,
  };

  // Hip width extension
  const hipExtend = distance(lh, rh) * 0.08;
  const extLeftHip: Point2D = { x: lh.x - hipExtend, y: lh.y };
  const extRightHip: Point2D = { x: rh.x + hipExtend, y: rh.y };

  return {
    quad: [extLeft, extRight, extLeftHip, extRightHip],
    visible,
  };
}

/**
 * Calculate the destination quad for a BOTTOM item (pants, shorts, skirt).
 */
function calculateBottomQuad(
  landmarks: Landmark[],
  canvasWidth: number,
  canvasHeight: number,
  controlData: ControlData
): { quad: [Point2D, Point2D, Point2D, Point2D]; visible: boolean } {
  const hasAnkles = (landmarks[LEFT_ANKLE]?.visibility ?? 0) > 0.5
    && (landmarks[RIGHT_ANKLE]?.visibility ?? 0) > 0.5;
  const hasKnees = (landmarks[LEFT_KNEE]?.visibility ?? 0) > 0.5
    && (landmarks[RIGHT_KNEE]?.visibility ?? 0) > 0.5;

  const required = [LEFT_HIP, RIGHT_HIP];
  const visible = isRegionVisible(landmarks, required);

  const lh = toCanvas(landmarks[LEFT_HIP], canvasWidth, canvasHeight);
  const rh = toCanvas(landmarks[RIGHT_HIP], canvasWidth, canvasHeight);

  // Determine bottom point based on outfit type and landmark availability
  const isShorts = controlData.id?.includes('shorts') || controlData.id?.includes('skirt');
  let leftBottom: Point2D, rightBottom: Point2D;

  if (isShorts) {
    if (hasKnees) {
      leftBottom = toCanvas(landmarks[LEFT_KNEE], canvasWidth, canvasHeight);
      rightBottom = toCanvas(landmarks[RIGHT_KNEE], canvasWidth, canvasHeight);
    } else {
      const extend = distance(lh, rh) * 1.0;
      leftBottom = { x: lh.x, y: lh.y + extend };
      rightBottom = { x: rh.x, y: rh.y + extend };
    }
  } else {
    if (hasAnkles) {
      leftBottom = toCanvas(landmarks[LEFT_ANKLE], canvasWidth, canvasHeight);
      rightBottom = toCanvas(landmarks[RIGHT_ANKLE], canvasWidth, canvasHeight);
    } else if (hasKnees) {
      const lk = toCanvas(landmarks[LEFT_KNEE], canvasWidth, canvasHeight);
      const rk = toCanvas(landmarks[RIGHT_KNEE], canvasWidth, canvasHeight);
      const extend = distance(lh, rh) * 0.8;
      leftBottom = { x: lk.x, y: lk.y + extend };
      rightBottom = { x: rk.x, y: rk.y + extend };
    } else {
      const extend = distance(lh, rh) * 2.2;
      leftBottom = { x: lh.x, y: lh.y + extend };
      rightBottom = { x: rh.x, y: rh.y + extend };
    }
  }

  const hipExtend = distance(lh, rh) * 0.1;

  return {
    quad: [
      { x: lh.x - hipExtend, y: lh.y },
      { x: rh.x + hipExtend, y: rh.y },
      leftBottom,
      rightBottom,
    ],
    visible,
  };
}

/**
 * Calculate quad for DRESS or FULL_OUTFIT (covers torso + legs).
 */
function calculateFullBodyQuad(
  landmarks: Landmark[],
  canvasWidth: number,
  canvasHeight: number
): { quad: [Point2D, Point2D, Point2D, Point2D]; visible: boolean } {
  const required = [LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_HIP, RIGHT_HIP];
  const visible = isRegionVisible(landmarks, required);

  const ls = toCanvas(landmarks[LEFT_SHOULDER], canvasWidth, canvasHeight);
  const rs = toCanvas(landmarks[RIGHT_SHOULDER], canvasWidth, canvasHeight);
  const lh = toCanvas(landmarks[LEFT_HIP], canvasWidth, canvasHeight);
  const rh = toCanvas(landmarks[RIGHT_HIP], canvasWidth, canvasHeight);

  const hasAnkles = (landmarks[LEFT_ANKLE]?.visibility ?? 0) > 0.4
    && (landmarks[RIGHT_ANKLE]?.visibility ?? 0) > 0.4;

  let leftBottom: Point2D, rightBottom: Point2D;
  if (hasAnkles) {
    leftBottom = toCanvas(landmarks[LEFT_ANKLE], canvasWidth, canvasHeight);
    rightBottom = toCanvas(landmarks[RIGHT_ANKLE], canvasWidth, canvasHeight);
    // Extend a bit below ankles
    const ext = 20;
    leftBottom = { x: leftBottom.x, y: leftBottom.y + ext };
    rightBottom = { x: rightBottom.x, y: rightBottom.y + ext };
  } else {
    const torsoHeight = distance({ x: ls.x, y: ls.y }, { x: lh.x, y: lh.y });
    leftBottom = { x: lh.x - 20, y: lh.y + torsoHeight * 1.8 };
    rightBottom = { x: rh.x + 20, y: rh.y + torsoHeight * 1.8 };
  }

  // Shoulder extension
  const shoulderExtend = distance(ls, rs) * 0.3;

  return {
    quad: [
      { x: ls.x - shoulderExtend, y: ls.y - 10 },
      { x: rs.x + shoulderExtend, y: rs.y - 10 },
      leftBottom,
      rightBottom,
    ],
    visible,
  };
}

/**
 * Main function: calculate outfit quad and source quad from landmarks.
 */
export function calculateOutfitQuad(
  landmarks: Landmark[],
  controlData: ControlData,
  category: Category,
  canvasWidth: number,
  canvasHeight: number
): OutfitQuad {
  const { controlPoints, referenceWidth, referenceHeight } = controlData;

  // Source quad = control points on the asset image
  // Default to full image corners if control points not available
  const srcTL = controlPoints.leftShoulder
    ? { x: controlPoints.leftShoulder[0], y: controlPoints.leftShoulder[1] }
    : { x: 0, y: 0 };
  const srcTR = controlPoints.rightShoulder
    ? { x: controlPoints.rightShoulder[0], y: controlPoints.rightShoulder[1] }
    : { x: referenceWidth, y: 0 };
  const srcBL = controlPoints.leftHip ?? controlPoints.leftAnkle
    ? { x: (controlPoints.leftHip ?? controlPoints.leftAnkle)![0], y: (controlPoints.leftHip ?? controlPoints.leftAnkle)![1] }
    : { x: 0, y: referenceHeight };
  const srcBR = controlPoints.rightHip ?? controlPoints.rightAnkle
    ? { x: (controlPoints.rightHip ?? controlPoints.rightAnkle)![0], y: (controlPoints.rightHip ?? controlPoints.rightAnkle)![1] }
    : { x: referenceWidth, y: referenceHeight };

  const srcQuad: [Point2D, Point2D, Point2D, Point2D] = [srcTL, srcTR, srcBL, srcBR];

  let dstResult: { quad: [Point2D, Point2D, Point2D, Point2D]; visible: boolean };

  switch (category) {
    case 'TOP':
    case 'OUTERWEAR':
      dstResult = calculateTopQuad(landmarks, canvasWidth, canvasHeight);
      break;
    case 'BOTTOM':
      dstResult = calculateBottomQuad(landmarks, canvasWidth, canvasHeight, controlData);
      break;
    case 'DRESS':
    case 'FULL_OUTFIT':
      dstResult = calculateFullBodyQuad(landmarks, canvasWidth, canvasHeight);
      break;
    default:
      // Accessories: center on the nose area
      {
        const nose = landmarks[NOSE];
        const cx = nose.x * canvasWidth;
        const cy = nose.y * canvasHeight;
        const size = 80;
        dstResult = {
          quad: [
            { x: cx - size, y: cy - size },
            { x: cx + size, y: cy - size },
            { x: cx - size, y: cy + size },
            { x: cx + size, y: cy + size },
          ],
          visible: (nose.visibility ?? 0) > 0.5,
        };
      }
      break;
  }

  // Calculate average visibility for opacity
  const visibilityIndices = [LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_HIP, RIGHT_HIP];
  const avgVisibility = visibilityIndices.reduce((sum, i) =>
    sum + (landmarks[i]?.visibility ?? 0), 0
  ) / visibilityIndices.length;

  // Fade opacity based on visibility
  const baseOpacity = 0.88;
  const opacity = dstResult.visible
    ? Math.min(baseOpacity, avgVisibility * baseOpacity * 1.5)
    : Math.max(0, avgVisibility * baseOpacity - 0.3);

  return {
    srcQuad,
    dstQuad: dstResult.quad,
    opacity,
    visible: dstResult.visible,
  };
}

/**
 * Calculate body metrics from landmarks.
 */
export function calculateBodyMetrics(
  landmarks: Landmark[],
  canvasWidth: number,
  canvasHeight: number
) {
  const ls = toCanvas(landmarks[LEFT_SHOULDER], canvasWidth, canvasHeight);
  const rs = toCanvas(landmarks[RIGHT_SHOULDER], canvasWidth, canvasHeight);

  const shoulderMid = midpoint(landmarks[LEFT_SHOULDER], landmarks[RIGHT_SHOULDER], canvasWidth, canvasHeight);
  const hipMid = midpoint(landmarks[LEFT_HIP], landmarks[RIGHT_HIP], canvasWidth, canvasHeight);

  return {
    shoulderWidth: distance(ls, rs),
    torsoHeight: distance(shoulderMid, hipMid),
    bodyAngle: Math.atan2(rs.y - ls.y, rs.x - ls.x),
    centerX: (shoulderMid.x + hipMid.x) / 2,
    centerY: (shoulderMid.y + hipMid.y) / 2,
  };
}
