import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      service: 'freed-ai-medical-scribe',
      version: '1.0.0',
      database: 'connected',
      aiEngine: process.env.OPENAI_API_KEY
        ? 'openai_live_with_clinical_fallback'
        : 'deterministic_clinical_engine',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'degraded',
        database: 'disconnected',
        error: err?.message || 'Database health check failed',
      },
      { status: 503 }
    );
  }
}
