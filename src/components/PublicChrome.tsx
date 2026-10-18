'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  BookOpenCheck,
  FileCode2,
  Send,
  Stethoscope,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  ArrowRight,
  Lock,
  CheckCircle2,
} from 'lucide-react';

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  const featureLinks = [
    {
      href: '/features',
      title: 'AI Medical Scribe & Note Customization',
      desc: 'Adaptive SOAP notes, learned templates, magic edit, and dot-phrases.',
      icon: Sparkles,
    },
    {
      href: '/clinical-evidence',
      title: 'Clinical Evidence (OpenEvidence Partner)',
      desc: 'De-identified point-of-care answers backed by peer-reviewed journals.',
      icon: BookOpenCheck,
    },
    {
      href: '/coding-assistant',
      title: 'Medical Coding Assistant',
      desc: 'Automated ICD-10-CM, CPT, and E/M MDM complexity scoring.',
      icon: FileCode2,
    },
    {
      href: '/ehr-push',
      title: 'One-Click EHR Push',
      desc: 'Push notes directly to Epic, Athenahealth, eClinicalWorks, and 180+ EHRs.',
      icon: Send,
    },
    {
      href: '/front-desk',
      title: 'AI Front Desk & Pre-Charting',
      desc: 'Pre-visit intake summaries and longitudinal chart preparation.',
      icon: Stethoscope,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#FDFBF9]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E2954] text-white shadow-sm">
              <Stethoscope className="h-5 w-5 text-sky-300" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0E2954]">
              freed
            </span>
          </Link>

          <nav className="hidden md:flex md:items-center md:gap-6">
            <div
              className="relative"
              onMouseEnter={() => setFeaturesOpen(true)}
              onMouseLeave={() => setFeaturesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setFeaturesOpen((v) => !v)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  pathname.startsWith('/features') ||
                  pathname.startsWith('/clinical-evidence') ||
                  pathname.startsWith('/coding-assistant') ||
                  pathname.startsWith('/ehr-push')
                    ? 'text-[#176B87]'
                    : 'text-slate-700 hover:text-[#0E2954]'
                }`}
              >
                Product & Features
                <ChevronDown className="h-4 w-4" />
              </button>

              {featuresOpen && (
                <div className="absolute left-0 top-full w-[420px] pt-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                    {featureLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-start gap-3.5 rounded-xl p-3 transition hover:bg-sky-50/70"
                        >
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-[#176B87]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {item.title}
                            </div>
                            <div className="text-xs text-slate-600">
                              {item.desc}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/clinical-evidence"
              className={`text-sm font-medium transition-colors ${
                pathname === '/clinical-evidence'
                  ? 'text-[#176B87]'
                  : 'text-slate-700 hover:text-[#0E2954]'
              }`}
            >
              Clinical Evidence
            </Link>
            <Link
              href="/coding-assistant"
              className={`text-sm font-medium transition-colors ${
                pathname === '/coding-assistant'
                  ? 'text-[#176B87]'
                  : 'text-slate-700 hover:text-[#0E2954]'
              }`}
            >
              Coding Assistant
            </Link>
            <Link
              href="/ehr-push"
              className={`text-sm font-medium transition-colors ${
                pathname === '/ehr-push'
                  ? 'text-[#176B87]'
                  : 'text-slate-700 hover:text-[#0E2954]'
              }`}
            >
              EHR Push
            </Link>
            <Link
              href="/how-it-works"
              className={`text-sm font-medium transition-colors ${
                pathname === '/how-it-works'
                  ? 'text-[#176B87]'
                  : 'text-slate-700 hover:text-[#0E2954]'
              }`}
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className={`text-sm font-medium transition-colors ${
                pathname === '/pricing'
                  ? 'text-[#176B87]'
                  : 'text-slate-700 hover:text-[#0E2954]'
              }`}
            >
              Pricing
            </Link>
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/record"
            className="rounded-xl border border-sky-200 bg-sky-50/80 px-3.5 py-2 text-xs font-semibold text-[#176B87] transition hover:bg-sky-100"
          >
            Open Live Workspace
          </Link>
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E2954] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#176B87]"
          >
            Try for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle Menu"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col space-y-2">
            {featureLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
              >
                {item.title}
              </Link>
            ))}
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Pricing
            </Link>
            <div className=" flex flex-col gap-2 pt-3 border-t border-slate-100">
              <Link
                href="/record"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full rounded-xl bg-sky-50 py-2.5 text-center text-sm font-semibold text-[#176B87]"
              >
                Open Clinical Scribe Workspace
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full rounded-xl bg-[#0E2954] py-2.5 text-center text-sm font-semibold text-white"
              >
                Try for free (7-Day Trial)
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#0E2954] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/20 text-sky-300">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white">freed</span>
            </div>
            <p className="text-sm text-slate-300/90 leading-relaxed">
              The AI medical scribe built to make clinicians happier. Trusted by 25,000+ clinicians generating over 70,000 compliant chart notes every day.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-sky-200">
                <ShieldCheck className="h-3.5 w-3.5" /> HIPAA & HITECH
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-sky-200">
                <Lock className="h-3.5 w-3.5" /> SOC 2 Type II
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-sky-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Zero Audio Retention
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-300">
              Platform Capabilities
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/features" className="hover:text-white">
                  AI Medical Scribe & SOAP Notes
                </Link>
              </li>
              <li>
                <Link href="/clinical-evidence" className="hover:text-white">
                  Clinical Evidence (OpenEvidence)
                </Link>
              </li>
              <li>
                <Link href="/coding-assistant" className="hover:text-white">
                  ICD-10 & CPT Coding Assistant
                </Link>
              </li>
              <li>
                <Link href="/ehr-push" className="hover:text-white">
                  One-Click EHR Push
                </Link>
              </li>
              <li>
                <Link href="/front-desk" className="hover:text-white">
                  AI Front Desk & Pre-Charting
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-300">
              Clinician Workflows
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/how-it-works" className="hover:text-white">
                  How Freed Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white">
                  Plans & ROI Calculator
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-white">
                  142+ Specialty Note Templates
                </Link>
              </li>
              <li>
                <Link href="/record" className="hover:text-white">
                  Launch Scribe Workspace
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-300">
              Get Started Today
            </h3>
            <p className="mt-4 text-sm text-slate-300">
              Start your 7-day Premier trial with unlimited visits, Clinical Evidence, and EHR Push. No credit card required.
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-[#0E2954] transition hover:bg-sky-300"
              >
                Start free 7-day trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                Sign in to clinician portal
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Freed AI Medical Scribe. Built for clinical excellence.</p>
          <p className="mt-2 sm:mt-0">
            Zero patient audio stored • Automatic BAA included • 99.98% uptime SLA
          </p>
        </div>
      </div>
    </footer>
  );
}
