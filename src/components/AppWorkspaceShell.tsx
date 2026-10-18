'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Mic,
  FileText,
  Search,
  Sparkles,
  Settings,
  User,
  Users,
  CreditCard,
  Puzzle,
  Sliders,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Stethoscope,
  Clock,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export interface WorkspaceVisitSummary {
  id: string;
  patientName: string;
  visitType: string;
  status: string;
  durationSeconds: number;
  createdAt: string;
  ehrPushStatus?: string;
}

export interface WorkspaceUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  clinicianTitle: string;
  specialty: string;
  ehrSystem: string;
  planTier: string;
  daysLeftInTrial: number;
}

interface AppWorkspaceShellProps {
  children: React.ReactNode;
  activeVisitId?: string;
  onVisitsChange?: () => void;
}

export function AppWorkspaceShell({
  children,
  activeVisitId,
}: AppWorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [visits, setVisits] = useState<WorkspaceVisitSummary[]>([]);
  const [user, setUser] = useState<WorkspaceUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visitFilter, setVisitFilter] = useState<'active' | 'trash'>('active');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const loadWorkspaceData = async () => {
    try {
      const params = new URLSearchParams();
      params.set('filter', visitFilter);
      params.set('date', dateFilter);
      if (searchQuery) params.set('q', searchQuery);

      const [metaRes, visitsRes] = await Promise.all([
        fetch('/api/user_metadata'),
        fetch(`/api/visits?${params.toString()}`),
      ]);
      if (metaRes.ok) {
        const meta = await metaRes.json();
        setUser(meta);
      }
      if (visitsRes.ok) {
        const vData = await visitsRes.json();
        setVisits(vData.visits || []);
      }
    } catch {
      // ignore transient fetch errors
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [pathname, searchQuery, visitFilter, dateFilter]);

  const handleDeleteVisit = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url =
      visitFilter === 'trash'
        ? `/api/visits/${id}?permanent=true`
        : `/api/visits/${id}`;
    const res = await fetch(url, { method: 'DELETE' });
    if (res.ok) {
      setVisits((prev) => prev.filter((v) => v.id !== id));
      if (activeVisitId === id) {
        router.push('/record');
      }
    }
  };

  const handleRestoreVisit = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await fetch(`/api/visits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    if (res.ok) {
      setVisits((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const isSettingsRoute = pathname.startsWith('/settings');

  const settingsNav = [
    { href: '/settings/profile', label: 'My profile', icon: User },
    { href: '/settings/preferences', label: 'Note preferences', icon: Sliders },
    { href: '/settings/members', label: 'Team', icon: Users },
    { href: '/settings/invoices', label: 'Billing', icon: CreditCard },
    { href: '/settings/connections', label: 'Integrations', icon: Puzzle },
  ];

  const SidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#0E2954] text-slate-100 w-72 shrink-0 select-none">
      {/* Top Brand + Primary Actions */}
      <div className="flex flex-col p-3.5 space-y-3 overflow-hidden flex-1">
        <div className="flex items-center justify-between px-1.5">
          <Link href="/record" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/20 text-sky-300">
              <Stethoscope className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              freed
            </span>
            <span className="rounded-full bg-sky-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
              Premier
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="rounded-lg p-1 text-slate-300 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Visit CTA */}
        <Link
          href="/record"
          onClick={() => setMobileSidebarOpen(false)}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
            pathname === '/record'
              ? 'bg-sky-400 text-[#0E2954]'
              : 'bg-[#176B87] text-white hover:bg-sky-500 hover:text-[#0E2954]'
          }`}
        >
          <Mic className="h-4 w-4" />
          New visit
        </Link>

        {/* Primary Workspace Links */}
        <div className="space-y-1">
          <Link
            href="/templates"
            onClick={() => setMobileSidebarOpen(false)}
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
              pathname.startsWith('/templates')
                ? 'bg-white/15 text-white'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-sky-300" />
              Templates & Phrases
            </span>
            <span className="rounded-md bg-sky-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-sky-200">
              142+
            </span>
          </Link>

          <Link
            href="/settings/connections"
            onClick={() => setMobileSidebarOpen(false)}
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
              pathname.startsWith('/settings/connections')
                ? 'bg-white/15 text-white'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Puzzle className="h-4 w-4 text-emerald-300" />
              EHR Push Integration
            </span>
            <span className="rounded-md bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200">
              Beta
            </span>
          </Link>
        </div>

        {/* Search Visits Input + Schedule Filters */}
        <div className="pt-1 space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient visits..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-400 focus:border-sky-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-1 text-[10px]">
            <div className="inline-flex rounded-lg bg-white/5 p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setVisitFilter('active')}
                className={`rounded-md px-2 py-0.5 font-semibold transition ${
                  visitFilter === 'active'
                    ? 'bg-sky-400 text-[#0E2954]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setVisitFilter('trash')}
                className={`rounded-md px-2 py-0.5 font-semibold transition ${
                  visitFilter === 'trash'
                    ? 'bg-rose-400 text-[#0E2954]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Trash
              </button>
            </div>

            <div className="inline-flex rounded-lg bg-white/5 p-0.5 border border-white/10">
              {(['all', 'today', 'week'] as const).map((df) => (
                <button
                  key={df}
                  type="button"
                  onClick={() => setDateFilter(df)}
                  className={`rounded-md px-1.5 py-0.5 font-semibold capitalize transition ${
                    dateFilter === df
                      ? 'bg-white/20 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {df === 'week' ? '7d' : df}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Visits List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {visitFilter === 'trash' ? 'Trash Visits' : 'Recent Visits'} ({visits.length})
          </div>
          {visits.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-400">
              {visitFilter === 'trash'
                ? 'Trash is empty.'
                : 'No visits matching filter. Click “New visit” to capture an encounter.'}
            </div>
          ) : (
            visits.map((visit) => {
              const isActive =
                activeVisitId === visit.id || pathname === `/visit/${visit.id}`;
              return (
                <Link
                  key={visit.id}
                  href={`/visit/${visit.id}`}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition ${
                    isActive
                      ? 'bg-white/15 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-semibold truncate">
                      <span className="truncate">{visit.patientName}</span>
                      {visit.ehrPushStatus === 'pushed' && (
                        <span title="Pushed to EHR" className="shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="capitalize">{visit.visitType || 'in-person'}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {Math.max(1, Math.round((visit.durationSeconds || 60) / 60))}m
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    {visitFilter === 'trash' && (
                      <button
                        type="button"
                        aria-label={`Restore visit ${visit.patientName}`}
                        onClick={(e) => handleRestoreVisit(e, visit.id)}
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                      >
                        Restore
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={`Delete visit ${visit.patientName}`}
                      onClick={(e) => handleDeleteVisit(e, visit.id)}
                      className="rounded-md p-1 text-slate-400 hover:bg-red-500/20 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Upgrade Banner + Clinician Profile Popover */}
      <div className="border-t border-white/10 p-3 space-y-2.5">
        <Link
          href="/subscribe"
          onClick={() => setMobileSidebarOpen(false)}
          className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-400/20 to-sky-400/20 border border-amber-300/30 px-3 py-2 text-xs font-medium text-amber-200 hover:border-amber-300/60 transition"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
            <span>
              Upgrade —{' '}
              <strong>{user?.daysLeftInTrial ?? 7} days left</strong>
            </span>
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-left hover:bg-white/10 transition"
          >
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-white">
                {user
                  ? `${user.firstName} ${user.lastName}, ${user.clinicianTitle}`
                  : 'Dr. Alex Rivera, MD'}
              </div>
              <div className="truncate text-[11px] text-slate-400">
                {user?.specialty || 'Internal Medicine'} • {user?.ehrSystem || 'Athenahealth'}
              </div>
            </div>
            <Settings className="h-4 w-4 shrink-0 text-slate-400" />
          </button>

          {profileMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border border-slate-700 bg-[#0A1E3F] p-1.5 shadow-2xl z-50">
              {settingsNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setMobileSidebarOpen(false);
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
                  >
                    <Icon className="h-3.5 w-3.5 text-sky-300" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/onboarding-personalization"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Personalization Wizard
              </Link>
              <div className="my-1 border-t border-white/10" />
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FDFBF9]">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex h-full">{SidebarContent}</aside>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 flex h-full">{SidebarContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 lg:hidden">
          <button
            type="button"
            aria-label="Open Navigation Drawer"
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/record" className="flex items-center gap-2 font-bold text-[#0E2954]">
            <Stethoscope className="h-4 w-4 text-[#176B87]" />
            <span>freed workspace</span>
          </Link>
          <Link
            href="/record"
            className="rounded-lg bg-[#0E2954] px-2.5 py-1 text-xs font-semibold text-white"
          >
            + Visit
          </Link>
        </div>

        {/* Optional Settings Sub-navigation bar when on /settings/* */}
        {isSettingsRoute && (
          <div className="border-b border-slate-200 bg-white px-6 py-3">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-bold text-[#0E2954]">
                  Account & Practice Settings
                </h1>
                <p className="text-xs text-slate-500">
                  Manage your clinician credentials, specialty note defaults, team seats, billing, and EHR Push integrations.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {settingsNav.map((item) => {
                  const Icon = item.icon;
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? 'bg-[#0E2954] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
