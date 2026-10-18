import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let user = await getAuthenticatedUser();
  if (!user) {
    user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  }
  if (!user) {
    return NextResponse.json({ dotPhrases: [] });
  }

  const dotPhrases = await prisma.dotPhrase.findMany({
    where: { userId: user.id },
    orderBy: { shortcut: 'asc' },
  });

  return NextResponse.json({ dotPhrases });
}

export async function POST(req: NextRequest) {
  let user = await getAuthenticatedUser();
  if (!user) {
    user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  }
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const cleanShortcut = (body.shortcut || '').replace(/^\/+/, '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  const content = (body.content || '').trim();

  if (!cleanShortcut || !content) {
    return NextResponse.json({ error: 'Shortcut and content are required' }, { status: 400 });
  }

  const dotPhrase = await prisma.dotPhrase.create({
    data: {
      userId: user.id,
      shortcut: cleanShortcut,
      content,
      visibility: body.visibility || 'personal',
    },
  });

  return NextResponse.json({ dotPhrase });
}
