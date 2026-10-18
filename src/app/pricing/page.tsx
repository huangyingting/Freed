'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicNavbar, PublicFooter } from '@/components/PublicChrome';
import { PRICING_PLANS } from '@/lib/clinical-data';
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF9]">
      <PublicNavbar />

      <section className="py-16 bg-gradient-to-b from-[#F3FAFE] to-[#FDFBF9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#176B87]">
              <Sparkles className="h-3.5 w-3.5" /> Transparent Clinician Pricing
            </span>
            <h1 className="mt-4 text-4xl font-extrabold text-[#0E2954] sm:text-5xl">
              Plans built for solo clinicians, growing practices, and health systems
            </h1>
            <p className="mt-4 text-base text-slate-600">
              Every new account starts with a full-featured 7-day Premier trial. No credit card required.
            </p>

            {/* Billing Cycle Toggle */}
            <div className="mt-8 inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  billingCycle === 'annual'
                    ? 'bg-[#0E2954] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual Billing (Save up to 20%)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  billingCycle === 'monthly'
                    ? 'bg-[#0E2954] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PRICING_PLANS.map((plan) => {
              const price =
                billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`flex flex-col justify-between rounded-3xl border p-6 shadow-sm transition ${
                    plan.popular
                      ? 'border-[#176B87] bg-white ring-2 ring-[#176B87]/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-[#0E2954]">
                        {plan.name}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          plan.popular
                            ? 'bg-sky-100 text-[#176B87]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {plan.badge}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 min-h-[34px]">
                      {plan.description}
                    </p>

                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-[#0E2954]">
                        ${price}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        / clinician / month
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      {billingCycle === 'annual'
                        ? `Billed annually ($${price * 12}/yr)`
                        : 'Billed monthly, cancel anytime'}
                    </div>

                    <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2 text-xs text-slate-700"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4">
                    <Link
                      href="/signup"
                      className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition ${
                        plan.popular
                          ? 'bg-[#0E2954] text-white hover:bg-[#176B87]'
                          : 'border border-slate-300 bg-slate-50 text-[#0E2954] hover:bg-slate-100'
                      }`}
                    >
                      Start 7-day free trial
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#176B87]" /> Signed HIPAA BAA included on all tiers
            </span>
            <span>•</span>
            <span>Zero patient audio stored</span>
            <span>•</span>
            <Link href="/subscribe" className="font-semibold text-[#176B87] underline">
              Already have an account? Manage subscription in-app →
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
