import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { validateEmailDeliverability, generateClinicalSoapNote } from '@/lib/scribe-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const agreedToBaa = Boolean(body.agreedToBaa);

    const emailCheck = validateEmailDeliverability(email);
    if (emailCheck.result !== 'deliverable' || emailCheck.is_disposable_address) {
      return NextResponse.json(
        { error: 'Please provide a valid email address when signing up.', validation: emailCheck },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (!agreedToBaa) {
      return NextResponse.json(
        { error: "Please agree to the terms of Freed's privacy policy, terms of use, and BAA." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: body.firstName || '',
        lastName: body.lastName || '',
        clinicalTitle: body.clinicalTitle || 'MD',
        specialty: body.specialty || 'Family Medicine',
        agreedToBaa: true,
        onboardingCompleted: false,
        planTier: 'premier',
        billingCycle: 'monthly',
        trialEndsAt,
        totalSeats: 1,
      },
    });

    // Provision default templates ("Returning Patient" and "New Patient")
    const defaultSoap = generateClinicalSoapNote({
      patientName: 'John Smith',
      pronouns: 'He/Him',
      visitMode: 'in-person',
      transcript: '65M w/ CAD s/p LAD stent, HTN, HLD, T2DM routine 6-month follow-up.',
      clinicianSignature: 'Clinician, MD',
    });

    const returningTmpl = await prisma.template.create({
      data: {
        userId: user.id,
        name: 'Returning Patient',
        description: 'Comprehensive internal/family medicine follow-up note',
        templateType: 'canonical',
        source: 'User',
        isFavorite: true,
        isDefault: true,
        autoLearnEnabled: true,
        contentJson: JSON.stringify({
          hpi: defaultSoap.hpi,
          objective: defaultSoap.objective,
          anp: defaultSoap.anp,
          instructions: defaultSoap.instructions,
        }),
      },
    });

    await prisma.template.create({
      data: {
        userId: user.id,
        name: 'New Patient',
        description: 'Comprehensive initial intake note for a new patient',
        templateType: 'canonical',
        source: 'User',
        isFavorite: true,
        isDefault: false,
        autoLearnEnabled: true,
        contentJson: JSON.stringify({
          hpi: defaultSoap.hpi,
          objective: defaultSoap.objective,
          anp: defaultSoap.anp,
          instructions: defaultSoap.instructions,
        }),
      },
    });

    // Provision starter Dot-Phrases
    await prisma.dotPhrase.createMany({
      data: [
        {
          userId: user.id,
          shortcut: 'pe',
          content: 'General: Alert, oriented, in no acute distress.\nCardiovascular: Regular rate and rhythm, normal S1/S2.\nRespiratory: Clear to auscultation bilaterally.',
          visibility: 'personal',
        },
        {
          userId: user.id,
          shortcut: 'ros',
          content: 'A 10-point Review of Systems was completed and is negative except as documented in the HPI above.',
          visibility: 'personal',
        },
      ],
    });

    // Provision John Smith demo visit (`generate_example_visits_aiux` parity)
    const demoVisit = await prisma.visit.create({
      data: {
        userId: user.id,
        patientName: 'John Smith',
        pronouns: 'He/Him',
        visitMode: 'in-person',
        status: 'completed',
        durationSeconds: 118,
        isDemo: true,
        templateId: returningTmpl.id,
        templateName: 'Returning Patient',
        preChartNotes: '65M w/ CAD s/p LAD stent (2020), HTN, HLD, T2DM on Ozempic 1mg + Metformin.',
        transcript: `[00:00] Clinician: Good morning, John! Welcome back for your 6-month checkup.\n[00:10] John Smith: Feeling well overall. No chest pain or palpitations. Home BPs running 130s/80s.\n[00:30] Clinician: BP today is 132/78, LDL 85, HbA1c 6.9%. We will increase lisinopril to 30 mg daily and order an exercise stress test.`,
        oneLiner: defaultSoap.oneLiner,
        hpi: defaultSoap.hpi,
        objective: defaultSoap.objective,
        anp: defaultSoap.anp,
        instructions: defaultSoap.instructions,
        codingJson: defaultSoap.codingJson,
        lettersJson: defaultSoap.lettersJson,
      },
    });

    // Provision initial team seat & trial invoice
    await prisma.teamMember.create({
      data: {
        ownerId: user.id,
        name: email.split('@')[0],
        email: user.email,
        role: 'Admin',
        status: 'Active',
        daysLeftInTrial: 7,
      },
    });

    await prisma.billingInvoice.create({
      data: {
        userId: user.id,
        planTier: 'premier',
        billingCycle: 'monthly',
        seats: 1,
        amountCents: 0,
        status: 'trial',
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
      },
      demoVisitId: demoVisit.id,
      redirectUrl: '/onboarding-personalization',
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
