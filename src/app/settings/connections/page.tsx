'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppWorkspaceShell } from '@/components/AppWorkspaceShell';
import { Puzzle, Video, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SettingsConnectionsPage() {
  const [zoomConnected, setZoomConnected] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user_metadata')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.zoomConnected === 'boolean') {
          setZoomConnected(data.zoomConnected);
        }
        if (typeof data.extensionInstalled === 'boolean') {
          setExtensionInstalled(data.extensionInstalled);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleZoom = async () => {
    const next = !zoomConnected;
    setZoomConnected(next);
    await fetch('/api/update_user_profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zoomConnected: next }),
    });
    setStatusMessage(
      next
        ? 'Zoom Telehealth audio bridge connected.'
        : 'Zoom Telehealth integration disconnected.'
    );
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <AppWorkspaceShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {statusMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
            {statusMessage}
          </div>
        )}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-[#176B87]">
                <Puzzle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#0E2954]">
                    Freed 1-Click EHR Push & Chrome Extension
                  </h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                    {extensionInstalled ? 'Connected & Ready' : 'Not Installed'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Push Subjective/HPI, Objective Exam, Assessment & Plan, and ICD-10 codes directly into Athenahealth, Epic, eClinicalWorks, and 180+ web EHRs.
                </p>
              </div>
            </div>
            <Link
              href="/settings/connections/extension"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E2954] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#176B87] shrink-0"
            >
              Configure Extension <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              'Auto-maps SOAP sections to open EHR encounter fields',
              'Supports floating side-by-side recording inside your EHR tab',
              'Zero IT integration or HL7 server configuration required',
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-700"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zoom Telehealth Integration Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shrink-0">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0E2954]">
                  Zoom for Healthcare Telehealth Bridge
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    zoomConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {zoomConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Capture multi-channel telehealth encounter audio directly from Zoom meetings with automatic speaker diarization.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleZoom}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${
              zoomConnected
                ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                : 'bg-[#0E2954] text-white hover:bg-[#176B87]'
            }`}
          >
            {zoomConnected ? 'Disconnect Zoom' : 'Connect Zoom'}
          </button>
        </div>
      </div>
    </AppWorkspaceShell>
  );
}
