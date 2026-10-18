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

  const existing = await prisma.template.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }
  if (existing.userId && existing.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();

  const data: Record<string, any> = {};
  if (typeof body.name === 'string') data.name = body.name.trim();
  if (typeof body.description === 'string') data.description = body.description.trim();
  if (typeof body.templateType === 'string') data.templateType = body.templateType;
  if (typeof body.specialty === 'string') data.specialty = body.specialty;
  if (typeof body.isFavorite === 'boolean') data.isFavorite = body.isFavorite;
  if (typeof body.isDefault === 'boolean') data.isDefault = body.isDefault;
  if (typeof body.autoLearnEnabled === 'boolean') data.autoLearnEnabled = body.autoLearnEnabled;
  if (body.contentJson !== undefined) {
    data.contentJson = typeof body.contentJson === 'string' ? body.contentJson : JSON.stringify(body.contentJson);
  }

  const template = await prisma.template.update({
    where: { id },
    data,
  });

  return NextResponse.json({ template });
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

  const existing = await prisma.template.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }
  if (existing.userId && existing.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.template.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
