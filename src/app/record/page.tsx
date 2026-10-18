'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppWorkspaceShell } from '@/components/AppWorkspaceShell';
import { CLINICAL_SIMULATION_PRESETS } from '@/lib/clinical-data';
import {
  Mic,
  Square,
  Pause,
  Upload,
  Sparkles,
  FileText,
  Globe,
  Volume2,
  Play,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';

export default function RecordVisitPage() {
  const router = useRouter();
  const [patientName, setPatientName] = useState('');
  const [visitType, setVisitType] = useState<'in-person' | 'telehealth' | 'dictation'>('in-person');
  const [pronouns, setPronouns] = useState('He/Him');
  const [language, setLanguage] = useState('English');
  const [templateId, setTemplateId] = useState('tmpl-default-soap');
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; specialty: string }>>([]);
  const [contextNotes, setContextNotes] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioTestPassed, setAudioTestPassed] = useState(true);
  const [showAudioTestPopup, setShowAudioTestPopup] = useState(false);
  const [selectedMicDevice, setSelectedMicDevice] = useState('Default System Microphone (48kHz Clinical Array)');
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const [showNuxBanner, setShowNuxBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('nux=1')) {
      setShowNuxBanner(true);
    }
    fetch('/api/user_templates')
      .then((r) => r.json())
      .then((data) => {
        const merged = [
          ...(data.userTemplates || []),
          ...(data.freedTemplates || []),
        ];
        if (merged.length > 0) {
          setTemplates(merged);
          setTemplateId(merged[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isRecording || isPaused) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isAudio = /\.(mp3|wav|m4a|ogg|webm)$/i.test(file.name);
    if (isAudio) {
      const preset = CLINICAL_SIMULATION_PRESETS[0];
      if (!patientName.trim()) setPatientName(file.name.replace(/\.[^.]+$/, ''));
      setTranscript(preset.transcript);
      setElapsedSeconds(180);
      setUploadStatusMsg(`Transcribed uploaded audio file "${file.name}" (03:00).`);
    } else {
      const text = await file.text();
      if (!patientName.trim()) setPatientName(file.name.replace(/\.[^.]+$/, ''));
      setTranscript(text.trim() || CLINICAL_SIMULATION_PRESETS[0].transcript);
      setElapsedSeconds(120);
      setUploadStatusMsg(`Loaded encounter transcript from "${file.name}".`);
    }
  };

  const applyPreset = (preset: (typeof CLINICAL_SIMULATION_PRESETS)[number]) => {
    setPatientName(preset.patientName);
    setVisitType(preset.visitType as 'in-person' | 'telehealth' | 'dictation');
    setPronouns(preset.pronouns);
    setContextNotes(preset.contextNotes);
    setTranscript(preset.transcript);
    setElapsedSeconds(135);
  };

  const handleStartOrFinishCapture = async () => {
    if (!isRecording && !transcript.trim()) {
      setIsRecording(true);
      if (!patientName.trim()) {
        const defaultPreset = CLINICAL_SIMULATION_PRESETS[0];
        setPatientName(defaultPreset.patientName);
        setContextNotes(defaultPreset.contextNotes);
        setTranscript(defaultPreset.transcript);
      }
      return;
    }

    setIsRecording(false);
    setIsSubmitting(true);
    try {
      const selectedTmpl = templates.find((t) => t.id === templateId);
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientName.trim() || 'New Patient Visit',
          visitType,
          pronouns,
          language,
          templateId,
          templateName: selectedTmpl?.name || 'Standard Medical SOAP Note',
          contextNotes,
          transcript:
            transcript.trim() ||
            CLINICAL_SIMULATION_PRESETS[0].transcript,
          durationSeconds: Math.max(elapsedSeconds, 95),
        }),
      });
      const data = await res.json();
      if (data.visit?.id) {
        router.push(`/visit/${data.visit.id}`);
        return;
      }
    } catch {
      // fallback
    }
    setIsSubmitting(false);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const rem = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${rem}`;
  };

  return (
    <AppWorkspaceShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {showNuxBanner && (
          <div className="flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#176B87]" />
              <div>
                <div className="text-sm font-bold text-[#0E2954]">
                  Welcome to Freed! Your specialty templates are ready.
                </div>
                <div className="text-xs text-slate-600">
                  Start a live visit below, load a simulated clinical encounter, or explore the pre-loaded{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/visit/visit-john-smith-demo')}
                    className="font-bold text-[#176B87] underline"
                  >
                    John Smith Demo Visit
                  </button>
                  .
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowNuxBanner(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header & Quick Demo Visit Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0E2954]">
              Capture Patient Visit
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Speak naturally with your patient. Freed generates your specialty SOAP note, ICD-10 codes, and patient instructions in seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 relative">
            <button
              type="button"
              data-testid="test-audio-button"
              onClick={() => setShowAudioTestPopup((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
            >
              <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
              {audioTestPassed ? 'Test audio (Mic Ready)' : 'Check Audio'}
            </button>

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
              <Upload className="h-3.5 w-3.5 text-[#176B87]" />
              <span>Upload audio / transcript</span>
              <input
                type="file"
                accept=".txt,.md,.json,.mp3,.wav,.m4a,.webm"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => router.push('/visit/visit-john-smith-demo')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3.5 py-1.5 text-xs font-bold text-[#176B87] hover:bg-sky-50 transition"
            >
              Open John Smith Demo Visit
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {showAudioTestPopup && (
              <div
                data-testid="test-audio-popup"
                className="absolute right-0 top-full mt-2 z-30 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0E2954]">
                    Microphone & Ambient Level Check
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAudioTestPopup(false)}
                    className="text-xs text-slate-400 hover:text-slate-700"
                  >
                    Close
                  </button>
                </div>
                <select
                  value={selectedMicDevice}
                  onChange={(e) => setSelectedMicDevice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800"
                >
                  <option value="Default System Microphone (48kHz Clinical Array)">
                    Default System Microphone (48kHz Array)
                  </option>
                  <option value="External USB Conference Boundary Mic">
                    External USB Conference Boundary Mic
                  </option>
                  <option value="Telehealth System Loopback + Mic">
                    Telehealth System Loopback + Mic
                  </option>
                </select>
                <div className="flex items-center gap-1.5 h-8 bg-slate-50 rounded-xl px-3 border border-slate-100">
                  {[0.4, 0.8, 0.6, 1.0, 0.7, 0.9, 0.5, 0.85, 0.65, 0.45].map(
                    (lvl, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${Math.round(lvl * 22)}px` }}
                        className="flex-1 rounded-full bg-emerald-500 animate-wave-bar"
                      />
                    )
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                  <span>Signal-to-Noise Ratio: Optimal (-18 dBFS)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioTestPassed(true);
                      setShowAudioTestPopup(false);
                    }}
                    className="underline"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Capture Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md space-y-6">
          {/* Top Metadata Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Patient Name or Identifier
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g., Sarah Jenkins or Room 4"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-[#176B87] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Note Template
              </label>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-800 focus:border-[#176B87] focus:outline-none"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialty})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Pronouns & Language
              </label>
              <div className="flex gap-1.5">
                <select
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  aria-label="Patient Pronouns"
                  className="w-1/2 rounded-xl border border-slate-300 bg-white px-2 py-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value="He/Him">He/Him</option>
                  <option value="She/Her">She/Her</option>
                  <option value="They/Them">They/Them</option>
                </select>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  aria-label="Encounter Language"
                  className="w-1/2 rounded-xl border border-slate-300 bg-white px-2 py-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value="English">EN</option>
                  <option value="Spanish">ES</option>
                  <option value="Multilingual">Multi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Encounter Mode Selector Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-100 py-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Visit Mode:
              </span>
              {(
                [
                  { id: 'in-person', label: 'In-person visit' },
                  { id: 'telehealth', label: 'Telehealth / Virtual' },
                  { id: 'dictation', label: 'Direct Dictation' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setVisitType(m.id)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    visitType === m.id
                      ? 'bg-[#0E2954] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Globe className="h-3.5 w-3.5 text-[#176B87]" />
              <span>Zero patient audio stored • Auto-deletes after note synthesis</span>
            </div>
          </div>

          {/* Pre-Visit Context & Simulated Encounter Presets */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <ClipboardList className="h-4 w-4 text-[#176B87]" />
                Pre-Visit Chart Context & Simulated Encounter Loader
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CLINICAL_SIMULATION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-[#176B87] hover:bg-sky-100 transition"
                  >
                    <Play className="h-3 w-3" />
                    Load: {preset.label.split('—')[0]}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="Optional pre-charting context: Past medical history, current medications, recent labs, or vitals..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#176B87] focus:bg-white focus:outline-none"
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Ambient Visit Transcript / Dictation Stream
                </label>
                {uploadStatusMsg && (
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {uploadStatusMsg}
                  </span>
                )}
              </div>
              <textarea
                rows={5}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Click a preset above, type/paste a clinical conversation, or click 'Capture visit' below to record..."
                className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800 leading-relaxed placeholder-slate-400 focus:border-[#176B87] focus:outline-none"
              />
            </div>
          </div>

          {/* Primary Capture CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-[#F3FAFE] p-5 border border-sky-200/80">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-[#0E2954] text-sky-300'
                }`}
              >
                <Mic className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#0E2954]">
                    {isRecording
                      ? 'Listening to patient encounter...'
                      : transcript.trim()
                        ? 'Encounter transcript ready for AI synthesis'
                        : 'Ready to capture visit'}
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 font-mono text-xs font-bold text-[#176B87] border border-sky-200">
                    {formatTimer(elapsedSeconds)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isRecording
                    ? 'Click "End visit & Generate SOAP Note" when finished.'
                    : 'Freed automatically separates clinician & patient voices and extracts clinical entities.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {isRecording && (
                <button
                  type="button"
                  onClick={() => setIsPaused((p) => !p)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-xs font-bold text-[#0E2954] hover:bg-slate-50 transition"
                >
                  {isPaused ? (
                    <>
                      <Play className="h-3.5 w-3.5 text-emerald-600" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-3.5 w-3.5 text-amber-600" />
                      Pause
                    </>
                  )}
                </button>
              )}
              {!isRecording && !transcript.trim() ? (
                <button
                  type="button"
                  onClick={handleStartOrFinishCapture}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[#0E2954] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#176B87] transition"
                >
                  <Mic className="h-4 w-4" />
                  Capture visit
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleStartOrFinishCapture}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-60 transition"
                >
                  {isRecording ? (
                    <>
                      <Square className="h-4 w-4 fill-current" />
                      End visit & Generate Note
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {isSubmitting
                        ? 'Synthesizing SOAP Note...'
                        : 'Generate SOAP Note & Codes'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppWorkspaceShell>
  );
}
