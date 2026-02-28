/**
 * Generates PWA icons for MirrorMe.
 */

import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

function generateIcon(size: number) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;

  // Background
  const bg = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  bg.addColorStop(0, '#1a1a2e');
  bg.addColorStop(1, '#0a0a0f');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Mirror/M logo
  const s = size / 4;
  const cx = size / 2;
  const cy = size / 2;

  // Purple gradient circle (mirror frame)
  const grad = ctx.createLinearGradient(cx - s, cy - s, cx + s, cy + s);
  grad.addColorStop(0, '#6C5CE7');
  grad.addColorStop(1, '#a29bfe');
  ctx.strokeStyle = grad;
  ctx.lineWidth = size * 0.08;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.9, 0, Math.PI * 2);
  ctx.stroke();

  // "M" letter
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.35}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', cx, cy);

  return canvas.toBuffer('image/png');
}

const sizes = [192, 512];
for (const size of sizes) {
  const buffer = generateIcon(size);
  const filepath = path.join(ICONS_DIR, `icon-${size}.png`);
  fs.writeFileSync(filepath, buffer);
  console.log(`Generated icon-${size}.png`);
}
