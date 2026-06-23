'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  TrendingDown,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatINR } from '@packages/utils';

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('owner');
  const [userName, setUserName] = useState('K N C PAVAN KUMAR');
  const [activeDate, setActiveDate] = useState(23); // Current date matches image: Jun 23

  useEffect(() => {
    const userRole = Cookies.get('user_role') || 'owner';
    const name = Cookies.get('user_name') || 'K N C PAVAN KUMAR';
    setRole(userRole);
    setUserName(name);

    fetch('/api/admin/analytics')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-2xl">
        <p className="font-semibold">Error loading analytics</p>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  // Stats cards styling like the dark blue-slate metric cards in the image
  const statCards = [
    { 
      label: 'TOTAL AUM', 
      value: formatINR(data.total_aum).replace('.00', ''),
      change: '+12.4%',
      labelUnder: 'VS PREVIOUS MONTH',
      icon: TrendingUp,
      color: 'bg-[#1D173C]'
    },
    { 
      label: 'TOTAL DISTRIBUTED', 
      value: formatINR(data.total_aum * 0.08).replace('.00', ''), // Mock distributions
      change: '+6.2%',
      labelUnder: 'VS PREVIOUS MONTH',
      icon: WalletIcon,
      color: 'bg-[#1D173C]'
    },
    { 
      label: 'ACTIVE INVESTORS', 
      value: data.active_investors.toString(), 
      change: '+8.7%',
      labelUnder: 'VS PREVIOUS MONTH',
      icon: Users, 
      color: 'bg-[#1D173C]'
    },
    { 
      label: 'PENDING VERIFICATIONS', 
      value: data.pending_verifications.toString(), 
      change: '0%',
      labelUnder: 'VS PREVIOUS MONTH',
      icon: ShieldCheck, 
      color: 'bg-[#1D173C]',
      link: '/dashboard/transactions'
    },
  ];

  return (
    <div className="space-y-8 font-sans text-slate-800">
      {/* Header Greeting Section (Identical to salon app style) */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          Hello, {userName} <span className="animate-bounce">👋</span>
        </h1>
        <p className="text-sm text-slate-500">
          {role === 'owner' 
            ? "Here's what's happening with your capital platform today." 
            : "Review compliance queues and verify customer transactions."
          }
        </p>
      </div>

      {/* Row of Dark Fintech Cards (4 cards in a row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const CardContent = (
            <div className={`p-6 rounded-[24px] ${card.color} text-white relative overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-lg shadow-indigo-900/5`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-sans">{card.label}</span>
                  <h2 className="text-2xl font-extrabold font-sans tracking-tight leading-8" style={{ fontSize: '24px', fontWeight: 800, lineHeight: '32px' }}>{card.value}</h2>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Icon size={18} className="text-white" />
                </div>
              </div>
              
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-2 text-[9px] font-bold font-sans">
                <span className={card.change.startsWith('+') ? 'text-emerald-400' : 'text-slate-400'}>{card.change}</span>
                <span className="text-slate-500 uppercase tracking-widest">{card.labelUnder}</span>
              </div>
            </div>
          );
          return card.link ? (
            <Link key={idx} href={card.link}>
              {CardContent}
            </Link>
          ) : (
            <div key={idx}>{CardContent}</div>
          );
        })}
      </div>

      {/* Main Grid: Line Chart on Left, Tasks/Calendar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview (Light card with glowing line graph) */}
        <div className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-[28px] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Performance Overview</h3>
              <p className="text-xs text-slate-500 mt-0.5">Asset deposits growth trends over the last quarter</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-600 focus:outline-none">
              <option>This Month</option>
              <option>Last 3 Months</option>
              <option>Yearly</option>
            </select>
          </div>

          <div className="py-6 flex-1">
            {/* Legend */}
            <div className="flex items-center gap-6 mb-4 text-[10px] font-bold font-sans">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1.5 bg-blue-600 rounded-sm"></span>
                <span className="text-slate-500">REVENUE (AUM)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-blue-600 font-bold">₹24.5M</span>
                <span className="text-rose-500 font-semibold">-12.4%</span>
              </div>
            </div>

            {/* Custom SVG Line Chart (Replicates smooth graphics line in image) */}
            <div className="w-full h-64 relative pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 220">
                <defs>
                  {/* Grid Shadow/Glow */}
                  <filter id="shadow" x="-5%" y="-5%" width="110%" height="120%">
                    <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#2563EB" floodOpacity="0.22"/>
                  </filter>
                  <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.12"/>
                  </filter>
                  {/* Gradient under the line */}
                  <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines */}
                <line x1="45" y1="170" x2="480" y2="170" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="45" y1="130" x2="480" y2="130" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="45" y1="90"  x2="480" y2="90"  stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="45" y1="50"  x2="480" y2="50"  stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="45" y1="20"  x2="480" y2="20"  stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />

                {/* Shading beneath graph */}
                <path d="M 45 137 C 100 130, 110 118, 154 116 C 198 114, 219 98, 263 95 C 307 92, 327 72, 371 68 C 415 64, 440 52, 480 49 L 480 180 L 45 180 Z" fill="url(#lineGlow)" />

                {/* Smooth curve line with filter shadow */}
                <path d="M 45 137 C 100 130, 110 118, 154 116 C 198 114, 219 98, 263 95 C 307 92, 327 72, 371 68 C 415 64, 440 52, 480 49" fill="none" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" filter="url(#shadow)" />

                {/* Highlight dots with rings */}
                <circle cx="45" cy="137" r="4.5" fill="#2563EB" stroke="white" strokeWidth="1.5" />
                <circle cx="154" cy="116" r="4.5" fill="#2563EB" stroke="white" strokeWidth="1.5" />
                <circle cx="263" cy="95" r="4.5" fill="#2563EB" stroke="white" strokeWidth="1.5" />
                
                {/* Active Glowing Dot (Green) */}
                <circle cx="371" cy="68" r="8" fill="#10B981" fillOpacity="0.2" className="animate-pulse" />
                <circle cx="371" cy="68" r="5" fill="#10B981" stroke="white" strokeWidth="2" />
                
                <circle cx="480" cy="49" r="4.5" fill="#2563EB" stroke="white" strokeWidth="1.5" />

                {/* Y-Axis text labels (placed at x="35" for zero overlap) */}
                <text x="35" y="174" textAnchor="end" className="text-[9px] font-sans fill-slate-400 font-bold">₹5.0M</text>
                <text x="35" y="134" textAnchor="end" className="text-[9px] font-sans fill-slate-400 font-bold">₹10.0M</text>
                <text x="35" y="94" textAnchor="end" className="text-[9px] font-sans fill-slate-400 font-bold">₹15.0M</text>
                <text x="35" y="54" textAnchor="end" className="text-[9px] font-sans fill-slate-400 font-bold">₹20.0M</text>
                <text x="35" y="24" textAnchor="end" className="text-[9px] font-sans fill-slate-400 font-bold">₹25.0M</text>

                {/* X-Axis month labels (placed under the grid area at y="200") */}
                <text x="45" y="200" textAnchor="middle" className="text-[10px] font-sans fill-slate-400 font-bold">Apr</text>
                <text x="154" y="200" textAnchor="middle" className="text-[10px] font-sans fill-slate-400 font-bold">May</text>
                <text x="263" y="200" textAnchor="middle" className="text-[10px] font-sans fill-slate-400 font-bold">Jun</text>
                <text x="371" y="200" textAnchor="middle" className="text-[10px] font-sans fill-slate-400 font-bold">Jul</text>
                <text x="480" y="200" textAnchor="middle" className="text-[10px] font-sans fill-slate-400 font-bold">Aug</text>

                {/* Tooltip Card above active point */}
                <g transform="translate(371, 32)">
                  <rect x="-38" y="-22" width="76" height="20" rx="6" fill="#1D173C" filter="url(#tooltipShadow)" />
                  <path d="M -5 -2 L 0 3 L 5 -2 Z" fill="#1D173C" />
                  <text x="0" y="-9" textAnchor="middle" className="text-[9px] font-sans fill-white font-bold">₹24.5M AUM</text>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Operations Calendar widget (Matches salon app style exactly) */}
        <div className="p-6 bg-white border border-slate-200 rounded-[28px] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
              <h3 className="text-base font-bold text-slate-900">Audits Calendar</h3>
              <button className="text-xs font-bold text-blue-600 hover:underline">View Calendar</button>
            </div>

            {/* Monthly Date Grid (Replicates June 21-27 header in image) */}
            <div className="flex items-center justify-between gap-1 mb-6 text-center">
              {[
                { day: 'SUN', date: 21 },
                { day: 'MON', date: 22 },
                { day: 'TUE', date: 23, active: true },
                { day: 'WED', date: 24 },
                { day: 'THU', date: 25 },
                { day: 'FRI', date: 26 },
                { day: 'SAT', date: 27 },
              ].map((d) => (
                <button 
                  key={d.date} 
                  onClick={() => setActiveDate(d.date)}
                  className="flex-1 flex flex-col items-center py-2 rounded-2xl group transition-all"
                >
                  <span className="text-[8px] font-bold text-slate-400 mb-1">{d.day}</span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${
                    d.active 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}>
                    {d.date}
                  </span>
                </button>
              ))}
            </div>

            {/* Checklists pending (Matches the appointment checklist container in image) */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-sans">Today's Audits Checklist</span>
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center h-44">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 text-blue-600">
                  <Calendar size={20} />
                </div>
                <p className="text-xs font-bold text-slate-800">Clear Operations Slate</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                  All KYC docs are checked. There are no overdue payouts scheduled for today.
                </p>
              </div>
            </div>
          </div>

          <Link 
            href="/dashboard/transactions" 
            className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-500 mt-6 pt-4 border-t border-slate-100 hover:gap-3 transition-all duration-200"
          >
            <span>Audit Verifications Queue</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Simple placeholder icon
function WalletIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
