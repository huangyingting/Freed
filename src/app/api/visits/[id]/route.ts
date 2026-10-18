import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const visit = await prisma.visit.findUnique({
    where: { id },
    include: {
      evidenceMessages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
  }
  if (visit.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ visit });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.visit.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
  }
  if (existing.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();

  const allowedFields = [
    'patientName',
    'pronouns',
    'visitMode',
    'status',
    'durationSeconds',
    'templateId',
    'templateName',
    'preChartNotes',
    'transcript',
    'oneLiner',
    'hpi',
    'objective',
    'anp',
    'instructions',
    'instructionsLang',
    'codingJson',
    'lettersJson',
    'ehrPushStatus',
    'ehrTarget',
  ];

  const data: Record<string, any> = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      data[key] = body[key];
    }
  }

  const visit = await prisma.visit.update({
    where: { id },
    data,
    include: {
      evidenceMessages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return NextResponse.json({ visit });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.visit.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
  }
  if (existing.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const permanent = req.nextUrl.searchParams.get('permanent') === 'true';

  if (permanent) {
    await prisma.visit.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted: true });
  }

  const visit = await prisma.visit.update({
    where: { id },
    data: { status: 'trash' },
  });

  return NextResponse.json({ success: true, visit });
}
