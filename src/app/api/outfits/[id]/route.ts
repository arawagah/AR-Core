import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const outfit = await prisma.outfit.findUnique({
      where: { id: params.id },
    });

    if (!outfit) {
      return NextResponse.json({ error: 'Outfit not found' }, { status: 404 });
    }

    return NextResponse.json({ outfit });
  } catch (error) {
    console.error(`GET /api/outfits/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch outfit' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const outfit = await prisma.outfit.findUnique({
      where: { id: params.id },
    });

    if (!outfit) {
      return NextResponse.json({ error: 'Outfit not found' }, { status: 404 });
    }

    await prisma.outfit.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/outfits/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete outfit' },
      { status: 500 }
    );
  }
}
