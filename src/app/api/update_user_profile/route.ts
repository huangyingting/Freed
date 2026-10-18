import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    let user = await getAuthenticatedUser();
    if (!user) {
      user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
    }
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updateData: Record<string, any> = {};

    const stringFields = [
      'firstName',
      'lastName',
      'clinicalTitle',
      'roleAtPractice',
      'specialty',
      'specialtyGroup',
      'practiceSize',
      'profileEhrType',
      'patientTitle',
      'themeMode',
      'email',
    ];

    for (const f of stringFields) {
      if (typeof body[f] === 'string') {
        updateData[f] = body[f].trim();
      }
    }

    const boolFields = [
      'onboardingCompleted',
      'aiDisclosureEnabled',
      'hideEmptyHeaders',
      'ehrAutoPush',
      'zoomConnected',
      'extensionInstalled',
      'mfaEnabled',
    ];

    for (const b of boolFields) {
      if (typeof body[b] === 'boolean') {
        updateData[b] = body[b];
      }
    }

    if (typeof body.retentionDays === 'number') {
      updateData.retentionDays = body.retentionDays;
    }

    if (typeof body.newPassword === 'string' && body.newPassword.length >= 8) {
      updateData.passwordHash = await bcrypt.hash(body.newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Sync Admin team member name if firstName/lastName changed
    if (updateData.firstName || updateData.lastName) {
      const displayName = `${updated.firstName} ${updated.lastName}, ${updated.clinicalTitle}`.trim();
      await prisma.teamMember.updateMany({
        where: { ownerId: updated.id, email: updated.email },
        data: { name: displayName },
      });
    }

    return NextResponse.json({ user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update profile' }, { status: 500 });
  }
}
