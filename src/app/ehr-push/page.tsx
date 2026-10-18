import React from 'react';
import Link from 'next/link';
import { PublicNavbar, PublicFooter } from '@/components/PublicChrome';
import { EHR_SYSTEMS } from '@/lib/clinical-data';
import { Send, Puzzle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function EhrPushPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF9]">
      <PublicNavbar />

      <section className="py-16 bg-gradient-to-b from-[#F3FAFE] to-[#FDFBF9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#176B87]">
              <Send className="h-3.5 w-3.5" /> Zero Copy-Paste EHR Integration
            </span>
            <h1 className="mt-4 text-4xl font-extrabold text-[#0E2954] sm:text-5xl">
              Push your completed note into any EHR in one click
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Say goodbye to section-by-section copy-pasting. Freed&apos;s Chrome Extension and Direct EHR Connector map your Subjective/HPI, Physical Exam, Assessment & Plan, and ICD-10 codes directly into your open EHR chart.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/settings/connections/extension"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0E2954] px-5 py-3 text-sm font-semibold text-white hover:bg-[#176B87]"
              >
                <Puzzle className="h-4 w-4" /> Configure EHR Push Connector
              </Link>
              <Link
                href="/visit/visit-john-smith-demo"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#0E2954]"
              >
                Test 1-Click EHR Push in Visit <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-lg font-bold text-[#0E2954] mb-4">
              Supported out of the box with 180+ Ambulatory & Inpatient EHRs:
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {EHR_SYSTEMS.map((ehr) => (
                <div
                  key={ehr}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-800 shadow-2xs"
                >
                  <span>{ehr}</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
