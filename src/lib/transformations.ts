/**
 * Affine and perspective transformation utilities for outfit overlay rendering.
 * Uses triangular mesh subdivision for perspective warping on HTML5 Canvas.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Triangle {
  src: [Point2D, Point2D, Point2D];
  dst: [Point2D, Point2D, Point2D];
}

/**
 * Apply exponential moving average to smooth landmark positions across frames.
 * Alpha = 0.7 means 70% new value, 30% previous value (responsive but stable).
 */
export function applyEMA(
  current: { x: number; y: number; z: number; visibility?: number },
  previous: { x: number; y: number; z: number; visibility?: number } | null,
  alpha = 0.7
): { x: number; y: number; z: number; visibility?: number } {
  if (!previous) return current;
  return {
    x: alpha * current.x + (1 - alpha) * previous.x,
    y: alpha * current.y + (1 - alpha) * previous.y,
    z: alpha * current.z + (1 - alpha) * previous.z,
    visibility: current.visibility !== undefined && previous.visibility !== undefined
      ? alpha * current.visibility + (1 - alpha) * previous.visibility
      : current.visibility,
  };
}

/**
 * Calculate distance between two 2D points.
 */
export function distance(a: Point2D, b: Point2D): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

/**
 * Calculate angle in radians between two points.
 */
export function angle(a: Point2D, b: Point2D): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * Generate a grid of triangles for mesh-based perspective warping.
 * Returns arrays of source and destination triangles.
 */
export function generateMeshTriangles(
  srcQuad: [Point2D, Point2D, Point2D, Point2D], // TL, TR, BL, BR
  dstQuad: [Point2D, Point2D, Point2D, Point2D], // TL, TR, BL, BR
  subdivisions = 4
): Triangle[] {
  const triangles: Triangle[] = [];
  const n = subdivisions;

  // Bilinear interpolation helper
  function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  function bilerp(quad: [Point2D, Point2D, Point2D, Point2D], u: number, v: number): Point2D {
    const [tl, tr, bl, br] = quad;
    return {
      x: lerp(lerp(tl.x, tr.x, u), lerp(bl.x, br.x, u), v),
      y: lerp(lerp(tl.y, tr.y, u), lerp(bl.y, br.y, u), v),
    };
  }

  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const u0 = col / n;
      const u1 = (col + 1) / n;
      const v0 = row / n;
      const v1 = (row + 1) / n;

      // Two triangles per cell
      const srcTL = bilerp(srcQuad, u0, v0);
      const srcTR = bilerp(srcQuad, u1, v0);
      const srcBL = bilerp(srcQuad, u0, v1);
      const srcBR = bilerp(srcQuad, u1, v1);

      const dstTL = bilerp(dstQuad, u0, v0);
      const dstTR = bilerp(dstQuad, u1, v0);
      const dstBL = bilerp(dstQuad, u0, v1);
      const dstBR = bilerp(dstQuad, u1, v1);

      // Upper-left triangle
      triangles.push({
        src: [srcTL, srcTR, srcBL],
        dst: [dstTL, dstTR, dstBL],
      });

      // Lower-right triangle
      triangles.push({
        src: [srcTR, srcBR, srcBL],
        dst: [dstTR, dstBR, dstBL],
      });
    }
  }

  return triangles;
}

/**
 * Draw a single triangle from the source image onto the destination canvas
 * using affine transform. This is the core of the perspective warp.
 */
export function drawTriangle(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | ImageBitmap,
  srcTriangle: [Point2D, Point2D, Point2D],
  dstTriangle: [Point2D, Point2D, Point2D],
  opacity = 1
): void {
  const [s0, s1, s2] = srcTriangle;
  const [d0, d1, d2] = dstTriangle;

  // Save state
  ctx.save();

  // Clip to destination triangle
  ctx.beginPath();
  ctx.moveTo(d0.x, d0.y);
  ctx.lineTo(d1.x, d1.y);
  ctx.lineTo(d2.x, d2.y);
  ctx.closePath();
  ctx.clip();

  // Calculate affine transform from source to destination triangle
  // We solve: dst = M * src
  // [ d0.x  d1.x  d2.x ]   [ s0.x  s1.x  s2.x ]
  // [ d0.y  d1.y  d2.y ] = M * [ s0.y  s1.y  s2.y ]
  // [  1     1     1   ]   [  1     1     1   ]

  const srcDx = s1.x - s0.x;
  const srcDy = s1.y - s0.y;
  const srcEx = s2.x - s0.x;
  const srcEy = s2.y - s0.y;

  const dstDx = d1.x - d0.x;
  const dstDy = d1.y - d0.y;
  const dstEx = d2.x - d0.x;
  const dstEy = d2.y - d0.y;

  // Solve for the transform matrix
  const det = srcDx * srcEy - srcEx * srcDy;
  if (Math.abs(det) < 1e-7) {
    ctx.restore();
    return; // Degenerate triangle, skip
  }

  const a = (dstDx * srcEy - dstEx * srcDy) / det;
  const b = (dstEx * srcDx - dstDx * srcEx) / det;
  const c = d0.x - a * s0.x - b * s0.y;
  const d = (dstDy * srcEy - dstEy * srcDy) / det;
  const e = (dstEy * srcDx - dstDy * srcEx) / det;
  const f = d0.y - d * s0.x - e * s0.y;

  ctx.globalAlpha = opacity;
  ctx.transform(a, d, b, e, c, f);
  ctx.drawImage(image, 0, 0);

  ctx.restore();
}

/**
 * Render an outfit image onto the canvas using triangular mesh warping.
 * Maps the outfit asset's control points to detected body landmark positions.
 */
export function renderOutfitMesh(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | ImageBitmap,
  srcQuad: [Point2D, Point2D, Point2D, Point2D],
  dstQuad: [Point2D, Point2D, Point2D, Point2D],
  opacity = 0.88,
  subdivisions = 4
): void {
  const triangles = generateMeshTriangles(srcQuad, dstQuad, subdivisions);

  for (const tri of triangles) {
    drawTriangle(ctx, image, tri.src, tri.dst, opacity);
  }
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
