'use client';

import React, { useEffect, useState } from 'react';
import { AppWorkspaceShell } from '@/components/AppWorkspaceShell';
import {
  FREED_SPECIALTIES,
  CLINICIAN_CREDENTIALS,
  PRACTICE_SIZE_OPTIONS,
  EHR_SYSTEMS,
} from '@/lib/clinical-data';
import { CheckCircle2, Save } from 'lucide-react';

export default function SettingsProfilePage() {
  const [firstName, setFirstName] = useState('Dr. Alex');
  const [lastName, setLastName] = useState('Rivera');
  const [email, setEmail] = useState('dr.alex.rivera@getfreed.ai');
  const [clinicianTitle, setClinicianTitle] = useState('MD');
  const [specialty, setSpecialty] = useState('Internal Medicine');
  const [practiceSize, setPracticeSize] = useState('2 to 10 clinicians');
  const [ehrSystem, setEhrSystem] = useState('athenahealth');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    fetch('/api/user_metadata')
      .then((r) => r.json())
      .then((data) => {
        if (data.firstName) setFirstName(data.firstName);
        if (data.lastName) setLastName(data.lastName);
        if (data.email) setEmail(data.email);
        if (data.clinicalTitle) setClinicianTitle(data.clinicalTitle);
        if (data.specialty) setSpecialty(data.specialty);
        if (data.practiceSize) setPracticeSize(data.practiceSize);
        if (data.profile_ehr_type) setEhrSystem(data.profile_ehr_type);
        if (typeof data.mfaEnabled === 'boolean') setMfaEnabled(data.mfaEnabled);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedBanner(false);
    const res = await fetch('/api/update_user_profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        clinicalTitle: clinicianTitle,
        specialty,
        practiceSize,
        profileEhrType: ehrSystem,
        mfaEnabled,
        ...(newPassword.length >= 8 ? { newPassword } : {}),
      }),
    });
    if (res.ok) {
      setNewPassword('');
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 3000);
    }
  };

  return (
    <AppWorkspaceShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSave}
          className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0E2954]">
                Clinician Profile & Specialty
              </h2>
              <p className="text-xs text-slate-500">
                Your specialty and credentials calibrate Freed&apos;s clinical terminology and default templates.
              </p>
            </div>
            {savedBanner && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Profile saved
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
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
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Clinician Credential / Title
              </label>
              <select
                value={clinicianTitle}
                onChange={(e) => setClinicianTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              >
                {CLINICIAN_CREDENTIALS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Account Email
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Primary Specialty
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              >
                {FREED_SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Connected EHR System
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Practice Size
              </label>
              <select
                value={practiceSize}
                onChange={(e) => setPracticeSize(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              >
                {PRACTICE_SIZE_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                New Password (Optional, min 8 chars)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={mfaEnabled}
                onChange={(e) => setMfaEnabled(e.target.checked)}
                className="h-4 w-4 rounded accent-[#0E2954]"
              />
              <span className="text-xs font-semibold text-slate-800">
                Enable HIPAA Multi-Factor Authentication (MFA) for clinician sign-in
              </span>
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0E2954] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#176B87]"
            >
              <Save className="h-4 w-4" /> Save Clinician Profile
            </button>
          </div>
        </form>
      </div>
    </AppWorkspaceShell>
  );
}
