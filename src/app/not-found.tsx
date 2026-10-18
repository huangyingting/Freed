import React from 'react';
import Link from 'next/link';
import { PublicNavbar, PublicFooter } from '@/components/PublicChrome';
import { AlertCircle, ArrowLeft, Stethoscope } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF9]">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-[#176B87]">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-[#0E2954]">
            Page doesn&apos;t exist
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            The clinical page or route you requested could not be found. Return to the Freed homepage or open your clinical scribe workspace.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <Link
              href="/record"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0E2954] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#176B87]"
            >
              <Stethoscope className="h-4 w-4" /> Open Scribe Workspace
            </Link>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
