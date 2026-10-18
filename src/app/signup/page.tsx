'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailStatus, setEmailStatus] = useState<{
    checked: boolean;
    valid: boolean;
    reason?: string;
  }>({ checked: false, valid: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const checkEmailDeliverability = async (val: string) => {
    if (!val || !val.includes('@')) return;
    try {
      const res = await fetch('/api/validate_user_email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: val }),
      });
      const data = await res.json();
      setEmailStatus({
        checked: true,
        valid: Boolean(data.valid),
        reason: data.reason,
      });
    } catch {
      // ignore
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) {
        setError(regData.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      router.push('/onboarding-personalization');
    } catch {
      setError('Unable to create account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-[#F3FAFE] to-[#FDFBF9] px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E2954] text-sky-300 shadow-md">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="text-2xl font-extrabold text-[#0E2954]">freed</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-[#0E2954]">
            Try Freed free for 7 days
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Unlimited patient visits, Clinical Evidence, and EHR Push. No credit card required.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailStatus({ checked: false, valid: true });
                }}
                onBlur={(e) => checkEmailDeliverability(e.target.value)}
                placeholder="dr.smith@clinic.org"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#176B87] focus:outline-none"
              />
              {emailStatus.checked && !emailStatus.valid && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">
                  {emailStatus.reason}
                </p>
              )}
              {emailStatus.checked && emailStatus.valid && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Clinician email verified deliverable
                </p>
              )}
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
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#176B87] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Re-enter Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#176B87] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || (emailStatus.checked && !emailStatus.valid)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E2954] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#176B87] disabled:opacity-60 transition"
            >
              {loading ? 'Provisioning 7-day Premier trial...' : 'Start 7-day free trial'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#176B87] hover:underline">
              Sign in →
            </Link>
          </p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-[#176B87]" />
          <span>Automatic HIPAA Business Associate Agreement (BAA) included</span>
        </div>
      </div>
    </div>
  );
}
