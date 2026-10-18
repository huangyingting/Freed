import React from 'react';
import Link from 'next/link';
import { PublicNavbar, PublicFooter } from '@/components/PublicChrome';
import { Mic, Sparkles, Send, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Capture the visit (In-person or Telehealth)',
      desc: 'Click "Capture visit" on desktop, tablet, or mobile. Speak naturally with your patient—Freed filters out small talk and extracts structured clinical facts without storing patient audio.',
      icon: Mic,
    },
    {
      step: '02',
      title: 'Review, Magic Edit, & Query Clinical Evidence',
      desc: 'Within seconds of ending the visit, Freed generates a specialty-specific SOAP note, Patient Instructions, ICD-10/CPT codes, and answers point-of-care Clinical Evidence questions.',
      icon: Sparkles,
    },
    {
      step: '03',
      title: 'Push to your EHR in 1 click',
      desc: 'Click "Push to EHR" or copy structured sections directly into Epic, Athenahealth, eClinicalWorks, or any of 180+ supported EHR systems.',
      icon: Send,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF9]">
      <PublicNavbar />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-[#0E2954] sm:text-5xl">
              How Freed Works in 3 Simple Steps
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Zero IT setup required. Start charting in under 60 seconds.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-sky-200">
                      {s.step}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-[#176B87]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#0E2954]">{s.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/record"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0E2954] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#176B87]"
            >
              Experience the 3-step workflow now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
