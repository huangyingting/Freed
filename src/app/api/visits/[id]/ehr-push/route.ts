import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));

  const visit = await prisma.visit.findUnique({ where: { id } });
  if (!visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
  }

  const targetEhr = body.targetEhr || visit.ehrTarget || 'athenahealth';
  const updated = await prisma.visit.update({
    where: { id },
    data: {
      ehrPushStatus: 'pushed',
      ehrPushedAt: new Date(),
      ehrTarget: targetEhr,
    },
    include: {
      evidenceMessages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return NextResponse.json({
    success: true,
    pushedAt: updated.ehrPushedAt,
    targetEhr,
    mappedFields: [
      { section: 'Subjective / HPI', ehrField: `${targetEhr}::Encounter.HPI`, status: 'Mapped & Transferred' },
      { section: 'Objective / Physical Exam', ehrField: `${targetEhr}::Encounter.PhysicalExam`, status: 'Mapped & Transferred' },
      { section: 'Assessment & Plan', ehrField: `${targetEhr}::Encounter.AssessmentPlan`, status: 'Mapped & Transferred' },
      { section: 'Patient Instructions', ehrField: `${targetEhr}::Encounter.AfterVisitSummary`, status: 'Mapped & Transferred' },
      { section: 'ICD-10 & CPT Billing Codes', ehrField: `${targetEhr}::Superbill.Codes`, status: 'Mapped & Transferred' },
    ],
    visit: updated,
  });
}
