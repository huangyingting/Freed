'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppWorkspaceShell } from '@/components/AppWorkspaceShell';
import { EHR_SYSTEMS } from '@/lib/clinical-data';
import { Puzzle, CheckCircle2, Send, ArrowRight } from 'lucide-react';

export default function SettingsExtensionSetupPage() {
  const [selectedEhr, setSelectedEhr] = useState('Athenahealth');
  const [tested, setTested] = useState(false);

  return (
    <AppWorkspaceShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-[#176B87]">
              <Puzzle className="h-3.5 w-3.5" /> 3-Step EHR Push Setup
            </span>
            <h2 className="mt-2 text-xl font-extrabold text-[#0E2954]">
              Connect Freed to your EHR in 60 seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
              <div className="text-xs font-black text-[#176B87]">STEP 1</div>
              <div className="text-sm font-bold text-[#0E2954]">
                Select Target EHR
              </div>
              <select
                value={selectedEhr}
                onChange={(e) => setSelectedEhr(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
              >
                {EHR_SYSTEMS.map((ehr) => (
                  <option key={ehr} value={ehr}>
                    {ehr}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
              <div className="text-xs font-black text-[#176B87]">STEP 2</div>
              <div className="text-sm font-bold text-[#0E2954]">
                Verify Field Mapping
              </div>
              <p className="text-xs text-slate-600">
                HPI, Physical Exam, Assessment & Plan, and ICD-10 Superbill fields are mapped to{' '}
                <strong>{selectedEhr}</strong>.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
              <div className="text-xs font-black text-[#176B87]">STEP 3</div>
              <div className="text-sm font-bold text-[#0E2954]">
                Test 1-Click Push
              </div>
              <button
                type="button"
                onClick={() => setTested(true)}
                className="w-full rounded-xl bg-[#0E2954] py-2 text-xs font-bold text-white hover:bg-[#176B87]"
              >
                {tested ? 'Connection Verified ✓' : 'Test EHR Handshake'}
              </button>
            </div>
          </div>

          {tested && (
            <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-900">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Handshake with {selectedEhr} verified! You can now push notes directly from any patient visit.
              </span>
              <Link
                href="/visit/visit-john-smith-demo"
                className="inline-flex items-center gap-1 text-[#0E2954] underline"
              >
                Open Demo Visit <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppWorkspaceShell>
  );
}
