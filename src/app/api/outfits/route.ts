import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Category } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const outfits = await prisma.outfit.findMany({
      where: category && category !== 'ALL'
        ? { category: category as Category }
        : undefined,
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ outfits });
  } catch (error) {
    console.error('GET /api/outfits error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outfits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name: string;
      category: Category;
      assetPath: string;
      thumbnailPath?: string;
      controlData: Record<string, unknown>;
      zLayer?: number;
      colorHex?: string;
      description?: string;
    };

    const { name, category, assetPath, thumbnailPath, controlData, zLayer, colorHex, description } = body;

    if (!name || !category || !assetPath || !controlData) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, assetPath, controlData' },
        { status: 400 }
      );
    }

    const outfit = await prisma.outfit.create({
      data: {
        name,
        category,
        assetPath,
        thumbnailPath,
        controlData: controlData as object,
        zLayer: zLayer ?? 1,
        colorHex,
        description,
      },
    });

    return NextResponse.json({ outfit }, { status: 201 });
  } catch (error) {
    console.error('POST /api/outfits error:', error);
    return NextResponse.json(
      { error: 'Failed to create outfit' },
      { status: 500 }
    );
  }
}
