import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.dotPhrase.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'DotPhrase not found' }, { status: 404 });
  }
  if (existing.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();

  const data: Record<string, any> = {};
  if (typeof body.shortcut === 'string') {
    data.shortcut = body.shortcut.replace(/^\/+/, '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  }
  if (typeof body.content === 'string') data.content = body.content.trim();
  if (typeof body.visibility === 'string') data.visibility = body.visibility;

  const dotPhrase = await prisma.dotPhrase.update({
    where: { id },
    data,
  });

  return NextResponse.json({ dotPhrase });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.dotPhrase.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'DotPhrase not found' }, { status: 404 });
  }
  if (existing.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.dotPhrase.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
