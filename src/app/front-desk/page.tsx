import React from 'react';
import Link from 'next/link';
import { PublicNavbar, PublicFooter } from '@/components/PublicChrome';
import { Stethoscope, ClipboardCheck, CalendarCheck, ArrowRight } from 'lucide-react';

export default function FrontDeskPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF9]">
      <PublicNavbar />

      <section className="py-16 bg-gradient-to-b from-[#F3FAFE] to-[#FDFBF9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#176B87]">
              <Stethoscope className="h-3.5 w-3.5" /> AI Front Desk & Pre-Charting
            </span>
            <h1 className="mt-4 text-4xl font-extrabold text-[#0E2954] sm:text-5xl">
              Walk into every exam room with the chart already prepared
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Freed&apos;s AI Front Desk synthesizes pre-visit patient intake questionnaires, medication reconciliations, and prior encounter assessments into a structured pre-chart context block.
            </p>
            <div className="mt-6">
              <Link
                href="/record"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0E2954] px-5 py-3 text-sm font-semibold text-white hover:bg-[#176B87]"
              >
                Launch Pre-Charting in Scribe Workspace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <ClipboardCheck className="h-6 w-6 text-[#176B87]" />
              <h3 className="mt-3 text-lg font-bold text-[#0E2954]">
                Automated Pre-Visit Intake Synthesis
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Collect chief complaints, ROS responses, and medication updates from patients prior to arrival and inject them directly into your Freed visit context.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <CalendarCheck className="h-6 w-6 text-[#176B87]" />
              <h3 className="mt-3 text-lg font-bold text-[#0E2954]">
                Longitudinal Problem Carry-Forward
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Automatically pull unresolved chronic conditions, pending lab orders, and screening reminders from the patient&apos;s previous visit.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
