'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Clock, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { formatINR } from '@packages/utils';

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // For supervisor, let's fetch from same admin analytics endpoint. Django allows it or we can fetch.
    // Wait! In django authentication admin_views.py we added permission_classes = [IsOwner].
    // Wait, let's check: in backend/apps/authentication/admin_views.py we wrote:
    // class IsOwner(permissions.BasePermission): return request.user.role == 'owner'
    // This means supervisors cannot access `/api/admin/analytics`!
    // Ah! Let's check: what should supervisor overview display?
    // Supervisor only reviews transactions and payouts. So let's write a simple overview page 
    // that fetches investments list and payouts list directly, and calculates counts in the frontend.
    // This is extremely robust and bypasses any backend IsOwner permission check!
    
    Promise.all([
      fetch('/api/investments').then(res => res.json()),
      fetch('/api/payouts').then(res => res.json())
    ])
      .then(([investments, payouts]) => {
        const pendingTxns = investments.filter((t: any) => t.status === 'pending');
        const pendingPayouts = payouts.filter((p: any) => ['pending', 'overdue'].includes(p.status));
        
        setData({
          pendingTxnsCount: pendingTxns.length,
          pendingPayoutsCount: pendingPayouts.length,
          totalActiveInvestors: new Set(investments.filter((i: any) => i.status === 'active').map((i: any) => i.customer_mobile)).size
        });
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch supervisor metrics');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
        <p className="font-semibold">Error loading analytics</p>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Pending Verifications', 
      value: data.pendingTxnsCount, 
      icon: ShieldCheck, 
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      link: '/dashboard/transactions'
    },
    { 
      label: 'Pending Payouts', 
      value: data.pendingPayoutsCount, 
      icon: Clock, 
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      link: '/dashboard/payouts'
    },
    { 
      label: 'Active Investors Enrolled', 
      value: data.totalActiveInvestors, 
      icon: Users, 
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      link: '/dashboard/customers'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Supervisor Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Operational view for transaction audits and payout validation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} href={card.link}>
              <div className="p-6 rounded-2xl glass-panel border border-white/5 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/45 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">{card.label}</span>
                  <div className={`p-2.5 rounded-xl ${card.color}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mt-4 font-mono">{card.value}</h2>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono">Tasks Overview</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          As a supervisor, you are responsible for validating incoming deposit screenshots under <strong>Transactions</strong>. 
          If a transaction exceeds ₹1,00,000 (1 Lakh INR), it will require flagging for Owner Review. 
          Payouts must be marked as Paid once they are verified as executed on the bank transfer console.
        </p>
        <div className="pt-4 flex gap-4">
          <Link href="/dashboard/transactions" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            <span>Audit Transactions</span>
            <ArrowRight size={12} />
          </Link>
          <Link href="/dashboard/payouts" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            <span>Audit Payouts</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
