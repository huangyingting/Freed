'use client';

import React, { useEffect, useState } from 'react';
import { AppWorkspaceShell } from '@/components/AppWorkspaceShell';
import { Users, UserPlus, Trash2 } from 'lucide-react';

interface TeamMemberItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  daysLeftInTrial: number;
}

export default function SettingsMembersPage() {
  const [members, setMembers] = useState<TeamMemberItem[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Clinician');

  const loadTeam = async () => {
    const res = await fetch('/api/team');
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members || []);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role }),
    });
    if (res.ok) {
      setName('');
      setEmail('');
      loadTeam();
    }
  };

  const handleRemove = async (memberId: string) => {
    await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', memberId }),
    });
    loadTeam();
  };

  return (
    <AppWorkspaceShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="h-5 w-5 text-[#176B87]" />
              <div>
                <h2 className="text-lg font-bold text-[#0E2954]">
                  Practice Team & Seat Management ({members.length} Active Seats)
                </h2>
                <p className="text-xs text-slate-500">
                  Invite clinicians in your group practice to share templates, dot-phrases, and centralized billing.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleInvite}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/80"
          >
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Clinician Name (e.g., Dr. Sam Patel, DO)"
              className="sm:col-span-4 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sam.patel@clinic.org"
              className="sm:col-span-4 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="sm:col-span-2 rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900"
            >
              <option value="Clinician">Clinician</option>
              <option value="Owner">Owner / Admin</option>
            </select>
            <button
              type="submit"
              className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0E2954] px-3 py-2 text-xs font-bold text-white hover:bg-[#176B87]"
            >
              <UserPlus className="h-3.5 w-3.5" /> Invite
            </button>
          </form>

          <div className="divide-y divide-slate-100">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-3.5 text-xs"
              >
                <div>
                  <div className="font-bold text-[#0E2954]">{m.name}</div>
                  <div className="text-slate-500">{m.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-sky-100 px-2.5 py-0.5 font-semibold text-[#176B87]">
                    {m.role}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-800">
                    {m.status} ({m.daysLeftInTrial}d trial)
                  </span>
                  {m.role !== 'Owner' && (
                    <button
                      type="button"
                      onClick={() => handleRemove(m.id)}
                      className="rounded-lg p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppWorkspaceShell>
  );
}
