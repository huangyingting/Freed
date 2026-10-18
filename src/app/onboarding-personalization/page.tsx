'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FREED_SPECIALTIES,
  CLINICIAN_CREDENTIALS,
  PRACTICE_SIZE_OPTIONS,
  EHR_SYSTEMS,
} from '@/lib/clinical-data';
import {
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function OnboardingPersonalizationPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [specialty, setSpecialty] = useState('Internal Medicine');
  const [firstName, setFirstName] = useState('Dr. Alex');
  const [lastName, setLastName] = useState('Rivera');
  const [clinicianTitle, setClinicianTitle] = useState('MD');
  const [practiceSize, setPracticeSize] = useState('2 to 10 clinicians');
  const [ehrSystem, setEhrSystem] = useState('Athenahealth');
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await fetch('/api/update_user_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty,
          firstName,
          lastName,
          clinicianTitle,
          practiceSize,
          ehrSystem,
          onboardingCompleted: true,
        }),
      });
    } catch {
      // ignore
    }
    setSaving(false);
    router.push('/record?nux=1');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-[#F3FAFE] to-[#FDFBF9] px-4 py-12">
      <div className="mx-auto w-full max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E2954] text-sky-300">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-[#0E2954]">freed</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#176B87]">
            <Sparkles className="h-4 w-4" />
            <span>Step {step} of 2 • Personalize Your AI Scribe</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-extrabold text-[#0E2954]">
                  Tell us about your clinical specialty
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Freed pre-configures your SOAP templates, medical vocabulary, and ICD-10 coding models based on your specialty.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Medical Specialty (142+ supported)
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#176B87] focus:outline-none"
                >
                  {FREED_SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Clinician Title / Credential
                </label>
                <select
                  value={clinicianTitle}
                  onChange={(e) => setClinicianTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
                >
                  {CLINICIAN_CREDENTIALS.map((cred) => (
                    <option key={cred} value={cred}>
                      {cred}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0E2954] px-6 py-3 text-sm font-bold text-white hover:bg-[#176B87] transition"
                >
                  Next: Practice & EHR Setup
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-extrabold text-[#0E2954]">
                  Tell us about your practice & EHR
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  We&apos;ll configure your 1-Click EHR Push connector and team template sharing defaults.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  How many clinicians work at your practice?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PRACTICE_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPracticeSize(opt)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                        practiceSize === opt
                          ? 'border-[#176B87] bg-sky-50/70 text-[#0E2954] font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {practiceSize === opt && (
                        <CheckCircle2 className="h-4 w-4 text-[#176B87]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Which EHR do you use? (180+ supported)
                </label>
                <select
                  value={ehrSystem}
                  onChange={(e) => setEhrSystem(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
                >
                  {EHR_SYSTEMS.map((ehr) => (
                    <option key={ehr} value={ehr}>
                      {ehr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleFinish}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0E2954] px-6 py-3 text-sm font-bold text-white hover:bg-[#176B87] transition"
                >
                  {saving ? 'Saving preferences...' : 'Launch Freed Scribe'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
