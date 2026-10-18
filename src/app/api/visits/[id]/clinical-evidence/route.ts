import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { answerClinicalEvidenceOrMagicEdit } from '@/lib/scribe-engine';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();
  const query = (body.query || '').trim();
  const mode = body.mode === 'magic_edit' ? 'magic_edit' : 'evidence';

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const visit = await prisma.visit.findUnique({ where: { id } });
  if (!visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
  }

  await prisma.evidenceMessage.create({
    data: {
      visitId: id,
      role: 'user',
      mode,
      content: query,
      citationsJson: '[]',
    },
  });

  const result = answerClinicalEvidenceOrMagicEdit({
    query,
    mode,
    visit: {
      patientName: visit.patientName,
      hpi: visit.hpi,
      objective: visit.objective,
      anp: visit.anp,
      instructions: visit.instructions,
    },
  });

  const assistantMsg = await prisma.evidenceMessage.create({
    data: {
      visitId: id,
      role: 'assistant',
      mode,
      content: result.reply,
      citationsJson: JSON.stringify(result.citations || []),
    },
  });

  if (result.updatedFields && Object.keys(result.updatedFields).length > 0) {
    await prisma.visit.update({
      where: { id },
      data: result.updatedFields,
    });
  }

  const updatedVisit = await prisma.visit.findUnique({
    where: { id },
    include: {
      evidenceMessages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return NextResponse.json({
    message: assistantMsg,
    visit: updatedVisit,
  });
}
