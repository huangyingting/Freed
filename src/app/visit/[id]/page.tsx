'use client';

import React, { useEffect, useState, use } from 'react';
import { AppWorkspaceShell } from '@/components/AppWorkspaceShell';
import { translatePatientInstructions } from '@/lib/scribe-engine';
import {
  Copy,
  Check,
  Send,
  Sparkles,
  BookOpenCheck,
  FileCode2,
  FileText,
  Mail,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Wand2,
  Sliders,
  Globe,
} from 'lucide-react';

interface Citation {
  title: string;
  journal?: string;
  source?: string;
  year: string;
  url: string;
}

interface EvidenceMessage {
  id: string;
  role: string;
  mode: string;
  content: string;
  citationsJson: string;
  createdAt: string;
}

interface CodingItem {
  code: string;
  system: string;
  description: string;
  confidence: string;
}

interface VisitDetail {
  id: string;
  patientName: string;
  visitMode?: string;
  visitType?: string;
  status: string;
  pronouns: string;
  language?: string;
  durationSeconds: number;
  templateId: string;
  templateName: string;
  preChartNotes?: string;
  contextNotes?: string;
  transcript: string;
  oneLiner?: string;
  clinicalSummary?: string;
  hpi: string;
  objective: string;
  anp: string;
  instructions: string;
  lettersJson?: string;
  letterText?: string;
  codingJson: string;
  ehrPushStatus: string;
  ehrPushedAt?: string;
  ehrTarget: string;
  evidenceMessages: EvidenceMessage[];
}

interface DotPhrase {
  id: string;
  shortcut: string;
  content: string;
}

export default function VisitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'note' | 'transcript' | 'coding' | 'letters'>('note');
  const [rightDockTab, setRightDockTab] = useState<'evidence' | 'magic_edit'>('evidence');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [pushingEhr, setPushingEhr] = useState(false);
  const [ehrModalResult, setEhrModalResult] = useState<null | {
    targetEhr: string;
    mappedFields: Array<{ section: string; ehrField: string; status: string }>;
  }>(null);

  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([]);
  const [dotPhrases, setDotPhrases] = useState<DotPhrase[]>([]);
  const [queryText, setQueryText] = useState('');
  const [sendingQuery, setSendingQuery] = useState(false);
  const [activeLetterType, setActiveLetterType] = useState<'referral' | 'excuse' | 'priorAuth'>('referral');

  const fetchVisit = async () => {
    setLoading(true);
    try {
      const [vRes, tRes] = await Promise.all([
        fetch(`/api/visits/${id}`),
        fetch('/api/user_templates'),
      ]);
      if (vRes.ok) {
        const vData = await vRes.json();
        setVisit(vData.visit);
      }
      if (tRes.ok) {
        const tData = await tRes.json();
        setTemplates([
          ...(tData.userTemplates || []),
          ...(tData.freedTemplates || []),
        ]);
        setDotPhrases(tData.dotPhrases || []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVisit();
  }, [id]);

  // Expand slash dot-phrases inside any section text
  const expandDotPhrasesInText = (rawText: string) => {
    let result = rawText;
    for (const dp of dotPhrases) {
      const token = `/${dp.shortcut}`;
      if (result.endsWith(`${token} `) || result.endsWith(`${token}\n`)) {
        result = result.slice(0, result.length - token.length - 1) + dp.content + ' ';
      }
    }
    return result;
  };

  const handleSaveFields = async (patch: Partial<VisitDetail>) => {
    if (!visit) return;
    setVisit({ ...visit, ...patch });
    setSavingNote(true);
    try {
      await fetch(`/api/visits/${visit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    } catch {
      // ignore
    }
    setSavingNote(false);
  };

  const handleRegenerateNote = async (newTemplateId?: string, newPronouns?: string) => {
    if (!visit) return;
    setRegenerating(true);
    const chosenTmplId = newTemplateId || visit.templateId;
    const chosenTmpl = templates.find((t) => t.id === chosenTmplId);
    try {
      const res = await fetch(`/api/visits/${visit.id}/generate-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: chosenTmplId,
          templateName: chosenTmpl?.name || visit.templateName,
          pronouns: newPronouns || visit.pronouns,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setVisit((prev) => (prev ? { ...prev, ...data.visit } : data.visit));
      }
    } catch {
      // ignore
    }
    setRegenerating(false);
  };

  const handleCopy = (label: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleCopyAllNote = () => {
    if (!visit) return;
    const fullNote = [
      `PATIENT: ${visit.patientName} (${visit.pronouns})`,
      `SUMMARY: ${visit.clinicalSummary}`,
      `\nSUBJECTIVE / HPI:\n${visit.hpi}`,
      `\nOBJECTIVE / PHYSICAL EXAM:\n${visit.objective}`,
      `\nASSESSMENT & PLAN:\n${visit.anp}`,
      `\nPATIENT INSTRUCTIONS:\n${visit.instructions}`,
    ].join('\n');
    handleCopy('all', fullNote);
  };

  const handlePushToEhr = async () => {
    if (!visit) return;
    setPushingEhr(true);
    try {
      const res = await fetch(`/api/visits/${visit.id}/ehr-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEhr: visit.ehrTarget || 'Athenahealth' }),
      });
      if (res.ok) {
        const data = await res.json();
        setVisit(data.visit);
        setEhrModalResult({
          targetEhr: data.targetEhr,
          mappedFields: data.mappedFields,
        });
      }
    } catch {
      // ignore
    }
    setPushingEhr(false);
  };

  const handleSendDockQuery = async (customPrompt?: string) => {
    if (!visit) return;
    const textToSend = (customPrompt ?? queryText).trim();
    if (!textToSend) return;
    setSendingQuery(true);
    setQueryText('');
    try {
      const res = await fetch(`/api/visits/${visit.id}/clinical-evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          mode: rightDockTab,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.visit) {
          setVisit(data.visit);
        }
      }
    } catch {
      // ignore
    }
    setSendingQuery(false);
  };

  if (loading || !visit) {
    return (
      <AppWorkspaceShell activeVisitId={id}>
        <div className="p-8 text-sm text-slate-500">
          Loading clinical encounter workspace...
        </div>
      </AppWorkspaceShell>
    );
  }

  let parsedCoding: CodingItem[] = [];
  let emLevelInfo: { code: string; title: string; justification: string } | null = null;
  let specificityTips: string[] = [];
  try {
    const rawCoding = JSON.parse(visit.codingJson || '{}');
    if (Array.isArray(rawCoding)) {
      parsedCoding = rawCoding;
    } else if (rawCoding && typeof rawCoding === 'object') {
      if (rawCoding.emLevel) {
        emLevelInfo = rawCoding.emLevel;
      }
      if (Array.isArray(rawCoding.specificityTips)) {
        specificityTips = rawCoding.specificityTips;
      }
      const icdList = (rawCoding.icd10 || []).map((c: any) => ({
        code: c.code,
        system: 'ICD-10-CM',
        description: c.description,
        confidence: c.confidence || 'High',
      }));
      const cptList = (rawCoding.cpt || []).map((c: any) => ({
        code: c.code,
        system: c.category || 'CPT',
        description: c.description,
        confidence: 'Verified',
      }));
      parsedCoding = [...icdList, ...cptList];
    }
  } catch {
    parsedCoding = [];
  }

  let parsedLetters: { referral: string; excuse: string; priorAuth: string } = {
    referral: visit.letterText || '',
    excuse: '',
    priorAuth: '',
  };
  if (visit.lettersJson) {
    try {
      const lObj = JSON.parse(visit.lettersJson);
      parsedLetters = {
        referral: lObj.referral || visit.letterText || '',
        excuse: lObj.excuse || '',
        priorAuth: lObj.priorAuth || '',
      };
    } catch {
      parsedLetters.referral = visit.lettersJson;
    }
  }
  const displayLetter = parsedLetters[activeLetterType] || parsedLetters.referral;
  const summaryText = visit.oneLiner || visit.clinicalSummary || '';
  const preChartText = visit.preChartNotes || visit.contextNotes || '';

  return (
    <AppWorkspaceShell activeVisitId={visit.id}>
      <div className="flex h-full flex-col lg:flex-row overflow-hidden">
        {/* Center Clinical Documentation Pane */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto border-r border-slate-200 bg-[#FDFBF9]">
          {/* Sticky Encounter Action Header */}
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md px-5 py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={visit.patientName}
                  onChange={(e) =>
                    handleSaveFields({ patientName: e.target.value })
                  }
                  aria-label="Patient Name"
                  className="rounded-lg border border-transparent hover:border-slate-200 focus:border-[#176B87] px-2 py-1 text-lg font-extrabold text-[#0E2954] focus:outline-none"
                />

                <select
                  value={visit.pronouns}
                  onChange={(e) => {
                    const p = e.target.value;
                    handleSaveFields({ pronouns: p });
                    handleRegenerateNote(visit.templateId, p);
                  }}
                  aria-label="Pronouns"
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
                >
                  <option value="He/Him">He/Him</option>
                  <option value="She/Her">She/Her</option>
                  <option value="They/Them">They/Them</option>
                </select>

                <select
                  value={visit.templateId || ''}
                  onChange={(e) => handleRegenerateNote(e.target.value)}
                  aria-label="Template Selector"
                  className="rounded-lg border border-slate-200 bg-sky-50/70 px-2.5 py-1 text-xs font-semibold text-[#176B87]"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {savingNote && (
                  <span className="text-[11px] font-medium text-slate-400">
                    Saving...
                  </span>
                )}
                <button
                  type="button"
                  disabled={regenerating}
                  onClick={() => handleRegenerateNote()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin' : ''}`}
                  />
                  {regenerating ? 'Regenerating...' : 'Regenerate'}
                </button>

                <button
                  type="button"
                  onClick={handleCopyAllNote}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-[#0E2954] hover:bg-slate-50"
                >
                  {copiedField === 'all' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Copied Note!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy note
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={pushingEhr}
                  onClick={handlePushToEhr}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold text-white shadow-xs transition ${
                    visit.ehrPushStatus === 'pushed'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-[#0E2954] hover:bg-[#176B87]'
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                  {pushingEhr
                    ? 'Pushing...'
                    : visit.ehrPushStatus === 'pushed'
                      ? 'Pushed to EHR ✓'
                      : 'Push to EHR'}
                </button>
              </div>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
              <div className="flex gap-1.5">
                {(
                  [
                    { id: 'note', label: 'SOAP Note', icon: FileText },
                    { id: 'transcript', label: 'Transcript & Context', icon: Sliders },
                    {
                      id: 'coding',
                      label: `Coding (${parsedCoding.length})`,
                      icon: FileCode2,
                    },
                    { id: 'letters', label: 'Referral & AVS Letters', icon: Mail },
                  ] as const
                ).map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        activeTab === t.id
                          ? 'bg-[#0E2954] text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {dotPhrases.length > 0 && (
                <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-500">
                  <span>Dot-phrases active:</span>
                  {dotPhrases.slice(0, 3).map((dp) => (
                    <code
                      key={dp.id}
                      className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-[#176B87]"
                    >
                      /{dp.shortcut}
                    </code>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* EHR Push Confirmation Banner */}
          {ehrModalResult && (
            <div className="mx-5 mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Successfully pushed structured SOAP sections & ICD-10 codes to{' '}
                  <span className="underline capitalize">{ehrModalResult.targetEhr}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEhrModalResult(null)}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Hide details
                </button>
              </div>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ehrModalResult.mappedFields.map((mf) => (
                  <div
                    key={mf.section}
                    className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-[11px] border border-emerald-100"
                  >
                    <span className="font-semibold text-slate-800">{mf.section}</span>
                    <span className="font-mono text-emerald-700">{mf.ehrField}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Tab Content */}
          <div className="p-5 space-y-5">
            {activeTab === 'note' && (
              <>
                {/* Clinical Visit Summary */}
                <div className="rounded-2xl border border-sky-200/80 bg-sky-50/50 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#176B87]">
                    Clinical Visit Summary
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-800">
                    {summaryText}
                  </p>
                </div>

                {/* SOAP Sections */}
                {(
                  [
                    {
                      key: 'hpi',
                      title: 'Subjective / History of Present Illness (HPI)',
                      value: visit.hpi,
                      rows: 5,
                    },
                    {
                      key: 'objective',
                      title: 'Objective / Physical Exam & Vitals',
                      value: visit.objective,
                      rows: 5,
                    },
                    {
                      key: 'anp',
                      title: 'Assessment & Plan',
                      value: visit.anp,
                      rows: 7,
                    },
                    {
                      key: 'instructions',
                      title: 'Patient Instructions (After-Visit Summary)',
                      value: visit.instructions,
                      rows: 4,
                    },
                  ] as const
                ).map((sec) => (
                  <div
                    key={sec.key}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#0E2954]">
                        {sec.title}
                      </label>
                      <div className="flex items-center gap-2">
                        {sec.key === 'instructions' && (
                          <div className="flex items-center gap-1 mr-1">
                            <Globe className="h-3.5 w-3.5 text-[#176B87]" />
                            <select
                              aria-label="Patient Instructions Language"
                              defaultValue="English"
                              onChange={(e) => {
                                const lang = e.target.value as
                                  | 'English'
                                  | 'Spanish'
                                  | 'Mandarin'
                                  | 'French';
                                const translated = translatePatientInstructions(
                                  visit.patientName,
                                  lang,
                                  visit.instructions
                                );
                                handleSaveFields({ instructions: translated });
                              }}
                              className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-[#0E2954]"
                            >
                              <option value="English">English</option>
                              <option value="Spanish">Español (Spanish)</option>
                              <option value="Mandarin">中文 (Mandarin)</option>
                              <option value="French">Français (French)</option>
                            </select>
                          </div>
                        )}
                        {dotPhrases.slice(0, 2).map((dp) => (
                          <button
                            key={dp.id}
                            type="button"
                            onClick={() =>
                              handleSaveFields({
                                [sec.key]: `${sec.value}\n${dp.content}`,
                              })
                            }
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-sky-50 hover:text-[#176B87]"
                          >
                            + /{dp.shortcut}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleCopy(sec.key, sec.value)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          {copiedField === sec.key ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={sec.rows}
                      value={sec.value}
                      onChange={(e) => {
                        const expanded = expandDotPhrasesInText(e.target.value);
                        handleSaveFields({ [sec.key]: expanded });
                      }}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50/40 p-3 text-xs text-slate-800 leading-relaxed focus:border-[#176B87] focus:bg-white focus:outline-none"
                    />
                  </div>
                ))}
              </>
            )}

            {activeTab === 'transcript' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0E2954]">
                    Pre-Visit Context & Chart Intake
                  </div>
                  <textarea
                    rows={3}
                    value={preChartText}
                    onChange={(e) =>
                      handleSaveFields({ preChartNotes: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0E2954]">
                      Diarized Encounter Transcript
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRegenerateNote()}
                      className="rounded-lg bg-[#0E2954] px-3 py-1 text-xs font-semibold text-white"
                    >
                      Re-synthesize SOAP from Transcript
                    </button>
                  </div>
                  <textarea
                    rows={12}
                    value={visit.transcript}
                    onChange={(e) =>
                      handleSaveFields({ transcript: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 leading-relaxed font-mono"
                  />
                </div>
              </div>
            )}

            {activeTab === 'coding' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#0E2954]">
                      AI Medical Coding Assistant (ICD-10-CM & CPT / E&M)
                    </div>
                    <div className="text-xs text-slate-600">
                      Automatically extracted from your Subjective, Objective, and Assessment & Plan documentation.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        'codes',
                        parsedCoding
                          .map((c) => `${c.code} (${c.system}): ${c.description}`)
                          .join('\n')
                      )
                    }
                    className="rounded-xl bg-[#0E2954] px-3.5 py-2 text-xs font-bold text-white"
                  >
                    {copiedField === 'codes' ? 'Copied All Codes ✓' : 'Copy Superbill Codes'}
                  </button>
                </div>

                {emLevelInfo && (
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                        Recommended E/M Medical Decision Making (MDM) Level
                      </span>
                      <span className="rounded-lg bg-indigo-900 px-2.5 py-0.5 font-mono text-xs font-bold text-white">
                        CPT {emLevelInfo.code}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#0E2954]">
                      {emLevelInfo.title}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Audit Justification:</strong> {emLevelInfo.justification}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {parsedCoding.map((item) => (
                    <div
                      key={item.code}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="rounded-xl bg-[#0E2954] px-3 py-1.5 font-mono text-xs font-bold text-white">
                          {item.code}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {item.description}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.system} • Confidence: {item.confidence}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(item.code, `${item.code} - ${item.description}`)
                        }
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {copiedField === item.code ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>

                {specificityTips.length > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-1.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Payer Specificity & Denial-Prevention Recommendations
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-amber-950">
                      {specificityTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'letters' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#0E2954]">
                      Automated Clinical Letters & Prior Authorizations
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select a letter type below. Auto-drafted from this encounter and editable before copying.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-xl bg-slate-100 p-1">
                      {(
                        [
                          { id: 'referral', label: 'Specialist Referral' },
                          { id: 'excuse', label: 'Work / School Excuse' },
                          { id: 'priorAuth', label: 'Prior Authorization' },
                        ] as const
                      ).map((lt) => (
                        <button
                          key={lt.id}
                          type="button"
                          onClick={() => setActiveLetterType(lt.id)}
                          className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                            activeLetterType === lt.id
                              ? 'bg-[#0E2954] text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {lt.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('letter', displayLetter)}
                      className="rounded-xl bg-[#0E2954] px-3.5 py-2 text-xs font-bold text-white"
                    >
                      {copiedField === 'letter' ? 'Copied Letter ✓' : 'Copy Letter'}
                    </button>
                  </div>
                </div>
                <textarea
                  rows={12}
                  value={displayLetter}
                  onChange={(e) => {
                    const updatedLetters = {
                      ...parsedLetters,
                      [activeLetterType]: e.target.value,
                    };
                    handleSaveFields({
                      lettersJson: JSON.stringify(updatedLetters),
                    });
                  }}
                  className="w-full rounded-xl border border-slate-200 p-4 text-xs text-slate-800 leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right-Hand Clinical Evidence & Magic Edit AI Dock */}
        <aside className="w-full lg:w-96 shrink-0 flex flex-col bg-white border-t lg:border-t-0 border-slate-200">
          {/* Dock Header Tabs */}
          <div className="border-b border-slate-200 p-3">
            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setRightDockTab('evidence')}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                  rightDockTab === 'evidence'
                    ? 'bg-[#0E2954] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpenCheck className="h-3.5 w-3.5" />
                Clinical Evidence
              </button>
              <button
                type="button"
                onClick={() => setRightDockTab('magic_edit')}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                  rightDockTab === 'magic_edit'
                    ? 'bg-[#0E2954] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wand2 className="h-3.5 w-3.5" />
                Magic Edit AI
              </button>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              {rightDockTab === 'evidence'
                ? 'PHI automatically de-identified • Peer-reviewed citations'
                : 'Instruct Freed to reformat or refine any section of your note'}
            </div>
          </div>

          {/* Quick Prompt Pills */}
          <div className="border-b border-slate-100 px-3.5 py-2.5 flex flex-wrap gap-1.5">
            {rightDockTab === 'evidence' ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleSendDockQuery(
                      'What are the ADA 2026 & ACC/AHA blood pressure and A1c targets for this patient?'
                    )
                  }
                  className="rounded-lg border border-sky-200 bg-sky-50/70 px-2.5 py-1 text-[11px] font-semibold text-[#176B87] hover:bg-sky-100"
                >
                  ADA & ACC/AHA BP/A1c Targets
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendDockQuery(
                      'Check renal dosing and electrolyte monitoring intervals for Lisinopril + Metformin'
                    )
                  }
                  className="rounded-lg border border-sky-200 bg-sky-50/70 px-2.5 py-1 text-[11px] font-semibold text-[#176B87] hover:bg-sky-100"
                >
                  Renal & BMP Monitoring
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleSendDockQuery(
                      'Convert Assessment & Plan into a numbered problem-based list'
                    )
                  }
                  className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-[11px] font-semibold text-indigo-800 hover:bg-indigo-100"
                >
                  Numbered Problem-Based Plan
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendDockQuery('Make HPI concise bullet points')
                  }
                  className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-[11px] font-semibold text-indigo-800 hover:bg-indigo-100"
                >
                  Bulletize HPI
                </button>
              </>
            )}
          </div>

          {/* Message Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 max-h-[420px] lg:max-h-none">
            {(visit.evidenceMessages || []).map((msg) => {
              let citations: Citation[] = [];
              try {
                citations = JSON.parse(msg.citationsJson || '[]');
              } catch {
                citations = [];
              }
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#0E2954] text-white ml-6'
                      : 'border border-slate-200 bg-slate-50/80 text-slate-800 mr-2'
                  }`}
                >
                  <div className="font-semibold mb-1 text-[10px] uppercase tracking-wider opacity-75">
                    {isUser
                      ? 'Clinician Query'
                      : msg.mode === 'magic_edit'
                        ? 'Freed Magic Edit Assistant'
                        : 'Clinical Evidence (OpenEvidence)'}
                  </div>
                  <div className="whitespace-pre-line">{msg.content}</div>
                  {citations.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 border-t border-slate-200/80 pt-2">
                      <div className="text-[10px] font-bold uppercase text-[#176B87]">
                        Peer-Reviewed Sources:
                      </div>
                      {citations.map((cit, i) => (
                        <a
                          key={`${cit.title}-${i}`}
                          href={cit.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2 text-[11px] hover:border-[#176B87]"
                        >
                          <div>
                            <div className="font-semibold text-[#0E2954]">
                              {cit.title}
                            </div>
                            <div className="text-slate-500">
                              {cit.journal || cit.source} ({cit.year})
                            </div>
                          </div>
                          <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Input Box */}
          <div className="border-t border-slate-200 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendDockQuery();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder={
                  rightDockTab === 'evidence'
                    ? 'Ask a clinical evidence question...'
                    : 'Tell Freed how to edit the note...'
                }
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#176B87] focus:outline-none"
              />
              <button
                type="submit"
                disabled={sendingQuery}
                className="inline-flex items-center gap-1 rounded-xl bg-[#0E2954] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#176B87] disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {sendingQuery ? '...' : 'Ask'}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </AppWorkspaceShell>
  );
}
