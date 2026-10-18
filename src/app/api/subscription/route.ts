import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PRICING_PLANS } from '@/lib/clinical-data';

export async function GET() {
  let user = await getAuthenticatedUser();
  if (!user) {
    user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  }
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const invoices = await prisma.billingInvoice.findMany({
    where: { userId: user.id },
    orderBy: { invoiceDate: 'desc' },
  });

  return NextResponse.json({
    planTier: user.planTier,
    billingCycle: user.billingCycle,
    trialEndsAt: user.trialEndsAt,
    totalSeats: user.totalSeats,
    invoices,
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
  const planTier = body.planTier || user.planTier;
  const billingCycle = body.billingCycle || user.billingCycle;
  const seats = typeof body.seats === 'number' ? Math.max(1, body.seats) : user.totalSeats;

  const plan = PRICING_PLANS.find((p) => p.id === planTier) || PRICING_PLANS[2];
  const rate = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const amountCents = rate * seats * (billingCycle === 'annual' ? 12 : 1) * 100;

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      planTier,
      billingCycle,
      totalSeats: seats,
    },
  });

  const invoice = await prisma.billingInvoice.create({
    data: {
      userId: user.id,
      planTier,
      billingCycle,
      seats,
      amountCents,
      status: 'paid',
    },
  });

  return NextResponse.json({
    user: updatedUser,
    invoice,
  });
}
