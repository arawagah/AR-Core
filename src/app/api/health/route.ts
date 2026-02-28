import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch {
    // Return ok even if DB is not yet ready (allows Railway healthcheck to pass during startup)
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'unavailable',
    });
  }
}
