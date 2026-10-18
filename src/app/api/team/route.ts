import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let user = await getAuthenticatedUser();
  if (!user) {
    user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  }
  if (!user) {
    return NextResponse.json({ members: [], totalSeats: 1, usedSeats: 0 });
  }

  const members = await prisma.teamMember.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({
    members,
    totalSeats: Math.max(user.totalSeats, members.length),
    usedSeats: members.length,
  });
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

  if (body.action === 'remove' && body.memberId) {
    await prisma.teamMember.delete({ where: { id: body.memberId } });
    return NextResponse.json({ success: true });
  }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const role = body.role || 'Clinician';

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  const member = await prisma.teamMember.create({
    data: {
      ownerId: user.id,
      name,
      email,
      role,
      status: 'Active',
      daysLeftInTrial: 7,
    },
  });

  return NextResponse.json({ member });
}
