'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Outfit, OutfitSelection, ControlData } from '@/types/outfit';
import { PoseResult } from '@/types/pose';
import { calculateOutfitQuad } from '@/lib/outfitMapper';
import { renderOutfitMesh } from '@/lib/transformations';
import { MESH_SUBDIVISIONS } from '@/lib/constants';

interface UseOutfitOverlayOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  poseResult: PoseResult | null;
  outfits: Outfit[];
  canvasWidth: number;
  canvasHeight: number;
}

interface UseOutfitOverlayReturn {
  selections: Map<string, OutfitSelection>;
  updateScale: (outfitId: string, scale: number) => void;
  updateOffset: (outfitId: string, offsetX: number, offsetY: number) => void;
  captureScreenshot: () => void;
}

// Cache for loaded outfit images
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function useOutfitOverlay({
  canvasRef,
  videoRef,
  poseResult,
  outfits,
  canvasWidth,
  canvasHeight,
}: UseOutfitOverlayOptions): UseOutfitOverlayReturn {
  const [selections, setSelections] = useState<Map<string, OutfitSelection>>(new Map());
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const rafRef = useRef<number | null>(null);
  const poseRef = useRef<PoseResult | null>(null);
  const selectionsRef = useRef<Map<string, OutfitSelection>>(new Map());
  const mountedRef = useRef(true);

  // Keep refs up to date
  poseRef.current = poseResult;
  selectionsRef.current = selections;

  // Load outfit images when outfits change
  useEffect(() => {
    for (const outfit of outfits) {
      if (!imagesRef.current.has(outfit.id)) {
        loadImage(outfit.assetPath)
          .then((img) => {
            imagesRef.current.set(outfit.id, img);
          })
          .catch(() => {
            console.warn(`Failed to load outfit image: ${outfit.assetPath}`);
          });
      }
    }

    // Initialize selections
    setSelections((prev) => {
      const next = new Map(prev);
      for (const outfit of outfits) {
        if (!next.has(outfit.id)) {
          next.set(outfit.id, { outfit, scale: 1, offsetX: 0, offsetY: 0 });
        }
      }
      // Remove outfits no longer in the list
      const outfitIds = new Set(outfits.map((o) => o.id));
      for (const key of Array.from(next.keys())) {
        if (!outfitIds.has(key)) next.delete(key);
      }
      return next;
    });
  }, [outfits]);

  // Main render loop
  const render = useCallback(() => {
    if (!mountedRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(render);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) {
      rafRef.current = requestAnimationFrame(render);
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw camera feed (mirrored for front camera)
    ctx.save();
    // The video is already mirrored via CSS transform on the video element
    // Canvas draws unmirrored for screenshot capture
    ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // Draw outfit overlays if pose is detected
    const pose = poseRef.current;
    if (pose && pose.landmarks.length > 0) {
      const currentSelections = selectionsRef.current;

      // Sort by zLayer for proper depth ordering
      const sortedOutfits = Array.from(currentSelections.values()).sort(
        (a, b) => (a.outfit.zLayer ?? 1) - (b.outfit.zLayer ?? 1)
      );

      for (const selection of sortedOutfits) {
        const { outfit, scale, offsetX, offsetY } = selection;
        const image = imagesRef.current.get(outfit.id);

        if (!image) continue;

        const controlData = outfit.controlData as ControlData;
        const outfitQuad = calculateOutfitQuad(
          pose.landmarks,
          controlData,
          outfit.category,
          canvasWidth,
          canvasHeight
        );

        if (!outfitQuad.visible && outfitQuad.opacity < 0.05) continue;

        // Apply user scale and offset adjustments
        const dstQuad = outfitQuad.dstQuad.map((p) => ({
          x: (p.x - canvasWidth / 2) * scale + canvasWidth / 2 + offsetX,
          y: (p.y - canvasHeight / 2) * scale + canvasHeight / 2 + offsetY,
        })) as typeof outfitQuad.dstQuad;

        renderOutfitMesh(
          ctx,
          image,
          outfitQuad.srcQuad,
          dstQuad,
          outfitQuad.opacity,
          MESH_SUBDIVISIONS
        );
      }
    }

    rafRef.current = requestAnimationFrame(render);
  }, [canvasRef, videoRef, canvasWidth, canvasHeight]);

  // Start render loop
  useEffect(() => {
    mountedRef.current = true;
    rafRef.current = requestAnimationFrame(render);

    return () => {
      mountedRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [render]);

  const updateScale = useCallback((outfitId: string, scale: number) => {
    setSelections((prev) => {
      const next = new Map(prev);
      const sel = next.get(outfitId);
      if (sel) next.set(outfitId, { ...sel, scale });
      return next;
    });
  }, []);

  const updateOffset = useCallback((outfitId: string, offsetX: number, offsetY: number) => {
    setSelections((prev) => {
      const next = new Map(prev);
      const sel = next.get(outfitId);
      if (sel) next.set(outfitId, { ...sel, offsetX, offsetY });
      return next;
    });
  }, []);

  const captureScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `mirrorme-tryon-${Date.now()}.jpg`;
      link.click();
    } catch (err) {
      console.error('Screenshot failed:', err);
    }
  }, [canvasRef]);

  return { selections, updateScale, updateOffset, captureScreenshot };
}
