'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, TrendingUp, Zap, Users, ArrowRight, Smartphone, LayoutGrid, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  React.useEffect(() => {
    document.title = 'Varahi Capital | Asset & Yield Infrastructure';
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden">
      {/* Background Gradients & Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Abstract Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/10">
            V
          </div>
          <span className="text-lg font-bold tracking-wider font-sans bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            VARAHI CAPITAL
          </span>
        </div>

        <Link 
          href="/login" 
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all duration-200"
        >
          <span>Staff Login</span>
          <ArrowRight size={14} />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Zap size={12} />
            <span>Next-Generation Yield Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Automating Retail Wealth Operations.
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
            Varahi is a complete operating platform for managing investments, verifying manual deposits, and scheduling payout distributions at scale.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link 
              href="/login" 
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:opacity-95 text-sm font-semibold shadow-lg shadow-blue-500/15 flex items-center gap-2 group transition-all duration-200"
            >
              <span>Access Portals Gateway</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <a 
              href="#features" 
              className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sm font-semibold text-slate-300 transition-all duration-200"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Sleek Vector Mockup (Looks like custom graphic design) */}
        <div className="lg:col-span-6 relative flex justify-center">
          <div className="w-full max-w-lg aspect-[4/3] rounded-3xl bg-slate-900/40 border border-slate-800 p-4 backdrop-blur-sm relative overflow-hidden shadow-2xl">
            {/* Soft inner glow */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-600/20 rounded-full blur-2xl"></div>

            {/* Title bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-[10px] text-slate-600 font-mono">varahi-operator-dashboard.svg</span>
              <div className="w-4 h-4"></div>
            </div>

            {/* Mock Dashboard Layout */}
            <div className="space-y-4">
              {/* Stat cards mock */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Total AUM</span>
                  <p className="text-xs font-bold text-white font-mono">₹2.45 Cr</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Payouts Due</span>
                  <p className="text-xs font-bold text-emerald-400 font-mono">₹3.20 L</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Pending</span>
                  <p className="text-xs font-bold text-amber-500 font-mono">3 Audits</p>
                </div>
              </div>

              {/* Graphic Chart mockup */}
              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl h-44 flex flex-col justify-between">
                <span className="text-[9px] text-slate-500 font-mono uppercase">Growth Performance (AUM)</span>
                
                {/* SVG wave drawing */}
                <div className="w-full h-24 flex items-end">
                  <svg className="w-full h-20 overflow-visible" viewBox="0 0 100 20">
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Fill */}
                    <path d="M 0 20 L 0 10 Q 15 4 30 12 T 60 6 T 90 2 L 100 0 L 100 20 Z" fill="url(#chartGlow)" />
                    {/* Stroke */}
                    <path d="M 0 10 Q 15 4 30 12 T 60 6 T 90 2 L 100 0" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Glowing dots */}
                    <circle cx="30" cy="12" r="1.5" fill="#10b981" />
                    <circle cx="60" cy="6" r="1.5" fill="#3b82f6" />
                    <circle cx="100" cy="0" r="1.5" fill="#6366f1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Mobile mockup preview */}
          <div className="absolute bottom-[-30px] right-[-10px] w-48 aspect-[9/19] rounded-[2rem] bg-slate-950 border-4 border-slate-850 p-2.5 shadow-2xl hidden sm:block pointer-events-none animate-bounce" style={{ animationDuration: '6s' }}>
            <div className="w-full h-full bg-slate-900 rounded-[1.5rem] p-3 overflow-hidden space-y-3 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-bold text-white font-sans">Varahi Mobile</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>

              {/* Wallet Card */}
              <div className="bg-gradient-to-tr from-blue-700 to-indigo-800 p-2.5 rounded-xl space-y-1">
                <span className="text-[7px] text-blue-200 uppercase font-mono">My Portfolio</span>
                <p className="text-xs font-bold text-white font-mono">₹1,50,000</p>
              </div>

              {/* Plans listings */}
              <div className="space-y-1.5 flex-1">
                <span className="text-[7px] text-slate-500 uppercase font-mono">Available Funds</span>
                <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-[8px] font-bold text-white">Alpha Shield</span>
                  <span className="text-[8px] font-semibold text-emerald-400 font-mono">14.5%</span>
                </div>
                <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-[8px] font-bold text-white">Short-Term</span>
                  <span className="text-[8px] font-semibold text-emerald-400 font-mono">12.0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">Structured Operations Suite</h2>
          <p className="text-sm text-slate-400">All features of the platform mapped directly onto operational safety protocols.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-850 hover:bg-slate-900/50 transition-all duration-200 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Smartphone size={20} />
            </div>
            <h3 className="text-base font-bold">Investor Mobile App</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides retail customers plans, calculator, deep-linked UPI flow, deposit screenshot upload, and live yields schedules.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-850 hover:bg-slate-900/50 transition-all duration-200 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <LayoutGrid size={20} />
            </div>
            <h3 className="text-base font-bold">Operator Dashboards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Consolidated workspace managing customers, plans, pending KYC queues, and settling payout transactions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-850 hover:bg-slate-900/50 transition-all duration-200 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Shield size={20} />
            </div>
            <h3 className="text-base font-bold">Dual Compliance Scopes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict access levels separating supervisors from owners. Imposes deposit limits requiring owner approval above ₹1,00,000.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-850 hover:bg-slate-900/50 transition-all duration-200 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-base font-bold">Calculated Yield Beats</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic background scheduling of pending payouts on investment activation, offering transparent ledger logs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-10 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>&copy; 2026 Varahi Capital. Designed for secure internal wealth operations and investor administration.</p>
      </footer>
    </div>
  );
}
