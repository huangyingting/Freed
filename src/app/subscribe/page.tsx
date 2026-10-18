'use client';

import React, { useEffect, useState } from 'react';
import { AppWorkspaceShell } from '@/components/AppWorkspaceShell';
import { PRICING_PLANS } from '@/lib/clinical-data';
import { CheckCircle2, Sparkles, CreditCard } from 'lucide-react';

export default function SubscribePage() {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [currentPlan, setCurrentPlan] = useState('premier_trial');
  const [seats, setSeats] = useState(2);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [bannerMsg, setBannerMsg] = useState('');

  useEffect(() => {
    fetch('/api/subscription')
      .then((r) => r.json())
      .then((data) => {
        if (data.planTier) setCurrentPlan(data.planTier);
        if (data.billingCycle) setBillingCycle(data.billingCycle);
        if (data.totalSeats) setSeats(data.totalSeats);
      })
      .catch(() => {});
  }, []);

  const handleSelectPlan = async (planId: string) => {
    setUpgradingPlan(planId);
    setBannerMsg('');
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTier: planId,
          billingCycle,
          seats,
        }),
      });
      if (res.ok) {
        setCurrentPlan(planId);
        setBannerMsg(
          `Successfully activated ${planId.toUpperCase()} (${billingCycle}) for ${seats} clinician seat(s).`
        );
      }
    } catch {
      // ignore
    }
    setUpgradingPlan(null);
  };

  return (
    <AppWorkspaceShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
              <Sparkles className="h-3.5 w-3.5" /> 7-Day Premier Trial Active
            </span>
            <h1 className="mt-2 text-2xl font-extrabold text-[#0E2954]">
              Upgrade Your Freed Clinician Subscription
            </h1>
            <p className="text-xs text-slate-600">
              Lock in 20% annual savings with unlimited visits, Clinical Evidence, and 1-Click EHR Push.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs">
              <span className="font-semibold text-slate-700">Clinician Seats:</span>
              <input
                type="number"
                min={1}
                max={100}
                value={seats}
                onChange={(e) => setSeats(Math.max(1, Number(e.target.value)))}
                className="w-14 rounded-lg border border-slate-300 px-2 py-1 text-center font-bold text-[#0E2954]"
              />
            </div>

            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  billingCycle === 'annual'
                    ? 'bg-[#0E2954] text-white'
                    : 'text-slate-600'
                }`}
              >
                Annual (Save 20%)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  billingCycle === 'monthly'
                    ? 'bg-[#0E2954] text-white'
                    : 'text-slate-600'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        {bannerMsg && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{bannerMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PRICING_PLANS.map((plan) => {
            const price =
              billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
            const isCurrent = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between rounded-3xl border bg-white p-6 shadow-xs ${
                  plan.popular
                    ? 'border-[#176B87] ring-2 ring-[#176B87]/20'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#0E2954]">
                      {plan.name}
                    </h3>
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-[#176B87]">
                      {plan.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#0E2954]">
                      ${price}
                    </span>
                    <span className="text-xs text-slate-500">/ seat / mo</span>
                  </div>
                  <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-xs text-slate-700"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={upgradingPlan === plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                    isCurrent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#0E2954] text-white hover:bg-[#176B87]'
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  {isCurrent
                    ? 'Current Active Plan ✓'
                    : upgradingPlan === plan.id
                      ? 'Activating...'
                      : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AppWorkspaceShell>
  );
}
