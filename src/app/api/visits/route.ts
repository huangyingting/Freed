import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateClinicalSoapNote } from '@/lib/scribe-engine';

export async function GET(req: NextRequest) {
  let user = await getAuthenticatedUser();
  if (!user) {
    user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  }
  if (!user) {
    return NextResponse.json({ visits: [] });
  }

  const filter = req.nextUrl.searchParams.get('filter') || 'active'; // active | trash | all
  const q = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();
  const dateFilter = req.nextUrl.searchParams.get('date') || 'all'; // all | today | week

  const allVisits = await prisma.visit.findMany({
    where: { userId: user.id },
    orderBy: { visitDate: 'desc' },
    include: {
      evidenceMessages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  const filtered = allVisits.filter((v) => {
    if (filter === 'trash' && v.status !== 'trash') return false;
    if (filter === 'active' && v.status === 'trash') return false;
    if (q) {
      const hay = `${v.patientName} ${v.oneLiner} ${v.hpi} ${v.templateName}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (dateFilter === 'today') {
      const todayStr = new Date().toDateString();
      if (new Date(v.visitDate).toDateString() !== todayStr) return false;
    } else if (dateFilter === 'week') {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (new Date(v.visitDate).getTime() < sevenDaysAgo) return false;
    }
    return true;
  });

  return NextResponse.json({ visits: filtered });
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
  const patientName = body.patientName?.trim() || 'Untitled Patient';
  const pronouns = body.pronouns || 'He/Him';
  const visitMode = body.visitMode || body.visitType || 'in-person';
  const preChartNotes = body.preChartNotes || body.contextNotes || '';
  const transcript = body.transcript || '';
  const templateName = body.templateName || 'Returning Patient';

  const generated = generateClinicalSoapNote({
    patientName,
    pronouns,
    visitMode,
    preChartNotes,
    transcript,
    templateName,
    specialty: user.specialty || 'Family Medicine',
    clinicianSignature: `Dr. ${user.firstName || 'Alex'} ${user.lastName || 'Rivera'}, ${user.clinicalTitle || 'MD'}`,
  });

  const visit = await prisma.visit.create({
    data: {
      userId: user.id,
      patientName,
      pronouns,
      visitMode,
      status: body.status || 'completed',
      durationSeconds: body.durationSeconds || 95,
      templateId: body.templateId || null,
      templateName,
      preChartNotes,
      transcript,
      oneLiner: generated.oneLiner,
      hpi: generated.hpi,
      objective: generated.objective,
      anp: generated.anp,
      instructions: generated.instructions,
      codingJson: generated.codingJson,
      lettersJson: generated.lettersJson,
      ehrTarget: user.profileEhrType || 'athenahealth',
    },
    include: {
      evidenceMessages: true,
    },
  });

  return NextResponse.json({ visit });
}
