import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { learnTemplateFromSampleNote } from '@/lib/scribe-engine';

export async function GET() {
  let user = await getAuthenticatedUser();
  if (!user) {
    user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  }

  const userTemplates = user
    ? await prisma.template.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      })
    : [];

  const freedTemplates = await prisma.template.findMany({
    where: { source: 'Freed' },
    orderBy: { name: 'asc' },
  });

  const dotPhrases = user
    ? await prisma.dotPhrase.findMany({
        where: { userId: user.id },
        orderBy: { shortcut: 'asc' },
      })
    : [];

  return NextResponse.json({
    userTemplates,
    freedTemplates,
    dotPhrases,
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

  // Case 1: Duplicate from Freed Library
  if (body.duplicateFromId) {
    const sourceTmpl = await prisma.template.findUnique({
      where: { id: body.duplicateFromId },
    });
    if (!sourceTmpl) {
      return NextResponse.json({ error: 'Source template not found' }, { status: 404 });
    }
    const copy = await prisma.template.create({
      data: {
        userId: user.id,
        name: body.name || `${sourceTmpl.name} (My Copy)`,
        description: sourceTmpl.description,
        templateType: sourceTmpl.templateType,
        specialty: sourceTmpl.specialty || user.specialty,
        specialtyGroup: sourceTmpl.specialtyGroup || user.specialtyGroup,
        source: 'User',
        isFavorite: true,
        isDefault: false,
        autoLearnEnabled: true,
        contentJson: sourceTmpl.contentJson,
      },
    });
    return NextResponse.json({ template: copy });
  }

  // Case 2: Teach Freed your note style (sampleNoteText provided)
  let contentObj = body.content || {};
  if (body.sampleNoteText) {
    contentObj = learnTemplateFromSampleNote({
      name: body.name || 'Custom Learned Template',
      specialty: body.specialty || user.specialty,
      sampleNoteText: body.sampleNoteText,
    });
  }

  const created = await prisma.template.create({
    data: {
      userId: user.id,
      name: (body.name || 'Custom Note Template').trim(),
      description: body.description || `Personalized ${user.specialty} template`,
      templateType: body.templateType || 'canonical',
      specialty: body.specialty || user.specialty,
      specialtyGroup: user.specialtyGroup,
      source: 'User',
      isFavorite: Boolean(body.isFavorite ?? true),
      isDefault: Boolean(body.isDefault ?? false),
      autoLearnEnabled: Boolean(body.autoLearnEnabled ?? true),
      contentJson: typeof contentObj === 'string' ? contentObj : JSON.stringify(contentObj),
    },
  });

  return NextResponse.json({ template: created });
}
