/**
 * Generates placeholder outfit PNG assets with transparent backgrounds.
 * Uses node-canvas to draw simple but recognizable clothing shapes.
 * Each asset includes a JSON sidecar with control points for AR mapping.
 */

import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'assets', 'outfits');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const W = 300; // Asset width
const H = 400; // Asset height

interface ControlPoints {
  leftShoulder?: [number, number];
  rightShoulder?: [number, number];
  leftHip?: [number, number];
  rightHip?: [number, number];
  leftKnee?: [number, number];
  rightKnee?: [number, number];
  leftAnkle?: [number, number];
  rightAnkle?: [number, number];
  neck?: [number, number];
  head?: [number, number];
}

interface OutfitMeta {
  id: string;
  name: string;
  category: 'TOP' | 'BOTTOM' | 'FULL_OUTFIT' | 'DRESS' | 'OUTERWEAR' | 'ACCESSORIES';
  type: string;
  colorHex: string;
  description: string;
  controlPoints: ControlPoints;
  zLayer: number;
  referenceWidth: number;
  referenceHeight: number;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function drawTShirt(ctx: CanvasRenderingContext2D, color: string): ControlPoints {
  const neckX = W / 2;
  const neckY = 40;
  const leftShoulder: [number, number] = [50, 60];
  const rightShoulder: [number, number] = [250, 60];
  const leftHip: [number, number] = [40, 300];
  const rightHip: [number, number] = [260, 300];

  ctx.fillStyle = color;
  ctx.strokeStyle = hexToRgba(color, 0.7);
  ctx.lineWidth = 2;

  // Body of shirt
  ctx.beginPath();
  ctx.moveTo(neckX - 30, neckY); // Left neck
  ctx.lineTo(leftShoulder[0], leftShoulder[1]); // Left shoulder
  ctx.lineTo(leftShoulder[0] - 30, 140); // Left sleeve end
  ctx.lineTo(leftShoulder[0] - 10, 160); // Left underarm
  ctx.lineTo(leftHip[0], leftHip[1]); // Left hip
  ctx.lineTo(rightHip[0], rightHip[1]); // Right hip
  ctx.lineTo(rightShoulder[0] + 10, 160); // Right underarm
  ctx.lineTo(rightShoulder[0] + 30, 140); // Right sleeve end
  ctx.lineTo(rightShoulder[0], rightShoulder[1]); // Right shoulder
  ctx.lineTo(neckX + 30, neckY); // Right neck
  // Curved neckline
  ctx.quadraticCurveTo(neckX, neckY + 20, neckX - 30, neckY);
  ctx.closePath();
  ctx.fill();

  // Gradient overlay for depth
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, 'rgba(255,255,255,0.15)');
  gradient.addColorStop(0.5, 'rgba(0,0,0,0.05)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.15)');
  ctx.fillStyle = gradient;
  ctx.fill();

  return {
    leftShoulder,
    rightShoulder,
    leftHip,
    rightHip,
  };
}

function drawHoodie(ctx: CanvasRenderingContext2D, color: string): ControlPoints {
  const leftShoulder: [number, number] = [45, 70];
  const rightShoulder: [number, number] = [255, 70];
  const leftHip: [number, number] = [35, 310];
  const rightHip: [number, number] = [265, 310];

  ctx.fillStyle = color;

  // Body
  ctx.beginPath();
  ctx.moveTo(W / 2 - 40, 55);
  ctx.lineTo(leftShoulder[0], leftShoulder[1]);
  ctx.lineTo(leftShoulder[0] - 40, 150);
  ctx.lineTo(leftShoulder[0] - 15, 175);
  ctx.lineTo(leftHip[0], leftHip[1]);
  ctx.lineTo(rightHip[0], rightHip[1]);
  ctx.lineTo(rightShoulder[0] + 15, 175);
  ctx.lineTo(rightShoulder[0] + 40, 150);
  ctx.lineTo(rightShoulder[0], rightShoulder[1]);
  ctx.lineTo(W / 2 + 40, 55);
  ctx.quadraticCurveTo(W / 2, 40, W / 2 - 40, 55);
  ctx.closePath();
  ctx.fill();

  // Hood arc
  ctx.beginPath();
  ctx.arc(W / 2, 50, 55, Math.PI, 0, false);
  ctx.lineTo(W / 2 - 40, 55);
  ctx.closePath();
  ctx.fill();

  // Center zipper line
  ctx.strokeStyle = hexToRgba(color, 0.5);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2, 80);
  ctx.lineTo(W / 2, 305);
  ctx.stroke();

  // Gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, 'rgba(255,255,255,0.12)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 40, 55);
  ctx.lineTo(leftShoulder[0], leftShoulder[1]);
  ctx.lineTo(leftHip[0], leftHip[1]);
  ctx.lineTo(rightHip[0], rightHip[1]);
  ctx.lineTo(rightShoulder[0], rightShoulder[1]);
  ctx.lineTo(W / 2 + 40, 55);
  ctx.closePath();
  ctx.fill();

  return { leftShoulder, rightShoulder, leftHip, rightHip };
}

function drawJacket(ctx: CanvasRenderingContext2D, color: string): ControlPoints {
  const leftShoulder: [number, number] = [40, 65];
  const rightShoulder: [number, number] = [260, 65];
  const leftHip: [number, number] = [30, 310];
  const rightHip: [number, number] = [270, 310];

  ctx.fillStyle = color;

  // Body
  ctx.beginPath();
  ctx.moveTo(W / 2 - 25, 40);
  ctx.lineTo(leftShoulder[0], leftShoulder[1]);
  ctx.lineTo(leftShoulder[0] - 45, 160);
  ctx.lineTo(leftShoulder[0] - 20, 185);
  ctx.lineTo(leftHip[0], leftHip[1]);
  ctx.lineTo(rightHip[0], rightHip[1]);
  ctx.lineTo(rightShoulder[0] + 20, 185);
  ctx.lineTo(rightShoulder[0] + 45, 160);
  ctx.lineTo(rightShoulder[0], rightShoulder[1]);
  ctx.lineTo(W / 2 + 25, 40);
  ctx.closePath();
  ctx.fill();

  // Lapels (collar notch)
  ctx.fillStyle = hexToRgba('#ffffff', 0.15);
  ctx.beginPath();
  ctx.moveTo(W / 2 - 25, 40);
  ctx.lineTo(W / 2 - 15, 110);
  ctx.lineTo(W / 2, 95);
  ctx.lineTo(W / 2 + 15, 110);
  ctx.lineTo(W / 2 + 25, 40);
  ctx.closePath();
  ctx.fill();

  // Gradient
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(leftShoulder[0], leftShoulder[1]);
  ctx.lineTo(leftHip[0], leftHip[1]);
  ctx.lineTo(rightHip[0], rightHip[1]);
  ctx.lineTo(rightShoulder[0], rightShoulder[1]);
  ctx.closePath();
  ctx.fill();

  return { leftShoulder, rightShoulder, leftHip, rightHip };
}

function drawPants(ctx: CanvasRenderingContext2D, color: string): ControlPoints {
  const leftHip: [number, number] = [60, 30];
  const rightHip: [number, number] = [240, 30];
  const leftKnee: [number, number] = [70, 200];
  const rightKnee: [number, number] = [230, 200];
  const leftAnkle: [number, number] = [65, 380];
  const rightAnkle: [number, number] = [235, 380];

  ctx.fillStyle = color;

  // Left leg
  ctx.beginPath();
  ctx.moveTo(leftHip[0], leftHip[1]);
  ctx.lineTo(W / 2 - 10, 130); // Crotch
  ctx.lineTo(leftKnee[0] - 10, leftKnee[1]);
  ctx.lineTo(leftAnkle[0] - 15, leftAnkle[1]);
  ctx.lineTo(leftAnkle[0] + 35, leftAnkle[1]);
  ctx.lineTo(leftKnee[0] + 30, leftKnee[1]);
  ctx.lineTo(W / 2 - 10, 130);
  ctx.lineTo(W / 2 + 10, 130);
  ctx.lineTo(rightKnee[0] - 30, rightKnee[1]);
  ctx.lineTo(rightAnkle[0] - 35, rightAnkle[1]);
  ctx.lineTo(rightAnkle[0] + 15, rightAnkle[1]);
  ctx.lineTo(rightKnee[0] + 10, rightKnee[1]);
  ctx.lineTo(W / 2 + 10, 130);
  ctx.lineTo(rightHip[0], rightHip[1]);
  ctx.lineTo(leftHip[0], leftHip[1]);
  ctx.closePath();
  ctx.fill();

  // Waistband
  ctx.fillStyle = hexToRgba(color, 0.7);
  ctx.fillRect(leftHip[0], leftHip[1], rightHip[0] - leftHip[0], 20);

  // Gradient for depth
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
  gradient.addColorStop(0.5, 'rgba(0,0,0,0.05)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(leftHip[0], leftHip[1]);
  ctx.lineTo(rightHip[0], rightHip[1]);
  ctx.lineTo(rightAnkle[0] + 15, rightAnkle[1]);
  ctx.lineTo(leftAnkle[0] - 15, leftAnkle[1]);
  ctx.closePath();
  ctx.fill();

  return { leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle };
}

function drawShorts(ctx: CanvasRenderingContext2D, color: string): ControlPoints {
  const leftHip: [number, number] = [60, 30];
  const rightHip: [number, number] = [240, 30];
  const leftKnee: [number, number] = [65, 220];
  const rightKnee: [number, number] = [235, 220];

  ctx.fillStyle = color;

  // Shorts body
  ctx.beginPath();
  ctx.moveTo(leftHip[0], leftHip[1]);
  ctx.lineTo(W / 2 - 10, 140);
  ctx.lineTo(leftKnee[0] - 5, leftKnee[1]);
  ctx.lineTo(leftKnee[0] + 40, leftKnee[1]);
  ctx.lineTo(W / 2 - 8, 142);
  ctx.lineTo(W / 2 + 8, 142);
  ctx.lineTo(rightKnee[0] - 40, rightKnee[1]);
  ctx.lineTo(rightKnee[0] + 5, rightKnee[1]);
  ctx.lineTo(W / 2 + 10, 140);
  ctx.lineTo(rightHip[0], rightHip[1]);
  ctx.closePath();
  ctx.fill();

  // Waistband
  ctx.fillStyle = hexToRgba(color, 0.7);
  ctx.fillRect(leftHip[0], leftHip[1], rightHip[0] - leftHip[0], 18);

  return { leftHip, rightHip, leftKnee, rightKnee };
}

function drawDress(ctx: CanvasRenderingContext2D, color: string): ControlPoints {
  const neck: [number, number] = [W / 2, 35];
  const leftShoulder: [number, number] = [60, 60];
  const rightShoulder: [number, number] = [240, 60];
  const leftHip: [number, number] = [30, 270];
  const rightHip: [number, number] = [270, 270];
  const leftAnkle: [number, number] = [10, 390];
  const rightAnkle: [number, number] = [290, 390];

  ctx.fillStyle = color;

  // A-line dress
  ctx.beginPath();
  ctx.moveTo(neck[0] - 25, neck[1]);
  ctx.lineTo(leftShoulder[0], leftShoulder[1]);
  ctx.lineTo(leftHip[0], leftHip[1]);
  ctx.lineTo(leftAnkle[0], leftAnkle[1]);
  ctx.lineTo(rightAnkle[0], rightAnkle[1]);
  ctx.lineTo(rightHip[0], rightHip[1]);
  ctx.lineTo(rightShoulder[0], rightShoulder[1]);
  ctx.lineTo(neck[0] + 25, neck[1]);
  ctx.quadraticCurveTo(neck[0], neck[1] + 15, neck[0] - 25, neck[1]);
  ctx.closePath();
  ctx.fill();

  // Gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, 'rgba(255,255,255,0.15)');
  gradient.addColorStop(0.4, 'rgba(0,0,0,0.03)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.15)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(leftShoulder[0], leftShoulder[1]);
  ctx.lineTo(leftAnkle[0], leftAnkle[1]);
  ctx.lineTo(rightAnkle[0], rightAnkle[1]);
  ctx.lineTo(rightShoulder[0], rightShoulder[1]);
  ctx.closePath();
  ctx.fill();

  return { neck, leftShoulder, rightShoulder, leftHip, rightHip, leftAnkle, rightAnkle };
}

function drawSkirt(ctx: CanvasRenderingContext2D, color: string): ControlPoints {
  const leftHip: [number, number] = [70, 25];
  const rightHip: [number, number] = [230, 25];
  const leftAnkle: [number, number] = [20, 380];
  const rightAnkle: [number, number] = [280, 380];

  ctx.fillStyle = color;

  // A-line skirt
  ctx.beginPath();
  ctx.moveTo(leftHip[0], leftHip[1]);
  ctx.lineTo(leftAnkle[0], leftAnkle[1]);
  ctx.quadraticCurveTo(W / 2, leftAnkle[1] + 10, rightAnkle[0], rightAnkle[1]);
  ctx.lineTo(rightHip[0], rightHip[1]);
  ctx.closePath();
  ctx.fill();

  // Waistband
  ctx.fillStyle = hexToRgba(color, 0.75);
  ctx.fillRect(leftHip[0], leftHip[1], rightHip[0] - leftHip[0], 18);

  return { leftHip, rightHip, leftAnkle, rightAnkle };
}

function drawSuit(ctx: CanvasRenderingContext2D, color: string): ControlPoints {
  const leftShoulder: [number, number] = [35, 60];
  const rightShoulder: [number, number] = [265, 60];
  const leftHip: [number, number] = [25, 220];
  const rightHip: [number, number] = [275, 220];
  const leftAnkle: [number, number] = [50, 390];
  const rightAnkle: [number, number] = [250, 390];

  ctx.fillStyle = color;

  // Jacket top
  ctx.beginPath();
  ctx.moveTo(W / 2 - 22, 38);
  ctx.lineTo(leftShoulder[0], leftShoulder[1]);
  ctx.lineTo(leftShoulder[0] - 50, 165);
  ctx.lineTo(leftShoulder[0] - 22, 190);
  ctx.lineTo(leftHip[0], leftHip[1]);
  ctx.lineTo(rightHip[0], rightHip[1]);
  ctx.lineTo(rightShoulder[0] + 22, 190);
  ctx.lineTo(rightShoulder[0] + 50, 165);
  ctx.lineTo(rightShoulder[0], rightShoulder[1]);
  ctx.lineTo(W / 2 + 22, 38);
  ctx.closePath();
  ctx.fill();

  // Pants
  ctx.beginPath();
  ctx.moveTo(leftHip[0], leftHip[1]);
  ctx.lineTo(W / 2 - 12, 290);
  ctx.lineTo(leftAnkle[0] - 10, leftAnkle[1]);
  ctx.lineTo(leftAnkle[0] + 40, leftAnkle[1]);
  ctx.lineTo(W / 2 - 10, 292);
  ctx.lineTo(W / 2 + 10, 292);
  ctx.lineTo(rightAnkle[0] - 40, rightAnkle[1]);
  ctx.lineTo(rightAnkle[0] + 10, rightAnkle[1]);
  ctx.lineTo(W / 2 + 12, 290);
  ctx.lineTo(rightHip[0], rightHip[1]);
  ctx.closePath();
  ctx.fill();

  // White shirt/tie area
  ctx.fillStyle = 'rgba(240,240,245,0.9)';
  ctx.beginPath();
  ctx.moveTo(W / 2 - 22, 38);
  ctx.lineTo(W / 2 - 8, 220);
  ctx.lineTo(W / 2 + 8, 220);
  ctx.lineTo(W / 2 + 22, 38);
  ctx.closePath();
  ctx.fill();

  // Tie
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.moveTo(W / 2 - 6, 55);
  ctx.lineTo(W / 2 - 10, 160);
  ctx.lineTo(W / 2, 175);
  ctx.lineTo(W / 2 + 10, 160);
  ctx.lineTo(W / 2 + 6, 55);
  ctx.closePath();
  ctx.fill();

  return {
    leftShoulder,
    rightShoulder,
    leftHip,
    rightHip,
    leftAnkle,
    rightAnkle,
  };
}

// --- Outfit definitions ---
const OUTFITS: Array<{
  id: string;
  name: string;
  category: 'TOP' | 'BOTTOM' | 'FULL_OUTFIT' | 'DRESS' | 'OUTERWEAR' | 'ACCESSORIES';
  color: string;
  description: string;
  zLayer: number;
  drawFn: (ctx: CanvasRenderingContext2D, color: string) => ControlPoints;
}> = [
  { id: 'tshirt-blue', name: 'Classic Blue T-Shirt', category: 'TOP', color: '#3498db', description: 'Casual everyday tee', zLayer: 1, drawFn: drawTShirt },
  { id: 'tshirt-red', name: 'Bold Red T-Shirt', category: 'TOP', color: '#e74c3c', description: 'Vibrant red crew neck', zLayer: 1, drawFn: drawTShirt },
  { id: 'tshirt-white', name: 'White Essential Tee', category: 'TOP', color: '#ecf0f1', description: 'Clean white basic', zLayer: 1, drawFn: drawTShirt },
  { id: 'hoodie-gray', name: 'Gray Hoodie', category: 'TOP', color: '#7f8c8d', description: 'Cozy everyday hoodie', zLayer: 1, drawFn: drawHoodie },
  { id: 'hoodie-purple', name: 'Purple Hoodie', category: 'TOP', color: '#6C5CE7', description: 'Stylish purple hoodie', zLayer: 1, drawFn: drawHoodie },
  { id: 'jacket-black', name: 'Black Jacket', category: 'OUTERWEAR', color: '#2c3e50', description: 'Classic black jacket', zLayer: 2, drawFn: drawJacket },
  { id: 'jacket-navy', name: 'Navy Blazer', category: 'OUTERWEAR', color: '#1a252f', description: 'Smart casual blazer', zLayer: 2, drawFn: drawJacket },
  { id: 'pants-black', name: 'Black Trousers', category: 'BOTTOM', color: '#2c3e50', description: 'Slim-fit black pants', zLayer: 0, drawFn: drawPants },
  { id: 'pants-blue', name: 'Blue Jeans', category: 'BOTTOM', color: '#2980b9', description: 'Classic blue denim', zLayer: 0, drawFn: drawPants },
  { id: 'shorts-khaki', name: 'Khaki Shorts', category: 'BOTTOM', color: '#c9a96e', description: 'Casual summer shorts', zLayer: 0, drawFn: drawShorts },
  { id: 'dress-red', name: 'Red Evening Dress', category: 'DRESS', color: '#c0392b', description: 'Elegant A-line dress', zLayer: 1, drawFn: drawDress },
  { id: 'dress-navy', name: 'Navy Midi Dress', category: 'DRESS', color: '#1a3a5c', description: 'Versatile midi length', zLayer: 1, drawFn: drawDress },
  { id: 'skirt-pink', name: 'Pink Mini Skirt', category: 'BOTTOM', color: '#e91e8c', description: 'Flirty mini skirt', zLayer: 0, drawFn: drawSkirt },
  { id: 'suit-charcoal', name: 'Charcoal Suit', category: 'FULL_OUTFIT', color: '#2d3436', description: 'Professional charcoal suit', zLayer: 1, drawFn: drawSuit },
];

function generateOutfit(outfit: typeof OUTFITS[0]): OutfitMeta {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;

  // Transparent background (default for canvas is transparent)
  ctx.clearRect(0, 0, W, H);

  const controlPoints = outfit.drawFn(ctx, outfit.color);

  // Save PNG
  const pngPath = path.join(OUTPUT_DIR, `${outfit.id}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(pngPath, buffer);
  console.log(`Generated: ${outfit.id}.png`);

  // Build metadata
  const meta: OutfitMeta = {
    id: outfit.id,
    name: outfit.name,
    category: outfit.category,
    type: outfit.category.toLowerCase(),
    colorHex: outfit.color,
    description: outfit.description,
    controlPoints,
    zLayer: outfit.zLayer,
    referenceWidth: W,
    referenceHeight: H,
  };

  // Save JSON sidecar
  const jsonPath = path.join(OUTPUT_DIR, `${outfit.id}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(meta, null, 2));
  console.log(`Generated: ${outfit.id}.json`);

  return meta;
}

// Generate all outfits
console.log('Generating placeholder outfit assets...');
const metas: OutfitMeta[] = [];
for (const outfit of OUTFITS) {
  const meta = generateOutfit(outfit);
  metas.push(meta);
}

// Save combined manifest
const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(metas, null, 2));
console.log(`\nGenerated ${metas.length} outfit assets in ${OUTPUT_DIR}`);
console.log(`Combined manifest saved to ${manifestPath}`);
