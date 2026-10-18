import React from 'react';
import Link from 'next/link';
import { PublicNavbar, PublicFooter } from '@/components/PublicChrome';
import { FileCode2, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CodingAssistantPage() {
  const sampleCodes = [
    {
      code: 'I10',
      system: 'ICD-10-CM',
      description: 'Essential (primary) hypertension',
      evidence: 'Supported by home BP log 142/88 mmHg and Lisinopril titration to 20mg daily.',
    },
    {
      code: 'E11.65',
      system: 'ICD-10-CM',
      description: 'Type 2 diabetes mellitus with hyperglycemia',
      evidence: 'Supported by point-of-care HbA1c 7.4% and switch to Metformin ER 1000mg.',
    },
    {
      code: '99214',
      system: 'CPT / E&M',
      description: 'Outpatient visit, established patient, Moderate MDM (30-39 min)',
      evidence: '2 chronic illnesses with mild exacerbation/progression + prescription drug management.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF9]">
      <PublicNavbar />

      <section className="py-16 bg-gradient-to-b from-[#F3FAFE] to-[#FDFBF9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#176B87]">
              <FileCode2 className="h-3.5 w-3.5" /> Automated Medical Coding Assistant
            </span>
            <h1 className="mt-4 text-4xl font-extrabold text-[#0E2954] sm:text-5xl">
              Capture every billable ICD-10 and CPT code automatically
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Eliminate under-coding and claim denials. Freed analyzes your clinical documentation in real time to surface accurate ICD-10-CM diagnoses, CPT procedures, and E/M MDM complexity justification.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/visit/visit-john-smith-demo"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0E2954] px-5 py-3 text-sm font-semibold text-white hover:bg-[#176B87]"
              >
                Inspect Live Visit Coding Tab <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {sampleCodes.map((item) => (
              <div
                key={item.code}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-[#0E2954] px-3 py-1 text-sm font-bold text-white">
                    {item.code}
                  </span>
                  <span className="text-xs font-semibold text-[#176B87]">
                    {item.system}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {item.description}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Chart Justification:</strong> {item.evidence}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 pt-2">
                  <CheckCircle2 className="h-4 w-4" /> Ready for 1-Click Superbill / EHR Push
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
