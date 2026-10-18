'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppWorkspaceShell } from '@/components/AppWorkspaceShell';
import { CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';

interface InvoiceItem {
  id: string;
  planTier: string;
  billingCycle: string;
  seats: number;
  amountCents: number;
  status: string;
  invoiceDate: string;
}

export default function SettingsInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [planTier, setPlanTier] = useState('premier_trial');

  useEffect(() => {
    fetch('/api/subscription')
      .then((r) => r.json())
      .then((data) => {
        if (data.planTier) setPlanTier(data.planTier);
        setInvoices(data.invoices || []);
      })
      .catch(() => {});
  }, []);

  return (
    <AppWorkspaceShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-[#176B87]" />
            <div>
              <div className="text-sm font-bold text-[#0E2954]">
                Current Subscription: <span className="uppercase">{planTier}</span>
              </div>
              <div className="text-xs text-slate-500">
                HIPAA BAA active • Unlimited visits & Clinical Evidence included
              </div>
            </div>
          </div>
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E2954] px-4 py-2 text-xs font-bold text-white hover:bg-[#176B87]"
          >
            Manage Plan & Seats <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#0E2954]">
            Billing & Invoice History
          </h2>
          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between py-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 uppercase">
                    {inv.planTier} ({inv.billingCycle}) • {inv.seats} seat(s)
                  </div>
                  <div className="text-slate-500">
                    {new Date(inv.invoiceDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#0E2954]">
                    ${(inv.amountCents / 100).toFixed(2)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-800 uppercase">
                    <CheckCircle2 className="h-3 w-3" /> {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppWorkspaceShell>
  );
}
