'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicNavbar, PublicFooter } from '@/components/PublicChrome';
import {
  BookOpenCheck,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Search,
} from 'lucide-react';

const SAMPLE_QUESTIONS = [
  {
    id: 'dm-htn',
    question:
      'What is the recommended antihypertensive and glycemic intensification for a 58yo male with T2DM (HbA1c 7.4%) and BP 142/88 on Lisinopril 10mg?',
    deidentified:
      'Patient identifiers stripped ([Patient Name] -> 58yo M). Querying ADA 2026 & ACC/AHA Guidelines...',
    answer:
      'For an adult with Type 2 Diabetes and blood pressure persistently >=130/80 mmHg on Lisinopril 10mg daily, guidelines recommend titrating the ACE inhibitor (Lisinopril 20mg daily) or adding a dihydropyridine CCB or thiazide-like diuretic, with serum creatinine and potassium monitoring within 2-4 weeks. For HbA1c 7.4% with evening metformin non-adherence, once-daily extended-release Metformin ER improves GI tolerability and adherence.',
    citations: [
      {
        title: 'ADA Standards of Care in Diabetes — 2026: Cardiovascular Disease and Risk Management',
        journal: 'Diabetes Care (diabetesjournals.org)',
        year: '2026',
        url: 'https://diabetesjournals.org/care',
      },
      {
        title: 'ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure',
        journal: 'Journal of the American College of Cardiology',
        year: '2025',
        url: 'https://pubmed.ncbi.nlm.nih.gov/',
      },
    ],
  },
  {
    id: 'asthma',
    question:
      'Should an adult with asthma using rescue albuterol 4x/week be switched to SMART therapy (ICS-formoterol)?',
    deidentified:
      'Patient identifiers stripped. Querying GINA 2025/2026 Track 1 Evidence Base...',
    answer:
      'Yes. Global Initiative for Asthma (GINA) Track 1 guidelines strongly recommend low-dose ICS-formoterol as both maintenance and reliever therapy (SMART) over SABA-only reliever regimens in adults and adolescents with mild-to-moderate persistent asthma, reducing severe exacerbations by 60%.',
    citations: [
      {
        title: 'Global Strategy for Asthma Management and Prevention (Track 1 SMART Regimen)',
        journal: 'GINA Report / European Respiratory Journal',
        year: '2025',
        url: 'https://ginasthma.org/',
      },
    ],
  },
];

export default function ClinicalEvidencePage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const active = SAMPLE_QUESTIONS[selectedIdx];

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF9]">
      <PublicNavbar />

      <section className="bg-gradient-to-b from-[#F3FAFE] to-[#FDFBF9] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#176B87]">
              <BookOpenCheck className="h-3.5 w-3.5" /> Freed + OpenEvidence Partnership
            </span>
            <h1 className="mt-4 text-4xl font-extrabold text-[#0E2954] sm:text-5xl">
              Peer-reviewed Clinical Evidence right inside your patient visit
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Ask complex clinical questions directly inside the Freed visit workspace. Freed automatically de-identifies PHI and synthesizes patient-contextual answers backed by NEJM, JAMA, Diabetes Care, and PubMed citations.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/visit/visit-john-smith-demo"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0E2954] px-5 py-3 text-sm font-semibold text-white hover:bg-[#176B87]"
              >
                Try Clinical Evidence in Live Visit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#0E2954]"
              >
                Start 7-day Premier trial
              </Link>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[#176B87]" />
                <span className="text-sm font-bold text-[#0E2954]">
                  Interactive Point-of-Care Evidence Simulator
                </span>
              </div>
              <div className="flex gap-2">
                {SAMPLE_QUESTIONS.map((q, idx) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedIdx(idx)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      selectedIdx === idx
                        ? 'bg-[#0E2954] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Case #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="text-xs font-bold uppercase text-slate-500">
                  Clinician Query in Visit Context
                </div>
                <p className="mt-1 text-sm font-semibold text-[#0E2954]">
                  &ldquo;{active.question}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-medium text-emerald-800">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{active.deidentified}</span>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#176B87]">
                  <Sparkles className="h-4 w-4" /> Evidence-Based Synthesis
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">
                  {active.answer}
                </p>
                <div className="space-y-2 pt-2 border-t border-sky-200/60">
                  <div className="text-xs font-bold text-slate-600">
                    Verified Literature Citations:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {active.citations.map((cit) => (
                      <a
                        key={cit.title}
                        href={cit.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs hover:border-[#176B87] transition"
                      >
                        <div>
                          <div className="font-semibold text-[#0E2954]">
                            {cit.title}
                          </div>
                          <div className="text-slate-500 mt-0.5">
                            {cit.journal} ({cit.year})
                          </div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
