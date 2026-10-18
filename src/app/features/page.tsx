import React from 'react';
import Link from 'next/link';
import { PublicNavbar, PublicFooter } from '@/components/PublicChrome';
import {
  Sparkles,
  Wand2,
  FileText,
  Sliders,
  MailCheck,
  History,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function FeaturesPage() {
  const capabilities = [
    {
      title: 'Teach Freed Your Note Style',
      description:
        'Paste one historical note or edit a generated SOAP note—Freed automatically learns your preferred section formatting, bullet vs. paragraph structure, and clinical phrasing.',
      icon: Wand2,
      badge: 'Self-Learning AI',
    },
    {
      title: '142+ Specialty Templates',
      description:
        'Built-in canonical and structural templates for Internal Medicine, Cardiology, Pediatrics, Psychiatry, Orthopedics, OB/GYN, Emergency Medicine, and Allied Health.',
      icon: FileText,
      badge: 'Freed Library',
    },
    {
      title: 'Slash (/) Dot-Phrases & Macros',
      description:
        'Type /pe, /ros, /bp, or custom macros inside any note section to instantaneously insert multi-line physical exams, surgical consents, or return precautions.',
      icon: Sliders,
      badge: 'Instant Expansion',
    },
    {
      title: 'Natural-Language Magic Edit',
      description:
        'Instruct Freed in plain English: "Convert Assessment & Plan into a numbered problem-based list" or "Make HPI more concise" and watch the chart transform immediately.',
      icon: Sparkles,
      badge: 'AI Co-Pilot',
    },
    {
      title: 'Pre-Visit Context & Longitudinal Summaries',
      description:
        'Carry forward chronic problem lists, prior medications, and last-visit follow-up items before you walk into the exam room.',
      icon: History,
      badge: 'Pre-Charting',
    },
    {
      title: 'Referral Letters & Patient Instructions',
      description:
        'Automatically draft patient-friendly After-Visit Summaries (AVS), work/school excuse notes, and specialist referral letters from the same encounter.',
      icon: MailCheck,
      badge: '1-Click Letters',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF9]">
      <PublicNavbar />

      <section className="bg-gradient-to-b from-[#F3FAFE] to-[#FDFBF9] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#176B87]">
            <Sparkles className="h-3.5 w-3.5" /> Product & Scribe Capabilities
          </span>
          <h1 className="mt-4 text-4xl font-extrabold text-[#0E2954] sm:text-5xl">
            Notes that sound like you wrote them on your best day
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Freed combines ambient clinical listening with customizable specialty templates, dot-phrases, and style learning so every chart is accurate and audit-ready.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0E2954] px-6 py-3 text-sm font-semibold text-white hover:bg-[#176B87]"
            >
              Try Freed free for 7 days <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[#0E2954] hover:bg-slate-50"
            >
              Explore Template Studio
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-[#176B87]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {cap.badge}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-[#0E2954]">
                      {cap.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {cap.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Available in live workspace
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
