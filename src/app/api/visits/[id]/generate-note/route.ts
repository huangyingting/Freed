import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { generateClinicalSoapNote } from '@/lib/scribe-engine';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));

  const existing = await prisma.visit.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
  }

  let user = await getAuthenticatedUser();
  if (!user) {
    user = await prisma.user.findUnique({ where: { id: existing.userId } });
  }

  const patientName = body.patientName || existing.patientName || 'Patient';
  const pronouns = body.pronouns ?? existing.pronouns ?? '';
  const visitMode = body.visitMode || existing.visitMode || 'in-person';
  const preChartNotes = body.preChartNotes ?? existing.preChartNotes ?? '';
  const transcript = body.transcript ?? existing.transcript ?? '';
  const templateName = body.templateName || existing.templateName || 'Returning Patient';
  const durationSeconds = typeof body.durationSeconds === 'number' ? body.durationSeconds : existing.durationSeconds || 95;

  const signature = user
    ? `Dr. ${user.firstName || 'Alex'} ${user.lastName || 'Rivera'}, ${user.clinicalTitle || 'MD'}`
    : 'Dr. Alex Rivera, MD';

  const generated = generateClinicalSoapNote({
    patientName,
    pronouns,
    visitMode,
    preChartNotes,
    transcript,
    templateName,
    specialty: user?.specialty || 'Family Medicine',
    clinicianSignature: signature,
  });

  const updated = await prisma.visit.update({
    where: { id },
    data: {
      patientName,
      pronouns,
      visitMode,
      preChartNotes,
      transcript,
      templateName,
      durationSeconds,
      status: 'completed',
      oneLiner: generated.oneLiner,
      hpi: generated.hpi,
      objective: generated.objective,
      anp: generated.anp,
      instructions: generated.instructions,
      codingJson: generated.codingJson,
      lettersJson: generated.lettersJson,
    },
    include: {
      evidenceMessages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return NextResponse.json({ visit: updated });
}
