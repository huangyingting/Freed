'use client';

import React, { useEffect, useState } from 'react';
import { AppWorkspaceShell } from '@/components/AppWorkspaceShell';
import {
  FileText,
  Sparkles,
  Plus,
  Star,
  Copy,
  Trash2,
  Wand2,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

interface TemplateRecord {
  id: string;
  name: string;
  description: string;
  templateType: string;
  specialty: string;
  specialtyGroup: string;
  source: string;
  isFavorite: boolean;
  isDefault: boolean;
  autoLearnEnabled: boolean;
  contentJson: string;
}

interface DotPhraseRecord {
  id: string;
  shortcut: string;
  content: string;
  visibility: string;
}

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'freed' | 'phrases'>('my');
  const [userTemplates, setUserTemplates] = useState<TemplateRecord[]>([]);
  const [freedTemplates, setFreedTemplates] = useState<TemplateRecord[]>([]);
  const [dotPhrases, setDotPhrases] = useState<DotPhraseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<TemplateRecord | null>(null);
  const [editingFormatMode, setEditingFormatMode] = useState<'paragraph' | 'list'>('list');
  const [editingShowHeaders, setEditingShowHeaders] = useState(true);

  // Teach Freed your note style panel
  const [showLearnPanel, setShowLearnPanel] = useState(false);
  const [newTmplName, setNewTmplName] = useState('');
  const [newTmplSpecialty, setNewTmplSpecialty] = useState('Internal Medicine');
  const [sampleNoteText, setSampleNoteText] = useState('');
  const [creatingTmpl, setCreatingTmpl] = useState(false);

  // New Dot-Phrase panel
  const [showPhrasePanel, setShowPhrasePanel] = useState(false);
  const [shortcutInput, setShortcutInput] = useState('');
  const [phraseContentInput, setPhraseContentInput] = useState('');
  const [creatingPhrase, setCreatingPhrase] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user_templates');
      if (res.ok) {
        const data = await res.json();
        setUserTemplates(data.userTemplates || []);
        setFreedTemplates(data.freedTemplates || []);
        setDotPhrases(data.dotPhrases || []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleLearnTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTmplName.trim() || !sampleNoteText.trim()) return;
    setCreatingTmpl(true);
    try {
      const res = await fetch('/api/user_templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTmplName,
          specialty: newTmplSpecialty,
          sampleNoteText,
          templateType: 'canonical',
          autoLearnEnabled: true,
        }),
      });
      if (res.ok) {
        setNewTmplName('');
        setSampleNoteText('');
        setShowLearnPanel(false);
        await loadAll();
        setActiveTab('my');
      }
    } catch {
      // ignore
    }
    setCreatingTmpl(false);
  };

  const handleDuplicateFromFreed = async (tmplId: string) => {
    const res = await fetch('/api/user_templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duplicateFromId: tmplId }),
    });
    if (res.ok) {
      await loadAll();
      setActiveTab('my');
    }
  };

  const handleToggleFavorite = async (tmpl: TemplateRecord) => {
    await fetch(`/api/user_templates/${tmpl.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavorite: !tmpl.isFavorite }),
    });
    loadAll();
  };

  const handleSetDefault = async (tmpl: TemplateRecord) => {
    await fetch(`/api/user_templates/${tmpl.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    });
    loadAll();
  };

  const handleSaveTemplateEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    let parsedContent: Record<string, any> = {};
    try {
      parsedContent = JSON.parse(editingTemplate.contentJson || '{}');
    } catch {
      parsedContent = {};
    }
    parsedContent.structuralConfig = {
      format: editingFormatMode,
      showHeader: editingShowHeaders,
    };

    await fetch(`/api/user_templates/${editingTemplate.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editingTemplate.name,
        description: editingTemplate.description,
        autoLearnEnabled: editingTemplate.autoLearnEnabled,
        contentJson: JSON.stringify(parsedContent),
      }),
    });
    setEditingTemplate(null);
    loadAll();
  };

  const handleDeleteTemplate = async (id: string) => {
    await fetch(`/api/user_templates/${id}`, { method: 'DELETE' });
    loadAll();
  };

  const handleCreatePhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortcutInput.trim() || !phraseContentInput.trim()) return;
    setCreatingPhrase(true);
    try {
      const res = await fetch('/api/dot_phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortcut: shortcutInput,
          content: phraseContentInput,
        }),
      });
      if (res.ok) {
        setShortcutInput('');
        setPhraseContentInput('');
        setShowPhrasePanel(false);
        await loadAll();
      }
    } catch {
      // ignore
    }
    setCreatingPhrase(false);
  };

  const handleDeletePhrase = async (id: string) => {
    await fetch(`/api/dot_phrases/${id}`, { method: 'DELETE' });
    loadAll();
  };

  return (
    <AppWorkspaceShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0E2954]">
              Templates & Dot-Phrases Studio
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Customize your SOAP note structure, teach Freed your style from a sample note, or manage slash (/) dot-phrase macros.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setShowLearnPanel((v) => !v);
                setShowPhrasePanel(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E2954] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#176B87] transition"
            >
              <Wand2 className="h-4 w-4 text-sky-300" />
              Teach Freed your note style
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('phrases');
                setShowPhrasePanel((v) => !v);
                setShowLearnPanel(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-[#0E2954] hover:bg-slate-50 transition"
            >
              <Plus className="h-4 w-4" />
              New phrase
            </button>
          </div>
        </div>

        {/* Inline Teach Freed Your Note Style Drawer */}
        {showLearnPanel && (
          <form
            onSubmit={handleLearnTemplate}
            className="rounded-3xl border border-sky-200 bg-white p-6 shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#176B87]" />
                <h2 className="text-base font-bold text-[#0E2954]">
                  Teach Freed Your Note Style (Learned Canonical Template)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowLearnPanel(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Paste a de-identified sample note below. Freed will extract your preferred HPI structure, physical exam defaults, and Assessment & Plan formatting.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  value={newTmplName}
                  onChange={(e) => setNewTmplName(e.target.value)}
                  placeholder="e.g., Dr. Rivera Comprehensive Follow-up"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Specialty
                </label>
                <input
                  type="text"
                  value={newTmplSpecialty}
                  onChange={(e) => setNewTmplSpecialty(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Sample De-Identified Clinical Note
              </label>
              <textarea
                rows={5}
                required
                value={sampleNoteText}
                onChange={(e) => setSampleNoteText(e.target.value)}
                placeholder="Paste your exemplar HPI, Objective, and Assessment & Plan here..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={creatingTmpl}
                className="rounded-xl bg-[#0E2954] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#176B87]"
              >
                {creatingTmpl ? 'Learning Style...' : 'Create Learned Template'}
              </button>
            </div>
          </form>
        )}

        {/* Inline New Dot-Phrase Drawer */}
        {showPhrasePanel && (
          <form
            onSubmit={handleCreatePhrase}
            className="rounded-3xl border border-sky-200 bg-white p-6 shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0E2954]">
                Create Slash (/) Dot-Phrase Macro
              </h2>
              <button
                type="button"
                onClick={() => setShowPhrasePanel(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Shortcut Trigger (type /shortcut in note)
                </label>
                <div className="flex items-center rounded-xl border border-slate-300 px-3 py-2">
                  <span className="font-mono text-sm font-bold text-[#176B87] mr-1">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    value={shortcutInput}
                    onChange={(e) => setShortcutInput(e.target.value)}
                    placeholder="neuro"
                    className="w-full text-xs font-mono text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Expansion Text
                </label>
                <input
                  type="text"
                  required
                  value={phraseContentInput}
                  onChange={(e) => setPhraseContentInput(e.target.value)}
                  placeholder="CN II-XII intact, motor 5/5 throughout, sensation intact to light touch, gait normal."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creatingPhrase}
                className="rounded-xl bg-[#0E2954] px-5 py-2 text-xs font-bold text-white hover:bg-[#176B87]"
              >
                {creatingPhrase ? 'Saving...' : 'Save Dot-Phrase'}
              </button>
            </div>
          </form>
        )}

        {/* 3 Main Tabs: My library | Freed library | Phrases + Search Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('my')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'my'
                  ? 'bg-[#0E2954] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              My library ({userTemplates.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('freed')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'freed'
                  ? 'bg-[#0E2954] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Freed library ({freedTemplates.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('phrases')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'phrases'
                  ? 'bg-[#0E2954] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Phrases ({dotPhrases.length})
            </button>
          </div>

          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by specialty, template name, or /shortcut..."
            className="w-full sm:w-72 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#176B87] focus:outline-none"
          />
        </div>

        {/* Inline Structural & Canonical Template Editor Drawer */}
        {editingTemplate && (
          <form
            onSubmit={handleSaveTemplateEdit}
            className="rounded-3xl border border-indigo-200 bg-white p-6 shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#176B87]" />
                <h3 className="text-sm font-bold text-[#0E2954]">
                  Customize Template Structure: {editingTemplate.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Template Title
                </label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Section Format Style
                </label>
                <select
                  value={editingFormatMode}
                  onChange={(e) =>
                    setEditingFormatMode(e.target.value as 'paragraph' | 'list')
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                >
                  <option value="list">Bulleted Clinical List (format: list)</option>
                  <option value="paragraph">
                    Narrative Paragraph (format: paragraph)
                  </option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Description & Clinical Guidance
              </label>
              <input
                type="text"
                value={editingTemplate.description}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    description: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingShowHeaders}
                    onChange={(e) => setEditingShowHeaders(e.target.checked)}
                    className="rounded accent-[#0E2954]"
                  />
                  Show Section Sub-headers
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingTemplate.autoLearnEnabled}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        autoLearnEnabled: e.target.checked,
                      })
                    }
                    className="rounded accent-[#0E2954]"
                  />
                  Auto-Learn from Edits
                </label>
              </div>
              <button
                type="submit"
                className="rounded-xl bg-[#0E2954] px-4 py-2 text-xs font-bold text-white hover:bg-[#176B87]"
              >
                Save Template Structure
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-xs text-slate-500 py-8">Loading templates...</div>
        ) : activeTab === 'my' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {userTemplates
              .filter(
                (t) =>
                  !searchFilter.trim() ||
                  t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                  t.specialty.toLowerCase().includes(searchFilter.toLowerCase())
              )
              .map((tmpl) => (
              <div
                key={tmpl.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#0E2954]">
                          {tmpl.name}
                        </h3>
                        {tmpl.isDefault && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span>{tmpl.specialty}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {tmpl.templateType === 'canonical'
                            ? 'Learned Style Template'
                            : 'Structural Section Template'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(tmpl)}
                      aria-label="Toggle Favorite"
                      className={`rounded-lg p-1.5 ${
                        tmpl.isFavorite
                          ? 'text-amber-500'
                          : 'text-slate-300 hover:text-slate-500'
                      }`}
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#176B87]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {tmpl.autoLearnEnabled
                      ? 'Auto-learning enabled'
                      : 'Static structure'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {!tmpl.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(tmpl)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Set default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingTemplate(tmpl)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-[#0E2954] hover:bg-slate-50"
                    >
                      <Sliders className="h-3 w-3" /> Customize
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(tmpl.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'freed' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {freedTemplates
              .filter(
                (t) =>
                  !searchFilter.trim() ||
                  t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                  t.specialty.toLowerCase().includes(searchFilter.toLowerCase())
              )
              .map((tmpl) => (
              <div
                key={tmpl.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-[#176B87]">
                      {tmpl.specialty}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      Verified Freed Library
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-base font-bold text-[#0E2954]">
                    {tmpl.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDuplicateFromFreed(tmpl.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E2954] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#176B87]"
                  >
                    <Copy className="h-3.5 w-3.5" /> Add to My Library
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {dotPhrases.map((dp) => (
              <div
                key={dp.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="rounded-lg bg-sky-100 px-2.5 py-1 font-mono text-xs font-bold text-[#0E2954]">
                      /{dp.shortcut}
                    </code>
                    <span className="text-[11px] text-slate-400">
                      Type /{dp.shortcut} + space inside any SOAP field
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pt-1">
                    {dp.content}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeletePhrase(dp.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppWorkspaceShell>
  );
}
