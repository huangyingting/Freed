'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicNavbar, PublicFooter } from '@/components/PublicChrome';
import {
  Sparkles,
  BookOpenCheck,
  FileCode2,
  Send,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  Mic,
  Stethoscope,
  Play,
  ExternalLink,
  Award,
} from 'lucide-react';

export default function HomePage() {
  const [activeSpecialtyTab, setActiveSpecialtyTab] = useState<
    'cardiology' | 'primary' | 'pediatrics' | 'psychiatry'
  >('cardiology');
  const [patientsPerDay, setPatientsPerDay] = useState(18);

  const specialtyDemos = {
    cardiology: {
      label: 'Cardiology & Endocrine',
      patient: 'John Smith, 58M',
      transcript:
        'Clinician: Hi John, your A1c came back at 7.4% and home BP averaged 142/88. Any chest pain or shortness of breath?\nPatient: No chest pain, just mild fatigue. I missed my evening metformin a couple times a week.',
      hpi: '• Hypertension & Type 2 Diabetes: Home BP log averaging 142/88 mmHg. HbA1c 7.4%. Reports occasional missed evening Metformin doses; denies chest pain, dyspnea, or orthopnea.',
      anp: '1. Essential Hypertension (I10): Increase Lisinopril from 10mg to 20mg PO daily; recheck BMP in 2 weeks.\n2. Type 2 Diabetes Mellitus (E11.9): Switch to extended-release Metformin ER 1000mg once daily with dinner to improve adherence.',
      codes: ['I10 — Essential hypertension', 'E11.9 — Type 2 diabetes mellitus', '99214 — Established Pt Moderate MDM'],
      evidence:
        'ADA 2026 Standards of Care recommend once-daily extended-release metformin to improve GI tolerability and adherence; consider SGLT2i if ASCVD risk is elevated.',
    },
    primary: {
      label: 'Primary Care / Internal Med',
      patient: 'Elena Rostova, 34F',
      transcript:
        'Clinician: How often are you using your albuterol inhaler?\nPatient: Almost 4 times a week now with the spring pollen, and I woke up coughing twice this week.',
      hpi: '• Moderate Persistent Asthma: Increasing nocturnal cough (2x/week) and rescue albuterol use (4x/week) triggered by seasonal pollen exposure.',
      anp: '1. Uncontrolled Mild-to-Moderate Persistent Asthma (J45.41): Initiate SMART therapy with low-dose ICS-formoterol (Symbicort 80/4.5 mcg) maintenance and reliever.\n2. Allergic Rhinitis (J30.1): Start intranasal fluticasone 2 sprays daily.',
      codes: ['J45.41 — Moderate persistent asthma w/ exacerbation', 'J30.1 — Allergic rhinitis due to pollen', '99214 — Moderate MDM'],
      evidence:
        'GINA 2025/2026 Track 1 guidelines strongly favor ICS-formoterol as both maintenance and reliever therapy (SMART) over SABA-only rescue in adults.',
    },
    pediatrics: {
      label: 'Pediatrics',
      patient: 'Leo Vance, 4M',
      transcript:
        'Clinician: Mom reports 2 days of right ear tugging and fever to 101.8F. Otoscopy shows bulging erythematous right tympanic membrane with decreased mobility.',
      hpi: '• Acute Otitis Media: 4-year-old male presenting with 48 hours of right otalgia, ear tugging, and fever (Tmax 101.8°F). Normal oral fluid intake.',
      anp: '1. Acute Suppurative Otitis Media of Right Ear (H66.001): Start high-dose Amoxicillin 90 mg/kg/day divided BID for 7 days.\n2. Fever / Otalgia: Weight-based Ibuprofen PRN comfort.',
      codes: ['H66.001 — Acute suppurative otitis media, right ear', '99213 — Low-to-Moderate MDM'],
      evidence:
        'AAP Clinical Practice Guidelines recommend high-dose amoxicillin (80-90 mg/kg/day) as first-line therapy for uncomplicated AOM in non-penicillin-allergic children.',
    },
    psychiatry: {
      label: 'Psychiatry & Behavioral Health',
      patient: 'Marcus Vance, 41M',
      transcript:
        'Clinician: After 6 weeks on Sertraline 50mg, how is yourGAD-7 score and sleep?\nPatient: My worry is down from 16 to 9, sleeping through the night, no side effects.',
      hpi: '• Generalized Anxiety Disorder: 6-week follow-up on Sertraline 50mg daily. GAD-7 improved from 16 to 9. Restorative sleep; denies SI/HI or activation.',
      anp: '1. Generalized Anxiety Disorder (F41.1): Partial-to-good response on Sertraline 50mg daily; titrate to 100mg PO daily and continue CBT.\n2. Follow up in 4 weeks.',
      codes: ['F41.1 — Generalized anxiety disorder', '99214 — Psychopharmacology + MDM', '90833 — Add-on Psychotherapy 30m'],
      evidence:
        'APA & NICE guidelines support titrating SSRIs in 50mg increments at 4-6 week intervals when partial response is observed without dose-limiting adverse effects.',
    },
  };

  const currentDemo = specialtyDemos[activeSpecialtyTab];
  const hoursSavedPerWeek = Math.round(((patientsPerDay * 6.5 * 5) / 60) * 10) / 10;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF9]">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F3FAFE] via-[#FDFBF9] to-[#FDFBF9] pt-12 pb-20 lg:pt-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#176B87] shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                <span>New: Clinical Evidence powered by OpenEvidence + 1-Click EHR Push</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-[#0E2954] sm:text-5xl lg:text-6xl leading-[1.08]">
                Be present with patients.{' '}
                <span className="text-[#176B87]">Freed writes the chart.</span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                The AI medical scribe assistant trusted by <strong>25,000+ clinicians</strong>. Listen to patient visits, generate specialty-tuned SOAP notes in seconds, query peer-reviewed Clinical Evidence, and push directly into your EHR.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0E2954] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-950/10 transition hover:bg-[#176B87]"
                >
                  Try Freed for free (7-day trial)
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/record"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-base font-semibold text-[#0E2954] transition hover:bg-slate-50"
                >
                  <Play className="h-4 w-4 text-[#176B87]" />
                  Launch Live Scribe Demo
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  No credit card required
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#176B87]" />
                  HIPAA & SOC 2 Type II Certified
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Saves 2.4+ hours every clinic day
                </span>
              </div>
            </div>

            {/* Interactive Clinical Scribe Preview Card */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-sky-950/5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0E2954]">
                      Interactive Specialty Note Preview
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(['cardiology', 'primary', 'pediatrics', 'psychiatry'] as const).map(
                      (tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveSpecialtyTab(tab)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                            activeSpecialtyTab === tab
                              ? 'bg-[#0E2954] text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {tab}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-3.5">
                  <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/70">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                      <span className="flex items-center gap-1.5 text-[#176B87]">
                        <Mic className="h-3.5 w-3.5" /> Ambient Conversation ({currentDemo.patient})
                      </span>
                      <span>02:14 audio</span>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {currentDemo.transcript}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0E2954]">
                        Generated SOAP Note • {currentDemo.label}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        Learned Style Applied
                      </span>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">
                        Subjective / HPI
                      </div>
                      <p className="text-xs text-slate-800 mt-0.5 leading-relaxed">
                        {currentDemo.hpi}
                      </p>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">
                        Assessment & Plan
                      </div>
                      <p className="text-xs text-slate-800 mt-0.5 whitespace-pre-line leading-relaxed">
                        {currentDemo.anp}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 p-3 bg-white">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#176B87] uppercase">
                        <FileCode2 className="h-3.5 w-3.5" /> Auto-Suggested Coding
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {currentDemo.codes.map((code) => (
                          <span
                            key={code}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-sky-200/80 bg-sky-50/50 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0E2954] uppercase">
                        <BookOpenCheck className="h-3.5 w-3.5 text-sky-600" /> Clinical Evidence Insight
                      </div>
                      <p className="mt-1 text-[11px] text-slate-700 leading-snug">
                        {currentDemo.evidence}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Grid */}
      <section className="py-16 bg-white border-y border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-[#0E2954] sm:text-4xl">
              An end-to-end clinical intelligence workspace
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Everything you need before, during, and after the patient encounter—designed so you never bring charting home at night.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/features"
              className="group rounded-2xl border border-slate-200 bg-[#FDFBF9] p-6 transition hover:border-[#176B87] hover:shadow-lg"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-[#176B87]">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#0E2954]">
                Adaptive AI Scribe
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Learns your writing style from a single sample note, supports `/` dot-phrases, and executes natural-language Magic Edits.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#176B87] group-hover:translate-x-1 transition">
                Explore Scribe Features <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            <Link
              href="/clinical-evidence"
              className="group rounded-2xl border border-slate-200 bg-[#FDFBF9] p-6 transition hover:border-[#176B87] hover:shadow-lg"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#0E2954]">
                Clinical Evidence
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Ask patient-specific medical questions inside the visit. Automatic PHI de-identification with peer-reviewed journal citations.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#176B87] group-hover:translate-x-1 transition">
                Explore Clinical Evidence <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            <Link
              href="/coding-assistant"
              className="group rounded-2xl border border-slate-200 bg-[#FDFBF9] p-6 transition hover:border-[#176B87] hover:shadow-lg"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <FileCode2 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#0E2954]">
                Coding Assistant
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Instant ICD-10-CM diagnosis codes, CPT procedure tags, and E/M MDM complexity justification extracted from your note.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#176B87] group-hover:translate-x-1 transition">
                Explore Coding Assistant <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            <Link
              href="/ehr-push"
              className="group rounded-2xl border border-slate-200 bg-[#FDFBF9] p-6 transition hover:border-[#176B87] hover:shadow-lg"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Send className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#0E2954]">
                1-Click EHR Push
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Transfer HPI, Physical Exam, Assessment & Plan, and ICD-10 codes directly into Athenahealth, Epic, eClinicalWorks, and 180+ EHRs.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#176B87] group-hover:translate-x-1 transition">
                Explore EHR Push <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Clinician Time-Saved Calculator */}
      <section className="py-16 bg-[#F3FAFE]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-sky-200 bg-white p-8 shadow-lg">
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12">
              <div className="md:col-span-7 space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-[#176B87]">
                  <Award className="h-3.5 w-3.5" /> Clinician Well-Being Calculator
                </span>
                <h2 className="text-2xl font-bold text-[#0E2954] sm:text-3xl">
                  See how much pajama-time charting you reclaim each week
                </h2>
                <p className="text-sm text-slate-600">
                  Adjust your daily patient encounter volume below to calculate time saved with Freed&apos;s ambient note generation and 1-click EHR Push.
                </p>
                <div className="pt-2">
                  <div className="flex justify-between text-sm font-semibold text-slate-800 mb-2">
                    <span>Patients seen per clinic day</span>
                    <span className="text-[#176B87]">{patientsPerDay} patients / day</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={40}
                    value={patientsPerDay}
                    onChange={(e) => setPatientsPerDay(Number(e.target.value))}
                    className="w-full accent-[#0E2954] cursor-pointer"
                  />
                </div>
              </div>

              <div className="md:col-span-5 rounded-2xl bg-[#0E2954] p-6 text-white text-center space-y-3">
                <div className="text-xs uppercase tracking-wider text-sky-300 font-semibold">
                  Estimated Documentation Time Saved
                </div>
                <div className="text-5xl font-extrabold text-sky-300">
                  {hoursSavedPerWeek} hrs
                </div>
                <div className="text-xs text-slate-300">
                  reclaimed every week (~{Math.round(hoursSavedPerWeek * 4.3)} hours / month)
                </div>
                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-bold text-[#0E2954] hover:bg-sky-300 transition"
                  >
                    Reclaim your evenings free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
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
