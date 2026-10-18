'use client';

import React, { useEffect, useState } from 'react';
import { AppWorkspaceShell } from '@/components/AppWorkspaceShell';
import { CheckCircle2, Save } from 'lucide-react';

export default function SettingsPreferencesPage() {
  const [prefs, setPrefs] = useState({
    patientTitle: 'Patient',
    retentionDays: 30,
    themeMode: 'light',
    aiDisclosureEnabled: true,
    hideEmptyHeaders: false,
    ehrAutoPush: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/user_metadata')
      .then((r) => r.json())
      .then((data) => {
        setPrefs((prev) => ({
          ...prev,
          patientTitle: data.patientTitle || prev.patientTitle,
          retentionDays:
            typeof data.retentionDays === 'number'
              ? data.retentionDays
              : prev.retentionDays,
          themeMode: data.themeMode || prev.themeMode,
          aiDisclosureEnabled:
            typeof data.aiDisclosureEnabled === 'boolean'
              ? data.aiDisclosureEnabled
              : prev.aiDisclosureEnabled,
          hideEmptyHeaders:
            typeof data.hideEmptyHeaders === 'boolean'
              ? data.hideEmptyHeaders
              : prev.hideEmptyHeaders,
          ehrAutoPush:
            typeof data.ehrAutoPush === 'boolean'
              ? data.ehrAutoPush
              : prev.ehrAutoPush,
        }));
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const res = await fetch('/api/update_user_profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
                Global Note Generation Preferences
              </h2>
              <p className="text-xs text-slate-500">
                Control how Freed structures your HPI, Assessment & Plan, and After-Visit Summaries across all encounters.
              </p>
            </div>
            {saved && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Preferences saved
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Patient Reference Term
              </label>
              <select
                value={prefs.patientTitle}
                onChange={(e) =>
                  setPrefs({ ...prefs, patientTitle: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              >
                <option value="Patient">Patient (Medical Default)</option>
                <option value="Client">Client (Behavioral Health)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Visit Note Retention Window
              </label>
              <select
                value={prefs.retentionDays}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    retentionDays: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              >
                <option value={7}>7 Days (Strict HIPAA Minimal)</option>
                <option value={30}>30 Days (Standard Default)</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Workspace Theme Mode
              </label>
              <select
                value={prefs.themeMode}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    themeMode: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              >
                <option value="light">Light Clinical Mode</option>
                <option value="dark">Dark Night-Shift Mode</option>
                <option value="system">Match System Theme</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.aiDisclosureEnabled}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    aiDisclosureEnabled: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded accent-[#0E2954]"
              />
              <span className="text-xs font-semibold text-slate-800">
                Append ambient AI documentation disclosure footer to generated notes
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.hideEmptyHeaders}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    hideEmptyHeaders: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded accent-[#0E2954]"
              />
              <span className="text-xs font-semibold text-slate-800">
                Automatically hide empty SOAP sub-headers if not discussed during encounter
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.ehrAutoPush}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    ehrAutoPush: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded accent-[#0E2954]"
              />
              <span className="text-xs font-semibold text-slate-800">
                Automatically stage completed notes for 1-Click EHR Push upon ending visit
              </span>
            </label>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0E2954] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#176B87]"
            >
              <Save className="h-4 w-4" /> Save Note Preferences
            </button>
          </div>
        </form>
      </div>
    </AppWorkspaceShell>
  );
}
