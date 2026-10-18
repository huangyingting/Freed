import { NextRequest, NextResponse } from 'next/server';
import { validateEmailDeliverability } from '@/lib/scribe-engine';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email') || '';
  const validation = validateEmailDeliverability(email);
  return NextResponse.json({
    ...validation,
    valid: validation.result === 'deliverable',
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = body.email || '';
  const validation = validateEmailDeliverability(email);
  return NextResponse.json({
    ...validation,
    valid: validation.result === 'deliverable',
    reason:
      validation.result === 'deliverable'
        ? undefined
        : 'Please enter a valid non-disposable clinician email address.',
  });
}
