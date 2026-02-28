/**
 * Seeds the database with outfit metadata from the generated manifest.
 * Run after generate-placeholders.ts.
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface OutfitMeta {
  id: string;
  name: string;
  category: 'TOP' | 'BOTTOM' | 'FULL_OUTFIT' | 'DRESS' | 'OUTERWEAR' | 'ACCESSORIES';
  colorHex: string;
  description: string;
  controlPoints: Record<string, [number, number]>;
  zLayer: number;
  referenceWidth: number;
  referenceHeight: number;
}

async function seed() {
  const manifestPath = path.join(process.cwd(), 'public', 'assets', 'outfits', 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error('Manifest not found. Run generate-placeholders.ts first.');
    process.exit(1);
  }

  const outfits: OutfitMeta[] = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  console.log(`Seeding ${outfits.length} outfits...`);

  // Clear existing outfits
  await prisma.outfit.deleteMany();

  for (const outfit of outfits) {
    const controlData = {
      id: outfit.id,
      type: outfit.category.toLowerCase(),
      controlPoints: outfit.controlPoints,
      zLayer: outfit.zLayer,
      referenceWidth: outfit.referenceWidth,
      referenceHeight: outfit.referenceHeight,
    };

    await prisma.outfit.create({
      data: {
        name: outfit.name,
        category: outfit.category,
        assetPath: `/assets/outfits/${outfit.id}.png`,
        thumbnailPath: `/assets/outfits/${outfit.id}.png`,
        controlData: controlData,
        zLayer: outfit.zLayer,
        colorHex: outfit.colorHex,
        description: outfit.description,
      },
    });

    console.log(`Seeded: ${outfit.name}`);
  }

  console.log('\nDatabase seeded successfully!');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
