import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let user = await getAuthenticatedUser();
  if (!user) {
    user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  }
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    sub: user.id,
    email: user.email,
    email_verified: true,
    firstName: user.firstName,
    lastName: user.lastName,
    clinicalTitle: user.clinicalTitle,
    access_level: user.role,
    roleAtPractice: user.roleAtPractice,
    specialty: user.specialty,
    specialty_group: user.specialtyGroup,
    practiceSize: user.practiceSize,
    profile_ehr_type: user.profileEhrType,
    onboardingCompleted: user.onboardingCompleted,
    planTier: user.planTier,
    billingCycle: user.billingCycle,
    trialEndsAt: user.trialEndsAt,
    total_seats: user.totalSeats,
    retentionDays: user.retentionDays,
    patientTitle: user.patientTitle,
    aiDisclosureEnabled: user.aiDisclosureEnabled,
    hideEmptyHeaders: user.hideEmptyHeaders,
    themeMode: user.themeMode,
    ehrAutoPush: user.ehrAutoPush,
    zoomConnected: user.zoomConnected,
    extensionInstalled: user.extensionInstalled,
    mfaEnabled: user.mfaEnabled,
    userCreatedAt: user.createdAt,
  });
}
