'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Stethoscope, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('dr.alex.rivera@getfreed.ai');
  const [password, setPassword] = useState('FreedDemo!2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (res?.error) {
      setError('Invalid clinician email or password. Try the pre-filled demo credentials.');
      return;
    }
    router.push('/record');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-[#F3FAFE] to-[#FDFBF9] px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E2954] text-sky-300 shadow-md">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="text-2xl font-extrabold text-[#0E2954]">freed</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-[#0E2954]">
            Welcome back, Clinician
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Sign in to your HIPAA-compliant AI medical scribe workspace
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Clinician Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.org"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#176B87] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#176B87] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E2954] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#176B87] disabled:opacity-60 transition"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            <span>or quick demo access</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={() => {
              setEmail('dr.alex.rivera@getfreed.ai');
              setPassword('FreedDemo!2026');
              signIn('credentials', {
                callbackUrl: '/record',
                email: 'dr.alex.rivera@getfreed.ai',
                password: 'FreedDemo!2026',
              });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50/80 py-2.5 text-xs font-bold text-[#176B87] hover:bg-sky-100 transition"
          >
            <Sparkles className="h-4 w-4" />
            1-Click Demo Login (Dr. Alex Rivera, MD)
          </button>

          <p className="mt-6 text-center text-xs text-slate-600">
            New to Freed?{' '}
            <Link href="/signup" className="font-bold text-[#176B87] hover:underline">
              Start your 7-day free trial →
            </Link>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          <span>256-bit HIPAA & SOC 2 Type II Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}
