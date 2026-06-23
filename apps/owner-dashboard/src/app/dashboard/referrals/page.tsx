'use client';

import React from 'react';
import { Share2, DollarSign, Users } from 'lucide-react';
import { formatINR } from '@packages/utils';

const mockReferrals = [
  { id: 'r1', referrer: 'Pavan Kumar', referred: 'Swetha Reddy', bonus: '5000.00', status: 'credited', date: '2026-06-15' },
  { id: 'r2', referrer: 'Ananya Rao', referred: 'Rajesh Nair', bonus: '2500.00', status: 'pending', date: '2026-06-20' },
  { id: 'r3', referrer: 'Pavan Kumar', referred: 'Ananya Rao', bonus: '5000.00', status: 'credited', date: '2026-05-10' }
];

export default function ReferralsPage() {
  const totalBonuses = mockReferrals.reduce((a, c) => a + parseFloat(c.bonus), 0);
  const creditedBonuses = mockReferrals.filter(r => r.status === 'credited').reduce((a, c) => a + parseFloat(c.bonus), 0);

  return (
    <div className="space-y-6 font-sans text-slate-800">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Referral Network</h1>
        <p className="text-sm text-slate-500 mt-1 font-sans">Track referral rewards, credits, and partner accounts performance.</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">Total Referred Accounts</span>
            <p className="text-2xl font-bold text-slate-900 font-mono mt-1">3 Accounts</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Users size={18} />
          </div>
        </div>

        <div className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">Total Paid Rewards</span>
            <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{formatINR(creditedBonuses)}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <DollarSign size={18} />
          </div>
        </div>

        <div className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">Pending Incentives</span>
            <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{formatINR(totalBonuses - creditedBonuses)}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Share2 size={18} />
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider font-mono">
              <th className="p-4">Referrer (Invited By)</th>
              <th className="p-4">Referred Customer</th>
              <th className="p-4">Incentive Reward</th>
              <th className="p-4">Credit Date</th>
              <th className="p-4">Transfer Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {mockReferrals.map((r, idx) => (
              <tr key={idx} className="hover:bg-slate-50/40 transition-colors duration-150">
                <td className="p-4 font-semibold text-slate-900">{r.referrer}</td>
                <td className="p-4 text-slate-650">{r.referred}</td>
                <td className="p-4 font-mono font-bold text-slate-900">{formatINR(r.bonus)}</td>
                <td className="p-4 font-mono text-slate-500">{r.date}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full font-semibold border text-[10px] ${
                    r.status === 'credited' 
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  }`}>
                    {r.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
