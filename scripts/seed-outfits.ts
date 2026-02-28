/**
 * Seeds the database with outfit metadata from the generated manifest.
 * Run after generate-placeholders.ts.
 * Idempotent: skips seeding if outfits already exist.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

  const existing = await prisma.outfit.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} outfits — skipping seed.`);
    return;
  }

  const outfits: OutfitMeta[] = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  console.log(`Seeding ${outfits.length} outfits...`);

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
    await pool.end();
  });
